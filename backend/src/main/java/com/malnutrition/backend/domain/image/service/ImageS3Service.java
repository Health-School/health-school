package com.malnutrition.backend.domain.image.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.io.InputStream;

@Service
@RequiredArgsConstructor
public class ImageS3Service {
    private final S3Client s3Client;
    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;// 버킷 이름 넣기



    public void uploadFile(String key, MultipartFile file) {
        try {
            // InputStream → byte[] 로 읽기
            InputStream inputStream = file.getInputStream();
            byte[] bytes = inputStream.readAllBytes(); // Java 9+
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(bytes));

        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 실패: " + e.getMessage(), e);
        }
    }

    public void deleteFile(String key) {
        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(key) // 삭제할 파일 경로 (ex: "profile-images/xxx.png")
                .build();

        s3Client.deleteObject(deleteObjectRequest);
    }
    public String getViewUrl(String key) {
        return "https://" + bucketName + ".s3.ap-northeast-2.amazonaws.com/" + key;
    }
}
