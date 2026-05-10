package com.slpolice.smartfine.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OfficerResponse {
  private Long userId;
  private Long officerProfileUserId;
  private String fullName;
  private String email;
  private String phone;
  private String nic;
  private String officerCode;
  private String badgeNumber;
  private String stationName;
  private Long regionId;
  private String regionName;
}
