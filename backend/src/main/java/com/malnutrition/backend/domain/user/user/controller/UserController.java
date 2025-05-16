package com.malnutrition.backend.domain.user.user.controller;


import com.malnutrition.backend.domain.user.user.dto.*;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.service.UserCommandService;
import com.malnutrition.backend.domain.user.user.service.UserService;
import com.malnutrition.backend.global.rp.ApiResponse;
import com.malnutrition.backend.global.rq.Rq;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.security.auth.login.CredentialException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "user 관련 API")
@Slf4j
public class UserController {

    private final UserService userService;
    private final UserCommandService userCommandService;
    private final Rq rq;

    @GetMapping("/test")
    public void test() throws BadRequestException, CredentialException {
        throw new CredentialException("신용 불량자");


    }

    @Operation(
            summary = "회원가입",
            description = "이메일과 비밀번호 닉네임을 입력하여 회원가입합니다..",
            tags = {"User"}
    )
    @PostMapping("/join")//리플래시토큰과 쿠키 생성이 필요함
    public ResponseEntity<ApiResponse<User>> joinUser(@RequestBody @Valid UserJoinRequestDto userJoinRequestDto){
        User join = userService.join (userJoinRequestDto, "");
        ApiResponse<User> joinSuccess = ApiResponse.success( join,"join success");
        return ResponseEntity.ok(joinSuccess);
    }

    @Operation(
            summary = "로그인",
            description = "이메일과 비밀번호를 입력하여 로그인을 합니다.",
            tags = {"User"}
    )
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<String>> login(@RequestBody LoginRequestDto user){
        String token = userService.login(user.getEmail(), user.getPassword());
        return ResponseEntity.ok(ApiResponse.success(token, "login success"));
    }
    @DeleteMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logoutUser() {
        rq.deleteCookie("accessToken");
        rq.deleteCookie("refreshToken");
//        userService.deleteUser();
        return ResponseEntity.ok(ApiResponse.success(null, "로그아웃 성공"));
    }
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MeUserResponseDto>> getMe() {
        User user = rq.getActor();
        log.info("user {}", user);
        MeUserResponseDto me = userCommandService.getMeUserResponseDto(user.getId());
        return ResponseEntity.ok(ApiResponse.success(me,"인가 성공"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<ResetPasswordDto>> resetPassword(@RequestBody Map<String, String> body){
        String email = body.get("email");
        String code = body.get("code");
        ResetPasswordDto resetPasswordDto = userCommandService.resetPassword (email, code);
        return ResponseEntity.ok(ApiResponse.success(resetPasswordDto, "비밀번호 초기화 성공"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@RequestBody ChangePasswordDto changePasswordDto){
        String newPassword = changePasswordDto.getNewPassword();
        String confirmPassword = changePasswordDto.getConfirmPassword();
        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
        }
        User actor = rq.getActor();
        String currentPassword = changePasswordDto.getCurrentPassword();
        userService.resetPassword(actor.getEmail(), currentPassword,newPassword);
        return ResponseEntity.ok(ApiResponse.success(null,"비밀번호 변경 성공"));
    }

    @GetMapping("/me/mypage")
    public ResponseEntity<ApiResponse<MyPageDto>> getMyPage(){

        MyPageDto myPageDto = userCommandService.getMyPageDto(rq.getActor().getId());
        return ResponseEntity.ok(ApiResponse.success(myPageDto, "myPageDto 생성 성공"));
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> withdrawalUser(@RequestBody PasswordRequestDto passwordRequestDto){
        User actor = rq.getActor();
        userService.deleteUser(actor.getId(), passwordRequestDto.getPassword());
        return ResponseEntity.ok(ApiResponse.success(null, "회원탈퇴 성공"));
    }

}
