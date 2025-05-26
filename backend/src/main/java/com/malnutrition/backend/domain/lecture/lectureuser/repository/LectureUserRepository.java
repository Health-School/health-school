package com.malnutrition.backend.domain.lecture.lectureuser.repository;

import com.malnutrition.backend.domain.lecture.lecture.dto.LectureDto;
import com.malnutrition.backend.domain.lecture.lecture.entity.Lecture;
import com.malnutrition.backend.domain.lecture.lectureuser.entity.LectureUser;
import com.malnutrition.backend.domain.user.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LectureUserRepository extends JpaRepository<LectureUser, Long> {
    List<LectureUser> findByUser(User user);

    @Query(value = "SELECT lu FROM LectureUser lu " +
            "JOIN FETCH lu.lecture l " +
            "JOIN FETCH l.trainer " +
            "LEFT JOIN FETCH l.coverImage " +
            "WHERE lu.user = :user",
            countQuery = "SELECT count(lu) FROM LectureUser lu WHERE lu.user = :user")
    Page<LectureUser> findByUser(User user, Pageable pageable);

    @Query("""
    SELECT lu FROM LectureUser lu
    JOIN FETCH lu.lecture l
    JOIN FETCH l.trainer
    WHERE lu.id = :idg
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

    Optional<LectureUser> findByUserIdAndLectureId(Long userId, Long lectureId);

    @Query("SELECT COUNT(DISTINCT lu.user) FROM LectureUser lu WHERE lu.lecture = :lecture")
    Long countDistinctUsersByLecture(@Param("lecture") Lecture lecture);

    @Query("""
        SELECT COUNT(lu)
        FROM LectureUser lu
        WHERE lu.lecture.trainer.id = :trainerId
        """)
    long countByTrainerId(@Param("trainerId") Long trainerId);


    // COMPLETED 상태인 수강자 수
    @Query("""
        SELECT COUNT(lu)
        FROM LectureUser lu
        WHERE lu.lecture.trainer.id = :trainerId
        AND lu.completionStatus = com.malnutrition.backend.domain.lecture.lectureuser.enums.CompletionStatus.COMPLETED
        """)
    long countCompletedByTrainerId(@Param("trainerId") Long trainerId);


    Optional<LectureUser> findByLecture_IdAndUser_Id(Long lectureId, Long userId);

    @EntityGraph(attributePaths = {
            "lecture.coverImage",
            "lecture.lectureCategory",
            "lecture.trainer"
    })    @Query("SELECT l FROM LectureUser lu JOIN lu.lecture l GROUP BY l ORDER BY COUNT(lu.lecture) DESC")
    List<Lecture> findPopularLecturesWithEntityGraph(Pageable pageable);

    @Query("""
    SELECT l FROM Lecture l
    LEFT JOIN FETCH l.coverImage
    LEFT JOIN FETCH l.lectureCategory
    LEFT JOIN FETCH l.trainer
    WHERE l.id IN :ids
""")
    List<Lecture> findWithDetailsByIdIn(@Param("ids") List<Long> ids);

}
