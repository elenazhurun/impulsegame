// 9 игровых персонажей Studio Impulse: данные, способности и пиксельные спрайты 16x24.
// Внешность собрана по фотографиям: причёска, цвета, одежда, аксессуары.
(function () {
  const CHARS = [
    {
      key: 'belaya', first: 'МАША', last: 'БЕЛАЯ', hud: 'МАША БЕЛАЯ', ability: 'SPEED', abCol: '#ffe14d',
      desc: 'RUN + SPRINT',
      speed: 128, jump: 235, sprint: 165,
      skin: '#e2ae82', hair: '#3a2416', hairHi: '#5a3a24', style: 'bun', eye: '#1a1008', lips: '#b0504a',
      top: '#1e1e26', topHi: '#ffffff', sleeves: 'long', bottom: 'pants', botCol: '#2a2a36', legCol: '#2a2a36', shoe: '#f2f2f2',
    },
    {
      key: 'barkova', first: 'МАША', last: 'БАРКОВА', hud: 'МАША БАРКОВА', ability: 'JUMP', abCol: '#5dffb0',
      desc: 'SUPER LEAP',
      speed: 88, jump: 292,
      skin: '#f0c4a0', hair: '#94572d', hairHi: '#b87a48', style: 'long', eye: '#3a2412', lips: '#b8584c',
      top: '#1a1a1e', topHi: '#e8b830', sleeves: 'short', bottom: 'pants', botCol: '#26262c', legCol: '#26262c', shoe: '#3a3a44',
    },
    {
      key: 'damshel', first: 'КСЮША', last: 'ДАМШЕЛЬ', hud: 'КСЮША ДАМШЕЛЬ', ability: 'SPIN', abCol: '#ff7ad9',
      desc: 'SPIN + GLIDE',
      speed: 92, jump: 240,
      skin: '#f6d6b6', hair: '#e8c878', hairHi: '#fff0b0', style: 'updo', eye: '#5a8ab8', lips: '#d02a2a',
      top: '#16161c', topHi: '#f6efe0', sleeves: 'none', bottom: 'dress', botCol: '#16161c', legCol: '#f6d6b6', shoe: '#f6d6b6',
    },
    {
      key: 'dzhinzher', first: 'ОКСАНА', last: 'ДЖИНДЖЕР', hud: 'ОКСАНА ДЖИНДЖЕР', ability: 'POWER', abCol: '#ff6a4d',
      desc: 'SMASH BLOCKS',
      speed: 86, jump: 235,
      skin: '#f0c8a8', hair: '#b87a4a', hairHi: '#d89c68', style: 'bun', eye: '#3a2412', lips: '#c25a52',
      top: '#141418', topHi: '#f6efe0', sleeves: 'long', bottom: 'skirt', botCol: '#141418', legCol: '#141418', shoe: '#141418',
    },
    {
      key: 'linko', first: 'НАСТЯ', last: 'ЛИНКО', hud: 'НАСТЯ ЛИНКО', ability: 'DASH', abCol: '#4dd8ff',
      desc: 'QUICK DASH',
      speed: 96, jump: 235,
      skin: '#eecfb0', hair: '#46281c', hairHi: '#7a4630', style: 'long', eye: '#241410', lips: '#a8564c',
      top: '#131316', topHi: '#e8c040', sleeves: 'none', bottom: 'boots', botCol: '#131316', legCol: '#0c0c10', shoe: '#0c0c10',
    },
    {
      key: 'burnos', first: 'ИЛЬЯ', last: 'БУРНОС', hud: 'ИЛЬЯ БУРНОС', ability: 'BLOCK', abCol: '#b8b8ff',
      desc: 'TRAP SHIELD',
      speed: 88, jump: 232,
      skin: '#f0c8a8', hair: '#8c6a30', hairHi: '#b8944c', style: 'curly', eye: '#3a2412', lips: '#c0766a',
      top: '#f4f4f8', topHi: '#111116', sleeves: 'long', bottom: 'pants', botCol: '#f4f4f8', legCol: '#e8e8f0', shoe: '#c8c8d4',
    },
    {
      key: 'glebovich', first: 'ДАША', last: 'ГЛЕБОВИЧ', hud: 'ДАША ГЛЕБОВИЧ', ability: 'DOUBLE JUMP', abCol: '#c78bff',
      desc: 'JUMP TWICE',
      speed: 92, jump: 235,
      skin: '#e8bfa0', hair: '#5a3320', hairHi: '#86502e', style: 'cap', eye: '#2a1810', lips: '#a8564c',
      top: '#3c3458', topHi: '#8a7fb0', sleeves: 'long', bottom: 'pants', botCol: '#26262e', legCol: '#26262e', shoe: '#1c1c22',
      cap: '#b8a672', capDk: '#8a7a4c',
    },
    {
      key: 'zhurun', first: 'НАСТЯ', last: 'ЖУРУН', hud: 'НАСТЯ ЖУРУН', ability: 'BALANCE', abCol: '#ffa64d',
      desc: 'GRIP + HOVER',
      speed: 100, jump: 250,
      skin: '#f2cdb0', hair: '#d0763a', hairHi: '#eea060', style: 'shoulder', eye: '#4a8ac8', lips: '#c02a3a',
      top: '#16161a', topHi: '#c8c8d8', sleeves: 'short', bottom: 'skirt', botCol: '#16161a', legCol: '#f2cdb0', shoe: '#16161a',
    },
    {
      key: 'gatalskaya', first: 'ОКСАНА', last: 'ГАТАЛЬСКАЯ', hud: 'ОКСАНА ГАТАЛЬСКАЯ', ability: 'ULTIMATE', abCol: '#ff5d7a',
      desc: 'TEAM POWER',
      speed: 105, jump: 250,
      skin: '#e8c0a0', hair: '#3a2a22', hairHi: '#5a4234', style: 'hood', eye: '#3a2a20', lips: '#c0685a',
      top: '#5c6c3a', topHi: '#3c4a26', sleeves: 'long', bottom: 'pants', botCol: '#3a4254', legCol: '#3a4254', shoe: '#f0f0f0',
      hood: '#eec4d6', hoodDk: '#d4a0b8',
    },
  ];

  function mk(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  function drawDancer(g, c, pose, f) {
    const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    const P = (x, y, col) => R(x, y, 1, 1, col);
    const walk = pose === 'walk', air = pose === 'jump', abil = pose === 'ability';
    const up = air || abil;
    const bob = pose === 'idle' && f === 1 ? 1 : 0;
    const key = c.key;
    const hc = c.hair, hh = c.hairHi;

    // ---------- ноги / платье (не качаются от bob) ----------
    if (c.bottom === 'dress') {
      const sway = walk ? (f === 1 ? 1 : f === 3 ? -1 : 0) : 0;
      if (up) {
        R(4, 17, 8, 3, c.botCol); R(3, 20, 10, 2, c.botCol); R(2, 21, 12, 1, c.botCol);
        R(5, 22, 2, 1, c.skin); R(9, 22, 2, 1, c.skin);
      } else {
        R(4, 17, 8, 3, c.botCol); R(3, 20 + 0, 10, 2 + 1, c.botCol);
        R(2 + sway, 21, 12, 2, c.botCol);
        P(4 + sway, 22, '#26262e'); P(11 + sway, 22, '#26262e');
        if (walk && f === 1) { R(6, 23, 2, 1, c.skin); R(10, 23, 2, 1, c.skin); }
        else if (walk && f === 3) { R(4, 23, 2, 1, c.skin); R(8, 23, 2, 1, c.skin); }
        else { R(5, 23, 2, 1, c.skin); R(9, 23, 2, 1, c.skin); }
      }
    } else {
      let lx = 5, rx = 8, lh = 4, rh = 4, ls = 22, rs = 22;
      if (walk && f === 1) { lh = 3; ls = 21; lx = 6; }
      if (walk && f === 3) { rh = 3; rs = 21; rx = 7; }
      if (up) { lx = 4; rx = 9; lh = 3; rh = 3; ls = 21; rs = 21; }
      let legCol = c.legCol;
      if (c.bottom === 'skirt' || c.bottom === 'boots') legCol = c.bottom === 'boots' ? c.legCol : c.legCol;
      R(lx, 18, 3, lh, legCol); R(rx, 18, 3, rh, legCol);
      if (c.bottom === 'boots') {
        // высокие лаковые сапоги
        R(lx, 18, 3, lh, '#0c0c10'); R(rx, 18, 3, rh, '#0c0c10');
        P(lx + 1, 19, '#5a5a72'); P(rx + 1, 19, '#5a5a72'); P(lx + 1, 21, '#5a5a72'); P(rx + 1, 21, '#5a5a72');
      }
      if (c.bottom === 'skirt' && key === 'dzhinzher') {
        // чёрные колготки + ботинки
        R(lx, 18, 3, lh, '#1c1c22'); R(rx, 18, 3, rh, '#1c1c22');
      }
      R(lx, ls, 4, 2, c.shoe); R(rx, rs, 4, 2, c.shoe);
      if (key === 'belaya') { P(lx + 1, ls, '#c0c0c8'); P(rx + 1, rs, '#c0c0c8'); }
      if (key === 'burnos') { P(lx + 3, ls + 1, '#8a8a98'); P(rx + 3, rs + 1, '#8a8a98'); }
    }

    g.save();
    g.translate(0, bob);

    // ---------- волосы сзади ----------
    switch (c.style) {
      case 'long':
        R(4, 2, 8, 3, hc); R(3, 3, 2, 11, hc); R(11, 3, 2, 11, hc);
        R(2, 9, 1, 4, hc); R(13, 10, 1, 4, hc); P(3, 6, hh); P(12, 8, hh); P(3, 11, hh); P(12, 12, hh);
        break;
      case 'shoulder':
        R(4, 2, 8, 3, hc); R(3, 3, 2, 8, hc); R(11, 3, 2, 8, hc); P(3, 10, hh); P(12, 9, hh); P(2, 8, hc); P(13, 8, hc);
        break;
      case 'updo':
        R(4, 1, 8, 3, hc); R(5, 0, 5, 1, hc); R(3, 3, 2, 9, hc); R(11, 3, 2, 8, hc); R(12, 2, 2, 3, hc); P(3, 6, hh); P(12, 6, hh);
        break;
      case 'bun':
        R(4, 2, 8, 3, hc); R(6, 0, 4, 2, hc); P(7, 0, hh); P(3, 4, hc); P(12, 4, hc);
        break;
      case 'curly':
        R(3, 1, 10, 4, hc); R(4, 0, 3, 1, hc); R(8, 0, 4, 1, hc); R(3, 5, 1, 2, hc); R(12, 5, 1, 2, hc);
        P(5, 1, hh); P(9, 0, hh); P(11, 2, hh); P(4, 3, hh);
        break;
      case 'cap':
        R(4, 2, 8, 3, hc); R(3, 3, 2, 10, hc); R(11, 3, 2, 10, hc); R(2, 9, 1, 3, hc); R(13, 10, 1, 3, hc); P(3, 8, hh); P(12, 9, hh);
        break;
      case 'hood':
        R(3, 1, 10, 4, c.hood); R(3, 4, 2, 8, c.hood); R(11, 4, 2, 8, c.hood);
        R(2, 8, 1, 3, c.hoodDk); R(13, 8, 1, 3, c.hoodDk); R(4, 0, 8, 1, c.hood);
        break;
    }

    // ---------- шея, торс ----------
    R(7, 10, 2, 1, c.skin);
    const bodyTop = c.top;
    R(4, 11, 8, 7, bodyTop);

    // детали одежды по персонажу
    if (key === 'belaya') {
      P(9, 13, '#ffffff'); P(8, 14, '#ffffff'); P(10, 14, '#ffffff');
      R(4, 17, 8, 1, '#0c0c12');
    } else if (key === 'barkova') {
      R(6, 10, 4, 1, '#e8b830'); P(7, 11, '#e8b830'); P(8, 11, '#e8b830');
    } else if (key === 'damshel') {
      R(6, 11, 4, 1, c.skin); R(7, 12, 2, 1, c.skin); P(5, 10, bodyTop); P(10, 10, bodyTop);
      P(7, 13, '#f6efe0'); P(8, 14, '#f6efe0'); P(7, 15, '#e0d0b0'); // ракушки-подвеска
      P(4, 9, '#f6efe0'); // серьга
    } else if (key === 'dzhinzher') {
      R(6, 9, 4, 2, bodyTop); // водолазка
      P(7, 12, '#2a2a30'); P(8, 12, '#2a2a30');
    } else if (key === 'linko') {
      R(6, 10, 4, 1, bodyTop); P(4, 8, '#e8c040'); // серьга
    } else if (key === 'burnos') {
      R(6, 11, 4, 1, '#ffffff'); R(7, 11, 2, 4, '#111116'); P(7, 15, '#111116');
      P(5, 12, '#d0d0dc'); P(5, 13, '#d0d0dc'); P(10, 12, '#d0d0dc'); P(10, 13, '#d0d0dc');
      // лента «Выпускник» по диагонали
      for (let i = 0; i < 7; i++) { P(4 + i, 11 + i, '#9aa0bc'); P(5 + i, 11 + i, '#ffffff'); P(6 + i, 11 + i, '#c8ccdc'); }
    } else if (key === 'glebovich') {
      for (let y = 12; y < 18; y += 2) R(4, y, 8, 1, c.topHi);
      R(6, 11, 1, 7, c.topHi); R(9, 11, 1, 7, c.topHi);
      R(7, 11, 2, 1, c.skin);
    } else if (key === 'zhurun') {
      R(6, 10, 4, 1, '#c8c8d8'); P(7, 11, '#c8c8d8'); P(8, 11, '#c8c8d8');
      P(4, 11, bodyTop); P(11, 11, bodyTop);
      P(4, 9, '#c8c8d8'); // серьга
      P(6, 14, '#2a2a30'); P(6, 16, '#2a2a30'); // пуговицы
    } else if (key === 'gatalskaya') {
      R(4, 10, 8, 1, c.hood); R(5, 11, 6, 1, c.hoodDk); // капюшон на плечах
      R(8, 12, 1, 6, c.topHi); R(4, 17, 8, 1, c.topHi);
    }

    // юбка / низ (над ногами)
    if (c.bottom === 'skirt') {
      R(4, 17, 8, 2, c.botCol); R(3, 18, 10, 1, c.botCol);
      if (key === 'zhurun') P(9, 18, '#2a2a30');
    } else if (c.bottom === 'boots') {
      R(4, 17, 8, 2, c.botCol); P(3, 18, c.botCol); P(12, 18, c.botCol);
    } else if (c.bottom === 'pants') {
      R(4, 17, 8, 1, c.botCol);
      if (key === 'burnos') P(4, 17, '#d8d8e2');
    }

    // ---------- руки ----------
    const slv = c.sleeves === 'none' ? c.skin : c.top;
    let ly = 11, ry = 11, lh = 6, rh = 6;
    if (walk && f === 1) { ly = 12; ry = 10; }
    if (walk && f === 3) { ly = 10; ry = 12; }
    if (abil) { ly = 3; ry = 3; lh = 8; rh = 8; }
    else if (air) { ly = 7; ry = 7; lh = 6; rh = 6; }
    const sleeveLen = c.sleeves === 'short' ? 3 : c.sleeves === 'none' ? 0 : lh;
    const armR = (x, y, h) => {
      if (c.sleeves === 'none') { R(x, y, 2, h, c.skin); return; }
      R(x, y, 2, h, c.skin);
      const sl = c.sleeves === 'short' ? 3 : h - 1;
      if (up) R(x, y + h - sl, 2, sl, c.top); else R(x, y, 2, sl, c.top);
    };
    armR(2, ly, lh); armR(12, ry, rh);
    void slv; void sleeveLen;
    if (key === 'belaya') { R(2, ly + 1, 1, 4, '#ffffff'); R(13, ry + 1, 1, 4, '#ffffff'); }
    if (key === 'linko') { R(12, ry + rh - 2, 2, 2, '#f0c848'); P(12, ry + rh - 2, '#fff2a0'); }
    if (key === 'barkova') { R(12, ry + rh - 2, 2, 1, '#e8b830'); }
    if (key === 'glebovich') { R(2, ly + lh - 3, 2, 3, '#14141a'); R(12, ry + rh - 3, 2, 3, '#14141a'); }
    if (key === 'zhurun') { P(12, ry + rh - 2, '#c8c8d8'); }
    if (key === 'burnos') { P(3, ly + lh - 1, '#f0c8a8'); }

    // ---------- аксессуары в руке ----------
    const hy = abil ? 9 : up ? 10 : ry + rh - 1;
    if (key === 'damshel' || key === 'zhurun') {
      // бокал шампанского
      R(13, hy - 5, 2, 3, '#f8f0c0'); P(13, hy - 5, '#ffffff'); R(14, hy - 2, 1, 2, '#dfe6f0'); R(13, hy, 3, 1, '#dfe6f0');
    }
    if (key === 'dzhinzher') {
      // букет белых роз
      R(9, 12 + (up ? -2 : 0), 5, 4, '#f6efe0'); P(10, 13 + (up ? -2 : 0), '#e0cc98'); P(12, 12 + (up ? -2 : 0), '#e0cc98'); P(11, 15 + (up ? -2 : 0), '#e0cc98');
      R(10, 16 + (up ? -2 : 0), 2, 2, '#2f6a3a');
      R(12, ry + rh - 1, 2, 1, c.skin);
    }
    if (key === 'gatalskaya') {
      // стаканчик Starbucks
      R(13, hy - 5, 3, 1, '#e8e8e8'); R(13, hy - 4, 3, 4, '#ffffff'); R(13, hy - 3, 3, 1, '#0a8a56'); P(14, hy - 3, '#ffffff');
    }

    // ---------- голова ----------
    R(4, 3, 8, 7, c.skin);
    P(6, 6, c.eye); P(9, 6, c.eye);
    if (abil || air) { P(6, 5, c.eye); P(9, 5, c.eye); }
    R(7, 8, 2, 1, c.lips);
    if (abil) { R(7, 8, 2, 1, '#ffffff'); P(7, 9, c.lips); P(8, 9, c.lips); }
    if (key === 'zhurun') { P(5, 7, '#d8956a'); P(10, 7, '#d8956a'); P(7, 7, '#d8956a'); }
    if (key === 'burnos') { P(5, 8, '#e0b898'); P(10, 8, '#e0b898'); }
    if (key === 'gatalskaya') { P(5, 8, '#eeb0a0'); P(10, 8, '#eeb0a0'); }

    // ---------- волосы спереди ----------
    switch (c.style) {
      case 'long':
        R(4, 2, 8, 2, hc); R(4, 4, 3, 1, hc); R(9, 4, 3, 1, hc); P(5, 2, hh); P(8, 2, hh); P(4, 5, hc); P(11, 5, hc);
        break;
      case 'shoulder':
        R(4, 2, 8, 2, hc); R(4, 4, 5, 1, hc); P(4, 5, hc); P(11, 4, hc); P(5, 2, hh); P(9, 2, hh);
        break;
      case 'updo':
        R(4, 2, 8, 2, hc); P(4, 4, hc); P(11, 4, hc); P(6, 2, hh); P(9, 2, hh);
        break;
      case 'bun':
        R(4, 2, 8, 2, hc); P(4, 4, hc); P(11, 4, hc); P(4, 5, hc); P(11, 5, hc); P(6, 2, hh);
        break;
      case 'curly':
        R(3, 2, 10, 2, hc); P(3, 4, hc); P(12, 4, hc); P(4, 4, hc); P(11, 4, hc); P(6, 2, hh); P(9, 3, hh); P(7, 4, hc); P(9, 4, hc);
        break;
      case 'cap':
        R(3, 1, 10, 3, c.cap); R(4, 4, 9, 1, c.capDk); R(3, 3, 1, 2, c.capDk); P(6, 2, '#d4c690'); P(9, 2, '#d4c690');
        P(4, 5, hc); P(11, 5, hc);
        break;
      case 'hood':
        R(4, 2, 8, 2, c.hood); R(4, 4, 1, 4, c.hood); R(11, 4, 1, 4, c.hood); R(3, 1, 10, 1, c.hood);
        R(5, 4, 4, 1, hc); P(5, 5, hc); P(9, 4, hc);
        break;
    }
    g.restore();

    // блики ткани на чёрной одежде
    if (key === 'linko' || key === 'zhurun' || key === 'barkova' || key === 'damshel') {
      P(5, 13 + bob, '#3a3a46'); P(10, 15 + bob, '#3a3a46');
    }
  }

  const CACHE = {};
  const FRAMES = { idle: 2, walk: 4, jump: 1, ability: 2 };

  function dancer(idx, pose, frame) {
    const fr = frame % FRAMES[pose];
    const k = idx + pose + fr;
    if (CACHE[k]) return CACHE[k];
    const cv = mk(16, 24);
    drawDancer(cv.getContext('2d'), CHARS[idx], pose, fr);
    CACHE[k] = cv;
    return cv;
  }

  // силуэт (для ещё не присоединившихся членов команды)
  const SIL = {};
  function silhouette(idx) {
    if (SIL[idx]) return SIL[idx];
    const src = dancer(idx, 'idle', 0);
    const cv = mk(16, 24);
    const g = cv.getContext('2d');
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = '#2a2450';
    g.fillRect(0, 0, 16, 24);
    SIL[idx] = cv;
    return cv;
  }

  window.Chars = { list: CHARS, dancer, silhouette, FRAMES };
})();
