package com.malnutrition.backend.domain.admin.user.dto;

import lombok.Getter;
import lombok.experimental.SuperBuilder;

@Getter
@SuperBuilder
public class TrainerCoreInfoDto extends AdminUserCoreInfoDto {

    private String careerHistory;
    private String expertiseHistory;
    private String selfIntroduction;
}
