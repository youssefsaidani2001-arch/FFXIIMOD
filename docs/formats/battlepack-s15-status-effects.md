# Battlepack section 15 — Status Effects

Spec id: `battlepack-s15-status-effects` · machine spec: [`battlepack-s15-status-effects.json`](./battlepack-s15-status-effects.json)

Battlepack **section 15** defines the 32 status effects (KO … X-Zone): names, help text, duration and tick data,
which statuses each one cancels or is blocked by, the Remedy/Remedy-Lore cure flags and the sort order used by
several UI lists. Row *i* belongs to status bit *i* of every 32-bit status mask in the game (the Workshop names
row *i* after bit `1 << i`, IW StatusEffects.cs:60). The Workshop maps `section_015.bin` here (IW Resources/JsonFile.cs:37).

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

Section 15 specifics: `entrySize` = 40 (0x28) (IW StatusEffects.cs:23), `entryCount` = 32, enforced (IW StatusEffects.cs:17-19).

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…`/`unused…` are not interpreted by any source; keep their original bytes.

### Record `header` — 32 bytes (0x20), count: 1

*Where:* Offset 0 of battlepack section 15.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `magic` | ASCII 'st2e' (73 74 32 65); reject the section if different. |  | IW Formats/St2e.cs:9,20 |
| 0x04 | 4 | u32 | `entryCount` | Always 32 (one row per status bit). |  | IW Formats/St2e.cs:25 |
| 0x08 | 2 | u16 | `entrySize` | Bytes per entry; 40 (0x28) for this section. |  | IW Formats/St2e.cs:26 |
| 0x0A | 2 | bytes | `unknown0A` | Not interpreted; keep. |  | IW Formats/St2e.cs:27 |
| 0x0C | 4 | u32 | `entryListOffset` | Offset of entry 0 from the section start: 32 when entryCount > 0, else 0. |  | IW Formats/St2e.cs:28,39 |
| 0x10 | 4 | u32 | `offset10` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:29 |
| 0x14 | 4 | u32 | `textSectionOffset` | Inline text offset; 0 on disk for this section (filled at run time). No strings are stored here. |  | IW Formats/St2e.cs:30; TK L262, L978 |
| 0x18 | 4 | u32 | `offset18` | Unknown offset slot (0 in Workshop output for this section). |  | IW Formats/St2e.cs:31 |
| 0x1C | 4 | u32 | `offset1C` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:32 |

### Record `statusEffect` — 40 bytes (0x28), count: 32 (fixed; header.entryCount)

*Where:* st2e entries of section 15: header.entryListOffset + i*40; row i describes status bit i (mask 1<<i)

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `name` | Name text id (status block, 10240+). | `DescStatusEffectList` | IW StatusEffects.cs:36 |
| 0x02 | 1 | u8 | `displayOrderUnknown0` | A display-order index whose screen is unidentified. |  | IW StatusEffects.cs:37; LL section15.md (displayOrder.unknown2) |
| 0x03 | 3 | bytes | `unknown03` | Not interpreted. |  | IW StatusEffects.cs:38 |
| 0x06 | 2 | bf16 | `flags` | Behaviour flags; only the listed bits are known. The Workshop rebuilds this word from the named bits (other bits become 0). | bits below | IW StatusEffects.cs:39-46,71-78; LL section15.md (flags1) |
| 0x08 | 1 | u8 | `duration` | Base duration. |  | IW StatusEffects.cs:47 |
| 0x09 | 1 | u8 | `ticks` | Tick count / interval used by periodic effects. |  | IW StatusEffects.cs:48 |
| 0x0A | 2 | u16 | `description` | Help text id (status help block, 12000+). | `MenuStatusEffectList` | IW StatusEffects.cs:49 |
| 0x0C | 4 | bf32 | `nullifiedStatusEffects` | Statuses removed when this one is applied. | `StatusEffectFlags` | IW StatusEffects.cs:50 |
| 0x10 | 1 | u8 | `displayOrderMenu` | Sort position in the menu status list. |  | IW StatusEffects.cs:51 |
| 0x11 | 2 | bytes | `unknown11` | Not interpreted. |  | IW StatusEffects.cs:52 |
| 0x13 | 1 | u8 | `displayOrderUnknown1` | Second display-order index, screen unidentified. |  | IW StatusEffects.cs:53 |
| 0x14 | 12 | bytes | `unknown14` | Not interpreted. |  | IW StatusEffects.cs:54 |
| 0x20 | 4 | bf32 | `requiredAbsentStatusEffects` | Statuses that block this one: it cannot be applied while any of them is present. | `StatusEffectFlags` | IW StatusEffects.cs:55; LL section15.md (absentStatusEffects) |
| 0x24 | 1 | bf8 | `uiFlags` | UI-related flag byte of unknown meaning (the Workshop keeps it as a raw byte). | bits below | IW StatusEffects.cs:56; LL section15.md (flags2) |
| 0x25 | 1 | u8 | `unknown25` | Not interpreted. |  | IW StatusEffects.cs:57 |
| 0x26 | 1 | u8 | `displayOrderBattleStatusBar` | Sort position in the battle status bar. |  | IW StatusEffects.cs:58 |
| 0x27 | 1 | u8 | `displayOrderTargetInfo` | Sort position in the target info window. |  | IW StatusEffects.cs:59 |

#### Bits of `statusEffect.flags` (bf16 at 0x06; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 5 | 0x0020 | `isRefreshable` | re-applying refreshes the duration |
| 8 | 0x0100 | `isNotApplicableToFoes` |  |
| 10 | 0x0400 | `isNullifiedByRemedy` |  |
| 11 | 0x0800 | `isNullifiedByRemedyLore1` |  |
| 12 | 0x1000 | `isNullifiedByRemedyLore2` |  |
| 13 | 0x2000 | `isNegative` |  |
| 14 | 0x4000 | `isNullifiedByRemedyLore3` |  |

#### Bits of `statusEffect.nullifiedStatusEffects` (bf32 at 0x0C; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 0 | 0x00000001 | `ko` |  |
| 1 | 0x00000002 | `stone` |  |
| 2 | 0x00000004 | `petrify` |  |
| 3 | 0x00000008 | `stop` |  |
| 4 | 0x00000010 | `sleep` |  |
| 5 | 0x00000020 | `confuse` |  |
| 6 | 0x00000040 | `doom` |  |
| 7 | 0x00000080 | `blind` |  |
| 8 | 0x00000100 | `poison` |  |
| 9 | 0x00000200 | `silence` |  |
| 10 | 0x00000400 | `sap` |  |
| 11 | 0x00000800 | `oil` |  |
| 12 | 0x00001000 | `reverse` |  |
| 13 | 0x00002000 | `disable` |  |
| 14 | 0x00004000 | `immobilize` |  |
| 15 | 0x00008000 | `slow` |  |
| 16 | 0x00010000 | `disease` |  |
| 17 | 0x00020000 | `lure` |  |
| 18 | 0x00040000 | `protect` |  |
| 19 | 0x00080000 | `shell` |  |
| 20 | 0x00100000 | `haste` |  |
| 21 | 0x00200000 | `bravery` |  |
| 22 | 0x00400000 | `faith` |  |
| 23 | 0x00800000 | `reflect` |  |
| 24 | 0x01000000 | `invisible` |  |
| 25 | 0x02000000 | `regen` |  |
| 26 | 0x04000000 | `float` |  |
| 27 | 0x08000000 | `berserk` |  |
| 28 | 0x10000000 | `bubble` |  |
| 29 | 0x20000000 | `hpCritical` |  |
| 30 | 0x40000000 | `libra` |  |
| 31 | 0x80000000 | `xZone` |  |

#### Bits of `statusEffect.requiredAbsentStatusEffects` (bf32 at 0x20; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 0 | 0x00000001 | `ko` |  |
| 1 | 0x00000002 | `stone` |  |
| 2 | 0x00000004 | `petrify` |  |
| 3 | 0x00000008 | `stop` |  |
| 4 | 0x00000010 | `sleep` |  |
| 5 | 0x00000020 | `confuse` |  |
| 6 | 0x00000040 | `doom` |  |
| 7 | 0x00000080 | `blind` |  |
| 8 | 0x00000100 | `poison` |  |
| 9 | 0x00000200 | `silence` |  |
| 10 | 0x00000400 | `sap` |  |
| 11 | 0x00000800 | `oil` |  |
| 12 | 0x00001000 | `reverse` |  |
| 13 | 0x00002000 | `disable` |  |
| 14 | 0x00004000 | `immobilize` |  |
| 15 | 0x00008000 | `slow` |  |
| 16 | 0x00010000 | `disease` |  |
| 17 | 0x00020000 | `lure` |  |
| 18 | 0x00040000 | `protect` |  |
| 19 | 0x00080000 | `shell` |  |
| 20 | 0x00100000 | `haste` |  |
| 21 | 0x00200000 | `bravery` |  |
| 22 | 0x00400000 | `faith` |  |
| 23 | 0x00800000 | `reflect` |  |
| 24 | 0x01000000 | `invisible` |  |
| 25 | 0x02000000 | `regen` |  |
| 26 | 0x04000000 | `float` |  |
| 27 | 0x08000000 | `berserk` |  |
| 28 | 0x10000000 | `bubble` |  |
| 29 | 0x20000000 | `hpCritical` |  |
| 30 | 0x40000000 | `libra` |  |
| 31 | 0x80000000 | `xZone` |  |

#### Bits of `statusEffect.uiFlags` (bf8 at 0x24; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 0 | 0x01 | `unknownBit0` |  |
| 1 | 0x02 | `unknownBit1` |  |
| 2 | 0x04 | `unknownBit2` |  |
| 3 | 0x08 | `unknownBit3` |  |

## Enums carried in the JSON spec

Flag enums list the mask value of each bit. Fields that point at bigger lists (text ids, content ids, animations, formulas …) name a list from `editor/data/lists.json` instead (see *External lists*).

#### `StatusEffectFlags` (IW Helpers/EnumHelper.cs:75-111)

| Value | Label |
|---|---|
| 1 (0x1) | KO |
| 2 (0x2) | Stone |
| 4 (0x4) | Petrify |
| 8 (0x8) | Stop |
| 16 (0x10) | Sleep |
| 32 (0x20) | Confuse |
| 64 (0x40) | Doom |
| 128 (0x80) | Blind |
| 256 (0x100) | Poison |
| 512 (0x200) | Silence |
| 1024 (0x400) | Sap |
| 2048 (0x800) | Oil |
| 4096 (0x1000) | Reverse |
| 8192 (0x2000) | Disable |
| 16384 (0x4000) | Immobilize |
| 32768 (0x8000) | Slow |
| 65536 (0x10000) | Disease |
| 131072 (0x20000) | Lure |
| 262144 (0x40000) | Protect |
| 524288 (0x80000) | Shell |
| 1048576 (0x100000) | Haste |
| 2097152 (0x200000) | Bravery |
| 4194304 (0x400000) | Faith |
| 8388608 (0x800000) | Reflect |
| 16777216 (0x1000000) | Invisible |
| 33554432 (0x2000000) | Regen |
| 67108864 (0x4000000) | Float |
| 134217728 (0x8000000) | Berserk |
| 268435456 (0x10000000) | Bubble |
| 536870912 (0x20000000) | HP Critical |
| 1073741824 (0x40000000) | Libra |
| 2147483648 (0x80000000) | X-Zone |

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `DescStatusEffectList` | status name text ids 10240+ |
| `MenuStatusEffectList` | status help text ids 12000+ |
| `BpStatusEffectList` | row labels: row i -> status name (KO … X-Zone) |

## Count and size rules

- Exactly 32 rows. The engine checks all 32 status bits in dozens of places and the masks are 32-bit everywhere
  (actions, equipment attributes, party members), so a 33rd status cannot be added; only existing ones can be
  repurposed (msg 59; IW StatusEffects.cs:17-19).
- Row order is fixed by bit number; never reorder.

### Text

These tables hold no strings. Every name/description field is a **u16 text id** in the game-wide battle text
id space, which is split into blocks per family (TK L1520-L1563): e.g. action names 0+, equipment names
2048+, battle-menu labels 8192+, status names 10240+, gambit names 12288+, character names 16384+, bazaar
names 18432+; long help texts use ids 3000+, 4000+ (battle actions), 10000+ (inventory actions), 12000+ (status),
16000+ (gambit targets), 22000+ (bazaar). `65535` means *none*. The strings live in the text files of the nested
pack in battlepack **section 61** (15 sub-sections, IW Resources/PackFile.cs:21, IW Resources/OtherFile.cs:23,
msg 1005) and in section 2. Renaming something is a text edit there, not an edit here.

## Pointers

None. Cross-references are by bit position (status masks elsewhere) and by text id.

## Round-trip rules

- Edit fields in place; the record size is fixed and nothing in this section points at entries, so value edits never move data.
- Copy every byte that no field interprets (unknown*/unused*/padding, unnamed bits) from the original; the Workshop writer zero-fills them (it seeks over them), so do not use its output as the byte-identical reference.
- Keep the st2e header bytes verbatim except entryCount (and entryListOffset when the count goes to/from 0).
- Keep the trailing zero padding that rounds the section to a multiple of 16 bytes.
- If the section length changes (added/removed entries), rewrite the battlepack offset table: every later section offset and the end offset shift by the padded size delta.
- Entry count must stay 32 and row order must follow status bit order.
- flags (0x06): change only the named bits and preserve all other bits.

## Known unknowns

- Flag word bits 0-4, 6, 7, 9 and 15 are unnamed; the Workshop drops them on write.
- uiFlags (0x24) bits are all unnamed.
- Bytes 0x03-0x05, 0x11-0x12, 0x14-0x1F and 0x25 are never interpreted.
- Screens for displayOrderUnknown0/1 are not identified.
- Units of duration and ticks are not documented.

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; license forbids copying or converting its code). Paths are relative to that repo, e.g. `Formats/Battlepack/Actions.cs`, `Formats/St2e.cs`, `Helpers/PackHelper.cs`, `Helpers/EnumHelper.cs`, `Resources/JsonFile.cs`, `Resources/PackFile.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| LL `sectionNN.md` | FF12 Lua Loader documentation, `capabilities/bpack-sections/sectionNN.md` (field names of the loader's read-only `game.bpack` view). |
| Lists | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json` (list name given). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
