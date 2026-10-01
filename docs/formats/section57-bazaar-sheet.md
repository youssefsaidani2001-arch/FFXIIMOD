# Battlepack section 57 - bazaar goods (sheet-verified view)

Spec id: `section57-bazaar-sheet` · machine spec: [`section57-bazaar-sheet.json`](./section57-bazaar-sheet.json)

> **FILE FORMAT** (battlepack section 57). Layout identical to [`battlepack-s57-bazaar-goods`](./battlepack-s57-bazaar-goods.md); this spec confirms every field offset against the vanilla bytes in the sheet and adds the vanilla catalogue.

## What this is

The bazaar sells "goods": packages of items/equipment/key items unlocked by selling loot. Each good is one 36-byte record: name and help text ids, up to three received contents with quantities, a gil price, a type (non-repeatable / repeatable / monograph), up to three loot ingredients with quantities, and a menu icon. The "Vanilla Section 57 w/ Binary Calculator" sheet holds the raw 36 bytes of every vanilla good (column A), the decoded fields, a decoder tab for content ids/little-endian numbers and a dumper tab that rebuilds the bytes from the fields.

## Sources

Every sheet was read in full through an `.xlsx` export of the Drive file (the plain-text read only returns a ~50-row sample, so it was used only to confirm the tab names). Citations are `KEY Tab!rN` (sheet row N, 1-based as shown in Google Sheets) or `KEY Tab!COL` for a whole column; `msg N` is the index of a message in the #wip-general Discord export; `Drive x.lua:L` is a line of a Lua file from the shared Drive folder; `TK Lnnn` is a line of `docs/research/insurgents_toolkit_reference.md`; `Lists: X` is `editor/data/lists.json`.

| Key | Source | What was used |
|---|---|---|
| `S57` | Google Sheet "Vanilla Section 57 w/ Binary Calculator" (Drive id `1joQbsDI60eVm4eOY93k61TgmQJbckrCSasdEiX9_j6g`) | tabs Bazaar Calculator (raw 36-byte hex per good), Data, Decoder, Vanilla Dumpers |
| `battlepack-s57-bazaar-goods` | docs/formats (Workshop + Toolkit) | binary layout, copied into this JSON |
| `enums-content-ids` | docs/formats | content id categories (0xD000 = bazaar good) |

## Container

```
battle_pack.bin (ps2data/image/ff12/test_battle/<lang>/binaryfile/battle_pack.bin) -> section 57:
  0x00   st2e header, 32 bytes. Vanilla copy in the sheet (S57 Bazaar Calculator!A1):
         73 74 32 65 | 80 00 00 00 | 24 00 | 00 00 | 20 00 00 00 | 00 00 00 00 | 20 12 00 00 | 00 x 12
         magic 'st2e', entryCount 128, entrySize 36, entryListOffset 0x20, +0x14 = 0x1220
  0x20   bazaarGood[128], 36 bytes each (ends at 0x1220)
         zero padding to 16
```

See [`container-battlepack`](./container-battlepack.md) and [`container-st2e`](./container-st2e.md). Changing the number of goods changes the section length: update entryCount and every later battlepack offset. Nothing else points into the section; other data refers to goods by content id 0xD000 + row.

## Field verification

Every decoded column of the Bazaar Calculator tab was matched against the raw bytes of all 128 vanilla rows; each matches exactly one offset:

| Sheet column | Header | Offset | Width | Field |
|---|---|---|---|---|
| F | 61/09 link (Bazaar Name) | 0x00 | 2 | name |
| G | menu00.bin link (Bazaar Description) | 0x02 | 2 | description |
| H | Reward 1 | 0x04 | 2 | package1Content |
| I | Count 1 | 0x06 | 2 | package1Quantity |
| J | Reward 2 | 0x08 | 2 | package2Content |
| K | Count 2 | 0x0A | 2 | package2Quantity |
| L | Reward 3 | 0x0C | 2 | package3Content |
| M | Count 3 | 0x0E | 2 | package3Quantity |
| N | Gil Cost | 0x10 | 4 | gilCost |
| O | 0: Non-repeatable 1: Repeatable 2: Monograph | 0x14 | 2 | flags (type bits 0-1) |
| P | Ingredient 1 | 0x16 | 2 | ingredient1Content |
| Q | Count 1 | 0x18 | 2 | ingredient1Quantity |
| R | Ingredient 2 | 0x1A | 2 | ingredient2Content |
| S | Count 2 | 0x1C | 2 | ingredient2Quantity |
| T | Ingredient 3 | 0x1E | 2 | ingredient3Content |
| U | Count 3 | 0x20 | 2 | ingredient3Quantity |
| V | Icon | 0x22 | 2 | icon |

Text ids follow the row: name = 18432 + row (0x4800, "Section 61/09"), help = 22000 + row ("menu00.bin"). Icon 120 ("Bazaar Good") is used by every vanilla good.

## Vanilla goods (S57 Bazaar Calculator!r2-r129)

| Row | Name | Name text | Help text | Receives | Gil | Type | Ingredients | Icon | Source |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Antidote Set | 18432 | 22000 | 3x Antidote | 100 | non-repeatable | 2x Drab Wool | Bazaar Good | S57 Bazaar Calculator!r2 |
| 1 | Unassuming Surcoat | 18433 | 22001 | 1x Chromed Leathers | 100 | non-repeatable | 2x Wolf Pelt, 1x Earth Stone | Bazaar Good | S57 Bazaar Calculator!r3 |
| 2 | Gilt Shield | 18434 | 22002 | 1x Buckler | 250 | non-repeatable | 3x Molting, 3x Fire Stone | Bazaar Good | S57 Bazaar Calculator!r4 |
| 3 | Tail of the Phoenix | 18435 | 22003 | 2x Phoenix Down | 400 | non-repeatable | 3x Small Feather | Bazaar Good | S57 Bazaar Calculator!r5 |
| 4 | First-aid Kit | 18436 | 22004 | 2x Phoenix Down, 2x Potion | 450 | non-repeatable | 3x Large Feather | Bazaar Good | S57 Bazaar Calculator!r6 |
| 5 | Assorted Leathers | 18437 | 22005 | 1x Leather Breastplate, 1x Leather Headgear | 300 | non-repeatable | 2x Wolf Pelt, 1x Tanned Hide, 2x Dark Stone | Bazaar Good | S57 Bazaar Calculator!r7 |
| 6 | Bow & Bodkin | 18438 | 22006 | 1x Parallel Arrows, 1x Shortbow | 400 | non-repeatable | 1x Bat Fang, 2x Rat Pelt, 2x Dark Stone | Bazaar Good | S57 Bazaar Calculator!r8 |
| 7 | Eye Drop Set | 18439 | 22007 | 3x Eye Drops | 100 | non-repeatable | 2x Demon Eyeball | Bazaar Good | S57 Bazaar Calculator!r9 |
| 8 | Marksman's Delight | 18440 | 22008 | 1x Silent Shot, 1x Capella | 550 | non-repeatable | 2x Fish Scale, 1x Green Liquid, 3x Dark Stone | Bazaar Good | S57 Bazaar Calculator!r10 |
| 9 | Light Spear | 18441 | 22009 | 1x Javelin | 310 | non-repeatable | 2x Horn, 2x Foul Flesh, 3x Wind Stone | Bazaar Good | S57 Bazaar Calculator!r11 |
| 10 | Iron-forged Blade | 18442 | 22010 | 1x Iron Sword | 650 | non-repeatable | 3x Iron Scraps, 2x Foul Flesh, 3x Earth Stone | Bazaar Good | S57 Bazaar Calculator!r12 |
| 11 | Tinctures & Tonics | 18443 | 22011 | 5x Potion, 3x Handkerchief, 3x Gold Needle | 700 | non-repeatable | 4x Succulent Fruit | Bazaar Good | S57 Bazaar Calculator!r13 |
| 12 | Arrows Alight | 18444 | 22012 | 1x Fiery Arrows, 1x Longbow | 2800 | non-repeatable | 2x Crooked Fang, 4x Fire Stone | Bazaar Good | S57 Bazaar Calculator!r14 |
| 13 | Rain of Tears | 18445 | 22013 | 1x Aqua Shot, 1x Vega | 800 | non-repeatable | 1x Yensa Scale, 3x Green Liquid, 4x Water Stone | Bazaar Good | S57 Bazaar Calculator!r15 |
| 14 | Wooden Pole | 18446 | 22014 | 1x Cypress Pole | 480 | non-repeatable | 5x Bone Fragment, 3x Succulent Fruit, 4x Earth Stone | Bazaar Good | S57 Bazaar Calculator!r16 |
| 15 | Eye Openers | 18447 | 22015 | 5x Phoenix Down, 5x Prince's Kiss | 1280 | non-repeatable | 4x Chocobo Feather | Bazaar Good | S57 Bazaar Calculator!r17 |
| 16 | Crimson Blade | 18448 | 22016 | 1x Karkata | 4444 | non-repeatable | 2x Solid Stone, 3x Vampyr Fang, 15x Dark Crystal | Bazaar Good | S57 Bazaar Calculator!r18 |
| 17 | Traveler's Garb | 18449 | 22017 | 1x Feathered Cap, 1x Traveler's Vestment | 1890 | non-repeatable | 2x Braid Wool, 2x Tanned Hide, 5x Water Stone | Bazaar Good | S57 Bazaar Calculator!r19 |
| 18 | Golden Garb | 18450 | 22018 | 1x Golden Helm, 1x Golden Armor, 1x Golden Shield | 3980 | non-repeatable | 3x Iron Carapace, 2x Tanned Hide, 3x Dark Magicite | Bazaar Good | S57 Bazaar Calculator!r20 |
| 19 | Matching Reds | 18451 | 22019 | 1x Red Cap, 1x Brigandine | 2480 | non-repeatable | 3x Coeurl Pelt, 2x Quality Hide, 3x Dark Magicite | Bazaar Good | S57 Bazaar Calculator!r21 |
| 20 | Smelling Salts, &c. | 18452 | 22020 | 4x Hi-Potion, 2x Nu Khai Sand | 540 | non-repeatable | 4x Malboro Vine | Bazaar Good | S57 Bazaar Calculator!r22 |
| 21 | Burning Blade | 18453 | 22021 | 1x Flametongue | 2025 | non-repeatable | 2x Lumber, 2x Malboro Vine, 6x Fire Stone | Bazaar Good | S57 Bazaar Calculator!r23 |
| 22 | Sipping Wine | 18454 | 22022 | 3x Bacchus's Wine | 240 | non-repeatable | 2x Tyrant Hide | Bazaar Good | S57 Bazaar Calculator!r24 |
| 23 | Hollow-shaft Arrows | 18455 | 22023 | 1x Bamboo Arrows, 1x Loxley Bow | 3980 | non-repeatable | 5x Bat Fang, 1x Yellow Liquid, 3x Water Magicite | Bazaar Good | S57 Bazaar Calculator!r25 |
| 24 | Burnished Protectives | 18456 | 22024 | 1x Burgonet, 1x Shielded Armor, 1x Ice Shield | 4850 | non-repeatable | 2x Wyrm Carapace, 2x Quality Hide, 4x Earth Magicite | Bazaar Good | S57 Bazaar Calculator!r26 |
| 25 | Burning Fangs | 18457 | 22025 | 5x Soleil Fang | 980 | non-repeatable | 2x Pointed Horn | Bazaar Good | S57 Bazaar Calculator!r27 |
| 26 | Alluring Finery | 18458 | 22026 | 1x Lamia's Tiara, 1x Enchanter's Habit | 3180 | non-repeatable | 3x Fine Wool, 1x Tyrant Hide, 4x Ice Magicite | Bazaar Good | S57 Bazaar Calculator!r28 |
| 27 | Monk's Garb | 18459 | 22027 | 1x Headband, 1x Jujitsu Gi | 3180 | non-repeatable | 4x Coeurl Pelt, 2x Tyrant Hide, 4x Ice Magicite | Bazaar Good | S57 Bazaar Calculator!r29 |
| 28 | Ranger's Crossbow | 18460 | 22028 | 1x Long Bolts, 1x Crossbow | 1080 | non-repeatable | 4x Crooked Fang, 2x Yellow Liquid, 1x Ice Stone | Bazaar Good | S57 Bazaar Calculator!r30 |
| 29 | Iron-forged Pole | 18461 | 22029 | 1x Iron Pole | 2115 | non-repeatable | 5x Sturdy Bone, 3x Demon Eyeball, 4x Fire Magicite | Bazaar Good | S57 Bazaar Calculator!r31 |
| 30 | Triage Kit | 18462 | 22030 | 12x Phoenix Down, 3x Hi-Potion | 2980 | non-repeatable | 3x Giant Feather | Bazaar Good | S57 Bazaar Calculator!r32 |
| 31 | Magick Shards | 18463 | 22031 | 5x Aquara Mote | 1480 | non-repeatable | 4x Festering Flesh | Bazaar Good | S57 Bazaar Calculator!r33 |
| 32 | Ninja Garb | 18464 | 22032 | 1x Black Cowl, 1x Black Garb | 4800 | non-repeatable | 4x Fine Wool, 2x Tanned Tyrant Hide, 5x Fire Magicite | Bazaar Good | S57 Bazaar Calculator!r34 |
| 33 | Light & Sturdy Garb | 18465 | 22033 | 1x Adamant Hat, 1x Adamant Vest | 5800 | non-repeatable | 6x Coeurl Pelt, 2x Tanned Tyrant Hide, 5x Storm Magicite | Bazaar Good | S57 Bazaar Calculator!r35 |
| 34 | Huntsman's Crossbow | 18466 | 22034 | 1x Stone Bolts, 1x Recurve Crossbow | 3500 | non-repeatable | 1x Bundle of Needles, 2x Festering Flesh, 5x Ice Magicite | Bazaar Good | S57 Bazaar Calculator!r36 |
| 35 | Jag-tooth Ninja Sword | 18467 | 22035 | 1x Kagenui | 3800 | non-repeatable | 5x Giant Feather, 4x Festering Flesh, 5x Dark Magicite | Bazaar Good | S57 Bazaar Calculator!r37 |
| 36 | Survival Set | 18468 | 22036 | 12x Antidote, 12x Eye Drops, 12x Echo Herbs | 1500 | non-repeatable | 4x Malboro Fruit | Bazaar Good | S57 Bazaar Calculator!r38 |
| 37 | Soul of the Fire-bird | 18469 | 22037 | 25x Phoenix Down | 5980 | non-repeatable | 3x Bundle of Feathers | Bazaar Good | S57 Bazaar Calculator!r39 |
| 38 | Emboldening Arms | 18470 | 22038 | 1x Chakra Band, 1x Power Vest | 7980 | non-repeatable | 6x Quality Pelt, 4x Tanned Giantskin, 3x Fire Crystal | Bazaar Good | S57 Bazaar Calculator!r40 |
| 39 | Platinum Gear | 18471 | 22039 | 1x Platinum Helm, 1x Platinum Armor, 1x Platinum Shield | 9800 | non-repeatable | 2x Insect Husk, 5x Tanned Giantskin, 6x Storm Magicite | Bazaar Good | S57 Bazaar Calculator!r41 |
| 40 | Noisome Incendiaries | 18472 | 22040 | 1x Poison Bombs, 1x Fumarole | 3280 | non-repeatable | 1x Bomb Shell, 3x Fire Crystal | Bazaar Good | S57 Bazaar Calculator!r42 |
| 41 | War Axe | 18473 | 22041 | 1x Francisca | 4680 | non-repeatable | 2x Pointed Horn, 4x Malboro Fruit, 6x Wind Magicite | Bazaar Good | S57 Bazaar Calculator!r43 |
| 42 | Warped Blade | 18474 | 22042 | 1x Diamond Sword | 5650 | non-repeatable | 6x Bundle of Feathers, 4x Maggoty Flesh, 6x Fire Magicite | Bazaar Good | S57 Bazaar Calculator!r44 |
| 43 | Forked Spear | 18475 | 22043 | 1x Trident | 6450 | non-repeatable | 4x Pointed Horn, 5x Maggoty Flesh, 6x Wind Magicite | Bazaar Good | S57 Bazaar Calculator!r45 |
| 44 | Mudslinger | 18476 | 22044 | 1x Mud Shot, 1x Mithuna | 120000 | non-repeatable | 2x Emperor Scale, 3x Silver Liquid, 8x Earth Crystal | Bazaar Good | S57 Bazaar Calculator!r46 |
| 45 | Oil-soaked Incendiaries | 18477 | 22045 | 1x Oil Bombs, 1x Tumulus | 10625 | non-repeatable | 3x Bomb Ashes, 2x Book of Orgain, 3x Fire Crystal | Bazaar Good | S57 Bazaar Calculator!r47 |
| 46 | Blindflight Quarrels | 18478 | 22046 | 1x Black Bolts, 1x Hunting Crossbow | 11220 | non-repeatable | 3x Spiral Incisor, 3x Silver Liquid, 3x Dark Crystal | Bazaar Good | S57 Bazaar Calculator!r48 |
| 47 | Phials & Philtres | 18479 | 22047 | 8x Serum, 16x Nu Khai Sand | 1980 | non-repeatable | 3x Malboro Flower | Bazaar Good | S57 Bazaar Calculator!r49 |
| 48 | Potion Crate | 18480 | 22048 | 30x Potion, 20x Hi-Potion, 10x X-Potion | 7480 | non-repeatable | 3x Screamroot | Bazaar Good | S57 Bazaar Calculator!r50 |
| 49 | Gigas Gear | 18481 | 22049 | 1x Gigas Hat, 1x Gigas Chestplate | 17800 | non-repeatable | 8x Prime Pelt, 7x Prime Tanned Hide, 7x Dark Crystal | Bazaar Good | S57 Bazaar Calculator!r51 |
| 50 | Armor-piercing Shot | 18482 | 22050 | 1x Windslicer Shot, 1x Spica | 8900 | non-repeatable | 4x Ichthon Scale, 5x Silver Liquid, 7x Wind Crystal | Bazaar Good | S57 Bazaar Calculator!r52 |
| 51 | Permafrost Bow & Quiver | 18483 | 22051 | 1x Icecloud Arrows, 1x Perseus Bow | 17200 | non-repeatable | 4x Spiral Incisor, 2x Antarctic Wind, 7x Ice Crystal | Bazaar Good | S57 Bazaar Calculator!r53 |
| 52 | Befuddling Incendiaries | 18484 | 22052 | 1x Chaos Bombs, 1x Caldera | 3800 | non-repeatable | 4x Bomb Shell, 3x Book of Orgain-Cent, 7x Fire Crystal | Bazaar Good | S57 Bazaar Calculator!r54 |
| 53 | Mystic Staff | 18485 | 22053 | 1x Cloud Staff | 3600 | non-repeatable | 4x Quality Lumber, 6x Demon Feather, 7x Storm Crystal | Bazaar Good | S57 Bazaar Calculator!r55 |
| 54 | Elegant Pole | 18486 | 22054 | 1x Ivory Pole | 7980 | non-repeatable | 8x Blood-darkened Bone, 6x Demon Feather, 7x Wind Crystal | Bazaar Good | S57 Bazaar Calculator!r56 |
| 55 | Phoenix Flight | 18487 | 22055 | 50x Phoenix Down | 8750 | non-repeatable | 5x Windslicer Pinion | Bazaar Good | S57 Bazaar Calculator!r57 |
| 56 | Black Vestments | 18488 | 22056 | 1x Black Mask, 1x Black Robes | 12800 | non-repeatable | 9x Blood Wool, 7x Prime Tanned Hide, 8x Dark Crystal | Bazaar Good | S57 Bazaar Calculator!r58 |
| 57 | White Vestments | 18489 | 22057 | 1x White Mask, 1x White Robes | 12800 | non-repeatable | 9x Blood Wool, 7x Beastlord Hide, 8x Holy Crystal | Bazaar Good | S57 Bazaar Calculator!r59 |
| 58 | Nature's Armory | 18490 | 22058 | 1x Crown of Laurels, 1x Rubber Suit | 13800 | non-repeatable | 9x Prime Pelt, 7x Forbidden Flesh, 8x Fire Crystal | Bazaar Good | S57 Bazaar Calculator!r60 |
| 59 | Forbidding Shield | 18491 | 22059 | 1x Demon Shield | 7800 | non-repeatable | 2x Aged Turtle Shell, 8x Destrier Barding, 1x Leamonde Halcyon | Bazaar Good | S57 Bazaar Calculator!r61 |
| 60 | Sturdy Battle Gear | 18492 | 22060 | 1x Maximillian | 8000 | non-repeatable | 4x Charger Barding, 2x Split Armor, 3x Pisces Gem | Bazaar Good | S57 Bazaar Calculator!r62 |
| 61 | Magepower Helm | 18493 | 22061 | 1x Magepower Shishak | 7500 | non-repeatable | 5x Charger Barding, 2x Chimera Head, 1x Feystone | Bazaar Good | S57 Bazaar Calculator!r63 |
| 62 | Scout's Crossbow | 18494 | 22062 | 1x Time Bolts, 1x Penetrator Crossbow | 6400 | non-repeatable | 4x Wyvern Fang, 3x Ancient Bone, 9x Holy Crystal | Bazaar Good | S57 Bazaar Calculator!r64 |
| 63 | Water-drop Munitions | 18495 | 22063 | 1x Water Bombs | 2640 | non-repeatable | 3x Book of Orgain, 3x Putrid Liquid, 10x Water Crystal | Bazaar Good | S57 Bazaar Calculator!r65 |
| 64 | Samurai's Katana | 18496 | 22064 | 1x Ame-no-Murakumo | 8400 | non-repeatable | 5x Iron Ore, 7x Screamroot, 9x Water Crystal | Bazaar Good | S57 Bazaar Calculator!r66 |
| 65 | Double-bladed Knife | 18497 | 22065 | 1x Zwill Crossblade | 7500 | non-repeatable | 5x Windslicer Pinion, 7x Malboro Flower, 9x Wind Crystal | Bazaar Good | S57 Bazaar Calculator!r67 |
| 66 | The Leering Blade | 18498 | 22066 | 1x Deathbringer | 8800 | non-repeatable | 3x Broken Sword, 7x Demon Tail, 10x Dark Crystal | Bazaar Good | S57 Bazaar Calculator!r68 |
| 67 | Attenuated Greatsword | 18499 | 22067 | 1x Save the Queen | 9200 | non-repeatable | 4x Quality Stone, 7x Sky Jewel, 10x Holy Crystal | Bazaar Good | S57 Bazaar Calculator!r69 |
| 68 | Memories of Yore | 18500 | 22068 | 99x Pebble | 999 | non-repeatable | 5x Quality Stone | Bazaar Good | S57 Bazaar Calculator!r70 |
| 69 | Devastating Incendiaries | 18501 | 22069 | 1x Castellanos | 12000 | non-repeatable | 3x Bomb Fragment, 2x Frog Oil, 3x Aries Gem | Bazaar Good | S57 Bazaar Calculator!r71 |
| 70 | Darksteel Blade | 18502 | 22070 | 1x Stoneblade | 17800 | non-repeatable | 2x Orichalcum, 2x Chimera Head, 3x Taurus Gem | Bazaar Good | S57 Bazaar Calculator!r72 |
| 71 | Arrows of the Moon Goddess | 18503 | 22071 | 1x Artemis Arrows | 1280 | non-repeatable | 2x Great Serpent's Fang, 2x Dorsal Fin, 3x Gemini Gem | Bazaar Good | S57 Bazaar Calculator!r73 |
| 72 | Serpent Blade | 18504 | 22072 | 1x Mesa | 90000 | non-repeatable | 2x Coeurl Whisker, 2x Sickle-Blade, 3x Cancer Gem | Bazaar Good | S57 Bazaar Calculator!r74 |
| 73 | Well-forged Blade | 18505 | 22073 | 1x Simha | 80000 | non-repeatable | 3x Lifewick, 4x Ring Wyrm Scale, 1x Leshach Halcyon | Bazaar Good | S57 Bazaar Calculator!r75 |
| 74 | Comfy Headgear | 18506 | 22074 | 1x Cat-ear Hood | 25000 | non-repeatable | 2x White Incense, 2x Einherjarium, 7x Virgo Gem | Bazaar Good | S57 Bazaar Calculator!r76 |
| 75 | Stone Shot | 18507 | 22075 | 1x Stone Shot | 1480 | non-repeatable | 2x Mirror Scale, 2x Tyrant Bone, 3x Libra Gem | Bazaar Good | S57 Bazaar Calculator!r77 |
| 76 | The Scorpion | 18508 | 22076 | 1x Vrscika | 70000 | non-repeatable | 3x Charged Gizzard, 3x Wyrm Bone, 4x Scorpio Gem | Bazaar Good | S57 Bazaar Calculator!r78 |
| 77 | Silver Bow | 18509 | 22077 | 1x Dhanusha | 100000 | non-repeatable | 3x Beastlord Horn, 3x Moon Ring, 4x Sagittarius Gem | Bazaar Good | S57 Bazaar Calculator!r79 |
| 78 | Piercing Bolts | 18510 | 22078 | 1x Grand Bolts | 1680 | non-repeatable | 2x Wrath of the Gods, 2x Ring Wyrm Liver, 3x Capricorn Gem | Bazaar Good | S57 Bazaar Calculator!r80 |
| 79 | Cursed Necklace | 18511 | 22079 | 1x Nihopalaoa | 28000 | non-repeatable | 3x Blood-stained Necklace, 2x Death's-Head, 3x Leo Gem | Bazaar Good | S57 Bazaar Calculator!r81 |
| 80 | Whisker of the Beast | 18512 | 22080 | 1x Kanya | 60000 | non-repeatable | 3x Mythril, 3x Corpse Fly, 4x Aquarius Gem | Bazaar Good | S57 Bazaar Calculator!r82 |
| 81 | Late-model Rifle | 18513 | 22081 | 1x Arcturus | 8000 | non-repeatable | 2x Wyvern Wing, 2x Yensa Fin, 1x Salamand Halcyon | Bazaar Good | S57 Bazaar Calculator!r83 |
| 82 | Ultimate Blade | 18514 | 22082 | 1x Ultima Blade | 12800 | non-repeatable | 2x Adamantite, 2x Death Powder, 1x Gnoma Halcyon | Bazaar Good | S57 Bazaar Calculator!r84 |
| 83 | Bow of the Moon Goddess | 18515 | 22083 | 1x Artemis Bow | 9300 | non-repeatable | 5x Solid Horn, 2x Moondust, 1x Sylphi Halcyon | Bazaar Good | S57 Bazaar Calculator!r85 |
| 84 | Brilliant Shield | 18516 | 22084 | 1x Venetian Shield | 7500 | non-repeatable | 2x Ancient Turtle Shell, 2x Ring Wyrm Liver, 1x Undin Halcyon | Bazaar Good | S57 Bazaar Calculator!r86 |
| 85 | Engraved Spear | 18517 | 22085 | 1x Gungnir | 9025 | non-repeatable | 2x Ketu Board, 2x Broken Spear, 2x Mystletainn | Bazaar Good | S57 Bazaar Calculator!r87 |
| 86 | Golden Battle Axe | 18518 | 22086 | 1x Golden Axe | 10000 | non-repeatable | 2x Electrum, 2x Broken Greataxe, 1x Mardu Halcyon | Bazaar Good | S57 Bazaar Calculator!r88 |
| 87 | Flask of Oily Liquid | 18519 | 22087 | 1x Ether | 4000 | repeatable | 2x Unpurified Ether, 3x Caramel | Bazaar Good | S57 Bazaar Calculator!r89 |
| 88 | Flask of Viscous Liquid | 18520 | 22088 | 1x Hi-Ether | 12000 | repeatable | 2x Unpurified Ether, 2x Foul Liquid, 1x Slime Oil | Bazaar Good | S57 Bazaar Calculator!r90 |
| 89 | Saint's Draught | 18521 | 22089 | 1x Elixir | 36000 | repeatable | 3x Ambrosia, 3x Demon Drink, 1x High Arcana | Bazaar Good | S57 Bazaar Calculator!r91 |
| 90 | Esoteric Draught | 18522 | 22090 | 1x Megalixir | 108000 | repeatable | 3x Onion, 3x Rat Tail, 2x High Arcana | Bazaar Good | S57 Bazaar Calculator!r92 |
| 91 | Life Crystal | 18523 | 22091 | 1x High Arcana | 9999 | repeatable | 10x Arcana, 1x Feystone, 1x Soul of Thamasa | Bazaar Good | S57 Bazaar Calculator!r93 |
| 92 | Jewel of the Serpent | 18524 | 22092 | 1x Serpentarius | 19998 | repeatable | 4x Snake Skin, 2x Serpent Eye, 1x High Arcana | Bazaar Good | S57 Bazaar Calculator!r94 |
| 93 | Jewel of Creation | 18525 | 22093 | 1x Empyreal Soul | 29997 | repeatable | 1x Soul Powder, 2x Wargod's Band, 1x High Arcana | Bazaar Good | S57 Bazaar Calculator!r95 |
| 94 | Matchless Metal | 18526 | 22094 | 1x Gemsteel | 29997 | repeatable | 1x Scarletite, 2x Damascus Steel, 2x Hell-Gate's Flame | Bazaar Good | S57 Bazaar Calculator!r96 |
| 95 | Master-crafted Blade | 18527 | 22095 | 1x Kumbha | 350000 | non-repeatable | 2x Gemsteel, 3x Orichalcum, 2x Mallet | Bazaar Good | S57 Bazaar Calculator!r97 |
| 96 | The Sunflower | 18528 | 22096 | 1x Tournesol | 600000 | non-repeatable | 3x Gemsteel, 3x Empyreal Soul, 3x Serpentarius | Bazaar Good | S57 Bazaar Calculator!r98 |
| 97 | Dragon Crest | 18529 | 22097 | 1x Wyrmhero Blade | 65535 | non-repeatable | 1x Omega Badge, 1x Godslayer's Badge, 1x Lu Shang's Badge | Bazaar Good | S57 Bazaar Calculator!r99 |
| 98 | Mysterious Substance | 18530 | 22098 | 1x Dark Energy | 14999 | non-repeatable | 3x Grimoire Togail, 3x Grimoire Aidhed, 1x Bat Wing | Bazaar Good | S57 Bazaar Calculator!r100 |
| 99 | Forgotten Grimoire (Hunter) | 18531 | 22099 | 1x Hunter's Monograph | 18000 | monograph |  | Bazaar Good | S57 Bazaar Calculator!r101 |
| 100 | Forgotten Grimoire (Knight) | 18532 | 22100 | 1x Knight's Monograph | 19000 | monograph |  | Bazaar Good | S57 Bazaar Calculator!r102 |
| 101 | Forgotten Grimoire (Dragoon) | 18533 | 22101 | 1x Dragoon's Monograph | 22000 | monograph |  | Bazaar Good | S57 Bazaar Calculator!r103 |
| 102 | Forgotten Grimoire (Sage) | 18534 | 22102 | 1x Sage's Monograph | 25000 | monograph |  | Bazaar Good | S57 Bazaar Calculator!r104 |
| 103 | Magick Shard (Holy Mote) | 18535 | 22103 | 1x Holy Mote | 99 | repeatable | 8x Glass Jewel, 8x Sky Jewel, 1x Diakon Halcyon | Bazaar Good | S57 Bazaar Calculator!r105 |
| 104 | Magick Shard (Scathe Mote) | 18536 | 22104 | 1x Scathe Mote | 499 | repeatable | 8x Book of Orgain, 8x Book of Orgain-Cent, 8x Book of Orgain-Mille | Bazaar Good | S57 Bazaar Calculator!r106 |
| 105 | Potion Pack | 18537 | 22105 | 2x Potion | 70 | non-repeatable | 2x Cactus Fruit | Bazaar Good | S57 Bazaar Calculator!r107 |
| 106 | Hi-Potion Pack | 18538 | 22106 | 10x Hi-Potion | 1111 | repeatable | 1x Rainbow Egg | Bazaar Good | S57 Bazaar Calculator!r108 |
| 107 | Chronos Tear Pack | 18539 | 22107 | 10x Chronos Tear | 333 | repeatable | 1x Eye of the Hawk | Bazaar Good | S57 Bazaar Calculator!r109 |
| 108 | Fire-bird's Whisper | 18540 | 22108 | 10x Phoenix Down | 2222 | repeatable | 1x Jack-o'-Lantern | Bazaar Good | S57 Bazaar Calculator!r110 |
| 109 | Serum Pack | 18541 | 22109 | 10x Serum | 999 | repeatable | 1x Demon's Sigh | Bazaar Good | S57 Bazaar Calculator!r111 |
| 110 | X-Potion Pack | 18542 | 22110 | 10x X-Potion | 4444 | repeatable | 1x Behemoth Steak | Bazaar Good | S57 Bazaar Calculator!r112 |
| 111 | Shell-worked Collar | 18543 | 22111 | 1x Turtleshell Choker | 6000 | non-repeatable | 2x Bomb Shell, 2x Four-leaf Clover | Bazaar Good | S57 Bazaar Calculator!r113 |
| 112 | Ninja Footgear | 18544 | 22112 | 1x Gillie Boots | 400 | non-repeatable | 2x Slaven Harness | Bazaar Good | S57 Bazaar Calculator!r114 |
| 113 | Brawler's Fetish | 18545 | 22113 | 1x Amber Armlet | 3000 | non-repeatable | 2x Gimble Stalk | Bazaar Good | S57 Bazaar Calculator!r115 |
| 114 | Blush of Light | 18546 | 22114 | 1x Firefly | 1200 | non-repeatable | 2x Tomato Stalk, 1x Magick Lamp, 1x Snowfly | Bazaar Good | S57 Bazaar Calculator!r116 |
| 115 | Shoes of the Dead | 18547 | 22115 | 1x Quasimodo Boots | 450 | non-repeatable | 1x Zombie Powder, 1x Destrier Mane | Bazaar Good | S57 Bazaar Calculator!r117 |
| 116 | Back Harness | 18548 | 22116 | 1x Battle Harness | 600 | non-repeatable | 1x Throat Wolf Blood | Bazaar Good | S57 Bazaar Calculator!r118 |
| 117 | Large Gloves | 18549 | 22117 | 1x Blazer Gloves | 2000 | non-repeatable | 3x Bent Staff | Bazaar Good | S57 Bazaar Calculator!r119 |
| 118 | Chain-link Belt | 18550 | 22118 | 1x Bubble Belt | 17820 | non-repeatable | 2x Battlewyrm Carapace, 1x Adamantite | Bazaar Good | S57 Bazaar Calculator!r120 |
| 119 | Wind Walkers | 18551 | 22119 | 1x Hermes Sandals | 18000 | non-repeatable | 33x Gysahl Greens, 15x Arcana | Bazaar Good | S57 Bazaar Calculator!r121 |
| 120 | Wing Cord | 18552 | 22120 | 1x Pheasant Netsuke | 2000 | non-repeatable | 2x Stardust | Bazaar Good | S57 Bazaar Calculator!r122 |
| 121 | Gilt Phylactery | 18553 | 22121 | 1x Golden Amulet | 3000 | non-repeatable | 1x Tattered Garment | Bazaar Good | S57 Bazaar Calculator!r123 |
| 122 | Exquisite Ring | 18554 | 22122 | 1x Opal Ring | 7800 | non-repeatable | 2x Frogspawn | Bazaar Good | S57 Bazaar Calculator!r124 |
| 123 | Feathered Boots | 18555 | 22123 | 1x Winged Boots | 300 | non-repeatable | 1x Arctic Wind | Bazaar Good | S57 Bazaar Calculator!r125 |
| 124 | Forgotten Grimoire (Mage) | 18556 | 22124 | 1x Mage's Monograph | 21000 | monograph |  | Bazaar Good | S57 Bazaar Calculator!r126 |
| 125 | Forgotten Grimoire (Warmage) | 18557 | 22125 | 1x Warmage's Monograph | 20000 | monograph |  | Bazaar Good | S57 Bazaar Calculator!r127 |
| 126 | Forgotten Grimoire (Scholar) | 18558 | 22126 | 1x Scholar's Monograph | 22000 | monograph |  | Bazaar Good | S57 Bazaar Calculator!r128 |
| 127 | Morbid Urn | 18559 | 22127 | 1x Canopic Jar | 250000 | non-repeatable | 1x Horakhty's Flame, 1x Phobos Glaze, 1x Deimos Clay | Bazaar Good | S57 Bazaar Calculator!r129 |

## Record layouts (copied from battlepack-s57-bazaar-goods, with sheet columns)

### Record `header` — 32 bytes (0x20), count: 1

*Where:* Offset 0 of battlepack section 57.

| Offset | Size | Type | Name | Meaning (source) | Enum |
|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `magic` | ASCII 'st2e' (73 74 32 65); reject the section if different. |  |
| 0x04 | 4 | u32 | `entryCount` | Number of bazaar goods (128 in the vanilla game, TK L836). |  |
| 0x08 | 2 | u16 | `entrySize` | Bytes per entry; 36 (0x24) for this section. |  |
| 0x0A | 2 | bytes | `unknown0A` | Not interpreted; keep. |  |
| 0x0C | 4 | u32 | `entryListOffset` | Offset of entry 0 from the section start: 32 when entryCount > 0, else 0. |  |
| 0x10 | 4 | u32 | `offset10` | Unknown offset slot (0 in Workshop output). |  |
| 0x14 | 4 | u32 | `textSectionOffset` | Inline text offset; 0 on disk for this section (filled at run time). No strings are stored here. The S57 sheet's copy of the vanilla header (S57 Bazaar Calculator!A1) has 0x1220 here = 32 + 128*36, the end of the entries; the S14 header copy has 0. |  |
| 0x18 | 4 | u32 | `offset18` | Unknown offset slot (0 in Workshop output for this section). |  |
| 0x1C | 4 | u32 | `offset1C` | Unknown offset slot (0 in Workshop output). |  |

### Record `bazaarGood` — 36 bytes (0x24), count: header.entryCount (vanilla 128)

*Where:* st2e entries of section 57: header.entryListOffset + i*36

| Offset | Size | Type | Name | Meaning (source) | Enum |
|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `name` | Name text id (bazaar block, 18432+). Sheet S57 Bazaar Calculator column F "61/09 link (Bazaar Name)"; offset verified against the raw bytes of all 128 vanilla goods. | `DescBazaarGoodList` |
| 0x02 | 2 | u16 | `description` | Help text id (bazaar help block, 22000+). Sheet S57 Bazaar Calculator column G "menu00.bin link (Bazaar Description)"; offset verified against the raw bytes of all 128 vanilla goods. | `MenuBazaarGoodList` |
| 0x04 | 2 | u16 | `package1Content` | Content id received (slot 1); content ids are category<<12 \| index. Sheet S57 Bazaar Calculator column H "Reward 1"; offset verified against the raw bytes of all 128 vanilla goods. Vanilla empty slots are content 0 (Potion) with quantity 0, not 0xFFFF (S57 Bazaar Calculator!J-M, R-U). | `ContAllList` |
| 0x06 | 2 | u16 | `package1Quantity` | Quantity of package slot 1. Sheet S57 Bazaar Calculator column I "Count 1"; offset verified against the raw bytes of all 128 vanilla goods. |  |
| 0x08 | 2 | u16 | `package2Content` | Content id received (slot 2); content ids are category<<12 \| index. Sheet S57 Bazaar Calculator column J "Reward 2"; offset verified against the raw bytes of all 128 vanilla goods. Vanilla empty slots are content 0 (Potion) with quantity 0, not 0xFFFF (S57 Bazaar Calculator!J-M, R-U). | `ContAllList` |
| 0x0A | 2 | u16 | `package2Quantity` | Quantity of package slot 2. Sheet S57 Bazaar Calculator column K "Count 2"; offset verified against the raw bytes of all 128 vanilla goods. |  |
| 0x0C | 2 | u16 | `package3Content` | Content id received (slot 3); content ids are category<<12 \| index. Sheet S57 Bazaar Calculator column L "Reward 3"; offset verified against the raw bytes of all 128 vanilla goods. Vanilla empty slots are content 0 (Potion) with quantity 0, not 0xFFFF (S57 Bazaar Calculator!J-M, R-U). | `ContAllList` |
| 0x0E | 2 | u16 | `package3Quantity` | Quantity of package slot 3. Sheet S57 Bazaar Calculator column M "Count 3"; offset verified against the raw bytes of all 128 vanilla goods. |  |
| 0x10 | 4 | u32 | `gilCost` | Gil price of the bazaar good. Sheet S57 Bazaar Calculator column N "Gil Cost"; offset verified against the raw bytes of all 128 vanilla goods. |  |
| 0x14 | 2 | bf16 | `flags` | Only bits 0-1 are known; the Workshop rebuilds the word from the type alone (bits 2-15 become 0). Sheet S57 Bazaar Calculator column O "0: Non-repeatable 1: Repeatable 2: Monograph"; offset verified against the raw bytes of all 128 vanilla goods. | bits below |
| 0x16 | 2 | u16 | `ingredient1Content` | Content id of required ingredient 1 (normally loot, block 0x2000). Sheet S57 Bazaar Calculator column P "Ingredient 1"; offset verified against the raw bytes of all 128 vanilla goods. Vanilla empty slots are content 0 (Potion) with quantity 0, not 0xFFFF (S57 Bazaar Calculator!J-M, R-U). | `ContAllList` |
| 0x18 | 2 | u16 | `ingredient1Quantity` | Required quantity of ingredient 1. Sheet S57 Bazaar Calculator column Q "Count 1"; offset verified against the raw bytes of all 128 vanilla goods. |  |
| 0x1A | 2 | u16 | `ingredient2Content` | Content id of required ingredient 2 (normally loot, block 0x2000). Sheet S57 Bazaar Calculator column R "Ingredient 2"; offset verified against the raw bytes of all 128 vanilla goods. Vanilla empty slots are content 0 (Potion) with quantity 0, not 0xFFFF (S57 Bazaar Calculator!J-M, R-U). | `ContAllList` |
| 0x1C | 2 | u16 | `ingredient2Quantity` | Required quantity of ingredient 2. Sheet S57 Bazaar Calculator column S "Count 2"; offset verified against the raw bytes of all 128 vanilla goods. |  |
| 0x1E | 2 | u16 | `ingredient3Content` | Content id of required ingredient 3 (normally loot, block 0x2000). Sheet S57 Bazaar Calculator column T "Ingredient 3"; offset verified against the raw bytes of all 128 vanilla goods. Vanilla empty slots are content 0 (Potion) with quantity 0, not 0xFFFF (S57 Bazaar Calculator!J-M, R-U). | `ContAllList` |
| 0x20 | 2 | u16 | `ingredient3Quantity` | Required quantity of ingredient 3. Sheet S57 Bazaar Calculator column U "Count 3"; offset verified against the raw bytes of all 128 vanilla goods. |  |
| 0x22 | 2 | u16 | `icon` | Menu icon id. Sheet S57 Bazaar Calculator column V "Icon"; offset verified against the raw bytes of all 128 vanilla goods. | `BpeIconList` |

#### Bits of `bazaarGood.flags` (bf16 at 0x14; bit 0 = least significant)

| Bit(s) | Name | Enum / meaning |
|---|---|---|
| 0-1 | `type` | `BpeBazaarGoodTypeList` |

## Enums carried in the JSON spec

| Enum | Keys | Use |
|---|---|---|
| `BpeBazaarGoodTypeList` | 0-2 | flags bits 0-1 |
| `BazaarGood` | 0-127 | row labels |
| `BazaarGoodNameTextId`, `BazaarGoodDescriptionTextId` | 0-127 | vanilla text ids |
| `BazaarGoodContentId` | 0-127 | content id (0xD000 + row) used by other tables |
| `BazaarGoodVanillaRecipe` | 0-127 | vanilla contents / price / ingredients, for reference |

Content fields use `ContAllList` and the icon uses `BpeIconList` from editor/data/lists.json (the sheet's Data tab carries the same lists: 6103 content names, 173 icons).

## Round-trip rules

- Edit fields in place; the record size is fixed and nothing in this section points at entries, so value edits never move data.
- Copy every byte that no field interprets (unknown*/unused*/padding, unnamed bits) from the original; the Workshop writer zero-fills them (it seeks over them), so do not use its output as the byte-identical reference.
- Keep the st2e header bytes verbatim except entryCount (and entryListOffset when the count goes to/from 0).
- Keep the trailing zero padding that rounds the section to a multiple of 16 bytes.
- If the section length changes (added/removed entries), rewrite the battlepack offset table: every later section offset and the end offset shift by the padded size delta.
- Keep exactly three package and three ingredient slots per row.
- flags (0x14): change only bits 0-1 and preserve bits 2-15.
- Do not reorder rows: bazaar content ids (0xD000|row) and save data refer to them by index.
- The sheet's "Vanilla Dumpers" tab rebuilds all 128 vanilla records from the field columns and reports 0 mismatches (S57 Vanilla Dumpers!B1:C1): the field list covers every byte of the record (byte 0x13, the top byte of gilCost, and byte 0x15, the high byte of flags, are zero in vanilla).
- Empty package/ingredient slots: write content 0 with quantity 0, as vanilla does.

## Known unknowns

- flags bits 2-15 are unnamed; the Workshop drops them on write.
- Which ingredient-sale counter the game compares against (loot sold counters in the save) is not documented here.
- Vanilla value of header +0x14: the sheet's header copy shows 0x1220 (end of entries) while battlepack-s57 expects 0; check against a real file before writing headers.
- gilCost is u32: vanilla prices use up to three bytes (byte 0x12 is non-zero for prices >= 65536, e.g. Morbid Urn 250000); byte 0x13 and the flags high byte 0x15 are always 0, so their meaning is untested.
