"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import EnrolledCoursesTab from './components/EnrolledCoursesTab';
import PaymentHistoryTab from './components/PaymentHistoryTab';
import ApplicationHistoryTab from './components/ApplicationHistoryTab';
import CertificationsTab from './components/CertificationsTab';
import CourseManagementTab from './components/CourseManagementTab';
import SettlementTab from './components/SettlementTab';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('courses');
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [showMailModal, setShowMailModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [newMemo, setNewMemo] = useState<string>('');

  const params = useParams();
  const userId = params.userId;

  const [currentUserDetail, setCurrentUserDetail] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [userToChangeStatus, setUserToChangeStatus] = useState<number | null>(null);
  const [newStatusForModal, setNewStatusForModal] = useState<string>('active');

  useEffect(() => {
    if (userId) {
      const fetchUserDetails = async () => {
        setIsLoading(true);
        setError(null);
        console.log(`useEffect: 회원 ID ${userId}의 상세 정보 가져오기 시작 (API 호출용)`);

        try {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090';
          const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}/details`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          console.log(`useEffect (API 호출용): 응답 상태: ${response.status} ${response.statusText}`);

          if (!response.ok) {
            const errorDataText = await response.text();
            console.error("useEffect (API 호출용): API 에러 응답 (텍스트):", errorDataText);
            let errorMessage = `회원 상세 정보를 가져오는데 실패했습니다. 상태: ${response.status}`;
            try {
              const errorDataJson = JSON.parse(errorDataText);
              errorMessage = errorDataJson.message || errorMessage;
            } catch (parseError) {  }

            if (response.status === 401) errorMessage = '인증되지 않은 요청입니다. 다시 로그인해보세요.';
            else if (response.status === 403) errorMessage = '접근 권한이 없습니다.';
            throw new Error(errorMessage);
          }

          const responseData = await response.json();
          console.log("useEffect (API 호출용): API 응답 데이터 (JSON):", responseData);

          if (responseData.success && responseData.data) {
            setCurrentUserDetail(responseData.data);
            console.log("useEffect (API 호출용): 회원 상세 정보 업데이트 완료:", responseData.data);
          } else {
            const message = responseData.message || '회원 상세 데이터를 올바르게 가져오지 못했습니다.';
            console.error("useEffect (API 호출용): API 응답 성공했으나 데이터 구조 문제:", message, responseData);
            throw new Error(String(message));
          }

        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
            console.error("useEffect (API 호출용): fetch 중 에러:", err.message, err.stack);
          } else {
            setError('알 수 없는 오류가 발생했습니다.');
            console.error("useEffect (API 호출용): fetch 중 알 수 없는 에러:", err);
          }
          setCurrentUserDetail(null);
        } finally {
          setIsLoading(false);
          console.log("useEffect (API 호출용): fetch 완료, 로딩 해제");
        }
      };

      fetchUserDetails();
    }
  }, [userId]);

  const openStatusModal = (userIdToUpdate: number) => {
    if (currentUserDetail && currentUserDetail.id === userIdToUpdate) {
      const statusMapToFrontend: { [key: string]: string } = {
        'NORMAL': 'active',
        'BANNED': 'suspended',
        'DELETED': 'deleted'
      };
      setNewStatusForModal(statusMapToFrontend[currentUserDetail.userStatus] || 'active');
    } else {
      setNewStatusForModal('active');
    }
    setUserToChangeStatus(userIdToUpdate);
    setShowStatusModal(true);
  };

  const handleChangeStatus = async () => {
    if (userToChangeStatus === null || !currentUserDetail) {
      alert("상태를 변경할 사용자가 선택되지 않았습니다.");
      return;
    }

    const statusMapToBackend: { [key: string]: string } = {
      'active': 'NORMAL',
      'suspended': 'BANNED',
      'deleted': 'DELETED'
    };
    const backendStatus = statusMapToBackend[newStatusForModal];

    if (!backendStatus) {
      alert("유효하지 않은 상태값입니다.");
      return;
    }

    console.log(`사용자 ID ${userToChangeStatus}의 상태를 ${newStatusForModal}(백엔드: ${backendStatus}) (으)로 변경 시도`);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090';
      const url = `${API_BASE_URL}/api/v1/admin/users/${userToChangeStatus}/status`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userStatus: backendStatus }),
      });

      console.log(`handleChangeStatus (${userToChangeStatus} -> ${backendStatus}): 응답 상태:`, response.status, response.statusText);

      if (!response.ok) {
        const errorDataText = await response.text();
        let errorMessage = `상태 변경 처리 중 오류 (${response.status})`;
        try {
          const errorDataJson = JSON.parse(errorDataText);
          errorMessage = errorDataJson.message || errorMessage;
        } catch(e) { /* JSON 파싱 실패 시 그대로 사용 */ }
        console.error("API Error:", errorDataText);
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log(`handleChangeStatus (${userToChangeStatus} -> ${backendStatus}): API 응답:`, responseData);

      if (responseData.success) {
        alert(`사용자 ID ${userToChangeStatus}의 상태가 성공적으로 변경되었습니다.`);
        setCurrentUserDetail((prevDetails: any) => ({
          ...prevDetails,
          userStatus: backendStatus
        }));
      } else {
        throw new Error(responseData.message || '상태 변경에 실패했습니다.');
      }

    } catch (err) {
      if (err instanceof Error) {
        console.error(`handleChangeStatus (${userToChangeStatus}): 에러:`, err.message);
        alert(`오류: ${err.message}`);
      } else {
        console.error(`handleChangeStatus (${userToChangeStatus}): 알 수 없는 에러:`, err);
        alert('알 수 없는 오류로 상태 변경에 실패했습니다.');
      }
    } finally {
      setShowStatusModal(false);
      setUserToChangeStatus(null);
    }
  };

  if (isLoading) {
    return <div className="flex-1 flex justify-center items-center text-xl">회원 정보를 불러오는 중...</div>;
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-red-500 text-xl p-6">
        <p>오류가 발생했습니다: {error}</p>
        <button
          onClick={() => { /* 여기서 데이터 다시 불러오는 함수 호출 로직 추가 가능 */ }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!currentUserDetail) {
    return <div className="flex-1 flex justify-center items-center text-xl">해당 회원 정보를 찾을 수 없습니다.</div>;
  }

  const getRoleInKorean = (role: string) => {
    if (role === 'TRAINER') return '강사';
    if (role === 'ADMIN') return '관리자';
    return '일반 회원';
  };

  const getStatusStyleAndText = (status: string) => {
    if (status === 'NORMAL') return { text: '활성', className: 'bg-[#2ECC71]/10 text-[#2ECC71]' };
    if (status === 'BANNED') return { text: '정지', className: 'bg-[#E74C3C]/10 text-[#E74C3C]' };
    if (status === 'DELETED') return { text: '삭제', className: 'bg-[#95A5A6]/10 text-[#95A5A6]' };
    return { text: '알 수 없음', className: 'bg-gray-200 text-gray-700' };
  };

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

  const getCurrentDateFormatted = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const dayOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][today.getDay()];
    return `${year}년 ${month}월 ${day}일 ${dayOfWeek}`;
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* 상단 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="flex justify-between items-center px-6 py-4">
          <div>
            <h2 className="text-xl font-bold">
              회원 상세 정보 {currentUserDetail.role === 'TRAINER' && '(강사)'}
            </h2>
            <p className="text-sm text-gray-500">{getCurrentDateFormatted()}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="relative p-2 text-gray-600 hover:text-[#2ECC71] transition-colors duration-200 cursor-pointer">
                <i className="fas fa-bell text-xl"></i>
                <span className="absolute top-0 right-0 w-4 h-4 bg-[#E74C3C] text-white text-xs flex items-center justify-center rounded-full">3</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 회원 상세 정보 컨텐츠 */}
      <div className="p-6">
        {/* 상단 네비게이션 */}
        <div className="flex items-center mb-6">
          <a
            href="/admin/users"
            className="flex items-center text-[#3498DB] hover:text-[#2980B9] transition-colors duration-200 cursor-pointer"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            <span>회원 목록으로 돌아가기</span>
          </a>
        </div>

        {/* 회원 기본 정보 카드 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                <img
                  src={currentUserDetail.profileImageUrl || `https://via.placeholder.com/100?text=${currentUserDetail.nickname.charAt(0)}`}
                  alt={currentUserDetail.nickname}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">{currentUserDetail.nickname}</h3>
                <div className="flex items-center mt-1 space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyleAndText(currentUserDetail.userStatus).className}`}>
                    {getStatusStyleAndText(currentUserDetail.userStatus).text}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    currentUserDetail.role === 'TRAINER' ? 'bg-[#3498DB]/10 text-[#3498DB]' :
                    currentUserDetail.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-500' :
                    'bg-[#95A5A6]/10 text-[#95A5A6]'
                  }`}>
                    {getRoleInKorean(currentUserDetail.role)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => openStatusModal(currentUserDetail.id)}
                className="flex items-center space-x-1 px-4 py-2 bg-[#F39C12] text-white rounded-lg hover:bg-[#D35400] transition-colors duration-200 !rounded-button cursor-pointer whitespace-nowrap text-sm"
              >
                <i className="fas fa-user-cog"></i>
                <span>상태 변경</span>
              </button>
              <button
                onClick={() => setShowMailModal(true)}
                className="flex items-center space-x-1 px-4 py-2 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27AE60] transition-colors duration-200 !rounded-button cursor-pointer whitespace-nowrap text-sm"
              >
                <i className="fas fa-envelope"></i>
                <span>메일 발송</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <div className="flex items-center">
                <i className="fas fa-envelope text-gray-400 w-5 text-center mr-3"></i>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 mb-0.5">이메일</span>
                  <span className="text-base">{currentUserDetail.email}</span>
                </div>
              </div>
              <div className="flex items-center">
                <i className="fas fa-phone-alt text-gray-400 w-5 text-center mr-3"></i>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 mb-0.5">전화번호</span>
                  <span className="text-base">{currentUserDetail.phoneNumber || '정보 없음'}</span>
                </div>
              </div>
              <div className="flex items-center">
                <i className="fas fa-calendar-plus text-gray-400 w-5 text-center mr-3"></i>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 mb-0.5">가입일</span>
                  <span className="text-base">{formatDate(currentUserDetail.createdDate)}</span>
                </div>
              </div>
              <div className="flex items-center">
                <i className="fas fa-id-badge text-gray-400 w-5 text-center mr-3"></i>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 mb-0.5">회원 ID</span>
                  <span className="text-base">#{currentUserDetail.id}</span>
                </div>
              </div>
              <div className="flex items-center">
                <i className="fas fa-user-tag text-gray-400 w-5 text-center mr-3"></i>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 mb-0.5">회원 역할</span>
                  <span className="text-base">{getRoleInKorean(currentUserDetail.role)}</span>
                </div>
              </div>
              <div className="flex items-center">
                <i className="fas fa-calendar-check text-gray-400 w-5 text-center mr-3"></i>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 mb-0.5">마지막 정보 수정일</span>
                  <span className="text-base">{formatDate(currentUserDetail.updatedDate)}</span>
                </div>
              </div>
            </div>

            {/* 강사 전용 정보 */}
            {currentUserDetail.role === 'TRAINER' && (
              <>
                {currentUserDetail.selfIntroduction && (
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-medium mb-4">자기소개</h4>
                    <p className="text-gray-700 whitespace-pre-line">
                      {currentUserDetail.selfIntroduction}
                    </p>
                  </div>
                )}

                {currentUserDetail.expertiseAreas && (
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-medium mb-4">전문분야</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentUserDetail.expertiseAreas.split(',').map((area: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-[#2ECC71]/10 text-[#2ECC71] rounded-full text-sm">{area.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}

                {currentUserDetail.careerHistory && (
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-medium mb-4">경력사항</h4>
                    <div className="space-y-4">
                      <p className="text-gray-700 whitespace-pre-line">
                        {currentUserDetail.careerHistory}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 상세 정보 탭 메뉴 */}
        <div className="grid grid-cols-1 gap-6">
          <div className="w-full">
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px overflow-x-auto">
                  {currentUserDetail.role === 'TRAINER' && (
                    <>
                      <button
                        onClick={() => setActiveTab('certifications')}
                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                          activeTab === 'certifications'
                            ? 'border-[#2ECC71] text-[#2ECC71]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap cursor-pointer`}
                      >
                        <i className="fas fa-certificate mr-2"></i>
                        보유 자격증
                      </button>
                      <button
                        onClick={() => setActiveTab('course-management')}
                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                          activeTab === 'course-management'
                            ? 'border-[#2ECC71] text-[#2ECC71]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap cursor-pointer`}
                      >
                        <i className="fas fa-chalkboard-teacher mr-2"></i>
                        개설 강의 목록
                      </button>
                      <button
                        onClick={() => setActiveTab('earnings')}
                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                          activeTab === 'earnings'
                            ? 'border-[#2ECC71] text-[#2ECC71]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap cursor-pointer`}
                      >
                        <i className="fas fa-chart-line mr-2"></i>
                        정산/결산
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setActiveTab('enrolled-courses')}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'enrolled-courses'
                        ? 'border-[#2ECC71] text-[#2ECC71]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap cursor-pointer`}
                  >
                    <i className="fas fa-graduation-cap mr-2"></i>
                    수강중인 강의
                  </button>
                  <button
                    onClick={() => setActiveTab('payment-history')}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'payment-history'
                        ? 'border-[#2ECC71] text-[#2ECC71]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap cursor-pointer`}
                  >
                    <i className="fas fa-receipt mr-2"></i>
                    결제 내역
                  </button>
                  <button
                    onClick={() => setActiveTab('application-history')}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'application-history'
                        ? 'border-[#2ECC71] text-[#2ECC71]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap cursor-pointer`}
                  >
                    <i className="fas fa-file-alt mr-2"></i>
                    강사 신청 이력
                  </button>
                </nav>
              </div>

              {/* 탭 컨텐츠 */}
              <div className="p-6">
                {activeTab === 'certifications' && currentUserDetail && currentUserDetail.role === 'TRAINER' && (
                  <CertificationsTab
                    userId={userId}
                    apiBaseUrl={process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090'}
                    userNickname={currentUserDetail.nickname}
                  />
                )}

                {activeTab === 'course-management' && currentUserDetail && currentUserDetail.role === 'TRAINER' && (
                  <CourseManagementTab
                    trainerId={userId}
                    apiBaseUrl={process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090'}
                    userNickname={currentUserDetail.nickname}
                  />
                )}

                {activeTab === 'earnings' && currentUserDetail && currentUserDetail.role === 'TRAINER' && (
                  <SettlementTab
                    trainerId={userId}
                    apiBaseUrl={process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090'}
                    userNickname={currentUserDetail.nickname}
                  />
                )}

                {activeTab === 'enrolled-courses' && currentUserDetail && (
                  <EnrolledCoursesTab
                    userId={userId}
                    apiBaseUrl={process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090'}
                    userNickname={currentUserDetail.nickname}
                  />
                )}

                {activeTab === 'payment-history' && currentUserDetail && (
                  <PaymentHistoryTab
                    userId={userId}
                    apiBaseUrl={process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090'}
                    userNickname={currentUserDetail.nickname}
                  />
                )}

                {activeTab === 'application-history' && currentUserDetail && (
                  <ApplicationHistoryTab
                    userId={userId}
                    apiBaseUrl={process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090'}
                    userNickname={currentUserDetail.nickname}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 상태 변경 모달 */}
      {showStatusModal && currentUserDetail && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">회원 상태 변경</h3>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setUserToChangeStatus(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="mb-6">
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="status-active"
                    name="userNewStatus"
                    value="active"
                    className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                    checked={newStatusForModal === 'active'}
                    onChange={(e) => setNewStatusForModal(e.target.value)}
                  />
                  <label htmlFor="status-active" className="ml-2 text-sm text-gray-700">
                    활성 상태로 변경
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="status-suspended"
                    name="userNewStatus"
                    value="suspended"
                    className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                    checked={newStatusForModal === 'suspended'}
                    onChange={(e) => setNewStatusForModal(e.target.value)}
                  />
                  <label htmlFor="status-suspended" className="ml-2 text-sm text-gray-700">
                    정지 상태로 변경
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="status-deleted"
                    name="userNewStatus"
                    value="deleted"
                    className="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
                    checked={newStatusForModal === 'deleted'}
                    onChange={(e) => setNewStatusForModal(e.target.value)}
                  />
                  <label htmlFor="status-deleted" className="ml-2 text-sm text-gray-700">
                    삭제 상태로 변경
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setUserToChangeStatus(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                취소
              </button>
              <button
                onClick={handleChangeStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                상태 변경 적용
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;