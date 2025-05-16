"use client";

import Link from "next/link";

import Image from "next/image";
import { useState, useEffect } from "react";
import DashboardTabs from "@/components/dashboard/DashboardTabs";

interface User {
  nickname: string;
  email: string;
  phoneNumber: string;
  role: string;
  profileImageUrl: string | null;
}

export default function MyInfoPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editNickname, setEditNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [editPhone, setEditPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [profileImage, setProfileImage] = useState("");
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/me/mypage`,
          { credentials: "include" }
        );
        const data = await response.json();
        if (data.success) {
          console.log(data);
          setUser(data.data);
          setNicknameInput(data.data.nickname);
        } else {
          setError(data.message || "사용자 정보를 불러오는데 실패했습니다.");
        }
      } catch (err) {
        setError("사용자 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (user?.phoneNumber) setPhoneInput(user.phoneNumber);
  }, [user?.phoneNumber]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center max-w-4xl mx-auto my-8">
        {error}
      </div>
    );
  }

  // 프로필 이미지 업로드 핸들러
  const handleProfileImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 미리보기
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 서버 업로드 예시
    const formData = new FormData();
    formData.append("profileImage", file);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/images/profile/upload`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );
      if (!response.ok) throw new Error("프로필 이미지 업로드 실패");
      // 업로드 성공 후 서버에서 받은 이미지 URL로 갱신 (예시)
      const data = await response.json();
      if (data.data?.profileImageUrl) {
        console.log(data.data);
        setProfileImage(data.data.profileImageUrl);
      }
      console.log("프로필 이미지 업로드 성공:", data.data);
      alert("프로필 이미지가 변경되었습니다.");
    } catch (err) {
      alert("프로필 이미지 업로드에 실패했습니다.");
    }
  };

  return (
    <div className=" p-6">
      <DashboardTabs />
      <div className="mt-8">
        <h1 className="text-2xl font-bold pt-10 pb-6">마이페이지</h1>

        <div className="bg-white rounded-xl px-12 py-12 max-w-5xl mx-auto border border-gray-100 flex flex-col md:flex-row gap-12 min-h-[500px]">
          {/* 왼쪽: 프로필 */}
          <div className="flex flex-col items-center w-full md:w-1/3">
            <div className="relative w-40 h-40 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center mb-4">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="프로필 이미지"
                  fill
                  className="object-cover"
                />
              ) : user?.profileImageUrl ? (
                <Image
                  src={user.profileImageUrl}
                  alt="프로필 이미지"
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-5xl font-bold text-gray-500">
                  {user?.nickname?.charAt(0) || "U"}
                </span>
              )}
            </div>
            <button
              className="cursor-pointer text-rose-400 text-sm mb-4"
              onClick={() =>
                document.getElementById("profileImageInput")?.click()
              }
              type="button"
            >
              프로필 사진 변경
            </button>
            <input
              id="profileImageInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfileImageChange}
            />
            <div className="text-xl font-bold mb-1">{user?.nickname}</div>
            <div className="text-gray-500 mb-8">{user?.role}</div>
          </div>
          {/* 오른쪽: 정보 */}
          <div className="flex-1 flex flex-col gap-6">
            <div>
              <div className="font-bold text-lg mb-2">닉네임</div>
              <div className="bg-gray-50 rounded px-4 py-3 flex justify-between items-center">
                {editNickname ? (
                  <div className="flex w-full gap-2">
                    <input
                      type="text"
                      value={nicknameInput}
                      onChange={(e) => setNicknameInput(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200"
                    />
                    <button
                      className="text-green-400 text-sm hover:underline"
                      onClick={() => {
                        setEditNickname(false);
                        setNicknameInput(user?.nickname || "");
                      }}
                    >
                      취소
                    </button>
                    <button
                      className="text-green-400 text-sm hover:underline"
                      onClick={() => {
                        // TODO: 닉네임 변경 API 연동
                        setUser((u) =>
                          u ? { ...u, nickname: nicknameInput } : u
                        );
                        setEditNickname(false);
                      }}
                    >
                      저장
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-gray-700">{user?.nickname}</span>
                    <button
                      className="text-green-400 text-sm hover:underline"
                      onClick={() => setEditNickname(true)}
                    >
                      수정
                    </button>
                  </>
                )}
              </div>
            </div>
            <div>
              <div className="font-bold text-lg mb-2">이메일 주소</div>
              <div className="bg-gray-50 rounded px-4 py-3">
                <span className="text-gray-900">{user?.email}</span>
              </div>
            </div>
            <div>
              <div className="font-bold text-lg mb-2">연락처</div>
              <div className="bg-gray-50 rounded px-4 py-3 flex justify-between items-center">
                {editPhone ? (
                  <div className="flex w-full gap-2">
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-200"
                    />
                    <button
                      className="text-green-400 text-sm hover:underline"
                      onClick={() => {
                        setEditPhone(false);
                        setPhoneInput(user?.phoneNumber || "");
                      }}
                    >
                      취소
                    </button>
                    <button
                      className="text-green-400 text-sm hover:underline"
                      onClick={() => {
                        // TODO: 연락처 변경 API 연동
                        setUser((u) =>
                          u ? { ...u, phoneNumber: phoneInput } : u
                        );
                        setEditPhone(false);
                      }}
                    >
                      저장
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-gray-900">{user?.phoneNumber}</span>
                    <button
                      className="text-green-400 text-sm hover:underline"
                      onClick={() => setEditPhone(true)}
                    >
                      수정
                    </button>
                  </>
                )}
              </div>
            </div>
            <div>
              <div className="font-bold text-lg mb-2">회원 역할</div>
              <div className="bg-gray-50 rounded px-4 py-3">
                <span className="text-gray-900">{user?.role}</span>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition">
                <Link href="/user/change/password">비밀번호 변경</Link>
              </button>
              <button className="px-4 py-2 bg-pink-400 text-white rounded hover:bg-pink-500 transition">
                <Link href="/user/withdrawal">회원탈퇴</Link>
              </button>
              <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
                트레이너 신청
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
