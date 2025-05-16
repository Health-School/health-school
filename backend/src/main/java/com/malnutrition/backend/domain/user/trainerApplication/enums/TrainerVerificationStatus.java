package com.malnutrition.backend.domain.user.trainerApplication.enums;

import lombok.Getter;

@Getter
public enum TrainerVerificationStatus {
    PENDING_VERIFICATION("심사중"),
    APPROVE_AS_TRAINER("승인"),
    REJECT_AS_TRAINER("반려");

    private final String description;

    TrainerVerificationStatus(String description) {
        this.description = description;
    }

}
a