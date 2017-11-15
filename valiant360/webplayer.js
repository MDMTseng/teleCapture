$(document).ready(function() {
  $('.valiantPhoto').Valiant360();

  $('#fileinput').on('change', function() {
    setInterval(updatePositon, 3000);
  });
});

var map;
var infowindow;
var myLatlng;
var marker;
var latitude;
var longtitude;

function initMap() {
  myLatlng = new google.maps.LatLng(37.534389, -122.331300);
  var map_opts = {
    zoom: 17,
    center: myLatlng
  };

  map = new google.maps.Map(document.getElementById('map'), map_opts);
  var contentString = 'Current location';

  infowindow = new google.maps.InfoWindow({
    content: contentString
  });

  marker = new google.maps.Marker({
    position: myLatlng,
    map: map,
    title: "current location",
    animation: google.maps.Animation.DROP
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map, marker);
  });
  infowindow.open(map, marker);
}
var row = 0;
var col = 0;

function updatePositon() {
  if (GPS_data[row] != 'undefined') {
    if (row < GPS_data.length) {
      var lat = parseInt(GPS_data[row][col]) / 1e7;
      var lng = parseInt(GPS_data[row][col + 1]) / 1e7;
      myLatlng = new google.maps.LatLng(lat, lng);
      var newmark = new google.maps.Marker({
        position: myLatlng,
        map: map,
        title: "current location",
        animation: google.maps.Animation.DROP
      });
      newmark.setPosition(myLatlng);
      map.setCenter(myLatlng);
      if (col + 5 >= GPS_data[row].length){
          col = 0;
          row += 1;
      }
      else {
        col += 5;
      }

    }

  }
}
