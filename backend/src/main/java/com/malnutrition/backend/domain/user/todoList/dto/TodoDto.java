package com.malnutrition.backend.domain.user.todoList.dto;

import com.malnutrition.backend.domain.user.todoList.entity.Todo;
import com.malnutrition.backend.domain.user.todoList.enums.TodoEnum;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class TodoDto {
    private Long id;
    private String title;
    private String content;
    private TodoEnum isDone;
    private LocalDate dueDate;

    public static TodoDto fromEntity(Todo todo) {
        return TodoDto.builder()
                .id(todo.getId())
                .title(todo.getTitle())
                .content(todo.getContent())
                .isDone(todo.getIsDone())
                .dueDate(todo.getDueDate())
                .build();
    }
}