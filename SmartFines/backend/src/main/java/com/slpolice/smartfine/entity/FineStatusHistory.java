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

@Entity
@Table(name = "fine_status_history")
public class FineStatusHistory {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "fine_id", nullable = false)
  private TrafficFine fine;

  @Enumerated(EnumType.STRING)
  @Column(name = "previous_status", length = 20)
  private FineStatus previousStatus;

  @Enumerated(EnumType.STRING)
  @Column(name = "new_status", nullable = false, length = 20)
  private FineStatus newStatus;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "changed_by_user_id", nullable = false)
  private User changedByUser;

  @CreationTimestamp
  @Column(name = "changed_at", nullable = false, updatable = false)
  private Instant changedAt;

  @Column(length = 255)
  private String comment;

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

  public FineStatus getPreviousStatus() {
    return previousStatus;
  }

  public void setPreviousStatus(FineStatus previousStatus) {
    this.previousStatus = previousStatus;
  }

  public FineStatus getNewStatus() {
    return newStatus;
  }

  public void setNewStatus(FineStatus newStatus) {
    this.newStatus = newStatus;
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

  public String getComment() {
    return comment;
  }

  public void setComment(String comment) {
    this.comment = comment;
  }
}
