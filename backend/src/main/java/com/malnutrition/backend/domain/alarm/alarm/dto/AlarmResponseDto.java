package com.malnutrition.backend.domain.alarm.alarm.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.malnutrition.backend.domain.alarm.alarm.entity.Alarm;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlarmResponseDto {

    Long id;
    String message;
    String url;
    String title;
    boolean read;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    LocalDateTime createdAt;

    public static AlarmResponseDto from(Alarm alarmMessage) {
        return AlarmResponseDto.builder()
                .id(alarmMessage.getId())
                .title(alarmMessage.getTitle())
                .message(alarmMessage.getMessage())
                .url(alarmMessage.getUrl())
                .read(alarmMessage.getIsRead())
                .createdAt(alarmMessage.getCreatedDate())
                .build();
    }

}
