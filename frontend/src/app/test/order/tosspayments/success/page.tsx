"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
// Next.js에서 useRouter 훅을 가져옵니다.

export default function SuccessPage() {
  const [isConfirmed, setIsConfirmed] = useState(false);
  // ✅ 각각 직접 가져오기
  const searchParams = useSearchParams();

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  async function confirmPayment() {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/tosspayments/confirm`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 쿠키 포함
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
        }),
      }
    );

    if (response.ok) {
      setIsConfirmed(true);
    } else {
      const errorData = await response.json();
      console.error("Error confirming payment:", errorData);
    }
  }

  return (
    <div className="flex flex-col items-center w-full">
      {isConfirmed ? (
        <div className="flex flex-col items-center w-full max-w-[540px]">
          <img
            src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png"
            width="120"
            height="120"
            alt="결제 완료 이미지"
          />
          <h2 className="text-2xl font-bold text-gray-800 mt-4">
            결제를 완료했어요
          </h2>
          <div className="w-full mt-6">
            <div className="flex justify-between mb-4">
              <span className="font-semibold text-gray-600">결제 금액</span>
              <span id="amount" className="text-lg text-gray-800">
                {amount}
              </span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="font-semibold text-gray-600">주문번호</span>
              <span id="orderId" className="text-lg text-gray-800">
                {orderId}
              </span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="font-semibold text-gray-600">paymentKey</span>
              <span id="paymentKey" className="text-lg text-gray-800">
                {paymentKey}
              </span>
            </div>
          </div>

          <div className="w-full mt-8 flex gap-4">
            <a
              className="btn w-full py-3 px-6 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              href="https://developers.tosspayments.com/sandbox"
            >
              다시 테스트하기
            </a>
            <a
              className="btn w-full py-3 px-6 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              href="https://docs.tosspayments.com/guides/v2/payment-widget/integration"
              target="_blank"
              rel="noopener noreferrer"
            >
              결제 연동 문서가기
            </a>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full max-w-[540px]">
          <div className="flex flex-col items-center">
            <img
              src="https://static.toss.im/lotties/loading-spot-apng.png"
              width="120"
              height="120"
              alt="로딩 이미지"
            />
            <h2 className="text-2xl font-bold text-gray-800 text-center mt-4">
              결제 요청까지 성공했어요.
            </h2>
            <h4 className="text-center text-lg text-gray-600 mt-2">
              결제 승인하고 완료해보세요.
            </h4>
          </div>
          <div className="w-full mt-8">
            <button
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-500"
              onClick={confirmPayment}
            >
              결제 승인하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
