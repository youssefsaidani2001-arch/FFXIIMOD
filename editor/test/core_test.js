// Node test for editor/src/core.js. Run: node editor/test/core_test.js
require('../src/core.js');
const { Battlepack, luaPatch, zipStore } = globalThis.BPCore;
const fs = require('fs'), path = require('path'), os = require('os');
const schema = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/bpack_schema.json'), 'utf8'));
const assert = (c, m) => { if (!c) throw new Error('FAIL: ' + m); };
const align16 = n => (n + 15) & ~15;

function st2e(count, size, fill) {
  const b = new Uint8Array(0x20 + count * size);
  b.set([0x73, 0x74, 0x32, 0x65]); const dv = new DataView(b.buffer);
  dv.setUint32(4, count, true); dv.setUint16(8, size, true); dv.setUint32(0xC, 0x20, true);
  for (let i = 0; i < count * size; i++) b[0x20 + i] = fill(i);
  return b;
}
// Container exactly as the game stores it: u32 count, count+1 offsets (last = end of data), 16-byte aligned sections
function pack(n, secs) {
  let pos = align16(4 + (n + 1) * 4); const offs = [];
  for (let i = 0; i < n; i++) { pos = align16(pos); offs.push(pos); pos += secs[i] ? secs[i].length : 0; }
  offs.push(pos);
  const out = new Uint8Array(align16(pos)); const dv = new DataView(out.buffer);
  dv.setUint32(0, n, true); offs.forEach((o, i) => dv.setUint32(4 + i * 4, o, true));
  for (let i = 0; i < n; i++) if (secs[i]) out.set(secs[i], offs[i]);
  return out;
}

const N = 71, secs = {};
secs[0] = (() => { const b = new Uint8Array(4 + 23 * 8); const dv = new DataView(b.buffer); dv.setUint16(0, 8, true); dv.setUint16(2, 23, true); for (let i = 0; i < 23 * 8; i++) b[4 + i] = i & 0xFF; return b; })();
secs[13] = st2e(557, 0x30, i => (i * 7) & 0xFF);
secs[14] = st2e(544, 0x3C, i => (i * 3) & 0xFF);
secs[16] = st2e(40, 0x80, i => (i * 5) & 0xFF);
secs[10] = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
const sub = {}; sub[0] = st2e(10, 0x10, i => i & 0xFF); sub[3] = st2e(4, 8, i => 0xAA);
secs[61] = pack(15, sub);
const file = pack(N, secs);

const bp = new Battlepack(file.buffer.slice(0), schema);
const S = id => bp.sections.find(s => String(s.id) === String(id));
assert(S(14).count === 544 && S(14).entrySize === 0x3C, 'sec14 parse');
assert(S(1).missing && S(1).empty, 'empty slot 1 must not alias the next section');
assert(S(0).kind === 'sec0' && S(0).count === 23, 'sec0');
assert(S(61).nested && S('61.0').count === 10 && S('61.3').count === 4 && S('61.1').empty, 'nested section 61');
assert(S(70) && S(70).missing, 'last section empty');

const fld = n => S(14).fields.find(f => f.name === n);
bp.set(S(14), 480, fld('mpOrMistCost'), 7);
bp.set(S(14), 480, fld('useEventScript'), 1);
bp.set(S(14), 480, fld('canTargetFoe'), 0);
bp.set(S(14), 480, fld('summonedPartyMember'), 27);
assert(bp.get(S(14), 480, fld('mpOrMistCost')) === 7, 'u8');
assert(bp.get(S(14), 480, fld('useEventScript')) === 1, 'bit set');
assert(bp.get(S(14), 480, fld('canTargetFoe')) === 0, 'bit clear');
assert(bp.get(S(14), 480, fld('summonedPartyMember')) === 27, 'u16');
const aug = S(16).fields.find(f => f.name === 'swiftcast');
bp.set(S(16), 3, aug, 1); assert(bp.get(S(16), 3, aug) === 1, 'bf64 set');
bp.set(S(16), 3, aug, 0); assert(bp.get(S(16), 3, aug) === 0, 'bf64 clear');
const model = S(16).fields.find(f => f.name === 'model');
bp.set(S(16), 3, model, -1); assert(bp.get(S(16), 3, model) === -1, 's32');
bp.setByte(S(0), 2, 1, 0xAB);
bp.setByte(S('61.3'), 1, 2, 0x55);

const ch = bp.changes();
assert(ch.some(c => c.sec === 14 && c.row === 480 && c.off === 0x0A && c.bytes[0] === 7), 'change list');
assert(ch.some(c => c.sec === '61.3' && c.row === 1 && c.off === 2), 'nested change');
const lua = luaPatch(ch, { file: 'battle_pack.bin' });
assert(/sec = 14, row = 480, off = 0xA/.test(lua) && /sec = 61, sub = 3, row = 1/.test(lua), 'lua patch');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bpw-'));
fs.writeFileSync(path.join(tmp, 'BattlepackPatch.lua'), lua);

const json = JSON.stringify(ch);
bp.revertRow(S(14), 480); assert(bp.get(S(14), 480, fld('mpOrMistCost')) !== 7, 'revert');
const bp2 = new Battlepack(file.buffer.slice(0), schema);
bp2.applyChanges(JSON.parse(json));
const S2 = id => bp2.sections.find(s => String(s.id) === String(id));
assert(bp2.get(S2(14), 480, fld('mpOrMistCost')) === 7 && bp2.getByte(S2('61.3'), 1, 2) === 0x55, 'applyChanges');
// saving keeps the file byte-identical except the edited bytes
let diffs = 0; for (let i = 0; i < file.length; i++) if (bp2.u8[i] !== file[i]) diffs++;
assert(diffs === ch.reduce((n, c) => n + c.bytes.length, 0) - ch.filter(c => c.sec === 0 || c.sec === 16).reduce((n, c) => n + c.bytes.filter((b, k) => b === c.orig[k]).length, 0), 'only edited bytes differ');

const one = new Battlepack(secs[14].buffer.slice(0), schema, { singleSection: 14 });
assert(one.mode === 'section' && one.sections[0].count === 544, 'single section');
const zip = zipStore([{ name: 'battle_pack.bin', data: bp2.u8 }, { name: 'BattlepackPatch.lua', data: lua }, { name: 'changes.json', data: json }]);
fs.writeFileSync(path.join(tmp, 'out.zip'), zip);
console.log('CORE TEST OK', tmp);
