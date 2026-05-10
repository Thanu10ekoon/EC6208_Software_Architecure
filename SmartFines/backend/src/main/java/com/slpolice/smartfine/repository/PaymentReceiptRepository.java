package com.slpolice.smartfine.repository;

import com.slpolice.smartfine.entity.PaymentReceipt;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentReceiptRepository extends JpaRepository<PaymentReceipt, Long> {
  Optional<PaymentReceipt> findByPaymentId(Long paymentId);
}
