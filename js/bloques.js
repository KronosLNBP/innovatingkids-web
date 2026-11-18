/* Innovating Kids — Programación con bloques
   Juego para guiar al héroe armando un programa con bloques.
   Sin librerías: arrastrar y soltar con Pointer Events, o tocar un bloque para agregarlo. */
(function () {
  'use strict';

  // Capítulos: cada uno introduce una idea nueva de programación
  var CHAPTERS = [
    { name: 'Secuencias', desc: 'Dar instrucciones en orden' },
    { name: 'Ciclos', desc: 'Repetir sin escribir de más' },
    { name: 'Condicionales', desc: 'Decidir según lo que pasa' },
    { name: 'Gran reto', desc: 'Usa todo lo que aprendiste' }
  ];
  var B_MOVE = ['right', 'left', 'up', 'down'];
  var B_ATK = B_MOVE.concat(['attack']);
  var B_LOOP = B_ATK.concat(['repeat']);
  var B_IF = B_LOOP.concat(['ifEnemy']);
  var B_UNTIL = B_IF.concat(['untilGoal']);
  var B_ALL = B_UNTIL.concat(['ifPath']);

  // ---------- Niveles ----------
  // Leyenda: . camino  # obstáculo  H héroe  G gema  E slime  F bandera
  var LEVELS = [
    // Capítulo 1: Secuencias
    { ch: 0, name: 'Primeros pasos', goal: 'Lleva al héroe hasta la bandera.',
      hint: 'Arrastra el bloque "mover derecha" a tu programa (o tócalo) y presiona Ejecutar.',
      map: ['########', '########', '#H...F##', '########', '########', '########'], blocks: B_MOVE, best: 4 },
    { ch: 0, name: 'La vuelta', goal: 'El camino da vuelta. Llega a la bandera sin chocar.',
      hint: 'Cuenta los cuadros: primero a la derecha, luego hacia abajo y otra vez a la derecha.',
      map: ['########', '#H..####', '###.####', '###...F#', '########', '########'], blocks: B_MOVE, best: 7 },
    { ch: 0, name: 'Hacia arriba', goal: 'Esta vez la bandera está arriba. ¡Encuentra el camino!',
      hint: 'Usa "mover arriba" antes de ir a la derecha.',
      map: ['########', '#...F###', '#.######', '#H######', '########', '########'], blocks: B_MOVE, best: 5 },
    { ch: 0, name: 'Cazador de gemas', goal: 'Recoge todas las gemas y después llega a la bandera.',
      hint: 'Para recoger una gema solo pasa por encima de ella.',
      map: ['########', '#H.G.###', '####.###', '#F.G.###', '########', '########'], blocks: B_MOVE, best: 8 },
    { ch: 0, name: '¡Un slime!', goal: 'Un slime bloquea el camino. Derrótalo y llega a la bandera.',
      hint: 'Ponte junto al slime, mirando hacia él, y usa el bloque "atacar".',
      map: ['########', '########', '#H.E..F#', '########', '########', '########'], blocks: B_ATK, best: 6 },
    { ch: 0, name: 'Zigzag', goal: 'Recoge las gemas, derrota al slime y llega a la bandera.',
      hint: 'Divide el camino en partes: derecha, abajo, y otra vez derecha. El slime está al final.',
      map: ['########', '#H.G####', '###.####', '###.GEF#', '########', '########'], blocks: B_ATK, best: 8 },

    // Capítulo 2: Ciclos
    { ch: 1, name: 'El pasillo largo', goal: 'Llega a la bandera usando muy pocos bloques.',
      hint: 'El bloque "repetir" hace lo mismo varias veces. Mete "mover derecha" dentro y elige cuántas veces.',
      map: ['########', '########', 'H......F', '########', '########', '########'], blocks: B_LOOP, best: 2 },
    { ch: 1, name: 'La escalera', goal: 'Baja la escalera hasta la bandera.',
      hint: 'Busca el patrón que se repite: derecha, abajo, derecha, abajo…',
      map: ['H.######', '#..#####', '##..####', '###..###', '####..##', '#####.F#'], blocks: B_LOOP, best: 4 },
    { ch: 1, name: 'La vuelta al cuadro', goal: 'Recoge las 2 gemas y llega a la bandera con pocos bloques.',
      hint: 'Usa un "repetir" para cada lado: derecha, abajo, izquierda y arriba.',
      map: ['########', '#H...G##', '#F###.##', '#.###.##', '#G....##', '########'], blocks: B_LOOP, best: 8 },
    { ch: 1, name: 'Montaña', goal: 'Baja y luego sube hasta la bandera.',
      hint: 'Dos "repetir": uno con derecha y abajo, otro con derecha y arriba.',
      map: ['H.####F#', '#..##..#', '##....##', '###..###', '########', '########'], blocks: B_LOOP, best: 6 },
    { ch: 1, name: 'Fila de slimes', goal: 'Los slimes están en orden. Derrótalos con un "repetir".',
      hint: 'El patrón es: mover derecha, atacar, mover derecha. Al final da un paso más.',
      map: ['########', '########', 'H.E.E.EF', '########', '########', '########'], blocks: B_LOOP, best: 5 },
    { ch: 1, name: 'Escalones dobles', goal: 'Cada escalón tiene 2 pasos. Llega a la bandera.',
      hint: 'Dentro de un "repetir": derecha, derecha, abajo, abajo. ¿Cuántas veces se repite?',
      map: ['H..#####', '##.#####', '##...###', '####.###', '####..F#', '########'], blocks: B_LOOP, best: 7 },
    { ch: 1, name: 'Gemas en el techo', goal: 'Sube por cada gema y regresa al pasillo.',
      hint: 'Patrón: derecha, arriba, abajo, derecha. Repítelo 3 veces y da un paso más.',
      map: ['########', '#G#G#G##', 'H......F', '########', '########', '########'], blocks: B_LOOP, best: 6 },
    { ch: 1, name: 'Repetir dentro de repetir', goal: 'Las gemas están al fondo de cada cueva. ¡Recógelas todas!',
      hint: 'Puedes poner un "repetir" dentro de otro: derecha, sube 2, baja 2, derecha.',
      map: ['########', '#G#G#G##', '#.#.#.##', 'H......F', '########', '########'], blocks: B_LOOP, best: 8 },

    // Capítulo 3: Condicionales
    { ch: 2, name: 'Patrulla de slimes', goal: 'Hay slimes en el camino, pero no sabes dónde. Llega a la bandera.',
      hint: 'Dentro de "repetir": "si hay enemigo enfrente" con "atacar" adentro, y después "mover derecha".',
      map: ['########', '########', 'H.E..E.F', '########', '########', '########'], blocks: B_IF, best: 4 },
    { ch: 2, name: 'Slimes sorpresa', goal: 'Más slimes y una gema. El mismo programa sirve para todo el pasillo.',
      hint: 'Repite 7 veces: si hay enemigo enfrente, atacar; luego mover derecha.',
      map: ['########', '########', 'HE.EEG.F', '########', '########', '########'], blocks: B_IF, best: 4 },
    { ch: 2, name: 'Hasta la meta', goal: 'Un pasillo muy largo. Usa el bloque nuevo "repetir hasta llegar a la meta".',
      hint: 'Este bloque repite lo de adentro hasta que el héroe llega a la bandera. No tienes que contar.',
      map: ['##########', '##########', 'H........F', '##########', '##########'], blocks: B_UNTIL, best: 2 },
    { ch: 2, name: 'Escalera sin contar', goal: 'Baja la escalera sin contar los escalones.',
      hint: '"Repetir hasta llegar a la meta" con "mover derecha" y "mover abajo" adentro.',
      map: ['H.######', '#..#####', '##..####', '###..###', '####..##', '#####F##'], blocks: B_UNTIL, best: 3 },
    { ch: 2, name: 'El camino decide', goal: 'El camino cambia. Usa "si hay camino… si no…" para decidir.',
      hint: 'Repetir hasta la meta: si hay camino a la derecha, mover derecha; si no, mover abajo.',
      map: ['H..#####', '##.#####', '##....##', '#####.##', '#####..F', '########'], blocks: B_ALL, best: 4 },
    { ch: 2, name: 'Laberinto de gemas', goal: 'Recoge las gemas del laberinto con el mismo programa.',
      hint: 'El programa del nivel anterior funciona aquí. ¡Las gemas se recogen solas al pasar!',
      map: ['H.G#####', '##.#####', '##G..###', '####.###', '####G..F', '########'], blocks: B_ALL, best: 4 },
    { ch: 2, name: 'Slimes en el laberinto', goal: 'Ahora hay slimes en el laberinto. Combina las dos condiciones.',
      hint: 'Dentro de "repetir hasta la meta": primero "si hay enemigo enfrente → atacar", después "si hay camino a la derecha… si no…".',
      map: ['H.E#####', '##.#####', '##..E.##', '#####.##', '#####..F', '########'], blocks: B_ALL, best: 6 },
    { ch: 2, name: 'Laberinto al revés', goal: 'La bandera está arriba a la izquierda. ¡Cambia las direcciones!',
      hint: 'Si hay camino a la izquierda, mover izquierda; si no, mover arriba.',
      map: ['########', 'F..#####', '##.#####', '##....##', '#####.##', '#####..H'], blocks: B_ALL, best: 4 },

    // Capítulo 4: Gran reto
    { ch: 3, name: 'La gran aventura', goal: 'Recoge las gemas, derrota a los slimes y llega a la bandera.',
      hint: 'Divide el problema en partes: primero el camino de arriba, luego baja y regresa por abajo.',
      map: ['H.G.E..#', '######.#', '#F.E.G.#', '########', '########', '########'], blocks: B_ALL, best: 10 },
    { ch: 3, name: 'Fortaleza de slimes', goal: 'Un camino largo con gemas y slimes. Un solo programa para todo.',
      hint: 'Repetir hasta la meta: si hay enemigo, atacar; si hay camino a la derecha, avanzar; si no, bajar.',
      map: ['H.G.E.####', '#####.####', '#####G.E.#', '########.#', '########F#', '##########'], blocks: B_ALL, best: 6 },
    { ch: 3, name: 'El pozo', goal: 'Baja por el pozo derrotando a los slimes.',
      hint: 'Repetir hasta la meta: si hay enemigo enfrente, atacar; luego mover abajo.',
      map: ['###H####', '###.####', '###E####', '###.####', '###E####', '###G####', '###F####'], blocks: B_ALL, best: 4 },
    { ch: 3, name: 'Laberinto de cristal', goal: 'Un laberinto más grande. ¿Tu programa sigue funcionando?',
      hint: 'Si hay camino a la derecha, avanza; si no, baja. Repite hasta la meta.',
      map: ['HG..######', '###.######', '###.G..###', '######.###', '######G..F', '##########'], blocks: B_ALL, best: 4 },
    { ch: 3, name: 'Hacia la cima', goal: 'Empiezas abajo. Sube hasta la bandera.',
      hint: 'Prefiere subir: si hay camino arriba, mover arriba; si no, mover derecha.',
      map: ['########', '#####..F', '#####.##', '##....##', '##.#####', 'H..#####'], blocks: B_ALL, best: 4 },
    { ch: 3, name: 'Cuevas profundas', goal: 'Cada cueva tiene una gema al fondo. ¡Recógelas todas!',
      hint: 'Repite 3 veces: derecha, sube 3, baja 3, derecha. Al final, un paso más.',
      map: ['#G#G#G##', '#.#.#.##', '#.#.#.##', 'H......F', '########', '########'], blocks: B_ALL, best: 8 },
    { ch: 3, name: 'Mega laberinto', goal: 'El laberinto más largo, con gemas y slimes.',
      hint: 'El programa de "Fortaleza de slimes" te puede servir.',
      map: ['H.E..#####', '####.#####', '####G.E.##', '#######.##', '#######.##', '#######G.F', '##########'], blocks: B_ALL, best: 6 },
    { ch: 3, name: 'Gran final', goal: 'El último reto: sube, derrota a los slimes y recoge las gemas.',
      hint: 'Repetir hasta la meta: si hay enemigo, atacar; si hay camino arriba, subir; si no, avanzar a la derecha.',
      map: ['##########', '######G..F', '######.###', '###..E.###', '###G######', '###.######', 'H.E.######'], blocks: B_ALL, best: 6 }
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
    ifEnemy: { label: 'si hay enemigo enfrente', icon: '?', cls: 'b-if', container: true, code: 'if heroe.hay_enemigo_enfrente():' },
    untilGoal: { label: 'repetir hasta llegar a la meta', icon: '⟳', cls: 'b-loop', container: true, code: 'while not heroe.en_la_meta():' },
    ifPath: { label: 'si hay camino … si no', icon: '?', cls: 'b-if', container: true, hasElse: true }
  };
  var PATH_DIRS = [['right', 'derecha', 'derecha'], ['left', 'izquierda', 'izquierda'], ['up', 'arriba', 'arriba'], ['down', 'abajo', 'abajo']];

  var MAX_BLOCKS = 40;
  var MAX_ACTIONS = 300;
  var STORE_KEY = 'ik-bloques-v2';
  var TEACHER = /[?&]profe=1\b/.test(location.search);

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
  var hudEl = $('game-hud');
  var goalsEl = $('level-goals');
  var speedBtn = $('btn-speed');
  var fast = false;
  var indicator = document.createElement('div');
  indicator.className = 'ws-indicator';
  indicator.hidden = true;

  // ---------- Progreso (solo en este navegador) ----------
  var progress = {};
  try { progress = JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {}; } catch (e) { progress = {}; }
  function saveProgress() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(progress)); } catch (e) { /* sin almacenamiento */ }
  }
  function isUnlocked(i) { return TEACHER || i === 0 || !!progress[i - 1]; }

  // ---------- Mundos, héroes y sprites (pixel art original) ----------
  var SPRITES = {
    piloto: {
      pal: { w: '#F4F7FA', k: '#1B2434', c: '#5FD3F3', o: '#F07A2A', O: '#C85A14', y: '#FFD23F', b: '#3A2A20' },
      rows: ['....wwww....', '...wwwwww...', '..wwkkkkww..', '..wwkcckww..', '..wwkkkkww..', '...wwwwww...',
        '..oooooooo..', '.ooyooooOoo.', '.oo.oooo.oo.', '....oooo....', '...oo..oo...', '...bb..bb...']
    },
    astronauta: {
      pal: { w: '#FFFFFF', W: '#C9D3DE', b: '#1F63C6', c: '#9FE3FF', r: '#E53935', g: '#8A97A8', k: '#2B3442' },
      rows: ['...wwwwww...', '..wwwwwwww..', '.wwbbbbbbww.', '.wwbcbbbbww.', '.wwbbbbbbww.', '..wwwwwwww..',
        '.gwwwrwwwWg.', '.gwwwwwwwWg.', '..wwwwwwww..', '...ww..ww...', '...ww..ww...', '...kk..kk...']
    },
    robot: {
      pal: { t: '#00A3AD', T: '#007A82', y: '#D9FBFF', k: '#0B2545', r: '#FF6B5B', g: '#8A97A8' },
      rows: ['.....rr.....', '.....kk.....', '...tttttt...', '..tyyyyyyt..', '..tykyykyt..', '..tyyyyyyt..',
        '...tttttt...', '..gTTTTTTg..', '.gg.TrrT.gg.', '....TTTT....', '...kk..kk...', '...kk..kk...']
    },
    caballero: {
      pal: { p: '#7E57C2', P: '#4B2A8A', g: '#FFD23F', k: '#1B1030', r: '#E53935', b: '#1F63C6', y: '#FFFFFF' },
      rows: ['.....rr.....', '....rr......', '...pppppp...', '..pggggggp..', '..pkkkkkkp..', '..pppppppp..',
        '.bbbPppPpp..', 'bbybbpppppp.', 'bbbbbpppp.p.', '.bbb.pPPp...', '....pp..pp..', '....kk..kk..']
    },
    droide: {
      pal: { r: '#D81B60', R: '#9C1047', w: '#FFFFFF', k: '#1B1B1B', y: '#FFD23F' },
      rows: ['..k......k..', '...k....k...', '...rrrrrr...', '..rrrrrrrr..', '.rrwwrrwwrr.', '.rrwkrrwkrr.',
        '.rrrrrrrrrr.', '.RrrryyrrrR.', '.R.rrrrrr.R.', '.R.R....R.R.', '...k....k...']
    },
    cristal: {
      pal: { c: '#4FC3F7', m: '#E040FB', w: '#FFFFFF', d: '#7B1FA2' },
      rows: ['.....cc.....', '....cmmc....', '...cmwmmc...', '..cmwmmmmc..', '..cmmmmmdc..', '...cmmmdc...', '....cmdc....', '.....cc.....']
    }
  };
  var HEROES = [
    { id: 'ik', name: 'Héroe Innovating Kids' },
    { id: 'piloto', name: 'Piloto espacial' },
    { id: 'astronauta', name: 'Astronauta' },
    { id: 'robot', name: 'Robot explorador' },
    { id: 'caballero', name: 'Caballero galáctico' }
  ];
  var WORLDS = [
    { id: 'bosque', name: 'Bosque' },
    { id: 'espacio', name: 'Espacio' }
  ];
  var PREFS_KEY = 'ik-bloques-prefs';
  var prefs = { world: 'bosque', hero: 'ik' };
  try {
    var savedPrefs = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') || {};
    if (WORLDS.some(function (w) { return w.id === savedPrefs.world; })) prefs.world = savedPrefs.world;
    if (HEROES.some(function (h) { return h.id === savedPrefs.hero; })) prefs.hero = savedPrefs.hero;
  } catch (e) { /* sin almacenamiento */ }
  function savePrefs() {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (e) { /* sin almacenamiento */ }
  }
  function space() { return prefs.world === 'espacio'; }

  // En el mundo espacial cambian los nombres: gemas → cristales, slimes → droides, bandera → portal
  var SPACE_WORDS = [
    [/todas las gemas/g, 'todos los cristales'], [/las gemas/g, 'los cristales'], [/una gema/g, 'un cristal'],
    [/gemas/g, 'cristales'], [/gema/g, 'cristal'], [/encima de ella/g, 'encima de él'],
    [/Gemas/g, 'Cristales'], [/Gema/g, 'Cristal'], [/Slimes/g, 'Droides'], [/Slime/g, 'Droide'],
    [/slimes/g, 'droides'], [/slime/g, 'droide'],
    [/a la bandera/g, 'al portal'], [/la bandera/g, 'el portal'], [/bandera/g, 'portal'],
    [/los árboles/g, 'los asteroides'], [/árboles/g, 'asteroides']
  ];
  function tr(text) {
    if (!space()) return text;
    SPACE_WORDS.forEach(function (r) { text = text.replace(r[0], r[1]); });
    return text;
  }

  // ---------- Estado ----------
  var levelIndex = 0;
  var program = [];
  var selectedId = null; // contenedor elegido para agregar bloques con un toque
  var selectedBranch = 'body'; // 'body' o 'else' (rama "si no")
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
    if (type === 'ifPath') { n.dir = 'right'; n.elseBody = []; }
    return n;
  }
  function kids(n) { return (n.body || []).concat(n.elseBody || []); }
  function branchList(n, branch) { return branch === 'else' ? n.elseBody : n.body; }
  function find(id, list, parent) {
    list = list || program;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return { list: list, index: i, node: list[i], parent: parent || null };
      var lists = [list[i].body, list[i].elseBody];
      for (var j = 0; j < 2; j++) {
        if (!lists[j]) continue;
        var r = find(id, lists[j], list[i]);
        if (r) return r;
      }
    }
    return null;
  }
  function countBlocks(list) {
    var c = 0;
    (list || program).forEach(function (n) { c += 1 + countBlocks(kids(n)); });
    return c;
  }
  function contains(node, id) {
    return kids(node).some(function (c) { return c.id === id || contains(c, id); });
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
      if (loc && loc.node.body) target = branchList(loc.node, selectedBranch) || loc.node.body; else selectedId = null;
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
    renderGoals();
    codeOut.textContent = toCode(program, '') || '# Tu programa está vacío';
  }

  function renderNode(node) {
    var def = BLOCKS[node.type];
    var el = document.createElement('div');
    el.className = 'blk ' + def.cls + (def.container ? ' is-container' : '') + (node.id === selectedId && selectedBranch === 'body' ? ' is-selected' : '');
    el.dataset.id = node.id;

    var head = document.createElement('div');
    head.className = 'blk-head';
    var grip = document.createElement('span');
    grip.className = 'blk-label';
    grip.innerHTML = '<span class="blk-icon" aria-hidden="true">' + def.icon + '</span><span>' + (node.type === 'ifPath' ? 'si hay camino hacia' : def.label) + '</span>';
    head.appendChild(grip);

    if (node.type === 'ifPath') {
      var dsel = document.createElement('select');
      dsel.className = 'blk-num blk-dir';
      dsel.setAttribute('aria-label', 'Dirección del camino');
      PATH_DIRS.forEach(function (d) {
        var o = document.createElement('option');
        o.value = d[0]; o.textContent = d[1];
        if (d[0] === node.dir) o.selected = true;
        dsel.appendChild(o);
      });
      dsel.addEventListener('change', function () { node.dir = dsel.value; renderWorkspace(); });
      dsel.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
      head.appendChild(dsel);
    }

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
        selectedId = selectedId === node.id && selectedBranch === 'body' ? null : node.id;
        selectedBranch = 'body';
        renderWorkspace();
        if (selectedId) say('Los bloques que toques se agregarán dentro de "' + (node.type === 'ifPath' ? 'si hay camino' : def.label) + '". Toca otra vez para salir.');
      });
    }
    el.appendChild(head);

    if (def.container) {
      el.appendChild(renderSlot(node, 'body'));
      if (def.hasElse) {
        var mid = document.createElement('div');
        mid.className = 'blk-mid' + (node.id === selectedId && selectedBranch === 'else' ? ' is-selected' : '');
        mid.innerHTML = '<span>si no</span>';
        mid.addEventListener('pointerdown', function (e) { pointerDown(e, { id: node.id }, el); });
        mid.addEventListener('click', function () {
          if (justDragged) return;
          var same = selectedId === node.id && selectedBranch === 'else';
          selectedId = same ? null : node.id;
          selectedBranch = 'else';
          renderWorkspace();
          if (!same) say('Los bloques que toques se agregarán en "si no". Toca otra vez para salir.');
        });
        el.appendChild(mid);
        el.appendChild(renderSlot(node, 'else'));
      }
      var foot = document.createElement('div');
      foot.className = 'blk-foot';
      el.appendChild(foot);
    }
    return el;
  }

  function renderSlot(node, branch) {
    var list = branchList(node, branch);
    var slot = document.createElement('div');
    slot.className = 'blk-slot';
    slot.dataset.id = node.id;
    slot.dataset.branch = branch;
    if (!list.length) {
      var ph = document.createElement('div');
      ph.className = 'slot-empty';
      ph.textContent = 'pon bloques aquí';
      slot.appendChild(ph);
    }
    list.forEach(function (c) { slot.appendChild(renderNode(c)); });
    return slot;
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
      if (n.type === 'ifEnemy' || n.type === 'untilGoal') {
        return pad + BLOCKS[n.type].code + '\n' + (toCode(n.body, pad + '    ') || pad + '    pass');
      }
      if (n.type === 'ifPath') {
        var dn = PATH_DIRS.filter(function (d) { return d[0] === n.dir; })[0][2];
        return pad + "if heroe.hay_camino('" + dn + "'):\n" + (toCode(n.body, pad + '    ') || pad + '    pass') +
          '\n' + pad + 'else:\n' + (toCode(n.elseBody, pad + '    ') || pad + '    pass');
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
      return c ? { list: branchList(c.node, empty.parentNode.dataset.branch), index: 0, ref: empty, pos: 'top', owner: c.node.id } : null;
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
        var bl = branchList(loc.node, slot.dataset.branch);
        return { list: bl, index: bl.length, ref: last, pos: 'bottom', owner: loc.node.id };
      }
      var midEl = el.closest('.blk-mid');
      if (midEl && midEl.parentNode === blk) {
        return { list: loc.node.elseBody, index: 0, ref: midEl, pos: 'bottom', owner: loc.node.id };
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
    var g = { rows: L.map.length, cols: L.map[0].length, walls: {}, gems: {}, enemies: {}, gemTotal: 0, hero: null, flag: null, dir: 'right', failed: false, actions: 0, moves: 0, enemyTotal: 0 };
    L.map.forEach(function (row, y) {
      row.split('').forEach(function (ch, x) {
        var k = x + ',' + y;
        if (ch === '#') g.walls[k] = true;
        else if (ch === 'H') g.hero = { x: x, y: y };
        else if (ch === 'G') { g.gems[k] = true; g.gemTotal++; }
        else if (ch === 'E') { g.enemies[k] = true; g.enemyTotal++; }
        else if (ch === 'F') g.flag = { x: x, y: y };
      });
    });
    game = g;
    anim = null;
    effects = [];
    updateHud();
    draw();
  }
  function gemsLeft() { return Object.keys(game.gems).length; }
  function atFlag() { return game.hero.x === game.flag.x && game.hero.y === game.flag.y; }
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
      } else if (n.type === 'untilGoal') {
        var guard = 0;
        while (!atFlag()) {
          var before = game.actions;
          yield { highlight: n.id, wait: true };
          yield* exec(n.body);
          if (game.failed || game.won) return;
          if (game.actions === before || ++guard > 150) {
            fail('El héroe no avanza dentro de "repetir hasta llegar a la meta". Revisa los bloques de adentro.');
            yield { highlight: n.id, wait: true };
            return;
          }
        }
      } else if (n.type === 'ifPath') {
        yield { highlight: n.id, wait: true };
        var d = DIRS[n.dir];
        if (!blocked(game.hero.x + d.dx, game.hero.y + d.dy)) yield* exec(n.body);
        else yield* exec(n.elseBody);
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
      game.moves++;
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
  function afterAction() { updateHud(); }
  function bump(x, y) { effects.push({ kind: 'bump', x: x, y: y, start: performance.now() }); }
  function fail(msg) { game.failed = msg; }

  function stepMs() { return fast ? 190 : 420; }

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
      if (r.value.action) { doAction(r.value.action); afterAction(); }
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
      renderGoals();
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
  function say(msg) { statusEl.textContent = tr(msg); }

  // ---------- Resultado ----------
  function showOverlay(won, msg, stars) {
    var last = levelIndex === LEVELS.length - 1;
    overlay.className = 'game-overlay ' + (won ? 'is-win' : 'is-fail');
    var html = '<div class="overlay-card">';
    html += '<p class="overlay-title">' + (won ? (last ? '¡Completaste todos los niveles!' : (LEVELS[levelIndex + 1].ch !== LEVELS[levelIndex].ch ? '¡Capítulo ' + (LEVELS[levelIndex].ch + 1) + ' terminado!' : '¡Nivel superado!')) : 'Casi lo logras') + '</p>';
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
    overlay.querySelector('.overlay-msg').textContent = tr(msg);
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
  var ICON_CHECK = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>';
  var ICON_LOCK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  var chaptersEl = $('game-chapters');
  function chapterLevels(c) {
    var out = [];
    LEVELS.forEach(function (L, i) { if (L.ch === c) out.push(i); });
    return out;
  }
  function renderLevels() {
    var curCh = LEVELS[levelIndex].ch;
    if (chaptersEl) {
      chaptersEl.innerHTML = '';
      CHAPTERS.forEach(function (C, c) {
        var idx = chapterLevels(c);
        var done = idx.filter(function (i) { return progress[i]; }).length;
        var locked = !isUnlocked(idx[0]);
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'gm-ch' + (c === curCh ? ' is-current' : '') + (done === idx.length ? ' is-done' : '');
        b.disabled = locked;
        b.innerHTML = '<span class="gm-ch-num">' + (locked ? ICON_LOCK : (done === idx.length ? ICON_CHECK : (c + 1))) + '</span>' +
          '<span class="gm-ch-text"><strong></strong><small></small></span>';
        b.querySelector('strong').textContent = C.name;
        b.querySelector('small').textContent = locked ? 'Bloqueado' : done + ' de ' + idx.length + ' niveles';
        b.setAttribute('aria-label', 'Capítulo ' + (c + 1) + ': ' + C.name + (locked ? ' (bloqueado)' : ', ' + done + ' de ' + idx.length + ' niveles'));
        if (c === curCh) b.setAttribute('aria-current', 'true');
        b.addEventListener('click', function () {
          if (running || c === curCh) return;
          var first = idx.filter(function (i) { return isUnlocked(i) && !progress[i]; })[0];
          setLevel(first !== undefined ? first : idx[0]);
        });
        chaptersEl.appendChild(b);
      });
    }
    levelsEl.innerHTML = '';
    chapterLevels(curCh).forEach(function (i) {
      var L = LEVELS[i];
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      var locked = !isUnlocked(i);
      b.className = 'lvl' + (i === levelIndex ? ' is-current' : '') + (progress[i] ? ' is-done' : '') + (locked ? ' is-locked' : '');
      b.disabled = locked;
      var stars = '';
      if (progress[i]) for (var k = 0; k < 3; k++) stars += '<i class="' + (k < progress[i] ? 'on' : '') + '"></i>';
      b.innerHTML = '<span class="lvl-num">' + (locked ? ICON_LOCK : (progress[i] && i !== levelIndex ? ICON_CHECK : (i + 1))) + '</span>' +
        '<span class="lvl-stars" aria-hidden="true">' + stars + '</span>';
      b.setAttribute('aria-label', 'Nivel ' + (i + 1) + ': ' + tr(L.name) + (locked ? ' (bloqueado)' : progress[i] ? ' (' + progress[i] + ' de 3 estrellas)' : ''));
      b.title = 'Nivel ' + (i + 1) + ': ' + tr(L.name);
      if (i === levelIndex) b.setAttribute('aria-current', 'step');
      b.addEventListener('click', function () { if (!running) setLevel(i); });
      li.appendChild(b);
      levelsEl.appendChild(li);
    });
  }

  // Lista de objetivos de la misión
  function renderGoals() {
    if (!game || !goalsEl) return;
    var L = LEVELS[levelIndex];
    var used = countBlocks();
    var items = [];
    if (game.gemTotal) {
      var got = game.gemTotal - gemsLeft();
      items.push({ done: got === game.gemTotal, text: 'Recoge las gemas (' + got + '/' + game.gemTotal + ')' });
    }
    if (game.enemyTotal) {
      var beaten = game.enemyTotal - Object.keys(game.enemies).length;
      items.push({ done: beaten === game.enemyTotal, text: 'Derrota a los slimes (' + beaten + '/' + game.enemyTotal + ')' });
    }
    items.push({ done: !!game.won, text: 'Llega a la bandera' });
    items.push({ done: !!game.won && used <= L.best, star: true, text: 'Reto: ' + L.best + ' bloques o menos (llevas ' + used + ')' });
    goalsEl.innerHTML = '';
    items.forEach(function (it) {
      var li = document.createElement('li');
      li.className = (it.done ? 'is-done' : '') + (it.star ? ' is-star' : '');
      li.innerHTML = '<span class="goal-mark" aria-hidden="true">' + (it.done ? ICON_CHECK : '') + '</span><span></span>';
      li.lastChild.textContent = tr(it.text) + (it.done ? ' — listo' : '');
      goalsEl.appendChild(li);
    });
  }

  function updateHud() {
    if (!hudEl || !game) return;
    var html = '';
    if (game.gemTotal) html += '<span class="hud-chip"><i class="hud-gem"></i>' + (game.gemTotal - gemsLeft()) + '/' + game.gemTotal + '</span>';
    if (game.enemyTotal) html += '<span class="hud-chip"><i class="hud-slime"></i>' + Object.keys(game.enemies).length + '</span>';
    html += '<span class="hud-chip"><i class="hud-step"></i>' + game.moves + (game.moves === 1 ? ' paso' : ' pasos') + '</span>';
    hudEl.innerHTML = html;
    renderGoals();
  }

  function applyTexts() {
    var L = LEVELS[levelIndex];
    $('level-kicker').textContent = 'Capítulo ' + (L.ch + 1) + ' · Nivel ' + (levelIndex + 1) + ' de ' + LEVELS.length;
    $('level-title').textContent = tr(L.name);
    $('level-goal').textContent = tr(L.goal);
    $('level-hint').textContent = tr(L.hint);
    canvas.setAttribute('aria-label', 'Mapa del nivel ' + (levelIndex + 1) + '. ' + tr(L.goal));
  }

  // ---------- Selector de mundo y héroe ----------
  var worldPicker = $('world-picker');
  var heroPicker = $('hero-picker');
  function renderPickers() {
    if (worldPicker) {
      worldPicker.innerHTML = '';
      WORLDS.forEach(function (w) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'gm-seg-btn';
        b.textContent = w.name;
        b.setAttribute('aria-pressed', String(prefs.world === w.id));
        b.addEventListener('click', function () {
          if (running || prefs.world === w.id) return;
          prefs.world = w.id; savePrefs(); applyWorld();
        });
        worldPicker.appendChild(b);
      });
    }
    if (heroPicker) {
      heroPicker.innerHTML = '';
      HEROES.forEach(function (h) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'gm-hero-btn';
        b.title = h.name;
        b.setAttribute('aria-label', h.name);
        b.setAttribute('aria-pressed', String(prefs.hero === h.id));
        var c = document.createElement('canvas');
        var size = 40, r = window.devicePixelRatio || 1;
        c.width = size * r; c.height = size * r;
        c.style.width = size + 'px'; c.style.height = size + 'px';
        c.setAttribute('aria-hidden', 'true');
        var pc = c.getContext('2d');
        pc.setTransform(r, 0, 0, r, 0, 0);
        var main = ctx; ctx = pc;
        drawHeroSprite(h.id, 0, 0, size, 'down', false, 0.95);
        ctx = main;
        b.appendChild(c);
        b.addEventListener('click', function () {
          if (prefs.hero === h.id) return;
          prefs.hero = h.id; savePrefs(); renderPickers(); draw();
        });
        heroPicker.appendChild(b);
      });
    }
  }
  function applyWorld() {
    var wrap = canvas.parentNode;
    wrap.classList.toggle('is-space', space());
    document.querySelector('.gm-app').classList.toggle('is-space', space());
    renderPickers();
    applyTexts();
    renderLevels();
    renderGoals();
    if (!running) say('Arma tu programa y presiona Ejecutar.');
    draw();
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
    applyTexts();
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

  // Animación continua (slimes, gemas y bandera se mueven aunque no se ejecute nada)
  var lastFrame = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden || now - lastFrame < 30) return;
    lastFrame = now;
    effects = effects.filter(function (f) { return now - f.start < 600; });
    if (anim && now - anim.start >= anim.dur) anim = null;
    draw();
  }
  requestAnimationFrame(frame);

  function draw() {
    if (!game) return;
    var T = tile;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, T * game.cols, T * game.rows);
    var now = performance.now();
    if (space()) { drawSpaceMap(T, now); } else {
    for (var y = 0; y < game.rows; y++) {
      for (var x = 0; x < game.cols; x++) {
        ctx.fillStyle = (x + y) % 2 ? '#7CC765' : '#86CF6E';
        ctx.fillRect(x * T, y * T, T, T);
      }
    }
    // camino de tierra en las casillas libres
    for (y = 0; y < game.rows; y++) {
      for (x = 0; x < game.cols; x++) {
        if (game.walls[x + ',' + y]) continue;
        ctx.fillStyle = '#C9A46A';
        roundRect(x * T + T * 0.04, y * T + T * 0.04 + 2, T * 0.92, T * 0.92, T * 0.16); ctx.fill();
        ctx.fillStyle = (x + y) % 2 ? '#F1DDB0' : '#EBD5A4';
        roundRect(x * T + T * 0.04, y * T + T * 0.04, T * 0.92, T * 0.92, T * 0.16); ctx.fill();
        ctx.fillStyle = 'rgba(160,120,60,.25)';
        ctx.beginPath(); ctx.arc(x * T + T * 0.28, y * T + T * 0.7, T * 0.03, 0, 7); ctx.arc(x * T + T * 0.72, y * T + T * 0.32, T * 0.025, 0, 7); ctx.fill();
      }
    }
    for (y = 0; y < game.rows; y++) {
      for (x = 0; x < game.cols; x++) {
        if (game.walls[x + ',' + y]) drawTree(x * T, y * T, T, x, y);
      }
    }
    }
    if (space()) drawPortal(game.flag.x * T, game.flag.y * T, T, gemsLeft() === 0, now);
    else drawFlag(game.flag.x * T, game.flag.y * T, T, gemsLeft() === 0, now);
    Object.keys(game.gems).forEach(function (k) {
      var p = k.split(',');
      if (space()) {
        var fy = Math.sin(now / 300 + +p[0]) * T * 0.03;
        drawSprite(SPRITES.cristal, +p[0] * T, +p[1] * T - T * 0.12 + fy, T, false, 0.6);
      } else drawGem(+p[0] * T, +p[1] * T, T, now);
    });
    Object.keys(game.enemies).forEach(function (k) {
      var p = k.split(',');
      if (space()) {
        var hop = Math.abs(Math.sin(now / 260 + +p[0])) * T * 0.05;
        shadow(+p[0] * T, +p[1] * T, T);
        drawSprite(SPRITES.droide, +p[0] * T, +p[1] * T - hop, T, false, 0.72);
      } else drawSlime(+p[0] * T, +p[1] * T, T, now);
    });
    var hx = game.hero.x, hy = game.hero.y;
    if (anim) {
      var t = Math.min(1, (now - anim.start) / anim.dur);
      var e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      hx = anim.fx + (anim.tx - anim.fx) * e;
      hy = anim.fy + (anim.ty - anim.fy) * e;
    }
    var bob = anim ? 0 : Math.sin(now / 280) * T * 0.015;
    drawHeroSprite(prefs.hero, hx * T, hy * T + bob, T, game.dir, game.failed);
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

  // Héroe elegido: el dibujo original de Innovating Kids o un sprite de pixel art
  function drawHeroSprite(id, x, y, T, dir, hurt, scale) {
    if (id === 'ik' || !SPRITES[id]) { drawHero(x, y, T, dir, hurt); return; }
    shadow(x, y, T);
    drawSprite(SPRITES[id], x, y, T, dir === 'left', scale || 0.78, hurt ? '#FF6B5B' : null);
  }
  function shadow(x, y, T) {
    ctx.fillStyle = 'rgba(0,0,0,.25)';
    ctx.beginPath(); ctx.ellipse(x + T / 2, y + T * 0.88, T * 0.26, T * 0.07, 0, 0, 7); ctx.fill();
  }
  // Dibuja un sprite de pixel art centrado en la casilla y apoyado abajo
  function drawSprite(sp, x, y, T, flip, scale, tint) {
    var rows = sp.rows, w = rows[0].length, h = rows.length;
    var px = T * scale / w;
    var ox = x + (T - w * px) / 2;
    var oy = y + T - h * px - T * 0.1;
    for (var r = 0; r < h; r++) {
      for (var c = 0; c < w; c++) {
        var ch = rows[r].charAt(flip ? w - 1 - c : c);
        if (ch === '.') continue;
        ctx.fillStyle = tint && ch !== 'k' ? tint : sp.pal[ch];
        var x0 = Math.round(ox + c * px), y0 = Math.round(oy + r * px);
        ctx.fillRect(x0, y0, Math.round(ox + (c + 1) * px) - x0, Math.round(oy + (r + 1) * px) - y0);
      }
    }
  }
  function hash(x, y) { var n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); }
  // Mapa espacial: vacío con estrellas, pasarela metálica y asteroides
  function drawSpaceMap(T, now) {
    ctx.fillStyle = '#0A1230';
    ctx.fillRect(0, 0, T * game.cols, T * game.rows);
    for (var y = 0; y < game.rows; y++) {
      for (var x = 0; x < game.cols; x++) {
        for (var i = 0; i < 3; i++) {
          var sx = hash(x + i * 7, y) , sy = hash(x, y + i * 13);
          var tw = 0.5 + 0.5 * Math.sin(now / 500 + (x + y + i) * 2);
          ctx.fillStyle = 'rgba(255,255,255,' + (0.35 + 0.5 * tw * hash(x + i, y + i)) + ')';
          var sz = Math.max(1, T * 0.03 * (i === 0 ? 1.5 : 1));
          ctx.fillRect(Math.round(x * T + sx * T), Math.round(y * T + sy * T), sz, sz);
        }
      }
    }
    for (y = 0; y < game.rows; y++) {
      for (x = 0; x < game.cols; x++) {
        if (game.walls[x + ',' + y]) {
          var hv = hash(x, y);
          if (hv > 0.45) drawAsteroid(x * T, y * T, T, hv, now);
          else if (hv < 0.06) drawPlanet(x * T, y * T, T, hv);
          continue;
        }
        ctx.fillStyle = '#1D2945';
        roundRect(x * T + T * 0.03, y * T + T * 0.03 + 3, T * 0.94, T * 0.94, T * 0.1); ctx.fill();
        ctx.fillStyle = (x + y) % 2 ? '#3B4C6E' : '#36466A';
        roundRect(x * T + T * 0.03, y * T + T * 0.03, T * 0.94, T * 0.94, T * 0.1); ctx.fill();
        ctx.strokeStyle = 'rgba(143,166,189,.35)'; ctx.lineWidth = Math.max(1, T * 0.02);
        roundRect(x * T + T * 0.12, y * T + T * 0.12, T * 0.76, T * 0.76, T * 0.06); ctx.stroke();
        ctx.fillStyle = '#9FB3C8';
        [[0.1, 0.1], [0.9, 0.1], [0.1, 0.9], [0.9, 0.9]].forEach(function (q) {
          ctx.fillRect(Math.round(x * T + T * q[0] - 1), Math.round(y * T + T * q[1] - 1), Math.max(2, T * 0.04), Math.max(2, T * 0.04));
        });
      }
    }
  }
  function drawAsteroid(x, y, T, hv, now) {
    var cx = x + T / 2, cy = y + T / 2 + Math.sin(now / 900 + hv * 10) * T * 0.03;
    var r = T * (0.26 + hv * 0.12);
    ctx.fillStyle = '#5C5F73';
    ctx.beginPath();
    for (var i = 0; i < 9; i++) {
      var a = i / 9 * Math.PI * 2, rr = r * (0.82 + 0.18 * hash(i, hv * 100));
      if (i === 0) ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); else ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#80849A';
    ctx.beginPath(); ctx.arc(cx - r * 0.25, cy - r * 0.3, r * 0.35, 0, 7); ctx.fill();
    ctx.fillStyle = '#44475A';
    ctx.beginPath(); ctx.arc(cx + r * 0.3, cy + r * 0.2, r * 0.22, 0, 7); ctx.arc(cx - r * 0.35, cy + r * 0.35, r * 0.13, 0, 7); ctx.fill();
  }
  function drawPlanet(x, y, T, hv) {
    var cx = x + T / 2, cy = y + T / 2, r = T * 0.22;
    ctx.fillStyle = '#FF8A65';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.25)';
    ctx.beginPath(); ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.35, 0, 7); ctx.fill();
    ctx.strokeStyle = '#FFD23F'; ctx.lineWidth = Math.max(1.5, T * 0.035);
    ctx.beginPath(); ctx.ellipse(cx, cy, r * 1.6, r * 0.45, -0.35, 0, 7); ctx.stroke();
  }
  function drawPortal(x, y, T, ready, now) {
    var cx = x + T / 2, cy = y + T / 2, r = T * 0.34;
    var c1 = ready ? '#4FC3F7' : '#FF6B5B', c2 = ready ? '#E040FB' : '#8E2A2A';
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = c2;
    ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 1.1, 0, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.lineWidth = Math.max(2, T * 0.07);
    for (var i = 0; i < 6; i++) {
      var a = now / (ready ? 400 : 1200) + i * Math.PI / 3;
      ctx.strokeStyle = i % 2 ? c1 : c2;
      ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 1.1, 0, a, a + Math.PI / 4); ctx.stroke();
    }
    ctx.restore();
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function drawTree(x, y, T, gx, gy) {
    var cx = x + T / 2;
    ctx.fillStyle = 'rgba(20,60,20,.25)';
    ctx.beginPath(); ctx.ellipse(cx, y + T * 0.86, T * 0.3, T * 0.08, 0, 0, 7); ctx.fill();
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
  function drawFlag(x, y, T, ready, now) {
    var wave = Math.sin((now || 0) / 200) * T * 0.04;
    ctx.fillStyle = 'rgba(11,37,69,.15)';
    ctx.beginPath(); ctx.ellipse(x + T * 0.42, y + T * 0.86, T * 0.22, T * 0.07, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#0B2545';
    ctx.fillRect(x + T * 0.38, y + T * 0.15, T * 0.07, T * 0.72);
    ctx.fillStyle = ready ? '#FFD23F' : '#FF6B5B';
    ctx.beginPath(); ctx.moveTo(x + T * 0.45, y + T * 0.16); ctx.lineTo(x + T * 0.82, y + T * 0.3 + wave); ctx.lineTo(x + T * 0.45, y + T * 0.44); ctx.closePath(); ctx.fill();
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
  if (speedBtn) speedBtn.addEventListener('click', function () {
    fast = !fast;
    speedBtn.setAttribute('aria-pressed', String(fast));
    $('speed-label').textContent = fast ? 'Rápido' : 'Normal';
  });
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

  // Oculta el WhatsApp flotante mientras el juego está en pantalla
  if ('IntersectionObserver' in window) {
    var app = document.querySelector('.gm-app');
    if (app) new IntersectionObserver(function (entries) {
      document.body.classList.toggle('gm-in-view', entries[0].intersectionRatio > 0.25);
    }, { threshold: [0, 0.25, 0.5] }).observe(app);
  }

  // Empieza en el primer nivel sin terminar
  var start = 0;
  while (start < LEVELS.length - 1 && progress[start]) start++;
  setLevel(start);
  applyWorld();
})();
