package com.malnutrition.backend.domain.lecture.lectureuser.dto;

import com.malnutrition.backend.domain.user.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserLectureDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String profileImage;

}
