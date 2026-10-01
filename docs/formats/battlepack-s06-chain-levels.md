# Battlepack section 6 — Chain Levels

Spec id: `battlepack-s06-chain-levels` · machine spec: [`battlepack-s06-chain-levels.json`](./battlepack-s06-chain-levels.json)

Battlepack **section 6** holds the loot-chain tuning: one 37-byte row for each of the four chain levels. Each row
says how many identical kills reach the level, how likely each loot tier is, how many items each tier yields, the
weights of the post-battle bonus (HP/MP recovery, Protect/Shell) and the reverse-chain numbers.
The Workshop maps `section_006.bin` to its chain-level reader (IW Resources/JsonFile.cs:28).

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

Section 6 specifics: `entrySize` = 37 (0x25) (IW ChainLevels.cs:23), `entryCount` = 4 and the Workshop refuses any other
count (IW ChainLevels.cs:17-19). 37 is odd, so entries are **not** 2- or 4-byte aligned; read every field byte-wise.
Section length = 32 + 4*37 = 180 bytes, padded to 192.

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…`/`unused…` are not interpreted by any source; keep their original bytes.

### Record `header` — 32 bytes (0x20), count: 1

*Where:* Offset 0 of battlepack section 6.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `magic` | ASCII 'st2e' (73 74 32 65); reject the section if different. |  | IW Formats/St2e.cs:9,20 |
| 0x04 | 4 | u32 | `entryCount` | Always 4 (one row per chain level). |  | IW Formats/St2e.cs:25 |
| 0x08 | 2 | u16 | `entrySize` | Bytes per entry; 37 (0x25) for this section. |  | IW Formats/St2e.cs:26 |
| 0x0A | 2 | bytes | `unknown0A` | Not interpreted; keep. |  | IW Formats/St2e.cs:27 |
| 0x0C | 4 | u32 | `entryListOffset` | Offset of entry 0 from the section start: 32 when entryCount > 0, else 0. |  | IW Formats/St2e.cs:28,39 |
| 0x10 | 4 | u32 | `offset10` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:29 |
| 0x14 | 4 | u32 | `textSectionOffset` | Inline text offset; 0 on disk for this section (filled at run time). No strings are stored here. |  | IW Formats/St2e.cs:30; TK L262, L978 |
| 0x18 | 4 | u32 | `offset18` | Unknown offset slot (0 in Workshop output for this section). |  | IW Formats/St2e.cs:31 |
| 0x1C | 4 | u32 | `offset1C` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:32 |

### Record `chainLevel` — 37 bytes (0x25), count: 4 (fixed; header.entryCount)

*Where:* st2e entries of section 6: header.entryListOffset + i*37

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 1 | s8 | `commonDropRate` | Drop rate of the Common loot tier at this chain level (percent-like). |  | IW ChainLevels.cs:37; LL section06.md |
| 0x01 | 1 | s8 | `uncommonDropRate` | Drop rate of the Uncommon tier. |  | IW ChainLevels.cs:38 |
| 0x02 | 1 | s8 | `rareDropRate` | Drop rate of the Rare tier. |  | IW ChainLevels.cs:39 |
| 0x03 | 1 | s8 | `veryRareDropRate` | Drop rate of the Very Rare tier. |  | IW ChainLevels.cs:40 |
| 0x04 | 1 | s8 | `guaranteedDropRate` | Drop rate of the guaranteed tier. |  | IW ChainLevels.cs:41 |
| 0x05 | 1 | u8 | `identicalFoeConditionCount` | Chain count (kills of the same foe type) needed for this chain level. |  | IW ChainLevels.cs:42; LL section06.md (foeLimit) |
| 0x06 | 1 | s8 | `commonAmountRate1` | Rate for the common tier dropping 1 item(s). |  | IW ChainLevels.cs:47 |
| 0x07 | 1 | s8 | `commonAmountRate2` | Rate for the common tier dropping 2 item(s). |  | IW ChainLevels.cs:47 |
| 0x08 | 1 | s8 | `commonAmountRate3` | Rate for the common tier dropping 3 item(s). |  | IW ChainLevels.cs:47 |
| 0x09 | 1 | s8 | `commonAmountRate4` | Rate for the common tier dropping 4 item(s). |  | IW ChainLevels.cs:47 |
| 0x0A | 1 | s8 | `uncommonAmountRate1` | Rate for the uncommon tier dropping 1 item(s). |  | IW ChainLevels.cs:51 |
| 0x0B | 1 | s8 | `uncommonAmountRate2` | Rate for the uncommon tier dropping 2 item(s). |  | IW ChainLevels.cs:51 |
| 0x0C | 1 | s8 | `uncommonAmountRate3` | Rate for the uncommon tier dropping 3 item(s). |  | IW ChainLevels.cs:51 |
| 0x0D | 1 | s8 | `uncommonAmountRate4` | Rate for the uncommon tier dropping 4 item(s). |  | IW ChainLevels.cs:51 |
| 0x0E | 1 | s8 | `rareAmountRate1` | Rate for the rare tier dropping 1 item(s). |  | IW ChainLevels.cs:55 |
| 0x0F | 1 | s8 | `rareAmountRate2` | Rate for the rare tier dropping 2 item(s). |  | IW ChainLevels.cs:55 |
| 0x10 | 1 | s8 | `rareAmountRate3` | Rate for the rare tier dropping 3 item(s). |  | IW ChainLevels.cs:55 |
| 0x11 | 1 | s8 | `rareAmountRate4` | Rate for the rare tier dropping 4 item(s). |  | IW ChainLevels.cs:55 |
| 0x12 | 1 | s8 | `veryRareAmountRate1` | Rate for the veryRare tier dropping 1 item(s). |  | IW ChainLevels.cs:59 |
| 0x13 | 1 | s8 | `veryRareAmountRate2` | Rate for the veryRare tier dropping 2 item(s). |  | IW ChainLevels.cs:59 |
| 0x14 | 1 | s8 | `veryRareAmountRate3` | Rate for the veryRare tier dropping 3 item(s). |  | IW ChainLevels.cs:59 |
| 0x15 | 1 | s8 | `veryRareAmountRate4` | Rate for the veryRare tier dropping 4 item(s). |  | IW ChainLevels.cs:59 |
| 0x16 | 1 | s8 | `guaranteedAmountRate1` | Rate for the guaranteed tier dropping 1 item(s). |  | IW ChainLevels.cs:63 |
| 0x17 | 1 | s8 | `guaranteedAmountRate2` | Rate for the guaranteed tier dropping 2 item(s). |  | IW ChainLevels.cs:63 |
| 0x18 | 1 | s8 | `guaranteedAmountRate3` | Rate for the guaranteed tier dropping 3 item(s). |  | IW ChainLevels.cs:63 |
| 0x19 | 1 | s8 | `guaranteedAmountRate4` | Rate for the guaranteed tier dropping 4 item(s). |  | IW ChainLevels.cs:63 |
| 0x1A | 1 | u8 | `benefitRateNone` | Weight of the post-battle chain bonus "no bonus". |  | IW ChainLevels.cs:67, 183-192 |
| 0x1B | 1 | u8 | `benefitRateHpRecovery` | Weight of the post-battle chain bonus "HP recovery". |  | IW ChainLevels.cs:67, 183-192 |
| 0x1C | 1 | u8 | `benefitRateMpRecovery` | Weight of the post-battle chain bonus "MP recovery". |  | IW ChainLevels.cs:67, 183-192 |
| 0x1D | 1 | u8 | `benefitRateLeaderProtect` | Weight of the post-battle chain bonus "Protect on the leader". |  | IW ChainLevels.cs:67, 183-192 |
| 0x1E | 1 | u8 | `benefitRateLeaderShell` | Weight of the post-battle chain bonus "Shell on the leader". Order of bytes 0x1E/0x1F disputed: the Workshop has Leader Shell then All Protect, the Lua Loader docs have All Protect then Leader Shell. |  | IW ChainLevels.cs:67, 183-192 |
| 0x1F | 1 | u8 | `benefitRateAllProtect` | Weight of the post-battle chain bonus "Protect on the party". Order of bytes 0x1E/0x1F disputed: the Workshop has Leader Shell then All Protect, the Lua Loader docs have All Protect then Leader Shell. |  | IW ChainLevels.cs:67, 183-192 |
| 0x20 | 1 | u8 | `benefitRateAllShell` | Weight of the post-battle chain bonus "Shell on the party". |  | IW ChainLevels.cs:67, 183-192 |
| 0x21 | 1 | u8 | `reverseChainDifferentFoeConditionCount` | Count of different-foe kills used by the reverse chain at this level. |  | IW ChainLevels.cs:70; LL section06.md (reverseChain.foeLimit) |
| 0x22 | 1 | s8 | `reverseChainAmountRate1` | Reverse-chain rate for dropping 1 item(s). |  | IW ChainLevels.cs:73 |
| 0x23 | 1 | s8 | `reverseChainAmountRate2` | Reverse-chain rate for dropping 2 item(s). |  | IW ChainLevels.cs:73 |
| 0x24 | 1 | s8 | `reverseChainAmountRate3` | Reverse-chain rate for dropping 3 item(s). |  | IW ChainLevels.cs:73 |

## Count and size rules

- Exactly 4 entries; the game indexes them by chain level, so do not add or remove rows (IW ChainLevels.cs:17-19).
- All rate fields are single bytes. The Workshop treats the drop/amount rates as **signed** bytes and the
  benefit/condition counts as unsigned (IW ChainLevels.cs:37-73); the Lua Loader docs type everything as `u8`.
  Values stay within 0-100 in practice, where both readings agree.

### Text

This section holds no strings and no text ids.

## Pointers

None. Nothing inside the section points at another place; no other section points at a chain-level row.

## Round-trip rules

- Edit fields in place; the record size is fixed and nothing in this section points at entries, so value edits never move data.
- Copy every byte that no field interprets (unknown*/unused*/padding, unnamed bits) from the original; the Workshop writer zero-fills them (it seeks over them), so do not use its output as the byte-identical reference.
- Keep the st2e header bytes verbatim except entryCount (and entryListOffset when the count goes to/from 0).
- Keep the trailing zero padding that rounds the section to a multiple of 16 bytes.
- If the section length changes (added/removed entries), rewrite the battlepack offset table: every later section offset and the end offset shift by the padded size delta.
- Entry count must stay 4.

## Known unknowns

- Exact semantics of the amount rates (weights vs. cumulative percentages) and of the "guaranteed" tier are not documented by any source.
- Byte order of benefitRateLeaderShell / benefitRateAllProtect (0x1E/0x1F) differs between the Workshop and the Lua Loader docs; verify in game.
- Signedness of the rate bytes (Workshop: s8; Lua Loader: u8).
- Header offset slots 0x10/0x18/0x1C and bytes 0x0A-0x0B: assumed 0, never interpreted.

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; license forbids copying or converting its code). Paths are relative to that repo, e.g. `Formats/Battlepack/Actions.cs`, `Formats/St2e.cs`, `Helpers/PackHelper.cs`, `Helpers/EnumHelper.cs`, `Resources/JsonFile.cs`, `Resources/PackFile.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| LL `sectionNN.md` | FF12 Lua Loader documentation, `capabilities/bpack-sections/sectionNN.md` (field names of the loader's read-only `game.bpack` view). |
| Lists | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json` (list name given). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
