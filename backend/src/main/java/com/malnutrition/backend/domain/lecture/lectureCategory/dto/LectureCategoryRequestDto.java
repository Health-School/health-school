package com.malnutrition.backend.domain.lecture.lectureCategory.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class LectureCategoryRequestDto {
    private String name;
    private String description;
}
