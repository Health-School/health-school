"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface User {
  nickname: string;
  email: string;
  phoneNumber: string;
  profileImage?: string;
}

export default function MyInfoPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/me`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        if (data.success) {
          setUser(data.data);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <Link
            href="/user/dashboard/my-info"
            className="text-green-600 border-b-2 border-green-600 py-4 px-2 font-semibold"
          >
            내 정보
          </Link>
          <Link
            href="/user/dashboard/my-lecture"
            className="text-gray-500 hover:text-gray-700 py-4 px-2 hover:border-b-2 hover:border-gray-300"
          >
            수강 강의
          </Link>
          <Link
            href="/user/dashboard/my-order-list"
            className="text-gray-500 hover:text-gray-700 py-4 px-2 hover:border-b-2 hover:border-gray-300"
          >
            결제 내역
          </Link>
          <Link
            href="/user/dashboard/my-exercises"
            className="text-gray-500 hover:text-gray-700 py-4 px-2 hover:border-b-2 hover:border-gray-300"
          >
            운동 기록 내역
          </Link>
          <Link
            href="/user/dashboard/my-inquiry"
            className="text-gray-500 hover:text-gray-700 py-4 px-2 hover:border-b-2 hover:border-gray-300"
          >
            1:1 상담
          </Link>
          <Link
            href="/user/dashboard/todo-list"
            className="text-gray-500 hover:text-gray-700 py-4 px-2"
          >
            todo list
          </Link>
        </nav>
      </div>

      {/* User Information */}
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm">
        <div className="p-8">
          <h2 className="text-2xl font-semibold mb-8">회원 정보</h2>

          <div className="flex items-start space-x-8">
            {/* Profile Image */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                <Image
                  src={user?.profileImage || "/images/default-profile.jpg"}
                  alt="프로필 이미지"
                  fill
                  className="object-cover"
                />
              </div>
              <button className="text-sm text-gray-600">사진 변경</button>
            </div>

            {/* User Details */}
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <p className="text-gray-600">닉네임</p>
                <p className="font-medium">{user?.nickname}</p>
              </div>

              <div className="space-y-2">
                <p className="text-gray-600">이메일</p>
                <p className="font-medium">{user?.email}</p>
              </div>

              <div className="space-y-2">
                <p className="text-gray-600">연락처</p>
                <p className="font-medium">{user?.phoneNumber}</p>
              </div>

              <div className="flex space-x-4 mt-8">
                <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">
                  회원정보 수정
                </button>
                <button className="px-4 py-2 border border-green-500 text-green-500 rounded-md hover:bg-green-50 transition-colors">
                  트레이너 신청
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
