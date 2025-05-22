"use client";

import React, { useRef, useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";

interface CurriculumDetailDto {
  curriculumTitle: string;
  sequence: number;
  curriculumContent: string;
  curriculumVideoUrl: string;
  progressRate: number;
  lastWatchedSecond: number | null;
  progressStatus: string;
  completedAt: string | null;
}

interface LectureCurriculumDetailDto {
  curriculumId: number;
  lectureTitle: string;
  lectureContent: string;
  lectureCategory: string;
  lectureLevel: string;
  trainerNickname: string;
  trainerProfileUrl: string;
  trainerCertificationNames: string[];
  curriculumDetailDtoList: CurriculumDetailDto[];
}

const LectureListPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedTab, setSelectedTab] = useState("curriculum");
  const params = useParams();
  const lectureId = params.lectureId;
  const searchParams = useSearchParams();
  const curriculumId = searchParams.get("curriculumId");

  const [lectureData, setLectureData] =
    useState<LectureCurriculumDetailDto | null>(null);
  const [selectedCurriculum, setSelectedCurriculum] =
    useState<CurriculumDetailDto | null>(null);
  const [videoDurations, setVideoDurations] = React.useState<string[]>([]);

  // 데이터 패칭
  useEffect(() => {
    async function fetchLectureDashboard() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectures/${lectureId}/dashboard`,
        {
          credentials: "include",
        }
      );
      const json = await res.json();
      setLectureData(json.data);

      // curriculumId가 있으면 해당 커리큘럼 선택, 없으면 첫 번째 커리큘럼 선택
      if (json.data?.curriculumDetailDtoList?.length) {
        let found = null;
        if (curriculumId) {
          found = json.data.curriculumDetailDtoList.find(
            (c: CurriculumDetailDto) =>
              String(c.sequence) === String(curriculumId)
          );
        }
        setSelectedCurriculum(found || json.data.curriculumDetailDtoList[0]);
      }
    }
    fetchLectureDashboard();
    // eslint-disable-next-line
  }, [lectureId, curriculumId]);

  // 비디오 재생 위치 복원
  useEffect(() => {
    if (
      videoRef.current &&
      selectedCurriculum &&
      selectedCurriculum.lastWatchedSecond &&
      selectedCurriculum.lastWatchedSecond > 0
    ) {
      videoRef.current.currentTime = selectedCurriculum.lastWatchedSecond;
    }
  }, [selectedCurriculum]);

  // 강의 데이터가 바뀔 때마다 모든 영상의 duration을 가져옴
  useEffect(() => {
    if (!lectureData) return;
    const promises = lectureData.curriculumDetailDtoList.map((curriculum) => {
      return new Promise<string>((resolve) => {
        if (!curriculum.curriculumVideoUrl) return resolve("--:--");
        const video = document.createElement("video");
        video.src = curriculum.curriculumVideoUrl;
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          const dur = video.duration;
          if (!isNaN(dur) && isFinite(dur)) {
            const min = Math.floor(dur / 60)
              .toString()
              .padStart(2, "0");
            const sec = Math.floor(dur % 60)
              .toString()
              .padStart(2, "0");
            resolve(`${min}:${sec}`);
          } else {
            resolve("--:--");
          }
        };
        video.onerror = () => resolve("--:--");
      });
    });

    Promise.all(promises).then(setVideoDurations);
  }, [lectureData]);

  if (!lectureData || !selectedCurriculum) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-gray-500">
        강의 정보를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-[1440px] mx-auto px-12 py-12 grid grid-cols-3 gap-12">
        {/* 왼쪽 비디오 및 설명 */}
        <div className="col-span-2 space-y-8">
          {/* 영상 */}
          <div className="bg-black aspect-video rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              controls
              className="w-full h-full"
              src={selectedCurriculum.curriculumVideoUrl}
            />
          </div>

          {/* 강의 설명 */}
          <div>
            <h1 className="text-3xl font-semibold">
              {lectureData.lectureTitle}
            </h1>
            <div className="flex items-center space-x-3 mt-2">
              <img
                src={
                  lectureData.trainerProfileUrl ||
                  "https://via.placeholder.com/40"
                }
                alt={lectureData.trainerNickname}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="text-base text-gray-600">
                {lectureData.trainerNickname} 트레이너
                {lectureData.trainerCertificationNames?.length > 0 && (
                  <span className="ml-2 text-xs text-gray-400">
                    ({lectureData.trainerCertificationNames.join(", ")})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 소개 */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">강의 소개</h2>
            <div
              dangerouslySetInnerHTML={{ __html: lectureData.lectureContent }}
            ></div>
            <div className="text-sm text-gray-500">
              {lectureData.lectureCategory} · {lectureData.lectureLevel}
            </div>
          </div>
        </div>

        {/* 오른쪽 사이드 */}
        <aside className="bg-white rounded-xl p-6 shadow-lg space-y-6">
          {/* 탭 */}
          <div className="flex space-x-6 border-b pb-3">
            {["curriculum", "materials", "qna", "notes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
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

          {/* 커리큘럼 */}
          {selectedTab === "curriculum" && (
            <div className="space-y-2">
              {/* 진도율 바 */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-green-500 text-lg">▶️</span>
                <span className="font-semibold text-gray-700 text-base">
                  진도율
                </span>
                <span className="font-bold text-green-600 text-base">
                  {
                    lectureData.curriculumDetailDtoList.filter(
                      (c) => c.progressStatus === "COMPLETE"
                    ).length
                  }
                </span>
                <span className="text-gray-400 text-base">
                  /{lectureData.curriculumDetailDtoList.length}
                </span>
                {/* 프로그레스 바 */}
                <div className="flex-1 mx-2 h-4 bg-gray-200 rounded-full overflow-hidden min-w-[120px] max-w-[200px]">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{
                      width: `${
                        (lectureData.curriculumDetailDtoList.filter(
                          (c) => c.progressStatus === "COMPLETE"
                        ).length /
                          lectureData.curriculumDetailDtoList.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-gray-500 text-base font-semibold ml-2">
                  {(
                    (lectureData.curriculumDetailDtoList.filter(
                      (c) => c.progressStatus === "COMPLETE"
                    ).length /
                      lectureData.curriculumDetailDtoList.length) *
                    100
                  ).toFixed(2)}
                  %
                </span>
              </div>
              {/* 기존 목차 리스트 */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">강의 목차</h3>
                <span className="text-sm text-green-600">
                  {Math.round(
                    (lectureData.curriculumDetailDtoList.filter(
                      (c) => c.progressStatus === "COMPLETE"
                    ).length /
                      lectureData.curriculumDetailDtoList.length) *
                      100
                  )}
                  % 완료
                </span>
              </div>
              <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white overflow-hidden">
                {lectureData.curriculumDetailDtoList.map((curriculum, idx) => {
                  const isSelected =
                    selectedCurriculum.sequence === curriculum.sequence;
                  const isComplete = curriculum.progressStatus === "COMPLETE";
                  return (
                    <li
                      key={curriculum.sequence}
                      className={`
                        flex items-center px-4 py-3 gap-3 cursor-pointer
                        ${isSelected ? "bg-green-50" : "bg-white"}
                        transition-colors
                      `}
                      onClick={() => setSelectedCurriculum(curriculum)}
                    >
                      {/* 완료 아이콘 */}
                      {isComplete ? (
                        <span className="text-green-500 mr-2 text-xl">✔️</span>
                      ) : (
                        <span className="text-gray-400 mr-2 text-xl">▶️</span>
                      )}
                      {/* 번호 및 제목 */}
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-medium ${
                            isSelected ? "text-green-700" : "text-gray-900"
                          }`}
                        >
                          {idx + 1}. {curriculum.curriculumTitle}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {curriculum.curriculumContent}
                        </div>
                      </div>
                      {/* 재생시간: 실제 영상의 총 시간 */}
                      <div className="ml-4 text-sm text-gray-600 font-mono">
                        {videoDurations[idx] || "--:--"}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* 하단 버튼 */}
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
