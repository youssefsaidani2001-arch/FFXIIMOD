# Battlepack section 14 — Actions

Spec id: `battlepack-s14-actions` · machine spec: [`battlepack-s14-actions.json`](./battlepack-s14-actions.json)

Battlepack **section 14** is the action database: every attack, magick, technick, item use, foe ability,
esper/guest move, Mist and quickening action is one 60-byte row. It controls targeting, range and area of
effect, formula and power, cost and charge time, elements and statuses, animations, battle-menu filing,
gambit-menu placement and enmity. The Workshop maps `section_014.bin` here (IW Resources/JsonFile.cs:36);
the Toolkit calls it the most detailed record in the battlepack (TK L859-L903).

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

Section 14 specifics: `entrySize` = 60 (0x3C) (IW Actions.cs:18). Header slots 0x10/0x14/0x18/0x1C are written
as 0 by the Workshop.

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…`/`unused…` are not interpreted by any source; keep their original bytes.

### Record `header` — 32 bytes (0x20), count: 1

*Where:* Offset 0 of battlepack section 14.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `magic` | ASCII 'st2e' (73 74 32 65); reject the section if different. |  | IW Formats/St2e.cs:9,20 |
| 0x04 | 4 | u32 | `entryCount` | Number of actions (the Toolkit lists name 543 rows, 0-542). |  | IW Formats/St2e.cs:25 |
| 0x08 | 2 | u16 | `entrySize` | Bytes per entry; 60 (0x3C) for this section. |  | IW Formats/St2e.cs:26 |
| 0x0A | 2 | bytes | `unknown0A` | Not interpreted; keep. |  | IW Formats/St2e.cs:27 |
| 0x0C | 4 | u32 | `entryListOffset` | Offset of entry 0 from the section start: 32 when entryCount > 0, else 0. |  | IW Formats/St2e.cs:28,39 |
| 0x10 | 4 | u32 | `offset10` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:29 |
| 0x14 | 4 | u32 | `textSectionOffset` | Inline text offset; 0 on disk for this section (filled at run time). No strings are stored here. |  | IW Formats/St2e.cs:30; TK L262, L978 |
| 0x18 | 4 | u32 | `offset18` | Unknown offset slot (0 in Workshop output for this section). |  | IW Formats/St2e.cs:31 |
| 0x1C | 4 | u32 | `offset1C` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:32 |

### Record `action` — 60 bytes (0x3C), count: header.entryCount

*Where:* st2e entries of section 14: header.entryListOffset + i*60

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `battleMenuDescription` | Help text shown in the battle menu (battle-action help block, 4000+). | `MenuBattleActionList` | IW Actions.cs:31 |
| 0x02 | 1 | u8 | `dashRangeTo` | Dash/approach distance toward the target (tenths of a unit, animation relative). |  | IW Actions.cs:32; TK L869 |
| 0x03 | 1 | u8 | `dashRangeFrom` | Dash/return distance away from the target. |  | IW Actions.cs:33; TK L869 |
| 0x04 | 1 | u8 | `knockbackChance` | Knockback chance; only read by some formulas (msg 649). |  | IW Actions.cs:34 |
| 0x05 | 1 | u8 | `range` | Cast range (tenths of a unit). |  | IW Actions.cs:35; TK L871 |
| 0x06 | 1 | u8 | `areaOfEffectRange` | Area-of-effect radius/size. |  | IW Actions.cs:36; LL section14.md (areaOfEffectSize) |
| 0x07 | 1 | u8 | `areaOfEffectPositioningRange` | Second AoE dimension: cone angle or line length depending on the shape bits; also the start/end distance of moves such as Jump (msg 616). |  | IW Actions.cs:37; LL section14.md |
| 0x08 | 1 | u8 | `formula` | Damage/effect formula id (109 formulas, 0 = none). The formula decides which of the other fields are used (msg 655). | `BpeFormulaList` | IW Actions.cs:38; TK L873 |
| 0x09 | 1 | u8 | `chargeTime` | Charge time before execution. |  | IW Actions.cs:39 |
| 0x0A | 1 | u8 | `mpOrMistCost` | MP cost, or Mist charge cost for Mist/quickening actions. |  | IW Actions.cs:40 |
| 0x0B | 1 | u8 | `unknown0B` | Unconfirmed; tentatively an esper/technick rank (Workshop label carries a question mark). |  | IW Actions.cs:41,261; TK L876 |
| 0x0C | 4 | bf32 | `flags1` | Targeting and behaviour flags. The Workshop keeps it as a raw u32; bit names from the Lua Loader docs and the Toolkit. | bits below | IW Actions.cs:42; LL section14.md; TK L877 |
| 0x10 | 1 | u8 | `power` | Base power. |  | IW Actions.cs:43 |
| 0x11 | 1 | u8 | `powerMultiplier` | Power multiplier. |  | IW Actions.cs:44 |
| 0x12 | 1 | u8 | `accuracyRate` | Accuracy. |  | IW Actions.cs:45 |
| 0x13 | 1 | bf8 | `elements` | Element(s) of the action. | `ElementFlags` | IW Actions.cs:46; IW Helpers/EnumHelper.cs:113-125 |
| 0x14 | 1 | u8 | `onHitRate` | Chance to inflict statusEffects on hit. |  | IW Actions.cs:47 |
| 0x15 | 1 | u8 | `amountMultiplier` | Additional/amount multiplier (Workshop: "additional power multiplier"). |  | IW Actions.cs:48; LL section14.md |
| 0x16 | 2 | bytes | `unused16` | Unused; the Workshop skips them. |  | IW Actions.cs:49 |
| 0x18 | 4 | bf32 | `statusEffects` | Statuses added or removed (see flags3.statusEffectActionType). | `StatusEffectFlags` | IW Actions.cs:50; IW Helpers/EnumHelper.cs:75-111 |
| 0x1C | 1 | u8 | `characterAnimation` | Character pose used while acting (Workshop: "cast animation"). | `BpeCharacterAnimationList` | IW Actions.cs:51; TK L884 |
| 0x1D | 1 | u8 | `enmityAddSelfVsFoe` | Enmity the user gains with foes when targeting a foe. |  | IW Actions.cs:52 |
| 0x1E | 1 | u8 | `battleMenuCategory` | Battle-menu category the action is filed under (Attack, Magicks, Technicks …). | `BpCategoryList` | IW Actions.cs:53 |
| 0x1F | 1 | u8 | `enmityAddSelfVsAlly` | Enmity the user gains when targeting an ally. |  | IW Actions.cs:54 |
| 0x20 | 1 | u8 | `enmityRemoveAlliesVsFoe` | Enmity removed from the other allies when targeting a foe. |  | IW Actions.cs:55 |
| 0x21 | 1 | u8 | `chargeAuraAnimation` | Aura shown while charging. | `BpeChargeAuraAnimationList` | IW Actions.cs:56 |
| 0x22 | 2 | u16 | `requiredContent` | Content id the action needs/consumes (item for item actions, ammo/loot for technicks). | `ContAllList` | IW Actions.cs:57; TK L888 |
| 0x24 | 2 | u16 | `castAnimationOrEventScript` | Effect animation id, or an event-script id when flags1.useEventScript is set (Workshop: "after animation"). | `BpeCastAnimationList` | IW Actions.cs:58; LL section14.md; TK L889 |
| 0x26 | 2 | u16 | `summonedPartyMember` | Section 16 row that is summoned (espers/guests); only meaningful for summon-type actions (msg 556). | `PartyMemberList` | IW Actions.cs:59 |
| 0x28 | 2 | u16 | `mistCastAnimation` | Mist/quickening related id (Toolkit and Lua docs: mist cast animation; Workshop: "mist action"). |  | IW Actions.cs:60; TK L891 |
| 0x2A | 2 | bytes | `unused2A` | Unused; the Workshop skips them. |  | IW Actions.cs:61 |
| 0x2C | 2 | bf16 | `flags2` | Category and effect flags (raw u16 in the Workshop). | bits below | IW Actions.cs:62; LL section14.md; TK L892 |
| 0x2E | 2 | u16 | `inventoryMenuDescription` | Help text in the inventory/skill menus (inventory-action help block, 10000+). | `MenuInventoryActionList` | IW Actions.cs:63 |
| 0x30 | 4 | u32 | `specialCharacterAnimation` | Link to a special character animation (Workshop: "character animation link"). |  | IW Actions.cs:64; LL section14.md |
| 0x34 | 2 | u16 | `name` | Name text id (action block, 0+). | `DescActionList` | IW Actions.cs:65 |
| 0x36 | 2 | bf16 | `flags3` | AI/targeting condition flags (Workshop: "AI target condition flags"); bits 6-15 unused. | bits below | IW Actions.cs:66; LL section14.md |
| 0x38 | 1 | s8 | `gambitPage` | Gambit action-menu page, 0-10, or -1 (0xFF) if not listed. |  | IW Actions.cs:67,219-221; TK L897 |
| 0x39 | 1 | s8 | `gambitPageOrder` | Position on that page, 0-16, or -1 (0xFF). |  | IW Actions.cs:68,235-237; TK L898 |
| 0x3A | 1 | u8 | `battleMemoryFlag` | Which "battle memory" category the AI records for this action (Workshop: "enable AI flag"; Lua docs: enableBattleMemoryFlag); 255 = none. | `BpeBattleMemoryFlagList` | IW Actions.cs:69 |
| 0x3B | 1 | u8 | `unused3B` | Unused; the Workshop writes 0. |  | IW Actions.cs:70,121 |

#### Bits of `action.flags1` (bf32 at 0x0C; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 0 | 0x00000001 | `canTargetSelf` |  |
| 1 | 0x00000002 | `reflectToParty` | reflected copies bounce onto the party side |
| 2 | 0x00000004 | `canTargetAlly` |  |
| 3 | 0x00000008 | `canTargetFoe` |  |
| 4 | 0x00000010 | `unknownBit4` |  |
| 5-7 | 0x000000E0 | `initialTarget` | where the cursor starts; enum `BpeActionInitialTargetList` |
| 8-9 | 0x00000300 | `battleMenuType` | named by the Toolkit; the Lua docs call bits 8-9 unknown; enum `BpeBattleMenuTypeList` |
| 10 | 0x00000400 | `unknownBit10` |  |
| 11 | 0x00000800 | `isPositive` | beneficial action |
| 12 | 0x00001000 | `noAreaOfEffectIndicators` |  |
| 13 | 0x00002000 | `allowMagickImmunity` |  |
| 14 | 0x00004000 | `allowPhysicalImmunity` |  |
| 15 | 0x00008000 | `unknownBit15` |  |
| 16 | 0x00010000 | `allowReflect` |  |
| 17 | 0x00020000 | `allowMagickEvade` |  |
| 18 | 0x00040000 | `unknownBit18` |  |
| 19 | 0x00080000 | `denyWhileSilenced` |  |
| 20 | 0x00100000 | `unknownBit20` |  |
| 21 | 0x00200000 | `areaOfEffectOrigin` | enum `BpeAoeOriginList` |
| 22 | 0x00400000 | `unknownBit22` |  |
| 23 | 0x00800000 | `unknownBit23` |  |
| 24-25 | 0x03000000 | `areaOfEffectShape` | enum `BpeAoeShapeList` |
| 26 | 0x04000000 | `useWeaponRange` |  |
| 27 | 0x08000000 | `useWeaponChargeTime` |  |
| 28 | 0x10000000 | `canTargetReserve` |  |
| 29 | 0x20000000 | `hasMpOrMistCost` |  |
| 30 | 0x40000000 | `useEventScript` | 0x24 holds an event-script id instead of a cast animation |
| 31 | 0x80000000 | `hasCountableRequiredContent` | requiredContent is consumed/counted |

#### Bits of `action.elements` (bf8 at 0x13; bit 0 = least significant bit of the little-endian value)

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

#### Bits of `action.statusEffects` (bf32 at 0x18; bit 0 = least significant bit of the little-endian value)

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

#### Bits of `action.flags2` (bf16 at 0x2C; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 0-2 | 0x0007 | `magickCategory` | White/Black/Time/Green/Arcane; enum `BpMagickCategoryList` |
| 3 | 0x0008 | `triggersInquisitor` |  |
| 4 | 0x0010 | `triggersWarmage` |  |
| 5 | 0x0020 | `unknownBit5` |  |
| 6 | 0x0040 | `canTargetKo` |  |
| 7 | 0x0080 | `canTargetStone` |  |
| 8 | 0x0100 | `pauseDuringExecution` |  |
| 9 | 0x0200 | `applyOnlyOneStatusEffect` |  |
| 10 | 0x0400 | `removesSleepAndConfuse` |  |
| 11 | 0x0800 | `removesInvisible` |  |
| 12 | 0x1000 | `canRestoreHp` |  |
| 13 | 0x2000 | `noLicenseRequired` | usable without owning the license |
| 14 | 0x4000 | `isOffensive` |  |
| 15 | 0x8000 | `canRestoreMp` |  |

#### Bits of `action.flags3` (bf16 at 0x36; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 0-1 | 0x0003 | `statusEffectActionType` | whether statusEffects are added or removed; enum `BpeStatusEffectActionTypeList` |
| 2-3 | 0x000C | `areaOfEffectTargetRelation` | enum `BpeAoeTargetRelationList` |
| 4 | 0x0010 | `canTargetFlying` |  |
| 5 | 0x0020 | `canTargetUndead` |  |

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

#### `BpeActionInitialTargetList` (Lists: BpeActionInitialTargetList)

| Value | Label |
|---|---|
| 1 (0x1) | Party (With Status Effect) |
| 2 (0x2) | Self |
| 4 (0x4) | Foe |

#### `BpeBattleMenuTypeList` (Lists: BpeBattleMenuTypeList)

| Value | Label |
|---|---|
| 0 (0x0) | None |
| 1 (0x1) | Magick |
| 2 (0x2) | Technick |
| 3 (0x3) | Item |

#### `BpeAoeOriginList` (Lists: BpeAoeOriginList)

| Value | Label |
|---|---|
| 0 (0x0) | Target |
| 1 (0x1) | Caster |

#### `BpeAoeShapeList` (Lists: BpeAoeShapeList)

| Value | Label |
|---|---|
| 0 (0x0) | Circle |
| 1 (0x1) | Cone |
| 2 (0x2) | Linear |

#### `BpeStatusEffectActionTypeList` (Lists: BpeStatusEffectActionTypeList)

| Value | Label |
|---|---|
| 0 (0x0) | None |
| 1 (0x1) | Add |
| 2 (0x2) | Remove |

#### `BpeAoeTargetRelationList` (Lists: BpeAoeTargetRelationList)

| Value | Label |
|---|---|
| 0 (0x0) | Same |
| 1 (0x1) | Opposite |
| 2 (0x2) | All |

#### `BpMagickCategoryList` (Lists: BpMagickCategoryList)

| Value | Label |
|---|---|
| 0 (0x0) | White Magicks |
| 1 (0x1) | Black Magicks |
| 2 (0x2) | Time Magicks |
| 3 (0x3) | Green Magicks |
| 4 (0x4) | Arcane Magicks |

#### `BpeCharacterAnimationList` (Lists: BpeCharacterAnimationList)

| Value | Label |
|---|---|
| 0 (0x0) | Attack |
| 1 (0x1) | Magick |
| 2 (0x2) | Item (Beneficial) |
| 3 (0x3) | Technick |
| 4 (0x4) | Item (Detrimental) |
| 5 (0x5) | Steal |
| 6 (0x6) | Quickening |
| 7 (0x7) | Esper Technick |
| 8 (0x8) | Summon |
| 9 (0x9) | Concurrence |

#### `BpeChargeAuraAnimationList` (Lists: BpeChargeAuraAnimationList)

| Value | Label |
|---|---|
| 0 (0x0) | Attack |
| 1 (0x1) | White Magick |
| 2 (0x2) | Black Magick |
| 3 (0x3) | Time Magick |
| 4 (0x4) | Green Magick |
| 5 (0x5) | Arcane Magick |
| 6 (0x6) | Mist |
| 7 (0x7) | Technick |
| 8 (0x8) | Item |

#### `BpCategoryList` (Lists: BpCategoryList)

| Value | Label |
|---|---|
| 0 (0x0) | Attack |
| 1 (0x1) | Magicks |
| 2 (0x2) | Technicks |
| 3 (0x3) | Items |
| 4 (0x4) | Reserve (0x04) |
| 5 (0x5) | Summon |
| 6 (0x6) | Quickening |
| 7 (0x7) | Foecraft |
| 8 (0x8) | Traps |
| 9 (0x9) | Esper Technicks |
| 10 (0xA) | Concurrences |
| 11 (0xB) | Dismiss |
| 12 (0xC) | Reserve (0x0C) |
| 13 (0xD) | Gambits |
| 14 (0xE) | Cancel |
| 15 (0xF) | Esper Cancel |
| 16 (0x10) | Escape |
| 17 (0x11) | Escape Cancel |
| 18 (0x12) | Magicks & Technicks |
| 19 (0x13) | Mist |
| 20 (0x14) | Reserve (0x14) |
| 255 (0xFF) | None |

#### `BpeBattleMemoryFlagList` (Lists: BpeBattleMemoryFlagList)

| Value | Label |
|---|---|
| 0 (0x0) | Element Fire |
| 1 (0x1) | Element Lightning |
| 2 (0x2) | Element Ice |
| 3 (0x3) | Element Earth |
| 4 (0x4) | Element Water |
| 5 (0x5) | Element Wind |
| 6 (0x6) | Element Holy |
| 7 (0x7) | Element Dark |
| 8 (0x8) | Magick-Immunity Susceptible Action |
| 9 (0x9) | Physical-Immunity Susceptible Action |
| 10 (0xA) | Eksir Berries |
| 11 (0xB) | Steal |
| 12 (0xC) | Full Heal |
| 13 (0xD) | Stats Reduction |
| 14 (0xE) | Dispels |
| 15 (0xF) | Non-Elemental |
| 16 (0x10) | Partial Heal |
| 17 (0x11) | Reserve (0x11) |
| 18 (0x12) | Reserve (0x12) |
| 19 (0x13) | Reserve (0x13) |
| 20 (0x14) | Reserve (0x14) |
| 21 (0x15) | Reserve (0x15) |
| 22 (0x16) | Reserve (0x16) |
| 23 (0x17) | Reserve (0x17) |
| 24 (0x18) | Reserve (0x18) |
| 25 (0x19) | Reserve (0x19) |
| 26 (0x1A) | Reserve (0x1A) |
| 27 (0x1B) | Reserve (0x1B) |
| 28 (0x1C) | Reserve (0x1C) |
| 29 (0x1D) | Reserve (0x1D) |
| 30 (0x1E) | Reserve (0x1E) |
| 31 (0x1F) | Battle Stance |
| 255 (0xFF) | None |

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `MenuBattleActionList` | battle-menu help text ids 4000+ |
| `MenuInventoryActionList` | inventory help text ids 10000+ |
| `DescActionList` | action name text ids 0-544 |
| `BpeFormulaList` | 109 formulas: 0 None, 1 Remove Status, 2 Add Buff, 3 Add Debuff … 108 Missing HP Damage |
| `BpeCastAnimationList` | effect animation ids (665 entries, 65535 = none; 0x80xx range shared with weapon particle effects) |
| `ContAllList` | content ids (category<<12 \| index) |
| `PartyMemberList` | section 16 rows (0 Vaan … 39 Zodiark; 0xFF/0xFFFF = none) |
| `BpActionList` | row labels: row -> action name |

## Count and size rules

- `entryCount` rows of 60 bytes. Rows are referenced by index from many places (Magicks/Technicks/Items tables,
  license contents, gambit action pages, AI scripts in ARD files, section 10 action groups), so never reorder or
  delete. Appending rows is structurally fine for the file (only entryCount and the section length change), but
  whether the engine accepts extra rows everywhere is unverified; the Revenant-Wings mod in this repo instead
  re-purposes existing rows (docs/DESIGN.md).
- `gambitPage` must be -1 or 0-10 and `gambitPageOrder` -1 or 0-16 (IW Actions.cs:219-237). After editing
  them live, the Toolkit rebuilds the gambit action pages (TK L903).
- Value ranges are generally the full unsigned byte/word; the developers use 255/65535 as "none" sentinels and
  rarely negative numbers, so treat fields as unsigned unless stated (msg 534-537, 555, 617-621).

### Text

These tables hold no strings. Every name/description field is a **u16 text id** in the game-wide battle text
id space, which is split into blocks per family (TK L1520-L1563): e.g. action names 0+, equipment names
2048+, battle-menu labels 8192+, status names 10240+, gambit names 12288+, character names 16384+, bazaar
names 18432+; long help texts use ids 3000+, 4000+ (battle actions), 10000+ (inventory actions), 12000+ (status),
16000+ (gambit targets), 22000+ (bazaar). `65535` means *none*. The strings live in the text files of the nested
pack in battlepack **section 61** (15 sub-sections, IW Resources/PackFile.cs:21, IW Resources/OtherFile.cs:23,
msg 1005) and in section 2. Renaming something is a text edit there, not an edit here.

## Pointers / cross references

No in-file pointers. Outgoing references: `summonedPartyMember` -> section 16 row; `battleMenuCategory` ->
section 17 category; `flags2.magickCategory` -> section 11; `requiredContent` -> content id;
`formula` -> engine formula table (not in the battlepack); text ids -> section 61 text.

## Round-trip rules

- Edit fields in place; the record size is fixed and nothing in this section points at entries, so value edits never move data.
- Copy every byte that no field interprets (unknown*/unused*/padding, unnamed bits) from the original; the Workshop writer zero-fills them (it seeks over them), so do not use its output as the byte-identical reference.
- Keep the st2e header bytes verbatim except entryCount (and entryListOffset when the count goes to/from 0).
- Keep the trailing zero padding that rounds the section to a multiple of 16 bytes.
- If the section length changes (added/removed entries), rewrite the battlepack offset table: every later section offset and the end offset shift by the padded size delta.
- flags1/flags2/flags3 are opaque words for unknown bits: set or clear only the named bits.
- Write gambitPage/gambitPageOrder as signed bytes: -1 is stored as 0xFF.
- Do not reorder or delete rows; other tables reference actions by row index.

## Known unknowns

- Byte 0x0B: possibly an esper/technick rank; unconfirmed in every source.
- flags1 bits 4, 10, 15, 18, 20, 22, 23 and flags2 bit 5 are unnamed; flags1 bits 8-9 are "battle menu type" only per the Toolkit.
- Exact meaning of mistCastAnimation (0x28) and specialCharacterAnimation (0x30) value spaces.
- Which fields each formula actually reads is formula-specific and undocumented here (msg 649, 655).
- Units of range/dash (tenths per the Toolkit) are not verified against vanilla data.

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; license forbids copying or converting its code). Paths are relative to that repo, e.g. `Formats/Battlepack/Actions.cs`, `Formats/St2e.cs`, `Helpers/PackHelper.cs`, `Helpers/EnumHelper.cs`, `Resources/JsonFile.cs`, `Resources/PackFile.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| LL `sectionNN.md` | FF12 Lua Loader documentation, `capabilities/bpack-sections/sectionNN.md` (field names of the loader's read-only `game.bpack` view). |
| Lists | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json` (list name given). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
