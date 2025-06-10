"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Oauth2SignUpAdditionalInfo {
  phoneNumber: string;
  nickname: string;
}

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

export default function AdditionalInfoPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 핸드폰 인증 관련 상태
  const [phoneSent, setPhoneSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneVerifyInput, setPhoneVerifyInput] = useState("");

  const router = useRouter();

  // 닉네임 검증
  const validateNickname = (nickname: string): boolean => {
    return nickname.trim().length >= 1 && nickname.trim().length <= 20;
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
    setError(null);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    setError(null);
  };

  // 휴대폰 인증 요청
  const handleSendPhoneCode = async () => {
    if (!phoneNumber.trim()) {
      setError("핸드폰 번호를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/sms/join/send-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phoneNumber: phoneNumber.replace(/-/g, "") }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "휴대폰 인증번호 발송에 실패했습니다.");
        return;
      }

      setPhoneSent(true);
      setError(null);
      alert("휴대폰 인증번호가 발송되었습니다.");
    } catch (err) {
      console.error("휴대폰 인증 요청 실패:", err);
      setError("휴대폰 인증 요청 중 오류가 발생했습니다.");
    }
  };

  // 휴대폰 인증 확인
  const handleVerifyPhone = async () => {
    if (!phoneVerifyInput.trim()) {
      setError("인증번호를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/sms/join/verify-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: phoneNumber.replace(/-/g, ""),
            code: phoneVerifyInput,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "인증번호가 올바르지 않습니다.");
        return;
      }

      setPhoneVerified(true);
      setError(null);
      alert("휴대폰 인증이 완료되었습니다.");
    } catch (err) {
      console.error("휴대폰 인증 확인 실패:", err);
      setError("휴대폰 인증 확인 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }

    if (!validateNickname(nickname)) {
      setError("닉네임은 1자 이상 20자 이하로 입력해주세요.");
      return;
    }

    if (!phoneNumber.trim()) {
      setError("핸드폰 번호를 입력해주세요.");
      return;
    }

    if (!phoneVerified) {
      setError("핸드폰 인증을 완료해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/oauth2/additional-info`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            phoneNumber: phoneNumber.replace(/-/g, ""), // 하이픈 제거 후 전송
            nickname: nickname.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        alert("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
        router.push("/user/login");
      } else {
        setError(data.message || "회원가입 처리 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error("추가 정보 제출 실패:", err);
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white flex justify-center py-16">
      <div className="w-[500px] bg-white rounded-xl shadow-lg p-8 relative">
        {/* 타이틀 */}
        <h2 className="text-3xl font-bold text-center mb-2">추가 정보 입력</h2>
        <p className="text-gray-500 text-center mb-6">
          소셜 로그인 회원가입을 완료해주세요
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 닉네임 입력 */}
          <div className="mb-4">
            <label
              htmlFor="nickname"
              className="block text-sm font-semibold mb-1"
            >
              닉네임 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    stroke="#BDBDBD"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <input
                id="nickname"
                name="nickname"
                type="text"
                value={nickname}
                onChange={handleNicknameChange}
                placeholder="사용할 닉네임을 입력하세요"
                maxLength={20}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
                disabled={isSubmitting}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              1자 이상 20자 이하로 입력해주세요
            </p>
          </div>

          {/* 핸드폰 번호 입력 */}
          <div className="mb-4">
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-semibold mb-1"
            >
              핸드폰 번호 <span className="text-red-500">*</span>
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
                  name="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  placeholder="010-1234-5678"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
                  disabled={isSubmitting || phoneVerified}
                />
              </div>
              <button
                type="button"
                onClick={handleSendPhoneCode}
                disabled={
                  phoneSent || phoneVerified || !phoneNumber || isSubmitting
                }
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-md text-sm font-semibold transition cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                인증번호 요청
              </button>
            </div>

            {/* 핸드폰 인증번호 입력칸 */}
            {phoneSent && !phoneVerified && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-md px-2 py-2 text-sm"
                  placeholder="인증번호 입력"
                  value={phoneVerifyInput}
                  onChange={(e) => setPhoneVerifyInput(e.target.value)}
                  disabled={phoneVerified || isSubmitting}
                />
                <button
                  type="button"
                  onClick={handleVerifyPhone}
                  disabled={phoneVerified || !phoneVerifyInput || isSubmitting}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-md text-sm font-semibold transition cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  확인
                </button>
              </div>
            )}

            {phoneVerified && (
              <span className="text-green-500 text-sm font-semibold ml-2 block mt-1">
                ✓ 인증완료
              </span>
            )}

            <p className="mt-1 text-xs text-gray-500">
              알림 및 중요한 안내를 위해 사용됩니다
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 개인정보 처리 동의 */}
          <div className="mb-5 p-3 bg-gray-50 rounded-md border border-gray-200">
            <div className="text-sm text-gray-600">
              <p className="font-semibold mb-1">개인정보 수집 및 이용 동의</p>
              <ul className="space-y-0.5 list-disc list-inside text-gray-500">
                <li>수집항목: 닉네임, 핸드폰 번호</li>
                <li>이용목적: 본인 확인, 서비스 이용 안내</li>
                <li>보유기간: 회원 탈퇴 시까지</li>
              </ul>
              <p className="mt-1 text-green-600 font-medium">
                위 내용에 동의하며 회원가입을 진행합니다.
              </p>
            </div>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={
              isSubmitting ||
              !phoneNumber.trim() ||
              !nickname.trim() ||
              !phoneVerified
            }
            className={`w-full font-semibold py-3 rounded-md mb-2 text-lg transition cursor-pointer ${
              isSubmitting ||
              !phoneNumber.trim() ||
              !nickname.trim() ||
              !phoneVerified
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                처리 중...
              </span>
            ) : (
              "회원가입 완료"
            )}
          </button>

          {/* 로그인 페이지로 돌아가기 */}
          <div className="text-center text-base pt-4">
            <Link
              href="/user/login"
              className="text-green-500 font-semibold hover:underline"
            >
              로그인 페이지로 돌아가기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
