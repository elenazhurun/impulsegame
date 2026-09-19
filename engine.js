// Ядро платформера: физика, столкновения, способности 9 персонажей, ловушки, предметы.
// Не зависит от DOM — рендер и ввод живут в main.js.
(function () {
  const T = 16, PW = 10, PH = 20, DT = 1 / 120;
  const GRAV = 700, MAXFALL = 320;
  const SOLID_ALWAYS = '#=Bw';

  class World {
    constructor(levelIndex, charIdx, points, hp) {
      const lv = Levels.build(levelIndex);
      this.lv = lv;
      this.gw = lv.w; this.gh = lv.h;
      this.W = lv.w * T; this.H = lv.h * T;
      this.grid = lv.grid;
      this.theme = lv.theme;
      this.t = 0;
      this.events = [];
      this.particles = [];
      this.crumble = {};
      this.bridgeOn = false;
      this.doorT = 0;
      this.doorWasOpen = false;
      this.visited = new Set();
      this.points = points || 0;
      this.hpMax = 5;
      this.hp = hp || 5;
      this.timeLeft = lv.time;
      this.won = false;
      this.dead = false;
      this.deadReason = '';
      this.collected = 0;
      this.cd = new Array(9).fill(0);
      this.inp = { left: false, right: false, jumpHeld: false, jumpPressed: false, abilityPressed: false };
      this.movers = lv.movers.map((m) => ({
        ox: m.x * T, oy: m.y * T, w: m.w * T, range: m.range * T, period: m.period, phase: m.phase || 0,
        px: m.x * T, py: m.y * T, dx: 0,
      }));
      const sx = lv.start[0] * T + 3, sy = lv.start[1] * T + T - PH;
      this.spawn = { x: sx, y: sy };
      this.p = {
        x: sx, y: sy, vx: 0, vy: 0, face: 1, ch: charIdx, ground: false, riding: null, wet: false,
        coyote: 0, jumpBuf: 0, usedDouble: false, airDash: false, hoverUsed: false,
        inv: 0, animT: 0,
        sprintT: 0, dashT: 0, dashDir: 1, spinT: 0, punchT: 0, shieldT: 0, hoverT: 0, ultT: 0,
      };
    }

    emit(name) { this.events.push(name); }

    // ---------- тайлы ----------
    tileAt(tx, ty) {
      if (tx < 0 || tx >= this.gw || ty < 0 || ty >= this.gh) return ' ';
      return this.grid[ty][tx];
    }
    solidAt(tx, ty) {
      if (tx < 0 || tx >= this.gw) return true; // боковые границы мира
      const ch = this.tileAt(tx, ty);
      if (ch === ' ') return false;
      if (SOLID_ALWAYS.indexOf(ch) >= 0) return true;
      if (ch === 'F') { const c = this.crumble[tx + ',' + ty]; return !c || c.state !== 'gone'; }
      if (ch === 'D') return this.doorT <= 0;
      if (ch === 'r') return this.bridgeOn;
      return false;
    }
    overlapsSolid(x, y) {
      const l = Math.floor(x / T), r = Math.floor((x + PW - 0.001) / T);
      const tp = Math.floor(y / T), bt = Math.floor((y + PH - 0.001) / T);
      for (let ty = tp; ty <= bt; ty++) for (let tx = l; tx <= r; tx++) if (this.solidAt(tx, ty)) return true;
      return false;
    }

    puff(x, y, col, n) {
      for (let i = 0; i < (n || 8); i++) {
        const a = Math.random() * Math.PI * 2, s = 20 + Math.random() * 50;
        this.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, life: 0.4 + Math.random() * 0.3, max: 0.7, col, size: 2 });
      }
    }

    // ---------- способности ----------
    useAbility() {
      const p = this.p, i = p.ch;
      if (this.cd[i] > 0) return;
      switch (i) {
        case 0: p.sprintT = 1.4; this.cd[i] = 4; this.emit('ability'); break;
        case 1: case 6: this.cd[i] = 0.6; this.emit('ability'); break;
        case 2: p.spinT = 0.55; this.cd[i] = 0.9; this.emit('spin'); break;
        case 3: p.punchT = 0.25; this.cd[i] = 0.35; this.emit('ability'); this.punch(); break;
        case 4:
          if (!p.ground && p.airDash) return;
          p.dashT = 0.28; p.dashDir = p.face; if (!p.ground) p.airDash = true;
          this.cd[i] = 0.7; this.emit('dash'); break;
        case 5: p.shieldT = 2.6; this.cd[i] = 6; this.emit('shield'); break;
        case 7:
          if (p.ground || p.hoverUsed) return;
          p.hoverT = 0.35; p.hoverUsed = true; this.cd[i] = 0.5; this.emit('ability'); break;
        case 8: p.ultT = 4; this.cd[i] = 10; this.emit('ultimate'); break;
      }
      p.animT = 0.4;
    }

    punch() {
      const p = this.p;
      const x0 = p.face > 0 ? p.x + PW : p.x - 14, x1 = x0 + 14;
      this.breakArea(x0, p.y - 4, x1, p.y + PH);
    }
    breakArea(x0, y0, x1, y1) {
      for (let ty = Math.floor(y0 / T); ty <= Math.floor(y1 / T); ty++) {
        for (let tx = Math.floor(x0 / T); tx <= Math.floor(x1 / T); tx++) {
          if (this.tileAt(tx, ty) === 'B') {
            this.grid[ty][tx] = ' ';
            this.emit('break');
            this.puff(tx * T + 8, ty * T + 8, '#d8843a', 10);
            this.puff(tx * T + 8, ty * T + 8, '#5a2a10', 4);
          }
        }
      }
    }
    activateVinyl() {
      const p = this.p;
      const cx = p.x + PW / 2, cy = p.y + PH / 2;
      for (let ty = 0; ty < this.gh; ty++) for (let tx = 0; tx < this.gw; tx++) {
        if (this.grid[ty][tx] !== 'R') continue;
        const dx = tx * T + 8 - cx, dy = ty * T + 8 - cy;
        if (dx * dx + dy * dy < 44 * 44 && !this.bridgeOn) {
          this.bridgeOn = true;
          this.emit('bridge');
          this.puff(tx * T + 8, ty * T + 8, '#5dff9a', 14);
        }
      }
    }

    hurt() {
      const p = this.p;
      this.hp--;
      p.inv = 1.6;
      p.vy = -170; p.vx = -p.face * 90;
      this.emit('hurt');
      if (this.hp <= 0) { this.dead = true; this.deadReason = 'HP'; }
    }
    fall() {
      const p = this.p;
      this.hp--;
      this.emit('fall');
      p.x = this.spawn.x; p.y = this.spawn.y; p.vx = 0; p.vy = 0; p.inv = 1.5;
      p.dashT = 0; p.spinT = 0; p.hoverT = 0;
      if (this.hp <= 0) { this.dead = true; this.deadReason = 'HP'; }
    }

    // ---------- шаг симуляции ----------
    update(dt) {
      let acc = dt;
      while (acc > 1e-6) {
        const h = Math.min(DT, acc);
        this.step(h);
        acc -= h;
        this.inp.jumpPressed = false;
        this.inp.abilityPressed = false;
      }
    }

    step(dt) {
      if (this.dead || this.won) return;
      const p = this.p, inp = this.inp, C = Chars.list[p.ch];
      this.t += dt;
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) { this.timeLeft = 0; this.dead = true; this.deadReason = 'TIME'; return; }
      for (let i = 0; i < 9; i++) if (this.cd[i] > 0) this.cd[i] -= dt;
      p.coyote -= dt; p.jumpBuf -= dt; p.inv -= dt; p.animT -= dt;
      p.sprintT -= dt; p.dashT -= dt; p.spinT -= dt; p.punchT -= dt; p.shieldT -= dt; p.hoverT -= dt; p.ultT -= dt;
      if (inp.jumpPressed) p.jumpBuf = 0.12;
      if (inp.abilityPressed) this.useAbility();

      // двери по таймеру
      if (this.doorT > 0) {
        this.doorT -= dt;
        if (this.doorT <= 0 && this.overlapsDoor()) this.doorT = 0.05;
      }
      if (this.doorWasOpen && this.doorT <= 0) { this.doorWasOpen = false; this.emit('door'); }

      // движущиеся платформы
      for (const m of this.movers) {
        const ph = (this.t / m.period + m.phase) % 1;
        const npx = m.ox + m.range * (0.5 - 0.5 * Math.cos(ph * Math.PI * 2));
        m.dx = npx - m.px; m.px = npx;
      }
      if (p.riding) { p.x += p.riding.dx; }

      const ult = p.ultT > 0;
      const dashing = p.dashT > 0;
      const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
      if (dir !== 0 && !dashing) p.face = dir;

      // ---------- горизонталь ----------
      let speed = C.speed;
      if (p.sprintT > 0) speed = C.sprint;
      if (ult) speed = 135;
      if (dashing) {
        p.vx = 270 * p.dashDir;
        if (Math.random() < 0.6) this.particles.push({ x: p.x + PW / 2, y: p.y + 4 + Math.random() * 14, vx: -p.dashDir * 30, vy: 0, life: 0.25, max: 0.25, col: '#4dd8ff', size: 2 });
      } else {
        const target = dir * speed;
        const slippery = p.wet && p.ch !== 7;
        if (dir !== 0) {
          const a = (p.ground ? (slippery ? 200 : 1600) : 900) * dt;
          if (p.vx < target) p.vx = Math.min(target, p.vx + a); else if (p.vx > target) p.vx = Math.max(target, p.vx - a);
        } else {
          const f = (p.ground ? (slippery ? 45 : 1800) : 500) * dt;
          if (p.vx > 0) p.vx = Math.max(0, p.vx - f); else if (p.vx < 0) p.vx = Math.min(0, p.vx + f);
        }
      }

      // ---------- вертикаль ----------
      if (dashing) p.vy = 0;
      else if (p.hoverT > 0) p.vy = 0;
      else {
        const gm = (!inp.jumpHeld && p.vy < 0) ? 2.2 : 1;
        p.vy = Math.min(MAXFALL, p.vy + GRAV * gm * dt);
        if (p.spinT > 0 && p.vy > 40) p.vy = 40;
      }
      const jumpV = ult ? 292 : C.jump;
      if (p.jumpBuf > 0) {
        if (p.coyote > 0) {
          p.vy = -jumpV; p.jumpBuf = 0; p.coyote = 0; p.ground = false; p.riding = null;
          this.emit('jump'); this.puff(p.x + PW / 2, p.y + PH, '#ffffff', 4);
        } else if ((p.ch === 6 || ult) && !p.usedDouble && !p.ground) {
          p.vy = -235; p.jumpBuf = 0; p.usedDouble = true; p.dashT = 0;
          this.emit('jump2'); this.puff(p.x + PW / 2, p.y + PH, '#c78bff', 8);
        }
      }

      this.moveX(dt, ult);
      this.moveY(dt);
      if (p.punchT > 0) this.punch();
      if (p.spinT > 0) this.activateVinyl();
      if (ult && Math.random() < 0.5) {
        this.particles.push({ x: p.x + Math.random() * PW, y: p.y + Math.random() * PH, vx: 0, vy: -30, life: 0.4, max: 0.4, col: ['#ff5d7a', '#ffe14d', '#4dd8ff', '#5dff9a'][Math.floor(Math.random() * 4)], size: 2 });
      }

      this.touch();

      // падение в яму
      if (p.y > this.H + 24) this.fall();
      // вышли из мира влево
      if (p.x < 0) { p.x = 0; p.vx = Math.max(0, p.vx); }

      // безопасность: не застревать в стенах
      if (this.overlapsSolid(p.x, p.y)) this.unstick();

      // рассыпающиеся плитки
      for (const k in this.crumble) {
        const c = this.crumble[k];
        c.t -= dt;
        if (c.state === 'stand' && c.t <= 0) { c.state = 'gone'; c.t = 3; this.emit('break'); }
        else if (c.state === 'gone' && c.t <= 0) {
          const [tx, ty] = k.split(',').map(Number);
          if (!this.rectHitsTile(p.x, p.y, tx, ty)) delete this.crumble[k]; else c.t = 0.3;
        }
      }

      // частицы
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const q = this.particles[i];
        q.life -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 120 * dt;
        if (q.life <= 0) this.particles.splice(i, 1);
      }
    }

    rectHitsTile(x, y, tx, ty) {
      return x + PW > tx * T && x < tx * T + T && y + PH > ty * T && y < ty * T + T;
    }
    overlapsDoor() {
      const p = this.p;
      for (let ty = 0; ty < this.gh; ty++) for (let tx = 0; tx < this.gw; tx++) {
        if (this.grid[ty][tx] === 'D' && this.rectHitsTile(p.x, p.y, tx, ty)) return true;
      }
      return false;
    }

    moveX(dt, ult) {
      const p = this.p;
      if (p.vx === 0) return;
      let nx = p.x + p.vx * dt;
      const tp = Math.floor(p.y / T), bt = Math.floor((p.y + PH - 0.001) / T);
      const tx = p.vx > 0 ? Math.floor((nx + PW - 0.001) / T) : Math.floor(nx / T);
      for (let ty = tp; ty <= bt; ty++) {
        if (ult && this.tileAt(tx, ty) === 'B') { this.breakArea(tx * T, ty * T, tx * T + 1, ty * T + 1); continue; }
        if (this.solidAt(tx, ty)) {
          nx = p.vx > 0 ? tx * T - PW : (tx + 1) * T;
          p.vx = 0;
          if (p.dashT > 0) p.dashT = 0;
          break;
        }
      }
      p.x = nx;
    }

    moveY(dt) {
      const p = this.p;
      const prevBottom = p.y + PH;
      let ny = p.y + p.vy * dt;
      let landed = false;
      if (p.vy >= 0) {
        const newBottom = ny + PH;
        const l = Math.floor(p.x / T), r = Math.floor((p.x + PW - 0.001) / T);
        let best = Infinity, bestKind = null, bestTile = null;
        const r0 = Math.ceil((prevBottom - 0.001) / T), r1 = Math.floor(newBottom / T);
        for (let ty = r0; ty <= r1; ty++) {
          for (let tx = l; tx <= r; tx++) {
            const ch = this.tileAt(tx, ty);
            if (this.solidAt(tx, ty) || ch === '-') {
              const top = ty * T;
              if (top < best) { best = top; bestKind = ch; bestTile = [tx, ty]; }
            }
          }
        }
        let mv = null;
        for (const m of this.movers) {
          if (p.x + PW > m.px && p.x < m.px + m.w && prevBottom <= m.py + 4 && newBottom >= m.py && m.py < best) {
            best = m.py; mv = m; bestKind = 'M';
          }
        }
        if (best !== Infinity) {
          ny = best - PH; landed = true;
          p.riding = mv;
          p.wet = bestKind === 'w';
          if (bestKind === 'F') {
            const k = bestTile[0] + ',' + bestTile[1];
            if (!this.crumble[k]) this.crumble[k] = { state: 'stand', t: 0.45 };
          }
        }
      } else {
        const l = Math.floor(p.x / T), r = Math.floor((p.x + PW - 0.001) / T);
        const ty = Math.floor(ny / T);
        for (let tx = l; tx <= r; tx++) {
          if (this.solidAt(tx, ty)) { ny = (ty + 1) * T; p.vy = 0; break; }
        }
      }
      p.y = ny;
      if (landed) {
        if (!p.ground && p.vy > 120) this.puff(p.x + PW / 2, p.y + PH, '#ffffff', 3);
        p.ground = true; p.vy = 0; p.coyote = 0.09; p.usedDouble = false; p.airDash = false; p.hoverUsed = false;
      } else {
        p.ground = false; p.riding = null; p.wet = false;
      }
    }

    unstick() {
      const p = this.p;
      for (let d = 1; d <= 48; d++) {
        if (!this.overlapsSolid(p.x, p.y - d)) { p.y -= d; p.vy = 0; return; }
      }
      // крайний случай — вернуться на последний чекпоинт
      p.x = this.spawn.x; p.y = this.spawn.y; p.vx = p.vy = 0;
    }

    // ---------- предметы, ловушки, триггеры ----------
    touch() {
      const p = this.p;
      const l = Math.floor((p.x - 2) / T), r = Math.floor((p.x + PW + 2) / T);
      const tp = Math.floor((p.y - 2) / T), bt = Math.floor((p.y + PH + 2) / T);
      const shield = p.shieldT > 0 || p.ultT > 0;
      for (let ty = tp; ty <= bt; ty++) {
        for (let tx = l; tx <= r; tx++) {
          const ch = this.tileAt(tx, ty);
          if (ch === ' ') continue;
          const tx0 = tx * T, ty0 = ty * T;
          switch (ch) {
            case 'o': case 'n': case 't': case 'e': {
              const cx = tx0 + 8, cy = ty0 + 8, big = ch === 't' ? 6 : 5;
              if (p.x + PW > cx - big && p.x < cx + big && p.y + PH > cy - big && p.y < cy + big) {
                this.grid[ty][tx] = ' ';
                this.collected++;
                if (ch === 'o') { this.points += 1; this.emit('collect'); }
                else if (ch === 'n') { this.points += 5; this.emit('note'); }
                else if (ch === 't') { this.points += 25; this.emit('star'); }
                else { this.points += 10; this.hp = Math.min(this.hpMax, this.hp + 1); this.emit('energy'); }
                this.puff(cx, cy, ch === 'n' ? '#4df0ff' : ch === 'e' ? '#ff5db8' : '#ffd93d', 6);
              }
              break;
            }
            case '^':
              if (p.inv <= 0 && !shield && p.x + PW > tx0 + 2 && p.x < tx0 + 14 && p.y + PH > ty0 + 8 && p.y < ty0 + 16) this.hurt();
              break;
            case 'K':
              if (this.rectHitsTile(p.x, p.y, tx, ty) && p.y + PH >= ty0 + 8) {
                if (this.doorT <= 0) this.emit('door');
                this.doorT = this.lv.doorTime; this.doorWasOpen = true;
              }
              break;
            case 'C':
              if (!this.visited.has(tx + ',' + ty) && this.rectHitsTile(p.x, p.y, tx, ty)) {
                this.visited.add(tx + ',' + ty);
                this.spawn = { x: tx0 + 3, y: ty0 + T - PH };
                this.hp = Math.min(this.hpMax, this.hp + 1);
                this.emit('checkpoint');
                this.puff(tx0 + 8, ty0 + 6, '#ffe14d', 12);
              }
              break;
            case 'G':
              if (p.x + PW > tx0 - 2 && p.x < tx0 + 18 && p.y + PH > ty0 - 16 && p.y < ty0 + 16) { this.won = true; this.emit('goal'); }
              break;
          }
        }
      }
    }

    // ---------- для рендера ----------
    pose() {
      const p = this.p;
      if (p.animT > 0 || p.ultT > 0) return 'ability';
      if (!p.ground) return 'jump';
      if (Math.abs(p.vx) > 12) return 'walk';
      return 'idle';
    }
    abilityState() {
      const p = this.p, c = this.cd[p.ch];
      if (p.ch === 8 && p.ultT > 0) return 'ACTIVE';
      if (p.ch === 5 && p.shieldT > 0) return 'ACTIVE';
      if (p.ch === 0 && p.sprintT > 0) return 'ACTIVE';
      return c > 0 ? c : 0;
    }
  }

  window.World = World;
  window.ENGINE = { T, PW, PH };
})();
