package com.malnutrition.backend.domain.user.user.repository;


import com.malnutrition.backend.domain.image.entity.Image;
import com.malnutrition.backend.domain.user.user.dto.TrainerInfoProcessDto;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.enums.Role;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long>, JpaSpecificationExecutor<User> {
    Optional<User> findByEmail(String email);
    Optional<User> findByRefreshToken(String refreshToken);

    Optional<User> findByNickname(String nickname);

    boolean existsByEmail(String email);

    boolean existsByNickname(String nickname);
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.profileImage WHERE u.id = :id")
    Optional<User> findByIdWithProfileImage(@Param("id") Long id);

    @Query("SELECT u.profileImage FROM User u WHERE u.id = :id")
    Optional<Image> findProfileImageByUserId(@Param("id") Long id);

    List<User> findAllByProfileImageId(Long id);

    boolean existsByProvider(String provider);

    long countByCreatedDateBefore(LocalDateTime localDateTime);

    boolean existsByPhoneNumber(String phoneNumber);
    Optional<User> findByPhoneNumber(String phoneNumber);
    List<User> findByRole(Role role);

    @Query("SELECT new com.malnutrition.backend.domain.user.user.dto.TrainerInfoProcessDto( " +
            "t.nickname, COUNT(lu.id), AVG(COALESCE(lk.score, 0)), img.id, img.path) " +
            "FROM LectureUser lu " +
            "JOIN lu.lecture l " +
            "JOIN l.trainer t " +
            "LEFT JOIN Like lk ON lk.lectureUser = lu " +
            "LEFT JOIN t.profileImage img " +
            "GROUP BY t.id, t.nickname, img.id, img.path " +
            "HAVING AVG(COALESCE(lk.score, 0)) >= 4.0 " +
            "ORDER BY COUNT(lu.id) DESC")
    List<TrainerInfoProcessDto> findPopularTrainersWithHighScore(Pageable pageable);
}
