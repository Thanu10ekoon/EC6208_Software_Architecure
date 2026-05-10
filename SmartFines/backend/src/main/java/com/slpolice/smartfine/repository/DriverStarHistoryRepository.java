package com.slpolice.smartfine.repository;

import com.slpolice.smartfine.entity.DriverStarHistory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DriverStarHistoryRepository extends JpaRepository<DriverStarHistory, Long> {
  List<DriverStarHistory> findByDriverIdOrderByChangedAtDesc(Long driverId);
}
