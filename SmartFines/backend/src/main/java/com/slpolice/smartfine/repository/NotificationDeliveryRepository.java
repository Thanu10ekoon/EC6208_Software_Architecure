package com.slpolice.smartfine.repository;

import com.slpolice.smartfine.entity.NotificationDelivery;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationDeliveryRepository extends JpaRepository<NotificationDelivery, Long> {
  List<NotificationDelivery> findByNotificationId(Long notificationId);
}
