"use client";

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { LoginUserContext } from '@/stores/auth/loginUser';
import * as echarts from 'echarts';
import { useRouter } from 'next/navigation';

function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090';


// 백엔드에서 받아올 회원 데이터의 타입
interface UserFromBackend {
  id: number;
  nickname: string;
  email: string;
  phoneNumber: string;
  createdDate: string;
  userStatus: string;
  role: string;
  profileImageUrl?: string;
}

// 프론트엔드 화면에 보여줄 회원 데이터 타입
interface UserForFrontend {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: string;
  role: string;
  profileImageUrl?: string;
}

const App: React.FC = () => {
  const router = useRouter();
  const [activeMenuItem, setActiveMenuItem] = useState<string>('users');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');

  const [inputValue, setInputValue] = useState<string>('');
  const debouncedSearch = useDebounce(inputValue, 300);

  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [userToChangeStatus, setUserToChangeStatus] = useState<number | null>(null);

  const [allFetchedUsers, setAllFetchedUsers] = useState<UserForFrontend[]>([]);

  const filteredUsers = React.useMemo(() => {
      if (!inputValue) return allFetchedUsers;
      const key = inputValue.toLowerCase();
      return allFetchedUsers.filter(
        u =>
          u.name.toLowerCase().includes(key) ||
          u.email.toLowerCase().includes(key)
      );
    }, [inputValue, allFetchedUsers]);


  const [totalUsersCount, setTotalUsersCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartsReady, setChartsReady] = useState(false);
  const [thisMonthNewUsersCount, setThisMonthNewUsersCount] = useState<number>(0);
  const [monthlyUserTrend, setMonthlyUserTrend] = useState<{ monthLabels: string[]; seriesData: number[] }>({ monthLabels: [], seriesData: [] });

  const [activeUsersCount, setActiveUsersCount] = useState<number>(0);
  const [suspendedUsersCount, setSuspendedUsersCount] = useState<number>(0);
  const [deletedUsersCount, setDeletedUsersCount] = useState<number>(0);

  const newUserChartRef = React.useRef<echarts.ECharts | null>(null);
  const userStatusChartRef = React.useRef<echarts.ECharts | null>(null);

  const [newStatusForModal, setNewStatusForModal] = useState<string>('active'); // 모달에서 선택된 새 상태 (기본값 'active')



  useEffect(() => {
      if (debouncedSearch !== undefined) {
        setCurrentPage(1);
      }
    }, [debouncedSearch]);


  useEffect(() => {
    const fetchUsersAndSetState = async () => {
      if (!isInitialLoading) setIsFetching(true);
      setError(null);
      console.log("useEffect: fetchUsersAndSetState 시작 (API 호출용)");

      const params = new URLSearchParams();
      params.append('page', (currentPage - 1).toString());
      params.append('size', itemsPerPage.toString());
      params.append('sort', 'createdDate,desc');

      if (debouncedSearch) {
         params.append('searchFilter', debouncedSearch);
      }

      if (userRoleFilter !== 'all') {
        const roleMapToBackend: { [key: string]: string } = { 'admin': 'ADMIN', 'regular': 'USER', 'instructor': 'TRAINER' };
        if (roleMapToBackend[userRoleFilter]) {
          params.append('role', roleMapToBackend[userRoleFilter]);
        }
      }

      const statusMapToBackend: { [key: string]: string } = {
        'active': 'NORMAL',
        'suspended': 'BANNED',
        'deleted': 'DELETED'
      };
      if (userStatusFilter !== 'all') {
        const backendValue = statusMapToBackend[userStatusFilter];
        if (backendValue) {
          params.append('userStatus', backendValue);
        }
      }



      console.log("useEffect (API 호출용): 요청 파라미터:", params.toString());

      try {
        const url = `${API_BASE_URL}/api/v1/admin/users?${params.toString()}`;

                const response = await fetch(url, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  credentials: 'include',

        });

        console.log("useEffect (API 호출용): 응답 상태:", response.status, response.statusText);

        if (!response.ok) {
          const errorDataText = await response.text();
          console.error("useEffect (API 호출용): API 에러 응답 (텍스트):", errorDataText);
          let errorMessage = `회원 목록을 가져오는데 실패했습니다. 상태: ${response.status}`;
          try {
            const errorDataJson = JSON.parse(errorDataText);
            errorMessage = errorDataJson.message || errorMessage;
          } catch (parseError) {  }
          if (response.status === 401) errorMessage = '인증되지 않은 요청입니다. 다시 로그인해보세요.';
          else if (response.status === 403) errorMessage = '접근 권한이 없습니다. 관리자 계정이 맞는지 확인해주세요.';
          throw new Error(errorMessage);
        }

        const responseData = await response.json();
        console.log("useEffect (API 호출용): API 응답 데이터 (JSON):", responseData);

        if (responseData.success && responseData.data && responseData.data.content) {
          const backendUsers: UserFromBackend[] = responseData.data.content;
          const totalElementsFromApi: number = responseData.data.totalElements;
          const totalPagesFromApi: number = responseData.data.totalPages;

          const formattedUsers: UserForFrontend[] = backendUsers.map(user => {
            let frontendRole = '일반';
            if (user.role === 'ADMIN') frontendRole = '관리자';
            else if (user.role === 'TRAINER') frontendRole = '강사';

            let frontendStatus = '활성';
            if (user.userStatus === 'NORMAL') frontendStatus = 'active';
            else if (user.userStatus === 'BANNED') frontendStatus = 'suspended';
            else if (user.userStatus === 'DELETED') frontendStatus = 'deleted';

            return {
              id: user.id,
              name: user.nickname,
              email: user.email,
              phone: user.phoneNumber || 'N/A',
              joinDate: user.createdDate ? user.createdDate.split('T')[0] : 'N/A',
              status: frontendStatus,
              role: frontendRole,
              profileImageUrl: user.profileImageUrl
            };
          });

          setAllFetchedUsers(formattedUsers);

          setTotalUsersCount(totalElementsFromApi);
          setTotalPages(totalPagesFromApi);
          console.log("useEffect (API 호출용): 데이터 처리 및 상태 업데이트 완료");
        } else {
          const message = responseData.message || '회원 데이터를 올바르게 가져오지 못했습니다.';
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
        setAllFetchedUsers([]);
        setTotalUsersCount(0);
        setTotalPages(0);
      } finally {
        if (isInitialLoading) {
           setIsInitialLoading(false);
           } else {
             setIsFetching(false);
           }
        console.log("useEffect (API 호출용): fetch 완료, 로딩 해제");
      }
    };

    fetchUsersAndSetState();
  }, [currentPage, itemsPerPage, userStatusFilter, userRoleFilter, debouncedSearch, dateFilter]);

   useEffect(() => {
      const fetchUserDashboardSummary = async () => {
        console.log("useEffect: fetchUserDashboardSummary 시작 (API 호출용)");
        try {
          const url = `${API_BASE_URL}/api/v1/admin/dashboard/user-summary`; // 새로운 백엔드 API 경로
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // 인증 쿠키 포함
          });

          console.log("useEffect (user-summary): 응답 상태:", response.status, response.statusText);
          if (!response.ok) {
            throw new Error(`사용자 대시보드 요약 정보를 가져오는데 실패했습니다. 상태: ${response.status}`);
          }

          const responseData = await response.json();
          console.log("useEffect (user-summary): API 응답 데이터:", responseData);

          if (responseData.success && responseData.data) {
            const summaryData = responseData.data as {
              thisMonthNewUsersCount: number;
              activeUsersCount: number;
              bannedUsersCount: number;
              deletedUsersCount: number;
            }; // 타입 단언 사용

            setThisMonthNewUsersCount(summaryData.thisMonthNewUsersCount);
            setActiveUsersCount(summaryData.activeUsersCount);
            setSuspendedUsersCount(summaryData.bannedUsersCount);
            setDeletedUsersCount(summaryData.deletedUsersCount);

            console.log("useEffect (user-summary): 사용자 대시보드 요약 정보 업데이트 완료:", summaryData);
          } else {
            throw new Error('사용자 대시보드 요약 데이터를 올바르게 가져오지 못했습니다.');
          }
        } catch (err) {
          if (err instanceof Error) {
            console.error("useEffect (user-summary): fetch 중 에러:", err.message);
          } else {
            console.error("useEffect (user-summary): fetch 중 알 수 없는 에러:", err);
          }
          // 에러 발생 시 각 카운트 0으로 초기화
          setThisMonthNewUsersCount(0);
          setActiveUsersCount(0);
          setSuspendedUsersCount(0);
          setDeletedUsersCount(0);
        }
      };

      fetchUserDashboardSummary();
    }, []);

useEffect(() => {
    const fetchMonthlyUserTrend = async () => {
      console.log("useEffect: fetchMonthlyUserTrend 시작 (API 호출용)");
      try {
        const url = `${API_BASE_URL}/api/v1/admin/dashboard/monthly-new-user-signups`; // 백엔드 API 경로
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // 인증 쿠키 포함
        });

        console.log("useEffect (monthly-new-user-signups): 응답 상태:", response.status, response.statusText);
        if (!response.ok) {
          throw new Error(`월별 신규 사용자 추이 데이터를 가져오는데 실패했습니다. 상태: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("useEffect (monthly-new-user-signups): API 응답 데이터:", responseData);

        if (responseData.success && responseData.data && Array.isArray(responseData.data.dataPoints)) {
          const dataPointsFromApi: { date: string; value: number }[] = responseData.data.dataPoints;


          const labels = dataPointsFromApi.map(dp => {
            const dateObj = new Date(dp.date);
            return `${dateObj.getMonth() + 1}월`;
          });
          const values = dataPointsFromApi.map(dp => dp.value);

          setMonthlyUserTrend({ monthLabels: labels, seriesData: values });
          console.log("useEffect (monthly-new-user-signups): 월별 신규 사용자 추이 데이터 업데이트 완료:", { labels, values });
        } else {
          throw new Error('월별 신규 사용자 추이 데이터를 올바르게 가져오지 못했습니다.');
        }
      } catch (err) {
        if (err instanceof Error) {
          console.error("useEffect (monthly-new-user-signups): fetch 중 에러:", err.message);
        } else {
          console.error("useEffect (monthly-new-user-signups): fetch 중 알 수 없는 에러:", err);
        }
        setMonthlyUserTrend({ monthLabels: [], seriesData: [] }); // 에러 시 빈 데이터로 초기화
      }
    };

    fetchMonthlyUserTrend();
  }, []);


  // 페이지네이션
  const currentUsers = filteredUsers;

  // 페이지 변경 핸들러
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // 전체 선택 핸들러
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(currentUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  // 개별 선택 핸들러
  const handleSelectUser = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const openStatusModal = (userId: number) => {
      const userToUpdate = allFetchedUsers.find(u => u.id === userId);
      if (userToUpdate) {
        setNewStatusForModal(userToUpdate.status);
      } else {
        setNewStatusForModal('active');
      }
      setUserToChangeStatus(userId);
      setShowStatusModal(true);
    };

  // 회원 상태 변경 처리
   const handleChangeStatus = async () => {
      if (userToChangeStatus === null) return;

      // 프론트엔드 상태값 ('active', 'suspended', 'deleted')을 백엔드 UserStatus enum 값으로 매핑
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
      setIsFetching(true);
      setError(null);

      try {
        const url = `${API_BASE_URL}/api/v1/admin/users/${userToChangeStatus}/status`;
        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ userStatus: backendStatus }), // 백엔드 enum 값으로 전송
        });

        console.log(`handleChangeStatus (${userToChangeStatus} -> ${backendStatus}): 응답 상태:`, response.status, response.statusText);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `상태 변경 처리 중 오류 (${response.status})` }));
          throw new Error(errorData.message || `상태 변경 실패 (상태: ${response.status})`);
        }

        const responseData = await response.json();
        console.log(`handleChangeStatus (${userToChangeStatus} -> ${backendStatus}): API 응답:`, responseData);

        if (responseData.success) {
          alert(`사용자 ID ${userToChangeStatus}의 상태가 성공적으로 변경되었습니다.`);
          // 목록 새로고침 또는 UI 업데이트
          setAllFetchedUsers(prevUsers =>
            prevUsers.map(u =>
              u.id === userToChangeStatus ? { ...u, status: newStatusForModal } : u
            )
          );
          // 대시보드 카드 숫자들도 갱신해야 할 수 있으므로, fetchUserDashboardSummary를 다시 호출
          const fetchUserDashboardSummary = async () => {
              try {
                  const summaryUrl = `${API_BASE_URL}/api/v1/admin/dashboard/user-summary`;
                  const summaryResponse = await fetch(summaryUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include' });
                  if (!summaryResponse.ok) throw new Error('대시보드 요약 정보 갱신 실패');
                  const summaryResponseData = await summaryResponse.json();
                  if (summaryResponseData.success && summaryResponseData.data) {
                      const data = summaryResponseData.data;
                      setThisMonthNewUsersCount(data.thisMonthNewUsersCount);
                      setActiveUsersCount(data.activeUsersCount);
                      setSuspendedUsersCount(data.bannedUsersCount);
                      setDeletedUsersCount(data.deletedUsersCount);
                  }
              } catch (e) { console.error("대시보드 요약 정보 갱신 중 에러:", e); }
          };
          fetchUserDashboardSummary();


        } else {
          throw new Error(responseData.message || '상태 변경에 실패했습니다.');
        }

      } catch (err) {
        if (err instanceof Error) {
          console.error(`handleChangeStatus (${userToChangeStatus}): 에러:`, err.message);
          setError(err.message);
          alert(`오류: ${err.message}`);
        } else {
          console.error(`handleChangeStatus (${userToChangeStatus}): 알 수 없는 에러:`, err);
          setError('알 수 없는 오류로 상태 변경에 실패했습니다.');
          alert('알 수 없는 오류로 상태 변경에 실패했습니다.');
        }
      } finally {
        setShowStatusModal(false);
        setUserToChangeStatus(null);
        setIsFetching(false);
      }
    };

  // 회원 삭제 처리
  const handleDeleteUser = async (userId: number) => {
      console.log(`사용자 ${userId} 삭제 시도`);
      if (!confirm(`정말로 사용자 ID ${userId}의 계정을 삭제 상태로 변경하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
        return;
      }

      setIsFetching(true); // 로딩 시작 (선택 사항)
      setError(null);

      try {
        const url = `${API_BASE_URL}/api/v1/admin/users/${userId}/status`;
        const response = await fetch(url, {
          method: 'PATCH', // 또는 'PUT', 백엔드 API 정의에 따라
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // 인증 쿠키 포함
          body: JSON.stringify({ userStatus: 'DELETED' }), // 백엔드 UserStatusUpdateRequestDto 형식에 맞게
        });

        console.log(`handleDeleteUser (${userId}): 응답 상태:`, response.status, response.statusText);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `사용자 삭제 처리 중 오류가 발생했습니다. 상태: ${response.status}` }));
          throw new Error(errorData.message || `사용자 삭제 처리 실패 (상태: ${response.status})`);
        }

        const responseData = await response.json();
        console.log(`handleDeleteUser (${userId}): API 응답 데이터:`, responseData);

        if (responseData.success) {
          alert(`사용자 ID ${userId}의 계정이 성공적으로 삭제 상태로 변경되었습니다.`);

          const fetchUsersAndSetState = async () => { // 기존 fetchUsersAndSetState 함수와 동일한 로직으로 목록 갱신

               console.log("삭제 후 회원 목록 갱신 시도...");

               setAllFetchedUsers(prevUsers => prevUsers.map(u => u.id === userId ? {...u, status: 'deleted'} : u));

          };
          fetchUsersAndSetState(); // 목록 새로고침

        } else {
          throw new Error(responseData.message || '사용자 삭제 처리에 실패했습니다.');
        }

      } catch (err) {
        if (err instanceof Error) {
          console.error(`handleDeleteUser (${userId}): 에러:`, err.message);
          setError(err.message); // 에러 상태 업데이트
          alert(`오류: ${err.message}`);
        } else {
          console.error(`handleDeleteUser (${userId}): 알 수 없는 에러:`, err);
          setError('알 수 없는 오류로 사용자 삭제 처리에 실패했습니다.');
          alert('알 수 없는 오류로 사용자 삭제 처리에 실패했습니다.');
        }
      } finally {
        setIsFetching(false); // 로딩 종료 (선택 사항)
      }
    };

  useEffect(() => {
      // 아직 "로딩 중..." 오버레이가 보이고 있다면, 차트 div가 없으므로 아무것도 하지 않음
      if (isInitialLoading) {
        console.log('초기 로딩 중, 차트 초기화 대기...');
        return;
      }

      console.log('초기 로딩 완료, 차트 초기화 시도...');
      const newUserChartDom = document.getElementById('newUserTrendChart');
      const userStatusDom = document.getElementById('userStatusChart');

      // 이미 차트 인스턴스가 만들어져 있다면 다시 init 하지 않도록 방지
      if (!newUserChartRef.current && newUserChartDom) {
        console.log('newUserTrendChart DOM 찾음, init 시도');
        newUserChartRef.current = echarts.init(newUserChartDom);
      } else if (newUserChartRef.current) {
        console.log('newUserTrendChart 이미 초기화됨');
      } else {
        console.warn('newUserTrendChart DOM 요소를 찾을 수 없습니다.');
      }

      if (!userStatusChartRef.current && userStatusDom) {
        console.log('userStatusChart DOM 찾음, init 시도');
        userStatusChartRef.current = echarts.init(userStatusDom);
      } else if (userStatusChartRef.current) {
        console.log('userStatusChart 이미 초기화됨');
      } else {
        console.warn('userStatusChart DOM 요소를 찾을 수 없습니다.');
      }

      // 두 차트 인스턴스가 모두 성공적으로 생성되었는지 확인 후 chartsReady 상태 업데이트
      if (newUserChartRef.current && userStatusChartRef.current && !chartsReady) { // !chartsReady 조건 추가: 불필요한 setChartsReady 호출 방지
        setChartsReady(true);
        console.log('차트 준비 완료! (chartsReady: true)');
      }

      // resize 리스너 설정
      const onResize = () => {
        newUserChartRef.current?.resize();
        userStatusChartRef.current?.resize();
      };
      window.addEventListener('resize', onResize);

      return () => {
        window.removeEventListener('resize', onResize);
        console.log('차트 초기화 useEffect 클린업 (resize 리스너 제거)');
      };
    }, [isInitialLoading, chartsReady]);


   useEffect(() => {

      if (!chartsReady) {
        console.log("차트 아직 준비 안됨 (chartsReady: false)");
        return; // 차트가 준비되지 않았으면 아무것도 하지 않음
      }
        console.log("차트 준비됨, 데이터 업데이트 시도 (chartsReady: true)");

      if (newUserChartRef.current) {
        newUserChartRef.current.setOption({
                  animation: false,
                  tooltip: { // 마우스 올렸을 때 정보 표시
                    trigger: 'axis'
                  },
                  xAxis: {
                    type: 'category' as const,
                    boundaryGap: false, // X축 양 끝에 여백 없애기
                    data: monthlyUserTrend.monthLabels // ★ API에서 받아온 월 이름 배열 사용
                  },
                  yAxis: {
                    type: 'value' as const,
                    name: '가입자 수' // Y축 이름
                  },
                  series: [{
                    name: '신규 회원',
                    type: 'line' as const,
                    smooth: true, // 부드러운 곡선
                    data: monthlyUserTrend.seriesData, // ★ API에서 받아온 가입자 수 배열 사용
                    itemStyle: { color: '#3498DB' },
                    areaStyle: { // 라인 아래 영역 색칠
                      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: 'rgba(52, 152, 219, 0.5)'
                      }, {
                        offset: 1,
                        color: 'rgba(52, 152, 219, 0.1)'
                      }])
                    }
                  }]
                }, true);
      }

      if (userStatusChartRef.current) {
              if (!chartsReady) {
                  console.log("회원 상태 비율 차트: 차트가 아직 준비되지 않아 스킵합니다.");
              } else if (activeUsersCount === 0 && suspendedUsersCount === 0 && deletedUsersCount === 0 && !isInitialLoading) {
                  console.log("회원 상태 비율 차트: 모든 카운트가 0이므로 차트를 비우고 '데이터 없음' 메시지를 표시합니다.");
                  userStatusChartRef.current.clear();
                  userStatusChartRef.current.setOption({
                    title: {
                      text: '표시할 회원 상태 데이터가 없습니다.',
                      left: 'center',
                      top: 'center',
                      textStyle: { fontSize: 14, color: '#888888' }
                    },
                    series: []
                  }, true);
              } else if (activeUsersCount > 0 || suspendedUsersCount > 0 || deletedUsersCount > 0 || isInitialLoading ) {

                  console.log("회원 상태 비율 차트 그리기 시도. 데이터:", { activeUsersCount, suspendedUsersCount, deletedUsersCount });

                  userStatusChartRef.current.setOption({
                    animation: false,
                    tooltip: {
                      trigger: 'item',
                      formatter: '{a} <br/>{b}: {c}명 ({d}%)'
                    },
                    legend: {
                      orient: 'horizontal' as const,
                      left: 'center' as const,
                      bottom: 10,
                      data: ['활성 회원', '정지 회원', '삭제 회원']
                    },
                    series: [{
                      name: '회원 상태',
                      type: 'pie' as const,
                      radius: ['50%', '70%'],
                      avoidLabelOverlap: false,
                      label: { show: false, position: 'center' },
                      emphasis: {
                        label: {
                          show: true,
                          fontSize: '14',
                          fontWeight: 'bold',
                          formatter: '{b}\n{c}명 ({d}%)'
                        }
                      },
                      labelLine: { show: false },
                      data: [

                        { value: activeUsersCount, name: '활성 회원', itemStyle: { color: '#2ECC71' } },
                        { value: suspendedUsersCount, name: '정지 회원', itemStyle: { color: '#E74C3C' } },
                        { value: deletedUsersCount, name: '삭제 회원', itemStyle: { color: '#95A5A6' } },
                      ].filter(item => item.value > 0)
                    }]
                  }, true);
              }
            }
    }, [filteredUsers, chartsReady, monthlyUserTrend, activeUsersCount, suspendedUsersCount, deletedUsersCount]);

  if (isInitialLoading) {
    return <div className="flex justify-center items-center h-screen text-xl">로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-red-500 text-xl">
        <p>오류가 발생했습니다: {error}</p>
        <button
          onClick={() => {
            setError(null);
            setIsInitialLoading(true);
          }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 상단 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        {/* 전체 회원 카드 - API 연동 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">전체 회원</p>
              <h3 className="text-2xl font-bold">{totalUsersCount}</h3>

            </div>
            <div className="w-12 h-12 bg-[#2ECC71]/10 rounded-full flex items-center justify-center">
              <i className="fas fa-users text-[#2ECC71] text-xl"></i>
            </div>
          </div>
        </div>
        {/* 신규 회원 카드 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">신규 회원</p>
              <h3 className="text-2xl font-bold">{thisMonthNewUsersCount}</h3>
              <p className="text-sm text-[#3498DB] mt-1">
                <i className="fas fa-user-plus mr-1"></i>
                <span>이번 달 신규</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-[#3498DB]/10 rounded-full flex items-center justify-center">
              <i className="fas fa-user-plus text-[#3498DB] text-xl"></i>
            </div>
          </div>
        </div>
        {/* 활성 회원 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">활성 회원</p>
              <h3 className="text-2xl font-bold">{activeUsersCount}</h3>
              <p className="text-sm text-[#2ECC71] mt-1">
                <i className="fas fa-check-circle mr-1"></i>
                <span>정상 활동</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-[#2ECC71]/10 rounded-full flex items-center justify-center">
              <i className="fas fa-user-check text-[#2ECC71] text-xl"></i>
            </div>
          </div>
        </div>
        {/* 정지 회원 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">정지 회원</p>
              <h3 className="text-2xl font-bold">{suspendedUsersCount}</h3>
              <p className="text-sm text-[#E74C3C] mt-1">
                <i className="fas fa-ban mr-1"></i>
                <span>활동 정지</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-[#E74C3C]/10 rounded-full flex items-center justify-center">
              <i className="fas fa-user-slash text-[#E74C3C] text-xl"></i>
            </div>
          </div>
        </div>
        {/* 삭제 회원 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">삭제 회원</p>
              <h3 className="text-2xl font-bold">{deletedUsersCount}</h3>
              <p className="text-sm text-[#95A5A6] mt-1">
                <i className="fas fa-trash-alt mr-1"></i>
                <span>계정 삭제</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-[#95A5A6]/10 rounded-full flex items-center justify-center">
              <i className="fas fa-user-times text-[#95A5A6] text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">신규 회원 추이</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs bg-[#2ECC71] text-white rounded-lg cursor-pointer whitespace-nowrap !rounded-button">월간</button>
            </div>
          </div>
          <div id="newUserTrendChart" className="w-full h-64"></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">회원 상태 비율</h3>
            {/*
              <button className="text-[#2ECC71] hover:text-[#27AE60] transition-colors duration-200 cursor-pointer">
                 <i className="fas fa-download mr-1"></i>
                <span>엑셀 다운로드</span>
             </button>
             */}
          </div>
          <div id="userStatusChart" className="w-full h-64"></div>
        </div>
      </div>

      {/* 회원 관리 기능 섹션 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col space-y-6">
          {/* 검색 및 필터 UI */}
          <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
            <h3 className="text-xl font-bold">회원 목록</h3>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="이름, 이메일 검색"
                  className="pl-10 pr-4 py-2 w-full md:w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent text-sm"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);

                  }}
                />
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                {isFetching && (
                  <i className="fas fa-circle-notch fa-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                {/* 상태 필터 */}
                <div className="flex items-center">
                  <span className="text-base font-medium text-gray-700 mr-3">상태:</span>
                  <div className="relative inline-block">
                    <select
                      className="pl-5 pr-12 py-2.5 border-2 border-[#2ECC71]/20 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent text-base font-medium bg-white shadow-sm hover:border-[#2ECC71]/30 transition-colors duration-200"
                      value={userStatusFilter}
                      onChange={(e) => {
                        setUserStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="all">전체</option>
                      <option value="active">활성</option>
                      <option value="suspended">정지</option>
                      <option value="deleted">삭제</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#2ECC71]">
                      <i className="fas fa-chevron-down"></i>
                    </div>
                  </div>
                </div>
                {/* 역할 필터 */}
                <div className="flex items-center ml-0 md:ml-6">
                  <span className="text-base font-medium text-gray-700 mr-3">역할:</span>
                  <div className="relative inline-block">
                    <select
                      className="pl-5 pr-12 py-2.5 border-2 border-[#2ECC71]/20 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent text-base font-medium bg-white shadow-sm hover:border-[#2ECC71]/30 transition-colors duration-200"
                      value={userRoleFilter}
                      onChange={(e) => {
                        setUserRoleFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="all">전체</option>
                      <option value="admin">관리자</option>
                      <option value="regular">일반</option>
                      <option value="instructor">강사</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#2ECC71]">
                      <i className="fas fa-chevron-down"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* 버튼들 */}
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <button
                className="flex items-center space-x-1 px-4 py-2 bg-[#3498DB] text-white rounded-lg hover:bg-[#2980B9] transition-colors duration-200 !rounded-button cursor-pointer whitespace-nowrap text-sm"
                onClick={() => console.log('선택된 회원 메일 발송:', selectedUsers)}
                disabled={selectedUsers.length === 0}
              >
                <i className="fas fa-envelope"></i>
                <span>메일 발송</span>
              </button>
            </div>
            <div>
              <button
                className="flex items-center space-x-1 px-4 py-2 bg-[#E74C3C] text-white rounded-lg hover:bg-[#C0392B] transition-colors duration-200 !rounded-button cursor-pointer whitespace-nowrap text-sm"
                onClick={() => console.log('선택된 회원 삭제 처리:', selectedUsers)}
                disabled={selectedUsers.length === 0}
              >
                <i className="fas fa-trash-alt"></i>
                <span>선택 삭제</span>
              </button>
            </div>
          </div>
          <div className="flex items-center">
            {/*
            <button
              className="flex items-center space-x-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 !rounded-button cursor-pointer whitespace-nowrap text-sm"
              onClick={() => console.log('엑셀 다운로드')}
            >
              <i className="fas fa-file-excel"></i>
              <span>엑셀 다운로드</span>
            </button>
            */}
          </div>
        </div>

        {/* 회원 목록 테이블 */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-3 text-left">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#2ECC71] border-gray-300 rounded focus:ring-[#2ECC71]"
                      checked={currentUsers.length > 0 && selectedUsers.length === currentUsers.length}
                      onChange={handleSelectAll}
                      disabled={currentUsers.length === 0}
                    />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">닉네임</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전화번호</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">역할</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-[#2ECC71] border-gray-300 rounded focus:ring-[#2ECC71]"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectUser(user.id);
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {user.profileImageUrl ? (
                          <img className="h-10 w-10 rounded-full object-cover" src={user.profileImageUrl} alt={`${user.name} 프로필`} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <i className="fas fa-user text-gray-500"></i>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.joinDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === '관리자' ? 'bg-[#9B59B6]/10 text-[#9B59B6]' :
                      user.role === '강사' ? 'bg-[#3498DB]/10 text-[#3498DB]' :
                      'bg-[#95A5A6]/10 text-[#95A5A6]'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.status === 'active' ? 'bg-[#2ECC71]/10 text-[#2ECC71]' :
                      user.status === 'suspended' ? 'bg-[#E74C3C]/10 text-[#E74C3C]' :
                      'bg-[#BDC3C7]/20 text-[#7F8C8D]'
                    }`}>
                      {user.status === 'active' ? '활성' :
                       user.status === 'suspended' ? '정지' : '삭제'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        className={`${user.status === 'active' ? 'text-[#F39C12] hover:text-[#D35400]' : 'text-[#2ECC71] hover:text-[#27AE60]'} cursor-pointer`}
                        title={user.status === 'active' ? '회원 정지' : '회원 활성화'}
                        onClick={(e) => {
                          e.stopPropagation();
                          openStatusModal(user.id);
                        }}
                      >
                        <i className={`fas ${user.status === 'active' ? 'fa-user-slash' : 'fa-user-check'}`}></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && !isInitialLoading && !isFetching && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-500">
                    {error ? '데이터를 불러오는 중 오류가 발생했습니다.' :
                      inputValue ? `'${inputValue}'에 대한 검색 결과가 없습니다.` : '표시할 회원 데이터가 없습니다.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 UI */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-6">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-700">
              전체 <span className="font-medium">{totalUsersCount}</span>명 중{' '}
              <span className="font-medium">{(currentPage - 1) * itemsPerPage + (totalUsersCount > 0 ? 1 : 0)}</span>-
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalUsersCount)}</span>명 표시
            </p>
          </div>
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">페이지당 표시:</label>
              <div className="relative inline-block">
                <select
                  className="pl-3 pr-8 py-1 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent text-sm bg-white"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <i className="fas fa-chevron-down text-xs"></i>
                </div>
              </div>
            </div>
            {totalPages > 0 && (
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-lg border ${currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer'} !rounded-button whitespace-nowrap`}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage <= 3
                    ? i + 1
                    : currentPage >= totalPages - 2
                      ? totalPages - 4 + i
                      : currentPage - 2 + i;
                  if (pageNum > 0 && pageNum <= totalPages) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`px-3 py-1 rounded-lg ${currentPage === pageNum ? 'bg-[#2ECC71] text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-100'} !rounded-button cursor-pointer whitespace-nowrap`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}
                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`px-3 py-1 rounded-lg border ${currentPage === totalPages || totalPages === 0 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer'} !rounded-button whitespace-nowrap`}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* 회원 상태 변경 모달 */}
      {showStatusModal && (
        <div className="fixed inset-0  bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">회원 상태 변경</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                선택한 회원의 상태를 변경하시겠습니까?
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="status-active"
                    name="status"
                    value="active"
                    className="h-4 w-4 text-[#2ECC71] border-gray-300 focus:ring-[#2ECC71]"
                    checked={newStatusForModal === 'active'}
                    onChange={(e) => setNewStatusForModal(e.target.value)}
                  />
                  <label htmlFor="status-active" className="text-sm text-gray-700">활성 상태로 변경</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="status-suspended"
                    name="status"
                    value="suspended"
                    className="h-4 w-4 text-[#2ECC71] border-gray-300 focus:ring-[#2ECC71]"
                    checked={newStatusForModal === 'suspended'}
                    onChange={(e) => setNewStatusForModal(e.target.value)}
                    />
                  <label htmlFor="status-suspended" className="text-sm text-gray-700">정지 상태로 변경</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="status-deleted"
                     name="status" // ★ name 속성은 동일하게 유지
                     value="deleted" // 이 라디오 버튼의 값
                     className="h-4 w-4 text-[#2ECC71] border-gray-300 focus:ring-[#2ECC71]"
                     checked={newStatusForModal === 'deleted'} // ★ newStatusForModal 상태와 연결
                     onChange={(e) => setNewStatusForModal(e.target.value)} // ★ 선택 시 newStatusForModal 업데이트
                  />
                  <label htmlFor="status-deleted" className="text-sm text-gray-700">삭제 상태로 변경</label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                취소
              </button>
              <button
                onClick={handleChangeStatus}
                className="px-4 py-2 bg-[#2ECC71] text-white rounded-lg hover:bg-[#27AE60] transition-colors duration-200"
              >
                변경
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;