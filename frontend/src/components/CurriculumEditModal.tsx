import { useState } from "react";

// Update interface to include sequence
interface CurriculumEditModalProps {
  curriculumId: number;
  initialTitle: string;
  initialContent: string;
  initialSequence: number; // Add this
  onClose: () => void;
  onUpdated: () => void;
}

export default function CurriculumEditModal({
  curriculumId,
  initialTitle,
  initialContent,
  initialSequence, // Add this
  onClose,
  onUpdated,
}: CurriculumEditModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [sequence, setSequence] = useState(initialSequence); // Add this
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("sequence", sequence.toString());
    if (file) {
      formData.append("newFile", file);
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/curriculums/${curriculumId}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      const result = await response.json();
      console.log("Curriculum update response:", result); // 디버깅용 로그

      // HTTP 상태 코드가 성공이 아닌 경우
      if (!response.ok) {
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`
        );
      }

      // 응답 데이터 검증
      if (result.data === null) {
        throw new Error(result.message || "커리큘럼 수정 실패");
      }

      // 성공 시
      alert("커리큘럼이 수정되었습니다.");
      await onUpdated(); // 목록 새로고침을 먼저 하고
      onClose(); // 모달을 닫음
    } catch (error) {
      console.error("커리큘럼 수정 실패:", error);
      alert(
        error instanceof Error ? error.message : "커리큘럼 수정에 실패했습니다."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="relative z-10 max-w-lg mx-auto mt-20 bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">커리큘럼 수정</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              순서
            </label>
            <input
              type="number"
              value={sequence}
              onChange={(e) => setSequence(parseInt(e.target.value, 10))}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              min={1}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              새 영상 파일 (선택)
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              수정하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
