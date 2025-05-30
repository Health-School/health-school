import React, { useState } from "react";

interface ReportModalProps {
  lectureId: number;
  onClose: () => void;
}

const REPORT_TYPES = [
  "부적절한 컨텐츠",
  "저작권 침해",
  "허위/잘못된 정보",
  "강의 운영문제",
  "기타",
];

export default function ReportModal({ lectureId, onClose }: ReportModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [reportType, setReportType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !reportType) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
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
            reportType,
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
      <div className="absolute inset-0 bg-transparent" onClick={onClose} />
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

        {/* 신고 유형 드롭다운 */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">신고 유형</label>
          <select
            className="w-full border rounded px-3 py-2 bg-white"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            required
            disabled={loading}
          >
            <option value="">신고 유형을 선택하세요</option>
            {REPORT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

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
