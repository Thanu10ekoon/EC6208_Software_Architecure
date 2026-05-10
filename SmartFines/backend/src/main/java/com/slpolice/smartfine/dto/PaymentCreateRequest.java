package com.slpolice.smartfine.dto;

import com.slpolice.smartfine.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PaymentCreateRequest {
  @NotNull
  private Long fineId;

  @NotNull
  private PaymentMethod paymentMethod;

  private String transactionReference;
}
