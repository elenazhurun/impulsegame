// FINAL DANCE BATTLE: ритм-игра со стрелками. Оксана Гатальская — финальное испытание команды (не злодейка!).
(function () {
  const W = 320, H = 180;
  const HIT_Y = 146, TOP_Y = 30;
  const LANE_X = [186, 216, 246, 276];
  const LANE_COL = ['#ff5db8', '#4dc8ff', '#5dff9a', '#ffe14d'];
  const DIRS = { L: 0, D: 1, U: 2, R: 3 };
  const ROUNDS = [
    { name: 'WARM UP', speed: 75, gap: 0.78, pat: 'LRUDLRUDLURD' },
    { name: 'GROOVE', speed: 90, gap: 0.64, pat: 'UDLRRLUDDULRLURDUL' },
    { name: 'HIP-HOP', speed: 105, gap: 0.54, pat: 'LLRRUDUDLRDULRUDRLDU' },
    { name: 'FINAL BEAT', speed: 120, gap: 0.47, pat: 'LURDLURDDLUURRDDLRUDLRDU' },
  ];
  const MAX_MISSES = 5;
  const TXT = (g, s, x, y, c, o) => PixFont.drawText(g, s, x, y, c, o);

  const B = {
    phase: 'intro', pt: 0, round: 0, points: 0, done: false,
    arrows: [], t: 0, misses: 0, combo: 0, best: 0, meter: 0, ultLeft: 0, flash: 0,
    perfects: 0, goods: 0, popups: [], press: [0, 0, 0, 0], joined: 0, msg: '',

    init(points) {
      this.phase = 'intro'; this.pt = 0; this.round = 0; this.points = points; this.done = false;
      this.joined = 0; this.meter = 0; this.ultLeft = 0; this.perfects = 0; this.goods = 0;
      this.popups = []; this.combo = 0; this.best = 0;
      Sound.music('battle');
    },

    startRound() {
      const r = ROUNDS[this.round];
      this.arrows = [];
      for (let i = 0; i < r.pat.length; i++) {
        this.arrows.push({ lane: DIRS[r.pat[i]], tHit: 1.4 + i * r.gap, done: false, y: 0 });
      }
      this.endT = 1.4 + (r.pat.length - 1) * r.gap + 1.2;
      this.t = 0; this.misses = 0; this.combo = 0; this.ultLeft = 0;
      this.phase = 'play';
    },

    setPhase(p) { this.phase = p; this.pt = 0; },

    pop(text, lane, col) {
      this.popups.push({ text, x: LANE_X[lane], y: HIT_Y - 22, t: 0, col });
    },

    judge(lane) {
      const r = ROUNDS[this.round];
      let best = null, bd = 1e9;
      for (const a of this.arrows) {
        if (a.done || a.lane !== lane) continue;
        const d = Math.abs(a.y - HIT_Y);
        if (d < bd) { bd = d; best = a; }
      }
      if (best && bd <= 20) {
        best.done = true;
        if (bd <= 8) this.hit(best, true); else this.hit(best, false);
      } else {
        this.combo = 0;
        Sound.play('miss');
      }
      void r;
    },

    hit(a, perfect) {
      this.combo++;
      if (this.combo > this.best) this.best = this.combo;
      if (perfect) {
        this.points += 3; this.perfects++; this.meter = Math.min(6, this.meter + 1);
        this.pop('PERFECT!', a.lane, '#ffe14d'); Sound.play('perfect');
      } else {
        this.points += 1; this.goods++;
        this.pop('GOOD', a.lane, '#5dff9a'); Sound.play('good');
      }
    },

    key(code) {
      if (this.phase === 'play') {
        const map = { ArrowLeft: 0, KeyA: 0, ArrowDown: 1, KeyS: 1, ArrowUp: 2, KeyW: 2, ArrowRight: 3, KeyD: 3 };
        if (code in map) { this.press[map[code]] = 0.15; this.judge(map[code]); }
        else if (code === 'Space' && this.meter >= 6 && this.ultLeft === 0) {
          this.ultLeft = 5; this.meter = 0; this.flash = 0.5; Sound.play('ultimate');
        }
      }
    },

    update(dt) {
      this.pt += dt;
      for (let i = 0; i < 4; i++) if (this.press[i] > 0) this.press[i] -= dt;
      if (this.flash > 0) this.flash -= dt;
      for (let i = this.popups.length - 1; i >= 0; i--) { this.popups[i].t += dt; if (this.popups[i].t > 0.6) this.popups.splice(i, 1); }

      if (this.phase === 'intro') {
        if (this.pt > 3.2) { this.round = 0; this.joined = 2; this.setPhase('rintro'); }
      } else if (this.phase === 'rintro') {
        if (this.pt > 1.8) this.startRound();
      } else if (this.phase === 'play') {
        this.t += dt;
        const r = ROUNDS[this.round];
        for (const a of this.arrows) {
          a.y = HIT_Y - r.speed * (a.tHit - this.t);
          if (a.done) continue;
          if (this.ultLeft > 0 && a.y >= HIT_Y - 1) {
            a.done = true; this.ultLeft--; this.hit(a, true);
          } else if (a.y > HIT_Y + 20) {
            a.done = true; this.misses++; this.combo = 0;
            this.pop('MISS', a.lane, '#ff3a5a'); Sound.play('miss');
          }
        }
        if (this.t > this.endT || this.arrows.every((a) => a.done)) {
          if (this.misses <= MAX_MISSES) {
            this.points += 10;
            this.msg = this.round === ROUNDS.length - 1 ? 'PERFECT!' : 'ROUND CLEAR!';
            Sound.play('clear');
            this.setPhase('rend');
          } else {
            this.msg = 'TRY AGAIN!';
            Sound.play('gameover');
            this.setPhase('rfail');
          }
        }
      } else if (this.phase === 'rend') {
        if (this.pt > 2.0) {
          if (this.round >= ROUNDS.length - 1) { this.joined = 8; this.done = true; }
          else { this.round++; this.joined = Math.min(8, 2 + this.round * 2); this.setPhase('rintro'); }
        }
      } else if (this.phase === 'rfail') {
        if (this.pt > 1.8) this.setPhase('rintro');
      }
    },

    // ---------- рендер ----------
    draw(g) {
      g.drawImage(Art.bg(3), 0, 0);
      const bt = performance.now() / 1000;
      TXT(g, 'IMPULSE', 68, 33, '#ffe14d', { scale: 2, shadow: '#a01858', align: 'center' });
      // прожектор на Оксану
      g.fillStyle = 'rgba(255,240,180,0.13)';
      for (let y = 20; y < 150; y += 2) { const w = 30 + y * 0.45; g.fillRect(Math.round(68 - w / 2), y, Math.round(w), 2); }
      // Оксана Гатальская — финальное испытание, 3x
      const beat = Math.floor(bt * 3) % 2;
      const pose = this.ultLeft > 0 || this.phase === 'rend' ? 'ability' : (beat ? 'ability' : 'idle');
      Screens.sprite(g, Chars.dancer(8, pose, beat), 44, 56 - (beat ? 2 : 0), 3, false);
      TXT(g, 'ОКСАНА ГАТАЛЬСКАЯ', 68, 130, '#ffffff', { align: 'center' });
      // команда: 8 танцоров (ещё не присоединившиеся — силуэты)
      TXT(g, 'TEAM ' + (this.joined + 1) + '/9', 6, 141, '#5dff9a');
      for (let i = 0; i < 8; i++) {
        const lit = i < this.joined;
        const cv = lit ? Chars.dancer(i, Math.floor(bt * 3 + i) % 2 ? 'ability' : 'idle', Math.floor(bt * 3 + i)) : Chars.silhouette(i);
        Screens.sprite(g, cv, 6 + i * 19, 153 - (lit && Math.floor(bt * 3 + i) % 2 ? 3 : 0), 1, false);
      }
      // дорожки
      g.fillStyle = 'rgba(8,0,24,0.7)'; g.fillRect(LANE_X[0] - 17, TOP_Y - 4, 4 * 30 + 4, HIT_Y - TOP_Y + 26);
      g.fillStyle = '#ffffff'; g.fillRect(LANE_X[0] - 17, TOP_Y - 4, 1, HIT_Y - TOP_Y + 26); g.fillRect(LANE_X[3] + 17, TOP_Y - 4, 1, HIT_Y - TOP_Y + 26);
      for (let i = 0; i < 4; i++) {
        const pressed = this.press[i] > 0;
        g.fillStyle = pressed ? LANE_COL[i] : 'rgba(255,255,255,0.06)';
        if (pressed) g.globalAlpha = 0.35;
        g.fillRect(LANE_X[i] - 14, TOP_Y - 4, 28, HIT_Y - TOP_Y + 26);
        g.globalAlpha = 1;
        g.drawImage(Art.arrow(i === 0 ? 0 : i === 1 ? 1 : i === 2 ? 2 : 3, pressed ? '#ffffff' : '#5a4a8a', '#1a0c3a'), LANE_X[i] - 7, HIT_Y - 7);
      }
      g.fillStyle = '#ffe14d'; g.fillRect(LANE_X[0] - 17, HIT_Y + 10, 4 * 30 + 4, 1);
      // стрелки
      if (this.phase === 'play' || this.phase === 'rend' || this.phase === 'rfail') {
        for (const a of this.arrows) {
          if (a.done || a.y < TOP_Y || a.y > H) continue;
          g.drawImage(Art.arrow(a.lane, LANE_COL[a.lane], '#ffffff'), LANE_X[a.lane] - 7, Math.round(a.y) - 7);
        }
      }
      // попапы
      for (const p of this.popups) {
        TXT(g, p.text, p.x, Math.round(p.y - p.t * 20), p.col, { align: 'center' });
      }
      // HUD
      g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(0, 0, W, 26);
      g.fillStyle = '#ff5db8'; g.fillRect(0, 26, W, 1);
      TXT(g, 'FINAL DANCE BATTLE', 6, 3, '#ffe14d');
      TXT(g, 'ROUND ' + (this.round + 1) + '/' + ROUNDS.length + ': ' + ROUNDS[this.round].name, 6, 12, '#4dc8ff');
      TXT(g, 'DANCE POINTS: ' + Screens.pad(this.points, 3), 6, 21 - 0, '#ffffff', { shadow: null });
      TXT(g, 'TEAM: 9/9', W - 4, 3, '#5dff9a', { align: 'right' });
      TXT(g, 'COMBO: ' + this.combo, W - 4, 12, '#ffffff', { align: 'right' });
      TXT(g, 'MISSES: ' + this.misses + '/' + MAX_MISSES, W - 4, 21, this.misses > 3 ? '#ff3a5a' : '#b8b8ff', { align: 'right', shadow: null });
      // шкала ULTIMATE
      const mx = 150, my = 3;
      g.fillStyle = '#2a1040'; g.fillRect(mx, my, 60, 8);
      g.fillStyle = this.meter >= 6 ? (Math.floor(bt * 6) % 2 ? '#ffe14d' : '#ff5d7a') : '#ff5d7a';
      g.fillRect(mx, my, Math.round(60 * this.meter / 6), 8);
      g.fillStyle = '#ffffff'; g.fillRect(mx - 1, my - 1, 62, 1); g.fillRect(mx - 1, my + 8, 62, 1);
      TXT(g, this.ultLeft > 0 ? 'ULTIMATE!' : this.meter >= 6 ? 'PRESS SPACE!' : 'ULTIMATE', mx + 30, my + 11, this.meter >= 6 ? '#ffe14d' : '#8a8ac8', { align: 'center', shadow: null });

      // оверлеи фаз
      const box = (lines, col) => {
        let h = 10;
        for (const l of lines) h += 7 * (l[2] || 1) + 5;
        const y0 = Math.round(96 - h / 2), x0 = 20, bw = 280;
        g.fillStyle = 'rgba(0,0,0,0.82)'; g.fillRect(x0, y0, bw, h);
        g.fillStyle = col || '#ffe14d';
        g.fillRect(x0, y0, bw, 1); g.fillRect(x0, y0 + h - 1, bw, 1); g.fillRect(x0, y0, 1, h); g.fillRect(x0 + bw - 1, y0, 1, h);
        let y = y0 + 7;
        for (const l of lines) { TXT(g, l[0], W / 2, y, l[1], { align: 'center', scale: l[2] || 1 }); y += 7 * (l[2] || 1) + 5; }
      };
      if (this.phase === 'intro') {
        box([['FINAL DANCE BATTLE', '#ffe14d', 2], ['OKSANA GATALSKAYA', '#ff8ad8'], ['CHALLENGES THE WHOLE TEAM!', '#ffffff'], ['PRESS THE ARROWS IN RHYTHM', '#4dc8ff'], ['4 ROUNDS - ALL 9 DANCE!', '#5dff9a']]);
      } else if (this.phase === 'rintro') {
        const nm = (i) => Chars.list[i].first + ' ' + Chars.list[i].last;
        const who = this.joined >= 2 ? [nm(this.joined - 2), nm(this.joined - 1)] : ['', ''];
        box([['ROUND ' + (this.round + 1) + ': ' + ROUNDS[this.round].name, '#ffe14d', 2], ['GET READY!', '#ffffff'], ['NOW JOINING THE DANCE:', '#b8b8ff'], [who[0], '#5dff9a'], [who[1], '#5dff9a']]);
      } else if (this.phase === 'rend') {
        box([[this.msg, '#ffe14d', 3], ['STUDIO IMPULSE DANCE COMPLETE', '#ffffff'], ['9 / 9', '#5dff9a', 2]], '#5dff9a');
      } else if (this.phase === 'rfail') {
        box([[this.msg, '#ff3a5a', 2], ['TOO MANY MISSES', '#ffffff'], ['THE TEAM TRIES THE ROUND AGAIN', '#b8b8ff']], '#ff3a5a');
      }
      if (this.flash > 0) { g.fillStyle = 'rgba(255,255,255,' + (this.flash * 1.2).toFixed(2) + ')'; g.fillRect(0, 0, W, H); }
    },
  };

  window.Battle = B;
})();
