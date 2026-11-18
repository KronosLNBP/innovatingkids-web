/* Innovating Kids — Programación con bloques
   Juego para guiar al héroe armando un programa con bloques.
   Sin librerías: arrastrar y soltar con Pointer Events, o tocar un bloque para agregarlo. */
(function () {
  'use strict';

  // ---------- Niveles ----------
  // Leyenda: . pasto  # árbol  H héroe  G gema  E slime  F bandera
  var LEVELS = [
    {
      name: 'Primeros pasos',
      goal: 'Lleva al héroe hasta la bandera.',
      hint: 'Arrastra el bloque "mover derecha" a tu programa (o tócalo) y presiona Ejecutar.',
      map: ['########', '########', '#H...F##', '########', '########', '########'],
      blocks: ['right', 'left', 'up', 'down'],
      best: 4
    },
    {
      name: 'La vuelta',
      goal: 'El camino da vuelta. Llega a la bandera sin chocar con los árboles.',
      hint: 'Cuenta los cuadros: primero a la derecha, luego hacia abajo y otra vez a la derecha.',
      map: ['########', '#H..####', '###.####', '###...F#', '########', '########'],
      blocks: ['right', 'left', 'up', 'down'],
      best: 7
    },
    {
      name: 'Cazador de gemas',
      goal: 'Recoge todas las gemas y después llega a la bandera.',
      hint: 'Para recoger una gema solo pasa por encima de ella.',
      map: ['########', '#H.G.###', '####.###', '#F.G.###', '########', '########'],
      blocks: ['right', 'left', 'up', 'down'],
      best: 8
    },
    {
      name: '¡Un slime!',
      goal: 'Un slime bloquea el camino. Derrótalo y llega a la bandera.',
      hint: 'Ponte junto al slime, mirando hacia él, y usa el bloque "atacar".',
      map: ['########', '########', '#H.E..F#', '########', '########', '########'],
      blocks: ['right', 'left', 'up', 'down', 'attack'],
      best: 6
    },
    {
      name: 'El pasillo largo',
      goal: 'Llega a la bandera usando muy pocos bloques.',
      hint: 'El bloque "repetir" hace lo mismo varias veces. Mete "mover derecha" dentro y elige cuántas veces.',
      map: ['########', '########', 'H......F', '########', '########', '########'],
      blocks: ['right', 'left', 'up', 'down', 'attack', 'repeat'],
      best: 2
    },
    {
      name: 'La escalera',
      goal: 'Baja la escalera hasta la bandera.',
      hint: 'Busca el patrón que se repite: derecha, abajo, derecha, abajo…',
      map: ['H.######', '#..#####', '##..####', '###..###', '####..##', '#####.F#'],
      blocks: ['right', 'left', 'up', 'down', 'attack', 'repeat'],
      best: 4
    },
    {
      name: 'Patrulla de slimes',
      goal: 'Hay slimes en el camino. Llega a la bandera con 4 bloques para ganar 3 estrellas.',
      hint: 'Dentro de "repetir": "si hay enemigo enfrente" con "atacar" adentro, y después "mover derecha".',
      map: ['########', '########', 'H.E..E.F', '########', '########', '########'],
      blocks: ['right', 'left', 'up', 'down', 'attack', 'repeat', 'ifEnemy'],
      best: 4
    },
    {
      name: 'La gran aventura',
      goal: 'Recoge las gemas, derrota a los slimes y llega a la bandera.',
      hint: 'Divide el problema en partes: primero el camino de arriba, luego baja y regresa por abajo.',
      map: ['H.G.E..#', '######.#', '#F.E.G.#', '########', '########', '########'],
      blocks: ['right', 'left', 'up', 'down', 'attack', 'repeat', 'ifEnemy'],
      best: 10
    }
  ];

  var DIRS = {
    right: { dx: 1, dy: 0 },
    left: { dx: -1, dy: 0 },
    up: { dx: 0, dy: -1 },
    down: { dx: 0, dy: 1 }
  };

  var BLOCKS = {
    right: { label: 'mover derecha', icon: '→', cls: 'b-move', code: 'heroe.mover_derecha()' },
    left: { label: 'mover izquierda', icon: '←', cls: 'b-move', code: 'heroe.mover_izquierda()' },
    up: { label: 'mover arriba', icon: '↑', cls: 'b-move', code: 'heroe.mover_arriba()' },
    down: { label: 'mover abajo', icon: '↓', cls: 'b-move', code: 'heroe.mover_abajo()' },
    attack: { label: 'atacar', icon: '⚔', cls: 'b-act', code: 'heroe.atacar()' },
    repeat: { label: 'repetir', icon: '↻', cls: 'b-loop', container: true },
    ifEnemy: { label: 'si hay enemigo enfrente', icon: '?', cls: 'b-if', container: true, code: 'if heroe.hay_enemigo_enfrente():' }
  };

  var MAX_BLOCKS = 40;
  var MAX_ACTIONS = 300;
  var STORE_KEY = 'ik-bloques-v1';

  // ---------- Elementos ----------
  var $ = function (id) { return document.getElementById(id); };
  var canvas = $('game-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var paletteEl = $('palette');
  var workspace = $('workspace');
  var levelsEl = $('game-levels');
  var statusEl = $('game-status');
  var overlay = $('game-overlay');
  var runBtn = $('btn-run');
  var resetBtn = $('btn-reset');
  var clearBtn = $('btn-clear');
  var countEl = $('block-count');
  var codeOut = $('code-out');
  var indicator = document.createElement('div');
  indicator.className = 'ws-indicator';
  indicator.hidden = true;

  // ---------- Progreso (solo en este navegador) ----------
  var progress = {};
  try { progress = JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {}; } catch (e) { progress = {}; }
  function saveProgress() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(progress)); } catch (e) { /* sin almacenamiento */ }
  }
  function isUnlocked(i) { return i === 0 || !!progress[i - 1]; }

  // ---------- Estado ----------
  var levelIndex = 0;
  var program = [];
  var selectedId = null; // contenedor elegido para agregar bloques con un toque
  var nextId = 1;
  var running = false;
  var timer = null;
  var game = null;
  var anim = null;
  var effects = [];

  // ---------- Programa (árbol de bloques) ----------
  function newNode(type) {
    var n = { id: 'b' + (nextId++), type: type };
    if (BLOCKS[type].container) n.body = [];
    if (type === 'repeat') n.n = 3;
    return n;
  }
  function find(id, list, parent) {
    list = list || program;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return { list: list, index: i, node: list[i], parent: parent || null };
      if (list[i].body) {
        var r = find(id, list[i].body, list[i]);
        if (r) return r;
      }
    }
    return null;
  }
  function countBlocks(list) {
    var c = 0;
    (list || program).forEach(function (n) { c += 1 + (n.body ? countBlocks(n.body) : 0); });
    return c;
  }
  function contains(node, id) {
    if (!node.body) return false;
    return node.body.some(function (c) { return c.id === id || contains(c, id); });
  }

  // ---------- Paleta ----------
  function renderPalette() {
    paletteEl.innerHTML = '';
    LEVELS[levelIndex].blocks.forEach(function (type) {
      var def = BLOCKS[type];
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pblk ' + def.cls + (def.container ? ' is-container' : '');
      b.dataset.type = type;
      b.innerHTML = '<span class="blk-icon" aria-hidden="true">' + def.icon + '</span><span>' + def.label + (type === 'repeat' ? ' … veces' : '') + '</span>';
      b.setAttribute('aria-label', 'Agregar bloque ' + def.label);
      b.addEventListener('pointerdown', function (e) { pointerDown(e, { type: type }, b); });
      b.addEventListener('click', function () {
        if (justDragged) return;
        addBlock(type);
      });
      paletteEl.appendChild(b);
    });
  }

  function addBlock(type) {
    if (running) return;
    if (countBlocks() >= MAX_BLOCKS) { say('Tu programa ya tiene ' + MAX_BLOCKS + ' bloques. Prueba con "repetir".'); return; }
    var node = newNode(type);
    var target = program;
    if (selectedId) {
      var loc = find(selectedId);
      if (loc && loc.node.body) target = loc.node.body; else selectedId = null;
    }
    target.push(node);
    renderWorkspace();
  }

  // ---------- Área de trabajo ----------
  function renderWorkspace() {
    workspace.innerHTML = '';
    if (!program.length) {
      var empty = document.createElement('p');
      empty.className = 'ws-empty';
      empty.textContent = 'Arrastra aquí los bloques o tócalos para agregarlos.';
      workspace.appendChild(empty);
    }
    program.forEach(function (n) { workspace.appendChild(renderNode(n)); });
    workspace.appendChild(indicator);
    var c = countBlocks();
    countEl.textContent = c + (c === 1 ? ' bloque' : ' bloques');
    codeOut.textContent = toCode(program, '') || '# Tu programa está vacío';
  }

  function renderNode(node) {
    var def = BLOCKS[node.type];
    var el = document.createElement('div');
    el.className = 'blk ' + def.cls + (def.container ? ' is-container' : '') + (node.id === selectedId ? ' is-selected' : '');
    el.dataset.id = node.id;

    var head = document.createElement('div');
    head.className = 'blk-head';
    var grip = document.createElement('span');
    grip.className = 'blk-label';
    grip.innerHTML = '<span class="blk-icon" aria-hidden="true">' + def.icon + '</span><span>' + def.label + '</span>';
    head.appendChild(grip);

    if (node.type === 'repeat') {
      var sel = document.createElement('select');
      sel.className = 'blk-num';
      sel.setAttribute('aria-label', 'Número de veces');
      for (var i = 2; i <= 10; i++) {
        var o = document.createElement('option');
        o.value = i; o.textContent = i;
        if (i === node.n) o.selected = true;
        sel.appendChild(o);
      }
      sel.addEventListener('change', function () { node.n = parseInt(sel.value, 10); renderWorkspace(); });
      sel.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
      head.appendChild(sel);
      var veces = document.createElement('span');
      veces.textContent = 'veces';
      head.appendChild(veces);
    }

    var del = document.createElement('button');
    del.type = 'button';
    del.className = 'blk-del';
    del.setAttribute('aria-label', 'Quitar bloque ' + def.label);
    del.innerHTML = '<span aria-hidden="true">×</span>';
    del.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    del.addEventListener('click', function () { if (!running) removeNode(node.id); });
    head.appendChild(del);

    head.addEventListener('pointerdown', function (e) { pointerDown(e, { id: node.id }, el); });
    if (def.container) {
      head.addEventListener('click', function (e) {
        if (justDragged || e.target.closest('select, button')) return;
        selectedId = selectedId === node.id ? null : node.id;
        renderWorkspace();
        if (selectedId) say('Los bloques que toques se agregarán dentro de "' + def.label + '". Toca otra vez para salir.');
      });
    }
    el.appendChild(head);

    if (def.container) {
      var slot = document.createElement('div');
      slot.className = 'blk-slot';
      slot.dataset.id = node.id;
      if (!node.body.length) {
        var ph = document.createElement('div');
        ph.className = 'slot-empty';
        ph.textContent = 'pon bloques aquí';
        slot.appendChild(ph);
      }
      node.body.forEach(function (c) { slot.appendChild(renderNode(c)); });
      el.appendChild(slot);
      var foot = document.createElement('div');
      foot.className = 'blk-foot';
      el.appendChild(foot);
    }
    return el;
  }

  function removeNode(id) {
    var loc = find(id);
    if (!loc) return;
    loc.list.splice(loc.index, 1);
    if (selectedId && (selectedId === id || !find(selectedId))) selectedId = null;
    renderWorkspace();
  }

  function toCode(list, pad) {
    return list.map(function (n) {
      if (n.type === 'repeat') {
        return pad + 'for i in range(' + n.n + '):\n' + (toCode(n.body, pad + '    ') || pad + '    pass');
      }
      if (n.type === 'ifEnemy') {
        return pad + BLOCKS.ifEnemy.code + '\n' + (toCode(n.body, pad + '    ') || pad + '    pass');
      }
      return pad + BLOCKS[n.type].code;
    }).join('\n');
  }

  // ---------- Arrastrar y soltar ----------
  var drag = null;
  var justDragged = false;

  function pointerDown(e, source, el) {
    if (running || (e.button !== undefined && e.button !== 0)) return;
    drag = { source: source, el: el, startX: e.clientX, startY: e.clientY, active: false, pointerId: e.pointerId, target: null };
    window.addEventListener('pointermove', pointerMove);
    window.addEventListener('pointerup', pointerUp);
    window.addEventListener('pointercancel', cancelDrag);
  }

  function pointerMove(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    if (!drag.active) {
      if (Math.abs(e.clientX - drag.startX) + Math.abs(e.clientY - drag.startY) < 8) return;
      drag.active = true;
      var label = drag.source.type ? BLOCKS[drag.source.type] : BLOCKS[find(drag.source.id).node.type];
      var ghost = document.createElement('div');
      ghost.className = 'drag-ghost pblk ' + label.cls;
      ghost.innerHTML = '<span class="blk-icon" aria-hidden="true">' + label.icon + '</span><span>' + label.label + '</span>';
      document.body.appendChild(ghost);
      drag.ghost = ghost;
      if (drag.source.id) { drag.el.classList.add('is-dragging'); document.body.classList.add('dragging-existing'); }
      document.body.classList.add('is-dragging-block');
    }
    e.preventDefault();
    drag.ghost.style.transform = 'translate(' + (e.clientX + 12) + 'px,' + (e.clientY + 8) + 'px)';
    drag.target = computeTarget(e.clientX, e.clientY);
    showIndicator(drag.target);
    autoScroll(e.clientY);
  }

  function autoScroll(y) {
    var r = workspace.getBoundingClientRect();
    if (y > r.top && y < r.top + 30) workspace.scrollTop -= 12;
    else if (y < r.bottom && y > r.bottom - 30) workspace.scrollTop += 12;
  }

  function pointerUp(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    var wasActive = drag.active;
    if (wasActive) {
      var t = drag.target;
      if (t && t.trash && drag.source.id) {
        removeNode(drag.source.id);
      } else if (t && !t.trash) {
        drop(t);
      }
      justDragged = true;
      setTimeout(function () { justDragged = false; }, 0);
    }
    cleanupDrag();
  }

  function cancelDrag() { cleanupDrag(); }

  function cleanupDrag() {
    window.removeEventListener('pointermove', pointerMove);
    window.removeEventListener('pointerup', pointerUp);
    window.removeEventListener('pointercancel', cancelDrag);
    if (drag && drag.ghost) drag.ghost.remove();
    if (drag && drag.el) drag.el.classList.remove('is-dragging');
    document.body.classList.remove('is-dragging-block', 'dragging-existing');
    indicator.hidden = true;
    drag = null;
  }

  function computeTarget(x, y) {
    var el = document.elementFromPoint(x, y);
    if (!el) return null;
    if (el.closest('.palette')) return drag.source.id ? { trash: true } : null;
    if (!workspace.contains(el)) return null;
    if (drag.source.id && drag.el.contains(el)) return null;

    var blk = el.closest('.blk');
    var empty = el.closest('.slot-empty');
    var slot = el.closest('.blk-slot');
    if (empty) {
      var c = find(empty.parentNode.dataset.id);
      return c ? { list: c.node.body, index: 0, ref: empty, pos: 'top', owner: c.node.id } : null;
    }
    if (blk) {
      var loc = find(blk.dataset.id);
      if (!loc) return null;
      var head = el.closest('.blk-head');
      var isSlotItself = slot && slot.closest('.blk') === blk;
      if (loc.node.body && head && head.parentNode === blk) {
        var hr = head.getBoundingClientRect();
        if (y < hr.top + hr.height / 2) return target(loc, loc.index, blk, 'top');
        return { list: loc.node.body, index: 0, ref: head, pos: 'bottom', owner: loc.node.id };
      }
      if (loc.node.body && isSlotItself) {
        var last = slot.lastElementChild;
        return { list: loc.node.body, index: loc.node.body.length, ref: last, pos: 'bottom', owner: loc.node.id };
      }
      if (el.closest('.blk-foot') && el.closest('.blk-foot').parentNode === blk) {
        return target(loc, loc.index + 1, blk, 'bottom');
      }
      var r = blk.getBoundingClientRect();
      if (y < r.top + r.height / 2) return target(loc, loc.index, blk, 'top');
      return target(loc, loc.index + 1, blk, 'bottom');
    }
    var lastRoot = null;
    for (var i = workspace.children.length - 1; i >= 0; i--) {
      if (workspace.children[i].classList.contains('blk')) { lastRoot = workspace.children[i]; break; }
    }
    return { list: program, index: program.length, ref: lastRoot, pos: lastRoot ? 'bottom' : 'start', owner: null };
  }

  function target(loc, index, ref, pos) {
    return { list: loc.list, index: index, ref: ref, pos: pos, owner: loc.parent ? loc.parent.id : null };
  }

  function showIndicator(t) {
    if (!t || t.trash) { indicator.hidden = true; return; }
    var wr = workspace.getBoundingClientRect();
    var top, left, width;
    if (t.ref) {
      var r = t.ref.getBoundingClientRect();
      top = (t.pos === 'top' ? r.top : r.bottom) - wr.top + workspace.scrollTop;
      left = r.left - wr.left;
      width = r.width;
    } else {
      top = 12 + workspace.scrollTop; left = 12; width = wr.width - 24;
    }
    indicator.style.top = (top - 2) + 'px';
    indicator.style.left = left + 'px';
    indicator.style.width = Math.max(60, width) + 'px';
    indicator.hidden = false;
  }

  function drop(t) {
    if (drag.source.id) {
      var loc = find(drag.source.id);
      if (!loc) return;
      if (t.owner && (t.owner === loc.node.id || contains(loc.node, t.owner))) return;
      var idx = t.index;
      if (loc.list === t.list && loc.index < idx) idx--;
      loc.list.splice(loc.index, 1);
      t.list.splice(idx, 0, loc.node);
    } else {
      if (countBlocks() >= MAX_BLOCKS) { say('Tu programa ya tiene ' + MAX_BLOCKS + ' bloques. Prueba con "repetir".'); return; }
      t.list.splice(t.index, 0, newNode(drag.source.type));
    }
    renderWorkspace();
  }

  // ---------- Juego ----------
  function loadGame() {
    var L = LEVELS[levelIndex];
    var g = { rows: L.map.length, cols: L.map[0].length, walls: {}, gems: {}, enemies: {}, gemTotal: 0, hero: null, flag: null, dir: 'right', failed: false, actions: 0 };
    L.map.forEach(function (row, y) {
      row.split('').forEach(function (ch, x) {
        var k = x + ',' + y;
        if (ch === '#') g.walls[k] = true;
        else if (ch === 'H') g.hero = { x: x, y: y };
        else if (ch === 'G') { g.gems[k] = true; g.gemTotal++; }
        else if (ch === 'E') g.enemies[k] = true;
        else if (ch === 'F') g.flag = { x: x, y: y };
      });
    });
    game = g;
    anim = null;
    effects = [];
    draw();
  }
  function gemsLeft() { return Object.keys(game.gems).length; }
  function frontKey() {
    var d = DIRS[game.dir];
    return (game.hero.x + d.dx) + ',' + (game.hero.y + d.dy);
  }
  function blocked(x, y) {
    return x < 0 || y < 0 || x >= game.cols || y >= game.rows || game.walls[x + ',' + y];
  }

  // Ejecuta el programa paso a paso (cada "yield" es una acción animada)
  function* exec(list) {
    for (var i = 0; i < list.length; i++) {
      var n = list[i];
      if (game.failed) return;
      if (n.type === 'repeat') {
        for (var k = 0; k < n.n; k++) {
          yield { highlight: n.id, wait: true };
          yield* exec(n.body);
          if (game.failed || game.won) return;
        }
      } else if (n.type === 'ifEnemy') {
        yield { highlight: n.id, wait: true };
        if (game.enemies[frontKey()]) yield* exec(n.body);
      } else {
        yield { highlight: n.id, action: n.type };
      }
      if (game.failed || game.won) return;
    }
  }

  function doAction(type) {
    game.actions++;
    if (game.actions > MAX_ACTIONS) return fail('El programa es demasiado largo. Revisa tus bloques "repetir".');
    var h = game.hero;
    if (DIRS[type]) {
      game.dir = type;
      var nx = h.x + DIRS[type].dx, ny = h.y + DIRS[type].dy;
      if (blocked(nx, ny)) { bump(nx, ny); return fail('¡Ups! El héroe chocó. Revisa hacia dónde se mueve.'); }
      if (game.enemies[nx + ',' + ny]) { bump(nx, ny); return fail('¡Un slime bloquea el camino! Usa "atacar" antes de avanzar.'); }
      anim = { fx: h.x, fy: h.y, tx: nx, ty: ny, start: performance.now(), dur: stepMs() * 0.8 };
      h.x = nx; h.y = ny;
      var k = nx + ',' + ny;
      if (game.gems[k]) { delete game.gems[k]; effects.push({ kind: 'gem', x: nx, y: ny, start: performance.now() }); }
      if (game.flag.x === nx && game.flag.y === ny && gemsLeft() === 0) game.won = true;
    } else if (type === 'attack') {
      var fk = frontKey();
      var p = fk.split(',');
      effects.push({ kind: 'slash', x: +p[0], y: +p[1], start: performance.now() });
      if (game.enemies[fk]) {
        delete game.enemies[fk];
        effects.push({ kind: 'poof', x: +p[0], y: +p[1], start: performance.now() });
      }
    }
  }
  function bump(x, y) { effects.push({ kind: 'bump', x: x, y: y, start: performance.now() }); }
  function fail(msg) { game.failed = msg; }

  function stepMs() { return 420; }

  function run() {
    if (running) return;
    if (!program.length) { say('Primero agrega bloques a tu programa.'); return; }
    hideOverlay();
    loadGame();
    running = true;
    document.body.classList.add('game-running');
    runBtn.disabled = true;
    say('Ejecutando tu programa…');
    var gen = exec(program);
    function tick() {
      if (!running) return;
      var r = gen.next();
      clearHighlight();
      if (r.done || game.failed || game.won) { finish(); return; }
      highlight(r.value.highlight);
      if (r.value.action) doAction(r.value.action);
      loop();
      if (game.failed || game.won) { timer = setTimeout(finish, stepMs()); return; }
      timer = setTimeout(tick, r.value.wait ? stepMs() / 3 : stepMs());
    }
    tick();
  }

  function finish() {
    running = false;
    document.body.classList.remove('game-running');
    runBtn.disabled = false;
    clearHighlight();
    if (game.failed) { say(game.failed); showOverlay(false, game.failed); return; }
    if (game.won) {
      var used = countBlocks();
      var best = LEVELS[levelIndex].best;
      var stars = used <= best ? 3 : used <= best + 3 ? 2 : 1;
      if (!progress[levelIndex] || progress[levelIndex] < stars) { progress[levelIndex] = stars; saveProgress(); }
      renderLevels();
      var msg = stars === 3 ? '¡Perfecto! Lo resolviste con ' + used + ' bloques.' :
        'Usaste ' + used + ' bloques. Reto: ¿puedes hacerlo con ' + best + '?';
      say('¡Nivel superado! ' + msg);
      showOverlay(true, msg, stars);
      return;
    }
    var m = (game.flag.x === game.hero.x && game.flag.y === game.hero.y && gemsLeft()) ?
      'Llegaste a la bandera, pero te faltan ' + gemsLeft() + (gemsLeft() === 1 ? ' gema.' : ' gemas.') :
      'El programa terminó y el héroe no llegó a la bandera. ¡Agrega más bloques!';
    say(m);
    showOverlay(false, m);
  }

  function stop() {
    running = false;
    clearTimeout(timer);
    document.body.classList.remove('game-running');
    runBtn.disabled = false;
    clearHighlight();
    hideOverlay();
    loadGame();
    say('Listo. Ajusta tu programa y vuelve a ejecutarlo.');
  }

  function highlight(id) {
    var el = workspace.querySelector('[data-id="' + id + '"]');
    if (el) el.classList.add('is-running');
  }
  function clearHighlight() {
    workspace.querySelectorAll('.is-running').forEach(function (el) { el.classList.remove('is-running'); });
  }
  function say(msg) { statusEl.textContent = msg; }

  // ---------- Resultado ----------
  function showOverlay(won, msg, stars) {
    var last = levelIndex === LEVELS.length - 1;
    overlay.className = 'game-overlay ' + (won ? 'is-win' : 'is-fail');
    var html = '<div class="overlay-card">';
    html += '<p class="overlay-title">' + (won ? (last ? '¡Completaste todos los niveles!' : '¡Nivel superado!') : 'Casi lo logras') + '</p>';
    if (won) {
      html += '<p class="overlay-stars" aria-label="' + stars + ' de 3 estrellas">';
      for (var i = 0; i < 3; i++) html += '<span class="' + (i < stars ? 'on' : '') + '" aria-hidden="true">★</span>';
      html += '</p>';
    }
    html += '<p class="overlay-msg"></p><div class="overlay-actions">';
    if (won && !last) html += '<button type="button" class="btn btn-yellow" data-act="next">Siguiente nivel</button>';
    if (won && last) html += '<a class="btn btn-yellow" href="#siguiente">¿Y ahora qué?</a>';
    html += '<button type="button" class="btn btn-ghost-light" data-act="retry">' + (won ? 'Jugar otra vez' : 'Intentar de nuevo') + '</button>';
    html += '</div></div>';
    overlay.innerHTML = html;
    overlay.querySelector('.overlay-msg').textContent = msg;
    overlay.hidden = false;
    var first = overlay.querySelector('button, a');
    if (first) first.focus({ preventScroll: true });
  }
  function hideOverlay() { overlay.hidden = true; overlay.innerHTML = ''; }
  overlay.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'next') setLevel(levelIndex + 1);
    else stop();
  });

  // ---------- Niveles ----------
  function renderLevels() {
    levelsEl.innerHTML = '';
    LEVELS.forEach(function (L, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'lvl' + (i === levelIndex ? ' is-current' : '') + (progress[i] ? ' is-done' : '');
      var locked = !isUnlocked(i);
      b.disabled = locked;
      var stars = progress[i] ? new Array(progress[i] + 1).join('★') : '';
      b.innerHTML = '<span class="lvl-num">' + (i + 1) + '</span><span class="lvl-stars" aria-hidden="true">' + (locked ? '🔒' : stars) + '</span>';
      b.setAttribute('aria-label', 'Nivel ' + (i + 1) + ': ' + L.name + (locked ? ' (bloqueado)' : progress[i] ? ' (' + progress[i] + ' estrellas)' : ''));
      if (i === levelIndex) b.setAttribute('aria-current', 'step');
      b.addEventListener('click', function () { if (!running) setLevel(i); });
      levelsEl.appendChild(b);
    });
  }

  function setLevel(i) {
    if (i < 0 || i >= LEVELS.length || !isUnlocked(i)) return;
    running = false;
    clearTimeout(timer);
    document.body.classList.remove('game-running');
    runBtn.disabled = false;
    levelIndex = i;
    program = [];
    selectedId = null;
    var L = LEVELS[i];
    $('level-title').textContent = 'Nivel ' + (i + 1) + ': ' + L.name;
    $('level-goal').textContent = L.goal;
    $('level-hint').textContent = L.hint;
    canvas.setAttribute('aria-label', 'Mapa del nivel ' + (i + 1) + '. ' + L.goal);
    hideOverlay();
    renderLevels();
    renderPalette();
    renderWorkspace();
    loadGame();
    resize();
    say('Arma tu programa y presiona Ejecutar.');
  }

  // ---------- Dibujo ----------
  var tile = 40, dpr = 1;
  function resize() {
    var w = canvas.parentNode.clientWidth;
    tile = Math.floor(w / game.cols);
    dpr = window.devicePixelRatio || 1;
    canvas.style.width = (tile * game.cols) + 'px';
    canvas.style.height = (tile * game.rows) + 'px';
    canvas.width = Math.round(tile * game.cols * dpr);
    canvas.height = Math.round(tile * game.rows * dpr);
    draw();
  }

  var rafId = null;
  function loop() {
    if (rafId) return;
    function frame() {
      draw();
      var now = performance.now();
      effects = effects.filter(function (f) { return now - f.start < 600; });
      if ((anim && now - anim.start < anim.dur) || effects.length) rafId = requestAnimationFrame(frame);
      else { rafId = null; anim = null; draw(); }
    }
    rafId = requestAnimationFrame(frame);
  }

  function draw() {
    if (!game) return;
    var T = tile;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, T * game.cols, T * game.rows);
    var now = performance.now();
    for (var y = 0; y < game.rows; y++) {
      for (var x = 0; x < game.cols; x++) {
        ctx.fillStyle = (x + y) % 2 ? '#A6E38A' : '#B4EA98';
        ctx.fillRect(x * T, y * T, T, T);
      }
    }
    for (y = 0; y < game.rows; y++) {
      for (x = 0; x < game.cols; x++) {
        if (game.walls[x + ',' + y]) drawTree(x * T, y * T, T, x, y);
      }
    }
    drawFlag(game.flag.x * T, game.flag.y * T, T, gemsLeft() === 0);
    Object.keys(game.gems).forEach(function (k) {
      var p = k.split(',');
      drawGem(+p[0] * T, +p[1] * T, T, now);
    });
    Object.keys(game.enemies).forEach(function (k) {
      var p = k.split(',');
      drawSlime(+p[0] * T, +p[1] * T, T, now);
    });
    var hx = game.hero.x, hy = game.hero.y;
    if (anim) {
      var t = Math.min(1, (now - anim.start) / anim.dur);
      var e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      hx = anim.fx + (anim.tx - anim.fx) * e;
      hy = anim.fy + (anim.ty - anim.fy) * e;
    }
    drawHero(hx * T, hy * T, T, game.dir, game.failed);
    effects.forEach(function (f) {
      var k = (now - f.start) / 600;
      var cx = f.x * T + T / 2, cy = f.y * T + T / 2;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - k);
      if (f.kind === 'gem') {
        ctx.fillStyle = '#FFD23F';
        for (var i = 0; i < 6; i++) {
          var a = i / 6 * Math.PI * 2;
          ctx.beginPath(); ctx.arc(cx + Math.cos(a) * T * 0.45 * k, cy + Math.sin(a) * T * 0.45 * k, T * 0.06, 0, 7); ctx.fill();
        }
      } else if (f.kind === 'poof') {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(cx, cy, T * (0.2 + 0.3 * k), 0, 7); ctx.fill();
      } else if (f.kind === 'slash') {
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = T * 0.08; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(cx, cy, T * 0.32, -2.4 + k, -0.6 + k); ctx.stroke();
      } else if (f.kind === 'bump') {
        ctx.strokeStyle = '#FF3B30'; ctx.lineWidth = T * 0.07;
        ctx.strokeRect(f.x * T + 3, f.y * T + 3, T - 6, T - 6);
      }
      ctx.restore();
    });
  }

  function drawTree(x, y, T, gx, gy) {
    var cx = x + T / 2;
    ctx.fillStyle = '#7A4E2D';
    ctx.fillRect(cx - T * 0.07, y + T * 0.55, T * 0.14, T * 0.32);
    ctx.fillStyle = (gx * 7 + gy * 3) % 3 ? '#2D7A1F' : '#3C8F2A';
    ctx.beginPath(); ctx.arc(cx, y + T * 0.42, T * 0.33, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    ctx.beginPath(); ctx.arc(cx - T * 0.1, y + T * 0.32, T * 0.11, 0, 7); ctx.fill();
  }
  function drawGem(x, y, T, now) {
    var cx = x + T / 2, cy = y + T / 2 + Math.sin(now / 300 + x) * T * 0.03;
    var s = T * 0.24;
    ctx.fillStyle = '#4FC3F7';
    ctx.strokeStyle = '#01579B'; ctx.lineWidth = Math.max(1.5, T * 0.04);
    ctx.beginPath(); ctx.moveTo(cx, cy - s); ctx.lineTo(cx + s * 0.8, cy); ctx.lineTo(cx, cy + s); ctx.lineTo(cx - s * 0.8, cy); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    ctx.beginPath(); ctx.moveTo(cx - s * 0.2, cy - s * 0.5); ctx.lineTo(cx + s * 0.1, cy - s * 0.2); ctx.lineTo(cx - s * 0.3, cy); ctx.closePath(); ctx.fill();
  }
  function drawSlime(x, y, T, now) {
    var cx = x + T / 2, by = y + T * 0.82;
    var sq = 1 + Math.sin(now / 250 + x) * 0.05;
    var w = T * 0.36 * sq, h = T * 0.42 / sq;
    ctx.fillStyle = '#8E44AD';
    ctx.beginPath();
    ctx.moveTo(cx - w, by);
    ctx.quadraticCurveTo(cx - w, by - h * 1.4, cx, by - h * 1.3);
    ctx.quadraticCurveTo(cx + w, by - h * 1.4, cx + w, by);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx - w * 0.35, by - h * 0.7, T * 0.07, 0, 7); ctx.arc(cx + w * 0.35, by - h * 0.7, T * 0.07, 0, 7); ctx.fill();
    ctx.fillStyle = '#1B1B1B';
    ctx.beginPath(); ctx.arc(cx - w * 0.35, by - h * 0.68, T * 0.035, 0, 7); ctx.arc(cx + w * 0.35, by - h * 0.68, T * 0.035, 0, 7); ctx.fill();
  }
  function drawFlag(x, y, T, ready) {
    ctx.fillStyle = 'rgba(11,37,69,.15)';
    ctx.beginPath(); ctx.ellipse(x + T * 0.42, y + T * 0.86, T * 0.22, T * 0.07, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#0B2545';
    ctx.fillRect(x + T * 0.38, y + T * 0.15, T * 0.07, T * 0.72);
    ctx.fillStyle = ready ? '#FFD23F' : '#FF6B5B';
    ctx.beginPath(); ctx.moveTo(x + T * 0.45, y + T * 0.16); ctx.lineTo(x + T * 0.82, y + T * 0.3); ctx.lineTo(x + T * 0.45, y + T * 0.44); ctx.closePath(); ctx.fill();
  }
  function drawHero(x, y, T, dir, hurt) {
    var cx = x + T / 2, cy = y + T / 2;
    var d = DIRS[dir];
    ctx.fillStyle = 'rgba(11,37,69,.2)';
    ctx.beginPath(); ctx.ellipse(cx, y + T * 0.86, T * 0.26, T * 0.07, 0, 0, 7); ctx.fill();
    // cuerpo
    ctx.fillStyle = hurt ? '#FF6B5B' : '#00838F';
    ctx.beginPath(); ctx.arc(cx, cy + T * 0.08, T * 0.3, 0, 7); ctx.fill();
    // casco
    ctx.fillStyle = '#0B2545';
    ctx.beginPath(); ctx.arc(cx, cy - T * 0.02, T * 0.26, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#FFD23F';
    ctx.fillRect(cx - T * 0.03, cy - T * 0.34, T * 0.06, T * 0.1);
    // ojos hacia la dirección
    var ex = d.dx * T * 0.08, ey = d.dy * T * 0.06;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx - T * 0.1 + ex, cy + T * 0.06 + ey, T * 0.07, 0, 7); ctx.arc(cx + T * 0.1 + ex, cy + T * 0.06 + ey, T * 0.07, 0, 7); ctx.fill();
    ctx.fillStyle = '#0B2545';
    ctx.beginPath(); ctx.arc(cx - T * 0.1 + ex * 1.4, cy + T * 0.06 + ey * 1.4, T * 0.035, 0, 7); ctx.arc(cx + T * 0.1 + ex * 1.4, cy + T * 0.06 + ey * 1.4, T * 0.035, 0, 7); ctx.fill();
    // espada del lado al que mira
    ctx.strokeStyle = '#E3EEF1'; ctx.lineWidth = Math.max(2, T * 0.06); ctx.lineCap = 'round';
    var sx = cx + (d.dx || 0.9) * T * 0.3, sy = cy + T * 0.1 + d.dy * T * 0.25;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + (d.dx || 0) * T * 0.16, sy - T * 0.18 + d.dy * T * 0.2); ctx.stroke();
  }

  // ---------- Controles ----------
  runBtn.addEventListener('click', run);
  resetBtn.addEventListener('click', stop);
  clearBtn.addEventListener('click', function () {
    if (running) return;
    program = []; selectedId = null; renderWorkspace(); say('Programa borrado.');
  });
  workspace.addEventListener('click', function (e) {
    if (selectedId && (e.target === workspace || e.target.classList.contains('ws-empty'))) { selectedId = null; renderWorkspace(); }
  });
  var resizeTimer;
  window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 100); });

  // Empieza en el primer nivel sin terminar
  var start = 0;
  while (start < LEVELS.length - 1 && progress[start]) start++;
  setLevel(start);
})();
