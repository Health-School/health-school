package com.malnutrition.backend.domain.certification.certification.repository;

import com.malnutrition.backend.domain.certification.certification.entity.Certification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CertificationRepository extends JpaRepository<Certification,Long> {
}
