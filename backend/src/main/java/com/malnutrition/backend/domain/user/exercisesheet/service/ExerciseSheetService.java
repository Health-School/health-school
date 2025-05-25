package com.malnutrition.backend.domain.user.exercisesheet.service;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.lecture.repository.LectureRepository;
import com.malnutrition.backend.domain.lecture.lectureuser.repository.LectureUserRepository;
import com.malnutrition.backend.domain.machine.machine.entity.Machine;
import com.malnutrition.backend.domain.machine.machine.repository.MachineRepository;
import com.malnutrition.backend.domain.machine.machineExerciseSheet.entity.MachineExerciseSheet;
import com.malnutrition.backend.domain.machine.machineExerciseSheet.repository.MachineExerciseSheetRepository;
import com.malnutrition.backend.domain.user.exercisesheet.dto.*;
import com.malnutrition.backend.domain.user.exercisesheet.entity.ExerciseSheet;
import com.malnutrition.backend.domain.user.exercisesheet.repository.ExerciseSheetRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExerciseSheetService {

    private final ExerciseSheetRepository exerciseSheetRepository;
    private final UserRepository userRepository;
    private final MachineRepository machineRepository;
    private final MachineExerciseSheetRepository machineExerciseSheetRepository;
    private final LectureRepository lectureRepository;
    private final LectureUserRepository lectureUserRepository;
    private final Rq rq;  // 로그인한 사용자 정보

    @Transactional
    public ExerciseSheetResponseDto createFullExerciseSheet(ExerciseSheetCreateDto dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        // 운동 기록지 생성
        ExerciseSheet sheet = ExerciseSheet.builder()
                .user(user)
                .exerciseDate(dto.getExerciseDate())
                .exerciseStartTime(dto.getExerciseStartTime())
                .exerciseEndTime(dto.getExerciseEndTime())
                .build();

        exerciseSheetRepository.save(sheet);

        List<MachineExerciseSheetResponseDto> machineDtos = new ArrayList<>();

        for (MachineExerciseSheetCreateDto m : dto.getMachineExercises()) {
            Machine machine = machineRepository.findById(m.getMachineId())
                    .orElseThrow(() -> new IllegalArgumentException("해당 운동기구가 존재하지 않습니다."));

            if (!machine.isApproved()) {
                throw new IllegalArgumentException("승인되지 않은 운동기구는 등록할 수 없습니다.");
            }

            MachineExerciseSheet mes = MachineExerciseSheet.builder()
                    .exerciseSheet(sheet)
                    .machine(machine)
                    .reps(m.getReps())
                    .weight(m.getWeight())
                    .sets(m.getSets())
                    .build();

            machineExerciseSheetRepository.save(mes);

            // 응답 DTO 생성
            MachineExerciseSheetResponseDto machineDto = new MachineExerciseSheetResponseDto(
                    mes.getId(),
                    user.getId(),
                    user.getNickname(),  // 또는 user.getUsername(), getName() 등
                    machine.getName(),
                    mes.getReps(),
                    mes.getSets(),
                    mes.getWeight()
            );
            machineDtos.add(machineDto);
        }

        return new ExerciseSheetResponseDto(
                sheet.getId(),
                sheet.getExerciseDate(),
                sheet.getExerciseStartTime(),
                sheet.getExerciseEndTime(),
                machineDtos
        );
    }



    @Transactional(readOnly = true)
    public ExerciseSheetResponseDto getExerciseSheetById(Long id, Long userId) {
        ExerciseSheet sheet = exerciseSheetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 운동 기록을 찾을 수 없습니다."));

        List<MachineExerciseSheetResponseDto> machineDtos = sheet.getMachineExerciseSheets().stream()
                .map(mes -> new MachineExerciseSheetResponseDto(
                        mes.getId(),
                        mes.getExerciseSheet().getUser().getId(),
                        mes.getExerciseSheet().getUser().getNickname(),
                        mes.getMachine().getName(),
                        mes.getReps(),
                        mes.getSets(),
                        mes.getWeight()
                ))
                .collect(Collectors.toList());

        return new ExerciseSheetResponseDto(
                sheet.getId(),
                sheet.getExerciseDate(),
                sheet.getExerciseStartTime(),
                sheet.getExerciseEndTime(),
                machineDtos
        );
    }


    @Transactional(readOnly = true)
    public List<ExerciseSheetResponseDto> getExerciseSheetsByUserAndDateDesc(Long userId, LocalDate exerciseDate) {
        List<ExerciseSheet> sheets = exerciseSheetRepository.findByUserIdAndExerciseDateDesc(userId, exerciseDate);

        return sheets.stream().map(sheet -> {
            List<MachineExerciseSheetResponseDto> machineDtos = sheet.getMachineExerciseSheets().stream()
                    .map(mes -> new MachineExerciseSheetResponseDto(
                            mes.getId(),
                            mes.getExerciseSheet().getUser().getId(),
                            mes.getExerciseSheet().getUser().getNickname(),
                            mes.getMachine().getName(),
                            mes.getReps(),
                            mes.getSets(),
                            mes.getWeight()
                    )).toList();

            return new ExerciseSheetResponseDto(
                    sheet.getId(),
                    sheet.getExerciseDate(),
                    sheet.getExerciseStartTime(),
                    sheet.getExerciseEndTime(),
                    machineDtos
            );
        }).toList();
    }

    @Transactional
    public ExerciseSheetResponseDto updateExerciseSheet(Long sheetId, ExerciseSheetCreateDto dto, Long userId) {
        ExerciseSheet sheet = exerciseSheetRepository.findById(sheetId)
                .orElseThrow(() -> new IllegalArgumentException("운동 기록을 찾을 수 없습니다."));

        if (!sheet.getUser().getId().equals(userId)) {
            throw new SecurityException("수정 권한이 없습니다.");
        }

        sheet.setExerciseDate(dto.getExerciseDate());
        sheet.setExerciseStartTime(dto.getExerciseStartTime());
        sheet.setExerciseEndTime(dto.getExerciseEndTime());

        // 기존 연관관계 제거
        sheet.getMachineExerciseSheets().clear();

        // 새 연관관계 설정
        List<MachineExerciseSheet> newMachineExercises = (List<MachineExerciseSheet>) dto.getMachineExercises().stream().map(m -> {
            Machine machine = machineRepository.findById(m.getMachineId())
                    .orElseThrow(() -> new IllegalArgumentException("운동 기구를 찾을 수 없습니다."));
            return MachineExerciseSheet.builder()
                    .exerciseSheet(sheet)
                    .machine(machine)
                    .reps(m.getReps())
                    .sets(m.getSets())
                    .weight(m.getWeight())
                    .build();
        }).toList();

        sheet.getMachineExerciseSheets().addAll(newMachineExercises);

        // 자동 cascade로 저장됨

        List<MachineExerciseSheetResponseDto> machineDtos = newMachineExercises.stream().map(mes ->
                new MachineExerciseSheetResponseDto(
                        mes.getId(),
                        mes.getExerciseSheet().getUser().getId(),
                        mes.getExerciseSheet().getUser().getNickname(),
                        mes.getMachine().getName(),
                        mes.getReps(),
                        mes.getSets(),
                        mes.getWeight()
                )).toList();

        return new ExerciseSheetResponseDto(
                sheet.getId(),
                sheet.getExerciseDate(),
                sheet.getExerciseStartTime(),
                sheet.getExerciseEndTime(),
                machineDtos
        );
    }

    @Transactional
    public void deleteExerciseSheet(Long sheetId, Long userId) {
        ExerciseSheet sheet = exerciseSheetRepository.findById(sheetId)
                .orElseThrow(() -> new IllegalArgumentException("운동 기록을 찾을 수 없습니다."));

        if (!sheet.getUser().getId().equals(userId)) {
            throw new SecurityException("삭제 권한이 없습니다.");
        }

        // 연관된 MachineExerciseSheet가 orphanRemoval=true 이면, 아래 한 줄로 삭제 가능
        exerciseSheetRepository.delete(sheet);
    }

    @Transactional(readOnly = true)
    public List<ExerciseSheetResponseDto> getAllExerciseSheetsByUser(Long userId) {
        List<ExerciseSheet> sheets = exerciseSheetRepository.findAllByUserIdOrderByExerciseDateDesc(userId);

        return sheets.stream()
                .map(sheet -> {
                    List<MachineExerciseSheetResponseDto> machineDtos = sheet.getMachineExerciseSheets().stream()
                            .map(mes -> new MachineExerciseSheetResponseDto(
                                    mes.getId(),
                                    mes.getExerciseSheet().getUser().getId(),
                                    mes.getExerciseSheet().getUser().getNickname(),
                                    mes.getMachine().getName(),
                                    mes.getReps(),
                                    mes.getSets(),
                                    mes.getWeight()
                            ))
                            .collect(Collectors.toList());

                    return new ExerciseSheetResponseDto(
                            sheet.getId(),
                            sheet.getExerciseDate(),
                            sheet.getExerciseStartTime(),
                            sheet.getExerciseEndTime(),
                            machineDtos
                    );
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ExerciseSheetRespDto> getAllStudentsExerciseSheets(Long trainerId, Pageable pageable) {
        // 1. 트레이너가 개설한 강의 목록
        List<Long> lectureIds = lectureRepository.findByTrainerId(trainerId)
                .stream().map(Lecture::getId).toList();

        if (lectureIds.isEmpty()) {
            return Page.empty(); // 강의가 없으면 빈 페이지 반환
        }

        // 2. 그 강의를 수강 중인 수강생 ID 목록 (중복 제거)
        List<Long> studentIds = lectureUserRepository.findByLectureIdIn(lectureIds)
                .stream().map(lectureUser -> lectureUser.getUser().getId())
                .distinct()
                .toList();

        if (studentIds.isEmpty()) {
            return Page.empty(); // 수강생 없으면 빈 페이지 반환
        }

        // 3. EntityGraph를 사용해 연관 엔티티를 모두 미리 로딩 + 페이징 적용
        Page<ExerciseSheet> sheets = exerciseSheetRepository.findByUserIdsWithAll(studentIds, pageable);

        // 4. DTO 변환
        Page<ExerciseSheetRespDto> dtoPage = sheets.map(ExerciseSheetRespDto::from);

        return dtoPage;
    }



    @Transactional(readOnly = true)
    public ExerciseSheet getExerciseSheetById(Long id) {
        return exerciseSheetRepository.findById(id)
                .orElse(null);
    }




}
