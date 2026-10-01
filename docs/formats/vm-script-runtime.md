# Script VM runtime tables (Battle Script Keep, call targets, opcodes, actor types) — memory-only

Spec id: `vm-script-runtime` · machine spec: [`vm-script-runtime.json`](./vm-script-runtime.json)

> **MEMORY-ONLY (runtime).** This structure exists only in the running game process; there is no game file to patch for it. Edit it live (Lua Loader `memory`/`save` tables, Cheat Engine) or change the file data it is built from.

## What this is

The runtime side of FFXII's event/field script VM: the five loaded script slots, the per-type call-target
tables that implement every script API function (`modelread`, `settrapresource`, `btlAtelSetStatus`, ...), the
opcode table of the bytecode decoder and the actor-type sizing table. These are all **engine tables in the
executable's data or in loader-allocated memory**; there is no game file for them. The *script code* itself
lives in EBP section 0 (see [`container-ebp`](./container-ebp.md)); data tables inside it such as treasure chests and traps are specified in [`treasure-chests`](./treasure-chests.md). The record `scriptHeaderPartial` below is the start of that script image as the keep sees it.

| Item | Address | Source |
|---|---|---|
| Battle Script Keep (5 slots, stride 0x288) | `0x02098E10` | TK L309, L425 |
| Loaded EBP per slot | `0x022C6C00 + slot*8`; Pre-Z EBP file size at `0x022C6D3C` | TK L243, L426 |
| Slot use | EbpTypeList 0 Battle ... 4 Debug; a probe script notes Xeavin's description "0 default, 1 event, 2 unknown, 3 summon, 4 unknown" | TK L1080; Drive SummonProbe.lua:15 |
| Queue script load / dispose | `0x0032FC30(slot, fileId)` / `0x002628B0(slot)` | TK L486, L1127 |
| Get actor | `0x00358940(keep, actorId)` -> Battle Actor Work | TK L466 |
| Focus id | `(id >> 16) & 0xF` = keep slot, `id & 0xFFFF` = actor index | Drive BlueMagick.lua:1200-1210 |
| Actor name | `u32 [actorDeclaration]` = name offset; name = script + `u32 [script + 0x4C]` + offset (Shift-JIS) | Drive SummonProbe.lua:53-62; TK L677 |
| VM call targets | `[0x02B57EF0 + type*8]`, records 0x20 from +0x08 | TK L431, L1377 |
| VM opcodes | `0x01EFEA50`, 100 entries | TK L432, L1407 |
| Push int / float argument | `0x00267F90` / `0x00267F60` | TK L491, L1399 |
| Battle Script Input | `0x02099AC0`, 64 slots: active count, type (None/Integer/Float), value - layout not in our write-up | TK L427, L1366 |
| Script Actor Type | `0x01E0C328`, 8 x 4 bytes | TK L428, L1367 |
| Party member battle logic (live gambits) | `[0x02089378]`, 40 members x 14 entries; entry count byte, 0x1F unused bytes, then entries (action, target condition, target type, case-link) | TK L416, L1291 |

### Re-pointing a call target (mod technique)

The *Companions* mod makes script calls 0x353/0x354 behave like 0x35B/0x35C by copying all four qwords of the
latter records over the former (`table + 0x08 + id*0x20`) once the table exists (Drive
TheInsurgentsCompanions.lua:1185-1199). This is the cleanest way to change what a script API function does
without touching script bytecode.

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…` are not interpreted by any source; keep their original bytes. Overlapping rows are alternative views of the same bytes (the note says which applies).

### Record `battleScriptKeep` — 648 bytes (0x288), count: 5

*Where:* Static array at 0x02098E10 + slot*0x288, slot 0-4

The Toolkit also lists (offsets not in our write-up): setup-actor init state, User Control State, Identifier, File/Global/Local scope variables, Scratch1/Scratch2 variables, Push Integers/Floats/Variables/Acts & Tags pools, memory-allocation and local-scope calls, Character/Field dialogs, Textures, Camera Mappings, Cameras, Camera Shake Mappings, Camera Shakes, Models, Dispose call and an "Actor Type 5 & 7 Count?" dword (TK L1364).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 8 | u64 | `scriptPointer` | Loaded script (EBP section 0 image) of this slot; 0 = slot free. |  | TK L1364; Drive SummonProbe.lua:72-74, 103, 113 |
| 0x08 | 8 | u64 | `actorList` | Battle Actor Work list: u32 count at +0, u64 actor pointers from +8. |  | TK L311, L336-L340; Drive BlueMagick.lua:1203-1210 |
| 0x10 | 16 | bytes | `unknown10` | Not identified by any source; keep the original bytes. |  |  |
| 0x20 | 4 | u32 | `actorCount` | Actor count (width assumed). |  | TK L1364 |
| 0x24 | 428 | bytes | `unknown24` | Not identified by any source; keep the original bytes. |  |  |
| 0x1D0 | 10 | bytes | `skeletonTypeSpans` | 5 x u16 read by a probe script as per-skeleton-type values; the Toolkit names a "Skeleton Type Spans" folder. |  | Drive SummonProbe.lua:76; TK L1364 |
| 0x1DA | 22 | bytes | `unknown1DA` | Not identified by any source; keep the original bytes. |  |  |
| 0x1F0 | 8 | u64 | `focusIdentifierList` | Focus identifier list pointer. |  | TK L1364 |
| 0x1F8 | 144 | bytes | `unknown1F8` | Not identified by any source; keep the original bytes. |  |  |

### Record `ebpSlotPointer` — 8 bytes (0x8), count: 5

*Where:* Static array at 0x022C6C00 + slot*8 (the Battle Script Load Handler is a struct-of-arrays; this is its first array)

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 8 | u64 | `ebpPointer` | Loaded EBP pack of the slot (EbpTypeList 0 Battle ... 4 Debug). |  | TK L243, L1080, L1365 |

### Record `scriptHeaderPartial` — 80 bytes (0x50), count: 1

*Where:* Start of the loaded script image (Battle Script Keep +0x00 points here; EBP section 0)

The Toolkit's EBP Script view also shows a header with Date Time, Author Name and File Name strings (16 chars each) and File Storage / Stack Storage / Source Data start markers, then 25 sub-arrays (setup function sequence, weathers, actor type declarations, actor declarations, push-int/float/variable/act-tag pools, REQIALL tables, map jump/destination positions, map icons, exit lines, field signs, external labels, capture actors, model motions, treasure (setuptreasure), unit status (btlAtelSetStatus), spawn control (btlAtelSetEntryStruct), spawn unit map (btlAtelSetTotalEntryNumber), spawn position map (btlAtelSetPoint2), texture icons (registshape), traps) (TK L1095-L1121). Their offsets are not in our write-up.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 76 | bytes | `unknown00` | Not identified by any source; keep the original bytes. |  |  |
| 0x4C | 4 | u32 | `actorNameTableOffset` | Offset (from the script start) of the actor-name table; actor declaration +0 holds the name's offset inside it (Shift-JIS). |  | Drive SummonProbe.lua:53-62; TK L677 |

### Record `scriptActorType` — 4 bytes (0x4), count: 8 (ActorTypeList)

*Where:* Static array at 0x01E0C328 + actorType*4

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `skeletonType` | Skeleton type of the actor type. | `SkeletonTypeList` | TK L428, L1367 |
| 0x01 | 1 | u8 | `taskType` | Task type. |  | TK L1367 |
| 0x02 | 2 | u16 | `sizeBytes` | Allocation size of the actor type. Changing it without changing the allocator corrupts the heap. |  | TK L1367, L1792 |

### Record `vmCallTarget` — 32 bytes (0x20), count: per type (VmctpCallList names 1,959 ids, 00000000:wait .. 00007067:unkCall_7067)

*Where:* Per type t: table = [0x02B57EF0 + t*8]; record = table + 0x08 + index*0x20, where call id = t << 12 | index

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 8 | u64 | `startCall` | Function run when the script calls this target. |  | TK L431, L1377 |
| 0x08 | 8 | u64 | `waitCall` | Polled until the call reports done (for waiting calls). |  | TK L1377 |
| 0x10 | 8 | u64 | `unknown10` | Not named by the Toolkit; copied along with the other three by the Companions mod. |  | Drive TheInsurgentsCompanions.lua:1188-1199 |
| 0x18 | 8 | u64 | `endCall` | End call. |  | TK L1377 |

### Record `vmOpcode` — 24 bytes (0x18), count: 100 (VmoeOpcodeList NOP .. REQIALL)

*Where:* Static table at 0x01EFEA50 + opcode*stride (stride not stated; 0x18 assumed)

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 8 | u64 | `namePointer` | Pointer to the opcode mnemonic. |  | TK L432, L1407 |
| 0x08 | 8 | bytes | `unknown08` | Not identified by any source; keep the original bytes. |  |  |
| 0x10 | 2 | u16 | `operandSize` | Encoded size of the instruction. Changing it desynchronises every script decoder. |  | TK L1407, L1791 |
| 0x12 | 2 | u16 | `unknown12` | Unidentified word. |  | TK L1407 |
| 0x14 | 4 | bytes | `unknown14` | Not identified by any source; keep the original bytes. |  |  |

### Record `actorPointerLists` — 160 bytes (0xA0), count: 1

*Where:* Static: 0x0209A1F0 (4 x u64 Battle Player Character List) followed directly by 0x0209A210 (16 x u64 Map Jump Group List)

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 8 | u64 | `playerCharacter0` | Battle Actor Work of on-field party member 1. |  | TK L429, L1368 |
| 0x08 | 8 | u64 | `playerCharacter1` | On-field party member 2. |  |  |
| 0x10 | 8 | u64 | `playerCharacter2` | On-field party member 3. |  |  |
| 0x18 | 8 | u64 | `playerCharacter3` | On-field party member 4. |  |  |
| 0x20 | 128 | bytes | `mapJumpGroup` | 16 x u64 Battle Actor Work pointers (Map Jump Group List). |  | TK L430, L1369 |

## Enums carried in the JSON spec

#### `SkeletonTypeList`

| Value | Label |
|---|---|
| 0 (0x0) | Logic |
| 1 (0x1) | Sign |
| 2 (0x2) | Line |
| 3 (0x3) | Unit |
| 4 (0x4) | Unused (0x04) |

#### `ActorTypeList`

| Value | Label |
|---|---|
| 0 (0x0) | Logic Actor |
| 1 (0x1) | Sign Actor |
| 2 (0x2) | Unknown (0x02) |
| 3 (0x3) | Line Actor |
| 4 (0x4) | Unknown (0x04) |
| 5 (0x5) | Battle Unit |
| 6 (0x6) | Scene Unit |
| 7 (0x7) | Respawn Unit |

#### `EbpTypeList`

| Value | Label |
|---|---|
| 0 (0x0) | Battle |
| 1 (0x1) | Slot 1 (name not in our write-up) |
| 2 (0x2) | Slot 2 (name not in our write-up) |
| 3 (0x3) | Slot 3 (name not in our write-up) |
| 4 (0x4) | Debug |

#### `VmcteReturnTypeList`

| Value | Label |
|---|---|
| 0 (0x0) | None |
| 1 (0x1) | Wait |
| 2 (0x2) | Integer |
| 3 (0x3) | Float |

#### `VmcteArgumentTypeList`

| Value | Label |
|---|---|
| 0 (0x0) | Integer |
| 1 (0x1) | Float |

#### `BsieTypeList`

| Value | Label |
|---|---|
| 0 (0x0) | None |
| 1 (0x1) | Integer |
| 2 (0x2) | Float |

## Round-trip rules

- Memory-only engine tables. Never change vmOpcode.operandSize or scriptActorType.sizeBytes (immediate desync / heap corruption, TK L1791-L1792).
- Only swap vmCallTarget records for targets with identical argument signatures; unnamed unkCall_xxxx signatures are unknown (TK L1864).
- Do not dispose a slot whose script owns the actors you are standing among (TK L1795).

## Known unknowns

- Battle Script Keep: offsets of most fields (variables, pools, dialogs, cameras, models ...).
- vmOpcode stride (0x18 assumed) and the meaning of +0x08/+0x12.
- vmCallTarget +0x10 meaning and the 8-byte header at the start of each type table (count?).
- Battle Script Input slot layout; party member battle logic entry layout.
- Battle Script Load Handler arrays other than the EBP pointer (struct-of-arrays, TK L1365).

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
| `BlueMagick.lua` | `1EpHxWu6hr2hc1qMTvwUpoPuo1n-0XJXY` |
| `SummonProbe.lua` | `1EveYk35rzfFAwLcrT9T-ICZuyMH-Oxw-` |
| `TheInsurgentsCompanions.lua` | `16yp3UieskdxaMD4hiayWGrc8JqTq_sXk` |
