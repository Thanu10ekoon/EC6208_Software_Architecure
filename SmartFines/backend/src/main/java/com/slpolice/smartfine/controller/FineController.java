package com.slpolice.smartfine.controller;

import com.slpolice.smartfine.dto.FineCreateRequest;
import com.slpolice.smartfine.dto.FineResponse;
import com.slpolice.smartfine.security.AuthUserDetails;
import com.slpolice.smartfine.service.FineService;
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
@RequestMapping("/api/fines")
public class FineController {
  private final FineService fineService;

  public FineController(FineService fineService) {
    this.fineService = fineService;
  }

  @PostMapping
  @PreAuthorize("hasRole('TRAFFIC_OFFICER')")
  public FineResponse createFine(@AuthenticationPrincipal AuthUserDetails user,
      @Valid @RequestBody FineCreateRequest request) {
    return fineService.createFine(user.getUserId(), request);
  }

  @GetMapping("/driver")
  @PreAuthorize("hasRole('DRIVER')")
  public List<FineResponse> listDriverFines(@AuthenticationPrincipal AuthUserDetails user) {
    return fineService.listDriverFines(user.getUserId());
  }

  @GetMapping("/officer")
  @PreAuthorize("hasRole('TRAFFIC_OFFICER')")
  public List<FineResponse> listOfficerFines(@AuthenticationPrincipal AuthUserDetails user) {
    return fineService.listOfficerFines(user.getUserId());
  }
}
