package com.slpolice.smartfine.repository;

import com.slpolice.smartfine.entity.LicenseRecollection;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LicenseRecollectionRepository extends JpaRepository<LicenseRecollection, Long> {
  Optional<LicenseRecollection> findByFineId(Long fineId);
}
