package com.malnutrition.backend.domain.user.sms.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

@Configuration
@ConfigurationProperties(prefix = "coolsms")
@Component
@Getter
@Setter
public class CoolSmsProperties {
    private String apiKey;
    private String apiSecret;
    private String fromNumber;
    private String provider;
}