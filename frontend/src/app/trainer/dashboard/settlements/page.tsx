"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import TrainerDashboardSidebar from "@/components/dashboard/TrainerDashboardSidebar";

interface SettlementOrder {
  orderId: string;
  lectureName: string;
  userName: string;
  amount: number;
  approvedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  };
}

// SummaryData 인터페이스는 그대로 사용
interface SummaryData {
  monthly: number;
  yearly: number;
  total: number;
}

export default function SettlementsPage() {
  const pathname = usePathname();
  const [settlements, setSettlements] = useState<SettlementOrder[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [summaryData, setSummaryData] = useState<SummaryData>({
    monthly: 0,
    yearly: 0,
    total: 0,
  });

  const fetchSettlements = async (page: number) => {
    setIsLoading(true);
    try {
      const [year, month] = selectedMonth.split("-");
      // Add month validation to URL
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/orders/settlements?page=${page}&size=10&year=${year}&month=${month}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("정산 내역 조회에 실패했습니다.");
      }

      const result: ApiResponse<SettlementOrder> = await response.json();
      if (result.success) {
        // Filter settlements for the selected month
        const monthlySettlements = result.data.content.filter((settlement) => {
          const settlementDate = new Date(settlement.approvedAt);
          return (
            settlementDate.getFullYear() === parseInt(year) &&
            settlementDate.getMonth() === parseInt(month) - 1 // JavaScript months are 0-based
          );
        });

        setSettlements(monthlySettlements);
        setTotalPages(Math.ceil(monthlySettlements.length / 10));

        if (monthlySettlements.length === 0) {
          setTotalAmount(0);
        } else {
          const pageTotal = monthlySettlements.reduce(
            (sum, order) => sum + order.amount,
            0
          );
          setTotalAmount(pageTotal);
        }
      }
    } catch (error) {
      console.error("정산 내역 조회 오류:", error);
      setTotalAmount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // fetchSummaryData 함수를 수정합니다
  const fetchSummaryData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/orders/summary`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("정산 요약 조회에 실패했습니다.");
      }

      const result = await response.json();
      if (result.success) {
        // API 응답의 data를 그대로 사용
        setSummaryData({
          monthly: result.data.monthly,
          yearly: result.data.yearly,
          total: result.data.total,
        });

        console.log("정산 요약 데이터:", result.data);
      }
    } catch (error) {
      console.error("정산 요약 조회 오류:", error);
    }
  };

  useEffect(() => {
    fetchSettlements(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        await fetchSummaryData(); // 먼저 요약 데이터를 가져옵니다
        await fetchSettlements(0); // 그 다음 현재 페이지의 정산 내역을 가져옵니다
      } catch (error) {
        console.error("초기화 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [selectedMonth]);

  // 현재 날짜를 상수로 추가
  const currentDate = new Date();
  const currentYearMonth = format(currentDate, "yyyy-MM");

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 사이드바 */}
      <TrainerDashboardSidebar />

      {/* 메인 컨텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* 페이지 제목 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                정산 내역
              </h1>
              <p className="text-gray-600">
                강의 수익과 정산 내역을 확인하고 관리하세요.
              </p>
            </div>

            {/* Summary Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-2xl">💰</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      이번 달 정산
                    </h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {summaryData.monthly.toLocaleString()}원
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {currentYearMonth.replace("-", "년 ")}월
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-2xl">📅</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      올해 정산
                    </h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {summaryData.yearly.toLocaleString()}원
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedMonth.split("-")[0]}년
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-2xl">💎</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      총 정산
                    </h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {summaryData.total.toLocaleString()}원
                    </p>
                    <p className="text-sm text-gray-500 mt-1">전체 기간</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 정산 내역 섹션 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                {/* Total Amount Summary */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      정산 내역
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedMonth.replace("-", "년 ")}월 정산 금액:{" "}
                      <span className="font-medium text-green-600">
                        {totalAmount.toLocaleString()}원
                      </span>
                      {" • "}총 {settlements.length}건
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">
                        기간:
                      </label>
                      <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Settlements Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          주문 번호
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          강의명
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          수강생
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          금액
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          결제일
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-2"></div>
                              <span className="text-gray-500">로딩 중...</span>
                            </div>
                          </td>
                        </tr>
                      ) : settlements.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-3xl">📊</span>
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                정산 내역이 없습니다
                              </h3>
                              <p className="text-gray-500">
                                선택한 기간에 정산된 내역이 없습니다.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        settlements.map((settlement) => (
                          <tr
                            key={settlement.orderId}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                #{settlement.orderId}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {settlement.lectureName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {settlement.userName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-green-600">
                                {settlement.amount.toLocaleString()}원
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {new Date(
                                  settlement.approvedAt
                                ).toLocaleDateString("ko-KR")}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(0, prev - 1))
                      }
                      disabled={currentPage === 0}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm"
                      }`}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      이전
                    </button>

                    <div className="flex space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === i
                              ? "bg-green-500 text-white shadow-lg"
                              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(totalPages - 1, prev + 1)
                        )
                      }
                      disabled={currentPage === totalPages - 1}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === totalPages - 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm"
                      }`}
                    >
                      다음
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
