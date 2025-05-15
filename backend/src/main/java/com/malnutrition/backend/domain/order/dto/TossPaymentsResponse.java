package com.malnutrition.backend.domain.order.dto;


import com.malnutrition.backend.domain.order.enums.TossPaymentMethod;
import com.malnutrition.backend.domain.order.enums.TossPaymentStatus;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;

@Getter
@ToString
public class TossPaymentsResponse {

    private String mId;
    private String lastTransactionKey;
    private String paymentKey;
    private String orderId;
    private String orderName;
    private long taxExemptionAmount;
    private TossPaymentStatus status;
    private ZonedDateTime requestedAt;
    private ZonedDateTime approvedAt;
    private boolean useEscrow;
    private boolean cultureExpense;
    private Card card;
    private Object virtualAccount;
    private Object transfer;
    private Object mobilePhone;
    private Object giftCertificate;
    private Object cashReceipt;
    private Object cashReceipts;
    private Object discount;
    private Object cancels;
    private String secret;
    private String type;
    private EasyPay easyPay;
    private String country;
    private Object failure;
    private boolean isPartialCancelable;
    private Receipt receipt;
    private Checkout checkout;
    private String currency;
    private long totalAmount;
    private long balanceAmount;
    private long suppliedAmount;
    private long vat;
    private long taxFreeAmount;
    private TossPaymentMethod method;
    private String version;
    private Object metadata;

    public static class Card {
        private String issuerCode;
        private String acquirerCode;
        private String number;
        private long installmentPlanMonths;
        private boolean isInterestFree;
        private String interestPayer;
        private String approveNo;
        private boolean useCardPoint;
        private String cardType;
        private String ownerType;
        private String acquireStatus;
        private long amount;
    }

    public static class EasyPay {
        private String provider;
        private long amount;
        private long discountAmount;
    }

    public static class Receipt {
        private String url;
    }

    public static class Checkout {
        private String url;
    }
}