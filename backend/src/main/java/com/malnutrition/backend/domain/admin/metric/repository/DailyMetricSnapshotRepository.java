package com.malnutrition.backend.domain.admin.metric.repository;

import com.malnutrition.backend.domain.admin.metric.entity.DailyMetricSnapshot;
import com.malnutrition.backend.domain.admin.metric.enums.MetricType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyMetricSnapshotRepository extends JpaRepository<DailyMetricSnapshot, Long> {

    Optional<DailyMetricSnapshot> findBySnapshotDateAndMetricType(LocalDate snapshotDate, MetricType metricType);

    List<DailyMetricSnapshot> findAllByMetricTypeAndSnapshotDateBetweenOrderBySnapshotDateAsc(
            MetricType metricType,
            LocalDate startDate,
            LocalDate endDate
    );
}
