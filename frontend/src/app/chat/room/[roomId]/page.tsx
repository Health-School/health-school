"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import SockJS from "sockjs-client";
import { CompatClient, Stomp } from "@stomp/stompjs";

type ChatRoom = {
  id: number;
  title: string;
  senderName: string;
  receiverName: string;
};

type ChatEnterMessage = {
  roomId: number;
  writerName: string;
  message: string;
  receiverName: string;
};

type ChatLeaveMessage = {
  roomId: number;
  writerName: string;
  message: string;
  receiverName: string;
};

type WebSocketError = {
  message?: string;
  type?: string;
  code?: number;
};

type User = {
  id: number;
  username: string;
  nickname: string;
};

type TimelineMessage = {
  type: "system" | "chat";
  message: string;
  writerName?: string;
  timestamp: Date;
};

type ChatMessage = {
  id?: number;
  writerName: string;
  message: string;
  timestamp: Date;
};

type UserType = "ENTER" | "LEAVE" | "TALK";

type ChatResponseDto = {
  id: number;
  writerName: string;
  message: string;
  userType: UserType;
  createdDate: string;
};

export default function ChatRoomPage({
  params,
}: {
  params: { roomId: string };
}) {
  const roomId = Number(params.roomId);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timelineMessages, setTimelineMessages] = useState<TimelineMessage[]>(
    []
  );
  const [newMessage, setNewMessage] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const stompClient = useRef<CompatClient | null>(null);

  const fetchCurrentUser = async () => {
    try {
      // 쿠키 기반 인증
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

  const connectWebSocket = (roomData: ChatRoom, user: User) => {
    try {
      console.log("웹소켓 연결 시도");
      const wsUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/ws-stomp`;
      console.log("웹소켓 URL:", wsUrl);

      const sock = new SockJS(wsUrl);
      const client = Stomp.over(sock);

      sock.onopen = () => {
        console.log("SockJS 연결 성공");
      };

      sock.onclose = () => {
        console.log("SockJS 연결 종료");
      };

      client.debug = (str) => {
        console.log("STOMP Debug:", str);
      };

      stompClient.current = client;

      const headers = {
        "Content-Type": "application/json",
      };

      client.connect(
        headers,
        () => {
          console.log("STOMP 연결 성공");
          console.log("현재 사용자:", user);

          const subscriptionPath = `/subscribe/enter/room/${roomId}`;
          console.log("구독 시도:", subscriptionPath);

          const subscription = client.subscribe(subscriptionPath, (message) => {
            console.log("수신된 메시지:", message);
            try {
              const enterMsg: ChatEnterMessage = JSON.parse(message.body);
              console.log("파싱된 입장 메시지:", enterMsg);
              setTimelineMessages((prev) => [
                ...prev,
                {
                  type: "system",
                  message: enterMsg.message,
                  timestamp: new Date(),
                },
              ]);
            } catch (err) {
              console.error("메시지 파싱 오류:", err);
            }
          });

          console.log("구독 완료:", subscription);

          client.subscribe(`/subscribe/leave/room/${roomId}`, (message) => {
            try {
              console.log("퇴장 메시지 원본:", message.body);
              setTimelineMessages((prev) => [
                ...prev,
                {
                  type: "system",
                  message: message.body,
                  timestamp: new Date(),
                },
              ]);
            } catch (err) {
              console.error("퇴장 메시지 처리 오류:", err);
            }
          });

          client.subscribe(`/subscribe/chat/room/${roomId}`, (message) => {
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

          const enterData = {
            writerName: user.nickname,
            receiverName: roomData.receiverName,
          };

          console.log("전송할 입장 데이터:", enterData);

          client.send(
            `/publish/chat/room/enter/${roomId}`,
            headers,
            JSON.stringify(enterData)
          );

          console.log("입장 메시지 전송 완료");
        },
        (error: WebSocketError) => {
          console.error("STOMP 연결 실패:", error);
          setError(`웹소켓 연결 실패: ${error?.message || "알 수 없는 오류"}`);
        }
      );
    } catch (error: any) {
      console.error("웹소켓 초기화 실패:", error);
      setError(`웹소켓 초기화 실패: ${error.message}`);
    }
  };

  const sendMessage = () => {
    if (!stompClient.current || !chatRoom || !currentUser || !newMessage.trim())
      return;

    const messageData = {
      writerName: currentUser.nickname,
      receiverName: chatRoom.receiverName,
      message: newMessage.trim(),
    };

    try {
      stompClient.current.send(
        `/publish/chat/message/${roomId}`,
        { "Content-Type": "application/json" },
        JSON.stringify(messageData)
      );
      setNewMessage("");
    } catch (error) {
      console.error("메시지 전송 실패:", error);
    }
  };

  const leaveChat = () => {
    if (!stompClient.current || !chatRoom || !currentUser) return;

    // 확인 다이얼로그 표시
    const confirmLeave = window.confirm("정말로 채팅방을 나가시겠습니까?");

    if (confirmLeave) {
      const leaveData = {
        writerName: currentUser.nickname,
        receiverName: chatRoom.receiverName,
      };

      try {
        stompClient.current.send(
          `/publish/chat/room/leave/${roomId}`,
          { "Content-Type": "application/json" },
          JSON.stringify(leaveData)
        );

        // 웹소켓 연결 해제
        stompClient.current.disconnect(() => {
          console.log("채팅방 나가기 완료");
          // 채팅방 목록 페이지로 이동
          window.location.href = "/";
        });
      } catch (error) {
        console.error("채팅방 나가기 실패:", error);
        alert("채팅방 나가기에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  useEffect(() => {
    const initializeChat = async () => {
      const user = await fetchCurrentUser();
      if (user) {
        try {
          setLoading(true);
          console.log("채팅방 조회 시작:", roomId);

          // 채팅방 정보 조회
          const roomResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chatrooms/${roomId}`
          );
          console.log("채팅방 데이터:", roomResponse.data);

          // 채팅 히스토리 조회
          const historyResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat/room/${roomId}/messages`
          );
          const chatHistory = historyResponse.data;
          console.log("채팅 히스토리:", chatHistory);

          // 현재 사용자의 마지막 상태 확인
          const userMessages = chatHistory.filter(
            (msg: ChatResponseDto) => msg.writerName === user.nickname
          );
          const lastUserMessage = userMessages[userMessages.length - 1];

          setChatRoom(roomResponse.data);

          if (!lastUserMessage || lastUserMessage.userType !== "LEAVE") {
            // 처음 입장하거나 LEAVE가 아닌 경우 전체 히스토리 표시
            const timelineMessages = chatHistory.map(
              (msg: ChatResponseDto) => ({
                type: msg.userType === "TALK" ? "chat" : "system",
                message: msg.message,
                writerName:
                  msg.userType === "TALK" ? msg.writerName : undefined,
                timestamp: new Date(msg.createdDate),
              })
            );
            setTimelineMessages(timelineMessages);
          } else {
            // LEAVE 상태에서 재입장하는 경우 빈 타임라인으로 시작
            setTimelineMessages([]);
          }

          // 웹소켓 연결 및 입장 메시지 전송
          connectWebSocket(roomResponse.data, user);
          setError(null);
        } catch (error: any) {
          console.error("초기화 실패:", error.response || error);
          if (error.response?.status === 404) {
            setError("채팅방을 찾을 수 없습니다.");
          } else {
            setError(`초기화 중 오류가 발생했습니다: ${error.message}`);
          }
        } finally {
          setLoading(false);
        }
      }
    };

    if (roomId) {
      initializeChat();
    }

    return () => {
      if (stompClient.current) {
        try {
          stompClient.current.disconnect();
          console.log("웹소켓 연결 해제");
        } catch (error: any) {
          console.error("웹소켓 연결 해제 실패:", error);
        }
      }
    };
  }, [roomId]);

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-blue-500">채팅방 연결 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 h-screen flex flex-col">
      {chatRoom ? (
        <>
          <div className="flex justify-between items-center mb-4">
            {/* <h2 className="text-xl font-bold">채팅방 #{chatRoom.id}</h2> */}
            <h2 className="text-xl font-bold">채팅방명 #{chatRoom.title}</h2>
            <button
              onClick={leaveChat}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              채팅방에서 나가기
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            <div className="space-y-2">
              {timelineMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg ${
                    msg.type === "system"
                      ? "bg-gray-100 text-center"
                      : msg.writerName === currentUser?.nickname
                      ? "ml-auto bg-blue-500 text-white max-w-[80%]"
                      : "bg-gray-200 max-w-[80%]"
                  }`}
                >
                  {msg.type === "chat" && (
                    <p className="text-sm font-medium">{msg.writerName}</p>
                  )}
                  <p className={msg.type === "system" ? "text-gray-600" : ""}>
                    {msg.message}
                  </p>
                  <p className="text-xs text-right">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
            <div ref={messageEndRef} />
          </div>

          {/* Message Input */}
          <div className="flex gap-2 mt-auto">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="메시지를 입력하세요..."
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              전송
            </button>
          </div>
        </>
      ) : (
        <p>채팅방을 불러오는 중...</p>
      )}
    </div>
  );
}
