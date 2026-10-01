# Drive batch 23: The Insurgent's Forge (TIF), `classes/` part 2 (12 class files) and `functions/0.lua`, `functions/1.lua`

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR.
Offsets are relative to the start of the structure. Absolute addresses are VAs (RVA = VA - 0x120000).

| # | Drive id | Title | Drive path | Lines | md5 (first 8) | Status |
|---|---|---|---|---|---|---|
| 1 | 17VqCvXsyq16wPJUywsRcY9B-w9M8aQb- | getElementalAffinities2.lua | TheInsurgentsForge/classes | 26 | 3daf3300 | read in full |
| 2 | 1TuVK9PLT2S87hzVxbn9ZjF0usYwmDdtp | getElements.lua | same | 28 | f8b467d9 | read in full |
| 3 | 1-XBVdIfWi2J7L6azNC5qBJMIgO5JOzYT | getFormulaProcKeep.lua | same | 57 | 1911ba87 | read in full |
| 4 | 1_ju4HMh7Gja3PzOYLR4nsDPISYTTc6uS | getFormulaProcWork.lua | same | 101 | fa45714c | read in full |
| 5 | 1iE_ZuiEVQpE1IIIPd_kDWuNWLEcN39nC | getFormulaProcWorkPlus.lua | same | 99 | dfd14aad | read in full |
| 6 | 1TomiLOpD9apHALTmrruvg0dIKHAZF6Rb | getLicenses.lua | same | 748 | fdd54b18 | read in full |
| 7 | 1zneXIueeradOBP9UC8DlyMWGHeR6D17V | getQuaternion.lua | same | 24 | 3e5516d5 | read in full |
| 8 | 1tEdBynlP7T7eI0qYrQRBSIVNAcwy24qg | getStatusEffectDurations.lua | same | 41 | 5cfbcac4 | read in full |
| 9 | 1mgsiagDzYjwKTSv9Hh0ZgikgTvX6F-_- | getStatusEffects.lua | same | 76 | e0c8b749 | read in full |
| 10 | 1TX6kbgEH586sUYe3uCI-WgVVqJbvi8NC | getStatusEffectTickDurations.lua | same | 41 | ab18ddd5 | read in full |
| 11 | 19bjp22Iny8AbFit6F7PkE08-yIzhy2ug | getVectorU16.lua | same | 22 | b2b673dc | read in full |
| 12 | 1ps72yu2d3sDI2gmCuTaZuH63-wMdbvrw | list.lua | same | 82 | 934f8f94 | read in full |
| 13 | 15WFMQKPIlyX8OYs_oQTBkgOoK5A3NTnM | 0.lua | TheInsurgentsForge/functions | 9 | e06a9ce8 | read in full |
| 14 | 1TZTxM_V5H7gpfSVDLJQLYDD6NE6ke6B7 | 1.lua | same | 12 | b4c48a5a | read in full |

Drive path prefix: `My Laptop/scripts/`. No file is missing. Every file uses CRLF line endings and starts with
"Made by Xeavin", so the personal-use-only licence applies. The facts below are restated in my own words. No code is
copied.

None of the mods that the task brief names (BlueMagick, DescriptiveInventory, HudColors, ScalableFoes, SummonProbe,
FFXIIEditorCaps, Wayfarer and so on) is in this batch. The batch holds only Forge data classes (typed views over
game memory) and the first two Forge formula functions.

Evidence key:
* **byte-check-in-code**: the code compares the original bytes before it patches. **No file in this batch does
  this.** No file patches game code. The class files only describe layouts, and the two functions only edit Forge
  work records.
* **used-in-code**: the file itself defines the offset or type that the class reads or writes, or it reads or writes
  the field.
* **comment-only**: only a name or a comment says so.
* **xref**: the meaning comes from another Drive file, cited by its Drive id and line. In the JSON output an xref row
  is marked `used-in-code` when that other file really uses the value. It is marked `unclear` when the meaning is my
  own inference.

Short names: BUK = Battle Unit Keep (0x1C8-byte unit sheet, see `docs/formats/live-battle-unit-keep.md`).
BUW = Battle Unit Work. FPW = FormulaProcWork. FPWP = FormulaProcWorkPlus. FPK = FormulaProcKeep.

---

## 0. How the Forge class system works (needed to read every file below)

These are facts from `class.lua` (1hSbCU4m4x0AZEiKJ7nKl2j4Ks_vPr_x7), `flags.lua` (1KXzIWTk7AdYME4rOvG2V9EtzFJ0qu2rY)
and `classes.lua` (1VjTOnPiwdajGQwBB2OcUZF6cHmXnxUy0). They were read only to interpret this batch.

| Topic | Detail | Source | Evidence |
|---|---|---|---|
| Struct view | A class is built from an address plus three maps: field name to offset, field name to Lua Loader type ("u8", "s8", "u16", "s16", "u32", "s32", "u64", "float"), and field name to a nested class. A field with a type is read or written through `memory.<type>[base + offset]`. | class.lua L3-40 | xref (used-in-code) |
| Embedded vs pointer sub-struct | For a nested field `X`, if the type map also has an entry `XPointer`, the nested view is placed at the u64 value stored at base+offset (a pointer). Otherwise it is placed at base+offset (embedded). So `caster`/`casterPointer` at the same offset means "pointer to a FormulaProcWorkPlus". | class.lua L14-21 | xref (used-in-code) |
| Shared nested views (pitfall) | The nested views are created once per class file, when the module loads, and every instance shares them. Each access re-points the shared view. Keeping a reference such as `local a = formula.caster.augments` and then reading `formula.target.augments` silently moves `a` to the target. An editor or script should always resolve the full path again before each use. | class.lua L15-21; FPWP L79-93 | unclear (inference from code) |
| Bit-flag view | `flags.new(address, bits, lengths)` maps a name to a bit index and a width. Byte = index div 8, bit = index mod 8. It reads and writes a single u8 with a mask, so a field must not cross a byte boundary. Fields can be reached by name or by number (the number must be one of the defined indices). | flags.lua L29-74 | xref (used-in-code) |
| Load order | `classes.lua` lists 27 modules in load order: array, class, flags, list, getAugmentDurations, getAugments, getColors, getElements, getElementalAffinities, getElementalAffinities2, getLicenses, getQuaternion, getStatusEffectDurations, getStatusEffectTickDurations, getStatusEffects, getVectorU16, getArdClass, getArdUnit, getBattleActorKeep, getBattleActorModel, getBattleActorWork, getBattleUnitKeep, getBattleUnitKeepPlus, getBattleUnitWork, getFormulaProcKeep, getFormulaProcWorkPlus, getFormulaProcWork. | classes.lua L2-30 | xref (used-in-code) |

---

## 1. getElementalAffinities2.lua

**Purpose.** A 5-byte block of element masks in the order absorb, half, immune, weak, potency. It is the **second**
ordering in the game. The first ordering (getElementalAffinities, not in this batch) starts with weak. The Forge uses
this ordering for the ARD foe class record.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Layout | +0x00 absorb, +0x01 half damage, +0x02 immune, +0x03 weak, +0x04 potency. Each byte is an 8-bit element mask (see section 2). Total size 5 bytes. | L2-8, L14-20 | used-in-code |
| No plain fields | The type map is empty. Every field is an embedded `getElements` byte view. | L10-12, L14-20 | used-in-code |
| Consumer | ARD class (section 2 of an ARD file, loaded in memory) field `elementalAffinities` at **+0x29**. So: absorb +0x29, half +0x2A, immune +0x2B, weak +0x2C, potency +0x2D. This matches `docs/formats/ard-classes.md`. | getArdClass.lua (1rJjWUlDztaIGJA60guO-ULtzkf9Ojc9Q) L58, L83 | xref (used-in-code) |
| Ordering pitfall | The unit-side blocks use the other ordering: weak, absorb, half, immune, potency. These are BUK +0x40 (permanent), Battle Unit Keep Plus +0x78 (temporary), and FPWP +0x138/+0x13D (added/removed, section 5). An editor must not reuse one decoder for both. | this file vs live-battle-unit-keep.md L95-99, L1087-1091 | used-in-code |

## 2. getElements.lua

**Purpose.** A one-byte element bit mask. Every elemental affinity block is built from it.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Element bit order | bit0 fire, bit1 lightning, bit2 ice, bit3 earth, bit4 water, bit5 wind, bit6 holy, bit7 dark. Each is 1 bit wide. | L2-22 | used-in-code |
| Size | 1 byte (u8 mask). Bit 0 is the least significant bit. | L24-26; flags.lua L39-42 | used-in-code |

## 3. getFormulaProcKeep.lua

**Purpose.** The per-unit "keep" record that lives across all targets of one action. It holds the shared amount pool,
three 32-bit per-target flag sets (miss, immune, reverse) and the casting/combo/counter/knockback state. Every
FormulaProcWorkPlus reaches it through its +0x00 pointer.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Layout | +0x00 `amount` u32. +0x04 `missTargetFlags` (32 bits). +0x08 `immuneTargetFlags` (32 bits). +0x0C `reverseTargetFlags` (32 bits). +0x10 `action` u16 (action id). +0x12 `battleFlags` (1 byte). +0x18 `steps` float. Bytes +0x14..+0x17 and +0x1C..+0x3F are not mapped. | L30-44 | used-in-code |
| Target flag sets | Each set has 32 one-bit entries named "0".."31". They are indexed by the target's `identifier` (FPWP +0x2A), so one action can track up to 32 targets. | L2-12, L46-50; 1.lua L7 | used-in-code |
| battleFlags byte (+0x12) | bit0 castingState, bit1 comboState, bit2 counterState, bit3 knockbackState, bits4-7 comboCount (4-bit counter, 0-15). | L14-28 | used-in-code |
| Record table (global) | The records are 0x40 bytes each, in two static tables. If the BUK `type` byte is 1 (foe), the record is at 0x0208DE80 + BUW.identifier x 0x40. Otherwise (party side) it is at 0x0208D480 + BUK.identifier x 0x40. 0x0208DE80 - 0x0208D480 = 0xA00, which is 40 records. | helpers/getFormulaProcKeep.lua (1Pk0kf5PmO0yLZ1veVMbiji1xgjpHWLz5) L2-7 | xref (used-in-code) |
| Who links it | Forge function 221 stores the caster's record address into FPWP(caster)+0x00. Function 222 does the same for the target. | 221.lua (1vylSNC54HyystDHejDfhSHTPKVonGdfI) L4; 222.lua (1cXGTwcEt_k0mspe17hw6wUxJ1Ip_KtDH) L4 | xref (used-in-code) |
| Reset at cast start | Function 226 runs only for the initial target. It zeroes `amount` and all 32 bits of the three target sets. It sets castingState=1 and clears combo, counter and knockback state. It clears comboCount only when the BUW comboCount is 0. | 226.lua (1ImRpdIkIynO5kUbWo8fO1M6CECfMqcoH) L3-21 | xref (used-in-code) |
| `amount` meaning | It is a pool that is shared by all targets. Function 147 divides it by the BUW active-target count and writes the result to the target's removedHp. If the count is 0 it misses (outcome 6). | 147.lua (1VCotaJRkUIySJ89cPk4JsmzDNYWkT0rM) L3-13 | xref (used-in-code) |
| `steps` meaning | Name only. BUW has its own float `steps` at +0x70, which is probably the walk counter for the Traveler technick. | getBattleUnitWork.lua (1Q8DJGxsTHGSf44y5A2U_whqim2JJXorH) L54, L121 | unclear |

## 4. getFormulaProcWork.lua

**Purpose.** The main record for one formula evaluation, called `formula` in every Forge function. It holds pointers
to the caster and target "plus" records and the per-hit state bytes: outcome, skip, critical, combo, counter,
knockback, the evade rates, power, multiplier, modifier, gil, item content, steal results and chain bonus type.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Pointers | +0x00 caster (u64 to FPWP). +0x08 target (u64 to FPWP). +0x10 initialTarget (u64 to BUK). +0x18 reflectTarget (u64 to BUW). | L3-10, L49-52, L90-95 | used-in-code |
| Action block | +0x20 action u16. +0x22 identifier u8 (picks the combat-log line, see batch_21). +0x23 causeType u8. +0x24 outcomeType u8. +0x25 combatLogState u8. +0x26 skipState u8. +0x27 absorbState u8. +0x28 criticalState u8. +0x29 comboState u8. +0x2A counterState u8. +0x2B knockbackState u8. | L11-21, L53-63 | used-in-code |
| Chances and rates (u8) | +0x2C counterChance. +0x2D knockbackChance. +0x2E comboChance. +0x2F accuracyRate. +0x30 onHitRate. +0x31 evadeParry. +0x32 evadeShield. +0x33 evadeWeapon. | L22-29, L64-71 | used-in-code |
| Damage terms (float) | +0x34 power. +0x38 multiplier. +0x3C modifier. | L30-32, L72-74 | used-in-code |
| Content and counters | +0x40 gil s32. +0x44 content s16 (content id, see the id ranges in batch_15). +0x46 contentCount s8. +0x47 numerologyCounter s8. +0x48 travelerCounter s32. +0x4C location s16. | L33-38, L75-80 | used-in-code |
| Steal, shift and chain (u8) | +0x4E commonStealState. +0x4F uncommonStealState. +0x50 rareStealState. +0x51 noStealState. +0x52 shiftState. +0x53 chainBenefitType. | L39-44, L81-86 | used-in-code |
| Knockback | +0x54 knockbackRange float. The highest mapped byte is +0x57. | L45, L87 | used-in-code |
| Outcome values | outcomeType values seen in Forge code: 6 = miss/no effect, 8 = reflect (function 231), 10 = written by the Safety check (section 13). The Cheat Table enum in batch_01 calls 10 "Magick Evade Shield", which does not fit Safety. Either the enum label is wrong, or the game reuses that outcome for Safety. | 0.lua L5; batch_01 / batch_20 | unclear |
| Buffer | TIF allocates its own 0x200-byte `tif_fpw` buffer as the FPW copy, which is larger than the 0x58 bytes mapped here. | batch_15 xref TheInsurgentsForge.lua L1318-1365 | xref (byte-check-in-code in TIF itself) |

## 5. getFormulaProcWorkPlus.lua

**Purpose.** A per-side (caster or target) "result" record. It holds the combined augment and status sets, the HP and
MP changes that the formula wants to apply (set, add, remove), the status and augment changes, the elemental affinity
changes, and stat overrides. Forge function 221 fills it with -1 sentinels before the formula runs. A -1 means "no
change".

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Pointers | +0x00 keep (u64 to FPK, section 3). +0x08 battleUnitWork (u64 to BUW). | L3-6, L48-49, L80-81 | used-in-code |
| Sets | +0x10 augments (128-bit set, 16 bytes, augment ids 0-127). +0x20 statusEffects (32-bit set, status bits in section 9). | L7-8, L82-83 | used-in-code |
| Pools | +0x24 maxHp s32. +0x28 maxMp s16. | L9-10, L50-51 | used-in-code |
| Identity | +0x2A identifier u8 (the unit's slot; it indexes the FPK target flag sets). +0x2B classification u8 (foe classification, 13 = undead; 221 writes -1 when there is no BUW, which a u8 write should store as 0xFF = "None"). | L11-12, L52-53; 221.lua L6-11 | used-in-code |
| HP/MP deltas | +0x2C matchedHp s32 (set HP to this value). +0x30 addedHp s32. +0x34 removedHp s32. +0x38 matchedMp s16. +0x3A addedMp s16. +0x3C removedMp s16. +0x3E mistCharges s16. The value -1 means unchanged. | L13-19, L54-60; 221.lua L44-50 | used-in-code |
| Augment deltas | +0x40 addedAugments (128 bits). +0x50 removedAugments (128 bits). +0x60 augmentDurations (8 x s16 = 16 bytes; slots 3/4/5 = physical/magick/status immunity, the rest reserved). | L20-22, L84-86; getAugmentDurations.lua (1ezCS4dGMJ2gMvk1HdAgXxLFLfCZDjiq2) L2-14 | used-in-code |
| Status deltas | +0x70 addedStatusEffects (32 bits). +0x74 removedStatusEffects (32 bits). +0x78 statusEffectDurations (32 x s32 = 0x80 bytes). +0xF8 statusEffectTickDurations (32 x s16 = 0x40 bytes). | L23-26, L87-90 | used-in-code |
| Element deltas | +0x138 addedElementalAffinities (5 bytes). +0x13D removedElementalAffinities (5 bytes). Both use the getElementalAffinities ordering: weak, absorb, half, immune, potency. | L27-28, L91-92 | used-in-code |
| Stat overrides (s16) | +0x142 strength. +0x144 magickPower. +0x146 vitality. +0x148 speed. +0x14A attackPower. +0x14C defense. +0x14E magickResist. +0x150 evadeParry. +0x152 evadeWeapon. +0x154 evadeShield. +0x156 magickEvadeShield. 221 initialises each one to -1. | L29-39, L61-71; 221.lua L52-62 | used-in-code |
| Tail bytes | +0x158 level s8. +0x159 hpUpdateState u8. +0x15A mpUpdateState u8. +0x15B hitAnimationState u8. +0x15C instantKoState u8. The minimum record size is 0x15D. | L40-44, L72-76 | used-in-code |
| Layout check | The fields fit together with no gaps: 0x78 + 0x80 = 0xF8, 0xF8 + 0x40 = 0x138, 0x138 + 5 = 0x13D, 0x13D + 5 = 0x142. | L25-29 | used-in-code |

## 6. getLicenses.lua

**Purpose.** Names all 368 bits of the obtained-license bit set (license node = battlepack section 12 row). It is
used for BUK +0x194.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Size and location | 368 one-bit entries (bits 0-367), so 46 bytes. In BUK it starts at **+0x194** and ends at +0x1C1. The next field, job1, is at +0x1C3. | L2-371; getBattleUnitKeep.lua (192LKrY1yAs8dUOOfvfZnF1L9lIFWXzja) L67, L146 | used-in-code |
| Quickenings and espers | 0-17 Quickening 1-18. 18 Belias, 19 Mateus, 20 Adrammelech, 21 Hashmal, 22 Cuchulainn, 23 Famfrit, 24 Zalera, 25 Shemhazai, 26 Chaos, 27 Zeromus, 28 Exodus, 29 Ultima, 30 Zodiark. 31 Essentials. | L3-34 | used-in-code |
| Weapons (board 1) | 32-38 Swords 1-7, 39 Blood Sword. 40-42 Greatswords 1-3, 43 Excalibur, 44 Tournesol. 45-48 Katana 1-4, 49 Masamune. 50-51 Ninja Swords 1-2, 52 Yagyu Darkblade & Mesa. 53-57 Spears 1-5, 58 Dragon Whisker, 59 Zodiac Spear. 60-64 Poles 1-5, 65 Whale Whisker. 66-71 Bows 1-6, 72 Sagittarius. 73-76 Crossbows 1-4. 77-82 Guns 1-6. 83-89 Axes & Hammers 1-7. 90-94 Daggers 1-5, 95 Shikari Nagasa & Mina. 96-99 Rods 1-4, 100 Rod of Faith. 101-104 Staves 1-4, 105 Staff of the Magi. 106-110 Maces 1-5. 111-113 Measures 1-3. 114-116 Hand-bombs 1-3. | L35-119 | used-in-code |
| Armour | 117-122 Shields 1-6, 123 Ensanguined Shield, 124 Shell Shield, 125 Zodiac Escutcheon. 126-135 Heavy Armour 1-10, 136 Genji Armour. 137-148 Light Armour 1-12. 149-160 Mystic Armour 1-12. 161-180 Accessories 1-20, 181 Ribbon. | L120-184 | used-in-code |
| Magicks | 182-189 White Magick 1-8. 190-197 Black Magick 1-8. 198-204 Time Magick 1-7. 205-207 Green Magick 1-3. 208-211 White Magick 10-13. 212-214 Arcane Magick 1-3. 215-217 Black Magick 11-13. 218 Time Magick 9. | L185-221 | used-in-code |
| Augment nodes | 219 Warmage, 220 Martyr, 221 Inquisitor, 222 Headsman, 223 Adrenaline, 224 Spellbreaker, 225 Focus, 226 Serenity, 227 Last Stand, 228 Spellbound, 229 Brawler. 230-232 Shield Block 1-3. 233-235 Channeling 1-3. 236-238 Swiftness 1-3. 239-241 Remedy Lore 1-3. 242-244 Potion Lore 1-3. 245-247 Ether Lore 1-3. 248-250 Phoenix Lore 1-3. 251-255 Battle Lore 1-5. 256-260 Magick Lore 1-5. 261-265 HP Lore 1-5. 266-275 Gambit Slot 1-10. | L222-275 | used-in-code |
| Technicks | 276 Steal, 277 Libra, 278 First Aid, 279 Poach, 280 Charge, 281 Horology, 282 Souleater, 283 Traveler, 284 Numerology, 285 Shear, 286 Achilles, 287 Gil Toss, 288 Charm, 289 Sight Unseeing, 290 Infuse, 291 Addle, 292 Bonecrusher, 293 Shades of Black, 294 Stamp, 295 Expose, 296 Revive, 297 1000 Needles, 298 Wither, 299 Telekinesis. | L276-302 | used-in-code |
| Zodiac Age additions | 300-306 HP Lore 6-12. 307-317 Battle Lore 6-16. 318-328 Magick Lore 6-16. 329-330 Swords 8-9, 331 Karkata. 332 Greatswords 4, 333 Excalipur. 334 Katana 5, 335 Kumbha. 336 Ninja Swords 3, 337 Vrsabha. 338 Poles 6, 339 Kanya. 340 Bows 7, 341 Dhanusha. 342 Mithuna, 343 Vrscika. 344 Daggers 6. 345 Staves 5. 346 Measures 4, 347 Makara. 348 Shields 7. 349-350 Heavy Armour 11-12. 351 Light Armour 13. 352 Mystic Armour 13. 353-354 Accessories 21-22. 355 White Magick 9, 356 Black Magick 9, 357 Time Magick 8, 358 Black Magick 10, 359 Time Magick 10. 360 Second Board. 361-367 reserve. | L303-370 | used-in-code |
| Numbering pitfall | The name suffixes are not in bit order. For example, White Magick 9 is bit 355 but White Magick 10 is bit 208, and Time Magick 8 is bit 357 while Time Magick 9 is bit 218. An editor should label bits from this table and not guess from the suffix. | L211, L221, L358-362 | used-in-code |

## 7. getQuaternion.lua

**Purpose.** A 16-byte vector of four floats.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Layout | +0x00 x, +0x04 y, +0x08 z, +0x0C w. All are float32. | L2-14 | used-in-code |
| Consumer | Battle Actor Keep `currentPosition` at **+0x30**. The class name says quaternion, but here it holds a position (x, y, z plus a 4th lane). | getBattleActorKeep.lua (1HIKdVfn7npJzp6i6E8-LuBSFb4LIlI7-) L4, L22 | xref (used-in-code) |

## 8. getStatusEffectDurations.lua

**Purpose.** An array of 32 signed 32-bit remaining durations, one for each status effect.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Layout | 32 x s32 = 0x80 bytes. Entry n is at +n x 4, in the status bit order of section 9 (ko 0 ... xZone 31). | L2-39; list.lua L37-48 | used-in-code |
| Consumers | BUK +0xBC (to +0x13B). FPWP +0x78 (to +0xF7). In FPWP, -1 means unchanged. | getBattleUnitKeep.lua L62, L143; FPWP L25; 221.lua L36-38 | xref (used-in-code) |
| Unit | Not stated in the file. | n/a | unclear |

## 9. getStatusEffects.lua

**Purpose.** The 32-bit status-effect bit set.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Bit order | 0 KO, 1 Stone, 2 Petrify, 3 Stop, 4 Sleep, 5 Confuse, 6 Doom, 7 Blind, 8 Poison, 9 Silence, 10 Sap, 11 Oil, 12 Reverse, 13 Disable, 14 Immobilize, 15 Slow, 16 Disease, 17 Lure, 18 Protect, 19 Shell, 20 Haste, 21 Bravery, 22 Faith, 23 Reflect, 24 Invisible, 25 Regen, 26 Float, 27 Berserk, 28 Bubble, 29 HP Critical, 30 Libra, 31 X-Zone. Each is 1 bit wide. | L2-70 | used-in-code |
| Size | 4 bytes (bits 0-31). The view reads one byte at a time: byte = bit div 8. | L72-74; flags.lua L39-42 | used-in-code |
| Consumers | FPWP +0x20 (combined status), +0x70 (added), +0x74 (removed). | FPWP L8, L23-24 | used-in-code |

## 10. getStatusEffectTickDurations.lua

**Purpose.** An array of 32 signed 16-bit tick timers, one for each status. These are the periodic timers, for example
for poison and regen. The file is a copy of section 8 with only the element type changed. Its internal function name
was left as getStatusEffectDurations.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Layout | 32 x s16 = 0x40 bytes. Entry n is at +n x 2, in the status bit order of section 9. | L2-38 | used-in-code |
| Consumers | BUK +0x13C (to +0x17B). FPWP +0xF8 (to +0x137). In FPWP, -1 means unchanged. | getBattleUnitKeep.lua L63, L144; FPWP L26; 221.lua L36-38 | xref (used-in-code) |
| Naming quirk | The local function is called getStatusEffectDurations, but the module is registered as getStatusEffectTickDurations. A diff against section 8 shows that only the type string differs (s16 instead of s32). | L37-41 | used-in-code |

## 11. getVectorU16.lua

**Purpose.** A 3-component unsigned 16-bit vector. The Forge uses it for the ARD unit scale.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Layout as coded | x u16 at +0x00, y u16 at +0x04, z u16 at +0x08. The stride is 4 bytes even though each element is 2 bytes. | L2-12 | used-in-code |
| Consumer | ARD unit `size` at **+0x0A**. | getArdUnit.lua (1vPkCwCoKwBqfoJ6-_boFVddCb1BVrpiM) L32, L96 | xref (used-in-code) |
| Probable bug | The ARD unit stores size X/Y/Z as three u16 percentages at +0x0A, +0x0C and +0x0E (`docs/formats/ard-units.md`, from the Workshop and Toolkit). With a 4-byte stride, `size.y` reads +0x0E (really Z), and `size.z` reads +0x12/+0x13 (modelColorVariation plus forcedWeaponStanceAnimation). Editors should use a 2-byte stride. | L2-6 vs ard-units.md L94-100 | unclear (inference; the layout itself is used-in-code) |

## 12. list.lua

**Purpose.** A typed-array view that complements `flags`. Each named entry is a full value, not a bit.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Element sizes | u8/s8 = 1, u16/s16 = 2, u32/s32/float = 4, u64/s64 = 8. | L2-12 | used-in-code |
| Addressing | Entry address = base + index x size. The entry can be reached by name (through the bits map) or by number. A number works only if a name is defined for that index. The `address` property re-points the view. | L37-71 | used-in-code |
| Lua Loader API | Reads and writes go through `memory.<type>[address]`, which is the Lua Loader's typed memory accessor. | L48, L63 | used-in-code |
| Length quirk | `#view` returns the highest defined index (31 for a 32-entry list), not the count. This is because the reverse map starts at key 0. Iteration with `pairs` still visits 0 to 31. | L72-77, L23-34 | used-in-code |
| Writes | Only numbers are accepted. Other value types raise an error. | L60-61 | used-in-code |

## 13. functions/0.lua: Forge function 0 (Safety halt)

**Purpose.** This is the first step of every instant-death and HP-percent style formula. If the target has the Safety
augment, the formula stops. In the vanilla game this is the boss immunity to Death, Gravity, Warp-type and similar
effects.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Signature | The function takes (formula, caster, target, functions, classes, helpers). `formula` is the FPW view. | L2 | used-in-code |
| Test | It checks the target's combined augment set (FPWP(target)+0x10) for augment bit 1 (Safety). | L3 | used-in-code |
| Effect | It sets FPW skipState (+0x26) = 1, which stops the remaining functions in the chain, and FPW outcomeType (+0x24) = 10. | L4-5 | used-in-code |
| Formulas that use it | onCast lists of formulas 9 (No-Exp KO), 10 (KO), 12 (MP Drain), 14 (HP % Reduction) and 15 (Dire Magick), each as {0, 2}. onHit lists of formulas 13, 37, 42, 48, 53, 55, 58, 68, 86, 88 and 100. | formulas.lua (1QaofIprWG1mrlhZlxXoxCDSRRMcJmeqS) L11-17, L126-213 | xref (used-in-code) |
| Outcome 10 label | The enum label for 10 is not settled. See section 4. | L5 | unclear |

## 14. functions/1.lua: Forge function 1 (Death heals undead)

**Purpose.** In the KO formula, if the target is undead, the function heals the target to full HP instead of killing
it. It then skips the rest of the chain.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Guard | It does nothing unless FPWP(target) classification (+0x2B) is 13. In the foe classification enum, 13 is Undead. | L3-5; batch_01 classification enum | used-in-code |
| Reverse mark | It sets bit [target identifier] in the caster's FPK reverseTargetFlags (FPK +0x0C). The target identifier is FPWP(target)+0x2A. Many HP-exec functions (for example 110, 111, 113, 116 and 119) set the same bit whenever a heal or damage is inverted. | L7; xref 110.lua (1PKaSlBzNgoSfRpf0g6Bi1suWDOnBU-po) L15 | used-in-code |
| HP result | It copies FPWP(target) maxHp (+0x24) into matchedHp (+0x2C), which means "set HP to max". | L8 | used-in-code |
| Halt | It sets skipState = 1 and leaves outcomeType unchanged (success). | L9 | used-in-code |
| Where used | Only in the onHit list of formula 10 (KO): {1, 21, 31, 32, 40, 115}. | formulas.lua L123 | xref (used-in-code) |

---

## Editor relevance

* **Memory editors (Lua Loader / Cheat Engine).** This batch gives the full byte layout of the Forge's three formula
  records: FPW (0x58 bytes mapped), FPWP (0x15D bytes) and FPK (0x40-byte records in two static tables at
  0x0208D480 for the party and 0x0208DE80 for foes). It also gives the element, status, license and
  status-duration layouts that BUK uses at +0x40, +0xBC, +0x13C and +0x194. A live license editor can toggle any of
  the 368 named bits at BUK+0x194 (byte = bit div 8). The note in `live-battle-unit-keep.md` warns that a license bit
  only marks the node as owned and does not grant its effect.
* **Offline ARD editor.** The foe class affinity block at class +0x29 uses the absorb/half/immune/weak/potency order.
  The ARD unit size is three u16 percentages at +0x0A, +0x0C and +0x0E (not the 4-byte stride in getVectorU16).
* **Forge formula editor.** It can show and validate function chains: function 0 = Safety halt (outcome 10),
  function 1 = undead full heal for formula 10. The FPWP -1 "no change" convention and the skipState halt rule tell
  an editor how to write new `functions/<n>.lua` overrides safely.
* **Pitfalls to encode.** The two element-affinity orderings, the 2-byte stride for the ARD size vector, list `#`
  returning the highest index, flag fields that cannot cross a byte, and the Forge class views that are shared and
  re-pointed on every access.
