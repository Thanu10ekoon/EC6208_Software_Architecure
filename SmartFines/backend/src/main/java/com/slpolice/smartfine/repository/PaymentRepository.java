package com.slpolice.smartfine.repository;

import com.slpolice.smartfine.entity.Payment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
  List<Payment> findByDriverId(Long driverId);
  List<Payment> findAllByOrderByCreatedAtDesc();
  Optional<Payment> findByFineId(Long fineId);
}
