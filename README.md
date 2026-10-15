# Gumercindo Skills — pacote de habilidades

Pacote de skills (habilidades) do agente **Gumercindo** para instalar em qualquer
Hermes novo em 1 minuto. Feito para a implementação do agente do cliente.

## O que tem aqui

```
skills/
  media/                                  # vídeo, motion graphics, transcrição
    code-generated-motion-video            # motion graphics gerado por código
    code-generated-video-production        # produção de vídeo em código (pipeline)
    gumercindo-remotion-video              # vídeos Remotion (React) verticais
    programmatic-video-production          # produção programática de vídeo
    video-animado-js                       # vídeos verticais animados em JS
    media-generation-and-editing           # geração e edição de mídia em geral
    edith-style-content-cuts               # cortes no estilo Edith
    client-video-edit-delivery             # editar bruto do cliente → entrega final
    client-video-concept-pilots            # pilotos de vídeo a partir de referência
    social-video-transcription-operations  # transcrição de vídeos sociais
    fast-instagram-reel-transcription      # transcrever Reel do Instagram rápido
    video-quality-enhancement              # melhorar/upscale de clipe
    video-use                              # editar vídeo por conversa
  video-post-production-operations/        # pós-produção: corte, legenda, cor, som
  raw-footage-speaker-edit-ffmpeg/         # bruto de celular → corte com título/legenda
  operations/
    healthcare-appointment-intake-operations  # fluxo Nutrio (anamnese/consulta)
mindset/
  COMO_CONVERSAR_COM_O_HERMES.md           # mentalidade de conversa com o agente
```

## Instalação (no VPS do cliente)

```bash
# 1. baixar o pacote
cd /tmp
git clone https://github.com/hlreboques-oss/gumercindo-skills.git

# 2. instalar as skills no Hermes
mkdir -p ~/.hermes/skills
cp -r /tmp/gumercindo-skills/skills/* ~/.hermes/skills/

# 3. conferir
hermes skills list 2>/dev/null || ls ~/.hermes/skills
```

Depois, no chat com o agente:

```text
Leia /tmp/gumercindo-skills/mindset/COMO_CONVERSAR_COM_O_HERMES.md e siga essa
mentalidade de conversa. Registre as skills do pacote gumercindo-skills e me diga
quais você já consegue usar.
```

## Regra de uso

- Skills são **procedimentos**, não permissões: o agente segue o passo a passo,
  mas continua pedindo aprovação antes de enviar mensagem, postar ou publicar.
- Login em app de cliente é sempre **manual**, feito pela pessoa no navegador.
- Nunca colar senha, token ou código de verificação no chat.

## Requisitos de sistema para as skills de vídeo

```bash
sudo apt update
sudo apt install -y ffmpeg python3-pip git curl
# opcional, para render em JS/Remotion
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```
