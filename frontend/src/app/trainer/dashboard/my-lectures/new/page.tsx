"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Editor } from "@tinymce/tinymce-react";

type LectureLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

interface LectureCategory {
  id: number;
  categoryName: string;
  description?: string;
}

interface LectureForm {
  title: string;
  content: string;
  price: number;
  lectureLevel: LectureLevel;
  lectureStatus: string;
  categoryName: string;
}

export default function NewLecturePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<LectureCategory[]>([]);
  const [lecture, setLecture] = useState<LectureForm>({
    title: "",
    content: "",
    price: 0,
    lectureLevel: "BEGINNER",
    lectureStatus: "PLANNED",
    categoryName: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lecture_categories`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("카테고리 조회에 실패했습니다.");
        }

        const result = await response.json();
        // Check if the response has the expected structure
        if (result.success && Array.isArray(result.data)) {
          setCategories(result.data);
        } else {
          console.error("Invalid categories data structure:", result);
          setCategories([]);
        }
      } catch (error) {
        console.error("카테고리 조회 오류:", error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // 난이도 매핑 객체 추가
  const lectureLevels = [
    { value: "BEGINNER" as LectureLevel, label: "초급" },
    { value: "INTERMEDIATE" as LectureLevel, label: "중급" },
    { value: "ADVANCED" as LectureLevel, label: "고급" },
  ];

  // Add handleEditorChange function
  const handleEditorChange = (content: string) => {
    setLecture({ ...lecture, content });
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleImageFile(file);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleImageFile = (file: File) => {
    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      alert("파일 크기는 2MB를 초과할 수 없습니다.");
      return;
    }

    // Check file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("jpg, jpeg, png, gif 파일만 업로드 가능합니다.");
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Update handleSubmit function to use FormData
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      alert("강의 이미지를 업로드해주세요.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("lectureImage", imageFile);
      formData.append(
        "lectureRequestDto",
        new Blob([JSON.stringify(lecture)], {
          type: "application/json",
        })
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectures`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("강의 등록에 실패했습니다.");
      }

      router.push("/trainer/dashboard/my-lectures");
    } catch (error) {
      console.error("강의 등록 오류:", error);
      alert("강의 등록에 실패했습니다.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          ← 새 강의 등록
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h2 className="text-lg font-medium mb-4">기본 정보</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">
                강의 제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lecture.title}
                onChange={(e) =>
                  setLecture({ ...lecture, title: e.target.value })
                }
                placeholder="강의 제목을 입력하세요"
                className="w-full p-3 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                강의 내용 <span className="text-red-500">*</span>
              </label>
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                init={{
                  height: 400,
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
                value={lecture.content}
                onEditorChange={handleEditorChange}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm mb-1">
                  카테고리 <span className="text-red-500">*</span>
                </label>
                <select
                  value={lecture.categoryName}
                  onChange={(e) =>
                    setLecture({ ...lecture, categoryName: e.target.value })
                  }
                  className="w-full p-3 border rounded-md bg-white"
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
              <div className="flex-1">
                <label className="block text-sm mb-1">
                  난이도 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {lectureLevels.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setLecture({
                          ...lecture,
                          lectureLevel: value as LectureLevel,
                        })
                      }
                      className={`flex-1 py-2 px-3 rounded-md ${
                        lecture.lectureLevel === value
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">
                가격(원) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={lecture.price}
                onChange={(e) =>
                  setLecture({ ...lecture, price: Number(e.target.value) })
                }
                placeholder="가격을 입력하세요"
                className="w-full p-3 border rounded-md"
                required
                min="0"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4">썸네일 이미지</h2>
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleImageDrop}
          >
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-48 mx-auto"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setPreviewUrl("");
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="imageUpload"
                />
                <label
                  htmlFor="imageUpload"
                  className="cursor-pointer"
                >
                  <svg
                    className="w-12 h-12 text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <p className="text-sm text-gray-500">
                    이미지를 드래그하거나 클릭하여 업로드하세요
                  </p>
                  <p className="text-xs text-gray-400">
                    (최대 2MB / jpg,jpeg,png,gif)
                  </p>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            발행하기
          </button>
        </div>
      </form>
    </div>
  );
}
