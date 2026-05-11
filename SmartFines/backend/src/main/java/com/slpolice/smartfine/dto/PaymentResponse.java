package com.slpolice.smartfine.dto;

import com.slpolice.smartfine.entity.FineStatus;
import com.slpolice.smartfine.entity.PaymentMethod;
import com.slpolice.smartfine.entity.PaymentStatus;
import com.slpolice.smartfine.entity.ReceiptSource;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentResponse {
  private Long id;
  private Long fineId;
  private FineStatus fineStatus;
  private Long driverUserId;
  private BigDecimal amount;
  private PaymentMethod paymentMethod;
  private PaymentStatus paymentStatus;
  private String transactionReference;
  private Long receiptId;
  private String receiptNumber;
  private ReceiptSource receiptSource;
  private String receiptFileName;
  private String receiptMimeType;
  private Long receiptFileSizeBytes;
  private String receiptFileUrl;
  private Instant receiptUploadedAt;
  private Long receiptVerifiedByUserId;
  private Instant receiptVerifiedAt;
  private Instant paidAt;
  private Instant createdAt;
}
