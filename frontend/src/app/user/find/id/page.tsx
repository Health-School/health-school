"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// 전화번호 포맷팅 함수
function formatPhoneNumber(input: string) {
  let value = input.replace(/[^0-9]/g, "");
  if (value.length < 4) {
    // 그대로
  } else if (value.length < 8) {
    value = value.replace(/(\d{3})(\d{1,4})/, "$1-$2");
  } else {
    value = value.replace(/(\d{3})(\d{4})(\d{1,4})/, "$1-$2-$3");
  }
  return value;
}

export default function FindIdPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [isAuthCodeSent, setIsAuthCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();
  // 인증번호 요청
  const handleSendAuthCode = async () => {
    if (!phoneNumber) {
      alert("휴대폰 번호를 입력해주세요.");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/sms/find-email/send-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phoneNumber: phoneNumber.replace(/-/g, "") }), // 하이픈 제거해서 전송
        }
      );
      if (!response.ok) {
        throw new Error("인증 코드 발송에 실패했습니다.");
      }
      alert("인증 코드가 휴대폰으로 전송되었습니다.");
      setIsAuthCodeSent(true);
      router.push("/user/login"); // 인증 코드 발송 후 로그인 페이지로 리다이렉트
    } catch (err) {
      alert("인증 코드 발송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 인증번호 확인 및 ID(이메일) 제공
  const handleVerifyAuthCode = async () => {
    if (!phoneNumber || !authCode) {
      alert("휴대폰 번호와 인증코드를 모두 입력해주세요.");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/sms/find-email/verify-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: phoneNumber.replace(/-/g, ""), // 하이픈 제거해서 전송
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
      alert(`회원님의 아이디(이메일)는: ${data.data.email}`);
      setIsVerified(true);
    } catch (err) {
      alert("인증 요청 중 오류가 발생했습니다.");
      setIsVerified(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-24 p-6  bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold text-center mb-8 text-green-600">
        아이디 찾기
      </h1>

      <div className="mb-4">
        <label
          htmlFor="phoneNumber"
          className="block mb-2 text-sm font-medium text-green-700"
        >
          휴대폰 번호
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
            className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-300"
            placeholder="010-1234-5678"
            required
            disabled={isVerified}
            maxLength={13}
          />
          <button
            type="button"
            onClick={handleSendAuthCode}
            className="cursor-pointer px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            disabled={isVerified}
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
          인증코드
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            id="authCode"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
            className="flex-1 p-2 border  border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-300"
            placeholder="인증코드를 입력하세요"
            required
            disabled={!isAuthCodeSent || isVerified}
          />
          <button
            type="button"
            onClick={handleVerifyAuthCode}
            className="cursor-pointer px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            disabled={!isAuthCodeSent || isVerified || !authCode}
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

      <div className="flex justify-center space-x-4 text-sm text-green-600">
        <Link href="/user/login" className="hover:underline">
          로그인
        </Link>
        <span className="text-gray-300">|</span>
        <Link href="/user/find/password" className="hover:underline">
          비밀번호 찾기
        </Link>
      </div>
    </div>
  );
}
