// Node test for src/container_doc.js, src/editors/hex.js and src/editors/pack.js (no DOM).
require('../src/core.js'); require('../src/registry.js'); require('../src/packs.js'); require('../src/container_doc.js');
require('../src/editors/hex.js'); require('../src/editors/pack.js');
const FX = globalThis.FX;
const assert = (c, m) => { if (!c) throw new Error('FAIL: ' + m); };
const eq = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
const pack = FX.editors.find(e => e.id === 'pack'), hexEd = FX.editors.find(e => e.id === 'hex');

// himgd sample through the pack browser
const s = pack.sample(); const u8 = new Uint8Array(s.buf);
assert(FX.detect('x.dat', u8).id === 'pack', 'detect himgd as pack');
const d = pack.open(s.buf, 'x.dat');
assert(d.sections.length === 4 && d.sections[0].id === 'overview', 'overview + 3 slots');
assert(eq(d.build(), u8), 'identical rebuild');
assert(d.changeSummary().count === 0, 'no changes');
const img = new Uint8Array(100); img.set([0x54, 0x49, 0x4D, 0x32]);
d.setSection(1, img);
const out = d.build(); const p2 = FX.packs.parse('himgd', out);
assert(eq(p2.sections[1].bytes.subarray(0, 100), img), 'slot 1 filled');
assert(p2.sections[0].bytes[4] === 1 && new DataView(out.buffer).getUint16(8, true) === 7, 'index word and slot 0 kept');
assert(d.changeSummary().count === 1, 'one change');
d.setSection(1, null); assert(eq(d.build(), u8), 'back to original after removing again');
assert(d.exports().length === 2, 'exports');

// hex editor keeps the exact length
const raw = new Uint8Array(300).map((_, i) => i * 7);
const h = hexEd.open(raw.slice().buffer, 'r.bin');
assert(h.sections[0].count === 2 && eq(h.build(), raw), 'hex rows and length');
h.setByte(h.sections[0], 1, 3, 0xAA); const hb = h.build();
assert(hb.length === 300 && hb[259] === 0xAA, 'hex edit');
assert(FX.detect('unknown.xyz', new Uint8Array([1, 2, 3])).id === 'hex', 'hex fallback');
console.log('CONTAINER DOC TEST OK');
