package com.malnutrition.backend.domain.certification.usercertification.repository;

import com.malnutrition.backend.domain.certification.usercertification.entity.UserCertification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserCertificationRepository extends JpaRepository<UserCertification , Long> {

}
