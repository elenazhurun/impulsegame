// STUDIO IMPULSE DANCE BATTLE — главный цикл, ввод, состояния игры, рендер уровня и HUD.
(function () {
  const W = 320, H = 180, T = 16;
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const TXT = (s, x, y, c, o) => PixFont.drawText(ctx, s, x, y, c, o);

  const LEVEL_HINTS = [
    'TIP: KEYS 1-9 SWITCH DANCERS',
    'TIP: EVERY TRAP NEEDS A DIFFERENT DANCER',
    'TIP: USE THE WHOLE TEAM TO FINISH!',
  ];

  const G = {
    state: 'start', t: 0, stateT: 0, sel: 0, ch: 0, level: 0,
    points: 0, levelStartPoints: 0, world: null, cam: { x: 0, y: 0 },
    keys: {}, toast: null, shake: 0, paused: false, info: null,
  };
  window.__G = G; // для отладки

  function setState(s) { G.state = s; G.stateT = 0; }

  // ---------- масштабирование без сглаживания ----------
  function resize() {
    const s = Math.min((window.innerWidth - 40) / W, (window.innerHeight - 70) / H);
    const sc = s >= 2 ? Math.floor(s) : Math.max(0.5, s);
    canvas.style.width = Math.floor(W * sc) + 'px';
    canvas.style.height = Math.floor(H * sc) + 'px';
  }
  window.addEventListener('resize', resize);
  resize();

  // ---------- управление игрой ----------
  function startLevel(i) {
    G.level = i;
    G.levelStartPoints = G.points;
    G.world = new World(i, G.ch, G.points, 5);
    G.cam.x = 0; G.cam.y = 0;
    updateCam(1, true);
    G.toast = null; G.paused = false;
    const lv = G.world.lv;
    G.info = { title: 'LEVEL ' + (i + 1), name: lv.name, hint: LEVEL_HINTS[i], ch: G.ch };
    setState('intro');
    Sound.music('game');
  }

  function startBattle() {
    Battle.init(G.points);
    setState('battle');
    Sound.play('start');
  }

  function beginGame() {
    G.ch = G.sel;
    G.points = 0;
    Sound.play('start');
    startLevel(0);
  }

  function switchChar(n) {
    const w = G.world;
    if (!w || w.won || w.dead) return;
    const p = w.p;
    if (n === p.ch) return;
    p.ch = n; G.ch = n;
    p.sprintT = p.dashT = p.spinT = p.punchT = p.hoverT = 0;
    p.animT = 0.35;
    const c = Chars.list[n];
    w.puff(p.x + 5, p.y + 10, c.abCol, 14);
    Sound.play('switch');
    G.toast = { text: c.hud, sub: 'ABILITY: ' + c.ability, col: c.abCol, t: 1.6 };
  }

  function onPress(c) {
    if (c === 'KeyM') {
      const m = Sound.toggleMute();
      G.toast = { text: m ? 'SOUND OFF' : 'SOUND ON', sub: '', col: '#ffffff', t: 1 };
      return;
    }
    const digit = /^(Digit|Numpad)([1-9])$/.exec(c);
    const d = digit ? parseInt(digit[2], 10) - 1 : -1;
    const enter = c === 'Enter' || c === 'NumpadEnter';
    switch (G.state) {
      case 'start':
        if (enter || c === 'Space') { Sound.play('select'); setState('select'); Sound.music('menu'); }
        break;
      case 'select':
        if (c === 'ArrowLeft' || c === 'KeyA') { G.sel = (G.sel + 8) % 9; Sound.play('select'); }
        else if (c === 'ArrowRight' || c === 'KeyD') { G.sel = (G.sel + 1) % 9; Sound.play('select'); }
        else if (c === 'ArrowUp' || c === 'KeyW') { G.sel = (G.sel + 6) % 9; Sound.play('select'); }
        else if (c === 'ArrowDown' || c === 'KeyS') { G.sel = (G.sel + 3) % 9; Sound.play('select'); }
        else if (d >= 0) { G.sel = d; Sound.play('select'); }
        else if (enter || c === 'Space') beginGame();
        break;
      case 'intro':
        if (enter || c === 'Space') setState('play');
        break;
      case 'play':
        if (c === 'KeyP' || c === 'Escape') { G.paused = !G.paused; break; }
        if (G.paused) { if (enter) G.paused = false; break; }
        if (c === 'Space' || c === 'ArrowUp' || c === 'KeyW') G.world.inp.jumpPressed = true;
        else if (c === 'KeyE' || c === 'ShiftLeft' || c === 'ShiftRight' || c === 'KeyK') G.world.inp.abilityPressed = true;
        else if (d >= 0) switchChar(d);
        else if (c === 'KeyR') { G.points = G.levelStartPoints; startLevel(G.level); }
        break;
      case 'clear':
        if (enter || c === 'Space') {
          if (G.level + 1 >= Levels.count) startBattle(); else startLevel(G.level + 1);
        }
        break;
      case 'gameover':
        if (enter || c === 'Space') { G.points = G.levelStartPoints; startLevel(G.level); }
        break;
      case 'battle':
        Battle.key(c);
        break;
      case 'victory':
        if (enter || c === 'Space') { Sound.play('select'); setState('select'); Sound.music('menu'); }
        break;
    }
  }

  const PREVENT = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Tab'];
  window.addEventListener('keydown', (e) => {
    if (PREVENT.indexOf(e.code) >= 0) e.preventDefault();
    Sound.init();
    const was = G.keys[e.code];
    G.keys[e.code] = true;
    if (e.repeat || was) return;
    onPress(e.code);
  });
  window.addEventListener('keyup', (e) => { G.keys[e.code] = false; });
  window.addEventListener('blur', () => { G.keys = {}; if (G.state === 'play') G.paused = true; });

  // ---------- камера ----------
  function updateCam(dt, snap) {
    const w = G.world, p = w.p;
    const tx = Math.max(0, Math.min(w.W - W, p.x + 5 - W / 2 + p.face * 24));
    const ty = Math.max(0, Math.min(w.H - H, p.y + 10 - 108));
    const k = snap ? 1 : Math.min(1, dt * 6);
    G.cam.x += (tx - G.cam.x) * k;
    G.cam.y += (ty - G.cam.y) * k;
  }

  // ---------- обновление ----------
  function update(dt) {
    G.t += dt; G.stateT += dt;
    if (G.toast) { G.toast.t -= dt; if (G.toast.t <= 0) G.toast = null; }
    if (G.shake > 0) G.shake -= dt;

    if (G.state === 'intro' && G.stateT > 2.4) setState('play');

    if (G.state === 'play' && !G.paused) {
      const w = G.world, k = G.keys;
      w.inp.left = !!(k.KeyA || k.ArrowLeft);
      w.inp.right = !!(k.KeyD || k.ArrowRight);
      w.inp.jumpHeld = !!(k.Space || k.ArrowUp || k.KeyW);
      w.update(dt);
      for (const e of w.events) {
        if (e === 'bridge') { Sound.play('checkpoint'); G.toast = { text: 'BRIDGE APPEARS!', sub: '', col: '#5dff9a', t: 1.4 }; }
        else if (e === 'checkpoint') { Sound.play('checkpoint'); G.toast = { text: 'CHECKPOINT! +1 ENERGY', sub: '', col: '#ffe14d', t: 1.4 }; }
        else if (e === 'hurt' || e === 'fall') { Sound.play(e); G.shake = 0.25; }
        else if (e !== 'goal') Sound.play(e);
      }
      w.events.length = 0;
      updateCam(dt, false);
      if (w.won) {
        G.points = w.points;
        G.info = { level: G.level + 1, name: w.lv.name, points: w.points, collected: w.collected, timeLeft: w.timeLeft, theme: w.theme };
        Sound.play('clear');
        setState('clear');
      } else if (w.dead) {
        G.info = { reason: w.deadReason, points: w.points, ch: G.ch };
        Sound.play('gameover'); Sound.music(false);
        setState('gameover');
      }
    }

    if (G.state === 'battle') {
      Battle.update(dt);
      if (Battle.done) {
        G.points = Battle.points;
        G.info = { points: G.points };
        Sound.music(false);
        Sound.play('victory');
        setState('victory');
      }
    }
  }

  // ---------- рендер уровня ----------
  function drawWorld() {
    const w = G.world, p = w.p, th = w.theme;
    let cx = Math.round(G.cam.x), cy = Math.round(G.cam.y);
    if (G.shake > 0) { cx += Math.round((Math.random() - 0.5) * 4); cy += Math.round((Math.random() - 0.5) * 4); }

    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const bg = Art.bg(th);
    const ox = -Math.floor((G.cam.x * 0.25) % W), oy = -Math.floor(G.cam.y * 0.5);
    ctx.drawImage(bg, ox, oy); ctx.drawImage(bg, ox + W, oy);

    const tx0 = Math.max(0, Math.floor(cx / T)), tx1 = Math.min(w.gw - 1, Math.floor((cx + W) / T));
    const frame = Math.floor(G.t * 4);
    const SOLIDS = '#w=BF';
    for (let ty = 0; ty < w.gh; ty++) {
      for (let tx = tx0; tx <= tx1; tx++) {
        const ch = w.grid[ty][tx];
        if (ch === ' ') continue;
        const sx = tx * T - cx, sy = ty * T - cy;
        switch (ch) {
          case '#': case 'w':
            ctx.drawImage(Art.tile(ch, th, { top: SOLIDS.indexOf(w.tileAt(tx, ty - 1)) < 0 }), sx, sy); break;
          case '=': case '-': case 'B': case '^':
            ctx.drawImage(Art.tile(ch, th, {}), sx, sy); break;
          case 'F': {
            const c = w.crumble[tx + ',' + ty];
            if (c && c.state === 'gone') break;
            const shake = c && c.state === 'stand' ? (Math.floor(G.t * 40) % 2 ? 1 : -1) : 0;
            ctx.drawImage(Art.tile('F', th, {}), sx + shake, sy);
            break;
          }
          case 'D':
            if (w.doorT <= 0) ctx.drawImage(Art.tile('D', th, {}), sx, sy);
            else {
              ctx.fillStyle = '#ffdc4d';
              if (w.doorT > 1.5 || Math.floor(G.t * 10) % 2) { ctx.fillRect(sx, sy, 1, T); ctx.fillRect(sx + T - 1, sy, 1, T); }
            }
            break;
          case 'K': ctx.drawImage(Art.tile('K', th, { active: w.doorT > 0 }), sx, sy); break;
          case 'R': ctx.drawImage(Art.tile('R', th, { frame: w.bridgeOn ? Math.floor(G.t * 10) : Math.floor(G.t * 2), active: w.bridgeOn }), sx, sy); break;
          case 'r': ctx.drawImage(Art.tile('r', th, { active: w.bridgeOn }), sx, sy); break;
          case 'C': ctx.drawImage(Art.tile('C', th, { active: w.visited.has(tx + ',' + ty) }), sx, sy); break;
          case 'G': ctx.drawImage(Art.tile('G', th, { frame }), sx, sy - T); break;
          case 'o': case 'n': case 'e': case 't': {
            const img = Art.item(ch, ch === 't' && Math.floor(G.t * 6) % 2);
            const bob = Math.round(Math.sin(G.t * 5 + tx * 0.7) * 1.5);
            ctx.drawImage(img, sx + 8 - (img.width >> 1), sy + 8 - (img.height >> 1) + bob);
            break;
          }
        }
      }
    }
    // знаки-подсказки
    for (const s of w.lv.signs) {
      const sx = s.x * T - cx;
      if (sx > -T && sx < W) ctx.drawImage(Art.sign(), sx, s.y * T - cy);
    }
    // движущиеся платформы
    for (const m of w.movers) {
      for (let i = 0; i < m.w / T; i++) ctx.drawImage(Art.tile('-', th, {}), Math.round(m.px) + i * T - cx, m.py - cy);
    }
    // игрок
    const pose = w.pose();
    const fr = pose === 'walk' ? Math.floor(w.t * 10) : pose === 'idle' ? Math.floor(w.t * 2) : Math.floor(w.t * 10);
    const blink = p.inv > 0 && Math.floor(w.t * 20) % 2 === 0;
    const px = Math.round(p.x) - cx, py = Math.round(p.y) - cy;
    if (!blink) Screens.sprite(ctx, Chars.dancer(p.ch, pose, fr), px - 3, py - 4, 1, p.face < 0);
    // эффекты способностей
    if (p.shieldT > 0 || p.ultT > 0) {
      const col = p.ultT > 0 ? ['#ff5d7a', '#ffe14d', '#4dd8ff', '#5dff9a'][Math.floor(G.t * 12) % 4] : '#b8b8ff';
      ctx.fillStyle = col;
      for (let a = 0; a < 20; a++) {
        const ang = (a / 20) * Math.PI * 2 + G.t * 3;
        ctx.fillRect(Math.round(px + 5 + Math.cos(ang) * 13), Math.round(py + 10 + Math.sin(ang) * 16), 2, 2);
      }
    }
    if (p.spinT > 0) {
      ctx.fillStyle = '#ff7ad9';
      for (let a = 0; a < 4; a++) {
        const ang = a * Math.PI / 2 + G.t * 16;
        ctx.fillRect(Math.round(px + 5 + Math.cos(ang) * 12), Math.round(py + 10 + Math.sin(ang) * 8), 2, 2);
      }
    }
    // частицы
    for (const q of w.particles) {
      ctx.globalAlpha = Math.max(0, Math.min(1, q.life / q.max * 1.5));
      ctx.fillStyle = q.col;
      ctx.fillRect(Math.round(q.x - cx), Math.round(q.y - cy), q.size, q.size);
    }
    ctx.globalAlpha = 1;

    // подсказка у знака
    for (const s of w.lv.signs) {
      const dx = Math.abs(s.x * T + 8 - (p.x + 5));
      if (dx < 52) {
        const wd = Math.max(...s.lines.map((l) => l.length)) * 6 + 10, hh = s.lines.length * 9 + 6;
        let bx = Math.round(s.x * T + 8 - cx - wd / 2);
        bx = Math.max(2, Math.min(W - wd - 2, bx));
        const by = Math.max(34, Math.round(s.y * T - cy - hh - 26));
        ctx.fillStyle = '#000'; ctx.fillRect(bx - 1, by - 1, wd + 2, hh + 2);
        ctx.fillStyle = '#26104a'; ctx.fillRect(bx, by, wd, hh);
        ctx.fillStyle = '#ffe14d'; ctx.fillRect(bx, by, wd, 1);
        s.lines.forEach((l, i) => TXT(l, bx + 5, by + 4 + i * 9, i === 0 ? '#ffe14d' : '#ffffff'));
        break;
      }
    }
  }

  function drawHud() {
    const w = G.world, p = w.p, c = Chars.list[p.ch];
    ctx.fillStyle = 'rgba(10,0,30,0.85)'; ctx.fillRect(0, 0, W, 29);
    ctx.fillStyle = '#ff5db8'; ctx.fillRect(0, 29, W, 1);
    ctx.fillStyle = c.abCol; ctx.fillRect(1, 2, 20, 26);
    ctx.fillStyle = '#1a0c3a'; ctx.fillRect(2, 3, 18, 24);
    ctx.drawImage(Chars.dancer(p.ch, 'idle', Math.floor(G.t * 2)), 3, 3);
    TXT('STUDIO IMPULSE', 25, 3, '#ffe14d');
    TXT('CHARACTER: ', 116, 3, '#b8b8ff');
    TXT(c.hud, 116 + 66, 3, '#ffffff');
    TXT('ABILITY: ' + c.ability, 25, 12, c.abCol);
    TXT('DANCE POINTS: ' + Screens.pad(w.points, 3), 160, 12, '#ffd93d');
    for (let i = 0; i < w.hpMax; i++) ctx.drawImage(Art.heart(i < w.hp), 25 + i * 9, 21);
    TXT('TEAM: 9/9', 74, 21, '#5dff9a');
    TXT('TIME ' + Math.ceil(w.timeLeft), 132, 21, w.timeLeft < 30 ? '#ff3a5a' : '#ffffff');
    const st = w.abilityState();
    const es = st === 0 ? 'E: READY' : st === 'ACTIVE' ? 'E: ACTIVE' : 'E: ' + st.toFixed(1) + 'S';
    TXT(es, 190, 21, st === 0 ? '#5dff9a' : st === 'ACTIVE' ? '#ffe14d' : '#8a8ac8');
    TXT('LEVEL ' + (G.level + 1), W - 3, 21, '#4dc8ff', { align: 'right' });
    // мини-панель команды: 9 иконок (текущий подсвечен)
    for (let i = 0; i < 9; i++) {
      const x = 258 + (i % 9) * 6;
      ctx.fillStyle = i === p.ch ? '#ffffff' : Chars.list[i].abCol;
      ctx.fillRect(x, i === p.ch ? 30 : 31, 4, i === p.ch ? 3 : 2);
    }
  }

  function drawToast() {
    if (!G.toast) return;
    const t = G.toast;
    const w = Math.max(t.text.length, t.sub.length) * 6 + 12, h = t.sub ? 24 : 15;
    const x = Math.round((W - w) / 2), y = 36;
    ctx.fillStyle = '#000'; ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
    ctx.fillStyle = '#26104a'; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = t.col; ctx.fillRect(x, y, w, 1);
    TXT(t.text, W / 2, y + 4, '#ffffff', { align: 'center' });
    if (t.sub) TXT(t.sub, W / 2, y + 14, t.col, { align: 'center' });
  }

  function drawPause() {
    ctx.fillStyle = 'rgba(0,0,20,0.75)'; ctx.fillRect(0, 0, W, H);
    TXT('PAUSED', W / 2, 40, '#ffe14d', { scale: 3, shadow: '#a01858', align: 'center' });
    const L = ['A/D OR ARROWS - MOVE', 'SPACE - JUMP', 'E - ABILITY', '1-9 - SWITCH DANCER', 'R - RESTART LEVEL', 'M - SOUND', 'P - RESUME'];
    L.forEach((l, i) => TXT(l, W / 2, 80 + i * 12, '#ffffff', { align: 'center' }));
  }

  function render() {
    ctx.imageSmoothingEnabled = false;
    switch (G.state) {
      case 'start': Screens.start(ctx, G.t); break;
      case 'select': Screens.select(ctx, G.t, G.sel); break;
      case 'intro': Screens.intro(ctx, G.stateT, G.info); break;
      case 'play':
        drawWorld(); drawHud(); drawToast();
        if (G.paused) drawPause();
        break;
      case 'clear': Screens.clear(ctx, G.stateT, G.info); break;
      case 'gameover': Screens.gameover(ctx, G.stateT, G.info); break;
      case 'battle': Battle.draw(ctx); break;
      case 'victory': Screens.victory(ctx, G.stateT, G.info); break;
    }
    if (G.toast && G.state !== 'play') drawToast();
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    try { update(dt); render(); } catch (err) { console.error(err); }
    requestAnimationFrame(frame);
  }

  // Отладка: ?level=2&ch=3 — сразу в уровень, ?state=battle — сразу в финал
  const q = new URLSearchParams(location.search);
  if (q.has('level')) { G.ch = parseInt(q.get('ch') || '0', 10) % 9; startLevel(parseInt(q.get('level'), 10) % Levels.count); setState('play'); }
  else if (q.get('state') === 'battle') { G.points = 100; startBattle(); }
  else if (q.get('state') === 'select') { setState('select'); }
  else if (q.get('state') === 'victory') { G.info = { points: 321 }; setState('victory'); }

  requestAnimationFrame(frame);
})();
