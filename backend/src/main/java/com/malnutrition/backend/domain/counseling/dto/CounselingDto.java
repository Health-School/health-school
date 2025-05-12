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

    public static CounselingDto fromEntity(Counseling counseling) {
        return CounselingDto.builder()
                .title(counseling.getTitle())
                .content(counseling.getContent())
                .type(counseling.getType())
                .userId(counseling.getUser().getId())
                .build();
    }
}
