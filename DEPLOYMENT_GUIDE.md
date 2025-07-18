# GitHub Actions를 통한 Docker Hub 자동 배포 가이드

## 1. GitHub Secrets 설정

GitHub 저장소의 Settings > Secrets and variables > Actions에서 다음 시크릿을 설정해야 합니다:

### 필수 Secrets:
- `DOCKER_USERNAME`: Docker Hub 사용자명
- `DOCKER_PASSWORD`: Docker Hub 액세스 토큰 (비밀번호 아님)
- `REACT_APP_FIREBASE_API_KEY`: Firebase API 키
- `REACT_APP_FIREBASE_AUTH_DOMAIN`: Firebase 인증 도메인
- `REACT_APP_FIREBASE_PROJECT_ID`: Firebase 프로젝트 ID
- `REACT_APP_FIREBASE_STORAGE_BUCKET`: Firebase 스토리지 버킷
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`: Firebase 메시징 발신자 ID
- `REACT_APP_FIREBASE_APP_ID`: Firebase 앱 ID

## 2. Docker Hub 액세스 토큰 생성

1. Docker Hub에 로그인
2. Account Settings > Security > New Access Token
3. 토큰 이름 입력 (예: "GitHub Actions")
4. 토큰 생성 후 복사하여 `DOCKER_PASSWORD` 시크릿에 저장

## 3. 워크플로우 동작

### 트리거 조건:
- `main` 또는 `master` 브랜치에 push
- `main` 또는 `master` 브랜치로의 pull request

### 자동 태그 생성:
- 브랜치명 기반 태그
- SHA 기반 태그 (예: `main-abc123`)
- `latest` 태그 (기본 브랜치에서만)

## 4. 배포 확인

배포 후 다음 명령어로 확인할 수 있습니다:

```bash
# 이미지 pull
docker pull [DOCKER_USERNAME]/hyundai-inventory-app:latest

# 컨테이너 실행
docker run -p 5000:5000 [DOCKER_USERNAME]/hyundai-inventory-app:latest
```

## 5. 환경 변수 설정

프로덕션 환경에서는 다음 환경 변수를 설정해야 합니다:

```bash
# 데이터베이스 설정
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_DATABASE=hyundai_inventory

# MongoDB 설정
MONGODB_URI=your-mongodb-uri

# 포트 설정
PORT=5000
```

## 6. 문제 해결

### 빌드 실패 시:
1. GitHub Actions 탭에서 로그 확인
2. Docker Hub 로그인 상태 확인
3. Dockerfile 문법 오류 확인

### 런타임 오류 시:
1. 컨테이너 로그 확인: `docker logs [container-id]`
2. 환경 변수 설정 확인
3. 데이터베이스 연결 상태 확인 