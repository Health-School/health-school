"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// TossPaymentsModal 컴포넌트 동적 import (SSR 비활성화)
const TossPaymentsModal = dynamic(
  () => import("../../../components/payments/TossPaymentsModal"),
  { ssr: false }
);

interface LectureResponseDto {
  id: number;
  title: string;
  content: string;
  price: number;
  lectureLevel: string;
  lectureStatus: string;
  coverImageUrl: string;
  trainerName: string;
  trainerProfileImageUrl: string | null;
  createdAt: string;
  categoryName: string;
  averageScore: number;
}

// 날짜 포맷에서 마지막 마침표 제거
function formatDate(dateString: string) {
  if (!dateString) return "-";
  const date = new Date(dateString.replace(" ", "T"));
  // toLocaleDateString("ko-KR") 결과에서 마지막 마침표 제거
  return date.toLocaleDateString("ko-KR").replace(/\.$/, "");
}

async function fetchLectureDetail(
  lectureId: number
): Promise<LectureResponseDto> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectures/${lectureId}`
  );
  if (!res.ok) throw new Error("강의 정보를 불러오지 못했습니다.");
  const data = await res.json();
  return data.data;
}

export default function LectureDetailPage() {
  const params = useParams();
  const lectureId = Number(params.lectureId);

  const [data, setData] = useState<LectureResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTossModal, setShowTossModal] = useState(false);

  useEffect(() => {
    if (!lectureId) return;
    setIsLoading(true);
    fetchLectureDetail(lectureId)
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch(() => setError("강의 정보를 불러올 수 없습니다."))
      .finally(() => setIsLoading(false));
  }, [lectureId]);

  if (isLoading) return <div>로딩 중...</div>;
  if (error || !data) return <div>강의 정보를 불러올 수 없습니다.</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 상단 강의 이미지 */}
      <div className="w-full h-80 relative">
        <Image
          src={data.coverImageUrl || "/lecture-main.jpg"}
          alt="강의 대표 이미지"
          layout="fill"
          objectFit="cover"
          className="rounded-b-xl"
        />
      </div>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 mt-8">
        {/* 왼쪽: 강의 정보 */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2 ">{data.title}</h1>
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
            <span>{data.categoryName}</span>
            <span>·</span>
            <span>{data.lectureLevel}</span>
            <span>·</span>
            <span>{data.lectureStatus}</span>
            <span>·</span>
            <span>개설일: {formatDate(data.createdAt)}</span>
            <span>·</span>
            <span>평점: {data.averageScore?.toFixed(1) ?? "-"}</span>
          </div>

          {/* 트레이너 정보 */}
          <div className="bg-white rounded-lg p-4 shadow mb-6 flex items-center gap-4">
            {data.trainerProfileImageUrl ? (
              <Image
                src={data.trainerProfileImageUrl}
                alt="트레이너"
                width={48}
                height={48}
                className="rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-500">
                {data.trainerName ? data.trainerName.charAt(0) : "?"}
              </div>
            )}
            <div>
              <div className="font-semibold">{data.trainerName}</div>
              <div className="text-xs text-gray-500">
                {/* 트레이너 설명이 있다면 여기에 추가 */}
              </div>
              <a href="#" className="text-blue-500 text-xs mt-1 inline-block">
                트레이너 프로필 보기 &gt;
              </a>
            </div>
          </div>

          {/* 강의 소개 */}
          <section className="mb-8">
            <h2 className="font-bold text-lg mb-2">강의 소개</h2>
            <div dangerouslySetInnerHTML={{ __html: data.content }}></div>
            {/* 예시 목차 */}
            {/* <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>근력운동의 기본 원리와 중요성</li>
              <li>올바른 자세와 운동법</li>
              <li>부상 방지를 위한 핵심 수칙</li>
              <li>개인별 맞춤 프로그램 설계 방법</li>
              <li>영양 및 회복의 중요성</li>
            </ul> */}
          </section>

          {/* 이런 분께 추천합니다 */}
          {/* <section className="mb-8">
            <h2 className="font-bold text-lg mb-2">이런 분께 추천합니다</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>헬스초보, 체계적으로 운동하고 싶은 분</li>
              <li>올바른 자세로 운동하고 싶은 분</li>
              <li>정체기를 극복하고 싶은 중급자</li>
              <li>효율적인 운동 방법을 배우고 싶은 분</li>
              <li>부상 없이 안전하게 운동하고 싶은 분</li>
            </ul>
          </section> */}

          {/* 강의 수강 시 제공되는 자료 */}
          {/* <section className="mb-8">
            <h2 className="font-bold text-lg mb-2">
              강의 수강 시 제공되는 자료
            </h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>주간 운동 계획표 PDF</li>
              <li>운동 기록 템플릿 Excel</li>
              <li>영양 가이드북</li>
              <li>보너스 스트레칭 영상</li>
            </ul>
          </section> */}
        </div>

        {/* 오른쪽: 결제/강의 정보 */}
        <aside className="w-full md:w-80">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="text-2xl font-bold text-green-600 mb-2">
              ₩{data.price?.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mb-2">
              개설일: {formatDate(data.createdAt)}
            </div>
            <div className="text-xs text-yellow-500 mb-2">
              평점: {data.averageScore?.toFixed(1) ?? "-"}
            </div>
            <button
              className="w-full bg-green-600 text-white py-2 rounded mb-2 font-semibold cursor-pointer"
              onClick={() => setShowTossModal(true)}
            >
              수강하기
            </button>
            <button className="w-full border border-green-600 text-green-600 py-2 rounded mb-2">
              장바구니에 담기
            </button>
            <button className="w-full border text-gray-600 py-2 rounded">
              찜하기
            </button>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold mb-2">강의 정보</h3>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>총 24시간 분량</li>
              <li>8개 챕터, 42개 강의</li>
              <li>평생 수강 가능</li>
              <li>모바일/PC 수강 가능</li>
              <li>수료증 발급</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* TossPayments 모달 */}
      {showTossModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
              onClick={() => setShowTossModal(false)}
            >
              ×
            </button>
            <TossPaymentsModal
              lectureId={data.id}
              amount={data.price}
              lectureTitle={data.title}
              onClose={() => setShowTossModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
