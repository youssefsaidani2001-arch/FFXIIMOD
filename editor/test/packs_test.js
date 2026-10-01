// Round-trip tests for editor/src/packs.js with synthetic containers built to the documented layouts.
require('../src/packs.js');
const { packs } = globalThis.FX;
const assert = (c, m) => { if (!c) throw new Error('FAIL: ' + m); };
const align16 = n => (n + 15) & ~15;
const rnd = (n, s) => { const b = new Uint8Array(n); let x = s; for (let i = 0; i < n; i++) { x = (x * 1103515245 + 12345) >>> 0; b[i] = x >>> 24; } return b; };
const eq = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

// battlepack: 71 sections, some empty
{
  const n = 71, secs = {}; [0, 3, 14, 16, 61, 70].forEach((i, k) => secs[i] = rnd(37 + k * 101, i + 1));
  let pos = align16(4 + (n + 1) * 4); const offs = [];
  for (let i = 0; i < n; i++) { pos = align16(pos); offs.push(pos); if (secs[i]) pos += secs[i].length; }
  const out = new Uint8Array(align16(pos)); const dv = new DataView(out.buffer); dv.setUint32(0, n, true);
  offs.forEach((o, i) => dv.setUint32(4 + i * 4, o, true)); dv.setUint32(4 + n * 4, pos, true);
  for (let i = 0; i < n; i++) if (secs[i]) out.set(secs[i], offs[i]);
  const p = packs.parse(null, out); assert(p.kind === 'battlepack' && p.count === 71, 'bp detect');
  assert(p.sections[1].bytes === null && p.sections[70].bytes.length === secs[70].length, 'bp empty + last');
  assert(eq(packs.build(p), out), 'bp identical round trip');
  p.sections[14].bytes = rnd(5000, 9); const b2 = packs.build(p); const p2 = packs.parse('battlepack', b2);
  assert(eq(p2.sections[14].bytes.subarray(0, 5000), p.sections[14].bytes) && eq(p2.sections[70].bytes.subarray(0, secs[70].length), secs[70]), 'bp resize keeps later sections');
  assert(p2.endOffset === new DataView(b2.buffer).getUint32(4 + 71 * 4, true) && b2.length % 16 === 0, 'bp end offset + padding');
}
// otherpack: 11 sections, header 0x30, 0xFF fill
{
  const n = 5, secs = [rnd(100, 1), rnd(48, 2), null, rnd(7, 3), rnd(300, 4)];
  const headLen = align16(n * 4 + 4); let pos = headLen; const offs = [];
  const parts = []; for (let i = 0; i < n; i++) { offs.push(pos); if (secs[i]) { parts.push([pos, secs[i]]); pos = align16(pos + secs[i].length); } }
  const out = new Uint8Array(pos); out.fill(0xFF, 0, headLen); const dv = new DataView(out.buffer);
  offs.forEach((o, i) => dv.setUint32(i * 4, o, true)); dv.setUint32(n * 4, 0xFFFFFFFF, true); for (const [o, b] of parts) out.set(b, o);
  const p = packs.parse(null, out); assert(p.kind === 'otherpack' && p.count === 5 && p.sections[2].bytes === null, 'otherpack parse');
  assert(eq(packs.build(p), out), 'otherpack identical');
  p.sections[1].bytes = rnd(200, 5); const p2 = packs.parse('otherpack', packs.build(p));
  assert(eq(p2.sections[4].bytes.subarray(0, 300), secs[4]), 'otherpack resize');
}
// ebp: 20 sections, physical order not index order, section 6 + 19 present
{
  const order = [0, 6, 19, 16, 4]; const secs = {}; order.forEach((i, k) => secs[i] = rnd(50 + k * 33, i + 7));
  let pos = 0x80; const offs = new Array(20).fill(0), parts = [];
  for (const i of order) { offs[i] = pos; parts.push([pos, secs[i]]); pos = align16(pos + secs[i].length); }
  const out = new Uint8Array(pos); out.set([0x45, 0x42, 0x50, 0x32]); out[5] = 0x77; out[0x61] = 0x11; const dv = new DataView(out.buffer);
  offs.forEach((o, i) => dv.setUint32(0x10 + i * 4, o, true)); for (const [o, b] of parts) out.set(b, o);
  const p = packs.parse(null, out); assert(p.kind === 'ebp' && p.order.join() === order.join(), 'ebp order');
  assert(eq(packs.build(p), out), 'ebp identical (keeps header bytes 0x04-0x0F, 0x60-0x7F)');
  p.sections[6].bytes = rnd(999, 1); const p2 = packs.parse('ebp', packs.build(p));
  assert(p2.order.join() === order.join() && eq(p2.sections[19].bytes.subarray(0, secs[19].length), secs[19]), 'ebp resize keeps order');
}
// ard: section 1 last, unpadded
{
  const order = [2, 3, 4, 7, 8, 9, 1]; const secs = {}; order.forEach((i, k) => secs[i] = rnd(64 + k * 13 + (i === 1 ? 5 : 0), i));
  let pos = 0x30; const offs = new Array(10).fill(0), parts = [];
  order.forEach((i, j) => { offs[i] = pos; parts.push([pos, secs[i]]); pos += secs[i].length; if (j < order.length - 1) pos = align16(pos); });
  const out = new Uint8Array(pos); out.set(new TextEncoder().encode('FF12AR03')); const dv = new DataView(out.buffer);
  offs.forEach((o, i) => dv.setUint32(8 + i * 4, o, true)); for (const [o, b] of parts) out.set(b, o);
  const p = packs.parse(null, out); assert(p.kind === 'ard' && p.order[p.order.length - 1] === 1, 'ard order');
  assert(eq(packs.build(p), out), 'ard identical, no trailing pad');
  p.sections[4].bytes = rnd(500, 3); const b2 = packs.build(p); const p2 = packs.parse('ard', b2);
  assert(p2.order[p2.order.length - 1] === 1 && eq(p2.sections[1].bytes, secs[1]) && b2.length % 16 !== 0, 'ard resize keeps section 1 last');
}
// himgd: keep the index word and empty slots
{
  const n = 4, imgs = [rnd(40, 1), null, rnd(70, 2), rnd(16, 3)].map(b => b && (b.set([0x54, 0x49, 0x4D, 0x32]), b));
  const headLen = align16(12 + 4 * n); let pos = headLen; const offs = new Array(n).fill(0), parts = [];
  imgs.forEach((b, i) => { if (b) { offs[i] = pos; parts.push([pos, b]); pos = align16(pos + b.length); } });
  const out = new Uint8Array(pos); out.set(new TextEncoder().encode('himgd')); const dv = new DataView(out.buffer); dv.setUint16(8, 0x1234, true); dv.setUint16(10, n, true);
  offs.forEach((o, i) => dv.setUint32(12 + i * 4, o, true)); for (const [o, b] of parts) out.set(b, o);
  const p = packs.parse(null, out); assert(p.kind === 'himgd' && p.sections[1].bytes === null, 'himgd parse');
  assert(eq(packs.build(p), out), 'himgd identical');
  assert(packs.magicName(p.sections[0].bytes) === 'TIM2', 'magic name');
}
console.log('PACKS TEST OK');
