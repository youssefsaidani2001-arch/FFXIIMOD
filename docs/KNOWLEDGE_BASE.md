# FFXII: The Zodiac Age modding knowledge base

This page collects what the project knows about the game's files, the community's tools and the
traps people fell into. It is organised by file type. Each file type links to the detailed format
specs in [`docs/formats/`](formats/), which give byte offsets, field types and rebuild rules.

## 0. Sources and how to read the citations

| Citation | Source |
|---|---|
| `[chat #N]` | Discord export *Sky Pirate's Den / #wip-general*, message index N. Only the messages from 16 to 27 September 2020 (about indices 0 to 1067) could be read; the rest of the 35 MB export could not be downloaded. The format specs cite the same indices as `D#N` or `msg N`. |
| `spec-id` | A format spec in `docs/formats/<spec-id>.md` (prose) and `docs/formats/<spec-id>.json` (machine-readable records). |
| `TK Lnnn`, `R:nnn` (inside the specs) | `docs/research/insurgents_toolkit_reference.md`, a write-up of Xeavin's Insurgent's Toolkit Cheat Engine table. |
| `W:` / `IW` (inside the specs) | The Insurgent's Workshop (Xeavin). The specs use it **only as a source of facts**. Its licence is personal use only, so no code was copied or ported. |
| Drive batches | `docs/research/drive/batch_*.md`: notes on the user's Google Drive files (Toolkit table copy, overlay tools, loader configs, Lua mods). |

How sure a fact is: the chat notes say whether a person *tested* something, *stated* it, or was
*speculating*. This page keeps that wording ("tested", "said", "thought").

Two spec ids were produced twice by different research passes (`tim2` and `mrp`). Each has only one
file on disk, and the one on disk is the Toolkit-reference version (record names `fileHeader`,
`pictureHeader`, `extHeader`... for TIM2, and `header`, `group`, `entryType1`... for MRP). The other
pass's record names (`tim2FileHeader`, `mrpHeader`, ...) do not exist in the files. `mrp-sheet` is a
separate spec.

---

## 1. Getting files out of the game and back in

### 1.1 The VBF archive

All game data sits in one archive, `FFXII_TZA.vbf`, in the Steam install folder. The layout below
comes from the project's own reader (`editor/src/vbf.js`, cross-checked against the user's `vbf.py`):

| Offset | Content |
|---|---|
| 0x00 | magic `SRYK` |
| 0x04 | u32 header length |
| 0x08 | u64 file count N |
| 0x10 | N x 16-byte MD5 hashes of the file names |
| then | N x 32-byte entries: u32 first block, u32 unknown, u64 size, u64 data offset, u64 name offset |
| then | u32 size of the name block, then NUL-terminated names (name offsets count from the first name) |
| then | u16 per 64 KiB block up to the header length: stored size of the block. 0 = a full 65536-byte block stored raw; a stored size equal to the plain size = raw; anything else = zlib |

The community extracts files with **VBF Browser** [chat #402-416]. The project's editor suite has its
own browser that reads only the header and extracts single files (`editor/src/editors/vbf.js`).
A Drive script that guessed block boundaries with a zlib-or-raw heuristic is unreliable; read the
block table instead (drive batch 03, `extract_data.py`).

### 1.2 Known paths inside the archive

| File | Path | Source |
|---|---|---|
| `battle_pack.bin` | `ps2data/image/ff12/test_battle/us/binaryfile/battle_pack.bin` (the `us` folder is the language) | [chat #402, #403, #416], `container-battlepack` |
| Menu textures | `ps2data/image/ff12/myoshiok/us/tm2_menu/*.tm2` (every file there is TIM2) | drive batch 03, `tim2` |
| Clan Primer files | in a `myoshiok` folder; exact sub-folder not recorded | [chat #1035], `container-himgd` |
| License boards | `board_1.bin` ... `board_12.bin`; folder not recorded (probably next to `battle_pack.bin`) | `battlepack-s70-license-board` |
| Map scripts | `<area>_<letter><nn>.ebp`, e.g. `srb_b04.ebp`, `dst_a03.ebp` (Sand-swept Naze, Nekhbet spawn); folder not recorded | [chat #116, #1047-1050], `container-ebp` |
| Otherpacks (`tex2pack_ys.bin`, `mrppack_ys.bin`, ...) | folder not recorded | `container-otherpack` |

Language folders: `us` is English. The text tool wrapper recognises `in` (Japanese), `kr`, `cn`
(Simplified Chinese) and `ch` (Traditional Chinese); the full list of language copies of
`battle_pack.bin` is not verified (`container-battlepack`, [chat #402]).

### 1.3 Ways to load an edited file

| Route | How it works | Source |
|---|---|---|
| **FF12 External File Loader** | Loose files under `mods\deploy\ff12data` (from `ff12-file-loader.ini`) override archive files at the same VBF path. `logAccess=true` logs every file the game opens, which helps find which file a screen uses. | drive batch 04 |
| **Battlepack section loader** (ffgriever) | The game can load single battlepack sections from separate files (for example a section 14 file) instead of the whole pack. Each section file keeps its own timestamp, so changes can be tracked per section. eochaid uses it; ffgriever expected it to be niche. The expected file naming is not stated. | [chat #53-54] |
| **FF12 Lua Loader** | Lua scripts patch memory at runtime (this repo's summon mod, the Workbench's `BattlepackPatch.lua`). Scripts must keep pointers passed to game functions below 2 GB (`simulate64bitAllocs`). | drive batch 04, `README.md` |
| **Insurgent's Toolkit** (Cheat Engine) | Edit values live in memory, then export the game file. Has a File Reloader that hot-loads the battlepack, MRP pack, the 12 license boards and some world files. ARD files have no hot reload; they apply when an area loads. | [chat #369, #393, #411-412], TK L1405-1430, `container-ard` |

Official game patches can break script-based mods: the *Struggle for Freedom* mod had to drop its
Job Reset feature after a Square Enix update [chat #253-255].

---

## 2. Rules that apply to every format

* **Little-endian** everywhere (PC build).
* **Treat fields as unsigned.** The developers use the top value of a type (255, 65535, 0xFFFFFFFF)
  for "none" instead of -1. Reading a u16 as signed hides every value above 32767. Xeavin checked the
  type of every field in the Toolkit's battlepack editor, so use those types [chat #537, #555, #615-622].
* **Field limits are the type maximum** (255 / 65535 / 0xFFFFFFFF), except possibly HP and MP
  [chat #555]. MP is capped at 999 by the engine; raising it needs an exe patch [chat #374-389].
* **16-byte alignment with zero padding** between sections (battlepack, EBP, ARD, otherpack, himgd).
  The otherpack header is the exception: it is filled with 0xFF (`container-otherpack`).
* **Records hold numeric text ids, not strings.** Names and descriptions live in text tables and are
  renamed with the text tool; dropdowns in the Toolkit only re-point a record to an existing string
  [chat #933-936].
* **Short embedded labels are Shift-JIS** (code page 932): MRP texture names, EBP camera labels,
  script actor names. Decompiled scripts contain Japanese identifiers such as `g_btl_神竜` [chat #221].
* **Content ids** = `category << 12 | index` (items 0x0, equipment 0x1, loot 0x2, magicks 0x3,
  technicks 0x4, gambits 0x6, key items 0x8, packages 0x9, rewards 0xA, prices 0xB, mist 0xC, bazaar
  0xD, gil 0xE000 + amount, 0xFFFF = none) (`enums-content-ids`, drive batch 01). The Toolkit
  reference says gil is 0xF000; the lists and vanilla data use 0xE000.
* **Many tables are positional.** Other data refers to rows by index (content ids, `0x5000 + row`
  for gambit sets, `0x8000 + n` for foe action packages, save data). Never reorder or delete rows;
  only append.
* **Nested containers are rebuilt inside-out**: battlepack section 61 before the battlepack, the ARD in
  EBP section 19 before the EBP.
* **The st2e table header** (`container-st2e`) is shared by most battlepack sections and four ARD
  sections: `st2e` magic, u32 entryCount at 0x04, u16 entrySize at 0x08, u32 entryListOffset at 0x0C
  (0x20, or 0 when empty), u32 at 0x14 (text section offset, 0 on disk), u32 at 0x18 (battlepack
  section 13 only: attribute list offset). Records follow at 0x20 and the section is zero-padded to 16.
  Read the entry size from the header instead of trusting a table.

---

## 3. `battle_pack.bin` (the battlepack)

The master gameplay database: equipment, actions, statuses, party members, licenses, shops, loot and
more. Game file type 2, id 0x13. In memory at `[0x0208E680]` (Steam 1.0.4.0), where the game turns
section offsets into absolute pointers (TK L241).

### 3.1 Container (`container-battlepack`)

```
+0x00  u32 sectionCount            71 (15 inside section 61)
+0x04  u32 sectionOffset[0..70]    file-relative
+0x120 u32 endOffset               end of the last section's real data (before final padding)
       zero padding to 16          first section at 0x130 when rebuilt (vanilla not verified)
       sections in index order, each zero-padded to 16; file padded to 16
```

* An **empty section** has the same offset as the next section, never 0.
* Offsets inside sections are section-relative, so moving a section changes nothing inside it.
  Sections 0, 10, 13, 39, 61 and 70 have internal offsets of their own (the Toolkit's hot reloader
  fixes these up separately; TK L1422).
* **Section 61 is itself a pack** with the same layout and 15 text sub-sections. Feeding it straight to
  the text tool fails with "invalid size"; unpack it with ff12-pack first, then run the text tool on the
  pieces, and repack in reverse order [chat #943-954, #997-1012]. One user got 14 files, Xeavin said 15
  (one sub-section is probably empty) [chat #997, #1005].
* The Workshop unpacks section *i* to `battle_pack.bin.dir/section_<iii>.bin`.

### 3.2 Section map

"Fixed" means the row count must not change. "Append only" means rows may be added at the end.

| # | Content | Layout | Vanilla rows | Spec | Resize |
|---|---|---|---|---|---|
| 0 | Weapon stances | custom: u16 entrySize, u16 count, 1-byte rows | 23 | [`battlepack-s00-weapon-stances`](formats/battlepack-s00-weapon-stances.md) | count + length |
| 1 | unknown | | | | keep raw |
| 2 | Text table | FFXII text format | | none (text format not documented) | |
| 3 | MP regeneration (Martyr etc.) | st2e 8, two row layouts | 20 damage rows + walking rows | [`battlepack-s03-mp-regeneration`](formats/battlepack-s03-mp-regeneration.md) | walking rows only, after row 19 |
| 4 | unknown | | | | keep raw |
| 5 | Equipment categories | st2e 4 | 32 (max 32) | [`battlepack-s05-equipment-categories`](formats/battlepack-s05-equipment-categories.md) | append, max 32 |
| 6 | Chain levels | st2e 37 | 4 | [`battlepack-s06-chain-levels`](formats/battlepack-s06-chain-levels.md) | fixed |
| 7 | Gambits (targets) | st2e 32 | 256 | [`battlepack-s07-gambits`](formats/battlepack-s07-gambits.md) | append only |
| 8 | Default gambit sets | st2e 64 | not documented | [`battlepack-s08-default-party-member-gambits`](formats/battlepack-s08-default-party-member-gambits.md) | append only |
| 9 | Level growth | st2e 2, row i = level i+1 | 99 expected | [`battlepack-s09-party-member-level-growth`](formats/battlepack-s09-party-member-level-growth.md) | count + length |
| 10 | Action groups (foe action packages) | offset table, 4-byte entries | 826 packages | [`battlepack-s10-action-groups`](formats/battlepack-s10-action-groups.md), [`foe-action-packages`](formats/foe-action-packages.md) | rebuild offsets; append packages only |
| 11 | Magick categories | st2e 4 | 5 | [`battlepack-s11-magick-categories`](formats/battlepack-s11-magick-categories.md) | append only |
| 12 | License nodes | st2e 24 | 368 (hard limit) | [`battlepack-s12-license-nodes`](formats/battlepack-s12-license-nodes.md) | fixed; reuse reserve rows 361-367 |
| 13 | Equipment + attributes | st2e 52 + 24-byte attribute list at header+0x18 | 557 equipment | [`battlepack-s13-equipment-attributes`](formats/battlepack-s13-equipment-attributes.md), [`section13-attributes-sheet`](formats/section13-attributes-sheet.md) | equipment before attribute list; update +0x18 |
| 14 | Actions | st2e 60 | see spec | [`battlepack-s14-actions`](formats/battlepack-s14-actions.md) | append only (engine acceptance unverified) |
| 15 | Status effects | st2e 40 | 32 | [`battlepack-s15-status-effects`](formats/battlepack-s15-status-effects.md) | fixed |
| 16 | Party members (incl. guests, espers) | st2e 128 | 40 | [`battlepack-s16-party-members`](formats/battlepack-s16-party-members.md) | append only |
| 17 | Battle menu categories | st2e 4 | 21 expected | [`battlepack-s17-battle-menu-categories`](formats/battlepack-s17-battle-menu-categories.md) | append only |
| 18 | Items | st2e 12 | 64 | [`battlepack-s18-items`](formats/battlepack-s18-items.md) | append only |
| 19-25 | unknown | | | | keep raw |
| 26 | Mist (marked unused) | st2e 8 | 32 | [`battlepack-s26-mist`](formats/battlepack-s26-mist.md) | append only |
| 27 | Battle menu restrictions | bespoke (lists at +0x0C and +0x1C) | | **no spec** (TK L822, L978) | keep raw |
| 28 | Prices | st2e 4 | 128 | [`battlepack-s28-prices`](formats/battlepack-s28-prices.md) | append only |
| 29 | Magicks (inventory data: icon, sort, name, description) | st2e 8 | 81 | [`battlepack-s29-magicks`](formats/battlepack-s29-magicks.md) | append only |
| 30 | Technicks | st2e 8 | 24 | [`battlepack-s30-technicks`](formats/battlepack-s30-technicks.md) | append only |
| 31 | Concurrences | st2e 13 | 16 | [`battlepack-s31-concurrences`](formats/battlepack-s31-concurrences.md) | fixed |
| 32 | Loot | st2e 10 | 512 | [`battlepack-s32-loot`](formats/battlepack-s32-loot.md) | append only |
| 33 | Maps | st2e 10 | 64 | [`battlepack-s33-maps`](formats/battlepack-s33-maps.md) | do not grow (id block shared) |
| 34 | Teleport locations | st2e 10 | 32 | [`battlepack-s34-teleport-locations`](formats/battlepack-s34-teleport-locations.md) | do not grow |
| 35 | Key items | st2e 10 | 416 | [`battlepack-s35-key-items`](formats/battlepack-s35-key-items.md) | do not grow |
| 36 | unknown | | | | keep raw |
| 37 | Packages | st2e 12 | 512 | [`battlepack-s37-packages`](formats/battlepack-s37-packages.md) | append only |
| 38 | Rewards (ships empty) | st2e 12 | 256 | [`battlepack-s38-rewards`](formats/battlepack-s38-rewards.md) | append only |
| 39 | Shops | three-level offset tree (shop, event, content) | 57 shops | [`battlepack-s39-shops`](formats/battlepack-s39-shops.md) | rebuild the tree |
| 40 | unknown | | | | keep raw |
| 41 | Elements | st2e 2 | 8 | [`battlepack-s41-elements`](formats/battlepack-s41-elements.md) | fixed |
| 42 | Initial inventory | st2e 4 | not documented | [`battlepack-s42-initial-inventory`](formats/battlepack-s42-initial-inventory.md) | count + length |
| 43-56 | unknown | | | | keep raw |
| 57 | Bazaar goods | st2e 36 | 128 | [`battlepack-s57-bazaar-goods`](formats/battlepack-s57-bazaar-goods.md), [`section57-bazaar-sheet`](formats/section57-bazaar-sheet.md) | append only |
| 58 | Augments | st2e 8 | 131 | [`battlepack-s58-augments`](formats/battlepack-s58-augments.md) | append only (rows 0-63 = bit order) |
| 59 | Story point additions, extended | st2e 44 | not documented | [`battlepack-s59-story-point-additions-extended-info`](formats/battlepack-s59-story-point-additions-extended-info.md) | count + length |
| 60 | Story point additions, basic | st2e 208 | 50 | [`battlepack-s60-story-point-additions-basic-info`](formats/battlepack-s60-story-point-additions-basic-info.md) | append only |
| 61 | Nested pack of 15 text tables | battlepack container | | `container-battlepack` | rebuild before the outer pack |
| 62-67 | unknown | | | | keep raw |
| 68 | Location movement behaviour (purpose uncertain) | st2e 8 | | [`battlepack-s68-location-movement-behaviour`](formats/battlepack-s68-location-movement-behaviour.md) | count + length |
| 69 | Movies | st2e 8 | | [`battlepack-s69-movies`](formats/battlepack-s69-movies.md) | count + length |
| 70 | License board grid (`licd`) | see section 4 | | [`battlepack-s70-license-board`](formats/battlepack-s70-license-board.md) | only the end offset moves |

Unresolved conflicts flagged by the specs (check them on a vanilla dump before writing edits):

* **Section 8**: the Workshop reads 12 targets at 0x00-0x17 and 12 actions at 0x20-0x37; the Lua Loader
  docs read interleaved (target, action) pairs.
* **Section 12**: the Workshop puts the description id at 0x00 and the name at 0x02; the Lua Loader docs
  have them the other way round. The value ranges tell them apart (names 6144-6505, help 17000+).
* **Section 6**: whether the rate bytes are signed, and the byte order of the two benefit rates at
  0x1E/0x1F.
* **Section 69**: the fade colour is in byte 7 (Workshop writer, Lua Loader docs) or byte 5 (Workshop reader).
* **Section 3**: the last walking tier's MP limit must be at least 999 (`container-st2e`) or 1000
  (`battlepack-s03-mp-regeneration`).
* **Section 39**: `container-battlepack` speaks of "6-byte tagged headers"; the section spec gives
  12-byte list headers (u16 100, u16 level, u16 stride, u16 count, u32 offset). The 6 bytes are
  probably the first three u16 values.
* **Section 13**: the Toolkit counts attributes up to the start of section 14; the Workshop reads them
  to the end of section 13. These agree when there is no padding between the two.

### 3.3 What the community learned, section by section

**Section 3, MP regeneration (Martyr).** Martyr's MP gain is a threshold table, not a formula
[chat #94, #97]. Posted tiers (damage, MP): 1-499 = 1, 500-1499 = 2, 1500-2599 = 3, 3000-4999 = 4,
5000-5999 = 5, 6000-6999 = 7, 7000-7999 = 10, 8000-8999 = 15, 9000-9998 = 20, 9999+ = 30
[chat #96]. The 2600-2999 gap is probably a typo. The section has 20 damage rows, and how they split
between Martyr, Inquisitor and Warmage is not known. Whether Martyr can be relinked to a formula was
asked and not answered [chat #98-100]. Giving a monster Martyr gives it effectively unlimited MP
[chat #376].

**Section 8, default gambits.** When a character is created, it gets one gambit slot per entry in its
section-8 set. Vaan and Penelo have one entry but get a second slot from code, so everyone reaches 12
(2 starting + 10 license nodes). A character with fewer than 2 entries ends below 12; giving Vaan or
Penelo more than 1 entry wastes license nodes; 12 is the maximum [chat #55]. Section 16 points at a
set as `0x5000 + row`.

**Section 12 and the board, gambit licenses.** Putting 5 gambit slots on one license is probably fine
apart from text overflow in the license menu; consolidating the gambit licenses frees 8 license
entries [chat #29-33]. Text overflow is fixed by shifting element positions in the menu MRP
[chat #34-41].

**Section 13, equipment.**
* Gil is the **buy** price, a u16 (0-65534; 65535 = none). Sell prices are computed by the game. Use the
  "cannot be sold" flag, not price 0, for unsellable items [chat #534-548, #688-697].
* On-hit status chance is a percentage (Garuda's Sleep Beak = 4%) [chat #661, #702].
* The weapon formula can be replaced by a spell formula: the hit then behaves like that spell, with no
  second charge time (Blood Sword + Drain/Leech 67, Healing Rod + Cure) [chat #470-476, #493].
  The Toolkit's formula dropdown accepts raw numbers outside the list [chat #490-497]; Balance works as
  8 or 108 [chat #478-488].
* Changing a weapon's formula **alone** gives 0 damage. You must also set the Power of the generic
  "Attack" action in section 14 (Power 1 gives Balance-like behaviour). With an action formula the game
  reads action-section values and may ignore equipment values [chat #499-503].
* Most foes use a base attack chosen in the ARD, so their weapon's attack power and charge time are
  ignored; only on-hit statuses, bonuses and elements matter [chat #630-642, #664].
* "Distance behaviour" decides things such as stepping back before attacking [chat #531-532].
* Equipment attribute links are byte offsets (index x 24) into the attribute list (`container-st2e`).

**Section 14, actions.**
* The magick type is the low 3 bits of the "properties type" flags: White = 0, Black = 1, Time = 2,
  Green = 3, Arcane = 4. It only matters when the battle-menu assignment is Magick [chat #753-774].
* The magick line (Time, Arcane...) is set in the action, not the license [chat #703-722]. Moving a
  magick to another line without the matching flags can make it castable while silenced [chat #707].
  Its icon is set in section 29, so the icon stays wrong until section 29 is edited too [chat #873-884].
* Knockback is read only by some formulas (mostly Strength-based ones); the formula decides which
  action fields are used at all [chat #649-658]. Vanilla knockback never exceeds 100 [chat #550-553].
* The `summon` field matters for one action type only; "summon: vaan" is just value 0 [chat #554-557].
* The gambit/AI fields are unused unless certain flags are set [chat #770]. Target flags overlap
  (party target already includes self) [chat #775].
* Whether a hit wakes a sleeping target is decided by the action; the normal Attack always wakes
  [chat #702].
* The Toolkit has an `enmity` field that older tools miss [chat #579-589].
* Range, knockback and positioning only make sense when seen in game; live editing is faster for
  actions [chat #571-575, #616].

**Section 15, status effects.** Exactly 32, matching a 32-bit field that dozens of code paths check.
A new status is not practical; replace an existing one [chat #59]. Status definitions are shared by
party and foes, so editing Stop changes it for enemies too [chat #509-513]. Making Poison scale with
magick power needs an exe patch [chat #515-516].

**Section 16, party members, guests and espers.** Allied espers are not in the enemy editor; they are
character rows like guests, edited in the same section as the party [chat #343-352]. Esper abilities
probably come from the "initial inventory" [chat #365]; the spec lists two readings (section 16
inventory slots vs section 42), and this repo's summon mod uses section 16 `inventory1..10`
(`docs/VERIFY.md`).

**Section 29, magicks.** Holds each magick's icon, sort order, description and name; changing the
magick's line in section 14 does not change its icon [chat #873-884].

**Section 61, text.** See 3.1 and section 11.

### 3.4 Working with the battlepack in the Toolkit

In the Cheat Engine table: expand the lists to find the section number, pick it in the red "Section
Base" entry (double-click its value), expand and edit. Never tick the checkboxes of rows that have
addresses; only change values [chat #895-924]. The Toolkit is always the most up-to-date tool for
attribute names [chat #723-729]. The Nexus article "Modder Resources: Battlepack" (articles/67)
is written for the Toolkit [chat #405, #410].

---

## 4. License boards (section 70 and `board_1.bin` ... `board_12.bin`)

Spec: [`battlepack-s70-license-board`](formats/battlepack-s70-license-board.md); nodes in
[`battlepack-s12-license-nodes`](formats/battlepack-s12-license-nodes.md); runtime view in
[`license-board-runtime`](formats/license-board-runtime.md).

```
+0x00 'licd'   +0x04 u16 columns W   +0x06 u16 rows H   +0x08 u16 cells, row-major: (r,c) at 8 + 2*(r*W + c)
zero padding to 16
```

* Twelve job boards are game files 0x47-0x52 (type 2) and can be hot-reloaded; section 70 holds one
  more board (possibly the Classic board; unverified).
* A cell is expected to hold a section-12 row id, with 0xFFFF for an empty square (both unconfirmed).
* Section 12 has a hard limit of 368 rows; repurpose reserve rows 361-367 instead of adding rows.
* **License chips** (the square graphics) are built in memory from existing icon elements; the Toolkit
  can move them or compose new ones from those elements. Xeavin did not remember whether it can
  recolour them; if not, the texture has to be edited. The game file holding the chip data is not
  known, so chip edits are memory-only. Edit them while a license board is on screen and export
  before leaving: changing screens resets every value [chat #846, #866-867]. eochaid's "License Chip
  Index" sheet lists the fields (Icon Set, 1st Text Link, Animation, Text Color, 2nd Text Link, X, Y);
  the four magick categories differ only in the 2nd text link (8, 9, 10, 11) [chat #866].
  See [`enums-license-chips`](formats/enums-license-chips.md).
* License **names** are text (text tool), not textures or Toolkit data [chat #836-840].

---

## 5. ARD (`*.ard`, also EBP section 19): area foe data

Container: [`container-ard`](formats/container-ard.md). Magic `FF12AR03`, 10 section offsets relative
to the ARD start (0 = absent). Sections are stored 0, 2, 3 ... 9 with 16-byte padding, then **section 1
last with no padding after it**.

| # | Content | Spec |
|---|---|---|
| 0, 5, 6 | unknown | keep raw |
| 1 | Models ("model motions"): u32 count + 8-byte rows | [`ard-models`](formats/ard-models.md) |
| 2 | Classes (species): st2e 84 | [`ard-classes`](formats/ard-classes.md) |
| 3 | AI scripts ("battle logics"): scripts of up to 32 groups of 24-byte entries | [`ard-aiscripts`](formats/ard-aiscripts.md), [`ard-aiscripts-sheet`](formats/ard-aiscripts-sheet.md) |
| 4 | Units (encounter rows: name, class, stats rows, 4 AI links, weapon, drops...) : st2e 88 | [`ard-units`](formats/ard-units.md), [`foe-drops`](formats/foe-drops.md) |
| 7, 8 | Default and additive stats: st2e 56 each | [`ard-stats`](formats/ard-stats.md) |
| 9 | Special action animations | [`ard-specialactionanimations`](formats/ard-specialactionanimations.md) |

What the community learned:
* New AI entries are added by unpacking the ARD with `ff12-ard.exe` [chat #270]. Adding new lines to
  the AI grid was asked about and not answered [chat #681]; `ard-aiscripts` now gives the rebuild rules.
* AI is addressed as slot -> group -> entry (Garuda-egi: AI slot 1 = group 8, entries 1-2)
  [chat #606-614]. Some groups react to events: the Eksir Berries set a "battle work think" variable
  that turns off Garuda-egi's Attack CT0 and Attack Plus augments; it can be reversed in the AI
  [chat #574-604]. Enemies that spam spells do so because of their AI; switching to melee when MP runs
  out is an AI edit [chat #384-391].
* Whether a foe uses its base attack or its weapon attack is chosen in the ARD; the label "attack" vs
  "slap" is only a name [chat #637-641].
* AI action ids `0x8000 + n` pick a weighted action from battlepack section 10 package n
  (`foe-action-packages`, `enums-ai-actions`). Condition and target-type ids:
  [`enums-ai-conditions`](formats/enums-ai-conditions.md), [`enums-ai-target-types`](formats/enums-ai-target-types.md).
* Foe "Chainbreaker" spawns can be scripted by checking the chain count, but the counter may be outside
  the save area [chat #238-243]. Spawn placement is in the EBP script, not the ARD.
* Rare Game behaviour can be scripted [chat #462].

---

## 6. EBP (`*.ebp`): area and event blueprints

Container: [`container-ebp`](formats/container-ebp.md). Magic `EBP2`, a 0x80-byte header with 20
absolute section offsets (0 = absent). Read sections by sorting the offsets; keep the original
physical order when rebuilding; copy header bytes 0x04-0x0F and 0x60-0x7F; **never drop section 6**
(the Workshop's naive repack loses it).

| # | Content | Spec |
|---|---|---|
| 0 | Compiled field/event script (VM bytecode); decompiled by `ff12-script` into `<map>.c` + `<map>.src.data` | not specified (see [`vm-script-runtime`](formats/vm-script-runtime.md), [`treasure-chests`](formats/treasure-chests.md)) |
| 2, 3 | Dialogue text tables | text format not documented |
| 4 | Navigation (map) icons, `NAVIICN2` | [`ebp-navigationicons`](formats/ebp-navigationicons.md) |
| 6 | Texture, `TIM2` | [`tim2`](formats/tim2.md) |
| 8, 10 | Camera mappings, `CML1` (10 is probably camera shakes) | [`ebp-cameramappings`](formats/ebp-cameramappings.md) |
| 9 | Cameras, `CAM7` | [`ebp-cameras`](formats/ebp-cameras.md) |
| 12 | Model list | [`ebp-models`](formats/ebp-models.md) |
| 16 | Positions, `FF12POS3` (spawn points / "hot spots") | [`ebp-positions`](formats/ebp-positions.md) |
| 19 | Nested ARD | [`container-ard`](formats/container-ard.md) |
| 1, 5, 7, 11, 13-15, 17, 18 | unknown | keep raw |

### 6.1 Script data: traps, chests and event rectangles

* **Traps are not in the decompiled script.** `btl_trap_ctrl` / `settrapresource(0x3000001)` only sets
  the trap model [chat #114-124]. Trap positions are not in section 16 either [chat #127].
* The trap table is in the script's **data area** (`<map>.src.data`), e.g. `srb_b04.src.data` at 0x0390
  [chat #128-162]: u32 count (5 there), then `count` u32 offsets relative to the count field, each to a
  12-byte record [chat #134-142]. Record: u16 X at 0x00, u16 Z at 0x02 (2-D ground coordinates), u8
  respawn flag at 0x04 (0xFF = respawns every visit; other values index the one-time flag bitfield at
  RAM 0x02165934, shared with non-respawning treasure; untested), u8 at 0x05 (0x64 or 0), u16 action 1
  at 0x06, u16 action 2 at 0x08 (one of the two is picked at random), u16 at 0x0A (seen as 0x0A)
  [chat #137-171]. Any action id works in principle (X-Zone, heals...); some may misbehave
  [chat #181-196]. Changing an action's own definition in section 14 changes every trap and foe that
  uses it [chat #188-191].
* Offsets do not add up: 0x0390 + 4 + 5*4 = 0x03A8, but the first record is at 0x03AC. Follow the
  offsets instead of assuming packed records.
* Nothing in `.src.data` is read automatically; a script call must point at it, probably indirectly.
  Adding traps needs that reference to be found [chat #164-219]. The current decompiler/compiler
  ignores the trap values [chat #140]. Today traps can only be changed by hex editing [chat #172-181].
* Treasure chests sit in the same data block: 24-byte records (index, X, Y, flags with "randomize gil",
  unique id, spawn %, gil %, two normal and two Diamond Armlet item picks, two gil amounts)
  (`treasure-chests`). Locating the table needs the *Vanilla Chests* sheet offsets or a pattern scan.
* Event rectangles are set in script: `setrect_25(x, y, z, w, h, rot)` with float world coordinates,
  then option bits 0x10000 circle, 0x20000 not for chocobo, 0x40000 not for summons, 0x80000 no
  event-wake rect, 0x100000 leader-only touch, and the low 16 bits for another value [chat #221].
  Vanilla scripts contain dead patterns (a constant then tested bit by bit, 10 ifs instead of a loop)
  [chat #224-227].
* Changing a rare-game spawn condition (Nekhbet in `dst_a03`) means removing the entryXX / spawnXX /
  respawnXX blocks, changing `spawnData(2, false)` to `spawnData(1, false)` and checking `.src.data`
  offset 0xC8 (an offset in the binary, not a line number) [chat #1047-1067].
* Rewriting foe placement from scratch is practical, but quest and story logic share the same scripts
  [chat #225-230]. Twiska drew a spawn map by hand for lack of a tool [chat #231-232].
* New NPCs (a shopkeeper in Muthur Bazaar) can be added; scripts can read and write anything in the
  save area [chat #241, #276-309].

---

## 7. Otherpacks (`tex2pack_ys`, `texpack_ys`, `mrppack_ys`, `clutpack_ys`, `fontpack_fs`, `fontpack_it`)

Spec: [`container-otherpack`](formats/container-otherpack.md). A list of absolute section offsets ended
by 0xFFFFFFFF, header filled with **0xFF** to 16, then sections zero-padded to 16. No count, no end
offset. Expected section counts: clutpack 4 (`CLT2` palettes), texpack 5, fontpack_it 6, fontpack_fs 7,
tex2pack 11 (TIM2), mrppack 23 (MRP). Identify sections by magic (`TIM2`, `MRP`, `CLT2`).

Xeavin's unpack.bat closed instantly with no output when given `tex2pack_ys.bin` [chat #777-779];
`ff12-pack.exe` later unpacked and repacked its `.tm2` files cleanly [chat #794, #821].

---

## 8. TIM2 textures (`.tm2`)

Spec: [`tim2`](formats/tim2.md). Standard PS2 TIM2 (file header 16 bytes, picture header 48 bytes with
GS registers), plus an FFXII `eXt` block that cuts the texture into icon sections -> groups -> icons,
each with its own palette choice. MRP entries address icons by (texture, section, group, entry).

Where TIM2 occurs: stand-alone `.tm2` (menu folder), otherpack sections, EBP section 6, himgd image
packs, and inside other formats such as efx [chat #0-3].

* ffgriever's `efx_unc_pc.exe` extracts TIM2 from efx files. Files in the event and menu folders that
  hold TIM2 with palettes are not covered yet [chat #0-3]. ffgriever knew of no file that is a bare
  TIM2 [chat #1], yet the `tm2_menu` folder holds stand-alone `.tm2` files (drive batch 03), so his
  remark probably meant the event/menu files Aquarius Camus asked about.
* Workflow used in Sept 2020: `ff12-pack` to unpack, Rainbow to convert TIM2 <-> PNG, `ff12-pack` to
  repack. The Photoshop TIM2 plug-in is harder to set up [chat #794, #825-831]. The romhacking.net
  "Textures Extractor/Reinserter" (utility 659) scans any file for TIM data but is not needed
  [chat #791-794].
* Decoding notes (drive batch 03): 8-bit images use 256-colour palettes in CSM1 order (swap entries
  8-15 and 16-23 in every 32-entry block); 4-bit images store the low nibble first and their 16-colour
  palettes must **not** be reordered; alpha runs 0-128 (double it, clamp to 255).
* Editing a texture does not rename a license or recompose its chip [chat #836-840].
* Open: whether the PC build draws the TM2 or a matching `*.dds.phyre` HD texture (`tim2` gaps).

---

## 9. MRP menu layouts (`*.mrp`, `mrppack_ys.bin` sections)

Specs: [`mrp`](formats/mrp.md), [`mrp-sheet`](formats/mrp-sheet.md). Magic `MRP` + a state byte (0 on
disk, 1 in memory). A list of groups (positioned boxes, 20 bytes each), per group a run of
variable-length entries (type 1, 2 texture/icon, 4 container, 5 text, 6, 7 progress bar, 8 grid), and
a list of texture names (Shift-JIS). Entries have no table: walk them by the size byte at entry+0.
A group's entry-list offset is relative to the group record itself. In memory the game turns header
and group offsets into absolute addresses, so a live export must convert them back.

* License text overflow is fixed by **shifting existing positions** in the MRP; no new elements are
  needed, and Xeavin's MRP editor does it in a few minutes [chat #34-41]. Xeavin wrote the MRP tool
  (`mrp_unpack` / MRP editor) and a guide for it [chat #37-41].
* `mrppack_ys` is game file type 7, id 0xD3, and can be hot-reloaded.
* Ten stand-alone menu MRPs exist (gameover, title, title_menu, save_load, e3_logo, quest, shop_new,
  w_menu, loca, party_book); their archive paths are not verified.

---

## 10. Clan Primer (`menuhandbook*`)

Specs: [`container-himgd`](formats/container-himgd.md), [`menuhandbook-hctgf`](formats/menuhandbook-hctgf.md),
[`menuhandbook-hcomg`](formats/menuhandbook-hcomg.md).

| File | What it is |
|---|---|
| `menuhandbook_<cat>NNN.dat` (low numbers) | text tables (bestiary text = `menuhandbook_monster000-003.dat`) [chat #1035] |
| `menuhandbook_<cat>NNN.dat` (higher numbers) | `himgd` image packs: a table of TIM2 images. Keep the u16 at 0x08, the slot order and empty slots. |
| `menuhandbook_<cat>.bin` | `hctgf` category index: headers, entries, which text and picture each entry uses |
| `menuhandbook.bin` | `hcomg` global rules: Cartographer maps, Scrivener bestiary count, hunt ranks, defeated-foe figures, figure thresholds |

`<cat>` is knowledge, monster, person, story, tutorial or world. Identify files by magic, not by number.
Hunt progress descriptions need ffgriever's **old** text tool [chat #1040].

---

## 11. Text files

There is **no format spec** for FFXII text tables in this repo. What is known:

* `ff12-text` (ffgriever) unpacks text `.bin` and some `.dat` files to `.txt` and back; it does nothing
  else [chat #990-991]. It covers all game text except efx files and one special file that "wants to
  think it's an ebp" [chat #1033-1034]. Hunt progress descriptions need the old tool [chat #1040].
* Text lives in battlepack section 2, the 15 sub-sections of battlepack section 61, EBP sections 2 and 3,
  the Clan Primer `.dat` text tables and stand-alone text files. Twiska's Nexus article 73 lists the
  text files and where they are, with a template per file [chat #1036-1038].
* Batch files (originally by Raiden / Aquarius Camus, updated by Xeavin) wrap ff12-text for whole
  folders; the first version overwrote the source files [chat #957-1009].
* Markup seen in dialogue: `{dialog N}...{/dialog}` with numbered entries (new ones appended, 138-143),
  `{instant}` before a speaker name, `{choice}` with `{item}...{/item}` options, closed with or without
  `{/choice}`; a 10-option menu was written but not confirmed in game [chat #278, #302, #316]. Help
  strings contain tags such as `{link=N}` that must be preserved (drive batch 01). Accented characters
  (`Étem`) appear in mod text [chat #316].
* Text id spaces (which numbers mean which string family) are listed in drive batch 01, section A.2.

---

## 12. World files (game file type 9)

| Spec | File | What is missing |
|---|---|---|
| [`mrf`](formats/mrf.md) | Map Ref (id 4): locations (8-byte rows), regions (16-byte rows with weather slots), weather/terrain/footstep tables | file name, VBF path, sections 2-9 layouts |
| [`pc-skill-motion`](formats/pc-skill-motion.md) | id 5: model + stance -> animation file (10-byte rows) | file name, header, record count |
| [`behind-camera`](formats/behind-camera.md) | id 3: per-character camera presets (16 floats) | file name, header, meaning of 15 floats |

All three have runtime copies at known addresses, so a Lua script can edit them in memory today.

---

## 13. Executable and memory-only data

These have no game file that an offline editor can write (or the file is unknown). Edit them with the
Lua Loader or Cheat Engine. Addresses are for Steam 1.0.4.0.

| Spec | What | Root |
|---|---|---|
| [`save-game`](formats/save-game.md) | Save image: session, world (flags, 0x02165934 trap/treasure flags), menu, live battle blocks | 0x02164280 (Lua Loader `save` table); on-disk save wrapper undocumented |
| [`live-battle-unit-keep`](formats/live-battle-unit-keep.md) | Live party member / unit sheet (456 bytes) | `[0x02EBF190] + 0x08 + id*0x1C8` |
| [`live-battle-actor-chain`](formats/live-battle-actor-chain.md) | Actor work, unit work, model, keep | Battle Script Keep 0x02098E10 |
| [`license-board-runtime`](formats/license-board-runtime.md) | License squares of the board on screen | via `[0x0209AC60]`; lost on screen change |
| [`enums-license-chips`](formats/enums-license-chips.md) | License chip icon table | `[0x02CA9670]` |
| [`menu-section-runtime`](formats/menu-section-runtime.md) | Live menu tree and menu context | `[0x0209AC30]` |
| [`vm-script-runtime`](formats/vm-script-runtime.md) | Script VM: keeps, call targets, 100 opcodes, actor types | 0x01EFEA50 (opcodes) |
| [`global-message`](formats/global-message.md) | Corner pop-up messages | `[0x02AEE888]`; mostly unmapped |
| [`ui-settings`](formats/ui-settings.md) | HUD/menu layout and colour globals | only the HP gauge block has an address |
| [`enums-formulas`](formats/enums-formulas.md) | Battle formulas 0-108 built from functions 0-255 | formula table in the exe; address unknown |

Notes from the chat:
* A formula is a chain of about 6 functions (targeting, damage, status checks...); the action section
  picks the formula. More calls need a code extension; Xeavin planned one that combines function pieces
  [chat #85-91].
* A shot counter for armour-piercing ammo would be lost on reload unless stored in the save area; the
  Numerology counter could be reused [chat #79-83]. Guns already ignore defence unless the target has
  the matching augment [chat #75-78].
* Changing Confuse to cast Gil Toss was proposed, not tested [chat #249-251].
* Opcode sizes in the VM table must not be changed (desyncs every script; TK reference).

---

## 14. Enumerations and id lists

| Spec | Contents |
|---|---|
| [`enums-formulas`](formats/enums-formulas.md) | Formulas 0-108 and their functions. Community list: 1 Removes Statuses, 2 Add Buffs, 3 Add Debuffs, 4 Restores HP, 5 Restores all HP, 6 Removes KO, 7 Magic Damage, 8 Balance, 9 X-Zone, 10 Death, 11 HP Drain, 12 MP Drain, 13 Bubble, 14 Gravity, 15 Death Claw?, 67 Leech [chat #494]. The list has no spell class column; Twiska keeps his own [chat #484-486]. |
| [`enums-animations`](formats/enums-animations.md) | Cast, weapon finish, event (esper/script) and mist animations |
| [`enums-augments`](formats/enums-augments.md) | Augments 0-128 with vanilla parameters |
| [`enums-ai-actions`](formats/enums-ai-actions.md), [`enums-ai-conditions`](formats/enums-ai-conditions.md), [`enums-ai-target-types`](formats/enums-ai-target-types.md) | Battle-logic ids for ARD AI and gambits |
| [`enums-content-ids`](formats/enums-content-ids.md) | Content id blocks |
| [`enums-license-chips`](formats/enums-license-chips.md) | License chip graphics |
| Item icons | eochaid's "Icons" sheet (ID, Icon): 0 Hand, 1 Sword, 2 Greatsword, 3 Katana, 4 Ninja Sword, 5 Spear, 6 Pole, 7 Bow, 8 Crossbow, 9 Gun, 10 Axe, 11 Hammer, 12 Dagger, 13 Rod, 14 Staff, 15 Mace, 16 Measure, 17 Hand-bomb, 18 Shield, 19 Light Helm, 20 Mystic Helm, 21 Heavy Helm, 22 Light Armor, 23 Mystic Armor, 24 Heavy Armor; the rest was cut off. Ids above about 170 are mostly junk [chat #23-28]. |
| Toolkit lists | `editor/data/lists.json` (219 drop-down lists from The Insurgent's Toolkit) |

---

## 15. Tools and who made them

| Tool | Author | What it does | Source |
|---|---|---|---|
| The Insurgent's Toolkit (Cheat Engine table, "CET") | Xeavin | Live in-memory editor for the battlepack, ARD, EBP, MRP, TIM2, license chips, UI and more, with export to files and a hot file reloader. In Sept 2020 "the only tool that can edit everything". Includes an icon list and a VM call lookup script. | [chat #24-26, #369, #393, #411-433, #723-729] |
| The Insurgent's Workshop | Xeavin | Offline unpack/pack + JSON converter for most formats. Personal-use licence; used here only for facts. | specs |
| MRP editor / `mrp_unpack` | Xeavin | Edits MRP menu layouts; has a guide | [chat #34-41] |
| `ff12-pack.exe` (+ unpack.bat) | Xeavin per [chat #794]; one chat note says "ffgriever (implied)" | Unpacks/repacks packs (section 61, otherpacks, TIM2). Needs the **x86** .NET Core runtime from the Nexus Files tab (x64 fails; "hostfxr.dll could not be found" without it). Run the .bat from a console or add `pause` to see errors. | [chat #777-824, #953] |
| `ff12-text` | ffgriever | Text `.bin`/`.dat` <-> `.txt` | [chat #943-1040] |
| Old text tool | ffgriever | Hunt progress descriptions | [chat #1040] |
| `efx_unc_pc.exe` | ffgriever | Extracts TIM2 from efx files | [chat #0-1] |
| External file loader (battlepack sections) | ffgriever | Loads single battlepack sections from files | [chat #53-54] |
| `ff12-ard.exe` | not stated in the chat (recommended by Aquarius Camus; `container-ard` attributes it to ffgriever) | Unpacks ARD so AI entries can be added | [chat #270] |
| EBP decompiler/compiler (`ff12-script`) | not stated in the chat | Script -> `.c` + `.src.data` and back; ignores the trap table | [chat #117-140, #1047-1065] |
| Battlepack/enemy GUI editor (alpha) | Aquarius Camus (called Raiden) | File-based editor: unpacks to `battle_pack.bin_unpack`, repacks **only when closed**, stores the file path in an .xml next to the exe. Bugs in Sept 2020: crashes on paths with spaces, crash on selecting entries, gil read from the wrong property and capped at 255, wrote 255 into every selected weapon's gil, ammunition edits not saved, window opening off-screen, outdated flag labels, no section 29. | [chat #371, #407-469, #504-548, #587, #601, #665-675, #718-736, #850-891] |
| Text batch files | Raiden (Aquarius Camus), updated by Xeavin | Wrap ff12-text for folders | [chat #957-1009] |
| Aquarius Camus's three EBP tools | Aquarius Camus | Personal EBP script tools (rewritten) | [chat #145] |
| The Zodiac Party Editor (Nexus mod 25) | not stated | Obsolete; broken on the current game version | [chat #359-363] |
| Nexus FFXII mod 68 | not stated | Hidden since 10 June 2020 | [chat #356-358] |
| VBF Browser | not stated | Browses and extracts the VBF | [chat #402-416] |
| Vortex | Nexus Mods | Mod manager | [chat #4] |
| Rainbow | marco-calautti | TIM2 <-> PNG | [chat #793, #825-831] |
| Textures Extractor/Reinserter (romhacking.net utility 659) | third party | Scans files for TIM data | [chat #791-792] |
| Cheat Engine | | Runtime inspection; needed by the Toolkit | [chat #99, #368-393] |
| PCSX2 (GSdx) | | Used by Aquarius Camus for PS2-side screenshots | [chat #699-701] |
| Spreadsheets | eochaid | Icons sheet; Formulae List (Google Sheet `1yyflms0sghclccDE5R3qb-NdiTFkiMimmhbuX5iYWUk`); License Chip Index (`1TKyxjciZ-wDKQLBdx5gsGwnEM96HmsDw29qUDpwdl14`) | [chat #27-28, #494, #866] |
| Documentation | | Nexus articles 67 (battlepack, for the Toolkit), 73 (Twiska, text files), 95 (Xeavin, General Modding Guide, where each file goes); a GameFAQs mechanics FAQ with PS2 CT formulas; a community wiki with vanilla values | [chat #330, #405, #670, #965, #1036] |
| This repo | | `editor/` Battlepack Workbench / editor suite with a VBF browser; `x64/scripts/` Lua Loader summon mod | `README.md` |

Xeavin was writing a general guide (start-up, VBF Browser, Vortex, Toolkit) and a wiki was proposed
(Miraheze or ffgriever's server) [chat #4-19]. Twiska keeps EBP documentation and eochaid keeps
battlepack notes [chat #1029].

---

## 16. Gotchas (all in one place)

Battlepack
1. Changing a weapon formula alone gives 0 damage; also set the Power of the section-14 "Attack" action [chat #499-503].
2. Gil is a u16 buy price; 65535 = none; sell prices are computed; use the "cannot be sold" flag [chat #534-548, #688-697].
3. Status effects are fixed at 32 and shared by party and foes [chat #59, #509-513].
4. Section 8 entry counts set starting gambit slots; keep at least 2; Vaan and Penelo get one extra from code [chat #55].
5. Moving a magick to another line needs matching flags (silence) and a section-29 icon edit [chat #707, #873-884].
6. Many action fields are read only by some formulas (knockback) [chat #649-658].
7. Foe weapon attack power and charge time are mostly ignored [chat #630-642].
8. Treat fields as unsigned [chat #617-622]. MP is capped at 999 [chat #374-389].
9. Section 61 must be unpacked as a pack before the text tool [chat #943-954].
10. Balance shows as formula 8 in one tool and also works as 108 [chat #478-488].

Files and tools
11. Keep backups: a buggy editor wrote 255 into every selected weapon's gil [chat #665-675]; restore from a backup or the wiki.
12. Do not edit the same battlepack with two tools without backups [chat #725-733].
13. ff12-pack needs the x86 .NET Core runtime; unpack.bat fails silently on unsupported input [chat #777-824].
14. Mixing the pack tool's and the text tool's batch files produced 14 `.tm2` files instead of text [chat #1016-1019].
15. The first text batch files overwrote their source [chat #980-983].
16. In the Toolkit, change values only; never tick address rows; pick sections in "Section Base" [chat #895-924].
17. License chip edits reset on any screen change; export first [chat #867].
18. Raiden's editor crashed on paths with spaces and repacked only when closed [chat #438-469].

EBP and scripts
19. Trap data is in `.src.data`, not the script and not section 16; offsets are relative to the count field; the first record is 4 bytes later than expected [chat #127-142].
20. The decompiler ignores trap data; check that recompiling does not overwrite `.src.data` edits [chat #140].
21. Trap X/Z are u16 ground coordinates; script rects use floats; the mapping is unknown [chat #137-143, #221].
22. A trap's one-time flag shares the treasure flag array, so reused indexes collide [chat #156-171].
23. Offsets in instructions such as "go to 0xC8" are binary offsets in `.src.data`, not lines in `.c` [chat #1053-1067].
24. The EBP repack in the Workshop drops section 6; keep it (`container-ebp`).
25. ARD section 1 must stay last with no padding after it (`container-ard`).
26. Official game updates can break script features [chat #253-255].

---

## 17. Open questions

Battlepack
* Vanilla offset of section 0 (0x130?) and whether the file is padded after the end offset; contents of
  sections 1, 4, 19-25, 27 (layout), 36, 40, 43-56, 62-67.
* Section 8 layout (split vs interleaved) and the empty-slot value; section 12 name/description order;
  section 69 fade colour byte; section 6 signedness.
* Which of the 20 section-3 damage rows belong to Martyr, Inquisitor and Warmage; whether 2600-2999 is
  a typo [chat #96]; whether Martyr can be linked to a formula [chat #98-100].
* Why Balance works as both 8 and 108 [chat #478-481]; which equipment values are ignored when a weapon
  uses an action formula [chat #503]; which formulas read knockback [chat #649-651].
* Where the extra Vaan/Penelo gambit slot is granted in the exe [chat #55]; whether there is room for
  more status bits [chat #59].
* What the "remaining 128 entries" Twiska needs are [chat #45].
* Whether appended rows (actions, party members...) are accepted by the engine.
* Naming expected by ffgriever's external section loader [chat #53-54].
* Does the 999 MP cap apply to players, and what do larger values do [chat #374-388]?

ARD / EBP / scripts
* How scripts reference the trap and chest tables; meaning of trap bytes 0x05 and 0x0A; the 4-byte gap;
  whether 0x04 really indexes the treasure flag array [chat #146-219].
* ARD sections 0, 5, 6; where the base vs weapon attack choice is [chat #637]; the "-10" Garuda value
  [chat #683-684]; what "unk 16" target means [chat #614].
* EBP sections 1, 5, 7, 11, 13-15, 17, 18; header bytes 0x04-0x0F; VBF folders of `.ebp` files.
* Meaning of `spawnData` arguments and `.src.data` 0xC8 in `dst_a03` [chat #1053-1067].
* Is the chain counter in the save area [chat #241-243]? How does a shop's "custom event" work [chat #273]?

Textures, menus, text
* Which event/menu files embed TIM2 with palettes and in what container [chat #0-3].
* Which file holds the license chip data [chat #866-867]; which MRP section is the license screen.
* Text table format; which file "wants to think it's an ebp" [chat #1034]; the hunt progress file
  [chat #1040]; where the clan primer text outside the battlepack lives [chat #1035].
* MRP header words and entry types 4/6/8; himgd `index`; hctgf `type`.
* Icon ids past 24 [chat #28].

Memory
* The on-disk save format (wrapper, checksum).
* Address of the formula table in the exe; Numerology counter location [chat #79-83].
* Do the PS2 CT formulas still apply in TZA [chat #330]?

---

## 18. Corrections to Battlepack Workbench

Checked `editor/src/core.js`, `editor/src/editors/battlepack.js` and `editor/data/bpack_schema.json`
against the specs. Items marked **(reproduced)** were confirmed by running the code under Node.

### 18.1 Field types that corrupt or misread data

1. **Section 16 `mistBars` (+0x46) and `initialMpPercentage` (+0x47) are typed u32; both are u8**
   (`battlepack-s16-party-members`). The form shows garbage, and setting `mistBars` writes four bytes:
   it zeroes `initialMpPercentage` and the low 16 bits of `statusEffects` (+0x48). Setting
   `initialMpPercentage` overwrites status bits 0-23. **(reproduced: bytes 05 64 11 22 33 became 03 00 00 00 33.)**
2. **Section 69 `flags` is a bf32 at +0x07 in an 8-byte row**; it is a bf8. Reading it reaches 3 bytes
   into the next row, and on the last row of a section without padding it throws a RangeError.
   **(reproduced with a 2-row section_069.bin.)**
3. Section 16 `maxHp`/`maxMp` (+0x16/+0x1A) are s16; they are u16 (values above 32767 shown negative)
   [chat #617-622]. `weight` (+0x7A) is u16 in the Workbench and s16 in the spec.
4. Section 14 `gambitPage`/`gambitPageOrder` (+0x38/+0x39) are u8; the spec uses s8 (-1 = none).
5. Section 3 shows both row layouts on every row and types `steps`/`mpLimit` as s32. Rows 0-19 are
   damage tiers (u16, u8, u8, 4 unused bytes); rows 20+ are walking tiers (u32, u32).
6. Section 6 rate bytes are u8 in the Workbench, s8 in the spec (sources disagree).

### 18.2 Fields the Workbench cannot reach

7. **Section 8** exposes only slot 1 (`gambit1..gambit12` is one unexpanded group) and uses the
   interleaved (target, action) reading. If the Workshop's split layout is right, editing "action" at
   +0x02 overwrites target 2. Expand to 12 slots, choose the layout after checking vanilla data, and
   warn about the slot-count rules [chat #55].
8. **Section 12** `content1..content8` is one u16 at +0x08 (contents 2-8 at +0x0A-+0x16 are not
   editable); name and description are in the Lua Loader order, the reverse of the Workshop's.
9. **Section 60** `inventory1..inventory64` is one content field (+0x10) and one quantity (+0x90).
10. **Section 13 attribute list** (24-byte records from header +0x18 to the section end) is not shown;
    `attributePointer` at +0x28 is a byte offset into it (index x 24).
11. **Sections 10 and 39** are hex-only although `battlepack-s10-action-groups` / `foe-action-packages`
    and `battlepack-s39-shops` now describe them.
12. **Section 70** (`licd`) is parsed as an opaque blob; `battlepack-s70-license-board` describes it.
13. **Section 61** sub-sections are opaque blobs (expected until the text format is documented).
14. Section 27 has a schema from the Lua Loader docs (20-byte rows) but the Toolkit says the section is
    bespoke (lists at +0x0C and +0x1C) and there is no spec; mark it unverified.
15. Trailing unknown bytes the specs list are missing from the schema (s7 0x1E-0x1F, s26 4-7, s29/s30
    byte 7, s31 4-12, s59 0x2A-0x2B); the hex view still shows them, so this is cosmetic.
16. Name differences only: s14 `areaOfEffectSize`/`ConeAngle`/`LinearSize` vs spec `areaOfEffectRange`/
    `areaOfEffectPositioningRange` [chat #616].

### 18.3 Container parsing (`core.js`)

17. **RAM-dump rebasing is off by 12 bytes.** `parsePack` assumes the first section starts right after
    the offset table (`4 + 4*(N+1)` = 0x124); with 16-byte alignment it starts at 0x130, so every section
    is read 12 bytes early and st2e magics are missed. **(reproduced: section 13 parsed at 0x124 as a blob.)**
    Use `align16(4 + 4*(N+1))` and confirm by finding `st2e` at a known section.
18. **Nested packs are detected by a heuristic on every section** (`looksLikePack`). Only section 61 is a
    nested pack (15 sub-sections). Hard-code it, check its count, and stop guessing elsewhere (sections 2,
    1, 4 and the other unknowns could be mis-split).
19. The section count is accepted from 1 to 256; the battlepack always has 71. Warn when it does not.
20. A section offset of 0 is treated as "missing". The spec says empty sections repeat the next offset
    and 0 never occurs; flag 0 as a malformed file.
21. There is no rebuild path: only same-size edits are possible. The spec's rules (re-lay sections in
    index order, zero-pad to 16, empty section = next offset, end offset before the final padding,
    rebuild section 61 first, keep the count at 71) allow appending rows to st2e tables, section 10 and
    39 lists, section 3 walking tiers and section 42.
22. `RAW_ONLY` lists 10 and 39; sections 0, 13, 27, 61 and 70 also have bespoke layouts (TK L978).

### 18.4 Editor module (`battlepack.js`) and exports

23. **A single st2e section with entry size 52 opens as section 14.** The fallback map uses 0x30 for
    section 13; the real entry size is 0x34. **(reproduced with `export.bin`.)** The synthetic sample also
    builds section 13 with 0x30-byte rows and section 15 with 0x10-byte rows (real: 0x34 and 0x28).
24. **The Lua patch assumes every section is st2e** (entry size at +0x08, list at +0x0C) except section
    0. For blob sections (2, 10, 27, 39, 61.x, 70) the generated patch writes to the wrong address. Emit
    section-relative byte offsets for those, or refuse to export them.
25. The README still says the layout was "inferred" and that 10 and 39 must stay hex-only; the
    container is now specified and 37 battlepack sections have specs.

---

## 19. Editor catalog (summary)

Ranked by what to build first. "Ready" = every byte the editor writes is specified; "partial" = some
parts are opaque or locating the data needs extra work; "research" = the file layout is not known;
"memory" = only a Lua Loader / Cheat Engine editor is possible.

| # | Editor | Files | Feasibility | Specs |
|---|---|---|---|---|
| 1 | Battlepack Workbench v2 (fixes above + sections 10, 13 attributes, 39, 70, 61 container, row append) | `battle_pack.bin`, `section_NNN.bin` | ready | `container-battlepack`, `container-st2e`, `battlepack-s*` |
| 2 | License board editor | section 70, `board_1-12.bin` + section 12 | ready | `battlepack-s70-license-board`, `battlepack-s12-license-nodes` |
| 3 | ARD foe editor (units, classes, stats, drops, AI with add/remove lines) | `*.ard`, EBP section 19 | ready | `container-ard`, `ard-*`, `foe-*`, `enums-ai-*` |
| 4 | TIM2 texture viewer / PNG converter | `*.tm2`, embedded TIM2 | ready | `tim2` |
| 5 | Otherpack browser | `tex2pack_ys`, `texpack_ys`, `mrppack_ys`, `clutpack_ys`, `fontpack_*` | ready | `container-otherpack` |
| 6 | MRP menu layout editor | `*.mrp`, `mrppack_ys` sections | partial | `mrp`, `mrp-sheet`, `tim2` |
| 7 | EBP blueprint editor (positions, nav icons, cameras, models; hands off TIM2/ARD) | `*.ebp` | ready (listed sections) | `container-ebp`, `ebp-*` |
| 8 | Clan Primer editor | `menuhandbook*` | ready / partial | `container-himgd`, `menuhandbook-*` |
| 9 | Treasure chest and trap editor | map `.ebp` / `.src.data` | partial | `treasure-chests` |
| 10 | VBF browser + File Loader deploy helper | `FFXII_TZA.vbf` | ready (exists) | `container-battlepack` (paths) |
| 11 | Id reference browser (formulas, augments, animations, AI ids, content ids, icons) | none (read-only) | ready | `enums-*` |
| 12 | Text editor | text tables | research | none |
| 13 | Save game editor | Lua Loader `save` table | memory | `save-game` |
| 14 | Live battle unit editor | runtime | memory | `live-battle-*` |
| 15 | License chip editor | runtime | memory | `enums-license-chips`, `license-board-runtime` |
| 16 | UI settings editor | exe globals | memory | `ui-settings` |
| 17 | World files (Map Ref, PC Skill Motion, Behind Camera) | type-9 files | research / memory | `mrf`, `pc-skill-motion`, `behind-camera` |
| 18 | Script VM / event inspector | runtime | memory | `vm-script-runtime` |
| 19 | Menu runtime inspector (menu tree, global messages) | runtime | memory | `menu-section-runtime`, `global-message` |
| 20 | Formula composer | exe | research | `enums-formulas` |
