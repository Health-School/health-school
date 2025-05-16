"use client";
import { useState } from "react";
import Link from "next/link";

export default function WithdrawalPage() {
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert("유의사항에 동의해주세요.");
      return;
    }
    if (!password) {
      alert("비밀번호를 입력해주세요.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/me`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ password }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "회원탈퇴에 실패했습니다.");
        setIsLoading(false);
        return;
      }
      alert("회원탈퇴가 완료되었습니다.");
      window.location.href = "/";
    } catch (err) {
      alert("회원탈퇴 요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-md mx-auto my-8 p-6 bg-white rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-8">회원탈퇴</h1>

        <ul className="mb-6 pl-5 space-y-2">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <p>회원탈퇴 시 유의사항</p>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <p>회원탈퇴 시 모든 데이터는 즉시 삭제되며 복구가 불가능합니다.</p>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <p>작성하신 게시물과 댓글은 삭제됩니다.</p>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <p>탈퇴 후 동일한 아이디로 재가입이 가능합니다.</p>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <p>소셜 회원이라면 패스워드에 소셜이름을 기입하세요. ex) KAKAO</p>
          </li>
        </ul>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium"
            >
              비밀번호 확인
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-rose-300"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">
                위 유의사항을 모두 확인하였으며, 이에 동의합니다.
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-red-500 text-white rounded hover:bg-red-600 transition mb-4"
            disabled={!password || !agreeTerms || isLoading}
          >
            {isLoading ? "처리중..." : "회원탈퇴"}
          </button>

          <div className="flex justify-center">
            <Link href="/" className="text-sm text-gray-500 hover:underline">
              취소하기
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
