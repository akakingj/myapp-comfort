'use strict';
/**
 * ak/edits.js - the changes ak/repack.js makes in IterioDev's files, as small exact replacements: each { file (in
 * the package's tree; top: in the package's top, src/ and mgu-app.json), find, replace, count (1 unless said), why }.
 * common: every app; <id>: that app alone. A find that is not there stops the run, so an update of IterioDev's
 * that moves the code shows here first.
 */

const KO_REQ = "const KO = require('./ak_ko');\n";

const common = [
    /* ---- Korean: every string is drawn through the kit's text(), its width through textWidth() ---- */
    { file: 'renderer/kit/record.js', find: "const fonts = require('./fonts');\n", replace: "const fonts = require('./fonts');\n" + KO_REQ,
        why: 'the Korean table and font' },
    { file: 'renderer/kit/record.js',
        find: "        const family = opts.font || 'label';\n        const f = fonts.get(family, size * this.textScale);\n        if (!f) return 0;\n        const s = String(str), sc",
        replace: "        const s = KO.tr(str), family = KO.font(opts.font || 'label', s);\n        const f = fonts.get(family, size * this.textScale);\n        if (!f) return 0;\n        const sc",
        why: 'text(): Korean, in the Korean atlas' },
    { file: 'renderer/kit/record.js',
        find: "        const f = fonts.get((opts && opts.font) || 'label', size * this.textScale);\n        const s = String(str);",
        replace: "        const s = KO.tr(str);\n        const f = fonts.get(KO.font((opts && opts.font) || 'label', s), size * this.textScale);",
        why: 'textWidth(): as text() draws it' },
    { file: 'renderer/kit/canvas.js', find: "const fonts = require('./fonts');\n", replace: "const fonts = require('./fonts');\n" + KO_REQ,
        why: 'the software path (the renderer\'s fallback, previews) as the recorder' },
    { file: 'renderer/kit/canvas.js',
        find: "        opts = opts || {};\n        const f = fonts.get(opts.font || 'label', size);\n        if (!f) return 0;\n        c = rgba(c);\n        const scale = size / f.size;\n        const s = String(str);",
        replace: "        opts = opts || {};\n        const s = KO.tr(str);\n        const f = fonts.get(KO.font(opts.font || 'label', s), size);\n        if (!f) return 0;\n        c = rgba(c);\n        const scale = size / f.size;",
        why: 'text()' },
    { file: 'renderer/kit/canvas.js',
        find: "        const f = fonts.get((opts && opts.font) || 'label', size);\n        return f ? fonts.measure(f, String(str)) * (size / f.size) + ((opts && opts.spacing) || 0) * Math.max(0, String(str).length - 1) : 0;",
        replace: "        const s = KO.tr(str), f = fonts.get(KO.font((opts && opts.font) || 'label', s), size);\n        return f ? fonts.measure(f, s) * (size / f.size) + ((opts && opts.spacing) || 0) * Math.max(0, s.length - 1) : 0;",
        why: 'textWidth()' },
    /* a string cut or wrapped is translated whole first, so the Korean is what gets cut or wrapped */
    { file: 'renderer/widgets.js', find: "function fit(cv, s, w, size, font) {\n    s = String(s);",
        replace: "const KO = require('./kit/ak_ko');\nfunction fit(cv, s, w, size, font) {\n    s = KO.tr(s);", why: 'fit()' },
    { file: 'renderer/widgets.js', find: "    for (const word of String(s || '').split(/\\s+/).filter(Boolean)) {",
        replace: "    for (const word of KO.tr(s || '').split(/\\s+/).filter(Boolean)) {", why: 'wrap()' },

    /* ---- the iDrive 7 skin (myapp-id7 kit SKINS.idrive7, sheet.js, gauges.js focusFill): near-black, flat panels and
       buttons, thin grey lines, the orange focus gradient, regular weight, no letter spacing ---- */
    { file: 'renderer/kit/themes.js', find: "function theme(id) { return THEMES[id] || THEMES.m_tricolour; }",
        replace: "/* the iDrive 7 skin (akakingj/myapp-comfort): every app of this copy draws as the head unit's own screens */\n" +
            "const SKINS = {\n    idrive7: {\n        name: 'iDrive 7', skin: 'idrive7',\n" +
            "        bg: '#030304', panelTop: '#0b0b0d', panelBottom: '#060607', panelEdge: '#2c2b2f',\n" +
            "        tab: '#f4f3f2', track: '#4b4a50', tick: '#8f8d92', text: '#f4f3f2', dim: '#b5b3b4',\n" +
            "        accent: '#ff570c', accent2: '#ff8a4c', ok: '#e6e5e8', warn: '#ffb020', crit: '#f32d2e', cold: '#7fd1ff',\n" +
            "        glow: '#ff570c40', stripes: ['#ff570c'], oil: '#f32d2e', bar: '#cfced3', hang: '#ff570c', sel: '#ff570c', selText: '#ffffff',\n" +
            "        marker: '#f32d2e', needle: '#f32d2e',\n        ramp: ['#8e8d92', '#c9c8cc', '#f2f2f4'],\n" +
            "        hotRamp: ['#8e8d92', '#b4b3b7', '#dcdbde', '#f0eff2', '#f32d2e'],\n" +
            "        line: '#545154', silver: ['#f6f6f8', '#c9c8cd', '#8d8c92'], focusTop: '#743008', focusBottom: '#361303',\n    },\n};\n" +
            "function theme(id, skin) { return (skin && SKINS[skin]) || THEMES[id] || THEMES.m_tricolour; }",
        why: 'SKINS.idrive7 as myapp-id7\'s' },
    { file: 'renderer/kit/themes.js', find: "module.exports = { THEMES, theme, ids };", replace: "module.exports = { THEMES, SKINS, theme, ids };" },
    { file: 'renderer/gpu.js', find: "t = kitTheme(st.theme), area", replace: "t = kitTheme(st.theme, 'idrive7'), area", why: 'the kit elements in the skin' },
    { file: 'renderer/tele-widgets.js',
        find: "    bg: '#000000', panel: '#0b0d10', edge: '#22272f', track: '#16191e', text: '#f2f2f2', dim: '#8b9099', faint: '#4a4f57',\n    accent: '#ffb020', onAccent: '#000000', ok: '#5bd68a', warn: '#ffb020', crit: '#ff3b30', info: '#7fc4ff', credit: '#6b7280',\n};",
        replace: "    bg: '#030304', panel: '#0b0b0d', edge: '#545154', track: '#1b1b1e', text: '#f4f3f2', dim: '#b5b3b4', faint: '#5d5b60',\n" +
            "    accent: '#ff570c', onAccent: '#ffffff', ok: '#5bd68a', warn: '#ffb020', crit: '#f32d2e', info: '#7fd1ff', credit: '#77757a',\n" +
            "    focusTop: '#743008', focusBottom: '#361303', rail: '#4b4a50', silver: ['#f6f6f8', '#c9c8cd', '#8d8c92'], marker: '#f32d2e',\n};\n" +
            "/* the iDrive 7 skin's focus: the orange gradient with a thin orange line at its top and foot (myapp-id7 gauges.js focusFill) */\n" +
            "const focus7 = (cv, x, y, w, h, a) => {\n" +
            "    const k = a == null ? 1 : a;\n" +
            "    cv.gradientRect(x, y, w, h, [[0, withAlpha(C.focusTop, k)], [1, withAlpha(C.focusBottom, k)]]);\n" +
            "    cv.fillRect(x, y, w, 2, C.accent); cv.fillRect(x, y + h - 2, w, 2, C.accent);\n};\n" +
            "/* a silver rail fill, lightest at the top */\n" +
            "const silver7 = (cv, x, y, w, h) => { if (w > 0) cv.gradientRect(x, y, w, h, [[0, C.silver[0]], [0.5, C.silver[1]], [1, C.silver[2]]]); };",
        why: 'the palette: the iDrive 7 skin' },
    { file: 'renderer/tele-widgets.js', find: "const CAPS = { font: 'bold', spacing: 2 };", replace: "const CAPS = { font: 'label', spacing: 0 };",
        why: 'headings in the regular weight, no letter spacing (as the head unit)' },
    { file: 'renderer/tele-widgets.js', find: "function fit(cv, s, w, size, o) {                         // cut to a width, with an ellipsis\n    s = String(s);",
        replace: "const KO = require('./kit/ak_ko');\nfunction fit(cv, s, w, size, o) {                         // cut to a width, with an ellipsis\n    s = KO.tr(s);",
        why: 'Korean: cut whole' },
    /* buttons: flat (radius 3), a thin line round them; the primary one in the focus gradient */
    { file: 'renderer/tele-widgets.js',
        find: "    if (off) { cv.roundRect(x, y, w, h, 4, C.track); fg = C.faint; }\n    else if (kind === 'primary') { cv.roundRect(x, y, w, h, 4, C.accent); fg = C.onAccent; }\n    else if (kind === 'danger') { cv.roundRect(x, y, w, h, 4, C.crit); fg = '#ffffff'; }\n    else if (kind === 'quiet') cv.roundRect(x, y, w, h, 4, C.track);\n    else { cv.strokeRoundRect(x, y, w, h, 4, 2, kind === 'dangerOutline' ? withAlpha(C.crit, 0.8) : C.edge); fg = kind === 'dangerOutline' ? C.crit : C.text; }",
        replace: "    if (off) { cv.roundRect(x, y, w, h, 3, C.track); fg = C.faint; }\n    else if (kind === 'primary') { focus7(cv, x, y, w, h); fg = C.onAccent; }\n    else if (kind === 'danger') { cv.roundRect(x, y, w, h, 3, C.crit); fg = '#ffffff'; }\n    else if (kind === 'quiet') { cv.roundRect(x, y, w, h, 3, C.panel); cv.strokeRoundRect(x, y, w, h, 3, 2, C.edge); }\n    else { cv.strokeRoundRect(x, y, w, h, 3, 2, kind === 'dangerOutline' ? withAlpha(C.crit, 0.8) : C.edge); fg = kind === 'dangerOutline' ? C.crit : C.text; }",
        why: 'btn()' },
    /* segments: the chosen one in the focus gradient, white */
    { file: 'renderer/tele-widgets.js', find: "    cv.strokeRoundRect(x, y, w, h, 4, 2, C.edge);\n    its.forEach((it, i) => {\n        const bx = x + i * bw, size = h >= 80 ? T.sub : T.cap;\n        if (i === sel) cv.roundRect(bx, y, bw, h, 4, off ? C.track : C.accent);",
        replace: "    cv.strokeRoundRect(x, y, w, h, 3, 2, C.edge);\n    its.forEach((it, i) => {\n        const bx = x + i * bw, size = h >= 80 ? T.sub : T.cap;\n        if (i === sel) { if (off) cv.roundRect(bx, y, bw, h, 3, C.track); else focus7(cv, bx, y, bw, h); }",
        why: 'seg()' },
    /* a switch: a check box (silver frame, orange check), as the head unit's settings */
    { file: 'renderer/tele-widgets.js',
        find: "    const w = 116, h = 62, X = xr - w;\n    cv.roundRect(X, y, w, h, 6, on && !off ? C.accent : C.track);\n    if (!on || off) cv.strokeRoundRect(X, y, w, h, 6, 2, C.faint);\n    cv.roundRect(on ? X + w - 55 : X + 7, y + 7, 48, 48, 3, on && !off ? '#000000' : C.dim);",
        replace: "    const s = 52, X = xr - s - 4, Y = y + (62 - s) / 2;\n    cv.roundRect(X, Y, s, s, 3, C.panel);\n    cv.strokeRoundRect(X, Y, s, s, 3, 3, off ? C.faint : C.silver[1]);\n    if (on) cv.polyline([[X + s * 0.22, Y + s * 0.52], [X + s * 0.42, Y + s * 0.72], [X + s * 0.8, Y + s * 0.3]], 6, off ? C.faint : C.accent);",
        why: 'toggle()' },
    /* a slider: the grey rail, its silver fill, the red marker */
    { file: 'renderer/tele-widgets.js',
        find: "    cv.fillRect(x, cy - 4, w, 8, C.track); cv.fillRect(x, cy - 4, w * f, 8, off ? C.faint : C.accent);\n    cv.roundRect(x + w * f - 6, cy - 22, 12, 44, 2, fg);",
        replace: "    cv.fillRect(x, cy - 5, w, 10, C.rail); if (off) cv.fillRect(x, cy - 5, w * f, 10, C.faint); else silver7(cv, x, cy - 5, w * f, 10);\n    cv.fillRect(x + w * f - 3, cy - 22, 6, 44, off ? C.faint : C.marker);",
        why: 'sliderDraw()' },
    /* a chosen row: the focus gradient across it */
    { file: 'renderer/tele-widgets.js', find: "    if (o.selected) cv.fillRect(x, y + 12, 5, h - 26, C.accent);",
        replace: "    if (o.selected) focus7(cv, x, y + 2, w, h - 4);", why: 'rowDraw()' },
    { file: 'renderer/tele-widgets.js',
        find: "    cv.fillRect(x, y, w, h, selected ? withAlpha(C.accent, 0.1) : C.panel);\n    cv.strokeRoundRect(x, y, w, h, 4, 2, selected ? C.accent : C.edge);",
        replace: "    if (selected) focus7(cv, x, y, w, h); else { cv.fillRect(x, y, w, h, C.panel); cv.strokeRoundRect(x, y, w, h, 3, 2, C.edge); }",
        why: 'tile()' },
    { file: 'renderer/tele-widgets.js',
        find: "    cv.fillRect(x, y, w, h, o.selected ? withAlpha(C.accent, 0.1) : C.panel);\n    cv.strokeRoundRect(x, y, w, h, 4, 2, o.selected ? C.accent : C.edge);",
        replace: "    if (o.selected) focus7(cv, x, y, w, h); else { cv.fillRect(x, y, w, h, C.panel); cv.strokeRoundRect(x, y, w, h, 3, 2, C.edge); }",
        why: 'appTile()' },
    { file: 'renderer/tele-widgets.js', find: "module.exports = {", replace: "module.exports = { focus7, silver7,", why: 'for the comfort elements and the controller' },
    /* the seat page's controls: a neutral face, the held end in the focus colours */
    { file: 'renderer/tele-comfort.js', find: "const PAD = '#1b2129';", replace: "const PAD = '#1b1b1e';", why: 'neutral, not blue' },
    { file: 'renderer/tele-comfort.js',
        find: "    if (off) { cv.roundRect(b.x, b.y, b.w, b.h, 4, C.track); fg = C.faint; }\n    else if (on) { cv.roundRect(b.x, b.y, b.w, b.h, 4, C.accent); fg = C.onAccent; }\n    else cv.strokeRoundRect(b.x, b.y, b.w, b.h, 4, 2, C.edge);",
        replace: "    if (off) { cv.roundRect(b.x, b.y, b.w, b.h, 3, C.track); fg = C.faint; }\n    else if (on) { TWS.focus7(cv, b.x, b.y, b.w, b.h); fg = C.onAccent; }\n    else cv.strokeRoundRect(b.x, b.y, b.w, b.h, 3, 2, C.edge);",
        why: 'holdButton' },
    { file: 'renderer/tele-comfort.js', find: "const { C, T, CAPS, caps, fit } = require('./tele-widgets');",
        replace: "const { C, T, CAPS, caps, fit } = require('./tele-widgets');\nconst TWS = require('./tele-widgets');" },
    /* the controller's place: the focus gradient over it (the head unit's focus), an orange frame while adjusting */
    { file: 'renderer/controller.js',
        find: "    rec.strokeRoundRect(r.x - pad, r.y - pad, r.w + 2 * pad, r.h + 2 * pad, 10, adjusting ? 6 : 4, adjusting ? ADJUST : RING);",
        replace: "    if (adjusting) return rec.strokeRoundRect(r.x - pad, r.y - pad, r.w + 2 * pad, r.h + 2 * pad, 3, 4, ADJUST);\n    TW.focus7(rec, r.x - pad, r.y - pad, r.w + 2 * pad, r.h + 2 * pad, 0.5);",
        why: 'ring()' },
];

/* the Telemetry palette's colours that the apps' screens (renderer/screens.json) name themselves -> the skin's */
const RECOLOR = {
    '#ffb020': '#ff570c', '#8b9099': '#b5b3b4', '#f2f2f2': '#f4f3f2', '#4a4f57': '#5d5b60', '#ff3b30': '#f32d2e',
    '#0b0d10': '#0b0b0d', '#22272f': '#545154', '#16191e': '#1b1b1e', '#6b7280': '#77757a',
};

/* the same colours set by the apps' own code (src/, the package's top) */
const akakingj_seats = [
    { top: true, file: 'src/main.js', find: "const COL = { dim: '#8b9099', accent: '#ffb020', warn: '#ffb020' };", replace: "const COL = { dim: '#b5b3b4', accent: '#ff570c', warn: '#ffb020' };", why: 'the skin\'s colours' },
];

module.exports = { common, RECOLOR, akakingj_seats };
