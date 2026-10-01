# License Board grid (licd) — battlepack section 70 and board_1-12.bin

Spec id: `battlepack-s70-license-board` · machine spec: [`battlepack-s70-license-board.json`](./battlepack-s70-license-board.json)

The license boards are plain grids of license ids behind an 8-byte `licd` header. The same format is used by
battlepack **section 70** and by the twelve standalone board files `board_1.bin` … `board_12.bin`: the Workshop
sends all thirteen to one reader (IW Resources/JsonFile.cs:61-62, IW Formats/Battlepack/LicenseBoard.cs). A board
only says **where** each license sits; **what** a license is (name, LP cost, type/colour, restriction, default owners,
granted contents) is the license-node table in section 12 (`battlepack-s12-license-nodes`).

## Where the data lives

| Item | Value | Source |
|---|---|---|
| Battlepack copy | `battle_pack.bin` section 70 (the last section of the 71-section pack) | IW Resources/JsonFile.cs:61, IW Resources/PackFile.cs:20 |
| Standalone boards | files named `board_1.bin` … `board_12.bin` (the Workshop matches the name in any folder) | IW Resources/JsonFile.cs:62 |
| Game file ids | gameplay files (type 2) 0x47-0x52, twelve boards; the Toolkit's File Reloader can hot-load them | TK L1424, L1731 |
| In memory | the game keeps an array of the 12 loaded boards (global 02EBF1A0) | TK L283 |
| Folder in the VBF | not stated by any source; search the archive for `board_*.bin` (likely beside `battle_pack.bin` in a `test_battle/<lang>/binaryfile` folder; unverified) | - |

## Container

* **Section 70** is located through the battlepack offset table like any other section (see
  [`container-battlepack.md`](./container-battlepack.md)); offsets inside it are relative to the section start.
  Because it is the last section, resizing it only moves the pack's end-of-data offset. The Toolkit's battlepack
  hot-reloader has a bespoke fix-up for section 70 (TK L1422).
* A **board file** is the bare grid: the whole file is one board, starting at offset 0, no outer container.

### Layout (`licd`)

```
+0x00  char[4]  'licd'            magic 6C 69 63 64
+0x04  u16      columnCount  W
+0x06  u16      rowCount     H
+0x08  u16      cell(0,0) cell(0,1) ... cell(0,W-1)        row 0, column 0 .. W-1
       u16      cell(1,0) ...                              row 1
       ...
       u16      cell(H-1,W-1)
       00 ..    zero padding to a multiple of 16 (written by the Workshop)
```

* The magic is checked on read and written back unchanged (IW LicenseBoard.cs:12, :31-34, :57).
* Width comes first, then height (IW LicenseBoard.cs:36-37, :58-61).
* Cells are 16-bit, stored **row-major**: the outer loop walks rows, the inner loop walks columns, both when reading
  (IW LicenseBoard.cs:44-51) and when writing (IW LicenseBoard.cs:63-70). Square (row *r*, column *c*) is at
  `8 + 2*(r*W + c)`.
* The Workshop's JSON nests the other way round ("Column j" → "Row i", IW LicenseBoard.cs:14-15, :39-42) and insists
  that every column has the same number of rows (IW LicenseBoard.cs:20-24); that is a presentation choice, not the disk
  order.
* After the last cell the writer pads with zeros to a multiple of 16 (IW LicenseBoard.cs:71).

Size: `8 + 2*W*H`, then padded to 16. For example a 24 × 24 grid (the usual board size; not confirmed by these
sources) is 8 + 1152 = 1160 bytes, padded to 1168.

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…`/`unused…` are not interpreted by any source; keep their original bytes.

### Record `header` — 8 bytes (0x8), count: 1

*Where:* Offset 0 of the board: start of battlepack section 70, or start of a board_N.bin file.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `magic` | ASCII 'licd' (6C 69 63 64); reject the data if different. |  | IW Formats/Battlepack/LicenseBoard.cs:12,31-34,57 |
| 0x04 | 2 | u16 | `columnCount` | Grid width W (number of columns). |  | IW LicenseBoard.cs:36,58,60 |
| 0x06 | 2 | u16 | `rowCount` | Grid height H (number of rows). |  | IW LicenseBoard.cs:37,59,61 |

### Record `cell` — 2 bytes (0x2), count: header.columnCount * header.rowCount

*Where:* offset 8 + 2*(row*header.columnCount + column) from the start of the board; cells are stored row by row (all columns of row 0, then row 1, ...); row-major, NOT the column-major nesting of the Workshop JSON

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `licenseNode` | License placed on this square: a section 12 row id (0-367). Squares without a license hold a sentinel, expected 0xFFFF (unverified). | `BpLicenseList` | IW LicenseBoard.cs:44-51,63-70; IW LicenseNodes.cs:18-21; TK L1726-L1732 |

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `BpLicenseList` | section 12 license node rows 0-367 (0 = Quickening 1, 31 = Essentials, 360 = Second Board, 361-367 reserve) |

## What a cell means

* A cell holds a **license node id**, i.e. a row of battlepack section 12 (0-367; row names in Lists: BpLicenseList,
  e.g. 0-17 quickenings, 18-30 espers, 31 Essentials, 32+ weapon/armour/magick/augment licenses, 360 Second Board).
  This reading fits the 368-row cap of section 12 (IW LicenseNodes.cs:18-21) and the Toolkit's recipe that edits
  section 12 and then reloads the boards (TK L1726-L1732); no source spells out the cell → row mapping, so treat it as
  the expected meaning until checked against a vanilla board.
* Squares without a license need a sentinel. No source names it; 0xFFFF (the usual "none" value of the game's u16
  ids, msg 534/620, Toolkit lists) is expected. An editor should show any value above 367 as raw/empty and write it
  back unchanged.
* Node 31 "Essentials" is special: the Toolkit's job reset refunds every node except it (TK L541).
* When the board screen is open the game builds one 0x34-byte runtime record per square holding the node id
  (+0x08), cost, icon link, tile state and the square's **column (+0x20) and row (+0x21) as single bytes**
  (TK L1263-L1285). Grid dimensions therefore cannot exceed 256 in either direction; the menu layout constants
  (`LicenseBoard*` UI settings, TK L1459) are a tighter practical limit.

## Which board is which

* There are twelve board files and twelve jobs (Lists: JobList: 0 White Mage, 1 Uhlan, 2 Machinist, 3 Red
  Battlemage, 4 Knight, 5 Monk, 6 Time Battlemage, 7 Foebreaker, 8 Archer, 9 Black Mage, 10 Bushi, 11 Shikari;
  12 = "Classic Board"). That `board_N.bin` belongs to job N-1 is a reasonable guess, not a sourced fact.
* What the copy in section 70 is used for is not documented; being a thirteenth board it may be the "Classic Board"
  of JobList id 12 (hypothesis).

## Editing recipes

* **Move a license:** swap the two cell values. **Remove one:** write the empty sentinel. **Add one:** write its
  section 12 row into an empty square. Which squares count as neighbours for unlocking is a game rule not covered by
  these sources.
* **Change what a square grants / costs / looks like:** edit the section 12 row, not the board.
* **Apply in a running game:** hot-reload the boards (Toolkit File Reloader → License Boards, file ids 0x47-0x52)
  and reset affected characters' jobs so their obtained-license bits match the new layout (TK L1731-L1732).
* **Resize the grid:** change W/H, rebuild all W*H cells row-major, recompute the padding. For section 70 update the
  battlepack end-of-data offset (and keep the file padded to 16); a board file simply changes length.

### Text

No strings. License names and help texts are text ids stored in section 12.

## Pointers

None inside the grid. Outgoing ids: every cell -> section 12 row. When section 70 changes size, only the battlepack's
final (end-of-data) offset moves, because it is the last section.

## Round-trip rules

- Keep the magic 'licd' and keep columnCount/rowCount equal to the real grid (cell count = W*H).
- Cells are row-major: (row r, column c) at 8 + 2*(r*W + c). Do not write the Workshop JSON's column-first nesting to disk.
- Edit cells in place for moves/additions/removals; nothing else in the file changes.
- Copy cell values that are not license ids (the empty sentinel) unchanged.
- Keep the trailing zero padding to a multiple of 16; when the dimensions are unchanged keep the original file/section length byte for byte.
- Dimension change: rewrite the whole cell array, re-pad to 16; for section 70 also update the battlepack end-of-data offset (section 70 is the last section).
- Do not renumber section 12 rows without rewriting every board that references them.

## Known unknowns

- VBF folder of board_1.bin .. board_12.bin is not stated by the sources.
- Empty-square sentinel: 0xFFFF expected, not confirmed.
- Cell value = section 12 row id: expected from context, not stated explicitly.
- Vanilla grid dimensions (24 x 24 expected) and whether vanilla files are padded to 16.
- Which job each board_N.bin belongs to, and what the section 70 board is used for (possibly the Classic Board, JobList 12).
- Neighbour/adjacency rule for unlocking squares, and how far W/H can grow before the menu breaks.

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; license forbids copying or converting its code). Paths are relative to that repo, e.g. `Formats/Battlepack/Actions.cs`, `Formats/St2e.cs`, `Helpers/PackHelper.cs`, `Helpers/EnumHelper.cs`, `Resources/JsonFile.cs`, `Resources/PackFile.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| LL `sectionNN.md` | FF12 Lua Loader documentation, `capabilities/bpack-sections/sectionNN.md` (field names of the loader's read-only `game.bpack` view). |
| Lists | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json` (list name given). |
| Graveyard `<file>:<line>` | The Insurgent's Graveyard by Xeavin, `/home/user/xeavin/the-insurgents-graveyard/` (fact reference only). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
