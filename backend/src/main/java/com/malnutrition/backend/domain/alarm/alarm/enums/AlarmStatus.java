package com.malnutrition.backend.domain.alarm.alarm.enums;

public enum AlarmStatus {
    UNREAD("읽지 않음"),
    READ("읽음");
    private final String description;

    AlarmStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
