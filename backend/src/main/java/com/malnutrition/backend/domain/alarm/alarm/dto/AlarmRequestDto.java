package com.malnutrition.backend.domain.alarm.alarm.dto;

import com.malnutrition.backend.domain.user.user.entity.User;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Builder
@ToString
public class AlarmRequestDto {
    User listener;
    String sender;

    /**
     *
     * @param listener: listener
     *
     * @param: ordersStatus
     * @return
     */
    public static AlarmRequestDto from(User listener, String sender ) {
        return AlarmRequestDto.builder()
                .listener(listener)
                .sender(sender)
                .build();
    }

}