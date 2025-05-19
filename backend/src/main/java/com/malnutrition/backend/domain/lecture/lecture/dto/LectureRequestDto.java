package com.malnutrition.backend.domain.lecture.lecture.dto;

import com.malnutrition.backend.domain.lecture.lecture.enums.LectureStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LectureRequestDto {

    private String title;      // 강의 제목
    private String content;    // 강의 내용
    private Long price;     // 강의 가격
    private String lectureLevel; // 강의 수준 (초급, 중급, 고급 등)
    private LectureStatus lectureStatus; // 강의 상태 (OPEN, CLOSED 등)
    private String categoryName;
    // 추가적으로 필요한 필드가 있다면 여기에 더 추가하시면 됩니다.
}
