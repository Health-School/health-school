"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  const [activeTab, setActiveTab] = useState<"students" | "qna" | "logs">(
    "students"
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
      if (!comment || comment.trim() === '') {
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
            content: comment.trim() // Changed from 'comment' to 'content' to match DTO
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
      alert(error instanceof Error ? error.message : "피드백 수정에 실패했습니다.");
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
          <>
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  <h2 className="text-xl font-bold">강의 QnA 목록</h2>
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    ← 전체 QnA 목록으로 돌아가기
                  </button>
                </div>
                {lectureQnas.map((qna) => (
                  <div
                    key={qna.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="mb-2">
                      <div
                        onClick={() => handleLectureClick(qna.lectureId)}
                        className="text-sm text-red-500 mb-1 cursor-pointer hover:underline"
                      >
                        "{qna.lectureTitle}" 강의에 질문이 추가되었습니다!
                      </div>
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{qna.title}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
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
                        <p className="text-gray-600 p-3 bg-gray-50 rounded mb-2">
                          {qna.content}
                        </p>
                        <button
                          onClick={() => handleLectureClick(qna.lectureId)}
                          className="text-green-600 hover:text-green-700 text-xs underline"
                        >
                          해당 강의 QnA 게시판으로 이동
                        </button>
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
                        className="text-green-600 hover:text-green-700 text-sm"
                      >
                        {expandedQnaId === qna.id ? "접기" : "자세히 보기"}
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
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="mb-2">
                        <div
                          onClick={() => handleLectureClick(qna.lectureId)}
                          className="text-sm text-red-500 mb-1 cursor-pointer hover:underline"
                        >
                          "{qna.lectureTitle}" 강의에 질문이 추가되었습니다!
                        </div>
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{qna.title}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
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
                          <p className="text-gray-600 p-3 bg-gray-50 rounded mb-2">
                            {qna.content}
                          </p>
                          <button
                            onClick={() => handleLectureClick(qna.lectureId)}
                            className="text-green-600 hover:text-green-700 text-xs underline"
                          >
                            해당 강의 QnA 게시판으로 이동
                          </button>
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
                          className="text-green-600 hover:text-green-700 text-sm"
                        >
                          {expandedQnaId === qna.id ? "접기" : "자세히 보기"}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-6 flex justify-center">
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

        {activeTab === "logs" && (
          <>
            {selectedExercise ? (
              // Detail view
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">
                    {selectedExercise.machineExercises[0]?.writerName}님의 상세
                    운동 기록
                  </h3>
                  <button
                    onClick={() => setSelectedExercise(null)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    ← 목록으로 돌아가기
                  </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="mb-4 pb-4 border-b">
                    <p className="text-sm text-gray-500">
                      운동 일자:{" "}
                      {format(
                        new Date(selectedExercise.exerciseDate),
                        "yyyy.MM.dd"
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      운동 시간: {selectedExercise.exerciseStartTime} -{" "}
                      {selectedExercise.exerciseEndTime}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {selectedExercise.machineExercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="p-4 bg-gray-50 rounded-lg"
                      >
                        <h4 className="font-medium mb-2">
                          {exercise.machineName}
                        </h4>
                        <div className="bg-white p-3 rounded border border-gray-200">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">세트:</span>{" "}
                              <span className="font-medium">
                                {exercise.sets}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">횟수:</span>{" "}
                              <span className="font-medium">
                                {exercise.reps}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">무게:</span>{" "}
                              <span className="font-medium">
                                {exercise.weight}kg
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add feedback section */}
                <div className="mt-6">
                  {showFeedbackForm ? (
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h4 className="text-lg font-medium mb-4">피드백 작성</h4>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="피드백을 입력하세요..."
                        className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <div className="flex justify-end space-x-2 mt-4">
                        <button
                          onClick={() => setShowFeedbackForm(false)}
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border rounded-md"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => submitFeedback(selectedExercise.id)}
                          disabled={!feedback.trim()}
                          className="px-4 py-2 text-sm text-white bg-green-500 hover:bg-green-600 rounded-md disabled:opacity-50"
                        >
                          피드백 등록
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowFeedbackForm(true)}
                      className="w-full py-3 text-green-600 hover:text-green-700 font-medium bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      피드백 달기
                    </button>
                  )}
                </div>

                {/* Show existing feedbacks if any */}
                {selectedExercise?.feedbacks &&
                  selectedExercise.feedbacks.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h4 className="text-lg font-medium mb-4">
                        등록된 피드백
                      </h4>
                      <div className="space-y-4">
                        {selectedExercise.feedbacks.map(
                          (feedback: FeedbackDto) => (
                            <div key={feedback.id} className="border-b pb-4">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  {editingFeedbackId === feedback.id ? (
                                    // Edit mode
                                    <div className="space-y-2">
                                      <textarea
                                        value={editingComment}
                                        onChange={(e) =>
                                          setEditingComment(e.target.value)
                                        }
                                        className="w-full h-24 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                      />
                                      <div className="flex justify-end space-x-2">
                                        <button
                                          onClick={() => {
                                            setEditingFeedbackId(null);
                                            setEditingComment("");
                                          }}
                                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border rounded-md"
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
                                          disabled={!editingComment.trim()}
                                          className="px-3 py-1 text-sm text-white bg-green-500 hover:bg-green-600 rounded-md disabled:opacity-50"
                                        >
                                          수정완료
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    // View mode
                                    <>
                                      <p className="text-gray-700">
                                        {feedback.comment}
                                      </p>
                                      <div className="flex items-center mt-2 text-sm text-gray-500">
                                        <span>
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
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => {
                                        setEditingFeedbackId(feedback.id);
                                        setEditingComment(feedback.comment);
                                      }}
                                      className="text-sm text-blue-500 hover:text-blue-700"
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
                                      className="text-sm text-red-500 hover:text-red-700"
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
              <div className="space-y-6">
                {workoutLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-medium">
                          {log.username}님의 운동 기록
                        </h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(log.exerciseDate), "yyyy.MM.dd")}
                        </p>
                      </div>
                      <button
                        onClick={() => fetchExerciseDetail(log.id)}
                        className="px-4 py-2 text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        자세히 보기 →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination (only show when not in detail view) */}
            {!selectedExercise && (
              <div className="mt-6 flex justify-center">
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
                      setCurrentPage((prev) =>
                        Math.min(totalPages - 1, prev + 1)
                      )
                    }
                    disabled={currentPage === totalPages - 1 || isLoading}
                    className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50"
                  >
                    다음
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
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
