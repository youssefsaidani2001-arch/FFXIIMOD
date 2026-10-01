# Container: `battle_pack.bin` (and its nested section 61)

The battlepack is the main gameplay database of FFXII: The Zodiac Age. On disk it
is a flat list of numbered sections behind a small offset table. Section 61 is
itself a smaller pack with the same shape (15 sub-sections, all text).

## Sources and citation keys

| Key | Meaning |
|---|---|
| `W:<file>:<line>` | The Insurgent's Workshop (Xeavin), `/home/user/xeavin/the-insurgents-workshop`. Used **only** as a reference for format facts; its licence forbids copying/modifying/redistributing, so nothing here is derived code. |
| `R:<line>` | `docs/research/insurgents_toolkit_reference.md` (write-up of The Insurgent's Toolkit cheat table). |
| `D#<n>` | Discord export *Sky Pirate's Den / wip-general*, message index `n`. |

## Where the file lives

| Item | Value | Source |
|---|---|---|
| VBF path (English) | `ps2data/image/ff12/test_battle/us/binaryfile/battle_pack.bin` | D#402, D#403 |
| Other languages | Same tree with a different language folder instead of `us` (folders `in`, `kr`, `cn`, `ch` are recognised by the text tool wrapper; full list unverified) | W:Helpers/PackHelper.cs:593-603 |
| Game file type / id | Gameplay File, type 2, file id 0x13 | R:241, R:1422 |
| Expected section count | 71 (indices 0-70) | W:Resources/PackFile.cs:20 |
| Nested pack | section 61, 15 sub-sections (0-14) | W:Resources/PackFile.cs:21, D#952-953, D#997 |
| Extract tool | VBF Browser extracts the file from the archive | D#402, D#414, D#416 |

## Byte order

All integers are little-endian (PC build; the reference reader uses .NET
`BinaryReader`, which is little-endian).

## Layout

```
+0x00  u32  sectionCount                (N; 71 for battle_pack.bin, 15 for section 61)
+0x04  u32  sectionOffset[0]            file-relative start of section 0
...    u32  sectionOffset[N-1]
+4+4N  u32  endOffset                   end of the last section's data (before final padding)
       00.. zero padding up to the next 16-byte boundary
       section 0 data, zero padding to 16
       section 1 data, zero padding to 16
       ...
       section N-1 data                 (ends exactly at endOffset)
       00.. zero padding so the file length is a multiple of 16
```

Facts behind the drawing:

* The first dword is the section count; the offset table that follows has
  **count + 1** entries, the last being an end-of-data offset
  (W:Helpers/PackHelper.cs:41, :71, :87). The game reads it the same way:
  `dword[file]` = count, section *i* starts at `dword[file + 4 + 4*i]` (R:241).
* Every section start is aligned to 16 bytes; the gap is filled with zero bytes
  (W:Helpers/PackHelper.cs:77-78, W:Helpers/BinaryHelper.cs:12-33).
* The end-of-data offset is recorded **before** the file's final alignment
  padding, then the file is padded to 16 (W:Helpers/PackHelper.cs:87-88).
* The offset table is written starting at file offset 0x04 (W:Helpers/PackHelper.cs:91-95).
* Offsets are relative to the start of the pack (file offsets). After loading,
  the game rewrites them in memory into absolute pointers; the toolkit's export
  converts them back to offsets before writing a section (R:241, R:971, R:1794).

### Size arithmetic

| Pack | Header bytes (`4 + 4*(N+1)`) | First section (aligned) | Zero gap |
|---|---|---|---|
| battle_pack.bin, N = 71 | 292 (0x124) | 0x130 | 12 bytes |
| section 61, N = 15 | 68 (0x44) | 0x50 | 12 bytes |

These are what a 16-byte-aligned rebuild produces; whether vanilla files use the
same first offset is not verified (see gaps).

### Section extent rule

Section *i* occupies `[sectionOffset[i], sectionOffset[i+1])`; the last one ends
at `endOffset`. Consequences:

* Offsets must be **non-decreasing** and sections are stored in index order
  (the reference reader walks the data sequentially from `sectionOffset[0]`,
  W:Helpers/PackHelper.cs:48-57).
* An **empty section** is encoded by giving it the same offset as the next
  section (length 0). It is never encoded as offset 0. The reference unpacker
  writes no file for it (W:Helpers/PackHelper.cs:51-55) and the packer writes an
  empty body for a missing file (W:Helpers/PackHelper.cs:79-85).
* Because extent is measured to the next section's start, the bytes of every
  section except the last include its trailing alignment padding. Re-aligning to
  16 on rebuild therefore adds nothing and the round trip is stable.

## Section map (battle_pack.bin)

`st2e:<n>` = an st2e table with entry size *n* bytes (see `container-st2e`).
Names come from the workshop's class names (W:Resources/JsonFile.cs:25-61) and the
toolkit (R:805-841).

| # | Content | Layout | Source |
|---|---|---|---|
| 0 | Weapon stances | custom: u16 entry size at +0, u16 count at +2, data from +4 | W:Resources/JsonFile.cs:25, R:805 |
| 1 | unknown | - | |
| 2 | Text table | FFXII text format (external `ff12-text` tool) | W:Resources/OtherFile.cs:22 |
| 3 | MP regeneration | st2e:8 | W:Resources/JsonFile.cs:26 |
| 4 | unknown | - | |
| 5 | Equipment categories | st2e:4 | JsonFile.cs:27 |
| 6 | Chain levels | st2e:37 | JsonFile.cs:28 |
| 7 | Gambits | st2e:32 | JsonFile.cs:29 |
| 8 | Default party member gambits | st2e:64 | JsonFile.cs:30 |
| 9 | Party member level growth | st2e:2 | JsonFile.cs:31 |
| 10 | Action groups | offset table: u32 count, count+1 u32 offsets (last = end), 4-byte entries | JsonFile.cs:32, R:812, W:Formats/Battlepack/ActionGroups.cs:23-36 |
| 11 | Magick categories | st2e:4 | JsonFile.cs:33 |
| 12 | License nodes | st2e:24 | JsonFile.cs:34 |
| 13 | Equipment and attributes | st2e:52 + attribute list (24-byte records) at header +0x18 | JsonFile.cs:35, R:267 |
| 14 | Actions | st2e:60 | JsonFile.cs:36 |
| 15 | Status effects | st2e:40 | JsonFile.cs:37 |
| 16 | Party members | st2e:128 | JsonFile.cs:38 |
| 17 | Battle menu categories | st2e:4 | JsonFile.cs:39 |
| 18 | Items | st2e:12 | JsonFile.cs:40 |
| 19-25 | unknown | - | |
| 26 | Mist (flagged unused by the toolkit) | st2e:8 | JsonFile.cs:41, R:1843 |
| 27 | Battle menu restrictions | bespoke (restriction list +0x0C, mode list +0x1C) | R:822, R:978 |
| 28 | Prices | st2e:4 | JsonFile.cs:42 |
| 29 | Magicks | st2e:8 | JsonFile.cs:43 |
| 30 | Technicks | st2e:8 | JsonFile.cs:44 |
| 31 | Concurrences | st2e:13 | JsonFile.cs:45 |
| 32 | Loot | st2e:10 | JsonFile.cs:46 |
| 33 | Maps | st2e:10 | JsonFile.cs:47 |
| 34 | Teleport locations | st2e:10 | JsonFile.cs:48 |
| 35 | Key items | st2e:10 | JsonFile.cs:49 |
| 36 | unknown | - | |
| 37 | Packages | st2e:12 | JsonFile.cs:50 |
| 38 | Rewards | st2e:12 | JsonFile.cs:51 |
| 39 | Shops | bespoke three-level list with 6-byte tagged headers | JsonFile.cs:52, W:Formats/Battlepack/Shops.cs:12-15 |
| 40 | unknown | - | |
| 41 | Elements | st2e:2 | JsonFile.cs:53 |
| 42 | Initial inventory | st2e:4 | JsonFile.cs:54 |
| 43-56 | unknown | - | |
| 57 | Bazaar goods | st2e:36 | JsonFile.cs:55 |
| 58 | Augments | st2e:8 | JsonFile.cs:56 |
| 59 | Story point additions, extended info | st2e:44 | JsonFile.cs:57 |
| 60 | Story point additions, basic info | st2e:208 | JsonFile.cs:58 |
| 61 | **Nested pack**, 15 text sub-sections | this container format again | PackFile.cs:21, OtherFile.cs:23 |
| 62-67 | unknown | - | |
| 68 | Location movement behaviour (purpose uncertain) | st2e:8 | JsonFile.cs:59, R:1855 |
| 69 | Movies | st2e:8 | JsonFile.cs:60 |
| 70 | License board | magic `licd`, u16 columns, u16 rows, u16 cells; same format as the 12 standalone `board_1.bin`..`board_12.bin` | JsonFile.cs:61-62, W:Formats/Battlepack/LicenseBoard.cs:12, :36-37 |

(Entry sizes come from each table's header-setup call in `W:Formats/Battlepack/*.cs`;
they are also stored in every st2e header, so an editor should read them from the
file rather than trust this table.)

## Section 61 (nested pack)

* Same layout as above with `sectionCount = 15`; first sub-section at 0x50
  when rebuilt (W:Resources/PackFile.cs:21).
* All 15 sub-sections (0-14) are FFXII text tables (W:Resources/OtherFile.cs:23).
  It must be unpacked as a pack first; feeding section 61 directly to the text
  tool fails (D#943-945, D#952-953, D#997).
* One user got 14 files from the 15 sub-sections (D#1005), which fits one
  zero-length sub-section being skipped. Unverified.

## Text and strings

* Battlepack records refer to names/descriptions by numeric text ids; the strings
  live in the text tables (section 2, section 61's sub-sections and standalone text
  files), and renaming is done with the text tool, not in the record (D#933-936).
* The text tables use FFXII's own text encoding with control tags. The workshop
  delegates them to an external tool (`ff12-text`) with a tag map and a language
  switch picked from the language folder: `in` -> Japanese, `kr` -> Korean,
  `cn` -> Simplified Chinese, `ch` -> Traditional Chinese, anything else ->
  English (W:Helpers/PackHelper.cs:478-514, :593-603). The text table format is
  **not** documented here.
* Short embedded labels elsewhere in the game (MRP texture names, EBP camera
  labels) are Shift-JIS, code page 932 (W:Helpers/BinaryHelper.cs:35-43,
  W:Program.cs:17).

## Pointers to fix when sizes change

1. Changing the byte length of section *i* shifts `sectionOffset[i+1..N-1]` and
   `endOffset` by the new aligned difference. Recompute them all by re-laying the
   sections: align to 16, record the start, append the data; record `endOffset`
   after the last section; pad the file to 16.
2. `sectionCount` must stay 71 (15 for section 61): the game indexes sections by
   number, and the loader relocates a fixed set of them (R:1422).
3. Offsets **inside** a section are section-relative (st2e list offset is 0x20,
   W:Formats/St2e.cs:12, :39), so moving a section never changes its interior.
   Sections whose interior holds offsets that must be recomputed when *their own*
   contents change size: 0, 10, 13, 39, 61, 70 - exactly the ones the toolkit's
   hot reloader relocates individually (R:1422).
4. Section 61 is rebuilt before the outer pack (inner containers first); the
   workshop packs its list in reverse for this reason (W:Program.cs:53, :88).

## Round-trip rules

* Keep `sectionCount`, the order of sections and every unedited section's bytes
  byte-identical, including the padding bytes that belong to it.
* An empty section stays empty with offset equal to the next section's offset;
  never write 0 for it.
* `endOffset` points at the end of real data, not at the padded file end.
* Padding is zero-filled.

## Known unknowns

* Whether vanilla places section 0 exactly at 0x130 (and section 61's first
  sub-section at 0x50) or leaves a larger gap. Verify against a clean dump.
* Whether the vanilla file length is padded to 16 after `endOffset`.
* Contents of sections 1, 4, 19-25, 36, 40, 43-56, 62-67 (no reader in either tool).
* The toolkit says its reloader "rebuilds all 55 section pointers" (R:1422);
  55 may equal the number of non-empty sections in vanilla. Unverified.
* Full list of language folders that contain a battle_pack.bin.
