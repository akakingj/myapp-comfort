#!/usr/bin/env node
'use strict';
/**
 * ak/check.js [id ...] - checks this copy's packages (ak/apps.json) as committed, on a PC:
 *  - files: apps/<id>/ holds app.json and <id>@<version>.tgz only beside README, icon and screenshots (IterioDev's
 *    id, this copy's version); no .mgu, dist/ or oap-sdk anywhere in the package;
 *  - names: mgu-app.json, package.json and app.json agree on id and version; rhmiData/application.json is IterioDev's;
 *  - syntax: node --check on every .js, JSON.parse on every .json of the package;
 *  - HMI texts: a ko_KR.json beside every en_GB.json, the same keys, Korean;
 *  - the Korean module and fonts are ak/common's; each atlas at most 512 rows;
 *  - every character of the app's ko.json is in every Korean atlas;
 *  - English left: each screen drawn (iDrive 7 and iDrive 8 layouts), the words ko.json lacks, less its "_keep".
 * Exits 1 on any problem.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const AK = __dirname;
const SPEC = JSON.parse(fs.readFileSync(path.join(AK, 'apps.json'), 'utf8')).apps;
const only = process.argv.slice(2);
let bad = 0;
const fail = (app, msg) => { bad++; console.log(`  FAIL ${app.id}: ${msg}`); };
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const walk = (d) => fs.readdirSync(d).reduce((a, n) => { const p = path.join(d, n); return a.concat(fs.statSync(p).isDirectory() ? walk(p) : [p]); }, []);
const HANGUL = /[가-힣]/;
const commonKit = path.join(AK, 'common', 'kit');

for (const app of SPEC) {
    app.id = app.from;
    if (only.length && only.indexOf(app.id) < 0) continue;
    console.log(`${app.id} ${app.version}`);
    const dir = path.join(ROOT, 'apps', app.id), tree = `${app.id}@${app.version}`, tgz = path.join(dir, `${tree}.tgz`);
    /* files */
    if (!fs.existsSync(tgz)) { fail(app, `no ${path.relative(ROOT, tgz)}`); continue; }
    for (const n of fs.readdirSync(dir)) if (['app.json', 'README.md', 'icon.png', 'screenshots', `${tree}.tgz`].indexOf(n) < 0) fail(app, `apps/${app.id}/${n}: not ours`);
    const store = readJson(path.join(dir, 'app.json'));
    if (store.id !== app.id || store.version !== app.version) fail(app, 'app.json id / version');
    if (!store.texts || !store.texts.ko || !HANGUL.test(store.texts.ko.title + store.texts.ko.description)) fail(app, 'app.json: no Korean texts');
    if (fs.existsSync(path.join(dir, 'README.md')) && !HANGUL.test(fs.readFileSync(path.join(dir, 'README.md'), 'utf8'))) fail(app, 'README: no Korean paragraph');

    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ak-check-'));
    execFileSync('tar', ['-xzf', tgz, '-C', tmp]);
    const top = fs.readdirSync(tmp).sort();
    if (top.join() !== ['mgu-app.json', 'src', tree].sort().join()) fail(app, `package top: ${top.join(', ')}`);
    const T = path.join(tmp, tree);
    const files = walk(tmp);
    files.filter((f) => /\.mgu$|[\\/]dist[\\/]|[\\/]oap-sdk[\\/]/.test(f)).forEach((f) => fail(app, `${path.relative(tmp, f)}: not to be packed`));
    /* names */
    const m = readJson(path.join(tmp, 'mgu-app.json')), pkg = readJson(path.join(T, 'package.json'));
    if (m.id !== app.id || m.version !== app.version || m.tree !== tree) fail(app, 'mgu-app.json');
    if (pkg.name !== app.id || pkg.version !== app.version) fail(app, 'package.json');
    // the HMI's registration as IterioDev's (an update of their app)
    const orig = execFileSync('sh', ['-c', `git -C "${ROOT}" show "main:apps/${app.id}/${app.id}@${app.fromVersion}.tgz" | tar -xzOf - "${app.id}@${app.fromVersion}/rhmiData/application.json"`]);
    if (!orig.equals(fs.readFileSync(path.join(T, 'rhmiData', 'application.json')))) fail(app, 'rhmiData/application.json is not IterioDev\'s');
    /* syntax */
    for (const f of files) {
        if (/\.js$/.test(f)) { try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); } catch (e) { fail(app, `${path.relative(tmp, f)}: ${String(e.stderr).split('\n').slice(0, 5).join(' ')}`); } }
        if (/\.json$/.test(f)) { try { readJson(f); } catch (e) { fail(app, `${path.relative(tmp, f)}: ${e.message}`); } }
    }
    /* HMI texts */
    files.filter((f) => path.basename(f) === 'en_GB.json').forEach((f) => {
        const ko = path.join(path.dirname(f), 'ko_KR.json');
        if (!fs.existsSync(ko)) return fail(app, `${path.relative(tmp, f)}: no ko_KR.json`);
        const e = readJson(f), k = readJson(ko);
        if (Object.keys(e).join() !== Object.keys(k).join() || Object.keys(k).some((x) => !HANGUL.test(k[x]) && k[x] !== e[x])) fail(app, `${path.relative(tmp, ko)}`);
    });
    /* the Korean module and fonts */
    walk(commonKit).forEach((f) => {
        const p = path.join(T, 'renderer', 'kit', path.relative(commonKit, f));
        if (!fs.existsSync(p) || !fs.readFileSync(p).equals(fs.readFileSync(f))) fail(app, `renderer/kit/${path.relative(commonKit, f)}: not ak/common's`);
    });
    const table = readJson(path.join(AK, 'apps', app.id, 'ko.json'));
    const chars = new Set();
    Object.keys(table).filter((k) => k.charAt(0) !== '_').forEach((k) => { for (const c of table[k]) chars.add(c); });
    for (const fam of ['ak_korean', 'ak_korean_bold']) {
        const atlas = readJson(path.join(T, 'renderer', 'kit', 'fonts', `${fam}.json`));
        for (const s of atlas.sizes) {
            if (s.atlasH > 512) fail(app, `${fam} ${s.size}: ${s.atlasH} rows`);
            const lack = [...chars].filter((c) => c !== ' ' && !s.glyphs[c.codePointAt(0)]);
            if (lack.length) fail(app, `${fam} ${s.size} lacks ${lack.join('')}`);
        }
    }
    /* English left on the screens */
    const out = execFileSync(process.execPath, ['-e', `
        const path = require('path'), fs = require('fs'), dir = ${JSON.stringify(T)};
        const gpu = require(path.join(dir, 'renderer/gpu.js')), E = require(path.join(dir, 'renderer/public/gpu-elements.js'));
        const scr = JSON.parse(fs.readFileSync(path.join(dir, 'renderer/screens.json'), 'utf8'));
        for (const st of scr.screens || []) if (st.kind === 'gpu') {
            gpu.record(st, { view: 'id7', textScale: E.viewScale('id7') });
            gpu.record(st, {});
        }
        console.log(JSON.stringify([...require(path.join(dir, 'renderer/kit/ak_ko.js')).misses()]));`], { cwd: tmp }).toString();
    const keep = table._keep || [];
    const left = JSON.parse(out.trim().split('\n').pop()).filter((s) => keep.indexOf(s) < 0);
    if (left.length) fail(app, `English left: ${JSON.stringify(left)}`);
    fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(bad ? `${bad} problem(s)` : 'all good');
process.exit(bad ? 1 : 0);
