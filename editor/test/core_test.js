require('/home/user/FFXIIMOD/editor/src/core.js');
const { Battlepack, luaPatch, zipStore } = globalThis.BPCore;
const fs = require('fs');
const schema = JSON.parse(fs.readFileSync('/home/user/FFXIIMOD/editor/data/bpack_schema.json', 'utf8'));

// ---- build a synthetic battlepack: 70 sections, st2e blobs with relative list pointer 0x20
const N = 70, secs = {};
function st2e(count, size, fill) {
  const b = new Uint8Array(0x20 + count * size);
  b.set([0x73, 0x74, 0x32, 0x65]); const dv = new DataView(b.buffer);
  dv.setUint32(4, count, true); dv.setUint16(8, size, true); dv.setUint32(0xC, 0x20, true);
  for (let i = 0; i < count * size; i++) b[0x20 + i] = fill(i);
  return b;
}
secs[0] = (() => { const b = new Uint8Array(4 + 23 * 8); const dv = new DataView(b.buffer); dv.setUint16(0, 8, true); dv.setUint16(2, 23, true); for (let i = 0; i < 23 * 8; i++) b[4 + i] = i & 0xFF; return b; })();
secs[13] = st2e(557, 0x30, i => (i * 7) & 0xFF);
secs[14] = st2e(544, 0x3C, i => (i * 3) & 0xFF);
secs[16] = st2e(40, 0x80, i => (i * 5) & 0xFF);
secs[57] = st2e(128, 0x24, i => 0);
secs[10] = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]); // bespoke blob
let total = 4 + N * 4; const offs = new Array(N).fill(0);
for (const id of Object.keys(secs).map(Number).sort((a, b) => a - b)) { offs[id] = total; total += secs[id].length; }
const file = new Uint8Array(total); const fdv = new DataView(file.buffer);
fdv.setUint32(0, N, true); for (let i = 0; i < N; i++) fdv.setUint32(4 + i * 4, offs[i], true);
for (const id of Object.keys(secs)) file.set(secs[id], offs[id]);

const bp = new Battlepack(file.buffer.slice(0), schema);
const s14 = bp.sections[14], s16 = bp.sections[16], s0 = bp.sections[0], s10 = bp.sections[10];
console.log('sec14', s14.kind, s14.count, s14.entrySize.toString(16), 'list@', s14.list.toString(16), 'fields', s14.fields.length);
console.log('sec0', s0.kind, s0.count, s0.entrySize, 'sec10 raw', s10.raw, 'missing count', bp.sections.filter(s => s.missing).length);
if (s14.count !== 544 || s14.entrySize !== 0x3C || s14.list !== offs[14] + 0x20) throw new Error('sec14 parse');

// ---- field roundtrip
const fld = n => s14.fields.find(f => f.name === n);
bp.set(s14, 480, fld('mpOrMistCost'), 7);
bp.set(s14, 480, fld('useEventScript'), 1);          // bit 30 of flags1
bp.set(s14, 480, fld('canTargetFoe'), 0);
bp.set(s14, 480, fld('summonedPartyMember'), 27);
if (bp.get(s14, 480, fld('mpOrMistCost')) !== 7) throw new Error('u8 roundtrip');
if (bp.get(s14, 480, fld('useEventScript')) !== 1) throw new Error('bit set');
if (bp.get(s14, 480, fld('canTargetFoe')) !== 0) throw new Error('bit clear');
if (bp.get(s14, 480, fld('summonedPartyMember')) !== 27) throw new Error('u16');
// 64-bit bitfield in section 16 augments
const aug = s16.fields.find(f => f.name === 'swiftcast');
bp.set(s16, 3, aug, 1); if (bp.get(s16, 3, aug) !== 1) throw new Error('bf64 set');
bp.set(s16, 3, aug, 0); if (bp.get(s16, 3, aug) !== 0) throw new Error('bf64 clear');
const model = s16.fields.find(f => f.name === 'model');
bp.set(s16, 3, model, -1); if (bp.get(s16, 3, model) !== -1) throw new Error('s32');
bp.setByte(s0, 2, 1, 0xAB); if (bp.getByte(s0, 2, 1) !== 0xAB) throw new Error('sec0 byte');

const ch = bp.changes();
console.log('changes', JSON.stringify(ch));
if (!ch.some(c => c.sec === 14 && c.row === 480 && c.off === 0x0A && c.bytes[0] === 7)) throw new Error('change list');
const lua = luaPatch(ch, { file: 'battle_pack.bin' });
if (!/sec = 14, row = 480, off = 0xA/.test(lua)) throw new Error('lua patch');
fs.writeFileSync('/tmp/BattlepackPatch.lua', lua);

// revert + reapply through JSON
const json = JSON.stringify(ch);
bp.revertRow(s14, 480); if (bp.get(s14, 480, fld('mpOrMistCost')) === 7) throw new Error('revert');
const bp2 = new Battlepack(file.buffer.slice(0), schema);
const n = bp2.applyChanges(JSON.parse(json));
if (bp2.get(bp2.sections[14], 480, fld('mpOrMistCost')) !== 7) throw new Error('applyChanges');
console.log('applied', n, 'runs');

// single-section blob
const one = new Battlepack(secs[14].buffer.slice(0), schema, { singleSection: 14 });
console.log('single', one.mode, one.sections[0].count, one.sections[0].fields.length);

// zip
const zip = zipStore([{ name: 'battle_pack.bin', data: bp2.u8 }, { name: 'BattlepackPatch.lua', data: lua }, { name: 'changes.json', data: json }]);
fs.writeFileSync('/tmp/out.zip', zip);
fs.writeFileSync('/tmp/sample_battle_pack.bin', file);
console.log('CORE TEST OK');
