"use client";

import Image from "next/image";
import Link from "next/link";

export default function MyLecturePage() {
  const lectures = [
    {
      id: 1,
      title: "초보자를 위한 요가 클래스",
      instructor: "신지연 트레이너",
      progress: 75,
      image: "/images/lectures/yoga-class.jpg",
    },
    {
      id: 2,
      title: "효과적인 웨이트 트레이닝",
      instructor: "박준혁 트레이너",
      progress: 45,
      image: "/images/lectures/weight-training.jpg",
    },
    {
      id: 3,
      title: "코어 강화 필라테스",
      instructor: "차수정 트레이너",
      progress: 30,
      image: "/images/lectures/pilates.jpg",
    },
    {
      id: 4,
      title: "집에서 하는 HIIT 트레이닝",
      instructor: "최동철 트레이너",
      progress: 60,
      image: "/images/lectures/hiit-training.jpg",
    },
  ];

  return (
    <div className="p-6">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <Link
            href="/member/dashboard/my-info"
            className="text-gray-500 hover:text-gray-700 py-4 px-2"
          >
            내 정보
          </Link>
          <Link
            href="/member/dashboard/my-lecture"
            className="text-gray-500 hover:text-gray-700 py-4 px-2"
          >
            수강 강의
          </Link>
          <Link
            href="/member/dashboard/my-order-list"
            className="text-green-500 border-b-2 border-green-500 py-4 px-2"
          >
            결제 내역
          </Link>
          <Link
            href="/member/dashboard/my-exercises"
            className="text-gray-500 hover:text-gray-700 py-4 px-2"
          >
            운동 기록 내역
          </Link>
          <Link
            href="/member/dashboard/my-inquiry"
            className="text-gray-500 hover:text-gray-700 py-4 px-2"
          >
            내 문의
          </Link>
        </nav>
      </div>

      {/* Sort Dropdown */}
      <div className="flex justify-end mb-6">
        <select className="border rounded-md px-3 py-2 text-sm">
          <option value="recent">최신순</option>
          <option value="progress">진행률순</option>
          <option value="name">이름순</option>
        </select>
      </div>

      {/* Lecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lectures.map((lecture) => (
          <div
            key={lecture.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="relative h-48">
              <Image
                src={lecture.image}
                alt={lecture.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{lecture.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{lecture.instructor}</p>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                      진행률
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-green-600">
                      {lecture.progress}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                  <div
                    style={{ width: `${lecture.progress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                  ></div>
                </div>
                <button className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors">
                  강의 이어보기
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8 space-x-2">
        <button className="px-3 py-2 rounded-md hover:bg-gray-100">
          <span className="sr-only">Previous</span>
          &lt;
        </button>
        <button className="px-3 py-2 rounded-md bg-green-500 text-white">
          1
        </button>
        <button className="px-3 py-2 rounded-md hover:bg-gray-100">2</button>
        <button className="px-3 py-2 rounded-md hover:bg-gray-100">
          <span className="sr-only">Next</span>
          &gt;
        </button>
      </div>
    </div>
  );
}
