package com.malnutrition.backend.domain.certification.certification.repository;

import com.malnutrition.backend.domain.certification.certification.entity.Certification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CertificationRepository extends JpaRepository<Certification,Long> {

    @Query("""
        SELECT cc.name
        FROM UserCertification uc
        JOIN uc.certification c
        JOIN c.certificationCategory cc
        WHERE uc.user.id = :userId
    """)
    List<String> findAllCertificationNamesByUserId(@Param("userId") Long userId);
}
