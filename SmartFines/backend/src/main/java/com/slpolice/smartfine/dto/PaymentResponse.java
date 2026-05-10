package com.slpolice.smartfine.dto;

import com.slpolice.smartfine.entity.PaymentMethod;
import com.slpolice.smartfine.entity.PaymentStatus;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentResponse {
  private Long id;
  private Long fineId;
  private Long driverUserId;
  private BigDecimal amount;
  private PaymentMethod paymentMethod;
  private PaymentStatus paymentStatus;
  private String transactionReference;
  private Instant paidAt;
  private Instant createdAt;
}
