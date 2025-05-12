package com.malnutrition.backend.domain.certification.usercertification.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class UserCertificationRegisterRequestDto {
    @NotNull
    private Long certificationId;

    @NotNull
    private LocalDate expirationDate;


}
