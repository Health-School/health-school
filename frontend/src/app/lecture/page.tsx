"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

// 강의 및 카테고리 타입 정의
type Lecture = {
  id: number;
  title: string;
  content: string;
  price: number;
  lectureStatus: string;
  lectureLevel: string;
  trainerName: string;
  coverImageUrl: string;
  averageScore: number;
  category: string; // 추가
  createdAt: string; // 추가 (LocalDateTime → string으로 받음)
};

type Category = {
  id: number;
  categoryName: string;
};

// 난이도 드롭다운 옵션 매핑
const LEVEL_OPTIONS = [
  { label: "전체", value: null },
  { label: "초급", value: "BEGINNER" },
  { label: "중급", value: "INTERMEDIATE" },
  { label: "고급", value: "ADVANCED" },
];

export default function LecturePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [levelDropdownOpen, setLevelDropdownOpen] = useState(false);
  const levelRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const params = useParams();
  const router = useRouter();
  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        levelRef.current &&
        !levelRef.current.contains(event.target as Node)
      ) {
        setLevelDropdownOpen(false);
      }
    }
    if (levelDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [levelDropdownOpen]);

  // 카테고리 불러오기
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lecture_categories`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setCategories([{ id: 0, categoryName: "전체" }, ...data.data]);
      });
  }, []);

  // 강의 불러오기 (카테고리, 난이도 변경 시마다 호출)
  useEffect(() => {
    const categoryParam = selectedCategory === "전체" ? "" : selectedCategory;
    const levelParam = selectedLevel ? selectedLevel : "";

    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (categoryParam) params.append("category", categoryParam);
    if (levelParam) params.append("lectureLevel", levelParam);
    console.log(params.toString());
    const url = `${
      process.env.NEXT_PUBLIC_API_BASE_URL
    }/api/v1/lectures?${params.toString()}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setLectures(data.data.content || []);
      });
  }, [page, size, selectedCategory, selectedLevel]);

  // 카테고리 버튼 클릭 시
  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setPage(0);
    router.push(
      `/lecture?category=${encodeURIComponent(
        categoryName
      )}&level=${encodeURIComponent(selectedLevel || "")}`
    );

    // 강의 불러오기만 호출 (필터링은 서버에서)
    // useEffect에서 selectedCategory, selectedLevel 변경 시 자동 호출됨
  };

  // 난이도 드롭다운 선택 시
  const handleLevelSelect = (levelValue: string | null) => {
    setSelectedLevel(levelValue);
    setLevelDropdownOpen(false);
    setPage(0);
    router.push(
      `/lecture?category=${encodeURIComponent(
        selectedCategory
      )}&level=${encodeURIComponent(levelValue || "")}`
    );

    // 강의 불러오기만 호출 (필터링은 서버에서)
    // useEffect에서 selectedCategory, selectedLevel 변경 시 자동 호출됨
  };

  return (
    <main className="bg-white min-h-screen pb-20">
      {/* 카테고리/필터 바 */}
      <section
        className="w-full bg-white sticky top-0 mt-10 border-b"
        style={{ zIndex: 20 }}
      >
        <div className="mx-auto px-4 py-4 flex flex-wrap gap-2 items-center">
          {/* 카테고리 버튼들 */}
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`px-4 py-2 rounded-full text-sm font-semibold border cursor-pointer ${
                selectedCategory === cat.categoryName
                  ? "bg-green-100 text-green-700 border-green-400"
                  : "bg-white text-gray-700 border-gray-200"
              }`}
              onClick={() => handleCategoryClick(cat.categoryName)}
            >
              {cat.categoryName}
            </button>
          ))}

          <div ref={levelRef} className="relative ml-2" style={{ zIndex: 200 }}>
            <button
              onClick={() => setLevelDropdownOpen((v) => !v)}
              className="border px-4 py-2 rounded-full cursor-pointer text-gray-700 flex items-center gap-2 bg-white"
            >
              난이도
              <svg
                className={`w-4 h-4 transition-transform ${
                  levelDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {levelDropdownOpen && (
              <div
                className="absolute left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2"
                style={{ zIndex: 300 }}
              >
                {LEVEL_OPTIONS.map((opt) => (
                  <label
                    key={opt.label}
                    className="flex items-start px-4 py-2 cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedLevel === opt.value}
                      onChange={() => handleLevelSelect(opt.value)}
                      className="mr-2 mt-1"
                    />
                    <div>
                      <span className="font-medium">{opt.label}</span>
                      <div className="text-xs text-gray-400">
                        {opt.label === "전체"
                          ? ""
                          : opt.label === "초급"
                            ? "누구나 들을 수 있는"
                            : opt.label === "중급"
                              ? "선수 지식이 필요한"
                              : opt.label === "고급"
                                ? "전문성을 높이는"
                                : ""}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 강의 카드 리스트 */}
      <section className=" mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {lectures.map((lecture) => (
            <div
              key={lecture.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col relative group cursor-pointer hover:shadow-lg transition"
              onClick={() => {
                router.push(`/lecture/${lecture.id}`);
              }}
            >
              <div className="relative w-full h-36 rounded-t-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {lecture.coverImageUrl ? (
                  <Image
                    src={lecture.coverImageUrl}
                    alt={lecture.title}
                    layout="fill"
                    objectFit="cover"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-gray-400 text-2xl">No Image</span>
                )}
              </div>
              <div className="flex-1 flex flex-col px-3 py-3">
                <div className="font-semibold text-sm mb-1 line-clamp-2">
                  {lecture.title}
                </div>
                <div className="text-xs text-gray-500 mb-1">
                  {lecture.trainerName}
                </div>
                <div className="mb-1">
                  <span className="text-black font-bold text-base">
                    {lecture.price?.toLocaleString()}원
                  </span>
                </div>
                {/* 평점 별점 표시 */}
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const score = lecture.averageScore ?? 0;
                    if (score >= idx + 1) {
                      // 꽉 찬 별
                      return (
                        <svg
                          key={idx}
                          className="w-4 h-4 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                        </svg>
                      );
                    } else if (score > idx && score < idx + 1) {
                      // 반 별
                      return (
                        <svg key={idx} className="w-4 h-4" viewBox="0 0 20 20">
                          <defs>
                            <linearGradient
                              id={`half${lecture.id}-${idx}`}
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
                            fill={`url(#half${lecture.id}-${idx})`}
                          />
                        </svg>
                      );
                    } else {
                      // 빈 별
                      return (
                        <svg
                          key={idx}
                          className="w-4 h-4 text-gray-300"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                        </svg>
                      );
                    }
                  })}
                  <span className="text-xs text-gray-500 ml-1">
                    {Number.isFinite(lecture.averageScore)
                      ? lecture.averageScore.toFixed(1)
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                    {lecture.lectureLevel}
                  </span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                    {lecture.lectureStatus}
                  </span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                    {lecture.category}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  {lecture.createdAt &&
                    new Date(lecture.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* 페이지네이션 (예시) */}
        <div className="flex justify-center mt-10 gap-2">
          <button
            className="px-3 py-1 rounded border cursor-pointer"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            이전
          </button>
          <span className="px-3 py-1 cursor-pointer">{page + 1}</span>
          <button
            className="px-3 py-1 rounded border cursor-pointer"
            onClick={() => setPage((p) => p + 1)}
          >
            다음
          </button>
        </div>
      </section>
    </main>
  );
}
