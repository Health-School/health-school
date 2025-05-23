"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import QnaTab from "@/components/qna/QnaTab";

const LectureListPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedTab, setSelectedTab] = useState("curriculum");
  const [userId, setUserId] = useState<number | null>(null);

  const params = useParams();
  const lectureId = Number(params?.lectureId);
  const searchParams = useSearchParams();
  const curriculumId = searchParams.get("curriculumId");

  // 유저 정보 불러오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/me`,
          {
            credentials: "include", // 쿠키 인증 필요 시
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user info");
        }
        const data = await response.json();

        setUserId(data.data.id);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const lectures = [
    {
      id: 1,
      section: "기초 운동의 이해",
      items: [
        { id: 1, title: "올바른 자세의 중요성", time: "08:45", seconds: 525 },
        { id: 2, title: "호흡법 기초", time: "07:15", seconds: 435 },
        { id: 3, title: "운동 전 준비 운동", time: "09:30", seconds: 570 },
      ],
    },
    { id: 2, section: "가슴 운동 기초", items: [] },
    { id: 3, section: "등 운동 기초", items: [] },
    { id: 4, section: "하체 운동 기초", items: [] },
  ];

  const handleTimeJump = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  const handleTabClick = (tab: string) => {
    setSelectedTab(tab);
  };

  const handleChatClick = () => {
    alert("1:1 대화 기능은 태윤님이 만들어주실겁니다.");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-[1440px] mx-auto px-12 py-12 grid grid-cols-3 gap-12">
        {/* 왼쪽 비디오 및 설명 */}
        <div className="col-span-2 space-y-8">
          <div className="bg-black aspect-video rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              controls
              className="w-full h-full"
              src="https://heathschool-video-picture.s3.ap-northeast-2.amazonaws.com/uploads/curriculums/ecc4c79f-352a-4f30-a548-91910aeb39bc_%ED%99%94%EB%A9%B4%20%EB%85%B9%ED%99%94%20%EC%A4%91%202025-05-21%20103644.mp4"
            />
          </div>

          <div>
            <h1 className="text-3xl font-semibold">
              초보자를 위한 헬스 트레이닝 기초
            </h1>
            <div className="flex items-center space-x-3 mt-2">
              <img
                src="https://via.placeholder.com/40"
                alt="박준혁 트레이너"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="text-base text-gray-600">
                박준혁 트레이너 · 헬스 트레이닝 전문가
              </div>
            </div>
            <button
              onClick={handleChatClick}
              className="mt-3 bg-green-100 text-green-700 text-base rounded px-4 py-2 border border-green-300 hover:bg-green-200"
            >
              1:1 대화하기
            </button>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">강의 소개</h2>
            <p className="text-base text-gray-700">
              이 강의는 헬스 트레이닝을 처음 시작하는 분들을 위한 기초
              과정입니다. 몸과 자세와 호흡법부터 시작하여 주요 근육 그룹별 기초
              운동 방법을 배우게 됩니다. 체계적인 커리큘럼을 통해 부상 없이
              안전하게 운동하는 방법을 익히고, 효과적인 트레이닝 루틴을 구성하는
              방법을 배울 수 있습니다.
            </p>
            <div className="text-sm text-gray-500">
              초급 · 4주 과정 · 총 12개 강의 · 수료증 제공
            </div>
          </div>
        </div>

        {/* 오른쪽 사이드 */}
        <aside className="bg-white rounded-xl p-6 shadow-lg space-y-6">
          <div className="flex space-x-6 border-b pb-3">
            {["curriculum", "materials", "qna", "notes"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`text-base font-semibold pb-2 ${
                  selectedTab === tab
                    ? "border-b-2 border-green-600 text-green-600"
                    : "text-gray-500"
                }`}
              >
                {
                  {
                    curriculum: "커리큘럼",
                    materials: "학습자료",
                    qna: "Q&A",
                    notes: "노트",
                  }[tab]
                }
              </button>
            ))}
          </div>

          {selectedTab === "curriculum" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">강의 목차</h3>
                <span className="text-sm text-green-600">25% 완료</span>
              </div>
              {lectures.map((section) => (
                <div key={section.id} className="border-t pt-3">
                  <p className="font-medium text-base">{section.section}</p>
                  {section.items?.length ? (
                    <ul className="text-base mt-2 space-y-2">
                      {section.items.map((item) => (
                        <li
                          key={item.id}
                          className="flex justify-between items-center px-3 py-2 rounded cursor-pointer hover:bg-gray-100"
                          onClick={() => handleTimeJump(item.seconds)}
                        >
                          <span>{item.title}</span>
                          <span className="text-sm text-gray-500">
                            {item.time}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400 mt-2">강의 없음</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedTab === "qna" && userId !== null && (
            <QnaTab lectureId={lectureId} userId={userId} />
          )}

          <button className="w-full bg-green-600 text-white py-3 rounded mt-6 hover:bg-green-700 text-lg">
            나의 운동 기록 작성하기
          </button>

          <div className="flex justify-between mt-4">
            <button className="text-base text-gray-500 hover:underline">
              ← 이전 강의
            </button>
            <button className="text-base text-green-600 font-semibold hover:underline">
              다음 강의 →
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default LectureListPage;
