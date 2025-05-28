"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import TrainerDashboardSidebar from "@/components/dashboard/TrainerDashboardSidebar";

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
  lectureId: number;
  lectureTitle: string;
  userId: number;
  username: string;
  openStatus: "OPEN" | "CLOSED";
  createdDate: string;
  updatedDate: string;
}

// Update ExerciseSheet interface
interface ExerciseSheet {
  id: number;
  userId: number;
  username: string;
  exerciseDate: string;
  exerciseStartTime: string;
  exerciseEndTime: string;
}

// Add Lecture interface at the top with other interfaces
interface Lecture {
  id: number;
  title: string;
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

// Add new interfaces for detailed view
interface MachineExerciseDetail {
  id: number;
  writerId: number;
  writerName: string;
  machineName: string;
  reps: number;
  sets: number;
  weight: number;
}

// Update ExerciseSheetDetail interface to include feedbacks
interface ExerciseSheetDetail {
  id: number;
  exerciseDate: string;
  exerciseStartTime: string;
  exerciseEndTime: string;
  machineExercises: MachineExerciseDetail[];
  feedbacks: FeedbackDto[]; // Update type to FeedbackDto
}

// Make sure Feedback interface is defined
interface Feedback {
  id: number;
  content: string;
  createdAt: string;
  writerId: number;
  writerName: string;
}

// Update FeedbackDto interface to match API response
interface FeedbackDto {
  id: number;
  exerciseSheetId: number;
  trainerId: number;
  trainerName: string;
  comment: string;
  createdAt: string;
}

export default function StudentsPage() {
  // Add router
  const router = useRouter();
  const pathname = usePathname();
  // Update initial activeTab state
  const [activeTab, setActiveTab] = useState<"students" | "qna" | "logs">(
    () => {
      // Check localStorage for saved tab if running in browser
      if (typeof window !== "undefined") {
        const savedTab = localStorage.getItem("activeTab");
        // Clear the stored tab
        localStorage.removeItem("activeTab");
        // Return saved tab or default to 'students'
        return (savedTab as "students" | "qna" | "logs") || "students";
      }
      return "students";
    }
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [qnas, setQnas] = useState<QnA[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<ExerciseSheet[]>([]);
  // Add state for lectures
  const [lectures, setLectures] = useState<Lecture[]>([]);

  // Add pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Add new state for expanded QnA
  const [expandedQnaId, setExpandedQnaId] = useState<number | null>(null);

  // Add new state for selected lecture
  const [selectedLectureId, setSelectedLectureId] = useState<number | null>(
    null
  );
  const [lectureQnas, setLectureQnas] = useState<QnA[]>([]);

  // Add new state for search
  const [searchTerm, setSearchTerm] = useState("");

  // Add new state for selected exercise detail
  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseSheetDetail | null>(null);

  // Add state for feedback
  const [feedback, setFeedback] = useState<string>("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  // Add new state for editing feedback
  const [editingFeedbackId, setEditingFeedbackId] = useState<number | null>(
    null
  );
  const [editingComment, setEditingComment] = useState("");

  const contentTabs = [
    { key: "students", name: "수강생 목록" },
    { key: "qna", name: "QnA 목록" },
    { key: "logs", name: "수강생 운동 기록" },
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

  const fetchQnAs = async (page: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/qna/trainer?page=${page}&size=10`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("QnA 목록 조회에 실패했습니다.");
      }

      const result: ApiResponse<QnA> = await response.json();
      if (result.success) {
        setQnas(result.data.content);
        setTotalPages(result.data.totalPages);
      }
    } catch (error) {
      console.error("QnA 목록 조회 실패:", error);
    }
  };

  // Add function to fetch QnAs by lecture ID
  const fetchLectureQnAs = async (lectureId: number, page: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/qna/trainer/qna?lectureId=${lectureId}&page=${page}&size=10`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("강의 QnA 목록 조회에 실패했습니다.");
      }

      const result: ApiResponse<QnA> = await response.json();
      if (result.success) {
        setLectureQnas(result.data.content);
        setTotalPages(result.data.totalPages);
      }
    } catch (error) {
      console.error("강의 QnA 목록 조회 실패:", error);
    }
  };

  // Add function to fetch lectures
  const fetchLectures = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectures`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("강의 목록 조회에 실패했습니다.");
      }

      const result = await response.json();
      if (result.success) {
        setLectures(result.data.content);
      }
    } catch (error) {
      console.error("강의 목록 조회 실패:", error);
    }
  };

  // Update fetchExerciseSheets function with proper type
  const fetchExerciseSheets = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/exerciseSheets/students-exercise-sheets?page=${page}&size=10`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("운동 기록 조회에 실패했습니다.");
      }

      const result: ApiResponse<ExerciseSheet> = await response.json();
      if (result.success) {
        setWorkoutLogs(result.data.content);
        setTotalPages(result.data.totalPages);
      }
    } catch (error) {
      console.error("운동 기록 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add fetchWorkoutLogs function
  const fetchWorkoutLogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/exerciseSheets/students-exercise-sheets?page=${currentPage}&size=10`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("운동 기록 조회에 실패했습니다.");
      }

      const result: ApiResponse<ExerciseSheet> = await response.json();
      if (result.success) {
        setWorkoutLogs(result.data.content);
        setTotalPages(result.data.totalPages);
      }
    } catch (error) {
      console.error("운동 기록 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add function to fetch feedbacks
  const fetchFeedbacks = async (sheetId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/feedbacks/sheet/${sheetId}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("피드백 목록 조회에 실패했습니다.");
      }

      const result = await response.json();
      if (result.success) {
        return result.data;
      }
    } catch (error) {
      console.error("피드백 목록 조회 실패:", error);
      return [];
    }
  };

  // Update fetchExerciseDetail to include feedbacks
  const fetchExerciseDetail = async (id: number) => {
    try {
      const [exerciseResponse, feedbacksResponse] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/exerciseSheets/trainer/${id}`,
          { credentials: "include" }
        ),
        fetchFeedbacks(id),
      ]);

      if (!exerciseResponse.ok) {
        throw new Error("운동 상세 기록 조회에 실패했습니다.");
      }

      const exerciseResult = await exerciseResponse.json();

      if (exerciseResult.success) {
        setSelectedExercise({
          ...exerciseResult.data,
          feedbacks: feedbacksResponse || [],
        });
      }
    } catch (error) {
      console.error("운동 상세 기록 조회 실패:", error);
    }
  };

  // Update submitFeedback function with correct DTO format
  const submitFeedback = async (exerciseId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/feedbacks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            sheetId: exerciseId,
            comment: feedback,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("피드백 등록에 실패했습니다.");
      }

      const result = await response.json();
      if (result.success) {
        alert("피드백이 등록되었습니다.");
        setFeedback("");
        setShowFeedbackForm(false);
        // Refresh exercise detail
        fetchExerciseDetail(exerciseId);
      }
    } catch (error) {
      console.error("피드백 등록 실패:", error);
      alert("피드백 등록에 실패했습니다.");
    }
  };

  // Add deleteFeedback function
  const deleteFeedback = async (feedbackId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/feedbacks/${feedbackId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("피드백 삭제에 실패했습니다.");
      }

      const result = await response.json();
      if (result.success) {
        alert("피드백이 삭제되었습니다.");
        // Refresh exercise detail to update feedback list
        fetchExerciseDetail(selectedExercise?.id!);
      }
    } catch (error) {
      console.error("피드백 삭제 실패:", error);
      alert("피드백 삭제에 실패했습니다.");
    }
  };

  // Update updateFeedback function
  const updateFeedback = async (feedbackId: number, comment: string) => {
    try {
      // Validate comment before sending request
      if (!comment || comment.trim() === "") {
        throw new Error("피드백 내용을 입력해주세요.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/feedbacks/${feedbackId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            content: comment.trim(), // Changed from 'comment' to 'content' to match DTO
          }),
        }
      );

      if (!response.ok) {
        throw new Error("피드백 수정에 실패했습니다.");
      }

      const result = await response.json();
      if (result.success) {
        alert("피드백이 수정되었습니다.");
        setEditingFeedbackId(null);
        setEditingComment("");
        fetchExerciseDetail(selectedExercise?.id!);
      }
    } catch (error) {
      console.error("피드백 수정 실패:", error);
      alert(
        error instanceof Error ? error.message : "피드백 수정에 실패했습니다."
      );
    }
  };

  useEffect(() => {
    switch (activeTab) {
      case "students":
        fetchStudents(currentPage);
        break;
      case "qna":
        if (selectedLectureId !== null) {
          fetchLectureQnAs(selectedLectureId, currentPage);
        } else {
          fetchQnAs(currentPage);
        }
        break;
      case "logs":
        fetchWorkoutLogs();
        break;
    }
  }, [activeTab, currentPage, selectedLectureId]);

  // Add useEffect to fetch lectures when QnA tab is active
  useEffect(() => {
    if (activeTab === "qna") {
      fetchLectures();
    }
  }, [activeTab]);

  // Update handleLectureClick function
  const handleLectureClick = async (lectureId: number) => {
    setSelectedLectureId(lectureId);
    await fetchLectureQnAs(lectureId, 0);
    setCurrentPage(0);
  };

  // Add back button function
  const handleBack = () => {
    setSelectedLectureId(null);
    setLectureQnas([]);
    fetchQnAs(0);
    setCurrentPage(0);
  };

  // Add search handler
  const handleSearch = () => {
    setCurrentPage(0);
    if (selectedLectureId) {
      fetchLectureQnAs(selectedLectureId, 0);
    } else {
      fetchQnAs(0);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 사이드바 */}
      <TrainerDashboardSidebar />

      {/* 메인 컨텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* 페이지 제목 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                수강생 관리
              </h1>
              <p className="text-gray-600">
                수강생 정보, QnA, 운동 기록을 확인하고 피드백을 제공하세요.
              </p>
            </div>

            {/* Content tabs */}
            <div className="mb-6">
              <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                {contentTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.key
                        ? "bg-white text-green-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {activeTab === "students" && (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      수강생 목록
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      총 {students.length}명의 수강생
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            수강생
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            이메일
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            전화번호
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                          <tr>
                            <td colSpan={3} className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-2"></div>
                                <span className="text-gray-500">
                                  로딩 중...
                                </span>
                              </div>
                            </td>
                          </tr>
                        ) : students.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                  <span className="text-3xl">👥</span>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                  수강생이 없습니다
                                </h3>
                                <p className="text-gray-500">
                                  아직 등록된 수강생이 없습니다.
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          students.map((student) => (
                            <tr
                              key={student.id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {student.username}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {student.email}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {student.phoneNumber}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-8">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(0, prev - 1))
                        }
                        disabled={currentPage === 0 || isLoading}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === 0 || isLoading
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm"
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
                        {Array.from({ length: totalPages }, (_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === i
                                ? "bg-green-500 text-white shadow-lg"
                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages - 1, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages - 1 || isLoading}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === totalPages - 1 || isLoading
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm"
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

              {activeTab === "qna" && (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      QnA 관리
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      수강생들의 질문을 확인하고 답변하세요.
                    </p>
                  </div>

                  {/* Replace existing search bar with lecture selector */}
                  <div className="mb-6">
                    <div className="flex gap-4">
                      <select
                        value={selectedLectureId || ""}
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          if (id) {
                            handleLectureClick(id);
                          } else {
                            handleBack();
                          }
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">전체 강의 보기</option>
                        {lectures.map((lecture) => (
                          <option key={lecture.id} value={lecture.id}>
                            {lecture.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedLectureId ? (
                    // Show lecture specific QnAs
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium">강의별 QnA 목록</h3>
                        <button
                          onClick={handleBack}
                          className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
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
                          전체 QnA 목록으로 돌아가기
                        </button>
                      </div>
                      {lectureQnas.map((qna) => (
                        <div
                          key={qna.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="mb-2">
                            <div className="text-sm text-green-600 mb-1 font-medium">
                              "{qna.lectureTitle}" 강의 질문
                            </div>
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium text-gray-900">
                                {qna.title}
                              </h4>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  qna.openStatus === "OPEN"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {qna.openStatus === "OPEN" ? "공개" : "비공개"}
                              </span>
                            </div>
                          </div>
                          {expandedQnaId === qna.id && (
                            <div className="text-sm mb-2 mt-2">
                              <p className="text-gray-600 p-3 bg-gray-50 rounded border border-gray-200">
                                {qna.content}
                              </p>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <div className="flex items-center space-x-2">
                              <span>{qna.username}</span>
                              <span>·</span>
                              <span>
                                {format(
                                  new Date(qna.createdDate),
                                  "yyyy.MM.dd HH:mm"
                                )}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                setExpandedQnaId(
                                  expandedQnaId === qna.id ? null : qna.id
                                )
                              }
                              className="text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                              {expandedQnaId === qna.id
                                ? "접기"
                                : "자세히 보기"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Filter QnAs by lecture title
                    <div className="space-y-4">
                      {qnas
                        .filter((qna) =>
                          qna.lectureTitle
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        )
                        .map((qna) => (
                          <div
                            key={qna.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="mb-2">
                              <div
                                onClick={() =>
                                  handleLectureClick(qna.lectureId)
                                }
                                className="text-sm text-green-600 mb-1 cursor-pointer hover:underline font-medium"
                              >
                                "{qna.lectureTitle}" 강의에 질문이
                                추가되었습니다!
                              </div>
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium text-gray-900">
                                  {qna.title}
                                </h4>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    qna.openStatus === "OPEN"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {qna.openStatus === "OPEN"
                                    ? "공개"
                                    : "비공개"}
                                </span>
                              </div>
                            </div>
                            {expandedQnaId === qna.id && (
                              <div className="text-sm mb-2 mt-2">
                                <p className="text-gray-600 p-3 bg-gray-50 rounded border border-gray-200">
                                  {qna.content}
                                </p>
                              </div>
                            )}
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <div className="flex items-center space-x-2">
                                <span>{qna.username}</span>
                                <span>·</span>
                                <span>
                                  {format(
                                    new Date(qna.createdDate),
                                    "yyyy.MM.dd HH:mm"
                                  )}
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  setExpandedQnaId(
                                    expandedQnaId === qna.id ? null : qna.id
                                  )
                                }
                                className="text-green-600 hover:text-green-700 text-sm font-medium"
                              >
                                {expandedQnaId === qna.id
                                  ? "접기"
                                  : "자세히 보기"}
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-8">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(0, prev - 1))
                        }
                        disabled={currentPage === 0 || isLoading}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === 0 || isLoading
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm"
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
                        {Array.from({ length: totalPages }, (_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === i
                                ? "bg-green-500 text-white shadow-lg"
                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages - 1, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages - 1 || isLoading}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === totalPages - 1 || isLoading
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm"
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

              {activeTab === "logs" && (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      운동 기록 관리
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      수강생들의 운동 기록을 확인하고 피드백을 제공하세요.
                    </p>
                  </div>

                  {selectedExercise ? (
                    // Detail view
                    <div className="space-y-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">
                          {selectedExercise.machineExercises[0]?.writerName}님의
                          상세 운동 기록
                        </h3>
                        <button
                          onClick={() => setSelectedExercise(null)}
                          className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
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
                          목록으로 돌아가기
                        </button>
                      </div>

                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <div className="mb-4 pb-4 border-b border-gray-300">
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">운동 일자:</span>{" "}
                            {format(
                              new Date(selectedExercise.exerciseDate),
                              "yyyy.MM.dd"
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">운동 시간:</span>{" "}
                            {selectedExercise.exerciseStartTime} -{" "}
                            {selectedExercise.exerciseEndTime}
                          </p>
                        </div>

                        <div className="space-y-4">
                          {selectedExercise.machineExercises.map((exercise) => (
                            <div
                              key={exercise.id}
                              className="bg-white p-4 rounded-lg border border-gray-200"
                            >
                              <h4 className="font-medium text-gray-900 mb-3">
                                {exercise.machineName}
                              </h4>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="text-center p-2 bg-gray-50 rounded">
                                  <span className="block text-gray-500 text-xs">
                                    세트
                                  </span>
                                  <span className="block font-semibold text-lg text-gray-900">
                                    {exercise.sets}
                                  </span>
                                </div>
                                <div className="text-center p-2 bg-gray-50 rounded">
                                  <span className="block text-gray-500 text-xs">
                                    횟수
                                  </span>
                                  <span className="block font-semibold text-lg text-gray-900">
                                    {exercise.reps}
                                  </span>
                                </div>
                                <div className="text-center p-2 bg-gray-50 rounded">
                                  <span className="block text-gray-500 text-xs">
                                    무게
                                  </span>
                                  <span className="block font-semibold text-lg text-gray-900">
                                    {exercise.weight}kg
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Add feedback section */}
                      <div className="mt-6">
                        {showFeedbackForm ? (
                          <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h4 className="text-lg font-medium mb-4">
                              피드백 작성
                            </h4>
                            <textarea
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              placeholder="피드백을 입력하세요..."
                              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                            <div className="flex justify-end space-x-2 mt-4">
                              <button
                                onClick={() => setShowFeedbackForm(false)}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                취소
                              </button>
                              <button
                                onClick={() =>
                                  submitFeedback(selectedExercise.id)
                                }
                                disabled={!feedback.trim()}
                                className="px-4 py-2 text-sm text-white bg-green-500 hover:bg-green-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                피드백 등록
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowFeedbackForm(true)}
                            className="w-full py-3 text-green-600 hover:text-green-700 font-medium bg-green-50 hover:bg-green-100 rounded-lg transition-colors border-2 border-dashed border-green-200 hover:border-green-300"
                          >
                            + 피드백 작성하기
                          </button>
                        )}
                      </div>

                      {/* Show existing feedbacks if any */}
                      {selectedExercise?.feedbacks &&
                        selectedExercise.feedbacks.length > 0 && (
                          <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h4 className="text-lg font-medium mb-4">
                              등록된 피드백 ({selectedExercise.feedbacks.length}
                              개)
                            </h4>
                            <div className="space-y-4">
                              {selectedExercise.feedbacks.map(
                                (feedback: FeedbackDto) => (
                                  <div
                                    key={feedback.id}
                                    className="border-b border-gray-200 pb-4 last:border-b-0"
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex-1">
                                        {editingFeedbackId === feedback.id ? (
                                          // Edit mode
                                          <div className="space-y-2">
                                            <textarea
                                              value={editingComment}
                                              onChange={(e) =>
                                                setEditingComment(
                                                  e.target.value
                                                )
                                              }
                                              className="w-full h-24 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            />
                                            <div className="flex justify-end space-x-2">
                                              <button
                                                onClick={() => {
                                                  setEditingFeedbackId(null);
                                                  setEditingComment("");
                                                }}
                                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                                              >
                                                취소
                                              </button>
                                              <button
                                                onClick={() =>
                                                  updateFeedback(
                                                    feedback.id,
                                                    editingComment
                                                  )
                                                }
                                                disabled={
                                                  !editingComment.trim()
                                                }
                                                className="px-3 py-1 text-sm text-white bg-green-500 hover:bg-green-600 rounded-lg disabled:opacity-50"
                                              >
                                                수정완료
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          // View mode
                                          <>
                                            <p className="text-gray-700 mb-2">
                                              {feedback.comment}
                                            </p>
                                            <div className="flex items-center text-sm text-gray-500">
                                              <span className="font-medium">
                                                {feedback.trainerName} 트레이너
                                              </span>
                                              <span className="mx-2">·</span>
                                              <span>
                                                {format(
                                                  new Date(feedback.createdAt),
                                                  "yyyy.MM.dd HH:mm"
                                                )}
                                              </span>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                      {editingFeedbackId !== feedback.id && (
                                        <div className="flex space-x-2 ml-4">
                                          <button
                                            onClick={() => {
                                              setEditingFeedbackId(feedback.id);
                                              setEditingComment(
                                                feedback.comment
                                              );
                                            }}
                                            className="text-sm text-blue-500 hover:text-blue-700 font-medium"
                                          >
                                            수정
                                          </button>
                                          <button
                                            onClick={() => {
                                              if (
                                                window.confirm(
                                                  "이 피드백을 삭제하시겠습니까?"
                                                )
                                              ) {
                                                deleteFeedback(feedback.id);
                                              }
                                            }}
                                            className="text-sm text-red-500 hover:text-red-700 font-medium"
                                          >
                                            삭제
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  ) : (
                    // List view
                    <div className="space-y-4">
                      {workoutLogs.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-3xl">📊</span>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            운동 기록이 없습니다
                          </h3>
                          <p className="text-gray-500">
                            아직 등록된 운동 기록이 없습니다.
                          </p>
                        </div>
                      ) : (
                        workoutLogs.map((log) => (
                          <div
                            key={log.id}
                            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">
                                  {log.username}님의 운동 기록
                                </h3>
                                <p className="text-sm text-gray-500 mb-2">
                                  {format(
                                    new Date(log.exerciseDate),
                                    "yyyy.MM.dd"
                                  )}
                                </p>
                                <p className="text-sm text-gray-600">
                                  운동 시간: {log.exerciseStartTime} -{" "}
                                  {log.exerciseEndTime}
                                </p>
                              </div>
                              <button
                                onClick={() => fetchExerciseDetail(log.id)}
                                className="px-4 py-2 text-sm text-green-600 hover:text-green-700 font-medium bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                              >
                                자세히 보기 →
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Pagination (only show when not in detail view) */}
                  {!selectedExercise && totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-8">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(0, prev - 1))
                        }
                        disabled={currentPage === 0 || isLoading}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === 0 || isLoading
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm"
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
                        {Array.from({ length: totalPages }, (_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === i
                                ? "bg-green-500 text-white shadow-lg"
                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages - 1, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages - 1 || isLoading}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === totalPages - 1 || isLoading
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm"
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
    </div>
  );
}

// Update calculateDuration function with proper type definitions
const calculateDuration = (startTime: string, endTime: string): string => {
  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);
  const diff = end.getTime() - start.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}시간 ${minutes}분`;
};
