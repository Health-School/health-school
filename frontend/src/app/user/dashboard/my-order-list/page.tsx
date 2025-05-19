"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ReceiptModal from "@/components/receipt/ReceiptModal";

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
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
    );
  }

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
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
    );
  }

  return (
    <div className="p-6">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <Link
            href="/user/dashboard/my-info"
            className="text-gray-500 hover:text-gray-700 py-4 px-2"
          >
            내 정보
          </Link>
          <Link
            href="/user/dashboard/my-lecture"
            className="text-gray-500 hover:text-gray-700 py-4 px-2"
          >
            수강 강의
          </Link>
          <Link
            href="/user/dashboard/my-order-list"
            className="text-green-500 border-b-2 border-green-500 py-4 px-2"
          >
            결제 내역
          </Link>
          <Link
            href="/user/dashboard/my-exercises"
            className="text-gray-500 hover:text-gray-700 py-4 px-2"
          >
            운동 기록 내역
          </Link>
          <Link
            href="/user/dashboard/my-inquiry"
            className="text-gray-500 hover:text-gray-700 py-4 px-2"
          >
            1:1 상담
          </Link>
          <Link
            href="/user/dashboard/todo-list"
            className="text-gray-500 hover:text-gray-700 py-4 px-2"
          >
            todo list
          </Link>
        </nav>
      </div>

      {/* Period Filter Dropdown */}
      <div className="flex justify-end mb-6">
        <select
          className="border rounded-md px-3 py-2 text-sm"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="전체 기간">전체 기간</option>
          <option value="1개월">1개월</option>
          <option value="3개월">3개월</option>
          <option value="6개월">6개월</option>
        </select>
      </div>

      {/* Order Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                주문 날짜
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                주문 번호
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상품명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                결제 금액
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                영수증
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.requestAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.lectureTitle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.amount.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 hover:text-green-800">
                    <button onClick={() => setSelectedOrderId(order.id)}>
                      보기
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  결제 내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex justify-center mt-8 space-x-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className={`px-3 py-2 rounded-md ${
              page === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
          >
            이전
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`px-3 py-2 rounded-md ${
                page === i ? "bg-green-500 text-white" : "hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page === totalPages - 1}
            className={`px-3 py-2 rounded-md ${
              page === totalPages - 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
          >
            다음
          </button>
        </div>
      )}

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
