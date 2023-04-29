// Crea un mapa en el elemento con el ID "map-container"
var map = L.map("map-container").setView([-34.595866, -58.370659], 17);

// Agrega un mosaico de OpenStreetMap como capa base del mapa
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

map.on("click", function (e) {
  // Obtener la latitud y longitud del punto donde se ha hecho clic
  var lat = e.latlng.lat;
  var lng = e.latlng.lng;

  // Hacer una petición a la API de geocodificación de OpenStreetMap
  var url =
    "https://nominatim.openstreetmap.org/reverse?format=json&lat=" +
    lat +
    "&lon=" +
    lng;
  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // Obtener la dirección a partir de la respuesta de la API
      var address = data.display_name;
      console.log(data);
    });
});

document.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.querySelector("#name").value;
  const direction = document.querySelector("#direction").value;
  const phone = document.querySelector("#phone").value;
  const type = document.querySelector("#type").value;
  const long = document.querySelector("#long").value;
  const lat = document.querySelector("#lat").value;
  if (validate(name, phone, long, lat)) {
    console.log('valida')
  } else {
    console.log('no valida')
  }
  console.log('name: ' + name, 'direction: ' + direction, 'phone: ' + phone, 'long: ' + long, 'lat: ' + lat)
  L.marker([-34.5674703, -58.6095855], { interactive: true })
    .addTo(map)
    .bindPopup("<div>asdasdas</div>");
});

const validate = (name, phone, long, lat) => {
  const phoneRegex = /[a-zA-Z]/; // Chequea si contiene letras

  let valides = true;

  if (name.length < 4) {
    if (name.length == 0) {
      let alerta = document.querySelector("#alerta-name");
      alerta.style.opacity = "1";
      alerta.innerHTML = "Nombre requerido";
    } else {
      let alerta = document.querySelector("#alerta-name");
      alerta.style.opacity = "1";
      alerta.innerHTML = "El nombre debe tener al menos 4 caracteres";
    }
    valides = false;
  } else {
    let alerta = document.querySelector("#alerta-name");
    alerta.style.opacity = "0";
  }

  if (phone.length < 5 || phoneRegex.test(phone)) {
    console.log('phone')
    if (phone.length == 0) {
      let alerta = document.querySelector("#alerta-phone");
      alerta.style.opacity = "1";
      alerta.innerHTML = "Telefono requerido";
    } else {
      let alerta = document.querySelector("#alerta-phone");
      alerta.style.opacity = "1";
      alerta.innerHTML = "El telefono debe ser valido";
    }
    valides = false;
  } else {
    let alerta = document.querySelector("#alerta-phone");
    alerta.style.opacity = "0";
  }
  
  if (Number(long) < -180 || Number(long) > 180 || long  == '') {
    console.log(long.length)
    if (long.length == 0) {
      let alerta = document.querySelector("#alerta-long");
      alerta.style.opacity = "1";
      alerta.innerHTML = "Longitud requerida";
    } else {
      let alerta = document.querySelector("#alerta-long");
      alerta.style.opacity = "1";
      alerta.innerHTML = "La longitud debe ser un valor entre -180 y 180";
    }
    valides = false;
  } else {
    let alerta = document.querySelector("#alerta-long");
    alerta.style.opacity = "0";
  }

  if (Number(lat) < -90 || Number(lat) > 90 || lat  == '') {
    if (lat.length == 0) {
      let alerta = document.querySelector("#alerta-lat");
      alerta.style.opacity = "1";
      alerta.innerHTML = "Latitud requerida";
    } else {
      let alerta = document.querySelector("#alerta-lat");
      alerta.style.opacity = "1";
      alerta.innerHTML = "La latitud debe ser un valor entre -90 y 90";
    }
    valides = false;
  } else {
    let alerta = document.querySelector("#alerta-lat");
    alerta.style.opacity = "0";
  }
  return valides;
};
