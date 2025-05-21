package com.malnutrition.backend.domain.alarm.alarm.enums;

public enum AlarmType {
    SYSTEM_NOTICE("📢 시스템 공지", "시스템에서 다음 공지가 도착했습니다: \n => %s"),
    ADMIN_NOTICE("📢 관리자 알림", "관리자가 다음 메시지를 공지합니다: \n => %s"),
    COMMENT_REPLY("💬 댓글 알림", "%s님이 회원님의 댓글에 답글을 남겼습니다"),
    TRAINER_REPLY("📢 트레이너 알림 ", "%s 트레이너가 회원님에게 %s 알림을 보냅니다");

    private final String titleTemplate;
    private final String messageTemplate;

    // 이 생성자가 enum 상수 선언에 사용됩니다
    AlarmType(String titleTemplate, String messageTemplate) {
        this.titleTemplate = titleTemplate;
        this.messageTemplate = messageTemplate;
    }

    public String formatTitle() {
        return String.format(titleTemplate);
    }

    public String formatMessage(String... args) {
        int expectedCount = countPlaceholders(messageTemplate);
        if (args.length != expectedCount) {
            throw new IllegalArgumentException("Expected " + expectedCount + " arguments but got " + args.length);
        }
        return String.format(messageTemplate, args);
    }

    private int countPlaceholders(String template) {
        return (int) template.chars().filter(c -> c == '%').count(); // 단순히 %s 개수를 셈
    }
}