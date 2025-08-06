# 멀티스테이지 빌드를 위한 Dockerfile
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# 소스 코드 복사
COPY . .

# React 앱 빌드
RUN npm run build

# 프로덕션 스테이지
FROM node:18-alpine AS production

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 프로덕션 의존성만 설치
RUN npm ci --only=production

# 빌드된 React 앱 복사
COPY --from=builder /app/build ./public

# 서버 소스 코드 복사
COPY server ./server

# 포트 노출
EXPOSE 3000

# 환경 변수 설정
ENV NODE_ENV=production
ENV PORT=3000

# 애플리케이션 시작
CMD ["npm", "run", "server"] 