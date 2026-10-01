# Map Ref (.mrf) — locations, regions, weather/terrain/footstep tables

Spec id: `mrf` · machine spec: [`mrf.json`](./mrf.json)

> **FILE FORMAT** (World file type 9 id 4), partly mapped. The runtime copy at `[0x02099D88]` keeps file-relative offsets, so the same layout applies in memory.

## What this is

The **Map Ref** file (`.mrf`) is a world-level reference table set: for every location it gives the region,
for every region the weather per weather mode, plus weather, terrain and footstep definitions. It is a
"World File" (game file type 9) with file id 4, held in memory at `[0x02099D88]` and hot-reloadable with
the Toolkit's File Reloader (TK L438, L1178, L1426).

| Item | Value | Source |
|---|---|---|
| Game file | type 9 (World File), id 4 | TK L1411, L1426 |
| Archive name / VBF path | not recorded; look for a `.mrf` file among the world files | - |
| Runtime pointer | `[0x02099D88]` (0 when not loaded) | TK L438; Drive getWeather.lua:3-6 |
| Sections | 10; the Toolkit exposes 0 Locations, 1 Regions, 3 Weathers, 4 Terrains, 5 Footsteps | TK L1178 |
| Related live values | current location `[0x021654C4]` (World +0x1044), weather mode `u8 [0x021654E0]` (World +0x1060) | Drive getWeather.lua:8-9; TK L320 |

### How the game picks the weather (reference algorithm)

```
file   = [0x02099D88]
loc    = file + u32[file+0x04] + currentLocation*8
region = s16[loc + 0x02]
reg    = file + u32[file+0x08] + region*0x10
weather= u8[reg + 0x04 + weatherMode*4]          -> MreWeatherList id
```
(Drive getWeather.lua:2-24.) Terrain ids (MreTerrainList) are what the Battle Actor Keep reports under the
actor (`terrain` at +0x8A, see live-battle-actor-chain).

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…` are not interpreted by any source; keep their original bytes. Overlapping rows are alternative views of the same bytes (the note says which applies).

### Record `header` — 44 bytes (0x2C), count: 1

*Where:* File offset 0; in memory the loaded file starts at [0x02099D88] and offsets stay file-relative (the code adds the file base).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | u32 | `sectionCount` | Not read by any source. By analogy with the battlepack header (count at +0, offsets from +4) it is expected to be the section count (10); verify on a real file. |  | TK L241 (analogy), L438 |
| 0x04 | 4 | u32 | `section0Offset` | Offset of section 0 (Locations) from the file start. Confirmed by the weather lookup code. |  | Drive getWeather.lua:2-24 |
| 0x08 | 4 | u32 | `section1Offset` | Offset of section 1 (Regions) from the file start. Confirmed by the weather lookup code. |  | Drive getWeather.lua:2-24 |
| 0x0C | 4 | u32 | `section2Offset` | Offset of section 2 (unnamed) from the file start. Position inferred from sections 0/1 and the 10-section count. |  | TK L1178 (pattern inferred) |
| 0x10 | 4 | u32 | `section3Offset` | Offset of section 3 (Weathers) from the file start. Position inferred from sections 0/1 and the 10-section count. |  | TK L1178 (pattern inferred) |
| 0x14 | 4 | u32 | `section4Offset` | Offset of section 4 (Terrains) from the file start. Position inferred from sections 0/1 and the 10-section count. |  | TK L1178 (pattern inferred) |
| 0x18 | 4 | u32 | `section5Offset` | Offset of section 5 (Footsteps) from the file start. Position inferred from sections 0/1 and the 10-section count. |  | TK L1178 (pattern inferred) |
| 0x1C | 4 | u32 | `section6Offset` | Offset of section 6 (unnamed) from the file start. Position inferred from sections 0/1 and the 10-section count. |  | TK L1178 (pattern inferred) |
| 0x20 | 4 | u32 | `section7Offset` | Offset of section 7 (unnamed) from the file start. Position inferred from sections 0/1 and the 10-section count. |  | TK L1178 (pattern inferred) |
| 0x24 | 4 | u32 | `section8Offset` | Offset of section 8 (unnamed) from the file start. Position inferred from sections 0/1 and the 10-section count. |  | TK L1178 (pattern inferred) |
| 0x28 | 4 | u32 | `section9Offset` | Offset of section 9 (unnamed) from the file start. Position inferred from sections 0/1 and the 10-section count. |  | TK L1178 (pattern inferred) |

### Record `location` — 8 bytes (0x8), count: (section1Offset - section0Offset) / 8 (inferred); LocationList has 1,315 ids

*Where:* section0Offset + locationId*8 (locationId = the current location id at World +0x1044 / [0x021654C4])

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | bytes | `unknown00` | Not identified by any source; keep the original bytes. |  |  |
| 0x02 | 2 | s16 | `regionId` | Region (section 1 row) the location belongs to; selects the weather table. |  | Drive getWeather.lua:2-24 |
| 0x04 | 4 | bytes | `unknown04` | Not identified by any source; keep the original bytes. |  |  |

### Record `region` — 16 bytes (0x10), count: (section2Offset - section1Offset) / 16 (inferred)

*Where:* section1Offset + regionId*0x10

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `unknown00` | Not identified by any source; keep the original bytes. |  |  |
| 0x04 | 1 | u8 | `weatherSlot0` | Weather id used when the weather mode (World +0x1060 / [0x021654E0]) is 0. | `MreWeatherList` | Drive getWeather.lua:2-24 |
| 0x05 | 3 | bytes | `unknown05` | Not identified by any source; keep the original bytes. |  |  |
| 0x08 | 1 | u8 | `weatherSlot1` | Weather id for weather mode 1 (slot = +0x04 + mode*4). | `MreWeatherList` | Drive getWeather.lua:2-24 |
| 0x09 | 3 | bytes | `unknown09` | Not identified by any source; keep the original bytes. |  |  |
| 0x0C | 1 | u8 | `weatherSlot2` | Weather id for weather mode 2 (if that mode exists). | `MreWeatherList` | Drive getWeather.lua:2-24 |
| 0x0D | 3 | bytes | `unknown0D` | Not identified by any source; keep the original bytes. |  |  |

## Enums carried in the JSON spec

#### `MreSectionList`

| Value | Label |
|---|---|
| 0 (0x0) | Locations |
| 1 (0x1) | Regions |
| 3 (0x3) | Weathers |
| 4 (0x4) | Terrains |
| 5 (0x5) | Footsteps |

#### `MreWeatherList`

| Value | Label |
|---|---|
| 0 (0x0) | None |
| 1 (0x1) | Sunny |
| 2 (0x2) | Cloudy |
| 3 (0x3) | Rainy |
| 4 (0x4) | Hailstorm |
| 5 (0x5) | Sandstorm |
| 6 (0x6) | Snowcloud |
| 7 (0x7) | Snowstorm |
| 8 (0x8) | Foggy |
| 9 (0x9) | Thunderstorm |
| 10 (0xA) | Reserve (0x0A) |
| 11 (0xB) | Reserve (0x0B) |
| 12 (0xC) | Reserve (0x0C) |
| 13 (0xD) | Reserve (0x0D) |
| 14 (0xE) | Reserve (0x0E) |
| 15 (0xF) | Reserve (0x0F) |

#### `MreWeatherTypeList`

| Value | Label |
|---|---|
| 0 (0x0) | Rainy |
| 1 (0x1) | Sand |
| 2 (0x2) | Snowy |
| 3 (0x3) | Foggy |
| 4 (0x4) | Cloudy |

#### `MreTerrainList`

| Value | Label |
|---|---|
| 0 (0x0) | Dirt / Soil |
| 1 (0x1) | Natural Stone / Rock |
| 2 (0x2) | Grass |
| 3 (0x3) | Unknown (0x03) |
| 4 (0x4) | Sand |
| 5 (0x5) | Snow |
| 6 (0x6) | Metal |
| 7 (0x7) | Wood |
| 8 (0x8) | Architecture (Stonework, Marble, Glass) |
| 9 (0x9) | Clay |
| 10 (0xA) | Carpet |
| 11 (0xB) | Stagnant Water |
| 12 (0xC) | Flowing Water |
| 13 (0xD) | Unknown (0x0D) |
| 14 (0xE) | Unknown (0x0E) |
| 15 (0xF) | Unknown (0x0F) |
| 16 (0x10) | Magickal Forcefield |
| 17 (0x11) | Ice |
| 18 (0x12) | Reserve (0x0C) |
| 19 (0x13) | Reserve (0x0D) |
| 20 (0x14) | Reserve (0x0E) |
| 21 (0x15) | Reserve (0x0F) |
| 22 (0x16) | Reserve (0x10) |
| 23 (0x17) | Reserve (0x11) |
| 24 (0x18) | Reserve (0x12) |
| 25 (0x19) | Reserve (0x13) |
| 26 (0x1A) | Reserve (0x14) |
| 27 (0x1B) | Reserve (0x15) |
| 28 (0x1C) | Reserve (0x16) |
| 29 (0x1D) | Reserve (0x17) |
| 30 (0x1E) | Reserve (0x18) |
| 31 (0x1F) | Reserve (0x19) |

#### `MreTerrainTypeList`

| Value | Label |
|---|---|
| 0 (0x0) | Water |
| 1 (0x1) | Sand |
| 2 (0x2) | Ice |
| 3 (0x3) | Earth |
| 4 (0x4) | Wind |

## Sections whose layout is unknown

| # | Name | What is known |
|---|---|---|
| 2 | - | nothing (not exposed by the Toolkit) |
| 3 | Weathers | 16 weather ids (None, Sunny, Cloudy, Rainy, Hailstorm, Sandstorm, Snowcloud, Snowstorm, Foggy, Thunderstorm, 6 reserve) and 5 weather types (Rainy, Sand, Snowy, Foggy, Cloudy); record layout not in our write-up |
| 4 | Terrains | 32 terrain ids (Dirt/Soil ... Ice, reserve) with 5 terrain types (Water, Sand, Ice, Earth, Wind); layout unknown |
| 5 | Footsteps | layout unknown |
| 6-9 | - | nothing |

(Lists MreWeatherList, MreWeatherTypeList, MreTerrainList, MreTerrainTypeList; TK L1178. Our TK write-up words
the type lists slightly differently - "Rainy/Snowy/Sandy/Foggy/Cloudy", "Water/Earth/Fire/Lightning/Wind" -
the values above are the table's actual list entries.)

## Pointers when sizes change

Section offsets in the header are file-relative and stay relative in memory. Growing a section (e.g. adding
locations) moves every later section: rewrite the later `sectionNOffset` values. Whether sections must be
aligned (16 bytes like the battlepack?) is unknown - keep the original alignment pattern.

## Round-trip rules

- Edit location.regionId and region weather slots in place; nothing moves.
- Keep the header word at +0x00 and every unknown byte unchanged.
- When resizing a section, rewrite all later section offsets and preserve the original alignment/padding pattern (unknown rule).
- After writing the file, hot-reload it (File Reloader -> Map Ref, type 9 id 4) or change area.

## Known unknowns

- File name and VBF path of the .mrf file.
- Header word +0x00 (section count by analogy) and the position of section offsets 2-9 (inferred).
- Location bytes 0x00-0x01 and 0x04-0x07; region bytes other than the weather slots; how many weather modes exist.
- Layouts of sections 2-9 (Weathers, Terrains, Footsteps and the unnamed ones).
- Section alignment and end-of-file padding rules; section entry counts (derived from offset differences, inferred).

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
| `getWeather.lua` | `1aep7mVOXgeykxa2qrGofsf58-wMqwi2j` |
