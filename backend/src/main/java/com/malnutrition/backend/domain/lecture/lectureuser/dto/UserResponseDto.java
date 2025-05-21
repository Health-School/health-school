package com.malnutrition.backend.domain.lecture.lectureuser.dto;

import com.malnutrition.backend.domain.user.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponseDto {
    private Long id;
    private String username;
    private String email;
    private String phoneNumber;  // 폰 번호 추가

    public static UserResponseDto from(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .username(user.getNickname())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())  // User 엔티티에 맞게 필드명 확인
                .build();
    }
}
