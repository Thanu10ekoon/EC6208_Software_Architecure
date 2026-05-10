package com.slpolice.smartfine.controller;

import com.slpolice.smartfine.dto.PaymentCreateRequest;
import com.slpolice.smartfine.dto.PaymentResponse;
import com.slpolice.smartfine.dto.ReceiptUploadResponse;
import com.slpolice.smartfine.security.AuthUserDetails;
import com.slpolice.smartfine.service.PaymentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
  private final PaymentService paymentService;

  public PaymentController(PaymentService paymentService) {
    this.paymentService = paymentService;
  }

  @PostMapping
  @PreAuthorize("hasRole('DRIVER')")
  public PaymentResponse createPayment(@AuthenticationPrincipal AuthUserDetails user,
      @Valid @RequestBody PaymentCreateRequest request) {
    return paymentService.createPayment(user.getUserId(), request);
  }

  @PostMapping("/{paymentId}/receipt")
  @PreAuthorize("hasRole('DRIVER')")
  public ReceiptUploadResponse uploadReceipt(@AuthenticationPrincipal AuthUserDetails user,
      @PathVariable Long paymentId,
      @RequestParam("file") MultipartFile file) {
    return paymentService.uploadReceipt(paymentId, user.getUserId(), file);
  }

  @GetMapping
  @PreAuthorize("hasRole('DRIVER')")
  public List<PaymentResponse> listPayments(@AuthenticationPrincipal AuthUserDetails user) {
    return paymentService.listPayments(user.getUserId());
  }
}
