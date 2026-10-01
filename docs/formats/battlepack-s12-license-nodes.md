# Battlepack section 12 — License Nodes

Spec id: `battlepack-s12-license-nodes` · machine spec: [`battlepack-s12-license-nodes.json`](./battlepack-s12-license-nodes.json)

Battlepack **section 12** defines every license that can appear on a license board: its name and help text, LP cost,
type (which also decides the icon colour), a restriction rule, which of the seven original party members own it from the
start, and up to eight things it grants. The *placement* of licenses on the boards is not here; it lives in the
license board grids (section 70 and the `board_N.bin` files, see `battlepack-s70-license-board`). The Toolkit's recipe
for restructuring a board edits this section plus the board layout (TK L1726-1732).

## Container

### The battlepack container (`battle_pack.bin`)

Full container spec: [`container-battlepack.md`](./container-battlepack.md) (st2e details:
[`container-st2e.md`](./container-st2e.md) where present). Summary of what matters for this section:

- **Archive path:** `ps2data/image/ff12/test_battle/<lang>/binaryfile/battle_pack.bin` inside the game's VBF
  (msg 402 gives the `us` folder; the Workshop also recognises `in`, `kr`, `cn`, `ch` language folders,
  IW Helpers/PackHelper.cs:593-602). Each language folder carries its own copy.
- **Header:** `u32 sectionCount` at 0x00 (71 for `battle_pack.bin`, IW Resources/PackFile.cs:20), followed by
  `sectionCount + 1` `u32` offsets measured from the start of the file. The extra last offset is the end of the
  last section's data **before** the final padding (IW Helpers/PackHelper.cs:41-46, 87).
- **Sections:** section *i* occupies `[offset[i], offset[i+1])`. Every section starts on a 16-byte boundary;
  the gap is zero-filled, so a section's span includes its own trailing pad (IW Helpers/PackHelper.cs:51, 77).
  An empty section has `offset[i] == offset[i+1]`. The file ends with zero padding to a multiple of 16
  (IW Helpers/PackHelper.cs:88).
- **Resizing:** if a section's padded length changes, every later offset and the end offset move by the same
  delta; nothing else in the pack points across sections (the Workshop rebuilds the table from scratch,
  IW Helpers/PackHelper.cs:64-96).
- **Unpacked naming:** the Workshop writes section *i* as `battle_pack.bin.dir/section_<iii>.bin`
  (IW Helpers/PackHelper.cs:58); this spec's `files` glob includes that name for single-section editing.
- **In memory:** the game rewrites in-file offsets to absolute pointers after loading; the Toolkit's export
  converts them back before saving (TK L964-L976, L1794). Files on disk always hold offsets relative to the start of
  the section.


### The `st2e` section header (32 bytes)

| Offset | Size | Type | Name | Meaning | Source |
|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `magic` | ASCII `st2e` (`73 74 32 65`). | IW Formats/St2e.cs:9,20 |
| 0x04 | 4 | u32 | `entryCount` | Number of fixed-size entries. | IW Formats/St2e.cs:25 |
| 0x08 | 2 | u16 | `entrySize` | Bytes per entry. | IW Formats/St2e.cs:26 |
| 0x0A | 2 | bytes | `unknown0A` | Skipped by every reader; the Workshop writes zero. | IW Formats/St2e.cs:27,51 |
| 0x0C | 4 | u32 | `entryListOffset` | Offset of entry 0 from the section start; 0x20 when there is at least one entry, 0 when the table is empty. | IW Formats/St2e.cs:12,28,39 |
| 0x10 | 4 | u32 | `offset10` | Unknown offset slot; 0 in Workshop output. | IW Formats/St2e.cs:29,40 |
| 0x14 | 4 | u32 | `textSectionOffset` | Offset of an inline text block. Always 0 in the Workshop's output for the gameplay tables, and the Toolkit clears it when exporting a live section, i.e. the game fills it at run time; text itself is **not** stored in these sections. | IW Formats/St2e.cs:30,41; TK L251-L267, L978 |
| 0x18 | 4 | u32 | `offset18` | Unknown offset slot, except in section 13 where it is the attribute-table offset. | IW Formats/St2e.cs:31; TK L267 |
| 0x1C | 4 | u32 | `offset1C` | Unknown offset slot; 0 in Workshop output. | IW Formats/St2e.cs:32,43 |

Entries are packed back to back from `entryListOffset` (no per-entry alignment). After the last entry
(or the last extra table) the section is zero-padded to a multiple of 16 bytes (IW Helpers/BinaryHelper.cs:12-33).

Section 12 specifics: `entrySize` = 24 (0x18) (IW Formats/Battlepack/LicenseNodes.cs:29).
The Workshop maps the unpacked file `section_012.bin` to this table (IW Resources/JsonFile.cs:34).
With 368 rows (TK L1603) the section is 32 + 368*24 = 8864 bytes (already a multiple of 16).
Row layout: `description` u16, `name` u16, `lpCost` u8, `type` u8, `restriction` u8, default-owner bits u8, then
eight u16 content slots (IW LicenseNodes.cs:41-54). The Workshop requires exactly 8 content slots per row and at most
368 rows (IW LicenseNodes.cs:18-26).

**Conflicting description.** The Lua Loader docs put `name` at 0x00 and `description` at 0x02 (LL section12.md).
The Workshop reads description first (IW LicenseNodes.cs:43-44), matching every other description/name pair in the
battlepack (sections 5, 11, 17). On vanilla data the field holding values 6144-6505 is the name and the one holding
17000-17034 the description; an editor can check that and swap labels if needed.

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…`/`unused…` are not interpreted by any source; keep their original bytes.

### Record `header` — 32 bytes (0x20), count: 1

*Where:* Offset 0 of battlepack section 12.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `magic` | ASCII 'st2e' (73 74 32 65); reject the section if different. |  | IW Formats/St2e.cs:9,20 |
| 0x04 | 4 | u32 | `entryCount` | Number of license nodes (at most 368; vanilla 368). |  | IW Formats/St2e.cs:25 |
| 0x08 | 2 | u16 | `entrySize` | Bytes per entry; 24 (0x18) for this section. |  | IW Formats/St2e.cs:26 |
| 0x0A | 2 | bytes | `unknown0A` | Not interpreted; keep. |  | IW Formats/St2e.cs:27 |
| 0x0C | 4 | u32 | `entryListOffset` | Offset of entry 0 from the section start: 32 when entryCount > 0, else 0. |  | IW Formats/St2e.cs:12,28,39 |
| 0x10 | 4 | u32 | `offset10` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:29,40 |
| 0x14 | 4 | u32 | `textSectionOffset` | Inline text offset; 0 on disk for this section (filled at run time). No strings are stored here. |  | IW Formats/St2e.cs:30,41; TK L262, L978 |
| 0x18 | 4 | u32 | `offset18` | Unknown offset slot (0 in Workshop output for this section). |  | IW Formats/St2e.cs:31,42 |
| 0x1C | 4 | u32 | `offset1C` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:32,43 |

### Record `licenseNode` — 24 bytes (0x18), count: header.entryCount (vanilla 368, max 368)

*Where:* st2e entries of section 12: header.entryListOffset + i*24; row i = license node id i (row labels: list BpLicenseList); license board cells store these ids

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `description` | Help text id (license help block 17000+). The Lua Loader docs swap name and description (name at 0x00); see gaps. | `MenuLicenseList` | IW LicenseNodes.cs:43,66; Lists: MenuLicenseList |
| 0x02 | 2 | u16 | `name` | Name text id (license name block 6144-6505). | `DescLicenseList` | IW LicenseNodes.cs:44,67; Lists: DescLicenseList |
| 0x04 | 1 | u8 | `lpCost` | License points needed to obtain the node. |  | IW LicenseNodes.cs:45,68; LL section12.md; TK L814 |
| 0x05 | 1 | u8 | `type` | Node type, which also sets the icon colour on the board (Workshop: "Type And Icon Color"). | `BpeLicenseNodeTypeList` | IW LicenseNodes.cs:46,69,92; LL section12.md; TK L814 |
| 0x06 | 1 | u8 | `restriction` | Special rule (unique, quickening, summon, inaccessible). | `BpeLicenseNodeRestrictionList` | IW LicenseNodes.cs:47,70; LL section12.md; TK L814 |
| 0x07 | 1 | bf8 | `unlockedByDefaultFor` | Characters that own this license from the start (one bit per original party member). | bits below | IW LicenseNodes.cs:48,71,110-121; LL section12.md; TK L814 |
| 0x08 | 2 | u16 | `content1` | Granted content slot 1; meaning depends on type (equipment, action, augment …). |  | IW LicenseNodes.cs:51-54,73-76; LL section12.md; TK L1728 |
| 0x0A | 2 | u16 | `content2` | Granted content slot 2; meaning depends on type (equipment, action, augment …). |  | IW LicenseNodes.cs:51-54,73-76; LL section12.md; TK L1728 |
| 0x0C | 2 | u16 | `content3` | Granted content slot 3; meaning depends on type (equipment, action, augment …). |  | IW LicenseNodes.cs:51-54,73-76; LL section12.md; TK L1728 |
| 0x0E | 2 | u16 | `content4` | Granted content slot 4; meaning depends on type (equipment, action, augment …). |  | IW LicenseNodes.cs:51-54,73-76; LL section12.md; TK L1728 |
| 0x10 | 2 | u16 | `content5` | Granted content slot 5; meaning depends on type (equipment, action, augment …). |  | IW LicenseNodes.cs:51-54,73-76; LL section12.md; TK L1728 |
| 0x12 | 2 | u16 | `content6` | Granted content slot 6; meaning depends on type (equipment, action, augment …). |  | IW LicenseNodes.cs:51-54,73-76; LL section12.md; TK L1728 |
| 0x14 | 2 | u16 | `content7` | Granted content slot 7; meaning depends on type (equipment, action, augment …). |  | IW LicenseNodes.cs:51-54,73-76; LL section12.md; TK L1728 |
| 0x16 | 2 | u16 | `content8` | Granted content slot 8; meaning depends on type (equipment, action, augment …). |  | IW LicenseNodes.cs:51-54,73-76; LL section12.md; TK L1728 |

#### Bits of `licenseNode.unlockedByDefaultFor` (bf8 at 0x07; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 0 | 0x01 | `vaan` |  |
| 1 | 0x02 | `ashe` |  |
| 2 | 0x04 | `fran` |  |
| 3 | 0x08 | `balthier` |  |
| 4 | 0x10 | `basch` |  |
| 5 | 0x20 | `penelo` |  |
| 6 | 0x40 | `reks` |  |
| 7 | 0x80 | `unknownBit7` | not named by any source |

## Enums carried in the JSON spec

Flag enums list the mask value of each bit. Fields that point at bigger lists (text ids, content ids, animations, formulas …) name a list from `editor/data/lists.json` instead (see *External lists*).

#### `BpeLicenseNodeTypeList` (Lists: BpeLicenseNodeTypeList; TK L814)

| Value | Label |
|---|---|
| 1 (0x1) | Sword / Bow / Spear / Axe / Hammer / Katana / Greatsword (Blue) |
| 2 (0x2) | Rod / Staff / Mace / Measure (Pink) |
| 3 (0x3) | Dagger / Gun / Pole / Crossbow / Hand-bomb / Ninja Sword (Purple) |
| 4 (0x4) | Heavy Armor (Pale Blue) |
| 5 (0x5) | Mystic Armor (Pale Blue) |
| 6 (0x6) | Light Armor (Pale Blue) |
| 7 (0x7) | Shield (Pale Blue) |
| 8 (0x8) | Accessory (Rust) |
| 9 (0x9) | White Magick (Pale Pink) |
| 10 (0xA) | Black Magick (Pale Pink) |
| 11 (0xB) | Time Magick (Pale Pink) |
| 12 (0xC) | Green Magick (Pale Pink) |
| 13 (0xD) | Arcane Magick (Pale Pink) |
| 14 (0xE) | Technick (Orange) |
| 15 (0xF) | Augment 1 (Green) |
| 16 (0x10) | Augment 2 (Green) |
| 17 (0x11) | Augment 3 (Green) |
| 18 (0x12) | Essential / Gambit (Pale Olive) |
| 19 (0x13) | Quickening (Neon Orange) |
| 20 (0x14) | Summon (Neon Teal) |
| 21 (0x15) | Unused (0x15) |
| 22 (0x16) | Unused (0x16) |
| 23 (0x17) | Unused (0x17) |
| 24 (0x18) | Unused (0x18) |
| 25 (0x19) | Unused (0x19) |
| 26 (0x1A) | Unused (0x1A) |
| 27 (0x1B) | Unused (0x1B) |
| 28 (0x1C) | Unused (0x1C) |
| 29 (0x1D) | Unused (0x1D) |
| 30 (0x1E) | Second Board |

#### `BpeLicenseNodeRestrictionList` (Lists: BpeLicenseNodeRestrictionList; TK L814)

| Value | Label |
|---|---|
| 0 (0x0) | None |
| 1 (0x1) | Unique |
| 2 (0x2) | Quickening |
| 3 (0x3) | Summon |
| 4 (0x4) | Inaccessible |

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `MenuLicenseList` | license help text ids 17000-17034 |
| `DescLicenseList` | license name text ids 6144-6505 |
| `BpLicenseList` | section 12 license node rows 0-367 (0 = Quickening 1, 31 = Essentials, 360 = Second Board, 361-367 reserve) |

## Count and size rules

- At most 368 rows (IW LicenseNodes.cs:18-21); the Toolkit names 368 ids, 361-367 being reserve
  (Lists: BpLicenseList; TK L1603). Row 31 is "Essentials", the node the Toolkit's job reset never refunds (TK L541).
- Rows are referenced by index from the license board grids and from save data (per-character obtained-license bits),
  so never reorder or delete; repurpose a reserve row instead.
- `type` uses values 1-30 (Lists: BpeLicenseNodeTypeList); `restriction` 0-4 (Lists: BpeLicenseNodeRestrictionList).
- Content slots: their id space depends on `type` (equipment ids for weapon/armour nodes, action ids for magick or
  technick nodes, augment ids for augment nodes, …); unused slots presumably hold 0xFFFF. Several gambit-slot licenses
  can be merged into one node by filling more content slots (msg 29-41).
- A magick's category and icon colour are not decided here (msg 719-721, 877).

### Text

These tables hold no strings. Every name/description field is a **u16 text id** in the game-wide battle text
id space, which is split into blocks per family (TK L1520-L1563): e.g. action names 0+, equipment names
2048+, battle-menu labels 8192+, status names 10240+, gambit names 12288+, character names 16384+, bazaar
names 18432+; long help texts use ids 3000+, 4000+ (battle actions), 10000+ (inventory actions), 12000+ (status),
16000+ (gambit targets), 22000+ (bazaar). `65535` means *none*. The strings live in the text files of the nested
pack in battlepack **section 61** (15 sub-sections, IW Resources/PackFile.cs:21, IW Resources/OtherFile.cs:23,
msg 1005) and in section 2. Renaming something is a text edit there, not an edit here.

License names are in the 6144-6505 block (Lists: DescLicenseList) and help texts in 17000-17034
(Lists: MenuLicenseList, TK L1561). Renaming a license is a text-tool edit (msg 839).

## Pointers

None in the file. Incoming: license board cells (section 70, `board_1.bin` … `board_12.bin`) hold row ids.
The game keeps a cached pointer to this section (TK L278) and the Toolkit hot-reloads the boards after a section 12
change (TK L1731).

## Round-trip rules

- Edit fields in place; the record size is fixed and nothing in this section points at entries, so value edits never move data.
- Copy every byte that no field interprets (unknown*/padding, unnamed bits) from the original; the Workshop writer zero-fills them (it seeks over them), so do not use its output as the byte-identical reference.
- Keep the st2e header bytes verbatim except entryCount (and entryListOffset when the count goes to/from 0).
- Keep the trailing zero padding that rounds the section to a multiple of 16 bytes.
- If the section length changes (added/removed entries), rewrite the battlepack offset table: every later section offset and the end offset shift by the padded size delta.
- Keep exactly eight content slots per row and at most 368 rows.
- unlockedByDefaultFor: change only bits 0-6; preserve bit 7.
- Do not reorder rows: board cells and save data use the row id.

## Known unknowns

- Name/description order conflicts between the Workshop (description first, used here) and the Lua Loader docs (name first).
- Exact id space of content slots per node type, and the empty-slot sentinel (assumed 0xFFFF).
- Bit 7 of unlockedByDefaultFor is not named.
- Why the limit is 368 (presumably a fixed-size per-character license bitfield in the game).

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; license forbids copying or converting its code). Paths are relative to that repo, e.g. `Formats/Battlepack/Actions.cs`, `Formats/St2e.cs`, `Helpers/PackHelper.cs`, `Helpers/EnumHelper.cs`, `Resources/JsonFile.cs`, `Resources/PackFile.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| LL `sectionNN.md` | FF12 Lua Loader documentation, `capabilities/bpack-sections/sectionNN.md` (field names of the loader's read-only `game.bpack` view). |
| Lists | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json` (list name given). |
| Graveyard `<file>:<line>` | The Insurgent's Graveyard by Xeavin, `/home/user/xeavin/the-insurgents-graveyard/` (fact reference only). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
