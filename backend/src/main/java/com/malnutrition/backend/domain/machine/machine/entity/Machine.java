package com.malnutrition.backend.domain.machine.machine.entity;

import com.malnutrition.backend.domain.machine.machinebody.entity.MachineBody;
import com.malnutrition.backend.domain.machine.machinetype.entity.MachineType;
import com.malnutrition.backend.domain.user.exercisesheet.entity.ExerciseSheet;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

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
    private User user; //신청자 명

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machineType_id",nullable = false)
    private MachineType machineType;

    @OneToMany(mappedBy = "machine", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MachineBody> machineBodies;

    private boolean approved; //운동기구 추가 요청이 성공했는지 안되었는지

    //운동 기구가 처음 등록되거나 사용된 시트가 없을 땐 null 이어야 할 것 같음!!!

}
