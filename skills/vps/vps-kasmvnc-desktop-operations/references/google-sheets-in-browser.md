# Montar planilha no navegador do desktop (Google Sheets)

## Quando

Carlos pede para "abrir uma planilha no seu navegador" e preencher dados — ele acompanha ao vivo pelo link do desktop KasmVNC. O entregável é (a) a planilha montada, (b) o link do desktop para ele assistir, (c) o link da planilha.

## Passos

1. **Criar**: abra uma aba no Chrome do display `:1` com `https://docs.google.com/spreadsheets/create` (abre planilha em branco). A conta dona do arquivo é a que já está logada no profile do Chrome do desktop.
   **A sessão do navegador é independente do token OAuth da API**: mesmo com o token do Drive/Sheets devolvendo `invalid_grant`, o Sheets funciona normalmente no navegador. Não condicione a tarefa à reconexão da API.
2. **Feche os overlays antes de clicar na grade**: o painel Gemini (X no canto superior do painel) e o popup "Try out Build" ficam **por cima** da grade e engolem o primeiro clique. Tire print antes de concluir que a grade está pronta.
3. **Cole os dados como TSV**: monte o conteúdo com `write_file` (colunas separadas por tab, uma linha por registro), depois `cat arquivo.tsv | xclip -selection clipboard -i` e, com A1 selecionado, `xdotool key --clearmodifiers ctrl+v`. A tabela inteira entra de uma vez, cada campo na sua coluna. Prefira isso a digitar célula por célula.
4. **Selecionar intervalo sem arrastar**: clique na **Name Box** (a caixa à esquerda da barra de fórmulas; ≈`x=75,y=241` numa tela 1366x606 — confirme no print, o Carlos pode redimensionar a sessão), `ctrl+a`, digite `A1:C11`, Enter. Com o intervalo selecionado: `ctrl+b` para negrito e a paleta de bordas da toolbar (ícone à direita dos alinhamentos; o **primeiro** botão da grade = todas as bordas).
5. **Renomear o arquivo**: clicar no texto do título nem sempre abre o diálogo. Use o menu: `alt+f` → **Rename** → `ctrl+a`, digite o nome, Enter. Confirme o novo título no print.
6. **Congelar o cabeçalho**: `alt+v` → **Freeze** → **1 row**.
7. **Ler a URL final**: `ctrl+l`, `ctrl+c`, depois `xclip -selection clipboard -o` — a URL precisa entrar na resposta.
8. **Verificar**: print real da sessão e leitura linha por linha do que está na grade (via print) antes de dizer que ficou pronto.

## Localidade decide número vs texto

A conta do desktop está em `en-US`: digitando `6.99` numa célula vazia ele alinha à **direita** (número), `6,99` alinha à **esquerda** (texto). Faça esse teste em duas células vazias (e apague depois) **antes** de decidir a coluna de preço:

- Padrão brasileiro (`R$ 6,99`, texto) → visualmente igual à tabela que ele mandou, mas sem somas automáticas.
- Número + formato de moeda → permite somar/média, porém exibe `R$6.99` (formato americano).

Escolha o padrão brasileiro por default e diga o trade-off em uma frase, oferecendo a troca — ele decide.

## Entrega

- Link do desktop (para ele acompanhar) + link da planilha.
- Não mude o compartilhamento para "qualquer um com o link" sem ele pedir: o arquivo nasce privado na conta logada.
