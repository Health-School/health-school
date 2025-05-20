package com.malnutrition.backend.domain.user.user.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class MeUserResponseDto {
    Long id;
    String email;
    String nickname;
    String phoneNumber;
    String profileImageUrl;
    String roleName;
}
