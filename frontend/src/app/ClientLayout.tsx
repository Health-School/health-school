"use client";
import { LoginMemberContext, useLoginMember } from "@/stores/auth/loginMember";
import { useEffect } from "react";
import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const {
    loginMember,
    setLoginMember,
    setNoLoginMember,
    isLoginMemberPending,
    isLogin,
    logout,
    logoutAndHome,
  } = useLoginMember();

  // 전역관리를 위한 Store 등록 - context api 사용
  const loginMemberContextValue = {
    loginMember,
    setLoginMember,
    isLoginMemberPending,
    isLogin,
    logout,
    logoutAndHome,
  };
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/me`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setLoginMember(data);
      })
      .catch((error) => {
        setNoLoginMember();
      });
  }, []);

  return (
    <LoginMemberContext value={loginMemberContextValue}>
      <main>
        <Header />
        {children}
        <Footer />
      </main>
    </LoginMemberContext>
  );
}
