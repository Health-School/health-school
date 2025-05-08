package com.malnutrition.backend.domain.user.user.entity;

import com.malnutrition.backend.domain.image.entity.Image;
import com.malnutrition.backend.domain.user.user.enums.Role;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "users")
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class User extends BaseEntity {

    @OneToOne(cascade = CascadeType.REMOVE, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "image_id", nullable = true)
    Image profileImage;

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
    private Role role;


}
