package com.slpolice.smartfine.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "traffic_fines")
public class TrafficFine {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "fine_reference_number", nullable = false, unique = true, length = 80)
  private String fineReferenceNumber;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "driver_user_id", nullable = false)
  private User driver;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "officer_user_id", nullable = false)
  private User officer;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "region_id", nullable = false)
  private Region region;

  @Column(name = "vehicle_number", nullable = false, length = 30)
  private String vehicleNumber;

  @Column(name = "driver_license_number_snapshot", nullable = false, length = 50)
  private String driverLicenseNumberSnapshot;

  @Column(name = "violation_date", nullable = false)
  private LocalDate violationDate;

  @Column(name = "violation_details", nullable = false, columnDefinition = "text")
  private String violationDetails;

  @Column(name = "violation_place", nullable = false, length = 255)
  private String violationPlace;

  @Column(name = "fine_amount", nullable = false, precision = 10, scale = 2)
  private BigDecimal fineAmount;

  @Column(name = "license_collection_location", nullable = false, length = 255)
  private String licenseCollectionLocation;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private FineStatus status = FineStatus.ISSUED;

  @CreationTimestamp
  @Column(name = "issued_at", nullable = false, updatable = false)
  private Instant issuedAt;

  @Column(name = "paid_at")
  private Instant paidAt;

  @Column(name = "due_at")
  private Instant dueAt;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private Instant updatedAt;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getFineReferenceNumber() {
    return fineReferenceNumber;
  }

  public void setFineReferenceNumber(String fineReferenceNumber) {
    this.fineReferenceNumber = fineReferenceNumber;
  }

  public User getDriver() {
    return driver;
  }

  public void setDriver(User driver) {
    this.driver = driver;
  }

  public User getOfficer() {
    return officer;
  }

  public void setOfficer(User officer) {
    this.officer = officer;
  }

  public Region getRegion() {
    return region;
  }

  public void setRegion(Region region) {
    this.region = region;
  }

  public String getVehicleNumber() {
    return vehicleNumber;
  }

  public void setVehicleNumber(String vehicleNumber) {
    this.vehicleNumber = vehicleNumber;
  }

  public String getDriverLicenseNumberSnapshot() {
    return driverLicenseNumberSnapshot;
  }

  public void setDriverLicenseNumberSnapshot(String driverLicenseNumberSnapshot) {
    this.driverLicenseNumberSnapshot = driverLicenseNumberSnapshot;
  }

  public LocalDate getViolationDate() {
    return violationDate;
  }

  public void setViolationDate(LocalDate violationDate) {
    this.violationDate = violationDate;
  }

  public String getViolationDetails() {
    return violationDetails;
  }

  public void setViolationDetails(String violationDetails) {
    this.violationDetails = violationDetails;
  }

  public String getViolationPlace() {
    return violationPlace;
  }

  public void setViolationPlace(String violationPlace) {
    this.violationPlace = violationPlace;
  }

  public BigDecimal getFineAmount() {
    return fineAmount;
  }

  public void setFineAmount(BigDecimal fineAmount) {
    this.fineAmount = fineAmount;
  }

  public String getLicenseCollectionLocation() {
    return licenseCollectionLocation;
  }

  public void setLicenseCollectionLocation(String licenseCollectionLocation) {
    this.licenseCollectionLocation = licenseCollectionLocation;
  }

  public FineStatus getStatus() {
    return status;
  }

  public void setStatus(FineStatus status) {
    this.status = status;
  }

  public Instant getIssuedAt() {
    return issuedAt;
  }

  public void setIssuedAt(Instant issuedAt) {
    this.issuedAt = issuedAt;
  }

  public Instant getPaidAt() {
    return paidAt;
  }

  public void setPaidAt(Instant paidAt) {
    this.paidAt = paidAt;
  }

  public Instant getDueAt() {
    return dueAt;
  }

  public void setDueAt(Instant dueAt) {
    this.dueAt = dueAt;
  }
}
