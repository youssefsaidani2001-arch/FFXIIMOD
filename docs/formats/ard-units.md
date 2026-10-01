# ARD section 4 - Units (foe encounters)

Spec id: `ard-units` · machine spec: [`ard-units.json`](./ard-units.json)

ARD **section 4** holds the *units*: one row per kind of foe encounter placed in the area. A unit chooses a
class (species, section 2), a default and an additive stats row (sections 7 and 8) and up to four AI scripts
(section 3), and carries the encounter-specific values: name, size, weapon, initial HP, drops, steals, poaches,
monograph and canopic-jar drops (TK L1016-L1044, L1688-L1693). The area's event script (EBP) decides which unit
row spawns where (TK L1111). The Workshop maps `section_004.bin` here (IW Resources/JsonFile.cs:71).

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
  This section's offset is the `u32` at **ARD+0x18** (slot 4).
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

Section 4 is a plain st2e table (no magic of its own beyond `st2e`); see
[`container-st2e.md`](./container-st2e.md). In short: `st2e` magic, `u32 entryCount` at 0x04, `u16 entrySize`
at 0x08 (**88** here, IW Formats/Ard/Units.cs:18),
2 unread bytes, `u32 entryListOffset` at 0x0C (0x20, or 0 for an empty table, IW Formats/St2e.cs:39), then four
`u32` words that are 0 in every table the Workshop writes (IW Formats/St2e.cs:29-32, 40-43). Rows follow back to
back from 0x20; after the last row the section is zero-padded to a multiple of 16 (IW Helpers/BinaryHelper.cs:12-33).
All offsets inside the section are relative to the section start, so moving the section inside the ARD never
changes them.

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…`/`unused…` are not interpreted by any source; keep their original bytes.

### Record `header` — 32 bytes (0x20), count: 1

*Where:* Offset 0 of ARD section 4 (ARD start + u32 at ARD+0x18).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `magic` | ASCII 'st2e' (73 74 32 65); reject the section if different. |  | IW Formats/St2e.cs:9,20-23 |
| 0x04 | 4 | u32 | `entryCount` | Number of unit rows in this area. |  | IW Formats/St2e.cs:25 |
| 0x08 | 2 | u16 | `entrySize` | Bytes per row; always 88 (0x58) for this table. |  | IW Formats/St2e.cs:26 |
| 0x0A | 2 | bytes | `unknown0A` | Not read by any source; keep as found. |  | IW Formats/St2e.cs:27 |
| 0x0C | 4 | u32 | `entryListOffset` | Section-relative offset of row 0: 32 when entryCount > 0, otherwise 0. |  | IW Formats/St2e.cs:12,28,39 |
| 0x10 | 4 | u32 | `offset10` | Unknown offset word; 0 in Workshop output. |  | IW Formats/St2e.cs:29,40 |
| 0x14 | 4 | u32 | `textSectionOffset` | Named text-section offset; 0 on disk (the Toolkit clears it on export). No strings are stored in ARD tables. |  | IW Formats/St2e.cs:30,41; TK L262 |
| 0x18 | 4 | u32 | `offset18` | Unknown offset word; 0 in Workshop output. |  | IW Formats/St2e.cs:31,42 |
| 0x1C | 4 | u32 | `offset1C` | Unknown offset word; 0 in Workshop output. |  | IW Formats/St2e.cs:32,43 |

### Record `unit` — 88 bytes (0x58), count: header.entryCount

*Where:* st2e rows of ARD section 4: section offset header.entryListOffset + i*88

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `classLink` | Row index into section 2 (classes) of the same ARD. |  | IW Formats/Ard/Units.cs:31; TK L1023 |
| 0x02 | 1 | u8 | `nameVariationGroup` | Group identifier (Toolkit: "Name Variation Group Identifier"). The Workshop accepts only 0-127 or 255. |  | IW Formats/Ard/Units.cs:32,184-186; TK L1024 |
| 0x03 | 1 | bf8 | `flags03` | Flag byte 1. | bits below | IW Formats/Ard/Units.cs:33-36,97-99,283-285; TK L1025 |
| 0x04 | 4 | bytes | `unknown04` | Not read. |  | IW Formats/Ard/Units.cs:37,108 |
| 0x08 | 2 | u16 | `name` | Name text id (character/foe name block, 16384+). | `DescNameList` | IW Formats/Ard/Units.cs:38; TK L1026, L1533 |
| 0x0A | 2 | u16 | `sizeX` | Scale on X in percent (Toolkit: "Size %"; makes giant or tiny foes). |  | IW Formats/Ard/Units.cs:39; TK L1027 |
| 0x0C | 2 | u16 | `sizeY` | Scale on Y in percent. |  | IW Formats/Ard/Units.cs:40; TK L1027 |
| 0x0E | 2 | u16 | `sizeZ` | Scale on Z in percent. |  | IW Formats/Ard/Units.cs:41; TK L1027 |
| 0x10 | 1 | u8 | `unknown10` | Not read. |  | IW Formats/Ard/Units.cs:42 |
| 0x11 | 1 | u8 | `modelVariation` | Model variation index. |  | IW Formats/Ard/Units.cs:43; TK L1028 |
| 0x12 | 1 | u8 | `modelColorVariation` | Model colour variation index. |  | IW Formats/Ard/Units.cs:44; TK L1028 |
| 0x13 | 1 | u8 | `forcedWeaponStanceAnimation` | Weapon stance animation forced on the unit (255 = none). | `WeaponStanceAnimationList` | IW Formats/Ard/Units.cs:45; TK L1029, L1653 |
| 0x14 | 1 | u8 | `unknown14` | Not read. |  | IW Formats/Ard/Units.cs:46 |
| 0x15 | 1 | bf8 | `flags15` | Flag byte 2. Toolkit names are matched to the Workshop bits by position. | bits below | IW Formats/Ard/Units.cs:47-52,100-104; TK L1030, L1841 |
| 0x16 | 2 | u16 | `weapon` | Equipped weapon (equipment reference; whether it is a battlepack section 13 row or a 0x1000-block content id is not stated by our sources). |  | IW Formats/Ard/Units.cs:53; TK L1031; msg 637 |
| 0x18 | 4 | u32 | `customInitialHp` | Initial HP override for this encounter. |  | IW Formats/Ard/Units.cs:54; TK L1032, L1690 |
| 0x1C | 2 | u16 | `offhand` | Equipped off-hand (same encoding as weapon). |  | IW Formats/Ard/Units.cs:55; TK L1033 |
| 0x1E | 4 | bytes | `unknown1E` | Not read. |  | IW Formats/Ard/Units.cs:56,122 |
| 0x22 | 2 | u16 | `defaultStatsLink` | Row index into section 7 (default stats). |  | IW Formats/Ard/Units.cs:57; TK L1034 |
| 0x24 | 2 | u16 | `additiveStatsLink` | Row index into section 8 (additive / per-level stats). |  | IW Formats/Ard/Units.cs:58; TK L1035 |
| 0x26 | 2 | s16 | `unknown26` | Unnamed signed value; the Toolkit relates it to the charseinfo_?.bin files (unconfirmed). |  | IW Formats/Ard/Units.cs:59; TK L1036 |
| 0x28 | 2 | u16 | `commonDrop` | Common drop: content id (category << 12 \| index; loot is the 0x2000 block); 65535 = none. | `ContAllList` | IW Formats/Ard/Units.cs:60; TK L1037, L1755 |
| 0x2A | 2 | u16 | `uncommonDrop` | Uncommon drop: content id (category << 12 \| index; loot is the 0x2000 block); 65535 = none. | `ContAllList` | IW Formats/Ard/Units.cs:61; TK L1037, L1755 |
| 0x2C | 2 | u16 | `rareDrop` | Rare drop: content id (category << 12 \| index; loot is the 0x2000 block); 65535 = none. | `ContAllList` | IW Formats/Ard/Units.cs:62; TK L1037, L1755 |
| 0x2E | 2 | u16 | `veryRareDrop` | Very rare drop: content id (category << 12 \| index; loot is the 0x2000 block); 65535 = none. | `ContAllList` | IW Formats/Ard/Units.cs:63; TK L1037, L1755 |
| 0x30 | 2 | u16 | `guaranteedDrop` | Guaranteed drop: content id (category << 12 \| index; loot is the 0x2000 block); 65535 = none. | `ContAllList` | IW Formats/Ard/Units.cs:64; TK L1037, L1755 |
| 0x32 | 2 | u16 | `commonSteal` | Common steal: content id. | `ContAllList` | IW Formats/Ard/Units.cs:65; TK L1038 |
| 0x34 | 2 | u16 | `uncommonSteal` | Uncommon steal: content id. | `ContAllList` | IW Formats/Ard/Units.cs:66; TK L1038 |
| 0x36 | 2 | u16 | `rareSteal` | Rare steal: content id. | `ContAllList` | IW Formats/Ard/Units.cs:67; TK L1038 |
| 0x38 | 4 | s32 | `firstOverlayModel` | First overlay model (extra model attached to the unit). | `ModelList` | IW Formats/Ard/Units.cs:68; TK L1039 |
| 0x3C | 4 | s32 | `secondOverlayModel` | Second overlay model. | `ModelList` | IW Formats/Ard/Units.cs:69; TK L1039 |
| 0x40 | 1 | u8 | `unknown40` | Read as a number by the Workshop but unnamed. |  | IW Formats/Ard/Units.cs:70 |
| 0x41 | 1 | u8 | `unknown41` | Read as a number by the Workshop but unnamed. |  | IW Formats/Ard/Units.cs:71 |
| 0x42 | 1 | u8 | `monographRate` | Chance of the monograph drop. |  | IW Formats/Ard/Units.cs:72; TK L1040 |
| 0x43 | 1 | u8 | `canopicJarRate` | Chance of the canopic jar drop. |  | IW Formats/Ard/Units.cs:73; TK L1040 |
| 0x44 | 2 | u16 | `commonPoach` | Common poach: content id. | `ContAllList` | IW Formats/Ard/Units.cs:74; TK L1041 |
| 0x46 | 2 | u16 | `uncommonPoach` | Uncommon poach: content id. | `ContAllList` | IW Formats/Ard/Units.cs:75; TK L1041 |
| 0x48 | 2 | u16 | `monographType` | Which monograph enables the monograph drop (content id). | `ContAllList` | IW Formats/Ard/Units.cs:76; TK L1042 |
| 0x4A | 2 | u16 | `monographDrop` | Item dropped when the monograph condition holds (content id). | `ContAllList` | IW Formats/Ard/Units.cs:77; TK L1042 |
| 0x4C | 2 | u16 | `canopicJarType` | Which canopic jar enables the jar drop (content id). | `ContAllList` | IW Formats/Ard/Units.cs:78; TK L1043 |
| 0x4E | 2 | u16 | `canopicJarDrop` | Item dropped when the canopic jar condition holds (content id). | `ContAllList` | IW Formats/Ard/Units.cs:79; TK L1043 |
| 0x50 | 2 | u16 | `aiScriptLink0` | AI slot 0: script index into section 3. |  | IW Formats/Ard/Units.cs:80; TK L1044, L1693; msg 610 |
| 0x52 | 2 | u16 | `aiScriptLink1` | AI slot 1: script index into section 3. |  | IW Formats/Ard/Units.cs:81; TK L1044, L1693; msg 610 |
| 0x54 | 2 | u16 | `aiScriptLink2` | AI slot 2: script index into section 3. |  | IW Formats/Ard/Units.cs:82; TK L1044, L1693; msg 610 |
| 0x56 | 2 | u16 | `aiScriptLink3` | AI slot 3: script index into section 3. |  | IW Formats/Ard/Units.cs:83; TK L1044, L1693; msg 610 |

#### Bits of `unit.flags03` (bf8 at 0x03; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 0-1 | 0x03 | `healthBarType` | custom health bar style (Workshop: 0-3, name marked uncertain); enum `ArdeCustomHealthBarTypeList` |
| 2-3 | 0x0C | `unknownBits2to3` | not read |
| 4 | 0x10 | `isHunt` | Workshop: "is hunt?" (uncertain). The Toolkit lists a 1-bit "Red Dot Size Type" (0 Small, 1 Big) in this byte, most likely this bit |
| 5 | 0x20 | `isBoss` | Workshop: "is boss?" (uncertain); Toolkit: "Is Boss?" |
| 6-7 | 0xC0 | `unknownBits6to7` | not read |

#### Bits of `unit.flags15` (bf8 at 0x15; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 0 | 0x01 | `useWeaponAttackAndEvade` | attack power and evade come from the equipped weapon instead of the stats row (Toolkit: "Use Weapon Stats"; msg 637, 642) |
| 1 | 0x02 | `hasShield` | shield (off-hand) stats are used (Toolkit: "Use Shield Stats") |
| 2 | 0x04 | `hasCustomHealthBar` | boss-style health bar instead of the floating one (Toolkit: "No Floating Health Bar") |
| 3 | 0x08 | `noTargetLine` | Workshop: unknown flag 0; Toolkit: "No Target Line" |
| 4 | 0x10 | `noActionCategoryTargetLine` | Workshop: unknown flag 1; Toolkit: "No Action-Category-Specific Target Line", marked ineffectual |
| 5-7 | 0xE0 | `unknownBits5to7` | not read |

## Enums carried in the JSON spec

Flag enums list the mask value of each bit. Fields that point at bigger lists (text ids, content ids, animations, formulas …) name a list from `editor/data/lists.json` instead (see *External lists*).

#### `ArdeCustomHealthBarTypeList` (Lists: ArdeCustomHealthBarTypeList (Toolkit ARD editor list, not in editor/data/lists.json))

| Value | Label |
|---|---|
| 0 (0x0) | None |
| 1 (0x1) | 1 Bar |
| 2 (0x2) | Unknown (0x02) |
| 3 (0x3) | 50 Bars |

#### `ArdeRedDotSizeType` (Lists: ArdeRedDotSizeType (Toolkit ARD editor list, not in editor/data/lists.json); for reference: the Toolkit's name for the 1-bit field that is most likely flags03.isHunt)

| Value | Label |
|---|---|
| 0 (0x0) | Small |
| 1 (0x1) | Big |

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `DescNameList` | name text ids 16384+ (TK L1533) |
| `WeaponStanceAnimationList` | weapon stance animations, 255 = none (TK L1653) |
| `ContAllList` | content ids, category << 12 \| index (TK L1566-L1590) |
| `ModelList` | model ids, (prefix letter << 16) \| number (TK L940-L952) |

## Count and size rules

- Section size = 32 + 88 x entryCount, then zero padding to 16 (IW Formats/Ard/Units.cs:18, 151).
- Rows are referenced by index from the area's EBP spawn tables (TK L1111) and from the live battle structures
  (TK L360); never reorder or delete rows. Appending is structurally fine but only useful if a script spawns it.

## Links

| Field | Points to |
|---|---|
| `classLink` | section 2 row ([`ard-classes`](./ard-classes.md)) |
| `defaultStatsLink` / `additiveStatsLink` | section 7 / section 8 row ([`ard-stats`](./ard-stats.md)) |
| `aiScriptLink0..3` | section 3 script index ([`ard-aiscripts`](./ard-aiscripts.md)) |
| `name` | text id in the 16384+ name block (`DescNameList`) |
| drops / steals / poaches / monograph / canopic jar | content ids (`ContAllList`; items 0x0000, equipment 0x1000, loot 0x2000, key items 0x8000 ..., TK L1566-L1590) |
| `firstOverlayModel`, `secondOverlayModel` | model ids (`ModelList`) |

## Text

No strings. `name` is a text id; changing the displayed name means editing the text file, not this row.

## Pointers

None inside the rows; only the st2e header and the ARD section table.

## Round-trip rules

- Edit fields in place; rows are fixed-size, so value edits never move data.
- Copy every byte no field interprets (unknown*/unused* fields, unnamed bits) from the original. The Workshop writer seeks over those bytes and therefore writes zeros; do not treat its output as the byte-identical reference.
- Keep the st2e header verbatim except entryCount (and entryListOffset when the table becomes empty or stops being empty).
- Keep the zero padding that rounds the section to a multiple of 16 bytes.
- If this section changes length, rebuild the ARD offset table: every section stored after it moves (recompute their u32 slots, keep 16-byte starts with zero fill, keep section 1 last with nothing after it); if the ARD sits in EBP section 19, the EBP offsets after section 19 move as well.
- Do not reorder or delete rows: EBP spawn data and live battle structures reference units by index.
- nameVariationGroup must stay 0-127 or 255; healthBarType is 2 bits (0-3). Write the unread bits of the flag bytes back unchanged.

## Known unknowns

- unknown04 (4 bytes), unknown10, unknown14, unknown1E (4 bytes), unknown26 (charseinfo-related per the Toolkit), unknown40, unknown41.
- Flag bits 0x03 bits 2-3 and 6-7, 0x15 bits 5-7; the Toolkit-to-Workshop name match of 0x03 bit 4 and 0x15 bits 2-4 is by position only.
- Encoding of weapon/offhand (battlepack section 13 row vs content id).
- The content-id reading of drop/steal/poach/monograph/canopic fields follows the Toolkit's content-id lists; it is not spelled out in the Workshop.
- Value used for an unused AI slot, and how the four AI slots are chosen at run time.
- Scale of sizeX/Y/Z (percent per the Toolkit label; 100 presumably = normal) and of the monograph/canopic rates.
- Whether customInitialHp = 0 means "use the stats row".

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; its licence forbids copying, modifying or converting its code). Paths are relative to that repo: `Formats/Ard/*.cs`, `Formats/St2e.cs`, `Helpers/PackHelper.cs`, `Helpers/BinaryHelper.cs`, `Helpers/EnumHelper.cs`, `Resources/JsonFile.cs`, `Resources/PackFile.cs`, `Program.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. Section 4.16 (L997-L1072) is the ARD editor. |
| Lists | Drop-down lists of The Insurgent's Toolkit. Lists named in `enum` either ship in `editor/data/lists.json` or are copied into this spec's `enums` block (the `Arde*` lists). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
