"use client";

import React, { useState, useEffect } from 'react';

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\. /g, '-').replace('.', '');
  } catch (e) {
    console.error("날짜 포맷팅 오류:", e);
    return dateString;
  }
};

interface EnrolledCoursesTabProps {
  userId: string | string[] | undefined;
  apiBaseUrl: string;
  userNickname: string;
}

interface EnrollDto {
  lectureId: number;
  lectureName: string;
  trainerName: string;
  lectureLevel: string;
  createdDate: string; // 수강 시작일 (LectureUser의 createdDate)
  progressRate?: number;
  coverImageUrl?: string; // (옵션) 강의 커버 이미지
}

const EnrolledCoursesTab: React.FC<EnrolledCoursesTabProps> = ({ userId, apiBaseUrl }) => {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrollDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const PAGE_SIZE = 10;

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);
      console.log(`EnrolledCoursesTab: userId ${userId}, page ${currentPage} 데이터 가져오기 시작`);

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/v1/admin/users/${userId}/enrolled-lectures?page=${currentPage}&size=${PAGE_SIZE}&sort=createdDate,desc`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `수강중인 강의 목록을 가져오는데 실패했습니다. 상태: ${response.status}`;
          try { const errorJson = JSON.parse(errorText); errorMessage = errorJson.message || errorMessage; } catch (e) { /*nop*/ }
          throw new Error(errorMessage);
        }

        const responseData = await response.json();
        if (responseData.success && responseData.data && responseData.data.content) {
          setEnrolledCourses(responseData.data.content);
          setTotalPages(responseData.data.totalPages);
        } else {
          throw new Error(responseData.message || '수강중인 강의 데이터를 올바르게 가져오지 못했습니다.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '수강 목록 로딩 중 알 수 없는 오류');
        setEnrolledCourses([]);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [userId, currentPage, apiBaseUrl, PAGE_SIZE]); // PAGE_SIZE도 의존성에 추가

  if (isLoading) return <p className="text-center p-4">수강중인 강의 목록을 불러오는 중...</p>;
  if (error) return <p className="text-center p-4 text-red-500">오류: {error}</p>;
  if (!isLoading && enrolledCourses.length === 0) return <p className="text-center p-4">수강중인 강의가 없습니다.</p>;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">수강중인 강의 목록</h3>
      <div className="space-y-4">
        {enrolledCourses.map((course) => (
          <div key={course.lectureId} className="bg-gray-50 p-4 rounded-lg shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h4 className="text-md font-semibold text-blue-600 hover:underline cursor-pointer">
                  {course.lectureName}
                </h4>
                <p className="text-sm text-gray-600">강사: {course.trainerName}</p>
              </div>
              <div className="mt-2 sm:mt-0 text-sm text-gray-500">
                <p>강의 수준: {course.lectureLevel}</p>
                <p>수강 신청일: {formatDate(course.createdDate)}</p>
              </div>
            </div>
            {course.progressRate !== undefined && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full"
                    style={{ width: `${course.progressRate}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">{course.progressRate}% 완료</p>
              </div>
            )}
          </div>
        ))}
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

export default EnrolledCoursesTab;