"use client";

import { useEffect } from "react";
import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { LoginUserContext, useLoginUser } from "@/stores/auth/loginUser";
import { usePathname } from "next/navigation";

// ✅ 추가
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

type LayoutProps = {
  children: React.ReactNode;
};

export default function ClientLayout({ children }: LayoutProps) {
  const pathname = usePathname();
  const isRootPage = pathname === "/";

  // ✅ QueryClient 추가

  const {
    loginUser,
    setLoginUser,
    isLoginUserPending,
    isLogin,
    setNoLoginUser,
    logout,
    logoutAndHome,
  } = useLoginUser();

  // 유저 정보 가져오기
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/me`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("응답 실패: " + response.status);
        }
        return response.json();
      })
      .then((data) => {
        setLoginUser(data.data);
      })
      .catch(() => {
        setNoLoginUser();
      });
  }, []);

  const loginUserContextValue = {
    loginUser,
    setLoginUser,
    setNoLoginUser,
    isLoginUserPending,
    isLogin,
    logout,
    logoutAndHome,
  };

  return (
    // ✅ QueryClientProvider로 전체 감싸기
    <LoginUserContext value={loginUserContextValue}>
      <div className="flex flex-col min-h-screen">
        <main className="pt-2 flex-1">
          {/* 헤더도 루트 페이지가 아니면 container mx-auto px-2 적용 */}
          {isRootPage ? (
            <Header />
          ) : (
            <div className="container mx-auto px-2">
              <Header />
            </div>
          )}
          {/* 루트 페이지가 아니면 container mx-auto px-2 적용 */}
          {isRootPage ? (
            children
          ) : (
            <div className="container mx-auto px-2">{children}</div>
          )}
        </main>
        <Footer />
      </div>
    </LoginUserContext>
  );
}
