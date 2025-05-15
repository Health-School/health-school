package com.malnutrition.backend.domain.alarm.alarm.controller;

import com.malnutrition.backend.domain.alarm.alarm.service.AlarmService;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/v1/alarm")

public class AlarmController {

    private final AlarmService alarmService;
    private final Rq rq;

    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@RequestHeader(value = "Last-Event-ID", required = false, defaultValue = "") String lastEventId){
        User actor = rq.getActor();
        log.info("lastEventId {}", lastEventId);
        SseEmitter sseEmitter = alarmService.subscribe(actor.getId(), lastEventId);
        return sseEmitter;
    }
    @GetMapping(value = "/read")
    public void readAll() {
        User actor = rq.getActor();
        alarmService.readCheckAll( String.valueOf(actor.getId()));
    }
    @GetMapping(value = "/read/{alarmId}")
    public void read(@PathVariable("alarmId") Long alarmId) {
        User actor = rq.getActor();
        alarmService.readCheck( String.valueOf(actor.getId()), alarmId);
    }

}
