// Renderiza a página em MP4 (sem áudio) ou gera quadros de prévia.
// uso: node render.js <pagina.html> <saida.mp4>
//      node render.js <pagina.html> <prefixo_previa> --frames 2.5,6,11   (salva JPGs nesses segundos)
const path = require('path'), fs = require('fs'), { spawn } = require('child_process');
let pw; try { pw = require(path.resolve(__dirname, '../node_modules/playwright')); } catch { pw = require('playwright'); }
(async () => {
  const [page, out, flag, list] = process.argv.slice(2);
  const times = flag === '--frames' ? list.split(',').map(Number) : null;
  const b = await pw.chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.error('ERRO NA PÁGINA:', e.message));
  await p.goto('file://' + path.resolve(page) + '?render'); await p.waitForFunction('window.READY', null, { timeout: 30000 });
  const grab = t => p.evaluate(t => { render(t); return C.toDataURL('image/jpeg', .94).split(',')[1]; }, t);
  if (times) { for (const t of times) { const f = `${out}_${t}.jpg`; fs.writeFileSync(f, Buffer.from(await grab(t), 'base64')); console.log(f); } await b.close(); return; }
  const dur = await p.evaluate('DUR'), N = Math.round(dur * 30);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < N; i++) { const buf = Buffer.from(await grab(i / 30), 'base64'); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (i % 150 == 0) console.log(`quadro ${i}/${N}`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('vídeo:', out, `(${dur}s)`);
})();
