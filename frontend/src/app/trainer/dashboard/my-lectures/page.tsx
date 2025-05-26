"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import removeMarkdown from "remove-markdown";
import { responseCookiesToRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

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

// Update ApiResponse interface
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

// Update the interface to match actual data
interface Stats {
  totalStudents: number;
  completionRate: number;
  averageRating: number;
  totalRevenue: number;
}

// Add near other interfaces
interface Notification {
  id: number;
  title: string;
  content: string;
  lectureName: string;
  createdAt: string;
}

// Add detailed notification interface
interface NotificationDetail {
  id: number;
  title: string;
  content: string;
  lectureName: string;
  createdAt: string;
}

// Add these interfaces at the top with other interfaces
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
  const [activeTab, setActiveTab] = useState("내 정보");
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    completionRate: 0, // 기본값 0
    averageRating: 4.8,
    totalRevenue: 1850000,
  });

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Add state for consultation notification
  const [hasNewConsultation, setHasNewConsultation] = useState(false);

  // 상태 정의 부분에 notifications 추가
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Add these state variables
  const [notificationPage, setNotificationPage] = useState(0);
  const [notificationTotalPages, setNotificationTotalPages] = useState(0);

  // Add state for notification modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationDetail | null>(null);

  // Add these state variables in the component
  const [certifications, setCertifications] = useState<UserCertification[]>([]);
  const [certificationPage, setCertificationPage] = useState(0);
  const [totalCertificationPages, setTotalCertificationPages] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleNewLecture = () => {
    router.push("/trainer/dashboard/my-lectures/new");
  };

  // Update fetchLectures function
  const fetchLectures = async (page: number = 0) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectures?page=${page}&size=10`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("강의 목록 조회에 실패했습니다.");
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

  // Add function to fetch total students count
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

  // Add fetchTotalRevenue function
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
          totalRevenue: result.data.total, // Use the total from settlement summary
        }));
      }
    } catch (error) {
      console.error("총 수익 조회 실패:", error);
    }
  };

  // Add function to check for new consultations
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

      // Filter consultations for today or future dates
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

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

  // fetchNotifications 함수 수정
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
      console.log("Notifications response:", result); // 디버깅용
      if (result.success) {
        setNotifications(result.data);
        setNotificationPage(page);
        setNotificationTotalPages(result.totalPages || 1);
      }
    } catch (error) {
      console.error("공지사항 조회 실패:", error);
    }
  };

  // Add function to open notification modal
  const openNotificationModal = (notification: NotificationDetail) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  // Add function to close notification modal
  const closeNotificationModal = () => {
    setSelectedNotification(null);
    setIsModalOpen(false);
  };

  // 수료율 가져오기
  const fetchCompletionRate = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectureUsers/completion-rate`,
        { credentials: "include" }
      );
      if (!response.ok) throw new Error("수료율 조회 실패");
      const result = await response.json();
      if (result.success && result.data) {
        // result.data가 "85%" 형태라면 숫자만 추출
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

  // Add this function to fetch certifications
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

  // Add useEffect to fetch certifications
  useEffect(() => {
    if (activeTab === "MY 자격증 관리") {
      fetchCertifications();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchLectures();
    fetchTotalStudents();
    fetchTotalRevenue();
    checkNewConsultations();
    fetchNotifications();
    fetchCompletionRate(); // 수료율도 패칭
  }, []);

  const tabs = [
    { name: "MY 강의 관리", href: "/trainer/dashboard/my-lectures" },
    { name: "정산 내역", href: "/trainer/dashboard/settlements" },
    { name: "수강생 관리", href: "/trainer/dashboard/students" },
    { name: "상담 일정", href: "/trainer/dashboard/consultations" },
    { name: "운동 기구 신청", href: "/trainer/dashboard/equipments" },
    { name: "MY 자격증 관리", href: "/trainer/dashboard/certificates" },
  ];

  // Add function to handle "모두 보기" click
  const handleViewAllQnA = () => {
    // Store the active tab in localStorage before navigation
    localStorage.setItem("activeTab", "qna");
    // Navigate to students page
    router.push("/trainer/dashboard/students");
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 탭 메뉴 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={`${
                pathname === tab.href
                  ? "text-green-500 border-b-2 border-green-500 font-semibold"
                  : "text-gray-500 border-transparent border-b-2 font-medium"
              } py-4 px-2 hover:text-green-700 transition-colors`}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-gray-600">총 수강생</span>
            <div className="flex items-center text-xs text-green-500"></div>
          </div>
          <div className="text-2xl font-bold">{stats.totalStudents}명</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-gray-600">수료율</span>
            <div className="flex items-center text-xs text-green-500"></div>
          </div>
          <div className="text-2xl font-bold">{stats.completionRate}%</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-gray-600">평균 평점</span>
            <div className="flex items-center text-xs text-green-500"></div>
          </div>
          <div className="text-2xl font-bold">{stats.averageRating}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-gray-600">총 수익</span>
            <div className="flex items-center text-xs text-green-500"></div>
          </div>
          <div className="text-2xl font-bold">
            {stats.totalRevenue.toLocaleString()}원
          </div>
        </div>
      </div>

      {/* 공지사항 섹션 */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-500">✓</span>
              </span>
              <span className="text-gray-700">
                답변을 기다리는 질문이 있습니다
              </span>
            </div>
            <button
              onClick={handleViewAllQnA}
              className="text-green-500 hover:text-green-600"
            >
              모두 보기
            </button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-500">!</span>
              </span>
              <span className="text-gray-700">
                {hasNewConsultation
                  ? "새로운 상담 일정이 잡혔습니다"
                  : "새로운 상담 일정이 없습니다"}
              </span>
            </div>
            {hasNewConsultation && (
              <button
                onClick={() => router.push("/trainer/dashboard/consultations")}
                className="text-blue-500 hover:text-blue-600"
              >
                모두 보기
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 공지사항 목록 섹션 - MOVED HERE */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">최근 공지사항</h2>
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-600">
                        {new Date(notification.createdAt).toLocaleDateString(
                          "ko-KR"
                        )}
                      </span>
                      <span className="text-sm text-blue-600">
                        {notification.lectureName}
                      </span>
                    </div>
                    <div className="text-gray-800">{notification.title}</div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedNotification(notification);
                      setIsModalOpen(true);
                    }}
                    className="text-green-500 hover:text-green-600"
                  >
                    상세보기
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                등록된 공지사항이 없습니다.
              </div>
            )}
          </div>
          {notificationTotalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              <button
                onClick={() =>
                  fetchNotifications(Math.max(0, notificationPage - 1))
                }
                disabled={notificationPage === 0}
                className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
              >
                이전
              </button>
              <span className="px-3 py-1">
                {notificationPage + 1} / {notificationTotalPages}
              </span>
              <button
                onClick={() =>
                  fetchNotifications(
                    Math.min(notificationTotalPages - 1, notificationPage + 1)
                  )
                }
                disabled={notificationPage === notificationTotalPages - 1}
                className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
              >
                다음
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 강의 목록 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">클래스 목록</h2>
          <button
            onClick={handleNewLecture}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            + 새 클래스 등록
          </button>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {lectures.map((lecture) => (
            <div
              key={lecture.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{lecture.title}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {removeMarkdown(lecture.content)}
                </p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {lecture.lectureLevel}
                    {/* {lecture.lectureLevel === "BEGINNER"
                      ? "초급"
                      : lecture.lectureLevel === "INTERMEDIATE"
                      ? "중급"
                      : "고급"} */}
                  </span>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    {lecture.lectureStatus === "OPEN" ? "운영중" : "준비중"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">
                    {lecture.price.toLocaleString()}원
                  </span>
                  <button
                    onClick={() => router.push(`/lecture/manage/${lecture.id}`)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    관리하기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => fetchLectures(i)}
                className={`px-3 py-1 rounded ${
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

      {/* Notification Modal */}
      <NotificationModal
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={closeNotificationModal}
      />

      {/* Add ImageModal component here if needed */}
    </div>
  );
}

// Add this component in the same file, before MyLecturesPage
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
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl z-10">
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

// Add this component for the image modal
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
