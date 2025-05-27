"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import ChatRoom from "@/components/ChatRoom";
import DashboardTabs from "@/components/dashboard/DashboardTabs";

// Update Trainer interface to match TrainerUserDto
interface Trainer {
  name: string; // Changed from nickname to name
}

interface Schedule {
  id: number;
  userName: string;
  trainerName: string;
  desiredDate: string;
  startTime: string;
  endTime: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  rejectedReason?: string; // Add rejection reason
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

// Add ScheduleUpdate interface after other interfaces
interface ScheduleUpdate {
  trainerName: string;
  desiredDate: string;
  startTime: string;
  endTime: string;
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

  // Add new states for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // Add new state for chat modal
  const [chatRoomId, setChatRoomId] = useState<number | null>(null);

  useEffect(() => {
    fetchSchedules();
    fetchTrainers();
  }, []);

  // Update the trainers fetch function
  const fetchTrainers = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/trainers`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("트레이너 목록 조회에 실패했습니다.");
      }

      const result = await response.json();
      setTrainers(result); // API directly returns array of TrainerUserDto
    } catch (error) {
      console.error("트레이너 목록 조회 실패:", error);
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

  // Update the chat room entry handler
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
      console.log("Chat room response:", result);

      const chatRoom: ChatRoomResponseDto = result;

      if (!chatRoom.id) {
        throw new Error("Invalid chat room ID");
      }

      // Instead of navigation, set the chat room ID
      setChatRoomId(chatRoom.id);
    } catch (error) {
      console.error("Failed to enter chat room:", error);
      alert("채팅방 입장에 실패했습니다.");
    }
  };

  // Add handleUpdate function
  const handleUpdate = async (
    scheduleId: number,
    updateData: ScheduleUpdate
  ) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/schedules/${scheduleId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update schedule");
      }

      // Refresh schedules after successful update
      await fetchSchedules();
      setIsEditing(false);
      setEditingSchedule(null);
    } catch (error) {
      console.error("Failed to update schedule:", error);
      alert("상담 일정 수정에 실패했습니다.");
    }
  };

  // Add delete handler function after other handlers
  const handleDelete = async (scheduleId: number) => {
    if (!window.confirm("상담 예약을 취소하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/schedules/${scheduleId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete schedule");
      }

      // Refresh schedules after successful deletion
      await fetchSchedules();
    } catch (error) {
      console.error("Failed to delete schedule:", error);
      alert("상담 예약 취소에 실패했습니다.");
    }
  };

  return (
    <div className="p-6">
      {/* Navigation Tabs */}
      <DashboardTabs />

      {/* Page Title */}

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
              {trainers.map((trainer, index) => (
                <option key={index} value={index + 1}>
                  {trainer.name}
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
            {isEditing && editingSchedule?.id === schedule.id ? (
              // 수정 폼
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (editingSchedule) {
                    handleUpdate(editingSchedule.id, {
                      trainerName: editingSchedule.trainerName,
                      desiredDate: editingSchedule.desiredDate,
                      startTime: editingSchedule.startTime,
                      endTime: editingSchedule.endTime,
                    });
                  }
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      트레이너
                    </label>
                    <select
                      value={editingSchedule.trainerName}
                      onChange={(e) =>
                        setEditingSchedule({
                          ...editingSchedule,
                          trainerName: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      {trainers.map((trainer, index) => (
                        <option key={index} value={trainer.name}>
                          {trainer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      날짜
                    </label>
                    <input
                      type="date"
                      value={editingSchedule.desiredDate}
                      onChange={(e) =>
                        setEditingSchedule({
                          ...editingSchedule,
                          desiredDate: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      시작 시간
                    </label>
                    <input
                      type="time"
                      value={editingSchedule.startTime}
                      onChange={(e) =>
                        setEditingSchedule({
                          ...editingSchedule,
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
                      value={editingSchedule.endTime}
                      onChange={(e) =>
                        setEditingSchedule({
                          ...editingSchedule,
                          endTime: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditingSchedule(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    저장
                  </button>
                </div>
              </form>
            ) : (
              // 일반 보기 모드
              <>
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
                  <div className="flex flex-col">
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
                    {schedule.approvalStatus === "REJECTED" &&
                      schedule.rejectedReason && (
                        <span className="mt-2 text-sm text-red-600">
                          거절 사유: {schedule.rejectedReason}
                        </span>
                      )}
                  </div>
                  <div className="flex space-x-2">
                    {schedule.approvalStatus === "PENDING" && (
                      <>
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setEditingSchedule(schedule);
                          }}
                          className="text-blue-600 hover:text-blue-700 px-4 py-2 rounded border border-blue-600 hover:bg-blue-50"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="text-red-600 hover:text-red-700 px-4 py-2 rounded border border-red-600 hover:bg-red-50"
                        >
                          취소
                        </button>
                      </>
                    )}
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
              </>
            )}
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

      {/* Add ChatRoom modal */}
      {chatRoomId && (
        <ChatRoom roomId={chatRoomId} onClose={() => setChatRoomId(null)} />
      )}
    </div>
  );
}
