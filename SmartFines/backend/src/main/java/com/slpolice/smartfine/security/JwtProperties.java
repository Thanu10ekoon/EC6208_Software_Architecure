package com.slpolice.smartfine.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

  @Value("${app.jwt.secret}")
  private String secret;
  private long accessTokenExpirationMinutes = 60;
}
