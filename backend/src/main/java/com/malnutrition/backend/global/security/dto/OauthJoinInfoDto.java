package com.malnutrition.backend.global.security.dto;


import com.malnutrition.backend.domain.user.user.dto.UserJoinRequestDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Builder
public class OauthJoinInfoDto {
    private String email;
    private String nickname;
    private String provider;


    public UserJoinRequestDto from(String phoneNumber){
        return UserJoinRequestDto.builder()
                .email(this.email)
                .password("")
                .nickname(this.nickname)
                .phoneNumber(phoneNumber)
                .build();

    }

}