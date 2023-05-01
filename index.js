// Crea un mapa en el elemento con el ID "map-container", se inicializa con las coordenadas de las oficinas de Aeroterra
var map = L.map("map-container").setView([-34.595866, -58.370659], 14);

// Agrega un mosaico de OpenStreetMap como capa base del mapa
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

// Creacion de los diferentes iconos que se usan
let icon = L.icon({
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

// Loader de la searchbar, necesita estar inicializado dado que se vacia su elemento padre y es destruido
const searchbarLoader = document.createElement("div");
searchbarLoader.classList.add("loader");
searchbarLoader.setAttribute("id", "loader-searchbar");

// Inicializamos algunas marcas desde data.json
fetch("data.json")
  .then((response) => response.json())
  .then((data) => {
    for (let i = 0; i < data.length; i++) {
      const { name, direction, phone, type, long, lat } = data[i];
      createMark(name, direction, phone, type, long, lat);
    }
  })
  .catch((error) => {
    console.error("Error al precargar marcas del archivo .json:", error);
  });

// Evento click en el mapa, ubica la marca temporal y rellena inputs de direccion y coordenadas
map.on("click", function (e) {
  map.removeLayer(temporalMark);
  document.querySelector("#searchbar-results").innerHTML = "";
  // Recuperar lat y lng del click
  let lat = e.latlng.lat;
  let lng = e.latlng.lng;
  temporalMark = L.marker([Number(lat), Number(lng)], {
    interactive: false,
    riseOnHover: true,
    icon: tempIcon,
  }).addTo(map);

  // Llamada a la api (OpenStreetMap) para obtener direccion y rellenar info
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
    })
    .catch((error) => {
      document.querySelector("#loader-direccion").style.display = "none";
      document.querySelector("#direction-autocomplete").innerHTML =
        "Ubicacion no encontrada";
      console.log("Error al buscar direccion: ", error);
    });
});

// Submit del form principal, de estar todos los valores correctos, crea la marca. Mismo procedimiento que al precargar datos
document.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.target);
  const allData = Object.fromEntries(data.entries());
  const { name, phone, type, long, lat } = allData;
  let direction = document.querySelector("#direction-autocomplete").innerHTML;
  if (validate(name, phone, long, lat)) {
    // De no existir la direccion, primero la busca y luego crea la marca
    if (direction == "") {
      document.querySelector("#loader-direccion").style.display = "flex";
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}`
      )
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          direction = data.display_name;
          document.querySelector("#loader-direccion").style.display = "none";
          if (!direction) {
            direction = "Sin direccion especifica";
          }
          createMark(name, direction, phone, type, long, lat);
          map.removeLayer(temporalMark);
          document.querySelector("#name").value = "";
          document.querySelector("#direction-autocomplete").innerHTML = "";
          document.querySelector("#phone").value = "";
          document.querySelector("#long").value = "";
          document.querySelector("#lat").value = "";
        })
        .catch((error) => {
          document.querySelector("#loader-direccion").style.display = "none";
          document.querySelector("#direction-autocomplete").innerHTML =
            "Ubicacion no encontrada";
          console.log("Error al buscar las coordenadas: ", error);
        });
    } else {
      createMark(name, direction, phone, type, long, lat);
      map.removeLayer(temporalMark);
      document.querySelector("#name").value = "";
      document.querySelector("#direction-autocomplete").innerHTML = "";
      document.querySelector("#phone").value = "";
      document.querySelector("#long").value = "";
      document.querySelector("#lat").value = "";
    }
  }
});

// Funcion que crea las marcas con sus respectivos parametros
const createMark = (name, direction, phone, type, long, lat) => {
  // Contenido HTML para los popups de las marcas
  const htmlContent = `
	<div style="display: flex; flex-direction: column">
		<p><strong>Descripcion:</strong> ${name}</p>
		<p><strong>Direccion:</strong> ${direction}</p>
		<p><strong>Telefono:</strong> ${phone}</p>
		<p><strong>(X, Y):</strong> ${long}, ${lat}</p>
		<p><strong>Categoria:</strong> ${type}</p>
		<button class='borrarMarcador' style="background-color: red; border: none; height: 2em; border-radius: 10px; cursor: pointer; color: white;">Borrar</button>
	</div>`;
  let markerNuevo = L.marker([Number(lat), Number(long)], {
    icon,
  })
    .addTo(map)
    .bindPopup(htmlContent);
  // Cuando el popup abre agregamos el eventlistener a su boton de borrar, de otra forma no encontrariamos ese boton, dado que no se crea hasta que se abre el popup
  markerNuevo.on("popupopen", function (e) {
    document.querySelector(".borrarMarcador").addEventListener("click", () => {
      map.removeLayer(e.target);
    });
  });
};

// Evento de click del boton de busqueda por texto (searchbar), solo salvamos los primeros 5 resultados
document.querySelector("#button-searchbar").addEventListener("click", () => {
  let busqueda = document.querySelector("#searchbar").value;
  if (busqueda) {
    document.querySelector("#searchbar-results").innerHTML = "";
    document.querySelector("#searchbar-results").appendChild(searchbarLoader);
    document.querySelector("#loader-searchbar").style.display = "flex";
    busqueda = busqueda.replace(" ", "%20");
    // Llamada a la api (OpenStreetMap) para obtener resultados
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
      })
      .catch((error) => {
        console.log("Error al buscar: ", busqueda, ". Error: ", error);
        document.querySelector("#loader-searchbar").style.display = "none";
        document.querySelector("#searchbar-results").innerHTML = "";
        const mensaje = document.createElement("p");
        mensaje.textContent = "Error al buscar: " + busqueda;
        document.querySelector("#searchbar-results").appendChild(mensaje);
      });
  }
});

// Funcion validadora de los inputs, chequea datos requeridos
const validate = (name, phone, long, lat) => {
  const phoneRegex = /[a-zA-Z]/; // Chequea si contiene letras
  const coordRegex = /^[0-9.\-]+$/; // Chequea si contiene algo que no sea numero, punto o guion medio

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

  if (
    Number(long) < -180 ||
    Number(long) > 180 ||
    long == "" ||
    !coordRegex.test(long)
  ) {
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

  if (
    Number(lat) < -90 ||
    Number(lat) > 90 ||
    lat == "" ||
    !coordRegex.test(lat)
  ) {
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
