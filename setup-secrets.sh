#!/bin/bash

# AWS Secrets Manager 설정 스크립트
# 사용법: ./setup-secrets.sh [REGION]

set -e

REGION=${1:-"ap-northeast-2"}

echo "🔐 AWS Secrets Manager 설정 시작..."
echo "리전: $REGION"

# 사용자 입력 받기
echo ""
echo "📝 데이터베이스 정보를 입력해주세요:"
read -p "데이터베이스 호스트: " DB_HOST
read -p "데이터베이스 사용자: " DB_USER
read -s -p "데이터베이스 비밀번호: " DB_PASSWORD
echo ""
read -p "데이터베이스 이름 (기본값: hyundai_inventory): " DB_DATABASE
DB_DATABASE=${DB_DATABASE:-"hyundai_inventory"}
read -p "MongoDB URI: " MONGODB_URI

echo ""
echo "💾 Secrets Manager에 시크릿 저장 중..."

# 데이터베이스 호스트
aws secretsmanager create-secret \
  --name hyundai-inventory/db-host \
  --secret-string "$DB_HOST" \
  --region $REGION 2>/dev/null || \
aws secretsmanager update-secret \
  --secret-id hyundai-inventory/db-host \
  --secret-string "$DB_HOST" \
  --region $REGION

# 데이터베이스 사용자
aws secretsmanager create-secret \
  --name hyundai-inventory/db-user \
  --secret-string "$DB_USER" \
  --region $REGION 2>/dev/null || \
aws secretsmanager update-secret \
  --secret-id hyundai-inventory/db-user \
  --secret-string "$DB_USER" \
  --region $REGION

# 데이터베이스 비밀번호
aws secretsmanager create-secret \
  --name hyundai-inventory/db-password \
  --secret-string "$DB_PASSWORD" \
  --region $REGION 2>/dev/null || \
aws secretsmanager update-secret \
  --secret-id hyundai-inventory/db-password \
  --secret-string "$DB_PASSWORD" \
  --region $REGION

# 데이터베이스 이름
aws secretsmanager create-secret \
  --name hyundai-inventory/db-database \
  --secret-string "$DB_DATABASE" \
  --region $REGION 2>/dev/null || \
aws secretsmanager update-secret \
  --secret-id hyundai-inventory/db-database \
  --secret-string "$DB_DATABASE" \
  --region $REGION

# MongoDB URI
aws secretsmanager create-secret \
  --name hyundai-inventory/mongodb-uri \
  --secret-string "$MONGODB_URI" \
  --region $REGION 2>/dev/null || \
aws secretsmanager update-secret \
  --secret-id hyundai-inventory/mongodb-uri \
  --secret-string "$MONGODB_URI" \
  --region $REGION

echo "✅ Secrets Manager 설정 완료!"
echo ""
echo "📋 저장된 시크릿 목록:"
aws secretsmanager list-secrets \
  --filters Key=name,Values=hyundai-inventory \
  --query 'SecretList[*].{Name:Name,Description:Description}' \
  --output table \
  --region $REGION 