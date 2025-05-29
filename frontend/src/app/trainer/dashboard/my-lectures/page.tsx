"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import removeMarkdown from "remove-markdown";
import TrainerDashboardSidebar from "@/components/dashboard/TrainerDashboardSidebar";

// 기존 인터페이스들은 그대로 유지...
interface LectureStats {
  totalStudents: number;
  completionRate: number;
  averageRating: number;
  totalRevenue: number;
}

interface Lecture {
  id: number;
  title: string;
  content: string;
  price: number;
  lectureStatus: string;
  lectureLevel: string;
  trainerName: string;
}

interface LecturePage {
  content: Lecture[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: {
    content: Lecture[];
    pageable: {
      pageNumber: number;
      pageSize: number;
    };
    totalPages: number;
    totalElements: number;
    last: boolean;
  };
}

interface Stats {
  totalStudents: number;
  completionRate: number;
  averageRating: number;
  totalRevenue: number;
}

interface Notification {
  id: number;
  title: string;
  content: string;
  lectureName: string;
  createdAt: string;
}

interface NotificationDetail {
  id: number;
  title: string;
  content: string;
  lectureName: string;
  createdAt: string;
}

interface UserCertification {
  certificationId: number;
  certificationName: string;
  approveStatus: "PENDING" | "APPROVED" | "REJECTED";
  imageUrl: string;
  acquisitionDate: string;
  expirationDate: string;
  adminComment: string | null;
}

interface CertificationPage {
  content: UserCertification[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export default function MyLecturesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    completionRate: 0,
    averageRating: 4.8,
    totalRevenue: 1850000,
  });

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNewConsultation, setHasNewConsultation] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationPage, setNotificationPage] = useState(0);
  const [notificationTotalPages, setNotificationTotalPages] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationDetail | null>(null);
  const [certifications, setCertifications] = useState<UserCertification[]>([]);
  const [certificationPage, setCertificationPage] = useState(0);
  const [totalCertificationPages, setTotalCertificationPages] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [myLecturesAverageScore, setMyLecturesAverageScore] =
    useState<number>(0);

  const handleNewLecture = () => {
    router.push("/trainer/dashboard/my-lectures/new");
  };

  const fetchLectures = async (page: number = 0) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectures/my?page=${page}&size=10`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("강의 목록 조회에 실패했습니다!");
      }

      const apiResponse: ApiResponse<LecturePage> = await response.json();
      console.log("API Response:", apiResponse);

      if (apiResponse.success && apiResponse.data) {
        const { content, totalPages, pageable } = apiResponse.data;
        setLectures(content);
        setTotalPages(totalPages);
        setCurrentPage(pageable.pageNumber);
      }
    } catch (error) {
      console.error("강의 목록 조회 오류:", error);
    }
  };

  const fetchTotalStudents = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectureUsers/students`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("수강생 수 조회에 실패했습니다.");
      }

      const result = await response.json();
      if (result.success) {
        setStats((prev) => ({
          ...prev,
          totalStudents: result.data.totalElements,
        }));
      }
    } catch (error) {
      console.error("수강생 수 조회 실패:", error);
    }
  };

  const fetchTotalRevenue = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/orders/summary`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("총 수익 조회에 실패했습니다.");
      }

      const result = await response.json();
      if (result.success) {
        setStats((prev) => ({
          ...prev,
          totalRevenue: result.data.total,
        }));
      }
    } catch (error) {
      console.error("총 수익 조회 실패:", error);
    }
  };

  const checkNewConsultations = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/schedules/trainer`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("상담 일정 조회에 실패했습니다.");
      }

      const result = await response.json();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const futureConsultations = result.data.filter((schedule: any) => {
        const scheduleDate = new Date(schedule.desiredDate);
        scheduleDate.setHours(0, 0, 0, 0);
        return scheduleDate >= today;
      });

      setHasNewConsultation(futureConsultations.length > 0);
    } catch (error) {
      console.error("상담 일정 조회 실패:", error);
    }
  };

  const fetchNotifications = async (page: number = 0) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications?page=${page}&size=10`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("공지사항 조회 실패");
      }

      const result = await response.json();
      console.log("Notifications response:", result);
      if (result.success) {
        setNotifications(result.data);
        setNotificationPage(page);
        setNotificationTotalPages(result.totalPages || 1);
      }
    } catch (error) {
      console.error("공지사항 조회 실패:", error);
    }
  };

  const openNotificationModal = (notification: NotificationDetail) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  const closeNotificationModal = () => {
    setSelectedNotification(null);
    setIsModalOpen(false);
  };

  const fetchCompletionRate = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectureUsers/completion-rate`,
        { credentials: "include" }
      );
      if (!response.ok) throw new Error("수료율 조회 실패");
      const result = await response.json();
      if (result.success && result.data) {
        const rate = parseFloat(result.data.replace("%", ""));
        setStats((prev) => ({
          ...prev,
          completionRate: rate,
        }));
      }
    } catch (e) {
      console.error("수료율 조회 실패:", e);
    }
  };

  const fetchCertifications = async (page: number = 0) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/usercertifications/me?page=${page}&size=10`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("자격증 목록 조회에 실패했습니다.");
      }

      const result = await response.json();
      setCertifications(result.content);
      setTotalCertificationPages(result.totalPages);
      setCertificationPage(page);
    } catch (error) {
      console.error("자격증 목록 조회 실패:", error);
    }
  };

  const fetchMyLecturesAverageScore = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/like/my-lectures/average`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("평균 평점 조회 실패");
      }

      const result = await response.json();
      if (result.success) {
        setMyLecturesAverageScore(result.data.average);
      }
    } catch (error) {
      console.error("평균 평점 조회 실패:", error);
    }
  };

  const handleViewAllQnA = () => {
    localStorage.setItem("activeTab", "qna");
    router.push("/trainer/dashboard/students");
  };

  useEffect(() => {
    fetchLectures();
    fetchTotalStudents();
    fetchTotalRevenue();
    checkNewConsultations();
    fetchNotifications();
    fetchCompletionRate();
    fetchMyLecturesAverageScore();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 사이드바 */}
      <TrainerDashboardSidebar />

      {/* 메인 컨텐츠 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* 페이지 제목 */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                MY 강의 관리
              </h1>
              <p className="text-gray-600">강의 현황을 확인하고 관리하세요.</p>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-2xl">👥</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      전체 수강생
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalStudents}명
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-2xl">💰</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">총 수익</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalRevenue.toLocaleString()}원
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-2xl">📊</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">완료율</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.completionRate}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-600 text-2xl">⭐</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      평균 평점
                    </p>
                    <div className="flex items-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {myLecturesAverageScore.toFixed(1)}
                      </p>
                      <span className="text-sm text-gray-500 ml-1">/5.0</span>
                    </div>
                    <div className="flex items-center mt-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${
                            i < Math.floor(myLecturesAverageScore)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 알림 섹션 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-500 text-lg">✓</span>
                    </div>
                    <span className="text-gray-700 font-medium">
                      답변을 기다리는 질문이 있습니다
                    </span>
                  </div>
                  <button
                    onClick={handleViewAllQnA}
                    className="text-green-500 hover:text-green-600 font-medium"
                  >
                    모두 보기
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-500 text-lg">!</span>
                    </div>
                    <span className="text-gray-700 font-medium">
                      {hasNewConsultation
                        ? "새로운 상담 일정이 잡혔습니다"
                        : "새로운 상담 일정이 없습니다"}
                    </span>
                  </div>
                  {hasNewConsultation && (
                    <button
                      onClick={() =>
                        router.push("/trainer/dashboard/consultations")
                      }
                      className="text-blue-500 hover:text-blue-600 font-medium"
                    >
                      모두 보기
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 공지사항 목록 섹션 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  최근 공지사항
                </h2>
                <div className="space-y-4">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-gray-600">
                              {new Date(
                                notification.createdAt
                              ).toLocaleDateString("ko-KR")}
                            </span>
                            <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                              {notification.lectureName}
                            </span>
                          </div>
                          <div className="text-gray-800 font-medium">
                            {notification.title}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedNotification(notification);
                            setIsModalOpen(true);
                          }}
                          className="text-green-500 hover:text-green-600 font-medium"
                        >
                          상세보기
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      등록된 공지사항이 없습니다.
                    </div>
                  )}
                </div>

                {notificationTotalPages > 1 && (
                  <div className="flex justify-center mt-6 gap-2">
                    <button
                      onClick={() =>
                        fetchNotifications(Math.max(0, notificationPage - 1))
                      }
                      disabled={notificationPage === 0}
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      이전
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-700">
                      {notificationPage + 1} / {notificationTotalPages}
                    </span>
                    <button
                      onClick={() =>
                        fetchNotifications(
                          Math.min(
                            notificationTotalPages - 1,
                            notificationPage + 1
                          )
                        )
                      }
                      disabled={notificationPage === notificationTotalPages - 1}
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      다음
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 강의 목록 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    클래스 목록
                  </h2>
                  <button
                    onClick={handleNewLecture}
                    className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center space-x-2 cursor-pointer"
                  >
                    <span>+</span>
                    <span>새 클래스 등록</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lectures.map((lecture) => (
                    <div
                      key={lecture.id}
                      className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
                    >
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                          {lecture.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {removeMarkdown(lecture.content)}
                        </p>

                        {/* 강의 상태 및 레벨 표시 부분 수정 */}
                        <div className="flex justify-between items-center mb-4">
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium ${
                              lecture.lectureLevel === "초급"
                                ? "bg-green-100 text-green-800"
                                : lecture.lectureLevel === "중급"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {lecture.lectureLevel}
                          </span>
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium ${
                              lecture.lectureStatus === "진행중"
                                ? "bg-blue-100 text-blue-800"
                                : lecture.lectureStatus === "예정"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {lecture.lectureStatus}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-gray-900">
                            {lecture.price.toLocaleString()}원
                          </span>
                          <button
                            onClick={() =>
                              router.push(`/lecture/manage/${lecture.id}`)
                            }
                            className="text-green-600 hover:text-green-700 font-medium cursor-pointer"
                          >
                            관리하기
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => fetchLectures(i)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          currentPage === i
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={closeNotificationModal}
      />
    </div>
  );
}

// 모달 컴포넌트들
const NotificationModal = ({
  notification,
  isOpen,
  onClose,
}: {
  notification: NotificationDetail | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !notification) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{notification.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span>
              {new Date(notification.createdAt).toLocaleDateString("ko-KR")}
            </span>
            <span className="text-blue-600">{notification.lectureName}</span>
          </div>
          <div className="text-gray-800 whitespace-pre-wrap">
            {notification.content}
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-100 text-gray-600 px-4 py-2 rounded hover:bg-gray-200"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

const ImageModal = ({ url, onClose }: { url: string; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative max-w-4xl max-h-[90vh] overflow-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-xl hover:text-gray-300"
        >
          ✕
        </button>
        <img src={url} alt="자격증" className="max-w-full h-auto" />
      </div>
    </div>
  );
};
