package com.malnutrition.backend.domain.lecture.lecture.dto;

package com.malnutrition.backend.domain.lecture.lecture.dto;

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

    public static LectureSearchResponseDto transDto(Lecture lecture) {
        return LectureSearchResponseDto.builder()
                .id(lecture.getId())
                .title(lecture.getTitle())
                .content(lecture.getContent())
                .price(lecture.getPrice())
                .lectureLevel(lecture.getLectureLevel().name())
                .lectureLevelDescription(lecture.getLectureLevel().getDescription())
                .lectureStatus(lecture.getLectureStatus().name())
                .lectureStatusDescription(lecture.getLectureStatus().getDescription())
                .build();
    }
}
