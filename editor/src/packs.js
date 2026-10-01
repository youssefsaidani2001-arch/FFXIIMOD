/* FX.packs: parse and rebuild the FFXII container files. Pure, no DOM.
 * parse(kind, u8) -> pack { kind, count, header (bytes to preserve), sections: [{ index, start, end, bytes|null }], order }
 * build(pack)     -> Uint8Array, byte-identical to the input when no section changed.
 * Replace a section by assigning pack.sections[i].bytes = newBytes (null or empty = absent/empty).
 * Layout rules: docs/formats/container-{battlepack,otherpack,ebp,ard,himgd}.md */
(function (root) {
  const FX = root.FX = root.FX || {};
  const align16 = n => (n + 15) & ~15;
  const dvOf = u8 => new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const magicOf = (u8, n) => String.fromCharCode(...u8.subarray(0, n));
  function fail(msg) { throw new Error(msg); }

  /* ---------------- battlepack: u32 N, N+1 offsets (last = end of data), 16-aligned, empty = same offset as next */
  function parseBattlepack(u8) {
    const dv = dvOf(u8), n = dv.getUint32(0, true);
    if (n < 1 || n > 256 || 4 + (n + 1) * 4 > u8.length) fail('battlepack: bad section count ' + n);
    const offs = []; for (let i = 0; i <= n; i++) offs.push(dv.getUint32(4 + i * 4, true));
    for (let i = 0; i < n; i++) if (offs[i] > offs[i + 1] || offs[i + 1] > u8.length) fail(`battlepack: section ${i} offsets out of order or past the end`);
    const sections = [];
    for (let i = 0; i < n; i++) sections.push({ index: i, start: offs[i], end: offs[i + 1], bytes: offs[i + 1] > offs[i] ? u8.slice(offs[i], offs[i + 1]) : null });
    return { kind: 'battlepack', count: n, endOffset: offs[n], firstOffset: offs[0], fileLength: u8.length, sections, header: u8.slice(0, offs[0]) };
  }
  function buildBattlepack(p) {
    const n = p.count, headLen = 4 + (n + 1) * 4;
    let pos = Math.max(align16(headLen), p.firstOffset && p.firstOffset >= headLen ? p.firstOffset : 0);
    const offs = [], parts = [];
    for (let i = 0; i < n; i++) {
      pos = align16(pos); offs.push(pos);
      const b = p.sections[i] && p.sections[i].bytes; if (b && b.length) { parts.push([pos, b]); pos += b.length; }
    }
    const end = pos;
    const out = new Uint8Array(Math.max(align16(end), unchangedLength(p, end)));
    const dv = dvOf(out); dv.setUint32(0, n, true);
    offs.forEach((o, i) => dv.setUint32(4 + i * 4, o, true)); dv.setUint32(4 + n * 4, end, true);
    if (p.header && p.header.length > headLen) out.set(p.header.subarray(headLen, Math.min(p.header.length, offs[0])), headLen); // keep gap bytes
    for (const [o, b] of parts) out.set(b, o);
    return out;
  }
  // keep the original file length when nothing grew (trailing padding is part of the file)
  function unchangedLength(p, end) { return p.endOffset === end && p.fileLength ? p.fileLength : 0; }

  /* ---------------- otherpack: offsets until 0xFFFFFFFF, 0xFF fill to 16, sections zero-padded to 16, last runs to EOF */
  function parseOtherpack(u8) {
    const dv = dvOf(u8), offs = [];
    for (let p = 0; ; p += 4) {
      if (p + 4 > u8.length || offs.length > 4096) fail('otherpack: no 0xFFFFFFFF terminator');
      const v = dv.getUint32(p, true); if (v === 0xFFFFFFFF) break; offs.push(v);
    }
    const n = offs.length; if (!n) fail('otherpack: no sections');
    for (let i = 0; i < n; i++) if (offs[i] > u8.length || (i && offs[i] < offs[i - 1])) fail('otherpack: section ' + i + ' offset out of range');
    const sections = offs.map((o, i) => { const e = i + 1 < n ? offs[i + 1] : u8.length; return { index: i, start: o, end: e, bytes: e > o ? u8.slice(o, e) : null }; });
    return { kind: 'otherpack', count: n, sections, header: u8.slice(0, offs[0]) };
  }
  function buildOtherpack(p) {
    const n = p.count, headLen = align16(n * 4 + 4);
    let pos = headLen; const offs = [], parts = [];
    for (let i = 0; i < n; i++) { offs.push(pos); const b = p.sections[i].bytes; if (b && b.length) { parts.push([pos, b]); pos = align16(pos + b.length); } }
    const out = new Uint8Array(pos); const dv = dvOf(out);
    if (p.header && p.header.length === headLen) out.set(p.header); else out.fill(0xFF, 0, headLen); // keep the original fill bytes
    offs.forEach((o, i) => dv.setUint32(i * 4, o, true)); dv.setUint32(n * 4, 0xFFFFFFFF, true);
    for (const [o, b] of parts) out.set(b, o);
    return out;
  }

  /* ---------------- sorted-extent containers: EBP2 (20 sections @0x10, header 0x80), FF12AR03 (10 @0x08, header 0x30), himgd */
  const SORTED = {
    ebp: { magic: 'EBP2', magicLen: 4, count: () => 20, tableAt: 0x10, headerLen: () => 0x80 },
    ard: { magic: 'FF12AR03', magicLen: 8, count: () => 10, tableAt: 0x08, headerLen: () => 0x30 },
    himgd: { magic: 'himgd\0\0\0', magicLen: 8, count: u8 => dvOf(u8).getUint16(0x0A, true), tableAt: 0x0C, headerLen: n => align16(12 + 4 * n) },
  };
  function parseSorted(kind, u8) {
    const k = SORTED[kind];
    if (u8.length < k.tableAt || magicOf(u8, k.magicLen) !== k.magic) fail(`${kind}: bad magic`);
    const n = k.count(u8); if (n > 4096 || k.tableAt + n * 4 > u8.length) fail(`${kind}: bad section count`);
    const dv = dvOf(u8), offs = []; for (let i = 0; i < n; i++) offs.push(dv.getUint32(k.tableAt + i * 4, true));
    const present = offs.map((o, i) => ({ o, i })).filter(x => x.o).sort((a, b) => a.o - b.o || a.i - b.i);
    const sections = offs.map((o, i) => ({ index: i, start: o, end: o, bytes: null }));
    for (let j = 0; j < present.length; j++) {
      const { o, i } = present[j]; const e = j + 1 < present.length ? present[j + 1].o : u8.length;
      if (o > u8.length) fail(`${kind}: section ${i} starts past the end`);
      sections[i].end = e; sections[i].bytes = e > o ? u8.slice(o, e) : new Uint8Array(0);
    }
    const headerLen = present.length ? present[0].o : u8.length;
    return { kind, count: n, sections, order: present.map(x => x.i), header: u8.slice(0, Math.min(headerLen, Math.max(k.headerLen(n), k.tableAt + n * 4))), fileLength: u8.length };
  }
  function buildSorted(p) {
    const k = SORTED[p.kind], n = p.count;
    const headLen = Math.max(k.headerLen(n), p.header ? p.header.length : 0);
    // physical order: original order first, then newly present sections in index order
    const order = p.order.filter(i => p.sections[i].bytes && p.sections[i].bytes.length);
    for (let i = 0; i < n; i++) if (p.sections[i].bytes && p.sections[i].bytes.length && !order.includes(i)) order.push(i);
    let pos = align16(headLen); const offs = new Array(n).fill(0), parts = [];
    order.forEach((i, j) => {
      const b = p.sections[i].bytes; offs[i] = pos; parts.push([pos, b]);
      const last = j === order.length - 1;
      pos = pos + b.length; if (!(last && p.kind === 'ard')) pos = align16(pos); // ARD: last section (section 1) gets no padding
    });
    const out = new Uint8Array(pos);
    if (p.header) out.set(p.header.subarray(0, Math.min(p.header.length, headLen)));
    else out.set(new TextEncoder().encode(k.magic));
    const dv = dvOf(out);
    if (p.kind === 'himgd') dv.setUint16(0x0A, n, true);
    offs.forEach((o, i) => dv.setUint32(k.tableAt + i * 4, o, true));
    for (const [o, b] of parts) out.set(b, o);
    return out;
  }

  function detect(u8) {
    if (u8.length >= 8 && magicOf(u8, 8) === 'FF12AR03') return 'ard';
    if (u8.length >= 4 && magicOf(u8, 4) === 'EBP2') return 'ebp';
    if (u8.length >= 8 && magicOf(u8, 5) === 'himgd') return 'himgd';
    if (u8.length >= 8) {
      const dv = dvOf(u8);
      // otherpack: first offset is the 16-aligned end of the terminated list
      const first = dv.getUint32(0, true);
      if (first >= 8 && first % 16 === 0 && first <= u8.length) {
        let p = 0; while (p + 4 <= first && dv.getUint32(p, true) !== 0xFFFFFFFF) p += 4;
        if (p + 4 <= first && align16(p + 4) === first) return 'otherpack';
      }
      const n = dv.getUint32(0, true);
      if (n >= 1 && n <= 256 && 4 + (n + 1) * 4 <= u8.length && dv.getUint32(4, true) >= 4 + (n + 1) * 4) return 'battlepack';
    }
    return null;
  }

  function parse(kind, u8) {
    kind = kind || detect(u8);
    if (kind === 'battlepack') return parseBattlepack(u8);
    if (kind === 'otherpack') return parseOtherpack(u8);
    if (SORTED[kind]) return parseSorted(kind, u8);
    fail('unknown container ' + kind);
  }
  function build(p) {
    if (p.kind === 'battlepack') return buildBattlepack(p);
    if (p.kind === 'otherpack') return buildOtherpack(p);
    if (SORTED[p.kind]) return buildSorted(p);
    fail('unknown container ' + p.kind);
  }
  function magicName(b) {
    if (!b || b.length < 4) return '';
    const m = String.fromCharCode(...b.subarray(0, Math.min(8, b.length)));
    const mm = /^(FF12AR03|NAVIICN2|FF12POS3|TIM2|MRP|CLT2|st2e|EBP2|himgd|CML1|CAM7|licd|hctgf|hcomg)/.exec(m);
    return mm ? mm[1] : '';
  }
  FX.packs = { parse, build, detect, align16, magicName };
})(typeof window !== 'undefined' ? window : globalThis);
