package com.malnutrition.backend.domain.user.sms.service;


import com.malnutrition.backend.domain.user.sms.config.CoolSmsProperties;
import net.nurigo.sdk.NurigoApp;
import net.nurigo.sdk.message.exception.NurigoEmptyResponseException;
import net.nurigo.sdk.message.exception.NurigoMessageNotReceivedException;
import net.nurigo.sdk.message.exception.NurigoUnknownException;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.springframework.stereotype.Service;

@Service
public class SmsService {

    private final DefaultMessageService messageService;
    private final CoolSmsProperties coolSmsProperties;

    public SmsService(CoolSmsProperties coolSmsProperties) {
        this.coolSmsProperties = coolSmsProperties;
        this.messageService = NurigoApp.INSTANCE.initialize(
                coolSmsProperties.getApiKey(),
                coolSmsProperties.getApiSecret(),
                "https://api.coolsms.co.kr"
        );
    }

    public void sendVerificationCode(String to, String verificationCode) throws NurigoMessageNotReceivedException, NurigoEmptyResponseException, NurigoUnknownException {
        Message message = new Message();
        message.setFrom(coolSmsProperties.getFromNumber());
        message.setTo(to);
        message.setText("[인증번호] " + verificationCode + " 를 입력해주세요.");

        messageService.send(message);
    }
}