package com.malnutrition.backend.domain.lecture.lecture.enums;

public enum LectureStatus {
    PLANNED("예정"),
    STARTED("시작"),
    ONGOING("진행중"),
    COMPLETED("완강");

    private final String description;

    LectureStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
