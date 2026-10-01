# Drive batch 07: CCEP config (`lootData.lua`, `settings.lua`) + DynamicDescription templates

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR.

Files in this batch (all read in full):

| Drive id | Title | Drive path | Lines | Author / note |
|---|---|---|---|---|
| 1dbAAHlOFFh2ku4g-40wmCfn8sUaQJPTF | lootData.lua | My Laptop/scripts/config/ClanCenturioEquipmentProgression | 81 | FehDead |
| 1S2HyWD53THANN4CoEVPa5jheFKe5fodl | settings.lua | same | 7 | FehDead |
| 1FFXiRtUjkyhzZEbUexn-_rTKiptjWzGd | 1.lua | My Laptop/scripts/config/DynamicDescription/templates/action | 23 | no header |
| 1nolNb5uhmqhTYXdF3uLNLxqF0uXhU7M- | 2.lua | same | 23 | byte-identical to action/1.lua |
| 1td9LQkxEMoUXhlX9vWrSFJgdjx3hAI9x | 3.lua | same | 23 | byte-identical to action/1.lua |
| 1uNRjTNJXMlXepo85ARek3fX4ewqiA1Wf | 4.lua | same | 23 | byte-identical to action/1.lua |
| 1sBbnfKyt6FwjH0x7KZqQocH3K9xp_ShT | 5.lua | same | 23 | byte-identical to action/1.lua |
| 1fwnWU7ZWTZQcI8kkWcehEJpkrTxjlrQx | 6.lua | same | 23 | byte-identical to action/1.lua |
| 1FNZ4_FLExH9Sm9K_SVU1eKAd7zmIGwX8 | 7.lua | same | 23 | byte-identical to action/1.lua |
| 1TwYmp-XLuKzA4sAHjd0bJXX1PZLm4w2Z | 8.lua | same | 23 | byte-identical to action/1.lua |
| 1O1RUH1Co_iHbRPtZyGjBbgojJmewceO8 | 9.lua | same | 27 | user-added: 4-line comment + same body as 1.lua |
| 1X7kOAzdAnrNboeBjE6_MscG6kRQvgMfd | 0.lua | My Laptop/scripts/config/DynamicDescription/templates/equipment | 28 | no header |
| 1hpROi_gCctLwSzIx2DrLxz_ze27RZodW | 1.lua | same | 28 | byte-identical to equipment/0.lua |
| 1TyYSZ26npCeoZ1W_6tw0QUzP4b_oGntF | 10.lua | same | 28 | byte-identical to equipment/0.lua |

No file was missing. "Identical" was checked with md5: action 1..8 share one hash and equipment 0/1/10 share another.
None of these files is by Xeavin. Everything below is paraphrased: facts only, no copied code.

These are config/data files, so to interpret them I read the code that consumes them (outside this batch, not mined here):
`ClanCenturioEquipmentProgression.lua` (CCEP main), CCEP `mappings.lua` / `controller.lua`, and DynamicDescription's
`DynamicDescription.lua`, `parser.lua`, `template.lua`, `schemas.lua`, `mappings.lua`, `cache.lua`. I also used
`BlueMagick.lua` for the meaning of action-record byte +0x21, and the repo's `editor/data/lists.json` (ContLootList)
to check item names. Rows that rely on these say "(xref)".

Evidence key: **byte-check-in-code** = code checks the original bytes before patching. **used-in-code** = code
reads or writes the address or field. **comment-only** = only a comment says so. **unclear** = my inference.
No file in this batch checks original bytes before patching. None of them patches code.

---

## Quick reference

### Addresses touched through this batch's config (Lua Loader address space; RVA = address - 0x120000)

| Address | RVA | What | Access | Source | Evidence |
|---|---|---|---|---|---|
| `0x02099DF0` | 0x01F79DF0 | CCEP "flow" block base (shared between the mod's NPC event script and Lua) | base | CCEP mappings L5 (xref) | used-in-code |
| `0x02099E89` | 0x01F79E89 | flow+0x99 `startTalk`: event sets 1; Lua sees it, clears it to 0, then writes the upgrade-item list | u8 | controller L26-28 (xref) | used-in-code |
| `0x02099EF0` | 0x01F79EF0 | flow+0x100 `sigilLevel`: current rank 1..12 set by the event; Lua re-scales equipment when it changes | u8 | controller L31-34 (xref) | used-in-code |
| `0x02099EF1` | 0x01F79EF1 | flow+0x101 `upgradeItems`: packed array of 54 x {u16 itemId, u16 qty} built from `lootData.lua` | u16 pairs | CCEP main L77-90 (xref) | used-in-code |
| `0x02099FC8` | 0x01F79FC8 | last byte of that array (0x101 + 216 - 1) | n/a | computed | unclear (arithmetic) |
| `0x021654C4` | 0x020454C4 | current location id; CCEP polls only while it equals 302 | u32 | CCEP main L169-171, mappings L6/L16 (xref) | used-in-code |

### Upgrade-item buffer layout (written from `lootData.lua`)

Each entry is 4 bytes: u16 item id, then u16 quantity, both little-endian. Levels are written one after another in
rank order (1..12). There is no count, header or terminator, and the array starts on an odd address.

| Rank | Entries | Offset in array | Start | End |
|---|---|---|---|---|
| 1 | 3 | +0x00 | 0x02099EF1 | 0x02099EFC |
| 2 | 3 | +0x0C | 0x02099EFD | 0x02099F08 |
| 3 | 3 | +0x18 | 0x02099F09 | 0x02099F14 |
| 4 | 4 | +0x24 | 0x02099F15 | 0x02099F24 |
| 5 | 4 | +0x34 | 0x02099F25 | 0x02099F34 |
| 6 | 4 | +0x44 | 0x02099F35 | 0x02099F44 |
| 7 | 5 | +0x54 | 0x02099F45 | 0x02099F58 |
| 8 | 5 | +0x68 | 0x02099F59 | 0x02099F6C |
| 9 | 5 | +0x7C | 0x02099F6D | 0x02099F80 |
| 10 | 6 | +0x90 | 0x02099F81 | 0x02099F98 |
| 11 | 6 | +0xA8 | 0x02099F99 | 0x02099FB0 |
| 12 | 6 | +0xC0 | 0x02099FB1 | 0x02099FC8 |

Because nothing stores the per-rank counts, the NPC event script that reads this buffer must already know them
(3,3,3,4,4,4,5,5,5,6,6,6). That event script is not in the Drive set, so this is an inference (**unclear**).
If you add or remove entries in `lootData.lua`, the later ranks shift and probably desync from the script.

### DynamicDescription template selection (applies to every template file in this batch)

| Topic | Detail | Source | Evidence |
|---|---|---|---|
| File scheme | `scripts/config/DynamicDescription/templates/<section>/<n>.lua`. Each file returns a single Lua long-bracket string | DD main L21-31, L96-110 (xref) | used-in-code |
| Ranges loaded | `equipment` n = 0..191 and `action` n = 0..8. Keys are `equipment_<n>` / `action_<n>`. Files outside these ranges are never opened | DD main L23-29, L97-100 (xref) | used-in-code |
| Action key | `action_` + the u8 at action record +0x21 (sec14, stride 0x3C). DD calls it `chargeAuraAnimation`; BlueMagick calls it the charge aura and notes that the battle menu also uses it to choose the school | DD parser L127, L152; BlueMagick L115-121, L910-914 (xref) | used-in-code |
| Action category values | 0 attack, 1 white magick, 2 black, 3 time, 4 green, 5 arcane, 6 mist, 7 technick, 8 item. DD groups 1-5 as "magicks", 7 as "technicks", 8 as "items" | DD mappings SECTION14_CATEGORY; parser L26-34 (xref) | used-in-code |
| Aura colours | BlueMagick's colour picker maps White=1, Black=2, Purple=3, Green=4, Blue=5, Red=6, and says 5 is visually blue and 6 red | BlueMagick L205-206, L119-120 (xref) | used-in-code / comment |
| Action skip rule | An action whose `requiredContent` u16 is 0xFFFF gets no description. BlueMagick writes this field at record +0x22 | DD parser L139, L151; BlueMagick L917 (xref) | used-in-code |
| Equipment key | `equipment_` + the item's **icon** value (sec13, stride 0x34), not its category. Icon names: 0 hand/unarmed, 1 sword, 2 greatsword, 3 katana, 4 ninja sword, 5 spear, 6 pole, 7 bow, 8 crossbow, 9 gun, 10 axe, 11 hammer, 12 dagger, 13 rod, 14 staff, 15 mace, 16 measure, 17 hand-bomb, 18 shield, 19-21 light/mystic/heavy helm, 22-24 light/mystic/heavy armor, 25 ring, 26 bracelet, 27 glove, 28 collar, 29 pendant, 30 belt, 31 boot, 32 crown, 33 arrow, 34 bolt, 35 shot, 36 bomb ... 52/53 sword, 54 loot | DD parser L148; DD mappings SECTION13_TYPE (xref) | used-in-code |
| Missing template | `template.get` prints `Template '<key>' not found`, caches an empty template and renders nothing | DD template L202-207 (xref) | used-in-code |
| Row syntax | A row is `{dt:row ...attrs}` ... `{/row}`. Row attrs are written `name:(value)`: `itemspace` (default 1), `groupspace` (default 2), `maxitems` (default 999) | DD template L6-18; schemas ROW_DEFAULTS (xref) | used-in-code |
| Block syntax | A block is `{dt:<section>:<type> content:(f1, f2) args:(flag, key:value)}`. Other known attrs: `size` (default `md`), `labelColor`, `valueColor`, `title`. The validator flags any of these not followed by `(` | DD template L6-24, L26-34 (xref) | used-in-code |
| Common args | `showLabel`, `showIcon`, `showComma` (default false). `usePrefix` is valid on `common`, `showPercentage` on `attributes` | DD schemas COMMON_DEFAULTS / VALID_ARGS (xref) | used-in-code |
| Action block types | `common` content: name, element, category, license, notes, hitsFlying, harmsUndead. `attributes`: range, power, knockbackChance%, powerMultiplier, multipliedPower, areaOfEffectSize, chargeTime, mpOrMistCost, accuracyRate%, onHitRate%. `statusEffect`: hit. Also `customAttributes` (dynamic) | DD schemas L70-74, action block (xref) | used-in-code |
| Equipment block types | `common`: name, element, category, type, license, notes, hitsFlying. `attributes`: range, defense, onHitRate%, chargeTime, attackPower, evadeShield%, evadeWeapon%, magickEvadeShield%, magickResist, knockbackChance%, comboOrCriticalChance%, augment, maxHp, maxMp, strength, magickPower, vitality, speed. `statusEffect`: hit / equip / immune. `elementalAffinity`: weak / immune / half / absorb / potency. Also `customAttributes` | DD schemas equipment block (xref) | used-in-code |
| Derived field | `multipliedPower` = power x powerMultiplier, with a multiplier of 0 counted as 1 | DD parser L130-136 (xref) | used-in-code |
| Flag sources | Action `hitsFlying` = flags3.canTargetFlying, `harmsUndead` = flags3.canTargetUndead. Equipment `hitsFlying` = flags.hitsFlying | DD parser L70-73, L128 (xref) | used-in-code |
| Equipment attribute record | Reached through the item's `attributePointer`: +0 s16 maxHp, +2 s16 maxMp, +4 s8 strength, +5 s8 magickPower, +6 s8 vitality, +7 s8 speed, +8 u32 equip-status bits, +12 u32 immune-status bits, +16 u8 absorb elements, +17 immune, +18 half, +19 weak, +20 potency (element bits fire..dark = bit0..7) | DD parser L4-24, L101-122 (xref) | used-in-code |
| Equipment attr filter | The attributes row can list every field, but only fields valid for the item's category render (`mappings.section13.attributeSets[cat]`) | DD cache L80-90 (xref) | used-in-code |
| Bit id | Equipment description id = 4096 + item index. Action description id = its requiredContent | DD parser L5, L139, L147 (xref) | used-in-code |

---

## 1. `lootData.lua` (CCEP config, FehDead)

**Purpose.** Clan Centurio Equipment Progression lets you raise a "sigil" rank from 1 to 12 at an NPC. This file lists
the loot items and quantities that each rank costs. CCEP serialises it into the flow block so the NPC event script
can check and take the items.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Shape | Returns a table indexed by rank 1..12. Each rank holds a list of `{id, qty}` | L2-81 | used-in-code (CCEP main L83-86, xref) |
| Entry counts | Ranks 1-3 have 3 items, 4-6 have 4, 7-9 have 5, 10-12 have 6. Total 54 entries | L3-80 | used-in-code |
| Serialisation | Each entry becomes u16 id + u16 qty at 0x02099EF1 + 4*k (see Quick reference) | CCEP main L77-90 (xref) | used-in-code |
| Trigger | Written when flow+0x99 is 1. The poll runs every 2000 ms, but only while the location id is 302 | controller L21-29, L40-46 (xref) | used-in-code |
| Free mode | When `settings.manualLevelUpgrade` is true, every qty is replaced by `manualLevelUpgradeQuantity` | CCEP main L78-85 (xref) | used-in-code |
| Item id space | Loot ids are 0x2000..0x21FF (8192..8703). The editor's ContLootList has 512 loot names plus 0xFFFF = none. Ids in this file span 0x2020..0x20EF | lists.json (xref) | used-in-code |
| Name check | The names in the 54 comments match `editor/data/lists.json` ContLootList (54/54) | L4-79 | comment, verified against repo data |
| Rank 1 | 8314 0x207A Cactus Fruit x23. 8293 0x2065 Tanned Hide x17. 8225 0x2021 Wind Stone x15 | L3-7 | used-in-code |
| Rank 2 | 8320 0x2080 Bone Fragment x22. 8224 0x2020 Earth Stone x19. 8231 0x2027 Dark Stone x24 | L8-12 | used-in-code |
| Rank 3 | 8325 0x2085 Solid Stone x27. 8344 0x2098 Foul Flesh x25. 8322 0x2082 Blood-darkened Bone x10 | L13-17 | used-in-code |
| Rank 4 | 8281 0x2059 Yensa Scale x34. 8289 0x2061 Snake Skin x28. 8308 0x2074 Pointed Horn x20. 8284 0x205C Drab Wool x33 | L18-23 | used-in-code |
| Rank 5 | 8334 0x208E Demon Eyeball x15. 8232 0x2028 Earth Magicite x36. 8299 0x206B Quality Pelt x15. 8304 0x2070 Giant Feather x25 | L24-29 | used-in-code |
| Rank 6 | 8286 0x205E Fine Wool x20. 8302 0x206E Large Feather x28. 8330 0x208A Yellow Liquid x18. 8285 0x205D Braid Wool x27 | L30-35 | used-in-code |
| Rank 7 | 8311 0x2077 Crooked Fang x26. 8295 0x2067 Tanned Tyrant Hide x10. 8377 0x20B9 Adamantite x8. 8336 0x2090 Demon Tail x12. 8329 0x2089 Green Liquid x16 | L36-42 | used-in-code |
| Rank 8 | 8298 0x206A Coeurl Pelt x25. 8300 0x206C Prime Pelt x15. 8294 0x2066 Tanned Giantskin x20. 8276 0x2054 Insect Husk x30. 8345 0x2099 Festering Flesh x20 | L43-49 | used-in-code |
| Rank 9 | 8362 0x20AA Slaven Harness x45. 8341 0x2095 Book of Orgain x8. 8379 0x20BB Damascus Steel x8. 8400 0x20D0 Corpse Fly x10. 8342 0x2096 Book of Orgain-Cent x6 | L50-56 | used-in-code |
| Rank 10 | 8331 0x208B Silver Liquid x30. 8240 0x2030 Earth Crystal x42. 8407 0x20D7 Behemoth Steak x8. 8245 0x2035 Storm Crystal x33. 8395 0x20CB Demon Drink x10. 8391 0x20C7 Putrid Liquid x18 | L57-64 | used-in-code |
| Rank 11 | 8247 0x2037 Dark Crystal x9. 8397 0x20CD Soul Powder x10. 8382 0x20BE Einherjarium x10. 8279 0x2057 Charger Barding x10. 8338 0x2092 Grimoire Aidhed x10. 8268 0x204C Arcana x6 | L65-72 | used-in-code |
| Rank 12 | 8366 0x20AE Soul of Thamasa x10. 8269 0x204D High Arcana x6. 8257 0x2041 Capricorn Gem x12. 8431 0x20EF Gemsteel x6. 8430 0x20EE Serpentarius x3. 8429 0x20ED Empyreal Soul x6 | L73-80 | used-in-code |
| Loot index order | From these ids: the Stones run 0x2020 Earth, 0x2021 Wind ... 0x2027 Dark; Earth Magicite is 0x2028; the Crystals run 0x2030 Earth, 0x2035 Storm, 0x2037 Dark. This matches the vanilla loot ordering in lists.json | L4-79 + lists.json | used-in-code |
| Editor note | The quantity is stored as u16 in memory, but free mode clamps it to 0..255 | CCEP main L79 (xref) | used-in-code |

## 2. `settings.lua` (CCEP config, FehDead)

**Purpose.** Four switches that bypass the NPC progression: force an equipment scale rank, and/or make the upgrade
costs a flat quantity.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| `manualEquipmentScale` (bool, default false) | If true, at init CCEP sets the current sigil level to `manualEquipmentScaleValue` and applies the scaling right away, without the NPC | L3; CCEP main L106-113 (xref) | used-in-code |
| `manualEquipmentScaleValue` (int, default 0) | Accepted range 1..12 (`rankRange`). Outside that range it prints a warning and is ignored | L4; mappings L20-23 (xref) | used-in-code |
| `manualLevelUpgrade` (bool, default false) | If true, every upgrade entry's qty is replaced with `manualLevelUpgradeQuantity` when the list is written to flow+0x101 | L5; CCEP main L78-85 (xref) | used-in-code |
| `manualLevelUpgradeQuantity` (int, default 0) | Clamped to 0..255 before writing. 0 makes every rank free | L6; CCEP main L79 (xref) | used-in-code |
| What "scaling" writes | `applyItemScaling(level)` rewrites sec13 equipment fields from `equipmentData.lua`, regenerates DD descriptions and recolours the menu frames. It then calls the game functions 0x00320A40 (party index to battle-unit pointer) and 0x0030FED0 (refresh stats) with flags 0x97 for party slots 0..39 | CCEP main L69-75; mappings L7-8, L17, L30-33 (xref; also batch_05) | used-in-code |
| Hot reload | CCEP watches `scripts/config/ClanCenturioEquipmentProgression/*.lua`, so edits to this file or lootData re-run init live | CCEP main L127-132, L146 (xref) | used-in-code |
| Persistence | The current sigil level is saved through Lua Loader's save handler under the key `ClanCenturioEquipmentProgression` (field `sigilLevel`) and is not stored in the game save | CCEP main L156-165 (xref) | used-in-code |

## 3. `templates/action/1.lua` .. `8.lua` (DynamicDescription, 8 identical files)

**Purpose.** These are the layouts of the inventory description panel for actions, one file per action category
(see the Quick reference for how +0x21 picks the file). All eight files are the same: 1 white, 2 black, 3 time,
4 green, 5 arcane (the Blue Magicks also use 5 by default), 6 mist, 7 technick, 8 item. `action/0.lua` (attack) is not in this batch.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Row 1 (header icons) | Five `action:common` blocks: hitsFlying (icon), harmsUndead (icon), element (icon), category (icon + label), license (label). Row itemspace 1, groupspace 1 | L3-9 | used-in-code (DD schemas, xref) |
| Row 2 (numbers) | One `action:attributes` block with multipliedPower, range, mpOrMistCost, accuracyRate, onHitRate, chargeTime, areaOfEffectSize. Args showLabel and showPercentage, so the % fields get a percent sign | L11-13 | used-in-code |
| Row 3 (status) | `action:statusEffect` with `hit` (the on-hit status list, from the action's statusEffects bits), labelled with icons, at most 10 items | L15-17 | used-in-code |
| Row 4 (notes) | `action:common` with `notes` (free text from DD i18n/custom data) | L19-21 | used-in-code |
| Fields not used | The template never shows `power`, `powerMultiplier` or `knockbackChance` on their own, only the derived `multipliedPower` | L12 vs DD schemas | used-in-code |
| Identity | Files 2..8 match file 1 byte for byte (md5 8639dd1a...) | all | n/a |
| Rows per file (for editor diff) | 2.lua L3-21, 3.lua L3-21, 4.lua L3-21, 5.lua L3-21, 6.lua L3-21, 7.lua L3-21, 8.lua L3-21: same rows as above | each file | used-in-code |

## 4. `templates/action/9.lua` (user-added "Sword Magicks" template)

**Purpose.** A copy of the action template that the user added for BlueMagick's Sword Magicks school. Its header
comment says DD picks a template by category number, that a category with no template renders an empty panel (which
is how Enbio and the other Sword Magicks looked), and that the status row still applies because the on-hit status
comes from the weapon.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Body | Same four rows as action/1.lua | L7-25 | used-in-code |
| Claim: category 9 = Sword Magicks | Only the comment says so. In BlueMagick, Sword Magicks are school **6** in the sec11 battle-menu table (`SCHOOL2 = 6`). Their action records get +0x21 = `sp.aura or CFG.aura` (default 5), and no Sword Magick sets its own aura. Nothing in the Drive set writes 9 to +0x21 | L1-4; BlueMagick L64, L204, L913-914; spells_sword (xref) | comment-only, **contradicted by code** |
| Not loaded by current DD | `DynamicDescription.lua` loads action templates for n = 0..8 only, so `action_9` never exists. Even if a record had +0x21 = 9, `template.get` would print "not found" and render nothing | DD main L27-29, L97-100; template L202-207 (xref) | used-in-code |
| Likely real cause of empty panels | With the default aura of 5, Sword Magicks already resolve to `action_5`. An empty panel is more likely to come from the parser dropping the record (requiredContent = 0xFFFF at +0x22) or from the panel being built before BlueMagick clones its records. BlueMagick sets the `dd_refresh` symbol for that reason | DD parser L139, L151; BlueMagick L2505-2513 (xref) | unclear (inference) |
| To make 9.lua work | Raise DD's action range to {0, 9} and give the Sword Magick records aura 9. Caution: +0x21 also selects the battle-menu school and the charge-aura animation, and 9 is not a vanilla aura id (BlueMagick's colour list stops at 6) | DD main L28; BlueMagick L115-121, L205-206 (xref) | unclear (inference) |

## 5. `templates/equipment/0.lua`, `1.lua`, `10.lua` (DynamicDescription, 3 identical files)

**Purpose.** Inventory description layouts for equipment, selected by the item's icon id: 0 = unarmed/hand,
1 = sword, 10 = axe. Every other icon 0..191 has its own file (not in this batch).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Row 1 (header) | `equipment:common` blocks: name, hitsFlying (icon), element (icon), category (icon + label), type (label), license (label) | L3-10 | used-in-code (DD schemas, xref) |
| Row 2 (stats) | `equipment:attributes` with attackPower, chargeTime, comboOrCriticalChance, evadeWeapon, knockbackChance, magickPower, maxHp, maxMp, onHitRate, range, speed, strength, vitality. Args showLabel and showPercentage. Row `maxitems:(4)` caps the row at 4 items | L12-14 | used-in-code |
| Weapon-only set | The list leaves out the armour/shield fields (defense, magickResist, evadeShield, magickEvadeShield, augment). The per-category attributeSets filter would drop them for weapons anyway | L13; DD cache L80-90 (xref) | used-in-code |
| Row 3 (status) | `equipment:statusEffect` with hit, equip and immune. `hit` comes from the item's own statusEffects field. `equip`/`immune` are the u32 masks at attribute record +8/+12. Labels and icons, max 10 | L16-18; DD parser L84, L117-118 (xref) | used-in-code |
| Row 4 (elements) | `equipment:elementalAffinity` with weak, immune, half, absorb, potency (u8 masks at attribute record +19/+17/+18/+16/+20), max 10 | L20-22 | used-in-code |
| Row 5 (notes) | `equipment:common` with `notes` | L24-26 | used-in-code |
| Identity | 1.lua and 10.lua match 0.lua byte for byte (md5 c00d2b0a...) | all | n/a |
| Rows per file | 1.lua L3-26 and 10.lua L3-26: same rows as 0.lua | each file | used-in-code |

---

## Editor takeaways

* **CCEP upgrade costs live in RAM, not in a game file.** A memory editor can read or override them at
  0x02099EF1 (54 x {u16 id, u16 qty}, odd-aligned) once the CCEP NPC has set flow+0x99. An offline editor should edit
  `lootData.lua` and keep the per-rank entry counts unchanged.
* **The Lua config schemas are simple enough to generate.** lootData = `{[rank] = {{id, qty}...}}` with loot ids
  0x2000..0x21FF. settings = 4 scalar keys with the ranges above.
* **A DD template editor needs:** the grammar (row attrs, block `section:type`, content/args lists), the valid-content
  tables per section/type, the file-key rules (action = record +0x21 in 0..8, equipment = icon in 0..191), and a
  check that warns when a template is created outside the loaded range (as with action/9.lua).
* **A battlepack action editor** should treat sec14 +0x21 as one shared "school / aura / description category" byte,
  since changing it moves the action between battle-menu schools and description templates at once.
