"use client";
import { useEffect, useRef, useState } from "react";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";

const generateRandomString = () =>
  window.btoa(String(Math.random())).slice(0, 20);
const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

export default function CheckoutPage() {
  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState<any>(null); // 타입을 any로 변경
  const [amount, setAmount] = useState({
    currency: "KRW",
    value: 50_000,
  });

  useEffect(() => {
    async function fetchPaymentWidgets() {
      const tossPayments = await loadTossPayments(clientKey);
      const widgetsInstance = tossPayments.widgets({
        customerKey: ANONYMOUS,
      });
      setWidgets(widgetsInstance);
    }

    fetchPaymentWidgets();
  }, [clientKey]);

  useEffect(() => {
    async function renderPaymentWidgets() {
      if (widgets == null) {
        return;
      }
      /**
       * 위젯의 결제금액을 결제하려는 금액으로 초기화하세요.
       * renderPaymentMethods, renderAgreement, requestPayment 보다 반드시 선행되어야 합니다.
       * @docs https://docs.tosspayments.com/sdk/v2/js#widgetssetamount
       */
      await widgets.setAmount(amount);
      console.log("widgets", widgets);
      await Promise.all([
        /**
         * 결제창을 렌더링합니다.
         * @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrenderpaymentmethods
         */
        widgets.renderPaymentMethods({
          selector: "#payment-method",
          // 렌더링하고 싶은 결제 UI의 variantKey
          // 결제 수단 및 스타일이 다른 멀티 UI를 직접 만들고 싶다면 계약이 필요해요.
          // @docs https://docs.tosspayments.com/guides/v2/payment-widget/admin#새로운-결제-ui-추가하기
          variantKey: "DEFAULT",
        }),
        /**
         * 약관을 렌더링합니다.
         * @docs https://docs.tosspayments.com/reference/widget-sdk#renderagreement선택자-옵션
         */
        widgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        }),
      ]);

      setReady(true);
    }

    renderPaymentWidgets();
  }, [widgets]);

  return (
    <div className="flex flex-col items-center p-6 overflow-auto">
      <div className="max-w-[540px] w-full">
        <div id="payment-method" className="w-[120%]" />
        <div id="agreement" className="w-full" />
        <div className="w-full p-6">
          <button
            className="w-full py-3 px-6 bg-[#3282f6] text-white font-semibold text-lg rounded-md hover:bg-[#1f6af7]"
            onClick={async () => {
              // const generatedOrderId = generateRandomString(); // 랜덤한 orderId 생성

              try {
                // 1. 서버에 결제 정보 임시 저장 요청
                const response = await fetch(
                  `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/orders/create-order`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    credentials: "include", // 쿠키 포함

                    body: JSON.stringify({
                      // orderId: generatedOrderId, // generate random order ID
                      amount: amount.value, // 금액 정보
                      lectureId: 1, // 강의 번호 추가
                    }),
                  }
                );

                if (!response.ok) {
                  throw new Error(
                    "서버에 결제 정보를 저장하는 데 실패했습니다."
                  );
                }

                const json = await response.json();
                const generatedOrderId = json.data?.orderId; // 서버에서 생성된 orderId
                if (!generatedOrderId) {
                  throw new Error("서버에서 생성된 orderId가 없습니다.");
                }
                console.log("generatedOrderId", generatedOrderId);
                /**
                 * 결제 요청
                 * 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
                 * 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
                 * @docs https://docs.tosspayments.com/sdk/v2/js#widgetsrequestpayment
                 */
                await widgets?.requestPayment({
                  orderId: generatedOrderId,
                  orderName: "토스 티셔츠 외 2건",
                  customerName: "김토스",
                  customerEmail: "customer123@gmail.com",
                  successUrl:
                    window.location.origin +
                    "/test/order/tosspayments/success" +
                    window.location.search,
                  failUrl:
                    window.location.origin +
                    "/test/order/tosspayments/fail" +
                    window.location.search,
                });
              } catch (error) {
                // TODO: 에러 처리
              }
            }}
          >
            결제하기
          </button>
        </div>
      </div>
    </div>
  );
}
