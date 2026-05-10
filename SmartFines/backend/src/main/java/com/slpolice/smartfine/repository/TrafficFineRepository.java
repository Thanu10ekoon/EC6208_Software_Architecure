package com.slpolice.smartfine.repository;

import com.slpolice.smartfine.entity.TrafficFine;
import com.slpolice.smartfine.entity.FineStatus;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TrafficFineRepository extends JpaRepository<TrafficFine, Long> {
  List<TrafficFine> findByDriverId(Long driverId);
  List<TrafficFine> findByOfficerId(Long officerId);

  long countByStatus(FineStatus status);

  @Query("select coalesce(sum(f.fineAmount), 0) from TrafficFine f where f.status = :status")
  BigDecimal sumAmountByStatus(@Param("status") FineStatus status);

  @Query("select coalesce(sum(f.fineAmount), 0) from TrafficFine f where f.status <> :status")
  BigDecimal sumAmountByStatusNot(@Param("status") FineStatus status);

  @Query("select r.id as regionId, r.name as regionName, "
      + "count(f) as totalFines, "
      + "sum(case when f.status = com.slpolice.smartfine.entity.FineStatus.PAID then 1 else 0 end) as paidFines, "
      + "sum(case when f.status <> com.slpolice.smartfine.entity.FineStatus.PAID then 1 else 0 end) as pendingFines, "
      + "coalesce(sum(case when f.status = com.slpolice.smartfine.entity.FineStatus.PAID then f.fineAmount else 0 end), 0) as totalCollectedAmount, "
      + "coalesce(sum(case when f.status <> com.slpolice.smartfine.entity.FineStatus.PAID then f.fineAmount else 0 end), 0) as totalOutstandingAmount "
      + "from TrafficFine f join f.region r group by r.id, r.name")
  List<RegionFineStatsView> findRegionFineStats();

  interface RegionFineStatsView {
    Long getRegionId();
    String getRegionName();
    Long getTotalFines();
    Long getPaidFines();
    Long getPendingFines();
    BigDecimal getTotalCollectedAmount();
    BigDecimal getTotalOutstandingAmount();
  }
}
