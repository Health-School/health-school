"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import React from "react";
import ReportModal from "@/components/report/ReportModal"; // 신고 모달 import

// TossPaymentsModal 동적 import
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

// Notification 인터페이스 정의 (파일 상단에 추가)
interface Notification {
  id: number;
  title: string;
  content: string;
  lectureName: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

function formatDate(dateString: string) {
  if (!dateString) return "-";
  const date = new Date(dateString.replace(" ", "T"));
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
  console.log("강의 상세 응답:", data);
  return data.data;
}

export default function LectureDetailPage() {
  const params = useParams();
  const lectureId = Number(params.lectureId);

  const [data, setData] = useState<LectureResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTossModal, setShowTossModal] = useState(false);

  const [hoverScore, setHoverScore] = useState<number | null>(null);
  const [userScore, setUserScore] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false); //  신고 모달 상태

  // 공지사항 관련 상태
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // 상단에 상태 변수 추가
  const [activeTab, setActiveTab] = useState<string>("커리큘럼");

  // 탭 메뉴 정의
  const tabs = ["커리큘럼", "Q&A", "공지사항"];

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

  // 별 클릭 시 서버에 평점 등록
  const handleStarClick = async (score: number) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/like`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            lectureId: data?.id,
            score,
          }),
        }
      );
      if (!res.ok) throw new Error("평점 등록 실패");
      const result = await res.json();
      setUserScore(score);
      // 서버에서 받은 새로운 평균 평점으로 갱신
      setData((prev) =>
        prev ? { ...prev, averageScore: result.data.average } : prev
      );
      // userScore를 null로 초기화하여 평균점수에 따라 별이 다시 반영되게 함
      setTimeout(() => setUserScore(null), 300); // 0.3초 후 초기화(UX 개선)
      alert("평점이 등록되었습니다!");
    } catch (e) {
      alert("평점 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (activeTab === "공지사항") {
      const fetchNotifications = async () => {
        setIsLoadingNotifications(true);
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/lecture/${lectureId}`,
            {
              credentials: "include",
            }
          );

          if (!response.ok) {
            throw new Error("공지사항 로딩 실패");
          }

          const result = await response.json();
          console.log("Notifications API 응답:", result); // 응답 전체 확인
          console.log("Notifications 데이터:", result.data); // 데이터 배열 확인

          if (result.success) {
            setNotifications(result.data);
            console.log("저장된 notifications:", result.data); // 상태 변수에 저장되는 데이터 확인
          }
        } catch (error) {
          console.error("공지사항 로딩 중 오류:", error);
        } finally {
          setIsLoadingNotifications(false);
        }
      };

      fetchNotifications();
    }
  }, [activeTab, lectureId]);

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
          <h1 className="text-2xl font-bold mb-2">{data.title}</h1>
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
            <span>{data.categoryName}</span>
            <span>·</span>
            <span>{data.lectureLevel}</span>
            <span>·</span>
            <span>{data.lectureStatus}</span>
            <span>·</span>
            <span>개설일: {formatDate(data.createdAt)}</span>
            <span>·</span>
            {/* 평점 표시 및 별점 평가 */}
            <span className="flex items-center">
              <span className="font-semibold mr-2 text-base text-black">
                평점
              </span>
              {Array.from({ length: 5 }).map((_, idx) => {
                // 별을 채울지 결정: 평균점수(소수점 반올림X, 소수점까지 표현)
                const score = hoverScore ?? userScore ?? data.averageScore ?? 0;
                let fill = "text-gray-300";
                if (score >= idx + 1) {
                  fill = "text-yellow-400";
                } else if (score > idx && score < idx + 1) {
                  // 소수점 별: 반만 채우기(half star)
                  fill = "text-yellow-400";
                }
                return (
                  <svg
                    key={idx}
                    className={`w-6 h-6 cursor-pointer transition ${fill}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    onMouseEnter={() => setHoverScore(idx + 1)}
                    onMouseLeave={() => setHoverScore(null)}
                    onClick={() => handleStarClick(idx + 1)}
                    style={{ pointerEvents: isSubmitting ? "none" : "auto" }}
                  >
                    <title>{`${idx + 1}점`}</title>
                    {score > idx && score < idx + 1 ? (
                      // 반 별 SVG (왼쪽만 채움)
                      <g>
                        <defs>
                          <linearGradient
                            id={`half${idx}`}
                            x1="0"
                            x2="100%"
                            y1="0"
                            y2="0"
                          >
                            <stop offset="50%" stopColor="#facc15" />
                            <stop offset="50%" stopColor="#d1d5db" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z"
                          fill={`url(#half${idx})`}
                        />
                      </g>
                    ) : (
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                    )}
                  </svg>
                );
              })}
              <span className="ml-2 text-base text-black">
                {Number.isFinite(data.averageScore)
                  ? data.averageScore.toFixed(1)
                  : "-"}
              </span>
            </span>
          </div>

          {/* 신고 버튼 */}
          <button
            onClick={() => setShowReportModal(true)}
            className="text-red-500 text-sm underline mb-6 cursor-pointer"
          >
            강의 신고하기
          </button>

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
              <a href="#" className="text-blue-500 text-xs mt-1 inline-block">
                트레이너 프로필 보기 &gt;
              </a>
            </div>
          </div>

          {/* 강의 소개 */}
          <section className="mb-8">
            <h2 className="font-bold text-lg mb-2">강의 소개</h2>
            <div dangerouslySetInnerHTML={{ __html: data.content }}></div>
          </section>
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
              className="w-full bg-green-600 text-white py-2 rounded mb-2 font-semibold"
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

      {/* 결제 모달 */}
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

      {/*  신고 모달 */}
      {showReportModal && (
        <ReportModal
          lectureId={data.id}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
