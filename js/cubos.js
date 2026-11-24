/* Innovating Kids — "Mundo de Cubos": nivel en 3D (vista isométrica) para niños de 6 a 12 años.
   El niño arma instrucciones (avanzar, girar, poner y quitar bloques, repetir) para que Cubi llegue al diamante.
   8 niveles (~20 minutos) y un modo libre para construir. Sin librerías: se dibuja en un canvas 2D.
   Diseño original (inspirado en los juegos de construir con cubos). */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var canvas = $('cu-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var sfx = function (n) { if (window.IKAudio) window.IKAudio.play(n); };
  if (window.IKAudio) window.IKAudio.setTheme('parque');

  // ---------- Niveles (verificados con un simulador) ----------
  // h: alturas por renglón (0 = agua, 1 = pasto, 2+ = más alto). s: [x, z, dirección] (0 →, 1 ↓, 2 ←, 3 ↑). g: diamante.
  var A = ['a'], AG = ['a', 'L', 'R'], AGP = AG.concat(['p']), AGPQ = AGP.concat(['q']), TODO = AGPQ.concat(['r']);
  var LEVELS = [
    { name: 'Primeros pasos', goal: 'Lleva a Cubi hasta el diamante.', hint: 'Toca "Avanzar" tres veces y luego "¡A jugar!".',
      h: ['111111', '111111', '111111', '111111'], s: [0, 1, 0], g: [3, 1], blocks: A, best: 3 },
    { name: 'La vuelta', goal: 'El diamante está a la vuelta. ¡Gira cuando llegues a la esquina!', hint: 'Avanza 3, gira a la derecha y avanza 3 más.',
      h: ['11111', '11111', '11111', '11111', '11111'], s: [0, 0, 0], g: [3, 3], blocks: AG, best: 7 },
    { name: 'Escalones', goal: 'Sube los escalones hasta el diamante.', hint: 'Cubi puede subir un escalón a la vez solo con "Avanzar".',
      h: ['11234', '11111', '11111'], s: [0, 0, 0], g: [4, 0], blocks: AG, best: 4 },
    { name: 'El río', goal: 'Hay un río en el camino. ¡Construye un puente!', hint: 'Avanza, pon un bloque en el agua y sigue avanzando.',
      h: ['11011', '11011', '11011'], s: [0, 1, 0], g: [4, 1], blocks: AGP, best: 5 },
    { name: 'El muro', goal: 'Un muro muy alto tapa el camino. ¡Quita un bloque!', hint: 'Avanza, quita un bloque del muro y después avanza 3 veces.',
      h: ['11311', '11311', '11311'], s: [0, 1, 0], g: [4, 1], blocks: AGPQ, best: 5 },
    { name: 'Puente largo', goal: 'Un río muy ancho. Usa "Repetir" para no poner tantos bloques.', hint: 'Repetir 5 veces: poner bloque y avanzar. Al final, avanza una vez más.',
      h: ['1000001', '1000001', '1000001'], s: [0, 1, 0], g: [6, 1], blocks: TODO, best: 4 },
    { name: 'Escalera al cielo', goal: 'El diamante está en lo alto. ¡Construye una escalera!', hint: 'Avanza. Luego repite 2 veces: poner bloque y avanzar. Al final avanza otra vez.',
      h: ['11113', '11113', '11113'], s: [0, 1, 0], g: [4, 1], blocks: TODO, best: 5 },
    { name: 'Gran aventura', goal: '¡El gran reto! Cruza el río, gira y pasa por la montaña.', hint: 'Avanza, pon un puente, avanza 2, gira a la derecha, quita un bloque y avanza 2.',
      h: ['11011', '00030', '00010'], s: [0, 0, 0], g: [3, 2], blocks: TODO, best: 8 }
  ];
  var CMD = {
    a: { label: 'Avanzar', icon: '⬆', cls: 'c-move', say: 'avanzar' },
    L: { label: 'Girar izquierda', icon: '↺', cls: 'c-turn', say: 'girar a la izquierda' },
    R: { label: 'Girar derecha', icon: '↻', cls: 'c-turn', say: 'girar a la derecha' },
    p: { label: 'Poner bloque', icon: '▣', cls: 'c-put', say: 'poner bloque' },
    q: { label: 'Quitar bloque', icon: '⛏', cls: 'c-dig', say: 'quitar bloque' },
    r: { label: 'Repetir', icon: '⟳', cls: 'c-loop', container: true }
  };
  var DIR = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  var MAX = 20;

  // ---------- Progreso ----------
  var STORE = 'ik-cubos-v1';
  var TEACHER = /[?&]profe=1\b/.test(location.search);
  var progress = {};
  try { progress = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { progress = {}; }
  function saveProgress() {
    try { localStorage.setItem(STORE, JSON.stringify(progress)); } catch (e) { /* sin almacenamiento */ }
    document.dispatchEvent(new CustomEvent('ik:progreso', { detail: { juego: 'cubos', niveles: progress, total: LEVELS.length } }));
  }
  document.addEventListener('ik:progreso-remoto', function (e) {
    var remoto = (e.detail && e.detail.niveles) || {}, cambio = false, subir = false;
    Object.keys(remoto).forEach(function (k) { var v = +remoto[k] || 0; if (v > (progress[k] || 0)) { progress[k] = v; cambio = true; } });
    Object.keys(progress).forEach(function (k) { if ((progress[k] || 0) > (+remoto[k] || 0)) subir = true; });
    if (cambio) { try { localStorage.setItem(STORE, JSON.stringify(progress)); } catch (er) { /* sin almacenamiento */ } renderLevels(); }
    if (subir) saveProgress();
  });
  function unlocked(i) { return TEACHER || i === 0 || !!progress[i - 1]; }
  function freeUnlocked() { return TEACHER || !!progress[LEVELS.length - 1]; }

  // ---------- Mundo ----------
  // cols[z][x] = lista de tipos de bloque de abajo hacia arriba
  var world = null, level = 0, free = false;
  var COLORS = {
    pasto: { top: '#6CC24A', side: '#8B5A2B', dark: '#6B4220' },
    tierra: { top: '#9C6B3C', side: '#8B5A2B', dark: '#6B4220' },
    piedra: { top: '#B0B0B0', side: '#8E8E8E', dark: '#6E6E6E' },
    madera: { top: '#D9A35B', side: '#B97F3A', dark: '#8E5F28' },
    ladrillo: { top: '#D9614C', side: '#B84A37', dark: '#8F3527' },
    nieve: { top: '#FFFFFF', side: '#DDE6EE', dark: '#B8C5D1' },
    arena: { top: '#F1D48A', side: '#D9B867', dark: '#B8964A' }
  };
  function makeWorld(L) {
    var cols = L.h.map(function (row) {
      return row.split('').map(function (c) {
        var n = +c, col = [];
        for (var y = 0; y < n; y++) col.push(n >= 3 && y >= 1 ? 'piedra' : (y === n - 1 ? 'pasto' : 'tierra'));
        return col;
      });
    });
    return { cols: cols, W: cols[0].length, D: cols.length, p: { x: L.s[0], z: L.s[1], d: L.s[2] }, gem: L.g ? { x: L.g[0], z: L.g[1] } : null, won: false, failed: null, moves: 0 };
  }
  function freeWorld() {
    var cols = [];
    for (var z = 0; z < 10; z++) { var row = []; for (var x = 0; x < 10; x++) row.push(['tierra', 'pasto']); cols.push(row); }
    return { cols: cols, W: 10, D: 10, p: { x: 1, z: 1, d: 0 }, gem: null, won: false, failed: null, moves: 0 };
  }
  function hAt(x, z) { return world.cols[z][x].length; }
  function inside(x, z) { return x >= 0 && z >= 0 && x < world.W && z < world.D; }

  // ---------- Programa ----------
  var program = [], openRepeat = null, nextId = 1, running = false, timer = null;
  function node(t) { var n = { id: nextId++, t: t }; if (t === 'r') { n.n = 3; n.body = []; } return n; }
  function count(list) { var c = 0; (list || program).forEach(function (n) { c += 1 + (n.body ? count(n.body) : 0); }); return c; }
  function add(t) {
    if (running) return;
    if (count() >= MAX) { say('¡Tu programa ya está muy largo! Usa "Repetir".'); sfx('bad'); return; }
    var n = node(t);
    if (openRepeat && t !== 'r') openRepeat.body.push(n); else program.push(n);
    if (t === 'r') openRepeat = n;
    sfx('click');
    renderProgram();
  }
  function remove(id, list) {
    list = list || program;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) { if (openRepeat === list[i]) openRepeat = null; list.splice(i, 1); return true; }
      if (list[i].body && remove(id, list[i].body)) return true;
    }
    return false;
  }

  var progEl = $('cu-program'), palEl = $('cu-palette');
  function renderPalette() {
    palEl.innerHTML = '';
    var blocks = free ? [] : LEVELS[level].blocks;
    blocks.forEach(function (t) {
      var d = CMD[t], b = document.createElement('button');
      b.type = 'button'; b.className = 'cu-cmd ' + d.cls;
      b.innerHTML = '<span class="cu-ico" aria-hidden="true">' + d.icon + '</span><span>' + d.label + '</span>';
      b.addEventListener('click', function () { add(t); });
      palEl.appendChild(b);
    });
  }
  function chip(n) {
    var d = CMD[n.t];
    var li = document.createElement('li');
    li.className = 'cu-chip ' + d.cls + (n.t === 'r' ? ' is-loop' : '') + (openRepeat === n ? ' is-open' : '');
    li.dataset.id = n.id;
    var head = document.createElement('div');
    head.className = 'cu-chip-head';
    head.innerHTML = '<span class="cu-ico" aria-hidden="true">' + d.icon + '</span><span>' + d.label + '</span>';
    if (n.t === 'r') {
      var sel = document.createElement('select');
      sel.setAttribute('aria-label', 'Cuántas veces repetir');
      for (var k = 2; k <= 6; k++) { var o = document.createElement('option'); o.value = k; o.textContent = k + ' veces'; if (k === n.n) o.selected = true; sel.appendChild(o); }
      sel.addEventListener('change', function () { n.n = +sel.value; });
      head.appendChild(sel);
      var tog = document.createElement('button');
      tog.type = 'button'; tog.className = 'cu-open';
      tog.textContent = openRepeat === n ? 'Cerrar' : 'Agregar adentro';
      tog.setAttribute('aria-pressed', String(openRepeat === n));
      tog.addEventListener('click', function () { if (running) return; openRepeat = openRepeat === n ? null : n; renderProgram(); });
      head.appendChild(tog);
    }
    var del = document.createElement('button');
    del.type = 'button'; del.className = 'cu-del'; del.setAttribute('aria-label', 'Quitar ' + d.label); del.textContent = '×';
    del.addEventListener('click', function () { if (!running) { remove(n.id); renderProgram(); } });
    head.appendChild(del);
    li.appendChild(head);
    if (n.body) {
      var ul = document.createElement('ol');
      ul.className = 'cu-inner';
      if (!n.body.length) { var e = document.createElement('li'); e.className = 'cu-empty'; e.textContent = 'Toca instrucciones para meterlas aquí'; ul.appendChild(e); }
      n.body.forEach(function (c) { ul.appendChild(chip(c)); });
      li.appendChild(ul);
    }
    return li;
  }
  function renderProgram() {
    progEl.innerHTML = '';
    if (!program.length) {
      var e = document.createElement('li'); e.className = 'cu-empty'; e.textContent = 'Toca las instrucciones de arriba para armar tu programa.';
      progEl.appendChild(e);
    }
    program.forEach(function (n) { progEl.appendChild(chip(n)); });
    $('cu-count').textContent = count() + (count() === 1 ? ' instrucción' : ' instrucciones');
  }

  // ---------- Ejecutar ----------
  var anim = null, effects = [];
  function* exec(list) {
    for (var i = 0; i < list.length; i++) {
      var n = list[i];
      if (n.t === 'r') { for (var k = 0; k < n.n; k++) { yield { id: n.id, wait: true }; yield* exec(n.body); if (world.failed || world.won) return; } }
      else yield { id: n.id, act: n.t };
      if (world.failed || world.won) return;
    }
  }
  function act(t) {
    var p = world.p, nx = p.x + DIR[p.d][0], nz = p.z + DIR[p.d][1];
    if (t === 'L') { p.d = (p.d + 3) % 4; sfx('click'); return; }
    if (t === 'R') { p.d = (p.d + 1) % 4; sfx('click'); return; }
    if (!inside(nx, nz)) { world.failed = '¡Ups! Ahí se acaba el mundo. Revisa hacia dónde mira Cubi.'; bump(nx, nz); return; }
    var h = hAt(p.x, p.z), h2 = hAt(nx, nz);
    if (t === 'a') {
      if (h2 === 0) { world.failed = '¡Splash! Cubi cayó al agua. Pon un bloque para hacer un puente.'; effects.push({ k: 'splash', x: nx, z: nz, t0: performance.now() }); sfx('lose'); return; }
      if (h2 > h + 1) { world.failed = '¡Está muy alto! Cubi solo sube un bloque. Quita un bloque primero.'; bump(nx, nz); return; }
      anim = { fx: p.x, fz: p.z, fh: h, tx: nx, tz: nz, th: h2, t0: performance.now(), dur: stepMs() * 0.8 };
      p.x = nx; p.z = nz; world.moves++;
      sfx('step');
      if (world.gem && nx === world.gem.x && nz === world.gem.z) { world.won = true; effects.push({ k: 'gem', x: nx, z: nz, t0: performance.now() }); sfx('item'); }
    } else if (t === 'p') {
      if (h2 > h) { world.failed = 'Ahí ya hay un bloque. Pon bloques donde esté más bajo que Cubi.'; bump(nx, nz); return; }
      world.cols[nz][nx].push('madera');
      effects.push({ k: 'put', x: nx, z: nz, t0: performance.now() }); sfx('click');
    } else if (t === 'q') {
      if (h2 <= h) { world.failed = 'Enfrente no hay un bloque que quitar. Quita bloques más altos que Cubi.'; bump(nx, nz); return; }
      world.cols[nz][nx].pop();
      effects.push({ k: 'dig', x: nx, z: nz, t0: performance.now() }); sfx('hit');
    }
  }
  function bump(x, z) { effects.push({ k: 'bump', x: x, z: z, t0: performance.now() }); sfx('bump'); }
  var fast = false;
  function stepMs() { return fast ? 260 : 560; }
  function run() {
    if (running) return;
    if (!program.length) { say('Primero agrega instrucciones a tu programa.'); sfx('bad'); return; }
    hideOverlay(); reset(true);
    running = true; openRepeat = null; renderProgram(); setRunning(true);
    say('¡Cubi está siguiendo tus instrucciones!');
    var gen = exec(program);
    (function tick() {
      if (!running) return;
      var r = gen.next();
      clearHi();
      if (r.done || world.failed || world.won) return finish();
      hi(r.value.id);
      if (r.value.act) act(r.value.act);
      if (world.failed || world.won) { timer = setTimeout(finish, stepMs()); return; }
      timer = setTimeout(tick, r.value.wait ? stepMs() / 3 : stepMs());
    })();
  }
  function setRunning(on) { $('cu-run').disabled = on; document.body.classList.toggle('cu-running', on); }
  function hi(id) { var el = progEl.querySelector('[data-id="' + id + '"] > .cu-chip-head'); if (el) el.classList.add('is-running'); }
  function clearHi() { progEl.querySelectorAll('.is-running').forEach(function (e) { e.classList.remove('is-running'); }); }
  function finish() {
    running = false; setRunning(false); clearHi();
    if (world.won) {
      var used = count(), best = LEVELS[level].best;
      var stars = used <= best ? 3 : used <= best + 3 ? 2 : 1;
      if ((progress[level] || 0) < stars) { progress[level] = stars; saveProgress(); }
      renderLevels();
      sfx('win');
      var msg = stars === 3 ? '¡Perfecto! Lo lograste con ' + used + ' instrucciones.' : 'Usaste ' + used + ' instrucciones. ¿Puedes hacerlo con ' + best + '?';
      say('¡Lo lograste! ' + msg);
      showOverlay(true, msg, stars);
    } else {
      var m = world.failed || 'Cubi no llegó al diamante. ¡Agrega más instrucciones!';
      if (!world.failed) sfx('lose');
      say(m); showOverlay(false, m);
    }
  }
  function stop() {
    running = false; clearTimeout(timer); setRunning(false); clearHi(); hideOverlay(); reset(true);
    say('Listo. Cambia tu programa y vuelve a intentarlo.');
  }
  function reset(keepProgram) {
    world = free ? world : makeWorld(LEVELS[level]);
    anim = null; effects = [];
    if (!keepProgram) { program = []; openRepeat = null; renderProgram(); }
    draw();
  }

  // ---------- Resultado ----------
  var overlay = $('cu-overlay');
  function showOverlay(won, msg, stars) {
    var last = level === LEVELS.length - 1;
    var html = '<div class="overlay-card"><p class="overlay-title">' + (won ? (last ? '¡Completaste el Mundo de Cubos!' : '¡Nivel superado!') : '¡Casi!') + '</p>';
    if (won) { html += '<p class="overlay-stars" aria-label="' + stars + ' de 3 estrellas">'; for (var i = 0; i < 3; i++) html += '<span class="' + (i < stars ? 'on' : '') + '" aria-hidden="true">★</span>'; html += '</p>'; }
    html += '<p class="overlay-msg"></p><div class="overlay-actions">';
    if (won && !last) html += '<button type="button" class="btn btn-yellow" data-act="next">Siguiente nivel</button>';
    if (won && last) html += '<button type="button" class="btn btn-yellow" data-act="free">¡Construir libre!</button>';
    html += '<button type="button" class="btn btn-ghost-light" data-act="retry">' + (won ? 'Jugar otra vez' : 'Intentar de nuevo') + '</button></div></div>';
    overlay.innerHTML = html;
    overlay.querySelector('.overlay-msg').textContent = msg;
    overlay.hidden = false;
    overlay.querySelector('button').focus({ preventScroll: true });
  }
  function hideOverlay() { overlay.hidden = true; overlay.innerHTML = ''; }
  overlay.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'next') setLevel(level + 1);
    else if (b.dataset.act === 'free') setFree();
    else stop();
  });

  // ---------- Niveles ----------
  var ICON_LOCK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  function renderLevels() {
    var ol = $('cu-levels');
    ol.innerHTML = '';
    LEVELS.concat([{ name: 'Construir libre', free: true }]).forEach(function (L, i) {
      var li = document.createElement('li'), b = document.createElement('button');
      var lock = L.free ? !freeUnlocked() : !unlocked(i);
      var cur = L.free ? free : (!free && i === level);
      b.type = 'button';
      b.className = 'lvl' + (cur ? ' is-current' : '') + (!L.free && progress[i] ? ' is-done' : '') + (lock ? ' is-locked' : '') + (L.free ? ' cu-free' : '');
      b.disabled = lock;
      var st = '';
      if (!L.free && progress[i]) for (var k = 0; k < 3; k++) st += '<i class="' + (k < progress[i] ? 'on' : '') + '"></i>';
      b.innerHTML = '<span class="lvl-num">' + (lock ? ICON_LOCK : (L.free ? '★' : i + 1)) + '</span><span class="lvl-stars" aria-hidden="true">' + st + '</span>';
      b.setAttribute('aria-label', (L.free ? 'Construir libre' : 'Nivel ' + (i + 1) + ': ' + L.name) + (lock ? ' (bloqueado)' : ''));
      b.title = L.free ? 'Construir libre' : 'Nivel ' + (i + 1) + ': ' + L.name;
      if (cur) b.setAttribute('aria-current', 'step');
      b.addEventListener('click', function () { if (running) return; if (L.free) setFree(); else setLevel(i); });
      li.appendChild(b); ol.appendChild(li);
    });
  }
  function setLevel(i) {
    if (!unlocked(i)) return;
    stopSilently();
    free = false; level = i;
    document.querySelector('.cu-app').classList.remove('is-free');
    var L = LEVELS[i];
    $('cu-kicker').textContent = 'Nivel ' + (i + 1) + ' de ' + LEVELS.length + ' · unos 20 minutos en total';
    $('cu-title').textContent = L.name;
    $('cu-goal').textContent = L.goal;
    $('cu-hint').textContent = L.hint;
    $('cu-hint-box').open = false;
    world = makeWorld(L);
    renderLevels(); renderPalette(); reset(false); resize();
    say('Arma tu programa y toca "¡A jugar!".');
  }
  function setFree() {
    if (!freeUnlocked()) return;
    stopSilently();
    free = true;
    document.querySelector('.cu-app').classList.add('is-free');
    $('cu-kicker').textContent = 'Modo libre';
    $('cu-title').textContent = 'Construir libre';
    $('cu-goal').textContent = 'Toca el suelo para poner o quitar bloques. Elige el material y construye lo que quieras: una casa, una torre, un castillo…';
    world = freeWorld();
    renderLevels(); renderPalette(); program = []; renderProgram(); resize();
    say('¡Construye lo que imagines!');
  }
  function stopSilently() { running = false; clearTimeout(timer); setRunning(false); hideOverlay(); }
  function say(t) { $('cu-status').textContent = t; }

  // ---------- Leer en voz alta (para quien todavía lee despacio) ----------
  $('cu-listen').addEventListener('click', function () {
    if (!('speechSynthesis' in window)) { say('Tu navegador no puede leer en voz alta.'); return; }
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance($('cu-title').textContent + '. ' + $('cu-goal').textContent);
    u.lang = 'es-MX'; u.rate = 0.95;
    var v = speechSynthesis.getVoices().filter(function (x) { return /^es/i.test(x.lang); });
    var mx = v.filter(function (x) { return /MX|419|US/i.test(x.lang); })[0] || v[0];
    if (mx) u.voice = mx;
    speechSynthesis.speak(u);
  });

  // ---------- Dibujo isométrico ----------
  var rot = 0, S = 40, ox = 0, oy = 0, dpr = 1, tops = [];
  function rotXZ(x, z) {
    var W = world.W, D = world.D;
    if (rot === 0) return [x, z];
    if (rot === 1) return [D - 1 - z, x];
    if (rot === 2) return [W - 1 - x, D - 1 - z];
    return [z, W - 1 - x];
  }
  function rotDims() { return rot % 2 ? [world.D, world.W] : [world.W, world.D]; }
  function proj(rx, rz, y) { return [ox + (rx - rz) * S / 2, oy + (rx + rz) * S / 4 - y * S / 2]; }
  function resize() {
    var wrap = canvas.parentNode, w = wrap.clientWidth;
    var dims = rotDims(), sum = Math.max(dims[0] + dims[1], 8);
    S = Math.max(24, Math.min(80, Math.floor(w / (sum / 2) * 0.92)));
    var h = Math.round(sum * S / 4 + 6 * S / 2 + S);
    dpr = window.devicePixelRatio || 1;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ox = w / 2 - (dims[0] - dims[1]) * S / 4;
    oy = 5.5 * S / 2 + S * 0.4;
    draw();
  }
  function poly(pts, fill, stroke) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
  }
  // Cubo de lado "k" (1 = bloque completo) centrado en la casilla (rx, rz), con base en la altura y
  function cube(rx, rz, y, c, k, hgt) {
    k = k || 1; hgt = hgt || k;
    var m = (1 - k) / 2;
    var a = proj(rx + m, rz + m, y + hgt), b = proj(rx + 1 - m, rz + m, y + hgt), cc = proj(rx + 1 - m, rz + 1 - m, y + hgt), d = proj(rx + m, rz + 1 - m, y + hgt);
    var b0 = proj(rx + 1 - m, rz + m, y), c0 = proj(rx + 1 - m, rz + 1 - m, y), d0 = proj(rx + m, rz + 1 - m, y);
    var ln = 'rgba(0,0,0,.18)';
    poly([d, cc, c0, d0], c.side, ln);   // cara izquierda (+z)
    poly([cc, b, b0, c0], c.dark, ln);   // cara derecha (+x)
    poly([a, b, cc, d], c.top, ln);      // arriba
    return [a, b, cc, d];
  }
  function draw() {
    if (!world) return;
    var now = performance.now();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var w = canvas.width / dpr, h = canvas.height / dpr;
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#8FD3FF'); g.addColorStop(1, '#DFF4FF');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // nubes
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    for (var c = 0; c < 3; c++) {
      var cx = ((now / 80 + c * 260) % (w + 160)) - 80, cy = 30 + c * 22;
      ctx.fillRect(cx, cy, 70, 14); ctx.fillRect(cx + 14, cy - 8, 40, 10);
    }
    tops = [];
    var dims = rotDims(), cells = [];
    for (var z = 0; z < world.D; z++) for (var x = 0; x < world.W; x++) { var r = rotXZ(x, z); cells.push({ x: x, z: z, rx: r[0], rz: r[1] }); }
    cells.sort(function (a, b) { return (a.rx + a.rz) - (b.rx + b.rz) || a.rx - b.rx; });
    // en qué casilla se dibuja a Cubi (durante el paso, en la más cercana al frente)
    var p = world.p, pr = rotXZ(p.x, p.z), drawAt = pr;
    var px = pr[0], pz = pr[1], ph = hAt(p.x, p.z), t = 1;
    if (anim) {
      t = Math.min(1, (now - anim.t0) / anim.dur);
      var fr = rotXZ(anim.fx, anim.fz), to = rotXZ(anim.tx, anim.tz);
      var e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      px = fr[0] + (to[0] - fr[0]) * e; pz = fr[1] + (to[1] - fr[1]) * e;
      ph = anim.fh + (anim.th - anim.fh) * e + Math.sin(Math.PI * t) * 0.35;
      drawAt = (fr[0] + fr[1] > to[0] + to[1]) ? fr : to;
      if (t >= 1) anim = null;
    }
    var front = { x: p.x + DIR[p.d][0], z: p.z + DIR[p.d][1] };
    cells.forEach(function (cl) {
      var col = world.cols[cl.z][cl.x];
      if (!col.length) { // agua
        var wv = Math.sin(now / 500 + cl.x + cl.z) * 0.04;
        var wa = proj(cl.rx, cl.rz, 0.7 + wv), wb = proj(cl.rx + 1, cl.rz, 0.7 + wv), wc = proj(cl.rx + 1, cl.rz + 1, 0.7 + wv), wd = proj(cl.rx, cl.rz + 1, 0.7 + wv);
        poly([wa, wb, wc, wd], 'rgba(41,128,214,.88)', 'rgba(255,255,255,.25)');
        ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.5;
        var mid = proj(cl.rx + 0.5, cl.rz + 0.5, 0.7 + wv);
        ctx.beginPath(); ctx.moveTo(mid[0] - S * 0.15, mid[1]); ctx.lineTo(mid[0] + S * 0.1, mid[1]); ctx.stroke();
        tops.push({ x: cl.x, z: cl.z, pts: [wa, wb, wc, wd] });
      }
      for (var y = 0; y < col.length; y++) {
        var tp = cube(cl.rx, cl.rz, y, COLORS[col[y]] || COLORS.tierra);
        if (y === col.length - 1) {
          var g0 = proj(cl.rx + 1, cl.rz, 0), g1 = proj(cl.rx + 1, cl.rz + 1, 0), g2 = proj(cl.rx, cl.rz + 1, 0);
          tops.push({ x: cl.x, z: cl.z, pts: [tp[0], tp[1], g0, g1, g2, tp[3]] }); // silueta completa de la columna
        }
        if (col[y] === 'pasto' && y === col.length - 1) { // pasto que cuelga
          var q = proj(cl.rx, cl.rz + 1, y + 1), q2 = proj(cl.rx + 1, cl.rz + 1, y + 1), q3 = proj(cl.rx + 1, cl.rz, y + 1);
          ctx.strokeStyle = '#4FA531'; ctx.lineWidth = Math.max(2, S * 0.07);
          ctx.beginPath(); ctx.moveTo(q[0], q[1] + 1); ctx.lineTo(q2[0], q2[1] + 1); ctx.lineTo(q3[0], q3[1] + 1); ctx.stroke();
        }
      }
      var hh = col.length;
      // casilla de enfrente
      if (!free && !running && cl.x === front.x && cl.z === front.z) {
        var fa = proj(cl.rx + 0.1, cl.rz + 0.1, hh || 0.7), fb = proj(cl.rx + 0.9, cl.rz + 0.1, hh || 0.7), fc = proj(cl.rx + 0.9, cl.rz + 0.9, hh || 0.7), fd = proj(cl.rx + 0.1, cl.rz + 0.9, hh || 0.7);
        ctx.setLineDash([5, 4]); ctx.strokeStyle = '#FFD23F'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(fa[0], fa[1]); ctx.lineTo(fb[0], fb[1]); ctx.lineTo(fc[0], fc[1]); ctx.lineTo(fd[0], fd[1]); ctx.closePath(); ctx.stroke();
        ctx.setLineDash([]);
      }
      // diamante
      if (world.gem && cl.x === world.gem.x && cl.z === world.gem.z && !world.won) drawGem(cl.rx, cl.rz, hh, now);
      // Cubi
      if (!free && cl.rx === drawAt[0] && cl.rz === drawAt[1]) drawCubi(px, pz, ph, now);
    });
    // efectos
    effects = effects.filter(function (f) { return now - f.t0 < 700; });
    effects.forEach(function (f) {
      var r = rotXZ(f.x, f.z), k = (now - f.t0) / 700;
      var hh = inside(f.x, f.z) ? hAt(f.x, f.z) : 1;
      var c0 = proj(r[0] + 0.5, r[1] + 0.5, hh + 0.3);
      ctx.save(); ctx.globalAlpha = 1 - k;
      if (f.k === 'gem' || f.k === 'put') {
        ctx.fillStyle = f.k === 'gem' ? '#7FF0FF' : '#FFE082';
        for (var i = 0; i < 8; i++) { var a = i / 8 * Math.PI * 2; ctx.fillRect(c0[0] + Math.cos(a) * S * 0.6 * k - 3, c0[1] + Math.sin(a) * S * 0.4 * k - 3, 6, 6); }
      } else if (f.k === 'dig') {
        ctx.fillStyle = '#8E8E8E';
        for (var j = 0; j < 6; j++) ctx.fillRect(c0[0] + (j - 3) * S * 0.12, c0[1] + k * S * 0.6 - j % 2 * 6, 6, 6);
      } else if (f.k === 'splash') {
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(c0[0], c0[1] + S * 0.2, S * 0.5 * k + 4, S * 0.25 * k + 2, 0, 0, 7); ctx.stroke();
      } else if (f.k === 'bump') {
        ctx.strokeStyle = '#FF3B30'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(c0[0] - 10, c0[1] - 10); ctx.lineTo(c0[0] + 10, c0[1] + 10); ctx.moveTo(c0[0] + 10, c0[1] - 10); ctx.lineTo(c0[0] - 10, c0[1] + 10); ctx.stroke();
      }
      ctx.restore();
    });
  }
  function drawGem(rx, rz, h, now) {
    var c = proj(rx + 0.5, rz + 0.5, h + 0.75 + Math.sin(now / 300) * 0.08), s = S * 0.22;
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    var sh = proj(rx + 0.5, rz + 0.5, h); ctx.beginPath(); ctx.ellipse(sh[0], sh[1], s * 0.9, s * 0.4, 0, 0, 7); ctx.fill();
    poly([[c[0], c[1] - s * 1.3], [c[0] + s, c[1]], [c[0], c[1] + s * 1.1], [c[0] - s, c[1]]], '#4DD0E1', '#00838F');
    poly([[c[0], c[1] - s * 1.3], [c[0] + s, c[1]], [c[0], c[1]]], '#B2EBF2');
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(c[0] - s * 0.45, c[1] - s * 0.5, 3, 3);
  }
  // Cubi: robot de cubos (original)
  function drawCubi(rx, rz, h, now) {
    var bob = anim ? 0 : Math.sin(now / 350) * 0.03;
    var dirR = rotDir(world.p.d);
    var hurt = !!world.failed;
    var body = { top: hurt ? '#FF8A80' : '#26C6DA', side: hurt ? '#E57373' : '#00ACC1', dark: hurt ? '#C62828' : '#00838F' };
    var head = { top: '#FFE0B2', side: '#F2C29B', dark: '#D9A27A' };
    var legs = { top: '#3949AB', side: '#303F9F', dark: '#1A237E' };
    // sombra
    ctx.fillStyle = 'rgba(0,0,0,.2)';
    var sh = proj(rx + 0.5, rz + 0.5, Math.floor(h + 0.001)); ctx.beginPath(); ctx.ellipse(sh[0], sh[1], S * 0.22, S * 0.11, 0, 0, 7); ctx.fill();
    cube(rx, rz, h + bob, legs, 0.42, 0.22);
    cube(rx, rz, h + 0.22 + bob, body, 0.5, 0.34);
    var top = cube(rx, rz, h + 0.56 + bob, head, 0.46, 0.36);
    // ojos en la cara que mira al frente (si se ve)
    var y0 = h + 0.56 + bob, m = 0.27;
    function eyes(p1, p2) {
      ctx.fillStyle = '#1B1B1B';
      [0.32, 0.68].forEach(function (k) {
        var ex = p1[0] + (p2[0] - p1[0]) * k, ey = p1[1] + (p2[1] - p1[1]) * k;
        ctx.fillRect(ex - 2.5, ey - 3, 5, 6);
      });
    }
    if (dirR === 0) eyes(proj(rx + 1 - m, rz + m, y0 + 0.2), proj(rx + 1 - m, rz + 1 - m, y0 + 0.2));
    else if (dirR === 1) eyes(proj(rx + m, rz + 1 - m, y0 + 0.2), proj(rx + 1 - m, rz + 1 - m, y0 + 0.2));
    // antena
    var tc = [(top[0][0] + top[2][0]) / 2, (top[0][1] + top[2][1]) / 2];
    ctx.strokeStyle = '#455A64'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(tc[0], tc[1]); ctx.lineTo(tc[0], tc[1] - S * 0.18); ctx.stroke();
    ctx.fillStyle = '#FFD23F'; ctx.beginPath(); ctx.arc(tc[0], tc[1] - S * 0.2, S * 0.05, 0, 7); ctx.fill();
    // flecha de dirección sobre la cabeza
    var dv = [[1, 0], [0, 1], [-1, 0], [0, -1]][dirR];
    var a0 = proj(rx + 0.5, rz + 0.5, y0 + 0.75), a1 = proj(rx + 0.5 + dv[0] * 0.45, rz + 0.5 + dv[1] * 0.45, y0 + 0.75);
    ctx.strokeStyle = '#FFD23F'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a1[0], a1[1]); ctx.stroke();
    var ang = Math.atan2(a1[1] - a0[1], a1[0] - a0[0]);
    ctx.fillStyle = '#FFD23F'; ctx.beginPath();
    ctx.moveTo(a1[0] + Math.cos(ang) * 6, a1[1] + Math.sin(ang) * 6);
    ctx.lineTo(a1[0] + Math.cos(ang + 2.4) * 7, a1[1] + Math.sin(ang + 2.4) * 7);
    ctx.lineTo(a1[0] + Math.cos(ang - 2.4) * 7, a1[1] + Math.sin(ang - 2.4) * 7);
    ctx.closePath(); ctx.fill();
  }
  function rotDir(d) { return (d + rot) % 4; } // girar la vista 90° cambia la dirección en pantalla

  // ---------- Modo libre: tocar para construir ----------
  var tool = 'poner', material = 'pasto';
  function pointIn(pt, pts) {
    var inside = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      var xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
      if (((yi > pt[1]) !== (yj > pt[1])) && (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }
  canvas.addEventListener('pointerdown', function (e) {
    if (!free) return;
    var r = canvas.getBoundingClientRect(), pt = [e.clientX - r.left, e.clientY - r.top];
    for (var i = tops.length - 1; i >= 0; i--) {
      if (pointIn(pt, tops[i].pts)) {
        var col = world.cols[tops[i].z][tops[i].x];
        if (tool === 'poner' && col.length < 6) { col.push(material); sfx('click'); }
        else if (tool === 'quitar' && col.length > 0) { col.pop(); sfx('hit'); }
        else sfx('bad');
        draw();
        return;
      }
    }
  });
  document.querySelectorAll('[data-cu-tool]').forEach(function (b) {
    b.addEventListener('click', function () {
      tool = b.dataset.cuTool;
      document.querySelectorAll('[data-cu-tool]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    });
  });
  var matBox = $('cu-materials');
  Object.keys(COLORS).filter(function (k) { return k !== 'tierra'; }).forEach(function (k) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'cu-mat'; b.title = k; b.setAttribute('aria-label', 'Material: ' + k);
    b.setAttribute('aria-pressed', String(k === material));
    b.style.setProperty('--m-top', COLORS[k].top); b.style.setProperty('--m-side', COLORS[k].side);
    b.addEventListener('click', function () {
      material = k; tool = 'poner';
      matBox.querySelectorAll('.cu-mat').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      document.querySelectorAll('[data-cu-tool]').forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.cuTool === 'poner')); });
    });
    matBox.appendChild(b);
  });
  $('cu-clear-free').addEventListener('click', function () { world = freeWorld(); draw(); sfx('click'); });

  // ---------- Controles ----------
  $('cu-run').addEventListener('click', run);
  $('cu-reset').addEventListener('click', stop);
  $('cu-clear').addEventListener('click', function () { if (!running) { program = []; openRepeat = null; renderProgram(); say('Programa borrado.'); } });
  $('cu-speed').addEventListener('click', function () { fast = !fast; this.setAttribute('aria-pressed', String(fast)); $('cu-speed-label').textContent = fast ? 'Rápido' : 'Normal'; });
  $('cu-rot-l').addEventListener('click', function () { rot = (rot + 3) % 4; resize(); sfx('click'); });
  $('cu-rot-r').addEventListener('click', function () { rot = (rot + 1) % 4; resize(); sfx('click'); });
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 120); });
  var last = 0;
  (function frame(now) { requestAnimationFrame(frame); if (document.hidden || now - last < 33) return; last = now; draw(); })(0);

  var start = 0;
  while (start < LEVELS.length - 1 && progress[start]) start++;
  setLevel(start);
  resize();
})();
