package com.slpolice.smartfine.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class FineCreateRequest {
  @NotBlank
  @Size(max = 30)
  private String driverNic;

  @NotNull
  private Long regionId;

  @NotBlank
  @Size(max = 30)
  private String vehicleNumber;

  @NotNull
  private LocalDate violationDate;

  @NotBlank
  private String violationDetails;

  @NotBlank
  @Size(max = 255)
  private String violationPlace;

  @NotNull
  @DecimalMin("0.0")
  private BigDecimal fineAmount;

  @NotBlank
  @Size(max = 255)
  private String licenseCollectionLocation;

  private Instant dueAt;
}
