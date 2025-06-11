# Node.js 기반 이미지
FROM node:18

# 앱 디렉토리 생성
WORKDIR /app

# 종속성 복사 및 설치
COPY package*.json ./
RUN npm install

# 앱 코드 복사
COPY . .

# 서버 포트 열기
EXPOSE 3000

# 서버 실행
CMD ["npm", "start"]