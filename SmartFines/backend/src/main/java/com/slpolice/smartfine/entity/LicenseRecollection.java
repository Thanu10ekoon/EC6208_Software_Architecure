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
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "license_recollections")
public class LicenseRecollection {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "fine_id", nullable = false, unique = true)
  private TrafficFine fine;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "driver_user_id", nullable = false)
  private User driver;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private RecollectionStatus status = RecollectionStatus.PENDING;

  @Column(name = "marked_recollected_at")
  private Instant markedRecollectedAt;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "confirmed_by_user_id")
  private User confirmedByUser;

  @Column(name = "confirmed_at")
  private Instant confirmedAt;

  @Column(length = 255)
  private String notes;

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

  public TrafficFine getFine() {
    return fine;
  }

  public void setFine(TrafficFine fine) {
    this.fine = fine;
  }

  public User getDriver() {
    return driver;
  }

  public void setDriver(User driver) {
    this.driver = driver;
  }

  public RecollectionStatus getStatus() {
    return status;
  }

  public void setStatus(RecollectionStatus status) {
    this.status = status;
  }

  public Instant getMarkedRecollectedAt() {
    return markedRecollectedAt;
  }

  public void setMarkedRecollectedAt(Instant markedRecollectedAt) {
    this.markedRecollectedAt = markedRecollectedAt;
  }

  public User getConfirmedByUser() {
    return confirmedByUser;
  }

  public void setConfirmedByUser(User confirmedByUser) {
    this.confirmedByUser = confirmedByUser;
  }

  public Instant getConfirmedAt() {
    return confirmedAt;
  }

  public void setConfirmedAt(Instant confirmedAt) {
    this.confirmedAt = confirmedAt;
  }

  public String getNotes() {
    return notes;
  }

  public void setNotes(String notes) {
    this.notes = notes;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Instant updatedAt) {
    this.updatedAt = updatedAt;
  }
}
