# EBP section 9 - Cameras (CAM7)

Spec id: `ebp-cameras` · machine spec: [`ebp-cameras.json`](./ebp-cameras.json)

EBP **section 9** holds the area's / event's **cameras** (magic `CAM7`). It is made of three lists of
variable-size blocks. Only the first list is understood in part: each **camera block** has a 24-byte name, a flag
word and a run of typed entries, of which kind 1 is a **camera key** (a "camera" vector, a "view angle" vector,
roll and vertical field of view in degrees). Lists 2 and 3 are plain float data of unknown purpose. The Workshop maps
`section_009.bin` to this layout (IW Resources/JsonFile.cs:65); the Toolkit's EBP editor does not expose it
(TK L1084), but the game keeps a "Cameras" pointer per loaded EBP (TK L1364-L1365).

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
  interpreted (the Workshop's packer leaves them zero, IW Helpers/PackHelper.cs:239). This section's offset is the `u32` at **EBP+0x34** (slot 9).
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
+0x00  4 bytes  magic "CAM7"
+0x04  u32      cameraBlockCount (A)
+0x08  u32      list2Count (B)
+0x0C  u32      list3Count (C)
+0x10  12 bytes unknown
+0x1C  u32      listStart  (offset of the first camera block; 0x20 in rebuilt files)
listStart:
       A camera blocks   (variable size, see below)
       B list-2 blocks   (directly after the last camera block)
       C list-3 blocks   (directly after the last list-2 block)
       zero padding to a multiple of 16
```

Only list 1 has an offset; lists 2 and 3 are found by walking (IW Formats/Ebp/Cameras.cs:55-60, 62-217). Nothing inside the section is
aligned.

### Camera block (list 1)

```
+0x00  u32       unknown00
+0x04  u32       blockSize   = 0x2C + sum of entry sizes (whole block incl. this header and the footer)
+0x08  24 bytes  label (Shift-JIS, 0x00 padded)
+0x20  u32       flags
+0x24  u16       unknown24
+0x26  u16       unknown26
+0x28  entries, back to back, until blockSize-4:
         each starts with u8 kind + 3 pad bytes
         kind 1 -> 64-byte camera key
         kind 2 -> 44-byte entry
         anything else -> unknown layout (the Workshop rejects it)
blockSize-4: u32 footer
```

(IW Formats/Ebp/Cameras.cs:65-136 reading, 231-307 writing; entry sizes IW Formats/Ebp/Cameras.cs:410, 452.)

### List-2 block

```
+0x00  u32  blockSize = 0x18 + 0x24*entryCount
+0x04  u32  entryCount
+0x08  4 x f32
+0x18  entryCount x 36-byte rows (9 x f32)
```

(IW Formats/Ebp/Cameras.cs:139-166, 309-333.)

### List-3 block

```
+0x00  u32  blockSize = 0x20 + 0x38*vectorEntryCount + 0x08*pairEntryCount
+0x04  u16  vectorEntryCount
+0x06  u16  pairEntryCount
+0x08  2 x (3 x f32)
+0x20  vectorEntryCount x 56-byte rows (3 x 4 f32 + 2 f32)
       pairEntryCount   x  8-byte rows (2 f32)
```

(IW Formats/Ebp/Cameras.cs:169-217, 335-378.)

### Walking the section

1. cursor = `listStart`.
2. Repeat A times: read `blockSize` at cursor+4; walk entries from cursor+0x28, choosing 64 or 44 bytes by the kind
   byte, until cursor+blockSize-4; the footer sits there; cursor += blockSize.
3. Repeat B times: cursor += 0x18 + 0x24 x entryCount (equals the stored blockSize in well-formed files).
4. Repeat C times: cursor += 0x20 + 0x38 x vectorEntryCount + 0x08 x pairEntryCount.
5. Everything after the cursor up to the section end is padding.

The Workshop only trusts `blockSize` for camera blocks (to know where entries end, IW Formats/Ebp/Cameras.cs:66, 75-77) and recomputes
the list-2/3 sizes when writing (IW Formats/Ebp/Cameras.cs:312, 339). An editor should check that stored sizes equal the formulas and
refuse to edit if they do not.

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Fields named `unknown…`, `pad…` or `unused…` are not interpreted by any source; keep their original bytes.

### Record `cam7Header` - 32 bytes (0x20), count: 1

*Where:* Offset 0 of EBP section 9 (EBP start + u32 at EBP+0x34).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes[4] | `magic` | ASCII 'CAM7' = 43 41 4D 37. |  | IW Formats/Ebp/Cameras.cs:13, 50-53, 223 |
| 0x04 | 4 | u32 | `cameraBlockCount` | Number of camera blocks (list 1). |  | IW Formats/Ebp/Cameras.cs:55, 224 |
| 0x08 | 4 | u32 | `list2Count` | Number of list-2 blocks. |  | IW Formats/Ebp/Cameras.cs:56, 225 |
| 0x0C | 4 | u32 | `list3Count` | Number of list-3 blocks. |  | IW Formats/Ebp/Cameras.cs:57, 226 |
| 0x10 | 12 | bytes[12] | `unknown10` | Not interpreted (zeros from the Workshop). Possibly further list offsets; preserve. |  | IW Formats/Ebp/Cameras.cs:58, 228 |
| 0x1C | 4 | u32 | `listStart` | Offset (from the section start) of the first camera block; lists 2 and 3 follow list 1 without their own offsets. 0x20 in rebuilt files. |  | IW Formats/Ebp/Cameras.cs:59-60, 229 |

### Record `cameraBlockHeader` - 40 bytes (0x28), count: cam7Header.cameraBlockCount

*Where:* List 1: first block at cam7Header.listStart; each next block starts at previous block start + blockSize.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | u32 | `unknown00` | Not interpreted (zero from the Workshop). Preserve. |  | IW Formats/Ebp/Cameras.cs:65, 234 |
| 0x04 | 4 | u32 | `blockSize` | Total block length in bytes from +0x00 through the 4-byte footer = 44 + sum of entry sizes. Entries run from +0x28 to blockSize-4. |  | IW Formats/Ebp/Cameras.cs:66, 75-77, 233, 302-306 |
| 0x08 | 24 | bytes[24] | `label` | Camera name, Shift-JIS, padded with 0x00 (24 bytes may be used without terminator). |  | IW Formats/Ebp/Cameras.cs:69-70, 240-246 |
| 0x20 | 4 | u32 | `flags` | Flag word; bits not identified. |  | IW Formats/Ebp/Cameras.cs:71, 248 |
| 0x24 | 2 | u16 | `unknown24` |  |  | IW Formats/Ebp/Cameras.cs:72, 249 |
| 0x26 | 2 | u16 | `unknown26` |  |  | IW Formats/Ebp/Cameras.cs:73, 250 |

### Record `cameraKey` - 64 bytes (0x40), count: per block: entries with kind 1 (walk the block)

*Where:* Inside a camera block, entries follow one another from block+0x28; an entry whose u8 at +0 is 1 has this 64-byte layout.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `kind` | Always 1 for this layout. | `CameraEntryKind` | IW Formats/Ebp/Cameras.cs:79-80, 83, 254-255 |
| 0x01 | 3 | bytes[3] | `pad01` | Not interpreted (zeros from the Workshop). |  | IW Formats/Ebp/Cameras.cs:80, 255 |
| 0x04 | 4 | f32 | `cameraX` | 4-float vector labelled 'Camera' (probably the eye position; 4th component unknown). |  | IW Formats/Ebp/Cameras.cs:85-88, 260-263, 415-416 |
| 0x08 | 4 | f32 | `cameraY` |  |  | IW Formats/Ebp/Cameras.cs:86, 261 |
| 0x0C | 4 | f32 | `cameraZ` |  |  | IW Formats/Ebp/Cameras.cs:87, 262 |
| 0x10 | 4 | f32 | `cameraW` |  |  | IW Formats/Ebp/Cameras.cs:88, 263 |
| 0x14 | 4 | f32 | `viewAngleX` | 4-float vector labelled 'View Angle' (look direction or target; unverified). |  | IW Formats/Ebp/Cameras.cs:90-93, 264-267, 418-419 |
| 0x18 | 4 | f32 | `viewAngleY` |  |  | IW Formats/Ebp/Cameras.cs:91, 265 |
| 0x1C | 4 | f32 | `viewAngleZ` |  |  | IW Formats/Ebp/Cameras.cs:92, 266 |
| 0x20 | 4 | f32 | `viewAngleW` |  |  | IW Formats/Ebp/Cameras.cs:93, 267 |
| 0x24 | 4 | f32 | `rollDegrees` | Camera roll in degrees. |  | IW Formats/Ebp/Cameras.cs:95, 268, 421-422 |
| 0x28 | 4 | f32 | `verticalFovDegrees` | Vertical field of view in degrees (the live camera stores radians; the file stores degrees). |  | IW Formats/Ebp/Cameras.cs:96, 269, 424-425; cf. TK L508 |
| 0x2C | 4 | f32 | `unknown2C` |  |  | IW Formats/Ebp/Cameras.cs:97, 270 |
| 0x30 | 4 | f32 | `unknown30` |  |  | IW Formats/Ebp/Cameras.cs:98, 271 |
| 0x34 | 4 | u32 | `unknown34` | Probably unused (labelled with a question mark). Preserve. |  | IW Formats/Ebp/Cameras.cs:99, 272, 436-437 |
| 0x38 | 4 | f32 | `unknown38` |  |  | IW Formats/Ebp/Cameras.cs:100, 273 |
| 0x3C | 4 | u32 | `unknown3C` | Probably unused (labelled with a question mark). Preserve. |  | IW Formats/Ebp/Cameras.cs:101, 274, 439-440 |

### Record `cameraType2Entry` - 44 bytes (0x2C), count: per block: entries with kind 2 (walk the block)

*Where:* Inside a camera block: an entry whose u8 at +0 is 2 has this 44-byte layout.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `kind` | Always 2 for this layout. | `CameraEntryKind` | IW Formats/Ebp/Cameras.cs:79-80, 106, 254-255 |
| 0x01 | 3 | bytes[3] | `pad01` | Not interpreted (zeros from the Workshop). |  | IW Formats/Ebp/Cameras.cs:80, 255 |
| 0x04 | 2 | u16 | `wordA00` | First of 13 consecutive u16 values (0x04-0x1D), meaning unknown. |  | IW Formats/Ebp/Cameras.cs:109-122, 279-292, 457-473 |
| 0x06 | 2 | u16 | `wordA01` |  |  | IW Formats/Ebp/Cameras.cs:109-122, 279-292, 457-473 |
| 0x08 | 2 | u16 | `wordA02` |  |  | IW Formats/Ebp/Cameras.cs:109-122, 279-292, 457-473 |
| 0x0A | 2 | u16 | `wordA03` |  |  | IW Formats/Ebp/Cameras.cs:109-122, 279-292, 457-473 |
| 0x0C | 2 | u16 | `wordA04` |  |  | IW Formats/Ebp/Cameras.cs:109-122, 279-292, 457-473 |
| 0x0E | 2 | u16 | `wordA05` |  |  | IW Formats/Ebp/Cameras.cs:109-122, 279-292, 457-473 |
| 0x10 | 2 | u16 | `wordA06` |  |  | IW Formats/Ebp/Cameras.cs:109-122, 279-292, 457-473 |
| 0x12 | 2 | u16 | `wordA07` |  |  | IW Formats/Ebp/Cameras.cs:109-122, 279-292, 457-473 |
| 0x14 | 2 | u16 | `wordA08` |  |  | IW Formats/Ebp/Cameras.cs:109-122, 279-292, 457-473 |
| 0x16 | 2 | u16 | `wordA09` |  |  | IW Formats/Ebp/Cameras.cs:109-122, 279-292, 457-473 |
| 0x18 | 2 | u16 | `wordA10` |  |  | IW Formats/Ebp/Cameras.cs:109-122, 279-292, 457-473 |
| 0x1A | 2 | u16 | `wordA11` |  |  | IW Formats/Ebp/Cameras.cs:109-122, 279-292, 457-473 |
| 0x1C | 2 | u16 | `wordA12` |  |  | IW Formats/Ebp/Cameras.cs:109-122, 279-292, 457-473 |
| 0x1E | 2 | u16 | `wordB0` | First of 2 consecutive u16 values (0x1E-0x21), meaning unknown. |  | IW Formats/Ebp/Cameras.cs:109-122, 279-292, 457-473 |
| 0x20 | 2 | u16 | `wordB1` |  |  | IW Formats/Ebp/Cameras.cs:109-122, 279-292, 457-473 |
| 0x22 | 2 | u16 | `word22` |  |  | IW Formats/Ebp/Cameras.cs:109-122, 279-292, 457-473 |
| 0x24 | 1 | u8 | `byte24` |  |  | IW Formats/Ebp/Cameras.cs:109-122, 279-292, 457-473 |
| 0x25 | 1 | u8 | `byte25` |  |  | IW Formats/Ebp/Cameras.cs:109-122, 279-292, 457-473 |
| 0x26 | 6 | bytes[6] | `unknown26` | Probably unused (labelled with a question mark). Preserve. |  | IW Formats/Ebp/Cameras.cs:109-122, 279-292, 457-473 |

### Record `cameraBlockFooter` - 4 bytes (0x04), count: cam7Header.cameraBlockCount

*Where:* Last 4 bytes of each camera block: block start + blockSize - 4.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | u32 | `footer` | Unknown value closing every camera block. |  | IW Formats/Ebp/Cameras.cs:134, 300 |

### Record `list2Block` - 24 bytes (0x18), count: cam7Header.list2Count

*Where:* List 2: first block directly after the last camera block; each next block at previous start + blockSize (= 24 + 36*entryCount).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | u32 | `blockSize` | Block length = 24 + 36*entryCount (recomputed by the Workshop, not read by it). |  | IW Formats/Ebp/Cameras.cs:143, 312-313 |
| 0x04 | 4 | u32 | `entryCount` | Number of 36-byte list2Entry rows at +0x18. |  | IW Formats/Ebp/Cameras.cs:144, 314 |
| 0x08 | 4 | f32 | `unknown08` |  |  | IW Formats/Ebp/Cameras.cs:145-148, 316-319 |
| 0x0C | 4 | f32 | `unknown0C` |  |  | IW Formats/Ebp/Cameras.cs:145-148, 316-319 |
| 0x10 | 4 | f32 | `unknown10` |  |  | IW Formats/Ebp/Cameras.cs:145-148, 316-319 |
| 0x14 | 4 | f32 | `unknown14` |  |  | IW Formats/Ebp/Cameras.cs:145-148, 316-319 |

### Record `list2Entry` - 36 bytes (0x24), count: per list2Block: entryCount

*Where:* List-2 block start + 24 + 36*k (k = 0 .. entryCount-1).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | f32 | `value0` | Nine floats, meaning unknown (possibly three 3D vectors). |  | IW Formats/Ebp/Cameras.cs:150-163, 321-332 |
| 0x04 | 4 | f32 | `value1` |  |  | IW Formats/Ebp/Cameras.cs:150-163, 321-332 |
| 0x08 | 4 | f32 | `value2` |  |  | IW Formats/Ebp/Cameras.cs:150-163, 321-332 |
| 0x0C | 4 | f32 | `value3` |  |  | IW Formats/Ebp/Cameras.cs:150-163, 321-332 |
| 0x10 | 4 | f32 | `value4` |  |  | IW Formats/Ebp/Cameras.cs:150-163, 321-332 |
| 0x14 | 4 | f32 | `value5` |  |  | IW Formats/Ebp/Cameras.cs:150-163, 321-332 |
| 0x18 | 4 | f32 | `value6` |  |  | IW Formats/Ebp/Cameras.cs:150-163, 321-332 |
| 0x1C | 4 | f32 | `value7` |  |  | IW Formats/Ebp/Cameras.cs:150-163, 321-332 |
| 0x20 | 4 | f32 | `value8` |  |  | IW Formats/Ebp/Cameras.cs:150-163, 321-332 |

### Record `list3Block` - 32 bytes (0x20), count: cam7Header.list3Count

*Where:* List 3: first block directly after the last list-2 block; each next block at previous start + blockSize (= 32 + 56*vectorEntryCount + 8*pairEntryCount).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | u32 | `blockSize` | Block length = 32 + 56*vectorEntryCount + 8*pairEntryCount (recomputed by the Workshop, not read by it). |  | IW Formats/Ebp/Cameras.cs:171, 339-340 |
| 0x04 | 2 | u16 | `vectorEntryCount` | Number of 56-byte list3VectorEntry rows at +0x20. |  | IW Formats/Ebp/Cameras.cs:172, 341 |
| 0x06 | 2 | u16 | `pairEntryCount` | Number of 8-byte list3PairEntry rows after the vector rows. |  | IW Formats/Ebp/Cameras.cs:173, 342 |
| 0x08 | 4 | f32 | `vecAX` | First 3-float vector, meaning unknown. |  | IW Formats/Ebp/Cameras.cs:176-182, 344-350 |
| 0x0C | 4 | f32 | `vecAY` |  |  | IW Formats/Ebp/Cameras.cs:176-182, 344-350 |
| 0x10 | 4 | f32 | `vecAZ` |  |  | IW Formats/Ebp/Cameras.cs:176-182, 344-350 |
| 0x14 | 4 | f32 | `vecBX` | Second 3-float vector, meaning unknown. |  | IW Formats/Ebp/Cameras.cs:176-182, 344-350 |
| 0x18 | 4 | f32 | `vecBY` |  |  | IW Formats/Ebp/Cameras.cs:176-182, 344-350 |
| 0x1C | 4 | f32 | `vecBZ` |  |  | IW Formats/Ebp/Cameras.cs:176-182, 344-350 |

### Record `list3VectorEntry` - 56 bytes (0x38), count: per list3Block: vectorEntryCount

*Where:* List-3 block start + 32 + 56*k (k = 0 .. vectorEntryCount-1).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | f32 | `vecAX` | Three 4-float vectors and two scalars, meaning unknown. |  | IW Formats/Ebp/Cameras.cs:184-205, 352-371 |
| 0x04 | 4 | f32 | `vecAY` |  |  | IW Formats/Ebp/Cameras.cs:184-205, 352-371 |
| 0x08 | 4 | f32 | `vecAZ` |  |  | IW Formats/Ebp/Cameras.cs:184-205, 352-371 |
| 0x0C | 4 | f32 | `vecAW` |  |  | IW Formats/Ebp/Cameras.cs:184-205, 352-371 |
| 0x10 | 4 | f32 | `vecBX` |  |  | IW Formats/Ebp/Cameras.cs:184-205, 352-371 |
| 0x14 | 4 | f32 | `vecBY` |  |  | IW Formats/Ebp/Cameras.cs:184-205, 352-371 |
| 0x18 | 4 | f32 | `vecBZ` |  |  | IW Formats/Ebp/Cameras.cs:184-205, 352-371 |
| 0x1C | 4 | f32 | `vecBW` |  |  | IW Formats/Ebp/Cameras.cs:184-205, 352-371 |
| 0x20 | 4 | f32 | `vecCX` |  |  | IW Formats/Ebp/Cameras.cs:184-205, 352-371 |
| 0x24 | 4 | f32 | `vecCY` |  |  | IW Formats/Ebp/Cameras.cs:184-205, 352-371 |
| 0x28 | 4 | f32 | `vecCZ` |  |  | IW Formats/Ebp/Cameras.cs:184-205, 352-371 |
| 0x2C | 4 | f32 | `vecCW` |  |  | IW Formats/Ebp/Cameras.cs:184-205, 352-371 |
| 0x30 | 4 | f32 | `unknown30` |  |  | IW Formats/Ebp/Cameras.cs:184-205, 352-371 |
| 0x34 | 4 | f32 | `unknown34` | Probably unused (labelled with a question mark). Preserve. |  | IW Formats/Ebp/Cameras.cs:184-205, 352-371 |

### Record `list3PairEntry` - 8 bytes (0x08), count: per list3Block: pairEntryCount

*Where:* List-3 block start + 32 + 56*vectorEntryCount + 8*k (k = 0 .. pairEntryCount-1).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | f32 | `value0` | Two floats, meaning unknown. |  | IW Formats/Ebp/Cameras.cs:207-214, 373-377 |
| 0x04 | 4 | f32 | `value1` |  |  | IW Formats/Ebp/Cameras.cs:207-214, 373-377 |

### Enums

`CameraEntryKind`

| Value | Label |
|---|---|
| 1 | Camera key (64 bytes) |
| 2 | Kind 2 entry (44 bytes) |

## Count and size rules

- Camera key = 64 bytes, kind-2 entry = 44 bytes (IW Formats/Ebp/Cameras.cs:410, 452). A camera block is 0x2C + sum of its entry
  sizes.
- List-2 block = 24 + 36 x entryCount; list-3 block = 32 + 56 x vectorEntryCount + 8 x pairEntryCount.
- Section size = listStart + sum of all block sizes, rounded up to 16 with zeros (IW Formats/Ebp/Cameras.cs:379).
- The kind-2 entry has fixed-length arrays (13 words, 2 words, 6 bytes); the Workshop rejects other lengths
  (IW Formats/Ebp/Cameras.cs:27-40).

## Pointers to fix when sizes change

- `listStart` (header 0x1C) only changes if the header changes size (it does not; keep it).
- `blockSize` of a camera block changes by +/-64 or +/-44 per added/removed entry; list-2/3 `blockSize` changes
  with their counts. Everything after a resized block moves, but there are no absolute offsets inside the section
  to fix except `listStart`.
- If section 8 (CML1) refers to camera blocks by index (unverified), adding or removing blocks other than at the
  end would break those links.
- If this section's length changes, every EBP section stored after it moves: recompute their `u32` slots at
  EBP+0x10+4n, keep 16-byte starts with zero fill, keep absent sections at 0. Offsets inside other sections are
  relative to their own start (and the embedded ARD's offsets to the ARD start), so nothing else changes.

## Text

- The 24-byte `label` of each camera block is Shift-JIS (code page 932), zero-padded; a 24-byte name has no
  terminator (IW Formats/Ebp/Cameras.cs:69-70, 240-246; IW Helpers/BinaryHelper.cs:35-43).
- The Workshop's reader drops every 0x00 byte in the field, not just the trailing ones (IW Formats/Ebp/Cameras.cs:69), so a label with
  bytes after its terminator does not survive its JSON round trip unchanged. Our editor treats the field as raw
  bytes.

## Links to other data

- CML1 section 8 ([`ebp-cameramappings`](./ebp-cameramappings.md)) probably maps script camera names to these
  blocks.
- The live camera's vertical field of view is in radians (TK L508); the file value is in degrees.

## Round-trip rules

- Keep the magic 'CAM7', header bytes 0x10-0x1B and listStart as read.
- Walk the section strictly: listStart -> camera blocks (each blockSize long; entries from +0x28 to blockSize-4, layout chosen by the kind byte) -> list-2 blocks -> list-3 blocks. Stop and refuse to edit if a kind other than 1 or 2 appears or the walk overruns the section.
- In-place edits of floats, flags and u16/u8 values change nothing else.
- Keep the 24-byte label field as raw bytes (do not strip interior zero bytes); a new label must fit in 24 Shift-JIS bytes, padded with 0x00.
- Keep unknown00, pad bytes, footer and the probably-unused words as read.
- Adding or removing an entry inside a camera block changes that block's blockSize (by 64 or 44) and moves everything after it; update cam7Header counts when blocks are added or removed, and blockSize/entryCount/vectorEntryCount/pairEntryCount for list-2/3 blocks.
- After any size change, zero-pad the section end to 16 bytes.
- If the section length changes, every EBP section stored after it moves: recompute their u32 slots at EBP+0x10+4n, keep 16-byte starts with zero fill, keep absent sections at 0, keep section 6 (TIM2) and section 19 (ARD) intact.

## Known unknowns

- What list 2 and list 3 describe (camera paths, shakes, collision volumes?). The runtime also tracks camera shakes and lights (Toolkit), but no source ties them to these lists.
- Meaning of header bytes 0x10-0x1B (possibly offsets of lists 2 and 3) and whether the game uses listStart or assumes 0x20.
- Meaning of cameraW / viewAngleW, unknown2C/30/38, flags, unknown24/26 and the footer word.
- Meaning of every field of the kind-2 entry.
- Whether vanilla blockSize values for list-2/3 blocks always equal the formula (the Workshop never reads them).
- How camera blocks are referenced (by index through CML1 section 8, or by their own label).

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; its licence forbids copying, modifying or converting its code, and none of it is reused here). Paths are relative to that repo: `Formats/Ebp/*.cs`, `Helpers/PackHelper.cs`, `Helpers/BinaryHelper.cs`, `Resources/JsonFile.cs`, `Resources/OtherFile.cs`, `Resources/PackFile.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. Section 4.17 (L1074-L1131) is the EBP editor. |
| Lists | Drop-down lists of The Insurgent's Toolkit. Lists named in `enum` either ship in `editor/data/lists.json` (`ModelList`) or are copied into this spec's `enums` block. |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
