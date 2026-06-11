package com.slpolice.smartfine.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "license_detail_categories")
public class LicenseDetailCategory {
  @EmbeddedId
  private LicenseDetailCategoryId id = new LicenseDetailCategoryId();

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId("licenseDetailUserId")
  @JoinColumn(name = "license_detail_user_id", nullable = false)
  private LicenseDetails licenseDetails;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId("vehicleCategoryId")
  @JoinColumn(name = "vehicle_category_id", nullable = false)
  private VehicleCategory vehicleCategory;

  @CreationTimestamp
  @Column(name = "granted_at", nullable = false, updatable = false)
  private Instant grantedAt;

  @Column(name = "expires_at")
  private Instant expiresAt;

  public LicenseDetailCategoryId getId() {
    return id;
  }

  public void setId(LicenseDetailCategoryId id) {
    this.id = id;
  }

  public LicenseDetails getLicenseDetails() {
    return licenseDetails;
  }

  public void setLicenseDetails(LicenseDetails licenseDetails) {
    this.licenseDetails = licenseDetails;
  }

  public VehicleCategory getVehicleCategory() {
    return vehicleCategory;
  }

  public void setVehicleCategory(VehicleCategory vehicleCategory) {
    this.vehicleCategory = vehicleCategory;
  }

  public Instant getGrantedAt() {
    return grantedAt;
  }

  public void setGrantedAt(Instant grantedAt) {
    this.grantedAt = grantedAt;
  }

  public Instant getExpiresAt() {
    return expiresAt;
  }

  public void setExpiresAt(Instant expiresAt) {
    this.expiresAt = expiresAt;
  }
}
