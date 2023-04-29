// Crea un mapa en el elemento con el ID "map-container"
var map = L.map("map-container").setView([-34.595866, -58.370659], 14);

// Agrega un mosaico de OpenStreetMap como capa base del mapa
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

// inicializamos algunas marcas desde data.json
fetch("data.json")
  .then((response) => response.json())
  .then((data) => {
    for (let i = 0; i < data.length; i++) {
      const ubi = data[i];
      const htmlContent = `
    <div>
        <p>Descripcion: ${ubi.name}</p>
        <p>Direccion: ${ubi.direction}</p>
        <p>Telefono: ${ubi.phone}</p>
        <p>(X, Y): ${ubi.long}, ${ubi.lat}</p>
        <p>Categoria: ${ubi.type}</p>
        <button>Borrar marcador</button>
    </div>`;
      L.marker([Number(ubi.lat), Number(ubi.long)], { interactive: true })
        .addTo(map)
        .bindPopup(htmlContent);
    }
  })
  .catch((error) => {
    console.error("Error:", error);
  });

map.on("click", function (e) {
  // recuperar lat y lng del click
  let lat = e.latlng.lat;
  let lng = e.latlng.lng;

  // llamada a la api para obtener direccion
  fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      let address = data.display_name;
      document.querySelector("#direction-autocomplete").innerHTML = address;
      document.querySelector("#long").value = lng;
      document.querySelector("#lat").value = lat;
    });
});

document.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();
  let name = document.querySelector("#name").value;
  let direction = document.querySelector("#direction-autocomplete").innerHTML;
  let phone = document.querySelector("#phone").value;
  let type = document.querySelector("#type").value;
  let long = document.querySelector("#long").value;
  let lat = document.querySelector("#lat").value;
  if (validate(name, phone, long, lat)) {
    const htmlContent = `
    <div>
        <p>Descripcion: ${name}</p>
        <p>Direccion: ${direction}</p>
        <p>Telefono: ${phone}</p>
        <p>(X, Y): ${long}, ${lat}</p>
        <p>Categoria: ${type}</p>
    </div>`;
    L.marker([Number(lat), Number(long)], { interactive: true })
      .addTo(map)
      .bindPopup(htmlContent);
  }
});

document.querySelector("#button-searchbar").addEventListener("click", () => {
  let busqueda = document.querySelector("#searchbar").value;
  if (busqueda) {
    busqueda = busqueda.replace(" ", "%20");
    fetch(
      "https://nominatim.openstreetmap.org/search?q=" +
        busqueda +
        "&format=json"
    )
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        for (let i = 0; i < data.length && i < 5; i++) {
          let resultado = data[i];
          const nuevoElemento = document.createElement("div");
          const nombre = document.createElement("p");
          nombre.textContent = resultado.display_name;
          const coordenadas = document.createElement("p");
          coordenadas.textContent = resultado.lat + ", " + resultado.lon;
          nuevoElemento.appendChild(nombre);
          nuevoElemento.appendChild(coordenadas);
          nuevoElemento.classList.add("resultados");
          document
            .querySelector("#searchbar-results")
            .appendChild(nuevoElemento);
        }
      });
  }
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
    console.log("phone");
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

  if (Number(long) < -180 || Number(long) > 180 || long == "") {
    console.log(long.length);
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

  if (Number(lat) < -90 || Number(lat) > 90 || lat == "") {
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
