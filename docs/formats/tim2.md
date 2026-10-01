# Texture Image Map (TIM2 .tm2) with the FFXII eXt icon table

Spec id: `tim2` · machine spec: [`tim2.json`](./tim2.json)

> **FILE FORMAT.** Stored in game files; an offline editor can patch it.

## What this is

FFXII stores its 2-D textures (menu art, icons, map/handbook images, EBP textures) as **TIM2** (`.tm2`), the
standard PS2 texture container, extended with an FFXII-specific **`eXt` block** that cuts the texture into
named-by-index **icon sections -> icon groups -> icons** (sub-rectangles with their own CLUT selection).
MRP entries address icons by (texture, section, group, entry) (see [`mrp`](./mrp.md)).

| Where TIM2 data occurs | Source |
|---|---|
| stand-alone `*.tm2` files (unpacked by the Workshop into `<name>.tm2.dir`) | IW Resources/OtherFile.cs:57 |
| sections of `tex2pack_ys.bin` (11) and `texpack_ys.bin` (5) | container-otherpack; msg 794, 821 |
| EBP section 6 | container-ebp (IW Helpers/PackHelper.cs:217-222) |
| `himgd` image packs (Clan Primer) | container-himgd |
| inside other formats (efx etc.) | msg 0-3 |
| runtime texture registry, count at `[0x02090780]` (Toolkit TM2 editor: Registry / Icon Sections / Clut Groups) | TK L445, L1153 |

Editing tools mentioned by the community: Rainbow (convert to/from PNG) and a Photoshop plug-in (msg 825,
830-831); the Workshop splits multi-CLUT textures into one `.tm2` per CLUT ("layers") plus `merged.raw` and
rebuilds them (IW Formats/Tim2.cs:180-370).

## Layout

```
0x00  fileHeader (0x10)        'TIM2', revision, format, pictureCount=1, 8 reserved
0x10  pictureHeader (0x30)     sizes, colour types, width/height, GS registers
0x40  [eXt block]              optional; size = headerSize - 0x30
        +0x00 extHeader (0x14)
        +0x14 u16 iconSectionIndex[sectionCount]   (first value = sectionCount)
              u16 iconGroupIndex[...]              (per section, consecutive)
              zero pad to 16
        +clutListOffset      u8 clutGroups[16]
        +iconEntryListOffset iconEntry[...] (8 bytes each), zero pad to 16
0x10+headerSize               pixel data (imageSize bytes)
                              CLUTs: N x 256 x RGBA (1024 bytes each)
```

(IW Formats/Tim2.cs:34-176 read, :214-312 write.)

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…` are not interpreted by any source; keep their original bytes. Overlapping rows are alternative views of the same bytes (the note says which applies).

### Record `fileHeader` — 16 bytes (0x10), count: 1

*Where:* File offset 0 (or start of the embedded TIM2 inside a container section).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `magic` | ASCII "TIM2". |  | IW Formats/Tim2.cs:13, 35-38; IW Helpers/PackHelper.cs:21 |
| 0x04 | 1 | u8 | `formatRevision` | File format revision (round-tripped). |  | IW Formats/Tim2.cs:40, 276 |
| 0x05 | 1 | u8 | `format` | Format byte (round-tripped). In generic TIM2 this selects 16- vs 128-byte alignment (general knowledge). |  | IW Formats/Tim2.cs:41, 277 |
| 0x06 | 2 | u16 | `pictureCount` | Number of pictures; the Workshop reads/writes exactly 1. |  | IW Formats/Tim2.cs:42, 279 |
| 0x08 | 8 | bytes | `reserved08` | Reserved, 8 bytes (skipped/zero). |  | IW Formats/Tim2.cs:42, 280 |

### Record `pictureHeader` — 48 bytes (0x30), count: fileHeader.pictureCount (1)

*Where:* fileHeader + 0x10 (picture 0).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | u32 | `totalSize` | Picture size = headerSize + imageSize + clutSize. |  | IW Formats/Tim2.cs:46, 285, 288 |
| 0x04 | 4 | u32 | `clutSize` | CLUT bytes (1024 per 256-colour CLUT). |  | IW Formats/Tim2.cs:46, 283, 289 |
| 0x08 | 4 | u32 | `imageSize` | Pixel data bytes. |  | IW Formats/Tim2.cs:47, 290 |
| 0x0C | 2 | u16 | `headerSize` | Picture header size INCLUDING the eXt block (0x30 + eXt size). Pixel data starts at pictureHeader + headerSize. |  | IW Formats/Tim2.cs:48, 66, 259, 291 |
| 0x0E | 2 | u16 | `clutColors` | CLUT colour count; number of 256-colour CLUTs = (clutColors + 0xFF) >> 8 (FFXII menu textures carry several CLUTs = "layers"). |  | IW Formats/Tim2.cs:49, 286, 292 |
| 0x10 | 1 | u8 | `pictureFormat` | Picture format. |  | IW Formats/Tim2.cs:53, 293 |
| 0x11 | 1 | u8 | `mipmapCount` | Mipmap count (the Workshop writes 1). |  | IW Formats/Tim2.cs:54, 295 |
| 0x12 | 1 | u8 | `clutColorType` | CLUT colour type (low bits; generic TIM2 puts extra flags in the high bits). | `TimeColorTypeList` | IW Formats/Tim2.cs:55; TK L1153 |
| 0x13 | 1 | u8 | `imageColorType` | Image colour type. | `TimeColorTypeList` | IW Formats/Tim2.cs:56; TK L1153 |
| 0x14 | 2 | u16 | `width` | Image width in pixels. |  | IW Formats/Tim2.cs:57 |
| 0x16 | 2 | u16 | `height` | Image height in pixels. |  | IW Formats/Tim2.cs:58 |
| 0x18 | 8 | bf64 | `gsTex0` | GS TEX0 register value (round-tripped by the Workshop). Bit layout per the PS2 GS; the Toolkit exposes PSM / CPSM / TFX with its own enums. | bits below | IW Formats/Tim2.cs:59; PS2 GS TEX0 register layout (general PS2 knowledge, not from our sources); TK L1153 |
| 0x20 | 8 | u64 | `gsTex1` | GS TEX1 register value (round-tripped). |  | IW Formats/Tim2.cs:60 |
| 0x28 | 4 | u32 | `gsFlags` | GS flags register (round-tripped). |  | IW Formats/Tim2.cs:61 |
| 0x2C | 4 | u32 | `gsTexClut` | GS TEXCLUT register (round-tripped). |  | IW Formats/Tim2.cs:62 |

#### Bits of `pictureHeader.gsTex0` (bf64 at 0x18; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0-13 | `tbp0` |  |
| 14-19 | `tbw` |  |
| 20-25 | `psm` | enum `TimePixelStorageFormatList` |
| 26-29 | `tw` |  |
| 30-33 | `th` |  |
| 34 | `tcc` |  |
| 35-36 | `tfx` | enum `TimeTextureFunctionList` |
| 37-50 | `cbp` |  |
| 51-54 | `cpsm` | enum `TimeClutStorageFormatList` |
| 55 | `csm` |  |
| 56-60 | `csa` |  |
| 61-63 | `cld` |  |

### Record `extHeader` — 20 bytes (0x14), count: 0 or 1

*Where:* pictureHeader + 0x30 (= file 0x40) when the 4 bytes there are "eXt\0"; absent otherwise. All offsets below are relative to the start of this block.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `magic` | "eXt" + NUL (65 58 74 00). |  | IW Formats/Tim2.cs:88, 429 |
| 0x04 | 4 | u32 | `extSize` | Size of the whole eXt block (= headerSize - 0x30, 16-aligned). Pixel data follows it. |  | IW Formats/Tim2.cs:94, 108, 260, 309 |
| 0x08 | 4 | u32 | `extSizeCopy` | Same value again. |  | IW Formats/Tim2.cs:95, 310 |
| 0x0C | 4 | u32 | `reserved0C` | Reserved (skipped). |  | IW Formats/Tim2.cs:95, 311 |
| 0x10 | 2 | u16 | `iconEntryListOffset` | Offset of the icon entry list (8-byte iconEntry records). |  | IW Formats/Tim2.cs:96, 247, 313 |
| 0x12 | 2 | u16 | `clutListOffset` | Offset of the 16-byte CLUT-group table. clutGroups byte count = iconEntryListOffset - clutListOffset (must be 16). |  | IW Formats/Tim2.cs:97-105, 244, 314, 442 |

### Record `iconSectionIndex` — 2 bytes (0x2), count: value of the first entry (sectionCount)

*Where:* extHeader + 0x14 + 2*i, i = 0 .. sectionCount-1. The FIRST value equals sectionCount (the group lists start right after this list).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `firstGroupIndex` | Index, in u16 units from extHeader+0x14, of this section's first group entry; groups of section i = [value(i), value(i+1)); the last section runs until the scan hits 0 or the CLUT table. |  | IW Formats/Tim2.cs:100-135, 226-231 |

### Record `iconGroupIndex` — 2 bytes (0x2), count: per section: firstGroupIndex(i+1) - firstGroupIndex(i)

*Where:* extHeader + 0x14 + 2*firstGroupIndex(section) + 2*j

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `firstIconIndex` | Index of the group's first icon in the icon entry list; icons of a group = [value(j), value(j+1)); the last group runs until an all-zero icon entry or the pixel data. |  | IW Formats/Tim2.cs:137-165, 233-239 |

### Record `clutGroups` — 16 bytes (0x10), count: 1

*Where:* extHeader + clutListOffset

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 16 | bytes | `clutGroup` | 16 CLUT-group bytes (exactly 16 entries are required). An icon's clutGroupLink (0-15) selects one of them. |  | IW Formats/Tim2.cs:104-105, 245, 442 |

### Record `iconEntry` — 8 bytes (0x8), count: sum of all groups' icon counts

*Where:* extHeader + iconEntryListOffset + 8*iconIndex

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `x` | Left edge of the icon inside the texture (pixels). |  | IW Formats/Tim2.cs:165, 250 |
| 0x02 | 2 | u16 | `y` | Top edge. |  | IW Formats/Tim2.cs:166, 251 |
| 0x04 | 4 | bf32 | `attributes` | Packed size and CLUT links. | bits below | IW Formats/Tim2.cs:167-172, 253 |

#### Bits of `iconEntry.attributes` (bf32 at 0x04; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0-11 | `width` |  |
| 12-23 | `height` |  |
| 24-27 | `additiveClutEntryLink` | 0-15 |
| 28-31 | `clutGroupLink` | 0-15, index into clutGroups |

### Record `clutColor` — 4 bytes (0x4), count: 256 per CLUT, (clutColors+0xFF)>>8 CLUTs

*Where:* pictureHeader + headerSize + imageSize + clut*1024 + colour*4

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `red` | Red. |  | IW Formats/Tim2.cs:76-80 |
| 0x01 | 1 | u8 | `green` | Green. |  |  |
| 0x02 | 1 | u8 | `blue` | Blue. |  |  |
| 0x03 | 1 | u8 | `alpha` | Alpha in PS2 range (0x80 = opaque); the Workshop doubles it on export and halves it (rounding up) on import. |  | IW Formats/Tim2.cs:271, 337 |

## Enums carried in the JSON spec

#### `TimeColorTypeList`

| Value | Label |
|---|---|
| 0 (0x0) | Undefined |
| 1 (0x1) | 16-bit RGBA (A1B5G5R5) |
| 2 (0x2) | 32-bit RGB (X8B8G8R8) |
| 3 (0x3) | 32-bit RGBA (A8B8G8R8) |
| 4 (0x4) | 4-bit indexed |
| 5 (0x5) | 8-bit indexed |

#### `TimePixelStorageFormatList`

| Value | Label |
|---|---|
| 0 (0x0) | PSMCT32 |
| 1 (0x1) | PSMCT24 |
| 2 (0x2) | PSMCT16 |
| 10 (0xA) | PSMCT16S |
| 19 (0x13) | PSMT8 |
| 20 (0x14) | PSMT4 |
| 26 (0x1A) | PSMT4HL |
| 27 (0x1B) | PSMT8H |
| 44 (0x2C) | PSMT4HH |
| 48 (0x30) | PSMZ32 |
| 49 (0x31) | PSMZ24 |
| 50 (0x32) | PSMZ16 |
| 58 (0x3A) | PSMZ16S |

#### `TimeClutStorageFormatList`

| Value | Label |
|---|---|
| 0 (0x0) | PSMCT32 |
| 1 (0x1) | PSMCT24 |
| 2 (0x2) | PSMCT16 |
| 10 (0xA) | PSMCT16S |

#### `TimeTextureFunctionList`

| Value | Label |
|---|---|
| 0 (0x0) | Modulate |
| 1 (0x1) | Decal |
| 2 (0x2) | Hilight |
| 3 (0x3) | Hilight 2 |

## Size / pointer rules

* `headerSize = 0x30 + extSize`; `totalSize = headerSize + imageSize + clutSize`; `clutSize = 1024 * CLUTs`;
  `clutColors = CLUTs << 8` (IW Formats/Tim2.cs:259-292).
* Adding icons/groups/sections grows the eXt block: recompute `iconSectionIndex`/`iconGroupIndex` values,
  `clutListOffset`, `iconEntryListOffset` (both 16-aligned in Workshop output), `extSize` (twice),
  `headerSize` and `totalSize`. Pixel data and CLUTs move but have no stored offsets.
* Changing image size or CLUT count changes `imageSize`/`clutSize`/`totalSize`/`clutColors` and the GS
  register values (TBW/TW/TH) the game uploads with.
* When the TIM2 lives inside a container (otherpack, EBP, himgd) the container's section offsets must be
  rebuilt after any size change.

## Round-trip rules

- Keep formatRevision, format, pictureFormat, colour types and all four GS register values unchanged unless re-encoding the pixel data.
- CLUT alpha stays in PS2 range (0x00-0x80); convert x2 only for display.
- Keep exactly 16 clutGroups bytes and the zero padding to 16 after the index lists and after the icon list.
- In-place edits of icon x/y/width/height and CLUT links are safe (no size change).
- Copy the reserved bytes and the eXt reserved dword unchanged.

## Known unknowns

- Meaning of the clutGroups bytes and of additiveClutEntryLink beyond their index ranges.
- Multi-picture files (pictureCount > 1) and mipmaps: not handled by the Workshop; not seen documented for FFXII.
- Exact semantics of pictureFormat / format bytes in FFXII files.
- Runtime texture registry layout at [0x02090780] (only its count is located).
- The "last section/group" length rule relies on scanning for zero values (Workshop heuristic); an editor should prefer explicit counts when rebuilding.

## Source keys

| Key | Source |
|---|---|
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of Xeavin's *The Insurgent's Toolkit* Cheat Engine table for FFXII TZA Steam 1.0.4.0), line n. |
| LL `<page>:<line>` | FF12 Lua Loader documentation, `docs/capabilities/<page>.md` (e.g. `save-config`, `memory`, `event`, `bpack`). |
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (fact reference only; its licence forbids copying or converting its code). |
| Drive `<script>:<line>` | Lua mod scripts from the user's Google Drive export (scratchpad `drive/` folder; file named `<id>__<script>`). Most are by Xeavin (*The Insurgent's Forge* helper classes such as `getBattleUnitKeep.lua`, and the mods *Manifesto*, *Companions*, *Itemized Bazaar*, *Thrifty Bazaar*); others by FehDead (`Wayfarer.lua`, `mappings.lua`, `frame.lua`, `layout.lua`) and LowPriorityCitizen (`helpers.lua`, `DuplicateAugmentDetector.lua`). They target the same Steam build as the Toolkit (same absolute addresses). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
| Lists `<name>` | Drop-down lists of The Insurgent's Toolkit (`editor/data/lists.json`, or the full extraction `ct_lists.json`). |

All absolute addresses (e.g. `0x02EBF190`) are for the Steam build the Toolkit targets (1.0.4.0); they are
module-relative offsets as used by Cheat Engine and the Lua Loader. `[X]` means "the 64-bit pointer stored at X".
