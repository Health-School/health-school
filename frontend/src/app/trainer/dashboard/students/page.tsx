"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

// Update Student interface
interface Student {
  id: number;
  username: string; // changed from nickname
  email: string;
  phoneNumber: string; // added phone number
}

interface QnA {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  studentName: string;
  status: "WAITING" | "ANSWERED";
}

interface WorkoutLog {
  id: number;
  studentName: string;
  date: string;
  exercises: {
    name: string;
    sets: { weight: number; reps: number }[];
  }[];
}

// Update ApiResponse interface to match the actual API response
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: {
    content: T[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
      };
      offset: number;
      paged: boolean;
      unpaged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
  };
}

export default function StudentsPage() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<"students" | "qna" | "logs">(
    "students"
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [qnas, setQnas] = useState<QnA[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);

  // Add pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { name: "MY 강의 관리", href: "/trainer/dashboard/my-lectures" },
    { name: "정산 내역", href: "/trainer/dashboard/settlements" },
    { name: "수강생 관리", href: "/trainer/dashboard/students" },
    { name: "상담 일정", href: "/trainer/dashboard/consultations" },
    { name: "운동 기구 신청", href: "/trainer/dashboard/equipments" },
    { name: "MY 자격증 관리", href: "/trainer/dashboard/certificates" },
  ];

  const contentTabs = [
    { key: "students", name: "수강생 목록" },
    { key: "qna", name: "QnA 목록" },
    { key: "logs", name: "운동 기록" },
  ];

  // Fetch data functions
  const fetchStudents = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectureUsers/students?page=${page}&size=10`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("수강생 목록 조회에 실패했습니다.");
      }

      const result: ApiResponse<Student> = await response.json();
      console.log("API Response:", result); // 디버깅용

      if (result.success) {
        setStudents(result.data.content);
        setTotalPages(result.data.totalPages);
        console.log("Students:", result.data.content); // 디버깅용
      }
    } catch (error) {
      console.error("수강생 목록 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQnAs = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/qnas`,
        { credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        setQnas(data.data);
      }
    } catch (error) {
      console.error("QnA 목록 조회 실패:", error);
    }
  };

  const fetchWorkoutLogs = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/workout-logs`,
        { credentials: "include" }
      );
      if (response.ok) {
        const data = await response.json();
        setWorkoutLogs(data.data);
      }
    } catch (error) {
      console.error("운동 기록 조회 실패:", error);
    }
  };

  useEffect(() => {
    switch (activeTab) {
      case "students":
        fetchStudents(currentPage);
        break;
      case "qna":
        fetchQnAs();
        break;
      case "logs":
        fetchWorkoutLogs();
        break;
    }
  }, [activeTab, currentPage]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Main navigation */}
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

      {/* Content tabs */}
      <div className="mb-6">
        <nav className="flex space-x-4">
          {contentTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 rounded-md ${
                activeTab === tab.key
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content area */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === "students" && (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    수강생
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    이메일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    전화번호
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center">
                      로딩 중...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center">
                      수강생이 없습니다.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.phoneNumber}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="mt-4 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentPage === 0 || isLoading}
                  className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50"
                >
                  이전
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    disabled={isLoading}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === i
                        ? "bg-green-500 text-white"
                        : "border border-gray-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                  }
                  disabled={currentPage === totalPages - 1 || isLoading}
                  className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50"
                >
                  다음
                </button>
              </nav>
            </div>
          </>
        )}

        {activeTab === "qna" && (
          <div className="space-y-4">
            {qnas.map((qna) => (
              <div
                key={qna.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{qna.title}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      qna.status === "WAITING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {qna.status === "WAITING" ? "답변 대기" : "답변 완료"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{qna.content}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{qna.studentName}</span>
                  <span>
                    {format(new Date(qna.createdAt), "yyyy.MM.dd HH:mm")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "logs" && (
          <div className="space-y-6">
            {workoutLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">{log.studentName}의 운동 기록</h3>
                  <span className="text-sm text-gray-500">
                    {format(new Date(log.date), "yyyy.MM.dd")}
                  </span>
                </div>
                <div className="space-y-4">
                  {log.exercises.map((exercise, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded">
                      <h4 className="font-medium mb-2">{exercise.name}</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {exercise.sets.map((set, setIndex) => (
                          <div
                            key={setIndex}
                            className="text-sm bg-white p-2 rounded border"
                          >
                            {set.weight}kg × {set.reps}회
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
