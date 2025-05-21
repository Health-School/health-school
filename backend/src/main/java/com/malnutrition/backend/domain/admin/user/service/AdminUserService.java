package com.malnutrition.backend.domain.admin.user.service;

import com.malnutrition.backend.domain.admin.user.dto.AdminUserListItemDto;
import com.malnutrition.backend.domain.image.service.ImageService;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.enums.Role;
import com.malnutrition.backend.domain.user.user.enums.UserStatus;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserService {

    private final UserRepository userRepository;
    private final ImageService imageService;

    public Page<AdminUserListItemDto> getUsersList(Pageable pageable,
                                                   String searchFilter,
                                                   Role role,
                                                   UserStatus userStatus) {

        Specification<User> spec = (root, query, criteriaBuilder) ->  {
            List<Predicate> predicates = new ArrayList<>();

            if(role != null)
                predicates.add(criteriaBuilder.equal(root.get("role"), role));

            if(searchFilter != null && !searchFilter.isEmpty()) {
                Predicate nickname = criteriaBuilder.like(criteriaBuilder.lower(root.get("nickname")), "%" + searchFilter.toLowerCase() + "%");
                Predicate email = criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), "%" + searchFilter.toLowerCase() + "%");
                predicates.add(criteriaBuilder.or(nickname, email));
            }

            if(userStatus != null)
                predicates.add(criteriaBuilder.equal(root.get("userStatus"), userStatus));

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        Page<User> userPage = userRepository.findAll(spec, pageable);

        return userPage.map(user -> AdminUserListItemDto.builder()
                .id(user.getId())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .createdDate(user.getCreatedDate())
                .userStatus(user.getUserStatus() != null ? user.getUserStatus().name() : UserStatus.NORMAL.name())
                .profileImageUrl(imageService.getImageProfileUrl(user.getProfileImage()))
                .build());

    }


}
