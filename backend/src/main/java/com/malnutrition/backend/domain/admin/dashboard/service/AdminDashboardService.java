package com.malnutrition.backend.domain.admin.dashboard.service;

import com.malnutrition.backend.domain.admin.dashboard.dto.ChartDataDto;
import com.malnutrition.backend.domain.admin.dashboard.dto.DataPointDto;
import com.malnutrition.backend.domain.admin.dashboard.dto.MetricWidgetDto;
import com.malnutrition.backend.domain.admin.metric.entity.DailyMetricSnapshot;
import com.malnutrition.backend.domain.admin.metric.enums.MetricType;
import com.malnutrition.backend.domain.admin.metric.repository.DailyMetricSnapshotRepository;
import com.malnutrition.backend.domain.lecture.lecture.repository.LectureRepository;
import com.malnutrition.backend.domain.order.entity.Order;
import com.malnutrition.backend.domain.order.enums.OrderStatus;
import com.malnutrition.backend.domain.order.repository.OrderRepository;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final DailyMetricSnapshotRepository dailyMetricSnapshotRepository;
    private final LectureRepository lectureRepository;
    private final OrderRepository orderRepository;

    public MetricWidgetDto getTotalUsersMetric() {
        // 현재 총 사용자 수
        long currentTotalUsers = userRepository.count();

        // 어제 자 총 사용자 수 스냅샷
        LocalDate yesterday = LocalDate.now().minusDays(1);
        Optional<DailyMetricSnapshot> yesterdaySnapshot = dailyMetricSnapshotRepository.findBySnapshotDateAndMetricType(yesterday, MetricType.TOTAL_USERS);

        Long yesterdayTotalUsers = null;
        if(yesterdaySnapshot.isPresent())
            yesterdayTotalUsers = yesterdaySnapshot.get().getMetricValue();
        else
            log.warn("{}자 {} 스냅샷 데이터를 찾을 수 없습니다.", yesterday, MetricType.TOTAL_USERS);

        Double percentageChange = calPercentChange(currentTotalUsers, yesterdayTotalUsers);

        return MetricWidgetDto.builder()
                .metricName(MetricType.TOTAL_USERS.getDescription())
                .currentValue(currentTotalUsers)
                .percentageChange(percentageChange)
                .build();
    }

    public MetricWidgetDto getTotalLecturesMetric() {

            //  현재 총 강의 수
            long currentTotalLectures = lectureRepository.count();

            //  어제 자 총 강의 수 스냅 샷
            LocalDate yesterday = LocalDate.now().minusDays(1);
            Optional<DailyMetricSnapshot> yesterdaySnapshot =
                    dailyMetricSnapshotRepository.findBySnapshotDateAndMetricType(yesterday, MetricType.TOTAL_LECTURES);

            Long previousTotalLectures = null;
            if (yesterdaySnapshot.isPresent()) {
                previousTotalLectures = yesterdaySnapshot.get().getMetricValue();
            } else {
                log.warn("{}자 {} 스냅샷 데이터를 찾을 수 없습니다.", yesterday, MetricType.TOTAL_LECTURES);
            }


            Double percentageChange = calPercentChange(currentTotalLectures, previousTotalLectures);

            return MetricWidgetDto.builder()
                    .metricName(MetricType.TOTAL_LECTURES.getDescription())
                    .currentValue(currentTotalLectures)
                    .percentageChange(percentageChange)
                    .build();
    }

    public MetricWidgetDto getDailyCompletedOrdersMetric() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate dayBeforeYesterday = today.minusDays(2);

        // 어제 하루 동안 완료된 주문 건수
        Optional<DailyMetricSnapshot> yesterdaySnapshot =
                dailyMetricSnapshotRepository.findBySnapshotDateAndMetricType(yesterday, MetricType.TODAY_ORDERS);

        Long yesterdayCompletedOrders = 0L;
        if (yesterdaySnapshot.isPresent()) {
            yesterdayCompletedOrders = yesterdaySnapshot.get().getMetricValue();
        } else {
            log.warn("{}자 {} 스냅샷 데이터를 찾을 수 없습니다. 오늘의 값은 0으로 간주됩니다.", yesterday, MetricType.TODAY_ORDERS);
        }

        // 2. 그저께 하루 동안 완료된 주문 건수스냅샷
        Optional<DailyMetricSnapshot> dayBeforeYesterdaySnapshotOpt =
                dailyMetricSnapshotRepository.findBySnapshotDateAndMetricType(dayBeforeYesterday, MetricType.TODAY_ORDERS);

        Long dayBeforeYesterdayCompletedOrders = null;
        if (dayBeforeYesterdaySnapshotOpt.isPresent()) {
            dayBeforeYesterdayCompletedOrders = dayBeforeYesterdaySnapshotOpt.get().getMetricValue();
        } else {
            log.warn("{}자 {} 스냅샷 데이터를 찾을 수 없습니다. 변화율 계산에 영향이 있을 수 있습니다.", dayBeforeYesterday, MetricType.TODAY_ORDERS);
        }

        Double percentageChange = calPercentChange(yesterdayCompletedOrders, dayBeforeYesterdayCompletedOrders);

        return MetricWidgetDto.builder()
                .metricName(MetricType.TODAY_ORDERS.getDescription()) // "일일 완료 주문 건수"
                .currentValue(yesterdayCompletedOrders) // "어제의" 일일 완료 주문 건수를 보여줌
                .percentageChange(percentageChange)
                .build();
    }

    private Double calPercentChange(long currentValue, Long yesterdayValue) {
        if(yesterdayValue == null)
            return null;

        if(yesterdayValue == 0)
            return (currentValue > 0) ? 100.0 : 0.0;

        double change = ((double) (currentValue - yesterdayValue) / yesterdayValue) * 100.0;

        return Math.round(change * 100.0) / 100.0;

    }

    public List<MetricWidgetDto> getTopKeyMetrics() {
        List<MetricWidgetDto> metrics = new ArrayList<>();
        metrics.add(getTotalUsersMetric());
        metrics.add(getTotalLecturesMetric());
        metrics.add(getDailyCompletedOrdersMetric());
        return metrics;
    }

    public ChartDataDto getTotalUsersTrend(LocalDate startDate, LocalDate endDate) {
        List<DailyMetricSnapshot> snapshots = dailyMetricSnapshotRepository.findAllByMetricTypeAndSnapshotDateBetweenOrderBySnapshotDateAsc(
                MetricType.TOTAL_USERS,
                startDate,
                endDate
        );

        List<DataPointDto> dataPoints = snapshots.stream()
                .map(snapshot -> new DataPointDto(snapshot.getSnapshotDate(), snapshot.getMetricValue()))
                .toList();

        return new ChartDataDto(MetricType.TOTAL_USERS.getDescription() + " 추이", dataPoints);
    }

    public ChartDataDto getUserGrowthTrendByInterval(String interval) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate;
        String chartNameSuffix;

        switch(interval.toLowerCase()) {
            case "daily":
                startDate = endDate.minusDays(6 - 1); // 최근 6일치 데이터
                chartNameSuffix = "(최근 6일, 일 별)";
                break;

            case "weekly":
                startDate = endDate.minusWeeks(6).with(DayOfWeek.MONDAY); // 최근 6주치 데이터
                chartNameSuffix = "(최근 6주, 주 별)";
                break;

            case "monthly":
                startDate = endDate.minusMonths(6).withDayOfMonth(1); // 최근 6개월치 데이터
                chartNameSuffix = "(최근 6개월, 월 별)";
                break;
            default:
                throw new IllegalArgumentException("지원하지 않는 간격입니다");
        }

        List<DataPointDto> dataPoints;

        if("daily".equalsIgnoreCase(interval))
            dataPoints = getDailyUserSnapshots(startDate, endDate);
        else if("weekly".equalsIgnoreCase(interval))
            dataPoints = getWeeklyUserSnapshots(startDate, endDate);
        else
            dataPoints = getMonthlyUserSnapshots(startDate, endDate);

        return new ChartDataDto(MetricType.TOTAL_USERS.getDescription() + " 추이 " + chartNameSuffix, dataPoints);

    }

    private List<DataPointDto> getDailyUserSnapshots(LocalDate startDate, LocalDate endDate) {
        List<DailyMetricSnapshot> snapshots = dailyMetricSnapshotRepository.findAllByMetricTypeAndSnapshotDateBetweenOrderBySnapshotDateAsc(
                MetricType.TOTAL_USERS,
                startDate,
                endDate
        );
        return snapshots.stream()
                .map(s -> new DataPointDto(s.getSnapshotDate(), s.getMetricValue()))
                .collect(Collectors.toList());
    }

    private List<DataPointDto> getWeeklyUserSnapshots(LocalDate startDate, LocalDate endDate) {
        List<DailyMetricSnapshot> allSnapshotsInRange = dailyMetricSnapshotRepository.findAllByMetricTypeAndSnapshotDateBetweenOrderBySnapshotDateAsc(
                MetricType.TOTAL_USERS,
                startDate,
                endDate
        );
        return allSnapshotsInRange.stream()
                .filter(s -> s.getSnapshotDate().getDayOfWeek() == DayOfWeek.SUNDAY || s.getSnapshotDate().equals(endDate)) // 매주 일요일 또는 기간의 마지막 날
                .collect(Collectors.groupingBy(
                        // 주의 월요일을 기준으로 그룹핑
                        snapshot -> snapshot.getSnapshotDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)),
                        // 각 주에서 가장 마지막 날짜의 스냅샷을 선택
                        Collectors.maxBy(Comparator.comparing(DailyMetricSnapshot::getSnapshotDate))
                ))
                .values().stream()
                .filter(Optional::isPresent)
                .map(Optional::get)
                .map(s -> new DataPointDto(s.getSnapshotDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)), s.getMetricValue())) // 날짜를 주의 시작일로 통일
                .sorted(Comparator.comparing(DataPointDto::getDate))
                .collect(Collectors.toList());
    }

    private List<DataPointDto> getMonthlyUserSnapshots(LocalDate startDate, LocalDate endDate) {
        List<DailyMetricSnapshot> allSnapshotsInRange = dailyMetricSnapshotRepository.findAllByMetricTypeAndSnapshotDateBetweenOrderBySnapshotDateAsc(
                MetricType.TOTAL_USERS,
                startDate,
                endDate
        );
        // 월별 마지막 날짜의 데이터를 추출
        return allSnapshotsInRange.stream()
                .collect(Collectors.groupingBy(
                        // 해당 월의 1일을 기준으로 그룹핑
                        snapshot -> snapshot.getSnapshotDate().withDayOfMonth(1),
                        // 각 월에서 가장 마지막 날짜의 스냅샷을 선택
                        Collectors.maxBy(Comparator.comparing(DailyMetricSnapshot::getSnapshotDate))
                ))
                .values().stream()
                .filter(Optional::isPresent)
                .map(Optional::get)
                .map(s -> new DataPointDto(s.getSnapshotDate().withDayOfMonth(1), s.getMetricValue())) // 날짜를 월의 시작일로 통일
                .sorted(Comparator.comparing(DataPointDto::getDate))
                .collect(Collectors.toList());
    }


    public ChartDataDto getSalesAmountTrendByInterval(String interval) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate;
        String chartNameSuffix;

        switch (interval.toLowerCase()) {
            case "daily":
                startDate = endDate.minusDays(6 - 1); // 최근 6일 (오늘 포함)
                chartNameSuffix = "(최근 6일, 일별)";
                break;
            case "weekly":
                startDate = endDate.minusWeeks(6).with(DayOfWeek.MONDAY); // 최근 6주
                chartNameSuffix = "(최근 6주, 주별)";
                break;
            case "monthly":
                startDate = endDate.minusMonths(6).withDayOfMonth(1); // 최근 6개월
                chartNameSuffix = "(최근 6개월, 월별)";
                break;
            default:
                throw new IllegalArgumentException("지원하지 않는 간격입니다: " + interval + ". ('daily', 'weekly', 'monthly' 중 선택)");
        }

        List<DataPointDto> dataPoints;
        if ("daily".equalsIgnoreCase(interval)) {
            dataPoints = getDailySalesAmount(startDate, endDate);
        } else if ("weekly".equalsIgnoreCase(interval)) {
            dataPoints = getWeeklySalesAmount(startDate, endDate);
        } else { // monthly
            dataPoints = getMonthlySalesAmount(startDate, endDate);
        }

        return new ChartDataDto("결제 금액 추이 " + chartNameSuffix, dataPoints);
    }

    private List<DataPointDto> getDailySalesAmount(LocalDate startDate, LocalDate endDate) {

        List<Order> completedOrders = orderRepository.findAllByOrderStatusAndApprovedAtBetween(
                OrderStatus.COMPLETED,
                startDate.atStartOfDay(),
                endDate.atTime(LocalTime.MAX)
        );

        // 일자별로 그룹핑하여 금액 합산
        return completedOrders.stream()
                .filter(order -> order.getApprovedAt() != null) // approvedAt이 있는 경우만
                .collect(Collectors.groupingBy(
                        order -> order.getApprovedAt().toLocalDate(), // LocalDate로 그룹핑
                        Collectors.summingLong(Order::getAmount)     // 각 날짜별 amount 합계
                ))
                .entrySet().stream()
                .map(entry -> new DataPointDto(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(DataPointDto::getDate))
                .collect(Collectors.toList());
    }

    private List<DataPointDto> getWeeklySalesAmount(LocalDate startDate, LocalDate endDate) {
        List<Order> completedOrders = orderRepository.findAllByOrderStatusAndApprovedAtBetween(
                OrderStatus.COMPLETED,
                startDate.atStartOfDay(),
                endDate.atTime(LocalTime.MAX)
        );

        // 주별로 그룹핑 (주의 시작일 기준)하여 금액 합산
        return completedOrders.stream()
                .filter(order -> order.getApprovedAt() != null)
                .collect(Collectors.groupingBy(
                        order -> order.getApprovedAt().toLocalDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)),
                        Collectors.summingLong(Order::getAmount)
                ))
                .entrySet().stream()
                .map(entry -> new DataPointDto(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(DataPointDto::getDate))
                .collect(Collectors.toList());
    }

    private List<DataPointDto> getMonthlySalesAmount(LocalDate startDate, LocalDate endDate) {
        List<Order> completedOrders = orderRepository.findAllByOrderStatusAndApprovedAtBetween(
                OrderStatus.COMPLETED,
                startDate.atStartOfDay(),
                endDate.atTime(LocalTime.MAX)
        );

        // 월별로 그룹핑 (월의 시작일 기준)하여 금액 합산
        return completedOrders.stream()
                .filter(order -> order.getApprovedAt() != null)
                .collect(Collectors.groupingBy(
                        order -> order.getApprovedAt().toLocalDate().withDayOfMonth(1),
                        Collectors.summingLong(Order::getAmount)
                ))
                .entrySet().stream()
                .map(entry -> new DataPointDto(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(DataPointDto::getDate))
                .collect(Collectors.toList());
    }




}
