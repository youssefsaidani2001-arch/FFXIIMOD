# ARD section 4 - foe loot (drops, steals, poaches, monographs, canopic jars)

Spec id: `foe-drops` · machine spec: [`foe-drops.json`](./foe-drops.json)

Foe loot is stored per **unit** row of ARD section 4 (88-byte st2e rows, full layout in [`ard-units`](./ard-units.md)).
This spec is a loot-only view of that row for a drop/steal editor, plus the column crosswalk of the two community
sheets that dump the vanilla values: *Vanilla ARD Map* (tab "4: Units", raw ids) and
*Drop/Steal/Poach/Monograph/Canopic Data* (tab "Section 004", names only).

## Container (summary)

ARD section 4 = st2e table (magic `st2e`, u32 entryCount, u16 entrySize = 88, u32 entryListOffset = 32 ...), in a
standalone `*.ard` or in the ARD nested as EBP section 19; the section offset is the u32 at ARD+0x18
([`container-ard`](./container-ard.md), [`container-st2e`](./container-st2e.md)).

## Record layouts

All multi-byte values are little-endian.

### Record `unitLoot` - 88 bytes (0x58), count: header.entryCount

*Where:* st2e rows of ARD section 4: section offset header.entryListOffset + i*88. Only the loot fields (and the name for identification) are listed; every other byte of the 88-byte unit row is described in ard-units and must be preserved.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x08 | 2 | u16 | `name` | Name text id of the unit (e.g. 16503 Deathgaze, 16799 Elvoret); shown here only to identify the row. | `DescNameList` | GS:ARDMap 4: Units!L-M; ard-units |
| 0x28 | 2 | u16 | `commonDrop` | Common drop: content id (category << 12 \| index), 65535 = nothing. | `ContAllList` | GS:ARDMap 4: Units!AC-AD; GS:Drops Section 004; ard-units (IW Formats/Ard/Units.cs) |
| 0x2A | 2 | u16 | `uncommonDrop` | Uncommon drop: content id (category << 12 \| index), 65535 = nothing. | `ContAllList` | GS:ARDMap 4: Units!AE-AF; GS:Drops Section 004; ard-units (IW Formats/Ard/Units.cs) |
| 0x2C | 2 | u16 | `rareDrop` | Rare drop: content id (category << 12 \| index), 65535 = nothing. | `ContAllList` | GS:ARDMap 4: Units!AG-AH; GS:Drops Section 004; ard-units (IW Formats/Ard/Units.cs) |
| 0x2E | 2 | u16 | `veryRareDrop` | Very rare drop: content id (category << 12 \| index), 65535 = nothing. Equipment appears here (e.g. 4434 = 0x1152 Maximillian on Elvoret). | `ContAllList` | GS:ARDMap 4: Units!AI-AJ; GS:Drops Section 004; ard-units (IW Formats/Ard/Units.cs) |
| 0x30 | 2 | u16 | `guaranteedDrop` | Guaranteed drop: content id (category << 12 \| index), 65535 = nothing. | `ContAllList` | GS:ARDMap 4: Units!AA-AB; GS:Drops Section 004; ard-units (IW Formats/Ard/Units.cs) |
| 0x32 | 2 | u16 | `commonSteal` | Common steal: content id (category << 12 \| index), 65535 = nothing. | `ContAllList` | GS:ARDMap 4: Units!AK-AL; GS:Drops Section 004; ard-units (IW Formats/Ard/Units.cs) |
| 0x34 | 2 | u16 | `uncommonSteal` | Uncommon steal: content id (category << 12 \| index), 65535 = nothing. Gil is the 0xE000 block: 57844 = 0xE1F4 = 500 gil (Elvoret, bds_a unit 0). | `ContAllList` | GS:ARDMap 4: Units!AM-AN; GS:Drops Section 004; ard-units (IW Formats/Ard/Units.cs) |
| 0x36 | 2 | u16 | `rareSteal` | Rare steal: content id (category << 12 \| index), 65535 = nothing. | `ContAllList` | GS:ARDMap 4: Units!AO-AP; GS:Drops Section 004; ard-units (IW Formats/Ard/Units.cs) |
| 0x42 | 1 | u8 | `monographRate` | Chance of the monograph drop (samples 5-50, i.e. percent). 255 in the raw sheet when the unit has no monograph drop (the Drops sheet prints those as 0). |  | GS:ARDMap 4: Units!AU; GS:Drops Section 004!N |
| 0x43 | 1 | u8 | `canopicJarRate` | Chance of the canopic jar drop (samples 5-25). 255 when unused. |  | GS:ARDMap 4: Units!AZ; GS:Drops Section 004!Q |
| 0x44 | 2 | u16 | `commonPoach` | Common poach: content id (category << 12 \| index), 65535 = nothing. | `ContAllList` | GS:ARDMap 4: Units!AQ-AR; GS:Drops Section 004; ard-units (IW Formats/Ard/Units.cs) |
| 0x46 | 2 | u16 | `uncommonPoach` | Uncommon poach: content id (category << 12 \| index), 65535 = nothing. | `ContAllList` | GS:ARDMap 4: Units!AS-AT; GS:Drops Section 004; ard-units (IW Formats/Ard/Units.cs) |
| 0x48 | 2 | u16 | `monographType` | Key item that enables the monograph drop: a 0x8000-block content id (32873 = 0x8069 Mage's Monograph; also Warmage's, Knight's, Scholar's, Sage's, Hunter's Monograph). 65535 = none. | `ContAllList` | GS:ARDMap 4: Units!AV-AW; GS:Drops Section 004!O |
| 0x4A | 2 | u16 | `monographDrop` | Item dropped while the monograph is owned: content id (category << 12 \| index), 65535 = nothing. | `ContAllList` | GS:ARDMap 4: Units!AX-AY; GS:Drops Section 004; ard-units (IW Formats/Ard/Units.cs) |
| 0x4C | 2 | u16 | `canopicJarType` | Key item that enables the canopic jar drop: 32876 = 0x806C Canopic Jar in every vanilla sample. 65535 = none. | `ContAllList` | GS:ARDMap 4: Units!BA; GS:Drops Section 004!R |
| 0x4E | 2 | u16 | `canopicJarDrop` | Item dropped while the canopic jar is owned: content id (category << 12 \| index), 65535 = nothing. Vanilla: 8268 Arcana or High Arcana. | `ContAllList` | GS:ARDMap 4: Units!BB-BC; GS:Drops Section 004; ard-units (IW Formats/Ard/Units.cs) |

The st2e header record is carried in the JSON (copied from `ard-units`).

### Content-id encoding seen in the loot fields

| Example | Value | Meaning | Source |
|---|---|---|---|
| 6, 15, 16, 42, 57, 63 | 0x0000 block | items and motes (Phoenix Down, Serum, Remedy, Reverse Mote, Hastega Mote, Knot of Rust) | GS:ARDMap 4: Units!AG-AP |
| 4434 | 0x1152 | equipment (Maximillian) | GS:ARDMap 4: Units!AI |
| 8192, 8240, 8245, 8334 | 0x2000 block | loot (Teleport Stone, Earth Crystal, Storm Crystal, Demon Eyeball) | GS:ARDMap 4: Units!AC-AH |
| 32873, 32876 | 0x8069, 0x806C | key items (Mage's Monograph, Canopic Jar) | GS:ARDMap 4: Units!AV, BA |
| 57844 | 0xE1F4 | 500 gil (0xE000 + amount) | GS:ARDMap 4: Units!AM-AN; Lists: ContAllList |
| 65535 | 0xFFFF | nothing | GS:ARDMap 4: Units!AA |

See [`enums-content-ids`](./enums-content-ids.md) for the category table.

### Decoded samples

| Unit | Drops (common / uncommon / rare / very rare) | Steals (common / uncommon / rare) | Poaches | Monograph | Canopic jar |
|---|---|---|---|---|---|
| asp_b 0 Deathgaze | none | Phoenix Down / 0x2057 Charger Barding / 0x20B7 Emperor Scale | none | none (rate 255) | none (rate 255) |
| bds_a 0 Elvoret | 0x208E Demon Eyeball / 0x2030 Earth Crystal / 15 Serum / 0x1152 Maximillian | 0x208E Demon Eyeball / 0xE1F4 500 gil / 42 Reverse Mote | 0x208E / 0x20CB Demon Drink | 10 %, 0x8069 Mage's Monograph -> Demon Drink | 20 %, 0x806C Canopic Jar -> 0x204C Arcana |
| bds_a 1 Baknamy | none / 0x2035 Storm Crystal / 0x2000 Teleport Stone / 57 Hastega Mote | 16 Remedy / 63 Knot of Rust / 2 X-Potion | 0x209D Pebble / Pebble | none | none |

Source: GS:ARDMap 4: Units rows 3-5; GS:Drops Section 004 rows 2-4.

## Column crosswalk - *Vanilla ARD Map*, tab "4: Units"

The 66 columns (A-BN) follow the Workshop's unit field names and order; ids sit next to their labels. Offsets are
those of [`ard-units`](./ard-units.md).

| Sheet column | Header | Notes | Unit row field |
|---|---|---|---|
| A | ARD | file (asp_b, bds_a ...) | - |
| B | Unit ID | row index | row i |
| C | Name | label of Name ID | - |
| D | Class Link | section 2 row | +0x00 u16 classLink |
| E | Default Stats Link | section 7 row | +0x22 u16 |
| F | Additive Stats Link | section 8 row | +0x24 u16 |
| G-J | AI 1 .. AI 4 | section 3 script index | +0x50, +0x52, +0x54, +0x56 |
| K | Group Identifier? | name variation group (255 = none) | +0x02 u8 |
| L / M | Name ID / Name | name text id | +0x08 u16 |
| N / O | Weapon ID / Weapon | content id in the 0x1000 block (4620 = 0x120C Virus Fang, 4096 = Unarmed) | +0x16 u16 |
| P / Q | Off-hand ID / Off-hand | content id (4312 = 0x10D8 Demon Shield) | +0x1C u16 |
| R | Custom Initial HP | 0 in the samples | +0x18 u32 |
| S | Forced Weapon Stance Animation | 255 = none | +0x13 u8 |
| T | Model Variation Identifier |  | +0x11 u8 |
| U | Model Color Variation Identifier |  | +0x12 u8 |
| V-X | Size X / Y / Z | percent (100 normal, Deathgaze 200) | +0x0A, +0x0C, +0x0E u16 |
| Y / Z | First / Second Overlay Model |  | +0x38, +0x3C s32 |
| AA-AJ | Guaranteed, Common, Uncommon, Rare, Very Rare Drop (ID + label) |  | +0x30, +0x28, +0x2A, +0x2C, +0x2E |
| AK-AP | Common, Uncommon, Rare Steal |  | +0x32, +0x34, +0x36 |
| AQ-AT | Common, Uncommon Poach |  | +0x44, +0x46 |
| AU | Monograph Rate | 255 = none | +0x42 u8 |
| AV-AY | Monograph Type ID, Monograph Drop ID |  | +0x48, +0x4A |
| AZ | Canopic Jar Rate | 255 = none | +0x43 u8 |
| BA-BC | Canopic Jar Type, Canopic Jar Drop ID |  | +0x4C, +0x4E |
| BD | Health Bar Type? |  | +0x03 bits 0-1 |
| BE | Is Hunt? | TRUE for Deathgaze | +0x03 bit 4 |
| BF | Is Boss? |  | +0x03 bit 5 |
| BG | Attack Power And Evade Source | TRUE in all samples | +0x15 bit 0 |
| BH | Has Shield | TRUE for the shield-carrying Baknamy | +0x15 bit 1 |
| BI | Has Custom Health Bar |  | +0x15 bit 2 |
| BJ | Unknown 0 | -1 in all samples | +0x26 s16 (by order) |
| BK / BL | Unknown 1 / Unknown 2 | 0 in all samples | +0x40 / +0x41 u8 (by order) |
| BM / BN | Unknown Flag 0 / 1 | FALSE in all samples | +0x15 bits 3 / 4 |

Source: GS:ARDMap 4: Units!A2:BN2 (headers) and rows 3-6. "Unknown 0/1/2" are matched to unknown26/40/41 by order only.
The other tabs of that sheet mirror the other ARD sections: "2: Classes" (section 2: model id, classification, genus,
weight, detection ranges, chain and bestiary ids, element absorb/immune/half/weak/potency, flags), "7:Default Stats"
and "8:Additive Stats" (sections 7/8: HP, MP, Strength, Magick Power, Vitality, Speed, Attack, Defense, Magick Resist,
four evades, EXP, LP, CP, gil), "1:Models" (section 1: model id + flags) and "9:Special Animations" (section 9:
model, weapon stance, action animation link, animation file link); see the matching `ard-*` specs.

The *Drop/Steal/Poach/Monograph/Canopic Data* sheet (tab "Section 004", columns A-S: Ard, Unit, Unit Name, Common /
Uncommon / Rare / Very Rare / Guaranteed Drop, Common / Uncommon / Rare Steal, Common / Uncommon Poach, Monograph Rate /
Type / Drop, Canopic Jar Rate / Type / Drop) shows names only and prints unused rates as 0 (GS:Drops Section 004!A1:S1).

## Count and size rules

- One 88-byte row per unit; header.entryCount rows from header.entryListOffset (32).
- The ARD Map sheet lists 1146 units over all vanilla ARDs (rows 3-1148).

## Pointers to fix when sizes change

None: loot edits never change sizes. Adding or removing unit rows is covered by `ard-units` (st2e count, section
padding, ARD offsets).

## Text

No strings; the name field is a text id resolved through `DescNameList`.

## Round-trip rules

- Edit loot fields in place; unit rows are fixed-size (88 bytes), so nothing moves.
- Preserve every byte of the row that this view does not list (classes, stats links, AI links, flags, unknowns) - see ard-units.
- Use 65535 for "nothing" in the content-id fields and 255 for an unused monograph/canopic rate, as vanilla does.
- Gil steals/drops are content ids in the 0xE000 block (0xE000 | amount, amount 0-4095); larger amounts cannot be expressed in these fields.
- monographType/canopicJarType must be key-item ids (0x8000 block) for the conditional drop to make sense; vanilla only uses the monographs and 0x806C Canopic Jar.
- The same unit can exist in several ARDs (e.g. Elvoret in bds_a, bds_b, bds_c); edit every copy to change a foe everywhere.

## Known unknowns

- The Drive connector returned only the first rows of each tab (4 units of the ARD Map, 74 rows of the Drops sheet), so the value ranges above come from those rows.
- The drop/steal/poach tier percentages are not stored in the unit row and are not given by the sheets.
- Whether a rate of 0 behaves like 255 (the Drops sheet prints 255 as 0).
- Whether gil can also be a drop (0xE000 ids seen only as a steal in the samples).
- The ARD Map sheet has 1146 unit rows and the Drops sheet 1164 rows (it also lists rows without a unit number, e.g. bhm_d "The Undying"); the reason for the difference is not stated.
- Conflict: TK L1590 says gil content ids are 0xF000 | amount, but the Toolkit list itself (Lists: ContAllList, 57344 "0 Gil" .. 61439 "4095 Gil") and the vanilla value 57844 = "500 Gil" use 0xE000 | amount. The Drops sheet labels 57844 "Reserve".
- unknown26 (s16, -1 in every sample), unknown40 and unknown41 (0 in the samples) remain unexplained (sheet "Unknown 0/1/2").

## Source keys

| Key | Source |
|---|---|
| GS:ARDMap `<tab>!<column>` / row n | Google Sheet *Vanilla ARD Map* (Drive id `1OyKQkfZkSvw5NHJeHpaEso-7e3dWaSZYsH4ZQ5BGD2g`), tabs "4: Units", "2: Classes", "7:Default Stats", "8:Additive Stats", "1:Models", "9:Special Animations", "Data", "Data Check". Read through the Google Drive connector, which returns a column summary plus the first rows of each tab, not every row (see Known unknowns). Row numbers are sheet rows (row 1 = first header row). |
| GS:Drops `<tab>!<column>` / row n | Google Sheet *Drop/Steal/Poach/Monograph/Canopic Data* (Drive id `1TdoIEEUMS4JErov4ByUIWIDUMuotZcxiHOAi6Xelu08`), tab "Section 004" (A1:S1165). Read through the Google Drive connector, which returns a column summary plus the first rows of each tab, not every row (see Known unknowns). Row numbers are sheet rows (row 1 = first header row). |
| ard-units, container-ard, container-st2e | Specs in this folder (their Workshop/Toolkit sources are cited there). |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| Lists: `<name>` | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json`. |
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (fact reference only; its licence forbids copying or converting its code). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
