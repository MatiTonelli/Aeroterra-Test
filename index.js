// Crea un mapa en el elemento con el ID "map-container"
var map = L.map("map-container").setView([-34.595866, -58.370659], 17);

// Agrega un mosaico de OpenStreetMap como capa base del mapa
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

document.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.querySelector("#name").value;
  const direction = document.querySelector("#direction").value;
  const phone = document.querySelector("#phone").value;
  const type = document.querySelector("#type").value;
  const long = Number(document.querySelector("#long").value);
  const lat = Number(document.querySelector("#lat").value);
  if (validate(name, direction, phone, long, lat)) {
  } else {
  }
  L.marker([-34.595866, -58.370659], { title: "hola", content: 'a' }).addTo(map);
});

const validate = (name, direction, phone, long, lat) => {
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
  if (direction.length < 4) {
    if (direction.length == 0) {
      let alerta = document.querySelector("#alerta-direction");
      alerta.style.opacity = "1";
      alerta.innerHTML = "Direccion requerida";
    } else {
      let alerta = document.querySelector("#alerta-direction");
      alerta.style.opacity = "1";
      alerta.innerHTML = "La direccion debe tener al menos 4 caracteres";
    }
    valides = false;
  } else {
    let alerta = document.querySelector("#alerta-direction");
    alerta.style.opacity = "0";
  }
  if (phone.length < 5 || !phoneRegex.test(phone)) {
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
  if (long < -180 || long > 180) {
  }
  if (lat < -90 || lat > 90) {
  }
};
