package com.malnutrition.backend.domain.admin.user.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminUserListItemDto {

    private Long id;
    private String nickname;
    private String email;
    private String phoneNumber;
    private String role;
    private LocalDateTime createdDate;
    private String userStatus;
    private String profileImageUrl;
}
