package com.malnutrition.backend.domain.alarm.alarm.service;

import com.malnutrition.backend.domain.alarm.alarm.dto.AlarmResponseDto;
import com.malnutrition.backend.domain.alarm.alarm.entity.Alarm;
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

        //505 에러를 방지하기 위한 더미 이벤트 전송
        Map<String, String> dummyData = new HashMap<>();
        dummyData.put("message", "EventStream Created.");
        dummyData.put("createdAt", LocalDateTime.now().toString());

        //등록 후 SseEmitter 유효시간동안 어느 데이터도 전송되지 않는 다면 503 에러를 발생시키므로 이것에 대한 방지로 더이 이벤트 발생
        sendAlarmMessage(emitter,  emitterId, dummyData);

        if (hasLostData(lastEventId)) {
            sendLostData(lastEventId, userId, emitter);
        }else {
            PageRequest pageable = PageRequest.of(0, 15, Sort.by("createdDate").descending());
            List<Alarm> content = alarmRepository.findByListener_Id(userId, pageable).getContent();
            content.forEach( (alarmMessage -> {
                if(!alarmMessage.getIsRead()) sendAlarmMessage(emitter,  emitterId, AlarmResponseDto.create(alarmMessage));
            }) );
        }
        return emitter;
    }
    private String makeTimeIncludeId(Long userId) {

        return userId + "_" + System.currentTimeMillis();
    }

    private void sendAlarmMessage(SseEmitter emitter,  String emitterId, Object data) {
        try {
            emitter.send(SseEmitter.event()
                    .id(emitterId)
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
                .forEach(entry -> sendAlarmMessage(emitter, entry.getKey(), entry.getValue()));
    }

    @Transactional
    public void send(User listener,
                     String sender

    ) {
        String message = createMessage(sender);
        String url = "";
        log.info("message {}", message);
        log.info("url {}", url);
        Alarm alarmMessage = createAlarmMessage(listener, message, url);
        Alarm sanedAlarmMessage = alarmRepository.save(alarmMessage);
        log.info("message: {}", sanedAlarmMessage.toString());
        String listenerId = String.valueOf(listener.getId());
        Map<String, SseEmitter> emitters = emitterRepository.findAllEmitterStartWithByUserId(listenerId);
        emitters.forEach(
                (key, emitter) -> {
                    emitterRepository.saveEventCache(key, sanedAlarmMessage);
                    sendAlarmMessage(emitter, key, AlarmResponseDto.create(sanedAlarmMessage)  );
                }
        );
    }
    public String createMessage(String sender) {
        //memberId = 구매자
        String message = sender + "님이 메세지를 보냅니다.";

        return message;
    }




    private Alarm createAlarmMessage(User listener, String message, String url) {
        return Alarm.builder()
                .listener(listener)
                .message(message)
                .url(url)
                .isRead(false)
                .createdDate(LocalDateTime.now())
                .build();
    }



}
