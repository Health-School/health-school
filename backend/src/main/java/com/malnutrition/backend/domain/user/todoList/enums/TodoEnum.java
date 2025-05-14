package com.malnutrition.backend.domain.user.todoList.enums;

public enum TodoEnum {
    DO("진행예정"),
    DOING("진행중"),
    DONE("완료");

    private final String description;

    TodoEnum(String description) { // 클래스명과 동일해야 함
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
