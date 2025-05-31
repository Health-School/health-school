"use client";

import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { LoginUserContext } from '@/stores/auth/loginUser';

const App: React.FC = () => {
  const authContext = useContext(LoginUserContext);
  const [activeTab, setActiveTab] = useState<string>('equipment');
  const [pendingMachineRequests, setPendingMachineRequests] = useState<PendingMachineRequest[]>([]);
  const [isLoadingPendingMachines, setIsLoadingPendingMachines] = useState<boolean>(false);
  const [pendingMachinesError, setPendingMachinesError] = useState<string | null>(null);
  const [pendingCurrentPage, setPendingCurrentPage] = useState<number>(0);
  const [pendingTotalPages, setPendingTotalPages] = useState<number>(0);
  const [pendingTotalElements, setPendingTotalElements] = useState<number>(0);

  interface PendingMachineRequest {
    machineId: number;
    machineName: string;
    bodyParts: string[];
    machineType: string;
    applicantName: string;
    applicationDate: string;
    status: string;
  }

  const fetchPendingMachineRequests = async () => {
    console.log('fetchPendingMachineRequests 호출됨. activeTab:', activeTab);
    console.log('authContext.loginUser 확인:', authContext?.loginUser);
    console.log('현재 컨텍스트 사용자 역할:', authContext?.loginUser?.roleName);
    console.log('로컬 스토리지 토큰 값:', localStorage.getItem('adminAuthToken'));

    setIsLoadingPendingMachines(true);
    setPendingMachinesError(null);

    if (!authContext || !authContext.isLogin || !authContext.loginUser) {
      setPendingMachinesError("로그인 정보가 없습니다. 다시 로그인해주세요.");
      setIsLoadingPendingMachines(false);
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090';
      const pageToFetch = 0;
      const apiUrl = `${baseUrl}/api/v1/admin/machines/requests?status=PENDING&page=${pageToFetch}&size=10`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = `HTTP error! status: ${response.status}`;
        if (errorData && errorData.message) { errorMessage = errorData.message; }
        if (errorMessage.startsWith("Error: ")) { errorMessage = errorMessage.substring("Error: ".length); }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.success && data.data && data.data.content) {
        setPendingMachineRequests(data.data.content);
        setPendingTotalPages(data.data.totalPages || 0);
        setPendingCurrentPage(data.data.number || 0);
        setPendingTotalElements(data.data.totalElements || 0);
      } else {
        setPendingMachineRequests([]);
        setPendingTotalPages(0);
        setPendingCurrentPage(0);
        setPendingTotalElements(0);
        console.error('API 응답 데이터 구조가 예상과 다릅니다:', data);
      }

    } catch (error) {
      console.error('승인 대기 운동기구 목록 조회 에러:', error);
      if (error instanceof Error) {
        setPendingMachinesError(error.message);
      } else {
        setPendingMachinesError('알 수 없는 에러가 발생했습니다.');
      }
      setPendingMachineRequests([]);
      setPendingTotalPages(0);
      setPendingCurrentPage(0);
      setPendingTotalElements(0);
    } finally {
      setIsLoadingPendingMachines(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'equipment') {
      fetchPendingMachineRequests();
    }
  }, [activeTab, authContext]);

  const handleEquipmentAction = async (machineId: number, action: 'approve' | 'reject') => {
    if (action === 'approve') {
      console.log(`운동기구 승인 시도: ${machineId}`);

      setIsLoadingPendingMachines(true);
      setPendingMachinesError(null);

      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090'}/api/v1/admin/machines/approved/${machineId}`;

        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const responseData = await response.json();

        if (!response.ok) {
          let errorMessage = `HTTP error! status: ${response.status}`;
          if (responseData && responseData.message) {
            errorMessage = responseData.message;
          }
          if (errorMessage.startsWith("Error: ")) {
            errorMessage = errorMessage.substring("Error: ".length);
          }
          throw new Error(`운동기구 승인 실패: ${errorMessage}`);
        }

        console.log('운동기구 승인 API 응답:', responseData);
        alert(responseData.message || '운동기구가 성공적으로 승인되었습니다.');

        fetchPendingMachineRequests();

      } catch (error) {
        console.error('운동기구 승인 중 에러:', error);
        if (error instanceof Error) {
          setPendingMachinesError(error.message);
          alert(`오류: ${error.message}`);
        } else {
          setPendingMachinesError('운동기구 승인 중 알 수 없는 에러가 발생했습니다.');
          alert('운동기구 승인 중 알 수 없는 오류가 발생했습니다.');
        }
      } finally {
        setIsLoadingPendingMachines(false);
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* 상단 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="flex justify-between items-center px-6 py-4">
          <div>
            <h2 className="text-xl font-bold">운동기구 승인 관리</h2>
            <p className="text-sm text-gray-500">운동기구 승인 요청을 관리할 수 있습니다.</p>
          </div>
          <Link
            href="/admin/dashboard"
            className="flex items-center text-[#2ECC71] hover:text-[#27AE60] transition-colors duration-200 cursor-pointer"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            <span>관리자 메인으로 돌아가기</span>
          </Link>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="p-6">
        {/* 승인 대기 운동기구 목록 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
           <h2 className="text-xl font-bold">운동기구 승인 관리</h2>
           </div>

          {isLoadingPendingMachines && <p className="text-center py-4">승인 대기 목록을 불러오는 중...</p>}
          {pendingMachinesError && <p className="text-center py-4 text-red-500">에러: {pendingMachinesError}</p>}

          {!isLoadingPendingMachines && !pendingMachinesError && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">기구 이름</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">운동 부위</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">기구 타입</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">신청자</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">신청일</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingMachineRequests.length > 0 ? (
                    pendingMachineRequests.map((request) => (
                      <tr key={request.machineId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.machineId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.machineName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {Array.isArray(request.bodyParts) ? request.bodyParts.join(', ') : request.bodyParts}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.machineType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.applicantName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.applicationDate ? new Date(request.applicationDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEquipmentAction(request.machineId, 'approve')}
                              className="px-3 py-1 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27AE60] !rounded-button"
                            >
                              승인
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        승인 대기 중인 운동기구 신청이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-500">
              총 {pendingTotalElements}개 항목 중 {pendingMachineRequests.length}개 표시
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPendingCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={pendingCurrentPage === 0}
                className={`px-3 py-1 rounded-lg transition-colors duration-200 !rounded-button cursor-pointer whitespace-nowrap ${
                  pendingCurrentPage === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                이전
              </button>
              <button
                onClick={() => setPendingCurrentPage(prev => prev + 1)}
                disabled={pendingCurrentPage >= pendingTotalPages - 1}
                className={`px-3 py-1 rounded-lg transition-colors duration-200 !rounded-button cursor-pointer whitespace-nowrap ${
                  pendingCurrentPage >= pendingTotalPages - 1
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
    </div>
  );
};

export default App;