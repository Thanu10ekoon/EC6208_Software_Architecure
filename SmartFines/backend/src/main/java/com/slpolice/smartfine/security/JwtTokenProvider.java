package com.slpolice.smartfine.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {
  private static final String ROLES_CLAIM = "roles";

  private final JwtProperties properties;
  private final Key signingKey;

  public JwtTokenProvider(JwtProperties properties) {
    this.properties = properties;
    this.signingKey = initKey(properties.getSecret());
  }

  public String generateAccessToken(Long userId, List<String> roles) {
    Instant now = Instant.now();
    Instant expiry = now.plusSeconds(properties.getAccessTokenExpirationMinutes() * 60);

    return Jwts.builder()
        .setSubject(String.valueOf(userId))
        .setIssuedAt(Date.from(now))
        .setExpiration(Date.from(expiry))
        .claim(ROLES_CLAIM, roles)
        .signWith(signingKey, SignatureAlgorithm.HS256)
        .compact();
  }

  public Optional<Long> parseUserId(String token) {
    try {
      Claims claims = Jwts.parserBuilder()
          .setSigningKey(signingKey)
          .build()
          .parseClaimsJws(token)
          .getBody();
      return Optional.of(Long.valueOf(claims.getSubject()));
    } catch (Exception ex) {
      return Optional.empty();
    }
  }

  private Key initKey(String secret) {
    if (secret == null || secret.length() < 32) {
      throw new IllegalStateException("JWT secret must be at least 32 characters");
    }
    return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
  }
}
