package com.malnutrition.backend.domain.image.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ImageFileInfo {
    String originalName;
    String serverFileName;
    String savedPath;
}
