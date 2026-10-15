// ============================================================
//  MOTOR DE ANIMAÇÃO — vídeo vertical 9:16 (1080x1920, 30fps)
//  Animação 100% em JavaScript (Canvas 2D). render(t) é
//  determinístico: o mesmo t sempre gera o mesmo quadro.
// ============================================================
const W = 1080, H = 1920, FPS = 30;
let DUR = 30; // recalculado automaticamente a partir das cenas
const C = document.getElementById('c');
const X = C.getContext('2d');
C.width = W; C.height = H;

let GREEN = '#3dff5c', G = '61,255,92', RED = '255,48,48';
// troca a cor de destaque do vídeo inteiro. Ex.: setAccent('#ffb800')
// mistura a cor rgb 'r,g,b' com branco (alvo=1) ou preto (alvo=0) na proporção k
function mix(rgb, alvo, k) { const c = rgb.split(',').map(v => Math.round(+v + (alvo * 255 - v) * k)); return `rgb(${c})`; }
function setAccent(hex) { GREEN = hex; const n = parseInt(hex.slice(1), 16); G = `${n >> 16 & 255},${n >> 8 & 255},${n & 255}`; }
const FB = '"ArchivoBlack"', FA = '"Archivo"', FC = '"Cinzel"';

// ---------- utilidades ----------
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const pr = (t, a, b) => cl((t - a) / (b - a));
const eo = x => 1 - Math.pow(1 - x, 3);
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const back = x => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
function rnd(i) { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }

const LOGO = (typeof LOGO_D === 'string' && LOGO_D) ? new Path2D(LOGO_D) : null;

function rr(x, y, w, h, r) { X.beginPath(); X.roundRect(x, y, w, h, r); }

function fitSize(str, font, size, maxW, ls = 0, weight = '') {
  X.font = `${weight ? weight + ' ' : ''}${size}px ${font}`; X.letterSpacing = ls + 'px';
  const w = X.measureText(str).width;
  return w > maxW ? size * maxW / w : size;
}

// texto com entrada animada (sobe + desfoque + fade)
function txt(str, x, y, o) {
  const {
    size = 60, font = FB, color = '#fff', glow = 0, glowColor = color, align = 'center',
    t = 1, ls = 0, maxW = 960, weight = ''
  } = o;
  const q = eo(cl(t));
  if (q <= 0) return;
  const s = fitSize(str, font, size, maxW, ls, weight);
  X.save();
  X.globalAlpha *= q;
  X.font = `${weight ? weight + ' ' : ''}${s}px ${font}`;
  X.letterSpacing = ls + 'px';
  X.textAlign = align; X.textBaseline = 'middle';
  if (q < 1) X.filter = `blur(${(1 - q) * 14}px)`;
  const yy = y + (1 - q) * 46;
  if (glow) { X.shadowColor = glowColor; X.shadowBlur = glow; X.fillStyle = color; X.fillText(str, x, yy); X.shadowBlur = glow * .4; }
  X.fillStyle = color; X.fillText(str, x, yy);
  X.restore();
}

// texto com palavras em cores diferentes: parts = [[texto, cor, glow], ...]
function txtParts(parts, x, y, o) {
  const { size = 80, font = FB, t = 1, maxW = 960, ls = 0 } = o;
  const q = eo(cl(t)); if (q <= 0) return;
  const full = parts.map(p => p[0]).join('');
  const s = fitSize(full, font, size, maxW, ls);
  X.save(); X.globalAlpha *= q;
  X.font = `${s}px ${font}`; X.letterSpacing = ls + 'px'; X.textBaseline = 'middle'; X.textAlign = 'left';
  if (q < 1) X.filter = `blur(${(1 - q) * 14}px)`;
  let cx = x - X.measureText(full).width / 2; const yy = y + (1 - q) * 46;
  for (const [str, col, gl] of parts) {
    X.fillStyle = col;
    if (gl) { X.shadowColor = col; X.shadowBlur = gl; X.fillText(str, cx, yy); }
    X.shadowBlur = 0; X.fillText(str, cx, yy);
    cx += X.measureText(str).width;
  }
  X.restore();
}

// ---------- camadas pré-renderizadas ----------
function makeGrid(size, step, col) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d');
  g.strokeStyle = col; g.lineWidth = 1.5;
  for (let i = 0; i <= size; i += step) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, size); g.stroke();
    g.beginPath(); g.moveTo(0, i); g.lineTo(size, i); g.stroke();
  }
  g.globalCompositeOperation = 'destination-in';
  const rg = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(.55, 'rgba(0,0,0,.5)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rg; g.fillRect(0, 0, size, size);
  return c;
}
const GRID = makeGrid(1400, 70, 'rgba(255,255,255,.16)');

const GRAIN = [0, 1, 2, 3].map(k => {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'); const id = g.createImageData(256, 256);
  for (let i = 0; i < id.data.length; i += 4) {
    const v = rnd(i * .37 + k * 999) * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 22;
  }
  g.putImageData(id, 0, 0); return c;
});

// ---------- elementos ----------
function glowBlob(x, y, r, rgb, a) {
  const g = X.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(.45, `rgba(${rgb},${a * .35})`); g.addColorStop(1, `rgba(${rgb},0)`);
  X.fillStyle = g; X.fillRect(x - r, y - r, r * 2, r * 2);
}

function grid(x, y, a, scale = 1) {
  X.save(); X.globalAlpha *= a;
  X.drawImage(GRID, x - 700 * scale, y - 700 * scale, 1400 * scale, 1400 * scale);
  X.restore();
}

function particles(t, n, rgb, a, seed = 0) {
  X.save();
  for (let i = 0; i < n; i++) {
    const r1 = rnd(i + seed), r2 = rnd(i * 3.1 + seed), r3 = rnd(i * 7.7 + seed);
    const px = r1 * W + Math.sin(t * .6 + i) * 20;
    const py = ((r2 * H - t * (25 + r3 * 60)) % H + H) % H;
    const tw = .4 + .6 * Math.abs(Math.sin(t * 2 + i));
    X.fillStyle = `rgba(${rgb},${a * tw * (0.3 + r3 * .7)})`;
    X.beginPath(); X.arc(px, py, 1.5 + r3 * 3, 0, 7); X.fill();
  }
  X.restore();
}

// emblema Carlos Júnior centralizado em (x,y) com largura w
function logo(x, y, w, a = 1, glow = 30, reveal = 1) {
  if (!LOGO) return;
  const bw = LOGO_BB[2] - LOGO_BB[0], bh = LOGO_BB[3] - LOGO_BB[1];
  const s = w / bw;
  X.save(); X.globalAlpha *= a;
  if (reveal < 1) { // revelação por varredura vertical
    X.beginPath(); X.rect(x - w, y + bh * s / 2 - bh * s * 1.2 * reveal - 10, w * 2, bh * s * 1.2 * reveal + 20); X.clip();
  }
  X.translate(x - w / 2, y - bh * s / 2); X.scale(s, s); X.translate(-LOGO_BB[0], -LOGO_BB[1]);
  X.fillStyle = '#fff';
  if (glow) { X.shadowColor = `rgba(${G},.9)`; X.shadowBlur = glow; X.fill(LOGO, 'evenodd'); }
  X.shadowBlur = 0; X.fill(LOGO, 'evenodd');
  X.restore();
}

// personagem de vidro (cabeça + ombros), estilo da referência
function figure(x, y, s, o = {}) {
  const { tint = '255,255,255', a = 1, face = true, blink = 0, smile = 0 } = o;
  X.save(); X.globalAlpha *= a; X.translate(x, y); X.scale(s, s);
  // corpo
  let g = X.createLinearGradient(0, 40, 0, 330);
  g.addColorStop(0, `rgba(${tint},.55)`); g.addColorStop(.6, `rgba(${tint},.12)`); g.addColorStop(1, `rgba(${tint},0)`);
  X.fillStyle = g; X.beginPath(); X.ellipse(0, 330, 200, 270, 0, Math.PI, 0); X.fill();
  X.strokeStyle = `rgba(${tint},.35)`; X.lineWidth = 2; X.stroke();
  // cabeça
  g = X.createRadialGradient(-35, -40, 10, 0, 0, 125);
  g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.5, `rgba(${tint},.45)`); g.addColorStop(1, `rgba(${tint},.12)`);
  X.shadowColor = `rgba(${tint},.8)`; X.shadowBlur = 50;
  X.fillStyle = g; X.beginPath(); X.arc(0, 0, 120, 0, 7); X.fill();
  X.shadowBlur = 0; X.strokeStyle = 'rgba(255,255,255,.6)'; X.lineWidth = 2; X.stroke();
  if (face) eyesMouth(0, 0, 1, blink, smile);
  X.restore();
}

function eyesMouth(x, y, k, blink, smile) {
  X.save(); X.translate(x, y); X.scale(k, k);
  X.fillStyle = '#060606';
  const eh = 13 * (1 - blink) + 1.5;
  X.beginPath(); X.ellipse(-30, -10, 9, eh, 0, 0, 7); X.ellipse(30, -10, 9, eh, 0, 0, 7); X.fill();
  X.strokeStyle = '#060606'; X.lineWidth = 5; X.lineCap = 'round';
  X.beginPath();
  if (smile > 0) X.arc(0, 18, 20, Math.PI * (.15 + (1 - smile) * .3), Math.PI * (.85 - (1 - smile) * .3));
  else { X.moveTo(-10, 28); X.lineTo(10, 28); }
  X.stroke();
  X.restore();
}

// Gumercindo: esfera de vidro com aura verde
function gumer(x, y, r, t, o = {}) {
  const { a = 1, blink = 0, smile = 1, aura = 1 } = o;
  X.save(); X.globalAlpha *= a;
  glowBlob(x, y, r * 3.2, G, .35 * aura);
  // anéis pulsantes
  for (let i = 0; i < 3; i++) {
    const ph = ((t * .7 + i / 3) % 1);
    X.strokeStyle = `rgba(${G},${(1 - ph) * .5 * aura})`; X.lineWidth = 3;
    X.beginPath(); X.arc(x, y, r * (1.1 + ph * 1.1), 0, 7); X.stroke();
  }
  const g = X.createRadialGradient(x - r * .35, y - r * .4, r * .05, x, y, r);
  g.addColorStop(0, '#ffffff'); g.addColorStop(.45, mix(G, 1, .8)); g.addColorStop(.8, mix(G, 0, .25)); g.addColorStop(1, mix(G, 0, .7));
  X.shadowColor = GREEN; X.shadowBlur = r * .5;
  X.fillStyle = g; X.beginPath(); X.arc(x, y, r, 0, 7); X.fill();
  X.shadowBlur = 0;
  // brilho especular
  X.fillStyle = 'rgba(255,255,255,.55)';
  X.beginPath(); X.ellipse(x - r * .38, y - r * .5, r * .22, r * .1, -.6, 0, 7); X.fill();
  eyesMouth(x, y + r * .05, r / 110, blink, smile);
  X.restore();
}

// ícones simples
function icon(kind, x, y, s, col = '#06140a') {
  X.save(); X.translate(x, y); X.scale(s, s);
  X.fillStyle = col; X.strokeStyle = col; X.lineWidth = 5; X.lineCap = 'round'; X.lineJoin = 'round';
  X.beginPath();
  switch (kind) {
    case 'play': X.moveTo(-10, -16); X.lineTo(18, 0); X.lineTo(-10, 16); X.closePath(); X.fill(); break;
    case 'share':
      [[-14, 0], [14, -14], [14, 14]].forEach(([a, b]) => { X.moveTo(a + 6, b); X.arc(a, b, 6, 0, 7); }); X.fill();
      X.beginPath(); X.moveTo(-14, 0); X.lineTo(14, -14); X.moveTo(-14, 0); X.lineTo(14, 14); X.stroke(); break;
    case 'target':
      X.arc(0, 0, 20, 0, 7); X.stroke(); X.beginPath(); X.arc(0, 0, 10, 0, 7); X.stroke();
      X.beginPath(); X.arc(0, 0, 3.5, 0, 7); X.fill(); break;
    case 'chat':
      X.roundRect(-20, -17, 40, 28, 9); X.moveTo(-8, 11); X.lineTo(-14, 21); X.lineTo(2, 11); X.fill();
      X.strokeStyle = '#3dff5c'; X.lineWidth = 4; X.beginPath(); X.moveTo(-8, -3); X.lineTo(0, -3); X.moveTo(-8, -3); X.lineTo(-4, -8); X.moveTo(-8, -3); X.lineTo(-4, 2);
      X.moveTo(0, -3); X.quadraticCurveTo(10, -3, 9, 5); X.stroke(); break;
    case 'clock':
      X.arc(0, 0, 21, 0, 7); X.stroke(); X.beginPath(); X.moveTo(0, -12); X.lineTo(0, 0); X.lineTo(9, 6); X.stroke(); break;
    case 'plus': X.lineWidth = 6; X.moveTo(-15, 0); X.lineTo(15, 0); X.moveTo(0, -15); X.lineTo(0, 15); X.stroke(); break;
  }
  X.restore();
}

function check(x, y, k, a) {
  if (k <= 0) return;
  X.save(); X.globalAlpha *= a; X.translate(x, y); const s = back(cl(k)); X.scale(s, s);
  X.fillStyle = `rgba(${G},.15)`; X.strokeStyle = GREEN; X.lineWidth = 3;
  X.beginPath(); X.arc(0, 0, 24, 0, 7); X.fill(); X.stroke();
  X.lineWidth = 5; X.lineCap = 'round'; X.beginPath(); X.moveTo(-10, 1); X.lineTo(-3, 9); X.lineTo(11, -8); X.stroke();
  X.restore();
}

// ============================================================
//  CENAS — definidas no arquivo de cenas com scene(inicio, fim, fn)
// ============================================================
const SCENES = [];
function scene(a, b, fn) { SCENES.push({ a, b, fn }); }

// ============================================================
function render(t) {
  X.setTransform(1, 0, 0, 1, 0, 0);
  X.globalAlpha = 1; X.filter = 'none'; X.shadowBlur = 0; X.letterSpacing = '0px';
  X.fillStyle = '#040504'; X.fillRect(0, 0, W, H);
  for (const s of SCENES) {
    if (t < s.a || t >= s.b) continue;
    const lt = t - s.a, d = s.b - s.a;
    const isLast = s === SCENES[SCENES.length - 1];
    const fin = pr(lt, 0, .3), fout = isLast ? 1 - pr(lt, d - .45, d) : 1 - pr(lt, d - .28, d);
    const zoom = 1 + (1 - eo(fin)) * .04 + (isLast ? 0 : pr(lt, d - .28, d) * .06);
    X.save();
    X.globalAlpha = Math.min(fin, fout);
    X.translate(W / 2, H / 2); X.scale(zoom, zoom); X.translate(-W / 2, -H / 2);
    s.fn(lt, d);
    X.restore();
  }
  // vinheta + grão
  const v = X.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.6)');
  X.fillStyle = v; X.fillRect(0, 0, W, H);
  X.save(); X.globalCompositeOperation = 'overlay';
  X.fillStyle = X.createPattern(GRAIN[Math.floor(t * FPS) % 4], 'repeat'); X.fillRect(0, 0, W, H);
  X.restore();
}
