import React, { useState } from "react";

interface ReportModalProps {
  lectureId: number;
  onClose: () => void;
}

export default function ReportModal({ lectureId, onClose }: ReportModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/reports/${lectureId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",

          },
          body: JSON.stringify({
            title,
            content,
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("서버 응답 에러:", errorText);
        throw new Error("신고 요청 실패");
      }

      alert("신고가 접수되었습니다.");
      onClose();
    } catch (err) {
      alert("신고 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* 🔹 배경: 완전 투명 */}
      <div
        className="absolute inset-0 bg-transparent"
        onClick={onClose}
      />
      {/* 신고 폼 */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white rounded-xl shadow-xl w-full max-w-md p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-6">신고하기</h2>

        <div className="mb-4">
          <label className="block font-semibold mb-1">신고 제목</label>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="신고 제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">내용</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="신고 내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            required
            disabled={loading}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded border"
            onClick={onClose}
            disabled={loading}
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-red-500 text-white font-semibold"
            disabled={loading}
          >
            {loading ? "신고 중..." : "신고"}
          </button>
        </div>
      </form>
    </div>
  );
}
