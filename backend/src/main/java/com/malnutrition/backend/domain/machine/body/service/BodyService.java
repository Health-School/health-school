package com.malnutrition.backend.domain.machine.body.service;

import com.malnutrition.backend.domain.machine.body.dto.BodyDto;
import com.malnutrition.backend.domain.machine.body.entity.Body;
import com.malnutrition.backend.domain.machine.body.repository.BodyRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BodyService {

    private final BodyRepository bodyRepository;
    private final Rq rq;

    private void checkAdmin(User user) {
        if (!user.getRole().name().equals("ADMIN")) {
            throw new SecurityException("관리자 권한이 필요합니다.");
        }
    }

    @Transactional(readOnly = true)
    public List<BodyDto> getAllBodies() {
        return bodyRepository.findAll().stream()
                .map(body -> new BodyDto(body.getId(), body.getName()))
                .toList();
    }

    @Transactional
    public BodyDto createBody(String name) {
        User user = rq.getActor();
        checkAdmin(user);

        if (bodyRepository.findByName(name).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 이름입니다.");
        }

        Body body = Body.builder().name(name).build();
        bodyRepository.save(body);
        return new BodyDto(body.getId(), body.getName());
    }

    @Transactional
    public BodyDto updateBody(Long id, String name) {
        User user = rq.getActor();
        checkAdmin(user);

        if (bodyRepository.findByName(name).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 이름입니다.");
        }

        Body body = bodyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 ID입니다."));
        body.setName(name);
        return new BodyDto(body.getId(), body.getName());
    }

    @Transactional
    public void deleteBody(Long id) {
        User user = rq.getActor();
        checkAdmin(user);

        Body body = bodyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 ID입니다."));
        bodyRepository.delete(body);
    }
}

