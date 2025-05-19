package com.malnutrition.backend.domain.user.sms.service;


import com.malnutrition.backend.domain.user.sms.config.CoolSmsProperties;
import com.malnutrition.backend.global.ut.AuthUtil;
import lombok.RequiredArgsConstructor;
import net.nurigo.sdk.NurigoApp;
import net.nurigo.sdk.message.exception.NurigoEmptyResponseException;
import net.nurigo.sdk.message.exception.NurigoMessageNotReceivedException;
import net.nurigo.sdk.message.exception.NurigoUnknownException;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class SmsService {

    private final DefaultMessageService messageService;
    private final CoolSmsProperties coolSmsProperties;
    private final RedisTemplate<String, String> redisTemplate;

    public SmsService(CoolSmsProperties coolSmsProperties, RedisTemplate<String, String> redisTemplate) {
        this.coolSmsProperties = coolSmsProperties;
        this.messageService = NurigoApp.INSTANCE.initialize(
                coolSmsProperties.getApiKey(),
                coolSmsProperties.getApiSecret(),
                coolSmsProperties.getProvider()

        );
        this.redisTemplate = redisTemplate;
    }

    public void sendVerificationCode(String to) throws NurigoMessageNotReceivedException, NurigoEmptyResponseException, NurigoUnknownException {
        String code = AuthUtil.generateRandomCode();
        storeCodeInRedis(to,code);
        Message message = new Message();
        message.setFrom(coolSmsProperties.getFromNumber());
        message.setTo(to);
        message.setText("[인증번호] " + code + " 를 입력해주세요.");

        messageService.send(message);
    }

    private void storeCodeInRedis(String phoneNumber, String code) {
        redisTemplate.opsForValue().set("auth:" + phoneNumber, code, Duration.ofMinutes(3));
    }
    public boolean verifyCode(String phoneNumber, String code) {
        String savedCode = redisTemplate.opsForValue().get("auth:" + phoneNumber);
        return code.equals(savedCode);
    }

}