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
  urlCatalogo:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTAjOkaOJVdaRl3SBEMMTvNeSWKbZzefFpFUAeIKaujDh_ypDZm86j5IYQf_D3cxnQr1GwpGX9yeZ7p/pub?output=csv",

  // Número del cliente con código de país, sin "+" ni espacios. Ej: 573001234567
  whatsappNumero: "573150570399",

  // Valor del domicilio por ciudad (en pesos)
  tarifasDomicilio: {
    Lapaz: 4000,
    Eltiburon: 10000,
    ciudadela: 10000,
    triangulo: 12000,
    centro: 12000,
  },

  // Formas de pago que se muestran en el carrito
  formasPago: ["Contraentrega", "Nequi", "Daviplata"],

  // Redes sociales: déjalas vacías ('') para que no se muestren
  redes: {
    instagram: "",
    tiktok: "",
  },
};
