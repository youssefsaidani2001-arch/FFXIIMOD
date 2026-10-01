# Global Message table (corner pop-ups) — memory-only, mostly unmapped

Spec id: `global-message` · machine spec: [`global-message.json`](./global-message.json)

> **MEMORY-ONLY (runtime).** This structure exists only in the running game process; there is no game file to patch for it. Edit it live (Lua Loader `memory`/`save` tables, Cheat Engine) or change the file data it is built from.

## What this is

**Global messages** are the transient corner pop-ups the game shows for gains and events ("Obtained X",
Mist/Quickening notices, party member joins, key items) (TK L1186). The Toolkit's Global Message Editor reads
a table at `[0x02AEE888]`, picks an entry by id (self-clamping to a count), shows a **Type** byte at
`entry + 0x07` and a "Type Properties (Only Edit One Based On Type)" folder whose layout depends on the type.
Like the other small editors it has an **Export** action, which in the Toolkit means the table is a loaded
data file that can be written back to disk (TK L995) - but which file is not recorded.

| Item | Value | Source |
|---|---|---|
| Runtime pointer | `[0x02AEE888]` | TK L440, L1186 |
| Types | 0 Message, 1 Mist, 2 Quickening, 3 Party Member, 4 Party Members, 5 Key Item | Lists GmeEntryTypeList |
| Game file | not recorded (exportable, so file-backed) | TK L995 |

For *showing* a message from a mod, the Lua Loader's `message.print` / `dialog` APIs are the supported way
(LL message:45-64; LL dialog:12, 331); this table is only needed to change the game's own notices.

Status: **memory-only spec** - only one byte of the record is mapped. It documents what is known so a
future pass with the Toolkit table can fill it in.

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…` are not interpreted by any source; keep their original bytes. Overlapping rows are alternative views of the same bytes (the note says which applies).

### Record `globalMessageEntry` — 8 bytes (0x8), count: unknown (do not iterate with this size: only the first 8 bytes are mapped)

*Where:* Table reached through [0x02AEE888]; the Toolkit selects an entry by id and clamps it to a count, but neither the count location nor the entry stride is in our write-up.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 7 | bytes | `unknown00` | Not identified by any source; keep the original bytes. |  |  |
| 0x07 | 1 | u8 | `type` | Entry type; decides which "Type Properties" view applies to the rest of the entry. | `GmeEntryTypeList` | TK L1186 |

## Enums carried in the JSON spec

#### `GmeEntryTypeList`

| Value | Label |
|---|---|
| 0 (0x0) | Message |
| 1 (0x1) | Mist |
| 2 (0x2) | Quickening |
| 3 (0x3) | Party Member |
| 4 (0x4) | Party Members |
| 5 (0x5) | Key Item |

## Round-trip rules

- Runtime table: edit in place only; the entry stride and count are unknown, so never insert/remove entries.
- Change `type` only together with the type-specific properties (layout unknown), otherwise the pop-up reads garbage.

## Known unknowns

- Entry size/stride, count location, bytes 0x00-0x06 (the "Count/id" header?) and the type-dependent property layouts.
- Which game file the table is loaded from (it has an export action, so it is file-backed).
- How text is referenced (text ids vs inline text).

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
