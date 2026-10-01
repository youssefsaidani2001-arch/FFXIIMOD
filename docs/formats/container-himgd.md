# Container: `himgd` image packs and the menuhandbook (Clan Primer) file family

The Clan Primer / bestiary ("menuhandbook") data is split across four kinds
of file. Only `himgd` is a real multi-section container; the other three are
listed here so an editor can route every `menuhandbook*` file correctly.

| File name pattern | Kind | Magic | Spec |
|---|---|---|---|
| `menuhandbook_<cat>NNN.dat` (image ranges below) | himgd image pack (TIM2 images) | `himgd\0\0\0` | this document |
| `menuhandbook_<cat>NNN.dat` (text numbers below) | FFXII text table | - | text tool, not documented here |
| `menuhandbook_<cat>.bin` | category index ("hctgf") | `hctgf\0\0\0` | header below |
| `menuhandbook.bin` | global unlock rules ("hcomg") | `hcomg\0\0\0` | header below |

`<cat>` is one of `knowledge`, `monster`, `person`, `story`, `tutorial`,
`world` (W:Resources/PackFile.cs:30-35, W:Resources/OtherFile.cs:26-31,
W:Resources/JsonFile.cs:74-80).

## Sources and citation keys

| Key | Meaning |
|---|---|
| `W:<file>:<line>` | The Insurgent's Workshop, `/home/user/xeavin/the-insurgents-workshop` - facts only, no code reused (licence: personal use only). |
| `R:<line>` | `docs/research/insurgents_toolkit_reference.md`. |
| `D#<n>` | Discord export *wip-general*, message index `n`. |

## Where the files are

* Bestiary text `menuhandbook_monster000.dat` .. `003.dat` sits in a folder
  named `myoshiok`; the rest of the Clan Primer files are said to be in the same
  folder (D#1035). Exact VBF path not recorded.
* Hunt progress descriptions need a different (older) text tool (D#1040).

## Which numbers are which

| Category | Text tables (`.dat`) | himgd image packs (`.dat`) | Source |
|---|---|---|---|
| knowledge | 000-001 | 002-029 | OtherFile.cs:26, PackFile.cs:30 |
| monster | 000-003 | 004-099, plus some three-digit numbers above 099 (the reference pattern for those looks malformed, so the true upper range is unverified) | OtherFile.cs:27, PackFile.cs:31 |
| person | 000 | 001-029 | OtherFile.cs:28, PackFile.cs:32 |
| story | 000 | 001-099 | OtherFile.cs:29, PackFile.cs:33 |
| tutorial | 000 | 001-049 | OtherFile.cs:30, PackFile.cs:34 |
| world | 000 | 001-049 | OtherFile.cs:31, PackFile.cs:35 |

An editor should identify himgd by its magic, not by these ranges.

## Byte order

Little-endian.

---

## himgd image pack

### Header

| Off | Size | Type | Name | Meaning |
|---|---|---|---|---|
| 0x00 | 8 | bytes | magic | `himgd` + three zero bytes = 68 69 6D 67 64 00 00 00 (W:Helpers/PackHelper.cs:370-374) |
| 0x08 | 2 | u16 | index | Unknown identifier. The reference packer writes 0 because it cannot be derived from the file alone (W:Helpers/PackHelper.cs:376, :418) - so vanilla files carry a meaningful value here. **Preserve it.** |
| 0x0A | 2 | u16 | imageCount | Number of entries in the offset table (W:Helpers/PackHelper.cs:377, :431) |
| 0x0C | 4*count | u32[] | imageOffset | Absolute file offsets of the images; 0 = absent (W:Helpers/PackHelper.cs:380-384, :453-457) |
| ... | | | | zero padding to the next 16-byte boundary (W:Helpers/PackHelper.cs:434-435) |

Header size = `12 + 4*imageCount`, rounded up to 16: 1 image -> 0x10,
2-5 images -> 0x20, 6-9 -> 0x30, and so on.

### Images

* Each image is a TIM2 file (`TIM2` magic) followed by zero padding to 16
  (W:Helpers/PackHelper.cs:403, :441-450).
* Reading: sort non-zero offsets; length = gap to next larger offset, or to end
  of file for the highest (W:Helpers/PackHelper.cs:386-401).
* The reference packer assigns table slots in the order it finds the image
  files and drops absent ones, so a slot that was 0 in the original would be
  lost and later slots would shift (W:Helpers/PackHelper.cs:426-450). Our tool
  must keep slot numbering and zero slots exactly.

### Pointers to fix

Resizing an image moves all later `imageOffset` values; recompute with 16-byte
alignment. Header size depends only on `imageCount`.

---

## hctgf category index (`menuhandbook_<cat>.bin`)

### Header (0x18 bytes)

| Off | Size | Type | Name | Meaning |
|---|---|---|---|---|
| 0x00 | 8 | bytes | magic | `hctgf` + 3 zero bytes (W:Formats/MenuHandBook/Hctgf.cs:12, :59-62) |
| 0x08 | 2 | u16 | type | Meaning unknown ("Type?") (Hctgf.cs:14-15, :64) |
| 0x0A | 2 | u16 | entryBasicInfoOffset | Absolute file offset of the entry-basic-info table (Hctgf.cs:65, :232-234) |
| 0x0C | 2 | u16 | entryExtendedInfoOffset | Absolute file offset of the entry-extended-info table (Hctgf.cs:66) |
| 0x0E | 2 | u16 | entryBasicInfoCount | (Hctgf.cs:67) |
| 0x10 | 2 | u16 | entryExtendedInfoCount | (Hctgf.cs:68) |
| 0x12 | 2 | u16 | headerBasicInfoCount | (Hctgf.cs:69) |
| 0x14 | 2 | u16 | imagesFileLinkOffset | Base link into the image (himgd) files (Hctgf.cs:17-18, :70) |
| 0x16 | 2 | u16 | imagesFileCount | Number of image files used (Hctgf.cs:20-21, :71) |

### Body, in file order (as the reference writer lays it out)

1. `headerBasicInfo[headerBasicInfoCount]`: s32 text id (page/header name)
   each, from 0x18 (Hctgf.cs:73-81).
2. Header-extended block: u16 count, then u16 offsets **relative to the block
   start**; each pointed-to item is `u8 (contentCount << 4)`, `u8 locationCount`,
   `u16 contents[contentCount]`, `u16 locations[locationCount]`, padded to 4.
   `contentCount` is a 4-bit field, max 15 (Hctgf.cs:83-109, :41-44, :176-197).
3. Entry-extended table at `entryExtendedInfoOffset`: u16 image file link per
   entry, padded to 4 (Hctgf.cs:111-120, :199-204, :291).
4. Entry-basic table at `entryBasicInfoOffset`: 12-byte records (see JSON
   `hctgfEntryBasicInfo`) (Hctgf.cs:122-137, :206-216).
5. Entry-footer block directly after: u16 count, u16 offsets relative to the
   block start, padding to 16, then 8-byte items (`u8 count` (< 8) + 7 zero
   bytes); file padded to 16 (Hctgf.cs:139-156, :218-230, :303-306).

Pointers to fix: `entryBasicInfoOffset`, `entryExtendedInfoOffset`, and the
two relative offset lists whenever any variable part changes length.

---

## hcomg global rules (`menuhandbook.bin`)

A chain of blocks; each block starts with a u16 offset to the next block,
relative to that u16's own position (W:Formats/MenuHandBook/Hcomg.cs:62, :77,
:108, :123, :166-242).

| Off | Size | Type | Name | Meaning |
|---|---|---|---|---|
| 0x00 | 8 | bytes | magic | `hcomg` + 3 zero bytes (Hcomg.cs:13, :58-61) |
| 0x08 | 2 | u16 | scrivenerBlockRelOffset | 0x08 + value = start of the scrivener block (0x3C when rebuilt) |
| 0x0A | 2 | u16 | cartographerMapCount | 384; the reader ignores it, the count is fixed in the executable (Hcomg.cs:64-66, :154) |
| 0x0C | 48 | bytes | cartographerMapBits | bit `i % 8` of byte `i / 8` = map *i* required for Cartographer (Hcomg.cs:67-74) |

Following blocks (each begins with its relative next-block offset):

* **Scrivener** - u16 next, u16 required foe count (max 512), u16 unused,
  u16 entry count, then 4-byte entries: u16 (bits 12-15 type, bits 0-11 viewed
  bestiary id), u16 (type 0: required story progress; type 1: required bestiary
  id) (Hcomg.cs:76-105).
* **Hunts** - u16 next, u16 count, then 2-byte entries (u8 quest id, u8 required
  quest stage), zero-padded to 4 (Hcomg.cs:107-120, :187-197).
* **Defeated foe figures** - u16 next, u16 count (10), then 10 x u16 bestiary
  id (Hcomg.cs:122-130).
* **Figure parameters** - u16 relative end-of-data offset, u16 count (not
  reliable), u32 presence bitmask, then one s32 per set bit; file padded to 16
  (Hcomg.cs:132-145, :209-231).

The toolkit's Traveler's Tips and Bestiary Requirements editors read the
loaded Clan Primer data at one global (R:1159-1166).

---

## Text and strings

Text lives in the separate `menuhandbook_<cat>000.dat`-style text tables
(FFXII text format, external `ff12-text` tool, language picked from the folder
name; W:Helpers/PackHelper.cs:478-514, :593-603). hctgf/hcomg hold numeric ids
only.

## Round-trip rules

* himgd: preserve `index` at 0x08, `imageCount`, zero slots and slot order;
  images at 16-byte boundaries with zero padding.
* hctgf: rebuild relative-offset lists and absolute table offsets after any
  length change; keep 4- and 16-byte alignments listed above.
* hcomg: rebuild every relative next-block offset; the last block stores the
  unpadded end of data, then the file is padded to 16.

## Known unknowns

* Meaning of himgd `index` (likely ties a himgd to hctgf `imagesFileLinkOffset`,
  unverified).
* Upper bound of monster image file numbers.
* hctgf `type`.
* VBF folder path beyond the `myoshiok` folder name.
