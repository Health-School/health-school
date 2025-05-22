package com.malnutrition.backend.domain.lecture.curriculum.service;

import com.malnutrition.backend.domain.lecture.curriculum.dto.CurriculumResponseDto;
import com.malnutrition.backend.domain.lecture.curriculum.dto.CurriculumUpdateRequestDto;
import com.malnutrition.backend.domain.lecture.curriculum.entity.Curriculum;
import com.malnutrition.backend.domain.lecture.curriculum.repository.CurriculumRepository;
import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.lecture.enums.LectureStatus;
import com.malnutrition.backend.domain.lecture.lecture.repository.LectureRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CurriculumService {

    private final S3Service s3Service;
    private final CurriculumRepository curriculumRepository;
    private final LectureRepository lectureRepository;
    private final Rq rq;

    private static final long MAX_VIDEO_SIZE = 500L * 1024 * 1024; // 500MB
    private static final String VIDEO_CONTENT_TYPE_PREFIX = "video/";

    // 유효성 검사
    private void validateVideoFile(MultipartFile file) {
        if (!file.getContentType().startsWith(VIDEO_CONTENT_TYPE_PREFIX)) {
            throw new IllegalArgumentException("올바른 영상 파일 형식이 아닙니다.");
        }
        if (file.getSize() > MAX_VIDEO_SIZE) {
            throw new IllegalArgumentException("파일 용량이 너무 큽니다.");
        }
    }

    // 커리큘럼 단건 조회
    @Transactional(readOnly = true)
    public CurriculumResponseDto findDtoById(Long curriculumId) {
        Curriculum curriculum = curriculumRepository.findWithLectureAndUserById(curriculumId)
                .orElseThrow(() -> new IllegalArgumentException("해당 커리큘럼이 없습니다."));

        // 👇 Lazy 로딩 문제 해결을 위한 강제 초기화
        curriculum.getLecture().getTrainer().getNickname();

        return CurriculumResponseDto.from(curriculum);
    }

    @Transactional(readOnly = true)
    public S3Service getS3Service() {
        return this.s3Service;
    }

    // 커리큘럼(영상) 업로드
    @Transactional
    public Curriculum uploadVideo(Long lectureId, MultipartFile file, String title, String content, int sequence) throws IOException {
        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new IllegalArgumentException("해당 강의가 없습니다."));

        if (file != null) {
            validateVideoFile(file);
        }

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        String s3path = "uploads/curriculums/" + fileName;
        s3Service.uploadFile(s3path, file);

        Curriculum curriculum = Curriculum.builder()
                .lecture(lecture)
                .title(title)
                .content(content)
                .sequence(sequence)
                .s3path(s3path)
                .build();

        if (lecture.getLectureStatus() == LectureStatus.PLANNED) {
            lecture.setLectureStatus(LectureStatus.ONGOING);
            lectureRepository.save(lecture);
        }

        try {
            return curriculumRepository.save(curriculum);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalStateException("같은 순서(sequence)의 커리큘럼이 이미 존재합니다.");
        }
    }

    @Transactional
    public Curriculum updateCurriculum(Long curriculumId, CurriculumUpdateRequestDto dto) throws IOException {
        Curriculum curriculum = curriculumRepository.findById(curriculumId)
                .orElseThrow(() -> new IllegalArgumentException("해당 커리큘럼이 없습니다."));

        User actor = rq.getActor();
        if (!curriculum.getLecture().getTrainer().getId().equals(actor.getId())) {
            throw new AccessDeniedException("수정 권한이 없습니다.");
        }

        curriculum.setTitle(dto.getTitle());
        curriculum.setContent(dto.getContent());
        curriculum.setSequence(dto.getSequence());

        MultipartFile file = dto.getNewFile();
        if (file != null && !file.isEmpty()) {
            validateVideoFile(file);

            s3Service.deleteFile(curriculum.getS3path());

            String newFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            String newS3Path = "uploads/curriculums/" + newFileName;
            s3Service.uploadFile(newS3Path, file);

            curriculum.setS3path(newS3Path);
        }

        return curriculumRepository.save(curriculum);
    }

    // 커리큘럼 삭제
    @Transactional
    public void deleteCurriculum(Long curriculumId) {
        Curriculum curriculum = curriculumRepository.findById(curriculumId)
                .orElseThrow(() -> new IllegalArgumentException("해당 커리큘럼이 없습니다."));

        // S3 파일 삭제
        s3Service.deleteFile(curriculum.getS3path());

        // DB에서 삭제
        curriculumRepository.delete(curriculum);
    }
}