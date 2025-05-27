<div align="center">
<img width="1277" alt="스크린샷 2025-05-27 오후 1 12 05" src="https://github.com/user-attachments/assets/a30b7a7b-0658-4501-9c64-7c96a81c92a1" />
</div>

---

# 🫧목차
+ 프로젝트 개요
+ 팀원 소개
+ 기술 스택
+ 주요 기능
+ 프로젝트 구조
+ 개발 워크플로우
+ 커밋 컨벤션

---

# 📖 프로젝트 개요

운동 초보자부터 중급자까지 누구나 쉽고 안전하게 운동을 배울 수 있게 돕는 헬스 교육 프로그램

체계적인 강의 제공, 루틴 추천, 개인 운동 기록 및 pt 기록 등 운동학습 환경 제공하는 헬스 프로그램



---

# 👥 팀원 소개

| 강성민 | 강준호 | 권태윤 | 유광륜 | 최정인 |
|:------------------------------------------:|:--------------------------------------:|:---------------------------------------:|:-----------------------------------------:|:-----------------------------------------:|
|     <img src="여기안에 이미지" alt="강성민" width="150">     |   <img src="여기안에 이미지" alt="강준호" width="150">   |   <img src="여기안에 이미지" alt="권태윤" width="150">    |    <img src="여기안에 이미지" alt="유광륜" width="150">     |     <img src="여기안에 이미지" alt="최정인" width="150">    |
|                     팀장                     |                  부팀장                   |                   팀원                    |                    팀원                     |                    팀원                     |
| [GitHub]() | [GitHub](https://github.com/0320kangk) | [GitHub]() | [GitHub](https://github.com/yoogwangryun) | [GitHub]() |

---


# 🛠️ 기술 스택

![Amazon S3](https://img.shields.io/badge/Amazon%20S3-569A31?style=for-the-badge&logo=Amazon%20S3&logoColor=white)
![Amazon AWS](https://img.shields.io/badge/Amazon%20AWS-232F3E?style=for-the-badge&logo=Amazon%20AWS&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=Docker&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=Git&logoColor=white)
![Github](https://img.shields.io/badge/Github-181717?style=for-the-badge&logo=Github&logoColor=white)  
![Java](https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=Java&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=MySQL&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=React&logoColor=white)
![Discord](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=Discord&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=Spring%20Boot&logoColor=white)  
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=Vercel&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=Next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=Tailwind%20CSS&logoColor=white)

---

## 주요 기능

### 🎓 강의 및 커리큘럼 관리
- 트레이너가 강의를 등록하고 사용자에게 노출
- 커리큘럼 단위로 콘텐츠 구성 및 시청 기록 저장
- 수강률 기반 진도율 관리 및 완료 체크 기능

### 🏋️‍♀️ 운동 루틴 및 기구 추천
- 운동기구/부위별 연관성 기반 루틴 추천
- 운동기구와 사용자 목표(근성장, 다이어트 등)에 맞춘 콘텐츠 제공

### 📦 주문 및 결제 시스템
- 강의 결제 및 수강 신청 처리
- Toss Payments API 연동을 통한 안전한 결제 지원

### 👥 사용자 권한 및 인증
- 일반 사용자 / 트레이너 / 관리자 권한 구분
- 소셜 로그인 (카카오) 및 JWT 기반 인증 처리

### 🧑‍💬 실시간 상담 및 챗봇
- WebSocket 기반 1:1 상담 채팅
- 챗봇을 통한 기본 질문 응답 기능 제공

### 💬 커뮤니티 및 QnA
- 강의별 QnA 게시판 운영
- 댓글 및 좋아요 기능 제공

### 📩 알림 시스템
- 강의 등록, 댓글 작성 등 이벤트 기반 알림 제공
- Redis 기반 빠른 푸시/실시간 처리

### 📁 파일 업로드 (이미지 & 영상)
- Amazon S3를 이용한 이미지/강의영상 업로드 및 스트리밍
- 이미지 업로드 시 전역 관리 시스템 포함

### 🧾 사용자 인증 관리
- 사용자 인증서 업로드 및 관리자 검수
- 인증 상태 및 이력 확인 가능

## 🗂 프로젝트 구조 보기 (클릭)

<details>
<summary>📁 프로젝트 구조 보기 (클릭)</summary>

```plaintext
health-school/
├── .gitignore
├── build.gradle.kts
├── settings.gradle.kts
├── gradlew*                          # Gradle 실행 스크립트
├── uploads/                          # 업로드된 파일 저장 디렉토리
├── test/                             # 테스트 코드 디렉토리

├── src/
│   └── main/
│       ├── java/com/malnutrition/backend/
│       │   ├── domain/                    # 비즈니스 도메인 계층
│       │   │   ├── admin/                 # 관리자 대시보드, 사용자 관리
│       │   │   ├── alarm/                 # 알림 기능
│       │   │   ├── certification/         # 자격 인증 (유저, 카테고리 포함)
│       │   │   ├── chatbotmessage/        # 챗봇 메시지 관리
│       │   │   ├── chatroom/              # 채팅방 및 메시지
│       │   │   ├── counseling/            # 상담 및 스케줄링
│       │   │   ├── image/                 # 이미지 업로드/조회
│       │   │   ├── lecture/               # 강의 기능 (강의, 커리큘럼 등)
│       │   │   ├── machine/               # 운동기구 및 부위
│       │   │   ├── order/                 # 주문, 결제, 수강 등록
│       │   │   └── user/                  # 사용자 도메인
│       │   ├── global/                    # 전역 설정 및 공통 기능
│       │   │   ├── config/                # Spring, Security 설정
│       │   │   ├── exception/
│       │   │   ├── rq/                    # 로그인 유저 처리
│       │   │   └── ut/
│       │   └── maincontroller/
│       │       └── HealthSchoolApplication.java  # Spring Boot 메인 클래스
│
│       └── resources/
│           ├── application.yml
│           ├── application-dev.yml
│           ├── application-prod.yml
│           ├── application-test.yml
│           ├── application-secret.yml
│           └── application-secret.yml.default
</details> ```
