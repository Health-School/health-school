package com.malnutrition.backend.domain.alarm.alarm.repository.emitterRepository;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

public interface EmitterRepository {
    SseEmitter save(String emitterId, SseEmitter sseEmitter);
    void saveEventCache(String eventCacheId, Object event);
    Map<String, SseEmitter> findAllEmitterStartWithByUserId(String memberId);
    Map<String, Object> findAllEventCacheStartWithByUserId(String memberId);
    void deleteById(String id);
    void deleteAllEmitterStartWithId(String memberId);
    void deleteAllEventCacheStartWithId(String memberId);
}
