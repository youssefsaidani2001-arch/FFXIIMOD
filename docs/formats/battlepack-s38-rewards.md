# Battlepack section 38 — Rewards

Spec id: `battlepack-s38-rewards` · machine spec: [`battlepack-s38-rewards.json`](./battlepack-s38-rewards.json)

Battlepack **section 38** defines **rewards**: per row three content ids handed out before a quest is concluded and
three handed out after (IW Rewards.cs:41-53; TK L832). Rewards are addressed as content ids 0xA000 | row. The Toolkit
lists every row as "Reserve" and notes that the section ships empty (TK L1607).

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

Section 38 specifics: `entrySize` = 12 (0xC) (IW Formats/Battlepack/Rewards.cs:29).
The Workshop maps the unpacked file `section_038.bin` to this table (IW Resources/JsonFile.cs:51).
With 256 rows (TK L832) the section is 32 + 256*12 = 3104 bytes (already a multiple of 16).
Exactly three slots on each side; the Workshop rejects other counts (IW Rewards.cs:18-26). There are no quantity
fields; a content id carries its own amount only for gil (0xF000 | amount).

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…`/`unused…` are not interpreted by any source; keep their original bytes.

### Record `header` — 32 bytes (0x20), count: 1

*Where:* Offset 0 of battlepack section 38.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `magic` | ASCII 'st2e' (73 74 32 65); reject the section if different. |  | IW Formats/St2e.cs:9,20 |
| 0x04 | 4 | u32 | `entryCount` | Number of reward rows (256 in the vanilla game). |  | IW Formats/St2e.cs:25 |
| 0x08 | 2 | u16 | `entrySize` | Bytes per entry; 12 (0xC) for this section. |  | IW Formats/St2e.cs:26 |
| 0x0A | 2 | bytes | `unknown0A` | Not interpreted; keep. |  | IW Formats/St2e.cs:27 |
| 0x0C | 4 | u32 | `entryListOffset` | Offset of entry 0 from the section start: 32 when entryCount > 0, else 0. |  | IW Formats/St2e.cs:12,28,39 |
| 0x10 | 4 | u32 | `offset10` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:29,40 |
| 0x14 | 4 | u32 | `textSectionOffset` | Inline text offset; 0 on disk for this section (filled at run time). No strings are stored here. |  | IW Formats/St2e.cs:30,41; TK L262, L978 |
| 0x18 | 4 | u32 | `offset18` | Unknown offset slot (0 in Workshop output for this section). |  | IW Formats/St2e.cs:31,42 |
| 0x1C | 4 | u32 | `offset1C` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:32,43 |

### Record `reward` — 12 bytes (0xC), count: header.entryCount (vanilla 256)

*Where:* st2e entries of section 38: header.entryListOffset + i*12; row i = reward i, content id 0xA000 | i (row labels: list BpRewardList)

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `preQuestConclusionContent1` | Content id 1 given before the quest is concluded. | `ContAllList` | IW Rewards.cs:42-46,64-67; LL section38.md |
| 0x02 | 2 | u16 | `preQuestConclusionContent2` | Content id 2 given before the quest is concluded. | `ContAllList` | IW Rewards.cs:42-46,64-67; LL section38.md |
| 0x04 | 2 | u16 | `preQuestConclusionContent3` | Content id 3 given before the quest is concluded. | `ContAllList` | IW Rewards.cs:42-46,64-67; LL section38.md |
| 0x06 | 2 | u16 | `postQuestConclusionContent1` | Content id 1 given after the quest is concluded. | `ContAllList` | IW Rewards.cs:48-52,69-72; LL section38.md |
| 0x08 | 2 | u16 | `postQuestConclusionContent2` | Content id 2 given after the quest is concluded. | `ContAllList` | IW Rewards.cs:48-52,69-72; LL section38.md |
| 0x0A | 2 | u16 | `postQuestConclusionContent3` | Content id 3 given after the quest is concluded. | `ContAllList` | IW Rewards.cs:48-52,69-72; LL section38.md |

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `ContAllList` | every content id (category<<12 \| index), see Content ids |

## Count and size rules

- 256 rows in vanilla (TK L832), all unused (TK L1607). Never reorder: content ids 0xA000 | row point at them.

### Content ids

Fields typed as *content* hold a game-wide **content id** = `category << 12 | index` (TK L575, L1567): items 0x0000,
equipment 0x1000, loot 0x2000, magicks 0x3000, technicks 0x4000, gambit sets 0x5000 (TK L918), gambits 0x6000,
key-item family 0x8000 (maps 0x8000+, teleport locations 0x8040+, key items 0x8060+), packages 0x9000, rewards 0xA000,
prices 0xB000, mist 0xC000, bazaar goods 0xD000, gil 0xF000 | amount (Lists: ContAllList and the Cont* lists).
`65535` (0xFFFF) is *none* in the Toolkit's lists.

### Text

This section holds no strings and no text ids.

## Pointers

None.

## Round-trip rules

- Edit fields in place; the record size is fixed and nothing in this section points at entries, so value edits never move data.
- Copy every byte that no field interprets (unknown*/padding, unnamed bits) from the original; the Workshop writer zero-fills them (it seeks over them), so do not use its output as the byte-identical reference.
- Keep the st2e header bytes verbatim except entryCount (and entryListOffset when the count goes to/from 0).
- Keep the trailing zero padding that rounds the section to a multiple of 16 bytes.
- If the section length changes (added/removed entries), rewrite the battlepack offset table: every later section offset and the end offset shift by the padded size delta.
- Keep exactly three pre- and three post-conclusion slots per row.

## Known unknowns

- Whether any script hands out reward ids at all (the table ships empty); what "quest conclusion" maps to in event scripts.
- Empty-slot sentinel assumed 0xFFFF.

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; license forbids copying or converting its code). Paths are relative to that repo, e.g. `Formats/Battlepack/Actions.cs`, `Formats/St2e.cs`, `Helpers/PackHelper.cs`, `Helpers/EnumHelper.cs`, `Resources/JsonFile.cs`, `Resources/PackFile.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| LL `sectionNN.md` | FF12 Lua Loader documentation, `capabilities/bpack-sections/sectionNN.md` (field names of the loader's read-only `game.bpack` view). |
| Lists | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json` (list name given). |
| Graveyard `<file>:<line>` | The Insurgent's Graveyard by Xeavin, `/home/user/xeavin/the-insurgents-graveyard/` (fact reference only). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
