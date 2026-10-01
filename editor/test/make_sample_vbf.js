// Writes a synthetic VBF holding a synthetic battle_pack.bin, for UI tests. Usage: node make_sample_vbf.js out.vbf
const fs = require('fs'), zlib = require('zlib');
require('../src/core.js');
const BLOCK = 0x10000;
const align16 = n => (n + 15) & ~15;
const st2e = (count, size, fill) => { const b = new Uint8Array(0x20 + count * size); b.set([0x73, 0x74, 0x32, 0x65]); const dv = new DataView(b.buffer); dv.setUint32(4, count, true); dv.setUint16(8, size, true); dv.setUint32(0xC, 0x20, true); for (let i = 0; i < count * size; i++) b[0x20 + i] = fill(Math.floor(i / size), i % size); return b; };
const pack = (n, secs) => { let pos = align16(4 + (n + 1) * 4); const offs = []; for (let i = 0; i < n; i++) { pos = align16(pos); offs.push(pos); pos += secs[i] ? secs[i].length : 0; } offs.push(pos); const out = new Uint8Array(align16(pos)); const dv = new DataView(out.buffer); dv.setUint32(0, n, true); offs.forEach((o, i) => dv.setUint32(4 + i * 4, o, true)); for (let i = 0; i < n; i++) if (secs[i]) out.set(secs[i], offs[i]); return out; };
const secs = {}; secs[14] = st2e(544, 0x3C, (r, o) => o === 0x34 ? r & 0xFF : o === 0x35 ? r >> 8 : 0); secs[16] = st2e(40, 0x80, () => 0);
const bp = Buffer.from(pack(71, secs));
const files = [{ name: 'gamedata/d3d11/ps2data/plan_master/in/battle_pack.bin', data: bp }, { name: 'gamedata/readme.txt', data: Buffer.from('hello') }];
const N = files.length; let names = Buffer.alloc(0); const nameOffs = [];
for (const f of files) { nameOffs.push(names.length); names = Buffer.concat([names, Buffer.from(f.name + '\0', 'latin1')]); }
const blocks = [], datas = [], first = [];
for (const f of files) { first.push(blocks.length); const parts = []; for (let p = 0; p < f.data.length; p += BLOCK) { const plain = f.data.subarray(p, p + BLOCK); const c = zlib.deflateSync(plain); if (c.length < plain.length) { blocks.push(c.length); parts.push(c); } else { blocks.push(plain.length === BLOCK ? 0 : plain.length); parts.push(plain); } } datas.push(Buffer.concat(parts)); }
const entryOff = 0x10 + N * 16, namesOff = entryOff + N * 0x20 + 4, blockOff = namesOff + names.length, headerLen = blockOff + blocks.length * 2;
const h = Buffer.alloc(headerLen); h.write('SRYK', 0, 'latin1'); h.writeUInt32LE(headerLen, 4); h.writeBigUInt64LE(BigInt(N), 8);
let pos = headerLen; files.forEach((f, i) => { const e = entryOff + i * 0x20; h.writeUInt32LE(first[i], e); h.writeBigUInt64LE(BigInt(f.data.length), e + 8); h.writeBigUInt64LE(BigInt(pos), e + 0x10); h.writeBigUInt64LE(BigInt(nameOffs[i]), e + 0x18); pos += datas[i].length; });
h.writeUInt32LE(names.length, namesOff - 4); names.copy(h, namesOff); blocks.forEach((b, i) => h.writeUInt16LE(b, blockOff + i * 2));
fs.writeFileSync(process.argv[2], Buffer.concat([h, ...datas])); console.log('wrote', process.argv[2]);
