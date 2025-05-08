package com.malnutrition.backend.domain.lecture.lecture.enums;

public enum LectureLevel {
    BEGINNER("초급"),
    INTERMEDIATE("중급"),
    ADVANCED("고급");

    private final String description;

    LectureLevel(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
