package com.malnutrition.backend.domain.image.entity;


import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "images")
@SuperBuilder
@NoArgsConstructor
public class Image extends BaseEntity {

    private String originalName;
    private String serverImageName;
    private String path;
}
