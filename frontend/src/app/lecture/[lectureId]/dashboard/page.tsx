"use client";

import React, { useRef, useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import NotificationList from "@/components/notification/NotificationList";
import NotificationModal from "@/components/notification/NotificationModal";
import { Notification } from "@/components/notification/Notification";

interface CurriculumDetailDto {
  curriculumId: number;
  curriculumTitle: string;
  sequence: number;
  curriculumContent: string;
  curriculumVideoUrl: string;
  totalWatchedSeconds: number;
  lastWatchedSecond: number | null;
  progressStatus: string;
  completedAt: string | null;
  lastWatchedAt: string | null;
}

interface LectureCurriculumDetailDto {
  lectureTitle: string;
  lectureContent: string;
  lectureCategory: string;
  lectureLevel: string;
  trainerNickname: string;
  trainerProfileUrl: string;
  trainerCertificationNames: string[];
  averageScore: number;

  curriculumDetailDtoList: CurriculumDetailDto[];
}

// 시청 위치 및 누적 시청 시간 저장 함수
async function saveCurriculumProgress(
  lectureId: number,
  curriculumId: number,
  lastWatchedSecond: number,
  totalWatchedSeconds: number,
  duration: number
) {
  await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/curriculum-progress/${curriculumId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        lectureId,
        lastWatchedSecond,
        totalWatchedSeconds,
        duration,
      }),
    }
  );
}

const LectureListPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedTab, setSelectedTab] = useState("curriculum");
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const params = useParams();
  const lectureId = params.lectureId;
  const searchParams = useSearchParams();
  const curriculumId = searchParams.get("curriculumId");

  const [lectureData, setLectureData] =
    useState<LectureCurriculumDetailDto | null>(null);
  const [selectedCurriculum, setSelectedCurriculum] =
    useState<CurriculumDetailDto | null>(null);
  const [videoDurations, setVideoDurations] = React.useState<string[]>([]);

  // 누적 시청 시간 관리용 state
  const [watchedSeconds, setWatchedSeconds] = useState(0);

  const [hoverScore, setHoverScore] = useState<number | null>(null);
  const [userScore, setUserScore] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 별 클릭 시 서버에 평점 등록
  const handleStarClick = async (score: number) => {
    if (isSubmitting) return;
    if (!lectureId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/like`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            lectureId: Number(lectureId),
            score,
          }),
        }
      );
      if (!res.ok) throw new Error("평점 등록 실패");
      const result = await res.json();
      setUserScore(score);
      // 서버에서 받은 새로운 평균 평점으로 갱신
      setLectureData((prev) =>
        prev ? { ...prev, averageScore: result.data.average } : prev
      );
      // userScore를 잠깐 보여주고 평균점수로 다시 반영
      setTimeout(() => setUserScore(null), 300);
      alert("평점이 등록되었습니다!");
    } catch (e) {
      alert("평점 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

      // lastWatchedAt이 있는 강의 중 가장 최근 시청한 강의를 기본 선택
      if (json.data?.curriculumDetailDtoList?.length) {
        const list = json.data.curriculumDetailDtoList;
        // lastWatchedAt이 있는 강의만 필터
        const watchedList = list.filter(
          (c: CurriculumDetailDto) => c.lastWatchedAt
        );
        let defaultCurriculum = null;
        if (watchedList.length > 0) {
          // 가장 최근(lastWatchedAt이 가장 큰) 강의 선택
          defaultCurriculum = watchedList.reduce(
            (a: CurriculumDetailDto, b: CurriculumDetailDto) =>
              new Date(a.lastWatchedAt!) > new Date(b.lastWatchedAt!) ? a : b
          );
        } else {
          // 없으면 첫 번째 강의 선택
          defaultCurriculum = list[0];
        }
        setSelectedCurriculum(defaultCurriculum);
      }
    }
    fetchLectureDashboard();
    // eslint-disable-next-line
  }, [lectureId]);

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

  // 영상이 재생될 때마다 시청 위치와 누적 시청 시간 저장
  useEffect(() => {
    if (!videoRef.current || !selectedCurriculum) return;

    let lastTime = selectedCurriculum.lastWatchedSecond || 0;
    let totalWatched = selectedCurriculum.totalWatchedSeconds || 0;

    const handleTimeUpdate = () => {
      const current = Math.floor(videoRef.current!.currentTime);
      if (videoRef.current!.paused) return; // 정지 상태에서는 저장하지 않음

      // 누적 시청 시간 계산 (간단 예시: 1초마다 1초씩 증가)
      if (current > lastTime) {
        totalWatched += current - lastTime;
        lastTime = current;
        setWatchedSeconds(totalWatched);
      }
      // 5초마다 서버에 저장 (최적화 가능)
      if (current % 5 === 0) {
        if (lectureId !== undefined) {
          saveCurriculumProgress(
            Number(lectureId),
            selectedCurriculum.curriculumId,
            current,
            totalWatched,
            Math.floor(videoRef.current!.duration)
          );
        }
      }
    };

    // 영상이 끝났을 때도 저장
    const handleEnded = () => {
      const duration = Math.floor(videoRef.current!.duration);
      saveCurriculumProgress(
        Number(lectureId),
        selectedCurriculum.curriculumId,
        duration,
        duration,
        duration
      );
    };

    videoRef.current.addEventListener("timeupdate", handleTimeUpdate);
    videoRef.current.addEventListener("ended", handleEnded);

    return () => {
      videoRef.current?.removeEventListener("timeupdate", handleTimeUpdate);
      videoRef.current?.removeEventListener("ended", handleEnded);
    };
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
          if (!isNaN(dur) && isFinite(dur) && dur > 0) {
            const min = Math.floor(dur / 60)
              .toString()
              .padStart(2, "0");
            const sec = Math.floor(dur % 60)
              .toString()
              .padStart(2, "0");
            resolve(`${min}:${sec}`);
          } else {
            resolve("00:00");
          }
        };
        // duration이 바로 로드되는 경우도 처리
        setTimeout(() => {
          if (
            video.readyState >= 1 &&
            !isNaN(video.duration) &&
            isFinite(video.duration) &&
            video.duration > 0
          ) {
            const min = Math.floor(video.duration / 60)
              .toString()
              .padStart(2, "0");
            const sec = Math.floor(video.duration % 60)
              .toString()
              .padStart(2, "0");
            resolve(`${min}:${sec}`);
          }
        }, 300);
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

          {/* 강의 정보 상단에 평점 표시 예시 */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-base">평점</span>
            <span className="flex items-center">
              {Array.from({ length: 5 }).map((_, idx) => {
                const score =
                  hoverScore ?? userScore ?? lectureData.averageScore ?? 0;
                // 별 색상 결정
                if (score >= idx + 1) {
                  // 꽉 찬 별
                  return (
                    <svg
                      key={idx}
                      className="w-5 h-5 cursor-pointer transition text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      onMouseEnter={() => setHoverScore(idx + 1)}
                      onMouseLeave={() => setHoverScore(null)}
                      onClick={() => handleStarClick(idx + 1)}
                      style={{ pointerEvents: isSubmitting ? "none" : "auto" }}
                    >
                      <title>{`${idx + 1}점`}</title>
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                    </svg>
                  );
                } else if (score > idx && score < idx + 1) {
                  // 반 별
                  return (
                    <svg
                      key={idx}
                      className="w-5 h-5 cursor-pointer transition"
                      viewBox="0 0 20 20"
                      onMouseEnter={() => setHoverScore(idx + 1)}
                      onMouseLeave={() => setHoverScore(null)}
                      onClick={() => handleStarClick(idx + 1)}
                      style={{ pointerEvents: isSubmitting ? "none" : "auto" }}
                    >
                      <title>{`${idx + 1}점`}</title>
                      <defs>
                        <linearGradient
                          id={`half${idx}`}
                          x1="0"
                          x2="100%"
                          y1="0"
                          y2="0"
                        >
                          <stop offset="50%" stopColor="#facc15" />
                          <stop offset="50%" stopColor="#d1d5db" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z"
                        fill={`url(#half${idx})`}
                      />
                    </svg>
                  );
                } else {
                  // 빈 별
                  return (
                    <svg
                      key={idx}
                      className="w-5 h-5 cursor-pointer transition text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      onMouseEnter={() => setHoverScore(idx + 1)}
                      onMouseLeave={() => setHoverScore(null)}
                      onClick={() => handleStarClick(idx + 1)}
                      style={{ pointerEvents: isSubmitting ? "none" : "auto" }}
                    >
                      <title>{`${idx + 1}점`}</title>
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                    </svg>
                  );
                }
              })}
              <span className="ml-1 text-sm text-gray-600">
                {Number.isFinite(lectureData.averageScore)
                  ? lectureData.averageScore.toFixed(1)
                  : "-"}
              </span>
            </span>
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
            {["curriculum", "materials", "qna", "notifications"].map((tab) => (
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
                    notifications: "공지사항",
                  }[tab]
                }
              </button>
            ))}
          </div>

          {/* 공지사항 탭일 때 리스트 보여주기 */}
          {selectedTab === "notifications" && (
            <NotificationList
              lectureId={String(lectureId)}
              onSelect={setSelectedNotification}
            />
          )}

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
                      (c) => c.progressStatus === "COMPLETED"
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
                          (c) => c.progressStatus === "COMPLETED"
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
                      (c) => c.progressStatus === "COMPLETED"
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
                      (c) => c.progressStatus === "COMPLETED"
                    ).length /
                      lectureData.curriculumDetailDtoList.length) *
                      100
                  )}
                  % 완료
                </span>
              </div>
              {/* 스크롤 가능한 목차 리스트 */}
              <div className="max-h-[550px] overflow-y-auto rounded-lg border border-gray-200 bg-white">
                <ul className="divide-y divide-gray-100">
                  {lectureData.curriculumDetailDtoList.map(
                    (curriculum, idx) => {
                      const isSelected =
                        selectedCurriculum.sequence === curriculum.sequence;
                      const isComplete =
                        curriculum.progressStatus === "COMPLETED";
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
                            <span className="text-green-500 mr-2 text-xl">
                              ✔️
                            </span>
                          ) : (
                            <span className="text-gray-400 mr-2 text-xl">
                              ▶️
                            </span>
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
                          {/* 재생시간 */}
                          <div className="ml-4 text-sm text-gray-600 font-mono">
                            {videoDurations[idx] || "--:--"}
                          </div>
                        </li>
                      );
                    }
                  )}
                </ul>
              </div>
            </div>
          )}
        </aside>

        {/* 공지사항 상세 모달 */}
        {selectedNotification && (
          <NotificationModal
            notification={selectedNotification}
            onClose={() => setSelectedNotification(null)}
          />
        )}
      </main>
    </div>
  );
};

export default LectureListPage;
