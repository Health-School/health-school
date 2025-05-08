package com.malnutrition.backend.domain.counseling.entity;

import com.malnutrition.backend.domain.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@SuperBuilder
@NoArgsConstructor
@Table(name = "counselings")
@Getter
@Setter
@AllArgsConstructor
@ToString
public class Counseling extends BaseEntity {
    private String title;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    private String type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")  // FK 이름을 명시적으로 지정
    private User user;

}
