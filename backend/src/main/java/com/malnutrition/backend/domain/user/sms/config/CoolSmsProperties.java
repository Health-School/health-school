package com.malnutrition.backend.domain.user.sms.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "coolsms")
@Getter
@Setter
public class CoolSmsProperties {
    private String apiKey;
    private String apiSecret;
    private String fromNumber;
}