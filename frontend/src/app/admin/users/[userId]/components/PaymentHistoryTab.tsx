"use client";

import React, { useState, useEffect } from 'react';

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\. /g, '-').replace('.', '');
  } catch (e) {
    console.error("날짜 포맷팅 오류:", e, "원본:", dateString);
    return dateString;
  }
};

// 결제 상태를 한글로 변환하는 함수
const getPaymentStatusInKorean = (status: string) => {
  if (status === 'COMPLETED') return { text: '결제완료', className: 'bg-green-100 text-green-800' };
  if (status === 'PENDING') return { text: '결제대기', className: 'bg-yellow-100 text-yellow-800' };
  if (status === 'FAILED') return { text: '결제실패', className: 'bg-red-100 text-red-800' };
  if (status === 'CANCEL') return { text: '결제취소', className: 'bg-gray-100 text-gray-800' };
  return { text: status, className: 'bg-gray-100 text-gray-800' };
};


interface PaymentHistoryTabProps {
  userId: string | string[] | undefined;
  apiBaseUrl: string;
  userNickname: string;
}

interface OrderResponseDto {
  id: string; // 주문 ID
  lectureTitle: string;
  trainerName: string;
  amount: number;
  tossPaymentMethod?: string; // 카드, 계좌이체 등
  approvedAt: string; // 결제 승인 일시
  orderStatus: string; // COMPLETED, CANCEL 등
}

const PaymentHistoryTab: React.FC<PaymentHistoryTabProps> = ({ userId, apiBaseUrl, userNickname }) => {
  const [paymentHistory, setPaymentHistory] = useState<OrderResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const PAGE_SIZE = 10; // 한 페이지에 보여줄 결제 내역 수

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);
      console.log(`PaymentHistoryTab: userId ${userId}, page ${currentPage} 데이터 가져오기 시작`);

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/v1/admin/users/${userId}/payment-history?page=${currentPage}&size=${PAGE_SIZE}&sort=approvedAt,desc`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }
        );

        console.log(`PaymentHistoryTab: 응답 상태: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `결제 내역을 가져오는데 실패했습니다. 상태: ${response.status}`;
          try { const errorJson = JSON.parse(errorText); errorMessage = errorJson.message || errorMessage; } catch (e) { /*nop*/ }
          throw new Error(errorMessage);
        }

        const responseData = await response.json();
        console.log(`PaymentHistoryTab: API 응답 데이터:`, responseData);

        if (responseData.success && responseData.data && responseData.data.content) {
          setPaymentHistory(responseData.data.content);
          setTotalPages(responseData.data.totalPages);
        } else {
          throw new Error(responseData.message || '결제 내역 데이터를 올바르게 가져오지 못했습니다.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '결제 내역 로딩 중 알 수 없는 오류');
        setPaymentHistory([]);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [userId, currentPage, apiBaseUrl, PAGE_SIZE]);

  if (isLoading) return <p className="text-center p-4">결제 내역을 불러오는 중...</p>;
  if (error) return <p className="text-center p-4 text-red-500">오류: {error}</p>;
  if (!isLoading && paymentHistory.length === 0) return <p className="text-center p-4">결제 내역이 없습니다.</p>;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        {userNickname} 님의 결제 내역
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주문ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">강의명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">강사명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">결제금액</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">결제수단</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">결제일시</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paymentHistory.map((payment) => (
              <tr key={payment.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline cursor-pointer">{payment.lectureTitle}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.trainerName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  {payment.amount ? payment.amount.toLocaleString() : '0'}원
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.tossPaymentMethod || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(payment.approvedAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    getPaymentStatusInKorean(payment.orderStatus).className
                  }`}>
                    {getPaymentStatusInKorean(payment.orderStatus).text}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            이전
          </button>
          {Array.from({ length: totalPages }, (_, i) => i).map(pageIndex => (
            <button
              key={pageIndex}
              onClick={() => setCurrentPage(pageIndex)}
              className={`px-3 py-1 border rounded-md ${
                currentPage === pageIndex ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              {pageIndex + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1 || totalPages === 0}
            className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryTab;