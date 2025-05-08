package com.malnutrition.backend.domain.certification.usercertification.entity;

import com.malnutrition.backend.domain.certification.certification.entity.Certification;
import com.malnutrition.backend.domain.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
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
public class UserCertification extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;

    @ManyToOne
    @JoinColumn(name =  "certification_id")
    Certification certification;
}
