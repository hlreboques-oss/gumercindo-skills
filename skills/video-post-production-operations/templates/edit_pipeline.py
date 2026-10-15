#!/usr/bin/env python3
"""Pipeline de edicao (copiar e ajustar por projeto).

Uso: 1) preencher SEGS com o plano de corte; 2) `python3 edit_pipeline.py`.
Renderiza 1080x1920 com transicoes, legenda queimada (ASS) e titulo/cartela (drawtext),
seguro para maquina com pouca memoria: uma transicao por passada, um filtro por passada.
"""
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

BASE = Path('/root/<cliente>/video')
SRC = BASE / 'raw.mp4'
WORK = BASE / 'work'
OUT = BASE / 'final.mp4'
D = 0.35        # duracao da transicao
FPS = 30

# (inicio, fim, texto da legenda, destaque)  -- use as timestamps da transcricao
SEGS = [
    (0.00, 4.30, 'Abertura falada.', False),
    (4.20, 8.30, 'Pergunta feita a alguem?', False),
    (8.20, 9.70, 'Nome: Resposta curta.', True),
]

TITULO1, TITULO2 = 'TITULO', 'subtitulo'
CARTELA = 'FRASE FINAL'


def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode:
        print('FALHOU:', ' '.join(cmd)[:300], '\n', p.stderr[-1500:])
        sys.exit(1)


def dur(f):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                                 '-of', 'csv=p=0', str(f)], capture_output=True, text=True).stdout.strip())


def stage_a():
    WORK.mkdir(parents=True, exist_ok=True)
    out = []
    for i, (a, b, txt, hi) in enumerate(SEGS):
        f = WORK / f'seg{i:02d}.mp4'
        run(['ffmpeg', '-v', 'error', '-y', '-ss', str(a), '-to', str(b), '-i', str(SRC),
             '-vf', f'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps={FPS},format=yuv420p,setsar=1',
             '-af', 'aresample=48000,asetpts=N/SR/TB', '-c:v', 'libx264', '-preset', 'veryfast',
             '-crf', '19', '-c:a', 'aac', '-b:a', '160k', '-shortest', str(f)])
        out.append({'path': str(f), 'dur': dur(f), 'txt': txt, 'hi': hi})
    json.dump(out, open(WORK / 'segs.json', 'w'), ensure_ascii=False, indent=1)
    return out


def stage_b(segs):
    """Uma transicao por ffmpeg (2 entradas) - evita estourar memoria."""
    cur, acc = segs[0]['path'], segs[0]['dur']
    for i in range(1, len(segs)):
        nxt = WORK / f'chain_{i:02d}.mp4'
        run(['ffmpeg', '-v', 'error', '-y', '-i', cur, '-i', segs[i]['path'], '-filter_complex',
             f'[0:v][1:v]xfade=transition=fade:duration={D}:offset={acc - D:.3f}[v];'
             f'[0:a][1:a]acrossfade=d={D}:c1=tri:c2=tri[a]',
             '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19',
             '-threads', '2', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k',
             '-movflags', '+faststart', str(nxt)])
        acc += segs[i]['dur'] - D
        cur = str(nxt)
    shutil.copy(cur, WORK / 'base.mp4')
    return WORK / 'base.mp4', acc


def build_ass(segs, total, path):
    head = ('[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\nWrapStyle: 2\n'
            'ScaledBorderAndShadow: yes\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, '
            'SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, '
            'Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n'
            'Style: fala,Montserrat,54,&H00FFFFFF,&H00FFFFFF,&H00202020,&H96000000,-1,0,0,0,100,100,0.5,0,1,3.6,1.6,2,60,60,300,1\n'
            'Style: fala_hi,Montserrat,58,&H0038D0FF,&H00FFFFFF,&H00202020,&H96000000,-1,0,0,0,100,100,0.5,0,1,3.8,1.8,2,60,60,300,1\n\n'
            '[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n')

    def ts(x):
        return f'{int(x // 3600)}:{int((x % 3600) // 60):02d}:{x % 60:05.2f}'

    acc, lines = 0.0, []
    for s in segs:
        fim = min(total, acc + s['dur'] - D)
        lines.append(f"Dialogue: 0,{ts(acc)},{ts(max(acc + 0.4, fim))},"
                     f"{'fala_hi' if s['hi'] else 'fala'},,0,0,0,,{s['txt'].replace(chr(10), r'\N')}")
        acc += s['dur'] - D
    path.write_text(head + '\n'.join(lines) + '\n', encoding='utf-8')


def main():
    segs = stage_a()
    base, total = stage_b(segs)
    ass = WORK / 'legenda.ass'
    build_ass(segs, total, ass)

    fontdir = '/usr/local/share/fonts/videoedit'
    os.makedirs(fontdir, exist_ok=True)
    for f in (BASE / 'fonts').glob('*.ttf'):
        shutil.copy(f, fontdir)
    subprocess.run(['fc-cache', '-f'])
    font = str(BASE / 'fonts' / 'Montserrat-Bold.ttf')

    mid = WORK / 'com_legenda.mp4'
    run(['ffmpeg', '-v', 'error', '-y', '-i', str(base), '-vf', f'ass={ass}',
         '-threads', '1', '-filter_threads', '1', '-c:v', 'libx264', '-preset', 'veryfast',
         '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', str(mid)])

    (WORK / 't1.txt').write_text(TITULO1, encoding='utf-8')
    (WORK / 't2.txt').write_text(TITULO2, encoding='utf-8')
    (WORK / 'fim.txt').write_text(CARTELA, encoding='utf-8')
    fade_in = "if(lt(t,0.5),t/0.5,if(lt(t,3.4),1,max(0,(3.9-t)/0.5)))"
    e0, e1, e2 = total - 2.4, total - 2.1, total - 1.4
    draw = (f"drawtext=fontfile={font}:textfile={WORK / 't1.txt'}:fontsize=96:fontcolor=white:borderw=3:"
            f"bordercolor=black@0.55:x=(w-text_w)/2:y=h*0.20:alpha='{fade_in}',"
            f"drawtext=fontfile={font}:textfile={WORK / 't2.txt'}:fontsize=44:fontcolor=white@0.95:borderw=2:"
            f"bordercolor=black@0.5:x=(w-text_w)/2:y=h*0.27:alpha='{fade_in}',"
            f"drawtext=fontfile={font}:textfile={WORK / 'fim.txt'}:fontsize=64:fontcolor=white:borderw=3:"
            f"bordercolor=black@0.6:x=(w-text_w)/2:y=h*0.20:alpha='if(lt(t,{e1}),0,if(lt(t,{e2}),(t-{e1})/0.7,1))':"
            f"enable='gte(t,{e0})'")
    run(['ffmpeg', '-v', 'error', '-y', '-i', str(mid), '-vf', draw, '-threads', '1', '-filter_threads', '1',
         '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-pix_fmt', 'yuv420p',
         '-c:a', 'copy', '-movflags', '+faststart', str(OUT)])

    real = dur(OUT)
    esperado = sum(s['dur'] for s in segs) - D * (len(segs) - 1)
    print(f'final: {real:.2f}s | esperado: {esperado:.2f}s | {"OK" if abs(real - esperado) < 0.4 else "DIVERGENCIA"}')


if __name__ == '__main__':
    main()
