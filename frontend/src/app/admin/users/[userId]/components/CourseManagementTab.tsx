"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // 상세 페이지 이동을 위해 Link 컴포넌트 사용

// 날짜 포맷팅 함수
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\. /g, '-').replace('.', '');
  } catch (e) {
    console.error("날짜 포맷팅 오류:", e, "원본:", dateString);
    return dateString;
  }
};

// 강의 상태에 따른 스타일 반환 함수
const getLectureStatusStyle = (status: string) => {
  // 백엔드 AdminLectureDto의 status 필드 (LectureStatus enum의 description 값) 기준
  if (status === '예정') return 'bg-blue-100 text-blue-800';
  if (status === '진행중') return 'bg-green-100 text-green-800';
  if (status === '완강') return 'bg-purple-100 text-purple-800';
  return 'bg-gray-100 text-gray-800';
};

interface CourseManagementTabProps {
  trainerId: string | string[] | undefined; // 강사 ID (userId가 곧 trainerId)
  apiBaseUrl: string;
  userNickname: string;
}

// 백엔드 AdminLectureDto 타입
interface AdminLectureDto {
  lectureId: number;
  title: string;
  totalStudentCount: number;
  averageRating: number;
  createdDate: string; // 강의 개설일 (Lecture 엔티티의 createdDate)
  status: string; // 예정, 진행중, 완강
}

const CourseManagementTab: React.FC<CourseManagementTabProps> = ({ trainerId, apiBaseUrl, userNickname }) => {
  const [managedCourses, setManagedCourses] = useState<AdminLectureDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const PAGE_SIZE = 5; // 한 페이지에 보여줄 강의 수

  useEffect(() => {
    const fetchManagedCourses = async () => {
      if (!trainerId) return;

      setIsLoading(true);
      setError(null);
      console.log(`CourseManagementTab: trainerId ${trainerId}, page ${currentPage} 데이터 가져오기 시작`);

      try {
        // AdminUserController의 getLecturesByTrainer API 사용
        const response = await fetch(
          `${apiBaseUrl}/api/v1/admin/users/${trainerId}/lectures?page=${currentPage}&size=${PAGE_SIZE}&sort=createdDate,desc`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }
        );

        console.log(`CourseManagementTab: 응답 상태: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `관리 강의 목록을 가져오는데 실패했습니다. 상태: ${response.status}`;
          try { const errorJson = JSON.parse(errorText); errorMessage = errorJson.message || errorMessage; } catch (e) { /*nop*/ }
          throw new Error(errorMessage);
        }

        const responseData = await response.json();
        console.log(`CourseManagementTab: API 응답 데이터:`, responseData);

        if (responseData.success && responseData.data && responseData.data.content) {
          setManagedCourses(responseData.data.content);
          setTotalPages(responseData.data.totalPages);
        } else {
          throw new Error(responseData.message || '관리 강의 데이터를 올바르게 가져오지 못했습니다.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '관리 강의 로딩 중 알 수 없는 오류');
        setManagedCourses([]);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchManagedCourses();
  }, [trainerId, currentPage, apiBaseUrl, PAGE_SIZE]);

  if (isLoading) return <p className="text-center p-4">관리 강의 목록을 불러오는 중...</p>;
  if (error) return <p className="text-center p-4 text-red-500">오류: {error}</p>;
  if (!isLoading && managedCourses.length === 0) return <p className="text-center p-4">관리중인 강의가 없습니다.</p>;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        {userNickname} 님의 개설 강의 목록
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">강의ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">강의명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총 수강생</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평균 평점</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">개설일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th> */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {managedCourses.map((course) => (
              <tr key={course.lectureId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{course.lectureId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline">
                  {/* 강의 상세 페이지로 이동하는 링크 (추후 구현) */}
                                    {/* 강의 상세 페이지로 이동하는 링크 */}
                                    <Link href={`/lectures/${course.lectureId}`}>
                                      {course.title}
                                    </Link>
                                  </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <i className="fas fa-users text-gray-400 mr-2"></i> {/* 학생 수 아이콘 */}
                                    <span>{course.totalStudentCount}명</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <i className="fas fa-star text-yellow-400 mr-2"></i> {/* 별점 아이콘 */}
                                    <span>{course.averageRating !== null ? course.averageRating.toFixed(1) : 'N/A'}점</span>
                                  </div>
                                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(course.createdDate)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLectureStatusStyle(course.status)}`}>
                    {course.status}
                  </span>
                </td>
                {/*
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">수정</button>
                </td>
                */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            이전
          </button>
          {Array.from({ length: totalPages }, (_, i) => i).map(pageIndex => (
            <button
              key={pageIndex}
              onClick={() => setCurrentPage(pageIndex)}
              className={`px-3 py-1 border rounded-md ${
                currentPage === pageIndex ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              {pageIndex + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1 || totalPages === 0}
            className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseManagementTab;