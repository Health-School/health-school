"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 강사 신청 목록
interface TrainerApplicationSummary {
  applicationId: number;
  userId: number;
  userName: string;
  userEmail: string;
  userPhoneNumber: string;
  applicationDate: string;
  status: string;
}

// 페이징 정보
interface Pageable {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
}


interface ApplicantUserInfo {
  userId: number;
  profileImageUrl: string | null;
  name: string;
  email: string;
  phoneNumber: string;
}

// 제출된 자격증
interface SubmittedCertification { // 백엔드의 SubmittedCertificationResponseDto 와 매칭
  userCertificationId: number;
  certificationName: string;
  issuingInstitution: string;
  acquisitionDate: string | null; // 날짜는 string으로 올 수 있음
  expirationDate: string | null;  // 날짜는 string으로 올 수 있음
  approveStatus: string; // 예: "PENDING", "APPROVAL", "DISAPPROVAL"
  adminComment: string | null;
  certificationImageUrl: string | null;
  certificationFileDownloadUrl: string | null; //
}

// 신청서 세부 내용
interface TrainerApplicationDetail { // 백엔드의 TrainerApplicationDetailResponseDto 와 매칭
  applicationId: number;
  applicantUserInfo: ApplicantUserInfo;
  applicationDate: string; // 날짜
  applicationStatus: string; // 예: "PENDING_VERIFICATION" 등
  careerHistory: string;
  expertiseAreas: string;
  selfIntroduction: string;
  submittedCertifications: SubmittedCertification[]; // 자격증 목록
}

const formatPhoneNumber = (phoneNumber?: string | null): string => {
  if (!phoneNumber) return '';
  const cleaned = phoneNumber.replace(/\D/g, '');

  // 11자리 (010-1234-5678)
  if (cleaned.length === 11) {
    const p1 = cleaned.substring(0, 3);
    const p2 = cleaned.substring(3, 7);
    const p3 = cleaned.substring(7);
    return `${p1}-${p2}-${p3}`;
  }

  // 10자리인데 02로 시작 (02-1234-5678)
  if (cleaned.length === 10 && cleaned.startsWith('02')) {
    const p1 = cleaned.substring(0, 2);
    const p2 = cleaned.substring(2, 6);
    const p3 = cleaned.substring(6);
    return `${p1}-${p2}-${p3}`;
  }

  // 그 외 10자리 (031-123-4567 같은)
  if (cleaned.length === 10) {
    const p1 = cleaned.substring(0, 3);
    const p2 = cleaned.substring(3, 6);
    const p3 = cleaned.substring(6);
    return `${p1}-${p2}-${p3}`;
  }

  // 포맷 불가하면 원본 리턴
  return phoneNumber;
};



const App: React.FC = () => {

  const router = useRouter();

  const [activeMenuItem, setActiveMenuItem] = useState<string>('dashboard');
  const [isInstructorMenuOpen, setIsInstructorMenuOpen] = useState<boolean>(false);
  const [selectedApplication, setSelectedApplication] = useState<TrainerApplicationDetail | null>(null);

  const [instructorApprovalFilter, setInstructorApprovalFilter] = useState<string>('all'); // 필터 상태
  const [searchTerm, setSearchTerm] = useState<string>(''); // 검색어


  // 강사 신청 목록 데이터를 담을 상태 변수 (useState 사용, 초기값은 빈 배열)
  const [instructorApprovalRequests, setInstructorApprovalRequests] = useState<TrainerApplicationSummary[]>([]);
  // 로딩 상태를 관리할 변수
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // 페이지네이션 관련 상태 변수들
  const [currentPage, setCurrentPage] = useState<number>(0); // 현재 페이지 (0부터 시작)
  const [totalPages, setTotalPages] = useState<number>(0);   // 전체 페이지 수
  const [totalElements, setTotalElements] = useState<number>(0); // 전체 항목 수
  const PAGE_SIZE = 10; // 한 페이지에 보여줄 항목 수

  const [certificationComments, setCertificationComments] = useState<{[key: number]: string}>({}); // 각 자격증별 검토 의견
  const [finalApprovalComment, setFinalApprovalComment] = useState<string>(''); // 최종 승인



  const fetchInstructorApplications = async (
    page: number,
    filter: string,
    searchTermValue: string
  ) => {
    setIsLoading(true); // 로딩 시작!
    try {
      // API 요청 URL 만들기
      // 파라미터: result (필터), page, size, sort (정렬은 일단 최신순으로 고정하거나 나중에 추가)
        let apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/admin/users/trainer-applications?page=${page}&size=${PAGE_SIZE}&sort=createdDate,desc`; // applicationDate를 createdDate로 변경!

      if (filter !== 'all') {

        let statusParam = '';
        if (filter === 'pending') statusParam = 'PENDING_VERIFICATION';
        else if (filter === 'approved') statusParam = 'APPROVE_AS_TRAINER';
        else if (filter === 'rejected') statusParam = 'REJECT_AS_TRAINER';

        if (statusParam) {
          apiUrl += `&result=${statusParam}`;
        }
      }



      const response = await fetch(apiUrl, { credentials: "include" });
      if (!response.ok) {
        throw new Error('데이터를 불러오는 데 실패했습니다.');
      }
      const data = await response.json();

      if (data.success && data.data) {

        // data.data.content (목록), data.data.totalPages, data.data.number (현재 페이지), data.data.totalElements 등
        setInstructorApprovalRequests(data.data.content); // 실제 목록 데이터
        setTotalPages(data.data.totalPages);             // 전체 페이지 수
        setCurrentPage(data.data.number);                // 현재 페이지 번호 (0부터 시작)
        setTotalElements(data.data.totalElements);       // 전체 항목 수
      } else {
        setInstructorApprovalRequests([]); // 데이터가 없거나 실패하면 빈 배열로
        setTotalPages(0);
        setCurrentPage(0);
        setTotalElements(0);
        console.error("API 응답 실패:", data.message);
      }
    } catch (error) {
      console.error('강사 신청 목록을 불러오는 중 에러 발생:', error);
      setInstructorApprovalRequests([]); // 에러 시 빈 배열
      setTotalPages(0);
      setCurrentPage(0);
      setTotalElements(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructorApplications(currentPage, instructorApprovalFilter, searchTerm);
  }, [currentPage, instructorApprovalFilter, searchTerm]);

  const finalRequestsToShow = searchTerm
      ? instructorApprovalRequests.filter(request =>
          (request.userName && request.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (request.userEmail && request.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (request.userPhoneNumber && request.userPhoneNumber.includes(searchTerm)) // API 응답의 userPhoneNumber 필드명 사용
        )
      : instructorApprovalRequests;

    // 상세 정보 로딩 상태
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);

    // 상세 정보를 불러오는 함수
    const fetchApplicationDetail = async (applicationId: number) => {
      if (!applicationId) return; // applicationId가 없으면 중단

      setIsDetailLoading(true);
      setSelectedApplication(null); // 이전 상세 정보가 보이지 않도록 초기화
      try {

        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/admin/users/trainer-applications/${applicationId}`;
        const response = await fetch(apiUrl, { credentials: "include" });

        if (!response.ok) {
          throw new Error('상세 정보를 불러오는 데 실패했습니다.');
        }
        const data = await response.json();

        if (data.success && data.data) {
          setSelectedApplication(data.data); // API 응답으로 selectedApplication 상태 업데이트
        } else {
          console.error("상세 API 응답 실패:", data.message);
          alert("상세 정보를 가져오지 못했습니다: " + data.message);
          setSelectedApplication(null);
        }
      } catch (error) {
        console.error('상세 정보 로딩 중 에러 발생:', error);
        alert("상세 정보 로딩 중 오류가 발생했습니다.");
        setSelectedApplication(null);
      } finally {
        setIsDetailLoading(false);
      }
    };

  const handleCertificationCommentChange = (userCertificationId: number, comment: string) => {
    setCertificationComments(prevComments => ({
      ...prevComments,
      [userCertificationId]: comment,
    }));
  };

  const handleUpdateCertificationStatus = async (userCertificationId: number, newStatus: 'APPROVAL' | 'DISAPPROVAL') => {
    if (!selectedApplication) return;

    const reason = certificationComments[userCertificationId] || selectedApplication.submittedCertifications.find(c => c.userCertificationId === userCertificationId)?.adminComment || '';
    console.log(`자격증 ID ${userCertificationId} 상태 변경 시도: ${newStatus}, 사유: ${reason}`);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/admin/users/certifications/${userCertificationId}/status`;
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          reviewStatus: newStatus, // 백엔드 DTO의 필드명 reviewStatus 사용
          reason: reason,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("자격증 상태 변경 API 실패:", responseData);
        alert(`자격증 상태 변경 실패: ${responseData.message || '알 수 없는 오류'}`);
        return;
      }

      alert(responseData.message || '자격증 상태가 성공적으로 변경되었습니다.');

      // 화면에 바로 반영하기 위해 selectedApplication 상태 업데이트
      setSelectedApplication(prevDetail => {
        if (!prevDetail) return null;
        return {
          ...prevDetail,
          submittedCertifications: prevDetail.submittedCertifications.map(cert =>
            cert.userCertificationId === userCertificationId
              ? { ...cert, approveStatus: newStatus, adminComment: reason } // adminComment도 업데이트
              : cert
          ),
        };
      });
      // 해당 자격증에 대한 로컬 코멘트 상태는 초기화 (선택적)
      // setCertificationComments(prevComments => {
      //   const newComments = {...prevComments};
      //   delete newComments[userCertificationId];
      //   return newComments;
      // });

    } catch (error) {
      console.error('자격증 상태 변경 중 에러:', error);
      alert('자격증 상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleFinalApprovalCommentChange = (comment: string) => {
    setFinalApprovalComment(comment);
  };

  const handleFinalDecision = async (decision: 'APPROVE_AS_TRAINER' | 'REJECT_AS_TRAINER') => {
    if (!selectedApplication) {
      alert("처리할 신청서 정보가 없습니다.");
      return;
    }

    const userId = selectedApplication.applicantUserInfo.userId;
    const reason = finalApprovalComment.trim(); // 앞뒤 공백 제거

    console.log(`최종 결정 시도 - 사용자 ID: ${userId}, 결정: ${decision}, 사유: ${reason}`);

    const requestOptions = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Authorization 헤더를 직접 설정하는 부분 삭제!
        },
        credentials: 'include' as RequestCredentials, // 이 옵션은 유지!
        body: JSON.stringify({
          result: decision,
          reason: reason,
        }),
      };
      console.log("API 요청 옵션 (Authorization 헤더 없이, credentials:include 만):", requestOptions);


    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/admin/users/${userId}/trainer-verification`;
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          result: decision,
          reason: reason,
        }),
      });




      const responseData = await response.json();

      if (!response.ok) {
        console.error("최종 결정 API 실패:", responseData);
        alert(`최종 처리 실패: ${responseData.message || '알 수 없는 오류'}`);
        return;
      }

      alert(responseData.message || '최종 처리가 완료되었습니다.');

    setSelectedApplication(null);
    setFinalApprovalComment('');

    fetchInstructorApplications(currentPage, instructorApprovalFilter, searchTerm);
    console.log("최종 처리 성공 후 목록 새로고침 호출됨");



    } catch (error) {
      console.error('최종 결정 처리 중 에러:', error);
      alert('최종 결정 처리 중 오류가 발생했습니다.');
    }
  };


  const handleRowClick = (applicationId: number) => {


      if (selectedApplication && selectedApplication.applicationId === applicationId) {
        setSelectedApplication(null);
      } else {
        fetchApplicationDetail(applicationId);
      }
    };


  const filteredInstructorRequests = instructorApprovalFilter === 'all'
      ? instructorApprovalRequests
      : instructorApprovalRequests.filter(request => request.status === instructorApprovalFilter);


  // 검색어로 필터링
  const searchFilteredInstructorRequests = searchTerm
    ? filteredInstructorRequests.filter(request =>
      request.userName.includes(searchTerm) ||
      request.userEmail.includes(searchTerm))
    : filteredInstructorRequests;

  const handleApprove = (id: number) => {
    console.log(`승인: ${id}`);
    // 여기에 승인 로직 추가
  };

  const handleReject = (id: number) => {
    console.log(`반려: ${id}`);
    // 여기에 반려 로직 추가
  };

  return (
    <div className="flex h-screen bg-gray-100 text-[#2C3E50]">


      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto">

        {/* 강사 신청 관리 컨텐츠 */}
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 space-y-4 md:space-y-0">
                <h3 className="text-xl font-bold">강사 신청 목록</h3>
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="이름, 이메일 검색"
                      className="pl-10 pr-4 py-2 w-full md:w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  </div>
                  {/*
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setInstructorApprovalFilter('all')}
                      className={`px-4 py-2 rounded-lg ${instructorApprovalFilter === 'all' ? 'bg-[#2ECC71] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors duration-200 !rounded-button cursor-pointer whitespace-nowrap`}
                    >
                      전체
                    </button>
                    <button
                      onClick={() => setInstructorApprovalFilter('pending')}
                      className={`px-4 py-2 rounded-lg ${instructorApprovalFilter === 'pending' ? 'bg-[#2ECC71] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors duration-200 !rounded-button cursor-pointer whitespace-nowrap`}
                    >
                      대기 중
                    </button>
                    <button
                      onClick={() => setInstructorApprovalFilter('approved')}
                      className={`px-4 py-2 rounded-lg ${instructorApprovalFilter === 'approved' ? 'bg-[#2ECC71] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors duration-200 !rounded-button cursor-pointer whitespace-nowrap`}
                    >
                      승인됨
                    </button>
                    <button
                      onClick={() => setInstructorApprovalFilter('rejected')}
                      className={`px-4 py-2 rounded-lg ${instructorApprovalFilter === 'rejected' ? 'bg-[#2ECC71] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors duration-200 !rounded-button cursor-pointer whitespace-nowrap`}
                    >
                      반려됨
                    </button>
                  </div>
                  */}
                </div>
              </div>
              <div className="overflow-x-auto">
                            {searchFilteredInstructorRequests.length > 0 ? (
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">신청자</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전화번호</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">신청일</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {searchFilteredInstructorRequests.map(request => ( // 여기서 finalRequestsToShow 대신 searchFilteredInstructorRequests 사용!
                                    <tr
                                      key={request.applicationId}
                                      className="hover:bg-gray-50 cursor-pointer"
                                      onClick={() => handleRowClick(request.applicationId)} // 이전 단계에서 수정한 handleRowClick 호출
                                    >
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.userName}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.userEmail}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPhoneNumber(request.userPhoneNumber)}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(request.applicationDate).toLocaleDateString('ko-KR', {
                                          year: 'numeric',
                                          month: '2-digit',
                                          day: '2-digit',
                                        }).replace(/\. /g, '.').slice(0, -1)}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                          request.status === 'PENDING_VERIFICATION' ? 'bg-[#F39C12]/10 text-[#F39C12]' :
                                          request.status === 'APPROVE_AS_TRAINER' ? 'bg-[#2ECC71]/10 text-[#2ECC71]' :
                                          'bg-[#E74C3C]/10 text-[#E74C3C]'
                                        }`}>
                                          {request.status === 'PENDING_VERIFICATION' && '대기중'}
                                          {request.status === 'APPROVE_AS_TRAINER' && '승인됨'}
                                          {request.status === 'REJECT_AS_TRAINER' && '반려됨'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <div className="text-center py-8">
                                <i className="fas fa-search text-gray-300 text-5xl mb-4"></i>
                                <p className="text-gray-500">검색 결과가 없습니다.</p>
                              </div>
                            )}
                          </div>
               {/* 페이지네이션 UI: 전체 페이지 수가 1 이상일 때만 보이도록 */}
                            {totalPages > 0 && (
                              <div className="flex justify-center mt-6">
                                <nav className="flex items-center space-x-2">
                                  {/* 이전 페이지로 가는 버튼 */}
                                  <button
                                    onClick={() => setCurrentPage(currentPage - 1)} // 현재 페이지에서 1 빼기
                                    disabled={currentPage === 0} // 현재 페이지가 첫 페이지(0)면 비활성화
                                    className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 !rounded-button cursor-pointer whitespace-nowrap"
                                  >
                                    <i className="fas fa-chevron-left"></i>
                                  </button>

                                  {/* 페이지 번호 버튼들을 동적으로 생성 */}
                                  {Array.from({ length: totalPages }, (_, i) => i).map(pageNumber => (
                                    <button
                                      key={pageNumber} //
                                      onClick={() => setCurrentPage(pageNumber)} // 해당 페이지 번호로 현재 페이지 상태 변경
                                      className={`px-3 py-1 rounded-lg !rounded-button cursor-pointer whitespace-nowrap ${
                                        currentPage === pageNumber // 현재 보고 있는 페이지면 다른 스타일 적용
                                          ? 'bg-[#2ECC71] text-white'
                                          : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                                      }`}
                                    >
                                      {pageNumber + 1} {/* 화면에는 1부터 시작하는 페이지 번호로 보여주기 */}
                                    </button>
                                  ))}

                                  {/* 다음 페이지로 가는 버튼 */}
                                  <button
                                    onClick={() => setCurrentPage(currentPage + 1)} // 현재 페이지에서 1 더하기
                                    disabled={currentPage === totalPages - 1 || totalPages === 0} // 현재 페이지가 마지막 페이지거나 전체 페이지가 없으면 비활성화
                                    className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 !rounded-button cursor-pointer whitespace-nowrap"
                                  >
                                    <i className="fas fa-chevron-right"></i>
                                  </button>
                                </nav>
                              </div>
                            )}
            </div>

            {/* 강사 신청 상세 보기 */}
             {isDetailLoading && <div className="p-6 text-center">상세 정보 로딩 중...</div>} {/* 로딩 표시 추가 */}

                        {!isDetailLoading && selectedApplication && ( // 로딩 중 아닐 때, 그리고 selectedApplication 데이터가 있을 때만 표시
                          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                            <div className="flex justify-between items-center border-b pb-4 mb-6"> {/* 닫기 버튼과 제목 */}
                              <h3 className="text-xl font-bold">강사 신청 상세 정보</h3>
                              <button
                                onClick={() => setSelectedApplication(null)} // 상세 정보 닫기 버튼
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <i className="fas fa-times text-xl"></i>
                              </button>
                            </div>

                            {/* 신청자 정보 섹션 */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                              <div className="md:col-span-1">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  {/* 프로필 이미지 (있다면) */}
                                  {selectedApplication.applicantUserInfo.profileImageUrl ? (
                                    <img src={selectedApplication.applicantUserInfo.profileImageUrl} alt={selectedApplication.applicantUserInfo.name} className="w-48 h-48 aspect-square rounded-full bg-gray-300 mx-auto mb-6 object-cover" />
                                  ) : (
                                    <div className="w-48 h-48 aspect-square rounded-full bg-gray-300 mx-auto mb-6 flex items-center justify-center">
                                      <i className="fas fa-user text-7xl text-gray-500"></i>
                                    </div>
                                  )}
                                  <h4 className="font-bold mb-4 text-lg">신청자 정보</h4>
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-sm text-gray-500">이름</p>
                                      <p className="font-medium">{selectedApplication.applicantUserInfo.name}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">이메일</p>
                                      <p className="font-medium">{selectedApplication.applicantUserInfo.email}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">전화번호</p>
                                      <p className="font-medium">{formatPhoneNumber(selectedApplication.applicantUserInfo.phoneNumber)}</p> {/* 전화번호 포맷팅 */}
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">신청일</p>
                                      <p className="font-medium">{new Date(selectedApplication.applicationDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').slice(0, -1)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">상태</p>
                                      <span className={`px-2 py-1 text-xs rounded-full ${
                                         selectedApplication.applicationStatus === 'PENDING_VERIFICATION' ? 'bg-[#F39C12]/10 text-[#F39C12]' :
                                         selectedApplication.applicationStatus === 'APPROVE_AS_TRAINER' ? 'bg-[#2ECC71]/10 text-[#2ECC71]' :
                                        selectedApplication.applicationStatus === 'REJECT_AS_TRAINER' ? 'bg-[#E74C3C]/10 text-[#E74C3C]' : ''
                                       }`}>
                                         {selectedApplication.applicationStatus === 'PENDING_VERIFICATION' && '대기 중'}
                                         {selectedApplication.applicationStatus === 'APPROVE_AS_TRAINER' && '승인됨'}
                                         {selectedApplication.applicationStatus === 'REJECT_AS_TRAINER' && '반려됨'}
                                       </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* 경력, 전문분야, 자기소개 섹션 */}
                              <div className="md:col-span-2">
                                <div>
                                  <h4 className="font-bold mb-2 text-lg">경력 사항</h4>
                                  <div className="border rounded-lg p-4 mb-4 whitespace-pre-wrap">{selectedApplication.careerHistory}</div>

                                  <h4 className="font-bold mb-2 text-lg">전문 분야</h4>
                                  <div className="border rounded-lg p-4 mb-4 whitespace-pre-wrap">{selectedApplication.expertiseAreas}</div>

                                  <h4 className="font-bold mb-2 text-lg">자기 소개</h4>
                                  <div className="border rounded-lg p-4 mb-6 whitespace-pre-wrap">{selectedApplication.selfIntroduction}</div>
                                </div>

                                {/* 자격증 및 증빙 자료 섹션 */}
                                <div>
                                  <h4 className="font-bold mb-4 text-lg">자격증 및 증빙 자료</h4>
                                  <div className="space-y-4">
                                    {selectedApplication.submittedCertifications.map((cert, index) => (
                                      <div key={cert.userCertificationId} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <div className="flex items-center space-x-2">
                                              <h5 className="font-bold">{cert.certificationName}</h5>
                                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                                cert.approveStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                cert.approveStatus === 'APPROVAL' ? 'bg-green-100 text-green-700' :
                                                cert.approveStatus === 'DISAPPROVAL' ? 'bg-red-100 text-red-700' : ''
                                              }`}>
                                                {cert.approveStatus === 'PENDING' && '심사중'}
                                                {cert.approveStatus === 'APPROVAL' && '승인'}
                                                {cert.approveStatus === 'DISAPPROVAL' && '반려'}
                                              </span>
                                            </div>
                                            <p className="text-sm text-gray-500">발급기관: {cert.issuingInstitution}</p>
                                            <div className="flex space-x-4">
                                              <p className="text-sm text-gray-500">취득일: {cert.acquisitionDate ? new Date(cert.acquisitionDate).toLocaleDateString('ko-KR').slice(0,-1) : '-'}</p>
                                              <p className="text-sm text-gray-500">만료일: {cert.expirationDate ? new Date(cert.expirationDate).toLocaleDateString('ko-KR').slice(0,-1) : '-'}</p>
                                            </div>
                                          </div>
                                          <div className="flex space-x-2 flex-shrink-0">
                                            {cert.certificationFileDownloadUrl && (
                                              <a
                                                href={cert.certificationFileDownloadUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 !rounded-button cursor-pointer whitespace-nowrap text-xs"
                                              >
                                                <i className="fas fa-download mr-1"></i>
                                                <span>다운로드</span>
                                              </a>
                                            )}
                                            {cert.certificationImageUrl && (
                                              <a
                                                href={cert.certificationImageUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 !rounded-button cursor-pointer whitespace-nowrap text-xs"
                                              >
                                                <i className="fas fa-eye mr-1"></i>
                                                <span>미리보기</span>
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                        {/* 검토 의견 및 개별 승인/반려 버튼 (이 부분은 다음 단계에서 API 연동!) */}
                                        <div className="border-t pt-3">
                                          <div className="mb-2">
                                            <label htmlFor={`cert-comment-${cert.userCertificationId}`} className="block text-sm font-medium text-gray-700 mb-1">검토 의견</label>
                                            <textarea
                                              id={`cert-comment-${cert.userCertificationId}`}
                                              rows={2}
                                              value={certificationComments[cert.userCertificationId] || cert.adminComment || ''}
                                              onChange={(e) => handleCertificationCommentChange(cert.userCertificationId, e.target.value)}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent text-sm"
                                              placeholder="자격증에 대한 검토 의견을 입력하세요..."
                                            ></textarea>
                                          </div>
                                          <div className="flex space-x-2">
                                            <button
                                             onClick={() => handleUpdateCertificationStatus(cert.userCertificationId, 'APPROVAL')}
                                             className="px-3 py-1 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27AE60] transition-colors duration-200 !rounded-button cursor-pointer whitespace-nowrap text-xs"
                                             >
                                             <i className="fas fa-check mr-1"></i>
                                             <span>자격증 승인</span>
                                             </button>
                                            <button
                                            onClick={() => handleUpdateCertificationStatus(cert.userCertificationId, 'DISAPPROVAL')}
                                            className="px-3 py-1 bg-[#E74C3C] text-white rounded-lg hover:bg-[#C0392B] transition-colors duration-200 !rounded-button cursor-pointer whitespace-nowrap text-xs"
                                            >
                                            <i className="fas fa-times mr-1"></i>
                                            <span>자격증 반려</span>
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* 최종 승인/반려 처리 섹션 */}
                                <h4 className="font-bold mt-6 mb-4 text-lg">승인/반려 처리</h4>
                                <div className="border rounded-lg p-4">
                                  <div className="mb-4">
                                    <label htmlFor="approval-note" className="block text-sm font-medium text-gray-700 mb-1">최종 검토 의견</label>
                                    <textarea
                                      id="approval-note"
                                      rows={4}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent"
                                      placeholder="승인 또는 반려 사유를 입력하세요..."
                                      value={finalApprovalComment}
                                      onChange={(e) => handleFinalApprovalCommentChange(e.target.value)}
                                    ></textarea>
                                  </div>
                                  <div className="flex space-x-3">
                                    <button
                                     onClick={() => handleFinalDecision('APPROVE_AS_TRAINER')}
                                     className="px-4 py-2 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27AE60] transition-colors duration-200 !rounded-button cursor-pointer whitespace-nowrap"
                                     >
                                    <i className="fas fa-check mr-1"></i>
                                    <span>최종 승인하기</span>
                                    </button>
                                    <button
                                     onClick={() => handleFinalDecision('REJECT_AS_TRAINER')}
                                     className="px-4 py-2 bg-[#E74C3C] text-white rounded-lg hover:bg-[#C0392B] transition-colors duration-200 !rounded-button cursor-pointer whitespace-nowrap"
                                     >
                                     <i className="fas fa-times mr-1"></i>
                                     <span>최종 반려하기</span>
                                     </button>
                                    <button
                                      onClick={() => setSelectedApplication(null)} // 목록으로 (상세보기 닫기)
                                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 !rounded-button cursor-pointer whitespace-nowrap">
                                      <i className="fas fa-arrow-left mr-1"></i>
                                      <span>목록으로</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
          </div>
      </div>
    </div>
  );
};

export default App;