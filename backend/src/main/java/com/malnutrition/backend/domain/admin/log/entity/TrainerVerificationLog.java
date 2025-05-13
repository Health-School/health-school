package com.malnutrition.backend.domain.admin.log.entity;

import com.malnutrition.backend.domain.admin.enums.TrainerVerificationResult;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(name = "trainer_verification_log")
public class TrainerVerificationLog extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_user_id", nullable = true)
    private User adminUser;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrainerVerificationResult decision;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(nullable = false)
    private LocalDateTime processedAt;
}
