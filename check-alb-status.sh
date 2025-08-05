#!/bin/bash

# ALB 상태 확인 스크립트
# 사용법: ./check-alb-status.sh [REGION]

set -e

REGION=${1:-"ap-northeast-2"}

echo "🔍 ALB 상태 확인 중..."
echo "리전: $REGION"

# 1. ALB 정보 조회
echo ""
echo "📋 Application Load Balancer 정보:"
aws elbv2 describe-load-balancers \
  --names hyundai-inventory-alb \
  --region $REGION \
  --query 'LoadBalancers[0].{Name:LoadBalancerName,DNSName:DNSName,State:State.Code,Scheme:Scheme,Type:Type}' \
  --output table

# 2. Target Group 정보
echo ""
echo "🎯 Target Group 정보:"
aws elbv2 describe-target-groups \
  --names hyundai-inventory-tg \
  --region $REGION \
  --query 'TargetGroups[0].{Name:TargetGroupName,Protocol:Protocol,Port:Port,TargetType:TargetType,HealthCheckPath:HealthCheckPath}' \
  --output table

# 3. Target Health 확인
echo ""
echo "💚 Target Health 상태:"
aws elbv2 describe-target-health \
  --target-group-arn $(aws elbv2 describe-target-groups --names hyundai-inventory-tg --region $REGION --query 'TargetGroups[0].TargetGroupArn' --output text) \
  --region $REGION \
  --query 'TargetHealthDescriptions[*].{Target:Target.Id,Port:Target.Port,Health:TargetHealth.State,Reason:TargetHealth.Reason}' \
  --output table

# 4. Listener 정보
echo ""
echo "🎧 Listener 정보:"
aws elbv2 describe-listeners \
  --load-balancer-arn $(aws elbv2 describe-load-balancers --names hyundai-inventory-alb --region $REGION --query 'LoadBalancers[0].LoadBalancerArn' --output text) \
  --region $REGION \
  --query 'Listeners[*].{Port:Port,Protocol:Protocol,DefaultActions:DefaultActions[0].Type}' \
  --output table

# 5. 접속 URL 출력
echo ""
echo "🌐 애플리케이션 접속 URL:"
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --names hyundai-inventory-alb \
  --query 'LoadBalancers[0].DNSName' \
  --output text \
  --region $REGION)

echo "http://$ALB_DNS"
echo ""
echo "📱 브라우저에서 위 URL로 접속하여 로그인 페이지가 정상 작동하는지 확인해주세요." 