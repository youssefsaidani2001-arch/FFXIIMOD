# Battle Actor Work / Battle Unit Work / Actor Model & Keep — memory-only

Spec id: `live-battle-actor-chain` · machine spec: [`live-battle-actor-chain.json`](./live-battle-actor-chain.json)

> **MEMORY-ONLY (runtime).** This structure exists only in the running game process; there is no game file to patch for it. Edit it live (Lua Loader `memory`/`save` tables, Cheat Engine) or change the file data it is built from.

## What this is

The live objects behind every actor on the field, as walked by the Toolkit's Battle Character Editor every
500 ms (TK L326-L398):

```
Battle Script Keep [0x02098E10 + slot*0x288]          (see vm-script-runtime)
  +0x08 -> actor list: u32 count, then u64 actor pointers from +0x08
           Battle Actor Work (0x120)
             +0x30 -> Battle Unit Work (0xF50)
                        +0x698 -> Battle Unit Keep (0x1C8)      (live-battle-unit-keep)
                        +0x6A0 -> Battle Unit Keep Plus (0x80)  (live-battle-unit-keep)
                        +0xE60/+0xE68/+0xE70/+0xE78 -> ARD Unit / Class / Default Stats / Additive Stats
             +0x40 -> actor declaration (name offset into the script)
             +0xA0/+0xA8 -> task control / execution lists
             +0xB8 -> skeleton,  +0xC0 -> Battle Actor Model (0x188)
                                           +0x138 -> Battle Actor Keep (0x130)
```

Useful globals (TK L310-L320): leader actor id `u16 [0x022C7FE0]`, current target `u16 [0x022C8380]`, unit
count `[0x0208E6A0]`, active party count `u8 [0x0209AC30] + 0xB2A`, current location / position index
`[0x021654C4]` / `[0x021654C8]`. The four on-field party members are the Battle Actor Work pointers at
`0x0209A1F0` (4 x u64, TK L1368).

All of these are rebuilt whenever an area/script is loaded; foe data comes from the area's ARD (see
`ard-units`, `ard-classes`, `ard-stats`) and placement from the EBP. Editing them changes only the running
instance.

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…` are not interpreted by any source; keep their original bytes. Overlapping rows are alternative views of the same bytes (the note says which applies).

### Record `battleActorWork` — 288 bytes (0x120), count: u32 [actorList] per Battle Script Keep

*Where:* Battle Script Keep +0x08 -> actor list; actor i = u64 [list + 8 + i*8] (count = u32 [list]); game function 0x00358940(keep, actorId).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `identifier` | Actor identifier. |  | Drive getBattleActorWork.lua:12-31 |
| 0x02 | 12 | bytes | `unknown02` | Not identified by any source; keep the original bytes. |  |  |
| 0x0E | 1 | bf8 | `activityFlags` | Activity flags. | bits below | Drive getBattleActorWork.lua:12-31; TK L645 |
| 0x0F | 33 | bytes | `unknown0F` | Not identified by any source; keep the original bytes. |  |  |
| 0x30 | 8 | u64 | `battleUnitWork` | Pointer to the Battle Unit Work. |  | TK L348 |
| 0x38 | 8 | bytes | `unknown38` | Not identified by any source; keep the original bytes. |  |  |
| 0x40 | 8 | u64 | `actorDeclaration` | Pointer to the actor declaration in the loaded script; its first u32 is the name offset (name = script + u32[script+0x4C] + offset, Shift-JIS). |  | TK L376, L677; Drive SummonProbe.lua:56-62 |
| 0x48 | 88 | bytes | `unknown48` | Not identified by any source; keep the original bytes. |  |  |
| 0xA0 | 8 | u64 | `battleTaskControlList` | Pointer to the Battle Task Control list (20-byte records). |  | TK L380, L694 |
| 0xA8 | 8 | u64 | `battleTaskExecutionList` | Pointer to the Battle Task Execution list (40-byte records, VM stack at +0x18). |  | TK L384, L695 |
| 0xB0 | 8 | bytes | `unknownB0` | Not identified by any source; keep the original bytes. |  |  |
| 0xB8 | 8 | u64 | `battleActorSkeleton` | Pointer to the skeleton (1 Sign 128 B, 2 Line 32 B, 3 Unit 560 B). |  | TK L388, L691 |
| 0xC0 | 8 | u64 | `battleActorModel` | Pointer to the Battle Actor Model. |  | Drive getBattleActorWork.lua:12-31; TK L392 |
| 0xC8 | 44 | bytes | `unknownC8` | Not identified by any source; keep the original bytes. |  |  |
| 0xF4 | 1 | u8 | `fieldSignIcon` | Field sign icon. | `BceFieldSignIconList` | Drive getBattleActorWork.lua:12-31; TK L690 |
| 0xF5 | 1 | bytes | `unknownF5` | Not identified by any source; keep the original bytes. |  |  |
| 0xF6 | 2 | s16 | `spawnGroup` | Spawn group. |  | Drive getBattleActorWork.lua:12-31 |
| 0xF8 | 8 | u64 | `targetInfoNamePointer` | Target-info name pointer. |  | Drive getBattleActorWork.lua:12-31 |
| 0x100 | 2 | bytes | `unknown100` | Not identified by any source; keep the original bytes. |  |  |
| 0x102 | 2 | s16 | `targetInfoNameIdentifier` | Target-info name id. | `CharacterNameList` | Drive getBattleActorWork.lua:12-31 |
| 0x104 | 3 | bytes | `unknown104` | Not identified by any source; keep the original bytes. |  |  |
| 0x107 | 1 | u8 | `overheadIconType` | Overhead icon type. | `BceOverheadIconTypeList` | Drive getBattleActorWork.lua:12-31; TK L690 |
| 0x108 | 24 | bytes | `unknown108` | Not identified by any source; keep the original bytes. |  |  |

#### Bits of `battleActorWork.activityFlags` (bf8 at 0x0E; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0-3 | `unitType` | low nibble = unit type; Kill Nearby Foes only kills type 1; enum `UnitTypeList` |
| 4 | `talkIconState` |  |

### Record `battleUnitWork` — 3920 bytes (0xF50), count: [0x0208E6A0] (Battle Unit Work count, TK L314)

*Where:* Battle Actor Work +0x30 -> Battle Unit Work; also game function 0x00321170 (by index) / 0x0031B860 (by actor). Count of units: [0x0208E6A0].

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 8 | bf64 | `battleFlags` | Battle flags (64-bit); only a few bits are named. | bits below | Drive getBattleUnitWork.lua:34-101 |
| 0x08 | 4 | u32 | `focusIdentifier` | Focus id: the handle used everywhere to refer to this actor. Community scripts decode it as (id >> 16) & 0xF = Battle Script Keep slot, id & 0xFFFF = actor index in that keep. |  | Drive getBattleUnitWork.lua:34-101; TK L716; Drive BlueMagick.lua:1200-1210 |
| 0x0C | 4 | bytes | `unknown0C` | Not identified by any source; keep the original bytes. |  |  |
| 0x10 | 8 | u64 | `battleActorWork` | Pointer to the Battle Actor Work of this unit. |  | Drive getBattleUnitWork.lua:34-101; TK L717, L645 |
| 0x18 | 8 | u64 | `targetInfoNamePointer` | Pointer to the name shown in the target info window. |  | Drive getBattleUnitWork.lua:34-101 |
| 0x20 | 4 | bytes | `unknown20` | Not identified by any source; keep the original bytes. |  |  |
| 0x24 | 4 | u32 | `partyLeaderFocusIdentifier` | Party leader focus id. |  | Drive getBattleUnitWork.lua:34-101; TK L718 |
| 0x28 | 4 | u32 | `counterTargetFocusIdentifier` | Counter target focus id. |  | Drive getBattleUnitWork.lua:34-101; TK L718 |
| 0x2C | 4 | u32 | `animationCasterFocusIdentifier` | Animation caster focus id. |  | TK L718 |
| 0x30 | 4 | u32 | `koCasterFocusIdentifier` | Focus id of whoever KOed this unit. |  | Drive getBattleUnitWork.lua:34-101; TK L718 |
| 0x34 | 20 | bytes | `unknown34` | Not identified by any source; keep the original bytes. |  |  |
| 0x48 | 4 | s32 | `hpLowLimit` | HP floor; HP is clamped to it (set > 0 for an unkillable unit). |  | Drive getBattleUnitWork.lua:34-101; TK L719 |
| 0x4C | 4 | f32 | `despawnPositionRange` | Despawn position range. |  | Drive getBattleUnitWork.lua:34-101; TK L720 |
| 0x50 | 1 | u8 | `despawnType` | Despawn type. | `BceDespawnTypeList` | Drive getBattleUnitWork.lua:34-101 |
| 0x51 | 1 | u8 | `despawnPositionIdentifier` | Despawn position id. |  | Drive getBattleUnitWork.lua:34-101 |
| 0x52 | 2 | bytes | `unknown52` | Not identified by any source; keep the original bytes. |  |  |
| 0x54 | 1 | u8 | `belong` | Belong (side). |  | Drive getBattleUnitWork.lua:34-101; TK L721 |
| 0x55 | 1 | u8 | `classification` | Classification. | `ClassificationList` | Drive getBattleUnitWork.lua:34-101 |
| 0x56 | 1 | u8 | `genus` | Genus. | `GenusList` | Drive getBattleUnitWork.lua:34-101 |
| 0x57 | 1 | s8 | `spawnGroup` | Spawn group. |  | Drive getBattleUnitWork.lua:34-101 |
| 0x58 | 1 | u8 | `unitType` | Unit type. | `UnitTypeList` | Drive getBattleUnitWork.lua:34-101; TK L721 |
| 0x59 | 11 | bytes | `unknown59` | Not identified by any source; keep the original bytes. |  |  |
| 0x64 | 4 | f32 | `angleDetection` | Aggro cone angle. |  | Drive getBattleUnitWork.lua:34-101; TK L722 |
| 0x68 | 4 | f32 | `radiusDetection` | Aggro radius. |  | Drive getBattleUnitWork.lua:34-101; TK L722 |
| 0x6C | 4 | bytes | `unknown6C` | Not identified by any source; keep the original bytes. |  |  |
| 0x70 | 4 | f32 | `steps` | Steps (0-27). |  | Drive getBattleUnitWork.lua:34-101; TK L723 |
| 0x74 | 228 | bytes | `unknown74` | Not identified by any source; keep the original bytes. |  |  |
| 0x158 | 4 | f32 | `followerSpeed` | Follower speed. The Toolkit lists yaw, walk/run/battle-run speed and flying height between 0x158 and 0x190 without exact offsets. |  | Drive getBattleUnitWork.lua:34-101; TK L724 |
| 0x15C | 52 | bytes | `unknown15C` | Not identified by any source; keep the original bytes. |  |  |
| 0x190 | 4 | f32 | `followerDistance` | Follower distance. |  | Drive getBattleUnitWork.lua:34-101; TK L724 |
| 0x194 | 1280 | bytes | `unknown194` | Not identified by any source; keep the original bytes. |  |  |
| 0x694 | 1 | u8 | `nextMagickEffectProcessingIdentifier` | Index into the Magick Effect Processing array (0x022C17B0, 32 slots). |  | Drive getBattleUnitWork.lua:34-101; TK L725, L1323 |
| 0x695 | 1 | u8 | `currentMagickEffectProcessingIdentifier` | Current magick-effect slot. |  | Drive getBattleUnitWork.lua:34-101 |
| 0x696 | 1 | u8 | `quickeningMagickEffectProcessingIdentifier` | Quickening magick-effect slot. |  | Drive getBattleUnitWork.lua:34-101 |
| 0x697 | 1 | bytes | `unknown697` | Not identified by any source; keep the original bytes. |  |  |
| 0x698 | 8 | u64 | `battleUnitKeep` | Pointer to the Battle Unit Keep (see live-battle-unit-keep). |  | Drive getBattleUnitWork.lua:34-101; TK L352 |
| 0x6A0 | 8 | u64 | `battleUnitKeepPlus` | Pointer to the Battle Unit Keep Plus. |  | Drive getBattleUnitWork.lua:34-101; TK L356 |
| 0x6A8 | 12 | bytes | `unknown6A8` | Not identified by any source; keep the original bytes. |  |  |
| 0x6B4 | 1 | u8 | `actionProcessingType` | Action processing type. |  | Drive getBattleUnitWork.lua:34-101; TK L726 |
| 0x6B5 | 1 | bytes | `unknown6B5` | Not identified by any source; keep the original bytes. |  |  |
| 0x6B6 | 1 | u8 | `reserveTargetCount` | Reserve target count. |  | Drive getBattleUnitWork.lua:34-101 |
| 0x6B7 | 1 | u8 | `comboCount` | Combo count. |  | Drive getBattleUnitWork.lua:34-101 |
| 0x6B8 | 1 | u8 | `totalComboCount` | Total combo count. |  | Drive getBattleUnitWork.lua:34-101 |
| 0x6B9 | 5 | bytes | `reserveTargets` | 5 x u8. Xeavin's class calls them reserve targets; the Toolkit calls the same 5 bytes "Restrictions". |  | Drive getBattleUnitWork.lua:34-101; TK L706 |
| 0x6BE | 34 | bytes | `unknown6BE` | Not identified by any source; keep the original bytes. |  |  |
| 0x6E0 | 8 | u64 | `gambitBattleLogicPointer` | Pointer to the gambit battle logic. |  | Drive getBattleUnitWork.lua:34-101; TK L727 |
| 0x6E8 | 16 | bytes | `unknown6E8` | Not identified by any source; keep the original bytes. |  |  |
| 0x6F8 | 8 | u64 | `autoAttackBattleLogicPointer` | Pointer to the auto-attack battle logic. |  | Drive getBattleUnitWork.lua:34-101 |
| 0x700 | 8 | bytes | `unknown700` | Not identified by any source; keep the original bytes. |  |  |
| 0x708 | 8 | u64 | `currentBattleLogicPlusPointer` | Current battle-logic-plus pointer. |  | Drive getBattleUnitWork.lua:34-101 |
| 0x710 | 4 | u32 | `currentTargetFocusIdentifier` | Current target focus id. |  | Drive getBattleUnitWork.lua:34-101 |
| 0x714 | 2 | u16 | `currentAction` | Current action (section 14 row). | `BpActionList` | Drive getBattleUnitWork.lua:34-101 |
| 0x716 | 34 | bytes | `unknown716` | Not identified by any source; keep the original bytes. |  |  |
| 0x738 | 8 | u64 | `lastBattleLogicPlusPointer` | Last battle-logic-plus pointer. |  | Drive getBattleUnitWork.lua:34-101 |
| 0x740 | 4 | u32 | `lastTargetFocusIdentifier` | Last target focus id. |  | Drive getBattleUnitWork.lua:34-101 |
| 0x744 | 2 | u16 | `lastAction` | Last action. | `BpActionList` | Drive getBattleUnitWork.lua:34-101 |
| 0x746 | 2 | bytes | `unknown746` | Not identified by any source; keep the original bytes. |  |  |
| 0x748 | 4 | u32 | `autoAttackFocusIdentifier` | Auto-attack target focus id. |  | Drive getBattleUnitWork.lua:34-101; TK L728 |
| 0x74C | 4 | bytes | `unknown74C` | Not identified by any source; keep the original bytes. |  |  |
| 0x750 | 4 | u32 | `partyLeaderTargetFocusIdentifier` | Party leader target focus id. |  | Drive getBattleUnitWork.lua:34-101 |
| 0x754 | 8 | bytes | `unknown754` | Not identified by any source; keep the original bytes. |  |  |
| 0x75C | 4 | u32 | `idleChargeTime` | Idle charge time. |  | Drive getBattleUnitWork.lua:34-101 |
| 0x760 | 8 | bytes | `unknown760` | Not identified by any source; keep the original bytes. |  |  |
| 0x768 | 4 | u32 | `currentChargeTime` | Current charge time. |  | Drive getBattleUnitWork.lua:34-101 |
| 0x76C | 4 | u32 | `requiredChargeTime` | Required charge time. |  | Drive getBattleUnitWork.lua:34-101 |
| 0x770 | 4 | u32 | `lastChargeTime` | Last charge time. |  | Drive getBattleUnitWork.lua:34-101 |
| 0x774 | 8 | bytes | `unknown774` | Not identified by any source; keep the original bytes. |  |  |
| 0x77C | 4 | s32 | `activeTargetCount` | Number of active targets. The Toolkit places the 32-entry active target list at +0x778, so +0x778 is a list header and the 16-byte entries start at +0x780 (inferred). |  | Drive getBattleUnitWork.lua:34-101; TK L707 |
| 0x780 | 512 | bytes | `activeTargets` | 32 x 16-byte active target entries (entry layout not documented; inferred start). |  | TK L707 |
| 0x980 | 512 | bytes | `reflectTargets` | 32 x 16-byte reflect target entries (the Toolkit's offset; may also start with a header). |  | TK L708 |
| 0xB80 | 32 | bytes | `unknownB80` | Not identified by any source; keep the original bytes. |  |  |
| 0xBA0 | 2 | u16 | `manuallySelectedAction` | Action picked manually from the battle menu. | `BpActionList` | Drive getBattleUnitWork.lua:34-101 |
| 0xBA2 | 22 | bytes | `unknownBA2` | Not identified by any source; keep the original bytes. |  |  |
| 0xBB8 | 4 | u32 | `manuallySelectedTargetFocusIdentifier` | Target picked manually. |  | Drive getBattleUnitWork.lua:34-101 |
| 0xBBC | 8 | bytes | `unknownBBC` | Not identified by any source; keep the original bytes. |  |  |
| 0xBC4 | 4 | u32 | `potentialTargetCount` | Number of potential targets; the list starts at +0xBC0 (TK), entries from +0xBC8 (inferred). |  | Drive getBattleUnitWork.lua:34-101; TK L709 |
| 0xBC8 | 512 | bytes | `potentialTargets` | 32 x 16-byte potential target entries (ends at 0xDC7, right before modifiedContent). |  | TK L709 |
| 0xDC8 | 2 | u16 | `modifiedContent` | Modified content. |  | Drive getBattleUnitWork.lua:34-101; TK L729 |
| 0xDCA | 2 | bytes | `unknownDCA` | Not identified by any source; keep the original bytes. |  |  |
| 0xDCC | 4 | u32 | `battleStanceSwitchTime` | Battle stance switch time. |  | Drive getBattleUnitWork.lua:34-101 |
| 0xDD0 | 132 | bytes | `unknownDD0` | Not identified by any source; keep the original bytes. |  |  |
| 0xE54 | 4 | s32 | `removedGil` | Gil removed (e.g. Gil Toss). |  | Drive getBattleUnitWork.lua:34-101; TK L730 |
| 0xE58 | 4 | s32 | `addedGil` | Gil added. |  | Drive getBattleUnitWork.lua:34-101 |
| 0xE5C | 4 | bytes | `unknownE5C` | Not identified by any source; keep the original bytes. |  |  |
| 0xE60 | 8 | u64 | `ardUnit` | Pointer to this foe's ARD Unit record (ARD section 4) - the bridge from a live foe to its data. |  | Drive getBattleUnitWork.lua:34-101; TK L731, L360 |
| 0xE68 | 8 | u64 | `ardClass` | Pointer to the ARD Class record (section 2). |  | Drive getBattleUnitWork.lua:34-101; TK L364 |
| 0xE70 | 8 | u64 | `ardDefaultStats` | Pointer to the ARD Default Stats record (section 7). |  | TK L368 |
| 0xE78 | 8 | u64 | `ardAdditiveStats` | Pointer to the ARD Additive Stats record (section 8). |  | TK L372 |
| 0xE80 | 16 | bytes | `permanentAugments` | Permanent augments of the unit, 16 bytes (same 128-bit layout as the keep's augment sets). |  | Drive getBattleUnitWork.lua:34-101 |
| 0xE90 | 4 | bf32 | `permanentStatusEffectImmunities` | Permanent status immunities. | bits below | Drive getBattleUnitWork.lua:34-101 |
| 0xE94 | 4 | bytes | `unknownE94` | Not identified by any source; keep the original bytes. |  |  |
| 0xE98 | 1 | u8 | `eventFlagGroup` | Event flag group. |  | Drive getBattleUnitWork.lua:34-101; TK L732 |
| 0xE99 | 1 | bytes | `unknownE99` | Not identified by any source; keep the original bytes. |  |  |
| 0xE9A | 1 | bf8 | `deathFlags` | Death flags. | bits below | Drive getBattleUnitWork.lua:34-101 |
| 0xE9B | 13 | bytes | `unknownE9B` | Not identified by any source; keep the original bytes. |  |  |
| 0xEA8 | 1 | u8 | `attackerCount` | Attacker count. |  | Drive getBattleUnitWork.lua:34-101; TK L733 |
| 0xEA9 | 1 | u8 | `attackerIdentifier0` | Xeavin's class calls this byte `identifier`; the Toolkit says the attacker id list starts here (length not stated). |  | Drive getBattleUnitWork.lua:34-101; TK L733 |
| 0xEAA | 166 | bytes | `unknownEAA` | Not identified by any source; keep the original bytes. |  |  |

#### Bits of `battleUnitWork.battleFlags` (bf64 at 0x00; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 14 | `useManuallySelectedAction` |  |
| 22 | `counterState` |  |
| 23 | `isInBattleStance` |  |
| 46 | `noMovementState` |  |
| 48 | `canBeInBattleStance` |  |
| 52 | `isTargeted` |  |

#### Bits of `battleUnitWork.permanentStatusEffectImmunities` (bf32 at 0xE90; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `ko` |  |
| 1 | `stone` |  |
| 2 | `petrify` |  |
| 3 | `stop` |  |
| 4 | `sleep` |  |
| 5 | `confuse` |  |
| 6 | `doom` |  |
| 7 | `blind` |  |
| 8 | `poison` |  |
| 9 | `silence` |  |
| 10 | `sap` |  |
| 11 | `oil` |  |
| 12 | `reverse` |  |
| 13 | `disable` |  |
| 14 | `immobilize` |  |
| 15 | `slow` |  |
| 16 | `disease` |  |
| 17 | `lure` |  |
| 18 | `protect` |  |
| 19 | `shell` |  |
| 20 | `haste` |  |
| 21 | `bravery` |  |
| 22 | `faith` |  |
| 23 | `reflect` |  |
| 24 | `invisible` |  |
| 25 | `regen` |  |
| 26 | `float` |  |
| 27 | `berserk` |  |
| 28 | `bubble` |  |
| 29 | `hpCritical` |  |
| 30 | `libra` |  |
| 31 | `xZone` |  |

#### Bits of `battleUnitWork.deathFlags` (bf8 at 0xE9A; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `poison` |  |
| 1 | `petrify` |  |
| 2 | `poisonTick` |  |
| 3 | `noExpAndLp` |  |

### Record `battleActorModel` — 392 bytes (0x188), count: one per actor with a model

*Where:* Battle Actor Work +0xC0

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 312 | bytes | `unknown00` | Not identified by any source; keep the original bytes. |  |  |
| 0x138 | 8 | u64 | `battleActorKeep` | Pointer to the Battle Actor Keep. |  | Drive getBattleActorModel.lua:2-15; TK L396 |
| 0x140 | 8 | bytes | `unknown140` | Not identified by any source; keep the original bytes. |  |  |
| 0x148 | 4 | f32 | `weight` | Weight. |  | Drive getBattleActorModel.lua:2-15 |
| 0x14C | 1 | u8 | `modelVariation` | Model variation. |  | Drive getBattleActorModel.lua:2-15; TK L692 |
| 0x14D | 1 | u8 | `modelColorVariation` | Model colour variation. |  | Drive getBattleActorModel.lua:2-15 |
| 0x14E | 58 | bytes | `unknown14E` | Not identified by any source; keep the original bytes. |  |  |

### Record `battleActorKeep` — 304 bytes (0x130), count: one per actor model

*Where:* Battle Actor Model +0x138

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 8 | bytes | `unknown00` | Not identified by any source; keep the original bytes. |  |  |
| 0x08 | 4 | f32 | `weight` | Weight. |  | Drive getBattleActorKeep.lua:2-21 |
| 0x0C | 36 | bytes | `unknown0C` | Not identified by any source; keep the original bytes. |  |  |
| 0x30 | 4 | f32 | `positionX` | Current position X (4-float vector). |  | Drive getBattleActorKeep.lua:2-21; Drive getQuaternion.lua:2-14 |
| 0x34 | 4 | f32 | `positionY` | Current position Y. |  |  |
| 0x38 | 4 | f32 | `positionZ` | Current position Z. |  |  |
| 0x3C | 4 | f32 | `positionW` | Fourth component. |  |  |
| 0x40 | 16 | bytes | `unknown40` | Not identified by any source; keep the original bytes. |  |  |
| 0x50 | 4 | f32 | `currentColorRed` | Current colour R. |  | Drive getBattleActorKeep.lua:2-21; Drive getColors.lua:2-14 |
| 0x54 | 4 | f32 | `currentColorGreen` | Current colour G. |  |  |
| 0x58 | 4 | f32 | `currentColorBlue` | Current colour B. |  |  |
| 0x5C | 4 | f32 | `currentColorAlpha` | Current colour A. |  |  |
| 0x60 | 4 | f32 | `defaultColorRed` | Default colour R. |  | Drive getBattleActorKeep.lua:2-21 |
| 0x64 | 4 | f32 | `defaultColorGreen` | Default colour G. |  |  |
| 0x68 | 4 | f32 | `defaultColorBlue` | Default colour B. |  |  |
| 0x6C | 4 | f32 | `defaultColorAlpha` | Default colour A. |  |  |
| 0x70 | 16 | bytes | `unknown70` | Not identified by any source; keep the original bytes. |  |  |
| 0x80 | 2 | u16 | `animationState` | Animation state. |  | Drive getBattleActorKeep.lua:2-21 |
| 0x82 | 6 | bytes | `unknown82` | Not identified by any source; keep the original bytes. |  |  |
| 0x88 | 2 | s16 | `mapJumpGroup` | Map jump group. |  | Drive getBattleActorKeep.lua:2-21 |
| 0x8A | 2 | u16 | `terrain` | Terrain under the actor (MreTerrainList ids, see mrf). | `MreTerrainList` | Drive getBattleActorKeep.lua:2-21 |
| 0x8C | 60 | bytes | `unknown8C` | Not identified by any source; keep the original bytes. |  |  |
| 0xC8 | 4 | f32 | `movementSpeed` | Movement speed. |  | Drive getBattleActorKeep.lua:2-21; TK L693 |
| 0xCC | 44 | bytes | `unknownCC` | Not identified by any source; keep the original bytes. |  |  |
| 0xF8 | 4 | f32 | `yaw` | Yaw (radians). |  | TK L693 |
| 0xFC | 52 | bytes | `unknownFC` | Not identified by any source; keep the original bytes. |  |  |

## Enums carried in the JSON spec

#### `UnitTypeList`

| Value | Label |
|---|---|
| 0 (0x0) | None |
| 1 (0x1) | Foe / Party Member |
| 2 (0x2) | Reserve (0x02) |
| 3 (0x3) | Ally |
| 4 (0x4) | Gimmick |
| 5 (0x5) | Idle |
| 6 (0x6) | Reserve (0x06) |
| 7 (0x7) | Hunt / Boss |
| 8 (0x8) | Reserve (0x08) |
| 9 (0x9) | Reserve (0x09) |
| 10 (0xA) | Reserve (0x0A) |
| 11 (0xB) | Reserve (0x0B) |
| 12 (0xC) | Reserve (0x0C) |
| 13 (0xD) | Reserve (0x0D) |
| 14 (0xE) | Reserve (0x0E) |
| 15 (0xF) | Reserve (0x0F) |

#### `BceDespawnTypeList`

| Value | Label |
|---|---|
| 0 (0x0) | None |
| 1 (0x1) | Leader |
| 2 (0x2) | Position |

#### `BceFieldSignIconList`

| Value | Label |
|---|---|
| 0 (0x0) | None |
| 1 (0x1) | 1 Exclamation Point |
| 2 (0x2) | 2 Exclamation Points |
| 3 (0x3) | Magnifying Glass |

#### `BceOverheadIconTypeList`

| Value | Label |
|---|---|
| 0 (0x0) | Normal |
| 1 (0x1) | Shop |

#### `MreTerrainList`

| Value | Label |
|---|---|
| 0 (0x0) | Dirt / Soil |
| 1 (0x1) | Natural Stone / Rock |
| 2 (0x2) | Grass |
| 3 (0x3) | Unknown (0x03) |
| 4 (0x4) | Sand |
| 5 (0x5) | Snow |
| 6 (0x6) | Metal |
| 7 (0x7) | Wood |
| 8 (0x8) | Architecture (Stonework, Marble, Glass) |
| 9 (0x9) | Clay |
| 10 (0xA) | Carpet |
| 11 (0xB) | Stagnant Water |
| 12 (0xC) | Flowing Water |
| 13 (0xD) | Unknown (0x0D) |
| 14 (0xE) | Unknown (0x0E) |
| 15 (0xF) | Unknown (0x0F) |
| 16 (0x10) | Magickal Forcefield |
| 17 (0x11) | Ice |
| 18 (0x12) | Reserve (0x0C) |
| 19 (0x13) | Reserve (0x0D) |
| 20 (0x14) | Reserve (0x0E) |
| 21 (0x15) | Reserve (0x0F) |
| 22 (0x16) | Reserve (0x10) |
| 23 (0x17) | Reserve (0x11) |
| 24 (0x18) | Reserve (0x12) |
| 25 (0x19) | Reserve (0x13) |
| 26 (0x1A) | Reserve (0x14) |
| 27 (0x1B) | Reserve (0x15) |
| 28 (0x1C) | Reserve (0x16) |
| 29 (0x1D) | Reserve (0x17) |
| 30 (0x1E) | Reserve (0x18) |
| 31 (0x1F) | Reserve (0x19) |

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `BpActionList` | battlepack section 14 action rows |
| `ClassificationList` | foe classification ids |
| `GenusList` | foe genus ids |
| `CharacterNameList` | character name text ids |

## Round-trip rules

- Memory-only; nothing is written to files. Edits last until the actor/area is reloaded.
- Never write the pointer fields (battleActorWork, battleUnitKeep, ard*, battleActorModel ...) unless you know the target object; follow them read-only.
- Keep unknown bytes unchanged; many ranges are game-internal state.

## Known unknowns

- Most of Battle Actor Work / Model / Keep is unidentified (TK L1861).
- Layout of the 16-byte target entries and whether the reflect list has a header like the active/potential lists.
- Offsets of yaw, walk/run/battle-run speeds and flying height between BUW +0x158 and +0x190.
- Length of the attacker id list at BUW +0xEA9.
- Skeleton variants (Sign 128 B, Line 32 B, Unit 560 B) and task records (20 B / 40 B) are not mapped.

## Source keys

| Key | Source |
|---|---|
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of Xeavin's *The Insurgent's Toolkit* Cheat Engine table for FFXII TZA Steam 1.0.4.0), line n. |
| LL `<page>:<line>` | FF12 Lua Loader documentation, `docs/capabilities/<page>.md` (e.g. `save-config`, `memory`, `event`, `bpack`). |
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (fact reference only; its licence forbids copying or converting its code). |
| Drive `<script>:<line>` | Lua mod scripts from the user's Google Drive export (scratchpad `drive/` folder; file named `<id>__<script>`). Most are by Xeavin (*The Insurgent's Forge* helper classes such as `getBattleUnitKeep.lua`, and the mods *Manifesto*, *Companions*, *Itemized Bazaar*, *Thrifty Bazaar*); others by FehDead (`Wayfarer.lua`, `mappings.lua`, `frame.lua`, `layout.lua`) and LowPriorityCitizen (`helpers.lua`, `DuplicateAugmentDetector.lua`). They target the same Steam build as the Toolkit (same absolute addresses). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
| Lists `<name>` | Drop-down lists of The Insurgent's Toolkit (`editor/data/lists.json`, or the full extraction `ct_lists.json`). |

All absolute addresses (e.g. `0x02EBF190`) are for the Steam build the Toolkit targets (1.0.4.0); they are
module-relative offsets as used by Cheat Engine and the Lua Loader. `[X]` means "the 64-bit pointer stored at X".

### Drive files cited

| Script | Drive file id(s) |
|---|---|
| `BlueMagick.lua` | `1EpHxWu6hr2hc1qMTvwUpoPuo1n-0XJXY` |
| `SummonProbe.lua` | `1EveYk35rzfFAwLcrT9T-ICZuyMH-Oxw-` |
| `getBattleActorKeep.lua` | `1HIKdVfn7npJzp6i6E8-LuBSFb4LIlI7-` |
| `getBattleActorModel.lua` | `1MOwarue0rRMaKb5q3_2v1jvToNcc5sY8` |
| `getBattleActorWork.lua` | `12u8IwRqRUaCcq4l1KMWM5Y6WI_gcoAfM` |
| `getBattleUnitWork.lua` | `1Q8DJGxsTHGSf44y5A2U_whqim2JJXorH` (Forge class with offsets); `1tNgsB5hTO8D2PhBxVxcHP4XH_k2w4zjQ` (assembly calling 0x0031B860) |
| `getColors.lua` | `188_QttRTxePG9OV7qRhcmRtjaoKQoSjL` |
| `getQuaternion.lua` | `1zneXIueeradOBP9UC8DlyMWGHeR6D17V` |
