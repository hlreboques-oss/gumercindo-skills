# Voz natural (Gemini TTS) + vídeo Google Flow

## Voz menos robótica sem custo: Gemini 2.5 Flash TTS

Se `GOOGLE_API_KEY` existe em `~/.hermes/.env` (nem sempre exposto no env do shell — ler o arquivo), a TTS do Gemini está disponível e soa bem mais humana que Edge.

- Endpoint: `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=<KEY>`
- Body: `{"contents":[{"parts":[{"text":...}]}],"generationConfig":{"responseModalities":["AUDIO"],"speechConfig":{"voiceConfig":{"prebuiltVoiceConfig":{"voiceName":"Iapetus"}}}}}`
- Retorno: `candidates[0].content.parts[0].inlineData.data` = base64 de PCM **16-bit mono 24 kHz** → embrulhar em WAV com `wave` (setframerate(24000)).
- Vozes masculinas PT usáveis: `Iapetus` (clara/calorosa), `Charon` (grave), `Orus` (firme), `Puck` (energético).
- **Aceita direção de estilo em português**: prepend `"Fale em portugues do Brasil ... tom humano, emocional, ritmo conversado, sem voz de locutor"` e depois `"Diga exatamente: <texto>"`. Muda muito a naturalidade.
- **429 Too Many Requests é comum**: fatiar o texto em blocos (~2 frases), pausar ~8s entre chamadas e fazer retry com backoff (20s × tentativa). Reusar WAVs já gerados antes de repetir a chamada.
- **Limite real do free tier: 10 requisições/dia** por modelo (`generate_content_free_tier_requests`, `quotaValue: 10`, retryDelay ~2h+). Uma peça de 70s em 6 blocos + testes de voz já esgota o dia. Não adianta insistir no backoff: era quota diária, não rate limit momentâneo. Alternativas: voz nativa do Flow ou plano pago.

Comparar vozes com cliente: gerar a MESMA frase em várias vozes, concatenar com rótulos falados curtos ("Opção um. Gemini Charon.") e mandar um único áudio.

## Retiming de legendas pelo áudio real

Nunca fixar legendas em tempos inventados. Gerar a narração em blocos, medir `ffprobe` de cada bloco, guardar os marcos (início/fim) em JSON e distribuir as frases de cada bloco proporcionalmente ao nº de caracteres dentro da janela daquele bloco. Isso mantém a legenda sincronizada mesmo quando a voz nova fala mais devagar que a anterior.

## Google Flow (vídeo)

- Gera **1 clipe nativo por vez**, **máx 10s**; para peças maiores, dividir o roteiro em blocos de 8-10s (1 clipe por bloco). Para economizar créditos e reduzir gaps, preferir 8s quando a interface permitir e manter cada fala curta.
- Antes de cada geração, conferir visualmente a config ativa: **Video/Veo**, **9:16**, 720p, duração desejada e **x1**. O Flow pode ficar preso em modo imagem/modelo errado ou x2; não colar prompt nem gerar até a configuração estar certa.
- Para campanhas em série, usar uma **ficha JSON fixa de personagem** em todo prompt: nome fictício, idade, etnia/pele, cabelo, barba, olhos, corpo, roupa, acessórios e uma regra explícita de identidade. Repetir a ficha inteira em cada clipe, não só “same character”, porque o Flow pode trocar ator entre cenas.
- Escrever prompts em JSON/estrutura rígida (`character`, `scene`, `audio`, `constraints`) quando consistência importar. Em `scene`, trocar só ação/câmera/continuidade; manter o bloco `character` invariável.
- Variar câmera em cada clipe para não ficar “um ângulo só”: macro close-up, dolly-out/in, 180°/360° orbit, top-down/drone, crane-up/down, lateral tracking, whip pan e hero shot. Declarar a continuidade do quadro anterior para evitar “reinício” de cada clipe.
- Evitar pedir texto legível ao Flow. Para CTA, títulos e setas (“TOQUE E SAIBA MAIS ↓↓↓”), deixar espaço limpo no prompt e aplicar depois em FFmpeg/post-produção; o modelo costuma escrever errado ou gerar labels indesejados.
- **Carlos prefere a voz do próprio Flow** quando ela funciona: pedir no prompt `"synchronized voice audio ... speaks in Brazilian Portuguese: '<fala>' ... bold white on-screen caption synced to speech"` devolve clipe com fala + legenda nativas, sem pipeline de TTS. Nesse caso não há narração separada nem retiming de legenda. A voz/ator varia entre clipes gerados soltos — para manter o mesmo locutor, usar o recurso de Character do Flow em vez de gerações independentes. Clipes com voz pesam ~2-2,6 MB em 720p/10s.
- Se a narrativa ou voz do Flow ficar desconexa, remover o áudio dos clipes e montar com **narração única contínua** por cima. Isso resolve gaps entre cenas, mudança de voz e texto cortado; a narração pode ser TTS rascunho ou voz gravada pelo Carlos para versão final.
- Quando Carlos pedir cenas que representam uma narração/talking-head, **use o Flow como camada de reenactment**, não PIL/desenho local. Transcreva primeiro, crie beats por timestamp, gere um prompt Flow por beat e monte com a voz original do vídeo.
- Se ele mencionar “abre o Flow”, “pelo celular”, “Tailscale/Tales” ou precisar ver/controlar a tela, use o Chrome visível da VPS (`DISPLAY=:1`) conforme a skill `google-flow-vps-access`; não mande só o link público do Flow como solução.
- Download: abrir o clipe → ícone de download → escolher **720p** → arquivo em `~/Downloads/`. Se houver vários clipes no mesmo projeto, selecione cada miniatura, baixe 720p e renomeie/copiei para uma pasta ordenada (`flow_clips/01_...mp4`, `02_...mp4`, etc.) antes da montagem.
- **Não usar nome próprio / pessoa real no prompt** (
"Carlos", "celebrity"): o Flow recusa ("prominent people"). Redigir como "a fictional small business owner" ou personagens genéricos, sem likeness.
- Montagem final com voz original: normalizar clipes Flow para 1080x1920, intercalar talking-head apenas onde fortalece a reflexão, cortar o final operacional/desligando celular quando o usuário pedir, queimar legendas depois da composição visual e muxar o áudio original aparado.
- Montagem final com narração/TTS: normalizar todos os clipes (scale/crop 1080x1920, fps 24/30), concatenar, e se a narração for mais longa que a soma dos clipes usar `setpts=PTS*fator` para casar exatamente com a duração do áudio (evita fim congelado).
- No bloco final (CTA), **não legendar** se já houver texto de CTA em tela, senão duplica e colide.
- QA: extrair contact sheet e frames do CTA/finais com `ffmpeg`, conferir com visão antes de entregar, validar com `ffprobe`, `ffmpeg -v error -i out.mp4 -f null -`, e medir loudness (`ebur128=peak=true`) quando houver voz original/TTS. Se personagem trocar, texto ficar legível indevido ou resolução cair para 360p, pedir só o clipe problemático de novo quando houver crédito; se Carlos preferir economizar, documentar a limitação e seguir.

## Pitfalls

- `rm -f` em caminhos amplos é bloqueado pela varredura de segurança e trava o fluxo: usar nomes de arquivo novos em vez de limpar diretórios.
- VPS pode não ter GPU/RAM/disco para clonagem local de voz (XTTS/Chatterbox/F5). Clonagem real exige ElevenLabs/MiniMax (conta paga) ou GPU alugada.
- Voz real do Carlos já disponível para referência de clone: `/root/youtube-cortes-8XSU4xXbK6U/source.mp4` (extrair trecho de fala).
