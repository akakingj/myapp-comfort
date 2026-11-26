#!/usr/bin/env python3
"""ak/inset_icon.py - an app's iDrive icon made smaller inside its own square, the rest clear (ak/repack.js).

    python3 ak/inset_icon.py ICON.png [...]

IterioDev's icons fill their whole 140 x 140 square, so iDrive 7's frame round the chosen app in its list lies under
them and does not show. Each is drawn at 112 x 112 in the middle of the same square (14 px clear each side, about as
the idrive7-apps icons leave), in place.
"""
import sys
from PIL import Image

INNER = 0.8

for path in sys.argv[1:]:
    im = Image.open(path).convert('RGBA')
    w, h = im.size
    iw, ih = round(w * INNER), round(h * INNER)
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    out.alpha_composite(im.resize((iw, ih), Image.LANCZOS), ((w - iw) // 2, (h - ih) // 2))
    out.save(path, optimize=True)
