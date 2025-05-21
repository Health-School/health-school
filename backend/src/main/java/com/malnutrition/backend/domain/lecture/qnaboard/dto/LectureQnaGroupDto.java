package com.malnutrition.backend.domain.lecture.qnaboard.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class LectureQnaGroupDto {
    private Long lectureId;
    private String lectureTitle;
    private List<QnaBoardResponseDto> qnaList;
}
