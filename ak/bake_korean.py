#!/usr/bin/env python3
"""ak/bake_korean.py - the Korean glyph atlases of this copy's five apps: ak/common/kit/fonts/ak_korean.json (regular)
and ak_korean_bold.json (bold, the apps' bold family), the same file in every app (one upload for all of them).

  python3 ak/bake_korean.py [NotoSansCJK-Regular.ttc NotoSansCJK-Bold.ttc]

Only the characters the apps' ko.json values use (ak/apps/*/ko.json), with printable ASCII and a few marks, so a line
mixing Korean, digits and Latin is drawn in one face. Each atlas sheet is 1024 wide and at most MAX_ROWS high: the
head unit's renderer puts every app's glyph atlases in one shared texture, and a large sheet that does not fit leaves
every app's text blank. The format is the kit's (cauliflowermossgrape/idrive7-apps kit/tools/bake_fonts.py, MIT):
{ family, source, sizes: [{ size, ascent, descent, atlasW, atlasH, alpha (zlib, base64), glyphs { code: [x, y, w, h,
ox, oy, advance] } }] }. Noto Sans CJK KR (index 1 of the collections): SIL Open Font License 1.1, OFL-NotoSansCJK.txt.
"""
import base64
import glob
import json
import sys
import zlib
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

AK = Path(__file__).resolve().parent
OUT = AK / 'common' / 'kit' / 'fonts'
REGULAR = sys.argv[1] if len(sys.argv) > 2 else '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
BOLD = sys.argv[2] if len(sys.argv) > 2 else '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
FACES = {'ak_korean': (REGULAR, [22, 28]), 'ak_korean_bold': (BOLD, [28])}
MAX_ROWS = 512
EXTRA = ''.join(chr(c) for c in range(32, 127)) + '·…–—°%‘’“”'


def charset():
    s = set(EXTRA)
    for p in sorted(glob.glob(str(AK / 'apps' / '*' / 'ko.json'))):
        for k, v in json.loads(Path(p).read_text(encoding='utf-8')).items():
            if not k.startswith('_'):
                s.update(v)
    s.discard('\n')
    return ''.join(sorted(s))


def bake(fname, size, chars):
    font = ImageFont.truetype(fname, size, index=1)
    if 'KR' not in font.getname()[0]:
        raise SystemExit('expected Noto Sans CJK KR at index 1, got ' + ' '.join(font.getname()))
    ascent, descent = font.getmetrics()
    imgs = []
    for ch in chars:
        bbox = font.getbbox(ch, anchor='ls')
        adv = font.getlength(ch)
        w, h = max(0, bbox[2] - bbox[0]), max(0, bbox[3] - bbox[1])
        im = None
        if w and h:
            im = Image.new('L', (w, h), 0)
            ImageDraw.Draw(im).text((-bbox[0], -bbox[1]), ch, font=font, fill=255, anchor='ls')
        imgs.append((ch, im, bbox, adv))
    W, x, y, rowh, place = 1024, 0, 0, 0, {}
    for ch, im, bbox, adv in imgs:
        if im is None:
            place[ch] = (0, 0, 0, 0)
            continue
        if x + im.width > W:
            x, y, rowh = 0, y + rowh + 1, 0
        place[ch] = (x, y, im.width, im.height)
        x += im.width + 1
        rowh = max(rowh, im.height)
    H = y + rowh + 1
    if H > MAX_ROWS:
        raise SystemExit(f'{Path(fname).name} {size}: {H} rows (max {MAX_ROWS}): fewer characters or a smaller size')
    atlas = Image.new('L', (W, H), 0)
    glyphs = {}
    for ch, im, bbox, adv in imgs:
        px, py, pw, ph = place[ch]
        if im is not None:
            atlas.paste(im, (px, py))
        glyphs[ord(ch)] = [px, py, pw, ph, bbox[0], bbox[1], round(adv, 2)]
    return {'size': size, 'ascent': ascent, 'descent': descent, 'atlasW': W, 'atlasH': H,
            'alpha': base64.b64encode(zlib.compress(atlas.tobytes(), 9)).decode(), 'glyphs': glyphs}


def main():
    chars = charset()
    OUT.mkdir(parents=True, exist_ok=True)
    for fam, (fname, sizes) in FACES.items():
        data = {'family': fam, 'source': 'Noto Sans CJK KR (' + Path(fname).stem + ', SIL OFL 1.1): ak/bake_korean.py',
                'chars': len(chars), 'sizes': [bake(fname, s, chars) for s in sizes]}
        p = OUT / (fam + '.json')
        p.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
        print(fam, len(chars), 'characters,', [(s['size'], s['atlasH']) for s in data['sizes']], p.stat().st_size // 1024, 'KiB')


main()
