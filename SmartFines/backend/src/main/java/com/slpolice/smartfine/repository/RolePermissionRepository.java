package com.slpolice.smartfine.repository;

import com.slpolice.smartfine.entity.RolePermission;
import com.slpolice.smartfine.entity.RolePermissionId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolePermissionRepository extends JpaRepository<RolePermission, RolePermissionId> {}
