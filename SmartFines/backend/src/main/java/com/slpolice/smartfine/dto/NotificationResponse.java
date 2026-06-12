package com.slpolice.smartfine.dto;

import com.slpolice.smartfine.entity.RecollectionStatus;
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
  private Long relatedFineId;
  private RecollectionStatus recollectionStatus;
  private boolean isRead;
  private Instant readAt;
  private Instant createdAt;
}
