# EBP sections 8 and 10 - Camera mappings (CML1)

Spec id: `ebp-cameramappings` · machine spec: [`ebp-cameramappings.json`](./ebp-cameramappings.json)

EBP **sections 8 and 10** are **name-to-number mapping tables** with magic `CML1`: each row pairs a Shift-JIS
label with a 32-bit "link". Section 8 sits next to the cameras (section 9), so it most likely maps camera names
used by the script to camera blocks. The game's per-slot data keeps pointers in the order textures, camera
mappings, cameras, camera-shake mappings, camera shakes, models (TK L1364), which lines up with EBP sections 6, 8,
9, 10, 11, 12 and suggests that section 10 is the **camera-shake mapping** table (and section 11 the camera
shakes). That reading is an inference, not a documented fact.

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
  interpreted (the Workshop's packer leaves them zero, IW Helpers/PackHelper.cs:239). This layout is used by **two** sections: section 8 (`u32` at **EBP+0x30**) and section 10 (`u32` at **EBP+0x38**); the Workshop maps both to it (IW Resources/JsonFile.cs:64).
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
+0x00          4 bytes  magic "CML1"
+0x04          u32      entryCount (N)
+0x08          8 bytes  unknown (zero from the Workshop)
+0x10          mapping[0..N-1], 16 bytes each: u32 labelOffset, u32 link, 8 unknown bytes
+0x10+16N      label pool: NUL-terminated Shift-JIS strings
               zero padding to a multiple of 16
```

- `labelOffset` counts from the start of the section (IW Formats/Ebp/CameraMappings.cs:37, 41).
- The reader follows each offset and reads bytes up to the first 0x00 (IW Formats/Ebp/CameraMappings.cs:43-54), so labels can in principle
  sit anywhere and be shared. The Workshop's writer places them right after the row table in row order, one 0x00
  after each, no alignment between them (IW Formats/Ebp/CameraMappings.cs:67-75).

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Fields named `unknown…`, `pad…` or `unused…` are not interpreted by any source; keep their original bytes.

### Record `cml1Header` - 16 bytes (0x10), count: 1

*Where:* Offset 0 of EBP section 8 (u32 at EBP+0x30) or section 10 (u32 at EBP+0x38).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes[4] | `magic` | ASCII 'CML1' = 43 4D 4C 31. |  | IW Formats/Ebp/CameraMappings.cs:12, 26-29, 63 |
| 0x04 | 4 | u32 | `entryCount` | Number of 16-byte mapping rows starting at 0x10. |  | IW Formats/Ebp/CameraMappings.cs:31, 64 |
| 0x08 | 8 | bytes[8] | `unknown08` | Not interpreted (zeros from the Workshop). Preserve. |  | IW Formats/Ebp/CameraMappings.cs:32, 67 |

### Record `cameraMapping` - 16 bytes (0x10), count: cml1Header.entryCount

*Where:* Section offset 16 + 16*i (i = 0 .. entryCount-1).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | u32 | `labelOffset` | Offset (from the section start) of this row's label: a NUL-terminated Shift-JIS string in the pool after the row table. Must be rewritten when the pool is rebuilt. |  | IW Formats/Ebp/CameraMappings.cs:37, 41-54, 72, 81 |
| 0x04 | 4 | u32 | `link` | Number the label maps to. Probably an index into the camera list (section 9 for section 8); unverified. |  | IW Formats/Ebp/CameraMappings.cs:38, 82, 93-94 |
| 0x08 | 8 | bytes[8] | `unknown08` | Not interpreted (zeros from the Workshop). Preserve. |  | IW Formats/Ebp/CameraMappings.cs:55, 83 |

## Count and size rules

- Section size = 16 + 16 x entryCount + sum(label bytes + 1), rounded up to 16 with zeros (IW Formats/Ebp/CameraMappings.cs:67-85).
- Row count comes from entryCount only.

## Pointers to fix when sizes change

- `labelOffset` of every row moves when the row count changes or when any label stored before it changes
  length. Rebuild the pool and rewrite all offsets.
- If this section's length changes, every EBP section stored after it moves: recompute their `u32` slots at
  EBP+0x10+4n, keep 16-byte starts with zero fill, keep absent sections at 0. Offsets inside other sections are
  relative to their own start (and the embedded ARD's offsets to the ARD start), so nothing else changes.

## Text

- Labels are Shift-JIS (code page 932) without a length prefix, terminated by a single 0x00
  (IW Formats/Ebp/CameraMappings.cs:54, 73-74; IW Helpers/BinaryHelper.cs:35-43).
- Script-side names are Shift-JIS too (TK L677), which fits labels being the names a script uses.

## Links to other data

- Section 8 `link` -> probably a camera block index in section 9 ([`ebp-cameras`](./ebp-cameras.md)); unverified.
- Section 10 `link` -> probably an index into section 11 (camera shakes), which no source decodes; unverified.

## Round-trip rules

- Keep the magic 'CML1' and header bytes 0x08-0x0F as read.
- Editing link (or the 8 trailing bytes) in place needs no other change.
- A changed label is safest done by rebuilding the pool: write all labels (Shift-JIS, one 0x00 terminator each, no alignment between them) right after the row table, rewrite every labelOffset, zero-pad the section to 16.
- A label whose Shift-JIS bytes are not longer than the old one can also be overwritten in place (terminate with 0x00, fill the rest of the old string with 0x00).
- Keep row order; if the vanilla rows turn out to be sorted by label, keep them sorted when adding rows.
- Adding/removing rows moves the pool: rebuild it and all labelOffsets; update entryCount.
- If the section length changes, every EBP section stored after it moves: recompute their u32 slots at EBP+0x10+4n, keep 16-byte starts with zero fill, keep absent sections at 0, keep section 6 (TIM2) and section 19 (ARD) intact.

## Known unknowns

- What link indexes. Likely section 8 maps camera names to section 9 camera blocks.
- What section 10 maps: the runtime keeps camera mappings, cameras, camera-shake mappings, camera shakes and models in that order (Toolkit), which suggests section 10 = camera-shake mappings and section 11 = camera shakes. Unverified.
- Meaning of header bytes 0x08-0x0F and of row bytes 0x08-0x0F.
- Whether vanilla pools are in row order, deduplicated, or sorted, and whether the game looks labels up by binary search.

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; its licence forbids copying, modifying or converting its code, and none of it is reused here). Paths are relative to that repo: `Formats/Ebp/*.cs`, `Helpers/PackHelper.cs`, `Helpers/BinaryHelper.cs`, `Resources/JsonFile.cs`, `Resources/OtherFile.cs`, `Resources/PackFile.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. Section 4.17 (L1074-L1131) is the EBP editor. |
| Lists | Drop-down lists of The Insurgent's Toolkit. Lists named in `enum` either ship in `editor/data/lists.json` (`ModelList`) or are copied into this spec's `enums` block. |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
