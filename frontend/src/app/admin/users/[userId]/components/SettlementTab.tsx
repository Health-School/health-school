// ==========================================================
// ▼▼▼▼▼▼▼▼▼▼ 이 아래 코드를 SettlementTab.tsx 파일에 넣어줘 ▼▼▼▼▼▼▼▼▼▼
// ==========================================================
"use client";

import React, { useState, useEffect } from 'react';

// 날짜 포맷팅 함수
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(/\. /g, '-').replace('.', '');
  } catch (e) {
    console.error("날짜 포맷팅 오류:", e, "원본:", dateString);
    return dateString;
  }
};

// 숫자를 원화 포맷으로 변경하는 함수
const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return '0원';
  return amount.toLocaleString('ko-KR') + '원';
};

interface SettlementTabProps {
  trainerId: string | string[] | undefined;
  apiBaseUrl: string;
  userNickname: string;
}

// 백엔드 TrainerSettlementDto 타입
interface TrainerSettlementDto {
  totalSettlement: number;
  currentMonthSettlement: number;
  currentYearSettlement: number;
}

// 백엔드 SettlementOrderDto 타입
interface SettlementOrderDto {
  orderId: string;
  lectureName: string;
  userName: string; // 구매자 닉네임
  amount: number;
  approvedAt: string; // 결제 승인 일시
}

const SettlementTab: React.FC<SettlementTabProps> = ({ trainerId, apiBaseUrl, userNickname }) => {
  const [settlementSummary, setSettlementSummary] = useState<TrainerSettlementDto | null>(null);
  const [settlementOrders, setSettlementOrders] = useState<SettlementOrderDto[]>([]);

  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [isOrdersLoading, setIsOrdersLoading] = useState<boolean>(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const PAGE_SIZE = 5; // 한 페이지에 보여줄 정산 주문 수

  // 정산 요약 정보 가져오기
  useEffect(() => {
    const fetchSettlementSummary = async () => {
      if (!trainerId) return;
      setIsSummaryLoading(true);
      setSummaryError(null);
      try {
        const response = await fetch(
          `${apiBaseUrl}/api/v1/admin/users/${trainerId}/settlement-summary`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include' }
        );
        if (!response.ok) throw new Error(`정산 요약 정보 로딩 실패: ${response.status}`);
        const responseData = await response.json();
        if (responseData.success && responseData.data) {
          setSettlementSummary(responseData.data);
        } else {
          throw new Error(responseData.message || '정산 요약 데이터를 가져오지 못했습니다.');
        }
      } catch (err) {
        setSummaryError(err instanceof Error ? err.message : '정산 요약 로딩 중 알 수 없는 오류');
        setSettlementSummary(null);
      } finally {
        setIsSummaryLoading(false);
      }
    };
    fetchSettlementSummary();
  }, [trainerId, apiBaseUrl]);

  // 정산될 주문 목록 가져오기 (페이지네이션)
  useEffect(() => {
    const fetchSettlementOrders = async () => {
      if (!trainerId) return;
      setIsOrdersLoading(true);
      setOrdersError(null);
      try {
        const response = await fetch(
          `${apiBaseUrl}/api/v1/admin/users/${trainerId}/settlement-orders?page=${currentPage}&size=${PAGE_SIZE}&sort=approvedAt,desc`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include' }
        );
        if (!response.ok) throw new Error(`정산 주문 목록 로딩 실패: ${response.status}`);
        const responseData = await response.json();
        if (responseData.success && responseData.data && responseData.data.content) {
          setSettlementOrders(responseData.data.content);
          setTotalPages(responseData.data.totalPages);
        } else {
          throw new Error(responseData.message || '정산 주문 목록 데이터를 가져오지 못했습니다.');
        }
      } catch (err) {
        setOrdersError(err instanceof Error ? err.message : '정산 주문 목록 로딩 중 알 수 없는 오류');
        setSettlementOrders([]);
        setTotalPages(0);
      } finally {
        setIsOrdersLoading(false);
      }
    };
    fetchSettlementOrders();
  }, [trainerId, currentPage, apiBaseUrl, PAGE_SIZE]);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-6">
        {userNickname} 님의 정산/결산 내역
      </h3>

      {/* 정산 요약 카드 */}
      <div className="mb-8">
        <h4 className="text-md font-semibold mb-3 text-gray-700">결산 요약</h4>
        {isSummaryLoading && <p className="text-center p-4">요약 정보를 불러오는 중...</p>}
        {summaryError && <p className="text-center p-4 text-red-500">요약 정보 로딩 오류: {summaryError}</p>}
        {settlementSummary && !isSummaryLoading && !summaryError && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-white shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">이번 달 정산액</span>
                <i className="fas fa-calendar-day opacity-70"></i>
              </div>
              <div className="text-2xl font-bold">{formatCurrency(settlementSummary.currentMonthSettlement)}</div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-sky-600 rounded-lg p-4 text-white shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">올해 정산액</span>
                <i className="fas fa-calendar-alt opacity-70"></i>
              </div>
              <div className="text-2xl font-bold">{formatCurrency(settlementSummary.currentYearSettlement)}</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg p-4 text-white shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">총 정산액</span>
                <i className="fas fa-coins opacity-70"></i>
              </div>
              <div className="text-2xl font-bold">{formatCurrency(settlementSummary.totalSettlement)}</div>
            </div>
          </div>
        )}
      </div>

      {/* 정산될 주문 목록 */}
      <div>
        <h4 className="text-md font-semibold mb-3 text-gray-700">정산 예정 주문 목록</h4>
        {isOrdersLoading && <p className="text-center p-4">주문 목록을 불러오는 중...</p>}
        {ordersError && <p className="text-center p-4 text-red-500">주문 목록 로딩 오류: {ordersError}</p>}
        {!isOrdersLoading && !ordersError && settlementOrders.length === 0 && (
          <p className="text-center p-4">정산될 주문 내역이 없습니다.</p>
        )}
        {!isOrdersLoading && !ordersError && settlementOrders.length > 0 && (
          <>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주문 ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">강의명</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">구매자</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">정산 금액</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">결제 승인일시</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {settlementOrders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.orderId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.lectureName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.userName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{formatCurrency(order.amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.approvedAt)}</td>
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
          </>
        )}
      </div>
    </div>
  );
};

export default SettlementTab;