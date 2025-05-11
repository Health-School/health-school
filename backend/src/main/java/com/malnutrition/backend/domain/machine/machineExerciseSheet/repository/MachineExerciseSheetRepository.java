package com.malnutrition.backend.domain.machine.machineExerciseSheet.repository;

import com.malnutrition.backend.domain.machine.machineExerciseSheet.entity.MachineExerciseSheet;
import com.malnutrition.backend.domain.user.exercisesheet.entity.ExerciseSheet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MachineExerciseSheetRepository extends JpaRepository<MachineExerciseSheet, Long> {
    List<MachineExerciseSheet> findByMachineId(Long machineId);
    List<MachineExerciseSheet> findByExerciseSheet(ExerciseSheet exerciseSheet);
}
