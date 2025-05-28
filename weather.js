// weather.js
// OpenWeather API를 이용해 클릭 위치의 실시간 날씨 정보를 모달로 표시합니다.

document.addEventListener('DOMContentLoaded', function() {
    const apiKey = '00aa787f50fd371cca6b48bf46674a2d'; // 발급받은 키로 교체
  
    // 모달 요소
    const popup = document.getElementById('weather-popup');
    const content = document.getElementById('weather-popup-content');
    const closeBtn = document.getElementById('weather-popup-close');
  
    // 모달 닫기
    closeBtn.addEventListener('click', () => {
      popup.classList.add('hidden');
    });
  
    // 지도 클릭 시 날씨 조회 & 모달 띄우기
    kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
      const lat = mouseEvent.latLng.getLat();
      const lon = mouseEvent.latLng.getLng();
  
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=kr&appid=${apiKey}`)
        .then(res => res.json())
        .then(data => {
          content.innerHTML = `
            <h3 class="font-semibold mb-2">현재 날씨</h3>
            <p>위치: ${data.name || lat.toFixed(2) + ', ' + lon.toFixed(2)}</p>
            <p>온도: ${data.main.temp}°C</p>
            <p>습도: ${data.main.humidity}%</p>
            <p>날씨: ${data.weather[0].description}</p>
          `;
          popup.classList.remove('hidden');
        })
        .catch(err => console.error('날씨 정보 로드 오류:', err));
    });
  });
  