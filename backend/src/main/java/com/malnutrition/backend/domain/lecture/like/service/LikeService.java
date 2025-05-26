package com.malnutrition.backend.domain.lecture.like.service;

import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.lecture.repository.LectureRepository;
import com.malnutrition.backend.domain.lecture.lectureuser.entity.LectureUser;
import com.malnutrition.backend.domain.lecture.lectureuser.repository.LectureUserRepository;
import com.malnutrition.backend.domain.lecture.like.entity.Like;
import com.malnutrition.backend.domain.lecture.like.repository.LikeRepository;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final Rq rq;
    private final LikeRepository likeRepository;
    private final LectureUserRepository lectureUserRepository;
    private final LectureRepository lectureRepository;
    //조회
    @Transactional(readOnly = true)
    public double getLikeAverageScore(Long lectureId){
        Double likeAverage = likeRepository.findAverageScoreByLectureId(lectureId);
        if (likeAverage == null) return 0.0;
        return likeAverage;
    }



    //업데이트
    @Transactional
    public double saveOrUpdateLikeScore(Long lectureId, int score){
        Long actorId = rq.getActor().getId();
        Optional<Like> optionalLike= likeRepository.findByLectureUser_Lecture_IdAndLectureUser_User_Id(lectureId, actorId);

        if(optionalLike.isEmpty()){
            LectureUser lectureUser = lectureUserRepository.findByUserIdAndLectureId(actorId, lectureId).orElseThrow(() -> new IllegalArgumentException("수강신청을 하지 않았습니다."));
            Like like = Like.builder()
                    .lectureUser(lectureUser)
                    .score(score)
                    .build();
            likeRepository.save(like);
        } else {
            Like like = optionalLike.get();
            like.setScore(score);
        }

        Double likeAverage = likeRepository.findAverageScoreByLectureId(lectureId);
        if (likeAverage == null) return 0.0;
        return likeAverage;
    }

    @Transactional(readOnly = true)
    public double getOverallAverageScoreForTrainer(Long trainerId) {
        List<Lecture> lectures = lectureRepository.findByTrainerId(trainerId);

        List<Double> averages = lectures.stream()
                .map(lecture -> likeRepository.findAverageScoreByLectureId(lecture.getId()))
                .filter(Objects::nonNull)
                .toList();

        if (averages.isEmpty()) return 0.0;

        double total = averages.stream().mapToDouble(Double::doubleValue).sum();
        return total / averages.size();
    }






}

