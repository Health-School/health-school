package com.malnutrition.backend.domain.lecture.lecture.dto;

import com.malnutrition.backend.domain.lecture.curriculum.dto.CurriculumDetailDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class LectureCurriculumDetailDto {

    //강의 정보
    String lectureTitle;
    String lectureContent;
    String lectureCategory;
    String lectureLevel;
    double averageScore;

    //트레이너 정보
    String trainerNickname;
    String trainerProfileUrl;
    List<String> trainerCertificationNames;

    //커리큘럼 데이터
    List<CurriculumDetailDto> curriculumDetailDtoList;

}
