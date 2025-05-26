"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type LectureDto = {
  id: number;
  title: string;
  content: string;
  price: number;
  lectureStatus: string;
  lectureLevel: string;
  trainerName: string;
  coverImageUrl: string;
  category: string;
  averageScore: number;
  createdAt: string;
};

type TrainerInfoDto = {
  name: string;
  studentCount: number;
  averageLectureScore: number;
  profileImagePath: string;
};

export default function Home() {
  const [lectures, setLectures] = useState<LectureDto[]>([]);
  const [trainers, setTrainers] = useState<TrainerInfoDto[]>([]);

  useEffect(() => {
    console.log("Fetching popular lectures...");
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectures/popular`)
      .then((res) => res.json())
      .then((data) => {
        setLectures(data.data || []);
      });

    console.log("Fetching popular trainers...");
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/trainers/popular`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Popular trainers data:", data);
        setTrainers(data.data || []);
      });
  }, []);

  // 별점 렌더링 컴포넌트 추가
  function StarRating({ score }: { score: number }) {
    // 0~5 사이로 보정
    const clamped = Math.max(0, Math.min(5, score));
    return (
      <div className="flex items-center">
        <div className="flex">
          {[0, 1, 2, 3, 4].map((i) => {
            if (clamped >= i + 1) {
              // 가득 찬 별
              return (
                <svg
                  key={i}
                  className="h-5 w-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              );
            } else if (clamped > i && clamped < i + 1) {
              // 반 별(소수점)
              return (
                <svg
                  key={i}
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                >
                  <defs>
                    <linearGradient id={`half${i}`}>
                      <stop
                        offset={`${(clamped - i) * 100}%`}
                        stopColor="currentColor"
                      />
                      <stop
                        offset={`${(clamped - i) * 100}%`}
                        stopColor="#e5e7eb"
                      />
                    </linearGradient>
                  </defs>
                  <path
                    fill={`url(#half${i})`}
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              );
            } else {
              // 빈 별
              return (
                <svg
                  key={i}
                  className="h-5 w-5 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              );
            }
          })}
        </div>
        <span className="ml-2 text-sm text-gray-600">{score.toFixed(1)}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[650px]  overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent z-10 "></div>
        <img
          src="https://readdy.ai/api/search-image?query=Modern%20luxury%20fitness%20center%20interior%20with%20panoramic%20windows%2C%20state%20of%20the%20art%20equipment%2C%20natural%20lighting%2C%20minimalist%20design%2C%20people%20exercising%2C%20professional%20gym%20environment%2C%20cinematic%20wide%20shot&width=1440&height=400&seq=17&orientation=landscape"
          alt="건강한 삶을 위한 전문 트레이닝"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="container mx-auto px-4 h-full flex items-center relative z-20">
          <div className="max-w-lg text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              건강한 삶을 위한 전문 트레이닝
            </h1>
            <p className="text-lg mb-8">
              전문 트레이너와 함께 과학적인 방법으로 당신의 목표를 달성하세요.
              지금 시작하세요.
            </p>
          </div>
        </div>
      </section>

      {/* Popular Classes Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">인기 강의</h2>
            <p className="mt-4 text-gray-500">
              원하는 트레이너와 상담하고 맞춤형 코칭을 받아보세요
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {lectures.map((course) => (
              <div
                key={course.id}
                className="flex flex-col rounded-lg shadow-lg overflow-hidden"
              >
                <div className="flex-shrink-0">
                  <Image
                    src={course.coverImageUrl || "/images/default.jpg"}
                    alt="Class thumbnail"
                    width={400}
                    height={300}
                    className="h-48 w-full object-cover"
                  />
                </div>
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-green-600">
                        ₩{course.price.toLocaleString()}
                      </p>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {course.lectureLevel}
                      </span>
                    </div>
                    <h3 className="mt-2 text-xl font-semibold text-gray-900">
                      {course.title}
                    </h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        강사: {course.trainerName}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {course.category}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <StarRating score={course.averageScore} />
                      <span className="text-xs text-gray-500">
                        {new Date(course.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expert Trainers Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              전문 트레이너
            </h2>
            <p className="mt-4 text-gray-500">
              건강한 트레이닝 가이드와 함께하는 건강한 라이프 스타일
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {trainers.map((trainer, index) => (
              <div key={index} className="text-center">
                <div className="relative">
                  <Image
                    src={
                      trainer.profileImagePath || "/images/default-trainer.jpg"
                    }
                    alt={trainer.name}
                    width={200}
                    height={200}
                    className="rounded-full mx-auto w-32 h-32 object-cover"
                  />
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                    ⭐ {trainer.averageLectureScore.toFixed(1)}
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {trainer.name}
                </h3>
                <p className="text-sm text-gray-500">
                  수강생 {trainer.studentCount}명
                </p>
                <div className="mt-2">
                  <StarRating score={trainer.averageLectureScore} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Program Categories */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              프로그램 카테고리
            </h2>
            <p className="mt-4 text-gray-500">
              당신의 목표에 맞는 뷰티 · 건강 · 다이어트 프로그램
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "👨‍🏫",
                title: "전문 트레이너",
                description: "전문가의 맞춤형 코칭",
              },
              {
                icon: "🗣️",
                title: "실시간 1대1 코칭",
                description: "강사와의 실시간 소통",
              },
              {
                icon: "🏋️‍♂️",
                title: "웨이트 트레이닝",
                description: "체계적인 근력 향상 프로그램",
              },
              {
                icon: "📈",
                title: "프로그레시브",
                description: "단계별 맞춤형 운동 프로그램",
              },
            ].map((category, index) => (
              <div
                key={index}
                className="text-center p-6 bg-gray-50 rounded-lg"
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-lg font-medium text-gray-900">
                  {category.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
