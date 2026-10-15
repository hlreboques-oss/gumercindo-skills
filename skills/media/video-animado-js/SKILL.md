---
name: video-animado-js
description: Cria vídeos verticais animados (Reels, Stories, TikTok, Shorts; 1080x1920 MP4 com trilha) a partir de um roteiro ou texto falado, com motion graphics em JavaScript/Canvas no estilo neon escuro. Use quando pedirem um vídeo animado, motion, reels, story, vídeo de anúncio, vídeo de lançamento ou de evento, "cria um vídeo citando...", ou "faz um vídeo igual ao do Gumercindo".
---

# Vídeo animado em JavaScript (9:16)

Transforma um texto/roteiro em um vídeo vertical animado: tipografia cinética, brilho neon,
grade, partículas, personagens de vidro, ícones e cards. Tudo é desenhado em Canvas por
JavaScript, gravado quadro a quadro (Chromium headless + ffmpeg) e recebe uma trilha
eletrônica sintetizada (sem direitos autorais).

Resultado: `nome.mp4` (pronto para postar) + `nome.html` (animação que roda no navegador).

## Estrutura da skill

```
engine/engine.js            motor: utilitários de desenho, transições, render(t)
exemplos/terceira_onda_gumercindo.js   vídeo completo de referência (8 cenas, 39s). LEIA ANTES de escrever cenas novas
assets/logo_carlos_junior.js  emblema do Carlos Júnior já vetorizado (use em vídeos da marca)
scripts/setup.sh            instala dependências (uma vez)
scripts/build.js            cenas.js -> página HTML autônoma
scripts/render.js           HTML -> MP4 mudo, ou quadros JPG de prévia
scripts/music.js            gera a trilha .wav sincronizada com os cortes
scripts/trace_logo.py       vetoriza qualquer logo (PNG/JPG) para logo.js
scripts/make_video.sh       pipeline completo (build + render + trilha + mux)
```

Requisitos: Node 18+, Python 3, ffmpeg. Na primeira vez: `bash scripts/setup.sh`.

**Rodando fora da pasta da skill**: `build.js`/`render.js`/`make_video.sh` fazem `require` de pacotes npm (Playwright etc.) relativos ao diretório de trabalho atual, não ao diretório da skill. Se for gerar o vídeo em outra pasta (ex.: pasta do projeto do cliente), copie `node_modules/` e `package.json` da skill para essa pasta antes de rodar os scripts — senão o build falha por módulo não encontrado.

## Fluxo de trabalho

### 1. Roteiro → lista de cenas
Quebre o texto do pedido em **cenas de 3,5 a 5 segundos**, uma ideia por cena.
Cenas com lista (por exemplo, "o que o produto faz") podem durar de 7 a 9s, com cerca de 1,1s por item.
Total ideal: de 30 a 45s. Escreva primeiro a tabela de cenas (início, fim, texto em tela, visual):

| # | tempo | texto em tela | visual |
|---|---|---|---|
| 1 | 0–4.2 | A TERCEIRA ONDA / DA IA | 3 ondas subindo, a 3ª verde |
| … | … | … | … |
| último | ~4,5s | CTA (ex.: CLICA NO LINK DA BIO) | botão + cursor clicando + logo |

Regras de texto:
- Texto em tela é **manchete**, não legenda: no máximo 2 a 4 palavras por linha e 2 ou 3 linhas por cena.
- Destaque 1 palavra-chave por cena na cor de destaque com brilho (`color: GREEN, glow: 40-70`).
- Use **apenas** as informações do pedido. Se precisar inventar uma frase de apoio (subtítulo, texto
  de botão), mantenha-a neutra e **avise no final** quais textos foram acrescentados.
- Acentuação correta em português (as fontes suportam Á, Ê, Ç, Ã etc.).
- A última cena sempre tem o CTA pedido + a assinatura (logo/nome).

### 2. Escrever o arquivo de cenas
Crie `cenas.js` copiando a estrutura de `exemplos/terceira_onda_gumercindo.js`. Cada cena:

```js
scene(INICIO, FIM, (t) => {          // t = segundos desde o início da cena
  glowBlob(540, 1000, 900, G, .25);  // brilho de fundo (G = rgb da cor de destaque)
  grid(540, 1000, .7);               // grade com fade radial
  particles(t, 40, G, .6, 7);        // partículas subindo (seed diferente por cena)
  txt('TÍTULO', 540, 400, { size: 110, t: pr(t, .1, .5) });                    // entra entre 0,1s e 0,5s
  txt('DESTAQUE', 540, 540, { size: 150, color: GREEN, glow: 60, t: pr(t, .3, .7) });
  // ... visual principal, animado com pr()/eo()/back()
});
```

As cenas devem ser contíguas (o fim de uma é o início da próxima). O fade e o zoom entre cenas
são automáticos, e a duração total é calculada sozinha.

### 3. Prévia (obrigatória antes de renderizar)
```bash
node scripts/build.js cenas.js video.html [assets/logo.js]
node scripts/render.js video.html previa/f --frames 3,7,11,15,19,25,32,37   # ~1 quadro no "meio" de cada cena
ffmpeg -v error -y -pattern_type glob -i 'previa/f_*.jpg' -vf "scale=360:-1,tile=4x2" -frames:v 1 previa/folha.jpg
```
Abra `previa/folha.jpg` e confira com o **checklist de qualidade** abaixo. Corrija e repita até passar.
Escolha tempos em que todos os elementos da cena já entraram (fim da cena menos 0,5s).

### 4. Render final
```bash
bash scripts/make_video.sh cenas.js nome_do_video [assets/logo.js] "4.2,8.2,13.2,..." "19.25,30.55"
```
- 4º argumento: inícios de cada cena a partir da 2ª (gera um *whoosh* em cada corte).
- 5º argumento: momentos de impacto, ou seja, as grandes revelações (nome do produto, data).
Renderizar leva cerca de 3 min para 40s de vídeo. Depois, extraia 6 a 8 quadros do MP4 final e confira mais uma vez.

### 5. Entrega
Entregue `nome_do_video.mp4` (e o `.html`, se for útil). Na mensagem, informe: duração, a ordem das cenas
em uma linha, **quais textos foram acrescentados por você** e que a trilha é original/sintetizada.
Se houver narração, as cenas seguem a ordem do texto, e quem for gravar pode se guiar pelos tempos da tabela.

Para Telegram, verifique o tamanho antes de dizer que enviou: se passar de ~50 MB, gere também uma versão compactada (`libx264`, `crf 25–28`, áudio AAC 128k) ou sirva por link privado/temporário e valide que o arquivo final existe. Não reenvie repetidamente um MP4 acima do limite quando o usuário disser que não chegou.

## Referência do motor (engine.js)

Tela: `W=1080`, `H=1920`. Centro horizontal: `x=540`.
**Área segura:** mantenha textos importantes entre `y=220` e `y=1750` e entre `x=80` e `x=1000`
(a interface do Reels/TikTok cobre o topo, a base e a lateral direita).

Tempo e easing:
- `pr(t, a, b)` → progresso 0..1 entre os segundos a e b (use em tudo que anima)
- `eo(x)` ease-out · `eio(x)` ease-in-out · `back(x)` com "overshoot" (para pop) · `lerp(a,b,k)` · `cl(v)` clamp · `rnd(i)` aleatório determinístico

Texto:
- `txt(str, x, y, {size, font, weight, color, glow, align, t, ls, maxW})`
  - entra subindo, com desfoque e fade conforme `t` (0..1)
  - **encolhe sozinho** para caber em `maxW` (padrão 960)
  - fontes: `FB` (Archivo Black, títulos, padrão), `FA` + `weight: 400|600|700` (Archivo, subtítulos), `FC` + `weight: 700` (Cinzel, nome/assinatura elegante)
  - `ls` = espaçamento entre letras (px)
- `txtParts([['MESMA ', GREEN, 40], ['TECNOLOGIA', '#fff']], x, y, {size, t})`: uma linha com várias cores

Fundo e efeitos:
- `glowBlob(x, y, raio, rgb, alpha)` brilho radial · `grid(x, y, alpha, escala)` · `particles(t, n, rgb, alpha, seed)`
- vinheta e granulação são aplicadas automaticamente em todo quadro

Elementos prontos:
- `logo(x, y, largura, alpha, glow, revelacao)`: emblema vetorizado; `revelacao` de 0 a 1 faz uma varredura de baixo para cima
- `figure(x, y, escala, {tint, a, face, blink, smile})`: personagem de vidro (cabeça + ombros), útil para "pessoa/funcionário"
- `gumer(x, y, raio, t, {a, blink, smile, aura})`: esfera-mascote com rosto e aura pulsante (o "agente de IA")
- `icon(tipo, x, y, escala, cor)`: `'play' | 'share' | 'target' | 'chat' | 'clock' | 'plus'`
- `check(x, y, progresso, alpha)`: selo de concluído com pop
- `rr(x, y, w, h, raio)`: retângulo arredondado (depois chame `X.fill()` / `X.stroke()`)
- `X` é o contexto 2D do Canvas: desenhe qualquer coisa nova com a API normal de Canvas, usando `X.save()` / `X.restore()`

Cores: `GREEN` (hex) e `G` (rgb em texto, por exemplo `'61,255,92'`), além de `RED` (rgb). Para outra marca, chame
`setAccent('#ffb800')` na primeira linha do arquivo de cenas.

Padrões de animação que funcionam (todos estão no exemplo):
- **Pop** de elemento: `const q = back(pr(t, a, a+.5)); X.scale(q, q)`
- **Lista de cards** entrando da direita, um a cada ~1,1s, com check e destaque do item ativo
- **Linha desenhada progressivamente** (ondas e gráficos): desenhe até `x = lerp(início, fim, eio(pr(...)))`
- **Feixe tracejado animado** ligando elementos: `X.setLineDash([18,16]); X.lineDashOffset = -t*90`
- **Revelação com flash**: na troca de fase dentro da cena, pinte `rgba(220,255,225, f)` na tela com `f` caindo de 1 para 0 em 0,35s
- **Calendário/data**: card com `X.scale(1, back(q))` (efeito de virar) e um número gigante com brilho pulsante
- **CTA**: botão em pílula brilhante + cursor deslizando + ondas de clique + logo e nome embaixo

## Checklist de qualidade (conferir na folha de prévia)
- [ ] Nenhum texto cortado ou saindo da tela; nada importante fora da área segura
- [ ] Texto legível no celular: títulos ≥ 90px, subtítulos ≥ 50px, textos de card ≥ 36px
- [ ] Ortografia e acentos corretos; nomes próprios exatamente como no pedido
- [ ] Uma palavra de destaque por cena (não pintar tudo de verde)
- [ ] Elementos não se sobrepõem (texto em cima de personagem ou de prédio)
- [ ] O logo aparece correto (se surgir um retângulo branco, revetorize com `--invert`)
- [ ] A última cena tem o CTA pedido, legível por pelo menos 2,5s
- [ ] No MP4 final: duração correta, áudio presente (`ffprobe`), transições sem quadro preto longo

## Misturar com vídeo real (tela dividida / canto da tela)
Quando o pedido é mesclar essa animação com uma filmagem real (pessoa falando, narração própria), **não** tente dar transparência ao Canvas — o motor sempre pinta um fundo sólido (`X.fillStyle = '#040504'`) e não suporta alpha. Em vez disso:
1. Transcreva ou leia a fala primeiro e quebre a animação em cenas sincronizadas com o que a pessoa está dizendo; a metade animada deve representar a fala, não ser decoração genérica. Faça os ícones/visuais entrarem cerca de **0,3–0,5s antes** da fala-chave, porque se entrarem exatamente no tempo da frase o resultado parece atrasado.
2. Escreva as cenas gráficas normalmente (podem ficar num `cenas.js` separado, só com os trechos que vão virar fundo/painel). Para vídeos comerciais locais, use a paleta/logotipo da marca e ícones concretos do negócio: loja, produtos, casa, elétrica/hidráulica, solução etc. Em trechos de fala real, crie **um ícone/visual diferente por ideia falada**; não deixe um desenho parado enquanto a fala muda, pois Carlos percebe isso como automação atrasada ou pouco conectada à narração.
3. Renderize esse `cenas.js` para um MP4 cheio em 1080x1920 (pipeline normal: `build.js` + `render.js`).
4. Componha no `ffmpeg`, fora da skill:
   - **Tela dividida vertical 50/50 para Carlos**: quando ele pede “parte de cima/parte de baixo”, deixe a animação na metade superior e o vídeo real na metade inferior, cada uma com ~960px de altura. Não deixe a animação ocupar quase tudo nem reduza demais o falante; isso foi percebido como pouco profissional. Renderize a animação cheia e use a faixa superior (`crop=1080:960:0:0` ou recorte equivalente). Para o vídeo real embaixo, use `scale/crop` ou `contain` com fundo desfocado para preservar rosto/corpo e manter 1080x960.
   - **Tela dividida lateral**: `crop` a filmagem real para metade da largura (ex.: `crop=540:1920:0:0`) e o gráfico renderizado para a outra metade (`scale=540:1920:force_original_aspect_ratio=decrease,pad=540:1920:(ow-iw)/2:(oh-ih)/2:color=0x040504` para não cortar os ícones), depois `hstack`.
   - **Pessoa num canto (PIP)**: gráfico como fundo cheio, `overlay` da filmagem real reduzida (`scale=360:640`) num canto (`overlay=x=...:y=...`).
   - Mantenha o áudio original da filmagem (`-map 0:a`) como narração; não gere trilha sintetizada nesses trechos, salvo pedido explícito. Normalize/limite o áudio na muxagem se estiver baixo.
5. Se houver logo enviado pelo usuário, aplique-o como badge discreto na área do vídeo real ou vetorize com `trace_logo.py`; não deixe o logo cobrir rosto ou produto.
6. Para casar a paleta com uma referência visual (ex.: print/vídeo que o usuário mandou), tire um contact sheet da referência, descreva a paleta com visão, e troque só a cor via `setAccent('#hex')` — não recrie marca/personagem alheio, use os elementos próprios do motor (`gumer`, `figure`, ícones).
7. QA obrigatório: gere uma folha do MP4 final, não só da animação, e amostre frames nos limites de cada fala/ícone (não apenas tempos regulares). Confirme que a divisão está equilibrada, o falante continua visível, a marca aparece, o texto da animação é legível no celular e a animação acompanha a fala sem parecer atrasada. Se Carlos disser que a automação/desenho está atrasado, não defenda o corte: re-sincronize antecipando os visuais e trocando o ícone/arte em cada mudança de ideia falada.

## Logo de outra marca
```bash
python3 scripts/trace_logo.py logo.png assets/logo_cliente.js --crop-bottom 0.75   # corta o texto do nome, se houver
```
Prefira escrever o nome com `txt(..., {font: FC, weight: 700, ls: 8})` em vez de vetorizar letras pequenas.
Para logo escuro sobre fundo claro, use `--invert`.

## Problemas comuns
- **Fonte errada ou texto minúsculo**: use `font: FA, weight: 600` (nunca coloque o peso dentro da string da fonte).
- **`ERRO NA PÁGINA`** no render: erro de JS no `cenas.js`; a mensagem indica a linha.
- **Chromium não encontrado**: `npx playwright install chromium`, ou defina `CHROMIUM_PATH=/usr/bin/chromium`.
- **Render lento**: é normal (cerca de 6 quadros/s). Não reduza a qualidade; renderize uma vez só, depois da prévia aprovada.
