import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/user/dashboard/my-info", label: "내 정보" },
  { href: "/user/dashboard/my-lecture", label: "수강 강의" },
  { href: "/user/dashboard/my-order-list", label: "결제 내역" },
  { href: "/user/dashboard/my-exercises", label: "운동 기록 내역" },
  { href: "/user/dashboard/my-inquiry", label: "1:1 상담" },
];

export default function DashboardTabs() {
  const pathname = usePathname();

  return (
    <div className="border-b border-gray-200 mb-6 bg-white">
      <nav className="flex space-x-8">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const tabClass = isActive
            ? "text-green-500 border-b-2 border-green-500 py-4 px-2 font-semibold"
            : "text-gray-500 hover:text-gray-700 py-4 px-2";
          return (
            <Link key={tab.href} href={tab.href} className={tabClass}>
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
