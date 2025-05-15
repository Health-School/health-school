package com.malnutrition.backend.domain.lecture.curriculumProgress.enums;

public enum ProgressStatus {
    STARTED("시작 전"),
    KeepGoing("진행 중"),
    COMPLETED("완강");

    private final String description;

    ProgressStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

