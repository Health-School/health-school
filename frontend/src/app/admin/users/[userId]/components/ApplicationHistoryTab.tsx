"use client";

import React, { useState, useEffect } from 'react';

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

// 신청 상태를 한글과 스타일로 변환하는 함수
const getApplicationStatusInfo = (status: string) => {
  // 백엔드의 TrainerApplicationSummaryDto의 status 필드 (TrainerVerificationStatus enum) 기준
  if (status === 'APPROVE_AS_TRAINER') return { text: '승인', className: 'bg-green-100 text-green-800' };
  if (status === 'PENDING_VERIFICATION') return { text: '심사중', className: 'bg-yellow-100 text-yellow-800' };
  if (status === 'REJECT_AS_TRAINER') return { text: '반려', className: 'bg-red-100 text-red-800' };
  return { text: status, className: 'bg-gray-100 text-gray-800' }; // 그 외 상태
};


interface ApplicationHistoryTabProps {
  userId: string | string[] | undefined;
  apiBaseUrl: string;
  userNickname: string;
}

// 백엔드 TrainerApplicationSummaryDto 타입
interface ApplicationSummaryDto {
  applicationId: number;
  userName: string; // 신청 당시 이름 (user.nickname과 다를 수 있음)
  applicationDate: string;
  status: string; // PENDING_VERIFICATION, APPROVE_AS_TRAINER, REJECT_AS_TRAINER
  // 필요하다면 userEmail, userPhoneNumber 필드도 추가 가능
}

const ApplicationHistoryTab: React.FC<ApplicationHistoryTabProps> = ({ userId, apiBaseUrl, userNickname }) => {
  const [applicationHistory, setApplicationHistory] = useState<ApplicationSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const PAGE_SIZE = 5; // 이전 page.tsx에 있던 APPLICATION_HISTORY_PAGE_SIZE 값 (필요시 10으로 수정)

  useEffect(() => {
    const fetchApplicationHistory = async () => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);
      console.log(`ApplicationHistoryTab: userId ${userId}, page ${currentPage} 데이터 가져오기 시작`);

      try {
        // AdminUserController의 getUserTrainerApplicationHistory API 사용
        const response = await fetch(
          `${apiBaseUrl}/api/v1/admin/users/${userId}/trainer-application-history?page=${currentPage}&size=${PAGE_SIZE}&sort=createdDate,desc`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }
        );

        console.log(`ApplicationHistoryTab: 응답 상태: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `강사 신청 이력을 가져오는데 실패했습니다. 상태: ${response.status}`;
          try { const errorJson = JSON.parse(errorText); errorMessage = errorJson.message || errorMessage; } catch (e) { /*nop*/ }
          throw new Error(errorMessage);
        }

        const responseData = await response.json();
        console.log(`ApplicationHistoryTab: API 응답 데이터:`, responseData);

        if (responseData.success && responseData.data && responseData.data.content) {
          setApplicationHistory(responseData.data.content);
          setTotalPages(responseData.data.totalPages);
        } else {
          throw new Error(responseData.message || '강사 신청 이력 데이터를 올바르게 가져오지 못했습니다.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '강사 신청 이력 로딩 중 알 수 없는 오류');
        setApplicationHistory([]);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicationHistory();
  }, [userId, currentPage, apiBaseUrl, PAGE_SIZE]);

  if (isLoading) return <p className="text-center p-4">강사 신청 이력을 불러오는 중...</p>;
  if (error) return <p className="text-center p-4 text-red-500">오류: {error}</p>;
  if (!isLoading && applicationHistory.length === 0) return <p className="text-center p-4">강사 신청 이력이 없습니다.</p>;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        {userNickname} 님의 강사 신청 이력
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">신청서ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">신청자명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">신청일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              {/* 상세 보기 버튼 등 추가 가능 */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applicationHistory.map((application) => (
              <tr key={application.applicationId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{application.applicationId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{application.userName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(application.applicationDate)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    getApplicationStatusInfo(application.status).className
                  }`}>
                    {getApplicationStatusInfo(application.status).text}
                  </span>
                </td>
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

export default ApplicationHistoryTab;