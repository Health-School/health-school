"use client";

import { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { CompatClient, Stomp } from "@stomp/stompjs";

// Types
type GroupChatRoom = {
  id: number;
  name: string;
  createdBy: string;
};

type GroupChatEnterRequestDto = {
  writerName: string; // 현재 사용자 닉네임
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

interface GroupChatRoomProps {
  roomId: number;
  onClose: () => void;
}

export default function GroupChatRoom({ roomId, onClose }: GroupChatRoomProps) {
  // States
  const [chatRoom, setChatRoom] = useState<GroupChatRoom | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timelineMessages, setTimelineMessages] = useState<TimelineMessage[]>(
    []
  );
  const [newMessage, setNewMessage] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const stompClient = useRef<CompatClient | null>(null);

  // 타임스탬프를 포함한 메시지 내용 기반 중복 제거
  const [lastMessages, setLastMessages] = useState<Record<string, number>>({});

  // 컴포넌트 상단의 다른 state 변수들과 함께 추가
  const [processedMessageIds, setProcessedMessageIds] = useState<Set<number>>(
    new Set()
  );

  // Fetch current user information
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/me`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      setCurrentUser(data.data);
      return data.data;
    } catch (error) {
      console.error("사용자 정보 조회 실패:", error);
      setError("사용자 정보를 가져오는데 실패했습니다.");
      return null;
    }
  };

  // WebSocket connection
  const connectWebSocket = (roomData: GroupChatRoom, user: User) => {
    // 기존 연결이 있다면 먼저 해제
    if (stompClient.current && stompClient.current.connected) {
      try {
        stompClient.current.disconnect();
        console.log("기존 STOMP 연결 해제");
      } catch (e) {
        console.error("연결 해제 중 오류:", e);
      }
    }

    let isStompConnected = false;
    let connectionAttempts = 0;
    const maxConnectionAttempts = 3;

    const attemptConnection = () => {
      if (connectionAttempts >= maxConnectionAttempts) {
        setError(
          `연결 시도 ${maxConnectionAttempts}회 실패. 페이지를 새로고침 해주세요.`
        );
        return;
      }

      connectionAttempts++;
      console.log(
        `연결 시도 ${connectionAttempts}/${maxConnectionAttempts}...`
      );

      try {
        console.log("웹소켓 연결 시도");
        const wsUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/ws-stomp`;
        console.log("웹소켓 URL:", wsUrl);

        const socket = new SockJS(wsUrl);
        const client = Stomp.over(socket);

        socket.onopen = () => {
          console.log("SockJS 연결 성공");
        };

        socket.onclose = () => {
          console.log("SockJS 연결 종료");
          if (!isStompConnected && connectionAttempts < maxConnectionAttempts) {
            console.log("연결이 곧바로 닫힘, 재시도 중...");
            setTimeout(attemptConnection, 1000);
          }
        };

        socket.onerror = (error) => {
          console.error("SockJS 연결 오류:", error);
        };

        // 디버그 모드 비활성화
        client.debug = () => {};

        let chatSubscription: any = null;
        let systemSubscription: any = null;
        let leaveSubscription: any = null;

        console.log("STOMP 연결 시도...");
        const headers = {
          "Content-Type": "application/json",
        };

        client.connect(
          headers,
          () => {
            console.log("STOMP 연결 성공!");
            stompClient.current = client;
            isStompConnected = true;

            console.log(
              "연결 상태:",
              client.connected ? "연결됨" : "연결 안됨"
            );
            console.log("현재 사용자:", user);

            // 기존 구독 해제
            if (chatSubscription) {
              chatSubscription.unsubscribe();
            }
            if (systemSubscription) {
              systemSubscription.unsubscribe();
            }
            if (leaveSubscription) {
              leaveSubscription.unsubscribe();
            }

            // 채팅 메시지 구독
            console.log(
              "그룹 채팅 메시지 구독 시도:",
              `/subscribe/groupChat/room/${roomId}`
            );
            // 구독 로그 강화
            chatSubscription = client.subscribe(
              `/subscribe/groupChat/room/${roomId}`,
              (message) => {
                try {
                  console.log("----------------------------------------");
                  console.log("메시지 수신 시간:", new Date().toISOString());
                  console.log("메시지 원본 헤더:", message.headers);
                  console.log("메시지 원본 내용:", message.body);
                  const chatMessage = JSON.parse(message.body);
                  console.log("파싱된 메시지:", chatMessage);
                  console.log("메시지 타입:", chatMessage.userType);
                  console.log("----------------------------------------");

                  // 메시지 ID가 있고, 이미 처리한 메시지인 경우 무시
                  if (
                    chatMessage.id &&
                    processedMessageIds.has(chatMessage.id)
                  ) {
                    console.log(
                      `이미 처리한 메시지(ID: ${chatMessage.id}) 무시`
                    );
                    return;
                  }

                  // 메시지 ID가 있는 경우 처리 목록에 추가
                  if (chatMessage.id) {
                    setProcessedMessageIds((prev) => {
                      const newSet = new Set(prev);
                      newSet.add(chatMessage.id);
                      return newSet;
                    });
                  }

                  // 메시지 타입에 따라 처리
                  if (chatMessage.userType === "ENTER") {
                    console.log("입장 메시지 수신:", chatMessage);

                    // 중복 메시지 필터링을 일시적으로 비활성화하고 모든 입장 메시지 표시
                    setTimelineMessages((prev) => [
                      ...prev,
                      {
                        type: "system",
                        message: chatMessage.message,
                        timestamp: new Date(),
                      },
                    ]);

                    console.log("입장 메시지 추가됨:", chatMessage.message);
                  } else if (chatMessage.userType === "LEAVE") {
                    setTimelineMessages((prev) => [
                      ...prev,
                      {
                        type: "system",
                        message: chatMessage.message,
                        timestamp: new Date(),
                      },
                    ]);
                  } else {
                    setTimelineMessages((prev) => [
                      ...prev,
                      {
                        type: "chat",
                        message: chatMessage.message,
                        writerName: chatMessage.writerName,
                        timestamp: new Date(),
                      },
                    ]);
                  }
                } catch (err) {
                  console.error("그룹 채팅 메시지 파싱 오류:", err);
                }
              }
            );

            // 입장 메시지 전송
            setTimeout(() => {
              if (client.connected) {
                const enterData = {
                  writerName: user.nickname,
                  message: `${user.nickname}님이 채팅방에 입장하였습니다.`, // 메시지 추가 (서버에서 무시될 수 있지만 디버깅 용도)
                };

                console.log("전송할 그룹 채팅 입장 데이터:", enterData);

                try {
                  client.send(
                    `/publish/groupChat/room/enter/${roomId}`,
                    { "Content-Type": "application/json" },
                    JSON.stringify(enterData)
                  );
                  console.log("그룹 채팅 입장 메시지 전송 성공!");
                } catch (error) {
                  console.error("그룹 채팅 입장 메시지 전송 실패:", error);
                }
              }
            }, 1000);
          },
          (error: Error | string | WebSocketError | any) => {
            console.error("STOMP 연결 실패:", error);

            if (connectionAttempts < maxConnectionAttempts) {
              console.log(`연결 실패, ${2000}ms 후 재시도...`);
              setTimeout(attemptConnection, 2000);
            } else {
              setError("채팅 연결에 실패했습니다. 페이지를 새로고침 해주세요.");
            }
          }
        );
      } catch (e) {
        console.error("STOMP 초기화 실패:", e);
        if (connectionAttempts < maxConnectionAttempts) {
          setTimeout(attemptConnection, 2000);
        } else {
          setError(
            "채팅 연결 초기화에 실패했습니다. 페이지를 새로고침 해주세요."
          );
        }
      }
    };

    // 첫 번째 연결 시도 시작
    attemptConnection();
  };

  // Initialization
  useEffect(() => {
    const initializeGroupChat = async () => {
      try {
        setLoading(true);
        const user = await fetchCurrentUser();

        if (!user) {
          setError("사용자 정보를 가져오는데 실패했습니다.");
          return;
        }

        // API 호출 없이 기본 채팅방 정보 설정
        const defaultRoomData = {
          id: roomId,
          name: `채팅방 ${roomId}`,
          createdBy: "관리자",
        };

        setChatRoom(defaultRoomData);

        // WebSocket 직접 연결
        connectWebSocket(defaultRoomData, user);

        // 메시지 이력은 비워두기
        setTimelineMessages([]);
      } catch (error: any) {
        console.error("그룹 채팅 초기화 실패:", error);
        setError("그룹 채팅방 연결에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      initializeGroupChat();
    }

    return () => {
      if (stompClient.current) {
        stompClient.current.disconnect();
      }
    };
  }, [roomId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [timelineMessages]);

  // Leave group chat room
  const leaveGroupChat = () => {
    if (!stompClient.current || !chatRoom || !currentUser) return;

    const confirmLeave = window.confirm("정말로 그룹 채팅방을 나가시겠습니까?");

    if (confirmLeave) {
      try {
        console.log("그룹 채팅방 나가기 시도");

        const leaveData = {
          writerName: currentUser.nickname,
        };

        console.log("전송할 퇴장 데이터:", leaveData);

        if (!stompClient.current.connected) {
          throw new Error("웹소켓 연결이 끊어졌습니다.");
        }

        // 퇴장 메시지 전송
        stompClient.current.send(
          `/publish/groupChat/room/leave/${roomId}`, // /groupChat/room/leave/${roomId} → /publish/groupChat/room/leave/${roomId}
          { "Content-Type": "application/json" },
          JSON.stringify(leaveData)
        );

        console.log("퇴장 메시지 전송 완료");

        // 연결 종료 작업
        setTimeout(() => {
          if (stompClient.current) {
            stompClient.current.disconnect(() => {
              console.log("그룹 채팅방 나가기 완료");
              onClose();
            });
          } else {
            onClose();
          }
        }, 500);
      } catch (error) {
        console.error("그룹 채팅방 나가기 실패:", error);
        alert("그룹 채팅방 나가기에 실패했습니다. 다시 시도해주세요.");
        onClose();
      }
    }
  };

  // Send message
  const sendMessage = () => {
    if (!stompClient.current || !chatRoom || !currentUser || !newMessage.trim())
      return;

    const messageData = {
      writerName: currentUser.nickname,
      message: newMessage.trim(),
    };

    try {
      stompClient.current.send(
        `/publish/groupChat/message/${roomId}`, // /groupChat/message/${roomId} → /publish/groupChat/message/${roomId}
        { "Content-Type": "application/json" },
        JSON.stringify(messageData)
      );

      setNewMessage("");
    } catch (error) {
      console.error("메시지 전송 실패:", error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
          <p className="text-lg text-green-600 font-medium">
            그룹 채팅방 연결 중...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-red-500 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-xl text-red-500 font-semibold mb-4">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-[550px] h-[700px] rounded-lg flex flex-col shadow-xl">
        {/* Header */}
        {chatRoom && (
          <div className="px-4 py-3 flex items-center border-b bg-green-500 rounded-t-lg">
            <button
              onClick={onClose}
              className="mr-4 text-white hover:text-gray-200"
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
            <div className="flex-1">
              <h2 className="text-lg font-medium text-white">
                {chatRoom.name}
              </h2>
              <p className="text-xs text-green-100">
                개설자: {chatRoom.createdBy}
              </p>
            </div>
            <button
              onClick={leaveGroupChat}
              className="text-white hover:text-gray-200 px-3 py-1 rounded-lg hover:bg-green-600 transition-colors"
            >
              나가기
            </button>
          </div>
        )}

        {/* Body: Messages Timeline */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-3">
            {timelineMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.writerName === currentUser?.nickname
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {msg.type === "system" ? (
                  <div className="bg-gray-200/70 rounded-full px-4 py-2 text-sm text-gray-600 mx-auto">
                    {msg.message}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 max-w-[80%]">
                    {/* Name outside the bubble */}
                    <div
                      className={`text-xs font-medium mb-1 ${
                        msg.writerName === currentUser?.nickname
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {msg.writerName}
                    </div>
                    {/* Message bubble with tail */}
                    <div
                      className={`relative ${
                        msg.writerName === currentUser?.nickname
                          ? "self-end"
                          : "self-start"
                      }`}
                    >
                      <div
                        className={`rounded-2xl p-3 text-sm ${
                          msg.writerName === currentUser?.nickname
                            ? "bg-green-500 text-white rounded-tr-none"
                            : "bg-white border border-green-200 text-gray-800 rounded-tl-none"
                        }`}
                      >
                        <div>{msg.message}</div>
                      </div>
                      {/* Add pseudo-triangle for bubble tail */}
                      <div
                        className={`absolute top-0 w-2 h-2 ${
                          msg.writerName === currentUser?.nickname
                            ? "right-0 border-t-8 border-r-8 border-transparent border-t-green-500"
                            : "left-0 border-t-8 border-l-8 border-transparent border-t-white"
                        }`}
                      />
                    </div>
                    {/* Timestamp */}
                    <div
                      className={`text-xs text-gray-500 mt-1 ${
                        msg.writerName === currentUser?.nickname
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div ref={messageEndRef} />
        </div>

        {/* Footer: Message Input */}
        <div className="p-4 border-t bg-white rounded-b-lg">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="메시지 입력..."
              className="flex-1 rounded-full px-4 py-2 border focus:outline-none focus:border-green-500"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
