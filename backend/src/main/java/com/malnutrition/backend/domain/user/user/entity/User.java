package com.malnutrition.backend.domain.user.user.entity;

import com.malnutrition.backend.domain.certification.usercertification.entity.UserCertification;
import com.malnutrition.backend.domain.image.entity.Image;
import com.malnutrition.backend.domain.user.trainerApplication.entity.TrainerApplication;
import com.malnutrition.backend.domain.user.user.enums.Role;
import com.malnutrition.backend.domain.user.user.enums.UserStatus;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.ArrayList;
import java.util.Collection;
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

    @OneToOne(cascade = CascadeType.REMOVE, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "image_id", nullable = true)
    @ToString.Exclude
    Image profileImage;

    @Column(length = 255, nullable = false)
    private String password;

    @Column(length = 50, nullable = false, unique = true)
    private String email;

    @Column(length = 50, nullable = false, unique = true)
    private String nickname;

    @Column(length = 50, nullable = true, unique = true)
    private String phoneNumber;

    @Column(length = 255)
    private String refreshToken;

    @Column(length = 20)
    private String provider;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private UserStatus userStatus;

    // 사용자의 트레이너 신청 목록 (이력)
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude

    private List<TrainerApplication> trainerApplications = new ArrayList<>();

    // 사용자의 자격증 제출 내역
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<UserCertification> userCertifications = new ArrayList<>();


    public User(long id, String email, String nickname) {
        this.setId(id);
        this.email = email;
        this.nickname = nickname;
    }

    public Collection<? extends GrantedAuthority> getAuthorities() {
        ArrayList<Role> roles = new ArrayList<>();
        roles.add(this.role);
        return roles
                .stream()
                .map((name) -> new SimpleGrantedAuthority("ROLE_" + name))
                .toList();
    }

    public void addTrainerApplication(TrainerApplication application) {
        this.trainerApplications.add(application);
        application.setUser(this);
    }

    public void addUserCertification(UserCertification userCertification) {
        this.userCertifications.add(userCertification);
        userCertification.setUser(this);
    }
}
