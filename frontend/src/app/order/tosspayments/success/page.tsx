"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SuccessPage() {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [paymentKey, setPaymentKey] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPaymentKey(params.get("paymentKey"));
    setOrderId(params.get("orderId"));
    setAmount(params.get("amount"));
  }, []);

  async function confirmPayment() {
    if (!paymentKey || !orderId || !amount) {
      console.error("결제 정보가 부족합니다.");
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/tosspayments/confirm`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-xl w-full border border-gray-200 flex flex-col items-center">
        {isConfirmed ? (
          <>
            <img
              src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png"
              width="140"
              height="140"
              alt="결제 완료 이미지"
              className="mb-6"
            />
            <h2 className="text-3xl font-bold text-gray-800 mt-4">
              결제를 완료했어요
            </h2>
            <div className="w-full mt-6">
              <div className="flex justify-between my-4">
                <span className="font-semibold text-gray-600">결제 금액</span>
                <span id="amount" className="text-lg text-gray-800">
                  {amount}
                </span>
              </div>
              <div className="flex justify-between my-4">
                <span className="font-semibold text-gray-600">주문번호</span>
                <span id="orderId" className="text-lg text-gray-800">
                  {orderId}
                </span>
              </div>
              <div className="flex justify-between my-4">
                <span className="font-semibold text-gray-600">paymentKey</span>
                <span id="paymentKey" className="text-lg text-gray-800">
                  {paymentKey}
                </span>
              </div>
            </div>

            <div className="w-full mt-10 flex gap-6">
              <Link
                className="btn w-full py-4 px-8 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-center text-lg font-semibold"
                href="/user/dashboard/my-order-list"
              >
                주문 내역 보기
              </Link>
              <Link
                className="btn w-full py-4 px-8 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-center text-lg font-semibold"
                href="/user/dashboard/my-lecture"
              >
                강의 리스트 보기
              </Link>
            </div>
          </>
        ) : (
          <>
            <img
              src="https://static.toss.im/lotties/loading-spot-apng.png"
              width="140"
              height="140"
              alt="로딩 이미지"
              className="mb-6"
            />
            <h2 className="text-3xl font-bold text-gray-800 text-center mt-4">
              결제 요청까지 성공했어요.
            </h2>
            <h4 className="text-center text-xl text-gray-600 mt-4">
              결제 승인하고 완료해보세요.
            </h4>
            <div className="w-full mt-10">
              <button
                className="w-full py-4 px-8 bg-blue-600 text-white rounded-md hover:bg-blue-500 font-semibold text-xl"
                onClick={confirmPayment}
              >
                결제 승인하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
