package com.malnutrition.backend.domain.admin.category.machine.dto;

import com.malnutrition.backend.domain.machine.machine.entity.Machine;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class AdminMachineRequestDto {
    private Long machineId;
    private String machineName;
    private List<String> bodyParts;
    private String machineType;
    private String applicantName;
    private LocalDateTime applicationDate;
    private boolean approved;
    private String status;

    public static AdminMachineRequestDto from(Machine machine) {
        List<String> bodyPartNames = machine.getMachineBodies().stream()
                .map(machineBody -> machineBody.getBody().getName())
                .toList();

        return AdminMachineRequestDto.builder()
                .machineId(machine.getId())
                .machineName(machine.getName())
                .bodyParts(bodyPartNames)
                .machineType(machine.getMachineType().getName())
                .applicantName(machine.getUser().getNickname())
                .applicationDate(machine.getCreatedDate())
                .approved(machine.isApproved())
                .status(machine.isApproved() ? "승인됨" : "승인 대기")
                .build();
    }






}
