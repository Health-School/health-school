"use client";

import { useEffect, useRef, useState } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import React from "react";
interface AlarmResponseDto {
  id: number;
  message: string;
  url: string;
  title: string;
  read: boolean;
  createdAt: string; // "yyyy-MM-dd HH:mm:ss"
}

enum EventType {
  ALARM = "ALARM",
  DUMMY = "DUMMY",
}

const maxReconnectAttempts = 5;

export default function AlarmSidebar({
  open,
  onClose,
  alarms,
  onRead,
  onDelete, // ✅ 추가
}: {
  open: boolean;
  onClose: () => void;
  alarms: AlarmResponseDto[];
  onRead: (id: number) => void;
  onDelete: (id: number) => void; // ✅ 추가
}) {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-[350px] bg-white shadow-2xl z-50 transition-transform duration-300 border-l border-gray-200 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <span className="text-lg font-bold">알림</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-green-600"
        >
          <svg width={24} height={24} fill="none" viewBox="0 0 24 24">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <div className="overflow-y-auto h-[calc(100%-64px)] px-4 py-1">
        {alarms.length === 0 && (
          <div className="text-gray-400 text-center mt-10">
            알림이 없습니다.
          </div>
        )}
        {alarms.map((alarm) => (
          <div
            key={alarm.id}
            className={`flex flex-col gap-1 px-2 py-3 border-b cursor-pointer ${
              alarm.read ? "bg-white" : "bg-green-50"
            }`}
            onClick={async () => {
              onRead(alarm.id);
              try {
                await fetch(
                  `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/alarm/read/${alarm.id}`,
                  {
                    method: "GET",
                    credentials: "include",
                  }
                );
              } catch (e) {
                // 에러 무시 또는 필요시 처리
              }
            }}
          >
            <div className="flex justify-between items-center">
              <span
                className={`font-semibold ${
                  alarm.read ? "text-gray-600" : "text-green-600"
                }`}
              >
                {alarm.title}
              </span>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    await fetch(
                      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/alarm/${alarm.id}`,
                      {
                        method: "DELETE",
                        credentials: "include",
                      }
                    );
                    onDelete(alarm.id); // ✅ 새로고침 대신 알람 삭제 콜백 호출
                  } catch (err) {
                    alert("알림 삭제에 실패했습니다.");
                  }
                }}
                className="ml-2 text-gray-400 hover:text-green-600"
                title="알림 삭제"
              >
                <svg width={20} height={20} fill="none" viewBox="0 3 24 24">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <span className="text-gray-700 text-sm">
              {alarm.message
                .replaceAll("\\n", "\n") // ⚠️ 중요! 이걸로 진짜 줄바꿈 문자로 바꿈
                .split("\n")
                .map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
            </span>
            <div className="flex justify-end">
              <span className="text-xs text-gray-400">
                {alarm.createdAt.slice(5, 16)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
