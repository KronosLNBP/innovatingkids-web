/* Innovating Kids — Clase "Vivir con dinosaurios" (45 minutos).
   9 misiones: 5 con bloques y 4 con código (estilo Python). Usa el motor de js/bloques.js.
   Leyenda del mapa: . camino  # roca, helecho o volcán  H Rexi  G huevo  E raptor  F nido.
   Todos los mapas se comprobaron con un simulador. */
(function () {
  var MOV = ['right', 'left', 'up', 'down'];
  window.IK_BLOQUES_CONFIG = {
    juego: 'dinosaurios',
    storeKey: 'ik-dinos-v1',
    prefsKey: 'ik-dinos-prefs',
    world: 'jurasico',
    tutor: { nombre: 'Profe Rex', sprite: 'profeRex', alumno: 'guardián', heroe: 'Rexi', enemigo: 'raptor', item: 'huevo', items: 'huevos', meta: 'nido',
      accion: 'rugir', obstaculo: 'una roca', emoji: '🦖', sonido: 'roar',
      vivas: ['¡RAAAR de alegría! ¡Lo hiciste perfecto!', '¡Increíble, guardián! ¡Tres estrellas!', '¡Eres un genio del Jurásico!'],
      final: '¡Completaste la clase "Vivir con dinosaurios"! Rexi y todos los dinosaurios del valle te dan las gracias, guardián. 🦖🥚',
      code: { attack: 'rugir', ifEnemy: 'hay_raptor_enfrente', untilGoal: 'en_el_nido' } },
    heroes: ['dino', 'tricera', 'exploradora', 'ik'],
    chapters: [
      { name: 'Guardián con bloques', desc: 'Misiones 1 a 5' },
      { name: 'Guardián con código', desc: 'Misiones 6 a 9' }
    ],
    levels: [
      { ch: 0, mode: 'bloques', min: 4, name: 'Regreso al nido', hintBlocks: ['right'], goal: 'Rexi, el dinosaurio bebé, se perdió. Recoge el huevo y llévalo al nido.',
        hint: 'Rexi solo necesita ir a la derecha. Cuenta los cuadritos hasta el nido.',
        hint2: 'Pon "mover derecha" 5 veces y presiona Ejecutar.',
        intro: '¡Hola, guardián del Valle Jurásico! Soy Profe Rex. Rexi se perdió: ayúdalo a recoger el huevo y volver a su nido. Toca los bloques para darle instrucciones.',
        map: ['#######', '#######', 'H..G.F#', '#######', '#######'], blocks: MOV, best: 5 },
      { ch: 0, mode: 'bloques', min: 5, name: 'Rodea el volcán', hintBlocks: ['right', 'up'], goal: 'Hay un volcán en el camino. Rodéalo para llegar al nido.',
        hint: 'Primero ve a la derecha y después sube.',
        hint2: 'Derecha 3 veces, arriba 2 veces y una vez más a la derecha.',
        intro: '¡Cuidado, un volcán humeante! Los dinosaurios no pueden pasar por las rocas. Busca otro camino.',
        map: ['#######', '###.F##', '###.###', 'H.G.###', '#######'], blocks: MOV, best: 6 },
      { ch: 0, mode: 'bloques', min: 5, name: 'Huevos perdidos', hintBlocks: ['right', 'down', 'left'], goal: 'Dos huevos rodaron por el valle. Recógelos y llega al nido.',
        hint: 'Ve a la derecha, baja y después regresa a la izquierda.',
        hint2: 'Derecha 3, abajo 2 e izquierda 2.',
        intro: '¡Oh, no! Dos huevos rodaron cuesta abajo. Rexi tiene que ir por ellos antes de volver al nido.',
        map: ['#######', '#H.G.##', '####.##', '##F.G##', '#######'], blocks: MOV, best: 7 },
      { ch: 0, mode: 'bloques', min: 5, name: 'El raptor travieso', hintBlocks: ['attack'], goal: 'Un raptor bloquea el camino. ¡Ruge para que se aparte!',
        hint: 'Párate junto al raptor y usa "rugir".',
        hint2: 'Derecha, rugir y luego derecha 5 veces.',
        intro: 'Un raptor travieso no deja pasar a Rexi. No le hacemos daño: Rexi solo ruge fuerte para que se haga a un lado. ¡RAAAR!',
        map: ['########', '########', 'H.E.G.F#', '########', '########'], blocks: MOV.concat(['attack']), best: 7 },
      { ch: 0, mode: 'bloques', min: 5, name: 'El puente largo', hintBlocks: ['repeat'], goal: 'Un puente muy largo con 4 huevos. Usa "repetir" para no poner tantos bloques.',
        hint: 'El bloque "repetir" hace lo mismo muchas veces. ¿Cuántos pasos hay hasta el nido?',
        hint2: 'Mete "mover derecha" dentro de "repetir" y elige 8 veces.',
        intro: 'Los programadores son flojitos... ¡en el buen sentido! Si algo se repite, usan "repetir". Pruébalo en este puente.',
        map: ['#########', '#########', 'HG.G.G.GF', '#########', '#########'], blocks: MOV.concat(['attack', 'repeat']), best: 2 },
      { ch: 1, mode: 'codigo', min: 5, name: 'Tu primer código', goal: 'Ahora escribe las instrucciones como código. Lleva a Rexi al nido.',
        hint: 'Cada instrucción va en su propio renglón. Para ir a la derecha se escribe mover_derecha()',
        hint2: 'Escribe: for i in range(5):  y abajo, con 4 espacios al inicio, mover_derecha()',
        intro: '¡Subiste de nivel! Los programadores de verdad escriben código. Cada bloque es una línea: mover_derecha() es igual al bloque "mover derecha". Usa los botones de abajo para escribir más rápido.',
        starter: '# Escribe una instrucción por renglón\nmover_derecha()\n',
        map: ['#######', '#######', 'H.G..F#', '#######', '#######'], blocks: MOV.concat(['attack', 'repeat']), best: 2 },
      { ch: 1, mode: 'codigo', min: 5, name: 'Escalera de piedra', goal: 'Baja la escalera de piedra con un ciclo for.',
        hint: 'El patrón es: derecha, abajo, derecha, abajo… Ponlo dentro de un for.',
        hint2: 'for i in range(4):  con mover_derecha() y mover_abajo() adentro (4 espacios). Al final, mover_derecha() sin espacios.',
        intro: 'En Python, "repetir" se escribe for i in range(veces): y lo que se repite va abajo, con 4 espacios al inicio. ¡Eso se llama sangría!',
        starter: '# Repite el patrón con un for\nfor i in range(4):\n    mover_derecha()\n',
        map: ['H.#####', '#..####', '##G.###', '###..##', '####GF#'], blocks: MOV.concat(['attack', 'repeat']), best: 4 },
      { ch: 1, mode: 'codigo', min: 5, name: 'Raptores en fila', goal: 'Hay raptores en el camino, pero no sabes dónde. Usa if para decidir.',
        hint: 'while not en_el_nido(): repite hasta llegar. Adentro, if hay_raptor_enfrente(): rugir()',
        hint2: 'while not en_el_nido():\n    if hay_raptor_enfrente():\n        rugir()\n    mover_derecha()',
        intro: 'Ahora Rexi va a pensar solo. if significa "si": si hay un raptor enfrente, ruge. Y while repite hasta llegar al nido.',
        starter: '# Repite hasta llegar al nido\nwhile not en_el_nido():\n    mover_derecha()\n',
        map: ['#########', '#########', 'H.E..E.EF', '#########', '#########'], blocks: MOV.concat(['attack', 'repeat', 'ifEnemy', 'untilGoal']), best: 4 },
      { ch: 1, mode: 'codigo', min: 6, name: 'La gran misión', goal: '¡La gran misión del guardián! Baja por el valle, ruge a los raptores y recoge el huevo.',
        hint: 'Dentro del while: primero revisa si hay raptor. Después, si hay camino abajo, baja; si no, ve a la derecha.',
        hint2: 'while not en_el_nido():\n    if hay_raptor_enfrente():\n        rugir()\n    if hay_camino(\'abajo\'):\n        mover_abajo()\n    else:\n        mover_derecha()',
        intro: '¡Última misión, guardián! Aquí usarás todo: while, if y else. else significa "si no". ¡Tú puedes!',
        starter: '# Tu programa más inteligente\nwhile not en_el_nido():\n    if hay_raptor_enfrente():\n        rugir()\n',
        map: ['H.E.######', '###.######', '###E######', '###.G.E.##', '#######.##', '#######.##', '#######F##'], blocks: MOV.concat(['attack', 'repeat', 'ifEnemy', 'untilGoal', 'ifPath']), best: 6 }
    ]
  };
})();
