/* Innovating Kids — Computación básica: hardware.
   6 niveles con un compañero (perrito, gatito, pirata, ninja o vikinga), sonidos y estrellas.
   Sin librerías. Se juega tocando o con el teclado. El avance se guarda en el navegador y,
   si el alumno entró al portal, también en su cuenta (js/progreso.js). */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var app = $('hw-app');
  if (!app) return;
  var sfx = function (n) { if (window.IKAudio) window.IKAudio.play(n); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  if (window.IKAudio) window.IKAudio.setTheme('hardware');

  // ---------- Dibujos de las piezas (SVG originales) ----------
  var SVG = {
    monitor: '<rect x="6" y="8" width="52" height="34" rx="4" fill="#263238"/><rect x="10" y="12" width="44" height="26" rx="2" fill="#4FC3F7"/><path d="M14 32l9-9 7 7 6-5 8 7" stroke="#fff" stroke-width="3" fill="none" stroke-linejoin="round"/><circle cx="44" cy="19" r="3" fill="#FFD23F"/><rect x="28" y="42" width="8" height="8" fill="#455A64"/><rect x="18" y="50" width="28" height="5" rx="2" fill="#37474F"/>',
    teclado: '<rect x="4" y="20" width="56" height="26" rx="4" fill="#37474F"/><g fill="#ECEFF1"><rect x="8" y="24" width="6" height="5" rx="1"/><rect x="16" y="24" width="6" height="5" rx="1"/><rect x="24" y="24" width="6" height="5" rx="1"/><rect x="32" y="24" width="6" height="5" rx="1"/><rect x="40" y="24" width="6" height="5" rx="1"/><rect x="48" y="24" width="8" height="5" rx="1"/><rect x="8" y="31" width="8" height="5" rx="1"/><rect x="18" y="31" width="6" height="5" rx="1"/><rect x="26" y="31" width="6" height="5" rx="1"/><rect x="34" y="31" width="6" height="5" rx="1"/><rect x="42" y="31" width="14" height="5" rx="1"/><rect x="16" y="38" width="32" height="5" rx="1"/></g>',
    mouse: '<path d="M32 10c-10 0-16 8-16 18v12c0 10 7 16 16 16s16-6 16-16V28c0-10-6-18-16-18z" fill="#ECEFF1" stroke="#455A64" stroke-width="3"/><path d="M32 10v16M16 27h32" stroke="#455A64" stroke-width="3"/><rect x="30" y="15" width="4" height="8" rx="2" fill="#E53935"/>',
    gabinete: '<rect x="16" y="4" width="32" height="56" rx="4" fill="#37474F"/><rect x="20" y="9" width="24" height="5" rx="1" fill="#546E7A"/><rect x="20" y="17" width="24" height="5" rx="1" fill="#546E7A"/><circle cx="32" cy="34" r="6" fill="#263238" stroke="#4FC3F7" stroke-width="2"/><path d="M32 30v4" stroke="#4FC3F7" stroke-width="2"/><g fill="#263238"><circle cx="24" cy="48" r="1.5"/><circle cx="29" cy="48" r="1.5"/><circle cx="35" cy="48" r="1.5"/><circle cx="40" cy="48" r="1.5"/><circle cx="24" cy="53" r="1.5"/><circle cx="29" cy="53" r="1.5"/><circle cx="35" cy="53" r="1.5"/><circle cx="40" cy="53" r="1.5"/></g>',
    bocinas: '<rect x="6" y="12" width="20" height="40" rx="4" fill="#5D4037"/><circle cx="16" cy="22" r="5" fill="#212121"/><circle cx="16" cy="39" r="8" fill="#212121"/><circle cx="16" cy="39" r="3" fill="#757575"/><rect x="38" y="12" width="20" height="40" rx="4" fill="#5D4037"/><circle cx="48" cy="22" r="5" fill="#212121"/><circle cx="48" cy="39" r="8" fill="#212121"/><circle cx="48" cy="39" r="3" fill="#757575"/><path d="M29 26c2 3 2 9 0 12M33 22c4 5 4 15 0 20" stroke="#FFD23F" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
    impresora: '<rect x="16" y="6" width="32" height="16" fill="#FFFFFF" stroke="#90A4AE" stroke-width="2"/><rect x="6" y="20" width="52" height="24" rx="4" fill="#546E7A"/><circle cx="50" cy="28" r="2.5" fill="#66BB6A"/><rect x="14" y="38" width="36" height="20" fill="#FFFFFF" stroke="#90A4AE" stroke-width="2"/><path d="M19 45h26M19 51h18" stroke="#4FC3F7" stroke-width="3"/>',
    microfono: '<rect x="24" y="6" width="16" height="30" rx="8" fill="#78909C"/><path d="M26 14h12M26 20h12M26 26h12" stroke="#B0BEC5" stroke-width="2"/><path d="M18 28c0 9 6 14 14 14s14-5 14-14" stroke="#455A64" stroke-width="3" fill="none"/><path d="M32 42v10M22 56h20" stroke="#455A64" stroke-width="4" stroke-linecap="round"/>',
    camara: '<rect x="14" y="10" width="36" height="30" rx="15" fill="#37474F"/><circle cx="32" cy="25" r="10" fill="#212121"/><circle cx="32" cy="25" r="5" fill="#1E88E5"/><circle cx="34" cy="23" r="2" fill="#fff"/><circle cx="44" cy="16" r="2" fill="#E53935"/><path d="M26 40l-6 14h24l-6-14" fill="#546E7A"/>',
    audifonos: '<path d="M12 38v-6a20 20 0 0 1 40 0v6" stroke="#455A64" stroke-width="5" fill="none"/><rect x="8" y="34" width="12" height="20" rx="5" fill="#E53935"/><rect x="44" y="34" width="12" height="20" rx="5" fill="#E53935"/>',
    ram: '<rect x="4" y="18" width="56" height="20" rx="2" fill="#2E7D32"/><g fill="#212121"><rect x="9" y="22" width="8" height="10"/><rect x="21" y="22" width="8" height="10"/><rect x="35" y="22" width="8" height="10"/><rect x="47" y="22" width="8" height="10"/></g><g fill="#FFD23F"><rect x="6" y="38" width="3" height="6"/><rect x="11" y="38" width="3" height="6"/><rect x="16" y="38" width="3" height="6"/><rect x="21" y="38" width="3" height="6"/><rect x="26" y="38" width="3" height="6"/><rect x="35" y="38" width="3" height="6"/><rect x="40" y="38" width="3" height="6"/><rect x="45" y="38" width="3" height="6"/><rect x="50" y="38" width="3" height="6"/><rect x="55" y="38" width="3" height="6"/></g>',
    disco: '<rect x="10" y="8" width="44" height="48" rx="4" fill="#90A4AE"/><circle cx="32" cy="28" r="14" fill="#CFD8DC"/><circle cx="32" cy="28" r="3" fill="#546E7A"/><path d="M32 28l14 16" stroke="#37474F" stroke-width="3" stroke-linecap="round"/><rect x="14" y="48" width="12" height="4" fill="#546E7A"/>',
    madre: '<rect x="4" y="4" width="56" height="56" rx="3" fill="#1B5E20"/><rect x="12" y="10" width="16" height="16" fill="#9E9E9E"/><rect x="34" y="10" width="4" height="20" fill="#212121"/><rect x="41" y="10" width="4" height="20" fill="#212121"/><rect x="10" y="36" width="40" height="5" fill="#212121"/><rect x="10" y="46" width="30" height="5" fill="#212121"/><path d="M28 18h6M20 26v10M45 30v6" stroke="#FFD23F" stroke-width="1.5"/><circle cx="52" cy="52" r="3" fill="#FFD23F"/>',
    cpu: '<g stroke="#FFD23F" stroke-width="3"><path d="M20 6v8M28 6v8M36 6v8M44 6v8M20 50v8M28 50v8M36 50v8M44 50v8M6 20h8M6 28h8M6 36h8M6 44h8M50 20h8M50 28h8M50 36h8M50 44h8"/></g><rect x="14" y="14" width="36" height="36" rx="3" fill="#455A64"/><rect x="20" y="20" width="24" height="24" rx="2" fill="#B0BEC5"/><text x="32" y="37" font-size="11" font-weight="700" text-anchor="middle" fill="#263238" font-family="sans-serif">CPU</text>',
    fuente: '<rect x="6" y="14" width="52" height="38" rx="3" fill="#424242"/><circle cx="24" cy="33" r="13" fill="#212121"/><path d="M24 20v26M11 33h26M15 24l18 18M33 24L15 42" stroke="#616161" stroke-width="2"/><path d="M48 22l-5 10h6l-5 10" stroke="#FFD23F" stroke-width="3" fill="none" stroke-linejoin="round"/>',
    gpu: '<rect x="4" y="16" width="56" height="26" rx="3" fill="#263238"/><circle cx="20" cy="29" r="9" fill="#37474F" stroke="#E53935" stroke-width="2"/><circle cx="44" cy="29" r="9" fill="#37474F" stroke="#E53935" stroke-width="2"/><path d="M20 21v16M12 29h16M44 21v16M36 29h16" stroke="#90A4AE" stroke-width="2"/><g fill="#FFD23F"><rect x="10" y="42" width="3" height="6"/><rect x="15" y="42" width="3" height="6"/><rect x="20" y="42" width="3" height="6"/><rect x="25" y="42" width="3" height="6"/><rect x="30" y="42" width="3" height="6"/><rect x="35" y="42" width="3" height="6"/></g>',
    navegador: '<circle cx="32" cy="32" r="24" fill="#1E88E5"/><path d="M8 32h48M32 8c-8 8-8 40 0 48M32 8c8 8 8 40 0 48M13 20h38M13 44h38" stroke="#fff" stroke-width="2.5" fill="none"/>',
    videojuego: '<path d="M16 22h32c7 0 12 7 12 16 0 8-4 12-8 12-5 0-7-6-12-6H24c-5 0-7 6-12 6-4 0-8-4-8-12 0-9 5-16 12-16z" fill="#7E57C2"/><path d="M18 30v10M13 35h10" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="44" cy="31" r="3" fill="#FFD23F"/><circle cx="50" cy="37" r="3" fill="#E53935"/>',
    sistema: '<rect x="6" y="10" width="52" height="40" rx="4" fill="#ECEFF1" stroke="#455A64" stroke-width="2"/><rect x="6" y="10" width="52" height="8" rx="4" fill="#455A64"/><rect x="12" y="24" width="18" height="10" rx="1" fill="#4FC3F7"/><rect x="34" y="24" width="18" height="10" rx="1" fill="#66BB6A"/><rect x="12" y="37" width="18" height="8" rx="1" fill="#FFD23F"/><rect x="34" y="37" width="18" height="8" rx="1" fill="#EF5350"/><rect x="6" y="50" width="52" height="5" fill="#263238"/>',
    dibujo: '<path d="M32 8C18 8 8 18 8 30c0 10 8 14 14 12 4-1 6 2 5 6-1 5 2 8 7 8 14 0 22-12 22-26S46 8 32 8z" fill="#FFE0B2" stroke="#8D6E63" stroke-width="2"/><circle cx="20" cy="26" r="4" fill="#E53935"/><circle cx="30" cy="18" r="4" fill="#FFD23F"/><circle cx="42" cy="20" r="4" fill="#43A047"/><circle cx="46" cy="32" r="4" fill="#1E88E5"/>'
  };
  var SVG2 = {
    usb: '<rect x="8" y="18" width="48" height="28" rx="4" fill="#90A4AE"/><rect x="14" y="24" width="36" height="16" rx="2" fill="#263238"/><rect x="18" y="27" width="28" height="6" fill="#1E88E5"/><path d="M26 54V44M32 56V44M38 54V44" stroke="#455A64" stroke-width="3"/><circle cx="32" cy="10" r="4" fill="#455A64"/><path d="M32 14v4M26 8l6-4 6 4" stroke="#455A64" stroke-width="2.5" fill="none"/>',
    hdmi: '<path d="M8 20h48v14l-8 10H16L8 34z" fill="#90A4AE"/><path d="M14 25h36v8l-5 6H19l-5-6z" fill="#263238"/><g fill="#FFD23F"><rect x="20" y="28" width="2" height="5"/><rect x="25" y="28" width="2" height="5"/><rect x="30" y="28" width="2" height="5"/><rect x="35" y="28" width="2" height="5"/><rect x="40" y="28" width="2" height="5"/></g><text x="32" y="58" font-size="10" font-weight="700" text-anchor="middle" fill="#ECEFF1" font-family="sans-serif">HDMI</text>',
    jack: '<circle cx="32" cy="28" r="18" fill="#90A4AE"/><circle cx="32" cy="28" r="9" fill="#263238"/><circle cx="32" cy="28" r="4" fill="#4CAF50"/><path d="M20 52c4-4 8-4 12 0s8 4 12 0" stroke="#4CAF50" stroke-width="3" fill="none" stroke-linecap="round"/>',
    ethernet: '<rect x="12" y="12" width="40" height="36" rx="3" fill="#90A4AE"/><path d="M18 18h28v20h-8v5H26v-5h-8z" fill="#263238"/><g fill="#FFD23F"><rect x="21" y="20" width="2" height="6"/><rect x="25" y="20" width="2" height="6"/><rect x="29" y="20" width="2" height="6"/><rect x="33" y="20" width="2" height="6"/><rect x="37" y="20" width="2" height="6"/><rect x="41" y="20" width="2" height="6"/></g><path d="M32 48v10" stroke="#1E88E5" stroke-width="5"/>',
    corriente: '<rect x="18" y="6" width="28" height="30" rx="6" fill="#455A64"/><path d="M26 36v10M38 36v10" stroke="#B0BEC5" stroke-width="5" stroke-linecap="round"/><path d="M34 12l-8 12h7l-4 9 10-13h-7l4-8z" fill="#FFD23F"/><path d="M32 46c0 8 4 12 10 12" stroke="#263238" stroke-width="4" fill="none"/>',
    wifi: '<path d="M8 26a34 34 0 0 1 48 0M16 34a22 22 0 0 1 32 0M24 42a10 10 0 0 1 16 0" stroke="#1E88E5" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="32" cy="50" r="4" fill="#1E88E5"/>',
    bluetooth: '<rect x="14" y="6" width="36" height="52" rx="18" fill="#1E88E5"/><path d="M24 22l16 16-8 8V18l8 8-16 16" stroke="#fff" stroke-width="3.5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>',
    candado: '<path d="M20 28v-8a12 12 0 0 1 24 0v8" stroke="#546E7A" stroke-width="5" fill="none"/><rect x="12" y="28" width="40" height="28" rx="5" fill="#FFB300"/><circle cx="32" cy="40" r="4" fill="#5D4037"/><rect x="30" y="42" width="4" height="8" fill="#5D4037"/>',
    escudo: '<path d="M32 6l20 8v14c0 14-9 24-20 30C21 52 12 42 12 28V14z" fill="#43A047"/><path d="M23 32l6 6 12-13" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    chat: '<path d="M8 12h40a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H24l-12 10v-10H8a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6z" fill="#7E57C2"/><text x="28" y="36" font-size="22" font-weight="900" text-anchor="middle" fill="#fff" font-family="sans-serif">!</text>',
    carpeta: '<path d="M6 16h20l6 6h26v30a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" fill="#FFB300"/><path d="M6 26h52v26a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" fill="#FFCA28"/>',
    usbmem: '<rect x="22" y="4" width="20" height="14" fill="#B0BEC5"/><rect x="27" y="8" width="4" height="4" fill="#455A64"/><rect x="33" y="8" width="4" height="4" fill="#455A64"/><rect x="16" y="18" width="32" height="40" rx="6" fill="#E53935"/><rect x="24" y="28" width="16" height="4" rx="2" fill="#fff"/>',
    sd: '<path d="M16 6h24l10 10v40a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" fill="#1E88E5"/><g fill="#FFD23F"><rect x="20" y="10" width="3" height="8"/><rect x="26" y="10" width="3" height="8"/><rect x="32" y="10" width="3" height="8"/><rect x="38" y="12" width="3" height="6"/></g><text x="32" y="44" font-size="14" font-weight="900" text-anchor="middle" fill="#fff" font-family="sans-serif">SD</text>',
    nube: '<path d="M18 46a12 12 0 0 1 0-24 16 16 0 0 1 30 2 11 11 0 0 1-2 22z" fill="#90CAF9"/><path d="M32 30v14M26 38l6 6 6-6" stroke="#0D47A1" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
  };
  Object.keys(SVG2).forEach(function (k) { SVG[k] = SVG2[k]; });
  var FILE_COLORS = { jpg: '#43A047', png: '#43A047', mp3: '#8E24AA', mp4: '#E53935', docx: '#1E88E5', pdf: '#D32F2F' };
  function fileSvg(ext) {
    var c = FILE_COLORS[ext] || '#546E7A';
    return '<path d="M14 4h26l12 12v42a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#ECEFF1" stroke="#90A4AE" stroke-width="2"/><path d="M40 4v12h12" fill="#CFD8DC"/>' +
      '<rect x="8" y="34" width="40" height="16" rx="3" fill="' + c + '"/><text x="28" y="46" font-size="11" font-weight="900" text-anchor="middle" fill="#fff" font-family="sans-serif">.' + ext.toUpperCase() + '</text>';
  }
  function icon(name, label) {
    var body = name && name.indexOf('file:') === 0 ? fileSvg(name.slice(5)) : (SVG[name] || '');
    return '<svg viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="' + esc(label || name) + '">' + body + '</svg>';
  }
  function hasIcon(name) { return !!name && (name.indexOf('file:') === 0 || !!SVG[name]); }
  // Tarjeta grande: dibujo (si hay) y nombre
  function bigCard(key, label) {
    return '<div class="hw-card is-big' + (hasIcon(key) ? '' : ' is-text') + '">' + (hasIcon(key) ? icon(key, label) : '') + '<span class="hw-card-label">' + esc(label) + '</span></div>';
  }
  function labelOf(it) { return it[2] || NOMBRES[it[0]] || it[0]; }
  var NOMBRES = {
    monitor: 'Monitor', teclado: 'Teclado', mouse: 'Mouse', gabinete: 'Gabinete', bocinas: 'Bocinas', impresora: 'Impresora',
    microfono: 'Micrófono', camara: 'Cámara web', audifonos: 'Audífonos', ram: 'Memoria RAM', disco: 'Disco duro (SSD)',
    madre: 'Tarjeta madre', cpu: 'Procesador (CPU)', fuente: 'Fuente de poder', gpu: 'Tarjeta de video',
    navegador: 'Navegador de internet', videojuego: 'Videojuego', sistema: 'Sistema operativo', dibujo: 'Programa de dibujo',
    usb: 'Puerto USB', hdmi: 'Puerto HDMI', jack: 'Entrada de audio', ethernet: 'Puerto de red (Ethernet)', corriente: 'Conector de corriente',
    wifi: 'Wi-Fi', bluetooth: 'Bluetooth', usbmem: 'Memoria USB', sd: 'Tarjeta SD', nube: 'La nube', carpeta: 'Carpeta'
  };

  // ---------- Niveles ----------
  var LEVELS = [
    { type: 'tap', name: 'Conoce la computadora', intro: '¡Vamos a conocer las partes de una computadora! Toca la que te pida.',
      items: [
        ['monitor', 'El monitor es la pantalla: ahí ves lo que hace la computadora.'],
        ['teclado', 'Con el teclado escribes letras, números y símbolos.'],
        ['mouse', 'El mouse mueve la flechita para elegir y hacer clic.'],
        ['gabinete', 'El gabinete es la caja donde viven las piezas que hacen funcionar la computadora.'],
        ['bocinas', 'Las bocinas dejan salir el sonido y la música.'],
        ['impresora', 'La impresora pasa a papel lo que ves en la pantalla.']
      ] },
    { type: 'sort', name: '¿Entrada o salida?', intro: 'Los dispositivos de ENTRADA le dan información a la computadora. Los de SALIDA nos muestran algo. ¿Dónde va cada uno?',
      bins: [['entrada', 'Entrada', 'le doy información'], ['salida', 'Salida', 'me muestra algo']],
      items: [['teclado', 'entrada'], ['monitor', 'salida'], ['mouse', 'entrada'], ['bocinas', 'salida'], ['microfono', 'entrada'], ['impresora', 'salida'], ['camara', 'entrada'], ['audifonos', 'salida']],
      why: { entrada: 'Es de entrada: con él le das información a la computadora.', salida: 'Es de salida: la computadora lo usa para mostrarte o hacerte escuchar algo.' } },
    { type: 'sort', name: '¿Hardware o software?', intro: 'HARDWARE son las piezas que puedes tocar. SOFTWARE son los programas que corren dentro. ¡Clasifícalos!',
      bins: [['hardware', 'Hardware', 'lo puedo tocar'], ['software', 'Software', 'es un programa']],
      items: [['ram', 'hardware'], ['navegador', 'software'], ['disco', 'hardware'], ['videojuego', 'software'], ['madre', 'hardware'], ['sistema', 'software'], ['mouse', 'hardware'], ['dibujo', 'software']],
      why: { hardware: 'Es hardware: es una pieza que se puede tocar.', software: 'Es software: es un programa, no se puede tocar.' } },
    { type: 'match', name: 'Dentro del gabinete', intro: 'Abrimos el gabinete. ¿Para qué sirve cada pieza?',
      items: [
        ['cpu', 'Piensa y hace los cálculos: es el cerebro'],
        ['ram', 'Recuerda lo que estás usando en este momento'],
        ['disco', 'Guarda tus archivos aunque apagues la computadora'],
        ['fuente', 'Le da energía eléctrica a todas las piezas'],
        ['gpu', 'Dibuja las imágenes que ves en el monitor'],
        ['madre', 'Conecta todas las piezas entre sí']
      ] },
    { type: 'build', name: '¡Arma la computadora!', intro: 'Toca una pieza y luego el lugar de la tarjeta madre donde va. ¡Cuando esté completa, la encendemos!',
      slots: [
        ['cpu', 'Socket cuadrado', 'El procesador va en el socket cuadrado.'],
        ['ram', 'Ranuras largas y delgadas', 'La memoria RAM entra en las ranuras largas y delgadas.'],
        ['gpu', 'Ranura ancha de abajo', 'La tarjeta de video va en la ranura ancha.'],
        ['disco', 'Ranura pequeña', 'El SSD pequeño se conecta en su ranura.'],
        ['fuente', 'Conector de energía', 'La fuente de poder se conecta al conector de energía.']
      ] },
    { type: 'quiz', name: 'La isla del tesoro', intro: '¡Ahoy! Cada respuesta correcta acerca el barco al tesoro. ¡No dejes que los cangrejos te detengan!',
      items: [
        ['¿Cuál de estos sirve para escribir?', ['Teclado', 'Bocinas', 'Monitor']],
        ['¿Qué pieza es el "cerebro" de la computadora?', ['Procesador (CPU)', 'Mouse', 'Impresora']],
        ['¿Dónde se guardan tus fotos aunque apagues la computadora?', ['En el disco duro (SSD)', 'En la memoria RAM', 'En las bocinas']],
        ['¿Cuál es un dispositivo de salida?', ['Monitor', 'Micrófono', 'Teclado']],
        ['¿Cuál de estos es software?', ['Un videojuego', 'El mouse', 'La memoria RAM']],
        ['¿Qué pieza conecta a todas las demás?', ['La tarjeta madre', 'Los audífonos', 'La cámara web']],
        ['¿Qué haces antes de abrir una computadora?', ['Apagarla, desconectarla y pedir ayuda a un adulto', 'Tocarla con las manos mojadas', 'Dejarla encendida']],
        ['¿Qué hace la fuente de poder?', ['Da energía a las piezas', 'Imprime hojas', 'Guarda archivos']]
      ] }
  ];


  // ---------- Sesiones de 45 minutos (niveles 7, 8 y 9) ----------
  LEVELS.push(
    { type: 'session', name: 'Sesión: puertos y conexiones', intro: 'Hoy aprenderás a conectar aparatos a la computadora. Son 6 misiones: ¡vamos paso a paso!',
      missions: [
        { type: 'learn', name: 'Los puertos de la computadora', min: 8, intro: 'Los puertos son las entradas donde se conectan los cables. Lee cada tarjeta con tu maestro.',
          cards: [
            ['usb', 'Puerto USB', 'Es el más común. Ahí conectas el mouse, el teclado, una memoria USB o un control. Hay USB normal (tipo A) y USB-C, que es pequeño y ovalado.'],
            ['hdmi', 'Puerto HDMI', 'Lleva imagen y sonido de la computadora a un monitor o a una televisión.'],
            ['jack', 'Entrada de audio', 'Un hoyito redondo de 3.5 mm para conectar audífonos o bocinas con cable.'],
            ['ethernet', 'Puerto de red (Ethernet)', 'Conecta la computadora a internet con un cable que va al módem.'],
            ['corriente', 'Conector de corriente', 'Por aquí llega la energía para que la computadora funcione o cargue su batería.'],
            ['wifi', 'Wi-Fi', 'Conexión a internet sin cables, por ondas de radio.'],
            ['bluetooth', 'Bluetooth', 'Conecta aparatos que están cerca sin cables, como audífonos, bocinas o controles.']
          ] },
        { type: 'tap', name: 'Encuentra el puerto', min: 6, intro: 'Toca el puerto que te pida. ¡Fíjate bien en su forma!',
          items: [
            ['usb', 'El USB es rectangular y sirve para muchísimos aparatos.'],
            ['hdmi', 'El HDMI tiene las esquinas de abajo cortadas. Lleva imagen y sonido.'],
            ['jack', 'La entrada de audio es redonda y pequeñita.'],
            ['ethernet', 'El puerto de red parece un USB más alto, con una pestañita.'],
            ['corriente', 'Por el conector de corriente entra la energía.']
          ] },
        { type: 'match', name: '¿Dónde se conecta?', min: 8, intro: '¿En qué puerto conectas cada aparato?',
          items: [
            ['mouse', 'Puerto USB'],
            ['monitor', 'Puerto HDMI'],
            ['audifonos', 'Entrada de audio (3.5 mm)'],
            ['ethernet', 'Puerto de red (Ethernet)', 'Cable de internet'],
            ['corriente', 'Conector de corriente', 'Cargador de la laptop']
          ] },
        { type: 'sort', name: '¿Con cable o inalámbrico?', min: 6, intro: 'Algunas conexiones usan cable y otras van por el aire. ¡Clasifícalas!',
          bins: [['cable', 'Con cable', 'se conecta a un puerto'], ['inalambrico', 'Inalámbrico', 'sin cables']],
          hintBad: '¿Necesita un cable conectado a un puerto o funciona por el aire?',
          items: [['hdmi', 'cable', 'Cable HDMI al monitor'], ['wifi', 'inalambrico', 'Internet por Wi-Fi'], ['ethernet', 'cable', 'Cable de red'], ['bluetooth', 'inalambrico', 'Audífonos Bluetooth'],
            ['mouse', 'cable', 'Mouse con cable USB'], ['mouse', 'inalambrico', 'Mouse inalámbrico'], ['impresora', 'cable', 'Impresora conectada por USB'], ['videojuego', 'inalambrico', 'Control de consola por Bluetooth']] },
        { type: 'checklist', name: 'Reto con una computadora de verdad', min: 10, intro: 'Ahora, con un adulto, revisa una computadora real. Marca cada reto cuando lo logres.',
          note: 'Hazlo siempre con un adulto. Nunca conectes ni desconectes cables de corriente tú solo.',
          tasks: ['Busca los puertos USB de la computadora y cuéntalos.', 'Encuentra el puerto HDMI (o el de video) y la entrada de audio.',
            'Conecta y desconecta con cuidado un mouse o una memoria USB.', 'Pregunta si esa computadora se conecta a internet por Wi-Fi o por cable.',
            'Dibuja en tu cuaderno los puertos que encontraste.'] },
        { type: 'quiz', name: 'Quiz de conexiones', min: 7, intro: '¡Último reto! Cada respuesta correcta te acerca al tesoro.',
          items: [
            ['¿Qué puerto usas para conectar un monitor o una televisión?', ['HDMI', 'Entrada de audio', 'Ethernet']],
            ['¿Dónde conectas unos audífonos con cable?', ['En la entrada de audio', 'En el puerto de red', 'En el conector de corriente']],
            ['¿Cuál de estas conexiones es sin cables?', ['Bluetooth', 'HDMI', 'Ethernet']],
            ['¿Para qué sirve el puerto Ethernet?', ['Para conectarse a internet con cable', 'Para escuchar música', 'Para cargar la batería']],
            ['¿Cuál es el puerto más común para mouse, teclado y memorias?', ['USB', 'HDMI', 'Entrada de audio']],
            ['¿Cómo se llama el USB pequeño y ovalado?', ['USB-C', 'USB-Z', 'Mini HDMI']],
            ['¿Qué viaja por un cable HDMI?', ['Imagen y sonido', 'Solo electricidad', 'Solo internet']],
            ['Antes de quitar una memoria USB, ¿qué conviene hacer?', ['Expulsarla en la computadora', 'Jalarla muy fuerte', 'Apagar la luz del cuarto']]
          ] }
      ] },
    { type: 'session', name: 'Sesión: cuida tu computadora y tus datos', intro: 'Hoy aprenderás a cuidar la computadora y a protegerte en internet. Son 6 misiones.',
      missions: [
        { type: 'learn', name: 'Reglas de oro', min: 9, intro: 'Estas reglas cuidan tu computadora y te cuidan a ti. Platícalas con tu maestro.',
          cards: [
            ['monitor', 'Limpia con cuidado', 'Apaga la computadora y limpia la pantalla con un paño seco y suave. Nunca le eches agua directo.'],
            ['teclado', 'Nada de comida ni bebidas', 'Las migajas y los líquidos pueden dañar el teclado. Come lejos de la computadora.'],
            ['gabinete', 'Deja respirar a la computadora', 'No tapes las rejillas de ventilación: por ahí sale el aire caliente.'],
            ['sistema', 'Apágala correctamente', 'Usa el menú de apagar. Si la desconectas de golpe, puedes perder tus archivos.'],
            ['candado', 'Contraseñas seguras', 'Una buena contraseña es larga y mezcla letras, números y símbolos. No se la digas a nadie, solo a tus papás o tutores.'],
            ['escudo', 'Tus datos son privados', 'No compartas en internet tu dirección, tu teléfono, tu escuela ni tus contraseñas.'],
            ['chat', 'Si algo te incomoda, avisa', 'Si un desconocido te escribe o ves algo raro, cierra la ventana y avisa a un adulto de confianza.']
          ] },
        { type: 'sort', name: '¿Buena o mala idea?', min: 6, intro: '¿Esto cuida la computadora o la pone en peligro?',
          bins: [['buena', 'Buena idea', 'la cuida'], ['mala', 'Mala idea', 'la pone en peligro']],
          hintBad: 'Piensa: ¿eso ayuda a que la computadora dure más o la puede dañar?',
          items: [['monitor', 'buena', 'Limpiar la pantalla con un paño seco'], ['teclado', 'mala', 'Comer papitas sobre el teclado'], ['sistema', 'buena', 'Apagar la computadora desde el menú'],
            ['gabinete', 'mala', 'Tapar las rejillas de ventilación'], ['chat', 'buena', 'Pedir ayuda a un adulto si algo falla'], ['monitor', 'mala', 'Echar agua directo a la pantalla'],
            ['corriente', 'mala', 'Desconectar el cable de golpe'], ['disco', 'buena', 'Guardar tu trabajo seguido']] },
        { type: 'sort', name: '¿Lo puedo compartir?', min: 6, intro: 'Algunos datos se pueden compartir y otros son privados. ¿Cuál es cuál?',
          bins: [['puedo', 'Lo puedo compartir', 'no dice quién soy ni dónde estoy'], ['privado', 'Es privado', 'solo para mi familia']],
          hintBad: 'Pregúntate: ¿alguien podría encontrarme o entrar a mis cuentas con ese dato?',
          items: [['dibujo', 'puedo', 'Tu color favorito'], ['candado', 'privado', 'Tu contraseña'], ['videojuego', 'puedo', 'Tu videojuego favorito'], ['escudo', 'privado', 'La dirección de tu casa'],
            ['chat', 'privado', 'Tu número de teléfono'], ['dibujo', 'puedo', 'Tu animal favorito'], ['escudo', 'privado', 'El nombre de tu escuela'], ['camara', 'privado', 'Una foto de tu casa por fuera']] },
        { type: 'match', name: 'Problema y solución', min: 7, intro: '¿Qué haces en cada caso?',
          items: [
            ['candado', 'Pedir ayuda a un adulto para crear una nueva', 'Olvidé mi contraseña'],
            ['chat', 'Cerrar la ventana y avisar a un adulto', 'Un desconocido me escribe'],
            ['sistema', 'Cerrar los programas que no uso', 'La computadora va muy lenta'],
            ['monitor', 'Apagarla y limpiarla con un paño seco', 'La pantalla tiene polvo'],
            ['gabinete', 'Revisar que nada tape las rejillas', 'La computadora está muy caliente'],
            ['mouse', 'Revisar que el cable esté bien conectado', 'El mouse no funciona']
          ] },
        { type: 'password', name: 'Crea una contraseña súper segura', min: 8, intro: 'Inventa una contraseña y mira cómo se hace más fuerte. ¡Cumple todos los retos!' },
        { type: 'quiz', name: 'Quiz de seguridad', min: 9, intro: '¡Último reto! Demuestra que sabes cuidarte.',
          items: [
            ['¿Con qué limpias la pantalla?', ['Con un paño seco y suave', 'Con agua y jabón directo', 'Con una esponja mojada']],
            ['¿Cuál es la contraseña más segura?', ['Gato!Azul7Salta', '123456', 'minombre']],
            ['¿A quién le puedes decir tu contraseña?', ['A mis papás o tutores', 'A mi mejor amigo', 'A quien me la pida']],
            ['En un juego, un desconocido te pide tu dirección. ¿Qué haces?', ['No se la doy y aviso a un adulto', 'Se la doy', 'Le mando una foto de mi casa']],
            ['¿Por qué no hay que tapar las rejillas?', ['Porque por ahí sale el aire caliente', 'Porque se ve feo', 'Porque ahí se guardan los archivos']],
            ['¿Cómo apagas bien la computadora?', ['Desde el menú de apagar', 'Desconectando el cable', 'Cerrando la tapa con fuerza']],
            ['¿Cuál de estos datos es privado?', ['Mi número de teléfono', 'Mi color favorito', 'Mi animal favorito']],
            ['Si ves algo en internet que te incomoda, ¿qué haces?', ['Cierro la ventana y aviso a un adulto', 'Lo comparto con mis amigos', 'Lo guardo en secreto']]
          ] }
      ] },
    { type: 'session', name: 'Sesión: archivos y almacenamiento', intro: 'Hoy aprenderás dónde y cómo guarda las cosas una computadora. Son 7 misiones.',
      missions: [
        { type: 'learn', name: 'Archivos, carpetas y espacio', min: 9, intro: 'Lee cada tarjeta con tu maestro. ¡Vas a ser experto en archivos!',
          cards: [
            ['file:jpg', 'Archivo', 'Un archivo guarda una cosa: una foto, una canción, un dibujo o un trabajo de la escuela.'],
            ['carpeta', 'Carpeta', 'Una carpeta guarda archivos ordenados, como un cajón. Puedes tener carpetas dentro de carpetas.'],
            ['file:mp3', 'Extensión', 'Son las letras después del punto: .jpg y .png son fotos, .mp3 es música, .mp4 es video, .docx y .pdf son documentos.'],
            ['cpu', 'Bit y byte', 'La computadora guarda todo con ceros y unos. Cada 0 o 1 es un bit. 8 bits forman un byte, que alcanza para una letra.'],
            ['disco', 'KB, MB, GB y TB', 'Kilobyte, megabyte, gigabyte y terabyte miden cuánto espacio ocupa algo. Cada uno es unas mil veces más grande que el anterior.'],
            ['usbmem', 'Memoria USB y tarjeta SD', 'Sirven para llevar tus archivos a otro lugar. La tarjeta SD se usa mucho en cámaras y tabletas.'],
            ['nube', 'La nube', 'Guardar en la nube es guardar en computadoras de internet. Así abres tus archivos desde otro lugar con tu cuenta.']
          ] },
        { type: 'sort', name: 'Ordena los archivos', min: 6, intro: 'Mete cada archivo en su carpeta. ¡Fíjate en la extensión!',
          bins: [['fotos', 'Fotos', '.jpg .png'], ['musica', 'Música', '.mp3'], ['videos', 'Videos', '.mp4'], ['documentos', 'Documentos', '.docx .pdf']],
          hintBad: 'Mira las letras después del punto: esa es la pista.',
          items: [['file:jpg', 'fotos', 'playa.jpg'], ['file:mp3', 'musica', 'cancion.mp3'], ['file:mp4', 'videos', 'cumpleanos.mp4'], ['file:docx', 'documentos', 'tarea.docx'],
            ['file:png', 'fotos', 'dibujo.png'], ['file:pdf', 'documentos', 'temario.pdf'], ['file:mp3', 'musica', 'himno.mp3'], ['file:mp4', 'videos', 'tutorial.mp4'], ['file:jpg', 'fotos', 'perrito.jpg'], ['file:pdf', 'documentos', 'diploma.pdf']] },
        { type: 'order', name: 'Del más pequeño al más grande', min: 4, intro: 'Toca las medidas en orden, de la más pequeña a la más grande.',
          items: ['Bit', 'Byte', 'Kilobyte (KB)', 'Megabyte (MB)', 'Gigabyte (GB)', 'Terabyte (TB)'] },
        { type: 'order', name: '¿Qué ocupa más espacio?', min: 4, intro: 'Ordena del que ocupa menos espacio al que ocupa más.',
          items: ['Una letra', 'Una página de texto', 'Una foto', 'Un video de 10 minutos'] },
        { type: 'match', name: '¿Dónde se guarda?', min: 6, intro: '¿Qué hace cada lugar donde se guardan los archivos?',
          items: [
            ['disco', 'Guarda todo dentro de la computadora, aunque la apagues'],
            ['ram', 'Se borra al apagar: solo guarda lo que usas en este momento'],
            ['usbmem', 'Lleva archivos en tu bolsillo a otra computadora'],
            ['sd', 'Tarjeta pequeña para cámaras y tabletas'],
            ['nube', 'Guarda en internet y lo abres desde otro lugar']
          ] },
        { type: 'checklist', name: 'Reto: organiza tu carpeta', min: 9, intro: 'Con un adulto, organiza archivos en una computadora de verdad.',
          note: 'Pide permiso antes de crear, mover o borrar archivos.',
          tasks: ['Abre el explorador de archivos (o la app Archivos).', 'Crea una carpeta nueva llamada "Mis proyectos".', 'Guarda dentro un dibujo o un documento.',
            'Cámbiale el nombre al archivo por uno que diga qué es.', 'Busca cuánto espacio ocupa tu archivo (KB o MB).'] },
        { type: 'quiz', name: 'Quiz de archivos', min: 7, intro: '¡Último reto! Cada respuesta correcta te acerca al tesoro.',
          items: [
            ['¿Qué es una carpeta?', ['Un lugar para guardar archivos ordenados', 'Un programa para dibujar', 'Una pieza del gabinete']],
            ['¿Qué tipo de archivo es "vacaciones.jpg"?', ['Una foto', 'Una canción', 'Un video']],
            ['¿Cuántos bits tiene un byte?', ['8', '2', '100']],
            ['¿Qué es más grande?', ['1 gigabyte (GB)', '1 megabyte (MB)', '1 kilobyte (KB)']],
            ['¿Qué memoria se borra al apagar la computadora?', ['La RAM', 'El disco duro', 'La memoria USB']],
            ['¿Qué extensión tiene una canción?', ['.mp3', '.jpg', '.docx']],
            ['¿Qué significa guardar en la nube?', ['Guardar en computadoras de internet', 'Guardar en el cielo de verdad', 'Borrar el archivo']],
            ['¿Para qué sirve una memoria USB?', ['Para llevar archivos a otra computadora', 'Para dar energía', 'Para ver la imagen']]
          ] }
      ] }
  );

  // ---------- Compañeros ----------
  var BUDDIES = [['perro', 'Perrito'], ['gato', 'Gatito'], ['pirata', 'Pirata'], ['ninja', 'Ninja'], ['vikinga', 'Vikinga']];
  var CHEERS = ['¡Muy bien!', '¡Excelente!', '¡Lo sabías!', '¡Genial!', '¡Bravo!'];
  var buddy = 'perro';
  var STORE = 'ik-hardware-v1', BKEY = 'ik-hardware-buddy';
  var progress = {};
  try { progress = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; buddy = localStorage.getItem(BKEY) || buddy; } catch (e) { /* sin almacenamiento */ }
  if (!BUDDIES.some(function (b) { return b[0] === buddy; })) buddy = 'perro';
  var TEACHER = /[?&]profe=1\b/.test(location.search);

  function saveProgress() {
    try { localStorage.setItem(STORE, JSON.stringify(progress)); } catch (e) { /* sin almacenamiento */ }
    document.dispatchEvent(new CustomEvent('ik:progreso', { detail: { juego: 'hardware', niveles: progress, total: LEVELS.length } }));
  }
  document.addEventListener('ik:progreso-remoto', function (e) {
    var remoto = (e.detail && e.detail.niveles) || {}, cambio = false, subir = false;
    Object.keys(remoto).forEach(function (k) { var v = +remoto[k] || 0; if (v > (progress[k] || 0)) { progress[k] = v; cambio = true; } });
    Object.keys(progress).forEach(function (k) { if ((progress[k] || 0) > (+remoto[k] || 0)) subir = true; });
    if (cambio) { try { localStorage.setItem(STORE, JSON.stringify(progress)); } catch (er) { /* sin almacenamiento */ } renderLevels(); }
    if (subir) saveProgress();
  });
  function unlocked(i) { return TEACHER || i === 0 || !!progress[i - 1]; }

  // ---------- Utilidades ----------
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var bubble = $('hw-bubble'), play = $('hw-area') || $('hw-play'), buddyEl = $('hw-buddy'), overlay = $('hw-overlay');
  function say(t) { bubble.textContent = t; }
  function react(kind) {
    buddyEl.classList.remove('is-happy', 'is-sad');
    void buddyEl.offsetWidth;
    buddyEl.classList.add(kind === 'ok' ? 'is-happy' : 'is-sad');
    if (kind === 'ok') sfx(buddy === 'perro' && Math.random() < 0.4 ? 'woof' : buddy === 'gato' && Math.random() < 0.4 ? 'meow' : 'ok');
    else sfx('bad');
  }
  function cheer() { return CHEERS[Math.floor(Math.random() * CHEERS.length)]; }

  // ---------- Estado ----------
  var level = 0, errors = 0, state = null;

  function renderBuddy() {
    buddyEl.innerHTML = '';
    if (window.IKSprites) buddyEl.appendChild(window.IKSprites.canvasOf(buddy, 96));
    var pick = $('hw-buddies');
    pick.innerHTML = '';
    BUDDIES.forEach(function (b) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gm-hero-btn';
      btn.setAttribute('aria-label', b[1]);
      btn.title = b[1];
      btn.setAttribute('aria-pressed', String(buddy === b[0]));
      if (window.IKSprites) btn.appendChild(window.IKSprites.canvasOf(b[0], 40));
      btn.addEventListener('click', function () {
        buddy = b[0];
        try { localStorage.setItem(BKEY, buddy); } catch (e) { /* sin almacenamiento */ }
        renderBuddy();
        react('ok');
        say('¡Hola! Soy tu compañero ' + b[1].toLowerCase() + '. ¡Vamos a aprender juntos!');
      });
      pick.appendChild(btn);
    });
  }

  var ICON_LOCK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  function renderLevels() {
    var ol = $('hw-levels');
    ol.innerHTML = '';
    LEVELS.forEach(function (L, i) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      var lock = !unlocked(i);
      b.className = 'lvl' + (i === level ? ' is-current' : '') + (progress[i] ? ' is-done' : '') + (lock ? ' is-locked' : '');
      b.disabled = lock;
      var stars = '';
      if (progress[i]) for (var k = 0; k < 3; k++) stars += '<i class="' + (k < progress[i] ? 'on' : '') + '"></i>';
      b.innerHTML = '<span class="lvl-num">' + (lock ? ICON_LOCK : (i + 1)) + '</span><span class="lvl-stars" aria-hidden="true">' + stars + '</span>';
      b.setAttribute('aria-label', 'Nivel ' + (i + 1) + ': ' + L.name + (lock ? ' (bloqueado)' : progress[i] ? ' (' + progress[i] + ' de 3 estrellas)' : ''));
      b.title = 'Nivel ' + (i + 1) + ': ' + L.name;
      if (i === level) b.setAttribute('aria-current', 'step');
      b.addEventListener('click', function () { setLevel(i); });
      li.appendChild(b);
      ol.appendChild(li);
    });
  }

  var START = { tap: startTap, sort: startSort, match: startMatch, build: startBuild, quiz: startQuiz,
    learn: startLearn, order: startOrder, checklist: startChecklist, password: startPassword };
  var session = null; // { L, i } cuando el nivel es una sesión de 45 minutos
  var SKEY = 'ik-hardware-sesion';
  function readPos() { try { return JSON.parse(localStorage.getItem(SKEY) || 'null'); } catch (e) { return null; } }
  function savePos() { try { localStorage.setItem(SKEY, JSON.stringify({ level: level, i: session.i, errors: errors })); } catch (e) { /* sin almacenamiento */ } }
  function clearPos() { try { localStorage.removeItem(SKEY); } catch (e) { /* sin almacenamiento */ } }

  function setLevel(i, fresh) {
    if (!unlocked(i)) return;
    level = i; errors = 0; session = null; doneLock = false;
    overlay.hidden = true; overlay.innerHTML = '';
    var L = LEVELS[i];
    $('hw-kicker').textContent = 'Nivel ' + (i + 1) + ' de ' + LEVELS.length + (L.type === 'session' ? ' · Sesión de 45 min' : '');
    $('hw-title').textContent = L.name;
    app.setAttribute('data-tipo', L.type);
    renderLevels();
    var steps = $('hw-steps');
    if (L.type !== 'session') {
      if (steps) steps.hidden = true;
      say(L.intro);
      START[L.type](L);
      return;
    }
    var pos = readPos();
    session = { L: L, i: 0 };
    if (!fresh && pos && pos.level === i && pos.i > 0 && pos.i < L.missions.length) { session.i = pos.i; errors = pos.errors || 0; }
    startMission(session.i === 0 ? L.intro : '¡Bienvenido de vuelta! Seguimos en la misión ' + (session.i + 1) + '.');
  }
  function startMission(msg) {
    doneLock = false;
    var M = session.L.missions[session.i];
    renderSteps();
    say(msg || M.intro);
    START[M.type](M);
    if (msg) setTimeout(function () { if (session && session.L.missions[session.i] === M) say(M.intro); }, 3500);
  }
  function renderSteps() {
    var steps = $('hw-steps');
    if (!steps) return;
    var ms = session.L.missions, M = ms[session.i];
    var html = '<ol class="hw-steps-list" aria-label="Misiones de la sesión">';
    ms.forEach(function (m, k) {
      html += '<li class="' + (k < session.i ? 'is-done' : k === session.i ? 'is-current' : '') + '"' + (k === session.i ? ' aria-current="step"' : '') + '><span class="sr-only">Misión ' + (k + 1) + ': ' + esc(m.name) + (k < session.i ? ' (completada)' : '') + '</span></li>';
    });
    html += '</ol><p class="hw-steps-text"><strong>Misión ' + (session.i + 1) + ' de ' + ms.length + ':</strong> ' + esc(M.name) + ' <span>· ~' + M.min + ' min</span></p>';
    steps.innerHTML = html;
    steps.hidden = false;
  }
  // Termina una misión o un nivel normal
  var doneLock = false;
  function done() {
    if (doneLock) return; // evita terminar dos veces con toques rápidos
    doneLock = true;
    if (!session) return win();
    session.i++;
    if (session.i >= session.L.missions.length) { clearPos(); return win(); }
    savePos();
    sfx('win');
    var next = session.L.missions[session.i];
    overlay.className = 'game-overlay is-win hw-overlay';
    overlay.innerHTML = '<div class="overlay-card"><p class="overlay-title">¡Misión ' + session.i + ' completada!</p>' +
      '<p class="overlay-msg">Siguiente: ' + esc(next.name) + ' (~' + next.min + ' min)</p>' +
      '<div class="overlay-actions"><button type="button" class="btn btn-yellow" data-act="mission">Continuar</button></div></div>';
    overlay.hidden = false;
    overlay.querySelector('button').focus({ preventScroll: true });
  }

  // ---------- Misión tipo "aprende" (tarjetas) ----------
  function startLearn(M) {
    state = { k: 0 };
    play.innerHTML = '<div class="hw-learn"><div class="hw-learn-card" id="hw-learn" aria-live="polite"></div>' +
      '<div class="hw-learn-nav"><button type="button" class="btn btn-ghost-light" id="hw-prev">Anterior</button><span id="hw-learn-n"></span>' +
      '<button type="button" class="btn btn-yellow" id="hw-next">Siguiente</button></div></div>';
    function show() {
      var c = M.cards[state.k];
      $('hw-learn').innerHTML = '<div class="hw-learn-icon">' + icon(c[0], c[1]) + '</div><div><h3>' + esc(c[1]) + '</h3><p>' + esc(c[2]) + '</p></div>';
      $('hw-learn-n').textContent = (state.k + 1) + ' de ' + M.cards.length;
      $('hw-prev').disabled = state.k === 0;
      $('hw-next').textContent = state.k === M.cards.length - 1 ? '¡Entendido!' : 'Siguiente';
      say(c[1] + ': ' + c[2]);
    }
    $('hw-prev').addEventListener('click', function () { if (state.k > 0) { state.k--; sfx('click'); show(); } });
    $('hw-next').addEventListener('click', function () {
      if (state.k < M.cards.length - 1) { state.k++; sfx('click'); show(); } else { react('ok'); done(); }
    });
    show();
  }

  // ---------- Misión tipo "ordena" ----------
  function startOrder(M) {
    state = { k: 0 };
    play.innerHTML = '<div class="hw-order"><ol class="hw-order-done" id="hw-order-done" aria-label="Tu orden"></ol>' +
      '<div class="hw-options hw-order-opts" id="hw-options" role="group" aria-label="Opciones"></div><p class="hw-left" id="hw-left"></p></div>';
    var box = $('hw-options');
    shuffle(M.items).forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'hw-opt'; b.textContent = t;
      b.addEventListener('click', function () {
        if (t === M.items[state.k]) {
          var li = document.createElement('li'); li.textContent = t;
          $('hw-order-done').appendChild(li);
          b.remove(); state.k++;
          react('ok');
          if (state.k === M.items.length) { say(cheer() + ' Quedó en orden: ' + M.items.join(' → ') + '.'); setTimeout(done, 900); }
          else { say(cheer() + ' Sigue: ¿cuál va después de "' + t + '"?'); $('hw-left').textContent = 'Faltan ' + (M.items.length - state.k); }
        } else {
          errors++; react('bad'); b.classList.add('is-bad'); setTimeout(function () { b.classList.remove('is-bad'); }, 500);
          say('Todavía no va ese. Busca el que sigue en tamaño.');
        }
      });
      box.appendChild(b);
    });
    $('hw-left').textContent = 'Faltan ' + M.items.length;
  }

  // ---------- Misión tipo "reto práctico" ----------
  function startChecklist(M) {
    var html = '<div class="hw-check"><ul class="hw-check-list">';
    M.tasks.forEach(function (t, k) {
      html += '<li><label class="hw-check-item"><input type="checkbox" data-k="' + k + '"><span>' + esc(t) + '</span></label></li>';
    });
    html += '</ul>' + (M.note ? '<p class="hw-note">' + esc(M.note) + '</p>' : '') +
      '<button type="button" class="btn btn-yellow" id="hw-check-ok" disabled>¡Terminé el reto!</button></div>';
    play.innerHTML = html;
    var boxes = play.querySelectorAll('input[type=checkbox]');
    boxes.forEach(function (c) {
      c.addEventListener('change', function () {
        var all = Array.prototype.every.call(boxes, function (x) { return x.checked; });
        $('hw-check-ok').disabled = !all;
        if (c.checked) { sfx('ok'); say(all ? '¡Lo lograste todo! Presiona "¡Terminé el reto!".' : cheer() + ' Sigue con el siguiente reto.'); }
      });
    });
    $('hw-check-ok').addEventListener('click', function () { react('ok'); done(); });
  }

  // ---------- Misión tipo "contraseña segura" (no se guarda ni se envía) ----------
  function startPassword(M) {
    var RULES = [
      ['Tiene 12 caracteres o más', function (v) { return v.length >= 12; }],
      ['Tiene una letra mayúscula', function (v) { return /[A-ZÁÉÍÓÚÑ]/.test(v); }],
      ['Tiene una letra minúscula', function (v) { return /[a-záéíóúñ]/.test(v); }],
      ['Tiene un número', function (v) { return /\d/.test(v); }],
      ['Tiene un símbolo, como ! ? # $ *', function (v) { return /[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9\s]/.test(v); }],
      ['No usa cosas fáciles como 123, abc o "contraseña"', function (v) { return v.length > 0 && !/123|abc|qwerty|contrase|password|1111|0000/i.test(v); }]
    ];
    play.innerHTML = '<div class="hw-pass"><div class="field"><label for="hw-pass-in">Escribe una contraseña inventada</label>' +
      '<input id="hw-pass-in" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="40"></div>' +
      '<div class="hw-meter" aria-hidden="true"><span id="hw-meter-bar"></span></div><p class="hw-meter-label" id="hw-meter-label" aria-live="polite">Empieza a escribir</p>' +
      '<ul class="hw-rules" id="hw-rules"></ul>' +
      '<p class="hw-note">Truco: usa una frase que solo tú recuerdes, con números y símbolos. Esta página no guarda ni envía lo que escribes. No uses aquí tu contraseña real.</p>' +
      '<button type="button" class="btn btn-yellow" id="hw-pass-ok" disabled>¡Mi contraseña es súper segura!</button></div>';
    var input = $('hw-pass-in'), last = 0;
    function check() {
      var v = input.value, n = 0, html = '';
      RULES.forEach(function (r) { var ok = r[1](v); if (ok) n++; html += '<li class="' + (ok ? 'is-ok' : '') + '"><span aria-hidden="true">' + (ok ? '✓' : '•') + '</span> ' + esc(r[0]) + '<span class="sr-only">' + (ok ? ': cumplido' : ': falta') + '</span></li>'; });
      $('hw-rules').innerHTML = html;
      var pct = Math.round(n / RULES.length * 100);
      var bar = $('hw-meter-bar');
      bar.style.width = pct + '%';
      bar.style.background = n <= 2 ? '#EF5350' : n <= 4 ? '#FFB300' : n === 5 ? '#9CCC65' : '#2E7D32';
      $('hw-meter-label').textContent = !v ? 'Empieza a escribir' : n <= 2 ? 'Débil' : n <= 4 ? 'Regular' : n === 5 ? 'Fuerte' : '¡Súper segura!';
      $('hw-pass-ok').disabled = n < RULES.length;
      if (n > last) sfx('ok');
      if (n === RULES.length && last < n) say('¡Excelente! Esa contraseña es muy difícil de adivinar. Recuerda: no se la digas a nadie.');
      last = n;
    }
    input.addEventListener('input', check);
    $('hw-pass-ok').addEventListener('click', function () { input.value = ''; react('ok'); done(); });
    check();
    say(M.intro);
  }

  // ---------- Nivel tipo "toca" ----------
  function startTap(L) {
    state = { queue: shuffle(L.items), done: {} };
    play.innerHTML = '<p class="hw-ask" id="hw-ask"></p><div class="hw-grid" id="hw-grid"></div>';
    var grid = $('hw-grid');
    shuffle(L.items).forEach(function (it) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'hw-card';
      b.dataset.id = it[0];
      b.innerHTML = icon(it[0], 'Pieza misteriosa') + '<span class="hw-card-label">?</span>';
      b.setAttribute('aria-label', 'Pieza ' + (grid.children.length + 1));
      b.addEventListener('click', function () { tapPick(b); });
      grid.appendChild(b);
    });
    nextTap();
  }
  function nextTap() {
    if (!state.queue.length) return done();
    $('hw-ask').innerHTML = 'Toca: <strong>' + esc(NOMBRES[state.queue[0][0]]) + '</strong>';
  }
  function tapPick(b) {
    if (!state.queue.length || state.done[b.dataset.id] || state.busy) return;
    var want = state.queue[0];
    if (b.dataset.id === want[0]) {
      state.done[want[0]] = true;
      b.classList.add('is-ok'); b.disabled = true;
      b.querySelector('.hw-card-label').textContent = NOMBRES[want[0]];
      b.setAttribute('aria-label', NOMBRES[want[0]]);
      b.querySelector('svg').setAttribute('aria-label', NOMBRES[want[0]]);
      react('ok'); say(cheer() + ' ' + want[1]);
      state.queue.shift();
      state.busy = true;
      setTimeout(function () { state.busy = false; nextTap(); }, 300);
    } else {
      errors++; react('bad');
      b.classList.add('is-bad'); setTimeout(function () { b.classList.remove('is-bad'); }, 500);
      say('¡Ese no es! Busca: ' + NOMBRES[want[0]] + '. Intenta otra vez.');
    }
  }

  // ---------- Nivel tipo "clasifica" ----------
  function startSort(L) {
    state = { queue: shuffle(L.items), counts: {} };
    var html = '<div class="hw-sort"><div class="hw-current" id="hw-current" aria-live="polite"></div><div class="hw-bins' + (L.bins.length > 2 ? ' is-many' : '') + '">';
    L.bins.forEach(function (bn) {
      state.counts[bn[0]] = 0;
      html += '<button type="button" class="hw-bin" data-bin="' + bn[0] + '"><strong>' + esc(bn[1]) + '</strong><small>' + esc(bn[2]) + '</small><span class="hw-bin-items" id="bin-' + bn[0] + '"></span></button>';
    });
    html += '</div><p class="hw-left" id="hw-left"></p></div>';
    play.innerHTML = html;
    play.querySelectorAll('.hw-bin').forEach(function (b) { b.addEventListener('click', function () { sortPick(L, b); }); });
    nextSort();
  }
  function nextSort() {
    var cur = $('hw-current');
    if (!state.queue.length) { cur.innerHTML = ''; return done(); }
    var it = state.queue[0];
    cur.innerHTML = bigCard(it[0], labelOf(it));
    $('hw-left').textContent = 'Faltan ' + state.queue.length;
  }
  function sortPick(L, b) {
    if (!state.queue.length) return;
    var it = state.queue[0];
    if (b.dataset.bin === it[1]) {
      var mini = document.createElement('span');
      mini.className = 'hw-mini';
      mini.innerHTML = hasIcon(it[0]) ? icon(it[0], labelOf(it)) : '<span class="hw-mini-dot" title="' + esc(labelOf(it)) + '"></span>';
      $('bin-' + it[1]).appendChild(mini);
      var binName = L.bins.filter(function (x) { return x[0] === it[1]; })[0][1];
      react('ok'); say(cheer() + ' ' + labelOf(it) + ': ' + (L.why ? L.why[it[1]].charAt(0).toLowerCase() + L.why[it[1]].slice(1) : binName.toLowerCase() + '.'));
      state.queue.shift();
      nextSort();
    } else {
      errors++; react('bad');
      b.classList.add('is-bad'); setTimeout(function () { b.classList.remove('is-bad'); }, 500);
      say('Mmm… piensa otra vez: ' + (L.hintBad || (L.bins[0][0] === 'entrada' ? '¿le da información a la computadora o nos muestra algo?' : '¿se puede tocar o es un programa?')));
    }
  }

  // ---------- Nivel tipo "¿para qué sirve?" ----------
  function startMatch(L) {
    state = { queue: shuffle(L.items), all: L.items };
    play.innerHTML = '<div class="hw-match"><div class="hw-current" id="hw-current"></div><div class="hw-options" id="hw-options" role="group" aria-label="Opciones"></div><p class="hw-left" id="hw-left"></p></div>';
    nextMatch();
  }
  function nextMatch() {
    if (!state.queue.length) return done();
    var it = state.queue[0];
    $('hw-current').innerHTML = bigCard(it[0], labelOf(it));
    var others = shuffle(state.all.filter(function (x) { return x !== it; })).slice(0, 2);
    var opts = shuffle([it].concat(others));
    var box = $('hw-options');
    box.innerHTML = '';
    opts.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'hw-opt'; b.textContent = o[1];
      b.addEventListener('click', function () {
        if (o === it) {
          react('ok'); say(cheer() + ' ' + labelOf(it) + ': ' + o[1].charAt(0).toLowerCase() + o[1].slice(1) + '.');
          b.classList.add('is-ok');
          box.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
          state.queue.shift();
          setTimeout(nextMatch, 650);
        } else {
          errors++; react('bad'); b.classList.add('is-bad'); b.disabled = true;
          say('Esa no es su función. ¡Prueba otra!');
        }
      });
      box.appendChild(b);
    });
    $('hw-left').textContent = 'Faltan ' + state.queue.length;
  }

  // ---------- Nivel tipo "arma" ----------
  function startBuild(L) {
    state = { sel: null, placed: 0, total: L.slots.length };
    var html = '<div class="hw-build"><div class="hw-parts" id="hw-parts" role="group" aria-label="Piezas"></div>' +
      '<div class="hw-board" id="hw-board" aria-label="Tarjeta madre">';
    L.slots.forEach(function (s) {
      html += '<button type="button" class="hw-slot hw-slot-' + s[0] + '" data-slot="' + s[0] + '"><span>' + esc(s[1]) + '</span></button>';
    });
    html += '<div class="hw-screen" id="hw-screen" aria-hidden="true"></div></div>' +
      '<button type="button" class="btn btn-yellow hw-power" id="hw-power" hidden>Encender la computadora</button></div>';
    play.innerHTML = html;
    var parts = $('hw-parts');
    shuffle(L.slots).forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'hw-card hw-part'; b.dataset.part = s[0];
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = icon(s[0], NOMBRES[s[0]]) + '<span class="hw-card-label">' + esc(NOMBRES[s[0]]) + '</span>';
      b.addEventListener('click', function () {
        state.sel = s[0]; sfx('click');
        parts.querySelectorAll('.hw-part').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        say('Elegiste: ' + NOMBRES[s[0]] + '. Ahora toca dónde va en la tarjeta madre.');
      });
      parts.appendChild(b);
    });
    play.querySelectorAll('.hw-slot').forEach(function (slot) {
      slot.addEventListener('click', function () {
        if (slot.classList.contains('is-ok')) return;
        if (!state.sel) { say('Primero toca una pieza de la izquierda.'); sfx('click'); return; }
        var info = L.slots.filter(function (s) { return s[0] === slot.dataset.slot; })[0];
        if (state.sel === slot.dataset.slot) {
          slot.classList.add('is-ok');
          slot.innerHTML = icon(state.sel, NOMBRES[state.sel]);
          slot.setAttribute('aria-label', NOMBRES[state.sel] + ' colocada');
          var part = parts.querySelector('[data-part="' + state.sel + '"]');
          if (part) part.remove();
          state.sel = null; state.placed++;
          react('ok'); say(cheer() + ' ' + info[2]);
          if (state.placed === state.total) {
            say('¡Todas las piezas están en su lugar! Presiona "Encender la computadora".');
            var pw = $('hw-power'); pw.hidden = false; pw.focus();
            pw.addEventListener('click', function () {
              pw.disabled = true; sfx('power');
              $('hw-board').classList.add('is-on');
              say('¡Bip bup! La computadora encendió. ¡Eres todo un técnico!');
              setTimeout(done, 1200);
            }, { once: true });
          }
        } else {
          errors++; react('bad');
          slot.classList.add('is-bad'); setTimeout(function () { slot.classList.remove('is-bad'); }, 500);
          say('Esa pieza no cabe ahí. Fíjate en la forma del lugar.');
        }
      });
    });
  }

  // ---------- Nivel tipo "isla del tesoro" ----------
  function startQuiz(L) {
    state = { queue: L.items.slice(), pos: 0, total: L.items.length };
    var html = '<div class="hw-quiz"><div class="hw-map" id="hw-map" aria-hidden="true"><div class="hw-path">';
    for (var i = 0; i <= state.total; i++) html += '<span class="hw-spot' + (i === state.total ? ' is-x' : '') + '"></span>';
    html += '</div><div class="hw-ship" id="hw-ship"></div><div class="hw-chest" id="hw-chest"></div></div>' +
      '<p class="hw-ask" id="hw-ask"></p><div class="hw-options" id="hw-options" role="group" aria-label="Respuestas"></div><p class="hw-left" id="hw-left"></p></div>';
    play.innerHTML = html;
    if (window.IKSprites) {
      $('hw-ship').appendChild(window.IKSprites.canvasOf(buddy, 44));
      $('hw-chest').appendChild(window.IKSprites.canvasOf('cofre', 44));
    }
    moveShip();
    nextQuiz();
  }
  function moveShip() {
    var pct = state.pos / state.total;
    $('hw-ship').style.left = 'calc(' + (pct * 100) + '% - ' + (pct * 44) + 'px)';
    play.querySelectorAll('.hw-spot').forEach(function (s, i) { s.classList.toggle('is-past', i < state.pos); });
  }
  function nextQuiz() {
    if (!state.queue.length) {
      $('hw-chest').innerHTML = '';
      if (window.IKSprites) $('hw-chest').appendChild(window.IKSprites.canvasOf('cofreAbierto', 44));
      sfx('treasure');
      say('¡Encontraste el tesoro! Sabes mucho de computadoras.');
      $('hw-ask').textContent = ''; $('hw-options').innerHTML = '';
      setTimeout(done, 1300);
      return;
    }
    var q = state.queue[0];
    $('hw-ask').textContent = q[0];
    var box = $('hw-options');
    box.innerHTML = '';
    shuffle(q[1].map(function (t, i) { return [t, i === 0]; })).forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'hw-opt'; b.textContent = o[0];
      b.addEventListener('click', function () {
        if (o[1]) {
          b.classList.add('is-ok'); react('ok'); say(cheer() + ' ¡Avanzas hacia el tesoro!');
          state.queue.shift(); state.pos++; moveShip();
          box.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
          setTimeout(nextQuiz, 700);
        } else {
          errors++; react('bad'); b.classList.add('is-bad'); b.disabled = true;
          say('¡Un cangrejo bloquea el camino! Esa no es. Intenta otra respuesta.');
        }
      });
      box.appendChild(b);
    });
    $('hw-left').textContent = 'Pregunta ' + (state.pos + 1) + ' de ' + state.total;
  }

  // ---------- Resultado ----------
  function win() {
    var ses = LEVELS[level].type === 'session';
    var stars = ses ? (errors <= 3 ? 3 : errors <= 8 ? 2 : 1) : (errors <= 1 ? 3 : errors <= 3 ? 2 : 1);
    if ((progress[level] || 0) < stars) { progress[level] = stars; saveProgress(); }
    renderLevels();
    if (LEVELS[level].type !== 'quiz') sfx('win');
    var last = level === LEVELS.length - 1;
    var html = '<div class="overlay-card"><p class="overlay-title">' + (last ? '¡Terminaste Computación básica!' : ses ? '¡Sesión completada!' : '¡Nivel superado!') + '</p>' +
      '<p class="overlay-stars" aria-label="' + stars + ' de 3 estrellas">';
    for (var i = 0; i < 3; i++) html += '<span class="' + (i < stars ? 'on' : '') + '" aria-hidden="true">★</span>';
    html += '</p><p class="overlay-msg">' + (errors === 0 ? '¡Sin errores!' : errors === 1 ? 'Solo 1 error.' : errors + ' errores. ¡Juega otra vez para ganar más estrellas!') + '</p><div class="overlay-actions">';
    if (!last) html += '<button type="button" class="btn btn-yellow" data-act="next">Siguiente nivel</button>';
    else html += '<a class="btn btn-yellow" href="programacion-con-bloques.html">Ir a Programación con bloques</a>';
    html += '<button type="button" class="btn btn-ghost-light" data-act="retry">Jugar otra vez</button></div></div>';
    overlay.className = 'game-overlay is-win hw-overlay';
    overlay.innerHTML = html;
    overlay.hidden = false;
    var f = overlay.querySelector('button, a'); if (f) f.focus({ preventScroll: true });
  }
  overlay.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'mission') { overlay.hidden = true; overlay.innerHTML = ''; startMission(); return; }
    if (b.dataset.act === 'next') setLevel(level + 1); else setLevel(level, true);
  });

  renderBuddy();
  var start = 0;
  while (start < LEVELS.length - 1 && progress[start]) start++;
  setLevel(start);
  window.IK_HARDWARE = { total: LEVELS.length };
})();
