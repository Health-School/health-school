"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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

  // Remove client-side sorting since it's handled by backend
  const displayLectures = lectures;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
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
    );
  }

  return (
    <div className="p-6">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <Link
            href="/user/dashboard/my-info"
            className="text-gray-500 hover:text-gray-700 py-4 px-2"
          >
            내 정보
          </Link>
          <Link
            href="/user/dashboard/my-lecture"
            className="text-green-500 border-b-2 border-green-500 py-4 px-2"
          >
            수강 강의
          </Link>
          <Link
            href="/user/dashboard/my-order-list"
            className="text-gray-500 hover:text-gray-700 py-4 px-2"
          >
            결제 내역
          </Link>
          <Link
            href="/user/dashboard/my-exercises"
            className="text-gray-500 hover:text-gray-700 py-4 px-2"
          >
            운동 기록 내역
          </Link>
          <Link
            href="/user/dashboard/my-inquiry"
            className="text-gray-500 hover:text-gray-700 py-4 px-2"
          >
            1:1 상담
          </Link>
        </nav>
      </div>

      {/* Updated Sort Dropdown */}
      <div className="flex justify-end mb-6">
        <select
          className="border rounded-md px-3 py-2 text-sm"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(0); // Reset to first page when sorting changes
          }}
        >
          <option value="latest">최신순</option>
          <option value="name">이름순</option>
          <option value="progress">진행률순</option>
        </select>
      </div>

      {/* Lecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayLectures.map((lecture) => (
          <div
            key={lecture.lectureId}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="relative h-48">
              <Image
                src={`/images/lectures/lecture-${lecture.lectureId}.jpg`}
                alt={lecture.lectureName}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">
                {lecture.lectureName}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {lecture.trainerName} 트레이너
              </p>
              <p className="text-gray-500 text-sm mb-2">
                난이도: {lecture.lectureLevel}
              </p>
              <p className="text-gray-500 text-sm mb-4">
                수강 시작일:{" "}
                {new Date(lecture.createdDate).toLocaleDateString()}
              </p>
              <div className="mt-4">
                <Link
                  href={`/lectures/${lecture.lectureId}`}
                  className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors text-center block"
                >
                  강의 이어보기
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Updated Pagination */}
      {totalPages > 0 && (
        <div className="flex justify-center mt-8 space-x-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className={`px-3 py-2 rounded-md ${
              page === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
          >
            <span className="sr-only">Previous</span>
            &lt;
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`px-3 py-2 rounded-md ${
                page === i ? "bg-green-500 text-white" : "hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page === totalPages - 1}
            className={`px-3 py-2 rounded-md ${
              page === totalPages - 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
          >
            <span className="sr-only">Next</span>
            &gt;
          </button>
        </div>
      )}
    </div>
  );
}
