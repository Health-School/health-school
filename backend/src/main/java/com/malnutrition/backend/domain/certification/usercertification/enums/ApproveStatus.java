package com.malnutrition.backend.domain.certification.usercertification.enums;

import lombok.Getter;

@Getter
public enum ApproveStatus {

    APPROVAL("승인"),
    DISAPPROVAL("반려"),
    PENDING("심사중");

    private final String description;

    ApproveStatus(String description) {
        this.description = description;
    }

}
