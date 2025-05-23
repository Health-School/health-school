package com.malnutrition.backend.domain.image.service;

import com.malnutrition.backend.domain.image.config.ImageProperties;
import com.malnutrition.backend.domain.image.dto.ImageFileInfo;
import com.malnutrition.backend.domain.image.entity.Image;
import com.malnutrition.backend.domain.image.repository.ImageRepository;
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


    ImageFileInfo getImageFileInfo(MultipartFile file, String uploadPath){
        String originalName = file.getOriginalFilename();
        String serverFileName = UUID.randomUUID().toString() + "_" + originalName;

        String savedPath = uploadPath + "/" + serverFileName;
        return new ImageFileInfo(originalName, serverFileName, savedPath);
    }

    @Transactional
    public ImageFileInfo saveFileToLocal(MultipartFile file, String uploadPath) throws IOException {
        // 파일 정보 생성
        ImageFileInfo imageFileInfo = getImageFileInfo(file, uploadPath);

        String serverFileName = imageFileInfo.getServerFileName();

        // 저장 디렉터리 경로 생성
        File destinationDir = new File(System.getProperty("user.dir"), uploadPath);
        if (!destinationDir.exists()) {
            destinationDir.mkdirs();
        }

        // 파일 저장
        File newFile = new File(destinationDir, serverFileName);
        file.transferTo(newFile);

        return imageFileInfo;
    }

    @Transactional
    public void deleteFile(File preFile) {
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
    @Transactional(readOnly = true)
    public Optional<Image> getImageById(Long id) {
        return imageRepository.findById(id);
    }

    // 전체 이미지 리스트 조회
    @Transactional(readOnly = true)
    public List<Image> getAllImages() {
        return imageRepository.findAll();
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


    @Transactional
    public Image saveImageLocal(MultipartFile file, String uploadPath) {

        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어 있습니다.");
        }
        try {

            ImageFileInfo imageFileInfo = saveFileToLocal(file, uploadPath);
            String originalName = imageFileInfo.getOriginalName();
            String serverFileName = imageFileInfo.getServerFileName();
            String savedPath = imageFileInfo.getSavedPath();
            return saveImage(originalName, serverFileName, savedPath);
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 중 오류 발생", e);
        }
    }


    @Transactional
    public Image saveImage(String originalName, String serverFileName, String savedPath) {
        Image image = Image.builder()
                .originalName(originalName)
                .serverImageName(serverFileName)
                .path(savedPath)
                .build();

        Image savedImage = imageRepository.save(image);
        return savedImage;
    }

    @Transactional
    public Image saveImageS3(MultipartFile file, String uploadPath)  {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어 있습니다.");
        }
        try {
            ImageFileInfo imageFileInfo = getImageFileInfo(file, uploadPath);

            String originalName = imageFileInfo.getOriginalName();
            String serverFileName = imageFileInfo.getServerFileName();
            String savedPath = imageFileInfo.getSavedPath();

            imageS3Service.uploadFile(savedPath,file.getInputStream(),file.getSize(), file.getContentType());


            return saveImage(originalName, serverFileName, savedPath);


        } catch (IOException e) {
            throw new RuntimeException("파일 저장 중 오류 발생", e);
        }

    }

    //이미지 저장, s3(배포), or local
    @Transactional
    public Image saveImageWithStorageChoice(MultipartFile file, String uploadPath) {
        boolean useS3 = imageProperties.isUseS3();
        // 로컬 저장 또는 S3 저장 선택
        if (useS3) {
            return saveImageS3(file, uploadPath);  // S3 저장 로직
        } else {
            return saveImageLocal(file, uploadPath);  // 로컬 저장 로직
        }
    }

    @Transactional(readOnly = true)
    public String getImageUrl(Image image){
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

}
