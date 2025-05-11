package com.malnutrition.backend.domain.image.entity;


import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "images")
@SuperBuilder
@NoArgsConstructor
@Getter
@ToString
public class Image extends BaseEntity {

    private String originalName;
    private String serverImageName;
    private String path;

}