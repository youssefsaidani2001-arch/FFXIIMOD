# Drive batch 18: The Insurgent's Bountiful Bundle (TIBB), Options part 1 (14 cheat options)

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR.
Addresses are the absolute VAs that the Lua Loader scripts use. RVA = VA - 0x120000.

| # | Drive id | Title | Drive path | Bytes | Status |
|---|---|---|---|---|---|
| 1 | 1yrY5VwfQBuhCbKQcRrWQjycb69xw4Exc | AlwaysChain.lua | My Laptop/scripts/TheInsurgentsBountifulBundle/Options | 432 | read in full |
| 2 | 18iSBA9wKE-mHSBhefXCk-1x7F9jXNvFL | AlwaysSpawnRareGame.lua | same | 867 | read in full |
| 3 | 1B_fYnpuLER3DD1hou3mqLyxGHxMNGWxl | AlwaysStealEverything.lua | same | 796 | read in full |
| 4 | 1WrROYgAVlOW3xrVfSNACtRjCokxby6Jr | AutoLoot.lua | same | 271 | read in full |
| 5 | 15fBClkp6Ny-adUVQJxaMOLNRo68amTcD | ExpMultiplier.lua | same | 772 | read in full |
| 6 | 1xavFxUl3SRScQ38uBoFCoZsbyALDfC2y | FoesDropAllItems.lua | same | 538 | read in full |
| 7 | 10jZb3gUs_PQPOGZdhllTKMQBUIiUEmpt | FoesRespawnOnSight.lua | same | 312 | read in full |
| 8 | 1XUsSwDjH76N7ZkhzJGzzsWNXxqYunOGG | FullyRevealedMaps.lua | same | 1,386 | read in full |
| 9 | 1yKybhPgTy7nCjLBdHDPLo-cRgIgerF0J | GodMode.lua | same | 268 | read in full |
| 10 | 1p2pzAn9it9J7Gv-TU7-s-xfT088bPBzy | InfiniteChocoboTime.lua | same | 543 | read in full |
| 11 | 1n6_NVWheHevzaESc4y-2ZI-8Ycvv-uiU | InfiniteSummonTime.lua | same | 407 | read in full |
| 12 | 1NLJpFNQ6R6JS9tdtIz1r7U_xIr2ttANJ | LpMultiplier.lua | same | 746 | read in full |
| 13 | 1gyuEw83rz5Jd4rZjdWuNyj-ddHMwAl24 | NoAntiLibra.lua | same | 306 | read in full |
| 14 | 1kRvAJEdhShpT-iKtG74Ks3F7ZxRe5Co6 | NoMagickFields.lua | same | 1,387 | read in full |

No file is missing.

Author: Xeavin (The Insurgent's mods, personal use only). I record facts only, in my own words. I do not copy code.
I decoded the original instruction bytes and worked out the RIP-relative and branch targets myself.

Evidence key:
* **byte-check-in-code**: the code compares the original bytes before it patches. **No file in this batch does this
  (see the note below).**
* **used-in-code**: the code patches, reads, writes or calls the address.
* **comment-only**: only a comment says so. These files have no comments.
* **unclear**: my inference from the decoded instruction, the shape of the patch, or a cross-reference. It is not proven.

## 0. Shared facts: the option-file format and how TIBB applies it

Each file returns one *option* table. The bundle's main script (`TheInsurgentsBountifulBundle.lua`, not in this
batch) loads the options with `dofile`. I read the main script and its JSON config only to explain how the fields
are used (xref).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Option table fields | `id` (camelCase key, also the config key and the mod-menu field prefix), `name` (display text), `state` (default false), `patches` (array), optional `parameter` | every file L1-L5 | used-in-code |
| Patch entry fields | `target` = absolute VA to overwrite. `originalBytes` = vanilla bytes at that VA. `patchCode` = asm text assembled in place at `target`. Optional `blockCode` + `symbols` = a code cave assembled into newly allocated executable memory. Its labels are exported as global symbols, and `%label%` in `patchCode` refers to one | every file | used-in-code (main L35-L51, xref) |
| Parameter entry | `{symbol, value, min, max}`. `symbol` names a 4-byte float slot inside the cave. On enable, TIBB writes `value` as a float to the symbol's address. On disable it reads the float back. Slider changes write it live | ExpMultiplier L33-L38, LpMultiplier L32-L37 | used-in-code (main L42-L45, L57-L60, L161-L167, xref) |
| **originalBytes are not verified** | TIBB never compares `originalBytes` with memory before it patches. It only writes them back on disable (`memory.writeArray`). A wrong game build would be patched blindly. An editor that reuses these sites should check the bytes first | n/a | used-in-code (main L47-L51, L62-L66, xref) |
| Enable order | 1) assemble every cave (`memory.assemble(blockCode, symbols)`), 2) set the float parameter, 3) assemble each `patchCode` at its target. Disable: save the parameter, restore the bytes, unregister the symbols, free each cave (`deallocExe`) | main L32-L78 (xref) | used-in-code |
| Assembler dialect | The Lua Loader assembler accepts `nop N` (N bytes of padding), `je short`, absolute `[0x...]` memory operands (encoded RIP-relative, so caves must be within 2 GB), absolute `jmp/je 0x...` targets, `.align 0x10`, `.dd` data, and `%symbol%` substitution | all files | used-in-code |
| Flag-forcing idioms | Xeavin uses two 2-byte replacements. `test esp,esp` replaces `test eax,eax`: ZF is always 0 (esp is never 0), so the "non-zero / true" branch is always taken. `cmp eax,eax` replaces a `cmp`/`test`: ZF is always 1, so the "equal / zero / bit clear" branch is always taken | all files | used-in-code |
| Config file | `<config.path>/TheInsurgentsBountifulBundleConfig.json`: `{ "<option id>": { "state": bool, "parameter": number } }`. Parameters are clamped to [min, max] on load and on save | main L85-L147; config json (xref) | used-in-code |
| Mod menu | Fields are named `<id>State` (toggle; **0 = on, 1 = off**) and `<id>Parameter` (float slider, active only while the option is on). The flag `tibb_reset_options` with cause 4 resets every row to its schema default | main L149-L225 (xref) | used-in-code |
| Loader version | Lua Loader 1.10.4 or newer is required | main L242-L246 (xref) | used-in-code |

---

## 1. `AlwaysChain.lua`

**Purpose.** Every defeated foe counts toward the current chain, whatever its type. Two compares in the chain-update
code are forced to "equal".

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Option id | `alwaysChain`, no parameter | L2 | used-in-code |
| Patch 1 site | VA 0x00317F25 (RVA 0x1F7F25). Original 3B C1 = `cmp eax,ecx`. Replaced by a 2-byte compare that always gives ZF=1 | L7-L11 | used-in-code |
| Patch 2 site | VA 0x00317F7B (RVA 0x1F7F7B). Original 3B 0D EB B1 FA 01 = `cmp ecx, dword [rip+0x01FAB1EB]`. The operand resolves to **0x022C316C** (next ip 0x00317F81). Replaced by the always-equal compare plus a 4-byte nop (6 bytes) | L13-L19 | used-in-code |
| Global 0x022C316C | A dword inside the battle chain block 0x022C3158-0x022C3178 (toolkit reference). The listed field order is: chain level, normal count, identical-foe count, reverse count, foe genus, foe chain id, last chain-level count, loot count, flashing bit. With 4-byte fields, +0x14 (0x022C316C) is the **current chain's foe chain identifier** and 0x022C3168 is the foe genus. The patch compares it with the defeated foe's id in ecx, which fits | L15 | unclear (xref insurgents_toolkit_reference.md L517) |
| Patch 1 meaning | It is probably the first identity check, such as genus or chain id, between the defeated foe and the chain foe. It sits 0x56 bytes before patch 2 in the same routine | L7 | unclear |
| Related data | The ARD class record has a chain identifier at +0x40 and a no-chain flag at +0x28 (batch_01). These are the values the chain code compares | n/a | unclear (xref) |

---

## 2. `AlwaysSpawnRareGame.lua`

**Purpose.** Rare-game spawn checks always pass, except in five locations where they always fail.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Option id | `alwaysSpawnRareGame`, no parameter | L2 | used-in-code |
| Hook site | VA 0x003504B9 (RVA 0x2304B9). Original E8 72 CF E2 FF = `call 0x0017D430` (RVA 0x5D430). The call is redirected to the cave `asrg_code` (5 bytes) | L7-L11 | used-in-code |
| Vanilla callee | 0x0017D430 is the rare-game spawn condition or chance check. It returns a boolean in eax. The cave **never calls it**, so any side effects of the vanilla check are skipped | L8 | unclear |
| Cave logic | It reads a dword count N, then N dword location ids. It loads the current location id (u32 at **0x021654C4**) and scans the list from the last entry to the first. A match returns eax=0 (no spawn). Otherwise, or when N=0, it returns eax=1 (spawn) | L13-L35 | used-in-code |
| Exclusion list | N = 5. Location ids 0x85 (133), 0x89 (137), 0xF7 (247), 0x386 (902), 0x387 (903). In these maps rare game will **never** spawn while the option is on, because the vanilla check is not consulted | L39-L41 | used-in-code |
| Global 0x021654C4 | Current location (map) id, u32 (matches batch_01, batch_05, batch_12) | L20 | used-in-code |
| Param block layout | 16-byte aligned. +0x00 dword count, +0x04.. dword ids. Entry i (1-based) is at +i*4. An editor could add more maps here with no code change | L38-L41 | used-in-code |
| Exported symbol | `asrg_code` | L43 | used-in-code |

---

## 3. `AlwaysStealEverything.lua`

**Purpose.** One successful Steal takes every tier (common, uncommon, rare) that the foe has, not one rolled tier.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Option id | `alwaysStealEverything`, no parameter | L2 | used-in-code |
| Hook site | VA 0x003904A9 (RVA 0x2704A9). Original 0F 84 F0 00 00 00 = `je 0x0039059F`. Replaced by a 5-byte `jmp` to cave `ase_code` plus a 1-byte nop. The vanilla conditional branch is dropped | L7-L12 | used-in-code |
| Steal-state flags | Three bytes at **0x02AEE04C / +1 / +2** = common / uncommon / rare "stolen" flags. The cave writes 1 into each tier the foe has. This fits the "Common/Uncommon/Rare steal state" fields of the Formula Processing Properties block (base 0x02AEDFB8, so +0x94..+0x96). The toolkit reference gives the block's end as 0x02AEE030, so the offset is outside its stated range | L15, L21, L27, L33 | used-in-code (identity unclear; xref insurgents_toolkit_reference.md L1311) |
| Foe steal items (rdi) | rdi points to a record with three u16 steal items at **+0x32 (common), +0x34 (uncommon), +0x36 (rare)**. This matches the ARD section-4 unit layout (steals +0x32-0x36; drops +0x28-0x30) | L18, L24, L30 | used-in-code (record identity: xref batch_01 L214) |
| "Empty" test | Each item word is compared with bp, the low 16 bits of rbp. Equal means the tier is skipped. So rbp holds the routine's "no item" value, probably 0 or 0xFFFF. The value is not visible here | L18-L31 | unclear |
| Exit | The cave always continues at **0x0039058A** (RVA 0x27058A), the vanilla code that awards the flagged tiers. 0x0039058A is 0x15 bytes before the original `je` target | L36 | used-in-code |
| Exported symbol | `ase_code` | L38 | used-in-code |

---

## 4. `AutoLoot.lua`

**Purpose.** Loot is picked up without walking onto it. A float distance compare is forced to one result.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Option id | `autoLoot`, no parameter | L2 | used-in-code |
| Patch site | VA 0x002FB209 (RVA 0x1DB209). Original 0F 2F F0 = `comiss xmm6,xmm0` (3 bytes). Replaced by `test esp,esp` + 1-byte nop | L7-L11 | used-in-code |
| Effect | After the test, CF=0 and ZF=0, which a following `ja`/`jbe` reads as "xmm6 > xmm0". It is probably the loot-pickup radius versus distance compare, made to pass at any distance | L9-L11 | unclear |

---

## 5. `ExpMultiplier.lua`

**Purpose.** Multiplies the EXP each character gets by a user float from 1.0 to 10.0.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Option id | `expMultiplier`. Parameter symbol `expm_mul`, default 1.0, min 1.0, max 10.0. Slider in the mod menu | L2, L33-L38 | used-in-code |
| Hook site | VA 0x002F8D21 (RVA 0x1D8D21). Original 48 85 FF 74 1C = `test rdi,rdi` + `je 0x002F8D42`. Replaced by a 5-byte `jmp` to cave `expm_code` | L7-L11 | used-in-code |
| EXP register | At this point **esi = the EXP amount** (signed int). The cave converts it to float, multiplies by `expm_mul`, converts back with round-to-nearest (cvtps2dq), and stores the result in esi. There is no overflow clamp | L14-L19 | used-in-code |
| Resume | The cave repeats the displaced test of rdi. If zero it goes to 0x002F8D42, otherwise to 0x002F8D26. rdi is a pointer (probably the receiving unit) | L21-L23 | used-in-code |
| Float slot | `expm_mul` is a 16-byte-aligned dword in the cave, starting as 0x3F800000 (1.0f). TIBB overwrites it on enable | L26-L28 | used-in-code |
| Related | Battle Unit Keep +0x18C holds EXP (batch_01). The Double EXP augment is id 27 (batch_10) | n/a | unclear (xref) |

---

## 6. `FoesDropAllItems.lua`

**Purpose.** Defeated foes drop every loot tier. Three drop-roll results are forced to "success".

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Option id | `foesDropAllItems`, no parameter | L2 | used-in-code |
| Sites | VA 0x00318208, 0x0031824E, 0x00318276 (RVA 0x1F8208 / 0x1F824E / 0x1F8276). Each original is 85 C0 = `test eax,eax` and becomes `test esp,esp` (always non-zero) | L7-L26 | used-in-code |
| Meaning | Each site follows a roll that returns success in eax. ARD units have five drop tiers at +0x28..+0x30 (common, uncommon, rare, very rare, guaranteed). Which three rolls these are is not shown | L7-L26 | unclear |
| Code area | 0x003181xx-0x003182xx is right after the chain code at 0x00317Fxx (AlwaysChain). It is the defeat/loot routine | n/a | unclear |

---

## 7. `FoesRespawnOnSight.lua`

**Purpose.** Defeated foes come back as soon as they are out of view. The respawn condition block is skipped.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Option id | `foesRespawnOnSight`, no parameter | L2 | used-in-code |
| Patch site | VA 0x002358A1 (RVA 0x1158A1). Original 41 0F B7 46 0A = `movzx eax, word [r14+0x0A]` (5 bytes). Replaced by a 2-byte short `jmp 0x002358DD` (disp 0x3A) + 3-byte nop. 0x3C bytes are skipped | L7-L12 | used-in-code |
| r14 record | r14 points to a spawn or foe-state record whose u16 at +0x0A feeds the skipped respawn test, such as a required zone-change count or a timer. The toolkit's Battle Unit Keep Plus lists Current/Max Death Count, Death Time and Respawn Time | L8 | unclear (xref insurgents_toolkit_reference.md L697) |

---

## 8. `FullyRevealedMaps.lua`

**Purpose.** Every map area is shown as explored, on the minimap and in the map menu.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Option id | `fullyRevealedMaps`, no parameter | L2 | used-in-code |
| Boolean-forcing sites | Eight sites, each `test eax,eax` (85 C0) changed to `test esp,esp`: VA 0x0025442B, 0x003BCBD9, 0x003BCE0E, 0x003C0728, 0x003C0F93, 0x003C1301, 0x003C18FC, 0x003C2509 (RVA 0x13442B, 0x29CBD9, 0x29CE0E, 0x2A0728, 0x2A0F93, 0x2A1301, 0x2A18FC, 0x2A2509). Each caller treats its "is revealed/visited" result as true | L7-L54, L63-L68 | used-in-code |
| Query function stub | VA **0x00255168** (RVA 0x135168). Original 44 0F AF 44 24 30 = `imul r8d, dword [rsp+0x30]` (6 bytes). Replaced by "return 1" (`mov eax,1` + `ret`, 6 bytes) | L55-L61 | used-in-code |
| Why a `ret` is safe there | `ret` is only valid at function entry, so 0x00255168 is a function start. At entry [rsp+0x30] is the 6th argument, so the function multiplies arg3 by arg6, likely a row*width cell index into a reveal bitmap. With the patch every cell reads as revealed | L57 | unclear |
| Code areas | 0x00254xxx-0x00255xxx = map/minimap reveal logic. 0x003BCxxx-0x003C2xxx = map-menu UI | n/a | unclear |
| Related save data | The CT's SgeMapRevealList (385 entries) is the persistent reveal state. This patch only changes the run-time result, not the save | n/a | unclear (xref toolkit L778) |

---

## 9. `GodMode.lua`

**Purpose.** Party invulnerability through one compare.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Option id | `godMode`, no parameter | L2 | used-in-code |
| Patch site | VA 0x0030B888 (RVA 0x1EB888). Original 83 F8 01 = `cmp eax,1` (3 bytes). Replaced by the always-equal compare + 1-byte nop | L7-L12 | used-in-code |
| Possible link to the debug switch | The developer debug block (ds_base 0x01F81428, +0xC20 God Mode: 0 None, 1 Party, 2 All) has value 1 = Party. If eax at this site is that setting, forcing "== 1" turns on the built-in party god mode. The decoded compare fits this, but it is not proven | L8 | unclear (xref insurgents_toolkit_reference.md L1482; batch_01 L185) |

---

## 10. `InfiniteChocoboTime.lua`

**Purpose.** The chocobo ride timer never runs out.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Option id | `infiniteChocoboTime`, no parameter | L2 | used-in-code |
| Sites | VA 0x00303FD2, 0x0030445D, 0x003044C2 (RVA 0x1E3FD2 / 0x1E445D / 0x1E44C2). Each `test eax,eax` (85 C0) becomes `test esp,esp` (non-zero branch always taken) | L7-L26 | used-in-code |
| Related global | [0x021B8410] bit 1 = chocobo summoned, bit 0 = esper summoned (batch_01, toolkit). This is the state the timer code guards | n/a | unclear (xref) |

---

## 11. `InfiniteSummonTime.lua`

**Purpose.** A summoned esper never times out.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Option id | `infiniteSummonTime`, no parameter | L2 | used-in-code |
| Sites | VA 0x00313779, 0x003137BE (RVA 0x1F3779 / 0x1F37BE). Each `test eax,eax` becomes `test esp,esp` | L7-L19 | used-in-code |
| Related data | Party-member record (battlepack section 16) +0x32 = summon time. Gambit group 0x44/0x45 = esper duration. Espers are party ids 27-39 (batch_01) | n/a | unclear (xref) |

---

## 12. `LpMultiplier.lua`

**Purpose.** Multiplies the LP each character gets by a user float from 1.0 to 10.0.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Option id | `lpMultiplier`. Parameter symbol `lpm_mul`, default 1.0, range 1.0-10.0 | L2, L32-L37 | used-in-code |
| Hook site | VA 0x002F915B (RVA 0x1D915B). Original 48 8B 5C 24 30 = `mov rbx, qword [rsp+0x30]` (the epilogue's rbx restore). Replaced by a 5-byte `jmp` to cave `lpm_code` | L7-L11 | used-in-code |
| LP register | The cave reads the LP amount from **edx**, scales it by `lpm_mul` (int to float to int, round-to-nearest), and puts the result in **eax**, the function's return value. It then redoes the rbx restore and resumes at 0x002F9160 | L14-L22 | used-in-code |
| Function role | The routine ending at 0x002F9160 returns the LP to award. The cave assumes eax should equal edx here | L19-L22 | unclear |
| Related | Battle Unit Keep +0x190 = LP. Augment 28 = Double LP | n/a | unclear (xref) |

---

## 13. `NoAntiLibra.lua`

**Purpose.** Foes with the Anti-Libra augment can still be scanned by Libra.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Option id | `noAntiLibra`, no parameter | L2 | used-in-code |
| Patch site | VA 0x002BFFAA (RVA 0x19FFAA). Original F6 87 11 01 00 00 02 = `test byte [rdi+0x111], 0x02` (7 bytes). Replaced by the always-ZF=1 compare + 5-byte nop, so the bit always reads as clear | L7-L12 | used-in-code |
| Anti-Libra bit | Byte +0x111 bit 1 (mask 0x02) of the unit structure in rdi = Anti-Libra | L8 | used-in-code |
| Augment bitfield (derived) | Anti-Libra is augment id **41** (batch_10/16). 41 = byte 5, bit 1, which gives mask 0x02 at +0x111 only if the unit's augment bitfield starts at **rdi+0x10C** (byte = id>>3, bit = id&7). The match is exact, so a memory editor can test augment n at [unit+0x10C + n/8] bit n%8. The struct type in rdi is not named in this file | L8 | unclear (strong arithmetic fit) |

---

## 14. `NoMagickFields.lua`

**Purpose.** Turns off the area restrictions "No Magicks", "No Technicks" and "No Items", plus two more
field-state checks.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Option id | `noMagickFields`, no parameter | L2 | used-in-code |
| Global byte | Four sites test bits of **0x022C314C** (RVA 0x21A314C) with RIP-relative `test byte [rip+d], imm8` (F6 05 d32 ib, 7 bytes). Each is replaced by the always-ZF=1 compare + 5-byte nop, so the bit reads as clear | L21-L51 | used-in-code |
| Bit sites | 0x00318D2A tests 0x08 (disp 0x01FAA41B). 0x00318DDA tests 0x08 (disp 0x01FAA36B). 0x00318E50 tests 0x10 (disp 0x01FAA2F5). 0x00318EA8 tests 0x20 (disp 0x01FAA29D). All four resolve to 0x022C314C | L21-L51 | used-in-code |
| Bit meanings | The toolkit reference names 0x022C314C "Magick Field Flags": bit0 HP Sap, bit1 MP Sap, bit2 No Attacks, **bit3 (0x08) No Magicks**, **bit4 (0x10) No Technicks**, **bit5 (0x20) No Items**, bit6 Magnet. So the mod clears No Magicks (twice), No Technicks and No Items. It leaves the sap, no-attack and magnet bits alone | L22, L30, L38, L46 | unclear (xref insurgents_toolkit_reference.md L521) |
| Other sites | VA 0x002F9C6E, 0x002FFE8C, 0x00385CD6, 0x00385D74 (RVA 0x1D9C6E, 0x1DFE8C, 0x265CD6, 0x265D74). Each `test eax,eax` becomes the always-ZF=1 compare, so the zero / "no restriction" branch is taken. These are probably helper results such as "is the field active", for example a menu greying check at 0x00385Cxx | L7-L19, L52-L64 | used-in-code (meaning unclear) |
| Neighbour | 0x022C314C is 0x0C bytes before the chain block (0x022C3158), in the same battle-global area as AlwaysChain's 0x022C316C | n/a | unclear |

---

## Summary for editor builders

* **Memory editor or Cheat Engine globals** found or confirmed here:
  * 0x021654C4: current location id.
  * 0x022C314C: magick-field flag bits.
  * 0x022C316C: chain foe id, inside the chain block 0x022C3158-0x022C3178.
  * 0x02AEE04C..4E: steal-tier stolen flags.
* **Struct offsets:**
  * ARD unit steals are u16 at +0x32/+0x34/+0x36.
  * The unit's Anti-Libra bit is at +0x111 (mask 0x02). From that, the augment bitfield starts at +0x10C.
  * In the respawn code, a spawn record holds a u16 at +0x0A.
* **Code patch catalogue** (35 patch sites across 14 options; 4 of them are cave hooks: rare game, steal, EXP, LP):
  * Every site lists its vanilla bytes, so an editor can show "patched / vanilla / unknown" by reading the bytes back.
  * Unlike TIBB itself, an editor should **verify** these bytes before it writes.
* **Two float caves** (EXP: esi; LP: edx to eax) are clean multiply hooks. An editor can recreate them with any factor.
* **Missing from this batch:** the other 7 TIBB options (PeacefulMode, OneHitKill, PartyMovementSpeedMultiplier,
  QuickRespawn, UnlimitedStealableFoeItems, NoMinimapInterference, UnlimitedQuickeningChains) and ModMenu.lua. They
  are listed by the main script but are not part of this batch's file list.
