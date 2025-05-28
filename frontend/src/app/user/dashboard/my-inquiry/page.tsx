"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import ChatRoom from "@/components/ChatRoom";
import DashboardSidebar from "@/components/dashboard/UserDashboardSidebar";

// 기존 인터페이스들은 그대로 유지...
interface Trainer {
  name: string;
}

interface Schedule {
  id: number;
  userName: string;
  trainerName: string;
  desiredDate: string;
  startTime: string;
  endTime: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  rejectedReason?: string;
}

interface ScheduleCreate {
  trainerId: number;
  desiredDate: string;
  startTime: string;
  endTime: string;
}

interface PaginatedResponse {
  content: Schedule[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

interface ChatRoomResponseDto {
  id: number;
  title: string;
  senderName: string;
  receiverName: string;
  scheduleId: number;
}

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
  const [isEditing, setIsEditing] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [chatRoomId, setChatRoomId] = useState<number | null>(null);

  useEffect(() => {
    fetchSchedules();
    fetchTrainers();
  }, []);

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
      setTrainers(result);
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
      alert("상담 신청이 완료되었습니다.");
    } catch (error) {
      console.error("Failed to create schedule:", error);
      alert("상담 신청에 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [page]);

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

      setChatRoomId(chatRoom.id);
    } catch (error) {
      console.error("Failed to enter chat room:", error);
      alert("채팅방 입장에 실패했습니다.");
    }
  };

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

      await fetchSchedules();
      setIsEditing(false);
      setEditingSchedule(null);
      alert("상담 일정이 수정되었습니다.");
    } catch (error) {
      console.error("Failed to update schedule:", error);
      alert("상담 일정 수정에 실패했습니다.");
    }
  };

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

      await fetchSchedules();
      alert("상담 예약이 취소되었습니다.");
    } catch (error) {
      console.error("Failed to delete schedule:", error);
      alert("상담 예약 취소에 실패했습니다.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 사이드바 */}
      <DashboardSidebar />

      {/* 메인 컨텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            {/* 페이지 제목 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                1:1 상담
              </h1>
              <p className="text-gray-600">
                전문 트레이너와 1:1 상담을 신청하고 관리하세요.
              </p>
            </div>

            {/* 상담 신청 폼 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                새 상담 신청
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full lg:w-auto bg-green-500 text-white py-3 px-8 rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  상담 신청하기
                </button>
              </form>
            </div>

            {/* 상담 내역 목록 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                상담 내역
              </h2>

              {schedules.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💬</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    아직 상담 내역이 없습니다
                  </h3>
                  <p className="text-gray-500">
                    위 폼을 통해 첫 상담을 신청해보세요!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
                    >
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
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                required
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                required
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-3">
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditing(false);
                                setEditingSchedule(null);
                              }}
                              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              취소
                            </button>
                            <button
                              type="submit"
                              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                            >
                              저장
                            </button>
                          </div>
                        </form>
                      ) : (
                        // 일반 보기 모드
                        <>
                          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                트레이너
                              </p>
                              <p className="font-medium text-gray-900">
                                {schedule.trainerName}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">날짜</p>
                              <p className="font-medium text-gray-900">
                                {schedule.desiredDate}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                시작 시간
                              </p>
                              <p className="font-medium text-gray-900">
                                {schedule.startTime}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                종료 시간
                              </p>
                              <p className="font-medium text-gray-900">
                                {schedule.endTime}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div className="flex flex-col">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-medium w-fit ${
                                  schedule.approvalStatus === "PENDING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : schedule.approvalStatus === "APPROVED"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {schedule.approvalStatus === "PENDING"
                                  ? "승인 대기중"
                                  : schedule.approvalStatus === "APPROVED"
                                    ? "승인됨"
                                    : "거절됨"}
                              </span>
                              {schedule.approvalStatus === "REJECTED" &&
                                schedule.rejectedReason && (
                                  <span className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                                    거절 사유: {schedule.rejectedReason}
                                  </span>
                                )}
                            </div>
                            <div className="flex space-x-3">
                              {schedule.approvalStatus === "PENDING" && (
                                <>
                                  <button
                                    onClick={() => {
                                      setIsEditing(true);
                                      setEditingSchedule(schedule);
                                    }}
                                    className="text-green-600 hover:text-green-700 px-4 py-2 rounded-lg border border-green-600 hover:bg-green-50 transition-colors"
                                  >
                                    수정
                                  </button>
                                  <button
                                    onClick={() => handleDelete(schedule.id)}
                                    className="text-red-600 hover:text-red-700 px-4 py-2 rounded-lg border border-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    취소
                                  </button>
                                </>
                              )}
                              {schedule.approvalStatus === "APPROVED" && (
                                <button
                                  onClick={() =>
                                    handleChatRoomEntry(schedule.id)
                                  }
                                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                                >
                                  <span>💬</span>
                                  <span>채팅방 입장</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <button
                    onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                    disabled={page === 0}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      page === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
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
                  <span className="px-4 py-2 text-sm text-gray-700">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={page >= totalPages - 1}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      page >= totalPages - 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
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
            </div>
          </div>
        </div>
      </div>

      {/* 채팅방 모달 */}
      {chatRoomId && (
        <ChatRoom roomId={chatRoomId} onClose={() => setChatRoomId(null)} />
      )}
    </div>
  );
}
