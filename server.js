const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 정적 파일 경로 설정
app.use(express.static(path.join(__dirname)));

// index.html 요청 처리
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});