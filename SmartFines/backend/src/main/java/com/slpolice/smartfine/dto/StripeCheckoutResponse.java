package com.slpolice.smartfine.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StripeCheckoutResponse {
  private Long paymentId;
  private String sessionId;
  private String checkoutUrl;
}
