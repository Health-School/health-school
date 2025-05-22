import { useRef, useState } from "react";

interface Props {
  lectureId: number;
  onClose: () => void;
  onUploaded?: () => void;
}

export default function CurriculumUploadModal({ lectureId, onClose, onUploaded }: Props) {
  const [title, setTitle] = useState("");
  const [videoType, setVideoType] = useState<"file" | "url">("file");
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [content, setContent] = useState("");
  const [sequence, setSequence] = useState(1);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 업로드 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("강의명을 입력하세요.");
    if (videoType === "file" && !file) return alert("영상을 업로드하세요.");
    if (videoType === "url" && !videoUrl.trim()) return alert("영상 URL을 입력하세요.");

    setLoading(true);

    try {
      const formData = new FormData();
      // info JSON
      formData.append(
        "info",
        new Blob(
          [
            JSON.stringify({
              lectureId,
              title,
              content,
              sequence,
              // isPublic 등 추가 필드 필요시 여기에
            }),
          ],
          { type: "application/json" }
        )
      );
      // 파일 업로드
      if (videoType === "file" && file) {
        formData.append("file", file);
      }
      // URL 업로드는 별도 API가 필요하거나, file 대신 URL을 info에 담아야 함(백엔드 정책에 따라)
      // 여기서는 파일 업로드만 처리

      const res = await fetch("/api/v1/curriculums/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("업로드 실패");
      alert("업로드 완료!");
      onUploaded?.();
      onClose();
    } catch (err) {
      alert("업로드 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 relative"
      >
        {/* 닫기 버튼 */}
        <button
          type="button"
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-6">강의 등록</h2>
        {/* 강의명 */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">강의명</label>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="강의명을 입력하세요"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        {/* 강의 영상 */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">강의 영상</label>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              className={`px-3 py-1 rounded ${videoType === "file" ? "bg-green-500 text-white" : "bg-gray-200"}`}
              onClick={() => setVideoType("file")}
            >
              파일 업로드
            </button>
            <button
              type="button"
              className={`px-3 py-1 rounded ${videoType === "url" ? "bg-green-500 text-white" : "bg-gray-200"}`}
              onClick={() => setVideoType("url")}
            >
              URL 입력
            </button>
          </div>
          {videoType === "file" ? (
            <div
              className="w-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center py-6 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept="video/*"
                ref={fileInputRef}
                className="hidden"
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
              <div className="text-3xl mb-2 text-gray-400">📤</div>
              <div className="text-gray-500 text-sm">
                영상 <b>4GB</b> 이하 또는 여기에 파일을 끌어다 놓으세요<br />
                MP4, MOV 형식 권장 (최대 20분)
              </div>
              {file && (
                <div className="mt-2 text-green-600 text-sm font-semibold">
                  {file.name}
                </div>
              )}
            </div>
          ) : (
            <input
              type="url"
              className="w-full border rounded px-3 py-2"
              placeholder="영상 URL을 입력하세요"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
            />
          )}
        </div>
        {/* 설명 */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">설명</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="강의에 대한 설명을 입력하세요"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            required
          />
        </div>
        {/* 순서 */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">순서</label>
          <input
            type="number"
            min={1}
            className="w-full border rounded px-3 py-2"
            value={sequence}
            onChange={e => setSequence(Number(e.target.value))}
            required
          />
        </div>
        {/* 바로 공개하기 */}
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={e => setIsPublic(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="isPublic" className="text-sm">바로 공개하기</label>
        </div>
        {/* 버튼 */}
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
            className="px-4 py-2 rounded bg-green-500 text-white font-semibold"
            disabled={loading}
          >
            {loading ? "등록 중..." : "등록"}
          </button>
        </div>
      </form>
    </div>
  );
}
