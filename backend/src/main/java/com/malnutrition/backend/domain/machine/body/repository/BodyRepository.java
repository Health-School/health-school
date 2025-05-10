package com.malnutrition.backend.domain.machine.body.repository;

import com.malnutrition.backend.domain.machine.body.entity.Body;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BodyRepository extends JpaRepository<Body, Long> {
    boolean existsByName(String name);
}
