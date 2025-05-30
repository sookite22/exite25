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
function initializeMapLocation() {
    if (!navigator.geolocation) {
        alert("브라우저가 위치 정보를 지원하지 않습니다.");
        return;
    }
    navigator.geolocation.getCurrentPosition(function (position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        var center = new kakao.maps.LatLng(lat, lng);
        map.setCenter(center);
    }, function (error) {
        alert("위치 정보를 가져오지 못했습니다.");
    });
}

initializeMapLocation();

// 검색 버튼 클릭 시 실행
document.getElementById("searchBtn").addEventListener("click", searchByCenter);

function searchByCenter() {
    var center = map.getCenter();
    const searchOptions = {
        location: center,
        radius: 3000
    };

    removeAllMarkers();
    removeAllChildNods(document.getElementById('placesList'));

    ps.keywordSearch('대피소', keywordSearchCB, searchOptions);
    ps.categorySearch('MT1', categorySearchCB, searchOptions);
    ps.categorySearch('CS2', categorySearchCB, searchOptions);
}

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
        infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>');
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
