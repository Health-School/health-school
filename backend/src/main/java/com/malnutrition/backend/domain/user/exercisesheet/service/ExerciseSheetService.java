package com.malnutrition.backend.domain.user.exercisesheet.service;

import com.malnutrition.backend.domain.machine.machine.entity.Machine;
import com.malnutrition.backend.domain.machine.machine.repository.MachineRepository;
import com.malnutrition.backend.domain.machine.machineExerciseSheet.entity.MachineExerciseSheet;
import com.malnutrition.backend.domain.machine.machineExerciseSheet.repository.MachineExerciseSheetRepository;
import com.malnutrition.backend.domain.user.exercisesheet.dto.ExerciseSheetCreateDto;
import com.malnutrition.backend.domain.user.exercisesheet.dto.ExerciseSheetResponseDto;
import com.malnutrition.backend.domain.user.exercisesheet.dto.MachineExerciseSheetCreateDto;
import com.malnutrition.backend.domain.user.exercisesheet.dto.MachineExerciseSheetResponseDto;
import com.malnutrition.backend.domain.user.exercisesheet.entity.ExerciseSheet;
import com.malnutrition.backend.domain.user.exercisesheet.repository.ExerciseSheetRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExerciseSheetService {

    private final ExerciseSheetRepository exerciseSheetRepository;
    private final UserRepository userRepository;
    private final MachineRepository machineRepository;
    private final MachineExerciseSheetRepository machineExerciseSheetRepository;
    private final Rq rq;  // 로그인한 사용자 정보

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

    @Transactional
    public ExerciseSheet getExerciseSheetById(Long id, Long userId) {
        return exerciseSheetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 운동 기록을 찾을 수 없습니다."));
    }

    @Transactional(readOnly = true)
    public List<ExerciseSheetResponseDto> getExerciseSheetsByUserAndDateDesc(Long userId, LocalDate exerciseDate) {
        List<ExerciseSheet> sheets = exerciseSheetRepository.findByUserIdAndExerciseDateDesc(userId, exerciseDate);

        return sheets.stream().map(sheet -> {
            List<MachineExerciseSheetResponseDto> machineDtos = sheet.getMachineExerciseSheets().stream()
                    .map(mes -> new MachineExerciseSheetResponseDto(
                            mes.getMachine().getName(),
                            mes.getReps(),
                            mes.getSets(),
                            mes.getWeight()
                    )).toList();

            return new ExerciseSheetResponseDto(
                    sheet.getExerciseDate(),
                    sheet.getExerciseStartTime(),
                    sheet.getExerciseEndTime(),
                    machineDtos
            );
        }).toList();
    }

}
