package com.malnutrition.backend.domain.machine.machineExerciseSheet.repository;

import com.malnutrition.backend.domain.machine.machineExerciseSheet.entity.MachineExerciseSheet;
import com.malnutrition.backend.domain.user.exercisesheet.entity.ExerciseSheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MachineExerciseSheetRepository extends JpaRepository<MachineExerciseSheet, Long> {

    @Query("SELECT mes FROM MachineExerciseSheet mes " +
            "JOIN FETCH mes.machine m " +
            "WHERE m.id = :machineId")
    List<MachineExerciseSheet> findByMachineId(@Param("machineId") Long machineId);

    @Query("SELECT mes FROM MachineExerciseSheet mes " +
            "JOIN FETCH mes.exerciseSheet es " +
            "WHERE es = :exerciseSheet")
    List<MachineExerciseSheet> findByExerciseSheet(@Param("exerciseSheet") ExerciseSheet exerciseSheet);
}
