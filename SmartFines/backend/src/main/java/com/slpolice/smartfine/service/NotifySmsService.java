package com.slpolice.smartfine.service;

import com.slpolice.smartfine.config.NotifyProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;

import java.time.LocalDateTime;

@Service
public class NotifySmsService {

    private final RestTemplate restTemplate;
    private final NotifyProperties notifyProperties;

    @Autowired
    public NotifySmsService(RestTemplate restTemplate, NotifyProperties notifyProperties) {
        this.restTemplate = restTemplate;
        this.notifyProperties = notifyProperties;
    }

    @Async
    public void sendSms(String phoneNumber, String message) {
        System.out.println("SendSms called at " + LocalDateTime.now());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("user_id", notifyProperties.getUserId());
        body.add("api_key", notifyProperties.getApiKey());
        body.add("sender_id", notifyProperties.getSenderId());
        body.add("to", phoneNumber);
        body.add("message", message);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        try {
            String response = restTemplate.postForObject(notifyProperties.getBaseUrl(), request, String.class);
            System.out.println("SMS sent successfully. Response: " + response);
        } catch (Exception e) {
            System.err.println("Failed to send SMS: " + e.getMessage());
        }
    }
}
