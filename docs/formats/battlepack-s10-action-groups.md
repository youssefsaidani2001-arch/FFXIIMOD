# Battlepack section 10 — Action Groups

Spec id: `battlepack-s10-action-groups` · machine spec: [`battlepack-s10-action-groups.json`](./battlepack-s10-action-groups.json)

Battlepack **section 10** stores the **action groups**: small lists of (action, chance) pairs from which one action
is chosen. Battle-logic (AI) entries refer to them as action ids `0x8000 | group` (the Toolkit's battle-logic action
list names "Action Group 0" = 32768 up to 0x8338, Lists: BattleLogicActionList; TK L1643). It is not an st2e table
but an offset table (TK L812, IW Formats/Battlepack/ActionGroups.cs:19-48). The Workshop maps `section_010.bin` here
(IW Resources/JsonFile.cs:32).

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

### Section 10 layout (custom offset table)

```
+0x00            u32  groupCount                       (G)
+0x04            u32  groupOffset[0]                   section-relative start of group 0
...              u32  groupOffset[G-1]
+0x04+4G         u32  groupOffset[G]  = endOffset      end of the last group's data (before padding)
                 00.. zero padding to the next multiple of 16
groupOffset[0]   group 0 entries   (4 bytes each: u16 action, u16 chance)
groupOffset[1]   group 1 entries   (immediately after group 0, no padding between groups)
...
endOffset        00.. zero padding to a multiple of 16
```

Facts behind it:

* The first dword is the group count and the offset table has **count + 1** entries, the last being the end of the
  data before the final alignment (IW ActionGroups.cs:23-28, :69, :78; TK L812).
* The writer pads the header to 16 before the first group (IW ActionGroups.cs:56-57) and pads the end of the
  section to 16 after recording the end offset (IW ActionGroups.cs:69-70).
* Groups are written back to back with **no** padding between them; the reader also walks them sequentially from
  `groupOffset[0]` and derives each group's entry count as `(groupOffset[i+1] - groupOffset[i]) / 4`
  (IW ActionGroups.cs:30-46, :59-68). An empty group has the same offset as the next one.
* Offsets are relative to the start of section 10 (the Workshop writes stream positions of the section file,
  IW ActionGroups.cs:62, :69). In memory the game turns them into pointers, which is why the Toolkit's hot reloader
  and export script special-case section 10 (TK L267, L978, L1422).

Header size arithmetic: `4 + 4*(G+1)` bytes, then padding; e.g. G = 826 gives 3312 bytes, already a multiple of 16,
so group 0 would start at 0xCF0 in a tightly packed rebuild (whether vanilla is packed the same way is unverified).

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…`/`unused…` are not interpreted by any source; keep their original bytes.

### Record `header` — 4 bytes (0x4), count: 1

*Where:* Offset 0 of battlepack section 10 (no st2e header).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | u32 | `groupCount` | Number of action groups; the offset table that follows has groupCount + 1 entries. |  | IW ActionGroups.cs:23,53-54; TK L812 |

### Record `groupOffset` — 4 bytes (0x4), count: header.groupCount + 1

*Where:* section 10 offset 4 + 4*i (directly after header)

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | u32 | `offset` | Section-relative start of group i. The last row is the end-of-data offset (end of the last group, before the final padding). Non-decreasing. |  | IW ActionGroups.cs:24-28,59-62,69,73-78; TK L812 |

### Record `actionGroupEntry` — 4 bytes (0x4), count: (groupOffset[i+1] - groupOffset[i]) / 4 per group

*Where:* group i occupies [groupOffset[i], groupOffset[i+1]) of the section; entries of all groups are stored back to back from groupOffset[0]

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `action` | Action this entry can pick. | `BpActionList` | IW ActionGroups.cs:41,65 |
| 0x02 | 2 | u16 | `chance` | Chance / weight of picking this entry. |  | IW ActionGroups.cs:42,66 |

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `BpActionList` | section 14 action rows 0-543 |

## Count and size rules

- Group *i* holds `(groupOffset[i+1] - groupOffset[i]) / 4` entries; every difference must be a multiple of 4.
- The Toolkit's list names about 825 group ids (0x8000-0x8338); the exact vanilla `groupCount` is not stated.
- Group ids are positional: AI scripts address group *i* as `0x8000 | i`, so append new groups at the end and never
  reorder or delete groups.

### Text

No strings and no text ids.

## Pointers to fix up when sizes change

1. Adding or removing an entry in group *i* shifts `groupOffset[i+1 .. G]` (including the end offset) by ±4 per entry.
2. Adding or removing a group grows/shrinks the header by 4 bytes; recompute the header padding and then every group
   offset (re-lay all groups from the new aligned start).
3. Recompute the trailing padding of the section to a multiple of 16, then shift every later battlepack section
   offset and the pack's end offset by the padded size delta (see container-battlepack).

## Round-trip rules

- Unedited groups keep their entries and order; groups are never reordered (ids are positional).
- groupOffset values are section-relative, non-decreasing, and the last one is the unpadded end of the data.
- No padding between groups; header padded with zeros to 16 before group 0; section end padded with zeros to 16.
- Editing action/chance in place needs no fix-up; any change in entry or group count requires recomputing every later groupOffset and the battlepack section offsets.

## Known unknowns

- Semantics of chance (percent vs. relative weight; behaviour when the sum is not 100).
- Whether action is always a section 14 action row or can also hold battle-logic ids (e.g. movement 0x4000+).
- Vanilla groupCount and whether vanilla pads the header exactly to 16 before group 0.
- Whether empty groups exist in vanilla.

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; license forbids copying or converting its code). Paths are relative to that repo, e.g. `Formats/Battlepack/Actions.cs`, `Formats/St2e.cs`, `Helpers/PackHelper.cs`, `Helpers/EnumHelper.cs`, `Resources/JsonFile.cs`, `Resources/PackFile.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| LL `sectionNN.md` | FF12 Lua Loader documentation, `capabilities/bpack-sections/sectionNN.md` (field names of the loader's read-only `game.bpack` view). |
| Lists | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json` (list name given). |
| Graveyard `<file>:<line>` | The Insurgent's Graveyard by Xeavin, `/home/user/xeavin/the-insurgents-graveyard/` (fact reference only). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
