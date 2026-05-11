package com.slpolice.smartfine.controller;

import com.slpolice.smartfine.dto.AdminStatsResponse;
import com.slpolice.smartfine.dto.OfficerCreateRequest;
import com.slpolice.smartfine.dto.OfficerResponse;
import com.slpolice.smartfine.dto.PaymentResponse;
import com.slpolice.smartfine.security.AuthUserDetails;
import com.slpolice.smartfine.service.AdminService;
import com.slpolice.smartfine.service.PaymentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
  private final AdminService adminService;
  private final PaymentService paymentService;

  public AdminController(AdminService adminService, PaymentService paymentService) {
    this.adminService = adminService;
    this.paymentService = paymentService;
  }

  @PostMapping("/officers")
  @PreAuthorize("hasRole('ADMIN')")
  public OfficerResponse createOfficer(@AuthenticationPrincipal AuthUserDetails user,
      @Valid @RequestBody OfficerCreateRequest request) {
    return adminService.createOfficer(user.getUserId(), request);
  }

  @GetMapping("/officers")
  @PreAuthorize("hasRole('ADMIN')")
  public List<OfficerResponse> listOfficers() {
    return adminService.listOfficers();
  }

  @GetMapping("/stats")
  @PreAuthorize("hasRole('ADMIN')")
  public AdminStatsResponse getStats() {
    return adminService.getStats();
  }

  @GetMapping("/payments")
  @PreAuthorize("hasRole('ADMIN')")
  public List<PaymentResponse> listPayments() {
    return paymentService.listAllPayments();
  }

  @PatchMapping("/payments/{paymentId}/accept")
  @PreAuthorize("hasRole('ADMIN')")
  public PaymentResponse acceptPayment(@AuthenticationPrincipal AuthUserDetails user,
      @PathVariable Long paymentId) {
    return paymentService.acceptReceiptPayment(paymentId, user.getUserId());
  }
}
