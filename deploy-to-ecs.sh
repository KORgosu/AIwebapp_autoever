#!/bin/bash

# ECS 배포 통합 스크립트
# 사용법: ./deploy-to-ecs.sh [REGION]

set -e

REGION=${1:-"ap-northeast-2"}
CLUSTER_NAME="hyundai-inventory-cluster"
SERVICE_NAME="hyundai-inventory-service"

echo "🚀 ECS 배포 시작..."
echo "리전: $REGION"
echo "클러스터: $CLUSTER_NAME"
echo "서비스: $SERVICE_NAME"

# 1. AWS 인프라 설정 (필요한 경우)
echo ""
echo "📋 AWS 인프라 설정 확인 중..."
if ! aws ecs describe-clusters --clusters $CLUSTER_NAME --region $REGION >/dev/null 2>&1; then
    echo "⚠️ ECS 클러스터가 존재하지 않습니다. 인프라 설정을 실행합니다."
    ./setup-aws-infrastructure.sh $REGION
else
    echo "✅ ECS 클러스터가 이미 존재합니다."
fi

# 2. Secrets Manager 설정 확인
echo ""
echo "🔐 Secrets Manager 설정 확인 중..."
SECRETS_COUNT=$(aws secretsmanager list-secrets \
  --filters Key=name,Values=hyundai-inventory \
  --query 'SecretList | length(@)' \
  --output text \
  --region $REGION)

if [ "$SECRETS_COUNT" -lt 5 ]; then
    echo "⚠️ Secrets Manager에 필요한 시크릿이 부족합니다. 설정을 실행합니다."
    ./setup-secrets.sh $REGION
else
    echo "✅ Secrets Manager 설정이 완료되어 있습니다."
fi

# 3. Task Definition 등록
echo ""
echo "📋 Task Definition 등록 중..."
aws ecs register-task-definition \
  --cli-input-json file://ecs-task-definition.json \
  --region $REGION

echo "✅ Task Definition 등록 완료!"

# 4. Service 생성 또는 업데이트
echo ""
echo "🔄 Service 상태 확인 중..."
if aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $REGION >/dev/null 2>&1; then
    echo "📝 기존 서비스 업데이트 중..."
    aws ecs update-service \
      --cluster $CLUSTER_NAME \
      --service $SERVICE_NAME \
      --task-definition hyundai-inventory-app \
      --region $REGION
else
    echo "🆕 새 서비스 생성 중..."
    aws ecs create-service \
      --cli-input-json file://ecs-service-definition.json \
      --region $REGION
fi

# 5. 배포 완료 대기
echo ""
echo "⏳ 배포 완료 대기 중..."
aws ecs wait services-stable \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $REGION

echo "✅ 배포 완료!"

# 6. 서비스 상태 확인
echo ""
echo "📊 서비스 상태 확인..."
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $REGION \
  --query 'services[0].{Status:status,RunningCount:runningCount,DesiredCount:desiredCount,Events:events[0:3]}' \
  --output table

# 7. ALB DNS 이름 출력
echo ""
echo "🌐 애플리케이션 접속 URL:"
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --names hyundai-inventory-alb \
  --query 'LoadBalancers[0].DNSName' \
  --output text \
  --region $REGION)

echo "http://$ALB_DNS"

echo ""
echo "🎉 ECS 배포가 성공적으로 완료되었습니다!"
echo "📱 로그인 페이지에 접속하여 애플리케이션이 정상 작동하는지 확인해주세요." 