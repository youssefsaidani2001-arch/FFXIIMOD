/* Suite shell: three panes (sections | rows | record) over any doc an editor module returns.
 * A doc is a BPCore.BinDoc (sections with list/entrySize/count/fields) plus optional hooks:
 *   sectionLabel(sec), rowLabel(sec,row), listFor(sec,field), notes(sec), exports(),
 *   renderSection(sec, el, ctx) -> true to replace rows+record panes, renderRecord(sec,row,el,ctx) -> extra UI under the form,
 *   canLoadChanges. */
(function (root) {
  const FX = root.FX;
  const { zipStore } = root.BPCore;
  const $ = id => document.getElementById(id);
  const state = { doc: null, editor: null, sec: null, row: 0, fileName: '', title: '', stack: [] };
  FX.state = state;
  const hex = (n, w) => '0x' + Number(n).toString(16).toUpperCase().padStart(w || 2, '0');
  FX.hex = hex;

  function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 2600); }
  FX.toast = toast;
  const doc = () => state.doc;
  const secLabel = s => (doc().sectionLabel ? doc().sectionLabel(s) : 'Section ' + s.id);
  const rowLabel = (s, r) => { try { return doc().rowLabel ? doc().rowLabel(s, r) || '' : ''; } catch (e) { return ''; } };
  const listFor = (s, f) => { if (doc().listFor) return doc().listFor(s, f); if (f.enum) return (s.spec && s.specEnums && s.specEnums[f.enum]) || FX.lists[f.enum] || null; return null; };

  /* ------------------------------------------------ sections */
  function renderSections() {
    const ul = $('secList'); ul.innerHTML = '';
    if (!doc()) return;
    const q = $('secFilter').value.trim().toLowerCase();
    for (const s of doc().sections) {
      const label = secLabel(s);
      if (q && !(label.toLowerCase().includes(q) || String(s.id) === q)) continue;
      const li = document.createElement('li');
      li.className = (s.missing ? 'missing ' : '') + (s.parent != null ? 'child ' : '') + (state.sec === s ? 'sel' : '');
      const meta = s.missing ? (s.empty ? 'empty' : '—') : s.nested ? 'pack' : s.custom ? (s.meta || '') : `${s.count}×${hex(s.entrySize)}${s.raw ? ' raw' : ''}`;
      li.innerHTML = `<span class="idx"></span><span class="lbl"></span><span class="meta"></span>`;
      li.children[0].textContent = s.id; li.children[1].textContent = label; li.children[2].textContent = meta;
      if (!s.missing && !s.nested) li.onclick = () => selectSection(s);
      ul.appendChild(li);
    }
  }
  function selectSection(s) {
    state.sec = s; state.row = 0;
    try { localStorage.setItem('fxs.sec.' + state.editor.id, String(s.id)); } catch (e) { }
    renderSections(); renderRows(); renderDetail();
  }

  /* ------------------------------------------------ rows */
  function renderRows() {
    const ul = $('rowList'); ul.innerHTML = '';
    const s = state.sec; if (!s || s.custom) { $('rowsPane').hidden = !!(s && s.custom); return; }
    $('rowsPane').hidden = false;
    const q = $('rowFilter').value.trim().toLowerCase();
    const frag = document.createDocumentFragment();
    let shown = 0;
    for (let r = 0; r < s.count; r++) {
      const label = rowLabel(s, r);
      if (q) { const byIdx = q.startsWith('#') ? String(r) === q.slice(1) : String(r) === q; if (!byIdx && !label.toLowerCase().includes(q)) continue; }
      if (++shown > 5000) break;
      const li = document.createElement('li');
      li.className = (r === state.row ? 'sel ' : '') + (doc().touched.has(s.id + ':' + r) ? 'touched' : '');
      li.innerHTML = '<span class="idx"></span><span class="lbl"></span>';
      li.children[0].textContent = r; li.children[1].textContent = label || ' ';
      li.onclick = () => { state.row = r; renderRows(); renderDetail(); };
      frag.appendChild(li);
    }
    ul.appendChild(frag);
  }

  /* ------------------------------------------------ record form */
  const ctx = { hex, toast, listFor: (s, f) => listFor(s, f), afterEdit: () => afterEdit(), rerender: () => renderDetail(), refreshAll: () => { renderSections(); renderRows(); renderDetail(); afterEdit(); } };
  FX.ctx = ctx;
  function renderDetail() {
    const d = $('detail'); d.innerHTML = '';
    const s = state.sec;
    if (!doc()) { d.innerHTML = emptyHtml(); $('recordMeta').textContent = ''; return; }
    if (!s) { d.innerHTML = '<div class="empty">Pick a section.</div>'; return; }
    if (s.custom && doc().renderSection) { $('recordMeta').textContent = `${secLabel(s)}`; doc().renderSection(s, d, ctx); return; }
    if (s.count === 0) { d.innerHTML = '<div class="empty">This table has no rows.</div>'; return; }
    const row = state.row;
    $('recordMeta').textContent = `${s.id} · row ${row} · ${hex(doc().rowAddr(s, row), 6)}`;
    const head = document.createElement('div'); head.className = 'head';
    head.innerHTML = '<strong></strong><span class="mono"></span>';
    head.children[0].textContent = rowLabel(s, row) || secLabel(s) + ' #' + row;
    head.children[1].textContent = `${secLabel(s)} · entry ${hex(s.entrySize)} bytes${s.warning ? ' · ' + s.warning : ''}`;
    d.appendChild(head);
    const note = doc().notes ? doc().notes(s) : '';
    if (note) { const n = document.createElement('p'); n.className = 'note'; n.textContent = note; d.appendChild(n); }
    if (!s.raw && s.fields && s.fields.length) d.appendChild(FX.recordForm(doc(), s, row, ctx));
    if (doc().renderRecord) { const extra = document.createElement('div'); extra.className = 'extra'; d.appendChild(extra); doc().renderRecord(s, row, extra, ctx); }
    d.appendChild(hexEditor(s, row));
  }

  /** Generic typed form for one record (exported so custom editors can reuse it). */
  FX.recordForm = function (dc, s, row, c) {
    const grid = document.createElement('div'); grid.className = 'fields';
    let container = grid;
    for (const f of s.fields) {
      if (f.group || f.bitfield) {
        const fs = document.createElement('fieldset'); fs.className = 'grp';
        const lg = document.createElement('legend'); lg.textContent = `${f.name} · ${f.type}${f.bitfield ? ' @ ' + hex(f.offset) : ''}${f.notes ? ' · ' + f.notes : ''}`;
        const inner = document.createElement('div'); inner.className = 'fields';
        fs.append(lg, inner); grid.appendChild(fs); container = inner;
        continue;
      }
      if (!f.parent) container = grid;
      container.appendChild(fieldControl(dc, s, row, f, c));
    }
    return grid;
  };

  function fieldControl(dc, s, row, f, c) {
    const wrap = document.createElement('div'); wrap.className = 'field';
    const bits = f.bitStart != null ? ` bits ${f.bitStart}${f.bitLength > 1 ? '–' + (f.bitStart + f.bitLength - 1) : ''}` : '';
    wrap.innerHTML = '<label><span class="n"></span><span class="t"></span></label><div class="ctl"></div>';
    wrap.querySelector('.n').textContent = f.name;
    wrap.querySelector('.t').textContent = `${f.type}${f.type === 'bytes' ? '[' + (f.length || 1) + ']' : ''} @ ${hex(f.offset)}${bits}${f.notes ? ' · ' + f.notes : ''}`;
    if (f.notes) wrap.title = f.notes;
    const ctl = wrap.querySelector('.ctl');
    const value = dc.get(s, row, f);
    const size = f.type === 'bytes' ? (f.length || 1) : (FX.spec.SIZE[f.type] || 1);
    const changedNow = () => wrap.classList.toggle('changed', dc.rowDiff(s, row).some(b => b.off >= f.offset && b.off < f.offset + size));
    const commit = v => { try { dc.set(s, row, f, v); } catch (e) { c.toast('Bad value: ' + e.message); return; } c.afterEdit(); changedNow(); syncHex(s, row); if (dc.onFieldEdit) dc.onFieldEdit(s, row, f); };
    const idBase = `f_${String(s.id).replace(/\W/g, '_')}_${f.offset}_${f.bitStart != null ? f.bitStart : f.name}`;

    if (f.bitLength === 1 && !(f.enum && listFor(s, f))) {
      const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = value === 1; cb.id = idBase;
      cb.onchange = () => commit(cb.checked ? 1 : 0); ctl.appendChild(cb);
    } else if (f.type === 'bytes') {
      const inp = document.createElement('input'); inp.type = 'text'; inp.value = value; inp.id = idBase; inp.className = 'mono';
      inp.onchange = () => commit(inp.value); ctl.appendChild(inp);
    } else {
      const list = listFor(s, f);
      if (list) {
        const sel = document.createElement('select'); sel.id = idBase;
        const keys = Object.keys(list).map(Number).sort((a, b) => a - b);
        let present = false;
        for (const k of keys) { const o = document.createElement('option'); o.value = k; o.textContent = `${k} · ${list[k]}`; if (k === Number(value)) { o.selected = true; present = true; } sel.appendChild(o); }
        if (!present) { const o = document.createElement('option'); o.value = value; o.textContent = `${value} · (not in list)`; o.selected = true; sel.appendChild(o); }
        const num = document.createElement('input'); num.type = 'number'; num.className = 'short'; num.value = value; num.title = 'raw value'; num.id = idBase + '_raw';
        sel.onchange = () => { num.value = sel.value; commit(Number(sel.value)); };
        num.onchange = () => { commit(Number(num.value)); const opt = [...sel.options].find(o => Number(o.value) === Number(num.value)); if (opt) opt.selected = true; };
        ctl.append(sel, num);
      } else if (f.type === 'u64' || f.type === 's64' || f.type === 'bf64') {
        const inp = document.createElement('input'); inp.type = 'text'; inp.value = typeof value === 'bigint' ? hex(value, 16) : value; inp.id = idBase;
        inp.onchange = () => { try { commit(BigInt(inp.value)); } catch (e) { c.toast('Enter a decimal or 0x hex integer'); } };
        ctl.appendChild(inp);
      } else {
        const inp = document.createElement('input'); inp.type = 'number'; inp.value = value; inp.id = idBase;
        if (f.type === 'f32' || f.type === 'f64') inp.step = 'any';
        else { inp.step = 1; const lim = { u8: [0, 255], s8: [-128, 127], u16: [0, 65535], s16: [-32768, 32767], u32: [0, 4294967295], s32: [-2147483648, 2147483647] }[f.type]; if (lim) { inp.min = lim[0]; inp.max = lim[1]; } if (f.bitLength) { inp.min = 0; inp.max = 2 ** f.bitLength - 1; } }
        inp.onchange = () => commit(inp.value);
        ctl.appendChild(inp);
      }
    }
    changedNow();
    return wrap;
  }

  function hexEditor(s, row) {
    const det = document.createElement('details'); det.className = 'hex'; det.open = !!s.raw;
    det.innerHTML = `<summary>Raw bytes (${s.entrySize})</summary><div class="hexgrid" id="hexgrid"></div>`;
    const g = det.querySelector('.hexgrid');
    const diff = new Set(doc().rowDiff(s, row).map(b => b.off));
    const n = Math.min(s.entrySize, 4096);
    for (let i = 0; i < n; i++) {
      if (i % 16 === 0) { const o = document.createElement('div'); o.className = 'o'; o.textContent = hex(i, 4); g.appendChild(o); }
      const inp = document.createElement('input'); inp.type = 'text'; inp.maxLength = 2; inp.id = `hx_${String(s.id).replace(/\W/g, '_')}_${row}_${i}`;
      inp.value = doc().getByte(s, row, i).toString(16).toUpperCase().padStart(2, '0'); inp.dataset.off = i;
      inp.setAttribute('aria-label', 'byte ' + hex(i, 4));
      if (diff.has(i)) inp.classList.add('changed');
      inp.onchange = () => { const v = parseInt(inp.value, 16); if (Number.isNaN(v)) { inp.value = doc().getByte(s, row, i).toString(16).toUpperCase().padStart(2, '0'); return; } doc().setByte(s, row, i, v); afterEdit(); renderDetail(); };
      g.appendChild(inp);
    }
    if (s.entrySize > n) { const o = document.createElement('div'); o.className = 'o'; o.textContent = `… ${s.entrySize - n} more bytes not shown`; g.appendChild(o); }
    return det;
  }
  function syncHex(s, row) {
    const g = $('hexgrid'); if (!g) return;
    const diff = new Set(doc().rowDiff(s, row).map(b => b.off));
    for (const inp of g.querySelectorAll('input')) { const i = Number(inp.dataset.off); inp.value = doc().getByte(s, row, i).toString(16).toUpperCase().padStart(2, '0'); inp.classList.toggle('changed', diff.has(i)); }
  }

  /* ------------------------------------------------ changes + exports */
  function afterEdit() {
    if (!doc()) return;
    if (doc().changeSummary) { renderSummary(doc().changeSummary()); return; }
    const ch = doc().changes();
    const fd = doc().fileDiff();
    const rows = new Set(ch.map(c => c.sec + ':' + c.row));
    const bytes = fd.reduce((n, r) => n + r.now.length, 0);
    $('changeCount').innerHTML = `<b></b> changed row${rows.size === 1 ? '' : 's'} · ${bytes} byte${bytes === 1 ? '' : 's'} differ`;
    $('changeCount').querySelector('b').textContent = rows.size;
    const ul = $('changeList'); ul.innerHTML = '';
    for (const c of ch) {
      const li = document.createElement('li');
      const sec = doc().sections.find(x => String(x.id) === String(c.sec));
      li.textContent = `${c.sec} ${sec ? secLabel(sec) : ''} · row ${c.row} · +${hex(c.off)} · ${c.orig.map(b => b.toString(16).padStart(2, '0')).join(' ')} → ${c.bytes.map(b => b.toString(16).padStart(2, '0')).join(' ')}`;
      li.onclick = () => { if (sec) { state.sec = sec; state.row = c.row; renderSections(); renderRows(); renderDetail(); } };
      ul.appendChild(li);
    }
    if (!ch.length && fd.length) for (const r of fd.slice(0, 200)) { const li = document.createElement('li'); li.textContent = `file +${hex(r.start, 6)} · ${r.now.length} byte(s)`; ul.appendChild(li); }
    renderRows(); renderSections();
  }
  FX.afterEdit = afterEdit;
  /** Container docs report their own edits: { count, bytes, items: [{ label, sec? }] }. */
  function renderSummary(sm) {
    const n = sm.count || 0;
    $('changeCount').innerHTML = `<b></b> changed item${n === 1 ? '' : 's'}${sm.bytes != null ? ` · ${sm.bytes} byte${sm.bytes === 1 ? '' : 's'} differ` : ''}`;
    $('changeCount').querySelector('b').textContent = n;
    const ul = $('changeList'); ul.innerHTML = '';
    for (const it of sm.items || []) {
      const li = document.createElement('li'); li.textContent = it.label;
      const sec = it.sec != null ? doc().sections.find(x => String(x.id) === String(it.sec)) : null;
      if (sec) li.onclick = () => selectSection(sec);
      ul.appendChild(li);
    }
    renderSections();
  }
  /** Bytes of the whole file as it would be saved now. Container docs rebuild through doc.build(). */
  function docBytes(d) { d = d || doc(); return d.build ? d.build() : d.u8.slice(0); }
  FX.docBytes = docBytes;
  function isDirty(d) {
    d = d || doc(); if (!d) return false;
    if (d.changeSummary) return (d.changeSummary().count || 0) > 0;
    try { return d.fileDiff().length > 0; } catch (e) { return false; }
  }
  FX.isDirty = isDirty;

  function renderExports() {
    const box = $('exports'); box.innerHTML = '';
    if (!doc()) return;
    const list = (doc().exports ? doc().exports() : [{ id: 'bin', label: 'Save file', filename: state.fileName || 'file.bin', build: () => docBytes(), primary: true }]).slice();
    const parent = state.stack[state.stack.length - 1];
    if (parent && parent.apply) {
      for (const x of list) x.primary = false;
      list.unshift({ id: 'apply', label: 'Apply to ' + (parent.childLabel || 'parent'), title: 'Write this file back into the file it came from, then return there', primary: true, run: applyToParent });
    }
    for (const x of list) {
      const b = document.createElement('button'); b.textContent = x.label; if (x.primary) b.className = 'primary'; if (x.title) b.title = x.title;
      b.onclick = () => runExport(x);
      box.appendChild(b);
    }
  }
  async function runExport(x) {
    if (x.run) return x.run();
    if (x.copy) {
      const txt = x.copy();
      try { await navigator.clipboard.writeText(txt); toast('Copied'); } catch (e) { const ta = document.createElement('textarea'); ta.value = txt; ta.className = 'copybox'; document.body.appendChild(ta); ta.select(); toast('Select and copy the text'); setTimeout(() => ta.remove(), 20000); }
      return;
    }
    let data;
    try { data = await x.build(); } catch (e) { toast('Export failed: ' + e.message); return; }
    saveFile(x.filename, data);
  }

  let dlCap; async function downloadsCap() { if (dlCap !== undefined) return dlCap; try { dlCap = root.claude && root.claude.use ? await root.claude.use('downloads') : null; } catch (e) { dlCap = null; } return dlCap; }
  const DIRECT_OK = /\.(gif|png|jpe?g|webp|txt|json|md|csv|html|svg|pdf|zip)$/i;
  async function saveFile(name, data) {
    const bytes = data instanceof Uint8Array ? data : (typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data));
    const cap = await downloadsCap();
    if (cap) {
      let fname = name, payload = bytes;
      if (!DIRECT_OK.test(name)) { fname = name.replace(/\.[^.]+$/, '') + '.zip'; payload = zipStore([{ name, data: bytes }]); }
      try { await cap.save({ filename: fname, data: new Blob([payload]) }); toast('Saved ' + fname); }
      catch (e) { if (e && e.code === 'declined') toast('Save cancelled'); else toast('Save failed: ' + (e && e.code || e)); }
      return;
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([bytes])); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('Saved ' + name);
  }
  FX.saveFile = saveFile;

  /* ------------------------------------------------ files */
  function emptyHtml() {
    const rows = FX.editors.map(e => `<tr><td>${e.title}</td><td><code>${e.files}</code></td></tr>`).join('');
    return `<div class="empty"><h3>Open a game file</h3>
    <p>Extract files from the game archive with VBF Browser (FFXII: The Zodiac Age, Steam), then open one here or drag it onto the page. The suite picks the editor from the file name and its header.</p>
    <div class="tablewrap"><table class="formats"><thead><tr><th>Editor</th><th>Files</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p>Edits are tracked byte by byte against the original; nothing is written until you save. <strong>Sample</strong> loads synthetic data for the chosen editor so you can try it.</p></div>`;
  }
  function snapshot() { return { doc: state.doc, editor: state.editor, fileName: state.fileName, title: state.title, sec: state.sec, row: state.row }; }
  function showTitle() {
    $('fileName').textContent = state.title;
    const top = state.stack[state.stack.length - 1];
    const b = $('btnBack'); b.hidden = !top; delete b.dataset.confirm;
    if (top) { b.textContent = 'Back to ' + (top.backLabel || top.fileName); b.title = 'Return to ' + top.fileName + (top.apply ? ' (unapplied edits here are discarded)' : ''); }
    $('editorPick').value = state.editor ? state.editor.id : 'auto';
    $('btnLoadChanges').hidden = !(state.doc && state.doc.canLoadChanges);
  }
  /** Open bytes in an editor. opts.child pushes the current doc on the stack (Back returns to it);
   *  opts.apply(newBytes) lets the child write itself back (it may return a replacement parent doc). */
  function openWith(ed, buf, name, opts) {
    opts = opts || {};
    let d;
    try { d = ed.open(buf, name, opts); } catch (e) { toast(`${ed.title}: cannot open (${e.message})`); console.error(e); return null; }
    if (opts.child && state.doc) state.stack.push(Object.assign(snapshot(), { apply: opts.apply || null, childLabel: opts.parentLabel || state.fileName, backLabel: opts.backLabel || null }));
    else if (!opts.child) state.stack.length = 0;
    d.vbfPath = opts.vbfPath || (opts.child && state.doc && state.doc.vbfPath) || null;
    state.doc = d; state.editor = ed; state.fileName = name;
    const where = opts.vbfPath ? opts.vbfPath : (opts.child && opts.parentLabel ? `${opts.parentLabel} › ${name}` : name);
    state.title = `${ed.title} · ${where} · ${(buf.byteLength / 1024).toFixed(0)} KB`;
    showTitle();
    $('rowFilter').value = ''; $('secFilter').value = '';
    let sel = null; try { sel = localStorage.getItem('fxs.sec.' + ed.id); } catch (e) { }
    const usable = d.sections.filter(s => !s.missing && !s.nested);
    const first = usable.find(s => String(s.id) === sel) || usable[0];
    state.sec = null; renderSections(); renderExports();
    if (first) selectSection(first); else { renderRows(); renderDetail(); }
    afterEdit();
    return d;
  }
  /** Open embedded bytes (a section, an image in a pack, a file in an archive) as a child document. */
  FX.openChild = function (ed, bytes, name, opts) {
    const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    const buf = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
    return openWith(ed, buf, name, Object.assign({}, opts, { child: true }));
  };
  function restore(fr) {
    state.doc = fr.doc; state.editor = fr.editor; state.fileName = fr.fileName; state.title = fr.title;
    showTitle(); renderSections(); renderExports();
    const sec = fr.sec && state.doc.sections.find(x => String(x.id) === String(fr.sec.id));
    if (sec) { state.sec = sec; state.row = Math.min(fr.row || 0, Math.max(0, (sec.count || 1) - 1)); renderSections(); renderRows(); renderDetail(); }
    else { const first = state.doc.sections.find(s => !s.missing && !s.nested); state.sec = null; if (first) selectSection(first); else { renderRows(); renderDetail(); } }
    afterEdit();
  }
  function goBack(force) {
    const top = state.stack[state.stack.length - 1]; if (!top) return;
    const b = $('btnBack');
    if (!force && top.apply && isDirty() && !b.dataset.confirm) { b.dataset.confirm = '1'; b.textContent = 'Discard edits and go back?'; toast('Edits here are not applied yet. Click again to discard them, or use Apply.'); return; }
    state.stack.pop(); restore(top);
  }
  FX.goBack = goBack;
  async function applyToParent() {
    const top = state.stack[state.stack.length - 1]; if (!top || !top.apply) return;
    let bytes;
    try { bytes = await docBytes(); } catch (e) { toast('Cannot rebuild: ' + e.message); return; }
    let res;
    try { res = await top.apply(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)); } catch (e) { toast('Apply failed: ' + e.message); console.error(e); return; }
    if (res && res.sections) top.doc = res;
    state.stack.pop(); restore(top);
    toast('Applied to ' + top.fileName + '. Save it to keep the change.');
  }
  FX.applyToParent = applyToParent;
  FX.openWith = openWith;
  async function openFileObject(f) {
    const forced = $('editorPick').value;
    const big = FX.editors.find(e => e.wantsFile && (forced === e.id || (forced === 'auto' && e.accept(f.name, new Uint8Array(0)) > 0)));
    if (big) {
      toast('Reading ' + f.name + ' …');
      let d; try { d = await big.openFile(f); } catch (e) { toast(`${big.title}: cannot open (${e.message})`); console.error(e); return; }
      state.stack.length = 0;
      state.doc = d; state.editor = big; state.fileName = f.name;
      state.title = `${big.title} · ${f.name} · ${(f.size / 1073741824).toFixed(2)} GB`;
      showTitle();
      state.sec = null; renderSections(); renderExports(); selectSection(d.sections[0]); afterEdit();
      return;
    }
    readFile(f, buf => openBuffer(buf, f.name));
  }
  FX.openFileObject = openFileObject;
  function openBuffer(buf, name) {
    const u8 = new Uint8Array(buf);
    const forced = $('editorPick').value;
    const ed = forced && forced !== 'auto' ? FX.editors.find(e => e.id === forced) : FX.detect(name, u8);
    if (!ed) { toast('No editor recognizes ' + name + '. Pick one in the format list.'); return; }
    openWith(ed, buf, name);
  }
  function readFile(file, cb) { const r = new FileReader(); r.onload = () => cb(r.result); r.readAsArrayBuffer(file); }

  function boot() {
    const pick = $('editorPick');
    const o0 = document.createElement('option'); o0.value = 'auto'; o0.textContent = 'Detect format'; pick.appendChild(o0);
    for (const e of FX.editors) { const o = document.createElement('option'); o.value = e.id; o.textContent = e.title; pick.appendChild(o); }
    $('btnOpen').onclick = () => $('openFile').click();
    $('openFile').onchange = e => { const f = e.target.files[0]; if (!f) return; openFileObject(f); e.target.value = ''; };
    $('btnSample').onclick = () => {
      const id = pick.value !== 'auto' ? pick.value : (state.editor ? state.editor.id : FX.editors[0].id);
      const ed = FX.editors.find(e => e.id === id && e.sample) || FX.editors.find(e => e.sample);
      const s = ed.sample(); openWith(ed, s.buf, s.name); toast('Sample loaded: values are synthetic');
    };
    $('btnLoadChanges').onclick = () => $('openJson').click();
    $('btnBack').onclick = () => goBack(false);
    $('openJson').onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { try { const n = doc().applyChanges(JSON.parse(t)); afterEdit(); renderDetail(); toast(`Applied ${n} change runs`); } catch (err) { toast('Bad changes file'); } }); e.target.value = ''; };
    $('secFilter').oninput = renderSections; $('rowFilter').oninput = renderRows;
    $('btnToggleChanges').onclick = () => { const l = $('changeList'); l.classList.toggle('open'); $('btnToggleChanges').textContent = l.classList.contains('open') ? 'Hide list' : 'Show list'; };
    $('btnRevertRow').onclick = () => { if (!state.sec || state.sec.custom) return; doc().revertRow(state.sec, state.row); afterEdit(); renderDetail(); toast('Row reverted'); };
    document.addEventListener('dragover', e => { e.preventDefault(); document.body.classList.add('drop'); });
    document.addEventListener('dragleave', () => document.body.classList.remove('drop'));
    document.addEventListener('drop', e => { e.preventDefault(); document.body.classList.remove('drop'); const f = e.dataTransfer.files[0]; if (!f) return; if (/\.json$/i.test(f.name) && doc() && doc().canLoadChanges) { f.text().then(t => { doc().applyChanges(JSON.parse(t)); afterEdit(); renderDetail(); }); } else openFileObject(f); });
    renderDetail();
  }
  FX.boot = boot;
})(typeof window !== 'undefined' ? window : globalThis);
