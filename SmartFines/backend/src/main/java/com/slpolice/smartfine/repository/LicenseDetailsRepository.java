package com.slpolice.smartfine.repository;

import com.slpolice.smartfine.entity.LicenseDetails;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LicenseDetailsRepository extends JpaRepository<LicenseDetails, Long> {
  boolean existsByLicenseNumber(String licenseNumber);
}
