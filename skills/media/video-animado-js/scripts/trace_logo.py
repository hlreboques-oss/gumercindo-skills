"""Vetoriza um logo (claro sobre fundo escuro OU escuro sobre fundo claro) para logo.js.
uso: python3 trace_logo.py <logo.png|jpg> <saida_logo.js> [--crop-bottom 0.74] [--invert]
 --crop-bottom: descarta a parte de baixo da imagem (ex.: texto do nome, que é melhor escrever com fonte)
 --invert: use quando o logo for ESCURO sobre fundo CLARO"""
import sys, re, potrace, numpy as np
from PIL import Image, ImageFilter
src, out = sys.argv[1], sys.argv[2]; args = sys.argv[3:]
crop = float(args[args.index('--crop-bottom') + 1]) if '--crop-bottom' in args else 1.0
im = Image.open(src).convert('L'); k = max(1, 1200 // max(im.size))
im = im.resize((im.width * k, im.height * k), Image.LANCZOS).filter(ImageFilter.GaussianBlur(k * .4))
a = np.array(im) > 128
if '--invert' in args: a = ~a
a[int(a.shape[0] * crop):, :] = False; a[:, :8] = False; a[:, -8:] = False; a[:8, :] = False; a[-8:, :] = False
path = potrace.Bitmap(~a).trace(turdsize=20, alphamax=1.0, opticurve=True, opttolerance=0.3)
parts = []
for c in path:
    s = c.start_point; d = f"M{s.x:.1f},{s.y:.1f}"
    for seg in c.segments:
        if seg.is_corner: d += f"L{seg.c.x:.1f},{seg.c.y:.1f}L{seg.end_point.x:.1f},{seg.end_point.y:.1f}"
        else: d += f"C{seg.c1.x:.1f},{seg.c1.y:.1f} {seg.c2.x:.1f},{seg.c2.y:.1f} {seg.end_point.x:.1f},{seg.end_point.y:.1f}"
    parts.append(d + "Z")
d = "".join(parts); n = [float(x) for x in re.findall(r'-?\d+\.?\d*', d)]
bb = (min(n[0::2]), min(n[1::2]), max(n[0::2]), max(n[1::2]))
open(out, 'w').write(f'const LOGO_D="{d}";const LOGO_BB=[{bb[0]:.1f},{bb[1]:.1f},{bb[2]:.1f},{bb[3]:.1f}];\n')
print(f"logo vetorizado: {out} ({len(parts)} formas). CONFIRA numa prévia: se aparecer um retângulo branco, rode de novo com --invert.")
