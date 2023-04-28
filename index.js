// Crea un mapa en el elemento con el ID "map"
var map = L.map('map-container').setView([-34.595866, -58.370659], 17);

// Agrega un mosaico de OpenStreetMap como capa base del mapa
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
  maxZoom: 18
}).addTo(map);

