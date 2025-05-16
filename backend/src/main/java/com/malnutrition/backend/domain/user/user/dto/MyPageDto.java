package com.malnutrition.backend.domain.user.user.dto;

import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class MyPageDto {
    String nickname;
    String email;
    String profileImageUrl;
    String phoneNumber;
    Role role;

    public static MyPageDto from (User user, String profileImageUrl){

        return MyPageDto.builder()
                .email(user.getEmail())
                .nickname(user.getNickname())
                .profileImageUrl(profileImageUrl)
                .role(user.getRole())
                .build();
    }
}
