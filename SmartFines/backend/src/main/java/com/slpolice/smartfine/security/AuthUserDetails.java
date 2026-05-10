package com.slpolice.smartfine.security;

import com.slpolice.smartfine.entity.User;
import com.slpolice.smartfine.entity.UserStatus;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
public class AuthUserDetails implements UserDetails {
  private final Long userId;
  private final String password;
  private final String username;
  private final UserStatus status;
  private final List<String> roles;

  public AuthUserDetails(User user, List<String> roles) {
    this.userId = user.getId();
    this.password = user.getPasswordHash();
    this.username = resolveUsername(user);
    this.status = user.getStatus();
    this.roles = roles;
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return roles.stream()
        .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
        .collect(Collectors.toList());
  }

  @Override
  public boolean isAccountNonExpired() {
    return true;
  }

  @Override
  public boolean isAccountNonLocked() {
    return status != UserStatus.SUSPENDED;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @Override
  public boolean isEnabled() {
    return status == UserStatus.ACTIVE;
  }

  private String resolveUsername(User user) {
    if (user.getEmail() != null && !user.getEmail().isBlank()) {
      return user.getEmail();
    }
    if (user.getNic() != null && !user.getNic().isBlank()) {
      return user.getNic();
    }
    if (user.getPhone() != null && !user.getPhone().isBlank()) {
      return user.getPhone();
    }
    return String.valueOf(user.getId());
  }
}
