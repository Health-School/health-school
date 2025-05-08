package com.malnutrition.backend.domain.lecture.qnaboard.enums;

public enum OpenStatus {
    OPEN("공개"),
    CLOSED("비공개");

    private final String description;

    OpenStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
