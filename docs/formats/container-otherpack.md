# Container: "otherpack" (`clutpack_ys`, `fontpack_fs`, `fontpack_it`, `mrppack_ys`, `tex2pack_ys`, `texpack_ys`)

A family of menu/graphics packs that share one very simple layout: a list of
section offsets terminated by `0xFFFFFFFF`, then the sections. Unlike the
battlepack, there is no leading count and no end-of-data offset.

## Sources and citation keys

| Key | Meaning |
|---|---|
| `W:<file>:<line>` | The Insurgent's Workshop, `/home/user/xeavin/the-insurgents-workshop` - facts only, no code reused (licence: personal use only). |
| `R:<line>` | `docs/research/insurgents_toolkit_reference.md`. |
| `D#<n>` | Discord export *wip-general*, message index `n`. |

## Files

| File | Sections (expected) | Typical section content | Source |
|---|---|---|---|
| `clutpack_ys.bin` | 4 | colour lookup tables (`CLT2`) | W:Resources/PackFile.cs:22 |
| `fontpack_fs.bin` | 7 | unknown (font data) | W:Resources/PackFile.cs:23 |
| `fontpack_it.bin` | 6 | unknown (font data) | W:Resources/PackFile.cs:24 |
| `mrppack_ys.bin` | 23 | MRP menu resource packs (`MRP\0`) | W:Resources/PackFile.cs:25, R:1139 |
| `tex2pack_ys.bin` | 11 | TIM2 textures | W:Resources/PackFile.cs:26, D#777, D#821 |
| `texpack_ys.bin` | 5 | TIM2 textures (assumed from the name) | W:Resources/PackFile.cs:27 |

* `mrppack_ys` is the 23-entry MRP pack the game keeps in memory
  (MrpePackSectionList: "Controller Icons" ... "Keyboard Icons"); the toolkit
  hot-reloads it as file type 7 (Menu File), id 0xD3 (R:1139, R:1423).
* The workshop unpacks and repacks `tex2pack_ys.bin` losslessly into TIM2
  files; no separate texture extractor is needed (D#794, D#821).
* VBF folder for these files is not recorded in the sources; locate them with
  VBF Browser by name.

## Byte order

Little-endian.

## Layout

```
+0x00        u32  sectionOffset[0]          file offset of section 0
...          u32  sectionOffset[N-1]
+4N          u32  0xFFFFFFFF                terminator
             FF.. 0xFF fill up to the next 16-byte boundary (only if not aligned)
             section 0 bytes, then zero padding to 16
             section 1 bytes, then zero padding to 16
             ...
             section N-1 bytes, then zero padding to 16    (file ends here)
```

* The offset list has no count: read dwords until one equals `0xFFFFFFFF`
  (W:Helpers/PackHelper.cs:104-112).
* After the terminator the header is padded to a 16-byte boundary with
  **0xFF** bytes, not zeros (W:Helpers/PackHelper.cs:141-143,
  W:Helpers/BinaryHelper.cs:20-27).
* Each section is followed by **zero** padding to the next multiple of 16
  (W:Helpers/PackHelper.cs:154-165).
* Offsets are absolute file offsets. Section *i* spans
  `[sectionOffset[i], sectionOffset[i+1])`; the last section runs to the end
  of the file, so its bytes include the file's trailing padding
  (W:Helpers/PackHelper.cs:114-118).
* An empty section has the same offset as the next one; the reference unpacker
  produces no file for it (W:Helpers/PackHelper.cs:119-122).

### Header size per file

| File | N | `4N + 4` | 0xFF fill | First section |
|---|---|---|---|---|
| clutpack_ys | 4 | 20 | 12 | 0x20 |
| texpack_ys | 5 | 24 | 8 | 0x20 |
| fontpack_it | 6 | 28 | 4 | 0x20 |
| fontpack_fs | 7 | 32 | 0 | 0x20 |
| tex2pack_ys | 11 | 48 | 0 | 0x30 |
| mrppack_ys | 23 | 96 | 0 | 0x60 |

## Section type detection

The reference unpacker names each section by its first four bytes
(W:Helpers/PackHelper.cs:17-22, :127-128):

| First 4 bytes | Hex | Meaning | Extension used |
|---|---|---|---|
| `CLT2` | 43 4C 54 32 | colour lookup table | `.cl2` |
| `MRP\0` | 4D 52 50 00 | menu resource pack | `.mrp` |
| `TIM2` | 54 49 4D 32 | PS2-style TIM2 texture | `.tm2` |
| anything else | - | opaque | `.bin` |

The MRP magic is really three bytes `MRP` followed by a one-byte state
(W:Formats/Mrp.cs:13, :32-37). On disk the state is 0; the toolkit validates
`MRP\x01` on the loaded copy in memory (R:1145), so the game evidently sets
that byte after loading. An editor should match on `MRP` plus any fourth byte
when reading a live dump, and keep 0 when writing a file.

## Pointers to fix when sizes change

* Changing the length of section *i* moves every later `sectionOffset`. Re-lay
  all sections: start = current position, append bytes, zero-pad to 16.
* The terminator and the 0xFF header fill never move (the header size depends
  only on N).
* Nothing outside the offset list points into the pack.

## Round-trip rules

* Keep N (the number of offsets before `0xFFFFFFFF`) unchanged.
* Header fill after the terminator is 0xFF; section padding is 0x00. Mixing
  these up breaks byte identity.
* Copy unedited sections byte-for-byte; for the last section that includes the
  trailing padding to the end of the file.
* Empty sections keep offset = next section's offset.

## Known unknowns

* What the sections of `fontpack_fs` / `fontpack_it` contain, and what `fs` and
  `it` stand for.
* VBF folder(s) and whether per-language copies exist.
* Whether vanilla files always end on a 16-byte boundary (the rule above
  assumes yes).
* Whether texpack_ys sections are all TIM2.
