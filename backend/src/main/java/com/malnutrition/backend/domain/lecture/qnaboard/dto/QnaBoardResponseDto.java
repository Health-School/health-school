package com.malnutrition.backend.domain.lecture.qnaboard.dto;

import com.malnutrition.backend.domain.lecture.qnaboard.entity.QnaBoard;
import com.malnutrition.backend.domain.lecture.qnaboard.enums.OpenStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class QnaBoardResponseDto {
    private Long id;
    private String title;
    private String content;
    private Long lectureId;
    private String lectureTitle;
    private Long userId;
    private String username;
    private OpenStatus openStatus;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;

    public static QnaBoardResponseDto from(QnaBoard q) {
        return QnaBoardResponseDto.builder()
                .id(q.getId())
                .title(q.getTitle())
                .content(q.getContent())
                .lectureId(q.getLecture().getId())
                .lectureTitle(q.getLecture().getTitle())
                .userId(q.getUser().getId())
                .username(q.getUser().getNickname())
                .openStatus(q.getOpenStatus())
                .createdDate(q.getCreatedDate())
                .updatedDate(q.getUpdatedDate())
                .build();
    }
}