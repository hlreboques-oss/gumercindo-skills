# Limpeza do acervo de vídeos

Vídeo é o ativo que mais ocupa disco nesta operação: cada entrega deixa o bruto, os clipes intermediários, os
renders descartados e os finais — e um acervo de poucos meses chega a centenas de arquivos. A regra é
**inventariar → deixar o Carlos marcar → arquivar os finais no Drive → apagar por lote**, nunca apagar por conta
própria a partir de uma lista que só você viu.

## Quando usar

- "A VPS está cheia", "preciso liberar espaço", "tem vídeo demais".
- Antes de instalar qualquer coisa que precise de alguns GB.
- Quando ele pede para separar o que já foi entregue do que ainda vai ser editado.

## 1. Inventariar antes de tocar em nada

Liste todos os vídeos com metadados e miniatura, em paralelo (ThreadPoolExecutor, 8 workers, `ffprobe` +
`ffmpeg -ss 1 -frames:v 1 -vf scale=320:-2`). Grave um `videos.json` com `path, rel, folder, size, mtime, date,
duration, res, thumb`. Miniaturas são o que torna a revisão possível: sem elas o usuário não reconhece nada.

Pule `/root/.cache` e `/var/lib/docker` no walk. Um acervo típico desta VPS: ~700 arquivos / ~7 GB.

## 2. Publicar a galeria (o passo que evita o desastre)

Suba um servidor Python minúsculo em `127.0.0.1:<porta>` e exponha por nginx + certbot, igual aos outros sites.
A página precisa de:

- seção **Mais recentes** no topo (últimos ~10 dias) e uma seção por projeto reconhecível (pasta com `flow`,
  `hardcopy`, `omni_flash`) — ordenar as pastas por tamanho enterra justamente o material novo;
- numeração `#01..#N` do mais recente ao mais antigo, para ele poder dizer "do #32 pra baixo pode apagar";
- botão **Guardar** por card, gravando em `approvals.json`, com contador "N guardados · X GB protegidos";
- filtro "só os guardados" e export CSV com status por arquivo;
- endpoint de download com **allowlist de caminhos** (`realpath` conferido contra o JSON): qualquer outro
  caminho devolve 403.

## 3. Classificar em baldes, não em "antigo/novo"

- **editado/pronto** — nome com `final|pronto|legendado|compilado`, pasta `output/`, `outputs/`, `final/`, ou
  vertical 1080x1920 com ≥18s fora de padrão de intermediário. Numere esses.
- **Flow / clipes de montagem** — caminho com `flow`, `omni_flash`, `hardcopy`: foram usados para montar, não são
  entrega.
- **bruto** — `/src/`, `source`, `VID_20…`, `material`.
- **intermediário** — `seg\d`, `clip_`, `trecho`, `concat`, `_norm`, `chain_`, `base_full`.
- **referência** — `referencias/`, `reel_`, `ig_download`, cortes de YouTube.

Classificação automática erra nas bordas (um `corte3_RAW.mp4` cai como editado por estar em pasta de saída e ter
duração de vertical). Mostre a classificação e deixe o usuário corrigir pelo botão — não defenda o rótulo.

## 4. Duplicatas: hash, mantendo a cópia mais recente

Agrupe por tamanho, depois `md5` só dentro dos grupos com mais de um arquivo (evita hashear 7 GB). Apague as
cópias extras **preservando a mais nova**. Nunca mexa em caminhos com `/extensions/`, `/.cache/`,
`node_modules/` ou perfis de Chrome — apagar asset de extensão quebra o navegador. Um acervo de 693 arquivos
rende ~110 duplicatas e ~400 MB.

## 5. Arquivar os finais antes de apagar

Os editados vão para o Drive **antes** de sair do disco. Ver `external-app-oauth-connection-operations`:
`GOOGLEDRIVE_UPLOAD_FROM_URL` com a URL pública do próprio `/dl` sobe o lote inteiro sem staging. Nomeie com
prefixo numérico (`01_`, `02_`…) na mesma ordem da galeria, e confirme a contagem na pasta depois.

## 6. Apagar por lote, com número na mão

Só depois disso, apague em baldes separados e reporte cada um: `editados já no Drive`, `clipes do Flow`,
`brutos anteriores a <data da campanha>`, `duplicatas`. **Mantenha o material pendente** — o que ele mandou nos
últimos dias e ainda não foi editado (procure `VID_20…` recente, `falas_reuniao/`, `motion_graph/new/`).

Regras que evitaram perda:

- Antes de apagar, recalcule a lista a partir do estado atual e pule o que estiver marcado como Guardar.
- Remova o arquivo, depois os diretórios que ficaram vazios (3 níveis).
- Reporte `arquivos removidos`, `MB liberados` e `df -h /` antes/depois — o número é a prova.
- Atualize o `videos.json` filtrando `os.path.isfile` e regenere a galeria; senão a página continua listando
  arquivos que não existem e todo card vira link morto.

## 7. O disco não está só nos vídeos

Vídeo rende alguns GB; imagem Docker parada rende mais. Se o pedido é "liberar espaço para instalar X", feche a
conta olhando `docker ps -a` para clusters `Exited … months ago` e conte referências por imagem antes de remover
(ver `self-hosted-docker-app-operations`). Diga ao usuário onde está o volume de verdade em vez de prometer que
apagar vídeo resolve sozinho.
