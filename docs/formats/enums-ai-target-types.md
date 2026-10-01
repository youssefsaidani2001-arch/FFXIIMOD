# Enumeration - battle-logic target types

Spec id: `enums-ai-target-types` · machine spec: [`enums-ai-target-types.json`](./enums-ai-target-types.json)

The target-type word of an AI case says **who or what** the case tests. Values 0-10 are actor kinds; higher values
(block in the top nibble) name script variables and flags, used together with the variable conditions (class 27) and
the flag commands of [`enums-ai-actions`](./enums-ai-actions.md). Labels: `BattleLogicTargetTypeList` (TK L1644), 1660
values; the AI sheet uses the same numbers (GS:AI 3:AI Scripts!K, P, U; Data!E-F: 0 None, 1 Foe, 2 Ally, 3 Leader,
4 Self ... ).

## Bit view

### Record `targetTypeId` - 2 bytes (0x2), count: one per field that holds a battle-logic target type

*Where:* ARD section 3 caseNTargetType (u16); battlepack section 7 caseNTargetType (u8, actors 0-10 only).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | bf16 | `targetTypeId` | Battle-logic target type. | bits below | Lists: BattleLogicTargetTypeList |

#### Bits of `targetTypeId.targetTypeId` (bf16 at 0x00; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum | Source |
|---|---|---|---|---|
| 0-11 | 0x0FFF | `index` | Actor kind (block 0) or variable / flag number. | Lists: BattleLogicTargetTypeList |
| 12-15 | 0xF000 | `block` | 0 actors, 1-10 variable and flag banks. (enum `AiTargetTypeBlock`) | Lists: BattleLogicTargetTypeList |

## Blocks

| Block | Range | Count | Content |
|---|---|---|---|
| 0 | 0x0000-0x0FFF | 11 | Actors (0 None, 1 Foe, 2 Ally, 3 Leader, 4 Self, 5 Same Group, 6 Ally excl. self, 7 Same Group excl. self, 8 Different Group, 9 Current, 10 Auto) |
| 1 | 0x1000-0x1FFF | 64 | Scratch1 variables 0-63 |
| 2 | 0x2000-0x2FFF | 32 | Scratch2 variables 0-31 |
| 3 | 0x3000-0x3FFF | 256 | Global flags 0-255 |
| 4 | 0x4000-0x4FFF | 256 | Quest progress 0-255 |
| 5 | 0x5000-0x5FFF | 256 | Quest conclusion 0-255 |
| 6 | 0x6000-0x6FFF | 256 | Quest stage 0-255 |
| 7 | 0x7000-0x7FFF | 256 | Quest location 0-255 |
| 8 | 0x8000-0x8FFF | 256 | Map icon flags 0-255 |
| 9 | 0x9000-0x9FFF | 16 | Battle logic flags 0-15 |
| 10 | 0xA000-0xAFFF | 1 | Caster battle memory flags (0xA000 only) |

Source: Lists: BattleLogicTargetTypeList.

### Actor kinds - sheet vs Toolkit labels

| Value | Toolkit | Vanilla AI Scripts sheet |
|---|---|---|
| 0 | None | None |
| 1 | Foe | Foe |
| 2 | Ally | Ally |
| 3 | Leader | Leader |
| 4 | Self | Self |
| 5 | Same Group | Same Group |
| 6 | Ally (excl. Self) | Ally (excl. Self) |
| 7 | Same Group (excl. Self) | Same Group (excl. Self) |
| 8 | Different Group | Different Group |
| 9 | Current | Attacker |
| 10 | Auto | Future Attacker? |

Source: Lists: BattleLogicTargetTypeList; GS:AI Data!E2:F12.

## Enums carried in the JSON spec

#### `AiTargetTypeBlock`

| Value | Label |
|---|---|
| 0 | Actors (0 None, 1 Foe, 2 Ally, 3 Leader, 4 Self, 5 Same Group, 6 Ally excl. self, 7 Same Group excl. self, 8 Different Group, 9 Current, 10 Auto) |
| 1 | Scratch1 variables 0-63 |
| 2 | Scratch2 variables 0-31 |
| 3 | Global flags 0-255 |
| 4 | Quest progress 0-255 |
| 5 | Quest conclusion 0-255 |
| 6 | Quest stage 0-255 |
| 7 | Quest location 0-255 |
| 8 | Map icon flags 0-255 |
| 9 | Battle logic flags 0-15 |
| 10 | Caster battle memory flags (0xA000 only) |

#### `BattleLogicTargetTypeList` - 1660 values (first 20 shown)

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
| 4096 (0x1000) | Scratch1 Variable 0 |
| 4097 (0x1001) | Scratch1 Variable 1 |
| 4098 (0x1002) | Scratch1 Variable 2 |
| 4099 (0x1003) | Scratch1 Variable 3 |
| 4100 (0x1004) | Scratch1 Variable 4 |
| 4101 (0x1005) | Scratch1 Variable 5 |
| 4102 (0x1006) | Scratch1 Variable 6 |
| 4103 (0x1007) | Scratch1 Variable 7 |
| 4104 (0x1008) | Scratch1 Variable 8 |
| ... | 1640 more values in the JSON spec |

## Round-trip rules

- Store as a plain u16 in ARD entries; gambit rows (battlepack section 7) store only a u8 and therefore only the actor block 0-10.
- Variable/flag blocks are meaningful with variable conditions and flag commands (Flag (t) == (p), Flag (t) = (p)); keep the case's condition consistent with the block.

## Known unknowns

- Labels of actor kinds 9 and 10 differ: "Current" / "Auto" (Toolkit) vs "Attacker" / "Future Attacker?" (Vanilla AI Scripts sheet, Data!F).
- Which runtime arrays the scratch and quest blocks map to is not stated in our sources.
- Whether indices beyond the labelled ranges (e.g. scratch1 64+) are valid.

## Source keys

| Key | Source |
|---|---|
| GS:AI `<tab>!<column>` / row n | Google Sheet *Vanilla AI Scripts* (Drive id `1BEXZsbvK0Ey5Yl5WpI58Es4nEXNnI3PSd0_Asi5DE48`), tabs "3:AI Scripts" (A1:Y50052), "Action Packages" (A1:AM828), "Data" (A1:F1729). Read through the Google Drive connector, which returns a column summary plus the first rows of each tab, not every row (see Known unknowns). Row numbers are sheet rows (row 1 = first header row). |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| Lists: `<name>` | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json`. |
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (fact reference only; its licence forbids copying or converting its code). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
