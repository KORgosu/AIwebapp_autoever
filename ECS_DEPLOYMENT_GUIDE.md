# AWS ECS 배포 가이드

## 1. 사전 준비사항

### 1.1 AWS 계정 및 권한 설정
- AWS 계정이 필요합니다
- ECS, ECR, IAM, VPC, ALB, Secrets Manager 권한이 필요합니다

### 1.2 GitHub Secrets 설정
GitHub 저장소의 Settings > Secrets and variables > Actions에서 다음 시크릿을 설정해야 합니다:

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

## 2. AWS 인프라 설정

### 2.1 ECR 리포지토리 생성
```bash
aws ecr create-repository --repository-name hyundai-inventory-app --region ap-northeast-2
```

### 2.2 ECS 클러스터 생성
```bash
aws ecs create-cluster --cluster-name hyundai-inventory-cluster --region ap-northeast-2
```

### 2.3 IAM 역할 생성

#### ECS Task Execution Role:
```bash
aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}'

aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

#### ECS Task Role:
```bash
aws iam create-role --role-name ecsTaskRole --assume-role-policy-document '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}'

aws iam put-role-policy --role-name ecsTaskRole --policy-name SecretsManagerAccess --policy-document '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:ap-northeast-2:*:secret:hyundai-inventory/*"
    }
  ]
}'
```

### 2.4 Secrets Manager에 시크릿 저장
```bash
# 데이터베이스 호스트
aws secretsmanager create-secret --name hyundai-inventory/db-host --secret-string "your-db-host" --region ap-northeast-2

# 데이터베이스 사용자
aws secretsmanager create-secret --name hyundai-inventory/db-user --secret-string "your-db-user" --region ap-northeast-2

# 데이터베이스 비밀번호
aws secretsmanager create-secret --name hyundai-inventory/db-password --secret-string "your-db-password" --region ap-northeast-2

# 데이터베이스 이름
aws secretsmanager create-secret --name hyundai-inventory/db-database --secret-string "hyundai_inventory" --region ap-northeast-2

# MongoDB URI
aws secretsmanager create-secret --name hyundai-inventory/mongodb-uri --secret-string "your-mongodb-uri" --region ap-northeast-2
```

### 2.5 VPC 및 네트워킹 설정
- VPC 생성 (기본 VPC 사용 가능)
- 서브넷 ID 확인
- 보안 그룹 생성 (포트 5000 허용)

### 2.6 Application Load Balancer 설정
```bash
# ALB 생성
aws elbv2 create-load-balancer --name hyundai-inventory-alb --subnets subnet-xxxxxxxxx subnet-yyyyyyyyy --security-groups sg-xxxxxxxxx --region ap-northeast-2

# Target Group 생성
aws elbv2 create-target-group --name hyundai-inventory-tg --protocol HTTP --port 5000 --vpc-id vpc-xxxxxxxxx --target-type ip --region ap-northeast-2

# Listener 생성
aws elbv2 create-listener --load-balancer-arn arn:aws:elasticloadbalancing:ap-northeast-2:ACCOUNT_ID:loadbalancer/app/hyundai-inventory-alb/ALB_ID --protocol HTTP --port 80 --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:ap-northeast-2:ACCOUNT_ID:targetgroup/hyundai-inventory-tg/TARGET_GROUP_ID --region ap-northeast-2
```

## 3. 설정 파일 수정

### 3.1 ecs-task-definition.json 수정
- `ACCOUNT_ID`를 실제 AWS 계정 ID로 변경
- `REGION`을 실제 리전으로 변경
- `DOCKER_USERNAME`을 실제 Docker Hub 사용자명으로 변경

### 3.2 ecs-service-definition.json 수정
- `ACCOUNT_ID`를 실제 AWS 계정 ID로 변경
- `REGION`을 실제 리전으로 변경
- `TARGET_GROUP_ID`를 실제 Target Group ID로 변경
- 서브넷 ID를 실제 서브넷 ID로 변경
- 보안 그룹 ID를 실제 보안 그룹 ID로 변경

## 4. 배포 실행

### 4.1 Task Definition 등록
```bash
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json --region ap-northeast-2
```

### 4.2 Service 생성
```bash
aws ecs create-service --cli-input-json file://ecs-service-definition.json --region ap-northeast-2
```

### 4.3 GitHub Actions를 통한 자동 배포
- main 또는 master 브랜치에 push하면 자동으로 ECS에 배포됩니다
- GitHub Actions 탭에서 배포 진행 상황을 확인할 수 있습니다

## 5. 배포 확인

### 5.1 ECS 콘솔에서 확인
- AWS ECS 콘솔에서 클러스터와 서비스 상태 확인
- 태스크가 정상적으로 실행되고 있는지 확인

### 5.2 로그 확인
```bash
# CloudWatch 로그 확인
aws logs describe-log-groups --log-group-name-prefix /ecs/hyundai-inventory-app --region ap-northeast-2
```

### 5.3 애플리케이션 접속 확인
- ALB DNS 이름으로 접속하여 애플리케이션이 정상 작동하는지 확인

## 6. 문제 해결

### 6.1 배포 실패 시
1. GitHub Actions 로그 확인
2. ECS 콘솔에서 태스크 상태 확인
3. CloudWatch 로그에서 오류 메시지 확인

### 6.2 런타임 오류 시
1. ECS 태스크 로그 확인
2. 환경 변수 설정 확인
3. Secrets Manager 접근 권한 확인
4. 데이터베이스 연결 상태 확인

### 6.3 네트워킹 문제 시
1. 보안 그룹 설정 확인
2. 서브넷 라우팅 테이블 확인
3. ALB 상태 확인

## 7. 비용 최적화

### 7.1 Fargate Spot 사용
- 비용을 절약하기 위해 Fargate Spot을 사용할 수 있습니다
- `launchType`를 `FARGATE_SPOT`으로 변경

### 7.2 Auto Scaling 설정
```bash
# Auto Scaling 정책 생성
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/hyundai-inventory-cluster/hyundai-inventory-service \
  --min-capacity 1 \
  --max-capacity 10 \
  --region ap-northeast-2
```

## 8. 모니터링 및 알림

### 8.1 CloudWatch 알림 설정
- CPU 사용률, 메모리 사용률 모니터링
- 오류율 모니터링
- 응답 시간 모니터링

### 8.2 로그 분석
- CloudWatch Logs Insights를 사용하여 로그 분석
- 오류 패턴 분석 및 개선 