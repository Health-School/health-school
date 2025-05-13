package com.malnutrition.backend.domain.user.todoList.controller;

import com.malnutrition.backend.domain.user.todoList.dto.TodoCreateDto;
import com.malnutrition.backend.domain.user.todoList.dto.TodoDto;
import com.malnutrition.backend.domain.user.todoList.dto.TodoUpdateDto;
import com.malnutrition.backend.domain.user.todoList.enums.TodoEnum;
import com.malnutrition.backend.domain.user.todoList.service.TodoService;
import com.malnutrition.backend.global.rp.ApiResponse;
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
            return ResponseEntity.ok(ApiResponse.success(saved, "todo 작성 성공!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("작성 실패: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("예기치 못한 오류가 발생했습니다."));
        }
    }

    @GetMapping
    public ResponseEntity<?> getMyTodos() {
        return ResponseEntity.ok(ApiResponse.success(todoService.getTodosByCurrentUser(), "조회 성공!"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTodoById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ApiResponse.success(todoService.getTodoById(id), "조회 성공!"));
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.fail(e.getMessage()));
        }
    }

    @GetMapping("/due")
    public ResponseEntity<?> getTodosByDueDate(@RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(todoService.getTodosByDueDate(date), "조회 성공!"));
    }

    @GetMapping("/status")
    public ResponseEntity<?> getTodosByDone(@RequestParam("done") TodoEnum done) {
        return ResponseEntity.ok(ApiResponse.success(todoService.getTodosByDoneStatus(done), "조회 성공!"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTodo(@PathVariable("id") Long id, @RequestBody TodoUpdateDto dto) {
        try {
            TodoDto updated = todoService.updateTodo(id, dto);
            return ResponseEntity.ok(ApiResponse.success(updated, "수정 성공!"));
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.fail(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTodo(@PathVariable("id") Long id) {
        try {
            todoService.deleteTodo(id);
            return ResponseEntity.ok(ApiResponse.success(null,"삭제가 완료되었습니다."));
        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.fail(e.getMessage()));
        }
    }




}
