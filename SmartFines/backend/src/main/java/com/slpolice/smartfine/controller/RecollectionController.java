package com.slpolice.smartfine.controller;

import com.slpolice.smartfine.dto.RecollectionConfirmRequest;
import com.slpolice.smartfine.dto.RecollectionMarkRequest;
import com.slpolice.smartfine.security.AuthUserDetails;
import com.slpolice.smartfine.service.LicenseRecollectionService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recollections")
public class RecollectionController {
  private final LicenseRecollectionService recollectionService;

  public RecollectionController(LicenseRecollectionService recollectionService) {
    this.recollectionService = recollectionService;
  }

  @PostMapping("/driver/{fineId}/mark")
  @PreAuthorize("hasRole('DRIVER')")
  public void markRecollected(@AuthenticationPrincipal AuthUserDetails user,
      @PathVariable Long fineId,
      @Valid @RequestBody RecollectionMarkRequest request) {
    recollectionService.markRecollected(fineId, user.getUserId(), request);
  }

  @PostMapping("/{fineId}/confirm")
  @PreAuthorize("hasAnyRole('TRAFFIC_OFFICER','ADMIN')")
  public void confirmRecollected(@AuthenticationPrincipal AuthUserDetails user,
      @PathVariable Long fineId,
      @Valid @RequestBody RecollectionConfirmRequest request) {
    recollectionService.confirmRecollected(fineId, user.getUserId(), request);
  }
}
