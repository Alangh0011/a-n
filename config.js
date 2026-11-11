/* =========================================================
   PERSONALIZA AQUÍ 💜
   Este es el único archivo que necesitas tocar.
   (app.js es el "motor"; styles.css son los colores y estilos)
   ========================================================= */
const CONFIG = {

  // Portada
  intro: {
    pre:    "para ti",
    titulo: "te morado 💜",
    sub:    "보라해 · I purple you"
  },

  // Foto del medallón. Debe estar en la misma carpeta que index.html
  // y el nombre tiene que ser EXACTO (GitHub distingue mayúsculas y .jpg de .jpeg).
  // Pon "" si no quieres foto por defecto.
  foto: "foto.jpeg",

  // Las dos personitas de palito sobre la luna (true = se ven, false = se ocultan)
  pareja: true,

  // Canción de fondo: el ID de YouTube (lo que va después de "v=")
  video: {
    id:     "Iq6RdCTLBd8",   // BTS – 'Mikrokosmos' (Special Clip @ SY in Seoul, canal oficial BANGTANTV)
    inicio: 0                // segundo en el que arranca (por si quieres saltarte una intro)
  },

  // Lo que gira alrededor de la luna
  palabras: [
    "Mi luna", "Te amo", "Te morado", "보라해", "사랑해", "Contigo",
    "Mikrokosmos", "Para siempre", "Tú y yo", "Moon", "Mi universo", "Spring Day",
    "Mi persona favorita", "Magic Shop", "Infinito", "I purple you", "Euphoria", "Siete estrellas",
    "Serendipity", "Océano morado", "영원히", "Butterfly", "Galaxia", "Stay Gold",
    "Mi todo", "Yet To Come", "Constelación", "Life Goes On", "Nosotros", "Dynamite",
    "Brillas", "Boy With Luv", "소우주", "Into the Sun", "Siempre", "SWIM",
    "Mi vida", "Epiphany", "Borahae", "Make It Right", "Cielo", "Home"
  ],

  // Las palabras de esta lista brillan en morado intenso (títulos de BTS)
  titulosBTS: [
    "Mikrokosmos", "Moon", "Spring Day", "Magic Shop", "Euphoria", "Serendipity", "Butterfly", "Stay Gold",
    "Yet To Come", "Life Goes On", "Dynamite", "Boy With Luv", "Into the Sun", "SWIM", "Epiphany",
    "Make It Right", "Home", "소우주"
  ],

  // Las 7 estrellas (forman la Osa Mayor, que también tiene 7 ✦). Cambia los mensajes por los tuyos.
  estrellas: [
    { quien: "RM",        cancion: "Wild Flower",  mensaje: "De todas las flores del mundo, yo te elegiría a ti. Una y otra vez." },
    { quien: "Jin",       cancion: "Moon",         mensaje: "Jin le cantó a la luna. Yo tengo la mía aquí conmigo: siempre vas a ser mi luna 🌙" },
    { quien: "SUGA",      cancion: "First Love",   mensaje: "Dicen que el primer amor nunca se olvida… pero tú eres el amor que elijo todos los días." },
    { quien: "j-hope",    cancion: "Daydream",     mensaje: "Eres mi sueño favorito, y lo mejor es que no tengo que dormir para verte." },
    { quien: "Jimin",     cancion: "Serendipity",  mensaje: "Conocerte fue la casualidad más bonita que me ha pasado." },
    { quien: "V",         cancion: "Slow Dancing", mensaje: "Mi plan favorito del mundo: bailar lento contigo, aunque sea en la cocina." },
    { quien: "Jung Kook", cancion: "Euphoria",     mensaje: "Tú eres mi euforia: la razón por la que sonrío sin darme cuenta." }
  ],

  // La sorpresa al encontrar las 7 estrellas
  final: {
    coreano: "보라해",
    titulo:  "te morado",
    mensaje: "Encontraste las 7 estrellas… pero la que más brilla en todo este universo eres tú.",
    porque:  "V inventó esta palabra: el morado es el último color del arcoíris, así que significa “te voy a querer y a confiar en ti por mucho, mucho tiempo”.",
    firma:   "— con todo mi amor"
  }
};