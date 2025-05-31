package com.malnutrition.backend.domain.lecture.report.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Getter;

import java.util.Arrays;

@Getter
public enum ReportType {

    IMPROPER_CONTENT("부적절한 컨텐츠"),
    COPYRIGHT_INFRINGEMENT("저작권 침해"),
    FALSE_INFORMATION("허위/잘못된 정보"),
    LECTURE_OPERATION_ISSUE("강의 운영문제"),
    ETC("기타");

    private final String description;

    ReportType(String description) {
        this.description = description;
    }

    @JsonCreator
    public static ReportType fromDescription(String description) {
        return Arrays.stream(ReportType.values())
                .filter(type -> type.getDescription().equals(description))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("알 수 없는 신고 유형입니다: " + description));
    }


}
