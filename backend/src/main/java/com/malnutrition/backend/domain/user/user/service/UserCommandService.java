package com.malnutrition.backend.domain.user.user.service;

import com.malnutrition.backend.domain.user.user.dto.MeUserResponseDto;
import com.malnutrition.backend.domain.user.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserCommandService {
    private final UserService userService;

    @Transactional(readOnly = true)
    public MeUserResponseDto getMeUserResponseDto(Long userId){
        User user = userService.findByIdWithProfileImage(userId);


        return MeUserResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .profileImageUrl(null)
                .build();
    }


}
