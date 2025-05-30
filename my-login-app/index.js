const express = require('express');
const session = require('express-session');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);

app.use(session({
  secret: 'my-secret-key',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 10
  }
}));

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password') {
    req.session.user = { username };
    res.send('로그인 성공!');
  } else {
    res.status(401).send('로그인 실패');
  }
});

app.get('/me', (req, res) => {
  if (req.session.user) {
    res.send(`안녕하세요, ${req.session.user.username}님`);
  } else {
    res.status(401).send('로그인 필요');
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('로그아웃 중 오류 발생');
    }
    res.clearCookie('connect.sid');
    res.send('로그아웃 완료');
  });
});

app.listen(3000, () => {
  console.log('서버 실행 중: http://localhost:3000');
});
