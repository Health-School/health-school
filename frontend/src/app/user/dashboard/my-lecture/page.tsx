"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardSidebar from "@/components/dashboard/UserDashboardSidebar";

interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
}

interface Lecture {
  lectureId: number;
  trainerName: string;
  lectureName: string;
  lectureLevel: string;
  userName: string;
  startDate: string;
  createdDate: string;
  coverImageUrl: string | null;
}

export default function MyLecturePage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("latest");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchMyLectures = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectureUsers/my-lectures?sort=${sortBy}&page=${page}&size=10`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch lectures");
        }

        const result: PageResponse<Lecture> = await response.json();
        console.log("강의 목록 응답:", result);

        if (result && Array.isArray(result.content)) {
          setLectures(result.content);
          setTotalPages(result.totalPages);
          setError(null);
        } else {
          setError("강의 목록을 불러오는데 실패했습니다.");
        }
      } catch (err) {
        console.error("강의 목록 조회 에러:", err);
        setError("강의 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyLectures();
  }, [page, sortBy]);

  const displayLectures = lectures;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 사이드바 */}
      <DashboardSidebar />

      {/* 메인 컨텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* 페이지 제목 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                수강 강의
              </h1>
              <p className="text-gray-600">
                현재 수강 중인 강의 목록을 확인하고 학습을 이어가세요.
              </p>
            </div>

            {/* 정렬 드롭다운 */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-500">
                총 {lectures.length}개의 강의
              </div>
              <select
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(0);
                }}
              >
                <option value="latest">최신순</option>
                <option value="name">이름순</option>
                <option value="progress">진행률순</option>
              </select>
            </div>

            {/* 강의 목록이 없을 때 */}
            {displayLectures.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl">📚</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  수강 중인 강의가 없습니다
                </h3>
                <p className="text-gray-500 mb-6">
                  새로운 강의를 수강해보세요!
                </p>
                <Link
                  href="/lectures"
                  className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  강의 둘러보기
                </Link>
              </div>
            ) : (
              <>
                {/* 강의 그리드 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {displayLectures.map((lecture) => (
                    <div
                      key={lecture.lectureId}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="relative h-48">
                        <Image
                          src={
                            lecture.coverImageUrl ||
                            `/images/lectures/lecture-${lecture.lectureId}.jpg`
                          }
                          alt={lecture.lectureName}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/images/default-lecture.jpg";
                          }}
                        />
                        <div className="absolute top-3 right-3">
                          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            수강중
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                            {lecture.lectureName}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <span className="text-base mr-2">👨‍🏫</span>
                            {lecture.userName} 트레이너
                          </div>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">난이도</span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                lecture.lectureLevel === "BEGINNER"
                                  ? "bg-green-100 text-green-800"
                                  : lecture.lectureLevel === "INTERMEDIATE"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {lecture.lectureLevel === "BEGINNER"
                                ? "초급"
                                : lecture.lectureLevel === "INTERMEDIATE"
                                  ? "중급"
                                  : "고급"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">수강 시작일</span>
                            <span className="text-gray-700">
                              {new Date(lecture.createdDate).toLocaleDateString(
                                "ko-KR"
                              )}
                            </span>
                          </div>
                        </div>

                        {/* 진행률 바 (더미 데이터) */}
                        <div className="mb-6">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-500">진행률</span>
                            <span className="text-green-600 font-medium">
                              65%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: "65%" }}
                            ></div>
                          </div>
                        </div>

                        <Link
                          href={`/lecture/${lecture.lectureId}/dashboard`}
                          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors text-center block font-medium"
                        >
                          강의 이어보기
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        page === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                      }`}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      이전
                    </button>

                    <div className="flex space-x-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            page === i
                              ? "bg-green-500 text-white"
                              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() =>
                        setPage(Math.min(totalPages - 1, page + 1))
                      }
                      disabled={page === totalPages - 1}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        page === totalPages - 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                      }`}
                    >
                      다음
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
