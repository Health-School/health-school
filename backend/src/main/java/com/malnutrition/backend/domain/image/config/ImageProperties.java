package com.malnutrition.backend.domain.image.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Getter
@Component
public class ImageProperties {

    @Value("${image.profile.use_s3}")
    private boolean useS3;

    @Value("${image.profile.upload_path}")
    private String uploadPath;

    @Value("${image.profile.view_url}")
    private String viewUrl;
}
