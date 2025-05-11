package com.malnutrition.backend.domain.user.exercisesheet.service;

import com.malnutrition.backend.domain.machine.machine.entity.Machine;
import com.malnutrition.backend.domain.machine.machine.repository.MachineRepository;
import com.malnutrition.backend.domain.machine.machineExerciseSheet.entity.MachineExerciseSheet;
import com.malnutrition.backend.domain.machine.machineExerciseSheet.repository.MachineExerciseSheetRepository;
import com.malnutrition.backend.domain.user.exercisesheet.dto.ExerciseSheetCreateDto;
import com.malnutrition.backend.domain.user.exercisesheet.dto.dto.MachineExerciseSheetCreateDto;
import com.malnutrition.backend.domain.user.exercisesheet.entity.ExerciseSheet;
import com.malnutrition.backend.domain.user.exercisesheet.repository.ExerciseSheetRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExerciseSheetService {
    private final ExerciseSheetRepository exerciseSheetRepository;
    private final UserRepository userRepository;
    private final MachineRepository machineRepository;
    private final MachineExerciseSheetRepository machineExerciseSheetRepository;
    @Transactional
    public ExerciseSheet createFullExerciseSheet(ExerciseSheetCreateDto dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        ExerciseSheet sheet = ExerciseSheet.builder()
                .user(user)
                .exerciseDate(dto.getExerciseDate())
                .exerciseStartTime(dto.getExerciseStartTime())
                .exerciseEndTime(dto.getExerciseEndTime())
                .build();

        exerciseSheetRepository.save(sheet);

        for (MachineExerciseSheetCreateDto m : dto.getMachineExercises()) {
            Machine machine = machineRepository.findById(m.getMachineId())
                    .orElseThrow(() -> new IllegalArgumentException("해당 운동기구가 존재하지 않습니다."));

            MachineExerciseSheet mes = MachineExerciseSheet.builder()
                    .exerciseSheet(sheet)
                    .machine(machine)
                    .reps(m.getReps())
                    .weight(m.getWeight())
                    .sets(m.getSets())
                    .build();

            machineExerciseSheetRepository.save(mes);
        }

        return sheet;
    }
}
