# Writing an editor module for the FFXII Editor Suite

The suite is one HTML page (`editor/index.html`) assembled by `python3 editor/build.py` from:

| File | Role |
|---|---|
| `src/core.js` | `BPCore`: `BinDoc` (record tables over a byte buffer, byte-level change tracking), `Battlepack`, `luaPatch`, `zipStore`, `readNum`/`writeNum` |
| `src/registry.js` | `FX.registerEditor`, `FX.detect` |
| `src/spec.js` | `FX.spec.normalizeFields`, `FX.spec.table`, `FX.spec.validateRecord`; `FX.specs` = every `docs/formats/*.json` keyed by id; `FX.lists` = name lists |
| `src/vbf.js` | `VBF.openVbf(blob)`, `VBF.extract(vbf, file)`, `VBF.inflate(bytes)` |
| `src/packs.js` | `FX.packs.parse(kind, u8)` / `build(pack)` for battlepack-shaped packs, otherpack, EBP2, FF12AR03, himgd; `detect(u8)`, `magicName(u8)`, `align16` |
| `src/container_doc.js` | `FX.containerDoc(u8, name, opts)`: a ready doc for any container (section cards with Open / Extract / Replace / Revert / Remove) |
| `src/editors/*.js` | one file per editor; loaded in name order, `battlepack.js` first, `hex.js` and `pack.js` (fallbacks) last |
| `src/suite.js` | the shell: three panes, record form, hex view, change list, exports, file routing |

Everything is plain browser JavaScript (no modules, no build step besides concatenation). Each file is an IIFE that reads `root.FX` / `root.BPCore` and also runs under Node for tests (`typeof window !== 'undefined' ? window : globalThis`).

## The editor contract

```js
FX.registerEditor({
  id: 'ard',                         // unique, lowercase
  title: 'ARD (area foes)',          // shown in the format picker and the welcome table
  files: '*.ard, EBP section 19',    // what the user should open
  accept(name, u8) { return score },  // 0 = no; higher wins. Check magic bytes, then the name.
  open(arrayBuffer, name, opts) { return doc },   // throw Error('reason') when the file is not valid
  sample() { return { buf, name } },  // synthetic data built in code (never real game data)
  // optional, for huge files read in slices: wantsFile: true, async openFile(file) { return doc }
})
```

`accept` is called with an empty `u8` by the VBF browser to label files by name only; return a score from the name alone in that case.

## The doc

Build the doc on `BPCore.BinDoc`:

```js
const doc = new root.BPCore.BinDoc(arrayBuffer);   // doc.u8, doc.dv, doc.orig, doc.sections, doc.touched
doc.sections = [ section, ... ];
```

A **section** is one record table the user picks in the left pane:

```js
{ id: 'units',             // unique within the doc (string or number); shown in the left pane
  label: 'Units',          // used by doc.sectionLabel if you do not override it
  list: absoluteOffsetOfRow0, entrySize: bytesPerRow, count: rows,
  fields: flatFieldList,   // see below; [] + raw: true for hex-only tables
  raw: false, missing: false }
```

`FX.spec.table(id, label, list, specRecord, count)` builds one from a `docs/formats/<id>.json` record. Field lists are flat: a bitfield is a container `{name, type:'bf32', offset, bitfield:true}` followed by children `{name, type:'bf32', offset, bitStart, bitLength, parent}`; `FX.spec.normalizeFields` converts the nested `bits` form of the spec files. Field types: `u8 s8 u16 s16 u32 s32 u64 s64 f32 f64 bf8 bf16 bf32 bf64 bytes(length)`.

`doc.get(sec,row,field)`, `doc.set(sec,row,field,value)`, `doc.getByte/setByte`, `doc.rowDiff`, `doc.revertRow`, `doc.changes()`, `doc.fileDiff()` come from `BinDoc`. Always write through these so the change list stays right.

Optional hooks the shell calls when present:

| Hook | Use |
|---|---|
| `sectionLabel(sec)` | left-pane label |
| `rowLabel(sec,row)` | middle-pane label (names from `FX.lists` or the file's own text) |
| `listFor(sec,field)` | `{value:label}` map for a drop-down; return `null` for a plain number box. Default: `field.enum` looked up in the spec's `enums`, then `FX.lists` |
| `notes(sec)` | one line under the record title |
| `renderRecord(sec,row,el,ctx)` | extra UI below the generic form (preview image, buttons) |
| `renderSection(sec,el,ctx)` | full custom view for a section with `custom: true` (no rows pane): image viewers, grids, archive lists |
| `exports()` | `[{label, filename, build: () => Uint8Array|string, primary?}]` or `{label, copy: () => string}`; default is "Save file" with the whole buffer |
| `canLoadChanges` | true if `applyChanges(json)` makes sense |

| `build()` | bytes of the whole file as it would be saved now. Give it when saving is more than `doc.u8` (a container rebuilt from its sections, a padded buffer). Used by Save, Apply and `FX.docBytes(doc)` |
| `changeSummary()` | `{count, bytes?, items:[{label, sec?}]}`. For docs whose edits are not byte runs of `doc.u8` (replaced sections, rebuilt tables). Replaces the byte-diff change list |

`ctx` gives `toast(msg)`, `afterEdit()` (call after any write you make yourself), `rerender()`, `refreshAll()`, `hex(n,width)`, `listFor`. `FX.recordForm(doc, sec, row, ctx)` renders the generic form if a custom view wants to embed it. `FX.saveFile(name, bytes)` saves through the viewer (non-allowlisted extensions are zipped automatically). `FX.detect(name, u8)` picks an editor for bytes; `hex` (score 1) always matches, so check `ed.id !== 'hex'` when you only want a real format editor.

## Embedded files: child documents

An embedded file (a TIM2 in an EBP, the ARD in EBP section 19, an image in a himgd, battlepack section 70) opens as a **child** of the current document:

```js
FX.openChild(editor, bytesUint8Array, 'name.tm2', {
  parentLabel: 'dst_a03.ebp',            // shown in the title and on the Apply button
  apply: newBytes => { /* write newBytes back into the parent doc; may return a replacement parent doc */ },
});
```

The shell pushes the parent on a stack. The child's export bar gets **Apply to <parent>** first: it calls `FX.docBytes(child)` (the child's `build()` or its `u8`), passes the bytes to `apply`, pops back and re-renders the parent. **Back** returns without applying (it asks for a second click when the child has edits). Children nest to any depth (EBP > ARD > ...). Without `apply` the child is read-only towards its parent (the VBF browser opens files this way).

For a container, start from `FX.containerDoc(u8, name, { kind, labels, childEditor, notes, renderExtra, extraExports, editorId })`. It wires Open/Apply for every section through `FX.detect`, and its `build()` calls `FX.packs.build`, which returns the original bytes when nothing changed. A format editor for a container (EBP, ARD, otherpack, himgd) can wrap it: add labels, then replace or extend `doc.sections` and `doc.renderSection` for the sections it understands.

## Rules

* **Round trip first.** Opening and saving without edits must return the identical bytes. Editing a fixed-size field must change only that field's bytes. If an edit changes sizes (text, adding rows, replacing an embedded file), rebuild every offset table, alignment and header field the format needs, and test it.
* **Never trust input.** Bounds-check every offset and count before reading; a malformed file must raise a clear error, never hang or read out of range.
* **No copied code.** Format facts come from `docs/formats/*.md` (written in our own words from public research and The Insurgent's Workshop, which is personal-use only). Do not port or paraphrase Workshop code.
* **Tests.** Every editor ships `editor/test/<id>_test.js`: build a synthetic file in code that follows the spec, open it, check parsed values, edit, save, re-open, compare bytes. Run with `node editor/test/<id>_test.js`. Browser tests go in `editor/test/ui_<id>_test.js` and use `require('./ui_lib').openSuite({ only: ['<id>'] })`, which builds a private copy of the page (`build.py --out <tmp> --only <id>`), so it never depends on other editors or rewrites `editor/index.html`. The shell smoke test is `editor/test/ui_test.js`.
* **Own your files.** An editor lives in `src/editors/<id>.js` (codecs and helpers it shares go on `FX.<name>` inside that file, e.g. `FX.tim2`) and its tests. Do not edit shared files (`core.js`, `suite.js`, `packs.js`, `container_doc.js`, `page.html`, `build.py`) for one editor; if you need a change there, describe it.
* **Style.** Use DOM APIs with `textContent` for any text that comes from a file. Reuse the existing CSS classes (`toolrow`, `canvasbox`, `formats`, `tablewrap`, `grid-board`, `note`, `mono`); add CSS to `src/page.html` only when needed, through the theme tokens.
