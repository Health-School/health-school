"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/dashboard/UserDashboardSidebar";

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

  // 닉네임 변경 함수
  const handleNicknameChange = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/change-nickname`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nickname: nicknameInput }),
        }
      );
      if (!response.ok) throw new Error("닉네임 변경 실패");
      setUser((u) => (u ? { ...u, nickname: nicknameInput } : u));
      setEditNickname(false);
      alert("닉네임이 변경되었습니다.");
    } catch (err) {
      alert("닉네임 변경에 실패했습니다.");
    }
  };

  // 전화번호 포맷팅 함수
  function formatPhoneNumber(input: string) {
    let value = input.replace(/[^0-9]/g, "");
    if (value.length < 4) {
      // 그대로
    } else if (value.length < 8) {
      value = value.replace(/(\d{3})(\d{1,4})/, "$1-$2");
    } else {
      value = value.replace(/(\d{3})(\d{4})(\d{1,4})/, "$1-$2-$3");
    }
    return value;
  }

  //핸드폰 번호 변경
  const handlePhoneNumberChange = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/change-phoneNumber`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phoneNumber: phoneInput.replace(/-/g, "") }),
        }
      );
      if (!response.ok) throw new Error("연락처 변경 실패");
      setUser((u) => (u ? { ...u, phoneNumber: phoneInput } : u));
      setEditPhone(false);
      alert("연락처가 변경되었습니다.");
    } catch (err) {
      alert("연락처 변경에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex justify-center items-center p-6">
          <div className="bg-red-50 text-red-500 p-4 rounded-lg text-center max-w-md">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 사이드바 */}
      <DashboardSidebar />

      {/* 메인 컨텐츠 */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">내 정보</h1>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* 왼쪽: 프로필 섹션 */}
              <div className="flex flex-col items-center lg:w-1/3">
                <div className="relative w-40 h-40 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center mb-6 shadow-lg">
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
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors mb-4 cursor-pointer"
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

                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {user?.nickname}
                  </div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {user?.role}
                  </div>
                </div>
              </div>

              {/* 오른쪽: 정보 편집 섹션 */}
              <div className="flex-1 space-y-6">
                {/* 닉네임 */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    닉네임
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                    {editNickname ? (
                      <div className="flex w-full gap-3">
                        <input
                          type="text"
                          value={nicknameInput}
                          onChange={(e) => setNicknameInput(e.target.value)}
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <button
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                          onClick={() => {
                            setEditNickname(false);
                            setNicknameInput(user?.nickname || "");
                          }}
                        >
                          취소
                        </button>
                        <button
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                          onClick={handleNicknameChange}
                        >
                          저장
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-gray-900 font-medium">
                          {user?.nickname}
                        </span>
                        <button
                          className="text-green-600 hover:text-green-700 font-medium cursor-pointer"
                          onClick={() => setEditNickname(true)}
                        >
                          수정
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 이메일 */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    이메일 주소
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <span className="text-gray-900 font-medium">
                      {user?.email}
                    </span>
                  </div>
                </div>

                {/* 연락처 */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    연락처
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                    {editPhone ? (
                      <div className="flex w-full gap-3">
                        <input
                          type="text"
                          value={phoneInput}
                          onChange={(e) =>
                            setPhoneInput(formatPhoneNumber(e.target.value))
                          }
                          maxLength={13}
                          placeholder="010-1234-5678"
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <button
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                          onClick={() => {
                            setEditPhone(false);
                            setPhoneInput(user?.phoneNumber || "");
                          }}
                        >
                          취소
                        </button>
                        <button
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                          onClick={handlePhoneNumberChange}
                        >
                          저장
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-gray-900 font-medium">
                          {user?.phoneNumber}
                        </span>
                        <button
                          className="text-green-600 hover:text-green-700 font-medium cursor-pointer"
                          onClick={() => setEditPhone(true)}
                        >
                          수정
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/user/change/password"
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      비밀번호 변경
                    </Link>
                    <Link
                      href="/user/trainer-application"
                      className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                    >
                      트레이너 신청
                    </Link>
                    <Link
                      href="/user/withdrawal"
                      className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      회원탈퇴
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
