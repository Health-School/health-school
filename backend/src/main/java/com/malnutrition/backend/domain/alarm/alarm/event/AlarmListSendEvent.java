package com.malnutrition.backend.domain.alarm.alarm.event;

import com.malnutrition.backend.domain.user.user.entity.User;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@Builder
@ToString
public class AlarmListSendEvent {
    @ToString.Exclude
    List<User> listener;
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
    public static AlarmListSendEvent from(List<User> listener, String title, String message, String url) {
        return AlarmListSendEvent.builder()
                .listener(listener)
                .title(title)
                .message(message)
                .url(url)
                .build();
    }

}