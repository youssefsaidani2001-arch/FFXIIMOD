# Battlepack section 8 — Default Party Member Gambits (gambit sets)

Spec id: `battlepack-s08-default-party-member-gambits` · machine spec: [`battlepack-s08-default-party-member-gambits.json`](./battlepack-s08-default-party-member-gambits.json)

Battlepack **section 8** holds the default gambit loadouts ("Gambit Sets", TK L810): each 64-byte row lists up to
12 gambit targets and the 12 actions paired with them. A party member points at its set through the gambit-set field
of section 16 (+0x14, stored as 0x5000 + row, TK L918), and story point additions do the same (section 59 +0x0E).

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

Section 8 specifics: `entrySize` = 64 (0x40) (IW Formats/Battlepack/DefaultPartyMemberGambits.cs:17).
The Workshop maps the unpacked file `section_008.bin` to this table (IW Resources/JsonFile.cs:30).

Row layout used by this spec (the Workshop's): twelve u16 targets at 0x00-0x17, 8 bytes it never reads at 0x18-0x1F,
twelve u16 actions at 0x20-0x37, 8 bytes it never reads at 0x38-0x3F; slot *j* of the target block pairs with slot *j*
of the action block (IW DefaultPartyMemberGambits.cs:29-53). In other words two 16-slot halves of which the first
12 slots are used.

**Conflicting description.** The Lua Loader docs describe interleaved pairs instead: target of gambit *N* at
0x00 + 4(N-1), action at 0x02 + 4(N-1) (LL section08.md). The two readings cannot both be right. This spec follows the
Workshop, whose author states he checked every battlepack type (msg 622) and whose split read would produce obviously
mixed target/action values if the data were interleaved. Verify on a vanilla dump: in a correct reading the first 12
words are small gambit-target ids (0-255) and words 16-27 are action ids.

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…`/`unused…` are not interpreted by any source; keep their original bytes.

### Record `header` — 32 bytes (0x20), count: 1

*Where:* Offset 0 of battlepack section 8.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `magic` | ASCII 'st2e' (73 74 32 65); reject the section if different. |  | IW Formats/St2e.cs:9,20 |
| 0x04 | 4 | u32 | `entryCount` | Number of gambit sets. |  | IW Formats/St2e.cs:25 |
| 0x08 | 2 | u16 | `entrySize` | Bytes per entry; 64 (0x40) for this section. |  | IW Formats/St2e.cs:26 |
| 0x0A | 2 | bytes | `unknown0A` | Not interpreted; keep. |  | IW Formats/St2e.cs:27 |
| 0x0C | 4 | u32 | `entryListOffset` | Offset of entry 0 from the section start: 32 when entryCount > 0, else 0. |  | IW Formats/St2e.cs:12,28,39 |
| 0x10 | 4 | u32 | `offset10` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:29,40 |
| 0x14 | 4 | u32 | `textSectionOffset` | Inline text offset; 0 on disk for this section (filled at run time). No strings are stored here. |  | IW Formats/St2e.cs:30,41; TK L262, L978 |
| 0x18 | 4 | u32 | `offset18` | Unknown offset slot (0 in Workshop output for this section). |  | IW Formats/St2e.cs:31,42 |
| 0x1C | 4 | u32 | `offset1C` | Unknown offset slot (0 in Workshop output). |  | IW Formats/St2e.cs:32,43 |

### Record `gambitSet` — 64 bytes (0x40), count: header.entryCount

*Where:* st2e entries of section 8: header.entryListOffset + i*64; row i = gambit set i (content-id form 0x5000 | i)

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `target1` | Gambit target (condition) of slot 1. | `BpGambitList` | IW DefaultPartyMemberGambits.cs:30-34,48,66 |
| 0x02 | 2 | u16 | `target2` | Gambit target (condition) of slot 2. | `BpGambitList` | IW DefaultPartyMemberGambits.cs:30-34,48,66 |
| 0x04 | 2 | u16 | `target3` | Gambit target (condition) of slot 3. | `BpGambitList` | IW DefaultPartyMemberGambits.cs:30-34,48,66 |
| 0x06 | 2 | u16 | `target4` | Gambit target (condition) of slot 4. | `BpGambitList` | IW DefaultPartyMemberGambits.cs:30-34,48,66 |
| 0x08 | 2 | u16 | `target5` | Gambit target (condition) of slot 5. | `BpGambitList` | IW DefaultPartyMemberGambits.cs:30-34,48,66 |
| 0x0A | 2 | u16 | `target6` | Gambit target (condition) of slot 6. | `BpGambitList` | IW DefaultPartyMemberGambits.cs:30-34,48,66 |
| 0x0C | 2 | u16 | `target7` | Gambit target (condition) of slot 7. | `BpGambitList` | IW DefaultPartyMemberGambits.cs:30-34,48,66 |
| 0x0E | 2 | u16 | `target8` | Gambit target (condition) of slot 8. | `BpGambitList` | IW DefaultPartyMemberGambits.cs:30-34,48,66 |
| 0x10 | 2 | u16 | `target9` | Gambit target (condition) of slot 9. | `BpGambitList` | IW DefaultPartyMemberGambits.cs:30-34,48,66 |
| 0x12 | 2 | u16 | `target10` | Gambit target (condition) of slot 10. | `BpGambitList` | IW DefaultPartyMemberGambits.cs:30-34,48,66 |
| 0x14 | 2 | u16 | `target11` | Gambit target (condition) of slot 11. | `BpGambitList` | IW DefaultPartyMemberGambits.cs:30-34,48,66 |
| 0x16 | 2 | u16 | `target12` | Gambit target (condition) of slot 12. | `BpGambitList` | IW DefaultPartyMemberGambits.cs:30-34,48,66 |
| 0x18 | 8 | bytes | `unknown18` | Not read; the Workshop leaves zeros. Possibly target slots 13-16. |  | IW DefaultPartyMemberGambits.cs:36,69 |
| 0x20 | 2 | u16 | `action1` | Action of slot 1 (paired with target1). | `BpActionList` | IW DefaultPartyMemberGambits.cs:37-41,49,72 |
| 0x22 | 2 | u16 | `action2` | Action of slot 2 (paired with target2). | `BpActionList` | IW DefaultPartyMemberGambits.cs:37-41,49,72 |
| 0x24 | 2 | u16 | `action3` | Action of slot 3 (paired with target3). | `BpActionList` | IW DefaultPartyMemberGambits.cs:37-41,49,72 |
| 0x26 | 2 | u16 | `action4` | Action of slot 4 (paired with target4). | `BpActionList` | IW DefaultPartyMemberGambits.cs:37-41,49,72 |
| 0x28 | 2 | u16 | `action5` | Action of slot 5 (paired with target5). | `BpActionList` | IW DefaultPartyMemberGambits.cs:37-41,49,72 |
| 0x2A | 2 | u16 | `action6` | Action of slot 6 (paired with target6). | `BpActionList` | IW DefaultPartyMemberGambits.cs:37-41,49,72 |
| 0x2C | 2 | u16 | `action7` | Action of slot 7 (paired with target7). | `BpActionList` | IW DefaultPartyMemberGambits.cs:37-41,49,72 |
| 0x2E | 2 | u16 | `action8` | Action of slot 8 (paired with target8). | `BpActionList` | IW DefaultPartyMemberGambits.cs:37-41,49,72 |
| 0x30 | 2 | u16 | `action9` | Action of slot 9 (paired with target9). | `BpActionList` | IW DefaultPartyMemberGambits.cs:37-41,49,72 |
| 0x32 | 2 | u16 | `action10` | Action of slot 10 (paired with target10). | `BpActionList` | IW DefaultPartyMemberGambits.cs:37-41,49,72 |
| 0x34 | 2 | u16 | `action11` | Action of slot 11 (paired with target11). | `BpActionList` | IW DefaultPartyMemberGambits.cs:37-41,49,72 |
| 0x36 | 2 | u16 | `action12` | Action of slot 12 (paired with target12). | `BpActionList` | IW DefaultPartyMemberGambits.cs:37-41,49,72 |
| 0x38 | 8 | bytes | `unknown38` | Not read; the Workshop writes zeros. Possibly action slots 13-16. |  | IW DefaultPartyMemberGambits.cs:43,74 |

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `BpGambitList` | section 7 gambit target rows 0-255 |
| `BpActionList` | section 14 action rows 0-543 |

## Count and size rules

- One 64-byte row per gambit set; rows are addressed by index from sections 16 and 59, so never reorder.
- The game gives a member as many starting gambit slots as its set has filled entries; Vaan and Penelo get one more
  slot through code, so give other members at least 2 entries and keep Vaan/Penelo at 1 (msg 55). The Toolkit's
  "Reset Gambits" re-applies the set and clamps the slot count to 2-12 (TK L543).
- Empty slots: sentinel assumed to be 0xFFFF (not verified).

### Text

No strings. Targets are gambit-target ids (section 7 rows, Lists: BpGambitList; names in the gambit text block) and
actions are action ids (section 14 rows, Lists: BpActionList). Both assignments are inferred from the field names;
see gaps.

## Pointers

None in the file. Incoming references: section 16 +0x14 and section 59 +0x0E store `0x5000 + row`.

## Round-trip rules

- Edit fields in place; the record size is fixed and nothing in this section points at entries, so value edits never move data.
- Copy every byte that no field interprets (unknown*/padding, unnamed bits) from the original; the Workshop writer zero-fills them (it seeks over them), so do not use its output as the byte-identical reference.
- Keep the st2e header bytes verbatim except entryCount (and entryListOffset when the count goes to/from 0).
- Keep the trailing zero padding that rounds the section to a multiple of 16 bytes.
- If the section length changes (added/removed entries), rewrite the battlepack offset table: every later section offset and the end offset shift by the padded size delta.
- Write the target and action of a slot at the same slot index (target j at 0x00+2j, action j at 0x20+2j).
- Do not reorder rows: sections 16 and 59 refer to them as 0x5000 + row.

## Known unknowns

- Layout conflict: Workshop = split target/action blocks (used here); Lua Loader docs = interleaved pairs. Verify on vanilla data before writing edits.
- Bytes 0x18-0x1F and 0x38-0x3F are never read (possibly slots 13-16).
- Empty-slot sentinel (assumed 0xFFFF) and whether targets are section 7 rows or battle-logic target-condition ids.
- Vanilla row count not documented.

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; license forbids copying or converting its code). Paths are relative to that repo, e.g. `Formats/Battlepack/Actions.cs`, `Formats/St2e.cs`, `Helpers/PackHelper.cs`, `Helpers/EnumHelper.cs`, `Resources/JsonFile.cs`, `Resources/PackFile.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| LL `sectionNN.md` | FF12 Lua Loader documentation, `capabilities/bpack-sections/sectionNN.md` (field names of the loader's read-only `game.bpack` view). |
| Lists | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json` (list name given). |
| Graveyard `<file>:<line>` | The Insurgent's Graveyard by Xeavin, `/home/user/xeavin/the-insurgents-graveyard/` (fact reference only). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
