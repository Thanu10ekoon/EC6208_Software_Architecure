package com.slpolice.smartfine.config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class NotifyProperties {

    @Value("${notify.user-id}")
    private String userId;

    @Value("${notify.api-key}")
    private String apiKey;

    @Value("${notify.sender-id}")
    private String senderId;

    @Value("${notify.base-url}")
    private String baseUrl;

    public String getUserId() {
        return userId;
    }

    public String getApiKey() {
        return apiKey;
    }

    public String getSenderId() {
        return senderId;
    }

    public String getBaseUrl() {
        return baseUrl;
    }
}
