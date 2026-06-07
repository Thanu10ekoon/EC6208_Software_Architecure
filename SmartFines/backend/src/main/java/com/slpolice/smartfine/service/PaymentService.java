package com.slpolice.smartfine.service;

import com.slpolice.smartfine.dto.PaymentCreateRequest;
import com.slpolice.smartfine.dto.PaymentResponse;
import com.slpolice.smartfine.dto.ReceiptUploadResponse;
import com.slpolice.smartfine.dto.StripeCheckoutRequest;
import com.slpolice.smartfine.dto.StripeCheckoutResponse;
import com.slpolice.smartfine.entity.FineStatus;
import com.slpolice.smartfine.entity.FineStatusHistory;
import com.slpolice.smartfine.entity.Payment;
import com.slpolice.smartfine.entity.PaymentMethod;
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
import java.nio.file.Files;
import java.nio.file.Path;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientResponseException;
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
  private final RestTemplate restTemplate = new RestTemplate();
  private final String stripeSecretKey;
  private final String stripeCurrency;
  private final String stripeSuccessUrl;
  private final String stripeCancelUrl;

  public PaymentService(PaymentRepository paymentRepository,
      PaymentReceiptRepository paymentReceiptRepository,
      TrafficFineRepository fineRepository,
      FineStatusHistoryRepository fineStatusHistoryRepository,
      UserRepository userRepository,
      ReceiptStorageService receiptStorageService,
      NotificationService notificationService,
      @Value("${app.stripe.secret-key:}") String stripeSecretKey,
      @Value("${app.stripe.currency:lkr}") String stripeCurrency,
      @Value("${app.stripe.success-url:http://localhost:5173/driver/payments?session_id=CHECKOUT_SESSION_ID}") String stripeSuccessUrl,
      @Value("${app.stripe.cancel-url:http://localhost:5173/driver/payments}") String stripeCancelUrl) {
    this.paymentRepository = paymentRepository;
    this.paymentReceiptRepository = paymentReceiptRepository;
    this.fineRepository = fineRepository;
    this.fineStatusHistoryRepository = fineStatusHistoryRepository;
    this.userRepository = userRepository;
    this.receiptStorageService = receiptStorageService;
    this.notificationService = notificationService;
    this.stripeSecretKey = stripeSecretKey;
    this.stripeCurrency = stripeCurrency;
    this.stripeSuccessUrl = stripeSuccessUrl;
    this.stripeCancelUrl = stripeCancelUrl;
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

    if (paymentRepository.existsByFineIdAndPaymentStatusNotIn(
        fine.getId(), List.of(PaymentStatus.FAILED, PaymentStatus.REVERSED))) {
      throw new ApiException(HttpStatus.CONFLICT, "Payment already exists for this fine");
    }

    Payment payment = new Payment();
    payment.setFine(fine);
    payment.setDriver(fine.getDriver());
    payment.setAmount(fine.getFineAmount());
    payment.setPaymentMethod(request.getPaymentMethod());
    payment.setTransactionReference(request.getTransactionReference());

    if (request.getPaymentMethod() == PaymentMethod.ONLINE) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Use Stripe Checkout for online payments");
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
    List<Payment> payments = paymentRepository.findByDriverId(driverUserId).stream()
        .sorted(Comparator.comparing(Payment::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
        .toList();
    return toResponses(payments);
  }

  @Transactional(readOnly = true)
  public List<PaymentResponse> listAllPayments() {
    return toResponses(paymentRepository.findAllByOrderByCreatedAtDesc());
  }

  @Transactional(readOnly = true)
  public ReceiptFile getReceiptFile(Long paymentId, Long userId, boolean admin) {
    Payment payment = paymentRepository.findById(paymentId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payment not found"));

    if (!admin && !payment.getDriver().getId().equals(userId)) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Not allowed to view receipt");
    }

    PaymentReceipt receipt = paymentReceiptRepository.findByPaymentId(paymentId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Receipt not found"));
    Path path = Path.of(receipt.getFileUrl()).toAbsolutePath().normalize();
    if (!Files.exists(path) || !Files.isRegularFile(path)) {
      throw new ApiException(HttpStatus.NOT_FOUND, "Receipt file not found");
    }

    return new ReceiptFile(new PathResource(path), receipt.getFileName(), receipt.getMimeType());
  }

  @Transactional
  public PaymentResponse acceptReceiptPayment(Long paymentId, Long adminUserId) {
    Payment payment = paymentRepository.findById(paymentId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payment not found"));

    if (payment.getPaymentMethod() != PaymentMethod.RECEIPT_UPLOAD) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Only receipt upload payments can be accepted");
    }

    PaymentReceipt receipt = paymentReceiptRepository.findByPaymentId(paymentId).orElse(null);
    if (receipt == null && (payment.getTransactionReference() == null || payment.getTransactionReference().isBlank())) {
      throw new ApiException(HttpStatus.CONFLICT, "Receipt or payment reference is required before accepting payment");
    }

    User admin = userRepository.findById(adminUserId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Admin not found"));

    boolean wasPaid = payment.getPaymentStatus() == PaymentStatus.PAID;
    Instant acceptedAt = Instant.now();
    if (receipt != null && receipt.getVerifiedAt() == null) {
      receipt.setVerifiedByUser(admin);
      receipt.setVerifiedAt(acceptedAt);
    }

    if (!wasPaid) {
      payment.setPaymentStatus(PaymentStatus.PAID);
      payment.setPaidAt(acceptedAt);
    }

    if (payment.getFine().getStatus() != FineStatus.PAID) {
      markFinePaid(payment.getFine(), admin);
    }

    if (receipt != null) {
      paymentReceiptRepository.save(receipt);
    }
    Payment saved = paymentRepository.save(payment);
    if (!wasPaid) {
      notificationService.notifyPaymentReceived(payment.getFine().getOfficer(), payment.getDriver(), payment.getFine(), saved);
    }

    return toResponse(saved);
  }

  @Transactional
  public StripeCheckoutResponse createStripeCheckout(Long driverUserId, StripeCheckoutRequest request) {
    if (stripeSecretKey == null || stripeSecretKey.isBlank()) {
      throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Stripe secret key is not configured");
    }

    TrafficFine fine = fineRepository.findById(request.getFineId())
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Fine not found"));

    if (!fine.getDriver().getId().equals(driverUserId)) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Not allowed to pay this fine");
    }

    if (fine.getStatus() == FineStatus.PAID) {
      throw new ApiException(HttpStatus.CONFLICT, "Fine already paid");
    }

    paymentRepository.findByFineIdAndPaymentMethodAndPaymentStatus(
        fine.getId(), PaymentMethod.ONLINE, PaymentStatus.PENDING).ifPresent(payment -> {
          throw new ApiException(HttpStatus.CONFLICT, "Online payment is already pending for this fine");
        });

    if (paymentRepository.existsByFineIdAndPaymentStatusNotIn(
        fine.getId(), List.of(PaymentStatus.FAILED, PaymentStatus.REVERSED))) {
      throw new ApiException(HttpStatus.CONFLICT, "Payment already exists for this fine");
    }

    Payment payment = new Payment();
    payment.setFine(fine);
    payment.setDriver(fine.getDriver());
    payment.setAmount(fine.getFineAmount());
    payment.setPaymentMethod(PaymentMethod.ONLINE);
    payment.setPaymentStatus(PaymentStatus.PENDING);
    Payment saved = paymentRepository.save(payment);

    Map<String, Object> session = createStripeSession(saved);
    String sessionId = String.valueOf(session.get("id"));
    String checkoutUrl = String.valueOf(session.get("url"));
    saved.setTransactionReference(sessionId);
    paymentRepository.save(saved);

    return StripeCheckoutResponse.builder()
        .paymentId(saved.getId())
        .sessionId(sessionId)
        .checkoutUrl(checkoutUrl)
        .build();
  }

  @Transactional
  public PaymentResponse confirmStripeCheckout(Long driverUserId, String sessionId) {
    Payment payment = paymentRepository.findByTransactionReference(sessionId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Stripe payment not found"));

    if (!payment.getDriver().getId().equals(driverUserId)) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Not allowed to confirm this payment");
    }

    Map<String, Object> session = retrieveStripeSession(sessionId);
    if (!"paid".equals(session.get("payment_status"))) {
      throw new ApiException(HttpStatus.CONFLICT, "Stripe payment is not completed yet");
    }

    boolean wasPaid = payment.getPaymentStatus() == PaymentStatus.PAID;
    if (!wasPaid) {
      Instant paidAt = Instant.now();
      payment.setPaymentStatus(PaymentStatus.PAID);
      payment.setPaidAt(paidAt);
      if (payment.getFine().getStatus() != FineStatus.PAID) {
        markFinePaid(payment.getFine(), payment.getDriver());
      }
    }

    Payment saved = paymentRepository.save(payment);
    if (!wasPaid) {
      notificationService.notifyPaymentReceived(payment.getFine().getOfficer(), payment.getDriver(), payment.getFine(), saved);
    }

    return toResponse(saved);
  }

  @Transactional
  public PaymentResponse rejectReceiptPayment(Long paymentId, Long adminUserId) {
    Payment payment = paymentRepository.findById(paymentId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Payment not found"));

    if (payment.getPaymentMethod() != PaymentMethod.RECEIPT_UPLOAD) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Only receipt upload payments can be rejected");
    }

    PaymentReceipt receipt = paymentReceiptRepository.findByPaymentId(paymentId).orElse(null);

    if ((receipt != null && receipt.getVerifiedAt() != null) || payment.getPaymentStatus() == PaymentStatus.PAID) {
      throw new ApiException(HttpStatus.CONFLICT, "Accepted payments cannot be rejected");
    }

    User admin = userRepository.findById(adminUserId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Admin not found"));

    payment.setPaymentStatus(PaymentStatus.FAILED);
    payment.setPaidAt(null);
    if (receipt != null) {
      receipt.setNotes("Rejected by admin user " + admin.getId());
      paymentReceiptRepository.save(receipt);
    }

    return toResponse(paymentRepository.save(payment));
  }

  private Map<String, Object> createStripeSession(Payment payment) {
    HttpHeaders headers = stripeHeaders();
    MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
    body.add("mode", "payment");
    body.add("success_url", stripeSuccessUrl.replace("CHECKOUT_SESSION_ID", "{CHECKOUT_SESSION_ID}"));
    body.add("cancel_url", stripeCancelUrl);
    body.add("client_reference_id", String.valueOf(payment.getId()));
    body.add("metadata[paymentId]", String.valueOf(payment.getId()));
    body.add("metadata[fineId]", String.valueOf(payment.getFine().getId()));
    body.add("line_items[0][quantity]", "1");
    body.add("line_items[0][price_data][currency]", stripeCurrency);
    body.add("line_items[0][price_data][unit_amount]", stripeAmount(payment.getAmount()));
    body.add("line_items[0][price_data][product_data][name]",
        "SmartFines traffic fine " + payment.getFine().getFineReferenceNumber());

    ResponseEntity<Map> response;
    try {
      response = restTemplate.postForEntity(
          "https://api.stripe.com/v1/checkout/sessions",
          new HttpEntity<>(body, headers),
          Map.class);
    } catch (RestClientResponseException ex) {
      throw new ApiException(HttpStatus.BAD_GATEWAY, "Stripe error: " + stripeErrorMessage(ex));
    }

    if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
      throw new ApiException(HttpStatus.BAD_GATEWAY, "Failed to create Stripe Checkout session");
    }

    return response.getBody();
  }

  private Map<String, Object> retrieveStripeSession(String sessionId) {
    ResponseEntity<Map> response;
    try {
      response = restTemplate.exchange(
          "https://api.stripe.com/v1/checkout/sessions/" + sessionId,
          org.springframework.http.HttpMethod.GET,
          new HttpEntity<>(stripeHeaders()),
          Map.class);
    } catch (RestClientResponseException ex) {
      throw new ApiException(HttpStatus.BAD_GATEWAY, "Stripe error: " + stripeErrorMessage(ex));
    }

    if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
      throw new ApiException(HttpStatus.BAD_GATEWAY, "Failed to verify Stripe Checkout session");
    }

    return response.getBody();
  }

  private HttpHeaders stripeHeaders() {
    HttpHeaders headers = new HttpHeaders();
    headers.setBasicAuth(stripeSecretKey, "");
    headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
    return headers;
  }

  private String stripeAmount(BigDecimal amount) {
    return amount
        .multiply(BigDecimal.valueOf(100))
        .setScale(0, RoundingMode.HALF_UP)
        .toPlainString();
  }

  private String stripeErrorMessage(RestClientResponseException ex) {
    String body = ex.getResponseBodyAsString();
    if (body == null || body.isBlank()) {
      return ex.getStatusText();
    }
    return body;
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
    PaymentReceipt receipt = paymentReceiptRepository.findByPaymentId(payment.getId()).orElse(null);
    return toResponse(payment, receipt);
  }

  private List<PaymentResponse> toResponses(List<Payment> payments) {
    if (payments.isEmpty()) {
      return List.of();
    }

    List<Long> paymentIds = payments.stream()
        .map(Payment::getId)
        .toList();
    Map<Long, PaymentReceipt> receiptsByPaymentId = paymentReceiptRepository.findByPaymentIdIn(paymentIds).stream()
        .collect(Collectors.toMap(receipt -> receipt.getPayment().getId(), Function.identity()));

    return payments.stream()
        .map(payment -> toResponse(payment, receiptsByPaymentId.get(payment.getId())))
        .toList();
  }

  private PaymentResponse toResponse(Payment payment, PaymentReceipt receipt) {
    PaymentResponse.PaymentResponseBuilder builder = PaymentResponse.builder()
        .id(payment.getId())
        .fineId(payment.getFine().getId())
        .fineStatus(payment.getFine().getStatus())
        .driverUserId(payment.getDriver().getId())
        .driverName(payment.getDriver().getFullName())
        .driverNic(payment.getDriver().getNic())
        .amount(payment.getAmount())
        .paymentMethod(payment.getPaymentMethod())
        .paymentStatus(payment.getPaymentStatus())
        .transactionReference(payment.getTransactionReference())
        .paidAt(payment.getPaidAt())
        .createdAt(payment.getCreatedAt());

    if (receipt != null) {
      builder
          .receiptId(receipt.getId())
          .receiptNumber(receipt.getReceiptNumber())
          .receiptSource(receipt.getSource())
          .receiptFileName(receipt.getFileName())
          .receiptMimeType(receipt.getMimeType())
          .receiptFileSizeBytes(receipt.getFileSizeBytes())
          .receiptFileUrl("/payments/" + payment.getId() + "/receipt/file")
          .receiptUploadedAt(receipt.getCreatedAt())
          .receiptVerifiedByUserId(receipt.getVerifiedByUser() != null ? receipt.getVerifiedByUser().getId() : null)
          .receiptVerifiedAt(receipt.getVerifiedAt());
    }

    return builder.build();
  }

  public record ReceiptFile(Resource resource, String fileName, String mimeType) {}
}
