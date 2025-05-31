"use client";

import React, { useState, useEffect } from 'react';


interface Report {
  id: number;
  lectureTitle: string;           // 강의 제목
  reportTypeDescription: string;  // 신고 유형 (한글 설명)
  title: string;                  // 사용자가 입력한 신고 제목
  content: string;                // 신고 내용 (상세보기에 필요)
  createdDate: string;            // 접수일 (백엔드에서 LocalDateTime을 보내면 프론트에서는 string으로 받음)
  reportStatusDescription: string;// 처리 상태 (한글 설명)
  // lectureId?: number; // 필요하다면 추가 (현재 ReportResponseDto에는 없음)
  lectureTrainerName?: string;
}

// 백엔드 페이징 응답을 위한 타입
interface PageResponse<T> {
  content: T[];          // 실제 데이터 목록
  totalPages: number;    // 전체 페이지 수
  totalElements: number; // 전체 데이터 개수
  number: number;        // 현재 페이지 번호 (0부터 시작)
  size: number;          // 페이지 당 항목 수
  // first: boolean;     // 첫 페이지 여부 (필요하면 추가)
  // last: boolean;      // 마지막 페이지 여부 (필요하면 추가)
  // empty: boolean;     // 비어있는 페이지 여부 (필요하면 추가)
}


const App: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
    const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
    const [showNotifyModal, setShowNotifyModal] = useState<boolean>(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [notificationMessage, setNotificationMessage] = useState<string>('');

    const [detailModalSelectedStatus, setDetailModalSelectedStatus] = useState<string>('');


    // API 연동을 위한 상태 변수들
    const [reportsData, setReportsData] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 페이지네이션 상태 변수 (이것만 남기면 돼!)
    const [currentPage, setCurrentPage] = useState<number>(0); // API용 (0부터 시작)
    const [itemsPerPage, setItemsPerPage] = useState<number>(10); // API용
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalReportCount, setTotalReportCount] = useState<number>(0);

      const API_BASE_URL = 'http://localhost:8090'; // 백엔드 API 기본 주소

      // API 호출 함수
      const fetchReports = async (page: number, size: number, status: string | null) => {
        setIsLoading(true);
        setError(null);
        try {
          // API URL 구성
          let apiUrl = `${API_BASE_URL}/api/v1/admin/reports?page=${page}&size=${size}&sort=createdDate,desc`;
          if (status && status !== 'ALL') { // 'ALL'은 백엔드에서 status 파라미터 없이 보내는 것으로 약속
            apiUrl += `&status=${status}`;
          }

          console.log("요청 API URL:", apiUrl);

          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',

            },
            credentials: 'include', // 인증 쿠키를 함께 보내기 위한 설정
          });

          if (!response.ok) {
            let errorMessage = `API Error: ${response.status}`;
            try {
              const errorData = await response.json();
              errorMessage = errorData.message || errorMessage;
            } catch (e) {
              // 에러 응답이 JSON이 아닐 경우 대비
              console.error("Failed to parse error response:", e);
            }
            throw new Error(errorMessage);
          }

          const responseData: any = await response.json(); // 백엔드 ApiResponse<PageResponse<Report>> 구조

          console.log("API 응답 데이터:", responseData); // API 응답 전체 구조 확인용

          if (responseData && responseData.success) {
            const result: PageResponse<Report> = responseData.data; // 실제 PageResponse<Report> 객체
            if (result && result.content) { // result 객체와 result.content가 모두 존재하는지 확인
                          if (result.content.length > 0) {
                            console.log("첫 번째 신고 데이터:", result.content[0]); // 첫 번째 데이터 전체를 한번 보자
                            console.log("첫 번째 신고 데이터의 createdDate:", result.content[0].createdDate);
                          } else {
                            console.log("API 응답: 신고 데이터가 비어 있습니다 (result.content is empty).");
                          }
                        } else {
                          console.log("API 응답: result 또는 result.content가 undefined 입니다.", result);
                        }


            setReportsData(result.content);
            setTotalPages(result.totalPages);
            setTotalReportCount(result.totalElements);
            setCurrentPage(result.number); // 백엔드에서 받은 현재 페이지로 업데이트 (0부터 시작)
          } else {
            throw new Error(responseData.message || "Failed to fetch reports from API");
          }

        } catch (err: any) {
          console.error("fetchReports 에러:", err); // 콘솔에 에러 상세 기록
          setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
          setReportsData([]);
          setTotalPages(0);
          setTotalReportCount(0);
        } finally {
          setIsLoading(false);
        }
      };

      useEffect(() => {
        const effectiveStatusFilter = statusFilter === '전체' ? null : statusFilter;
        fetchReports(currentPage, itemsPerPage, effectiveStatusFilter);
      }, [currentPage, itemsPerPage, statusFilter]);

  const handleSendNotification = async () => {
      if (!selectedReport || !notificationMessage.trim()) {
        alert("선택된 신고가 없거나 알림 메시지가 비어있습니다.");
        return;
      }

      console.log(`알림 전송 시도: Report ID = ${selectedReport.id}, 메시지 = "${notificationMessage}"`);
      // setIsLoading(true); // 로딩 상태 관리한다면 주석 해제

      try {
        const apiUrl = `${API_BASE_URL}/api/v1/admin/reports/${selectedReport.id}/notify-trainer`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ message: notificationMessage }),
        });

        const responseData = await response.json();

        if (!response.ok) {
          console.error("알림 전송 API 에러 응답:", responseData);
          throw new Error(responseData.message || `알림 전송 실패: ${response.status}`);
        }

        if (responseData && responseData.success) {
          alert('강사에게 알림을 성공적으로 전송했습니다.');
          setShowNotifyModal(false);
          setNotificationMessage('');
        } else {
          console.error("알림 전송 API 응답 오류 (success: false):", responseData);
          throw new Error(responseData.message || "알림 전송 후 API 응답 오류");
        }

      } catch (err: any) {
        console.error("handleSendNotification 함수 에러:", err);
        alert(`알림 전송 중 오류 발생: ${err.message}`);
      } finally {
        // setIsLoading(false); // 로딩 상태 관리한다면 주석 해제
      }
    };



  const handleReportStatusUpdate = async () => {
      if (!selectedReport || !detailModalSelectedStatus) {
        alert("잘못된 접근입니다.");
        return;
      }

      // detailModalSelectedStatus가 한글 설명 값이라면, 실제 Enum 값으로 변환 필요
      // 예: '처리 대기중' -> 'PENDING'
      // 위 findStatusEnumKey와 유사한 로직 또는 직접적인 매핑 사용
      // 지금은 detailModalSelectedStatus가 이미 Enum 값(PENDING, RESOLVED, REJECTED)이라고 가정

      try {
        const apiUrl = `${API_BASE_URL}/api/v1/admin/reports/${selectedReport.id}/status`;
        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ status: detailModalSelectedStatus }), // 백엔드 AdminReportStatusUpdateRequestDto 구조에 맞게
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `상태 변경 실패: ${response.status}`);
        }

        const responseData = await response.json();
        if (responseData && responseData.success) {
          alert('신고 상태가 성공적으로 변경되었습니다.');
          setShowDetailModal(false); // 모달 닫기
          // 목록 새로고침 (현재 페이지, 현재 필터 유지)
          const effectiveStatusFilter = statusFilter === '전체' ? null : statusFilter;
          fetchReports(currentPage, itemsPerPage, effectiveStatusFilter);
        } else {
          throw new Error(responseData.message || "상태 변경 후 API 응답 오류");
        }

      } catch (err: any) {
        console.error("handleReportStatusUpdate 에러:", err);
        alert(`오류 발생: ${err.message}`);
      }
    };


  // 신고 상세 정보 열기
  const openReportDetail = (report: any) => {
    setSelectedReport(report);
    const findStatusEnumKey = (description: string): string => {
            if (description === '처리 대기중') return 'PENDING';
            if (description === '처리 완료') return 'RESOLVED';
            if (description === '반려') return 'REJECTED';
            return ''; // 기본값 또는 에러 처리
        };
        setDetailModalSelectedStatus(findStatusEnumKey(report.reportStatusDescription));
    setShowDetailModal(true);
  };

  // 강사 알림 모달 열기
  const openNotifyModal = () => {
    setShowDetailModal(false);
    setShowNotifyModal(true);
  };

  // 상태에 따른 배지 스타일
  const getStatusBadgeStyle = (status: string) => {
    switch(status) {
      case '처리 대기중':
        return 'bg-yellow-100 text-yellow-800';
      case '처리 완료':
        return 'bg-green-100 text-green-800';
      case '반려':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-[#2C3E50]">


      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto">
        {/* 상단 헤더 */}
        <header className="bg-white shadow-sm">
          <div className="flex justify-between items-center px-6 py-4">
            <div>
              <h2 className="text-xl font-bold">신고 관리</h2>
              <p className="text-sm text-gray-500">2025년 5월 31일 토요일</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="검색..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent text-sm"
                />
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              </div>
              <div className="relative">
                <button className="relative p-2 text-gray-600 hover:text-[#2ECC71] transition-colors duration-200 cursor-pointer">
                  <i className="fas fa-bell text-xl"></i>
                  <span className="absolute top-0 right-0 w-4 h-4 bg-[#E74C3C] text-white text-xs flex items-center justify-center rounded-full">3</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* 신고 관리 컨텐츠 */}
        <div className="p-6">
          {/* 필터 섹션 */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">처리 상태</label>
                  <div className="relative">
                   <select
                                         id="status-filter"
                                         value={statusFilter} // 이 값은 이제 'PENDING', 'RESOLVED', 'REJECTED', 'ALL' 등이 되어야 함
                                         onChange={(e) => {
                                           setStatusFilter(e.target.value);
                                           setCurrentPage(0); // 필터 변경 시 첫 페이지로 이동
                                         }}
                                         className="pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-[#2ECC71] focus:border-[#2ECC71] rounded-md appearance-none bg-white text-sm"
                                       >
                                         <option value="ALL">전체</option> {/* 백엔드에서 status 파라미터가 없거나 'ALL'일 때 전체 조회 약속 */}
                                         <option value="PENDING">처리 대기중</option>
                                         <option value="RESOLVED">처리 완료</option>
                                         <option value="REJECTED">반려</option>
                                       </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <i className="fas fa-chevron-down text-xs"></i>
                    </div>
                  </div>
                </div>


              </div>
              <div className="mt-4 sm:mt-0">
                <div className="flex items-center">
                  <span className="text-sm text-gray-500">총 {totalReportCount}건의 신고</span>
                </div>
              </div>
            </div>
          </div>

          {/* 신고 목록 테이블 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">강의명</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">신고 유형</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">신고 제목</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">신고일</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                   {isLoading ? (
                                      <tr>
                                        <td colSpan={7} className="text-center py-4">로딩 중...</td>
                                      </tr>
                                    ) : error ? (
                                      <tr>
                                        <td colSpan={7} className="text-center py-4 text-red-500">에러: {error}</td>
                                      </tr>
                                    ) : reportsData.length === 0 ? (
                                      <tr>
                                        <td colSpan={7} className="text-center py-4">표시할 신고 내역이 없습니다.</td>
                                      </tr>
                                    ) : (
                                      reportsData.map((report) => ( // reportsData를 직접 사용
                                        <tr key={report.id} className="hover:bg-gray-50">
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{report.id}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.lectureTitle}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.reportTypeDescription}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.title}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {/* 날짜 포맷팅이 필요하면 라이브러리(예: date-fns) 사용 또는 간단히 처리 */}
                                            {new Date(report.createdDate).toLocaleDateString('ko-KR')}

                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeStyle(report.reportStatusDescription)}`}>
                                              {report.reportStatusDescription}
                                            </span>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                              onClick={() => openReportDetail(report)}
                                              className="text-[#3498DB] hover:text-[#2980B9] transition-colors duration-200"
                                            >
                                              상세보기
                                            </button>
                                          </td>
                                        </tr>
                                      ))
                                    )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 페이지네이션 */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
                          {/* 기존 코드: 총 {filteredReports.length}건 중 {indexOfFirstItem + 1}~{Math.min(indexOfLastItem, filteredReports.length)}건 표시
                            이 부분을 아래처럼 totalReportCount와 API에서 받아온 페이지 정보를 사용하도록 변경
                          */}
                          총 {totalReportCount}건 (현재 페이지: {isLoading || reportsData.length === 0 ? 0 : currentPage + 1} / {totalPages})
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            disabled={isLoading || currentPage === 0} // 로딩 중이거나 첫 페이지면 비활성화
                            className={`px-3 py-1 rounded-lg transition-colors duration-200 !rounded-button cursor-pointer whitespace-nowrap ${
                              isLoading || currentPage === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            이전
                          </button>
                          {/* 페이지 번호 직접 선택 기능 (선택 사항)
                            이 부분도 totalPages를 사용해야 함
                          */}
                          {/* {Array.from({ length: totalPages }, (_, i) => i).map(pageNumber => (
                            <button
                              key={pageNumber}
                              onClick={() => setCurrentPage(pageNumber)}
                              disabled={isLoading}
                              className={`px-3 py-1 rounded-lg ${isLoading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : currentPage === pageNumber ? 'bg-[#2ECC71] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                              {pageNumber + 1}
                            </button>
                          ))}
                          */}
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages > 0 ? totalPages - 1 : 0, prev + 1))}
                            disabled={isLoading || currentPage >= totalPages - 1 || totalPages === 0} // 로딩 중이거나 마지막 페이지거나 페이지가 없으면 비활성화
                            className={`px-3 py-1 rounded-lg transition-colors duration-200 !rounded-button cursor-pointer whitespace-nowrap ${
                              isLoading || currentPage >= totalPages - 1 || totalPages === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            다음
                          </button>
                        </div>
          </div>
        </div>
      </div>

      {/* 신고 상세 모달 */}
    {showDetailModal && selectedReport && (
      <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">신고 상세 정보</h3>
            <button
              onClick={() => setShowDetailModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">강의명</h4>
              <p className="mt-1">{selectedReport.lectureTitle}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">신고 유형</h4>
              <p className="mt-1">{selectedReport.reportTypeDescription}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">신고 제목</h4>
              <p className="mt-1">{selectedReport.title}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">신고 내용</h4>
              <p className="mt-1 whitespace-pre-line">{selectedReport.content}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">신고일</h4>
              <p className="mt-1">{new Date(selectedReport.createdDate).toLocaleString()}</p>
            </div>
            {selectedReport.lectureTrainerName && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">강사명</h4>
                <p className="mt-1">{selectedReport.lectureTrainerName}</p>
              </div>
            )}
            {/* ↓ “처리 상태” 부분을 새로운 <div>로 묶어주었다 ↓ */}
            <div>
              <h4 className="text-sm font-medium text-gray-500">처리 상태</h4>
              <p className="mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeStyle(selectedReport.reportStatusDescription)}`}>
                  {selectedReport.reportStatusDescription}
                </span>
              </p>
            </div>

            <div>
                            <label htmlFor="report-status-changer" className="block text-sm font-medium text-gray-700 mb-1">상태 변경</label>
                            <div className="flex items-center space-x-2">
                              <div className="relative">
                                <select
                                  id="report-status-changer"
                                  value={detailModalSelectedStatus} // 임시 상태와 연결
                                  onChange={(e) => setDetailModalSelectedStatus(e.target.value)}
                                  className="pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-[#2ECC71] focus:border-[#2ECC71] rounded-md appearance-none bg-white text-sm"
                                >
                                  {/* 백엔드 ReportStatus Enum 값에 맞춰서 option 추가 */}
                                  <option value="PENDING">처리 대기중</option>
                                  <option value="RESOLVED">처리 완료</option>
                                  <option value="REJECTED">반려</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                  <i className="fas fa-chevron-down text-xs"></i>
                                </div>
                              </div>
                              <button
                                onClick={handleReportStatusUpdate}
                                className="px-4 py-2 bg-[#3498DB] text-white rounded-lg hover:bg-[#2980B9] transition-colors duration-200 text-sm"
                              >
                                상태 저장
                              </button>
                            </div>
                          </div>

          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setShowDetailModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              닫기
            </button>
            <button
              onClick={openNotifyModal}
              className="px-4 py-2 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27AE60] transition-colors duration-200"
            >
              강사 알림
            </button>
          </div>
        </div>
      </div>
    )}

      {/* 강사 알림 모달 */}
      {showNotifyModal && selectedReport && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">강사 알림</h3>
              <button
                onClick={() => setShowNotifyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="mb-4">
              <label htmlFor="notification-message" className="block text-sm font-medium text-gray-700 mb-1">
                알림 메시지
              </label>
              <textarea
                id="notification-message"
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent text-sm"
                rows={4}
                placeholder="강사에게 전달할 메시지를 입력하세요."
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNotifyModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                취소
              </button>
              <button
                              onClick={handleSendNotification} // 새로 만든 함수 호출
                              className="px-4 py-2 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27AE60] transition-colors duration-200"
                            >
                              알림 전송
                            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;