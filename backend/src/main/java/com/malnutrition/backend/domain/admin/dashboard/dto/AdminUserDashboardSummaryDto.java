package com.malnutrition.backend.domain.admin.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminUserDashboardSummaryDto {
    private long thisMonthNewUsersCount;
    private long activeUsersCount;
    private long bannedUsersCount;
    private long deletedUsersCount;
}
