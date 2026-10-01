# EBP section 4 - Navigation icons (NAVIICN2)

Spec id: `ebp-navigationicons` · machine spec: [`ebp-navigationicons.json`](./ebp-navigationicons.json)

EBP **section 4** holds the **navigation (map) icons** of the area: a small group table, then 16-byte rows, each
with a line position, an icon position, an icon link and a required map flag. The Toolkit's EBP editor exposes it
as "4 : Navigation Icons" (TK L1084); the Workshop maps `section_004.bin` to this layout
(IW Resources/JsonFile.cs:63). The Toolkit's list of map icon groups (Local Exit Line, Regional Exit Line, Crystal,
Normal, Strahl; TK L1103) very probably names the groups of this table by index - the "line" coordinates fit the
exit-line groups - but no source states the link outright.

## Container

### The EBP file

Full container spec: [`container-ebp.md`](./container-ebp.md). What matters for this section:

- **Files.** Every `*.ebp` in the game archive; the Workshop treats each one as a 20-section pack
  (IW Resources/PackFile.cs:28). Names seen in our sources: `srb_b04.ebp` (msg 116), `dst_a03` (msg 1049),
  `bul_a0380` (TK L1127). The Toolkit's file viewer lists them under "Location File (.ebp/.mot/.fpk)" and
  "Event File (.ebp/.mot/.snd/.vpc)" (TK L1411). No source names the VBF folders; search the archive for `.ebp`.
  At run time up to five EBPs are loaded at once (slots 0 = Battle ... 4 = Debug, TK L243), and edits only take
  effect after the area or event is loaded again.
- **Header (0x80 bytes).** Magic `EBP2` (`45 42 50 32`) at 0x00 (IW Helpers/PackHelper.cs:181-185, 235-236), twenty
  little-endian `u32` section offsets at 0x10-0x5F (IW Helpers/PackHelper.cs:188-193, 260-264), counted from the first
  byte of the EBP; **0 means absent** (IW Helpers/PackHelper.cs:204-207, 247-254). Bytes 0x04-0x0F and 0x60-0x7F are not
  interpreted (the Workshop's packer leaves them zero, IW Helpers/PackHelper.cs:239). This section's offset is the `u32` at **EBP+0x20** (slot 4).
- **Section span.** Sort the non-zero offsets; a section runs to the next larger offset, the highest one to the end
  of the file (IW Helpers/PackHelper.cs:195-213). The span therefore includes the 16-byte alignment padding that
  follows the section's own data.
- **Physical order when rebuilt.** Index order from 0x80, every section starting on a 16-byte boundary with zero
  fill; an empty section takes no space and keeps offset 0 (IW Helpers/PackHelper.cs:239-257).
- **Special sections.** Section 6 is a **TIM2** texture and section 19 an **embedded ARD** (magic `FF12AR03`, see
  [`container-ard.md`](./container-ard.md)); the Workshop gives them the extensions `.tm2` and `.ard` when
  unpacking (IW Helpers/PackHelper.cs:217-222). Its packer only looks for `.bin` for every index except 19
  (IW Helpers/PackHelper.cs:245-247), so a naive unpack/repack with that tool loses section 6. Our editor must carry
  both sections through any rebuild unchanged.
- **Unpacked naming.** `<name>.ebp.dir/section_<nnn>.bin` (IW Resources/JsonFile.cs:63-67); the `files` globs of
  this spec include that name so a single extracted section can be opened.

#### EBP section map

| # | Header slot | Content | Spec | Source |
|---|---|---|---|---|
| 0 | 0x10 | Compiled script (VM bytecode, decompiled to `.c` by an external tool) | - | IW Resources/OtherFile.cs:20 |
| 1 | 0x14 | unknown | - | - |
| 2 | 0x18 | Text table | - | IW Resources/OtherFile.cs:21 |
| 3 | 0x1C | Text table | - | IW Resources/OtherFile.cs:21 |
| 4 | 0x20 | Navigation icons (`NAVIICN2`) | [`ebp-navigationicons`](./ebp-navigationicons.md) | IW Resources/JsonFile.cs:63; TK L1084 |
| 5 | 0x24 | unknown | - | - |
| 6 | 0x28 | **TIM2 texture** (unpacked as `section_006.tm2`) | - | IW Helpers/PackHelper.cs:217-222 |
| 7 | 0x2C | unknown | - | - |
| 8 | 0x30 | Camera mappings (`CML1`) | [`ebp-cameramappings`](./ebp-cameramappings.md) | IW Resources/JsonFile.cs:64 |
| 9 | 0x34 | Cameras (`CAM7`) | [`ebp-cameras`](./ebp-cameras.md) | IW Resources/JsonFile.cs:65 |
| 10 | 0x38 | Second `CML1` mapping table | [`ebp-cameramappings`](./ebp-cameramappings.md) | IW Resources/JsonFile.cs:64 |
| 11 | 0x3C | unknown | - | - |
| 12 | 0x40 | Models (u32 count + s32 ids) | [`ebp-models`](./ebp-models.md) | IW Resources/JsonFile.cs:66; TK L1084 |
| 13-15 | 0x44-0x4C | unknown | - | - |
| 16 | 0x50 | Positions (`FF12POS3`) | [`ebp-positions`](./ebp-positions.md) | IW Resources/JsonFile.cs:67; TK L1084, L1119 |
| 17-18 | 0x54-0x58 | unknown | - | - |
| 19 | 0x5C | **Embedded ARD** (`FF12AR03`, unpacked as `section_019.ard`) | [`container-ard`](./container-ard.md) | IW Helpers/PackHelper.cs:217-222, 245 |

### Section layout

```
+0x00          8 bytes  magic "NAVIICN2"
+0x08          u16      groupCount (G)
+0x0A          group[0..G-1]: u16 iconOffset, u16 iconCount   (4 bytes each)
+0x0A+4G       icon rows of group 0, then group 1, ... (16 bytes each)
               zero padding to a multiple of 16
```

- `iconOffset` counts from the start of section 4 and is only 16 bits wide (IW Formats/Ebp/NavigationIcons.cs:34-40, 46).
- The first icon row starts at 0x0A + 4G, which is 2 mod 4: rows are only 2-byte aligned.
- The Workshop writes rows group by group in group order and stores 0 as the offset of an empty group
  (IW Formats/Ebp/NavigationIcons.cs:72-93).

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Fields named `unknown…`, `pad…` or `unused…` are not interpreted by any source; keep their original bytes.

### Record `navHeader` - 10 bytes (0x0A), count: 1

*Where:* Offset 0 of EBP section 4 (EBP start + u32 at EBP+0x20).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 8 | bytes[8] | `magic` | ASCII 'NAVIICN2' = 4E 41 56 49 49 43 4E 32. |  | IW Formats/Ebp/NavigationIcons.cs:12, 26-29, 68 |
| 0x08 | 2 | u16 | `groupCount` | Number of 4-byte group descriptors starting at 0x0A (16-bit; the group table begins right after it). |  | IW Formats/Ebp/NavigationIcons.cs:31-32, 69 |

### Record `navGroup` - 4 bytes (0x04), count: navHeader.groupCount

*Where:* EBP section 4, offset 10 + 4*g (g = 0 .. groupCount-1). g is the group index; group names in enum NavIconGroup are inferred from the Toolkit.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `iconOffset` | Offset of the first icon row of this group, counted from the start of section 4. 0 when the group has no icons (as written by the Workshop). Must be rewritten whenever rows move. |  | IW Formats/Ebp/NavigationIcons.cs:38, 46, 79, 99 |
| 0x02 | 2 | u16 | `iconCount` | Number of consecutive 16-byte icon rows at iconOffset. |  | IW Formats/Ebp/NavigationIcons.cs:39, 47, 80, 100 |

### Record `navIcon` - 16 bytes (0x10), count: sum of navGroup[g].iconCount over all groups

*Where:* EBP section 4, offset navGroup[g].iconOffset + 16*j (j = 0 .. navGroup[g].iconCount-1). Rows of all groups follow the group table back to back (first row at 10 + 4*groupCount, so rows are only 2-byte aligned).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | s16 | `linePosX` | X of the line marker (e.g. an exit line) on the navigation map; coordinate space unverified. |  | IW Formats/Ebp/NavigationIcons.cs:51, 84, 128-129 |
| 0x02 | 2 | s16 | `linePosY` | Y of the line marker on the navigation map. |  | IW Formats/Ebp/NavigationIcons.cs:52, 85, 131-132 |
| 0x04 | 2 | s16 | `iconPosX` | X of the icon on the navigation map. |  | IW Formats/Ebp/NavigationIcons.cs:53, 86, 134-135 |
| 0x06 | 2 | s16 | `iconPosY` | Y of the icon on the navigation map. |  | IW Formats/Ebp/NavigationIcons.cs:54, 87, 137-138 |
| 0x08 | 2 | u16 | `iconLink` | Link to the icon to show (target table unknown). |  | IW Formats/Ebp/NavigationIcons.cs:55, 88, 140-141 |
| 0x0A | 2 | u16 | `requiredMapFlag` | Map flag that must be set for the icon to appear (flag space unknown). |  | IW Formats/Ebp/NavigationIcons.cs:56, 89, 143-144 |
| 0x0C | 4 | bytes[4] | `unknown0C` | Not interpreted (labelled unused with a question mark by the Workshop). Preserve. |  | IW Formats/Ebp/NavigationIcons.cs:57, 90, 117-120, 146-147 |

### Enums

`NavIconGroup`

| Value | Label |
|---|---|
| 0 | Local Exit Line |
| 1 | Regional Exit Line |
| 2 | Crystal |
| 3 | Normal |
| 4 | Strahl |

## Count and size rules

- Section size = 10 + 4 x groupCount + 16 x (total icon rows), rounded up to 16 with zeros (IW Formats/Ebp/NavigationIcons.cs:72-93).
- Five groups are expected if the Toolkit group list applies (values 0-4); keep whatever count the file has.
- Because offsets are u16, the section must stay smaller than 64 KiB.

## Pointers to fix when sizes change

- Every `navGroup.iconOffset` must be recomputed whenever a row is added to or removed from any group that
  is stored before it (in practice: rebuild all of them, IW Formats/Ebp/NavigationIcons.cs:72-101).
- If this section's length changes, every EBP section stored after it moves: recompute their `u32` slots at
  EBP+0x10+4n, keep 16-byte starts with zero fill, keep absent sections at 0. Offsets inside other sections are
  relative to their own start (and the embedded ARD's offsets to the ARD start), so nothing else changes.

## Text

No strings.

## Links to other data

- `iconLink` and `requiredMapFlag` point into tables that no source identifies (icon shapes / textures and map
  flags respectively). Section 6 of the same EBP is a TIM2 texture; whether the icons come from it is unknown.

## Round-trip rules

- Keep the magic 'NAVIICN2'; groupCount is 16-bit and the group table starts at 0x0A.
- Edit icon row fields in place when no rows are added or removed; nothing moves.
- Keep unknown0C bytes as read.
- When rows are added or removed: lay the rows out again group by group after the group table, rewrite every group iconOffset (0 for an empty group unless the original used something else) and iconCount, then zero-pad the section to 16.
- All offsets are u16: the section must stay below 64 KiB.
- Keep the number and order of groups; the group index carries the meaning.
- If the section length changes, every EBP section stored after it moves: recompute their u32 slots at EBP+0x10+4n, keep 16-byte starts with zero fill, keep absent sections at 0, keep section 6 (TIM2) and section 19 (ARD) intact.

## Known unknowns

- Group meanings come from the Toolkit list EbpeMapIconGroupList (spelled "Cystal" there); our write-up of the Toolkit files that list under the script's Map Icons view, so the match with section 4 group indices is inferred.
- Coordinate space of the line and icon positions (navigation-map pixels?).
- What iconLink points to (an icon shape, a texture region in section 6, or an MRP element).
- Which flag space requiredMapFlag uses (map reveal flags?).
- Whether vanilla files ever share rows between groups, store groups out of order, or give empty groups a non-zero offset (the format allows all three).

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; its licence forbids copying, modifying or converting its code, and none of it is reused here). Paths are relative to that repo: `Formats/Ebp/*.cs`, `Helpers/PackHelper.cs`, `Helpers/BinaryHelper.cs`, `Resources/JsonFile.cs`, `Resources/OtherFile.cs`, `Resources/PackFile.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. Section 4.17 (L1074-L1131) is the EBP editor. |
| Lists | Drop-down lists of The Insurgent's Toolkit. Lists named in `enum` either ship in `editor/data/lists.json` (`ModelList`) or are copied into this spec's `enums` block. |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
