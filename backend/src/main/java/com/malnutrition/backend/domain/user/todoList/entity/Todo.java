package com.malnutrition.backend.domain.user.todoList.entity;

import com.malnutrition.backend.domain.user.todoList.enums.TodoEnum;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Table(name = "todos")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@Entity
public class Todo extends BaseEntity {
    @Column(nullable = false, columnDefinition = "TEXT")
    private String title;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @Column(nullable = false)
    private TodoEnum isDone;

    private LocalDate dueDate;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}