package com.malnutrition.backend.domain.lecture.curriculumProgress.service;

import com.malnutrition.backend.domain.lecture.curriculum.entity.Curriculum;
import com.malnutrition.backend.domain.lecture.curriculum.repository.CurriculumRepository;
import com.malnutrition.backend.domain.lecture.curriculumProgress.dto.CurriculumProgressRequestDto;
import com.malnutrition.backend.domain.lecture.curriculumProgress.entity.CurriculumProgress;
import com.malnutrition.backend.domain.lecture.curriculumProgress.enums.ProgressStatus;
import com.malnutrition.backend.domain.lecture.curriculumProgress.repository.CurriculumProgressRepository;
import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.lecture.service.LectureService;
import com.malnutrition.backend.domain.lecture.lectureuser.entity.LectureUser;
import com.malnutrition.backend.domain.lecture.lectureuser.enums.CompletionStatus;
import com.malnutrition.backend.domain.lecture.lectureuser.repository.LectureUserRepository;
import com.malnutrition.backend.domain.lecture.lectureuser.service.LectureUserService;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
@Slf4j
public class CurriculumProgressService {
    private final CurriculumProgressRepository curriculumProgressRepository;
    private final CurriculumRepository curriculumRepository;
    private final LectureUserRepository lectureUserRepository;
    private final LectureService lectureService;
    private final Rq rq;


    @Transactional
    public void updateOrCreateProgress( Long curriculumId, CurriculumProgressRequestDto dto) {
        User actor = rq.getActor();

        CurriculumProgress progress = curriculumProgressRepository.findByUserIdAndCurriculumId(actor.getId(), curriculumId)
                .orElse(null);
        if (progress == null) {
            createProgress(dto.getLectureId(),curriculumId, actor);
        }
        else {
            updateProgress(dto, progress, actor.getId());
        }

    }

    private void updateProgress(CurriculumProgressRequestDto dto, CurriculumProgress progress, Long userId) {

        Integer totalWatchedSeconds = dto.getTotalWatchedSeconds();
        Integer duration = dto.getDuration();
        Integer lastWatchedSecond = dto.getLastWatchedSecond();
        progress.setTotalWatchedSeconds(totalWatchedSeconds);
        progress.setLastWatchedSecond(lastWatchedSecond);
        progress.setLastWatchedAt(java.time.LocalDateTime.now());
        int watchRate = (int) ((double) totalWatchedSeconds / duration * 100);
//        log.info("lecture id {}", progress.getLecture().getId());
        if (watchRate >= 90 && progress.getStatus() != ProgressStatus.COMPLETED) {
            progress.setStatus(ProgressStatus.COMPLETED);
            // 전체 강의 상태 알아 보기
            Lecture lecture = progress.getLecture();
            Long lectureId = lecture.getId();
            // userId와 lectureId 기준으로 COMPLETED가 아닌 수강 기록이 있는지 확인
            boolean hasIncomplete = curriculumProgressRepository
                    .existsByUserIdAndLectureIdAndStatusNot(userId, lectureId, ProgressStatus.COMPLETED);
            // 커리큘럼 개수와 현재 강의 개수가 같은지 확인해야 함
            if(!hasIncomplete){
                int curriculumCount = curriculumRepository.countByLecture(lecture);
                long curriculumProgressCount = curriculumProgressRepository.countByUserIdAndLectureId(userId, lectureId);
                if(curriculumCount == curriculumProgressCount ){
                    LectureUser lectureUser = lectureUserRepository
                            .findByUserIdAndLectureId(userId, lectureId)
                            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강의입니다."));
                    lectureUser.setCompletionStatus(CompletionStatus.COMPLETED);
                }

            }

        }
        curriculumProgressRepository.save(progress);
    }


    private void createProgress(Long lectureId,Long curriculumId, User actor) {
        CurriculumProgress progress;
        Curriculum curriculum = curriculumRepository.findById(curriculumId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 커리큘럼 입니다."));
        Lecture lecture = lectureService.findLectureById(lectureId);
        progress = CurriculumProgress.builder()
                .user(actor)
                .curriculum(curriculum)
                .lecture(lecture)
                .status(ProgressStatus.KeepGoing)
                .build();
        curriculumProgressRepository.save(progress);
    }
}
