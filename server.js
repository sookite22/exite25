const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 정적 파일 제공 (map.js, index.html 등 포함)
app.use(express.static(path.join(__dirname)));

// index.html 라우팅
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 행안부 대피소 API 프록시
app.get('/api/shelters', async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;
        const rawKey = 'IL92VRAIXR636NN5';
        const encodedKey = encodeURIComponent(rawKey);

        const apiUrl = `https://apis.data.go.kr/1741000/DSSP-IF-00103/V2?serviceKey=${encodedKey}&latitude=${lat}&longitude=${lng}&radius=${radius}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        res.json(data);
    } catch (error) {
        console.error('행안부 API 요청 실패:', error);
        res.status(500).json({ error: '행안부 API 요청 실패' });
    }
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
