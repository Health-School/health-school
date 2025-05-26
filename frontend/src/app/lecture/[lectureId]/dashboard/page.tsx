"use client";

import React, { useRef, useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import NotificationList from "@/components/notification/NotificationList";
import NotificationModal from "@/components/notification/NotificationModal";
import { Notification } from "@/components/notification/Notification";
import QnaTab from "@/components/qna/QnaTab";

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

export default function LectureDashboard() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedTab, setSelectedTab] = useState("curriculum");
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const params = useParams();
  const lectureId = params.lectureId as string;
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
  const [userId, setUserId] = useState<number | null>(null);

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

      // 평점 등록 후 새로운 평균 점수 가져오기
      await fetchLectureScore();
      setUserScore(score);

      // userScore를 잠깐 보여주고 평균점수로 다시 반영
      setTimeout(() => setUserScore(null), 300);
      alert("평점이 등록되었습니다!");
    } catch (e) {
      alert("평점 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 강의 평점 가져오기 함수 추가
  const fetchLectureScore = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/like?lectureId=${lectureId}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("평점 조회 실패");
      const result = await res.json();

      if (result.success) {
        setLectureData((prev) =>
          prev ? { ...prev, averageScore: result.data.average } : prev
        );
      }
    } catch (error) {
      console.error("평점 조회 실패:", error);
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

      // 평점 정보도 함께 가져오기
      await fetchLectureScore();

      // lastWatchedAt이 있는 강의 중 가장 최근 시청한 강의를 기본 선택
      if (json.data?.curriculumDetailDtoList?.length) {
        const list = json.data.curriculumDetailDtoList;
        const watchedList = list.filter(
          (c: CurriculumDetailDto) => c.lastWatchedAt
        );
        let defaultCurriculum = null;
        if (watchedList.length > 0) {
          defaultCurriculum = watchedList.reduce(
            (a: CurriculumDetailDto, b: CurriculumDetailDto) =>
              new Date(a.lastWatchedAt!) > new Date(b.lastWatchedAt!) ? a : b
          );
        } else {
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

  // 상태 추가
  const [activeTab, setActiveTab] = useState("공지사항");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // 공지사항 가져오는 함수
  const fetchNotifications = async () => {
    console.log("=== 공지사항 API 호출 시작 ===");
    console.log("lectureId:", lectureId);
    console.log("activeTab:", activeTab);

    setIsLoadingNotifications(true);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/lecture/${lectureId}`;
      console.log("API URL:", apiUrl);

      const response = await fetch(apiUrl, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("=== API 응답 분석 ===");
      console.log("전체 응답:", result);
      console.log("result.success:", result.success);
      console.log("result.data:", result.data);
      console.log("result.data 타입:", typeof result.data);
      console.log("result.data.length:", result.data?.length);

      // 조건 확인
      if (result.success) {
        console.log("✅ result.success는 true");
        if (result.data) {
          console.log("✅ result.data 존재");
          console.log("설정할 데이터:", result.data);

          setNotifications(result.data);

          // 상태 설정 직후 확인 (비동기이므로 다음 렌더링에서 확인됨)
          console.log("setNotifications 호출 완료");
        } else {
          console.log("❌ result.data가 없음");
          setNotifications([]);
        }
      } else {
        console.log("❌ result.success가 false");
        console.log("error message:", result.message);
        setNotifications([]);
      }
    } catch (error) {
      console.error("=== API 호출 에러 ===");
      console.error("Error:", error);
      setNotifications([]);
    } finally {
      setIsLoadingNotifications(false);
      console.log("=== API 호출 완료 ===");
    }
  };

  // 공지사항 탭 클릭 시 데이터 로드
  useEffect(() => {
    if (activeTab === "공지사항" && lectureId) {
      fetchNotifications();
    }
  }, [activeTab, lectureId]);

  // 렌더링 시점의 상태 확인
  console.log("렌더링 시점 - activeTab:", activeTab);
  console.log("렌더링 시점 - notifications:", notifications);
  console.log("렌더링 시점 - isLoadingNotifications:", isLoadingNotifications);

  // 상태 변화 감지용 useEffect 추가
  useEffect(() => {
    console.log("🔄 notifications 상태 변경됨:", notifications);
    console.log("notifications.length:", notifications.length);
  }, [notifications]);

  // 단순한 데이터 가져오기 함수
  const testFetchNotifications = async () => {
    try {
      console.log("=== 단순 데이터 가져오기 테스트 ===");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/lecture/${lectureId}`,
        {
          credentials: "include",
        }
      );

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("받아온 데이터:", data);

      return data;
    } catch (error) {
      console.error("에러:", error);
      return null;
    }
  };


  // 유저 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/me`,
          { credentials: "include" }
        );
        if (!response.ok) throw new Error("Failed to fetch user info");
        const data = await response.json();
        setUserId(data.data.id);
      } catch (e) {
        setUserId(null);
      }
    };
    fetchUserInfo();
  }, []);


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
          {/* 탭 - 학습자료 탭 제거 */}
          <div className="flex space-x-6 border-b pb-3">
            {["curriculum", "qna", "notifications"].map((tab) => (
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

          {/* Q&A 탭일 때 QnaTab 보여주기 */}
          {selectedTab === "qna" && userId !== null && (
            <QnaTab lectureId={Number(lectureId)} userId={userId} />
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
}
