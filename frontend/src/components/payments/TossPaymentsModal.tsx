"use client";
import { useEffect, useState } from "react";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";

interface TossPaymentsModalProps {
  lectureId: number;
  amount: number;
  lectureTitle: string;
  onClose: () => void;
}

const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

export default function TossPaymentsModal({
  lectureId,
  amount,
  lectureTitle,
  onClose,
}: TossPaymentsModalProps) {
  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState<any>(null);

  useEffect(() => {
    async function fetchPaymentWidgets() {
      const tossPayments = await loadTossPayments(clientKey);
      const widgetsInstance = tossPayments.widgets({
        customerKey: ANONYMOUS,
      });
      setWidgets(widgetsInstance);
    }
    fetchPaymentWidgets();
  }, []);

  useEffect(() => {
    async function renderPaymentWidgets() {
      if (widgets == null) return;
      await widgets.setAmount({ currency: "KRW", value: amount });
      await Promise.all([
        widgets.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        }),
        widgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        }),
      ]);
      setReady(true);
    }
    renderPaymentWidgets();
  }, [widgets, amount]);

  return (
    <div className="flex flex-col items-center p-6 py-10 overflow-auto">
      <div className="max-w-[540px] w-full">
        <div id="payment-method" className="w-[100%]" />
        <div id="agreement" className="w-full" />
        <div className="w-full p-6 pt-8">
          <button
            className="w-full py-3 px-6  bg-[#3282f6] text-white font-semibold text-lg rounded-md hover:bg-[#1f6af7] cursor-pointer"
            onClick={async () => {
              try {
                const response = await fetch(
                  `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/orders/create-order`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                      amount,
                      lectureId,
                    }),
                  }
                );
                if (!response.ok) {
                  alert("이미 수강한 강의입니다.");
                  onClose();
                  throw new Error(
                    "서버에 결제 정보를 저장하는 데 실패했습니다."
                  );
                }
                const json = await response.json();
                const generatedOrderId = json.data?.orderId;
                if (!generatedOrderId) {
                  throw new Error("서버에서 생성된 orderId가 없습니다.");
                }
                await widgets?.requestPayment({
                  orderId: generatedOrderId,
                  orderName: lectureTitle,
                  customerName: "고객명",
                  customerEmail: "customer@email.com",
                  successUrl:
                    window.location.origin +
                    "/order/tosspayments/success" +
                    window.location.search,
                  failUrl:
                    window.location.origin +
                    "/order/tosspayments/fail" +
                    window.location.search,
                });
              } catch (error) {
                // TODO: 에러 처리
              }
            }}
            disabled={!ready}
          >
            결제하기
          </button>
          <button
            className="w-full mt-2 py-2 px-4 border rounded text-gray-600 cursor-pointer"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
