package com.malnutrition.backend.domain.user.user.dto;


import com.malnutrition.backend.domain.user.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserJoinRequestDto {
    private String email;
    private String password;
    private String nickname;
    private String phoneNumber;

    public static User from(UserJoinRequestDto joinUserDto){

        return User.builder()
                .email(joinUserDto.getEmail())
                .password(joinUserDto.getPassword())
                .nickname(joinUserDto.getNickname())
                .phoneNumber(joinUserDto.getPhoneNumber())
                .build();
    }

}
