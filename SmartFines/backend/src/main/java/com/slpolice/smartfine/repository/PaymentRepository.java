package com.slpolice.smartfine.repository;

import com.slpolice.smartfine.entity.Payment;
import com.slpolice.smartfine.entity.PaymentMethod;
import com.slpolice.smartfine.entity.PaymentStatus;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
  @EntityGraph(attributePaths = {"fine", "driver"})
  List<Payment> findByDriverId(Long driverId);

  @EntityGraph(attributePaths = {"fine", "driver"})
  List<Payment> findAllByOrderByCreatedAtDesc();

  boolean existsByFineIdAndPaymentStatusNotIn(Long fineId, Collection<PaymentStatus> statuses);
  Optional<Payment> findByTransactionReference(String transactionReference);
  Optional<Payment> findByFineIdAndPaymentMethodAndPaymentStatus(Long fineId, PaymentMethod paymentMethod,
      PaymentStatus paymentStatus);
}
