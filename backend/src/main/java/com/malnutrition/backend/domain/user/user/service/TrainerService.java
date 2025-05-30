package com.malnutrition.backend.domain.user.user.service;

import com.malnutrition.backend.domain.image.service.ImageService;
import com.malnutrition.backend.domain.lecture.like.repository.LikeRepository;
import com.malnutrition.backend.domain.user.user.dto.TrainerInfoDto;
import com.malnutrition.backend.domain.user.user.dto.TrainerInfoProcessDto;
import com.malnutrition.backend.domain.user.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrainerService {

    private final LikeRepository likeRepository;
    private final ImageService imageService;
    @Transactional(readOnly = true)
    public List<TrainerInfoDto> findPopularTrainersWithHighScore(){
        Pageable pageable = PageRequest.of(0, 5);

        List<TrainerInfoProcessDto> trainerInfoProcessDtos = likeRepository.findPopularTrainersWithHighScore(pageable);
        log.info("TrainerInfoProceessDto {}", trainerInfoProcessDtos);
        return trainerInfoProcessDtos.stream().map((trainerInfoProcessDto ->{
            Long imageId = trainerInfoProcessDto.getImageId();
            String imageUrl = null;
            String imagePath = trainerInfoProcessDto.getImagePath();
            if(imageId != null && imageId >= 1 && imagePath != null ){
                imageUrl = imageService.getImageUrl(trainerInfoProcessDto.getImageId(), imagePath);
            }
            return TrainerInfoDto.from(trainerInfoProcessDto, imageUrl);
        })).collect(Collectors.toList());
    }
}
