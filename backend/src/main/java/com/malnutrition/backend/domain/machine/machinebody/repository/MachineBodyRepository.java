package com.malnutrition.backend.domain.machine.machinebody.repository;

import com.malnutrition.backend.domain.machine.machine.entity.Machine;
import com.malnutrition.backend.domain.machine.machinebody.entity.MachineBody;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface MachineBodyRepository extends JpaRepository<MachineBody, Long> {
    void deleteAllByMachine(Machine machine);
}
