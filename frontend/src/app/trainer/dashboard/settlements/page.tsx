"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { format } from "date-fns";

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

  const tabs = [
    { name: "MY 강의 관리", href: "/trainer/dashboard/my-lectures" },
    { name: "정산 내역", href: "/trainer/dashboard/settlements" },
    { name: "수강생 관리", href: "/trainer/dashboard/students" },
    { name: "상담 일정", href: "/trainer/dashboard/consultations" },
    { name: "운동 기구 신청", href: "/trainer/dashboard/equipments" },
    { name: "MY 자격증 관리", href: "/trainer/dashboard/certificates" },
  ];

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
    <div className="max-w-7xl mx-auto p-6">
      {/* Tab Menu */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={`${
                pathname === tab.href
                  ? "text-green-500 border-b-2 border-green-500 font-semibold"
                  : "text-gray-500 border-transparent border-b-2 font-medium"
              } py-4 px-2 hover:text-green-700 transition-colors`}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Summary Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            이번 달 정산
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {summaryData.monthly.toLocaleString()}원
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {currentYearMonth.replace("-", "년 ")}월
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-2">올해 정산</h3>
          <p className="text-2xl font-bold text-gray-900">
            {summaryData.yearly.toLocaleString()}원
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {selectedMonth.split("-")[0]}년
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-2">총 정산</h3>
          <p className="text-2xl font-bold text-gray-900">
            {summaryData.total.toLocaleString()}원
          </p>
          <p className="text-sm text-gray-500 mt-1">전체 기간</p>
        </div>
      </div>

      {/* Total Amount Summary */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">정산 내역</h2>
            <p className="text-sm text-gray-500">
              {selectedMonth.replace("-", "년 ")}월 정산 금액:{" "}
              <span className="font-medium text-gray-900">
                {totalAmount.toLocaleString()}원
              </span>
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            />
            <p className="text-sm text-gray-500">총 {settlements.length}건</p>
          </div>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                주문 번호
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                강의명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                수강생
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                금액
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                결제일
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  로딩 중...
                </td>
              </tr>
            ) : settlements.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  정산 내역이 없습니다.
                </td>
              </tr>
            ) : (
              settlements.map((settlement) => (
                <tr key={settlement.orderId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {settlement.orderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {settlement.lectureName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {settlement.userName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {settlement.amount.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(settlement.approvedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center">
        <nav className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50"
          >
            이전
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`px-3 py-1 rounded text-sm ${
                currentPage === i
                  ? "bg-green-500 text-white"
                  : "border border-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
            }
            disabled={currentPage === totalPages - 1}
            className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50"
          >
            다음
          </button>
        </nav>
      </div>
    </div>
  );
}
