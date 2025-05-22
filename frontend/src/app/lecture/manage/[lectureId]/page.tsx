"use client";

import { useEffect, useState } from "react";
import CurriculumUploadModal from "@/components/CurriculumUploadModal"; // 앞서 안내한 모달 컴포넌트
import Image from "next/image";
import removeMarkdown from "remove-markdown";

// 강의 상세 DTO
interface LectureDetailDto {
  id: number;
  title: string;
  content: string;
  price: number;
  lectureStatus: string;
  lectureLevel: string;
  trainerName: string;
  trainerProfileImageUrl: string;
  categoryName: string;
  coverImageUrl: string;
  averageScore: number;
  createdAt: string;
}

// 커리큘럼(소강의) DTO
interface CurriculumDto {
  id: number;
  title: string;
  createdAt: string;
  playTime: string;
  viewCount: number;
  isPublic: boolean;
}

export default function LectureManagePage({
  params,
}: {
  params: { lectureId: string };
}) {
  const [lecture, setLecture] = useState<LectureDetailDto | null>(null);
  const [curriculums, setCurriculums] = useState<CurriculumDto[]>([]);
  const [showModal, setShowModal] = useState(false);

  // 강의 상세/커리큘럼 목록 불러오기
  useEffect(() => {
    // 강의 상세 정보 조회
    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectures/${params.lectureId}`,
      {
        credentials: "include",
      }
    )
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          setLecture(response.data);
        }
      })
      .catch((error) => console.error("강의 조회 실패:", error));

    // 커리큘럼 목록 조회
    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectures/${params.lectureId}/curriculums`,
      {
        credentials: "include",
      }
    )
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          setCurriculums(response.data);
        }
      })
      .catch((error) => console.error("커리큘럼 조회 실패:", error));
  }, [params.lectureId]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 강의 정보 카드 */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-white rounded-xl shadow p-6 flex gap-6">
          <Image
            src={lecture?.coverImageUrl || "/lecture-main.jpg"}
            alt="강의 대표 이미지"
            width={180}
            height={120}
            className="rounded-lg object-cover"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">{lecture?.title}</h2>
            <div className="text-gray-700 mb-2">
              {lecture?.content ? removeMarkdown(lecture.content) : ''}
            </div>
            <div className="flex gap-4 text-sm text-gray-500 mb-1">
              <span>
                수강료:{" "}
                <b className="text-black">
                  {lecture?.price?.toLocaleString()}원
                </b>
              </span>
              <span>난이도: {lecture?.lectureLevel}</span>
              <span>상태: {lecture?.lectureStatus}</span>
              <span>평점: {lecture?.averageScore?.toFixed(1) ?? "-"}</span>
            </div>
            <div className="text-xs text-gray-400">
              개설일: {lecture?.createdAt?.slice(0, 10)}
            </div>
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="max-w-4xl mx-auto mt-8 flex gap-4 border-b">
        <button className="px-4 py-2 border-b-2 border-transparent text-gray-500">
          수정/삭제 관리
        </button>
        <button className="px-4 py-2 border-b-2 border-green-500 font-bold text-green-600">
          강의 목록
        </button>
        <button className="px-4 py-2 border-b-2 border-transparent text-gray-500">
          강의 자료
        </button>
        <button className="px-4 py-2 border-b-2 border-transparent text-gray-500">
          피드백/후기
        </button>
        <button className="px-4 py-2 border-b-2 border-transparent text-gray-500">
          수익 통계
        </button>
      </div>

      {/* 강의 목록 테이블 */}
      <div className="max-w-4xl mx-auto mt-4 bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">강의 목록</h3>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded font-semibold"
            onClick={() => setShowModal(true)}
          >
            + 강의 등록
          </button>
        </div>
        <table className="w-full text-center">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2">강의명</th>
              <th>등록일</th>
              <th>재생 시간</th>
              <th>조회수</th>
              <th>공개 여부</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {curriculums.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="py-2">{c.title}</td>
                <td>{c.createdAt?.slice(0, 10)}</td>
                <td>{c.playTime}</td>
                <td>{c.viewCount}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={c.isPublic}
                    readOnly
                    className="accent-green-500"
                  />
                </td>
                <td>
                  <button className="text-blue-500 mr-2">✏️</button>
                  <button className="text-red-500">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 강의 등록 모달 */}
      {showModal && (
        <CurriculumUploadModal
          lectureId={Number(params.lectureId)}
          onClose={() => setShowModal(false)}
          onUploaded={() => {
            // 업로드 후 목록 새로고침
            fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/lectures/${params.lectureId}/curriculums`,
              {
                credentials: "include",
              }
            )
              .then((res) => res.json())
              .then((response) => {
                if (response.success) {
                  setCurriculums(response.data);
                }
              })
              .catch((error) => console.error("커리큘럼 조회 실패:", error));
          }}
        />
      )}
    </div>
  );
}
