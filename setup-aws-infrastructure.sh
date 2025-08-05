#!/bin/bash

# AWS ECS 인프라 설정 스크립트
# 사용법: ./setup-aws-infrastructure.sh [REGION] [ACCOUNT_ID]

set -e

REGION=${1:-"ap-northeast-2"}
ACCOUNT_ID=${2:-$(aws sts get-caller-identity --query Account --output text)}

echo "🚀 AWS ECS 인프라 설정 시작..."
echo "리전: $REGION"
echo "계정 ID: $ACCOUNT_ID"

# 1. ECR 리포지토리 생성
echo "📦 ECR 리포지토리 생성 중..."
aws ecr create-repository --repository-name hyundai-inventory-app --region $REGION || echo "ECR 리포지토리가 이미 존재합니다."

# 2. ECS 클러스터 생성
echo "🏗️ ECS 클러스터 생성 중..."
aws ecs create-cluster --cluster-name hyundai-inventory-cluster --region $REGION || echo "ECS 클러스터가 이미 존재합니다."

# 3. IAM 역할 생성
echo "🔐 IAM 역할 생성 중..."

# ECS Task Execution Role
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
}' || echo "ecsTaskExecutionRole이 이미 존재합니다."

aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy || echo "정책이 이미 연결되어 있습니다."

# ECS Task Role
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
}' || echo "ecsTaskRole이 이미 존재합니다."

aws iam put-role-policy --role-name ecsTaskRole --policy-name SecretsManagerAccess --policy-document "{
  \"Version\": \"2012-10-17\",
  \"Statement\": [
    {
      \"Effect\": \"Allow\",
      \"Action\": [
        \"secretsmanager:GetSecretValue\"
      ],
      \"Resource\": \"arn:aws:secretsmanager:$REGION:$ACCOUNT_ID:secret:hyundai-inventory/*\"
    }
  ]
}" || echo "SecretsManager 정책이 이미 설정되어 있습니다."

# 4. CloudWatch 로그 그룹 생성
echo "📊 CloudWatch 로그 그룹 생성 중..."
aws logs create-log-group --log-group-name /ecs/hyundai-inventory-app --region $REGION || echo "로그 그룹이 이미 존재합니다."

# 5. VPC 정보 조회
echo "🌐 VPC 정보 조회 중..."
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --query 'Vpcs[0].VpcId' --output text --region $REGION)
SUBNET_IDS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query 'Subnets[*].SubnetId' --output text --region $REGION | tr '\t' ' ')

echo "VPC ID: $VPC_ID"
echo "서브넷 IDs: $SUBNET_IDS"

# 6. 보안 그룹 생성
echo "🔒 보안 그룹 생성 중..."
SECURITY_GROUP_ID=$(aws ec2 create-security-group \
  --group-name hyundai-inventory-sg \
  --description "Security group for Hyundai Inventory App" \
  --vpc-id $VPC_ID \
  --region $REGION \
  --query 'GroupId' \
  --output text 2>/dev/null || \
  aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=hyundai-inventory-sg" \
    --query 'SecurityGroups[0].GroupId' \
    --output text \
    --region $REGION)

echo "보안 그룹 ID: $SECURITY_GROUP_ID"

# 7. 보안 그룹 규칙 설정
echo "🔧 보안 그룹 규칙 설정 중..."
aws ec2 authorize-security-group-ingress \
  --group-id $SECURITY_GROUP_ID \
  --protocol tcp \
  --port 5000 \
  --cidr 0.0.0.0/0 \
  --region $REGION 2>/dev/null || echo "포트 5000 규칙이 이미 존재합니다."

aws ec2 authorize-security-group-ingress \
  --group-id $SECURITY_GROUP_ID \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0 \
  --region $REGION 2>/dev/null || echo "포트 80 규칙이 이미 존재합니다."

# 8. Application Load Balancer 생성
echo "⚖️ Application Load Balancer 생성 중..."
ALB_ARN=$(aws elbv2 create-load-balancer \
  --name hyundai-inventory-alb \
  --subnets $SUBNET_IDS \
  --security-groups $SECURITY_GROUP_ID \
  --region $REGION \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text 2>/dev/null || \
  aws elbv2 describe-load-balancers \
    --names hyundai-inventory-alb \
    --query 'LoadBalancers[0].LoadBalancerArn' \
    --output text \
    --region $REGION)

echo "ALB ARN: $ALB_ARN"

# 9. Target Group 생성
echo "🎯 Target Group 생성 중..."
TARGET_GROUP_ARN=$(aws elbv2 create-target-group \
  --name hyundai-inventory-tg \
  --protocol HTTP \
  --port 5000 \
  --vpc-id $VPC_ID \
  --target-type ip \
  --region $REGION \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text 2>/dev/null || \
  aws elbv2 describe-target-groups \
    --names hyundai-inventory-tg \
    --query 'TargetGroups[0].TargetGroupArn' \
    --output text \
    --region $REGION)

echo "Target Group ARN: $TARGET_GROUP_ARN"

# 10. Listener 생성
echo "🎧 Listener 생성 중..."
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=$TARGET_GROUP_ARN \
  --region $REGION 2>/dev/null || echo "Listener가 이미 존재합니다."

# 11. 설정 파일 업데이트
echo "📝 설정 파일 업데이트 중..."

# ecs-task-definition.json 업데이트
sed -i "s/ACCOUNT_ID/$ACCOUNT_ID/g" ecs-task-definition.json
sed -i "s/REGION/$REGION/g" ecs-task-definition.json

# ecs-service-definition.json 업데이트
sed -i "s/ACCOUNT_ID/$ACCOUNT_ID/g" ecs-service-definition.json
sed -i "s/REGION/$REGION/g" ecs-service-definition.json
sed -i "s/TARGET_GROUP_ID/$(echo $TARGET_GROUP_ARN | cut -d'/' -f2)/g" ecs-service-definition.json

# 서브넷 ID 업데이트
FIRST_SUBNET=$(echo $SUBNET_IDS | cut -d' ' -f1)
SECOND_SUBNET=$(echo $SUBNET_IDS | cut -d' ' -f2)
sed -i "s/subnet-xxxxxxxxx/$FIRST_SUBNET/g" ecs-service-definition.json
sed -i "s/subnet-yyyyyyyyy/$SECOND_SUBNET/g" ecs-service-definition.json

# 보안 그룹 ID 업데이트
sed -i "s/sg-xxxxxxxxx/$SECURITY_GROUP_ID/g" ecs-service-definition.json

echo "✅ AWS 인프라 설정 완료!"
echo ""
echo "📋 다음 단계:"
echo "1. GitHub Secrets 설정 (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)"
echo "2. Secrets Manager에 데이터베이스 정보 저장"
echo "3. Task Definition 등록: aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json --region $REGION"
echo "4. Service 생성: aws ecs create-service --cli-input-json file://ecs-service-definition.json --region $REGION"
echo ""
echo "🌐 ALB DNS 이름:"
aws elbv2 describe-load-balancers \
  --names hyundai-inventory-alb \
  --query 'LoadBalancers[0].DNSName' \
  --output text \
  --region $REGION 