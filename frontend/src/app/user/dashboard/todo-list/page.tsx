"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TodoAddModal from "@/components/todo/TodoAddModal";
import TodoEditModal from "@/components/todo/TodoEditModal";
import DashboardTabs from "@/components/dashboard/DashboardTabs";

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Navigation Tabs */}
      <DashboardTabs />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">할 일 목록</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          + 할 일 추가
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex justify-between items-center p-4 border-b">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            ←
          </button>
          <h2 className="text-lg font-semibold">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {/* 요일 헤더 수정 */}
          {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
            <div
              key={day}
              className={`bg-gray-50 p-2 text-center font-medium ${
                index === 0
                  ? "text-red-500"
                  : index === 6
                    ? "text-blue-500"
                    : ""
              }`}
            >
              {day}
            </div>
          ))}

          {/* 날짜 그리드 수정 */}
          {Array.from({ length: 42 }).map((_, index) => {
            const dayNumber = index - startingDay + 1;
            const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
            const date = formatDateString(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              dayNumber
            );
            const hasTodoOnDate = isCurrentMonth && hasTodo(date);
            const dayOfWeek = index % 7; // 0은 일요일, 6은 토요일

            return (
              <div
                key={index}
                className={`bg-white p-2 min-h-[80px] ${
                  isCurrentMonth
                    ? "cursor-pointer hover:bg-blue-50"
                    : "bg-gray-50 text-gray-400"
                } ${selectedDate === date ? "bg-blue-100" : ""}`}
                onClick={() => isCurrentMonth && setSelectedDate(date)}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`${
                      isCurrentMonth
                        ? dayOfWeek === 0
                          ? "text-red-500"
                          : dayOfWeek === 6
                            ? "text-blue-500"
                            : ""
                        : ""
                    }`}
                  >
                    {isCurrentMonth ? dayNumber : ""}
                  </span>
                  {hasTodoOnDate && (
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Todo List for Selected Date */}
      {selectedDate && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {new Date(selectedDate).toLocaleDateString()} 할 일
          </h3>
          {selectedDateTodos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              이 날짜에 등록된 할 일이 없습니다.
            </p>
          ) : (
            selectedDateTodos.map((todo) => (
              <div
                key={todo.id}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-lg text-gray-800">
                        {todo.title}
                      </h4>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          getTodoStatus(todo.isDone).className
                        }`}
                      >
                        {getTodoStatus(todo.isDone).text}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      마감일: {new Date(todo.dueDate).toLocaleDateString()}
                    </div>
                    <div className="mt-2 p-3 bg-gray-50 rounded-md text-gray-700">
                      {todo.content}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(todo)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

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
