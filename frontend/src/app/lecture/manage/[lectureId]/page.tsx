"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useEffect, useState } from "react";
import CurriculumUploadModal from "@/components/CurriculumUploadModal"; // 앞서 안내한 모달 컴포넌트
import Image from "next/image";
import removeMarkdown from "remove-markdown";
import { useRouter } from "next/navigation"; // 상단에 import 추가
import NotificationCreateModal from "@/components/NotificationCreateModal"; // Add import at the top
import NotificationEditModal from "@/components/NotificationEditModal"; // Add import for edit modal
import { useGlobalLoginUser } from "@/stores/auth/loginUser";
import CurriculumEditModal from "@/components/CurriculumEditModal"; // Add this import
// 강의 상세 DTO
interface LectureDetailDto {
  id: number;
  title: string;
  content: string;
  price: number;
  lectureStatus: "예정" | "진행중" | "완강";
  lectureStatusDescription: string;
  lectureLevel: string;
  trainerName: string;
  trainerProfileImageUrl: string;
  categoryName: string;
  coverImageUrl: string;
  averageScore: number;
  createdAt: string;
}

// 커리큘럼(소강의) DTO
interface CurriculumDto {
  id: number;
  title: string;
  content: string;
  s3path: string;
  lectureTitle: string;
  trainerNickname: string;
  sequence: number; // Add this field
}

interface LectureRequestDto {
  title: string;
  content: string;
  price: number;
  lectureLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  lectureStatus: "PLANNED" | "ONGOING" | "COMPLETED"; // Updated to match backend enum
  categoryName: string;
}

// Add this interface near other interfaces
interface LectureCategory {
  id: number;
  categoryName: string;
  description: string;
}

// Add this interface with other interfaces
interface NotificationDto {
  id: number;
  title: string;
  content: string;
  lectureName: string;
  createdAt: string;
}

// Add this interface with other interfaces
interface StudentEnrollmentDto {
  id: number;
  userName: string;
  userEmail: string;
  enrolledAt: string;
  progress: number;
}

// Update the interface to match the backend DTO
interface UserLectureDto {
  id: number;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
}

// Add these interfaces
interface QnaBoardResponseDto {
  id: number;
  title: string;
  content: string;
  lectureId: number;
  lectureTitle: string;
  userId: number;
  username: string;
  openStatus: "OPEN" | "CLOSED"; // Update to match backend enum
  createdDate: string;
  updatedDate: string;
}

interface QnaPageResponse {
  content: QnaBoardResponseDto[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

// Update CommentResponseDto interface
interface CommentResponseDto {
  id: number;
  content: string;
  userId: number;
  userNickname: string; // Changed from username
  qnaBoardId: number;
  createdAt: string; // Changed from createdDate
  updatedAt: string; // Changed from updatedDate
  parentCommentId: number | null;
  childComments: CommentResponseDto[];
}

const LECTURE_STATUS = {
  예정: "예정",
  진행중: "진행중",
  완강: "완강",
} as const;

// Add this constant for status colors
const STATUS_STYLES = {
  예정: "bg-yellow-100 text-yellow-800",
  진행중: "bg-green-100 text-green-800",
  완강: "bg-blue-100 text-blue-800",
} as const;

// Add status mapping constant
const STATUS_MAPPING = {
  예정: "PLANNED",
  진행중: "ONGOING",
  완강: "COMPLETED",
} as const;

// Add this constant for level mapping
const LEVEL_MAPPING = {
  초급: "BEGINNER",
  중급: "INTERMEDIATE",
  고급: "ADVANCED",
} as const;

const REVERSE_LEVEL_MAPPING = {
  BEGINNER: "초급",
  INTERMEDIATE: "중급",
  ADVANCED: "고급",
} as const;

export default function LectureManagePage({
  params,
}: {
  params: { lectureId: string };
}) {
  const router = useRouter();
  const lectureIdRef = useState(params.lectureId)[0]; // Create a stable reference

  const [lecture, setLecture] = useState<LectureDetailDto | null>(null);
  const [curriculums, setCurriculums] = useState<CurriculumDto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("강의 목록");
  const [editorContent, setEditorContent] = useState(lecture?.content || "");
  // Add this state in the component
  const [categories, setCategories] = useState<LectureCategory[]>([]);
  // Add this state with other states
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  // Add state for notification modal
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  // Add new state for selected notification
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationDto | null>(null);
  // Add state for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNotification, setEditingNotification] =
    useState<NotificationDto | null>(null);
  // Add state for students
  const [students, setStudents] = useState<UserLectureDto[]>([]);
  // Add new state for search
  const [searchQuery, setSearchQuery] = useState("");
  // Add these states to your component
  const [qnaList, setQnaList] = useState<QnaBoardResponseDto[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  // Add pagination state
  const [qnaPageSize] = useState(10);
  const [qnaTotalElements, setQnaTotalElements] = useState(0);
  // Add new state for selected QnA
  const [selectedQna, setSelectedQna] = useState<QnaBoardResponseDto | null>(
    null
  );
  // Add state for comments
  const [qnaComments, setQnaComments] = useState<CommentResponseDto[]>([]);
  // Add new state for editing comment
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  // Add state for editing curriculum
  const [editingCurriculum, setEditingCurriculum] =
    useState<CurriculumDto | null>(null);
  const { isLogin, loginUser, logoutAndHome, isLoginUserPending } =
    useGlobalLoginUser();

  // Update all API calls to use lectureIdRef
  useEffect(() => {
    // Fetch lecture details
    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectures/${lectureIdRef}`,
      {
        credentials: "include",
      }
    )
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          setLecture(response.data);
        }
      })
      .catch((error) => console.error("강의 조회 실패:", error));

    // Fetch curriculums
    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/curriculums/lecture/${lectureIdRef}`,
      {
        credentials: "include",
      }
    )
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          setCurriculums(response.data);
        }
      })
      .catch((error) => console.error("커리큘럼 조회 실패:", error));

    // Update categories fetch to use the correct endpoint
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lecture_categories`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          setCategories(response.data);
        }
      })
      .catch((error) => console.error("카테고리 조회 실패:", error));

    // Fetch notifications
    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/lecture/${lectureIdRef}`,
      {
        credentials: "include",
      }
    )
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          setNotifications(response.data);
        }
      })
      .catch((error) => console.error("공지사항 조회 실패:", error));

    // Fetch students
    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectureUsers/${lectureIdRef}/users`,
      {
        credentials: "include",
      }
    )
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          setStudents(response.data);
        }
      })
      .catch((error) => console.error("수강생 목록 조회 실패:", error));

    // Add this effect for fetching QnA
    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/qna/${lectureIdRef}/qnas?page=${currentPage}&size=${qnaPageSize}`,
      {
        credentials: "include",
      }
    )
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          const pageData = response.data;
          setQnaList(pageData.content);
          setTotalPages(pageData.totalPages);
          setQnaTotalElements(pageData.totalElements);
        }
      })
      .catch((error) => console.error("QnA 목록 조회 실패:", error));
  }, [lectureIdRef, currentPage, qnaPageSize]);

  // Update the updateLectureStatus function
  const updateLectureStatus = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectures/${lectureIdRef}/status`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({}), // Add empty body for PATCH request
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // Refresh lecture data after successful status update
        const updatedResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectures/${lectureIdRef}`,
          {
            credentials: "include",
          }
        );
        const updatedData = await updatedResponse.json();
        if (updatedData.success) {
          setLecture(updatedData.data);
        }
      }
    } catch (error) {
      console.error("강의 상태 변경 실패:", error);
      alert("강의 상태 변경에 실패했습니다.");
    }
  };

  const updateLecture = async (data: LectureRequestDto) => {
    try {
      const mappedData = {
        ...data,
        lectureStatus: STATUS_MAPPING[lecture?.lectureStatus || "예정"],
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectures/${lectureIdRef}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(mappedData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        alert("강의가 성공적으로 수정되었습니다.");
        // Fetch updated lecture data immediately
        const updatedResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectures/${lectureIdRef}`,
          {
            credentials: "include",
          }
        );
        const updatedData = await updatedResponse.json();
        if (updatedData.success) {
          setLecture(updatedData.data);
          sessionStorage.setItem("activeTab", "클래스 관리");
          router.refresh();
        }
      }
    } catch (error) {
      console.error("강의 수정 실패:", error);
      alert("강의 수정에 실패했습니다.");
    }
  };

  // Add this to your useEffect to check for stored tab
  useEffect(() => {
    const storedTab = sessionStorage.getItem("activeTab");
    if (storedTab) {
      setActiveTab(storedTab);
      sessionStorage.removeItem("activeTab");
    }
  }, []);

  // Add delete handler function
  const handleDeleteNotification = async (notificationId: number) => {
    if (!confirm("정말로 이 공지사항을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/${notificationId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("공지사항 삭제 실패");
      }

      const result = await response.json();
      if (result.success) {
        alert("공지사항이 삭제되었습니다.");
        // Refresh notifications list
        const updatedResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/lecture/${lectureIdRef}`,
          {
            credentials: "include",
          }
        );
        const updatedData = await updatedResponse.json();
        if (updatedData.success) {
          setNotifications(updatedData.data);
        }
      }
    } catch (error) {
      console.error("공지사항 삭제 실패:", error);
      alert("공지사항 삭제에 실패했습니다.");
    }
  };

  // Add search filter function
  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add fetchComments function
  const fetchComments = async (qnaBoardId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/comment/qna/${qnaBoardId}/my-comments`,
        {
          credentials: "include",
        }
      );
      const result = await response.json();
      if (result.success) {
        setQnaComments(result.data);
      }
    } catch (error) {
      console.error("댓글 조회 실패:", error);
    }
  };

  // Update the handleCommentSubmit function
  const handleCommentSubmit = async (
    qnaBoardId: number,
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const form = event.currentTarget;
    const content = (form.elements.namedItem("content") as HTMLTextAreaElement)
      .value;

    if (!content.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/comment`,
        {
          method: "POST",
          credentials: "include", // 이 옵션으로 인해 쿠키의 인증 정보가 전송됨
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
            qnaboardId: qnaBoardId,
            parentCommentId: null,
            userId: loginUser?.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("댓글 등록 실패");
      }

      const result = await response.json();
      if (result.success) {
        (form.elements.namedItem("content") as HTMLTextAreaElement).value = "";
        // Refresh comments
        await fetchComments(qnaBoardId);
      }
    } catch (error) {
      console.error("댓글 등록 실패:", error);
      alert("댓글 등록에 실패했습니다.");
    }
  };

  // Add delete comment handler function
  const handleDeleteComment = async (commentId: number, qnaBoardId: number) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/comment/${commentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("댓글 삭제 실패");
      }

      const result = await response.json();
      if (result.success) {
        alert("댓글이 삭제되었습니다.");
        // Refresh comments after deletion
        await fetchComments(qnaBoardId);
      }
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  // Add comment update handler
  const handleUpdateComment = async (
    commentId: number,
    qnaBoardId: number,
    content: string
  ) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/comment/${commentId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
            qnaboardId: qnaBoardId,
            parentCommentId: null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("댓글 수정 실패");
      }

      const result = await response.json();
      if (result.success) {
        alert("댓글이 수정되었습니다.");
        setEditingCommentId(null);
        // Refresh comments
        await fetchComments(qnaBoardId);
      }
    } catch (error) {
      console.error("댓글 수정 실패:", error);
      alert("댓글 수정에 실패했습니다.");
    }
  };

  // Update VideoPlayerModal component
  const VideoPlayerModal = ({
    s3path,
    title,
    onClose,
  }: {
    s3path: string;
    title: string;
    onClose: () => void;
  }) => {
    // Add S3 base URL
    const videoUrl = s3path.startsWith("http")
      ? s3path
      : `${process.env.NEXT_PUBLIC_S3_BASE_URL}/${s3path}`;

    return (
      <div className="fixed inset-0 z-50">
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        <div className="relative z-10 max-w-4xl mx-auto mt-20 bg-white rounded-lg shadow-xl">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-medium">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="aspect-video">
            <video
              className="w-full h-full"
              controls
              autoPlay
              src={videoUrl}
              onError={(e) => {
                console.error("Video loading error:", e);
                alert("비디오를 불러오는데 실패했습니다.");
              }}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    );
  };

  // Add state for video player
  const [selectedVideo, setSelectedVideo] = useState<{
    s3path: string;
    title: string;
  } | null>(null);

  // Add this function with other state declarations
  const handleDeleteCurriculum = async (curriculumId: number) => {
    if (
      !confirm(
        "정말로 이 커리큘럼을 삭제하시겠습니까?\n영상 파일도 함께 삭제됩니다."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/curriculums/${curriculumId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("커리큘럼 삭제 실패");
      }

      alert("커리큘럼이 삭제되었습니다.");

      // Refresh curriculum list
      const refreshResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/curriculums/lecture/${lectureIdRef}`,
        {
          credentials: "include",
        }
      );
      const result = await refreshResponse.json();
      if (result.success) {
        setCurriculums(result.data);
      }
    } catch (error) {
      console.error("커리큘럼 삭제 실패:", error);
      alert("커리큘럼 삭제에 실패했습니다.");
    }
  };

  return (
    <div
      className={`bg-gray-50 min-h-screen ${
        showNotificationModal ? "opacity-50" : ""
      }`}
    >
      {/* 뒤로 가기 버튼 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          이전으로
        </button>
      </div>

      {/* 강의 정보 카드 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-xl shadow p-8 flex gap-8">
          <Image
            src={lecture?.coverImageUrl || "/lecture-main.jpg"}
            alt="강의 대표 이미지"
            width={180}
            height={120}
            className="rounded-lg object-cover"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">{lecture?.title}</h2>
            <div className="text-gray-700 mb-2">
              {lecture?.content ? removeMarkdown(lecture.content) : ""}
            </div>
            <div className="flex gap-4 text-sm text-gray-500 mb-1">
              <span>
                수강료:{" "}
                <b className="text-black">
                  {lecture?.price?.toLocaleString()}원
                </b>
              </span>
              <span>난이도: {lecture?.lectureLevel}</span>
              <span className="flex items-center gap-2">
                상태:{" "}
                {lecture?.lectureStatus && (
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${
                        STATUS_STYLES[lecture.lectureStatus]
                      }`}
                    >
                      {lecture.lectureStatus}
                    </span>
                    {lecture.lectureStatus === "진행중" && (
                      <>
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        <button
                          onClick={updateLectureStatus}
                          className={`px-2 py-1 rounded-full text-sm font-medium ${STATUS_STYLES["완강"]}`}
                        >
                          완강
                        </button>
                      </>
                    )}
                  </div>
                )}
              </span>
              <span>평점: {lecture?.averageScore?.toFixed(1) ?? "-"}</span>
            </div>
            <div className="text-xs text-gray-400">
              개설일: {lecture?.createdAt?.slice(0, 10)}
            </div>
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex gap-4 border-b">
        {["클래스 관리", "강의 목록", "공지사항", "수강생 목록", "Q&A"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 border-b-2 ${
                activeTab === tab
                  ? "border-green-500 font-bold text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } transition-colors`}
            >
              {tab}
            </button>
          )
        )}
      </div>

      {/* Conditional content based on active tab */}
      {activeTab === "강의 목록" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 bg-white rounded-xl shadow p-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">강의 목록</h3>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded font-semibold"
              onClick={() => setShowModal(true)}
            >
              + 강의 등록
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 text-left px-4">강의명</th>
                {/* <th className="w-48 text-left px-4">강사</th> */}
                <th className="w-96 text-left px-4">내용</th>
                <th className="w-32 text-center">관리</th>
              </tr>
            </thead>
            <tbody>
              {curriculums.map((curriculum) => (
                <tr key={curriculum.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium">{curriculum.title}</div>
                  </td>
                  {/* <td className="py-3 px-4 text-gray-600">
                    {curriculum.trainerNickname}
                  </td> */}
                  <td className="py-3 px-4 text-gray-600">
                    <div className="truncate max-w-md">
                      {curriculum.content}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      className="text-green-500 hover:text-green-700 mr-2"
                      onClick={() =>
                        setSelectedVideo({
                          s3path: curriculum.s3path,
                          title: curriculum.title,
                        })
                      }
                    >
                      ▶️
                    </button>
                    <button
                      className="text-blue-500 hover:text-blue-700 mr-2"
                      onClick={() => setEditingCurriculum(curriculum)}
                    >
                      ✏️
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click event
                        handleDeleteCurriculum(curriculum.id);
                      }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {curriculums.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    등록된 강의가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "클래스 관리" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 bg-white rounded-xl shadow p-8">
          <h3 className="font-bold text-lg mb-4">클래스 관리</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const koreanStatus = lecture?.lectureStatus || "예정";
              const data: LectureRequestDto = {
                title: formData.get("title") as string,
                content: editorContent,
                price: Number(formData.get("price")),
                lectureLevel:
                  LEVEL_MAPPING[
                    formData.get("lectureLevel") as keyof typeof LEVEL_MAPPING
                  ],
                lectureStatus:
                  STATUS_MAPPING[koreanStatus as keyof typeof STATUS_MAPPING],
                categoryName: formData.get("categoryName") as string,
              };
              await updateLecture(data);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                강의명
              </label>
              <input
                type="text"
                name="title"
                defaultValue={lecture?.title}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                강의 내용
              </label>
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                value={editorContent}
                onInit={(evt, editor) => {
                  setEditorContent(lecture?.content || "");
                }}
                onEditorChange={(content) => {
                  setEditorContent(content);
                }}
                init={{
                  height: 300,
                  menubar: false,
                  plugins: [
                    "advlist",
                    "autolink",
                    "lists",
                    "link",
                    "image",
                    "charmap",
                    "preview",
                    "anchor",
                    "searchreplace",
                    "visualblocks",
                    "code",
                    "fullscreen",
                    "insertdatetime",
                    "media",
                    "table",
                    "code",
                    "help",
                    "wordcount",
                  ],
                  toolbar:
                    "undo redo | blocks | " +
                    "bold italic forecolor | alignleft aligncenter " +
                    "alignright alignjustify | bullist numlist outdent indent | " +
                    "removeformat | help",
                  content_style:
                    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                수강료
              </label>
              <input
                type="number"
                name="price"
                defaultValue={lecture?.price}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                난이도
              </label>
              <select
                name="lectureLevel"
                value={lecture?.lectureLevel || "초급"} // Changed from defaultValue to value
                onChange={(e) => {
                  const updatedLecture = {
                    ...lecture!,
                    lectureLevel: e.target.value,
                  };
                  setLecture(updatedLecture);
                }}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="초급">초급</option>
                <option value="중급">중급</option>
                <option value="고급">고급</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                카테고리
              </label>
              <select
                name="categoryName"
                value={lecture?.categoryName || ""} // Changed from defaultValue to value
                onChange={(e) => {
                  const updatedLecture = {
                    ...lecture!,
                    categoryName: e.target.value,
                  };
                  setLecture(updatedLecture);
                }}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">카테고리 선택</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.categoryName}>
                    {category.categoryName}
                    {category.description && ` - ${category.description}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                수정하기
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 강의 등록 모달 */}
      {showModal && (
        <CurriculumUploadModal
          lectureId={Number(lectureIdRef)}
          onClose={() => setShowModal(false)}
          onUploaded={async () => {
            // Refresh curriculum list
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/curriculums/upload`,
              {
                credentials: "include",
              }
            );
            const result = await response.json();
            if (result.success) {
              setCurriculums(result.data);
            }
          }}
        />
      )}

      {/* 공지사항 탭 내용 추가 */}
      {activeTab === "공지사항" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 bg-white rounded-xl shadow p-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">공지사항</h3>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded font-semibold"
              onClick={() => setShowNotificationModal(true)}
            >
              + 공지사항 작성
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 text-left px-4">제목</th>
                <th className="w-32 text-center">작성일</th>
                <th className="w-24 text-center">관리</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) => (
                <>
                  <tr
                    key={notification.id}
                    className="border-b cursor-pointer hover:bg-gray-50"
                    onClick={() =>
                      setSelectedNotification(
                        selectedNotification?.id === notification.id
                          ? null
                          : notification
                      )
                    }
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium flex items-center">
                        {notification.title}
                        {selectedNotification?.id === notification.id && (
                          <svg
                            className="w-4 h-4 ml-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="text-center text-sm text-gray-600">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-center">
                      <button
                        className="text-blue-500 mr-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingNotification(notification);
                          setShowEditModal(true);
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        className="text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                  {selectedNotification?.id === notification.id && (
                    <tr>
                      <td colSpan={3} className="px-4 py-4 bg-gray-50">
                        <div className="text-gray-700 whitespace-pre-wrap">
                          {notification.content}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {notifications.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-500">
                    등록된 공지사항이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add notification modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50">
          <NotificationCreateModal
            lectureId={Number(lectureIdRef)}
            onClose={() => setShowNotificationModal(false)}
            onCreated={() => {
              // Refresh notifications list
              fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/lecture/${lectureIdRef}`,
                {
                  credentials: "include",
                }
              )
                .then((res) => res.json())
                .then((response) => {
                  if (response.success) {
                    setNotifications(response.data);
                  }
                })
                .catch((error) => console.error("공지사항 조회 실패:", error));
            }}
          />
        </div>
      )}

      {/* Edit notification modal */}
      {showEditModal && editingNotification && (
        <NotificationEditModal
          notificationId={editingNotification.id}
          initialTitle={editingNotification.title}
          initialContent={editingNotification.content}
          onClose={() => {
            setShowEditModal(false);
            setEditingNotification(null);
          }}
          onEdited={() => {
            // Refresh notifications list
            fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/lecture/${lectureIdRef}`,
              {
                credentials: "include",
              }
            )
              .then((res) => res.json())
              .then((response) => {
                if (response.success) {
                  setNotifications(response.data);
                }
              })
              .catch((error) => console.error("공지사항 조회 실패:", error));
            setShowEditModal(false);
            setEditingNotification(null);
          }}
        />
      )}

      {/* 수강생 목록 탭 내용 추가 */}
      {activeTab === "수강생 목록" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 bg-white rounded-xl shadow p-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">수강생 목록</h3>
            <div className="text-sm text-gray-500">
              총 {filteredStudents.length}명의 수강생이 있습니다.
            </div>
          </div>

          {/* Add search input */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="수강생 이름으로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 pl-8 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <svg
                className="absolute left-2 top-2.5 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 text-left px-4">프로필</th>
                <th className="py-2 text-left px-4">이름</th>
                <th className="py-2 text-left px-4">이메일</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Image
                      src={student.profileImage || "/default-profile.png"}
                      alt={`${student.name}의 프로필`}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  </td>
                  <td className="py-3 px-4">{student.name}</td>
                  <td className="py-3 px-4 text-gray-600">{student.email}</td>
                  <td className="py-3 px-4 text-gray-600">{student.phone}</td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    {searchQuery
                      ? "검색 결과가 없습니다."
                      : "등록된 수강생이 없습니다."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Q&A 탭 내용 추가 */}
      {activeTab === "Q&A" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 bg-white rounded-xl shadow p-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Q&A</h3>
            <div className="text-sm text-gray-500">
              총 {qnaTotalElements}개의 질문이 있습니다.
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 text-left px-4">제목</th>
                <th className="w-24 text-center">작성자</th>
                <th className="w-24 text-center">공개여부</th>
                <th className="w-32 text-center">작성일</th>
              </tr>
            </thead>
            <tbody>
              {qnaList.map((qna) => (
                <>
                  <tr
                    key={qna.id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={async () => {
                      if (selectedQna?.id === qna.id) {
                        setSelectedQna(null);
                        setQnaComments([]);
                      } else {
                        setSelectedQna(qna);
                        await fetchComments(qna.id);
                      }
                    }}
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium flex items-center">
                        {qna.title}
                        {selectedQna?.id === qna.id && (
                          <svg
                            className="w-4 h-4 ml-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="text-center">{qna.username}</td>
                    <td className="text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          qna.openStatus === "OPEN"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {qna.openStatus === "OPEN" ? "공개" : "비공개"}
                      </span>
                    </td>
                    <td className="text-center text-sm text-gray-600">
                      {new Date(qna.createdDate).toLocaleDateString()}
                    </td>
                  </tr>
                  {selectedQna?.id === qna.id && (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 bg-gray-50">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="text-xs text-gray-500">
                              작성일:{" "}
                              {new Date(qna.createdDate).toLocaleString()}
                              {qna.updatedDate !== qna.createdDate && (
                                <span className="ml-2">
                                  (수정됨:{" "}
                                  {new Date(qna.updatedDate).toLocaleString()})
                                </span>
                              )}
                            </div>
                            <div className="text-gray-700 whitespace-pre-wrap border-b pb-4">
                              {qna.content}
                            </div>
                          </div>

                          {/* Comments section */}
                          <div className="pt-2">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              댓글 {qnaComments.length}개
                            </h4>

                            {/* Add comment form */}
                            <form
                              onSubmit={(e) => handleCommentSubmit(qna.id, e)}
                              className="mb-4"
                            >
                              <div className="flex gap-2">
                                <textarea
                                  name="content"
                                  placeholder="댓글을 입력하세요..."
                                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                  rows={2}
                                />
                                <button
                                  type="submit"
                                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 self-end"
                                >
                                  등록
                                </button>
                              </div>
                            </form>

                            <div className="space-y-3">
                              {qnaComments.map((comment) => (
                                <div
                                  key={comment.id}
                                  className="bg-gray-100 rounded-lg p-3"
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm">
                                        {comment.userNickname}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(
                                          comment.createdAt
                                        ).toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="flex gap-2">
                                      {editingCommentId !== comment.id && (
                                        <>
                                          <button
                                            onClick={() =>
                                              setEditingCommentId(comment.id)
                                            }
                                            className="text-blue-500 hover:text-blue-700 text-sm"
                                          >
                                            수정
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleDeleteComment(
                                                comment.id,
                                                qna.id
                                              )
                                            }
                                            className="text-red-500 hover:text-red-700 text-sm"
                                          >
                                            삭제
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  {editingCommentId === comment.id ? (
                                    <form
                                      onSubmit={(e) => {
                                        e.preventDefault();
                                        const formData = new FormData(
                                          e.currentTarget
                                        );
                                        const content = formData.get(
                                          "content"
                                        ) as string;
                                        if (content.trim()) {
                                          handleUpdateComment(
                                            comment.id,
                                            qna.id,
                                            content
                                          );
                                        }
                                      }}
                                      className="mt-2"
                                    >
                                      <textarea
                                        name="content"
                                        defaultValue={comment.content}
                                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                        rows={2}
                                      />
                                      <div className="flex justify-end gap-2 mt-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setEditingCommentId(null)
                                          }
                                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                        >
                                          취소
                                        </button>
                                        <button
                                          type="submit"
                                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                        >
                                          수정하기
                                        </button>
                                      </div>
                                    </form>
                                  ) : (
                                    <>
                                      <p className="text-sm mt-1 text-gray-700">
                                        {comment.content}
                                      </p>
                                      {comment.updatedAt !==
                                        comment.createdAt && (
                                        <span className="text-xs text-gray-500 mt-1 block">
                                          (수정됨:{" "}
                                          {new Date(
                                            comment.updatedAt
                                          ).toLocaleString()}
                                          )
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                              ))}
                              {qnaComments.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-2">
                                  작성한 댓글이 없습니다.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {qnaList.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    등록된 Q&A가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className={`px-3 py-1 rounded ${
                  currentPage === 0
                    ? "bg-gray-100 text-gray-400"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                이전
              </button>

              {Array.from({ length: totalPages }, (_, i) => {
                // Show limited page numbers with ellipsis
                if (
                  i === 0 ||
                  i === totalPages - 1 ||
                  (i >= currentPage - 2 && i <= currentPage + 2)
                ) {
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`px-3 py-1 rounded ${
                        currentPage === i
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                } else if (i === currentPage - 3 || i === currentPage + 3) {
                  return <span key={i}>...</span>;
                }
                return null;
              })}

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                }
                disabled={currentPage === totalPages - 1}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages - 1
                    ? "bg-gray-100 text-gray-400"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                다음
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add video player modal */}
      {selectedVideo && (
        <VideoPlayerModal
          s3path={selectedVideo.s3path}
          title={selectedVideo.title}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      {/* Edit curriculum modal */}
      {editingCurriculum && (
        <CurriculumEditModal
          curriculumId={editingCurriculum.id}
          initialTitle={editingCurriculum.title}
          initialContent={editingCurriculum.content}
          initialSequence={editingCurriculum.sequence} // Add this
          onClose={() => setEditingCurriculum(null)}
          onUpdated={() => {
            // Refresh curriculums list
            fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/curriculums/lecture/${lectureIdRef}`,
              {
                credentials: "include",
              }
            )
              .then((res) => res.json())
              .then((response) => {
                if (response.success) {
                  setCurriculums(response.data);
                }
              })
              .catch((error) => console.error("커리큘럼 조회 실패:", error));
            setEditingCurriculum(null);
          }}
        />
      )}
    </div>
  );
}
