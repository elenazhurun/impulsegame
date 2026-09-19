// Экраны: старт, выбор персонажа, интро уровня, итоги, game over, победа.
(function () {
  const W = 320, H = 180;
  const TXT = (g, s, x, y, c, o) => PixFont.drawText(g, s, x, y, c, o);
  const COLS = ['#ff5db8', '#ffe14d', '#4dc8ff', '#5dff9a', '#ff8a4d', '#c78bff'];

  function sprite(g, cv, x, y, scale, flip) {
    scale = scale || 1;
    if (flip) {
      g.save(); g.translate(x + cv.width * scale, y); g.scale(-1, 1);
      g.drawImage(cv, 0, 0, cv.width * scale, cv.height * scale);
      g.restore();
    } else g.drawImage(cv, x, y, cv.width * scale, cv.height * scale);
  }

  function checkerFloor(g, y, t) {
    for (let x = 0; x < W; x += 16) {
      for (let yy = y; yy < H; yy += 8) {
        const on = ((x >> 4) + ((yy - y) >> 3)) % 2 === 0;
        const lit = Math.floor(t * 3 + (x >> 4)) % 4 === 0;
        g.fillStyle = on ? (lit ? '#ff5db8' : '#3a1a6e') : (lit ? '#4dc8ff' : '#241048');
        g.fillRect(x, yy, 16, 8);
      }
    }
    g.fillStyle = '#ffe14d'; g.fillRect(0, y - 1, W, 1);
  }

  function team(g, y, t, scale, mode) {
    const n = 9, step = scale === 2 ? 34 : 18;
    const x0 = Math.round((W - (n - 1) * step - 16 * scale) / 2);
    for (let i = 0; i < n; i++) {
      const dance = Math.floor(t * 3 + i * 0.7) % 2;
      const pose = mode === 'win' ? 'ability' : (Math.floor(t * 0.7 + i) % 3 === 0 ? 'ability' : 'idle');
      const jump = mode === 'win' ? -Math.abs(Math.sin(t * 5 + i)) * 8 : 0;
      sprite(g, Chars.dancer(i, pose, dance), x0 + i * step, Math.round(y + jump), scale, false);
    }
  }

  function centerBox(g, x, y, w, h, fill, border) {
    g.fillStyle = border; g.fillRect(x - 1, y - 1, w + 2, h + 2);
    g.fillStyle = fill; g.fillRect(x, y, w, h);
  }

  const Screens = {
    start(g, t) {
      g.drawImage(Art.bg(3), 0, 0);
      g.fillStyle = 'rgba(10,0,30,0.35)'; g.fillRect(0, 0, W, H);
      // мигающие огни по краям
      for (let i = 0; i < 20; i++) {
        g.fillStyle = COLS[(i + Math.floor(t * 4)) % COLS.length];
        g.fillRect(4 + i * 16, 12 - 0, 4, 4);
        g.fillRect(4 + i * 16, 168, 4, 4);
      }
      const bob = Math.round(Math.sin(t * 3) * 2);
      TXT(g, 'STUDIO IMPULSE', W / 2, 26 + bob, '#ffe14d', { scale: 3, shadow: '#a01858', align: 'center' });
      TXT(g, 'DANCE BATTLE', W / 2, 52 + bob, '#4dc8ff', { scale: 3, shadow: '#1a3a8a', align: 'center' });
      TXT(g, '* 9 DANCERS * 4 STAGES *', W / 2, 80, '#ff8ad8', { align: 'center' });
      checkerFloor(g, 132, t);
      team(g, 88, t, 2, 'idle');
      const blink = Math.floor(t * 2.5) % 2 === 0;
      centerBox(g, 68, 148, 184, 16, 'rgba(0,0,0,0.7)', '#ffe14d');
      if (blink) TXT(g, 'PRESS ENTER TO START', W / 2, 153, '#ffffff', { align: 'center' });
      TXT(g, 'M: MUSIC  P: PAUSE', W / 2, 171, '#b8b8ff', { align: 'center' });
    },

    select(g, t, sel) {
      g.drawImage(Art.bg(1), 0, 0);
      g.fillStyle = 'rgba(8,0,24,0.55)'; g.fillRect(0, 0, W, H);
      TXT(g, 'STUDIO IMPULSE', W / 2, 3, '#ffe14d', { align: 'center' });
      TXT(g, 'DANCE BATTLE', W / 2, 12, '#4dc8ff', { align: 'center' });
      TXT(g, 'CHOOSE YOUR DANCER', W / 2, 21, '#ffffff', { align: 'center' });
      const cw = 104, ch = 44, x0 = 4, y0 = 31;
      for (let i = 0; i < 9; i++) {
        const c = Chars.list[i];
        const cx = x0 + (i % 3) * (cw + 1), cy = y0 + Math.floor(i / 3) * (ch + 1);
        const on = i === sel;
        g.fillStyle = on ? '#3a1a7a' : '#1a0c3a';
        g.fillRect(cx, cy, cw, ch);
        g.fillStyle = on ? (Math.floor(t * 6) % 2 ? '#ffe14d' : '#ff5db8') : '#4a3a8a';
        g.fillRect(cx, cy, cw, 1); g.fillRect(cx, cy + ch - 1, cw, 1); g.fillRect(cx, cy, 1, ch); g.fillRect(cx + cw - 1, cy, 1, ch);
        if (on) { g.fillRect(cx + 1, cy + 1, cw - 2, 1); g.fillRect(cx + 1, cy + ch - 2, cw - 2, 1); }
        const pose = on ? (Math.floor(t * 2) % 2 ? 'ability' : 'walk') : 'idle';
        const fr = Math.floor(t * (on ? 6 : 2));
        // подставка-«сцена» под спрайтом
        g.fillStyle = on ? c.abCol : '#4a3a8a';
        g.fillRect(cx + 4, cy + 34, 22, 3);
        sprite(g, Chars.dancer(i, pose, fr), cx + 7, cy + 9, 1, false);
        TXT(g, (i + 1) + '', cx + 4, cy + 3, '#ffe14d', { shadow: null });
        TXT(g, c.first, cx + 30, cy + 5, '#ffffff');
        TXT(g, c.last, cx + 30, cy + 14, '#ffffff');
        TXT(g, c.ability, cx + 30, cy + 25, c.abCol);
        TXT(g, c.desc, cx + 30, cy + 34, '#8a8ac8', { shadow: null });
      }
      TXT(g, 'ARROWS: MOVE  ENTER: START  OR PRESS 1-9', W / 2, 171, '#b8b8ff', { align: 'center' });
    },

    intro(g, t, info) {
      g.fillStyle = '#0a0018'; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 24; i++) {
        g.fillStyle = COLS[i % COLS.length];
        g.fillRect((i * 37 + Math.floor(t * 40)) % W, (i * 23) % H, 2, 2);
      }
      TXT(g, info.title, W / 2, 62, '#ffe14d', { scale: 3, shadow: '#a01858', align: 'center' });
      TXT(g, info.name, W / 2, 96, '#ffffff', { scale: 2, shadow: '#1a3a8a', align: 'center' });
      TXT(g, info.hint || '', W / 2, 124, '#b8b8ff', { align: 'center' });
      const c = Chars.list[info.ch];
      sprite(g, Chars.dancer(info.ch, 'walk', Math.floor(t * 8)), W / 2 - 16, 138, 2, false);
      TXT(g, c.hud, W / 2 + 22, 154, c.abCol, { align: 'left' });
    },

    clear(g, t, info) {
      g.drawImage(Art.bg(info.theme), 0, 0);
      g.fillStyle = 'rgba(8,0,24,0.6)'; g.fillRect(0, 0, W, H);
      TXT(g, '* LEVEL ' + info.level + ' CLEAR! *', W / 2, 24, '#ffe14d', { scale: 2, shadow: '#a01858', align: 'center' });
      TXT(g, info.name, W / 2, 46, '#4dc8ff', { align: 'center' });
      centerBox(g, 60, 62, 200, 56, 'rgba(0,0,0,0.6)', '#ff5db8');
      TXT(g, 'DANCE POINTS: ' + pad(info.points, 3), W / 2, 72, '#ffffff', { align: 'center' });
      TXT(g, 'COLLECTED: ' + info.collected, W / 2, 86, '#ffd93d', { align: 'center' });
      TXT(g, 'TIME LEFT: ' + Math.ceil(info.timeLeft), W / 2, 100, '#5dff9a', { align: 'center' });
      team(g, 126, t, 1, 'win');
      if (Math.floor(t * 2.5) % 2 === 0) TXT(g, 'PRESS ENTER', W / 2, 163, '#ffffff', { align: 'center' });
    },

    gameover(g, t, info) {
      g.fillStyle = '#100018'; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 30; i++) { g.fillStyle = '#2a1040'; g.fillRect((i * 53) % W, (i * 31 + Math.floor(t * 20)) % H, 3, 3); }
      TXT(g, 'GAME OVER', W / 2, 44, '#ff3a5a', { scale: 4, shadow: '#5a0018', align: 'center' });
      TXT(g, info.reason === 'TIME' ? 'TIME IS UP!' : 'OUT OF ENERGY!', W / 2, 84, '#ffffff', { align: 'center' });
      TXT(g, 'DANCE POINTS: ' + pad(info.points, 3), W / 2, 100, '#ffd93d', { align: 'center' });
      const sil = Chars.dancer(info.ch, 'idle', 0);
      sprite(g, sil, W / 2 - 16, 112, 2, false);
      if (Math.floor(t * 2.5) % 2 === 0) TXT(g, 'PRESS ENTER TO RETRY', W / 2, 166, '#5dff9a', { align: 'center' });
    },

    victory(g, t, info) {
      g.drawImage(Art.bg(3), 0, 0);
      g.fillStyle = 'rgba(20,0,40,0.4)'; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 60; i++) {
        const sp = 30 + (i % 5) * 14;
        const y = ((i * 53 + t * sp) % (H + 20)) - 10;
        const x = ((i * 31) % W) + Math.sin(t * 2 + i) * 8;
        g.fillStyle = COLS[i % COLS.length];
        g.fillRect(Math.round(x), Math.round(y), 3, 3);
      }
      const bob = Math.round(Math.sin(t * 4) * 2);
      TXT(g, '* PERFECT! *', W / 2, 8 + bob, '#ffe14d', { scale: 3, shadow: '#a01858', align: 'center' });
      TXT(g, 'STUDIO IMPULSE', W / 2, 36, '#ffffff', { scale: 2, shadow: '#1a3a8a', align: 'center' });
      TXT(g, 'DANCE BATTLE COMPLETE', W / 2, 54, '#4dc8ff', { align: 'center' });
      centerBox(g, 70, 68, 180, 34, 'rgba(0,0,0,0.65)', '#ff5db8');
      TXT(g, 'TEAM: 9 / 9', W / 2, 74, '#5dff9a', { align: 'center' });
      TXT(g, 'DANCE POINTS: ' + info.points, W / 2, 88, '#ffd93d', { align: 'center' });
      checkerFloor(g, 146, t);
      team(g, 106, t, 2, 'win');
      TXT(g, 'DANCE COMPLETE!', W / 2, 118 - 0, '#ff8ad8', { align: 'center', shadow: null });
      if (Math.floor(t * 2.5) % 2 === 0) TXT(g, 'PRESS ENTER TO PLAY AGAIN', W / 2, 165, '#ffffff', { align: 'center' });
    },
  };

  function pad(n, len) {
    let s = String(n);
    while (s.length < len) s = '0' + s;
    return s;
  }

  Screens.sprite = sprite;
  Screens.pad = pad;
  Screens.team = team;
  window.Screens = Screens;
})();
