"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function FailPage() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("code");
  const errorMessage = searchParams.get("message");

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
          {/* <div className="flex gap-4">
            <a
              className="btn w-full py-4 px-8 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-center text-lg font-semibold"
              href="https://docs.tosspayments.com/reference/error-codes"
              target="_blank"
              rel="noreferrer noopener"
            >
              에러코드 문서보기
            </a>
            <a
              className="btn w-full py-4 px-8 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-center text-lg font-semibold"
              href="https://techchat.tosspayments.com"
              target="_blank"
              rel="noreferrer noopener"
            >
              실시간 문의하기
            </a>
          </div> */}
        </div>
      </div>
    </div>
  );
}
