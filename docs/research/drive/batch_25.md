# Drive batch 25: The Insurgent's Forge (TIF), `functions/` 12, 113-117, 119-124, 126, 127 (HP/MP "exec" functions)

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR.
Offsets are relative to the start of the structure. Absolute addresses are VAs (RVA = VA - 0x120000).

| # | Drive id | Title | Drive path | Lines | md5 (first 8) | Status |
|---|---|---|---|---|---|---|
| 1 | 1dUyStxwxJf9V95J51aL1zHyIx_WibEAY | 113.lua | TheInsurgentsForge/functions | 23 | 61005ae8 | read in full |
| 2 | 10WsrUe62Tdcga7XesFyF7cQaglnZMkia | 114.lua | same | 16 | 3ad9d1a6 | read in full |
| 3 | 1lxsDAeiB6xdgA8_9v5xGapKf8oFQHyx- | 115.lua | same | 6 | ab7e72f2 | read in full |
| 4 | 1RvY07_LPsgMOgkG7v853fiQA1XraCeIK | 116.lua | same | 63 | 1ab68fab | read in full |
| 5 | 1dSoIHtyJSMyBm23fma9_8fIsa-zqMhVw | 117.lua | same | 18 | 9cdf735d | read in full |
| 6 | 1Q0o5vDLhTce8RI8OvHpswQIbs0jHlv_G | 119.lua | same | 17 | bd00ffcd | read in full |
| 7 | 1d1s5z32M3G4ta5-O3S69L1npmHHPCzkX | 12.lua | same | 11 | ce6afb82 | read in full |
| 8 | 1asxrxLb-K75gWUn1jk4grBGoCAqe8lU9 | 120.lua | same | 25 | 3bfaf512 | read in full |
| 9 | 1iJlnjDe6uJqvbIANemfW4Sro8KSSrob5 | 121.lua | same | 14 | 3f7c17c5 | read in full |
| 10 | 1vZO12FmPdTUsK_A9dipmK-Ab2PUhHVUn | 122.lua | same | 12 | 4ce22a77 | read in full |
| 11 | 1ByQEy1pDszecIES0FDBbOLcoIEn2qYd6 | 123.lua | same | 10 | 70b8352a | read in full |
| 12 | 1lJfp7nXnCnahCDah5nQi_PI_AUKFvoI4 | 124.lua | same | 11 | 03e73da6 | read in full |
| 13 | 1JKhFt43qqLOk0PrlF3mRBOXIYkjKoUI_ | 126.lua | same | 28 | dd8bfc97 | read in full |
| 14 | 18PKKkR5cYsEwhZAlaSakrRA5ttDJ2p3e | 127.lua | same | 28 | 6eed3d68 | read in full |

Drive path prefix: `My Laptop/scripts/`. No file is missing. Every file uses CRLF line endings and its first line
credits Xeavin, so the personal-use-only licence applies. The facts below are restated in my own words. No code is
copied.

Note: a second, unrelated Drive file is also called `12.lua` (1yA81YTt1xVwnpGNwiDbcQrAlgZOfJkXT, 28 lines). It is
not part of this batch. Function 12 here is 1d1s5z32M3G4ta5-O3S69L1npmHHPCzkX.

None of the mods that the task brief names (BlueMagick, DescriptiveInventory, HudColors, ScalableFoes, SummonProbe,
FFXIIEditorCaps, Wayfarer and so on) is in this batch. The batch holds 14 Forge formula functions. Thirteen of them are
the final "executor" step of a formula: they turn power and multiplier into the HP or MP change. Function 12 is a
pre-check for Telekinesis.

Evidence key:
* **byte-check-in-code**: the code compares the original bytes before it patches. **No file in this batch does
  this.** No file patches game code. The functions only write Forge work records, plus one game global (the Dark
  Matter counter).
* **used-in-code**: the file itself reads or writes the field or address.
* **comment-only**: only a name or a comment says so.
* **xref**: the meaning or offset comes from another Drive file or repo doc, cited by name. In the JSON output an xref
  row is marked `used-in-code` when that other file really uses the value. It is marked `unclear` when the meaning is
  my own inference.

Short names: BUK = Battle Unit Keep (0x1C8-byte unit sheet, see `docs/formats/live-battle-unit-keep.md`).
FPW = FormulaProcWork. FPWP = FormulaProcWorkPlus (per-unit result record). FPK = FormulaProcKeep (per-caster
record that lasts across all targets of one cast). FL = Google Sheet "FFXII Formulae List" as summarised in
`docs/formats/enums-formulas.md`.

---

## 0. Shared context (needed to read every file below)

These facts come from files outside this batch. They were read only to interpret the batch.

| Topic | Detail | Source | Evidence |
|---|---|---|---|
| Call signature | Every function gets six arguments: the FPW view, the caster BUK view, the target BUK view, the table of all functions, the class table and the helper table. The function returns nothing. It reports through fields of FPW and of the two FPWP records. | TheInsurgentsForge.lua (12-RwiH0HI81GLcNCvbD5ery86Te1cv-a) L1276-1298 | xref (used-in-code) |
| Who supplies the views | FPW lives at the Forge symbol `tif_fpw`. The caster BUK is the u64 at `tif_fpa`+0x00. The target BUK is the u64 at `tif_fpa`+0x08. The u8 at `tif_fpa`+0x12 is the pass type: 1 = on-cast, 2 = on-hit, any other non-zero value = mist end. Lua clears it to 0 when the pass is done. | TheInsurgentsForge.lua L1318-1341 | xref (used-in-code) |
| Chain rule | Before a chain runs, FPW skipState is set to 0. Functions run in list order. The chain stops as soon as a function leaves skipState = 1. The middleware lists (onHitPre, onHitPost, onHitEnd) run around the formula list. | TheInsurgentsForge.lua L1282-1315 | xref (used-in-code) |
| Override files | A function is loaded from `<mod>/functions/<id>.lua` and can be replaced by `<config>/functions/<id>.lua`. So an editor can ship a changed executor without touching the mod. | TheInsurgentsForge.lua L646-698 | xref (used-in-code) |
| FPW fields used here | +0x00 pointer to FPWP(caster). +0x08 pointer to FPWP(target). +0x20 action u16 (section-14 row id). +0x24 outcomeType u8. +0x26 skipState u8. +0x27 absorbState u8. +0x34 power float. +0x38 multiplier float. +0x3C modifier float. | getFormulaProcWork.lua (1_ju4HMh7Gja3PzOYLR4nsDPISYTTc6uS) L3-32 | xref (used-in-code) |
| FPWP fields used here | +0x00 pointer to FPK. +0x10 augments (128 one-bit flags, to +0x1F). +0x20 statusEffects (32-bit flags). +0x24 maxHp s32. +0x2A identifier u8 (slot number 0-31). +0x2B classification u8. +0x2C matchedHp s32. +0x30 addedHp s32. +0x34 removedHp s32. +0x3A addedMp s16. +0x3C removedMp s16. -1 in a result field means "no change" (set by middleware 221/222). | getFormulaProcWorkPlus.lua (1iE_ZuiEVQpE1IIIPd_kDWuNWLEcN39nC) L3-77; batch_23 | xref (used-in-code) |
| FPK fields used here | +0x00 amount u32. +0x0C reverseTargetFlags (32 one-bit flags, indexed by FPWP identifier). +0x12 battleFlags byte, bit 0 = castingState. | getFormulaProcKeep.lua (1-XBVdIfWi2J7L6azNC5qBJMIgO5JOzYT) L14-50 | xref (used-in-code) |
| castingState life cycle | On-cast middleware 226 runs once per cast (only for the initial target). It zeroes FPK amount and the three target-flag sets, then sets castingState = 1. On-hit-post middleware 300 clears castingState after every hit. So castingState is 1 only during the on-hit pass of the **first** target of a cast. | 226.lua (1ImRpdIkIynO5kUbWo8fO1M6CECfMqcoH) L3-15; 300.lua (1Y5o28qlSjiJCspW9jx7uhjz4EvBatwhI) L3; middlewares.lua (119DX8O_CLAm5LPOguhKeMxXM8uzUQ0YZ) L3, L7 | xref (used-in-code) |
| BUK fields used here | `address` = the view's base address (pseudo-field of the class system). +0x40 permanent elemental affinities: +0x40 weak, +0x41 absorb, +0x42 half, +0x43 immune, +0x44 potency (one byte each, element bit masks). +0x48 currentHp s32. +0x4C currentMp s16. +0x50 weapon u16 (equipment content id, 0x1000 + section-13 row). | getBattleUnitKeep.lua (192LKrY1yAs8dUOOfvfZnF1L9lIFWXzja) L42-48, L114-117, L139; getElementalAffinities.lua (1ECjTqGexAKUB7njFFflWBk6QExwduAt7) L2-8; class.lua (1hSbCU4m4x0AZEiKJ7nKl2j4Ks_vPr_x7) L22-23 | xref (used-in-code) |
| Bit positions used here | Status bit 12 = Reverse (mask 0x00001000; in FPWP it is byte +0x21, mask 0x10). Augment bit 15 = Medicine Reverse ("Item Reverse", Nihopalaoa): FPWP +0x11 mask 0x80. Augment 119 = Potion Lore 3: +0x1E mask 0x80. Augment 120 = Potion Lore 2: +0x1F mask 0x01. Augment 121 = Potion Lore 1: +0x1F mask 0x02. The flag class maps bit n to byte n div 8, bit n mod 8. | getStatusEffects.lua (1mgsiagDzYjwKTSv9Hh0ZgikgTvX6F-_-) L15; getAugments.lua (1VSJgHfBJzwmQfl7WrOi1JVCAJKKV0gz-) L18, L122-124; flags.lua (batch_23) | xref (used-in-code) |
| Classification 13 | 13 is the Undead foe classification. | batch_23 (FPWP +0x2B); batch_01 enum | xref (used-in-code) |
| Outcome codes | outcomeType 6 = miss / no effect. 10 = blocked by Safety (written by function 0). | batch_23 functions/0.lua | xref (used-in-code) |
| absorbState source | Elemental function 95 (and 99 for weapons) sets FPW absorbState = 1 when the action's element matches the target's absorb mask. | 95.lua (1ZepJ25l33bBo7wUGRspnBVjTSJGmKVNj) L22-24; 99.lua (1glrQ-sldFR37-jkYfLwa4p6fZmbSyazu) L27 | xref (used-in-code) |
| Random helper | `getRandomNumber(n)` calls the game RNG (0x00379CD0 through the Forge thunk `tif_grn_call`, result u32 at `tif_grn_args`) and returns value mod n, so the range is 0 .. n-1. | getRandomNumber.lua (11AhF-0YhQYIm2fxSfHCxy2Infby1YW68) L3-5; batch_20 | xref (used-in-code) |
| Element match helper | `getElementalAffinitiesMatch(a, b)` is true when at least one element bit is set in both masks. | getElementalAffinitiesMatch.lua (1JO2XrMhXfggp0dbO4swa8aUOgF_m5ULX) L2-9 | xref (used-in-code) |
| Battlepack records used | Section 13 (equipment, 0x34-byte rows): +0x07 flags, bit 2 (mask 0x04) = hitsFlying. Section 14 (actions, 0x3C-byte rows): +0x13 elements mask. Section 58 (augments, 8-byte rows): +0x04 parameter u16 (vanilla Potion Lore 3/2/1 = 40/30/20). | battlepack-s13/s14/s58 docs; enums-augments.md rows 119-121 | xref (used-in-code) |

### The "absorb/reverse" rule shared by 113, 119 and 126

The three damage executors pick damage or healing with the same test. They deal damage when absorbState and the
target's Reverse flag are **equal** (both 0, or both 1: the two inversions cancel). In every other case they heal
the target by the same amount, and they set the target's bit in the caster's FPK reverseTargetFlags. Because the
test compares absorbState with exactly 0 and 1, a value other than 0 or 1 in absorbState would also take the heal
path (inference). None of these three looks at Undead. Undead is handled by other functions in the same chain.

### Which formulas use each function (Formula Extension on-hit lists)

All uses are in the on-hit table. None of the 14 functions is in an on-cast list.

| Function | Formulas (on-hit) | formulas.lua (1QaofIprWG1mrlhZlxXoxCDSRRMcJmeqS) lines |
|---|---|---|
| 12 | 50 Telekinesis | L163 |
| 113 | 7 Magick Damage, 20-22 and 24-29 weapon classes (all but Brute), 63 Esper Killer, 64 Enemy Attack, 65 Enemy Technick, 66 Cinematic Technick, 83 Self-Destruction, 103 Enemy Combo, 104 Sage Weapon, 105 Esper Specials. The Extension uses 113 where vanilla weapons used the duplicate 125. | L120, L133-135, L137-142, L176-179, L196, L216-218 |
| 114 | 8 Minus Strike, 108 Big Bang | L121, L221 |
| 115 | 10 KO, 86 Dimensional Rift | L123, L199 |
| 116 | 11 HP Drain | L124 |
| 117 | 12 MP Drain | L125 |
| 119 | 14 HP % Reduction, 37 HP % Reduction Items, 68 Enemy HP % Reduction, 106 Piercing HP % Reduction | L127, L150, L181, L219 |
| 120 | 15 Dire Magick Damage | L128 |
| 121 | 16 Knot of Rust | L129 |
| 122 | 17 Dark Matter | L130 |
| 123 | 18 Comet | L131 |
| 124 | 19 Meteor | L132 |
| 126 | 23 Brute Weapon | L136 |
| 127 | 31 Potions | L144 |

---

## 1. functions/113.lua: MagickDamageExec (standard damage executor)

Purpose: the final step of nearly every magick and weapon damage formula. It turns power and the effective
multiplier into removedHp (or addedHp when inverted).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Safety pass-through | If FPW outcomeType (+0x24) is already 10 (Safety), it does nothing. | L3-5 | used-in-code |
| Effective multiplier | Effective multiplier = FPW multiplier (+0x38) minus FPW modifier (+0x3C). Both are floats. | L7 | used-in-code |
| Negative multiplier | If the effective multiplier is below 0, target removedHp = 0 and the function stops. It does not set skipState, so later functions still run. | L8-11 | used-in-code |
| Amount | Amount = FPW power (+0x34) times the effective multiplier. It is a float written into the s32 removedHp/addedHp field, so the Lua Loader truncates or converts it on write (conversion rule not shown here). | L13, L16, L19 | used-in-code (conversion: unclear) |
| Damage vs heal | It follows the absorb/reverse rule above. It reads FPW absorbState (+0x27) and FPWP(target) statusEffects bit 12 (Reverse). Damage goes to FPWP(target) removedHp (+0x34). Heal goes to FPWP(target) addedHp (+0x30) and sets FPK(caster) reverseTargetFlags[FPWP(target) identifier]. | L14-20 | used-in-code |

## 2. functions/114.lua: MinusStrikeDamage ("missing HP x power")

Purpose: the executor of Minus Strike (formula 8) and Big Bang (formula 108).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Amount | Amount = (FPWP(caster) maxHp at +0x24, minus caster BUK currentHp at +0x48) times FPW power. It mixes the FPWP copy of max HP with the live BUK current HP. Multiplier and modifier are not used. | L3 | used-in-code |
| Clamp | A negative amount becomes 0. | L4-6 | used-in-code |
| Damage vs heal | Only the target's Reverse status counts (FPWP(target) statusEffects bit 12). Reverse set: addedHp = amount and the target's bit is set in FPK(caster) reverseTargetFlags. Otherwise removedHp = amount. absorbState, Undead and the Safety outcome are not checked here. | L8-13 | used-in-code |

## 3. functions/115.lua: Kill

Purpose: KO. It is the executor of KO (formula 10) and Dimensional Rift (formula 86).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Effect | It writes 0 to FPWP(target) matchedHp (+0x2C), meaning "set HP to 0". There are no checks of its own. Formula 10 puts several functions in front of it: function 1 (undead full heal, which halts the chain), 21 (Magick Power vs Vitality accuracy), and then 31, 32 and 40. Its on-cast list adds 0 (Safety halt) and 2 (Magick evade). Formula 86 puts function 0 (Safety halt) in front of it. | L3 | used-in-code; chain: xref formulas.lua L123, L199 |

## 4. functions/116.lua: DrainHP

Purpose: the executor of HP Drain (formula 11, the Drain magick). It moves HP between caster and target and knows
about Undead and Reverse on both sides.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Self guard | If the caster BUK and the target BUK are the same address, it sets skipState = 1 and outcomeType = 6 (miss) and returns. | L3-7 | used-in-code |
| Negative multiplier | If (multiplier - modifier) < 0, both FPWP(target) removedHp and FPWP(caster) addedHp are set to 0, and the chain halts (skipState = 1). | L9-15 | used-in-code |
| Amount | Amount = power times (multiplier - modifier). The same amount is used for both sides. | L17 | used-in-code |
| Decision key | Four booleans: caster Undead (FPWP(caster) classification +0x2B == 13), target Undead (FPWP(target) +0x2B == 13), caster Reverse, target Reverse (FPWP statusEffects bit 12). The 16 combinations are listed in a lookup table. For each one the table gives a caster result and a target result. Each result is heal (addedHp), damage (removedHp) or none (field left at -1). | L18-44 | used-in-code |
| Lookup table, caster not Undead (cU=0) | Rows are (target Undead, caster Reverse, target Reverse) -> (caster, target). (0,0,0) -> heal, damage (normal drain). (0,0,1) -> none, heal. (0,1,0) -> damage, damage. (0,1,1) -> none, heal. (1,0,0) -> damage, heal (the drain is inverted against undead). (1,0,1) -> none, damage. (1,1,0) -> heal, heal. (1,1,1) -> none, damage. | L20-27 | used-in-code |
| Lookup table, caster Undead (cU=1) | (0,0,0) -> none, none. (0,0,1) -> damage, heal. (0,1,0) -> damage, none. (0,1,1) -> none, heal. (1,0,0) -> none, none. (1,0,1) -> heal, damage. (1,1,0) -> heal, none. (1,1,1) -> none, damage. | L28-35 | used-in-code |
| Pattern | When the target is reversed, the caster never changes. An undead caster that is not reversed draining a non-reversed target does nothing at all. | L20-35 | used-in-code (pattern is my reading) |
| Reverse mark | The target's bit in FPK(caster) reverseTargetFlags is set when the caster result is damage, or when both results are none. | L58-60 | used-in-code |
| FL text vs code | FL says 116 "calculates hit or miss based on Magick Power". This file has no hit roll. In the Extension, formula 11 has only the on-cast Magick-evade check (function 2). Its on-hit list puts only power and modifier loaders in front of 116 (62 AttackMagickPower, 92 status interactions, 93 augment power). So a Forge Drain has no Magick-accuracy roll unless another function adds one. | L1-63; enums-formulas.md rows 2, 62, 92, 93, 116; formulas.lua L11, L124 | used-in-code (chain: xref) |

## 5. functions/117.lua: SyphonMP

Purpose: the executor of MP Drain (formula 12, Syphon).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Guards | It misses (skipState = 1, outcomeType = 6) when the target BUK currentMp (+0x4C) is 0 or less, or when the caster and the target are the same unit. | L3-7 | used-in-code |
| Amount | Amount = power times multiplier. The modifier is **not** subtracted here (unlike 113/116). | L9 | used-in-code |
| Cap | The amount is capped at the target's current MP (BUK +0x4C). | L10-12 | used-in-code |
| Result | FPWP(target) removedMp (+0x3C, s16) = amount. FPWP(caster) addedMp (+0x3A, s16) = amount. There is no Reverse or Undead handling. | L14-15 | used-in-code |

## 6. functions/119.lua: PercentageDamage

Purpose: "power % of max HP" damage. It is the executor of HP % Reduction (14, Gravity), HP % Reduction Items (37),
Enemy HP % Reduction (68) and Piercing HP % Reduction (106).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Safety pass-through | If outcomeType is already 10, it does nothing. | L3-5 | used-in-code |
| Amount | Amount = FPWP(target) maxHp (+0x24) times FPW power, then floor-divided by 100. So power is a whole percentage. In batch_04, Micro Missiles is built on the Gravity shell and uses power 50. Multiplier and modifier are not used. | L7 | used-in-code |
| Damage vs heal | Same absorb/reverse rule as 113 (damage if absorbState equals Reverse, otherwise heal plus reverse mark). | L8-14 | used-in-code |
| FL text vs code | FL says 119 also accounts for Disease and Bubble. This file only reads FPWP maxHp. Any Bubble or Disease effect must already be in that FPWP value (filled by middleware 222). I did not verify that. | L7; enums-formulas.md row 119 | unclear |

## 7. functions/12.lua: WeaponHitsFlyingHalt (Telekinesis guard)

Purpose: the first on-hit step of Telekinesis (formula 50). Telekinesis only works when the caster's weapon
**cannot** reach flying targets.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Weapon lookup | It takes the caster BUK weapon (+0x50, equipment content id) minus 0x1000 as the battlepack section-13 row. | L3 | used-in-code |
| Test | If that row's flags.hitsFlying bit is set (section 13 +0x07, mask 0x04), it sets skipState = 1 and outcomeType = 6 (miss). The rest of the chain (47, 141) does not run. | L5-8 | used-in-code |
| Editor note | Changing a weapon's hitsFlying bit in section 13 also turns Telekinesis off or on for anyone who holds that weapon. | L3-8 | used-in-code (consequence is my reading) |

## 8. functions/120.lua: DireMagick

Purpose: the executor of Dire Magick Damage (formula 15). It sets the target's HP outright, based on the action's
element and the target's permanent elemental affinities.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Action lookup | It reads the battlepack section-14 row named by FPW action (+0x20). It uses that row's elements mask (+0x13). | L3 | used-in-code |
| Affinity source | It uses the target BUK's permanent affinity masks (BUK +0x40 block: +0x40 weak, +0x41 absorb, +0x43 immune). Equipment-granted or temporary affinities are not consulted here. | L4, L10, L16 | used-in-code |
| Step 1, immune | If an action element is in the immune mask: miss (skipState = 1, outcomeType = 6). | L4-8 | used-in-code |
| Step 2, not weak | If **no** action element is in the weak mask: matchedHp = 0 (KO) and halt. | L10-14 | used-in-code |
| Step 3, weak but not absorb | If no element is in the absorb mask: matchedHp = random 0 or 1 (getRandomNumber(2)). The chain is not halted, but 120 is the last function of formula 15. | L16-19 | used-in-code |
| Step 4, weak and absorb | Otherwise matchedHp = FPWP(target) maxHp (full heal) and halt. | L21-22 | used-in-code |
| Conflict with FL | FL describes formula 15 as "weak -> KO, immune -> nothing, absorb -> full HP, else single-digit HP". The code tests the weak mask the other way round: a target that is **not** weak is KO'd, and a weak target is left at 0 or 1 HP. An absorbing target is only healed if it is also weak. A non-elemental action matches nothing, so it KOs everything that is not immune. Either the Forge port inverts the weak test, or FL is wrong. The random range is 0-1, not 1-9. **Unresolved; test in game before relying on it.** | L10-19; enums-formulas.md rows 15, 120 | unclear |

## 9. functions/121.lua: KnotOfRust

Purpose: the executor of Knot of Rust (formula 16). It deals damage and feeds the Dark Matter counter.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Amount | Amount = FPWP(caster) maxHp (+0x24) integer-divided by (random 0-9, plus 1), so max HP / 1..10. FL says "current HP". The code uses **max** HP. | L3 | used-in-code |
| Result | FPWP(target) removedHp = amount. There is no Reverse, Undead or Safety logic. | L4 | used-in-code |
| Dark Matter counter | **u16 global at 0x021B8418** (RVA 0x02098418). The counter is increased by amount integer-divided by 3, not by the full damage that FL describes. The total is capped at 60000. It sits next to the other technick counters: u32 traveler counter at 0x021B840C, mode flags at 0x021B8410, u8 numerology counter at 0x021B841A (batch_21, batch_01). | L6-11 | used-in-code |

## 10. functions/122.lua: DarkMatter

Purpose: the executor of Dark Matter (formula 17). It spends the counter that Knot of Rust filled.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| First target only | Only while FPK(caster) battleFlags.castingState (FPK +0x12 bit 0) is 1, which is the first target of the cast (see section 0): it reads the u16 counter at 0x021B8418, stores it in FPK(caster) amount (+0x00, u32), and writes 0 back to the counter. | L3-7 | used-in-code; first-target meaning: xref 226.lua / 300.lua |
| Every target | FPWP(target) removedHp = FPK(caster) amount. So every target of one Dark Matter cast takes the full stored total. It is not split between targets (compare Gil Toss function 147, which divides the FPK amount). | L9 | used-in-code |
| Editor use | A memory editor can preset or read the Dark Matter charge by writing or reading the u16 at 0x021B8418. Values above 60000 are never produced by the Forge. | L4-6; 121.lua L7-11 | used-in-code |

## 11. functions/123.lua: Comet

Purpose: the executor of Comet (formula 18).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Amount | If FPWP(caster) maxHp is 0, removedHp = 0. This also avoids a modulo by zero. Otherwise removedHp = random 0 .. maxHp-1. FL says 1..max, so the code's range is shifted down by one. | L3-7 | used-in-code |

## 12. functions/124.lua: Meteor

Purpose: the executor of Meteor (formula 19).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Amount | It draws random 0-19999. Values 0-9999 are used as they are. Values 10000-19999 become 30000. So there is about a 50 % chance of 30000 and otherwise 0-9999. The result goes to FPWP(target) removedHp. There is no other logic. | L3-8 | used-in-code |

## 13. functions/126.lua: RandomWeaponDamageExec (Brute weapons)

Purpose: the executor of Brute Weapon (formula 23, axes and hammers). It is 113 with a random power.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Safety and negative multiplier | Same as 113: it returns if outcomeType is 10, and writes removedHp = 0 if (multiplier - modifier) < 0. | L3-11 | used-in-code |
| Random power | If power is at least 0.01, power is replaced by random(power x 100) / 100. That is a uniform value from 0 up to just below power, in steps of 0.01. The FPW power field is not written back. Only a local copy changes. | L13-16 | used-in-code |
| Amount and result | Amount = random power times (multiplier - modifier). It then uses the same absorb/reverse damage-or-heal rule as 113. | L18-25 | used-in-code |

## 14. functions/127.lua: PotionExec

Purpose: the executor of Potions (formula 31: Potion, Hi-Potion, X-Potion and so on). It adds Potion Lore
bonuses and handles Undead, Reverse and the Item Reverse augment.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Lore bonus | For each Potion Lore augment that the **caster** has in FPWP(caster) augments, it adds that augment's section-58 parameter (u16 at row +0x04) to a percentage bonus. The rows are 119 (Lore 3), 120 (Lore 2) and 121 (Lore 1). With vanilla data the bonus is 40 + 30 + 20 = up to 90 %. | L3-14 | used-in-code |
| Amount | Total = power times multiplier times (100 + bonus), floor-divided by 100. Modifier is not used. | L16 | used-in-code |
| Heal vs damage | Three yes/no inputs: target Undead (FPWP(target) classification == 13), target Reverse (status bit 12), caster has Medicine Reverse (augment bit 15, the Nihopalaoa "Item Reverse" augment). It heals (target addedHp) when an even number of them are true (0 or 2). Otherwise it damages (target removedHp) and sets the target's bit in FPK(caster) reverseTargetFlags. | L17-25 | used-in-code |
| Editor use | Changing section-58 rows 119-121 `parameter` changes the Forge potion bonus directly. The Medicine Reverse check is on the user of the item, not on the target. | L5-13, L17-20 | used-in-code |

---

## Cross-file summary for editor builders

* **Result-field contract.** The executors only write FPWP result fields: matchedHp (+0x2C) = set HP to the value,
  addedHp (+0x30) = heal, removedHp (+0x34) = damage, addedMp (+0x3A), removedMp (+0x3C). A field left at -1 means
  no change. An inverted result must also set FPK(caster) reverseTargetFlags[target identifier]. Probably this
  drives the green "reversed" number and combat-log handling (inference). A custom executor should follow the same
  rules.
* **Miss contract.** A miss is skipState = 1 plus outcomeType = 6 (functions 12, 116, 117, 120). A "zero effect"
  that is not a miss leaves outcomeType alone (113/126 with a negative multiplier). Safety (10) is respected by 113,
  119 and 126 only.
* **Inputs.** Power, multiplier and modifier come from FPW (+0x34/+0x38/+0x3C). 113, 116 and 126 use
  power x (multiplier - modifier). 117 and 127 use power x multiplier. 119 uses power as a % of max HP. 114 uses
  power x missing HP. 121/123/124 ignore power completely.
* **One new game global:** the Dark Matter counter, u16 at **0x021B8418** (cap 60000 in the Forge). Knot of Rust adds
  one third of its damage. Dark Matter drains the counter on the first target of its cast.
* **Battlepack data that these functions read live:** section 13 weapon hitsFlying (Telekinesis), the section 14
  action elements (Dire Magick), and the section 58 parameters of augments 119-121 (Potion Lore %).
* **Possible bugs or differences from FL** to check in game: 120 inverted weak test and 0-1 random range. 121 uses
  max HP and adds damage/3 to the counter. 123 range 0..max-1. Formula 11 (116) has no Magick-Power accuracy step in
  the Extension list.
