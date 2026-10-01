/* FX.containerDoc: a suite doc over any FX.packs container (battlepack-shaped packs, otherpack, EBP2, FF12AR03, himgd).
 * Every section gets an info card with Open (in the matching editor, as a child that can Apply back), Extract,
 * Replace, Revert and, for offset-table containers, Remove. Saving rebuilds the container with FX.packs.build,
 * which is byte-identical when nothing changed.
 *
 * FX.containerDoc(u8, name, {
 *   kind,                     // FX.packs kind; detected when omitted
 *   labels: {i: 'name'} | (i, bytes) => string,
 *   childEditor(i, bytes, childName) -> editor | null,   // override detection for a section
 *   childName(i, bytes) -> string,
 *   notes(i) -> string, title,
 *   extraExports(doc) -> [export...],
 *   renderExtra(i, el, ctx, doc),                         // custom UI under the info card
 * }) */
(function (root) {
  const FX = root.FX = root.FX || {};
  const hex = (n, w) => '0x' + Number(n).toString(16).toUpperCase().padStart(w || 2, '0');
  const fmtSize = n => n >= 1048576 ? (n / 1048576).toFixed(2) + ' MB' : n >= 1024 ? (n / 1024).toFixed(1) + ' KB' : n + ' B';
  const EXT = { TIM2: 'tm2', FF12AR03: 'ard', EBP2: 'ebp', himgd: 'himgd', st2e: 'st2e.bin', MRP: 'mrp', CLT2: 'clt' };
  const same = (a, b) => { if (a === b) return true; if (!a || !b) return (!a || !a.length) && (!b || !b.length); if (a.length !== b.length) return false; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true; };

  function containerDoc(u8, name, o) {
    o = o || {};
    const pack = FX.packs.parse(o.kind || null, u8);
    const orig = pack.sections.map(s => s.bytes);
    const base = String(name || 'file').replace(/\.[^.]+$/, '');
    const labelOf = i => { const l = typeof o.labels === 'function' ? o.labels(i, pack.sections[i].bytes) : o.labels && o.labels[i]; return l || 'Section ' + i; };
    const childName = (i, b) => o.childName ? o.childName(i, b) : `${base}_s${String(i).padStart(2, '0')}.${EXT[FX.packs.magicName(b)] || 'bin'}`;
    const removable = pack.kind !== 'battlepack' && pack.kind !== 'otherpack';

    const doc = {
      editorId: o.editorId || 'pack', kind: pack.kind, pack, fileName: name,
      u8: u8.slice(0), orig: u8, touched: new Map(),
      sections: [],
      sectionLabel: s => s.label,
      build: () => FX.packs.build(pack),
      changeSummary() {
        const items = [];
        pack.sections.forEach((s, i) => { if (!same(s.bytes, orig[i])) items.push({ sec: i, label: `${i} ${labelOf(i)} · ${orig[i] ? fmtSize(orig[i].length) : 'absent'} → ${s.bytes && s.bytes.length ? fmtSize(s.bytes.length) : 'absent'}` }); });
        return { count: items.length, items };
      },
      fileDiff: () => [], changes: () => [], rowDiff: () => [], revertRow() { }, rowAddr: () => 0,
      setSection(i, bytes) { pack.sections[i].bytes = bytes && bytes.length ? bytes : (removable ? null : null); refreshMeta(); },
      sectionBytes: i => pack.sections[i].bytes,
      exports() {
        const list = [
          { id: 'bin', label: 'Save ' + name, filename: name, build: () => FX.packs.build(pack), primary: true },
          { id: 'zip', label: 'Save sections (.zip)', filename: base + '_sections.zip', build: () => root.BPCore.zipStore(pack.sections.map((s, i) => s.bytes && s.bytes.length ? { name: childName(i, s.bytes), data: s.bytes } : null).filter(Boolean)) },
        ];
        return o.extraExports ? list.concat(o.extraExports(doc)) : list;
      },
      renderSection: (s, el, ctx) => s.id === 'overview' ? renderOverview(el, ctx) : renderCard(s.index, el, ctx),
    };
    function refreshMeta() {
      for (const s of doc.sections) {
        if (s.id === 'overview') continue;
        const b = pack.sections[s.index].bytes;
        s.meta = b && b.length ? (FX.packs.magicName(b) ? FX.packs.magicName(b) + ' ' : '') + fmtSize(b.length) : (b ? 'empty' : 'absent');
        s.label = labelOf(s.index);
      }
    }
    doc.sections.push({ id: 'overview', index: -1, custom: true, label: o.title || 'Overview', meta: pack.kind });
    pack.sections.forEach((s, i) => doc.sections.push({ id: i, index: i, custom: true }));
    refreshMeta();

    function editorFor(i, b) {
      if (!b || !b.length) return null;
      const n = childName(i, b);
      if (o.childEditor) { const e = o.childEditor(i, b, n); if (e !== undefined) return e; }
      const e = FX.detect(n, b);
      return e && e.id !== 'vbf' ? e : FX.editors.find(x => x.id === 'hex') || null;
    }
    function renderOverview(el, ctx) {
      const rows = pack.sections.map((s, i) => {
        const b = s.bytes; const ed = editorFor(i, b);
        return `<tr data-i="${i}"><td class="mono">${i}</td><td></td><td class="mono">${b && b.length ? fmtSize(b.length) : (b ? 'empty' : 'absent')}</td><td class="mono">${b ? FX.packs.magicName(b) : ''}</td><td>${ed ? ed.title : ''}</td></tr>`;
      }).join('');
      el.innerHTML = `<div class="head"><strong></strong><span class="mono"></span></div>
        <p class="note">Container ${pack.kind} with ${pack.count} section slots. Pick a section to open, extract or replace it. Saving rebuilds every offset; untouched sections are copied byte for byte.</p>
        <div class="tablewrap"><table class="formats"><thead><tr><th>#</th><th>Name</th><th>Size</th><th>Magic</th><th>Editor</th></tr></thead><tbody>${rows}</tbody></table></div>`;
      el.querySelector('strong').textContent = name; el.querySelector('.head .mono').textContent = `${fmtSize(u8.length)} · ${pack.kind}`;
      el.querySelectorAll('tbody tr').forEach(tr => { const i = Number(tr.dataset.i); tr.children[1].textContent = labelOf(i); tr.style.cursor = 'pointer'; tr.onclick = () => { const s = doc.sections.find(x => x.index === i); if (s) { FX.state.sec = s; ctx.refreshAll(); } }; });
    }
    function hexPreview(b, n) {
      const lines = []; for (let p = 0; p < Math.min(b.length, n); p += 16) { const row = b.subarray(p, Math.min(p + 16, b.length)); lines.push(hex(p, 6).slice(2) + '  ' + [...row].map(x => x.toString(16).padStart(2, '0')).join(' ').padEnd(48) + '  ' + [...row].map(x => x >= 32 && x < 127 ? String.fromCharCode(x) : '.').join('')); }
      return lines.join('\n');
    }
    function renderCard(i, el, ctx) {
      const s = pack.sections[i], b = s.bytes, ed = editorFor(i, b), changed = !same(b, orig[i]);
      el.innerHTML = `<div class="head"><strong></strong><span class="mono"></span></div><p class="note"></p>
        <div class="toolrow"></div><div class="extra"></div>
        <details class="hex" ${b && b.length ? 'open' : ''}><summary>First bytes</summary><pre class="mono" style="font-size:12px;overflow:auto;margin:0"></pre></details>`;
      el.querySelector('strong').textContent = `${i} · ${labelOf(i)}`;
      el.querySelector('.head .mono').textContent = b && b.length ? `${fmtSize(b.length)}${FX.packs.magicName(b) ? ' · ' + FX.packs.magicName(b) : ''} · original offset ${hex(s.start, 6)}${changed ? ' · replaced' : ''}` : (b ? 'empty section' : 'absent');
      el.querySelector('.note').textContent = (o.notes && o.notes(i)) || (ed ? `Opens in ${ed.title}. Apply in that editor writes it back here.` : 'No editor for this section yet. Extract it, edit it elsewhere, then Replace.');
      const bar = el.querySelector('.toolrow');
      const btn = (label, fn, primary) => { const x = document.createElement('button'); x.textContent = label; if (primary) x.className = 'primary'; x.onclick = fn; bar.appendChild(x); return x; };
      if (ed) btn('Open in ' + ed.title, () => FX.openChild(ed, b, childName(i, b), { parentLabel: name, apply: nb => { doc.setSection(i, nb); } }), true);
      if (b && b.length) btn('Extract', () => FX.saveFile(childName(i, b), b));
      const pick = document.createElement('input'); pick.type = 'file'; pick.hidden = true;
      pick.onchange = () => { const f = pick.files[0]; if (!f) return; f.arrayBuffer().then(ab => { doc.setSection(i, new Uint8Array(ab)); ctx.toast(`Section ${i} replaced (${fmtSize(ab.byteLength)})`); ctx.refreshAll(); }); };
      bar.appendChild(pick);
      btn('Replace…', () => pick.click());
      if (removable && b && b.length) btn('Remove', () => { doc.setSection(i, null); ctx.toast(`Section ${i} removed; its offset becomes 0`); ctx.refreshAll(); });
      if (changed) btn('Revert', () => { pack.sections[i].bytes = orig[i]; refreshMeta(); ctx.toast('Section reverted'); ctx.refreshAll(); });
      if (o.renderExtra) o.renderExtra(i, el.querySelector('.extra'), ctx, doc);
      el.querySelector('pre').textContent = b && b.length ? hexPreview(b, 512) : '';
    }
    return doc;
  }
  FX.containerDoc = containerDoc;
})(typeof window !== 'undefined' ? window : globalThis);
