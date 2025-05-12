package com.malnutrition.backend.domain.machine.machinetype.repository;

import com.malnutrition.backend.domain.machine.machinetype.entity.MachineType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MachineTypeRepository extends JpaRepository<MachineType, Long> {
    boolean existsByName(String name);
    Optional<MachineType> findByName(String name);
}
