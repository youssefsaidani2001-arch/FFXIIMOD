# Drive batch 05: BlueMagick `spells_sword.lua` + ClanCenturioEquipmentProgression modules

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR.

Files in this batch (all read in full):

| Drive id | Title | Drive path | Lines | Author header |
|---|---|---|---|---|
| 1vtrld2UtQlF3gf8x0mkZuU-C-YUfhH4Q | spells_sword.lua | My Laptop/scripts/BlueMagick | 422 | none (data module of BlueMagick.lua) |
| 1AJa3oD2bTlEYo6ikdQ2rQO0G9hvbAncd | color.lua | My Laptop/scripts/ClanCenturioEquipmentProgression | 57 | FehDead |
| 1E6JmxWxJgPudYX9Zqc-dBIIKrZB135iM | controller.lua | same | 63 | FehDead |
| 1NuPFuKicpyLVpsSSg2Y2g_JbD_nLHs84 | description.lua | same | 115 | FehDead |
| 1QwdihmPsk_RtI4TVor64LIdnc2yHmw3f | equipment.lua | same | 167 | FehDead |
| 1WCCaoKhH4ZzFAmsnqeD5DpotNFDaWs2j | frame.lua | same | 72 | FehDead |
| 1pnOuL3EeGEWEbn2yCnZZNKrHuax_nhSZ | mappings.lua | same | 35 | FehDead |

No file was missing. None of these files is by Xeavin. Everything below is paraphrased: facts only, no copied code.

To interpret a few fields, I looked at files outside this batch, but did not mine them here:
`BlueMagick.lua` (action-record writer, `ENCH.apply`), `ClanCenturioEquipmentProgression.lua` (main file that wires
the CCEP modules), `equipmentData.lua` (CCEP config) and LowPriorityCitizen's `helpers.lua`/`layout.lua` (menu
resource pack). Rows that rely on them say "(xref)".

Evidence key: **byte-check-in-code** = code checks the original bytes before patching. **used-in-code** = code
reads or writes the address or field. **comment-only** = only a comment says so. **unclear** = my inference.
No file in this batch checks original bytes before patching.

---

## Quick reference

### Global addresses (Lua Loader address space; RVA = address - 0x120000)

| Address | RVA | What | Access | Source | Evidence |
|---|---|---|---|---|---|
| `0x02099DF0` | 0x01F79DF0 | CCEP "flow" base: a block of bytes shared by the mod's NPC event script and Lua (offsets below) | u8 / u16 | mappings L5 | used-in-code |
| `0x021654C4` | 0x020454C4 | current location (map) id | u32 (other mods read s32) | mappings L6; main L169 (xref) | used-in-code |
| `0x00320A40` | 0x00200A40 | game function: party member index to battle-unit "keep" pointer | `memory.execute` | mappings L7, equipment L159 | used-in-code |
| `0x0030FED0` | 0x001EFED0 | game function: refresh a battle unit's derived stats | `memory.execute` | mappings L8, equipment L161 | used-in-code |
| `0x0209AC60` | 0x01F7AC60 | menu resource pack (MRP) section table: 23 x u64 section pointers | u64[] | frame L9-12 | used-in-code |

### Bit orders shared by both mods

| Bit | Element (u8 mask) | Status (u32 mask, bit index) |
|---|---|---|
| 0 / 0x01 | Fire | KO |
| 1 / 0x02 | Lightning | Stone |
| 2 / 0x04 | Ice | Petrify |
| 3 / 0x08 | Earth | Stop |
| 4 / 0x10 | Water | Sleep |
| 5 / 0x20 | Wind | Confuse |
| 6 / 0x40 | Holy | Doom |
| 7 / 0x80 | Dark | Blind |
| 8..15 | n/a | Poison, Silence, Sap, Oil, Reverse, Disable, Immobilize, Slow |
| 16..23 | n/a | Disease, Lure, Protect, Shell, Haste, Bravery, Faith, Reflect |
| 24..31 | n/a | Invisible, Regen, Float, Berserk, Bubble, HP Critical, Libra, X-Zone |

Element order is from CCEP `equipment.lua` L4 (bit = list position - 1, L130). The status index is from L6-39. Bit is
`1 << (index % 8)` in byte `index / 8`, L101-102, so the bytes are little-endian. `spells_sword.lua` agrees with both:
Fire 0x01, Lightning 0x02, Ice 0x04, Water 0x10, Holy 0x40, Petrify 0x0004, Sleep 0x0010, Poison 0x0100, Silence 0x0200, Sap 0x0400.

---

## 1. `spells_sword.lua` (BlueMagick data module)

**Purpose.** This file only holds data. BlueMagick.lua runs it as a chunk and passes one argument, a table of constants
(`VANILLA_MAG`, `SCHOOL2`, ...). The file returns a list of spell descriptors for the seventh magick school, "Sword
Magicks" (school 6). Each spell is cast on yourself. It temporarily "infuses" the caster's equipped sword-class weapon by
rewriting that weapon's sec13 equipment record: Attack, element, on-hit status and rate, damage formula, and hit spark.
After 5 minutes BlueMagick restores the saved bytes. Each spell reuses an existing action id and clones the vanilla
Bravery record (action 53) as a self-only buff shell. It then overrides a few action-record bytes. The file adds no
machinery. The sec29 magick list, help text, gambit grid, magick bag and poll all belong to BlueMagick.lua.

### Spell table

Row = sec29 row index. `VANILLA_MAG` = 81 (xref BlueMagick L86), so rows +39..+57 are absolute rows 120..138.

| Key | Label | Row | Action id | Help text id (+0x00 u16) | MP | Effect (+0x24) | Gambit (+0x38,+0x39) | Enchant effect | Hit spark (weapon +0x2C) |
|---|---|---|---|---|---|---|---|---|---|
| biosword | Enbio | +39 | 535 | 0x1089 = 4233 | 20 | 27 Bio | 5,0 | Atk +20, on-hit Sap 0x0400 @70% | 0x800B |
| frostblade | Enfrost | +40 | 536 | 0x108A = 4234 | 24 | 21 Blizzard | 5,1 | Atk +15, element Ice 0x04 | 0x8041 |
| blizzarasword | Enblizzard | +41 | 537 | 4235 | 12 | 26 Blizzara | 5,2 | Atk +10, Ice | 0x8041 |
| blizzagasword | Enblizzaga | +42 | 538 | 4236 | 30 | 31 Blizzaga | 5,3 | Atk +30, Ice | 0x8041 |
| poisonsword | Enpoison | +43 | 277 | 4237 | 1 | 60 Poison | 5,4 | formula 27, on-hit Poison 0x0100 @40% | 0x8043 |
| silencesword | Ensilence | +44 | 323 | 4238 | 1 | 270 Screech | 5,5 | clear element, on-hit Silence 0x0200 @40% | 0x8006 |
| sleepsword | Ensleep | +45 | 450 | 4239 | 1 | 351 Pollen | 5,6 | clear element, on-hit Sleep 0x0010 @40% | 0x8008 |
| breaksword | Enbreak | +46 | 539 | 4240 | 6 | 44 Break | 5,4 | clear element, on-hit Petrify 0x0004 @30% | 0x801A |
| drainsword | Endrain | +47 | 243 | 4241 | 6 | 74 Drain | 5,5 | formula 67 (Leech) | 0x804D |
| osmosesword | Enosmose | +48 | 276 | 4242 | 15 | 75 Syphon | 5,6 | weapon untouched; 15 MP taken per attack command | 0x8005 |
| firesword | Enfire | +49 | 540 | 4243 | 24 | 19 Fire | 5,5 | Atk +15, Fire 0x01 | 0x8003 |
| firasword | Enfira | +50 | 541 | 4244 | 12 | 24 Fira | 5,6 | Atk +10, Fire | 0x8003 |
| firagasword | Enfiraga | +51 | 542 | 4245 | 30 | 29 Firaga | 5,7 | Atk +30, Fire | 0x8003 |
| thundersword | Enthunder | +52 | 497 | 4246 | 24 | 20 Thunder | 5,8 | Atk +15, Lightning 0x02 | 0x802E |
| thundarasword | Enthundara | +53 | 146 | 4247 | 12 | 25 Thundara | 5,9 | Atk +10, Lightning | 0x802E |
| thundagasword | Enthundaga | +54 | 149 | 4248 | 30 | 30 Thundaga | 5,10 | Atk +30, Lightning | 0x802E |
| watersword | Enwater | +55 | 451 | 4249 | 24 | 22 Aqua | 5,16 | Atk +15, Water 0x10 | 0x803F |
| flaresword | Enflare | +56 | 242 | 4250 | 60 | 34 Flare | 5,11 | Atk +60, clear element | 0x8059 |
| holysword | Enholy | +57 | 244 | 0x109B = 4251 | 100 | 18 Holy | 5,13 | Atk x2 (capped at 255), Holy 0x40 | 0x804C |

Every row: `clone = 53` (Bravery), `charge = 15`, `dynamic = "swordEnchant"`, `school = SCHOOL2` (6).

### Facts

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Stale header | The header says 15 spells on rows +39..+53. The table actually has 19 entries on rows +39..+57. Enthundaga, Enwater, Enflare and Enholy (+54..+57) fall outside the stated range. BlueMagick L164 repeats the stale "15 / +39..53" text | L1 vs L39-L407 | used-in-code (row field) |
| Chunk loading | BlueMagick runs this file as a chunk and passes the constants as the vararg (`local K = ...`). The file returns the list | L7, L422 | used-in-code |
| Weapon hit-spark field | sec13 (equipment) weapon record +0x2C is a u16 "Effect Finishes" id from the 0x8001+ range. It is the impact spark drawn on every weapon hit. Each spell gets one through `enchHit` | L9-26, L420 | used-in-code (applied in BlueMagick ENCH.apply, xref L1415) |
| Hit-spark id catalogue | 0x8003 Bash/Fire; 0x8005 Bash/white-blue; 0x8006 Bash/white-yellow; 0x8008 Bash/white-purple; 0x800B Slash/green-gold; 0x801A Sparkle/Earth; 0x802E Bash/bright yellow; 0x803F Bash/white-blue; 0x8041 Bash/Ice; 0x8043 Bash/white-green; 0x804C Fang/Holy; 0x804D Fang/Dark; 0x8059 Bright Spark/yellow-white | L13-25 | comment-only (labels); ids used-in-code |
| Action record donor | Every spell clones action 53 (Bravery) with an empty status list and self-only targeting (the comments say Metallic Body uses the same shell). The record then acts as a buff cast | L36-37, L39 | used-in-code (`clone = 53`) |
| Action record +0x00..+0x01 | u16 help/description text id. The spells set 0x1089..0x109B (4233..4251), one new help line per spell | L47 etc. | used-in-code (`extra` bytes) |
| Action record +0x08 | Formula byte. 2 = "add buffs" (applies the listed buffs, here none) | L43 | used-in-code; meaning comment-only |
| Action record +0x0C | flags1 low byte. 0x41 = can target self only | L46 | used-in-code; meaning comment-only |
| Action record +0x18..+0x1B | Ailment bytes (+0x18/+0x19) and buff bytes (+0x1A/+0x1B), all zeroed so that Lua applies the enchant, not the engine | L44-45 | used-in-code; meaning comment-only |
| Action record +0x09 / +0x0A / +0x24 / +0x38-39 | `charge` (15) goes to +0x09 charge time. `mp` goes to +0x0A MP cost. `efx` goes to u16 +0x24, the Animations-sheet visual (bound at boot). `gambit` {cat, idx} goes to +0x38/+0x39 | L41, L48 | used-in-code (xref BlueMagick L906-916) |
| Action record stride | 0x3C bytes per action (BlueMagick `ACTION_ESZ`) | xref BlueMagick L89 | used-in-code |
| sec29 magick row | 8 bytes: u16 price, u8 action id (low byte), u8 0x2C + school, u16 name text id, u16 sort. School 6 means byte 3 = 0x32 | xref BlueMagick L674-682 | used-in-code |
| Spell visual ids (efx) | 18 Holy, 19 Fire, 20 Thunder, 21 Blizzard (small ice crystal), 22 Aqua, 24 Fira, 25 Thundara, 26 Blizzara, 27 Bio (green splash), 29 Firaga, 30 Thundaga, 31 Blizzaga (stalagmite), 34 Flare, 44 Break (dark green-black gas), 60 Poison, 74 Drain (peach absorbing mist), 75 Syphon (azure absorbing mist), 270 Screech (yellow sound wave), 351 Pollen (yellow clouds) | L48, L68, ... L415 | comment-only (names); ids used-in-code |
| Reused action ids | 146, 149, 242, 243, 244, 276, 277, 323, 450, 451, 497, 535-542 are taken over as Sword Magick records | per entry | used-in-code |
| Weapon record +0x19 | Damage formula byte. 27 = "Piercing Weapon". It calls function 70:PiercingPower, which sets the target's Defense to 0. It is a full weapon chain (accuracy, crit, element, on-hit status kept; no combo or counter) and scales off Attack Power, not Strength | L118-122, L130 | value used-in-code; semantics comment-only |
| Weapon formula 67 | "Leech" (Draining - Physical). Two functions: 76:EnemyAttackPower then 148:Leech. It skips accuracy, combo, crit, knockback, elemental affinity and on-hit status. It does not check Reverse or Undead | L208-215, L221 | value used-in-code; semantics comment-only |
| Weapon record +0x1E | Element mask (byte). Enchants OR an element in. `enchEleClear` writes 0 (non-elemental) | L142-144, L188-189 | used-in-code (xref ENCH.apply L1416-1417) |
| Weapon record +0x1F / +0x20 | +0x1F u8 on-hit status chance (%). +0x20 u32 on-hit status mask. Enchant ORs in `enchStatus` and raises the rate to `enchRate` if that is higher | L42, L130, L153, L176, L197 | used-in-code (xref L1418-1420) |
| Weapon record +0x1A | Attack Power (u8). New Atk = old x `enchAtkMul` + `enchAtk`, capped at 255 | L398-400, L409 | used-in-code (xref L1408-1410) |
| Battle stat entry +0x44 | u16 = action id the party slot is currently performing. 150 = Attack. Enosmose drains 15 MP from the current target each time this changes to 150 (once per attack command, even if the swing misses) | L231-238 | comment-only here (used in BlueMagick poll, xref L1473) |
| Undecoded field | The battle unit's elemental absorb/affinity field is NOT in the sec13 record and is not decoded. That is why Frost Blade and Water Blade cannot absorb | L55-56, L360-361 | comment-only |
| Sword gate | Only Sword, Greatsword, Katana or Ninja Sword can hold an enchant (equipment categories 1-4). Any other weapon gets a guaranteed Miss | L35 | comment-only (xref BlueMagick SWORD_CATS L83-85) |
| Vanilla data point | Ancient Sword ships with Petrify on hit at 15% | L190-191 | comment-only |
| FFXII Bio | Vanilla Bio inflicts Sap (status bit 10), not Poison | L34 | comment-only |
| Gambit slot collisions | Category 5 indices repeat: 4 (Enpoison, Enbreak), 5 (Ensilence, Endrain, Enfire), 6 (Ensleep, Enosmose, Enfira). Index 12 and 14-15 are unused | L136, L203, L159, L227, L267, L182, L250, L284 | used-in-code (possible bug) |
| Enchant lifetime | 5 minutes. Recasting on the same weapon ends the old enchant first. On expiry the saved +0x19, +0x1A, +0x1E, +0x1F, +0x20 (u32) and +0x2C (u16) are restored | comments L33, L54 | comment-only here (xref BlueMagick ENCH.apply / ENCH.stop L1380-1395) |
| Combat log | `enchWord` is the word printed in the combat-log line | L49 | comment-only |

---

## 2. `color.lua` (CCEP)

**Purpose.** Maps a CCEP upgrade level (0..12) to an RGBA colour. The same colour tints the description-box frame
(frame.lua) and the item-name suffix (description.lua).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Level 12 | (200, 40, 30, a 68): red | L5-11 | used-in-code |
| Level 11 | (255, 100, 0, a 68): orange | L12-18 | used-in-code |
| Levels 9-10 | (100, 50, 255, a 68): purple | L19-25 | used-in-code |
| Levels 6-8 | (40, 100, 255, a 68): blue | L26-32 | used-in-code |
| Levels 3-5 | (50, 200, 60, a 68): green | L33-39 | used-in-code |
| Levels 1-2 | (78, 78, 78, a 88): grey | L40-46 | used-in-code |
| Level 0 | (38, 38, 34, a 128): the darkest colour and the highest alpha, probably close to the vanilla frame colour. Alpha tops out at 128, which fits the PS2 convention where 0x80 = fully opaque | L47-53 | used-in-code; vanilla match and alpha scale are unclear |

---

## 3. `controller.lua` (CCEP)

**Purpose.** A poll loop that runs only while the player is on the target map (location 302). It watches the
"flow" bytes that the mod's NPC event script writes. When a conversation starts, it writes the list of upgrade
items into memory. When the sigil level changes, it rescales all configured equipment.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Poll timer | `event.executeAfterMs(2000, cb)` re-arms itself every 2 s. A generation counter (`pollId`) cancels old chains on stop/start | L21, L23-24, L37 | used-in-code |
| Start-talk flag | u8 at `base + 0x99` (0x02099E89). When it reads 1, Lua clears it to 0 and writes the upgrade-item list (handshake with the event script) | L26-29 | used-in-code |
| Sigil level | u8 at `base + 0x100` (0x02099EF0). If it is non-zero and different from the cached level, equipment scaling runs for that level | L31-35 | used-in-code |
| Location gating | `controller.location(id)` starts polling if id == 302, otherwise stops. The main file calls it on `onMapJump` and, after `onSaveLoad`, with `u32[0x021654C4]` | L40-46; main L167-176 (xref) | used-in-code |
| Rank validation | Only ranks 1..12 are valid. Anything else becomes 0 and scaling is skipped | L48-53; main L59-67 (xref) | used-in-code |
| Lua Loader APIs used | `event.executeAfterMs`, `memory.u8[]` | L21, L26 | used-in-code |

---

## 4. `description.lua` (CCEP)

**Purpose.** Uses the DynamicDescription mod's API to change what the item screen shows. It colours the item name by
rarity, appends "+N" to it, and adds a small green "+delta" after every stat that the current level changed.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| DynamicDescription API | `dd_api.attributeOverride.delete(bitId)`, `dd_api.attributeOverride.create(bitId, fieldName, {valueColor = "r,g,b", valueSuffix = string})`, `dd_api.refresh()`. If the API is missing, this module skips the work | L72-75, L80, L85-88, L101-103, L112 | used-in-code |
| Override key (`bit`) | Each config entry has `bit` = the item's id. For equipment, id = 0x1000 + sec13 index (equipmentData entry 0 has bit 4096) | L78; equipmentData L4-5 (xref) | used-in-code |
| Override field names | name, attackPower, defense, magickResist, evadeShield (%), evadeWeapon (%), magickPower, maxHp, maxMp, strength, vitality, speed, range, chargeTime (%), onHitRate, knockbackChance (%), comboOrCriticalChance (%) | L4-69 | used-in-code |
| Config abbreviation map | atk, def, mres, evas, evaw, mgk, hp, mp, str, vit, spd, rge, crg, hit, kb, cmb map to the fields above | L4-69 | used-in-code |
| Inline text markup | DynamicDescription strings accept the inline tags `{rgb:R,G,B}`, `{scale:N}` and `{vpos:N}`. The delta uses colour 51,204,51, scale 54, vpos -18, then goes back to vpos 0, scale 60 (60 = presumably the normal text scale) | L100 | used-in-code; the default scale value is unclear |
| Name suffix | Name colour comes from color.lua (`"r,g,b"` string). The suffix is "+level" | L83-88 | used-in-code |

---

## 5. `equipment.lua` (CCEP)

**Purpose.** Writes per-level values into the equipment table (`bpack.section13`, through the Lua Loader's battlepack
accessors) and into each item's shared attribute block. It then asks the engine to recompute the stats of all 40 party
slots.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Equipment accessor fields (sec13) | Field names on Lua Loader's section13 entry: attackPower, defense, magickResist, evadeShield, evadeWeapon, range, chargeTime, onHitRate, knockbackChance, comboOrCriticalChance, `elements.{fire..dark}` (0/1 each), `attributePointer`, raw `u8[]` | L58-70, L90-91, L78, L108 | used-in-code |
| Augment slot | The config key `aug` also writes to attackPower. For some item kinds the same field holds the augment id | L69 | used-in-code; meaning unclear |
| Weapon on-hit status | Equipment record bytes +0x20..+0x23 = u32 on-hit status mask (status index order). Cleared, then ORed per level | L107-118 | used-in-code |
| Attribute block +0x00 / +0x02 | u16 HP bonus, u16 MP bonus | L50-51 | used-in-code |
| Attribute block +0x04..+0x07 | u8 Strength, Magick Power, Vitality, Speed bonuses | L52-55 | used-in-code |
| Attribute block +0x08..+0x0B | On-equip (auto) status mask, u32 in status index order | L147 | used-in-code |
| Attribute block +0x0C..+0x0F | Status immunity mask, u32 | L148 | used-in-code |
| Attribute block +0x10..+0x14 | Element masks (one u8 each): +0x10 absorb, +0x11 immune (null), +0x12 half, +0x13 weak, +0x14 potency (boost) | L41-47, L120-136 | used-in-code |
| Shared-block caveat | The attribute block is reached through a pointer and is shared between items (the code calls these stats "SHARED"). Writing it changes every item that points at the same block. An editor should warn or clone the block | L49, L78-84 | used-in-code; aliasing consequence is unclear |
| Party battle-unit lookup | `memory.execute(0x00320A40, ret pointer, s32 partyMemberId)` returns the battle-unit keep pointer (0 = none). Members 0..39 | L159; mappings L7, L30-33 | used-in-code |
| Stat refresh call | `memory.execute(0x0030FED0, ret void, {pointer, s32}, {keep, 0x97})`: refreshes derived stats. CCEP passes flags 0x97 | L161-162; mappings L8, L17 | used-in-code |
| `memory.execute` conventions | First form: (addr, returnType, argType, arg) for one argument. Second form: (addr, returnType, {argTypes}, {args}) for several | L159, L161-162 | used-in-code |

---

## 6. `frame.lua` (CCEP)

**Purpose.** Finds a specific frame entry in the menu resource pack (MRP) and rewrites its four RGBA colours, so the
description window border/background takes the rarity colour. It also supports the DPI mod's replacement MRP.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| MRP section table | `0x0209AC60`: array of u64 pointers, one per section. 23 sections (ids 0..22) | L9-12 | used-in-code (same in LowPriorityCitizen helpers.lua, xref) |
| MRP section header | +0x1C u32 group count. +0x20 u32 = absolute address of the group array. The internal pointers are 32-bit, so loaded packs live below 4 GB | L17, L20 | used-in-code |
| MRP group | Stride 0x14. +0x00 u8 entry count. +0x10 u32 = absolute address of the first entry | L20, L25, L28 | used-in-code |
| MRP entries | Variable length. Each entry's byte +0x00 is its own size, so entry N is found by adding sizes from entry 0 | L31-34 | used-in-code |
| Frame entry address | Vanilla: section 8, group 1, entry 3 | L55 | used-in-code |
| Frame colours | Entry +0x14: four RGBA quads (+0x14, +0x18, +0x1C, +0x20), each u8 r, g, b, a. All four get the same colour (probably the four corner or vertex colours) | L63-69 | used-in-code; per-corner meaning unclear |
| DPI mod path | If the `dpi_state` flag is set, the mod uses `memory.getSymbol("dpi_mrp")` as the section base. It takes the group array at +0x20, uses group 0 (its +0x10 entry pointer) and skips 2 entries | L39-53; main L147 (xref) | used-in-code |
| Lua Loader APIs | `memory.getSymbol(name)` resolves symbols exported by other mods. `event.registerFlagCallback("dpi_state", ...)` is in the main file | L41 | used-in-code |

---

## 7. `mappings.lua` (CCEP)

**Purpose.** All the constants CCEP needs.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Flow base | `0x02099DF0`. Offsets: startTalk +0x99 (u8), sigilLevel +0x100 (u8), upgradeItems +0x101 (array of {u16 item id, u16 qty}, 4 bytes each, filled for levels 1..12 by the main file) | L5, L9-13; main L77-90 (xref) | used-in-code |
| Location id | `0x021654C4` | L6 | used-in-code |
| Function addresses | battleUnitKeep `0x00320A40`, refreshStats `0x0030FED0` | L7-8 | used-in-code |
| Target map | Location 302 (the mod's upgrade NPC map) | L16 | used-in-code |
| Refresh flags | 0x97 passed to refreshStats | L17 | used-in-code |
| Key items | sec35 entries 119..131 (13 rows) get their icon field set to 0x71 (`bpack.section35[id].icon`). These are the mod's sigil key items | L18, L25-28; main L102 (xref) | used-in-code |
| Rank range | 1..12 | L20-23 | used-in-code |
| Party range | Party member indices 0..39 (40 battle-unit slots refreshed) | L30-33 | used-in-code |

---

## Editor takeaways

* **Battlepack sec13 (equipment) weapon record:** +0x19 formula, +0x1A attack, +0x1E element mask, +0x1F on-hit %,
  +0x20 u32 on-hit status mask, +0x2C u16 hit-spark id (0x8001+), plus a pointer to a shared attribute block.
  Attribute block: +0x00 HP u16, +0x02 MP u16, +0x04..+0x07 Str/Mag/Vit/Spd, +0x08 auto-status u32, +0x0C immunity u32,
  +0x10..+0x14 absorb/immune/half/weak/boost element masks. Equipment item id = 0x1000 + index.
* **Action record (0x3C bytes):** +0x00 u16 help text id, +0x08 formula, +0x09 charge time, +0x0A MP, +0x0C flags1,
  +0x18..+0x1B status/buff bytes, +0x24 u16 visual effect, +0x38/+0x39 gambit grid cell. This batch confirms the help id
  at +0x00, which BlueMagick's base patch calls the "record id".
* **sec29 magick list row** (8 bytes) and **sec35 key-item icon field** are both writable through the Lua Loader `bpack` API.
* **MRP UI resource walk** (section table 0x0209AC60, 23 sections, group stride 0x14, size-prefixed entries). This is
  the access path for any UI colour or layout editor, including frame colour quads at entry +0x14.
* **Live refresh after edits:** for each party slot 0..39, call 0x00320A40 to get the keep pointer, then call 0x0030FED0(keep, 0x97).
