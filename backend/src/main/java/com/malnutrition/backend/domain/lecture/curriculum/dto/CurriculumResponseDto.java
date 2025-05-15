package com.malnutrition.backend.domain.lecture.curriculum.dto;

import com.malnutrition.backend.domain.lecture.curriculum.entity.Curriculum;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CurriculumResponseDto {
    private Long id;
    private String title;
    private String content;
    private String s3path;
    private String lectureTitle;
    private String trainerNickname;

    public static CurriculumResponseDto from(Curriculum curriculum) {
        return new CurriculumResponseDto(
                curriculum.getId(),
                curriculum.getTitle(),
                curriculum.getContent(),
                curriculum.getS3path(),
                curriculum.getLecture().getTitle(),
                null
        );
    }
}
