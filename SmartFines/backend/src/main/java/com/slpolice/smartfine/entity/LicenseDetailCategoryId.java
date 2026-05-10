package com.slpolice.smartfine.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode
public class LicenseDetailCategoryId implements Serializable {
  @Column(name = "license_detail_user_id")
  private Long licenseDetailUserId;

  @Column(name = "vehicle_category_id")
  private Long vehicleCategoryId;
}
