// =====================================================
// KATALEYA - APP: conecta la lógica con la página
// =====================================================
// Regla: los textos que vienen de la hoja se escriben con textContent
// (nunca innerHTML) para que un texto raro en la hoja no rompa la página.

let productos = []; // lista completa de productos
let categoriaActual = "Todas"; // filtro de categoría
let textoBusqueda = ""; // texto del buscador
let ordenActual = "az"; // tipo de orden
let ciudadSeleccionada = ""; // ciudad de entrega elegida
let productoEnFicha = null; // producto abierto en la ficha

// Imagen de reemplazo (un cuadro rosado) si la foto no existe o no carga
const IMAGEN_REEMPLAZO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
      '<rect width="200" height="200" fill="#fbe9ef"/>' +
      '<text x="100" y="115" font-size="64" text-anchor="middle" fill="#b8305f" font-family="Georgia,serif">K</text>' +
      "</svg>",
  );

// ---------- Utilidades ----------

function porId(id) {
  return document.getElementById(id);
}

// Crea un elemento con clase y texto (el texto siempre como textContent)
function crear(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function crearImagen(url, texto) {
  const img = document.createElement("img");
  img.src = url || IMAGEN_REEMPLAZO;
  img.alt = texto || "";
  img.loading = "lazy";
  img.onerror = function () {
    img.onerror = null;
    img.src = IMAGEN_REEMPLAZO;
  };
  return img;
}

// Precio con descuento aplicado
function precioFinal(producto) {
  return Math.round((producto.precio * (100 - producto.descuento)) / 100);
}

// ---------- Inicio ----------

async function iniciar() {
  prepararTextosFijos();
  prepararSelectores();
  prepararEventos();
  dibujarCarrito();

  // Si todavía no se pegó el enlace de Google Sheets, se usa el CSV de ejemplo
  const url =
    CONFIG.urlCatalogo.indexOf("http") === 0
      ? CONFIG.urlCatalogo
      : "datos/plantilla-productos.csv";

  try {
    productos = await cargarProductos(url);
  } catch (error) {
    mostrarMensajeCatalogo(
      "No se pudo cargar el catálogo. Intenta de nuevo más tarde.",
    );
    return;
  }

  dibujarCategorias();
  dibujarCatalogo();
  dibujarCarrito();
}

// Textos que dependen de config.js
function prepararTextosFijos() {
  document.title = CONFIG.nombreTienda + " — " + CONFIG.eslogan;
  porId("nombre-tienda").textContent = CONFIG.nombreTienda;
  porId("ciudad-tienda").textContent = CONFIG.ciudadTienda;
  porId("portada-texto").textContent =
    CONFIG.eslogan +
    ". Arma tu pedido en el carrito y lo recibes en tu ciudad.";
  porId("pie-texto").textContent =
    "© " + new Date().getFullYear() + " " + CONFIG.nombreTienda;
  porId("btn-asesora").href = generarEnlaceAsesora();

  // Redes sociales: solo se muestran las que tienen enlace
  const contenedorRedes = porId("redes");
  Object.keys(CONFIG.redes).forEach(function (nombre) {
    const enlace = CONFIG.redes[nombre];
    if (!enlace) return;
    const a = crear("a", "", nombre.charAt(0).toUpperCase() + nombre.slice(1));
    a.href = enlace;
    a.target = "_blank";
    a.rel = "noopener";
    contenedorRedes.appendChild(a);
  });
}

// Llena el selector de ciudades y el de forma de pago
function prepararSelectores() {
  const selectorCiudad = porId("ciudad-entrega");
  const primera = crear("option", "", "Selecciona tu ciudad");
  primera.value = "";
  selectorCiudad.appendChild(primera);
  Object.keys(CONFIG.tarifasDomicilio).forEach(function (ciudad) {
    const opcion = crear("option", "", ciudad);
    opcion.value = ciudad;
    selectorCiudad.appendChild(opcion);
  });

  const selectorPago = porId("forma-pago");
  CONFIG.formasPago.forEach(function (forma) {
    const opcion = crear("option", "", forma);
    opcion.value = forma;
    selectorPago.appendChild(opcion);
  });
}

// ---------- Catálogo ----------

function mostrarMensajeCatalogo(texto) {
  const catalogo = porId("catalogo");
  catalogo.textContent = "";
  catalogo.appendChild(crear("p", "mensaje-estado", texto));
}

function dibujarCategorias() {
  const contenedor = porId("categorias");
  contenedor.textContent = "";
  const lista = ["Todas"].concat(obtenerCategorias(productos));

  lista.forEach(function (categoria) {
    const boton = crear(
      "button",
      "chip" + (categoria === categoriaActual ? " activa" : ""),
      categoria,
    );
    boton.type = "button";
    boton.addEventListener("click", function () {
      categoriaActual = categoria;
      dibujarCategorias();
      dibujarCatalogo();
    });
    contenedor.appendChild(boton);
  });
}

function productosFiltrados() {
  const texto = textoBusqueda.toLowerCase().trim();

  const lista = productos.filter(function (p) {
    const coincideCategoria =
      categoriaActual === "Todas" || p.categoria === categoriaActual;
    const textoProducto = (
      p.nombre +
      " " +
      p.marca +
      " " +
      p.categoria
    ).toLowerCase();
    return coincideCategoria && textoProducto.includes(texto);
  });

  lista.sort(function (a, b) {
    if (ordenActual === "za") return b.nombre.localeCompare(a.nombre, "es");
    if (ordenActual === "menor") return precioFinal(a) - precioFinal(b);
    if (ordenActual === "mayor") return precioFinal(b) - precioFinal(a);
    if (ordenActual === "recientes") return b.id - a.id; // id más alto = más nuevo
    return a.nombre.localeCompare(b.nombre, "es"); // A-Z
  });

  return lista;
}

function dibujarCatalogo() {
  const lista = productosFiltrados();
  porId("titulo-catalogo").textContent =
    categoriaActual === "Todas" ? "Todo el catálogo" : categoriaActual;

  if (lista.length === 0) {
    mostrarMensajeCatalogo("No encontramos productos con esa búsqueda.");
    return;
  }

  const catalogo = porId("catalogo");
  catalogo.textContent = "";
  lista.forEach(function (producto) {
    catalogo.appendChild(crearTarjeta(producto));
  });
}

function crearTarjeta(producto) {
  const tarjeta = crear(
    "article",
    "tarjeta" + (producto.disponible ? "" : " sin-stock"),
  );

  // Etiqueta: agotado o descuento
  if (!producto.disponible) {
    tarjeta.appendChild(crear("span", "etiqueta agotado", "Agotado"));
  } else if (producto.descuento > 0) {
    tarjeta.appendChild(
      crear("span", "etiqueta", "-" + producto.descuento + "%"),
    );
  }

  // Imagen (abre la ficha)
  const botonImagen = crear("button", "tarjeta-imagen");
  botonImagen.type = "button";
  botonImagen.setAttribute("aria-label", "Ver ficha de " + producto.nombre);
  botonImagen.appendChild(crearImagen(producto.imagen, producto.nombre));
  botonImagen.addEventListener("click", function () {
    abrirFicha(producto);
  });
  tarjeta.appendChild(botonImagen);

  const cuerpo = crear("div", "tarjeta-cuerpo");
  cuerpo.appendChild(crear("p", "tarjeta-marca", producto.marca));

  const nombre = crear("button", "tarjeta-nombre", producto.nombre);
  nombre.type = "button";
  nombre.addEventListener("click", function () {
    abrirFicha(producto);
  });
  cuerpo.appendChild(nombre);

  cuerpo.appendChild(crearPrecios(producto));

  const agregar = crear(
    "button",
    "btn-agregar",
    producto.disponible ? "Agregar" : "Agotado",
  );
  agregar.type = "button";
  agregar.disabled = !producto.disponible;
  agregar.addEventListener("click", function () {
    agregarAlCarrito(producto.id);
    dibujarCarrito();
    animarBoton(agregar);
  });
  cuerpo.appendChild(agregar);

  tarjeta.appendChild(cuerpo);
  return tarjeta;
}

// Si hay descuento: precio original tachado + precio con descuento
function crearPrecios(producto) {
  const contenedor = crear("div", "tarjeta-precios");
  if (producto.descuento > 0) {
    contenedor.appendChild(
      crear("span", "precio-actual", formatearPrecio(precioFinal(producto))),
    );
    contenedor.appendChild(
      crear("span", "precio-original", formatearPrecio(producto.precio)),
    );
  } else {
    contenedor.appendChild(
      crear("span", "precio-actual", formatearPrecio(producto.precio)),
    );
  }
  return contenedor;
}

// Pequeño aviso en el botón cuando se agrega un producto
function animarBoton(boton) {
  boton.textContent = "Agregado ✓";
  setTimeout(function () {
    boton.textContent = "Agregar";
  }, 900);
}

// ---------- Ficha de producto ----------

function abrirFicha(producto) {
  productoEnFicha = producto;

  const imagen = porId("ficha-imagen");
  imagen.onerror = function () {
    imagen.onerror = null;
    imagen.src = IMAGEN_REEMPLAZO;
  };
  imagen.src = producto.imagen || IMAGEN_REEMPLAZO;
  imagen.alt = producto.nombre;

  porId("ficha-categoria").textContent = producto.categoria;
  porId("ficha-nombre").textContent = producto.nombre;
  porId("ficha-descripcion").textContent = producto.descripcion;

  // Solo se muestran los datos opcionales que tengan valor
  const detalles = porId("ficha-detalles");
  detalles.textContent = "";
  [
    ["Marca", producto.marca],
    ["Tono", producto.tono],
    ["Color", producto.color],
    ["Tamaño", producto.tamano],
    ["Acabado", producto.acabado],
  ].forEach(function (par) {
    if (!par[1]) return;
    const li = crear("li");
    li.appendChild(crear("strong", "", par[0] + ": "));
    li.appendChild(document.createTextNode(par[1]));
    detalles.appendChild(li);
  });

  const precio = porId("ficha-precio");
  precio.textContent = "";
  precio.appendChild(
    crear("span", "precio-actual", formatearPrecio(precioFinal(producto))),
  );
  if (producto.descuento > 0) {
    precio.appendChild(
      crear("span", "precio-original", formatearPrecio(producto.precio)),
    );
  }

  const boton = porId("ficha-agregar");
  boton.disabled = !producto.disponible;
  boton.textContent = producto.disponible ? "Agregar a mi orden" : "Agotado";

  abrirModal("modal-producto");
}

// ---------- Carrito ----------

function dibujarCarrito() {
  const resumen = calcularResumen(productos, ciudadSeleccionada);
  const contenedor = porId("carrito-items");
  contenedor.textContent = "";

  if (resumen.items.length === 0) {
    contenedor.appendChild(
      crear(
        "p",
        "carrito-vacio",
        "Tu orden está vacía. Agrega productos del catálogo.",
      ),
    );
  }

  resumen.items.forEach(function (item) {
    contenedor.appendChild(crearItemCarrito(item));
  });

  // Totales
  porId("subtotal").textContent = formatearPrecio(resumen.subtotal);
  porId("descuento").textContent =
    "-" + formatearPrecio(resumen.descuentoTotal);
  porId("domicilio").textContent = formatearPrecio(resumen.domicilio);
  porId("total").textContent = formatearPrecio(resumen.total);

  // Mensaje de ciudad: solo si ya hay productos
  porId("mensaje-ciudad").textContent =
    resumen.items.length > 0 ? resumen.mensajeCiudad : "";

  // Contador del botón "Mi orden"
  const unidades = resumen.items.reduce(function (suma, item) {
    return suma + item.cantidad;
  }, 0);
  porId("contador-carrito").textContent = unidades;

  porId("btn-whatsapp").disabled = resumen.items.length === 0;
  porId("btn-vaciar").style.display = resumen.items.length === 0 ? "none" : "";
}

function crearItemCarrito(item) {
  const fila = crear("div", "item");
  fila.appendChild(crearImagen(item.imagen, item.nombre));

  const info = crear("div");
  info.appendChild(crear("p", "item-nombre", item.nombre));
  info.appendChild(
    crear("p", "item-precio", formatearPrecio(item.precioUnitario) + " c/u"),
  );
  if (item.descuento > 0) {
    info.appendChild(
      crear("p", "item-ahorro", "Ahorras " + formatearPrecio(item.descuento)),
    );
  }

  const controles = crear("div", "item-controles");
  const menos = crear("button", "", "−");
  menos.type = "button";
  menos.setAttribute("aria-label", "Quitar una unidad");
  menos.addEventListener("click", function () {
    disminuirCantidad(item.id);
    dibujarCarrito();
  });
  const mas = crear("button", "", "+");
  mas.type = "button";
  mas.setAttribute("aria-label", "Agregar una unidad");
  mas.addEventListener("click", function () {
    aumentarCantidad(item.id);
    dibujarCarrito();
  });
  controles.appendChild(menos);
  controles.appendChild(crear("span", "", String(item.cantidad)));
  controles.appendChild(mas);
  info.appendChild(controles);
  fila.appendChild(info);

  const lado = crear("div", "item-lado");
  lado.appendChild(
    crear(
      "p",
      "item-subtotal",
      formatearPrecio(item.subtotal - item.descuento),
    ),
  );
  const quitar = crear("button", "btn-quitar", "Eliminar");
  quitar.type = "button";
  quitar.addEventListener("click", function () {
    eliminarDelCarrito(item.id);
    dibujarCarrito();
  });
  lado.appendChild(quitar);
  fila.appendChild(lado);

  return fila;
}

function abrirCarrito() {
  porId("carrito").classList.add("abierto");
  porId("carrito").setAttribute("aria-hidden", "false");
  porId("fondo-carrito").classList.add("visible");
}

function cerrarCarrito() {
  porId("carrito").classList.remove("abierto");
  porId("carrito").setAttribute("aria-hidden", "true");
  porId("fondo-carrito").classList.remove("visible");
}

// ---------- Ventanas (modales) ----------

function abrirModal(id) {
  porId(id).classList.add("visible");
  porId(id).setAttribute("aria-hidden", "false");
}

function cerrarModal(id) {
  porId(id).classList.remove("visible");
  porId(id).setAttribute("aria-hidden", "true");
}

// ---------- Enviar pedido por WhatsApp ----------

// Paso 1: validar y pedir el nombre
function pedirDatosCliente() {
  const resumen = calcularResumen(productos, ciudadSeleccionada);
  if (resumen.items.length === 0) return;

  if (!resumen.ciudadDisponible) {
    porId("mensaje-ciudad").textContent =
      "Selecciona tu ciudad de entrega para calcular el domicilio.";
    porId("ciudad-entrega").focus();
    return;
  }

  porId("error-nombre").textContent = "";
  abrirModal("modal-datos");
  porId("nombre-cliente").focus();
}

// Paso 2: con el nombre, abrir WhatsApp con el pedido
function enviarPedido() {
  const nombre = porId("nombre-cliente").value.trim();
  if (nombre === "") {
    porId("error-nombre").textContent = "Escribe tu nombre para continuar.";
    return;
  }

  const resumen = calcularResumen(productos, ciudadSeleccionada);
  if (resumen.items.length === 0 || !resumen.ciudadDisponible) {
    cerrarModal("modal-datos");
    return;
  }

  const enlace = generarEnlaceWhatsApp(resumen, {
    nombre: nombre,
    formaPago: porId("forma-pago").value,
  });

  window.open(enlace, "_blank");
  cerrarModal("modal-datos");
}

// ---------- Eventos ----------

function prepararEventos() {
  porId("buscador").addEventListener("input", function (e) {
    textoBusqueda = e.target.value;
    dibujarCatalogo();
  });

  porId("orden").addEventListener("change", function (e) {
    ordenActual = e.target.value;
    dibujarCatalogo();
  });

  porId("btn-abrir-carrito").addEventListener("click", abrirCarrito);
  porId("btn-cerrar-carrito").addEventListener("click", cerrarCarrito);
  porId("fondo-carrito").addEventListener("click", cerrarCarrito);

  porId("ciudad-entrega").addEventListener("change", function (e) {
    ciudadSeleccionada = e.target.value;
    dibujarCarrito();
  });

  porId("btn-vaciar").addEventListener("click", function () {
    if (confirm("¿Quieres vaciar tu orden?")) {
      vaciarCarrito();
      dibujarCarrito();
    }
  });

  porId("btn-whatsapp").addEventListener("click", pedirDatosCliente);
  porId("btn-enviar-datos").addEventListener("click", enviarPedido);
  porId("btn-cancelar-datos").addEventListener("click", function () {
    cerrarModal("modal-datos");
  });
  porId("nombre-cliente").addEventListener("keydown", function (e) {
    if (e.key === "Enter") enviarPedido();
  });

  // Ficha de producto
  porId("btn-cerrar-ficha").addEventListener("click", function () {
    cerrarModal("modal-producto");
  });
  porId("ficha-agregar").addEventListener("click", function () {
    if (!productoEnFicha) return;
    agregarAlCarrito(productoEnFicha.id);
    dibujarCarrito();
    cerrarModal("modal-producto");
    abrirCarrito();
  });

  // Clic fuera de una ventana = cerrarla
  ["modal-datos", "modal-producto"].forEach(function (id) {
    porId(id).addEventListener("click", function (e) {
      if (e.target === porId(id)) cerrarModal(id);
    });
  });

  // Tecla Escape cierra todo
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    cerrarModal("modal-datos");
    cerrarModal("modal-producto");
    cerrarCarrito();
  });
}

iniciar();
