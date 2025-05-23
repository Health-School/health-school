import React, { useEffect, useState } from "react";
import QnaForm from "./QnaForm";

interface QnaItem {
  id: number;
  title: string;
  content: string;
  createdDate: string;
  username: string | null;
  userId: number;
}

interface CommentItem {
  id: number;
  content: string;
  username: string | null;
  createdDate: string;
  userId: number; // ← userId 추가
}

interface QnaTabProps {
  lectureId: number;
  userId: number;
}

export default function QnaTab({ lectureId, userId }: QnaTabProps) {
  const [qnaList, setQnaList] = useState<QnaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [openCommentQnaId, setOpenCommentQnaId] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, CommentItem[]>>({});
  const [commentInput, setCommentInput] = useState<Record<number, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<number, boolean>>(
    {}
  );

  const fetchQnaList = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/qna?lectureId=${lectureId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = await res.json();
        setQnaList(data.data?.data || []);
      } else {
        setQnaList([]);
      }
    } catch (e) {
      setQnaList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQnaList();
  }, [lectureId]);

  const handleSuccess = () => {
    fetchQnaList();
  };

  const fetchComments = async (qnaId: number) => {
    setCommentLoading((prev) => ({ ...prev, [qnaId]: true }));
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/comment/qna/${qnaId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => ({
          ...prev,
          [qnaId]: data.data || [],
        }));
      } else {
        setComments((prev) => ({ ...prev, [qnaId]: [] }));
      }
    } catch (e) {
      setComments((prev) => ({ ...prev, [qnaId]: [] }));
    } finally {
      setCommentLoading((prev) => ({ ...prev, [qnaId]: false }));
    }
  };

  const handleToggleComments = (qnaId: number) => {
    if (openCommentQnaId === qnaId) {
      setOpenCommentQnaId(null);
    } else {
      setOpenCommentQnaId(qnaId);
      fetchComments(qnaId);
    }
  };

  const handleCommentSubmit = async (qnaId: number, e: React.FormEvent) => {
    e.preventDefault();
    const content = commentInput[qnaId]?.trim();
    if (!content) return;
    setCommentLoading((prev) => ({ ...prev, [qnaId]: true }));
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/comment/${qnaId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            content,
            qnaboardId: Number(qnaId),
            userId: Number(userId),
            parentCommentId: null,
          }),
        }
      );
      if (res.ok) {
        setCommentInput((prev) => ({ ...prev, [qnaId]: "" }));
        fetchComments(qnaId);
      } else {
        const errorText = await res.text();
        alert("댓글 등록에 실패했습니다: " + errorText);
      }
    } catch (e) {
      alert("댓글 등록 중 오류가 발생했습니다.");
    } finally {
      setCommentLoading((prev) => ({ ...prev, [qnaId]: false }));
    }
  };

  const handleDelete = async (qnaId: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/qna/${qnaId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.ok) {
        fetchQnaList();
      } else {
        alert("삭제에 실패했습니다.");
      }
    } catch (e) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleCommentDelete = async (commentId: number, qnaId: number) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    setCommentLoading((prev) => ({ ...prev, [qnaId]: true }));
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/comment/${commentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.ok) {
        fetchComments(qnaId);
      } else {
        alert("댓글 삭제에 실패했습니다.");
      }
    } catch (e) {
      alert("댓글 삭제 중 오류가 발생했습니다.");
    } finally {
      setCommentLoading((prev) => ({ ...prev, [qnaId]: false }));
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Q&A</h2>
      <QnaForm
        lectureId={lectureId}
        userId={userId}
        onSuccess={handleSuccess}
      />
      <div className="mt-8">
        {loading ? (
          <div className="text-center text-gray-400 py-8">불러오는 중...</div>
        ) : qnaList.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            등록된 질문이 없습니다.
          </div>
        ) : (
          <ul className="space-y-4">
            {qnaList.map((qna) => (
              <li
                key={qna.id}
                className="bg-gray-50 border border-gray-200 rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-base text-gray-900">
                    {qna.title}
                  </span>
                  <span className="text-xs text-gray-400">
                    {qna.createdDate ? qna.createdDate.slice(0, 10) : ""}
                  </span>
                </div>
                <div className="text-gray-700 mb-2">{qna.content}</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    작성자: {qna.username || "익명"}
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleToggleComments(qna.id)}
                      className="ml-2 px-2 py-1 text-xl hover:bg-gray-100 rounded"
                      title="댓글 보기/작성"
                    >
                      💬
                    </button>
                    {qna.userId === userId && (
                      <button
                        onClick={() => handleDelete(qna.id)}
                        className="ml-2 px-3 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>

                {openCommentQnaId === qna.id && (
                  <div className="mt-4 bg-white border-t pt-4">
                    {commentLoading[qna.id] ? (
                      <div className="text-gray-400 text-sm">
                        댓글 불러오는 중...
                      </div>
                    ) : (
                      <ul className="space-y-2 mb-2">
                        {(comments[qna.id] || []).length === 0 ? (
                          <li className="text-gray-400 text-sm">
                            댓글이 없습니다.
                          </li>
                        ) : (
                          comments[qna.id].map((c) => (
                            <li
                              key={c.id}
                              className="text-sm flex justify-between items-center"
                            >
                              <span>
                                <span className="font-semibold">
                                  {c.username || "익명"}
                                </span>
                                : {c.content}
                              </span>
                              <span className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">
                                  {c.createdDate
                                    ? c.createdDate.slice(0, 10)
                                    : ""}
                                </span>
                                {c.userId === userId && (
                                  <button
                                    onClick={() =>
                                      handleCommentDelete(c.id, qna.id)
                                    }
                                    className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                                  >
                                    삭제
                                  </button>
                                )}
                              </span>
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                    <form
                      onSubmit={(e) => handleCommentSubmit(qna.id, e)}
                      className="flex gap-2 mt-2"
                    >
                      <input
                        type="text"
                        value={commentInput[qna.id] || ""}
                        onChange={(e) =>
                          setCommentInput((prev) => ({
                            ...prev,
                            [qna.id]: e.target.value,
                          }))
                        }
                        placeholder="댓글을 입력하세요"
                        className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-200 text-sm"
                        disabled={commentLoading[qna.id]}
                      />
                      <button
                        type="submit"
                        disabled={commentLoading[qna.id]}
                        className="px-4 py-2 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700 disabled:bg-green-200"
                      >
                        등록
                      </button>
                    </form>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
