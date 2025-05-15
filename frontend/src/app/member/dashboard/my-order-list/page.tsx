"use client";

import Link from "next/link";

export default function MyOrderListPage() {
  const orders = [
    {
      id: "ORD-20250501",
      date: "2025.05.01",
      name: "초보자를 위한 요가 클래스",
      price: 39000,
      status: "결제완료",
    },
    {
      id: "ORD-20250420",
      date: "2025.04.20",
      name: "효과적인 웨이트 트레이닝",
      price: 49000,
      status: "결제완료",
    },
    {
      id: "ORD-20250410",
      date: "2025.04.10",
      name: "코어 강화 필라테스",
      price: 45000,
      status: "결제완료",
    },
    {
      id: "ORD-20250325",
      date: "2025.03.25",
      name: "집에서 하는 HIIT 트레이닝",
      price: 35000,
      status: "결제완료",
    },
  ];

  return (
    <div className="p-6">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <Link
            href="/member/dashboard/my-info"
            className="text-gray-500 hover:text-gray-700 py-4 px-2"
          >
            내 정보
          </Link>
          <Link
            href="/member/dashboard/my-lecture"
            className="text-gray-500 hover:text-gray-700 py-4 px-2"
          >
            수강 강의
          </Link>
          <Link
            href="/member/dashboard/my-order-list"
            className="text-green-500 border-b-2 border-green-500 py-4 px-2"
          >
            결제 내역
          </Link>
          <Link
            href="/member/dashboard/my-exercises"
            className="text-gray-500 hover:text-gray-700 py-4 px-2"
          >
            운동 기록 내역
          </Link>
          <Link
            href="/member/dashboard/my-inquiry"
            className="text-gray-500 hover:text-gray-700 py-4 px-2"
          >
            내 문의
          </Link>
        </nav>
      </div>

      {/* Filter Dropdown */}
      <div className="flex justify-end mb-6">
        <select className="border rounded-md px-3 py-2 text-sm">
          <option value="all">전체 기간</option>
          <option value="1month">1개월</option>
          <option value="3months">3개월</option>
          <option value="6months">6개월</option>
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
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.price.toLocaleString()}원
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 hover:text-green-800">
                  <button>보기</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8 space-x-2">
        <button className="px-3 py-2 rounded-md hover:bg-gray-100">
          <span className="sr-only">Previous</span>
          &lt;
        </button>
        <button className="px-3 py-2 rounded-md bg-green-500 text-white">
          1
        </button>
        <button className="px-3 py-2 rounded-md hover:bg-gray-100">2</button>
        <button className="px-3 py-2 rounded-md hover:bg-gray-100">
          <span className="sr-only">Next</span>
          &gt;
        </button>
      </div>
    </div>
  );
}
