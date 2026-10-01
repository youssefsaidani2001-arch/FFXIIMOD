# Drive batch 20: The Insurgent's Forge (TIF), `assemblies/` folder (14 call stubs)

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR.
Addresses are the absolute VAs that the stubs call. RVA = VA - 0x120000.
Drive path of every file: `My Laptop/scripts/TheInsurgentsForge/assemblies/`.

| # | Drive id | Title | Lines / bytes | md5 (first 8) | Status |
|---|---|---|---|---|---|
| 1 | 1sHu_bXxxbKYky2a5gknaSrRAXFMQYnze | getAugmentDuration.lua | 29 / 362 | 216f64aa | read in full |
| 2 | 1SBpW8K316950YEeTVVYs7JE3ZYkSUfhi | getBattleUnitKeepByFocus.lua | 29 / 367 | 22c6f779 | read in full |
| 3 | 1tNgsB5hTO8D2PhBxVxcHP4XH_k2w4zjQ | getBattleUnitWork.lua | 29 / 357 | f2c94ab6 | read in full |
| 4 | 1DQUj95BSK4kTVz7pbT2aa_wI-C58zH8O | getCharacterType.lua | 29 / 357 | 66dd936a | read in full |
| 5 | 1SuuGB7GTuabnhEi-gw2DG6shgApizf_r | getKnockbackRange.lua | 30 / 371 | 619bb0ee | read in full |
| 6 | 1FRGQyOS_CcFwV1mnCQhonNabIW5jws9e | getLocationMistStrength.lua | 27 / 323 | 3c7a5abd | read in full |
| 7 | 1l7jpxbOyMbdtR8MVnJv9Q1h1yzhuUMLl | getModelEvadeTypes.lua | 29 / 357 | 1c50a33f | read in full |
| 8 | 1p4Fi1hH7PfM5nGi7aMhOBDJ5D6wJ86pK | getOneHitKillState.lua | 27 / 328 | 84e5d34a | read in full |
| 9 | 1IAw8hAx8MKvDeg0tc9byp77S34jFfAy1 | getRandomNumber.lua | 27 / 318 | 9430473d | read in full |
| 10 | 10bJJ2XKzqEVVsZpjtNokHYKtmwE6RNqQ | getReflectTarget.lua | 166 / 2474 | 6cd216d0 | read in full |
| 11 | 13lr7kfthoXJ77bDJ9MNyxjWBJgEeRb5b | getStatusEffectDuration.lua | 31 / 402 | b122a5a0 | read in full |
| 12 | 1-jAE1gNV6ind7cP7EzlRLYCq5Rg7Jc6z | getStatusEffectTickDuration.lua | 29 / 373 | 7428d2eb | read in full |
| 13 | 1G6T_MvdSLA7Bdt9_5XSfiQa-A1Uqlcgj | getTerrainType.lua | 36 / 428 | 791d95e7 | read in full |
| 14 | 1r301xnWyD7nnUN_trwnAic7Q0X-5gQEd | isInteractable.lua | 33 / 399 | 7eaa3027 | read in full |

No file is missing. All files use CRLF line endings. Every file starts with "Made by Xeavin", so the
personal-use-only licence applies. I record facts only, in my own words. I do not copy code.

Evidence key:
* **byte-check-in-code**: the code compares the original bytes before it patches. **No file in this batch does
  this.** None of these files patches game code. Each one is a small piece of executable code that the Forge
  assembles into newly allocated memory. That code calls one game function, or several in the case of
  getReflectTarget.
* **used-in-code**: the stub calls the address, or reads or writes it, in the file itself.
* **comment-only**: only a comment or a name says so.
* **xref**: meaning taken from the matching Lua wrapper in `TheInsurgentsForge/helpers/`, which has the same file
  name but a different Drive id, or from a formula that calls the helper. I list these sources by id so that you
  can recheck them. In the JSON output these rows are marked `used-in-code` when the caller really passes or
  reads the value. They are marked `unclear` when the meaning is my own inference.

---

## 0. Shared mechanism (applies to all 14 files)

| Topic | Detail | Source | Evidence |
|---|---|---|---|
| File shape | Each file is a Lua chunk that returns two values. The first is a long-bracket string of x64 assembly in Intel syntax. The second is a list of exported symbol names, always `<prefix>_call` and `<prefix>_args`. | every file, last 5-7 lines | used-in-code |
| Loader | TIF reads the list of assembly names from `assemblies.lua` (Drive 1xofEVVrXeHwVT7tH5cg22H5EI92KpaK2, 30 names). It loads each `assemblies/<name>.lua`, checks the source with `memory.parse`, then calls `memory.assemble(source, symbols)`. That call returns an executable block, or 0 on failure, and registers the symbols. To reload, the Forge first calls `memory.deallocExe(block)` and `memory.unregisterSymbol(name)`. TIF also hot-reloads a stub when its file modification date changes. | TheInsurgentsForge.lua (12-RwiH0HI81GLcNCvbD5ery86Te1cv-a) L968-1120 | xref (used-in-code) |
| Calling convention | The Lua side gets the args block with `memory.getSymbol("<prefix>_args")`. It writes the inputs at +0x04, +0x08 or +0x10, runs `memory.execute("<prefix>_call")`, then reads the result at args+0x00. The stub loads the args address into RBX, which is callee-saved, so it can store the return value after the call. | helpers/*.lua wrappers | xref |
| Stack discipline | Simple stubs save RBX and reserve 0x20 bytes of Win64 shadow space, so RSP is 16-byte aligned at the inner call. getReflectTarget saves seven GPRs, reserves 0x70 bytes and keeps XMM6-XMM8 at rsp+0x40/0x50/0x60. These are the non-volatile XMM registers. | each file L5-6; getReflectTarget L5-15 | used-in-code |
| Args block | Each block starts on a 16-byte boundary (`.align 0x10`). Slot sizes come from `.db`, `.dd` and `.dq`. | each file | used-in-code |
| Object kinds passed | In Forge formulas, `caster` and `target` are **Battle Unit Keep** objects. The Forge builds them from the qwords at fpaMem+0x00 and +0x08 in L1328-1329. Any parameter that the wrappers call `characterAddress` is therefore a Battle Unit Keep pointer. getKnockbackRange, getTerrainType and isInteractable are called with **Battle Unit Work** addresses (`formula.*.battleUnitWork.address`). | TheInsurgentsForge.lua L1328-1329; formulas 307, 94, 320 | xref (used-in-code) |

## 1. getAugmentDuration.lua

Purpose: returns the default duration of a timed augment, for an augment id from battlepack section 58.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Game function | **0x00387020** = get augment default duration. EDX = augment id, zero-extended from a byte. **RCX is not set**, so the function must ignore its first argument or not use it here. The result is in EAX (u32). | L10-12 | used-in-code |
| Args layout | +0x00 u32 result. +0x04 u8 augment id. The block is 2 dwords. | L20-22 | used-in-code |
| Caller | Formulas 323 and 324 call it with an augment bit id from `helpers.augmentBits`. They do so only when the per-formula override is -1, and only for augments whose `bpack.section58[id].timerSlot < 8`. The duration is then passed to `addAugment`. The keep has 8 timer slots as s16 at keep+0x17C..0x18A (see live-battle-unit-keep.md). | 323.lua L98-111 (1FENtrXNql1aXckDK0iPMAFQU22ZKznvM) | xref |

## 2. getBattleUnitKeepByFocus.lua

Purpose: turns a "focus identifier" into the Battle Unit Keep pointer of that unit. A focus identifier is the id the targeting system uses for units.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Game function | **0x00320A70**. ECX = focus id (u32), result in RAX = Battle Unit Keep pointer (u64, 0 if none). It is a sibling of 0x00320A40, which the toolkit calls "keep for party member id". | L10-12 | used-in-code |
| Args layout | +0x00 u64 result. +0x08 u32 focus id. | L20-22 | used-in-code |
| Caller | Formula 221 passes `battleUnitWork.currentTargetFocusIdentifier` (BUW +0x710, u32) and stores the result in FormulaProcWork +0x10 (`initialTargetPointer`). When the unit has reserve targets (BUW +0x6B6 is not 0), the formula uses `getBattleUnitKeep(reserveTargets[0])` instead (BUW +0x6B9, a u8 array of 5). | 221.lua L13-17 (1vylSNC54HyystDHejDfhSHTPKVonGdfI); getFormulaProcWork.lua L7-10 | xref |

## 3. getBattleUnitWork.lua

Purpose: Battle Unit Keep pointer to Battle Unit Work (BUW) pointer.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Game function | **0x0031B860**. RCX = Battle Unit Keep pointer, result in RAX = BUW pointer (0 if the unit has no BUW). live-battle-actor-chain.md says "by actor". The Forge callers pass a keep (formula 221 L3: `helpers.getBattleUnitWork(caster.address)`), so **the argument is a Battle Unit Keep**. | L10-12 | used-in-code |
| Args layout | +0x00 u64 result. +0x08 u64 keep pointer. | L20-22 | used-in-code |
| Related | The Forge class file with the same name (1Q8DJGxsTHGSf44y5A2U_whqim2JJXorH) maps BUW fields. For example, +0x10 = Battle Actor Work pointer, +0x698 = keep pointer, +0x6A0 = keep-plus pointer, +0xEA9 = identifier. It was covered by earlier format docs. | class file L34-101 | xref |

## 4. getCharacterType.lua

Purpose: returns the character-type bitmask of a unit.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Game function | **0x002F8E90**. RCX = Battle Unit Keep pointer, result in EAX = u32 type mask. | L10-12 | used-in-code |
| Args layout | +0x00 u32 result. +0x08 u64 keep pointer. | L20-22 | used-in-code |
| Sibling function | **0x002F8E70** takes a **BUW** pointer in RCX and returns the same kind of type value. getReflectTarget uses it in its loop. | getReflectTarget L95-96 | used-in-code |
| Bit usage (callers) | The callers test `type & 1`, `type & 5`, `type & 7` and `type == 8`. Formula 4 (revive) skips a target when bit 0 is clear. Formulas 34 and 97 make some augments (evasion boost, adrenaline, focus, last stand) stronger when `type & 7` is not 0. getReflectTarget treats the value 8 as the opposite side from everything else. My inference: bits 0-2 are kinds of party or allied unit, and 8 is foe. | 4.lua L3; 34.lua L10-16; 97.lua L4-28; getReflectTarget L98-107 | unclear (inference) |

## 5. getKnockbackRange.lua

Purpose: reads a unit's knockback distance as a float.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Game function | **0x003204D0** with 3 arguments: RCX = BUW pointer, EDX = **0x21** (a constant parameter selector, 33), R8 = pointer to the output slot (args+0x00). The function writes the value through R8. The stub does not use the value in RAX. | L10-13 | used-in-code |
| Args layout | +0x00 output slot, declared as a qword but read back as a **float**. +0x08 u64 BUW pointer. | L21-23 | used-in-code |
| Scale | The wrapper divides the float by 100. Formula 307 halves the result for outcome types 1/3/7/11, and multiplies it by 1.5 when removed HP is above 60% of min(maxHp, 7000). | helpers/getKnockbackRange.lua L6 (1Xlkypf6WSi28HsRRMmskNN_sXAHaOow9); 307.lua L7-21 | xref |
| Note | The wrapper names its argument `characterAddress`, but the only caller passes `formula.target.battleUnitWork.address`. The stub dereferences a BUW. | 307.lua L7 | xref |

## 6. getLocationMistStrength.lua

Purpose: returns the Mist strength of the current location.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Game function | **0x00377BA0**, no arguments. The result in EAX is a u32 mist level. | L10-11 | used-in-code |
| Args layout | +0x00 u32 result. | L19-20 | used-in-code |
| Values | Formula 326 triples MP and Mist-charge regeneration when the value is **2 or 3**, so those values mean strong Mist. | 326.lua L26, L46-48, L60-62 (11YDiDtmSiKA_4feRwS1yyp_gX36s-xp0) | xref |

## 7. getModelEvadeTypes.lua

Purpose: tells which evade kinds a unit's model can perform: weapon block, shield block or parry.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Game function | **0x00384E50**. RCX = Battle Unit Keep pointer, result in EAX = u32 mask. | L10-12 | used-in-code |
| Args layout | +0x00 u32 result. +0x08 u64 keep pointer. | L20-22 | used-in-code |
| Bit meaning | Bit 0 = weapon evade possible, bit 1 = shield evade possible, bit 2 = parry possible. Formula 34 sets the matching evade value to 0 when a bit is clear. | 34.lua L47-57 (17eliJHwpPijqycYFDiIKrI7vzvs1J6pt) | xref |

## 8. getOneHitKillState.lua

Purpose: reads a global "one-hit kill" flag.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Game function | **0x0017D360**, no arguments. EAX is stored as a whole dword. | L10-11 | used-in-code |
| Args layout | +0x00 declared as one byte (`.db`), but the stub writes 4 bytes into it. The wrapper reads a u8. The block is the last data in the allocation, so the 3 extra bytes land in alignment or slack space. | L19-20 | used-in-code |
| Meaning | When the flag is 1, formula 308 sets the target's matched HP to 0 for every hit by a non-foe caster on a foe target. The flag must therefore be the game's one-hit-KO option or debug setting. | 308.lua L3-11 (1hGlnC8gnHpFtnx-EA2UTgwoiqAp58Wwv) | xref |

## 9. getRandomNumber.lua

Purpose: draws one value from the game's own RNG.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Game function | **0x00379CD0**, no arguments, result in EAX = u32 random value. | L10-11 | used-in-code |
| Args layout | +0x00 u32 result. | L19-20 | used-in-code |
| Range | The wrapper returns `value % maxNum`. Formulas use it for accuracy rolls (`accuracyRate <= rand(100)`) and random damage spreads. | helpers/getRandomNumber.lua L5; 44.lua L3; 132.lua L10-12 | xref |

## 10. getReflectTarget.lua

Purpose: re-implements the choice of where Reflect bounces a spell. The spell goes to the closest eligible unit on
the opposite side that is within the action's range, measured edge to edge. It is the only stub here with real logic.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Args layout | +0x00 u64 result = **BUW pointer** of the chosen bounce target (0 if none). +0x08 u64 Battle Unit Keep of the reflecting unit. +0x10 u16 action id. | L156-159 | used-in-code |
| Step 1 | Calls **0x0031B860**(keep) to get the reflector's BUW (kept in RSI). It returns 0 if there is none. It then reads **BUW+0x10** = Battle Actor Work pointer (kept in RDI) and returns 0 if that is null. | L20-30 | used-in-code |
| Get position | **0x00265020**(actor, float* x, float* y, float* z) writes 3 floats through three separate output pointers. The stub passes rsp+0x20/0x24/0x28, so the floats are contiguous and form a vec3. | L32-36, L110-114 | used-in-code |
| Reflector radius | **0x00334790**(actor) returns a float in XMM0. The stub keeps it and subtracts it from the centre distance. My inference: it is the collision or body radius of the actor. | L38-40, L121 | used-in-code (meaning unclear) |
| Reflector type | **0x002F8E90**(keep) gives the character type (R14D). | L42-44 | used-in-code |
| Action table access | Reads qword **[0x02EBF138]** = cached pointer to battlepack **section 14 (Actions)**. Then u16 at +0x08 = entry size (stride). Then the u32 at **+0x0C, used as an absolute 32-bit pointer** to the first record. In memory, the st2e `entryListOffset` has been converted to an address below 4 GB. Record = ptr + actionId*stride. | L46-51 | used-in-code |
| Action range | Reads the **u8 at action+0x05** (section 14 `range`, which agrees with bpack_schema.json). The stub converts it to a float and **divides it by the float constant at 0x008F8180**. That gives the maximum bounce distance in world units. I could not read the value of the constant (no exe here). | L53-56 | used-in-code |
| Unit count | Loop bound = dword **[0x0208E6A0]** = Battle Unit Work count. The stub returns at once if it is 0 or less. Indices run from 0 to count-1. | L58-60, L62, L133-136 | used-in-code |
| Self skip | Skips the index equal to the **u8 at BUW+0xEA9** of the reflector. This shows that **BUW+0xEA9 is the unit's own index in the unit-work list**, the same index that 0x00321170 takes. live-battle-actor-chain.md lists this as an open question about an "attacker id list". | L65-67 | used-in-code |
| Unit by index | **0x00321170**(ECX = index) returns a BUW pointer (R12), or 0, in which case the unit is skipped. | L69-75 | used-in-code |
| Status filter | Reads keep = **[BUW+0x698]**, skipped if null. It ORs the dword at **keep+0x64** (temporary status effects) with the dword at **keep+0x3C** (permanent status effects) and skips the unit if any bit of **0x80000003** is set. Those bits are bit 0 KO, bit 1 Stone and bit 31 X-Zone. | L77-84 | used-in-code |
| Foe filter | When the **u8 at keep+0x05 (unit type) == 1** (foe), the stub reads keep-plus = **[BUW+0x6A0]** and skips the unit if **(byte at keep-plus+0x00) & 0x78** is not 0. Bits 3-6 of the keep-plus battle flags are not named anywhere. They seem to mark foes that cannot be targeted or are hidden. That reading is my inference. | L86-92 | used-in-code (meaning unclear) |
| Side rule | Gets the candidate's type with **0x002F8E70**(BUW). If the reflector's type is 8, only candidates whose type is not 8 are kept. Otherwise only candidates of type 8 are kept. | L94-107 | used-in-code |
| Distance | Gets the candidate's position from [BUW+0x10] with 0x00265020. **0x003A1920**(vec3* a, vec3* b) returns the distance as a float in XMM0. The stub subtracts the reflector radius and **0x00334A70**(candidate BUW), which is the candidate's radius as a float. | L109-125 | used-in-code |
| Selection | The stub keeps the candidate when the edge distance is **strictly less** than the current best. The best starts at the action range, so the result is the nearest candidate inside range. | L127-131 | used-in-code |
| Consumer | Formula 231 stores the result in FormulaProcWork **+0x18** (`reflectTargetPointer`, typed as a BattleUnitWork class). It then sets skipState = 1 and outcomeType = 8. It calls the stub only when the action has `flags1.allowReflect`, the target has Reflect, the caster lacks the Piercing Magick augment, causeType is not 2, and the target is not KO, Stone or X-Zone. | 231.lua L3-12 (1hbtIA2ZNJ2MfSDgSTquHF8gv9c1uHpvO); getFormulaProcWork.lua L9-10, L94 | xref |
| Same code elsewhere | SmartReflect.lua (1TYvofui1htaBKq7-5k_7Zx29ct2Lf5-Y) contains the same routine with the same addresses. TenaciousTargeting.lua uses 0x00265020, 0x00334790 and 0x00334A70 the same way. | SmartReflect L143-278 | xref |

## 11. getStatusEffectDuration.lua

Purpose: returns the default duration that a status effect would have on a given unit.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Game function | **0x00387730**. RDX = Battle Unit Keep pointer, R8D = status id (u8, 0-31), result in EAX (u32). **RCX is not set.** ChainBenefits also leaves RCX as garbage, so the first argument is unused. | L10-13 | used-in-code |
| Args layout | +0x00 u32 result. +0x08 u64 keep pointer. +0x10 u8 status id. | L21-24 | used-in-code |
| Storage on keep | TheInsurgentsChainBenefits writes this value into **keep+0xBC + id*4** (s32 per status, 32 entries). This matches live-battle-unit-keep `durationKo` at 0xBC. | ChainBenefits.lua L356-358 (1bq8U3MnctqAk1UF2UHFAnQc_12brfCi8) | xref (used-in-code) |
| Caller | Formulas 323 and 324 call it for status ids 0-31 when the per-formula override is -1. They also call it for status 0 (KO) at the HP low limit. They pass the result to `addStatusEffect`. | 323.lua L16-28, L52-55 | xref |

## 12. getStatusEffectTickDuration.lua

Purpose: returns the default tick period of a status effect, for example the Poison or Regen tick.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Game function | **0x003876D0**. ECX = status id (u8), result in EAX (u32). It does not depend on the unit. | L10-12 | used-in-code |
| Args layout | +0x00 u32 result. +0x04 u8 status id. | L20-22 | used-in-code |
| Storage on keep | ChainBenefits writes the low 16 bits into **keep+0x13C + id*2** (s16 per status). This matches `tickDurationKo` at 0x13C. | ChainBenefits.lua L360-362 | xref (used-in-code) |

## 13. getTerrainType.lua

Purpose: returns the terrain type under a unit.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Game function | **0x003210E0**. RCX = **BUW** pointer, result in EAX. The stub preloads EAX with **-1** and skips the call when the pointer is null. | L10-16 | used-in-code |
| Args layout | +0x00 s32 result (-1 = no unit). +0x08 u64 BUW pointer. | L27-29 | used-in-code |
| Values | Formula 94 uses terrain 0 to boost Lightning and Water and to halve Earth. It uses 1 to boost Earth and 2 to boost Ice. My guess is 0 = water or wet, 1 = earth or sand, 2 = snow or ice. The same formula reads **s32 [0x02099DA8] = weather type**: 0 halves Fire and boosts Lightning, 1 boosts Earth, 2 boosts Ice, 3 boosts Water. It also reads **s32 [0x02099DAC] = wind strength**, where 2 = strong. | 94.lua L7-46 (1HfcX0FCdu8AmNtTNWKcFJIXppyapS6bB) | xref (names unclear) |

## 14. isInteractable.lua

Purpose: asks whether a caster unit can interact with (act on) a target unit.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Game function | **0x0030B9B0**. RCX = **target** BUW pointer, RDX = **caster** BUW pointer. The stub **XORs EAX with 1** before storing it, so the game function returns 0 when the pair can interact. The stub flips that into a true/false "interactable" value. | L10-15 | used-in-code |
| Args layout | +0x00 u32 result. +0x08 u64 target BUW. +0x10 u64 caster BUW. The wrapper takes the arguments as (caster, target) and swaps them into these slots. | L23-26; helpers/isInteractable.lua L4-5 (15TGgS3eqied3o15U4CEsDgI-dfwasdge) | used-in-code |
| Caller | Formula 320 sets skipState = 1 when the result is 0, and also when causeType == 3. | 320.lua L3-11 (1QTwBdkmAz-ecRSWAjv8YS5eWRfufj5UN) | xref |

---

## Summary of game functions (for a Lua or Cheat Engine editor)

| VA | RVA | Inputs | Output | Name used here |
|---|---|---|---|---|
| 0x0017D360 | 0x05D360 | none | EAX flag (u8 used) | one-hit-kill state |
| 0x00265020 | 0x145020 | RCX actor, RDX/R8/R9 = float* x/y/z | writes 3 floats | get actor position |
| 0x002F8E70 | 0x1D8E70 | RCX BUW | EAX type | character type (from BUW) |
| 0x002F8E90 | 0x1D8E90 | RCX keep | EAX type mask | character type (from keep) |
| 0x0030B9B0 | 0x1EB9B0 | RCX target BUW, RDX caster BUW | EAX, 0 = can interact | interaction test |
| 0x0031B860 | 0x1FB860 | RCX keep | RAX BUW | BUW from keep |
| 0x003204D0 | 0x2004D0 | RCX BUW, EDX selector (0x21), R8 out* | float at *R8 | knockback range (parameter 0x21) |
| 0x00320A70 | 0x200A70 | ECX focus id | RAX keep | keep from focus id |
| 0x003210E0 | 0x2010E0 | RCX BUW | EAX terrain | terrain type |
| 0x00321170 | 0x201170 | ECX index | RAX BUW | BUW by index |
| 0x00334790 | 0x214790 | RCX actor | XMM0 float | actor radius (inferred) |
| 0x00334A70 | 0x214A70 | RCX BUW | XMM0 float | unit radius (inferred) |
| 0x00377BA0 | 0x257BA0 | none | EAX | location Mist strength |
| 0x00379CD0 | 0x259CD0 | none | EAX u32 | RNG |
| 0x00384E50 | 0x264E50 | RCX keep | EAX mask | model evade types |
| 0x00387020 | 0x267020 | EDX augment id (RCX unused) | EAX | augment default duration |
| 0x003876D0 | 0x2676D0 | ECX status id | EAX | status tick duration |
| 0x00387730 | 0x267730 | RDX keep, R8D status id (RCX unused) | EAX | status default duration |
| 0x003A1920 | 0x281920 | RCX vec3*, RDX vec3* | XMM0 float | distance between points |

Globals and constants: [0x02EBF138] section 14 pointer, [0x0208E6A0] BUW count, float at 0x008F8180 (action-range
divisor, value unknown), s32 [0x02099DA8] weather type, s32 [0x02099DAC] wind strength.
