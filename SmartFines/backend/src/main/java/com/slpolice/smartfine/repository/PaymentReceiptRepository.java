package com.slpolice.smartfine.repository;

import com.slpolice.smartfine.entity.PaymentReceipt;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PaymentReceiptRepository extends JpaRepository<PaymentReceipt, Long> {
  Optional<PaymentReceipt> findByPaymentId(Long paymentId);

  @Query("select receipt from PaymentReceipt receipt join fetch receipt.payment payment where payment.id in :paymentIds")
  List<PaymentReceipt> findByPaymentIdIn(@Param("paymentIds") Collection<Long> paymentIds);
}
