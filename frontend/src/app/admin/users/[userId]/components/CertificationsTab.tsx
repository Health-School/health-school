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

// 자격증 승인 상태를 한글과 스타일로 변환하는 함수
const getCertificationStatusInfo = (status: string) => {
  // 백엔드 SubmittedCertificationResponseDto의 approveStatus 필드 (ApproveStatus enum의 description 값) 기준
  if (status === '승인') return { text: '승인', className: 'bg-green-100 text-green-800' };
  if (status === '심사중') return { text: '심사중', className: 'bg-yellow-100 text-yellow-800' };
  if (status === '반려') return { text: '반려', className: 'bg-red-100 text-red-800' };
  return { text: status, className: 'bg-gray-100 text-gray-800' }; // 그 외 상태
};

interface CertificationsTabProps {
  userId: string | string[] | undefined; // 강사 ID (trainerId)
  apiBaseUrl: string;
  userNickname: string;
}

// 백엔드 SubmittedCertificationResponseDto 타입
interface CertificationDto {
  userCertificationId: number;
  certificationName: string;
  issuingInstitution: string;
  acquisitionDate?: string; // Optional
  expirationDate?: string;  // Optional
  approveStatus: string;
  adminComment?: string;    // Optional
  certificationImageUrl?: string; // Optional
  // certificationFileDownloadUrl 필드는 UI에 직접 표시할 필요는 없어 보임
}

const CertificationsTab: React.FC<CertificationsTabProps> = ({ userId, apiBaseUrl, userNickname }) => {
  const [certifications, setCertifications] = useState<CertificationDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const PAGE_SIZE = 4; // 한 페이지에 보여줄 자격증 수 (UI에 맞춰서 조절 가능)

  useEffect(() => {
    const fetchCertifications = async () => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);
      console.log(`CertificationsTab: userId ${userId}, page ${currentPage} 데이터 가져오기 시작`);

      try {
        // AdminUserController의 getTrainerCertifications API 사용
        const response = await fetch(
          `${apiBaseUrl}/api/v1/admin/users/${userId}/certifications?page=${currentPage}&size=${PAGE_SIZE}&sort=createdDate,desc`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }
        );

        console.log(`CertificationsTab: 응답 상태: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `보유 자격증 목록을 가져오는데 실패했습니다. 상태: ${response.status}`;
          try { const errorJson = JSON.parse(errorText); errorMessage = errorJson.message || errorMessage; } catch (e) { /*nop*/ }
          throw new Error(errorMessage);
        }

        const responseData = await response.json();
        console.log(`CertificationsTab: API 응답 데이터:`, responseData);

        if (responseData.success && responseData.data && responseData.data.content) {
          setCertifications(responseData.data.content);
          setTotalPages(responseData.data.totalPages);
        } else {
          throw new Error(responseData.message || '보유 자격증 데이터를 올바르게 가져오지 못했습니다.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '보유 자격증 로딩 중 알 수 없는 오류');
        setCertifications([]);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertifications();
  }, [userId, currentPage, apiBaseUrl, PAGE_SIZE]);

  if (isLoading) return <p className="text-center p-4">보유 자격증 목록을 불러오는 중...</p>;
  if (error) return <p className="text-center p-4 text-red-500">오류: {error}</p>;
  if (!isLoading && certifications.length === 0) return <p className="text-center p-4">보유한 (승인된) 자격증이 없습니다.</p>;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        {userNickname} 님의 보유 자격증 목록
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certifications.map((cert) => (
          <div key={cert.userCertificationId} className="bg-gray-50 p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-md font-semibold text-gray-800">{cert.certificationName}</h4>
              <span className={`px-2 py-0.5 text-xs rounded-full ${getCertificationStatusInfo(cert.approveStatus).className}`}>
                {getCertificationStatusInfo(cert.approveStatus).text}
              </span>
            </div>
            <div className="text-sm text-gray-600 flex items-center"> {/* 발급기관 아이콘 추가 */}
                          <i className="fas fa-landmark text-gray-400 mr-2"></i> {/* 기관 아이콘 (예시) */}
                          <span>발급기관: {cert.issuingInstitution}</span>
                        </div>
                        {cert.acquisitionDate && (
                          <div className="text-sm text-gray-500 flex items-center mt-1"> {/* 취득일 아이콘 추가 */}
                            <i className="fas fa-calendar-alt text-gray-400 mr-2"></i>
                            <span>취득일: {formatDate(cert.acquisitionDate)}</span>
                          </div>
                        )}
                        {cert.expirationDate && (
                          <div className="text-sm text-gray-500 flex items-center mt-1"> {/* 만료일 아이콘 추가 */}
                            <i className="fas fa-calendar-times text-gray-400 mr-2"></i> {/* 만료일 느낌의 달력 아이콘 (예시) */}
                            <span>만료일: {formatDate(cert.expirationDate)}</span>
                          </div>
                        )}
            {cert.certificationImageUrl && (
              <div className="mt-2">
                <a href={cert.certificationImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
                  자격증 이미지 보기
                </a>
              </div>
            )}
            {cert.adminComment && <p className="text-xs text-gray-500 mt-1 italic">관리자 코멘트: {cert.adminComment}</p>}
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

export default CertificationsTab;