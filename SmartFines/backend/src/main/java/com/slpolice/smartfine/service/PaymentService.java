package com.slpolice.smartfine.service;

import com.slpolice.smartfine.dto.PaymentCreateRequest;
import com.slpolice.smartfine.dto.PaymentResponse;
import com.slpolice.smartfine.dto.ReceiptUploadResponse;
import com.slpolice.smartfine.entity.FineStatus;
import com.slpolice.smartfine.entity.FineStatusHistory;
import com.slpolice.smartfine.entity.Payment;
import com.slpolice.smartfine.entity.PaymentReceipt;
import com.slpolice.smartfine.entity.PaymentStatus;
import com.slpolice.smartfine.entity.ReceiptSource;
import com.slpolice.smartfine.entity.TrafficFine;
import com.slpolice.smartfine.entity.User;
import com.slpolice.smartfine.exception.ApiException;
import com.slpolice.smartfine.repository.FineStatusHistoryRepository;
import com.slpolice.smartfine.repository.PaymentReceiptRepository;
import com.slpolice.smartfine.repository.PaymentRepository;
import com.slpolice.smartfine.repository.TrafficFineRepository;
import com.slpolice.smartfine.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PaymentService {
  private final PaymentRepository paymentRepository;
  private final PaymentReceiptRepository paymentReceiptRepository;
  private final TrafficFineRepository fineRepository;
  private final FineStatusHistoryRepository fineStatusHistoryRepository;
  private final UserRepository userRepository;
  private final ReceiptStorageService receiptStorageService;
  private final NotificationService notificationService;

  public PaymentService(PaymentRepository paymentRepository,
      PaymentReceiptRepository paymentReceiptRepository,
      TrafficFineRepository fineRepository,
      FineStatusHistoryRepository fineStatusHistoryRepository,
      UserRepository userRepository,
      ReceiptStorageService receiptStorageService,
      NotificationService notificationService) {
    this.paymentRepository = paymentRepository;
    this.paymentReceiptRepository = paymentReceiptRepository;
    this.fineRepository = fineRepository;
    this.fineStatusHistoryRepository = fineStatusHistoryRepository;
    this.userRepository = userRepository;
    this.receiptStorageService = receiptStorageService;
    this.notificationService = notificationService;
  }

  @Transactional
  public PaymentResponse createPayment(Long driverUserId, PaymentCreateRequest request) {
    TrafficFine fine = fineRepository.findById(request.getFineId())
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Fine not found"));

    if (!fine.getDriver().getId().equals(driverUserId)) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Not allowed to pay this fine");
    }

    if (fine.getStatus() == FineStatus.PAID) {
      throw new ApiException(HttpStatus.CONFLICT, "Fine already paid");
    }

    if (paymentRepository.findByFineId(fine.getId()).isPresent()) {
      throw new ApiException(HttpStatus.CONFLICT, "Payment already exists for this fine");
    }

    Payment payment = new Payment();
    payment.setFine(fine);
    payment.setDriver(fine.getDriver());
    payment.setAmount(fine.getFineAmount());
    payment.setPaymentMethod(request.getPaymentMethod());
    payment.setTransactionReference(request.getTransactionReference());

    if (request.getPaymentMethod() == com.slpolice.smartfine.entity.PaymentMethod.ONLINE) {
      payment.setPaymentStatus(PaymentStatus.PAID);
      payment.setPaidAt(Instant.now());
      markFinePaid(fine, fine.getDriver());
    }

    Payment saved = paymentRepository.save(payment);

    if (payment.getPaymentStatus() == PaymentStatus.PAID) {
      notificationService.notifyPaymentReceived(fine.getOfficer(), fine.getDriver(), fine, saved);
    }

    return toResponse(saved);
  }

  @Transactional
  public ReceiptUploadResponse uploadReceipt(Long paymentId, Long driverUserId, MultipartFile file) {
    Payment payment = paymentRepository.findById(paymentId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payment not found"));

    if (!payment.getDriver().getId().equals(driverUserId)) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Not allowed to upload receipt");
    }

    if (paymentReceiptRepository.findByPaymentId(paymentId).isPresent()) {
      throw new ApiException(HttpStatus.CONFLICT, "Receipt already uploaded");
    }

    ReceiptStorageService.StoredFile storedFile = receiptStorageService.store(file);

    PaymentReceipt receipt = new PaymentReceipt();
    receipt.setPayment(payment);
    receipt.setReceiptNumber(generateReceiptNumber());
    receipt.setSource(ReceiptSource.DRIVER_UPLOADED);
    receipt.setFileUrl(storedFile.path());
    receipt.setFileName(storedFile.originalName());
    receipt.setMimeType(storedFile.mimeType());
    receipt.setFileSizeBytes(storedFile.sizeBytes());
    receipt.setUploadedByUser(payment.getDriver());
    receipt.setGeneratedAt(Instant.now());

    PaymentReceipt saved = paymentReceiptRepository.save(receipt);

    notificationService.notifyReceiptUploaded(payment.getFine().getOfficer(), payment.getDriver(), payment.getFine(), payment);

    return ReceiptUploadResponse.builder()
        .receiptId(saved.getId())
        .paymentId(payment.getId())
        .receiptNumber(saved.getReceiptNumber())
        .fileUrl(saved.getFileUrl())
        .source(saved.getSource())
        .createdAt(saved.getCreatedAt())
        .build();
  }

  @Transactional(readOnly = true)
  public List<PaymentResponse> listPayments(Long driverUserId) {
    return paymentRepository.findByDriverId(driverUserId).stream()
        .map(this::toResponse)
        .toList();
  }

  private void markFinePaid(TrafficFine fine, User actor) {
    FineStatus previousStatus = fine.getStatus();
    fine.setStatus(FineStatus.PAID);
    fine.setPaidAt(Instant.now());

    FineStatusHistory history = new FineStatusHistory();
    history.setFine(fine);
    history.setPreviousStatus(previousStatus);
    history.setNewStatus(FineStatus.PAID);
    history.setChangedByUser(actor);
    history.setComment("Payment completed");
    fineStatusHistoryRepository.save(history);
  }

  private String generateReceiptNumber() {
    return "RC-" + Instant.now().toEpochMilli() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
  }

  private PaymentResponse toResponse(Payment payment) {
    return PaymentResponse.builder()
        .id(payment.getId())
        .fineId(payment.getFine().getId())
        .driverUserId(payment.getDriver().getId())
        .amount(payment.getAmount())
        .paymentMethod(payment.getPaymentMethod())
        .paymentStatus(payment.getPaymentStatus())
        .transactionReference(payment.getTransactionReference())
        .paidAt(payment.getPaidAt())
        .createdAt(payment.getCreatedAt())
        .build();
  }
}
