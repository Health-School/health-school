package com.malnutrition.backend.domain.machine.body.entity;

import com.malnutrition.backend.domain.machine.body.repository.BodyRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class BodyInitializer {

    private final BodyRepository bodyRepository;

    @PostConstruct
    public void initBodies() {
        List<String> defaultBodies = List.of("가슴", "등", "어깨", "하체", "팔", "복부");

        for (String name : defaultBodies) {
            if (!bodyRepository.existsByName(name)) {
                bodyRepository.save(Body.builder()
                        .name(name)
                        .build());
            }
        }
    }
}
