# Drive batch 04: overlay RE tools, loader configs, BlueMagick spell data

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR.

All 14 files in this batch were present locally, and I read each one in full.

| Drive id | Title | Drive path | Lines |
|---|---|---|---|
| 17ImioluOXY6kGNhcHFS6AzzI7KvLmEAY | extract_tex.py | My Laptop/ffxii modding/ffxii-overlay | 25 |
| 1ytwyDzyvby23yQD4abSdRTZNSjecoveu | find_ui.py | same | 34 |
| 1rW729zbHTyWY5XT6338b_AleZv6cuuwB | list_menu.py | same | 29 |
| 13j0mKw5KsY174v0-bEOnixkotD1PSW48 | manifest.py | same | 48 |
| 1WSnOL0jwOheq3o9M0DiwTYtwirGVDQrH | montage.py | same | 26 |
| 1WmWO-NU_75ZBx3qMOZqZI8lhL5JoX_Ui | overlay.log | same | 4 |
| 1XVeJx5lnJUBN31IaV3VPbRy9UwrkPf6S | parse_ct.py | same | 51 |
| 1LTHEf-WOUyTspVyfr7YvZYyWVhPIJaw8 | process_outline.py | same | 15 |
| 1Uv5Mdr28dGVagB5_tgM6F0S2Gi1A-C20 | texlist.txt | same | 11 |
| 1x5RemCuPkd0JrPusTR-d1VDhAsMpREJa | ff12-file-loader.ini | My Laptop/modules/config | 12 |
| 1MHs9YVa15V8ouFxR1HtuxMbjUHNjpX9i | ff12-lua-loader.ini | My Laptop/modules/config | 30 |
| 1bGuIxR57IKkyxphi5kksaihjEWR2jeQa | ff12-tkmalloc.ini | My Laptop/modules/config | 5 |
| 1L9g93jGf5IMTItkZIGOk_coaCGtY69Vh | spells_black.lua | My Laptop/scripts/BlueMagick | 44 |
| 1_zzPYb5A9kxHMTkxllGZGCNQ2lau-07G | spells_blue.lua | My Laptop/scripts/BlueMagick | 625 |

**Referenced but not in this batch:**
- `vbf.py`, the user's VBF module. It provides `HEADER`, `extract(path)` and `all_names()`, and several tools here import it.
- `BlueMagick.lua`, which owns all the machinery the two spell files feed: the magickRow/tuneAction writers, writeHelpTexts, the poll, the bag and the gambit grid. Its constants `K.VANILLA_MAG`, `K.ACTION_PATCH`, `K.ACID_POOL` and `K.DARKSHOCK_POOL` are defined there.

**Not present in this batch:** BlueMagick.lua itself, DescriptiveInventory, DynamicDescription, HudColors, CharacterHealthbarColors, ScalableFoes, LuckyLoot, StatLores, Forge, ChainBenefits, SummonProbe, FFXIIEditorCaps/Data, Wayfarer, Dialogs and ModMenu. No game code addresses, byte checks or `memory.execute` calls appear in these 14 files.

**Licensing.** BlueMagick (spells_*.lua) appears to be the user's own work: it mentions "this install" and a 2026-08-31 change. The configs belong to the Lua/File Loader plugins. Everything below is written in my own words as facts (ids, offsets, values). No code was copied.

**Evidence key:**
- **byte-check-in-code**: the code verifies the original bytes before patching.
- **used-in-code**: the code or data reads or writes the value. For the spell files, this means the data row feeds a byte write into the action record at that offset.
- **comment-only**: only a comment or log line states it.
- **unclear**: an inference that this batch cannot confirm.

Cross-references: action-record (battlepack s14, 0x3C bytes) field names and bit masks follow `docs/formats/battlepack-s14-actions.md`. Section 29 follows `docs/formats/battlepack-s29-magicks.md`, and TIM2 follows `docs/formats/tim2.md`. Every spell offset below decodes consistently against those docs, except where a row says otherwise.

---

## 1. extract_tex.py

**Purpose:** pulls 12 menu textures out of the VBF through the user's `vbf.extract()`, saves them as `.tm2` and prints each TIM2 picture header.

| Topic | Detail | Source | Evidence |
|---|---|---|---|
| VBF path of PS2-era menu textures | `ps2data/image/ff12/myoshiok/us/tm2_menu/<name>.tm2` (language folder `us`) | L7, L11 | used-in-code |
| Menu texture names | w_win_c, w_main0, w_main1, w_line01, w_line02, w_shade_p, lic_8_c, lic_bk, lic_over, hand_4_c, maru_c, cm2_win_c | L8 | used-in-code |
| TIM2 file header | Magic is the 4 ASCII bytes `TIM2` at 0x00. The first picture header starts at 0x10. | L15-L18 | used-in-code |
| TIM2 picture header fields (relative to 0x10) | +0x0E u16 clutColors; +0x10 u8 picture format; +0x11 u8 mipmap count; +0x12 u8 clutType; +0x13 u8 imageType; +0x14 u16 width; +0x16 u16 height. Little endian. This matches the repo's tim2.md. | L19-L22 | used-in-code |
| Workflow | The local output folder `ffxii-overlay\tex` feeds montage.py, which reads `.png` versions, so a TM2-to-PNG conversion step happens outside this batch. | L5, montage L20 | used-in-code |

## 2. find_ui.py

**Purpose:** finds the game's `.vbf` file, reads the raw name table straight from fixed file offsets, prints an extension histogram and searches the names for UI keywords.

| Topic | Detail | Source | Evidence |
|---|---|---|---|
| Install roots searched | `C:\Games\Final Fantasy XII - The Zodiac Age` and the Steam path `...\steamapps\common\FINAL FANTASY XII THE ZODIAC AGE`. Any `*.vbf` is found by recursive glob. | L4-L8 | used-in-code |
| VBF magic | The first 4 bytes are read as the magic. The repo's vbf.js gives the value `SRYK`. | L15 | used-in-code |
| VBF name-table size (this archive) | u32 LE at absolute file offset **0x417CA0** | L16-L17 | used-in-code |
| VBF name table start (this archive) | Absolute **0x417CA4**: NUL-separated paths, decoded as latin1 | L13, L18-L21 | used-in-code |
| Name search keywords | menu, window, waku (frame), frame, hud, job, license, gambit, haichi, wheel, board, ui | L29 | used-in-code |
| Caveat | These offsets are hard-coded for one VBF build. A robust editor derives them from the header: entries = 0x10 + count*16, and names = entries + count*0x20 + 4. | L13, L16 | used-in-code |

## 3. list_menu.py

**Purpose:** lists `.tm2` files, counts the subfolders of the PC art folder and prints UI-like texture names, using `vbf.all_names()`.

| Topic | Detail | Source | Evidence |
|---|---|---|---|
| PC art folder prefix | `gamedata/d3d11/artdata/<subfolder>/...`. The script counts the first path component after the prefix. | L14-L16 | used-in-code |
| Texture extensions in the VBF | `.tm2`, `.dds.phyre`, `.gtf`, `.txb`, `.tga` | L20 | used-in-code |
| Map textures | Paths containing `/map/` are excluded as non-UI | L25 | used-in-code |
| UI name hints | win, wnd, waku, wku, cursor, base, _bg, frame, line, help, list, select, name, ket, moji (moji = text glyphs) | L19 | used-in-code |

## 4. manifest.py

**Purpose:** walks every VBF entry using fixed header offsets and writes `path<TAB>size<TAB>offset` to `extracted\manifest.tsv`, with per-extension and top-level-directory counts.

| Topic | Detail | Source | Evidence |
|---|---|---|---|
| VBF entry table start (this archive) | **0x15D440**. Each entry is **0x20** bytes. | L6-L7 | used-in-code |
| Entry field +0x08 | u64 file size. The script labels it "compressed-size-in-archive" in a print, but repo vbf.js treats +0x08 as the **uncompressed** size, so the label is probably wrong. | L22, L43 | used-in-code |
| Entry field +0x10 | u64 absolute data offset of the file's first block | L23 | used-in-code |
| Entry field +0x18 | u64 name offset relative to the name-table start (0x417CA4) | L24-L25 | used-in-code |
| Name table length | **0x5852F6** (5,788,406) bytes. The name table ends, and the block table starts, at **0x99CF9A**. | L9 | used-in-code |
| File count | The script computes N = (0x417CA4 - 0x15D440) // 0x20 = **89,411** (0x15D43). This equals (0x15D440 - 0x10)/16, so the 16-byte MD5 hash table holds the same count. | L10 | used-in-code (count derived) |
| Path encoding | latin1, NUL-terminated; entries with an empty name or an out-of-range name offset are skipped | L26-L31 | used-in-code |

## 5. montage.py

**Purpose:** builds a labelled 3-column PNG reference sheet of six menu textures on a checkerboard (Pillow).

| Topic | Detail | Source | Evidence |
|---|---|---|---|
| What each texture is for (the user's labels) | w_win_c = menu row bars; cm2_win_c = slot frame; w_line01 = border line; lic_over = license-board cursor; maru_c = circle; w_shade_p = backdrop for the wheel/radial menu | L5-L6 | comment-only (labels) |

## 6. overlay.log

**Purpose:** run log of the user's own D3D overlay DLL ("overlay-f").

| Topic | Detail | Source | Evidence |
|---|---|---|---|
| Overlay hook approach | A setup thread starts, then the swapchain **Present** is hooked. Init reports a window handle, a TTF font and "bar=ok". This points to a D3D11 Present-hook overlay that draws HUD bars. | L1-L4 | comment-only (log) |

## 7. parse_ct.py

**Purpose:** parses a Cheat Engine table (the Insurgent's Toolkit) into an indented outline file, `toolkit_structure.txt`.

| Topic | Detail | Source | Evidence |
|---|---|---|---|
| CE .CT XML schema used | Root `CheatEntries`, then `CheatEntry` elements with `Description`, `Address`, `VariableType`, optional `AssemblerScript` and a nested `CheatEntries` (group) | L12-L26 | used-in-code |
| Entry classification | Group = has child CheatEntries. Script = has AssemblerScript. Address row = has Address. Header = none of these. | L28-L35 | used-in-code |
| Selection | Picks the `*.CT` file in `C:\Games\ffxii modding` whose name does not contain "backup" | L3-L7 | used-in-code |

## 8. process_outline.py

**Purpose:** filters toolkit_structure.txt down to group rows at depth 2 or less (2-space indent per level), writes `toolkit_editors.txt` and prints depth 0-1.

| Topic | Detail | Source | Evidence |
|---|---|---|---|
| Outline depth | depth = leading spaces / 2. Only `[GROUP]` rows at depth 2 or less are kept, giving an inventory of the Toolkit's editor sections. | L4-L7 | used-in-code |

## 9. texlist.txt

**Purpose:** a short list of PC HD UI textures.

| Topic | Detail | Source | Evidence |
|---|---|---|---|
| HD palette variants | The PC build splits a PS2 multi-CLUT texture into one `.dds.phyre` file per palette: `<base>.dds.phyre` plus `<base>_clut_<n>.dds.phyre`. Examples: targetline_p with clut_1 to clut_6, and w_line01 with clut_1. | L1-L11 | comment-only (list) |
| Battle UI textures | targetline_p (target line), chain_item, chainflash (chain counter flash) | L1-L9 | comment-only |

## 10. ff12-file-loader.ini

**Purpose:** configuration of the File Loader plugin, which overrides files from loose-file folders.

| Topic | Detail | Source | Evidence |
|---|---|---|---|
| Loose-file override root | `[Paths] mods=mods\deploy\ff12data`. Relative paths start in the game's main folder, entries higher in the list win, and the key name is irrelevant. An editor can deploy edited files here at their VBF-relative paths, for example `ps2data/image/ff12/test_battle/us/binaryfile/battle_pack.bin`, instead of repacking the VBF. | L6-L11 | comment-only |
| Unpacked-VBF option | A commented line `unpacked_vbf=FFXII_TZA` shows that a fully unpacked tree can also be mounted | L12 | comment-only |
| Access log | `logAccess=false`. Setting it to true logs every file the game opens, which is useful for finding which file a screen reads. | L1-L4 | comment-only |

## 11. ff12-lua-loader.ini

**Purpose:** configuration of the Lua Loader: the file watcher, debug allocation, the Mod Config menu and slider acceleration.

| Topic | Detail | Source | Evidence |
|---|---|---|---|
| Script hot-reload watcher | maxDirectoriesPerPeriod 150 (ReadDirectoryChangesW scanning), maxFilesPerPeriod 300 (polling), checkPeriod 100 ms | L1-L8 | comment-only |
| **Pointer-width constraint for `memory.execute`** | Some game functions treat pointers as **signed 32-bit**, so buffers passed to them must be below the **2 GB** boundary. `simulate64bitAllocs=true` forces `memory.alloc` above 4 GB to expose such bugs. By default, memory.alloc returns low addresses. | L10-L14 | comment-only |
| Mod Config menu | `[modmenu] enabled=true` adds the "Mod Config" entry and enables the `modmenu` Lua API. `skipInactiveRows=false` means read-only rows are not skipped when moving up or down. | L16-L20 | comment-only |
| Slider acceleration | Applies to native and Mod Config sliders: maxMultiplier 5, rampStartMs 1500, rampDurationMs 4000 | L22-L30 | comment-only |

## 12. ff12-tkmalloc.ini

**Purpose:** configuration of the tkMalloc plugin, which works on the game's `tkMalloc` allocator (heap regions).

| Topic | Detail | Source | Evidence |
|---|---|---|---|
| tkMalloc debug | `debug=false`. When true, it logs tkMalloc inits and memory regions, which is useful when large tables, such as an enlarged section 29 or 14, are reallocated. | L1-L4 | comment-only |

## 13. spells_black.lua (BlueMagick data)

**Purpose:** a data-only chunk loaded by BlueMagick.lua, which passes the constants table `K` as the single argument. It adds Black Magick spells to the **vanilla** Black school. There is one entry, Aeroja.

| Topic | Detail | Source | Evidence |
|---|---|---|---|
| Row numbering | Added Black spells use section-29 rows `VANILLA_MAG + 58 ...`. With VANILLA_MAG = 81 (see 14), Aeroja is row **139**, which makes it content **0x308B**. | L1, L34 | used-in-code |
| School / battle-menu list | `school = 1` is Black Magick. The mod writes **0x2C + school** into the section-29 row; the comment says this places the spell in the right battle-menu list. BpeIconList has 0x2C..0x30 = White, Black, Time, Green, Arcane Magick icons, so this byte is the s29 **icon** (+0x03). The same school value goes into s14 **flags2 bits 0-2** (magickCategory). | L9-L12 | comment-only (icon ids cross-checked with lists.json) |
| Charge aura +0x21 | `aura=2` is the Black Magick charge glow. DynamicDescription reads the same byte to caption the spell's school; a wrong value files the spell under Blue Magicks. | L11-L13, L36 | comment-only |
| Gambit page cap | The Gambits screen copies a page into a fixed **17-row** array, so 17 orders per page is a hard cap. Vanilla Black Magick gambit pages **2 and 3** are full at 17 each, so added spells go on the mod's own page. The battle menu still files them by school. | L15-L19 | comment-only |
| Aeroja row | Action **452** (vanilla "Reserve 0x01C4"), cloned from **27 Aeroga** (formula 7 Magick Damage, Wind). Power +0x10 = 165, element +0x13 = 0x20 (Wind), onHitRate +0x14 = 50, status +0x18/0x19 = 0x0020 (Confuse), help +0x00/0x01 = 0x109C (**4252**), charge 23, MP 56, effect 91 (Whirlwind), gambit {5, 0} | L24-L42 | used-in-code |
| Vanilla reference values | Aeroga power 103, MP 38; Ardor power 173, MP 60. Animation 212 is a real "Aeroja" animation in which the user floats and Chaos kiais. | L27-L32 | comment-only |

## 14. spells_blue.lua (BlueMagick data)

**Purpose:** a data-only chunk with **39 Blue Magicks** in section-29 rows `VANILLA_MAG + 0..38` (81-119). Each row names a target action id, a clone source (a vanilla action whose 60-byte record is copied first), byte overrides `extra[offset] = value` applied to that s14 record, MP, charge, effect (cast animation +0x24), a gambit slot and an optional `dynamic` poll mode that BlueMagick.lua runs per cast.

### 14.1 Machinery facts

| Topic | Detail | Source | Evidence |
|---|---|---|---|
| VANILLA_MAG | **81**: ???? is "row 81 / content 0x3051" and Acid is "82 / 0x3052". This matches the 81 vanilla s29 rows (0-80), so rows from 81 up are appended. | L17-L18, L26, L38 | used-in-code (derived) |
| Magick content id | **0x3000 + s29 row**. Owned bits and "bag" (inventory) entries are keyed by content id. A stale 0x3053 entry is purged from the bag. Saved gambits refer to spells by content id, so reordering shifts them. | L15-L21 | comment-only |
| Blue school id | School **5**. `K.ACTION_PATCH` is described as the proven school-5 magick record. Vanilla flags2.magickCategory uses 0-4, so 5 is new. | L12-L13 | comment-only |
| K.ACTION_PATCH | Base record: formula 59, range 100, content 0x3051, help 4148 | L12-L13 | comment-only |
| Help text file | `help_action.bin` stores the battle help lines. Id 4148 holds the missing-HP description, written by file editing. The mod rewrites help ids at run time with `writeHelpTexts`. | L22-L24, L43 | comment-only |
| Help id write | Bytes +0x00/+0x01 hold the u16 **battleMenuDescription** (4000+ block). Ids used: 4111-4123, 4208-4232, 4252, 4308. | throughout | used-in-code |
| Empty action shells | Actions **498-510** are "class-FF" empty shells at the end of s14 (510 is the last). Actions **511-534** are "class-07" shells (511 first, 534 last). lists.json names these rows "Reserve (0x01F2..0x0216)". "class" probably means battleMenuCategory +0x1E (0xFF = None, 0x07 = Foecraft), which this batch does not confirm. Actions 147 (Reserve 0x0093) and 148 (vanilla "Mount") are reused too. | L53, L70, L243, L261, L615 | comment-only; class meaning unclear |
| Undead test | Undead = **BUW classification 13** (BUW = battle-unit work struct) | L274, L330 | comment-only |
| Magick Resist field | **BUK +0x30** = Magick Resist. Guard-Off takes 10% off it. | L436 | comment-only |
| Byte ceilings | MP cost is a u8, so 299 is clamped to 150. Power is a u8 with a maximum of 255. Formula 59 power x multiplier peaks at 255 x 255 = 65,025, and this install shows five-digit damage. | L289-L291, L394, L539 | comment-only |
| MP carousel | MP values snap to "the carousel" (nearest 20 for 19), apparently a mod-menu value list | L363 | comment-only |

### 14.2 Action-record (s14, 0x3C) field semantics shown by the overrides

| Offset | Meaning (from these rows) | Evidence |
|---|---|---|
| +0x04 | Knockback, for example 20 (0x14) like the wolves' Fangs, or 15 | used-in-code |
| +0x05 | Reach/range: 20 = adjacent/punch, 30 = breath, 60 = three squares | used-in-code |
| +0x06 | AoE radius (0 = one target; Scathe 8, Renew 10, up to 20). With cone shape it is the **cone length** (6). | used-in-code |
| +0x07 | Cone angle in degrees (0x3C = 60) | used-in-code |
| +0x08 | Formula id (see 14.3) | used-in-code |
| +0x0C (flags1 b0-7) | 0x41 = canTargetSelf + initialTarget 2 (Self), so self only. 0x88 = canTargetFoe + initialTarget 4 (Foe). 0x8D = self, ally and foe with initialTarget Foe. | used-in-code |
| +0x0D (flags1 b8-15) | Arise has 0xAD. Bit **0x80** (flags1 bit 15, "unknownBit15" in the repo) means **"requires the status on the target"**: clearing it lets living allies be targeted. | comment-only (new) |
| +0x0E (flags1 b16-23) | 0x01 = allowReflect, 0x02 = allowMagickEvade, 0x08 = denyWhileSilenced. 0x10 is set on every value shown. Doom 0x10 = castable under Silence and not reflectable; Lifebreak/Limit Glove 0x18 = no reflect; Sunshine/Ray-Bomb/Ultra Waves 0x1A = reflect dropped, magick evade kept. | used-in-code |
| +0x0F (flags1 b24-31) | 0x01 = AoE shape 1 (**Cone**), 0x04 = useWeaponRange, 0x20 = hasMpOrMistCost. Telekinesis lacks 0x20 and is free. | used-in-code |
| +0x10 / +0x11 | Power / multiplier | used-in-code |
| +0x12 | Accuracy (250 = sure hit unless immune) | used-in-code |
| +0x13 | Element (0x01 fire, 0x04 ice, 0x20 wind, 0x80 dark) | used-in-code |
| +0x14 | onHitRate, the chance a damage formula applies the status list (Bio's Sap uses 100) | used-in-code |
| +0x18..+0x1B | Status mask u32 (see 14.4) | used-in-code |
| +0x1C | Character pose: 0x00 = swing/attack, 0x01 = cast | used-in-code |
| +0x1D | The file calls it a "tier byte" that controls the plain-hit vs Bio-style visual (0x0A plain hit, 0x16 Bio). The repo doc names it enmityAddSelfVsFoe. **Conflict, unresolved.** | comment-only |
| +0x1E | battleMenuCategory. **1 = Magicks** is required for the magick list to accept the action. Telekinesis's shell is class 2 (Technicks). | used-in-code |
| +0x21 | Charge aura (2 = Black Magick) | used-in-code |
| +0x24 | Cast/effect animation (`efx`) | used-in-code |
| +0x2D (flags2 b8-15) | 0x10 = canRestoreHp, 0x20 = **noLicenseRequired**, 0x40 = isOffensive. Without 0x20 a spell that has no license is **hidden**. | used-in-code; hiding is comment-only |
| +0x38/+0x39 | Gambit page/order. The rows give `gambit = {5, n}` with n from 0 to 52 and BlueMagick.lua maps the index to real pages (17 per page). | comment-only |
| +0x09 / +0x0A | Charge time (`charge`) / MP (`mp`) | used-in-code |

### 14.3 Formula ids described (s14 +0x08)

| Id | Behaviour | Example source action |
|---|---|---|
| 1 | Always "Miss" (the poll swaps to it to force a miss) | n/a |
| 2 | Add positive status | Bravery 53, Haste 36, Protectga 55 |
| 3 | Status only (inflict) | Toxify 63 (accuracy 55), Countdown 46 (60), Confuse 69 (70), Stop 44 (50) |
| 5 | Full HP restore | Renew 14 |
| 6 | Revive to power% HP and remove the listed statuses; does nothing to living targets | Arise 15 (power 100) |
| 7 | Magick damage | Aqua 21, Thunder 19, Aeroga 27, Scathe 35 |
| 9 | HP to 0, no EXP/LP ("Eject"); Safety bosses immune | Warp 50 |
| 10 | KO after a magick accuracy contest; Safety bosses immune | Death 68 |
| 12 | MP drain: power x caster Magick multiplier (Cure's), capped at the target's MP, given to the caster | Syphon 74 (power 8, accuracy 60) |
| 14 | [power]% of max HP; Safety bosses immune; Shell halves accuracy | Gravity 79 |
| 50 | Telekinesis physical; stops when the weapon can hit flying targets | Telekinesis 170 |
| 51 | Defense -10% permanently after a level-vs-accuracy roll (foes only) | Expose 171 |
| 59 | Flat power x multiplier damage that ignores defence | ACTION_PATCH / ???? 147 |
| 65 | "Enemy Technick": STR-scaling physical; power 12-13 is a normal hit | used on the Telekinesis shell |
| 74 | Swap current HP and MP (accounts for Bubble, Disease, Zero MP); no hit roll | Invert 281 (foe) |
| 78 | Fixed HP restore of power x multiplier | n/a |
| 83 | Magick-scaled Fire damage ignoring defence, radius 6 | Self-Destruct 407 (foe) |

### 14.4 Status mask bytes used (+0x18 u32 LE)

Confuse 0x20@+0x18. Blind 0x80@+0x18. KO 0x01@+0x18. Poison 0x01@+0x19. Silence 0x02@+0x19. Sap 0x04@+0x19. Disable 0x20@+0x19 (bit 13). Slow 0x80@+0x19. Disease 0x01@+0x1A (bit 16). Protect 0x04@+0x1A. Shell 0x08@+0x1A. Haste 0x10@+0x1A. Bravery 0x20@+0x1A. Faith 0x40@+0x1A. Regen 0x02@+0x1B.
- Esuna's set plus KO is +0x18 = 0xB5 and +0x19 = 0x77.
- Foe Bad Breath (377) has the low word 0x8180 (blind, poison, slow).

All of these match `StatusEffectFlags`.

### 14.5 Spell table (row = 81 + i)

| i | Spell | Action | Clone of | Key overrides | MP | Chg | Effect | Help | Dynamic |
|---|---|---|---|---|---|---|---|---|---|
| 0 | ???? | 147 | ACTION_PATCH | pose swing, +0x1D 0x0A | 3 | 15 | 104 Wither | 4308 | missingHP |
| 1 | Acid | 148 | 63 Toxify | acc 70, +0x1D 0x16 | 12 | 20 | 27 Bio | 4122 | randomStatus (ACID_POOL) |
| 2 | Angel Whisper | 498 | 15 Arise | +0x0D 0x2D, +0x2D 0x30, status Esuna+KO | 50 | 23 | 15 Renew | 4123 | reviveOrHeal (formula 6 to 5 on the living) |
| 3 | Aqua Breath | 499 | 21 Aqua | cone 30/6/60, power 70 | 20 | 25 | 284 Aqua Bubbles | 4121 | none |
| 4 | Bad Breath | 500 | 63 Toxify | cone, blind/poison/slow | 16 | 25 | 304 | 4120 | none |
| 5 | Dark Shock | 501 | 170 Telekinesis | formula 65, power 13, dark, onHit 70, cast, class 1, MP flag | 12 | 25 | 302 | 4119 | randomStatus (DARKSHOCK_POOL) |
| 6 | Doom | 502 | 46 Countdown | acc 70, +0x0E 0x10 | 12 | 25 | 309 | 4118 | none |
| 7 | Dragon Force | 503 | 53 Bravery | status bravery and faith | 12 | 25 | 68 Berserk | 4117 | none |
| 8 | Flame Thrower | 504 | 21 Aqua | cone, power 60, fire, onHit 100, Disease | 24 | 25 | 289 | 4116 | none |
| 9 | Frog Drop | 505 | 147 ???? | cast pose | 10 | 20 | 119 Gil Toss | 4115 | frogDrop (level squared, capped at 9999) |
| 10 | Frog Song | 506 | 69 Confuse | acc 60, confuse and silence | 16 | 25 | 111 Charm | 4114 | none |
| 11 | Frost | 507 | 44 Stop | ice element | 20 | 25 | 31 Blizzaga | 4113 | none |
| 12 | Goblin Punch | 508 | 170 | formula 65, power 18, kb 20, reach 20, acc 90, swing | 8 | 20 | 267 Fangs | 4112 | variance (varBase 18, 50-150%) |
| 13 | Grand Delta | 509 | 35 Scathe | radius 10, power 180 | 64 | 30 | 204 pentagram | 4111 | none |
| 14 | Maser Eye | 510 | 170 | formula 65, power 113, reach 30, kb 15, acc 100, dark | 40 | 3 | 341 | 4208 | none |
| 15 | LV 5 Death | 511 | 68 Death | dark | 24 | 25 | 69 Death | 4209 | lv5death (accuracy 250 when level % 5 = 0, otherwise 0) |
| 16 | Lifebreak | 512 | 147 | dark, reach 20, +0x0E 0x18, +0x0F 0x24, swing | 16 | 20 | 103 Souleater | 4210 | lifebreak (undead: formula 78) |
| 17 | Limit Glove | 513 | 147 | power/mult 255/255, kb/reach 20, acc 100, onHit 0 | 8 | 10 | 118 Traveler | 4211 | limitglove (formula 1 when HP > 10%) |
| 18 | LV 3 Def-Less | 514 | 171 Expose | reach 60, acc 100, cast, class 1 | 12 | 25 | 109 Expose | 4212 | lv3defless (level % 3) |
| 19 | Magic Hammer | 515 | 74 Syphon | power 20, acc 80 | 40 | 25 | 75 Syphon | 4213 | magicHammer (undead: formula 1) |
| 20 | Matra Magic | 516 | 281 Invert | class 1, +0x2D 0x60 | 24 | 20 | 203 Invert | 4214 | none |
| 21 | Metallic Body | 517 | 53 Bravery | no status, self only (0x41) | 20 | 30 | 52 Protect | 4215 | stoneskin (pool of 15% max HP, HP refunded) |
| 22 | Micro Missiles | 518 | 79 Gravity | one target, power 50, acc 100 | 24 | 25 | 80 Gravity | 4216 | microMissiles (FF8 crisis level: 50/75/87.5/93.75% of current HP) |
| 23 | Mighty Guard | 519 | 55 Protectga | haste, protect, shell, regen | 150 | 30 | 56 Protectga | 4217 | none |
| 24 | Mind Blast | 520 | 19 Thunder | power 90, onHit 60, Disable | 80 | 20 | 274 Blaster | 4218 | none |
| 25 | Sunshine | 521 | 35 | radius 20, power 140, +0x0E 0x1A | 48 | 30 | 258 Shining Ray | 4219 | none |
| 26 | Guard-Off | 522 | 171 | reach 60, acc 100, cast, class 1 | 12 | 25 | 289 | 4220 | guardOff (-10% BUK+0x30) |
| 27 | Ray-Bomb | 523 | 35 | radius 20, power 185 | 60 | 30 | 299 Blast Wave | 4221 | rayBomb (power 185/209/232/255) |
| 28 | Refueling | 524 | 36 Haste | self only | 32 | 8 | 336 Chain Reaction | 4222 | none |
| 29 | Roulette | 525 | 68 | targeting 0x8D, acc 250 | 20 | 25 | 98 Horology | 4223 | roulette (random victim, redirected) |
| 30 | Sandspray | 526 | 63 | cone, acc 70, dark, blind | 40 | 20 | 261 Sandstorm | 4224 | none |
| 31 | Seed Cannon | 527 | 79 | one target, power 38, acc 100 | 32 | 20 | 348 Wing Spear | 4225 | none |
| 32 | Self-Destruct | 528 | 407 (foe) | targeting 0x88, MP flag, cast, class 1 | 0 | 1 | 334 (KOs user) | 4226 | none |
| 33 | Shadow Flare | 529 | 35 | one target, power 255 | 100 | 30 | 35 Ardor | 4227 | none |
| 34 | Thrust Kick | 530 | 50 Warp | one target, kb/reach 20, acc 80, swing | 12 | 10 | 317 Spinkick | 4228 | none |
| 35 | Sacrifice | 531 | 14 Renew | one target | 12 | 25 | 112 Revive (KOs user) | 4229 | none |
| 36 | Ultra Waves | 532 | 35 | radius 20, power 62, +0x0E 0x1A | 40 | 25 | 270 Screech | 4230 | ultraWaves (62/62/91/125/163) |
| 37 | Vertical Cleave | 533 | 170 | formula 65, power 30, kb/reach 20, acc 70, swing | 80 | 3 | 113 Sight Unseeing | 4231 | variance (varBase 30) |
| 38 | White Wind | 534 | 14 Renew | formula 78, 100 x 10 | 150 | 35 | 227 Restore | 4232 | whiteWind (power x mult = caster's HP) |

Each row's gambit slot is {5, 14+i}. Evidence for the table is **used-in-code**; the poll behaviours are **comment-only** here because their code lives in BlueMagick.lua.

### 14.6 Vanilla values quoted (reference data for editors)

These values are comment-only:
- Aqua 21: power 37 (Aquaga 100).
- Thunder 19: power 23.
- Scathe 35: power 190, radius 8.
- Gravity 79 and Warp 50: radius 8.
- Renew 14: radius 10.
- Drain: power 62. Flare: power 163.
- Bio: onHitRate 100 (Sap).

Foe abilities:
- Aqua Bubbles 357: cone, reach 30.
- Bad Breath 377: 60 degrees.
- Doom 382: accuracy 70, +0x0E 0x10.
- Maser Eye 414: reach 30, CT 3, power 113, knockback 15, accuracy 100, usable while Silenced.
- Self-Destruct 407: formula 83, radius 6, effect 334.

Effect animation ids, with descriptions:

| Id | Effect |
|---|---|
| 15 | Renew |
| 27 | Bio |
| 31 | Blizzaga |
| 35 | Ardor |
| 52 | Protect |
| 56 | Protectga |
| 68 | Berserk |
| 69 | Death |
| 75 | Syphon |
| 80 | Gravity |
| 91 | Whirlwind |
| 98 | Horology |
| 103 | Souleater |
| 104 | Wither |
| 109 | Expose |
| 111 | Charm |
| 112 | Revive (KOs the user) |
| 113 | Sight Unseeing |
| 118 | Traveler |
| 119 | Gil Toss |
| 203 | Invert |
| 204 | Pentagram lasers |
| 212 | Aeroja |
| 227 | Restore |
| 258 | Shining Ray |
| 261 | Sandstorm |
| 267 | Fangs |
| 270 | Screech |
| 274 | Blaster |
| 284 | Aqua Bubbles |
| 289 | Fire breath |
| 299 | Blast Wave |
| 302 | Dark Shock |
| 304 | Bad Breath |
| 309 | Doom |
| 317 | Spinkick |
| 334 | Self-Destruct (KOs the user) |
| 336 | Chain Reaction |
| 341 | Maser Eye |
| 348 | Wing Spear |

---

## What this batch gives editor work

- **Offline VBF tools:** exact header offsets for this archive. Entries are at 0x15D440 (0x20 each, 89,411 files), the name-size u32 is at 0x417CA0, names start at 0x417CA4 (0x5852F6 bytes) and the block table starts at 0x99CF9A. These offsets are an independent check for `editor/src/vbf.js`. Also: the TIM2 picture-header offsets, the `tm2_menu` path, and the `.dds.phyre` `_clut_N` HD variants.
- **Deployment:** the File Loader reads loose files from `mods\deploy\ff12data` at VBF-relative paths, so editors can write there instead of repacking.
- **Lua and memory editors:**
  - Buffers passed to game functions through `memory.execute` should stay below 2 GB (signed 32-bit pointers).
  - The Mod Config (`modmenu`) API is on.
  - The BlueMagick data shows a working recipe for adding spells:
    1. Append s29 rows from 81 up, with content 0x3000 + row and icon 0x2C + school.
    2. Fill empty s14 shells 498-534 (plus 147, 148, 452) by cloning a vanilla record and patching bytes.
    3. Set flags2 noLicenseRequired.
    4. Write help ids into +0x00.
    5. Respect the 17-per-page gambit cap.
- **Undocumented bits:** the data also documents flags1 bit 15 ("requires the status on the target"), the flags1 byte 0x0E bits (reflect 0x01, magick evade 0x02, deny while silenced 0x08), and the conflicting reading of s14 +0x1D.
