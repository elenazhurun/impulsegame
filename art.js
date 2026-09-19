// Пиксель-арт: тайлы, предметы, фоны, иконки. Всё рисуется кодом в единой 8-bit палитре.
(function () {
  function mk(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }
  function paint(g, rows, pal, ox, oy) {
    for (let y = 0; y < rows.length; y++) {
      for (let x = 0; x < rows[y].length; x++) {
        const k = rows[y][x];
        if (k !== '.' && pal[k]) { g.fillStyle = pal[k]; g.fillRect(ox + x, oy + y, 1, 1); }
      }
    }
  }
  function rng(seed) {
    let s = seed;
    return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  }

  const THEMES = [
    { // STUDIO
      gBase: '#8a4fb8', gDark: '#5e2f8c', gTop: '#ff8ad8', gTopHi: '#ffd0f0', gTopDk: '#c04a98',
      blk: '#ffb04d', blkHi: '#ffe0a0', blkDk: '#b8601a', plank: '#ffd166', plankDk: '#b8801a',
    },
    { // DANCE FLOOR
      gBase: '#2b3aa8', gDark: '#1a2470', gTop: '#3ef0ff', gTopHi: '#c0fbff', gTopDk: '#1a9ab8',
      blk: '#ff5db8', blkHi: '#ffb0e0', blkDk: '#a01870', plank: '#7dffb0', plankDk: '#1a9a58',
    },
    { // IMPULSE CHALLENGE (neon)
      gBase: '#3a1a6e', gDark: '#20104a', gTop: '#ff4fd8', gTopHi: '#ffb0f0', gTopDk: '#a018a0',
      blk: '#4dc8ff', blkHi: '#b0eeff', blkDk: '#1860a8', plank: '#ffe14d', plankDk: '#b88a10',
    },
  ];

  const TILE_CACHE = {};
  function tile(ch, th, o) {
    o = o || {};
    const key = ch + '|' + th + '|' + (o.top ? 1 : 0) + '|' + (o.frame | 0) + '|' + (o.active ? 1 : 0);
    if (TILE_CACHE[key]) return TILE_CACHE[key];
    const T = THEMES[th];
    const cv = mk(16, ch === 'G' ? 32 : 16);
    const g = cv.getContext('2d');
    const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
    const P = (x, y, c) => R(x, y, 1, 1, c);

    const ground = (wet) => {
      R(0, 0, 16, 16, T.gBase);
      R(0, 7, 16, 1, T.gDark); R(0, 15, 16, 1, T.gDark); R(3, 0, 1, 7, T.gDark); R(11, 8, 1, 7, T.gDark);
      P(1, 1, T.gTopHi); P(8, 10, T.gTopHi); P(14, 3, T.gTopHi);
      if (o.top) {
        R(0, 0, 16, 4, wet ? '#7ae8ff' : T.gTop);
        R(0, 0, 16, 1, wet ? '#e8fdff' : T.gTopHi);
        R(0, 4, 16, 1, wet ? '#2a90c8' : T.gTopDk);
        if (wet) { P(3, 2, '#ffffff'); P(4, 2, '#ffffff'); P(10, 1, '#ffffff'); P(13, 3, '#ffffff'); R(6, 3, 3, 1, '#b8f4ff'); }
        else { P(2, 2, T.gTopHi); P(9, 1, T.gTopHi); P(13, 2, T.gTopDk); }
      } else if (wet) {
        R(0, 0, 16, 2, '#3a70c8');
      }
    };

    switch (ch) {
      case '#': ground(false); break;
      case 'w': ground(true); break;
      case '=': {
        R(0, 0, 16, 16, T.blkDk); R(1, 1, 14, 14, T.blk);
        R(1, 1, 14, 1, T.blkHi); R(1, 1, 1, 14, T.blkHi);
        R(5, 5, 6, 6, T.blkDk); R(6, 6, 4, 4, T.blk); P(6, 6, T.blkHi);
        P(3, 3, T.blkDk); P(12, 3, T.blkDk); P(3, 12, T.blkDk); P(12, 12, T.blkDk);
        break;
      }
      case '-': {
        R(0, 0, 16, 5, T.plank); R(0, 0, 16, 1, '#ffffff'); R(0, 4, 16, 1, T.plankDk);
        R(0, 5, 16, 2, T.plankDk); P(2, 2, T.plankDk); P(7, 2, T.plankDk); P(12, 2, T.plankDk);
        R(2, 7, 2, 2, T.plankDk); R(12, 7, 2, 2, T.plankDk);
        break;
      }
      case 'B': {
        R(0, 0, 16, 16, '#5a2a10'); R(1, 1, 14, 14, '#d8843a');
        R(1, 1, 14, 2, '#f0a860'); R(1, 13, 14, 2, '#a85a20');
        R(2, 7, 12, 2, '#a85a20');
        // трещины
        P(4, 3, '#3a1a08'); P(5, 4, '#3a1a08'); P(6, 5, '#3a1a08'); P(5, 6, '#3a1a08');
        P(10, 9, '#3a1a08'); P(11, 10, '#3a1a08'); P(10, 11, '#3a1a08'); P(9, 12, '#3a1a08');
        // «POW» звёздочка
        P(11, 4, '#ffe14d'); P(10, 5, '#ffe14d'); P(12, 5, '#ffe14d'); P(11, 6, '#ffe14d'); P(11, 5, '#fff');
        break;
      }
      case 'F': {
        R(0, 0, 16, 16, '#6a58a8'); R(1, 1, 14, 12, '#c8b8ff'); R(1, 1, 14, 1, '#f0e8ff');
        R(1, 13, 14, 2, '#8a78c8');
        P(4, 4, '#8a78c8'); P(5, 5, '#8a78c8'); P(9, 3, '#8a78c8'); P(10, 4, '#8a78c8'); P(11, 8, '#8a78c8'); P(6, 9, '#8a78c8');
        P(0, 15, '#000'); P(15, 15, '#000');
        break;
      }
      case '^': {
        for (let s = 0; s < 2; s++) {
          const bx = s * 8;
          for (let y = 0; y < 9; y++) {
            const w = 1 + Math.floor(y * 8 / 9);
            const x0 = bx + Math.floor((8 - w) / 2);
            R(x0, 7 + y, w, 1, '#d8d8ec');
            P(x0 + w - 1, 7 + y, '#8888aa');
          }
          P(bx + 3, 8, '#ffffff'); P(bx + 3, 10, '#ffffff');
        }
        R(0, 15, 16, 1, '#5a5a78');
        break;
      }
      case 'D': {
        R(0, 0, 16, 16, '#ffdc4d');
        for (let i = 0; i < 4; i++) R(i * 4, 0, 2, 16, '#d03a3a');
        R(0, 0, 16, 1, '#ffffff'); R(0, 15, 16, 1, '#8a1a1a');
        R(6, 6, 4, 5, '#3a3a48'); R(7, 4, 2, 3, '#3a3a48'); P(8, 8, '#ffdc4d');
        if (o.active) { g.globalAlpha = 0.85; }
        break;
      }
      case 'K': {
        R(2, 11, 12, 5, '#5a5a78'); R(2, 11, 12, 1, '#9a9ab8');
        if (o.active) { R(4, 9, 8, 3, '#3aff6a'); R(4, 9, 8, 1, '#b8ffcc'); }
        else { R(4, 7, 8, 5, '#ff3a3a'); R(4, 7, 8, 1, '#ff9a9a'); R(4, 11, 8, 1, '#a01818'); }
        break;
      }
      case 'R': {
        // виниловая пластинка (вращается кадрами)
        for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
          const dx = x - 7.5, dy = y - 7.5, d = Math.sqrt(dx * dx + dy * dy);
          if (d <= 7.5) {
            let col = '#14141c';
            if (d > 6 || (d > 4.2 && d < 5)) col = '#26262f';
            if (d <= 3) col = o.active ? '#5dff9a' : '#ff5db8';
            g.fillStyle = col; g.fillRect(x, y, 1, 1);
          }
        }
        // блик вращается
        const hx = [[3, 3], [11, 3], [11, 11], [3, 11]][(o.frame | 0) % 4];
        P(hx[0], hx[1], '#7a7a9a'); P(hx[0] + 1, hx[1], '#7a7a9a');
        P(7, 7, '#14141c'); P(8, 8, '#14141c');
        break;
      }
      case 'r': {
        if (o.active) {
          R(0, 0, 16, 5, '#5dffe0'); R(0, 0, 16, 1, '#ffffff'); R(0, 4, 16, 1, '#1a9a88');
          R(0, 5, 16, 2, '#1a9a88'); P(3, 2, '#1a9a88'); P(8, 2, '#1a9a88'); P(13, 2, '#1a9a88');
        } else {
          for (let x = 0; x < 16; x += 4) { R(x, 0, 2, 1, '#ff5db8'); R(x + 2, 4, 2, 1, '#ff5db8'); }
          P(0, 2, '#ff5db8'); P(15, 2, '#ff5db8');
        }
        break;
      }
      case 'C': {
        R(7, 5, 2, 11, '#8a8aa8'); R(4, 14, 8, 2, '#5a5a78');
        const on = o.active;
        R(5, 1, 6, 5, on ? '#ffe14d' : '#8a8aa8'); R(6, 0, 4, 1, on ? '#ffe14d' : '#8a8aa8');
        R(6, 2, 2, 2, on ? '#ffffff' : '#b8b8d0');
        if (on) { P(3, 3, '#ffe14d'); P(12, 3, '#ffe14d'); P(8, 0, '#fff'); }
        break;
      }
      case 'G': {
        R(0, 0, 16, 32, '#ffdc4d'); R(0, 0, 16, 2, '#ffffff'); R(0, 30, 16, 2, '#b88a10');
        R(2, 3, 12, 29, '#4a1a88');
        // вращающиеся огни
        const cols = ['#ff5db8', '#4dc8ff', '#ffe14d', '#5dff9a'];
        for (let i = 0; i < 6; i++) R(3 + (i % 2) * 6, 5 + i * 4, 4, 2, cols[(i + (o.frame | 0)) % 4]);
        P(11, 18, '#ffdc4d'); P(11, 19, '#ffdc4d');
        R(5, 22, 6, 1, '#8a4fc8');
        break;
      }
    }
    TILE_CACHE[key] = cv;
    return cv;
  }

  // ---------- предметы ----------
  const ITEM_MAPS = {
    o: {
      rows: ['...YY...', '...YY...', 'YYYYYYYY', '.YYWWYY.', '..YWWY..', '.YYYYYY.', '.YY..YY.', '.Y....Y.'],
      pal: { Y: '#ffd93d', W: '#fff7b8' },
    },
    n: {
      rows: ['...####.', '...#..##', '...#....', '...#....', '.###....', '####....', '####....', '.##.....'],
      pal: { '#': '#4df0ff' },
    },
    e: {
      rows: ['....YY..', '...YY...', '..YY....', '.YYYYYY.', '....YY..', '...YY...', '..YY....', '.Y......'],
      pal: { Y: '#ffe14d' },
    },
    t: {
      rows: ['....##....', '....##....', '...####...', '##########', '.########.', '..######..', '..######..', '.###..###.', '.##....##.', '#........#'],
      pal: { '#': '#ff5db8' },
    },
  };
  const ITEM_CACHE = {};
  function item(ch, alt) {
    const key = ch + (alt ? 1 : 0);
    if (ITEM_CACHE[key]) return ITEM_CACHE[key];
    const m = ITEM_MAPS[ch];
    const w = m.rows[0].length, h = m.rows.length;
    const cv = mk(w, h);
    const g = cv.getContext('2d');
    const pal = Object.assign({}, m.pal);
    if (ch === 't' && alt) pal['#'] = '#ffffff';
    paint(g, m.rows, pal, 0, 0);
    if (ch === 't') { g.fillStyle = '#ffffff'; g.fillRect(4, 3, 2, 3); g.fillRect(3, 4, 4, 1); }
    ITEM_CACHE[key] = cv;
    return cv;
  }

  // ---------- иконки HUD ----------
  const HEART = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
  function heart(full) {
    const key = 'h' + (full ? 1 : 0);
    if (ITEM_CACHE[key]) return ITEM_CACHE[key];
    const cv = mk(7, 6);
    paint(cv.getContext('2d'), HEART, { '#': full ? '#ff3a5a' : '#4a2a4a' }, 0, 0);
    ITEM_CACHE[key] = cv;
    return cv;
  }

  // ---------- знак-подсказка ----------
  function sign() {
    if (ITEM_CACHE.sign) return ITEM_CACHE.sign;
    const cv = mk(16, 16);
    const g = cv.getContext('2d');
    g.fillStyle = '#7a4a20'; g.fillRect(7, 8, 2, 8);
    g.fillStyle = '#d8a050'; g.fillRect(1, 1, 14, 9);
    g.fillStyle = '#f0c880'; g.fillRect(1, 1, 14, 1);
    g.fillStyle = '#7a4a20'; g.fillRect(3, 4, 10, 1); g.fillRect(3, 6, 7, 1);
    ITEM_CACHE.sign = cv;
    return cv;
  }

  // ---------- стрелки для ритм-игры ----------
  // dir: 0=left 1=down 2=up 3=right
  function arrowCanvas(dir, color, dark) {
    const key = 'ar' + dir + color;
    if (ITEM_CACHE[key]) return ITEM_CACHE[key];
    const S = 13;
    const cv = mk(S, S);
    const g = cv.getContext('2d');
    const cells = [];
    // «вверх»: голова 6 строк, ствол 3 шириной
    for (let r = 0; r < 6; r++) { const w = 2 * r + 1; for (let i = 0; i < w; i++) cells.push([6 - r + i, r]); }
    for (let r = 6; r < 13; r++) for (let i = 4; i <= 8; i++) if (r >= 6) cells.push([i, r]);
    const rot = (x, y) => {
      if (dir === 2) return [x, y];
      if (dir === 1) return [12 - x, 12 - y];
      if (dir === 0) return [y, 12 - x];
      return [12 - y, x];
    };
    const place = (col, ox, oy) => {
      g.fillStyle = col;
      for (const [x, y] of cells) { const [a, b] = rot(x, y); g.fillRect(a + ox, b + oy, 1, 1); }
    };
    place(dark, 0, 0);
    // внутренняя светлая часть: рисуем смещённой и обрезаем визуально
    g.globalCompositeOperation = 'source-over';
    for (const [x, y] of cells) {
      const [a, b] = rot(x, y);
      const inner = a > 0 && b > 0 && a < S - 1 && b < S - 1;
      g.fillStyle = inner ? color : dark;
      g.fillRect(a, b, 1, 1);
    }
    ITEM_CACHE[key] = cv;
    return cv;
  }

  // ---------- фоны ----------
  const BG = {};
  function bg(idx) {
    if (BG[idx]) return BG[idx];
    const cv = mk(320, 180);
    const g = cv.getContext('2d');
    const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
    const rand = rng(idx * 977 + 13);

    if (idx === 0) {
      // студия: стена с зеркалами, станок, гирлянды
      const bands = ['#ffd6ee', '#f8c8ea', '#eebee8', '#e2b4e8', '#d6aae8', '#caa0e8'];
      for (let i = 0; i < bands.length; i++) R(0, i * 30, 320, 30, bands[i]);
      for (let i = 0; i < 3; i++) {
        const x = 18 + i * 104;
        R(x - 2, 22, 72, 96, '#8a5a3a'); R(x, 24, 68, 92, '#9ad8ff');
        R(x, 24, 68, 92, '#a8e0ff');
        for (let k = 0; k < 5; k++) { R(x + 8 + k * 10, 24, 3, 92, '#c8f0ff'); }
        R(x + 6, 32, 20, 2, '#ffffff'); R(x + 40, 70, 20, 2, '#ffffff');
        R(x, 24, 68, 6, '#7ac0f0');
      }
      R(0, 122, 320, 4, '#d8a040'); R(0, 122, 320, 1, '#ffe090'); // станок
      for (let x = 10; x < 320; x += 50) R(x, 126, 3, 30, '#a87830');
      // гирлянда
      for (let x = 0; x < 320; x += 8) {
        const y = 4 + Math.round(Math.sin(x / 50 * Math.PI) * 4);
        R(x, y, 8, 1, '#5a3a6a');
        R(x + 2, y + 1, 3, 3, ['#ff5db8', '#ffe14d', '#4dc8ff', '#5dff9a'][(x / 8) % 4]);
      }
      // плакат
      R(146, 8, 28, 10, '#ff5db8');
    } else if (idx === 1) {
      // танцпол: ночь, лучи, диско-шар
      const bands = ['#120a3a', '#170c48', '#1c1058', '#211468', '#261878', '#2a1c88'];
      for (let i = 0; i < bands.length; i++) R(0, i * 30, 320, 30, bands[i]);
      g.globalAlpha = 0.22;
      const beams = [['#ff3ea5', 40], ['#3ef0ff', 120], ['#ffe14d', 200], ['#5dff9a', 280]];
      for (const [col, cx] of beams) {
        g.fillStyle = col;
        for (let y = 0; y < 150; y += 2) { const w = 4 + y * 0.35; g.fillRect(Math.round(cx - w / 2 + Math.sin(cx) * y * 0.15), y, Math.round(w), 2); }
      }
      g.globalAlpha = 1;
      // диско-шар
      R(159, 0, 2, 24, '#8a8aa8');
      for (let y = 0; y < 26; y++) for (let x = 0; x < 26; x++) {
        const dx = x - 12.5, dy = y - 12.5;
        if (dx * dx + dy * dy <= 156) {
          const c = ((x >> 2) + (y >> 2)) % 2 ? '#e8e8ff' : '#8a90d8';
          R(147 + x, 24 + y, 1, 1, ((x * 7 + y * 3) % 11 === 0) ? '#ffffff' : c);
        }
      }
      // колонки
      for (const sx of [10, 262]) {
        R(sx, 100, 46, 60, '#0c0824'); R(sx + 3, 103, 40, 54, '#1a1240');
        for (const cy of [118, 142]) { for (let y = -9; y <= 9; y++) for (let x = -9; x <= 9; x++) if (x * x + y * y <= 81) R(sx + 23 + x, cy + y, 1, 1, x * x + y * y < 20 ? '#3a3a6a' : '#0c0824'); }
      }
      // огоньки
      for (let i = 0; i < 60; i++) R(Math.floor(rand() * 320), Math.floor(rand() * 150), 1, 1, ['#ff3ea5', '#3ef0ff', '#ffe14d', '#ffffff'][i % 4]);
    } else if (idx === 2) {
      // неоновый закат: солнце, силуэты города
      const bands = ['#1a0a3a', '#2a1050', '#42145e', '#6a1a6e', '#a02878', '#e0468a', '#ff8a6a'];
      for (let i = 0; i < bands.length; i++) R(0, i * 26, 320, 26, bands[i]);
      for (let i = 0; i < 40; i++) R(Math.floor(rand() * 320), Math.floor(rand() * 70), 1, 1, '#ffffff');
      // солнце
      for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) {
        const dx = x - 29.5, dy = y - 29.5;
        if (dx * dx + dy * dy <= 900) {
          if (y > 34 && (y % 6) < 3) continue;
          R(130 + x, 60 + y, 1, 1, y < 30 ? '#ffe14d' : y < 45 ? '#ffa04d' : '#ff5d7a');
        }
      }
      // город
      const cols = ['#120826', '#1a0c34', '#0e061e'];
      let x = 0;
      while (x < 320) {
        const w = 14 + Math.floor(rand() * 18), h = 30 + Math.floor(rand() * 70);
        R(x, 180 - h - 20, w, h + 20, cols[Math.floor(rand() * 3)]);
        for (let wy = 180 - h - 14; wy < 150; wy += 6) for (let wx = x + 3; wx < x + w - 3; wx += 5) if (rand() < 0.35) R(wx, wy, 2, 3, rand() < 0.5 ? '#ffe14d' : '#4dc8ff');
        x += w + 1;
      }
      R(0, 150, 320, 1, '#ff4fd8');
    } else {
      // финал: сцена с занавесами
      const bands = ['#1a0a2e', '#26103e', '#34164e', '#421c5e', '#50226e', '#5e2a7e'];
      for (let i = 0; i < bands.length; i++) R(0, i * 30, 320, 30, bands[i]);
      g.globalAlpha = 0.18;
      for (const [col, cx] of [['#ffe14d', 90], ['#ff5db8', 160], ['#4dc8ff', 230]]) {
        g.fillStyle = col;
        for (let y = 0; y < 140; y += 2) { const w = 6 + y * 0.6; g.fillRect(Math.round(cx - w / 2), y, Math.round(w), 2); }
      }
      g.globalAlpha = 1;
      // занавесы
      for (const [x0, dir] of [[0, 1], [320, -1]]) {
        for (let i = 0; i < 6; i++) {
          const w = 8;
          const xx = dir === 1 ? x0 + i * w : x0 - (i + 1) * w;
          R(xx, 0, w, 180, i % 2 ? '#b01838' : '#8a1030');
          R(xx + (dir === 1 ? 0 : w - 2), 0, 2, 180, '#d83858');
        }
      }
      R(0, 0, 320, 8, '#ffcf3a'); R(0, 8, 320, 2, '#a07a10');
      // сцена
      R(0, 146, 320, 34, '#8a5a30');
      for (let x = 0; x < 320; x += 20) R(x, 146, 1, 34, '#6a4020');
      R(0, 146, 320, 2, '#ffd078');
      for (let x = 6; x < 320; x += 20) R(x, 150, 4, 2, ['#ff5db8', '#ffe14d', '#4dc8ff', '#5dff9a'][(x / 20) % 4 | 0]);
    }
    BG[idx] = cv;
    return cv;
  }

  window.Art = { THEMES, tile, item, heart, sign, bg, arrow: arrowCanvas, paint };
})();
