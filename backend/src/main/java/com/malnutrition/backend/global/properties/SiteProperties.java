package com.malnutrition.backend.global.properties;


import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "custom.site")
public class SiteProperties {
    private String frontUrl;
    private String backUrl;
}