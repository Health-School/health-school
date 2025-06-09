"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Oauth2SignUpAdditionalInfo {
  phoneNumber: string;
}

export default function AdditionalInfoPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 핸드폰 번호 형식 검증
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/;
    return phoneRegex.test(phone.replace(/-/g, ""));
  };

  // 핸드폰 번호 자동 하이픈 추가
  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/[^\d]/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7)
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      setError("핸드폰 번호를 입력해주세요.");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError("올바른 핸드폰 번호 형식이 아닙니다. (예: 010-1234-5678)");
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
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-[500px] bg-white rounded-xl shadow-lg p-10 relative">
        {/* 타이틀 */}
        <h2 className="text-3xl font-bold text-center mb-3">추가 정보 입력</h2>
        <p className="text-gray-500 text-center mb-8">
          소셜 로그인 회원가입을 완료해주세요
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 핸드폰 번호 입력 */}
          <div className="mb-5">
            <label
              htmlFor="phoneNumber"
              className="block text-base font-semibold mb-2"
            >
              핸드폰 번호
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M19.44 13c-.22 0-.45-.07-.67-.12a9.44 9.44 0 01-1.31-.39 2 2 0 00-2.85 1l-.22.45a12.18 12.18 0 01-2.66-2 12.18 12.18 0 01-2-2.66L10 8.05a2 2 0 001-2.85 10.33 10.33 0 01-.39-1.31c-.05-.22-.09-.45-.12-.68a3 3 0 00-3-2.21H5a3 3 0 00-2.24 1 3 3 0 00-.78 2.29 19 19 0 003.1 7.17 18.9 18.9 0 006.69 6.69A19 19 0 0019 21a3 3 0 002.29-.78 3 3 0 001-2.24v-2.49a3 3 0 00-2.85-2.49z"
                    stroke="#BDBDBD"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
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
                maxLength={13}
                className={`w-full pl-12 pr-4 py-3 border rounded-md focus:outline-none focus:border-green-500 text-lg ${
                  error ? "border-red-300" : "border-gray-300"
                }`}
                disabled={isSubmitting}
              />
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          {/* 개인정보 처리 동의 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="text-sm text-gray-600">
              <p className="font-semibold mb-2">개인정보 수집 및 이용 동의</p>
              <ul className="space-y-1 list-disc list-inside text-gray-500">
                <li>수집항목: 핸드폰 번호</li>
                <li>이용목적: 본인 확인, 서비스 이용 안내</li>
                <li>보유기간: 회원 탈퇴 시까지</li>
              </ul>
              <p className="mt-2 text-green-600 font-medium">
                위 내용에 동의하며 회원가입을 진행합니다.
              </p>
            </div>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting || !phoneNumber.trim()}
            className={`w-full font-semibold py-3 rounded-md mb-3 text-lg transition cursor-pointer ${
              isSubmitting || !phoneNumber.trim()
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
          <div className="text-center text-base">
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
