package com.malnutrition.backend.domain.lecture.lectureuser.service;

import com.malnutrition.backend.domain.lecture.lectureuser.dto.EnrollDto;
import com.malnutrition.backend.domain.lecture.lectureuser.entity.LectureUser;
import com.malnutrition.backend.domain.lecture.lectureuser.repository.LectureUserRepository;
import com.malnutrition.backend.domain.order.entity.Order;
import com.malnutrition.backend.domain.order.repository.OrderRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import com.malnutrition.backend.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LectureUserService {

    private final LectureUserRepository lectureUserRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final Rq rq;

    public List<EnrollDto> getEnrolledLecturesByUser(User user) {

        List<LectureUser> lectureUsers = lectureUserRepository.findByUser(user);
        List<Order> orderList = orderRepository.findByUser(user);

        return lectureUsers.stream()
                .map(lu -> {
                    // 해당 Lecture에 대한 Order 찾아 approvedAt 꺼내기
                    Order matchedOrder = orderList.stream()
                            .filter(o -> o.getLecture().getId().equals(lu.getLecture().getId()))
                            .findFirst()
                            .orElse(null);

                    return new EnrollDto(
                            lu.getLecture().getId(),
                            lu.getLecture().getTrainer().getNickname(),
                            lu.getLecture().getTitle(),
                            lu.getLecture().getLectureLevel().getDescription(),
                            user.getNickname(),
                            matchedOrder != null ? matchedOrder.getApprovedAt() : null
                    );
                })
                .collect(Collectors.toList());
    }

}