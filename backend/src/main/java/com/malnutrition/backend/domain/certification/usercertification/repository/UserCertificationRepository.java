package com.malnutrition.backend.domain.certification.usercertification.repository;

import com.malnutrition.backend.domain.certification.usercertification.entity.UserCertification;
import com.malnutrition.backend.domain.certification.usercertification.enums.ApproveStatus;
import com.malnutrition.backend.domain.user.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserCertificationRepository extends JpaRepository<UserCertification , Long> {

    @Query(value = "SELECT uc FROM UserCertification uc " +
                   "LEFT JOIN FETCH uc.certification c " +
                   "LEFT JOIN FETCH c.certificationCategory cc " +
                   "LEFT JOIN FETCH uc.image i " +
                   "WHERE uc.user = :user AND uc.approveStatus = :approveStatus",
           countQuery = "SELECT count(uc) FROM UserCertification uc " +
                        "WHERE uc.user = :user AND uc.approveStatus = :approveStatus")
    Page<UserCertification> findByUserAndApproveStatusWithDetails(
            @Param("user")User user,
            @Param("approveStatus")ApproveStatus approveStatus,
            Pageable pageable);

}
