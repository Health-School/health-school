package com.malnutrition.backend.domain.user.user.service;

import com.malnutrition.backend.domain.image.entity.Image;
import com.malnutrition.backend.domain.image.service.ImageService;
import com.malnutrition.backend.domain.user.user.dto.MyPageDto;
import com.malnutrition.backend.domain.user.user.dto.UserJoinRequestDto;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.enums.Role;
import com.malnutrition.backend.domain.user.user.enums.UserStatus;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import com.malnutrition.backend.global.rq.Rq;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.jmx.access.InvalidInvocationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthTokenService authTokenService;
    private final ImageService imageService;
    private final Rq rq;


    public Optional<User> findByRefreshToken(String refreshToken) {
        return userRepository.findByRefreshToken(refreshToken);
    }

    @Transactional
    public User join(UserJoinRequestDto userJoinRequestDto, String provider) {
        String email = userJoinRequestDto.getEmail();
        String password = userJoinRequestDto.getPassword();
        String nickname = userJoinRequestDto.getNickname();
        String phoneNumber = userJoinRequestDto.getPhoneNumber();
        userRepository
                .findByEmail(email)
                .ifPresent(member -> {
                    throw new RuntimeException("해당 email은 이미 사용중입니다.");
                });
        if (StringUtils.hasText(password)) password = passwordEncoder.encode(password);
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("이미 가입한 email 입니다.");
        }

        User user = User.builder()
                .email(email)
                .password(password)
                .nickname(nickname)
                .provider(provider)
                .phoneNumber(phoneNumber)
                .refreshToken(UUID.randomUUID().toString())
                .role(Role.USER)
                .build();

        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id, String password) {
        Optional<User> userOptional = userRepository.findById(id);
        if (!userOptional.isPresent())
            throw new IllegalArgumentException("존재하지 않는 ID 입니다.");
        User user = userOptional.get();

        if(user.getProvider().equals(password)){
            user.setUserStatus(UserStatus.DELETED);
            return;
        }
        if(!StringUtils.hasText(password)){
            throw new IllegalArgumentException("비밀번호를 입력하세요.");
        }
        String encodedPassword = user.getPassword();
        if(passwordEncoder.matches(password, encodedPassword)){
            user.setUserStatus(UserStatus.DELETED);
        }else{
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findByNickname(String nickname) {
        return userRepository.findByNickname(nickname);
    }


    public Optional<User> findById(long authorId) {
        return userRepository.findById(authorId);
    }

    public String genAccessToken(User user) {
        return authTokenService.genAccessToken(user);
    }

    public String genAuthToken(User user) {
        return user.getRefreshToken() + " " + genAccessToken(user);
    }

    public User getUserFromAccessToken(String accessToken) {
        Map<String, Object> payload = authTokenService.payload(accessToken);
        if (payload == null) return null;

        long id = (long) payload.get("id");
        String email = (String) payload.get("email");
        String nickname = (String) payload.get("nickname");

        User user = new User(id, email, nickname);

        return user;
    }

    public void modify(User user, @NotBlank String nickname) {
        user.setNickname(nickname);
    }

    @Transactional
    public User modifyOrJoin(UserJoinRequestDto userJoinRequestDto, String provider) {

        Optional<User> opUser = findByEmail(userJoinRequestDto.getEmail());

        if (opUser.isPresent()) {
            User user = opUser.get();

            modify(user, userJoinRequestDto.getNickname());
            return user;
        }

        return join(userJoinRequestDto, provider);
    }

    public String login(String email, String password) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if(user.getUserStatus() == UserStatus.BANNED) {
                throw new AccessDeniedException("정지된 회원입니다."); // 403 에러 발생
            }
            if (passwordEncoder.matches(password, user.getPassword())) {
                return rq.makeAuthCookie(user);
            }
        }
        throw new BadCredentialsException("Invalid email or password");
    }

    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean nicknameExists(String nickname) {
        return userRepository.existsByNickname(nickname);
    }

    @Transactional(readOnly = true)
    public User findByIdWithProfileImage(Long id) {
        return userRepository.findByIdWithProfileImage(id)
                .orElseThrow(() -> new InvalidInvocationException("존재하지 않는 userId 입니다."));
    }

    @Transactional(readOnly = true)
    public List<User> findAllByProfileImageId(Long imageId){
        return userRepository.findAllByProfileImageId(imageId);
    }

    @Transactional(readOnly = true)
    public boolean isExistProvider(String provider){
        return userRepository.existsByProvider(provider);
    }

    public List<User> getTrainerUsers() {
        return userRepository.findByRole(Role.TRAINER);
    }

    @Transactional
    public void resetPassword(String email, String currentPassword, String newPassword) {
        if (!StringUtils.hasText(currentPassword) || !StringUtils.hasText(newPassword)) {
            throw new IllegalArgumentException("비밀번호는 필수 입력입니다.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 email입니다."));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new IllegalArgumentException("기존 비밀번호와 새 비밀번호가 같습니다.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
    }

    @Transactional
    public String resetPassword(String email, String newPassword){
        User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 email입니다."));
        String encode = passwordEncoder.encode(newPassword);
        user.setPassword(encode);
        return newPassword;
    }

    @Transactional
    public void changeNickname(String nickname){
        User actor = rq.getActor();
        actor.setNickname(nickname);
    }
    @Transactional
    public void changePhoneNumber(String phoneNumber){
        User actor = rq.getActor();
        actor.setPhoneNumber(phoneNumber);
    }

    // userService 가 없다면...
    @Transactional(readOnly = true)
    public boolean existsByPhoneNumber(String phoneNumber){
        return userRepository.existsByPhoneNumber(phoneNumber);
    }

    @Transactional(readOnly = true)
    public String findEmailByPhoneNumber(String phoneNumber){
        return userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 핸드폰 번호입니다.")).getEmail();
    }


}
