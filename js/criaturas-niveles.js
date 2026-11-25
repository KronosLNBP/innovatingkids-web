/* Innovating Kids — Clase "Exploradores de criaturas" (45 minutos).
   Criaturas originales inspiradas en la fauna de México (ajolote, xoloitzcuintle, colibrí, nopal y mariposa monarca).
   9 misiones: 5 con bloques y 4 con código (estilo Python). Usa js/bloques.js y la tutora Lumi (js/tutor.js).
   Leyenda: . camino  # árbol, pasto alto o estanque  H explorador  G criatura  E nubarrón gruñón  F campamento.
   Mapas comprobados con un simulador. */
(function () {
  var MOV = ['right', 'left', 'up', 'down'];
  window.IK_BLOQUES_CONFIG = {
    juego: 'criaturas',
    storeKey: 'ik-criaturas-v1',
    prefsKey: 'ik-criaturas-prefs',
    world: 'criaturas',
    heroes: ['exploradora', 'explorador', 'ajolin', 'xolin'],
    tutor: { nombre: 'Lumi', sprite: 'lumi', alumno: 'explorador', heroe: 'tu explorador', enemigo: 'nubarrón gruñón', item: 'criatura', items: 'criaturas', meta: 'campamento',
      accion: 'dar baya', obstaculo: 'un árbol', emoji: '✨', sonido: 'item',
      vivas: ['¡Brillas más que yo! ¡Tres estrellas!', '¡Increíble, explorador! Las criaturas te adoran.', '¡Perfecto! ¡Eres un gran amigo de las criaturas!'],
      final: '¡Completaste la clase "Exploradores de criaturas"! Ajolín, Xolín, Chispa, Nopalín y Monarca ya son tus amigos para siempre. ✨',
      code: { attack: 'dar_baya', ifEnemy: 'hay_nubarron_enfrente', untilGoal: 'en_el_campamento' } },
    chapters: [
      { name: 'Exploración con bloques', desc: 'Misiones 1 a 5' },
      { name: 'Exploración con código', desc: 'Misiones 6 a 9' }
    ],
    levels: [
      { ch: 0, mode: 'bloques', name: 'Tu primer amigo', hintBlocks: ['right'], goal: 'Un ajolote salvaje te mira con curiosidad. Hazte su amigo y llévalo al campamento.',
        hint: 'Solo tienes que ir a la derecha. Cuenta los cuadritos hasta la tienda.',
        hint2: 'Pon "mover derecha" 5 veces y presiona Ejecutar.',
        intro: '¡Hola, explorador! Soy Lumi, la luciérnaga del Valle. Aquí viven criaturas increíbles. Para hacerte su amigo, solo pasa a su lado. ¡Vamos por la primera!',
        map: ['#######', '#######', 'H.G..F#', '#######', '#######'], blocks: MOV, best: 5 },
      { ch: 0, mode: 'bloques', name: 'Rodea el estanque', hintBlocks: ['right', 'up'], goal: 'Un estanque tapa el camino. Rodéalo y hazte amigo de la criatura.',
        hint: 'Primero un paso a la derecha y después sube.',
        hint2: 'Derecha, arriba, arriba y derecha 3 veces.',
        intro: 'Los exploradores no nadan con la mochila puesta. ¡Busca el camino alrededor del estanque!',
        map: ['#######', '#G..F##', '#.#####', 'H.#####', '#######'], blocks: MOV, best: 6 },
      { ch: 0, mode: 'bloques', name: 'Tres criaturas', hintBlocks: ['right', 'down', 'left'], goal: 'Tres criaturas juegan por el valle. ¡Hazte amigo de las tres!',
        hint: 'Ve a la derecha, baja y regresa a la izquierda.',
        hint2: 'Derecha 3, abajo 2 e izquierda 2.',
        intro: '¡Mira cuántas criaturas! Cada una es diferente: un ajolote, un xolo, un colibrí... ¡Haz amistad con todas!',
        map: ['#######', '#H.G.##', '####G##', '##F.G##', '#######'], blocks: MOV, best: 7 },
      { ch: 0, mode: 'bloques', name: 'El nubarrón gruñón', hintBlocks: ['attack'], goal: 'Un nubarrón gruñón no te deja pasar. ¡Dale una baya para que sonría!',
        hint: 'Párate junto al nubarrón y usa "dar baya".',
        hint2: 'Derecha, dar baya y luego derecha 5 veces.',
        intro: 'Ese nubarrón está de mal humor... ¡seguro tiene hambre! Dale una baya y se irá contento.',
        map: ['########', '########', 'H.E.G.F#', '########', '########'], blocks: MOV.concat(['attack']), best: 7 },
      { ch: 0, mode: 'bloques', name: 'Desfile de mariposas', hintBlocks: ['repeat'], goal: 'Las criaturas bajan en escalera. Usa "repetir" para seguirlas.',
        hint: 'El patrón es: derecha y abajo. ¿Cuántas veces se repite?',
        hint2: 'Repetir 5 veces: mover derecha y mover abajo.',
        intro: 'Cuando algo se repite, los programadores usan "repetir". ¡Así tu programa queda cortito!',
        map: ['H.######', '#G.#####', '##G.####', '###G.###', '####G.##', '#####F##'], blocks: MOV.concat(['attack', 'repeat']), best: 3 },
      { ch: 1, mode: 'codigo', name: 'Tu primer código', goal: 'Ahora escribe código. Haz amistad con las 3 criaturas del camino.',
        hint: 'Cada instrucción va en su renglón. Ir a la derecha se escribe mover_derecha()',
        hint2: 'Escribe: for i in range(6):  y abajo, con 4 espacios al inicio, mover_derecha()',
        intro: '¡Subiste de nivel, explorador! Ahora escribirás código como los programadores de verdad. Cada bloque es una línea. Usa los botones para escribir más rápido.',
        starter: '# Escribe una instrucción por renglón\nmover_derecha()\n',
        map: ['#######', '#######', 'HG.G.GF', '#######', '#######'], blocks: MOV.concat(['attack', 'repeat']), best: 2 },
      { ch: 1, mode: 'codigo', name: 'Escalera de nopales', goal: 'Baja la escalera de nopales con un ciclo for.',
        hint: 'Patrón: derecha, abajo, derecha, abajo... Ponlo dentro de un for.',
        hint2: 'for i in range(4):  con mover_derecha() y mover_abajo() adentro (4 espacios). Al final mover_derecha() sin espacios.',
        intro: 'En Python, "repetir" se escribe for i in range(veces): y lo que se repite va abajo con 4 espacios. ¡Eso es la sangría!',
        starter: '# Repite el patrón con un for\nfor i in range(4):\n    mover_derecha()\n',
        map: ['H.#####', '#..####', '##G.###', '###..##', '####GF#'], blocks: MOV.concat(['attack', 'repeat']), best: 4 },
      { ch: 1, mode: 'codigo', name: 'Nubarrones en fila', goal: 'Hay nubarrones en el camino, pero no sabes dónde. Usa if para decidir.',
        hint: 'while not en_el_campamento(): repite hasta llegar. Adentro: if hay_nubarron_enfrente(): dar_baya()',
        hint2: 'while not en_el_campamento():\n    if hay_nubarron_enfrente():\n        dar_baya()\n    mover_derecha()',
        intro: 'Ahora tu explorador pensará solo. if significa "si": si hay un nubarrón enfrente, dale una baya. while repite hasta llegar al campamento.',
        starter: '# Repite hasta llegar al campamento\nwhile not en_el_campamento():\n    mover_derecha()\n',
        map: ['#########', '#########', 'H.E.GE.EF', '#########', '#########'], blocks: MOV.concat(['attack', 'repeat', 'ifEnemy', 'untilGoal']), best: 4 },
      { ch: 1, mode: 'codigo', name: 'La gran expedición', goal: '¡La gran expedición! Baja por el valle, alegra a los nubarrones y haz un nuevo amigo.',
        hint: 'Dentro del while: primero revisa si hay nubarrón. Después, si hay camino abajo, baja; si no, ve a la derecha.',
        hint2: 'while not en_el_campamento():\n    if hay_nubarron_enfrente():\n        dar_baya()\n    if hay_camino(\'abajo\'):\n        mover_abajo()\n    else:\n        mover_derecha()',
        intro: '¡Última misión! Usa while, if y else. else significa "si no". ¡Las criaturas confían en ti!',
        starter: '# Tu programa más inteligente\nwhile not en_el_campamento():\n    if hay_nubarron_enfrente():\n        dar_baya()\n',
        map: ['H.E.######', '###.######', '###E######', '###.G.E.##', '#######.##', '#######.##', '#######F##'], blocks: MOV.concat(['attack', 'repeat', 'ifEnemy', 'untilGoal', 'ifPath']), best: 6 }
    ]
  };
})();
