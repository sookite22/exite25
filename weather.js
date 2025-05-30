// document.addEventListener('DOMContentLoaded', function() {
//   const apiKey = '00aa787f50fd371cca6b48bf46674a2d'; // 발급받은 실제 키로 교체

//   // 모달 요소
//   const popup = document.getElementById('weather-popup');
//   const content = document.getElementById('weather-popup-content');
//   const closeBtn = document.getElementById('weather-popup-close');

//   // 모달 닫기
//   closeBtn.addEventListener('click', () => {
//     popup.classList.add('hidden');
//   });

//   // 기본 좌표 (서울) 설정
//   const lat = 37.345086;
//   const lon = 126.953209;

//   // 날씨 정보 조회
//   fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=kr&appid=${apiKey}`)
//     .then(res => res.json())
//     .then(data => {
//       // 모달 콘텐츠 구성
//       content.innerHTML = `
//         <h3 class="font-semibold mb-2">실시간 날씨 (${data.name})</h3>
//         <p>온도: ${data.main.temp}°C</p>
//         <p>습도: ${data.main.humidity}%</p>
//         <p>날씨: ${data.weather[0].description}</p>
//       `;
//       // 모달 보이기
//       popup.classList.remove('hidden');
//     })
//     .catch(err => console.error('날씨 정보 로드 오류:', err));
// });
