# Drive batch 06: CCEP `equipmentData.lua` (equipment progression config)

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR.

Files in this batch (read in full):

| Drive id | Title | Drive path | Size | Author header |
|---|---|---|---|---|
| 108psJf6fuIqzUootsnoeyyrhC-6sJ9SW | equipmentData.lua | My Laptop/scripts/config/ClanCenturioEquipmentProgression | 186,884 lines, 3,309,106 bytes, ASCII | FehDead (L1) |

No file was missing. The file is not by Xeavin. It holds only data: one `return` of a big Lua table, with no code, no
addresses and no byte patches. Because it is too large to read line by line, I loaded it with Lua 5.4 (`dofile`) and
walked every entry with scripts. I then checked the results against the raw text at the lines cited below. Every row
below is my own summary of the data; nothing is copied.

To read the fields, I used notes from outside this file. Rows that rely on them are marked "(xref)":
* `batch_05.md`: the CCEP modules `equipment.lua` and `description.lua`, which consume this config.
* `docs/formats/battlepack-s13-equipment-attributes.md`: the sec13 record layout.
* `editor/data/lists.json`: `BpEquipmentList`, `BpAugmentList`, `BpElementList`, `BpStatusEffectList`, and the
  `Cont*List` ranges.

Evidence key: **byte-check-in-code** = the code checks the original bytes before patching. **used-in-code** = the
CCEP code (xref batch_05) reads or writes this key or field. **comment-only** = only a comment says so. **unclear** =
my inference from the data. No row here is byte-check-in-code: the file has no code.

---

## 1. `equipmentData.lua` (ClanCenturioEquipmentProgression config)

**Purpose.** This is the per-item configuration for FehDead's Clan Centurio Equipment Progression (CCEP) mod. It has
one entry for each of the 557 battlepack section-13 equipment records. Each entry lists the item's base stats as
`value`, plus a 13-step `scale` table (indices 0..12) with the value the stat should take at each sigil/rank level.
CCEP's `controller.lua` reads the sigil level. `equipment.lua` then writes `scale[level]` into the sec13 record and
the item's attribute block. `description.lua` shows the difference from `value` (xref batch_05).

In this copy, every numeric `scale` equals the base `value`, so the file does not change any stat. In practice it is a
readable dump of the vanilla TZA sec13 equipment and attribute data, ready to be edited into a real progression.

### 1.1 File schema

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Top level | The chunk returns one table indexed by the integers 0..556 (557 entries, no gaps). Index = sec13 equipment record index | L2-L3, last entry L186626 | used-in-code (xref: equipment.lua iterates config) |
| Entry keys | Every entry has exactly these keys: `id`, `bit`, `attr`, `element`, `onhit`, `onequip`, `immunity`, `affinity` | L4-L6, L242, L260, L278, L296, L314 | used-in-code (xref) |
| `id` | Always equals the table index (checked for all 557) | L4 | unclear (data check) |
| `bit` | Always 0x1000 + id (4096..4652, i.e. 0x1000..0x122C). This is the item id used by the inventory and by DynamicDescription's override key | L5 (4096), L76964 (4296 for id 200) | used-in-code (xref description.lua) |
| `attr.<stat>` | Each stat is a table with `value` (base number) and `scale` (indices 0..12, 13 numbers). Each stat block spans 18 text lines | L7-L24 (rge of entry 0) | used-in-code (xref) |
| `attr` key order | Key order inside `attr` changes from entry to entry (it is a hash-order dump). Parse the file as Lua or with a real table parser, never by line position | L7/L25/L43 (entry 0) vs L76966.. (entry 200) vs L83001.. (entry 220) | unclear |
| `element` | `value` is either an empty table or a single `{name, icon}` (one element per weapon or ammo; never a list). `scale[0..12]` has the same shape | L3012-L3016 (entry 8: fire, icon 10) | used-in-code (xref) |
| `onhit`, `onequip`, `immunity` | `value` is a 0-based list (index 0, 1, ...) of `{name, icon}` statuses; empty means none. `scale[i]` is a list of the same shape | L2308 (entry 6: sap), L129974 (entry 385) | used-in-code (xref) |
| `affinity` | `value` is a 0-based list of `{element, type, icon}`. `type` is one of absorb, immune, half, weak, potency | L64194-L64197 (entry 179) | used-in-code (xref) |
| Scale length | All 6,212 stat `scale` tables and all 2,785 list `scale` tables (8,997 value/scale pairs in total) have exactly 13 slots (0..12). CCEP only acts on levels 1..12; level 0 means "no rank" | per entry | used-in-code (xref controller.lua) |
| Numeric scales | For all 17 stats, `scale[0..12]` equals `value` in every entry (0 exceptions). There is no real progression in this copy | whole file | unclear (data check) |
| List `scale[12]` quirk | In every entry and all five list fields, `scale[0..11]` equals `value`, but `scale[12]` is always `{}`. With CCEP's clear-then-OR write (xref equipment.lua), level 12 would remove every weapon element and on-hit status, every auto-status, immunity and affinity. It looks like an off-by-one in the exporter; editors should not copy it | L3066 (entry 8: element `[12] = {}`) | unclear (data check; effect inferred from xref) |
| Header | The only comment is the author line. Nothing else in the file is code | L1 | comment-only |

### 1.2 Config key to sec13 field map (xref s13 format doc + batch_05)

Which `attr` keys an entry has depends on the record **variant**, which is selected by the sec13 `category` byte
(+0x09). The four key sets in the file match the four variants exactly.

| Config key | Variant(s) | sec13 / attribute field | Offset | Value range in file | Evidence |
|---|---|---|---|---|---|
| `rge` | weapon | range | equip +0x18 u8 | 10..250 | used-in-code (xref) |
| `def` | armor | defense | equip +0x18 u8 | 0..67 | used-in-code (xref) |
| `evas` | shield | shield evade | equip +0x18 u8 | 5..90 | used-in-code (xref) |
| `mres` | armor, shield | magick resist / shield magick evade | equip +0x19 u8 | 0..90 | used-in-code (xref) |
| `atk` | weapon, ammo | attack power | equip +0x1A u8 | 0..224 | used-in-code (xref) |
| `aug` | armor | augment id (sec58 row; 255 = none). CCEP writes it through the same byte as attackPower | equip +0x1A u8 | 2..114, 255 | used-in-code (xref) |
| `kb` | weapon | knockback chance % | equip +0x1B u8 | 0..15 | used-in-code (xref) |
| `cmb` | weapon | combo or critical chance % | equip +0x1C u8 | 0..100 | used-in-code (xref) |
| `evaw` | weapon, ammo | weapon/ammo evade | equip +0x1D u8 | 0..75 | used-in-code (xref) |
| `element` | weapon, ammo | attack element mask | equip +0x1E u8 | one element max per entry | used-in-code (xref) |
| `hit` | weapon, ammo | on-hit status chance % (onHitRate) | equip +0x1F u8 | 0..100 | used-in-code (xref) |
| `onhit` | weapon, ammo | on-hit status mask | equip +0x20 u32 | up to 2 statuses | used-in-code (xref) |
| `crg` | weapon | normal-attack charge time | equip +0x27 u8 | 1..99 | used-in-code (xref) |
| `hp`, `mp` | all | HP / MP bonus | attr +0x00 / +0x02 u16 | hp 0..800, mp 0..151 | used-in-code (xref) |
| `str`, `mgk`, `vit`, `spd` | all | stat bonuses | attr +0x04 / +0x05 / +0x06 / +0x07 u8 | str 0..12, mgk 0..15, vit 0..20, spd 0..50 | used-in-code (xref) |
| `onequip` | all | auto-status mask | attr +0x08 u32 | up to 3 statuses | used-in-code (xref) |
| `immunity` | all | status immunity mask | attr +0x0C u32 | up to 14 statuses (Ribbon) | used-in-code (xref) |
| `affinity` type absorb / immune / half / weak / potency | all | element masks | attr +0x10 / +0x11 / +0x12 / +0x13 / +0x14 u8 | up to 8 entries | used-in-code (xref) |

The attribute block is reached through equip +0x28 (attributeLink, a byte offset into the 24-byte attribute table).
Vanilla items share these blocks. Across all 557 entries the file has only **176 distinct** attribute tuples
(hp, mp, str, mgk, vit, spd, onequip, immunity, affinity), and 351 entries have an all-zero tuple. So per-item edits of
the `hp`..`affinity` keys will alias across items unless the editor clones the block first. This is the same warning
batch_05 gives for equipment.lua.

### 1.3 Id ranges and variants (from the key sets, names cross-checked with `BpEquipmentList`)

| Index range (item id) | Count | Key set (variant) | Content | Source line | Evidence |
|---|---|---|---|---|---|
| 0 (0x1000) | 1 | weapon | Unarmed (atk 12, crg 20) | L3 | unclear (names xref lists.json) |
| 1-199 (0x1001-0x10C7) | 199 | weapon | Player weapons in shop order: swords 1-17, greatswords 18-24, katanas 25-34, ninja swords 35-41, spears 42-53, poles 54-65, bows 66-79 (rge 100), crossbows 80-86, guns 87-97, axes 98-104, hammers 105-109, daggers 110-120, rods 121-128 (mgk bonus), staves 129-138 (mgk + element potency), maces 139-147, measures 148-153 (hit 70, element plus a buff on hit), hand-bombs 154-158, unique weapons 159-178 and 192-199 | L333 .. L76632 | unclear (each group has constant crg/cmb/kb; names xref) |
| 179-191 (0x10B3-0x10BF) | 13 | weapon | Esper weapons (Belias .. Zodiark): rge 20/30, big affinity lists (one element absorbed, the opposite one weak, the rest immune or half) | L63883 .. L73719 | unclear (names xref) |
| 200-219 (0x10C8-0x10DB) | 20 | shield (evas, mres) | Shields: 200 Gendarme (evas 90, mres 90, absorbs all 8 elements), 218 Zodiac Escutcheon, 219 Ensanguined Shield (evas 90; auto Poison+Sap+Slow) | L76962 .. L82588 | unclear (names xref) |
| 220-240 / 241-261 / 262-279 | 21 / 21 / 18 | armor (def 0, mres > 0) | Helms: light (HP bonus), mystic (MP + mgk), heavy (str) | L82997, L88688, L94340 | unclear (names xref) |
| 280-300 / 301-321 / 322-339 | 21 / 21 / 18 | armor (def > 0, mres ~0) | Body armor: light / mystic / heavy, same bonus pattern as the helms | L99127, L104987, L110561 | unclear (names xref) |
| 340-387 (0x1154-0x1183) | 48 | armor | Accessories: small def/mres, augments, immunities. 385 Ribbon = 14 immunities + Regen + Libra. 386/387 Goddess's Magicite / Dawn Shard (aug 39) | L115478 .. L130752 | unclear (names xref) |
| 388-419 (0x1184-0x11A3) | 32 | ammo (atk, evaw, hit) | Arrows 388-395, bolts 396-403, shot 404-411, bombs 412-419. Status ammo uses hit 25 | L131268 .. L140954 | unclear (names xref) |
| 420-543 (0x11A4-0x121F) | 124 | mostly weapon; shields at 448-449, 469, 471, ..., 504; ammo-type at 459, 479, 491 | Non-player (guest/NPC/enemy) equipment. Almost every weapon has atk 30 as a placeholder; statused enemy "weapons" 507-543 use hit 4. 504 = Wyrmhero Blade off-hand (shield variant) | L140954 .. L183530 | unclear (names xref) |
| 544-556 (0x1220-0x122C) | 13 | armor (def and mres both > 0, aug 255) | Esper armors, Belias .. Zodiark (def 30..67, mres 32..65) | L183530 .. L186626 | unclear (names xref) |

`lists.json` gives the same split for player-obtainable gear (xref): ContWeaponList 0x1000-0x10C7, ContArmorList
0x10C8-0x1153, ContAccessoryList 0x1154-0x1183, ContAmmunitionList 0x1184-0x11A3. Entries 420-556 are not obtainable.

### 1.4 Icon enumeration used by the config (DynamicDescription-side icons)

The `icon` numbers are not `BpeIconList` ids (in BpeIconList, 10 = Axe). They form their own consecutive index
space, and the order matches the game's element and status bit order exactly:

| Icon | Meaning | Derived bit | Evidence |
|---|---|---|---|
| 10..17 | fire, lightning, ice, earth, water, wind, holy, dark | element bit = icon - 10 (Fire 0x01 .. Dark 0x80) | unclear (every element icon in `element` and `affinity` follows this) |
| 21 | ko | status bit 0 | unclear (pattern) |
| 23..32 | petrify, stop, sleep, confuse, doom, blind, poison, silence, sap, oil | status bits 2..11 | unclear (pattern) |
| 34..37 | disable, immobilize, slow, disease | status bits 13..16 | unclear (pattern) |
| 39..49 | protect, shell, haste, bravery, faith, reflect, invisible, regen, float, berserk, bubble | status bits 18..28 | unclear (pattern) |
| 51 | libra | status bit 30 | unclear (pattern) |
| 22, 33, 38, 50 (not used) | stone, reverse, lure, HP critical by the same rule | bits 1, 12, 17, 29 | unclear |

Rule: status bit = icon - 21, element bit = icon - 10. This agrees with the status and element orders in batch_05 and
`BpStatusEffectList` / `BpElementList`.

### 1.5 Data facts useful as editor validation rules

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| hit vs onhit | `hit > 0` exactly when `onhit` is non-empty: 81/81 weapons and 17/17 ammo, with 0 exceptions either way. This confirms `hit` = equip +0x1F on-hit chance, which only matters when the +0x20 mask is non-zero | L2106 + L2308 (entry 6: hit 100, sap) | unclear (data check; field xref) |
| On-hit 100 % | Entries 6, 123, 159, 192 use hit 100 (sap; regen; sap+disease; confuse). The measures 148-153 use 70 with buffs (protect, shell, bravery, invisible, haste, bubble) | entry lines above | unclear |
| aug sentinel | 152 of 181 armor-variant entries have aug 255 (= none). Augment ids in use: 2, 4-18, 25, 27-29, 31, 32, 36, 37, 39, 103, 114 (for example 6 Counter on 277 Genji Helm, 7 Counter Boost on 337 Genji Armor, 39 Emptiness on 386/387, 114 Essentials on 347, 103 Serenity on 353) | L83073 (entry 220 aug) | unclear (names xref BpAugmentList) |
| Weapon element count | 45 entries have an element, always just one (no multi-element weapons or ammo in vanilla data) | L3012 | unclear |
| Weapon affinity | 24 weapon-variant entries carry attribute-block affinities: staff/rod element potency, and the 13 esper weapons | L64194 | unclear |
| List-field counts | non-empty `onhit` 98, `onequip` 16, `immunity` 14, `affinity` 51 entries | whole file | unclear (data check) |
| Max stats seen | rge 250 (non-player entries 500, 505, 506), atk 224 (178 Seitengrat; rge 200, evaw 75), crg 99 (173 Wyrmhero Blade, cmb 80, auto Bravery+Faith), spd 50 (376) | entry lines | unclear |

### 1.6 Editor relevance

* This file is a complete, human-readable reference dump of all 557 sec13 equipment records plus their attribute data.
  It works as a test oracle for an offline sec13 parser: decode `battle_pack.bin` section 13 and compare atk, def,
  mres, evade, range, crg, cmb, kb, hit, element, the on-hit mask and the attribute masks per item id 0x1000+i.
* The key set tells you the variant (weapon / shield / armor / ammo), and so which bytes 0x18..0x27 mean what.
* A CCEP-config editor must write 13 values per stat (0..12). It must not reproduce the empty `scale[12]` for list
  fields unless the user really wants level 12 to strip elements and statuses.
* Live editing goes through the Lua Loader `bpack.section13` accessors and the attribute pointer, then a stat refresh
  for each party slot (0x00320A40 to get the keep pointer, then 0x0030FED0 with flags 0x97). See batch_05; this file
  adds no new addresses.
