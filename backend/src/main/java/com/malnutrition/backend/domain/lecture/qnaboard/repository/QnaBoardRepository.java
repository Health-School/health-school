package com.malnutrition.backend.domain.lecture.qnaboard.repository;

import com.malnutrition.backend.domain.lecture.qnaboard.entity.QnaBoard;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QnaBoardRepository extends JpaRepository<QnaBoard ,Long> {
}
