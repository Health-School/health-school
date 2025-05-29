import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const tabs = [
  {
    href: "/trainer/dashboard/my-lectures",
    label: "MY 강의 관리",
    icon: "📚",
  },
  {
    href: "/trainer/dashboard/settlements",
    label: "정산 내역",
    icon: "💰",
  },
  {
    href: "/trainer/dashboard/students",
    label: "수강생 관리",
    icon: "👥",
  },
  {
    href: "/trainer/dashboard/consultations",
    label: "상담 일정",
    icon: "💬",
  },
  {
    href: "/trainer/dashboard/equipments",
    label: "운동 기구 신청",
    icon: "🏋️",
  },
  {
    href: "/trainer/dashboard/certificates",
    label: "MY 자격증 관리",
    icon: "🏆",
  },
];

export default function TrainerDashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } min-h-screen`}
    >
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-800">
              트레이너 대시보드
            </h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <svg
              className={`w-5 h-5 transition-transform ${
                isCollapsed ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="p-2">
        <ul className="space-y-1">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <li key={tab.href} className="relative group">
                <Link
                  href={tab.href}
                  className={`group flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-green-50 text-green-700 border-l-4 border-green-500"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="text-xl mr-3 flex-shrink-0">{tab.icon}</span>
                  {!isCollapsed && (
                    <span className="font-medium truncate">{tab.label}</span>
                  )}
                  {isActive && !isCollapsed && (
                    <span className="ml-auto w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </Link>

                {/* 툴팁 (접힌 상태일 때) */}
                {isCollapsed && (
                  <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap">
                    {tab.label}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
