'use strict';
/**
 * ak_ko.js - akakingj/myapp-comfort (personal copy, IterioDev's permission: README): the app's screens in Korean.
 *
 * tr(s): the Korean of a string about to be drawn, from ../ko.json ({ "English": "한국어" }); a key with {0}, {1}...
 * matches any text there and passes it on ("Its seat module answered: {0}"). A string with no entry is drawn as it
 * is (and kept in misses() for the PC check). font(family, s): text with Hangul in it is drawn with the Korean
 * atlas (fonts/ak_korean.json, ak_korean_bold.json for the bold family), which has the Latin letters and digits too;
 * everything else keeps the app's own fonts. Text in capitals (the design's caps labels) matches its key in any case.
 */
const fs = require('fs');
const path = require('path');

let exact = Object.create(null), upper = Object.create(null), patterns = [];
try {
    const table = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'ko.json'), 'utf8'));
    for (const k of Object.keys(table)) {
        if (k.charAt(0) === '_') continue;                       // "_note": comments
        if (/\{\d\}/.test(k)) {
            const names = [];
            const re = new RegExp('^' + k.split(/(\{\d\})/).map((p) => {
                const m = /^\{(\d)\}$/.exec(p);
                if (m) { names.push(+m[1]); return '([\\s\\S]+?)'; }
                return p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            }).join('') + '$');
            patterns.push({ re, reI: new RegExp(re.source, 'i'), names, to: table[k] });
        } else { exact[k] = table[k]; if (!(k.toUpperCase() in upper)) upper[k.toUpperCase()] = table[k]; }
    }
} catch (e) { /* no table: English */ }

const missed = new Set();
const HANGUL = /[ᄀ-ᇿ㄰-㆏ꥠ-꥿가-퟿]/;

function tr(str) {
    const s = String(str);
    if (!s || HANGUL.test(s)) return s;
    if (exact[s] !== undefined) return exact[s];
    const caps = s === s.toUpperCase();
    if (caps && upper[s] !== undefined) return upper[s];
    for (const p of patterns) {
        const m = (caps ? p.reI : p.re).exec(s);
        if (m) {
            const v = [];
            p.names.forEach((n, i) => { v[n] = tr(m[i + 1]); });
            return p.to.replace(/\{(\d)\}/g, (all, n) => (v[+n] !== undefined ? v[+n] : all));
        }
    }
    if (/[A-Za-z]{2}/.test(s)) missed.add(s);
    return s;
}

function font(family, s) {
    if (!HANGUL.test(s)) return family;
    return family === 'bold' ? 'ak_korean_bold' : 'ak_korean';
}

module.exports = { tr, font, HANGUL, misses: () => missed };
