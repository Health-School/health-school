package com.malnutrition.backend.domain.lecture.lecture.dto;


import com.malnutrition.backend.domain.image.service.ImageService;
import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LectureSearchResponseDto {
    private Long id;
    private String title;
    private String content;
    private Long price;
    private String lectureLevel;
    private String lectureLevelDescription;
    private String lectureStatus;
    private String lectureStatusDescription;
    private String lectureImageUrl;
    private String trainerName;
    private String trainerEmail;
    private String trainerImageUrl;
    private Double averageScore;


    public static LectureSearchResponseDto transDto(Lecture lecture, ImageService imageService, Double averageScore) {
        return LectureSearchResponseDto.builder()
                .id(lecture.getId())
                .title(lecture.getTitle())
                .content(lecture.getContent())
                .price(lecture.getPrice())
                .lectureLevel(lecture.getLectureLevel().name())
                .lectureLevelDescription(lecture.getLectureLevel().getDescription())
                .lectureStatus(lecture.getLectureStatus().name())
                .lectureStatusDescription(lecture.getLectureStatus().getDescription())
                .lectureImageUrl(imageService.getImageUrl(lecture.getCoverImage()))
                .trainerName(lecture.getTrainer().getNickname())
                .trainerEmail(lecture.getTrainer().getEmail())
                .trainerImageUrl(imageService.getImageUrl(lecture.getTrainer().getProfileImage()))
                .averageScore(averageScore != null ? averageScore : 0.0) // null 방지
                .build();
    }

}
