# ARD section 3 - AI script entries, as laid out in the *Vanilla AI Scripts* sheet

Spec id: `ard-aiscripts-sheet` · machine spec: [`ard-aiscripts-sheet.json`](./ard-aiscripts-sheet.json)

The *Vanilla AI Scripts* sheet dumps every AI ("battle logic") entry of every vanilla ARD: 50,050 rows
(3:AI Scripts!A3:Y50052), one per 24-byte entry of ARD section 3. This spec maps its columns onto the binary entry
documented in [`ard-aiscripts`](./ard-aiscripts.md), adds the flag-word bits, explains the id spaces, and records where the
sheet's labels differ from the Toolkit lists. The container rules (offset table, 32 group counts per script, padding)
are the same as in `ard-aiscripts` and are repeated in the JSON so the spec can be used on its own.

## Container (summary)

ARD section 3 of a standalone `*.ard` or of the ARD in EBP section 19 (offset = u32 at ARD+0x14). Layout:
`u16 scriptCount, u16 unknown02, u32 scriptOffset[scriptCount + 1]`, then the scripts back to back, each =
32 x `u8` group counts + 24-byte entries (group 0 first), section padded with zeros to 16 (ard-aiscripts; IW
Formats/Ard/AiScripts.cs:26-128). See [`container-ard`](./container-ard.md) for the ARD header.

## Sheet columns and the binary entry

| Sheet column | Header | Content | Binary location |
|---|---|---|---|
| A | ARD | file the entry belongs to (asp_b, bds_a ...) | not stored |
| B | Key | `<ard>_<script>_<group>_<entry>` | not stored |
| C | Unit(s) | names of the units whose AI slots point at this script | derived from section 4 aiScriptLink0..3 |
| D | Script | script index in section 3 | position in the scriptOffset table |
| E | Group | group 0-31 | position in groupCounts |
| F | Entry | entry number inside the group | position |
| G / H | Action ID / Action | action id and its label | +0x00 u16 |
| I | (p) Parameter | action parameter | +0x02 s16 |
| J | Flags | flag word | +0x04 u16 |
| K / L | Case 1 Target ID / Target Type | target type id and label | +0x06 u16 |
| M / N | Case 1 Condition ID / Target Condition | condition id and label | +0x08 u16 |
| O | Case 1 (p) Parameter | condition parameter | +0x0A u16 |
| P-T | Case 2 (same five columns) |  | +0x0C, +0x0E, +0x10 |
| U-Y | Case 3 (same five columns) |  | +0x12, +0x14, +0x16 |

The sheet's per-case order (Target ID, Condition ID, parameter) is the byte order of the entry (GS:AI 3:AI Scripts!K-Y,
rows 1-2). The unit sheet links to this one: its "AI 1".."AI 4" columns hold the script index (GS:ARDMap 4: Units!G-J,
row 1 note "These link to ... Vanilla AI Scripts").

## Record layouts

All multi-byte values are little-endian.

### Record `aiEntry` - 24 bytes (0x18), count: sum of the 32 group counts of the owning script

*Where:* Script s: entries start at scriptOffset[s].offset + 32, all of group 0 first, then group 1 ... Sheet key <ard>_<script>_<group>_<entry> = entry number within its group.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `action` | "Action ID". 0x0000-0x021E = battlepack section 14 action row (e.g. 305 Renew 2); 0x4000-0x4166 = AI command (move, idle, turn, switch/jump group, add/remove status or augment, flag and stat arithmetic); 0x8000 + n = action package n of battlepack section 10; 0xFFFF = none. | `BattleLogicActionList` | GS:AI 3:AI Scripts!G-H; Lists: BattleLogicActionList |
| 0x02 | 2 | s16 | `actionParameter` | "(p) Parameter" of the action: the number put into the (p) of the action label (jump chance in percent, idle seconds, range in meters ...). |  | GS:AI 3:AI Scripts!I; IW (signed, see ard-aiscripts) |
| 0x04 | 2 | bf16 | `flags` | "Flags". Vanilla values seen: 0, 176 (0x00B0), 2176 (0x0880), 18432 (0x4800). The bit names are those of the battlepack section 7 gambit flag word; they fit the samples (the only two-case sample has caseLinkType 6) but are not confirmed for ARD lines. | bits below | GS:AI 3:AI Scripts!J (rows 3-12); battlepack-s07-gambits; TK L1291 |
| 0x06 | 2 | u16 | `case1TargetType` | Case 1 "Target ID": who or what the case tests. 0-10 = actors (0 none, 1 foe, 2 ally, 3 leader, 4 self ...); 0x1000-0xA000 blocks = variables and flags (scratch variables, global flags, quest values, map-icon flags, battle-logic flags, caster battle memory). 0 when the case is unused. | `BattleLogicTargetTypeList` | GS:AI 3:AI Scripts!K-L; IW Formats/Ard/AiScripts.cs (see ard-aiscripts) |
| 0x08 | 2 | u16 | `case1TargetCondition` | Case 1 "Condition ID": the test. Bits 9-15 = condition class, bit 8 = inverted form (== / !=, highest / lowest, within / NOT within), bits 0-7 = operand (status bit, genus, element, position slot ...). 0 = unconditional. | `BattleLogicTargetConditionList` | GS:AI 3:AI Scripts!M-N; Lists: BattleLogicTargetConditionList |
| 0x0A | 2 | u16 | `case1Parameter` | Case 1 "(p) Parameter": the value substituted for (p) in the condition label (meters, percent ...). |  | GS:AI 3:AI Scripts!O |
| 0x0C | 2 | u16 | `case2TargetType` | Case 2 "Target ID": who or what the case tests. 0-10 = actors (0 none, 1 foe, 2 ally, 3 leader, 4 self ...); 0x1000-0xA000 blocks = variables and flags (scratch variables, global flags, quest values, map-icon flags, battle-logic flags, caster battle memory). 0 when the case is unused. | `BattleLogicTargetTypeList` | GS:AI 3:AI Scripts!P-Q; IW Formats/Ard/AiScripts.cs (see ard-aiscripts) |
| 0x0E | 2 | u16 | `case2TargetCondition` | Case 2 "Condition ID": the test. Bits 9-15 = condition class, bit 8 = inverted form (== / !=, highest / lowest, within / NOT within), bits 0-7 = operand (status bit, genus, element, position slot ...). 0 = unconditional. | `BattleLogicTargetConditionList` | GS:AI 3:AI Scripts!R-S; Lists: BattleLogicTargetConditionList |
| 0x10 | 2 | u16 | `case2Parameter` | Case 2 "(p) Parameter": the value substituted for (p) in the condition label (meters, percent ...). |  | GS:AI 3:AI Scripts!T |
| 0x12 | 2 | u16 | `case3TargetType` | Case 3 "Target ID": who or what the case tests. 0-10 = actors (0 none, 1 foe, 2 ally, 3 leader, 4 self ...); 0x1000-0xA000 blocks = variables and flags (scratch variables, global flags, quest values, map-icon flags, battle-logic flags, caster battle memory). 0 when the case is unused. | `BattleLogicTargetTypeList` | GS:AI 3:AI Scripts!U-V; IW Formats/Ard/AiScripts.cs (see ard-aiscripts) |
| 0x14 | 2 | u16 | `case3TargetCondition` | Case 3 "Condition ID": the test. Bits 9-15 = condition class, bit 8 = inverted form (== / !=, highest / lowest, within / NOT within), bits 0-7 = operand (status bit, genus, element, position slot ...). 0 = unconditional. | `BattleLogicTargetConditionList` | GS:AI 3:AI Scripts!W-X; Lists: BattleLogicTargetConditionList |
| 0x16 | 2 | u16 | `case3Parameter` | Case 3 "(p) Parameter": the value substituted for (p) in the condition label (meters, percent ...). |  | GS:AI 3:AI Scripts!Y |

#### Bits of `aiEntry.flags` (bf16 at 0x04; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum | Source |
|---|---|---|---|---|
| 0 | 0x0001 | `unknownBit0` | Unknown. | battlepack-s07-gambits (LL section07.md) |
| 1 | 0x0002 | `unknownBit1` | Unknown. | battlepack-s07-gambits (LL section07.md) |
| 2 | 0x0004 | `noRoaming` | Gambit-word name: no roaming. | battlepack-s07-gambits (LL section07.md) |
| 3-5 | 0x0038 | `caseLinkType` | How the three cases combine: 0 none, 3 link cases 2 & 3, 6 link cases 1 & 2, 7 link all three. The sampled two-case entry has 6. (enum `BattleLogicCaseLinkTypeList`) | battlepack-s07-gambits (LL section07.md) |
| 6 | 0x0040 | `unknownBit6` | Unknown. | battlepack-s07-gambits (LL section07.md) |
| 7 | 0x0080 | `noInterruptToLowerPriority` | Gambit-word name: cannot be interrupted by a lower-priority line. | battlepack-s07-gambits (LL section07.md) |
| 8 | 0x0100 | `alwaysRunning` | Gambit-word name: always run to the target. | battlepack-s07-gambits (LL section07.md) |
| 9 | 0x0200 | `noRunning` | Gambit-word name: never run. | battlepack-s07-gambits (LL section07.md) |
| 10 | 0x0400 | `noTargetWith3PlusAttackers` | Gambit-word name: skip targets that already have 3+ attackers. | battlepack-s07-gambits (LL section07.md) |
| 11 | 0x0800 | `noConsecutiveUse` | Gambit-word name: not twice in a row (set on the sampled Renew and remove-augment lines). | battlepack-s07-gambits (LL section07.md) |
| 12 | 0x1000 | `noRetargeting` | Gambit-word name: no retargeting. | battlepack-s07-gambits (LL section07.md) |
| 13 | 0x2000 | `noTimeout` | Gambit-word name: no timeout. | battlepack-s07-gambits (LL section07.md) |
| 14 | 0x4000 | `noInterruptByHigherPriority` | Gambit-word name: cannot be interrupted by a higher-priority line. | battlepack-s07-gambits (LL section07.md) |
| 15 | 0x8000 | `noInterruptByAny` | Gambit-word name: cannot be interrupted at all. | battlepack-s07-gambits (LL section07.md) |

The header records (`aiHeader`, `scriptOffset`, `groupCounts`) are identical to [`ard-aiscripts`](./ard-aiscripts.md) and
are carried in the JSON only.

### Decoded samples (Deathgaze, asp_b script 0)

| Key | Action | Flags | Case 1 | Case 2 | Case 3 |
|---|---|---|---|---|---|
| asp_b_0_0_0 | 0x4118 jump to group 2, p = 100 | 0 | Foe / 0x221D "Caster is within (p) meters", p = 12 | - | - |
| asp_b_0_0_1 | 0x414B turn towards target, p = 100 | 0x00B0 (caseLink 6, bit 7) | Foe / 0x0307 (Toolkit: Nearest) | Foe / 0x231C "NOT directly facing the caster within (p) m", p = 20 | - |
| asp_b_0_0_2 | 0x4117 jump to group 1, p = 100 | 0 | Self / 0x2311 "Spawn Position is NOT within (p) meters", p = 1 | - | - |
| asp_b_0_0_3 | 0x4021 idle for (p) s, p = 0 | 0 | none / 0 unconditional | - | - |
| asp_b_0_1_0 | 0x4104 remove augment Double-Edged, p = 100 | 0x0880 (bits 7, 11) | Self / 0x2032 "Augment == Double-Edged" | - | - |
| asp_b_0_1_5 | 305 (0x0131) Renew 2, p = 0 | 0x4800 (bits 11, 14) | Self / 0x2F00 "Current HP < 100%" | - | - |

Source: GS:AI 3:AI Scripts rows 3-12. Group 0 of this script acts as a state machine (jump to group 1 or 2 depending on
distance and spawn position, idle otherwise); group 1 removes buffs and casts Renew 2 when HP < 100%.

## Id spaces

| Field | Ranges | Full table |
|---|---|---|
| `action` | 0x0000-0x021E section 14 actions; 0x4000-0x4166 AI commands; 0x8000-0x8339 section 10 packages 0-825; 0xFFFF none | [`enums-ai-actions`](./enums-ai-actions.md) |
| `caseNTargetCondition` | `class << 9 \| invert << 8 \| operand`; classes 0-34 | [`enums-ai-conditions`](./enums-ai-conditions.md) |
| `caseNTargetType` | 0-10 actors; 0x1000 scratch1 (64), 0x2000 scratch2 (32), 0x3000 global flags, 0x4000-0x7000 quest values, 0x8000 map-icon flags (256 each), 0x9000 battle-logic flags (16), 0xA000 caster battle memory | [`enums-ai-target-types`](./enums-ai-target-types.md) |

The sheet's "Data" tab carries the three label lists it used (Actions 0 Cure, 1 Blindna ...; Target Conditions
0 Unconditional, 512 Highest Attack Power ...; Target Types 0 None ... 10 Future Attacker?) (GS:AI Data!A-F).

### Label differences (sheet vs Toolkit)

| Id | Sheet label | Toolkit label | Source |
|---|---|---|---|
| condition 775 (0x0307) | Furthest | Nearest (0x0207 = Furthest) | GS:AI 3:AI Scripts!N4, Data!D; Lists: BattleLogicTargetConditionList |
| action 16715 (0x414B) | (p)% chance to turn towards party leader | (p)% chance to turn towards target | GS:AI 3:AI Scripts!H4; Lists: BattleLogicActionList |
| actions 0x4116-0x4121 | jump to AI Group n | jump to Battle Logic Group n | GS:AI 3:AI Scripts!H3 |
| target type 9 / 10 | Attacker / Future Attacker? | Current / Auto | GS:AI Data!F; Lists: BattleLogicTargetTypeList |

The inverted-bit structure (0x02xx = highest, 0x03xx = lowest) makes the Toolkit reading of 0x0307 the consistent one.

## Enums carried in the JSON spec

#### `BattleLogicCaseLinkTypeList`

| Value | Label |
|---|---|
| 0 (0x0) | No Case Links |
| 3 (0x3) | Link Cases 2 & 3 |
| 6 (0x6) | Link Cases 1 & 2 |
| 7 (0x7) | Link All 3 Cases |

The three large lists (`BattleLogicActionList`, `BattleLogicTargetConditionList`, `BattleLogicTargetTypeList`) are
referenced by name from `editor/data/lists.json`; annotated copies are in the `enums-ai-*` specs.

## Count and size rules

- Script size = 32 + 24 x (sum of its group counts); script i+1 starts where script i ends; the section ends with
  zero padding to 16 (ard-aiscripts).
- A group holds at most 255 entries, a script at most 32 groups; keep used groups contiguous from group 0.
- 50,050 entries exist in vanilla over all ARDs (sheet rows 3-50052).

## Pointers to fix when sizes change

| Changed | Fix |
|---|---|
| entries added / removed in script s | group count byte; scriptOffset[s+1 ..] and the end word move by 24 per entry; re-pad to 16 |
| script appended | scriptCount + 1; the offset table grows by 4, so every script offset moves by 4 |
| section length | ARD section table (sections stored after 3 move; section 1 stays last); EBP offsets after section 19 if nested |

## Text

No strings; labels come from the lists.

## Round-trip rules

- Field edits inside an entry never move data; edit in place.
- Keep the flags word as read unless you mean to change a bit; only caseLinkType (bits 3-5) is backed by a vanilla sample.
- Unused cases are all-zero (target 0, condition 0, parameter 0); keep them zero.
- Adding or removing entries changes the group count byte of that group, every later script offset and the end offset (24 bytes per entry); re-pad the section to 16 and rebuild the ARD section table (see ard-aiscripts).
- Keep script numbering: units point at scripts by index (aiScriptLink0..3) and jump commands 0x4112-0x4115 address the unit's four links; group jump commands 0x4048-0x404F and 0x4116-0x4121 address groups by number.
- Action ids 0x8000+n refer to battlepack section 10 package n; when packages are appended or removed there, ARD entries that use them must be updated too.

## Known unknowns

- The Drive connector returned only the first 10 of the sheet's 50,050 entry rows (A3:Y50052), so value statistics (which flag bits occur, which ids are used) are limited to those rows.
- Flag bit names are borrowed from the battlepack section 7 gambit word; only caseLinkType has sample support (0xB0 on the two-case entry). Bits 7, 11 and 14 occur in vanilla (0x0880, 0x4800, 0x00B0) with unconfirmed meaning.
- Label conflicts between the sheet and the Toolkit lists: condition 775 (0x0307) is "Furthest" in the sheet but "Nearest" in the Toolkit (the sheet's own Data tab lists 519 = 0x0207 as Furthest); action 16715 (0x414B) is "turn towards party leader" (sheet) vs "turn towards target" (Toolkit); target types 9/10 are "Attacker"/"Future Attacker?" (sheet) vs "Current"/"Auto" (Toolkit).
- Which group runs first and how lines inside a group are evaluated (assumed: group 0, top to bottom, like gambits).
- Vanilla units fill unused AI slots with script 1 (all sampled units: AI 2-4 = 1); whether script 1 is an empty or shared default script is not shown.
- For flag/variable actions ("Flag (t) = (p)", 0x4149 and 0x4155-0x4157) the (t) presumably comes from the case 1 target type (a variable id in the 0x1000+ target-type blocks); not confirmed.

## Source keys

| Key | Source |
|---|---|
| GS:AI `<tab>!<column>` / row n | Google Sheet *Vanilla AI Scripts* (Drive id `1BEXZsbvK0Ey5Yl5WpI58Es4nEXNnI3PSd0_Asi5DE48`), tabs "3:AI Scripts" (A1:Y50052), "Action Packages" (A1:AM828), "Data" (A1:F1729). Read through the Google Drive connector, which returns a column summary plus the first rows of each tab, not every row (see Known unknowns). Row numbers are sheet rows (row 1 = first header row). |
| GS:ARDMap `<tab>!<column>` / row n | Google Sheet *Vanilla ARD Map* (Drive id `1OyKQkfZkSvw5NHJeHpaEso-7e3dWaSZYsH4ZQ5BGD2g`), tabs "4: Units", "2: Classes", "7:Default Stats", "8:Additive Stats", "1:Models", "9:Special Animations", "Data", "Data Check". Read through the Google Drive connector, which returns a column summary plus the first rows of each tab, not every row (see Known unknowns). Row numbers are sheet rows (row 1 = first header row). |
| ard-aiscripts, battlepack-s07-gambits, container-ard | Specs in this folder (their own sources are cited there). |
| LL `section07.md` | FF12 Lua Loader documentation, `capabilities/bpack-sections/section07.md` (gambit flag names). |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| Lists: `<name>` | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json`. |
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (fact reference only; its licence forbids copying or converting its code). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
