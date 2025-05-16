package com.malnutrition.backend.domain.admin.enums;

import lombok.Getter;

@Getter
public enum TrainerVerificationResult {
    PENDING_VERIFICATION("심사중"),
    APPROVE_AS_TRAINER("승인"),
    REJECT_AS_TRAINER("반려");

    private final String description;

    TrainerVerificationResult(String description) {
        this.description = description;
    }

}
