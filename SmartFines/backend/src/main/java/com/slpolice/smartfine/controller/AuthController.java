package com.slpolice.smartfine.controller;

import com.slpolice.smartfine.dto.AuthLoginRequest;
import com.slpolice.smartfine.dto.AuthLoginResponse;
import com.slpolice.smartfine.dto.DriverSignupRequest;
import com.slpolice.smartfine.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/login")
  public AuthLoginResponse login(@Valid @RequestBody AuthLoginRequest request) {
    return authService.login(request);
  }

  @PostMapping("/driver-signup")
  public AuthLoginResponse driverSignup(@Valid @RequestBody DriverSignupRequest request) {
    return authService.driverSignup(request);
  }
}
