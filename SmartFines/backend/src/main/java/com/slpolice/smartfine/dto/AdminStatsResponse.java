package com.slpolice.smartfine.dto;

import java.math.BigDecimal;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminStatsResponse {
  private long totalFines;
  private long paidFines;
  private long pendingFines;
  private BigDecimal totalCollectedAmount;
  private BigDecimal totalOutstandingAmount;
  private List<RegionStats> regionStats;

  @Getter
  @Builder
  public static class RegionStats {
    private Long regionId;
    private String regionName;
    private long totalFines;
    private long paidFines;
    private long pendingFines;
    private BigDecimal totalCollectedAmount;
    private BigDecimal totalOutstandingAmount;
  }
}
