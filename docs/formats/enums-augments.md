# Enumeration - augments (0-128)

Spec id: `enums-augments` · machine spec: [`enums-augments.json`](./enums-augments.json)

> **ENUMERATION SPEC.** Names, text ids, effects and vanilla parameter values for augment ids. No file of its own.

## What this is

Augments are passive abilities (Counter, Safety, HP +30, Battle Lore ...). Each has an id = row of battlepack **section 58** (see [`battlepack-s58-augments`](./battlepack-s58-augments.md)), which carries two text ids, a numeric parameter and a timer slot. Rows 0-63 are also the bit order of the 64-bit augment masks of party members and equipment; 64-127 are lore/boost variants and 128 is "Second Board". Equipment grants one augment through section 13 +0x1A (u8, 255 = none; [`battlepack-s13-equipment-attributes`](./battlepack-s13-equipment-attributes.md)), licence nodes grant them through section 12, and formulas 79/80 add/remove them at run time (FL Formulae!r82-r83). Modders discuss re-purposing augment effects that are hard-wired in code (Martyr is linked to section 3, msg 98; Eksir Berries disable Attack CT 0 and Attack Plus, msg 600).

## Sources

Every sheet was read in full through an `.xlsx` export of the Drive file (the plain-text read only returns a ~50-row sample, so it was used only to confirm the tab names). Citations are `KEY Tab!rN` (sheet row N, 1-based as shown in Google Sheets) or `KEY Tab!COL` for a whole column; `msg N` is the index of a message in the #wip-general Discord export; `Drive x.lua:L` is a line of a Lua file from the shared Drive folder; `TK Lnnn` is a line of `docs/research/insurgents_toolkit_reference.md`; `Lists: X` is `editor/data/lists.json`.

| Key | Source | What was used |
|---|---|---|
| `AU` | Google Sheet "Augments" (Drive id `1IaG6MYV01C2IJW9dmk54Vgrvv1mN3ZvcSpPi5y0sCxc`) | tab Augments (A1:H130) |
| `DC` | Google Sheet "Description Calculator" (Drive id `1ku-FQVUluQDJ5zyzJixcDVccjv1EsnSbQ1h2bNyv6Cw`) | tabs Descriptions (A1:BK558), Data (augment names/descriptions, weapon formula labels) |

## How the sheet maps to section 58

| Sheet column | Meaning | Section 58 field (assumed) |
|---|---|---|
| A ID | augment id = row | row index |
| E "listhelp_ability - names" | `<text id>:<name>`; vanilla text id = 13000 + id | +0x02 (u16) - called licenseDescription in battlepack-s58-augments |
| G "section61/10 - descriptions" | `<text id>:<description>`; vanilla text id = 20480 + id | +0x00 (u16) - called equipmentDescription |
| D Initial Value | vanilla strength/amount | +0x04 parameter (u16) |
| B Gear | vanilla equipment that grants it | section 13 +0x1A of those items |
| C Effect, F alternate names, H Notes | effect text, other names used by mods, stacking notes | - |

## Augment list (AU Augments!r2-r130)

| Id | Hex | Name | Name text | Alternate names | Effect | Initial value | Vanilla gear | Desc. text | Description | Notes | Source |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 0x00 | Stability | 13000 | Immune: Knockback, Surefooted | Immune: Knockback | 0 |  | 20480 | Prevents Knockback. |  | AU Augments!r2 |
| 1 | 0x01 | Safety | 13001 |  | Safety - Protects from Instant Death, Warp, Poach, Fractional damage (Gravity, Graviga), "Fang" items, Sight Unseeing, Syphon, Charm, Achilles, Bonecrusher, and makes undead enemies immune to Renew. In the original version Safety protects against Wither, Addle, and Numerology as well. | 0 |  | 20481 | Prevents Instant Death, Warp, and the like. |  | AU Augments!r3 |
| 2 | 0x02 | Accuracy Boost | 13002 | True Strike, Ignore Evade | Ignore Evade / Increases chance to hit | 0 | Cameo Belt | 20482 | Improves chance to hit. |  | AU Augments!r4 |
| 3 | 0x03 | Shield Boost | 13003 |  | Shield+ - Improves chance to block with shield | 10 |  | 20483 | Improves chance to block with a shield. |  | AU Augments!r5 |
| 4 | 0x04 | Evasion Boost | 13004 |  | Increases chance of avoiding attacks | 0 | Jade Collar | 20484 | Improves chance of avoiding attacks. |  | AU Augments!r6 |
| 5 | 0x05 | Last Stand | 13005 |  | Last Stand | 0 | Gauntlets | 20485 | Increases defense when HP Critical. | Doesn't stack with license | AU Augments!r7 |
| 6 | 0x06 | Counter | 13006 |  | Counter - Gives ability to Counter | 0 | Battle Harness, Genji Helm | 20486 | When attacked, automatically counter with weapon in hand. |  | AU Augments!r8 |
| 7 | 0x07 | Counter Boost | 13007 |  | Counter+ - Increases chances to Counter | 0 | Genji Armor | 20487 | Improves chance to counter. |  | AU Augments!r9 |
| 8 | 0x08 | Spellbreaker | 13008 |  | Spellbreaker | 0 | Leather Gorget | 20488 | Increases magick power when HP Critical. | Doesn't stack with license | AU Augments!r10 |
| 9 | 0x09 | Brawler | 13009 |  | Brawler | 0 | Amber Armlet | 20489 | Increases attack power when fighting empty-handed. | Doesn't stack with license | AU Augments!r11 |
| 10 | 0x0A | Adrenaline | 13010 |  | Adrenaline | 0 | Steel Gorget | 20490 | Increases strength when HP Critical. | Doesn't stack with license | AU Augments!r12 |
| 11 | 0x0B | Focus | 13011 |  | Focus | 0 | Blazer Gloves | 20491 | Increases strength when HP is full. | Doesn't stack with license | AU Augments!r13 |
| 12 | 0x0C | Lobbying | 13012 |  | Converts LP earned to gil | 0 | Cat-ear Hood | 20492 | Convert all license points earned to gil. |  | AU Augments!r14 |
| 13 | 0x0D | Combo Boost | 13013 |  | Improves chance of combo | 0 | Genji Gloves | 20493 | Improves chance of scoring multiple hits. |  | AU Augments!r15 |
| 14 | 0x0E | Item Boost | 13014 |  | Item+ - works on potions/ethers/fangs | 0 | Pheasant Netsuke | 20494 | Improves potency of restorative items and fangs. |  | AU Augments!r16 |
| 15 | 0x0F | Medicine Reverse | 13015 |  | Item Reverse | 0 | Nihopalaoa | 20495 | Reverses effects of restorative items such as potions. | works on: Potions, Ethers, Phoenix Down, Elixirs, status-cure items, Remedy, | AU Augments!r17 |
| 16 | 0x10 | Weatherproof | 13016 | Ignore Weather | Ignore Weather/Landscape for elemental damage | 0 | Agate Ring | 20496 | Nullifies weather and terrain effects. |  | AU Augments!r18 |
| 17 | 0x11 | Thievery | 13017 |  | Enables theft of superior items | 0 | Thief's Cuffs | 20497 | Enables the theft of superior and rare items. |  | AU Augments!r19 |
| 18 | 0x12 | Saboteur | 13018 |  | Ignore VIT - improves chance to hit with magicks | 0 | Indigo Pendant | 20498 | Improves chance to strike with magicks. |  | AU Augments!r20 |
| 19 | 0x13 | Magick Lore M | 13019 |  | Magick Lore 100 | 1 |  | 20499 | Increases magick potency. | Doesn't stack with license | AU Augments!r21 |
| 20 | 0x14 | Warmage | 13020 |  | Warmage | 0 |  | 20500 | Gain MP after dealing magick damage. | Doesn't stack with license | AU Augments!r22 |
| 21 | 0x15 | Martyr | 13021 |  | Martyr | 0 |  | 20501 | Gain MP after taking damage. | Doesn't stack with license | AU Augments!r23 |
| 22 | 0x16 | Magick Lore N | 13022 |  | Magick Lore 100 | 1 |  | 20502 | Increases magick potency. | Doesn't stack with license | AU Augments!r24 |
| 23 | 0x17 | Headsman | 13023 |  | Headsman | 0 |  | 20503 | Gain MP after defeating a foe. | Doesn't stack with license | AU Augments!r25 |
| 24 | 0x18 | Magick Lore O | 13024 |  | Magick Lore 100 | 1 |  | 20504 | Increases magick potency. | Doesn't stack with license | AU Augments!r26 |
| 25 | 0x19 | Treasure Hunter | 13025 |  | Get better items from chests | 0 | Diamond Armlet | 20505 | Search the deepest recesses of chests, coffers, and the like. |  | AU Augments!r27 |
| 26 | 0x1A | Magick Lore P | 13026 |  | Magick Lore 100 | 1 |  | 20506 | Increases magick potency. | Doesn't stack with license | AU Augments!r28 |
| 27 | 0x1B | EXP Boost | 13027 |  | Double Exp | 0 | Embroidered Tippet | 20507 | Doubles EXP earned. |  | AU Augments!r29 |
| 28 | 0x1C | LP Boost | 13028 |  | Double LP | 0 | Golden Amulet | 20508 | Doubles license points earned. |  | AU Augments!r30 |
| 29 | 0x1D | Stagnation | 13029 | No EXP Gain, Stupor | No Exp | 0 | Firefly | 20509 | Reduces EXP earned to 0. |  | AU Augments!r31 |
| 30 | 0x1E | Spellbound | 13030 |  | Spellbound | 0 |  | 20510 | Increases duration of status effects. | Doesn't stack with license | AU Augments!r32 |
| 31 | 0x1F | Piercing Magick | 13031 | Ignore Reflect, Surecast | Ignore Reflect | 0 | Opal Ring | 20511 | Magicks will not bounce off targets with Reflect status. |  | AU Augments!r33 |
| 32 | 0x20 | Offering | 13032 |  | Uses gil instead of MP to cast spells | 0 | Turtleshell Choker | 20512 | Enables casting of magicks with gil, rather than MP. |  | AU Augments!r34 |
| 33 | 0x21 | Muffle | 13033 | Cloak, Subterfuge, Soundproof, Veil, Shroud | Null Aggro | 0 |  | 20513 | Avoid detection based on sound and magick. |  | AU Augments!r35 |
| 34 | 0x22 | Deodorize | 13034 | Stanch, Suppression, Mask | Unknown | 0 |  | 20514 | Avoid detection based on low HP. |  | AU Augments!r36 |
| 35 | 0x23 | Battle Lore F | 13035 |  | Battle Lore 50 | 1 |  | 20515 | Increases physical attack damage. | Doesn't stack with license | AU Augments!r37 |
| 36 | 0x24 | Parsimony | 13036 |  | Half MP Cost | 0 | Sage's Ring | 20516 | Reduces MP costs by half. |  | AU Augments!r38 |
| 37 | 0x25 | Tread Lightly | 13037 | Prudence, Acumen, Survival, Ignore Traps, Diligence, Dungeoneering | Ignore Traps | 0 | Steel Poleyns | 20517 | Move safely past traps. |  | AU Augments!r39 |
| 38 | 0x26 | NOTHING | 13038 |  | "Steel Poleyns Effect" | 0 |  | 20518 |  |  | AU Augments!r40 |
| 39 | 0x27 | Emptiness | 13039 |  | Zero MP - reduces Max MP to 0 | 0 | Goddess's Magicite, Dawn Shard | 20519 | Reduces max MP to 0. |  | AU Augments!r41 |
| 40 | 0x28 | Resist Piercing Damage | 13040 |  | Resist Guns & Measures - your def. applies to piercing damage | 0 |  | 20520 | Ignores the piercing effects of Guns and the like. |  | AU Augments!r42 |
| 41 | 0x29 | Anti-Libra | 13041 |  | Anti-Libra - hides user's info from Libra users | 0 |  | 20521 | Hides user's vital information from the effect of Libra. |  | AU Augments!r43 |
| 42 | 0x2A | Battle Lore G | 13042 |  | Battle Lore 50 | 1 |  | 20522 | Increases physical attack damage. | Doesn't stack with license | AU Augments!r44 |
| 43 | 0x2B | Battle Lore H | 13043 |  | Battle Lore 50 | 1 |  | 20523 | Increases physical attack damage. | Doesn't stack with license | AU Augments!r45 |
| 44 | 0x2C | Battle Lore I | 13044 |  | Battle Lore 70 | 1 |  | 20524 | Increases physical attack damage. | Doesn't stack with license | AU Augments!r46 |
| 45 | 0x2D | Battle Lore J | 13045 |  | Battle Lore 70 | 1 |  | 20525 | Increases physical attack damage. | Doesn't stack with license | AU Augments!r47 |
| 46 | 0x2E | Battle Lore K | 13046 |  | Battle Lore 70 | 1 |  | 20526 | Increases physical attack damage. | Doesn't stack with license | AU Augments!r48 |
| 47 | 0x2F | Battle Lore L | 13047 |  | Battle Lore 70 | 1 |  | 20527 | Increases physical attack damage. | Doesn't stack with license | AU Augments!r49 |
| 48 | 0x30 | Stoneskin | 13048 | Vivacity, Mettle, Toughness, Resilience, Resist Damage | Damage taken -30% | 0 |  | 20528 | Reduces damage taken by 30%. |  | AU Augments!r50 |
| 49 | 0x31 | Attack Boost | 13049 |  | Attack damage +20% | 0 |  | 20529 | Increases Attack damage by 20%. |  | AU Augments!r51 |
| 50 | 0x32 | Double Edged | 13050 | Abandon, Masochism, Penance, Recklessness, Overkill, See You in Hell, Darkside, Corruption | HP Attack | 0 |  | 20530 | Increases Attack damage by 50% and user receives damage equal to each Attack. |  | AU Augments!r52 |
| 51 | 0x33 | Spellspring | 13051 |  | Mana Spring - MP Cost is 0 | 0 |  | 20531 | Reduces MP costs to 0. |  | AU Augments!r53 |
| 52 | 0x34 | Elemental Shift | 13052 |  | Shift - elemental weaknesses change randomly | 0 |  | 20532 | User gains one elemental weakness and absorbs all others. |  | AU Augments!r54 |
| 53 | 0x35 | Celerity | 13053 | Verve, Flurry, Alacrity | Attack CT 0 | 0 |  | 20533 | Reduces Attack charge time to 0. |  | AU Augments!r55 |
| 54 | 0x36 | Swiftcast | 13054 | Chainspell, Loquaciousness, Eloquence, Tachylalia | Magick CT 0 | 0 |  | 20534 | Reduces Magick charge time to 0. |  | AU Augments!r56 |
| 55 | 0x37 | Immune: Attack | 13055 |  | Immune: Attack | 120 |  | 20535 | User becomes immune to attacks. |  | AU Augments!r57 |
| 56 | 0x38 | Immune: Magick | 13056 |  | Immune: Magick | 120 |  | 20536 | User becomes immune to magicks. |  | AU Augments!r58 |
| 57 | 0x39 | Immune: Status | 13057 |  | Immune: Various Status Effects | 120 |  | 20537 | User becomes immune to statuses. |  | AU Augments!r59 |
| 58 | 0x3A | Damage Spikes | 13058 |  | Damage Reflection | 0 |  | 20538 | Returns 5% of all damage received to user's attackers. |  | AU Augments!r60 |
| 59 | 0x3B | Mass-Destruct Order | 13059 |  | Self/Mass-Destruct Order | 0 |  | 20539 | Compels nearby allies to use Self-Destruct. |  | AU Augments!r61 |
| 60 | 0x3C | Battle Lore M | 13060 |  | Battle Lore 100 | 1 |  | 20540 | Increases physical attack damage. | Doesn't stack with license | AU Augments!r62 |
| 61 | 0x3D | Battle Lore N | 13061 |  | Battle Lore 100 | 1 |  | 20541 | Increases physical attack damage. | Doesn't stack with license | AU Augments!r63 |
| 62 | 0x3E | Battle Lore O | 13062 |  | Battle Lore 100 | 1 |  | 20542 | Increases physical attack damage. | Doesn't stack with license | AU Augments!r64 |
| 63 | 0x3F | Battle Lore P | 13063 |  | Battle Lore 100 | 1 |  | 20543 | Increases physical attack damage. | Doesn't stack with license | AU Augments!r65 |
| 64 | 0x40 | Battle Lore A | 13064 |  | Battle Lore 30 | 1 |  | 20544 | Increases physical attack damage. | Doesn't stack with license | AU Augments!r66 |
| 65 | 0x41 | Battle Lore B | 13065 |  | Battle Lore 30 | 1 |  | 20545 | Increases physical attack damage. | Doesn't stack with license | AU Augments!r67 |
| 66 | 0x42 | Battle Lore C | 13066 |  | Battle Lore 30 | 1 |  | 20546 | Increases physical attack damage. | Doesn't stack with license | AU Augments!r68 |
| 67 | 0x43 | Battle Lore D | 13067 |  | Battle Lore 30 | 1 |  | 20547 | Increases physical attack damage. | Doesn't stack with license | AU Augments!r69 |
| 68 | 0x44 | Battle Lore E | 13068 |  | Battle Lore 50 | 1 |  | 20548 | Increases physical attack damage. | Doesn't stack with license | AU Augments!r70 |
| 69 | 0x45 | Magick Lore A | 13069 |  | Magick Lore 30 | 1 |  | 20549 | Increases magick potency. | Doesn't stack with license | AU Augments!r71 |
| 70 | 0x46 | Magick Lore B | 13070 |  | Magick Lore 30 | 1 |  | 20550 | Increases magick potency. | Doesn't stack with license | AU Augments!r72 |
| 71 | 0x47 | Magick Lore C | 13071 |  | Magick Lore 30 | 1 |  | 20551 | Increases magick potency. | Doesn't stack with license | AU Augments!r73 |
| 72 | 0x48 | Magick Lore D | 13072 |  | Magick Lore 30 | 1 |  | 20552 | Increases magick potency. | Doesn't stack with license | AU Augments!r74 |
| 73 | 0x49 | Magick Lore E | 13073 |  | Magick Lore 50 | 1 |  | 20553 | Increases magick potency. | Doesn't stack with license | AU Augments!r75 |
| 74 | 0x4A | HP +30 | 13074 |  | 30 HP | 30 |  | 20554 | Increases max HP by 30. | Doesn't stack with license | AU Augments!r76 |
| 75 | 0x4B | HP +70 | 13075 |  | 70 HP | 70 |  | 20555 | Increases max HP by 70. | Doesn't stack with license | AU Augments!r77 |
| 76 | 0x4C | HP +110 | 13076 |  | 110 HP | 110 |  | 20556 | Increases max HP by 110. | Doesn't stack with license | AU Augments!r78 |
| 77 | 0x4D | HP +150 | 13077 |  | 150 HP | 150 |  | 20557 | Increases max HP by 150. | Doesn't stack with license | AU Augments!r79 |
| 78 | 0x4E | HP +190 | 13078 |  | 190 HP | 190 |  | 20558 | Increases max HP by 190. | Doesn't stack with license | AU Augments!r80 |
| 79 | 0x4F | HP +230 | 13079 |  | 230 HP | 230 |  | 20559 | Increases max HP by 230. | Doesn't stack with license | AU Augments!r81 |
| 80 | 0x50 | HP +270 | 13080 |  | 270 HP | 270 |  | 20560 | Increases max HP by 270. | Doesn't stack with license | AU Augments!r82 |
| 81 | 0x51 | HP +310 | 13081 |  | 310 HP | 310 |  | 20561 | Increases max HP by 310. | Doesn't stack with license | AU Augments!r83 |
| 82 | 0x52 | HP +350 | 13082 |  | 350 HP | 350 |  | 20562 | Increases max HP by 350. | Doesn't stack with license | AU Augments!r84 |
| 83 | 0x53 | HP +390 | 13083 |  | 390 HP | 390 |  | 20563 | Increases max HP by 390. | Doesn't stack with license | AU Augments!r85 |
| 84 | 0x54 | HP +435 | 13084 |  | 435 HP | 435 |  | 20564 | Increases max HP by 435. | Doesn't stack with license | AU Augments!r86 |
| 85 | 0x55 | HP +500 | 13085 |  | 500 HP | 500 |  | 20565 | Increases max HP by 500. | Doesn't stack with license | AU Augments!r87 |
| 86 | 0x56 | Inquisitor | 13086 |  | Inquisitor | 20 |  | 20566 | Gain MP after dealing damage. | Doesn't stack with license | AU Augments!r88 |
| 87 | 0x57 | Magick Lore F | 13087 |  | Magick Lore 50 | 1 |  | 20567 | Increases magick potency. |  | AU Augments!r89 |
| 88 | 0x58 | Shield Block 75 | 13088 |  | Shield Block 75 | 5 |  | 20568 | Increases chance to block with a shield. |  | AU Augments!r90 |
| 89 | 0x59 | Shield Block 45 | 13089 |  | Shield Block 45 | 5 |  | 20569 | Increases chance to block with a shield. |  | AU Augments!r91 |
| 90 | 0x5A | Shield Block 25 | 13090 |  | Shield Block 25 | 5 |  | 20570 | Increases chance to block with a shield. |  | AU Augments!r92 |
| 91 | 0x5B | Channeling 80 | 13091 |  | Channeling 80 | 10 |  | 20571 | Reduces magick MP cost by 10%. |  | AU Augments!r93 |
| 92 | 0x5C | Channeling 50 | 13092 |  | Channeling 50 | 10 |  | 20572 | Reduces magick MP cost by 10%. |  | AU Augments!r94 |
| 93 | 0x5D | Channeling 30 | 13093 |  | Channeling 30 | 10 |  | 20573 | Reduces magick MP cost by 10%. |  | AU Augments!r95 |
| 94 | 0x5E | Swiftness 80 | 13094 |  | Swiftness 80 | 12 |  | 20574 | Reduces action time by 12%. |  | AU Augments!r96 |
| 95 | 0x5F | Swiftness 50 | 13095 |  | Swiftness 50 | 12 |  | 20575 | Reduces action time by 12%. |  | AU Augments!r97 |
| 96 | 0x60 | Swiftness 30 | 13096 |  | Swiftness 30 | 12 |  | 20576 | Reduces action time by 12%. |  | AU Augments!r98 |
| 97 | 0x61 | Magick Lore G | 13097 |  | Magick Lore 50 | 1 |  | 20577 | Increases magick potency. |  | AU Augments!r99 |
| 98 | 0x62 | Magick Lore H | 13098 |  | Magick Lore 50 | 1 |  | 20578 | Increases magick potency. |  | AU Augments!r100 |
| 99 | 0x63 | Magick Lore I | 13099 |  | Magick Lore 70 | 1 |  | 20579 | Increases magick potency. |  | AU Augments!r101 |
| 100 | 0x64 | Magick Lore J | 13100 |  | Magick Lore 70 | 1 |  | 20580 | Increases magick potency. |  | AU Augments!r102 |
| 101 | 0x65 | Magick Lore K | 13101 |  | Magick Lore 70 | 1 |  | 20581 | Increases magick potency. |  | AU Augments!r103 |
| 102 | 0x66 | Magick Lore L | 13102 |  | Magick Lore 70 | 1 |  | 20582 | Increases magick potency. |  | AU Augments!r104 |
| 103 | 0x67 | Serenity | 13103 |  | Serenity | 0 | Magick Gloves | 20583 | Increases magick power when HP is full. | Doesn't stack with license | AU Augments!r105 |
| 104 | 0x68 | Gambit 15 | 13104 |  | Gambit Slot 15 | 1 |  | 20584 | Adds an additional gambit slot. |  | AU Augments!r106 |
| 105 | 0x69 | Gambit 20 | 13105 |  | Gambit Slot 20 | 1 |  | 20585 | Adds an additional gambit slot. |  | AU Augments!r107 |
| 106 | 0x6A | Gambit 25 | 13106 |  | Gambit Slot 25 | 1 |  | 20586 | Adds an additional gambit slot. |  | AU Augments!r108 |
| 107 | 0x6B | Gambit 30 | 13107 |  | Gambit Slot 30 | 1 |  | 20587 | Adds an additional gambit slot. |  | AU Augments!r109 |
| 108 | 0x6C | Gambit 35 | 13108 |  | Gambit Slot 35 | 1 |  | 20588 | Adds an additional gambit slot. |  | AU Augments!r110 |
| 109 | 0x6D | Gambit 40 | 13109 |  | Gambit Slot 40 | 1 |  | 20589 | Adds an additional gambit slot. |  | AU Augments!r111 |
| 110 | 0x6E | Gambit 45 | 13110 |  | Gambit Slot 45 | 1 |  | 20590 | Adds an additional gambit slot. |  | AU Augments!r112 |
| 111 | 0x6F | Gambit 50 | 13111 |  | Gambit Slot 50 | 1 |  | 20591 | Adds an additional gambit slot. |  | AU Augments!r113 |
| 112 | 0x70 | Gambit 70 | 13112 |  | Gambit Slot 70 | 1 |  | 20592 | Adds an additional gambit slot. |  | AU Augments!r114 |
| 113 | 0x71 | Gambit 100 | 13113 |  | Gambit Slot 100 | 1 |  | 20593 | Adds an additional gambit slot. |  | AU Augments!r115 |
| 114 | 0x72 | Essentials | 13114 |  | Essentials | 0 | Orrachea Armlet | 20594 | Attack Items |  | AU Augments!r116 |
| 115 | 0x73 | Move with Great Celerity | 13115 |  | Move with great celerity? | 0 |  | 20595 | Move with Great Celerity? | Doesn't seem to do anything | AU Augments!r117 |
| 116 | 0x74 | Remedy Lore 3 | 13116 |  | Remedy Lore 3 - Stop Doom Disease | 0 |  | 20596 | Remedies remove Stop, Doom, and Disease. |  | AU Augments!r118 |
| 117 | 0x75 | Remedy Lore 2 | 13117 |  | Remedy Lore 2 - Petrify Confuse Oil | 0 |  | 20597 | Remedies remove Petrify, Confuse, and Oil. |  | AU Augments!r119 |
| 118 | 0x76 | Remedy Lore 1 | 13118 |  | Remedy Lore 1 - Sleep Sap Immobilize Disable | 0 |  | 20598 | Remedies remove Sleep, Sap, Immobilize, and Disable. |  | AU Augments!r120 |
| 119 | 0x77 | Potion Lore 3 | 13119 |  | Potion Lore 3 | 40 |  | 20599 | Potions restore 40% more HP. |  | AU Augments!r121 |
| 120 | 0x78 | Potion Lore 2 | 13120 |  | Potion Lore 2 | 30 |  | 20600 | Potions restore 30% more HP. |  | AU Augments!r122 |
| 121 | 0x79 | Potion Lore 1 | 13121 |  | Potion Lore 1 | 20 |  | 20601 | Potions restore 20% more HP. |  | AU Augments!r123 |
| 122 | 0x7A | Ether Lore 3 | 13122 |  | Ether Lore 3 | 30 |  | 20602 | Ethers restore 30% more MP. |  | AU Augments!r124 |
| 123 | 0x7B | Ether Lore 2 | 13123 |  | Ether Lore 2 | 20 |  | 20603 | Ethers restore 20% more MP. |  | AU Augments!r125 |
| 124 | 0x7C | Ether Lore 1 | 13124 |  | Ether Lore 1 | 10 |  | 20604 | Ethers restore 10% more MP. |  | AU Augments!r126 |
| 125 | 0x7D | Phoenix Lore 90 | 13125 |  | Phoenix Lore 90 | 10 |  | 20605 | Phoenix Down restores 10% more HP. |  | AU Augments!r127 |
| 126 | 0x7E | Phoenix Lore 50 | 13126 |  | Phoenix Lore 50 | 10 |  | 20606 | Phoenix Down restores 10% more HP. |  | AU Augments!r128 |
| 127 | 0x7F | Phoenix Lore 30 | 13127 |  | Phoenix Lore 30 | 10 |  | 20607 | Phoenix Down restores 10% more HP. |  | AU Augments!r129 |
| 128 | 0x80 | Second Board | 13128 |  | Second Board | 20 |  | 20608 | Additional License Board unlocked. |  | AU Augments!r130 |

"Doesn't stack with license" (column H) marks augments that a matching licence already grants; equipping the item adds nothing for a character who owns the licence.

## Enums carried in the JSON spec

| Enum | Keys | Use |
|---|---|---|
| `Augment` | 0-128, 255, 65535 | drop-down for any augment field (section 13 +0x1A, licence contents, section 58 row labels) |
| `AugmentEffect`, `AugmentDescription`, `AugmentNotes`, `AugmentAlternateNames` | 0-128 | tooltips |
| `AugmentInitialValue` | 0-128 | vanilla parameter (section 58 +0x04) |
| `AugmentNameTextId`, `AugmentDescriptionTextId` | 0-128 | vanilla text ids |
| `AugmentVanillaGear` | 0-128 | which vanilla gear grants it |
| `AugmentDescriptionCalculatorName` | ids where the DC naming differs | alternative names (DC Data!A) |

## Text

Names and descriptions are not stored in section 58; only text ids are. The text lives in the game's text tables (`listhelp_ability`, battlepack section 61 sub-file 10 per the sheet headers). Changing a name means editing that text table, not this enum.

## Round-trip rules

- Augment ids are plain integers; 255 (u8 fields) and 65535 (u16 fields) mean none.
- Section 58 vanilla rows keep their text ids in the 20480+id / 13000+id pattern; renumbering rows breaks those links unless the text tables are edited too.
- Ids 0-63 double as bit positions in 64-bit augment masks: do not re-order rows 0-63.

## Known unknowns

- "Initial Value" (AU Augments!D) is assumed to be section 58 +0x04 parameter (it matches the effect text, e.g. HP +30 = 30, Potion Lore 3 = 40); the sheet has no raw bytes to prove it.
- The sheet says the 13000+id texts are augment *names* in listhelp_ability and 20480+id are *descriptions* in section 61 file 10 (AU Augments!E1, G1); the Toolkit lists label 13000+ with descriptions and 20480+ "NOT USED" (Lists: MenuAugmentList, DescAugmentList). Which text the game shows where is unresolved (same gap as battlepack-s58-augments).
- Augment 34 "Deodorize" is labelled "Unknown" in the effect column; 38 "NOTHING" has an empty description; 115 "Move with Great Celerity?" "doesn't seem to do anything" (AU Augments!r36, r40, r117).
- The Description Calculator uses a different naming scheme for many augments (numbered lores, "Life Cloak", "Suicidal", "Attack-Immunity"...): kept as enum AugmentDescriptionCalculatorName; its source is not stated.
