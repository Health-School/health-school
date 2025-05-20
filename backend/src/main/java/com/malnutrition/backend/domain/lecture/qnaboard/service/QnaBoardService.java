package com.malnutrition.backend.domain.lecture.qnaboard.service;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
//import com.malnutrition.backend.domain.lecture.lecture.repository.LectureRepository;
import com.malnutrition.backend.domain.lecture.lecture.repository.LectureRepository;
import com.malnutrition.backend.domain.lecture.qnaboard.dto.LectureQnaGroupDto;
import com.malnutrition.backend.domain.lecture.qnaboard.dto.QnaBoardRequestDto;
import com.malnutrition.backend.domain.lecture.qnaboard.dto.QnaBoardResponseDto;
import com.malnutrition.backend.domain.lecture.qnaboard.entity.QnaBoard;
import com.malnutrition.backend.domain.lecture.qnaboard.repository.QnaBoardRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import com.malnutrition.backend.global.rp.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QnaBoardService {

    private final QnaBoardRepository qnaBoardRepository;
    private final LectureRepository lectureRepository; // 어떤 강의의 Q&A 인지 알아야하니까
    private final UserRepository userRepository; //누가 작성한지도 알아야하니까

    // 1. 질문 등록
    @Transactional
    public ApiResponse<QnaBoardResponseDto> createQna(Long userId, QnaBoardRequestDto requestDto) {
        Lecture lecture = lectureRepository.findById(requestDto.getLectureId())
                .orElseThrow(() -> new IllegalArgumentException("해당 강의가 존재하지 않습니다."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 존재하지 않습니다."));

        QnaBoard qnaBoard = QnaBoard.builder()
                .title(requestDto.getTitle())
                .content(requestDto.getContent())
                .lecture(lecture)
                .user(user)
                .openStatus(requestDto.getOpenStatus())
                .build();

        QnaBoard savedQna = qnaBoardRepository.save(qnaBoard);

        return ApiResponse.success(toResponseDto(savedQna), "Q&A 질문이 등록되었습니다.");
    }

    // 2. 질문 단일 조회
    @Transactional(readOnly = true)
    public ApiResponse<QnaBoardResponseDto> getQna(Long qnaId) {
        QnaBoard qna = qnaBoardRepository.findById(qnaId)
                .orElseThrow(() -> new IllegalArgumentException("Q&A 게시글이 존재하지 않습니다."));
        return ApiResponse.success(toResponseDto(qna), "Q&A 질문이 조회되었습니다.");
    }

    // 3. 전체 질문 조회
    @Transactional(readOnly = true)
    public ApiResponse<List<QnaBoardResponseDto>> getAllQnas() {
        List<QnaBoard> qnaList = qnaBoardRepository.findAll();
        List<QnaBoardResponseDto> responseList = qnaList.stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
        return ApiResponse.success(responseList, "전체 Q&A 게시글 조회 성공");
    }

    // 4. 질문 수정
    @Transactional
    public ApiResponse<QnaBoardResponseDto> updateQna(Long qnaId, QnaBoardRequestDto requestDto) {
        QnaBoard qna = qnaBoardRepository.findById(qnaId)
                .orElseThrow(() -> new IllegalArgumentException("Q&A 게시글이 존재하지 않습니다."));

        // 강의도 변경 가능하도록 처리
//        Lecture lecture = lectureRepository.findById(requestDto.getLectureId())
//                .orElseThrow(() -> new IllegalArgumentException("해당 강의가 존재하지 않습니다."));

        qna.setTitle(requestDto.getTitle());
        qna.setContent(requestDto.getContent());
//        qna.setLecture(lecture);
        qna.setOpenStatus(requestDto.getOpenStatus());

        return ApiResponse.success(toResponseDto(qna), "Q&A 질문이 수정되었습니다.");
    }

    // 5. 질문 삭제
    @Transactional
    public ApiResponse<Void> deleteQna(Long qnaId) {
        QnaBoard qna = qnaBoardRepository.findById(qnaId)
                .orElseThrow(() -> new IllegalArgumentException("Q&A 게시글이 존재하지 않습니다."));
        qnaBoardRepository.delete(qna);
        return ApiResponse.success(null, "Q&A 질문이 삭제되었습니다.");
    }

    // 🔄 공통 변환 메서드
    private QnaBoardResponseDto toResponseDto(QnaBoard qna) {
        return QnaBoardResponseDto.builder()
                .id(qna.getId())
                .title(qna.getTitle())
                .content(qna.getContent())
                .lectureId(qna.getLecture().getId())
                .lectureTitle(qna.getLecture().getTitle())
//                .userId(qna.getUser().getId())
//                .username(qna.getUser().getUsername())
                .openStatus(qna.getOpenStatus())
                .createdDate(qna.getCreatedDate())
                .updatedDate(qna.getUpdatedDate())
                .build();
    }

    @Transactional
    public Page<QnaBoardResponseDto> getQnaBoardsByTrainer(Long trainerId, Pageable pageable) {
        return qnaBoardRepository.findAllByTrainerId(trainerId, pageable)
                .map(QnaBoardResponseDto::from);
    }

    @Transactional
    public Page<QnaBoardResponseDto> getQnaByLectureId(Long lectureId, Long trainerId, Pageable pageable) {
        Page<QnaBoard> qnaBoards = qnaBoardRepository.findByLectureIdAndTrainerId(lectureId, trainerId, pageable);
        return qnaBoards.map(QnaBoardResponseDto::from);
    }
}
