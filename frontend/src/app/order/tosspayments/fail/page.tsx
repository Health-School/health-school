"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// 👉 Next.js에게 이 페이지는 dynamic하게 처리하라고 명시
export const dynamic = "force-dynamic";

export default function FailPage() {
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // 클라이언트에서만 window 객체 접근 가능
    const params = new URLSearchParams(window.location.search);
    setErrorCode(params.get("code"));
    setErrorMessage(params.get("message"));
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-xl w-full border border-gray-200 flex flex-col items-center">
        <img
          src="https://static.toss.im/lotties/error-spot-apng.png"
          width="140"
          height="140"
          alt="결제 실패 이미지"
          className="mb-6"
        />
        <h2 className="text-3xl font-bold text-gray-800 mt-4 mb-2">
          결제를 실패했어요
        </h2>
        <div className="w-full mt-6">
          <div className="flex justify-between my-4">
            <span className="font-semibold text-gray-600">code</span>
            <span id="error-code" className="text-lg text-gray-800">
              {errorCode}
            </span>
          </div>
          <div className="flex justify-between my-4">
            <span className="font-semibold text-gray-600">message</span>
            <span id="error-message" className="text-lg text-gray-800">
              {errorMessage}
            </span>
          </div>
        </div>
        <div className="w-full mt-10 flex flex-col gap-4">
          <Link
            className="btn w-full py-4 px-8 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-center text-lg font-semibold"
            href="/"
            target="_blank"
            rel="noreferrer noopener"
          >
            홈페이지 가기
          </Link>
        </div>
      </div>
    </div>
  );
}
