# Battlepack section 60 — Story Point Additions (basic info)

Spec id: `battlepack-s60-story-point-additions-basic-info` · machine spec: [`battlepack-s60-story-point-additions-basic-info.json`](./battlepack-s60-story-point-additions-basic-info.json)

Battlepack **section 60** defines the **story points** at which the game rebuilds the party: which members sit in
the 4 active and 5 reserve slots, who leads, how much gil the party has, and up to 64 inventory contents with
quantities (TK L839). Per-member details for the same story point are in section 59.

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

Section 60 specifics: `entrySize` = 208 (0xD0) (IW Formats/Battlepack/StoryPointAdditionsBasicInfo.cs:29).
The Workshop maps the unpacked file `section_060.bin` to this table (IW Resources/JsonFile.cs:58).
With 50 rows (TK L839) the section is 32 + 50*208 = 10432 bytes (already a multiple of 16).
Row layout: 9 party slot bytes, 1 unknown byte, leader slot, 3 unknown bytes, gil, then 64 u16 content ids followed by
64 u8 quantities (slot *n* pairs content *n* with quantity *n*). The Workshop insists on exactly 9 slots and 64
inventory entries (IW StoryPointAdditionsBasicInfo.cs:18-26).

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…`/`unused…` are not interpreted by any source; keep their original bytes.

### Record `header` — 32 bytes (0x20), count: 1

*Where:* Offset 0 of battlepack section 60.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `magic` | ASCII 'st2e' (73 74 32 65); reject the section if different. |  | IW Formats/St2e.cs:9,20 |
| 0x04 | 4 | u32 | `entryCount` | Number of story points (50 in the vanilla game). |  | IW Formats/St2e.cs:25 |
| 0x08 | 2 | u16 | `entrySize` | Bytes per entry; 208 (0xD0) for this section. |  | IW Formats/St2e.cs:26 |
| 0x0A | 2 | bytes | `unknown0A` | Not interpreted; keep. |  | IW Formats/St2e.cs:27 |
| 0x0C | 4 | u32 | `entryListOffset` | Offset of entry 0 from the section start: 32 when entryCount > 0, else 0. |  | IW Formats/St2e.cs:12,28,39 |
| 0x10 | 4 | u32 | `offset10` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:29,40 |
| 0x14 | 4 | u32 | `textSectionOffset` | Inline text offset; 0 on disk for this section (filled at run time). No strings are stored here. |  | IW Formats/St2e.cs:30,41; TK L262, L978 |
| 0x18 | 4 | u32 | `offset18` | Unknown offset slot (0 in Workshop output for this section). |  | IW Formats/St2e.cs:31,42 |
| 0x1C | 4 | u32 | `offset1C` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:32,43 |

### Record `storyPoint` — 208 bytes (0xD0), count: header.entryCount (vanilla 50)

*Where:* st2e entries of section 60: header.entryListOffset + i*208; row i = story point i (row labels: list BpStoryPointAdditionList: 0 = After first controlling Reks, 1 = After first controlling Vaan, rest reserve)

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `activeSlot1` | Party member in active slot 1 (255 = empty; the Workshop reads the byte as signed, so -1). | `PartyMemberList` | IW StoryPointAdditionsBasicInfo.cs:43-46,82-85; LL section60.md |
| 0x01 | 1 | u8 | `activeSlot2` | Party member in active slot 2 (255 = empty; the Workshop reads the byte as signed, so -1). | `PartyMemberList` | IW StoryPointAdditionsBasicInfo.cs:43-46,82-85; LL section60.md |
| 0x02 | 1 | u8 | `activeSlot3` | Party member in active slot 3 (255 = empty; the Workshop reads the byte as signed, so -1). | `PartyMemberList` | IW StoryPointAdditionsBasicInfo.cs:43-46,82-85; LL section60.md |
| 0x03 | 1 | u8 | `activeSlot4` | Party member in active slot 4 (255 = empty; the Workshop reads the byte as signed, so -1). | `PartyMemberList` | IW StoryPointAdditionsBasicInfo.cs:43-46,82-85; LL section60.md |
| 0x04 | 1 | u8 | `reserveSlot1` | Party member in reserve slot 1 (255 = empty). | `PartyMemberList` | IW StoryPointAdditionsBasicInfo.cs:48-51,82-85; LL section60.md |
| 0x05 | 1 | u8 | `reserveSlot2` | Party member in reserve slot 2 (255 = empty). | `PartyMemberList` | IW StoryPointAdditionsBasicInfo.cs:48-51,82-85; LL section60.md |
| 0x06 | 1 | u8 | `reserveSlot3` | Party member in reserve slot 3 (255 = empty). | `PartyMemberList` | IW StoryPointAdditionsBasicInfo.cs:48-51,82-85; LL section60.md |
| 0x07 | 1 | u8 | `reserveSlot4` | Party member in reserve slot 4 (255 = empty). | `PartyMemberList` | IW StoryPointAdditionsBasicInfo.cs:48-51,82-85; LL section60.md |
| 0x08 | 1 | u8 | `reserveSlot5` | Party member in reserve slot 5 (255 = empty). | `PartyMemberList` | IW StoryPointAdditionsBasicInfo.cs:48-51,82-85; LL section60.md |
| 0x09 | 1 | bytes | `unknown09` | Not read; the Workshop leaves zero. |  | IW StoryPointAdditionsBasicInfo.cs:53,87; LL section60.md |
| 0x0A | 1 | u8 | `activePartyLeader` | Which of the 9 slots is the party leader (0-3 active, 4-8 reserve). | `BpeActivePartyLeaderList` | IW StoryPointAdditionsBasicInfo.cs:54,88; LL section60.md (partyLeaderSlot) |
| 0x0B | 3 | bytes | `unknown0B` | Not read; the Workshop leaves zeros. |  | IW StoryPointAdditionsBasicInfo.cs:55,89; LL section60.md |
| 0x0E | 2 | u16 | `gil` | Gil (the Workshop reads it as signed 16-bit, the Lua Loader docs as u16). |  | IW StoryPointAdditionsBasicInfo.cs:56,90; LL section60.md |
| 0x10 | 2 | u16 | `inventory1Content` | Content id of inventory slot 1. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x12 | 2 | u16 | `inventory2Content` | Content id of inventory slot 2. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x14 | 2 | u16 | `inventory3Content` | Content id of inventory slot 3. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x16 | 2 | u16 | `inventory4Content` | Content id of inventory slot 4. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x18 | 2 | u16 | `inventory5Content` | Content id of inventory slot 5. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x1A | 2 | u16 | `inventory6Content` | Content id of inventory slot 6. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x1C | 2 | u16 | `inventory7Content` | Content id of inventory slot 7. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x1E | 2 | u16 | `inventory8Content` | Content id of inventory slot 8. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x20 | 2 | u16 | `inventory9Content` | Content id of inventory slot 9. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x22 | 2 | u16 | `inventory10Content` | Content id of inventory slot 10. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x24 | 2 | u16 | `inventory11Content` | Content id of inventory slot 11. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x26 | 2 | u16 | `inventory12Content` | Content id of inventory slot 12. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x28 | 2 | u16 | `inventory13Content` | Content id of inventory slot 13. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x2A | 2 | u16 | `inventory14Content` | Content id of inventory slot 14. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x2C | 2 | u16 | `inventory15Content` | Content id of inventory slot 15. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x2E | 2 | u16 | `inventory16Content` | Content id of inventory slot 16. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x30 | 2 | u16 | `inventory17Content` | Content id of inventory slot 17. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x32 | 2 | u16 | `inventory18Content` | Content id of inventory slot 18. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x34 | 2 | u16 | `inventory19Content` | Content id of inventory slot 19. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x36 | 2 | u16 | `inventory20Content` | Content id of inventory slot 20. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x38 | 2 | u16 | `inventory21Content` | Content id of inventory slot 21. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x3A | 2 | u16 | `inventory22Content` | Content id of inventory slot 22. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x3C | 2 | u16 | `inventory23Content` | Content id of inventory slot 23. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x3E | 2 | u16 | `inventory24Content` | Content id of inventory slot 24. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x40 | 2 | u16 | `inventory25Content` | Content id of inventory slot 25. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x42 | 2 | u16 | `inventory26Content` | Content id of inventory slot 26. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x44 | 2 | u16 | `inventory27Content` | Content id of inventory slot 27. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x46 | 2 | u16 | `inventory28Content` | Content id of inventory slot 28. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x48 | 2 | u16 | `inventory29Content` | Content id of inventory slot 29. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x4A | 2 | u16 | `inventory30Content` | Content id of inventory slot 30. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x4C | 2 | u16 | `inventory31Content` | Content id of inventory slot 31. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x4E | 2 | u16 | `inventory32Content` | Content id of inventory slot 32. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x50 | 2 | u16 | `inventory33Content` | Content id of inventory slot 33. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x52 | 2 | u16 | `inventory34Content` | Content id of inventory slot 34. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x54 | 2 | u16 | `inventory35Content` | Content id of inventory slot 35. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x56 | 2 | u16 | `inventory36Content` | Content id of inventory slot 36. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x58 | 2 | u16 | `inventory37Content` | Content id of inventory slot 37. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x5A | 2 | u16 | `inventory38Content` | Content id of inventory slot 38. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x5C | 2 | u16 | `inventory39Content` | Content id of inventory slot 39. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x5E | 2 | u16 | `inventory40Content` | Content id of inventory slot 40. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x60 | 2 | u16 | `inventory41Content` | Content id of inventory slot 41. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x62 | 2 | u16 | `inventory42Content` | Content id of inventory slot 42. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x64 | 2 | u16 | `inventory43Content` | Content id of inventory slot 43. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x66 | 2 | u16 | `inventory44Content` | Content id of inventory slot 44. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x68 | 2 | u16 | `inventory45Content` | Content id of inventory slot 45. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x6A | 2 | u16 | `inventory46Content` | Content id of inventory slot 46. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x6C | 2 | u16 | `inventory47Content` | Content id of inventory slot 47. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x6E | 2 | u16 | `inventory48Content` | Content id of inventory slot 48. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x70 | 2 | u16 | `inventory49Content` | Content id of inventory slot 49. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x72 | 2 | u16 | `inventory50Content` | Content id of inventory slot 50. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x74 | 2 | u16 | `inventory51Content` | Content id of inventory slot 51. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x76 | 2 | u16 | `inventory52Content` | Content id of inventory slot 52. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x78 | 2 | u16 | `inventory53Content` | Content id of inventory slot 53. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x7A | 2 | u16 | `inventory54Content` | Content id of inventory slot 54. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x7C | 2 | u16 | `inventory55Content` | Content id of inventory slot 55. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x7E | 2 | u16 | `inventory56Content` | Content id of inventory slot 56. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x80 | 2 | u16 | `inventory57Content` | Content id of inventory slot 57. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x82 | 2 | u16 | `inventory58Content` | Content id of inventory slot 58. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x84 | 2 | u16 | `inventory59Content` | Content id of inventory slot 59. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x86 | 2 | u16 | `inventory60Content` | Content id of inventory slot 60. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x88 | 2 | u16 | `inventory61Content` | Content id of inventory slot 61. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x8A | 2 | u16 | `inventory62Content` | Content id of inventory slot 62. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x8C | 2 | u16 | `inventory63Content` | Content id of inventory slot 63. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x8E | 2 | u16 | `inventory64Content` | Content id of inventory slot 64. | `ContAllList` | IW StoryPointAdditionsBasicInfo.cs:58-65,92-95; LL section60.md |
| 0x90 | 1 | u8 | `inventory1Quantity` | Quantity of inventory slot 1. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0x91 | 1 | u8 | `inventory2Quantity` | Quantity of inventory slot 2. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0x92 | 1 | u8 | `inventory3Quantity` | Quantity of inventory slot 3. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0x93 | 1 | u8 | `inventory4Quantity` | Quantity of inventory slot 4. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0x94 | 1 | u8 | `inventory5Quantity` | Quantity of inventory slot 5. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0x95 | 1 | u8 | `inventory6Quantity` | Quantity of inventory slot 6. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0x96 | 1 | u8 | `inventory7Quantity` | Quantity of inventory slot 7. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0x97 | 1 | u8 | `inventory8Quantity` | Quantity of inventory slot 8. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0x98 | 1 | u8 | `inventory9Quantity` | Quantity of inventory slot 9. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0x99 | 1 | u8 | `inventory10Quantity` | Quantity of inventory slot 10. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0x9A | 1 | u8 | `inventory11Quantity` | Quantity of inventory slot 11. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0x9B | 1 | u8 | `inventory12Quantity` | Quantity of inventory slot 12. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0x9C | 1 | u8 | `inventory13Quantity` | Quantity of inventory slot 13. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0x9D | 1 | u8 | `inventory14Quantity` | Quantity of inventory slot 14. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0x9E | 1 | u8 | `inventory15Quantity` | Quantity of inventory slot 15. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0x9F | 1 | u8 | `inventory16Quantity` | Quantity of inventory slot 16. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xA0 | 1 | u8 | `inventory17Quantity` | Quantity of inventory slot 17. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xA1 | 1 | u8 | `inventory18Quantity` | Quantity of inventory slot 18. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xA2 | 1 | u8 | `inventory19Quantity` | Quantity of inventory slot 19. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xA3 | 1 | u8 | `inventory20Quantity` | Quantity of inventory slot 20. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xA4 | 1 | u8 | `inventory21Quantity` | Quantity of inventory slot 21. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xA5 | 1 | u8 | `inventory22Quantity` | Quantity of inventory slot 22. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xA6 | 1 | u8 | `inventory23Quantity` | Quantity of inventory slot 23. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xA7 | 1 | u8 | `inventory24Quantity` | Quantity of inventory slot 24. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xA8 | 1 | u8 | `inventory25Quantity` | Quantity of inventory slot 25. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xA9 | 1 | u8 | `inventory26Quantity` | Quantity of inventory slot 26. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xAA | 1 | u8 | `inventory27Quantity` | Quantity of inventory slot 27. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xAB | 1 | u8 | `inventory28Quantity` | Quantity of inventory slot 28. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xAC | 1 | u8 | `inventory29Quantity` | Quantity of inventory slot 29. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xAD | 1 | u8 | `inventory30Quantity` | Quantity of inventory slot 30. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xAE | 1 | u8 | `inventory31Quantity` | Quantity of inventory slot 31. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xAF | 1 | u8 | `inventory32Quantity` | Quantity of inventory slot 32. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xB0 | 1 | u8 | `inventory33Quantity` | Quantity of inventory slot 33. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xB1 | 1 | u8 | `inventory34Quantity` | Quantity of inventory slot 34. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xB2 | 1 | u8 | `inventory35Quantity` | Quantity of inventory slot 35. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xB3 | 1 | u8 | `inventory36Quantity` | Quantity of inventory slot 36. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xB4 | 1 | u8 | `inventory37Quantity` | Quantity of inventory slot 37. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xB5 | 1 | u8 | `inventory38Quantity` | Quantity of inventory slot 38. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xB6 | 1 | u8 | `inventory39Quantity` | Quantity of inventory slot 39. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xB7 | 1 | u8 | `inventory40Quantity` | Quantity of inventory slot 40. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xB8 | 1 | u8 | `inventory41Quantity` | Quantity of inventory slot 41. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xB9 | 1 | u8 | `inventory42Quantity` | Quantity of inventory slot 42. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xBA | 1 | u8 | `inventory43Quantity` | Quantity of inventory slot 43. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xBB | 1 | u8 | `inventory44Quantity` | Quantity of inventory slot 44. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xBC | 1 | u8 | `inventory45Quantity` | Quantity of inventory slot 45. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xBD | 1 | u8 | `inventory46Quantity` | Quantity of inventory slot 46. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xBE | 1 | u8 | `inventory47Quantity` | Quantity of inventory slot 47. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xBF | 1 | u8 | `inventory48Quantity` | Quantity of inventory slot 48. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xC0 | 1 | u8 | `inventory49Quantity` | Quantity of inventory slot 49. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xC1 | 1 | u8 | `inventory50Quantity` | Quantity of inventory slot 50. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xC2 | 1 | u8 | `inventory51Quantity` | Quantity of inventory slot 51. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xC3 | 1 | u8 | `inventory52Quantity` | Quantity of inventory slot 52. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xC4 | 1 | u8 | `inventory53Quantity` | Quantity of inventory slot 53. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xC5 | 1 | u8 | `inventory54Quantity` | Quantity of inventory slot 54. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xC6 | 1 | u8 | `inventory55Quantity` | Quantity of inventory slot 55. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xC7 | 1 | u8 | `inventory56Quantity` | Quantity of inventory slot 56. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xC8 | 1 | u8 | `inventory57Quantity` | Quantity of inventory slot 57. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xC9 | 1 | u8 | `inventory58Quantity` | Quantity of inventory slot 58. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xCA | 1 | u8 | `inventory59Quantity` | Quantity of inventory slot 59. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xCB | 1 | u8 | `inventory60Quantity` | Quantity of inventory slot 60. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xCC | 1 | u8 | `inventory61Quantity` | Quantity of inventory slot 61. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xCD | 1 | u8 | `inventory62Quantity` | Quantity of inventory slot 62. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xCE | 1 | u8 | `inventory63Quantity` | Quantity of inventory slot 63. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |
| 0xCF | 1 | u8 | `inventory64Quantity` | Quantity of inventory slot 64. |  | IW StoryPointAdditionsBasicInfo.cs:67-70,97; LL section60.md |

## Enums carried in the JSON spec

Flag enums list the mask value of each bit. Fields that point at bigger lists (text ids, content ids, animations, formulas …) name a list from `editor/data/lists.json` instead (see *External lists*).

#### `BpeActivePartyLeaderList` (Lists: BpeActivePartyLeaderList)

| Value | Label |
|---|---|
| 0 (0x0) | Active Slot 1 |
| 1 (0x1) | Active Slot 2 |
| 2 (0x2) | Active Slot 3 |
| 3 (0x3) | Active Slot 4 |
| 4 (0x4) | Reserve Slot 1 |
| 5 (0x5) | Reserve Slot 2 |
| 6 (0x6) | Reserve Slot 3 |
| 7 (0x7) | Reserve Slot 4 |
| 8 (0x8) | Reserve Slot 5 |

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `PartyMemberList` | section 16 party member rows 0-39 (0 = Vaan ... 39 = Zodiark; 255 / 65535 = none) |
| `ContAllList` | every content id (category<<12 \| index), see Content ids |

## Count and size rules

- 50 rows in vanilla (TK L839; only rows 0 and 1 are named). Rows are referenced by section 59 (`basicInfoLink`),
  so never reorder.
- Exactly 9 party slots and 64 inventory slots per row; quantities are single bytes (max 255).
- Party slot bytes: the Workshop treats them as signed (empty = -1 = 0xFF); this spec types them u8 so that the
  Toolkit list value 255 = None matches.

### Content ids

Fields typed as *content* hold a game-wide **content id** = `category << 12 | index` (TK L575, L1567): items 0x0000,
equipment 0x1000, loot 0x2000, magicks 0x3000, technicks 0x4000, gambit sets 0x5000 (TK L918), gambits 0x6000,
key-item family 0x8000 (maps 0x8000+, teleport locations 0x8040+, key items 0x8060+), packages 0x9000, rewards 0xA000,
prices 0xB000, mist 0xC000, bazaar goods 0xD000, gil 0xF000 | amount (Lists: ContAllList and the Cont* lists).
`65535` (0xFFFF) is *none* in the Toolkit's lists.

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
- Keep 9 party slots and 64 inventory slots (contents block 0x10-0x8F, quantities block 0x90-0xCF).

## Known unknowns

- gil signedness (Workshop s16, Lua Loader u16) and whether gil is really only 16 bits (bytes 0x0B-0x0D unread could be its low part).
- Bytes 0x09 and 0x0B-0x0D are never read.
- Whether the inventory replaces or adds to the current inventory.

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; license forbids copying or converting its code). Paths are relative to that repo, e.g. `Formats/Battlepack/Actions.cs`, `Formats/St2e.cs`, `Helpers/PackHelper.cs`, `Helpers/EnumHelper.cs`, `Resources/JsonFile.cs`, `Resources/PackFile.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| LL `sectionNN.md` | FF12 Lua Loader documentation, `capabilities/bpack-sections/sectionNN.md` (field names of the loader's read-only `game.bpack` view). |
| Lists | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json` (list name given). |
| Graveyard `<file>:<line>` | The Insurgent's Graveyard by Xeavin, `/home/user/xeavin/the-insurgents-graveyard/` (fact reference only). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
