# Drive batch 10: DD equipment templates 4-9, DD config files (customAttributes, i18n, settings, tags), FCTR bestiary configs (ch, cn, de, es)

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR.
Addresses are the absolute VAs the Lua Loader scripts use. RVA = VA - 0x120000.

| # | Drive id | Title | Drive path (under `My Laptop/scripts/config/`) | Lines / bytes | md5 (first 8) | Status |
|---|---|---|---|---|---|---|
| 1 | 14FO77MC7cgPfEqQDTd6wFhdMgcwZa6wN | 4.lua | DynamicDescription/templates/equipment | 28 / 1082 | c00d2b0a | read in full |
| 2 | 1PaHSGVBkTOh0BDmwEMHtbIpyAqHvRTkE | 5.lua | same | 28 / 1082 | c00d2b0a | read in full |
| 3 | 1nJ5mBL1UjFB4G5p-usy-_0M8PUrRlUFl | 6.lua | same | 28 / 1082 | c00d2b0a | read in full |
| 4 | 17USnwfeCkLqSlHl6gsEcBCOhFloW5ivu | 7.lua | same | 28 / 1082 | c00d2b0a | read in full |
| 5 | 1iUyKWcps0bjC-a2detctNCqJT7plk9lW | 8.lua | same | 28 / 1082 | c00d2b0a | read in full |
| 6 | 1bpWmWliXOS8Wf8H1eh0RfEZquocJXs8r | 9.lua | same | 28 / 1082 | c00d2b0a | read in full |
| 7 | 1AdbMd-_8f84-wcgiFvYGpoLl8si3urTz | customAttributes.json | DynamicDescription | 3 / 28 | 5d3f5bc7 | read in full |
| 8 | 1bkZR8iwYxxEF1kid1ZfdYY9d_UDnspM0 | i18n.lua | DynamicDescription | 3415 / 68789 (CRLF) | a23c4e24 | read in full (all 589 id entries parsed and listed) |
| 9 | 1DMao83lHnT4tbGhUFp1WM-o2ACVwKxZy | settings.lua | DynamicDescription | 24 / 477 (CRLF) | 86e9c599 | read in full |
| 10 | 1Vy41bidYp4oNi9Mr6-eLOWKSOCn7XAbn | tags.lua | DynamicDescription | 76 / 3176 (CRLF) | 9083a4c0 | read in full |
| 11 | 1aDpgf4AUzFEBnuH9qKUhykSDjaIrb9-l | ch.lua | FoedexClanPrimerTextReplacerConfig/Bestiary | 19 / 663 (CRLF) | 26cafd9f | read in full |
| 12 | 1iha8ln4-Ni0g_li-C99BKy_w9n36mrtc | cn.lua | same | 19 / 663 | 26cafd9f | read in full |
| 13 | 1L5DbWDc9zT1kMXgobPG2LJChA44eC_xu | de.lua | same | 19 / 663 | 26cafd9f | read in full |
| 14 | 1FjIgM1m1YrRZzQQt0Y1RGYqTkoEYm5r_ | es.lua | same | 19 / 663 | 26cafd9f | read in full |

No file is missing. Files 1-6 are byte-identical to one another and to the weapon layout W from batch_07/batch_08
(0, 1, 2, 3, 10-17). Files 11-14 are byte-identical to one another.

Authors: files 1-10 are FehDead's DynamicDescription (DD). Files 11-14 belong to LowPriorityCitizen's Foedex Clan Primer
Text Replacer (FCTR). Neither mod is by Xeavin. DD's output is read by Xeavin's The Insurgent's Descriptive Inventory
(TIDI). Only facts are recorded below; no code is reproduced.

None of the 14 config files contains an address. The memory facts below come from the modules that consume these
files (marked **xref**). I read those modules to explain the configs: DD `DynamicDescription.lua`, `engine.lua`,
`parser.lua`, `renderer.lua`, `layout.lua`, `utils.lua` and `mappings.lua` (the 387-line one), and
`FoedexClanPrimerTextReplacer.lua`.

Evidence key:
* **byte-check-in-code**: the consuming code compares the original bytes before it patches.
* **used-in-code**: code reads or writes the value or address, or the consuming engine reads this config value.
* **comment-only**: only a comment says so.
* **unclear**: my inference from naming or cross-reference. It is not proven by code.

---

## 0. Shared DD facts needed to read files 1-10

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| How config files are loaded | DD loads `settings.lua`, `tags.lua` and `i18n.lua` from `scripts/config/DynamicDescription/`. Each is a Lua chunk that returns a table, run in a sandbox whose env falls back to `_G`. Equipment templates `templates/equipment/<n>.lua` are tried for n = 0..191 and action templates `templates/action/<n>.lua` for n = 0..8. A missing file is skipped silently | DD main L2-31, L77-111 (xref) | used-in-code |
| Hot reload | A file-change handler on `scripts/config/DynamicDescription/*.lua` re-runs init, re-applies the MRP layout and regenerates the export. So editing i18n/tags/settings live updates descriptions | DD main L32, L191-197 (xref) | used-in-code |
| Output | DD writes `scripts/config/TheInsurgentsDescriptiveInventoryConfig/<lang>.lua`. It returns a function that yields a list of `{bitId, "tagged text"}` pairs. `<lang>` comes from game language id (see section 8). TIDI turns that tagged text into the in-game description | engine L7-12, L123-156 (xref) | used-in-code |
| Data source | DD reads battlepack sections through the Lua Loader `bpack` global: `bpack.section13[i]` (equipment) and `bpack.section14[i]` (actions) for i = 0..itemLimit-1 | engine L103-118 (xref) | used-in-code |
| Template key | Equipment uses `equipment_<icon byte>`. Actions use `action_<chargeAuraAnimation byte>` (category 0..8) | parser L144-153 (xref); batch_09 | used-in-code |
| Lua Loader minimum | DD refuses to run below Lua Loader 1.10.1 | DD main L175-182 (xref) | used-in-code |

---

## 1. `4.lua` (icon 4 = ninjaSword)

**Purpose.** Description layout for every section-13 record whose icon byte is 4 (DD icon name `ninjaSword`, vanilla category 4,
i18n type label "Fast"). It is the general weapon layout W.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| File format | Lua chunk that returns one long-bracket string in DD template markup: 5 `{dt:row ...}...{/row}` blocks | L1-28 | used-in-code |
| Row 1 (header) | `equipment:common` blocks: name; hitsFlying (icon); element (icon); category (icon and label); type (label); license (label). itemspace 1, groupspace 1 | L3-10 | used-in-code |
| Row 2 (stats) | `equipment:attributes`, 13 fields: attackPower, chargeTime, comboOrCriticalChance, evadeWeapon, knockbackChance, magickPower, maxHp, maxMp, onHitRate, range, speed, strength, vitality. Args showLabel and showPercentage. maxitems 4 per line | L12-14 | used-in-code |
| Row 3 (status) | `equipment:statusEffect`, content hit/equip/immune. Label and icon. maxitems 10 | L16-18 | used-in-code |
| Row 4 (elements) | `equipment:elementalAffinity`, content weak/immune/half/absorb/potency. Label and icon. maxitems 10 | L20-22 | used-in-code |
| Row 5 | `equipment:common` notes (from i18n `database.equipment[bitId].notes`, wrapped at settings `itemNotes.wrapLength`) | L24-26 | used-in-code |
| Which items | In vanilla data, icon 4 is the ninja-sword group: bit ids 0x1023-0x1029 (Ashura .. Yagyu Darkblade) and 0x10AB Mesa (i18n licences "Ninja Swords n"). The icon-to-item mapping is my inference from the names | i18n L518-552, L1198 (xref) | unclear |

## 2. `5.lua` (icon 5 = spear)

**Purpose.** Weapon layout W for icon 5 (`spear`, category 5, type label "Standard"). Byte-identical to 4.lua.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Content | Same 5 rows and same 13-stat list as 4.lua | L1-28 | used-in-code |
| Which items | Spears 0x102A-0x1035 (Javelin .. Zodiac Spear). Which TZA zodiac weapons share icon 5 cannot be told from names alone | i18n L553-612 | unclear |

## 3. `6.lua` (icon 6 = pole)

**Purpose.** Weapon layout W for icon 6 (`pole`, category 6, type label "Magick Resist"). Byte-identical to 4.lua.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Content | Same rows and stats as 4.lua | L1-28 | used-in-code |
| Which items | Poles 0x1036-0x1041 (Oaken Pole .. Whale Whisker). Name-based inference | i18n L613-672 | unclear |

## 4. `7.lua` (icon 7 = bow)

**Purpose.** Weapon layout W for icon 7 (`bow`, category 7, type label "Fast"). Byte-identical to 4.lua.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Content | Same rows and stats as 4.lua. hitsFlying matters most here: the header shows the hitsFlying glyph (tags icon 20) only when the record's hitsFlying flag is set | L5; renderer L153 (xref) | used-in-code |
| Which items | Bows 0x1042-0x104F (Shortbow .. Sagittarius). Name-based inference | i18n L673-742 | unclear |

## 5. `8.lua` (icon 8 = crossbow)

**Purpose.** Weapon layout W for icon 8 (`crossbow`, category 8, type label "Standard"). Byte-identical to 4.lua.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Content | Same rows and stats as 4.lua | L1-28 | used-in-code |
| Which items | Crossbows 0x1050-0x1056 (Bowgun .. Gastrophetes) and 0x10B0 Tula (licence Crossbows 4). Name-based inference | i18n | unclear |

## 6. `9.lua` (icon 9 = gun)

**Purpose.** Weapon layout W for icon 9 (`gun`, category 9, type label "Piercing"). Byte-identical to 4.lua.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Content | Same rows and stats as 4.lua | L1-28 | used-in-code |
| Which items | Guns 0x1057-0x1061 (Altair .. Fomalhaut). Name-based inference | i18n | unclear |

---

## 7. `customAttributes.json`

**Purpose.** This file is a runtime hand-off channel. An external tool uses it to inject extra description attributes
and per-item style overrides into DD without editing templates. The shipped content is `{"customData": []}`.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Shipped content | One key, `customData`, holding an empty array | L1-3 | used-in-code |
| Reset at startup | When DD applies its patch, it overwrites this file with an empty `customData`. So the file is not persistent user config | DD main L185-187 (xref) | used-in-code |
| Refresh trigger (IPC) | DD allocates 1 byte and registers it as a **global** Lua Loader symbol named `dd_refresh`. It polls the byte every 1000 ms. When the byte is 1, DD re-reads the JSON, pushes it to the renderer, invalidates the render cache and regenerates the export, then sets the byte back to 0. An outside editor (CE or another Lua script) can write the JSON and set `dd_refresh` = 1 to force a rebuild | DD main L43-75 (xref) | used-in-code |
| Schema: lookup key | `customData` is indexed by the item **bit id as a string**, e.g. "4097" or "12288" | renderer L23-28, L255 (xref) | used-in-code |
| Schema: extra attributes | `customData[bitId].customAttributes` is an array of `{id, label, value, isPercent}`. A template block `{dt:<section>:customAttributes content:(id1, id2...)}` prints each listed id whose value is non-zero, as "label: value", with "%" when isPercent is true and the block has showPercentage | renderer L253-279; engine L18-20 (xref) | used-in-code |
| Schema: overrides | `customData[bitId].attributeOverrides[field]` can set `label`, `labelColor` and `valueColor` (as "R,G,B" strings, wrapped into `{rgb:...}`), `labelSuffix` and `valueSuffix`. These apply to built-in fields as well as custom ids | renderer L23-46, L203-205 (xref) | used-in-code |

---

## 8. `i18n.lua` (DD display strings and item text database)

**Purpose.** This file holds all English UI strings DD prints: element names, status names, augment names, labels, and
category and type names. It also holds a per-id text database (name, licence, notes, prefix) for 420 equipment ids and
169 action contents. DD uses this one file whatever the game language is; only the export file name changes.

### 8a. Structure

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Top-level return | A table with `elements`, `statusEffects`, `augments`, `equipment` (labels, attributes, category, type), `action` (labels, attributes, category) and `database` = {equipment, items, magicks, technicks} | L3403-3415 | used-in-code |
| Database lookup | The renderer looks up `database[group][bitId]`. group is "equipment" for section 13. For section 14 the group comes from the action category byte: 1-5 give "magicks", 7 gives "technicks", 8 gives "items". Category 0 (attack) and 6 (mist) have no group ("unknown") | parser L26-34, L138-139; renderer L224-225 (xref) | used-in-code |
| Equipment key | bit id = 4096 + section-13 index (0x1000 + i) | parser L5, L147 (xref) | used-in-code |
| Action key | bit id = the section-14 record's `requiredContent` u16 (the content id the action needs: item id, 0x30xx magick or 0x40xx technick). Records with 0xFFFF are skipped | parser L139, L151 (xref) | used-in-code |
| Missing name | When no database entry exists, the name prints as `UNDEFINED_<GROUP>_<bitId>` | renderer L122-125 (xref) | used-in-code |
| `prefix` field | Actions only. It is a verb that prefixes notes when the block has `usePrefix`. It also replaces the "Hit" label of an action statusEffect group (e.g. "Inflicts:", "Removes:", "Applies:") | renderer L131-137, L290-309 (xref) | used-in-code |
| Type lookup | i18n `equipment.type` is keyed by DD's icon-name strings (`mappings.section13.type[icon]`), not by the raw icon number | renderer L147-151 (xref) | used-in-code |

### 8b. Enumerations (ordering confirmed by DD mappings.lua)

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Element bit order (8) | bit0 fire, 1 lightning, 2 ice, 3 earth, 4 water, 5 wind, 6 holy, 7 dark. This order is used for every element mask (attack element, absorb/immune/half/weak/potency) | L2-11; mappings L2 (xref) | used-in-code |
| Status bit order (32) | bit0 KO, 1 Stone, 2 Petrify, 3 Stop, 4 Sleep, 5 Confuse, 6 Doom, 7 Blind, 8 Poison, 9 Silence, 10 Sap, 11 Oil, 12 Reverse, 13 Disable, 14 Immobilize, 15 Slow, 16 Disease, 17 Lure, 18 Protect, 19 Shell, 20 Haste, 21 Bravery, 22 Faith, 23 Reflect, 24 Invisible (Vanish), 25 Regen, 26 Float, 27 Berserk, 28 Bubble, 29 HP Critical, 30 Libra, 31 X-Zone. One u32 mask for on-hit, equip and immune statuses | L13-46; mappings L4-8 (xref) | used-in-code |
| Augment ids (0-128) | 129 keys plus `none`. By id (DD mappings): 0 Stability, 1 Safety, 2 Accuracy Boost, 3 Shield Boost, 4 Evasion Boost, 5 Last Stand, 6 Counter, 7 Counter Boost, 8 Spellbreaker, 9 Brawler, 10 Adrenaline, 11 Focus, 12 Lobbying, 13 Combo Boost, 14 Item Boost, 15 Medicine Reverse, 16 Weatherproof, 17 Thievery, 18 Saboteur, 19 Magick Lore 13, 20 Warmage, 21 Martyr, 22 ML14, 23 Headsman, 24 ML15, 25 Treasure Hunter, 26 ML16, 27 Double EXP, 28 Double LP, 29 Stagnation, 30 Spellbound, 31 Piercing Magick, 32 Offering, 33 Veil, 34 Life Cloak, 35 Battle Lore 6, 36 Parsimony, 37 Tread Lightly, **38 unused**, 39 Emptiness, 40 Resist Piercing Damage, 41 Anti-Libra, 42-47 BL7-BL12, 48 Stoneskin, 49 Attack Boost, 50 Double Edged, 51 Spellspring, 52 Elemental Shift, 53 Celerity, 54 Swiftcast, 55 Physical Immunity, 56 Magick Immunity, 57 Status Immunity, 58 Damage Spikes, 59 Suicidal, 60-63 BL13-BL16, 64-68 BL1-BL5, 69-73 ML1-ML5, 74-85 HP 30/70/110/150/190/230/270/310/350/390/435/500, 86 Inquisitor, 87 ML6, 88-90 Shield Block 3/2/1, 91-93 Channeling 3/2/1, 94-96 Swiftness 3/2/1, 97-102 ML7-ML12, 103 Serenity, 104-113 Gambit Slot 1-10, 114 Essentials, **115 unused**, 116-118 Remedy Lore 3/2/1, 119-121 Potion Lore 3/2/1, 122-124 Ether Lore 3/2/1, 125-127 Phoenix Lore 3/2/1, 128 Second Board. Raw 255 or 65535 means none. This matches batch_01's BpAugmentList | L48-178; mappings L175-305 (xref) | used-in-code |
| Equipment category byte (0-26) | 0 unarmed, 1 sword, 2 greatsword, 3 katana, 4 ninjaSword, 5 spear, 6 pole, 7 bow, 8 crossbow, 9 gun, 10 axe, 11 hammer, 12 dagger, 13 rod, 14 staff, 15 mace, 16 measure, 17 handBomb, 18 shield, 19 helm, 20 armor, 21 accessory, 22 crown, 23 arrow, 24 bolt, 25 shot, 26 bomb. The i18n labels show crown as "Accessory" and 23-26 as "Ammunition" | L218-246; mappings L24-52 (xref) | used-in-code |
| Equipment icon byte to type label | 0 hand "Hand", 1 sword "Standard", 2 greatSword "Standard", 3 katana "Magick", 4 ninjaSword "Fast", 5 spear "Standard", 6 pole "Magick Resist", 7 bow "Fast", 8 crossbow "Standard", 9 gun "Piercing", 10 axe "Striking", 11 hammer "Striking", 12 dagger "Fast", 13 rod "Standard", 14 staff "Magick", 15 mace "Magick", 16 measure "Piercing", 17 handBomb "Striking", 18 shield, 19-21 light/mystic/heavy helm, 22-24 light/mystic/heavy armour, 25 ring, 26 bracelet, 27 glove, 28 collar, 29 pendant, 30 belt, 31 boot, 32 crown, 33-36 arrow/bolt/shot/bomb. Non-equipment icon groups also have labels: item, fang, jar, crystal, magick, nethicite, magicite, shard, loot, technick, card, treasure, map, flame, mote, bazaar ("Bazaar Good"), paper, gambit | L247-303; mappings L54-173 (xref) | used-in-code |
| Action category byte (section 14 `chargeAuraAnimation`, +0x21 per batch_09) | 0 attack, 1 whiteMagick, 2 blackMagick, 3 timeMagick, 4 greenMagick, 5 arcaneMagick, 6 mist, 7 technick, 8 item. i18n has no label for "attack", so category 0 prints the raw key | L330-339; mappings L307-317 (xref) | used-in-code |
| Section-13 field names | Weapon: range, chargeTime, attackPower, evadeWeapon, knockbackChance, comboOrCriticalChance, onHitRate. Shield: evadeShield, magickEvadeShield. Armour: defense, magickResist, augment. Pointer-record stats: maxHp, maxMp, strength, magickPower, vitality, speed. Both evade labels print as "Evade" | L198-217 | used-in-code |
| Section-14 field names | range, power, multipliedPower (= power x max(powerMultiplier, 1)), knockbackChance, powerMultiplier, areaOfEffectSize ("AOE Range"), chargeTime, mpOrMistCost ("MP Cost"), accuracyRate, onHitRate. The undead flag is read from `flags3.canTargetUndead` | L318-329; parser L126-136 (xref) | used-in-code |

### 8c. Id ranges in the database (useful as editor name tables)

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Equipment ids | 0x1000-0x11A3 (4096-4515), 420 contiguous entries with no gaps = section-13 indices 0-419. Matches `settings.equipment.itemLimit` = 420 | L342-2443 | used-in-code |
| Weapons | 0x1000 Unarmed; swords 0x1001-0x1011; greatswords 0x1012-0x1018; katana 0x1019-0x1022; ninja swords 0x1023-0x1029; spears 0x102A-0x1035; poles 0x1036-0x1041; bows 0x1042-0x104F; crossbows 0x1050-0x1056; guns 0x1057-0x1061; axes/hammers 0x1062-0x106D; daggers 0x106E-0x1078; rods 0x1079-0x1080; staves 0x1081-0x108A; maces 0x108B-0x1093; measures 0x1094-0x1099; hand-bombs 0x109A-0x109E | L343-1137 | used-in-code |
| Guest / special weapons (no licence) | 0x109F Bonebreaker, 0x10A0 Mythril Sword (licence "Smallswords"), 0x10A1-0x10A9 guest blades (Hero's Blade, Treaty-Blade, Sword of Kings, Joyeuse, Chirijiraden, Nightmare, Flimsy Blade, Mythril Blade, Nightmare), 0x10AD Wyrmhero Blade, 0x10B1 Great Trango, 0x10B2 Seitengrat, 0x10C8 Gendarme | L1138-1347 | used-in-code |
| Esper weapon slots | 0x10B3-0x10BF are "<Esper>'s Weapon" in esper order: Belias, Mateus, Adrammelech, Hashmal, Cuchulainn, Famfrit, Zalera, Shemhazai, Chaos, Zeromus, Exodus, Ultima, Zodiark (the same order as party ids 27-39 in batch_01). This is useful for summon/esper editing | L1238-1302 | used-in-code |
| TZA zodiac weapons | Kumbha 0x10AA, Mesa 0x10AB, Mina 0x10AC, Vrsabha 0x10AE, Bone of Byblos 0x10AF, Tula 0x10B0, Karkata 0x10C0, Excalipur 0x10C1, Simha 0x10C2, Makara 0x10C3, Vrscika 0x10C4, Mithuna 0x10C5, Kanya 0x10C6, Dhanusha 0x10C7, plus 0x11A3 Castellanos at the very end of the table | L1193-1342, L2438 | used-in-code |
| Shields | 0x10C9-0x10DB (Leather Shield .. Ensanguined Shield). Genji Shield is 0x10D5 | L1348-1442 | used-in-code |
| Helms | light 0x10DC-0x10F0, mystic 0x10F1-0x1105, heavy 0x1106-0x1117 (Genji Helm 0x1115) | L1443-1742 | used-in-code |
| Body armour | light 0x1118-0x112C, mystic 0x112D-0x1141, heavy 0x1142-0x1153 (Genji Armor 0x1151) | L1743-2042 | used-in-code |
| Accessories | 0x1154-0x1183 (Opal Ring .. Dawn Shard). Licences are "Accessories 1..22", plus Ribbon and Genji Armor. 0x117E Manufacted Nethicite, 0x1182 Goddess's Magicite and 0x1183 Dawn Shard have no licence. Notes give a one-line effect summary for each accessory (e.g. Thief's Cuffs lists steal rates of 80/30/6 percent) | L2043-2282 | used-in-code (notes are prose) |
| Ammunition | arrows 0x1184-0x118B, bolts 0x118C-0x1193, shot 0x1194-0x119B, bombs 0x119C-0x11A2 | L2283-2437 | used-in-code |
| Item ids (`database.items`) | 0x00-0x3F (64 entries) = consumable item ids. 0x00-0x1C are vanilla (Potion .. Meteorite D). **0x1D-0x29 are 13 "Reserve" slots**. 0x2A-0x3C are motes (Reverse .. Float Mote), 0x3D Eksir Berries, 0x3E Dark Matter, 0x3F Knot of Rust. The free slots match batch_01 "item slots 29-41" | L2445-2766 | used-in-code |
| Magick ids (`database.magicks`) | 0x3000-0x3050 (81 entries). 0x3000 Cure .. 0x3050 Graviga, in the section-14 order 0-80 (batch_01). Each entry has a licence (e.g. "White Magick 1") and a prefix verb. 0x3015 Aqua has no prefix field | L2768-3254 | used-in-code |
| Technick ids (`database.technicks`) | 0x4000-0x4017 (24 entries): First Aid .. Gil Toss. Each technick's licence has the same name as the technick | L3256-3401 | used-in-code |
| Action limit cross-check | settings `action.itemLimit` = 182 parses section-14 indices 0-181. Per batch_01 those are magicks 0-80, reserve 81, items 82-145, system actions 146-157 and technicks 158-181. So all 169 named contents above are covered, and Gil Toss (181) is the last | settings L19-21; batch_01 | unclear (cross-batch inference) |

---

## 9. `settings.lua` (DD layout and limits)

**Purpose.** This file sets the user-tunable limits and the item-menu MRP layout tweaks that DD applies.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| `layout.itemImage.useLarge` = false | When true, DD enlarges the item picture in MRP section 8, group 1. Entry 0 (text) gets u16 +4 = 154. Entry 2 (image) gets u16 +8/+10 = 128 x 192 (twice 64 x 96). Entry 3 (frame) gets u16 +8/+10 = 140 x 206. It is skipped when the `dpi_state` flag is active | L4-6; layout L36-59 (xref) | used-in-code |
| `layout.itemDescription.useLeftAlignment` = true | DD writes u16 at group-record +4 (x position) for MRP section 8: group 1 (or group 4 when DPI) for the equipment description, and group 6 for the inventory description. Values are 62 / 180, or 239 / 239 under DPI. The first-seen originals are cached so they can be restored when the option is off | L7-8; layout L61-82 (xref) | used-in-code |
| `useCustomLeftAlignment` = false, `customLeftAlignment` = 322 | When enabled, 322 is added to both x positions above. Disabled in this config | L9-10; layout L73-77 (xref) | used-in-code |
| `layout.itemNotes.wrapLength` = 90 | Word-wrap width in characters for i18n notes | L12-14; renderer L142, L347 (xref) | used-in-code |
| `equipment.itemLimit` = 420 | Number of section-13 records parsed (indices 0-419, bit ids 0x1000-0x11A3) | L16-18; engine L114 (xref) | used-in-code |
| `action.itemLimit` = 182 | Number of section-14 records parsed (indices 0-181) | L19-21; engine L115 (xref) | used-in-code |
| MRP walk used by layout | The section table is at VA 0x0209AC60 (RVA 0x01F7AC60): 23 u64 section pointers. Section +0x1C = u32 group count; section +0x20 = u32 group array address; group stride 0x14; group +0 = u8 entry count; group +0x10 = u32 first entry address; entries are size-prefixed (the first byte is the entry size). Credited to Xeavin in the comment | layout L4-34 (xref) | used-in-code |

---

## 10. `tags.lua` (DD text-tag vocabulary)

**Purpose.** This file holds the inline text-tag strings DD puts into descriptions: colours, glyph icons, scales and
spacers. TIDI and the Lua Loader text encoder later turn them into FFXII message bytes.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Characters | comma ",", colon ":", percent "%", newline "\n" (used as line separator) | L3-8; engine L57, utils L154-155 (xref) | used-in-code |
| Colour tags | Format `{rgb:R,G,B}`. label 90,90,90; value 255,255,255; fire 255,60,70; lightning 255,160,50; ice 80,180,220; earth 140,90,40; water 60,110,255; wind 100,255,0; holy 140,220,220; dark 120,90,180. Element colours apply to element values and to elementalAffinity entries | L9-20; renderer L114, L185, L341-342 (xref) | used-in-code |
| Scale presets | lg 88, md 82 (default), sm 76. Used as `{scale:N}` for a row or block `size` | L21-25; renderer L15-18 (xref) | used-in-code |
| Spacers | `{lowspace}` between a label's colon and its value. `{widespace}` between items (repeated `groupspace` times) | L26-29; utils L152-153 (xref) | used-in-code |
| Icon glyph ids (font icons for `{icon:N}`) | Elements fire..dark = 10..17 (in element bit order). hitsFlying = 20. Statuses KO..X-Zone = 21..52, i.e. **icon = 21 + status bit index**. harmsUndead reuses glyph 21 at a different scale. Ids 18-19 are unused here | L30-72 | used-in-code (glyph meaning: unclear) |
| Icon sizing pattern | Each icon string is a scale (55-63, or 82 for hitsFlying), then a vertical offset `{vpos:-16..3}`, the `{icon:N}`, then `{vpos:0}`. The formatter appends the current scale afterwards to restore the size | L31-72; utils L139-143 (xref) | used-in-code |
| Seen in output | The exported TIDI `us.lua` contains exactly these sequences (for example the Petrify glyph 23 at scale 55 / vpos -12 on Ancient Sword 0x1005) | TIDI us.lua L8 (xref) | used-in-code |

---

## 11-14. `ch.lua`, `cn.lua`, `de.lua`, `es.lua` (FCTR bestiary text configs)

**Purpose.** These are per-language override tables for Foedex (bestiary) page text. The four files are identical. Every
example entry is commented out, so each returns an empty table, and the game shows vanilla bestiary text. The format is
documented in the file comments; the patch that consumes them is in `FoedexClanPrimerTextReplacer.lua` (xref).

### Facts from the config files (the same for all four)

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Record format | A list of triples `{entry, page, text}`. entry is 0-511 and page is 0-254. text is a tag string; multi-line text uses "\n" or a long bracket | L1, L3-9, L18 | comment-only (consumed in FCTR, see below) |
| Page semantics | Page 0 is the "Classification & Genus" / "Derivation & Rarity" page and needs no `{wait}`. On pages 1+, the title is the text before a `{wait}` tag; with no `{wait}` the page has no title | L16-17 | comment-only |
| Page count | Pages beyond 9 can be added, up to 254 | L19 | comment-only |
| Shipped state | The table is empty (3 commented examples: Cactoid entry 0 page 2, Wolf entry 2 page 1, entry 0 page 0) | L3-9 | used-in-code |
| Entry ids | 0-511 agrees with batch_01: bestiary ids 0-383 are used and 384-511 are reserve | L1; batch_01 | comment-only |

### How FCTR consumes them (xref, `FoedexClanPrimerTextReplacer.lua`)

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| File selection | Path is `<config.path>/FoedexClanPrimerTextReplacerConfig/Bestiary/<lang>.lua`; there is a sibling `TravelersTips/` folder. The game language id is the u32 at `[u64 @ VA 0x01F82D20]` (RVA 0x01E62D20, the game-settings object). DD's engine reads the same pointer | FCTR L207-224; DD engine L7-12 | used-in-code |
| Language id table | 0 in, 1 us, 2 fr, 3 de, 4 it, 5 es, 6 kr, 7 ch, 8 cn. So de.lua = id 3, es.lua = id 5, ch.lua = id 7, cn.lua = id 8 | FCTR L207-208; DD mappings L351-361 | used-in-code |
| Text encoding per language | FCTR passes an encoding id to Lua Loader `message.convert(text, enc)`: in 1, us/fr/de/it/es 0, kr 2, ch 4, cn 3. So 0 = Western, 1 = Japanese ("in"), 2 = Korean, 3 = cn, 4 = ch. Which Chinese script each code is (simplified or traditional) is not stated | FCTR L210-211, L244 | used-in-code (script naming: unclear) |
| Runtime table layout | FCTR builds an executable-memory block: u32 count, then count records of 12 bytes. Each record: +0 u16 entry id, +2 u8 highest page configured for that entry, +3 u8 page number, +4 u64 pointer to the converted text. A symbol (`fctr_btext` / `fctr_ttext`) holds the block address. An empty config gives count 0, so the vanilla path is taken | FCTR L259-290 | used-in-code |
| Hook: page count | VA 0x0057650A (RVA 0x0045650A). Original bytes B8 01 00 00 00 (`mov eax,1`), replaced by a 5-byte jmp that returns to 0x0057650F. The cave raises the page count (ebx) to configured last page + 1. The value 0xFF is kept as-is. It tells bestiary from traveler's tips by comparing r10 with r13; r13w is the entry id | FCTR L4, L16, L52-95, L337-343 | byte-check-in-code |
| Hook: page 1+ text | VA 0x00573C77 (RVA 0x00453C77). Original 48 8B 4C C1 08, which loads the vanilla page pointer from entry +0x08 + page x 8; returns to 0x00573C7C. An override is matched on (entry, page). With no override, pages below 8 use the vanilla pointer and pages 8 and up get a null pointer. So vanilla entry records hold 8 page-text pointers starting at +0x08 | FCTR L6, L17, L98-143 | byte-check-in-code (struct reading: inferred) |
| Hook: page 0 text | VA 0x0057441C (RVA 0x0045441C). Original 48 8B 51 08 48 8B C8 (load page-0 pointer from entry +0x08, then `mov rcx,rax`); returns to 0x00574423. The page index is compared with the word at [rsp] | FCTR L8, L18, L146-178 | byte-check-in-code |
| Hook: page-number digits | VA 0x00573C16 (orig 45 33 C9 44 8B C2) and VA 0x0056FCF0 (orig 41 8D 51 03 45 8D 41 01). Both are redirected so the current and max page counters draw 3 digits (r8d = 3, r9d = 0b101; the max counter also sets edx = 5). Returns are 0x00573C1C and 0x0056FCF8. This allows page numbers up to 254 | FCTR L10-11, L19-20, L181-191 | byte-check-in-code |
| Hook: party-book MRP group 14 | VA 0x0056FCD4. The original (48 8B 52 08 41 B8 0E 00 00 00) loads the menu MRP group pointer and passes group index 14. It is replaced with lea rdx = a modified `party_book_14.mrp` loaded from the mod folder, and group index 0. Before use, FCTR patches the blob's u16 +0x34/+0x36 (X/Y) to 1288/928 for Western languages or 1250/918 for others. It then calls game function VA 0x002A00F0 through `memory.executea` with arguments (0, 8, blob). This is probably an MRP fix-up or registration routine; its purpose is not stated | FCTR L13, L21, L45-48, L362-377 | byte-check-in-code (0x2A00F0 meaning: unclear) |
| Load-order quirk | The startup test only aborts when the bestiary config fails **and** the traveler's tips config loads. When both fail, the patch still applies, with empty tables | FCTR L345-348 | used-in-code |

---

## Editor relevance

* **Name tables for free.** `i18n.lua` gives a complete and clean set of English name tables that an offline editor can
  use for dropdowns: equipment 0x1000-0x11A3 (420), consumable items 0x00-0x3F (64, including 13 free "Reserve" slots
  0x1D-0x29), magicks 0x3000-0x3050 (81) and technicks 0x4000-0x4017 (24). It also has augment names 0-128 (38 and
  115 unused), the 32 status bits, the 8 element bits, equipment category 0-26, equipment icon 0-191 to type label,
  and action category 0-8.
* **Glyph ids.** The `{icon:N}` ids from `tags.lua` let a text editor show or insert element icons (10-17), status icons
  (21 + bit) and the flying glyph (20). The colour, scale and vpos tag grammar matches what TIDI and the Lua Loader
  encoder accept.
* **Editor hook into DD.** A memory editor can drive DD live. Write `customAttributes.json` (keyed by bit id string,
  with customAttributes and attributeOverrides) and set the global symbol byte `dd_refresh` to 1. Editing
  `i18n/tags/settings` hot-reloads as well.
* **Item-menu MRP layout.** Item-menu MRP layout positions are in section 8, groups 1/4/6, at group +4 and entry
  +4/+8/+10. These are concrete UI layout fields a HUD/menu editor can expose.
* **Foedex text.** Bestiary entries are 0-511 with up to 255 pages. A runtime override uses 12-byte (entry, lastPage,
  page, textPtr) records. Vanilla entry records hold 8 page pointers from +0x08. The game language id is at
  [0x01F82D20]+0, and each language uses its own message encoding id. FCTR checks the original bytes at five code sites
  and one data-load site before patching. An editor that patches the same sites must check those bytes too.
