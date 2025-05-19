package com.malnutrition.backend.domain.alarm.alarm.service;

import com.malnutrition.backend.domain.alarm.alarm.dto.AlarmRequestDto;
import com.malnutrition.backend.domain.alarm.alarm.dto.AlarmResponseDto;
import com.malnutrition.backend.domain.alarm.alarm.entity.Alarm;
import com.malnutrition.backend.domain.alarm.alarm.enums.AlarmEventType;
import com.malnutrition.backend.domain.alarm.alarm.repository.alarmRepository.AlarmRepository;
import com.malnutrition.backend.domain.alarm.alarm.repository.emitterRepository.EmitterRepositoryImpl;
import com.malnutrition.backend.domain.user.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlarmService {
    private final Long DEFAULT_TIMEOUT = 60L * 1000L * 60L;
    private final EmitterRepositoryImpl emitterRepository;
    private final AlarmRepository alarmRepository;


    @Transactional
    public void readCheckAll(String userId) {
        Map<String, Object> allEventCacheStartWithByMemberId = emitterRepository.findAllEventCacheStartWithByUserId(userId);
        allEventCacheStartWithByMemberId.forEach( ( id,  value ) -> {
                    Alarm alarm = (Alarm) value;
                    alarm.setIsRead (true);
                    allEventCacheStartWithByMemberId.put(id, alarm);
                }
        );
        List<Alarm> byReceiver_id = alarmRepository.findByListener_Id (Long.valueOf(userId));
        byReceiver_id.forEach( (notifications) -> {
            notifications.setIsRead(true);
        } );
        alarmRepository.saveAll(byReceiver_id);
    }
    @Transactional
    public void readCheck(String userId, Long alarmId) {
        Map<String, Object> allEventCacheStartWithByMemberId = emitterRepository.findAllEventCacheStartWithByUserId(userId);
        allEventCacheStartWithByMemberId.forEach( ( id,  value ) -> {
                    Alarm alarmMessage = (Alarm) value;
                    if( alarmMessage.getId() == alarmId) alarmMessage.setIsRead(true);
                    allEventCacheStartWithByMemberId.put(id, alarmMessage);
                }
        );
        Alarm alarmMessage = alarmRepository.findById(alarmId).orElseThrow(() -> new IllegalArgumentException("alarmId가 존재하지 않습니다."));
        alarmMessage.setIsRead(true);
        alarmRepository.save(alarmMessage);
    }



    public SseEmitter subscribe(Long userId, String lastEventId) {
        String emitterId = makeTimeIncludeId(userId);
        SseEmitter emitter = emitterRepository.save(emitterId, new SseEmitter(DEFAULT_TIMEOUT));

        emitter.onCompletion( () -> emitterRepository.deleteById(emitterId) );
        emitter.onTimeout(() -> emitterRepository.deleteById(emitterId));

        //연결 유지용 더미 이벤트
        Map<String, String> dummyData = new HashMap<>();
        dummyData.put("message", "EventStream Created.");
        dummyData.put("createdAt", LocalDateTime.now().toString());


        //등록 후 SseEmitter 유효시간동안 어느 데이터도 전송되지 않는 다면 503 에러를 발생시키므로 이것에 대한 방지로 더이 이벤트 발생
        sendAlarmMessage(emitter, AlarmEventType.DUMMY,  emitterId, dummyData);

        if (hasLostData(lastEventId)) {
            sendLostData(lastEventId, userId, emitter);
        }else {
            PageRequest pageable = PageRequest.of(0, 15, Sort.by("createdDate").descending());
            List<Alarm> content = alarmRepository.findByListener_Id(userId, pageable).getContent();
            content.forEach( (alarmMessage -> {
                /*if(!alarmMessage.getIsRead())*/ sendAlarmMessage(emitter,AlarmEventType.ALARM , emitterId, AlarmResponseDto.from(alarmMessage));
            }) );
        }
        return emitter;
    }
    private String makeTimeIncludeId(Long userId) {

        return userId + "_" + System.currentTimeMillis();
    }

    private void sendAlarmMessage(SseEmitter emitter, AlarmEventType alarmEventType, String emitterId, Object data) {
        try {
            emitter.send(
                    SseEmitter.event()
                    .id(emitterId)
                    .name(alarmEventType.name())
                    .data(data, MediaType.APPLICATION_JSON));
        } catch (IOException exception) {
            emitterRepository.deleteById(emitterId);
        }
    }


    private boolean hasLostData(String lastEventId) {

        return !lastEventId.isEmpty();
    }
    private void sendLostData(String lastEventId,Long userId, SseEmitter emitter) {
        Map<String, Object> eventCaches = emitterRepository.findAllEventCacheStartWithByUserId(String.valueOf(userId));
        eventCaches.entrySet().stream()
                .filter(entry -> lastEventId.compareTo(entry.getKey()) < 0 )
                .forEach(entry -> sendAlarmMessage(emitter,AlarmEventType.ALARM, entry.getKey(), entry.getValue()));
    }

    @Transactional
    public void send(AlarmRequestDto alarmRequestDto) {
        User listener = alarmRequestDto.getListener();
        String message = alarmRequestDto.getMessage();
        String title = alarmRequestDto.getTitle();
        String url = alarmRequestDto.getUrl();
        log.info("message {}", message);
        log.info("url {}", url);
        Alarm alarmMessage = createAlarmMessage(listener,title, message, url);
        Alarm sanedAlarmMessage = alarmRepository.save(alarmMessage);
        log.info("message: {}", sanedAlarmMessage.toString());
        String listenerId = String.valueOf(listener.getId());
        Map<String, SseEmitter> emitters = emitterRepository.findAllEmitterStartWithByUserId(listenerId);
        emitters.forEach(
                (key, emitter) -> {
                    emitterRepository.saveEventCache(key, sanedAlarmMessage);
                    sendAlarmMessage(emitter,AlarmEventType.ALARM, key, AlarmResponseDto.from(sanedAlarmMessage)  );
                }
        );
    }


    private Alarm createAlarmMessage(User listener,String title, String message, String url) {
        return Alarm.builder()
                .listener(listener)
                .title(title)
                .message(message)
                .url(url)
                .isRead(false)
                .createdDate(LocalDateTime.now())
                .build();
    }

    public void deleteAlarm(Long alarmId){
        alarmRepository.deleteById(alarmId);
    }
}
