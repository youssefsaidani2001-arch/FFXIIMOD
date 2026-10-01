# Enumeration - content ids

Spec id: `enums-content-ids` · machine spec: [`enums-content-ids.json`](./enums-content-ids.json)

Chests, foe loot, shops, bazaar goods, rewards and the inventory all name things by **content id**: the category in
the top nibble and the index in the low 12 bits (TK L575: the Toolkit's add-all-of-a-category routine loops
`(cat << 12) .. (cat << 12) | count`). The full name list is `ContAllList` (7159 values, TK L1567-L1590).
The chest sheet's "Inventory" tab is the same list as `id:name` strings (GS:Chests Inventory!A: 0:Potion, 1:Hi-Potion ...).

## Bit view

### Record `contentId` - 2 bytes (0x2), count: one per field that holds a content id

*Where:* Chest item fields (treasure-chests), unit loot fields (foe-drops, ard-units), shop, bazaar, reward and package tables of the battlepack.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | bf16 | `contentId` | Content id. | bits below | TK L575, L1567; Lists: ContAllList |

#### Bits of `contentId.contentId` (bf16 at 0x00; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Mask | Name | Meaning / enum | Source |
|---|---|---|---|---|
| 0-11 | 0x0FFF | `index` | Index inside the category (row of the matching battlepack table, or the gil amount for category 14). | TK L575 |
| 12-15 | 0xF000 | `category` | Content category. (enum `ContentCategory`) | TK L575; Lists: ContAllList |

## Categories

| Category | Ids in ContAllList | Content |
|---|---|---|
| 0 (0x0000) | 64 | Item (0x0000-0x003F: Potion ... Knot of Rust) |
| 1 (0x1000) | 557 | Equipment (weapons 0x1000-0x10C7, armour 0x10C8-0x1153, accessories 0x1154-0x1183, ammunition 0x1184-0x11A3, foe-only weapons and gear 0x11A4-0x122C) |
| 2 (0x2000) | 512 | Loot (0x2000-0x21FF) |
| 3 (0x3000) | 81 | Magick (0x3000-0x3050) |
| 4 (0x4000) | 24 | Technick (0x4000-0x4017) |
| 5 (0x5000) | 0 | Not used by the list |
| 6 (0x6000) | 256 | Gambit (0x6000-0x60FF) |
| 7 (0x7000) | 0 | Not used by the list |
| 8 (0x8000) | 512 | Key item (0x8000-0x81FF; maps, monographs 0x8069.., Canopic Jar 0x806C) |
| 9 (0x9000) | 512 | Package (0x9000-0x91FF; quest / story packages) |
| 10 (0xA000) | 256 | Reward (0xA000-0xA0FF) |
| 11 (0xB000) | 128 | Price (0xB000-0xB07F) |
| 12 (0xC000) | 32 | Mist / Quickening (0xC000-0xC01F) |
| 13 (0xD000) | 128 | Bazaar good (0xD000-0xD07F) |
| 14 (0xE000) | 4096 | Gil amount (0xE000 + amount, 0-4095) |
| 15 (0xF000) | 1 | None (0xFFFF only) |

Source: Lists: ContAllList, ContItemList, ContWeaponList, ContArmorList, ContAccessoryList, ContAmmunitionList, ContLootList,
ContMagickList, ContTechnickList, ContGambitList, ContKeyItemList, ContPackageList, ContRewardList, ContPriceList,
ContMistList, ContBazaarGoodList (ranges computed from the lists).

### Values seen in vanilla data

| Value | Meaning | Where | Source |
|---|---|---|---|
| 63 | Knot of Rust (item) | chest filler pick | GS:Chests U-W |
| 24-28 | Dark Energy, Meteorite A-D | chest Diamond Armlet 5 % pick | GS:Chests X |
| 0x10B2 (4274) | Seitengrat (equipment) | Skyferry chest | GS:Chests X row 22 |
| 0x120C (4620), 0x1000 (4096) | Virus Fang, Unarmed (foe weapons) | unit weapon / off-hand | GS:ARDMap 4: Units!N-Q |
| 0x2057 (8279), 0x20B7 (8375) | Charger Barding, Emperor Scale (loot) | steals | GS:ARDMap 4: Units!AM-AP |
| 0x8069 (32873), 0x806C (32876) | Mage's Monograph, Canopic Jar (key items) | monograph / jar type | GS:ARDMap 4: Units!AV, BA |
| 0xE1F4 (57844) | 500 gil | steal | GS:ARDMap 4: Units!AM |
| 0xFFFF | nothing | any loot slot | GS:ARDMap 4: Units!AA |

## Enums carried in the JSON spec

#### `ContentCategory`

| Value | Label |
|---|---|
| 0 | Item (0x0000-0x003F: Potion ... Knot of Rust) |
| 1 | Equipment (weapons 0x1000-0x10C7, armour 0x10C8-0x1153, accessories 0x1154-0x1183, ammunition 0x1184-0x11A3, foe-only weapons and gear 0x11A4-0x122C) |
| 2 | Loot (0x2000-0x21FF) |
| 3 | Magick (0x3000-0x3050) |
| 4 | Technick (0x4000-0x4017) |
| 5 | Not used by the list |
| 6 | Gambit (0x6000-0x60FF) |
| 7 | Not used by the list |
| 8 | Key item (0x8000-0x81FF; maps, monographs 0x8069.., Canopic Jar 0x806C) |
| 9 | Package (0x9000-0x91FF; quest / story packages) |
| 10 | Reward (0xA000-0xA0FF) |
| 11 | Price (0xB000-0xB07F) |
| 12 | Mist / Quickening (0xC000-0xC01F) |
| 13 | Bazaar good (0xD000-0xD07F) |
| 14 | Gil amount (0xE000 + amount, 0-4095) |
| 15 | None (0xFFFF only) |

#### `ContentIdSpecial`

| Value | Label |
|---|---|
| 65535 (0xFFFF) | None / nothing |
| 57344 (0xE000) | 0 Gil |

The per-id names are not copied; use `ContAllList` from `editor/data/lists.json`.

## Round-trip rules

- Store as a plain u16; 0xFFFF means nothing.
- Gil inside a content id is limited to 4095 (0xE000-0xEFFF); chest gil fields are plain amounts and are not content ids.
- Use only ids that exist in the target table (Reserve labels mark unused rows).

## Known unknowns

- Conflict: TK L1590 states gil = 0xF000 | amount, but the same Toolkit list ends at 61439 = 0xEFFF "4095 Gil" (TK L1574) and vanilla ARD data uses 57844 = 0xE1F4 for 500 gil (GS:ARDMap 4: Units!AM); this spec follows the data (0xE000).
- Categories 5 and 7 have no labels.
- The Drops sheet labels 0xE1F4 "Reserve" (its own lookup), so its names for gil ids are not reliable.

## Source keys

| Key | Source |
|---|---|
| GS:Chests `<tab>!<column>` / row n | Google Sheet *Vanilla Chests* (Drive id `1ZSwmTg18JVqgRNb0StEaBtPJAKKtV4DMiS9PNWL4Q8I`), tab "Chest Data" (A1:AX1967) and "Inventory". Read through the Google Drive connector, which returns a column summary plus the first rows of each tab, not every row (see Known unknowns). Row numbers are sheet rows (row 1 = first header row). |
| GS:ARDMap `<tab>!<column>` / row n | Google Sheet *Vanilla ARD Map* (Drive id `1OyKQkfZkSvw5NHJeHpaEso-7e3dWaSZYsH4ZQ5BGD2g`), tabs "4: Units", "2: Classes", "7:Default Stats", "8:Additive Stats", "1:Models", "9:Special Animations", "Data", "Data Check". Read through the Google Drive connector, which returns a column summary plus the first rows of each tab, not every row (see Known unknowns). Row numbers are sheet rows (row 1 = first header row). |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| Lists: `<name>` | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json`. |
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (fact reference only; its licence forbids copying or converting its code). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
