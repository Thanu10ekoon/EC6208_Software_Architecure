package com.slpolice.smartfine.dto;

import com.slpolice.smartfine.entity.UserStatus;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthLoginResponse {
  private String accessToken;
  private String tokenType;
  private Long userId;
  private String fullName;
  private List<String> roles;
  private UserStatus status;
}
