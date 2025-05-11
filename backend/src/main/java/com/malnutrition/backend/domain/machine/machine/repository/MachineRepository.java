package com.malnutrition.backend.domain.machine.machine.repository;

import com.malnutrition.backend.domain.machine.machine.entity.Machine;
import org.hibernate.type.descriptor.converter.spi.JpaAttributeConverter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MachineRepository extends JpaRepository<Machine, Long> {
    List<Machine> findByApprovedTrue();
    Optional<Machine> findByIdAndApprovedTrue(Long id);
}
