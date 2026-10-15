// Monta uma página HTML autônoma (fontes embutidas) a partir do motor + arquivo de cenas.
// uso: node build.js <cenas.js> <saida.html> [logo.js]
const fs = require('fs'), path = require('path');
const DIR = path.resolve(__dirname, '..');
const [scenesFile, out, logoFile] = process.argv.slice(2);
if (!scenesFile || !out) { console.log('uso: node build.js <cenas.js> <saida.html> [logo.js]'); process.exit(1); }
const F = path.join(DIR, 'node_modules/@fontsource/');
const b64 = p => fs.readFileSync(p).toString('base64');
const fonts = [['Archivo', 400, 'archivo/files/archivo-latin-400-normal.woff2'], ['Archivo', 600, 'archivo/files/archivo-latin-600-normal.woff2'],
  ['Archivo', 700, 'archivo/files/archivo-latin-700-normal.woff2'], ['ArchivoBlack', 400, 'archivo-black/files/archivo-black-latin-400-normal.woff2'],
  ['Cinzel', 700, 'cinzel/files/cinzel-latin-700-normal.woff2']];
const css = fonts.map(([n, w, p]) => `@font-face{font-family:"${n}";font-weight:${w};src:url(data:font/woff2;base64,${b64(F + p)}) format("woff2")}`).join('\n');
const logo = logoFile ? fs.readFileSync(logoFile, 'utf8') : 'const LOGO_D="";const LOGO_BB=[0,0,1,1];';
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${path.basename(out, '.html')}</title><style>${css}
html,body{margin:0;height:100%;background:#000;overflow:hidden}
#c{position:absolute;inset:0;margin:auto;height:100vh;width:auto;max-width:100vw;aspect-ratio:9/16;display:block;cursor:pointer}
#bar{position:fixed;left:0;bottom:0;height:4px;background:#3dff5c;width:0} body.render #bar{display:none}</style></head>
<body><canvas id="c"></canvas><div id="bar"></div>
<script>${logo}</script>
<script>${fs.readFileSync(path.join(DIR, 'engine/engine.js'), 'utf8')}</script>
<script>${fs.readFileSync(scenesFile, 'utf8')}</script>
<script>
DUR = Math.max(...SCENES.map(s => s.b)); window.render = render; window.DUR = DUR; window.FPS = FPS;
(async () => {
  await Promise.all([['Archivo',400],['Archivo',600],['Archivo',700],['ArchivoBlack',400],['Cinzel',700]].map(([n,w]) => document.fonts.load(w+' 40px "'+n+'"','AÁÚÇÊ')));
  window.READY = true;
  if (location.search.includes('render')) { document.body.classList.add('render'); return; }
  let t0 = performance.now(), paused = false, pt = 0;
  C.onclick = () => { paused = !paused; if (!paused) t0 = performance.now() - pt * 1000; };
  (function loop(now) { if (!paused) { pt = ((now - t0) / 1000) % DUR; render(pt); document.getElementById('bar').style.width = (pt / DUR * 100) + '%'; } requestAnimationFrame(loop); })(performance.now());
})();
</script></body></html>`;
fs.writeFileSync(out, html); console.log('HTML gerado:', out);
