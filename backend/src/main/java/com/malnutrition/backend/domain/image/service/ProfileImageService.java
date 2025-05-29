package com.malnutrition.backend.domain.image.service;

import com.malnutrition.backend.domain.image.config.ImageProperties;
import com.malnutrition.backend.domain.image.dto.ImageFileInfo;
import com.malnutrition.backend.domain.image.dto.ImageResponseDto;
import com.malnutrition.backend.domain.image.entity.Image;
import com.malnutrition.backend.domain.image.repository.ImageRepository;
import com.malnutrition.backend.domain.lecture.curriculum.service.CurriculumS3Service;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileImageService {

    private final ImageService imageService;
    private final ImageProperties imageProperties;
    private final ImageS3Service imageS3Service;
    private final UserService userService;
    private final ImageRepository imageRepository;


    // 이미지 저장
    @Transactional
    public ImageResponseDto saveProfileImageLocal(MultipartFile file, Long userId) {

        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어 있습니다.");
        }

        try {
            ImageFileInfo imageFileInfo = imageService.saveFileToLocal(file, imageProperties.getProfileUploadPath());

            String originalName = imageFileInfo.getOriginalName();
            String serverFileName = imageFileInfo.getServerFileName();
            String savedPath = imageFileInfo.getSavedPath();

            User user = userService.findByIdWithProfileImage(userId);
            Image profileImage = user.getProfileImage();

            //기존 이미지 삭제
            if (!Objects.isNull(profileImage)) {
                File preFile = new File(System.getProperty("user.dir"), profileImage.getPath());
                imageService.deleteFile(preFile);
            }

            //이미지 저장
            Image savedImage = saveProfileImage(originalName, serverFileName, savedPath, user);

            return ImageResponseDto.builder()
                    .id(savedImage.getId())
                    .originalName(savedImage.getOriginalName())
                    .imageUrl(imageService.getImageUrl(savedImage))
                    .build();

        } catch (IOException e) {
            throw new RuntimeException("파일 저장 중 오류 발생", e);
        }
    }

    @Transactional
    public Image saveProfileImage(String originalName, String serverFileName, String savedPath, User user) {
        Image image = Image.builder()
                .originalName(originalName)
                .serverImageName(serverFileName)
                .path(savedPath)
                .build();

        Image savedImage = imageRepository.save(image);
        user.setProfileImage(savedImage);
        return savedImage;
    }

    @Transactional
    public ImageResponseDto saveProfileImageS3(MultipartFile file, Long userId)  {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어 있습니다.");
        }
        String uploadPath = imageProperties.getProfileUploadPath();
        ImageFileInfo imageFileInfo = imageService.getImageFileInfo(file, uploadPath);

        String originalName = imageFileInfo.getOriginalName();
        String serverFileName = imageFileInfo.getServerFileName();
        String savedPath = imageFileInfo.getSavedPath();

            imageS3Service.uploadFile(savedPath, file);
        User user = userService.findByIdWithProfileImage(userId);
        Image preProfileImage = user.getProfileImage();

        if(!Objects.isNull(preProfileImage)){
            imageS3Service.deleteFile(preProfileImage.getPath());
        }
        Image savedImage = saveProfileImage(originalName, serverFileName, savedPath, user);


        return ImageResponseDto.builder()
                .id(savedImage.getId())
                .originalName(savedImage.getOriginalName())
                .imageUrl(imageService.getImageUrl(savedImage))
                .build();

    }

    @Transactional
    public ImageResponseDto saveImageWithStorageChoice(MultipartFile file, Long userId) {
        boolean useS3 = imageProperties.isUseS3();
        // 로컬 저장 또는 S3 저장 선택
        if (useS3) {
            return saveProfileImageS3(file, userId);  // S3 저장 로직
        } else {
            //여기서 user id 혹은 ? 여러가지 정하기?
            return saveProfileImageLocal(file, userId);  // 로컬 저장 로직
        }
    }

    // 이미지 삭제 (Delete)
    @Transactional
    public String deleteImage(Long imageId, Long userId) {
        User user = userService.findByIdWithProfileImage(userId);
        log.info("user {}", user);
        // 이 이미지를 사용하는 모든 유저 찾기
        List<User> usersUsingImage = userService.findAllByProfileImageId(imageId);
        // 이미지 파일 삭제
        File preFile = new File(System.getProperty("user.dir"), user.getProfileImage().getPath());
        imageService.deleteFile(preFile);
        // 각 유저의 프로필 이미지 끊기
        for (User u : usersUsingImage) {
            u.setProfileImage(null);
        }

        // 이미지 삭제
        imageRepository.deleteById(imageId);

        return "이미지가 삭제되었습니다.";
    }



}
