"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TodoAddModal from "@/components/todo/TodoAddModal";
import TodoEditModal from "@/components/todo/TodoEditModal";
import DashboardSidebar from "@/components/dashboard/UserDashboardSidebar";

// Update Todo interface and add TodoEnumType
type TodoEnumType = "DO" | "DOING" | "DONE";

interface Todo {
  id: number;
  title: string;
  content: string;
  isDone: TodoEnumType; // Use the enum type
  dueDate: string;
}

export default function TodoListPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/todos`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch todos");
      }

      const result = await response.json();
      console.log("Received todos:", result); // Debug log

      if (result.success) {
        // Ensure isDone values are valid enum values
        const validTodos = result.data.map((todo: any) => ({
          ...todo,
          isDone: todo.isDone as TodoEnumType,
        }));
        setTodos(validTodos);
        setError(null);
      } else {
        setError(result.message || "할 일 목록을 불러오는데 실패했습니다.");
      }
    } catch (err) {
      console.error("할 일 목록 조회 에러:", err);
      setError("할 일 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // Add delete handler function after fetchTodos
  const handleDelete = async (id: number) => {
    if (!confirm("정말로 이 할 일을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/todos/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (result.success) {
        await fetchTodos(); // Refresh the list
        alert("삭제가 완료되었습니다.");
      } else {
        alert(result.message || "삭제에 실패했습니다.");
      }
    } catch (err) {
      console.error("할 일 삭제 실패:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setShowEditModal(true);
  };

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

  // Calendar date helpers
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

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  const hasTodo = (date: string) => {
    return todos.some((todo) => todo.dueDate === date);
  };

  // Get todos for selected date
  const selectedDateTodos = selectedDate
    ? todos.filter((todo) => todo.dueDate === selectedDate)
    : [];

  // Add TodoStatus helper
  const getTodoStatus = (status: Todo["isDone"]) => {
    switch (status) {
      case "DO":
        return {
          text: "진행예정",
          className: "bg-yellow-100 text-yellow-800",
        };
      case "DOING":
        return {
          text: "진행중",
          className: "bg-blue-100 text-blue-800",
        };
      case "DONE":
        return {
          text: "완료",
          className: "bg-green-100 text-green-800",
        };
      default:
        return {
          text: "상태없음",
          className: "bg-gray-100 text-gray-800",
        };
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
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    할 일 목록
                  </h1>
                  <p className="text-gray-600">
                    일정을 관리하고 할 일을 체계적으로 정리하세요.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center space-x- cursor-pointer"
                >
                  <span>+</span>
                  <span>할 일 추가</span>
                </button>
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {/* 요일 헤더 */}
                {["일", "월", "화", "수", "목", "금", "토"].map(
                  (day, index) => (
                    <div
                      key={day}
                      className={`bg-gray-50 p-4 text-center font-medium text-sm ${
                        index === 0
                          ? "text-red-500"
                          : index === 6
                            ? "text-blue-500"
                            : "text-gray-700"
                      }`}
                    >
                      {day}
                    </div>
                  )
                )}

                {/* 날짜 그리드 */}
                {Array.from({ length: 42 }).map((_, index) => {
                  const dayNumber = index - startingDay + 1;
                  const isCurrentMonth =
                    dayNumber > 0 && dayNumber <= daysInMonth;
                  const date = formatDateString(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    dayNumber
                  );
                  const hasTodoOnDate = isCurrentMonth && hasTodo(date);
                  const dayOfWeek = index % 7;
                  const isToday =
                    isCurrentMonth &&
                    new Date().toDateString() ===
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        dayNumber
                      ).toDateString();

                  return (
                    <div
                      key={index}
                      className={`bg-white p-3 min-h-[100px] border-r border-b border-gray-100 transition-all duration-200 ${
                        isCurrentMonth
                          ? "cursor-pointer hover:bg-green-50"
                          : "bg-gray-50 text-gray-400"
                      } ${selectedDate === date ? "bg-green-100 ring-2 ring-green-300" : ""}`}
                      onClick={() => isCurrentMonth && setSelectedDate(date)}
                    >
                      <div className="flex justify-between items-start h-full">
                        <span
                          className={`text-sm font-medium ${
                            isCurrentMonth
                              ? isToday
                                ? "bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center"
                                : dayOfWeek === 0
                                  ? "text-red-500"
                                  : dayOfWeek === 6
                                    ? "text-blue-500"
                                    : "text-gray-700"
                              : ""
                          }`}
                        >
                          {isCurrentMonth ? dayNumber : ""}
                        </span>
                        {hasTodoOnDate && (
                          <div className="flex flex-col items-end">
                            <div className="w-2 h-2 rounded-full bg-green-500 mb-1"></div>
                            <span className="text-xs text-green-600 font-medium">
                              {
                                todos.filter((todo) => todo.dueDate === date)
                                  .length
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Todo List for Selected Date */}
            {selectedDate && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {new Date(selectedDate).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      weekday: "long",
                    })}{" "}
                    할 일
                  </h3>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {selectedDateTodos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📝</span>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      이 날짜에 등록된 할 일이 없습니다
                    </h4>
                    <p className="text-gray-500 mb-4">
                      새로운 할 일을 추가해보세요!
                    </p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      할 일 추가
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDateTodos.map((todo) => (
                      <div
                        key={todo.id}
                        className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-all duration-200 hover:shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-lg text-gray-900">
                                {todo.title}
                              </h4>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  getTodoStatus(todo.isDone).className
                                }`}
                              >
                                {getTodoStatus(todo.isDone).text}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
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
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              마감일:{" "}
                              {new Date(todo.dueDate).toLocaleDateString(
                                "ko-KR"
                              )}
                            </div>
                            {todo.content && (
                              <div className="mt-3 p-4 bg-gray-50 rounded-lg text-gray-700 text-sm leading-relaxed">
                                {todo.content}
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleEdit(todo)}
                              className="text-green-600 hover:text-green-700 px-3 py-2 rounded-lg border border-green-600 hover:bg-green-50 transition-colors text-sm font-medium"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleDelete(todo.id)}
                              className="text-red-600 hover:text-red-700 px-3 py-2 rounded-lg border border-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Todo Modal */}
      {showAddModal && (
        <TodoAddModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchTodos}
          defaultDate={selectedDate || undefined}
        />
      )}

      {/* Edit Todo Modal */}
      {showEditModal && editingTodo && (
        <TodoEditModal
          todo={editingTodo}
          onClose={() => {
            setShowEditModal(false);
            setEditingTodo(null);
          }}
          onSuccess={() => {
            fetchTodos();
            setShowEditModal(false);
            setEditingTodo(null);
          }}
        />
      )}
    </div>
  );
}
