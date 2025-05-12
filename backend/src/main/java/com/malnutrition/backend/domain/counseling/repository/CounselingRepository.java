package com.malnutrition.backend.domain.counseling.repository;

import com.malnutrition.backend.domain.counseling.entity.Counseling;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CounselingRepository extends JpaRepository<Counseling, Long> {
}
