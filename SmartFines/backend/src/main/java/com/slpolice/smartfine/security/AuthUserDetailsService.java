package com.slpolice.smartfine.security;

import com.slpolice.smartfine.entity.User;
import com.slpolice.smartfine.exception.ApiException;
import com.slpolice.smartfine.repository.UserRepository;
import com.slpolice.smartfine.repository.UserRoleRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AuthUserDetailsService implements UserDetailsService {
  private final UserRepository userRepository;
  private final UserRoleRepository userRoleRepository;

  public AuthUserDetailsService(UserRepository userRepository, UserRoleRepository userRoleRepository) {
    this.userRepository = userRepository;
    this.userRoleRepository = userRoleRepository;
  }

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    User user = userRepository.findByUsername(username)
        .or(() -> userRepository.findByEmail(username))
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    return toUserDetails(user);
  }

  public AuthUserDetails loadUserById(Long userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid token"));
    return toUserDetails(user);
  }

  private AuthUserDetails toUserDetails(User user) {
    List<String> roles = userRoleRepository.findRoleNamesByUserId(user.getId());
    return new AuthUserDetails(user, roles);
  }
}
