package com.malnutrition.backend.domain.machine.machine.repository;

import com.malnutrition.backend.domain.machine.machine.entity.Machine;
import org.hibernate.type.descriptor.converter.spi.JpaAttributeConverter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MachineRepository extends JpaRepository<Machine, Long> {
    List<Machine> findByApprovedTrue();
}
