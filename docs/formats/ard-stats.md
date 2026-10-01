# ARD sections 7 and 8 - Default and additive stats

Spec id: `ard-stats` · machine spec: [`ard-stats.json`](./ard-stats.json)

ARD **sections 7 and 8** are two tables with the **same 56-byte row layout**: section 7 holds the *default*
stats of a foe (HP, MP, attributes, rewards), section 8 the *additive* stats - the growth applied on top,
per level according to the Toolkit (TK L1010-L1011). A unit selects one row of each (`defaultStatsLink` at
unit +0x22, `additiveStatsLink` at +0x24, TK L1034-L1035). The Workshop maps both `section_007.bin` and
`section_008.bin` to the same reader (IW Resources/JsonFile.cs:72).

## Container

### The ARD file

Full container spec: [`container-ard.md`](./container-ard.md). What matters for this section:

- **Files.** Standalone `*.ard` files (the Workshop treats every `.ard` as a 10-section pack,
  IW Resources/PackFile.cs:29) and the ARD embedded as **section 19 of every `.ebp`** (the Workshop names that
  section `section_019.ard`, IW Helpers/PackHelper.cs:217-222, 245; because `.ebp` precedes `.ard` in its pack list the extracted ARD is
  unpacked right after, and rebuilt before the EBP, IW Resources/PackFile.cs:28-29, IW Program.cs:53, 88). The Toolkit's
  file viewer lists "Area Resource Data (.ard)" as game file type 21 (TK L1411). None of our sources names the
  VBF folder that holds the standalone files; search the archive for `.ard`. One ARD covers one area and its
  edits only apply after the area is (re)loaded (TK L1072, L1697).
- **Header (0x30 bytes).** 8-byte magic `FF12AR03` (`46 46 31 32 41 52 30 33`, IW Helpers/PackHelper.cs:272-276, 319-320), then ten
  little-endian `u32` section offsets at 0x08-0x2F (IW Helpers/PackHelper.cs:279-283, 323, 358-362). Offsets count from the first
  byte of the ARD (the game resolves a section as ARD base + offset, TK L242); **0 means the section is absent**.
  Section 7's offset is the `u32` at **ARD+0x24** (slot 7), section 8's at **ARD+0x28** (slot 8).
- **Section span.** Sort the non-zero offsets; a section runs to the next larger offset, the highest one to
  the end of the ARD (IW Helpers/PackHelper.cs:285-310). When the ARD comes out of an EBP, "end of the ARD" includes the EBP's
  alignment padding, so trailing zero bytes after the highest section are normal.
- **Physical order.** Sections 0, 2, 3, 4, 5, 6, 7, 8, 9 are written in index order, each starting on a 16-byte
  boundary with zero fill in between; **section 1 is always written last** and nothing is appended after it
  (IW Helpers/PackHelper.cs:327-355). Absent sections take no space.
- **Unpacked naming.** The Workshop stores section *n* as `<file>.ard.dir/section_<nnn>.bin`
  (IW Helpers/PackHelper.cs:308, IW Resources/JsonFile.cs:68-73); the `files` globs of this spec include that name.

#### ARD section map

| # | Header slot | Content | Spec | Source |
|---|---|---|---|---|
| 0 | 0x08 | unknown | - | IW Resources/JsonFile.cs:68-73 (not mapped) |
| 1 | 0x0C | Models (Toolkit: "Model Motions") - stored last | [`ard-models`](./ard-models.md) | IW Resources/JsonFile.cs:68; TK L1006 |
| 2 | 0x10 | Classes (species) - st2e, 84-byte rows | [`ard-classes`](./ard-classes.md) | IW Resources/JsonFile.cs:69; TK L1007 |
| 3 | 0x14 | AI scripts (Toolkit: "Battle Logics") - offset table + scripts | [`ard-aiscripts`](./ard-aiscripts.md) | IW Resources/JsonFile.cs:70; TK L1008 |
| 4 | 0x18 | Units (per-encounter foe records) - st2e, 88-byte rows | [`ard-units`](./ard-units.md) | IW Resources/JsonFile.cs:71; TK L1009 |
| 5 | 0x1C | unknown | - | - |
| 6 | 0x20 | unknown | - | - |
| 7 | 0x24 | Default stats - st2e, 56-byte rows | [`ard-stats`](./ard-stats.md) | IW Resources/JsonFile.cs:72; TK L1010 |
| 8 | 0x28 | Additive stats - st2e, 56-byte rows | [`ard-stats`](./ard-stats.md) | IW Resources/JsonFile.cs:72; TK L1011 |
| 9 | 0x2C | Special action animations - count + 16-byte rows | [`ard-specialactionanimations`](./ard-specialactionanimations.md) | IW Resources/JsonFile.cs:73; TK L1012 |

### The `st2e` table header (32 bytes)

Sections 7 and 8 are each a plain st2e table (no magic of its own beyond `st2e`); see
[`container-st2e.md`](./container-st2e.md). In short: `st2e` magic, `u32 entryCount` at 0x04, `u16 entrySize`
at 0x08 (**56** here, IW Formats/Ard/Stats.cs:17),
2 unread bytes, `u32 entryListOffset` at 0x0C (0x20, or 0 for an empty table, IW Formats/St2e.cs:39), then four
`u32` words that are 0 in every table the Workshop writes (IW Formats/St2e.cs:29-32, 40-43). Rows follow back to
back from 0x20; after the last row the section is zero-padded to a multiple of 16 (IW Helpers/BinaryHelper.cs:12-33).
All offsets inside the section are relative to the section start, so moving the section inside the ARD never
changes them.

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…`/`unused…` are not interpreted by any source; keep their original bytes.

### Record `header` — 32 bytes (0x20), count: 1

*Where:* Offset 0 of ARD section 7 (ARD start + u32 at ARD+0x24) and, separately, of ARD section 8 (u32 at ARD+0x28).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `magic` | ASCII 'st2e' (73 74 32 65); reject the section if different. |  | IW Formats/St2e.cs:9,20-23 |
| 0x04 | 4 | u32 | `entryCount` | Number of stat rows (section 7 or 8). |  | IW Formats/St2e.cs:25 |
| 0x08 | 2 | u16 | `entrySize` | Bytes per row; always 56 (0x38) for this table. |  | IW Formats/St2e.cs:26 |
| 0x0A | 2 | bytes | `unknown0A` | Not read by any source; keep as found. |  | IW Formats/St2e.cs:27 |
| 0x0C | 4 | u32 | `entryListOffset` | Section-relative offset of row 0: 32 when entryCount > 0, otherwise 0. |  | IW Formats/St2e.cs:12,28,39 |
| 0x10 | 4 | u32 | `offset10` | Unknown offset word; 0 in Workshop output. |  | IW Formats/St2e.cs:29,40 |
| 0x14 | 4 | u32 | `textSectionOffset` | Named text-section offset; 0 on disk (the Toolkit clears it on export). No strings are stored in ARD tables. |  | IW Formats/St2e.cs:30,41; TK L262 |
| 0x18 | 4 | u32 | `offset18` | Unknown offset word; 0 in Workshop output. |  | IW Formats/St2e.cs:31,42 |
| 0x1C | 4 | u32 | `offset1C` | Unknown offset word; 0 in Workshop output. |  | IW Formats/St2e.cs:32,43 |

### Record `defaultStats` — 56 bytes (0x38), count: header.entryCount of section 7

*Where:* st2e rows of ARD section 7: section offset header.entryListOffset + i*56

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `clanPoints` | Clan points awarded. |  | IW Formats/Ard/Stats.cs:29; TK L1010 |
| 0x02 | 1 | u8 | `evadeShield` | Evade from shield. |  | IW Formats/Ard/Stats.cs:30; TK L1010 |
| 0x03 | 1 | u8 | `magickEvadeShield` | Magick evade from shield. |  | IW Formats/Ard/Stats.cs:31; TK L1010 |
| 0x04 | 28 | bytes | `unknown04` | Not read. |  | IW Formats/Ard/Stats.cs:32 |
| 0x20 | 4 | u32 | `maxHp` | Maximum HP. |  | IW Formats/Ard/Stats.cs:33; TK L1010 |
| 0x24 | 2 | u16 | `maxMp` | Maximum MP. |  | IW Formats/Ard/Stats.cs:34; TK L1010 |
| 0x26 | 1 | u8 | `strength` | Strength. |  | IW Formats/Ard/Stats.cs:35 |
| 0x27 | 1 | u8 | `magickPower` | Magick power. |  | IW Formats/Ard/Stats.cs:36 |
| 0x28 | 1 | u8 | `vitality` | Vitality. |  | IW Formats/Ard/Stats.cs:37 |
| 0x29 | 1 | u8 | `speed` | Speed. |  | IW Formats/Ard/Stats.cs:38 |
| 0x2A | 1 | u8 | `evadeParry` | Parry evade. |  | IW Formats/Ard/Stats.cs:39 |
| 0x2B | 1 | u8 | `defense` | Defense. |  | IW Formats/Ard/Stats.cs:40 |
| 0x2C | 1 | u8 | `magickResist` | Magick resist. |  | IW Formats/Ard/Stats.cs:41 |
| 0x2D | 1 | u8 | `attackPower` | Attack power (probably unused when the unit takes attack power from its weapon, unit flag 0x15 bit 0; msg 637). |  | IW Formats/Ard/Stats.cs:42 |
| 0x2E | 1 | u8 | `evadeWeapon` | Weapon evade (same remark as attackPower). |  | IW Formats/Ard/Stats.cs:43 |
| 0x2F | 1 | u8 | `licensePoints` | License points awarded. |  | IW Formats/Ard/Stats.cs:44; TK L1010 |
| 0x30 | 4 | u32 | `gil` | Gil awarded. |  | IW Formats/Ard/Stats.cs:45; TK L1010 |
| 0x34 | 4 | u32 | `experience` | Experience awarded. |  | IW Formats/Ard/Stats.cs:46; TK L1010 |

### Record `additiveStats` — 56 bytes (0x38), count: header.entryCount of section 8

*Where:* st2e rows of ARD section 8: section offset header.entryListOffset + i*56

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `clanPoints` | Clan points awarded. Section 8: amount added on top of the default row (how it scales, e.g. per level, is not documented). |  | IW Formats/Ard/Stats.cs:29; TK L1010 |
| 0x02 | 1 | u8 | `evadeShield` | Evade from shield. Section 8: amount added on top of the default row (how it scales, e.g. per level, is not documented). |  | IW Formats/Ard/Stats.cs:30; TK L1010 |
| 0x03 | 1 | u8 | `magickEvadeShield` | Magick evade from shield. Section 8: amount added on top of the default row (how it scales, e.g. per level, is not documented). |  | IW Formats/Ard/Stats.cs:31; TK L1010 |
| 0x04 | 28 | bytes | `unknown04` | Not read. |  | IW Formats/Ard/Stats.cs:32 |
| 0x20 | 4 | u32 | `maxHp` | Maximum HP. Section 8: amount added on top of the default row (how it scales, e.g. per level, is not documented). |  | IW Formats/Ard/Stats.cs:33; TK L1010 |
| 0x24 | 2 | u16 | `maxMp` | Maximum MP. Section 8: amount added on top of the default row (how it scales, e.g. per level, is not documented). |  | IW Formats/Ard/Stats.cs:34; TK L1010 |
| 0x26 | 1 | u8 | `strength` | Strength. Section 8: amount added on top of the default row (how it scales, e.g. per level, is not documented). |  | IW Formats/Ard/Stats.cs:35 |
| 0x27 | 1 | u8 | `magickPower` | Magick power. Section 8: amount added on top of the default row (how it scales, e.g. per level, is not documented). |  | IW Formats/Ard/Stats.cs:36 |
| 0x28 | 1 | u8 | `vitality` | Vitality. Section 8: amount added on top of the default row (how it scales, e.g. per level, is not documented). |  | IW Formats/Ard/Stats.cs:37 |
| 0x29 | 1 | u8 | `speed` | Speed. Section 8: amount added on top of the default row (how it scales, e.g. per level, is not documented). |  | IW Formats/Ard/Stats.cs:38 |
| 0x2A | 1 | u8 | `evadeParry` | Parry evade. Section 8: amount added on top of the default row (how it scales, e.g. per level, is not documented). |  | IW Formats/Ard/Stats.cs:39 |
| 0x2B | 1 | u8 | `defense` | Defense. Section 8: amount added on top of the default row (how it scales, e.g. per level, is not documented). |  | IW Formats/Ard/Stats.cs:40 |
| 0x2C | 1 | u8 | `magickResist` | Magick resist. Section 8: amount added on top of the default row (how it scales, e.g. per level, is not documented). |  | IW Formats/Ard/Stats.cs:41 |
| 0x2D | 1 | u8 | `attackPower` | Attack power (probably unused when the unit takes attack power from its weapon, unit flag 0x15 bit 0; msg 637). Section 8: amount added on top of the default row (how it scales, e.g. per level, is not documented). |  | IW Formats/Ard/Stats.cs:42 |
| 0x2E | 1 | u8 | `evadeWeapon` | Weapon evade (same remark as attackPower). Section 8: amount added on top of the default row (how it scales, e.g. per level, is not documented). |  | IW Formats/Ard/Stats.cs:43 |
| 0x2F | 1 | u8 | `licensePoints` | License points awarded. Section 8: amount added on top of the default row (how it scales, e.g. per level, is not documented). |  | IW Formats/Ard/Stats.cs:44; TK L1010 |
| 0x30 | 4 | u32 | `gil` | Gil awarded. Section 8: amount added on top of the default row (how it scales, e.g. per level, is not documented). |  | IW Formats/Ard/Stats.cs:45; TK L1010 |
| 0x34 | 4 | u32 | `experience` | Experience awarded. Section 8: amount added on top of the default row (how it scales, e.g. per level, is not documented). |  | IW Formats/Ard/Stats.cs:46; TK L1010 |

## Count and size rules

- Each section: 32 + 56 x entryCount, then zero padding to 16 (IW Formats/Ard/Stats.cs:17, 77).
- The two tables have independent counts; a unit may use different row numbers in each.
- Rows are referenced by index from units (section 4) and from the live battle structures (TK L368-L372); do not
  reorder or delete rows.

## Text

No strings.

## Pointers

None inside the rows; only the st2e header and the ARD section table.

## Round-trip rules

- Edit fields in place; rows are fixed-size, so value edits never move data.
- Copy every byte no field interprets (unknown*/unused* fields, unnamed bits) from the original. The Workshop writer seeks over those bytes and therefore writes zeros; do not treat its output as the byte-identical reference.
- Keep the st2e header verbatim except entryCount (and entryListOffset when the table becomes empty or stops being empty).
- Keep the zero padding that rounds the section to a multiple of 16 bytes.
- If this section changes length, rebuild the ARD offset table: every section stored after it moves (recompute their u32 slots, keep 16-byte starts with zero fill, keep section 1 last with nothing after it); if the ARD sits in EBP section 19, the EBP offsets after section 19 move as well.
- Sections 7 and 8 are separate st2e tables; resize and re-pad each one on its own, then fix the ARD offsets after it.
- Do not reorder rows: units refer to them by index.

## Known unknowns

- The 28 unread bytes at 0x04-0x1F of every row.
- How additive values combine with the default row (per level, per story point, or otherwise) - the Toolkit only says "per-level growth applied on top".
- Value caps the engine applies (e.g. MP above 999, msg 375-388) are not encoded here.

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; its licence forbids copying, modifying or converting its code). Paths are relative to that repo: `Formats/Ard/*.cs`, `Formats/St2e.cs`, `Helpers/PackHelper.cs`, `Helpers/BinaryHelper.cs`, `Helpers/EnumHelper.cs`, `Resources/JsonFile.cs`, `Resources/PackFile.cs`, `Program.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. Section 4.16 (L997-L1072) is the ARD editor. |
| Lists | Drop-down lists of The Insurgent's Toolkit. Lists named in `enum` either ship in `editor/data/lists.json` or are copied into this spec's `enums` block (the `Arde*` lists). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
