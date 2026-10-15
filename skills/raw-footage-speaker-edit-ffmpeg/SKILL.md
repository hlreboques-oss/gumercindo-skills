---
name: raw-footage-speaker-edit-ffmpeg
description: "Use when editing raw phone footage: title, captions, cuts."
version: 1.0.0
---

# Raw footage → corte por pessoa, título, legenda e transições

Classe de trabalho: Carlos manda um vídeo bruto de celular (evento, depoimento, roda de conversa) e pede “pôr título, legenda e transições”. Entregar MP4 real, verificado, não um plano.

## Entrada e upload
- Criar pasta no Drive dele (`hlreboques@gmail.com`) e dar permissão de link como `writer`, para ele subir de qualquer conta; o arquivo conta na cota de **quem envia**, não do dono da pasta. Avisar quando o Drive dele estiver quase cheio.
- Confirmar a chegada listando os vídeos da pasta por script antes de dizer que não chegou. Painéis de terceiros (ArpChat, WhatsApp Web) no navegador visível expiram e voltam para login — checar a aba antes de prometer envio por interface.
- Baixar o arquivo e conferir tamanho antes de editar.

## Pipeline
1. `ffprobe` (duração, resolução, áudio) e extrair um contact sheet para **ver** o conteúdo antes de decidir o corte.
2. Transcrever com `faster_whisper` small, `language='pt'`, `vad_filter=True`; guardar segmentos com timestamps.
3. Cortar **por pessoa/fala**: uma pergunta + a resposta dela por trecho; manter as falas mais fortes (o elogio curto é o ouro); descartar muletas (“legal”, “não sei”) e **cortar o trecho meta** em que ele explica que está mandando o vídeo para edição.
4. Normalizar cada trecho para o mesmo formato (ex.: 1080x1920, fps fixo, `yuv420p`, `setsar=1`, AAC 48k).
5. Montar com **uma transição por passada**: encadear o clipe acumulado + o próximo (`xfade=transition=fade:duration=0.35` + `acrossfade=d=0.35`), nunca uma única cadeia com N inputs.
6. Legenda ASS com tempos **remapeados** para a linha do tempo final (cada transição encurta o total em 0.35s). Voz original preservada; sem música inventada.
7. Título de abertura e cartela final com `drawtext` (`textfile=`, `alpha` em expressão, `enable`). Cartela final na faixa **superior** (y≈0.20h) — no meio cobre rosto.
8. Rodar `fc-cache` e usar arquivo de fonte real (instanciar variável com fontTools se só houver variável); DejaVu Bold como fallback.

## Memória é o gargalo (host pequeno)
- Aqui são 2 vCPU e ~8 GB com pouco livre: filter_complex com muitos inputs é **morto por OOM**, deixando MP4 truncado — sintomas: `moov atom not found` e duração menor que a esperada.
- Usar `-threads 1 -filter_threads 1`, dividir legendas e títulos em **passadas separadas**, e conferir a duração do output a cada etapa antes de seguir.
- Em render de vários minutos: dar ETA e progresso (ele pergunta “tá fazendo?” / “quanto tempo pra voltar?”).

## Entrega
- Mandar o MP4 no chat **e** subir para o Drive.
- Provar que é o mesmo arquivo: `md5` local × `md5Checksum` do Drive.
- Conferir quadros do resultado (título legível, legenda sem corte, cartela sem cobrir rosto) antes de enviar; se algo colidir, re-renderizar e só então entregar.
