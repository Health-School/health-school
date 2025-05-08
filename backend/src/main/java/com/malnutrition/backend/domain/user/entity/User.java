package com.malnutrition.backend.domain.user.entity;

import com.malnutrition.backend.domain.user.enums.Role;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class User extends BaseEntity {

    @Column(length = 255, nullable = false)
    private String password;
    @Column(length = 50, nullable = false, unique = true)
    private String email;
    @Column(length = 50, nullable = false, unique = true)
    private String nickname;

    @Column(length = 50, nullable = false, unique = true)
    private String phoneNumber;

    @Column(length = 255)
    private String refreshToken;
    @Column(length = 20)
    private String provider;
    @Enumerated(EnumType.STRING)
    private Role roles;


}
