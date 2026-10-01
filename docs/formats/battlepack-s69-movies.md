# Battlepack section 69 — Movies

Spec id: `battlepack-s69-movies` · machine spec: [`battlepack-s69-movies.json`](./battlepack-s69-movies.json)

Battlepack **section 69** holds per-movie fade settings: when the fade-in starts and how long it lasts, when the
fade-out starts and how long it lasts (both counted backwards from the end), and whether each fade goes through
black or white (IW Movies.cs:64-92; TK L841).

## Container

### The battlepack container (`battle_pack.bin`)

Full container spec: [`container-battlepack.md`](./container-battlepack.md) (st2e details:
[`container-st2e.md`](./container-st2e.md) where present). Summary of what matters for this section:

- **Archive path:** `ps2data/image/ff12/test_battle/<lang>/binaryfile/battle_pack.bin` inside the game's VBF
  (msg 402 gives the `us` folder; the Workshop also recognises `in`, `kr`, `cn`, `ch` language folders,
  IW Helpers/PackHelper.cs:593-602). Each language folder carries its own copy.
- **Header:** `u32 sectionCount` at 0x00 (71 for `battle_pack.bin`, IW Resources/PackFile.cs:20), followed by
  `sectionCount + 1` `u32` offsets measured from the start of the file. The extra last offset is the end of the
  last section's data **before** the final padding (IW Helpers/PackHelper.cs:41-46, 87).
- **Sections:** section *i* occupies `[offset[i], offset[i+1])`. Every section starts on a 16-byte boundary;
  the gap is zero-filled, so a section's span includes its own trailing pad (IW Helpers/PackHelper.cs:51, 77).
  An empty section has `offset[i] == offset[i+1]`. The file ends with zero padding to a multiple of 16
  (IW Helpers/PackHelper.cs:88).
- **Resizing:** if a section's padded length changes, every later offset and the end offset move by the same
  delta; nothing else in the pack points across sections (the Workshop rebuilds the table from scratch,
  IW Helpers/PackHelper.cs:64-96).
- **Unpacked naming:** the Workshop writes section *i* as `battle_pack.bin.dir/section_<iii>.bin`
  (IW Helpers/PackHelper.cs:58); this spec's `files` glob includes that name for single-section editing.
- **In memory:** the game rewrites in-file offsets to absolute pointers after loading; the Toolkit's export
  converts them back before saving (TK L964-L976, L1794). Files on disk always hold offsets relative to the start of
  the section.


### The `st2e` section header (32 bytes)

| Offset | Size | Type | Name | Meaning | Source |
|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `magic` | ASCII `st2e` (`73 74 32 65`). | IW Formats/St2e.cs:9,20 |
| 0x04 | 4 | u32 | `entryCount` | Number of fixed-size entries. | IW Formats/St2e.cs:25 |
| 0x08 | 2 | u16 | `entrySize` | Bytes per entry. | IW Formats/St2e.cs:26 |
| 0x0A | 2 | bytes | `unknown0A` | Skipped by every reader; the Workshop writes zero. | IW Formats/St2e.cs:27,51 |
| 0x0C | 4 | u32 | `entryListOffset` | Offset of entry 0 from the section start; 0x20 when there is at least one entry, 0 when the table is empty. | IW Formats/St2e.cs:12,28,39 |
| 0x10 | 4 | u32 | `offset10` | Unknown offset slot; 0 in Workshop output. | IW Formats/St2e.cs:29,40 |
| 0x14 | 4 | u32 | `textSectionOffset` | Offset of an inline text block. Always 0 in the Workshop's output for the gameplay tables, and the Toolkit clears it when exporting a live section, i.e. the game fills it at run time; text itself is **not** stored in these sections. | IW Formats/St2e.cs:30,41; TK L251-L267, L978 |
| 0x18 | 4 | u32 | `offset18` | Unknown offset slot, except in section 13 where it is the attribute-table offset. | IW Formats/St2e.cs:31; TK L267 |
| 0x1C | 4 | u32 | `offset1C` | Unknown offset slot; 0 in Workshop output. | IW Formats/St2e.cs:32,43 |

Entries are packed back to back from `entryListOffset` (no per-entry alignment). After the last entry
(or the last extra table) the section is zero-padded to a multiple of 16 bytes (IW Helpers/BinaryHelper.cs:12-33).

Section 69 specifics: `entrySize` = 8 (0x8) (IW Formats/Battlepack/Movies.cs:18).
The Workshop maps the unpacked file `section_069.bin` to this table (IW Resources/JsonFile.cs:60).

**Disputed byte.** The Workshop's reader takes the colour from byte 5 (IW Movies.cs:36-37) but its writer stores it
in byte 7 after skipping two bytes (IW Movies.cs:58-59); the Lua Loader docs put the colour bits at 0x07
(LL section69.md). Two of three descriptions agree on 0x07, which this spec uses. An editor should show bytes 5 and 7
side by side until verified against vanilla data. Colour values above 3 are rejected (IW Movies.cs:86-89).

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…`/`unused…` are not interpreted by any source; keep their original bytes.

### Record `header` — 32 bytes (0x20), count: 1

*Where:* Offset 0 of battlepack section 69.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `magic` | ASCII 'st2e' (73 74 32 65); reject the section if different. |  | IW Formats/St2e.cs:9,20 |
| 0x04 | 4 | u32 | `entryCount` | Number of movie rows. |  | IW Formats/St2e.cs:25 |
| 0x08 | 2 | u16 | `entrySize` | Bytes per entry; 8 (0x8) for this section. |  | IW Formats/St2e.cs:26 |
| 0x0A | 2 | bytes | `unknown0A` | Not interpreted; keep. |  | IW Formats/St2e.cs:27 |
| 0x0C | 4 | u32 | `entryListOffset` | Offset of entry 0 from the section start: 32 when entryCount > 0, else 0. |  | IW Formats/St2e.cs:12,28,39 |
| 0x10 | 4 | u32 | `offset10` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:29,40 |
| 0x14 | 4 | u32 | `textSectionOffset` | Inline text offset; 0 on disk for this section (filled at run time). No strings are stored here. |  | IW Formats/St2e.cs:30,41; TK L262, L978 |
| 0x18 | 4 | u32 | `offset18` | Unknown offset slot (0 in Workshop output for this section). |  | IW Formats/St2e.cs:31,42 |
| 0x1C | 4 | u32 | `offset1C` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:32,43 |

### Record `movie` — 8 bytes (0x8), count: header.entryCount

*Where:* st2e entries of section 69: header.entryListOffset + i*8

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 1 | bytes | `unknown00` | Not read; kept as zero by the Workshop. |  | IW Movies.cs:31,53 |
| 0x01 | 1 | u8 | `fadeInFrameTimeStart` | Frame at which the fade-in starts. |  | IW Movies.cs:32,54; LL section69.md |
| 0x02 | 1 | u8 | `fadeInFrameTimeDuration` | Length of the fade-in in frames. |  | IW Movies.cs:33,55; LL section69.md |
| 0x03 | 1 | u8 | `fadeOutFrameTimeStart` | Frame at which the fade-out starts, counted backwards from the end of the movie. |  | IW Movies.cs:34,56,72; LL section69.md |
| 0x04 | 1 | u8 | `fadeOutFrameTimeDuration` | Length of the fade-out in frames (counted backwards). |  | IW Movies.cs:35,57,75; LL section69.md |
| 0x05 | 2 | bytes | `unknown05` | Not interpreted here. The Workshop READER takes the fade colour from byte 5 (low 2 bits) while its WRITER stores it in byte 7; see gaps. |  | IW Movies.cs:36-37,58 |
| 0x07 | 1 | bf8 | `flags` | Fade colours. Position follows the Workshop writer and the Lua Loader docs. | bits below | IW Movies.cs:50-51,59; LL section69.md |

#### Bits of `movie.flags` (bf8 at 0x07; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 0-1 | 0x03 | `fadeColor` | bit 0 = white fade-in, bit 1 = white fade-out; enum `BpeFadeColorList` |

## Enums carried in the JSON spec

Flag enums list the mask value of each bit. Fields that point at bigger lists (text ids, content ids, animations, formulas …) name a list from `editor/data/lists.json` instead (see *External lists*).

#### `BpeFadeColorList` (Lists: BpeFadeColorList; IW Movies.cs:86-89)

| Value | Label |
|---|---|
| 0 (0x0) | Black Fade-in & Black Fade-out |
| 1 (0x1) | White Fade-in & Black Fade-out |
| 2 (0x2) | Black Fade-in & White Fade-out |
| 3 (0x3) | White Fade-in & White Fade-out |

## Count and size rules

- Variable row count; vanilla count and which movie each row belongs to are not documented.
- `fadeColor` is 0-3 (Lists: BpeFadeColorList).

### Text

This section holds no strings and no text ids.

## Pointers

None.

## Round-trip rules

- Edit fields in place; the record size is fixed and nothing in this section points at entries, so value edits never move data.
- Copy every byte that no field interprets (unknown*/padding, unnamed bits) from the original; the Workshop writer zero-fills them (it seeks over them), so do not use its output as the byte-identical reference.
- Keep the st2e header bytes verbatim except entryCount (and entryListOffset when the count goes to/from 0).
- Keep the trailing zero padding that rounds the section to a multiple of 16 bytes.
- If the section length changes (added/removed entries), rewrite the battlepack offset table: every later section offset and the end offset shift by the padded size delta.
- flags (0x07): change only bits 0-1; preserve bits 2-7 and bytes 5-6.

## Known unknowns

- Fade colour location: byte 7 (Workshop writer, Lua Loader) vs. byte 5 (Workshop reader). Verify on vanilla data.
- Meaning of byte 0 and the movie-id mapping of rows.
- Frame units (game frames vs. movie frames).

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; license forbids copying or converting its code). Paths are relative to that repo, e.g. `Formats/Battlepack/Actions.cs`, `Formats/St2e.cs`, `Helpers/PackHelper.cs`, `Helpers/EnumHelper.cs`, `Resources/JsonFile.cs`, `Resources/PackFile.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| LL `sectionNN.md` | FF12 Lua Loader documentation, `capabilities/bpack-sections/sectionNN.md` (field names of the loader's read-only `game.bpack` view). |
| Lists | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json` (list name given). |
| Graveyard `<file>:<line>` | The Insurgent's Graveyard by Xeavin, `/home/user/xeavin/the-insurgents-graveyard/` (fact reference only). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
