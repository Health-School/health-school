package com.malnutrition.backend.domain.user.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class TrainerUserDto {
    private Long id;
    private String name;

    public TrainerUserDto(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}

