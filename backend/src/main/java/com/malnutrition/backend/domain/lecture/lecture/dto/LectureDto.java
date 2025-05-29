package com.malnutrition.backend.domain.lecture.lecture.dto;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.lecture.enums.LectureLevel;
import com.malnutrition.backend.domain.lecture.lecture.enums.LectureStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class LectureDto {
    private Long id;
    private String title;
    private String content;
    private Long price;
    private String lectureStatus;
    private String lectureLevel;
    private String trainerName;
    private String coverImageUrl;
    private String category;
    private double averageScore;
    private LocalDateTime createdAt;

    public static LectureDto from(Lecture lecture, String coverImageUrl, double averageScore) {
        return LectureDto.builder()
                .id(lecture.getId())
                .title(lecture.getTitle())
                .content(lecture.getContent())
                .price(lecture.getPrice())
                .lectureStatus(lecture.getLectureStatus().getDescription())
                .lectureLevel(lecture.getLectureLevel().getDescription())
                .trainerName(lecture.getTrainer().getNickname()) // getUsername은 User 엔티티에 맞게 수정
                .category(lecture.getLectureCategory().getCategoryName())
                .coverImageUrl(coverImageUrl)
                .averageScore(averageScore)
                .createdAt(lecture.getCreatedDate())
                .build();
    }
    public static LectureDto from(Lecture lecture) {
        return LectureDto.builder()
                .id(lecture.getId())
                .title(lecture.getTitle())
                .content(lecture.getContent())
                .price(lecture.getPrice())
                .lectureStatus(lecture.getLectureStatus().getDescription())
                .lectureLevel(lecture.getLectureLevel().getDescription())
                .createdAt(lecture.getCreatedDate())
                .build();
    }
}

