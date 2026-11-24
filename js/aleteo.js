/* Innovating Kids — Tutorial "Astro Salto": crea un juego de aleteo paso a paso con JavaScript.
   El código del alumno corre en un iframe aislado (sandbox="allow-scripts", sin acceso al sitio ni a su cuenta).
   Cada paso tiene comprobaciones automáticas. El avance se guarda en el navegador y, si el alumno
   entró al portal, en su cuenta (js/progreso.js, juego "aleteo"). */
(function () {
  'use strict';
  var PASOS = window.ALETEO_PASOS || [];
  var $ = function (id) { return document.getElementById(id); };
  var app = $('tu-app');
  if (!app || !PASOS.length) return;
  var sfx = function (n) { if (window.IKAudio) window.IKAudio.play(n); };
  if (window.IKAudio) window.IKAudio.setTheme('espacio');

  var STORE = 'ik-aleteo-v1', HELP = 'ik-aleteo-ayuda', CODE = 'ik-aleteo-codigo-';
  var TEACHER = /[?&]profe=1\b/.test(location.search);
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
  var progress = load(STORE, {}) || {};
  var ayuda = load(HELP, {}) || {}; // { paso: 1 = usó pista, 2 = usó solución }

  function saveProgress() {
    save(STORE, progress);
    document.dispatchEvent(new CustomEvent('ik:progreso', { detail: { juego: 'aleteo', niveles: progress, total: PASOS.length } }));
  }
  document.addEventListener('ik:progreso-remoto', function (e) {
    var remoto = (e.detail && e.detail.niveles) || {}, cambio = false, subir = false;
    Object.keys(remoto).forEach(function (k) { var v = +remoto[k] || 0; if (v > (progress[k] || 0)) { progress[k] = v; cambio = true; } });
    Object.keys(progress).forEach(function (k) { if ((progress[k] || 0) > (+remoto[k] || 0)) subir = true; });
    if (cambio) { save(STORE, progress); renderSteps(); }
    if (subir) saveProgress();
  });
  function unlocked(i) { return TEACHER || i === 0 || !!progress[i - 1]; }

  var code = $('tu-code'), lines = $('tu-lines'), frame = $('tu-frame'), results = $('tu-results'), errBox = $('tu-error'), overlay = $('tu-overlay');
  var paso = 0;

  // ---------- El "documento" del juego dentro del iframe ----------
  var HARNESS = [
    '(function () {',
    '  function send(m) { m.__ik = 1; parent.postMessage(m, "*"); }',
    '  window.__send = send;',
    '  window.onerror = function (msg, src, line) { send({ type: "error", msg: String(msg), line: line }); return true; };',
    '  window.__frames = 0;',
    '  if (window.__TEST) {',
    '    var q = [];',
    '    window.requestAnimationFrame = function (cb) { q.push(cb); return q.length; };',
    '    window.__paso = function (n) { for (var i = 0; i < n; i++) { var c = q; q = []; c.forEach(function (f) { window.__frames++; f(performance.now()); }); } };',
    '  } else {',
    '    var raf = window.requestAnimationFrame.bind(window);',
    '    window.requestAnimationFrame = function (cb) { return raf(function (t) { window.__frames++; cb(t); }); };',
    '    window.__paso = function () {};',
    '  }',
    '  window.px = function (x, y) { return ctx.getImageData(x, y, 1, 1).data; };',
    '})();',
    'var canvas = document.getElementById("juego");',
    'var ctx = canvas.getContext("2d");'
  ].join('\n');
  var STYLE = 'html,body{margin:0;height:100%;background:#061226;display:flex;align-items:center;justify-content:center;overflow:hidden}' +
    'canvas{display:block;max-width:100%;max-height:100%;border-radius:10px;background:#000;touch-action:manipulation;cursor:pointer}';
  function safe(s) { return String(s).replace(/<\/script/gi, '<\\/script'); }
  function buildDoc(src, testBody) {
    var head = '<!doctype html><html><head><meta charset="utf-8"><style>' + STYLE + '</style></head><body>\n' +
      '<canvas id="juego" width="400" height="560"></canvas>\n<script>window.__TEST = ' + (testBody ? 'true' : 'false') + ';\n' + HARNESS + '\n<\/script>\n<script>\n';
    var offset = head.split('\n').length - 1;
    var doc = head + safe(src) + '\n<\/script>\n';
    if (testBody) {
      doc += '<script>\n(function () {\n  var r = [];\n  function ok(n, c) { r.push([n, !!c]); }\n  try {\n' + safe(testBody) +
        '\n  } catch (e) { r.push(["Tu código funciona sin errores (" + e.message + ")", false]); }\n  __send({ type: "test", results: r });\n})();\n<\/script>\n';
    } else {
      doc += '<script>__send({ type: "listo" });<\/script>\n';
    }
    return { html: doc + '</body></html>', offset: offset };
  }

  // Mensajes de error en español
  function traducir(msg) {
    var m;
    msg = String(msg).replace(/^Uncaught\s+/, '');
    if ((m = msg.match(/ReferenceError: (\S+) is not defined/))) return 'No existe «' + m[1] + '». Revisa que esté escrito igual, con mayúsculas y minúsculas, y que lo hayas creado con let, const o function.';
    if ((m = msg.match(/TypeError: (\S+) is not a function/))) return '«' + m[1] + '» no es una función. Revisa el nombre o los paréntesis.';
    if ((m = msg.match(/Cannot read propert(?:y|ies) of (undefined|null)(?: \(reading '([^']+)'\))?/))) return 'Intentaste usar «' + (m[2] || 'algo') + '» de algo que no existe (' + m[1] + ').';
    if (/Unexpected end of input/.test(msg)) return 'Falta cerrar algo: una llave «}», un paréntesis «)» o unas comillas.';
    if ((m = msg.match(/Unexpected token '?([^'\s]+)'?/))) return 'Hay un símbolo que no va ahí: «' + m[1] + '». Revisa paréntesis, llaves, comas y punto y coma.';
    if (/Unexpected identifier/.test(msg)) return 'Hay una palabra en un lugar raro. ¿Te faltó un punto y coma, una coma o un paréntesis?';
    if ((m = msg.match(/Identifier '([^']+)' has already been declared/))) return '«' + m[1] + '» ya existe. Créalo solo una vez (quita el let o const repetido).';
    if ((m = msg.match(/Assignment to constant variable/))) return 'Intentaste cambiar una constante (const). Si va a cambiar, créala con let.';
    if (/Invalid or unexpected token/.test(msg)) return 'Hay un carácter extraño o unas comillas sin cerrar.';
    if (/missing \) after argument list/.test(msg)) return 'Falta cerrar un paréntesis «)».';
    return msg;
  }

  // ---------- Ejecutar (vista previa) ----------
  var runInfo = null, testInfo = null, testFrame = null, testTimer = null;
  function showError(msg, line) {
    errBox.innerHTML = '';
    var strong = document.createElement('strong');
    strong.textContent = line > 0 ? 'Error en la línea ' + line + ': ' : 'Error: ';
    errBox.appendChild(strong);
    errBox.appendChild(document.createTextNode(traducir(msg)));
    errBox.hidden = false;
    markLine(line);
  }
  function clearError() { errBox.hidden = true; errBox.textContent = ''; markLine(0); }
  function run() {
    clearError();
    var d = buildDoc(code.value, null);
    runInfo = { offset: d.offset };
    frame.srcdoc = d.html;
    sfx('click');
  }

  // ---------- Comprobar paso ----------
  function check() {
    clearError();
    results.innerHTML = '<li class="tu-wait">Comprobando…</li>';
    if (testFrame) testFrame.remove();
    testFrame = document.createElement('iframe');
    testFrame.setAttribute('sandbox', 'allow-scripts');
    testFrame.setAttribute('aria-hidden', 'true');
    testFrame.tabIndex = -1;
    testFrame.className = 'tu-test-frame';
    var d = buildDoc(code.value, PASOS[paso].test);
    testInfo = { offset: d.offset, done: false, error: null };
    document.body.appendChild(testFrame);
    testFrame.srcdoc = d.html;
    clearTimeout(testTimer);
    testTimer = setTimeout(function () {
      if (testInfo && !testInfo.done) finishTest([['Tu código termina de correr (¿hay un ciclo que nunca acaba?)', false]]);
    }, 4000);
    run();
  }
  function finishTest(res) {
    testInfo.done = true;
    clearTimeout(testTimer);
    if (testFrame) { testFrame.remove(); testFrame = null; }
    if (testInfo.error) res = [['Tu código corre sin errores', false]].concat(res);
    results.innerHTML = '';
    var all = res.length > 0;
    res.forEach(function (r) {
      var li = document.createElement('li');
      li.className = r[1] ? 'is-ok' : 'is-bad';
      li.innerHTML = '<span aria-hidden="true">' + (r[1] ? '✓' : '✗') + '</span> ';
      li.appendChild(document.createTextNode(r[0]));
      li.appendChild(Object.assign(document.createElement('span'), { className: 'sr-only', textContent: r[1] ? ' (correcto)' : ' (falta)' }));
      results.appendChild(li);
      if (!r[1]) all = false;
    });
    if (all) pasoSuperado(); else sfx('bad');
  }

  window.addEventListener('message', function (e) {
    var m = e.data;
    if (!m || m.__ik !== 1) return;
    if (testFrame && e.source === testFrame.contentWindow) {
      if (m.type === 'error') {
        testInfo.error = m;
        showError(m.msg, (m.line || 0) - testInfo.offset);
      } else if (m.type === 'test' && !testInfo.done) {
        finishTest(m.results || []);
      }
    } else if (e.source === frame.contentWindow && m.type === 'error' && runInfo) {
      showError(m.msg, (m.line || 0) - runInfo.offset);
    }
  });

  function pasoSuperado() {
    var stars = ayuda[paso] === 2 ? 1 : ayuda[paso] === 1 ? 2 : 3;
    if ((progress[paso] || 0) < stars) { progress[paso] = stars; saveProgress(); }
    renderSteps();
    sfx('win');
    var last = paso === PASOS.length - 1;
    var html = '<div class="overlay-card"><p class="overlay-title">' + (last ? '¡Terminaste tu videojuego!' : '¡Paso ' + (paso + 1) + ' superado!') + '</p>' +
      '<p class="overlay-stars" aria-label="' + stars + ' de 3 estrellas">';
    for (var i = 0; i < 3; i++) html += '<span class="' + (i < stars ? 'on' : '') + '" aria-hidden="true">★</span>';
    html += '</p><p class="overlay-msg">' + (stars === 3 ? '¡Lo hiciste sin ayuda!' : stars === 2 ? 'Usaste la pista. ¡Bien hecho!' : 'Usaste la solución. Intenta el siguiente sin verla.') + '</p><div class="overlay-actions">';
    html += last ? '<button type="button" class="btn btn-yellow" data-act="stay">Seguir jugando mi juego</button>' : '<button type="button" class="btn btn-yellow" data-act="next">Siguiente paso</button>';
    html += '<button type="button" class="btn btn-ghost-light" data-act="stay">' + (last ? 'Cerrar' : 'Quedarme aquí') + '</button></div></div>';
    overlay.innerHTML = html;
    overlay.hidden = false;
    overlay.querySelector('button').focus({ preventScroll: true });
  }
  overlay.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    overlay.hidden = true; overlay.innerHTML = '';
    if (b.dataset.act === 'next') setPaso(paso + 1, true);
  });

  // ---------- Editor ----------
  function renderLines() {
    var n = code.value.split('\n').length, s = '';
    for (var i = 1; i <= n; i++) s += i + '\n';
    lines.textContent = s;
    lines.scrollTop = code.scrollTop;
  }
  function markLine(line) {
    var old = $('tu-mark');
    if (old) old.remove();
    if (!(line > 0)) return;
    var mk = document.createElement('div');
    mk.id = 'tu-mark'; mk.className = 'tu-mark';
    var lh = parseFloat(getComputedStyle(code).lineHeight) || 20;
    var pt = parseFloat(getComputedStyle(code).paddingTop) || 0;
    mk.style.top = (pt + (line - 1) * lh - code.scrollTop) + 'px';
    mk.style.height = lh + 'px';
    code.parentNode.appendChild(mk);
    mk.dataset.line = line;
  }
  var escPressed = false;
  code.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { escPressed = true; return; }
    if (e.key === 'Tab' && !escPressed && !e.shiftKey) {
      e.preventDefault();
      var s = code.selectionStart, en = code.selectionEnd;
      code.value = code.value.slice(0, s) + '  ' + code.value.slice(en);
      code.selectionStart = code.selectionEnd = s + 2;
      onEdit();
    } else if (e.key === 'Enter') {
      // mantener la sangría del renglón anterior
      e.preventDefault();
      var st = code.selectionStart, before = code.value.slice(0, st);
      var ind = (before.split('\n').pop().match(/^\s*/) || [''])[0];
      if (/[{(]\s*$/.test(before)) ind += '  ';
      code.value = before + '\n' + ind + code.value.slice(code.selectionEnd);
      code.selectionStart = code.selectionEnd = st + 1 + ind.length;
      onEdit();
    }
    if (e.key !== 'Tab') escPressed = false;
  });
  var saveTimer;
  function onEdit() {
    renderLines();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { save(CODE + paso, code.value); }, 400);
  }
  code.addEventListener('input', onEdit);
  code.addEventListener('scroll', function () {
    lines.scrollTop = code.scrollTop;
    var mk = $('tu-mark'); if (mk) markLine(+mk.dataset.line);
  });

  // ---------- Pasos ----------
  var ICON_LOCK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  function renderSteps() {
    var ol = $('tu-steps');
    ol.innerHTML = '';
    PASOS.forEach(function (P, i) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      var lock = !unlocked(i);
      b.className = 'lvl' + (i === paso ? ' is-current' : '') + (progress[i] ? ' is-done' : '') + (lock ? ' is-locked' : '');
      b.disabled = lock;
      var st = '';
      if (progress[i]) for (var k = 0; k < 3; k++) st += '<i class="' + (k < progress[i] ? 'on' : '') + '"></i>';
      b.innerHTML = '<span class="lvl-num">' + (lock ? ICON_LOCK : (i + 1)) + '</span><span class="lvl-stars" aria-hidden="true">' + st + '</span>';
      b.setAttribute('aria-label', 'Paso ' + (i + 1) + ': ' + P.titulo + (lock ? ' (bloqueado)' : progress[i] ? ' (terminado)' : ''));
      b.title = 'Paso ' + (i + 1) + ': ' + P.titulo;
      if (i === paso) b.setAttribute('aria-current', 'step');
      b.addEventListener('click', function () { setPaso(i); });
      li.appendChild(b);
      ol.appendChild(li);
    });
  }
  var cargado = false;
  function setPaso(i, scroll) {
    if (!unlocked(i)) return;
    if (cargado) save(CODE + paso, code.value);
    cargado = true;
    paso = i;
    var P = PASOS[i];
    $('tu-kicker').textContent = 'Paso ' + (i + 1) + ' de ' + PASOS.length;
    $('tu-title').textContent = P.titulo;
    $('tu-aprendes').textContent = P.aprendes;
    $('tu-texto').innerHTML = P.texto;
    $('tu-mision').innerHTML = P.mision;
    $('tu-pista').textContent = P.pista;
    $('tu-pista-box').open = false;
    $('tu-sol').open = false;
    $('tu-sol-code').textContent = P.solution;
    var saved = load(CODE + i, null);
    code.value = typeof saved === 'string' ? saved : P.starter;
    results.innerHTML = '';
    renderLines();
    renderSteps();
    run();
    if (scroll) app.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  $('tu-run').addEventListener('click', run);
  $('tu-check').addEventListener('click', check);
  $('tu-reset').addEventListener('click', function () {
    if (!confirm('¿Regresar el código de este paso a como empezó? Perderás tus cambios de este paso.')) return;
    code.value = PASOS[paso].starter; onEdit(); run();
  });
  $('tu-pista-box').addEventListener('toggle', function () {
    if (this.open && !ayuda[paso]) { ayuda[paso] = 1; save(HELP, ayuda); }
  });
  $('tu-sol').addEventListener('toggle', function () {
    if (this.open) { ayuda[paso] = 2; save(HELP, ayuda); }
  });
  $('tu-use-sol').addEventListener('click', function () {
    if (!confirm('¿Cambiar tu código por la solución de este paso?')) return;
    ayuda[paso] = 2; save(HELP, ayuda);
    code.value = PASOS[paso].solution; onEdit(); run();
  });
  $('tu-copy').addEventListener('click', function () {
    var b = this;
    if (navigator.clipboard) navigator.clipboard.writeText(code.value).then(function () { b.textContent = '¡Copiado!'; setTimeout(function () { b.textContent = 'Copiar código'; }, 1500); }, function () {});
  });

  var start = 0;
  while (start < PASOS.length - 1 && progress[start]) start++;
  paso = start;
  setPaso(start);
})();
