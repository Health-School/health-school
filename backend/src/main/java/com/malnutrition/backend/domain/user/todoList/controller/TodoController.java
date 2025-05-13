package com.malnutrition.backend.domain.user.todoList.controller;

import com.malnutrition.backend.domain.user.todoList.dto.TodoCreateDto;
import com.malnutrition.backend.domain.user.todoList.dto.TodoDto;
import com.malnutrition.backend.domain.user.todoList.enums.TodoEnum;
import com.malnutrition.backend.domain.user.todoList.service.TodoService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/todos")
@RequiredArgsConstructor
public class TodoController {

    private final TodoService todoService;

    @PostMapping
    public ResponseEntity<?> createTodo(@RequestBody TodoCreateDto dto) {
        try {
            TodoDto saved = todoService.createTodo(dto);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("작성 실패: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("예기치 못한 오류가 발생했습니다.");
        }
    }

    @GetMapping
    public ResponseEntity<?> getMyTodos() {
        return ResponseEntity.ok(todoService.getTodosByCurrentUser());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTodoById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(todoService.getTodoById(id));
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/due")
    public ResponseEntity<?> getTodosByDueDate(@RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(todoService.getTodosByDueDate(date));
    }

    @GetMapping("/status")
    public ResponseEntity<?> getTodosByDone(@RequestParam("done") TodoEnum done) {
        return ResponseEntity.ok(todoService.getTodosByDoneStatus(done));
    }




}
