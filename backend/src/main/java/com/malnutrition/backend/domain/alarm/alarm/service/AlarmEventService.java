package com.malnutrition.backend.domain.alarm.alarm.service;

import com.malnutrition.backend.domain.alarm.alarm.enums.AlarmType;
import com.malnutrition.backend.domain.alarm.alarm.event.AlarmSendEvent;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AlarmEventService {
    private final ApplicationEventPublisher applicationEventPublisher;
    private final Rq rq;

    public void sendOrderCompleteAlarm() {
        String title = AlarmType.SYSTEM_NOTICE.formatTitle();
        String message = AlarmType.SYSTEM_NOTICE.formatMessage("결제가 완료되었습니다.");
        String url = "/user/dashboard/my-order-list";
        AlarmSendEvent alarmSendEvent = AlarmSendEvent.builder()
                .title(title)
                .message(message)
                .url(url)
                .listener(rq.getActor())
                .build();
        applicationEventPublisher.publishEvent(alarmSendEvent);
    }

}
