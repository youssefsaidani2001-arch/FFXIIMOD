# Battlepack section 59 — Story Point Additions (extended info)

Spec id: `battlepack-s59-story-point-additions-extended-info` · machine spec: [`battlepack-s59-story-point-additions-extended-info.json`](./battlepack-s59-story-point-additions-extended-info.json)

Battlepack **section 59** holds the per-character part of the **story point additions**: when the story reaches one
of the points defined in section 60, each row here (re)configures one party member — level, mist bars, the five
equipment slots, default gambit set, LP, current MP and the gambit on/off switch. The Toolkit calls it "Story Point
Addition Contents" (TK L838). The field order mirrors the party-member template of section 16 (equipment, gambit set,
LP, mist bars, MP percentage, gambit state; TK L917-L929).

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

Section 59 specifics: `entrySize` = 44 (0x2C) (IW Formats/Battlepack/StoryPointAdditionsExtendedInfo.cs:17).
The Workshop maps the unpacked file `section_059.bin` to this table (IW Resources/JsonFile.cs:57).

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…`/`unused…` are not interpreted by any source; keep their original bytes.

### Record `header` — 32 bytes (0x20), count: 1

*Where:* Offset 0 of battlepack section 59.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `magic` | ASCII 'st2e' (73 74 32 65); reject the section if different. |  | IW Formats/St2e.cs:9,20 |
| 0x04 | 4 | u32 | `entryCount` | Number of per-member records. |  | IW Formats/St2e.cs:25 |
| 0x08 | 2 | u16 | `entrySize` | Bytes per entry; 44 (0x2C) for this section. |  | IW Formats/St2e.cs:26 |
| 0x0A | 2 | bytes | `unknown0A` | Not interpreted; keep. |  | IW Formats/St2e.cs:27 |
| 0x0C | 4 | u32 | `entryListOffset` | Offset of entry 0 from the section start: 32 when entryCount > 0, else 0. |  | IW Formats/St2e.cs:12,28,39 |
| 0x10 | 4 | u32 | `offset10` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:29,40 |
| 0x14 | 4 | u32 | `textSectionOffset` | Inline text offset; 0 on disk for this section (filled at run time). No strings are stored here. |  | IW Formats/St2e.cs:30,41; TK L262, L978 |
| 0x18 | 4 | u32 | `offset18` | Unknown offset slot (0 in Workshop output for this section). |  | IW Formats/St2e.cs:31,42 |
| 0x1C | 4 | u32 | `offset1C` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:32,43 |

### Record `storyPointMember` — 44 bytes (0x2C), count: header.entryCount

*Where:* st2e entries of section 59: header.entryListOffset + i*44; each row is one party member at one story point (basicInfoLink -> section 60 row)

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `basicInfoLink` | Section 60 row (story point) this record belongs to. |  | IW StoryPointAdditionsExtendedInfo.cs:30,61; LL section59.md (storyPointAdditionIdentifier) |
| 0x01 | 1 | u8 | `partyMember` | Party member (section 16 row) affected. | `PartyMemberList` | IW StoryPointAdditionsExtendedInfo.cs:31,62; LL section59.md |
| 0x02 | 1 | u8 | `level` | Level set for the member. |  | IW StoryPointAdditionsExtendedInfo.cs:32,63; LL section59.md |
| 0x03 | 1 | u8 | `mistBars` | Mist bars set for the member. |  | IW StoryPointAdditionsExtendedInfo.cs:33,64; LL section59.md |
| 0x04 | 2 | u16 | `weapon` | Equipped weapon. | `BpEquipmentList` | IW StoryPointAdditionsExtendedInfo.cs:34,65; LL section59.md |
| 0x06 | 2 | u16 | `offhand` | Equipped off-hand (shield/ammunition). | `BpEquipmentList` | IW StoryPointAdditionsExtendedInfo.cs:35,66; LL section59.md |
| 0x08 | 2 | u16 | `helm` | Equipped helm. | `BpEquipmentList` | IW StoryPointAdditionsExtendedInfo.cs:36,67; LL section59.md |
| 0x0A | 2 | u16 | `armor` | Equipped armor. | `BpEquipmentList` | IW StoryPointAdditionsExtendedInfo.cs:37,68; LL section59.md |
| 0x0C | 2 | u16 | `accessory` | Equipped accessory. | `BpEquipmentList` | IW StoryPointAdditionsExtendedInfo.cs:38,69; LL section59.md |
| 0x0E | 2 | u16 | `gambitSet` | Default gambit set, stored as 0x5000 + section 8 row. |  | IW StoryPointAdditionsExtendedInfo.cs:39,70; LL section59.md (gambitSetIdentifier); TK L918 |
| 0x10 | 16 | bytes | `unknown10` | Not read; the Workshop leaves zeros. |  | IW StoryPointAdditionsExtendedInfo.cs:40,71 |
| 0x20 | 2 | u16 | `lp` | License points given/set. |  | IW StoryPointAdditionsExtendedInfo.cs:41,72; LL section59.md |
| 0x22 | 6 | bytes | `unknown22` | Not read; the Workshop leaves zeros. |  | IW StoryPointAdditionsExtendedInfo.cs:42,73 |
| 0x28 | 1 | u8 | `currentMpPercentage` | Current MP as a percentage of max. |  | IW StoryPointAdditionsExtendedInfo.cs:43,74; LL section59.md |
| 0x29 | 1 | bf8 | `flags` | Only bit 0 is known; the Workshop rebuilds the byte from it (other bits become 0). | bits below | IW StoryPointAdditionsExtendedInfo.cs:44-45,58-59,75; LL section59.md |
| 0x2A | 2 | bytes | `unknown2A` | Not read; the Workshop leaves zeros. |  | IW StoryPointAdditionsExtendedInfo.cs:46,76 |

#### Bits of `storyPointMember.flags` (bf8 at 0x29; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum |
|---|---|---|---|
| 0 | 0x01 | `gambitState` | gambits switched on |

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `PartyMemberList` | section 16 party member rows 0-39 (0 = Vaan ... 39 = Zodiark; 255 / 65535 = none) |
| `BpEquipmentList` | section 13 equipment rows 0-556 (0 = Unarmed) |

## Count and size rules

- Any number of rows; each names its story point (`basicInfoLink`, a section 60 row 0-49) and a party member.
  The vanilla count is not documented.
- `gambitSet` is stored in content-id form: show `value - 0x5000` as the section 8 row and write `row + 0x5000`
  (IW StoryPointAdditionsExtendedInfo.cs:39,70; same convention as section 16, TK L918).

### Text

This section holds no strings and no text ids.

## Pointers

None in the file. Outgoing ids: `basicInfoLink` -> section 60, `partyMember` -> section 16, equipment -> section 13,
`gambitSet` -> section 8 (+0x5000).

## Round-trip rules

- Edit fields in place; the record size is fixed and nothing in this section points at entries, so value edits never move data.
- Copy every byte that no field interprets (unknown*/padding, unnamed bits) from the original; the Workshop writer zero-fills them (it seeks over them), so do not use its output as the byte-identical reference.
- Keep the st2e header bytes verbatim except entryCount (and entryListOffset when the count goes to/from 0).
- Keep the trailing zero padding that rounds the section to a multiple of 16 bytes.
- If the section length changes (added/removed entries), rewrite the battlepack offset table: every later section offset and the end offset shift by the padded size delta.
- Store gambitSet as section 8 row + 0x5000.
- flags (0x29): change only bit 0 and preserve bits 1-7.

## Known unknowns

- Bytes 0x10-0x1F, 0x22-0x27 and 0x2A-0x2B are never read (could be stats/status fields as in section 16).
- Whether lp/level are absolute values or additions.
- Vanilla row count.

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; license forbids copying or converting its code). Paths are relative to that repo, e.g. `Formats/Battlepack/Actions.cs`, `Formats/St2e.cs`, `Helpers/PackHelper.cs`, `Helpers/EnumHelper.cs`, `Resources/JsonFile.cs`, `Resources/PackFile.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| LL `sectionNN.md` | FF12 Lua Loader documentation, `capabilities/bpack-sections/sectionNN.md` (field names of the loader's read-only `game.bpack` view). |
| Lists | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json` (list name given). |
| Graveyard `<file>:<line>` | The Insurgent's Graveyard by Xeavin, `/home/user/xeavin/the-insurgents-graveyard/` (fact reference only). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
