// filepath: src/components/alarm/AlarmBell.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import AlarmSidebar from "./AlarmSidebar";
import { EventSourcePolyfill } from "event-source-polyfill";
import { useRouter } from "next/navigation";
import { useGlobalLoginUser } from "@/stores/auth/loginUser";

interface AlarmResponseDto {
  id: number;
  message: string;
  url: string;
  title: string;
  read: boolean;
  createdAt: string;
}

enum EventType {
  ALARM = "ALARM",
  DUMMY = "DUMMY",
}

export default function AlarmBell() {
  const [alarms, setAlarms] = useState<AlarmResponseDto[]>([]);
  const [open, setOpen] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const lastEventIdRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    const originalConsoleError = console.error;

    console.error = (...args) => {
      const message = args.join(" ");
      if (
        message.includes("No activity within") &&
        message.includes("Reconnecting")
      ) {
        // 무시
        return;
      }
      originalConsoleError(...args);
    };

    return () => {
      console.error = originalConsoleError; // 정리
    };
  }, []);

  const { isLogin, loginUser, logoutAndHome, isLoginUserPending } =
    useGlobalLoginUser();
  // SSE 연결 함수
  const connectToSSE = () => {
    console.log("🚀 SSE 연결 시도 시작");

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const sseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/alarm/subscribe`;
    console.log("🔗 연결 URL:", sseUrl);

    const eventSource = new EventSourcePolyfill(sseUrl, {
      withCredentials: true,
      headers: {
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
        ...(lastEventIdRef.current
          ? { "Last-Event-ID": lastEventIdRef.current }
          : {}),
      },
      heartbeatTimeout: 10000, // 1 단축
    });

    eventSourceRef.current = eventSource;

    eventSource.onopen = (event) => {
      console.log("✅ SSE 연결 성공", event);
      reconnectAttemptsRef.current = 0;
    };
    eventSource.addEventListener("CONNECT", (event: any) => {
      console.log("✅ SSE 연결 확인:", event.data);
    });
    eventSource.addEventListener(EventType.ALARM, {
      handleEvent(event) {
        try {
          const data: AlarmResponseDto = JSON.parse(
            (event as MessageEvent).data
          );
          console.log("📥 [ALARM] 수신:", data);
          setAlarms((prev) => [...prev, data]);
          if ((event as MessageEvent).lastEventId) {
            lastEventIdRef.current = (event as MessageEvent).lastEventId;
          }
        } catch (e) {
          // 파싱 실패
        }
      },
    });

    eventSource.addEventListener(EventType.DUMMY, {
      handleEvent(event) {
        // DUMMY 이벤트 무시
        console.log("💤 [DUMMY] 수신됨 (무시):", (event as MessageEvent).data);
      },
    });

    eventSource.onerror = (error) => {
      console.error("❌ SSE 오류:", error);
      eventSource.close();

      // 3초 후 재연결
      if (reconnectAttemptsRef.current < 3) {
        setTimeout(() => {
          reconnectAttemptsRef.current++;
          connectToSSE();
        }, 3000);
      }
    };
  };

  useEffect(() => {
    if (!isLogin) return; // 로그인한 경우에만 SSE 연결
    connectToSSE();
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
    };
    // eslint-disable-next-line
  }, [isLogin]);

  // 환경 정보 로깅
  useEffect(() => {
    console.log("🌍 Environment Info:", {
      apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      isLogin,
      loginUser: loginUser?.nickname,
    });
  }, [isLogin, loginUser]);

  // 읽지 않은 알림 개수
  const unreadCount = alarms.filter((a) => !a.read).length;

  // 알림 읽음 처리 (예시: 클릭 시 read true로 변경)
  const handleRead = (id: number) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: true } : a))
    );
    // TODO: 서버에 읽음 처리 요청 필요시 추가
  };
  const handleDelete = (id: number) => {
    setAlarms((prev) => prev.filter((alarm) => alarm.id !== id));
  };
  return (
    <>
      <button
        className="relative p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors mx-1"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="알림"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={26}
          height={26}
          fill="none"
          viewBox="0 0 24 24"
          className="text-gray-600"
        >
          <path
            d="M12 2a7 7 0 0 0-7 7v3.586l-.707.707A1 1 0 0 0 5 16h14a1 1 0 0 0 .707-1.707l-.707-.707V9a7 7 0 0 0-7-7Zm0 18a3 3 0 0 1-3-3h6a3 3 0 0 1-3 3Z"
            fill="currentColor"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
            {unreadCount}
          </span>
        )}
      </button>
      <AlarmSidebar
        open={open}
        onClose={() => setOpen(false)}
        alarms={alarms}
        onRead={handleRead}
        onDelete={handleDelete} // ✅ 추가
      />
    </>
  );
}
