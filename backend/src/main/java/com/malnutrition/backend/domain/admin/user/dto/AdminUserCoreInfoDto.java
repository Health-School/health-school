package com.malnutrition.backend.domain.admin.user.dto;

import lombok.Getter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Getter
@SuperBuilder
public class AdminUserCoreInfoDto {

    private Long id;
    private String nickname;
    private String email;
    private String phoneNumber;
    private String role;
    private String userStatus;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private String profileImageUrl;

}
