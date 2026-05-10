package com.slpolice.smartfine.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class OfficerCreateRequest {
  @NotBlank
  @Size(max = 150)
  private String fullName;

  @NotBlank
  @Email
  @Size(max = 255)
  private String email;

  @NotBlank
  @Size(max = 30)
  private String phone;

  @Size(max = 30)
  private String nic;

  @NotBlank
  @Size(min = 8, max = 100)
  private String password;

  @NotBlank
  @Size(max = 50)
  private String officerCode;

  @NotBlank
  @Size(max = 50)
  private String badgeNumber;

  @Size(max = 150)
  private String stationName;

  @NotNull
  private Long regionId;
}
