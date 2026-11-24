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
  function icon(name, label) {
    return '<svg viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="' + (label || name) + '">' + (SVG[name] || '') + '</svg>';
  }
  var NOMBRES = {
    monitor: 'Monitor', teclado: 'Teclado', mouse: 'Mouse', gabinete: 'Gabinete', bocinas: 'Bocinas', impresora: 'Impresora',
    microfono: 'Micrófono', camara: 'Cámara web', audifonos: 'Audífonos', ram: 'Memoria RAM', disco: 'Disco duro (SSD)',
    madre: 'Tarjeta madre', cpu: 'Procesador (CPU)', fuente: 'Fuente de poder', gpu: 'Tarjeta de video',
    navegador: 'Navegador de internet', videojuego: 'Videojuego', sistema: 'Sistema operativo', dibujo: 'Programa de dibujo'
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
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var bubble = $('hw-bubble'), play = $('hw-play'), buddyEl = $('hw-buddy'), overlay = $('hw-overlay');
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

  function setLevel(i) {
    if (!unlocked(i)) return;
    level = i; errors = 0;
    overlay.hidden = true; overlay.innerHTML = '';
    var L = LEVELS[i];
    $('hw-kicker').textContent = 'Nivel ' + (i + 1) + ' de ' + LEVELS.length;
    $('hw-title').textContent = L.name;
    app.setAttribute('data-tipo', L.type);
    renderLevels();
    say(L.intro);
    ({ tap: startTap, sort: startSort, match: startMatch, build: startBuild, quiz: startQuiz })[L.type](L);
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
    if (!state.queue.length) return win();
    $('hw-ask').innerHTML = 'Toca: <strong>' + esc(NOMBRES[state.queue[0][0]]) + '</strong>';
  }
  function tapPick(b) {
    if (!state.queue.length || state.done[b.dataset.id]) return;
    var want = state.queue[0];
    if (b.dataset.id === want[0]) {
      state.done[want[0]] = true;
      b.classList.add('is-ok'); b.disabled = true;
      b.querySelector('.hw-card-label').textContent = NOMBRES[want[0]];
      b.setAttribute('aria-label', NOMBRES[want[0]]);
      b.querySelector('svg').setAttribute('aria-label', NOMBRES[want[0]]);
      react('ok'); say(cheer() + ' ' + want[1]);
      state.queue.shift();
      setTimeout(nextTap, 300);
    } else {
      errors++; react('bad');
      b.classList.add('is-bad'); setTimeout(function () { b.classList.remove('is-bad'); }, 500);
      say('¡Ese no es! Busca: ' + NOMBRES[want[0]] + '. Intenta otra vez.');
    }
  }

  // ---------- Nivel tipo "clasifica" ----------
  function startSort(L) {
    state = { queue: shuffle(L.items), counts: {} };
    var html = '<div class="hw-sort"><div class="hw-current" id="hw-current" aria-live="polite"></div><div class="hw-bins">';
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
    if (!state.queue.length) { cur.innerHTML = ''; return win(); }
    var it = state.queue[0];
    cur.innerHTML = '<div class="hw-card is-big">' + icon(it[0], NOMBRES[it[0]]) + '<span class="hw-card-label">' + esc(NOMBRES[it[0]]) + '</span></div>';
    $('hw-left').textContent = 'Faltan ' + state.queue.length;
  }
  function sortPick(L, b) {
    if (!state.queue.length) return;
    var it = state.queue[0];
    if (b.dataset.bin === it[1]) {
      var mini = document.createElement('span');
      mini.className = 'hw-mini';
      mini.innerHTML = icon(it[0], NOMBRES[it[0]]);
      $('bin-' + it[1]).appendChild(mini);
      react('ok'); say(cheer() + ' ' + NOMBRES[it[0]] + ': ' + L.why[it[1]].charAt(0).toLowerCase() + L.why[it[1]].slice(1));
      state.queue.shift();
      nextSort();
    } else {
      errors++; react('bad');
      b.classList.add('is-bad'); setTimeout(function () { b.classList.remove('is-bad'); }, 500);
      say('Mmm… piensa otra vez: ' + (L.bins[0][0] === 'entrada' ? '¿le da información a la computadora o nos muestra algo?' : '¿se puede tocar o es un programa?'));
    }
  }

  // ---------- Nivel tipo "¿para qué sirve?" ----------
  function startMatch(L) {
    state = { queue: shuffle(L.items), all: L.items };
    play.innerHTML = '<div class="hw-match"><div class="hw-current" id="hw-current"></div><div class="hw-options" id="hw-options" role="group" aria-label="Opciones"></div><p class="hw-left" id="hw-left"></p></div>';
    nextMatch();
  }
  function nextMatch() {
    if (!state.queue.length) return win();
    var it = state.queue[0];
    $('hw-current').innerHTML = '<div class="hw-card is-big">' + icon(it[0], NOMBRES[it[0]]) + '<span class="hw-card-label">' + esc(NOMBRES[it[0]]) + '</span></div>';
    var others = shuffle(state.all.filter(function (x) { return x[0] !== it[0]; })).slice(0, 2);
    var opts = shuffle([it].concat(others));
    var box = $('hw-options');
    box.innerHTML = '';
    opts.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'hw-opt'; b.textContent = o[1];
      b.addEventListener('click', function () {
        if (o[0] === it[0]) {
          react('ok'); say(cheer() + ' ' + NOMBRES[it[0]] + ': ' + o[1].charAt(0).toLowerCase() + o[1].slice(1) + '.');
          b.classList.add('is-ok');
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
              setTimeout(win, 1200);
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
      setTimeout(win, 1300);
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
    var stars = errors <= 1 ? 3 : errors <= 3 ? 2 : 1;
    if ((progress[level] || 0) < stars) { progress[level] = stars; saveProgress(); }
    renderLevels();
    if (LEVELS[level].type !== 'quiz') sfx('win');
    var last = level === LEVELS.length - 1;
    var html = '<div class="overlay-card"><p class="overlay-title">' + (last ? '¡Terminaste Computación básica!' : '¡Nivel superado!') + '</p>' +
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
    if (b.dataset.act === 'next') setLevel(level + 1); else setLevel(level);
  });

  renderBuddy();
  var start = 0;
  while (start < LEVELS.length - 1 && progress[start]) start++;
  setLevel(start);
  window.IK_HARDWARE = { total: LEVELS.length };
})();
