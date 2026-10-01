# Drive batch 09: DynamicDescription equipment templates 3, 24-36

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR.
Drive path of every file: `My Laptop/scripts/config/DynamicDescription/templates/equipment/`.
Author of the DynamicDescription (DD) mod: FehDead (the header of the DD main script says so). These templates are not by Xeavin.

| Drive id | Title | Local file | Lines / bytes | md5 (first 8) | Status |
|---|---|---|---|---|---|
| 1AbWqQw30fB5to1YuAKc029SRC2j2TrYJ | 3.lua | `1AbWqQw30fB5to1YuAKc029SRC2j2TrYJ__3.lua` | 28 / 1082 | c00d2b0a | read in full |
| 1n7_GfNl2fxOA2IkclIbTsKSgoxFXJ88B | 24.lua | `1n7_GfNl2fxOA2IkclIbTsKSgoxFXJ88B__24.lua` | 28 / 1018 | c94fa968 | read in full |
| 1DwPJK8Xqwf7q07d3by4nbbCbszHJn3XU | 25.lua | `1DwPJK8Xqwf7q07d3by4nbbCbszHJn3XU__25.lua` | 28 / 1018 | c94fa968 | read in full |
| 1MpSBtINUOHzwQa0mUNW4taGv0YBXVUJn | 26.lua | `1MpSBtINUOHzwQa0mUNW4taGv0YBXVUJn__26.lua` | 28 / 1018 | c94fa968 | read in full |
| 17QaGKBT0lmBcWymFDDI74QqmkEFpN1g4 | 27.lua | `17QaGKBT0lmBcWymFDDI74QqmkEFpN1g4__27.lua` | 28 / 1018 | c94fa968 | read in full |
| 1eIXQMto9kWp9kLiQAo0nPPTQa9DBs4vR | 28.lua | `1eIXQMto9kWp9kLiQAo0nPPTQa9DBs4vR__28.lua` | 28 / 1018 | c94fa968 | read in full |
| 10dl7UVxj_0gukue-W0tZ3wh7yg6WDwTx | 29.lua | `10dl7UVxj_0gukue-W0tZ3wh7yg6WDwTx__29.lua` | 28 / 1018 | c94fa968 | read in full |
| 1YqT93UISSMFpBvO4lSK8YJcbaSEahzLr | 30.lua | `1YqT93UISSMFpBvO4lSK8YJcbaSEahzLr__30.lua` | 28 / 1018 | c94fa968 | read in full |
| 1RLbkWJoTGftzzq2zn0N4_oBOq7oTgrUT | 31.lua | `1RLbkWJoTGftzzq2zn0N4_oBOq7oTgrUT__31.lua` | 28 / 1018 | c94fa968 | read in full |
| 1z-10ZF59PbVJGH4pSSGi-DU8TkVve-0g | 32.lua | `1z-10ZF59PbVJGH4pSSGi-DU8TkVve-0g__32.lua` | 28 / 1018 | c94fa968 | read in full |
| 1yBxMhoSNYKPf-X0qkxy6v12fgb0WAP_C | 33.lua | `1yBxMhoSNYKPf-X0qkxy6v12fgb0WAP_C__33.lua` | 28 / 1023 | 36da7f51 | read in full |
| 1_N_uef493OMQcoh4UwWPQVC04ehHI3Hm | 34.lua | `1_N_uef493OMQcoh4UwWPQVC04ehHI3Hm__34.lua` | 28 / 1023 | 36da7f51 | read in full |
| 1HrEv889wTGhbOZ73nCKHpZWyOXOtO6fv | 35.lua | `1HrEv889wTGhbOZ73nCKHpZWyOXOtO6fv__35.lua` | 28 / 1023 | 36da7f51 | read in full |
| 14gKEucBpGrmwXqowdOywPfb9P0qQDb2l | 36.lua | `14gKEucBpGrmwXqowdOywPfb9P0qQDb2l__36.lua` | 28 / 1023 | 36da7f51 | read in full |

No file is missing. None of these files has an address, a hook or a byte check. Each one is a Lua chunk that returns
one long-bracket string written in DD's template markup. Only three distinct layouts exist:

* **Weapon layout**: 3.lua. It is byte-identical to 0.lua, 1.lua and 10.lua from batch_07.
* **Armour/accessory layout**: 24.lua to 32.lua (9 identical files).
* **Ammunition layout**: 33.lua to 36.lua (4 identical files).

Every file has the same 28 lines except line 13, which is the `equipment:attributes` content list.
I checked this with `diff` after deleting line 13 from each file.

Evidence key:
* **byte-check-in-code**: the code checks the original bytes before patching. No row in this batch has this.
* **used-in-code**: the DD engine actually consumes the value. For the templates, that means the parser, schema,
  renderer and mappings modules read it.
* **comment-only**: only prose or a comment says so.
* **xref**: the supporting fact comes from another DD module in the same Drive export (parser.lua, schemas.lua,
  mappings.lua, renderer.lua, cache.lua, utils.lua, DynamicDescription.lua). Those modules are documented in full in
  their own batches.

---

## 0. Shared facts for all 14 files (how DD consumes a template)

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| File-to-item key | The DD main script loads `templates/equipment/<n>.lua` for every n from 0 to 191 and caches each one under the key `equipment_<n>`. The parser sets each equipment item's template key to `equipment_` plus the item's **icon** value from battlepack section 13. It does not use the category value. So file N describes every section-13 item whose icon byte is N | DD main L21-26, L97-100; parser L148 (xref) | used-in-code |
| Which records | Only battlepack **section 13** (equipment) uses equipment templates. Section 14 (actions) uses `action_<n>` instead, keyed by record byte +0x21 (charge-aura/category), n = 0..8 | parser L144-153; DD main L27-29 (xref) | used-in-code |
| Item bit id | A section-13 item's id inside DD is 4096 + index (0x1000 + index), matching the FFXII equipment id range. Section-14 records whose `requiredContent` is 0xFFFF are skipped (no template applied) | parser L5-6, L147, L151 (xref) | used-in-code |
| Section-13 record fields used | `icon` (template key), `category` (attribute filter), `attackPower`, `defense`, `magickResist`, `evadeShield`, `magickEvadeShield`, `evadeWeapon`, `knockbackChance`, `comboOrCriticalChance`, `augment`, `range`, `chargeTime`, `onHitRate`, elements, statusEffects, `flags.hitsFlying`, `attributePointer`. Earlier batches put icon at +0x04, category at +0x09 and the attribute pointer at +0x28, with a record stride of 0x34 | parser L80-101; batch_01/batch_07 (xref) | used-in-code (offsets: unclear, from other batches) |
| Attribute record (pointed to by +0x28) | +0 max HP (s16), +2 max MP (s16), +4 STR, +5 MAG, +6 VIT, +7 SPD (s8 each). +8 equip-status mask (u32), +12 status-immunity mask (u32). +16 absorb, +17 immune, +18 half, +19 weak, +20 potency element masks (u8 each, bit i is element i) | parser L4-23, L104-123 (xref) | used-in-code |
| Augment sentinel | A raw augment of 255 or 65535 is treated as "no augment" (nil). Every other value, **including 0**, is rendered. The renderer special-cases `augment`, so a zero is not hidden as it is for the other stats | parser L100-101; renderer L245 (xref) | used-in-code |
| Template grammar | A template is one or more `{dt:row ATTRS} ... {/row}` blocks. Inside a row, each block is `{dt:<section>:<type> content:(f1, f2, ...) args:(a1, a2, ...)}`. Row attributes take the form `name:(value)`. Valid row/tag attribute names are `content`, `args`, `size`, `labelColor`, `valueColor`, `title`, `itemspace`, `groupspace`, `maxitems` | template L23, L122-157 (xref) | used-in-code |
| Row defaults | itemspace 1, groupspace 2, maxitems 999. These files override groupspace to 1 on every row. They set maxitems to 4 on the stats row and to 10 on the status and element rows | schemas L58-61 (xref); each file L3, L12, L16, L20, L24 | used-in-code |
| Spacing semantics | `itemspace` is the number of "low space" glyphs (`tags.space.low`) between a label's colon and its value. `groupspace` is the number of wide-space glyphs (`tags.space.wide`, default two ASCII spaces) between items. `maxitems` is the number of items per output line before a newline is inserted | renderer L166, L345; utils L12-26, L151-153 (xref) | used-in-code |
| Block types in these files | `equipment:common` (single value per field). `equipment:attributes` (numeric stats). `equipment:statusEffect` (multi; `hit`/`equip`/`immune` map to statusEffectsHit/Equip/Immune). `equipment:elementalAffinity` (multi; `weak`/`immune`/`half`/`absorb`/`potency` map to the five element masks) | schemas L102-148 (xref) | used-in-code |
| Valid `common` content | name, element, category, type, license, notes, hitsFlying. Args: showLabel, showIcon, showComma, plus usePrefix (prefix text before notes) | schemas L41-56, L103-110 (xref) | used-in-code |
| Valid `attributes` content (section 13) | range, defense, onHitRate%, chargeTime, attackPower, evadeShield%, evadeWeapon%, magickEvadeShield%, magickResist, knockbackChance%, comboOrCriticalChance%, augment, maxHp, maxMp, strength, magickPower, vitality, speed. With `showPercentage`, a "%" suffix is added only to the fields marked % | schemas L63-67, L111-121 (xref) | used-in-code |
| Category filter (second gate) | A stat is printed only if (a) the template lists it, (b) its value is non-zero (augment excepted), and (c) it is in the attribute set for the item's **category** byte. Sets: categories 0-17 get the weapon set (range, chargeTime, attackPower, evadeWeapon, knockbackChance, comboOrCriticalChance, onHitRate). Category 18 (shield) gets evadeShield and magickEvadeShield. Categories 19-22 (helm, armor, accessory, crown) get defense, magickResist, augment. Categories 23-26 (arrow, bolt, shot, bomb) get attackPower, evadeWeapon, onHitRate. All sets also include maxHp, maxMp, strength, magickPower, vitality, speed | mappings L15-22, L363-367; cache L80-99; renderer L238-250 (xref) | used-in-code |
| Common-field sources | `name`, `license` and `notes` come from the per-item text data (keyed by bit id; notes are word-wrapped at `layout.itemNotes.wrapLength`). A missing name renders as `UNDEFINED_EQUIPMENT_<bitid>`. `element` is the first set element bit. `category` is the category-name table indexed by the category byte. `type` is the i18n equipment type, or otherwise the icon-name table indexed by the **icon** byte. `hitsFlying` only shows an icon when the item's hitsFlying flag is set | renderer L122-154, L182 (xref) | used-in-code |
| Rows 1, 3, 4, 5 (identical in all 14 files) | Row 1: name, hitsFlying (icon), element (icon), category (icon and label), type (label), license (label). Row 3: statusEffect with hit, equip, immune (label and icon). Row 4: elementalAffinity with weak, immune, half, absorb, potency (label and icon). Row 5: notes | each file L3-10, L16-26 | used-in-code |

### Icon and category names that matter for this batch

| Icon (file) | Icon name (DD `SECTION13_TYPE`) | Vanilla category byte | Category name | Attribute set applied |
|---|---|---|---|---|
| 3 | katana | 3 | katana | weapon |
| 24 | heavyArmor | 20 | armor | armour |
| 25 | ring | 21 | accessory | armour |
| 26 | bracelet | 21 | accessory | armour |
| 27 | glove | 21 | accessory | armour |
| 28 | collar | 21 | accessory | armour |
| 29 | pendant | 21 | accessory | armour |
| 30 | belt | 21 | accessory | armour |
| 31 | boot | 21 | accessory | armour |
| 32 | crown | 22 | crown | armour |
| 33 | arrow | 23 | arrow | ammo |
| 34 | bolt | 24 | bolt | ammo |
| 35 | shot | 25 | shot | ammo |
| 36 | bomb | 26 | bomb | ammo |

Icon names come from DD mappings L54-91 and category names from L24-52 (both used-in-code, xref). The icon-to-category
pairing is my inference from the names. The game does not enforce it: an item's icon and category bytes are independent.

---

## 1. `3.lua` (icon 3 = katana)

**Purpose.** This is the inventory-description layout for every equipment record whose icon is 3 (katana). It is the
general weapon layout, byte-identical to 0.lua, 1.lua and 10.lua (batch_07).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Stats row | 13 stats in alphabetical order: attackPower, chargeTime, comboOrCriticalChance, evadeWeapon, knockbackChance, magickPower, maxHp, maxMp, onHitRate, range, speed, strength, vitality. Args showLabel and showPercentage. Row maxitems 4, so at most 4 stats per line (up to 4 lines) | L12-14 | used-in-code |
| Matches weapon set | The list is exactly the weapon attribute set: 7 weapon fields plus the 6 attribute-record stats. So every listed stat can print for a category 0-17 item | L13; mappings L17-19, L340 (xref) | used-in-code |
| Percent stats | comboOrCriticalChance, evadeWeapon, knockbackChance and onHitRate get "%" because showPercentage is on | L13; schemas L63-67 (xref) | used-in-code |
| Shared rows | Header, status, element and notes rows as in section 0 | L3-10, L16-26 | used-in-code |

## 2. `24.lua` (icon 24 = heavy armour)

**Purpose.** This is the description layout for body armour shown with the heavy-armour icon. It is the armour/accessory
layout, and 25.lua to 32.lua repeat it.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Stats row | 9 stats: defense, magickPower, magickResist, maxHp, maxMp, speed, strength, vitality, then augment last. Args showLabel and showPercentage. maxitems 4 | L12-14 | used-in-code |
| Matches armour set | The list is exactly the armour set (defense, magickResist, augment) plus the 6 attribute-record stats. No weapon or shield fields are listed | L13; mappings L21, L342 (xref) | used-in-code |
| showPercentage has no effect | No field in this list is marked as a percent field, so no "%" is ever added | L13; schemas L63-67 (xref) | used-in-code |
| Augment always prints when present | Augment is printed whenever the raw value is not 255/65535, even when it is 0, so it appears as the last stat | L13; parser L100-101; renderer L245 (xref) | used-in-code |
| Shared rows | Same as section 0. For armour, the `equip` and `immune` status lists and the five element masks come from the attribute record at +8/+12 and +16..+20 | L3-10, L16-26 | used-in-code |

## 3. `25.lua` (icon 25 = ring)

**Purpose.** Accessory description layout for ring-icon items. Byte-identical to 24.lua (md5 c94fa968).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Stats row | Same 9 armour stats as 24.lua. Accessories usually have defense and magickResist at 0, and zero values are hidden, so in practice the row shows augment and any non-zero HP/MP/STR/MAG/VIT/SPD | L13; renderer L245 (xref) | used-in-code |
| Rest | Same as 24.lua | L1-28 | used-in-code |

## 4. `26.lua` (icon 26 = bracelet)

**Purpose.** Accessory layout for bracelet-icon items. Byte-identical to 24.lua.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Content | Same rows and stats as 24.lua | L1-28 | used-in-code |

## 5. `27.lua` (icon 27 = glove)

**Purpose.** Accessory layout for glove-icon items. Byte-identical to 24.lua.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Content | Same rows and stats as 24.lua | L1-28 | used-in-code |

## 6. `28.lua` (icon 28 = collar)

**Purpose.** Accessory layout for collar-icon items. Byte-identical to 24.lua.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Content | Same rows and stats as 24.lua | L1-28 | used-in-code |

## 7. `29.lua` (icon 29 = pendant)

**Purpose.** Accessory layout for pendant-icon items. Byte-identical to 24.lua.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Content | Same rows and stats as 24.lua | L1-28 | used-in-code |

## 8. `30.lua` (icon 30 = belt)

**Purpose.** Accessory layout for belt-icon items. Byte-identical to 24.lua.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Content | Same rows and stats as 24.lua | L1-28 | used-in-code |

## 9. `31.lua` (icon 31 = boot)

**Purpose.** Accessory layout for boot-icon items. Byte-identical to 24.lua.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Content | Same rows and stats as 24.lua | L1-28 | used-in-code |

## 10. `32.lua` (icon 32 = crown)

**Purpose.** Layout for crown-icon items (category 22 "crown" in DD's category table). Byte-identical to 24.lua.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Content | Same rows and stats as 24.lua. Category 22 is in the armour attribute set (19-22), so defense, magickResist and augment can all print | L13; mappings L366 (xref) | used-in-code |

## 11. `33.lua` (icon 33 = arrow)

**Purpose.** This is the description layout for arrow-icon ammunition. It is the ammunition layout, and 34.lua to 36.lua
repeat it.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Stats row | 9 stats: attackPower, evadeWeapon, magickPower, maxHp, maxMp, onHitRate, speed, strength, vitality. Args showLabel and showPercentage. maxitems 4 | L12-14 | used-in-code |
| Matches ammo set | The list is exactly the ammo set (attackPower, evadeWeapon, onHitRate) plus the 6 attribute-record stats. It leaves out range, chargeTime, knockbackChance and comboOrCriticalChance, which ammo does not use | L13; mappings L22, L343, L367 (xref) | used-in-code |
| Percent stats | evadeWeapon and onHitRate get "%" | L13; schemas L63-67 (xref) | used-in-code |
| Header element | The `element` block shows the first set element bit, the ammo's elemental property (e.g. fire arrows) | L6; renderer L141-144 (xref) | used-in-code |
| Status row | `hit` lists the ammo's on-hit statuses from the record's statusEffects field. `equip`/`immune` come from the attribute record | L16-18 | used-in-code |

## 12. `34.lua` (icon 34 = bolt)

**Purpose.** Ammunition layout for bolt-icon items. Byte-identical to 33.lua (md5 36da7f51).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Content | Same rows and stats as 33.lua | L1-28 | used-in-code |

## 13. `35.lua` (icon 35 = shot)

**Purpose.** Ammunition layout for shot-icon items. Byte-identical to 33.lua.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Content | Same rows and stats as 33.lua | L1-28 | used-in-code |

## 14. `36.lua` (icon 36 = bomb)

**Purpose.** Ammunition layout for bomb-icon items. Byte-identical to 33.lua.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Content | Same rows and stats as 33.lua | L1-28 | used-in-code |

---

## Editor takeaways

* **The template folder is a lookup table keyed by icon byte.** An offline DD template editor can show the 192 slots
  (icons 0-191) and mark which ones exist. Within those slots there are only three real layouts (weapon, armour/accessory,
  ammo) plus whatever the other icon files contain. Deduplicating them by hash is safe.
* **Icon and category gate output separately.** The template is picked by the **icon** (+0x04), but the stats are
  filtered by the **category** (+0x09). A battlepack editor that changes one byte without the other can make stats
  vanish. For example, an accessory given an arrow icon would list attackPower, but the armour filter would drop it.
  The editor should warn when the icon's family (weapon 0-17, shield 18, armour 19-32, ammo 33-36) differs from the
  category's family (0-17, 18, 19-22, 23-26).
* **Template validation rules to copy:** the content names must be in the schema lists in section 0, and the args must
  be showLabel/showIcon/showComma (plus usePrefix on `common` and showPercentage on `attributes`). The row attributes
  are itemspace/groupspace/maxitems. Sizes are lg/md/sm or a number. DD itself only logs a warning on bad input
  (`WARN [DD] Template ...`) and keeps running.
* **The Lua memory editor gets no new addresses from this batch.** The stats these templates show come from the
  section-13 record and its attribute record (offsets in section 0). Editing those in memory and then setting the DD
  global symbol `dd_refresh` (a 1-byte flag that DD polls every 1000 ms) makes DD rebuild the descriptions
  (DD main L44-68, xref).
