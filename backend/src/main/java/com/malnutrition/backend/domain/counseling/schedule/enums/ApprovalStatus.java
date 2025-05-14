package com.malnutrition.backend.domain.counseling.schedule.enums;

public enum ApprovalStatus {
    PENDING("대기중"),
    APPROVED("승인됨"),
    REJECTED("거절됨");

    private final String description;

    ApprovalStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
