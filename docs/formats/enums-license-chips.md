# Enumeration - licence-board chip graphics

Spec id: `enums-license-chips` · machine spec: [`enums-license-chips.json`](./enums-license-chips.json)

> **ENUMERATION SPEC (MEMORY-ONLY values).** Values for the Insurgent's Toolkit *License Node Icon* editor: which icon, palette, animation and offset a licence square uses. No file layout is known.

## What this is

Every square of the licence board is drawn from a few stacked icons: a background chip, one or two overlays (level digits, augment/technick symbols) when the licence is **obtained**, and a shiny background with a "get" animation plus a monochrome icon when it is only **available**. The Toolkit exposes these as the License Node Icon table at `[0x02CA9670]`: 2 groups (Available, Obtained) x 4 entries (TK L443, L1157; group names from Lists: LnieGroupList). eochaid's sheet lists the values that produce each existing chip art ("most of the values you need to change around license chips with preexisting art", msg 866). The board must be on screen while editing and every screen change resets the values (msg 867).

Related specs: [`license-board-runtime`](./license-board-runtime.md) (the per-square runtime records, `licenseIconLink` at +0x0E), [`battlepack-s70-license-board`](./battlepack-s70-license-board.md) (board grid files), [`mrp`](./mrp.md) and [`tim2`](./tim2.md) (icon group/section/entry addressing).

## Sources

Every sheet was read in full through an `.xlsx` export of the Drive file (the plain-text read only returns a ~50-row sample, so it was used only to confirm the tab names). Citations are `KEY Tab!rN` (sheet row N, 1-based as shown in Google Sheets) or `KEY Tab!COL` for a whole column; `msg N` is the index of a message in the #wip-general Discord export; `Drive x.lua:L` is a line of a Lua file from the shared Drive folder; `TK Lnnn` is a line of `docs/research/insurgents_toolkit_reference.md`; `Lists: X` is `editor/data/lists.json`.

| Key | Source | What was used |
|---|---|---|
| `LC` | Google Sheet "Insurgent's Toolkit License Chip Index" (Drive id `1TKyxjciZ-wDKQLBdx5gsGwnEM96HmsDw29qUDpwdl14`) | tab Chip Bin values (A1:L240) |

## Fields shown by the Toolkit (LC Chip Bin values!C1:K1)

| Sheet column | Field | Values | Enum |
|---|---|---|---|
| C | Entry Identifier | 0-2; read here as the entry (layer) index inside the group - inferred from the Toolkit's 2 x 4 layout, not stated | `LicenseChipEntrySlot` |
| D | 1st. Text. Link (texture link) | u16 = texture group + 256 x texture section (same split as MRP iconGroupLink/iconSectionLink); 65535 = none | `LicenseChipTextureLink` |
| E / F | Texture Group Link / Texture Section Link | computed by the sheet from D (=MOD(D,256), =FLOOR(D/256)) | - |
| G | Animation | 0 none, 1 generic "get" shine, 2 quickening, 3-15 esper (Belias ... Zodiark), 19 quickening background | `LicenseChipAnimation` |
| H | Clut Link | palette id | `LicenseChipClut` |
| I | Texture Entry Link | entry inside the texture section; "#" = node level - 1 | - |
| J / K | X Pos / Y Pos | signed pixel offset of the layer | - |
| L | (notes) | e.g. "Y=0 for Swords 9", "(later augs have Y=1)" | - |

## Presets from the sheet

### Obtained - Backgrounds

| Chip | Entry | Tex link | Group | Section | Anim | Clut | Tex entry | X | Y | Note | Source |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Essentials | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 |  | LC r4 |
| Second Board | 0 | 2 | 2 | 0 | 0 | 6 | 1 | 0 | 0 |  | LC r5 |
| White Magick | 0 | 1 | 1 | 0 | 0 | 4 | 8 | 2 | 2 |  | LC r7 |
| Black Magick | 0 | 1 | 1 | 0 | 0 | 4 | 9 | 2 | 2 |  | LC r8 |
| Time Magick | 0 | 1 | 1 | 0 | 0 | 4 | 10 | 2 | 2 |  | LC r9 |
| Green Magick | 0 | 1 | 1 | 0 | 0 | 4 | 11 | 2 | 2 |  | LC r10 |
| Arcane Magick | 0 | 1 | 1 | 0 | 0 | 4 | 12 | 2 | 2 |  | LC r11 |
| Swords | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 0 |  | LC r13 |
| Blood Sword | 0 | 0 | 0 | 0 | 0 | 1 | 2 | 0 | 0 |  | LC r14 |
| Greatswords | 0 | 0 | 0 | 0 | 0 | 1 | 3 | 0 | 0 |  | LC r15 |
| Excalibur | 0 | 0 | 0 | 0 | 0 | 1 | 4 | 0 | 0 |  | LC r16 |
| Tournesol | 0 | 0 | 0 | 0 | 0 | 1 | 5 | 0 | 0 |  | LC r17 |
| Katana | 0 | 0 | 0 | 0 | 0 | 1 | 6 | 0 | 0 |  | LC r18 |
| Masamune | 0 | 0 | 0 | 0 | 0 | 1 | 7 | 0 | 0 |  | LC r19 |
| Ninja Swords | 0 | 0 | 0 | 0 | 0 | 1 | 8 | 0 | 0 |  | LC r20 |
| Yagyu Darkblade | 0 | 0 | 0 | 0 | 0 | 1 | 9 | 0 | 0 |  | LC r21 |
| Spears | 0 | 0 | 0 | 0 | 0 | 1 | 10 | 0 | 0 |  | LC r22 |
| Dragon Whisker | 0 | 0 | 0 | 0 | 0 | 1 | 11 | 0 | 0 |  | LC r23 |
| Zodiac Spear | 0 | 0 | 0 | 0 | 0 | 1 | 12 | 0 | 0 |  | LC r24 |
| Poles | 0 | 0 | 0 | 0 | 0 | 1 | 13 | 0 | 0 |  | LC r25 |
| Whale Whisker | 0 | 0 | 0 | 0 | 0 | 1 | 14 | 0 | 0 |  | LC r26 |
| Bows | 0 | 0 | 0 | 0 | 0 | 1 | 15 | 0 | 0 |  | LC r27 |
| Sagittarius | 0 | 0 | 0 | 0 | 0 | 1 | 16 | 0 | 0 |  | LC r28 |
| Crossbows | 0 | 0 | 0 | 0 | 0 | 1 | 17 | 0 | 0 |  | LC r29 |
| Guns | 0 | 0 | 0 | 0 | 0 | 1 | 18 | 0 | 0 |  | LC r30 |
| Axes & Hammers | 0 | 0 | 0 | 0 | 0 | 1 | 19 | 0 | 0 |  | LC r31 |
| Daggers | 0 | 0 | 0 | 0 | 0 | 1 | 20 | 0 | 0 |  | LC r32 |
| Shikari Nagasa | 0 | 0 | 0 | 0 | 0 | 1 | 21 | 0 | 0 |  | LC r33 |
| Rods | 0 | 0 | 0 | 0 | 0 | 1 | 22 | 0 | 0 |  | LC r34 |
| Rod of Faith | 0 | 0 | 0 | 0 | 0 | 1 | 23 | 0 | 0 |  | LC r35 |
| Staves | 0 | 0 | 0 | 0 | 0 | 1 | 24 | 0 | 0 |  | LC r36 |
| Staff of the Magi | 0 | 0 | 0 | 0 | 0 | 1 | 25 | 0 | 0 |  | LC r37 |
| Maces | 0 | 0 | 0 | 0 | 0 | 1 | 26 | 0 | 0 |  | LC r38 |
| Measures | 0 | 0 | 0 | 0 | 0 | 1 | 27 | 0 | 0 |  | LC r39 |
| Hand-bombs | 0 | 0 | 0 | 0 | 0 | 1 | 28 | 0 | 0 |  | LC r40 |
| Shields | 0 | 512 | 0 | 2 | 0 | 1 | 0 | 3 | 4 |  | LC r42 |
| Ensanguined Shield | 0 | 512 | 0 | 2 | 0 | 1 | 1 | 3 | 4 |  | LC r43 |
| Shell Shield | 0 | 512 | 0 | 2 | 0 | 1 | 2 | 3 | 4 |  | LC r44 |
| Zodiac Escutcheon | 0 | 512 | 0 | 2 | 0 | 1 | 3 | 3 | 4 |  | LC r45 |
| Heavy Armor | 0 | 1 | 1 | 0 | 0 | 2 | 4 | -1 | 1 |  | LC r47 |
| Light Armor | 0 | 1 | 1 | 0 | 0 | 2 | 5 | -1 | 1 |  | LC r48 |
| Mystic Armor | 0 | 1 | 1 | 0 | 0 | 2 | 6 | -1 | 1 |  | LC r49 |
| Genji Armor | 0 | 1 | 1 | 0 | 0 | 13 | 15 | -1 | 1 |  | LC r50 |
| Accessories | 0 | 1 | 1 | 0 | 0 | 7 | 14 | 1 | 1 |  | LC r52 |
| Ribbon | 0 | 1 | 1 | 0 | 0 | 15 | 7 | 0 | 0 |  | LC r53 |
| Augments | 0 | 1 | 1 | 0 | 0 | 8 | 0 | 0 | 2 | (later augs have Y=1) | LC r55 |
| Gambits | 0 | 2 | 2 | 0 | 0 | 5 | 2 | 1 | 0 |  | LC r57 |
| Technicks | 0 | 2 | 2 | 0 | 0 | 5 | 3 | -3 | -1 |  | LC r59 |
| Quickening | 0 | 768 | 0 | 3 | 19 | 0 | 0 | 0 | 0 |  | LC r61 |
| Belias | 0 | 256 | 0 | 1 | 0 | 2 | 0 | -8 | -10 |  | LC r63 |
| Mateus | 0 | 256 | 0 | 1 | 0 | 2 | 1 | -8 | -10 |  | LC r64 |
| Adrammelech | 0 | 256 | 0 | 1 | 0 | 2 | 2 | -8 | -10 |  | LC r65 |
| Hashmal | 0 | 256 | 0 | 1 | 0 | 2 | 3 | -8 | -10 |  | LC r66 |
| Cúchulainn | 0 | 256 | 0 | 1 | 0 | 2 | 4 | -8 | -10 |  | LC r67 |
| Famfrit | 0 | 256 | 0 | 1 | 0 | 2 | 5 | -8 | -10 |  | LC r68 |
| Zalera | 0 | 256 | 0 | 1 | 0 | 2 | 6 | -8 | -10 |  | LC r69 |
| Shemhazai | 0 | 256 | 0 | 1 | 0 | 2 | 7 | -8 | -10 |  | LC r70 |
| Chaos | 0 | 256 | 0 | 1 | 0 | 2 | 8 | -8 | -10 |  | LC r71 |
| Zeromus | 0 | 256 | 0 | 1 | 0 | 2 | 9 | -8 | -10 |  | LC r72 |
| Exodus | 0 | 256 | 0 | 1 | 0 | 2 | 10 | -8 | -10 |  | LC r73 |
| Ultima | 0 | 256 | 0 | 1 | 0 | 2 | 11 | -8 | -10 |  | LC r74 |
| Zoriark | 0 | 256 | 0 | 1 | 0 | 2 | 12 | -8 | -10 |  | LC r75 |

### Obtained - First Overlay

| Chip | Entry | Tex link | Group | Section | Anim | Clut | Tex entry | X | Y | Note | Source |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Gear 1-19 | 1 | 257 | 1 | 1 | 0 | 8 | # | 22 | 1 | Y=0 for Swords 9 | LC r80 |
| Magicks | 1 | 257 | 1 | 1 | 0 | 8 | # | 22 | 1 |  | LC r81 |
| Gear 20 | 1 | 32768 | 0 | 128 | 0 | 6 | 76 | 17 | 2 |  | LC r82 |
| Gear 21 | 1 | 32768 | 0 | 128 | 0 | 6 | 77 | 17 | 2 |  | LC r83 |
| Gear 22 | 1 | 32768 | 0 | 128 | 0 | 6 | 78 | 17 | 2 |  | LC r84 |
| Warmage | 1 | 16384 | 0 | 64 | 0 | 0 | 0 | 7 | 3 |  | LC r86 |
| Martyr | 1 | 16384 | 0 | 64 | 0 | 0 | 1 | 7 | 3 |  | LC r87 |
| Inquisitor | 1 | 16384 | 0 | 64 | 0 | 0 | 2 | 7 | 3 |  | LC r88 |
| Headsman | 1 | 16384 | 0 | 64 | 0 | 0 | 3 | 7 | 3 |  | LC r89 |
| Adrenaline | 1 | 16384 | 0 | 64 | 0 | 1 | 4 | 7 | 3 |  | LC r91 |
| Spellbreaker | 1 | 16384 | 0 | 64 | 0 | 1 | 5 | 7 | 3 |  | LC r92 |
| Focus | 1 | 16384 | 0 | 64 | 0 | 2 | 6 | 7 | 3 |  | LC r93 |
| Serenity | 1 | 16384 | 0 | 64 | 0 | 2 | 7 | 7 | 3 |  | LC r94 |
| Last Stand | 1 | 16384 | 0 | 64 | 0 | 1 | 8 | 7 | 3 |  | LC r95 |
| Spellbound | 1 | 16384 | 0 | 64 | 0 | 1 | 9 | 7 | 3 |  | LC r97 |
| Brawler | 1 | 16384 | 0 | 64 | 0 | 1 | 10 | 7 | 3 |  | LC r98 |
| Shield Block | 1 | 16384 | 0 | 64 | 0 | 1 | 11 | 7 | 3 |  | LC r99 |
| Channeling | 1 | 16384 | 0 | 64 | 0 | 1 | 12 | 7 | 3 |  | LC r100 |
| Swiftness | 1 | 16384 | 0 | 64 | 0 | 1 | 13 | 7 | 3 |  | LC r101 |
| Remedy Lore | 1 | 16384 | 0 | 64 | 0 | 2 | 14 | 7 | 3 |  | LC r103 |
| Potion Lore | 1 | 16384 | 0 | 64 | 0 | 2 | 15 | 7 | 3 |  | LC r104 |
| Ether Lore | 1 | 16384 | 0 | 64 | 0 | 2 | 16 | 7 | 3 |  | LC r105 |
| Phoenix Lore | 1 | 16384 | 0 | 64 | 0 | 2 | 17 | 7 | 3 |  | LC r106 |
| Battle Lore | 1 | 16384 | 0 | 64 | 0 | 1 | 18 | 7 | 3 |  | LC r108 |
| Magick Lore | 1 | 16384 | 0 | 64 | 0 | 1 | 19 | 7 | 3 |  | LC r109 |
| HP Lore | 1 | 16384 | 0 | 64 | 0 | 1 | 20 | 7 | 3 |  | LC r111 |
| Steal | 1 | 32768 | 0 | 128 | 0 | 0 | 0 | -2 | 0 |  | LC r113 |
| Libra | 1 | 32768 | 0 | 128 | 0 | 0 | 1 | -2 | 0 |  | LC r114 |
| First Aid | 1 | 32768 | 0 | 128 | 0 | 0 | 2 | -2 | 0 |  | LC r115 |
| Poach | 1 | 32768 | 0 | 128 | 0 | 0 | 3 | -2 | 0 |  | LC r116 |
| Charge | 1 | 32768 | 0 | 128 | 0 | 0 | 4 | -2 | 0 |  | LC r117 |
| Holology | 1 | 32768 | 0 | 128 | 0 | 0 | 5 | -2 | 0 |  | LC r118 |
| Souleater | 1 | 32768 | 0 | 128 | 0 | 0 | 6 | -2 | 0 |  | LC r119 |
| Travler | 1 | 32768 | 0 | 128 | 0 | 0 | 7 | -2 | 0 |  | LC r120 |
| Numerology | 1 | 32768 | 0 | 128 | 0 | 0 | 8 | -2 | 0 |  | LC r121 |
| Shear | 1 | 32768 | 0 | 128 | 0 | 0 | 9 | -2 | 0 |  | LC r122 |
| Achilles | 1 | 32768 | 0 | 128 | 0 | 0 | 10 | -2 | 0 |  | LC r123 |
| Gil Toss | 1 | 32768 | 0 | 128 | 0 | 0 | 11 | -2 | 0 |  | LC r124 |
| Charm | 1 | 32768 | 0 | 128 | 0 | 0 | 12 | -2 | 0 |  | LC r125 |
| Sight Unseeing | 1 | 32768 | 0 | 128 | 0 | 0 | 13 | -2 | 0 |  | LC r126 |
| Infuse | 1 | 32768 | 0 | 128 | 0 | 0 | 14 | -2 | 0 |  | LC r127 |
| Addle | 1 | 32768 | 0 | 128 | 0 | 0 | 15 | -2 | 0 |  | LC r128 |
| Bonecrusher | 1 | 32768 | 0 | 128 | 0 | 0 | 16 | -2 | 0 |  | LC r129 |
| Shades of Black | 1 | 32768 | 0 | 128 | 0 | 0 | 17 | -2 | 0 |  | LC r130 |
| Stamp | 1 | 32768 | 0 | 128 | 0 | 0 | 18 | -2 | 0 |  | LC r131 |
| Expose | 1 | 32768 | 0 | 128 | 0 | 0 | 19 | -2 | 0 |  | LC r132 |
| Revive | 1 | 32768 | 0 | 128 | 0 | 0 | 20 | -2 | 0 |  | LC r133 |
| 1000 Needles | 1 | 32768 | 0 | 128 | 0 | 0 | 21 | -2 | 0 |  | LC r134 |
| Wither | 1 | 32768 | 0 | 128 | 0 | 0 | 22 | -2 | 0 |  | LC r135 |
| Telekinesis | 1 | 32768 | 0 | 128 | 0 | 0 | 23 | -2 | 0 |  | LC r136 |

### Obtained - Second Overlay

| Chip | Entry | Tex link | Group | Section | Anim | Clut | Tex entry | X | Y | Note | Source |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Item/HP Lores | 2 | 257 | 1 | 1 | 0 | 8 | 0 | 22 | 1 | same as gear or magicks | LC r141 |

### Available - Shiny Background & Get Animation

| Chip | Entry | Tex link | Group | Section | Anim | Clut | Tex entry | X | Y | Note | Source |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Gear/Magick/Aug/Gambit | 0 | 2 | 2 | 0 | 1 | 3 | 8 | -11 | -11 |  | LC r149 |
| Quickenings | 0 | 1 | 1 | 0 | 2 | 0 | 13 | 1 | -3 |  | LC r150 |
| Belias | 0 | 2 | 2 | 0 | 3 | 3 | 8 | -11 | -11 |  | LC r151 |
| Mateus | 0 | 2 | 2 | 0 | 4 | 3 | 8 | -11 | -11 |  | LC r152 |
| Adrammelech | 0 | 2 | 2 | 0 | 5 | 3 | 8 | -11 | -11 |  | LC r153 |
| Hashmal | 0 | 2 | 2 | 0 | 6 | 3 | 8 | -11 | -11 |  | LC r154 |
| Cúchulainn | 0 | 2 | 2 | 0 | 7 | 3 | 8 | -11 | -11 |  | LC r155 |
| Famfrit | 0 | 2 | 2 | 0 | 8 | 3 | 8 | -11 | -11 |  | LC r156 |
| Zalera | 0 | 2 | 2 | 0 | 9 | 3 | 8 | -11 | -11 |  | LC r157 |
| Shemhazai | 0 | 2 | 2 | 0 | 10 | 3 | 8 | -11 | -11 |  | LC r158 |
| Chaos | 0 | 2 | 2 | 0 | 11 | 3 | 8 | -11 | -11 |  | LC r159 |
| Zeromus | 0 | 2 | 2 | 0 | 12 | 3 | 8 | -11 | -11 |  | LC r160 |
| Exodus | 0 | 2 | 2 | 0 | 13 | 3 | 8 | -11 | -11 |  | LC r161 |
| Ultima | 0 | 2 | 2 | 0 | 14 | 3 | 8 | -11 | -11 |  | LC r162 |
| Zoriark | 0 | 2 | 2 | 0 | 15 | 3 | 8 | -11 | -11 |  | LC r163 |

### Available - Monochrome Icon

| Chip | Entry | Tex link | Group | Section | Anim | Clut | Tex entry | X | Y | Note | Source |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Second Board | 1 | 2 | 2 | 0 | 0 | 14 | 0 | 0 | 0 |  | LC r168 |
| Belias | 1 | 256 | 0 | 1 | 0 | 1 | 13 | -8 | -9 |  | LC r170 |
| Mateus | 1 | 256 | 0 | 1 | 0 | 1 | 14 | -8 | -9 |  | LC r171 |
| Adrammelech | 1 | 256 | 0 | 1 | 0 | 1 | 15 | -8 | -9 |  | LC r172 |
| Hashmal | 1 | 256 | 0 | 1 | 0 | 1 | 16 | -8 | -9 |  | LC r173 |
| Cúchulainn | 1 | 256 | 0 | 1 | 0 | 1 | 17 | -8 | -9 |  | LC r174 |
| Famfrit | 1 | 256 | 0 | 1 | 0 | 1 | 18 | -8 | -9 |  | LC r175 |
| Zalera | 1 | 256 | 0 | 1 | 0 | 1 | 19 | -8 | -9 |  | LC r176 |
| Shemhazai | 1 | 256 | 0 | 1 | 0 | 1 | 20 | -8 | -9 |  | LC r177 |
| Chaos | 1 | 256 | 0 | 1 | 0 | 1 | 21 | -8 | -9 |  | LC r178 |
| Zeromus | 1 | 256 | 0 | 1 | 0 | 1 | 22 | -8 | -9 |  | LC r179 |
| Exodus | 1 | 256 | 0 | 1 | 0 | 1 | 23 | -8 | -9 |  | LC r180 |
| Ultima | 1 | 256 | 0 | 1 | 0 | 1 | 24 | -8 | -9 |  | LC r181 |
| Zoriark | 1 | 256 | 0 | 1 | 0 | 1 | 25 | -8 | -9 |  | LC r182 |
| Essentials | 1 | 32768 | 0 | 128 | 0 | 4 | 24 | 7 | 7 |  | LC r184 |
| Swords | 1 | 32768 | 0 | 128 | 0 | 4 | 25 | 7 | 7 |  | LC r185 |
| Blood Sword | 1 | 32768 | 0 | 128 | 0 | 4 | 26 | 7 | 7 |  | LC r186 |
| Greatswords | 1 | 32768 | 0 | 128 | 0 | 4 | 27 | 7 | 7 |  | LC r187 |
| Excalibur | 1 | 32768 | 0 | 128 | 0 | 4 | 28 | 7 | 7 |  | LC r188 |
| Tournesol | 1 | 32768 | 0 | 128 | 0 | 4 | 29 | 7 | 7 |  | LC r189 |
| Katana | 1 | 32768 | 0 | 128 | 0 | 4 | 30 | 7 | 7 |  | LC r190 |
| Masamune | 1 | 32768 | 0 | 128 | 0 | 4 | 31 | 7 | 7 |  | LC r191 |
| Ninja Swords | 1 | 32768 | 0 | 128 | 0 | 4 | 32 | 7 | 7 |  | LC r192 |
| Yagyu Darkblade | 1 | 32768 | 0 | 128 | 0 | 4 | 33 | 7 | 7 |  | LC r193 |
| Spears | 1 | 32768 | 0 | 128 | 0 | 4 | 34 | 7 | 7 |  | LC r194 |
| Dragon Whisker | 1 | 32768 | 0 | 128 | 0 | 4 | 35 | 7 | 7 |  | LC r195 |
| Zodiac Spear | 1 | 32768 | 0 | 128 | 0 | 4 | 36 | 7 | 7 |  | LC r196 |
| Poles | 1 | 32768 | 0 | 128 | 0 | 4 | 37 | 7 | 7 |  | LC r197 |
| Whale Whisker | 1 | 32768 | 0 | 128 | 0 | 4 | 38 | 7 | 7 |  | LC r198 |
| Bows | 1 | 32768 | 0 | 128 | 0 | 4 | 39 | 7 | 7 |  | LC r199 |
| Sagittarius | 1 | 32768 | 0 | 128 | 0 | 4 | 40 | 7 | 7 |  | LC r200 |
| Crossbows | 1 | 32768 | 0 | 128 | 0 | 4 | 41 | 7 | 7 |  | LC r201 |
| Guns | 1 | 32768 | 0 | 128 | 0 | 4 | 42 | 7 | 7 |  | LC r202 |
| Axes & Hammers | 1 | 32768 | 0 | 128 | 0 | 4 | 43 | 7 | 7 |  | LC r203 |
| Daggers | 1 | 32768 | 0 | 128 | 0 | 4 | 44 | 7 | 7 |  | LC r204 |
| Shikari Nagasa | 1 | 32768 | 0 | 128 | 0 | 4 | 45 | 7 | 7 |  | LC r205 |
| Rods | 1 | 32768 | 0 | 128 | 0 | 4 | 46 | 7 | 7 |  | LC r206 |
| Rod of Faith | 1 | 32768 | 0 | 128 | 0 | 4 | 47 | 7 | 7 |  | LC r207 |
| Staves | 1 | 32768 | 0 | 128 | 0 | 4 | 48 | 7 | 7 |  | LC r208 |
| Staff of the Magi | 1 | 32768 | 0 | 128 | 0 | 4 | 49 | 7 | 7 |  | LC r209 |
| Maces | 1 | 32768 | 0 | 128 | 0 | 4 | 50 | 7 | 7 |  | LC r210 |
| Measures | 1 | 32768 | 0 | 128 | 0 | 4 | 51 | 7 | 7 |  | LC r211 |
| Hand-bombs | 1 | 32768 | 0 | 128 | 0 | 4 | 52 | 7 | 7 |  | LC r212 |
| Unknown Shield | 1 | 32768 | 0 | 128 | 0 | 4 | 53 | 7 | 7 |  | LC r213 |
| Ensanguined Shield | 1 | 32768 | 0 | 128 | 0 | 4 | 54 | 7 | 7 |  | LC r214 |
| Shell Shield | 1 | 32768 | 0 | 128 | 0 | 4 | 55 | 7 | 7 |  | LC r215 |
| Zodiac Eschutcheon | 1 | 32768 | 0 | 128 | 0 | 4 | 56 | 7 | 7 |  | LC r216 |
| Genji Armor | 1 | 32768 | 0 | 128 | 0 | 4 | 57 | 7 | 7 |  | LC r217 |
| Accessories | 1 | 32768 | 0 | 128 | 0 | 4 | 58 | 7 | 7 |  | LC r218 |
| Ribbon | 1 | 32768 | 0 | 128 | 0 | 4 | 59 | 7 | 7 |  | LC r219 |
| White Magick | 1 | 32768 | 0 | 128 | 0 | 4 | 60 | 7 | 7 |  | LC r220 |
| Black Magick | 1 | 32768 | 0 | 128 | 0 | 4 | 61 | 7 | 7 |  | LC r221 |
| Time Magick | 1 | 32768 | 0 | 128 | 0 | 4 | 62 | 7 | 7 |  | LC r222 |
| Green Magick | 1 | 32768 | 0 | 128 | 0 | 4 | 63 | 7 | 7 |  | LC r223 |
| Arcane Magick | 1 | 32768 | 0 | 128 | 0 | 4 | 64 | 7 | 7 |  | LC r224 |
| Augments | 1 | 32768 | 0 | 128 | 0 | 4 | 65 | 7 | 7 |  | LC r225 |
| Gambits | 1 | 32768 | 0 | 128 | 0 | 4 | 66 | 7 | 7 |  | LC r226 |
| Technicks | 1 | 32768 | 0 | 128 | 0 | 4 | 67 | 7 | 7 |  | LC r227 |
| Heavy Armor | 1 | 32768 | 0 | 128 | 0 | 4 | 68 | 7 | 7 |  | LC r228 |
| Light Armor | 1 | 32768 | 0 | 128 | 0 | 4 | 69 | 7 | 7 |  | LC r229 |
| Mystic Armor | 1 | 32768 | 0 | 128 | 0 | 4 | 70 | 7 | 7 |  | LC r230 |
| Shields | 1 | 32768 | 0 | 128 | 0 | 4 | 71 | 7 | 7 |  | LC r231 |

### Available - First Overlay

| Chip | Entry | Tex link | Group | Section | Anim | Clut | Tex entry | X | Y | Note | Source |
|---|---|---|---|---|---|---|---|---|---|---|---|
| CLEAR IT | 2 | 65535 | 255 | 255 | 0 | 0 | 0 | 0 | 0 |  | LC r236 |
| Gear/Magick/Item Lores/HP Augs 1-19 | 2 | 257 | 1 | 1 | 0 | 0 | # | 22 | 1 |  | LC r237 |
| Gear 20 | 2 | 32768 | 0 | 128 | 0 | 5 | 76 | 17 | 2 |  | LC r238 |
| Gear 21 | 2 | 32768 | 0 | 128 | 0 | 5 | 77 | 17 | 2 |  | LC r239 |
| Gear 22 | 2 | 32768 | 0 | 128 | 0 | 5 | 78 | 17 | 2 |  | LC r240 |

## Enums carried in the JSON spec

| Enum | Keys | Use |
|---|---|---|
| `LnieGroupList` | 0-1 | group selector (Available / Obtained) |
| `LicenseChipEntrySlot` | 0-3 | entry (layer) inside a group |
| `LicenseChipTextureLink` | u16 values seen in the sheet | "1st. Text. Link" drop-down |
| `LicenseChipAnimation` | 0-19 | Animation drop-down |
| `LicenseChipClut` | 0-15 | Clut Link drop-down |
| `LicenseChipPresetBySheetRow` | sheet row numbers | reference presets: the full set of values for every chip the sheet lists (key = LC sheet row, not a game value) |

## Round-trip rules

- Edits are live memory edits: they only hold while a licence board is on screen and are rebuilt from the game files on any screen change (msg 867); export before leaving the board.
- The "1st. Text. Link" value is one u16 = texture group (low byte) + 256 * texture section (high byte) (LC Chip Bin values!E/F formulas =MOD(D,256), =FLOOR(D/256)). Write it as one value or as two bytes, never as two u16.
- Texture Entry Link "#" in the sheet means "the node's level - 1" (LC r78, r139, r234); it must be computed per node, not copied.

## Known unknowns

- Byte layout of a License Node Icon entry (field order and widths) is not in any source; the Toolkit shows the fields by name only.
- Which game file the table is built from (and therefore how to make chip changes permanent) is not documented; the Toolkit editor has an Export action (TK L995) but the target file is not named.
- Entry slot 3 of each group is not covered by the sheet.
- The sheet spells some names oddly (Zoriark = Zodiark, Holology = Horology, Travler = Traveler); labels keep the sheet spelling inside presets.
