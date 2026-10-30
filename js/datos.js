// =====================================================
// KATALEYA - FASE 1: leer los productos desde Google Sheets
// =====================================================
// La hoja de Google Sheets se publica como CSV (texto separado por comas).
// Este archivo descarga ese CSV y lo convierte en una lista de productos.

// Convierte el texto CSV en una lista de filas (cada fila = lista de celdas).
// Maneja celdas entre comillas que contienen comas, ej: "Labial, mate"
function leerCSV(texto) {
  const filas = [];
  let fila = [];
  let celda = "";
  let dentroDeComillas = false;

  for (let i = 0; i < texto.length; i++) {
    const letra = texto[i];

    if (dentroDeComillas) {
      if (letra === '"' && texto[i + 1] === '"') {
        celda += '"'; // dos comillas seguidas = una comilla de texto
        i++;
      } else if (letra === '"') {
        dentroDeComillas = false;
      } else {
        celda += letra;
      }
    } else if (letra === '"') {
      dentroDeComillas = true;
    } else if (letra === ",") {
      fila.push(celda);
      celda = "";
    } else if (letra === "\n" || letra === "\r") {
      if (letra === "\r" && texto[i + 1] === "\n") i++;
      fila.push(celda);
      filas.push(fila);
      fila = [];
      celda = "";
    } else {
      celda += letra;
    }
  }

  // Guardar la última fila si el texto no termina en salto de línea
  if (celda !== "" || fila.length > 0) {
    fila.push(celda);
    filas.push(fila);
  }

  return filas;
}

// Convierte el texto CSV en una lista de productos listos para usar.
function convertirAProductos(textoCSV) {
  const filas = leerCSV(textoCSV);
  const encabezados = filas[0].map(function (e) {
    return e.trim().toLowerCase();
  });
  const productos = [];

  for (let i = 1; i < filas.length; i++) {
    const fila = filas[i];

    // Ignorar filas completamente vacías
    if (
      fila.every(function (celda) {
        return celda.trim() === "";
      })
    )
      continue;

    // Unir encabezado + valor: { nombre: 'Labial', precio: '20000', ... }
    const datos = {};
    encabezados.forEach(function (encabezado, posicion) {
      datos[encabezado] = (fila[posicion] || "").trim();
    });

    // Quitar puntos y símbolos del precio: "$25.000" -> 25000
    const precio = Number(datos.precio.replace(/[^0-9]/g, ""));
    const descuento = Number(datos.descuento.replace(/[^0-9.]/g, "")) || 0;
    const estado = (datos.estado || "activo").toLowerCase();

    // Saltar productos sin nombre, con precio inválido u ocultos
    if (datos.nombre === "" || precio <= 0 || estado === "oculto") continue;

    productos.push({
      id: Number(datos.id) || i,
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      categoria: datos.categoria || "Otros",
      precio: precio,
      descuento: Math.min(descuento, 100), // porcentaje de 0 a 100
      imagen: datos.imagen,
      disponible: estado !== "agotado", // "agotado" se muestra pero no se compra
      // Campos opcionales: quedan vacíos ('') si no se llenaron
      marca: datos.marca,
      tono: datos.tono,
      color: datos.color,
      tamano: datos.tamano,
      acabado: datos.acabado,
    });
  }

  return productos;
}

// Obtiene la lista de categorías sin repetir, a partir de los productos.
// Para agregar una categoría nueva basta con escribirla en la hoja.
function obtenerCategorias(productos) {
  const categorias = [];
  productos.forEach(function (producto) {
    if (!categorias.includes(producto.categoria)) {
      categorias.push(producto.categoria);
    }
  });
  return categorias;
}

// Descarga el CSV desde la dirección publicada de Google Sheets.
async function cargarProductos(urlCSV) {
  const respuesta = await fetch(urlCSV);
  if (!respuesta.ok) {
    throw new Error("No se pudo cargar el catálogo");
  }
  const texto = await respuesta.text();
  return convertirAProductos(texto);
}

// Solo para poder probar este archivo con Node (en el navegador se ignora)
if (typeof module !== "undefined") {
  module.exports = {
    leerCSV,
    convertirAProductos,
    obtenerCategorias,
    cargarProductos,
  };
}
