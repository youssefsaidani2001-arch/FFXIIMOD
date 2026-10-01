# Enumeration - battle-logic target condition ids

Spec id: `enums-ai-conditions` · machine spec: [`enums-ai-conditions.json`](./enums-ai-conditions.json)

Every AI case and every gambit target tests one **condition id** (u16). The Toolkit list
`BattleLogicTargetConditionList` labels 2038 of them (TK L1642); the ARD AI sheet uses the same ids (GS:AI
3:AI Scripts!M, R, W; Data!C-D). The ids are structured: the low byte is an operand, bit 8 inverts the test, and the
top 7 bits pick the condition family. Example: 0x2032 "Augment == Double-Edged" (class 16, operand 0x32 = augment
50), 0x2311 "Spawn Position is NOT within (p) meters" (class 17 inverted, operand 0x11), 0x2F00 "Current HP < 100%"
(class 23 inverted) (GS:AI 3:AI Scripts!M3:N12).

## Bit view

### Record `conditionId` - 2 bytes (0x2), count: one per field that holds a battle-logic condition id

*Where:* Any u16 typed as a battle-logic target condition: ARD section 3 caseNTargetCondition, battlepack section 7 caseNTargetCondition.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | bf16 | `conditionId` | Battle-logic target condition id. | bits below | Lists: BattleLogicTargetConditionList |

#### Bits of `conditionId.conditionId` (bf16 at 0x00; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum | Source |
|---|---|---|---|---|
| 0-7 | 0x00FF | `operand` | Which status, genus, element, member, position slot, threshold step ... the class tests. | Lists: BattleLogicTargetConditionList |
| 8 | 0x0100 | `invert` | 0 = positive test (==, >=, highest, within), 1 = the opposite (!=, <, lowest, NOT within). | Lists: BattleLogicTargetConditionList |
| 9-15 | 0xFE00 | `conditionClass` | Condition family (classes 0-34). (enum `AiConditionClass`) | Lists: BattleLogicTargetConditionList |

## Classes

| Class | Ids | Positive / inverted labels | Family |
|---|---|---|---|
| 0 | 0x0000-0x01FF | 1 / 0 | Unconditional |
| 1 | 0x0200-0x03FF | 18 / 18 | Highest / Lowest stat (operand = stat: 0 Attack Power, 1 Defense, 3 Magick Resist, 4 Current HP, 5 Current MP, 6 Level, 7 distance, 8 attacker count, 9 Max HP ...) |
| 2 | 0x0400-0x05FF | 1 / 0 | Unused (0x0400) |
| 3 | 0x0600-0x07FF | 32 / 32 | Status effect == / != (operand = status bit 0-31) |
| 4 | 0x0800-0x09FF | 16 / 16 | Classification == / != |
| 5 | 0x0A00-0x0BFF | 64 / 64 | Genus == / != |
| 6 | 0x0C00-0x0DFF | 256 / 256 | BattleUnitWork[0x52] == / != value |
| 7 | 0x0E00-0x0FFF | 10 / 10 | Current HP >= / < percent (90 % .. 0 %) |
| 8 | 0x1000-0x11FF | 8 / 8 | Max HP >= / < threshold |
| 9 | 0x1200-0x13FF | 1 / 0 | Unused (0x1200) |
| 10 | 0x1400-0x15FF | 8 / 8 | Weak to element == / != |
| 11 | 0x1600-0x17FF | 8 / 8 | Absorbs element == / != |
| 12 | 0x1800-0x19FF | 40 / 40 | Party member == / != |
| 13 | 0x1A00-0x1BFF | 6 / 1 | Equipped == / != (weapon, shield ...) |
| 14 | 0x1C00-0x1DFF | 23 / 23 | Weapon type == / != |
| 15 | 0x1E00-0x1FFF | 1 / 0 | Unused (0x1E00) |
| 16 | 0x2000-0x21FF | 128 / 128 | Augment == / != |
| 17 | 0x2200-0x23FF | 33 / 33 | State tests (has party leader, ranged weapon, caster within (p) meters, spawn position, facing ...) / NOT |
| 18 | 0x2400-0x25FF | 256 / 256 | Position n is / is NOT within (p) meters |
| 19 | 0x2600-0x27FF | 40 / 40 | Named party member is / is NOT within (p) meters |
| 20 | 0x2800-0x29FF | 10 / 10 | Missing HP >= / < threshold |
| 21 | 0x2A00-0x2BFF | 8 / 8 | Current HP >= / < absolute value |
| 22 | 0x2C00-0x2DFF | 4 / 4 | Current MP >= / < percent (75 % .. 10 %) |
| 23 | 0x2E00-0x2FFF | 2 / 2 | Current HP / MP >= / < 100 % |
| 24 | 0x3000-0x31FF | 3 / 3 | Weather type / Mist == / != (p), Mist >= / < (p) |
| 25 | 0x3200-0x33FF | 1 / 0 | Unused (0x3200) |
| 26 | 0x3400-0x35FF | 1 / 1 | Summon group == / != (p) |
| 27 | 0x3600-0x37FF | 4 / 4 | Flag (t) ==, >= (p); battle memory flag (p) == 1 / 0 |
| 28 | 0x3800-0x39FF | 3 / 3 | Nearest / furthest visible, party leader's target, casting magic / NOT |
| 29 | 0x3A00-0x3BFF | 11 / 11 | (p) or more / fewer than (p) characters, foes ... present |
| 30 | 0x3C00-0x3DFF | 1 / 1 | Group == / != (p) |
| 31 | 0x3E00-0x3FFF | 11 / 11 | Current MP >= / < percent (0 % .. 100 %) |
| 32 | 0x4000-0x41FF | 11 / 1 | Item count >= / < |
| 33 | 0x4200-0x43FF | 4 / 4 | Attacker is / is NOT performing the same action (kinds) |
| 34 | 0x4400-0x45FF | 5 / 5 | Esper duration >= / < |

Source: Lists: BattleLogicTargetConditionList (counts per class computed from the list).

## Enums carried in the JSON spec

#### `AiConditionClass`

| Value | Label |
|---|---|
| 0 | Unconditional |
| 1 | Highest / Lowest stat (operand = stat: 0 Attack Power, 1 Defense, 3 Magick Resist, 4 Current HP, 5 Current MP, 6 Level, 7 distance, 8 attacker count, 9 Max HP ...) |
| 2 | Unused (0x0400) |
| 3 | Status effect == / != (operand = status bit 0-31) |
| 4 | Classification == / != |
| 5 | Genus == / != |
| 6 | BattleUnitWork[0x52] == / != value |
| 7 | Current HP >= / < percent (90 % .. 0 %) |
| 8 | Max HP >= / < threshold |
| 9 | Unused (0x1200) |
| 10 | Weak to element == / != |
| 11 | Absorbs element == / != |
| 12 | Party member == / != |
| 13 | Equipped == / != (weapon, shield ...) |
| 14 | Weapon type == / != |
| 15 | Unused (0x1E00) |
| 16 | Augment == / != |
| 17 | State tests (has party leader, ranged weapon, caster within (p) meters, spawn position, facing ...) / NOT |
| 18 | Position n is / is NOT within (p) meters |
| 19 | Named party member is / is NOT within (p) meters |
| 20 | Missing HP >= / < threshold |
| 21 | Current HP >= / < absolute value |
| 22 | Current MP >= / < percent (75 % .. 10 %) |
| 23 | Current HP / MP >= / < 100 % |
| 24 | Weather type / Mist == / != (p), Mist >= / < (p) |
| 25 | Unused (0x3200) |
| 26 | Summon group == / != (p) |
| 27 | Flag (t) ==, >= (p); battle memory flag (p) == 1 / 0 |
| 28 | Nearest / furthest visible, party leader's target, casting magic / NOT |
| 29 | (p) or more / fewer than (p) characters, foes ... present |
| 30 | Group == / != (p) |
| 31 | Current MP >= / < percent (0 % .. 100 %) |
| 32 | Item count >= / < |
| 33 | Attacker is / is NOT performing the same action (kinds) |
| 34 | Esper duration >= / < |

#### `BattleLogicTargetConditionList` - 2038 values (first 40 shown)

| Value | Label |
|---|---|
| 0 (0x0) | Unconditional |
| 512 (0x200) | Highest Attack Power |
| 513 (0x201) | Highest Defense |
| 514 (0x202) | Unused (0x0202) |
| 515 (0x203) | Highest Magick Resist |
| 516 (0x204) | Highest Current HP |
| 517 (0x205) | Highest Current MP |
| 518 (0x206) | Highest Level |
| 519 (0x207) | Furthest |
| 520 (0x208) | Highest Attacker Count |
| 521 (0x209) | Highest Max HP |
| 522 (0x20A) | Highest Max MP |
| 523 (0x20B) | Unused (0x020B) |
| 524 (0x20C) | Highest Strength |
| 525 (0x20D) | Highest Magick Power |
| 526 (0x20E) | Highest Vitality |
| 527 (0x20F) | Highest Speed |
| 528 (0x210) | Unused (0x0210) |
| 529 (0x211) | Highest Enmity |
| 768 (0x300) | Lowest Attack Power |
| 769 (0x301) | Lowest Defense |
| 770 (0x302) | Unused (0x0302) |
| 771 (0x303) | Lowest Magick Resist |
| 772 (0x304) | Lowest Current HP |
| 773 (0x305) | Lowest Current MP |
| 774 (0x306) | Lowest Level |
| 775 (0x307) | Nearest |
| 776 (0x308) | Lowest Attacker Count |
| 777 (0x309) | Lowest Max HP |
| 778 (0x30A) | Lowest Max MP |
| 779 (0x30B) | Unused (0x030B) |
| 780 (0x30C) | Lowest Strength |
| 781 (0x30D) | Lowest Magick Power |
| 782 (0x30E) | Lowest Vitality |
| 783 (0x30F) | Lowest Speed |
| 784 (0x310) | Unused (0x0310) |
| 785 (0x311) | Lowest Enmity |
| 1024 (0x400) | Unused (0x0400) |
| 1536 (0x600) | Status Effect == KO |
| 1537 (0x601) | Status Effect == Stone |
| ... | 1998 more values in the JSON spec |

## Round-trip rules

- Store the id as a plain u16; the bit split is a reading aid.
- Flipping bit 8 turns a test into its opposite; ids whose inverted twin is missing from the list (e.g. class 13 has 6 positive but 1 inverted label) are not known to work.
- The (p) of a condition is the case parameter word next to it; keep it consistent with the condition (meters, percent, group number).

## Known unknowns

- The Toolkit list has 2038 labels; the Toolkit reference speaks of 2,053 (TK L1291). The sheet's Data tab was only readable for its first rows.
- Label conflict: 775 (0x0307) is "Furthest" in the Vanilla AI Scripts sheet but "Nearest" in the Toolkit list (0x0207 = Furthest); the bit structure supports the Toolkit.
- Operand tables of the stat classes (class 1: which operand is which stat beyond those labelled) come only from the labels.
- Classes 2, 9, 15 and 25 are single "Unused" ids.

## Source keys

| Key | Source |
|---|---|
| GS:AI `<tab>!<column>` / row n | Google Sheet *Vanilla AI Scripts* (Drive id `1BEXZsbvK0Ey5Yl5WpI58Es4nEXNnI3PSd0_Asi5DE48`), tabs "3:AI Scripts" (A1:Y50052), "Action Packages" (A1:AM828), "Data" (A1:F1729). Read through the Google Drive connector, which returns a column summary plus the first rows of each tab, not every row (see Known unknowns). Row numbers are sheet rows (row 1 = first header row). |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| Lists: `<name>` | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json`. |
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (fact reference only; its licence forbids copying or converting its code). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
