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
@Table(name = "notifications")
public class Notification {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "recipient_user_id", nullable = false)
  private User recipient;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "actor_user_id")
  private User actor;

  @Column(nullable = false, length = 80)
  private String type;

  @Column(nullable = false, length = 150)
  private String title;

  @Column(nullable = false, columnDefinition = "text")
  private String message;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "related_fine_id")
  private TrafficFine relatedFine;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "related_payment_id")
  private Payment relatedPayment;

  @Column(name = "action_url", columnDefinition = "text")
  private String actionUrl;

  @Column(name = "is_read", nullable = false)
  private boolean isRead = false;

  @Column(name = "read_at")
  private Instant readAt;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public User getRecipient() {
    return recipient;
  }

  public void setRecipient(User recipient) {
    this.recipient = recipient;
  }

  public User getActor() {
    return actor;
  }

  public void setActor(User actor) {
    this.actor = actor;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public TrafficFine getRelatedFine() {
    return relatedFine;
  }

  public void setRelatedFine(TrafficFine relatedFine) {
    this.relatedFine = relatedFine;
  }

  public Payment getRelatedPayment() {
    return relatedPayment;
  }

  public void setRelatedPayment(Payment relatedPayment) {
    this.relatedPayment = relatedPayment;
  }

  public String getActionUrl() {
    return actionUrl;
  }

  public void setActionUrl(String actionUrl) {
    this.actionUrl = actionUrl;
  }

  public boolean isRead() {
    return isRead;
  }

  public void setRead(boolean read) {
    isRead = read;
  }

  public Instant getReadAt() {
    return readAt;
  }

  public void setReadAt(Instant readAt) {
    this.readAt = readAt;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }
}
