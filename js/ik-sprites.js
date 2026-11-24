/* Innovating Kids — personajes y objetos en pixel art (originales).
   Cada sprite: paleta (letra → color) y renglones del mismo largo; "." es transparente.
   Los usan el juego de bloques y el juego de hardware. */
(function () {
  'use strict';
  var S = {
    // ---------- Héroes ----------
    perro: {
      pal: { b: '#C68642', B: '#7A4A1E', w: '#F7E3C0', k: '#1B1B1B', p: '#FF7A93', r: '#E53935', y: '#FFD23F' },
      rows: ['.BB......BB.', '.BBbbbbbbBB.', '.Bbbbbbbbbb.', '..bkbbbbkb..', '..bbwwwwbb..', '..bwwkkwwb..',
        '...wwppww...', '...rryrrr...', '..bbbbbbbbB.', '..bbwwwwbbB.', '..bbbbbbbb..', '..BB....BB..']
    },
    gato: {
      pal: { o: '#F39C33', O: '#B5651D', w: '#FFF4E0', k: '#1B1B1B', g: '#4CAF50', p: '#FF8FA3', b: '#1F63C6' },
      rows: ['.O........O.', '.OO......OO.', '.OoooooooOO.', '.oooooooooo.', '.ogkooookgo.', '.oooowwoooo.',
        '..ooowpwoo..', '...bbbbbb...', '..oooooooo.O', '..oowwwwooO.', '..oooooooo..', '..OO....OO..']
    },
    pirata: {
      pal: { k: '#1B1B1B', w: '#FFFFFF', s: '#F2C29B', r: '#D32F2F', R: '#8E1B1B', y: '#FFD23F', b: '#6D4C41', n: '#1A237E' },
      rows: ['...kkkkkk...', '..kkkwkkkk..', '.kkkkkkkkkk.', '..rrrrrrrr..', '..ssskksss..', '..sskkkskk..',
        '..ssssssss..', '...bbbbbb...', '..wrwrwrwr..', '.swrwrwrwrs.', '...nnnnnn...', '...kk..kk...']
    },
    ninja: {
      pal: { k: '#1F1F2E', K: '#3A3A55', s: '#F2C29B', r: '#E53935', w: '#FFFFFF', g: '#9E9E9E' },
      rows: ['....kkkk....', '...kkkkkk...', '..kkkkkkkkrr', '..ksswwssk.r', '..kskwwksk..', '..kkkkkkkk..',
        '...kkkkkk...', '.KkkrrrrkkK.', '.Kkkkkkkkk.g', '...kkkkkkg..', '...kk..kk...', '...KK..KK...']
    },
    vikinga: {
      pal: { g: '#B0BEC5', G: '#78909C', w: '#FFFFFF', y: '#FFB300', s: '#F2C29B', k: '#1B1B1B', b: '#1565C0', r: '#8D6E63', p: '#E57373' },
      rows: ['w..gggggg..w', 'w.gggggggg.w', '.wgGGGGGGgw.', '..yssssssy..', '.yyskssksyy.', '.yysssssyy..',
        '..yysppsyy..', '..bbbbbbbb..', '.sbbrrrrbbs.', '..bbbbbbbb..', '...rr..rr...', '...kk..kk...']
    },
    // ---------- Enemigos ----------
    abeja: {
      pal: { y: '#FFD23F', k: '#1B1B1B', w: '#E3F2FD', W: '#90CAF9' },
      rows: ['...ww..ww...', '..wWww.wWw..', '...ww..ww...', '..yykkyykk..', '.yykyykkyyk.', '.ykkyykkyyk.',
        '..yykkyykk..', '...k....k...']
    },
    cangrejo: {
      pal: { r: '#E53935', R: '#B71C1C', w: '#FFFFFF', k: '#1B1B1B' },
      rows: ['RR........RR', 'Rr.w....w.rR', '.R.k....k.R.', '..rrrrrrrr..', '.rrrrrrrrrr.', 'rrRrrrrrrRrr',
        '.r.r....r.r.', 'r..r....r..r']
    },
    murcielago: {
      pal: { p: '#5E35B1', P: '#311B92', y: '#FFEB3B', k: '#1B1B1B' },
      rows: ['P...pppp...P', 'PP.pppppp.PP', 'PPPpyppyPPPP', 'PPPpppppppPP', '.PPppkkppPP.', '..P.pppp.P..',
        '.....pp.....']
    },
    // ---------- Objetos ----------
    hueso: {
      pal: { w: '#FFFFFF', g: '#CFD8DC' },
      rows: ['ww......ww..', 'wwwwwwwwwww.', '.wwwwwwwwww.', 'wwgggggggww.', 'ww......ww..']
    },
    moneda: {
      pal: { y: '#FFD23F', o: '#F9A825', w: '#FFF9C4', k: '#B26A00' },
      rows: ['..oooo..', '.oyyyyo.', 'oywyykyo', 'oywykyyo', 'oyykyyyo', 'oyykyyyo', '.oyyyyo.', '..oooo..']
    },
    llave: {
      pal: { y: '#FFD23F', o: '#C79100' },
      rows: ['.yyy........', 'y...y.......', 'y...yyyyyyyy', 'y...y...o.o.', '.yyy....o.o.']
    },
    // ---------- Metas ----------
    casita: {
      pal: { r: '#E53935', R: '#9A1F1F', b: '#C68642', B: '#7A4A1E', k: '#3E2723', y: '#FFD23F' },
      rows: ['.....rr.....', '....rrrr....', '...rrrrrr...', '..rrrrrrrr..', '.rrrrrrrrrr.', 'RRRRRRRRRRRR',
        '.bbbbbbbbbb.', '.bbbkkkkbbb.', '.bbkkkkkkbb.', '.bbkkkkkkbb.', '.BBkkkkkkBB.', '.BBBBBBBBBB.']
    },
    cofre: {
      pal: { b: '#8D5524', B: '#5D3A1A', y: '#FFD23F', k: '#3E2723' },
      rows: ['..bbbbbbbb..', '.bbbbbbbbbb.', 'byybbbbbbyyb', 'BBBBByyBBBBB', 'bbbbbykbbbbb', 'byybbyybbyyb',
        'bbbbbbbbbbbb', 'BBBBBBBBBBBB']
    },
    cofreAbierto: {
      pal: { b: '#8D5524', B: '#5D3A1A', y: '#FFD23F', w: '#FFF59D', k: '#3E2723', r: '#E53935', c: '#4FC3F7' },
      rows: ['.bbbbbbbbbb.', 'byybbbbbbyyb', 'BBBBBBBBBBBB', '.wywrywcywy.', 'ywyywyywyyyw', 'byybbyybbyyb',
        'bbbbbbbbbbbb', 'BBBBBBBBBBBB']
    },
    puerta: {
      pal: { g: '#90A4AE', G: '#546E7A', b: '#8D5524', B: '#5D3A1A', y: '#FFD23F', k: '#263238' },
      rows: ['GGGGGGGGGGGG', 'GggggggggggG', 'Ggg.bbbb.ggG', 'Gg.bbBBbb.gG', 'Gg.bBbbBb.gG', 'Gg.bbbbbb.gG',
        'Gg.bBbbyb.gG', 'Gg.bbbbbb.gG', 'Gg.bBbbBb.gG', 'Gg.bbbbbb.gG', 'GGGGGGGGGGGG']
    }
  };

  // Dibuja un sprite en un contexto 2D, centrado en la casilla (x, y, T) y apoyado abajo.
  function draw(ctx, sp, x, y, T, opt) {
    opt = opt || {};
    var rows = sp.rows, w = rows[0].length, h = rows.length;
    var px = T * (opt.scale || 0.78) / Math.max(w, h * 0.9);
    var ox = x + (T - w * px) / 2;
    var oy = opt.center ? y + (T - h * px) / 2 : y + T - h * px - T * 0.1;
    for (var r = 0; r < h; r++) {
      for (var c = 0; c < w; c++) {
        var ch = rows[r].charAt(opt.flip ? w - 1 - c : c);
        if (ch === '.' || !sp.pal[ch]) continue;
        ctx.fillStyle = opt.tint && ch !== 'k' ? opt.tint : sp.pal[ch];
        var x0 = Math.round(ox + c * px), y0 = Math.round(oy + r * px);
        ctx.fillRect(x0, y0, Math.round(ox + (c + 1) * px) - x0, Math.round(oy + (r + 1) * px) - y0);
      }
    }
  }
  // Crea un <canvas> con el sprite (para botones y tarjetas)
  function canvasOf(name, size, opt) {
    var c = document.createElement('canvas'), r = window.devicePixelRatio || 1;
    c.width = size * r; c.height = size * r;
    c.style.width = size + 'px'; c.style.height = size + 'px';
    c.style.imageRendering = 'pixelated';
    c.setAttribute('aria-hidden', 'true');
    var x = c.getContext('2d'); x.setTransform(r, 0, 0, r, 0, 0);
    if (S[name]) draw(x, S[name], 0, 0, size, Object.assign({ scale: 0.9, center: true }, opt || {}));
    return c;
  }

  window.IK_SPRITES = S;
  window.IKSprites = { draw: draw, canvasOf: canvasOf, all: S };
})();
