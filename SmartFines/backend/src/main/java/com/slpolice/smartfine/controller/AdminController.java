package com.slpolice.smartfine.controller;

import com.slpolice.smartfine.dto.AdminStatsResponse;
import com.slpolice.smartfine.dto.OfficerCreateRequest;
import com.slpolice.smartfine.dto.OfficerResponse;
import com.slpolice.smartfine.security.AuthUserDetails;
import com.slpolice.smartfine.service.AdminService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
  private final AdminService adminService;

  public AdminController(AdminService adminService) {
    this.adminService = adminService;
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
}
