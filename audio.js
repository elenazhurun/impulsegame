// 8-bit звуки и музыка через Web Audio API (без внешних файлов).
(function () {
  let ac = null;
  let master = null;
  let muted = false;
  let musicTimer = null;
  let musicOn = false;
  let musicMode = 'game';
  let step = 0;
  let nextTime = 0;

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain();
    master.gain.value = muted ? 0 : 0.5;
    master.connect(ac.destination);
  }

  function tone(freq, t0, dur, type, vol, freqEnd) {
    if (!ac) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t0);
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }

  function noise(t0, dur, vol) {
    if (!ac) return;
    const len = Math.max(1, Math.floor(ac.sampleRate * dur));
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = ac.createBufferSource();
    const g = ac.createGain();
    s.buffer = buf;
    g.gain.value = vol;
    s.connect(g); g.connect(master);
    s.start(t0);
  }

  const SFX = {
    jump: (t) => tone(300, t, 0.16, 'square', 0.16, 720),
    jump2: (t) => tone(420, t, 0.16, 'square', 0.16, 900),
    collect: (t) => { tone(988, t, 0.07, 'square', 0.14); tone(1319, t + 0.07, 0.14, 'square', 0.14); },
    note: (t) => { tone(784, t, 0.06, 'square', 0.14); tone(1047, t + 0.06, 0.06, 'square', 0.14); tone(1568, t + 0.12, 0.14, 'square', 0.14); },
    star: (t) => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, t + i * 0.06, 0.12, 'square', 0.14)); },
    energy: (t) => tone(400, t, 0.3, 'sawtooth', 0.12, 1600),
    switch: (t) => { tone(523, t, 0.06, 'square', 0.13); tone(659, t + 0.06, 0.06, 'square', 0.13); tone(784, t + 0.12, 0.1, 'square', 0.13); },
    dash: (t) => { noise(t, 0.16, 0.25); tone(900, t, 0.16, 'sawtooth', 0.1, 200); },
    ability: (t) => { tone(440, t, 0.1, 'triangle', 0.25, 880); tone(880, t + 0.1, 0.16, 'square', 0.1, 1760); },
    spin: (t) => { [600, 800, 1000, 1200].forEach((f, i) => tone(f, t + i * 0.05, 0.06, 'triangle', 0.2)); },
    shield: (t) => { tone(200, t, 0.3, 'square', 0.14, 500); },
    ultimate: (t) => { [262, 330, 392, 523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.05, 0.14, 'square', 0.14)); },
    break: (t) => { noise(t, 0.25, 0.4); tone(150, t, 0.2, 'square', 0.15, 50); },
    hurt: (t) => { tone(400, t, 0.3, 'sawtooth', 0.2, 60); },
    fall: (t) => { tone(600, t, 0.5, 'square', 0.15, 60); },
    door: (t) => { tone(330, t, 0.1, 'square', 0.14); tone(494, t + 0.1, 0.16, 'square', 0.14); },
    checkpoint: (t) => { [659, 784, 988].forEach((f, i) => tone(f, t + i * 0.08, 0.14, 'square', 0.14)); },
    select: (t) => tone(660, t, 0.08, 'square', 0.14),
    start: (t) => { [392, 523, 659, 784].forEach((f, i) => tone(f, t + i * 0.08, 0.14, 'square', 0.15)); },
    clear: (t) => { [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.1, 0.16, 'square', 0.15)); },
    perfect: (t) => { tone(1047, t, 0.06, 'square', 0.14); tone(1568, t + 0.05, 0.1, 'square', 0.14); },
    good: (t) => tone(784, t, 0.08, 'square', 0.12),
    miss: (t) => tone(150, t, 0.15, 'sawtooth', 0.13, 90),
    gameover: (t) => { [523, 466, 392, 311, 262].forEach((f, i) => tone(f, t + i * 0.16, 0.2, 'square', 0.16)); },
    victory: (t) => {
      const mel = [523, 523, 523, 523, 415, 466, 523, 466, 523];
      const dur = [0.12, 0.12, 0.12, 0.3, 0.3, 0.3, 0.14, 0.1, 0.5];
      let x = t;
      mel.forEach((f, i) => { tone(f, x, dur[i] + 0.05, 'square', 0.16); tone(f / 2, x, dur[i] + 0.05, 'triangle', 0.16); x += dur[i] + 0.03; });
    },
  };

  function play(name) {
    if (!ac || muted) return;
    const fn = SFX[name];
    if (fn) fn(ac.currentTime + 0.001);
  }

  // Музыка: простая петля (мелодия + бас), шаг = 1/8 такта
  const LEAD = {
    game: [
      'E5', 0, 'G5', 0, 'A5', 'G5', 'E5', 0, 'D5', 0, 'E5', 0, 'G5', 0, 0, 0,
      'C5', 0, 'E5', 0, 'G5', 'E5', 'C5', 0, 'D5', 0, 'E5', 'D5', 'C5', 0, 0, 0,
      'A4', 0, 'C5', 0, 'E5', 'C5', 'A4', 0, 'B4', 0, 'D5', 0, 'G5', 0, 0, 0,
      'E5', 'G5', 'A5', 'B5', 'A5', 'G5', 'E5', 'D5', 'E5', 0, 0, 0, 0, 0, 0, 0,
    ],
    battle: [
      'A4', 'A4', 0, 'C5', 'A4', 0, 'E5', 0, 'D5', 'D5', 0, 'C5', 'B4', 0, 'G4', 0,
      'A4', 'A4', 0, 'C5', 'A4', 0, 'E5', 0, 'G5', 'F5', 'E5', 'D5', 'E5', 0, 0, 0,
    ],
    menu: [
      'C5', 0, 'E5', 0, 'G5', 0, 'E5', 0, 'F5', 0, 'A5', 0, 'G5', 0, 'E5', 0,
      'D5', 0, 'F5', 0, 'A5', 0, 'F5', 0, 'E5', 0, 'G5', 0, 'C6', 0, 0, 0,
    ],
  };
  const BASS = {
    game: ['C3', 'C3', 'G2', 'G2', 'A2', 'A2', 'E2', 'E2'],
    battle: ['A2', 'A2', 'A2', 'A2', 'D3', 'D3', 'E3', 'E3'],
    menu: ['C3', 'C3', 'F2', 'F2'],
  };
  const NAMES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function freqOf(n) {
    const oct = parseInt(n[n.length - 1], 10);
    const semi = NAMES[n[0]] + (n[1] === '#' ? 1 : 0);
    return 440 * Math.pow(2, (semi + (oct - 4) * 12 - 9) / 12);
  }

  function scheduler() {
    if (!ac || !musicOn) return;
    const lead = LEAD[musicMode];
    const bass = BASS[musicMode];
    const stepDur = musicMode === 'battle' ? 0.13 : musicMode === 'menu' ? 0.2 : 0.16;
    if (nextTime < ac.currentTime) nextTime = ac.currentTime + 0.05;
    while (nextTime < ac.currentTime + 0.3) {
      const n = lead[step % lead.length];
      if (n && !muted) tone(freqOf(n), nextTime, stepDur * 1.6, 'square', 0.05);
      if (step % 4 === 0 && !muted) {
        const b = bass[(step / 4) % bass.length | 0];
        tone(freqOf(b), nextTime, stepDur * 3.2, 'triangle', 0.12);
      }
      if (musicMode === 'battle' && step % 4 === 2 && !muted) noise(nextTime, 0.04, 0.05);
      nextTime += stepDur;
      step++;
    }
  }

  function music(mode) {
    if (mode === false) { musicOn = false; return; }
    if (!ac) return;
    if (musicOn && musicMode === mode) return;
    musicMode = mode;
    musicOn = true;
    step = 0;
    nextTime = 0;
    if (!musicTimer) musicTimer = setInterval(scheduler, 100);
  }

  function toggleMute() {
    muted = !muted;
    if (master) master.gain.value = muted ? 0 : 0.5;
    return muted;
  }

  window.Sound = { init, play, music, toggleMute, isMuted: () => muted };
})();
