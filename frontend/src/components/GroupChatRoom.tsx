"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const [chatRoom, setChatRoom] = useState<GroupChatRoom | null>(null);
  const [timelineMessages, setTimelineMessages] = useState<TimelineMessage[]>(
    []
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const stompClient = useRef<CompatClient | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // 메시지 전송 여부를 추적하는 ref 추가
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
      setError("채팅방 정보를 가져오는데 실패했습니다.");
      return null;
    }
  };

  // WebSocket 연결 및 구독
  const connectWebSocket = (user: User) => {
    console.log("WebSocket 연결 시작...");
    const socket = new SockJS(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/ws-stomp`
    );

    socket.onopen = () => console.log("SockJS 소켓 열림");
    socket.onclose = () => console.log("SockJS 소켓 닫힘");
    socket.onerror = (error) => console.error("SockJS 오류:", error);

    const client = Stomp.over(socket);

    // 디버그 로그 활성화 (개발 중에만)
    client.debug = (msg) => {
      console.log("STOMP DEBUG:", msg);
    };

    console.log("STOMP 클라이언트 연결 시도...");

    client.connect(
      {}, // 헤더
      () => {
        console.log("STOMP 연결 성공!");
        stompClient.current = client;

        // 구독
        console.log(`채팅 메시지 구독: /subscribe/group/chat/room/${roomId}`);
        client.subscribe(`/subscribe/group/chat/room/${roomId}`, (message) => {
          console.log("채팅 메시지 수신:", message.body);
          try {
            const chatMessage = JSON.parse(message.body);
            setTimelineMessages((prev) => [
              ...prev,
              {
                type: "chat",
                message: chatMessage.message,
                writerName: chatMessage.writerName,
                timestamp: new Date(),
              },
            ]);
          } catch (err) {
            console.error("채팅 메시지 파싱 오류:", err);
          }
        });

        // 구독 참조 저장
        let enterSubscription: any = null;

        console.log(`입장 메시지 구독: /subscribe/group/enter/room/${roomId}`);
        enterSubscription = client.subscribe(
          `/subscribe/group/enter/room/${roomId}`,
          (message) => {
            console.log("입장 메시지 수신 원본:", message.body);
            try {
              const enterMessage = JSON.parse(message.body);
              console.log(
                "메시지 타임라인에 추가:",
                enterMessage,
                "현재 타임라인 길이:",
                timelineMessages.length
              );

              // 메시지 중복 확인 (타임스탬프나 ID로 확인 가능)
              setTimelineMessages((prev) => {
                // 이미 같은 메시지가 있는지 확인
                const isDuplicate = prev.some(
                  (msg) =>
                    msg.type === "system" &&
                    msg.message === enterMessage.message
                );

                if (isDuplicate) {
                  return prev; // 중복이면 상태 변경 없음
                }

                return [
                  ...prev,
                  {
                    type: "system",
                    message: enterMessage.message,
                    timestamp: new Date(),
                  },
                ];
              });
              console.log(
                "메시지 추가 후 타임라인 길이:",
                timelineMessages.length
              );
            } catch (err) {
              console.error("입장 메시지 파싱 오류:", err);
            }
          }
        );

        console.log(`퇴장 메시지 구독: /subscribe/group/leave/room/${roomId}`);
        client.subscribe(`/subscribe/group/leave/room/${roomId}`, (message) => {
          console.log("퇴장 메시지 수신:", message.body);
          try {
            const leaveMessage = JSON.parse(message.body);
            setTimelineMessages((prev) => [
              ...prev,
              {
                type: "system",
                message: leaveMessage.message,
                timestamp: new Date(),
              },
            ]);
          } catch (err) {
            console.error("퇴장 메시지 파싱 오류:", err);
          }
        });

        // 입장 메시지 전송 - 중요: 여기서 /publish 접두어 사용
        setTimeout(() => {
          if (client.connected) {
            console.log("입장 메시지 전송 시도...");

            const enterRequest = {
              writerName: user.nickname,
            };

            // 중요: /publish 접두어 사용 (WebSocketConfig와 일치)
            client.send(
              `/publish/chat/group/room/enter/${roomId}`, // 경로 확인
              { "Content-Type": "application/json" },
              JSON.stringify(enterRequest)
            );

            console.log("입장 메시지 전송 완료!");
          } else {
            console.error("클라이언트가 연결되지 않았습니다.");
          }
        }, 1000);
      }
      // (error) => {
      //   console.error("STOMP 연결 실패:", error);
      // }
    );
  };

  // 컴포넌트 초기화
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);

        // 1. 현재 사용자 정보 가져오기
        const user = await fetchCurrentUser();
        if (!user) {
          setError("사용자 정보를 가져오는데 실패했습니다.");
          setLoading(false);
          return;
        }
        console.log("현재 사용자:", user);
        setCurrentUser(user);

        // 2. 채팅방 정보 가져오기 (필요한 경우)
        const room = await fetchChatRoom();
        if (room) {
          setChatRoom(room);
        }

        // 3. WebSocket 연결
        console.log("WebSocket 연결 시도...");
        const socket = new SockJS(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/ws-stomp`
        );
        const client = Stomp.over(socket);

        // 디버그 활성화 (개발 중에만)
        client.debug = (msg) => {
          console.log("STOMP DEBUG:", msg);
        };

        // 구독 참조 저장
        let enterSubscription: any = null;

        client.connect(
          {},
          () => {
            console.log("STOMP 연결 성공!");
            stompClient.current = client;

            // 구독 설정
            client.subscribe(
              `/subscribe/group/chat/room/${roomId}`,
              (message) => {
                console.log("채팅 메시지 수신:", message.body);
                try {
                  const chatMessage = JSON.parse(message.body);
                  setTimelineMessages((prev) => [
                    ...prev,
                    {
                      type: "chat",
                      message: chatMessage.message,
                      writerName: chatMessage.writerName,
                      timestamp: new Date(),
                    },
                  ]);
                } catch (err) {
                  console.error("채팅 메시지 파싱 오류:", err);
                }
              }
            );

            // 기존 구독이 있으면 해제
            if (enterSubscription) {
              enterSubscription.unsubscribe();
            }

            // 새로운 구독 설정
            console.log(
              `입장 메시지 구독: /subscribe/group/enter/room/${roomId}`
            );
            enterSubscription = client.subscribe(
              `/subscribe/group/enter/room/${roomId}`,
              (message) => {
                console.log("입장 메시지 수신 원본:", message.body);
                try {
                  const enterMessage = JSON.parse(message.body);
                  console.log(
                    "메시지 타임라인에 추가:",
                    enterMessage,
                    "현재 타임라인 길이:",
                    timelineMessages.length
                  );

                  // 메시지 중복 확인 (타임스탬프나 ID로 확인 가능)
                  setTimelineMessages((prev) => {
                    // 이미 같은 메시지가 있는지 확인
                    const isDuplicate = prev.some(
                      (msg) =>
                        msg.type === "system" &&
                        msg.message === enterMessage.message
                    );

                    if (isDuplicate) {
                      return prev; // 중복이면 상태 변경 없음
                    }

                    return [
                      ...prev,
                      {
                        type: "system",
                        message: enterMessage.message,
                        timestamp: new Date(),
                      },
                    ];
                  });
                  console.log(
                    "메시지 추가 후 타임라인 길이:",
                    timelineMessages.length
                  );
                } catch (err) {
                  console.error("입장 메시지 파싱 오류:", err);
                }
              }
            );

            client.subscribe(
              `/subscribe/group/leave/room/${roomId}`,
              (message) => {
                console.log("퇴장 메시지 수신:", message.body);
                try {
                  const leaveMessage = JSON.parse(message.body);
                  setTimelineMessages((prev) => [
                    ...prev,
                    {
                      type: "system",
                      message: leaveMessage.message,
                      timestamp: new Date(),
                    },
                  ]);
                } catch (err) {
                  console.error("퇴장 메시지 파싱 오류:", err);
                }
              }
            );

            // 입장 메시지 전송 - 중복 방지 로직 추가
            setTimeout(() => {
              if (!hasEnterMessageSent.current && client.connected) {
                console.log("입장 메시지 전송 시도...");

                const enterRequest = {
                  writerName: user.nickname,
                };

                client.send(
                  `/publish/chat/group/room/enter/${roomId}`,
                  { "Content-Type": "application/json" },
                  JSON.stringify(enterRequest)
                );

                console.log("입장 메시지 전송 완료!");
                hasEnterMessageSent.current = true; // 플래그 설정
              }
            }, 1000);

            setLoading(false);
          }
          // (error) => {
          //   console.error("STOMP 연결 실패:", error);
          //   setError("채팅 연결에 실패했습니다.");
          //   setLoading(false);
          // }
        );
      } catch (err) {
        console.error("채팅 초기화 오류:", err);
        setError("채팅방 초기화에 실패했습니다.");
        setLoading(false);
      }
    };

    // 컴포넌트 마운트 시 초기화
    hasEnterMessageSent.current = false;
    initializeChat();

    // 컴포넌트 언마운트 시 연결 종료
    return () => {
      if (stompClient.current && stompClient.current.connected) {
        stompClient.current.disconnect();
      }
    };
  }, [roomId]);

  // 메시지가 추가될 때마다 스크롤 아래로 이동
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [timelineMessages]);

  // 메시지 전송 처리
  const handleSendMessage = () => {
    if (!message.trim() || !stompClient.current || !currentUser) return;

    try {
      const messageData = {
        writerName: currentUser.nickname,
        message: message.trim(),
      };

      stompClient.current.send(
        `/chat/group/message/${roomId}`,
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
    if (!stompClient.current || !currentUser) return;

    try {
      const leaveData = {
        writerName: currentUser.nickname,
      };

      stompClient.current.send(
        `/chat/group/room/leave/${roomId}`,
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

  // 중복 메시지 추가 방지 함수
  const addMessageToTimeline = (newMessage: TimelineMessage) => {
    setTimelineMessages((prev) => {
      // 이미 같은 메시지가 있는지 확인 (메시지 내용과 타입으로 비교)
      const isDuplicate = prev.some(
        (msg) =>
          msg.type === newMessage.type &&
          msg.message === newMessage.message &&
          // 최근 5초 이내에 추가된 메시지인지 확인 (선택적)
          new Date().getTime() - msg.timestamp.getTime() < 5000
      );

      if (isDuplicate) {
        console.log("중복 메시지 무시:", newMessage);
        return prev; // 중복이면 상태 변경 없음
      }

      return [...prev, newMessage];
    });
  };

  // 로드 중 스켈레톤 화면
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
            <p className="text-lg">채팅방 연결 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 오류 메시지 화면
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
      <div className="bg-white w-[500px] h-[600px] rounded-lg flex flex-col shadow-xl">
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
          <button
            onClick={leaveChat}
            className="text-black hover:text-gray-700"
          >
            나가기
          </button>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-3">
            {timelineMessages.map((msg, index) => (
              <div
                key={index}
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
            ))}
            <div ref={messageEndRef} />
          </div>
        </div>

        {/* 메시지 입력 영역 */}
        <div className="p-4 border-t bg-white rounded-b-lg">
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
              disabled={!message.trim()}
              className="px-4 py-2 bg-green-400 text-white rounded-full hover:bg-green-500 disabled:opacity-50"
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
