# Drive batch 22: The Insurgent's Forge (TIF), `classes/` part 1 (14 Lua struct-accessor classes)

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR.
Every offset in this batch is **relative to a runtime struct base**. No file in this batch holds an absolute address.

| # | Drive id | Title | Drive path | Lines / bytes | md5 (first 8) | Status |
|---|---|---|---|---|---|---|
| 1 | 1hSbCU4m4x0AZEiKJ7nKl2j4Ks_vPr_x7 | class.lua | TheInsurgentsForge/classes | 45 / 1588 | 2ebbb81d | read in full |
| 2 | 1KXzIWTk7AdYME4rOvG2V9EtzFJ0qu2rY | flags.lua | same | 85 / 2693 | 3d76351e | read in full |
| 3 | 1rJjWUlDztaIGJA60guO-ULtzkf9Ojc9Q | getArdClass.lua | same | 91 / 1835 | d136e83e | read in full |
| 4 | 1vPkCwCoKwBqfoJ6-_boFVddCb1BVrpiM | getArdUnit.lua | same | 105 / 2437 | 018396ce | read in full |
| 5 | 1ezCS4dGMJ2gMvk1HdAgXxLFLfCZDjiq2 | getAugmentDurations.lua | same | 17 / 323 | 9a66b798 | read in full |
| 6 | 1VSJgHfBJzwmQfl7WrOi1JVCAJKKV0gz- | getAugments.lua | same | 268 / 5263 | 6f916458 | read in full |
| 7 | 1HIKdVfn7npJzp6i6E8-LuBSFb4LIlI7- | getBattleActorKeep.lua | same | 31 / 670 | 20f073c9 | read in full |
| 8 | 1MOwarue0rRMaKb5q3_2v1jvToNcc5sY8 | getBattleActorModel.lua | same | 25 / 544 | e008032a | read in full |
| 9 | 12u8IwRqRUaCcq4l1KMWM5Y6WI_gcoAfM | getBattleActorWork.lua | same | 44 / 1008 | 45db73e2 | read in full |
| 10 | 192LKrY1yAs8dUOOfvfZnF1L9lIFWXzja | getBattleUnitKeep.lua | same | 153 / 3989 | 95fc07fe | read in full |
| 11 | 1VADB5AuN8TMefMJq2NMe_Q0-ExSuZXSg | getBattleUnitKeepPlus.lua | same | 57 / 1259 | bf187ab7 | read in full |
| 12 | 1Q8DJGxsTHGSf44y5A2U_whqim2JJXorH | getBattleUnitWork.lua | same | 179 / 5200 | 7e356096 | read in full |
| 13 | 188_QttRTxePG9OV7qRhcmRtjaoKQoSjL | getColors.lua | same | 24 / 358 | 377ee84d | read in full |
| 14 | 1ECjTqGexAKUB7njFFflWBk6QExwduAt7 | getElementalAffinities.lua | same | 26 / 506 | 386db167 | read in full |

Drive path prefix: `My Laptop/scripts/`. No file is missing. Every file uses CRLF line endings and starts with
"Made by Xeavin", so the personal-use-only licence applies. The facts below are restated in my own words and no
code is copied.

None of the files that the task brief names (BlueMagick, DescriptiveInventory, HudColors, ScalableFoes, SummonProbe,
FFXIIEditorCaps, Wayfarer and so on) is in this batch. This batch holds the Forge's struct-accessor classes. They
are the best single source in the Drive for the **runtime battle-unit layout** and for the **in-memory ARD enemy
records**.

Evidence key:
* **byte-check-in-code**: the code compares original bytes before it patches. **No file in this batch does this.**
  No file patches game code or calls `memory.execute`.
* **used-in-code**: the accessor reads or writes `base + offset` with the stated type when the field is accessed.
  Where a Forge formula also uses the field, the formula is cited as an xref by Drive id.
* **comment-only**: only a comment or a name says so. Field *names* are Xeavin's labels. The meanings in the
  "detail" column come from those names unless an xref formula confirms the behaviour.
* **unclear**: my own inference, or a layout conflict that I found.

Helper classes used here (`array`, `list`, `getElements`, `getElementalAffinities2`, `getQuaternion`,
`getVectorU16`, `getStatusEffects`, `getStatusEffectDurations`, `getStatusEffectTickDurations`, `getLicenses`) are in
other batches. I opened them only to get element sizes, so that the sub-block extents below are correct.

---

## Runtime pointer graph (summary of files 7 to 12)

```
FormulaProcWorkPlus +0x08 --u64--> BattleUnitWork (BUW, >= 0xEAA bytes)
  BUW +0x0010 --u64--> BattleActorWork (BAW)
                         BAW +0x00C0 --u64--> BattleActorModel (BAM)
                                                BAM +0x0138 --u64--> BattleActorKeep (BAK)
                                                                      BAK +0x50 current RGBA (4 x float)
                                                                      BAK +0x60 default RGBA (4 x float)
  BUW +0x0698 --u64--> BattleUnitKeep (BUK, the stats / equipment / augments / licences block, >= 0x1C6 bytes)
  BUW +0x06A0 --u64--> BattleUnitKeepPlus (BUKP, death / respawn / steal / temporary affinities)
  BUW +0x0E60 --u64--> ARD unit record   (>= 0x58 bytes, per-spawn enemy entry: drops, steals, poach, stats ids)
  BUW +0x0E68 --u64--> ARD class record  (>= 0x54 bytes, per-species entry: model, genus, flags, actions)
```

The link from FormulaProcWorkPlus +0x08 comes from `getFormulaProcWorkPlus.lua` (1iE_ZuiEVQpE1IIIPd_kDWuNWLEcN39nC,
line 5), which is outside this batch. A separate helper with the same file name,
`helpers/getBattleUnitWork.lua` (1iJag1yCrkbOaBF8CD0c-p0GzdWjVGRpd), maps a character address to a BUW pointer. It
writes the character address to `tif_gbuw_args+0x08`, runs the `tif_gbuw_call` stub and reads the result from
`tif_gbuw_args+0x00`. Batch 20 or 21 covers that stub.

---

## 1. class.lua: generic struct accessor

Purpose: this is the base metaclass that every struct file in this batch builds on. It gets a base address and three
maps: field to offset, field to scalar type name, and field to nested accessor. It returns a proxy object whose
reads and writes go straight to process memory through the Lua Loader `memory.<type>[addr]` arrays.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Lua Loader memory API | A scalar field read is `memory[<type>][base + offset]`. A write uses the same index. The type is the string name of a `memory` sub-table, for example `u8`, `s16`, `u32`, `u64`, `float`. | 13, 34 | used-in-code |
| Pointer versus inline sub-struct | For a nested accessor named N, if the type map also has a key `N .. "Pointer"`, the nested base is the **u64 read at base+offset(N)**, so the field is a pointer. Otherwise the nested base is **base+offset(N)**, so the field is embedded. This is why the struct files list each pointer field twice (for example `ardUnit` and `ardUnitPointer`, both at 0x0E60). | 14-21 | used-in-code |
| Rebase | The pseudo-field `address` reads the base and can be written to move the proxy to another struct. | 22-23, 35-36 | used-in-code |
| Write rules | Only number values can be written. Only scalar fields (those in the type map) can be written. Nested accessors cannot be assigned. You change their target by writing the `...Pointer` scalar. An unknown name raises a Lua error. | 28-39 | used-in-code |
| Aliasing hazard (design) | The nested accessor objects are created **once per struct module**, at module load time, and each access re-points the shared object. So if one Lua variable keeps `unitA.ardUnit` and the code then reads `unitB.ardUnit`, the first variable now points at unit B. A memory editor that is built on this pattern must re-read the chain on every access, or it must make a new nested accessor for each instance. | 15-21 (and `tables` in each struct file) | unclear (my reading of the code) |

## 2. flags.lua: bit-field accessor

Purpose: a proxy over a bit-packed area. Each named field has a starting bit index (counted from bit 0 of byte 0,
little-endian bit order inside each byte) and a width in bits.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Bit addressing | The byte is base + (bit // 8), the shift is bit % 8, and the mask is `width` ones shifted to that position. A read is `(u8 & mask) >> shift`. A write is a read-modify-write of that one byte. | 39-47, 59-68 | used-in-code |
| Limitation | Every access touches **one byte only**. A field must not cross a byte boundary, and the widest usable field is 8 bits. All widths in this batch obey this (the widest is 4 bits, `unitType` in BAW). | 42, 63 | used-in-code |
| Numeric indexing | A flag can also be indexed by its raw bit number when that number is a named bit position. This is how the Forge loops `for i = 0, 127` over augments and `for i = 0, 31` over status effects. | 43-47, 64-68 | used-in-code (xref formulas 221/222: 1vylSNC54HyystDHejDfhSHTPKVonGdfI, 1cXGTwcEt_k0mspe17hw6wUxJ1Ip_KtDH) |
| Length / pairs | `#flags` gives the Lua border of the bit-to-name table. That border is (count - 1) when the bits run without gaps from 0. `pairs` walks from bit 0 upward. This is reliable only for sets without gaps (augments, elements, statuses, licences). | 75-80 | used-in-code |

## 3. getArdClass.lua: in-memory ARD class (species) record

Purpose: describes the ARD "class" entry that BUW +0x0E68 points to. It holds data shared by every spawn of one
monster type. The record lives in the loaded battle data for the area. Its size is at least 0x54 bytes. An offline
ARD editor should check this layout against the file bytes, because the game appears to point straight into the
loaded data (unclear).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| +0x00 model | s32, the model id of the creature. | 45, 65 | used-in-code |
| +0x04 classification | u8. The same value is copied to BUW +0x55. | 46, 66 | used-in-code |
| +0x05 genus | u8. The same value is copied to BUW +0x56. | 47, 67 | used-in-code |
| +0x10 weight | s16. | 48, 68 | used-in-code |
| +0x12 flags1 | Bits 0-2: `chargeAuraAnimationScale` (3 bits). Bit 6: `hasCollision`. Bit 7: `requiresFlyingHit`. Formula 230 uses `requiresFlyingHit` to decide whether a ground unit can hit a flier. | 2-12, 49, 79 | used-in-code (xref 1CfOMlJqCmR1ipVPe9II-ikRnDHzM6gLM lines 3-4) |
| +0x18 flags2 | Bit 4: `isFlying`. Bit 5: `isFloating`. Bit 6: `canTeleport`. | 14-24, 50, 80 | used-in-code |
| +0x20 maxComboHits | u8. Formula 10 uses (value - 1) as the combo cap. | 51, 69 | used-in-code (xref 1n4_PZeNv-J5JtE1fBznoBiUWXDeNQsZK line 39) |
| +0x21 flags3 | Bit 1: `useDistancedAttack`. | 26-32, 52, 81 | used-in-code |
| +0x22 / +0x23 | u8 angleDetection and u8 radiusDetection. These are the sight cone and radius. At runtime BUW +0x64 and +0x68 hold float copies. | 53-54, 70-71 | used-in-code |
| +0x25 / +0x26 | u8 magickDetection and u8 lifeDetection (the sound/magic/low-HP aggro flags). | 55-56, 72-73 | used-in-code |
| +0x28 flags4 | Bit 0: `useGroundedAttack`. Bit 1: `noChain` (the unit does not count toward the chain). | 34-42, 57, 82 | used-in-code |
| +0x29 elementalAffinities | 5 bytes, 0x29-0x2D. Each byte is an 8-bit element mask (fire 0, lightning 1, ice 2, earth 3, water 4, wind 5, holy 6, dark 7). **In the ARD the byte order is absorb, half, immune, weak, potency.** The runtime order in file 14 is different. | 58, 83 | used-in-code |
| +0x30 actions | u16[8], 0x30-0x3F. These are the action ids that the class can use. | 59, 84 | used-in-code |
| +0x40 chainIdentifier | u16, the chain group id. | 60, 74 | used-in-code |
| +0x52 bestiaryIdentifier | u16, the bestiary entry id. | 61, 75 | used-in-code |
| Gaps | 0x06-0x0F, 0x11 (the second byte of weight), 0x13-0x17, 0x19-0x1F, 0x24, 0x27, 0x2E-0x2F and 0x42-0x51 are not named. | 44-62 | unclear |

## 4. getArdUnit.lua: in-memory ARD unit (spawn) record

Purpose: describes the ARD "unit" entry that BUW +0x0E60 points to. It holds data for one spawn: name, drops,
steals, poach, monograph and canopic loot, equipment and stat-table ids. Its size is at least 0x58 bytes. This is the
table that LuckyLoot and steal/poach mods edit.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| +0x00 classIdentifier | u16, the index of the ARD class record (file 3). | 29, 64 | used-in-code |
| +0x03 flags1 | Bits 0-1: `customHealthBarType` (2 bits). Bit 4: `redDotSizeType`. | 2-10, 30, 95 | used-in-code |
| +0x08 name | u16, the text id of the enemy name. | 31, 65 | used-in-code |
| +0x0A size | A u16 x/y/z vector. **Conflict:** `getVectorU16` uses offsets 0/4/8, which would put y at 0x0E and z at 0x12. The z position overlaps modelColorVariation (0x12) and forcedWeaponStanceAnimation (0x13). The vector is probably packed at 0x0A/0x0C/0x0E. Check this before you trust it. | 32, 96 | unclear |
| +0x11 / +0x12 / +0x13 | u8 modelVariation, u8 modelColorVariation (the palette variant), u8 forcedWeaponStanceAnimation. | 33-35, 66-68 | used-in-code |
| +0x15 flags2 | Bit 0: useWeaponStats. Bit 1: useShieldStats. Bit 2: noFloatingHealthBar. Bit 3: noTargetLine. Bit 4: noActionCategorySpecificTargetLine. | 12-26, 36, 97 | used-in-code |
| +0x16 weapon / +0x1C offhand | u16 item ids. | 37, 39, 69, 71 | used-in-code |
| +0x18 customInitialHp | u32, the HP override. | 38, 70 | used-in-code |
| +0x22 / +0x24 | u16 defaultStatsIdentifier and u16 additiveStatsIdentifier. These are indices into the base-stat and additive-stat tables. | 40-41, 72-73 | used-in-code |
| +0x28..+0x30 drops | u16 item ids: common 0x28, uncommon 0x2A, rare 0x2C, very rare 0x2E, guaranteed 0x30. | 42-46, 74-78 | used-in-code |
| +0x32..+0x36 steals | u16 item ids: common 0x32, uncommon 0x34, rare 0x36. **0xFFFF means an empty slot** (from the xref formulas). | 47-49, 79-81 | used-in-code (xref formulas 195/321/332: 1KNQZxKY-rOHNV1cDjEsfdNZ51bl_m01I, 1hqx6PgQf2vvVxhByDaPvhlp3EAF_xk4Z) |
| +0x38 / +0x3C | s32 overlayModel1 and s32 overlayModel2 (attached or extra model ids). | 50-51, 82-83 | used-in-code |
| +0x42 / +0x43 | u8 monographRate and u8 canopicJarRate (percent chances). | 52-53, 84-85 | used-in-code |
| +0x44 / +0x46 poach | u16 commonPoach and u16 uncommonPoach. Formula 196 picks one of them. | 54-55, 86-87 | used-in-code (xref 17oMZz7_5GiJ5YJ4s3qobV4BpQofgVhR8 lines 8-10) |
| +0x48 / +0x4A | u16 monographType (the bazaar monograph the party must hold) and u16 monographDrop (the item given). | 56-57, 88-89 | used-in-code |
| +0x4C / +0x4E | u16 canopicJarType and u16 canopicJarDrop. | 58-59, 90-91 | used-in-code |
| +0x50 battleLogicIdentifiers | u16[4], 0x50-0x57. These are the AI script or gambit-set ids. | 60, 98 | used-in-code |

## 5. getAugmentDurations.lua: timed-augment countdowns

Purpose: a list of 8 signed 16-bit timers (16 bytes). It sits at BUK +0x17C.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Layout | s16[8]. Slot n is at +2n. | 13-15 | used-in-code |
| Slot names | 3 = physicalImmunity, 4 = magickImmunity, 5 = statusImmunity. Slots 0-2, 6 and 7 are named reserve. These slots match augment bits 55-57 in file 6. | 2-11 | comment-only (names) |
| Inactive value | The Forge writes -1 to every slot to clear it. A battlepack section58 entry has a `timerSlot`, and a value below 8 picks the slot to read. | n/a | used-in-code (xref 1cXGTwcEt_k0mspe17hw6wUxJ1Ip_KtDH line 21, 1FENtrXNql1aXckDK0iPMAFQU22ZKznvM lines 102-104) |

## 6. getAugments.lua: 128-bit augment set

Purpose: maps all 128 augment ids to one bit each (16 bytes). It is used at BUK +0x68 (temporary), BUK +0x78
(permanent) and BUW +0x0E80 (a second permanent copy). This is also the canonical **augment id enum** (0-127). The
same bit index is the augment id in battlepack and licence data.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Size | 128 one-bit fields, bits 0-127, so 16 bytes. | 2-131, 133-262 | used-in-code |
| Ids 0-15 | stability, safety, accuracyBoost, shieldBoost, evasionBoost, lastStand, counter, counterBoost, spellbreaker, brawler, adrenaline, focus, lobbying, comboBoost, itemBoost, medicineReverse | 3-18 | comment-only (names) |
| Ids 16-31 | weatherproof, thievery, saboteur, magickLore13, warmage, martyr, magickLore14, headsman, magickLore15, treasureHunter, magickLore16, expBoost, lpBoost, stagnation, spellbound, piercingMagick | 19-34 | comment-only |
| Ids 32-47 | offering, veil, lifeCloak, battleLore6, parsimony, treadLightly, unused38, emptiness, resistPiercing, antiLibra, battleLore7-12 (42-47) | 35-50 | comment-only |
| Ids 48-63 | stoneskin, attackBoost, doubleEdged, spellspring, elementalShift, celerity, swiftcast, physicalImmunity (55), magickImmunity (56), statusImmunity (57), damageSpikes, suicidal, battleLore13-16 (60-63) | 51-66 | comment-only |
| Ids 64-85 | battleLore1-5 (64-68), magickLore1-5 (69-73), hpLore1-12 (74-85) | 67-85 | comment-only |
| Ids 86-103 | inquisitor (86), magickLore6 (87), shieldBlock3/2/1 (88-90), channeling3/2/1 (91-93), swiftness3/2/1 (94-96), magickLore7-12 (97-102), serenity (103) | 89-106 | comment-only |
| Ids 104-127 | gambitSlot1-10 (104-113), essentials (114), unused115, remedyLore3/2/1 (116-118), potionLore3/2/1 (119-121), etherLore3/2/1 (122-124), phoenixLore3/2/1 (125-127) | 107-130 | comment-only |
| Free ids | 38 and 115 are marked unused. They are candidates for new mod augments. | 41, 118 | comment-only |

## 7. getBattleActorKeep.lua: actor transform and colour block

Purpose: the per-actor render/physics block. It is reached through BAM +0x138. HudColors and tint mods use it,
because it holds the actor's current and default RGBA.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| +0x08 weight | float. | 3, 14 | used-in-code |
| +0x30 currentPosition | 4 floats (x, y, z, w) at +0x30/+0x34/+0x38/+0x3C. | 4, 22 | used-in-code |
| +0x50 currentColors | 4 floats RGBA (+0x50 R, +0x54 G, +0x58 B, +0x5C A). | 5, 23 | used-in-code |
| +0x60 defaultColors | 4 floats RGBA (+0x60..+0x6C). Writing current and keeping default lets a mod restore the original tint. | 6, 24 | used-in-code |
| +0x80 animationState | u16. | 7, 15 | used-in-code |
| +0x88 mapJumpGroup / +0x8A terrain | s16 / u16. | 8-9, 16-17 | used-in-code |
| +0xC8 movementSpeed | float. | 10, 18 | used-in-code |

## 8. getBattleActorModel.lua: actor model block

Purpose: the model-instance block. It is reached through BAW +0xC0.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| +0x138 battleActorKeep | A u64 pointer to the BAK (file 7). | 3-4, 11, 18 | used-in-code |
| +0x148 weight | float. | 5, 12 | used-in-code |
| +0x14C / +0x14D | u8 modelVariation and u8 modelColorVariation. These are the runtime copies of ARD unit +0x11 / +0x12. | 6-7, 13-14 | used-in-code |

## 9. getBattleActorWork.lua: field/battle actor block

Purpose: the actor-level block (talk icons, spawn group, target-info name). It is reached through BUW +0x10.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| +0x00 identifier | u16, the actor id. | 13, 25 | used-in-code |
| +0x0E activityFlags | Bits 0-3: unitType (4 bits). Bit 4: talkIconState. | 2-10, 14, 36 | used-in-code |
| +0xC0 battleActorModel | A u64 pointer to the BAM (file 8). | 15-16, 27, 37 | used-in-code |
| +0xF4 fieldSignIcon | u8. | 17, 28 | used-in-code |
| +0xF6 spawnGroup | s16. | 18, 29 | used-in-code |
| +0xF8 targetInfoNamePointer | u64, a pointer to the name string shown in the target info. | 19, 30 | used-in-code |
| +0x102 targetInfoNameIdentifier | s16, the name text id. | 20, 31 | used-in-code |
| +0x107 overheadIconType | u8. | 21, 32 | used-in-code |
| Dead entry | The type map declares `battleUnitWorkPointer` as u64, but there is **no offset** for it. Reading it would fail. There is no back-pointer from BAW to BUW that can be used here. | 26 | unclear (inconsistency) |

## 10. getBattleUnitKeep.lua: unit stats, equipment, augments and licences (BUK)

Purpose: the main per-unit record. It is reached through BUW +0x698. For party members it holds the values a save or
party editor needs: HP/MP, stats, equipment, licences, EXP/LP, level and jobs.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| +0x04 / +0x05 | u8 identifier and u8 type (Forge formulas test `type == 1` against `type == 0`, which looks like party member versus foe). | 3-4, 75-76 | used-in-code |
| +0x06 mistCharges | s16. | 5, 77 | used-in-code |
| +0x08..+0x23 union | **Two overlapping views of the same bytes.** The default view: defaultMaxHp s32 @0x08, defaultMaxMp s16 @0x0C, defaultStrength float @0x10, defaultMagickPower float @0x14, defaultVitality float @0x18, defaultSpeed float @0x1C, defaultMaxMistBars u8 @0x20. The additive view: s16 values at 0x08 str, 0x0A mag, 0x0C vit, 0x0E spd, 0x10 atk, 0x12 def, 0x14 mres, 0x16 evadeParry, 0x18 evadeWeapon, 0x1A evadeShield, 0x1C magickEvadeShield, 0x1E evadeTotal, 0x20 magickEvadeTotal. Which view applies probably depends on the unit type or the context. | 6-25, 78-97 | used-in-code (meaning of union: unclear) |
| +0x24 maxHp / +0x28 maxMp | s32 / s16, the effective maxima. | 26-27, 98-99 | used-in-code |
| +0x2A..+0x37 stats | u8 each: str 2A, mag 2B, vit 2C, spd 2D, atk 2E, def 2F, mres 30, evadeParry 31, evadeWeapon 32, evadeShield 33, magickEvadeShield 34, evadeTotal 35, magickEvadeTotal 36, maxMistBars 37. | 28-41, 100-113 | used-in-code |
| +0x38 / +0x3C | permanentStatusEffectImmunities and permanentStatusEffects. Each is a 32-bit status set (4 bytes). | 45-46, 137-138 | used-in-code |
| +0x40 permanentElementalAffinities | 5 bytes (weak/absorb/half/immune/potency, the runtime order). | 47, 139 | used-in-code |
| +0x48 / +0x4C / +0x4E | s32 currentHp, s16 currentMp, u8 currentMistBars. | 42-44, 114-116 | used-in-code |
| +0x50..+0x58 equipment | u16 item ids: weapon 50, offhand 52, helm 54, armor 56, accessory 58. | 48-52, 117-121 | used-in-code |
| +0x5A..+0x62 seized | u16 seizedWeapon/Offhand/Helm/Armor/Accessory. These look like the equipment saved while the unit is disabled or under a guest override. | 53-57, 122-126 | used-in-code (meaning: comment-only) |
| +0x64 temporaryStatusEffects | 32-bit status set. | 58, 140 | used-in-code |
| +0x68 / +0x78 | temporaryAugments and permanentAugments, 16 bytes each (file 6). | 59-60, 141-142 | used-in-code |
| +0x88 defaultLevel | u8. | 61, 127 | used-in-code |
| +0xBC statusEffectDurations | s32[32] (0x80 bytes, ending at 0x13B). | 62, 143 | used-in-code |
| +0x13C statusEffectTickDurations | s16[32] (0x40 bytes, ending at 0x17B). | 63, 144 | used-in-code |
| +0x17C augmentDurations | s16[8] (file 5). | 64, 145 | used-in-code |
| +0x18C exp / +0x190 lp | u32 / u32. | 65-66, 128-129 | used-in-code |
| +0x194 licenses | A 368-bit set (46 bytes, 0x194-0x1C1), one bit per licence id (0-367). | 67, 146 | used-in-code |
| +0x1C2..+0x1C5 | u8 level, u8 job1, u8 job2 (the Zodiac job board ids), u8 selectedJob. | 68-71, 130-133 | used-in-code |
| Gaps | 0x00-0x03, 0x45-0x47, 0x89-0xBB and anything after 0x1C5 are not named. | 2-72 | unclear |

## 11. getBattleUnitKeepPlus.lua: death, respawn, steal state and temporary affinities (BUKP)

Purpose: an extra per-unit block, reached through BUW +0x6A0.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| +0x00 battleFlags | Bit 7: hasTemporaryElementalAffinities. A mod must set it after it writes +0x78. | 2-8, 23, 48 | used-in-code (xref 1FENtrXNql1aXckDK0iPMAFQU22ZKznvM lines 195-202) |
| +0x04 specialSpawnRange | float. | 24, 37 | used-in-code |
| +0x08 / +0x0A | u16 currentDeathCount and u16 maxDeathCount. | 25-26, 38-39 | used-in-code |
| +0x0C deathTime / +0x10 respawnTime | u32 / u16. | 27-28, 40-41 | used-in-code |
| +0x14 stealStateFlags | Bit 0: common. Bit 1: uncommon. Bit 2: rare. **1 = the slot can still be stolen, 0 = it has been taken.** The steal formula clears the bit and then gives the ARD unit steal item. | 10-20, 29, 49 | used-in-code (xref 1hqx6PgQf2vvVxhByDaPvhlp3EAF_xk4Z lines 4-17, 1LdWhio0e2ZgHTuqY7z1rM0SA2m0BAi-I lines 14-54) |
| +0x15 summonGroup | u8. | 30, 42 | used-in-code |
| +0x70 / +0x74 | float latestYaw and float defaultYaw. | 31-32, 43-44 | used-in-code |
| +0x78 temporaryElementalAffinities | 5 bytes (runtime order: weak, absorb, half, immune, potency). | 33, 50 | used-in-code |

## 12. getBattleUnitWork.lua: runtime battle unit (BUW)

Purpose: the top-level per-unit battle record that every Forge formula reaches as `formula.caster.battleUnitWork`
or `formula.target.battleUnitWork`. Its size is at least 0xEAA bytes.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| +0x00 battleFlags | A bit set. Bit 14: useManuallySelectedAction (byte 1, bit 6). Bit 22: counterState (byte 2, bit 6). Bit 23: isInBattleStance (byte 2, bit 7). Bit 46: noMovementState (byte 5, bit 6). Bit 48: canBeInBattleStance (byte 6, bit 0). Bit 52: isTargeted (byte 6, bit 4). | 2-18, 35, 163 | used-in-code (xref formulas 2/42 use isInBattleStance) |
| +0x08 focusIdentifier | u32, the unit's focus id (the id used for target references). | 36, 104 | used-in-code |
| +0x10 battleActorWork | A u64 pointer to the BAW. | 37-38, 105, 164 | used-in-code |
| +0x18 targetInfoNamePointer | u64. | 39, 106 | used-in-code |
| +0x24 / +0x28 / +0x30 | u32 focus ids: partyLeader, counterTarget, koCaster. | 40-42, 107-109 | used-in-code |
| +0x48 hpLowLimit | s32, the HP floor. Formula 323 compares currentHp against it, which matches "cannot die" or scripted HP limits. | 43, 110 | used-in-code (xref 1FENtrXNql1aXckDK0iPMAFQU22ZKznvM lines 46-52) |
| +0x4C..+0x51 despawn | float despawnPositionRange @0x4C, u8 despawnType @0x50, u8 despawnPositionIdentifier @0x51. | 44-46, 111-113 | used-in-code |
| +0x54..+0x58 | u8 belong (side), u8 classification, u8 genus, s8 spawnGroup, u8 unitType. | 47-51, 114-118 | used-in-code |
| +0x64 / +0x68 / +0x70 | float angleDetection, float radiusDetection, float steps. | 52-54, 119-121 | used-in-code |
| +0x158 / +0x190 | float followerSpeed and float followerDistance. | 55-56, 122-123 | used-in-code |
| +0x694..+0x696 | u8 next, current and quickening magick-effect processing ids. | 57-59, 124-126 | used-in-code |
| +0x698 battleUnitKeep | A u64 pointer to the BUK (file 10). | 60-61, 127, 165 | used-in-code |
| +0x6A0 battleUnitKeepPlus | A u64 pointer to the BUKP (file 11). | 62-63, 128, 166 | used-in-code |
| +0x6B4..+0x6BD | u8 actionProcessingType @0x6B4, u8 reserveTargetCount @0x6B6, u8 comboCount @0x6B7, u8 totalComboCount @0x6B8, u8[5] reserveTargets @0x6B9-0x6BD. | 64-68, 129-132, 167 | used-in-code |
| +0x6E0 / +0x6F8 | u64 gambitBattleLogicPointer and u64 autoAttackBattleLogicPointer. | 69-70, 133-134 | used-in-code |
| +0x708..+0x714 current action | u64 currentBattleLogicPlusPointer @0x708, u32 currentTargetFocusIdentifier @0x710, u16 **currentAction** @0x714 (the action id). | 71-73, 135-137 | used-in-code |
| +0x738..+0x744 last action | u64 lastBattleLogicPlusPointer @0x738, u32 lastTargetFocusIdentifier @0x740, u16 **lastAction** @0x744. | 74-76, 138-140 | used-in-code |
| +0x748 / +0x750 | u32 autoAttackFocusIdentifier and u32 partyLeaderTargetFocusIdentifier. | 77-78, 141-142 | used-in-code |
| +0x75C..+0x770 charge | u32 timers: idleChargeTime @0x75C, currentChargeTime @0x768, requiredChargeTime @0x76C, lastChargeTime @0x770. These are the ATB/charge bar values. | 79-82, 143-146 | used-in-code |
| +0x77C activeTargetCount | s32. | 83, 147 | used-in-code |
| +0xBA0 / +0xBB8 | u16 manuallySelectedAction and u32 manuallySelectedTargetFocusIdentifier. These come from the battle menu and are used when battleFlags bit 14 is set. | 84-85, 148-149 | used-in-code |
| +0xBC4 potentialTargetCount | u32. | 86, 150 | used-in-code |
| +0xDC8 modifiedContent | u16, the item or content id that the last action changed. | 87, 151 | used-in-code |
| +0xDCC battleStanceSwitchTime | u32. | 88, 152 | used-in-code |
| +0xE54 / +0xE58 | s32 removedGil and s32 addedGil (per-action gil changes, for example from Gil Toss and the steal-gil formulas). | 89-90, 153-154 | used-in-code |
| +0xE60 ardUnit / +0xE68 ardClass | u64 pointers to the ARD unit record (file 4) and the ARD class record (file 3). | 91-94, 155-156, 168-169 | used-in-code (xref formulas 195/196/230/321) |
| +0xE80 permanentAugments | 16 bytes, a second copy of the augment set. | 95, 170 | used-in-code |
| +0xE90 permanentStatusEffectImmunities | 4 bytes. | 96, 171 | used-in-code |
| +0xE98 eventFlagGroup | u8. | 97, 157 | used-in-code |
| +0xE9A deathFlags | Bit 0: poison. Bit 1: petrify. Bit 2: poisonTick. Bit 3: **noExpAndLp** (the kill gives no EXP or LP. Formula 323 sets it). | 20-32, 98, 172 | used-in-code (xref 1FENtrXNql1aXckDK0iPMAFQU22ZKznvM line 9) |
| +0xEA8 / +0xEA9 | u8 attackerCount and u8 identifier (the slot index). | 99-100, 158-159 | used-in-code |

## 13. getColors.lua: RGBA float colour

Purpose: a 16-byte colour, used at BAK +0x50 and +0x60.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Layout | float red @+0x00, green @+0x04, blue @+0x08, alpha @+0x0C (normalised, 0.0-1.0 expected). | 2-14 | used-in-code |

## 14. getElementalAffinities.lua: runtime elemental affinity block

Purpose: 5 consecutive element-mask bytes, used at BUK +0x40 and BUKP +0x78.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Runtime byte order | +0 weak, +1 absorb, +2 half, +3 immune, +4 potency (element boost). Each byte is an 8-bit mask: fire bit 0, lightning 1, ice 2, earth 3, water 4, wind 5, holy 6, dark 7 (from getElements). | 2-20 | used-in-code |
| Order differs from ARD | The ARD class version (`getElementalAffinities2`, used at ARD class +0x29) stores absorb, half, immune, weak, potency. So "weak" is the first byte at runtime and the fourth byte in the ARD. An editor must not copy these 5 bytes from one block to the other without reordering them. | 2-8 (vs getElementalAffinities2) | used-in-code |

---

## Notes for editor builders

* **Load order:** `classes.lua` (1VjTOnPiwdajGQwBB2OcUZF6cHmXnxUy0) loads array, class, flags and list first, then
  the leaf structs, then BAK, BAM, BAW, BUK, BUKP and BUW. Each struct builds its nested accessors when its module
  loads, so the dependencies must already exist at that point.
* **Memory editor (Lua/CE):** the BUW to BUK chain is enough for an HP/MP/stat/equipment/licence editor
  (BUK +0x24..+0x1C5). The BUW to ARD unit chain is enough for live drop, steal and poach editing. BUKP +0x14 resets
  steal availability.
* **Offline ARD editor:** the ARD unit record (>= 0x58 bytes) and the ARD class record (>= 0x54 bytes) give field
  maps. Check the u16 size vector at unit +0x0A, because its layout conflicts with the fields after it.
* **Sentinels:** 0xFFFF marks an empty item slot in the ARD steal fields. -1 marks an inactive augment timer.
