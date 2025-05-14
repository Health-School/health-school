package com.malnutrition.backend.domain.user.todoList.dto;

import com.malnutrition.backend.domain.user.todoList.enums.TodoEnum;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TodoCreateDto {
    private String title;
    private String content;
    private LocalDate dueDate;
    private TodoEnum isDone;
}
