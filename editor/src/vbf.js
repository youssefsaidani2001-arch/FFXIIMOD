/* VBF archive reader (FFXII: The Zodiac Age FFXII_TZA.vbf). Pure logic, works on any Blob/File via slice(),
 * so a multi-GB archive never has to be loaded whole.
 * Layout (little endian):
 *   0x00 "SRYK" magic, 0x04 u32 header length, 0x08 u64 file count N
 *   0x10 N x 16-byte MD5 name hashes
 *   then N x 0x20 entries { u32 firstBlock, u32 unknown, u64 size, u64 dataOffset, u64 nameOffset }
 *   then u32 names size + NUL-terminated names (nameOffset is relative to the first name)
 *   then u16 block table up to the header length: compressed size of each 64 KiB block,
 *   0 = a full 65536-byte block stored raw; a block whose stored size equals its plain size is raw, otherwise zlib.
 * Cross-checked with the user's vbf.py (ENTRY_OFF 0x15D440, NAME_OFF 0x417CA4, entry size 0x20, name offset at +0x18,
 * size at +0x08, data offset at +0x10). */
(function (root) {
  const BLOCK = 0x10000;
  const td = new TextDecoder('latin1');

  async function readSlice(blob, start, end) { return new Uint8Array(await blob.slice(start, end).arrayBuffer()); }
  const u64 = (dv, o) => Number(dv.getBigUint64(o, true));

  async function openVbf(blob) {
    const head = await readSlice(blob, 0, 16);
    const hv = new DataView(head.buffer);
    const magic = td.decode(head.subarray(0, 4));
    if (magic !== 'SRYK') throw new Error('not a VBF archive (magic ' + JSON.stringify(magic) + ')');
    const headerLen = hv.getUint32(4, true);
    const count = u64(hv, 8);
    if (!count || count > 2e6 || headerLen > blob.size) throw new Error('implausible VBF header');
    const header = await readSlice(blob, 0, headerLen);
    const dv = new DataView(header.buffer);
    const entryOff = 0x10 + count * 16;
    const namesSizeOff = entryOff + count * 0x20;
    const namesSize = dv.getUint32(namesSizeOff, true);
    const namesOff = namesSizeOff + 4;
    const blockOff = namesOff + namesSize;
    const blockCount = Math.floor((headerLen - blockOff) / 2);
    const files = new Array(count);
    for (let i = 0; i < count; i++) {
      const e = entryOff + i * 0x20;
      const nameOffset = u64(dv, e + 0x18);
      let end = namesOff + nameOffset; while (end < blockOff && header[end] !== 0) end++;
      files[i] = {
        index: i, firstBlock: dv.getUint32(e, true), unknown: dv.getUint32(e + 4, true),
        size: u64(dv, e + 8), offset: u64(dv, e + 0x10),
        name: td.decode(header.subarray(namesOff + nameOffset, end)),
      };
    }
    const blocks = new Uint16Array(blockCount);
    for (let i = 0; i < blockCount; i++) blocks[i] = dv.getUint16(blockOff + i * 2, true);
    return { blob, headerLen, count, files, blocks, layout: { entryOff, namesOff, namesSize, blockOff, blockCount } };
  }

  async function inflate(bytes) {
    const ds = new DecompressionStream('deflate');
    const stream = new Blob([bytes]).stream().pipeThrough(ds);
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  /** Extract one file. Returns Uint8Array of exactly file.size bytes. */
  async function extract(vbf, file, onProgress) {
    const out = new Uint8Array(file.size);
    const nBlocks = Math.ceil(file.size / BLOCK);
    let pos = file.offset, written = 0;
    // read the whole compressed span at once (bounded by the sum of stored sizes)
    let stored = 0; const sizes = [];
    for (let b = 0; b < nBlocks; b++) { const s = vbf.blocks[file.firstBlock + b]; const plain = Math.min(BLOCK, file.size - b * BLOCK); const st = s === 0 ? BLOCK : s; sizes.push([st, plain]); stored += st; }
    const span = await readSlice(vbf.blob, pos, pos + stored);
    let p = 0;
    for (let b = 0; b < nBlocks; b++) {
      const [st, plain] = sizes[b];
      const chunk = span.subarray(p, p + st); p += st;
      let data;
      if (st === plain || st === BLOCK) data = chunk;
      else {
        try { data = await inflate(chunk); } catch (e) { data = chunk; }
      }
      out.set(data.subarray(0, Math.min(data.length, file.size - written)), written);
      written += Math.min(data.length, file.size - written);
      if (onProgress) onProgress(written / file.size);
    }
    if (written !== file.size) throw new Error(`extracted ${written} of ${file.size} bytes`);
    return out;
  }

  root.VBF = { openVbf, extract, inflate, BLOCK };
})(typeof window !== 'undefined' ? window : globalThis);
