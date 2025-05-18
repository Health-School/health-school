package com.malnutrition.backend.domain.certification.category.repository;

import com.malnutrition.backend.domain.certification.category.entitiy.CertificationCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CertificationCategoryRepository extends JpaRepository<CertificationCategory, Long>{

    Optional<CertificationCategory> findByName(String name);

}
