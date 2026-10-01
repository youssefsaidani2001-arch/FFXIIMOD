# EBP section 16 - Positions (spawn / hot-spot points, FF12POS3)

Spec id: `ebp-positions` · machine spec: [`ebp-positions.json`](./ebp-positions.json)

EBP **section 16** is a flat list of **positions**: each row has a type byte, a two-float "radius" pair, a 3D
point and a facing angle in radians. The Toolkit calls the section "Spawn Positions" (TK L1084, L1119) and its
guide to editing an area's spawns pairs it with the script's *Spawn Position Map* (`btlAtelSetPoint2`), which picks
rows by index for each spawn group (TK L1113, L1720). On Discord ffgriever describes the position section as
holding the positions of "hot spots" (msg 122-123); trap positions are **not** in it (msg 127) but in the script's
data block (msg 132-143). The Workshop maps `section_016.bin` to this layout (IW Resources/JsonFile.cs:67).

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
  interpreted (the Workshop's packer leaves them zero, IW Helpers/PackHelper.cs:239). This section's offset is the `u32` at **EBP+0x50** (slot 16).
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
+0x00  8 bytes   magic "FF12POS3"
+0x08  u32       unknown08 (not interpreted; Workshop writes 0)
+0x0C  u32       entryCount (N)
+0x10  position[0..N-1], 0x30 bytes each
       end = 0x10 + 0x30*N  (always a multiple of 16, so no padding is needed)
```

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Fields named `unknown…`, `pad…` or `unused…` are not interpreted by any source; keep their original bytes.

### Record `positionsHeader` - 16 bytes (0x10), count: 1

*Where:* Offset 0 of EBP section 16 (EBP start + u32 at EBP+0x50).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 8 | bytes[8] | `magic` | ASCII 'FF12POS3' = 46 46 31 32 50 4F 53 33. |  | IW Formats/Ebp/Positions.cs:12, 26-29, 55 |
| 0x08 | 4 | u32 | `unknown08` | Not interpreted; the Workshop calls it an unused offset and writes 0. Preserve the original value. |  | IW Formats/Ebp/Positions.cs:31, 56 |
| 0x0C | 4 | u32 | `entryCount` | Number of 48-byte position rows starting at 0x10. |  | IW Formats/Ebp/Positions.cs:32, 57 |

### Record `position` - 48 bytes (0x30), count: positionsHeader.entryCount

*Where:* EBP section 16, offset 16 + 48*i (i = 0 .. entryCount-1). Rows are addressed by index from the script (Spawn Position Map / btlAtelSetPoint2).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 1 | s8 | `type` | Position/radius type. The Workshop only accepts values <= 2; the Toolkit list for it names 0, 1 and 2 without meaning. | `PositionType` | IW Formats/Ebp/Positions.cs:38, 61, 83-86; list EbpeRadiusPositionTypeList |
| 0x01 | 3 | bytes[3] | `pad01` | Not interpreted (written as zeros by the Workshop). Preserve. |  | IW Formats/Ebp/Positions.cs:39, 62 |
| 0x04 | 4 | f32 | `radiusX` | First float of the 'radius position' pair (labelled X with a question mark by the Workshop). Only X and Z are present, so it is probably a horizontal extent; unverified. |  | IW Formats/Ebp/Positions.cs:40, 63, 109-110 |
| 0x08 | 4 | f32 | `radiusZ` | Second float of the 'radius position' pair (labelled Z with a question mark by the Workshop). |  | IW Formats/Ebp/Positions.cs:41, 64, 112-113 |
| 0x0C | 4 | bytes[4] | `pad0C` | Not interpreted (written as zeros by the Workshop). Preserve. |  | IW Formats/Ebp/Positions.cs:42, 65 |
| 0x10 | 4 | f32 | `spawnX` | Spawn point X (world units). |  | IW Formats/Ebp/Positions.cs:43, 66; TK L1119 |
| 0x14 | 4 | f32 | `spawnY` | Spawn point Y (world units; vertical axis, inferred from the X/Z-only radius pair). |  | IW Formats/Ebp/Positions.cs:44, 67; TK L1119 |
| 0x18 | 4 | f32 | `spawnZ` | Spawn point Z (world units). |  | IW Formats/Ebp/Positions.cs:45, 68; TK L1119 |
| 0x1C | 4 | f32 | `direction` | Facing angle in radians (Toolkit and Workshop agree on +0x1C). |  | IW Formats/Ebp/Positions.cs:46, 69, 97; TK L1119 |
| 0x20 | 16 | bytes[16] | `pad20` | Not interpreted (written as zeros by the Workshop). Preserve. |  | IW Formats/Ebp/Positions.cs:47, 70 |

### Enums

`PositionType`

| Value | Label |
|---|---|
| 0 | Type 0 (meaning unknown) |
| 1 | Type 1 (meaning unknown) |
| 2 | Type 2 (meaning unknown) |

## Count and size rules

- Section size = 16 + 48 x entryCount (IW Formats/Ebp/Positions.cs:52-72). The Workshop adds no padding; none is
  needed because the size is always a multiple of 16.
- Rows are packed back to back from 0x10 with no gaps.
- The type byte is signed; the Workshop refuses values above 2 (IW Formats/Ebp/Positions.cs:83-86). The Toolkit
  list for this field has exactly three entries, 0-2, all unnamed (list `EbpeRadiusPositionTypeList`).

## Pointers to fix when sizes change

- None inside the section: rows are addressed by index from the script, so do not reorder or delete them.
- If this section's length changes, every EBP section stored after it moves: recompute their `u32` slots at
  EBP+0x10+4n, keep 16-byte starts with zero fill, keep absent sections at 0. Offsets inside other sections are
  relative to their own start (and the embedded ARD's offsets to the ARD start), so nothing else changes.

## Text

No strings.

## Links to other data

- Script (section 0) *Spawn Position Map* / `btlAtelSetPoint2` refers to rows of this table by index
  (TK L1113, L1720). Appended rows are only used once a script refers to them.
- Live memory keeps a "current position index" next to the current location id (TK L320) and the Toolkit's
  teleport takes a position index (TK L593); whether that index points into this table is not established.

## Round-trip rules

- Keep the 8-byte magic 'FF12POS3' and the u32 at 0x08 exactly as read.
- Edit row fields in place; rows contain no pointers.
- Keep pad01, pad0C and pad20 bytes of every row as read (the Workshop zeroes them; vanilla content is not confirmed to be zero).
- Never reorder or delete rows: the script picks spawn points by row index. Appending rows is layout-safe (update entryCount; the section grows by 48 bytes, which keeps it a multiple of 16).
- Keep type within 0..2 (the only values the Workshop accepts).
- If the section length changes, every EBP section stored after it moves: recompute their u32 slots at EBP+0x10+4n, keep 16-byte starts with zero fill, keep absent sections at 0, keep section 6 (TIM2) and section 19 (ARD) intact.

## Known unknowns

- Meaning of type values 0, 1, 2 and whether negative values occur (the field is signed).
- Exact meaning of the 'radius position' pair (extent, offset, or a second point) and of the u32 at header 0x08.
- Whether pad01 / pad0C / pad20 are always zero in vanilla files.
- Whether the teleport position index (live memory, Toolkit) indexes this table or the script-side map destination positions.
- VBF folders of the .ebp files are not named in our sources.

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; its licence forbids copying, modifying or converting its code, and none of it is reused here). Paths are relative to that repo: `Formats/Ebp/*.cs`, `Helpers/PackHelper.cs`, `Helpers/BinaryHelper.cs`, `Resources/JsonFile.cs`, `Resources/OtherFile.cs`, `Resources/PackFile.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. Section 4.17 (L1074-L1131) is the EBP editor. |
| Lists | Drop-down lists of The Insurgent's Toolkit. Lists named in `enum` either ship in `editor/data/lists.json` (`ModelList`) or are copied into this spec's `enums` block. |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
