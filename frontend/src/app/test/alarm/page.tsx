"use client";

import React, { useEffect, useRef, useState } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";

type AlarmData = {
  id: number | null;
  title: string; // 추가
  message: string;
  createdAt: string;
};

enum EventType {
  DUMMY = "DUMMY",
  ALARM = "ALARM",
}

const AlarmBox = () => {
  const [alarms, setAlarms] = useState<AlarmData[]>([]);
  const lastEventIdRef = useRef<string | null>(null);
  const eventSourceRef = useRef<EventSourcePolyfill | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connectToSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSourcePolyfill(
      "http://localhost:8090/api/v1/alarm/subscribe",
      {
        withCredentials: true,
        headers: lastEventIdRef.current
          ? { "Last-Event-ID": lastEventIdRef.current }
          : {},
      }
    );

    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log("✅ SSE 연결 성공");
      reconnectAttemptsRef.current = 0;
    };

    // ALARM 이벤트 리스너
    eventSource.addEventListener(EventType.ALARM, {
      handleEvent(event) {
        try {
          const data: AlarmData = JSON.parse((event as MessageEvent).data);
          console.log("📥 [ALARM] 수신:", data);
          setAlarms((prev) => [...prev, data]);

          if ((event as MessageEvent).lastEventId) {
            lastEventIdRef.current = (event as MessageEvent).lastEventId;
          }
        } catch (e) {
          console.error("❌ ALARM 파싱 실패:", e);
        }
      },
    });

    // DUMMY 이벤트 리스너
    eventSource.addEventListener(EventType.DUMMY, {
      handleEvent(event) {
        console.log("💤 [DUMMY] 수신됨 (무시):", (event as MessageEvent).data);
      },
    });

    // 오류 핸들링
    eventSource.onerror = (err) => {
      console.error("❗️SSE 오류 발생:", err);
      eventSource.close();

      const reconnectDelay = Math.min(
        1000 * Math.pow(2, reconnectAttemptsRef.current),
        30000
      );
      console.log(`🔄 ${reconnectDelay}ms 후 재연결 시도...`);

      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connectToSSE();
        }, reconnectDelay);
      } else {
        console.error("❌ 최대 재연결 시도 횟수 초과");
      }
    };
  };

  useEffect(() => {
    connectToSSE();

    return () => {
      console.log("🔌 SSE 연결 해제");
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div>
      <h2>🔔 실시간 알람 메시지</h2>
      <div style={{ border: "1px solid #ccc", padding: "10px" }}>
        {alarms.length === 0 ? (
          <div>알람이 없습니다.</div>
        ) : (
          alarms.map((alarm, idx) => (
            <div key={alarm.id ?? idx}>
              <strong>{alarm.title}</strong> {/* title 추가 */}
              <br />[{alarm.createdAt}] {alarm.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlarmBox;
