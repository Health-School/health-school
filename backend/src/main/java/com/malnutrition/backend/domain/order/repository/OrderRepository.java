package com.malnutrition.backend.domain.order.repository;

import com.malnutrition.backend.domain.order.entity.Order;

import com.malnutrition.backend.domain.order.enums.TossPaymentStatus;

import com.malnutrition.backend.domain.order.enums.OrderStatus;

import com.malnutrition.backend.domain.user.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, String> {
    // 사용자 ID로 결제 내역 조회
    List<Order> findByUser(User user);




    // 특정 사용자의 주문 목록을 페이징하여 조회
    @Query(value = "SELECT o FROM Order o " +
                   "JOIN FETCH o.lecture l " +
                   "JOIN FETCH l.trainer t " +
                   "WHERE o.user = :user",
           countQuery = "SELECT count(o) FROM Order o WHERE o.user = :user")
    Page<Order> findPageByUserWithDetails(@Param("user") User user, Pageable pageable);



    // 주문 ID로 결제 내역 조회
    Optional<Order> findById(String orderId);

    // 기간 조건 (1개월, 3개월, 6개월)
    List<Order> findAllByUserAndApprovedAtBetween(User user, LocalDateTime from, LocalDateTime to);

    @Query("SELECT o FROM Order o WHERE o.user = :user AND o.approvedAt BETWEEN :start AND :end AND o.orderStatus = 'COMPLETED'")
    Page<Order> findCompletedOrdersByUserAndApprovedAtBetween(
            @Param("user") User user,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable
    );

    @Query("SELECT o FROM Order o WHERE o.user = :user AND o.orderStatus = 'COMPLETED'")
    Page<Order> findCompletedOrdersByUser(
            @Param("user") User user,
            Pageable pageable
    );

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

    @Query("SELECT o FROM Order o JOIN FETCH o.lecture WHERE o.id = :id")
    Optional<Order> findWithLectureById(@Param("id") String id);


    List<Order> findByUserAndOrderStatus(User user, OrderStatus orderStatus);

    // userId와 lectureId로 Order 상태가 COMPLETED인지 확인
//    Optional<Order> findByUser_IdAndLecture_IdAndOrderStatus(String userId, Long lectureId, OrderStatus orderStatus);


    boolean existsByUser_IdAndLecture_IdAndOrderStatus(Long userId, Long lectureId, OrderStatus orderStatus);



}
