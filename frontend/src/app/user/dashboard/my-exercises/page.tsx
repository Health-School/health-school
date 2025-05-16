"use client";

import Link from "next/link";
import { useState } from "react";
import DashboardTabs from "@/components/dashboard/DashboardTabs";

export default function MyExercisesPage() {
  const [currentMonth, setCurrentMonth] = useState("4월");

  const exercises = [
    {
      name: "바닥 엎드려 프레스",
      sets: [
        { set: 1, weight: 142.5, reps: 5 },
        { set: 2, weight: 142.5, reps: 5 },
        { set: 3, weight: 142.5, reps: 5 },
        { set: 4, weight: 142.5, reps: 5 },
      ],
      completion: 100,
    },
    {
      name: "덤벨 숄더 프레스",
      sets: [
        { set: 1, weight: 20, reps: 12 },
        { set: 2, weight: 20, reps: 12 },
        { set: 3, weight: 20, reps: 12 },
      ],
      completion: 100,
    },
    {
      name: "밀리터리프레스",
      sets: [
        { set: 1, weight: 60, reps: 8 },
        { set: 2, weight: 60, reps: 8 },
        { set: 3, weight: 60, reps: 8 },
        { set: 4, weight: 60, reps: 8 },
      ],
      completion: 100,
    },
  ];

  return (
    <div className="p-6">
      {/* Navigation Tabs */}

      <DashboardTabs />
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option>4월</option>
            <option>5월</option>
            <option>6월</option>
          </select>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm rounded border">일간</button>
            <button className="px-3 py-1 text-sm rounded border">주간</button>
          </div>
        </div>
        <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
          + 운동 기록 추가
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="mb-8">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <div key={day} className="text-center py-2 text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className={`border rounded-lg p-2 h-24 ${
                [4, 5, 8, 9].includes(i) ? "bg-green-50" : ""
              }`}
            >
              <span className="text-sm text-gray-600">{i - 1}</span>
              {[4, 5, 8, 9].includes(i) && (
                <div className="mt-1">
                  <span className="text-xs text-green-600">운동완료</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Exercise Records */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">
          2025년 5월 8일의 운동 기록
        </h3>
        {exercises.map((exercise, index) => (
          <div key={index} className="mb-6 bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">{exercise.name}</h4>
              <span className="text-green-600 text-sm">
                달성률 {exercise.completion}%
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {exercise.sets.map((set) => (
                <div
                  key={set.set}
                  className="text-center p-2 bg-gray-50 rounded"
                >
                  <div className="text-sm text-gray-500">{set.set} Set</div>
                  <div className="font-medium">
                    {set.weight} kg × {set.reps}회
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8 space-x-2">
        <button className="px-3 py-2 rounded-md hover:bg-gray-100">&lt;</button>
        <button className="px-3 py-2 rounded-md bg-green-500 text-white">
          1
        </button>
        <button className="px-3 py-2 rounded-md hover:bg-gray-100">2</button>
        <button className="px-3 py-2 rounded-md hover:bg-gray-100">&gt;</button>
      </div>
    </div>
  );
}
