# Drive batch 16: Insurgents ScalableFoes / StatLores configs, DynamicDescription core modules, FoedexExtendedUserInterface (helpers + PartyInfo)

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR.
Addresses are the absolute VAs that the Lua Loader scripts use. RVA = VA - 0x120000.

| # | Drive id | Title | Drive path | Bytes | Status |
|---|---|---|---|---|---|
| 1 | 1GasvbWzd4V_dg60r1wi3y9rhw6B48duC | TheInsurgentsScalableFoesConfig.lua | My Laptop/scripts/config | 147 | read in full |
| 2 | 193PH4sQ_bRkSvEJFTbFlasZwcJzraw5c | TheInsurgentsStatLoresConfig.lua | My Laptop/scripts/config | 2,182 | read in full |
| 3 | 1f1nS-W5rRjY1Q_TjIcccdjSM7dRBRhGk | cache.lua | My Laptop/scripts/DynamicDescription | 3,745 | read in full |
| 4 | 1pI7Qd1UkK8hmnAW-ACz5aBaTCDcG83Uv | dd_api.lua | My Laptop/scripts/DynamicDescription | 5,522 | read in full |
| 5 | 1YeCe47VtzFzy7R_4u044Dbly5DUl40Zt | engine.lua | My Laptop/scripts/DynamicDescription | 5,992 | read in full |
| 6 | 1lHO43XTWbT7XWQov_KB2-mtTuH5-KBSZ | layout.lua | My Laptop/scripts/DynamicDescription | 2,738 | read in full |
| 7 | 1fNzQewQXyB5fEXdr0fmWrj0KVA5wiDrO | mappings.lua | My Laptop/scripts/DynamicDescription | 9,940 | read in full |
| 8 | 1ja6zBbY6_hG4MybntS1BWB8Ca8eV_EoJ | parser.lua | My Laptop/scripts/DynamicDescription | 5,897 | read in full |
| 9 | 14mrcLCoY5WpfG4j1KscvAvIxbCujubpa | renderer.lua | My Laptop/scripts/DynamicDescription | 14,093 | read in full |
| 10 | 18RtzASysgB8BVD4fUUPSPUiXRMlbB-o0 | schemas.lua | My Laptop/scripts/DynamicDescription | 6,118 | read in full |
| 11 | 17Hwe8JIDgLwwSq8vkg9R9oXwdGUB-yQm | template.lua | My Laptop/scripts/DynamicDescription | 7,781 | read in full |
| 12 | 1ngs9ZdWQ8y84kRf98QsgsXbdsmH6BE5j | utils.lua | My Laptop/scripts/DynamicDescription | 6,678 | read in full |
| 13 | 1A_zTIObZFhAMjcR5-KVZpdl709FYu2-K | helpers.lua | My Laptop/scripts/FoedexExtendedUserInterface | 5,029 | read in full |
| 14 | 1C3yZSRRY1I6neDnjt5m8lCDrsqUzyA6A | PartyInfo.lua | My Laptop/scripts/FoedexExtendedUserInterface | 8,798 | read in full |

No file is missing.

Authors: files 1-2 are config files for Xeavin's "The Insurgent's" mods (personal use only). Files 3-12 are
FehDead's DynamicDescription (DD), except that DD `layout.lua` contains an MRP lookup routine credited to Xeavin.
Files 13-14 are LowPriorityCitizen's Foedex Extended User Interface (FEUI). I record facts only, in my own words.
I do not copy code.

Evidence key:
* **byte-check-in-code**: the code compares the original bytes before it patches.
* **used-in-code**: the code reads, writes or calls it.
* **comment-only**: only a comment says so.
* **unclear**: my inference from naming, data flow or the shape of the patch. It is not proven.

---

## 1. `TheInsurgentsScalableFoesConfig.lua` (Xeavin, ScalableFoes user config)

**Purpose.** This is the user config for The Insurgent's Scalable Foes. The chunk returns a function. The mod calls
it with a `stats` enum table. It returns a list of stat multiplier rows. In the shipped file the list is empty, and
the only example row is commented out. The main ScalableFoes script is not in this batch, so this file does not show
which tables or offsets the mod writes.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Chunk shape | The chunk returns a 1-arg function `config(stats)`. That function returns an array named `statMultipliers` | L1-9 | used-in-code |
| Row format | Each row is a 3-element array: [1] = a stat key from the `stats` enum that the mod passes in; [2] and [3] = two decimal multipliers. The commented example uses `stats.maxHp` with 2.00 and 2.00 | L3 | comment-only |
| Default | The list is empty, so by default no stat is scaled | L2-4 | used-in-code |
| Meaning of the two multipliers | This file does not say. They could be a lower and an upper bound, or two scaling modes. Look at the main ScalableFoes script to find out | L3 | unclear |
| Editor use | An editor can create this file: one row per stat enum name with two numbers. The full set of valid `stats.*` names lives in the main mod | n/a | unclear |

---

## 2. `TheInsurgentsStatLoresConfig.lua` (Xeavin, StatLores user config)

**Purpose.** This is the user config for The Insurgent's Stat Lores. It returns a function that gets `augments` and
`types` enums. The function returns a list that tells the mod how much each license-board "Lore" augment adds. This
config gives HP Lore 1-12 their vanilla HP amounts, and gives each Battle Lore +1 Strength and each Magick Lore +1
Magick Power. Combined with the DD augment id table (section 7), it shows the augment id of every lore.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Chunk shape | The chunk returns a 2-arg function `config(augments, types)`. That function returns an array named `lores` | L1-2, L49-52 | used-in-code |
| Row format | Each row is a 3-element array: [1] = augment (from the `augments` enum), [2] = stat type (from the `types` enum), [3] = integer amount | L3-46 | used-in-code |
| Stat types used | `types.hp`, `types.strength`, `types.magickPower` | L3-46 | used-in-code |
| HP Lore amounts | hpLore1..12 add 30, 70, 110, 150, 190, 230, 270, 310, 350, 390, 435 and 500 HP. These are the same tiers as DD augment names hp30..hp500 (augment ids 74..85) | L3-14; mappings L250-261 (xref) | used-in-code |
| Battle Lore | battleLore1..16 each add +1 to `types.strength` | L15-30 | used-in-code |
| Magick Lore | magickLore1..16 each add +1 to `types.magickPower` | L31-46 | used-in-code |
| Battle Lore augment ids (from DD table) | 1-5 = 64-68; 6 = 35; 7-12 = 42-47; 13-16 = 60-63 | mappings L211, L218-223, L236-245 (xref) | used-in-code |
| Magick Lore augment ids (from DD table) | 1-5 = 69-73; 6 = 87; 7-12 = 97-102; 13 = 19; 14 = 22; 15 = 24; 16 = 26 | mappings L195-202, L246-250, L263, L273-278 (xref) | used-in-code |
| HP Lore augment ids (from DD table) | hpLore1..12 = 74..85, in order | mappings L250-261 (xref) | used-in-code |

---

## 3. `cache.lua` (DD render cache and change detection)

**Purpose.** DD regenerates the description file for every equipment and action entry. To avoid redoing all of
them, it keeps four caches (templates, renders, snapshots, attribute sets) keyed by template key or bit id. It
compares a snapshot of each parsed item's fields with the last render, and redraws only the entries that changed.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Cache buckets | `templates` (template key -> parsed template), `renders` (bit id -> escaped string), `snapshots` (bit id -> field snapshot), `attributeSets` (key -> set of allowed attribute names) | L2-9 | used-in-code |
| Invalidation | `invalidate(type, keys)` converts each key to a number before it clears the entry, so the callers pass bit ids as string keys (for example from the JSON `customData`) | L42-45 | used-in-code |
| Change detection | An item counts as changed when it has no `_bitid`, has no snapshot yet, any scalar snapshot field differs, or any array field differs element by element | L55-66 | used-in-code |
| Snapshot field list | The union, without duplicates, of section-13 attribute fields, section-14 attribute names, and the common fields `category`, `icon`, `hitsFlying` and `harmsUndead`. The array fields are the element and status lists (see section 7) | L101-120 | used-in-code |
| Attribute set key | Equipment uses `equipment_<category>` and gets its fields from `mappings.section13.attributeSets[category]`. Every action uses the key `action` and gets its fields from the schema `validContent` | L79-99 | used-in-code |

---

## 4. `dd_api.lua` (DD public API for other mods)

**Purpose.** Other mods (BlueMagick, Forge-style mods and so on) use this API to attach custom attribute lines or
per-field display overrides to any bit id. The API stores this state in `customAttributes.json`, merges it with what
is already on disk, and tells the running DD instance to rebuild by setting a shared 1-byte flag.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| JSON path | `<config.path>/DynamicDescription/customAttributes.json`. It is read with `config.loadJson` and written with `config.saveJson` (Lua Loader config helpers) | L6-7, L138, L149 | used-in-code |
| JSON layout | The top-level object holds `customData`. That is a map from the bit id (as a decimal string) to an entry. An entry may hold `customAttributes` (an array of {id, label, value, isPercent}) and `attributeOverrides` (a map from a field name to {label, labelColor, valueColor, labelSuffix, valueSuffix}) | L9, L45-57, L92-101 | used-in-code |
| Custom attribute CRUD | `customAttribute.create(bitid, id, label, value, isPercent)` replaces any row with the same id and appends it at the end. read, update and delete work by id. An empty entry is removed | L45-90 | used-in-code |
| Override CRUD | `attributeOverride.create(bitid, field, opts)`, update (patches only the keys given), read, and delete (one field, or all when field is nil) | L92-135 | used-in-code |
| Override field keys | The keys are plain attribute names (for example `attackPower`), status or affinity array names (for example `weakElements`), or `<arrayName>.<value>` for a single value (for example `weakElements.fire`). The renderer looks up all three forms | renderer L170, L199, L302, L319 (xref) | used-in-code |
| Merge on save | `refresh()` reloads the JSON from disk. It merges each in-memory entry into the disk entry: custom attributes are replaced by id or appended, and override keys are overwritten. Then it saves the result | L27-43, L137-151 | used-in-code |
| IPC flag | After saving, `refresh()` gets the global Lua Loader symbol `dd_refresh` and writes u8 = 1 there. DD polls that byte (batch_10) and rebuilds. It returns false if the symbol is not registered | L153-158 | used-in-code |

---

## 5. `engine.lua` (DD pipeline and export format)

**Purpose.** This is the DD driver. It parses battlepack section 13 (equipment) and section 14 (actions) through the
Lua Loader `bpack` object, renders each item through its template, and writes `<lang>.lua`. That file uses the
`{bitid, "text"}` row format that The Insurgent's Descriptive Inventory (TIDI) loads (batch_13/14).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Language global | The u64 at VA **0x01F82D20** (RVA 0x01E62D20) points to the game-settings object. The **u32 at +0x00** of that object is the language id. A null pointer falls back to `us` | L7-13 | used-in-code |
| Language id -> code | 0 in, 1 us, 2 fr, 3 de, 4 it, 5 es, 6 kr, 7 ch, 8 cn. A comment says this mirrors TIDI | mappings L349-361 (xref) | used-in-code |
| Battlepack access | `bpack.section13[i]` for i = 0 .. settings.equipment.itemLimit-1, and `bpack.section14[i]` for i = 0 .. settings.action.itemLimit-1. Entries are 0-indexed | L103-122 | used-in-code |
| Block renderers | Block types: `common`, `attributes` and `customAttributes` produce single-line parts. `statusEffect` and `elementalAffinity` produce grouped (multi) parts. Single parts go on one line and multi parts go on the next line | L15-27, L33-70 | used-in-code |
| Row title | When a row has `title`, the title line starts with `{scale:N}` (N is numeric, or comes from the tags scale table, default md). Then comes `{rgb:<labelColor>}` or the default label colour tag, then the title text | L74-78 | used-in-code |
| Line join | Rows and lines are joined with `tags.char.newline` (a newline by default) | L57, L91, L100 | used-in-code |
| Export file format | The output is a Lua chunk. It defines `config()`, which returns a local array `inventory`. Each row is written as `{<decimal bitid>, "<escaped text>"},` and is indented 8 spaces. Backslash, double quote and newline are escaped | L124-150; utils L4-8, L132 | used-in-code |
| Output location | `<engine.exportPath>/<lang>.lua`. The export path is injected by the DD main script | L152-156, L171 | used-in-code |
| Render reuse | An item is re-rendered only when `cache.changed` is true or when no render is cached. The escaped result is cached by bit id | L131-143 | used-in-code |

---

## 6. `layout.lua` (DD: menu layout tweaks through MRP)

**Purpose.** DD widens the item preview image and moves the item description text by editing the live
menu resource pack (MRP) records in memory. The MRP lookup routine is credited to Xeavin.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| MRP section table | VA **0x0209AC60** (RVA 0x01F7AC60): an array of 23 u64 section pointers (ids 0-22). A null pointer means the section is not loaded | L5-10 | used-in-code |
| Section header (live) | +0x1C u32 = group count; +0x20 u32 = **absolute** address of the group array. In memory these hold pointers, not file offsets | L14-17 | used-in-code |
| Group record | The stride is 0x14. +0x00 u8 = entry count; +0x10 u32 = absolute address of the first entry | L17-25 | used-in-code |
| Entry walk | Entries are variable length. The first byte of each entry is its total size, so entry k is found by summing the sizes of entries 0..k-1 | L28-31 | used-in-code |
| Item preview (section 8, group 1) | Entry 0 = text, entry 2 = image, entry 3 = frame. The vanilla values used are: text x 90, image 64x96, frame 76x110 | L38-50 | used-in-code |
| Large preview edit | Text entry +0x04 (u16 x) -> 154 (90+64). Image entry +0x08/+0x0A (u16 width/height) -> 128 / 192. Frame entry +0x08/+0x0A -> 140 / 206. This is skipped when DPI mode is active | L36-58 | used-in-code |
| Description position | Equipment description group = section 8 group 1, or group 4 when DPI mode is active. Inventory description group = section 8 group 6. Group +0x04 (u16 x) is set to 62 for equipment and 180 for inventory, or 239 for both in DPI mode, plus an optional custom offset. The first values seen are saved so the defaults can be restored | L61-81 | used-in-code |
| Field meaning | In both groups and entries, +0x04 is x and +0x08/+0x0A are width/height. This matches the FEUI helper layout in section 13 | L53-57, L76-77; helpers L97-119 (xref) | used-in-code |

---

## 7. `mappings.lua` (DD enumerations)

**Purpose.** These are DD's static id-to-name tables for elements, status bits, equipment categories, icon types,
augments and action categories. It also defines which attribute fields each equipment category shows.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Element bit order (u8 masks, bit 0 first) | fire, lightning, ice, earth, water, wind, holy, dark | L2 | used-in-code |
| Status bit order (u32 masks, bit 0..31) | 0 KO, 1 Stone, 2 Petrify, 3 Stop, 4 Sleep, 5 Confuse, 6 Doom, 7 Blind, 8 Poison, 9 Silence, 10 Sap, 11 Oil, 12 Reverse, 13 Disable, 14 Immobilize, 15 Slow, 16 Disease, 17 Lure, 18 Protect, 19 Shell, 20 Haste, 21 Bravery, 22 Faith, 23 Reflect, 24 Invisible, 25 Regen, 26 Float, 27 Berserk, 28 Bubble, 29 HP Critical, 30 Libra, 31 X-Zone | L4-8 | used-in-code |
| Array fields | elements, statusEffectsHit, statusEffectsEquip, statusEffectsImmune, absorbElements, immuneElements, halfElements, weakElements, potencyElements | L10-13 | used-in-code |
| Section-13 `category` byte (0-26) | 0 unarmed, 1 sword, 2 greatsword, 3 katana, 4 ninja sword, 5 spear, 6 pole, 7 bow, 8 crossbow, 9 gun, 10 axe, 11 hammer, 12 dagger, 13 rod, 14 staff, 15 mace, 16 measure, 17 hand-bomb, 18 shield, 19 helm, 20 armor, 21 accessory, 22 crown, 23 arrow, 24 bolt, 25 shot, 26 bomb | L24-52 | used-in-code |
| Section-13 `icon` byte -> type name | 0 hand; 1-18 the same weapon/shield names as category (2 greatSword); 19-21 light/mystic/heavy helm; 22-24 light/mystic/heavy armor; 25 ring, 26 bracelet, 27 glove, 28 collar, 29 pendant, 30 belt, 31 boot, 32 crown; 33-36 arrow, bolt, shot, bomb; 37-40 item; 41 fang; 42 jar; 43 crystal; 44-48 magick; 49 nethicite; 50 magicite; 51 shard; 52-53 sword; 54-56 loot; 57 technick; 73 loot; 74-75 card; 111 treasure; 112 map; 113 shard; 114 treasure; 115-116 flame; 118-119 mote; 120 bazaar; 121-123 nethicite; 128-148, 150 and 152-158 paper; 162-163, 167-172 and 181-183 gambit; 187-191 magick. This is the global icon-id space, so it covers non-equipment icons too | L54-173 | used-in-code |
| Augment ids (0-128) | 0 Stability, 1 Safety, 2 Accuracy Boost, 3 Shield Boost, 4 Evasion Boost, 5 Last Stand, 6 Counter, 7 Counter Boost, 8 Spellbreaker, 9 Brawler, 10 Adrenaline, 11 Focus, 12 Lobbying, 13 Combo Boost, 14 Item Boost, 15 Medicine Reverse, 16 Weatherproof, 17 Thievery, 18 Saboteur, 19 Magick Lore 13, 20 Warmage, 21 Martyr, 22 Magick Lore 14, 23 Headsman, 24 Magick Lore 15, 25 Treasure Hunter, 26 Magick Lore 16, 27 Double EXP, 28 Double LP, 29 Stagnation, 30 Spellbound, 31 Piercing Magick, 32 Offering, 33 Veil, 34 Life Cloak, 35 Battle Lore 6, 36 Parsimony, 37 Tread Lightly, 38 unused, 39 Emptiness, 40 Resist Piercing Damage, 41 Anti-Libra, 42-47 Battle Lore 7-12, 48 Stoneskin, 49 Attack Boost, 50 Double-Edged, 51 Spellspring, 52 Elemental Shift, 53 Celerity, 54 Swiftcast, 55 Physical Immunity, 56 Magick Immunity, 57 Status Immunity, 58 Damage Spikes, 59 Suicidal, 60-63 Battle Lore 13-16, 64-68 Battle Lore 1-5, 69-73 Magick Lore 1-5, 74-85 HP +30/70/110/150/190/230/270/310/350/390/435/500, 86 Inquisitor, 87 Magick Lore 6, 88-90 Shield Block 3/2/1, 91-93 Channeling 3/2/1, 94-96 Swiftness 3/2/1, 97-102 Magick Lore 7-12, 103 Serenity, 104-113 Gambit Slot 1-10, 114 Essentials, 115 unused, 116-118 Remedy Lore 3/2/1, 119-121 Potion Lore 3/2/1, 122-124 Ether Lore 3/2/1, 125-127 Phoenix Lore 3/2/1, 128 Second Board | L175-305 | used-in-code |
| Section-14 category (from `chargeAuraAnimation`) | 0 attack, 1 white magick, 2 black magick, 3 time magick, 4 green magick, 5 arcane magick, 6 mist, 7 technick, 8 item | L307-317 | used-in-code |
| Per-category attribute sets | Categories 0-17 (weapons) show range, chargeTime, attackPower, evadeWeapon, knockbackChance, comboOrCriticalChance and onHitRate. 18 (shield) shows evadeShield and magickEvadeShield. 19-22 (helm, armor, accessory, crown) show defense, magickResist and augment. 23-26 (ammo) show attackPower, evadeWeapon and onHitRate. Every category also shows the six attribute-record stats maxHp, maxMp, strength, magickPower, vitality and speed | L15-22, L340-367 | used-in-code |

---

## 8. `parser.lua` (DD: battlepack records -> item objects)

**Purpose.** This module turns each Lua Loader battlepack entry into a flat item table for the renderer. For
equipment it also follows the entry's attribute-record pointer and reads the stat bonuses and the status and element
masks directly from memory. It also gives each item its "bit id", the content id that TIDI keys on.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Equipment bit id | bit id = 4096 (0x1000) + the section-13 index. This matches the game's equipment item id range, which starts at 0x1000 | L5, L145-148 | used-in-code |
| Action bit id | bit id = the section-14 field `requiredContent` (u16). 0xFFFF (65535) means "none", and that action is skipped. batch_07 puts this field at +0x22 of the 0x3C-byte record | L6, L139, L151 | used-in-code |
| Template key | `equipment_<icon>` for section 13 and `action_<chargeAuraAnimation>` for section 14 | L148, L152 | used-in-code |
| Section-13 named fields read | category, icon, attackPower, defense, magickResist, evadeShield, magickEvadeShield, evadeWeapon, knockbackChance, comboOrCriticalChance, augment, attributePointer, range, chargeTime, onHitRate, elements.<name>, statusEffects.<name>, flags.hitsFlying | L76-103, L70-73 | used-in-code |
| Augment "none" values | 255 or 65535 in `augment` means there is no augment | L100-101 | used-in-code |
| Equipment attribute record (memory) | `attributePointer` holds an absolute address. +0x00 s16 maxHp; +0x02 s16 maxMp; +0x04 s8 strength; +0x05 s8 magickPower; +0x06 s8 vitality; +0x07 s8 speed; +0x08 u32 status-on-equip mask; +0x0C u32 status-immunity mask; +0x10 u8 absorb elements; +0x11 u8 immune elements; +0x12 u8 half elements; +0x13 u8 weak elements; +0x14 u8 potency (boost) elements. A pointer of 0 means there is no record | L4-24, L103-123 | used-in-code |
| Signedness | The parser reads the stats as signed (s16 for HP/MP, s8 for the others), so negative bonuses are possible. batch_12 notes another mod that writes HP as u16 | L107-112 | used-in-code |
| Section-14 named fields read | chargeAuraAnimation (used as the category), flags3.canTargetUndead (shown as "harms undead"), flags3.canTargetFlying, power, powerMultiplier, areaOfEffectSize, mpOrMistCost, accuracyRate, requiredContent, range, chargeTime, onHitRate, elements, statusEffects | L70-73, L126-139 | used-in-code |
| Derived value | multipliedPower = power x powerMultiplier, where a multiplier of 0 counts as 1 | L135-136 | used-in-code |
| Action text group | The i18n database group by category: 1-5 = `magicks`, 7 = `technicks`, 8 = `items`. Categories 0 and 6 get `unknown` (no text group) | L26-34, L138 | used-in-code |
| Quirk | The action schema lists `knockbackChance`, but the parser never sets that field on action items, so it never renders for actions | L126-140; schemas L71 | used-in-code |

---

## 9. `renderer.lua` (DD: item -> tagged rich text)

**Purpose.** This module builds each description string. Its output is the game text markup that TIDI shows:
scale tags, RGB colour tags, icon glyphs, and the label/colon/spacing glyphs taken from the `tags` config. It also
applies overrides and custom attributes from the JSON.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Inline tags emitted | `{scale:N}` (N numeric, or from the tags scale table for lg/md/sm) and `{rgb:<value>}`. Default label and value colours come from the tags config entries `color.label` and `color.value` | L15-21, L341-342 | used-in-code |
| Glyph tokens | The tags config supplies colon, percent, comma and newline characters plus the low and wide space characters. The defaults are ":", "%", ",", "\n", " " and two spaces | L341-345; utils L151-155 | used-in-code |
| Icons | An icon comes from `tags.icon[<value name>]`, and the current scale tag is repeated after it | utils L139-143 | used-in-code |
| Element colouring | In affinity groups, an element value uses `tags.color[<element>]` when that exists. A common field value is also coloured by `tags.color[value]` unless an override sets the value colour | L114, L185 | used-in-code |
| Field order in a label/value pair | scale, label colour, label, label suffix, colon, item spacer, value colour, value, % (when the field is a percent field and `showPercentage` is set), value suffix | L40-48, L194-217 | used-in-code |
| Text database | Text comes from `i18n.database[<group>][<bitid>]` with the fields name, license, notes and prefix. A missing name becomes `UNDEFINED_<GROUP>_<bitid>` | L123-140, L224-225 | used-in-code |
| Notes wrapping | When `settings.layout.itemNotes.wrapLength` > 0, notes are word-wrapped at that many bytes (counted as bytes, not glyphs). With the `usePrefix` arg, the prefix text is put in front of the notes | L131-140, L347 | used-in-code |
| Prefix as status label | For actions, the item's i18n `prefix` text replaces the status group label (for example an action-specific "Inflicts" label) | L290-311 | used-in-code |
| Group label keys | Status groups use the i18n label key `statusEffects<Hit/Equip/Immune>`. Affinity groups use `<weak/immune/half/absorb/potency>Elements` | L84-101 | used-in-code |
| Augment display | The augment id is mapped to an augment key and then to `i18n.augments[key]`. An unknown id is shown as the raw number | L209-212 | used-in-code |
| Hidden zero values | Attributes with value 0 are skipped, except `augment`, which is shown whenever it is set. Custom attributes with value 0 are also skipped | L245-246, L271 | used-in-code |

---

## 10. `schemas.lua` (DD template schema)

**Purpose.** This module declares which block types, content fields, arguments and sizes are valid for each
template section. It also marks which attributes are percentages.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Sizes | `lg`, `md`, `sm` or any number. The default is `md` | L2-8, L41 | used-in-code |
| Common args | showLabel, showIcon and showComma (default false); itemspace 1. Common blocks also accept `usePrefix` | L40-55 | used-in-code |
| Row defaults | itemspace 1, groupspace 2, maxitems 999 | L57-61 | used-in-code |
| Equipment attribute fields (% marked) | range, defense, onHitRate %, chargeTime, attackPower, evadeShield %, evadeWeapon %, magickEvadeShield %, magickResist, knockbackChance %, comboOrCriticalChance %, augment, maxHp, maxMp, strength, magickPower, vitality, speed | L63-68 | used-in-code |
| Action attribute fields (% marked) | range, power, knockbackChance %, powerMultiplier, multipliedPower, areaOfEffectSize, chargeTime, mpOrMistCost, accuracyRate %, onHitRate % | L70-74 | used-in-code |
| Common content | Equipment: name, element, category, type, license, notes, hitsFlying. Action: name, element, category, license, notes, hitsFlying, harmsUndead | L107, L154-156 | used-in-code |
| Status blocks | Equipment accepts hit/equip/immune, mapped to statusEffectsHit/Equip/Immune. Actions accept only hit | L122-133, L171-179 | used-in-code |
| Elemental affinity block | Equipment only: weak, immune, half, absorb and potency, mapped to the *Elements arrays | L134-147 | used-in-code |
| Custom attributes block | A global (no section) block type with dynamic content, so ids are not validated. It accepts `showPercentage` | L76-87, L101 | used-in-code |

---

## 11. `template.lua` (DD template grammar)

**Purpose.** This module parses the template strings in `DynamicDescription` templates (batch_07/09/10) into rows and
blocks, and validates their syntax.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Row syntax | A row runs from `{dt:row <attrs>}` to `{/row}`. Row attributes are written as `key:(value)`; numbers are converted. Known row keys: title, size, labelColor, itemspace, groupspace, maxitems | L6-8, L57-66 | used-in-code |
| Block syntax | `{dt:<section>:<type> ...}` with section equipment or action, or `{dt:<globalType> ...}` for a global type such as customAttributes. Blocks are found by balanced-brace matching inside the row | L9-12, L80-100, L129 | used-in-code |
| Block attributes | `size:(..)`, `content:(a, b, ..)` (comma list), `args:(flag, key:value, ..)` (a bare flag means true), `labelColor:(..)` and `valueColor:(..)` | L13-17, L46-55, L68-78 | used-in-code |
| Pre-processing | Newlines are turned into spaces before parsing, so templates can span several lines | L36-39, L147 | used-in-code |
| Validation rules | Each known attribute key must be followed directly by "(". The size must be valid. Content must be in the schema `validContent` (except for dynamic blocks). Args must be defaults or in `validArgs`. Errors are collected as strings | L22-34, L159-200 | used-in-code |
| Missing template | `get` returns an empty table, prints a WARN once and caches the empty result | L202-207 | used-in-code |

---

## 12. `utils.lua` (DD layout helpers)

**Purpose.** These are the string helpers that pack parts into lines and write the export file.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Single-line packing | Parts are joined with the group spacer (wide space x groupspace). After every `maxitems` parts a new line starts | L12-29, L145-166 | used-in-code |
| Multi-group packing | Groups are flattened to label tokens (weight 2) and value tokens (weight 1). A new line starts before a label that would push the count past maxitems, or once the count reaches maxitems. Values in a group are separated by the item spacer, or by comma + spacer when `showComma` is set. Groups are separated by the group spacer | L10, L31-119 | used-in-code |
| Escape map | Backslash, double quote and newline are escaped for the Lua string literal in the export | L4-8, L132 | used-in-code |
| File write | The file is opened in text mode "w" at `<exportPath>/<filename>`. A failure prints an `ERROR [DD]` line | L189-201 | used-in-code |
| Word wrap | A greedy wrap at the last space within `limit` bytes. A word longer than the limit is hard-cut. Lines are joined with a real "\n" | L168-187 | used-in-code |

---

## 13. `helpers.lua` (FEUI: MRP read / copy / write)

**Purpose.** These are LowPriorityCitizen's helpers for copying groups out of a loaded MRP, editing them in Lua, and
serializing them into a new MRP blob in executable memory. Together with section 14 they give the complete MRP byte
layout: the header, the 0x14-byte group records, the size-prefixed entry records and the 0x10-byte texture name
slots.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Constants | Section table at 0x0209AC60; group record size 0x14; texture record size 0x10 | L6-8 | used-in-code |
| MRP header (blob as built) | +0x00 'M' 'R' 'P' (3 bytes); +0x03 flag byte, left 0 here; +0x04 u32 textureCount; +0x08 u32 textureOffset; +0x10 u32 total size; +0x18 u32 total size; +0x1C u32 groupCount; +0x20 u32 groupOffset; +0x28 u32 total size. Offsets 0x0C, 0x14, 0x24 and 0x2C are left zero. The header is 0x30 bytes, and FEUI sets groupOffset to 0x30 | L78-87, L136-146; PartyInfo L243-260 | used-in-code |
| Loaded flag | A loaded MRP in memory has u32 at +0 = 0x0150524D, meaning the 'MRP' magic plus flag byte 0x01. FEUI waits for this before it reads section 1 | PartyInfo L276-283 (xref) | used-in-code |
| Live vs file offsets | In a loaded MRP, header +0x08, header +0x20 and group +0x10 hold **absolute** 32-bit addresses (the reader uses them directly). In a freshly built blob they are **relative**: textureOffset and groupOffset from the header start, and entryOffset from that group record's own start. The game routine at 0x002A00F0 (section 14) probably relocates them | L84, L92, L105-107, L126, L161 | used-in-code (relocation itself unclear) |
| Group record (0x14) | +0x00 u8 entryCount; +0x01 u16 index (the writer stores 4 x the group's new position); +0x03 u8 flags; +0x04 s16 x; +0x06 s16 y; +0x08 u16 width; +0x0A u16 height; +0x0C u32 "gaps" (meaning unknown, copied as is); +0x10 u32 entry offset/address | L97-105, L153-161 | used-in-code |
| Entry record (variable) | +0x00 u8 total size (header included); +0x01 u8 type; +0x02 u8 index; +0x03 u8 flags; +0x04 s16 x; +0x06 s16 y; +0x08 u16 width; +0x0A u16 height; +0x0C type-specific payload of (size - 0x0C) bytes | L112-122, L166-176 | used-in-code |
| Blob ordering | Header, then all group records, then the entries of each group back to back in group order, then the texture table | L148-186 | used-in-code |
| Texture table | One 0x10-byte slot per texture. The first 0x0D bytes are the texture name, and only those are copied | L126-131, L182-186 | used-in-code |
| Partial read | `readMrp(sectionId, groupList)` copies only the listed group ids and renumbers them 0..n-1. The texture table is copied whole | L74-134 | used-in-code |
| Allocation | The new blob comes from `memory.allocExe(size)`, Lua Loader's executable-memory allocator | L137 | used-in-code |
| Loader note | A comment says that in Lua Loader 1.10.x for-loop variables are read-only, so the helpers copy them before changing them | L44-45 | comment-only |

---

## 14. `PartyInfo.lua` (FEUI: 5-digit HP / 4-digit MP party HUD)

**Purpose.** This mod widens the battle party HUD so it can show HP up to 99,999 (5 digits) and MP up to 9,999
(4 digits). It (1) verifies and patches seven code sites, (2) adds asm caves that choose the HP digit group,
(3) copies party-HUD groups 40-48 of MRP section 1 into a new MRP, adds a 5-digit HP group and widens the mist
bars, (4) relocates the new MRP through a game routine, and (5) points the HUD's MRP load at it. It also calls
`scripts/HudColors.lua`'s `tintPartyMrp(mrp)` hook, which tints the HUD text.

### 14a. Patched code sites (all verified before patching)

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Byte check | Before patching, every site is read with `memory.readArray` and compared with the expected bytes. Any mismatch aborts the whole patch with a "FEUI: ... unexpectedly modified" message. The comparison concatenates the decimal values into a string, which is a weak check: {1,23} and {12,3} would compare equal | L291-298 | byte-check-in-code |
| 0x0029A72D (RVA 0x17A72D), MRP pointer | Original 10 bytes: `41 B8 28 00 00 00 48 8B 50 08` (mov r8d,0x28 ; mov rdx,[rax+8]). So the party HUD builder takes the MRP pointer in rdx and the first group index in r8d (40). The replacement loads rdx from the symbol `feupi_mrp` (the new MRP) and sets r8d to 0, which is the same length | L4, L16, L26-29 | byte-check-in-code |
| 0x00297722 (RVA 0x177722), HP digit tier | Original `41 83 F8 64 7D 07` (cmp r8d,100 ; jge +7). It is replaced with a jump to cave `feupi_hp` plus a nop. The cave sets edx = 1, 2, 3 or 4 for HP below 100, below 1,000, below 10,000, or 10,000 and above (r8d = HP), then jumps back to **0x0029773E** | L6, L17, L30-33, L53-69 | byte-check-in-code |
| 0x00297751 (RVA 0x177751), HP group select | Original `88 91 DC 00 00 00` (mov [rcx+0xDC],dl). It is replaced with a jump to cave `feupi_entry` plus a nop. The cave stores dl at +0xDC itself, then for r9 = 4 down to 1 shows or hides the HP digit child for that tier. It then ends the original function itself: eax = 1, add rsp 0x20, pop rbx, ret | L7, L18, L34-37, L72-102 | byte-check-in-code |
| 0x00297EC7 (RVA 0x177EC7), digit-count table | Original `4C 8D 05 3A E4 67 00`, which is lea r8,[rip+0x67E43A] and resolves to **VA 0x00916308**. It is replaced with lea r8 = the new u16 table `feupi_ptr00916308` | L8, L19, L38-40, L317-323 | byte-check-in-code |
| New table for 0x00916308 | 5 x u16 = {0, 2, 3, 4, 5}, indexed by HP tier. My inference: tier -> number of HP digits, so the vanilla table holds {?, 2, 3, 4} | L317-323 | used-in-code (meaning unclear) |
| 0x00297A6A and 0x00297B5A (RVA 0x177A6A / 0x177B5A), MP | Original `C7 83 18 01 00 00 04 00 01 00` (mov dword [rbx+0x118],0x00010004). The patch changes the immediate to 0x00010007. My inference: the low word is the entry index of the MP icon in group 7, which the MRP edit moves from entry 4 to entry 7 | L10-11, L20-21, L41-46, L180-188 | byte-check-in-code (meaning unclear) |
| 0x0029A921 (RVA 0x17A921), MP digit count | Original `41 8D 50 03` (lea edx,[r8+3]). It becomes lea edx,[r8+4], which adds one more MP digit slot | L12, L22, L47-49 | byte-check-in-code |
| Game function 0x00247870 (RVA 0x127870) | Called from the cave with rcx = a child UI-group instance and edx = 0 or 1. It probably sets that child's visibility or active state | L95 | used-in-code (meaning unclear) |
| Game function 0x002A00F0 (RVA 0x1800F0) | Called through `memory.executea(0x002A00F0, 0, 8, newMrp)`, with 3 integer args in Windows x64 order (rcx = 0, edx = 8, r8 = blob pointer). It runs once, after the blob is built and before its pointer is stored in `feupi_mrp`. It probably relocates or initializes the MRP (turns relative offsets into absolute pointers and sets the flag byte) | L272-273 | used-in-code (meaning unclear) |

### 14b. Party HUD runtime object (rbx/rcx in the hooked function)

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| +0x60 | u64 pointer to an array of u64 entry-instance pointers. The index is the entry number in group 0 (Party Info General), stride 8 | L77-80, L309-315 | used-in-code |
| Entry instance +0x18 | u64 pointer to the child group instance that a link entry opens | L81 | used-in-code |
| +0xC0 | u64 = the active HP-digit child instance (set for the selected tier) | L92 | used-in-code |
| +0xDC | u8 = HP digit tier (1..4 after the patch) | L73, L83 | used-in-code |
| Entry offset table | u16 x 5 = {0, 20, 21, 22, 30} x 8. These are byte offsets into the +0x60 array for the HP-digit link entries of tiers 1-4 | L308-315 | used-in-code |

### 14c. MRP section 1, party HUD groups (40-48, renumbered 0-8, plus a new group 9)

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Source groups | Section 1, groups 40..48, copied in order as new groups 0..8 | L265-268 | used-in-code |
| New group 0 (orig 40) "Party Info General" | Link entries: 3/4/5 -> mist-bar groups 1/2/3; 20/21/22 -> HP-value groups 4/5/6 (2/3/4 digits); 28 -> member group 7; 29 -> summon group 8. New entry 30 (a copy of 22) -> new group 9 (5 digits). Entry 26 is the blue background box and is widened by the HP shift | L211-228 | used-in-code |
| Link entry payload | The first payload byte (entry +0x0C) is the target group index inside the same MRP | L220-228 | used-in-code |
| Groups 1-3 (orig 41-43) | Party member rows with 1, 2 or 3 mist bars. Each entry's payload holds two bar sub-records 0x14 apart, with a u16 bar width at payload +0x14 and +0x28 (entry +0x20 and +0x34). The mod widens the group, the entries and the bars | L190-209 | used-in-code |
| Groups 4-6 (orig 44-46) | HP number groups. Big-digit entries start at index 0 and small-digit entries at index 4. The step between digits is the x difference between neighbouring entries | L135-147 | used-in-code |
| New group 9 | A copy of group 6 with one more big digit (inserted at index 4) and one more small digit (appended at the end). It is shifted left by (big step + small step) | L137-167 | used-in-code |
| Group 7 (orig 47) "Party Info Member" | Entry 0 = character name, moved left by the HP shift. Entries 1-3 = MP digits. Entry 4 was the MP icon: it is copied to new entry 7 with flags = 0 (the comment says this stops the icon from showing while an Esper is summoned), and entry 4 becomes a copy of entry 3 one MP step to the right (the 4th MP digit) | L172-188 | used-in-code |
| Group 8 (orig 48) | "Party Info Summon". It is shifted together with groups 4-9 | L168-171, L227 | used-in-code |
| Size recompute | size = 0x30 + 0x14 x groupCount + the sum of entry sizes, then + 0x10 x textureCount. This total is written to all three size fields | L243-260 | used-in-code |
| Timing | The mod polls every 1000 ms until section pointer 1 is non-null and its magic+flag is 0x0150524D. It then waits 1000 ms more and builds the new MRP. On "exit" it unregisters all symbols | L276-289, L330-331 | used-in-code |
| Lua Loader API used | memory.readArray / writeArray / allocExe / registerSymbol / getSymbol / unregisterAllSymbols / assemble (with a label list to define caves, or with an address to patch in place; `%name%` places a registered symbol) / executea; event.executeAfterMs / registerEventAsync("exit") | L272-331 | used-in-code |
| HudColors hook | `scripts/HudColors.lua` is loaded with `loadfile`. If it returns a table with `tintPartyMrp`, that function is called with the Lua MRP model before the size is computed, so it can change entry payloads (colours). It is skipped quietly if the file is missing | L231-241 | used-in-code |

---

## Editor takeaways

* **MRP format (offline + live).** Sections 13 and 14 give enough of the MRP layout to write a parser and writer:
  the 0x30-byte header with 3 size copies, 0x14-byte groups, size-prefixed entries with a 12-byte common header, and
  0x10-byte texture slots. In memory the offsets become absolute pointers, and flag byte +3 = 1. An editor can show
  and drag group/entry x/y/width/height and edit link payloads (byte +0x0C = target group). Live, it can walk
  the section table at 0x0209AC60.
* **Equipment attribute record.** The +0x00..+0x14 layout behind `attributePointer`, the element and status bit
  orders and the augment ids 0-128 are everything an equipment stat, affinity and augment editor needs.
* **Action/text keys.** Section-14 `requiredContent` (0xFFFF = none) and equipment 0x1000 + index are the content ids
  that the description and text replacement mods key on.
* **DD integration.** An editor can add description lines without touching game text. Write `customData` into
  `customAttributes.json` (or call `dd_api`), then set the `dd_refresh` byte to 1.
* **Party HUD hooks.** The seven FEUI sites and their original bytes are listed above. Any editor that patches the HUD
  must check them for conflicts.
