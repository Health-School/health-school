package com.malnutrition.backend.domain.lecture.curriculum.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Setter
@Getter
public class CurriculumUpdateRequestDto {
    private String title;
    private String content;
    private Integer sequence;
    private MultipartFile newFile;
}
