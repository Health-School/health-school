package com.malnutrition.backend.domain.lecture.curriculum.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CurriculumUploadRequestDto {
    @Schema(description = "소속 강의 ID")
    private Long lectureId;

    @Schema(description = "커리큘럼 제목")
    private String title;

    @Schema(description = "커리큘럼 내용")
    private String content;

    @Schema(description = "커리큘럼 순서")
    private int sequence;
}
