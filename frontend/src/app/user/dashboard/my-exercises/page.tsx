"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import ExerciseRecordModal from "@/components/exercise/ExerciseRecordModal";
import ExerciseEditModal from "@/components/exercise/ExerciseEditModal";

interface Feedback {
  id: number;
  exerciseSheetId: number;
  trainerId: number;
  trainerName: string;
  comment: string; // Changed from content to comment
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
  id: number; // Remove optional marker
  exerciseDate: string;
  exerciseStartTime: string;
  exerciseEndTime: string;
  machineExercises: {
    id: number; // Remove optional marker
    machineId: number; // Remove optional marker
    machineName: string;
    reps: number;
    sets: number;
    weight: number;
  }[];
}

export default function MyExercisesPage() {
  // Replace currentMonth string state with Date state
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
        // 각 운동 기록에 대한 피드백 자동 조회
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

  // 해당 날짜에 운동 기록이 있는지 확인하는 함수
  const hasExercise = (date: string) => {
    return exerciseSheets.some((sheet) => sheet.exerciseDate === date);
  };

  // Find exercise sheet for selected date
  const selectedDateExercises = selectedDate
    ? exerciseSheets.filter((sheet) => sheet.exerciseDate === selectedDate)
    : [];

  // Calendar Grid 부분 수정
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

  // Add month navigation functions
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

  // Format date helper function
  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  // Add edit handler
  const handleEdit = (sheet: ExerciseSheet) => {
    if (!sheet.id) {
      console.error("Invalid exercise sheet ID");
      return;
    }

    // Validate machine IDs
    // const hasValidMachineIds = sheet.machineExercises.every(
    //   (exercise) => exercise.id && exercise.machineId
    // );

    // if (!hasValidMachineIds) {
    //   console.error("Invalid machine exercise IDs");
    //   return;
    // }

    setEditingSheet(sheet);
    setShowEditModal(true);
  };

  // Add delete handler
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
        await fetchExerciseSheets(); // Refresh the list
      } else {
        alert(result.message || "운동 기록 삭제에 실패했습니다.");
      }
    } catch (err) {
      console.error("운동 기록 삭제 실패:", err);
      alert("운동 기록 삭제에 실패했습니다.");
    }
  };

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
            className="text-gray-500 hover:text-gray-700 py-4 px-2"
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
            className="text-green-500 border-b-2 border-green-500 py-4 px-2"
          >
            운동 기록 내역
          </Link>
          <Link
            href="/user/dashboard/my-inquiry"
            className="text-gray-500 hover:text-gray-700 py-4 px-2"
          >
            1:1 상담
          </Link>
          <Link
            href="/user/dashboard/todo-list"
            className="text-gray-500 hover:text-gray-700 py-4 px-2"
          >
            todo list
          </Link>
        </nav>
      </div>

      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            &lt;
          </button>
          <h2 className="text-lg font-semibold">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            &gt;
          </button>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          + 운동 기록 추가
        </button>
      </div>

      {/* Add Modal */}
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

      {/* Edit Modal */}
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

      {/* Calendar Grid */}
      <div className="mb-8">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <div key={day} className="text-center py-2 text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 42 }).map((_, i) => {
            const day = i - startingDay + 1;
            const isCurrentMonth = day > 0 && day <= daysInMonth;
            const currentDate = isCurrentMonth
              ? formatDateString(
                  firstDayOfMonth.getFullYear(),
                  firstDayOfMonth.getMonth(),
                  day
                )
              : null;
            const hasWorkout = currentDate ? hasExercise(currentDate) : false;

            // Add today highlight
            const isToday =
              currentDate ===
              formatDateString(
                new Date().getFullYear(),
                new Date().getMonth(),
                new Date().getDate()
              );

            return (
              <div
                key={i}
                className={`border rounded-lg p-2 h-24 ${
                  isCurrentMonth
                    ? "cursor-pointer hover:bg-gray-50"
                    : "bg-gray-100"
                } ${hasWorkout ? "bg-green-50" : ""} ${
                  selectedDate === currentDate ? "ring-2 ring-green-500" : ""
                } ${isToday ? "border-blue-500" : ""} transition-colors`}
                onClick={() => isCurrentMonth && setSelectedDate(currentDate)}
              >
                {isCurrentMonth && (
                  <>
                    <span
                      className={`text-sm $(
                      isToday ? "text-blue-500 font-semibold" : "text-gray-600"
                    }`}
                    >
                      {day}
                    </span>
                    {hasWorkout && (
                      <div className="mt-1">
                        <span className="text-xs text-green-600">운동완료</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Exercise Records Display */}
      {selectedDateExercises.length > 0 && (
        <div className="mt-8">
          {selectedDateExercises.map((sheet, index) => (
            <div key={index} className="mb-8 bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {new Date(sheet.exerciseDate).toLocaleDateString()} 운동 기록
                </h3>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleEdit(sheet)}
                    className="text-green-500 hover:text-green-600"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(sheet.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    삭제
                  </button>
                </div>
              </div>

              {/* Exercise List */}
              {sheet.machineExercises.map((exercise, idx) => (
                <div key={idx} className="mb-4 bg-white rounded-lg border p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">{exercise.machineName}</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-sm text-gray-500">세트</div>
                      <div className="font-medium">{exercise.sets}세트</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-sm text-gray-500">횟수</div>
                      <div className="font-medium">{exercise.reps}회</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-sm text-gray-500">무게</div>
                      <div className="font-medium">{exercise.weight}kg</div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Feedback Section */}
              <div className="mt-6 border-t pt-4">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">
                  트레이너 피드백
                </h4>

                {feedbacks[sheet.id]?.length > 0 ? (
                  <div className="space-y-4">
                    {feedbacks[sheet.id].map((feedback) => (
                      <div
                        key={feedback.id}
                        className="bg-blue-50 rounded-lg p-4 border border-blue-100"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-blue-800">
                            {feedback.trainerName} 트레이너
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(feedback.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-line">
                          {feedback.comment}{" "}
                          {/* Changed from content to comment */}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    아직 등록된 피드백이 없습니다.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
