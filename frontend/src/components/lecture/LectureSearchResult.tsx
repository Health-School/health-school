"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import removeMarkdown from "remove-markdown";

// 백엔드 응답에 맞게 인터페이스 업데이트
interface Lecture {
  id: number;
  title: string;
  content: string;
  price: number;
  lectureLevel: string;
  lectureLevelDescription: string;
  lectureStatus: string;
  lectureStatusDescription: string;
  lectureImageUrl: string;
  trainerName: string;
  trainerEmail: string;
  trainerImageUrl: string;
  averageScore: number;
}

// 별점 표시 컴포넌트
const StarRating = ({ score }: { score: number }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`${
            star <= Math.round(score) ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-sm text-gray-600">{score.toFixed(1)}</span>
    </div>
  );
};

export default function LectureSearchResult() {
  const [keyword, setKeyword] = useState<string | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState<{
    name: string;
    email: string;
    imageUrl: string;
    lectureId: number;
  } | null>(null);

  // URL 변경 감지를 위한 함수
  const getKeywordFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("q");
  };

  // 강의 데이터 fetch
  const fetchLectures = async (searchKeyword: string) => {
    setIsLoading(true);
    setLectures([]); // 기존 결과 초기화
    setSelectedTrainer(null); // 선택된 트레이너 초기화

    try {
      console.log(`검색 키워드: ${searchKeyword}`); // 디버깅용
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectures/search?keyword=${encodeURIComponent(searchKeyword)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("검색 응답:", data); // 디버깅용

      if (data.success && data.data) {
        setLectures(data.data);
      } else if (Array.isArray(data)) {
        setLectures(data);
      } else {
        setLectures([]);
      }
    } catch (error) {
      console.error("검색 실패:", error);
      setLectures([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 로드 및 URL 변경 감지
  useEffect(() => {
    const currentKeyword = getKeywordFromUrl();
    setKeyword(currentKeyword);

    if (currentKeyword) {
      fetchLectures(currentKeyword);
    } else {
      setIsLoading(false);
    }

    // popstate 이벤트 리스너 (브라우저 뒤로가기/앞으로가기)
    const handlePopState = () => {
      const newKeyword = getKeywordFromUrl();
      setKeyword(newKeyword);
      if (newKeyword) {
        fetchLectures(newKeyword);
      }
    };

    window.addEventListener("popstate", handlePopState);

    // URL 변경 감지를 위한 interval (pushState/replaceState 감지)
    const intervalId = setInterval(() => {
      const newKeyword = getKeywordFromUrl();
      if (newKeyword !== keyword && newKeyword) {
        setKeyword(newKeyword);
        fetchLectures(newKeyword);
      }
    }, 100);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      clearInterval(intervalId);
    };
  }, [keyword]);

  const handleTrainerClick = (e: React.MouseEvent, lecture: Lecture) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedTrainer?.lectureId === lecture.id) {
      setSelectedTrainer(null);
    } else {
      setSelectedTrainer({
        name: lecture.trainerName,
        email: lecture.trainerEmail,
        imageUrl: lecture.trainerImageUrl,
        lectureId: lecture.id,
      });
    }
  };

  if (!keyword) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-8 text-gray-500">
          검색어를 입력해주세요.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">"{keyword}" 검색 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        "{keyword}" 검색 결과 ({lectures.length}개)
      </h1>

      {lectures.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <p className="text-lg text-gray-500">
            "{keyword}"에 대한 검색 결과가 없습니다.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            다른 키워드로 검색해보세요.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {lectures.map((lecture) => (
            <div
              key={lecture.id}
              className="border rounded-lg overflow-hidden hover:border-green-500 hover:shadow-md transition-all"
            >
              <Link href={`/lecture/${lecture.id}`} className="flex gap-4 p-4">
                <div className="flex-shrink-0">
                  <div className="relative h-32 w-48 overflow-hidden rounded-lg">
                    {lecture.lectureImageUrl ? (
                      <Image
                        src={lecture.lectureImageUrl}
                        alt={lecture.title}
                        width={192}
                        height={128}
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-400">
                        이미지 없음
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-xl font-semibold">{lecture.title}</h2>
                      {lecture.averageScore !== undefined && (
                        <StarRating score={lecture.averageScore} />
                      )}
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {removeMarkdown(lecture.content || "")}
                    </p>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                        {lecture.lectureLevelDescription}
                      </span>
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {lecture.lectureStatusDescription}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <button
                      onClick={(e) => handleTrainerClick(e, lecture)}
                      className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1 rounded-full transition-colors"
                    >
                      <div className="relative h-8 w-8 rounded-full overflow-hidden">
                        {lecture.trainerImageUrl ? (
                          <Image
                            src={lecture.trainerImageUrl}
                            alt={lecture.trainerName || "트레이너"}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-300 flex items-center justify-center">
                            <span className="text-xs text-gray-600">
                              {lecture.trainerName?.charAt(0) || "T"}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-gray-600 hover:text-green-600 transition-colors font-medium">
                        {lecture.trainerName || "트레이너"}
                      </span>
                    </button>

                    <div className="text-lg font-bold text-green-600">
                      {(lecture.price || 0).toLocaleString()}원
                    </div>
                  </div>
                </div>
              </Link>

              {selectedTrainer?.lectureId === lecture.id && (
                <div className="bg-gray-50 p-4 mt-0 border-t">
                  <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden">
                      {selectedTrainer.imageUrl ? (
                        <Image
                          src={selectedTrainer.imageUrl}
                          alt={selectedTrainer.name}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-300 flex items-center justify-center">
                          <span className="text-lg text-gray-600">
                            {selectedTrainer.name?.charAt(0) || "T"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {selectedTrainer.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedTrainer.email || "이메일 정보가 없습니다"}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedTrainer(null)}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="닫기"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
