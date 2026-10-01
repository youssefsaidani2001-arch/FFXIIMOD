# Container: EBP (`*.ebp`, magic `EBP2`)

EBP ("Environment Blueprint Pack") is the per-area / per-event script package:
compiled script, dialogue text, cameras, models, spawn positions, and a nested
ARD (foe data). The container is a fixed 0x80-byte header with 20 section
offsets.

## Sources and citation keys

| Key | Meaning |
|---|---|
| `W:<file>:<line>` | The Insurgent's Workshop, `/home/user/xeavin/the-insurgents-workshop` - facts only, no code reused (licence: personal use only). |
| `R:<line>` | `docs/research/insurgents_toolkit_reference.md`. |
| `D#<n>` | Discord export *wip-general*, message index `n`. |

## Files

| Item | Value | Source |
|---|---|---|
| Pattern | any `*.ebp` (e.g. `srb_b04.ebp`, `dst_a03.ebp`, event files like `bul_a0380`) | W:Resources/PackFile.cs:28, D#116, D#1049, R:1127 |
| Game file types | "Location File" (.ebp/.mot/.fpk) and "Event File" (.ebp/.mot/.snd/.vpc) | R:1411 |
| Section count | 20 (0-19) | W:Resources/PackFile.cs:28 |
| Runtime | 5 loaded slots (0 = Battle ... 4 = Debug) | R:243, R:1080 |

VBF folders are not recorded in the sources.

## Byte order

Little-endian.

## Header (0x80 bytes)

| Off | Size | Type | Name | Meaning |
|---|---|---|---|---|
| 0x00 | 4 | bytes | magic | `EBP2` = 45 42 50 32 (W:Helpers/PackHelper.cs:181-185) |
| 0x04 | 4 | u32 | headerWord04 | Unknown. The reference packer treats 0x00-0x07 as an 8-byte magic field but only writes the first 4 bytes, so it emits 0 here (W:Helpers/PackHelper.cs:235-239). |
| 0x08 | 8 | bytes | reserved08 | Described as unused by the reference packer; emitted as zeros (W:Helpers/PackHelper.cs:239). |
| 0x10 | 80 | u32[20] | sectionOffset[0..19] | Absolute file offset of each section; **0 = section absent** (W:Helpers/PackHelper.cs:188-193, :204-207, :250-256). |
| 0x60 | 32 | bytes | reserved60 | Unused/alignment; emitted as zeros (W:Helpers/PackHelper.cs:239). |
| 0x80 | - | - | data | First section starts here when rebuilt. |

## Section data

* Sections are stored back-to-back, each followed by zero padding to the next
  16-byte boundary (W:Helpers/PackHelper.cs:243-257).
* The reference packer lays them out in index order 0..19. The reference
  unpacker does **not** assume any order: it sorts the non-zero offsets and
  takes each section's length as the distance to the next larger offset, or to
  end of file for the highest one (W:Helpers/PackHelper.cs:195-213). An editor
  should do the same, and when rebuilding should keep the original physical
  order.
* The section at the highest offset therefore includes the file's trailing
  padding.
* A section is present only if its offset is non-zero and its length is
  non-zero.

## Section map

| # | Content | Section magic / shape | Source |
|---|---|---|---|
| 0 | Compiled event/field script (VM bytecode); decompiled by the external `ff12-script` tool to `.c` | script header with date, author, file name strings (toolkit) | W:Resources/OtherFile.cs:20, R:1084-1121 |
| 1 | unknown | - | |
| 2 | Text table (dialogue) | FFXII text format | W:Resources/OtherFile.cs:21 |
| 3 | Text table (dialogue) | FFXII text format | W:Resources/OtherFile.cs:21 |
| 4 | Navigation (map) icons | `NAVIICN2` | W:Resources/JsonFile.cs:63, W:Formats/Ebp/NavigationIcons.cs:12 |
| 5 | unknown | - | |
| 6 | Texture | `TIM2` | W:Helpers/PackHelper.cs:217-222 |
| 7 | unknown | - | |
| 8 | Camera mappings | `CML1` | W:Resources/JsonFile.cs:64, W:Formats/Ebp/CameraMappings.cs:12 |
| 9 | Cameras | `CAM7` | W:Resources/JsonFile.cs:65, W:Formats/Ebp/Cameras.cs:13 |
| 10 | Camera mappings (second set) | `CML1` | W:Resources/JsonFile.cs:64 |
| 11 | unknown | - | |
| 12 | Models | u32 count, then s32 model ids | W:Resources/JsonFile.cs:66, W:Formats/Ebp/Models.cs:23-28 |
| 13-15 | unknown | - | |
| 16 | Spawn positions | `FF12POS3` | W:Resources/JsonFile.cs:67, W:Formats/Ebp/Positions.cs:12, R:1084 |
| 17-18 | unknown | - | |
| 19 | Nested ARD (foe data) | `FF12AR03`, see `container-ard` | W:Helpers/PackHelper.cs:217-222, :245 |

The toolkit's battle-script load handler keeps per-slot pointers named Script,
Character/Field Dialogs, Textures, Cameras, Camera Mappings, Models, Camera
Shakes, Camera Shake Mappings, Lights, Motions, Snd/Fpk and voices (R:1365).
These probably correspond to some of the unknown sections, but no source maps
them to indices.

## Text and strings

* Sections 2 and 3 are FFXII text tables; the workshop hands them to the
  external `ff12-text` tool, choosing the language from the folder
  (`in` = Japanese, `kr`, `cn` = Simplified Chinese, `ch` = Traditional
  Chinese, otherwise English) (W:Helpers/PackHelper.cs:478-514, :593-603).
* Labels inside sections 8/9/10 are Shift-JIS (code page 932)
  (W:Formats/Ebp/CameraMappings.cs:54, W:Formats/Ebp/Cameras.cs:70,
  W:Helpers/BinaryHelper.cs:35-43). Actor names in the script are also
  Shift-JIS (R:677).

## Nesting

* Section 19 is a complete ARD. Unpack order: EBP first, then the ARD found in
  it; pack order is the reverse (inner ARD rebuilt first)
  (W:Resources/PackFile.cs:28-29, W:Program.cs:53, :88).

## Pointers to fix when sizes change

* Resizing a section moves every section stored after it: recompute their
  `sectionOffset` entries (keep 16-byte alignment, zero fill).
* Absent sections keep offset 0.
* Section-internal offsets are the business of each section's own format.

## Round-trip rules

* Copy 0x04-0x0F and 0x60-0x7F from the original file. Do not assume zero:
  the reference tool zeroes them, and it is not confirmed that vanilla has
  zeros there.
* Keep the physical order of sections as found in the original (sort by
  original offset), not just index order.
* Keep absent sections at offset 0, and present sections present.
* **Do not drop section 6.** The reference unpacker saves section 6 with a
  texture extension while its packer only looks for a `.bin` file for every
  index except 19, so a naive unpack/repack loses section 6 (offset becomes 0)
  (W:Helpers/PackHelper.cs:217-222 vs :245-247). Our tool must carry section 6
  through regardless of how it is named on disk.
* Copy unedited sections byte-for-byte including their trailing padding.

## Known unknowns

* Meaning of 0x04-0x0F (version, size, flags?). The loader records a "Pre-Z EBP
  file size" (R:426), which might relate to a header size field or to archive
  compression; unverified.
* Sections 1, 5, 7, 11, 13, 14, 15, 17, 18.
* Whether vanilla EBPs store sections in index order.
* A user notes one non-EBP file "wants to think it's an ebp" (D#1034); which
  file is not stated.
