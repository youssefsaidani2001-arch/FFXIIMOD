# ARD section 1 - Models (model motions)

Spec id: `ard-models` · machine spec: [`ard-models.json`](./ard-models.json)

ARD **section 1** lists the models used by the area's foes, one row per model, each with a 32-bit flag word.
The Toolkit's ARD editor names the section "Model Motions" (motion sets per model, TK L1006); the Workshop names
it "Models" and maps `section_001.bin` to it (IW Resources/JsonFile.cs:68). It is the one ARD section that is
not written in index order: it always comes **last** in the file.

## Container

### The ARD file

Full container spec: [`container-ard.md`](./container-ard.md). What matters for this section:

- **Files.** Standalone `*.ard` files (the Workshop treats every `.ard` as a 10-section pack,
  IW Resources/PackFile.cs:29) and the ARD embedded as **section 19 of every `.ebp`** (the Workshop names that
  section `section_019.ard`, IW Helpers/PackHelper.cs:217-222, 245; because `.ebp` precedes `.ard` in its pack list the extracted ARD is
  unpacked right after, and rebuilt before the EBP, IW Resources/PackFile.cs:28-29, IW Program.cs:53, 88). The Toolkit's
  file viewer lists "Area Resource Data (.ard)" as game file type 21 (TK L1411). None of our sources names the
  VBF folder that holds the standalone files; search the archive for `.ard`. One ARD covers one area and its
  edits only apply after the area is (re)loaded (TK L1072, L1697).
- **Header (0x30 bytes).** 8-byte magic `FF12AR03` (`46 46 31 32 41 52 30 33`, IW Helpers/PackHelper.cs:272-276, 319-320), then ten
  little-endian `u32` section offsets at 0x08-0x2F (IW Helpers/PackHelper.cs:279-283, 323, 358-362). Offsets count from the first
  byte of the ARD (the game resolves a section as ARD base + offset, TK L242); **0 means the section is absent**.
  This section's offset is the `u32` at **ARD+0x0C** (slot 1).
- **Section span.** Sort the non-zero offsets; a section runs to the next larger offset, the highest one to
  the end of the ARD (IW Helpers/PackHelper.cs:285-310). When the ARD comes out of an EBP, "end of the ARD" includes the EBP's
  alignment padding, so trailing zero bytes after the highest section are normal.
- **Physical order.** Sections 0, 2, 3, 4, 5, 6, 7, 8, 9 are written in index order, each starting on a 16-byte
  boundary with zero fill in between; **section 1 is always written last** and nothing is appended after it
  (IW Helpers/PackHelper.cs:327-355). Absent sections take no space.
- **Unpacked naming.** The Workshop stores section *n* as `<file>.ard.dir/section_<nnn>.bin`
  (IW Helpers/PackHelper.cs:308, IW Resources/JsonFile.cs:68-73); the `files` globs of this spec include that name.

#### ARD section map

| # | Header slot | Content | Spec | Source |
|---|---|---|---|---|
| 0 | 0x08 | unknown | - | IW Resources/JsonFile.cs:68-73 (not mapped) |
| 1 | 0x0C | Models (Toolkit: "Model Motions") - stored last | [`ard-models`](./ard-models.md) | IW Resources/JsonFile.cs:68; TK L1006 |
| 2 | 0x10 | Classes (species) - st2e, 84-byte rows | [`ard-classes`](./ard-classes.md) | IW Resources/JsonFile.cs:69; TK L1007 |
| 3 | 0x14 | AI scripts (Toolkit: "Battle Logics") - offset table + scripts | [`ard-aiscripts`](./ard-aiscripts.md) | IW Resources/JsonFile.cs:70; TK L1008 |
| 4 | 0x18 | Units (per-encounter foe records) - st2e, 88-byte rows | [`ard-units`](./ard-units.md) | IW Resources/JsonFile.cs:71; TK L1009 |
| 5 | 0x1C | unknown | - | - |
| 6 | 0x20 | unknown | - | - |
| 7 | 0x24 | Default stats - st2e, 56-byte rows | [`ard-stats`](./ard-stats.md) | IW Resources/JsonFile.cs:72; TK L1010 |
| 8 | 0x28 | Additive stats - st2e, 56-byte rows | [`ard-stats`](./ard-stats.md) | IW Resources/JsonFile.cs:72; TK L1011 |
| 9 | 0x2C | Special action animations - count + 16-byte rows | [`ard-specialactionanimations`](./ard-specialactionanimations.md) | IW Resources/JsonFile.cs:73; TK L1012 |

### Section 1 placement (special rule)

- The Workshop's ARD packer skips index 1 while it writes sections 0, 2-9, and only afterwards appends
  section 1 at the current position (which is 16-byte aligned because every earlier section was padded), stores
  that position in slot 1 (ARD+0x0C) and **writes nothing after it** (IW Helpers/PackHelper.cs:329, 345-355).
- Its unpacker needs no special case: section 1 has the highest offset, so its span runs to the end of the ARD
  (IW Helpers/PackHelper.cs:299). The span can therefore include bytes that are not model rows: the section's own zero padding to
  16 (the Workshop pads it, IW Formats/Ard/Models.cs:45) and, for an ARD cut out of an EBP, the EBP's padding.
  Always take the row count from `entryCount`, never from the span.
- Why the game wants section 1 last is not documented (see *Known unknowns*). Keep it last.

### Layout

```
+0x00  u32 entryCount
+0x04  model[0]            8 bytes: s32 model id, u32 flags
...    model[entryCount-1]
       zero padding to a multiple of 16 (written by the Workshop; may be absent in vanilla, keep what you find)
```

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…`/`unused…` are not interpreted by any source; keep their original bytes.

### Record `modelsHeader` — 4 bytes (0x4), count: 1

*Where:* Offset 0 of ARD section 1 (ARD start + u32 at ARD+0x0C).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | u32 | `entryCount` | Number of 8-byte model rows that follow immediately (no st2e header, no gap). |  | IW Formats/Ard/Models.cs:22,39 |

### Record `model` — 8 bytes (0x8), count: modelsHeader.entryCount

*Where:* ARD section 1, offset 4 + i*8

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | s32 | `model` | Model id = (ASCII prefix letter << 16) \| file number (foes use prefix m, TK L940-L952). | `ModelList` | IW Formats/Ard/Models.cs:28,42; TK L940 |
| 0x04 | 4 | u32 | `unknownFlags` | Flag word of unknown meaning. The Toolkit calls the section "Model Motions" (motion sets per model), so it may select motion data. Keep as found. |  | IW Formats/Ard/Models.cs:29,43; TK L1006 |

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `ModelList` | model ids, (prefix letter << 16) \| number (TK L940-L952) |

## Count and size rules

- Section size = 4 + 8 x entryCount, rounded up to 16 with zeros (IW Formats/Ard/Models.cs:39-45).
- Nothing in the section is aligned per row; rows start at offset 4.
- Adding or removing rows changes the section length. Because section 1 is the last thing in the ARD, no other
  ARD section offset moves; only the ARD's total length changes (and with it the EBP layout after section 19
  when the ARD is embedded).

## Links

- Class rows (section 2, `model` at +0x00), unit overlay models (section 4, +0x38/+0x3C) and special action
  animations (section 9, `model` at +0x00) all carry model ids in the same encoding. Whether every model they use
  must also be listed here is not confirmed, but it is the obvious purpose of the list (a per-area model/motion
  preload list). Keep the list in sync when you give a class a model from another area.

## Text

No strings; model ids only.

## Round-trip rules

- Keep section 1 as the physically last section of the ARD and write nothing after it.
- Values are edited in place; the 8-byte rows have no internal offsets.
- Keep the bytes after the last row (padding, EBP padding) exactly as found when the row count does not change.
- When rows are added or removed, update entryCount, re-pad to 16 with zeros, and fix the ARD total length / enclosing EBP offsets (no other ARD offset moves).
- Keep unknownFlags verbatim unless you know what you are changing.

## Known unknowns

- Meaning of the u32 flag word in each row (possibly motion-set selection, per the Toolkit's "Model Motions" label).
- Why the game requires section 1 to be stored last (possibly so it can be released or grown separately after loading).
- Whether vanilla ARDs pad section 1 to 16 bytes; the Workshop always does.
- Whether every model referenced by classes, overlays or special action animations must be present in this list.
- Order significance of the rows (nothing is known to index them).

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; its licence forbids copying, modifying or converting its code). Paths are relative to that repo: `Formats/Ard/*.cs`, `Formats/St2e.cs`, `Helpers/PackHelper.cs`, `Helpers/BinaryHelper.cs`, `Helpers/EnumHelper.cs`, `Resources/JsonFile.cs`, `Resources/PackFile.cs`, `Program.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. Section 4.16 (L997-L1072) is the ARD editor. |
| Lists | Drop-down lists of The Insurgent's Toolkit. Lists named in `enum` either ship in `editor/data/lists.json` or are copied into this spec's `enums` block (the `Arde*` lists). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
