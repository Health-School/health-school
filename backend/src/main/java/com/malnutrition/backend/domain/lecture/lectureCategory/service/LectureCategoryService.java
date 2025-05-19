package com.malnutrition.backend.domain.lecture.lectureCategory.service;

import com.malnutrition.backend.domain.lecture.lectureCategory.entity.LectureCategory;
import com.malnutrition.backend.domain.lecture.lectureCategory.repository.LectureCategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class LectureCategoryService {
    private final LectureCategoryRepository lectureCategoryRepository;

    // 카테고리 추가
    public LectureCategory addLectureCategory(String name, String description) {
        lectureCategoryRepository.findByCategoryName(name).ifPresent(duplication -> {
            throw new IllegalArgumentException("이미 존재하는 카테고리 입니다.");
        });

        LectureCategory category = new LectureCategory();
        category.setCategoryName(name);
        category.setDescription(description);
        return lectureCategoryRepository.save(category);
    }

    // 조회
    public LectureCategory findCategory(Long id) {
        return lectureCategoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 카테고리를 찾을 수 없습니다."));
    }

    // 카테고리 전체보기
    public List<LectureCategory> allCategory() {
        return lectureCategoryRepository.findAll();
    }

    // 수정
    public LectureCategory updateCategory(Long id, String name, String description) {

        LectureCategory categoryName = lectureCategoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("카테고리가 존재하지 않습니다."));

        // 현재 카테고리 id와 다른 카테고리 중에 같은 이름이 있는지 검사
        lectureCategoryRepository.findByCategoryName(name).ifPresent(dup -> {
            if (!dup.getId().equals(id)) {
                throw new IllegalArgumentException("이미 존재하는 카테고리 이름입니다.");
            }
        });

        LectureCategory category = findCategory(id);
        category.setCategoryName(name);
        category.setDescription(description);
        return lectureCategoryRepository.save(category);
    }

    // 삭제
    public void deleteCategory(Long id) {
        if (!lectureCategoryRepository.existsById(id)) {
            throw new IllegalArgumentException("존재하지 않는 id 입니다.");
        }
        lectureCategoryRepository.deleteById(id);
    }

}
