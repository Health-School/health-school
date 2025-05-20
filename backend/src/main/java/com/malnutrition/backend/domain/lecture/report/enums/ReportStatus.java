package com.malnutrition.backend.domain.lecture.report.enums;

public enum ReportStatus {
    PENDING("대기 중"),
    RESOLVED("처리 완료"),
    REJECTED("기각됨");

    private final String description;

    ReportStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}