package com.slpolice.smartfine.repository;

import com.slpolice.smartfine.entity.OfficerProfile;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OfficerProfileRepository extends JpaRepository<OfficerProfile, Long> {
  Optional<OfficerProfile> findByBadgeNumber(String badgeNumber);
  boolean existsByBadgeNumber(String badgeNumber);
  boolean existsByOfficerCode(String officerCode);
}
