package com.slpolice.smartfine.controller;

import com.slpolice.smartfine.dto.NotificationResponse;
import com.slpolice.smartfine.security.AuthUserDetails;
import com.slpolice.smartfine.service.NotificationQueryService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
  private final NotificationQueryService notificationQueryService;

  public NotificationController(NotificationQueryService notificationQueryService) {
    this.notificationQueryService = notificationQueryService;
  }

  @GetMapping
  @PreAuthorize("isAuthenticated()")
  public List<NotificationResponse> listNotifications(@AuthenticationPrincipal AuthUserDetails user) {
    return notificationQueryService.listNotifications(user.getUserId());
  }
}
