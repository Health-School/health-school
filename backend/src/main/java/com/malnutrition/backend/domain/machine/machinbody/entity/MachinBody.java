package com.malnutrition.backend.domain.machine.machinbody.entity;

import com.malnutrition.backend.domain.machine.body.entity.Body;
import com.malnutrition.backend.domain.machine.machine.entity.Machine;
import com.malnutrition.backend.domain.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@SuperBuilder
@NoArgsConstructor
@Table(name = "machineBodies")
@Getter
@Setter
@AllArgsConstructor
@ToString
public class MachinBody extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @Column(nullable = false)
    @JoinColumn(name = "machine_id")  // FK 이름을 명시적으로 지정
    private Machine machine;

    @ManyToOne(fetch = FetchType.LAZY)
    @Column(nullable = false)
    @JoinColumn(name = "body_id")  // FK 이름을 명시적으로 지정
    private Body body;
}
