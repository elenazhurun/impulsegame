// Уровни собираются билдером (координаты в тайлах 16x16, 12 рядов, земля — ряд 9).
// Тайлы: # земля  w мокрый пол  = блок  - платформа-«доска» (проходима снизу)  B ломаемый блок (POWER)
//        F рассыпающийся  ^ шипы  D дверь  K кнопка  R пластинка (SPIN)  r мост  C чекпоинт  G выход
//        o ★ Dance Point  n ♪ нота  t ★ звезда-секрет  e ⚡ энергия
(function () {
  const H = 12, GY = 9;

  function builder(w) {
    const grid = [];
    for (let y = 0; y < H; y++) grid.push(new Array(w).fill(' '));
    const b = {
      w, grid, movers: [], signs: [],
      set(x, y, ch) { if (x >= 0 && x < w && y >= 0 && y < H) grid[y][x] = ch; },
      rect(x, y, ww, hh, ch) { for (let j = 0; j < hh; j++) for (let i = 0; i < ww; i++) b.set(x + i, y + j, ch); },
      ground(x0, x1, top) {
        for (let x = x0; x <= x1; x++) {
          b.set(x, GY, top || '#');
          for (let y = GY + 1; y < H; y++) b.set(x, y, '#');
        }
      },
      floorTiles(x0, x1, ch) { for (let x = x0; x <= x1; x++) b.set(x, GY, ch); },
      plat(x, y, len, ch) { for (let i = 0; i < len; i++) b.set(x + i, y, ch || '-'); },
      line(x, y, len, ch) { for (let i = 0; i < len; i++) b.set(x + i, y, ch || 'o'); },
      arc(x0, x1, y, h, ch) {
        for (let x = x0; x <= x1; x++) {
          const t = x1 === x0 ? 0 : (x - x0) / (x1 - x0);
          b.set(x, y - Math.round(4 * h * t * (1 - t)), ch || 'o');
        }
      },
      mover(x, w2, range, period, phase) { b.movers.push({ x, y: GY, w: w2, range, period, phase: phase || 0 }); },
      sign(x, lines) { b.signs.push({ x, y: GY - 1, lines }); },
    };
    return b;
  }

  const DEFS = [];

  // ---------------------------------------------------------------- LEVEL 1
  DEFS.push(() => {
    const b = builder(120);
    b.ground(0, 30); b.ground(34, 79); b.ground(85, 101); b.ground(108, 119);
    // подсказки
    b.sign(3, ['A/D OR ARROWS: MOVE', 'SPACE: JUMP']);
    b.sign(12, ['COLLECT * DANCE POINTS', 'KEYS 1-9: SWITCH DANCER']);
    b.sign(25, ['E: USE YOUR ABILITY', 'EVERY DANCER IS DIFFERENT!']);
    b.sign(41, ['SPIKES HURT!', 'JUMP OVER THEM']);
    b.sign(52, ['HIGH LEDGE? TRY 2 (JUMP)', 'OR 7 (DOUBLE JUMP)']);
    b.sign(60, ['WALL TOO HIGH?', '4 OKSANA: PRESS E TO SMASH']);
    b.sign(76, ['BIG GAP! 1 MASHA (SPEED)', 'HOLD E FOR SPRINT / 5 = DASH']);
    b.sign(98, ['MOVING PLATFORM!', 'STEP ON AND RIDE']);
    // земля и препятствия
    b.rect(16, 7, 2, 2, '=');
    b.set(44, 8, '^'); b.set(45, 8, '^');
    b.set(50, 8, 'C');
    b.plat(54, 6, 4, '-');
    b.rect(64, 5, 1, 4, 'B');
    b.mover(102, 3, 3, 6);
    b.set(116, 8, 'G');
    // предметы
    b.line(6, 8, 5); b.arc(12, 22, 8, 3); b.arc(29, 35, 7, 3);
    b.line(38, 8, 3); b.set(44, 6, 'n'); b.set(45, 6, 'n');
    b.set(55, 5, 't'); b.line(54, 5, 4, 'o'); b.set(60, 8, 'e');
    b.arc(66, 74, 8, 3); b.set(68, 8, 'n'); b.set(70, 8, 'n');
    b.arc(79, 85, 7, 3, 'n'); b.line(89, 8, 6); b.line(103, 6, 5);
    b.arc(109, 115, 8, 3);
    return { name: 'STUDIO START', theme: 0, time: 240, doorTime: 5.5, start: [2, 8], ...pack(b) };
  });

  // ---------------------------------------------------------------- LEVEL 2
  DEFS.push(() => {
    const b = builder(150);
    b.ground(0, 20); b.ground(21, 29, 'w'); b.ground(33, 40, 'w'); b.ground(41, 50); b.ground(71, 82);
    b.ground(95, 124); b.ground(132, 133, 'w'); b.ground(140, 149);
    // рассыпающиеся плитки
    for (const x of [52, 56, 60, 64, 68]) b.floorTiles(x, x + 1, 'F');
    // пластинка + мост
    b.set(80, 8, 'R'); b.floorTiles(83, 94, 'r');
    // шипы и обходной уступ
    b.rect(100, 8, 8, 1, '^'); b.plat(98, 6, 12, '-');
    // движущиеся платформы
    b.mover(125, 2, 3, 4.5); b.mover(134, 2, 3, 4);
    b.set(48, 8, 'C'); b.set(76, 8, 'C'); b.set(112, 8, 'C'); b.set(146, 8, 'G');
    b.sign(3, ['LEVEL 2: DANCE FLOOR', 'MORE TRAPS - SWITCH DANCERS!']);
    b.sign(18, ['WET FLOOR! YOU SLIDE', '8 NASTYA ZHURUN HAS GRIP']);
    b.sign(44, ['CRUMBLING FLOOR!', 'KEEP MOVING (1 = FAST)']);
    b.sign(77, ['SPIN THE VINYL: 3 KSYUSHA', 'PRESS E NEAR IT - BRIDGE!']);
    b.sign(96, ['SPIKE FIELD! 6 ILYA: E = SHIELD', 'OR 5 DASH / 2 HIGH LEDGE']);
    b.sign(122, ['MOVING PLATFORMS + WET ISLAND', '8 = STEADY HOVER (E)']);
    // секреты
    b.plat(12, 5, 3, '-'); b.set(13, 4, 't');
    b.line(3, 8, 3); b.arc(6, 16, 8, 3); b.arc(22, 28, 8, 3); b.arc(29, 33, 7, 3, 'n');
    b.line(34, 8, 6); b.set(46, 8, 'e'); b.line(41, 7, 3, 'o');
    for (const x of [52, 56, 60, 64, 68]) { b.set(x, 7, 'o'); b.set(x + 1, 7, 'o'); }
    b.line(72, 8, 4); b.arc(84, 94, 6, 2, 'n');
    b.line(99, 5, 10); b.set(104, 4, 't'); b.line(114, 8, 8); b.set(116, 8, 'e');
    b.line(126, 6, 4, 'o'); b.set(132, 7, 'n'); b.set(133, 7, 'n'); b.line(135, 6, 4, 'o');
    b.arc(141, 145, 8, 2); b.line(147, 8, 2);
    return { name: 'DANCE FLOOR', theme: 1, time: 300, doorTime: 5.5, start: [2, 8], ...pack(b) };
  });

  // ---------------------------------------------------------------- LEVEL 3
  DEFS.push(() => {
    const b = builder(185);
    b.ground(0, 32); b.ground(41, 69); b.ground(70, 73, 'w'); b.ground(76, 79, 'w'); b.ground(80, 84);
    b.ground(102, 140); b.ground(146, 147, 'w'); b.ground(153, 159); b.ground(165, 184);
    // ломаемая стена (POWER или DOUBLE JUMP)
    b.rect(15, 5, 1, 4, 'B');
    // пластинка + мост (SPIN) или DASH через 8 тайлов
    b.set(30, 8, 'R'); b.floorTiles(33, 40, 'r');
    // дверь по таймеру
    b.set(43, 8, 'K'); b.rect(66, 5, 1, 4, 'D');
    // рассыпающийся мост
    for (const x of [86, 90, 94, 98]) b.floorTiles(x, x + 1, 'F');
    // шипы + обходной уступ
    b.rect(113, 8, 8, 1, '^'); b.plat(111, 6, 12, '-');
    // высокая стена (только DOUBLE JUMP)
    b.rect(126, 5, 1, 4, '=');
    // движущиеся платформы
    b.mover(141, 2, 2, 3.6); b.mover(148, 2, 3, 3.4, 0.5);
    // большой разрыв + финальная стена
    b.rect(172, 5, 1, 4, 'B');
    b.set(46, 8, 'C'); b.set(104, 8, 'C'); b.set(155, 8, 'C'); b.set(180, 8, 'G');
    b.sign(3, ['LEVEL 3: IMPULSE CHALLENGE', 'USE THE WHOLE TEAM!']);
    b.sign(12, ['WALL: 4 OKSANA (POWER)', 'OR 7 DASHA (DOUBLE JUMP)']);
    b.sign(27, ['8-TILE GAP: 5 LINKO (DASH)', 'OR 3 KSYUSHA SPINS THE VINYL']);
    b.sign(41, ['STEP ON THE BUTTON!', 'THE DOOR OPENS FOR 5 SEC - RUN!']);
    b.sign(67, ['SLIPPERY! 8 ZHURUN HAS GRIP', 'MIND THE GAP']);
    b.sign(83, ['CRUMBLING BRIDGE', 'DO NOT STOP!']);
    b.sign(109, ['SPIKES! 6 ILYA (E SHIELD)', 'OR HIGH LEDGE 2 / 7']);
    b.sign(123, ['TALL WALL!', '7 DASHA: DOUBLE JUMP']);
    b.sign(139, ['LAST MOVING PLATFORMS', '8 = STEADY HOVER']);
    b.sign(157, ['5-TILE GAP: 1 SPRINT,', '7 DOUBLE JUMP OR 5 DASH']);
    // предметы
    b.line(3, 8, 6); b.arc(17, 29, 8, 3); b.set(35, 6, 'n'); b.arc(33, 40, 6, 2, 'o');
    b.line(44, 8, 2); b.line(47, 8, 18); b.set(58, 8, 'e'); b.line(68, 8, 1, 'n');
    b.line(71, 8, 3); b.set(77, 7, 'n'); b.line(80, 8, 4);
    for (const x of [86, 90, 94, 98]) { b.set(x, 7, 'o'); b.set(x + 1, 7, 'o'); }
    b.line(105, 8, 4); b.line(112, 5, 10, 'o'); b.set(117, 4, 't');
    b.arc(128, 138, 8, 3, 'n'); b.line(142, 6, 3); b.set(146, 7, 'n'); b.set(147, 7, 'n'); b.line(150, 6, 3);
    b.arc(154, 166, 6, 3); b.set(156, 8, 'e'); b.line(168, 8, 3); b.arc(174, 178, 8, 3);
    b.plat(36, 5, 3, '-'); b.set(37, 4, 't'); // секрет над мостом (нужен DOUBLE JUMP)
    return { name: 'IMPULSE CHALLENGE', theme: 2, time: 360, doorTime: 5.5, start: [2, 8], ...pack(b) };
  });

  function pack(b) {
    return { w: b.w, h: H, grid: b.grid, movers: b.movers, signs: b.signs };
  }

  // Свежая копия уровня (изменяемая: предметы собираются, блоки ломаются)
  window.Levels = {
    count: DEFS.length,
    H, GY,
    build(i) {
      const lv = DEFS[i]();
      lv.index = i;
      lv.grid = lv.grid.map((row) => row.slice());
      return lv;
    },
  };
})();
