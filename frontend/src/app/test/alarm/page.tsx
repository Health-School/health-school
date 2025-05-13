"use client";

import React, { useEffect, useRef, useState } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";

type AlarmData = {
  id: number | null;
  message: string;
  createdAt: string;
};

const AlarmBox = () => {
  const [alarms, setAlarms] = useState<AlarmData[]>([]);
  const lastEventIdRef = useRef<string | null>(null); // 🔒 메모리에만 저장

  useEffect(() => {
    const eventSource = new EventSourcePolyfill(
      "http://localhost:8090/api/v1/alarm/subscribe",
      {
        withCredentials: true,
        headers: lastEventIdRef.current
          ? { "Last-Event-ID": lastEventIdRef.current }
          : {},
      }
    );

    eventSource.onopen = () => {
      console.log("✅ SSE 연결 성공");
    };

    eventSource.onmessage = (event) => {
      try {
        const data: AlarmData = JSON.parse(event.data);
        console.log("📥 수신된 알람:", data);
        setAlarms((prev) => [...prev, data]);

        // 📌 메모리에만 lastEventId 저장
        if (event.lastEventId) {
          lastEventIdRef.current = event.lastEventId;
        }
      } catch (e) {
        console.error("❌ 알람 파싱 실패:", e);
      }
    };

    eventSource.onerror = (err) => {
      console.error("❗️SSE 오류 발생:", err);
      eventSource.close();
    };

    return () => {
      console.log("🔌 SSE 연결 해제");
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <h2>🔔 실시간 알람 메시지</h2>
      <div style={{ border: "1px solid #ccc", padding: "10px" }}>
        {alarms.map((alarm, idx) => (
          <div key={alarm.id ?? idx}>
            [{alarm.createdAt}] {alarm.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlarmBox;
