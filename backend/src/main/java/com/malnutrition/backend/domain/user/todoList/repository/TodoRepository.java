package com.malnutrition.backend.domain.user.todoList.repository;

import com.malnutrition.backend.domain.user.todoList.entity.Todo;
import com.malnutrition.backend.domain.user.todoList.enums.TodoEnum;
import com.malnutrition.backend.domain.user.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TodoRepository extends JpaRepository<Todo, Long> {
    List<Todo> findByUser(User user);
    List<Todo> findByUserAndDueDate(User user, LocalDate dueDate);
    List<Todo> findByUserAndIsDone(User user, TodoEnum isDone);
}
