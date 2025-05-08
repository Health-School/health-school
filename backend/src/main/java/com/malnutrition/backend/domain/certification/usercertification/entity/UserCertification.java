package com.malnutrition.backend.domain.certification.usercertification.entity;

import com.malnutrition.backend.domain.certification.certification.entity.Certification;
import com.malnutrition.backend.domain.certification.usercertification.enums.ApproveStatus;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
<<<<<<< HEAD
import jakarta.persistence.*;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "user_certifications")
@SuperBuilder
@NoArgsConstructor
=======
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@SuperBuilder
@NoArgsConstructor
@Table(name = "user_certifications")
@Getter
@Setter
@AllArgsConstructor
@ToString
>>>>>>> 6da4e28a5afc68070b714e3a8737a6d690735b83
public class UserCertification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name =  "certification_id")
    Certification certification;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ApproveStatus approveStatus;

}
