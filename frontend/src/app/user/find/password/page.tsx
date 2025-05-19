"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FindPasswordPage() {
  const [email, setEmail] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [isAuthCodeSent, setIsAuthCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();

  const handleSendAuthCode = async () => {
    if (!email || !email.includes("@")) {
      alert("유효한 이메일을 입력해주세요.");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/email/password/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );
      if (!response.ok) {
        throw new Error("인증 코드 발송에 실패했습니다.");
      }
      alert("인증 코드가 이메일로 전송되었습니다.");
      setIsAuthCodeSent(true);
    } catch (err) {
      alert("인증 코드 발송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleVerifyAuthCode = async () => {
    if (!email || !authCode) {
      alert("이메일과 인증코드를 모두 입력해주세요.");
      return;
    }
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
            code: authCode,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "인증 실패");
        setIsVerified(false);
        return;
      }
      alert(data.message || "인증 성공");
      setIsVerified(true);
    } catch (err) {
      alert("인증 요청 중 오류가 발생했습니다.");
      setIsVerified(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            code: authCode,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("비밀번호 초기화 요청 실패");
      }
      const data = await response.json();
      alert("비밀번호 초기화 성공: " + data.data.password);
      router.push("/user/login");
    } catch (err) {
      alert("비밀번호 초기화에 실패했습니다.");
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold text-center mb-8 text-green-600">
        비밀번호 찾기
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-green-700"
          >
            이메일
          </label>
          <div className="flex space-x-2">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-300"
              placeholder="이메일을 입력하세요"
              required
            />
            <button
              type="button"
              onClick={handleSendAuthCode}
              className="cursor-pointer px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              인증 요청
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label
            htmlFor="authCode"
            className="block mb-2 text-sm font-medium text-green-700"
          >
            이메일 인증코드
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="authCode"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-300"
              placeholder="인증코드를 입력하세요"
              required
            />
            <button
              type="button"
              onClick={handleVerifyAuthCode}
              className="cursor-pointer px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              코드 확인
            </button>
            {isVerified && (
              <span className="text-green-500 text-sm font-semibold flex items-center ml-2">
                인증완료
              </span>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="cursor-pointer w-full py-3 bg-green-500 text-white rounded hover:bg-green-600 transition mb-4"
        >
          비밀번호 찾기
        </button>
      </form>

      <div className="flex justify-center space-x-4 text-sm text-green-600">
        <Link href="/user/login" className="hover:underline">
          로그인
        </Link>
        <span className="text-gray-300">|</span>
        <Link href="/user/find/id" className="hover:underline">
          아이디 찾기
        </Link>
      </div>
    </div>
  );
}
