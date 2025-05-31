"use client";

import { useEffect, useState } from "react";

interface Order {
  id: string;
  amount: number;
  orderStatus: string;
  tossPaymentMethod: string;
  requestAt: string;
  approvedAt: string;
  lectureId: number;
  lectureTitle: string;
  trainerName: string;
}

interface ReceiptModalProps {
  orderId: string;
  onClose: () => void;
}

export default function ReceiptModal({ orderId, onClose }: ReceiptModalProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefunding, setIsRefunding] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/orders/${orderId}`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        if (data.success) {
          setOrder(data.data);
        } else {
          setError(data.message || "영수증 정보를 불러오는데 실패했습니다.");
        }
      } catch (err) {
        setError("영수증 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleRefund = async () => {
    if (!order) return;

    const isConfirmed = window.confirm(
      `정말로 환불하시겠습니까?\n강의: ${order.lectureTitle}\n금액: ${order.amount.toLocaleString()}원`
    );

    if (!isConfirmed) return;

    setIsRefunding(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/tosspayments/cancel-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            orderId: order.id,
            cancelReason: "강의 불만족",
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("환불이 성공적으로 처리되었습니다.");
        // 주문 상태 업데이트
        setOrder((prev) =>
          prev ? { ...prev, orderStatus: "결제 취소" } : null
        );
      } else {
        console.log("환불 실패:", data);
        alert(data.message || "환불 처리에 실패했습니다.");
      }
    } catch (err) {
      console.error("환불 요청 중 오류:", err);
      alert("환불 처리 중 오류가 발생했습니다.");
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : order ? (
          <div className="mt-2">
            <h3 className="text-lg font-semibold text-center mb-4">
              결제 영수증
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">주문 번호</span>
                <span className="font-medium">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">강의명</span>
                <span className="font-medium">{order.lectureTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">트레이너</span>
                <span className="font-medium">{order.trainerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">결제 수단</span>
                <span className="font-medium">{order.tossPaymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">결제 요청 시간</span>
                <span className="font-medium">
                  {new Date(order.requestAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">결제 승인 시간</span>
                <span className="font-medium">
                  {new Date(order.approvedAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <span className="text-lg font-semibold">결제 금액</span>
                <span className="text-lg font-bold text-green-600">
                  {order.amount.toLocaleString()}원
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <span
                className={`px-5 py-2 rounded-full text-xl ${
                  order.orderStatus === "결제 완료"
                    ? "bg-green-100 text-green-800"
                    : order.orderStatus === "결제 취소"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {order.orderStatus}
              </span>
            </div>

            {/* 환불 버튼 - 결제 완료 상태일 때만 표시 */}
            {/* {order.orderStatus === "결제 완료" && (
              <div className="mt-6  text-right">
                <button
                  onClick={handleRefund}
                  disabled={isRefunding}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isRefunding
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                >
                  {isRefunding ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      환불 처리중...
                    </span>
                  ) : (
                    "환불"
                  )}
                </button>
              </div>
            )} */}
          </div>
        ) : null}
      </div>
    </div>
  );
}
