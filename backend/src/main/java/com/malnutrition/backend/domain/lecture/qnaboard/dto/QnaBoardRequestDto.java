package com.malnutrition.backend.domain.lecture.qnaboard.dto;


import com.malnutrition.backend.domain.lecture.qnaboard.enums.OpenStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class QnaBoardRequestDto {
    private String title;
    private String content;
    private Long lectureId; // 강의 ID만 받음 // 어떤 강의에 대한 질문인지를 알아야하기때문에 넣음
    private OpenStatus openStatus;
}