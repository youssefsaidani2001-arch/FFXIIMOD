# ARD section 2 - Classes (foe species)

Spec id: `ard-classes` · machine spec: [`ard-classes.json`](./ard-classes.json)

ARD **section 2** holds the *classes*: species-level data shared by every unit of that species in the area -
model, classification and genus, weight, movement flags (flying/floating/teleport), aggro detection, chain group,
elemental affinities and bestiary link (TK L1048-L1068). Units (section 4) pick a class by row index
(`classLink`, unit +0x00). The Workshop maps `section_002.bin` here (IW Resources/JsonFile.cs:69).

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
  This section's offset is the `u32` at **ARD+0x10** (slot 2).
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

Section 2 is a plain st2e table (no magic of its own beyond `st2e`); see
[`container-st2e.md`](./container-st2e.md). In short: `st2e` magic, `u32 entryCount` at 0x04, `u16 entrySize`
at 0x08 (**84** here, IW Formats/Ard/Classes.cs:18),
2 unread bytes, `u32 entryListOffset` at 0x0C (0x20, or 0 for an empty table, IW Formats/St2e.cs:39), then four
`u32` words that are 0 in every table the Workshop writes (IW Formats/St2e.cs:29-32, 40-43). Rows follow back to
back from 0x20; after the last row the section is zero-padded to a multiple of 16 (IW Helpers/BinaryHelper.cs:12-33).
All offsets inside the section are relative to the section start, so moving the section inside the ARD never
changes them.

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…`/`unused…` are not interpreted by any source; keep their original bytes.

### Record `header` — 32 bytes (0x20), count: 1

*Where:* Offset 0 of ARD section 2 (ARD start + u32 at ARD+0x10).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `magic` | ASCII 'st2e' (73 74 32 65); reject the section if different. |  | IW Formats/St2e.cs:9,20-23 |
| 0x04 | 4 | u32 | `entryCount` | Number of class rows in this area. |  | IW Formats/St2e.cs:25 |
| 0x08 | 2 | u16 | `entrySize` | Bytes per row; always 84 (0x54) for this table. |  | IW Formats/St2e.cs:26 |
| 0x0A | 2 | bytes | `unknown0A` | Not read by any source; keep as found. |  | IW Formats/St2e.cs:27 |
| 0x0C | 4 | u32 | `entryListOffset` | Section-relative offset of row 0: 32 when entryCount > 0, otherwise 0. |  | IW Formats/St2e.cs:12,28,39 |
| 0x10 | 4 | u32 | `offset10` | Unknown offset word; 0 in Workshop output. |  | IW Formats/St2e.cs:29,40 |
| 0x14 | 4 | u32 | `textSectionOffset` | Named text-section offset; 0 on disk (the Toolkit clears it on export). No strings are stored in ARD tables. |  | IW Formats/St2e.cs:30,41; TK L262 |
| 0x18 | 4 | u32 | `offset18` | Unknown offset word; 0 in Workshop output. |  | IW Formats/St2e.cs:31,42 |
| 0x1C | 4 | u32 | `offset1C` | Unknown offset word; 0 in Workshop output. |  | IW Formats/St2e.cs:32,43 |

### Record `class` — 84 bytes (0x54), count: header.entryCount

*Where:* st2e rows of ARD section 2: section offset header.entryListOffset + i*84

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | s32 | `model` | Model id of the species (prefix letter << 16 \| number). | `ModelList` | IW Formats/Ard/Classes.cs:31; TK L1055 |
| 0x04 | 1 | u8 | `classification` | Foe classification (Hume, Beast, Undead ...; 255 = none). | `ClassificationList` | IW Formats/Ard/Classes.cs:32; TK L1056 |
| 0x05 | 1 | u8 | `genus` | Foe genus (Wolf, Bomb, Flan ...; 255 = none). Effects such as Eksir Berries may key off the genus (msg 598, speculation). | `GenusList` | IW Formats/Ard/Classes.cs:33; TK L1056 |
| 0x06 | 2 | u16 | `unknown06` | Read as a number by the Workshop but unnamed. |  | IW Formats/Ard/Classes.cs:34 |
| 0x08 | 8 | bytes | `unknown08` | Not read. |  | IW Formats/Ard/Classes.cs:35 |
| 0x10 | 2 | s16 | `weight` | Weight; the Toolkit labels it "Weight (x10)", i.e. the stored value is probably ten times the displayed weight. |  | IW Formats/Ard/Classes.cs:36; TK L1057 |
| 0x12 | 1 | bf8 | `flags12` | Flag byte 1. | bits below | IW Formats/Ard/Classes.cs:37-42,84-88,186-188; TK L1058 |
| 0x13 | 5 | bytes | `unknown13` | Not read. |  | IW Formats/Ard/Classes.cs:43 |
| 0x18 | 1 | bf8 | `flags18` | Flag byte 2. | bits below | IW Formats/Ard/Classes.cs:44-48,89-92,234-236; TK L1059 |
| 0x19 | 7 | bytes | `unknown19` | Not read. |  | IW Formats/Ard/Classes.cs:49 |
| 0x20 | 1 | u8 | `maxComboHits` | Maximum number of hits in a combo. |  | IW Formats/Ard/Classes.cs:50; TK L1060 |
| 0x21 | 1 | bf8 | `flags21` | Flag byte 3. | bits below | IW Formats/Ard/Classes.cs:51-52,93; TK L1061 |
| 0x22 | 1 | u8 | `angleDetection` | Sight cone used for aggro. |  | IW Formats/Ard/Classes.cs:53; TK L1062 |
| 0x23 | 1 | u8 | `radiusDetection` | Sight range used for aggro. |  | IW Formats/Ard/Classes.cs:54; TK L1062 |
| 0x24 | 1 | u8 | `unknown24` | Not read. |  | IW Formats/Ard/Classes.cs:55 |
| 0x25 | 1 | u8 | `soundAndMagickDetection` | Detection by sound / magick use (Toolkit: "Magick Detection"). |  | IW Formats/Ard/Classes.cs:56; TK L1063 |
| 0x26 | 1 | u8 | `lifeDetection` | Life detection (Toolkit label; in-game this is the sense that notices weakened targets). |  | IW Formats/Ard/Classes.cs:57; TK L1063 |
| 0x27 | 1 | u8 | `unknown27` | Read as a number by the Workshop but unnamed. |  | IW Formats/Ard/Classes.cs:58 |
| 0x28 | 1 | bf8 | `flags28` | Flag byte 4. | bits below | IW Formats/Ard/Classes.cs:59-61,94-95; TK L1064 |
| 0x29 | 1 | bf8 | `elementAbsorb` | Elements the foe absorbs; one bit per element (see ElementFlags). | bits below | IW Formats/Ard/Classes.cs:62; IW Helpers/EnumHelper.cs:113-125; TK L1065 |
| 0x2A | 1 | bf8 | `elementHalfDamage` | Elements that deal half damage to the foe; one bit per element (see ElementFlags). | bits below | IW Formats/Ard/Classes.cs:63; IW Helpers/EnumHelper.cs:113-125; TK L1065 |
| 0x2B | 1 | bf8 | `elementImmune` | Elements the foe is immune to; one bit per element (see ElementFlags). | bits below | IW Formats/Ard/Classes.cs:64; IW Helpers/EnumHelper.cs:113-125; TK L1065 |
| 0x2C | 1 | bf8 | `elementWeak` | Elements the foe is weak to; one bit per element (see ElementFlags). | bits below | IW Formats/Ard/Classes.cs:65; IW Helpers/EnumHelper.cs:113-125; TK L1065 |
| 0x2D | 1 | bf8 | `elementPotency` | Elements with potency (the foe's own attacks of that element are presumably strengthened); one bit per element (see ElementFlags). | bits below | IW Formats/Ard/Classes.cs:66; IW Helpers/EnumHelper.cs:113-125; TK L1065 |
| 0x2E | 2 | bytes | `unused2E` | Unused pair of bytes before the action array. |  | IW Formats/Ard/Classes.cs:67 |
| 0x30 | 2 | u16 | `unusedAction0` | Action slot 0 of an 8-entry action array that the game never reads (Toolkit marks the block "(Unused)"). |  | IW Formats/Ard/Classes.cs:67; TK L1066, L1842 |
| 0x32 | 2 | u16 | `unusedAction1` | Action slot 1 of an 8-entry action array that the game never reads (Toolkit marks the block "(Unused)"). |  | IW Formats/Ard/Classes.cs:67; TK L1066, L1842 |
| 0x34 | 2 | u16 | `unusedAction2` | Action slot 2 of an 8-entry action array that the game never reads (Toolkit marks the block "(Unused)"). |  | IW Formats/Ard/Classes.cs:67; TK L1066, L1842 |
| 0x36 | 2 | u16 | `unusedAction3` | Action slot 3 of an 8-entry action array that the game never reads (Toolkit marks the block "(Unused)"). |  | IW Formats/Ard/Classes.cs:67; TK L1066, L1842 |
| 0x38 | 2 | u16 | `unusedAction4` | Action slot 4 of an 8-entry action array that the game never reads (Toolkit marks the block "(Unused)"). |  | IW Formats/Ard/Classes.cs:67; TK L1066, L1842 |
| 0x3A | 2 | u16 | `unusedAction5` | Action slot 5 of an 8-entry action array that the game never reads (Toolkit marks the block "(Unused)"). |  | IW Formats/Ard/Classes.cs:67; TK L1066, L1842 |
| 0x3C | 2 | u16 | `unusedAction6` | Action slot 6 of an 8-entry action array that the game never reads (Toolkit marks the block "(Unused)"). |  | IW Formats/Ard/Classes.cs:67; TK L1066, L1842 |
| 0x3E | 2 | u16 | `unusedAction7` | Action slot 7 of an 8-entry action array that the game never reads (Toolkit marks the block "(Unused)"). |  | IW Formats/Ard/Classes.cs:67; TK L1066, L1842 |
| 0x40 | 2 | u16 | `chainIdentifier` | Chain group of the species (foes sharing it count as the same foe for chaining; inferred from the name). |  | IW Formats/Ard/Classes.cs:68; TK L1067 |
| 0x42 | 16 | bytes | `unknown42` | Not read. |  | IW Formats/Ard/Classes.cs:69 |
| 0x52 | 2 | u16 | `bestiaryIdentifier` | Bestiary entry the species belongs to. | `BestiaryList` | IW Formats/Ard/Classes.cs:70; TK L1068 |

#### Bits of `class.flags12` (bf8 at 0x12; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 0-2 | 0x07 | `chargeAuraAnimationScale` | size of the charge aura effect; the Workshop only accepts 0-4; enum `ArdeChargeAuraAnimationScaleList` |
| 3 | 0x08 | `unknownBit3` | not read |
| 4 | 0x10 | `unknownBit4` | unnamed flag (Workshop: unknown flag 0) |
| 5 | 0x20 | `unknownBit5` | unnamed flag (Workshop: unknown flag 1) |
| 6 | 0x40 | `hasCollision` | collision with other actors is enabled (name-based reading) |
| 7 | 0x80 | `requiresFlyingHit` | Workshop: "has flying info"; Toolkit: "requires flying hit" (presumably only attacks able to reach flying foes connect) |

#### Bits of `class.flags18` (bf8 at 0x18; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 0 | 0x01 | `unknownBit0` | not read |
| 1-3 | 0x0E | `specialBehavior` | Workshop: unknown 3-bit value (0-7); Toolkit: "Special Behavior"; enum `ArdeSpecialBehaviorList` |
| 4 | 0x10 | `isFlying` |  |
| 5 | 0x20 | `isFloating` |  |
| 6 | 0x40 | `canTeleport` | Workshop: "use teleport attack"; Toolkit: "can teleport" |
| 7 | 0x80 | `unknownBit7` | not read |

#### Bits of `class.flags21` (bf8 at 0x21; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 0 | 0x01 | `unknownBit0` | not read |
| 1 | 0x02 | `useDistancedAttack` | attacks from range |
| 2-7 | 0xFC | `unknownBits2to7` | not read |

#### Bits of `class.flags28` (bf8 at 0x28; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 0 | 0x01 | `useGroundedAttack` | Workshop: unknown flag 3; Toolkit: "use grounded attack" |
| 1 | 0x02 | `noChain` | Toolkit: "No Chain", Workshop: "ignore chain" - presumably the foe is left out of the chain count |
| 2-7 | 0xFC | `unknownBits2to7` | not read |

#### Bits of `class.elementAbsorb` (bf8 at 0x29; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 0 | 0x01 | `fire` |  |
| 1 | 0x02 | `lightning` |  |
| 2 | 0x04 | `ice` |  |
| 3 | 0x08 | `earth` |  |
| 4 | 0x10 | `water` |  |
| 5 | 0x20 | `wind` |  |
| 6 | 0x40 | `holy` |  |
| 7 | 0x80 | `dark` |  |

#### Bits of `class.elementHalfDamage` (bf8 at 0x2A; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 0 | 0x01 | `fire` |  |
| 1 | 0x02 | `lightning` |  |
| 2 | 0x04 | `ice` |  |
| 3 | 0x08 | `earth` |  |
| 4 | 0x10 | `water` |  |
| 5 | 0x20 | `wind` |  |
| 6 | 0x40 | `holy` |  |
| 7 | 0x80 | `dark` |  |

#### Bits of `class.elementImmune` (bf8 at 0x2B; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 0 | 0x01 | `fire` |  |
| 1 | 0x02 | `lightning` |  |
| 2 | 0x04 | `ice` |  |
| 3 | 0x08 | `earth` |  |
| 4 | 0x10 | `water` |  |
| 5 | 0x20 | `wind` |  |
| 6 | 0x40 | `holy` |  |
| 7 | 0x80 | `dark` |  |

#### Bits of `class.elementWeak` (bf8 at 0x2C; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 0 | 0x01 | `fire` |  |
| 1 | 0x02 | `lightning` |  |
| 2 | 0x04 | `ice` |  |
| 3 | 0x08 | `earth` |  |
| 4 | 0x10 | `water` |  |
| 5 | 0x20 | `wind` |  |
| 6 | 0x40 | `holy` |  |
| 7 | 0x80 | `dark` |  |

#### Bits of `class.elementPotency` (bf8 at 0x2D; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 0 | 0x01 | `fire` |  |
| 1 | 0x02 | `lightning` |  |
| 2 | 0x04 | `ice` |  |
| 3 | 0x08 | `earth` |  |
| 4 | 0x10 | `water` |  |
| 5 | 0x20 | `wind` |  |
| 6 | 0x40 | `holy` |  |
| 7 | 0x80 | `dark` |  |

## Enums carried in the JSON spec

Flag enums list the mask value of each bit. Fields that point at bigger lists (text ids, content ids, animations, formulas …) name a list from `editor/data/lists.json` instead (see *External lists*).

#### `ElementFlags` (IW Helpers/EnumHelper.cs:113-125)

| Value | Label |
|---|---|
| 1 (0x1) | Fire |
| 2 (0x2) | Lightning |
| 4 (0x4) | Ice |
| 8 (0x8) | Earth |
| 16 (0x10) | Water |
| 32 (0x20) | Wind |
| 64 (0x40) | Holy |
| 128 (0x80) | Dark |

#### `ArdeChargeAuraAnimationScaleList` (Lists: ArdeChargeAuraAnimationScaleList (Toolkit ARD editor list, not in editor/data/lists.json))

| Value | Label |
|---|---|
| 0 (0x0) | Very Low |
| 1 (0x1) | Low |
| 2 (0x2) | Normal |
| 3 (0x3) | High |
| 4 (0x4) | Very High |

#### `ArdeSpecialBehaviorList` (Lists: ArdeSpecialBehaviorList (Toolkit ARD editor list, not in editor/data/lists.json))

| Value | Label |
|---|---|
| 0 (0x0) | None |
| 1 (0x1) | Northern Gravitational Force Attraction |
| 2 (0x2) | Immobilized Action Charge |
| 3 (0x3) | Unknown Gravitational Force Attraction |
| 4 (0x4) | Unknown (0x04) |
| 5 (0x5) | Unknown (0x05) |
| 6 (0x6) | Unknown (0x06) |
| 7 (0x7) | Unknown (0x07) |

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `ModelList` | model ids, (prefix letter << 16) \| number (TK L940-L952) |
| `ClassificationList` | foe classification 0-15, 255 = none (TK L1651) |
| `GenusList` | foe genus 0-63, 255 = none (TK L1649) |
| `BestiaryList` | bestiary entries 0-511 (TK L1647) |

## Count and size rules

- Section size = 32 + 84 x entryCount, then zero padding to 16 (IW Formats/Ard/Classes.cs:18, 126).
- Rows are addressed by index from units (`classLink`), and the Toolkit's live foe structure keeps a pointer to the
  class row (TK L364). Do not reorder or delete rows; append only if you also give units a reason to use them.

## Links

| Field | Points to |
|---|---|
| `model` | model id; probably must be listed in section 1 ([`ard-models`](./ard-models.md)) |
| `classification`, `genus` | names via `DescFoeClassificationList` / `DescFoeGenusList` (text ids 26624+ / 28672+ = 0x6800/0x7000 + value, TK L1538-L1539) |
| `bestiaryIdentifier` | bestiary entry (`BestiaryList`); bestiary text is in `menuhandbook_monster*.dat` (msg 1035) |
| `chainIdentifier` | chain group id (no list available) |

## Text

No strings. Names shown in game come from the units (`name` text id) and from the bestiary files.

## Pointers

None inside the rows; nothing to fix up beyond the st2e header and the ARD section table.

## Round-trip rules

- Edit fields in place; rows are fixed-size, so value edits never move data.
- Copy every byte no field interprets (unknown*/unused* fields, unnamed bits) from the original. The Workshop writer seeks over those bytes and therefore writes zeros; do not treat its output as the byte-identical reference.
- Keep the st2e header verbatim except entryCount (and entryListOffset when the table becomes empty or stops being empty).
- Keep the zero padding that rounds the section to a multiple of 16 bytes.
- If this section changes length, rebuild the ARD offset table: every section stored after it moves (recompute their u32 slots, keep 16-byte starts with zero fill, keep section 1 last with nothing after it); if the ARD sits in EBP section 19, the EBP offsets after section 19 move as well.
- Do not reorder rows: units (section 4, +0x00) and the live battle structures reference them by index.
- chargeAuraAnimationScale must stay within 0-4 and specialBehavior within 0-7 (3 bits); write the other bits of those bytes back unchanged.

## Known unknowns

- unknown06 (u16), unknown27 (u8) and the unread blocks 0x08-0x0F, 0x13-0x17, 0x19-0x1F, 0x24, 0x2E-0x2F, 0x42-0x51.
- Flag bits 0x12 bit 3-5, 0x18 bits 0 and 7, 0x21 bits 0 and 2-7, 0x28 bits 2-7.
- Exact meaning of the Special Behavior values beyond the three named ones, and of charge aura values above 4.
- Units and scale of the detection bytes and of weight (Toolkit says weight is stored x10).
- chainIdentifier semantics and value range (no list in our sources).
- The 8-entry action array at 0x30-0x3F is labelled unused by the Toolkit; whether any build reads it is unknown.

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; its licence forbids copying, modifying or converting its code). Paths are relative to that repo: `Formats/Ard/*.cs`, `Formats/St2e.cs`, `Helpers/PackHelper.cs`, `Helpers/BinaryHelper.cs`, `Helpers/EnumHelper.cs`, `Resources/JsonFile.cs`, `Resources/PackFile.cs`, `Program.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. Section 4.16 (L997-L1072) is the ARD editor. |
| Lists | Drop-down lists of The Insurgent's Toolkit. Lists named in `enum` either ship in `editor/data/lists.json` or are copied into this spec's `enums` block (the `Arde*` lists). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
