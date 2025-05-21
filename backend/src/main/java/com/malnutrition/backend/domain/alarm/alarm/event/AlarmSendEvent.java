package com.malnutrition.backend.domain.alarm.alarm.event;

import com.malnutrition.backend.domain.user.user.entity.User;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Builder
@ToString
public class AlarmSendEvent {
    @ToString.Exclude
    User listener;
    String title;
    String message;
    String url;
    /**
     *
     * @param listener: listener
     *
     * @param: ordersStatus
     * @return
     */
    public static AlarmSendEvent from(User listener, String title, String message, String url) {
        return AlarmSendEvent.builder()
                .listener(listener)
                .title(title)
                .message(message)
                .url(url)
                .build();
    }

}