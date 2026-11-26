#!/usr/bin/env node
'use strict';
/**
 * ak/strings.js TREE - the English an app may draw, for its ko.json: the texts of renderer/screens.json and the
 * string literals of src/*.js and the app's own renderer files that read like words (template literals with their
 * ${...} as {0}, {1}...). Marks those ko.json has (=) and those it lacks (+). A list to work from: not every literal
 * is drawn, and kit-made strings (a list's own words) come from ak/preview.js's misses.
 */
const fs = require('fs');
const path = require('path');
const tree = path.resolve(process.argv[2]);
const top = path.dirname(tree);
const ko = (() => { try { return JSON.parse(fs.readFileSync(path.join(tree, 'renderer/ko.json'), 'utf8')); } catch (e) { return {}; } })();
const found = new Map();
const add = (s, where) => {
    s = s.trim();
    if (!/[A-Za-z]{2}/.test(s) || /^[a-z][A-Za-z0-9]*$/.test(s) || /^[A-Z_0-9]+$/.test(s) && s.length > 24) return;
    if (/^[\w./-]+\.(js|json|png|sock|log)$|^\/|^https?:|^#[0-9a-f]{3,8}$|^\w+:\/\//.test(s)) return;
    if (!found.has(s)) found.set(s, where);
};
const scr = JSON.parse(fs.readFileSync(path.join(tree, 'renderer/screens.json'), 'utf8'));
(function walk(o, k) {
    if (typeof o === 'string') { if (/^(text|label|title|sub|tabs|buttons|chips|head|line|hint|placeholder|items|columns|legend|unit|caption|name|app|options|rows)$/.test(k)) o.split(k === 'tabs' || k === 'buttons' ? ',' : '\n').forEach((x) => add(x, 'screens.json:' + k)); return; }
    if (Array.isArray(o)) return o.forEach((x) => walk(x, k));
    if (o && typeof o === 'object') for (const kk of Object.keys(o)) walk(o[kk], kk);
})(scr, '');
const files = fs.readdirSync(path.join(top, 'src')).map((f) => path.join(top, 'src', f))
    .concat(['store-widgets.js', 'tele-comfort.js', 'tele-clipgrid.js', 'controller.js'].map((f) => path.join(tree, 'renderer', f)).filter((f) => fs.existsSync(f)));
for (const f of files) {
    const src = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    const re = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;
    let m;
    while ((m = re.exec(src))) {
        let s = m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3];
        if (m[3] !== undefined) { let n = 0; s = s.replace(/\$\{[^}]*\}/g, () => '{' + (n++) + '}'); }
        s = s.replace(/\\'/g, "'").replace(/\\"/g, '"');
        if (/\s/.test(s) || /^[A-Z][a-z]+$/.test(s) || /^[A-Z][A-Z ]+$/.test(s)) add(s, path.basename(f));
    }
}
for (const [s, w] of found) console.log((ko[s] !== undefined ? '= ' : '+ ') + JSON.stringify(s) + '   (' + w + ')');
