package com.malnutrition.backend.domain.counseling.counseling.repository;

import com.malnutrition.backend.domain.counseling.counseling.entity.Counseling;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CounselingRepository extends JpaRepository<Counseling, Long> {
    List<Counseling> findByUserId(Long userId);
}
