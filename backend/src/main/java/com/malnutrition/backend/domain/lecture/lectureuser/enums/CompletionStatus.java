package com.malnutrition.backend.domain.lecture.lectureuser.enums;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public enum CompletionStatus {
    NOT_COMPLETED("미수료"),
    COMPLETED("수료");

    private final String description;

    CompletionStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    // 총 수강자 수 (특정 트레이너의 모든 강의 기준)

}