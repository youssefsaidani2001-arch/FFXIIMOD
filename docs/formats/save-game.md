# Save game image (Session / World / Battle / Menu blocks) — runtime memory layout

Spec id: `save-game` · machine spec: [`save-game.json`](./save-game.json)

> **MEMORY IMAGE OF THE SAVE DATA (runtime).** The layout below is the in-memory save image; the save file on disk wraps it in an undocumented container, so this spec supports live editing only.

## What this is (and what it is not)

FFXII keeps the whole saveable game state in one fixed memory image and copies it to/from the save file.
This spec describes that **memory image** and the blocks the game and the Toolkit reach through pointers.
It is *not* a description of the save file on disk: none of our sources documents the on-disk wrapper
(header, compression/encryption, where the CRC is computed over), so an offline save editor cannot be built
from this spec alone. What you can build is a **live save editor** (Lua Loader `save` table / memory writes)
whose changes are persisted by the game's own save routine.

| Item | Value | Source |
|---|---|---|
| Image address | `0x02164280` (module-relative), size `0x56690` (353,936) bytes | LL save-config:73; TK L302, L763 |
| Pointer to it | `[0x02092758]` = sge_mabase (Session block) | TK L294 |
| Cross-check | gil read at `0x02164288` (= +0x08), game-time minutes at `0x0216429A` (= +0x1A), story progress at `0x02164480` (= +0x200) | Drive 163.lua:17, 133.lua:3, mappings.lua:7 |
| Load event | Lua Loader `onSaveLoad(bytesCopied, dest, size)` fires after a save has been copied into memory | LL event:23 |
| Mod data | Lua Loader save/load handlers keep mod data in a JSON file next to each save, not inside the image | LL event:244-277 |

### Block map

| Block | Base | Size | Contents | Source |
|---|---|---|---|---|
| Session | sge_mabase + 0x0000 (0x02164280) | 0x0200 | CRC, gil, steps, game time, save-menu info, build date, version | TK L294, L770 |
| World | sge_mabase + 0x0200 (0x02164480) | 0x2000 | story progress and all quest/event/treasure flags | TK L295, L771 |
| Battle (copy, "Ineffectual") | sge_mabase + 0x2200 | 0x6000 | mirror of the battle block; edits do nothing | TK L296, L772, L1839 |
| Menu | `[0x020927C0]` (sge_mebase) | 0x4818 | map reveals, clan primer/bestiary, inventory content slots and counters | TK L297, L773 |
| Battle (live) | `[0x02EBF190]` (sge_bibase) | 0x8004 | 40 party keeps, inventory counters, bazaar goods, party slots, gambit sets | TK L298, L774 |

Whether the Menu and live Battle blocks are physically inside the 0x56690-byte image (the Toolkit documents
six blocks within +0 .. +0x56690) is not stated in our write-up; always reach them through their pointers.

### Text

No strings are stored in the save image as far as documented: names, quest titles etc. are text ids
resolved through the game's text tables.

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…` are not interpreted by any source; keep their original bytes. Overlapping rows are alternative views of the same bytes (the note says which applies).

### Record `saveImage` — 353936 bytes (0x56690), count: 1

*Where:* Fixed address 0x02164280 (Lua Loader `save` table base; also the value of [0x02092758] = sge_mabase). Size 0x56690 = 353,936 bytes.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 512 | bytes | `sessionBlock` | Session block (record sessionBlock). |  | TK L294, L770 |
| 0x200 | 8192 | bytes | `worldBlock` | World block: story progress and every quest/event/treasure flag (record worldBlock). |  | TK L295, L771 |
| 0x2200 | 24576 | bytes | `battleBlockCopy` | Battle block copy, 0x6000 bytes. The Toolkit labels it "(Ineffectual)": writing here changes nothing in the running game. Its content mirrors the live Battle block (party members, inventory counters, bazaar goods, party slots). |  | TK L296, L772, L1839 |
| 0x8200 | 320656 | bytes | `remainder` | Rest of the image. The Toolkit documents rows up to +0x56690 but our write-up does not give offsets for the Menu block or the live Battle block; both are reached through pointers instead (see menuBlock / liveBattleBlock). |  | TK L302, L763; LL save-config:73 |

### Record `sessionBlock` — 512 bytes (0x200), count: 1

*Where:* saveImage + 0x0000 (absolute 0x02164280)

The Toolkit also places a *Save Menu* sub-block here (party members shown on the save screen, summoned party member, clan points, Clan Rank, current location, save count, save slot, flags), the save-game build date (YYYYMMDD) and version fields (TK L770). Their offsets are not in our write-up, so they stay inside the unknown ranges.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | u32 | `crcChecksum` | Save CRC checksum / remainder. Not recomputed by the Toolkit; whether the game recomputes it on save is unknown. |  | TK L302, L770, L786 |
| 0x04 | 4 | u32 | `crcState` | CRC state flag. |  | TK L302, L770 |
| 0x08 | 4 | s32 | `gil` | Party gil. Read as s32 by Xeavin's formula scripts at absolute 0x02164288. |  | TK L770; Drive 163.lua:17; Drive 18.lua:24 |
| 0x0C | 4 | u32 | `totalSteps` | Total steps walked. |  | TK L770 |
| 0x10 | 8 | u64 | `gameTimeFrames` | Game time as total seconds x 60 (8 bytes). |  | TK L770 |
| 0x18 | 2 | u16 | `gameTimeHours` | Game time hours (offset and width inferred: the minutes byte is at +0x1A). |  | TK L770 (inferred) |
| 0x1A | 1 | u8 | `gameTimeMinutes` | Game time minutes (read at absolute 0x0216429A). |  | Drive 133.lua:3; TK L770 |
| 0x1B | 1 | u8 | `gameTimeSeconds` | Game time seconds (inferred position, right after minutes). |  | TK L770 (inferred) |
| 0x1C | 484 | bytes | `unknown1C` | Not identified by any source; keep the original bytes. |  |  |

### Record `worldBlock` — 8192 bytes (0x2000), count: 1

*Where:* saveImage + 0x0200 (absolute 0x02164480 = sge_gibase)

The World block is the story/quest flag map: 256 indexed Global Flags, about 380 named groups (one per sidequest/NPC/cutscene trigger), Special Foe States (109 marks/rare games, 3-value enum), Global Battle Flags, Outfitters shop contents, Global Quest/Event flags, Teleport Location slots, Trophy Games (31), Location Discovery Cutscenes (32), Monograph requirements (10), Hunt Companion flags (10), Boss Encounter cutscenes (8) and Quests (256, stages + locations) (TK L771, L778, L782). Only the offsets listed below are known to us; the per-quest offsets live in the Toolkit table itself, not in our write-up.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `storyProgress` | Story progress counter (main scenario position). Width assumed 16-bit (Traveler's-tips requirements compare a 2-byte Story Progress). |  | Drive mappings.lua:7 (FehDead, absolute 0x02164480); TK L1165 |
| 0x02 | 4162 | bytes | `unknown02` | Not identified by any source; keep the original bytes. |  |  |
| 0x1044 | 4 | u32 | `currentLocationId` | Current location id (absolute 0x021654C4; read as s32 by several mods; also used as the index into the Map Ref locations table). |  | TK L320, L590; Drive getWeather.lua:8; Drive mappings.lua:6 |
| 0x1048 | 4 | u32 | `currentPositionIndex` | Spawn/position index inside the location (absolute 0x021654C8). |  | TK L320, L593 |
| 0x104C | 20 | bytes | `unknown104C` | Not identified by any source; keep the original bytes. |  |  |
| 0x1060 | 1 | u8 | `weatherMode` | Weather mode used to pick one of the per-region weather slots of the Map Ref file (absolute 0x021654E0). |  | Drive getWeather.lua:9-21 |
| 0x1061 | 1107 | bytes | `unknown1061` | Not identified by any source; keep the original bytes. |  |  |
| 0x14B4 | 1 | bytes | `nonRespawnFlagArray` | Start of the "non-respawn treasures" flag array (absolute 0x02165934): EBP trap/treasure records whose flag byte is not 0xFF test a flag starting here (trap +0x04 uniqueFlagIndex, see treasure-chests). Length not stated (1 byte shown here). |  | msg 156, 168, 171 |
| 0x14B5 | 2891 | bytes | `unknown14B5` | Not identified by any source; keep the original bytes. |  |  |

### Record `menuBlock` — 18456 bytes (0x4818), count: 1

*Where:* [0x020927C0] (sge_mebase). Not stated whether it lies inside saveImage.

Also in this block: Map Reveals (385 maps), the Clan Primer handbook triggers, and the Inventory Content Slots (the obtain-ordered u16 content-id lists the inventory menu renders) (TK L773). Their offsets are not in our write-up; the slot lists are found through the bag descriptors (record inventoryBagDescriptor).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 13316 | bytes | `unknown00` | Not identified by any source; keep the original bytes. |  |  |
| 0x3404 | 1024 | bytes | `bestiaryRegion` | Clan Primer bestiary region; the Toolkit's Complete Bestiary fills these 0x400 bytes with 0xFF (every entry seen/complete). |  | TK L629, L773 |
| 0x3804 | 4020 | bytes | `unknown3804` | Not identified by any source; keep the original bytes. |  |  |
| 0x47B8 | 48 | bytes | `inventoryContentTypeCounters` | 12 x u32: number of entries currently stored in each inventory bag (bag order = SgeInventoryContentTypeList: 0 Items, 1 Weapons, 2 Armor, 3 Accessories, 4 Ammunition, 6 Gambits, 8 Technicks, 9 Magicks, 10 Key Items/Maps/Candles, 11 Loot). |  | TK L773; Drive BlueMagick.lua:752-767 |
| 0x47E8 | 48 | bytes | `unknown47E8` | Not identified by any source; keep the original bytes. |  |  |

### Record `inventoryBagDescriptor` — 8 bytes (0x8), count: 12 (SgeInventoryContentTypeList ids 0-11)

*Where:* Static array at 0x02092760 + bag*8, 12 bags (0x02092760..0x020927BF, directly before the Menu block pointer).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `unknown00` | Not identified. |  | Drive BlueMagick.lua:755 |
| 0x02 | 2 | s16 | `capacity` | Maximum number of entries of the bag (magick bag = 81 in vanilla, full). |  | Drive BlueMagick.lua:752-773 |
| 0x04 | 4 | u32 | `entries` | 32-bit address of the bag's u16 content-id list (the inventory content slots). The engine appends to it when content is obtained and silently drops content when it is full. |  | Drive BlueMagick.lua:752-773 |

### Record `liveBattleBlock` — 32772 bytes (0x8004), count: 1

*Where:* [0x02EBF190] (sge_bibase; the battlepack section-pointer cache slot that the game also uses as the party/battle state root).

The live Battle block is what the game actually uses (TK L774, L1839): party members, inventory content counters, seized-inventory counters, sold-loot quantities, bazaar goods, party slots and party-member gambits. Offsets of the inventory/seized/sold-loot counters are not known to us; they presumably sit in 0x4748-0x59C7 (the gap after the 40 keeps).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `unknown00` | Not identified by any source; keep the original bytes. |  |  |
| 0x04 | 4 | u32 | `magickSchoolMask` | Unlocked battle-menu magick schools bitmask according to a community mod's notes (vanilla value 0x017F; bit 0x80 used by that mod for an extra school). Treat as unverified. |  | Drive BlueMagick.lua:54, 65 |
| 0x08 | 18240 | bytes | `partyMemberKeeps` | 40 Battle Unit Keeps of 0x1C8 bytes, one per party member id 0-39 (see live-battle-unit-keep). |  | Drive getBattleUnitKeep.lua (array helper):7; TK L774 |
| 0x4748 | 4736 | bytes | `unknown4748` | Not identified by any source; keep the original bytes. |  |  |
| 0x59C8 | 128 | bytes | `bazaarGoodStates` | 1 state byte per bazaar good, indexed by (content id & 0xFFF) = section 57 row 0-127 (record bazaarGoodState). |  | Drive TheInsurgentsItemizedBazaar.lua:128-140, 267-330; Drive TheInsurgentsThriftyBazaar.lua:55-59, 107-111 |
| 0x5A48 | 90 | bytes | `partySlotStructures` | 5 party-slot structures of 0x12 bytes (record partySlotStructure), order = SgePartySlotStructureTypeList: Default, Battle (Current), Battle (UI), Menu (UI), Battle (Last). Stride inferred from the two offsets used by mods (0x5A48, 0x5A5A). |  | Drive TheInsurgentsCompanions.lua:829-842; Drive getActivePartyMember.lua:7-8; Lists SgePartySlotStructureTypeList |
| 0x5AA2 | 2 | bytes | `unknown5AA2` | Not identified by any source; keep the original bytes. |  |  |
| 0x5AA4 | 1 | u8 | `partyLeaderMember` | Party member id that the game looks up in the Default slot structure to find the leader's slot (name inferred). |  | Drive TheInsurgentsCompanions.lua:829-842 |
| 0x5AA5 | 95 | bytes | `unknown5AA5` | Not identified by any source; keep the original bytes. |  |  |
| 0x5B04 | 4 | bf32 | `companionFlags` | Summoned companion flags. | bits below | Drive TheInsurgentsCompanions.lua:442-446, 802-842; Drive Wayfarer.lua:50-53 |
| 0x5B08 | 8 | bytes | `unknown5B08` | Not identified by any source; keep the original bytes. |  |  |
| 0x5B10 | 6240 | bytes | `partyMemberGambitSets` | 40 members x 3 gambit sets x 0x34 bytes (member stride 0x9C; record gambitSet). |  | Drive TheInsurgentsManifesto.lua:1914-1940, 2158-2165 |
| 0x7370 | 3220 | bytes | `unknown7370` | Not identified by any source; keep the original bytes. |  |  |

#### Bits of `liveBattleBlock.companionFlags` (bf32 at 0x5B04; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `esperSummoned` |  |
| 1 | `chocoboRidden` |  |

### Record `partySlotStructure` — 18 bytes (0x12), count: 5

*Where:* liveBattleBlock + 0x5A48 + structure*0x12, structure 0-4

Structure 1 ("Battle (Current)") is the one `getActivePartyMember(i)` reads (u16 at +0x5A5A + i*2, i 0-3). The *Companions* mod compares a byte against the entries of structure 0 with a 2-byte stride. Only slots 0-3 are confirmed.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `activeSlot0` | Battle slot 1: party member id (0xFFFF = empty assumed). | `PartyMemberList` | Drive getActivePartyMember.lua:2-9 |
| 0x02 | 2 | u16 | `activeSlot1` | Battle slot 2. | `PartyMemberList` |  |
| 0x04 | 2 | u16 | `activeSlot2` | Battle slot 3. | `PartyMemberList` |  |
| 0x06 | 2 | u16 | `activeSlot3` | Battle slot 4 (guest slot). | `PartyMemberList` |  |
| 0x08 | 2 | u16 | `reserveSlot0` | Reserve slot 1 (inferred: 9 slots = 4 active + 5 reserve, like battlepack section 60). | `PartyMemberList` |  |
| 0x0A | 2 | u16 | `reserveSlot1` | Reserve slot 2 (inferred). | `PartyMemberList` |  |
| 0x0C | 2 | u16 | `reserveSlot2` | Reserve slot 3 (inferred). | `PartyMemberList` |  |
| 0x0E | 2 | u16 | `reserveSlot3` | Reserve slot 4 (inferred). | `PartyMemberList` |  |
| 0x10 | 2 | u16 | `reserveSlot4` | Reserve slot 5 (inferred). | `PartyMemberList` |  |

### Record `gambitSet` — 52 bytes (0x34), count: 40 x 3

*Where:* liveBattleBlock + 0x5B10 + member*0x9C + set*0x34, member 0-39, set 0-2

Three sets per member (The Zodiac Age lets each character keep several gambit sets). The other 50 bytes are not mapped; a natural guess is 12 gambit target ids + 12 action ids + on/off bits, but no source states it. The *live* battle logic the AI runs is a separate runtime array at [0x02089378] (40 members x 14 entries, TK L1291), not this saved copy.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 50 | bytes | `unknown00` | Not identified by any source; keep the original bytes. |  |  |
| 0x32 | 1 | u8 | `slotCount` | Gambit slots of this set; the Manifesto mod forces it to at least 2 in all 3 sets. |  | Drive TheInsurgentsManifesto.lua:1914-1940 |
| 0x33 | 1 | bytes | `unknown33` | Not identified by any source; keep the original bytes. |  |  |

### Record `bazaarGoodState` — 1 bytes (0x1), count: 128 (section 57 rows)

*Where:* liveBattleBlock + 0x59C8 + (bazaarContentId & 0xFFF)

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 1 | bf8 | `state` | Bazaar good state bits as used by the Bazaar mods. | bits below | Drive TheInsurgentsItemizedBazaar.lua:255-300; Drive TheInsurgentsThriftyBazaar.lua:55-59 |

#### Bits of `bazaarGoodState.state` (bf8 at 0x00; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `stateBit0` | Tested when the section 57 good has neither type bit set; set = good no longer offered (e.g. already bought) - inferred |
| 1 | `stateBit1` | Set = good unlocked/offered regardless of type; the Thrifty Bazaar mod clears bits 1 and 2 (AND 0xF9) |
| 2 | `stateBit2` | Set by the Itemized Bazaar mod once a newly unlocked good has been reported (seen/new marker) - inferred |

## Enums carried in the JSON spec

#### `SgePartySlotStructureTypeList`

| Value | Label |
|---|---|
| 0 (0x0) | Default |
| 1 (0x1) | Battle (Current) |
| 2 (0x2) | Battle (UI) |
| 3 (0x3) | Menu (UI) |
| 4 (0x4) | Battle (Last) |

#### `SgeInventoryContentTypeList`

| Value | Label |
|---|---|
| 0 (0x0) | Items |
| 1 (0x1) | Weapons |
| 2 (0x2) | Armor |
| 3 (0x3) | Accessories |
| 4 (0x4) | Ammunition |
| 5 (0x5) | Unused (0x04) |
| 6 (0x6) | Gambits |
| 7 (0x7) | Unused (0x06) |
| 8 (0x8) | Technicks |
| 9 (0x9) | Magicks |
| 10 (0xA) | Key Items, Maps and Candles |
| 11 (0xB) | Loot |

#### `SgeSpecialFoeStateTypeList`

| Value | Label |
|---|---|
| 0 (0x0) | Inaccessible |
| 1 (0x1) | Alive |
| 2 (0x2) | Dead |

#### `ClanRankList`

| Value | Label |
|---|---|
| 0 (0x0) | None |
| 1 (0x1) | Moppet |
| 2 (0x2) | Hedge Knight |
| 3 (0x3) | Rear Guard |
| 4 (0x4) | Vanguard |
| 5 (0x5) | Headhunter |
| 6 (0x6) | Ward of Justice |
| 7 (0x7) | Brave Companion |
| 8 (0x8) | Riskbreaker |
| 9 (0x9) | Paragon of Justice |
| 10 (0xA) | High Guardian |
| 11 (0xB) | Knight of the Round |
| 12 (0xC) | Order of Ambrosia |

#### `PartyMemberList`

| Value | Label |
|---|---|
| 0 (0x0) | Vaan |
| 1 (0x1) | Ashe |
| 2 (0x2) | Fran |
| 3 (0x3) | Balthier |
| 4 (0x4) | Basch |
| 5 (0x5) | Penelo |
| 6 (0x6) | Reks |
| 7 (0x7) | Amalia |
| 8 (0x8) | Basch (Prisoner) |
| 9 (0x9) | Basch (Fugitive) |
| 10 (0xA) | Lamont |
| 11 (0xB) | Vossler (Judge) |
| 12 (0xC) | Vossler (Knight) |
| 13 (0xD) | Larsa |
| 14 (0xE) | Reddas |
| 15 (0xF) | Reserve (0x0F) |
| 16 (0x10) | Reserve (0x10) |
| 17 (0x11) | Reserve (0x11) |
| 18 (0x12) | Reserve (0x12) |
| 19 (0x13) | Reserve (0x13) |
| 20 (0x14) | Reserve (0x14) |
| 21 (0x15) | Reserve (0x15) |
| 22 (0x16) | Reserve (0x16) |
| 23 (0x17) | Reserve (0x17) |
| 24 (0x18) | Reserve (0x18) |
| 25 (0x19) | Reserve (0x19) |
| 26 (0x1A) | Chocobo |
| 27 (0x1B) | Belias |
| 28 (0x1C) | Mateus |
| 29 (0x1D) | Adrammelech |
| 30 (0x1E) | Hashmal |
| 31 (0x1F) | Cúchulainn |
| 32 (0x20) | Famfrit |
| 33 (0x21) | Zalera |
| 34 (0x22) | Shemhazai |
| 35 (0x23) | Chaos |
| 36 (0x24) | Zeromus |
| 37 (0x25) | Exodus |
| 38 (0x26) | Ultima |
| 39 (0x27) | Zodiark |
| 255 (0xFF) | None (0xFF) |
| 65535 (0xFFFF) | None (0xFFFF) |

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `PartyMemberList` | party member ids 0-39, 0xFFFF/0xFF = none |

## Editing guidance

* **Prefer live edits of game objects** (party keeps, inventory through the game's modify-inventory call
  0x003008A0, gil through 0x0032A7F0) and let the game save normally (TK L786; Drive modifyGil.lua).
* **Quest flags are a scalpel.** Advancing a quest stage without its prerequisite flags is the classic way to
  make an unrecoverable save (TK L790, L1788).
* **Inventory consistency.** The bag content lists (inventoryBagDescriptor -> entries) and the per-bag counters
  at Menu +0x47B8 must agree, and bags have a fixed capacity; adding beyond it is silently dropped
  (Drive BlueMagick.lua:752-773; TK L579).
* **Battle copy at +0x2200** is ineffectual; never use it as the place to edit (TK L1839).

## Round-trip rules

- This is a memory image, not a file layout: do not write it to disk as a save file.
- Session +0x00/+0x04 (CRC checksum/state) must be left alone in live edits; the game handles them on its own save path (unconfirmed).
- Write fields in place only; the image never changes size (0x56690 bytes).
- Edit the live Battle block ([0x02EBF190]) and never the ineffectual copy at +0x2200.
- Keep bag counters (Menu +0x47B8) and bag content lists consistent with each other.
- Unknown ranges are game state (flags, counters); copy them unchanged.

## Known unknowns

- On-disk save file format (header, compression/encryption, CRC algorithm and coverage) is not documented by any of our sources.
- Offsets of the Session save-menu sub-block (party shown on save screen, clan points/rank, save count/slot, build date, version).
- Offsets of the ~380 named World flag groups, Global Flags, special foe states, trophy games, teleport slots, quest table.
- Menu block offsets of map reveals, handbook triggers and the inventory content slot arrays.
- Live Battle block offsets of inventory content counters, seized counters, sold-loot quantities, and 0x7370-0x8003.
- Whether the Menu and live Battle blocks lie inside the 0x56690-byte image.
- Gambit set layout beyond slotCount (+0x32); party slot entries 4-8; meaning of bazaar state bits.
- Length of the non-respawn treasure/trap flag array at World +0x14B4.

## Source keys

| Key | Source |
|---|---|
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of Xeavin's *The Insurgent's Toolkit* Cheat Engine table for FFXII TZA Steam 1.0.4.0), line n. |
| LL `<page>:<line>` | FF12 Lua Loader documentation, `docs/capabilities/<page>.md` (e.g. `save-config`, `memory`, `event`, `bpack`). |
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (fact reference only; its licence forbids copying or converting its code). |
| Drive `<script>:<line>` | Lua mod scripts from the user's Google Drive export (scratchpad `drive/` folder; file named `<id>__<script>`). Most are by Xeavin (*The Insurgent's Forge* helper classes such as `getBattleUnitKeep.lua`, and the mods *Manifesto*, *Companions*, *Itemized Bazaar*, *Thrifty Bazaar*); others by FehDead (`Wayfarer.lua`, `mappings.lua`, `frame.lua`, `layout.lua`) and LowPriorityCitizen (`helpers.lua`, `DuplicateAugmentDetector.lua`). They target the same Steam build as the Toolkit (same absolute addresses). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
| Lists `<name>` | Drop-down lists of The Insurgent's Toolkit (`editor/data/lists.json`, or the full extraction `ct_lists.json`). |

All absolute addresses (e.g. `0x02EBF190`) are for the Steam build the Toolkit targets (1.0.4.0); they are
module-relative offsets as used by Cheat Engine and the Lua Loader. `[X]` means "the 64-bit pointer stored at X".

### Drive files cited

| Script | Drive file id(s) |
|---|---|
| `133.lua` | `1Z23YEkmBjTljj8TmaC2YUiYCBfCpbNCS` |
| `163.lua` | `1AiW-zqGlTHjURC6bK-8DMyIM-UzsP-4D` |
| `18.lua` | `1evFAtB0pkfC6lXkNZdczjqm8ckCh4ONs` (Xeavin formula script reading gil at 0x02164288) |
| `BlueMagick.lua` | `1EpHxWu6hr2hc1qMTvwUpoPuo1n-0XJXY` |
| `TheInsurgentsCompanions.lua` | `16yp3UieskdxaMD4hiayWGrc8JqTq_sXk` |
| `TheInsurgentsItemizedBazaar.lua` | `1C3nbk2EWNkWt0eqeipb0zJ3OdR6yFX7t` |
| `TheInsurgentsManifesto.lua` | `1WWjJQxzPr1cVY7qMoJTFhGhpjDw5-wyv` |
| `TheInsurgentsThriftyBazaar.lua` | `1EENli_dLEAdYKnBHMuazJDYUzLP-UMgJ` |
| `Wayfarer.lua` | `1xnhaCGX3zt8HD27eM42dLXyQ48vNTcB5` |
| `getActivePartyMember.lua` | `1LsQjK2_PDBIPj21G8B0ORasG3Ryv0RVe` |
| `getBattleUnitKeep.lua` | `192LKrY1yAs8dUOOfvfZnF1L9lIFWXzja` (Forge class with offsets); `12ctZrUP5nbys1UtKGyvxeRJ0fWH4lT3U` ("array helper": party keep address) |
| `getWeather.lua` | `1aep7mVOXgeykxa2qrGofsf58-wMqwi2j` |
| `mappings.lua` | `1YYX4OI8OxeJqahQLVPOsGms2AzY1PEDF` (FehDead mappings with storyProgress / locationId) |
| `modifyGil.lua` | `1qN343TTFZY2QUEj_o-SN9TdzAbo96Es1` (assembly calling 0x0032A7F0); `1UdiKFhDcRKxigVKprB0JboCPem-jY0Ce` (Lua wrapper) |
