package com.malnutrition.backend.domain.user.user.dto;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@NoArgsConstructor
public class TrainerUserDto {
    private String name;

    public TrainerUserDto(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}

