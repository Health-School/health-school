"use client";

import React, { useRef, useState } from "react";

const LectureListPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedTab, setSelectedTab] = useState("curriculum");

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
    {
      id: 2,
      section: "가슴 운동 기초",
      items: [],
    },
    {
      id: 3,
      section: "등 운동 기초",
      items: [],
    },
    {
      id: 4,
      section: "하체 운동 기초",
      items: [],
    },
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
    // 또는: router.push("/chat") 등으로 라우팅 가능
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-3 gap-8">
        {/* 왼쪽 비디오 및 설명 */}
        <div className="col-span-2 space-y-6">
          {/* 영상 */}
          <div className="bg-black aspect-video rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              controls
              className="w-full h-full"
              // 성민님 여기에다가 나중에 s3나 외부 링크로 바꿔주세요!!!!!!!!!@!!@ 여기입니다!!
              src="https://your-s3-or-external-link.com/sample-video.mp4"
            />
          </div>

          {/* 강의 설명 */}
          <div>
            <h1 className="text-2xl font-semibold">
              초보자를 위한 헬스 트레이닝 기초
            </h1>

            <div className="flex items-center space-x-2 mt-1">
              <img
                src="https://via.placeholder.com/40"
                alt="박준혁 트레이너"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="text-sm text-gray-600">
                박준혁 트레이너 · 헬스 트레이닝 전문가
              </div>
            </div>

            <button
              onClick={handleChatClick}
              className="mt-2 bg-green-100 text-green-700 text-sm rounded px-3 py-1 border border-green-300 hover:bg-green-200"
            >
              1:1 대화하기
            </button>
          </div>

          {/* 소개 */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">강의 소개</h2>
            <p className="text-sm text-gray-700">
              이 강의는 헬스 트레이닝을 처음 시작하는 분들을 위한 기초
              과정입니다. 몸과 자세와 호흡법부터 시작하여 주요 근육 그룹별 기초
              운동 방법을 배우게 됩니다. 체계적인 커리큘럼을 통해 부상 없이
              안전하게 운동하는 방법을 익히고, 효과적인 트레이닝 루틴을 구성하는
              방법을 배울 수 있습니다.
            </p>
            <div className="text-xs text-gray-500">
              초급 · 4주 과정 · 총 12개 강의 · 수료증 제공
            </div>
          </div>
        </div>

        {/* 오른쪽 사이드 */}
        <aside className="bg-white rounded-lg p-4 shadow space-y-4">
          {/* 탭 */}
          <div className="flex space-x-4 border-b pb-2">
            {["curriculum", "materials", "qna", "notes"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`text-sm font-medium pb-1 ${
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

          {/* 커리큘럼 */}
          {selectedTab === "curriculum" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">강의 목차</h3>
                <span className="text-xs text-green-600">25% 완료</span>
              </div>

              {lectures.map((section) => (
                <div key={section.id} className="border-t pt-2">
                  <p className="font-medium text-sm">{section.section}</p>
                  {section.items?.length ? (
                    <ul className="text-sm mt-1 space-y-1">
                      {section.items.map((item) => (
                        <li
                          key={item.id}
                          className="flex justify-between items-center px-2 py-1 rounded cursor-pointer hover:bg-gray-100"
                          onClick={() => handleTimeJump(item.seconds)}
                        >
                          <span>{item.title}</span>
                          <span className="text-xs text-gray-500">
                            {item.time}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">강의 없음</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 하단 버튼 */}
          <button className="w-full bg-green-600 text-white py-2 rounded mt-4 hover:bg-green-700">
            나의 운동 기록 작성하기
          </button>

          <div className="flex justify-between mt-2">
            <button className="text-sm text-gray-500 hover:underline">
              ← 이전 강의
            </button>
            <button className="text-sm text-green-600 font-semibold hover:underline">
              다음 강의 →
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default LectureListPage;
