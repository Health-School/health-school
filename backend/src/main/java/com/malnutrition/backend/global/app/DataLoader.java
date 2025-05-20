package com.malnutrition.backend.global.app;


import com.malnutrition.backend.domain.user.user.dto.UserJoinRequestDto;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.enums.Role;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import com.malnutrition.backend.domain.user.user.service.UserCommandService;
import com.malnutrition.backend.domain.user.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {
    private final UserService userService;
    private final UserRepository userRepository;
    @Value("${admin.password}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if(!userService.isExistProvider("SYSTEM")){
            String email = "admin@health-school.com";
            String nickname = "joinUser";
            String phoneNumber = "01011112222";
            UserJoinRequestDto dto = UserJoinRequestDto.builder()
                    .email(email)
                    .password(adminPassword)
                    .nickname(nickname)
                    .phoneNumber(phoneNumber)
                    .build();
            User join = userService.join(dto, "");
            join.setRole(Role.ADMIN);
            join.setProvider("SYSTEM");
            log.info ("✅ Admin user 가입 완료");
        }
        if(userRepository.count() <= 10) {
            String email = "user";// @health-school.com
            String nickname = "joinUser";
            String phoneNumber = "0101111333";
            List<User> users = new ArrayList<>();
            for (int i = 0; i < 10; i++) {
                UserJoinRequestDto dto = UserJoinRequestDto.builder()
                        .email(email + i + "@health-school.com")
                        .password("1234")
                        .nickname(nickname + i)
                        .phoneNumber(phoneNumber + i)
                        .build();
                User join = userService.join(dto, "");
                users.add(join);
            }
            userRepository.saveAll(users);
        }
    }
}
