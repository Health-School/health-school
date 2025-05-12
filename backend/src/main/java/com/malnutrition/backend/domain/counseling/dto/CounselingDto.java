package com.malnutrition.backend.domain.counseling.dto;

import com.malnutrition.backend.domain.counseling.entity.Counseling;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounselingDto {
    private String title;
    private String content;
    private String type;
    private Long userId;
    private String userName;
    private Long trainerId;
    private String trainerName;

    public static CounselingDto fromEntity(Counseling counseling) {
        return CounselingDto.builder()
                .title(counseling.getTitle())
                .content(counseling.getContent())
                .type(counseling.getType())
                .userId(counseling.getUser().getId())
                .userName(counseling.getUser().getNickname())
                .trainerId(counseling.getTrainer().getId())
                .trainerName(counseling.getTrainer().getNickname())
                .build();
    }
}
