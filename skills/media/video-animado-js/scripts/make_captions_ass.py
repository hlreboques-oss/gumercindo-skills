# -*- coding: utf-8 -*-
"""Gera captions.ass para queimar legenda na LINHA DE DIVISÃO da tela dividida.

Uso:
    python make_captions_ass.py transcript.json 117.74 195.14 captions.ass [--y 960] [--size 48]

- transcript.json: lista de segmentos do faster-whisper com 'words' (start/end por palavra).
- T0/T1: janela do corte, em segundos do vídeo original (os eventos ficam relativos a T0).
- Estilo: Alignment=5 (centro), posição fixa em (540,Y), BorderStyle=3 (caixa opaca), BackColour com alfa.

Por que ASS e não drawtext: uma caixa com padding uniforme e 2 linhas centradas no Y da
divisão é o que fica legível tanto sobre a animação escura quanto sobre o vídeo claro.
"""
import json, sys

CHUNK_CHARS = 74   # tamanho máximo de um bloco antes de quebrar
WRAP_CHARS = 36    # quebra em duas linhas acima disso
FIXES = [('e -mail', 'e-mail'), ('a -mail', 'a e-mail'), ('que a gente usando', 'que a gente usa')]


def wrap(text, n=WRAP_CHARS):
    if len(text) <= n:
        return text
    cut = text.rfind(' ', 0, n)
    if cut < 12:
        cut = n
    return text[:cut].rstrip() + r'\N' + text[cut:].strip()


def hms(t):
    h = int(t // 3600)
    m = int((t % 3600) // 60)
    s = t % 60
    return f'{h}:{m:02d}:{s:05.2f}'


HDR = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,DejaVu Sans,{size},&H00FFFFFF,&H000000FF,&H00101010,&H99000000,-1,0,0,0,100,100,0,0,3,10,0,5,40,40,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""


def main():
    src, t0, t1, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
    y = 960.0
    size = 48
    if '--y' in sys.argv:
        y = float(sys.argv[sys.argv.index('--y') + 1])
    if '--size' in sys.argv:
        size = int(sys.argv[sys.argv.index('--size') + 1])

    data = json.load(open(src))
    words = []
    for seg in data:
        if seg['end'] < t0 or seg['start'] > t1:
            continue
        for w in seg['words']:
            # estritamente dentro da janela: palavra antes do corte gera legenda órfã no 1º frame
            if w['start'] >= t0 - 0.02 and w['end'] <= t1 + 0.6:
                words.append({'w': w['w'].strip(), 's': w['start'], 'e': w['end']})

    chunks, cur, cur_len = [], [], 0
    for i, w in enumerate(words):
        cur.append(w)
        cur_len += len(w['w']) + 1
        nxt = words[i + 1] if i + 1 < len(words) else None
        gap = (nxt['s'] - w['e']) if nxt else 9
        ends = w['w'].endswith(('.', '?', '!', ',', '…', '...'))
        if cur_len >= CHUNK_CHARS or gap > 0.55 or ends or not nxt:
            chunks.append(cur)
            cur, cur_len = [], 0

    events = []
    for i, c in enumerate(chunks):
        if not c:
            continue
        text = ' '.join(x['w'] for x in c)
        for a, b in FIXES:
            text = text.replace(a, b)
        text = text.replace(' -', '-')
        start = max(0.0, c[0]['s'] - t0 - 0.06)
        end = (chunks[i + 1][0]['s'] - t0) if i + 1 < len(chunks) else (t1 - t0)
        end = min(end, (c[-1]['e'] - t0) + 0.45)
        if end - start < 0.5:
            end = start + 0.5
        events.append((start, end, wrap(text)))

    tag = r'{\pos(540,' + str(int(y)) + ')}'
    lines = [HDR.format(size=size)]
    for start, end, text in events:
        lines.append('Dialogue: 0,' + hms(start) + ',' + hms(end) + ',Cap,,0,0,0,,' + tag + text)
    open(out, 'w', encoding='utf-8').write('\n'.join(lines))
    print(str(len(events)) + ' eventos -> ' + out + ' (y=' + str(int(y)) + ' size=' + str(size) + ')')


if __name__ == '__main__':
    main()
