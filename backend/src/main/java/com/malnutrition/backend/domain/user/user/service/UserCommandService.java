package com.malnutrition.backend.domain.user.user.service;

import com.malnutrition.backend.domain.image.entity.Image;
import com.malnutrition.backend.domain.image.service.ImageService;
import com.malnutrition.backend.domain.user.email.service.EmailService;
import com.malnutrition.backend.domain.user.user.dto.MeUserResponseDto;
import com.malnutrition.backend.domain.user.user.dto.MyPageDto;
import com.malnutrition.backend.domain.user.user.dto.ResetPasswordDto;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserCommandService {
    private final UserService userService;
    private final EmailService emailService;
    private final ImageService imageService;
    private final Rq rq;

    @Transactional(readOnly = true)
    public MeUserResponseDto getMeUserResponseDto(Long userId){
        User user = userService.findByIdWithProfileImage(userId);
        String imageProfileUrl = imageService.getImageProfileUrl(user.getProfileImage());
        return MeUserResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .profileImageUrl(imageProfileUrl)
                .build();
    }
    @Transactional
    public ResetPasswordDto resetPassword(String email, String code){
        boolean result = emailService.verifyCode(email, code);
        if(!result) throw new IllegalArgumentException ("email 혹은 code가 잘못되었습니다.");
        String resetPassword = emailService.generateRandomCode();
        String newPassword = userService.resetPassword(email, resetPassword);
        return new ResetPasswordDto(newPassword);
    }

    @Transactional(readOnly = true)
    public MyPageDto getMyPageDto(Long userId){
        User user = userService.findByIdWithProfileImage(userId);

        Image profileImage = user.getProfileImage();
        String imageProfileUrl = imageService.getImageProfileUrl(profileImage);
        return MyPageDto.from(user, imageProfileUrl);
    }
}
