package com.malnutrition.backend.domain.user.todoList.dto;

import com.malnutrition.backend.domain.user.todoList.enums.TodoEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class TodoCreateDto {
    private String title;
    private String content;
    private LocalDate dueDate;
    private TodoEnum isDone;
}
