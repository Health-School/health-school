package com.malnutrition.backend.domain.user.todoList.service;

import com.malnutrition.backend.domain.user.todoList.dto.TodoCreateDto;
import com.malnutrition.backend.domain.user.todoList.dto.TodoDto;
import com.malnutrition.backend.domain.user.todoList.dto.TodoUpdateDto;
import com.malnutrition.backend.domain.user.todoList.entity.Todo;
import com.malnutrition.backend.domain.user.todoList.enums.TodoEnum;
import com.malnutrition.backend.domain.user.todoList.repository.TodoRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TodoService {

    private final TodoRepository todoRepository;
    private final Rq rq; // 현재 로그인한 사용자 정보 획득

    @Transactional
    public TodoDto createTodo(TodoCreateDto dto) {
        User user = rq.getActor();

        Todo todo = Todo.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .dueDate(dto.getDueDate())
                .isDone(dto.getIsDone())
                .user(user)
                .build();

        Todo saved = todoRepository.save(todo);
        return TodoDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<TodoDto> getTodosByCurrentUser() {
        User user = rq.getActor();
        return todoRepository.findByUser(user).stream()
                .map(TodoDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public TodoDto getTodoById(Long id) {
        User user = rq.getActor();
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 Todo가 존재하지 않습니다."));

        if (!todo.getUser().getId().equals(user.getId())) {
            throw new SecurityException("본인의 Todo만 조회할 수 있습니다.");
        }

        return TodoDto.fromEntity(todo);
    }

    @Transactional(readOnly = true)
    public List<TodoDto> getTodosByDueDate(LocalDate dueDate) {
        User user = rq.getActor();
        return todoRepository.findByUserAndDueDate(user, dueDate).stream()
                .map(TodoDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TodoDto> getTodosByDoneStatus(TodoEnum isDone) {
        User user = rq.getActor();
        return todoRepository.findByUserAndIsDone(user, isDone).stream()
                .map(TodoDto::fromEntity)
                .toList();
    }

    @Transactional
    public TodoDto updateTodo(Long todoId, TodoUpdateDto dto) {
        User user = rq.getActor(); // 현재 로그인한 사용자

        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> new IllegalArgumentException("해당 Todo가 존재하지 않습니다."));

        if (!todo.getUser().getId().equals(user.getId())) {
            throw new SecurityException("수정 권한이 없습니다.");
        }

        if (dto.getTitle() != null) todo.setTitle(dto.getTitle());
        if (dto.getContent() != null) todo.setContent(dto.getContent());
        if (dto.getDueDate() != null) todo.setDueDate(dto.getDueDate());
        if (dto.getIsDone() != null) todo.setIsDone(dto.getIsDone());

        return TodoDto.fromEntity(todo);
    }

    @Transactional
    public void deleteTodo(Long todoId) {
        User user = rq.getActor(); // 로그인한 사용자

        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> new IllegalArgumentException("해당 Todo가 존재하지 않습니다."));

        if (!todo.getUser().getId().equals(user.getId())) {
            throw new SecurityException("삭제 권한이 없습니다.");
        }

        todoRepository.delete(todo);
    }

}

