/* VBF archive browser: search the 89k file names, extract a file, open it in the matching editor or save it. */
(function (root) {
  const FX = root.FX;
  const fmtSize = n => n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : n >= 1024 ? (n / 1024).toFixed(1) + ' KB' : n + ' B';

  function makeDoc(vbf, fileName) {
    const doc = new root.BPCore.BinDoc(new ArrayBuffer(0));
    doc.editorId = 'vbf';
    doc.fileName = fileName;
    doc.vbf = vbf;
    // group by top-level folders for the left pane
    const groups = new Map();
    for (const f of vbf.files) {
      const parts = f.name.split('/');
      const key = parts.length > 2 ? parts.slice(0, Math.min(parts.length - 1, 4)).join('/') : (parts[0] || '(root)');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(f);
    }
    const all = { id: 'all', label: `All files`, custom: true, meta: String(vbf.count), files: vbf.files };
    doc.sections = [all, ...[...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([k, list], i) => ({ id: 'g' + i, label: k, custom: true, meta: String(list.length), files: list }))];
    doc.sectionLabel = s => s.label;
    doc.exports = () => [{ id: 'list', label: 'Save file list', filename: 'vbf_files.txt', build: () => vbf.files.map(f => `${f.name}\t${f.size}`).join('\n') }];
    doc.renderSection = (s, el, ctx) => renderList(doc, s, el, ctx);
    return doc;
  }

  function renderList(doc, s, el, ctx) {
    el.innerHTML = `<div class="toolrow"><input type="search" id="vbfSearch" placeholder="search path, e.g. battle_pack or .ard" style="flex:1;min-width:200px"><span class="mono" id="vbfCount"></span></div>
      <div class="tablewrap"><table class="formats"><thead><tr><th>Path</th><th>Size</th><th>Editor</th><th></th></tr></thead><tbody id="vbfRows"></tbody></table></div>`;
    const q = el.querySelector('#vbfSearch'), tb = el.querySelector('#vbfRows'), cnt = el.querySelector('#vbfCount');
    try { q.value = localStorage.getItem('fxs.vbf.q') || ''; } catch (e) { }
    const draw = () => {
      const term = q.value.trim().toLowerCase();
      try { localStorage.setItem('fxs.vbf.q', q.value); } catch (e) { }
      const hits = term ? s.files.filter(f => f.name.toLowerCase().includes(term)) : s.files;
      cnt.textContent = `${hits.length} file${hits.length === 1 ? '' : 's'}${hits.length > 500 ? ' (first 500 shown)' : ''}`;
      tb.innerHTML = '';
      for (const f of hits.slice(0, 500)) {
        const tr = document.createElement('tr');
        const ed = FX.detect(f.name.split('/').pop(), new Uint8Array(0));
        tr.innerHTML = '<td class="mono"></td><td class="mono"></td><td></td><td></td>';
        tr.children[0].textContent = f.name; tr.children[1].textContent = fmtSize(f.size); tr.children[2].textContent = ed ? ed.title : '';
        const open = document.createElement('button'); open.textContent = 'Open';
        const save = document.createElement('button'); save.textContent = 'Extract';
        open.onclick = () => go(f, true); save.onclick = () => go(f, false);
        tr.children[3].append(open, ' ', save);
        tb.appendChild(tr);
      }
    };
    async function go(f, openIt) {
      ctx.toast('Extracting ' + f.name.split('/').pop() + ' …');
      let bytes;
      try { bytes = await root.VBF.extract(doc.vbf, f); } catch (e) { ctx.toast('Extract failed: ' + e.message); return; }
      const base = f.name.split('/').pop();
      if (!openIt) { FX.saveFile(base, bytes); return; }
      const ed = FX.detect(base, bytes);
      if (!ed || ed.id === 'vbf') { ctx.toast('No editor for ' + base + ' yet; use Extract.'); return; }
      FX.openWith(ed, bytes.buffer, base, { vbfPath: f.name });
      ctx.toast(`Opened ${base}. Save it under ${f.name} for the External File Loader.`);
    }
    q.oninput = draw; draw();
  }

  FX.registerEditor({
    id: 'vbf', title: 'VBF archive', files: 'FFXII_TZA.vbf (header only is read)',
    accept(name, u8) { return /\.vbf$/i.test(name) || (u8.length >= 4 && u8[0] === 0x53 && u8[1] === 0x52 && u8[2] === 0x59 && u8[3] === 0x4B) ? 20 : 0; },
    wantsFile: true,
    async openFile(file) { return makeDoc(await root.VBF.openVbf(file), file.name); },
    open(buf, name) { throw new Error('open the .vbf with Open file so it is read in slices'); },
  });
})(typeof window !== 'undefined' ? window : globalThis);
