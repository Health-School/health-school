"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import ExerciseRecordModal from "@/components/exercise/ExerciseRecordModal";
import ExerciseEditModal from "@/components/exercise/ExerciseEditModal";
import DashboardSidebar from "@/components/dashboard/UserDashboardSidebar";

interface Feedback {
  id: number;
  exerciseSheetId: number;
  trainerId: number;
  trainerName: string;
  comment: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface MachineExercise {
  machineId: number;
  reps: number;
  sets: number;
  weight: number;
}

interface ExerciseSheetEdit {
  exerciseDate: string;
  exerciseStartTime: string;
  exerciseEndTime: string;
  machineExercises: MachineExercise[];
}

interface Machine {
  id: number;
  name: string;
  body: string[];
  type: string;
}

interface ExerciseEditModalProps {
  onClose: () => void;
  onSuccess: () => void;
  exerciseSheet: {
    id: number;
    exerciseDate: string;
    exerciseStartTime: string;
    exerciseEndTime: string;
    machineExercises: {
      machineId: number;
      machineName: string;
      reps: number;
      sets: number;
      weight: number;
    }[];
  };
}

interface ExerciseSheet {
  id: number;
  exerciseDate: string;
  exerciseStartTime: string;
  exerciseEndTime: string;
  machineExercises: {
    id: number;
    machineId: number;
    machineName: string;
    reps: number;
    sets: number;
    weight: number;
  }[];
}

export default function MyExercisesPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [exerciseSheets, setExerciseSheets] = useState<ExerciseSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSheet, setEditingSheet] = useState<ExerciseSheet | null>(null);
  const [feedbacks, setFeedbacks] = useState<{ [key: number]: Feedback[] }>({});

  const fetchExerciseSheets = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/exerciseSheets`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch exercise sheets");
      }

      const result: ApiResponse<ExerciseSheet[]> = await response.json();

      if (result.success) {
        setExerciseSheets(result.data);
        result.data.forEach((sheet) => {
          fetchFeedback(sheet.id);
        });
        setError(null);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("운동 기록 조회 에러:", err);
      setError("운동 기록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async (sheetId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/feedbacks/sheet/${sheetId}`,
        {
          credentials: "include",
        }
      );

      const result: ApiResponse<Feedback[]> = await response.json();

      if (result.success) {
        setFeedbacks((prev) => ({
          ...prev,
          [sheetId]: result.data,
        }));
      } else {
        console.error("피드백 조회 실패:", result.message);
      }
    } catch (err) {
      console.error("피드백 조회 중 오류 발생:", err);
    }
  };

  useEffect(() => {
    fetchExerciseSheets();
  }, []);

  const hasExercise = (date: string) => {
    return exerciseSheets.some((sheet) => sheet.exerciseDate === date);
  };

  const selectedDateExercises = selectedDate
    ? exerciseSheets.filter((sheet) => sheet.exerciseDate === selectedDate)
    : [];

  const today = new Date();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDay = firstDayOfMonth.getDay();

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  const handleEdit = (sheet: ExerciseSheet) => {
    if (!sheet.id) {
      console.error("Invalid exercise sheet ID");
      return;
    }
    setEditingSheet(sheet);
    setShowEditModal(true);
  };

  const handleDelete = async (sheetId: number) => {
    if (!confirm("정말로 이 운동 기록을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/exerciseSheets/${sheetId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (result.success) {
        await fetchExerciseSheets();
      } else {
        alert(result.message || "운동 기록 삭제에 실패했습니다.");
      }
    } catch (err) {
      console.error("운동 기록 삭제 실패:", err);
      alert("운동 기록 삭제에 실패했습니다.");
    }
  };

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
        <div className="flex-1 flex justify-center items-center p-6">
          <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center max-w-md">
            {error}
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
          <div className="max-w-6xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">운동 기록 내역</h1>
            {/* Calendar Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={prevMonth}
                  className=" p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                  type="button"
                >
                  <svg
                    className="w-5 h-5"
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
                </button>
                <h2 className="text-xl font-semibold text-gray-800 whitespace-nowrap">
                  {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                  type="button"
                >
                  <svg
                    className="w-5 h-5"
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
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-green-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-green-600 transition-colors font-medium shadow-sm text-sm sm:text-base whitespace-nowrap cursor-pointer"
                type="button"
              >
                + 운동 기록 추가
              </button>
            </div>
            {/* Calendar Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
                {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                  <div
                    key={day}
                    className="text-center py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-600"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 달력 날짜 */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {Array.from({ length: 42 }).map((_, i) => {
                  const day = i - startingDay + 1;
                  const isCurrentMonth = day > 0 && day <= daysInMonth;
                  const currentDateStr = isCurrentMonth
                    ? formatDateString(
                        firstDayOfMonth.getFullYear(),
                        firstDayOfMonth.getMonth(),
                        day
                      )
                    : null;
                  const hasWorkout = currentDateStr
                    ? hasExercise(currentDateStr)
                    : false;

                  const isToday =
                    currentDateStr ===
                    formatDateString(
                      new Date().getFullYear(),
                      new Date().getMonth(),
                      new Date().getDate()
                    );

                  return (
                    <div
                      key={i}
                      className={`
                        border-2 rounded-lg p-1 sm:p-3 
                        min-h-[60px] sm:min-h-[80px] 
                        transition-all duration-200 
                        ${
                          isCurrentMonth
                            ? "cursor-pointer hover:bg-gray-50 border-gray-200"
                            : "bg-gray-50 border-gray-100"
                        } 
                        ${hasWorkout ? "bg-green-50 border-green-200" : ""} 
                        ${
                          selectedDate === currentDateStr
                            ? "ring-2 ring-green-500 border-green-500"
                            : ""
                        } 
                        ${isToday ? "border-blue-400 bg-blue-50" : ""}
                      `}
                      onClick={() =>
                        isCurrentMonth && setSelectedDate(currentDateStr)
                      }
                    >
                      {isCurrentMonth && (
                        <div className="h-full flex flex-col">
                          <span
                            className={`text-xs sm:text-sm font-medium ${
                              isToday ? "text-blue-600" : "text-gray-700"
                            }`}
                          >
                            {day}
                          </span>
                          {hasWorkout && (
                            <div className="mt-1 flex-1 flex items-center justify-center">
                              <span className="text-xs text-green-600 bg-green-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                완료
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Exercise Records Display */}
            {selectedDateExercises.length > 0 && (
              <div className="space-y-6">
                {selectedDateExercises.map((sheet, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                        {new Date(sheet.exerciseDate).toLocaleDateString(
                          "ko-KR"
                        )}{" "}
                        운동 기록
                      </h3>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEdit(sheet)}
                          className="px-3 sm:px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors font-medium text-sm sm:text-base cursor-pointer"
                          type="button"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(sheet.id)}
                          className="px-3 sm:px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm sm:text-base cursor-pointer"
                          type="button"
                        >
                          삭제
                        </button>
                      </div>
                    </div>

                    {/* Exercise List */}
                    <div className="grid gap-4 mb-6">
                      {sheet.machineExercises.map((exercise, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 rounded-lg border border-gray-200 p-4"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                              {exercise.machineName}
                            </h4>
                          </div>
                          <div className="grid grid-cols-3 gap-2 sm:gap-4">
                            <div className="text-center p-2 sm:p-3 bg-white rounded-lg border border-gray-100">
                              <div className="text-xs sm:text-sm text-gray-500 mb-1">
                                세트
                              </div>
                              <div className="text-sm sm:text-lg font-semibold text-gray-900">
                                {exercise.sets}
                              </div>
                            </div>
                            <div className="text-center p-2 sm:p-3 bg-white rounded-lg border border-gray-100">
                              <div className="text-xs sm:text-sm text-gray-500 mb-1">
                                횟수
                              </div>
                              <div className="text-sm sm:text-lg font-semibold text-gray-900">
                                {exercise.reps}
                              </div>
                            </div>
                            <div className="text-center p-2 sm:p-3 bg-white rounded-lg border border-gray-100">
                              <div className="text-xs sm:text-sm text-gray-500 mb-1">
                                무게
                              </div>
                              <div className="text-sm sm:text-lg font-semibold text-gray-900">
                                {exercise.weight}kg
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Feedback Section */}
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                        트레이너 피드백
                      </h4>

                      {feedbacks[sheet.id]?.length > 0 ? (
                        <div className="space-y-4">
                          {feedbacks[sheet.id].map((feedback) => (
                            <div
                              key={feedback.id}
                              className="bg-blue-50 rounded-lg p-4 border border-blue-200"
                            >
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                                <span className="font-semibold text-blue-800 text-sm sm:text-base">
                                  {feedback.trainerName} 트레이너
                                </span>
                                <span className="text-xs sm:text-sm text-gray-500">
                                  {new Date(feedback.createdAt).toLocaleString(
                                    "ko-KR"
                                  )}
                                </span>
                              </div>
                              <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm sm:text-base">
                                {feedback.comment}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 sm:py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                          <svg
                            className="w-8 sm:w-12 h-8 sm:h-12 text-gray-400 mx-auto mb-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          <p className="text-sm sm:text-base">
                            아직 등록된 피드백이 없습니다.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* 선택된 날짜가 없을 때 안내 메시지
            {!selectedDate && (
              <div className="text-center py-8 sm:py-12 text-gray-500">
                <svg
                  className="w-12 sm:w-16 h-12 sm:h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-base sm:text-lg font-medium">
                  날짜를 선택해주세요
                </p>
                <p className="text-xs sm:text-sm">
                  캘린더에서 날짜를 클릭하면 해당 날짜의 운동 기록을 확인할 수
                  있습니다.
                </p>
              </div>
            )} */}
          </div>
        </div>
      </div>

      {/* 모달들 */}
      {showAddModal && (
        <ExerciseRecordModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchExerciseSheets();
            setShowAddModal(false);
          }}
          selectedDate={selectedDate}
        />
      )}

      {showEditModal && editingSheet && (
        <ExerciseEditModal
          onClose={() => {
            setShowEditModal(false);
            setEditingSheet(null);
          }}
          onSuccess={() => {
            fetchExerciseSheets();
            setShowEditModal(false);
            setEditingSheet(null);
          }}
          exerciseSheet={editingSheet}
        />
      )}
    </div>
  );
}
