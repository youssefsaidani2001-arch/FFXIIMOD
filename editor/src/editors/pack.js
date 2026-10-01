/* Pack browser: generic view of any FFXII container (otherpack, EBP2, FF12AR03, himgd, battlepack-shaped packs).
 * Format-specific editors register with a higher score and usually reuse FX.containerDoc with their own labels. */
(function (root) {
  const FX = root.FX;
  const NAMED = /(clutpack|fontpack|mrppack|tex2pack|texpack)_\w+\.bin$|\.(ebp|ard)$|menuhandbook_\w+\d{3}\.dat$/i;
  FX.registerEditor({
    id: 'pack', title: 'Pack browser', files: 'otherpack *_ys/_fs/_it.bin, .ebp, .ard, himgd .dat, nested packs',
    accept(name, u8) {
      let kind = null; try { kind = u8.length ? FX.packs.detect(u8) : null; } catch (e) { kind = null; }
      if (kind && kind !== 'battlepack') return 3;
      if (kind === 'battlepack') return 2;
      return NAMED.test(name) && !u8.length ? 3 : 0;
    },
    open(buf, name) { return FX.containerDoc(new Uint8Array(buf), name, { editorId: 'pack' }); },
    sample() {
      const imgs = [new Uint8Array(40).fill(1), null, new Uint8Array(70).fill(2)];
      const n = imgs.length, head = (12 + 4 * n + 15) & ~15;
      let pos = head; const offs = imgs.map(b => { if (!b) return 0; const o = pos; pos = (pos + b.length + 15) & ~15; return o; });
      const out = new Uint8Array(pos); out.set([0x68, 0x69, 0x6D, 0x67, 0x64]);
      const dv = new DataView(out.buffer); dv.setUint16(8, 7, true); dv.setUint16(10, n, true);
      offs.forEach((o, i) => { dv.setUint32(12 + i * 4, o, true); if (imgs[i]) { out.set([0x54, 0x49, 0x4D, 0x32], o); out.set(imgs[i].subarray(4), o + 4); } });
      return { buf: out.buffer, name: 'sample_himgd.dat (synthetic)' };
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
