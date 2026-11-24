/* Innovating Kids — "Aventura de Navidad": niveles del juego de bloques para niños de 6 a 10 años.
   Usa el mismo motor que programacion-con-bloques.html (js/bloques.js) con el mundo "navidad".
   Leyenda del mapa: . camino  # pino  H elfo  G regalo  E muñeco de nieve  F trineo.
   Todos los niveles se comprobaron con un simulador. */
window.IK_BLOQUES_CONFIG = {
  juego: 'navidad',
  storeKey: 'ik-navidad-v1',
  prefsKey: 'ik-navidad-prefs',
  world: 'navidad',
  heroes: ['elfo', 'reno', 'perro', 'gato', 'ik'],
  chapters: [
    { name: 'El taller', desc: 'Instrucciones en orden' },
    { name: 'Entregas', desc: 'Repetir y muñecos de nieve' }
  ],
  levels: [
    { ch: 0, name: 'El primer regalo', goal: 'Recoge el regalo y llega al trineo.',
      hint: 'Toca "mover derecha" 5 veces y luego Ejecutar.',
      map: ['#######', '#######', 'H.G..F#', '#######', '#######'], blocks: ['right', 'left', 'up', 'down'], best: 5 },
    { ch: 0, name: 'Sube la colina', goal: 'El trineo está arriba de la colina nevada.',
      hint: 'Derecha, arriba, derecha, derecha, arriba, arriba.',
      map: ['######', '###F##', '###.##', '#G..##', 'H.####'], blocks: ['right', 'left', 'up', 'down'], best: 6 },
    { ch: 0, name: 'Regalos en zigzag', goal: 'Recoge los 2 regalos y llega al trineo.',
      hint: 'Primero 2 a la derecha, luego 2 hacia abajo y 3 a la derecha.',
      map: ['#######', '#H.G###', '###.###', '###.G.F', '#######'], blocks: ['right', 'left', 'up', 'down'], best: 7 },
    { ch: 0, name: 'Bajando la montaña', goal: 'Baja por la montaña escalón por escalón.',
      hint: 'Derecha, abajo, derecha, abajo… hasta llegar al trineo.',
      map: ['H.#####', '#..####', '##.G###', '###..##', '####.F#'], blocks: ['right', 'left', 'up', 'down'], best: 9 },
    { ch: 1, name: 'El muñeco travieso', goal: 'Un muñeco de nieve bloquea el camino. ¡Lánzale una bola de nieve!',
      hint: 'Avanza 1, lanza la bola de nieve y luego avanza 4.',
      map: ['#######', '#######', 'H.E..F#', '#######', '#######'], blocks: ['right', 'left', 'up', 'down', 'attack'], best: 6 },
    { ch: 1, name: 'Repetir es más fácil', goal: 'Un camino largo con regalos. Usa "repetir" para no poner tantos bloques.',
      hint: 'Pon "mover derecha" dentro de "repetir" y elige 7 veces.',
      map: ['########', '########', 'H.G.G.GF', '########', '########'], blocks: ['right', 'left', 'up', 'down', 'attack', 'repeat'], best: 2 },
    { ch: 1, name: 'Escalera de hielo', goal: 'Baja la escalera de hielo y recoge los regalos.',
      hint: 'Repetir 4 veces: derecha y abajo. Al final, una vez más a la derecha.',
      map: ['H.#####', '#..####', '##G.###', '###..##', '####GF#'], blocks: ['right', 'left', 'up', 'down', 'attack', 'repeat'], best: 4 },
    { ch: 1, name: 'La gran entrega', goal: '¡La última entrega! Detén a los muñecos, recoge todos los regalos y llega al trineo.',
      hint: 'Repetir 3 veces: lanzar bola de nieve, derecha, derecha. Al final, derecha una vez más.',
      map: ['########', '########', 'HEGEGEGF', '########', '########'], blocks: ['right', 'left', 'up', 'down', 'attack', 'repeat'], best: 5 }
  ]
};
