package com.malnutrition.backend.domain.user.trainerApplication.entity;

import com.malnutrition.backend.domain.admin.enums.TrainerVerificationResult;
import com.malnutrition.backend.domain.certification.usercertification.entity.UserCertification;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trainer_applications")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerApplication extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrainerVerificationResult verificationResult;

    @Column(columnDefinition = "TEXT")
    private String careerHistory;

    @Column(columnDefinition = "TEXT")
    private String expertiseAreas;

    @Column(columnDefinition = "TEXT")
    private String selfIntroduction;

    @OneToMany(mappedBy = "trainerApplication", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<UserCertification> submittedCertifications = new ArrayList<>();

    public void addSubmittedCertification(UserCertification userCertification) {
        this.submittedCertifications.add(userCertification);
        userCertification.setTrainerApplication(this);
    }


}
