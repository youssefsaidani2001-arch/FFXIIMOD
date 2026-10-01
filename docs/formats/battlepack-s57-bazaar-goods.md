# Battlepack section 57 — Bazaar Goods

Spec id: `battlepack-s57-bazaar-goods` · machine spec: [`battlepack-s57-bazaar-goods.json`](./battlepack-s57-bazaar-goods.json)

Battlepack **section 57** is the bazaar catalogue: each good has a name and help text, up to three packaged
contents with quantities that the player receives, a gil price, a type (one-off, repeatable, monograph) and up to
three loot ingredients that must be sold to unlock it. The Workshop maps `section_057.bin` here
(IW Resources/JsonFile.cs:55).

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

Section 57 specifics: `entrySize` = 36 (0x24) (IW BazaarGoods.cs:29). Package and ingredient lists are fixed at
three slots each; the Workshop rejects any other number (IW BazaarGoods.cs:18-26). Unused slots hold content
0xFFFF / quantity 0 in practice (not verified on vanilla data).

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…`/`unused…` are not interpreted by any source; keep their original bytes.

### Record `header` — 32 bytes (0x20), count: 1

*Where:* Offset 0 of battlepack section 57.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `magic` | ASCII 'st2e' (73 74 32 65); reject the section if different. |  | IW Formats/St2e.cs:9,20 |
| 0x04 | 4 | u32 | `entryCount` | Number of bazaar goods (128 in the vanilla game, TK L836). |  | IW Formats/St2e.cs:25 |
| 0x08 | 2 | u16 | `entrySize` | Bytes per entry; 36 (0x24) for this section. |  | IW Formats/St2e.cs:26 |
| 0x0A | 2 | bytes | `unknown0A` | Not interpreted; keep. |  | IW Formats/St2e.cs:27 |
| 0x0C | 4 | u32 | `entryListOffset` | Offset of entry 0 from the section start: 32 when entryCount > 0, else 0. |  | IW Formats/St2e.cs:28,39 |
| 0x10 | 4 | u32 | `offset10` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:29 |
| 0x14 | 4 | u32 | `textSectionOffset` | Inline text offset; 0 on disk for this section (filled at run time). No strings are stored here. |  | IW Formats/St2e.cs:30; TK L262, L978 |
| 0x18 | 4 | u32 | `offset18` | Unknown offset slot (0 in Workshop output for this section). |  | IW Formats/St2e.cs:31 |
| 0x1C | 4 | u32 | `offset1C` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:32 |

### Record `bazaarGood` — 36 bytes (0x24), count: header.entryCount (vanilla 128)

*Where:* st2e entries of section 57: header.entryListOffset + i*36

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `name` | Name text id (bazaar block, 18432+). | `DescBazaarGoodList` | IW BazaarGoods.cs:42 |
| 0x02 | 2 | u16 | `description` | Help text id (bazaar help block, 22000+). | `MenuBazaarGoodList` | IW BazaarGoods.cs:43 |
| 0x04 | 2 | u16 | `package1Content` | Content id received (slot 1); content ids are category<<12 \| index. | `ContAllList` | IW BazaarGoods.cs:45-52; LL section57.md |
| 0x06 | 2 | u16 | `package1Quantity` | Quantity of package slot 1. |  | IW BazaarGoods.cs:50 |
| 0x08 | 2 | u16 | `package2Content` | Content id received (slot 2); content ids are category<<12 \| index. | `ContAllList` | IW BazaarGoods.cs:45-52; LL section57.md |
| 0x0A | 2 | u16 | `package2Quantity` | Quantity of package slot 2. |  | IW BazaarGoods.cs:50 |
| 0x0C | 2 | u16 | `package3Content` | Content id received (slot 3); content ids are category<<12 \| index. | `ContAllList` | IW BazaarGoods.cs:45-52; LL section57.md |
| 0x0E | 2 | u16 | `package3Quantity` | Quantity of package slot 3. |  | IW BazaarGoods.cs:50 |
| 0x10 | 4 | u32 | `gilCost` | Gil price of the bazaar good. |  | IW BazaarGoods.cs:55 |
| 0x14 | 2 | bf16 | `flags` | Only bits 0-1 are known; the Workshop rebuilds the word from the type alone (bits 2-15 become 0). | bits below | IW BazaarGoods.cs:56-57; LL section57.md |
| 0x16 | 2 | u16 | `ingredient1Content` | Content id of required ingredient 1 (normally loot, block 0x2000). | `ContAllList` | IW BazaarGoods.cs:59-66 |
| 0x18 | 2 | u16 | `ingredient1Quantity` | Required quantity of ingredient 1. |  | IW BazaarGoods.cs:64 |
| 0x1A | 2 | u16 | `ingredient2Content` | Content id of required ingredient 2 (normally loot, block 0x2000). | `ContAllList` | IW BazaarGoods.cs:59-66 |
| 0x1C | 2 | u16 | `ingredient2Quantity` | Required quantity of ingredient 2. |  | IW BazaarGoods.cs:64 |
| 0x1E | 2 | u16 | `ingredient3Content` | Content id of required ingredient 3 (normally loot, block 0x2000). | `ContAllList` | IW BazaarGoods.cs:59-66 |
| 0x20 | 2 | u16 | `ingredient3Quantity` | Required quantity of ingredient 3. |  | IW BazaarGoods.cs:64 |
| 0x22 | 2 | u16 | `icon` | Menu icon id. | `BpeIconList` | IW BazaarGoods.cs:69 |

#### Bits of `bazaarGood.flags` (bf16 at 0x14; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 0-1 | 0x0003 | `type` | values 0-2; enum `BpeBazaarGoodTypeList` |

## Enums carried in the JSON spec

Flag enums list the mask value of each bit. Fields that point at bigger lists (text ids, content ids, animations, formulas …) name a list from `editor/data/lists.json` instead (see *External lists*).

#### `BpeBazaarGoodTypeList` (Lists: BpeBazaarGoodTypeList; IW BazaarGoods.cs:57,128)

| Value | Label |
|---|---|
| 0 (0x0) | Non-Repeatable |
| 1 (0x1) | Repeatable |
| 2 (0x2) | Monograph |

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `DescBazaarGoodList` | bazaar name text ids 18432+ |
| `MenuBazaarGoodList` | bazaar help text ids 22000+ |
| `ContAllList` | every content id (items 0x0000, equipment 0x1000, loot 0x2000, magicks 0x3000, technicks 0x4000, gambits 0x6000, key items 0x8000, packages 0x9000, rewards 0xA000, prices 0xB000, mist 0xC000, bazaar 0xD000, gil 0xE000\|amount 0-4095; values from the ContAllList keys) |
| `BpeIconList` | menu icons |
| `BpBazaarGoodList` | row labels: row -> bazaar good name |

## Count and size rules

- `entryCount` rows of 36 bytes; vanilla 128 (TK L836). Rows are referenced by index (content ids 0xD000|row,
  bazaar unlock state in the save, TK L772-L774), so do not reorder or delete them.
- Exactly three package slots and three ingredient slots per row (IW BazaarGoods.cs:18-26).
- `type` must be 0-2 (IW BazaarGoods.cs:128).

### Text

These tables hold no strings. Every name/description field is a **u16 text id** in the game-wide battle text
id space, which is split into blocks per family (TK L1520-L1563): e.g. action names 0+, equipment names
2048+, battle-menu labels 8192+, status names 10240+, gambit names 12288+, character names 16384+, bazaar
names 18432+; long help texts use ids 3000+, 4000+ (battle actions), 10000+ (inventory actions), 12000+ (status),
16000+ (gambit targets), 22000+ (bazaar). `65535` means *none*. The strings live in the text files of the nested
pack in battlepack **section 61** (15 sub-sections, IW Resources/PackFile.cs:21, IW Resources/OtherFile.cs:23,
msg 1005) and in section 2. Renaming something is a text edit there, not an edit here.

## Pointers

None. Content ids and text ids only.

## Round-trip rules

- Edit fields in place; the record size is fixed and nothing in this section points at entries, so value edits never move data.
- Copy every byte that no field interprets (unknown*/unused*/padding, unnamed bits) from the original; the Workshop writer zero-fills them (it seeks over them), so do not use its output as the byte-identical reference.
- Keep the st2e header bytes verbatim except entryCount (and entryListOffset when the count goes to/from 0).
- Keep the trailing zero padding that rounds the section to a multiple of 16 bytes.
- If the section length changes (added/removed entries), rewrite the battlepack offset table: every later section offset and the end offset shift by the padded size delta.
- Keep exactly three package and three ingredient slots per row.
- flags (0x14): change only bits 0-1 and preserve bits 2-15.
- Do not reorder rows: bazaar content ids (0xD000|row) and save data refer to them by index.

## Known unknowns

- flags bits 2-15 are unnamed; the Workshop drops them on write.
- Which ingredient-sale counter the game compares against (loot sold counters in the save) is not documented here.
- Sentinel used for an empty package/ingredient slot is assumed (0xFFFF content), not verified.

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; license forbids copying or converting its code). Paths are relative to that repo, e.g. `Formats/Battlepack/Actions.cs`, `Formats/St2e.cs`, `Helpers/PackHelper.cs`, `Helpers/EnumHelper.cs`, `Resources/JsonFile.cs`, `Resources/PackFile.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| LL `sectionNN.md` | FF12 Lua Loader documentation, `capabilities/bpack-sections/sectionNN.md` (field names of the loader's read-only `game.bpack` view). |
| Lists | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json` (list name given). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
