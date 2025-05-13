package com.malnutrition.backend.domain.user.todoList.dto;

import com.malnutrition.backend.domain.user.todoList.enums.TodoEnum;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class TodoUpdateDto {
    private String title;
    private String content;
    private LocalDate dueDate;
    private TodoEnum isDone;
}