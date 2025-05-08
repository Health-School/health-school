package com.malnutrition.backend.domain.machine.machine.entity;

import com.malnutrition.backend.domain.machine.type.entity.Type;
import com.malnutrition.backend.domain.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@SuperBuilder
@NoArgsConstructor
@Table(name = "machines")
@Getter
@Setter
@AllArgsConstructor
@ToString
public class Machine extends BaseEntity {
    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",nullable = false)  // FK 이름을 명시적으로 지정
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id",nullable = false)
    private Type type;

    //운동기록지 ID 들어가야 함...


}
