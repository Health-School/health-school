package com.malnutrition.backend.domain.admin.metric.entity;

import com.malnutrition.backend.domain.admin.metric.enums.MetricType;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.time.LocalDate;


@Entity
@Table(name = "daily_metric_snapshots", indexes = {
        @Index(name = "idx_snapshot_data_type", columnList = "snapshotDate, metricType", unique = true)
})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class DailyMetricSnapshot extends BaseEntity {

    @Column(nullable = false)
    private LocalDate snapshotDate; // 통계 기준일

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MetricType metricType; // 지표 타입

    @Column(nullable = false)
    private Long metricValue; // 해당 날짜 지표 값
}
