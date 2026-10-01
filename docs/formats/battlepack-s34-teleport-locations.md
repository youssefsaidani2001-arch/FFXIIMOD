# Battlepack section 34 — Teleport Locations

Spec id: `battlepack-s34-teleport-locations` · machine spec: [`battlepack-s34-teleport-locations.json`](./battlepack-s34-teleport-locations.json)

Battlepack **section 34** lists the teleport destinations (Rabanastre, Nalbina Fortress, Barheim Passage, …;
Lists: BpTeleportLocationList) as key-item style rows: sort order, icon, name and help text (TK L829).

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

Section 34 specifics: `entrySize` = 10 (0xA) (IW Formats/Battlepack/TeleportLocations.cs:17).
The Workshop maps the unpacked file `section_034.bin` to this table (IW Resources/JsonFile.cs:48).
With 32 rows (TK L829) the section is 32 + 32*10 = 352 bytes (already a multiple of 16).
Sections 33 (maps), 34 (teleport locations) and 35 (key items) share this exact 10-byte row layout
(IW Maps.cs, TeleportLocations.cs, KeyItems.cs; LL section33-35.md) and together form one 512-id "key item" family:
content ids 0x8000-0x803F are maps, 0x8040-0x805F teleport locations and 0x8060-0x81FF key items
(Lists: ContKeyItemList), with names at 24576/24640/24672 + row and help texts at 20000/20064/20096 + row
(Lists: DescKeyItemList, MenuKeyItemList).

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…`/`unused…` are not interpreted by any source; keep their original bytes.

### Record `header` — 32 bytes (0x20), count: 1

*Where:* Offset 0 of battlepack section 34.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `magic` | ASCII 'st2e' (73 74 32 65); reject the section if different. |  | IW Formats/St2e.cs:9,20 |
| 0x04 | 4 | u32 | `entryCount` | Number of rows (32 in the vanilla game, TK L829). |  | IW Formats/St2e.cs:25 |
| 0x08 | 2 | u16 | `entrySize` | Bytes per entry; 10 (0xA) for this section. |  | IW Formats/St2e.cs:26 |
| 0x0A | 2 | bytes | `unknown0A` | Not interpreted; keep. |  | IW Formats/St2e.cs:27 |
| 0x0C | 4 | u32 | `entryListOffset` | Offset of entry 0 from the section start: 32 when entryCount > 0, else 0. |  | IW Formats/St2e.cs:12,28,39 |
| 0x10 | 4 | u32 | `offset10` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:29,40 |
| 0x14 | 4 | u32 | `textSectionOffset` | Inline text offset; 0 on disk for this section (filled at run time). No strings are stored here. |  | IW Formats/St2e.cs:30,41; TK L262, L978 |
| 0x18 | 4 | u32 | `offset18` | Unknown offset slot (0 in Workshop output for this section). |  | IW Formats/St2e.cs:31,42 |
| 0x1C | 4 | u32 | `offset1C` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:32,43 |

### Record `teleportLocation` — 10 bytes (0xA), count: header.entryCount (vanilla 32)

*Where:* st2e entries of section 34: header.entryListOffset + i*10; row i = content id 0x8040 + i (row labels: list BpTeleportLocationList)

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | bytes | `unknown00` | Not read; kept as zero by the Workshop (loot keeps its gil value at this spot). |  | IW TeleportLocations.cs:30,47 |
| 0x02 | 2 | u16 | `sort` | Sort position in the key-item menu. |  | IW TeleportLocations.cs:31,48; LL section34.md |
| 0x04 | 1 | u8 | `icon` | Menu icon. | `BpeIconList` | IW TeleportLocations.cs:32,49; LL section34.md |
| 0x05 | 1 | bytes | `unknown05` | Not read; kept as zero by the Workshop. |  | IW TeleportLocations.cs:33,50 |
| 0x06 | 2 | u16 | `description` | Help text id; vanilla rows use 20064 + row. | `MenuKeyItemList` | IW TeleportLocations.cs:34,51; LL section34.md; Lists: MenuKeyItemList |
| 0x08 | 2 | u16 | `name` | Name text id; vanilla rows use 24640 + row. | `DescKeyItemList` | IW TeleportLocations.cs:35,52; LL section34.md; Lists: DescKeyItemList |

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `BpeIconList` | menu icon ids (256) |
| `MenuKeyItemList` | key-item family help text ids 20000-20511: maps 20000+row, teleport locations 20064+row, key items 20096+row |
| `DescKeyItemList` | key-item family name text ids 24576-25087: maps 24576+row, teleport locations 24640+row, key items 24672+row |

## Count and size rules

- 32 rows in vanilla (TK L829). Rows are addressed as content ids 0x8040 + row, so never reorder.
  The three family sizes (64 + 32 + 416 = 512) fill the 0x8000 content block exactly; growing one table would collide
  with the next family's ids.

### Content ids

Fields typed as *content* hold a game-wide **content id** = `category << 12 | index` (TK L575, L1567): items 0x0000,
equipment 0x1000, loot 0x2000, magicks 0x3000, technicks 0x4000, gambit sets 0x5000 (TK L918), gambits 0x6000,
key-item family 0x8000 (maps 0x8000+, teleport locations 0x8040+, key items 0x8060+), packages 0x9000, rewards 0xA000,
prices 0xB000, mist 0xC000, bazaar goods 0xD000, gil 0xF000 | amount (Lists: ContAllList and the Cont* lists).
`65535` (0xFFFF) is *none* in the Toolkit's lists.

### Text

These tables hold no strings. Every name/description field is a **u16 text id** in the game-wide battle text
id space, which is split into blocks per family (TK L1520-L1563): e.g. action names 0+, equipment names
2048+, battle-menu labels 8192+, status names 10240+, gambit names 12288+, character names 16384+, bazaar
names 18432+; long help texts use ids 3000+, 4000+ (battle actions), 10000+ (inventory actions), 12000+ (status),
16000+ (gambit targets), 22000+ (bazaar). `65535` means *none*. The strings live in the text files of the nested
pack in battlepack **section 61** (15 sub-sections, IW Resources/PackFile.cs:21, IW Resources/OtherFile.cs:23,
msg 1005) and in section 2. Renaming something is a text edit there, not an edit here.

## Pointers

None.

## Round-trip rules

- Edit fields in place; the record size is fixed and nothing in this section points at entries, so value edits never move data.
- Copy every byte that no field interprets (unknown*/padding, unnamed bits) from the original; the Workshop writer zero-fills them (it seeks over them), so do not use its output as the byte-identical reference.
- Keep the st2e header bytes verbatim except entryCount (and entryListOffset when the count goes to/from 0).
- Keep the trailing zero padding that rounds the section to a multiple of 16 bytes.
- If the section length changes (added/removed entries), rewrite the battlepack offset table: every later section offset and the end offset shift by the padded size delta.

## Known unknowns

- Bytes 0-1 and 5 are never read (bytes 0-1 may be an unused gil value, as in loot).
- Name/help id offsets per family are inferred from the Toolkit lists, not checked on a dump.

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; license forbids copying or converting its code). Paths are relative to that repo, e.g. `Formats/Battlepack/Actions.cs`, `Formats/St2e.cs`, `Helpers/PackHelper.cs`, `Helpers/EnumHelper.cs`, `Resources/JsonFile.cs`, `Resources/PackFile.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| LL `sectionNN.md` | FF12 Lua Loader documentation, `capabilities/bpack-sections/sectionNN.md` (field names of the loader's read-only `game.bpack` view). |
| Lists | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json` (list name given). |
| Graveyard `<file>:<line>` | The Insurgent's Graveyard by Xeavin, `/home/user/xeavin/the-insurgents-graveyard/` (fact reference only). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
