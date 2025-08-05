# 🚀 ECS 배포 빠른 시작 가이드

## 📋 사전 준비사항

### 1. AWS CLI 설치 및 설정
```bash
# AWS CLI 설치 (Windows)
# https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-windows.html

# AWS 자격 증명 설정
aws configure
```

### 2. GitHub Secrets 설정
GitHub 저장소의 Settings > Secrets and variables > Actions에서 다음 시크릿을 설정:

#### AWS 관련 Secrets:
- `AWS_ACCESS_KEY_ID`: AWS 액세스 키 ID
- `AWS_SECRET_ACCESS_KEY`: AWS 시크릿 액세스 키

#### Firebase 관련 Secrets (기존):
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`

## 🚀 배포 방법

### 방법 1: 자동 배포 (GitHub Actions)
1. GitHub Secrets 설정 완료
2. main 또는 master 브랜치에 push
3. GitHub Actions에서 자동 배포 확인

### 방법 2: 수동 배포 (스크립트)
```bash
# Windows PowerShell에서 실행
# 1. AWS 인프라 설정
.\setup-aws-infrastructure.sh

# 2. Secrets Manager 설정
.\setup-secrets.sh

# 3. ECS 배포
.\deploy-to-ecs.sh
```

### 방법 3: 단계별 수동 배포
```bash
# 1. ECR 리포지토리 생성
aws ecr create-repository --repository-name hyundai-inventory-app --region ap-northeast-2

# 2. ECS 클러스터 생성
aws ecs create-cluster --cluster-name hyundai-inventory-cluster --region ap-northeast-2

# 3. Task Definition 등록
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json --region ap-northeast-2

# 4. Service 생성
aws ecs create-service --cli-input-json file://ecs-service-definition.json --region ap-northeast-2
```

## 🔧 설정 파일 수정

### ecs-task-definition.json 수정
- `ACCOUNT_ID`를 실제 AWS 계정 ID로 변경
- `REGION`을 실제 리전으로 변경
- `DOCKER_USERNAME`을 실제 Docker Hub 사용자명으로 변경

### ecs-service-definition.json 수정
- `ACCOUNT_ID`를 실제 AWS 계정 ID로 변경
- `REGION`을 실제 리전으로 변경
- 서브넷 ID와 보안 그룹 ID를 실제 값으로 변경

## 📊 배포 확인

### 1. ECS 콘솔에서 확인
- AWS ECS 콘솔에서 클러스터와 서비스 상태 확인
- 태스크가 정상적으로 실행되고 있는지 확인

### 2. 애플리케이션 접속 확인
```bash
# ALB DNS 이름 조회
aws elbv2 describe-load-balancers \
  --names hyundai-inventory-alb \
  --query 'LoadBalancers[0].DNSName' \
  --output text \
  --region ap-northeast-2
```

### 3. 로그 확인
```bash
# CloudWatch 로그 확인
aws logs describe-log-groups --log-group-name-prefix /ecs/hyundai-inventory-app --region ap-northeast-2
```

## 🛠️ 문제 해결

### 배포 실패 시
1. GitHub Actions 로그 확인
2. ECS 콘솔에서 태스크 상태 확인
3. CloudWatch 로그에서 오류 메시지 확인

### 런타임 오류 시
1. ECS 태스크 로그 확인
2. 환경 변수 설정 확인
3. Secrets Manager 접근 권한 확인
4. 데이터베이스 연결 상태 확인

## 💰 비용 정보

### 예상 월 비용 (ap-northeast-2)
- **Fargate**: 약 $30-50/월 (2개 인스턴스)
- **ALB**: 약 $20/월
- **CloudWatch**: 약 $5-10/월
- **ECR**: 약 $1-5/월
- **Secrets Manager**: 약 $5/월

**총 예상 비용**: 약 $60-90/월

### 비용 최적화 팁
- Fargate Spot 사용 시 최대 70% 절약 가능
- Auto Scaling 설정으로 필요에 따른 리소스 조정
- 예약 용량 사용 시 할인 혜택

## 📞 지원

문제가 발생하면 다음을 확인해주세요:
1. `ECS_DEPLOYMENT_GUIDE.md` - 상세 배포 가이드
2. AWS ECS 콘솔의 로그 및 이벤트
3. GitHub Actions 로그 