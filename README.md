# KATALEYA – Guía para desarrollar el frontend

Tienda online de maquillaje y belleza. Es una **página estática**: no tiene servidor ni base de datos.

- Los productos los administra el cliente en una **hoja de Google Sheets**.
- El carrito se guarda en el navegador del comprador.
- El pedido se envía al cliente por **WhatsApp**.

Este README explica cómo construir el frontend (HTML, CSS y JavaScript) usando los archivos de lógica del proyecto.

> **Estado actual**
> - ✅ `js/datos.js`, `js/config.js`, `js/carrito.js`, `js/whatsapp.js`: terminados y probados.
> - ✅ `index.html`, `css/estilos.css` y `js/app.js`: frontend terminado (diseño inspirado en la estructura de TDA Store).
> - Pendiente: pegar el enlace CSV de tu Google Sheets y tu número de WhatsApp en `js/config.js`, y agregar las fotos en `img/`.

---

## 1. Estructura del proyecto

```
kataleya-tienda/
├── index.html              ← lo creas tú (frontend)
├── css/
│   └── estilos.css         ← lo creas tú
├── img/                    ← fotos de los productos
├── datos/
│   └── plantilla-productos.csv   ← hoja modelo para Google Sheets
├── js/
│   ├── datos.js            ← lee el catálogo desde Google Sheets
│   ├── config.js           ← ajustes de la tienda (Fase 2)
│   ├── carrito.js          ← lógica del carrito y los totales (Fase 3)
│   ├── whatsapp.js         ← mensaje y enlace de WhatsApp (Fase 4)
│   └── app.js              ← lo creas tú: conecta todo con el HTML
└── prueba-fase1.html       ← página de prueba, se puede borrar al final
```

Tú te encargas de `index.html`, `css/estilos.css` y `js/app.js`. Los demás archivos ya traen la lógica.

## 2. Cómo se conectan los archivos

En `index.html`, carga los scripts **en este orden** (antes de `app.js`):

```html
<script src="js/config.js"></script>
<script src="js/datos.js"></script>
<script src="js/carrito.js"></script>
<script src="js/whatsapp.js"></script>
<script src="js/app.js"></script>
```

Flujo general:

1. `app.js` llama a `cargarProductos(CONFIG.urlCatalogo)` y recibe la lista de productos.
2. Dibuja el catálogo, el buscador y las categorías.
3. Cada botón del catálogo y del carrito llama a una función de `carrito.js`.
4. Después de cada cambio, `app.js` pide el resumen con `calcularResumen(...)` y redibuja el carrito lateral.
5. El botón de WhatsApp abre el enlace que genera `whatsapp.js`.

## 3. Estructura visual sugerida

Las zonas que debe tener la página:

- **Encabezado**: nombre de la tienda y buscador.
- **Categorías**: botones o filtro, con la opción "Todas".
- **Catálogo**: tarjetas de producto (imagen, nombre, marca, precio, descuento, botón "Agregar").
- **Carrito lateral**: productos, botones `+` y `−`, eliminar, ciudad de entrega, subtotal, descuento, domicilio, total y botón **"Enviar pedido por WhatsApp"**.

Sugerencia de ids para el HTML (puedes cambiarlos, pero entonces ajusta `app.js`):

```html
<input id="buscador" type="text" placeholder="Buscar productos...">
<div id="categorias"></div>
<div id="catalogo"></div>

<aside id="carrito">
  <div id="carrito-items"></div>
  <select id="ciudad-entrega"></select>
  <p id="mensaje-ciudad"></p>
  <p>Subtotal: <span id="subtotal"></span></p>
  <p>Descuento: <span id="descuento"></span></p>
  <p>Domicilio: <span id="domicilio"></span></p>
  <p>Total: <span id="total"></span></p>
  <button id="btn-whatsapp">Enviar pedido por WhatsApp</button>
</aside>
```

## 4. El producto (lo que entrega `datos.js`)

`cargarProductos(url)` devuelve una lista de objetos como este:

```js
{
  id: 1,
  nombre: 'Labial Mate Rojo',
  descripcion: 'Labial de larga duración, no se corre',
  categoria: 'Labiales',
  precio: 20000,          // número, sin símbolos
  descuento: 0,           // porcentaje de 0 a 100
  imagen: 'img/labial-mate-rojo.jpg',
  disponible: true,       // false = agotado (mostrar, pero no permitir comprar)
  // Opcionales: si no se llenaron en la hoja, vienen como '' (texto vacío)
  marca: 'Marca X',
  tono: 'Rojo pasión',
  color: 'Rojo',
  tamano: '3.5 g',
  acabado: 'Mate'
}
```

Reglas que debes respetar al dibujar:

- Los productos con estado `oculto` en la hoja **ya vienen filtrados**; no hace falta hacer nada.
- Si `disponible` es `false`, muestra "Agotado" y desactiva el botón de agregar.
- Los campos opcionales pueden estar vacíos: **muestra solo los que tengan valor**.
- Si `descuento` es mayor que 0, muestra el precio original tachado y el precio con descuento.
- Si la imagen no carga, usa una imagen de reemplazo (`onerror`).

Funciones de `datos.js`:

| Función | Qué hace |
|---|---|
| `cargarProductos(url)` | Descarga la hoja y devuelve la lista de productos (es asíncrona, usa `await` o `.then`). |
| `obtenerCategorias(productos)` | Devuelve la lista de categorías sin repetir, para armar los botones. |

## 5. Ajustes de la tienda: `config.js` (Fase 2)

```js
const CONFIG = {
  nombreTienda: 'KATALEYA',
  urlCatalogo: 'ENLACE_CSV_PUBLICADO_DE_GOOGLE_SHEETS',
  whatsappNumero: '57XXXXXXXXXX',   // con código de país, sin "+" ni espacios
  tarifasDomicilio: {
    'Ibagué': 6000,
    'Bogotá': 10000,
    'Medellín': 12000,
    'Cali': 12000
  }
};
```

- Para llenar el selector de ciudades usa `Object.keys(CONFIG.tarifasDomicilio)`.
- Para cambiar el nombre de la tienda, el número o las tarifas solo se edita este archivo.

## 6. Carrito: `carrito.js` (Fase 3)

El carrito se guarda en `localStorage`, así que no se pierde al recargar. Solo guarda `id` y `cantidad`; los precios siempre se toman de la hoja.

| Función | Qué hace |
|---|---|
| `agregarAlCarrito(productoId)` | Agrega 1 unidad (o suma 1 si ya estaba). |
| `aumentarCantidad(productoId)` | Suma 1 a la cantidad. |
| `disminuirCantidad(productoId)` | Resta 1; si llega a 0, elimina el producto. |
| `eliminarDelCarrito(productoId)` | Quita el producto del carrito. |
| `vaciarCarrito()` | Deja el carrito vacío. |
| `calcularResumen(productos, ciudadEntrega)` | Devuelve el resumen completo (ver abajo). |
| `formatearPrecio(numero)` | Convierte `40000` en texto de precio, por ejemplo `$40.000`. |

### Qué devuelve `calcularResumen`

```js
{
  items: [
    {
      id: 1,
      nombre: 'Labial Mate Rojo',
      precioUnitario: 20000,
      cantidad: 2,
      descuentoPorcentaje: 0,
      subtotal: 40000,        // precio × cantidad, antes del descuento
      descuento: 0            // valor descontado en pesos
    }
  ],
  subtotal: 55000,
  descuentoTotal: 5000,
  domicilio: 8000,
  total: 58000,
  ciudad: 'Ibagué',
  ciudadDisponible: true,
  mensajeCiudad: ''
}
```

Cómo se calcula:

- `subtotal` = suma de (precio × cantidad) de cada producto.
- `descuentoTotal` = suma del descuento de cada producto (su porcentaje de la hoja).
- `domicilio` = tarifa de la ciudad en `CONFIG.tarifasDomicilio`.
- `total` = `subtotal` − `descuentoTotal` + `domicilio`.

Si la ciudad no está configurada o no se eligió, `ciudadDisponible` es `false`, `domicilio` es `0` y `mensajeCiudad` trae el texto: *"Ciudad no disponible para cálculo automático de domicilio."* Muéstralo en `#mensaje-ciudad`.

## 7. WhatsApp: `whatsapp.js` (Fase 4)

| Función | Qué hace |
|---|---|
| `generarMensajeWhatsApp(resumen)` | Devuelve el texto del pedido. |
| `generarEnlaceWhatsApp(resumen)` | Devuelve el enlace `https://wa.me/NUMERO?text=...` ya codificado. |

Ejemplo del mensaje:

```
PEDIDO KATALEYA

Productos:

Labial Mate Rojo x2
$40.000

Brillo Labial Transparente x1
$15.000

Subtotal:
$55.000

Descuento:
-$5.000

Domicilio:
$8.000

TOTAL:
$58.000

Ciudad:
Ibagué
```

Uso en el botón:

```js
document.getElementById('btn-whatsapp').addEventListener('click', function () {
  const resumen = calcularResumen(productos, ciudadSeleccionada);
  if (resumen.items.length === 0) return;   // carrito vacío: no hacer nada
  window.open(generarEnlaceWhatsApp(resumen), '_blank');
});
```

## 8. Esqueleto de `app.js`

Solo es una guía de cómo conectar las piezas; el diseño y los detalles son tuyos.

```js
let productos = [];              // lista completa de productos
let categoriaActual = 'Todas';   // filtro de categoría
let textoBusqueda = '';          // texto del buscador
let ciudadSeleccionada = '';

async function iniciar() {
  try {
    productos = await cargarProductos(CONFIG.urlCatalogo);
  } catch (error) {
    document.getElementById('catalogo').textContent =
      'No se pudo cargar el catálogo. Intenta de nuevo más tarde.';
    return;
  }
  dibujarCategorias();
  dibujarCatalogo();
  dibujarCarrito();
}

function productosFiltrados() {
  return productos.filter(function (p) {
    const coincideCategoria = categoriaActual === 'Todas' || p.categoria === categoriaActual;
    const texto = (p.nombre + ' ' + p.marca).toLowerCase();
    return coincideCategoria && texto.includes(textoBusqueda.toLowerCase());
  });
}

function dibujarCarrito() {
  const resumen = calcularResumen(productos, ciudadSeleccionada);
  // 1. Dibujar resumen.items con botones + − y eliminar
  // 2. Mostrar resumen.subtotal, descuentoTotal, domicilio y total con formatearPrecio()
  // 3. Mostrar resumen.mensajeCiudad si la ciudad no está disponible
}

iniciar();
```

Cada vez que el comprador agregue, aumente, disminuya o elimine un producto, o cambie de ciudad, llama otra vez a `dibujarCarrito()`.

## 9. Buenas prácticas

- Para escribir datos de la hoja en la página usa `textContent` en lugar de `innerHTML`; así un texto raro en la hoja no rompe la página.
- Diseña primero para celular: la mayoría de los compradores entrará desde el teléfono.
- En pantallas pequeñas, el carrito lateral puede convertirse en un panel que se abre con un botón.
- Los cambios en la hoja de Google Sheets pueden tardar unos minutos en verse en la tienda.

## 10. Cómo probar mientras desarrollas

1. Abre la carpeta del proyecto en VS Code e instala la extensión **Live Server**.
2. Clic derecho en `index.html` → *Open with Live Server*.
3. Abre las herramientas del navegador (F12) y revisa la pestaña *Consola* por si hay errores.

## 11. Publicarla gratis

Al ser estática se puede subir a un hosting estático gratuito, como GitHub Pages, Cloudflare Pages o Netlify. Antes de entregársela al cliente, revisa los límites actuales de ese servicio. La guía de publicación paso a paso se agregará en la última fase.
