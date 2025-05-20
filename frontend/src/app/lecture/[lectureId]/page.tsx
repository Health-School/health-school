"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";

interface LectureResponseDto {
  id: number;
  title: string;
  content: string;
  price: number;
  lectureLevel: string;
  lectureLevelDescription: string;
  lectureStatus: string;
  lectureStatusDescription: string;
}

async function fetchLectureDetail(
  lectureId: number
): Promise<LectureResponseDto> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectures/${lectureId}`
  );
  if (!res.ok) throw new Error("강의 정보를 불러오지 못했습니다.");
  const data = await res.json();
  return data.data; // ApiResponse.success의 data 필드
}

export default function LectureDetailPage() {
  const params = useParams();
  const lectureId = Number(params.lectureId);

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          src="/lecture-main.jpg"
          alt="강의 대표 이미지"
          layout="fill"
          objectFit="cover"
          className="rounded-b-xl"
        />
      </div>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 mt-8">
        {/* 왼쪽: 강의 정보 */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">{data.title}</h1>
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
            <span>{data.lectureLevelDescription}</span>
            <span>·</span>
            <span>{data.lectureStatusDescription}</span>
          </div>

          {/* 트레이너 정보 */}
          <div className="bg-white rounded-lg p-4 shadow mb-6 flex items-center gap-4">
            <Image
              src="/trainer.jpg"
              alt="트레이너"
              width={48}
              height={48}
              className="rounded-full"
            />
            <div>
              <div className="font-semibold">김건강 트레이너</div>
              <div className="text-xs text-gray-500">
                국제 스포츠 의학 협회 인증 트레이너
              </div>
              <a href="#" className="text-blue-500 text-xs mt-1 inline-block">
                트레이너 프로필 보기 &gt;
              </a>
            </div>
          </div>

          {/* 강의 소개 */}
          <section className="mb-8">
            <h2 className="font-bold text-lg mb-2">강의 소개</h2>
            <p className="text-gray-700 mb-4">{data.content}</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>근력운동의 기본 원리와 중요성</li>
              <li>올바른 자세와 운동법</li>
              <li>부상 방지를 위한 핵심 수칙</li>
              <li>개인별 맞춤 프로그램 설계 방법</li>
              <li>영양 및 회복의 중요성</li>
            </ul>
          </section>

          {/* 이런 분께 추천합니다 */}
          <section className="mb-8">
            <h2 className="font-bold text-lg mb-2">이런 분께 추천합니다</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>헬스초보, 체계적으로 운동하고 싶은 분</li>
              <li>올바른 자세로 운동하고 싶은 분</li>
              <li>정체기를 극복하고 싶은 중급자</li>
              <li>효율적인 운동 방법을 배우고 싶은 분</li>
              <li>부상 없이 안전하게 운동하고 싶은 분</li>
            </ul>
          </section>

          {/* 강의 수강 시 제공되는 자료 */}
          <section className="mb-8">
            <h2 className="font-bold text-lg mb-2">
              강의 수강 시 제공되는 자료
            </h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>주간 운동 계획표 PDF</li>
              <li>운동 기록 템플릿 Excel</li>
              <li>영양 가이드북</li>
              <li>보너스 스트레칭 영상</li>
            </ul>
          </section>
        </div>

        {/* 오른쪽: 결제/강의 정보 */}
        <aside className="w-full md:w-80">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="text-2xl font-bold text-green-600 mb-2">
              ₩{data.price?.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400 line-through mb-2">
              ₩160,000
            </div>
            <div className="text-xs text-red-500 mb-4">20% 할인</div>
            <button className="w-full bg-green-600 text-white py-2 rounded mb-2 font-semibold">
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

      {/* 하단 푸터 */}
      <footer className="mt-16 bg-gray-900 text-gray-200 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between">
          <div>
            <div className="font-bold text-lg mb-2">헬스쿨</div>
            <div className="text-sm mb-2">
              최고의 강의로 피트니스와 건강한 삶을 응원하겠습니다.
            </div>
            <div className="flex gap-2">{/* SNS 아이콘 등 */}</div>
          </div>
          <div>
            <div className="font-bold mb-2">카테고리</div>
            <div className="text-sm">근력운동, 요가, 필라테스, 영양</div>
          </div>
          <div>
            <div className="font-bold mb-2">고객센터</div>
            <div className="text-sm">자주 묻는 질문, 문의하기, 환불 정책</div>
          </div>
          <div>
            <div className="font-bold mb-2">구독하기</div>
            <input
              className="p-2 rounded text-black"
              placeholder="이메일 주소"
            />
            <button className="ml-2 bg-green-600 text-white px-4 py-2 rounded">
              구독
            </button>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 mt-8">
          © 2025 헬스쿨. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
