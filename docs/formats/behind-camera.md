# Behind Camera table (per-character camera presets)

Spec id: `behind-camera` · machine spec: [`behind-camera.json`](./behind-camera.json)

> **FILE FORMAT** (world file type 9 id 3), record layout only; the container header is not documented.

## What this is

Camera parameters used when the camera sits behind a party member; each party member (battlepack section 16
+0x07 "Behind Camera Identifier") selects one record: 0 = Default, 1-13 the espers, 14 Chocobo, 15 reserve,
255 = none (TK L916, L1192-L1194; Lists BcameBehindCameraList).

| Item | Value | Source |
|---|---|---|
| Game file | World File (type 9), id 3; hot-reloadable | TK L1428 |
| Runtime | `[0x02098DF0]` | TK L442 |
| Record | 0x40 bytes = 16 floats; only +0x00 (View Angle Y Offset) is identified | TK L1194, L1856 |
| File name / header | not recorded | - |

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…` are not interpreted by any source; keep their original bytes. Overlapping rows are alternative views of the same bytes (the note says which applies).

### Record `behindCamera` — 64 bytes (0x40), count: 16 (ids 0-15: Default, 13 espers, Chocobo, reserve)

*Where:* Records of the Behind Camera world file (game file type 9, id 3); in memory at [0x02098DF0]. Record i = BcameBehindCameraList id i (party members reference it from battlepack section 16 +0x07; 255 = none).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | f32 | `viewAngleYOffset` | View angle Y offset (the only identified value). |  | TK L1194 |
| 0x04 | 4 | f32 | `unknownFloat04` | Float not identified by the Toolkit ("?"). |  | TK L1194, L1856 |
| 0x08 | 4 | f32 | `unknownFloat08` | Float not identified by the Toolkit ("?"). |  | TK L1194, L1856 |
| 0x0C | 4 | f32 | `unknownFloat0C` | Float not identified by the Toolkit ("?"). |  | TK L1194, L1856 |
| 0x10 | 4 | f32 | `unknownFloat10` | Float not identified by the Toolkit ("?"). |  | TK L1194, L1856 |
| 0x14 | 4 | f32 | `unknownFloat14` | Float not identified by the Toolkit ("?"). |  | TK L1194, L1856 |
| 0x18 | 4 | f32 | `unknownFloat18` | Float not identified by the Toolkit ("?"). |  | TK L1194, L1856 |
| 0x1C | 4 | f32 | `unknownFloat1C` | Float not identified by the Toolkit ("?"). |  | TK L1194, L1856 |
| 0x20 | 4 | f32 | `unknownFloat20` | Float not identified by the Toolkit ("?"). |  | TK L1194, L1856 |
| 0x24 | 4 | f32 | `unknownFloat24` | Float not identified by the Toolkit ("?"). |  | TK L1194, L1856 |
| 0x28 | 4 | f32 | `unknownFloat28` | Float not identified by the Toolkit ("?"). |  | TK L1194, L1856 |
| 0x2C | 4 | f32 | `unknownFloat2C` | Float not identified by the Toolkit ("?"). |  | TK L1194, L1856 |
| 0x30 | 4 | f32 | `unknownFloat30` | Float not identified by the Toolkit ("?"). |  | TK L1194, L1856 |
| 0x34 | 4 | f32 | `unknownFloat34` | Float not identified by the Toolkit ("?"). |  | TK L1194, L1856 |
| 0x38 | 4 | f32 | `unknownFloat38` | Float not identified by the Toolkit ("?"). |  | TK L1194, L1856 |
| 0x3C | 4 | f32 | `unknownFloat3C` | Float not identified by the Toolkit ("?"). |  | TK L1194, L1856 |

## Enums carried in the JSON spec

#### `BcameBehindCameraList`

| Value | Label |
|---|---|
| 0 (0x0) | Default |
| 1 (0x1) | Belias |
| 2 (0x2) | Mateus |
| 3 (0x3) | Adrammelech |
| 4 (0x4) | Hashmal |
| 5 (0x5) | Cúchulainn |
| 6 (0x6) | Famfrit |
| 7 (0x7) | Zalera |
| 8 (0x8) | Shemhazai |
| 9 (0x9) | Chaos |
| 10 (0xA) | Zeromus |
| 11 (0xB) | Exodus |
| 12 (0xC) | Ultima |
| 13 (0xD) | Zodiark |
| 14 (0xE) | Chocobo |
| 15 (0xF) | Reserve (0x0F) |
| 255 (0xFF) | None (0xFF) |

## Round-trip rules

- Edit floats in place; keep the unknown header unchanged.
- Do not change the record count (party members index it by id).

## Known unknowns

- File name and header/record start.
- Meaning of 15 of the 16 floats (+0x04 .. +0x3C).

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
