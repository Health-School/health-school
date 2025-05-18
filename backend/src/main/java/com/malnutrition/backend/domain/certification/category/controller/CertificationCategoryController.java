package com.malnutrition.backend.domain.certification.category.controller;

import com.malnutrition.backend.domain.certification.category.dto.CertificationCategoryDto;
import com.malnutrition.backend.domain.certification.category.service.CertificationCategoryService;
import com.malnutrition.backend.global.rp.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/certification-categories")
@RequiredArgsConstructor
public class CertificationCategoryController {

    private final CertificationCategoryService certificationCategoryService;


    @GetMapping
    private  ResponseEntity<ApiResponse<List<CertificationCategoryDto>>> getAllCategoriesName(){
        List<CertificationCategoryDto> all = certificationCategoryService.findAll();
        return ResponseEntity.ok().body(ApiResponse.success(all, "모든 자격증 이름 가져오기 성공"));
    }
}
