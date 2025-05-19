import { useState } from "react";

interface TodoAddModalProps {
  onClose: () => void;
  onSuccess: () => void;
  defaultDate?: string;
}

// Update enum type to match backend exactly
type TodoEnumType = "DO" | "DOING" | "DONE";

export default function TodoAddModal({
  onClose,
  onSuccess,
  defaultDate,
}: TodoAddModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dueDate, setDueDate] = useState(defaultDate || "");
  const [isDone, setIsDone] = useState<TodoEnumType>("DO");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Create request data object
    const todoData = {
      title,
      content,
      dueDate,
      isDone, // Send enum value directly
    };

    console.log("Sending todo data:", todoData); // For debugging

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/todos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(todoData),
        }
      );

      const result = await response.json();
      console.log("Server response:", result); // For debugging

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        alert(result.message || "할 일 추가에 실패했습니다.");
      }
    } catch (err) {
      console.error("Error creating todo:", err);
      alert("할 일 추가 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">할 일 추가</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">마감일</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">상태</label>
            <select
              value={isDone}
              onChange={(e) => {
                console.log("Selected status:", e.target.value); // For debugging
                setIsDone(e.target.value as TodoEnumType);
              }}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="DO">진행예정</option>
              <option value="DOING">진행중</option>
              <option value="DONE">완료</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
