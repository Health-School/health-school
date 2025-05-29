"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const socialLoginForKakaoUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth2/authorization/kakao`;
  const redirectUrlAfterSocialLogin = process.env.NEXT_PUBLIC_FRONT_BASE_URL;
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // 쿠키 필요시
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      if (!response.ok) {
        alert("로그인에 실패했습니다.");
        setLoading(false);
        return;
      }

      // 로그인 성공 처리 (예: 리다이렉트)
      alert("로그인 성공!");
      window.location.href = "/"; // 필요시 홈으로 이동
    } catch (err) {
      alert("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-[500px] bg-white rounded-xl shadow-lg p-10 relative">
        {/* 타이틀 */}
        <h2 className="text-3xl font-bold text-center mb-3">로그인</h2>
        <p className="text-gray-500 text-center mb-8">
          건강한 삶을 위한 첫걸음
        </p>
        <form onSubmit={handleLogin}>
          {/* 이메일 입력 */}
          <div className="mb-5">
            <label
              className="block text-base font-semibold mb-2"
              htmlFor="email"
            >
              이메일
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M2 6.5A2.5 2.5 0 0 1 4.5 4h15A2.5 2.5 0 0 1 22 6.5v11A2.5 2.5 0 0 1 19.5 20h-15A2.5 2.5 0 0 1 2 17.5v-11Zm2.25-.5a.5.5 0 0 0-.5.5v.379l8.25 5.5 8.25-5.5V6.5a.5.5 0 0 0-.5-.5h-15Zm15.5 2.621-7.72 5.153a1 1 0 0 1-1.06 0L3.25 8.621V17.5a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5V8.621Z"
                    fill="#BDBDBD"
                  />
                </svg>
              </span>
              <input
                id="email"
                type="email"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-green-500 text-lg"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          {/* 비밀번호 입력 */}
          <div className="mb-4">
            <label
              className="block text-base font-semibold mb-2"
              htmlFor="password"
            >
              비밀번호
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M17 10V7a5 5 0 0 0-10 0v3a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Zm-8-3a3 3 0 1 1 6 0v3H9V7Zm10 5v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"
                    fill="#BDBDBD"
                  />
                </svg>
              </span>
              <input
                id="password"
                type="password"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-green-500 text-lg"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          {/* 로그인 상태 유지 & 비밀번호 찾기 */}

          <div className="flex items-center justify-between mb-6">
            <Link
              href="/user/find/id"
              className="text-green-500 text-base hover:underline"
            >
              아이디 찾기
            </Link>
            <Link
              href="/user/find/password"
              className="text-green-500 text-base hover:underline"
            >
              비밀번호 찾기
            </Link>
          </div>
          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-md mb-3 text-lg transition cursor-pointer"
            disabled={loading}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
        {/* 카카오 로그인 버튼 */}
        <button className="w-full flex items-center justify-center bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-3 rounded-md mb-6 text-lg transition cursor-pointer">
          <span className="mr-2">
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="#3C1E1E" />
              <path
                d="M20 10C14.477 10 10 13.582 10 18.09c0 2.47 1.61 4.65 4.09 6.07-.13.44-.82 2.8-.85 2.97 0 .08.03.16.09.21.07.05.15.05.22.01.29-.04 3.31-2.18 4.66-3.09.59.08 1.2.12 1.79.12 5.523 0 10-3.582 10-8.09S25.523 10 20 10Z"
                fill="#fff"
              />
            </svg>
          </span>
          <a
            href={`${socialLoginForKakaoUrl}?redirectUrl=${redirectUrlAfterSocialLogin}`}
          >
            카카오톡 로그인
          </a>
        </button>
        {/* 회원가입 안내 */}
        <div className="text-center text-base">
          아직 회원이 아니신가요?{" "}
          <Link
            href="/user/join"
            className="text-green-500 font-semibold hover:underline"
          >
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
