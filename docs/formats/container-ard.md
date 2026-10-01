# Container: ARD (`*.ard`, magic `FF12AR03`)

ARD ("Area Resource Data") holds the foe data for one area: model list,
classes (species), AI scripts, units (encounters), stat tables and special
action animations. It exists as standalone `.ard` files and as section 19 of
EBP files.

## Sources and citation keys

| Key | Meaning |
|---|---|
| `W:<file>:<line>` | The Insurgent's Workshop, `/home/user/xeavin/the-insurgents-workshop` - facts only, no code reused (licence: personal use only). |
| `R:<line>` | `docs/research/insurgents_toolkit_reference.md`. |
| `D#<n>` | Discord export *wip-general*, message index `n`. |

## Files

| Item | Value | Source |
|---|---|---|
| Pattern | `*.ard`; also EBP section 19 | W:Resources/PackFile.cs:29, W:Helpers/PackHelper.cs:217-222 |
| Game file type | Area Resource Data (.ard), type 21 | R:1411 |
| Section count | 10 (0-9) | W:Resources/PackFile.cs:29, R:242 |
| Older tool | `ff12-ard.exe` (ffgriever) unpacks ARD for AI edits | D#270 |

## Byte order

Little-endian.

## Header (0x30 bytes)

| Off | Size | Type | Name | Meaning |
|---|---|---|---|---|
| 0x00 | 8 | bytes | magic | `FF12AR03` = 46 46 31 32 41 52 30 33 (W:Helpers/PackHelper.cs:272-276) |
| 0x08 | 40 | u32[10] | sectionOffset[0..9] | Offset of each section from the start of the ARD; **0 = absent** (W:Helpers/PackHelper.cs:279-283, :358-362). The game resolves a section as `ardBase + sectionOffset[id]`, i.e. the values stay relative in memory (R:242). |
| 0x30 | - | - | data | First section when rebuilt (48 is already a multiple of 16, so no gap). |

## Section data and the section 1 rule

* Physical order used by the reference packer: sections 0, 2, 3, 4, 5, 6, 7,
  8, 9, each followed by zero padding to 16; **then section 1 last, with no
  padding after it** (W:Helpers/PackHelper.cs:327-355). Because of this a
  standalone ARD need not end on a 16-byte boundary; inside an EBP the EBP's
  own padding follows it.
* Placing section 1 last is deliberate in the reference tool (it is skipped in
  the main loop and appended afterwards), which strongly suggests vanilla ARDs
  are laid out the same way. Why the game needs this is not stated.
* Reading: sort the non-zero offsets; a section's length is the gap to the next
  larger offset, or to the end of the ARD for the highest one
  (W:Helpers/PackHelper.cs:285-310).
* A section exists only when its offset and length are non-zero.

## Section map

| # | Content | Shape | Source |
|---|---|---|---|
| 0 | unknown | - | |
| 1 | Models ("Model Motions" in the toolkit) - stored last | u32 count, then 8-byte entries: s32 model, u32 flags (unknown) | W:Resources/JsonFile.cs:68, W:Formats/Ard/Models.cs:22-29, R:1006 |
| 2 | Classes (species data) | st2e, 84-byte entries | W:Resources/JsonFile.cs:69, W:Formats/Ard/Classes.cs:18, R:1007 |
| 3 | AI scripts ("Battle Logics") | u16 script count, u16 pad, u32 script offsets; each script starts with a 32-byte group-size array | W:Resources/JsonFile.cs:70, W:Formats/Ard/AiScripts.cs:26-39, R:1008 |
| 4 | Units (per-encounter foe records) | st2e, 88-byte entries | W:Resources/JsonFile.cs:71, W:Formats/Ard/Units.cs:18, R:1009 |
| 5 | unknown | - | |
| 6 | unknown | - | |
| 7 | Default stats | st2e, 56-byte entries | W:Resources/JsonFile.cs:72, W:Formats/Ard/Stats.cs:17, R:1010 |
| 8 | Additive (per-level) stats | st2e, 56-byte entries | W:Resources/JsonFile.cs:72, R:1011 |
| 9 | Special action animations | u32 count, data from +0x10, 16-byte entries | W:Resources/JsonFile.cs:73, W:Formats/Ard/SpecialActionAnimations.cs:22-35 |

The toolkit exposes 7 of the 10 sections (1, 2, 3, 4, 7, 8, 9), matching the
workshop (R:999-1011).

## Text and strings

ARD sections carry numeric text ids only (e.g. unit name at +0x08 of a unit
record, R:1026); no strings are stored in the container.

## Nesting

* ARDs inside an EBP (section 19) are unpacked after the EBP and must be
  rebuilt before it (W:Resources/PackFile.cs:28-29, W:Program.cs:53, :88).

## Pointers to fix when sizes change

* Resizing any section moves every section stored after it; recompute those
  `sectionOffset` entries (relative to the ARD start, 16-byte aligned for all
  but the trailing section 1).
* If the ARD is inside an EBP and its total size changes, the EBP's section
  offsets after section 19 must be recomputed as well (see `container-ebp`).
* In-section offsets (st2e list offset, AI script offsets) are relative to the
  section and do not change when the section moves.

## Round-trip rules

* Keep section 1 as the physically last section and do not add padding after it.
* Absent sections keep offset 0.
* Copy unedited sections byte-for-byte, including padding that belongs to them.
* No live hot-reload exists for ARD; edits take effect on area (re)load (R:1072, R:1771).

## Known unknowns

* Contents of sections 0, 5 and 6.
* Why section 1 must be last (possibly the game frees or grows it after load).
* Meaning of the u32 flags in section 1 entries.
* Whether vanilla standalone ARDs end without padding after section 1.
