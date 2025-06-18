"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import SockJS from "sockjs-client";
import { CompatClient, Stomp } from "@stomp/stompjs";

// Types
type GroupChatRoom = {
  id: number;
  name: string;
  trainerId: number;
  trainerName: string;
  lectureId: number;
};

type GroupChatEnterRequestDto = {
  writerName: string;
};

type GroupChatEnterResponseMessageDto = {
  roomId: number;
  writerName: string;
  message: string;
  userType: "ENTER" | "LEAVE" | "TALK";
};

type GroupChatMessageResponseDto = {
  id: number;
  message: string;
  writerName: string;
  userType: "ENTER" | "LEAVE" | "TALK";
  createdDate: string;
};

type WebSocketError = {
  message?: string;
  type?: string;
  code?: number;
};

type User = {
  id: number;
  nickname: string;
};

type TimelineMessage = {
  id?: number;
  type: "system" | "chat";
  message: string;
  writerName?: string;
  timestamp: Date;
};

type ChatParticipant = string; // 단순 문자열 타입으로 변경

type GroupChatUserListBroadcastDto = {
  roomId: number;
  participants: ChatParticipant[];
};

interface GroupChatRoomProps {
  roomId: number;
  onClose: () => void;
}

export default function GroupChatRoom({ roomId, onClose }: GroupChatRoomProps) {
  const [chatRoom, setChatRoom] = useState<GroupChatRoom | null>(null);
  const [timelineMessages, setTimelineMessages] = useState<TimelineMessage[]>(
    []
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [showParticipants, setShowParticipants] = useState(false); // 상태 추가

  const stompClient = useRef<CompatClient | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const hasEnterMessageSent = useRef(false);

  // 현재 사용자 정보 가져오기
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/me`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("사용자 정보를 가져오는데 실패했습니다.");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("사용자 정보 조회 실패:", error);
      setError("사용자 정보를 가져오는데 실패했습니다.");
      return null;
    }
  };

  // 채팅방 정보 가져오기
  const fetchChatRoom = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/group-chat-rooms/${roomId}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("채팅방 정보를 가져오는데 실패했습니다.");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("채팅방 정보 조회 실패:", error);
      return null;
    }
  };

  // 이전 메시지 로드
  const loadChatMessages = async () => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/group-chat/${roomId}/messages`;
      console.log("메시지 로드 API 호출:", apiUrl);

      const response = await fetch(apiUrl, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`메시지 로드 실패: ${response.status}`);
      }

      const messages: GroupChatMessageResponseDto[] = await response.json();
      console.log("메시지 로드 완료:", messages.length);

      if (messages.length === 0) {
        return;
      }

      // 메시지를 타임라인 형식으로 변환
      const timelineMessages: TimelineMessage[] = messages.map((msg) => ({
        id: msg.id,
        type:
          msg.userType === "ENTER" || msg.userType === "LEAVE"
            ? "system"
            : "chat",
        message: msg.message,
        writerName: msg.userType === "TALK" ? msg.writerName : undefined,
        timestamp: new Date(msg.createdDate),
      }));

      // 타임라인에 메시지 설정
      setTimelineMessages(timelineMessages);

      // 스크롤을 아래로 이동
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "auto" });
      }, 100);
    } catch (error) {
      console.error("메시지 로드 오류:", error);
    }
  };

  // 참가자 목록을 가져오는 함수
  const fetchParticipants = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/group-chat/${roomId}/users`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        console.error("참가자 목록 가져오기 실패:", response.status);
        return;
      }

      const data = await response.json();
      console.log("참가자 목록 원본 응답:", data);

      // 단순 문자열 배열 형태로 온다고 가정
      if (Array.isArray(data)) {
        setParticipants(data); // 그대로 저장
      } else if (data.data && Array.isArray(data.data)) {
        setParticipants(data.data);
      }

      console.log("처리된 참가자 목록:", participants);
    } catch (error) {
      console.error("참가자 목록 가져오기 오류:", error);
    }
  };

  // 중복 메시지 방지하면서 타임라인에 메시지 추가
  const addMessageToTimeline = useCallback((newMessage: TimelineMessage) => {
    setTimelineMessages((prev) => {
      // 이미 같은 ID를 가진 메시지가 있는지 확인
      if (newMessage.id && prev.some((msg) => msg.id === newMessage.id)) {
        return prev; // 중복 메시지는 추가하지 않음
      }

      // 동일한 메시지 내용과 작성자를 가진 최근 메시지가 있는지 확인
      const isDuplicate = prev.some(
        (msg) =>
          msg.type === newMessage.type &&
          msg.message === newMessage.message &&
          msg.writerName === newMessage.writerName &&
          // 최근 5초 이내 메시지인지 확인
          new Date().getTime() - msg.timestamp.getTime() < 5000
      );

      if (isDuplicate) {
        return prev;
      }

      return [...prev, newMessage];
    });
  }, []);

  // WebSocket 연결 및 구독
  const connectWebSocket = useCallback(
    (user: User) => {
      console.log("WebSocket 연결 시작...");
      const socket = new SockJS(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/ws-stomp`
      );

      socket.onopen = () => console.log("SockJS 소켓 열림");
      socket.onclose = () => console.log("SockJS 소켓 닫힘");
      socket.onerror = (error) => console.error("SockJS 오류:", error);

      const client = Stomp.over(socket);

      // 디버그 모드 비활성화
      client.debug = () => {};

      client.connect(
        {},
        () => {
          console.log("STOMP 연결 성공!");
          stompClient.current = client;

          // 채팅 메시지 구독
          client.subscribe(
            `/subscribe/group/chat/room/${roomId}`,
            (message) => {
              try {
                const chatMessage = JSON.parse(message.body);
                addMessageToTimeline({
                  id: chatMessage.id,
                  type: "chat",
                  message: chatMessage.message,
                  writerName: chatMessage.writerName,
                  timestamp: new Date(),
                });

                // 새 메시지가 오면 스크롤 아래로 이동
                setTimeout(() => {
                  messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              } catch (err) {
                console.error("채팅 메시지 파싱 오류:", err);
              }
            }
          );

          // 입장 메시지 구독
          client.subscribe(
            `/subscribe/group/enter/room/${roomId}`,
            (message) => {
              try {
                const enterMessage = JSON.parse(message.body);
                addMessageToTimeline({
                  id: enterMessage.id,
                  type: "system",
                  message: enterMessage.message,
                  timestamp: new Date(),
                });

                // 새 메시지가 오면 스크롤 아래로 이동
                setTimeout(() => {
                  messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              } catch (err) {
                console.error("입장 메시지 파싱 오류:", err);
              }
            }
          );

          // 퇴장 메시지 구독
          client.subscribe(
            `/subscribe/group/leave/room/${roomId}`,
            (message) => {
              try {
                const leaveMessage = JSON.parse(message.body);
                addMessageToTimeline({
                  id: leaveMessage.id,
                  type: "system",
                  message: leaveMessage.message,
                  timestamp: new Date(),
                });

                // 새 메시지가 오면 스크롤 아래로 이동
                setTimeout(() => {
                  messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              } catch (err) {
                console.error("퇴장 메시지 파싱 오류:", err);
              }
            }
          );

          // 참가자 목록 구독
          client.subscribe(
            `/subscribe/group/users/room/${roomId}`,
            (message) => {
              try {
                const data = JSON.parse(message.body);
                console.log("참가자 목록 수신:", data);

                // 응답 형식에 따라 처리
                if (Array.isArray(data)) {
                  setParticipants(data);
                } else if (
                  data.participants &&
                  Array.isArray(data.participants)
                ) {
                  // 명시적인 타입 정의
                  const nicknames = data.participants.map((p: any) =>
                    typeof p === "string" ? p : p.nickname
                  );
                  setParticipants(nicknames);
                } else if (data.roomId === roomId) {
                  // 이전 형식 - GroupChatUserListBroadcastDto
                  if (Array.isArray(data.participants)) {
                    // 명시적인 타입 정의
                    const nicknames = data.participants.map((p: any) =>
                      typeof p === "string" ? p : p.nickname
                    );
                    setParticipants(nicknames);
                  }
                }
              } catch (err) {
                console.error("참여자 목록 파싱 오류:", err);
              }
            }
          );

          // 입장 메시지 전송 (한 번만 전송하도록)
          setTimeout(() => {
            if (!hasEnterMessageSent.current && client.connected) {
              console.log("입장 메시지 전송 시도...");

              const enterRequest: GroupChatEnterRequestDto = {
                writerName: user.nickname,
              };

              client.send(
                `/publish/chat/group/room/enter/${roomId}`,
                { "Content-Type": "application/json" },
                JSON.stringify(enterRequest)
              );

              hasEnterMessageSent.current = true;
              console.log("입장 메시지 전송 완료!");
            }

            setLoading(false);
          }, 1000);

          // 연결 성공 후 참가자 목록 즉시 갱신
          setTimeout(() => {
            fetchParticipants().catch((err) => {
              console.error("WebSocket 연결 후 참가자 목록 갱신 실패:", err);
            });
          }, 1000);
        },
        (error: WebSocketError) => {
          console.error("STOMP 연결 실패:", error);
          setError("채팅 연결에 실패했습니다.");
          setLoading(false);
        }
      );

      return client;
    },
    [roomId, addMessageToTimeline]
  );

  // 메시지 전송 처리
  const handleSendMessage = () => {
    if (!message.trim() || !stompClient.current || !currentUser) return;

    try {
      const messageData = {
        writerName: currentUser.nickname,
        message: message.trim(),
      };

      stompClient.current.send(
        `/publish/chat/group/message/${roomId}`,
        { "Content-Type": "application/json" },
        JSON.stringify(messageData)
      );

      setMessage("");
    } catch (error) {
      console.error("메시지 전송 실패:", error);
    }
  };

  // 채팅방 나가기
  const leaveChat = () => {
    if (!stompClient.current || !currentUser) {
      onClose();
      return;
    }

    try {
      const leaveData = {
        writerName: currentUser.nickname,
      };

      stompClient.current.send(
        `/publish/chat/group/room/leave/${roomId}`,
        { "Content-Type": "application/json" },
        JSON.stringify(leaveData)
      );

      setTimeout(() => {
        if (stompClient.current) {
          stompClient.current.disconnect();
        }
        onClose();
      }, 500);
    } catch (error) {
      console.error("채팅방 나가기 실패:", error);
      onClose();
    }
  };

  // 참여자 목록 토글 함수
  const toggleParticipantsList = () => {
    // 토글 시 항상 최신 데이터 로드
    if (!showParticipants) {
      fetchParticipants().catch((err) => {
        console.error("참가자 목록 로드 실패:", err);
      });
    }
    setShowParticipants((prev) => !prev);
  };

  // 컴포넌트 초기화
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        hasEnterMessageSent.current = false;

        // 1. 현재 사용자 정보 가져오기
        const user = await fetchCurrentUser();
        if (!user) {
          setError("사용자 정보를 가져오는데 실패했습니다.");
          setLoading(false);
          return;
        }
        setCurrentUser(user);

        // 2. 채팅방 정보 가져오기
        const room = await fetchChatRoom();
        if (room) {
          setChatRoom(room);
        }

        // 3. 이전 메시지 로드
        await loadChatMessages();

        // 4. 참가자 목록 가져오기
        await fetchParticipants();

        // 5. WebSocket 연결
        connectWebSocket(user);
      } catch (err) {
        console.error("채팅 초기화 오류:", err);
        setError("채팅방 초기화에 실패했습니다.");
        setLoading(false);
      }
    };

    initializeChat();

    // 컴포넌트 언마운트 시 연결 종료
    return () => {
      if (stompClient.current && stompClient.current.connected) {
        try {
          stompClient.current.disconnect();
        } catch (error) {
          console.error("연결 종료 중 오류:", error);
        }
      }
    };
  }, [roomId, connectWebSocket]);

  // 메시지가 추가될 때마다 스크롤 아래로 이동
  useEffect(() => {
    if (timelineMessages.length > 0) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [timelineMessages]);

  // 참가자 목록을 주기적으로 갱신하는 함수
  useEffect(() => {
    // 컴포넌트 마운트 시 즉시 참가자 목록 로드
    fetchParticipants().catch((err) => {
      console.error("참가자 목록 초기 로드 실패:", err);
    });

    // 창이 포커스를 얻을 때마다 참가자 목록 갱신
    const handleFocus = () => {
      console.log("창이 포커스를 얻음 - 참가자 목록 갱신");
      fetchParticipants().catch((err) => {
        console.error("참가자 목록 포커스 갱신 실패:", err);
      });
    };

    // 정기적인 갱신 (10초마다)
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        console.log("정기 갱신 - 참가자 목록");
        fetchParticipants().catch((err) => {
          console.error("참가자 목록 정기 갱신 실패:", err);
        });
      }
    }, 10000);

    // 이벤트 리스너 등록
    window.addEventListener("focus", handleFocus);
    window.addEventListener("visibilitychange", handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("visibilitychange", handleFocus);
    };
  }, [roomId]); // roomId가 변경될 때마다 새로 설정

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
          <h3 className="text-xl font-medium text-red-600 mb-2">오류 발생</h3>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[700px] h-[600px] rounded-lg flex flex-col shadow-xl">
        {/* 헤더 */}
        <div className="px-4 py-3 flex items-center border-b bg-green-400 rounded-t-lg">
          <button
            onClick={onClose}
            className="mr-4 text-black hover:text-gray-700"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h2 className="text-lg font-medium flex-1 text-black">
            {chatRoom?.name || `그룹 채팅방 (${roomId})`}
          </h2>

          {/* 참여자 목록 토글 버튼 */}
          <div className="relative mr-4">
            <button
              onClick={toggleParticipantsList}
              className="flex items-center space-x-1 bg-white px-3 py-1.5 rounded-full text-sm text-green-700 hover:bg-gray-100 transition-colors"
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span>참여자 ({participants.length})</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  showParticipants ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* 드롭다운 참여자 목록 */}
            {showParticipants && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg z-10 border border-gray-200 overflow-hidden">
                <div className="py-2 px-3 bg-gray-50 border-b flex justify-between items-center">
                  <span className="font-medium text-sm text-gray-700">
                    참여자 목록
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchParticipants();

                      // 새로고침 아이콘 애니메이션
                      const refreshIcon = document.getElementById(
                        "dropdown-refresh-icon"
                      );
                      if (refreshIcon) {
                        refreshIcon.classList.add("animate-spin");
                        setTimeout(
                          () => refreshIcon.classList.remove("animate-spin"),
                          1000
                        );
                      }
                    }}
                    className="text-xs text-gray-600 hover:text-green-600"
                  >
                    <svg
                      id="dropdown-refresh-icon"
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto">
                  {participants.length > 0 ? (
                    <ul className="py-1">
                      {participants.map((nickname, index) => (
                        <li
                          key={`participant-${index}`}
                          className={`px-3 py-2 hover:bg-gray-50 ${
                            nickname === currentUser?.nickname
                              ? "bg-green-50"
                              : ""
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-sm">
                              {nickname}
                              {nickname === currentUser?.nickname && (
                                <span className="ml-1 text-xs text-green-600">
                                  (나)
                                </span>
                              )}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="py-6 px-4 text-center">
                      <svg
                        className="w-8 h-8 mx-auto mb-2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <p className="text-sm text-gray-500">
                        참여자 정보를 불러오는 중...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={leaveChat}
            className="text-black hover:text-gray-700"
          >
            나가기
          </button>
        </div>

        {/* 채팅 영역 (이제 전체 화면을 차지) */}
        <div className="flex-1 flex flex-col">
          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {loading && timelineMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-3"></div>
                <p className="text-gray-500">메시지를 불러오는 중...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {timelineMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg
                      className="w-12 h-12 mx-auto mb-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    <p>아직 메시지가 없습니다.</p>
                    <p className="text-sm mt-1">첫 메시지를 보내보세요!</p>
                  </div>
                ) : (
                  timelineMessages.map((msg, index) => (
                    <div
                      key={msg.id || `msg-${index}`}
                      className={
                        msg.type === "system"
                          ? "flex justify-center"
                          : msg.writerName === currentUser?.nickname
                            ? "flex justify-end"
                            : "flex justify-start"
                      }
                    >
                      {msg.type === "system" ? (
                        <div className="bg-gray-200 rounded-full px-4 py-2 text-sm text-gray-600">
                          {msg.message}
                        </div>
                      ) : (
                        <div
                          className={`max-w-[70%] ${
                            msg.writerName === currentUser?.nickname
                              ? "bg-green-400 text-white"
                              : "bg-white border border-gray-200 text-gray-800"
                          } rounded-lg p-3 shadow-sm`}
                        >
                          {msg.writerName !== currentUser?.nickname && (
                            <div className="font-medium text-xs mb-1">
                              {msg.writerName}
                            </div>
                          )}
                          <div>{msg.message}</div>
                          <div className="text-xs mt-1 text-right opacity-70">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messageEndRef} />
              </div>
            )}
          </div>

          {/* 메시지 입력 영역 */}
          <div className="p-4 border-t bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="메시지 입력..."
                className="flex-1 rounded-full px-4 py-2 border focus:outline-none focus:border-green-400"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || loading}
                className="px-4 py-2 bg-green-400 text-white rounded-full hover:bg-green-500 disabled:opacity-50"
              >
                전송
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
