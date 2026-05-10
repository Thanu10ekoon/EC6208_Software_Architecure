package com.slpolice.smartfine.service;

import com.slpolice.smartfine.dto.AdminStatsResponse;
import com.slpolice.smartfine.dto.OfficerCreateRequest;
import com.slpolice.smartfine.dto.OfficerResponse;
import com.slpolice.smartfine.entity.OfficerProfile;
import com.slpolice.smartfine.entity.Role;
import com.slpolice.smartfine.entity.User;
import com.slpolice.smartfine.entity.UserRole;
import com.slpolice.smartfine.exception.ApiException;
import com.slpolice.smartfine.repository.OfficerProfileRepository;
import com.slpolice.smartfine.repository.RegionRepository;
import com.slpolice.smartfine.repository.RoleRepository;
import com.slpolice.smartfine.repository.TrafficFineRepository;
import com.slpolice.smartfine.repository.UserRepository;
import com.slpolice.smartfine.repository.UserRoleRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {
  private final UserRepository userRepository;
  private final OfficerProfileRepository officerProfileRepository;
  private final RoleRepository roleRepository;
  private final UserRoleRepository userRoleRepository;
  private final RegionRepository regionRepository;
  private final TrafficFineRepository trafficFineRepository;
  private final PasswordEncoder passwordEncoder;

  public AdminService(UserRepository userRepository,
      OfficerProfileRepository officerProfileRepository,
      RoleRepository roleRepository,
      UserRoleRepository userRoleRepository,
      RegionRepository regionRepository,
      TrafficFineRepository trafficFineRepository,
      PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.officerProfileRepository = officerProfileRepository;
    this.roleRepository = roleRepository;
    this.userRoleRepository = userRoleRepository;
    this.regionRepository = regionRepository;
    this.trafficFineRepository = trafficFineRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Transactional
  public OfficerResponse createOfficer(Long adminUserId, OfficerCreateRequest request) {
    if (userRepository.existsByEmail(request.getEmail())) {
      throw new ApiException(HttpStatus.CONFLICT, "Email is already registered");
    }
    if (userRepository.existsByPhone(request.getPhone())) {
      throw new ApiException(HttpStatus.CONFLICT, "Phone is already registered");
    }
    if (request.getNic() != null && userRepository.existsByNic(request.getNic())) {
      throw new ApiException(HttpStatus.CONFLICT, "NIC is already registered");
    }
    if (officerProfileRepository.existsByBadgeNumber(request.getBadgeNumber())) {
      throw new ApiException(HttpStatus.CONFLICT, "Badge number is already registered");
    }
    if (officerProfileRepository.existsByOfficerCode(request.getOfficerCode())) {
      throw new ApiException(HttpStatus.CONFLICT, "Officer code is already registered");
    }

    User user = new User();
    user.setFullName(request.getFullName());
    user.setEmail(request.getEmail());
    user.setPhone(request.getPhone());
    user.setNic(request.getNic());
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

    User savedUser = userRepository.save(user);

    OfficerProfile profile = new OfficerProfile();
    profile.setUser(savedUser);
    profile.setOfficerCode(request.getOfficerCode());
    profile.setBadgeNumber(request.getBadgeNumber());
    profile.setStationName(request.getStationName());
    profile.setRegion(regionRepository.findById(request.getRegionId())
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Region not found")));
    profile.setCreatedByUser(userRepository.findById(adminUserId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Admin not found")));

    OfficerProfile savedProfile = officerProfileRepository.save(profile);

    Role officerRole = roleRepository.findByName("traffic_officer")
        .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Officer role missing"));

    UserRole userRole = new UserRole();
    userRole.setUser(savedUser);
    userRole.setRole(officerRole);
    userRole.setAssignedByUser(savedProfile.getCreatedByUser());
    userRoleRepository.save(userRole);

    return toResponse(savedProfile);
  }

  @Transactional(readOnly = true)
  public List<OfficerResponse> listOfficers() {
    return officerProfileRepository.findAll().stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public AdminStatsResponse getStats() {
    long totalFines = trafficFineRepository.count();
    long paidFines = trafficFineRepository.countByStatus(com.slpolice.smartfine.entity.FineStatus.PAID);
    long pendingFines = totalFines - paidFines;
    BigDecimal totalCollected = trafficFineRepository.sumAmountByStatus(com.slpolice.smartfine.entity.FineStatus.PAID);
    BigDecimal totalOutstanding = trafficFineRepository.sumAmountByStatusNot(com.slpolice.smartfine.entity.FineStatus.PAID);

    List<AdminStatsResponse.RegionStats> regionStats = trafficFineRepository.findRegionFineStats().stream()
        .map(view -> AdminStatsResponse.RegionStats.builder()
            .regionId(view.getRegionId())
            .regionName(view.getRegionName())
            .totalFines(view.getTotalFines() == null ? 0 : view.getTotalFines())
            .paidFines(view.getPaidFines() == null ? 0 : view.getPaidFines())
            .pendingFines(view.getPendingFines() == null ? 0 : view.getPendingFines())
            .totalCollectedAmount(view.getTotalCollectedAmount())
            .totalOutstandingAmount(view.getTotalOutstandingAmount())
            .build())
        .toList();

    return AdminStatsResponse.builder()
        .totalFines(totalFines)
        .paidFines(paidFines)
        .pendingFines(pendingFines)
        .totalCollectedAmount(totalCollected)
        .totalOutstandingAmount(totalOutstanding)
        .regionStats(regionStats)
        .build();
  }

  private OfficerResponse toResponse(OfficerProfile profile) {
    return OfficerResponse.builder()
        .userId(profile.getUser().getId())
        .officerProfileUserId(profile.getUserId())
        .fullName(profile.getUser().getFullName())
        .email(profile.getUser().getEmail())
        .phone(profile.getUser().getPhone())
        .nic(profile.getUser().getNic())
        .officerCode(profile.getOfficerCode())
        .badgeNumber(profile.getBadgeNumber())
        .stationName(profile.getStationName())
        .regionId(profile.getRegion() != null ? profile.getRegion().getId() : null)
        .regionName(profile.getRegion() != null ? profile.getRegion().getName() : null)
        .build();
  }
}
