package com.malnutrition.backend.domain.admin.category.machine.controller;

import com.malnutrition.backend.domain.admin.category.machine.dto.AdminMachineRequestDto;
import com.malnutrition.backend.domain.admin.category.machine.dto.MachineUpdateRequestDto;
import com.malnutrition.backend.domain.admin.category.machine.service.AdminMachineService;
import com.malnutrition.backend.domain.machine.machine.dto.MachineRegisterRequest;
import com.malnutrition.backend.domain.machine.machine.repository.MachineRepository;
import com.malnutrition.backend.domain.machine.machine.service.MachineService;
import com.malnutrition.backend.domain.machine.machinebody.dto.MachineDto;
import com.malnutrition.backend.global.rp.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin Machine Management API", description = "관리자용 전체 운동 기구 관리 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/machines")
public class AdminMachineController {

    private final AdminMachineService adminMachineService;
    private final MachineRepository machineRepository;
    private final MachineService machineService;


    @Operation(summary = "신청 운동 기구 인증 상태 변경",
            description = "관리자가 신청 운동 기구의 인증 상태를 변경합니다.",
            tags = {"Admin Machine Management API"})
    @PutMapping("/approved/{machineId}")
    public ResponseEntity<?> approveMachine(@PathVariable Long machineId) {
        adminMachineService.approveMachineRequest(machineId);

        return ResponseEntity.ok(ApiResponse.success(null,"운동기구 승인이 완료되었습니다."));

    }

    @Operation(summary = "관리자 운동기구 직접 등록",
            description = "관리자가 새로운 운동기구를 시스템에 직접 등록합니다. 등록 즉시 '승인됨' 상태가 됩니다.",
            tags = {"Admin Machine Management API"})
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<MachineDto>> registerMachineByAdmin(
            @Valid @RequestBody MachineRegisterRequest requestDto) {

        MachineDto newMachineDto = adminMachineService.registerMachineByAdmin(requestDto);
        return ResponseEntity.ok(ApiResponse.success(newMachineDto, "운동기구가 성공적으로 등록되었습니다."));
    }

    @Operation(summary = "운동기구 신청 목록 조회",
            description = "관리자가 운동기구 신청 목록을 페이징으로 조회합니다. 승인 상태(APPROVED, PENDING, 또는 비워두면 ALL)로 필터링할 수 있습니다.",
            tags = {"Admin Machine Management API"})
    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<Page<AdminMachineRequestDto>>> getMachineRequests(
            @PageableDefault(size = 10, sort = "createdDate", direction = Sort.Direction.DESC) Pageable pageable,
            @Parameter(description = "승인 상태 필터 (예: APPROVED, PENDING. 비워두거나 'ALL' 입력 시 전체)") @RequestParam(required = false, defaultValue = "ALL") String status) {

        Page<AdminMachineRequestDto> machineRequestsPage = adminMachineService.getMachineRequests(pageable, status);
        return ResponseEntity.ok(ApiResponse.success(machineRequestsPage, "운동기구 신청 목록 조회 성공"));
    }


    @Operation(summary = "운동기구 정보 수정",
            description = "관리자가 특정 운동기구의 이름, 타입, 운동 부위 등의 정보를 수정합니다.",
            tags = {"Admin Machine Management API"})
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMachine(
            @PathVariable Long machineId,
            @Valid @RequestBody MachineUpdateRequestDto requestDto
    ) {
        MachineDto updatedMachineDto = adminMachineService.updateMachine(
                machineId,
                requestDto.getName(),
                requestDto.getMachineTypeId(),
                requestDto.getBodyIds()
        );

        return ResponseEntity.ok(ApiResponse.success(updatedMachineDto, "운동기구 정보가 성공적으로 수정되었습니다."));
    }


    @Operation(summary = "운동기구 삭제",
            description = "관리자가 특정 운동기구를 시스템에서 삭제합니다.",
            tags = {"Admin Machine Management API"})
    @DeleteMapping("/{machineId}")
    public ResponseEntity<ApiResponse<Void>> deleteMachine(
            @PathVariable Long machineId) {
        adminMachineService.deleteMachine(machineId);
        return ResponseEntity.ok(ApiResponse.success(null, "운동기구가 성공적으로 삭제되었습니다."));
    }

}

