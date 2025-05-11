package com.malnutrition.backend.domain.machine.machinetype.repository;

import com.malnutrition.backend.domain.machine.machinetype.entity.MachineType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MachineTypeRepository extends JpaRepository<MachineType, Long> {
    boolean existsByName(String name);
}
