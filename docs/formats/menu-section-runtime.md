# Menu section tree and menu context — memory-only

Spec id: `menu-section-runtime` · machine spec: [`menu-section-runtime.json`](./menu-section-runtime.json)

> **MEMORY-ONLY (runtime).** This structure exists only in the running game process; there is no game file to patch for it. Edit it live (Lua Loader `memory`/`save` tables, Cheat Engine) or change the file data it is built from.

## What this is

The game's menus are a live **tree of menu sections**; each section owns a set of entries, usually drawn from
an MRP group (see [`mrp`](./mrp.md)), and carries its own position/size/alpha. The Toolkit's Menu Section
Editor walks this tree and has one-shot actions (Goto Parent/Child/Older/Younger sibling, Hide/Show, Unload,
Reload) (TK L1196-L1238). Menu Section *Plus* views are specialised walkers over the MRP pack list
(`0x0209AC60`) and `[0x0209BE80]` (quickening / AoE shape) with fixed index bounds (TK L1240-L1261).

| Global | Meaning | Source |
|---|---|---|
| `[0x01FD4948]` | auto-pause menu section pointer (non-zero = game auto-paused) | TK L318 |
| `[0x02092730]` | active menu id (non-zero = a menu is open) | TK L319 |
| `0x0209AC60 + id*8` | loaded MRP pack sections (23) | TK L411 |
| `[0x0209BE80]` | Quickening / AoE shape sections | TK L413, L1360 |
| `[0x02B47730]` | Focus camera section | TK L415 |
| `[0x0209AC30]` | menu context (record menuContext) | TK L316 |

Use: live prototyping of HUD/menu layout. Fields re-applied every frame by the owning menu snap back; those
must be changed in the MRP file or the UI settings instead (TK L1238).

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…` are not interpreted by any source; keep their original bytes. Overlapping rows are alternative views of the same bytes (the note says which applies).

### Record `menuSection` — 192 bytes (0xC0), count: tree; children counted by childCount

*Where:* Live UI tree node. Start from a menu's root section and walk parent/child/sibling pointers (the Toolkit's Goto actions re-point its base via +0x10/+0x18/+0x28/+0x20).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 8 | u64 | `processingCall` | Per-frame processing function of the section. |  | TK L1212-L1234 |
| 0x08 | 8 | u64 | `unloadCall` | Unload function. |  | TK L1212-L1234 |
| 0x10 | 8 | u64 | `parent` | Parent section pointer. |  | TK L1212-L1234; TK L1205 |
| 0x18 | 8 | u64 | `child` | First child section pointer. |  | TK L1212-L1234 |
| 0x20 | 8 | u64 | `youngerSibling` | Younger sibling pointer. |  | TK L1212-L1234 |
| 0x28 | 8 | u64 | `olderSibling` | Older sibling pointer. |  | TK L1212-L1234 |
| 0x30 | 4 | u32 | `childCount` | Number of children (width not stated; 4 bytes assumed). |  | TK L1212-L1234 |
| 0x34 | 4 | bytes | `unknown34` | Not identified by any source; keep the original bytes. |  |  |
| 0x38 | 8 | u64 | `renderPointer` | Render pointer (referenced from code at 0x002463BE). |  | TK L1212-L1234 |
| 0x40 | 4 | bytes | `unknown40` | Not identified by any source; keep the original bytes. |  |  |
| 0x44 | 2 | u16 | `unloadOrder` | Unload order? (width assumed). |  | TK L1212-L1234; TK L1866 |
| 0x46 | 2 | bytes | `unknown46` | Not identified by any source; keep the original bytes. |  |  |
| 0x48 | 8 | u64 | `defaultFadePointer` | Default fade pointer. |  | TK L1212-L1234 |
| 0x50 | 4 | bf32 | `flags` | Flags; bits 2-17 hold the entry count. | bits below | TK L1212-L1234 |
| 0x54 | 4 | bytes | `unknown54` | Not identified by any source; keep the original bytes. |  |  |
| 0x58 | 8 | u64 | `mrpGroupPointer` | Pointer to the MRP group this section draws (see mrp). |  | TK L1212-L1234 |
| 0x60 | 8 | u64 | `entryListPointer` | Entry list: entry i = u64 [list + i*8]. |  | TK L1212-L1234 |
| 0x68 | 8 | u64 | `currentFadePointer` | Current fade pointer. |  | TK L1212-L1234 |
| 0x70 | 4 | u32 | `unknown70` | Unidentified dword. |  | TK L1212-L1234; TK L1866 |
| 0x74 | 4 | u32 | `stateChangeTime` | State change time? |  | TK L1212-L1234 |
| 0x78 | 24 | bytes | `unknown78` | Not identified by any source; keep the original bytes. |  |  |
| 0x90 | 4 | u32 | `changeDelay` | Change delay (frames). |  | TK L1212-L1234 |
| 0x94 | 4 | u32 | `lastChangeTime` | Last change time. |  | TK L1212-L1234 |
| 0x98 | 2 | s16 | `positionX` | Position X. |  | TK L1212-L1234 |
| 0x9A | 2 | s16 | `positionY` | Position Y. |  | TK L1212-L1234 |
| 0x9C | 2 | u16 | `width` | Width. |  | TK L1212-L1234 |
| 0x9E | 2 | u16 | `height` | Height. |  | TK L1212-L1234 |
| 0xA0 | 1 | u8 | `alpha` | Alpha. |  | TK L1212-L1234 |
| 0xA1 | 1 | u8 | `contrast` | Contrast. |  | TK L1212-L1234 |
| 0xA2 | 1 | u8 | `identifier` | Identifier? (width assumed). |  | TK L1212-L1234 |
| 0xA3 | 5 | bytes | `unknownA3` | Not identified by any source; keep the original bytes. |  |  |
| 0xA8 | 4 | bytes | `border` | Border folder (layout not given). |  | TK L1212-L1234 |
| 0xAC | 1 | u8 | `unknownAC` | Unidentified byte. |  | TK L1212-L1234; TK L1866 |
| 0xAD | 1 | u8 | `unknownAD` | Unidentified byte. |  | TK L1212-L1234; TK L1866 |
| 0xAE | 10 | bytes | `unknownAE` | Not identified by any source; keep the original bytes. |  |  |
| 0xB8 | 4 | f32 | `unknownFloatB8` | Unidentified float. "Active Time" lies somewhere in 0xAE-0xBC (offset not stated). |  | TK L1212-L1234; TK L1866 |
| 0xBC | 4 | bytes | `unknownBC` | Not identified by any source; keep the original bytes. |  |  |

#### Bits of `menuSection.flags` (bf32 at 0x50; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 2-17 | `entryCount` | (dword >> 2) & 0xFFFF |

### Record `menuContext` — 3554 bytes (0xDE2), count: 1

*Where:* [0x0209AC30] (global menu/party UI context; also used by mods to detect an open menu).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 248 | bytes | `unknown00` | Not identified by any source; keep the original bytes. |  |  |
| 0xF8 | 8 | u64 | `menuPointerF8` | Non-zero while a (party) menu is open; the Companions mod branches on it. |  | Drive TheInsurgentsCompanions.lua:824-827 |
| 0x100 | 2602 | bytes | `unknown100` | Not identified by any source; keep the original bytes. |  |  |
| 0xB2A | 1 | u8 | `activePartyCount` | Count of active party members. |  | TK L316 |
| 0xB2B | 693 | bytes | `unknownB2B` | Not identified by any source; keep the original bytes. |  |  |
| 0xDE0 | 2 | s16 | `selectedPartyMember` | Party member currently selected in the menu (equip/license screens). |  | Drive DuplicateAugmentDetector.lua:114-116 |

## Round-trip rules

- Memory-only; nothing persists. Edit positions/sizes/alpha in place.
- Never write the call pointers (+0x00/+0x08) or the tree pointers; use the game's own hide/show/unload routines.
- Persist layout changes in the MRP (group/entry x/y/width/height) instead.

## Known unknowns

- Record size (at least 0xBC; 0xC0 assumed).
- Exact widths of childCount, unloadOrder, identifier; offset of Active Time; the border folder layout.
- Meaning of 0x40-0x43, 0x54-0x57, 0x78-0x8F, 0xA3-0xA7, 0xAE-0xB7, 0xBC-0xBF.
- menuContext: everything except the three fields listed.

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
| `DuplicateAugmentDetector.lua` | `1KOL2TrNfVdYdMRT07pGUPPPsn2m8z3AM` |
| `TheInsurgentsCompanions.lua` | `16yp3UieskdxaMD4hiayWGrc8JqTq_sXk` |
