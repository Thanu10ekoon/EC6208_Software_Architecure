package com.slpolice.smartfine.service;

import com.slpolice.smartfine.entity.Notification;
import com.slpolice.smartfine.entity.NotificationChannel;
import com.slpolice.smartfine.entity.NotificationDelivery;
import com.slpolice.smartfine.entity.NotificationDeliveryStatus;
import com.slpolice.smartfine.entity.Payment;
import com.slpolice.smartfine.entity.TrafficFine;
import com.slpolice.smartfine.entity.User;
import com.slpolice.smartfine.repository.NotificationDeliveryRepository;
import com.slpolice.smartfine.repository.NotificationRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
  private final NotificationRepository notificationRepository;
  private final NotificationDeliveryRepository deliveryRepository;

  public NotificationService(NotificationRepository notificationRepository,
      NotificationDeliveryRepository deliveryRepository) {
    this.notificationRepository = notificationRepository;
    this.deliveryRepository = deliveryRepository;
  }

  public Notification notifyPaymentReceived(User recipient, User actor, TrafficFine fine, Payment payment) {
    return createNotification(recipient, actor, "payment_received",
        "Payment received",
        "Payment received for fine " + fine.getFineReferenceNumber(),
        fine, payment);
  }

  public Notification notifyReceiptUploaded(User recipient, User actor, TrafficFine fine, Payment payment) {
    return createNotification(recipient, actor, "receipt_uploaded",
        "Receipt uploaded",
        "Receipt uploaded for fine " + fine.getFineReferenceNumber(),
        fine, payment);
  }

  public Notification notifyLicenseRecollected(User recipient, User actor, TrafficFine fine) {
    return createNotification(recipient, actor, "license_recollected",
        "License recollection marked",
        "Driver marked license recollection for fine " + fine.getFineReferenceNumber(),
        fine, null);
  }

  private Notification createNotification(User recipient, User actor, String type, String title, String message,
      TrafficFine fine, Payment payment) {
    Notification notification = new Notification();
    notification.setRecipient(recipient);
    notification.setActor(actor);
    notification.setType(type);
    notification.setTitle(title);
    notification.setMessage(message);
    notification.setRelatedFine(fine);
    notification.setRelatedPayment(payment);

    Notification saved = notificationRepository.save(notification);
    List<NotificationDelivery> deliveries = List.of(
        buildDelivery(saved, NotificationChannel.IN_APP, recipient, null),
        buildDelivery(saved, NotificationChannel.EMAIL, recipient, recipient.getEmail())
    );
    deliveryRepository.saveAll(deliveries);

    return saved;
  }

  private NotificationDelivery buildDelivery(Notification notification, NotificationChannel channel, User recipient,
      String deliveredTo) {
    NotificationDelivery delivery = new NotificationDelivery();
    delivery.setNotification(notification);
    delivery.setChannel(channel);
    delivery.setDeliveryStatus(NotificationDeliveryStatus.QUEUED);
    delivery.setDeliveredTo(deliveredTo);
    return delivery;
  }
}
