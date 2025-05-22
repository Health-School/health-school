"use client";

import { useState, useEffect } from "react";
import { Calendar, CalendarProps } from "react-calendar";
import { startOfWeek, addDays, format } from "date-fns";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import "react-calendar/dist/Calendar.css";
import ChatRoom from "@/components/ChatRoom";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

// 시간 슬롯 데이터 타입
interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

interface ScheduleEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  location?: string;
}

// 상담 일정 인터페이스 업데이트
interface Schedule {
  id: number;
  userId: number; // Changed to match DTO
  userName: string;
  trainerName: string;
  desiredDate: string;
  startTime: string;
  endTime: string;
  approvalStatus: string;
  rejectedReason: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ScheduleDetail은 Schedule을 상속하므로 자동으로 userId 필드를 포함하게 됩니다
interface ScheduleDetail extends Schedule {}

// Update ChatRoomRequest interface to match the API request format
interface ChatRoomRequest {
  receiverId: number;
  title: string;
  scheduleId: number;
}

// Update ChatRoomResponse interface to match backend DTO
interface ChatRoomResponse {
  id: number;
  title: string;
  senderName: string;
  receiverName: string;
  scheduleId: number | null; // Update to allow null since backend can return null
}

// Add new interface for checking existing chat room
interface ExistingChatRoom {
  id: number;
  scheduleId: number;
}

// Add new interface for schedule decision
interface ScheduleDecision {
  approved: boolean;
  rejectionReason?: string;
}

export default function ConsultationsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [showCalendar, setShowCalendar] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Value>(new Date());
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] =
    useState<ScheduleDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([]);
  const [chatRoomId, setChatRoomId] = useState<number | null>(null);

  // 시간 범위 (9시 ~ 17시)
  const timeSlots = Array.from({ length: 9 }, (_, i) => i + 9);

  // 선택된 주의 날짜들 생성
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(selectedWeek, { weekStartsOn: 0 }), i)
  );

  const tabs = [
    { name: "MY 강의 관리", href: "/trainer/dashboard/my-lectures" },
    { name: "정산 내역", href: "/trainer/dashboard/settlements" },
    { name: "수강생 관리", href: "/trainer/dashboard/students" },
    { name: "상담 일정", href: "/trainer/dashboard/consultations" },
    { name: "운동 기구 신청", href: "/trainer/dashboard/equipments" },
    { name: "MY 자격증 관리", href: "/trainer/dashboard/certificates" },
  ];

  // 달력에서 날짜 선택 시 처리하는 함수
  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
      setSelectedWeek(value);
      setShowCalendar(false); // 달력 숨기고 시간표 보여주기
    }
  };

  // 시간표에서 달력으로 돌아가는 함수
  const handleBackToCalendar = () => {
    setShowCalendar(true);
  };

  // 승인된 상담 일정 조회
  useEffect(() => {
    const fetchApprovedSchedules = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/schedules/approved`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("승인된 상담 일정 조회에 실패했습니다.");
        }

        const result: ApiResponse<Schedule[]> = await response.json();
        if (result.success) {
          setSchedules(result.data);
        }
      } catch (error) {
        console.error("상담 일정 조회 오류:", error);
      }
    };

    fetchApprovedSchedules();
  }, []);

  // 모든 상담 일정 조회
  useEffect(() => {
    const fetchAllSchedules = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/schedules/trainer`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("상담 신청 내역 조회에 실패했습니다.");
        }

        const result: ApiResponse<Schedule[]> = await response.json();
        if (result.success) {
          setAllSchedules(result.data);
        }
      } catch (error) {
        console.error("상담 신청 내역 조회 오류:", error);
      }
    };

    fetchAllSchedules();
  }, []);

  // 해당 시간 슬롯에 예약된 일정이 있는지 확인하는 함수
  const getScheduleForSlot = (date: Date, hour: number) => {
    return schedules.find((schedule) => {
      const scheduleDate = new Date(schedule.desiredDate);
      const startHour = parseInt(schedule.startTime.split(":")[0]);
      const endHour = parseInt(schedule.endTime.split(":")[0]);

      return (
        scheduleDate.getDate() === date.getDate() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getFullYear() === date.getFullYear() &&
        hour >= startHour &&
        hour < endHour
      );
    });
  };

  const handleScheduleClick = async (scheduleId: number) => {
    try {
      console.log("Fetching schedule details for ID:", scheduleId);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/schedules/${scheduleId}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("일정 상세 조회에 실패했습니다.");
      }

      const result: ApiResponse<ScheduleDetail> = await response.json();
      console.log("API Response:", {
        success: result.success,
        message: result.message,
        data: {
          id: result.data.id,
          userId: result.data.userId, // This should now be available
          userName: result.data.userName,
          desiredDate: result.data.desiredDate,
          startTime: result.data.startTime,
          endTime: result.data.endTime,
        },
      });

      if (result.success) {
        setSelectedSchedule(result.data);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("일정 상세 조회 오류:", error);
    }
  };

  // Update checkExistingChatRoom function to handle the response correctly
  const checkExistingChatRoom = async (
    scheduleId: number
  ): Promise<number | null> => {
    try {
      console.log("Checking existing chat room for scheduleId:", scheduleId);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chatrooms/schedule/${scheduleId}`,
        {
          credentials: "include",
        }
      );

      console.log("Check existing chat room response status:", response.status);

      // If response is not OK and not 404, throw error
      if (!response.ok && response.status !== 404) {
        throw new Error("채팅방 조회에 실패했습니다.");
      }

      // If 404, return null (no existing chat room)
      if (response.status === 404) {
        return null;
      }

      // Parse response
      const result = await response.json();
      console.log("Check existing chat room result:", result);

      // Return the chat room ID if it exists
      if (result && result.id) {
        return result.id;
      }

      return null;
    } catch (error) {
      console.error("채팅방 조회 중 오류 발생:", error);
      return null;
    }
  };

  // Update handleCreateChatRoom function with better error handling
  const handleCreateChatRoom = async (schedule: ScheduleDetail) => {
    try {
      // First check if chat room already exists
      const existingRoomId = await checkExistingChatRoom(schedule.id);
      console.log("Existing room ID check result:", existingRoomId);

      if (existingRoomId) {
        console.log(`Opening existing chat room: ${existingRoomId}`);
        setChatRoomId(existingRoomId);
        return;
      }

      if (!schedule.userId) {
        throw new Error("상담 신청자 정보를 찾을 수 없습니다.");
      }

      const chatRoomRequest: ChatRoomRequest = {
        receiverId: schedule.userId,
        title: `${schedule.userName}님과의 상담`,
        scheduleId: schedule.id,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chatrooms`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(chatRoomRequest),
        }
      );

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || "채팅방 생성에 실패했습니다.");
      }

      const result: ApiResponse<ChatRoomResponse> = await response.json();

      if (result.success && result.data.id) {
        setChatRoomId(result.data.id);
      } else {
        throw new Error("채팅방 정보를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("채팅방 생성 오류:", error);
      alert(
        error instanceof Error ? error.message : "채팅방 생성에 실패했습니다."
      );
    }
  };

  // Add this helper function to calculate row span
  const calculateRowSpan = (startTime: string, endTime: string): number => {
    const start = parseInt(startTime.split(":")[0]);
    const end = parseInt(endTime.split(":")[0]);
    return end - start;
  };

  // Update shouldDisplaySchedule function to only return true for the first hour of the schedule
  const shouldDisplaySchedule = (
    date: Date,
    hour: number,
    schedule: Schedule | undefined
  ): boolean => {
    if (!schedule) return false;
    const scheduleDate = new Date(schedule.desiredDate);
    const startHour = parseInt(schedule.startTime.split(":")[0]);

    return (
      scheduleDate.getDate() === date.getDate() &&
      scheduleDate.getMonth() === date.getMonth() &&
      scheduleDate.getFullYear() === date.getFullYear() &&
      startHour === hour
    );
  };

  const handleScheduleDecision = async (
    scheduleId: number,
    approved: boolean,
    rejectionReason?: string
  ) => {
    try {
      const decisionData: ScheduleDecision = {
        approved,
        rejectionReason: rejectionReason || "",
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/schedules/decision/${scheduleId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(decisionData),
        }
      );

      if (!response.ok) {
        throw new Error("상담 일정 상태 변경에 실패했습니다.");
      }

      const result: ApiResponse<Schedule> = await response.json();
      if (result.success) {
        // Close modal
        setIsModalOpen(false);

        // Refresh both schedule lists
        const fetchSchedules = async () => {
          await Promise.all([
            fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/schedules/approved`,
              {
                credentials: "include",
              }
            ),
            fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/schedules/trainer`,
              {
                credentials: "include",
              }
            ),
          ]).then(async ([approvedRes, allRes]) => {
            const [approvedData, allData] = await Promise.all([
              approvedRes.json(),
              allRes.json(),
            ]);

            if (approvedData.success) setSchedules(approvedData.data);
            if (allData.success) setAllSchedules(allData.data);
          });
        };

        fetchSchedules();

        alert(
          approved
            ? "상담 일정이 승인되었습니다."
            : "상담 일정이 거절되었습니다."
        );
      }
    } catch (error) {
      console.error("상담 일정 상태 변경 오류:", error);
      alert(
        error instanceof Error
          ? error.message
          : "상담 일정 상태 변경에 실패했습니다."
      );
    }
  };

  // Update the time slots rendering part
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 탭 메뉴 */}
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

      <div className="grid grid-cols-3 gap-8">
        {/* Calendar section - takes up 2/3 of the space */}
        <div className="col-span-2 bg-white p-6 rounded-lg shadow">
          {showCalendar ? (
            // Calendar View
            <>
              <h2 className="text-lg font-semibold mb-4">상담 일정 관리</h2>
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                locale="ko-KR"
                className="w-full border-none"
                formatShortWeekday={(locale, date) => {
                  const days = ["일", "월", "화", "수", "목", "금", "토"];
                  return days[date.getDay()];
                }}
                tileClassName={({ date }) => {
                  const day = date.getDay();
                  if (day === 0) return "sunday";
                  if (day === 6) return "saturday";
                  return "";
                }}
              />
            </>
          ) : (
            // Weekly Schedule View
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">주간 상담 시간표</h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleBackToCalendar}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    ← 달력으로 돌아가기
                  </button>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() =>
                        setSelectedWeek((prev) => addDays(prev, -7))
                      }
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      ←
                    </button>
                    <span className="text-sm">
                      {format(weekDays[0], "M월 d일")} -{" "}
                      {format(weekDays[6], "M월 d일")}
                    </span>
                    <button
                      onClick={() =>
                        setSelectedWeek((prev) => addDays(prev, 7))
                      }
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>

              {/* Weekly Schedule Grid */}
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Days of Week Header */}
                  <div className="grid grid-cols-8 border-b">
                    <div className="p-2"></div> {/* Time column */}
                    {weekDays.map((date, i) => (
                      <div
                        key={i}
                        className={`p-2 text-center font-semibold ${
                          i === 0
                            ? "text-red-500"
                            : i === 6
                            ? "text-blue-500"
                            : ""
                        }`}
                      >
                        <div>{format(date, "E")}</div>
                        <div>{format(date, "d")}</div>
                      </div>
                    ))}
                  </div>

                  {/* Time Slots */}
                  {timeSlots.map((hour) => (
                    <div key={hour} className="grid grid-cols-8 border-b">
                      <div className="p-2 text-sm text-gray-500 border-r">
                        {`${hour}:00`}
                      </div>
                      {weekDays.map((date, i) => {
                        const schedule = getScheduleForSlot(date, hour);
                        const shouldDisplay = shouldDisplaySchedule(
                          date,
                          hour,
                          schedule
                        );
                        const isOccupied = schedule && !shouldDisplay;

                        return (
                          <div
                            key={i}
                            className={`p-2 border-r relative ${
                              i === 0
                                ? "bg-red-50"
                                : i === 6
                                ? "bg-blue-50"
                                : ""
                            } ${isOccupied ? "bg-gray-100" : ""}`}
                            style={{
                              minHeight: "60px",
                            }}
                          >
                            {shouldDisplay && schedule && (
                              <div
                                className="absolute inset-1 bg-green-100 rounded p-1 cursor-pointer hover:bg-green-200 transition-colors"
                                onClick={() => handleScheduleClick(schedule.id)}
                                style={{
                                  height: `${
                                    60 *
                                      calculateRowSpan(
                                        schedule.startTime,
                                        schedule.endTime
                                      ) -
                                    10
                                  }px`,
                                  zIndex: 10,
                                }}
                              >
                                <div className="text-xs font-medium text-green-800">
                                  {schedule.userName}
                                </div>
                                <div className="text-xs text-green-600">
                                  {schedule.startTime} - {schedule.endTime}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* New consultation requests section - takes up 1/3 of the space */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">상담 신청 내역</h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {allSchedules
              .sort(
                (a, b) =>
                  new Date(b.desiredDate).getTime() -
                  new Date(a.desiredDate).getTime()
              )
              .map((schedule) => (
                <div
                  key={schedule.id}
                  className={`p-4 rounded-lg border ${
                    schedule.approvalStatus === "APPROVED"
                      ? "border-green-200 bg-green-50"
                      : schedule.approvalStatus === "REJECTED"
                      ? "border-red-200 bg-red-50"
                      : "border-yellow-200 bg-yellow-50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">{schedule.userName}</span>
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        schedule.approvalStatus === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : schedule.approvalStatus === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {schedule.approvalStatus === "APPROVED"
                        ? "승인됨"
                        : schedule.approvalStatus === "REJECTED"
                        ? "거절됨"
                        : "대기중"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>
                      날짜:{" "}
                      {new Date(schedule.desiredDate).toLocaleDateString()}
                    </p>
                    <p>
                      시간: {schedule.startTime} - {schedule.endTime}
                    </p>
                  </div>
                  {schedule.rejectedReason && (
                    <p className="text-sm text-red-600 mt-2">
                      거절 사유: {schedule.rejectedReason}
                    </p>
                  )}
                  <button
                    onClick={() => handleScheduleClick(schedule.id)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    상세보기
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">상담 일정 상세</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">상담 신청자</label>
                <p className="font-medium">{selectedSchedule.userName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">상담 일시</label>
                <p className="font-medium">
                  {new Date(selectedSchedule.desiredDate).toLocaleDateString()}{" "}
                  {selectedSchedule.startTime} - {selectedSchedule.endTime}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">승인 상태</label>
                <p className="font-medium">{selectedSchedule.approvalStatus}</p>
              </div>
              {selectedSchedule.rejectedReason && (
                <div>
                  <label className="text-sm text-gray-500">거절 사유</label>
                  <p className="font-medium">
                    {selectedSchedule.rejectedReason}
                  </p>
                </div>
              )}
            </div>
            {/* Modal section update */}
            <div className="mt-6">
              {selectedSchedule.approvalStatus !== "PENDING" && (
                <div className="mb-4 p-3 bg-yellow-50 rounded-md">
                  <p className="text-sm text-yellow-800">
                    현재 상태:{" "}
                    {selectedSchedule.approvalStatus === "APPROVED"
                      ? "승인됨"
                      : "거절됨"}
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    상태를 변경하시려면 아래 버튼을 클릭하세요.
                  </p>
                </div>
              )}

              <div className="flex gap-2 mb-4">
                {selectedSchedule.approvalStatus !== "APPROVED" && (
                  <button
                    onClick={() =>
                      handleScheduleDecision(selectedSchedule.id, true)
                    }
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    승인하기
                  </button>
                )}
                {selectedSchedule.approvalStatus !== "REJECTED" && (
                  <button
                    onClick={() => {
                      const reason = prompt("거절 사유를 입력해주세요:");
                      if (reason) {
                        handleScheduleDecision(
                          selectedSchedule.id,
                          false,
                          reason
                        );
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    거절하기
                  </button>
                )}
              </div>

              {selectedSchedule.approvalStatus === "APPROVED" && (
                <button
                  onClick={() => handleCreateChatRoom(selectedSchedule)}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-2"
                >
                  채팅하기
                </button>
              )}

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Room Modal */}
      {chatRoomId && (
        <ChatRoom roomId={chatRoomId} onClose={() => setChatRoomId(null)} />
      )}
    </div>
  );
}
