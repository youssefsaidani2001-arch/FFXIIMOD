/* FX.spec: turns docs/formats/*.json specs into the flat field lists the record form uses,
 * and gives editors a small API to build record tables from a spec. Pure, no DOM. */
(function (root) {
  const FX = root.FX = root.FX || {};
  const BF_FOR = { u8: 'bf8', s8: 'bf8', u16: 'bf16', s16: 'bf16', u32: 'bf32', s32: 'bf32', u64: 'bf64', s64: 'bf64' };
  const SIZE = { u8: 1, s8: 1, u16: 2, s16: 2, u32: 4, s32: 4, u64: 8, s64: 8, f32: 4, f64: 8, bf8: 1, bf16: 2, bf32: 4, bf64: 8 };

  /** Spec field list (nested `bits`) -> flat list: bitfield container + children with `parent`. */
  function normalizeFields(fields) {
    const out = [];
    for (const f of fields || []) {
      if (f.bits && f.bits.length) {
        const type = /^bf/.test(f.type) ? f.type : (BF_FOR[f.type] || 'bf32');
        out.push({ name: f.name, type, offset: f.offset, bitfield: true, notes: f.notes });
        for (const b of f.bits) out.push({ name: b.name, type, offset: f.offset, bitStart: b.bitStart, bitLength: b.bitLength, parent: f.name, enum: b.enum, notes: b.notes });
      } else {
        out.push(Object.assign({}, f));
      }
    }
    return out;
  }
  function fieldSize(f) { return f.type === 'bytes' ? (f.length || 1) : (SIZE[f.type] || 1); }

  /** Problems that would make a spec unsafe to edit with (overlaps are allowed: some layouts are context-dependent). */
  function validateRecord(rec) {
    const errs = [];
    for (const f of rec.fields || []) {
      if (!(f.type in SIZE) && f.type !== 'bytes') errs.push(`${f.name}: unknown type ${f.type}`);
      if (f.offset < 0 || f.offset + fieldSize(f) > rec.size) errs.push(`${f.name}: offset ${f.offset} + ${fieldSize(f)} exceeds record size ${rec.size}`);
      for (const b of f.bits || []) if (b.bitStart + b.bitLength > fieldSize(f) * 8) errs.push(`${f.name}.${b.name}: bits ${b.bitStart}+${b.bitLength} exceed ${fieldSize(f) * 8}`);
    }
    return errs;
  }

  /** Build a section (record table) object for BinDoc from a spec record. */
  function table(id, label, list, rec, count, extra) {
    return Object.assign({ id, label, list, entrySize: rec.size, count, fields: normalizeFields(rec.fields), spec: rec }, extra || {});
  }

  FX.spec = { normalizeFields, fieldSize, validateRecord, table, SIZE };
  FX.specs = FX.specs || {};   // id -> spec json (filled by the page build)
  FX.lists = FX.lists || {};   // global name lists (Insurgent's Toolkit)
})(typeof window !== 'undefined' ? window : globalThis);
