var ps;

// 로드뷰 함수
function showRoadview(lat, lng) {
    var roadviewContainer = document.getElementById('roadview'); // HTML의 div id=roadview에서 가져옴
    var roadview = new kakao.maps.Roadview(roadviewContainer);
    var roadviewClient = new kakao.maps.RoadviewClient();
    var position = new kakao.maps.LatLng(lat, lng);

    roadviewClient.getNearestPanoId(position, 50, function(panoId) {
        roadview.setPanoId(panoId, position);
    })
};



// 키워드로 장소 검색

// 마커를 담을 배열입니다
var markers = [];

var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
    mapOption = {
        center: new kakao.maps.LatLng(37.566826, 126.9786567), // 지도 중심좌표
        level: 3 // 지도 확대 레벨
    };  
 
var map = new kakao.maps.Map(mapContainer, mapOption); 
var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

searchSheltersByLocation();

// 대피소 검색 함수
function searchSheltersByLocation() {
    if (!navigator.geolocation) {
        alert("브라우저가 위치 정보를 지원하지 않습니다.");
        return;
    }

    navigator.geolocation.getCurrentPosition(function (position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        var center = new kakao.maps.LatLng(lat, lng);

        map.setCenter(center);
        
        const options = {
            location: center,
            radius: 3000 // 반경 3000m
        };

        // 키워드 고정: "대피소"
        ps.keywordSearch('대피소', placesSearchCB, options);
    }, function (error) {
        alert("위치 정보를 가져오지 못했습니다.");
    });
}

// placesSearchCB 함수
function placesSearchCB(data, status, pagination) {
  if (status === kakao.maps.services.Status.OK) {
    console.log('검색 결과:', data);
    // 여기서 리스트 출력, 마커 생성 등 추가 작업 수행
  } else {
    console.error('장소 검색 실패:', status);
  }
}


// 장소 검색 완료시 콜백함수
function keywordSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
        displayPlaces(data);
        displayPagination(pagination);
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 없습니다.');
    } else {
        alert('검색 중 오류가 발생했습니다.');
    }
}

// 검색 결과 목록 및 마커 함수
function displayPlaces(places) {
    var listEl = document.getElementById('placesList'),
        menuEl = document.getElementById('menu_wrap'),
        fragment = document.createDocumentFragment(),
        bounds = new kakao.maps.LatLngBounds();

    removeAllChildNods(listEl);
    removeMarker();

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
                displayInfowindow(marker, title); // 마우스 올렸을 때, 인포윈도우 장소명 표시
            };
            itemEl.onmouseout = function () {
                infowindow.close(); // 마우스 뺐을 때, 인포윈도우 닫아짐
            };
        })(marker, places[i].place_name);

        fragment.appendChild(itemEl);
    }

    listEl.appendChild(fragment);
    menuEl.scrollTop = 0;
    map.setBounds(bounds);
}


// 검색결과 항목을 Element로 반환하는 함수
function getListItem(index, place) {
    var el = document.createElement('li');
    el.className = 'item';

    var itemStr =
        '<span class="markerbg marker_' + (index + 1) + '"></span>' +
        '<div class="info">' +
        '<h5>' + place.place_name + '</h5>';

    if (place.road_address_name) {
        itemStr += '<span>' + place.road_address_name + '</span>' +
            '<span class="jibun gray">' + place.address_name + '</span>';
    } else {
        itemStr += '<span>' + place.address_name + '</span>';
    }

    itemStr += '<span class="tel">' + place.phone + '</span>' +
        '</div>';

    el.innerHTML = itemStr;
    return el;
}

// 마커를 생성하고 지도 위에 마커를 표시하는 함수
function addMarker(position, idx) {
    var imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png',
        imageSize = new kakao.maps.Size(36, 37), // 마커 이미지의 크기
        imgOptions = {
            spriteSize: new kakao.maps.Size(36, 691), // 스프라이트 이미지의 크기
            spriteOrigin: new kakao.maps.Point(0, (idx * 46) + 10), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
            offset: new kakao.maps.Point(13, 37) // 마커 좌표에 일치시킬 이미지 내에서의 좌표
        },
        markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
        marker = new kakao.maps.Marker({
            position: position,
            image: markerImage
        });

    marker.setMap(map); // 지도 위에 마커 표출
    markers.push(marker); // 배열에 생성된 마커 추가

    return marker;
}

// 지도 위에 표시되고 있는 마커를 모두 제거
function removeMarker() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

// 검색결과 목록 하단 페이지번호 표시 함수
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

// 검색결과 목록 또는 마커를 클릭했을 때 호출되는 함수
function displayInfowindow(marker, title) {
    var content = '<div style="padding:5px;z-index:1;">' + title + '</div>';
    infowindow.setContent(content);
    infowindow.open(map, marker);
}

// 검색결과 목록의 자식 Element를 제거하는 함수
function removeAllChildNods(el) {
    while (el.hasChildNodes()) {
        el.removeChild(el.lastChild);
    }
}




// 카테고리로 장소 검색 - 근처 상점 검색, 목록표시


var ps = new kakao.maps.services.Places(map); 

ps.categorySearch('MT1', placesSearchCB, {useMapBounds:true}); 
ps.categorySearch('CS2', placesSearchCB, {useMapBounds:true}); 

// 키워드 검색 완료 시 호출되는 콜백함수
function categorySearchCB (data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
        for (var i=0; i<data.length; i++) {
            displayMarker(data[i]);    
        }       
    }
}

// 지도에 마커를 표시하는 함수
function displayMarker(place) {
    // 마커를 생성하고 지도에 표시합니다
    var marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(place.y, place.x) 
    });

    // 마커에 클릭이벤트를 등록합니다
    kakao.maps.event.addListener(marker, 'click', function() {
        // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
        infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>');
        infowindow.open(map, marker);
    });
}



// 교통정보

// 지도에 교통정보를 표시하도록 지도타입을 추가합니다
map.addOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC);    

// 아래 코드는 위에서 추가한 교통정보 지도타입을 제거합니다
// map.removeOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC);  