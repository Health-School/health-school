"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useGlobalLoginUser } from "@/stores/auth/loginUser";
import AlarmBell from "@/components/alarm/AlarmBell";

export default function Header({ hideDropdownMenus = false }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { isLogin, loginUser, logoutAndHome, isLoginUserPending } =
    useGlobalLoginUser();

  // 드롭다운 ref 추가
  const dropdownRef = useRef<HTMLDivElement>(null);

  console.log("loginUser:::" + JSON.stringify(loginUser));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // 외부 클릭 감지를 위한 useEffect 추가
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    // 드롭다운이 열려있을 때만 이벤트 리스너 추가
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // 클린업 함수
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  if (isLoginUserPending) {
    return <div>로딩중...</div>;
  }

  const isAdmin = isLogin && loginUser?.roleName === "ADMIN";

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-[1600px] mx-auto ">
        <div className="flex justify-between items-center ">
          {/* 로고 */}
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Health School Logo"
                width={200}
                height={50}
                className="cursor-pointer"
              />
            </Link>
          </div>
          {/* 우측 메뉴 */}

          <div className="flex items-center">
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="ml-3 text-gray-700 hover:text-green-600 font-semibold px-4  transition"
              >
                {" "}
                관리자
              </Link>
            )}

            <Link
              href="/lecture"
              className="ml-1 text-gray-700 hover:text-green-600 font-semibold px-4  transition"
            >
              강의
            </Link>
            {isLogin ? <AlarmBell /> : null}
            <div className="flex items-center space-x-4">
              {!hideDropdownMenus && (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="강의를 검색하세요"
                    className="px-3 py-1 border border-gray-300 rounded-l-md focus:outline-none focus:border-green-500"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-r-md transition-colors cursor-pointer"
                    title="검색"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="text-gray-600"
                      viewBox="0 0 16 16"
                    >
                      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                    </svg>
                  </button>
                </form>
              )}

              {isLogin ? (
                <div className="relative" ref={dropdownRef}>
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={toggleDropdown}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center">
                      {loginUser?.profileImageUrl ? (
                        <Image
                          src={loginUser.profileImageUrl}
                          alt="프로필 이미지"
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-gray-600">
                          {loginUser?.nickname?.charAt(0) || "유"}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">{loginUser?.nickname}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className={`transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 16 16"
                    >
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                    </svg>
                  </div>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-25 border border-gray-200">
                      {!hideDropdownMenus && (
                        <>
                          <Link
                            href="/"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            홈 페이지
                          </Link>
                          {/* 트레이너인 경우 두 개의 대시보드 메뉴 표시 */}
                          {loginUser.roleName === "TRAINER" ? (
                            <>
                              <Link
                                href="/user/dashboard/my-info"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                마이 대시보드
                              </Link>
                              <Link
                                href="/trainer/dashboard/my-lectures"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                트레이너 대시보드
                              </Link>
                            </>
                          ) : (
                            <Link
                              href="/user/dashboard/my-info"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              마이 대시보드
                            </Link>
                          )}
                          <Link
                            href={`/lecture`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            강의
                          </Link>

                          <hr className="my-1" />
                        </>
                      )}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logoutAndHome();
                        }}
                        className="cursor-pointer block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/user/login"
                    className="text-gray-600 hover:text-green-600"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/user/join"
                    className="text-gray-600 hover:text-green-600"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
