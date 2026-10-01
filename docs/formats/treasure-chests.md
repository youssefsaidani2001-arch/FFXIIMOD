# EBP field-script data - treasure chests and traps

Spec id: `treasure-chests` · machine spec: [`treasure-chests.json`](./treasure-chests.json)

Every field map carries a table of **treasure chest records** (24 bytes each) in the data block of its compiled
script, plus a small **trap table** (12-byte records) next to it. A chest record holds the chest's map position,
its spawn chance, the chance that it holds gil, the two normal item picks, the two Diamond Armlet picks, two gil
amounts, a unique-chest id and a flag byte. This spec decodes the record byte by byte from the hex dump in the
*Vanilla Chests* sheet (column A holds each record as a 24-byte hex string, columns AA-AX split it into bytes, and
columns H-Z give the decoded values), cross-checked against Xeavin's *Always Spawn Treasures* Lua patch, which reads
two of the fields directly.

## Where the data lives

| Fact | Source |
|---|---|
| The per-area script (EBP section 0) has a "Treasure (setuptreasure)" sub-array for "chest contents and respawn behaviour", and a "Traps" sub-array; the Toolkit edits chests there. | TK L1109, L1115, L1722 |
| The chest sheet was built from decompiled scripts: its "Source Data" column names `<map>.c` files (alc_a01.c, ald_a01.c, asp_a03.c, bds_a01.c ...), with area and sub-area names. | GS:Chests C-E |
| The ff12-script decompiler turns a map script into `<map>.c` plus `<map>.src.data`; data arrays such as the trap table sit in `.src.data` and are only used through script calls ("nothing within the data file is interpreted automatically"). | msg 132-136, 159-166, 1049, 1065 |
| EBP container (magic `EBP2`, 20 sections, section 0 = compiled script). | container-ebp |
| Record offsets in the sheet advance by 0x18 within a map (0x40, 0x58, 0x70 ... for ald_a01). | GS:Chests F (rows 3-10) |

The sheet's Offset column starts at 0x00 for alc_a01 and ald_a02 but at 0x40 for ald_a01 and 0x240 for bds_a01,
so it is an offset inside a larger block (most likely `<map>.src.data`), not inside the chest table.

The `files` globs are `**/*.ebp` (the map scripts, named `<area>_<letter><nn>`, e.g. `ald_a01`) and `**/*.src.data`
(the decompiled data block). No source names the VBF folder of the map EBPs.

## Runtime evidence (Always Spawn Treasures)

Xeavin's *Always Spawn Treasures* Lua (Drive file `10KELL0x4ObwToqI56Hl_QGAQjDBnPFW5`, lines below as `AST:n`) replaces a
call at 0x00354454 in the TZA executable. Its routine receives a pointer to a chest record in `rcx`:

* `movzx ecx, byte ptr [rbx+0x09]` then `call 0x0032AA60`: the **byte at +0x09** is handed to a check that tells
  whether a unique chest has already been taken; a non-zero answer stops the spawn (AST:17-27). This is the
  sheet's "Unique Spawn ID".
* `movzx r8d, byte ptr [rbx]` with the current map id (from `call 0x003148F0`) and `r9d = 1`, then
  `call 0x002FB430` on the flag store at 0x02EC3E60: the **byte at +0x00** is the chest's index in the map's
  opened-chest flags (AST:29-36). So +0x00 is read as a single byte, which is why +0x01..+0x03 are padding.
* The Graveyard changelog describes the option as letting "unique treasures ... spawn more than once"
  (IGY README:155), matching the +0x09 check.

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record.

### Record `treasureChest` - 24 bytes (0x18), count: one per chest of the map (1-11 per map in the samples; 1966 records in the whole game per the sheet)

*Where:* Data block of the map's compiled field script (EBP section 0; `<map>.src.data` after decompiling with ff12-script). Records are contiguous with a 24-byte stride, ordered by chestIndex; record k = table start + 24*k. The Vanilla Chests sheet gives every record's hex offset (column F), e.g. ald_a01 0x40, 0x58, 0x70 ...; bds_a01 from 0x240.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `chestIndex` | Index of the chest inside its map, 0 .. n-1, equal to the record's position in the table. The game uses it as the bit number of the map's "chest opened" flag: the Always Spawn Treasures patch passes this byte, together with the current map id, to the routine that resets that flag. |  | GS:Chests AA "Sort" = G "Zone Sort" (rows 2-27); AST:30-36 |
| 0x01 | 3 | bytes | `unused01` | Three bytes that are 00 in every sampled record. The game reads +0x00 as a single byte, so these are padding or an unused high part. |  | GS:Chests AB-AD "Unused" (rows 2-27); AST:34 |
| 0x04 | 2 | s16 | `posX` | Chest position, first ground axis. Signed: the sheet prints the raw u16 (65433 = 0xFF99 = -103 in the Necrohol of Nabudis), so store it as s16. Unit/scale not stated. |  | GS:Chests H "X", AE-AF (rows 2-27; row 23 = 0xFF99) |
| 0x06 | 2 | s16 | `posY` | Chest position, second ground axis (the sheet calls it Y; for traps in the same data block the community calls the matching value Z, msg 143). |  | GS:Chests I "Y", AG-AH (rows 2-27); msg 143 |
| 0x08 | 1 | bf8 | `flags` | Flag byte; the sheet splits it into bits 0-7 and names only bit 6. | bits below | GS:Chests AI "Flags Array", J-Q |
| 0x09 | 1 | u8 | `uniqueSpawnId` | 255 = ordinary chest that can respawn. Any other value makes the chest a once-only ("non-repeatable") chest: the game checks this id before spawning it and skips the chest if the id was already taken. Several chests, in the same or in different maps, can share one id (the shared sheet numbers the once-only chests from 1, up to 161 in its readable rows, with variants A-D), so only one of them can be looted. | `ChestUniqueSpawnId` | GS:Chests R/AJ "Unique Spawn ID" (rows 2-27 = 255); AST:17-27; GS:NRC A "Chest Number"; IGY README:155 |
| 0x0A | 1 | u8 | `spawnChance` | Chance, in percent, that the chest appears when the map is entered (samples: 1, 2, 5, 30, 35, 80). |  | GS:Chests S/AK "Spawn Chance" (rows 2-27) |
| 0x0B | 1 | u8 | `gilChance` | Chance, in percent, that a spawned chest holds gil instead of an item (samples: 30, 50, 70, 80). |  | GS:Chests T/AL "Gil Chance" (rows 2-27) |
| 0x0C | 2 | u16 | `itemLow` | Item chest, Diamond Armlet not equipped: first of the two 50% picks ("Low Item"). Content id (category << 12 \| index; 63 = Knot of Rust; once-only chests also hold magicks 0x3000+ and technicks 0x4000+, GS:NRC B). | `ContAllList` | GS:Chests U, AM-AN (rows 2-27) |
| 0x0E | 2 | u16 | `itemHigh` | Item chest, Diamond Armlet not equipped: second 50% pick ("High Item"), e.g. 46 Bio Mote, 4330 (0x10EA) Chakra Band. | `ContAllList` | GS:Chests V, AO-AP (rows 23-27) |
| 0x10 | 2 | u16 | `itemDiamondCommon` | Item chest with the Diamond Armlet equipped: the 95% pick. | `ContAllList` | GS:Chests W, AQ-AR (rows 2-27) |
| 0x12 | 2 | u16 | `itemDiamondRare` | Item chest with the Diamond Armlet equipped: the 5% pick (e.g. 24 Dark Energy, 25-28 Meteorite A-D, 4274 (0x10B2) Seitengrat on the Skyferry). | `ContAllList` | GS:Chests X, AS-AT (rows 2-27; row 22 = 0x10B2) |
| 0x14 | 2 | u16 | `gil` | Gil amount of a gil chest (plain amount, not a content id; samples 1-50 and 1000). |  | GS:Chests Y, AU-AV (rows 2-27) |
| 0x16 | 2 | u16 | `gilDiamond` | Gil amount when the Diamond Armlet is equipped; equal to `gil` in every sample. |  | GS:Chests Z, AW-AX (rows 2-27) |

#### Bits of `treasureChest.flags` (bf8 at 0x08; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum | Source |
|---|---|---|---|---|
| 0-5 | 0x3F | `unknownBits0to5` | Unknown 6-bit value. In the samples it holds multiples of 5 that grow with the chest index (ald_a02: 0,0,5,10,...,45; ald_a01: 0,5,40,10,...,35; bds_a01: 0,5,10,15). Keep as read. | GS:Chests J-O "0->0" .. "5->5", AI (rows 2-27) |
| 6 | 0x40 | `randomizeGil` | Gil amount is randomized (sheet column "Randomize Gil"). Set on the Archades and Necrohol samples. | GS:Chests P "Rand-omize Gil" (rows 2, 23-27 = 1) |
| 7 | 0x80 | `unknownBit7` | Unknown (sheet column "7 -> 7"); 0 in every sample. | GS:Chests Q "7 -> 7" |

### Decoded samples

| Sheet row | Map | Offset | Hex (24 bytes) | Reading |
|---|---|---|---|---|
| 2 | alc_a01.c Archades - Grand Arcade | 0x000 | `00 00 00 00 6B 02 26 02 40 FF 05 50 3F 00 3F 00 3F 00 18 00 32 00 32 00` | idx 0, X 619, Y 550, flags 0x40 (randomize gil), unique none, spawn 5 %, gil 80 %, items 63/63/63/24 Dark Energy, gil 50/50 |
| 4 | ald_a01.c Old Archades - Alley of Muted Sighs | 0x058 | `01 00 00 00 FE 03 1A 01 05 FF 50 32 3F 00 3F 00 3F 00 1A 00 13 00 13 00` | idx 1, X 1022, Y 282, flags 0x05 (bits 0 and 2), spawn 80 %, gil 50 %, rare 26 Meteorite B, gil 19 |
| 22 | asp_a03.c Skyferry - Air Deck | 0x000 | `00 00 00 00 C8 00 FA 00 00 FF 01 50 3F 00 3F 00 3F 00 B2 10 0A 00 0A 00` | spawn 1 %, gil 80 %, Diamond Armlet 5 % pick = 0x10B2 (4274) Seitengrat, gil 10 |
| 23 | bds_a01.c Necrohol of Nabudis - Hall of Effulgent Light | 0x240 | `00 00 00 00 99 FF B5 08 40 FF 23 1E 3F 00 2E 00 3F 00 1A 00 E8 03 E8 03` | X 0xFF99 = -103, Y 2229, randomize gil, spawn 35 %, gil 30 %, high item 46 Bio Mote, gil 1000 |
| 24 | bds_a01.c (same map) | 0x258 | `01 00 00 00 ED FE 09 09 45 FF 1E 1E 3F 00 EA 10 3F 00 19 00 E8 03 E8 03` | X -275, flags 0x45 (bits 0, 2, 6), spawn 30 %, high item 0x10EA (4330) Chakra Band |

All 26 readable rows decode consistently with the table above (each byte column AA-AX matches the hex string and the
decoded columns H-Z).

### Unique (non-repeatable) chests

The shared *Non-Repeatable Chests* sheet numbers the once-only chests from 1 (up to 161 in the rows the connector returned; its range runs to row 280); some numbers appear several times
with suffixes A-D (for example number 1 at the Sochen Cave Palace and three times at the Draklor Laboratory, number 23
at Sochen and the Feywood), and its contents include magicks and technicks (Blind, Silence, Warp, Numerology, Infuse ...), accessories such as the
Diamond Armlet, and endgame weapons (GS:NRC A-D, rows 3-199), so chest item fields also take magick (0x3000) and
technick (0x4000) content ids. Chests that share a number share one `uniqueSpawnId`, so
looting one removes the others. The exact numbering offset (N or N-1) is not confirmed.

### Trap table

Traps were mapped on the Discord (srb_b04.src.data): a `u32` count at 0x390 (5 traps), followed by one `u32` offset
per trap measured from the count field, then the 12-byte trap records; the first trap is at 0x3AC (msg 132-146).

### Record `trapTableHeader` - 4 bytes (0x4), count: 1

*Where:* Trap table in the same script data block, e.g. srb_b04.src.data offset 0x390 (count 5).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | u32 | `trapCount` | Number of traps in the map. A table of trapCount u32 offsets follows; each offset is relative to the address of this count field. |  | msg 134-135, 142 |

### Record `trapOffset` - 4 bytes (0x4), count: trapTableHeader.trapCount

*Where:* Directly after trapCount: entry i at trapCount address + 4 + 4*i.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | u32 | `offset` | Offset of trap i, measured from the trapCount field. |  | msg 135 |

### Record `trap` - 12 bytes (0xC), count: trapTableHeader.trapCount

*Where:* At trapCount address + trapOffset[i].offset (first trap of srb_b04 at 0x3AC).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | s16 | `posX` | Trap position, first axis ("ushort" in the original note; chests in the same data use signed values, so treat as s16). |  | msg 138, 143 |
| 0x02 | 2 | s16 | `posZ` | Trap position, second ground axis (Z). |  | msg 138, 143 |
| 0x04 | 1 | u8 | `uniqueFlagIndex` | 0xFF = the trap always respawns. A lower value makes the game check a flag in the "non-respawn treasures" flag array (runtime 0x02165934) before spawning, so the trap would trigger only once. |  | msg 156, 168, 171 |
| 0x05 | 1 | u8 | `unknown05` | 0x64 (100) or 0 in the examined map; possibly a spawn chance in percent (unconfirmed). |  | msg 143, 146 |
| 0x06 | 2 | u16 | `action1` | First of two actions; the trap fires one of the two at random. Battlepack section 14 action row (assumed from the action wording). | `BpActionList` | msg 138, 143 |
| 0x08 | 2 | u16 | `action2` | Second action of the random pair. | `BpActionList` | msg 138, 143 |
| 0x0A | 2 | u16 | `unknown0A` | Always 0x000A in the examined map; unknown. |  | msg 138, 143 |

## Enums carried in the JSON spec

#### `ChestUniqueSpawnId` - only the "none" value is known; other values are the once-only chest numbers

| Value | Label |
|---|---|
| 255 (0xFF) | None (ordinary, respawning chest) |

Item fields use the content-id list `ContAllList` (`editor/data/lists.json`); the category split is documented in
[`enums-content-ids`](./enums-content-ids.md). The sheet's "Inventory" tab holds the same id:name list
(0:Potion, 1:Hi-Potion ..., GS:Chests Inventory!A).

## Count and size rules

- One 24-byte record per chest; a map's records are contiguous and numbered 0 .. n-1 by `chestIndex`.
- The sheet lists 1966 chest records in total (Chest Data rows 2-1967).
- Trap table: 4 + 4 x trapCount bytes of header, then trapCount 12-byte records (see the gap about the extra word).

## Pointers to fix when sizes change

None for in-place edits. Adding or removing chests or traps changes the script data block; that requires
recompiling the script (the call that hands the table to `setuptreasure` and any counts in the code), after which
the EBP section offsets must be rebuilt (container-ebp). This spec does not cover that.

## Text

No strings. Item names come from the content-id list.

## Round-trip rules

- Edit fields in place only: the record size (24 bytes, 12 for traps) and the number of records are fixed by the compiled script; never insert, delete or reorder records in a .src.data block.
- Keep chestIndex unchanged: it is the per-map bit number of the opened-chest flag, so renumbering would swap the saved opened state between chests and can collide with other chests of the map.
- Copy unused01 (+0x01..+0x03) and flags bits 0-5 and 7 back exactly as read.
- uniqueSpawnId: keep 255 for respawning chests. A value other than 255 links the chest to every other chest with the same id (only one of them can ever be looted); reuse an id only on purpose.
- Item fields (+0x0C..+0x12) are content ids (category << 12 | index, see enums-content-ids); gil fields (+0x14, +0x16) are plain unsigned amounts, not content ids.
- Positions are signed 16-bit values; write them back with the same sign convention.
- spawnChance and gilChance are percentages; keep them in 0-100.
- Trap offsets are relative to the trapCount field; editing trap fields does not move anything. Do not change trapCount.
- After editing a decompiled .src.data, rebuild the script with the same tool; when only field values change the script size does not change, so the EBP section table stays valid (see container-ebp).

## Known unknowns

- Only the first 26 of the sheet's 1966 chest rows were readable through the Drive connector (summary view; the export endpoint is not available). The unused01 = 0, flags bit 7 = 0 and gilDiamond = gil observations rest on those rows.
- Meaning of flags bits 0-5 (multiples of 5 that rise with the chest index, with exceptions) and bit 7.
- Base of the sheet's Offset column (0x00 for the first chest of alc_a01 and ald_a02, 0x40 for ald_a01, 0x240 for bds_a01); presumably the offset in <map>.src.data, not confirmed.
- How setuptreasure is given the table (argument encoding in the script bytecode) and whether a count precedes it; an editor currently needs the sheet offsets or a pattern scan to find the table.
- Coordinate units and axes (whether sheet "Y" is the world Z axis).
- Whether uniqueSpawnId N equals "Chest Number" N of the Non-Repeatable Chests sheet or N-1, the highest number used (161 seen; the sheet runs to row 280) and the size of the unique-chest flag array.
- Exact randomize-gil formula and whether gilDiamond is ever different from gil in vanilla.
- Whether 65535 (none) is accepted in the item fields.
- VBF folder of the field EBP files (not recorded in our sources; search the archive for the <map>.ebp names in the sheet).
- Traps: why the first trap of srb_b04 starts at 0x3AC instead of 0x3A8 (an extra word after the offset table?), the meaning of +0x05 and +0x0A, the signedness of the positions, and whether uniqueFlagIndex uses the same flag array as chests (said to be likely, not tested, msg 171).

## Source keys

| Key | Source |
|---|---|
| GS:Chests `<tab>!<column>` / row n | Google Sheet *Vanilla Chests* (Drive id `1ZSwmTg18JVqgRNb0StEaBtPJAKKtV4DMiS9PNWL4Q8I`), tab "Chest Data" (A1:AX1967) and "Inventory". Read through the Google Drive connector, which returns a column summary plus the first rows of each tab, not every row (see Known unknowns). Row numbers are sheet rows (row 1 = first header row). |
| GS:NRC `<tab>!<column>` / row n | Google Sheet *Non-Repeatable Chests (Shared)* (Drive id `1Kh2rmNMmFEiterL7xW3INKEs93Qp38BpuzooJHh3Ofc`), tab "Non-Repeatable Chests" (A1:E280). Read through the Google Drive connector, which returns a column summary plus the first rows of each tab, not every row (see Known unknowns). Row numbers are sheet rows (row 1 = first header row). |
| AST:`n` | *Always Spawn Treasures* Lua by Xeavin (Google Drive file `10KELL0x4ObwToqI56Hl_QGAQjDBnPFW5`, `AlwaysSpawnTreasures.lua`), line n. |
| IGY README:`n` | The Insurgent's Graveyard README by Xeavin, `/home/user/xeavin/the-insurgents-graveyard/README.md`, line n. |
| container-ebp | [`container-ebp.md`](./container-ebp.md) in this folder. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| Lists: `<name>` | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json`. |
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (fact reference only; its licence forbids copying or converting its code). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
