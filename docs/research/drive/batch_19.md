# Drive batch 19: TIBB options (part 2) + ModMenu, three `helpers.lua` enum tables, three Forge assembly stubs

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR.
All addresses below are absolute VAs, and RVA = VA - 0x120000.

| # | Drive id | Title | Drive path | Lines / bytes | md5 (first 8) | Status |
|---|---|---|---|---|---|---|
| 1 | 1lWsdyhF18PvZve3wFxcnZyjNKjeOx_n5 | NoMinimapInterference.lua | TheInsurgentsBountifulBundle/Options | 17 / 326 | dffcf0c1 | read in full |
| 2 | 166wAjQjCnJfrn9i7S9aOmNtsIjO9N4TZ | OneHitKill.lua | TheInsurgentsBountifulBundle/Options | 38 / 750 | ba642c50 | read in full |
| 3 | 1RT8DUFWgR6ThFhsDC7j9Jog5MvJ_SDj3 | PartyMovementSpeedMultiplier.lua | TheInsurgentsBountifulBundle/Options | 61 / 1295 | 05a5d91d | read in full |
| 4 | 1CQTAexfePvErDxCx51HkWfWxUefbXwiZ | PeacefulMode.lua | TheInsurgentsBountifulBundle/Options | 52 / 1008 | d64c26d2 | read in full |
| 5 | 1-bfJ8cRAxyX3Yy4hu5EESTPy4qGDxhYF | QuickRespawn.lua | TheInsurgentsBountifulBundle/Options | 16 / 260 | 0899be3e | read in full |
| 6 | 1_uwXckoelRvkvfXJc-wETzEgM9N0-XJE | UnlimitedQuickeningChains.lua | TheInsurgentsBountifulBundle/Options | 31 / 571 | f277e517 | read in full |
| 7 | 1CTATxcYmWhJq1akMp3CAnvbaNLTHlQoY | UnlimitedStealableFoeItems.lua | TheInsurgentsBountifulBundle/Options | 37 / 718 | 3bdff0db | read in full |
| 8 | 13omHucw6A3MHreu0uzK6EIakAqIcOZa7 | ModMenu.lua | TheInsurgentsBountifulBundle | 327 / 8619 | 60777005 | read in full |
| 9 | 1Wj7Vho68TzeiNEMhCMNFTDLRrvA1LSlO | helpers.lua | TheInsurgentsChainBenefits | 361 / 7217 | 57c9579e | read in full |
| 10 | 1J3_botJsxAoaEn_GBu_4fHVMhunazDcm | helpers.lua | TheInsurgentsCuratedShades | 568 / 11151 | b86b4c26 | read in full |
| 11 | 1LsrveUNgX8aMYEeRZBv6-HB9wnSvvk28 | helpers.lua | TheInsurgentsDescriptiveInventory | 629 / 13544 | dce1319f | read in full |
| 12 | 1aWviHkIk14bW2z-w2pfOW9BH-aOFeys9 | addAugment.lua | TheInsurgentsForge/assemblies | 64 / 918 | e1525910 | read in full |
| 13 | 1xrYQsVgyG0JhBW8hsfS6UAxE0Q2J1ztz | addStatusEffect.lua | TheInsurgentsForge/assemblies | 244 / 3662 | f9e6add6 | read in full |
| 14 | 1seDq3YL34gKV-e1H6iFv0NNN02w9_gY6 | applyKnockback.lua | TheInsurgentsForge/assemblies | 32 / 404 | 8b23401c | read in full |

No file is missing. All files have CRLF line endings. Every file is part of a mod by **Xeavin** (TIBB, TICB, TICS,
TIDI, TIF). The licence is personal use only, so this note records facts in my own words and copies no code.

To explain how this batch's files are used, I also read these files from other batches (cross-references only):
`TheInsurgentsBountifulBundle.lua` (1cxHyAmEytNpLGgSjURZgC4iGZt5b1EdP), `TheInsurgentsChainBenefits.lua`
(1bq8U3MnctqAk1UF2UHFAnQc_12brfCi8) with its config (1qcuv-knNvksxDmY5rU8-RimmKtcp-yXS),
`TheInsurgentsCuratedShades.lua` (1nuYFHnFTcBknthpVEOLzNBIOK3Alwcql) with its config (1ykGQJn2NcB4U31XqL4Py6leOK4mrKda4),
`TheInsurgentsDescriptiveInventory.lua` (1sKZGnkOzu61JXoPbhDR4dQShZhuvwRcG), the Forge Lua wrappers
`helpers/addAugment.lua` (1RN9rO9BKFMGt_3AeAKSwteiVikLxEti8), `helpers/addStatusEffect.lua`
(17_CE4UwnRiI4pGSLX7G5LHTBiRxUQcKG), `helpers/applyKnockback.lua` (1oFnrb5r4KqBEy3KiilQzgFOIwqc7lPe2), and Forge
formulas 323/324/325. Repo specs used for cross-checks: `docs/formats/live-battle-unit-keep.md`,
`live-battle-actor-chain.md`, `battlepack-s15-status-effects.json`, `battlepack-s58-augments.md`.

Evidence key:
* **byte-check-in-code**: the code compares the original bytes in memory before it patches. **No file in this batch
  does this.** The TIBB option files list `originalBytes`, but the TIBB main script never compares them. It only writes
  them back when an option is turned off (main L47-L51, L62-L66). The other main scripts (TICB, TICS, TIDI) do check
  bytes at their own hook sites, but those sites are in other batches.
* **used-in-code**: the code patches, reads, writes or calls the address.
* **comment-only**: only a name, help string or comment says so.
* **unclear**: my own inference from the decoded instruction or a cross-reference. It is not proven.

I decoded every `originalBytes` sequence by hand (opcode, ModRM, displacement), and each decode is given in the tables.
The patch sizes match the original sizes: a `jmp rel32` is 5 bytes, plus the `nop N` padding.

---

## 0. Shared: TIBB option-file format (same as batch 18)

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Option table | Each option file returns a table with `id` (camelCase), `name`, `state` (false by default), a `patches` array, and an optional `parameter` `{symbol, value, min, max}`. | every option file L1-L5 | used-in-code |
| Patch entry | `target` (absolute VA), `originalBytes` (the vanilla bytes, written back on disable), `patchCode` (assembled at `target`), and an optional `blockCode` plus `symbols` (a code cave in newly allocated executable memory; `%name%` in patchCode is replaced by the cave label's address). A patch entry that has only `blockCode` is a data-only cave, such as the float slot in PartyMovementSpeedMultiplier. | every option file | used-in-code |
| Apply order | Assemble every cave, write the parameter float to `memory.float[getSymbol(symbol)]`, then assemble each patchCode at its target. To disable: read the float back, `memory.writeArray(target, originalBytes)`, unregister the symbols, then `memory.deallocExe` each cave. | TIBB main L32-L78 (xref) | used-in-code |
| Load order | The main script loads the 21 options with `dofile`, in this order: Peaceful, God, OneHitKill, Exp, Lp, PartyMovementSpeed, QuickRespawn, FoesRespawnOnSight, AlwaysSpawnRareGame, AlwaysChain, AutoLoot, FoesDropAllItems, UnlimitedStealableFoeItems, AlwaysStealEverything, NoMagickFields, NoAntiLibra, NoMinimapInterference, FullyRevealedMaps, UnlimitedQuickeningChains, InfiniteSummonTime, InfiniteChocoboTime. The ModMenu toggle rows must be in the same order, because reset pairs them by position. | TIBB main L7-L29 (xref) | used-in-code |
| Jump reach | The patch-to-cave branch is `jmp rel32` (5 bytes), and caves use absolute `[0x...]` and `jmp 0x...` operands. The Lua Loader must therefore allocate caves within ±2 GB of the image. | all cave patches | used-in-code |

---

## 1. NoMinimapInterference.lua

**Purpose.** Turns off the minimap scrambling in areas such as The Feywood. The game reads a per-area "interference"
byte, and the patch replaces that read with zero.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Option id | `noMinimapInterference`, no parameter | L2 | used-in-code |
| Patch site | VA **0x00314A89** (RVA 0x1F4A89). Original 7 bytes `0F B6 80 62 10 00 00` = `movzx eax, byte [rax+0x1062]`. | L7-L8 | used-in-code |
| Patch | The read is replaced by "eax = 0" (2 bytes) plus 5 bytes of nop. The rest of the code then sees interference = 0. | L9-L12 | used-in-code |
| Field | Byte **+0x1062** of the object in RAX at this site is the minimap-interference flag or level. Which object this is (location data or map state) is not identified. | L8 | unclear |

---

## 2. OneHitKill.lua

**Purpose.** Every hit the party lands kills the target. Two patches: one forces the game's built-in one-hit-kill state
check on, and the other changes the damage-calculation locals.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Option id | `oneHitKill`, no parameter | L2 | used-in-code |
| Patch 1 site | VA **0x0017D36B** (RVA 0x05D36B). Original 6 bytes `38 88 34 0C 00 00` = `cmp byte [rax+0xC34], cl`. | L7-L8 | used-in-code |
| Patch 1 | Replaced by a 2-byte compare that always clears ZF (`test esp,esp`) plus 4 nops, so the "not equal" path is always taken. | L9-L12 | used-in-code |
| Link to getOneHitKillState | 0x0017D36B lies inside **0x0017D360**, which the Forge calls "one-hit-kill state" (batch 20: no inputs, returns a flag in EAX). This patch therefore makes that state query report "on". | n/a | unclear (xref batch_20 summary) |
| Debug block guess | The developer debug block at 0x01F81428 has God Mode at +0xC20 (batch 18). The byte at **+0xC34** in this compare may be a nearby debug field (one-hit-kill mode) of the same block, if RAX is that base. | L8 | unclear |
| Patch 2 site | VA **0x003075AD** (RVA 0x1E75AD). Original 8 bytes `C7 44 24 74 61 79 FE FF` = store the dword 0xFFFE7961 (= **-99999**) to the stack local [rsp+0x74]. The cave returns to 0x003075B5. | L15-L16, L31 | used-in-code |
| Patch 2 cave | The cave sets bit 3 (0x08) and clears bit 6 (0x40) in the local dword [rsp+0x7C]. It then stores 0 (not -99999) to [rsp+0x74] and resumes. | L21-L32 | used-in-code |
| Locals meaning | In this damage-resolution frame, [rsp+0x7C] is a hit-result flag word: bit 3 is probably "lethal/kill", bit 6 probably "miss/no effect". [rsp+0x74] starts as the sentinel -99999. | L23-L29 | unclear |

---

## 3. PartyMovementSpeedMultiplier.lua

**Purpose.** Multiplies party movement speed by a float from 1.0 to 10.0. One hook scales only units whose keep type is
0 (party members). A second hook scales another speed value with no check.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Option id | `partyMovementSpeedMultiplier`, with parameter symbol `pmsm_mul` (default 1.0, min 1.0, max 10.0). The ModMenu slider step is 0.25. | L2, L53-L58 | used-in-code |
| Data cave | `pmsm_mul` is a 4-byte float slot whose initial value is 0x3F800000 (1.0f). TIBB writes the slider value into it live. | L7-L11 | used-in-code |
| Hook 1 site | VA **0x00336D95** (RVA 0x216D95). Original 8 bytes `F3 0F 11 83 D8 00 00 00` = `movss [rbx+0xD8], xmm0` (store the speed). The cave returns to 0x00336D9D. | L14-L15, L33 | used-in-code |
| Hook 1 logic | Read the qword at **[rdi+0x698]**, which is Battle Unit Work +0x698, the Battle Unit Keep pointer. If it is non-null and **keep+0x05 (type) == 0** (party member), multiply xmm0 by pmsm_mul. In every case it then does the original store to [rbx+0xD8]. RDI is therefore a Battle Unit Work, and **[rbx+0xD8]** is a float movement speed in an object related to the unit (probably its actor or movement state). | L21-L33 | used-in-code (offsets); unclear (RBX object) |
| Hook 2 site | VA **0x0047432C** (RVA 0x35432C). Original 9 bytes `F3 44 0F 10 8B 98 00 00 00` = `movss xmm9, [rbx+0x98]`. The cave returns to 0x00474335. | L38-L39, L48 | used-in-code |
| Hook 2 logic | Loads [rbx+0x98] into xmm9 and multiplies it by pmsm_mul, with no party check. The float at **+0x98** is probably the speed of the player-controlled leader or the locomotion animation rate (inferred from the option's purpose). | L45-L48 | unclear |

---

## 4. PeacefulMode.lua

**Purpose.** Lets the party explore without fighting. Characters cannot use aggressive actions and do not trigger
traps. The mod filters a call by a 16-bit id and filters a second path by a type word.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Option id | `peacefulMode`, no parameter | L2 | used-in-code |
| Hook 1 site | VA **0x003014F6** (RVA 0x1E14F6). Original 5 bytes `E8 C5 79 00 00` = `call 0x00308EC0` (0x003014FB + 0x79C5). Normal return 0x003014FB. Deny target **0x0030150A** (skips the call). | L7-L8, L25-L29 | used-in-code |
| Hook 1 filter | Reads a u16 id at [rcx], where RCX is the first argument of 0x00308EC0. The original call runs only when 0x4000 <= id < 0x8000 and id != **0x414D**. Every other id goes to the deny path. | L14-L26 | used-in-code |
| Id meaning | The id space is not stated. 0x4000-0x7FFF is the only allowed band, and 0x414D is one id excluded from it. In TIDI's content ids 0x4000+ are technicks, but here the band is more likely a command or AI-target class. | L15-L22 | unclear |
| Hook 2 site | VA **0x00301690** (RVA 0x1E1690). Original 5 bytes `45 0F B7 04 24` = `movzx r8d, word [r12]`. Normal return 0x00301695. Skip target **0x003017CB**. | L34-L35, L42-L45 | used-in-code |
| Hook 2 filter | Continue only when the u16 at [rbp+0x00] == **4**. Any other value jumps to 0x003017CB. This is the "no trap trigger / no aggressive action" side. Which value 4 stands for is unknown. | L41-L45 | used-in-code (logic); unclear (meaning) |
| Function | **0x00308EC0** is the call being filtered. Its argument has a u16 id at offset 0. | L25 | used-in-code |

---

## 5. QuickRespawn.lua

**Purpose.** Foes respawn after one area change instead of two.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Option id | `quickRespawn`, no parameter | L2 | used-in-code |
| Patch site | VA **0x002337D6** (RVA 0x1137D6). Original 2 bytes `3B F1` = `cmp esi, ecx`. | L7-L8 | used-in-code |
| Patch | Replaced by `test esp,esp` (ZF is always 0), so the code always takes the "not equal" path. The compare probably checks the current zone against the last cleared one, or a counter against 2. | L9-L11 | used-in-code (patch); unclear (meaning) |

---

## 6. UnlimitedQuickeningChains.lua

**Purpose.** Quickenings can always be cast, and chaining no longer uses up mist charges.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Option id | `unlimitedQuickeningChains`, no parameter | L2 | used-in-code |
| Site 1 | VA **0x002F895E** (RVA 0x1D895E). Original `38 41 37` = `cmp byte [rcx+0x37], al`. Replaced by the always-equal 2-byte compare plus 1 nop. If RCX is a Battle Unit Keep, **+0x37 is `maxMistBars`** (u8) in the keep spec. TICB's "classic mist" mode also multiplies max MP by keep+0x37. The compare then tests the number of Mist bars used or needed (AL) against the unit's maximum, and forcing "equal" removes that limit. | L7-L12 | used-in-code (patch); unclear (RCX = keep) |
| Site 2 | VA **0x00309DC5** (RVA 0x1E9DC5). Original `3B C2` = `cmp eax, edx`. Replaced by the always-equal compare. | L15-L19 | used-in-code |
| Site 3 | VA **0x0030DBC3** (RVA 0x1EDBC3). Original `85 C0` = `test eax, eax`. Replaced by the always-equal compare (ZF = 1, so the "zero" path is taken). | L22-L26 | used-in-code |

---

## 7. UnlimitedStealableFoeItems.lua

**Purpose.** Foes always have something to steal. The game clears one bit per steal slot when that slot is stolen, and
this option removes the four bit-clearing instructions.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Option id | `unlimitedStealableFoeItems`, no parameter | L2 | used-in-code |
| Site 1 | VA **0x0031146F** (RVA 0x1F146F). Original `0F B3 E8` = `btr eax, ebp` (clears bit EBP in EAX). Replaced by 3 nops. | L7-L11 | used-in-code |
| Sites 2-4 | VA **0x00385C17**, **0x00385C41**, **0x00385C6B** (RVA 0x265C17, 0x265C41, 0x265C6B). Each is a 4-byte `and byte [rax+0x14], imm8` with imm8 = **0xFB / 0xFD / 0xFE** (clears bit 2 / bit 1 / bit 0). Each is replaced by 4 nops. | L14-L32 | used-in-code |
| Steal flags byte | Some per-foe object holds a "stealable" bitset at **+0x14**: bits 0, 1 and 2 = 3 steal slots (probably common, uncommon and rare). The object in RAX is not identified. | L15, L22, L29 | unclear |

---

## 8. ModMenu.lua (TIBB mod-menu page)

**Purpose.** The Lua Loader mod-menu schema for "The Insurgent's Bountiful Bundle". It has one State toggle per option,
three float sliders, and a "Reset Options" button that asks for confirmation in a dialog.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Entry | `id = "TheInsurgentsBountifulBundle"`, `name = "The Insurgent's Bountiful Bundle"`, `schema = {...}` | L24-L27 | used-in-code |
| Row kinds | `divider` (label only), `toggle` (id, label, help, options, default), `floatSlider` (id, label, help, min, max, default, step, `inactive = true` greys it out until enabled), `button` (id, label, help, callback). | L28-L323 | used-in-code |
| Toggle options | Each toggle option is a pair `{text, 254}`: "On" is index 0 and "Off" is index 1. `default = 1` means Off. The number 254 is probably a fixed cell width in pixels. Wayfarer pads plain strings with `{widespace}` instead, and BlueMagick uses plain strings. | L37 etc. | used-in-code (pairs); unclear (254) |
| Field ids | `<optionId>State` for every option. `expMultiplierParameter`, `lpMultiplierParameter` and `partyMovementSpeedMultiplierParameter` are sliders: min 1.0, max 10.0, default 1.0, step 0.25. | L33-L131 | used-in-code |
| Help strings | These are short design notes. Peaceful = "no aggressive actions or traps". QuickRespawn = "one location instead of two". FoesDropAllItems includes the monograph and canopic jar. NoMagickFields lists HP Sap, MP Sap, No Attacks/Magicks/Technicks/Items and Magnet. NoAntiLibra = "bosses, hunts, rare game". FullyRevealedMaps = "maps, candles, urns, fill state, transitions". InfiniteChocoboTime also gives unlimited berries. | L35-L308 | comment-only |
| Reset flow | The button opens `dialog.show` with body `{speed:0}Revert all options to default?`, choices Yes/No, cursor 1, cancel 1, closeOnCancel, x 960, y 540, align 4, dim, lockInterface. If onClose gets choice 0 (Yes), it adds 1 to the event flag **`tibb_reset_options`**. | L1-L22 | used-in-code |
| Flag API | `event.createFlag(name, 0)` creates the flag. `event.getFlag` and `event.setFlag` change it. The main script listens with `event.registerFlagCallback("tibb_reset_options", fn)` and acts only when **cause == 4**. It then walks the schema, pairing each toggle with the next option in load order, and restores the defaults. | L1-L2, L18; TIBB main L203-L238 (xref) | used-in-code |
| Menu API (xref) | `modmenu.addTable(entry)`, `modmenu.setValue(modId, fieldId, v)`, `modmenu.setActive(modId, fieldId, bool)`, `modmenu.registerCallback(modId, fieldId, fn)`. A toggle value of 0 means the option is on. | TIBB main L149-L198 (xref) | used-in-code |

---

## 9. helpers.lua — TheInsurgentsChainBenefits (TICB)

**Purpose.** Case-insensitive name-to-id enums used by the TICB config: chain-benefit target types, benefit types,
particle-effect ids, the 32 status-effect bits and the 128 augment bits. Each enum is a metatable whose `__index`
lower-cases the key and raises an error for an unknown name or a key that is not a string.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Enum mechanism | `enum.new(name, table)` returns a proxy. A lookup lower-cases the key, and a missing key raises "Couldn't get unknown <name>". Config files call the enums with mixed-case names, for example `particleEffects.chainBenefit`. | L2-L16 | used-in-code |
| Target types | leader 0, party 1, foe 2. In the TICB main, 0 = keep type 0 and BUW+0x08 (focus id) == BUW+0x24. That is probably the leader test, with +0x24 an unnamed focus field. 1 = any keep of type 0 (party). Any other value requires keep type 1 (foe). | L18-L22; TICB main L139-L170 (xref) | used-in-code (logic); unclear (BUW+0x24) |
| Benefit types | hp 0, mp 1, statusEffect 2, augment 3, level 4. The TICB main indexes a 5-entry function table with this value (HP, MP, status, augment, level-up stubs). | L24-L30; TICB main L170-L185 (xref) | used-in-code |
| Benefit record (xref) | TICB packs each config row into 8 bytes: +0 u8 target type, +1 u8 benefit type, +2 u8 value or id, +3 u8 particle effect id, +4 f32 (the 5th config value, probably a chance %). Each chain level is a list of `u32 count` followed by these records. The root is `u32 count` followed by u64 pointers to the levels. | TICB main L560-L586 (xref) | used-in-code |
| Particle effect ids | **0-151**. 0 reserve. 1 unarmed. 2-48 weapon hit effects by weapon type and element (sword 2, +fire/lightning/ice 3-5; greatsword 6-8; katana 9-11; ninja sword 12; spear 13-17; pole 18-20; bow 21-25; crossbow 26; gun 27-32; axe 33; hammer 34-35; dagger 36-37; rod 38-41; staff 42-45; mace 46-47; measure 48; hand-bomb 49-50). Monster natural attacks in 9 elemental variants: slap 51-59, ram 60-68, fang 69-77, cutter 78-86, beak 87-95. 98 reflect. 104-111 cast auras (white, black, time, green, arcane, mist, technick, item). 113 level up. 115-117 traps (explosion, gas, tentacles). **118 chain benefit**. 128/129 evade weapon/shield. 130 immune. 131-132 teleport start/end. 135-136 mist init start/end. 137-138 dismiss start/end. 139-140 teleport flashes. 141 forced dismiss end. 142-147 black/time auras small/medium/big. 149 save crystal. 151 laser. Gaps are named reserveN, unarmedN or invisibleN. | L32-L185 | comment-only (names); used-in-code (passed as R9D to 0x002EACD0, TICB main L186-L191) |
| Particle effect function (xref) | **0x002EACD0**: ECX = focus id (BUW+0x08), EDX = 1, R8 = &BUW+0x08, R9D = particle effect id. It plays the effect on that unit. | TICB main L186-L191 (xref) | used-in-code |
| Status effect bits | 0 KO, 1 Stone, 2 Petrify, 3 Stop, 4 Sleep, 5 Confuse, 6 Doom, 7 Blind, 8 Poison, 9 Silence, 10 Sap, 11 Oil, 12 Reverse, 13 Disable, 14 Immobilize, 15 Slow, 16 Disease, 17 Lure, 18 Protect, 19 Shell, 20 Haste, 21 Bravery, 22 Faith, 23 Reflect, 24 Invisible, 25 Regen, 26 Float, 27 Berserk, 28 Bubble, 29 HP Critical, 30 Libra, 31 X-Zone. These match keep+0x3C / +0x64 and battlepack section 15 row order. | L187-L220 | used-in-code (as bit index) |
| Augment bits | **0-127** = the 128-bit temporary/permanent augment sets in the keep (+0x68 and onward) and battlepack section 58 rows. 0-63 are the classic augments (0 Stability … 41 Anti-Libra … 63 battlelore16). 64-85 are battle/magick/HP lores. 86 Inquisitor. 88-96 shield block, channeling and swiftness tiers (numbered 3, 2, 1 in descending id order). 103 Serenity. **104-113 gambit slots 1-10**. 114 Essentials. 116-127 remedy, potion, ether and phoenix lores (3, 2, 1). 38 and 115 unused. | L222-L351 | used-in-code (as bit index) |

---

## 10. helpers.lua — TheInsurgentsCuratedShades (TICS)

**Purpose.** A name-to-id enum of all **543 battlepack section 14 action rows (0-542)**. The TICS config uses it to
build a weighted pool of actions for Shades of Black.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Enum | `helpers.actions`, the same lower-casing proxy as in file 9. Lua keywords and names that start with a digit are quoted keys (`break`, `1000needles`). Cúchulainn uses a non-ASCII `ú` in the key. | L2-L16, L62, L198, L285 | used-in-code |
| Magick rows | 0-80 = white (0 Cure … 17 Holy), black (18 Fire … 35 Scathe), time (36 Haste … 50 Warp), green (51 Protect … 72 Vanishga) and arcane (73 Drain … 80 Graviga). 81 is reserve. **Action id = magick content id - 0x3000** (compare file 11). | L19-L100 | used-in-code |
| Item rows | 82-110 = items 0-28 (Potion … Meteorite D). 111-123 reserve. 124-142 = motes (Reverse … Float). 143-145 = Eksir Berries, Dark Matter, Knot of Rust. **Action id = item content id + 82**, for both the item block (0-28) and the mote/loot block (42-63). | L101-L164 | used-in-code |
| System rows | 146 idle, 148 mount, 149 dismount, **150 attack**, 151 actstop, 152 sousachange, 153 escapestop, 154 escape. 147 and 155-157 are reserve. | L165-L176 | comment-only |
| Technick rows | **158-181** = First Aid … Gil Toss. **Action id = technick content id - 0x4000 + 158**. Shades of Black is 159 (0x9F). The TICS hook loads 0x9F. | L177-L200; TICS main L44 (xref) | used-in-code |
| Quickening rows | 182-241: Pain Flare … Black Hole (the character Quickenings). Some slots are reserve (230, 232, 233, 235, 236, 238-240). | L201-L260 | comment-only |
| Mist and traps | 242-244 Mist charge 1-3. 245 chain bonus. 246 explosion. 247-261 trap and bug effects (Sten Needle, Fusillade, Wizard's Bane, the gases, Stasis, Swarm, Leech, Oil Bug, Gil Bug, Rejuvenation, Manafont). | L261-L280 | comment-only |
| Esper rows | **262-274** = Belias, Mateus, Adrammelech, Hashmal, Cúchulainn, Famfrit, Zalera, Shemhazai, Chaos, Zeromus, Exodus, Ultima, Zodiark. **275 = Dismiss (0x113)**. addStatusEffect (file 13) tests BUW current action == 0x0113. | L281-L294 | used-in-code (0x113 in file 13) |
| Foe abilities | 278-496 = foe and boss abilities (Fear … Gigaflare Sword). Duplicate names get a numeric suffix (renew2 305, raise2 326, leech2 415, charge2 423, divide2 436). 450-453 and 482-484 are reserve. **497-542 are reserve** and free for mods that add actions. | L297-L561 | comment-only |
| Pool format (xref) | The TICS config returns `{actionId, weight}` pairs. The vanilla-like pool is 25 black/status magicks at 4.00 each. The hook site is VA **0x00387130** with original bytes `48 89 5C 24 08`. The TICS main verifies these bytes before it patches. | TICS config L2-L28; TICS main L2-L3, L146-L147 (xref) | byte-check-in-code (in TICS main, not this file) |

---

## 11. helpers.lua — TheInsurgentsDescriptiveInventory (TIDI)

**Purpose.** A name-to-id table of **content ids**: the 16-bit ids the inventory and menu use for items, equipment,
magicks and technicks. TIDI configs use them to attach a custom description string to a content id.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Structure | `helpers.contents` is an enum of 4 sub-enums: `items`, `equipment`, `magicks`, `technicks`. Usage is `contents.equipment.excalibur`. | L618-L627 | used-in-code |
| Items | **0x0000-0x003F** (0-63). 0-28 consumables (Potion … Meteorite D). 29-41 reserve. 42-60 motes. 61 Eksir Berries, 62 Dark Matter, 63 Knot of Rust. | L18-L83 | used-in-code |
| Equipment | **0x1001-0x11A3** (4097-4515), 419 names. 0x1000 is not listed (probably the "none" row). The order follows the in-game weapon classes: swords from 4097, katanas from 4121, ninja swords 4133, spears 4138, poles 4150, bows 4162, crossbows 4176, guns 4183, axes and hammers 4194, daggers 4206, rods 4217, staves 4225, maces 4235, measures 4244, hand-bombs 4250. Then 4256-4295 are extra or story weapons, including the esper weapons 4275-4287 (Belias's … Zodiark's) and the Zodiac Age zodiac blades. Shields are 4296-4315 (Gendarme … Ensanguined Shield), helms and hats 4316-4375, armour and robes 4376-4435, accessories 4436-4483 (Opal Ring … Dawn Shard), and ammo 4484-4515 (arrows, bolts, shot, bombs, Castellanos). | L85-L505 | used-in-code |
| Equipment row link | Content id - 0x1000 is probably the battlepack section 13 row (equipment). | n/a | unclear |
| Magicks | **0x3000-0x3050** (12288-12368), in the same order as action rows 0-80 (file 10). | L507-L589 | used-in-code |
| Technicks | **0x4000-0x4017** (16384-16407), in the same order as action rows 158-181. | L591-L616 | used-in-code |
| Lookup table (xref) | TIDI builds `u32 count` followed by 12-byte entries {u32 content id, u64 pointer to text}. Each text is the config string run through `message.convert` (the game's text encoding) plus a 0 terminator. Its hook (VA **0x00292667**, original `E8 C4 28 FC FF` = call 0x00254F30, checked before patching) compares the u16 at [r14-0x0A] with each entry. It skips when the dword at [r14-0x10] == 0x0E. On a match it swaps the description pointer in RBX. | TIDI main L1-L50, L148-L165 (xref) | used-in-code; byte-check-in-code (in TIDI main) |
| Language (xref) | The language index is the u32 at **[[0x01F82D20]]** (game settings base): 0 in, 1 us, 2 fr, 3 de, 4 it, 5 es, 6 kr, 7 ch, 8 cn. TIDI picks `<lang>.lua` as the config file for that language. | TIDI main L55-L70 (xref) | used-in-code |

---

## 12. addAugment.lua (Forge assembly stub `tif_aa`)

**Purpose.** Gives a unit a temporary augment. If the augment is timed, it also sets the timer slot. This is the Forge
version of what ChainBenefits does when it grants an augment.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Args block | `tif_aa_args`, 16-byte aligned. +0x00 u64 **Battle Unit Keep** pointer. +0x08 u8 augment id. +0x0A s16 duration. The Lua wrapper writes these with `memory.u64/u8/s16`, then runs `memory.execute("tif_aa_call")`. Nothing is returned. | L53-L57; wrapper 1RN9rO9B… (xref) | used-in-code |
| Range check | Augment ids above **0x7F** (127) are ignored. There are 128 bits. Section 58 has 131 rows, but rows 128 and up are not settable this way. | L10-L12 | used-in-code |
| Global | **[0x02EBF040] = battlepack section 58 (Augments)**, as loaded in memory (st2e). The entry is found at `u32 [base+0x0C]` (an absolute 32-bit pointer to the entry list in memory) plus id × `u16 [base+0x08]` (entry size, 8). TICB reads +0x04 (parameter) and +0x06 (timer slot) from the same pointer, which confirms the section. | L14-L21; TICB main L384-L416 (xref) | used-in-code |
| Timer slot | The stub reads **entry+0x06 as a u8**. Docs call it a u16, but only the low byte is used. If it is <= 7, it stores the duration (s16) at **keep+0x17C + slot*2** (8 augment timer slots). A value of 255 means no timer. | L23-L30 | used-in-code |
| Bit set | Byte keep+**0x68** + (id >> 3), bit (id & 7). This is the 128-bit temporary augment set at keep+0x68..0x77. If the bit is already set, the stub returns. The timer is still refreshed first. | L32-L45 | used-in-code |
| Duration source (xref) | Forge formulas 323 and 324 get the duration from 0x00387020 (augment default duration, batch 20). Vanilla TICB computes `section58.parameter * u32 [0x01DFE0B4] * 30` for this slot. | TICB main L413-L416 (xref) | used-in-code |
| No refresh | No stat-refresh function is called. Augments that change derived stats may need the game's refresh (0x0030F4B0, see the keep spec) to take effect. | n/a | unclear |

---

## 13. addStatusEffect.lua (Forge assembly stub `tif_ase`)

**Purpose.** Applies a status effect the way the game does. It writes the duration and tick timer, sets the bit, removes
the statuses that this one cancels, and runs the side effects for KO, Stone, Petrify, Sleep, Confuse, Berserk, Poison
and X-Zone (visual effect, action interrupt, death handling, kill credit).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Args block | `tif_ase_args`: +0x00 u64 **caster keep**, +0x08 u64 **target keep**, +0x10 u8 status id (0-31), +0x14 s32 duration, +0x18 s16 tick duration. The wrapper writes them, then calls `memory.execute("tif_ase_call")`. | L231-L237; wrapper 17_CE4U… (xref) | used-in-code |
| Keep to BUW | **0x0031B860**(RCX = keep) returns the target's Battle Unit Work in RAX, or 0. The result is kept in RSI for the rest of the stub. | L14-L16 | used-in-code |
| Range | Status ids above 0x1F are rejected. The mask is 1 << id. | L18-L23 | used-in-code |
| Lethal statuses | Mask **0x80000003** = KO, Stone, X-Zone. For these the stub calls **0x0030B7F0**(BUW, 0). If the high 16 bits of EAX are non-zero, it aborts. This is probably a "cannot die now" guard (invulnerable or scripted). | L25-L34 | used-in-code (call); unclear (meaning) |
| Esper special case | For a lethal status on a target whose keep type (+0x05) == 0 and keep identifier (+0x04) is **27-39 (0x1B + 0..0x0C = the 13 espers)**, the stub only calls **0x00300FC0**(BUW, 0) and returns. No bits are set, so an esper is sent straight into its KO/dismiss handling. | L36-L52 | used-in-code |
| Timers | keep+**0xBC** + id*4 = s32 duration, and keep+**0x13C** + id*2 = s16 tick timer. These are written before the bit test, so re-applying a status refreshes it. | L54-L62 | used-in-code |
| Bits | If keep+**0x64** (temporary statuses) already has the bit, return. Otherwise set it. If keep+**0x3C** (permanent statuses) has the bit, stop there. | L64-L73 | used-in-code |
| Global | **[0x02EBF118] = battlepack section 15 (Status Effects)** in memory. Entry = `u32 [base+0x0C]` + id × `u16 [base+0x08]` (40 bytes). The stub reads **entry+0x0C (u32) = statuses nullified by this one**. TICB also reads +0x06 bit 5 (refreshable), +0x07 bit 0 (not applicable to foes) and +0x20 (blocking statuses) from the same pointer, which matches the s15 spec. | L75-L83; TICB main L312-L337 (xref) | used-in-code |
| Nullify loop | For each set bit 0..31 of the nullify mask, the stub calls the Forge stub `tif_rse_call` (removeStatusEffect) with args +0x00 target keep and +0x08 status id. | L85-L103 | used-in-code |
| Notify | If the BUW exists, the stub calls **0x003284D0**(BUW, status id). The source writes the address with an extra leading zero, but it is the same value. This is probably the game's "status was added" hook (UI or AI reaction). | L105-L111 | used-in-code (call); unclear (meaning) |
| Effect calls | **0x003299B0**(BUW, code, 0) plays a reaction or visual effect. The codes are: Sleep **0x2001**, Stone **0x200C**, X-Zone **0x200E**. TICB uses **0x2008** on KO, with R8D = the target BUW's focus id (BUW+0x08) instead of 0. | L139-L144, L200-L210; TICB main L301-L305 (xref) | used-in-code |
| KO path | Statuses KO, Stone (after its effect) and X-Zone (after its effect) all call **0x00300FC0**(BUW, 0) (start death) and then **0x00312280**(caster keep, target BUW), which probably credits the kill to the caster (EXP, LP, chain). | L204-L219 | used-in-code (calls); unclear (meaning of 0x00312280) |
| Confuse / Berserk | For ids 5 and 27 the stub chooses a flag EDX. EDX = 0 if BUW battleFlags bit 24 is set. Otherwise, if the BUW current action **(+0x714, u16) >= 0x4000**, EDX = 1. Otherwise, if actionProcessingType **(+0x6B4, u8) >= 9**, EDX = 0. Otherwise, if current action == **0x0113 (Dismiss)**, EDX = 0. Otherwise EDX = 1. Then it calls **0x00300140**(BUW, EDX) and **0x00307D10**(BUW). This interrupts or resets the current action so the new behaviour takes over. | L146-L172 | used-in-code (offsets/calls); unclear (exact semantics) |
| Poison / Petrify | Poison clears bit 0 and Petrify clears bit 1 of BUW **+0xE9A** (deathFlags: bit 0 poison, bit 1 petrify). The bit is set again only when the caster keep exists and has type 0 (a party member). This records that the party caused the death, probably for kill credit (EXP/LP) when the unit later dies. | L174-L198 | used-in-code |
| BUW bit 24 | battleFlags (BUW+0x00) bit **24** is not named in the actor-chain spec yet. It selects the "no-cancel" variant of the action interrupt (EDX = 0). | L149-L151 | used-in-code (unnamed bit) |

---

## 14. applyKnockback.lua (Forge assembly stub `tif_akb`)

**Purpose.** Pushes the target back from the caster by a given distance.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Args block | `tif_akb_args`: +0x00 u64 caster, +0x08 u64 target, +0x10 f32 range. Formula 325 passes **Battle Unit Work** addresses (`formula.caster.battleUnitWork.address`, `formula.target.battleUnitWork.address`) and `formula.knockbackRange`. | L21-L25; 325.lua L5 (xref) | used-in-code |
| Function | **0x00323350**: RCX = caster BUW, RDX = target BUW, XMM2 = range (float, third argument slot), R9D = 0. R8 is not set by the stub, so the third integer argument is unused or ignored. | L10-L14 | used-in-code |
| Range source | The range normally comes from 0x003204D0 with selector 0x21 (getKnockbackRange, batch 20). | n/a | used-in-code (xref batch_20) |

---

## Summary for editor builders

**Code patch sites in this batch.** None of these is byte-checked by its loader. An editor should compare the bytes
before it writes.

| VA | RVA | Original bytes | Decoded | Used by |
|---|---|---|---|---|
| 0x0017D36B | 0x05D36B | 38 88 34 0C 00 00 | cmp byte [rax+0xC34], cl | OneHitKill |
| 0x002337D6 | 0x1137D6 | 3B F1 | cmp esi, ecx | QuickRespawn |
| 0x002F895E | 0x1D895E | 38 41 37 | cmp byte [rcx+0x37], al | UnlimitedQuickeningChains |
| 0x003014F6 | 0x1E14F6 | E8 C5 79 00 00 | call 0x00308EC0 | PeacefulMode |
| 0x00301690 | 0x1E1690 | 45 0F B7 04 24 | movzx r8d, word [r12] | PeacefulMode |
| 0x003075AD | 0x1E75AD | C7 44 24 74 61 79 FE FF | mov dword [rsp+0x74], -99999 | OneHitKill |
| 0x00309DC5 | 0x1E9DC5 | 3B C2 | cmp eax, edx | UnlimitedQuickeningChains |
| 0x0030DBC3 | 0x1EDBC3 | 85 C0 | test eax, eax | UnlimitedQuickeningChains |
| 0x0031146F | 0x1F146F | 0F B3 E8 | btr eax, ebp | UnlimitedStealableFoeItems |
| 0x00314A89 | 0x1F4A89 | 0F B6 80 62 10 00 00 | movzx eax, byte [rax+0x1062] | NoMinimapInterference |
| 0x00336D95 | 0x216D95 | F3 0F 11 83 D8 00 00 00 | movss [rbx+0xD8], xmm0 | PartyMovementSpeedMultiplier |
| 0x00385C17 | 0x265C17 | 80 60 14 FB | and byte [rax+0x14], 0xFB | UnlimitedStealableFoeItems |
| 0x00385C41 | 0x265C41 | 80 60 14 FD | and byte [rax+0x14], 0xFD | UnlimitedStealableFoeItems |
| 0x00385C6B | 0x265C6B | 80 60 14 FE | and byte [rax+0x14], 0xFE | UnlimitedStealableFoeItems |
| 0x0047432C | 0x35432C | F3 44 0F 10 8B 98 00 00 00 | movss xmm9, [rbx+0x98] | PartyMovementSpeedMultiplier |

**Game functions called** (Win64 ABI: RCX, RDX, R8, R9, and XMM0-3 for floats):

| VA | Inputs | Meaning (evidence) |
|---|---|---|
| 0x0031B860 | RCX keep | returns the BUW, or 0 (used) |
| 0x0030B7F0 | RCX BUW, EDX 0 | lethal-status guard; a non-zero high word blocks it (unclear) |
| 0x00300FC0 | RCX BUW, EDX 0 | KO / death start; also esper dismissal (unclear) |
| 0x00312280 | RCX caster keep, RDX target BUW | post-KO credit (unclear) |
| 0x003284D0 | RCX BUW, EDX status id | status-added notify (unclear) |
| 0x003299B0 | RCX BUW, EDX 0x20xx code, R8D 0 (TICB passes the focus id) | reaction/visual: 0x2001 sleep, 0x2008 KO (TICB), 0x200C stone, 0x200E X-Zone (used) |
| 0x00300140 | RCX BUW, EDX flag 0/1 | cancel current action (unclear) |
| 0x00307D10 | RCX BUW | follow-up after the interrupt; stance/AI reset (unclear) |
| 0x00323350 | RCX caster BUW, RDX target BUW, XMM2 range, R9D 0 | knockback (used) |
| 0x002EACD0 | ECX focus id, EDX 1, R8 &focus, R9D particle id | play particle effect (used, TICB xref) |
| 0x00308EC0 | RCX ptr to u16 id | filtered by PeacefulMode (unclear) |

**Globals.** **[0x02EBF040] = section 58 Augments** and **[0x02EBF118] = section 15 Status Effects**. These are two
new entries for the 02EBFxxx section-pointer cache (the Toolkit's list only named 038, 0D8, 130, 138, 190 and 1A0). In
memory, st2e header +0x0C is a 32-bit absolute pointer to the entries, and +0x08 is the u16 entry size.

**Structure offsets confirmed here.**
* Keep: +0x04 identifier, +0x05 type, +0x37 maxMistBars (u8, compared at 0x002F895E if RCX is a keep), +0x3C permanent statuses, +0x64
  temporary statuses, +0x68 128-bit temporary augments, +0xBC s32[32] durations, +0x13C s16[32] tick timers,
  +0x17C s16[8] augment timers.
* BUW: +0x00 battleFlags (bit 24 is new), +0x08 focus id, +0x698 keep pointer, +0x6B4 action processing type,
  +0x714 current action, +0xE9A death flags.

**Id spaces.**
* Action rows: 0-542. 497-542 are free.
* Content ids: items 0x0000+, equipment 0x1001-0x11A3, magicks 0x3000+, technicks 0x4000+.
* Conversions: action = magick - 0x3000 = item + 82 = technick - 0x4000 + 158.
* Espers: party ids 27-39 and actions 262-274.
* Particle effects: 0-151.
