package com.malnutrition.backend.domain.alarm.alarm.service;

import com.malnutrition.backend.domain.alarm.alarm.enums.AlarmType;
import com.malnutrition.backend.domain.alarm.alarm.event.AlarmListSendEvent;
import com.malnutrition.backend.domain.alarm.alarm.event.AlarmSendEvent;
import com.malnutrition.backend.domain.lecture.lecture.repository.LectureRepository;
import com.malnutrition.backend.domain.lecture.lectureuser.repository.LectureUserRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlarmEventService {
    private final ApplicationEventPublisher applicationEventPublisher;
    private final LectureUserRepository lectureUserRepository;
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

    /*
    1. lectureId를 보냄
    2. 해당 강의를 듣는 모든 학생을 찾음
    3. AlarmMessage List를 만든 후 저장
    4. send
     */


}
