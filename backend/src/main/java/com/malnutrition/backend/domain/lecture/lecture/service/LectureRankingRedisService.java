package com.malnutrition.backend.domain.lecture.lecture.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LectureRankingRedisService {

    private final StringRedisTemplate redisTemplate;
    private static final Duration EXPIRE_DURATION = Duration.ofHours(24);

    // 🔥 ZSet 키: hot_lecture:2025-05-26
    private String getTodayKey() {
        LocalDate today = LocalDate.now();
        return "hot_lecture:" + today;
    }

    public void incrementLectureScore(Long lectureId) {
        String key = getTodayKey();

        // 점수 증가
        redisTemplate.opsForZSet().incrementScore(key, String.valueOf(lectureId), 1);

        // TTL 설정: 아직 expire 설정 안 되어 있으면 설정
        Long expire = redisTemplate.getExpire(key);
        if (expire == null || expire == -1L) {
            redisTemplate.expire(key, Duration.ofHours(24));
        }
    }

    public List<Long> getTop4LecturesToday() {
        String key = getTodayKey();
        Set<String> topLectureIds = redisTemplate.opsForZSet().reverseRange(key, 0, 3);
        if (topLectureIds == null) return Collections.emptyList();
        return topLectureIds.stream().map(Long::valueOf).collect(Collectors.toList());
    }
}