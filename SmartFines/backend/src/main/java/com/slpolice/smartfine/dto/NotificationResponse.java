package com.slpolice.smartfine.dto;

import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationResponse {
  private Long id;
  private String type;
  private String title;
  private String message;
  private boolean isRead;
  private Instant createdAt;
}
