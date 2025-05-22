package com.malnutrition.backend.domain.lecture.curriculumProgress.service;

import com.malnutrition.backend.domain.lecture.curriculum.entity.Curriculum;
import com.malnutrition.backend.domain.lecture.curriculum.repository.CurriculumRepository;
import com.malnutrition.backend.domain.lecture.curriculumProgress.entity.CurriculumProgress;
import com.malnutrition.backend.domain.lecture.curriculumProgress.enums.ProgressStatus;
import com.malnutrition.backend.domain.lecture.curriculumProgress.repository.CurriculumProgressRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class CurriculumProgressService {
    private final CurriculumProgressRepository curriculumProgressRepository;
    private final UserRepository userRepository;
    private final CurriculumRepository curriculumRepository;
    private final Rq rq;


    @Transactional
    public void updateProgress( Long curriculumId, int totalWatchedSeconds, int lastWatchedSecond, int duration) {
        User actor = rq.getActor();
        CurriculumProgress progress = curriculumProgressRepository.findByUserIdAndCurriculumId(actor.getId(), curriculumId)
                .orElse(null);

        if (progress == null) {
            createProgress(curriculumId, actor);
        }
        else {
            updateProgress(totalWatchedSeconds, lastWatchedSecond, duration, progress);
        }

    }

    private void updateProgress(int totalWatchedSeconds, int lastWatchedSecond, int duration, CurriculumProgress progress) {
        progress.setTotalWatchedSeconds(totalWatchedSeconds);
        progress.setDuration(duration);
        progress.setLastWatchedSecond(lastWatchedSecond);
        progress.setLastWatchedAt(java.time.LocalDateTime.now());
        int watchRate = (int) ((double) totalWatchedSeconds / duration * 100);
        if (watchRate >= 90 && progress.getStatus() != ProgressStatus.COMPLETED) {
            progress.setStatus(ProgressStatus.COMPLETED);
            progress.setCompletedAt(java.time.LocalDateTime.now());
        }
        curriculumProgressRepository.save(progress);
    }

    private void createProgress(Long curriculumId, User actor) {
        CurriculumProgress progress;
        Curriculum curriculum = curriculumRepository.findById(curriculumId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강의 입니다."));
        progress = CurriculumProgress.builder()
                .user(actor)
                .curriculum(curriculum)
                .status(ProgressStatus.KeepGoing)
                .duration(0)
                .build();
        curriculumProgressRepository.save(progress);
    }


}
