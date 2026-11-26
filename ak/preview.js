#!/usr/bin/env node
'use strict';
/**
 * ak/preview.js TREE OUT - each renderer screen of an unpacked package (ak/repack.js --tree) as the head unit's
 * software path draws it (iDrive 7's text size, the design's pixels), PNG in OUT; RING=n also with the controller's
 * focus on place n. Prints the English drawn that ko.json lacks (ak_ko misses), as JSON.
 */
const path = require('path'), fs = require('fs');
const dir = path.resolve(process.argv[2]), out = path.resolve(process.argv[3]);
fs.mkdirSync(out, { recursive: true });
const gpu = require(path.join(dir, 'renderer/gpu.js'));
const { play } = require(path.join(dir, 'renderer/kit/record.js'));
const { Canvas } = require(path.join(dir, 'renderer/kit/canvas.js'));
const E = require(path.join(dir, 'renderer/public/gpu-elements.js'));
const scr = JSON.parse(fs.readFileSync(path.join(dir, 'renderer/screens.json'), 'utf8'));
const s = E.viewScale('id7');
(scr.screens || []).forEach((st, i) => {
    if (st.kind !== 'gpu') return;
    const rec = gpu.record(st, { view: 'id7', textScale: s });
    const cv = new Canvas(E.DESIGN.w, E.DESIGN.h);
    play(rec.words(), cv);
    fs.writeFileSync(path.join(out, String(i).padStart(2, '0') + '_' + st.name + '.png'), cv.png());
    // with the controller's focus on its fourth place (as the screen draws it: screenapp.js)
    if (process.env.RING) {
        const K = require(path.join(dir, 'renderer/controller.js')), sp = K.spots(st);
        if (sp.length) {
            const r2 = gpu.record(st, { view: 'id7', textScale: s }); K.ring(r2, sp[Math.min(+process.env.RING, sp.length - 1)], false);
            const c2 = new Canvas(E.DESIGN.w, E.DESIGN.h); play(r2.words(), c2);
            fs.writeFileSync(path.join(out, String(i).padStart(2, '0') + '_' + st.name + '_focus.png'), c2.png());
        }
    }
    if (rec.errors) console.log('ERR', st.name, rec.errors);
});
let ko = null; try { ko = require(path.join(dir, 'renderer/kit/ak_ko.js')); } catch (e) { }
if (ko && ko.misses) console.log(JSON.stringify([...ko.misses()], null, 0));
