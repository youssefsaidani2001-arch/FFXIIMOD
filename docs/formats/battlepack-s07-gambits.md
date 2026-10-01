# Battlepack section 7 — Gambits (targets)

Spec id: `battlepack-s07-gambits` · machine spec: [`battlepack-s07-gambits.json`](./battlepack-s07-gambits.json)

Battlepack **section 7** is the gambit *target* catalogue: every entry of the Gambits menu ("Foe: nearest",
"Ally: HP < 50%" …) with its price, menu placement and up to three chained condition cases that the battle AI
evaluates. Loadouts (which gambits a character starts with) are a different table, section 8 (TK L810, msg 55).
The Workshop maps `section_007.bin` here (IW Resources/JsonFile.cs:29).

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

Section 7 specifics: `entrySize` = 32 (IW Gambits.cs:17).

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…`/`unused…` are not interpreted by any source; keep their original bytes.

### Record `header` — 32 bytes (0x20), count: 1

*Where:* Offset 0 of battlepack section 7.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `magic` | ASCII 'st2e' (73 74 32 65); reject the section if different. |  | IW Formats/St2e.cs:9,20 |
| 0x04 | 4 | u32 | `entryCount` | Number of gambit targets (256 in the vanilla game, TK L809). |  | IW Formats/St2e.cs:25 |
| 0x08 | 2 | u16 | `entrySize` | Bytes per entry; 32 (0x20) for this section. |  | IW Formats/St2e.cs:26 |
| 0x0A | 2 | bytes | `unknown0A` | Not interpreted; keep. |  | IW Formats/St2e.cs:27 |
| 0x0C | 4 | u32 | `entryListOffset` | Offset of entry 0 from the section start: 32 when entryCount > 0, else 0. |  | IW Formats/St2e.cs:28,39 |
| 0x10 | 4 | u32 | `offset10` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:29 |
| 0x14 | 4 | u32 | `textSectionOffset` | Inline text offset; 0 on disk for this section (filled at run time). No strings are stored here. |  | IW Formats/St2e.cs:30; TK L262, L978 |
| 0x18 | 4 | u32 | `offset18` | Unknown offset slot (0 in Workshop output for this section). |  | IW Formats/St2e.cs:31 |
| 0x1C | 4 | u32 | `offset1C` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:32 |

### Record `gambit` — 32 bytes (0x20), count: header.entryCount (vanilla 256)

*Where:* st2e entries of section 7: header.entryListOffset + i*32

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 3 | bytes | `unknown00` | Not interpreted (Workshop skips and writes zeros). |  | IW Gambits.cs:30,60 |
| 0x03 | 1 | u8 | `icon` | Menu icon; marked "ineffectual" by the Workshop (no visible effect). | `BpeIconList` | IW Gambits.cs:31; LL section07.md |
| 0x04 | 2 | u16 | `description` | Help text id (gambit-target help block, 16000+). | `MenuGambitTargetList` | IW Gambits.cs:32 |
| 0x06 | 2 | u16 | `gilCost` | Shop price of the gambit. |  | IW Gambits.cs:33; LL section07.md (gil) |
| 0x08 | 2 | u16 | `case1TargetCondition` | Target condition of case 1 (battle-logic condition id). | `BattleLogicTargetConditionList` | IW Gambits.cs:34 |
| 0x0A | 2 | u16 | `case2TargetCondition` | Target condition of case 2. | `BattleLogicTargetConditionList` | IW Gambits.cs:35 |
| 0x0C | 2 | u16 | `case3TargetCondition` | Target condition of case 3. | `BattleLogicTargetConditionList` | IW Gambits.cs:36 |
| 0x0E | 2 | bf16 | `flags` | Gambit behaviour flags. The Workshop keeps the raw u16; bit names come from the Lua Loader docs. | bits below | IW Gambits.cs:37; LL section07.md |
| 0x10 | 1 | u8 | `case1TargetType` | Who case 1 scans (foe, ally, self …). | `GambitTargetType` | IW Gambits.cs:38 |
| 0x11 | 1 | u8 | `case2TargetType` | Target type of case 2. | `GambitTargetType` | IW Gambits.cs:39 |
| 0x12 | 1 | u8 | `case3TargetType` | Target type of case 3. | `GambitTargetType` | IW Gambits.cs:40 |
| 0x13 | 1 | u8 | `unknown13` | Not interpreted. |  | IW Gambits.cs:41 |
| 0x14 | 2 | u16 | `name` | Name text id (gambit block, 12288+). | `DescGambitList` | IW Gambits.cs:42 |
| 0x16 | 1 | u8 | `gambitPage` | Gambit-menu page the entry is listed on. |  | IW Gambits.cs:43 |
| 0x17 | 1 | u8 | `gambitPageOrder` | Position on that page. |  | IW Gambits.cs:44 |
| 0x18 | 2 | u16 | `case1Parameter` | Parameter of case 1 (meaning depends on the condition: HP %, status, element …). |  | IW Gambits.cs:45 |
| 0x1A | 2 | u16 | `case2Parameter` | Parameter of case 2. |  | IW Gambits.cs:46 |
| 0x1C | 2 | u16 | `case3Parameter` | Parameter of case 3. |  | IW Gambits.cs:47 |
| 0x1E | 2 | bytes | `unused1E` | Padding; the Workshop writes two zero bytes explicitly. |  | IW Gambits.cs:48,78 |

#### Bits of `gambit.flags` (bf16 at 0x0E; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 0 | 0x0001 | `unknownBit0` |  |
| 1 | 0x0002 | `unknownBit1` |  |
| 2 | 0x0004 | `noRoaming` |  |
| 3-5 | 0x0038 | `caseLinkType` | how the three cases combine; enum `BattleLogicCaseLinkTypeList` |
| 6 | 0x0040 | `unknownBit6` |  |
| 7 | 0x0080 | `noInterruptToLowerPriority` |  |
| 8 | 0x0100 | `alwaysRunning` |  |
| 9 | 0x0200 | `noRunning` |  |
| 10 | 0x0400 | `noTargetWith3PlusAttackers` |  |
| 11 | 0x0800 | `noConsecutiveUse` |  |
| 12 | 0x1000 | `noRetargeting` |  |
| 13 | 0x2000 | `noTimeout` |  |
| 14 | 0x4000 | `noInterruptByHigherPriority` |  |
| 15 | 0x8000 | `noInterruptByAny` |  |

## Enums carried in the JSON spec

Flag enums list the mask value of each bit. Fields that point at bigger lists (text ids, content ids, animations, formulas …) name a list from `editor/data/lists.json` instead (see *External lists*).

#### `GambitTargetType` (Lists: BattleLogicTargetTypeList, values 0-10 (the u8 field cannot hold the list's 4096+ variable entries))

| Value | Label |
|---|---|
| 0 (0x0) | None |
| 1 (0x1) | Foe |
| 2 (0x2) | Ally |
| 3 (0x3) | Leader |
| 4 (0x4) | Self |
| 5 (0x5) | Same Group |
| 6 (0x6) | Ally (excl. Self) |
| 7 (0x7) | Same Group (excl. Self) |
| 8 (0x8) | Different Group |
| 9 (0x9) | Current |
| 10 (0xA) | Auto |

#### `BattleLogicCaseLinkTypeList` (Lists: BattleLogicCaseLinkTypeList)

| Value | Label |
|---|---|
| 0 (0x0) | No Case Links |
| 3 (0x3) | Link Cases 2 & 3 |
| 6 (0x6) | Link Cases 1 & 2 |
| 7 (0x7) | Link All 3 Cases |

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `BpeIconList` | menu icons (u8, 255 = none) |
| `MenuGambitTargetList` | gambit help text ids 16000+ |
| `DescGambitList` | gambit name text ids 12288+ |
| `BattleLogicTargetConditionList` | battle-logic condition ids (2,038 entries; 0 = unconditional) |
| `BpGambitList` | row labels: section 7 row index -> gambit name |

## Count and size rules

- `entryCount` rows of 32 bytes; vanilla has 256 (TK L809, list `BpGambitList`).
- Rows are referenced by index from elsewhere (section 8 gambit sets, the content-id block 0x6000 for gambit items
  in shops/inventories, TK L1586), so do not reorder or delete rows; appending is structurally possible but no
  source confirms the engine accepts more than 256.
- The Toolkit notes that editing this section live makes the game re-push battle logic to all 40 party members
  (TK L1737); on disk no such step exists.

### Text

These tables hold no strings. Every name/description field is a **u16 text id** in the game-wide battle text
id space, which is split into blocks per family (TK L1520-L1563): e.g. action names 0+, equipment names
2048+, battle-menu labels 8192+, status names 10240+, gambit names 12288+, character names 16384+, bazaar
names 18432+; long help texts use ids 3000+, 4000+ (battle actions), 10000+ (inventory actions), 12000+ (status),
16000+ (gambit targets), 22000+ (bazaar). `65535` means *none*. The strings live in the text files of the nested
pack in battlepack **section 61** (15 sub-sections, IW Resources/PackFile.cs:21, IW Resources/OtherFile.cs:23,
msg 1005) and in section 2. Renaming something is a text edit there, not an edit here.

## Pointers

None inside the section. `name`/`description` are text ids; `case*TargetCondition` are battle-logic ids.

## Round-trip rules

- Edit fields in place; the record size is fixed and nothing in this section points at entries, so value edits never move data.
- Copy every byte that no field interprets (unknown*/unused*/padding, unnamed bits) from the original; the Workshop writer zero-fills them (it seeks over them), so do not use its output as the byte-identical reference.
- Keep the st2e header bytes verbatim except entryCount (and entryListOffset when the count goes to/from 0).
- Keep the trailing zero padding that rounds the section to a multiple of 16 bytes.
- If the section length changes (added/removed entries), rewrite the battlepack offset table: every later section offset and the end offset shift by the padded size delta.
- Do not reorder rows: section 8 and gambit content ids (0x6000|row) refer to them by index.

## Known unknowns

- Flag bits 0, 1 and 6 are unnamed in every source.
- Byte 0x13 and bytes 0x00-0x02 are never interpreted; byte 0x03 (icon) is labelled ineffectual by the Workshop.
- Per-condition meaning of case*Parameter is not tabulated by any source we have.
- Whether the engine tolerates more than 256 rows is unknown.

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; license forbids copying or converting its code). Paths are relative to that repo, e.g. `Formats/Battlepack/Actions.cs`, `Formats/St2e.cs`, `Helpers/PackHelper.cs`, `Helpers/EnumHelper.cs`, `Resources/JsonFile.cs`, `Resources/PackFile.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| LL `sectionNN.md` | FF12 Lua Loader documentation, `capabilities/bpack-sections/sectionNN.md` (field names of the loader's read-only `game.bpack` view). |
| Lists | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json` (list name given). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
