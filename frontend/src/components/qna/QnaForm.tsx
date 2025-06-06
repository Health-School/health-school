import React, { useState, FormEvent } from "react";

interface QnaBoardRequestDto {
  title: string;
  content: string;
  lectureId: number;
  openStatus: "OPEN" | "CLOSED"; // OpenStatus enum 추가
}

interface QnaFormProps {
  lectureId: number;
  userId: number;
  onSuccess?: () => void;
}

const QnaForm: React.FC<QnaFormProps> = ({ lectureId, userId, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [openStatus, setOpenStatus] = useState<"OPEN" | "CLOSED">("OPEN"); // 기본값은 공개(OPEN)
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const reqBody: QnaBoardRequestDto = {
      title,
      content,
      lectureId,
      openStatus, // openStatus 추가
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/qna?userId=${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(reqBody),
        }
      );

      if (res.ok) {
        setTitle("");
        setContent("");
        setOpenStatus("OPEN"); // 폼 초기화 시 공개 상태로 되돌림
        setSuccess(true);
        alert("QnA가 성공적으로 등록되었습니다."); // 등록 완료 시 알림창
        setTimeout(() => setSuccess(false), 1000); // 1초 후 등록 완료 문구 사라짐
        if (onSuccess) onSuccess();
      } else {
        const errorText = await res.text();
        console.error("등록 실패:", res.status, errorText);
        alert(`QnA 등록에 실패했습니다. (${res.status})`);
      }
    } catch (err) {
      console.error("에러 발생:", err);
      alert("QnA 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">질문 등록하기</h3>
        {success && (
          <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded">
            등록 완료
          </span>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full mb-3 px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-base focus:outline-none focus:ring-2 focus:ring-green-200"
        />
        <textarea
          placeholder="질문 내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={4}
          className="w-full mb-4 px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-base resize-y focus:outline-none focus:ring-2 focus:ring-green-200"
        />
        
        {/* 공개/비공개 선택 버튼 그룹 추가 */}
        <div className="flex mb-4 space-x-2">
          <span className="text-gray-700 mr-2">공개 설정:</span>
          <button
            type="button"
            onClick={() => setOpenStatus("OPEN")}
            className={`px-4 py-2 text-sm rounded-lg ${
              openStatus === "OPEN"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            공개
          </button>
          <button
            type="button"
            onClick={() => setOpenStatus("CLOSED")}
            className={`px-4 py-2 text-sm rounded-lg ${
              openStatus === "CLOSED"
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            비공개
          </button>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg text-base font-semibold transition ${
            loading
              ? "bg-green-200 text-white cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {loading ? "등록 중..." : "질문 등록"}
        </button>
      </form>
    </div>
  );
};

export default QnaForm;
