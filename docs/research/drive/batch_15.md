# Drive batch 15: user config files (`scripts/config/...`) for Xeavin, LowPriorityCitizen and FehDead mods

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR.
Drive path: `My Laptop/scripts/config/` (plus `config/Wayfarer/` and `config/TheInsurgentsForgeConfig/functions/`).

| # | Drive id | Title | Lines / bytes | md5 (first 8) | Line ends | Status |
|---|---|---|---|---|---|---|
| 1 | 1LdWhio0e2ZgHTuqY7z1rM0SA2m0BAi-I | 195.lua (Forge function override) | 66 / 2156 | 66320b17 | CRLF | read in full |
| 2 | 1ETKDBW7obY5_6SfuALR2y0qMnN3oTKz- | modMenu.json (Wayfarer) | 8 / 157 | 19015c00 | LF | read in full |
| 3 | 12Ks01m3FIFgfslRGz-P9iCbTTOs5LkTp | AccurateEvadeChanceConfig.json | 2 / 36 | c57f635b | LF | read in full |
| 4 | 1_sNZYMh0Px9d6mgm3HvolDz5YUtUGXl- | AlwaysSpawnTreasuresConfig.lua | 3 / 49 | 4088434e | CRLF | read in full |
| 5 | 1iniTAKLH7Q1Rv8dXgPZ664jwZXsP6gS3 | CharacterHealthbarColorsConfig.lua | 48 / 2054 | 25331044 | LF | read in full |
| 6 | 1DGW14zogaMAUmX_5705quKYHY564x1HO | DuplicateAugmentDetectorConfig.json | 25 / 375 | 56c21438 | LF | read in full |
| 7 | 1nVJ2EJeOeOafbiS5GO9BIWhfAQIbkCtS | HuntersInsightConfig.lua | 28 / 351 | 19849728 | CRLF | read in full |
| 8 | 13GqbI-cTM4KE6HwomHVCdN4Kce9FxCZQ | TheInsurgentsBountifulBundleConfig.json | 68 / 1327 | cbd429b8 | LF | read in full |
| 9 | 1qcuv-knNvksxDmY5rU8-RimmKtcp-yXS | TheInsurgentsChainBenefitsConfig.lua | 27 / 1198 | b67580ee | CRLF | read in full |
| 10 | 1QKywGHVwcVEh0tt1u90AD3upJcgypNo9 | TheInsurgentsCompanionsConfig.lua | 16 / 325 | 5165b2eb | CRLF | read in full |
| 11 | 1ykGQJn2NcB4U31XqL4Py6leOK4mrKda4 | TheInsurgentsCuratedShadesConfig.lua | 33 / 831 | 1d77dec7 | CRLF | read in full |
| 12 | 1N1UTfH5pdSPHcyAhyQS43YNcXriCMXTz | TheInsurgentsLearnableFoecraftConfig.lua | 27 / 891 | 2396fb1d | LF | read in full |
| 13 | 1GeOO4HGRXZkKHWILsrRfMOAzC8-HKUWg | TheInsurgentsLuckyLootConfig.lua | 30 / 916 | ed5b0d9d | CRLF | read in full |
| 14 | 1A0HF8EkhoZ5-SQXsbSTmsNr8bgTmfS2O | TheInsurgentsManifestoConfig.lua | 19 / 468 | abce0218 | CRLF | read in full |

No file is missing.

**What these files are.** All 14 are user-side configuration files that the mods in `scripts/` load at start-up and
reload when the file changes. They hold settings, not engine code. On their own they contain only 2 engine addresses
(the vanilla HP-gauge colour globals, cited in a comment of file 5). Most of their technical value is in the **shape
of the tables** each mod expects, and in the **id spaces** the configs use (action ids, content ids, status bits,
foe ids, particle ids). To read those ids correctly I looked at the consuming mod and its `helpers.lua` enum tables.
Those rows are marked **xref** and name the consumer file. Those consumer files belong to other batches. I read only
the parts needed to decode these configs.

Line endings: files 5 (CharacterHealthbarColors) and 12 (LearnableFoecraft) use LF only, while Xeavin's shipped
configs use CRLF. Both LF files carry user (overhaul) edits. Files 2 (Wayfarer modMenu.json) and 8 (BountifulBundle
JSON) are **written back by the mod itself** through `config.saveJson`.

Licensing: files 1, 4 and 8 to 14 configure Xeavin mods (personal use only). File 1 starts with Xeavin's credit
line. Files 3, 6 and 7 configure LowPriorityCitizen mods, file 2 configures FehDead's Wayfarer, and file 5 configures
the user's own CharacterHealthbarColors (CHC). Everything below is paraphrased facts. No code is copied.

Evidence key:
* **byte-check-in-code**: the consuming mod compares the original bytes at that address before it patches.
* **used-in-code**: the config value is read by the consumer, or the consumer reads or writes the address or offset.
* **comment-only**: only a comment in the config says so.
* **unclear**: my inference from names or behaviour, not proven by the code.

---

## 1. `195.lua`: The Insurgent's Forge (TIF), function #195 override (Steal)

**Purpose.** TIF builds every battle formula from a chain of small Lua "functions" numbered 0..339. Each one lives in
`scripts/TheInsurgentsForge/functions/<n>.lua`. A file with the same number in `config/TheInsurgentsForgeConfig/functions/`
replaces the stock one. TIF hot-reloads it about once a second by checking the file's modification date. Function 195
is the whole **Steal** formula (formula id 49). This user copy changes Xeavin's stock 195 in two ways:
(a) each rarity slot (common, uncommon, rare) is tracked on its own. Steal reports "nothing to steal" only when **every**
present slot has been taken, and the rolls only award slots that are still flagged as available. (b) the call to
`helpers.getForcedStealRarity` (the debug forced-rarity hook) is removed.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Function signature | Each function returns one Lua function with the arguments (formula, caster, target, functions, classes, helpers). TIF calls these in order. If one sets `formula.skipState = 1`, the rest of that chain is skipped. | L2; xref TheInsurgentsForge.lua L1278-1298 | used-in-code |
| Function file range | TIF loads functions 0..339 from the main folder, then lets config files override them. The override is checked every 1000 ms by file modification time. | xref TheInsurgentsForge.lua L645-699, L1265-1273 | used-in-code |
| Formula 49 = Steal | The onCast formula table maps formula id 49 to the single function list {195}. | xref formulas.lua L162 | used-in-code |
| Target must be a foe | If the BattleUnitKeep `type` byte (+0x05) is 0 (party side), the function sets skipState=1 and outcomeType=6 (no effect / miss). | L3-6; xref getBattleUnitKeep.lua L4 | used-in-code |
| Steal slots in ARD unit | `ardUnit.commonSteal` / `uncommonSteal` / `rareSteal` are u16 content ids at ARD unit +0x32 / +0x34 / +0x36. The value 0xFFFF means the slot is empty. | L9-11; xref getArdUnit.lua L47-49, L79-81 | used-in-code |
| Pointer path to ARD | formula.target (FormulaProcWorkPlus at FormulaProcWork+0x08) has +0x08 pointing to BattleUnitWork. BattleUnitWork+0x0E60 points to the ARD unit. | L9; xref getFormulaProcWorkPlus.lua L5, getBattleUnitWork.lua L91 | used-in-code |
| Steal-state flags | BattleUnitKeepPlus+0x14 is a bit field. bit0 = common still stealable, bit1 = uncommon, bit2 = rare (1 = available). BattleUnitWork+0x06A0 points to BattleUnitKeepPlus. | L12; xref getBattleUnitKeepPlus.lua L10-20, L29; getBattleUnitWork.lua L62 | used-in-code |
| "Nothing to steal" test (user version) | No-steal happens only if every slot is either empty (0xFFFF) or already taken (flag 0). Then noStealState=1, skipState=1, outcomeType=6. Stock 195 instead fails when all slots are empty **or** any present slot is already taken. | L14-21 (cf. stock 195 L14-17) | used-in-code |
| Output fields | FormulaProcWork u8 fields: identifier +0x22, outcomeType +0x24, skipState +0x26, commonStealState +0x4E, uncommonStealState +0x4F, rareStealState +0x50, noStealState +0x51. | L17-62; xref getFormulaProcWork.lua L12-42 | used-in-code |
| Normal steal odds | Without Thievery the rolls are sequential, using `getRandomNumber(100)`: <3 gives rare, else <10 gives uncommon, else <55 gives common. Only the first roll that passes is tried, and the slot must still be available. | L23-39 | used-in-code |
| Thievery odds | With the Thievery augment (augment bit 17) there are three independent rolls: rare <6, uncommon <30, common <80. Several slots can be taken in one steal. | L40-58; xref getAugments.lua L20 | used-in-code |
| Augment source | `formula.caster.augments` is the caster's augment bit set at FormulaProcWorkPlus+0x10. | L23; xref getFormulaProcWorkPlus.lua L7 | used-in-code |
| Fail outcome | If no slot is awarded, skipState=1 and outcomeType=6. | L60-63 | used-in-code |
| Removed debug hook (stock only) | Stock 195 also uses a forced rarity read from `[[0x01F81428] + 0x0E5C]` (s32: -1 none, 0 common, 1 uncommon, 2 rare). The user override does not use it. | xref getForcedStealRarity.lua L3-4 | used-in-code |
| TIF entry patch | TIF compares the original bytes at its code pointers before patching. It allocates `tif_fpa` (0x13 bytes: caster u64 +0x00, target u64 +0x08, procType u8 +0x12, 1 = onCast, 2 = onHit, else mist end) and `tif_fpw` (0x200-byte FormulaProcWork copy). | xref TheInsurgentsForge.lua L1318-1365 | byte-check-in-code |

## 2. `modMenu.json`: Wayfarer (FehDead) saved settings

**Purpose.** Wayfarer ("Teleport Anywhere") adds a Teleport prompt to the world map. Its `ModMenu.lua` registers a Lua
Loader mod-menu page and saves its toggles to `config/Wayfarer/modMenu.json`. Here the user has turned
`consumeStones` on (the shipped default is off).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Keys (all boolean) | anim (teleport effect on departure and arrival), autoClose (close the menu after a pick), consumeStones (spend one Teleport Stone per trip), blockChocobo, blockEsper, blockUnvisited. | L2-7; xref Wayfarer ModMenu.lua L2-9, L37-77 | used-in-code |
| User values | All six are true. Code defaults are the same except consumeStones, which defaults to false. | L2-7 vs ModMenu.lua L5 | used-in-code |
| Loader rule | Only keys already in the defaults table are copied, and only if the saved value is a boolean. Unknown keys are ignored. | xref ModMenu.lua L22-27 | used-in-code |
| Toggle encoding | Menu row value 0 = "Yes" = true and 1 = "No" = false. The file stores real JSON booleans. | xref ModMenu.lua L122, L156, L162 | used-in-code |
| Block toggles need confirmation | Switching any block* key to false opens a Dialogs.lua confirm dialog first. The file is saved only if the player accepts. | xref ModMenu.lua L13-17, L141-152 | used-in-code |
| Block conditions | blockEsper / blockChocobo test bits 0x01 / 0x02 of the companion field at +0x5B04 of the character array (pointer at 0x02EBF190). blockUnvisited tests node flag 0x400 at map node +0x28. | xref Wayfarer.lua L35-53, L295-297 | used-in-code |
| Teleport Stone | Content id 0x2000 (loot range). It is counted with game function 0x309F30 and removed with 0x3008A0. | xref Wayfarer.lua L56-59, L289, L303 | used-in-code |

## 3. `AccurateEvadeChanceConfig.json`: AccurateEvadeChance (LowPriorityCitizen)

**Purpose.** One tunable: the parry bonus that the Evasion Boost augment adds in AEC's rewritten evade-chance code.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Key | `evasionBoostParryBonus` = 30 (code default is also 30). | L2; xref AccurateEvadeChance.lua L353 | used-in-code |
| Storage | Written as a u8 into the `aec_parryBonus` symbol. | xref AccurateEvadeChance.lua L354, L332 | used-in-code |
| Effect | If augment bit 4 (Evasion Boost) is set, the bonus is added to the parry byte at unit +0x0D and capped at 100 (0x64). | xref AccurateEvadeChance.lua L85-100; getAugments.lua L7 | used-in-code |
| Augment test | AEC tests augment bit n at byte `n>>3` of two bit sets, at unit +0x68 and +0x78 (I read these as permanent and temporary augments). | xref AccurateEvadeChance.lua L301-321 | used-in-code |
| Hook | Hook at 0x30A6BC. The original bytes `48 8B 4C 24 58` (mov rcx,[rsp+58h]) are checked first, and the code returns to 0x30A6C1. | xref AccurateEvadeChance.lua L2-8, L19 | byte-check-in-code |

## 4. `AlwaysSpawnTreasuresConfig.lua`: AlwaysSpawnTreasures (Xeavin)

**Purpose.** Returns a single boolean, `uniqueState`, here false. The mod forces every treasure chest to spawn. With
uniqueState true, it first asks the game whether a chest is a unique (one-time) chest and leaves those alone.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Value | The file returns one boolean (`uniqueState`). Here it is false. | L1-3 | used-in-code |
| Storage | Stored as u8 1/0 in the `ast_us` symbol. | xref AlwaysSpawnTreasures.lua L84, L93-97 | used-in-code |
| Hook | Call site 0x354454. The original bytes `E8 57 38 F1 FF` (call 0x267CB0) are checked before the site is replaced with a call to `ast_code`. | xref AlwaysSpawnTreasures.lua L2-3 | byte-check-in-code |
| Unique test | If ast_us is set, the chest record byte +0x09 is passed to 0x32AA60. A nonzero result skips the forced spawn (the function returns 0). | xref AlwaysSpawnTreasures.lua L17-26 | used-in-code |
| Forced spawn | Calls 0x3148F0 (current map id, by my reading), then 0x2FB430(table 0x02EC3E60, map, chest index byte +0x00, 1), then returns 1. | xref AlwaysSpawnTreasures.lua L28-36 | used-in-code |

## 5. `CharacterHealthbarColorsConfig.lua`: CharacterHealthbarColors (CHC), per-character HP gauge palette

**Purpose.** The palette for the user's CHC mod. Each party member gets a two-ended HP gauge colour: `r/g/b` is the
right end ("Max"), `low` is the left end ("Min"). CHC reads it and writes the engine's HpGaugeSide colour globals
per character inside a hook on the party-gauge colour call.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Vanilla gauge globals | HpGaugeSide Min RGBA is at 0x1E0CEF8..0x1E0CF04 and Max RGBA at 0x1E0CF08..0x1E0CF14, as 4 × u32 each. Vanilla values: Min = 57,127,85 (rendered #72FFAB) and Max = 57,80,127 (rendered #72A1FF). | L18-19; xref CHC.lua L13, L71-81 | used-in-code (by CHC) |
| Colour range | Config values are 0..255. CHC converts them with round(v·127/255), clamped to 0..127. Engine gauge channels top out at 127 (PS2-style half range). | L5; xref CHC.lua L201-210 | used-in-code |
| Table shape | `colors[id] = {r,g,b, low={r,g,b}}` plus an optional `gradient`. Ids are party member ids: 0 Vaan, 1 Ashe, 2 Fran, 3 Balthier, 4 Basch, 5 Penelo, 6 = all guests. | L22-46; xref CHC.lua L12, L213-216 | used-in-code |
| Vaan fallback | The config gives only ids 1..6. CHC takes `colors[id] or defaultColors[id]`, so Vaan (0) keeps the built-in vanilla-exact entry. | L20; xref CHC.lua L195, L216 | used-in-code |
| User palette (engine values after scaling) | Ashe Max 127,45,92 / Min 85,57,127. Fran Max 104,57,127 / Min 57,63,127. Balthier Max 57,127,69 / Min 127,121,57. Basch Max 127,57,50 / Min 127,57,99. Penelo Max 115,127,57 / Min 127,85,57. Guests Max 57,65,77 / Min 88,96,107. | L26-41 (computed) | used-in-code |
| Stale comment | The Ashe comment says engine Min is 127,92,118, but the actual `low` scales to 85,57,127. The Max part of the comment (127,45,92) is right. | L25 | comment-only |
| `gradient` trap | gradient 0.100 is used only for entries without `low`. CHC then sets Min = Max / gradient **without clamping**, so 0.1 would produce channel values up to 1270. Every entry here has `low`, so the value is never used. A safe value would be ≥ 1.0 (CHC's own default is 0.72). | L44-45; xref CHC.lua L178, L231-234 | used-in-code |
| Per-character table in memory | `chc_colors` holds 7 entries of 0x18 bytes: u32 maxR,maxG,maxB at +0x00/04/08 and u32 minR,minG,minB at +0x0C/10/14. | xref CHC.lua L213-235 | used-in-code |
| Hook sites | 0x2C83ED (`E8 9E DB FF FF`) and 0x2C8405 (`E8 86 DB FF FF`). Both call the gauge colour function 0x2C5F90 (ecx = 0 party / 1 enemy / 2 other, edx = ratio). The bytes are checked before patching. | xref CHC.lua L7-8, L15-19, L246-250 | byte-check-in-code |
| Character lookup | 0x209A1F0 holds 4 qword Battle Actor Work pointers (HUD slots). BAW+0x30 points to Battle Unit Work, and +0x698 to the Battle Unit Keep. Keep base 0x21B2914, stride 0x1C8, so keep index = party member id. | xref CHC.lua L9-11 | comment-only (in CHC) |
| Icon hues | Disc colours sampled from the party portrait icons: Vaan #2F86CF, Ashe #C64776, Fran #8430DC, Balthier #2C9311, Basch #C62F21, Penelo #E7A60F. Brightness is lifted toward vanilla gauge luminance (right end Y=158, left end Y=219). | L7-16 | comment-only |

## 6. `DuplicateAugmentDetectorConfig.json`: DuplicateAugmentDetector (LowPriorityCitizen)

**Purpose.** Four highlight colours. DAD uses them to tint menu entries whose augment the character already has. Each
of the four categories (default, license, equipment, temporary) gets its own colour.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Keys | `default`, `license`, `equipment`, `temporary`, each {red, green, blue, alpha}. The code default per channel is 127. | L2-25; xref DAD.lua L516-523 | used-in-code |
| Range | Raw engine units 0..127 (127 = full, alpha 127 = opaque). Values are written as-is with **no** 0..255 scaling. | L3-24; xref DAD.lua L519-522 | used-in-code |
| Memory layout | `dad_colors` holds 4 × u32 RGBA (bytes R,G,B,A) in the key order above. Category k (1..4) returned by the augment check selects entry k-1. | xref DAD.lua L516-525, L132-137, L487 | used-in-code |
| User values | default 70,126,34,127. license 127,90,8,127. equipment 122,76,78,127. temporary 127,62,116,127. | L2-25 | used-in-code |
| Hooks | 0x3FF2E8 (`E8 F3 E4 ED FF`, call 0x2DD7E0), 0x3FEFC1 (`48 8B 44 24 20`) and 0x3FDF53 (`E8 88 F8 ED FF`, call 0x2DD7E0). The bytes are checked before patching. | xref DAD.lua L3-13 | byte-check-in-code |

## 7. `HuntersInsightConfig.lua`: HuntersInsight (LowPriorityCitizen)

**Purpose.** Position, scale and timing for HuntersInsight's overlay, which shows steals, drops, special drops and
poaches. The overlay is drawn from its own menu resource pack (`HuntersInsight.mrp`).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Keys | x=0, y=0, scale=1.0, cycleTime=60, alwaysShowItems=false. | L1-7 | used-in-code |
| cycleTime | Frames per page cycle (60 is about 1 second). Stored as u32 in `hi_ct`. Zero or missing becomes 60. | L12; xref HuntersInsight.lua L998-1005 | used-in-code |
| alwaysShowItems | Stored as u32 0/1 in `hi_asi`. | xref HuntersInsight.lua L1007-1012 | used-in-code |
| Ivalice UI preset | The comment recommends scale 0.75 for the Ivalice UI mod. | L21-26 | comment-only |
| MRP layout (xref) | MRP header +0x1C = group count (u32) and +0x20 = group table pointer (u32). Groups are 0x14 bytes: +0x00 entry count (u8), +0x04/+0x06 x/y (s16), +0x08/+0x0A w/h (u16), +0x10 entry pointer (u32). Entries are variable size: +0x00 size (u8), +0x01 type (u8), +0x04/06 x/y (s16), +0x08/0A w/h (u16), and for type 5 a u8 at +0x10 (font size, by my reading). x/y go into group 0. scale multiplies every geometry field. | xref HuntersInsight.lua L1016-1049 | used-in-code |
| MRP load | The file is loaded into exe-near memory (`memory.allocExe`, so u32 pointers work). Then `memory.execute(0x2A00F0, void, u64 mrp)` is called, which by my reading is the game's MRP pointer-fixup / registration routine. | xref HuntersInsight.lua L1060-1066 | used-in-code |
| Header text | Overlay titles are written as UTF-16LE wide strings with an "ex00" prefix. | xref HuntersInsight.lua L1090-1110 | used-in-code |

## 8. `TheInsurgentsBountifulBundleConfig.json`: The Insurgent's Bountiful Bundle (cheat options)

**Purpose.** The saved state of 21 cheat toggles. TIBB writes this file back from its mod-menu page. Every option is
off here, and the three multipliers are at 1.0.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Option ids (JSON keys) | alwaysChain, alwaysSpawnRareGame, alwaysStealEverything, autoLoot, expMultiplier, foesDropAllItems, foesRespawnOnSight, fullyRevealedMaps, godMode, infiniteChocoboTime, infiniteSummonTime, lpMultiplier, noAntiLibra, noMagickFields, noMinimapInterference, oneHitKill, partyMovementSpeedMultiplier, peacefulMode, quickRespawn, unlimitedQuickeningChains, unlimitedStealableFoeItems. | L2-67 | used-in-code |
| Record shape | `{state: bool}`. Options that take a value also have `parameter: float`: expMultiplier, lpMultiplier and partyMovementSpeedMultiplier. | L14-55 | used-in-code |
| One file per option | Each option is a module in `scripts/TheInsurgentsBountifulBundle/Options/<Name>.lua` with an id, a patch list and an optional parameter {symbol, value, min, max}. Enabling an option allocates exe blocks and assembles its patches. Disabling it frees them. | xref TIBB.lua L7-28, L32-77 | used-in-code |
| Parameter storage | The parameter is clamped to [min,max] and written as a float into the option's symbol. | xref TIBB.lua L42-44, L103-113, L161-166 | used-in-code |
| Saving | `config.saveJson` writes `{state, parameter}` for every option. Key order in the file is alphabetical, so it is the JSON writer's order, not the menu order. | xref TIBB.lua L121-140 | used-in-code |

## 9. `TheInsurgentsChainBenefitsConfig.lua`: The Insurgent's Chain Benefits (TICB)

**Purpose.** For each chain level, a list of random rewards granted when a foe in a chain is defeated.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Config signature | `function(targetTypes, benefitTypes, particleEffects, statusEffects, augments)` returns the chainLevels list. | L1, L24-27; xref TICB.lua L534 | used-in-code |
| Entry shape | {targetType, benefitType, value, particleEffect, chance%}. In memory each is 8 bytes: u8,u8,u8,u8 at +0..+3, then float chance at +4. | L7-20; xref TICB.lua L578-582 | used-in-code |
| Memory lists | `ticb_cllp` points to {u32 levelCount, u64 levelPtr[]}. Each level points to {u32 count, 8-byte entries[]}. | xref TICB.lua L561-588 | used-in-code |
| Level index | The current chain level index is the u32 at 0x022C3158 (0-based). Config list item 1 is chain level 1 (empty here), and items 2..4 are levels 2..4. | L3-21; xref TICB.lua L39-45 | used-in-code |
| Roll | The roll is RNG 0x328370 mod 10000, divided by the float constant at 0x8F3134 (giving 0..99.99). Chances add up through the list and the **first** entry whose running total exceeds the roll wins. At most one benefit per trigger. | xref TICB.lua L53-75 | used-in-code |
| Enums | targetTypes: leader 0, party 1, foe 2. benefitTypes: hp 0, mp 1, statuseffect 2, augment 3, level 4 (names are case-insensitive). particleEffects.chainBenefit = 118. statusEffects.protect = 18, shell = 19. | L7-20; xref TICB helpers.lua L1-30, L151, L206-207 | used-in-code |
| HP/MP value | The byte `value` (10) is multiplied with the unit's max HP/MP. I read it as a percentage. | L7-18; xref TICB.lua L245-275 | unclear |
| User table | Level 2: party HP 10 (10%), party MP 10 (10%). Level 3: party HP/MP at 20% each, leader Protect/Shell at 5% each. Level 4: party HP/MP at 25% each, party Protect/Shell at 5% each. Chance totals: 20 / 50 / 60. | L6-21 | used-in-code |
| Effect spawn | After applying a benefit, TICB calls 0x2EACD0(unit id, 1, &unit+0x08, particle id). | xref TICB.lua L185-191 | used-in-code |
| Hook | Call site 0x311146. The original bytes `E8 E5 83 00 00` (call 0x319530) are checked first. | xref TICB.lua L2-3 | byte-check-in-code |

## 10. `TheInsurgentsCompanionsConfig.lua`: The Insurgent's Companions (TIC)

**Purpose.** Toggles for showing the party in towns, showing equipment there, allowing an Esper with a full party, and
collecting guest equipment.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Return values | Two tables: configStates (booleans) and configParameters. | L1-16 | used-in-code |
| States | partyInTowns, partyEquipmentInTowns, esperWithFullParty and collectGuestEquipment are all true. The "main" option (party VM / quantity extension) is always on and not in the config. | L1-6; xref TIC.lua L2-16, L1178-1181 | used-in-code |
| partyInTowns param | 0 = leader only, 1 = full party. Stored as u8 in symbol `pit_ot`. | L9-10; xref TIC.lua L30, L1164-1165 | used-in-code |
| partyEquipmentInTowns param | 0 = hide, 1 = show. Stored as u8 in symbol `peit_is`. The user value is 0 (hide). | L12-13; xref TIC.lua L32, L408 | used-in-code |
| Main dependency | "main" waits for the VM basic pointer at 0x02B57EF0 to become nonzero before patching. | xref TIC.lua L1186-1190 | used-in-code |

## 11. `TheInsurgentsCuratedShadesConfig.lua`: The Insurgent's Curated Shades (TICS)

**Purpose.** Replaces the random spell pick of the **Shades of Black** technick with a weighted list. Here 25 black and
status magicks get 4% each (100% in total).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Config signature | `function(actions)` returns {{actionId, chance%}, ...}. | L1-33 | used-in-code |
| Memory list | `tics_alp` points to {u32 count, entries of 8 bytes: u16 action id at +0, float chance at +4}. | xref TICS.lua L117-131 | used-in-code |
| Action ids used | fire 18, thunder 19, blizzard 20, aqua 21, aero 22, fira 23, thundara 24, blizzara 25, bio 26, aeroga 27, firaga 28, thundaga 29, blizzaga 30, shock 31, scourge 32, flare 33, scathe 35, blind 57, poison 59, silence 60, sleep 61, blindga 62, toxify 63, silencega 64, sleepga 65. | L3-27; xref TICS helpers.lua L37-84 | used-in-code |
| Pick function | Function 0x387130 is replaced whole (the original prologue `48 89 5C 24 08` is checked first). It rolls RNG 0x328370 mod 10000 / [0x8F3134] and walks the running total. If nothing is picked it returns 0x9F (159 = the shadesofblack action itself). | xref TICS.lua L2-50; helpers.lua L178 | byte-check-in-code |

## 12. `TheInsurgentsLearnableFoecraftConfig.lua`: The Insurgent's Learnable Foecraft (TILF), Blue Magick hook

**Purpose.** Lets a party member learn a magick or technick by **witnessing** a foe use a given action. The user
added one entry as part of the BlueMagick overhaul: seeing a Cactoid use *Sten Needle* teaches "1000 Needles" (33%).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Return values | statusEffectIds, dialogId=102, augmentId=essentials (114), soundEffectId=104, learnables. | L14-24 | used-in-code |
| Blocking status list | ko 0, stone 1, stop 3, sleep 4, confuse 5, blind 7, disable 13, berserk 27, xZone 31. These are packed into a u32 mask (sum of 2^id) = 0x880020BB. A watcher with any of them cannot learn. | L2-12; xref TILF helpers.lua L18-51 | used-in-code |
| Param block | `tilf_prmp` points to a block of 0x08 + 0x200·8 bytes: u32 status mask +0x00, u16 dialog id +0x04, u8 augment id +0x06, u8 sound id +0x07, then one u64 list pointer per **foe id 0..511** at +0x08. | xref TILF.lua L302-311 | used-in-code |
| Per-foe list | {u32 count, entries of 8 bytes: u16 watched action id, u16 content id to grant, float chance%}. | xref TILF.lua L313-328 | used-in-code |
| User entry | foe cactoid (foe id 0), watched action stenneedle (action id 247), grant content 12369 = 0x3051, chance 33.00. | L21; xref TILF helpers.lua L185, L947 | used-in-code |
| Content 0x3051 | Magick content ids are 0x3000 + magick-list row. Vanilla rows are 0..80 (cure 0x3000 .. graviga 0x3050), so 0x3051 is row 81, the first BlueMagick row. The comment says it casts action 111. | L19-20; xref BlueMagick.lua L86, L107, L144 | used-in-code (by BlueMagick) / comment-only (action 111) |
| Foe id source | TILF reads u16 foe id at `[BattleUnitWork+0x0E68]+0x52` (must be < 0x200) and the current action id at BattleUnitWork+0x0714. It skips the grant if 0x309FB0(content) says the content is already owned. | xref TILF.lua L50-82 | used-in-code |
| Hooks | 0x2340FB (`33 D2 48 8B CB`, gated on BattleUnitWork+0x6B4 == 0x0A) and 0x305001 (`41 8B C6 EB 14`). The bytes are checked before patching. | xref TILF.lua L2-8, L21-39, L345-349 | byte-check-in-code |

## 13. `TheInsurgentsLuckyLootConfig.lua`: The Insurgent's Lucky Loot (TILL)

**Purpose.** Walking builds up "steps". After a threshold, the leader may find items depending on the current
location. Here `findings` is empty (only a commented example), so with this config the mod finds nothing.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Return values | initialSteps 100.0, recurringSteps 50.0, statusEffectIds, dialogId 103, augmentId essentials (114), soundEffectId 65, castingState, targetedState, fleeingState (all true), findings. | L2-27 | used-in-code |
| Param block | `till_prmp` points to 0x20 bytes: float initialSteps +0x00, float recurringSteps +0x04, u32 status mask +0x08, u16 dialog +0x0C, u8 augment +0x0E, u8 sound +0x0F, u8 casting/targeted/fleeing flags at +0x10/+0x11/+0x12, u64 content list pointer +0x18. | xref TILL.lua L298-322, L333-334 | used-in-code |
| Status mask | ko, stone, stop, sleep, confuse, blind, disable, immobilize (14), berserk, xZone give 0x880060BB, the same as the code default. | L4-15; xref TILL.lua L239, L270-273 | used-in-code |
| Findings shape | {locationId, {contentId, count, chance%}, ...}. Only the entry whose location matches the current map is loaded, as {u32 count, 8-byte entries: u16 content, u16 count, float chance}. | L23-25; xref TILL.lua L298-349 | used-in-code |
| Step counters | 40 floats (one per battle unit slot 0..39) at `till_pmsp`, reset to 0 on every map jump. | xref TILL.lua L351-362 | used-in-code |
| Example ids | locations.sandSweptNaze = 229. contents.items.potion = 0. contents.loot.emptyBottle = 8448 (0x2100). | L24; xref TILL helpers.lua L414, L1503, L2248 | used-in-code |
| Hook | Call site 0x310E14. The original bytes `E8 07 6E 06 00` (call 0x377C20) are checked first. | xref TILL.lua L2-3 | byte-check-in-code |

## 14. `TheInsurgentsManifestoConfig.lua`: The Insurgent's Manifesto (TIM)

**Purpose.** On/off switches for TIM's optional quality-of-life options. The core extension options (VM, text and the
battlepack section extensions) are always on and **cannot** be set from this file.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Configurable options | TIM has 24 options in total. Only indices 14..24 are read from the config: smartStealingGambits, trueInvisibility, thirtySixGambitsAndOneSet, hideEquipmentOutOfBattle, customAutoSheatheDelay, noHiddenEffectsOnPause, noChainLootPickupPunishment, noAutoPause, noAutoSave, noIntroLogo, noCrashDumper. | L1-13; xref TIM.lua L2-27, L2759-2762 | used-in-code |
| Fixed options (not in config) | vmExtension, textExtension, battlepackChainLevels/Gambits/LicenseNodes/Equipment/Actions/StatusEffects/StoryPointAdditions extensions, globalSpecialActionAnimations, quickLicensePurchase, properGambitSlotCount, smartStatusEffectGambits. | xref TIM.lua L2-15 | used-in-code |
| User states | On: smartStealingGambits, trueInvisibility, customAutoSheatheDelay, noHiddenEffectsOnPause, noIntroLogo, noCrashDumper. Off: thirtySixGambitsAndOneSet, hideEquipmentOutOfBattle, noChainLootPickupPunishment, noAutoPause, noAutoSave. | L2-12 | used-in-code |
| customAutoSheatheDelay | Parameter 1 goes into `casd_base` (u32). Vanilla multiplies the sheathe timer by 3 (`lea ecx,[rax+rax*2]` at 0x307F72; `cvttss2si` plus `lea edx,[rcx+rcx*2]` at 0x307F96). TIM multiplies by the parameter instead, so 1 is one third of the vanilla delay. Values above 6 add an extra check after the 0x307D10 call at 0x30813D. | L16; xref TIM.lua L198-201, L360-363, L2296-2333 | byte-check-in-code |
| Battlepack dependencies | The license-node and action extensions wait for battlepack section 12 (license nodes) and section 14 (actions) to be loaded. They register `licenseNodeCount`, `actionCount` and `maxActionId` (= count - 1). | xref TIM.lua L2773-2790 | used-in-code |
| VM extension pointer | The VM extension table pointer is written to 0x02B57EF8, with u64 count = 0x100 + number of added VM calls, and call lists at +0x2008 with a stride of 0x20. | xref TIM.lua L2799-2810 | used-in-code |

---

## Cross-file id spaces confirmed while decoding these configs (for editors)

| Space | Range / rule | Source | Evidence |
|---|---|---|---|
| Content id: items | 0x0000..0x003F (64; potion 0) | TILL helpers.lua L1502-1568 | used-in-code |
| Content id: equipment | 0x1001..0x11A3 (419 entries; broadsword 0x1001) | TILL helpers.lua L1569-1990 | used-in-code |
| Content id: loot | 0x2000..0x21FF (512; Teleport Stone 0x2000, emptyBottle 0x2100) | TILL helpers.lua L1991-2505; Wayfarer.lua L59 | used-in-code |
| Content id: magicks | 0x3000 + row, vanilla rows 0..80 (cure 0x3000 .. graviga 0x3050). Row 81+ is new (BlueMagick). | TILF/TILL helpers; BlueMagick.lua L86, L144 | used-in-code |
| Content id: technicks | 0x4000..0x4017 (24; firstaid 0x4000, shadesofblack 0x4001, giltoss 0x4017) | TILF helpers.lua L1329-1355 | used-in-code |
| Content id: gambits | 0x6000..0x60FF (256) | TILL helpers.lua L2617-2875 | used-in-code |
| Content id: key items | 0x8000..0x81FF (512) | TILL helpers.lua L2876-3390 | used-in-code |
| Content id: mist/quickenings | 0xC000..0xC01F (32; redspiral 0xC000 .. secondjob 0xC01F) | TILF helpers.lua L1356-1390 | used-in-code |
| Action ids | 0..542 (543 entries). For vanilla magicks, action id = magick row (cure 0, protect 51, fire 18). stenneedle 247, shadesofblack 159. | TILF helpers.lua L699-1244; TICS helpers.lua L178 | used-in-code |
| Foe ids | 0..511 (cactoid 0, ichthon 1, wolf 2, ...) | TILF helpers.lua L184-698 | used-in-code |
| Location ids | 0..1314 (sandSweptNaze 229) | TILL helpers.lua L184-1501 | used-in-code |
| Status effect bits | 0..31 in a u32 mask: ko 0, stone 1, petrify 2, stop 3, sleep 4, confuse 5, doom 6, blind 7, poison 8, silence 9, sap 10, oil 11, reverse 12, disable 13, immobilize 14, slow 15, disease 16, lure 17, protect 18, shell 19, haste 20, bravery 21, faith 22, reflect 23, invisible 24, regen 25, float 26, berserk 27, bubble 28, hpcritical 29, libra 30, xzone 31. | TILF helpers.lua L18-51 | used-in-code |
| Augment bits | stability 0, safety 1, accuracyBoost 2, shieldBoost 3, evasionBoost 4, ..., thievery 17, ..., essentials 114 (used as an augment id by TILF/TILL). | getAugments.lua L2-25; TILF helpers.lua L168 | used-in-code |
| Weighted pick idiom | TICB, TICS, TILF and TILL all roll RNG 0x328370 mod 10000 / float[0x8F3134] and compare against a running total of float chances in 8-byte list entries. | TICB.lua L53-59; TICS.lua L14-20; TILF.lua L148-155; TILL.lua L126 | used-in-code |
| Battle unit keep table | `[0x02EBF190] + 0x08 + id·0x1C8`, id 0..39 | getBattleUnitKeep.lua L2-7 | used-in-code |

**Editor relevance.** These files define the exact schemas a config editor must emit for 13 mods, plus one TIF formula
override:
* JSON: Wayfarer, AEC, DAD and TIBB.
* Lua return-tables: AST, CHC, HI, TIC and TIM.
* Lua `function(enums...)` tables: TICB, TICS, TILF and TILL.
* Forge formula function: `functions/<n>.lua`.

An editor can validate ids against the enum ranges above. It can map the 0..255 to 0..127 colour scaling (CHC only;
DAD takes raw 0..127). It can also flag pitfalls: a CHC `gradient` below 1 with no `low`, TIM keys 1..13 being
ignored, and Wayfarer block toggles needing the in-game confirm dialog.
