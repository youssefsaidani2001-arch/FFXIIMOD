# Battlepack section 13 — Equipment and Attributes

Spec id: `battlepack-s13-equipment-attributes` · machine spec: [`battlepack-s13-equipment-attributes.json`](./battlepack-s13-equipment-attributes.json)

Battlepack **section 13** holds two linked tables:

1. **Equipment** — one 52-byte record per weapon, shield, helm, armor, accessory and ammunition: name, icon,
   flags (unsaleable, hits flying, license-independent, slot), category, price, and a category-dependent block
   (weapon: range, formula, attack, knockback, combo/crit, evade, element, on-hit status, stance, charge time,
   particle effect, model; shield: evade and magick evade, model; armor: defense, magick resist, augment;
   ammunition: attack, evade, element, on-hit status, model).
2. **Attributes** — 24-byte stat packages (HP/MP/Str/Mag/Vit/Spd bonuses, auto-statuses, status immunities and
   five elemental-affinity masks). Every equipment record points at one attribute record; vanilla items share
   records, which is why the Toolkit offers an export that gives every item its own copy (TK L982-L987).

The Workshop maps `section_013.bin` here (IW Resources/JsonFile.cs:35). This is one of the bespoke sections
in the Toolkit's exporter (TK L978).

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

Section 13 specifics: `entrySize` = 52 (0x34); header slot **0x18 is the attribute-table offset**
(IW EquipmentAndAttributes.cs:24-25, 133; TK L267). Byte layout of the section:

```
0x00                     st2e header (32 bytes)
0x20                     equipment[0 .. entryCount-1]           52 bytes each
header.offset18          attribute[0 .. attributeCount-1]       24 bytes each (Workshop: = 0x20 + entryCount*52)
end of attributes        zero padding to a multiple of 16
```

In memory the Toolkit derives the attribute count from the gap between the attribute table and section 14,
which confirms that the attribute table runs to the end of section 13 (TK L845).

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…`/`unused…` are not interpreted by any source; keep their original bytes.

### Record `header` — 32 bytes (0x20), count: 1

*Where:* Offset 0 of battlepack section 13.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `magic` | ASCII 'st2e' (73 74 32 65); reject the section if different. |  | IW Formats/St2e.cs:9,20 |
| 0x04 | 4 | u32 | `entryCount` | Number of equipment records (the Toolkit lists name 557 rows, 0 Unarmed … 556). |  | IW Formats/St2e.cs:25 |
| 0x08 | 2 | u16 | `entrySize` | Bytes per entry; 52 (0x34) for this section. |  | IW Formats/St2e.cs:26 |
| 0x0A | 2 | bytes | `unknown0A` | Not interpreted; keep. |  | IW Formats/St2e.cs:27 |
| 0x0C | 4 | u32 | `entryListOffset` | Offset of entry 0 from the section start: 32 when entryCount > 0, else 0. |  | IW Formats/St2e.cs:28,39 |
| 0x10 | 4 | u32 | `offset10` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:29 |
| 0x14 | 4 | u32 | `textSectionOffset` | Inline text offset; 0 on disk for this section (filled at run time). No strings are stored here. |  | IW Formats/St2e.cs:30; TK L262, L978 |
| 0x18 | 4 | u32 | `offset18` | attributeTableOffset: offset of the attribute table from the section start. The Workshop always places it right after the equipment records (= 32 + entryCount*52). |  | IW EquipmentAndAttributes.cs:24-25,133,251; TK L267 |
| 0x1C | 4 | u32 | `offset1C` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:32 |

### Record `equipment` — 52 bytes (0x34), count: header.entryCount

*Where:* st2e entries of section 13: header.entryListOffset + i*52

Variant-specific fields overlap. A field whose meaning starts with `only: …` is valid only for those variants (chosen by `category`); for the other variants those bytes are not interpreted and must be preserved.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `unknown00` | Not interpreted (the Workshop skips it and writes 0). |  | IW EquipmentAndAttributes.cs:50,173 |
| 0x02 | 2 | u16 | `name` | Name text id (equipment block, 2048+). | `DescEquipmentList` | IW EquipmentAndAttributes.cs:51 |
| 0x04 | 1 | u8 | `icon` | Menu icon. | `BpeIconList` | IW EquipmentAndAttributes.cs:52 |
| 0x05 | 1 | u8 | `unknown05` | Not interpreted. |  | IW EquipmentAndAttributes.cs:53 |
| 0x06 | 1 | u8 | `optimizationTiebreaker` | Tie-break rank used when the Optimize command compares equal items. |  | IW EquipmentAndAttributes.cs:54 |
| 0x07 | 1 | bf8 | `flags` | Bits 0 and 3 are unnamed; the Workshop rebuilds the byte from the named bits only. | bits below | IW EquipmentAndAttributes.cs:55-59,167-171; LL section13.md |
| 0x08 | 1 | u8 | `sort` | Menu sort key. |  | IW EquipmentAndAttributes.cs:60 |
| 0x09 | 1 | u8 | `category` | Equipment category; selects the variant layout of bytes 0x11 and 0x18-0x33: 0-17 weapon, 18 shield, 19-22 helm/armor/accessory/crown ("armor" variant), 23+ ammunition. | `BpEquipmentCategoryList` | IW EquipmentAndAttributes.cs:37-48,61 |
| 0x0A | 4 | bytes | `unknown0A` | Not interpreted. |  | IW EquipmentAndAttributes.cs:62 |
| 0x0E | 2 | u16 | `description` | Description text id; labelled ineffectual (unused by the game) by the Workshop and the Toolkit. |  | IW EquipmentAndAttributes.cs:63,282; TK L849 |
| 0x10 | 1 | u8 | `metal` | Metal property byte (meaning not documented beyond the name). |  | IW EquipmentAndAttributes.cs:64 |
| 0x11 | 1 | u8 | `offhandCategory` | only: weapon — category of the off-hand item (ammo/shield) this weapon pairs with; for other variants this byte is not interpreted. | `BpEquipmentCategoryList` | IW EquipmentAndAttributes.cs:69,91,102,113 |
| 0x12 | 2 | u16 | `gil` | Buy price (all variants). Unsigned; 65535 acts as a "none" sentinel in places (msg 534-537, 620). |  | IW EquipmentAndAttributes.cs:70,92,103,114; TK L849 |
| 0x14 | 4 | bytes | `unknown14` | Not interpreted (all variants; ammunition also leaves 0x18-0x19 uninterpreted). |  | IW EquipmentAndAttributes.cs:71,93,104,115 |
| 0x18 | 1 | u8 | `defense` | only: armor — defense. |  | IW EquipmentAndAttributes.cs:105 |
| 0x18 | 1 | u8 | `range` | only: weapon — attack range. |  | IW EquipmentAndAttributes.cs:72; LL section13.md |
| 0x18 | 1 | u8 | `shieldEvade` | only: shield — physical evade. |  | IW EquipmentAndAttributes.cs:94 |
| 0x19 | 1 | u8 | `formula` | only: weapon — attack formula (same id space as action formulas; swapping it has side effects, msg 493-503). | `BpeFormulaList` | IW EquipmentAndAttributes.cs:73 |
| 0x19 | 1 | u8 | `magickResist` | only: armor — magick resist. |  | IW EquipmentAndAttributes.cs:106 |
| 0x19 | 1 | u8 | `shieldMagickEvade` | only: shield — magick evade. |  | IW EquipmentAndAttributes.cs:95 |
| 0x1A | 1 | u8 | `attackPower` | only: weapon, ammunition — attack power. |  | IW EquipmentAndAttributes.cs:74,116 |
| 0x1A | 1 | u8 | `augment` | only: armor — augment granted while equipped (section 58 row). | `BpAugmentList` | IW EquipmentAndAttributes.cs:107 |
| 0x1B | 1 | u8 | `knockbackChance` | only: weapon — knockback chance. |  | IW EquipmentAndAttributes.cs:75 |
| 0x1C | 1 | u8 | `comboOrCriticalChance` | only: weapon — combo (or critical, depending on weapon type) chance. |  | IW EquipmentAndAttributes.cs:76 |
| 0x1D | 1 | u8 | `evade` | only: weapon, ammunition — evade bonus. |  | IW EquipmentAndAttributes.cs:77,118 |
| 0x1E | 1 | bf8 | `elements` | only: weapon, ammunition — attack element(s). | `ElementFlags` | IW EquipmentAndAttributes.cs:78,119; IW Helpers/EnumHelper.cs:113-125 |
| 0x1F | 1 | u8 | `onHitRate` | only: weapon, ammunition — chance to inflict statusEffects. |  | IW EquipmentAndAttributes.cs:79,120 |
| 0x20 | 4 | bf32 | `statusEffects` | only: weapon, ammunition — statuses inflicted on hit. | `StatusEffectFlags` | IW EquipmentAndAttributes.cs:80,121; IW Helpers/EnumHelper.cs:75-111 |
| 0x24 | 1 | u8 | `unknown24` | Not interpreted (any variant). |  | IW EquipmentAndAttributes.cs:81 |
| 0x25 | 1 | u8 | `distanceBehavior` | only: weapon — approach behaviour, e.g. whether the attacker steps back before striking (msg 532). | `BpeWeaponDistanceBehaviorList` | IW EquipmentAndAttributes.cs:82 |
| 0x26 | 1 | u8 | `stance` | only: weapon — weapon stance (section 0 row). | `BpWeaponStanceList` | IW EquipmentAndAttributes.cs:83 |
| 0x27 | 1 | u8 | `chargeTime` | only: weapon — charge time of a normal attack. |  | IW EquipmentAndAttributes.cs:84 |
| 0x28 | 4 | u32 | `attributeLink` | All variants: byte offset of this item's attribute record, counted from the start of the attribute table (header.offset18). attributeIndex = attributeLink / 24; must be a multiple of 24. Several items may share one record. |  | IW EquipmentAndAttributes.cs:85,97,109,123,204; TK L267, L849 |
| 0x2C | 2 | u16 | `particleEffect` | only: weapon — swing/trail particle effect. | `BpeWeaponParticleEffectList` | IW EquipmentAndAttributes.cs:86 |
| 0x2E | 2 | u16 | `unknown2E` | Not interpreted (any variant). |  | IW EquipmentAndAttributes.cs:87 |
| 0x30 | 4 | s32 | `model` | only: weapon, shield, ammunition — model id (prefix letter << 16 \| number; weapons use prefix w). For the armor variant bytes 0x2C-0x33 are not interpreted. | `ModelList` | IW EquipmentAndAttributes.cs:88,99,110,125 |

#### Bits of `equipment.flags` (bf8 at 0x07; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 1 | 0x02 | `unsaleable` | cannot be sold (sell price itself is computed by the game, msg 693-697) |
| 2 | 0x04 | `hitsFlying` |  |
| 4 | 0x10 | `licenseIndependent` | usable without the license (Lua docs: noLicense) |
| 5-7 | 0xE0 | `slotType` | equipment slot, 0-4; enum `BpeEquipmentSlotTypeList` |

#### Bits of `equipment.elements` (bf8 at 0x1E; bit 0 = least significant bit of the little-endian value)

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

#### Bits of `equipment.statusEffects` (bf32 at 0x20; bit 0 = least significant bit of the little-endian value)

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

### Record `attribute` — 24 bytes (0x18), count: floor((sectionLength - header.offset18) / 24), sectionLength = span of section 13 in the battlepack (trailing pad < 24 bytes is ignored)

*Where:* Attribute table of section 13: header.offset18 + k*24, running to the end of the section

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `maxHp` | Max HP bonus. |  | IW EquipmentAndAttributes.cs:141 |
| 0x02 | 2 | u16 | `maxMp` | Max MP bonus. |  | IW EquipmentAndAttributes.cs:142 |
| 0x04 | 1 | u8 | `strength` | Strength bonus. |  | IW EquipmentAndAttributes.cs:143 |
| 0x05 | 1 | u8 | `magickPower` | Magick Power bonus. |  | IW EquipmentAndAttributes.cs:144 |
| 0x06 | 1 | u8 | `vitality` | Vitality bonus. |  | IW EquipmentAndAttributes.cs:145 |
| 0x07 | 1 | u8 | `speed` | Speed bonus. |  | IW EquipmentAndAttributes.cs:146 |
| 0x08 | 4 | bf32 | `statusEffects` | Statuses granted while equipped (auto-status). | `StatusEffectFlags` | IW EquipmentAndAttributes.cs:147; IW Helpers/EnumHelper.cs:75-111 |
| 0x0C | 4 | bf32 | `statusEffectImmunities` | Status immunities granted. | `StatusEffectFlags` | IW EquipmentAndAttributes.cs:148 |
| 0x10 | 1 | bf8 | `elementAbsorb` | Elements absorbed. | `ElementFlags` | IW EquipmentAndAttributes.cs:149 |
| 0x11 | 1 | bf8 | `elementImmune` | Elements nullified. | `ElementFlags` | IW EquipmentAndAttributes.cs:150 |
| 0x12 | 1 | bf8 | `elementHalfDamage` | Elements halved. | `ElementFlags` | IW EquipmentAndAttributes.cs:151 |
| 0x13 | 1 | bf8 | `elementWeak` | Elemental weaknesses. | `ElementFlags` | IW EquipmentAndAttributes.cs:152 |
| 0x14 | 1 | bf8 | `elementPotency` | Elements whose damage is boosted. | `ElementFlags` | IW EquipmentAndAttributes.cs:153 |
| 0x15 | 3 | bytes | `unused15` | Padding; the Workshop writes three zero bytes. |  | IW EquipmentAndAttributes.cs:155,267 |

#### Bits of `attribute.statusEffects` (bf32 at 0x08; bit 0 = least significant bit of the little-endian value)

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

#### Bits of `attribute.statusEffectImmunities` (bf32 at 0x0C; bit 0 = least significant bit of the little-endian value)

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

#### Bits of `attribute.elementAbsorb` (bf8 at 0x10; bit 0 = least significant bit of the little-endian value)

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

#### Bits of `attribute.elementImmune` (bf8 at 0x11; bit 0 = least significant bit of the little-endian value)

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

#### Bits of `attribute.elementHalfDamage` (bf8 at 0x12; bit 0 = least significant bit of the little-endian value)

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

#### Bits of `attribute.elementWeak` (bf8 at 0x13; bit 0 = least significant bit of the little-endian value)

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

#### Bits of `attribute.elementPotency` (bf8 at 0x14; bit 0 = least significant bit of the little-endian value)

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

#### `BpEquipmentCategoryList` (Lists: BpEquipmentCategoryList; variant ranges IW EquipmentAndAttributes.cs:42-48)

| Value | Label |
|---|---|
| 0 (0x0) | Unarmed |
| 1 (0x1) | Sword |
| 2 (0x2) | Greatsword |
| 3 (0x3) | Katana |
| 4 (0x4) | Ninja Sword |
| 5 (0x5) | Spear |
| 6 (0x6) | Pole |
| 7 (0x7) | Bow |
| 8 (0x8) | Crossbow |
| 9 (0x9) | Gun |
| 10 (0xA) | Axe |
| 11 (0xB) | Hammer |
| 12 (0xC) | Dagger |
| 13 (0xD) | Rod |
| 14 (0xE) | Staff |
| 15 (0xF) | Mace |
| 16 (0x10) | Measure |
| 17 (0x11) | Hand-Bomb |
| 18 (0x12) | Shield |
| 19 (0x13) | Helm |
| 20 (0x14) | Armor |
| 21 (0x15) | Accessory |
| 22 (0x16) | Crown (accessory) |
| 23 (0x17) | Arrow |
| 24 (0x18) | Bolt |
| 25 (0x19) | Shot |
| 26 (0x1A) | Bomb |
| 27 (0x1B) | Unused (0x1B) |
| 28 (0x1C) | Unused (0x1C) |
| 29 (0x1D) | Unused (0x1D) |
| 30 (0x1E) | Unused (0x1E) |
| 31 (0x1F) | Unused (0x1F) |
| 255 (0xFF) | None |

#### `BpeEquipmentSlotTypeList` (Lists: BpeEquipmentSlotTypeList; IW EquipmentAndAttributes.cs:298)

| Value | Label |
|---|---|
| 0 (0x0) | Weapon |
| 1 (0x1) | Off-hand |
| 2 (0x2) | Helm |
| 3 (0x3) | Armor |
| 4 (0x4) | Accessory |

#### `BpeWeaponDistanceBehaviorList` (Lists: BpeWeaponDistanceBehaviorList)

| Value | Label |
|---|---|
| 0 (0x0) | None |
| 1 (0x1) | Ninja Sword / Sword |
| 2 (0x2) | Bow / Crossbow / Gun / Hand-Bomb |
| 3 (0x3) | Axe / Dagger / Hammer / Mace / Measure |
| 4 (0x4) | Pole / Rod / Spear / Staff |
| 5 (0x5) | Greatsword / Katana |

#### `BpWeaponStanceList` (Lists: BpWeaponStanceList (section 0 rows))

| Value | Label |
|---|---|
| 0 (0x0) | Reserve (0x00) |
| 1 (0x1) | Unarmed |
| 2 (0x2) | Dagger |
| 3 (0x3) | Sword |
| 4 (0x4) | Greatsword |
| 5 (0x5) | Katana |
| 6 (0x6) | Ninja Sword |
| 7 (0x7) | Staff |
| 8 (0x8) | Mace |
| 9 (0x9) | Reserve (0x09) |
| 10 (0xA) | Measure |
| 11 (0xB) | Axe |
| 12 (0xC) | Hammer |
| 13 (0xD) | Rod |
| 14 (0xE) | Pole |
| 15 (0xF) | Spear |
| 16 (0x10) | Reserve (0x10) |
| 17 (0x11) | Bow |
| 18 (0x12) | Crossbow |
| 19 (0x13) | Reserve (0x13) |
| 20 (0x14) | Gun |
| 21 (0x15) | Hand-Bomb |
| 22 (0x16) | Unarmed (Brawler) |

#### `EquipmentVariant` (derived from IW EquipmentAndAttributes.cs:42-48, 342-348)

| Value | Label |
|---|---|
| 0 (0x0) | weapon (category 0-17) |
| 1 (0x1) | shield (category 18) |
| 2 (0x2) | armor: helm/armor/accessory/crown (category 19-22) |
| 3 (0x3) | ammunition (category 23+) |

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

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `DescEquipmentList` | equipment name text ids 2048+ |
| `BpeIconList` | menu icons (u8, 255 = none) |
| `BpeFormulaList` | 109 formula ids |
| `BpAugmentList` | section 58 augment rows (255 = none) |
| `BpeWeaponParticleEffectList` | weapon particle effects (0x8000+ range) |
| `ModelList` | model ids |
| `BpEquipmentList` | row labels: row -> equipment name |

## Variant dispatch (bespoke part 1)

`category` (0x09) decides how bytes 0x11 and 0x18-0x33 are read (IW EquipmentAndAttributes.cs:37-48, 66-129):

| category | Variant | Fields in the variant block |
|---|---|---|
| 0-17 (Unarmed … Hand-Bomb) | weapon | offhandCategory 0x11, range 0x18, formula 0x19, attackPower 0x1A, knockbackChance 0x1B, comboOrCriticalChance 0x1C, evade 0x1D, elements 0x1E, onHitRate 0x1F, statusEffects 0x20, distanceBehavior 0x25, stance 0x26, chargeTime 0x27, particleEffect 0x2C, model 0x30 |
| 18 (Shield) | shield | shieldEvade 0x18, shieldMagickEvade 0x19, model 0x30 |
| 19-22 (Helm, Armor, Accessory, Crown) | armor | defense 0x18, magickResist 0x19, augment 0x1A (no model) |
| 23+ (Arrow, Bolt, Shot, Bomb) | ammunition | attackPower 0x1A, evade 0x1D, elements 0x1E, onHitRate 0x1F, statusEffects 0x20, model 0x30 |

`gil` (0x12) and `attributeLink` (0x28) exist in every variant. Changing `category` across variant groups
changes how the record is interpreted; rewrite the whole variant block when you do that.

## Attribute table (bespoke part 2)

- **Location:** `header.offset18` (absolute offset within section 13).
- **Count:** not stored. `attributeCount = floor((sectionLength - offset18) / 24)` where `sectionLength` is the
  section's span in the battlepack, which already includes up to 15 bytes of zero padding (always < 24, so the
  floor is exact) (IW EquipmentAndAttributes.cs:134).
- **Link encoding:** `equipment.attributeLink` = `attributeIndex * 24`, a byte offset relative to the attribute
  table, not to the section (IW EquipmentAndAttributes.cs:85, 204). Links are therefore unaffected when the
  equipment table grows and the attribute table moves.
- **Sharing:** many equipment records point at the same attribute record (TK L982-L987). Editing an attribute
  record changes every item linked to it; to change one item alone, append a new attribute record and repoint
  that item's link.

## Count and size rules

- Equipment: `header.entryCount` records; rows are addressed by index from section 16 default equipment,
  content ids 0x1000|row, licenses, shops and saves, so never reorder or delete.
- Adding equipment: insert after the last equipment record, move the attribute table down by 52 bytes per
  added record, update `header.entryCount` and `header.offset18`, then re-pad and update the battlepack offsets.
- Adding attributes: append after the last attribute record (no header field changes), re-pad, update the
  battlepack offsets.
- `slotType` ≤ 4 (IW EquipmentAndAttributes.cs:298-300).

### Text

These tables hold no strings. Every name/description field is a **u16 text id** in the game-wide battle text
id space, which is split into blocks per family (TK L1520-L1563): e.g. action names 0+, equipment names
2048+, battle-menu labels 8192+, status names 10240+, gambit names 12288+, character names 16384+, bazaar
names 18432+; long help texts use ids 3000+, 4000+ (battle actions), 10000+ (inventory actions), 12000+ (status),
16000+ (gambit targets), 22000+ (bazaar). `65535` means *none*. The strings live in the text files of the nested
pack in battlepack **section 61** (15 sub-sections, IW Resources/PackFile.cs:21, IW Resources/OtherFile.cs:23,
msg 1005) and in section 2. Renaming something is a text edit there, not an edit here.

## Pointers

| Pointer | Relative to | Fix-up when … |
|---|---|---|
| `header.offset18` | section start | equipment count changes (new value = old + 52 * delta, or 0x20 + count*52 in a rebuilt file) |
| `equipment.attributeLink` | attribute table start | never for count changes; only when attribute records are re-ordered or removed |

## Round-trip rules

- Edit fields in place; the record size is fixed and nothing in this section points at entries, so value edits never move data.
- Copy every byte that no field interprets (unknown*/unused*/padding, unnamed bits) from the original; the Workshop writer zero-fills them (it seeks over them), so do not use its output as the byte-identical reference.
- Keep the st2e header bytes verbatim except entryCount (and entryListOffset when the count goes to/from 0).
- Keep the trailing zero padding that rounds the section to a multiple of 16 bytes.
- If the section length changes (added/removed entries), rewrite the battlepack offset table: every later section offset and the end offset shift by the padded size delta.
- Never zero bytes that are "not interpreted" for the record's variant; vanilla data in those bytes must survive.
- Keep attributeLink a multiple of 24 and < attributeCount*24.
- When equipment rows are added, move the attribute table and update header.offset18; attributeLink values stay.
- Do not write 255 into weapon gil fields by accident: msg 665-675 report a tool that corrupted every weapon price that way.
- flags (0x07): change only bits 1, 2, 4-7; preserve bits 0 and 3.

## Known unknowns

- Bytes 0x00-0x01, 0x05, 0x0A-0x0D, 0x14-0x17, 0x24, 0x2E-0x2F and every variant block byte not listed for a variant are never interpreted.
- flags bits 0 and 3 are unnamed; the Workshop drops them on write.
- Meaning of metal (0x10) beyond its name; optimizationTiebreaker semantics are inferred from the name.
- Whether vanilla files always place the attribute table directly after the equipment records (the Workshop assumes so on write but reads header.offset18).
- Whether attribute records may be shared intentionally by the game for anything beyond saving space.
- Message 850-865: a third-party editor did not save ammunition edits; that was a tool bug, not a format issue.

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; license forbids copying or converting its code). Paths are relative to that repo, e.g. `Formats/Battlepack/Actions.cs`, `Formats/St2e.cs`, `Helpers/PackHelper.cs`, `Helpers/EnumHelper.cs`, `Resources/JsonFile.cs`, `Resources/PackFile.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| LL `sectionNN.md` | FF12 Lua Loader documentation, `capabilities/bpack-sections/sectionNN.md` (field names of the loader's read-only `game.bpack` view). |
| Lists | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json` (list name given). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
