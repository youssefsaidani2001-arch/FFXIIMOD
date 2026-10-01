# Battlepack section 3 — MP Regeneration

Spec id: `battlepack-s03-mp-regeneration` · machine spec: [`battlepack-s03-mp-regeneration.json`](./battlepack-s03-mp-regeneration.json)

Battlepack **section 3** holds two MP-regeneration tables that share one st2e list. The first 20 rows say how much MP
is restored by damage (the Workshop ties them to the augments Martyr, Inquisitor and Warmage); every row after that is
a walking tier saying how many steps regenerate 1 MP (IW MpRegeneration.cs:12-16, 50-72). Players edit this file to
change what Martyr gives (msg 94).

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

Section 3 specifics: `entrySize` = 8 (0x8) (IW Formats/Battlepack/MpRegeneration.cs:39).
The Workshop maps the unpacked file `section_003.bin` to this table (IW Resources/JsonFile.cs:26).

Both row kinds use the same 8-byte stride; the kind is decided only by the row index (rows 0-19 vs. 20+,
IW MpRegeneration.cs:52-71). The Lua Loader docs describe the same overlap (LL section03.md). `entryCount` is
20 + the number of walking tiers (IW MpRegeneration.cs:38-39).

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…`/`unused…` are not interpreted by any source; keep their original bytes.

### Record `header` — 32 bytes (0x20), count: 1

*Where:* Offset 0 of battlepack section 3.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `magic` | ASCII 'st2e' (73 74 32 65); reject the section if different. |  | IW Formats/St2e.cs:9,20 |
| 0x04 | 4 | u32 | `entryCount` | 20 + number of walking tiers (all rows share the 8-byte stride). |  | IW Formats/St2e.cs:25 |
| 0x08 | 2 | u16 | `entrySize` | Bytes per entry; 8 (0x8) for this section. |  | IW Formats/St2e.cs:26 |
| 0x0A | 2 | bytes | `unknown0A` | Not interpreted; keep. |  | IW Formats/St2e.cs:27 |
| 0x0C | 4 | u32 | `entryListOffset` | Offset of entry 0 from the section start: 32 when entryCount > 0, else 0. |  | IW Formats/St2e.cs:12,28,39 |
| 0x10 | 4 | u32 | `offset10` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:29,40 |
| 0x14 | 4 | u32 | `textSectionOffset` | Inline text offset; 0 on disk for this section (filled at run time). No strings are stored here. |  | IW Formats/St2e.cs:30,41; TK L262, L978 |
| 0x18 | 4 | u32 | `offset18` | Unknown offset slot (0 in Workshop output for this section). |  | IW Formats/St2e.cs:31,42 |
| 0x1C | 4 | u32 | `offset1C` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:32,43 |

### Record `mpRegenByDamage` — 8 bytes (0x8), count: 20 (fixed)

*Where:* st2e rows 0-19 of section 3: header.entryListOffset + i*8, i = 0..19

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `requiredDamage` | Damage threshold of this tier. |  | IW MpRegeneration.cs:56,82; LL section03.md |
| 0x02 | 1 | u8 | `regeneratedMp` | MP restored when the tier applies. |  | IW MpRegeneration.cs:57,83; LL section03.md |
| 0x03 | 1 | u8 | `regeneratedMpSummon` | MP restored in the variant the Workshop labels "Summon". |  | IW MpRegeneration.cs:58,84,104; LL section03.md |
| 0x04 | 4 | bytes | `unknown04` | Not read; the Workshop writes zeros. |  | IW MpRegeneration.cs:60,85 |

### Record `mpRegenByFoot` — 8 bytes (0x8), count: header.entryCount - 20 (at least 1)

*Where:* st2e rows 20.. of section 3: header.entryListOffset + (20 + j)*8, j = 0..entryCount-21

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | u32 | `steps` | Steps of walking needed to regenerate 1 MP in this tier. |  | IW MpRegeneration.cs:67,90; LL section03.md (s32); Graveyard README.md:9-10 |
| 0x04 | 4 | u32 | `mpLimit` | Upper MP bound of the tier; tiers are ordered by it and the last one must be >= 1000. |  | IW MpRegeneration.cs:68,91,31-34; LL section03.md (s32) |

## Count and size rules

- Exactly 20 damage rows, at least one walking row, and the last walking row must have `mpLimit` >= 1000; the
  Workshop refuses anything else (IW MpRegeneration.cs:21-34; its message says "at least 999" but the test rejects
  values below 1000). Max MP is 999, so the last tier acts as the catch-all.
- Damage rows are threshold tiers. A player summary of vanilla Martyr (msg 96): 1-499 damage -> 1 MP, 500-1499 -> 2,
  1500-2599 -> 3, 3000-4999 -> 4, 5000-5999 -> 5, 6000-6999 -> 7, 7000-7999 -> 10, 8000-8999 -> 15, 9000-9998 -> 20,
  9999+ -> 30. Only 10 tiers are listed there, so how the 20 rows split between the three augments is unknown.
- Walking regeneration is counted in steps per 1 MP; the Graveyard "Fixed MP Regeneration" mod scales exactly this
  step count by the speed-mode multiplier (Graveyard README.md:9-10).
- Types: the Workshop reads `steps`/`mpLimit` as u32, the Lua Loader docs as s32; vanilla values are small positive
  numbers so both readings agree.

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
- Keep exactly 20 damage rows first; walking rows follow in ascending mpLimit order, the last with mpLimit >= 1000.

## Known unknowns

- Exact lookup rule for walking tiers: whether current or max MP is compared with mpLimit, and whether the bound is inclusive.
- Meaning of regeneratedMpSummon (Workshop label only).
- Bytes 4-7 of damage rows are never read; assumed padding.
- How the 20 damage rows map to Martyr / Inquisitor / Warmage (msg 96 gives only 10 Martyr tiers).
- Section 3 is also referenced by name in TK L1044, but that is ARD section 3 (AI scripts), not this battlepack section.

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; license forbids copying or converting its code). Paths are relative to that repo, e.g. `Formats/Battlepack/Actions.cs`, `Formats/St2e.cs`, `Helpers/PackHelper.cs`, `Helpers/EnumHelper.cs`, `Resources/JsonFile.cs`, `Resources/PackFile.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| LL `sectionNN.md` | FF12 Lua Loader documentation, `capabilities/bpack-sections/sectionNN.md` (field names of the loader's read-only `game.bpack` view). |
| Lists | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json` (list name given). |
| Graveyard `<file>:<line>` | The Insurgent's Graveyard by Xeavin, `/home/user/xeavin/the-insurgents-graveyard/` (fact reference only). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
