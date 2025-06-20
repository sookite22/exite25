// 마커를 담을 배열입니다
var keywordMarkers = [];
var categoryMarkers = [];

// 지도 초기화
var mapContainer = document.getElementById('map');
var mapOption = {
    center: new kakao.maps.LatLng(37.566826, 126.9786567),
    level: 3
};

var map = new kakao.maps.Map(mapContainer, mapOption);
var ps = new kakao.maps.services.Places(map);
var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

// 로드뷰 함수
function showRoadview(lat, lng) {
    var roadviewContainer = document.getElementById('roadview');
    var roadview = new kakao.maps.Roadview(roadviewContainer);
    var roadviewClient = new kakao.maps.RoadviewClient();
    var position = new kakao.maps.LatLng(lat, lng);

    roadviewClient.getNearestPanoId(position, 50, function(panoId) {
        roadview.setPanoId(panoId, position);
    });
}

// 초기 지도 위치를 사용자 현재 위치로 설정
var mylat = 37.566826;
var mylng = 126.9786567;
function initializeMapLocation() {
    if (!navigator.geolocation) {
        alert("브라우저가 위치 정보를 지원하지 않습니다.");
        return;
    }
    navigator.geolocation.getCurrentPosition(function (position) {
        mylat = position.coords.latitude;
        mylng = position.coords.longitude;
        var center = new kakao.maps.LatLng(mylat, mylng);
        map.setCenter(center);
    }, function (error) {
        alert("위치 정보를 가져오지 못했습니다.");
    });
}

initializeMapLocation();

// 검색 버튼 클릭 시 실행
// document.getElementById("searchBtn").addEventListener("click", searchByCenter);

document.getElementById("searchBtn").addEventListener("click", () => {
    const center = map.getCenter();
    const lat = center.getLat();
    const lng = center.getLng();

    removeAllMarkers();
    removeAllChildNods(document.getElementById('placesList'));

    searchSheltersFromAPI(lat, lng); // 행안부 API 사용
    searchNearbyShops(lat, lng);     // 카카오 categorySearch 사용
});


function searchSheltersFromAPI(lat, lng) {
    const radius = 3000; // 3km
    const url = `/api/shelters?lat=${lat}&lng=${lng}&radius=${radius}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.body && data.body.items) {
                data.body.items.forEach((shelter, idx) => {
                    const lat = parseFloat(shelter.YMAP_CRTS);
                    const lng = parseFloat(shelter.XMAP_CRTS);
                    const position = new kakao.maps.LatLng(lat, lng);

                    const marker = new kakao.maps.Marker({
                        position: position,
                        map: map
                    });

                    kakao.maps.event.addListener(marker, 'click', () => {
                        infowindow.setContent(`<div style="padding:5px;font-size:12px;">${shelter.THINGS_NM || '이름 없음'}</div>`);

                        infowindow.open(map, marker);
                    });

                    keywordMarkers.push(marker);
                });
            } else {
                alert('대피소 데이터를 가져오지 못했습니다.');
            }
        })
        .catch(error => {
            console.error('행안부 API 오류:', error);
            alert('대피소 정보 요청 중 오류가 발생했습니다.');
        });
}

function searchNearbyShops(lat, lng) {
    const center = new kakao.maps.LatLng(lat, lng);
    const searchOptions = {
        location: center,
        radius: 3000
    };

    ps.categorySearch('MT1', categorySearchCB, searchOptions); // 대형마트
    ps.categorySearch('CS2', categorySearchCB, searchOptions); // 편의점
}



// function keywordSearchCB(data, status, pagination) {
//     if (status === kakao.maps.services.Status.OK) {
//         displayPlaces(data);
//         displayPagination(pagination);
//     } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
//         alert('검색 결과가 없습니다.');
//     } else {
//         alert('검색 중 오류가 발생했습니다.');
//     }
// }



function categorySearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
        for (var i = 0; i < data.length; i++) {
            displayMarker(data[i]);
        }
    }
}

function displayPlaces(places) {
    var listEl = document.getElementById('placesList'),
        menuEl = document.getElementById('menu_wrap'),
        fragment = document.createDocumentFragment(),
        bounds = new kakao.maps.LatLngBounds();

    for (var i = 0; i < places.length; i++) {
        var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
            marker = addMarker(placePosition, i),
            itemEl = getListItem(i, places[i]);

        bounds.extend(placePosition);

        (function (marker, title) {
            kakao.maps.event.addListener(marker, 'mouseover', function () {
                displayInfowindow(marker, title);
            });
            kakao.maps.event.addListener(marker, 'mouseout', function () {
                infowindow.close();
            });
            itemEl.onmouseover = function () {
                displayInfowindow(marker, title);
            };
            itemEl.onmouseout = function () {
                infowindow.close();
            };
        })(marker, places[i].place_name);

        fragment.appendChild(itemEl);
    }

    listEl.appendChild(fragment);
    menuEl.scrollTop = 0;
}

function getListItem(index, place) {
    var el = document.createElement('li');
    el.className = 'item';

    var itemStr = '<span class="markerbg marker_' + (index + 1) + '"></span>' +
        '<div class="info">' +
        '<h5>' + place.place_name + '</h5>';

    if (place.road_address_name) {
        itemStr += '<span>' + place.road_address_name + '</span>' +
            '<span class="jibun gray">' + place.address_name + '</span>';
    } else {
        itemStr += '<span>' + place.address_name + '</span>';
    }

    itemStr += '<span class="tel">' + place.phone + '</span>' + '</div>';
    el.innerHTML = itemStr;
    return el;
}

function addMarker(position, idx) {
    var imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png',
        imageSize = new kakao.maps.Size(36, 37),
        imgOptions = {
            spriteSize: new kakao.maps.Size(36, 691),
            spriteOrigin: new kakao.maps.Point(0, (idx * 46) + 10),
            offset: new kakao.maps.Point(13, 37)
        },
        markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
        marker = new kakao.maps.Marker({
            position: position,
            image: markerImage
        });

    marker.setMap(map);
    keywordMarkers.push(marker);
    return marker;
}

function displayMarker(place) {
    var marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(place.y, place.x)
    });

    kakao.maps.event.addListener(marker, 'click', function () {
    const latlng = marker.getPosition();
    markerlat = latlng.getLat();
    markerlng = latlng.getLng();
   
    //길찾기 버튼추가
    const content = `
        <div style="padding:5px; font-size:12px;">
            ${place.place_name}<br>
            <button onclick="handleInfowindowButton('${place.place_name}', ${markerlat}, ${markerlng})">길찾기</button>
        </div>
    `;
    infowindow.setContent(content);
    infowindow.open(map, marker);
    });

    categoryMarkers.push(marker);
}

function removeKeywordMarkers() {
    for (var i = 0; i < keywordMarkers.length; i++) {
        keywordMarkers[i].setMap(null);
    }
    keywordMarkers = [];
}

function removeCategoryMarkers() {
    for (var i = 0; i < categoryMarkers.length; i++) {
        categoryMarkers[i].setMap(null);
    }
    categoryMarkers = [];
}

function removeAllMarkers() {
    removeKeywordMarkers();
    removeCategoryMarkers();
}

function displayPagination(pagination) {
    var paginationEl = document.getElementById('pagination'),
        fragment = document.createDocumentFragment();

    while (paginationEl.hasChildNodes()) {
        paginationEl.removeChild(paginationEl.lastChild);
    }

    for (var i = 1; i <= pagination.last; i++) {
        var el = document.createElement('a');
        el.href = "#";
        el.innerHTML = i;

        if (i === pagination.current) {
            el.className = 'on';
        } else {
            el.onclick = (function (i) {
                return function () {
                    pagination.gotoPage(i);
                }
            })(i);
        }

        fragment.appendChild(el);
    }

    paginationEl.appendChild(fragment);
}

function displayInfowindow(marker, title) {
    var content = '<div style="padding:5px;z-index:1;">' + title + '</div>';
    infowindow.setContent(content);
    infowindow.open(map, marker);
}

function removeAllChildNods(el) {
    while (el.hasChildNodes()) {
        el.removeChild(el.lastChild);
    }
}

// 교통정보
map.addOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC);


// 현재위치 
  document.addEventListener("DOMContentLoaded", () =>
    document.getElementById("mylocationBtn")?.addEventListener("click", () =>
        initializeMapLocation(),
        
    )
  );



//카카오모빌리티 길찾기API
let polyline = null;

async function getDirection() {
    const REST_API_KEY = '28706b15d44827253d90da40e5ade8a9'; 
    const url = 'https://apis-navi.kakaomobility.com/v1/directions';

   // 출발지origin 목적지destination 좌표
    const origin = `${mylng},${mylat}`;
    const destination = `${markerlng},${markerlat}`;

    const queryParams = new URLSearchParams({
      origin: origin,
      destination: destination,
      priority: 'RECOMMEND'
    });
    
    const requestUrl = `${url}?${queryParams}`;

     try {
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        Authorization: `KakaoAK ${REST_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
    const data = await response.json(); 
//길찾기좌표
    const linePath = [];
    data.routes[0].sections[0].roads.forEach(router => {
      for (let i = 0; i < router.vertexes.length; i += 2) {
        const lng = router.vertexes[i];
        const lat = router.vertexes[i + 1];
        linePath.push(new kakao.maps.LatLng(lat, lng));
      }
    });
//선그리기
    if (polyline) {
        polyline.setMap(null);
        polyline = null;
      }

    polyline = new kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 5,
      strokeColor: '#000000',
      strokeOpacity: 0.7,
      strokeStyle: 'solid',
      endArrow: true
    });
    polyline.setMap(map);

    } catch (error) {
      console.error('Error:', error);
    }   
}

//길찾기
function handleInfowindowButton() {
    const myPosition = new kakao.maps.LatLng(mylat, mylng);
      const mymarker = new kakao.maps.Marker({
        position: myPosition
      });
      mymarker.setMap(map); 
    getDirection();

}
