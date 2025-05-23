package com.malnutrition.backend.domain.lecture.curriculum.service;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.InputStream;

@Getter
@Service
@RequiredArgsConstructor
public class CurriculumS3Service {

    private final S3Client s3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    public void uploadFile(String s3path, MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(s3path)
                    .contentType(file.getContentType())
                    .build();

            //  RequestBody.fromInputStream 대신 fromBytes로 대체
            byte[] bytes = file.getBytes(); // 이게 정확한 크기로 바이트를 읽음
            s3Client.putObject(request, RequestBody.fromBytes(bytes));
        } catch (Exception e) {
            throw new RuntimeException("S3 업로드 실패: " + e.getMessage(), e);
        }
    }

    public void deleteFile(String s3path) {
        s3Client.deleteObject(builder -> builder
                .bucket(bucket)
                .key(s3path)
                .build());
    }

    public String getViewUrl(String uploadPath){
        return "https://" + bucket + ".s3.ap-northeast-2.amazonaws.com/" + uploadPath;
    }


}
