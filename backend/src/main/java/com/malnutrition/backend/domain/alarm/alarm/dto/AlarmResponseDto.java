package com.malnutrition.backend.domain.alarm.alarm.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.malnutrition.backend.domain.alarm.alarm.entity.Alarm;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class AlarmResponseDto {

    Long id;
    String message;
    String url;
    boolean read;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    LocalDateTime createdDateTime;

    public static AlarmResponseDto create(Alarm alarmMessage) {
        return AlarmResponseDto.builder()
                .id(alarmMessage.getId())
                .message(alarmMessage.getMessage())
                .url(alarmMessage.getUrl())
                .read(alarmMessage.getIsRead())
                .createdDateTime(alarmMessage.getCreatedDate())
                .build();
    }
}
