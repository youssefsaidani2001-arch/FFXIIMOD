/* Hex editor: fallback for any file or embedded section no other editor understands.
 * The file is shown in 256-byte rows. The buffer is padded to a whole row for display; saving and Apply
 * return exactly the original length. */
(function (root) {
  const FX = root.FX;
  const ROW = 256;
  function open(buf, name) {
    const len = buf.byteLength;
    const padded = new ArrayBuffer(Math.max(ROW, Math.ceil(len / ROW) * ROW));
    new Uint8Array(padded).set(new Uint8Array(buf));
    const doc = new root.BPCore.BinDoc(padded);
    doc.editorId = 'hex';
    doc.realLength = len;
    doc.sections = [{ id: 'bytes', list: 0, entrySize: ROW, count: Math.max(1, Math.ceil(len / ROW)), raw: true, fields: [] }];
    doc.sectionLabel = () => 'Bytes';
    doc.rowLabel = (s, r) => '0x' + (r * ROW).toString(16).toUpperCase().padStart(6, '0');
    doc.notes = () => len % ROW ? `Rows are 256 bytes. The file is ${len} bytes, so the last ${ROW - (len % ROW)} bytes of the last row are outside it and are not saved.` : '';
    doc.build = () => doc.u8.slice(0, len);
    doc.exports = () => [{ id: 'bin', label: 'Save ' + name, filename: name, build: () => doc.build(), primary: true }];
    return doc;
  }
  FX.registerEditor({
    id: 'hex', title: 'Hex', files: 'any file (fallback)',
    accept() { return 1; },
    open,
    sample() { const u8 = new Uint8Array(600); for (let i = 0; i < u8.length; i++) u8[i] = i & 0xFF; return { buf: u8.buffer, name: 'sample.bin (synthetic)' }; },
  });
})(typeof window !== 'undefined' ? window : globalThis);
