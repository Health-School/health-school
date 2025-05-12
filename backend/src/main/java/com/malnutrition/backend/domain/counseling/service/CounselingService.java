package com.malnutrition.backend.domain.counseling.service;

import com.malnutrition.backend.domain.counseling.dto.CounselingDto;
import com.malnutrition.backend.domain.counseling.entity.Counseling;
import com.malnutrition.backend.domain.counseling.repository.CounselingRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@RequiredArgsConstructor
@Service
public class CounselingService {
    private final CounselingRepository counselingRepository;
    private final UserRepository userRepository;
    private final Rq rq;

    private void checkTrainer(User user) {
        if (!user.getRole().name().equals("TRAINER")) {
            throw new SecurityException("트레이너 권한이 필요합니다.");
        }
    }

    @Transactional
    public CounselingDto createCounseling(CounselingDto dto) {
        User trainer = rq.getActor(); // 현재 로그인한 사용자
        checkTrainer(trainer);

        User targetUser = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("상담 대상 사용자가 존재하지 않습니다."));

        Counseling counseling = Counseling.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .type(dto.getType())
                .user(targetUser)
                .trainer(trainer)
                .build();

        counselingRepository.save(counseling);

        return CounselingDto.fromEntity(counseling);
    }

    @Transactional
    public CounselingDto updateCounseling(Long id, CounselingDto dto) {
        User currentUser = rq.getActor();

        Counseling counseling = counselingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 상담지가 존재하지 않습니다."));

        if (!counseling.getTrainer().getId().equals(currentUser.getId())) {
            throw new SecurityException("본인이 작성한 상담지만 수정할 수 있습니다.");
        }

        counseling.setTitle(dto.getTitle());
        counseling.setContent(dto.getContent());
        counseling.setType(dto.getType());

        return CounselingDto.fromEntity(counseling);
    }

}
