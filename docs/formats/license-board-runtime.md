# License board runtime node records (0x34) and license state — memory-only

Spec id: `license-board-runtime` · machine spec: [`license-board-runtime.json`](./license-board-runtime.json)

> **MEMORY-ONLY (runtime).** This structure exists only in the running game process; there is no game file to patch for it. Edit it live (Lua Loader `memory`/`save` tables, Cheat Engine) or change the file data it is built from.

## What this is

The License menu does not draw the board files directly. When the board screen opens, the game builds one
**0x34-byte runtime record per square** from (a) the board grid file of the selected job (`board_N.bin` /
battlepack section 70, format `licd`, see [`battlepack-s70-license-board`](./battlepack-s70-license-board.md))
and (b) the license definitions in battlepack section 12 ([`battlepack-s12-license-nodes`](./battlepack-s12-license-nodes.md)),
plus the character's obtained-license bits. These records are thrown away and rebuilt from the files every time
the screen changes: a modder reports that live edits only work while a character's board is open and are lost
on any screen change (msg 867).

So this spec is for **live preview / prototyping** (move squares, recolour, change displayed cost). Permanent
changes go into the files: the grid (`licd`), section 12, and the icon atlas.

## Related runtime state

| What | Where | Source |
|---|---|---|
| Loaded board files | `[0x02EBF1A0]` = license board array (12 boards); boards are gameplay files type 2, ids 0x47-0x52, hot-reloadable with the Toolkit's File Reloader | TK L283, L1424, L1731 |
| License definitions | battlepack section 12 in memory: `[0x02EBF038]` -> st2e header; u16 entry count at +0x04, u16 entry size at +0x08, entry list pointer at +0x0C (absolute address in memory) | TK L278; Drive TheInsurgentsManifesto.lua:1019-1027; Drive DuplicateAugmentDetector.lua:451-470 |
| Owned licenses | Battle Unit Keep +0x194, 46 bytes, bit n = node n owned (byte n>>3, bit n&7); 368 nodes (0x16F + 1) | Drive DuplicateAugmentDetector.lua:250-292; Drive getLicenses.lua:2-370; TK L753 |
| Jobs / boards | Battle Unit Keep +0x1C3 job1, +0x1C4 job2, +0x1C5 selected job (JobList; 0xFF none) | Drive getBattleUnitKeep.lua:68-71; TK L755 |
| Character in menu | `s16 [[0x0209AC30] + 0xDE0]` = party member currently selected in the menu | Drive DuplicateAugmentDetector.lua:114-116 |
| Unlock routine | `0x00323910(keep, node, 1, 1)` marks a node owned and applies its effects | TK L472; Drive TheInsurgentsManifesto.lua:1062-1067 |
| Node colour/type | `0x00323890(section12.type)` maps a node type to its category (2 = augment-type nodes whose 8 contents are augment ids) | Drive DuplicateAugmentDetector.lua:270-282 |
| Menu view | Menu Section Plus "License Board" walks four nested indices (bounds 4, 16, 14, 32, 14) | TK L1249 |
| Icon atlas | `[0x02CA9670]`, 2 groups (Available / Obtained) x 4 entries, exportable | TK L1157 |
| UI constants | `LicenseBoard*` UI settings (node size, cost offsets, ball/face lengths) | TK L1459 |

## How the job reset uses this data (useful as a reference implementation)

For every node n of section 12 (Drive TheInsurgentsManifesto.lua:1010-1080, TK L541): if the character id
(keep +0x04) is 0-6 and section 12 entry n has that character's default-unlock bit (+0x07), the node is
re-unlocked through 0x00323910; otherwise an owned node is cleared from the keep bitfield and its LP cost
(section 12 +0x04) is added to the refund. Augment set 0x97 is re-applied, gambits reset, 0x20 augment bytes and
the Mist bar fields zeroed, and the job bytes set to 0xFF. The Toolkit's own version skips node 0x1F
(Essentials) and caps the refunded LP at 99,999.

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…` are not interpreted by any source; keep their original bytes. Overlapping rows are alternative views of the same bytes (the note says which applies).

### Record `licenseBoardNode` — 52 bytes (0x34), count: one per board square (board width x height, see battlepack-s70-license-board)

*Where:* One record per square of the board currently shown in the License menu. The Toolkit resolves the array from the MRP/menu section list at [0x0209AC60] ("[0209AC60]-derived"); the exact path is not in our write-up.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 8 | u64 | `nameTextPointer` | Pointer to the license name text shown for this square. |  | TK L1263-L1285 |
| 0x08 | 2 | u16 | `identifier` | License node id placed on this square (battlepack section 12 row, BpLicenseList). Width assumed 16-bit (next named field is at +0x0B). | `BpLicenseList` | TK L1263-L1285 |
| 0x0A | 1 | bytes | `unknown0A` | Not identified by any source; keep the original bytes. |  |  |
| 0x0B | 1 | u8 | `restriction` | Restriction class of the node (copied from section 12 +0x06). | `BpeLicenseNodeRestrictionList` | TK L1263-L1285 |
| 0x0C | 2 | u16 | `cost` | LP cost displayed/charged (section 12 +0x04 is the file value). |  | TK L1263-L1285 |
| 0x0E | 2 | u16 | `licenseIconLink` | Link into the license icon atlas (License Node Icon table at [0x02CA9670]: 2 groups Available/Obtained x 4 entries). |  | TK L1263-L1285; TK L1157 |
| 0x10 | 4 | u32 | `typeTextPointer` | Pointer to the license type text (32-bit; the flags start 4 bytes later). |  | TK L1263-L1285 |
| 0x14 | 4 | bytes | `flags` | Flags folder (bits not named in our write-up). |  | TK L1263-L1285 |
| 0x18 | 8 | bytes | `unknown18` | Not identified by any source; keep the original bytes. |  |  |
| 0x20 | 1 | u8 | `column` | Board column of the square. Editing column/row physically moves the square on screen. |  | TK L1263-L1285 |
| 0x21 | 1 | u8 | `row` | Board row of the square. |  | TK L1263-L1285 |
| 0x22 | 1 | u8 | `animationType` | Animation type (0-4). |  | TK L1263-L1285 |
| 0x23 | 2 | bytes | `unknown23` | Not identified by any source; keep the original bytes. |  |  |
| 0x25 | 1 | u8 | `alpha` | Alpha. |  | TK L1263-L1285 |
| 0x26 | 4 | bytes | `unknown26` | Not identified by any source; keep the original bytes. |  |  |
| 0x2A | 2 | u16 | `animationDelay` | Animation delay. |  | TK L1263-L1285 |
| 0x2C | 2 | u16 | `animationTime` | Animation time. |  | TK L1263-L1285 |
| 0x2E | 2 | bytes | `unknown2E` | Not identified by any source; keep the original bytes. |  |  |
| 0x30 | 1 | u8 | `tileType` | Tile state. | `LbneTileTypeList` | TK L1263-L1285 |
| 0x31 | 3 | bytes | `unknown31` | Not identified by any source; keep the original bytes. |  |  |

## Enums carried in the JSON spec

#### `LbneTileTypeList`

| Value | Label |
|---|---|
| 0 (0x0) | None |
| 1 (0x1) | Background |
| 4 (0x4) | Available |
| 5 (0x5) | Purchased |

#### `BpeLicenseNodeRestrictionList`

| Value | Label |
|---|---|
| 0 (0x0) | None |
| 1 (0x1) | Unique |
| 2 (0x2) | Quickening |
| 3 (0x3) | Summon |
| 4 (0x4) | Inaccessible |

#### `JobList`

| Value | Label |
|---|---|
| 0 (0x0) | White Mage |
| 1 (0x1) | Uhlan |
| 2 (0x2) | Machinist |
| 3 (0x3) | Red Battlemage |
| 4 (0x4) | Knight |
| 5 (0x5) | Monk |
| 6 (0x6) | Time Battlemage |
| 7 (0x7) | Foebreaker |
| 8 (0x8) | Archer |
| 9 (0x9) | Black Mage |
| 10 (0xA) | Bushi |
| 11 (0xB) | Shikari |
| 12 (0xC) | Classic Board |
| 255 (0xFF) | None |

#### `LnieGroupList`

| Value | Label |
|---|---|
| 0 (0x0) | Available |
| 1 (0x1) | Obtained |

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `BpLicenseList` | battlepack section 12 rows 0-367 (license nodes) |

## Editing recipe (live preview)

1. Open the License menu on any character's board.
2. Walk the node records (Toolkit: License Board Node Editor) and change `column`/`row`, `cost`,
   `licenseIconLink` or `tileType`. Do not leave the screen, or the records are rebuilt (msg 867).
3. To keep the layout: write the same moves into the `licd` grid file (swap the two cell values), costs and
   names into section 12, then hot-reload the boards (File Reloader -> License Boards, file ids 0x47-0x52) and
   reset jobs so owned bits match (TK L1726-L1732).

## Round-trip rules

- Memory-only: records are rebuilt from the board file + section 12 whenever the license screen changes; nothing here is saved.
- Edit in place while the board screen stays open; do not touch nameTextPointer/typeTextPointer unless pointing at valid game text.
- column/row are single bytes: a board cannot exceed 256 columns or rows; the menu layout is a tighter practical limit.
- Persist changes in the files (licd grid, battlepack section 12), never by writing these records anywhere.

## Known unknowns

- Exact pointer path from [0x0209AC60] to the node record array, and the array length/ordering.
- Bits of the flags folder at +0x14 and bytes 0x09-0x0A, 0x18-0x1F, 0x23-0x24, 0x26-0x29, 0x2E-0x2F, 0x31-0x33.
- Width of identifier (+0x08) and animationTime (+0x2C) fields.
- Element format of the license board array at [0x02EBF1A0].
- License Node Icon record layout (only "2 groups x 4 entries" is known).

## Source keys

| Key | Source |
|---|---|
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of Xeavin's *The Insurgent's Toolkit* Cheat Engine table for FFXII TZA Steam 1.0.4.0), line n. |
| LL `<page>:<line>` | FF12 Lua Loader documentation, `docs/capabilities/<page>.md` (e.g. `save-config`, `memory`, `event`, `bpack`). |
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (fact reference only; its licence forbids copying or converting its code). |
| Drive `<script>:<line>` | Lua mod scripts from the user's Google Drive export (scratchpad `drive/` folder; file named `<id>__<script>`). Most are by Xeavin (*The Insurgent's Forge* helper classes such as `getBattleUnitKeep.lua`, and the mods *Manifesto*, *Companions*, *Itemized Bazaar*, *Thrifty Bazaar*); others by FehDead (`Wayfarer.lua`, `mappings.lua`, `frame.lua`, `layout.lua`) and LowPriorityCitizen (`helpers.lua`, `DuplicateAugmentDetector.lua`). They target the same Steam build as the Toolkit (same absolute addresses). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
| Lists `<name>` | Drop-down lists of The Insurgent's Toolkit (`editor/data/lists.json`, or the full extraction `ct_lists.json`). |

All absolute addresses (e.g. `0x02EBF190`) are for the Steam build the Toolkit targets (1.0.4.0); they are
module-relative offsets as used by Cheat Engine and the Lua Loader. `[X]` means "the 64-bit pointer stored at X".

### Drive files cited

| Script | Drive file id(s) |
|---|---|
| `DuplicateAugmentDetector.lua` | `1KOL2TrNfVdYdMRT07pGUPPPsn2m8z3AM` |
| `TheInsurgentsManifesto.lua` | `1WWjJQxzPr1cVY7qMoJTFhGhpjDw5-wyv` |
| `getBattleUnitKeep.lua` | `192LKrY1yAs8dUOOfvfZnF1L9lIFWXzja` (Forge class with offsets); `12ctZrUP5nbys1UtKGyvxeRJ0fWH4lT3U` ("array helper": party keep address) |
| `getLicenses.lua` | `1TomiLOpD9apHALTmrruvg0dIKHAZF6Rb` |
