package com.malnutrition.backend.domain.certification.usercertification.entity;

import com.malnutrition.backend.domain.certification.certification.entity.Certification;
import com.malnutrition.backend.domain.certification.usercertification.enums.ApproveStatus;
import com.malnutrition.backend.domain.image.entity.Image;
import com.malnutrition.backend.domain.user.trainerApplication.entity.TrainerApplication;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.cglib.core.Local;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(name = "user_certifications")
public class UserCertification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name =  "certification_id")
    private Certification certification;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApproveStatus approveStatus;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "certification_image_id", nullable = false)
    private Image image; //자격증 이미지

    @Column(nullable = true)
    private LocalDate acquisitionDate; // 발급일

    @Column(nullable = true)
    private LocalDate expirationDate; // 만료일

    @Column(columnDefinition = "TEXT") // 승인, 반려 사유 (관리자 입력)
    private String adminComment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_application_id", nullable = true)
    private TrainerApplication trainerApplication;

}
