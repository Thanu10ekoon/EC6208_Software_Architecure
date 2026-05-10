package com.slpolice.smartfine.service;

import com.slpolice.smartfine.dto.FineCreateRequest;
import com.slpolice.smartfine.dto.FineResponse;
import com.slpolice.smartfine.entity.DriverStarHistory;
import com.slpolice.smartfine.entity.FineStatus;
import com.slpolice.smartfine.entity.FineStatusHistory;
import com.slpolice.smartfine.entity.LicenseDetails;
import com.slpolice.smartfine.entity.LicenseStatus;
import com.slpolice.smartfine.entity.TrafficFine;
import com.slpolice.smartfine.entity.User;
import com.slpolice.smartfine.exception.ApiException;
import com.slpolice.smartfine.repository.DriverStarHistoryRepository;
import com.slpolice.smartfine.repository.FineStatusHistoryRepository;
import com.slpolice.smartfine.repository.LicenseDetailsRepository;
import com.slpolice.smartfine.repository.RegionRepository;
import com.slpolice.smartfine.repository.TrafficFineRepository;
import com.slpolice.smartfine.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FineService {
  private final TrafficFineRepository fineRepository;
  private final UserRepository userRepository;
  private final LicenseDetailsRepository licenseDetailsRepository;
  private final RegionRepository regionRepository;
  private final FineStatusHistoryRepository fineStatusHistoryRepository;
  private final DriverStarHistoryRepository driverStarHistoryRepository;

  public FineService(TrafficFineRepository fineRepository,
      UserRepository userRepository,
      LicenseDetailsRepository licenseDetailsRepository,
      RegionRepository regionRepository,
      FineStatusHistoryRepository fineStatusHistoryRepository,
      DriverStarHistoryRepository driverStarHistoryRepository) {
    this.fineRepository = fineRepository;
    this.userRepository = userRepository;
    this.licenseDetailsRepository = licenseDetailsRepository;
    this.regionRepository = regionRepository;
    this.fineStatusHistoryRepository = fineStatusHistoryRepository;
    this.driverStarHistoryRepository = driverStarHistoryRepository;
  }

  @Transactional
  public FineResponse createFine(Long officerUserId, FineCreateRequest request) {
    User officer = userRepository.findById(officerUserId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Officer not found"));

    User driver = userRepository.findByNic(request.getDriverNic())
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Driver not found"));

    LicenseDetails licenseDetails = licenseDetailsRepository.findById(driver.getId())
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "License details not found"));

    TrafficFine fine = new TrafficFine();
    fine.setFineReferenceNumber(generateFineReference());
    fine.setDriver(driver);
    fine.setOfficer(officer);
    fine.setRegion(regionRepository.findById(request.getRegionId())
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Region not found")));
    fine.setVehicleNumber(request.getVehicleNumber());
    fine.setDriverLicenseNumberSnapshot(licenseDetails.getLicenseNumber());
    fine.setViolationDate(request.getViolationDate());
    fine.setViolationDetails(request.getViolationDetails());
    fine.setViolationPlace(request.getViolationPlace());
    fine.setFineAmount(request.getFineAmount());
    fine.setLicenseCollectionLocation(request.getLicenseCollectionLocation());
    fine.setDueAt(request.getDueAt());

    TrafficFine saved = fineRepository.save(fine);

    FineStatusHistory history = new FineStatusHistory();
    history.setFine(saved);
    history.setPreviousStatus(null);
    history.setNewStatus(FineStatus.ISSUED);
    history.setChangedByUser(officer);
    history.setComment("Fine issued");
    fineStatusHistoryRepository.save(history);

    int before = licenseDetails.getStars();
    int after = Math.max(0, before - 1);
    licenseDetails.setStars(after);
    if (after == 0) {
      licenseDetails.setLicenseStatus(LicenseStatus.CANCELLED);
      licenseDetails.setLicenseCancelledAt(Instant.now());
    }
    licenseDetailsRepository.save(licenseDetails);

    DriverStarHistory starHistory = new DriverStarHistory();
    starHistory.setDriver(driver);
    starHistory.setFine(saved);
    starHistory.setStarsBefore(before);
    starHistory.setStarsAfter(after);
    starHistory.setChangeReason("fine issued");
    starHistory.setChangedByUser(officer);
    driverStarHistoryRepository.save(starHistory);

    return toResponse(saved);
  }

  @Transactional(readOnly = true)
  public List<FineResponse> listDriverFines(Long driverUserId) {
    return fineRepository.findByDriverId(driverUserId).stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<FineResponse> listOfficerFines(Long officerUserId) {
    return fineRepository.findByOfficerId(officerUserId).stream()
        .map(this::toResponse)
        .toList();
  }

  private String generateFineReference() {
    return "FN-" + Instant.now().toEpochMilli() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
  }

  private FineResponse toResponse(TrafficFine fine) {
    return FineResponse.builder()
        .id(fine.getId())
        .fineReferenceNumber(fine.getFineReferenceNumber())
        .driverUserId(fine.getDriver().getId())
        .officerUserId(fine.getOfficer().getId())
        .regionId(fine.getRegion().getId())
        .vehicleNumber(fine.getVehicleNumber())
        .driverLicenseNumberSnapshot(fine.getDriverLicenseNumberSnapshot())
        .violationDate(fine.getViolationDate())
        .violationDetails(fine.getViolationDetails())
        .violationPlace(fine.getViolationPlace())
        .fineAmount(fine.getFineAmount())
        .licenseCollectionLocation(fine.getLicenseCollectionLocation())
        .status(fine.getStatus())
        .issuedAt(fine.getIssuedAt())
        .paidAt(fine.getPaidAt())
        .dueAt(fine.getDueAt())
        .build();
  }
}
