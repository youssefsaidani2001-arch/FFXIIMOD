# EBP section 12 - Models

Spec id: `ebp-models` · machine spec: [`ebp-models.json`](./ebp-models.json)

EBP **section 12** is the blueprint's **model list**: a count followed by 32-bit model ids. It has no magic. The
Toolkit's EBP editor exposes it as "12 : Models" (TK L1084), and the game's per-slot load handler and script keep
both hold a "Models" pointer next to the camera pointers (TK L1364-L1365). The Workshop maps
`section_012.bin` to this layout (IW Resources/JsonFile.cs:66). Compare ARD section 1 ([`ard-models`](./ard-models.md)),
which has 8-byte rows (id + flag word); EBP rows are only the id.

## Container

### The EBP file

Full container spec: [`container-ebp.md`](./container-ebp.md). What matters for this section:

- **Files.** Every `*.ebp` in the game archive; the Workshop treats each one as a 20-section pack
  (IW Resources/PackFile.cs:28). Names seen in our sources: `srb_b04.ebp` (msg 116), `dst_a03` (msg 1049),
  `bul_a0380` (TK L1127). The Toolkit's file viewer lists them under "Location File (.ebp/.mot/.fpk)" and
  "Event File (.ebp/.mot/.snd/.vpc)" (TK L1411). No source names the VBF folders; search the archive for `.ebp`.
  At run time up to five EBPs are loaded at once (slots 0 = Battle ... 4 = Debug, TK L243), and edits only take
  effect after the area or event is loaded again.
- **Header (0x80 bytes).** Magic `EBP2` (`45 42 50 32`) at 0x00 (IW Helpers/PackHelper.cs:181-185, 235-236), twenty
  little-endian `u32` section offsets at 0x10-0x5F (IW Helpers/PackHelper.cs:188-193, 260-264), counted from the first
  byte of the EBP; **0 means absent** (IW Helpers/PackHelper.cs:204-207, 247-254). Bytes 0x04-0x0F and 0x60-0x7F are not
  interpreted (the Workshop's packer leaves them zero, IW Helpers/PackHelper.cs:239). This section's offset is the `u32` at **EBP+0x40** (slot 12).
- **Section span.** Sort the non-zero offsets; a section runs to the next larger offset, the highest one to the end
  of the file (IW Helpers/PackHelper.cs:195-213). The span therefore includes the 16-byte alignment padding that
  follows the section's own data.
- **Physical order when rebuilt.** Index order from 0x80, every section starting on a 16-byte boundary with zero
  fill; an empty section takes no space and keeps offset 0 (IW Helpers/PackHelper.cs:239-257).
- **Special sections.** Section 6 is a **TIM2** texture and section 19 an **embedded ARD** (magic `FF12AR03`, see
  [`container-ard.md`](./container-ard.md)); the Workshop gives them the extensions `.tm2` and `.ard` when
  unpacking (IW Helpers/PackHelper.cs:217-222). Its packer only looks for `.bin` for every index except 19
  (IW Helpers/PackHelper.cs:245-247), so a naive unpack/repack with that tool loses section 6. Our editor must carry
  both sections through any rebuild unchanged.
- **Unpacked naming.** `<name>.ebp.dir/section_<nnn>.bin` (IW Resources/JsonFile.cs:63-67); the `files` globs of
  this spec include that name so a single extracted section can be opened.

#### EBP section map

| # | Header slot | Content | Spec | Source |
|---|---|---|---|---|
| 0 | 0x10 | Compiled script (VM bytecode, decompiled to `.c` by an external tool) | - | IW Resources/OtherFile.cs:20 |
| 1 | 0x14 | unknown | - | - |
| 2 | 0x18 | Text table | - | IW Resources/OtherFile.cs:21 |
| 3 | 0x1C | Text table | - | IW Resources/OtherFile.cs:21 |
| 4 | 0x20 | Navigation icons (`NAVIICN2`) | [`ebp-navigationicons`](./ebp-navigationicons.md) | IW Resources/JsonFile.cs:63; TK L1084 |
| 5 | 0x24 | unknown | - | - |
| 6 | 0x28 | **TIM2 texture** (unpacked as `section_006.tm2`) | - | IW Helpers/PackHelper.cs:217-222 |
| 7 | 0x2C | unknown | - | - |
| 8 | 0x30 | Camera mappings (`CML1`) | [`ebp-cameramappings`](./ebp-cameramappings.md) | IW Resources/JsonFile.cs:64 |
| 9 | 0x34 | Cameras (`CAM7`) | [`ebp-cameras`](./ebp-cameras.md) | IW Resources/JsonFile.cs:65 |
| 10 | 0x38 | Second `CML1` mapping table | [`ebp-cameramappings`](./ebp-cameramappings.md) | IW Resources/JsonFile.cs:64 |
| 11 | 0x3C | unknown | - | - |
| 12 | 0x40 | Models (u32 count + s32 ids) | [`ebp-models`](./ebp-models.md) | IW Resources/JsonFile.cs:66; TK L1084 |
| 13-15 | 0x44-0x4C | unknown | - | - |
| 16 | 0x50 | Positions (`FF12POS3`) | [`ebp-positions`](./ebp-positions.md) | IW Resources/JsonFile.cs:67; TK L1084, L1119 |
| 17-18 | 0x54-0x58 | unknown | - | - |
| 19 | 0x5C | **Embedded ARD** (`FF12AR03`, unpacked as `section_019.ard`) | [`container-ard`](./container-ard.md) | IW Helpers/PackHelper.cs:217-222, 245 |

### Section layout

```
+0x00  u32 entryCount (N)
+0x04  s32 model[0..N-1]
       zero padding to a multiple of 16 (written by the Workshop)
```

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Fields named `unknown…`, `pad…` or `unused…` are not interpreted by any source; keep their original bytes.

### Record `modelsHeader` - 4 bytes (0x04), count: 1

*Where:* Offset 0 of EBP section 12 (EBP start + u32 at EBP+0x40).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | u32 | `entryCount` | Number of 4-byte model ids that follow immediately (no magic, no gap). |  | IW Formats/Ebp/Models.cs:23, 36 |

### Record `model` - 4 bytes (0x04), count: modelsHeader.entryCount

*Where:* EBP section 12, offset 4 + 4*i (i = 0 .. entryCount-1).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | s32 | `model` | Model id. Assumed to use the usual (ASCII prefix letter << 16) \| file number encoding of the Toolkit ModelList; not confirmed for EBP lists. | `ModelList` | IW Formats/Ebp/Models.cs:27, 39; TK L940-L952 |

## Count and size rules

- Section size = 4 + 4 x entryCount, rounded up to 16 with zeros (IW Formats/Ebp/Models.cs:36-41).
- Ids start at 0x04 with no gap. Always take the row count from entryCount, never from the section span (the
  span includes padding).

## Pointers to fix when sizes change

- None inside the section.
- If this section's length changes, every EBP section stored after it moves: recompute their `u32` slots at
  EBP+0x10+4n, keep 16-byte starts with zero fill, keep absent sections at 0. Offsets inside other sections are
  relative to their own start (and the embedded ARD's offsets to the ARD start), so nothing else changes.

## Text

No strings.

## Links to other data

- Model ids elsewhere (battlepack, ARD) use (ASCII prefix letter << 16) | file number, e.g. prefix `n` for NPCs,
  `g` for props, `t` for treasure objects, `m` for foes (TK L940-L952). This spec assumes the same encoding and
  shows names from `ModelList`; values that do not resolve should be shown raw.
- Scripts load models themselves (`modelread`, `modelreadsync`; msg 117), so the relation between this list and
  script calls is still open.

## Round-trip rules

- Edit ids in place; the list has no internal pointers.
- Keep the bytes after the last id (padding) as read while the count does not change.
- When ids are added or removed: update entryCount, rewrite the ids contiguously from 0x04 and zero-pad the section to a multiple of 16 (size = 4 + 4n rounded up).
- Keep the existing order of ids (nothing documents whether the script or other sections index this list).
- If the section length changes, every EBP section stored after it moves: recompute their u32 slots at EBP+0x10+4n, keep 16-byte starts with zero fill, keep absent sections at 0, keep section 6 (TIM2) and section 19 (ARD) intact.

## Known unknowns

- Whether the ids use the ModelList encoding; a trap script calls modelread(0x3000001) (Discord msg 117), an id that does not fit that encoding.
- Whether every model the script reads (modelread) must be listed here, and whether list order matters.
- Whether vanilla pads the section to 16 bytes (the Workshop always does).

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; its licence forbids copying, modifying or converting its code, and none of it is reused here). Paths are relative to that repo: `Formats/Ebp/*.cs`, `Helpers/PackHelper.cs`, `Helpers/BinaryHelper.cs`, `Resources/JsonFile.cs`, `Resources/OtherFile.cs`, `Resources/PackFile.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. Section 4.17 (L1074-L1131) is the EBP editor. |
| Lists | Drop-down lists of The Insurgent's Toolkit. Lists named in `enum` either ship in `editor/data/lists.json` (`ModelList`) or are copied into this spec's `enums` block. |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
