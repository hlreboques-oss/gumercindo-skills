// EXEMPLO COMPLETO: 'A terceira onda da IA / Gumercindo' (39s, 8 cenas)
// Use como modelo de ritmo, layout e animação.

// 1 — A TERCEIRA ONDA DA IA
scene(0, 4.2, (t) => {
  glowBlob(540, 1900, 1100, G, .22 * pr(t, 1.8, 2.6));
  glowBlob(540, 0, 900, '255,255,255', .06);
  grid(540, 1250, .9);
  particles(t, 40, '255,255,255', .5);
  txt('A TERCEIRA ONDA', 540, 430, { size: 104, t: pr(t, .15, .7) });
  txt('DA IA', 540, 590, { size: 210, color: GREEN, glow: 60, t: pr(t, .5, 1.05) });

  const waves = [
    { t0: .9, amp: 45, col: 'rgba(255,255,255,.35)', w: 3, k: .010 },
    { t0: 1.45, amp: 95, col: 'rgba(255,255,255,.6)', w: 4, k: .008 },
    { t0: 2.0, amp: 175, col: GREEN, w: 9, k: .0065, glow: 1 },
  ];
  const base = 1260;
  waves.forEach((wv, i) => {
    const q = eio(pr(t, wv.t0, wv.t0 + .9)); if (q <= 0) return;
    const xEnd = -40 + q * 1160;
    X.save(); X.strokeStyle = wv.col; X.lineWidth = wv.w; X.lineCap = 'round';
    if (wv.glow) { X.shadowColor = GREEN; X.shadowBlur = 35; }
    X.beginPath();
    let hx = 0, hy = 0;
    for (let x = -40; x <= xEnd; x += 6) {
      const y = base - wv.amp * Math.sin(x * wv.k + t * 1.6 + i) * Math.min(1, (x + 40) / 300);
      x === -40 ? X.moveTo(x, y) : X.lineTo(x, y); hx = x; hy = y;
    }
    X.stroke();
    if (wv.glow && q < 1) { X.fillStyle = '#fff'; X.shadowBlur = 40; X.beginPath(); X.arc(hx, hy, 14, 0, 7); X.fill(); }
    X.restore();
  });
  // rótulos 1ª 2ª 3ª
  ['1ª ONDA', '2ª ONDA', '3ª ONDA'].forEach((s, i) => {
    const q = pr(t, waves[i].t0 + .3, waves[i].t0 + .7); if (q <= 0) return;
    const x = 210 + i * 330, on = i === 2;
    X.save(); X.globalAlpha *= eo(q);
    rr(x - 135, 1580, 270, 92, 46);
    X.fillStyle = on ? GREEN : 'rgba(255,255,255,.06)'; if (on) { X.shadowColor = GREEN; X.shadowBlur = 40; } X.fill();
    X.shadowBlur = 0; X.strokeStyle = on ? GREEN : 'rgba(255,255,255,.25)'; X.lineWidth = 2; X.stroke();
    X.restore();
    txt(s, x, 1626, { size: 40, font: FB, color: on ? '#04140a' : 'rgba(255,255,255,.7)', t: q });
  });
});

// 2 — A ERA DOS SUPERFUNCIONÁRIOS
scene(4.2, 8.2, (t) => {
  glowBlob(540, 1250, 900, G, .28 + .06 * Math.sin(t * 4));
  glowBlob(540, 0, 700, G, .12);
  grid(540, 1250, .8);
  particles(t, 60, G, .7, 5);
  txt('A ERA DOS', 540, 320, { size: 76, font: FA, weight: 600, ls: 14, t: pr(t, .1, .55) });
  txt('SUPER', 540, 470, { size: 220, color: GREEN, glow: 70, t: pr(t, .35, .85) });
  txt('FUNCIONÁRIOS', 540, 640, { size: 150, t: pr(t, .6, 1.1) });

  const q = back(pr(t, .7, 1.4));
  const pw = pr(t, 1.6, 2.4);
  // raios de energia girando
  X.save(); X.translate(540, 1180); X.globalAlpha *= pw;
  for (let i = 0; i < 14; i++) {
    const an = i / 14 * Math.PI * 2 + t * .5;
    const g = X.createLinearGradient(0, 0, Math.cos(an) * 520, Math.sin(an) * 520);
    g.addColorStop(0, `rgba(${G},.35)`); g.addColorStop(1, `rgba(${G},0)`);
    X.strokeStyle = g; X.lineWidth = 16; X.beginPath(); X.moveTo(0, 0); X.lineTo(Math.cos(an) * 520, Math.sin(an) * 520); X.stroke();
  }
  X.restore();
  if (q > 0) figure(540, 1080 + (1 - q) * 80, 1.25 * (0.8 + .2 * q), { tint: pw > 0 ? G : '255,255,255', a: cl(q), blink: (t > 2.6 && t < 2.75) ? 1 : 0, smile: pw });
  // órbitas de "habilidades"
  for (let i = 0; i < 6; i++) {
    const k = pr(t, 1.8 + i * .12, 2.3 + i * .12); if (k <= 0) continue;
    const an = i / 6 * Math.PI * 2 + t * 1.1;
    const px = 540 + Math.cos(an) * 360, py = 1180 + Math.sin(an) * 140;
    X.save(); X.globalAlpha *= eo(k); X.fillStyle = GREEN; X.shadowColor = GREEN; X.shadowBlur = 30;
    X.beginPath(); X.arc(px, py, 14, 0, 7); X.fill(); X.restore();
  }
});

// 3 — PELA PRIMEIRA VEZ NA HISTÓRIA: grandes e pequenas, mesma tecnologia
scene(8.2, 13.2, (t) => {
  glowBlob(540, 950, 700, G, .18 * pr(t, 1.4, 2.2));
  glowBlob(540, 1920, 900, '255,255,255', .07);
  grid(540, 1100, .7);
  particles(t, 35, '255,255,255', .4, 9);
  txt('PELA PRIMEIRA VEZ', 540, 290, { size: 96, t: pr(t, .1, .55) });
  txt('NA HISTÓRIA', 540, 405, { size: 96, color: GREEN, glow: 40, t: pr(t, .35, .8) });

  const lit = eo(pr(t, 2.0, 2.8));
  const ground = 1420;
  // prédio grande
  const bq = eo(pr(t, .6, 1.3));
  const bh = 700 * bq;
  X.save();
  rr(150, ground - bh, 290, bh, 10);
  X.fillStyle = 'rgba(255,255,255,.05)'; X.fill();
  X.strokeStyle = `rgba(255,255,255,${.5 + .3 * lit})`; X.lineWidth = 3; X.stroke();
  X.beginPath(); X.rect(150, ground - bh, 290, bh); X.clip();
  for (let r = 0; r < 13; r++) for (let c = 0; c < 4; c++) {
    const wx = 178 + c * 64, wy = ground - 680 + r * 50;
    const on = rnd(r * 9 + c) < lit * 1.1;
    X.fillStyle = on ? `rgba(${G},.85)` : 'rgba(255,255,255,.12)';
    if (on) { X.shadowColor = GREEN; X.shadowBlur = 14; } else X.shadowBlur = 0;
    X.fillRect(wx, wy, 42, 28);
  }
  X.restore();
  // loja pequena
  const sq = eo(pr(t, .9, 1.5));
  X.save(); X.globalAlpha *= sq;
  const sx = 650, sw = 280, sh = 230;
  rr(sx, ground - sh, sw, sh, 8); X.fillStyle = 'rgba(255,255,255,.05)'; X.fill();
  X.strokeStyle = `rgba(255,255,255,${.5 + .3 * lit})`; X.lineWidth = 3; X.stroke();
  // toldo
  for (let i = 0; i < 7; i++) {
    X.fillStyle = i % 2 ? 'rgba(255,255,255,.75)' : (lit > .5 ? GREEN : 'rgba(255,255,255,.25)');
    X.beginPath(); X.moveTo(sx - 15 + i * 44, ground - sh - 10); X.lineTo(sx + 29 + i * 44, ground - sh - 10);
    X.lineTo(sx + 29 + i * 44, ground - sh + 40); X.arc(sx + 7 + i * 44, ground - sh + 40, 22, 0, Math.PI); X.fill();
  }
  X.fillStyle = lit > .5 ? `rgba(${G},.85)` : 'rgba(255,255,255,.12)';
  if (lit > .5) { X.shadowColor = GREEN; X.shadowBlur = 20; }
  X.fillRect(sx + 30, ground - 140, 110, 80); X.shadowBlur = 0;
  X.fillStyle = 'rgba(255,255,255,.18)'; X.fillRect(sx + 175, ground - 150, 70, 150);
  X.restore();
  // chão
  X.fillStyle = 'rgba(255,255,255,.3)'; X.fillRect(90, ground, 900 * eo(pr(t, .5, 1.1)), 3);

  txt('GRANDE EMPRESA', 295, 1478, { size: 34, font: FA, weight: 700, ls: 3, color: 'rgba(255,255,255,.8)', t: pr(t, 1.2, 1.6) });
  txt('PEQUENA EMPRESA', 790, 1478, { size: 34, font: FA, weight: 700, ls: 3, color: 'rgba(255,255,255,.8)', t: pr(t, 1.35, 1.75) });

  // núcleo de IA + feixes iguais para os dois
  const oq = back(pr(t, 1.3, 1.8));
  if (oq > 0) {
    const ox = 545, oy = 880;
    const targets = [[440, 1000], [790, ground - sh - 15]];
    const bq2 = pr(t, 1.7, 2.3);
    targets.forEach(([tx, ty]) => {
      X.save(); X.strokeStyle = GREEN; X.lineWidth = 5; X.shadowColor = GREEN; X.shadowBlur = 25;
      X.setLineDash([18, 16]); X.lineDashOffset = -t * 90;
      X.beginPath(); X.moveTo(ox, oy); X.lineTo(lerp(ox, tx, bq2), lerp(oy, ty, bq2)); X.stroke(); X.restore();
    });
    X.save(); X.translate(ox, oy); X.scale(oq, oq);
    glowBlob(0, 0, 200, G, .6);
    X.fillStyle = '#fff'; X.shadowColor = GREEN; X.shadowBlur = 50; X.beginPath(); X.arc(0, 0, 46, 0, 7); X.fill();
    X.shadowBlur = 0; X.fillStyle = '#062010'; X.font = `40px ${FB}`; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('IA', 0, 2);
    X.restore();
  }
  txt('TÊM ACESSO À', 540, 1640, { size: 64, font: FA, weight: 600, ls: 6, t: pr(t, 2.6, 3.0) });
  txtParts([['MESMA ', GREEN, 40], ['TECNOLOGIA', '#fff']], 540, 1760, { size: 112, t: pr(t, 2.9, 3.35) });
});

// 4 — VÁRIOS FUNCIONÁRIOS, INDEPENDENTE DO PORTE
scene(13.2, 17.4, (t) => {
  glowBlob(540, 1050, 900, G, .16);
  grid(540, 1050, .7);
  particles(t, 30, G, .5, 13);
  txt('VÁRIOS FUNCIONÁRIOS', 540, 300, { size: 104, t: pr(t, .1, .5) });
  txt('executando funções na empresa', 540, 410, { size: 58, font: FA, weight: 400, color: 'rgba(255,255,255,.75)', t: pr(t, .35, .75) });
  const cols = 4, rows = 4;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = r * cols + c;
    const k = pr(t, .5 + i * .07, .9 + i * .07); if (k <= 0) continue;
    const x = 195 + c * 230, y = 600 + r * 225;
    const s = back(k) * .42;
    figure(x, y, s, { tint: G, a: cl(k), face: true, smile: 1, blink: rnd(i) > .7 && ((t * 2 + i) % 3) < .15 ? 1 : 0 });
    // barra de tarefa
    const fill = cl((t - .9 - i * .07) * (0.6 + rnd(i * 4) * .7) % 1.15);
    X.save(); X.globalAlpha *= cl(k);
    rr(x - 75, y + 140, 150, 12, 6); X.fillStyle = 'rgba(255,255,255,.12)'; X.fill();
    rr(x - 75, y + 140, 150 * fill, 12, 6); X.fillStyle = GREEN; X.shadowColor = GREEN; X.shadowBlur = 12; X.fill();
    X.restore();
  }
  txt('INDEPENDENTE DO PORTE', 540, 1580, { size: 84, color: GREEN, glow: 40, t: pr(t, 1.9, 2.35) });
  txt('da sua empresa', 540, 1690, { size: 60, font: FA, weight: 400, color: 'rgba(255,255,255,.8)', t: pr(t, 2.1, 2.55) });
});

// 5 — CARLOS JÚNIOR CRIOU O GUMERCINDO
scene(17.4, 21.6, (t) => {
  const ph2 = t > 1.85;
  if (!ph2) {
    glowBlob(540, 820, 800, '255,255,255', .1);
    grid(540, 820, .6);
    particles(t, 30, '255,255,255', .5, 21);
    logo(540, 760, 560, eo(pr(t, .1, .6)), 40, eio(pr(t, .1, .9)));
    txt('CARLOS JÚNIOR', 540, 1110, { size: 84, font: FC, weight: 700, ls: 10, t: pr(t, .55, 1.0) });
    txt('criou o...', 540, 1260, { size: 64, font: FA, weight: 400, color: 'rgba(255,255,255,.75)', t: pr(t, 1.0, 1.4) });
  } else {
    const lt = t - 1.85;
    glowBlob(540, 860, 1100, G, .3);
    grid(540, 860, .8);
    particles(t, 70, G, .8, 23);
    const q = back(pr(lt, 0, .5));
    gumer(540, 860, 230 * q, t, { blink: (lt > 1.2 && lt < 1.32) ? 1 : 0, smile: eo(pr(lt, .3, .8)) });
    txt('GUMERCINDO', 540, 1380, { size: 170, color: GREEN, glow: 70, t: pr(lt, .15, .55) });
    txt('o superfuncionário de IA', 540, 1500, { size: 56, font: FA, weight: 600, color: 'rgba(255,255,255,.85)', t: pr(lt, .45, .85) });
    // flash de impacto
    const f = 1 - pr(lt, 0, .35);
    if (f > 0) { X.fillStyle = `rgba(220,255,225,${f * .85})`; X.fillRect(0, 0, W, H); }
  }
});

// 6 — O QUE O GUMERCINDO FAZ
const ITEMS = [
  ['play', 'Gera vídeos como este', 'e edita tudo sozinho'],
  ['share', 'Posta em 3 redes sociais', 'no automático'],
  ['target', 'Capta novos clientes', 'no LinkedIn e no Instagram'],
  ['chat', 'Recupera vendas', 'direto no WhatsApp'],
  ['clock', 'Atendimento 24h por dia', 'todos os dias, sem pausa'],
  ['plus', 'Entre várias outras funções', 'dentro da sua empresa'],
];
scene(21.6, 30.2, (t) => {
  glowBlob(540, 0, 900, G, .2);
  glowBlob(540, 1920, 800, G, .12 * pr(t, 6.5, 7.2));
  grid(540, 300, .6);
  particles(t, 30, G, .4, 31);
  const hq = pr(t, .1, .6);
  gumer(185, 300, 95 * back(hq), t, { a: cl(hq), blink: ((t % 3.3) < .12) ? 1 : 0, aura: .7 });
  txt('O GUMERCINDO', 330, 262, { size: 52, color: GREEN, align: 'left', glow: 25, maxW: 700, t: pr(t, .25, .65) });
  txt('HOJE FAZ:', 330, 338, { size: 92, align: 'left', maxW: 700, t: pr(t, .4, .8) });

  ITEMS.forEach(([ic, title, sub], i) => {
    const t0 = .9 + i * 1.12;
    const k = pr(t, t0, t0 + .5); if (k <= 0) return;
    const y = 500 + i * 182, x0 = 80, w = 920, h = 150;
    const off = (1 - back(k)) * 260;
    X.save(); X.globalAlpha *= cl(k * 1.4); X.translate(off, 0);
    const active = t < t0 + 1.12 || i === ITEMS.length - 1;
    rr(x0, y, w, h, 28);
    X.fillStyle = active ? `rgba(${G},.12)` : 'rgba(255,255,255,.05)'; X.fill();
    X.strokeStyle = active ? `rgba(${G},.85)` : 'rgba(255,255,255,.18)'; X.lineWidth = active ? 3 : 2;
    if (active) { X.shadowColor = GREEN; X.shadowBlur = 30; } X.stroke(); X.shadowBlur = 0;
    // ícone
    X.fillStyle = GREEN; X.shadowColor = GREEN; X.shadowBlur = 25;
    X.beginPath(); X.arc(x0 + 90, y + h / 2, 48, 0, 7); X.fill(); X.shadowBlur = 0;
    icon(ic, x0 + 90, y + h / 2, 1.15);
    X.textAlign = 'left'; X.textBaseline = 'middle';
    X.font = `700 ${fitSize(title, FA, 48, 640, 0, 700)}px ${FA}`; X.letterSpacing = '0px';
    X.fillStyle = '#fff'; X.fillText(title, x0 + 170, y + 56);
    X.font = `400 36px ${FA}`; X.fillStyle = 'rgba(255,255,255,.62)'; X.fillText(sub, x0 + 170, y + 104);
    X.restore();
    check(x0 + w - 60 + off, y + h / 2, pr(t, t0 + .45, t0 + .8), cl(k));
  });
  txtParts([['TUDO ISSO ', '#fff'], ['24/7', GREEN, 40]], 540, 1660, { size: 104, t: pr(t, 7.4, 7.85) });
});

// 7 — DIA 31: SALA DE IMPLEMENTAÇÃO
scene(30.2, 34.6, (t) => {
  glowBlob(540, 820, 900, G, .25 + .05 * Math.sin(t * 5));
  grid(540, 820, .8);
  particles(t, 50, G, .6, 41);
  txt('E NO PRÓXIMO', 540, 270, { size: 92, t: pr(t, .1, .5) });
  const q = back(pr(t, .35, .95));
  if (q > 0) {
    X.save(); X.translate(540, 800); X.scale(1, Math.max(.001, q)); X.globalAlpha *= cl(q);
    const w = 500, h = 560;
    X.shadowColor = GREEN; X.shadowBlur = 80;
    rr(-w / 2, -h / 2, w, h, 44); X.fillStyle = '#0b120c'; X.fill(); X.shadowBlur = 0;
    X.strokeStyle = `rgba(${G},.9)`; X.lineWidth = 4; X.stroke();
    X.save(); rr(-w / 2, -h / 2, w, 140, [44, 44, 0, 0]); X.fillStyle = GREEN; X.fill(); X.restore();
    // argolas
    X.fillStyle = '#e8ffe9'; [-140, 140].forEach(ax => { rr(ax - 14, -h / 2 - 34, 28, 70, 14); X.fill(); });
    X.fillStyle = '#04140a'; X.font = `76px ${FB}`; X.textAlign = 'center'; X.textBaseline = 'middle'; X.letterSpacing = '10px';
    X.fillText('DIA', 5, -h / 2 + 74);
    X.letterSpacing = '0px'; X.font = `330px ${FB}`; X.fillStyle = '#fff';
    X.shadowColor = GREEN; X.shadowBlur = 50 + 20 * Math.sin(t * 6); X.fillText('31', 0, 85);
    X.shadowBlur = 0; X.fillText('31', 0, 85);
    X.restore();
  }
  txt('VAI ACONTECER A', 540, 1220, { size: 58, font: FA, weight: 600, ls: 6, color: 'rgba(255,255,255,.8)', t: pr(t, 1.1, 1.5) });
  txt('SALA DE', 540, 1340, { size: 112, t: pr(t, 1.3, 1.7) });
  txt('IMPLEMENTAÇÃO', 540, 1470, { size: 140, color: GREEN, glow: 50, t: pr(t, 1.5, 1.9) });
  txt('DO GUMERCINDO', 540, 1600, { size: 100, t: pr(t, 1.7, 2.1) });
});

// 8 — CTA: CLICA NO LINK DA BIO
scene(34.6, 39, (t) => {
  glowBlob(540, 1000, 900, G, .25);
  grid(540, 1000, .7);
  particles(t, 50, G, .6, 51);
  txt('CLICA NO', 540, 420, { size: 120, t: pr(t, .1, .5) });
  txt('LINK DA BIO', 540, 570, { size: 160, color: GREEN, glow: 60, t: pr(t, .3, .7) });
  txt('para mais informações', 540, 690, { size: 54, font: FA, weight: 400, color: 'rgba(255,255,255,.8)', t: pr(t, .5, .9) });

  // botão
  const bq = back(pr(t, .7, 1.2));
  const tap = t - 1.9; // momento do clique
  const pScale = 1 - (tap > 0 && tap < .3 ? Math.sin(tap / .3 * Math.PI) * .06 : 0);
  if (bq > 0) {
    X.save(); X.translate(540, 960); X.scale(bq * pScale, bq * pScale);
    X.shadowColor = GREEN; X.shadowBlur = 70 + 25 * Math.sin(t * 5);
    rr(-380, -85, 760, 170, 85); X.fillStyle = GREEN; X.fill(); X.shadowBlur = 0;
    X.fillStyle = '#04140a'; X.font = `58px ${FB}`; X.textAlign = 'center'; X.textBaseline = 'middle'; X.letterSpacing = '0px';
    X.fillText('QUERO PARTICIPAR', 0, 4);
    X.restore();
    // ondas do clique
    for (let i = 0; i < 2; i++) {
      const rq = pr(tap, i * .2, .9 + i * .2); if (rq <= 0 || rq >= 1) continue;
      X.save(); X.strokeStyle = `rgba(${G},${1 - rq})`; X.lineWidth = 4;
      rr(540 - 360 - rq * 120, 960 - 85 - rq * 120, 720 + rq * 240, 170 + rq * 240, 85 + rq * 120); X.stroke(); X.restore();
    }
  }
  // cursor/mão
  const cq = eio(pr(t, 1.2, 1.85));
  if (cq > 0) {
    const cx = lerp(900, 640, cq), cy = lerp(1300, 990, cq) + (tap > 0 && tap < .3 ? Math.sin(tap / .3 * Math.PI) * 12 : 0);
    X.save(); X.translate(cx, cy); X.globalAlpha *= cl(cq * 2) * (1 - pr(t, 3.0, 3.4));
    X.fillStyle = '#fff'; X.strokeStyle = '#04140a'; X.lineWidth = 4; X.shadowColor = 'rgba(0,0,0,.6)'; X.shadowBlur = 20;
    X.beginPath(); X.moveTo(0, 0); X.lineTo(0, 92); X.lineTo(24, 70); X.lineTo(42, 110); X.lineTo(58, 102); X.lineTo(40, 64); X.lineTo(72, 62); X.closePath();
    X.fill(); X.shadowBlur = 0; X.stroke(); X.restore();
  }
  // assinatura
  logo(540, 1450, 300, eo(pr(t, 1.0, 1.5)), 30);
  txt('CARLOS JÚNIOR', 540, 1660, { size: 64, font: FC, weight: 700, ls: 8, t: pr(t, 1.2, 1.6) });
});
