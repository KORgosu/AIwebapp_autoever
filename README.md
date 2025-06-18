# sideproject_100AI
사이드 프로젝트 : 웹애플리케이션 100퍼센트 AI로 만들기
# makeWEBwithAI0to100
0부터 100까지 AI로  만든 웹 애플리케이션

<br>

## 🛠 sideproject 프로젝트 제작 과정

#### [과정 1 : 프로젝트 개요와 소개](https://nexon25.tistory.com/entry/%EC%82%AC%EC%9D%B4%EB%93%9C-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-0%EB%B6%80%ED%84%B0-100%EA%B9%8C%EC%A7%80-AI%EB%A1%9C-%EC%9B%B9-%EC%95%A0%ED%94%8C%EB%A6%AC%EC%BC%80%EC%9D%B4%EC%85%98-%EB%A7%8C%EB%93%A4%EC%96%B4%EB%B3%B4%EA%B8%B0-1)


<br>

## 🛠 sideproject 프로젝트 구조
```
side_project/
├── public/                   # 정적 파일
│   ├── index.html           # 메인 HTML 파일
│   └── favicon.ico          # 파비콘
│
├── src/                     # React 프론트엔드 소스
│   ├── components/          # React 컴포넌트
│   │   ├── Login.js         # 로그인 페이지 컴포넌트
│   │   ├── Master.js        # 마스터 계정 페이지 컴포넌트
│   │   └── CreateGuest.js   # 게스트 계정 생성 컴포넌트
│   ├── App.js              # 메인 앱 컴포넌트
│   └── index.js            # React 앱 진입점
│
├── server/                  # Node.js 백엔드 소스
│   ├── commands/           # CQRS Command 핸들러
│   │   └── inventory/      # 재고 관련 명령
│   │       └── createInventory.js  # 재고 생성 명령
│   │
│   ├── queries/            # CQRS Query 핸들러
│   │   └── inventory/      # 재고 관련 쿼리
│   │       ├── getInventory.js     # 재고 조회 쿼리
│   │       ├── updateInventory.js  # 재고 업데이트 쿼리
│   │       └── deleteInventory.js  # 재고 삭제 쿼리
│   │
│   ├── events/             # 이벤트 관련 코드
│   │   ├── publishers/     # 이벤트 발행자
│   │   │   └── inventoryEventPublisher.js  # 재고 이벤트 발행
│   │   └── consumers/      # 이벤트 구독자
│   │
│   ├── models/             # 데이터 모델
│   │   └── event.js        # 이벤트 모델 정의
│   │
│   ├── routes/             # API 라우트
│   │   └── inventory.js    # 재고 관련 API 엔드포인트
│   │
│   ├── index.js            # 메인 서버 파일
│   └── sync.js             # 데이터 동기화 스크립트
│
├── .env                    # 환경 변수 설정
├── .env.example           # 환경 변수 예시
├── package.json           # 프로젝트 의존성 및 스크립트
└── README.md              # 프로젝트 문서
```
