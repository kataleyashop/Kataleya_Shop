// =====================================================
// KATALEYA - AJUSTES DE LA TIENDA
// =====================================================
// Este es el único archivo que se edita para cambiar el nombre,
// el número de WhatsApp, las tarifas de domicilio o las redes sociales.

const CONFIG = {
  nombreTienda: "KATALEYA",
  eslogan: "Maquillaje y belleza para ti",
  ciudadTienda: "Florencia",

  // Pega aquí el enlace CSV publicado de tu hoja de Google Sheets.
  // Mientras tenga el texto de ejemplo, la tienda usa datos/plantilla-productos.csv
  urlCatalogo: "ENLACE_CSV_PUBLICADO_DE_GOOGLE_SHEETS",

  // Número del cliente con código de país, sin "+" ni espacios. Ej: 573001234567
  whatsappNumero: "57XXXXXXXXXX",

  // Valor del domicilio por ciudad (en pesos)
  tarifasDomicilio: {
    Florencia: 12000,
    Ibagué: 10000,
    Bogotá: 10000,
    Medellín: 12000,
    Cali: 12000,
  },

  // Formas de pago que se muestran en el carrito
  formasPago: ["Pago directo", "Contraentrega"],

  // Redes sociales: déjalas vacías ('') para que no se muestren
  redes: {
    instagram: "",
    tiktok: "",
  },
};
