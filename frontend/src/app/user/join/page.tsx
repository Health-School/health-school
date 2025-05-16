"use client";

import React, { useState } from "react";

export default function JoinPage() {
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailVerifyInput, setEmailVerifyInput] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneSent, setPhoneSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneVerifyInput, setPhoneVerifyInput] = useState("");
  const socialLoginForKakaoUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth2/authorization/kakao`;
  const redirectUrlAfterSocialLogin = process.env.NEXT_PUBLIC_FRONT_BASE_URL;
  // 이메일 인증 요청
  const handleSendEmailCode = async () => {
    try {
      console.log;
      ("이메일 인증 요청");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/email/join/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );
      if (!response.ok) {
        alert("이메일 인증번호 발송에 실패했습니다.");
        return;
      }
      setEmailSent(true);
      alert("이메일 인증번호가 발송되었습니다.");
    } catch (e) {
      alert("이메일 인증 요청 중 오류가 발생했습니다.");
    }
  };

  // 이메일 인증 확인
  const handleVerifyEmail = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/email/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            code: emailVerifyInput,
          }),
        }
      );
      if (!response.ok) {
        alert("인증번호가 올바르지 않습니다.");
        return;
      }
      setEmailVerified(true);
      alert("이메일 인증이 완료되었습니다.");
    } catch (e) {
      alert("이메일 인증 확인 중 오류가 발생했습니다.");
    }
  };

  // 휴대폰 인증 요청
  const handleSendPhoneCode = async () => {
    setPhoneSent(true);
    alert("휴대폰 인증번호가 발송되었습니다.");
  };

  // 휴대폰 인증 확인
  const handleVerifyPhone = async () => {
    if (phoneVerifyInput === "654321") {
      setPhoneVerified(true);
      alert("휴대폰 인증이 완료되었습니다.");
    } else {
      alert("인증번호가 올바르지 않습니다.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            nickname,
            phoneNumber,
          }),
        }
      );
      if (!response.ok) {
        alert("회원가입에 실패했습니다.");
        return;
      }
      alert("회원가입 완료!");
      window.location.href = "/user/login"; // 필요시 로그인 페이지로 이동
    } catch (e) {
      alert("회원가입 요청 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-[420px] bg-white rounded-xl shadow-lg p-8 relative">
        {/* 타이틀 */}
        <h2 className="text-2xl font-bold text-center mb-1">회원가입</h2>
        <p className="text-gray-500 text-center mb-7">
          건강한 삶을 위한 첫걸음
        </p>
        <form onSubmit={handleSubmit}>
          {/* 이메일 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1" htmlFor="email">
              이메일
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M2 6.5A2.5 2.5 0 0 1 4.5 4h15A2.5 2.5 0 0 1 22 6.5v11A2.5 2.5 0 0 1 19.5 20h-15A2.5 2.5 0 0 1 2 17.5v-11Zm2.25-.5a.5.5 0 0 0-.5.5v.379l8.25 5.5 8.25-5.5V6.5a.5.5 0 0 0-.5-.5h-15Zm15.5 2.621-7.72 5.153a1 1 0 0 1-1.06 0L3.25 8.621V17.5a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5V8.621Z"
                      fill="#BDBDBD"
                    />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={emailVerified}
                />
              </div>
              <button
                type="button"
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-md text-sm font-semibold transition"
                onClick={handleSendEmailCode}
                disabled={emailSent || emailVerified || !email}
              >
                인증번호 요청
              </button>
            </div>
            {/* 이메일 인증번호 입력칸 (아래에 항상 노출) */}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-md px-2 py-2 text-sm"
                placeholder="인증번호 입력"
                value={emailVerifyInput}
                onChange={(e) => setEmailVerifyInput(e.target.value)}
                disabled={!emailSent || emailVerified}
              />
              <button
                type="button"
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-md text-sm font-semibold transition"
                onClick={handleVerifyEmail}
                disabled={!emailSent || emailVerified || !emailVerifyInput}
              >
                확인
              </button>
              {emailVerified && (
                <div className="flex items-center">
                  <span className="text-green-500 text-sm font-semibold ml-2">
                    인증완료
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* 비밀번호 */}
          <div className="mb-4">
            <label
              className="block text-sm font-semibold mb-1"
              htmlFor="password"
            >
              비밀번호
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M17 10V7a5 5 0 0 0-10 0v3a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Zm-8-3a3 3 0 1 1 6 0v3H9V7Zm10 5v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"
                    fill="#BDBDBD"
                  />
                </svg>
              </span>
              <input
                id="password"
                type="password"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          {/* 비밀번호 확인 */}
          <div className="mb-4">
            <label
              className="block text-sm font-semibold mb-1"
              htmlFor="passwordCheck"
            >
              비밀번호 확인
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M17 10V7a5 5 0 0 0-10 0v3a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Zm-8-3a3 3 0 1 1 6 0v3H9V7Zm10 5v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"
                    fill="#BDBDBD"
                  />
                </svg>
              </span>
              <input
                id="passwordCheck"
                type="password"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
                placeholder="비밀번호를 다시 입력하세요"
                value={passwordCheck}
                onChange={(e) => setPasswordCheck(e.target.value)}
                required
              />
            </div>
          </div>
          {/* 이름 */}
          {/* <div className="mb-4">
            <label className="block text-sm font-semibold mb-1" htmlFor="name">
              이름
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z"
                    fill="#BDBDBD"
                  />
                </svg>
              </span>
              <input
                id="name"
                type="text"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
                placeholder="이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div> */}
          {/* 닉네임 */}
          <div className="mb-4">
            <label
              className="block text-sm font-semibold mb-1"
              htmlFor="nickname"
            >
              닉네임
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z"
                    fill="#BDBDBD"
                  />
                </svg>
              </span>
              <input
                id="nickname"
                type="text"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
                placeholder="닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </div>
          </div>
          {/* 휴대폰 번호 */}
          <div className="mb-4">
            <label
              className="block text-sm font-semibold mb-1"
              htmlFor="phoneNumber"
            >
              휴대폰 번호
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.07 21 3 13.93 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.24 1.01l-2.2 2.2Z"
                      fill="#BDBDBD"
                    />
                  </svg>
                </span>
                <input
                  id="phoneNumber"
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
                  placeholder="휴대폰 번호를 입력하세요"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  disabled={phoneVerified}
                />
              </div>
              <button
                type="button"
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-md text-sm font-semibold transition"
                onClick={handleSendPhoneCode}
                disabled={phoneSent || phoneVerified || !phoneNumber}
              >
                인증번호 요청
              </button>
            </div>
            {phoneSent && !phoneVerified && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-md px-2 py-2 text-sm"
                  placeholder="인증번호 입력"
                  value={phoneVerifyInput}
                  onChange={(e) => setPhoneVerifyInput(e.target.value)}
                />
                <button
                  type="button"
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-md text-sm font-semibold transition"
                  onClick={handleVerifyPhone}
                >
                  확인
                </button>
              </div>
            )}
            {phoneVerified && (
              <span className="text-green-500 text-sm font-semibold ml-2">
                인증완료
              </span>
            )}
          </div>
          {/* 인증번호 */}
          {/* <div className="mb-4">
            <label className="block text-sm font-semibold mb-1" htmlFor="phoneCode">
              인증번호
            </label>
            <input
              id="phoneCode"
              type="text"
              className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
              placeholder="인증번호를 입력하세요"
              value={phoneCode}
              onChange={e => setPhoneCode(e.target.value)}
            />
          </div> */}
          {/* 회원가입 버튼 */}
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-md mb-3 text-lg transition"
          >
            회원가입
          </button>
        </form>
        {/* 카카오 회원가입 버튼 */}
        <button className="w-full flex items-center justify-center bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-3 rounded-md mb-6 text-lg transition">
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
            카카오톡으로 시작하기
          </a>
        </button>
        {/* 로그인 안내 */}
        <div className="text-center text-base">
          이미 회원이신가요?{" "}
          <a
            href="/user/login"
            className="text-green-500 font-semibold hover:underline"
          >
            로그인
          </a>
        </div>
      </div>
    </div>
  );
}
