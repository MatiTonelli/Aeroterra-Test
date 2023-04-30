// Crea un mapa en el elemento con el ID "map-container"
var map = L.map("map-container").setView([-34.595866, -58.370659], 14);

// Agrega un mosaico de OpenStreetMap como capa base del mapa
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

let newIcon = L.icon({
  iconUrl: "pin.png",
  iconSize: [41, 41],
  iconAnchor: [20, 40],
});

let tempIcon = L.icon({
  iconUrl: "pinTemp.png",
  iconSize: [41, 41],
  iconAnchor: [20, 40],
});

let temporalMark = L.marker([0, 0], {
  interactive: true,
  riseOnHover: true,
  icon: tempIcon,
});

// inicializamos algunas marcas desde data.json
fetch("data.json")
  .then((response) => response.json())
  .then((data) => {
    for (let i = 0; i < data.length; i++) {
      const ubi = data[i];

      const htmlContent = `
    <div>
        <p><strong>Descripcion:</strong> ${ubi.name}</p>
        <p><strong>Direccion:</strong> ${ubi.direction}</p>
        <p><strong>Telefono:</strong> ${ubi.phone}</p>
        <p><strong>(X, Y):</strong> ${ubi.long}, ${ubi.lat}</p>
        <p><strong>Categoria:</strong> ${ubi.type}</p>
        <button class='borrarMarcador' data-id="${ubi.id}">Borrar</button>
    </div>`;
      const markerNuevo = L.marker([Number(ubi.lat), Number(ubi.long)], {
        interactive: true,
        riseOnHover: true,
        icon: newIcon,
      });
      markerNuevo.bindPopup(htmlContent).addTo(map);
    }
  })
  .catch((error) => {
    console.error("Error:", error);
  });

map.on("click", function (e) {
  map.removeLayer(temporalMark);
  document.querySelector("#searchbar-results").innerHTML = "";
  // recuperar lat y lng del click
  let lat = e.latlng.lat;
  let lng = e.latlng.lng;
  temporalMark = L.marker([Number(lat), Number(lng)], {
    interactive: false,
    riseOnHover: true,
    icon: tempIcon,
  }).addTo(map);

  // llamada a la api para obtener direccion
  document.querySelector("#direction-autocomplete").innerHTML = "";
  document.querySelector("#loader-direccion").style.display = "flex";
  fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      document.querySelector("#loader-direccion").style.display = "none";
      let address = data.display_name;
      if (!address) {
        document.querySelector("#direction-autocomplete").innerHTML =
          "Sin direccion especifica";
      } else {
        document.querySelector("#direction-autocomplete").innerHTML = address;
      }
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
        <p><strong>Descripcion:</strong> ${name}</p>
        <p><strong>Direccion:</strong> ${direction}</p>
        <p><strong>Telefono:</strong> ${phone}</p>
        <p><strong>(X, Y):</strong> ${long}, ${lat}</p>
        <p><strong>Categoria:</strong> ${type}</p>
    </div>`;
    L.marker([Number(lat), Number(long)], { interactive: true, icon: newIcon })
      .addTo(map)
      .bindPopup(htmlContent);
    map.removeLayer(temporalMark);
    document.querySelector("#name").value = "";
    document.querySelector("#direction-autocomplete").innerHTML = "";
    document.querySelector("#phone").value = "";
    long = document.querySelector("#long").value = "";
    lat = document.querySelector("#lat").value = "";
  }
});

const searchbarLoader = document.createElement("div");
searchbarLoader.classList.add("loader");
searchbarLoader.setAttribute("id", "loader-searchbar");

document.querySelector("#button-searchbar").addEventListener("click", () => {
  let busqueda = document.querySelector("#searchbar").value;
  if (busqueda) {
    document.querySelector("#searchbar-results").innerHTML = "";
    document.querySelector("#searchbar-results").appendChild(searchbarLoader);
    document.querySelector("#loader-searchbar").style.display = "flex";
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
        if (data.length) {
          document.querySelector("#loader-searchbar").style.display = "none";
          document.querySelector("#searchbar-results").innerHTML = "";
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
            nuevoElemento.addEventListener("click", () => {
              map.removeLayer(temporalMark);
              document.querySelector("#direction-autocomplete").innerHTML =
                resultado.display_name;
              document.querySelector("#long").value = resultado.lon;
              document.querySelector("#lat").value = resultado.lat;
              map.setView([resultado.lat, resultado.lon]);
              temporalMark = L.marker(
                [Number(resultado.lat), Number(resultado.lon)],
                {
                  interactive: false,
                  riseOnHover: true,
                  icon: tempIcon,
                }
              ).addTo(map);
              document.querySelector("#searchbar-results").innerHTML = "";
            });
            document
              .querySelector("#searchbar-results")
              .appendChild(nuevoElemento);
          }
        } else {
          document.querySelector("#loader-searchbar").style.display = "none";
          document.querySelector("#searchbar-results").innerHTML = "";
          const mensaje = document.createElement("p");
          mensaje.textContent = "No se encontraron resultados";

          document.querySelector("#searchbar-results").appendChild(mensaje);
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
