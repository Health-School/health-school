"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useEffect, useState } from "react";
import CurriculumUploadModal from "@/components/CurriculumUploadModal"; // 앞서 안내한 모달 컴포넌트
import Image from "next/image";
import removeMarkdown from "remove-markdown";
import { useRouter } from "next/navigation"; // 상단에 import 추가

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
  createdAt: string;
  playTime: string;
  viewCount: number;
  isPublic: boolean;
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
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/curriculums/${lectureIdRef}`,
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
  }, [lectureIdRef]);

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

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 뒤로 가기 버튼 */}
      <div className="max-w-4xl mx-auto pt-6">
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
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-white rounded-xl shadow p-6 flex gap-6">
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
      <div className="max-w-4xl mx-auto mt-8 flex gap-4 border-b">
        {["클래스 관리", "강의 목록", "공지사항", "Q&A"].map((tab) => (
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
        ))}
      </div>

      {/* Conditional content based on active tab */}
      {activeTab === "강의 목록" && (
        <div className="max-w-4xl mx-auto mt-4 bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">강의 목록</h3>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded font-semibold"
              onClick={() => setShowModal(true)}
            >
              + 강의 등록
            </button>
          </div>
          <table className="w-full text-center">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2">강의명</th>
                <th>등록일</th>
                <th>재생 시간</th>
                <th>조회수</th>
                <th>공개 여부</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {curriculums.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="py-2">{c.title}</td>
                  <td>{c.createdAt?.slice(0, 10)}</td>
                  <td>{c.playTime}</td>
                  <td>{c.viewCount}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={c.isPublic}
                      readOnly
                      className="accent-green-500"
                    />
                  </td>
                  <td>
                    <button className="text-blue-500 mr-2">✏️</button>
                    <button className="text-red-500">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "클래스 관리" && (
        <div className="max-w-4xl mx-auto mt-4 bg-white rounded-xl shadow p-6">
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
          onUploaded={() => {
            fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectures/${lectureIdRef}/curriculums`,
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
          }}
        />
      )}
    </div>
  );
}
