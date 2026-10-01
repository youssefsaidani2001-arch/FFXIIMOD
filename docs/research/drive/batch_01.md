# Drive batch 01: The Insurgent's Toolkit.CT (Cheat Engine table)

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR.
All addresses below are the absolute VAs the table uses. If the image base is 0x120000, RVA = VA - 0x120000.

| Drive id | Title | Local file | Status |
|---|---|---|---|
| 1XRyS0dGFx9QCoDHR5o80jsLN9M-bWV8Y | The Insurgent's Toolkit.CT (text/xml, 9,492,283 bytes) | **not in `scratchpad/drive/`** | **MISSING, only partly recovered** (see below) |

## Availability and provenance

- The decoded copy of this file is **not** in `scratchpad/drive/`. I tried to download it again with
  `download_file_content` 5 times. Every attempt failed with "Google_Drive session expired", so I could
  not read the full file.
- **Partial copy recovered (primary source for section A).** An earlier `read_file_content` call on the
  same Drive id was still saved in the session's tool-results
  (`mcp-Google_Drive-read_file_content-1790801839863.txt`). That result is truncated. It holds the first
  ~835 KB of unescaped XML, which is 37,569 of the 236,198 lines. I unescaped it into
  `scratchpad/ct_partial.xml` and parsed it into `scratchpad/ct_lists_parsed.json`.
  The partial copy contains:
  - the root `Compact Mode` Lua script (L6)
  - the whole `Drop-Down List Prerequisites` library (L33): 213 complete lists, plus `LocationList`, which
    is cut off at id 275 (L37294)

  It does **not** contain the end of `LocationList`, `LocationNameList`, `EbpTypeList`, `ReqTypeList`,
  `OffOnList` or the inline "Sub Model" list. It also does not contain any of the `The Insurgent's Toolkit
  (Steam)` tool tree: no Auto Assembler scripts, no addresses, no struct rows.
- **Secondary source (section B).** The repo already has `docs/research/insurgents_toolkit_reference.md`
  (1,882 lines, commit 86295d3). It was written from a local copy, `The Insurgent's Toolkit (1).CT`, which
  has the same size (9.49 MB, CE table version 52). It is almost certainly the same table, but I could not
  check it against this Drive revision. Every fact taken from it is marked **unclear**.
- **Corrections (section C).** In several places the partial Drive copy contradicts that reference doc.
  The Drive data wins.
- Licensing: the table's author is Xeavin (nexusmods FFXII mod 160), for personal use only. Everything
  here is a paraphrased fact (ids, offsets, sizes, enumerations). No code was copied.

Evidence key:
- **byte-check-in-code**: the code checks the original bytes before patching.
- **used-in-code**: the CT data or code reads, writes or defines it. For drop-down lists, this means the
  CT's own value-to-name map, which I checked in the Drive copy.
- **comment-only**: only a label or comment says so.
- **unclear**: taken from the secondary reference doc and not re-checked here.

Line numbers `CT Lnnnnn` refer to `scratchpad/ct_partial.xml`. That file starts at line 1 of the
original, so they should match the original CT lines closely.

---

## The Insurgent's Toolkit.CT

**Purpose.** This is Xeavin's Cheat Engine table for FFXII TZA (Steam). It has 68 tool groups:
- live-memory editors for the battle actor chain, battlepack, ARD, EBP, MRP, TM2, menu sections, VM and
  file loader
- a save-game editor
- one-shot actions: teleport, open shop, add inventory, hot file reload

It also has a library of 219 drop-down lists that name almost every id space in the game. For an
editor, the list library is the richest machine-readable enum source we have. The script tree gives the
global pointers and struct offsets.

### A. Verified from the Drive copy (partial): enumerations and id encodings

#### A.1 Table mechanics

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| CT header | CheatTable `CheatEngineTableVersion="52"`. The first root entry is a Lua script. | CT L1-L6 | used-in-code |
| Compact Mode | A CE-UI-only Lua toggle. It flips the visibility of `Splitter1`, `Panel4` and `Panel5` on the CE main form, and the same function runs on disable. It does not touch the game. | CT L6-L31 | used-in-code |
| List library | The `Drop-Down List Prerequisites` group header has `moHideChildren`. Its 38 sub-groups hold lists as rows with no address. List attributes used: `DisplayValueAsItem` (all), `DescriptionOnly` (content/battlepack lists), `ReadOnly` (fixed enums). Real rows reference these lists by name, so a CE-compatible editor must keep the group. | CT L33+ | used-in-code |
| Sentinels | Most 16-bit id lists use 65535 (0xFFFF) for "None". Byte lists use 255 (0xFF). Signed lists use -1 (CharacterNameList, DsForced*Rarity, PmePartyMemberList "-1 = All"). | many | used-in-code |

#### A.2 Text and name id spaces

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Text-id namespace ("Desc" lists) | 13 families, each in its own 0x800-id block:<br>actions 0x0000-0x0220 (545 ids, ending "Quickening" 543, "SecondJob" 544)<br>equipment 0x0800-0x0A1F<br>license 0x1800-0x1969<br>battle menu 0x2000-0x203E<br>status effect 0x2800-0x281F<br>gambit 0x3000-0x311B<br>names 0x4000-0x4274 ("No name", Vaan 0x4001, Balthier 0x4002, Fran 0x4003, Basch 0x4004 ... Judge Ghis)<br>bazaar good 0x4800-0x487F<br>augment 0x5000-0x5080<br>loot 0x5800-0x59FF<br>key item 0x6000-0x61FF<br>foe classification 0x6800-0x680F<br>foe genus 0x7000-0x703F<br>Battlepack name/description fields store these ids. | CT L46-L3958 | used-in-code |
| Menu help-text ids | Decimal bases:<br>3000 general help (398, 0xBB8-0xD45)<br>4000 battle-action descriptions (322)<br>10000 inventory-action descriptions (251)<br>12000 status effects (32)<br>13000 augments (64)<br>14000 loot (512)<br>16000 gambit targets (255)<br>17000 licenses (35)<br>20000 key items (512)<br>22000 bazaar goods (128)<br>The strings contain inline tags such as `{link=N}`, so a text editor must preserve these control tags. | CT L3965-L6535 | used-in-code |
| CharacterNameList | 1,141 actor display names, ids -1 (None) and 0-1140 (Rabanastran, Imperial, Awein ... Informed Shopkeep). Duplicate names are normal. | CT L28924 | used-in-code |

#### A.3 Content ids and inventory

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Content id encoding | id = category << 12 \| index. Category blocks:<br>0x0 items (64)<br>0x1 equipment (557)<br>0x2 loot (512)<br>0x3 magicks (81)<br>0x4 technicks (24)<br>0x6 gambits (256)<br>0x8 key items (512)<br>0x9 packages (512)<br>0xA rewards (256)<br>0xB prices (128)<br>0xC mist/licence-grant (32, ending "Second Job")<br>0xD bazaar goods (128)<br>0xE gil: 0xE000 + amount (0-4095 gil, ends at 0xEFFF)<br>0xFFFF = None. ContCombList holds 7,159 entries in total. | CT L6542 | used-in-code |
| Equipment sub-ranges (content ids) | weapons 0x1000-0x10C7 (200, Unarmed ... Dhanusha)<br>armor/shields/helms 0x10C8-0x1153 (140, Gendarme ... Grand Armor)<br>accessories 0x1154-0x1183 (48, Opal Ring ... Dawn Shard)<br>ammo 0x1184-0x11A3 (32: arrows, bolts, shot, bombs; ends Castellanos)<br>foe and esper natural weapons/armor 0x11A4-0x122C (137, "Unarmed Small", Fang, Claw ... "Chaos's Armor", "Zodiark's Armor").<br>The battlepack equipment index is content id - 0x1000 (BpEquipmentList 0-556). | CT L13778-L14789 | used-in-code |
| IeCategoryList (inventory categories) | 0 Item, 1 Equipment, 2 Loot, 3 Magick, 4 Technick, 6 Gambit, 8 Key Item, 9 Package, 10 Reward, 11 Price, 12 Mist, 13 Bazaar Good. These match the content-id high nibble. | CT L21895 | used-in-code |
| SgeInventoryContentTypeList (save inventory slot types) | 0 Items, 1 Weapons, 2 Armor, 3 Accessories, 4 Ammunition, 5 unused, 6 Gambits, 7 unused, 8 Technicks, 9 Magicks, 10 Key Items/Maps/Candles, 11 Loot. | CT L22844 | used-in-code |
| Save equipment lists | SgeWeaponList 0-199, SgeArmorList 0-139, SgeAccessoryList 0-47, SgeAmmunitionList 0-31. These are indices inside each equipment sub-range. | CT L22862-L23305 | used-in-code |

#### A.4 Battlepack action ids (relevant to BlueMagick)

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Action id layout | BpActionList holds 543 ids (0-542):<br>0-80 magicks (= BpMagickList index; Cure ... Graviga)<br>81 reserve<br>82-145 items (action = 82 + item index; checked for all 64)<br>146 Idle, 148 Mount, 149 Dismount, **150 (0x96) Attack**, 151 Actstop, 152 Sousachange, 153 Escapestop, 154 Escape<br>158-181 technicks (= 158 + technick index; First Aid ... Gil Toss)<br>182-207 esper attacks and finishers (Painflare ... Final Eclipse)<br>**208-225 quickenings** (= 208 + BpMistList index 0-17)<br>226-241 concurrences, with gaps: Inferno 226, Cataclysm 227, Torrent 228, Windburst 229, Luminescence 231, Ark Blast 234, Whiteout 237, Black Hole 241<br>242-244 Mist Charge 1-3<br>245 Chain Bonus<br>246-255 trap/gas actions<br>256-496 foe, boss and guest abilities (Swarm ... Gigaflare Sword) | CT L17309 | used-in-code |
| Free action slots (shipped as "Reserve") | 81, 111-123 (item slots 29-41), 147, 155-157, 230, 232-233, 235-236, 238-240, 276-277, 323, 450-453, 482-484, and **497-542 (46 contiguous slots at the end of section 14)**. These are the safe ids for adding new actions (for example Blue Magick) without overwriting vanilla ones. | CT L17309 | used-in-code |
| DescActionList vs BpActionList | DescActionList has 2 more ids than BpActionList: 543 "Quickening" and 544 "SecondJob". These are text-only entries. | CT L46 | used-in-code |
| MistActionList | Quickening action ids 208-225 (Red Spiral ... Resplendence). 0 = None. | CT L31799 | used-in-code |
| BpMistList (section 26 / license "mist" contents) | 0-17 quickenings, 18-30 espers Belias ... Zodiark, 31 Second Board. | CT L20610 | used-in-code |
| BattleLogicActionList (gambit/AI action field) | 0-542 actions<br>0x4000-0x4166: 359 special AI commands, such as "Randomly move around Position n within (p) m", stat or enmity changes, "Collect the closest loot", "Show combat log (p+93)", "Remove Augment: ..."<br>0x8000 + n: "Action Group n" (n 0-825; battlepack section 10)<br>0xFFFF = None | CT L31824 | used-in-code |

#### A.5 Battle menu, formulas and action flags

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Battle-menu categories (BpCategoryList) | 0 Attack, 1 Magicks, 2 Technicks, 3 Items, 4 reserve, 5 Summon, 6 Quickening, 7 Foecraft, 8 Traps, 9 Esper Technicks, 10 Concurrences, 11 Dismiss, 12 reserve, 13 Gambits, 14 Cancel, 15 Esper Cancel, 16 Escape, 17 Escape Cancel, 18 Magicks & Technicks, 19 Mist, 20 reserve, 255 None. Action record +0x1E uses this list. | CT L17996 | used-in-code |
| Action-list categories (AlceCategoriesList, 26) | The same values 0-20, plus 21 White, 22 Black, 23 Time, 24 Green and 25 Arcane Magicks. These are the per-category action lists the game builds for the battle menu. The doc places them at [0208CD20]. | CT L25737 | used-in-code |
| BpMagickCategoryList | 0 White, 1 Black, 2 Time, 3 Green, 4 Arcane. | CT L20442 | used-in-code |
| BpeBattleMenuTypeList | 0 None, 1 Magick, 2 Technick, 3 Item. This is the 2-bit field in action flag word 1. | CT L24904 | used-in-code |
| Formulas (BpeFormulaList, 0-108) | Selected values:<br>0 None, 1 Remove Status, 2 Add Buff, 3 Add Debuff, 4 Restore HP, 6 Revive, 7 Magick Damage, 10 KO, 11 HP Drain, 12 MP Drain, 15 Dire Magick Damage<br>20-29 weapon classes (Martial, Finesse, Enlightened, Brute, Ki, Adroit, Tactical, Piercing, Savage, Unarmed)<br>31-37 item formulas<br>38-61 technick formulas (First Aid ... Gil Toss), 62 Summon<br>64 Enemy Attack, 65 Enemy Technick, 66 Cinematic Technick, 68 Enemy Fractional<br>79 Add Augment, 80 Remove Augment, 87 Level Up, 92 Quickening, 93 Concurrence<br>94-99 traps, 101 Teleport, 102 Chain Bonus, 103 Enemy Combo, 104 Sage Weapon, 105 Esper Special<br>106 Piercing HP % Reduction, 107 Fixed HP Damage, 108 Missing HP Damage | CT L23619 | used-in-code |
| Action sub-enums | Initial target: 1 Party (with status), 2 Self, 4 Foe.<br>Character animation (10): 0 Attack ... 9 Concurrence.<br>Charge aura animation (9): 0 Attack, 1-5 magick schools, 6 Mist, 7 Technick, 8 Item.<br>AoE origin: 0 Target, 1 Caster.<br>AoE shape: 0 Circle, 1 Cone, 2 Linear.<br>Status action type: 0 None, 1 Add, 2 Remove.<br>AoE target relation: 0 Same, 1 Opposite, 2 All. | CT L24224-L24979 | used-in-code |
| Battle memory flags (bit numbers) | 0-7 elements, 8 magick-immunity susceptible, 9 physical-immunity susceptible, 10 Eksir Berries, 11 Steal, 12 Full Heal, 13 Stats Reduction, 14 Dispels, 15 Non-Elemental, 16 Partial Heal, 17-30 reserve, 31 Battle Stance. 255 = none. | CT L24980 | used-in-code |
| Cast animations / particle effects | BpeCastAnimationList: ids 0-511 (vanilla, with reserve gaps 184-199 and 397-511) plus 0x8000-0x8097, which are the weapon particle effects (BpeWeaponParticleEffectList, 152 entries; Sword, Sword (Fire) ... Laser). | CT L24066, L24233 | used-in-code |

#### A.6 Statuses, elements, equipment, augments, licences, party members

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Status effect bit order (32) | 0 KO, 1 Stone, 2 Petrify, 3 Stop, 4 Sleep, 5 Confuse, 6 Doom, 7 Blind, 8 Poison, 9 Silence, 10 Sap, 11 Oil, 12 Reverse, 13 Disable, 14 Immobilize, 15 Slow, 16 Disease, 17 Lure, 18 Protect, 19 Shell, 20 Haste, 21 Bravery, 22 Faith, 23 Reflect, 24 Invisible, 25 Regen, 26 Float, 27 Berserk, 28 Bubble, 29 HP Critical, 30 Libra, 31 X-Zone. | CT L21625 | used-in-code |
| Elements (bit order) | 0 Fire, 1 Lightning, 2 Ice, 3 Earth, 4 Water, 5 Wind, 6 Holy, 7 Dark. | CT L18180 | used-in-code |
| Equipment categories (restriction bits) | 0 Unarmed, 1 Sword, 2 Greatsword, 3 Katana, 4 Ninja Sword, 5 Spear, 6 Pole, 7 Bow, 8 Crossbow, 9 Gun, 10 Axe, 11 Hammer, 12 Dagger, 13 Rod, 14 Staff, 15 Mace, 16 Measure, 17 Hand-Bomb, 18 Shield, 19 Helm, 20 Armor, 21 Accessory, 22 Crown, 23 Arrow, 24 Bolt, 25 Shot, 26 Bomb, 27-31 unused. 255 = None. | CT L18757 | used-in-code |
| Equipment slot types | 0 Weapon, 1 Off-hand, 2 Helm, 3 Armor, 4 Accessory. | CT L23734 | used-in-code |
| Weapon stances (BpWeaponStanceList, battlepack section 0) | 0 reserve, 1 Unarmed, 2 Dagger, 3 Sword, 4 Greatsword, 5 Katana, 6 Ninja Sword, 7 Staff, 8 Mace, 9 reserve, 10 Measure, 11 Axe, 12 Hammer, 13 Rod, 14 Pole, 15 Spear, 16 reserve, 17 Bow, 18 Crossbow, 19 reserve, 20 Gun, 21 Hand-Bomb, 22 Unarmed (Brawler). | CT L21787 | used-in-code |
| Weapon distance behaviour | 0 None, 1 Ninja Sword/Sword, 2 ranged (Bow/Crossbow/Gun/Hand-Bomb), 3 Axe/Dagger/Hammer/Mace/Measure, 4 Pole/Rod/Spear/Staff, 5 Greatsword/Katana. | CT L24054 | used-in-code |
| Augments (BpAugmentList) | Ids 0-127 (0 Stability, 1 Safety, 2 Accuracy Boost, 3 Shield Boost ... 125-127 Phoenix Lore 3/2/1), 128 Second Board. 0xFF/0xFFFF = None. Reserve ids: 38 and 115. The augment timer slots (BpeAugmentTimerSlotList) name 3 Physical-Immunity, 4 Magick-Immunity and 5 Status-Immunity. | CT L17859, L25062 | used-in-code |
| Licence node types (BpeLicenseNodeTypeList) | 1 blue weapons, 2 pink weapons, 3 purple weapons, 4 Heavy Armor, 5 Mystic Armor, 6 Light Armor, 7 Shield, 8 Accessory, 9-13 White/Black/Time/Green/Arcane Magick, 14 Technick, 15-17 Augment 1/2/3, 18 Essential/Gambit, 19 Quickening, 20 Summon, 21-29 unused, 30 Second Board.<br>Restrictions: 0 None, 1 Unique, 2 Quickening, 3 Summon, 4 Inaccessible.<br>Live tile type: 0 None, 1 Background, 4 Available, 5 Purchased. | CT L23745-L23791, L25697 | used-in-code |
| BpLicenseList | 368 licence ids (0 = Quickening 1 ...). 361-367 are reserve. DescLicenseList holds the text ids 0x1800-0x1969. | CT L19550 | used-in-code |
| Jobs (boards) | 0 White Mage, 1 Uhlan, 2 Machinist, 3 Red Battlemage, 4 Knight, 5 Monk, 6 Time Battlemage, 7 Foebreaker, 8 Archer, 9 Black Mage, 10 Bushi, 11 Shikari, 12 Classic Board, 255 None. | CT L30787 | used-in-code |
| Party member ids (0-39) | 0 Vaan, 1 Ashe, 2 Fran, 3 Balthier, 4 Basch, 5 Penelo, 6 Reks, 7 Amalia, 8 Basch (Prisoner), 9 Basch (Fugitive), 10 Lamont, 11 Vossler (Judge), 12 Vossler (Knight), 13 Larsa, 14 Reddas, 15-25 reserve, 26 Chocobo, 27-39 espers in order: Belias, Mateus, Adrammelech, Hashmal, Cuchulainn, Famfrit, Zalera, Shemhazai, Chaos, Zeromus, Exodus, Ultima, Zodiark. 0xFF/0xFFFF = None. | CT L21824, L30072 | used-in-code |
| Behind-camera ids | 0 Default, 1-13 espers (same order as above), 14 Chocobo, 15 reserve, 255 None. | CT L25474 | used-in-code |
| Party join level sync | 0 Never, 1 Only Once, 2 Always. | CT L25019 | used-in-code |
| Active party leader slot | 0-3 Active Slot 1-4, 4-8 Reserve Slot 1-5. | CT L25047 | used-in-code |
| Party slot structure types | 0 Default, 1 Battle (Current), 2 Battle (UI), 3 Menu (UI), 4 Battle (Last). | CT L22391 | used-in-code |
| Clan ranks | 0 None ... 12 Order of Ambrosia. | CT L30807 | used-in-code |

#### A.7 Foes, models and actors

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Foe classification | 0 Hume, 1 Humanoid, 2 Giant, 3 Dragon, 4 Beast, 5 Insect, 6 Plant, 7 Avion, 8 Amorph, 9 Fiend, 10 Elemental, 11 Warmech, 12 ???, 13 Undead, 14 Construct, 15 Ichthian, 255 None. | CT L30764 | used-in-code |
| Foe genus | 0-63, 255 None. Includes 43 Esper, 44 Guardian, 45 Judge and 46 Diver/Wyvern; 47-52 are reserve; 53-63 are Rat ... Yensa. | CT L30693 | used-in-code |
| Bestiary ids | 0-383 used (0 Cactoid, 1 Ichthon, 2 Wolf ...). 384-511 are reserve. | CT L30175 | used-in-code |
| Model id encoding | model = (ASCII letter << 16) \| file number. Letters:<br>0x62 'b' set pieces/doors (18)<br>0x63 'c' main characters (23; 0x630000 Vaan, 0x630001 Reddas)<br>0x67 'g' gimmicks/props (104)<br>0x6D 'm' foes (254)<br>0x6E 'n' NPCs (175)<br>0x73 's' espers/summons (26)<br>0x74 't' treasure (17)<br>0x77 'w' weapons (327)<br>ModelList has 944 entries, range 0x620000-0x770146. | CT L30826 | used-in-code |
| Unit types | 0 None, 1 Foe/Party Member, 3 Ally, 4 Gimmick, 5 Idle, 7 Hunt/Boss. Others are reserve (4-bit field). | CT L30153 | used-in-code |
| Actor types | 0 Logic, 1 Sign, 3 Line, 5 Battle Unit, 6 Scene Unit, 7 Respawn Unit (2 and 4 unknown). | CT L30128 | used-in-code |
| Skeleton types | 0 Logic, 1 Sign, 2 Line, 3 Unit, 4 unused. | CT L30142 | used-in-code |
| Battle outcome types | 0 Success, 1 Evade Parry, 2 Evade Weapon, 3 Evade Shield, 4 Evade Weapon (Counter), 5 Evade Shield (Counter), 6 Miss, 7 Immune (Paling), 8 Reflect, 9 Immune, 10 Magick Evade Shield, 11 No Effect. | CT L22009 | used-in-code |
| Battle Character Editor enums | Forced actor: 0 None, 1 Leader, 2 Target, 3 Nearest.<br>Overhead icon: 0 Normal, 1 Shop.<br>Field sign icon: 0 None, 1 one "!", 2 two "!!", 3 ?.<br>Model type: 0 Character, 1 Weapon, 2 Off-hand, 3 High Character.<br>Despawn: 0 None, 1 Leader, 2 Position.<br>Target filter: 0 None, 1 Int, 2 Float.<br>Target selection: 0 Nearest, 1 Random, 2 Nearest With Highest Filter, 3 Nearest With Lowest Filter. | CT L21969-L22056 | used-in-code |

#### A.8 Gambit and battle-logic encodings

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Gambit target condition encoding | condition = (group << 8) \| parameter. Even groups test a condition and the next odd group is its negation. Groups:<br>0x02/0x03 highest/lowest stat<br>0x06/07 status ==/!= (32)<br>0x08/09 classification<br>0x0A/0B genus<br>0x0C/0D `BattleUnitWork[0x52] == n`<br>0x0E/0F HP % thresholds<br>0x10/11 Max HP<br>0x14/15 weak element<br>0x16/17 absorb element<br>0x18/19 party member<br>0x1A/1B equipped slot<br>0x1C/1D weapon type (23)<br>0x20/21 augment (128)<br>0x22/23 leader/guest predicates<br>0x24/25 position n within (p) m<br>0x26/27 character within (p) m<br>0x28/29 missing HP<br>0x2A/2B absolute HP<br>0x2C/2D MP %<br>0x2E/2F full HP/MP<br>0x30/31 weather/mist<br>0x34/35 summon group<br>0x36/37 flag/battle-memory tests<br>0x38/39 nearest/furthest, leader's target, casting<br>0x3A/3B unit counts<br>0x3C/3D group<br>0x3E/3F MP % in 10% steps<br>0x40/41 item count<br>0x42/43 "attacker performing same action"<br>0x44/45 esper duration<br>0 = Unconditional. 2,053 named values in total. | CT L33559 | used-in-code |
| Gambit target type encoding | 0-10: None, Foe, Ally, Leader, Self, Same Group, Ally excl. Self, Same Group excl. Self, Different Group, Current, Auto.<br>Variable-backed types:<br>0x1000+n Scratch1 var (64)<br>0x2000+n Scratch2 var (32)<br>0x3000+n Global Flag (256)<br>0x4000+n Quest Progress<br>0x5000+n Quest Conclusion<br>0x6000+n Quest Stage<br>0x7000+n Quest Location<br>0x8000+n Map Icon Flag<br>0x9000+n Battle Logic Flag (16)<br>0xA000 Caster Battle Memory Flags | CT L35618 | used-in-code |
| Case-link type | Bitmask over 3 cases: 0 none, 3 link cases 2&3, 6 link cases 1&2, 7 link all. | CT L37284 | used-in-code |
| Gambit list (BpGambitList) | 256 gambit targets (0 "Foe: party leader's target" ...). The content id is 0x6000 + index and the text id is 0x3000 + index. | CT L18796 | used-in-code |

#### A.9 File formats: battlepack, ARD, EBP, MRP, TIM2, map ref

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Battlepack sections (BpeSectionList) | 0 Weapon Stances, 3 MP Regeneration, 5 Equipment Categories, 6 Chain Levels, 7 Gambits, 8 Default Party Member Gambits, 9 Party Member Level Growth, 10 Action Groups, 11 Magick Categories, 12 License Nodes, 13 Equipment & Attributes, 14 Actions, 15 Status Effects, 16 Party Members, 17 Battle Menu, 18 Items, 26 Mist, 27 Battle Menu Restrictions, 28 Prices, 29 Magicks, 30 Technicks, 31 Concurrences, 32 Loot, 33 Maps, 34 Teleport Locations, 35 Key Items, 37 Packages, 38 Rewards, 39 Shops, 41 Elements, 42 Initial Inventory, 57 Bazaar Goods, 58 Augments, 59 Story Point Addition Contents, 60 Story Point Additions, 68 "Location Movement Behavior?", 69 Movies. The highest named section is 69. | CT L23576 | used-in-code |
| ARD sections (ArdeSectionList) | 1 Model Motions, 2 Classes, 3 Battle Logics, 4 Units, 7 Default Stats, 8 Additive Stats, 9 Special Action Animations. Sections 0, 5 and 6 are not exposed.<br>ARD enums: charge-aura scale 0 Very Low ... 4; special behaviour 0 None, 1 Northern Gravitational Force Attraction, 2 Immobilized Action Charge, 3 Unknown Gravitational Force Attraction; custom health bar 0 None, 1 one bar, 3 50 bars; red dot 0 Small, 1 Big. | CT L25095-L25152 | used-in-code |
| EBP sections and VM enums | Sections: 0 Script, 4 Navigation Icons, 12 Models, 16 Spawn Positions.<br>Var scope: 0 Global, 1 File, 2 Local, 3 Source Data, 4 Scratch1, 5 Scratch2, 7 Table.<br>Var type: 0 u8, 1 s8, 2 u16, 3 s16, 4 int, 5 float.<br>Req function group: 0 Default, 1 Entry, 2 Spawn, 3 Battle Talk, 5 Respawn.<br>Map icon group: 0 Local Exit Line, 1 Regional Exit Line, 2 Crystal, 3 Normal, 4 Strahl.<br>Field sign: shape 0 Rect, 1 Circle; icon 0 magnifier, 1 "!!", 2 "!".<br>Capture groups: `captureallforsummon` / `capturepartyforsummon`.<br>btlAtelSetStatus value: 0 None, 1 50%, 2 100%, 3 Immune. | CT L25159-L25263 | used-in-code |
| EBP files | EbplEventFileList has 741 event-EBP slots by file id. Low ids are reserve; the names are area/event codes such as `sav_b0181`, `grm_a0480`, `ene_a0180`, `bul_a0380`. The debug slot list has 3 `ctrl`, 4 `evctrl`, 5 `mapctrl`. | CT L27962, L28709 | used-in-code |
| VM opcodes (EBP bytecode, 100) | 0 NOP, 1 LABEL, 2 TAG, 3 SYSHALT, 4 SYSTEM<br>5-25 operators: LOR, LAND, OR, EOR, AND, EQ, NE, GT, LS, GTE, LSE, SLL, SRL, ADD, SUB, MUL, DIV, MOD, NOT, BNOT, UMINUS<br>26 OPFIXADRS, 27 PUSHA, 28 POPA, 29 PUSHX, 30 PUSHY, 31 POPX, 32 POPY<br>33-44 REQ / FREQ / TREQ with SW and EW variants, and PREQ variants<br>45-49 RET, RETN, RETT, RETTN, DRET<br>50-53 REQWAIT, PREQWAIT, REQCHG, REQCANCEL<br>54-69 POPI0-3, POPF0-3, PUSHI0-3, PUSHF0-3<br>70 DVAR, 71 LONGCODESTART, 72 PUSHV, 73 POPV, 74 PUSHDBG, 75 PUSHP, 76 PUSHTAG, 77 PUSHACT, 78 PUSHI, 79 PUSHII, 80 PUSHF<br>81 JMP, 82-87 compare-and-jump forms<br>88 CALL, 89 CALLACT, 90-92 POPX jumps, 93 CALLPOPA, 94 CALLACTPOPA<br>95 REQALL, 96 JMPINTERNAL, 97 REQWAITALL, 98 INCINITTAG, 99 REQIALL | CT L27848 | used-in-code |
| VM call targets (script API) | id = type << 12 \| index. Groups:<br>type 0: 0x000-0x5D7 (1,496; `wait`, `setpos`, `setvelr` ...; 0x100 block = map: `setmapidmj`, `setmapambient`; 0x200 = summon/party: `summonread`, `changetosummonparty`; 0x300 = navi icons and save RAM status; 0x400/0x500 = input, position, `setgambit_slotmax`)<br>type 2: 0x2000+ (212, debug and map load: `mapload`, `mapdispose`, `debug_tkmalloc`)<br>type 3: 0x3000+ (147, battle atelier: `btlAtelSetAbility`, `btlAtelSetUnit`, `btlAtelSetStatus`, `btlAtelSetPoint2` ...)<br>type 7: 0x7000+ (104, full-screen menu and credits roll: `fsmenu_*`, `fsroll_*`)<br>Many are `unkCall_xxxx`. Argument types: 0 Int, 1 Float. Return types: 0 None, 1 Wait, 2 Int, 3 Float. | CT L25849-L27841 | used-in-code |
| MRP (menu resource pack) | File type: 0 Pack, 1 Menu, 2 Last Loaded.<br>Pack sections (23): 0 Controller Icons, 1 Battle/Field, 2 Minimap, 3 Quickening, 4 Level Up/Chain Level, 5 Chocobo, 6 Party Menu, 7 Menus (General), 8 Equip, 9 Inventory, 10 Gambits, 11 Licenses, 12 Config, 13 Event Gauge, 14-15 unknown, 16 Boss HP Bar, 17 New Game Tutorial, 18 Gil Counter, 19 License Board Selection, 20 Save/Load/Speed Icons, 21 On-Screen Keyboard, 22 Keyboard Icons.<br>Menu files: 0 gameover, 1 title, 2 title_menu, 3 save_load, 4 e3_logo, 5 quest, 6 shop_new, 7 w_menu, 8 loca, 9 party_book.<br>Entry types: 2 Texture, 4 Container, 5 Text, 7 Progress Bar, 8 Grid (1, 6 unknown; 3, 9 unused). | CT L25270-L25340 | used-in-code |
| TIM2 / TM2 enums | Colour type: 0 Undefined, 1 16-bit A1B5G5R5, 2 32-bit X8B8G8R8, 3 32-bit A8B8G8R8, 4 4-bit indexed, 5 8-bit indexed.<br>Pixel storage (PS2 GS PSM codes): 0 PSMCT32, 1 PSMCT24, 2 PSMCT16, 10 PSMCT16S, 19 PSMT8, 20 PSMT4, 27 PSMT8H, 26 PSMT4HL, 44 PSMT4HH, 48 PSMZ32, 49 PSMZ24, 50 PSMZ16, 58 PSMZ16S.<br>CLUT storage: 0, 1, 2, 10.<br>Texture function: 0 Modulate, 1 Decal, 2 Hilight, 3 Hilight 2. | CT L25347-L25399 | used-in-code |
| Menu Section Plus enums | Inventory preview resources: 0 Item Gra Texture, 1 Item Clut Pack, 2-9 Item Gra 0-7 Image.<br>Rect processing: 0 Wait, 1 Set Blink, 2 Process Blink.<br>Quickening processing: 0 Wait, 1 Exit, 2 Shuffle. | CT L25655-L25690 | used-in-code |
| Map ref (.mrf) | Sections: 0 Locations, 1 Regions, 3 Weathers, 4 Terrains, 5 Footsteps.<br>Weather: 0 None, 1 Sunny, 2 Cloudy, 3 Rainy, 4 Hailstorm, 5 Sandstorm, 6 Snowcloud, 7 Snowstorm, 8 Foggy, 9 Thunderstorm.<br>Weather type: 0 Rainy, 1 Sand, 2 Snowy, 3 Foggy, 4 Cloudy.<br>Terrain: 32 surface kinds (0 Dirt/Soil, 1 Stone/Rock, 2 Grass ...).<br>Terrain type: 0 Water, 1 Sand, 2 Ice, 3 Earth, 4 Wind. | CT L25521-L25615 | used-in-code |

#### A.10 Other file types and runtime enums

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| File registry types (FvFileTypeList, 41) | 0 image (.irx/.img/.cnf)<br>1 debug (.bin/.ebp/.sav/.wd/.spp)<br>**2 gameplay .bin (battlepack lives here)**<br>4 map control pack .mpk<br>5 location (.ebp/.mot/.fpk)<br>7 menu (.bin/.mrp/.tm2)<br>8 event (.ebp/.mot/.snd/.vpc)<br>9 world .bin<br>10-12 effects .efx (main, magic us, event)<br>13-16 models .cm/.ca (gadget, main char, main high char, weapon)<br>19/20 NPC / NPC high .cm<br>**21 Area Resource Data .ard**<br>22 background .cm/.ca<br>23/24 summon / summon high<br>25 treasure<br>26 .nmb<br>27 sound wave .wd<br>28 movie .mh/.md<br>30 foe special action animation .ca<br>31 BGM .bgm<br>32 .seb<br>33 shout us .win.sab<br>34 foe model .cm/.ca<br>35 menu overlay<br>37 event jp, 38 magic effect jp, 39 shout jp<br>3, 6, 17, 18, 29, 36, 40 are unused or unknown. | CT L25777 | used-in-code |
| Special action processing type | 0 None, 1 Summon, 2 Dismiss, 3 Esper Ultimate, 4 Quickening, 5 Mount, 6 Dismount, 7 ?. Relevant to SummonProbe and esper internals. | CT L25715 | used-in-code |
| Global message (corner pop-up) types | 0 Message, 1 Mist, 2 Quickening, 3 Party Member, 4 Party Members, 5 Key Item. | CT L25454 | used-in-code |
| Map jump group flag groups | 4 Party Menu-Equip, 6 Licenses, 7 Clan Primer, 8 Party, 9 Gambits, 11 Clan Primer sub-pages, 12 Battle Menu leader flag, 13 portrait, 16 World Map, 17 Battle Menu Gambits, 103 Party (Lock). Range mode: 0 Start, 1 End/Single. These are menu lock-out flags per area. | CT L25622-L25648 | used-in-code |
| Shops (BpShopList, battlepack section 39) | 57 shops: 0 Travelling Merchant (Lowtown/N Sprawl) ... 29-36 Assistant Storekeepers (airship routes, Skyferry) ... 56 Odo. Shop event conditions: 0 None, 1 Custom, 2 Story Progress, 3 Clan Rank. Bazaar good type: 0 Non-Repeatable, 1 Repeatable, 2 Monograph. | CT L21562, L25028-L25046 | used-in-code |
| Battlepack index lists (sizes and reserves) | Loot 512 (1-31, 246-255, 270-273, 280-511 reserve)<br>Key items 416 (119-415 reserve)<br>Packages 512 (300-511 reserve)<br>Rewards 256 (0-127, 173-255 reserve)<br>Prices 128<br>Maps 64 (48-63 reserve)<br>Teleport locations 32<br>Story point additions 50 (2-49 reserve)<br>Bazaar goods 128<br>Items 64 (29-41 reserve)<br>Magicks 81, Technicks 24, Concurrences 16 (8-15 reserve) | CT L17309-L21817 | used-in-code |
| Save-game enums | Special foe / trophy state: 0 Inaccessible, 1 Alive, 2 Dead.<br>SgeSpecialFoeStateList: ids 0-107 plus 684 Omega Mark XII.<br>Teleport location slots: 0x8040 + n (32832 Rabanastre ... 32860 Tchita Uplands).<br>Map reveal: 385 maps.<br>Quests: 256.<br>Config: camera 0 Keys / 1 Mouse; battle mode 0 Wait / 1 Active; music 0 Original / 1 Reorchestrated / 2 OST; language 0 English / 1 Japanese. | CT L22063-L23569 | used-in-code |
| Debug and game settings enums | God mode 0 None / 1 Party / 2 All.<br>Forced steal rarity -1..2 (Common/Uncommon/Rare).<br>Forced poach rarity -1..1.<br>Forced drop rarity -1..4 (4 = Guaranteed).<br>Game language 0 Japanese, 1 English, 2 French, 3 German, 4 Italian, 5 Spanish, 6 Korean, 7 Traditional Chinese, 8 Simplified Chinese.<br>Frame limit 0 = 30, 1 = 60.<br>Confirm button 0 Circle, 1 Cross.<br>Input icons 0 Auto, 1 Keyboard, 2 PlayStation, 3 Xbox. | CT L28734-L28923 | used-in-code |
| Traveler's tips / bestiary requirements | 16 primer pages (0 The Clan Primer ... 15 Chaining for Fun & Profit). Bestiary requirement type: 0 Kill Count, 1 Story Progress, 2 Bestiary Page. | CT L25406, L25436 | used-in-code |

### B. Script-level facts (from the secondary reference doc, not re-verified on this Drive copy)

#### B.1 Global pointers and file layouts

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Version guard | The 5 code-patching scripts guard their patches with `assert(...)` on the original bytes and restore them on disable. The table has no AOB scans; every other static row is absolute and specific to this build. | ref L115, L134, L1872 | unclear (doc says byte assert) |
| Code patches | Free Teleport: 0025DE62, 002EFC5D.<br>Custom Foe Respawn: 002358A1, 002358EB.<br>Custom Battle Menu Action: 002FFC81 (`test eax,eax` becomes `cmp eax,eax`, an always-legal action check), 00305AE4 (substitute the selected action id), 0030EF9A (`cmp ax,cx` becomes `cmp eax,eax`, items are not consumed).<br>MRP Editor hooks: 0032E8C9, 002A00FF (record menu-file and last-MRP base pointers).<br>Forced Input Icons: 00197780, 002AEC15. | ref L123-L131, L649-L656 | unclear (doc: assert-guarded) |
| Battlepack pointer | qword [0208E680] points to the file base. dword [base] = section count. Section i base = dword [base + 4 + i*4]. In memory these are absolute 32-bit pointers; on export the CT converts them back to file-relative offsets. The file is type 2, id 0x13. | ref L241, L966-L978, L1422 | unclear |
| ARD pointer | qword [02B5E0C0] points to the file base. Fixed 10 sections. Section i = base + dword [base + 8 + i*4]. These are relative offsets, not pointers. | ref L242 | unclear |
| EBP slots | qword [022C6C00 + slot*8], 5 slots (0 Battle ... 4 Debug). Pre-Z EBP size is at 022C6D3C. | ref L243, L1365 | unclear |
| st2e container | +0x00 'st2e', +0x04 count (u32), +0x08 entry size (u16), +0x0C entry list ptr/offset, +0x14 text section offset (zeroed on export). The default header size is 0x20. Sections 0, 10, 13, 27 and 39 use bespoke layouts:<br>section 0: entry size at +0, count at +2, data from +4<br>section 10: an offset table<br>section 13: equipment, plus an attribute list at +0x18 (0x18-byte records sitting before section 14)<br>section 27: restrictions at +0x0C, modes at +0x1C<br>section 39: shops, then events, then contents | ref L251-L267, L805-L839, L845 | unclear |
| Battlepack section cache | 55 qword globals in the 02EBF008-02EBF200 block, which the hot-reloader rewrites. The mapping is non-linear. Known entries: 02EBF038 = section 12, 02EBF0D8 = 7, 02EBF130 = 16, 02EBF138 = 14 (actions), 02EBF190 = live battle/party block, 02EBF1A0 = 12 licence boards. | ref L271-L287 | unclear |

#### B.2 Battlepack records

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Action record (section 14) | +0x00 menu description text id<br>+0x05 range<br>+0x06/07 AoE size, cone/linear size<br>+0x08 formula<br>+0x09 charge time<br>+0x0A MP/mist cost<br>+0x0C flag word 1 (target self/ally/foe, initial target 3 bits, battle-menu type 2 bits, reflect/evade/immunity/silence flags, AoE origin/shape, use event script ...)<br>+0x10 power, +0x11 power multiplier, +0x12 accuracy<br>+0x13 element bits, +0x14 on-hit rate<br>+0x18 status bits (32)<br>+0x1C character animation<br>+0x1E battle-menu category<br>+0x21 charge aura<br>+0x22 required content<br>+0x24 cast animation or event script<br>+0x26 summoned party member<br>+0x28 mist cast animation<br>+0x2C flag word 2 (magick category 3 bits, No License, Is Offensive ...)<br>+0x2E inventory description text id<br>+0x34 name text id<br>+0x36 flag word 3<br>+0x38 gambit page, +0x39 gambit page order<br>+0x3A battle memory flag | ref L866-L899 | unclear |
| Party member record (section 16) | +0x00 forbidden equipment category bits<br>+0x04-06 quickenings<br>+0x07 behind-camera id<br>+0x0A-0x12 default equipment (5 x u16)<br>+0x14 gambit set id (content form = +0x5000)<br>+0x16-0x2A stats and modifiers<br>+0x2E level<br>+0x30 name id<br>+0x32 summon time<br>+0x34 10 inventory/ability slots<br>+0x3E gil<br>+0x44 LP<br>+0x48 status bits<br>+0x4C immunity bits<br>+0x50 64-bit augments<br>+0x70 model (u32)<br>+0x74/75 model variation / colour variation<br>+0x7A weight x10 | ref L914-L936 | unclear |
| Equipment record (section 13) | +0x02 name, +0x04 icon, +0x08 sort, +0x09 category, +0x0E description (inert), +0x10 metal, +0x12 gil, +0x28 attribute pointer.<br>Attribute record (0x18 bytes): Max HP, Max MP (u16), Str/Mag/Vit/Spd (u8), then status, immunity and element bitfields. | ref L849-L853 | unclear |

#### B.3 ARD records

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| ARD units (section 4) | +0x00 class id<br>+0x03 flags (health bar type, red dot, boss)<br>+0x08 name id<br>+0x0A-0x0E size % XYZ<br>+0x16 weapon<br>+0x18 custom initial HP (u32)<br>+0x1C off-hand<br>+0x22 default stats id<br>+0x24 additive stats id<br>+0x28-0x30 drops (5 tiers)<br>+0x32-0x36 steals<br>+0x42/43 monograph/canopic rates<br>+0x44/46 poaches<br>+0x50 4 battle-logic ids (u16) | ref L1022-L1044 | unclear |
| ARD classes (section 2) | +0x00 model<br>+0x04 classification, +0x05 genus<br>+0x10 weight<br>+0x12 / +0x18 flags (flying, floating, teleport, special behaviour)<br>+0x20 max combo<br>+0x22/23 angle/radius detection<br>+0x25/26 magick/life detection<br>+0x28 no-chain flag<br>+0x29 elemental affinities<br>+0x40 chain id<br>+0x52 bestiary id | ref L1054-L1068 | unclear |
| ARD default stats (section 7) | +0x20 Max HP, +0x30 gil, +0x34 EXP. Licence points also live here. | ref L1010 | unclear |

#### B.4 Live battle structures and menu globals

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Battle actor chain | Battle Script Keep [02098E10 + sid*0x288] (5 keeps).<br>+0x08 actor list: [list] = count, actor = [list + 8 + i*8].<br>Battle Actor Work (288 B): +0x30 Battle Unit Work (3,920 B), +0xC0 model (392 B), which holds +0x138 Battle Actor Keep (304 B).<br>Unit Work: +0x698 Battle Unit Keep (464 B), +0x6A0 Keep Plus (128 B), +0xE60/E68/E70/E78 pointers to ARD unit / class / default stats / additive stats. | ref L332-L398 | unclear |
| Battle Unit Keep (the character sheet) | +0x05 type (0 = party member)<br>+0x24 Max HP (u32), +0x28 Max MP<br>+0x48 HP, +0x4C MP<br>+0x50 equipment (5 x u16)<br>+0x68 temporary augments (32 B)<br>+0x75/+0x85 gambit-slot bits<br>+0x18C EXP, +0x190 LP<br>+0x194 licence bitfield<br>+0x1C2 level<br>+0x1C3-0x1C5 jobs (0xFFFF/0xFF = none) | ref L740-L755 | unclear |
| Leader and target ids | Party leader actor id is the word at [022C7FE0]; the current target is the word at [022C8380]. | ref L312-L313 | unclear |
| Menu and pause globals | [01FD4948] auto-pause menu section, [02092730] active menu id, [021654C4]/[021654C8] current location / position, [021B8410] bit 0 esper out, bit 1 chocobo, [022C256C] LCRNG, [02EB4230] MT index. | ref L317-L323 | unclear |
| Save blocks | Session [02092758] (0x200 B; CRC at +0/+4, gil +8).<br>World [02092758]+0x200 (0x2000 B, all story/quest flags).<br>Menu [020927C0] (0x4818 B; bestiary at +0x3404 for 0x400 B).<br>Live battle block [02EBF190] (0x8004 B). | ref L294-L298, L629 | unclear |
| Action list categories (battle menu) | [0208CD20], 26 records: +0 actions pointer, +8 count. They are rebuilt by "Refresh Action List Categories" after a category edit. Relevant to adding a Blue Magick menu category. | ref L1359 | unclear |
| Inventory category table | 01EEBCC0 + cat*0x58, element count at +0x3C (14 categories). | ref L446, L575 | unclear |

#### B.5 Game functions, VM and file loader

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Game functions (callable) | 00320A40 get Battle Unit Keep (ecx = member)<br>00358940 get Battle Actor Work<br>0030C470 set level / recompute<br>0030F4B0 heal/refresh (edx flags, 0x0F = full)<br>0037C980 party re-read (appearance)<br>0031A260 unequip all<br>0031A630 equip<br>00323910 unlock licence node<br>003172E0 / 003170E0 add member / guest<br>00328B20 / 003288F0 remove member / guest<br>003008A0 modify inventory (id, count, op, target, flags)<br>00314440 teleport<br>003137F0 / 003138D0 / 00313550 get summoner, dismiss esper, clear esper<br>002E16B0 / 002E08C0 open / close message window<br>002E1A60 open full-screen menu (ecx flags, edx id; shop = 2, save/load = 5, 0x8000 = top layer)<br>002EFA70 fade<br>001DBDB0 play SE<br>0032FC30 / 002628B0 queue / dispose EBP<br>0032E400 / 0032E620 file size / read file<br>0036A190 / 003697F0 alloc / free<br>005CCB80 sleep<br>00267F90 / 00267F60 push VM int / float arg | ref L464-L491, L613-L621 | unclear |
| VM call target table | [02B57EF0 + type*8] gives the per-type table. The record at +0x08 + index*0x20 holds start call (+0), wait call (+8) and end call (+0x18). The VM opcode table is at [01EFEA50] (100 records: name ptr +0, size +0x10). | ref L1377, L1407 | unclear |
| File registry and hot reload | File registry [0215F000 + type*8], then [+fid*8]. Reload ids: battlepack type 2 / id 0x13; MRP pack 7 / 0xD3; licence boards 2 / 0x47-0x52; map ref 9 / 4; PC skill motion 9 / 5; behind camera 9 / 3. The system menu message ids come from a list at 01E09F68. | ref L1411, L1421-L1428 | unclear |

#### B.6 Menu sections, UI colours and the companion check

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Menu section record | +0x00 process call, +0x08 unload call<br>+0x10 parent, +0x18 child, +0x20 younger sibling, +0x28 older sibling<br>+0x30 child count<br>+0x50 flags (entry count = (dword >> 2) & 0xFFFF)<br>+0x58 MRP group<br>+0x60 entry list (entry i = [list + i*8])<br>+0x98-0x9E X, Y, W, H<br>+0xA0 alpha, +0xA1 contrast | ref L1219-L1234 | unclear |
| UI colour settings (HudColors) | The "UI Settings" group (257 static rows, uses the game's own variable names) includes sixteen `HpGauge*` RGBA byte components for enemy, side and other gauges, plus the BattleCommand*, MsgWin*, Font* and LicenseBoard* layout values. The absolute addresses are in the full CT only. | ref L1459 | unclear |
| Companion-mod check | Party Editor compares 16 bytes at 0x01EF4168 and 0x01EF4188 against vanilla vtable bytes. If they differ, it routes add/remove through "The Insurgent's Companions". | ref L566 | unclear (doc: byte compare) |

### C. Corrections to `insurgents_toolkit_reference.md` (the Drive data wins)

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Gil content ids | Gil is **0xE000 + amount** (0xE000-0xEFFF, "0 Gil" ... "4095 Gil"). It is not 0xF000; only 0xFFFF exists above 0xEFFF. | CT L6542 vs ref L575, L1590 | used-in-code |
| Content block 0x3000 | **0x3000 is magicks** and 0x4000 is technicks. Gambits are 0x6000, not 0x3000. | CT L15309-L15430 vs ref L575 | used-in-code |
| Desc block bases | The names block starts at 0x4000, bazaar goods at 0x4800 and augments at 0x5000. The doc's 0x4200 / 0x4880 / 0x5080 are near the block ends. DescEquipmentList starts at 2048 (0x800), not 2047. | CT L598, L1918-L2689 vs ref L1529, L1543 | used-in-code |
| Map-ref enums | Weather type is Rainy, **Sand**, Snowy, Foggy, Cloudy. Terrain type is Water, **Sand, Ice, Earth**, Wind. The doc's "Earth/Fire/Lightning" is wrong. | CT L25554, L25603 vs ref L1178 | used-in-code |
| Menu Section Plus enums | Rect processing: Wait / **Set Blink** / Process Blink. Quickening processing: Wait / **Exit** / Shuffle. | CT L25655-L25672 vs ref L1251, L1261 | used-in-code |
| Party member ids | Espers are **27-39** and 26 is Chocobo. 0-5 are the six mains, 6 Reks and 7-14 guests. (The doc says espers are 32-39.) | CT L21824 vs ref L533 | used-in-code |
| Battlepack section names | 8 = Default Party Member Gambits, 9 = Party Member Level Growth, 17 = Battle Menu. | CT L23576 vs ref L810-L819 | used-in-code |
| VM call id type field | Only types 0, 2, 3 and 7 occur. Type 0 spans indices 0x000-0x5D7, which needs more than 8 bits, so "low 12 bits = index" is consistent. | CT L25875 | used-in-code |

### Editor relevance

- **Offline editors.** The verified data gives:
  - every enum needed to label battlepack, ARD, EBP, MRP, TM2 and map-ref fields
  - the action id map: segment rules, plus the free slots 497-542 and other reserves for adding actions
  - the content id rules (category << 12, gil at 0xE000)
  - the text id blocks (0x800 per family) and the menu help-text bases, with `{link=N}` tags preserved
  - the model id ASCII-prefix rule
  - the file-type taxonomy for VBF lookups (battlepack = type 2 id 0x13, ARD = type 21)
- **Lua / CE memory editors.** Section B gives the global pointers, struct offsets and callable
  functions: battle actor chain, Battle Unit Keep, action list categories at [0208CD20], inventory
  modify at 003008A0, open menu at 002E1A60, VM call table. They still need re-checking against the full
  CT once Drive access works. Only the 5 patch scripts are byte-guarded.
- **To do.** Re-download Drive id 1XRyS0dGFx9QCoDHR5o80jsLN9M-bWV8Y with `download_file_content` and run
  `scratchpad/drive_extract.py`. Then verify section B, and get the `UI Settings` HpGauge colour addresses
  and the rest of `LocationList` (1,315 entries).
