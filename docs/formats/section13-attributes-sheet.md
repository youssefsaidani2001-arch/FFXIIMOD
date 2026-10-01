# Battlepack section 13 - equipment and attributes (sheet-documented view)

Spec id: `section13-attributes-sheet` · machine spec: [`section13-attributes-sheet.json`](./section13-attributes-sheet.json)

> **FILE FORMAT** (battlepack section 13). Binary layout identical to [`battlepack-s13-equipment-attributes`](./battlepack-s13-equipment-attributes.md); this spec adds the vanilla data catalogue (gear names, attribute sets, sheet column meanings) from three community sheets.

## What this is

Section 13 of `battle_pack.bin` holds one 52-byte record per piece of equipment (557 vanilla rows: weapons, shields, helms, armour, accessories, ammunition, foe-only gear) and, after them, a table of 24-byte **attribute** records (stat bonuses, auto-statuses, immunities, elemental affinities) that items link to by byte offset. Several items can share one attribute record. The "Vanilla Section 13" sheet lists every vanilla record field by field; "Vanilla Attribute Offsets" lists the 176 attribute records with the gear that uses each; the "Description Calculator" turns the same data into equipment help text. Weapons carry a formula id like actions (msg 493; see [`enums-formulas`](./enums-formulas.md)).

## Sources

Every sheet was read in full through an `.xlsx` export of the Drive file (the plain-text read only returns a ~50-row sample, so it was used only to confirm the tab names). Citations are `KEY Tab!rN` (sheet row N, 1-based as shown in Google Sheets) or `KEY Tab!COL` for a whole column; `msg N` is the index of a message in the #wip-general Discord export; `Drive x.lua:L` is a line of a Lua file from the shared Drive folder; `TK Lnnn` is a line of `docs/research/insurgents_toolkit_reference.md`; `Lists: X` is `editor/data/lists.json`.

| Key | Source | What was used |
|---|---|---|
| `S13` | Google Sheet "Vanilla Section 13" (Drive id `1NZ0ezAqZ4bYecIsHbF04aYdsuZykOePa90aYnR6KuiI`) | tab Vanilla Section 13 (A1:AU558) |
| `AO` | Google Sheet "Vanilla Attribute Offsets" (Drive id `1S0TqQV5cTynoT3VVecvytEuMm5EAMxTp2Cx_-_GL0OU`) | tab Vanilla Attribute Offsets (A1:I177) |
| `DC` | Google Sheet "Description Calculator" (Drive id `1ku-FQVUluQDJ5zyzJixcDVccjv1EsnSbQ1h2bNyv6Cw`) | tabs Descriptions (A1:BK558), Data (augment names/descriptions, weapon formula labels) |
| `battlepack-s13-equipment-attributes` | docs/formats (from The Insurgent's Workshop + Toolkit) | binary layout, copied into this JSON |

## Container (see [`container-battlepack`](./container-battlepack.md), [`container-st2e`](./container-st2e.md))

```
battle_pack.bin  (ps2data/image/ff12/test_battle/<lang>/binaryfile/battle_pack.bin; u32 count = 71, count+1 u32 offsets, sections 16-aligned)
 section 13:
  0x00  st2e header (32 bytes): 'st2e', u32 entryCount (557), u16 entrySize (52), u32 entryListOffset (32), ..., u32 offset18 = attribute table offset
  0x20  equipment[entryCount]      52 bytes each
  offset18  attribute[k]           24 bytes each, to the end of the section
  zero padding to 16
```

**Pointers to fix up when sizes change:** adding/removing equipment moves the attribute table: update `entryCount`, `offset18` (= 32 + 52*count) and every later battlepack section offset. `attributeLink` values are relative to the attribute table and do not change unless attribute records are re-ordered. Adding attribute records grows the section (battlepack offsets move).

## Sheet columns -> equipment fields (S13 row 1)

| Sheet column | Field (offset) | Notes |
|---|---|---|
| B "Gear" (shows <id+4096>:<name>, not the stored text id) | `name` |  |
| D "Icon" (<id>:<name>) | `icon` |  |
| E "Optimization" | `optimizationTiebreaker` |  |
| F "Flags Array" (whole byte, decimal) | `flags` |  |
| G "Sort" | `sort` |  |
| L "Category" (name only) | `category` |  |
| H "Metal" | `metal` |  |
| J "Offhand Category" (<id>:<name>) | `offhandCategory` |  |
| I "Gil" | `gil` |  |
| M "Range" | `range` |  |
| N "Formula" | `formula` |  |
| O "Attack" | `attackPower` |  |
| P "Knockback" | `knockbackChance` |  |
| Q "Combo/Crit" | `comboOrCriticalChance` |  |
| R "Evade" | `evade` |  |
| R "Evade" (shields) | `shieldEvade` |  |
| S "MEvade" | `shieldMagickEvade` |  |
| T "Element" | `elements` |  |
| U "On-hit %" | `onHitRate` |  |
| V-Y "Inflict Status1-4" (one byte each) | `statusEffects` |  |
| Z "Unused" (non-zero for many weapons: 3 sword/bow, 5 spear/staff/measure, 7 greatsword, 8 crossbow, 10 pole/hammer) | `unknown24` |  |
| AA "Distance Behavior" (name only) | `distanceBehavior` |  |
| AB "Stance" (name only) | `stance` |  |
| AC "CT" | `chargeTime` |  |
| AD "Model ID" (decimal) | `model` |  |
| AE "Defense" | `defense` |  |
| AF "Resist" | `magickResist` |  |
| AG "Augment" (255 = none) | `augment` |  |
| AH "Attrib ID" = attributeLink / 24 | `attributeLink` |  |

"Slot Type" (K) is decoded from flags bits 5-7 (0 weapon, 1 off-hand, 2 helm, 3 armour, 4 accessory): Flags Array 0/4/16/18/20/22 = weapons, 32/48/52 = off-hand, 64 = helm, 96 = armour, 128/146 = accessory (S13 F, K). Sort ID (A) is the row index; C "Shop ID" is the content id 0x1000 + index (filled for rows 0-419 only; the foe-only gear 420-556 has none).

## Attribute sets (AO r2-r177)

Attribute index k is stored in equipment +0x28 as k*24. Index 0 is the shared "no bonus" record used by most items ("Lots").

| Index | Stored attributeLink | Used by | HP | MP | STR | MAG | VIT | SPD | Statuses / elements | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 0 | Lots |  |  |  |  |  |  |  | AO r2 |
| 1 | 24 | Six-fluted Pole, Fumarole |  |  |  |  |  |  | Potency: Water | AO r3 |
| 2 | 48 | Burning Bow |  |  |  |  |  |  | Potency: Fire | AO r4 |
| 3 | 72 | Gladius, Thief's Cuffs |  |  |  |  |  | 1 |  | AO r5 |
| 4 | 96 | Rod, Serpent Rod, Healing Rod, Gaia Rod, Empyrean Rod |  |  |  | 2 |  |  |  | AO r6 |
| 5 | 120 | Power Rod, Genji Gloves, Cameo Belt |  |  |  | 3 |  |  |  | AO r7 |
| 6 | 144 | Holy Rod |  |  |  | 4 |  |  | Potency: Holy | AO r8 |
| 7 | 168 | Rod of Faith, Golden Staff |  |  |  | 6 |  |  |  | AO r9 |
| 8 | 192 | Cherry Staff |  |  |  | 3 |  |  | Potency: Wind | AO r10 |
| 9 | 216 | Wizard's Staff |  |  |  | 4 |  |  |  | AO r11 |
| 10 | 240 | Flame Staff |  |  |  | 4 |  |  | Potency: Fire | AO r12 |
| 11 | 264 | Storm Staff |  |  |  | 4 |  |  | Potency: Lightning | AO r13 |
| 12 | 288 | Glacial Staff |  |  |  | 5 |  |  | Potency: Ice | AO r14 |
| 13 | 312 | Judicer's Staff |  |  |  | 7 |  |  |  | AO r15 |
| 14 | 336 | Cloud Staff |  |  |  | 7 |  | 3 | Potency: Lightning, Water, Wind | AO r16 |
| 15 | 360 | Staff of the Magi |  |  |  | 8 | 5 |  | Potency: Ice, Wind, Holy | AO r17 |
| 16 | 384 | Zeus Mace |  |  |  |  |  |  | Potency: Dark | AO r18 |
| 17 | 408 | Wyrmhero Blade |  |  |  |  |  |  | Bravery, Faith | AO r19 |
| 18 | 432 | Belias's Weapon |  |  |  |  |  |  | Absorb: Fire, Half Damage: Lightning, Ice, Earth, Wind, Holy Dark, Weak: Water | AO r20 |
| 19 | 456 | Mateus's Weapon |  |  |  |  |  |  | Absorb: Ice, Half Damage: Fire, Earth, Water, Wind, Holy, Dark, Weak: Lightning | AO r21 |
| 20 | 480 | Adrammelech's Weapon |  |  |  |  |  |  | Absorb: Lightning, Immune: Fire, Earth, Water, Wind, Holy, Dark, Weak: Ice | AO r22 |
| 21 | 504 | Hashmal's Weapon |  |  |  |  |  |  | Absorb: Earth, Immune: Fire, Lightning, Ice, Water, Holy, Dark, Weak: Wind | AO r23 |
| 22 | 528 | Cúchulainn's Weapon, Zeromus's Weapon, Exodus's Weapon |  |  |  |  |  |  | Half Damage: Fire, Lightning, Ice, Earth, Water, Wind, Holy, Dark | AO r24 |
| 23 | 552 | Famfrit's Weapon |  |  |  |  |  |  | Absorb: Water, Immune: Lightning, Ice, Earth, Wind, Holy, Dark, Weak: Fire | AO r25 |
| 24 | 576 | Zalera's Weapon |  |  |  |  |  |  | Immune: Fire, Lightning, Ice, Earth, Water, Wind, Dark | AO r26 |
| 25 | 600 | Shemhazai's Weapon |  |  |  |  |  |  | Weak: Fire | AO r27 |
| 26 | 624 | Chaos's Weapon |  |  |  |  |  |  | Absorb: Wind, Immune: Fire, Lightning, Ice, Water, Holy, Dark, Weak: Earth | AO r28 |
| 27 | 648 | Ultima's Weapon |  |  |  |  |  |  | Absorb: Holy, Immune: Fire, Lightning, Ice, Earth, Water, Wind, Weak: Dark | AO r29 |
| 28 | 672 | Zodiark's Weapon |  |  |  |  |  |  | Absorb: Dark, Weak: Holy | AO r30 |
| 29 | 696 | Gendarme |  |  |  |  |  |  | Absorb: Fire, Lightning, Ice, Earth, Water, Wind, Holy, Dark | AO r31 |
| 30 | 720 | Shell Shield |  |  |  |  |  |  | Shell | AO r32 |
| 31 | 744 | Ice Shield |  |  |  |  |  |  | Half Damage: Ice | AO r33 |
| 32 | 768 | Flame Shield |  |  |  |  |  |  | Half Damage: Fire | AO r34 |
| 33 | 792 | Dragon Shield |  |  |  |  |  |  | Immune: Earth | AO r35 |
| 34 | 816 | Demon Shield |  |  |  |  |  |  | Absorb: Dark | AO r36 |
| 35 | 840 | Venetian Shield |  |  |  |  |  |  | Weak: Lightning | AO r37 |
| 36 | 864 | Zodiac Escutcheon, Diamond Armlet |  |  |  |  |  |  | Immune: Lightning | AO r38 |
| 37 | 888 | Ensanguined Shield |  |  |  |  |  |  | Equip: Poison, Sap, Slow | AO r39 |
| 38 | 912 | Leather Cap, Leather Clothing | 10 |  |  |  |  |  |  | AO r40 |
| 39 | 936 | Headgear, Chromed Leathers | 20 |  |  |  |  |  |  | AO r41 |
| 40 | 960 | Headguard, Leather Breastplate | 30 |  |  |  |  |  |  | AO r42 |
| 41 | 984 | Leather Headgear, Bronze Chestplate | 40 |  |  |  |  |  |  | AO r43 |
| 42 | 1008 | Horned Hat, Blazer Gloves | 50 |  |  |  |  |  |  | AO r44 |
| 43 | 1032 | Balaclava | 90 |  | 1 |  |  |  |  | AO r45 |
| 44 | 1056 | Soldier's Cap | 110 |  |  |  |  |  |  | AO r46 |
| 45 | 1080 | Green Beret | 130 |  |  |  |  | 3 |  | AO r47 |
| 46 | 1104 | Red Cap | 150 |  |  |  | 3 |  |  | AO r48 |
| 47 | 1128 | Headband | 170 |  | 2 |  |  |  |  | AO r49 |
| 48 | 1152 | Pirate Hat | 230 |  |  |  |  |  |  | AO r50 |
| 49 | 1176 | Goggle Mask | 270 |  |  |  |  |  | Immune: Blind | AO r51 |
| 50 | 1200 | Adamant Hat | 310 |  |  |  |  |  | Half Damage: Fire, Weak: Ice | AO r52 |
| 51 | 1224 | Officer's Hat | 350 |  |  |  |  | 3 |  | AO r53 |
| 52 | 1248 | Chakra Band | 390 |  | 2 |  |  |  |  | AO r54 |
| 53 | 1272 | Thief's Cap | 460 |  |  |  |  | 4 |  | AO r55 |
| 54 | 1296 | Gigas Hat | 530 |  |  | 2 |  |  |  | AO r56 |
| 55 | 1320 | Chaperon | 600 |  |  |  |  |  |  | AO r57 |
| 56 | 1344 | Crown of Laurels | 680 |  |  |  |  |  |  | AO r58 |
| 57 | 1368 | Renewing Morion | 370 |  |  |  | 4 |  | Regen | AO r59 |
| 58 | 1392 | Dueling Mask | 800 |  | 2 |  |  |  |  | AO r60 |
| 59 | 1416 | Cotton Cap |  | 5 |  | 2 |  |  |  | AO r61 |
| 60 | 1440 | Magick Curch |  | 11 |  | 2 |  |  |  | AO r62 |
| 61 | 1464 | Pointy Hat |  | 16 |  | 2 |  |  |  | AO r63 |
| 62 | 1488 | Topkapi Hat, Shepherd's Bolero |  | 20 |  | 3 |  |  |  | AO r64 |
| 63 | 1512 | Calot Hat |  | 25 |  | 3 |  |  |  | AO r65 |
| 64 | 1536 | Wizard's Hat |  | 47 |  | 4 |  |  |  | AO r66 |
| 65 | 1560 | Lambent Hat |  | 36 |  | 4 |  | 3 |  | AO r67 |
| 66 | 1584 | Feathered Cap |  | 40 |  | 5 |  |  |  | AO r68 |
| 67 | 1608 | Mage's Hat |  | 50 |  | 5 |  |  |  | AO r69 |
| 68 | 1632 | Lamia's Tiara |  | 48 |  | 4 | 7 |  | Half Damage: Ice | AO r70 |
| 69 | 1656 | Sorcerer's Hat |  | 70 |  | 6 |  |  |  | AO r71 |
| 70 | 1680 | Black Cowl |  | 60 |  | 5 |  | 4 |  | AO r72 |
| 71 | 1704 | Astrakhan Hat |  | 65 |  | 6 |  |  |  | AO r73 |
| 72 | 1728 | Gaia Hat | 90 | 70 |  | 7 |  |  |  | AO r74 |
| 73 | 1752 | Hypnocrown |  | 75 | 2 | 7 |  |  |  | AO r75 |
| 74 | 1776 | Gold Hairpin |  | 80 |  | 7 | 8 |  |  | AO r76 |
| 75 | 1800 | Celebrant's Miter |  | 90 |  | 6 |  | 5 |  | AO r77 |
| 76 | 1824 | Black Mask |  | 81 |  | 8 |  |  | Absorb: Dark | AO r78 |
| 77 | 1848 | White Mask |  | 81 |  | 8 |  |  | Absorb: Holy | AO r79 |
| 78 | 1872 | Golden Skullcap |  | 107 |  | 10 |  | 3 |  | AO r80 |
| 79 | 1896 | Circlet |  | 151 | 2 | 10 |  |  |  | AO r81 |
| 80 | 1920 | Leather Helm, Bronze Helm, Leather Armor, Bronze Armor, Battle Harness |  |  | 2 |  |  |  |  | AO r82 |
| 81 | 1944 | Sallet, Iron Helm, Iron Armor, Chainmail |  |  | 3 |  |  |  |  | AO r83 |
| 82 | 1968 | Barbut, Burgonet, Linen Cuirass, Golden Armor |  |  | 4 |  |  |  |  | AO r84 |
| 83 | 1992 | Winged Helm |  |  | 5 |  |  | 3 |  | AO r85 |
| 84 | 2016 | Golden Helm, Close Helmet |  |  | 5 |  |  |  |  | AO r86 |
| 85 | 2040 | Bone Helm, Bone Mail |  |  | 6 |  |  |  | Half Damage: Dark, Weak: Holy | AO r87 |
| 86 | 2064 | Diamond Helm |  |  | 7 |  | 3 |  |  | AO r88 |
| 87 | 2088 | Steel Mask |  |  | 7 |  |  | 4 |  | AO r89 |
| 88 | 2112 | Platinum Helm |  |  | 8 |  |  |  |  | AO r90 |
| 89 | 2136 | Giant's Helmet | 150 |  | 8 |  |  |  |  | AO r91 |
| 90 | 2160 | Dragon Helm | 70 |  | 9 |  |  |  |  | AO r92 |
| 91 | 2184 | Genji Helm |  |  | 9 | 4 |  |  |  | AO r93 |
| 92 | 2208 | Magepower Shishak |  |  | 11 | 5 |  |  |  | AO r94 |
| 93 | 2232 | Grand Helm |  |  | 12 |  | 10 |  |  | AO r95 |
| 94 | 2256 | Ringmail | 50 |  | 1 |  |  |  |  | AO r96 |
| 95 | 2280 | Windbreaker | 100 |  |  |  |  |  | Half Damage: Wind | AO r97 |
| 96 | 2304 | Heavy Coat | 120 |  |  |  |  |  |  | AO r98 |
| 97 | 2328 | Survival Vest | 140 |  |  |  | 5 |  |  | AO r99 |
| 98 | 2352 | Brigandine | 160 |  |  |  |  |  |  | AO r100 |
| 99 | 2376 | Jujitsu Gi | 180 |  | 2 |  |  |  |  | AO r101 |
| 100 | 2400 | Viking Coat | 240 |  |  |  |  |  | Immune: Water | AO r102 |
| 101 | 2424 | Metal Jerkin | 280 |  |  |  |  |  |  | AO r103 |
| 102 | 2448 | Adamant Vest | 320 |  |  |  |  |  | Half Damage: Fire, Weak: Ice | AO r104 |
| 103 | 2472 | Barrel Coat | 360 |  |  |  |  |  |  | AO r105 |
| 104 | 2496 | Power Vest | 400 |  | 2 |  |  |  |  | AO r106 |
| 105 | 2520 | Ninja Gear | 470 |  |  |  |  | 4 |  | AO r107 |
| 106 | 2544 | Gigas Chestplate | 540 |  |  | 2 |  |  |  | AO r108 |
| 107 | 2568 | Minerva Bustier | 610 |  |  |  |  |  |  | AO r109 |
| 108 | 2592 | Rubber Suit | 700 |  |  |  |  |  | Immune: Lightning | AO r110 |
| 109 | 2616 | Mirage Vest | 800 |  |  |  | 10 | 10 |  | AO r111 |
| 110 | 2640 | Brave Suit | 500 |  |  |  |  |  | Bravery | AO r112 |
| 111 | 2664 | Cotton Shirt |  | 3 |  | 1 |  |  |  | AO r113 |
| 112 | 2688 | Light Woven Shirt |  | 7 |  | 2 |  |  |  | AO r114 |
| 113 | 2712 | Silken Shirt |  | 8 |  | 2 |  |  |  | AO r115 |
| 114 | 2736 | Kilimweave Shirt |  | 16 |  | 3 |  |  |  | AO r116 |
| 115 | 2760 | Wizard's Robes |  | 32 |  | 4 |  |  |  | AO r117 |
| 116 | 2784 | Chanter's Djellaba |  | 35 |  | 4 | 5 |  |  | AO r118 |
| 117 | 2808 | Traveler's Vestment | 50 | 30 |  | 5 |  |  |  | AO r119 |
| 118 | 2832 | Mage's Habit |  | 50 |  | 6 |  |  |  | AO r120 |
| 119 | 2856 | Enchanter's Habit |  | 45 |  | 7 | 10 |  |  | AO r121 |
| 120 | 2880 | Sorcerer's Habit |  | 63 |  | 8 |  |  |  | AO r122 |
| 121 | 2904 | Black Garb |  | 38 |  | 6 |  | 3 |  | AO r123 |
| 122 | 2928 | Carmagnole |  | 40 |  | 7 |  |  |  | AO r124 |
| 123 | 2952 | Maduin Gear |  | 46 | 1 | 8 |  |  |  | AO r125 |
| 124 | 2976 | Jade Gown |  | 53 |  | 8 |  |  |  | AO r126 |
| 125 | 3000 | Gaia Gear | 150 | 10 |  | 8 |  |  |  | AO r127 |
| 126 | 3024 | Cleric's Robes |  | 70 |  | 9 |  |  |  | AO r128 |
| 127 | 3048 | White Robes | 100 | 66 |  | 10 |  | 4 | Potency: Holy | AO r129 |
| 128 | 3072 | Black Robes |  | 66 |  | 12 |  |  | Potency: Dark | AO r130 |
| 129 | 3096 | Glimmering Robes |  | 120 |  | 12 | 10 |  |  | AO r131 |
| 130 | 3120 | Lordly Robes |  | 100 | 5 | 15 |  |  |  | AO r132 |
| 131 | 3144 | Scale Armor |  |  | 3 |  |  | 3 |  | AO r133 |
| 132 | 3168 | Shielded Armor |  |  | 5 |  |  |  | Protect | AO r134 |
| 133 | 3192 | Demon Mail |  |  | 5 |  | 3 |  |  | AO r135 |
| 134 | 3216 | Diamond Armor |  |  | 7 |  | 5 |  |  | AO r136 |
| 135 | 3240 | Mirror Mail |  |  | 6 |  |  |  | Reflect | AO r137 |
| 136 | 3264 | Platinum Armor |  |  | 7 |  |  |  |  | AO r138 |
| 137 | 3288 | Carabineer Mail |  |  | 8 | 2 |  |  |  | AO r139 |
| 138 | 3312 | Dragon Mail | 100 |  | 8 |  |  |  |  | AO r140 |
| 139 | 3336 | Genji Armor |  |  | 9 | 3 |  |  |  | AO r141 |
| 140 | 3360 | Maximillian |  |  | 9 |  |  | 6 |  | AO r142 |
| 141 | 3384 | Grand Armor |  |  | 12 |  |  |  |  | AO r143 |
| 142 | 3408 | Opal Ring |  |  |  | 5 |  |  |  | AO r144 |
| 143 | 3432 | Ruby Ring |  |  |  |  |  |  | Reflect | AO r145 |
| 144 | 3456 | Tourmaline Ring |  |  |  |  |  |  | Immune: Poison, Sap, Half Damage: Ice | AO r146 |
| 145 | 3480 | Sage's Ring |  |  |  |  |  |  | Absorb: Holy | AO r147 |
| 146 | 3504 | Ring of Renewal |  |  |  |  |  |  | Regen | AO r148 |
| 147 | 3528 | Agate Ring |  |  |  |  | 20 |  | Half Damage: Wind | AO r149 |
| 148 | 3552 | Bangle |  |  |  |  |  |  | Libra | AO r150 |
| 149 | 3576 | Orrachea Armlet | 25 |  |  |  |  |  |  | AO r151 |
| 150 | 3600 | Power Armlet |  |  | 3 |  |  |  | Immune: Stop | AO r152 |
| 151 | 3624 | Argyle Armlet |  |  | 1 |  |  |  | Immune: Blind, Half Damage: Dark | AO r153 |
| 152 | 3648 | Amber Armlet |  |  |  |  |  | 2 |  | AO r154 |
| 153 | 3672 | Berserker Bracers |  |  |  |  |  |  | Berserk | AO r155 |
| 154 | 3696 | Magick Gloves | 100 |  |  |  |  |  |  | AO r156 |
| 155 | 3720 | Gauntlets |  |  |  |  | 5 |  |  | AO r157 |
| 156 | 3744 | Turtleshell Choker |  |  |  | 2 |  | 3 |  | AO r158 |
| 157 | 3768 | Leather Gorget |  | 30 |  |  |  |  |  | AO r159 |
| 158 | 3792 | Jade Collar |  |  |  |  |  | 3 |  | AO r160 |
| 159 | 3816 | Rose Corsage |  |  |  | 1 |  |  | Immune: Silence | AO r161 |
| 160 | 3840 | Indigo Pendant |  |  |  |  |  | 7 |  | AO r162 |
| 161 | 3864 | Bowline Sash |  |  |  | 2 |  |  | Immune: Confuse | AO r163 |
| 162 | 3888 | Firefly |  |  | 1 | 1 |  |  |  | AO r164 |
| 163 | 3912 | Sash |  |  |  |  |  | 20 | Immune: Slow, Half Damage: Fire | AO r165 |
| 164 | 3936 | Bubble Belt |  |  |  |  |  |  | Bubble | AO r166 |
| 165 | 3960 | Nishijin Belt |  |  |  | 3 |  |  | Immune: Sleep | AO r167 |
| 166 | 3984 | Black Belt |  |  |  |  | 7 |  | Immune: Disable, Immobilize | AO r168 |
| 167 | 4008 | Germinas Boots |  |  |  |  | 20 | 50 | Immune: Immobilize | AO r169 |
| 168 | 4032 | Hermes Sandals |  |  | 5 |  |  |  | Haste | AO r170 |
| 169 | 4056 | Gillie Boots |  |  | 1 |  |  | 10 | Immune: Oil | AO r171 |
| 170 | 4080 | Winged Boots |  |  |  |  |  | 5 | Float | AO r172 |
| 171 | 4104 | Quasimodo Boots | 500 |  |  |  |  |  | Immune: Sap | AO r173 |
| 172 | 4128 | Manufacted Nethicite |  |  |  |  |  |  | Silence, Half Damage: Fire, Lightning, Ice, Earth, Water, Wind, Holy, Dark | AO r174 |
| 173 | 4152 | Cat-ear Hood |  |  |  |  |  | 3 | Half Damage: Ice, Wind | AO r175 |
| 174 | 4176 | Fuzzy Miter |  |  | 2 |  |  |  | Immune: Petrify | AO r176 |
| 175 | 4200 | Ribbon |  |  |  |  |  |  | Regen, Libra, Immune: Petrify, Stop, Sleep, Confuse, Doom, Blind, Poison, Silence, Sap, Oil, Disable, Immobilize, Slow, Disease | AO r177 |

## Gear list (S13 r2-r558)

| Id | Content id | Name | Icon | Category | Slot | Formula | Attrib | Source |
|---|---|---|---|---|---|---|---|---|
| 0 | 0x1000 | Unarmed | 0:Hand | Unarmed | Weapon | 29 | 0 | S13 r2 |
| 1 | 0x1001 | Broadsword | 1:Sword | Sword | Weapon | 20 | 0 | S13 r3 |
| 2 | 0x1002 | Longsword | 1:Sword | Sword | Weapon | 20 | 0 | S13 r4 |
| 3 | 0x1003 | Iron Sword | 1:Sword | Sword | Weapon | 20 | 0 | S13 r5 |
| 4 | 0x1004 | Zwill Blade | 1:Sword | Sword | Weapon | 20 | 0 | S13 r6 |
| 5 | 0x1005 | Ancient Sword | 1:Sword | Sword | Weapon | 20 | 0 | S13 r7 |
| 6 | 0x1006 | Blood Sword | 1:Sword | Sword | Weapon | 20 | 0 | S13 r8 |
| 7 | 0x1007 | Lohengrin | 1:Sword | Sword | Weapon | 20 | 0 | S13 r9 |
| 8 | 0x1008 | Flametongue | 1:Sword | Sword | Weapon | 20 | 0 | S13 r10 |
| 9 | 0x1009 | Demonsbane | 1:Sword | Sword | Weapon | 20 | 0 | S13 r11 |
| 10 | 0x100a | Icebrand | 1:Sword | Sword | Weapon | 20 | 0 | S13 r12 |
| 11 | 0x100b | Platinum Sword | 1:Sword | Sword | Weapon | 20 | 0 | S13 r13 |
| 12 | 0x100c | Bastard Sword | 1:Sword | Sword | Weapon | 20 | 0 | S13 r14 |
| 13 | 0x100d | Diamond Sword | 1:Sword | Sword | Weapon | 20 | 0 | S13 r15 |
| 14 | 0x100e | Runeblade | 1:Sword | Sword | Weapon | 20 | 0 | S13 r16 |
| 15 | 0x100f | Deathbringer | 1:Sword | Sword | Weapon | 20 | 0 | S13 r17 |
| 16 | 0x1010 | Stoneblade | 1:Sword | Sword | Weapon | 20 | 0 | S13 r18 |
| 17 | 0x1011 | Durandal | 1:Sword | Sword | Weapon | 20 | 0 | S13 r19 |
| 18 | 0x1012 | Claymore | 2:Greatsword | Greatsword | Weapon | 20 | 0 | S13 r20 |
| 19 | 0x1013 | Defender | 2:Greatsword | Greatsword | Weapon | 20 | 0 | S13 r21 |
| 20 | 0x1014 | Save the Queen | 2:Greatsword | Greatsword | Weapon | 20 | 0 | S13 r22 |
| 21 | 0x1015 | Ragnarok | 2:Greatsword | Greatsword | Weapon | 20 | 0 | S13 r23 |
| 22 | 0x1016 | Ultima Blade | 2:Greatsword | Greatsword | Weapon | 20 | 0 | S13 r24 |
| 23 | 0x1017 | Excalibur | 2:Greatsword | Greatsword | Weapon | 20 | 0 | S13 r25 |
| 24 | 0x1018 | Tournesol | 2:Greatsword | Greatsword | Weapon | 20 | 0 | S13 r26 |
| 25 | 0x1019 | Kotetsu | 3:Katana | Katana | Weapon | 22 | 0 | S13 r27 |
| 26 | 0x101a | Osafune | 3:Katana | Katana | Weapon | 22 | 0 | S13 r28 |
| 27 | 0x101b | Kogarasumaru | 3:Katana | Katana | Weapon | 22 | 0 | S13 r29 |
| 28 | 0x101c | Magoroku | 3:Katana | Katana | Weapon | 22 | 0 | S13 r30 |
| 29 | 0x101d | Murasame | 3:Katana | Katana | Weapon | 22 | 0 | S13 r31 |
| 30 | 0x101e | Kiku-ichimonji | 3:Katana | Katana | Weapon | 22 | 0 | S13 r32 |
| 31 | 0x101f | Yakei | 3:Katana | Katana | Weapon | 22 | 0 | S13 r33 |
| 32 | 0x1020 | Ame-no-Murakumo | 3:Katana | Katana | Weapon | 22 | 0 | S13 r34 |
| 33 | 0x1021 | Muramasa | 3:Katana | Katana | Weapon | 22 | 0 | S13 r35 |
| 34 | 0x1022 | Masamune | 3:Katana | Katana | Weapon | 22 | 0 | S13 r36 |
| 35 | 0x1023 | Ashura | 4:Ninja Sword | Ninja Sword | Weapon | 21 | 0 | S13 r37 |
| 36 | 0x1024 | Sakura-saezuri | 4:Ninja Sword | Ninja Sword | Weapon | 21 | 0 | S13 r38 |
| 37 | 0x1025 | Kagenui | 4:Ninja Sword | Ninja Sword | Weapon | 21 | 0 | S13 r39 |
| 38 | 0x1026 | Koga Blade | 4:Ninja Sword | Ninja Sword | Weapon | 21 | 0 | S13 r40 |
| 39 | 0x1027 | Iga Blade | 4:Ninja Sword | Ninja Sword | Weapon | 21 | 0 | S13 r41 |
| 40 | 0x1028 | Orochi | 4:Ninja Sword | Ninja Sword | Weapon | 21 | 0 | S13 r42 |
| 41 | 0x1029 | Yagyu Darkblade | 4:Ninja Sword | Ninja Sword | Weapon | 21 | 0 | S13 r43 |
| 42 | 0x102a | Javelin | 5:Spear | Spear | Weapon | 20 | 0 | S13 r44 |
| 43 | 0x102b | Spear | 5:Spear | Spear | Weapon | 20 | 0 | S13 r45 |
| 44 | 0x102c | Partisan | 5:Spear | Spear | Weapon | 20 | 0 | S13 r46 |
| 45 | 0x102d | Heavy Lance | 5:Spear | Spear | Weapon | 20 | 0 | S13 r47 |
| 46 | 0x102e | Storm Spear | 5:Spear | Spear | Weapon | 20 | 0 | S13 r48 |
| 47 | 0x102f | Obelisk | 5:Spear | Spear | Weapon | 20 | 0 | S13 r49 |
| 48 | 0x1030 | Halberd | 5:Spear | Spear | Weapon | 20 | 0 | S13 r50 |
| 49 | 0x1031 | Trident | 5:Spear | Spear | Weapon | 20 | 0 | S13 r51 |
| 50 | 0x1032 | Holy Lance | 5:Spear | Spear | Weapon | 20 | 0 | S13 r52 |
| 51 | 0x1033 | Gungnir | 5:Spear | Spear | Weapon | 20 | 0 | S13 r53 |
| 52 | 0x1034 | Dragon Whisker | 5:Spear | Spear | Weapon | 20 | 0 | S13 r54 |
| 53 | 0x1035 | Zodiac Spear | 5:Spear | Spear | Weapon | 20 | 0 | S13 r55 |
| 54 | 0x1036 | Oaken Pole | 6:Pole | Pole | Weapon | 24 | 0 | S13 r56 |
| 55 | 0x1037 | Cypress Pole | 6:Pole | Pole | Weapon | 24 | 0 | S13 r57 |
| 56 | 0x1038 | Battle Bamboo | 6:Pole | Pole | Weapon | 24 | 0 | S13 r58 |
| 57 | 0x1039 | Musk Stick | 6:Pole | Pole | Weapon | 24 | 0 | S13 r59 |
| 58 | 0x103a | Iron Pole | 6:Pole | Pole | Weapon | 24 | 0 | S13 r60 |
| 59 | 0x103b | Six-fluted Pole | 6:Pole | Pole | Weapon | 24 | 1 | S13 r61 |
| 60 | 0x103c | Gokuu Pole | 6:Pole | Pole | Weapon | 24 | 0 | S13 r62 |
| 61 | 0x103d | Zephyr Pole | 6:Pole | Pole | Weapon | 24 | 0 | S13 r63 |
| 62 | 0x103e | Ivory Pole | 6:Pole | Pole | Weapon | 24 | 0 | S13 r64 |
| 63 | 0x103f | Sweep | 6:Pole | Pole | Weapon | 24 | 0 | S13 r65 |
| 64 | 0x1040 | Eight-fluted Pole | 6:Pole | Pole | Weapon | 24 | 0 | S13 r66 |
| 65 | 0x1041 | Whale Whisker | 6:Pole | Pole | Weapon | 24 | 0 | S13 r67 |
| 66 | 0x1042 | Shortbow | 7:Bow | Bow | Weapon | 25 | 0 | S13 r68 |
| 67 | 0x1043 | Silver Bow | 7:Bow | Bow | Weapon | 25 | 0 | S13 r69 |
| 68 | 0x1044 | Aevis Killer | 7:Bow | Bow | Weapon | 25 | 0 | S13 r70 |
| 69 | 0x1045 | Killer Bow | 7:Bow | Bow | Weapon | 25 | 0 | S13 r71 |
| 70 | 0x1046 | Longbow | 7:Bow | Bow | Weapon | 25 | 0 | S13 r72 |
| 71 | 0x1047 | Elfin Bow | 7:Bow | Bow | Weapon | 25 | 0 | S13 r73 |
| 72 | 0x1048 | Loxley Bow | 7:Bow | Bow | Weapon | 25 | 0 | S13 r74 |
| 73 | 0x1049 | Giant Stonebow | 7:Bow | Bow | Weapon | 25 | 0 | S13 r75 |
| 74 | 0x104a | Burning Bow | 7:Bow | Bow | Weapon | 25 | 2 | S13 r76 |
| 75 | 0x104b | Traitor's Bow | 7:Bow | Bow | Weapon | 25 | 0 | S13 r77 |
| 76 | 0x104c | Yoichi Bow | 7:Bow | Bow | Weapon | 25 | 0 | S13 r78 |
| 77 | 0x104d | Perseus Bow | 7:Bow | Bow | Weapon | 25 | 0 | S13 r79 |
| 78 | 0x104e | Artemis Bow | 7:Bow | Bow | Weapon | 25 | 0 | S13 r80 |
| 79 | 0x104f | Sagittarius | 7:Bow | Bow | Weapon | 25 | 0 | S13 r81 |
| 80 | 0x1050 | Bowgun | 8:Crossbow | Crossbow | Weapon | 26 | 0 | S13 r82 |
| 81 | 0x1051 | Crossbow | 8:Crossbow | Crossbow | Weapon | 26 | 0 | S13 r83 |
| 82 | 0x1052 | Paramina Crossbow | 8:Crossbow | Crossbow | Weapon | 26 | 0 | S13 r84 |
| 83 | 0x1053 | Recurve Crossbow | 8:Crossbow | Crossbow | Weapon | 26 | 0 | S13 r85 |
| 84 | 0x1054 | Hunting Crossbow | 8:Crossbow | Crossbow | Weapon | 26 | 0 | S13 r86 |
| 85 | 0x1055 | Penetrator Crossbow | 8:Crossbow | Crossbow | Weapon | 26 | 0 | S13 r87 |
| 86 | 0x1056 | Gastrophetes | 8:Crossbow | Crossbow | Weapon | 26 | 0 | S13 r88 |
| 87 | 0x1057 | Altair | 9:Gun | Gun | Weapon | 27 | 0 | S13 r89 |
| 88 | 0x1058 | Capella | 9:Gun | Gun | Weapon | 27 | 0 | S13 r90 |
| 89 | 0x1059 | Vega | 9:Gun | Gun | Weapon | 27 | 0 | S13 r91 |
| 90 | 0x105a | Sirius | 9:Gun | Gun | Weapon | 27 | 0 | S13 r92 |
| 91 | 0x105b | Betelgeuse | 9:Gun | Gun | Weapon | 27 | 0 | S13 r93 |
| 92 | 0x105c | Ras Algethi | 9:Gun | Gun | Weapon | 27 | 0 | S13 r94 |
| 93 | 0x105d | Aldebaran | 9:Gun | Gun | Weapon | 27 | 0 | S13 r95 |
| 94 | 0x105e | Spica | 9:Gun | Gun | Weapon | 27 | 0 | S13 r96 |
| 95 | 0x105f | Antares | 9:Gun | Gun | Weapon | 27 | 0 | S13 r97 |
| 96 | 0x1060 | Arcturus | 9:Gun | Gun | Weapon | 27 | 0 | S13 r98 |
| 97 | 0x1061 | Fomalhaut | 9:Gun | Gun | Weapon | 27 | 0 | S13 r99 |
| 98 | 0x1062 | Handaxe | 10:Axe | Axe | Weapon | 23 | 0 | S13 r100 |
| 99 | 0x1063 | Broadaxe | 10:Axe | Axe | Weapon | 23 | 0 | S13 r101 |
| 100 | 0x1064 | Slasher | 10:Axe | Axe | Weapon | 23 | 0 | S13 r102 |
| 101 | 0x1065 | Hammerhead | 10:Axe | Axe | Weapon | 23 | 0 | S13 r103 |
| 102 | 0x1066 | Francisca | 10:Axe | Axe | Weapon | 23 | 0 | S13 r104 |
| 103 | 0x1067 | Greataxe | 10:Axe | Axe | Weapon | 23 | 0 | S13 r105 |
| 104 | 0x1068 | Golden Axe | 10:Axe | Axe | Weapon | 23 | 0 | S13 r106 |
| 105 | 0x1069 | Iron Hammer | 11:Hammer | Hammer | Weapon | 23 | 0 | S13 r107 |
| 106 | 0x106a | War Hammer | 11:Hammer | Hammer | Weapon | 23 | 0 | S13 r108 |
| 107 | 0x106b | Sledgehammer | 11:Hammer | Hammer | Weapon | 23 | 0 | S13 r109 |
| 108 | 0x106c | Morning Star | 11:Hammer | Hammer | Weapon | 23 | 0 | S13 r110 |
| 109 | 0x106d | Scorpion Tail | 11:Hammer | Hammer | Weapon | 23 | 0 | S13 r111 |
| 110 | 0x106e | Dagger | 12:Dagger | Dagger | Weapon | 21 | 0 | S13 r112 |
| 111 | 0x106f | Mage Masher | 12:Dagger | Dagger | Weapon | 21 | 0 | S13 r113 |
| 112 | 0x1070 | Assassin's Dagger | 12:Dagger | Dagger | Weapon | 21 | 0 | S13 r114 |
| 113 | 0x1071 | Chopper | 12:Dagger | Dagger | Weapon | 21 | 0 | S13 r115 |
| 114 | 0x1072 | Main Gauche | 12:Dagger | Dagger | Weapon | 21 | 0 | S13 r116 |
| 115 | 0x1073 | Gladius | 12:Dagger | Dagger | Weapon | 21 | 3 | S13 r117 |
| 116 | 0x1074 | Avenger | 12:Dagger | Dagger | Weapon | 21 | 0 | S13 r118 |
| 117 | 0x1075 | Orichalcum Dirk | 12:Dagger | Dagger | Weapon | 21 | 0 | S13 r119 |
| 118 | 0x1076 | Platinum Dagger | 12:Dagger | Dagger | Weapon | 21 | 0 | S13 r120 |
| 119 | 0x1077 | Zwill Crossblade | 12:Dagger | Dagger | Weapon | 21 | 0 | S13 r121 |
| 120 | 0x1078 | Shikari Nagasa | 12:Dagger | Dagger | Weapon | 21 | 0 | S13 r122 |
| 121 | 0x1079 | Rod | 13:Rod | Rod | Weapon | 20 | 4 | S13 r123 |
| 122 | 0x107a | Serpent Rod | 13:Rod | Rod | Weapon | 20 | 4 | S13 r124 |
| 123 | 0x107b | Healing Rod | 13:Rod | Rod | Weapon | 27 | 4 | S13 r125 |
| 124 | 0x107c | Gaia Rod | 13:Rod | Rod | Weapon | 20 | 4 | S13 r126 |
| 125 | 0x107d | Power Rod | 13:Rod | Rod | Weapon | 20 | 5 | S13 r127 |
| 126 | 0x107e | Empyrean Rod | 13:Rod | Rod | Weapon | 20 | 4 | S13 r128 |
| 127 | 0x107f | Holy Rod | 13:Rod | Rod | Weapon | 20 | 6 | S13 r129 |
| 128 | 0x1080 | Rod of Faith | 13:Rod | Rod | Weapon | 27 | 7 | S13 r130 |
| 129 | 0x1081 | Oak Staff | 14:Staff | Staff | Weapon | 22 | 4 | S13 r131 |
| 130 | 0x1082 | Cherry Staff | 14:Staff | Staff | Weapon | 22 | 8 | S13 r132 |
| 131 | 0x1083 | Wizard's Staff | 14:Staff | Staff | Weapon | 22 | 9 | S13 r133 |
| 132 | 0x1084 | Flame Staff | 14:Staff | Staff | Weapon | 22 | 10 | S13 r134 |
| 133 | 0x1085 | Storm Staff | 14:Staff | Staff | Weapon | 22 | 11 | S13 r135 |
| 134 | 0x1086 | Glacial Staff | 14:Staff | Staff | Weapon | 22 | 12 | S13 r136 |
| 135 | 0x1087 | Golden Staff | 14:Staff | Staff | Weapon | 22 | 7 | S13 r137 |
| 136 | 0x1088 | Judicer's Staff | 14:Staff | Staff | Weapon | 22 | 13 | S13 r138 |
| 137 | 0x1089 | Cloud Staff | 14:Staff | Staff | Weapon | 22 | 14 | S13 r139 |
| 138 | 0x108a | Staff of the Magi | 14:Staff | Staff | Weapon | 22 | 15 | S13 r140 |
| 139 | 0x108b | Mace | 15:Mace | Mace | Weapon | 104 | 0 | S13 r141 |
| 140 | 0x108c | Bronze Mace | 15:Mace | Mace | Weapon | 104 | 0 | S13 r142 |
| 141 | 0x108d | Bhuj | 15:Mace | Mace | Weapon | 104 | 0 | S13 r143 |
| 142 | 0x108e | Miter | 15:Mace | Mace | Weapon | 104 | 0 | S13 r144 |
| 143 | 0x108f | Thorned Mace | 15:Mace | Mace | Weapon | 104 | 0 | S13 r145 |
| 144 | 0x1090 | Chaos Mace | 15:Mace | Mace | Weapon | 104 | 0 | S13 r146 |
| 145 | 0x1091 | Doom Mace | 15:Mace | Mace | Weapon | 104 | 0 | S13 r147 |
| 146 | 0x1092 | Zeus Mace | 15:Mace | Mace | Weapon | 104 | 16 | S13 r148 |
| 147 | 0x1093 | Grand Mace | 15:Mace | Mace | Weapon | 104 | 0 | S13 r149 |
| 148 | 0x1094 | Gilt Measure | 16:Measure | Measure | Weapon | 27 | 0 | S13 r150 |
| 149 | 0x1095 | Arc Scale | 16:Measure | Measure | Weapon | 27 | 0 | S13 r151 |
| 150 | 0x1096 | Multiscale | 16:Measure | Measure | Weapon | 27 | 0 | S13 r152 |
| 151 | 0x1097 | Cross Scale | 16:Measure | Measure | Weapon | 27 | 0 | S13 r153 |
| 152 | 0x1098 | Caliper | 16:Measure | Measure | Weapon | 27 | 0 | S13 r154 |
| 153 | 0x1099 | Euclid's Sextant | 16:Measure | Measure | Weapon | 27 | 0 | S13 r155 |
| 154 | 0x109a | Hornito | 17:Hand-Bomb | Hand-Bomb | Weapon | 23 | 0 | S13 r156 |
| 155 | 0x109b | Fumarole | 17:Hand-Bomb | Hand-Bomb | Weapon | 23 | 1 | S13 r157 |
| 156 | 0x109c | Tumulus | 17:Hand-Bomb | Hand-Bomb | Weapon | 23 | 0 | S13 r158 |
| 157 | 0x109d | Caldera | 17:Hand-Bomb | Hand-Bomb | Weapon | 23 | 0 | S13 r159 |
| 158 | 0x109e | Volcano | 17:Hand-Bomb | Hand-Bomb | Weapon | 23 | 0 | S13 r160 |
| 159 | 0x109f | Bonebreaker | 15:Mace | Mace | Weapon | 27 | 0 | S13 r161 |
| 160 | 0x10a0 | Mythril Sword | 1:Sword | Sword | Weapon | 20 | 0 | S13 r162 |
| 161 | 0x10a1 | Hero's Blade | 1:Sword | Sword | Weapon | 20 | 0 | S13 r163 |
| 162 | 0x10a2 | Treaty-Blade | 2:Greatsword | Greatsword | Weapon | 20 | 0 | S13 r164 |
| 163 | 0x10a3 | Sword of Kings | 2:Greatsword | Greatsword | Weapon | 20 | 0 | S13 r165 |
| 164 | 0x10a4 | Joyeuse | 1:Sword | Sword | Weapon | 104 | 0 | S13 r166 |
| 165 | 0x10a5 | Chirijiraden | 1:Sword | Sword | Weapon | 20 | 0 | S13 r167 |
| 166 | 0x10a6 | Nightmare (Leviathan) | 2:Greatsword | Greatsword | Weapon | 20 | 0 | S13 r168 |
| 167 | 0x10a7 | Flimsy Blade | 1:Sword | Sword | Weapon | 20 | 0 | S13 r169 |
| 168 | 0x10a8 | Mythril Blade | 1:Sword | Sword | Weapon | 20 | 0 | S13 r170 |
| 169 | 0x10a9 | Nightmare (Raithwall) | 2:Greatsword | Greatsword | Weapon | 20 | 0 | S13 r171 |
| 170 | 0x10aa | Kumbha | 3:Katana | Sword | Weapon | 22 | 0 | S13 r172 |
| 171 | 0x10ab | Mesa | 4:Ninja Sword | Ninja Sword | Weapon | 21 | 0 | S13 r173 |
| 172 | 0x10ac | Mina | 12:Dagger | Dagger | Weapon | 21 | 0 | S13 r174 |
| 173 | 0x10ad | Wyrmhero Blade | 2:Greatsword | Greatsword | Weapon | 20 | 17 | S13 r175 |
| 174 | 0x10ae | Vrsabha | 5:Spear | Spear | Weapon | 20 | 0 | S13 r176 |
| 175 | 0x10af | Bone of Byblos | 15:Mace | Mace | Weapon | 104 | 0 | S13 r177 |
| 176 | 0x10b0 | Tula | 8:Crossbow | Crossbow | Weapon | 26 | 0 | S13 r178 |
| 177 | 0x10b1 | Great Trango | 1:Sword | Sword | Weapon | 20 | 0 | S13 r179 |
| 178 | 0x10b2 | Seitengrat | 7:Bow | Bow | Weapon | 25 | 0 | S13 r180 |
| 179 | 0x10b3 | Belias's Weapon | 0:Hand | Spear | Weapon | 20 | 18 | S13 r181 |
| 180 | 0x10b4 | Mateus's Weapon | 0:Hand | Spear | Weapon | 20 | 19 | S13 r182 |
| 181 | 0x10b5 | Adrammelech's Weapon | 11:Hammer | Unarmed | Weapon | 20 | 20 | S13 r183 |
| 182 | 0x10b6 | Hashmal's Weapon | 0:Hand | Unarmed | Weapon | 23 | 21 | S13 r184 |
| 183 | 0x10b7 | Cúchulainn's Weapon | 11:Hammer | Unarmed | Weapon | 20 | 22 | S13 r185 |
| 184 | 0x10b8 | Famfrit's Weapon | 11:Hammer | Unarmed | Weapon | 20 | 23 | S13 r186 |
| 185 | 0x10b9 | Zalera's Weapon | 11:Hammer | Unarmed | Weapon | 20 | 24 | S13 r187 |
| 186 | 0x10ba | Shemhazai's Weapon | 0:Hand | Crossbow | Weapon | 25 | 25 | S13 r188 |
| 187 | 0x10bb | Chaos's Weapon | 11:Hammer | Unarmed | Weapon | 20 | 26 | S13 r189 |
| 188 | 0x10bc | Zeromus's Weapon | 11:Hammer | Unarmed | Weapon | 20 | 22 | S13 r190 |
| 189 | 0x10bd | Exodus's Weapon | 11:Hammer | Unarmed | Weapon | 20 | 22 | S13 r191 |
| 190 | 0x10be | Ultima's Weapon | 11:Hammer | Unarmed | Weapon | 20 | 27 | S13 r192 |
| 191 | 0x10bf | Zodiark's Weapon | 11:Hammer | Unarmed | Weapon | 20 | 28 | S13 r193 |
| 192 | 0x10c0 | Karkata | 1:Sword | Sword | Weapon | 20 | 0 | S13 r194 |
| 193 | 0x10c1 | Excalipur | 2:Greatsword | Greatsword | Weapon | 27 | 0 | S13 r195 |
| 194 | 0x10c2 | Simha | 1:Sword | Sword | Weapon | 20 | 0 | S13 r196 |
| 195 | 0x10c3 | Makara | 17:Hand-Bomb | Hand-Bomb | Weapon | 23 | 0 | S13 r197 |
| 196 | 0x10c4 | Vrscika | 11:Hammer | Hammer | Weapon | 23 | 0 | S13 r198 |
| 197 | 0x10c5 | Mithuna | 9:Gun | Gun | Weapon | 27 | 0 | S13 r199 |
| 198 | 0x10c6 | Kanya | 6:Pole | Pole | Weapon | 24 | 0 | S13 r200 |
| 199 | 0x10c7 | Dhanusha | 7:Bow | Bow | Weapon | 25 | 0 | S13 r201 |
| 200 | 0x10c8 | Gendarme | 18:Shield | Shield | Off-Hand |  | 29 | S13 r202 |
| 201 | 0x10c9 | Leather Shield | 18:Shield | Shield | Off-Hand |  | 0 | S13 r203 |
| 202 | 0x10ca | Buckler | 18:Shield | Shield | Off-Hand |  | 0 | S13 r204 |
| 203 | 0x10cb | Bronze Shield | 18:Shield | Shield | Off-Hand |  | 0 | S13 r205 |
| 204 | 0x10cc | Round Shield | 18:Shield | Shield | Off-Hand |  | 0 | S13 r206 |
| 205 | 0x10cd | Shell Shield | 18:Shield | Shield | Off-Hand |  | 30 | S13 r207 |
| 206 | 0x10ce | Golden Shield | 18:Shield | Shield | Off-Hand |  | 0 | S13 r208 |
| 207 | 0x10cf | Ice Shield | 18:Shield | Shield | Off-Hand |  | 31 | S13 r209 |
| 208 | 0x10d0 | Flame Shield | 18:Shield | Shield | Off-Hand |  | 32 | S13 r210 |
| 209 | 0x10d1 | Diamond Shield | 18:Shield | Shield | Off-Hand |  | 0 | S13 r211 |
| 210 | 0x10d2 | Platinum Shield | 18:Shield | Shield | Off-Hand |  | 0 | S13 r212 |
| 211 | 0x10d3 | Dragon Shield | 18:Shield | Shield | Off-Hand |  | 33 | S13 r213 |
| 212 | 0x10d4 | Crystal Shield | 18:Shield | Shield | Off-Hand |  | 0 | S13 r214 |
| 213 | 0x10d5 | Genji Shield | 18:Shield | Shield | Off-Hand |  | 0 | S13 r215 |
| 214 | 0x10d6 | Kaiser Shield | 18:Shield | Shield | Off-Hand |  | 0 | S13 r216 |
| 215 | 0x10d7 | Aegis Shield | 18:Shield | Shield | Off-Hand |  | 0 | S13 r217 |
| 216 | 0x10d8 | Demon Shield | 18:Shield | Shield | Off-Hand |  | 34 | S13 r218 |
| 217 | 0x10d9 | Venetian Shield | 18:Shield | Shield | Off-Hand |  | 35 | S13 r219 |
| 218 | 0x10da | Zodiac Escutcheon | 18:Shield | Shield | Off-Hand |  | 36 | S13 r220 |
| 219 | 0x10db | Ensanguined Shield | 18:Shield | Shield | Off-Hand |  | 37 | S13 r221 |
| 220 | 0x10dc | Leather Cap | 19:Light Helm | Helm | Helm |  | 38 | S13 r222 |
| 221 | 0x10dd | Headgear | 19:Light Helm | Helm | Helm |  | 39 | S13 r223 |
| 222 | 0x10de | Headguard | 19:Light Helm | Helm | Helm |  | 40 | S13 r224 |
| 223 | 0x10df | Leather Headgear | 19:Light Helm | Helm | Helm |  | 41 | S13 r225 |
| 224 | 0x10e0 | Horned Hat | 19:Light Helm | Helm | Helm |  | 42 | S13 r226 |
| 225 | 0x10e1 | Balaclava | 19:Light Helm | Helm | Helm |  | 43 | S13 r227 |
| 226 | 0x10e2 | Soldier's Cap | 19:Light Helm | Helm | Helm |  | 44 | S13 r228 |
| 227 | 0x10e3 | Green Beret | 19:Light Helm | Helm | Helm |  | 45 | S13 r229 |
| 228 | 0x10e4 | Red Cap | 19:Light Helm | Helm | Helm |  | 46 | S13 r230 |
| 229 | 0x10e5 | Headband | 19:Light Helm | Helm | Helm |  | 47 | S13 r231 |
| 230 | 0x10e6 | Pirate Hat | 19:Light Helm | Helm | Helm |  | 48 | S13 r232 |
| 231 | 0x10e7 | Goggle Mask | 19:Light Helm | Helm | Helm |  | 49 | S13 r233 |
| 232 | 0x10e8 | Adamant Hat | 19:Light Helm | Helm | Helm |  | 50 | S13 r234 |
| 233 | 0x10e9 | Officer's Hat | 19:Light Helm | Helm | Helm |  | 51 | S13 r235 |
| 234 | 0x10ea | Chakra Band | 19:Light Helm | Helm | Helm |  | 52 | S13 r236 |
| 235 | 0x10eb | Thief's Cap | 19:Light Helm | Helm | Helm |  | 53 | S13 r237 |
| 236 | 0x10ec | Gigas Hat | 19:Light Helm | Helm | Helm |  | 54 | S13 r238 |
| 237 | 0x10ed | Chaperon | 19:Light Helm | Helm | Helm |  | 55 | S13 r239 |
| 238 | 0x10ee | Crown of Laurels | 19:Light Helm | Helm | Helm |  | 56 | S13 r240 |
| 239 | 0x10ef | Renewing Morion | 19:Light Helm | Helm | Helm |  | 57 | S13 r241 |
| 240 | 0x10f0 | Dueling Mask | 19:Light Helm | Helm | Helm |  | 58 | S13 r242 |
| 241 | 0x10f1 | Cotton Cap | 20:Mystic Helm | Helm | Helm |  | 59 | S13 r243 |
| 242 | 0x10f2 | Magick Curch | 20:Mystic Helm | Helm | Helm |  | 60 | S13 r244 |
| 243 | 0x10f3 | Pointy Hat | 20:Mystic Helm | Helm | Helm |  | 61 | S13 r245 |
| 244 | 0x10f4 | Topkapi Hat | 20:Mystic Helm | Helm | Helm |  | 62 | S13 r246 |
| 245 | 0x10f5 | Calot Hat | 20:Mystic Helm | Helm | Helm |  | 63 | S13 r247 |
| 246 | 0x10f6 | Wizard's Hat | 20:Mystic Helm | Helm | Helm |  | 64 | S13 r248 |
| 247 | 0x10f7 | Lambent Hat | 20:Mystic Helm | Helm | Helm |  | 65 | S13 r249 |
| 248 | 0x10f8 | Feathered Cap | 20:Mystic Helm | Helm | Helm |  | 66 | S13 r250 |
| 249 | 0x10f9 | Mage's Hat | 20:Mystic Helm | Helm | Helm |  | 67 | S13 r251 |
| 250 | 0x10fa | Lamia's Tiara | 20:Mystic Helm | Helm | Helm |  | 68 | S13 r252 |
| 251 | 0x10fb | Sorcerer's Hat | 20:Mystic Helm | Helm | Helm |  | 69 | S13 r253 |
| 252 | 0x10fc | Black Cowl | 20:Mystic Helm | Helm | Helm |  | 70 | S13 r254 |
| 253 | 0x10fd | Astrakhan Hat | 20:Mystic Helm | Helm | Helm |  | 71 | S13 r255 |
| 254 | 0x10fe | Gaia Hat | 20:Mystic Helm | Helm | Helm |  | 72 | S13 r256 |
| 255 | 0x10ff | Hypnocrown | 20:Mystic Helm | Helm | Helm |  | 73 | S13 r257 |
| 256 | 0x1100 | Gold Hairpin | 20:Mystic Helm | Helm | Helm |  | 74 | S13 r258 |
| 257 | 0x1101 | Celebrant's Miter | 20:Mystic Helm | Helm | Helm |  | 75 | S13 r259 |
| 258 | 0x1102 | Black Mask | 20:Mystic Helm | Helm | Helm |  | 76 | S13 r260 |
| 259 | 0x1103 | White Mask | 20:Mystic Helm | Helm | Helm |  | 77 | S13 r261 |
| 260 | 0x1104 | Golden Skullcap | 20:Mystic Helm | Helm | Helm |  | 78 | S13 r262 |
| 261 | 0x1105 | Circlet | 20:Mystic Helm | Helm | Helm |  | 79 | S13 r263 |
| 262 | 0x1106 | Leather Helm | 21:Heavy Helm | Helm | Helm |  | 80 | S13 r264 |
| 263 | 0x1107 | Bronze Helm | 21:Heavy Helm | Helm | Helm |  | 80 | S13 r265 |
| 264 | 0x1108 | Sallet | 21:Heavy Helm | Helm | Helm |  | 81 | S13 r266 |
| 265 | 0x1109 | Iron Helm | 21:Heavy Helm | Helm | Helm |  | 81 | S13 r267 |
| 266 | 0x110a | Barbut | 21:Heavy Helm | Helm | Helm |  | 82 | S13 r268 |
| 267 | 0x110b | Winged Helm | 21:Heavy Helm | Helm | Helm |  | 83 | S13 r269 |
| 268 | 0x110c | Golden Helm | 21:Heavy Helm | Helm | Helm |  | 84 | S13 r270 |
| 269 | 0x110d | Burgonet | 21:Heavy Helm | Helm | Helm |  | 82 | S13 r271 |
| 270 | 0x110e | Close Helmet | 21:Heavy Helm | Helm | Helm |  | 84 | S13 r272 |
| 271 | 0x110f | Bone Helm | 21:Heavy Helm | Helm | Helm |  | 85 | S13 r273 |
| 272 | 0x1110 | Diamond Helm | 21:Heavy Helm | Helm | Helm |  | 86 | S13 r274 |
| 273 | 0x1111 | Steel Mask | 21:Heavy Helm | Helm | Helm |  | 87 | S13 r275 |
| 274 | 0x1112 | Platinum Helm | 21:Heavy Helm | Helm | Helm |  | 88 | S13 r276 |
| 275 | 0x1113 | Giant's Helmet | 21:Heavy Helm | Helm | Helm |  | 89 | S13 r277 |
| 276 | 0x1114 | Dragon Helm | 21:Heavy Helm | Helm | Helm |  | 90 | S13 r278 |
| 277 | 0x1115 | Genji Helm | 21:Heavy Helm | Helm | Helm |  | 91 | S13 r279 |
| 278 | 0x1116 | Magepower Shishak | 21:Heavy Helm | Helm | Helm |  | 92 | S13 r280 |
| 279 | 0x1117 | Grand Helm | 21:Heavy Helm | Helm | Helm |  | 93 | S13 r281 |
| 280 | 0x1118 | Leather Clothing | 22:Light Armor | Armor | Armor |  | 38 | S13 r282 |
| 281 | 0x1119 | Chromed Leathers | 22:Light Armor | Armor | Armor |  | 39 | S13 r283 |
| 282 | 0x111a | Leather Breastplate | 22:Light Armor | Armor | Armor |  | 40 | S13 r284 |
| 283 | 0x111b | Bronze Chestplate | 22:Light Armor | Armor | Armor |  | 41 | S13 r285 |
| 284 | 0x111c | Ringmail | 22:Light Armor | Armor | Armor |  | 94 | S13 r286 |
| 285 | 0x111d | Windbreaker | 22:Light Armor | Armor | Armor |  | 95 | S13 r287 |
| 286 | 0x111e | Heavy Coat | 22:Light Armor | Armor | Armor |  | 96 | S13 r288 |
| 287 | 0x111f | Survival Vest | 22:Light Armor | Armor | Armor |  | 97 | S13 r289 |
| 288 | 0x1120 | Brigandine | 22:Light Armor | Armor | Armor |  | 98 | S13 r290 |
| 289 | 0x1121 | Jujitsu Gi | 22:Light Armor | Armor | Armor |  | 99 | S13 r291 |
| 290 | 0x1122 | Viking Coat | 22:Light Armor | Armor | Armor |  | 100 | S13 r292 |
| 291 | 0x1123 | Metal Jerkin | 22:Light Armor | Armor | Armor |  | 101 | S13 r293 |
| 292 | 0x1124 | Adamant Vest | 22:Light Armor | Armor | Armor |  | 102 | S13 r294 |
| 293 | 0x1125 | Barrel Coat | 22:Light Armor | Armor | Armor |  | 103 | S13 r295 |
| 294 | 0x1126 | Power Vest | 22:Light Armor | Armor | Armor |  | 104 | S13 r296 |
| 295 | 0x1127 | Ninja Gear | 22:Light Armor | Armor | Armor |  | 105 | S13 r297 |
| 296 | 0x1128 | Gigas Chestplate | 22:Light Armor | Armor | Armor |  | 106 | S13 r298 |
| 297 | 0x1129 | Minerva Bustier | 22:Light Armor | Armor | Armor |  | 107 | S13 r299 |
| 298 | 0x112a | Rubber Suit | 22:Light Armor | Armor | Armor |  | 108 | S13 r300 |
| 299 | 0x112b | Mirage Vest | 22:Light Armor | Armor | Armor |  | 109 | S13 r301 |
| 300 | 0x112c | Brave Suit | 22:Light Armor | Armor | Armor |  | 110 | S13 r302 |
| 301 | 0x112d | Cotton Shirt | 23:Mystic Armor | Armor | Armor |  | 111 | S13 r303 |
| 302 | 0x112e | Light Woven Shirt | 23:Mystic Armor | Armor | Armor |  | 112 | S13 r304 |
| 303 | 0x112f | Silken Shirt | 23:Mystic Armor | Armor | Armor |  | 113 | S13 r305 |
| 304 | 0x1130 | Kilimweave Shirt | 23:Mystic Armor | Armor | Armor |  | 114 | S13 r306 |
| 305 | 0x1131 | Shepherd's Bolero | 23:Mystic Armor | Armor | Armor |  | 62 | S13 r307 |
| 306 | 0x1132 | Wizard's Robes | 23:Mystic Armor | Armor | Armor |  | 115 | S13 r308 |
| 307 | 0x1133 | Chanter's Djellaba | 23:Mystic Armor | Armor | Armor |  | 116 | S13 r309 |
| 308 | 0x1134 | Traveler's Vestment | 23:Mystic Armor | Armor | Armor |  | 117 | S13 r310 |
| 309 | 0x1135 | Mage's Habit | 23:Mystic Armor | Armor | Armor |  | 118 | S13 r311 |
| 310 | 0x1136 | Enchanter's Habit | 23:Mystic Armor | Armor | Armor |  | 119 | S13 r312 |
| 311 | 0x1137 | Sorcerer's Habit | 23:Mystic Armor | Armor | Armor |  | 120 | S13 r313 |
| 312 | 0x1138 | Black Garb | 23:Mystic Armor | Armor | Armor |  | 121 | S13 r314 |
| 313 | 0x1139 | Carmagnole | 23:Mystic Armor | Armor | Armor |  | 122 | S13 r315 |
| 314 | 0x113a | Maduin Gear | 23:Mystic Armor | Armor | Armor |  | 123 | S13 r316 |
| 315 | 0x113b | Jade Gown | 23:Mystic Armor | Armor | Armor |  | 124 | S13 r317 |
| 316 | 0x113c | Gaia Gear | 23:Mystic Armor | Armor | Armor |  | 125 | S13 r318 |
| 317 | 0x113d | Cleric's Robes | 23:Mystic Armor | Armor | Armor |  | 126 | S13 r319 |
| 318 | 0x113e | White Robes | 23:Mystic Armor | Armor | Armor |  | 127 | S13 r320 |
| 319 | 0x113f | Black Robes | 23:Mystic Armor | Armor | Armor |  | 128 | S13 r321 |
| 320 | 0x1140 | Glimmering Robes | 23:Mystic Armor | Armor | Armor |  | 129 | S13 r322 |
| 321 | 0x1141 | Lordly Robes | 23:Mystic Armor | Armor | Armor |  | 130 | S13 r323 |
| 322 | 0x1142 | Leather Armor | 24:Heavy Armor | Armor | Armor |  | 80 | S13 r324 |
| 323 | 0x1143 | Bronze Armor | 24:Heavy Armor | Armor | Armor |  | 80 | S13 r325 |
| 324 | 0x1144 | Scale Armor | 24:Heavy Armor | Armor | Armor |  | 131 | S13 r326 |
| 325 | 0x1145 | Iron Armor | 24:Heavy Armor | Armor | Armor |  | 81 | S13 r327 |
| 326 | 0x1146 | Linen Cuirass | 24:Heavy Armor | Armor | Armor |  | 82 | S13 r328 |
| 327 | 0x1147 | Chainmail | 24:Heavy Armor | Armor | Armor |  | 81 | S13 r329 |
| 328 | 0x1148 | Golden Armor | 24:Heavy Armor | Armor | Armor |  | 82 | S13 r330 |
| 329 | 0x1149 | Shielded Armor | 24:Heavy Armor | Armor | Armor |  | 132 | S13 r331 |
| 330 | 0x114a | Demon Mail | 24:Heavy Armor | Armor | Armor |  | 133 | S13 r332 |
| 331 | 0x114b | Bone Mail | 24:Heavy Armor | Armor | Armor |  | 85 | S13 r333 |
| 332 | 0x114c | Diamond Armor | 24:Heavy Armor | Armor | Armor |  | 134 | S13 r334 |
| 333 | 0x114d | Mirror Mail | 24:Heavy Armor | Armor | Armor |  | 135 | S13 r335 |
| 334 | 0x114e | Platinum Armor | 24:Heavy Armor | Armor | Armor |  | 136 | S13 r336 |
| 335 | 0x114f | Carabineer Mail | 24:Heavy Armor | Armor | Armor |  | 137 | S13 r337 |
| 336 | 0x1150 | Dragon Mail | 24:Heavy Armor | Armor | Armor |  | 138 | S13 r338 |
| 337 | 0x1151 | Genji Armor | 24:Heavy Armor | Armor | Armor |  | 139 | S13 r339 |
| 338 | 0x1152 | Maximillian | 24:Heavy Armor | Armor | Armor |  | 140 | S13 r340 |
| 339 | 0x1153 | Grand Armor | 24:Heavy Armor | Armor | Armor |  | 141 | S13 r341 |
| 340 | 0x1154 | Opal Ring | 25:Ring | Accessory | Accessory |  | 142 | S13 r342 |
| 341 | 0x1155 | Ruby Ring | 25:Ring | Accessory | Accessory |  | 143 | S13 r343 |
| 342 | 0x1156 | Tourmaline Ring | 25:Ring | Accessory | Accessory |  | 144 | S13 r344 |
| 343 | 0x1157 | Sage's Ring | 25:Ring | Accessory | Accessory |  | 145 | S13 r345 |
| 344 | 0x1158 | Ring of Renewal | 25:Ring | Accessory | Accessory |  | 146 | S13 r346 |
| 345 | 0x1159 | Agate Ring | 25:Ring | Accessory | Accessory |  | 147 | S13 r347 |
| 346 | 0x115a | Bangle | 26:Armlet | Accessory | Accessory |  | 148 | S13 r348 |
| 347 | 0x115b | Orrachea Armlet | 26:Armlet | Accessory | Accessory |  | 149 | S13 r349 |
| 348 | 0x115c | Power Armlet | 26:Armlet | Accessory | Accessory |  | 150 | S13 r350 |
| 349 | 0x115d | Argyle Armlet | 26:Armlet | Accessory | Accessory |  | 151 | S13 r351 |
| 350 | 0x115e | Diamond Armlet | 26:Armlet | Accessory | Accessory |  | 36 | S13 r352 |
| 351 | 0x115f | Amber Armlet | 26:Armlet | Accessory | Accessory |  | 152 | S13 r353 |
| 352 | 0x1160 | Berserker Bracers | 27:Glove | Accessory | Accessory |  | 153 | S13 r354 |
| 353 | 0x1161 | Magick Gloves | 27:Glove | Accessory | Accessory |  | 154 | S13 r355 |
| 354 | 0x1162 | Thief's Cuffs | 27:Glove | Accessory | Accessory |  | 3 | S13 r356 |
| 355 | 0x1163 | Blazer Gloves | 27:Glove | Accessory | Accessory |  | 42 | S13 r357 |
| 356 | 0x1164 | Genji Gloves | 27:Glove | Accessory | Accessory |  | 5 | S13 r358 |
| 357 | 0x1165 | Gauntlets | 27:Glove | Accessory | Accessory |  | 155 | S13 r359 |
| 358 | 0x1166 | Turtleshell Choker | 28:Collar | Accessory | Accessory |  | 156 | S13 r360 |
| 359 | 0x1167 | Nihopalaoa | 28:Collar | Accessory | Accessory |  | 0 | S13 r361 |
| 360 | 0x1168 | Embroidered Tippet | 28:Collar | Accessory | Accessory |  | 0 | S13 r362 |
| 361 | 0x1169 | Leather Gorget | 28:Collar | Accessory | Accessory |  | 157 | S13 r363 |
| 362 | 0x116a | Jade Collar | 28:Collar | Accessory | Accessory |  | 158 | S13 r364 |
| 363 | 0x116b | Steel Gorget | 28:Collar | Accessory | Accessory |  | 0 | S13 r365 |
| 364 | 0x116c | Rose Corsage | 29:Amulet | Accessory | Accessory |  | 159 | S13 r366 |
| 365 | 0x116d | Pheasant Netsuke | 29:Amulet | Accessory | Accessory |  | 0 | S13 r367 |
| 366 | 0x116e | Indigo Pendant | 29:Amulet | Accessory | Accessory |  | 160 | S13 r368 |
| 367 | 0x116f | Golden Amulet | 29:Amulet | Accessory | Accessory |  | 0 | S13 r369 |
| 368 | 0x1170 | Bowline Sash | 29:Amulet | Accessory | Accessory |  | 161 | S13 r370 |
| 369 | 0x1171 | Firefly | 29:Amulet | Accessory | Accessory |  | 162 | S13 r371 |
| 370 | 0x1172 | Sash | 30:Belt | Accessory | Accessory |  | 163 | S13 r372 |
| 371 | 0x1173 | Bubble Belt | 30:Belt | Accessory | Accessory |  | 164 | S13 r373 |
| 372 | 0x1174 | Cameo Belt | 30:Belt | Accessory | Accessory |  | 5 | S13 r374 |
| 373 | 0x1175 | Nishijin Belt | 30:Belt | Accessory | Accessory |  | 165 | S13 r375 |
| 374 | 0x1176 | Black Belt | 30:Belt | Accessory | Accessory |  | 166 | S13 r376 |
| 375 | 0x1177 | Battle Harness | 30:Belt | Accessory | Accessory |  | 80 | S13 r377 |
| 376 | 0x1178 | Germinas Boots | 31:Boots | Accessory | Accessory |  | 167 | S13 r378 |
| 377 | 0x1179 | Hermes Sandals | 31:Boots | Accessory | Accessory |  | 168 | S13 r379 |
| 378 | 0x117a | Gillie Boots | 31:Boots | Accessory | Accessory |  | 169 | S13 r380 |
| 379 | 0x117b | Steel Poleyns | 31:Boots | Accessory | Accessory |  | 0 | S13 r381 |
| 380 | 0x117c | Winged Boots | 31:Boots | Accessory | Accessory |  | 170 | S13 r382 |
| 381 | 0x117d | Quasimodo Boots | 31:Boots | Accessory | Accessory |  | 171 | S13 r383 |
| 382 | 0x117e | Manufacted Nethicite | 32:Crown | Accessory Crown | Accessory |  | 172 | S13 r384 |
| 383 | 0x117f | Cat-ear Hood | 32:Crown | Accessory Crown | Accessory |  | 173 | S13 r385 |
| 384 | 0x1180 | Fuzzy Miter | 32:Crown | Accessory Crown | Accessory |  | 174 | S13 r386 |
| 385 | 0x1181 | Ribbon | 32:Crown | Accessory Crown | Accessory |  | 175 | S13 r387 |
| 386 | 0x1182 | Goddess's Magicite | 32:Crown | Accessory Crown | Accessory |  | 0 | S13 r388 |
| 387 | 0x1183 | Dawn Shard | 32:Crown | Accessory Crown | Accessory |  | 0 | S13 r389 |
| 388 | 0x1184 | Onion Arrows | 33:Arrow | Arrow | Off-Hand |  | 0 | S13 r390 |
| 389 | 0x1185 | Parallel Arrows | 33:Arrow | Arrow | Off-Hand |  | 0 | S13 r391 |
| 390 | 0x1186 | Fiery Arrows | 33:Arrow | Arrow | Off-Hand |  | 0 | S13 r392 |
| 391 | 0x1187 | Bamboo Arrows | 33:Arrow | Arrow | Off-Hand |  | 0 | S13 r393 |
| 392 | 0x1188 | Lightning Arrows | 33:Arrow | Arrow | Off-Hand |  | 0 | S13 r394 |
| 393 | 0x1189 | Assassin's Arrows | 33:Arrow | Arrow | Off-Hand |  | 0 | S13 r395 |
| 394 | 0x118a | Icecloud Arrows | 33:Arrow | Arrow | Off-Hand |  | 0 | S13 r396 |
| 395 | 0x118b | Artemis Arrows | 33:Arrow | Arrow | Off-Hand |  | 0 | S13 r397 |
| 396 | 0x118c | Onion Bolts | 34:Bolt | Bolt | Off-Hand |  | 0 | S13 r398 |
| 397 | 0x118d | Long Bolts | 34:Bolt | Bolt | Off-Hand |  | 0 | S13 r399 |
| 398 | 0x118e | Stone Bolts | 34:Bolt | Bolt | Off-Hand |  | 0 | S13 r400 |
| 399 | 0x118f | Lead Bolts | 34:Bolt | Bolt | Off-Hand |  | 0 | S13 r401 |
| 400 | 0x1190 | Black Bolts | 34:Bolt | Bolt | Off-Hand |  | 0 | S13 r402 |
| 401 | 0x1191 | Time Bolts | 34:Bolt | Bolt | Off-Hand |  | 0 | S13 r403 |
| 402 | 0x1192 | Sapping Bolts | 34:Bolt | Bolt | Off-Hand |  | 0 | S13 r404 |
| 403 | 0x1193 | Grand Bolts | 34:Bolt | Bolt | Off-Hand |  | 0 | S13 r405 |
| 404 | 0x1194 | Onion Shot | 35:Shot | Shot | Off-Hand |  | 0 | S13 r406 |
| 405 | 0x1195 | Silent Shot | 35:Shot | Shot | Off-Hand |  | 0 | S13 r407 |
| 406 | 0x1196 | Aqua Shot | 35:Shot | Shot | Off-Hand |  | 0 | S13 r408 |
| 407 | 0x1197 | Wyrmfire Shot | 35:Shot | Shot | Off-Hand |  | 0 | S13 r409 |
| 408 | 0x1198 | Mud Shot | 35:Shot | Shot | Off-Hand |  | 0 | S13 r410 |
| 409 | 0x1199 | Windslicer Shot | 35:Shot | Shot | Off-Hand |  | 0 | S13 r411 |
| 410 | 0x119a | Dark Shot | 35:Shot | Shot | Off-Hand |  | 0 | S13 r412 |
| 411 | 0x119b | Stone Shot | 35:Shot | Shot | Off-Hand |  | 0 | S13 r413 |
| 412 | 0x119c | Onion Bombs | 36:Bomb | Bomb | Off-Hand |  | 0 | S13 r414 |
| 413 | 0x119d | Poison Bombs | 36:Bomb | Bomb | Off-Hand |  | 0 | S13 r415 |
| 414 | 0x119e | Stun Bombs | 36:Bomb | Bomb | Off-Hand |  | 0 | S13 r416 |
| 415 | 0x119f | Oil Bombs | 36:Bomb | Bomb | Off-Hand |  | 0 | S13 r417 |
| 416 | 0x11a0 | Chaos Bombs | 36:Bomb | Bomb | Off-Hand |  | 0 | S13 r418 |
| 417 | 0x11a1 | Stink Bombs | 36:Bomb | Bomb | Off-Hand |  | 0 | S13 r419 |
| 418 | 0x11a2 | Water Bombs | 36:Bomb | Bomb | Off-Hand |  | 0 | S13 r420 |
| 419 | 0x11a3 | Castellanos | 36:Bomb | Bomb | Off-Hand |  | 0 | S13 r421 |
| 420 |  | Unarmed | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r422 |
| 421 |  | Unarmed | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r423 |
| 422 |  | Fang | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r424 |
| 423 |  | Fang | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r425 |
| 424 |  | Dragon's Fang | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r426 |
| 425 |  | Kotetsu 1H | 0:Hand | Sword | Weapon | 20 | 0 | S13 r427 |
| 426 |  | Claw | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r428 |
| 427 |  | Claw | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r429 |
| 428 |  | Beak | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r430 |
| 429 |  | Beak | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r431 |
| 430 |  | Cutter | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r432 |
| 431 |  | Cutter | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r433 |
| 432 |  | Slap | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r434 |
| 433 |  | Slap | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r435 |
| 434 |  | Kick | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r436 |
| 435 |  | Kick | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r437 |
| 436 |  | Ram | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r438 |
| 437 |  | Ram | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r439 |
| 438 |  | Imperial Sabre | 0:Hand | Sword | Weapon | 20 | 0 | S13 r440 |
| 439 |  | Bushido Blade | 0:Hand | Sword | Weapon | 20 | 0 | S13 r441 |
| 440 |  | Luu's Sword | 0:Hand | Sword | Weapon | 20 | 0 | S13 r442 |
| 441 |  | Dalmascan Sabre | 0:Hand | Sword | Weapon | 20 | 0 | S13 r443 |
| 442 |  | Zanbatō | 0:Hand | Greatsword | Weapon | 20 | 0 | S13 r444 |
| 443 |  | Blunderbuss | 0:Hand | Gun | Weapon | 27 | 0 | S13 r445 |
| 444 |  | Military Gun | 0:Hand | Gun | Weapon | 27 | 0 | S13 r446 |
| 445 |  | Military Sword | 0:Hand | Sword | Weapon | 20 | 0 | S13 r447 |
| 446 |  | Military Greatsword | 0:Hand | Greatsword | Weapon | 20 | 0 | S13 r448 |
| 447 |  | Military Staff | 0:Hand | Staff | Weapon | 22 | 0 | S13 r449 |
| 448 |  | Ritter Shield | 0:Hand | Shield | Off-Hand |  | 0 | S13 r450 |
| 449 |  | Scutum | 0:Hand | Shield | Off-Hand |  | 0 | S13 r451 |
| 450 |  | Decapitator | 0:Hand | Greatsword | Weapon | 20 | 0 | S13 r452 |
| 451 |  | Balmung | 0:Hand | Greatsword | Weapon | 20 | 0 | S13 r453 |
| 452 |  | Ascalon | 0:Hand | Greatsword | Weapon | 20 | 0 | S13 r454 |
| 453 |  | Blood Brand | 0:Hand | Greatsword | Weapon | 20 | 0 | S13 r455 |
| 454 |  | Impish Couse | 0:Hand | Spear | Weapon | 20 | 0 | S13 r456 |
| 455 |  | Kanabō | 0:Hand | Pole | Weapon | 20 | 0 | S13 r457 |
| 456 |  | Butcher's Blade | 0:Hand | Greatsword | Weapon | 20 | 0 | S13 r458 |
| 457 |  | Spinning Sawblade | 0:Hand | Greatsword | Weapon | 20 | 0 | S13 r459 |
| 458 |  | Eurytos Crossbow | 0:Hand | Crossbow | Weapon | 25 | 0 | S13 r460 |
| 459 |  | Golden Shaft | 0:Hand | Bolt | Off-Hand |  | 0 | S13 r461 |
| 460 |  | Ouster Lance | 0:Hand | Spear | Weapon | 20 | 0 | S13 r462 |
| 461 |  | Vulcan Lance | 0:Hand | Spear | Weapon | 20 | 0 | S13 r463 |
| 462 |  | Knife | 0:Hand | Dagger | Weapon | 21 | 0 | S13 r464 |
| 463 |  | Chain | 0:Hand | Mace | Weapon | 104 | 0 | S13 r465 |
| 464 |  | Bone | 0:Hand | Mace | Weapon | 104 | 0 | S13 r466 |
| 465 |  | Cocytus | 0:Hand | Mace | Weapon | 104 | 0 | S13 r467 |
| 466 |  | Tree Branch | 0:Hand | Mace | Weapon | 104 | 0 | S13 r468 |
| 467 |  | Broadsword | 0:Hand | Sword | Weapon | 20 | 0 | S13 r469 |
| 468 |  | Joyeuse | 0:Hand | Sword | Weapon | 20 | 0 | S13 r470 |
| 469 |  | Sword Breaker | 0:Hand | Shield | Off-Hand |  | 0 | S13 r471 |
| 470 |  | Judge Blade | 0:Hand | Sword | Weapon | 20 | 0 | S13 r472 |
| 471 |  | Judge Shield | 0:Hand | Shield | Off-Hand |  | 0 | S13 r473 |
| 472 |  | Phalanx | 0:Hand | Sword | Weapon | 20 | 0 | S13 r474 |
| 473 |  | Stinger | 0:Hand | Shield | Off-Hand |  | 0 | S13 r475 |
| 474 |  | Kalin Blade | 0:Hand | Sword | Weapon | 20 | 0 | S13 r476 |
| 475 |  | Genesis | 0:Hand | Shield | Off-Hand |  | 0 | S13 r477 |
| 476 |  | Blassty | 0:Hand | Sword | Weapon | 20 | 0 | S13 r478 |
| 477 |  | Deathtrap | 0:Hand | Shield | Off-Hand |  | 0 | S13 r479 |
| 478 |  | Mustadio Type | 0:Hand | Gun | Weapon | 27 | 0 | S13 r480 |
| 479 |  | Besrodio Type | 0:Hand | Shot | Off-Hand |  | 0 | S13 r481 |
| 480 |  | Vajra | 0:Hand | Sword | Weapon | 20 | 0 | S13 r482 |
| 481 |  | Surya | 0:Hand | Shield | Off-Hand |  | 0 | S13 r483 |
| 482 |  | Chaos Blade | 0:Hand | Sword | Weapon | 20 | 0 | S13 r484 |
| 483 |  | Highway Star | 0:Hand | Shield | Off-Hand |  | 0 | S13 r485 |
| 484 |  | Chirijiraden | 0:Hand | Sword | Weapon | 20 | 0 | S13 r486 |
| 485 |  | Nokizaru Kunai | 0:Hand | Shield | Off-Hand |  | 0 | S13 r487 |
| 486 |  | Gunblade Replica | 0:Hand | Sword | Weapon | 20 | 0 | S13 r488 |
| 487 |  | Orichalcon Replica | 0:Hand | Sword | Weapon | 20 | 0 | S13 r489 |
| 488 |  | Kotetsu Replica | 0:Hand | Shield | Off-Hand |  | 0 | S13 r490 |
| 489 |  | Gunblade Replica | 0:Hand | Shield | Off-Hand |  | 0 | S13 r491 |
| 490 |  | Surge Hand | 0:Hand | Crossbow | Weapon | 25 | 0 | S13 r492 |
| 491 |  | Shockwave | 0:Hand | Bolt | Off-Hand |  | 0 | S13 r493 |
| 492 |  | Buster Replica | 0:Hand | Sword | Weapon | 20 | 0 | S13 r494 |
| 493 |  | Brotherhood Replica | 0:Hand | Sword | Weapon | 20 | 0 | S13 r495 |
| 494 |  | Labrys | 0:Hand | Greatsword | Weapon | 20 | 0 | S13 r496 |
| 495 |  | Tabar | 0:Hand | Greatsword | Weapon | 20 | 0 | S13 r497 |
| 496 |  | Shovel | 0:Hand | Greatsword | Weapon | 20 | 0 | S13 r498 |
| 497 |  | Curtana | 0:Hand | Greatsword | Weapon | 20 | 0 | S13 r499 |
| 498 |  | Dainsleif | 0:Hand | Greatsword | Weapon | 20 | 0 | S13 r500 |
| 499 |  | L85 Cannon Barrel | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r501 |
| 500 |  | Caduceus | 0:Hand | Gun | Weapon | 64 | 0 | S13 r502 |
| 501 |  | Tournelune 1H | 0:Hand | Sword | Weapon | 20 | 0 | S13 r503 |
| 502 |  | Zantetsuken Replica | 0:Hand | Sword | Weapon | 20 | 0 | S13 r504 |
| 503 |  | Tournesol 1H | 0:Hand | Sword | Weapon | 20 | 0 | S13 r505 |
| 504 |  | Wyrmhero Blade | 0:Hand | Shield | Off-Hand |  | 0 | S13 r506 |
| 505 |  | Rook Laser | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r507 |
| 506 |  | Omega Laser | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r508 |
| 507 |  | Stone Strike | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r509 |
| 508 |  | Stop Strike | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r510 |
| 509 |  | Sleep Strike | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r511 |
| 510 |  | Confusion Strike | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r512 |
| 511 |  | Darkness Strike | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r513 |
| 512 |  | Poison Strike | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r514 |
| 513 |  | Silence Strike | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r515 |
| 514 |  | Slip Strike | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r516 |
| 515 |  | Disable Strike | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r517 |
| 516 |  | Immobilise Strike | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r518 |
| 517 |  | Slow Strike | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r519 |
| 518 |  | Virus Strike | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r520 |
| 519 |  | Berserk Strike | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r521 |
| 520 |  | Fire Fang | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r522 |
| 521 |  | Stone Fang | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r523 |
| 522 |  | Confusion Fang | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r524 |
| 523 |  | Poison Fang | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r525 |
| 524 |  | Virus Fang | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r526 |
| 525 |  | Thunder Claw | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r527 |
| 526 |  | Slip Claw | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r528 |
| 527 |  | Sleep Beak | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r529 |
| 528 |  | Time Beak | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r530 |
| 529 |  | Slow Beak | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r531 |
| 530 |  | Stop Cutter | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r532 |
| 531 |  | Disable Cutter | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r533 |
| 532 |  | Immobilise Cutter | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r534 |
| 533 |  | Sleep Slap | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r535 |
| 534 |  | Confusion Slap | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r536 |
| 535 |  | Oil Slap | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r537 |
| 536 |  | Slow Slap | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r538 |
| 537 |  | Fire Kick | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r539 |
| 538 |  | Thunder Kick | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r540 |
| 539 |  | Flame Ram | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r541 |
| 540 |  | Wind Ram | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r542 |
| 541 |  | Darkness Ram | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r543 |
| 542 |  | Oil Ram | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r544 |
| 543 |  | Slow Ram | 0:Hand | Unarmed | Weapon | 64 | 0 | S13 r545 |
| 544 |  | Belias's Armor | 24:Heavy Armor | Armor | Armor |  | 0 | S13 r546 |
| 545 |  | Mateus's Armor | 24:Heavy Armor | Armor | Armor |  | 0 | S13 r547 |
| 546 |  | Adrammelech's Armor | 24:Heavy Armor | Armor | Armor |  | 0 | S13 r548 |
| 547 |  | Hashmal's Armor | 24:Heavy Armor | Armor | Armor |  | 0 | S13 r549 |
| 548 |  | Cúchulainn's Armor | 24:Heavy Armor | Armor | Armor |  | 0 | S13 r550 |
| 549 |  | Famfrit's Armor | 24:Heavy Armor | Armor | Armor |  | 0 | S13 r551 |
| 550 |  | Zalera's Armor | 24:Heavy Armor | Armor | Armor |  | 0 | S13 r552 |
| 551 |  | Shemhazai's Armor | 24:Heavy Armor | Armor | Armor |  | 0 | S13 r553 |
| 552 |  | Chaos's Armor | 24:Heavy Armor | Armor | Armor |  | 0 | S13 r554 |
| 553 |  | Zeromus's Armor | 24:Heavy Armor | Armor | Armor |  | 0 | S13 r555 |
| 554 |  | Exodus's Armor | 24:Heavy Armor | Armor | Armor |  | 0 | S13 r556 |
| 555 |  | Ultima's Armor | 24:Heavy Armor | Armor | Armor |  | 0 | S13 r557 |
| 556 |  | Zodiark's Armor | 24:Heavy Armor | Armor | Armor |  | 0 | S13 r558 |

## Status bytes and text icons

The sheet splits the 32-bit status field into four bytes (Inflict Status1-4 = bits 0-7, 8-15, 16-23, 24-31). The Description Calculator writes status icons into help text as `{icon:N}` with N = 21 + status bit, `{icon:20}` for the hits-flying mark and `{icon:fire}`, `{icon:lightning}`, `{icon:ice}`, `{icon:earth}`, `{icon:water}`, `{icon:wind}`, `{icon:holy}`, `{icon:dark}` for elements, with `{vpos:-2}`/`{vpos:0}` to shift the icon row (DC Descriptions!AX, AZ-BC, BG-BI formulas). Lines are separated with `\n` and columns with `\t` inside the string (DC Descriptions!A).

#### `TextIconTag`

| Value | Label |
|---|---|
| 20 (0x14) | {icon:20} hits-flying mark |
| 21 (0x15) | {icon:21} KO (status bit 0) |
| 22 (0x16) | {icon:22} Stone (status bit 1) |
| 23 (0x17) | {icon:23} Petrify (status bit 2) |
| 24 (0x18) | {icon:24} Stop (status bit 3) |
| 25 (0x19) | {icon:25} Sleep (status bit 4) |
| 26 (0x1A) | {icon:26} Confuse (status bit 5) |
| 27 (0x1B) | {icon:27} Doom (status bit 6) |
| 28 (0x1C) | {icon:28} Blind (status bit 7) |
| 29 (0x1D) | {icon:29} Poison (status bit 8) |
| 30 (0x1E) | {icon:30} Silence (status bit 9) |
| 31 (0x1F) | {icon:31} Sap (status bit 10) |
| 32 (0x20) | {icon:32} Oil (status bit 11) |
| 33 (0x21) | {icon:33} Reverse (status bit 12) |
| 34 (0x22) | {icon:34} Disable (status bit 13) |
| 35 (0x23) | {icon:35} Immobilize (status bit 14) |
| 36 (0x24) | {icon:36} Slow (status bit 15) |
| 37 (0x25) | {icon:37} Disease (status bit 16) |
| 38 (0x26) | {icon:38} Lure (status bit 17) |
| 39 (0x27) | {icon:39} Protect (status bit 18) |
| 40 (0x28) | {icon:40} Shell (status bit 19) |
| 41 (0x29) | {icon:41} Haste (status bit 20) |
| 42 (0x2A) | {icon:42} Bravery (status bit 21) |
| 43 (0x2B) | {icon:43} Faith (status bit 22) |
| 44 (0x2C) | {icon:44} Reflect (status bit 23) |
| 45 (0x2D) | {icon:45} Invisible (status bit 24) |
| 46 (0x2E) | {icon:46} Regen (status bit 25) |
| 47 (0x2F) | {icon:47} Float (status bit 26) |
| 48 (0x30) | {icon:48} Berserk (status bit 27) |
| 49 (0x31) | {icon:49} Bubble (status bit 28) |
| 50 (0x32) | {icon:50} HP Critical (status bit 29) |
| 51 (0x33) | {icon:51} Libra (status bit 30) |
| 52 (0x34) | {icon:52} X-Zone (status bit 31) |

## Enums added by this spec

| Enum | Keys | Use |
|---|---|---|
| `Gear`, `GearContentId` | 0-556 | row labels; content id of shop items |
| `EquipmentIconSheet` | 0-36 | icon ids seen in the sheet (subset of BpeIconList) |
| `OffhandCategorySheet` | 18, 23-26, 255 | off-hand category ids used by weapons |
| `DistanceBehaviorSheetName` | 0-5 | the sheet's names for BpeWeaponDistanceBehaviorList values (mapping inferred from weapon categories) |
| `AttributeSet` | 0-175 | attribute index -> users and bonuses |
| `AttributeLinkOffset` | 0, 24, ... 4200 | same, keyed by the stored byte offset (equipment +0x28) |
| `TextIconTag` | 20-52 | {icon:N} tags used in equipment help text |
| `Formula`, `Augment` | see enums-formulas / enums-augments | copied for convenience |

All enums of battlepack-s13-equipment-attributes (categories, slot types, stances, element and status flags) are carried over unchanged.

## Record layouts (copied from battlepack-s13-equipment-attributes, with sheet columns)

### Record `header` — 32 bytes (0x20), count: 1

*Where:* Offset 0 of battlepack section 13.

| Offset | Size | Type | Name | Meaning (source) | Enum |
|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `magic` | ASCII 'st2e' (73 74 32 65); reject the section if different. |  |
| 0x04 | 4 | u32 | `entryCount` | Number of equipment records (the Toolkit lists name 557 rows, 0 Unarmed … 556). |  |
| 0x08 | 2 | u16 | `entrySize` | Bytes per entry; 52 (0x34) for this section. |  |
| 0x0A | 2 | bytes | `unknown0A` | Not interpreted; keep. |  |
| 0x0C | 4 | u32 | `entryListOffset` | Offset of entry 0 from the section start: 32 when entryCount > 0, else 0. |  |
| 0x10 | 4 | u32 | `offset10` | Unknown offset slot (0 in Workshop output). |  |
| 0x14 | 4 | u32 | `textSectionOffset` | Inline text offset; 0 on disk for this section (filled at run time). No strings are stored here. |  |
| 0x18 | 4 | u32 | `offset18` | attributeTableOffset: offset of the attribute table from the section start. The Workshop always places it right after the equipment records (= 32 + entryCount*52). |  |
| 0x1C | 4 | u32 | `offset1C` | Unknown offset slot (0 in Workshop output). |  |

### Record `equipment` — 52 bytes (0x34), count: header.entryCount

*Where:* st2e entries of section 13: header.entryListOffset + i*52; row i = gear id i (S13 Vanilla Section 13!r(i+2), 557 rows 0-556)

| Offset | Size | Type | Name | Meaning (source) | Enum |
|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `unknown00` | Not interpreted (the Workshop skips it and writes 0). |  |
| 0x02 | 2 | u16 | `name` | Name text id (equipment block, 2048+). Sheet S13 column B "Gear" (shows <id+4096>:<name>, not the stored text id). | `DescEquipmentList` |
| 0x04 | 1 | u8 | `icon` | Menu icon. Sheet S13 column D "Icon" (<id>:<name>). | `BpeIconList` |
| 0x05 | 1 | u8 | `unknown05` | Not interpreted. |  |
| 0x06 | 1 | u8 | `optimizationTiebreaker` | Tie-break rank used when the Optimize command compares equal items. Sheet S13 column E "Optimization". |  |
| 0x07 | 1 | bf8 | `flags` | Bits 0 and 3 are unnamed; the Workshop rebuilds the byte from the named bits only. Sheet S13 column F "Flags Array" (whole byte, decimal). | bits below |
| 0x08 | 1 | u8 | `sort` | Menu sort key. Sheet S13 column G "Sort". |  |
| 0x09 | 1 | u8 | `category` | Equipment category; selects the variant layout of bytes 0x11 and 0x18-0x33: 0-17 weapon, 18 shield, 19-22 helm/armor/accessory/crown ("armor" variant), 23+ ammunition. Sheet S13 column L "Category" (name only). | `BpEquipmentCategoryList` |
| 0x0A | 4 | bytes | `unknown0A` | Not interpreted. |  |
| 0x0E | 2 | u16 | `description` | Description text id; labelled ineffectual (unused by the game) by the Workshop and the Toolkit. |  |
| 0x10 | 1 | u8 | `metal` | Metal property byte (meaning not documented beyond the name). Sheet S13 column H "Metal". |  |
| 0x11 | 1 | u8 | `offhandCategory` | only: weapon — category of the off-hand item (ammo/shield) this weapon pairs with; for other variants this byte is not interpreted. Sheet S13 column J "Offhand Category" (<id>:<name>). | `BpEquipmentCategoryList` |
| 0x12 | 2 | u16 | `gil` | Buy price (all variants). Unsigned; 65535 acts as a "none" sentinel in places (msg 534-537, 620). Sheet S13 column I "Gil". |  |
| 0x14 | 4 | bytes | `unknown14` | Not interpreted (all variants; ammunition also leaves 0x18-0x19 uninterpreted). |  |
| 0x18 | 1 | u8 | `range` | only: weapon — attack range. Sheet S13 column M "Range". |  |
| 0x18 | 1 | u8 | `shieldEvade` | only: shield — physical evade. Sheet S13 column R "Evade" (shields). |  |
| 0x18 | 1 | u8 | `defense` | only: armor — defense. Sheet S13 column AE "Defense". |  |
| 0x19 | 1 | u8 | `formula` | only: weapon — attack formula (same id space as action formulas; swapping it has side effects, msg 493-503). Sheet S13 column N "Formula". | `Formula` |
| 0x19 | 1 | u8 | `shieldMagickEvade` | only: shield — magick evade. Sheet S13 column S "MEvade". |  |
| 0x19 | 1 | u8 | `magickResist` | only: armor — magick resist. Sheet S13 column AF "Resist". |  |
| 0x1A | 1 | u8 | `attackPower` | only: weapon, ammunition — attack power. Sheet S13 column O "Attack". |  |
| 0x1A | 1 | u8 | `augment` | only: armor — augment granted while equipped (section 58 row). Sheet S13 column AG "Augment" (255 = none). | `Augment` |
| 0x1B | 1 | u8 | `knockbackChance` | only: weapon — knockback chance. Sheet S13 column P "Knockback". |  |
| 0x1C | 1 | u8 | `comboOrCriticalChance` | only: weapon — combo (or critical, depending on weapon type) chance. Sheet S13 column Q "Combo/Crit". |  |
| 0x1D | 1 | u8 | `evade` | only: weapon, ammunition — evade bonus. Sheet S13 column R "Evade". |  |
| 0x1E | 1 | bf8 | `elements` | only: weapon, ammunition — attack element(s). Sheet S13 column T "Element". | `ElementFlags` |
| 0x1F | 1 | u8 | `onHitRate` | only: weapon, ammunition — chance to inflict statusEffects. Sheet S13 column U "On-hit %". |  |
| 0x20 | 4 | bf32 | `statusEffects` | only: weapon, ammunition — statuses inflicted on hit. Sheet S13 column V-Y "Inflict Status1-4" (one byte each). | `StatusEffectFlags` |
| 0x24 | 1 | u8 | `unknown24` | Not interpreted (any variant). Sheet S13 column Z "Unused" (non-zero for many weapons: 3 sword/bow, 5 spear/staff/measure, 7 greatsword, 8 crossbow, 10 pole/hammer). |  |
| 0x25 | 1 | u8 | `distanceBehavior` | only: weapon — approach behaviour, e.g. whether the attacker steps back before striking (msg 532). Sheet S13 column AA "Distance Behavior" (name only). | `BpeWeaponDistanceBehaviorList` |
| 0x26 | 1 | u8 | `stance` | only: weapon — weapon stance (section 0 row). Sheet S13 column AB "Stance" (name only). | `BpWeaponStanceList` |
| 0x27 | 1 | u8 | `chargeTime` | only: weapon — charge time of a normal attack. Sheet S13 column AC "CT". |  |
| 0x28 | 4 | u32 | `attributeLink` | All variants: byte offset of this item's attribute record, counted from the start of the attribute table (header.offset18). attributeIndex = attributeLink / 24; must be a multiple of 24. Several items may share one record. Sheet S13 column AH "Attrib ID" = attributeLink / 24. | `AttributeLinkOffset` |
| 0x2C | 2 | u16 | `particleEffect` | only: weapon — swing/trail particle effect. | `BpeWeaponParticleEffectList` |
| 0x2E | 2 | u16 | `unknown2E` | Not interpreted (any variant). |  |
| 0x30 | 4 | s32 | `model` | only: weapon, shield, ammunition — model id (prefix letter << 16 \| number; weapons use prefix w). For the armor variant bytes 0x2C-0x33 are not interpreted. Sheet S13 column AD "Model ID" (decimal). | `ModelList` |

#### Bits of `equipment.flags` (bf8 at 0x07; bit 0 = least significant)

| Bit(s) | Name | Enum / meaning |
|---|---|---|
| 1 | `unsaleable` |  |
| 2 | `hitsFlying` |  |
| 4 | `licenseIndependent` |  |
| 5-7 | `slotType` | `BpeEquipmentSlotTypeList` |

#### Bits of `equipment.elements` (bf8 at 0x1E; bit 0 = least significant)

| Bit(s) | Name | Enum / meaning |
|---|---|---|
| 0 | `fire` |  |
| 1 | `lightning` |  |
| 2 | `ice` |  |
| 3 | `earth` |  |
| 4 | `water` |  |
| 5 | `wind` |  |
| 6 | `holy` |  |
| 7 | `dark` |  |

#### Bits of `equipment.statusEffects` (bf32 at 0x20; bit 0 = least significant)

| Bit(s) | Name | Enum / meaning |
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

### Record `attribute` — 24 bytes (0x18), count: floor((sectionLength - header.offset18) / 24), sectionLength = span of section 13 in the battlepack (trailing pad < 24 bytes is ignored)

*Where:* Attribute table of section 13: header.offset18 + k*24, running to the end of the section

| Offset | Size | Type | Name | Meaning (source) | Enum |
|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `maxHp` | Max HP bonus. Sheet S13 column AI "HP". |  |
| 0x02 | 2 | u16 | `maxMp` | Max MP bonus. Sheet S13 column AJ "MP". |  |
| 0x04 | 1 | u8 | `strength` | Strength bonus. Sheet S13 column AK "Strength". |  |
| 0x05 | 1 | u8 | `magickPower` | Magick Power bonus. Sheet S13 column AL "Magick". |  |
| 0x06 | 1 | u8 | `vitality` | Vitality bonus. Sheet S13 column AM "Vitality". |  |
| 0x07 | 1 | u8 | `speed` | Speed bonus. Sheet S13 column AN "Speed". |  |
| 0x08 | 4 | bf32 | `statusEffects` | Statuses granted while equipped (auto-status). Sheet S13 column AO "Equip Status". | `StatusEffectFlags` |
| 0x0C | 4 | bf32 | `statusEffectImmunities` | Status immunities granted. Sheet S13 column AP "Immune Status". | `StatusEffectFlags` |
| 0x10 | 1 | bf8 | `elementAbsorb` | Elements absorbed. Sheet S13 column AQ "Absorb Ele". | `ElementFlags` |
| 0x11 | 1 | bf8 | `elementImmune` | Elements nullified. Sheet S13 column AR "Immune Ele". | `ElementFlags` |
| 0x12 | 1 | bf8 | `elementHalfDamage` | Elements halved. Sheet S13 column AS "Half Ele". | `ElementFlags` |
| 0x13 | 1 | bf8 | `elementWeak` | Elemental weaknesses. Sheet S13 column AT "Weak Ele". | `ElementFlags` |
| 0x14 | 1 | bf8 | `elementPotency` | Elements whose damage is boosted. Sheet S13 column AU "Potency". | `ElementFlags` |
| 0x15 | 3 | bytes | `unused15` | Padding; the Workshop writes three zero bytes. |  |

#### Bits of `attribute.statusEffects` (bf32 at 0x08; bit 0 = least significant)

| Bit(s) | Name | Enum / meaning |
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

#### Bits of `attribute.statusEffectImmunities` (bf32 at 0x0C; bit 0 = least significant)

| Bit(s) | Name | Enum / meaning |
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

#### Bits of `attribute.elementAbsorb` (bf8 at 0x10; bit 0 = least significant)

| Bit(s) | Name | Enum / meaning |
|---|---|---|
| 0 | `fire` |  |
| 1 | `lightning` |  |
| 2 | `ice` |  |
| 3 | `earth` |  |
| 4 | `water` |  |
| 5 | `wind` |  |
| 6 | `holy` |  |
| 7 | `dark` |  |

#### Bits of `attribute.elementImmune` (bf8 at 0x11; bit 0 = least significant)

| Bit(s) | Name | Enum / meaning |
|---|---|---|
| 0 | `fire` |  |
| 1 | `lightning` |  |
| 2 | `ice` |  |
| 3 | `earth` |  |
| 4 | `water` |  |
| 5 | `wind` |  |
| 6 | `holy` |  |
| 7 | `dark` |  |

#### Bits of `attribute.elementHalfDamage` (bf8 at 0x12; bit 0 = least significant)

| Bit(s) | Name | Enum / meaning |
|---|---|---|
| 0 | `fire` |  |
| 1 | `lightning` |  |
| 2 | `ice` |  |
| 3 | `earth` |  |
| 4 | `water` |  |
| 5 | `wind` |  |
| 6 | `holy` |  |
| 7 | `dark` |  |

#### Bits of `attribute.elementWeak` (bf8 at 0x13; bit 0 = least significant)

| Bit(s) | Name | Enum / meaning |
|---|---|---|
| 0 | `fire` |  |
| 1 | `lightning` |  |
| 2 | `ice` |  |
| 3 | `earth` |  |
| 4 | `water` |  |
| 5 | `wind` |  |
| 6 | `holy` |  |
| 7 | `dark` |  |

#### Bits of `attribute.elementPotency` (bf8 at 0x14; bit 0 = least significant)

| Bit(s) | Name | Enum / meaning |
|---|---|---|
| 0 | `fire` |  |
| 1 | `lightning` |  |
| 2 | `ice` |  |
| 3 | `earth` |  |
| 4 | `water` |  |
| 5 | `wind` |  |
| 6 | `holy` |  |
| 7 | `dark` |  |

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
- Sheet values are decimal; Model ID is the s32 model field as one number (e.g. 7799017 = 0x0077_00E9).
- Attrib ID in the sheet is the attribute index; the file stores index*24 (attributeLink). Use enum AttributeLinkOffset on the stored field.

## Known unknowns

- Bytes 0x00-0x01, 0x05, 0x0A-0x0D, 0x14-0x17, 0x24, 0x2E-0x2F and every variant block byte not listed for a variant are never interpreted.
- flags bits 0 and 3 are unnamed; the Workshop drops them on write.
- Meaning of metal (0x10) beyond its name; optimizationTiebreaker semantics are inferred from the name.
- Whether vanilla files always place the attribute table directly after the equipment records (the Workshop assumes so on write but reads header.offset18).
- Whether attribute records may be shared intentionally by the game for anything beyond saving space.
- Message 850-865: a third-party editor did not save ammunition edits; that was a tool bug, not a format issue.
- The S13 sheet has no raw bytes; columns were matched to fields by name and order only (unlike the S14/S57 sheets, which carry the record hex).
- Byte 0x24 ("Unused" in the sheet, unknown24 in battlepack-s13) is non-zero for 109 weapons with a value that follows weapon type; its meaning is unknown.
- The sheet's B column prefix (4096+id) and the Description Calculator keys ({4096+id, "..."}) are a text id for equipment help text, but which text table they index is not stated (the stored name field uses 2048+).
- Attribute sets 0-175 come from AO (176 rows); whether vanilla has more attribute records than that is not shown.
