package com.malnutrition.backend.domain.image.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class AmazonS3Config {
    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.AP_NORTHEAST_2) // ✅ 서울 리전이면 이렇게
                .credentialsProvider(DefaultCredentialsProvider.create()) // EC2에 IAM 역할 있으면 이걸로 자동 됨
                .build();
    }
}
