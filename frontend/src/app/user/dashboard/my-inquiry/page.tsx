"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";

// Add Trainer interface
interface Trainer {
  id: number;
  nickname: string;
}

interface Schedule {
  id: number;
  userName: string;
  trainerName: string;
  desiredDate: string;
  startTime: string;
  endTime: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
}

interface ScheduleCreate {
  trainerId: number;
  desiredDate: string;
  startTime: string;
  endTime: string;
}

// Add interface for paginated response
interface PaginatedResponse {
  content: Schedule[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

// Add ChatRoomResponseDto interface
interface ChatRoomResponseDto {
  id: number;
  title: string;
  senderName: string;
  receiverName: string;
  scheduleId: number;
}

export default function ConsultationPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [newSchedule, setNewSchedule] = useState<ScheduleCreate>({
    trainerId: 0,
    desiredDate: "",
    startTime: "",
    endTime: "",
  });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchSchedules();
    fetchTrainers();
  }, []);

  // Add trainer fetching function
  const fetchTrainers = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/trainers`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch trainers");
      }

      const result = await response.json();
      setTrainers(result);
    } catch (error) {
      console.error("Failed to fetch trainers:", error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/schedules?page=${page}&size=10`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch schedules");
      }

      const result = await response.json();
      setSchedules(result.data.content);
      setTotalPages(result.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/schedules`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(newSchedule),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create schedule");
      }

      fetchSchedules();
      setNewSchedule({
        trainerId: 0,
        desiredDate: "",
        startTime: "",
        endTime: "",
      });
    } catch (error) {
      console.error("Failed to create schedule:", error);
    }
  };

  // Add effect to refetch when page changes
  useEffect(() => {
    fetchSchedules();
  }, [page]);

  // Add function to handle chat room entry
  const handleChatRoomEntry = async (scheduleId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chatrooms/schedule/${scheduleId}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch chat room");
      }

      const result = await response.json();
      // result 객체 전체를 콘솔에 출력하여 구조 확인
      console.log("Chat room response:", result);

      // API 응답 구조에 맞게 수정
      const chatRoom: ChatRoomResponseDto = result; // .data 제거

      // 채팅방 ID가 있는지 확인
      if (!chatRoom.id) {
        throw new Error("Invalid chat room ID");
      }

      // Navigate to chat room using the chat room id
      window.location.href = `/chat/room/${chatRoom.id}`;
    } catch (error) {
      console.error("Failed to enter chat room:", error);
      alert("채팅방 입장에 실패했습니다.");
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
            className="text-gray-500 hover:text-gray-700 py-4 px-2"
          >
            운동 기록 내역
          </Link>
          <Link
            href="/user/dashboard/my-inquiry"
            className="text-green-500 border-b-2 border-green-500 py-4 px-2"
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

      {/* 상담 신청 폼 */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md mb-8"
      >
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              트레이너 선택
            </label>
            <select
              value={newSchedule.trainerId}
              onChange={(e) =>
                setNewSchedule({
                  ...newSchedule,
                  trainerId: Number(e.target.value),
                })
              }
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">트레이너를 선택하세요</option>
              {trainers.map((trainer) => (
                <option key={trainer.id} value={trainer.id}>
                  {trainer.nickname}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상담 날짜
            </label>
            <input
              type="date"
              value={newSchedule.desiredDate}
              onChange={(e) =>
                setNewSchedule({
                  ...newSchedule,
                  desiredDate: e.target.value,
                })
              }
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시작 시간
              </label>
              <input
                type="time"
                value={newSchedule.startTime}
                onChange={(e) =>
                  setNewSchedule({
                    ...newSchedule,
                    startTime: e.target.value,
                  })
                }
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                종료 시간
              </label>
              <input
                type="time"
                value={newSchedule.endTime}
                onChange={(e) =>
                  setNewSchedule({
                    ...newSchedule,
                    endTime: e.target.value,
                  })
                }
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            상담 신청하기
          </button>
        </div>
      </form>

      {/* 상담 내역 목록 */}
      <h2 className="text-xl font-bold mb-4">상담 내역</h2>
      <div className="space-y-4">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">트레이너</p>
                <p className="font-medium">{schedule.trainerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">날짜</p>
                <p className="font-medium">{schedule.desiredDate}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-sm text-gray-600">시작 시간</p>
                <p className="font-medium">{schedule.startTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">종료 시간</p>
                <p className="font-medium">{schedule.endTime}</p>
              </div>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <span
                className={`inline-block px-2 py-1 rounded-full text-sm ${
                  schedule.approvalStatus === "PENDING"
                    ? "bg-yellow-100 text-yellow-800"
                    : schedule.approvalStatus === "APPROVED"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {schedule.approvalStatus === "PENDING"
                  ? "대기중"
                  : schedule.approvalStatus === "APPROVED"
                  ? "승인됨"
                  : "거절됨"}
              </span>
              {schedule.approvalStatus === "APPROVED" && (
                <button
                  onClick={() => handleChatRoomEntry(schedule.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  채팅방 입장
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="mt-6 flex justify-center space-x-2">
        <button
          onClick={() => setPage((prev) => Math.max(0, prev - 1))}
          disabled={page === 0}
          className={`px-4 py-2 rounded-md ${
            page === 0
              ? "bg-gray-100 text-gray-400"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          이전
        </button>
        <span className="px-4 py-2">
          {page + 1} / {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={page >= totalPages - 1}
          className={`px-4 py-2 rounded-md ${
            page >= totalPages - 1
              ? "bg-gray-100 text-gray-400"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          다음
        </button>
      </div>
    </div>
  );
}
