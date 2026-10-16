---
name: whatsapp-evolution-connection
description: "Use when connecting a WhatsApp number to Hermes through Evolution API."
version: 1.0.0
author: Gumercindo
license: MIT
tags: [whatsapp, evolution-api, webhook, qr, hermes, bridge]
metadata:
  hermes:
    tags: [whatsapp, evolution-api, webhook, qr, hermes, bridge]
    related_skills: [vps-remote-desktop-operations, clinic-whatsapp-attendance]
---

# Conectar WhatsApp ao Hermes via Evolution API

## Quando usar

Quando for preciso ligar um número de WhatsApp ao agente para ele **ler e responder** conversas
(atendimento, prospecção, suporte), usando Evolution API em vez do bridge nativo.

## Decisões antes de instalar (não pule)

1. **Qual número.** Prefira um número **dedicado** ao agente. Ligar o número principal da operação
   significa que qualquer queda de sessão depende do celular do dono, e uso agressivo coloca a
   linha em risco.
2. **Um número = uma instância.** Se a linha já estiver pareada em outro lugar (outra Evolution,
   bridge nativo, WhatsApp Web do celular em uso pesado), o WhatsApp derruba aparelhos. Resolva a
   posse por `ownerJid`, nunca pelo nome da instância.
3. **Escopo do que o agente pode fazer sozinho.** Sem essa resposta escrita, o agente responde
   demais.

## Instalação (Docker, na VPS)

1. `docker compose` com **evolution-api + postgres + redis**.
2. Variáveis essenciais: `AUTHENTICATION_API_KEY` (chave forte), `DATABASE_CONNECTION_URI`,
   `CACHE_REDIS_URI`, `SERVER_URL`.
3. Confirme que está de pé: `curl -s http://127.0.0.1:8080/` e o container `healthy`.
4. **Não exponha a porta na internet.** Acesso local pela VPS ou via tailnet.

## Pareamento por QR

1. Crie a instância:
   `POST /instance/create` `{"instanceName":"<nome>","qrcode":true,"integration":"WHATSAPP-BAILEYS"}`
2. Gere o QR: `GET /instance/connect/<nome>` (o `POST` retorna 404 nas versões atuais).
3. **O QR rotaciona em segundos**: uma foto dele costuma chegar expirada. Sirva uma **página que
   se atualiza** (ou mostre a tela viva do desktop) e escaneie pelo celular em
   WhatsApp → Aparelhos conectados.
4. Confirme o estado real: `GET /instance/fetchInstances` → `connectionStatus: open` e `ownerJid`
   do número esperado. **`connecting` não é conectado.**

## Ponte com o Hermes (webhook)

1. No Hermes, garanta a plataforma webhook ligada (`hermes webhook list`).
2. Crie a assinatura que recebe as mensagens:
   `hermes webhook subscribe <rota> --secret <segredo> --deliver origin`
3. Na Evolution, aponte o webhook da instância para a rota do Hermes, com o evento de mensagem
   recebida (`MESSAGES_UPSERT`) e o segredo combinado.
4. **O agente responde chamando a Evolution**, não o bridge:
   `POST /message/sendText/<instancia>` `{"number":"<remoteJid>","text":"<resposta>"}`
   → guarde o id retornado.
5. **Responder é por conversa.** A cada inbound, identifique o `remoteJid` do remetente e responda
   naquele chat. Nunca dispare para a lista da instância.
6. **Prova de envio = readback.** Aceite (`PENDING`) não é entrega: releia o histórico daquele
   `remoteJid` e confirme a mensagem `fromMe` com o texto antes de dizer que enviou.

## Modo seguro nas primeiras semanas

- **Modo sombra**: o agente **escreve a resposta e não envia**. Um humano lê, corrige e aprova.
  É assim que o tom de voz dele se ajusta à operação real (ver `clinic-whatsapp-attendance`).
- Libere envio automático só para casos de baixo risco (confirmação de horário, envio de link de
  formulário, informação de preço de tabela).
- Opt-out explícito: quem pedir para parar não recebe mais nada, e a flag fica registrada.
- Dado de saúde é sensível: a conversa serve para agendar e organizar, nunca para orientar.

## Checagens quando "parou de responder"

1. `GET /instance/fetchInstances` → a instância está `open`?
2. O webhook ainda aponta para a rota certa e o Hermes está recebendo? (log da plataforma webhook)
3. A última mensagem do chat é do contato (devemos resposta) ou nossa (a bola está com eles)?
4. Alguma outra instância com o mesmo `ownerJid` está `connecting`/`close`? Isso explica o número
   perdido — e não é bug do agente.

## Pitfalls

- Apagar sessão órfã: `DELETE /instance/logout/<nome>` **antes** de `DELETE /instance/delete/<nome>`,
  e confirme na listagem depois.
- `POST /instance/connect/<nome>` retorna 404 em versões atuais — use `GET`.
- Não usar busca global de mensagens em operações com `@lid`: leia por `remoteJid` e `remoteJidAlt`.
- Nunca reconstruir número a partir de telefone mascarado — use sempre o `wa_link`/JID completo.
- Mensagem longa com muitos links em canal não oficial costuma ser filtrada: prefira textos curtos.
- Um estágio gravado em planilha/CRM ("enviado") é afirmação, não prova: confira a mensagem `fromMe`.
