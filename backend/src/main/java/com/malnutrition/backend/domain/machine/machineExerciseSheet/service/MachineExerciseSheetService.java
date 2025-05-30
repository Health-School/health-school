package com.malnutrition.backend.domain.machine.machineExerciseSheet.service;

import com.malnutrition.backend.domain.machine.machineExerciseSheet.entity.MachineExerciseSheet;
import com.malnutrition.backend.domain.machine.machineExerciseSheet.repository.MachineExerciseSheetRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rq.Rq;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MachineExerciseSheetService {
    private final MachineExerciseSheetRepository machineExerciseSheetRepository;

    public void deleteById(Long id) {
        if (!machineExerciseSheetRepository.existsById(id)) {
            throw new EntityNotFoundException("해당 운동 기록이 존재하지 않습니다.");
        }
        machineExerciseSheetRepository.deleteById(id);
    }


}

