package com.slpolice.smartfine.dto;

import com.slpolice.smartfine.entity.FineStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FineResponse {
  private Long id;
  private String fineReferenceNumber;
  private Long driverUserId;
  private Long officerUserId;
  private Long regionId;
  private String vehicleNumber;
  private String driverLicenseNumberSnapshot;
  private LocalDate violationDate;
  private String violationDetails;
  private String violationPlace;
  private BigDecimal fineAmount;
  private String licenseCollectionLocation;
  private FineStatus status;
  private Instant issuedAt;
  private Instant paidAt;
  private Instant dueAt;
}
