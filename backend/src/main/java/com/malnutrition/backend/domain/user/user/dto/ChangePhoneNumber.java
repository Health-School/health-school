package com.malnutrition.backend.domain.user.user.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Getter;

@Getter
public class ChangePhoneNumber {
    String phoneNumber;
}
