"use client";

import React, { useState, useEffect, useContext } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { LoginUserContext } from '@/stores/auth/loginUser';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {

  const router = useRouter();
  const authContext = useContext(LoginUserContext);

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState<string>('dashboard');
  const [isInstructorMenuOpen, setIsInstructorMenuOpen] = useState<boolean>(false);

  useEffect(() => {
      if (!authContext || authContext.isLoginUserPending) {
          return;
      }
      const loginUser = authContext.loginUser;

      if (!authContext.isLogin) {
        alert('로그인이 필요한 페이지입니다.');
        router.replace('/user/login');
        return;
      }

      if (loginUser.roleName !== 'ADMIN') {
        alert('관리자만 접근할 수 있는 페이지입니다.');
        router.replace('/');
        return;
      }

      setIsAuthorized(true);
}, [authContext, router]);

useEffect(() => {
    if (activeMenuItem.startsWith('instructor-')) {
        setIsInstructorMenuOpen(true);
    } else if (activeMenuItem !== 'instructor') {
        setIsInstructorMenuOpen(false);
    }
  }, [activeMenuItem]); // activeMenuItem이 바뀔 때만 실행

if (!authContext || authContext.isLoginUserPending || !isAuthorized) {

    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <p>페이지 접근 권한 확인 중...</p>
      </div>
    );
  }


    const handleLogout = () => {
      console.log("관리자 페이지 로그아웃 처리 시작 (전역 함수 호출)...");
      if (authContext && authContext.logoutAndHome) {
        authContext.logoutAndHome();
      } else {
        console.error("AuthContext 또는 logoutAndHome 함수를 찾을 수 없습니다.");
        alert("로그아웃 기능을 사용할 수 없습니다. 관리자에게 문의하세요.");
      }
    };



  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const daysOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const dayOfWeek = daysOfWeek[today.getDay()];
    return `${year}년 ${month}월 ${day}일 ${dayOfWeek}`;
  };

  const getHeaderTitle = () => {
    if (activeMenuItem === 'dashboard') return '대시보드';
    if (activeMenuItem === 'users') return '회원 관리';
    if (activeMenuItem.startsWith('instructor-')) {
        if (activeMenuItem === 'instructor-list') return '강사 목록';
        if (activeMenuItem === 'instructor-approval') return '강사 자격 신청 관리';
        if (activeMenuItem === 'instructor-certification') return '강사 자격증 관리';
        return '강사 관리';
    }
    if (activeMenuItem === 'courses') return '강의 관리';
    if (activeMenuItem === 'reports') return '신고 관리';
    if (activeMenuItem === 'equipment') return '운동 기구 관리';
    if (activeMenuItem === 'notices') return '공지사항 관리';
    if (activeMenuItem === 'qna') return 'Q&A 관리';
    if (activeMenuItem === 'payments') return '결제 관리';
    return '관리자 페이지';
  };

  const handleInstructorMenuToggle = () => {

    if (isInstructorMenuOpen && (activeMenuItem.startsWith('instructor-') || activeMenuItem === 'instructor')) {
      setIsInstructorMenuOpen(false);

    } else {
      setActiveMenuItem('instructor-approval');
      setIsInstructorMenuOpen(true);
    }
  };

  return (

    <div className="flex h-screen bg-gray-100 text-[#2C3E50]">

      <div className="w-64 bg-[#2C3E50] text-white h-full flex flex-col">
        <div className="p-6 border-b border-[#34495E]">
          <h1 className="text-2xl font-bold text-[#2ECC71]">헬스쿨</h1>
          <p className="text-sm text-gray-400 mt-1">관리자 대시보드</p>
        </div>
        <div className="p-4 border-b border-[#34495E]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#2ECC71] flex items-center justify-center">
              <i className="fa-solid fa-user-shield text-white"></i>
            </div>
            <div>
              <p className="font-medium">관리자</p>
              <p className="text-xs text-gray-400">admin@healthschool.kr</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => {
                    setActiveMenuItem('dashboard');
                    router.push('/admin/dashboard');
                    }}
                className={`w-full flex items-center space-x-3 px-6 py-3 ${activeMenuItem === 'dashboard' ? 'bg-[#34495E] text-[#2ECC71]' : 'text-gray-300 hover:bg-[#34495E] hover:text-white'} transition-colors duration-200 cursor-pointer`}
              >
                <i className="fa-solid fa-gauge-high w-5 text-center"></i>
                <span>대시보드</span>
              </button>
            </li>
            <li>

              <button
                onClick={() => {
                    setActiveMenuItem('users');
                    router.push('/admin/users');
                    }}
                className={`w-full flex items-center space-x-3 px-6 py-3 ${activeMenuItem === 'users' ? 'bg-[#34495E] text-[#2ECC71]' : 'text-gray-300 hover:bg-[#34495E] hover:text-white'} transition-colors duration-200 cursor-pointer no-underline`}
              >
                <i className="fa-solid fa-users w-5 text-center"></i>
                <span>회원 관리</span>
              </button>
            </li>
            <li>
              <button
                onClick={handleInstructorMenuToggle}
                className={`w-full flex items-center space-x-3 px-6 py-3 ${
                  (activeMenuItem === 'instructor' || activeMenuItem.startsWith('instructor-')) ? 'bg-[#34495E] text-[#2ECC71]' : 'text-gray-300 hover:bg-[#34495E] hover:text-white'
                } transition-colors duration-200 cursor-pointer`}
              >
                <i className="fa-solid fa-chalkboard-teacher w-5 text-center"></i>
                <span>강사 관리</span>
              </button>

              {isInstructorMenuOpen && (
                <ul className="mt-2 space-y-1">
                  <li>
                    <button
                      onClick={() => setActiveMenuItem('instructor-list')}
                      className={`w-full flex items-center space-x-3 pl-12 py-2 ${activeMenuItem === 'instructor-list' ? 'text-[#2ECC71]' : 'text-gray-300 hover:text-white'} transition-colors duration-200 cursor-pointer text-sm`}
                    >
                      <span>강사 목록</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveMenuItem('instructor-approval')}
                      className={`w-full flex items-center space-x-3 pl-12 py-2 ${activeMenuItem === 'instructor-approval' ? 'text-[#2ECC71]' : 'text-gray-300 hover:text-white'} transition-colors duration-200 cursor-pointer text-sm`}
                    >
                      <span>강사 자격 신청 관리</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveMenuItem('instructor-certification')}
                      className={`w-full flex items-center space-x-3 pl-12 py-2 ${activeMenuItem === 'instructor-certification' ? 'text-[#2ECC71]' : 'text-gray-300 hover:text-white'} transition-colors duration-200 cursor-pointer text-sm`}
                    >
                      <span>강사 자격증 관리</span>
                    </button>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <button
                onClick={() => setActiveMenuItem('courses')}
                className={`w-full flex items-center space-x-3 px-6 py-3 ${activeMenuItem === 'courses' ? 'bg-[#34495E] text-[#2ECC71]' : 'text-gray-300 hover:bg-[#34495E] hover:text-white'} transition-colors duration-200 cursor-pointer`}
              >
                <i className="fa-solid fa-book w-5 text-center"></i>
                <span>강의 관리</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveMenuItem('reports')}
                className={`w-full flex items-center space-x-3 px-6 py-3 ${activeMenuItem === 'reports' ? 'bg-[#34495E] text-[#2ECC71]' : 'text-gray-300 hover:bg-[#34495E] hover:text-white'} transition-colors duration-200 cursor-pointer`}
              >
                <i className="fa-solid fa-flag w-5 text-center"></i>
                <span>신고 관리</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveMenuItem('equipment')}
                className={`w-full flex items-center space-x-3 px-6 py-3 ${activeMenuItem === 'equipment' ? 'bg-[#34495E] text-[#2ECC71]' : 'text-gray-300 hover:bg-[#34495E] hover:text-white'} transition-colors duration-200 cursor-pointer`}
              >
                <i className="fa-solid fa-dumbbell w-5 text-center"></i>
                <span>운동 기구 관리</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveMenuItem('notices')}
                className={`w-full flex items-center space-x-3 px-6 py-3 ${activeMenuItem === 'notices' ? 'bg-[#34495E] text-[#2ECC71]' : 'text-gray-300 hover:bg-[#34495E] hover:text-white'} transition-colors duration-200 cursor-pointer`}
              >
                <i className="fa-solid fa-bullhorn w-5 text-center"></i>
                <span>공지사항 관리</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveMenuItem('qna')}
                className={`w-full flex items-center space-x-3 px-6 py-3 ${activeMenuItem === 'qna' ? 'bg-[#34495E] text-[#2ECC71]' : 'text-gray-300 hover:bg-[#34495E] hover:text-white'} transition-colors duration-200 cursor-pointer`}
              >
                <i className="fa-solid fa-question-circle w-5 text-center"></i>
                <span>Q&A 관리</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveMenuItem('payments')}
                className={`w-full flex items-center space-x-3 px-6 py-3 ${activeMenuItem === 'payments' ? 'bg-[#34495E] text-[#2ECC71]' : 'text-gray-300 hover:bg-[#34495E] hover:text-white'} transition-colors duration-200 cursor-pointer`}
              >
                <i className="fa-solid fa-credit-card w-5 text-center"></i>
                <span>결제 관리</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => router.push('/')} // 클릭하면 메인 페이지('/')로 이동
                className={`w-full flex items-center space-x-3 px-6 py-3 text-gray-300 hover:bg-[#34495E] hover:text-white transition-colors duration-200 cursor-pointer`}
              >
                <i className="fa-solid fa-home w-5 text-center"></i> {/* 홈 아이콘 */}
                <span>메인 페이지</span>
              </button>
              </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-[#34495E]">
          <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-[#E74C3C] text-white rounded-lg hover:bg-[#C0392B] transition-colors duration-200 !rounded-button cursor-pointer whitespace-nowrap">
            <i className="fa-solid fa-sign-out-alt"></i>
            <span>로그아웃</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">

        <header className="bg-white shadow-sm">
          <div className="flex justify-between items-center px-6 py-4">
            <div>
              <h2 className="text-xl font-bold">
                {getHeaderTitle()}
              </h2>
              <p className="text-sm text-gray-500">{getCurrentDate()}</p>
            </div>

            <div>
              <button
              onClick={() => window.location.reload()}
              title="새로고침"
              className="p-2 text-gray-500 hover:text-[#2ECC71] focus:outline-none transition-colors duration-200 rounded-full hover:bg-gray-100"
              >
              <i className="fa-solid fa-rotate-right text-lg"></i>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>

  );
};

export default AdminLayout;