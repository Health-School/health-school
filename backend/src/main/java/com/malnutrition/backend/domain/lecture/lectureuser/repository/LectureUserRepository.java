package com.malnutrition.backend.domain.lecture.lectureuser.repository;

import com.malnutrition.backend.domain.lecture.lectureuser.entity.LectureUser;
import com.malnutrition.backend.domain.user.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LectureUserRepository extends JpaRepository<LectureUser, Long> {
    List<LectureUser> findByUser(User user);
    Page<LectureUser> findByUser(User user, Pageable pageable);

    @Query("""
    SELECT lu FROM LectureUser lu
    JOIN FETCH lu.lecture l
    JOIN FETCH l.trainer
    WHERE lu.id = :id
""")
    Optional<LectureUser> findWithLectureAndTrainerById(@Param("id") Long id);

    @Query("SELECT lu FROM LectureUser lu " +
            "WHERE lu.lecture.trainer.id = :trainerId")
    Page<LectureUser> findAllByLectureTrainerId(@Param("trainerId") Long trainerId, Pageable pageable);

    @Query("SELECT DISTINCT lu.user FROM LectureUser lu " +
            "WHERE lu.lecture.trainer.id = :trainerId")
    Page<User> findDistinctUsersByLectureTrainerId(@Param("trainerId") Long trainerId, Pageable pageable);

    List<LectureUser> findByLectureIdIn(List<Long> lectureIds);

    boolean existsByUserIdAndLecture_Id(Long userId, Long lectureId);

    List<LectureUser> findByLectureId(Long lectureId);

}
