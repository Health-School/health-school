package com.malnutrition.backend.domain.admin.log.repository;

import com.malnutrition.backend.domain.admin.log.entity.TrainerVerificationLog;
import com.malnutrition.backend.domain.user.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface TrainerVerificationLogRepository extends JpaRepository<TrainerVerificationLog, Long> {
    List<TrainerVerificationLog> findByUserOrderByProcessedAtDesc(User user);
    Optional<TrainerVerificationLog> findTopByUserOrderByProcessedAtDesc(User user);
}
