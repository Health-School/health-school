"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ReceiptModal from "@/components/receipt/ReceiptModal";
import DashboardSidebar from "@/components/dashboard/UserDashboardSidebar";

interface User {
  id: number;
  email: string;
  nickname: string;
}

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

interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
}

export default function MyOrderListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>("전체 기간");
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Fetch current user function
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/me`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      setCurrentUser(data.data);
      return data.data;
    } catch (error) {
      console.error("사용자 정보 조회 실패:", error);
      setError("사용자 정보를 가져오는데 실패했습니다.");
      return null;
    }
  };

  // Fetch orders function
  const fetchOrders = async (selectedPeriod: string, pageNumber: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/v1/orders/history?period=${encodeURIComponent(
          selectedPeriod
        )}&page=${pageNumber}&size=10&sort=approvedAt,desc`,
        {
          credentials: "include",
        }
      );
      const data: PageResponse<Order> = await response.json();

      if (data && data.content) {
        setOrders(data.content);
        setTotalPages(data.totalPages);
        setError(null);
      } else {
        setError("결제 내역을 불러오는데 실패했습니다.");
      }
    } catch (err: any) {
      console.error("결제 내역 조회 에러:", err);
      setError("결제 내역을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      const user = await fetchCurrentUser();
      if (user) {
        await fetchOrders(period, page);
      } else {
        setLoading(false);
      }
    };

    initializeData();
  }, [period, page]);

  // 결제 상태에 따른 스타일 반환
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "DONE":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "CANCELED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // 결제 상태 텍스트 반환
  const getStatusText = (status: string) => {
    switch (status) {
      case "DONE":
        return "완료";
      case "PENDING":
        return "대기중";
      case "FAILED":
        return "실패";
      case "CANCELED":
        return "취소됨";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">로그인이 필요한 서비스입니다.</p>
            <Link
              href="/login"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              로그인하기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 사이드바 */}
      <DashboardSidebar />

      {/* 메인 컨텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* 페이지 제목 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                결제 내역
              </h1>
              <p className="text-gray-600">
                결제한 강의와 결제 정보를 확인하세요.
              </p>
            </div>

            {/* 필터 섹션 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    결제 내역 조회
                  </h2>
                  <p className="text-sm text-gray-500">
                    기간을 선택하여 결제 내역을 필터링할 수 있습니다.
                  </p>
                </div>
                <select
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                >
                  <option value="전체 기간">전체 기간</option>
                  <option value="1개월">1개월</option>
                  <option value="3개월">3개월</option>
                  <option value="6개월">6개월</option>
                </select>
              </div>
            </div>

            {/* 결제 내역 테이블 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  결제 목록
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  총 {orders.length}개의 결제 내역
                </p>
              </div>

              {orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          주문 날짜
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          주문 번호
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          강의명
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          트레이너
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          결제 금액
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          결제 방법
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          상태
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          영수증
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex flex-col">
                              <span>
                                {new Date(order.requestAt).toLocaleDateString(
                                  "ko-KR"
                                )}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(order.requestAt).toLocaleTimeString(
                                  "ko-KR",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                            {order.id}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs truncate">
                              <Link
                                href={`/lecture/${order.lectureId}`}
                                className="text-green-600 hover:text-green-700 hover:underline"
                              >
                                {order.lectureTitle}
                              </Link>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.trainerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {order.amount.toLocaleString()}원
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {order.tossPaymentMethod || "카드"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(
                                order.orderStatus
                              )}`}
                            >
                              {getStatusText(order.orderStatus)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => setSelectedOrderId(order.id)}
                              className="text-green-600 hover:text-green-700 font-medium hover:underline transition-colors"
                            >
                              보기
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-4xl">💳</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    결제 내역이 없습니다
                  </h3>
                  <p className="text-gray-500 mb-6">
                    아직 구매한 강의가 없어요. 새로운 강의를 둘러보세요!
                  </p>
                  <Link
                    href="/lecture"
                    className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    강의 둘러보기
                  </Link>
                </div>
              )}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    page === 0
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
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        page === i
                          ? "bg-green-500 text-white shadow-lg"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page === totalPages - 1}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    page === totalPages - 1
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

      {/* Receipt Modal */}
      {selectedOrderId && (
        <ReceiptModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
}
