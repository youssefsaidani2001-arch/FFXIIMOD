// Builds a synthetic FFXII_TZA.vbf (same layout as the real archive) and checks openVbf + extract.
require('../src/vbf.js');
const zlib = require('zlib'), crypto = require('crypto');
const assert = (c, m) => { if (!c) throw new Error('FAIL: ' + m); };
const BLOCK = 0x10000;

function buildVbf(files) {
  const N = files.length;
  const names = []; let nameBytes = []; const nameOffs = [];
  for (const f of files) { nameOffs.push(nameBytes.length); nameBytes.push(...Buffer.from(f.name + '\0', 'latin1')); }
  const blocks = []; const datas = []; const firstBlocks = [];
  for (const f of files) {
    firstBlocks.push(blocks.length);
    const parts = [];
    for (let p = 0; p < f.data.length; p += BLOCK) {
      const plain = f.data.subarray(p, p + BLOCK);
      const comp = zlib.deflateSync(plain);
      if (f.raw || comp.length >= plain.length) { blocks.push(plain.length === BLOCK ? 0 : plain.length); parts.push(plain); }
      else { blocks.push(comp.length); parts.push(comp); }
    }
    datas.push(Buffer.concat(parts));
  }
  const entryOff = 0x10 + N * 16;
  const namesOff = entryOff + N * 0x20 + 4;
  const blockOff = namesOff + nameBytes.length;
  const headerLen = blockOff + blocks.length * 2;
  const header = Buffer.alloc(headerLen);
  header.write('SRYK', 0, 'latin1'); header.writeUInt32LE(headerLen, 4); header.writeBigUInt64LE(BigInt(N), 8);
  files.forEach((f, i) => crypto.createHash('md5').update(f.name).digest().copy(header, 0x10 + i * 16));
  let dataPos = headerLen;
  files.forEach((f, i) => {
    const e = entryOff + i * 0x20;
    header.writeUInt32LE(firstBlocks[i], e); header.writeUInt32LE(0, e + 4);
    header.writeBigUInt64LE(BigInt(f.data.length), e + 8); header.writeBigUInt64LE(BigInt(dataPos), e + 0x10); header.writeBigUInt64LE(BigInt(nameOffs[i]), e + 0x18);
    dataPos += datas[i].length;
  });
  header.writeUInt32LE(nameBytes.length, namesOff - 4);
  Buffer.from(nameBytes).copy(header, namesOff);
  blocks.forEach((b, i) => header.writeUInt16LE(b, blockOff + i * 2));
  return Buffer.concat([header, ...datas]);
}

(async () => {
  const rnd = n => crypto.randomBytes(n);
  const text = n => Buffer.from('FFXII '.repeat(Math.ceil(n / 6)).slice(0, n), 'latin1');
  const files = [
    { name: 'gamedata/d3d11/ps2data/image/ff12/test/battle/battle_pack.bin', data: Buffer.concat([text(150000), rnd(1000)]) },
    { name: 'gamedata/ps2data/plan_master/in/plan_map/rbn_a/area/rbn_a01.ard', data: text(65536) },
    { name: 'gamedata/random.bin', data: rnd(70000) },                // incompressible -> raw blocks incl. 0 = full raw block
    { name: 'gamedata/tiny.txt', data: text(10) },
    { name: 'gamedata/rawflag.bin', data: text(140000), raw: true },  // forced raw
  ];
  const buf = buildVbf(files);
  const blob = new Blob([buf]);
  const vbf = await VBF.openVbf(blob);
  assert(vbf.count === files.length, 'count');
  for (let i = 0; i < files.length; i++) {
    const f = vbf.files[i];
    assert(f.name === files[i].name, 'name ' + i);
    assert(f.size === files[i].data.length, 'size ' + i);
    const out = await VBF.extract(vbf, f);
    assert(Buffer.compare(Buffer.from(out), files[i].data) === 0, 'content ' + f.name);
  }
  // layout check against the real archive numbers from the user's vbf.py: N = 89411 gives ENTRY_OFF 0x15D440, NAME_OFF 0x417CA4
  const N = 89411; assert(0x10 + N * 16 === 0x15D440 && 0x10 + N * 16 + N * 0x20 + 4 === 0x417CA4, 'layout constants');
  console.log('VBF TEST OK', vbf.count, 'files,', vbf.layout.blockCount, 'blocks');
})().catch(e => { console.error(e); process.exit(1); });
