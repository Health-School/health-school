package com.malnutrition.backend.domain.lecture.lectureCategory.service;

import com.malnutrition.backend.domain.lecture.lectureCategory.entity.LectureCategory;
import com.malnutrition.backend.domain.lecture.lectureCategory.repository.LectureCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LectureCategoryService {
    private final LectureCategoryRepository lectureCategoryRepository;


}
