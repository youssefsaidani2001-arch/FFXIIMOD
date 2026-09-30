/* Battlepack Workbench core: pure data logic, no DOM. Shared by the page and the Node tests. */
(function (root) {
  const LE = true;
  const RAW_ONLY = new Set([10, 39]);           // bespoke layouts (Insurgent's Toolkit export special-cases)
  const TYPE_SIZE = { u8: 1, s8: 1, u16: 2, s16: 2, u32: 4, s32: 4, u64: 8, s64: 8, f32: 4, f64: 8, bf8: 1, bf16: 2, bf32: 4, bf64: 8 };

  function readNum(dv, off, type) {
    switch (type) {
      case 'u8': return dv.getUint8(off);
      case 's8': return dv.getInt8(off);
      case 'u16': case 'bf16': return dv.getUint16(off, LE);
      case 's16': return dv.getInt16(off, LE);
      case 'u32': case 'bf32': return dv.getUint32(off, LE);
      case 's32': return dv.getInt32(off, LE);
      case 'u64': case 'bf64': return dv.getBigUint64(off, LE);
      case 's64': return dv.getBigInt64(off, LE);
      case 'f32': return dv.getFloat32(off, LE);
      case 'f64': return dv.getFloat64(off, LE);
      case 'bf8': return dv.getUint8(off);
    }
    throw new Error('type ' + type);
  }
  function writeNum(dv, off, type, v) {
    switch (type) {
      case 'u8': case 'bf8': return dv.setUint8(off, Number(v) & 0xFF);
      case 's8': return dv.setInt8(off, Number(v));
      case 'u16': case 'bf16': return dv.setUint16(off, Number(v) & 0xFFFF, LE);
      case 's16': return dv.setInt16(off, Number(v), LE);
      case 'u32': case 'bf32': return dv.setUint32(off, Number(v) >>> 0, LE);
      case 's32': return dv.setInt32(off, Number(v), LE);
      case 'u64': case 'bf64': return dv.setBigUint64(off, BigInt.asUintN(64, BigInt(v)), LE);
      case 's64': return dv.setBigInt64(off, BigInt.asIntN(64, BigInt(v)), LE);
      case 'f32': return dv.setFloat32(off, Number(v), LE);
      case 'f64': return dv.setFloat64(off, Number(v), LE);
    }
    throw new Error('type ' + type);
  }

  class Battlepack {
    /** @param {ArrayBuffer} buf  @param {object} schema  */
    constructor(buf, schema, opts) {
      this.buf = buf;
      this.orig = new Uint8Array(buf.slice(0));
      this.u8 = new Uint8Array(buf);
      this.dv = new DataView(buf);
      this.schema = schema || {};
      this.sections = [];
      this.touched = new Map(); // "sec:row" -> true
      this.mode = 'file';
      this.parse(opts || {});
    }

    parse(opts) {
      const size = this.buf.byteLength;
      const magic0 = this.text(0, 4);
      if (magic0 === 'st2e' || opts.singleSection != null) {
        // a single exported section blob
        const id = opts.singleSection == null ? -1 : opts.singleSection;
        this.mode = 'section';
        this.sections = [this.parseSection(id, 0, size)];
        return;
      }
      const count = this.dv.getUint32(0, LE);
      if (count === 0 || count > 256 || 4 + count * 4 > size) throw new Error('Not a battlepack: bad section count ' + count);
      const offs = [];
      for (let i = 0; i < count; i++) offs.push(this.dv.getUint32(4 + i * 4, LE));
      // offsets may be absolute in-memory pointers (dumped from RAM): rebase if the first one is out of range
      let base = 0;
      const firstValid = offs.find(o => o !== 0);
      if (firstValid !== undefined && firstValid >= size) base = firstValid - (4 + count * 4);
      const sorted = offs.map((o, i) => ({ o: o ? o - base : 0, i })).filter(x => x.o > 0).sort((a, b) => a.o - b.o);
      const ends = new Map();
      for (let k = 0; k < sorted.length; k++) ends.set(sorted[k].i, k + 1 < sorted.length ? sorted[k + 1].o : size);
      for (let i = 0; i < count; i++) {
        const start = offs[i] ? offs[i] - base : 0;
        if (!start || start >= size) { this.sections.push({ id: i, missing: true, count: 0, entrySize: 0 }); continue; }
        this.sections.push(this.parseSection(i, start, ends.get(i)));
      }
    }

    text(off, n) { let s = ''; for (let i = 0; i < n && off + i < this.u8.length; i++) s += String.fromCharCode(this.u8[off + i]); return s; }

    parseSection(id, start, end) {
      const sec = { id, start, end, length: end - start, raw: RAW_ONLY.has(id), missing: false };
      const magic = this.text(start, 4);
      if (id === 0 && magic !== 'st2e') {
        // Section 0: itemSize u16 @0, count u16 @2, entries from +4
        sec.kind = 'sec0';
        sec.entrySize = this.dv.getUint16(start, LE);
        sec.count = this.dv.getUint16(start + 2, LE);
        sec.list = start + 4;
      } else if (magic === 'st2e') {
        sec.kind = 'st2e';
        sec.count = this.dv.getUint32(start + 4, LE);
        sec.entrySize = this.dv.getUint16(start + 8, LE);
        const ptr = this.dv.getUint32(start + 0xC, LE);
        const need = sec.count * sec.entrySize;
        if (ptr >= start && ptr + need <= end) sec.list = ptr;                 // absolute file offset
        else if (start + ptr + need <= end && ptr >= 0x10) sec.list = start + ptr; // relative to section
        else sec.list = start + 0x20;                                            // default header size
        sec.textOffset = this.dv.getUint32(start + 0x14, LE);
      } else {
        sec.kind = 'blob'; sec.raw = true; sec.count = 1; sec.entrySize = sec.length; sec.list = start;
      }
      if (sec.list + sec.count * sec.entrySize > end) { sec.warning = 'entries exceed section bounds'; sec.count = Math.max(0, Math.floor((end - sec.list) / (sec.entrySize || 1))); }
      sec.fields = (this.schema[id] && this.schema[id].fields) || [];
      if (!sec.fields.length) sec.raw = true;
      return sec;
    }

    rowAddr(sec, row) { return sec.list + row * sec.entrySize; }

    /** value of a schema field for a row (bitfield children resolved) */
    get(sec, row, field) {
      const addr = this.rowAddr(sec, row) + field.offset;
      if (field.parent && field.bitStart != null) {
        const parent = sec.fields.find(f => f.name === field.parent && f.bitfield);
        const raw = readNum(this.dv, this.rowAddr(sec, row) + parent.offset, parent.type);
        if (typeof raw === 'bigint') return Number((raw >> BigInt(field.bitStart)) & ((1n << BigInt(field.bitLength)) - 1n));
        return (raw >>> field.bitStart) & ((1 << field.bitLength) - 1) >>> 0;
      }
      return readNum(this.dv, addr, field.type);
    }

    set(sec, row, field, value) {
      const base = this.rowAddr(sec, row);
      if (field.parent && field.bitStart != null) {
        const parent = sec.fields.find(f => f.name === field.parent && f.bitfield);
        const off = base + parent.offset;
        if (parent.type === 'bf64') {
          const mask = ((1n << BigInt(field.bitLength)) - 1n) << BigInt(field.bitStart);
          let raw = readNum(this.dv, off, 'bf64');
          raw = (raw & ~mask) | ((BigInt(value) << BigInt(field.bitStart)) & mask);
          writeNum(this.dv, off, 'bf64', raw);
        } else {
          const mask = (((1 << field.bitLength) - 1) << field.bitStart) >>> 0;
          let raw = readNum(this.dv, off, parent.type) >>> 0;
          raw = ((raw & ~mask) | ((Number(value) << field.bitStart) & mask)) >>> 0;
          writeNum(this.dv, off, parent.type, raw);
        }
      } else {
        writeNum(this.dv, base + field.offset, field.type, value);
      }
      this.touched.set(sec.id + ':' + row, true);
    }

    getByte(sec, row, off) { return this.u8[this.rowAddr(sec, row) + off]; }
    setByte(sec, row, off, v) { this.u8[this.rowAddr(sec, row) + off] = v & 0xFF; this.touched.set(sec.id + ':' + row, true); }

    /** byte-level diff of a row against the original file: [{off, orig, now}] */
    rowDiff(sec, row) {
      const a = this.rowAddr(sec, row), out = [];
      for (let i = 0; i < sec.entrySize; i++) if (this.u8[a + i] !== this.orig[a + i]) out.push({ off: i, orig: this.orig[a + i], now: this.u8[a + i] });
      return out;
    }
    revertRow(sec, row) { const a = this.rowAddr(sec, row); for (let i = 0; i < sec.entrySize; i++) this.u8[a + i] = this.orig[a + i]; this.touched.delete(sec.id + ':' + row); }

    /** all changes as runs: [{sec,row,off,bytes:[...],orig:[...]}] */
    changes() {
      const out = [];
      for (const key of this.touched.keys()) {
        const [s, r] = key.split(':').map(Number);
        const sec = this.sections.find(x => x.id === s); if (!sec) continue;
        const d = this.rowDiff(sec, r);
        if (!d.length) { this.touched.delete(key); continue; }
        let run = null;
        for (const b of d) {
          if (run && b.off === run.off + run.bytes.length) { run.bytes.push(b.now); run.orig.push(b.orig); }
          else { run = { sec: s, row: r, off: b.off, bytes: [b.now], orig: [b.orig] }; out.push(run); }
        }
      }
      return out.sort((a, b) => a.sec - b.sec || a.row - b.row || a.off - b.off);
    }

    applyChanges(list) {
      let n = 0;
      for (const c of list) {
        const sec = this.sections.find(x => x.id === c.sec); if (!sec || c.row >= sec.count) continue;
        for (let i = 0; i < c.bytes.length; i++) this.setByte(sec, c.row, c.off + i, c.bytes[i]);
        n++;
      }
      return n;
    }
  }

  /** Lua Loader patch: applies the byte runs to the live battlepack at startup. */
  function luaPatch(changes, meta) {
    const lines = [];
    lines.push('-- BattlepackPatch.lua  -  generated by Battlepack Workbench' + (meta && meta.file ? ' from ' + meta.file : ''));
    lines.push('-- Drop into x64/scripts/. Applies ' + changes.length + ' byte run(s) to the live battlepack (FF12 Lua Loader).');
    lines.push('local BATTLEPACK_PTR = 0x0208E680  -- qword -> battlepack file base (Steam 1.0.4.0)');
    lines.push('local patches = {');
    for (const c of changes) lines.push(`  { sec = ${c.sec}, row = ${c.row}, off = 0x${c.off.toString(16).toUpperCase()}, bytes = { ${c.bytes.join(', ')} } },  -- was { ${c.orig.join(', ')} }`);
    lines.push('}');
    lines.push(`
local function apply()
  local file = memory.readU64(BATTLEPACK_PTR)
  if not file or file == 0 then return false end
  local n = 0
  for _, p in ipairs(patches) do
    local base = memory.readU32(file + p.sec * 4 + 4)
    if base and base ~= 0 then
      local list, size
      if p.sec == 0 then
        size = memory.readU16(base); list = base + 4
      else
        size = memory.readU16(base + 8); list = memory.readU32(base + 0xC)
      end
      if list and size and size > 0 then
        memory.writeArray(list + p.row * size + p.off, p.bytes)
        n = n + 1
      end
    end
  end
  print(("BattlepackPatch: applied %d/%d patches"):format(n, #patches))
  return n == #patches
end

event.registerEventAsync("onInitDone", function() apply() end)
event.registerEventAsync("onSaveLoad", function() event.executeAfterMs(500, apply) end)
`);
    return lines.join('\n');
  }

  /* ---- minimal store-only ZIP writer (artifact saves allow .zip, not .bin/.lua) ---- */
  const CRC_TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(u8) { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRC_TABLE[(c ^ u8[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zipStore(entries) {
    const enc = new TextEncoder();
    const parts = [], central = [];
    let offset = 0;
    const now = new Date();
    const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xFFFF;
    const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;
    for (const e of entries) {
      const name = enc.encode(e.name);
      const data = e.data instanceof Uint8Array ? e.data : enc.encode(e.data);
      const crc = crc32(data);
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true);
      lh.setUint16(10, dosTime, true); lh.setUint16(12, dosDate, true); lh.setUint32(14, crc, true);
      lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true); lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      parts.push(new Uint8Array(lh.buffer), name, data);
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true);
      ch.setUint16(12, dosTime, true); ch.setUint16(14, dosDate, true); ch.setUint32(16, crc, true);
      ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true); ch.setUint16(28, name.length, true);
      ch.setUint16(30, 0, true); ch.setUint16(32, 0, true); ch.setUint16(34, 0, true); ch.setUint16(36, 0, true); ch.setUint32(38, 0, true); ch.setUint32(42, offset, true);
      central.push(new Uint8Array(ch.buffer), name);
      offset += 30 + name.length + data.length;
    }
    const cdStart = offset; let cdSize = 0;
    for (const c of central) cdSize += c.length;
    const eocd = new DataView(new ArrayBuffer(22));
    eocd.setUint32(0, 0x06054b50, true); eocd.setUint16(4, 0, true); eocd.setUint16(6, 0, true);
    eocd.setUint16(8, entries.length, true); eocd.setUint16(10, entries.length, true); eocd.setUint32(12, cdSize, true); eocd.setUint32(16, cdStart, true); eocd.setUint16(20, 0, true);
    const total = offset + cdSize + 22;
    const out = new Uint8Array(total); let p = 0;
    for (const x of parts) { out.set(x, p); p += x.length; }
    for (const x of central) { out.set(x, p); p += x.length; }
    out.set(new Uint8Array(eocd.buffer), p);
    return out;
  }

  root.BPCore = { Battlepack, luaPatch, zipStore, crc32, TYPE_SIZE, RAW_ONLY, readNum, writeNum };
})(typeof window !== 'undefined' ? window : globalThis);
