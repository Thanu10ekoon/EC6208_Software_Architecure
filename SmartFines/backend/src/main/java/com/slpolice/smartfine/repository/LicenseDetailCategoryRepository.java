package com.slpolice.smartfine.repository;

import com.slpolice.smartfine.entity.LicenseDetailCategory;
import com.slpolice.smartfine.entity.LicenseDetailCategoryId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LicenseDetailCategoryRepository extends JpaRepository<LicenseDetailCategory, LicenseDetailCategoryId> {}
