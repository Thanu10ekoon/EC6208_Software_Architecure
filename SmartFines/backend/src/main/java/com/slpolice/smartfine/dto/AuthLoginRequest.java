package com.slpolice.smartfine.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AuthLoginRequest {
  @NotNull
  private LoginType loginType;

  @NotBlank
  private String identifier;

  @NotBlank
  private String password;
}
