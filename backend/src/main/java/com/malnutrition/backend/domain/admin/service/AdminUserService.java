package com.malnutrition.backend.domain.admin.service;

import com.malnutrition.backend.domain.certification.usercertification.entity.UserCertification;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final UserCertification
}
