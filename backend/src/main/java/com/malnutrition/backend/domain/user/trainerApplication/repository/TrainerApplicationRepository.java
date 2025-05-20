package com.malnutrition.backend.domain.user.trainerApplication.repository;


import com.malnutrition.backend.domain.user.trainerApplication.enums.TrainerVerificationStatus;
import com.malnutrition.backend.domain.user.trainerApplication.entity.TrainerApplication;
import com.malnutrition.backend.domain.user.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TrainerApplicationRepository extends JpaRepository<TrainerApplication, Long> {

    // 특정 사용자의 트레이너 신청 내역 최신순 조회
    List<TrainerApplication> findByUserOrderByCreatedDateDesc(User user);

    // 특정 사용자의 가장 최근 트레이너 신청 건 조회
    Optional<TrainerApplication> findTopByUserOrderByCreatedDateDesc(User user);

    // 특정 조건의 신청 목록만 조회
    Page<TrainerApplication> findByVerificationResultOrderByCreatedDateDesc(TrainerVerificationStatus verificationResult, Pageable pageable);


    @Query("SELECT DISTINCT ta FROM TrainerApplication ta " +
            "JOIN FETCH ta.user u " +
            "LEFT JOIN FETCH u.profileImage upi " +
            "LEFT JOIN FETCH ta.submittedCertifications sc " +
            "LEFT JOIN FETCH sc.certification c " +
            "LEFT JOIN FETCH sc.image sci " +
            "WHERE ta.id = :applicationId")
    Optional<TrainerApplication> findByIdWithDetails(@Param("applicationId") Long applicationId);

}
