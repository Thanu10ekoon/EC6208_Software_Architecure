package com.slpolice.smartfine.dto;

import com.slpolice.smartfine.entity.ReceiptSource;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReceiptUploadResponse {
  private Long receiptId;
  private Long paymentId;
  private String receiptNumber;
  private String fileUrl;
  private ReceiptSource source;
  private Instant createdAt;
}
