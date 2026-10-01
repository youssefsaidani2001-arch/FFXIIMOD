# ARD section 9 - Special action animations

Spec id: `ard-specialactionanimations` · machine spec: [`ard-specialactionanimations.json`](./ard-specialactionanimations.json)

ARD **section 9** maps (model, weapon stance, action character animation) to an animation file for special
actions of the area's foes. The Toolkit lists the section but shows no fields (TK L1012); the Workshop maps
`section_009.bin` here (IW Resources/JsonFile.cs:73).

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
  This section's offset is the `u32` at **ARD+0x2C** (slot 9).
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

### Section layout

```
+0x00  u32 entryCount
+0x04  12 bytes, not read (zero in rebuilt files)
+0x10  row[0]                16 bytes
...    row[entryCount-1]
```

- Rows start at 0x10 regardless of the count (IW Formats/Ard/SpecialActionAnimations.cs:23, 49).
- The header is 16 bytes and rows are 16 bytes, so the section always ends on a 16-byte boundary; no extra
  padding is written (IW Formats/Ard/SpecialActionAnimations.cs:48-57).
- **Empty table:** written as 32 zero bytes (count 0, the 12 unread bytes, plus one all-zero row) rather than a
  bare 16-byte header (IW Formats/Ard/SpecialActionAnimations.cs:42-46). Keep whatever length you find.

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…`/`unused…` are not interpreted by any source; keep their original bytes.

### Record `header` — 16 bytes (0x10), count: 1

*Where:* Offset 0 of ARD section 9 (ARD start + u32 at ARD+0x2C).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | u32 | `entryCount` | Number of 16-byte rows that start at section offset 0x10. |  | IW Formats/Ard/SpecialActionAnimations.cs:22,48 |
| 0x04 | 12 | bytes | `unknown04` | Not read; zero in Workshop output. |  | IW Formats/Ard/SpecialActionAnimations.cs:23,49 |

### Record `specialActionAnimation` — 16 bytes (0x10), count: header.entryCount

*Where:* ARD section 9, offset 16 + i*16

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | s32 | `model` | Model the animation belongs to. | `ModelList` | IW Formats/Ard/SpecialActionAnimations.cs:29,52 |
| 0x04 | 2 | u16 | `weaponStance` | Weapon stance the entry applies to (stance id; compare BpWeaponStanceList - list assignment not confirmed). |  | IW Formats/Ard/SpecialActionAnimations.cs:30,53 |
| 0x06 | 2 | u16 | `actionCharacterAnimationLink` | Character-animation id used by actions (links an action's character animation to this entry). |  | IW Formats/Ard/SpecialActionAnimations.cs:31,54 |
| 0x08 | 2 | u16 | `animationFileLink` | Which animation file to use (the Toolkit's file viewer has a "Foe Special Action Animation" file type, TK L1411). |  | IW Formats/Ard/SpecialActionAnimations.cs:32,55 |
| 0x0A | 6 | bytes | `unknown0A` | Not read; the Workshop writes six zero bytes. |  | IW Formats/Ard/SpecialActionAnimations.cs:34,56 |

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `ModelList` | model ids, (prefix letter << 16) \| number (TK L940-L952) |

## Count and size rules

- Section size = 16 + 16 x entryCount (32 when empty, see above).
- Not an st2e table: no magic, no entry-size field. The row size 16 is fixed.

## Text

No strings.

## Pointers

None inside the section; only the ARD section table when the size changes.

## Round-trip rules

- Edit fields in place; nothing inside the section points anywhere.
- Keep the 12 bytes at 0x04-0x0F and the six trailing bytes of each row as read.
- An empty section stays 32 zero bytes (do not shrink it to 16 or drop it).
- Adding or removing rows: update entryCount; the section grows/shrinks by 16 per row.
- If this section changes length, rebuild the ARD offset table: every section stored after it moves (recompute their u32 slots, keep 16-byte starts with zero fill, keep section 1 last with nothing after it); if the ARD sits in EBP section 19, the EBP offsets after section 19 move as well.

## Known unknowns

- Meaning of the 12 bytes after entryCount and of the six bytes at 0x0A-0x0F of each row.
- Which list weaponStance uses (battlepack weapon stance rows or the stance animation list).
- Id space of actionCharacterAnimationLink and animationFileLink (likely the battlepack action character-animation ids and the foe special action animation files).
- Why an empty table is 32 bytes long.

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; its licence forbids copying, modifying or converting its code). Paths are relative to that repo: `Formats/Ard/*.cs`, `Formats/St2e.cs`, `Helpers/PackHelper.cs`, `Helpers/BinaryHelper.cs`, `Helpers/EnumHelper.cs`, `Resources/JsonFile.cs`, `Resources/PackFile.cs`, `Program.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. Section 4.16 (L997-L1072) is the ARD editor. |
| Lists | Drop-down lists of The Insurgent's Toolkit. Lists named in `enum` either ship in `editor/data/lists.json` or are copied into this spec's `enums` block (the `Arde*` lists). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
