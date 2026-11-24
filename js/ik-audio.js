/* Innovating Kids — sonidos y música de los juegos.
   Todo se genera con Web Audio (sin archivos). El sonido empieza después del primer toque
   o clic, como piden los navegadores. Preferencias guardadas en este navegador. */
(function () {
  'use strict';
  var KEY = 'ik-audio';
  var prefs = { sfx: true, music: false };
  try { var s = JSON.parse(localStorage.getItem(KEY) || '{}'); if (typeof s.sfx === 'boolean') prefs.sfx = s.sfx; if (typeof s.music === 'boolean') prefs.music = s.music; } catch (e) { /* sin almacenamiento */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) { /* sin almacenamiento */ } }

  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null, master = null, musicGain = null;
  function ensure() {
    if (!AC) return null;
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
      musicGain = ctx.createGain(); musicGain.gain.value = 0.16; musicGain.connect(master);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, start, dur, type, vol, dest, slideTo) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, start);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(vol || 0.25, start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g); g.connect(dest || master);
    o.start(start); o.stop(start + dur + 0.02);
  }
  function noise(start, dur, vol, freq) {
    var len = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = ctx.createBufferSource(); src.buffer = buf;
    var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq || 1200;
    var g = ctx.createGain(); g.gain.value = vol || 0.3;
    src.connect(f); f.connect(g); g.connect(master); src.start(start);
  }

  // Efectos: paso, objeto, golpe, choque, ganar, perder, clic, correcto, error, ladrido, miau, tesoro
  var SFX = {
    step: function (t) { tone(520, t, 0.06, 'triangle', 0.12); },
    item: function (t) { [880, 1175, 1568].forEach(function (f, i) { tone(f, t + i * 0.06, 0.12, 'square', 0.12); }); },
    hit: function (t) { noise(t, 0.12, 0.35, 900); tone(220, t, 0.12, 'sawtooth', 0.12, null, 90); },
    bump: function (t) { tone(140, t, 0.22, 'sawtooth', 0.18, null, 70); },
    win: function (t) { [523, 659, 784, 1047, 784, 1047].forEach(function (f, i) { tone(f, t + i * 0.11, i === 5 ? 0.45 : 0.14, 'square', 0.14); }); },
    lose: function (t) { [392, 330, 262, 196].forEach(function (f, i) { tone(f, t + i * 0.14, 0.18, 'triangle', 0.18); }); },
    click: function (t) { tone(760, t, 0.04, 'square', 0.08); },
    ok: function (t) { tone(660, t, 0.09, 'square', 0.13); tone(990, t + 0.08, 0.16, 'square', 0.13); },
    bad: function (t) { tone(180, t, 0.16, 'square', 0.12); tone(150, t + 0.12, 0.2, 'square', 0.12); },
    woof: function (t) { tone(420, t, 0.08, 'sawtooth', 0.2, null, 240); tone(380, t + 0.13, 0.09, 'sawtooth', 0.2, null, 220); },
    meow: function (t) { tone(600, t, 0.35, 'triangle', 0.18, null, 900); tone(900, t + 0.18, 0.25, 'triangle', 0.12, null, 500); },
    treasure: function (t) { [523, 784, 1047, 1319, 1568, 2093].forEach(function (f, i) { tone(f, t + i * 0.07, 0.2, 'triangle', 0.13); }); },
    power: function (t) { tone(200, t, 0.5, 'sawtooth', 0.12, null, 1200); }
  };
  function play(name) {
    if (!prefs.sfx || !SFX[name] || !ensure()) return;
    try { SFX[name](ctx.currentTime + 0.01); } catch (e) { /* sin audio */ }
  }

  // Música por tema: escala, tempo y timbre
  var THEMES = {
    bosque: { bpm: 118, wave: 'triangle', notes: [0, 4, 7, 9, 7, 4, 2, 4, 0, 2, 4, 7, 4, 2, 0, -3], base: 392 },
    espacio: { bpm: 96, wave: 'sine', notes: [0, 7, 12, 7, 3, 7, 10, 7, 0, 7, 12, 14, 12, 10, 7, 3], base: 330 },
    parque: { bpm: 132, wave: 'square', notes: [0, 2, 4, 7, 4, 2, 0, 7, 9, 7, 4, 2, 4, 2, 0, -5], base: 440 },
    pirata: { bpm: 140, wave: 'square', notes: [0, 3, 7, 3, 0, 3, 7, 10, 8, 7, 3, 7, 5, 3, 2, -5], base: 294 },
    castillo: { bpm: 104, wave: 'sawtooth', notes: [0, 3, 7, 12, 10, 7, 3, 5, 7, 3, 0, -2, 0, 3, 2, -5], base: 262 },
    navidad: { bpm: 150, wave: 'triangle', notes: [4, 4, 4, -99, 4, 4, 4, -99, 4, 7, 0, 2, 4, -99, -99, -99, 5, 5, 5, 5, 5, 4, 4, 4, 4, 2, 2, 4, 2, -99, 7, -99], base: 523 },
    hardware: { bpm: 124, wave: 'square', notes: [0, 4, 7, 11, 12, 11, 7, 4, 2, 5, 9, 12, 9, 5, 2, 7], base: 392 }
  };
  var theme = 'bosque', timer = null, stepI = 0, nextT = 0;
  function schedule() {
    var th = THEMES[theme] || THEMES.bosque, beat = 60 / th.bpm / 2;
    while (nextT < ctx.currentTime + 0.3) {
      var n = th.notes[stepI % th.notes.length];
      if (n > -99) tone(th.base * Math.pow(2, n / 12), nextT, beat * 0.9, th.wave, 0.5, musicGain);
      var bn = th.notes[(stepI / 4 | 0) % 4 * 4];
      if (stepI % 4 === 0 && bn > -99) tone(th.base / 2 * Math.pow(2, bn / 12), nextT, beat * 3.6, 'triangle', 0.6, musicGain);
      stepI++; nextT += beat;
    }
  }
  function startMusic() {
    if (!prefs.music || timer || !ensure()) return;
    nextT = ctx.currentTime + 0.05; stepI = 0;
    timer = setInterval(schedule, 100);
  }
  function stopMusic() { clearInterval(timer); timer = null; }
  function setTheme(t) { if (THEMES[t]) theme = t; stepI = 0; }

  // Botones de sonido: <button data-ik-audio="sfx|music">
  function paint() {
    document.querySelectorAll('[data-ik-audio]').forEach(function (b) {
      var k = b.getAttribute('data-ik-audio');
      b.setAttribute('aria-pressed', String(prefs[k]));
      var lbl = b.querySelector('.ik-audio-label');
      if (lbl) lbl.textContent = (k === 'sfx' ? 'Sonido: ' : 'Música: ') + (prefs[k] ? 'sí' : 'no');
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-ik-audio]');
    if (!b) return;
    var k = b.getAttribute('data-ik-audio');
    prefs[k] = !prefs[k]; save(); paint();
    if (k === 'music') { if (prefs.music) startMusic(); else stopMusic(); }
    if (k === 'sfx' && prefs.sfx) play('click');
  });
  // La música (si está activada) arranca con el primer gesto de la persona
  function firstGesture() {
    document.removeEventListener('pointerdown', firstGesture, true);
    document.removeEventListener('keydown', firstGesture, true);
    ensure(); startMusic();
  }
  document.addEventListener('pointerdown', firstGesture, true);
  document.addEventListener('keydown', firstGesture, true);
  document.addEventListener('visibilitychange', function () {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (prefs.sfx || prefs.music) ctx.resume();
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint); else paint();

  window.IKAudio = { play: play, setTheme: setTheme, prefs: prefs };
})();
