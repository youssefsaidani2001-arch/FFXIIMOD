/* Editor registry. Each editor module calls FX.registerEditor({...}). Loaded before editors. */
(function (root) {
  const FX = root.FX = root.FX || {};
  FX.editors = [];
  /** editor: { id, title, files, accept(name, u8) -> score, open(buf, name, opts) -> doc, sample?() -> {buf,name} } */
  FX.registerEditor = function (ed) { FX.editors.push(ed); };
  FX.detect = function (name, u8) {
    let best = null, bestScore = 0;
    for (const ed of FX.editors) { let s = 0; try { s = ed.accept(name, u8) || 0; } catch (e) { s = 0; } if (s > bestScore) { best = ed; bestScore = s; } }
    return best;
  };
})(typeof window !== 'undefined' ? window : globalThis);
