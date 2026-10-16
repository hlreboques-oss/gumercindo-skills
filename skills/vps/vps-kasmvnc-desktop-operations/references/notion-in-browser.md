# Replicar uma estrutura no Notion pelo navegador do desktop

## Quando

Carlos manda o print de um Notion (ou de uma planilha) de terceiro — "cria um notion igual pra mim" — e quer o mesmo quadro montado, acompanhando ao vivo pelo link do desktop KasmVNC. Vale para qualquer SaaS aberto no navegador do display `:1`; as regras de xdotool/clipboard estão no SKILL.md, aqui ficam as específicas do Notion.

## 1. Extrair o conteúdo do print ANTES de abrir o navegador

- Use vision com **região** (crop nas coordenadas do print original) em vez do print inteiro: o texto da tabela é pequeno e o todo-print faz perder cabeçalhos, regras e datas. Duas ou três regiões resolvem.
- Monte a lista de colunas na ordem exata e a lista de linhas. Marque as células que vieram truncadas ("solicitar ag…") — complete de forma plausível, mas **diga quais valores você inferiu**; não apresente inferência como leitura.
- Antes, confirme se o pedido é o app de destino certo: se ele já mandou o print, o alvo é aquele app; não troque por Sheets/Drive sem perguntar.

## 2. Abrir e confirmar a conta

- Nova aba: `ctrl+t` + digitar `https://www.notion.so` + `Return` (se já existe Chrome no display, abrir dentro da janela viva, nunca relançar o binário).
- Se aparecer "Usar notion.com com google.com → Continuar como <conta>", a conta é a do profile do Chrome do desktop; clicar resolve, **sem senha**. Se pedir senha, para: quem digita é o Carlos, dentro do desktop.
- Confirme o nome do workspace na barra lateral e espere o app carregar de verdade (skeletons) antes de clicar em qualquer coisa.

## 3. Criar a base de dados

- Barra lateral, topo, dois ícones: o **primeiro é a Caixa de entrada** (clicar nele não cria nada) — o **segundo** é o menu de criação. Nele: **Base de dados** (é o "Database"), depois **Nova base de dados vazia** no modal.
- O workspace está em português: rótulos Página / Chat / Anotações IA / Base de dados; tipos de propriedade Texto, Número, Selecionar, Seleção múltipla, Status, Data, Pessoa, Caixa de seleção, Arquivos e mídia, URL, E-mail.
- Renomear o título: clicar no texto do título e digitar (no Notion o clique no título funciona; no Google Sheets não, lá é menu File → Rename).

## 4. Adicionar propriedades (a ordem define a coluna)

- `+ Adicionar propriedade` fica à direita do último cabeçalho; o menu abre com o campo de nome **focado** — digite o nome e clique no tipo.
- **Pitfall central:** ao digitar o nome, a seção "Preenchedor Automático com IA" desaparece e a lista de tipos **sobe** (~34px). Clicar nas coordenadas medidas antes de digitar acerta o tipo errado — na prática rendeu "Pessoa" e "Caixa de seleção" no lugar de "Selecionar" e "Texto". Faça o print **depois** de digitar o nome e só então clique no tipo; ou aceite o default (`Return` = Texto) e ajuste depois no cabeçalho → **Alterar tipo**.
- Tipo errado não é fatal: converter **Caixa de seleção → Texto** devolveu os valores de texto que já tinham sido colados na coluna.
- Nome de coluna com acento: `xdotool type` perde acento de forma intermitente ("Quando devera ser feita a proxima?"). Para o texto exato, `printf '<texto>' | xclip -selection clipboard -i` + `ctrl+v` no campo do nome — funcionou para acentos (á/ó).

## 5. Preencher as linhas

- **Colar TSV multi-linha só cria linhas quando o alvo é a célula de título (Nome) da última linha ("Nova página").** Esse clique abre a página da linha: aperte **Escape** e então `ctrl+v` — as 11 linhas entram de uma vez, cada valor na sua coluna. Colar sem o Escape joga o TSV inteiro no corpo da página como texto corrido (desfazer com `ctrl+z`).
- Colar em célula **Selecionar** (Status, Recorrência) **não preenche para baixo**: o Notion junta as quebras de linha num único valor e oferece `Criar "A fazer A fazer A fazer…"`. Escape + `ctrl+z`.
- Para preencher uma coluna já criada, ande célula a célula: clique a célula da 1ª linha → digite o valor → `Return` → `Down` (seta) → repita. Funciona para Selecionar e Texto. **Confirme com print a cada ~3 linhas:** um clique que erra a célula desloca todos os valores seguintes da coluna — foi assim que linhas que deviam ser "Semanal"/"Anual" terminaram como "Mensal".
- **Datas:** o workspace está em `en-US`, então `07/10/2026` entra como **10 de julho de 2026**. Cole sempre ISO (`2026-10-07`) e confira o que apareceu na coluna Data.
- Preferível: montar o TSV completo (com datas ISO) e colar numa única vez, em vez de intercalar colada e digitação.

## 6. Verificação, parada e entrega

- Print da sessão + leitura linha a linha pelo print antes de dizer que ficou pronto; relate o que ficou parcial ou errado em vez de arredondar.
- "para"/"cancela" no meio da automação: pare na hora, capture **um** print do estado e reporte (a) o que ficou pronto, (b) o que ficou parcial/errado, (c) o que falta para corrigir. Não continue "só mais um pouco" para deixar a tabela redonda.
- Entregue o link do desktop para ele acompanhar. O link da base do Notion só abre para quem está na mesma conta que a criou — diga isso em vez de mandar o link como se fosse público.
