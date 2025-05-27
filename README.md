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

# 🔥주요기능

최종발표 전 기능별 영상 나오면 추가 예정 

---

#  ⚙️ 프로젝트 구조

```plaintext
health-school/
├── .gitignore                       # Git에서 추적하지 않을 파일 정의
├── build.gradle.kts                # Gradle 빌드 설정 파일
├── settings.gradle.kts             # Gradle 멀티 모듈 설정
├── gradlew*                        # Gradle Wrapper 실행 스크립트
├── uploads/                        # 업로드된 파일 저장 디렉토리
├── test/                           # 테스트 코드 디렉토리
│
├── src/
│   └── main/
│       ├── java/
│       │   └── com.malnutrition.backend/
│       │       ├── domain/                    # 도메인 계층 - 비즈니스 기능 중심 구성
│       │       │   ├── admin/                 # 관리자 기능 (대시보드, 로그 등)
│       │       │   │   └── dashboard/
│       │       │   │       ├── controller/
│       │       │   │       ├── dto/
│       │       │   │       └── service/
│       │       │   ├── alarm/                 # 알람 기능
│       │       │   │   ├── alarm/
│       │       │   │   └── alarmsetting.entity/
│       │       │   ├── certification/         # 자격 인증 관련 기능
│       │       │   │   ├── category/
│       │       │   │   ├── certification/
│       │       │   │   └── usercertification/
│       │       │   ├── chatbotmessage/        # 챗봇 메시지 처리
│       │       │   │   ├── config/
│       │       │   │   ├── controller/
│       │       │   │   ├── dto/
│       │       │   │   ├── entity/
│       │       │   │   ├── enums/
│       │       │   │   ├── repository/
│       │       │   │   └── service/
│       │       │   ├── chatroom/              # 채팅방 관리
│       │       │   │   ├── chatmessage/
│       │       │   │   └── chatroom/
│       │       │   ├── counseling/            # 상담 기능
│       │       │   │   ├── counseling/
│       │       │   │   └── schedule/
│       │       │   ├── image/                 # 이미지 업로드/조회 기능
│       │       │   │   ├── config/
│       │       │   │   ├── controller/
│       │       │   │   ├── dto/
│       │       │   │   ├── entity/
│       │       │   │   ├── repository/
│       │       │   │   └── service/
│       │       │   ├── lecture/               # 강의 기능
│       │       │   │   ├── comment/
│       │       │   │   ├── curriculum/
│       │       │   │   ├── curriculumProgress/
│       │       │   │   ├── lecture/
│       │       │   │   ├── lectureCategory/
│       │       │   │   ├── lectureuser/
│       │       │   │   ├── like/
│       │       │   │   ├── notification/
│       │       │   │   ├── qnaboard/
│       │       │   │   └── report/
│       │       │   ├── machine/               # 운동 기구 관련 기능
│       │       │   │   ├── body/
│       │       │   │   ├── machine/
│       │       │   │   ├── machinebody/
│       │       │   │   ├── machineExerciseSheet/
│       │       │   │   └── machinetype/
│       │       │   ├── order/                 # 주문 및 결제 관련
│       │       │   │   ├── controller/
│       │       │   │   ├── dto/
│       │       │   │   ├── entity/
│       │       │   │   ├── enums/
│       │       │   │   ├── repository/
│       │       │   │   └── service/
│       │       │   └── user/                  # 사용자 도메인
│       │
│       │   ├── global/                        # 전역 설정 및 공통 컴포넌트
│       │   │   ├── app/
│       │   │   ├── config/                    # Spring 설정 클래스
│       │   │   ├── converter/                 # 커스텀 컨버터
│       │   │   ├── exception/                 # 전역 예외 처리
│       │   │   ├── jpa/                       # JPA 공통 유틸
│       │   │   ├── rp/                        # Request Parameter 처리
│       │   │   ├── rq/                        # 로그인 유저 객체 처리
│       │   │   ├── security/                  # Spring Security 설정
│       │   │   └── ut/                        # 유틸성 클래스
│       │
│       │   └── maincontroller/
│       │       └── HealthSchoolApplication.java  # 메인 애플리케이션 클래스
│
│       └── resources/
│           ├── application.yml                    # 공통 설정
│           ├── application-dev.yml                # 개발 환경 설정
│           ├── application-prod.yml               # 운영 환경 설정
│           ├── application-test.yml               # 테스트 환경 설정
│           ├── application-secret.yml             # 민감 정보 설정
│           └── application-secret.yml.default     # 민감 정보 템플릿
```
# 🚀 개발 워크플로우

협업의 일관성과 품질 유지를 위해 아래와 같은 개발 프로세스 및 브랜치 전략을 따릅니다.


### 전체 개발 흐름 요약

```text
1. 기능 브랜치 생성 (feature/* 등)
2. 개발 진행 (로컬)
3. dev 브랜치로 Pull Request 생성
4. 코드 리뷰 및 테스트
5. dev → main 병합 (배포 시점)
```
### 브랜치 전략
🔵 main </br>
용도: 운영 환경에 배포되는 코드</br>
규칙: 항상 안정적인 상태 유지 </br>
병합 대상: dev 브랜치에서 충분히 테스트된 코드 </br>

🟢 dev
용도: 개발 통합 브랜치 </br>
규칙: PR을 통해서만 병합 </br>
병합 대상: 기능 단위 작업 브랜치 (feature/*, fix/* 등) </br>

🟡 기능 브랜치 (예: feature/12-login, fix/13-login-bug) </br>
용도: 개별 작업 브랜치</br>
규칙: 작업 단위별로 분기 </br>
dev 브랜치를 기준으로 생성 </br>

완료 후 PR로 dev에 병합

---
# 📌 커밋 컨벤션

### 브랜치 네이밍 규칙

🧱 형식

```
<타입>/번호-작업내용
```

💡 예시

```
feat/12-add-login
fix/8-fix-signup-error
refactor/23-cleanup-profile
```

### 커밋 메시지 규칙

🧱 형식

```
<타입>: <간단한 설명> #번호
```

💡 예시

```
feat: 게시글 작성 기능 추가 #1
fix: 로그인 오류 수정 #1
refactor: 유저 서비스 리팩토링 #1
style: 코드 포맷 정리 #1
docs: README에 실행 방법 추가 #1
chore: .gitignore에 .env 추가 #1
test: 회원가입 유닛 테스트 추가 #1
```

### 이슈 규칙

🧱 형식

```
<타입>: <간단한 설명>
```

💡 예시

```
feat: 로그인 기능 구현
feat: 회원가입 유효성 검사
feat: 비밀번호 재설정 로직
```

### 작업 유형 (자주 쓰는 것만)

| 타입       | 설명                                 |
| ---------- | ------------------------------------ |
| `feat`     | 새로운 기능 추가                     |
| `fix`      | 버그 수정                            |
| `refactor` | 코드 리팩터링 (기능 변화 없음)       |
| `style`    | 코드 스타일 수정 (세미콜론, 공백 등) |
| `docs`     | 문서 변경 (README, 주석 등)          |
| `chore`    | 기타 설정, 빌드, 패키지 등           |
| `test`     | 테스트 코드 추가/수정                |

---
### 브랜치 네이밍 규칙

🧱 형식

```
<타입>/번호-작업내용
```

💡 예시

```
feat/12-add-login
fix/8-fix-signup-error
refactor/23-cleanup-profile
```

### 커밋 메시지 규칙

🧱 형식

```
<타입>: <간단한 설명> #번호
```

💡 예시

```
feat: 게시글 작성 기능 추가 #1
fix: 로그인 오류 수정 #1
refactor: 유저 서비스 리팩토링 #1
style: 코드 포맷 정리 #1
docs: README에 실행 방법 추가 #1
chore: .gitignore에 .env 추가 #1
test: 회원가입 유닛 테스트 추가 #1
```

### 이슈 규칙

🧱 형식

```
<타입>: <간단한 설명>
```

💡 예시

```
feat: 로그인 기능 구현
feat: 회원가입 유효성 검사
feat: 비밀번호 재설정 로직
```

### 작업 유형 (자주 쓰는 것만)

| 타입       | 설명                                 |
| ---------- | ------------------------------------ |
| `feat`     | 새로운 기능 추가                     |
| `fix`      | 버그 수정                            |
| `refactor` | 코드 리팩터링 (기능 변화 없음)       |
| `style`    | 코드 스타일 수정 (세미콜론, 공백 등) |
| `docs`     | 문서 변경 (README, 주석 등)          |
| `chore`    | 기타 설정, 빌드, 패키지 등           |
| `test`     | 테스트 코드 추가/수정                |

---



