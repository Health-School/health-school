interface NotificationCreateModalProps {
  lectureId: number;
  onClose: () => void;
  onCreated: () => void;
}

export default function NotificationCreateModal({
  lectureId,
  onClose,
  onCreated,
}: NotificationCreateModalProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/lecture/${lectureId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formData.get("title"),
            content: formData.get("content"),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("공지사항 등록 실패");
      }

      const result = await response.json();
      if (result.success) {
        alert("공지사항이 등록되었습니다.");
        onCreated();
        onClose();
      }
    } catch (error) {
      console.error("공지사항 등록 실패:", error);
      alert("공지사항 등록에 실패했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 backdrop-blur-sm" onClick={onClose} />

      {/* Modal content with shadow and border */}
      <div className="relative bg-white rounded-lg p-6 w-full max-w-2xl shadow-2xl border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">공지사항 작성</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목
            </label>
            <input
              type="text"
              name="title"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              내용
            </label>
            <textarea
              name="content"
              rows={5}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
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
              등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
