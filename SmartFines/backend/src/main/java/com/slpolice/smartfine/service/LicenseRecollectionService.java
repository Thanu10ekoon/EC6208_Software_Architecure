package com.slpolice.smartfine.service;

import com.slpolice.smartfine.dto.RecollectionConfirmRequest;
import com.slpolice.smartfine.dto.RecollectionMarkRequest;
import com.slpolice.smartfine.entity.FineStatus;
import com.slpolice.smartfine.entity.LicenseRecollection;
import com.slpolice.smartfine.entity.RecollectionStatus;
import com.slpolice.smartfine.entity.TrafficFine;
import com.slpolice.smartfine.entity.User;
import com.slpolice.smartfine.exception.ApiException;
import com.slpolice.smartfine.repository.LicenseRecollectionRepository;
import com.slpolice.smartfine.repository.TrafficFineRepository;
import com.slpolice.smartfine.repository.UserRepository;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LicenseRecollectionService {
  private final LicenseRecollectionRepository recollectionRepository;
  private final TrafficFineRepository fineRepository;
  private final UserRepository userRepository;
  private final NotificationService notificationService;

  public LicenseRecollectionService(LicenseRecollectionRepository recollectionRepository,
      TrafficFineRepository fineRepository,
      UserRepository userRepository,
      NotificationService notificationService) {
    this.recollectionRepository = recollectionRepository;
    this.fineRepository = fineRepository;
    this.userRepository = userRepository;
    this.notificationService = notificationService;
  }

  @Transactional
  public void markRecollected(Long fineId, Long driverUserId, RecollectionMarkRequest request) {
    TrafficFine fine = fineRepository.findById(fineId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Fine not found"));

    if (!fine.getDriver().getId().equals(driverUserId)) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Not allowed to mark recollection");
    }

    if (fine.getStatus() != FineStatus.PAID) {
      throw new ApiException(HttpStatus.CONFLICT, "Fine must be paid before recollection");
    }

    LicenseRecollection recollection = recollectionRepository.findByFineId(fineId)
        .orElseGet(() -> {
          LicenseRecollection created = new LicenseRecollection();
          created.setFine(fine);
          created.setDriver(fine.getDriver());
          return created;
        });

    recollection.setStatus(RecollectionStatus.MARKED_BY_DRIVER);
    recollection.setMarkedRecollectedAt(Instant.now());
    recollection.setNotes(request.getNotes());
    recollectionRepository.save(recollection);

    notificationService.notifyLicenseRecollected(fine.getOfficer(), fine.getDriver(), fine);
  }

  @Transactional
  public void confirmRecollected(Long fineId, Long confirmerUserId, RecollectionConfirmRequest request) {
    LicenseRecollection recollection = recollectionRepository.findByFineId(fineId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Recollection not found"));

    User confirmer = userRepository.findById(confirmerUserId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

    recollection.setStatus(RecollectionStatus.CONFIRMED);
    recollection.setConfirmedByUser(confirmer);
    recollection.setConfirmedAt(Instant.now());
    recollection.setNotes(request.getNotes());
    recollectionRepository.save(recollection);
  }
}
