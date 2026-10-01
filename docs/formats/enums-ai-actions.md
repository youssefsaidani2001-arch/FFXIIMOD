# Enumeration - battle-logic (AI) action ids

Spec id: `enums-ai-actions` · machine spec: [`enums-ai-actions.json`](./enums-ai-actions.json)

The `action` word of an ARD AI entry (ARD section 3, [`ard-aiscripts-sheet`](./ard-aiscripts-sheet.md)) is one of
1729 ids from four blocks. The labels are the Toolkit's `BattleLogicActionList` (Lists: BattleLogicActionList,
TK L1643), with the action-package block relabelled from the *Foe Actions* sheet (826 packages). The sheet *Vanilla AI
Scripts* uses the same ids (its "Data" tab lists them from 0 Cure, GS:AI Data!A-B).

## Bit view

### Record `actionId` - 2 bytes (0x2), count: one per field that holds a battle-logic action id

*Where:* Any u16 typed as a battle-logic action: ARD section 3 aiEntry.action (ard-aiscripts, ard-aiscripts-sheet).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | bf16 | `actionId` | Battle-logic action id. | bits below | Lists: BattleLogicActionList |

#### Bits of `actionId.actionId` (bf16 at 0x00; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum | Source |
|---|---|---|---|---|
| 0-13 | 0x3FFF | `index` | Index inside the kind: section 14 row, AI command number, or section 10 package number. | Lists: BattleLogicActionList |
| 14-15 | 0xC000 | `kind` | 0 battle action, 1 AI command, 2 action package, 3 none (only 0xFFFF). (enum `AiActionKind`) | Lists: BattleLogicActionList |

## Blocks

| Kind (bits 14-15) | Range | Count | Content | Source |
|---|---|---|---|---|
| 0 | 0x0000-0x021E | 543 | battlepack section 14 action rows (0 Cure ... 255 Stasis, 256 Swarm ..., the tail labelled Reserve) | Lists: BattleLogicActionList; GS:AI Data!A-B |
| 1 | 0x4000-0x4166 | 359 | AI commands, see the table below | Lists: BattleLogicActionList |
| 2 | 0x8000-0x8339 | 826 | "Action Group n" = battlepack section 10 package n | GS:FoeActions Section 10!B; foe-action-packages |
| 3 | 0xFFFF | 1 | none | Lists: BattleLogicActionList |

### AI command ranges

| Range | Commands | Source |
|---|---|---|
| 0x4000-0x4020 | Randomly move around Position 1-33 within (p) meters | Lists: BattleLogicActionList |
| 0x4021-0x4024 | Idle (p) seconds; follow player party leader; move around the target; follow leader within (p) m | Lists: BattleLogicActionList |
| 0x4025-0x4035 | Follow a named party member / guest within (p) meters (0x4025 unused) | Lists: BattleLogicActionList |
| 0x4036-0x4045 | Unused | Lists: BattleLogicActionList |
| 0x4046-0x4047 | Engage / disengage the party-leader role | Lists: BattleLogicActionList |
| 0x4048-0x404F | Switch to group 0-7 | Lists: BattleLogicActionList |
| 0x4050-0x4070 | Remove all status effects; add status effect (KO ... X-Zone, status bit order) | Lists: BattleLogicActionList |
| 0x4071-0x4090 | Remove status effect (same order) | Lists: BattleLogicActionList |
| 0x4091-0x40D1 | Remove all augments; add augment (augment bit order) | Lists: BattleLogicActionList |
| 0x40D2-0x4111 | Remove augment (same order) | Lists: BattleLogicActionList |
| 0x4112-0x4115 | (p)% chance to jump to battle-logic link 0-3 (the unit's four AI script slots) | Lists: BattleLogicActionList |
| 0x4116-0x4121 | (p)% chance to jump to group 0-11 | Lists: BattleLogicActionList |
| 0x4122-0x4123 | Enable / disable battle memory flag (p) | Lists: BattleLogicActionList |
| 0x4124-0x4138 | Follow party leader; random move 20 m; turn to (p) degrees; turn towards leader / a named character | Lists: BattleLogicActionList |
| 0x4139-0x4148 | Enable / disable a magick field (HP Sap, MP Sap, No Attacks, No Magicks, No Technicks, No Items, Magnet) | Lists: BattleLogicActionList |
| 0x4149-0x4157 | Flag (t) = (p); follow leader within (p) m; (p)% turn towards target; turns; model effect; flag +, \|\|, && | Lists: BattleLogicActionList |
| 0x4158-0x4162 | Stat = stat + (p) (Strength, Magick Power, Vitality, Speed, Evade, Defense, Magick Resist, Attack, weapon/shield evades) | Lists: BattleLogicActionList |
| 0x4163-0x4166 | Enmity = 1; Enmity + (p); collect the closest loot; show combat log (p+93) | Lists: BattleLogicActionList |

`(p)` is the entry's actionParameter; `(t)` in the flag commands is presumably the variable named by the case 1
target type (see gaps). Vanilla examples: 0x4118 "(p)% chance to jump to group 2", 0x4021 "Idle for (p) seconds",
0x4104 "Remove Augment: Double-Edged" (GS:AI 3:AI Scripts!G3:H12).

## Enums carried in the JSON spec

#### `AiActionKind`

| Value | Label |
|---|---|
| 0 (0x0) | Battle action (battlepack section 14 row, 0x0000-0x021E) |
| 1 (0x1) | AI command (0x4000-0x4166) |
| 2 (0x2) | Action package (battlepack section 10, 0x8000 + package) |
| 3 (0x3) | None (0xFFFF only) |

#### `BattleLogicActionList` - 1729 values (first 40 shown)

| Value | Label |
|---|---|
| 0 (0x0) | Cure |
| 1 (0x1) | Blindna |
| 2 (0x2) | Vox |
| 3 (0x3) | Poisona |
| 4 (0x4) | Cura |
| 5 (0x5) | Raise |
| 6 (0x6) | Curaga |
| 7 (0x7) | Stona |
| 8 (0x8) | Regen |
| 9 (0x9) | Cleanse |
| 10 (0xA) | Esuna |
| 11 (0xB) | Curaja |
| 12 (0xC) | Dispel |
| 13 (0xD) | Dispelga |
| 14 (0xE) | Renew |
| 15 (0xF) | Arise |
| 16 (0x10) | Esunaga |
| 17 (0x11) | Holy |
| 18 (0x12) | Fire |
| 19 (0x13) | Thunder |
| 20 (0x14) | Blizzard |
| 21 (0x15) | Aqua |
| 22 (0x16) | Aero |
| 23 (0x17) | Fira |
| 24 (0x18) | Thundara |
| 25 (0x19) | Blizzara |
| 26 (0x1A) | Bio |
| 27 (0x1B) | Aeroga |
| 28 (0x1C) | Firaga |
| 29 (0x1D) | Thundaga |
| 30 (0x1E) | Blizzaga |
| 31 (0x1F) | Shock |
| 32 (0x20) | Scourge |
| 33 (0x21) | Flare |
| 34 (0x22) | Ardor |
| 35 (0x23) | Scathe |
| 36 (0x24) | Haste |
| 37 (0x25) | Float |
| 38 (0x26) | Hastega |
| 39 (0x27) | Slow |
| ... | 1689 more values in the JSON spec |

## Round-trip rules

- Store the id as a plain u16; the kind bits are a reading aid, not separate fields in the game data.
- Ids 0x8000 + n follow battlepack section 10 package numbers: never renumber packages that ARD entries call.
- Ids of unused / Reserve labels exist in the list but are not known to work; avoid them in new AI.

## Known unknowns

- The Toolkit list ends the action-group block at 0x8338 with the label "Action Group 825" and has no 0x8339; the Foe Actions sheet shows 826 packages (0-825), so this enum relabels 0x8338 as 824 and adds 0x8339 = 825.
- Whether every section 14 row (0x0000-0x021E) works as a foe action; rows labelled Reserve are unknown.
- Meaning of "(t)" in the flag commands (0x4149, 0x4155-0x4157): presumably the variable selected by the case 1 target type.
- The sheet and the Toolkit disagree on 0x414B ("turn towards party leader" vs "turn towards target").

## Source keys

| Key | Source |
|---|---|
| GS:AI `<tab>!<column>` / row n | Google Sheet *Vanilla AI Scripts* (Drive id `1BEXZsbvK0Ey5Yl5WpI58Es4nEXNnI3PSd0_Asi5DE48`), tabs "3:AI Scripts" (A1:Y50052), "Action Packages" (A1:AM828), "Data" (A1:F1729). Read through the Google Drive connector, which returns a column summary plus the first rows of each tab, not every row (see Known unknowns). Row numbers are sheet rows (row 1 = first header row). |
| GS:FoeActions `<tab>!<column>` / row n | Google Sheet *Foe Actions* (Drive id `1FeMWCdnrlqL-ZCuUz0xCOPxbY4lNh08TVknjQCmn-dw`), tabs "Section 10" (A1:AQ827), "Enemy Action Counts" (A1:E172). Read through the Google Drive connector, which returns a column summary plus the first rows of each tab, not every row (see Known unknowns). Row numbers are sheet rows (row 1 = first header row). |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| Lists: `<name>` | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json`. |
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (fact reference only; its licence forbids copying or converting its code). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
