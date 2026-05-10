package com.slpolice.smartfine.repository;

import com.slpolice.smartfine.entity.FineStatusHistory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FineStatusHistoryRepository extends JpaRepository<FineStatusHistory, Long> {
  List<FineStatusHistory> findByFineIdOrderByChangedAtDesc(Long fineId);
}
