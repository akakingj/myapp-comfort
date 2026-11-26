#!/usr/bin/env node
'use strict';
/**
 * ak/repack.js - makes this copy's Korean, iDrive 7 skinned packages from IterioDev's (personal copy: README).
 *
 *   node ak/repack.js [id ...]          every app in ak/apps.json (or those named): apps/<id>/<id>@<version>.tgz
 *   node ak/repack.js --tree DIR [id]   also leaves each unpacked package in DIR/<id> (ak/check.js, ak/preview.js)
 *
 * For each app: IterioDev's package at their commit fromRef (ak/apps.json; apps/<from>/<from>@<fromVersion>.tgz) is unpacked in a
 * temporary folder, given this copy's version (ak/apps.json; the id stays IterioDev's, so it installs as an update), the
 * common files (ak/common: the Korean module, its fonts) and its own table (ak/apps/<id>/ko.json, which also gives the
 * HMI texts: each rhmiData en_GB.json gets a ko_KR.json beside it), its iDrive icon made smaller in its square
 * (ak/inset_icon.py), the edits of ak/edits.js made (each must find its text exactly where it says, or the run stops), and packed again. Nothing
 * unpacked is kept in the repository. When IterioDev's packages change: merge their release, set fromRef and fromVersion, remove their new package from apps/<id>,
 * run this, check (ak/check.js), and look (ak/preview.js).
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const AK = __dirname;
const SPEC_ALL = JSON.parse(fs.readFileSync(path.join(AK, 'apps.json'), 'utf8'));
const SPEC = SPEC_ALL.apps, FROM = SPEC_ALL.fromRef;
const EDITS = require('./edits');

const args = process.argv.slice(2);
let treeDir = null;
const only = [];
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--tree') treeDir = path.resolve(args[++i]);
    else only.push(args[i]);
}

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, o, indent) => fs.writeFileSync(p, JSON.stringify(o, null, indent === undefined ? 2 : indent) + '\n');
function copyDir(from, to) {
    fs.mkdirSync(to, { recursive: true });
    for (const n of fs.readdirSync(from)) {
        const a = path.join(from, n), b = path.join(to, n);
        if (fs.statSync(a).isDirectory()) copyDir(a, b); else fs.copyFileSync(a, b);
    }
}
function edit(base, e, app) {
    const p = path.join(base, e.file);
    if (!fs.existsSync(p)) { if (e.optional) return; throw new Error(app.id + ': no ' + e.file); }
    let s = fs.readFileSync(p, 'utf8');
    const n = s.split(e.find).length - 1;
    const want = e.count === undefined ? 1 : e.count;
    if (n !== want && !(e.optional && n === 0)) throw new Error(`${app.id}: ${e.file}: "${e.find.slice(0, 70)}" found ${n} times, not ${want} (${e.why || ''})`);
    s = s.split(e.find).join(typeof e.replace === 'function' ? e.replace(app) : e.replace);
    fs.writeFileSync(p, s);
}

for (const app of SPEC) {
    app.id = app.from;
    if (only.length && only.indexOf(app.id) < 0) continue;
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ak-repack-'));
    const src = `apps/${app.from}/${app.from}@${app.fromVersion}.tgz`;
    fs.writeFileSync(path.join(tmp, 'from.tgz'), execFileSync('git', ['-C', ROOT, 'show', FROM + ':' + src], { maxBuffer: 1 << 30 }));
    const work = path.join(tmp, 'pkg');
    fs.mkdirSync(work);
    execFileSync('tar', ['-xzf', path.join(tmp, 'from.tgz'), '-C', work]);
    const id = app.id;
    const oldTree = `${id}@${app.fromVersion}`, tree = `${id}@${app.version}`;
    fs.renameSync(path.join(work, oldTree), path.join(work, tree));
    const T = path.join(work, tree);

    /* the version */
    const m = readJson(path.join(work, 'mgu-app.json'));
    m.version = app.version; m.tree = tree;
    writeJson(path.join(work, 'mgu-app.json'), m);
    const pkg = readJson(path.join(T, 'package.json'));
    pkg.version = app.version;
    writeJson(path.join(T, 'package.json'), pkg);

    /* the Korean module and fonts, the app's own table and HMI texts */
    copyDir(path.join(AK, 'common', 'kit'), path.join(T, 'renderer', 'kit'));
    const own = path.join(AK, 'apps', app.id);
    const ko = readJson(path.join(own, 'ko.json'));
    fs.copyFileSync(path.join(own, 'ko.json'), path.join(T, 'renderer', 'ko.json'));
    (function hmiTexts(dir) {
        for (const n of fs.readdirSync(dir)) {
            const p = path.join(dir, n);
            if (fs.statSync(p).isDirectory()) { hmiTexts(p); continue; }
            if (n !== 'en_GB.json') continue;
            const en = readJson(p), out = {};
            for (const k of Object.keys(en)) {
                if (!ko[en[k]]) throw new Error(`${app.id}: ${path.relative(T, p)}: no Korean for "${en[k]}"`);
                out[k] = ko[en[k]];
            }
            writeJson(path.join(dir, 'ko_KR.json'), out);
        }
    })(path.join(T, 'rhmiData'));

    /* the screens' own colours in the skin's */
    const scr = path.join(T, 'renderer', 'screens.json');
    let sj = fs.readFileSync(scr, 'utf8');
    for (const k of Object.keys(EDITS.RECOLOR)) sj = sj.split(k).join(EDITS.RECOLOR[k]).split(k.toUpperCase()).join(EDITS.RECOLOR[k]);
    fs.writeFileSync(scr, sj);

    /* the edits */
    for (const e of EDITS.common) edit(T, e, app);
    for (const e of (EDITS[app.id] || [])) edit(e.top ? work : T, e, app);

    /* the iDrive icon smaller in its square, so iDrive 7's frame round the chosen app shows (ak/inset_icon.py) */
    const res = path.join(T, 'rhmiData', 'resources');
    const icons = fs.readdirSync(res).filter((n) => /_icon\.png$/.test(n)).map((n) => path.join(res, n));
    if (!icons.length) throw new Error(`${app.id}: no rhmiData/resources/*_icon.png`);
    execFileSync('python3', [path.join(AK, 'inset_icon.py')].concat(icons));

    /* the Store's entry (apps/<id>/app.json): IterioDev's, renamed */
    const store = JSON.parse(execFileSync('git', ['-C', ROOT, 'show', `${FROM}:apps/${app.from}/app.json`]).toString());
    store.version = app.version; if (app.ko) store.texts = { ko: app.ko };
    const storeDir = path.join(ROOT, 'apps', id);
    fs.mkdirSync(storeDir, { recursive: true });
    fs.writeFileSync(path.join(storeDir, 'app.json'), JSON.stringify(store, null, 1) + '\n');

    /* packed as IterioDev's are: the tree, mgu-app.json, src/ */
    const outDir = path.join(ROOT, 'apps', id);
    fs.mkdirSync(outDir, { recursive: true });
    const out = path.join(outDir, `${tree}.tgz`);
    const top = fs.readdirSync(work).sort();
    const raw = execFileSync('tar', ['--sort=name', '--mtime=2026-11-26 00:00:00Z', '--owner=0', '--group=0', '--numeric-owner',
        '-cf', '-', '-C', work].concat(top), { maxBuffer: 1 << 30 });
    fs.writeFileSync(out, execFileSync('gzip', ['-n', '-9'], { input: raw, maxBuffer: 1 << 30 }));
    if (treeDir) { fs.rmSync(path.join(treeDir, app.id), { recursive: true, force: true }); copyDir(work, path.join(treeDir, app.id)); }
    fs.rmSync(tmp, { recursive: true, force: true });
    console.log(`${app.from} ${app.fromVersion} -> ${path.relative(ROOT, out)} (${fs.statSync(out).size} bytes)`);
}
