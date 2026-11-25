/* Innovating Kids — Tutor virtual de las clases con bloques y código (Profe Rex, Lumi…).
   Los textos y nombres salen de window.IK_BLOQUES_CONFIG.tutor (ver js/dino-niveles.js o js/criaturas-niveles.js).
   Reacciona en tiempo real a lo que hace el alumno (escucha los eventos "ik:bloques" de js/bloques.js):
   presenta cada misión, da pistas si pasa tiempo sin avanzar, explica los errores y celebra.
   Es un tutor con reglas (no usa inteligencia artificial ni envía datos). También agrega el
   editor de código de las misiones 6 a 9 y el reloj de la clase de 45 minutos. */
(function () {
  'use strict';
  var API = window.IKBloques, CFG = window.IK_BLOQUES_CONFIG;
  var T = Object.assign({
    nombre: 'Profe Rex', sprite: 'profeRex', alumno: 'guardián', heroe: 'Rexi', enemigo: 'raptor', item: 'huevo', items: 'huevos', meta: 'nido',
    accion: 'rugir', obstaculo: 'una roca', emoji: '🦖', sonido: 'roar',
    vivas: ['¡RAAAR de alegría! ¡Lo hiciste perfecto!', '¡Increíble, guardián! ¡Tres estrellas!', '¡Eres un genio del Jurásico!'],
    final: '¡Completaste la clase! Gracias por tu ayuda, guardián.',
    code: { attack: 'rugir', ifEnemy: 'hay_raptor_enfrente', untilGoal: 'en_el_nido' }
  }, (CFG && CFG.tutor) || {});
  var zone = document.querySelector('.gm-mapzone'), app = document.querySelector('.gm-app');
  if (!API || !CFG || !zone || !app) return;
  var sfx = function (n) { if (window.IKAudio) window.IKAudio.play(n); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ---------- Profe Rex ----------
  var tutor = document.createElement('div');
  tutor.className = 'dt-tutor';
  tutor.innerHTML = '<div class="dt-avatar" id="dt-avatar" aria-hidden="true"></div>' +
    '<div class="dt-bubble"><p class="dt-name">' + T.nombre + '</p><p class="dt-text" id="dt-text" aria-live="polite"></p>' +
    '<div class="dt-actions"><button type="button" class="dt-btn" id="dt-help">¿Me ayudas?</button>' +
    '<button type="button" class="dt-btn" id="dt-voice" aria-pressed="false">🔊 Voz: no</button></div></div>';
  zone.insertBefore(tutor, zone.firstChild);
  var avatar = document.getElementById('dt-avatar'), textEl = document.getElementById('dt-text');
  if (window.IKSprites) avatar.appendChild(window.IKSprites.canvasOf(T.sprite, 72));

  var voice = false;
  try { voice = localStorage.getItem('dino-voz') === '1'; } catch (e) { /* sin almacenamiento */ }
  function paintVoice() { var b = document.getElementById('dt-voice'); b.setAttribute('aria-pressed', String(voice)); b.textContent = '🔊 Voz: ' + (voice ? 'sí' : 'no'); }
  paintVoice();
  document.getElementById('dt-voice').addEventListener('click', function () {
    voice = !voice; paintVoice();
    try { localStorage.setItem('dino-voz', voice ? '1' : '0'); } catch (e) { /* sin almacenamiento */ }
    if (voice) speak(textEl.textContent); else if ('speechSynthesis' in window) speechSynthesis.cancel();
  });
  function speak(t) {
    if (!voice || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(t.replace(/[_()#:]/g, ' '));
    u.lang = 'es-MX'; u.rate = 1; u.pitch = 1.15;
    var vs = speechSynthesis.getVoices().filter(function (v) { return /^es/i.test(v.lang); });
    var v = vs.filter(function (x) { return /MX|419|US/i.test(x.lang); })[0] || vs[0];
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }
  var typing = null;
  function say(t, mood) {
    clearInterval(typing);
    tutor.className = 'dt-tutor is-' + (mood || 'talk');
    void avatar.offsetWidth;
    if (reduce) { textEl.textContent = t; } else {
      var i = 0; textEl.textContent = '';
      typing = setInterval(function () { i += 2; textEl.textContent = t.slice(0, i); if (i >= t.length) clearInterval(typing); }, 22);
    }
    speak(t);
  }

  // ---------- Reloj de la clase (45 minutos) ----------
  var clock = document.createElement('p');
  clock.className = 'dt-clock';
  var title = document.querySelector('.gm-title');
  if (title) title.appendChild(clock);
  var start = null, said = {};
  try { start = +sessionStorage.getItem('dino-inicio') || null; } catch (e) { /* sin almacenamiento */ }
  function tickClock() {
    if (!start) { clock.textContent = '⏱ Clase de 45 minutos'; return; }
    var m = Math.floor((Date.now() - start) / 60000);
    clock.textContent = '⏱ ' + Math.min(m, 99) + ' de 45 min';
    var lv = API.level();
    [[15, '¡Llevamos 15 minutos de clase! Vas muy bien, ' + T.alumno + '.'], [30, '¡30 minutos! Ya eres casi un experto en programación.'],
      [40, 'Quedan 5 minutos de clase. ¡Vamos por la misión que sigue!']].forEach(function (p) {
      if (m >= p[0] && !said[p[0]] && !API.isRunning()) { said[p[0]] = true; if (lv.index < lv.total - 1 || !lv.progress[lv.index]) say(p[1], 'happy'); }
    });
  }
  setInterval(tickClock, 15000);
  function startClock() {
    if (start) return;
    start = Date.now();
    try { sessionStorage.setItem('dino-inicio', String(start)); } catch (e) { /* sin almacenamiento */ }
    tickClock();
  }
  tickClock();

  // ---------- Editor de código (misiones 6 a 9) ----------
  var editor = document.querySelector('.gm-editor');
  var panel = document.createElement('div');
  panel.className = 'dt-code';
  panel.innerHTML = '<div class="ws-head"><h3>Tu código (Python)</h3><button class="ws-clear" type="button" id="dt-reset">Empezar de nuevo</button></div>' +
    '<div class="dt-chips" id="dt-chips" role="group" aria-label="Escribir instrucción"></div>' +
    '<div class="dt-ed"><pre class="dt-lines" id="dt-lines" aria-hidden="true"></pre>' +
    '<textarea id="dt-src" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="Editor de código. Escribe una instrucción por renglón."></textarea></div>' +
    '<p class="dt-err" id="dt-err" role="alert" hidden></p>' +
    '<div class="gm-run dt-run"><button class="gm-btn-run" type="button" id="dt-run"><svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg><span>Ejecutar</span></button></div>';
  if (editor) editor.appendChild(panel);
  document.getElementById('dt-run').addEventListener('click', function () { API.run(); });
  var src = document.getElementById('dt-src'), linesEl = document.getElementById('dt-lines'), errEl = document.getElementById('dt-err');
  var CHIPS = {
    right: 'mover_derecha()', left: 'mover_izquierda()', up: 'mover_arriba()', down: 'mover_abajo()', attack: T.code.attack + '()',
    repeat: 'for i in range(3):', ifEnemy: 'if ' + T.code.ifEnemy + '():', untilGoal: 'while not ' + T.code.untilGoal + '():', ifPath: "if hay_camino('abajo'):"
  };
  function renderChips(L) {
    var box = document.getElementById('dt-chips');
    box.innerHTML = '';
    var list = L.blocks.filter(function (t) { return CHIPS[t]; }).map(function (t) { return CHIPS[t]; });
    if (L.blocks.indexOf('ifPath') > -1) list.push('else:');
    list.push('⇥ sangría');
    list.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'dt-chip'; b.textContent = c;
      b.addEventListener('click', function () { insert(c); });
      box.appendChild(b);
    });
  }
  function insert(c) {
    var s = src.selectionStart, e = src.selectionEnd, v = src.value;
    if (c === '⇥ sangría') {
      var ls = v.lastIndexOf('\n', s - 1) + 1;
      src.value = v.slice(0, ls) + '    ' + v.slice(ls);
      src.selectionStart = src.selectionEnd = s + 4;
    } else {
      var lineStart = v.lastIndexOf('\n', s - 1) + 1, cur = v.slice(lineStart, s);
      var ind = (cur.match(/^\s*/) || [''])[0];
      var prevLine = v.slice(0, lineStart).replace(/\n$/, '').split('\n').pop() || '';
      if (cur.trim() === '') {
        if (!ind) { ind = (prevLine.match(/^\s*/) || [''])[0]; if (/:\s*$/.test(prevLine)) ind += '    '; }
        if (c === 'else:' && ind.length >= 4) ind = ind.slice(4);
        src.value = v.slice(0, lineStart) + ind + c + '\n' + v.slice(e);
        src.selectionStart = src.selectionEnd = lineStart + ind.length + c.length + 1;
      } else {
        var nInd = ind + (/:\s*$/.test(cur) ? '    ' : '');
        src.value = v.slice(0, e) + '\n' + nInd + c + v.slice(e);
        src.selectionStart = src.selectionEnd = e + 1 + nInd.length + c.length;
      }
    }
    sfx('click'); onEdit();
    if (!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches)) src.focus({ preventScroll: true });
  }
  function renderLines() {
    var n = src.value.split('\n').length, t = '';
    for (var i = 1; i <= n; i++) t += i + '\n';
    linesEl.textContent = t; linesEl.scrollTop = src.scrollTop;
  }
  var mark = null;
  function markLine(line, cls) {
    if (mark) { mark.remove(); mark = null; }
    if (!(line > 0)) return;
    mark = document.createElement('div');
    mark.className = 'dt-mark ' + (cls || '');
    var lh = parseFloat(getComputedStyle(src).lineHeight) || 21, pt = parseFloat(getComputedStyle(src).paddingTop) || 0;
    mark.style.top = (pt + (line - 1) * lh - src.scrollTop) + 'px';
    mark.style.height = lh + 'px';
    src.parentNode.appendChild(mark);
  }
  var saveT;
  function onEdit() {
    renderLines(); errEl.hidden = true; markLine(0); poke();
    clearTimeout(saveT);
    var i = API.level().index;
    saveT = setTimeout(function () { try { localStorage.setItem('dino-codigo-' + i, src.value); } catch (e) { /* sin almacenamiento */ } }, 400);
  }
  src.addEventListener('input', onEdit);
  // En celular, al escribir con el teclado el mapa deja de quedarse fijo para que se vea el editor
  src.addEventListener('focus', function () { document.body.classList.add('dt-typing'); });
  src.addEventListener('blur', function () { document.body.classList.remove('dt-typing'); });
  src.addEventListener('scroll', function () { linesEl.scrollTop = src.scrollTop; });
  var escKey = false;
  src.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { escKey = true; return; }
    if (e.key === 'Tab' && !escKey && !e.shiftKey) {
      e.preventDefault();
      var s = src.selectionStart;
      src.value = src.value.slice(0, s) + '    ' + src.value.slice(src.selectionEnd);
      src.selectionStart = src.selectionEnd = s + 4; onEdit();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      var st = src.selectionStart, before = src.value.slice(0, st);
      var ind = (before.split('\n').pop().match(/^\s*/) || [''])[0];
      if (/:\s*$/.test(before)) ind += '    ';
      src.value = before + '\n' + ind + src.value.slice(src.selectionEnd);
      src.selectionStart = src.selectionEnd = st + 1 + ind.length; onEdit();
    }
    if (e.key !== 'Tab') escKey = false;
  });
  document.getElementById('dt-reset').addEventListener('click', function () {
    var L = API.level().L;
    if (!confirm('¿Regresar el código de esta misión a como empezó?')) return;
    src.value = L.starter || ''; onEdit();
  });

  // ---------- Del código a los bloques ----------
  var NAMES = ['mover_derecha', 'mover_izquierda', 'mover_arriba', 'mover_abajo', T.code.attack, T.code.ifEnemy, T.code.untilGoal, 'hay_camino', 'range', 'for', 'while', 'if', 'else'];
  var TYPE_NAME = { right: 'mover_derecha()', left: 'mover_izquierda()', up: 'mover_arriba()', down: 'mover_abajo()', attack: T.code.attack + '()', repeat: 'for', ifEnemy: 'if ' + T.code.ifEnemy + '()', untilGoal: 'while not ' + T.code.untilGoal + '()', ifPath: 'if hay_camino()' };
  function alt(a, b) { return '(?:' + a + '|' + b + ')'; }
  var RE_ATTACK = new RegExp('^' + alt(T.code.attack, 'atacar') + '\\s*\\(\\s*\\)$');
  var RE_IFE = new RegExp('^if\\s+(heroe\\.|dino\\.)?' + alt(T.code.ifEnemy, 'hay_enemigo_enfrente') + '\\s*\\(\\s*\\)\\s*:$');
  var RE_UNTIL = new RegExp('^while\\s+not\\s+(heroe\\.|dino\\.)?' + alt(T.code.untilGoal, 'en_la_meta') + '\\s*\\(\\s*\\)\\s*:$');
  function lev(a, b) {
    var m = [], i, j;
    for (i = 0; i <= a.length; i++) { m[i] = [i]; }
    for (j = 0; j <= b.length; j++) m[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++) m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return m[a.length][b.length];
  }
  function ParseError(line, msg) { this.line = line; this.msg = msg; }
  function parse(text, allowed) {
    var lines = text.replace(/\t/g, '    ').split('\n');
    var root = [], stack = [{ indent: -1, child: null, list: root, node: null, line: 0 }], pending = null, lastNode = null;
    for (var i = 0; i < lines.length; i++) {
      var ln = i + 1, raw = lines[i].replace(/\s+$/, '');
      var noComment = raw.replace(/#.*$/, '').replace(/\s+$/, '');
      if (!noComment.trim()) continue;
      var indent = noComment.match(/^ */)[0].length, t = noComment.trim();
      while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
      if (pending && pending.list.length === 0 && indent <= pending.indent) throw new ParseError(pending.line, 'La línea ' + pending.line + ' termina en ":", así que la siguiente línea va adentro, con 4 espacios al inicio (usa el botón ⇥ sangría).');
      pending = null;
      var top = stack[stack.length - 1];
      if (/^(else|sino)\s*:?$/.test(t)) {
        if (!/:$/.test(t)) throw new ParseError(ln, 'Falta ":" al final de else.');
        var prev = top.list[top.list.length - 1];
        if (!prev || prev.t !== 'ifPath' || prev.elseBody) throw new ParseError(ln, 'else va justo después de un if hay_camino(...) y con la misma sangría.');
        prev.elseBody = [];
        var fr = { indent: indent, child: null, list: prev.elseBody, line: ln };
        stack.push(fr); pending = fr;
        continue;
      }
      if (top.child === null) top.child = indent;
      else if (indent !== top.child) throw new ParseError(ln, indent > top.child ? 'Esta línea tiene espacios de más al inicio. Quítalos o revisa la línea de arriba.' : 'La sangría (espacios al inicio) no coincide con las líneas de arriba.');
      var m, node = null, header = false;
      var s = t.replace(/^(heroe|dino|rexi)\./i, '');
      if ((m = s.match(/^mover_(derecha|izquierda|arriba|abajo)\s*\(\s*\)$/))) node = { t: { derecha: 'right', izquierda: 'left', arriba: 'up', abajo: 'down' }[m[1]] };
      else if (RE_ATTACK.test(s)) node = { t: 'attack' };
      else if ((m = s.match(/^for\s+\w+\s+in\s+range\s*\(\s*(\d+)\s*\)\s*:$/)) || (m = s.match(/^repetir\s*\(?\s*(\d+)\s*\)?\s*(?:veces)?\s*:$/))) {
        var n = +m[1];
        if (n < 1 || n > 20) throw new ParseError(ln, 'Usa un número de veces entre 1 y 20.');
        node = { t: 'repeat', n: n, body: [] }; header = true;
      } else if (RE_IFE.test(s)) { node = { t: 'ifEnemy', body: [] }; header = true; }
      else if (RE_UNTIL.test(s)) { node = { t: 'untilGoal', body: [] }; header = true; }
      else if ((m = s.match(/^if\s+(?:heroe\.|dino\.)?hay_camino\s*\(\s*['"](derecha|izquierda|arriba|abajo)['"]\s*\)\s*:$/))) { node = { t: 'ifPath', dir: { derecha: 'right', izquierda: 'left', arriba: 'up', abajo: 'down' }[m[1]], body: [] }; header = true; }
      else if (/^(for|if|while|repetir)\b/.test(s) && !/:$/.test(s)) throw new ParseError(ln, 'Falta ":" al final de la línea. En Python, for, if y while terminan con dos puntos.');
      else if (/^mover_(derecha|izquierda|arriba|abajo)$/.test(s) || s === T.code.attack) throw new ParseError(ln, 'Faltan los paréntesis: escribe ' + s + '()');
      else if (/^for\s/.test(s)) throw new ParseError(ln, 'El for se escribe así: for i in range(3):');
      else {
        var word = (s.match(/^[A-Za-zÁÉÍÓÚáéíóúñÑ_]+/) || [s])[0].toLowerCase();
        var best = NAMES.map(function (n2) { return [n2, lev(word, n2)]; }).sort(function (a, b) { return a[1] - b[1]; })[0];
        throw new ParseError(ln, best && best[1] <= 3 ? 'No conozco «' + word + '». ¿Quisiste decir ' + best[0] + '? Revisa letras y guiones bajos.' : 'No entiendo esta línea. Usa los botones de arriba para escribir las instrucciones.');
      }
      if (allowed.indexOf(node.t) === -1) throw new ParseError(ln, 'En esta misión todavía no se usa ' + TYPE_NAME[node.t] + '.');
      node.line = ln;
      top.list.push(node); lastNode = node;
      if (header) { var f = { indent: indent, child: null, list: node.body, line: ln }; stack.push(f); pending = f; }
    }
    if (pending && pending.list.length === 0) throw new ParseError(pending.line, 'La línea ' + pending.line + ' termina en ":" pero no tiene nada adentro. Agrega instrucciones con 4 espacios al inicio.');
    if (!root.length) throw new ParseError(1, 'Tu código está vacío. Escribe al menos una instrucción, como mover_derecha()');
    return root;
  }
  var idLine = {};
  function mapIds(list) { list.forEach(function (n) { if (n.line) idLine[n.id] = n.line; if (n.body) mapIds(n.body); if (n.elseBody) mapIds(n.elseBody); }); }
  function isCode() { var L = API.level().L; return L && L.mode === 'codigo'; }
  API.beforeRun = function () {
    if (!isCode()) return true;
    try {
      var spec = parse(src.value, API.level().L.blocks);
      API.setProgram(spec);
      idLine = {}; mapIds(API.program());
      errEl.hidden = true; markLine(0);
      return true;
    } catch (e) {
      if (!(e instanceof ParseError)) throw e;
      errEl.innerHTML = '<strong>Línea ' + e.line + ':</strong> ' + esc(e.msg);
      errEl.hidden = false; markLine(e.line, 'is-error is-blink');
      say('¡Ups! En la línea ' + e.line + ' hay algo raro. ' + e.msg, 'worry');
      sfx('bad'); poke();
      return false;
    }
  };

  // ---------- Reacciones en tiempo real ----------
  var fails = 0, helpStep = 0, idle = null, idle2 = null, lastCount = 0, warnedLong = false, introCode = false, wonHere = false;
  function poke() {
    clearTimeout(idle); clearTimeout(idle2);
    if (wonHere) return;
    idle = setTimeout(function () { if (!API.isRunning()) { var L0 = API.level().L; helpStep = Math.max(helpStep, 1); if (!isCode() && L0.hintBlocks) API.flashPalette(L0.hintBlocks); say('¿Te ayudo? Pista: ' + API.tr(L0.hint), 'think'); } }, 30000);
    idle2 = setTimeout(function () { if (!API.isRunning()) { helpStep = Math.max(helpStep, 2); say('Mira, así se puede: ' + API.tr(API.level().L.hint2), 'think'); } }, 60000);
  }
  document.getElementById('dt-help').addEventListener('click', function () {
    var L = API.level().L;
    helpStep++;
    if (!isCode() && L.hintBlocks) API.flashPalette(L.hintBlocks);
    if (helpStep === 1) say('¡Claro! ' + API.tr(L.hint) + (L.hintBlocks && !isCode() ? ' Mira los bloques que parpadean.' : ''), 'think');
    else if (helpStep === 2) say('Te doy una pista más grande: ' + API.tr(L.hint2), 'think');
    else say('Hazlo paso a paso: ' + API.tr(L.hint2) + ' Si sigues atorado, levanta la mano y tu maestro te ayuda.', 'think');
    poke();
  });

  document.addEventListener('ik:bloques', function (e) {
    var d = e.detail, L = API.level().L;
    if (d.type === 'level') {
      startClock();
      fails = 0; helpStep = 0; warnedLong = false; wonHere = false; lastCount = 0;
      app.classList.toggle('is-code', L.mode === 'codigo');
      if (L.mode === 'codigo') {
        var saved = null;
        try { saved = localStorage.getItem('dino-codigo-' + d.level); } catch (er) { /* sin almacenamiento */ }
        src.value = saved != null ? saved : (L.starter || '');
        renderChips(L); renderLines(); errEl.hidden = true; markLine(0);
      }
      var msg = 'Misión ' + (d.level + 1) + ': ' + L.intro;
      if (L.mode === 'codigo' && !introCode) { introCode = true; }
      say(msg, 'talk');
      poke();
    } else if (d.type === 'change') {
      if (isCode()) return;
      if (lastCount === 0 && d.count === 1) say(rnd(['¡Eso! Sigue agregando bloques. Cuando creas que está listo, toca Ejecutar.', '¡Buen comienzo! Agrega los bloques que faltan.']), 'happy');
      else if (!warnedLong && L.blocks.indexOf('repeat') > -1 && d.count > L.best + 4) { warnedLong = true; say('¡Uf, son muchos bloques! ¿Y si usas "repetir" para hacerlo más corto?', 'think'); }
      lastCount = d.count; poke();
    } else if (d.type === 'run') {
      markLine(0);
      say(rnd(['¡Vamos, ' + T.heroe + '! A ver si funciona…', '¡Ejecutando! Mira con atención el mapa.', '¡Allá va ' + T.heroe + '! ' + T.emoji]), 'happy');
      clearTimeout(idle); clearTimeout(idle2);
    } else if (d.type === 'step') {
      if (isCode() && idLine[d.id]) markLine(idLine[d.id], 'is-run');
    } else if (d.type === 'empty') {
      say(isCode() ? 'Escribe primero tu código en el editor.' : 'Primero toca algunos bloques para armar tu programa.', 'think');
    } else if (d.type === 'fail') {
      fails++;
      markLine(0);
      var where = d.id ? (isCode() ? (idLine[d.id] ? ' Revisa la línea ' + idLine[d.id] + ', la que parpadea.' : '') : ' Mira el bloque que parpadea.') : '';
      var why = {
        choque: rnd(['¡Ouch! ' + T.heroe + ' chocó con ' + T.obstaculo + '. Cuenta otra vez los cuadritos.', '¡Pum! Ahí hay un obstáculo. Revisa hacia dónde se mueve ' + T.heroe + '.']) + where,
        enemigo: '¡Un ' + T.enemigo + ' está en el camino! Usa ' + (isCode() ? T.code.attack + '()' : '"' + T.accion + '"') + ' cuando lo tengas enfrente.' + where,
        gemas: '¡Llegaste al ' + T.meta + ', pero te faltó ' + (d.left === 1 ? 'un ' + T.item : d.left + ' ' + T.items) + '! Pasa por encima de todos.',
        corto: T.heroe + ' se quedó a medio camino. ¡Te faltan instrucciones después ' + (isCode() ? 'de la última línea' : 'del bloque que parpadea') + '!'
      }[d.kind] || 'Casi lo logras. Revisa tu programa.';
      if (d.kind === 'enemigo' && !isCode()) API.flashPalette(['attack']);
      if (isCode() && d.id && idLine[d.id]) markLine(idLine[d.id], 'is-error is-blink');
      if (fails >= 2) { why += ' Pista: ' + API.tr(L.hint); helpStep = Math.max(helpStep, 1); }
      if (fails >= 4) { why = 'No te rindas, ¡los programadores se equivocan mucho! ' + API.tr(L.hint2); helpStep = 2; }
      say(why, 'worry');
      poke();
    } else if (d.type === 'win') {
      wonHere = true; clearTimeout(idle); clearTimeout(idle2);
      if (isCode()) markLine(0);
      var cheer = d.stars === 3 ? rnd(T.vivas) :
        '¡Lo lograste! Reto extra: ¿puedes hacerlo con ' + d.best + (isCode() ? ' líneas' : ' bloques') + '?';
      if (d.last) cheer = T.final;
      else if (d.level === 4) cheer += ' Ahora viene lo mejor: ¡vas a escribir código de verdad!';
      say(cheer, 'party');
      sfx(T.sonido);
    }
  });

  // La primera misión ya se cargó antes que este archivo: la presentamos aquí
  var first = API.level();
  document.dispatchEvent(new CustomEvent('ik:bloques', { detail: { type: 'level', level: first.index, count: 0 } }));
})();
