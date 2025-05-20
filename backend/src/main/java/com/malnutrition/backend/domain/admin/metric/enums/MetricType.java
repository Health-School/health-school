package com.malnutrition.backend.domain.admin.metric.enums;

import lombok.Getter;

@Getter
public enum MetricType {
    TOTAL_USERS("총 사용자 수"),
    TOTAL_LECTURES("총 강의 수"),
    TODAY_ORDERS("오늘 총 결제 건수"); // COMPLETED 만 포함
    // PENDING_REPORTS("대기 중인 신고 건수");

    private final String description;

    MetricType(String description) {
        this.description = description;
    }

}
