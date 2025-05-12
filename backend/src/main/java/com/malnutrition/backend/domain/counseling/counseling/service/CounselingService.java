package com.malnutrition.backend.domain.counseling.counseling.service;

import com.malnutrition.backend.domain.counseling.counseling.dto.CounselingDto;
import com.malnutrition.backend.domain.counseling.counseling.entity.Counseling;
import com.malnutrition.backend.domain.counseling.counseling.repository.CounselingRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


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

    @Transactional(readOnly = true)
    public CounselingDto getCounselingById(Long id) {

        Counseling counseling = counselingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 상담지가 존재하지 않습니다."));

        User current = rq.getActor();  // 로그인한 사용자

        boolean isTrainer = counseling.getTrainer().getId().equals(current.getId());
        boolean isTarget  = counseling.getUser().getId().equals(current.getId());

        if (!isTrainer && !isTarget) {
            throw new SecurityException("해당 상담지를 조회할 권한이 없습니다.");
        }

        return CounselingDto.fromEntity(counseling);
    }

    @Transactional(readOnly = true)
    public List<CounselingDto> getCounselingsByUserId(Long userId) {
        User current = rq.getActor();

        // userId 기준으로 상담지 전체 가져오기
        // 조회 대상 유저 확인
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("조회할 수 없는 회원입니다."));

        List<Counseling> counselingList = counselingRepository.findByUserId(userId);

        // 권한 검사: 상담지 리스트 중 하나라도 trainer 또는 user가 일치하지 않으면 예외
        for (Counseling counseling : counselingList) {
            Long trainerId = counseling.getTrainer().getId();
            Long targetUserId = counseling.getUser().getId();

            if (!current.getId().equals(trainerId) && !current.getId().equals(targetUserId)) {
                throw new SecurityException("해당 유저의 상담지를 조회할 권한이 없습니다.");
            }
        }

        return counselingList.stream()
                .map(CounselingDto::fromEntity)
                .toList();
    }

    @Transactional
    public void deleteCounseling(Long counselingId) {
        User current = rq.getActor();

        Counseling counseling = counselingRepository.findById(counselingId)
                .orElseThrow(() -> new IllegalArgumentException("해당 상담지를 찾을 수 없습니다."));

        if (!counseling.getTrainer().getId().equals(current.getId())) {
            throw new SecurityException("해당 상담지를 삭제할 권한이 없습니다.");
        }

        counselingRepository.delete(counseling);
    }


}
