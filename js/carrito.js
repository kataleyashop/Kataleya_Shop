// =====================================================
// KATALEYA - LÓGICA DEL CARRITO
// =====================================================
// El carrito se guarda en localStorage como una lista de { id, cantidad }.
// Los precios NO se guardan: siempre se toman de la hoja de Google Sheets.

const CLAVE_CARRITO = "kataleya_carrito";

// Lee el carrito guardado. Si no hay nada (o está dañado) devuelve una lista vacía.
function leerCarrito() {
  try {
    const guardado = localStorage.getItem(CLAVE_CARRITO);
    const lista = guardado ? JSON.parse(guardado) : [];
    return Array.isArray(lista) ? lista : [];
  } catch (error) {
    return [];
  }
}

function guardarCarrito(carrito) {
  try {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  } catch (error) {
    // Si el navegador no deja guardar, el carrito funciona igual mientras la página esté abierta
  }
}

// Agrega 1 unidad (o suma 1 si el producto ya estaba)
function agregarAlCarrito(productoId) {
  const carrito = leerCarrito();
  const existente = carrito.find(function (item) {
    return item.id === productoId;
  });
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ id: productoId, cantidad: 1 });
  }
  guardarCarrito(carrito);
}

function aumentarCantidad(productoId) {
  agregarAlCarrito(productoId);
}

// Resta 1; si llega a 0 el producto se elimina
function disminuirCantidad(productoId) {
  const carrito = leerCarrito();
  const existente = carrito.find(function (item) {
    return item.id === productoId;
  });
  if (!existente) return;
  existente.cantidad -= 1;
  guardarCarrito(
    carrito.filter(function (item) {
      return item.cantidad > 0;
    }),
  );
}

function eliminarDelCarrito(productoId) {
  const carrito = leerCarrito().filter(function (item) {
    return item.id !== productoId;
  });
  guardarCarrito(carrito);
}

function vaciarCarrito() {
  guardarCarrito([]);
}

// Cantidad total de unidades (para el numerito del botón "Mi orden")
function contarUnidades() {
  return leerCarrito().reduce(function (suma, item) {
    return suma + item.cantidad;
  }, 0);
}

// Convierte 40000 en "$40.000"
function formatearPrecio(numero) {
  return "$" + Math.round(numero).toLocaleString("es-CO");
}

// Calcula todo el resumen del pedido.
// productos = lista completa que viene de la hoja; ciudadEntrega = texto de la ciudad
function calcularResumen(productos, ciudadEntrega) {
  const items = [];

  leerCarrito().forEach(function (itemCarrito) {
    const producto = productos.find(function (p) {
      return p.id === itemCarrito.id;
    });
    // Si el producto ya no existe o está agotado, no se cuenta
    if (!producto || !producto.disponible) return;

    const subtotal = producto.precio * itemCarrito.cantidad;
    const descuento = Math.round((subtotal * producto.descuento) / 100);

    items.push({
      id: producto.id,
      nombre: producto.nombre,
      imagen: producto.imagen,
      precioUnitario: producto.precio,
      cantidad: itemCarrito.cantidad,
      descuentoPorcentaje: producto.descuento,
      subtotal: subtotal, // antes del descuento
      descuento: descuento, // valor descontado en pesos
    });
  });

  const subtotal = items.reduce(function (suma, item) {
    return suma + item.subtotal;
  }, 0);
  const descuentoTotal = items.reduce(function (suma, item) {
    return suma + item.descuento;
  }, 0);

  // Domicilio: solo si hay productos y la ciudad está en las tarifas
  const ciudadDisponible = Object.prototype.hasOwnProperty.call(
    CONFIG.tarifasDomicilio,
    ciudadEntrega,
  );
  const domicilio =
    ciudadDisponible && items.length > 0
      ? CONFIG.tarifasDomicilio[ciudadEntrega]
      : 0;

  return {
    items: items,
    subtotal: subtotal,
    descuentoTotal: descuentoTotal,
    domicilio: domicilio,
    total: subtotal - descuentoTotal + domicilio,
    ciudad: ciudadEntrega,
    ciudadDisponible: ciudadDisponible,
    mensajeCiudad: ciudadDisponible
      ? ""
      : "Ciudad no disponible para cálculo automático de domicilio.",
  };
}

// Solo para poder probar este archivo con Node (en el navegador se ignora)
if (typeof module !== "undefined") {
  module.exports = {
    agregarAlCarrito,
    aumentarCantidad,
    disminuirCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
    contarUnidades,
    formatearPrecio,
    calcularResumen,
    leerCarrito,
  };
}
