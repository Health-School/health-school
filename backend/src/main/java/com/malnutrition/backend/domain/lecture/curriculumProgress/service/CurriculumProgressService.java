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

    @Transactional
    public void startProgress(Long userId, Long curriculumId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자 입니다."));
        Curriculum curriculum = curriculumRepository.findById(curriculumId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강의 입니다."));

        // 지도 기록이 있는지 확인하고 없으면 새로 시작하게 하기
        CurriculumProgress progress = curriculumProgressRepository.findByUserIdAndCurriculumId(userId, curriculumId)
                .orElse(null);
        if (progress == null) {
            progress = CurriculumProgress.builder()
                    .user(user)
                    .curriculum(curriculum)
                    .status(ProgressStatus.KeepGoing)
                    .progressRate(0)
                    .build();

            curriculumProgressRepository.save(progress);
        }
    }

    @Transactional
    public void updateProgress(Long userId, Long curriculumId, int progressRate, int lastWatchedSecond) {
        CurriculumProgress progress = curriculumProgressRepository.findByUserIdAndCurriculumId(userId, curriculumId)
                .orElseThrow(() -> new IllegalArgumentException(""));

        progress.setProgressRate(progressRate);
        progress.setLastWatchedSecond(lastWatchedSecond);
        progress.setLastWatchedAt(java.time.LocalDateTime.now());

        if (progressRate >= 90 && progress.getStatus() != ProgressStatus.COMPLETED) {
            progress.setStatus(ProgressStatus.COMPLETED);
            progress.setCompletedAt(java.time.LocalDateTime.now());
        }
        curriculumProgressRepository.save(progress);
    }



}
