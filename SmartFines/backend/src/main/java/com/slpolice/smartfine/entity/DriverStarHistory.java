package com.slpolice.smartfine.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

@Entity
@Table(name = "driver_star_history")
public class DriverStarHistory {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "driver_user_id", nullable = false)
  private User driver;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "fine_id")
  private TrafficFine fine;

  @Column(name = "stars_before", nullable = false)
  private int starsBefore;

  @Column(name = "stars_after", nullable = false)
  private int starsAfter;

  @Column(name = "change_reason", nullable = false, length = 255)
  private String changeReason;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "changed_by_user_id", nullable = false)
  private User changedByUser;

  @CreationTimestamp
  @Column(name = "changed_at", nullable = false, updatable = false)
  private Instant changedAt;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public User getDriver() {
    return driver;
  }

  public void setDriver(User driver) {
    this.driver = driver;
  }

  public TrafficFine getFine() {
    return fine;
  }

  public void setFine(TrafficFine fine) {
    this.fine = fine;
  }

  public int getStarsBefore() {
    return starsBefore;
  }

  public void setStarsBefore(int starsBefore) {
    this.starsBefore = starsBefore;
  }

  public int getStarsAfter() {
    return starsAfter;
  }

  public void setStarsAfter(int starsAfter) {
    this.starsAfter = starsAfter;
  }

  public String getChangeReason() {
    return changeReason;
  }

  public void setChangeReason(String changeReason) {
    this.changeReason = changeReason;
  }

  public User getChangedByUser() {
    return changedByUser;
  }

  public void setChangedByUser(User changedByUser) {
    this.changedByUser = changedByUser;
  }

  public Instant getChangedAt() {
    return changedAt;
  }

  public void setChangedAt(Instant changedAt) {
    this.changedAt = changedAt;
  }
}
