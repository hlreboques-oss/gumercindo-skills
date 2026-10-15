// Trilha eletrônica sintetizada (sem direitos autorais). WAV estéreo 44.1kHz.
// uso: node music.js <saida.wav> --dur 39 --cuts 4.2,8.2,13.2 --hits 19.25,30.55 [--beat 4.2] [--arp 17.4]
//  --cuts: inícios de cena (whoosh antes de cada corte) | --hits: impactos (revelações)
//  --beat: quando entra a batida | --arp: quando entra o arpejo (clímax)
const fs = require('fs'); const a = process.argv.slice(2); const out = a[0];
const opt = k => { const i = a.indexOf('--' + k); return i > 0 ? a[i + 1] : null; };
const nums = k => (opt(k) || '').split(',').filter(Boolean).map(Number);
const DUR = +(opt('dur') || 30), CUTS = nums('cuts'), HITS = nums('hits');
const BEAT = +(opt('beat') ?? CUTS[0] ?? 4), ARP = +(opt('arp') ?? DUR * .45);
const SR = 44100, N = SR * DUR | 0; const L = new Float32Array(N), R = new Float32Array(N);
const B = .5; const add = (i, v, pan = 0) => { if (i >= 0 && i < N) { L[i] += v * (1 - pan); R[i] += v * (1 + pan); } };
let seed = 1; const nz = () => { seed = (seed * 16807) % 2147483647; return seed / 1073741823.5 - 1; };
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
function kick(t, g = 1) { const s = t * SR | 0; let ph = 0; for (let i = 0; i < SR * .45; i++) { const tt = i / SR; ph += 2 * Math.PI * (45 + 110 * Math.exp(-tt * 28)) / SR; add(s + i, Math.sin(ph) * Math.exp(-tt * 7) * .9 * g); } }
function hat(t, g = 1) { const s = t * SR | 0; let p = 0; for (let i = 0; i < SR * .06; i++) { const n = nz(); add(s + i, (n - p) * Math.exp(-i / SR * 70) * .12 * g, .3); p = n; } }
function clap(t) { const s = t * SR | 0; let p = 0; for (let i = 0; i < SR * .2; i++) { const n = nz(); add(s + i, (n - p * .5) * Math.exp(-i / SR * 22) * .18, -.2); p = n; } }
function tone(t, dur, m, g, type = 'saw', pan = 0, att = .01) { const s = t * SR | 0, f = hz(m); let lp = 0; for (let i = 0; i < dur * SR; i++) { const tt = i / SR, ph = (tt * f) % 1; let v = type === 'saw' ? (ph * 2 - 1) + ((tt * f * 1.007) % 1 * 2 - 1) : Math.sin(2 * Math.PI * ph); lp += (v - lp) * .08; add(s + i, lp * Math.min(1, tt / att) * Math.min(1, (dur - tt) / .08) * g, pan); } }
function whoosh(t, len, g = .25) { const s = (t - len) * SR | 0; let lp = 0; for (let i = 0; i < len * SR; i++) { const k = i / (len * SR); lp += (nz() - lp) * (.02 + k * .3); add(s + i, lp * k * k * g * 2, Math.sin(k * 6) * .5); } }
function impact(t) { kick(t, 1.4); const s = t * SR | 0; let lp = 0; for (let i = 0; i < SR * 1.2; i++) { lp += (nz() - lp) * .15; add(s + i, lp * Math.exp(-i / SR * 3) * .5); } tone(t, 1.5, 33, .25, 'sine'); }
const prog = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], bass = [45, 41, 48, 43]; // Am F C G
for (let bar = 0; bar * 2 < DUR; bar++) { const t = bar * 2, c = prog[bar % 4];
  c.forEach((m, j) => tone(t, 2, m, .035, 'saw', (j - 1) * .5, .3));
  if (t >= BEAT && t < DUR - 1) for (let k = 0; k < 8; k++) tone(t + k * B / 2, B / 2 * .8, bass[bar % 4] - 12 + (k % 2 ? 12 : 0), .09);
  if (t >= ARP) for (let k = 0; k < 8; k++) tone(t + k * B / 2, .18, c[k % 3] + 12, .04, 'sine', k % 2 ? .4 : -.4); }
for (let t = BEAT; t < DUR - .6; t += B) { kick(t); hat(t + B / 2); }
for (let t = BEAT + B; t < DUR - .6; t += 2 * B) if (t > BEAT + 3) clap(t);
for (let t = BEAT + 9; t < DUR - .6; t += B / 4) hat(t, .5);
CUTS.forEach(t => whoosh(t, .8)); HITS.forEach(impact);
let pk = 0; for (let i = 0; i < N; i++) { const tt = i / SR, f = Math.min(1, tt / .6) * Math.min(1, (DUR - tt) / 1.2); L[i] *= f; R[i] *= f; pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])); }
const buf = Buffer.alloc(44 + N * 4), w = (o, s) => buf.write(s, o);
w(0, 'RIFF'); buf.writeUInt32LE(36 + N * 4, 4); w(8, 'WAVEfmt '); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); w(36, 'data'); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.tanh(L[i] / pk * 1.3) * .85 * 32767 | 0, 44 + i * 4); buf.writeInt16LE(Math.tanh(R[i] / pk * 1.3) * .85 * 32767 | 0, 46 + i * 4); }
fs.writeFileSync(out, buf); console.log('trilha:', out, DUR + 's');
