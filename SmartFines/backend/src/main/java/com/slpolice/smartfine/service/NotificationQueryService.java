package com.slpolice.smartfine.service;

import com.slpolice.smartfine.dto.NotificationResponse;
import com.slpolice.smartfine.entity.Notification;
import com.slpolice.smartfine.repository.NotificationRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class NotificationQueryService {
  private final NotificationRepository notificationRepository;

  public NotificationQueryService(NotificationRepository notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  public List<NotificationResponse> listNotifications(Long userId) {
    return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId).stream()
        .map(this::toResponse)
        .toList();
  }

  private NotificationResponse toResponse(Notification notification) {
    return NotificationResponse.builder()
        .id(notification.getId())
        .type(notification.getType())
        .title(notification.getTitle())
        .message(notification.getMessage())
        .isRead(notification.isRead())
        .createdAt(notification.getCreatedAt())
        .build();
  }
}
