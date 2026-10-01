# Drive batch 08: DynamicDescription equipment templates `2.lua`, `11.lua` .. `23.lua`

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR.

Files in this batch (all 14 read in full; none missing):

| Drive id | Title | Drive path | Lines | Bytes | md5 (first 8) | Layout |
|---|---|---|---|---|---|---|
| 19ywJEJJPDshOStHAbORJoBkdHsUMGNPn | 2.lua | My Laptop/scripts/config/DynamicDescription/templates/equipment | 28 | 1082 | c00d2b0a | W (weapon) |
| 1CVru9odY_wHFRAFCj0PbsUGw12o05ZW3 | 11.lua | same | 28 | 1082 | c00d2b0a | W |
| 1yA81YTt1xVwnpGNwiDbcQrAlgZOfJkXT | 12.lua | same | 28 | 1082 | c00d2b0a | W |
| 11FnXxaNKv3BdaM_LOE3OEnZ0F4kRFXFz | 13.lua | same | 28 | 1082 | c00d2b0a | W |
| 1BU8oUdMsyzDX51ThsjI0devsOkuudWYf | 14.lua | same | 28 | 1082 | c00d2b0a | W |
| 1gRnwyW8qa_tTZu_9-JhZQlaBqyxxPKVQ | 15.lua | same | 28 | 1082 | c00d2b0a | W |
| 194nAYRUIbfjnJfaYg9gSpxQMrSJFnDYs | 16.lua | same | 28 | 1082 | c00d2b0a | W |
| 1Z5tmrchUW-TLpor-kREVaGaVx93icDeA | 17.lua | same | 28 | 1082 | c00d2b0a | W |
| 1VsygIdXSlEJkJMKP63Q6BeEe4KN1-30y | 18.lua | same | 28 | 1018 | d4de143f | S (shield) |
| 1j3zHSc-PFdt-S1-Q-LA2zgoCdaxMfuEY | 19.lua | same | 28 | 1018 | c94fa968 | A (armour) |
| 1CsSF3h_sUVsKY1_4gSfStIsyZsgtezFg | 20.lua | same | 28 | 1018 | c94fa968 | A |
| 13YJJ5k0uK6id9ulWyx0qQUwekErM1pdN | 21.lua | same | 28 | 1018 | c94fa968 | A |
| 1P11MwjDfPplSHMnDFy5qzqFxDJOOLIN9 | 22.lua | same | 28 | 1018 | c94fa968 | A |
| 168t5cloFEp_4UrcE0CzZ3OPaXNvsXoT3 | 23.lua | same | 28 | 1018 | c94fa968 | A |

Identity was checked with md5 and `cmp`: the W files are byte-identical to `equipment/0.lua`, `1.lua` and `10.lua`
from batch_07 (same hash c00d2b0a...). The S file is unique. The A files are identical to each other. 18.lua and 19.lua
have the same size but differ on line 13 only.

The files have no author header. They belong to FehDead's DynamicDescription mod (not Xeavin). These are data files
with no addresses and no code patches, so nothing here is `byte-check-in-code`. To read them I used the code that
consumes them (not mined here, cited as "(xref)"): DD `DynamicDescription.lua`, `parser.lua`, `schemas.lua`,
`mappings.lua` (drive id 1fNzQewQ...), `renderer.lua`, `utils.lua`, `cache.lua`. Facts are written in my own words.
No code is copied.

Evidence key: **used-in-code** = the consuming code reads the field or keyword. **comment-only** = only a comment
says so. **unclear** = my inference.

---

## Quick reference

### What the file number means

| Topic | Detail | Source | Evidence |
|---|---|---|---|
| Loader | DD loads `templates/equipment/<n>.lua` for n = 0..191 and stores each string as template key `equipment_<n>`. Each file returns one Lua long-bracket string | DD main L21-26, L96-110 (xref) | used-in-code |
| Key rule | An equipment item uses the template `equipment_<icon>`. `icon` is the sec13 equipment record's icon field (record +0x04, stride 0x34, see batch_01/batch_07). The category is not used | DD parser L91, L148 (xref) | used-in-code |
| Icon names in this batch | 2 greatSword, 11 hammer, 12 dagger, 13 rod, 14 staff, 15 mace, 16 measure, 17 handBomb, 18 shield, 19 lightHelm, 20 mysticHelm, 21 heavyHelm, 22 lightArmor, 23 mysticArmor | DD mappings SECTION13_TYPE (xref) | used-in-code |
| `type` label | The `type` block shows the icon's name: it uses the i18n `equipment.type[icon]` entry if one exists, otherwise the SECTION13_TYPE name | DD renderer L146-151 (xref) | used-in-code |
| Attribute filter | The attributes row is filtered by the item's **category** (sec13 +0x09), not its icon. Sets: categories 0-17 = weapon set, 18 = shield set, 19-22 = armour set, 23-26 = ammo set | DD renderer L234-245; cache L80-90; mappings ATTRIBUTE_SETS (xref) | used-in-code |
| Icon vs category | Icons 2 and 11-17 should be categories 2 and 11-17 (weapons). Icon 18 should be category 18 (shield). Helm icons 19-21 should be category 19 (helm), armour icons 22-23 category 20 (armor) | SECTION13_CATEGORY vs SECTION13_TYPE (xref) | unclear (inference from the two enums; not checked against bpack data) |

### The three layouts (only row 2 differs)

| Layout | Files (this batch) | Row-2 attributes, in order | Same as the category's attribute set? |
|---|---|---|---|
| W | 2, 11-17 (and 0, 1, 10 from batch_07) | attackPower, chargeTime, comboOrCriticalChance, evadeWeapon, knockbackChance, magickPower, maxHp, maxMp, onHitRate, range, speed, strength, vitality (13) | Yes. WEAPON_BASE (7) + the 6 pointer stats = 13 |
| S | 18 | evadeShield, magickEvadeShield, magickPower, maxHp, maxMp, speed, strength, vitality (8) | Yes. SHIELD_BASE (2) + 6 = 8 |
| A | 19-23 | defense, magickPower, magickResist, maxHp, maxMp, speed, strength, vitality, augment (9) | Yes. ARMOR_BASE (3) + 6 = 9 |

The fields are in alphabetical order, except that A puts `augment` last. Each layout lists exactly the attributes its
category allows, so the category filter removes nothing.

### Rendering rules that apply to every template here

| Topic | Detail | Source | Evidence |
|---|---|---|---|
| Order | Blocks render in file order. Inside a block, fields render in `content:(...)` order | DD renderer L222-245 (xref) | used-in-code |
| Zero hiding | An attribute renders only when its value is non-zero. `augment` is the exception: it renders whenever it is set, including id 0 (Stability). The parser treats 255 / 65535 as "no augment" | DD renderer L240-241; parser L100-101 (xref) | used-in-code |
| Augment text | Augment ids go through `mappings.augments` (0 stability, 1 safety, 2 accuracyBoost, 3 shieldBoost, 4 evasionBoost ... 124 etherLore1, 125-127 phoenixLore3/2/1, 128 secondBoard), then the i18n augment names. An id with no key prints as a number | DD renderer L208-211; mappings AUGMENTS (xref) | used-in-code |
| Percent fields | With `showPercentage`, a "%" suffix is added only to onHitRate, evadeShield, evadeWeapon, magickEvadeShield, knockbackChance and comboOrCriticalChance | DD schemas L63-68; renderer L201-203 (xref) | used-in-code |
| Pointer stats | maxHp/maxMp (s16 at +0/+2) and strength/magickPower/vitality/speed (s8 at +4..+7) come from the attribute record that `attributePointer` points to. The record also holds the status u32s at +8 (equip) and +12 (immune), and the element masks at +16 absorb, +17 immune, +18 half, +19 weak, +20 potency | DD parser L103-122 (xref) | used-in-code |
| `maxitems` | Wraps the row onto new lines; it does **not** truncate. For single rows (common/attributes), a new line starts every `maxitems` parts. For multi rows (status/affinity), a label token weighs 2 and an item weighs 1, and a line breaks when the weighted count would exceed `maxitems`. (batch_07 says "caps the row at 4 items"; that is a misreading) | DD utils L10-27, L86-116, L145-163 (xref) | used-in-code |
| Spacers | `itemspace:(1)` = 1 narrow space (`tags.space.low`) between a label and its value. `groupspace:(1)` = 1 wide space (`tags.space.wide`) between parts. Defaults are 1 and 2 | DD utils L152-153; schemas ROW_DEFAULTS (xref) | used-in-code |
| Element shown | `element` shows only the first set element bit of the item's `elements` | DD renderer L141-144 (xref) | used-in-code |
| Name fallback | If i18n has no name, the name renders as `UNDEFINED_EQUIPMENT_<bitid>`, where bitid = 4096 + equipment index | DD renderer L123-126; parser L147 (xref) | used-in-code |

### Template coverage so far (equipment icons, batches 07 + 08)

| Icon(s) | Seen in | Layout |
|---|---|---|
| 0, 1, 10 | batch_07 | W |
| 2, 11-17 | batch_08 | W |
| 18 | batch_08 | S |
| 19-23 | batch_08 | A |
| 3-9, 24-36 (heavy armour, accessories, crown, ammo) and the rest of 0..191 | not in batches 07/08 | if there is no file, DD prints "Template ... not found" and renders an empty description (batch_07, DD template L202-207) |

---

## 1. `templates/equipment/2.lua` (greatSword icon, layout W)

**Purpose.** The inventory and shop description layout for every equipment record whose icon is 2 (greatsword). It
has five rows: header, numeric stats, statuses, elemental affinities and notes.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Wrapper | The file returns a long-bracket string. Blank lines and newlines are collapsed to spaces before parsing | L1, L28; DD template L36-39 (xref) | used-in-code |
| Row 1 attrs | itemspace 1, groupspace 1, default maxitems (999) | L3 | used-in-code |
| Row 1 blocks | `equipment:common` six times: name, hitsFlying (icon only), element (icon only), category (icon + label), type (label), license (label) | L4-9 | used-in-code |
| Row 2 | `equipment:attributes` with the 13 W fields (see Quick reference), args showLabel + showPercentage, row maxitems 4, so it wraps every 4 stats | L12-14 | used-in-code |
| Row 3 | `equipment:statusEffect` with hit, equip, immune. Args showLabel + showIcon, maxitems 10 (weighted) | L16-18 | used-in-code |
| Status sources | hit = the sec13 record's own status-effects field. equip = attribute record +8 (u32). immune = attribute record +12 (u32). Status bit order: ko, stone, petrify, stop, sleep, confuse, doom, blind, poison, silence, sap, oil, reverse, disable, immobilize, slow, disease, lure, protect, shell, haste, bravery, faith, reflect, invisible, regen, float, berserk, bubble, hpCritical, libra, xZone (bit 0..31) | L17; DD parser L84, L117-118; mappings STATUS_EFFECTS (xref) | used-in-code |
| Row 4 | `equipment:elementalAffinity` with weak, immune, half, absorb, potency. Args showLabel + showIcon, maxitems 10 | L20-22 | used-in-code |
| Element masks | weak = +19, immune = +17, half = +18, absorb = +16, potency = +20, each a u8 mask (bit 0 fire, 1 lightning, 2 ice, 3 earth, 4 water, 5 wind, 6 holy, 7 dark) | L21; DD parser L119-123; mappings ELEMENTS (xref) | used-in-code |
| Row 5 | `equipment:common` with `notes` (free text from DD i18n/custom data, word-wrapped to the `notesWrapLength` setting) | L24-26; DD renderer L131-140 (xref) | used-in-code |
| Applies to | Icon 2 greatSword | file name; DD parser L148 (xref) | used-in-code |

## 2. `templates/equipment/11.lua` (hammer icon, layout W)

**Purpose.** The description layout for icon 11 (hammer). It is byte-identical to 2.lua.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Identity | Same md5 as 2.lua and as batch_07 `equipment/0.lua` | all | n/a |
| Rows | Header L3-10, stats L12-14 (13 W fields, maxitems 4), status L16-18, affinity L20-22, notes L24-26 | L3-26 | used-in-code |
| Applies to | Icon 11 hammer. The category (expected 11) uses the weapon attribute set | file name; mappings (xref) | used-in-code / unclear (icon-to-category link) |

## 3. `templates/equipment/12.lua` (dagger icon, layout W)

**Purpose.** The description layout for icon 12 (dagger). It is byte-identical to 2.lua.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Identity | md5 c00d2b0a..., same as 2.lua | all | n/a |
| Rows | Same five rows as 2.lua | L3-26 | used-in-code |
| Applies to | Icon 12 dagger | file name | used-in-code |

## 4. `templates/equipment/13.lua` (rod icon, layout W)

**Purpose.** The description layout for icon 13 (rod). It is byte-identical to 2.lua.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Identity | md5 c00d2b0a..., same as 2.lua | all | n/a |
| Rows | Same five rows as 2.lua. For rods, magickPower usually holds a value and shows up in row 2 | L3-26 | used-in-code (the zero-hiding rule is in code; "usually" is unclear) |
| Applies to | Icon 13 rod | file name | used-in-code |

## 5. `templates/equipment/14.lua` (staff icon, layout W)

**Purpose.** The description layout for icon 14 (staff). It is byte-identical to 2.lua.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Identity | md5 c00d2b0a..., same as 2.lua | all | n/a |
| Rows | Same five rows as 2.lua | L3-26 | used-in-code |
| Applies to | Icon 14 staff | file name | used-in-code |

## 6. `templates/equipment/15.lua` (mace icon, layout W)

**Purpose.** The description layout for icon 15 (mace). It is byte-identical to 2.lua.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Identity | md5 c00d2b0a..., same as 2.lua | all | n/a |
| Rows | Same five rows as 2.lua | L3-26 | used-in-code |
| Applies to | Icon 15 mace | file name | used-in-code |

## 7. `templates/equipment/16.lua` (measure icon, layout W)

**Purpose.** The description layout for icon 16 (measure). It is byte-identical to 2.lua.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Identity | md5 c00d2b0a..., same as 2.lua | all | n/a |
| Rows | Same five rows as 2.lua | L3-26 | used-in-code |
| Applies to | Icon 16 measure | file name | used-in-code |

## 8. `templates/equipment/17.lua` (hand-bomb icon, layout W)

**Purpose.** The description layout for icon 17 (handBomb). It is byte-identical to 2.lua.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Identity | md5 c00d2b0a..., same as 2.lua | all | n/a |
| Rows | Same five rows as 2.lua | L3-26 | used-in-code |
| Applies to | Icon 17 handBomb (the last weapon icon; categories 0-17 are all weapons) | file name; mappings ATTRIBUTE_SETS 0-17 (xref) | used-in-code |
| Not ammo | The bomb ammo icon (36) and the ammo category (26) are separate. Ammo uses the 3-field ammo set (attackPower, evadeWeapon, onHitRate + pointer stats) | mappings AMMO_BASE (xref) | used-in-code |

## 9. `templates/equipment/18.lua` (shield icon, layout S)

**Purpose.** The description layout for icon 18 (shield). The only change from layout W is row 2, which lists the
shield fields.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Row 1 | Same header as 2.lua: name, hitsFlying, element, category, type, license | L3-10 | used-in-code |
| Row 2 | `equipment:attributes` with evadeShield, magickEvadeShield, magickPower, maxHp, maxMp, speed, strength, vitality. Args showLabel + showPercentage, maxitems 4 (wraps after 4) | L12-14 | used-in-code |
| Percent fields | evadeShield and magickEvadeShield are the only percent fields here, so they get "%" | L13; DD schemas L65 (xref) | used-in-code |
| Category set | Category 18 allows exactly SHIELD_BASE (evadeShield, magickEvadeShield) + the 6 pointer stats, which matches row 2 | DD mappings ATTRIBUTE_SETS[18] (xref) | used-in-code |
| Rows 3-5 | Status (hit/equip/immune), affinity (weak/immune/half/absorb/potency), notes: same as 2.lua | L16-26 | used-in-code |
| Diff | Only line 13 differs from 2.lua and from 19.lua | L13 | n/a |
| Applies to | Icon 18 shield | file name | used-in-code |

## 10. `templates/equipment/19.lua` (light helm icon, layout A)

**Purpose.** The description layout for icon 19 (lightHelm). Row 2 lists the armour fields.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Row 1 | Same header as 2.lua | L3-10 | used-in-code |
| Row 2 | `equipment:attributes` with defense, magickPower, magickResist, maxHp, maxMp, speed, strength, vitality, augment. Args showLabel + showPercentage (none of these fields are percent fields, so no "%" appears). maxitems 4, so up to 3 lines | L12-14 | used-in-code |
| Augment | augment = the sec13 record's augment byte (sec58 augment id; 255 = none). It renders even when the id is 0. The name comes from i18n through `mappings.augments` | L13; DD parser L100-101; renderer L208-211 (xref) | used-in-code |
| Category set | Categories 19-22 (helm, armor, accessory, crown) use ARMOR_BASE (defense, magickResist, augment) + the 6 pointer stats, which matches row 2 | DD mappings ATTRIBUTE_SETS[19..22] (xref) | used-in-code |
| Rows 3-5 | Same as 2.lua | L16-26 | used-in-code |
| Applies to | Icon 19 lightHelm | file name | used-in-code |

## 11. `templates/equipment/20.lua` (mystic helm icon, layout A)

**Purpose.** The description layout for icon 20 (mysticHelm). It is byte-identical to 19.lua.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Identity | md5 c94fa968..., same as 19.lua | all | n/a |
| Rows | Same as 19.lua: header, 9 armour stats ending with augment, status, affinity, notes | L3-26 | used-in-code |
| Applies to | Icon 20 mysticHelm | file name | used-in-code |

## 12. `templates/equipment/21.lua` (heavy helm icon, layout A)

**Purpose.** The description layout for icon 21 (heavyHelm). It is byte-identical to 19.lua.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Identity | md5 c94fa968..., same as 19.lua | all | n/a |
| Rows | Same as 19.lua | L3-26 | used-in-code |
| Applies to | Icon 21 heavyHelm | file name | used-in-code |

## 13. `templates/equipment/22.lua` (light armour icon, layout A)

**Purpose.** The description layout for icon 22 (lightArmor). It is byte-identical to 19.lua.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Identity | md5 c94fa968..., same as 19.lua | all | n/a |
| Rows | Same as 19.lua | L3-26 | used-in-code |
| Applies to | Icon 22 lightArmor. The armour category (expected 20) uses the armour attribute set | file name; mappings (xref) | used-in-code / unclear (icon-to-category link) |

## 14. `templates/equipment/23.lua` (mystic armour icon, layout A)

**Purpose.** The description layout for icon 23 (mysticArmor). It is byte-identical to 19.lua.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Identity | md5 c94fa968..., same as 19.lua | all | n/a |
| Rows | Same as 19.lua | L3-26 | used-in-code |
| Applies to | Icon 23 mysticArmor. Heavy armour (icon 24) is not in this batch | file name | used-in-code |

---

## Editor relevance

* **Template editor (offline / in-game DD config):** the grammar is small and complete. A row is `{dt:row}` with
  itemspace, groupspace and maxitems. A block is `equipment:common|attributes|statusEffect|elementalAffinity|customAttributes`
  with `content` and `args`, plus optional size, labelColor, valueColor and title. Each file is keyed by the item's
  **icon**, but its attribute row is filtered by the item's **category**. An editor should offer the category's
  attribute set (W 13, S 8, A 9, ammo 9 fields) as the pick list and warn about fields the filter would drop. It can
  also generate a missing `<icon>.lua` from the W/S/A presets. Since only line 13 differs between presets, a "preset
  + row-2 field list" model is enough to reproduce every file seen so far.
* **Equipment (sec13) editor:** these templates show which record fields a player sees for each icon class: the icon
  byte (+0x04), the category byte (+0x09), the augment byte, the status / element fields, and the attribute record
  behind `attributePointer` (+0 s16 HP, +2 s16 MP, +4..+7 s8 Str/Mag/Vit/Spd, +8/+12 u32 status, +16..+20 u8
  element masks). If you change an item's icon, its description layout and `type` label change. If you change its
  category, the attribute filter changes.
* **Live refresh:** DD watches `scripts/config/DynamicDescription/*.lua` and re-runs when a file changes. It also
  polls the global symbol `dd_refresh` (a 1-byte flag from `memory.alloc`; write 1 to it) once a second to reload the
  custom attributes and re-render. An external memory editor can use that flag after it changes equipment values.
  (DD main L44-70, L184-190, xref; used-in-code.) The watch glob covers only the top-level config folder. Whether
  saving a file under `templates/equipment/` triggers a reload depends on how Lua Loader matches the glob
  (**unclear**). Saving any top-level DD config file forces a full re-init, which reloads every template.
