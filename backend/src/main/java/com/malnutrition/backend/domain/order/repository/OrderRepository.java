package com.malnutrition.backend.domain.order.repository;

import com.malnutrition.backend.domain.order.entity.Order;
<<<<<<< HEAD
import com.malnutrition.backend.domain.order.enums.TossPaymentStatus;
=======
import com.malnutrition.backend.domain.order.enums.OrderStatus;
>>>>>>> cbb9fc83c6e37d57ae3b2d150f16a274399d3a8b
import com.malnutrition.backend.domain.user.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, String> {
    // 사용자 ID로 결제 내역 조회
    List<Order> findByUser(User user);

    // 주문 ID로 결제 내역 조회
    Optional<Order> findById(String orderId);

    // 기간 조건 (1개월, 3개월, 6개월)
    List<Order> findAllByUserAndApprovedAtBetween(User user, LocalDateTime from, LocalDateTime to);

    Page<Order> findAllByUserAndApprovedAtBetween(User user, LocalDateTime start, LocalDateTime end, Pageable pageable);

    Page<Order> findByUser(User user, Pageable pageable);

    Page<Order> findByLectureTrainerAndTossPaymentStatus(
            User trainer,
            TossPaymentStatus tossPaymentStatus,
            Pageable pageable
    );

    // 전체 정산 금액
    @Query("SELECT SUM(o.amount) FROM Order o WHERE o.lecture.trainer = :trainer AND o.tossPaymentStatus = 'DONE'")
    Long getTotalSettlementAmount(User trainer);

    // 월간 정산 금액
    @Query("SELECT SUM(o.amount) FROM Order o WHERE o.lecture.trainer = :trainer AND o.tossPaymentStatus = 'DONE' AND FUNCTION('MONTH', o.approvedAt) = :month AND FUNCTION('YEAR', o.approvedAt) = :year")
    Long getMonthlySettlementAmount(User trainer, int year, int month);

    // 연간 정산 금액
    @Query("SELECT SUM(o.amount) FROM Order o WHERE o.lecture.trainer = :trainer AND o.tossPaymentStatus = 'DONE' AND FUNCTION('YEAR', o.approvedAt) = :year")
    Long getYearlySettlementAmount(User trainer, int year);
    long countByOrderStatusAndApprovedAtBetween(OrderStatus orderStatus, LocalDateTime startTime, LocalDateTime endTime);

    List<Order> findAllByOrderStatusAndApprovedAtBetween(
            OrderStatus orderStatus,
            LocalDateTime startTime,
            LocalDateTime endTime
    );

}
