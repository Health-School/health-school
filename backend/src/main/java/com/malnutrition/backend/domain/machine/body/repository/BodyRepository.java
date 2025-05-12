package com.malnutrition.backend.domain.machine.body.repository;

import com.malnutrition.backend.domain.machine.body.entity.Body;
import com.malnutrition.backend.domain.machine.machinetype.entity.MachineType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BodyRepository extends JpaRepository<Body, Long> {
    boolean existsByName(String name);
    Optional<Body> findByName(String name);
}
