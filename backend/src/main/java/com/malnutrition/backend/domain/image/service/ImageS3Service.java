package com.malnutrition.backend.domain.image.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.InputStream;

@Service
@RequiredArgsConstructor
public class ImageS3Service {
    private final S3Client s3Client;
    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;// 버킷 이름 넣기



    public void uploadFile(String key, InputStream inputStream, long contentLength, String contentType) {
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key) // 폴더/파일명 형태 가능
                .contentType(contentType)
//                .acl(ObjectCannedACL.PUBLIC_READ) // ✅ 퍼블릭 읽기 권한 부여
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(inputStream, contentLength));
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
