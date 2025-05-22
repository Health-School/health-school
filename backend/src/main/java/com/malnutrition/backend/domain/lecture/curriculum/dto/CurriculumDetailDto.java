package com.malnutrition.backend.domain.lecture.curriculum.dto;

import com.malnutrition.backend.domain.lecture.curriculum.entity.Curriculum;
import com.malnutrition.backend.domain.lecture.curriculumProgress.entity.CurriculumProgress;
import com.malnutrition.backend.domain.lecture.curriculumProgress.enums.ProgressStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CurriculumDetailDto {
    //커리큘럼 데이터
    Long curriculumId;
    String curriculumTitle;
    Integer sequence;
    String curriculumContent;
    String curriculumVideoUrl;

    //커리큘럼 진행도
    Integer progressRate;
    Integer lastWatchedSecond;
    String progressStatus;
    LocalDateTime completedAt;


    public CurriculumDetailDto(Long curriculumId,
                               String curriculumTitle,
                               Integer sequence,
                               String curriculumContent,
                               String curriculumVideoUrl,
                               Integer progressRate,
                               Integer lastWatchedSecond,
                               ProgressStatus progressStatus,
                               LocalDateTime completedAt) {
        this.curriculumId = curriculumId;
        this.curriculumTitle = curriculumTitle;
        this.sequence = sequence;
        this.curriculumContent = curriculumContent;
        this.curriculumVideoUrl = curriculumVideoUrl;
        this.progressRate = progressRate != null ? lastWatchedSecond : 0;
        this.lastWatchedSecond = lastWatchedSecond;
        this.progressStatus = progressStatus != null ? progressStatus.getDescription() : null;
        this.completedAt = completedAt;
    }


}
