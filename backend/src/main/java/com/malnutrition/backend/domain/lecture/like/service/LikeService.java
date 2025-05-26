package com.malnutrition.backend.domain.lecture.like.service;

import com.malnutrition.backend.domain.lecture.lecture.repository.LectureRepository;
import com.malnutrition.backend.domain.lecture.like.controller.LikeController;
import com.malnutrition.backend.domain.lecture.like.dto.LikeResponseDto;
import com.malnutrition.backend.domain.lecture.like.entity.Like;
import com.malnutrition.backend.domain.lecture.like.repository.LikeRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rp.ApiResponse;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final Rq rq;
    private final LikeRepository likeRepository;
    //조회
    @Transactional(readOnly = true)
    public double getLikeAverageScore(Long lectureId){
        Double likeAverage = likeRepository.findAverageScoreByLectureId(lectureId);
        if (likeAverage == null) return 0.0;
        return likeAverage;
    }

    //업데이트
    @Transactional
    public double updateLikeScore(Long lectureId,int score){
        Long actorId = rq.getActor().getId();
        Like like = likeRepository.findByLectureUser_Lecture_IdAndLectureUser_User_Id(lectureId, actorId)
                .orElseThrow(() -> new IllegalArgumentException("lectureId, userId 중 잘못된 id 가 있습니다."));
        like.setScore(score);
        Double likeAverage = likeRepository.findAverageScoreByLectureId(lectureId);
        if (likeAverage == null) return 0.0;
        return likeAverage;
    }


}