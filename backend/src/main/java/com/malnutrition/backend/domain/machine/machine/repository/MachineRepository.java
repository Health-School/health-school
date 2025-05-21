package com.malnutrition.backend.domain.machine.machine.repository;

import com.malnutrition.backend.domain.machine.machine.entity.Machine;
import com.malnutrition.backend.domain.machine.machinetype.entity.MachineType;
import org.hibernate.type.descriptor.converter.spi.JpaAttributeConverter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MachineRepository extends JpaRepository<Machine, Long> {
    List<Machine> findByApprovedTrue();
    Optional<Machine> findByIdAndApprovedTrue(Long id);

    // 신체 부위(body)로 검색 (join 필요)
    Page<Machine> findAllByMachineBodiesBodyId(Long bodyId, Pageable pageable);

    Page<Machine> findAllByMachineTypeId(Long machineTypeId, Pageable pageable);

    // 둘 다 조건으로 검색하는 메서드 예시 (필요하면)
    Page<Machine> findAllByMachineBodiesBodyIdAndMachineTypeId(Long bodyId, Long machineTypeId, Pageable pageable);
}

