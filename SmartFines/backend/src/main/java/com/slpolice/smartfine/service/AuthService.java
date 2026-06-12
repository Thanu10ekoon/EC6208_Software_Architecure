package com.slpolice.smartfine.service;

import com.slpolice.smartfine.dto.AuthLoginRequest;
import com.slpolice.smartfine.dto.AuthLoginResponse;
import com.slpolice.smartfine.dto.DriverSignupRequest;
import com.slpolice.smartfine.dto.LoginType;
import com.slpolice.smartfine.entity.LicenseDetails;
import com.slpolice.smartfine.entity.Role;
import com.slpolice.smartfine.entity.User;
import com.slpolice.smartfine.entity.UserRole;
import com.slpolice.smartfine.exception.ApiException;
import com.slpolice.smartfine.repository.LicenseDetailsRepository;
import com.slpolice.smartfine.repository.OfficerProfileRepository;
import com.slpolice.smartfine.repository.RegionRepository;
import com.slpolice.smartfine.repository.RoleRepository;
import com.slpolice.smartfine.repository.UserRepository;
import com.slpolice.smartfine.repository.UserRoleRepository;
import com.slpolice.smartfine.security.JwtTokenProvider;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
  private final UserRepository userRepository;
  private final OfficerProfileRepository officerProfileRepository;
  private final RoleRepository roleRepository;
  private final UserRoleRepository userRoleRepository;
  private final LicenseDetailsRepository licenseDetailsRepository;
  private final RegionRepository regionRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtTokenProvider tokenProvider;

  public AuthService(
      UserRepository userRepository,
      OfficerProfileRepository officerProfileRepository,
      RoleRepository roleRepository,
      UserRoleRepository userRoleRepository,
      LicenseDetailsRepository licenseDetailsRepository,
      RegionRepository regionRepository,
      PasswordEncoder passwordEncoder,
      JwtTokenProvider tokenProvider) {
    this.userRepository = userRepository;
    this.officerProfileRepository = officerProfileRepository;
    this.roleRepository = roleRepository;
    this.userRoleRepository = userRoleRepository;
    this.licenseDetailsRepository = licenseDetailsRepository;
    this.regionRepository = regionRepository;
    this.passwordEncoder = passwordEncoder;
    this.tokenProvider = tokenProvider;
  }

  @Transactional(readOnly = true)
  public AuthLoginResponse login(AuthLoginRequest request) {
    User user = resolveUserForLogin(request.getLoginType(), request.getIdentifier());

    if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    List<String> roles = userRoleRepository.findRoleNamesByUserId(user.getId());
    ensureRoleAccess(request.getLoginType(), roles);

    String token = tokenProvider.generateAccessToken(user.getId(), roles);
    return new AuthLoginResponse(token, "Bearer", user.getId(), user.getFullName(), roles, user.getStatus());
  }

  @Transactional
  public AuthLoginResponse driverSignup(DriverSignupRequest request) {
    if (userRepository.existsByEmail(request.getEmail())) {
      throw new ApiException(HttpStatus.CONFLICT, "Email is already registered");
    }
    if (userRepository.existsByNic(request.getNic())) {
      throw new ApiException(HttpStatus.CONFLICT, "NIC is already registered");
    }
    if (userRepository.existsByPhone(request.getPhone())) {
      throw new ApiException(HttpStatus.CONFLICT, "Phone is already registered");
    }
    if (licenseDetailsRepository.existsByLicenseNumber(request.getLicenseNumber())) {
      throw new ApiException(HttpStatus.CONFLICT, "License number is already registered");
    }

    User user = new User();
    user.setFullName(request.getFullName());
    user.setEmail(request.getEmail());
    user.setPhone(request.getPhone());
    user.setNic(request.getNic());
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

    User savedUser = userRepository.save(user);

    LicenseDetails licenseDetails = new LicenseDetails();
    licenseDetails.setUser(savedUser);
    licenseDetails.setLicenseNumber(request.getLicenseNumber());
    licenseDetails.setDateOfBirth(request.getDateOfBirth());
    licenseDetails.setAddress(request.getAddress());

    if (request.getRegionId() != null) {
      licenseDetails.setRegion(regionRepository.findById(request.getRegionId())
          .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Region not found")));
    }

    licenseDetailsRepository.save(licenseDetails);

    Role driverRole = roleRepository.findByName("driver")
        .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Driver role missing"));

    UserRole userRole = new UserRole();
    userRole.setUser(savedUser);
    userRole.setRole(driverRole);
    userRoleRepository.save(userRole);

    List<String> roles = List.of("driver");
    String token = tokenProvider.generateAccessToken(savedUser.getId(), roles);
    return new AuthLoginResponse(token, "Bearer", savedUser.getId(), savedUser.getFullName(), roles, savedUser.getStatus());
  }

  private User resolveUserForLogin(LoginType loginType, String identifier) {
    return switch (loginType) {
      case DRIVER -> userRepository.findByNic(identifier)
          .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Driver not found"));
      case OFFICER -> officerProfileRepository.findByBadgeNumber(identifier)
          .map(profile -> profile.getUser())
          .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Officer not found"));
        case ADMIN -> userRepository.findByUsername(identifier)
          .or(() -> userRepository.findByEmail(identifier))
          .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Admin not found"));
    };
  }

  private void ensureRoleAccess(LoginType loginType, List<String> roles) {
    String requiredRole = switch (loginType) {
      case DRIVER -> "driver";
      case OFFICER -> "traffic_officer";
      case ADMIN -> "admin";
    };

    if (roles.stream().noneMatch(role -> role.equalsIgnoreCase(requiredRole))) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Role not allowed for this login type");
    }
  }
}
