"use client";

import { useEffect } from "react";
import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { LoginUserContext, useLoginUser } from "@/stores/auth/loginUser";
import { usePathname } from "next/navigation";

type LayoutProps = {
  children: React.ReactNode;
};

export default function ClientLayout({ children }: LayoutProps) {
  const pathname = usePathname();
  // admin 경로 여부
  const isAdminPage = pathname.startsWith("/admin");

  const fetchUser = useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/me`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("응답 실패: " + response.status); // 401, 404, 500 등
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setLoginUser(data.data);
      })
      .catch((error) => {
        setNoLoginUser();
      });
  }, []);
  const {
    loginUser,
    setLoginUser,
    isLoginUserPending,
    isLogin,
    setNoLoginUser,
    logout,
    logoutAndHome,
  } = useLoginUser();
  //전역 관리를 위한 Store 등록
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
    <LoginUserContext value={loginUserContextValue}>
      <main>
        <Header />
        {children}

        <Footer />
      </main>
    </LoginUserContext>
  );
}
