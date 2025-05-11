package com.malnutrition.backend.domain.image.service;

import com.malnutrition.backend.domain.image.config.ImageProperties;
import com.malnutrition.backend.domain.image.dto.ImageResponseDto;
import com.malnutrition.backend.domain.image.entity.Image;
import com.malnutrition.backend.domain.image.repository.ImageRepository;
import com.malnutrition.backend.domain.user.user.entity.User;
import com.malnutrition.backend.domain.user.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageService {
    private final ImageRepository imageRepository;
    private final ImageProperties imageProperties;
    private final ImageS3Service imageS3Service;
    private final UserService userService;

    private record ImageFileInfo(String originalName, String serverFileName, String savedPath) {

    }
    private ImageFileInfo getImageFileInfo(MultipartFile file, String uploadPath){
        String originalName = file.getOriginalFilename();
        String serverFileName = UUID.randomUUID().toString() + "_" + originalName;

        String savedPath = uploadPath + "/" + serverFileName;
        return new ImageFileInfo(originalName, serverFileName, savedPath);
    }

    // 이미지 저장
    @Transactional
    public ImageResponseDto saveImageLocal(MultipartFile file, Long userId) {

        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어 있습니다.");
        }

        try {
            String uploadPath = imageProperties.getUploadPath();
            ImageFileInfo imageFileInfo = getImageFileInfo(file, uploadPath);

            String originalName = imageFileInfo.originalName;
            String serverFileName = imageFileInfo.serverFileName;
            String savedPath = imageFileInfo.savedPath;

            // 로컬 저장 경로
            File destinationDir = new File(System.getProperty("user.dir"), uploadPath);

            if (!destinationDir.exists()) {
                destinationDir.mkdirs();
            }

            File newFile = new File(destinationDir, serverFileName);
            file.transferTo(newFile);

            User user = userService.findByIdWithProfileImage(userId);
            Image profileImage = user.getProfileImage();
            //기존 이미지 삭제
            if (!Objects.isNull(profileImage)) {
                File preFile = new File(System.getProperty("user.dir"), profileImage.getPath());
                deleteFile(preFile);
            }

            //이미지 저장
            Image savedImage = saveProfileImage(originalName, serverFileName, savedPath, user);

            return ImageResponseDto.builder()
                    .id(savedImage.getId())
                    .originalName(savedImage.getOriginalName())
                    .profileImageUrl(getImageProfileUrl(savedImage))
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
    public ImageResponseDto saveImageS3(MultipartFile file, Long userId)  {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어 있습니다.");
        }
        try {
            String uploadPath = imageProperties.getUploadPath();
            ImageFileInfo imageFileInfo = getImageFileInfo(file, uploadPath);

            String originalName = imageFileInfo.originalName;
            String serverFileName = imageFileInfo.serverFileName;
            String savedPath = imageFileInfo.savedPath;

            imageS3Service.uploadFile(savedPath,file.getInputStream(),file.getSize(), file.getContentType());

            User user = userService.findByIdWithProfileImage(userId);
            Image preProfileImage = user.getProfileImage();
            if(!Objects.isNull(preProfileImage)){
                imageS3Service.deleteFile(preProfileImage.getPath());
            }
            Image savedImage = saveProfileImage(originalName, serverFileName, savedPath, user);


            return ImageResponseDto.builder()
                    .id(savedImage.getId())
                    .originalName(savedImage.getOriginalName())
                    .profileImageUrl(getImageProfileUrl(savedImage))
                    .build();
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 중 오류 발생", e);
        }

    }

    @Transactional
    public ImageResponseDto saveImageWithStorageChoice(MultipartFile file, Long userId) {
        boolean useS3 = imageProperties.isUseS3();
        // 로컬 저장 또는 S3 저장 선택
        if (useS3) {
            return saveImageS3(file, userId);  // S3 저장 로직
        } else {
            return saveImageLocal(file, userId);  // 로컬 저장 로직
        }
    }
    private static void deleteFile(File preFile) {
        if(preFile.exists()){
            boolean deleted = preFile.delete();
            if (deleted) {
                log.info("파일 삭제 성공");
            } else {
                log.warn("파일 삭제 실패");
            }
        }else {
            log.warn("삭제하려는 파일이 존재하지 않습니다.");
        }
    }

    // 이미지 하나 조회
    public Optional<Image> getImageById(Long id) {
        return imageRepository.findById(id);
    }

    // 전체 이미지 리스트 조회
    public List<Image> getAllImages() {
        return imageRepository.findAll();
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
        deleteFile(preFile);
        // 각 유저의 프로필 이미지 끊기
        for (User u : usersUsingImage) {
            u.setProfileImage(null);
        }

        // 이미지 삭제
        imageRepository.deleteById(imageId);

        return "이미지가 삭제되었습니다.";
    }


    // 로컬 이미지 보기
    @Transactional(readOnly = true)
    public ResponseEntity<Resource> viewImage(Long id) {
        Image image = imageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("이미지를 찾을 수 없습니다."));

        File file = new File(System.getProperty("user.dir"),image.getPath());
        if (!file.exists()) {
            throw new IllegalArgumentException("이미지 파일이 존재하지 않습니다.");
        }

        Resource resource = new FileSystemResource(file);

        // MIME 타입 자동 추론 (jpg, png 등)
        MediaType mediaType = MediaTypeFactory.getMediaType(file.getName())
                .orElse(MediaType.APPLICATION_OCTET_STREAM);

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(resource);
    }

    @Transactional(readOnly = true)
    public  String getImageProfileUrl(Image image){
        boolean useS3 = imageProperties.isUseS3();
        if(Objects.isNull(image)) return null;
        String profileUrl;
        if(useS3){
            profileUrl = imageS3Service.getViewUrl(image.getPath());
        } else {
            profileUrl = "http://localhost:8090" + imageProperties.getViewUrl()+ image.getId();
        }

        return profileUrl;
    }
>>>>>>> 378cf0184b3f0525004192a67df13557adba795d
}
