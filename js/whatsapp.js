// =====================================================
// KATALEYA - MENSAJE Y ENLACE DE WHATSAPP
// =====================================================
// No envía nada por sí solo: crea el texto y el enlace wa.me que abre WhatsApp.

// datosCliente (opcional): { nombre: 'Ana', formaPago: 'Contraentrega' }
function generarMensajeWhatsApp(resumen, datosCliente) {
  datosCliente = datosCliente || {};
  const lineas = [];

  lineas.push('PEDIDO ' + CONFIG.nombreTienda);
  lineas.push('');

  if (datosCliente.nombre) {
    lineas.push('Cliente:');
    lineas.push(datosCliente.nombre);
    lineas.push('');
  }

  lineas.push('Productos:');
  lineas.push('');
  resumen.items.forEach(function (item) {
    lineas.push(item.nombre + ' x' + item.cantidad);
    lineas.push(formatearPrecio(item.subtotal));
    lineas.push('');
  });

  lineas.push('Subtotal:');
  lineas.push(formatearPrecio(resumen.subtotal));
  lineas.push('');

  // El descuento solo se muestra si existe
  if (resumen.descuentoTotal > 0) {
    lineas.push('Descuento:');
    lineas.push('-' + formatearPrecio(resumen.descuentoTotal));
    lineas.push('');
  }

  lineas.push('Domicilio:');
  lineas.push(formatearPrecio(resumen.domicilio));
  lineas.push('');

  lineas.push('TOTAL:');
  lineas.push(formatearPrecio(resumen.total));
  lineas.push('');

  lineas.push('Ciudad:');
  lineas.push(resumen.ciudad);

  if (datosCliente.formaPago) {
    lineas.push('');
    lineas.push('Forma de pago:');
    lineas.push(datosCliente.formaPago);
  }

  return lineas.join('\n');
}

// Devuelve https://wa.me/NUMERO?text=... con el mensaje ya codificado
function generarEnlaceWhatsApp(resumen, datosCliente) {
  const mensaje = generarMensajeWhatsApp(resumen, datosCliente);
  return 'https://wa.me/' + CONFIG.whatsappNumero + '?text=' + encodeURIComponent(mensaje);
}

// Enlace para el botón flotante "Habla con una asesora" (mensaje corto, sin pedido)
function generarEnlaceAsesora() {
  const texto = 'Hola, quiero información sobre los productos de ' + CONFIG.nombreTienda;
  return 'https://wa.me/' + CONFIG.whatsappNumero + '?text=' + encodeURIComponent(texto);
}

// Solo para poder probar este archivo con Node (en el navegador se ignora)
if (typeof module !== 'undefined') {
  module.exports = { generarMensajeWhatsApp, generarEnlaceWhatsApp, generarEnlaceAsesora };
}
