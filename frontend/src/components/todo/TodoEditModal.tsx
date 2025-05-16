import { useState } from "react";

type TodoEnumType = "DO" | "DOING" | "DONE";

interface TodoEditModalProps {
  onClose: () => void;
  onSuccess: () => void;
  todo: {
    id: number;
    title: string;
    content: string;
    isDone: TodoEnumType;
    dueDate: string;
  };
}

export default function TodoEditModal({
  onClose,
  onSuccess,
  todo,
}: TodoEditModalProps) {
  const [title, setTitle] = useState(todo.title);
  const [content, setContent] = useState(todo.content);
  const [dueDate, setDueDate] = useState(todo.dueDate);
  const [isDone, setIsDone] = useState<TodoEnumType>(todo.isDone);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/todos/${todo.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title,
            content,
            dueDate,
            isDone,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        alert(result.message || "수정에 실패했습니다.");
      }
    } catch (err) {
      console.error("할 일 수정 실패:", err);
      alert("수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">할 일 수정</h2>
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
              onChange={(e) => setIsDone(e.target.value as TodoEnumType)}
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
              {loading ? "수정 중..." : "수정"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
