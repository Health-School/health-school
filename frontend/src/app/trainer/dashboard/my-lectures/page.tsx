"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import removeMarkdown from "remove-markdown";
import { responseCookiesToRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

interface LectureStats {
  totalStudents: number;
  completionRate: number;
  averageRating: number;
  totalRevenue: number;
}

interface Lecture {
  id: number;
  title: string;
  content: string;
  price: number;
  lectureStatus: string;
  lectureLevel: string;
  trainerName: string;
}

interface LecturePage {
  content: Lecture[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

// Update ApiResponse interface
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: {
    content: Lecture[];
    pageable: {
      pageNumber: number;
      pageSize: number;
    };
    totalPages: number;
    totalElements: number;
    last: boolean;
  };
}

export default function MyLecturesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("내 정보");
  const [stats] = useState<LectureStats>({
    totalStudents: 105,
    completionRate: 85,
    averageRating: 4.8,
    totalRevenue: 1850000,
  });

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const handleNewLecture = () => {
    router.push("/trainer/dashboard/my-lectures/new");
  };

  // Update fetchLectures function
  const fetchLectures = async (page: number = 0) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectures?page=${page}&size=10`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("강의 목록 조회에 실패했습니다.");
      }

      const apiResponse: ApiResponse<LecturePage> = await response.json();
      console.log("API Response:", apiResponse);

      if (apiResponse.success && apiResponse.data) {
        const { content, totalPages, pageable } = apiResponse.data;
        setLectures(content);
        setTotalPages(totalPages);
        setCurrentPage(pageable.pageNumber);
      }
    } catch (error) {
      console.error("강의 목록 조회 오류:", error);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, []);

  const tabs = [
    { name: "MY 강의 관리", href: "/trainer/dashboard/my-lectures" },
    { name: "정산 내역", href: "/trainer/dashboard/settlements" },
    { name: "수강생 관리", href: "/trainer/dashboard/students" },
    { name: "상담 일정", href: "/trainer/dashboard/consultations" },
    { name: "운동 기구 신청", href: "/trainer/dashboard/equipments" },
    { name: "MY 자격증 관리", href: "/trainer/dashboard/certificates" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 탭 메뉴 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={`${
                pathname === tab.href
                  ? "text-green-500 border-b-2 border-green-500 font-semibold"
                  : "text-gray-500 border-transparent border-b-2 font-medium"
              } py-4 px-2 hover:text-green-700 transition-colors`}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-gray-600">총 수강생</span>
            <div className="flex items-center text-xs text-green-500">
              <span>전월 대비 +15%</span>
            </div>
          </div>
          <div className="text-2xl font-bold">{stats.totalStudents}명</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-gray-600">수료율</span>
            <div className="flex items-center text-xs text-green-500">
              <span>전월 대비 +5%</span>
            </div>
          </div>
          <div className="text-2xl font-bold">{stats.completionRate}%</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-gray-600">평균 평점</span>
            <div className="flex items-center text-xs text-green-500">
              <span>전월 대비 +0.2</span>
            </div>
          </div>
          <div className="text-2xl font-bold">{stats.averageRating}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-gray-600">총 수익</span>
            <div className="flex items-center text-xs text-green-500">
              <span>전월 대비 +12%</span>
            </div>
          </div>
          <div className="text-2xl font-bold">
            {stats.totalRevenue.toLocaleString()}원
          </div>
        </div>
      </div>

      {/* 공지사항 섹션 */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-500">✓</span>
              </span>
              <span className="text-gray-700">
                답변을 기다리는 질문이 있습니다
              </span>
            </div>
            <button className="text-green-500 hover:text-green-600">
              모두 보기
            </button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-500">!</span>
              </span>
              <span className="text-gray-700">
                새로운 학생 메시지가 있습니다
              </span>
            </div>
            <button className="text-blue-500 hover:text-blue-600">
              모두 보기
            </button>
          </div>
        </div>
      </div>

      {/* 자주 묻는 질문 섹션 */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">최근 채팅 메시지</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
              <div>
                <div className="text-sm text-gray-600 mb-1">이민지</div>
                <div className="text-gray-800">
                  초보자도 쉽게 요가를 할수 있을까요?
                </div>
              </div>
              <button className="text-blue-500">답변하기</button>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
              <div>
                <div className="text-sm text-gray-600 mb-1">김현우</div>
                <div className="text-gray-800">
                  요가 수업 준비물에는 무엇이 있나요?
                </div>
              </div>
              <button className="text-blue-500">답변하기</button>
            </div>
          </div>
          <button className="text-green-500 mt-4">더보기 &gt;</button>
        </div>
      </div>

      {/* 강의 목록 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">강의 목록</h2>
          <button
            onClick={handleNewLecture}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            + 새 강의 등록
          </button>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {lectures.map((lecture) => (
            <div
              key={lecture.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{lecture.title}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {removeMarkdown(lecture.content)}
                </p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {lecture.lectureLevel}
                    {/* {lecture.lectureLevel === "BEGINNER"
                      ? "초급"
                      : lecture.lectureLevel === "INTERMEDIATE"
                      ? "중급"
                      : "고급"} */}
                  </span>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    {lecture.lectureStatus === "OPEN" ? "운영중" : "준비중"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">
                    {lecture.price.toLocaleString()}원
                  </span>
                  <button
                    onClick={() =>
                      router.push(
                        `/trainer/dashboard/my-lectures/${lecture.id}`
                      )
                    }
                    className="text-blue-600 hover:text-blue-700"
                  >
                    관리하기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => fetchLectures(i)}
                className={`px-3 py-1 rounded ${
                  currentPage === i
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
