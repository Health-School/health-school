package com.malnutrition.backend.domain.admin.metric.service;

import com.malnutrition.backend.domain.admin.metric.entity.DailyMetricSnapshot;
import com.malnutrition.backend.domain.admin.metric.enums.MetricType;
import com.malnutrition.backend.domain.admin.metric.repository.DailyMetricSnapshotRepository;
import com.malnutrition.backend.domain.chatroom.chatmessage.enums.MessageType;
import com.malnutrition.backend.domain.lecture.lecture.repository.LectureRepository;
import com.malnutrition.backend.domain.order.enums.OrderStatus;
import com.malnutrition.backend.domain.order.repository.OrderRepository;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MetricSnapshotService {

    private final UserRepository userRepository;
    private final LectureRepository lectureRepository;
    private final OrderRepository orderRepository;
    private final DailyMetricSnapshotRepository dailyMetricSnapshotRepository;

    @Scheduled(cron = "0 1 0 * * ?") // 매일 0시 1분 실행
    @Transactional
    public void createDailyMetricSnapshots() {
        LocalDate today = LocalDate.now(); // 오늘
        LocalDate snapshotTargetDate = today.minusDays(1); // 어제 : 오늘 - 1

        // 총 사용자 수 스냅샷
        createTotalUsersSnapshot(snapshotTargetDate);
        // 총 강의 수 스냅샷
        createTotalLecturesSnapshot(snapshotTargetDate);
        // 총 결제 건수 스냅샷
        createTodayOrdersSnapshot(snapshotTargetDate);

        log.info("{}자 일일 지표 스냅샷 생성이 완료되었씁니다.", snapshotTargetDate);
    }

    private void createTotalUsersSnapshot(LocalDate snapshotDate) {
        LocalDateTime endOfSnapshotDay = snapshotDate.plusDays(1).atStartOfDay();
        long totalUsers = userRepository.countByCreatedDateBefore(endOfSnapshotDay);
        saveSnapshot(snapshotDate, MetricType.TOTAL_USERS, totalUsers);
    }

    private void createTotalLecturesSnapshot(LocalDate snapshotDate) {
        LocalDateTime endOfSnapshotDay = snapshotDate.plusDays(1).atStartOfDay();
        long totalLectures = lectureRepository.countByCreatedDateBefore(endOfSnapshotDay);
        saveSnapshot(snapshotDate, MetricType.TOTAL_LECTURES, totalLectures);
    }

    private void createTodayOrdersSnapshot(LocalDate snapshotDate) {
        LocalDateTime startOfDay = snapshotDate.atStartOfDay();
        LocalDateTime endOfDay = snapshotDate.atTime(LocalTime.MAX);

        long dailyOrders = orderRepository.countByOrderStatusAndApprovedAtBetween(
                OrderStatus.COMPLETED,
                startOfDay,
                endOfDay
        );
        saveSnapshot(snapshotDate, MetricType.TODAY_ORDERS, dailyOrders);
    }

    private void saveSnapshot(LocalDate snapshotDate, MetricType metricType, Long value) {
        // 스냅샷이 존재하는지 확인
        Optional<DailyMetricSnapshot> existingSnapshotOpt= dailyMetricSnapshotRepository.findBySnapshotDateAndMetricType(snapshotDate, metricType);


        if (existingSnapshotOpt.isPresent()) {
            DailyMetricSnapshot existingSnapshot = existingSnapshotOpt.get();
            existingSnapshot.setMetricValue(value);
            dailyMetricSnapshotRepository.save(existingSnapshot);
            log.info("[Update] {} Type : {} Value : {} ", snapshotDate, metricType.getDescription(), value);

        } else {
            DailyMetricSnapshot snapshot = DailyMetricSnapshot.builder()
                    .snapshotDate(snapshotDate)
                    .metricType(metricType)
                    .metricValue(value)
                    .build();
            dailyMetricSnapshotRepository.save(snapshot);
            log.info("[Create] {} Type : {} Value : {} ", snapshotDate, metricType.getDescription(), value);
        }

    }


}
