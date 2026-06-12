package com.slpolice.smartfine.service;

import com.slpolice.smartfine.dto.NotificationResponse;
import com.slpolice.smartfine.entity.LicenseRecollection;
import com.slpolice.smartfine.entity.Notification;
import com.slpolice.smartfine.entity.RecollectionStatus;
import com.slpolice.smartfine.repository.LicenseRecollectionRepository;
import com.slpolice.smartfine.repository.NotificationRepository;
import java.time.Instant;
import java.util.Map;
import java.util.List;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationQueryService {
  private final NotificationRepository notificationRepository;
  private final LicenseRecollectionRepository recollectionRepository;

  public NotificationQueryService(NotificationRepository notificationRepository,
      LicenseRecollectionRepository recollectionRepository) {
    this.notificationRepository = notificationRepository;
    this.recollectionRepository = recollectionRepository;
  }

  @Transactional(readOnly = true)
  public List<NotificationResponse> listNotifications(Long userId) {
    List<Notification> notifications =
        notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);

    List<Long> relatedFineIds = notifications.stream()
        .map(Notification::getRelatedFine)
        .filter(Objects::nonNull)
        .map(fine -> fine.getId())
        .distinct()
        .toList();

    Map<Long, LicenseRecollection> recollectionsByFineId = relatedFineIds.isEmpty()
        ? Map.of()
        : recollectionRepository.findByFineIdIn(relatedFineIds).stream()
            .collect(Collectors.toMap(
                recollection -> recollection.getFine().getId(),
                Function.identity()));

    return notifications.stream()
        .map(notification -> toResponse(notification, recollectionsByFineId))
        .toList();
  }

  @Transactional
  public void markAllRead(Long userId) {
    List<Notification> unread =
        notificationRepository.findByRecipientIdAndIsReadFalse(userId);

    if (unread.isEmpty()) {
      return;
    }

    Instant readAt = Instant.now();
    unread.forEach(notification -> {
      notification.setRead(true);
      notification.setReadAt(readAt);
    });
    notificationRepository.saveAll(unread);
  }

  private NotificationResponse toResponse(Notification notification,
      Map<Long, LicenseRecollection> recollectionsByFineId) {
    Long relatedFineId =
        notification.getRelatedFine() == null ? null : notification.getRelatedFine().getId();
    LicenseRecollection recollection =
        relatedFineId == null ? null : recollectionsByFineId.get(relatedFineId);
    RecollectionStatus recollectionStatus =
        recollection == null ? null : recollection.getStatus();

    return NotificationResponse.builder()
        .id(notification.getId())
        .type(notification.getType())
        .title(notification.getTitle())
        .message(notification.getMessage())
        .relatedFineId(relatedFineId)
        .recollectionStatus(recollectionStatus)
        .isRead(notification.isRead())
        .readAt(notification.getReadAt())
        .createdAt(notification.getCreatedAt())
        .build();
  }
}
