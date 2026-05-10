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
@Getter
@Setter
@NoArgsConstructor
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
}
