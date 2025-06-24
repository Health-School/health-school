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
  userType: "ENTER" | "LEAVE" | "TALK" | "FORCE_LEAVE"; // "FORCE_LEAVE" 추가
};

type GroupChatMessageResponseDto = {
  id: number;
  message: string;
  writerName: string;
  userType: "ENTER" | "LEAVE" | "TALK" | "FORCE_LEAVE"; // "FORCE_LEAVE" 추가
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

const GroupChatRoom = ({ roomId, onClose }: GroupChatRoomProps) => {
  const [chatRoom, setChatRoom] = useState<GroupChatRoom | null>(null);
  const [timelineMessages, setTimelineMessages] = useState<TimelineMessage[]>(
    []
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [participantsError, setParticipantsError] = useState<string | null>(
    null
  );
  const [showParticipants, setShowParticipants] = useState(false); // 상태 추가

  const stompClient = useRef<CompatClient | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const hasEnterMessageSent = useRef(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null); // 메시지 컨테이너 참조 추가

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

      // 메시지를 타임라인 형식으로 변환 - 타입 확인 로직 강화
      const timelineMessages: TimelineMessage[] = messages.map((msg) => ({
        id: msg.id,
        // 타입 판별 로직 강화
        type:
          msg.userType === "ENTER" ||
          msg.userType === "LEAVE" ||
          msg.userType === "FORCE_LEAVE"
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

  // 참가자 목록 상태 정의
  const [participantsState, setParticipantsState] = useState<any[]>([]);
  const [showParticipantsState, setShowParticipantsState] = useState(false);

  // 참가자 목록 가져오는 함수
  const fetchParticipants = async () => {
    try {
      console.log("참가자 목록 가져오기 시작");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/group-chat/${roomId}/users`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        console.error("참가자 목록 조회 실패:", response.status);
        return;
      }

      const data = await response.json();
      console.log("참가자 목록 데이터:", data);

      // 배열인지 확인하고 설정
      if (Array.isArray(data)) {
        setParticipants(data);
      } else {
        console.error("참가자 목록이 배열이 아님:", data);
        setParticipants([]);
      }
    } catch (error) {
      console.error("참가자 목록 조회 오류:", error);
      setParticipants([]);
    }
  };

  // 초기화 useEffect에 추가
  useEffect(() => {
    // 기존 코드...
    if (roomId) {
      fetchParticipants();
    }
    // 기존 코드...
  }, [roomId]);

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
            `/subscribe/group/message/room/${roomId}`,
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

          // 입장 메시지 구독 수정
          client.subscribe(
            `/subscribe/group/enter/room/${roomId}`,
            (message) => {
              try {
                const enterMessage = JSON.parse(message.body);

                // 강제퇴장 메시지이고 현재 사용자와 관련된 메시지인지 확인
                if (
                  enterMessage.userType === "FORCE_LEAVE" &&
                  enterMessage.writerName === currentUser?.nickname
                ) {
                  // 강제퇴장 알림 표시
                  alert("방장에 의해 강제퇴장 되었습니다.");

                  // 채팅방 나가기
                  onClose();
                  return;
                }

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

          // 퇴장 메시지 구독 수정
          client.subscribe(
            `/subscribe/group/leave/room/${roomId}`,
            (message) => {
              try {
                const leaveMessage = JSON.parse(message.body);
                // 명시적으로 타입을 "system"으로 설정
                addMessageToTimeline({
                  id: leaveMessage.id,
                  type: "system", // 명확하게 시스템 타입으로 설정
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
        `/publish/chat/group/room/message/${roomId}`,
        { "Content-Type": "application/json" },
        JSON.stringify(messageData)
      );

      setMessage("");
    } catch (error) {
      console.error("메시지 전송 실패:", error);
    }
  };

  // Modify your existing leave/exit function
  const handleLeaveRoom = () => {
    // Show confirmation alert before leaving
    const confirmed = window.confirm("이 방을 정말 나가시겠습니까?");

    if (confirmed) {
      // Create leave message payload
      const leaveMessage = {
        writerName: currentUser?.nickname, // Adjust based on your user state variable
      };

      // Send leave message to the server
      stompClient.current?.publish({
        destination: `/publish/chat/group/room/leave/${roomId}`,
        body: JSON.stringify(leaveMessage),
      });

      // Navigate back to chat list or home page
      onClose(); // Adjust based on your routing
    }
  };

  // 사용자 강퇴 처리 함수
  const handleKickUser = (user: any) => {
    console.log("강퇴 함수 호출됨", user);

    if (typeof user === "string" || !user?.userId || !currentUser) {
      console.log(
        "강퇴 불가: 잘못된 사용자 정보",
        typeof user,
        user?.userId,
        currentUser
      );
      return;
    }

    const confirmed = window.confirm(
      `${user.nickname}님을 강제퇴장 하시겠습니까?`
    );

    if (confirmed) {
      try {
        // 강퇴 요청 데이터 생성
        const kickRequestData = {
          targetNickname: user.nickname,
          requesterNickname: currentUser.nickname,
        };

        console.log("강퇴 요청 데이터:", kickRequestData);

        // WebSocket을 통해 강퇴 요청 메시지 전송
        if (stompClient.current && stompClient.current.connected) {
          console.log("WebSocket 연결 상태:", stompClient.current.connected);
          console.log(
            "강퇴 메시지 전송 경로:",
            `/publish/chat/group/room/force-leave/${roomId}`
          );

          stompClient.current.send(
            `/publish/chat/group/room/force-leave/${roomId}`,
            { "Content-Type": "application/json" },
            JSON.stringify(kickRequestData)
          );

          console.log(`${user.nickname}님 강제퇴장 요청 전송 완료`);
        } else {
          console.error("WebSocket 연결이 없어 강제퇴장을 처리할 수 없습니다.");
          alert("채팅 서버와 연결이 끊어져 강제퇴장을 처리할 수 없습니다.");
        }
      } catch (error) {
        console.error("강퇴 처리 오류:", error);
        alert("사용자 강제퇴장 중 오류가 발생했습니다.");
      }
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

  // 메시지 컨테이너 스크롤 설정
  useEffect(() => {
    if (messagesContainerRef.current) {
      // 메시지 수가 10개 초과인지 확인
      const messageCount = timelineMessages.length;

      if (messageCount > 10) {
        // 스크롤 활성화
        messagesContainerRef.current.style.overflowY = "auto";
        messagesContainerRef.current.style.maxHeight = "60vh"; // 필요에 따라 높이 조정
        // 새 메시지가 도착하면 아래로 스크롤
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      } else {
        // 아직 스크롤 필요 없음
        messagesContainerRef.current.style.overflowY = "visible";
        messagesContainerRef.current.style.maxHeight = "none";
      }
    }
  }, [timelineMessages]); // timelineMessages가 변경될 때마다 실행

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
      <div className="flex items-stretch">
        {/* 채팅창 */}
        <div className="bg-white rounded-lg flex flex-col shadow-xl w-[700px] h-[600px]">
          {/* 헤더 */}
          <div className="px-4 py-3 flex items-center border-b bg-green-400 rounded-t-lg">
            <button onClick={onClose} className="mr-3 text-white">
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
            <h2 className="text-lg font-medium flex-1 text-white">
              {chatRoom?.name || `그룹 채팅방 (${roomId})`}
            </h2>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="text-white hover:bg-white/20 py-1 px-3 rounded-full flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <span>참가자</span>
              </button>

              <button onClick={handleLeaveRoom} className="text-white">
                나가기
              </button>
            </div>
          </div>

          {/* 채팅 영역 */}
          <div className="flex-1 flex flex-col">
            {/* 메시지 영역 */}
            <div
              className="flex-1 overflow-y-auto p-4 bg-gray-50"
              ref={messagesContainerRef} // 메시지 컨테이너 참조 추가
            >
              {loading && timelineMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-3"></div>
                  <p className="text-gray-500">메시지를 불러오는 중...</p>
                </div>
              ) : (
                <div className="space-y-4">
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
                    timelineMessages.map((msg, index) => {
                      // 같은 사람의 연속 메시지인지 확인
                      const showProfile =
                        index === 0 ||
                        timelineMessages[index - 1].writerName !==
                          msg.writerName;

                      return msg.type === "system" ? (
                        // 시스템 메시지
                        <div
                          key={msg.id || `msg-${index}`}
                          className="flex justify-center"
                        >
                          <div className="bg-gray-200 rounded-full px-4 py-2 text-sm text-gray-600">
                            {msg.message}
                          </div>
                        </div>
                      ) : msg.writerName === currentUser?.nickname ? (
                        // 내 메시지
                        <div
                          key={msg.id || `msg-${index}`}
                          className="flex justify-end items-end"
                        >
                          <div className="text-xs text-gray-500 mr-2">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>

                          <div className="bg-green-400 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg py-2 px-3 max-w-[75%]">
                            <div className="break-words">{msg.message}</div>
                          </div>
                        </div>
                      ) : (
                        // 상대방 메시지
                        <div
                          key={msg.id || `msg-${index}`}
                          className="flex flex-col"
                        >
                          {/* 다른 사람의 첫 메시지일 때만 닉네임 표시 */}
                          {showProfile && (
                            <div className="text-xs font-medium text-gray-700 ml-10 mb-1">
                              {msg.writerName}
                            </div>
                          )}

                          <div className="flex items-end">
                            {/* 프로필 이미지 - 이미지에 맞게 조정 */}
                            {showProfile ? (
                              <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 bg-gray-200 flex items-center justify-center">
                                {(() => {
                                  const sender = Array.isArray(participants)
                                    ? participants.find(
                                        (p) =>
                                          p &&
                                          typeof p === "object" &&
                                          "nickname" in p &&
                                          p.nickname === msg.writerName
                                      )
                                    : null;

                                  return sender &&
                                    "profileImage" in sender &&
                                    sender.profileImage ? (
                                    <img
                                      src={sender.profileImage as string}
                                      alt={`${msg.writerName} 프로필`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target =
                                          e.target as HTMLImageElement;
                                        target.onerror = null;
                                        target.src =
                                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%239ca3af'%3E%3Cpath fill-rule='evenodd' d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' clip-rule='evenodd'/%3E%3C/svg%3E";
                                      }}
                                    />
                                  ) : (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 text-gray-500"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  );
                                })()}
                              </div>
                            ) : (
                              // 연속 메시지일 경우 프로필 공간 유지
                              <div className="w-8 mr-2 flex-shrink-0"></div>
                            )}

                            <div className="bg-white border border-gray-200 text-gray-800 rounded-tl-lg rounded-tr-lg rounded-br-lg py-2 px-3 max-w-[75%]">
                              <div className="break-words">{msg.message}</div>
                            </div>

                            <div className="text-xs text-gray-500 ml-2">
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })
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

        {/* 참가자 목록 - 프로필 이미지 표시 추가 */}
        {showParticipants && (
          <div className="bg-white h-[600px] w-[250px] flex flex-col border-l shadow-md">
            {/* 헤더 - 이미지와 정확히 일치하는 색상으로 수정 */}
            <div
              className="flex items-center justify-between p-3"
              style={{ backgroundColor: "#e8fff0" }}
            >
              <h3 className="font-bold text-base" style={{ color: "#00a65a" }}>
                참가자 ({participants.length})
              </h3>
              <button
                onClick={() => setShowParticipants(false)}
                className="hover:opacity-70"
                style={{ color: "#00a65a" }}
              >
                ✕
              </button>
            </div>

            {/* 참가자 목록 - 프로필 이미지 표시 */}
            <div className="flex-1 overflow-y-auto bg-white">
              {participants.length === 0 ? (
                <div className="text-center text-gray-500 text-sm p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto mb-2"></div>
                  참가자 정보를 불러오는 중...
                </div>
              ) : (
                <div>
                  {participants.map((user, index) => (
                    <div
                      key={`user-${index}`}
                      className="flex items-center p-3 border-b border-gray-100 participant-item"
                    >
                      {/* 프로필 이미지 - 실제 이미지 표시 */}
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0 bg-gray-100 flex items-center justify-center participant-avatar">
                        {user?.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={`${typeof user === "string" ? user : user?.nickname || "사용자"} 프로필`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // 이미지 로드 실패 시 기본 아이콘 표시
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%239ca3af'%3E%3Cpath fill-rule='evenodd' d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' clip-rule='evenodd'/%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>

                      {/* 사용자 정보 */}
                      <div className="flex-1 participant-info">
                        <div className="font-medium text-gray-800 participant-name">
                          {typeof user === "string"
                            ? user
                            : user?.nickname || "사용자"}
                          {/* 나 표시 */}
                          {(typeof user === "string"
                            ? user === currentUser?.nickname
                            : user?.userId === currentUser?.id) && (
                            <span className="text-xs text-gray-500 ml-1">
                              (나)
                            </span>
                          )}
                          {/* 개설자 표시 - creator 속성을 확인하도록 수정 */}
                          {typeof user !== "string" && user?.creator && (
                            <span className="text-xs text-green-600 ml-1 font-semibold">
                              (개설자)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 강퇴 버튼 - 현재 사용자가 개설자이고, 자기 자신이 아닌 경우에만 표시 */}
                      {participants.some(
                        (p) =>
                          typeof p !== "string" &&
                          p?.creator &&
                          p?.userId === currentUser?.id
                      ) &&
                        typeof user !== "string" &&
                        user?.userId !== currentUser?.id && (
                          <button
                            onClick={() => handleKickUser(user)}
                            className="text-red-500 hover:text-red-700 text-sm ml-2 p-1"
                            title="강퇴하기"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 푸터 - 참가자 상태 표시 */}
            <div className="p-3 text-xs text-center text-gray-500 border-t bg-white">
              총 {participants.length}명이 대화에 참여 중입니다
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupChatRoom;
