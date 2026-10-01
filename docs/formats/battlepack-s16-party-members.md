# Battlepack section 16 — Party Members

Spec id: `battlepack-s16-party-members` · machine spec: [`battlepack-s16-party-members.json`](./battlepack-s16-party-members.json)

Battlepack **section 16** holds one 128-byte template per party member: the six playable characters, guests
and the espers. A template sets starting level, base stats and their growth modifiers, default equipment,
quickenings, default gambit set, innate statuses/immunities/augments, a 10-slot inventory (which for guests
and espers is their ability list), model and weight. The Workshop maps `section_016.bin` here
(IW Resources/JsonFile.cs:38); the Toolkit's Reset Equipment / Reset Gambits read these rows (TK L542-L543, L907).

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

Section 16 specifics: `entrySize` = 128 (0x80) (IW PartyMembers.cs:24).

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…`/`unused…` are not interpreted by any source; keep their original bytes.

### Record `header` — 32 bytes (0x20), count: 1

*Where:* Offset 0 of battlepack section 16.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `magic` | ASCII 'st2e' (73 74 32 65); reject the section if different. |  | IW Formats/St2e.cs:9,20 |
| 0x04 | 4 | u32 | `entryCount` | Number of party-member templates (40 in the vanilla game: playable characters, guests and the 13 espers). |  | IW Formats/St2e.cs:25 |
| 0x08 | 2 | u16 | `entrySize` | Bytes per entry; 128 (0x80) for this section. |  | IW Formats/St2e.cs:26 |
| 0x0A | 2 | bytes | `unknown0A` | Not interpreted; keep. |  | IW Formats/St2e.cs:27 |
| 0x0C | 4 | u32 | `entryListOffset` | Offset of entry 0 from the section start: 32 when entryCount > 0, else 0. |  | IW Formats/St2e.cs:28,39 |
| 0x10 | 4 | u32 | `offset10` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:29 |
| 0x14 | 4 | u32 | `textSectionOffset` | Inline text offset; 0 on disk for this section (filled at run time). No strings are stored here. |  | IW Formats/St2e.cs:30; TK L262, L978 |
| 0x18 | 4 | u32 | `offset18` | Unknown offset slot (0 in Workshop output for this section). |  | IW Formats/St2e.cs:31 |
| 0x1C | 4 | u32 | `offset1C` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:32 |

### Record `partyMember` — 128 bytes (0x80), count: header.entryCount (vanilla 40)

*Where:* st2e entries of section 16: header.entryListOffset + i*128

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bf32 | `restrictedEquipmentCategories` | Equipment categories this member may NOT use (a set bit forbids the category, TK L914). Bits 27-31 unused. | `EquipmentCategoryFlags` | IW PartyMembers.cs:37,343-374; TK L914 |
| 0x04 | 1 | u8 | `quickening1` | Quickening (Mist) slot 1. | `BpMistList` | IW PartyMembers.cs:39-42 |
| 0x05 | 1 | u8 | `quickening2` | Quickening slot 2. | `BpMistList` | IW PartyMembers.cs:39-42 |
| 0x06 | 1 | u8 | `quickening3` | Quickening slot 3. | `BpMistList` | IW PartyMembers.cs:39-42 |
| 0x07 | 1 | u8 | `cameraPositionLink` | Behind-camera preset id (255 = none, 0-15). |  | IW PartyMembers.cs:44; TK L1194 |
| 0x08 | 2 | bytes | `unknown08` | Not interpreted. |  | IW PartyMembers.cs:45 |
| 0x0A | 2 | u16 | `weapon` | Default weapon (re-equipped by the Toolkit's Reset Equipment, TK L542). | `BpEquipmentList` | IW PartyMembers.cs:46 |
| 0x0C | 2 | u16 | `offhand` | Default off-hand (shield/ammo). | `BpEquipmentList` | IW PartyMembers.cs:47 |
| 0x0E | 2 | u16 | `helm` | Default helm. | `BpEquipmentList` | IW PartyMembers.cs:48 |
| 0x10 | 2 | u16 | `armor` | Default armor. | `BpEquipmentList` | IW PartyMembers.cs:49 |
| 0x12 | 2 | u16 | `accessory` | Default accessory. | `BpEquipmentList` | IW PartyMembers.cs:50 |
| 0x14 | 2 | u16 | `defaultGambitSet` | Section 8 gambit-set row PLUS 0x5000 (stored in content-id form; subtract 20480 to get the row). |  | IW PartyMembers.cs:51,142; TK L918 |
| 0x16 | 2 | u16 | `maxHp` | Base max HP. |  | IW PartyMembers.cs:52 |
| 0x18 | 1 | u8 | `maxHpExtendedModifier` | Max HP growth modifier (secondary). |  | IW PartyMembers.cs:53 |
| 0x19 | 1 | u8 | `maxHpBaseModifier` | Max HP growth modifier (primary). |  | IW PartyMembers.cs:54 |
| 0x1A | 2 | u16 | `maxMp` | Base max MP. |  | IW PartyMembers.cs:55 |
| 0x1C | 1 | u8 | `unknown1C` | Not interpreted. |  | IW PartyMembers.cs:56 |
| 0x1D | 1 | u8 | `maxMpModifier` | Max MP growth modifier. |  | IW PartyMembers.cs:57 |
| 0x1E | 1 | u8 | `strength` | Base Strength. |  | IW PartyMembers.cs:58 |
| 0x1F | 1 | u8 | `strengthModifier` | Strength growth modifier. |  | IW PartyMembers.cs:59 |
| 0x20 | 1 | u8 | `unknown20` | Not interpreted. |  | IW PartyMembers.cs:60 |
| 0x21 | 1 | u8 | `magickPower` | Base Magick Power. |  | IW PartyMembers.cs:61 |
| 0x22 | 1 | u8 | `magickPowerModifier` | Magick Power growth modifier. |  | IW PartyMembers.cs:62 |
| 0x23 | 1 | u8 | `unknown23` | Not interpreted. |  | IW PartyMembers.cs:63 |
| 0x24 | 1 | u8 | `vitality` | Base Vitality. |  | IW PartyMembers.cs:64 |
| 0x25 | 1 | u8 | `vitalityModifier` | Vitality growth modifier. |  | IW PartyMembers.cs:65 |
| 0x26 | 1 | u8 | `unknown26` | Not interpreted. |  | IW PartyMembers.cs:66 |
| 0x27 | 1 | u8 | `speed` | Base Speed. |  | IW PartyMembers.cs:67 |
| 0x28 | 1 | u8 | `speedModifier` | Speed growth modifier. |  | IW PartyMembers.cs:68 |
| 0x29 | 1 | u8 | `unknown29` | Not interpreted. |  | IW PartyMembers.cs:69 |
| 0x2A | 1 | u8 | `evade` | Base Evade. |  | IW PartyMembers.cs:70 |
| 0x2B | 1 | u8 | `detectionRange` | Detection range. |  | IW PartyMembers.cs:71 |
| 0x2C | 1 | bf8 | `flags` | Only bits 3-4 and 6 are known; the Workshop rebuilds the byte from them (others become 0). | bits below | IW PartyMembers.cs:72-74,129-131; TK L921 |
| 0x2D | 1 | u8 | `unknown2D` | Not interpreted. |  | IW PartyMembers.cs:75 |
| 0x2E | 1 | u8 | `level` | Starting level. |  | IW PartyMembers.cs:76 |
| 0x2F | 1 | u8 | `unknown2F` | Not interpreted. |  | IW PartyMembers.cs:77 |
| 0x30 | 2 | u16 | `name` | Name text id (character-name block, 16384+). | `DescNameList` | IW PartyMembers.cs:78 |
| 0x32 | 1 | u8 | `summonTime` | Summon duration for espers; 0 for normal characters (non-zero marks the vanilla esper rows, docs/DESIGN.md). |  | IW PartyMembers.cs:79 |
| 0x33 | 1 | u8 | `unknown33` | Not interpreted. |  | IW PartyMembers.cs:80 |
| 0x34 | 1 | u8 | `inventory1Quantity` | Quantity for inventory slot 1; pairs with inventory1Content at 0x58. |  | IW PartyMembers.cs:82-86 |
| 0x35 | 1 | u8 | `inventory2Quantity` | Quantity for inventory slot 2; pairs with inventory2Content at 0x5A. |  | IW PartyMembers.cs:82-86 |
| 0x36 | 1 | u8 | `inventory3Quantity` | Quantity for inventory slot 3; pairs with inventory3Content at 0x5C. |  | IW PartyMembers.cs:82-86 |
| 0x37 | 1 | u8 | `inventory4Quantity` | Quantity for inventory slot 4; pairs with inventory4Content at 0x5E. |  | IW PartyMembers.cs:82-86 |
| 0x38 | 1 | u8 | `inventory5Quantity` | Quantity for inventory slot 5; pairs with inventory5Content at 0x60. |  | IW PartyMembers.cs:82-86 |
| 0x39 | 1 | u8 | `inventory6Quantity` | Quantity for inventory slot 6; pairs with inventory6Content at 0x62. |  | IW PartyMembers.cs:82-86 |
| 0x3A | 1 | u8 | `inventory7Quantity` | Quantity for inventory slot 7; pairs with inventory7Content at 0x64. |  | IW PartyMembers.cs:82-86 |
| 0x3B | 1 | u8 | `inventory8Quantity` | Quantity for inventory slot 8; pairs with inventory8Content at 0x66. |  | IW PartyMembers.cs:82-86 |
| 0x3C | 1 | u8 | `inventory9Quantity` | Quantity for inventory slot 9; pairs with inventory9Content at 0x68. |  | IW PartyMembers.cs:82-86 |
| 0x3D | 1 | u8 | `inventory10Quantity` | Quantity for inventory slot 10; pairs with inventory10Content at 0x6A. |  | IW PartyMembers.cs:82-86 |
| 0x3E | 2 | u16 | `gil` | Starting gil. |  | IW PartyMembers.cs:88 |
| 0x40 | 4 | bytes | `unknown40` | Not interpreted. |  | IW PartyMembers.cs:89 |
| 0x44 | 2 | u16 | `lp` | Starting LP. |  | IW PartyMembers.cs:90 |
| 0x46 | 1 | u8 | `mistBars` | Number of Mist (MP) bars. |  | IW PartyMembers.cs:91 |
| 0x47 | 1 | u8 | `initialMpPercentage` | MP percentage on entry. |  | IW PartyMembers.cs:92 |
| 0x48 | 4 | bf32 | `statusEffects` | Permanent/initial status effects. | `StatusEffectFlags` | IW PartyMembers.cs:93; IW Helpers/EnumHelper.cs:75-111 |
| 0x4C | 4 | bf32 | `statusEffectImmunities` | Status immunities. | `StatusEffectFlags` | IW PartyMembers.cs:94; IW Helpers/EnumHelper.cs:75-111 |
| 0x50 | 8 | bf64 | `augments` | Innate augments (64 bits). | `AugmentFlags` | IW PartyMembers.cs:95; IW Helpers/EnumHelper.cs:5-73 |
| 0x58 | 2 | u16 | `inventory1Content` | Content id of inventory slot 1; for guests/espers these 10 slots are their ability list (Workshop: "Inventory / Guest And Esper Abilities List"). | `ContAllList` | IW PartyMembers.cs:97-111,220 |
| 0x5A | 2 | u16 | `inventory2Content` | Content id of inventory slot 2; for guests/espers these 10 slots are their ability list (Workshop: "Inventory / Guest And Esper Abilities List"). | `ContAllList` | IW PartyMembers.cs:97-111,220 |
| 0x5C | 2 | u16 | `inventory3Content` | Content id of inventory slot 3; for guests/espers these 10 slots are their ability list (Workshop: "Inventory / Guest And Esper Abilities List"). | `ContAllList` | IW PartyMembers.cs:97-111,220 |
| 0x5E | 2 | u16 | `inventory4Content` | Content id of inventory slot 4; for guests/espers these 10 slots are their ability list (Workshop: "Inventory / Guest And Esper Abilities List"). | `ContAllList` | IW PartyMembers.cs:97-111,220 |
| 0x60 | 2 | u16 | `inventory5Content` | Content id of inventory slot 5; for guests/espers these 10 slots are their ability list (Workshop: "Inventory / Guest And Esper Abilities List"). | `ContAllList` | IW PartyMembers.cs:97-111,220 |
| 0x62 | 2 | u16 | `inventory6Content` | Content id of inventory slot 6; for guests/espers these 10 slots are their ability list (Workshop: "Inventory / Guest And Esper Abilities List"). | `ContAllList` | IW PartyMembers.cs:97-111,220 |
| 0x64 | 2 | u16 | `inventory7Content` | Content id of inventory slot 7; for guests/espers these 10 slots are their ability list (Workshop: "Inventory / Guest And Esper Abilities List"). | `ContAllList` | IW PartyMembers.cs:97-111,220 |
| 0x66 | 2 | u16 | `inventory8Content` | Content id of inventory slot 8; for guests/espers these 10 slots are their ability list (Workshop: "Inventory / Guest And Esper Abilities List"). | `ContAllList` | IW PartyMembers.cs:97-111,220 |
| 0x68 | 2 | u16 | `inventory9Content` | Content id of inventory slot 9; for guests/espers these 10 slots are their ability list (Workshop: "Inventory / Guest And Esper Abilities List"). | `ContAllList` | IW PartyMembers.cs:97-111,220 |
| 0x6A | 2 | u16 | `inventory10Content` | Content id of inventory slot 10; for guests/espers these 10 slots are their ability list (Workshop: "Inventory / Guest And Esper Abilities List"). | `ContAllList` | IW PartyMembers.cs:97-111,220 |
| 0x6C | 4 | bytes | `unknown6C` | Not interpreted. |  | IW PartyMembers.cs:113 |
| 0x70 | 4 | s32 | `model` | Model id = (ASCII prefix << 16) \| file number, e.g. c = main characters, s = espers (TK L940-L952). | `ModelList` | IW PartyMembers.cs:114; TK L933 |
| 0x74 | 1 | u8 | `modelVariation` | Model variation (Toolkit only; the Workshop treats 0x74-0x79 as unknown). |  | TK L935; IW PartyMembers.cs:115 |
| 0x75 | 1 | u8 | `modelColorVariation` | Model colour variation (Toolkit only). |  | TK L935; IW PartyMembers.cs:115 |
| 0x76 | 4 | bytes | `unknown76` | Not interpreted. |  | IW PartyMembers.cs:115 |
| 0x7A | 2 | s16 | `weight` | Weight (the Toolkit shows it x10). |  | IW PartyMembers.cs:116; TK L936 |
| 0x7C | 4 | bytes | `unknown7C` | Not interpreted. |  | IW PartyMembers.cs:117 |

#### Bits of `partyMember.restrictedEquipmentCategories` (bf32 at 0x00; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 0 | 0x00000001 | `unarmed` |  |
| 1 | 0x00000002 | `sword` |  |
| 2 | 0x00000004 | `greatsword` |  |
| 3 | 0x00000008 | `katana` |  |
| 4 | 0x00000010 | `ninjaSword` |  |
| 5 | 0x00000020 | `spear` |  |
| 6 | 0x00000040 | `pole` |  |
| 7 | 0x00000080 | `bow` |  |
| 8 | 0x00000100 | `crossbow` |  |
| 9 | 0x00000200 | `gun` |  |
| 10 | 0x00000400 | `axe` |  |
| 11 | 0x00000800 | `hammer` |  |
| 12 | 0x00001000 | `dagger` |  |
| 13 | 0x00002000 | `rod` |  |
| 14 | 0x00004000 | `staff` |  |
| 15 | 0x00008000 | `mace` |  |
| 16 | 0x00010000 | `measure` |  |
| 17 | 0x00020000 | `handBomb` |  |
| 18 | 0x00040000 | `shield` |  |
| 19 | 0x00080000 | `helm` |  |
| 20 | 0x00100000 | `armor` |  |
| 21 | 0x00200000 | `accessory` |  |
| 22 | 0x00400000 | `crown` |  |
| 23 | 0x00800000 | `arrow` |  |
| 24 | 0x01000000 | `bolt` |  |
| 25 | 0x02000000 | `shot` |  |
| 26 | 0x04000000 | `bomb` |  |

#### Bits of `partyMember.flags` (bf8 at 0x2C; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 3-4 | 0x18 | `partyJoinLevelSync` | recalculate stats/level when joining the party; 0-3; enum `BpePartyJoinLevelSyncTypeList` |
| 6 | 0x40 | `gambitsEnabled` | gambit state on/off |

#### Bits of `partyMember.statusEffects` (bf32 at 0x48; bit 0 = least significant bit of the little-endian value)

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

#### Bits of `partyMember.statusEffectImmunities` (bf32 at 0x4C; bit 0 = least significant bit of the little-endian value)

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

#### Bits of `partyMember.augments` (bf64 at 0x50; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 0 | 0x0000000000000001 | `stability` |  |
| 1 | 0x0000000000000002 | `safety` |  |
| 2 | 0x0000000000000004 | `accuracyBoost` |  |
| 3 | 0x0000000000000008 | `shieldBoost` |  |
| 4 | 0x0000000000000010 | `evasionBoost` |  |
| 5 | 0x0000000000000020 | `lastStand` |  |
| 6 | 0x0000000000000040 | `counter` |  |
| 7 | 0x0000000000000080 | `counterBoost` |  |
| 8 | 0x0000000000000100 | `spellbreaker` |  |
| 9 | 0x0000000000000200 | `brawler` |  |
| 10 | 0x0000000000000400 | `adrenaline` |  |
| 11 | 0x0000000000000800 | `focus` |  |
| 12 | 0x0000000000001000 | `lobbying` |  |
| 13 | 0x0000000000002000 | `comboBoost` |  |
| 14 | 0x0000000000004000 | `itemBoost` |  |
| 15 | 0x0000000000008000 | `medicineReverse` |  |
| 16 | 0x0000000000010000 | `weatherproof` |  |
| 17 | 0x0000000000020000 | `thievery` |  |
| 18 | 0x0000000000040000 | `saboteur` |  |
| 19 | 0x0000000000080000 | `magickLore1` |  |
| 20 | 0x0000000000100000 | `warmage` |  |
| 21 | 0x0000000000200000 | `martyr` |  |
| 22 | 0x0000000000400000 | `magickLore2` |  |
| 23 | 0x0000000000800000 | `headsman` |  |
| 24 | 0x0000000001000000 | `magickLore3` |  |
| 25 | 0x0000000002000000 | `treasureHunter` |  |
| 26 | 0x0000000004000000 | `magickLore4` |  |
| 27 | 0x0000000008000000 | `doubleExp` |  |
| 28 | 0x0000000010000000 | `doubleLp` |  |
| 29 | 0x0000000020000000 | `noExp` |  |
| 30 | 0x0000000040000000 | `spellbound` |  |
| 31 | 0x0000000080000000 | `piercingMagick` |  |
| 32 | 0x0000000100000000 | `offering` |  |
| 33 | 0x0000000200000000 | `muffle` |  |
| 34 | 0x0000000400000000 | `lifeCloak` |  |
| 35 | 0x0000000800000000 | `battleLore1` |  |
| 36 | 0x0000001000000000 | `parsimony` |  |
| 37 | 0x0000002000000000 | `treadLightly` |  |
| 38 | 0x0000004000000000 | `unusedBit38` |  |
| 39 | 0x0000008000000000 | `emptiness` |  |
| 40 | 0x0000010000000000 | `resistPiercingDamage` |  |
| 41 | 0x0000020000000000 | `antiLibra` |  |
| 42 | 0x0000040000000000 | `battleLore2` |  |
| 43 | 0x0000080000000000 | `battleLore3` |  |
| 44 | 0x0000100000000000 | `battleLore4` |  |
| 45 | 0x0000200000000000 | `battleLore5` |  |
| 46 | 0x0000400000000000 | `battleLore6` |  |
| 47 | 0x0000800000000000 | `battleLore7` |  |
| 48 | 0x0001000000000000 | `stoneskin` |  |
| 49 | 0x0002000000000000 | `attackBoost` |  |
| 50 | 0x0004000000000000 | `doubleEdged` |  |
| 51 | 0x0008000000000000 | `spellspring` |  |
| 52 | 0x0010000000000000 | `elementalShift` |  |
| 53 | 0x0020000000000000 | `celerity` |  |
| 54 | 0x0040000000000000 | `swiftcast` |  |
| 55 | 0x0080000000000000 | `attackImmunity` |  |
| 56 | 0x0100000000000000 | `magickImmunity` |  |
| 57 | 0x0200000000000000 | `statusImmunity` |  |
| 58 | 0x0400000000000000 | `damageSpikes` |  |
| 59 | 0x0800000000000000 | `suicidal` |  |
| 60 | 0x1000000000000000 | `battleLore8` |  |
| 61 | 0x2000000000000000 | `battleLore9` |  |
| 62 | 0x4000000000000000 | `battleLore10` |  |
| 63 | 0x8000000000000000 | `battleLore11` |  |

## Enums carried in the JSON spec

Flag enums list the mask value of each bit. Fields that point at bigger lists (text ids, content ids, animations, formulas …) name a list from `editor/data/lists.json` instead (see *External lists*).

#### `EquipmentCategoryFlags` (IW PartyMembers.cs:343-374)

| Value | Label |
|---|---|
| 1 (0x1) | Unarmed |
| 2 (0x2) | Sword |
| 4 (0x4) | Greatsword |
| 8 (0x8) | Katana |
| 16 (0x10) | Ninja Sword |
| 32 (0x20) | Spear |
| 64 (0x40) | Pole |
| 128 (0x80) | Bow |
| 256 (0x100) | Crossbow |
| 512 (0x200) | Gun |
| 1024 (0x400) | Axe |
| 2048 (0x800) | Hammer |
| 4096 (0x1000) | Dagger |
| 8192 (0x2000) | Rod |
| 16384 (0x4000) | Staff |
| 32768 (0x8000) | Mace |
| 65536 (0x10000) | Measure |
| 131072 (0x20000) | Hand-Bomb |
| 262144 (0x40000) | Shield |
| 524288 (0x80000) | Helm |
| 1048576 (0x100000) | Armor |
| 2097152 (0x200000) | Accessory |
| 4194304 (0x400000) | Crown (accessory) |
| 8388608 (0x800000) | Arrow |
| 16777216 (0x1000000) | Bolt |
| 33554432 (0x2000000) | Shot |
| 67108864 (0x4000000) | Bomb |

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

#### `AugmentFlags` (IW Helpers/EnumHelper.cs:5-73 (the Lua Loader docs number the lore bits differently))

| Value | Label |
|---|---|
| 1 (0x1) | Stability |
| 2 (0x2) | Safety |
| 4 (0x4) | Accuracy Boost |
| 8 (0x8) | Shield Boost |
| 16 (0x10) | Evasion Boost |
| 32 (0x20) | Last Stand |
| 64 (0x40) | Counter |
| 128 (0x80) | Counter Boost |
| 256 (0x100) | Spellbreaker |
| 512 (0x200) | Brawler |
| 1024 (0x400) | Adrenaline |
| 2048 (0x800) | Focus |
| 4096 (0x1000) | Lobbying |
| 8192 (0x2000) | Combo Boost |
| 16384 (0x4000) | Item Boost |
| 32768 (0x8000) | Medicine Reverse |
| 65536 (0x10000) | Weatherproof |
| 131072 (0x20000) | Thievery |
| 262144 (0x40000) | Saboteur |
| 524288 (0x80000) | Magick Lore 1 |
| 1048576 (0x100000) | Warmage |
| 2097152 (0x200000) | Martyr |
| 4194304 (0x400000) | Magick Lore 2 |
| 8388608 (0x800000) | Headsman |
| 16777216 (0x1000000) | Magick Lore 3 |
| 33554432 (0x2000000) | Treasure Hunter |
| 67108864 (0x4000000) | Magick Lore 4 |
| 134217728 (0x8000000) | Double EXP |
| 268435456 (0x10000000) | Double LP |
| 536870912 (0x20000000) | No EXP |
| 1073741824 (0x40000000) | Spellbound |
| 2147483648 (0x80000000) | Piercing Magick |
| 4294967296 (0x100000000) | Offering |
| 8589934592 (0x200000000) | Muffle |
| 17179869184 (0x400000000) | Life Cloak |
| 34359738368 (0x800000000) | Battle Lore 1 |
| 68719476736 (0x1000000000) | Parsimony |
| 137438953472 (0x2000000000) | Tread Lightly |
| 274877906944 (0x4000000000) | Unused (bit 38) |
| 549755813888 (0x8000000000) | Emptiness |
| 1099511627776 (0x10000000000) | Resist Piercing Damage |
| 2199023255552 (0x20000000000) | Anti-Libra |
| 4398046511104 (0x40000000000) | Battle Lore 2 |
| 8796093022208 (0x80000000000) | Battle Lore 3 |
| 17592186044416 (0x100000000000) | Battle Lore 4 |
| 35184372088832 (0x200000000000) | Battle Lore 5 |
| 70368744177664 (0x400000000000) | Battle Lore 6 |
| 140737488355328 (0x800000000000) | Battle Lore 7 |
| 281474976710656 (0x1000000000000) | Stoneskin |
| 562949953421312 (0x2000000000000) | Attack Boost |
| 1125899906842624 (0x4000000000000) | Double-Edged |
| 2251799813685248 (0x8000000000000) | Spellspring |
| 4503599627370496 (0x10000000000000) | Elemental Shift |
| 9007199254740992 (0x20000000000000) | Celerity |
| 18014398509481984 (0x40000000000000) | Swiftcast |
| 36028797018963968 (0x80000000000000) | Attack Immunity |
| 72057594037927936 (0x100000000000000) | Magick Immunity |
| 144115188075855872 (0x200000000000000) | Status Immunity |
| 288230376151711744 (0x400000000000000) | Damage Spikes |
| 576460752303423488 (0x800000000000000) | Suicidal |
| 1152921504606846976 (0x1000000000000000) | Battle Lore 8 |
| 2305843009213693952 (0x2000000000000000) | Battle Lore 9 |
| 4611686018427387904 (0x4000000000000000) | Battle Lore 10 |
| 9223372036854775808 (0x8000000000000000) | Battle Lore 11 |

#### `BpePartyJoinLevelSyncTypeList` (Lists: BpePartyJoinLevelSyncTypeList)

| Value | Label |
|---|---|
| 0 (0x0) | Never |
| 1 (0x1) | Only Once |
| 2 (0x2) | Always |

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `BpEquipmentList` | section 13 rows (0 Unarmed … 556) |
| `BpMistList` | Mist/quickening ids 0-31 |
| `DescNameList` | character name text ids 16384+ |
| `ContAllList` | content ids (category<<12 \| index) |
| `ModelList` | model ids (prefix letter << 16 \| number) |
| `PartyMemberList` | row labels: 0 Vaan … 39 Zodiark |

## Count and size rules

- `entryCount` rows of 128 bytes; vanilla 40 (TK L416; docs/DESIGN.md). Rows are addressed by index from
  actions (`summonedPartyMember`), events and save data, so never reorder or delete.
- Exactly three quickening bytes (IW PartyMembers.cs:18-21).
- The 10 inventory slots are split: quantities at 0x34-0x3D, content ids at 0x58-0x6B; slot *n* pairs
  `inventory<n>Quantity` with `inventory<n>Content`.
- `flags.partyJoinLevelSync` holds 0-3 (the Workshop rejects larger values, IW PartyMembers.cs:315); the
  Toolkit list names 0-2.
- `defaultGambitSet` is stored with +0x5000 added; an editor should show `value - 0x5000` as the section 8 row
  and write back `row + 0x5000` (IW PartyMembers.cs:51,142).
- The game gives a member one gambit slot per entry in its section 8 default set; Vaan and Penelo get one extra
  slot through code, so keep at least 2 default gambits for others and do not give Vaan/Penelo more than 1
  (msg 55). The Toolkit clamps the live slot count to 2-12 (TK L543).

### Text

These tables hold no strings. Every name/description field is a **u16 text id** in the game-wide battle text
id space, which is split into blocks per family (TK L1520-L1563): e.g. action names 0+, equipment names
2048+, battle-menu labels 8192+, status names 10240+, gambit names 12288+, character names 16384+, bazaar
names 18432+; long help texts use ids 3000+, 4000+ (battle actions), 10000+ (inventory actions), 12000+ (status),
16000+ (gambit targets), 22000+ (bazaar). `65535` means *none*. The strings live in the text files of the nested
pack in battlepack **section 61** (15 sub-sections, IW Resources/PackFile.cs:21, IW Resources/OtherFile.cs:23,
msg 1005) and in section 2. Renaming something is a text edit there, not an edit here.

## Pointers / cross references

No in-file pointers. Outgoing references: equipment slots -> section 13 rows; `defaultGambitSet` -> section 8;
quickenings -> Mist ids; inventory -> content ids; `cameraPositionLink` -> behind-camera table; text ids -> section 61.

## Round-trip rules

- Edit fields in place; the record size is fixed and nothing in this section points at entries, so value edits never move data.
- Copy every byte that no field interprets (unknown*/unused*/padding, unnamed bits) from the original; the Workshop writer zero-fills them (it seeks over them), so do not use its output as the byte-identical reference.
- Keep the st2e header bytes verbatim except entryCount (and entryListOffset when the count goes to/from 0).
- Keep the trailing zero padding that rounds the section to a multiple of 16 bytes.
- If the section length changes (added/removed entries), rewrite the battlepack offset table: every later section offset and the end offset shift by the padded size delta.
- flags (0x2C): change only bits 3-4 and 6; preserve the rest.
- Store defaultGambitSet as row + 0x5000.
- Do not reorder or delete rows.

## Known unknowns

- Whether the five equipment fields hold a section 13 row index or a content id (0x1000|row) is not stated by any source; check vanilla values.
- The two Max HP modifiers (0x18, 0x19) and the other growth modifiers: formula not documented here.
- flags (0x2C) bits 0-2, 5, 7 unnamed; bytes 0x08-0x09, 0x1C, 0x20, 0x23, 0x26, 0x29, 0x2D, 0x2F, 0x33, 0x40-0x43, 0x6C-0x6F, 0x76-0x79, 0x7C-0x7F never interpreted.
- modelVariation/modelColorVariation (0x74/0x75) come from the Toolkit only.
- Units of weight (Toolkit shows x10) and detectionRange not verified.
- Esper abilities: the Workshop labels the inventory slots as the guest/esper ability list, while msg 365 suggests espers take abilities from the initial-inventory section (42); confirm which one the game reads.

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; license forbids copying or converting its code). Paths are relative to that repo, e.g. `Formats/Battlepack/Actions.cs`, `Formats/St2e.cs`, `Helpers/PackHelper.cs`, `Helpers/EnumHelper.cs`, `Resources/JsonFile.cs`, `Resources/PackFile.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| LL `sectionNN.md` | FF12 Lua Loader documentation, `capabilities/bpack-sections/sectionNN.md` (field names of the loader's read-only `game.bpack` view). |
| Lists | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json` (list name given). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
