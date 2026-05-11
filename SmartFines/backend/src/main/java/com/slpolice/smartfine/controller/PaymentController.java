package com.slpolice.smartfine.controller;

import com.slpolice.smartfine.dto.PaymentCreateRequest;
import com.slpolice.smartfine.dto.PaymentResponse;
import com.slpolice.smartfine.dto.ReceiptUploadResponse;
import com.slpolice.smartfine.security.AuthUserDetails;
import com.slpolice.smartfine.service.PaymentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.InvalidMediaTypeException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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

  @GetMapping("/{paymentId}/receipt/file")
  @PreAuthorize("hasRole('DRIVER') or hasRole('ADMIN')")
  public ResponseEntity<Resource> viewReceipt(@AuthenticationPrincipal AuthUserDetails user,
      @PathVariable Long paymentId) {
    boolean admin = user.getRoles().contains("admin");
    PaymentService.ReceiptFile receiptFile = paymentService.getReceiptFile(paymentId, user.getUserId(), admin);
    MediaType mediaType = resolveMediaType(receiptFile.mimeType());

    return ResponseEntity.ok()
        .contentType(mediaType)
        .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline()
            .filename(receiptFile.fileName())
            .build()
            .toString())
        .body(receiptFile.resource());
  }

  private MediaType resolveMediaType(String mimeType) {
    if (mimeType == null || mimeType.isBlank()) {
      return MediaType.APPLICATION_OCTET_STREAM;
    }
    try {
      return MediaType.parseMediaType(mimeType);
    } catch (InvalidMediaTypeException ex) {
      return MediaType.APPLICATION_OCTET_STREAM;
    }
  }
}
