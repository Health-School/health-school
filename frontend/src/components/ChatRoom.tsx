"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import SockJS from "sockjs-client";
import { CompatClient, Stomp } from "@stomp/stompjs";

// Types (keep all original types)
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
  isEditing?: boolean;
  isEdited?: boolean;
};

type ChatResponseDto = {
  id: number;
  writerName: string;
  message: string;
  userType: "ENTER" | "LEAVE" | "TALK";
  createdDate: string;
};

interface ChatRoomProps {
  roomId: number;
  onClose: () => void;
}

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default function ChatRoom({ roomId, onClose }: ChatRoomProps) {
  // Keep all original states
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timelineMessages, setTimelineMessages] = useState<TimelineMessage[]>(
    []
  );
  const [newMessage, setNewMessage] = useState("");
  const [editingMessage, setEditingMessage] = useState<string>("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const stompClient = useRef<CompatClient | null>(null);

  // Keep all original functions (fetchCurrentUser, connectWebSocket, etc.)
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

  // Add WebSocket connection function
  const connectWebSocket = (roomData: ChatRoom, user: User) => {
    // 기존 연결이 있다면 먼저 해제
    if (stompClient.current) {
      stompClient.current.disconnect();
    }

    const socket = new SockJS(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/ws-stomp`
    );
    const client = Stomp.over(socket);

    // Disable debug logs with proper type
    client.debug = () => {}; // or just: client.debug = null;

    let chatSubscription: any = null;
    let systemSubscription: any = null;

    client.connect(
      {},
      () => {
        console.log("STOMP 연결 성공");
        stompClient.current = client;

        // 기존 구독 해제
        if (chatSubscription) {
          chatSubscription.unsubscribe();
        }
        if (systemSubscription) {
          systemSubscription.unsubscribe();
        }

        // 새로운 구독 설정
        chatSubscription = client.subscribe(
          `/subscribe/chat/room/${roomId}`,
          (message) => {
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
          }
        );

        systemSubscription = client.subscribe(
          `/subscribe/enter/room/${roomId}`,
          (message) => {
            const systemMessage = JSON.parse(message.body);
            setTimelineMessages((prev) => [
              ...prev,
              {
                type: "system",
                message: systemMessage.message,
                timestamp: new Date(),
              },
            ]);
          }
        );
      }
      // (error) => {
      //   console.error("STOMP 연결 실패:", error);
      //   setError("채팅 연결에 실패했습니다.");
      // }
    );
  };

  // Add initialization effect
  useEffect(() => {
    const initializeChat = async () => {
      const user = await fetchCurrentUser();
      if (user) {
        try {
          setLoading(true);
          // Fetch chat room
          const roomResponse = await api.get(`/api/v1/chatrooms/${roomId}`);
          const roomData = roomResponse.data;
          setChatRoom(roomData);

          // Connect WebSocket
          connectWebSocket(roomData, user);

          // Fetch message history
          const historyResponse = await api.get(
            `/api/v1/chats/room/${roomId}/messages`
          );
          setTimelineMessages(
            historyResponse.data.map((msg: any) => ({
              type: msg.userType === "TALK" ? "chat" : "system",
              message: msg.message,
              writerName: msg.userType === "TALK" ? msg.writerName : undefined,
              timestamp: new Date(msg.createdDate),
            }))
          );
        } catch (error: any) {
          console.error("채팅 초기화 실패:", error);
          setError("채팅방 연결에 실패했습니다.");
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
        stompClient.current.disconnect();
      }
    };
  }, [roomId]);

  // Add scroll effect
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [timelineMessages]);

  // Update the close/leave handling
  const leaveChat = () => {
    if (!stompClient.current || !chatRoom || !currentUser) return;

    const confirmLeave = window.confirm("정말로 채팅방을 나가시겠습니까?");

    if (confirmLeave) {
      try {
        const leaveData = {
          writerName: currentUser.nickname,
          receiverName: chatRoom.receiverName,
        };

        if (!stompClient.current.connected) {
          throw new Error("웹소켓 연결이 끊어졌습니다.");
        }

        stompClient.current.send(
          `/publish/chat/room/leave/${roomId}`,
          { "Content-Type": "application/json" },
          JSON.stringify(leaveData)
        );

        setTimeout(async () => {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chatrooms/${roomId}/auto-delete`,
              {
                method: "DELETE",
                credentials: "include",
              }
            );
            const result = await response.text();
            console.log("채팅방 자동 삭제 체크 완료:", result);
          } catch (error) {
            console.error("채팅방 자동 삭제 체크 실패:", error);
          } finally {
            if (stompClient.current) {
              stompClient.current.disconnect(() => {
                console.log("채팅방 나가기 완료");
                onClose(); // Call onClose instead of redirecting
              });
            }
          }
        }, 1000);
      } catch (error) {
        console.error("채팅방 나가기 실패:", error);
        alert("채팅방 나가기에 실패했습니다. 다시 시도해주세요.");
        onClose(); // Call onClose on error too
      }
    }
  };

  interface MessageData {
    writerName: string;
    receiverName: string;
    message: string;
  }

  // Add the sendMessage function to your ChatRoom component
  const sendMessage = async () => {
    if (!stompClient.current || !chatRoom || !currentUser || !newMessage.trim())
      return;

    const messageData: MessageData = {
      writerName: currentUser.nickname,
      receiverName: chatRoom.receiverName,
      message: newMessage.trim(),
    };

    try {
      stompClient.current.send(
        `/publish/chat/message/${roomId}`, // Changed from roomId2 to roomId
        { "Content-Type": "application/json" },
        JSON.stringify(messageData)
      );

      setNewMessage(""); // Clear input field

      // Refresh messages after a short delay
      // setTimeout(async () => {
      //   await refreshMessages();
      // }, 100);
    } catch (error) {
      console.error("메시지 전송 실패:", error);
    }
  };

  // Update the return JSX
  if (loading) {
    return (
      <div className="p-4">
        <p className="text-blue-500">채팅방 연결 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <p className="text-xl text-red-500 font-semibold mb-4">{error}</p>
          {error === "이 채팅방에 접근 권한이 없습니다." ? (
            <p className="text-gray-600">3초 후 메인 페이지로 이동합니다...</p>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              다시 시도
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] h-[700px] rounded-lg flex flex-col shadow-xl">
        {" "}
        {/* Increased size */}
        {/* Header */}
        {chatRoom && (
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
              {chatRoom.title}
            </h2>
            <button
              onClick={leaveChat}
              className="text-black hover:text-gray-700"
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
                            ? "bg-green-400 text-white rounded-tr-none"
                            : "bg-white border border-green-200 text-gray-800 rounded-tl-none"
                        }`}
                      >
                        <div>{msg.message}</div>
                      </div>
                      {/* Add pseudo-triangle for bubble tail */}
                      <div
                        className={`absolute top-0 w-2 h-2 ${
                          msg.writerName === currentUser?.nickname
                            ? "right-0 border-t-8 border-r-8 border-transparent border-t-green-400"
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
                      {msg.timestamp.toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}{" "}
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
              className="flex-1 rounded-full px-4 py-2 border focus:outline-none focus:border-green-400"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
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
