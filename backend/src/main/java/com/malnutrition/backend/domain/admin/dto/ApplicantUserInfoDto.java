package com.malnutrition.backend.domain.admin.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ApplicantUserInfoDto {

    private Long userId; // User 엔티티 id
    private String profileImageUrl;
    private String name;
    private String email;
    private String phoneNumber;

}
