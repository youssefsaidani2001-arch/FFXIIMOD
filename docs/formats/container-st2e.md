# Container: `st2e` table header

`st2e` is the generic "fixed-size record table" wrapper used by most
battlepack sections and by four ARD sections. Each such section is one st2e
block: a 32-byte header followed by `entryCount` records of `entrySize` bytes.

## Sources and citation keys

| Key | Meaning |
|---|---|
| `W:<file>:<line>` | The Insurgent's Workshop, `/home/user/xeavin/the-insurgents-workshop` - facts only, no code reused (licence: personal use only). |
| `R:<line>` | `docs/research/insurgents_toolkit_reference.md`. |
| `D#<n>` | Discord export *wip-general*, message index `n`. |

## Where st2e appears

| Host | Sections | Source |
|---|---|---|
| battle_pack.bin | 3, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 26, 28, 29, 30, 31, 32, 33, 34, 35, 37, 38, 41, 42, 57, 58, 59, 60, 68, 69 | `W:Formats/Battlepack/*.cs` (all derive from the st2e base), W:Resources/JsonFile.cs:26-60 |
| ARD | 2, 4, 7, 8 | W:Formats/Ard/Classes.cs:9, Units.cs:9, Stats.cs:8 |

The toolkit uses one shared st2e parser for both the battlepack and ARD
editors (R:251-264).

## Byte order

Little-endian.

## Header (32 bytes)

| Off | Size | Type | Name | Meaning | Source |
|---|---|---|---|---|---|
| 0x00 | 4 | bytes | magic | `st2e` = 73 74 32 65 | W:Formats/St2e.cs:9, :20-23; R:258 |
| 0x04 | 4 | u32 | entryCount | Number of records | St2e.cs:10, :25; R:259 |
| 0x08 | 2 | u16 | entrySize | Bytes per record | St2e.cs:11, :26; R:260 |
| 0x0A | 2 | u16 | reserved0A | Skipped by reader and writer (zero in rebuilt files) | St2e.cs:27, :51 |
| 0x0C | 4 | u32 | entryListOffset | Offset of record 0 from the start of the section: **0x20**, or **0 when entryCount is 0** | St2e.cs:12, :28, :39; R:261 |
| 0x10 | 4 | u32 | unknownOffset10 | Unknown; 0 in every table the workshop writes | St2e.cs:13, :29, :40 |
| 0x14 | 4 | u32 | textSectionOffset | Named "text section offset"; written as 0. The toolkit zeroes it when exporting a section from memory, so the game may fill it at run time | St2e.cs:14, :30, :41; R:262, R:978 |
| 0x18 | 4 | u32 | unknownOffset18 | 0, except battlepack section 13 where it is the attribute-list offset (see below) | St2e.cs:15, :31, :42; W:Formats/Battlepack/EquipmentAndAttributes.cs:24-25; R:267 |
| 0x1C | 4 | u32 | unknownOffset1C | Unknown; 0 in every table the workshop writes | St2e.cs:16, :32, :43 |
| 0x20 | - | - | records | `entryCount * entrySize` bytes, no gaps between records | |

After the records the section is zero-padded to a multiple of 16 (every st2e
writer ends with a 16-byte alignment, e.g. W:Formats/Battlepack/KeyItems.cs:54,
W:Formats/Ard/Units.cs:151).

All offsets in the header are relative to the start of the st2e block (the
section), not to the host file. In memory the game converts `entryListOffset`
into a pointer (the toolkit calls it "entry list pointer", R:261).

## Record sizes per table

Values are the `entrySize` each table writes; read the real value from the
header when parsing.

| Host / section | Table | entrySize (dec / hex) |
|---|---|---|
| BP 3 | MP regeneration | 8 / 0x08 |
| BP 5 | Equipment categories | 4 / 0x04 |
| BP 6 | Chain levels | 37 / 0x25 |
| BP 7 | Gambits | 32 / 0x20 |
| BP 8 | Default party member gambits | 64 / 0x40 |
| BP 9 | Party member level growth | 2 / 0x02 |
| BP 11 | Magick categories | 4 / 0x04 |
| BP 12 | License nodes | 24 / 0x18 |
| BP 13 | Equipment (+ attribute list) | 52 / 0x34 |
| BP 14 | Actions | 60 / 0x3C |
| BP 15 | Status effects | 40 / 0x28 |
| BP 16 | Party members | 128 / 0x80 |
| BP 17 | Battle menu categories | 4 / 0x04 |
| BP 18 | Items | 12 / 0x0C |
| BP 26 | Mist | 8 / 0x08 |
| BP 28 | Prices | 4 / 0x04 |
| BP 29 | Magicks | 8 / 0x08 |
| BP 30 | Technicks | 8 / 0x08 |
| BP 31 | Concurrences | 13 / 0x0D |
| BP 32 | Loot | 10 / 0x0A |
| BP 33 | Maps | 10 / 0x0A |
| BP 34 | Teleport locations | 10 / 0x0A |
| BP 35 | Key items | 10 / 0x0A |
| BP 37 | Packages | 12 / 0x0C |
| BP 38 | Rewards | 12 / 0x0C |
| BP 41 | Elements | 2 / 0x02 |
| BP 42 | Initial inventory | 4 / 0x04 |
| BP 57 | Bazaar goods | 36 / 0x24 |
| BP 58 | Augments | 8 / 0x08 |
| BP 59 | Story point additions, extended | 44 / 0x2C |
| BP 60 | Story point additions, basic | 208 / 0xD0 |
| BP 68 | Location movement behaviour | 8 / 0x08 |
| BP 69 | Movies | 8 / 0x08 |
| ARD 2 | Classes | 84 / 0x54 |
| ARD 4 | Units | 88 / 0x58 |
| ARD 7 | Default stats | 56 / 0x38 |
| ARD 8 | Additive stats | 56 / 0x38 |

Source: the header-setup call in each `W:Formats/Battlepack/<Table>.cs` and
`W:Formats/Ard/{Classes,Units,Stats}.cs`.

### Tables with special structure inside the st2e frame

* **BP 3 MP regeneration** - the first 20 records use one layout (u16 required
  damage, u8 MP, u8 MP for summons, 4 unused bytes) and the remaining records a
  second layout (u32 steps, u32 MP limit); `entryCount` covers both groups. The
  last "by foot" record must have an MP limit of at least 999
  (W:Formats/Battlepack/MpRegeneration.cs:21-39, :50-73). The 20 first records are the
  augment-driven tiers (Martyr, Inquisitor, Warmage per the reference's labels).
* **BP 9 level growth** - record *k* belongs to level *k + 1*
  (W:Formats/Battlepack/PartyMemberLevelGrowth.cs:27-35).
* **BP 13 equipment and attributes** - after the 52-byte equipment records
  comes an attribute list of 24-byte records, running to the end of the
  section. Header +0x18 holds its offset, which equals
  `0x20 + entryCount * 0x34` (no padding in between). Equipment records point
  at their attribute by **byte offset into that list** (attribute index x 24);
  the toolkit locates that pointer at equipment +0x28. Attribute count =
  floor((sectionLength - attributeListOffset) / 24)
  (W:Formats/Battlepack/EquipmentAndAttributes.cs:24-25, :133-134, :242, :251;
  R:267).

## Text and strings

* st2e records carry **text ids**, not strings. Names and descriptions live in
  FFXII text tables (battlepack section 2, battlepack section 61 sub-sections,
  EBP sections 2/3, standalone text `.bin`/`.dat` files listed in
  W:Resources/OtherFile.cs:20-56). Renames are done in those tables (D#936).
* The text table format is handled by an external tool (`ff12-text`) with a tag
  map and a language switch derived from the folder name: `in` -> Japanese,
  `kr` -> Korean, `cn` -> Simplified Chinese, `ch` -> Traditional Chinese,
  otherwise English (W:Helpers/PackHelper.cs:478-514, :593-603).
* Where raw strings are embedded in binary data (EBP camera labels, MRP texture
  names, script actor names) they are Shift-JIS / code page 932
  (W:Helpers/BinaryHelper.cs:35-43, W:Program.cs:17, R:677).

## Pointers to fix when sizes change

* Adding/removing records: update `entryCount`; `entryListOffset` stays 0x20
  (becomes 0 only if the table becomes empty); re-pad the section to 16; then
  update the host container's offsets (battlepack or ARD).
* BP 13: recompute header +0x18 = `0x20 + entryCount * 52`; attribute byte
  offsets inside equipment records change only if attributes are inserted or
  removed before them.
* Changing `entrySize` is not supported by the game; it is fixed per table.

## Round-trip rules

* Preserve bytes 0x0A-0x0B and 0x10-0x1F as found (they are 0 in rebuilt files
  except +0x18 of BP 13; vanilla values are not independently verified).
* Records are contiguous from 0x20; trailing padding to 16 is zero.
* Keep unknown/unused bytes inside records as read (several readers skip bytes
  that the writer then emits as zero; an editor must instead copy them).

## Known unknowns

* Purpose of header words 0x10 and 0x1C, and whether any vanilla table has a
  non-zero `textSectionOffset`.
* Whether vanilla sections end exactly on the 16-byte padding (no extra data).
* Record layouts per table are documented in the per-section specs, not here.
