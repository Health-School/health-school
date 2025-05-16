"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGlobalLoginUser } from "@/stores/auth/loginUser";

export default function Header({ hideDropdownMenus = false }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const { isLogin, loginUser, logoutAndHome, isLoginUserPending } =
    useGlobalLoginUser();

  const handleSearchClick = () => {
    router.push("/search");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (isLoginUserPending) {
    return <div>로딩중...</div>;
  }

  return (
    <nav className="bg-white ">
      <div className="max-w-[1600px] mx-auto ">
        <div className="flex justify-between items-center h-16">
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
          <div className="flex items-center space-x-4">
            {!hideDropdownMenus && (
              <button
                onClick={handleSearchClick}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                title="검색"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  className="text-gray-600"
                  viewBox="0 0 16 16"
                >
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                </svg>
              </button>
            )}

            {isLogin ? (
              <div className="relative">
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
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
                    tabIndex={0}
                    onBlur={() => setIsDropdownOpen(false)}
                  >
                    {!hideDropdownMenus && (
                      <>
                        <Link
                          href="/"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          홈 페이지
                        </Link>
                        <Link
                          href="/user/dashboard/my-info"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          마이 대쉬보드
                        </Link>
                        <Link
                          href={`/${loginUser.nickname}`}
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
    </nav>
  );
}
