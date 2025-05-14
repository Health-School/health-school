package com.malnutrition.backend.domain.alarm.alarm.event;

import com.malnutrition.backend.domain.alarm.alarm.dto.AlarmRequestDto;
import com.malnutrition.backend.domain.alarm.alarm.service.AlarmService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AlarmEventHandler {
    private final AlarmService alarmService;

    @EventListener
    @Async
    public void handleAlarmMessageSend(AlarmRequestDto alarmMessageRequestDto) {
        log.info("event listener");
        log.info("alarmMessageRequestDto {}",  alarmMessageRequestDto);
        alarmService.send( alarmMessageRequestDto);
    }

}
