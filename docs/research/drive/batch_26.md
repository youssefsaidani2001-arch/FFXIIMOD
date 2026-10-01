# Drive batch 26: The Insurgent's Forge (TIF), `functions/` 13, 14, 128-130, 132-140 (item, status-gate and stat-down functions)

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR.
Offsets are relative to the start of the structure. Absolute addresses are VAs (RVA = VA - 0x120000).

| # | Drive id | Title | Drive path | Lines | md5 (first 8) | Status |
|---|---|---|---|---|---|---|
| 1 | 1ANojWxHNfTQqdXtQR2djqrRJGYh_wlCc | 13.lua | TheInsurgentsForge/functions | 9 | 0c47b35d | read in full |
| 2 | 17AIGRpOvwPWHwRz9g3JxdUwPkwAEIidL | 14.lua | same | 9 | 24cc94f0 | read in full |
| 3 | 1wtMWcLAQfyQkjmN2aW47suFs_DtJGIZi | 128.lua | same | 25 | f0e73174 | read in full |
| 4 | 1Yrypohg71hQT-g675Wi2ALlX04_2PUAA | 129.lua | same | 25 | b2df0432 | read in full |
| 5 | 1gmc4E_XSObTkMGDVNqeqEo33rb8Honxc | 130.lua | same | 34 | dca481f4 | read in full |
| 6 | 12W_HpUMQeDHezmLZgr1-mXSQlYKo_wq4 | 132.lua | same | 19 | 4a370ad4 | read in full |
| 7 | 1Z23YEkmBjTljj8TmaC2YUiYCBfCpbNCS | 133.lua | same | 8 | 3fd351b6 | read in full |
| 8 | 16RpAU1-_389VAfKB18jBJaeJWYphItiw | 134.lua | same | 10 | a7402c7b | read in full |
| 9 | 1hMkoKdk-x3oEYfCHwabJAzcUFvDzeXsG | 135.lua | same | 18 | 99ecc3c2 | read in full |
| 10 | 1c4GqisRmUBpSUjbMLuiKDOnCuv2nxmr9 | 136.lua | same | 11 | 9d03e59b | read in full |
| 11 | 1PRfA91jM4ih_hmVLSiPqyGlpnt1vcOiq | 137.lua | same | 11 | 67546486 | read in full |
| 12 | 10gts8ADA4LWWMHC_85WP0gwpKOQWV5I8 | 138.lua | same | 11 | 752d6534 | read in full |
| 13 | 1TktUpogbrfUcIPBIhQqQSaJyjXBZj_Zq | 139.lua | same | 11 | ee5f3f33 | read in full |
| 14 | 1mbls4VT3tPJYs1sT3KvNXsLfyFZX-aNF | 140.lua | same | 14 | 9b15da2c | read in full |

Drive path prefix: `My Laptop/scripts/`. No file is missing. Every file uses CRLF line endings and its first line
credits Xeavin, so the personal-use-only licence applies. The facts below are restated in my own words. No code is
copied.

Function 131 is not part of this batch. The Drive also holds two unrelated files with the titles `13.lua`
(11FnXxaNKv3BdaM_LOE3OEnZ0F4kRFXFz) and `14.lua` (1BU8oUdMsyzDX51ThsjI0devsOkuudWYf), each 28 lines. Both are
DynamicDescription layout templates (they return a `{dt:row ...}` markup string; see batch_07 / batch_08). They are not
Forge functions.

None of the mods named in the task brief (BlueMagick, DescriptiveInventory, HudColors, ScalableFoes, SummonProbe,
FFXIIEditorCaps, Wayfarer and so on) is in this batch. All 14 files are Forge **formula functions**. Each is one step
of a formula chain. Two are gates (13, 14). Six are item or technick executors (128, 129, 130, 132, 133, 134). One is
Souleater (135), four are permanent stat-down executors (136-139) and one is Bonecrusher (140). None of them patches
code or calls `memory.execute`. Only one reads an absolute game address: function 133 reads the game-clock minutes byte.

Evidence key:
* **byte-check-in-code**: the code compares the original bytes before it patches. **No file in this batch does
  this.**
* **used-in-code**: the file itself reads or writes the field or address. The offset comes from the Forge class file
  named in the row (xref).
* **comment-only**: only a name, a sheet or a comment says so.
* **unclear**: my own inference from the arithmetic.

Short names (same as batch_24 / batch_25):
* **FPW** = FormulaProcWork, the `formula` record (`getFormulaProcWork.lua`, 1_ju4HMh7Gja3PzOYLR4nsDPISYTTc6uS).
* **FPWP** = FormulaProcWorkPlus, `formula.caster` / `formula.target` (`getFormulaProcWorkPlus.lua`,
  1iE_ZuiEVQpE1IIIPd_kDWuNWLEcN39nC). FPW +0x00 and +0x08 are u64 pointers to the caster's and the target's FPWP.
* **FPK** = FormulaProcKeep, `formula.<side>.keep` (`getFormulaProcKeep.lua`, 1-XBVdIfWi2J7L6azNC5qBJMIgO5JOzYT).
  FPWP +0x00 is a u64 pointer to it.
* **BUK** = Battle Unit Keep, the plain `caster` / `target` arguments (`getBattleUnitKeep.lua`,
  192LKrY1yAs8dUOOfvfZnF1L9lIFWXzja; see `docs/formats/live-battle-unit-keep.md`).
* **s14** = battlepack section 14 action row (0x3C bytes), reached as `bpack.section14[FPW action]`.
* **s58** = battlepack section 58 augment row (8 bytes), reached as `bpack.section58[id]`; `parameter` = u16 at +0x04.
* **rand(n)** = `helpers.getRandomNumber(n)`. It calls the game RNG at VA 0x00379CD0 and returns `u32 % n`, so the
  result is 0..n-1 (batch_24 section header).

---

## 0. Context: wiring and resolved offsets (needed to read every section)

### 0.1 Which formulas call these functions (`formulas.lua`, 1QaofIprWG1mrlhZlxXoxCDSRRMcJmeqS)

All 14 functions are used only in **onHit** lists. "Vanilla name" is the FL Functions sheet label from
`docs/formats/enums-formulas.md`.

| Function | Formula id (name) | Full onHit chain | Vanilla name |
|---|---|---|---|
| 13 | 55 Sight Unseeing | {0, **13**, 47, 143} | UserNotBlindHalt |
| 14 | 58 Poach | {0, **14**, 47, 196} | TargetNotHPCriticalHalt |
| 128 | 32 Ethers | {23, 40, 74, 101, **128**} | EtherExec |
| 129 | 33 Elixirs | {**129**} (only function) | ElixirExec |
| 130 | 36 Phoenix Down | {15, 4, **130**, 180} | PhoenixHPRestore |
| 132 | 38 First Aid | {**132**} (only function) | FirstAid |
| 133 | 40 Horology | {47, **133**} | HorologyDamage |
| 134 | 43 Charge | {48, **134**} | ChargeMP |
| 135 | 45 Souleater | {65, **135**} | Souleater |
| 136 | 46 Wither | {11, 47, **136**} | StrenthDown (sic) |
| 137 | 47 Addle | {11, 47, **137**} | MagickDown |
| 138 | 51 Expose | {11, 47, **138**} | DefenseDown |
| 139 | 52 Shear | {11, 47, **139**} | ResistDown |
| 140 | 48 Bonecrusher | {0, 47, **140**} | Bonecrusher |

Helper functions in these chains (labels from enums-formulas.md): 0 SafetyHalt, 4 TargetRaiseHalt, 11 TargetPartyHalt,
15 ReverseUndeadPhoenix, 23 GetMedicineAcc, 40 MagickHitOrMiss, 47 LevelHitOrMiss, 48 ChargeHitOrMiss, 65 MartialPower,
74 GetItemPower, 101 ItemBoost, 180 RemoveStatus.
Source lines: formulas.lua L145-146, L149, L151, L153, L156, L158-159, L161, L164-165, L168, L171. Evidence: used-in-code.

### 0.2 Fields this batch touches (resolved offsets)

| Record | Field | Offset / type | Class source |
|---|---|---|---|
| FPW | action | +0x20 u16 (s14 action id) | getFormulaProcWork L11 |
| FPW | outcomeType | +0x24 u8 (6 = miss / no effect) | L14 |
| FPW | skipState | +0x26 u8 (1 = stop the chain) | L16 |
| FPW | power / multiplier / modifier | +0x34 / +0x38 / +0x3C float | L30-32 |
| FPWP | keep (ptr to FPK) | +0x00 u64 | getFormulaProcWorkPlus L3-4, L48 |
| FPWP | augments | +0x10, 16-byte bit set (128 augment bits, ids = s58 rows 0-127) | L7, L82 |
| FPWP | statusEffects | +0x20, 32-bit set | L8, L83 |
| FPWP | maxHp / maxMp | +0x24 s32 / +0x28 s16 | L9-10, L50-51 |
| FPWP | identifier | +0x2A u8 (unit slot; indexes FPK flag sets) | L11, L52 |
| FPWP | classification | +0x2B u8 (13 = Undead) | L12, L53 |
| FPWP | matchedHp / addedHp / removedHp | +0x2C / +0x30 / +0x34 s32 | L13-15, L54-56 |
| FPWP | matchedMp / addedMp / removedMp | +0x38 / +0x3A / +0x3C s16 | L16-18, L57-59 |
| FPWP | mistCharges | +0x3E s16 (signed change of Mist charges) | L19, L60 |
| FPWP | strength / magickPower | +0x142 / +0x144 s16 | L29-30, L61-62 |
| FPWP | defense / magickResist | +0x14C / +0x14E s16 | L34-35, L66-67 |
| FPK | reverseTargetFlags | +0x0C, 32 one-bit flags; bit n = byte +0x0C + n/8, mask 1 << (n mod 8) | getFormulaProcKeep L35, L48 |
| BUK | maxMp | +0x28 s16 | getBattleUnitKeep L27, L99 |
| BUK | strength / magickPower | +0x2A / +0x2B u8 | L28-29, L100-101 |
| BUK | defense / magickResist | +0x2F / +0x30 u8 | L33-34, L105-106 |
| BUK | maxMistBars | +0x37 u8 | L41, L113 |
| BUK | currentHp | +0x48 s32 | L42, L114 |
| BUK | currentMistBars | +0x4E u8 | L44, L116 |
| BUK | level | +0x1C2 u8 | L68, L130 |
| s14 | power | +0x10 u8 | battlepack-s14-actions.md |
| s14 | accuracyRate | +0x12 u8 | battlepack-s14-actions.md |
| s58 | parameter | +0x04 u16 (8-byte rows) | battlepack-s58-augments.md |

**Bit addressing.** The `flags` class (1KXzIWTk7AdYME4rOvG2V9EtzFJ0qu2rY L39-47, L60-68) finds bit n at byte n/8 with
mask 1 << (n mod 8), so the bit sets are LSB-first. It accepts a name or a plain number. With that rule, the bits used
here are:

| Set | Name (bit) | Byte / mask |
|---|---|---|
| FPWP augments | safety (1) | +0x10 / 0x02 |
| FPWP augments | itemBoost (14) | +0x11 / 0x40 |
| FPWP augments | medicineReverse (15) | +0x11 / 0x80 |
| FPWP augments | etherLore3 / 2 / 1 (122 / 123 / 124) | +0x1F / 0x04, 0x08, 0x10 |
| FPWP augments | phoenixLore3 / 2 / 1 (125 / 126 / 127) | +0x1F / 0x20, 0x40, 0x80 |
| FPWP statusEffects | blind (7) | +0x20 / 0x80 |
| FPWP statusEffects | reverse (12) | +0x21 / 0x10 |
| FPWP statusEffects | hpCritical (29) | +0x23 / 0x20 |

Bit numbers come from getAugments (1VSJgHfBJzwmQfl7WrOi1JVCAJKKV0gz-) L4, L17-18, L125-130 and getStatusEffects
(1mgsiagDzYjwKTSv9Hh0ZgikgTvX6F-_-) L10, L15, L32. Evidence: used-in-code.

Vanilla s58 parameters for the lore rows (from `docs/formats/enums-augments.md` rows 122-127): Ether Lore 3/2/1 =
30/20/10, so all three give +60%. Phoenix Lore rows 125/126/127 = 10 each, so all three give +30.

---

## 1. functions/13.lua: Forge function 13 (UserNotBlindHalt)

**Purpose.** This is the gate for Sight Unseeing (formula 55). The formula only proceeds if the **caster** is Blind.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Test | Reads the caster's FPWP statusEffects bit 7 `blind` (+0x20 mask 0x80). | L3 | used-in-code |
| Fail | If the caster is not blind, it sets FPW skipState (+0x26) = 1 and outcomeType (+0x24) = 6. Functions 47 and 143 then do not run. | L3-6 | used-in-code |
| Pass | If the caster is blind, it writes nothing and the chain goes on. | L3-7 | used-in-code |
| Message | The vanilla sheet says the miss shows Sight Unseeing's "must be blinded" message. The code only writes outcome 6 and picks no message. | enums-formulas.md (FL Functions 13) | comment-only |

## 2. functions/14.lua: Forge function 14 (TargetNotHPCriticalHalt)

**Purpose.** This is the gate for Poach (formula 58). The formula only proceeds if the **target** is in HP Critical.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Test | Reads the target's FPWP statusEffects bit 29 `hpCritical` (+0x23 mask 0x20). | L3 | used-in-code |
| Fail | If the target is not critical, it sets skipState = 1 and outcomeType = 6. | L3-6 | used-in-code |
| Order | Formula 58 runs 0 SafetyHalt before this gate, so Safety blocks Poach before the HP-critical test. | formulas.lua L171 | used-in-code |

## 3. functions/128.lua: Forge function 128 (EtherExec)

**Purpose.** This is the MP-restore step for Ethers (formula 32). It applies the Ether Lores and the Item Reverse
augment.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Lore bonus | bonus% = the sum of `bpack.section58[r].parameter` for each Ether Lore the **caster** has: row 122 if etherLore3 (bit 122), row 123 if etherLore2 (bit 123), row 124 if etherLore1 (bit 124). Vanilla values are 30/20/10. | L3-14 | used-in-code |
| Amount | amount = floor(FPW power x FPW multiplier x (bonus + 100) / 100). Power and multiplier are floats. Function 74 GetItemPower loads them from s14, and function 101 has already multiplied power by 1.5 for Item Boost. | L16 | used-in-code |
| Normal result | Writes the amount to target FPWP addedMp (+0x3A s16). | L21 | used-in-code |
| Item Reverse | If the **caster** has medicineReverse (augment bit 15, +0x11 mask 0x80), it sets bit [target identifier] in FPK(caster) reverseTargetFlags (+0x0C). It then writes the amount to target removedMp (+0x3C s16) instead, so the Ether drains MP. | L17-19 | used-in-code |
| Not checked | No Undead, Reverse-status or Safety test is done here. Only the caster's augment flips the effect. | L1-25 | used-in-code |
| Range limit | The output field is s16. If power x multiplier x 1.6 is above 32767 it will not fit. How the Lua Loader converts or clamps the float on write is not shown. | L16, L19, L21 | unclear |
| Data hook | The lore strengths are read live from section 58. Changing s58 rows 122-124 +0x04 (offline, or through `bpack` at run time) retunes Ether Lore with no code change. | L5, L9, L13 | used-in-code |

## 4. functions/129.lua: Forge function 129 (ElixirExec)

**Purpose.** This is the only function of Elixirs (formula 33). It restores full HP, MP and Mist bars, with special
cases for Safety, Undead, Reverse and Item Reverse. It handles hit, Safety and halting itself.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Case order | The cases are tested in this order: (1) target has Safety; (2) target classification is 13 (Undead); (3) target Reverse status XOR caster Item Reverse; (4) the normal case. | L3, L8, L12-13, L18 | used-in-code |
| (1) Safety | Target FPWP augments bit 1 `safety` (+0x10 mask 0x02). Sets matchedHp = target maxHp and matchedMp = target maxMp. Fills the Mist charges (see the Mist row). Sets skipState = 1. **Safety wins over Undead**, so an undead unit with Safety is fully healed. | L3-7 | used-in-code |
| (2) Undead | If target classification (+0x2B) is 13, it sets bit [target identifier] in FPK(caster) reverseTargetFlags. It sets matchedHp = 0 and matchedMp = 0, which kills the target and empties its MP. Mist is not changed. | L8-11 | used-in-code |
| (3) Reverse | Inverted when exactly one of these is true: the target has Reverse (status bit 12, +0x21 mask 0x10), or the caster has medicineReverse (augment bit 15). It then sets the reverse flag, mistCharges = -(target BUK currentMistBars x BUK maxMp), and matchedHp = 1 and matchedMp = 1. The target is left at 1 HP, 1 MP and no Mist bars. Reverse plus Item Reverse cancel out to a normal Elixir. | L12-17 | used-in-code |
| (4) Normal | matchedHp = FPWP maxHp (+0x24), matchedMp = FPWP maxMp (+0x28). The Mist charges are filled. | L18-21 | used-in-code |
| Mist refill | mistCharges (FPWP +0x3E s16) = (BUK maxMistBars +0x37 - BUK currentMistBars +0x4E) x BUK maxMp (+0x28). One Mist bar is therefore maxMp charges, which matches modifyMistCharges (batch_21). | L4, L19 | used-in-code |
| mistCharges meaning | Because case (3) writes a negative value, FPWP mistCharges is a **signed change**, not an absolute value. The value is counted in whole bars. If a bar is partly filled the result can go past the cap, so the engine probably clamps it. | L4, L15, L19 | unclear |
| matched* meaning | matchedHp / matchedMp are "set HP/MP to this value" fields (absolute), not changes. | L5-6, L10-11, L16-17, L20-21 | unclear (from use) |
| Vanilla difference | The vanilla FL Functions text says ElixirExec also handles Bubble, Disease and ZeroMP. This function has no such checks. They may be applied later, when the engine uses the matched values. | enums-formulas.md (FL Functions 129) | comment-only |

## 5. functions/130.lua: Forge function 130 (PhoenixHPRestore)

**Purpose.** This is the HP part of Phoenix Down (formula 36). It runs after 15 ReverseUndeadPhoenix and 4
TargetRaiseHalt and before 180 RemoveStatus (which removes KO).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Base percent | percent = s14 `power` (+0x10) of the current action. It is read straight from `bpack.section14[FPW action]`, not from FPW power. | L3, L5 | used-in-code |
| Lore bonus | Adds `bpack.section58[r].parameter` for each Phoenix Lore the **caster** has: row 125 for phoenixLore3 (bit 125), row 126 for phoenixLore2 (bit 126), row 127 for phoenixLore1 (bit 127). Vanilla values are 10 each. | L6-16 | used-in-code |
| Item Boost | If the caster has itemBoost (bit 14, +0x11 mask 0x40), the percent (power plus lores) is **doubled**. Formula 36 has no function 101, so this is where Item Boost applies to Phoenix Down. | L18-20 | used-in-code |
| Cap | The percent is capped at 100. | L22-24 | used-in-code |
| Amount | amount = floor(target FPWP maxHp x percent / 100), with a minimum of 1. It is written to target addedHp (+0x30 s32). | L26-31 | used-in-code |
| Not handled | Disease and Bubble (listed in the vanilla FL text) are not handled here. Undead and Item Reverse are handled by function 15 earlier in the chain. | L1-34; formulas.lua L149 | used-in-code |

## 6. functions/132.lua: Forge function 132 (FirstAid)

**Purpose.** This is the only function of First Aid (formula 38). It is a random heal that only works on a target in
HP Critical.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Gate | If the target lacks hpCritical (status bit 29), it sets skipState = 1 and outcomeType = 6 and returns. | L3-7 | used-in-code |
| Raw roll | amount = rand(target FPWP maxHp), which is 0 .. maxHp-1. | L10 | used-in-code |
| Accuracy reuse | The s14 `accuracyRate` (+0x12) of the action is used as the chance to keep the full roll. If accuracyRate <= rand(100), the amount is divided by 5 (integer division), giving 0-20% of max HP. So the chance of a full-range heal is accuracyRate % and the chance of the 0-20% range is (100 - accuracyRate) %. | L9, L12-14 | used-in-code |
| Output | Writes the amount to target addedHp (+0x30). There is no minimum of 1, so a heal of 0 can happen. There are no Undead, Reverse or Safety checks. | L16 | used-in-code |
| Editor note | For First Aid, the accuracy byte at s14 +0x12 is effectively a "big heal chance" setting. An action editor should label it that way when the formula is 38. | L12 | unclear (my reading) |

## 7. functions/133.lua: Forge function 133 (HorologyDamage)

**Purpose.** This is the damage step of Horology (formula 40). The damage depends on the in-game clock.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Game clock | Reads the u8 at VA **0x0216429A** (RVA 0x0204429A): the game-time minutes. This is save image base 0x02164280 + 0x1A (`docs/formats/save-game.md` row 0x1A). | L3 | used-in-code |
| Digit | digit = minutes mod 10, the last digit of the minutes. | L4 | used-in-code |
| Damage | Target removedHp (+0x34 s32) = digit squared x caster BUK level (+0x1C2 u8). The maximum is 81 x 99 = 8019. In Lua the power operator gives a float, which is stored into the s32 field. | L5 | used-in-code |
| Sheet conflict | The FL Formulae summary gives level x 0.5 x digit squared, but the FL Functions text and this code have no 0.5 factor. For the TIF build, the code is what counts. | enums-formulas.md rows 40 / 133 | comment-only (sheet) vs used-in-code |
| Hit | Function 47 LevelHitOrMiss runs first and decides whether the action hits. | formulas.lua L153 | used-in-code |

## 8. functions/134.lua: Forge function 134 (ChargeMP)

**Purpose.** This is the MP step of Charge (formula 43). It runs after 48 ChargeHitOrMiss.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Level source | Uses the **target** BUK level (+0x1C2 u8). Charge targets the user, so in practice this is the user's level. | L3-6 | used-in-code |
| Amount | If level >= 2: addedMp = level + floor(rand(level) / 2), which is level .. level + floor((level-1)/2), about 1.5 x level. If level < 2: addedMp = level. The guard keeps rand(0) from being called. | L3-7 | used-in-code |
| Output | Target addedMp (FPWP +0x3A s16). | L4, L6 | used-in-code |
| Sheet conflict | The FL Functions text says level .. 2 x level - 1, and the FL Formulae summary says level .. 1.5 x level. The code matches the 1.5 x version. | enums-formulas.md rows 43 / 134 | comment-only (sheet) vs used-in-code |

## 9. functions/135.lua: Forge function 135 (Souleater)

**Purpose.** This is the damage step of Souleater (formula 45), after 65 MartialPower loads power, multiplier and the
defence modifier.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Effective multiplier | m = FPW multiplier (+0x38) - modifier (+0x3C). If m < 0, target removedHp = 0 and the function returns. skipState is not set, and the caster pays **no** HP cost. | L3-7 | used-in-code |
| Undead | If target classification (+0x2B) is 13, target addedHp (+0x30) = FPW power x m x 2. The reverse flag is not set and Reverse status is not checked. | L9-10 | used-in-code |
| Normal | Otherwise target removedHp (+0x34) = power x m x 1.7. | L11-12 | used-in-code |
| Cost | Caster FPWP removedHp = floor(caster FPWP maxHp / 5), which is 20% of max HP. It is only paid when m >= 0. | L15 | used-in-code |
| Sheet conflict | The FL Formulae summary says "1.4 times"; the FL Functions text and the code use 1.7 (2 when healing Undead). | enums-formulas.md rows 45 / 135 | comment-only (sheet) vs used-in-code |
| Float write | The damage is a float stored into an s32 field. The conversion rule is not shown. | L10, L12 | unclear |

## 10-13. functions/136.lua - 139.lua: Forge functions 136-139 (permanent stat-down)

**Purpose.** These are the executors for Wither (46), Addle (47), Expose (51) and Shear (52). Each runs after 11
TargetPartyHalt (so party members are never affected) and 47 LevelHitOrMiss. All four have the same shape: if the
target's current stat is above 0, write a reduced value to the matching FPWP stat field; otherwise miss.

| Function | Formula | Reads (BUK, u8) | Writes (FPWP, s16) | Factor | Source line | Evidence |
|---|---|---|---|---|---|---|
| 136 StrengthDown | 46 Wither | strength +0x2A | strength +0x142 | x 0.7 (-30%) | 136.lua L3-4 | used-in-code |
| 137 MagickDown | 47 Addle | magickPower +0x2B | magickPower +0x144 | x 0.7 (-30%) | 137.lua L3-4 | used-in-code |
| 138 DefenseDown | 51 Expose | defense +0x2F | defense +0x14C | x 0.9 (-10%) | 138.lua L3-4 | used-in-code |
| 139 ResistDown | 52 Shear | magickResist +0x30 | magickResist +0x14E | x 0.9 (-10%) | 139.lua L3-4 | used-in-code |

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Zero stat | If the stat is already 0, the function sets skipState = 1 and outcomeType = 6, so the action shows as a miss. | 136-139 L5-8 | used-in-code |
| FPWP stat meaning | The value written is 0.7 or 0.9 times the current BUK stat, so the FPWP stat fields (+0x142..+0x157) hold the **new absolute** stat, not a change. By analogy with the HP/MP fields, -1 probably means "unchanged". The engine then writes the new value back to the unit, and the change lasts for the battle. | 136-139 L4 | unclear (from arithmetic) |
| Float to s16 | value x 0.7 is a Lua float stored into an s16 field. Rounding is up to the Lua Loader's writer. | 136-139 L4 | unclear |
| Safety | None of the chains includes 0 SafetyHalt. In TZA Safety does **not** protect against Wither or Addle. The augment sheet says it did in the original version. | formulas.lua L159-160, L164-165; enums-augments.md row 1 | used-in-code |

## 14. functions/140.lua: Forge function 140 (Bonecrusher)

**Purpose.** This is the effect of Bonecrusher (formula 48), after 0 SafetyHalt and 47 LevelHitOrMiss.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Roll | r = rand(100). If r >= 55 (45% chance), caster FPWP removedHp = caster BUK currentHp (+0x48), which KOs the caster. In this branch the target's matchedHp is **not** written, so the target survives. | L3-4 | used-in-code |
| Success | Otherwise, if the caster's currentHp > 0: caster removedHp = rand(currentHp), which is 0 .. currentHp-1, so the caster always keeps at least 1 HP. Target matchedHp (+0x2C) = 0 (instant KO). | L5-7 | used-in-code |
| Zero-HP caster | If the caster's currentHp is 0: caster removedHp = 0 and target matchedHp = 0. This avoids calling rand(0). | L8-11 | used-in-code |
| Safety | Function 0 SafetyHalt runs first in formula 48, so a target with Safety is never KO'd by this. | formulas.lua L161 | used-in-code |

---

## Summary for editor builders

* **Offline battlepack editor.** Several gameplay numbers here are read live from the battlepack, so an editor can
  change them as plain data:
  - s58 rows 122-124 +0x04 `parameter` set the Ether Lore %;
  - s58 rows 125-127 +0x04 set the Phoenix Lore %;
  - s14 +0x10 `power` is the base revive % for formula 36 (capped at 100% after doubling);
  - s14 +0x12 `accuracyRate` is the full-heal chance for formula 38 First Aid.

  The editor should show formula-specific labels for these bytes.
* **Formula-chain editor (TIF `formulas.lua`).** These chains show how the functions combine. The gates 13 and 14 can
  be reused on any formula: 13 needs the caster to be Blind, 14 needs the target to be HP Critical. Stat-down
  functions 136-139 can be added to any onHit chain. The Safety rules depend on whether function 0 is in the chain,
  and Wither, Addle, Expose and Shear leave it out.
* **Memory editor (Lua / Cheat Engine).** FPWP result fields come in two kinds:
  - "set to" fields: matchedHp +0x2C, matchedMp +0x38 and the stat fields +0x142..+0x14E;
  - "change" fields: addedHp +0x30, removedHp +0x34, addedMp +0x3A, removedMp +0x3C, mistCharges +0x3E (signed).

  The FPK reverseTargetFlags bit (+0x0C, bit = target identifier) is what marks an inverted heal or damage. The game
  clock minutes byte is at VA 0x0216429A.
* **No code patches** and no byte checks in this batch. Nothing here needs version-specific signatures except the
  absolute game-clock address and the RNG call (VA 0x00379CD0) inside `helpers.getRandomNumber`.
