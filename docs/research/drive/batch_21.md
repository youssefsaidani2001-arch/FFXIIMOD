# Drive batch 21: The Insurgent's Forge (TIF), `assemblies/` part 2 (13 call stubs) and `classes/array.lua`

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR.
Addresses are the absolute VAs that the stubs call. RVA = VA - 0x120000.
This batch continues batch_20, which covered the first 14 stubs of the same folder.

| # | Drive id | Title | Drive path | Lines / bytes | md5 (first 8) | Status |
|---|---|---|---|---|---|---|
| 1 | 1xiFIUbnlpLT89UpyNwxoF6J62dGvUIUh | modifyContent.lua | TheInsurgentsForge/assemblies | 32 / 416 | 72154299 | read in full |
| 2 | 1qN343TTFZY2QUEj_o-SN9TdzAbo96Es1 | modifyGil.lua | same | 27 / 313 | 85a741bf | read in full |
| 3 | 1Z7A2c3ubVrJ1BhldM-760Gr-HeZdloVO | modifyHp.lua | same | 199 / 2861 | 5147bd57 | read in full |
| 4 | 1ii0KMQuEV0sgV-Yo8UrM7DvYJ7XpT0cG | modifyMistCharges.lua | same | 99 / 1368 | 49b6b8dc | read in full |
| 5 | 1Hs-m1qAFHyuPVmhwamsMExk-RchOy-nL | modifyMp.lua | same | 98 / 1347 | c8d11243 | read in full |
| 6 | 1lmOF6ljYelK4zLaJc1a9NMMn2OOsH2jN | modifySkyPiratesDenStats.lua | same | 29 / 373 | b44e3f80 | read in full |
| 7 | 1ZRsRwZsp2uhjD9CjhRtYLpdb88zpFWRN | refreshStats.lua | same | 28 / 328 | 8662528a | read in full |
| 8 | 11XwLuBlhMPGfdvLpIO_UdRHnPNly4ohO | removeAugment.lua | same | 62 / 878 | 682a4cb6 | read in full |
| 9 | 1rU7pwWGH0Nl1RKV4lAlh1BaLlzzndOd- | removeStatusEffect.lua | same | 116 / 1687 | 841b423d | read in full |
| 10 | 1JWhfP7I27S73CpSACo2GkyIYc3K5x7LD | setLevel.lua | same | 31 / 403 | 8e7769bd | read in full |
| 11 | 1f2mc7ghwwyRueKKWpBgHbrF7ugx4UOT7 | showCombatLog.lua | same | 39 / 481 | f9665ff7 | read in full |
| 12 | 1WnILybnCnwEO8HuatKyE8Uq_HJR6aX2n | showNumberText.lua | same | 33 / 442 | 0f85ca76 | read in full |
| 13 | 1o0eYj96_4YEhhheSMoY1r9ptJYS-9CdY | teleportLocation.lua | same | 70 / 932 | 7412b4c7 | read in full |
| 14 | 1yfrvj-Y7ZoCnjAZGudmyS7NKmrWmS0Cw | array.lua | TheInsurgentsForge/classes | 68 / 1818 | 5b2c5828 | read in full |

Drive path prefix: `My Laptop/scripts/`. No file is missing. Every file uses CRLF line endings and starts with
"Made by Xeavin", so the personal-use-only licence applies. The facts below are restated in my own words and no
code is copied.

None of the files that the task brief names (BlueMagick, DescriptiveInventory, HudColors, ScalableFoes, SummonProbe,
FFXIIEditorCaps, Wayfarer and so on) is in this batch. This batch holds only Forge call stubs and one Lua class.

Evidence key:
* **byte-check-in-code**: the code compares the original bytes before it patches. **No file in this batch does
  this.** No file patches game code. Each stub is newly assembled code that calls game functions and reads or
  writes unit memory.
* **used-in-code**: the stub itself calls the address, or reads or writes it.
* **comment-only**: only a comment or a label name says so.
* **xref**: the meaning comes from the matching Lua wrapper in `TheInsurgentsForge/helpers/`, which has the same file
  name but a different Drive id, or from a Forge formula that calls the helper. These sources are cited by Drive id.
  In the JSON output an xref row is marked `used-in-code` when the caller really passes or reads that value. It is
  marked `unclear` when the meaning is my own inference.

Unit objects: "keep" means a **Battle Unit Keep**, the 0x1C8-byte unit sheet. The party keeps are at
`[0x02EBF190] + 8 + id*0x1C8`. "BUW" means a **Battle Unit Work**. "keep-plus" means a **Battle Unit Keep Plus**,
reached through BUW+0x6A0. The field names follow `docs/formats/live-battle-unit-keep.md` and
`live-battle-actor-chain.md`.

---

## 0. Shared mechanism (all 13 stubs)

| Topic | Detail | Source | Evidence |
|---|---|---|---|
| File shape | Each stub file is a Lua chunk that returns two values: an Intel-syntax x64 assembly string and a list of exported symbols, `tif_<abbr>_call` and `tif_<abbr>_args`. The abbreviations in this batch are mc, mg, mhp, mmc, mmp, mspds, rs, ra, rse, sl, scl, snt and tl. | last 5-7 lines of each file | used-in-code |
| Registration | `assemblies.lua` (1xofEVVrXeHwVT7tH5cg22H5EI92KpaK2) lists 30 stub names. This batch covers list lines 3 and 21-32. The Forge assembles each stub with `memory.assemble` and runs it with `memory.execute("<prefix>_call")`. See batch_20, section 0. | assemblies.lua L2-33 | xref |
| Wrapper pattern | The wrapper in each `helpers/<name>.lua` gets the args block from `memory.getSymbol`, writes typed fields into it, then executes the stub. The only exception is teleportLocation, which uses **`memory.executea`**, the asynchronous form. | helpers/*.lua | xref (used-in-code) |
| Stack | Every stub keeps the Win64 shadow space and 16-byte alignment. modifyContent reserves 0x30 bytes so that it can pass a **5th argument** at [rsp+0x20]. | each file, prologue | used-in-code |

## 1. modifyContent.lua

Purpose: adds an inventory content (item, equipment, loot, gil-as-content and so on) by content id, or removes one
when the count is negative.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Game function | **0x003008A0** (RVA 0x1E08A0) takes 5 arguments. ECX = content id (u16, zero-extended). EDX = s32 count. R8D = 0. R9D = 1. 5th argument (stack) = 0. The Insurgent's Toolkit calls this function "modify inventory (id, count, op, target, flags)", so this stub uses op 0, target 1 and flags 0. Those three meanings are the Toolkit's names and are not proven here. | L10-15 | used-in-code |
| Args layout | +0x00 u16 content id, stored in a dword slot. +0x04 s32 count. | L23-25; helpers/modifyContent.lua (1PCu3hchfrfqHPO54A5OdSq-skHc1JVqZ) L3-5 | used-in-code |
| Content id | content id = category << 12 \| index. Gil is 0xE000 + amount (0-4095). See enums-content-ids.md. | formula 332 L48-66 tests 0xE000-0xEFFF | xref |
| Callers | Formula 260 (1PN7_6PQ01Dte0Au7G7rLNogWgNpXjTET) calls it when content is not -1 and count is not 0. Formula 321 (1hqx6PgQf2vvVxhByDaPvhlp3EAF_xk4Z) adds 1 of the ARD unit's commonSteal, uncommonSteal or rareSteal content on a successful steal. | 260 L3-5; 321 L3-19 | xref (used-in-code) |

## 2. modifyGil.lua

Purpose: adds a signed amount to party gil, or subtracts it.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Game function | **0x0032A7F0** (RVA 0x20A7F0). ECX = s32 gil delta. There is no return value. | L10-11 | used-in-code |
| Args layout | +0x00 s32 delta. | L19-20; helpers/modifyGil.lua (1UdiKFhDcRKxigVKprB0JboCPem-jY0Ce) L4 | used-in-code |
| Caller | Formula 260 calls it when formula.gil is not 0. | 260 L7-9 | xref |

## 3. modifyHp.lua

Purpose: the Forge's full "apply HP change" routine. It clamps to the HP floor and the max-HP cap and honours Disease
and Bubble. It updates the HP gauge, respects a protection flag, and plays the hit or KO reaction. On a foe KO it
also updates the respawn bookkeeping.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Args layout | +0x00 u64 caster keep. +0x08 u64 target keep. +0x10 s32 amount (signed delta). +0x14 u8 knockbackState. +0x15 u8 hitAnimationState. +0x16 u8 KO-animation selector. The wrapper names the last field koAnimationType, and formulas 323 and 324 pass `instantKoState` in it. | L186-192; helpers/modifyHp.lua (19bT97bMevGijHALmaXB5AwfPu9XCgQ5g) L2-9 | used-in-code |
| Target BUW | **0x0031B860**(target keep) returns the BUW, or 0. | L16-18 | used-in-code |
| HP floor | floor = s32 **BUW+0x48** (`hpLowLimit`), or 0 when there is no BUW. | L20-24 | used-in-code |
| New HP | new = s32 keep+0x48 (currentHp) + amount. When new is below the floor, it is set to the floor and the upper caps are skipped. | L27-36 | used-in-code |
| Disease cap | Status mask = dword keep+0x64 (temporary) OR dword keep+0x3C (permanent). When **bit 16 (Disease)** is set, the cap is max(current HP, 1), so HP cannot rise. In that case the Bubble rule is skipped. | L38-48 | used-in-code |
| Bubble cap | Otherwise the cap is s32 keep+0x24 (maxHp). When **bit 28 (Bubble)** is set, the cap is doubled. new = min(new, cap). | L50-59 | used-in-code |
| Gauge update | When the BUW exists: **0x0028F1F0**(ECX = u32 BUW+0x08 focus id, EDX = old HP, R8D = new HP, R9D = 0). modifyMp calls the same function with R9D = 1, so R9D selects HP (0) or MP (1). The name "gauge or number roll-up" is my inference. This call runs **before** the protection check. | L61-69 | used-in-code |
| Protection check | When amount <= 0: **0x0030B7F0**(RCX = target BUW, EDX = 0). If the **high 16 bits of EAX** are not 0, the HP write is skipped. The reaction logic still runs. The label name suggests a "god mode" test. RCX can be 0 here, so the function must accept a null BUW. | L71-82 | used-in-code (meaning: comment-only via label) |
| HP write | s32 keep+0x48 = new. When amount > 0 (a heal), the routine ends here with no reaction. | L84-90 | used-in-code |
| Caster data | Caster BUW = 0x0031B860(caster keep). The caster focus id is u32 casterBUW+0x08, or 0. knock = 1 when knockbackState is not 0. | L92-109 | used-in-code |
| Survive reaction | When HP after the write is above the floor, and there is a target BUW, and hitAnimationState is not 0, the stub calls **0x003299B0**(RCX = target BUW, EDX = **0x2005** for a plain hit or **0x2006** with knockback, R8D = caster focus id). | L111-123, L168-171 | used-in-code |
| KO bookkeeping | When HP <= floor and the target BUW exists: if there is a caster BUW, the stub writes the caster focus id to **u32 targetBUW+0x30** (`koCasterFocusIdentifier`). | L125-132 | used-in-code |
| Foe death stamp | When **u8 keep+0x05 == 1** (foe): t = **0x0032A150**(), which takes no arguments. divisor = int(f32 **[0x01DFE0B8]** × f32 **[0x008F8D80]**). keep-plus = [BUW+0x6A0]. The stub increments **u16 keep-plus+0x08** (`currentDeathCount`) and stores t / divisor (unsigned) in **u32 keep-plus+0x0C** (`deathTime`). My inference: 0x0032A150 is a running tick counter and the float product is a ticks-per-unit rate, so deathTime feeds the respawn timer (keep-plus+0x10). | L134-150 | used-in-code (semantics inferred) |
| KO gate | **0x00306F00**(target BUW). A non-zero result skips the KO reaction. Its meaning is unknown. | L152-157 | used-in-code |
| KO reaction id | When the KO selector is not 0, the id is **0x200E**. Otherwise it is **0x2007** with knockback or **0x2008** without. The stub sends it through 0x003299B0(target BUW, id, caster focus id). | L159-171 | used-in-code |
| KO status is separate | The stub never sets status 0. Formulas 323 and 324 remove KO before healing a unit at or below the floor. After modifyHp they add status 0 with the default duration when HP <= hpLowLimit. | 323.lua (1FENtrXNql1aXckDK0iPMAFQU22ZKznvM) L46-56 | xref |

## 4. modifyMistCharges.lua

Purpose: changes a unit's Mist charges and recomputes its Mist bar count.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Args layout | +0x00 u64 keep. +0x08 s32 delta. | L90-92; helpers (1F6IF1Dnlgj4ncxiSJQGVuKnQMI18V_WV) L4-5 | used-in-code |
| Max charges | cap = s16 keep+0x28 (maxMp). When **u8 keep+0x37 (maxMistBars)** is not 0, cap = maxMp × maxMistBars. | L14-20 | used-in-code |
| New value | new = s16 keep+0x06 (mistCharges) + delta. | L23-24 | used-in-code |
| Zero rule | When new < 0, **or** when bit 7 of byte keep+0x6C or of byte keep+0x7C is set, both new and cap become 0. That bit is augment **39, Emptiness ("Zero MP")**, in the temporary (0x68) or permanent (0x78) augment set. | L26-38 | used-in-code (augment name from enums-augments.md) |
| Clamp | new = min(new, cap). | L40-44 | used-in-code |
| Protection | When delta < 0: BUW = 0x0031B860(keep). When the high word of 0x0030B7F0(BUW, 0) is not 0, the write is aborted. | L46-60 | used-in-code |
| Writes | s16 keep+0x06 = new. When maxMp > 0, **u8 keep+0x4E (currentMistBars)** = new / maxMp (signed integer division) if maxMistBars > 0, else 0. So the bar count is floor(charges / maxMp). | L62-79 | used-in-code |
| Callers | Formulas 323 and 324 add the same amount as an MP gain. They also raise the charges to matchedMp and apply formula.mistCharges. Formula 326 (11YDiDtmSiKA_4feRwS1yyp_gX36s-xp0) regenerates MP and charges by the same amount. | 323 L84-96; 326 L50-51, L64-65 | xref |

## 5. modifyMp.lua

Purpose: changes current MP with clamping, a gauge update and the protection check.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Args layout | +0x00 u64 keep. +0x08 s32 delta. | L89-91; helpers (1WYI9IeDSqHV_2mHJptYLHhtNR-vEH48L) L4-5 | used-in-code |
| Computation | BUW = 0x0031B860(keep). old = s16 keep+0x4C. new = old + delta. new is set to 0 when it is negative or when the Emptiness augment (bit 7 of keep+0x6C or keep+0x7C) is set. new = min(new, s16 keep+0x28 maxMp). | L13-41 | used-in-code |
| Gauge | 0x0028F1F0(ECX = BUW+0x08 focus id, EDX = old MP, R8D = new MP, **R9D = 1**). This only happens when the BUW exists. | L43-51 | used-in-code |
| Protection | When delta < 0, the write is skipped if the high word of 0x0030B7F0(BUW, 0) is not 0. | L53-64 | used-in-code |
| Write | s16 keep+0x4C = new. | L66-68 | used-in-code |
| After an MP loss | When the BUW exists and new < old, the stub calls **0x002FA540**(BUW). Its purpose is unknown. A guess is that it re-checks whether a queued action is still affordable. | L70-77 | used-in-code (meaning unclear) |

## 6. modifySkyPiratesDenStats.lua

Purpose: bumps one of the counters behind the Sky Pirate's Den trophies.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Game function | **0x00316A50** (RVA 0x1F6A50). ECX = u8 figure or stat id. EDX = s32 delta. | L10-12 | used-in-code |
| Args layout | +0x00 u8 id, stored in a dword slot. +0x04 s32 count. | L20-22; helpers (1Nu7Daby7z8uxxw_xhNBsxvfqk_97KXdo) L2-5 | used-in-code |
| Id 3 | Formula 321 calls it with id **3** and count +1 for every successful steal, so **id 3 = steal counter**. | 321 L6, L12, L18 | xref |

## 7. refreshStats.lua

Purpose: recomputes a unit's derived stats after status, augment, level or affinity edits.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Game function | **0x0030FED0**(RCX = keep, **EDX = 0**). Other mods call the same function with EDX = 0x97 (batch_05, batch_17), and the Toolkit names it "set permanent augments". This stub passes 0, so EDX is a selector or flag set, and 0 means a plain recompute (inference). | L10-12 | used-in-code |
| Args layout | +0x00 u64 keep. | L20-21; helpers (1A4BlL7NAmFDRo9NbcfKFcQUIcXCozOYc) L4 | used-in-code |
| Callers | Formulas 323 and 324 call it after they add or remove statuses or augments. For non-party units they also call it after stat or affinity overrides. For party units (keep type 0) they call it only when something changed. | 324 (1t2JNmzkEJPKd1M-CmS3aH0zCA0ZDGrwq) L120-125, L209 | xref |

## 8. removeAugment.lua

Purpose: removes a **timed** temporary augment and clears its timer slot.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Args layout | +0x00 u64 keep. +0x08 u8 augment id. | L53-55; helpers (12e2ej6E1zgU60Cx9qeI5gY24vQcwfUDp) L4-5 | used-in-code |
| Id range | If id > 0x7F the stub does nothing. The temporary set has 128 bits. | L10-12 | used-in-code |
| Section 58 pointer | The qword **[0x02EBF040]** is the in-memory battlepack **section 58 (Augments)** st2e header. It is null-checked. Stride = u16 at +0x08. Record base = u32 at +0x0C, used as an absolute 32-bit address. record = base + id × stride. This adds 0x02EBF040 = section 58 to the known non-linear map of section caches: 038 = 12, 0D8 = 7, 130 = 16, 138 = 14. | L14-21 | used-in-code (section identity inferred from field +6 = timerSlot) |
| Timer slot | slot = u8 at record+0x06, the low byte of the u16 `timerSlot`. If slot > 7 (for example 255 = none), the stub does nothing. **So only augments that have a timer slot can be removed.** | L23-25 | used-in-code |
| Bit clear | byte keep+0x68+(id>>3), bit (id&7). If the bit is clear, the stub does nothing. Otherwise it clears the bit and writes 0 to **s16 keep+0x17C + slot×2** (augment timer). | L27-44 | used-in-code |

## 9. removeStatusEffect.lua

Purpose: removes a temporary status, clears its timers and runs the matching "status ended" side effect.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Args layout | +0x00 u64 keep. +0x08 u8 status id (0-31). | L107-109; helpers (1cjAcxNVGY_McUQtckeMUGum1hAu6yWRO) L4-5 | used-in-code |
| Scope | BUW = 0x0031B860(keep). If id > 31, or if bit id of **dword keep+0x64** (temporary statuses) is clear, the stub does nothing. Permanent statuses at keep+0x3C are never touched. | L11-26 | used-in-code |
| Clears | Clears the bit. Writes 0 to **s32 keep+0xBC + id×4** (duration) and **s16 keep+0x13C + id×2** (tick timer). | L28-35 | used-in-code |
| KO, Stone, X-Zone | For ids **0, 1 and 31**: **0x00301140**(BUW). Its exact role is unknown. It probably restores the unit after these "disabled" states. | L40-57, L95-97 | used-in-code |
| Sleep | For id **4**: 0x003299B0(BUW, **0x2001**, 0) queues the wake-up reaction. | L47-48, L60-65 | used-in-code |
| Confuse and Berserk | For ids **5 and 27**: a flag F is computed. F = 0 when bit 24 of the BUW battleFlags (dword BUW+0x00) is set. Otherwise F = 1 when **u16 BUW+0x714 (currentAction) >= 0x4000**. Otherwise F = 0 when **u8 BUW+0x6B4 (actionProcessingType) >= 9** or when currentAction == **0x0113** (275, "Dismiss"). Otherwise F = 1. The stub then calls **0x00300140**(BUW, F) and **0x00307D10**(BUW). My inference: these drop the action that Confuse or Berserk forced, and F says whether the current action is cancelled. Bit 24 of the battleFlags is not named in the docs. | L50-55, L67-93 | used-in-code (semantics inferred) |
| Status ids | 0 KO, 1 Stone, 4 Sleep, 5 Confuse, 27 Berserk, 31 X-Zone. This matches the 32-bit status list in live-battle-unit-keep.md. | L41-57 | used-in-code |

## 10. setLevel.lua

Purpose: sets a unit's level and optionally hides the level-up effect.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Game function | **0x0030C650** (RVA 0x1EC650). RCX = keep. EDX = u8 level. R8D = u8 flags. **Flag 0x02 = no visual.** This is **not** 0x0030C470, the function that the Toolkit's "Reset Level & Stats" calls. | L10-13; helpers (1kuWE5ZgzHF09bgYSYztbhLG4VXVMVUkF) L7-12 | used-in-code |
| Args layout | +0x00 u64 keep. +0x08 u8 level. +0x09 u8 flags. | L21-24 | used-in-code |
| Callers | Formulas 323 and 324 call it with flags 0 (visual shown) when formula.level is not -1. | 323 L13; 324 L13 | xref |

## 11. showCombatLog.lua

Purpose: posts a line to the battle combat log, using the game's own message table and its argument substitution.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Game function | **0x0046AB10** (RVA 0x34AB10). RCX = keep pointer (the wrapper passes the caster). EDX = u32 dialog id. R8 = pointer to a parameter block. | L10-13 | used-in-code |
| Args layout | +0x00 u64 RCX value. +0x08 u32 dialog id in a qword slot. **The parameter block starts at +0x10 (0x2C bytes):** +0x00 u64 caster keep, +0x08 u64 target keep, +0x10 u32 gil, +0x14 u32 unknown, +0x18 u32 status id, +0x1C u32 level, +0x20 u32 content id, +0x24 u32 count, +0x28 u32 action id. | L21-32; helpers (1i-uqaUzTKYwE9w9eR648F8KS7BaRyU7a) L2-14 | used-in-code |
| Dialog ids: status | 16 = unit KO'd. 18 = Stone (status 1). 17 = X-Zone (status 31). 62/63 = physical immunity gained/lost. 64/65 = magick immunity gained/lost. 66/67 = status immunity gained/lost. | 327.lua (1ZcwHqyga3IUbVA5CP9dzBxlakIIuUKI_) L7-45; 328.lua (1o68XrbuNaL629CnkYnbciYMhDKktmFyI) | xref |
| Dialog ids: restore | 28 = KO removed. 19 = HP restored (single target). 30 = HP restored (multi-target, initial target only). 20 = HP full (single target). 33 = HP full (multi-target). 21 = MP restored. 22 = MP full. 29 = MP restored when maxMp is 0. 23 = HP and MP both full (single target). 35 = HP and MP both full (multi-target). | 322.lua (1cdo_o6fVq_AMskiCpV8fah2vreexkSGf) L7-69 | xref |
| Dialog ids: status removal | 24 = one negative status removed (status id passed). 25 = several negative statuses removed. 26 = one positive status removed (id passed). 27 = several positive statuses removed. 34 = negative statuses removed (multi-target). 32 = positive statuses removed (multi-target). Positive or negative comes from section 15 flags1.isNegative. | 331.lua (1iMRtq6oHTwaxAHw2EhnDQ9jH2ZC1RAbB) L12-51 | xref |
| Dialog ids: steal and gil | Steal (action 169), outcome 6: 51 = noStealState, 52 = otherwise. Steal success, first line: 46 = count 1, 45 = count > 1, 49 = gil content (0xE000-0xEFFF). Steal success, later lines: 48 = count 1, 47 = count > 1, 50 = gil content. Gil Toss (181): 57 = success, 58 = outcome 6. 54 = Sight Unseeing (175) with outcome 6. 56 = Poach (178) with outcome 6. 61 = shiftState. | 332.lua (1igZhu2mB8f4M9Q9xYXjq06hxyAlUcWg_) L7-66; 261.lua; 329.lua | xref |
| Dialog ids: technicks | Mapping from action id (name) to dialog id: 161 (Stamp) to 39, 162 (Achilles) to 40, 164 (Infuse) to 60, 166 (Wither) to 41, 167 (Addle) to 42, 171 (Expose) to 43, 172 (Shear) to 44, 173 (Charm) to 53, 177 (Libra) to 59, 178 (Poach) to 55, 278 (Fear) to 68, 279 (Fearga) to 69, 281 (Invert) to 72, 319 (Growing Threat) to 70, 324 (Cannibalize) to 73, 325 (Cry for Help) to 74, 383 (Annul) to 71, 416 (Necromancy) to 76, 417 (Divide) to 75, 423 (Charge 2) to 77. These calls pass gil, caster level, content and count. | 333.lua (1JKOONDrufwOE1ewDI7QYieINLiYMJc9p) L7-31; action names from editor_lists BpActionList | xref |
| Message table | A comment in a user mod states that the combat-log dialog table is the st2e at **[0x02EBF018]** (102 entries × 8 bytes). Each 8-byte entry lists the argument **types** that the message uses: 0x01 caster, 0x02 target, 0x03 gil, 0x07 content, 0x08 action, 0x09 count. The text token `0F 31 (0x80+k)` substitutes the k-th declared argument. The type codes do **not** follow the order of the parameter block: the block has count before action. | BlueMagick.lua (1EpHxWu6hr2hc1qMTvwUpoPuo1n-0XJXY) L1322-1336 | comment-only |

## 12. showNumberText.lua

Purpose: pops the floating damage or heal number over a unit.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Game function | **0x003283D0** (RVA 0x2083D0). RCX = **BUW** (callers pass `battleUnitWork.address`). EDX = s32 number. R8D = u8 flag A. R9D = u8 flag B. | L10-14 | used-in-code |
| Args layout | +0x00 u64 BUW. +0x08 s32 number. +0x0C u8 A. +0x0D u8 B. | L22-26 | used-in-code |
| Type mapping | The wrapper type maps to (A, B) as follows: 0 to (0, 1), 1 to (0, 0), 2 to (1, 0), 3 to (1, 1). The callers use **1 = HP damage, 2 = HP heal, 0 = MP loss, 3 = MP gain**. So **A = gain or heal**, and **B = MP rather than HP**. | helpers (1b9FIAKGj07gZJyP_-OKIvpyCB1oHXl2a) L7-17; 323 L58-82 | xref (used-in-code) |

## 13. teleportLocation.lua

Purpose: teleports the party to a location and entrance, with the teleport effect.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Re-entry guard | The private byte `tif_tl_params` is not exported. While it is 1, a second call returns at once. | L11-14, L46, L62-63 | used-in-code |
| Sound | **0x001DBDB0**(ECX = 0, EDX = **0x5F**, R8D = 0x40, R9D = 0x7F) plays the sound effect. The Toolkit names sound 0x5F as the teleport sound. 0x40 and 0x7F are probably volume or pan (inference). | L16-20 | used-in-code |
| Effect and wait | **0x00268690**(ECX = **0x0C**) returns a handle. The stub loops while **0x0036E6B0**(handle) is not 0 and calls **0x005CCB80**(0), a sleep or yield, on each pass. My inference: this starts the teleport fade or effect and waits for it to finish. | L22-35 | used-in-code |
| Teleport | **0x00314440**(ECX = u32 location id, EDX = u32 position index, R8D = **0x0C**, R9D = 0). Formula 321 passes position **-1** (0xFFFFFFFF), which is the default entrance. | L37-44; 321 L29-31 | used-in-code |
| Args layout | +0x00 u32 location id. +0x04 u32 position index. | L56-58; helpers (1EqHYBsY42BgZMOybK-tvoFt5aUlgyg5i) L3-5 | used-in-code |
| Async execution | The wrapper runs the stub with **`memory.executea`**. Because the stub busy-waits, it must not run on the caller's thread. | helpers L6 | xref (used-in-code) |
| Related globals | Formula 321 also writes **u8 [0x021B841A]** = numerology counter and **u32 [0x021B840C]** = traveler counter. The Toolkit gives the current location as [0x021654C4] and the position as [0x021654C8]. | 321 L21-27; insurgents_toolkit_reference.md §4.5 | xref |

## 14. classes/array.lua

Purpose: a small Lua class that gives a typed, bounds-checked, 0-based array view over game memory. The Forge
classes use it for fixed-length fields.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Element sizes | u8 and s8 = 1, u16 and s16 = 2, u32, s32 and float = 4, u64 and s64 = 8 bytes. | L2-12 | used-in-code |
| Access | Element i is read and written through the Lua Loader's typed accessor `memory.<type>[address + i*size]`. Indices are **0-based**. An index outside [0, length) raises an error. So does a non-number index or a non-number value. | L34-57 | used-in-code |
| Rebase | The pseudo-field `address` can be read and reassigned. Classes create arrays at address 0 and rebase them later. | L35-36, L46-47 | used-in-code |
| Length quirk | The `#` operator returns **length - 1**, the last valid index, so loops run from 0 to #arr. `pairs` walks indices 0 to length-1. | L58-63, L14-25 | used-in-code |
| Users | getBattleUnitWork class: reserveTargets = u8 × 5. getArdClass: actions = u16 × 8. getArdUnit: battleLogicIdentifiers = u16 × 4. | 1Q8DJGxsTHGSf44y5A2U_whqim2JJXorH L167; 1rJjWUlDztaIGJA60guO-ULtzkf9Ojc9Q L84; 1vPkCwCoKwBqfoJ6-_boFVddCb1BVrpiM L98 | xref |

---

## Summary: game functions called in this batch

| VA | RVA | Inputs | Output | Name used here |
|---|---|---|---|---|
| 0x001DBDB0 | 0x0BBDB0 | ECX 0, EDX sound id, R8D 0x40, R9D 0x7F | n/a | play sound effect |
| 0x00268690 | 0x148690 | ECX effect type (0x0C) | EAX handle | start effect or fade (inferred) |
| 0x0028F1F0 | 0x16F1F0 | ECX focus id, EDX old, R8D new, R9D 0 = HP / 1 = MP | n/a | gauge update (inferred) |
| 0x002FA540 | 0x1DA540 | RCX BUW | n/a | called after an MP loss (unknown) |
| 0x00300140 | 0x1E0140 | RCX BUW, EDX flag | n/a | Confuse/Berserk end step 1 (inferred) |
| 0x003008A0 | 0x1E08A0 | ECX content id, EDX count, R8D 0, R9D 1, stack 0 | n/a | modify inventory |
| 0x00301140 | 0x1E1140 | RCX BUW | n/a | KO/Stone/X-Zone end (inferred) |
| 0x00306F00 | 0x1E6F00 | RCX BUW | EAX, non-zero = skip KO reaction | KO gate (unknown) |
| 0x00307D10 | 0x1E7D10 | RCX BUW | n/a | Confuse/Berserk end step 2 (inferred) |
| 0x0030B7F0 | 0x1EB7F0 | RCX BUW (may be 0), EDX 0 | EAX, high word non-zero = protected | protection or "god mode" test |
| 0x0030C650 | 0x1EC650 | RCX keep, EDX level, R8D flags (0x02 = no visual) | n/a | set level |
| 0x0030FED0 | 0x1EFED0 | RCX keep, EDX selector (0 here, 0x97 elsewhere) | n/a | refresh stats |
| 0x00314440 | 0x1F4440 | ECX location, EDX position (-1 = default), R8D 0x0C, R9D 0 | n/a | teleport |
| 0x00316A50 | 0x1F6A50 | ECX figure id, EDX delta | n/a | Sky Pirate's Den stat (3 = steals) |
| 0x0031B860 | 0x1FB860 | RCX keep | RAX BUW | BUW from keep |
| 0x003283D0 | 0x2083D0 | RCX BUW, EDX number, R8D gain, R9D isMp | n/a | floating number text |
| 0x003299B0 | 0x2099B0 | RCX BUW, EDX reaction id, R8D source focus id | n/a | queue reaction animation |
| 0x0032A150 | 0x20A150 | none | EAX tick value | time or tick counter (inferred) |
| 0x0032A7F0 | 0x20A7F0 | ECX gil delta | n/a | modify gil |
| 0x0036E6B0 | 0x24E6B0 | ECX handle | EAX, non-zero = still running | effect busy test (inferred) |
| 0x0046AB10 | 0x34AB10 | RCX keep, EDX dialog id, R8 param block* | n/a | combat log message |
| 0x005CCB80 | 0x4ACB80 | ECX ms (0 = yield) | n/a | sleep |

Reaction ids for 0x003299B0: 0x2001 = wake from Sleep. 0x2005 = hit. 0x2006 = hit with knockback. 0x2007 = KO with
knockback. 0x2008 = KO. 0x200E = instant or alternative KO.

Globals and constants: qword [0x02EBF040] = battlepack section 58 (augments) st2e header (RVA 0x2D9F040).
f32 [0x01DFE0B8] × f32 [0x008F8D80] = tick divisor for the foe death time (values unknown, RVAs 0x1CDE0B8 and 0x7D8D80).
[0x02EBF018] = combat-log dialog table (comment only, from BlueMagick).

Fields confirmed by this batch:
* keep: +0x05 type (1 = foe), +0x06 mistCharges s16, +0x24 maxHp s32, +0x28 maxMp s16, +0x37 maxMistBars u8,
  +0x3C permanent status, +0x48 currentHp s32, +0x4C currentMp s16, +0x4E currentMistBars u8, +0x64 temporary status,
  +0x68 temporary augments (128 bits), +0x6C bit 7 / +0x7C bit 7 = Emptiness (augment 39), +0xBC + 4i status duration,
  +0x13C + 2i status tick, +0x17C + 2s augment timer slot.
* BUW: +0x00 battleFlags (bit 24 used by the Confuse/Berserk path), +0x08 focus id, +0x30 KO caster focus id,
  +0x48 hpLowLimit, +0x6A0 keep-plus pointer, +0x6B4 actionProcessingType, +0x714 currentAction.
* keep-plus: +0x08 currentDeathCount u16, +0x0C deathTime u32.

## Editor relevance

* **Lua or Cheat Engine memory editor:** these stubs are a ready catalogue of safe game entry points for HP, MP and
  Mist edits that keep gauges, Disease, Bubble, Emptiness and the HP floor consistent. They also cover inventory and
  gil changes, level changes without the visual, stat refresh, status and augment removal with timer cleanup, the
  floating numbers, combat-log lines and teleport. A memory editor can reproduce the clamping rules exactly. For
  example, the Mist cap is maxMp × maxMistBars and the bar count is charges / maxMp.
* **Offline editors:** [0x02EBF040] confirms that section 58 `timerSlot` (+0x06) decides whether an augment is
  timed and removable. The combat-log ids and the action-to-dialog map tell a text editor which message entries
  belong to which technick. The content-id rule (gil = 0xE000 + amount) is confirmed again.
