# Drive batch 24: The Insurgent's Forge (TIF), `functions/10.lua`, `11.lua` and `101.lua`..`112.lua`

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR.
Offsets are relative to the start of the structure. Absolute addresses are VAs (RVA = VA - 0x120000).

| # | Drive id | Title | Drive path | Lines | md5 (first 8) | Status |
|---|---|---|---|---|---|---|
| 1 | 1n4_PZeNv-J5JtE1fBznoBiUWXDeNQsZK | 10.lua | TheInsurgentsForge/functions | 54 | b9f02052 | read in full |
| 2 | 13uHlFg3sj08OCQQ3PnHQ146Ruq177EGY | 101.lua | same | 8 | 4c66562b | read in full |
| 3 | 1-7OFU9qGjUg3txU5Xa1JicQVpdX0ORIG | 102.lua | same | 52 | d3095d68 | read in full |
| 4 | 116bV0tFJG377FVLJZyQVd3wdXiuh_91w | 103.lua | same | 24 | 6fb57907 | read in full |
| 5 | 1NeKV4ND9_zQXzpNDh1k650tXLRBo4HvL | 104.lua | same | 18 | 7201a3a5 | read in full |
| 6 | 1Qc7TBqd97LIpufD7ZZL47Q7c5HIZMKoB | 105.lua | same | 7 | 43c9dec6 | read in full |
| 7 | 1-JFB0NPy4u4KGgmcS_2TCS-9nawHy7Cu | 106.lua | same | 18 | 8236513d | read in full |
| 8 | 1hiLkHHNCtebFnYyi70lOzH8hT_EpQJak | 107.lua | same | 18 | 6223805d | read in full |
| 9 | 1LjkqAn4nZvP-aiGNEQmW160yxhRlQod_ | 108.lua | same | 18 | 8189a552 | read in full |
| 10 | 1_pEmcCBQJ1jxOpfN_zZajpLa-G2bEoyT | 109.lua | same | 18 | cd0c20f5 | read in full |
| 11 | 1ICyW5F5vh9Bi9q3kR6YYxw7SeE-ivKU- | 11.lua | same | 9 | 3ff56ea2 | read in full |
| 12 | 1PKaSlBzNgoSfRpf0g6Bi1suWDOnBU-po | 110.lua | same | 20 | 7ec04ac5 | read in full |
| 13 | 1NrZ3e9b5cEzfL0XUAeszvOivlDzoAtAS | 111.lua | same | 13 | bd0315cd | read in full |
| 14 | 1oXv-iGt38B-smYWP0y-RHM491_w8n6Mr | 112.lua | same | 11 | 94013379 | read in full |

Drive path prefix: `My Laptop/scripts/`. No file is missing. Every file uses CRLF line endings and starts with
"Made by Xeavin", so the personal-use-only licence applies. The facts below are restated in my own words. No code is
copied.

Two other Drive files share titles with this batch but are different files: `1TyYSZ26npCeoZ1W_6tw0QUzP4b_oGntF` (10.lua)
and `1CVru9odY_wHFRAFCj0PbsUGw12o05ZW3` (11.lua) are DynamicDescription layout templates (see batch_07 / batch_08). They
are not Forge functions.

None of the mods named in the task brief (BlueMagick, DescriptiveInventory, HudColors, ScalableFoes, SummonProbe,
FFXIIEditorCaps, Wayfarer and so on) is in this batch. All 14 files are small Forge **formula functions**. Each one
is a single step of a damage/heal/status formula. None of them patches game code, calls `memory.execute` directly
or reads a global pointer. They only read and write Forge work records and the live battlepack.

Evidence key:
* **byte-check-in-code**: the code compares the original bytes before it patches. **No file in this batch does
  this.**
* **used-in-code**: the function reads or writes the field. The offset comes from the Forge class file named in the
  row (xref), which defines it.
* **comment-only**: only a name or a comment says so.
* **unclear**: my own inference from the arithmetic.

Short names used below:
* **FPW** = FormulaProcWork, the formula record `formula` (class `getFormulaProcWork.lua`, 1_ju4HMh7Gja3PzOYLR4nsDPISYTTc6uS).
* **FPWP** = FormulaProcWorkPlus, `formula.caster` / `formula.target` (`getFormulaProcWorkPlus.lua`, 1iE_ZuiEVQpE1IIIPd_kDWuNWLEcN39nC). FPW +0x00 and +0x08 are u64 pointers to them.
* **FPK** = FormulaProcKeep, `formula.<side>.keep` (`getFormulaProcKeep.lua`, 1-XBVdIfWi2J7L6azNC5qBJMIgO5JOzYT). FPWP +0x00 is a u64 pointer to it.
* **BUK** = Battle Unit Keep, the bare `caster` / `target` arguments (`getBattleUnitKeep.lua`, 192LKrY1yAs8dUOOfvfZnF1L9lIFWXzja; see `docs/formats/live-battle-unit-keep.md`).
* **BUW** = Battle Unit Work, `formula.<side>.battleUnitWork` (FPWP +0x08 u64 pointer; `getBattleUnitWork.lua`, 1Q8DJGxsTHGSf44y5A2U_whqim2JJXorH).
* **s14** = battlepack section 14 action row (60 bytes), reached as `bpack.section14[formula.action]` (see `docs/formats/battlepack-s14-actions.md`).
* **rand(n)** = `helpers.getRandomNumber(n)`. It calls the stub `tif_grn_call`, which calls the game RNG at VA
  **0x00379CD0** (RVA 0x259CD0) and stores EAX into `tif_grn_args`. The Lua side returns `u32 % n`, so the result is
  0..n-1, and n = 0 raises a Lua modulo-by-zero error. Every function in this batch guards against n = 0 before it
  calls it (helpers/getRandomNumber.lua 11AhF-0YhQYIm2fxSfHCxy2Infby1YW68 L3-5; asm 1IAw8hAx8MKvDeg0tc9byp77S34jFfAy1 L4-20).

---

## 0. Context: how these functions are wired (needed to read every section)

Facts from `TheInsurgentsForge.lua` (12-RwiH0HI81GLcNCvbD5ery86Te1cv-a), `formulas.lua` (1QaofIprWG1mrlhZlxXoxCDSRRMcJmeqS)
and `middlewares.lua` (119DX8O_CLAm5LPOguhKeMxXM8uzUQ0YZ). They were read only to interpret this batch.

| Topic | Detail | Source | Evidence |
|---|---|---|---|
| Function slots | TIF loads `scripts/TheInsurgentsForge/functions/<i>.lua` for i = 0..339. Each file returns one Lua function. A missing file leaves the slot nil. | TIF L645-658 | used-in-code |
| User override | A file with the same number in `<config.path>/TheInsurgentsForgeConfig/functions/<i>.lua` replaces the stock function. TIF checks the file's modification date (lfs) and reloads it when the date changes. Deleting the override restores the stock file. | TIF L660-688 | used-in-code |
| Call signature | Each function receives (formula = FPW view, caster = BUK view, target = BUK view, functions, classes, helpers). It runs inside pcall, so an error is printed and the chain continues. | TIF L1278-1298 | used-in-code |
| Chain stop | TIF clears FPW skipState (+0x26) before a chain. After each function, if skipState = 1 the rest of the chain is skipped. | TIF L1282, L1292-1294 | used-in-code |
| Pipeline | onCast: middlewares onCastPre, then onCastFormulas[formula id] (only when the pre chain did not skip), then onCastPost and onCastEnd. onHit works the same with the onHit lists. | TIF L1301-1317 | used-in-code |
| Dispatch | The asm side fills symbol `tif_fpa`: +0x00 u64 caster BUK, +0x08 u64 target BUK, +0x12 u8 procType (0 idle, 1 onCast, 2 onHit, other onMistEnd). The FPW record lives at symbol `tif_fpw`. Lua writes procType back to 0 when it is done. | TIF L1319-1338 | used-in-code |
| Formula id | The key of onCastFormulas / onHitFormulas is the s14 `formula` byte (s14 +0x08), the same 0-108 enum as `docs/formats/enums-formulas.md`. | formulas.lua L2, L113; enums-formulas.md | used-in-code |

### 0.1 Which formulas call the functions of this batch (from formulas.lua)

| Function | List | Formula ids (position in chain) | Vanilla name (FL Functions) |
|---|---|---|---|
| 10 | onCast | 20, 21, 22, 23, 24, 28, 29 (weapon formulas), 64 Enemy Attack, 103 Enemy Combo, 104 Sage Weapon. Always slot 6 of {5, 6, 7, 8, 9, **10**, 22, 33, 34, 41} | ComboExec |
| 11 | onHit | 42 Achilles, 46 Wither, 47 Addle, 51 Expose, 52 Shear, 53 Charm, 69 Warsong, 70 Vespersong, 79 Add Augment, 80 Remove Augment, 87 Level Up (first, or second after 0) | TargetPartyHalt |
| 101 | onHit | 31 Potions, 32 Ethers, 37 HP % Reduction Items | ItemBoost |
| 102 | onHit | 65 Enemy Technick, 66 Cinematic Technick (slot 2, after 77) | EnemyTechnickStatusInteractions |
| 103 | onHit | 30 Self-Damaging Attack {65, **103**} | SelfDamagingAttack |
| 104 | onHit | 92 Quickening (only function) | Quickening |
| 105 | onHit | 93 Concurrences (only function) | Concurrence |
| 106 | onHit | 94 HP Damage Traps (only function) | HPDamageTrap |
| 107 | onHit | 95 MP Damage Traps (only function) | MPDamageTrap |
| 108 | onHit | 96 HP Restore Trap (only function) | HPRestoreTrap |
| 109 | onHit | 97 MP Restore Trap (only function) | MPRestoreTrap |
| 110 | onHit | 4 Restore HP {60, 90, 91, **110**} | HealExec |
| 111 | onHit | 5 Restore Full HP {3, **111**} | CurrentAndMaxHPCompare |
| 112 | onHit | 6 Revive {3, 4, 61, 90, 91, **112**, 180} | CalculateRemoveKOHealing |

Source lines: formulas.lua L22-31, L66, L105-106 (function 10); L155-200 (11); L143-150 (101, 103); L178-179 (102);
L205-210 (104-109); L117-119 (110-112). Evidence: used-in-code.

### 0.2 Fields this batch touches (resolved offsets)

| Record | Field | Offset / type | Class source |
|---|---|---|---|
| FPW | action | +0x20 u16 (s14 action id) | getFormulaProcWork L11, L53 |
| FPW | outcomeType | +0x24 u8 (6 = miss / no effect) | L14, L56 |
| FPW | skipState | +0x26 u8 | L16, L58 |
| FPW | comboState / counterState / knockbackState | +0x29 / +0x2A / +0x2B u8 | L19-21, L61-63 |
| FPW | comboChance | +0x2E u8 (percent) | L24, L66 |
| FPW | power / multiplier / modifier | +0x34 / +0x38 / +0x3C float | L30-32, L72-74 |
| FPWP | keep (ptr to FPK) | +0x00 u64 | getFormulaProcWorkPlus L3-4, L48 |
| FPWP | battleUnitWork (ptr to BUW) | +0x08 u64 | L5-6, L49 |
| FPWP | augments | +0x10 bit set (getAugments) | L7, L82 |
| FPWP | statusEffects | +0x20 bit set, 4 bytes (getStatusEffects) | L8, L83 |
| FPWP | maxHp | +0x24 s32 | L9, L50 |
| FPWP | identifier | +0x2A u8 (target slot, indexes the FPK flag sets) | L11, L52 |
| FPWP | classification | +0x2B u8 (13 = Undead) | L12, L53 |
| FPWP | matchedHp / addedHp / removedHp | +0x2C / +0x30 / +0x34 s32 | L13-15, L54-56 |
| FPWP | addedMp / removedMp | +0x3A / +0x3C s16 | L17-18, L58-59 |
| FPK | reverseTargetFlags | +0x0C, 32 one-bit flags indexed by identifier | getFormulaProcKeep L35, L49 |
| FPK | battleFlags.comboCount | +0x12, bits 4-7 (4-bit field, 0..15) | L14-28, L36, L50 |
| BUK | type | +0x05 u8 (0 = party, 1 = foe) | getBattleUnitKeep L4, L76 |
| BUK | strength | +0x2A u8 | L28, L100 |
| BUK | currentHp | +0x48 s32 | L42, L114 |
| BUK | statusEffectDurations | +0xBC, s32 list; petrify = index 2, so +0xC4 | L62, L143; getStatusEffectDurations L2-5, L37-38 |
| BUK | level | +0x1C2 u8 | L68, L130 |
| BUW | comboCount | +0x6B7 u8 (hits already done in the current combo) | getBattleUnitWork L66, L131 |
| BUW | ardClass (ptr) | +0xE68 u64, points to the ARD class record | L93-94, L156, L169 |
| ARD class | maxComboHits | +0x20 u8 | getArdClass (1rJjWUlDztaIGJA60guO-ULtzkf9Ojc9Q) L51, L69 |
| s14 | power | +0x10 u8 | battlepack-s14-actions.md (IW Actions.cs:43) |
| s14 | elements | +0x13 bit set: bit 0 fire, bit 3 earth | battlepack-s14-actions.md |

Status bit numbers used here (getStatusEffects, 1mgsiagDzYjwKTSv9Hh0ZgikgTvX6F-_- L4-30), with the byte and mask
inside the 4-byte FPWP +0x20 set: stone 1 (+0x20 0x02), petrify 2 (+0x20 0x04), sleep 4 (+0x20 0x10), oil 11
(+0x21 0x08), reverse 12 (+0x21 0x10), protect 18 (+0x22 0x04), bravery 21 (+0x22 0x20), float 26 (+0x23 0x04),
berserk 27 (+0x23 0x08). They match the s14 status mask layout (protect 0x04 and bravery 0x20 at the third byte).
Augment bit used: itemBoost = 14 (FPWP +0x11 mask 0x40). The same bit number is used for `itemBoost` in the s16
party augment set (getAugments 1VSJgHfBJzwmQfl7WrOi1JVCAJKKV0gz- L17; battlepack-s16-party-members.md L289).

---

## 1. functions/10.lua: Forge function 10 (ComboExec)

**Purpose.** Decides whether a weapon swing starts a combo, how many extra hits it gets, and whether the next hit
of a running combo continues. Runs on cast for all weapon-type formulas.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Reset | Clears FPW comboState (+0x29) to 0 on entry. | L3 | used-in-code |
| Combo in progress | Reads BUW(caster) comboCount (+0x6B7 u8). If it is above 0, the swing is part of a running combo. If it has reached the planned count stored in FPK(caster) battleFlags.comboCount (FPK +0x12 bits 4-7), it returns with comboState 0, which ends the combo. Otherwise it sets comboState = 1 and clears counterState (+0x2A) and knockbackState (+0x2B). A follow-up hit therefore never counters or knocks back. | L5-15 | used-in-code |
| Start roll | For a fresh swing, a combo starts only when rand(100) is less than FPW comboChance (+0x2E). The function returns when comboChance <= roll. comboChance is a percent, loaded by earlier functions of the chain. | L17-19 | used-in-code |
| HP-based per-hit chance | Chance per extra hit: 8 % normally, 16 % when BUK currentHp (+0x48) < maxHp/4, 32 % when < maxHp/8, 64 % when < maxHp/16. maxHp is FPWP(caster) +0x24, using integer division. | L21-28 | used-in-code |
| Hit count | It makes 12 independent rolls. Each one counts when rand(100) < chance. The count is the number of extra hits. | L30-35 | used-in-code |
| Cap | The cap is 11 extra hits. For a foe (BUK type +0x05 = 1), the cap is ARD class maxComboHits (via BUW +0xE68, ARD +0x20) minus 1. An ARD value of 0 gives cap -1, so the foe can never combo. Guests or other unit types (type 2 or higher) use the cap of 11. | L37-44 | used-in-code |
| Commit | If the count is above 0, it is stored in FPK battleFlags.comboCount (4-bit field, so 11 fits). comboState is set to 1 and counterState and knockbackState are cleared. | L46-51 | used-in-code |
| Meaning of ARD maxComboHits | Because the cap is (value - 1) extra hits, the ARD field counts the **total** hits including the first one. | L39 | unclear (inference) |
| Editor note | To give a foe combos in an offline ARD editor, set ARD class +0x20 to 2 or more. comboChance itself comes from the earlier chain functions and the weapon/foe data, not from this function. | L39 | unclear (inference) |

## 2. functions/11.lua: Forge function 11 (TargetPartyHalt)

**Purpose.** Makes foe-only effects (stat breaks, Achilles, Charm, songs, augment add/remove, Level Up) fail on party
members.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Guard | If the target BUK type (+0x05) is 0 (party side), it sets FPW skipState (+0x26) = 1 and outcomeType (+0x24) = 6 (miss / no effect). | L3-6 | used-in-code |
| Scope | Used first (or right after Safety function 0) in on-hit chains of formulas 42, 46, 47, 51, 52, 53, 69, 70, 79, 80 and 87. | formulas.lua L155-200 | used-in-code |

## 3. functions/101.lua: Forge function 101 (ItemBoost)

**Purpose.** Item potency boost from the item augment.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Rule | If FPWP(caster) augments bit 14 `itemBoost` (FPWP +0x11 mask 0x40) is set, FPW power (+0x34 float) is multiplied by 1.5. | L3-5 | used-in-code |
| Scope | Potions (31), Ethers (32) and HP % Reduction Items (37). The damaging items of formula 37 are boosted by the same augment, not just the healing items. | formulas.lua L143-150 | used-in-code |

## 4. functions/102.lua: Forge function 102 (EnemyTechnickStatusInteractions)

**Purpose.** Status-based damage modifiers for foe technicks (formulas 65 and 66). It is applied after the power
loader (function 77).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Caster petrifying | If the caster FPWP has Stone (bit 1) or Petrify (bit 2), it reads the caster BUK petrify duration (BUK +0xC4 s32). With t = max(duration - 1, 0), power becomes t x power / 10. Duration 0 (full Stone) gives 0 damage. Duration 11 keeps power unchanged. | L3-12 | used-in-code |
| Caster buffs | Bravery (bit 21) x1.5, then Berserk (bit 27) x1.5. They stack multiplicatively (x2.25 with both). | L14-20 | used-in-code |
| Target statuses | Sleep (bit 4) x1.5. Protect (bit 18) x0.75. A Stone/Petrify target uses the same duration scaling with the target BUK (+0xC4). | L22-39 | used-in-code |
| Oil + fire | Reads the s14 row of FPW action (+0x20). If the target has Oil (bit 11) and the action has element bit 0 (fire, s14 +0x13 mask 0x01), power x3. | L41-44 | used-in-code |
| Float + earth | If the target has Float (bit 26) and the action has element bit 3 (earth, mask 0x08), it sets skipState = 1 and outcomeType = 6: earth technicks always miss floating targets. | L46-49 | used-in-code |
| Live data access | Uses the Lua Loader global `bpack.section14[id]` with field names `power` and `elements.<name>`. Edits to s14 in memory are seen at once. | L41 | used-in-code |
| Petrify duration unit | The /10 scale suggests the petrify countdown runs about 10 steps before full Stone. Not verified. | L11 | unclear |

## 5. functions/103.lua: Forge function 103 (SelfDamagingAttack)

**Purpose.** Formula 30. The caster takes damage and the target takes a percentage of it.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Effective multiplier | m = FPW multiplier (+0x38) - modifier (+0x3C), both floats. If m < 0, target removedHp = 0 and skipState = 1 (no damage either way). | L3-8 | used-in-code |
| Caster damage | casterAmount = FPW power x m. It is written to FPWP(caster) removedHp (+0x34 s32). The caster takes the **full** amount. | L10-11 | used-in-code |
| Target damage | targetAmount = casterAmount x s14 power (+0x10) / 100. The action power byte is a percentage of the self-damage here, not a base power. | L13-14 | used-in-code |
| Reverse | If the target has Reverse (bit 12), it sets bit [target identifier] in FPK(caster) reverseTargetFlags (+0x0C) and writes targetAmount to target addedHp (+0x30, healing) instead of removedHp. Undead is not checked here. | L16-21 | used-in-code |
| Float write | The amounts are Lua floats and are stored into s32 fields. The conversion (truncate or round) is done by Lua Loader's memory writer and is not shown in these files. | L11-20 | unclear |

## 6. functions/104.lua: Forge function 104 (Quickening)

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Formula | a = rand(caster BUK strength) when strength (+0x2A u8) > 0, else 0. b = rand(s14 power) when power > 0, else 0. Target removedHp = (a + 1) x (b + 1). | L3-15 | used-in-code |
| Range | 1 .. strength x power, a product of two uniform values. There is no defence, level or element factor and no FPW power use. | L15 | used-in-code |

## 7. functions/105.lua: Forge function 105 (Concurrence)

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Formula | Target removedHp = target BUK level (+0x1C2 u8) x s14 power (+0x10). It has no randomness and no defence factor. | L3-4 | used-in-code |
| Note | The FL sheet says Concurrences scale with the number of Quickenings. This function only uses level x power, so the chain size must come from which Concurrence action (and power byte) is chosen. | L4; enums-formulas.md L147 | unclear |

## 8. functions/106.lua: Forge function 106 (HPDamageTrap)

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Formula | a = rand(target BUK level) when level > 0. b = rand(s14 power) when power > 0. Target removedHp (+0x34) = (a + 1) x (b + 1). Range 1 .. level x power. | L3-15 | used-in-code |
| Who scales it | The **target's** level (the unit that set off the trap) scales the damage, not the trap's level. | L3 | used-in-code |

## 9. functions/107.lua: Forge function 107 (MPDamageTrap)

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Formula | Same random product as function 106, written to target removedMp (FPWP +0x3C s16). The maximum is 99 x 255 = 25245, which fits in s16. | L3-15 | used-in-code |

## 10. functions/108.lua: Forge function 108 (HPRestoreTrap)

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Formula | Same random product as function 106, written to target addedHp (FPWP +0x30 s32). | L3-15 | used-in-code |

## 11. functions/109.lua: Forge function 109 (MPRestoreTrap)

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Formula | Same random product as function 106, written to target addedMp (FPWP +0x3A s16). | L3-15 | used-in-code |
| Family | 106-109 differ only in the output field (removedHp / removedMp / addedHp / addedMp). Each is the only function of its formula (94-97), so these trap formulas have no hit roll, no Safety check and no Reverse/Undead check. | 106-109 L15; formulas.lua L207-210 | used-in-code |

## 12. functions/110.lua: Forge function 110 (HealExec)

**Purpose.** Final step of Restore HP (formula 4, the Cure family).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Effective multiplier | m = FPW multiplier - modifier. If m < 0, target addedHp = 0 and skipState = 1. | L3-8 | used-in-code |
| Amount | amount = FPW power x m. In formula 4, power and multiplier come from functions 60 (GetRawMagickPower), 90 (FaithDiseasePower) and 91 (HealerHPSpellAugPower). | L10; formulas.lua L117; enums-formulas.md L256, L276-277 | used-in-code |
| Undead / Reverse rule | The target is healed (addedHp +0x30) when "is Undead" (classification +0x2B = 13) equals "has Reverse" (bit 12). So a normal unit heals, and an undead unit with Reverse also heals. Otherwise the target is damaged (removedHp +0x34) and bit [identifier] is set in FPK(caster) reverseTargetFlags. | L11-17 | used-in-code |

## 13. functions/111.lua: Forge function 111 (CurrentAndMaxHPCompare, full restore)

**Purpose.** Final step of Restore Full HP (formula 5), after function 3 (undead full-raise branch).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Amount | Defaults to target FPWP maxHp (+0x24). | L3 | used-in-code |
| Inversion | When "is Undead" differs from "has Reverse", it sets the reverse bit for the target in FPK(caster) +0x0C and the amount becomes 1. | L4-8 | used-in-code |
| Output | Writes the amount to target matchedHp (FPWP +0x2C s32). By its name and use, matchedHp is an absolute "set HP to" value, not a delta, so the inverted case leaves the target at 1 HP. | L10 | unclear (semantics from name) |

## 14. functions/112.lua: Forge function 112 (CalculateRemoveKOHealing)

**Purpose.** HP given by Revive (formula 6, Raise/Arise/Phoenix-type).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Formula | amount = floor(target FPWP maxHp x FPW power / 100), with a minimum of 1. It is written to target addedHp (+0x30). | L3-8 | used-in-code |
| Power source | It uses FPW power (+0x34). Earlier functions of the chain set it: 61 (GetHealingFractionalPower) loads the action power, 90 (FaithDiseasePower) raises it with Faith and sets it to 0 when the target has Disease, and 91 (HealerHPSpellAugPower) applies the healer augments. So the s14 power byte is "percent of max HP" for revive actions. Faith and the augments raise it, and on a Diseased target the result falls to the 1 HP floor. | L3-6; formulas.lua L119; enums-formulas.md L257, L276-277 | used-in-code (chain) / unclear (what 61/90/91 do comes from the FL sheet) |

---

## Summary for editor builders

* **Offline battlepack editor (s14).** Formulas 30, 92-97 use the action `power` byte (+0x10) in a different way
  from standard damage: 30 = percent of self-damage, 92 = random strength x power, 93 = level x power, 94-97 = random
  level x power. Formula 6 uses power as percent of max HP. Element bits fire (0) and earth (3) on a foe technick
  (formula 65/66) interact with Oil and Float. An editor can show these meanings next to the power field, keyed on the
  formula byte (+0x08).
* **Offline ARD editor.** ARD class +0x20 (`maxComboHits`) is the total-hit cap for foe combos. 0 or 1 means no combo.
* **Lua / Cheat Engine memory editor.** The FPW, FPWP, FPK and BUK offsets in section 0.2 are the live working set of a
  Forge formula. Watching FPWP added/removed/matched HP/MP (+0x2C..+0x3C) shows each hit's result before it is
  applied. The reverse flags (FPK +0x0C) record which targets got an inverted heal or damage.
* **Formula/function editor.** You can replace any of these behaviours without patching the game. Drop a numbered
  `functions/<n>.lua` into `TheInsurgentsForgeConfig/functions/`. TIF hot-reloads it by modification date. The id
  space is 0..339.
