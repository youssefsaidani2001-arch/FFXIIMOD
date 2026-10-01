# MRP documentation sheet - per-file catalogue of menu layouts

Spec id: `mrp-sheet` · machine spec: [`mrp-sheet.json`](./mrp-sheet.json)

> **FILE FORMAT** (`.mrp`, sections of `mrppack_ys.bin`). Binary layout identical to [`mrp`](./mrp.md); this spec adds what every documented group/entry is.

## What this is

Neonsquare documented, with the Insurgent's Toolkit MRP editor, what each group and entry of the vanilla menu layouts draws (MRPD MRP Menu!AI1, MRP Pack!AI1). An MRP holds a texture-name list, groups (positioned boxes) and per group a run of variable-length entries (sprites, text, bars, grids). The modders' route for HUD work is to move or resize these entries rather than create new ones (msg 41: "you only need to shift some positions ... with the mrp editor in the Toolkit"; msg 35). Live edits are re-applied each frame by the owning menu; values that snap back have to be changed in the MRP or in UI Settings ([`ui-settings`](./ui-settings.md), TK L1238).

## Sources

Every sheet was read in full through an `.xlsx` export of the Drive file (the plain-text read only returns a ~50-row sample, so it was used only to confirm the tab names). Citations are `KEY Tab!rN` (sheet row N, 1-based as shown in Google Sheets) or `KEY Tab!COL` for a whole column; `msg N` is the index of a message in the #wip-general Discord export; `Drive x.lua:L` is a line of a Lua file from the shared Drive folder; `TK Lnnn` is a line of `docs/research/insurgents_toolkit_reference.md`; `Lists: X` is `editor/data/lists.json`.

| Key | Source | What was used |
|---|---|---|
| `MRPD` | Google Sheet "FFXII TZA - MRP Documentation" (Drive id `1Nojt7MhWiGa97OhUFpZIObFiTSZLmZyTJ6NIZGXroKI`) | tabs MRP Menu (A1:AI867), MRP Pack (A1:AI1296); author Neonsquare |
| `mrp` | docs/formats/mrp.md / mrp.json | binary layout (from The Insurgent's Workshop and Drive Lua); copied unchanged into this JSON |

## Container summary (see [`mrp`](./mrp.md) for all details)

```
0x00  header (0x30)          'MRP' + state byte (0 on disk, 1 in memory), (count, offset) pairs
0x30  group[groupCount]      0x14 bytes each; entryListOffset is relative to the group record
      entries                variable length, entry[0] = size byte, entry[1] = type; walk by size
      zero padding to 16
      texture[textureCount]  0x10 bytes each: 14-byte Shift-JIS name, state, link
```

Files: stand-alone `*.mrp` menu files (gameover, title, title_menu, save_load, e3_logo, quest, shop_new, w_menu, loca, party_book) and the 23 sections of `mrppack_ys.bin` (an otherpack, see [`container-otherpack`](./container-otherpack.md)). No pointer outside the file refers into it; resizing a file only requires rebuilding its own header/group offsets (see mrp) and, for a pack section, the otherpack offset table.

## Sheet columns -> record fields

| Sheet column | Record / field | Notes |
|---|---|---|
| A File / Section | file name, or "<pack section id> - <name>" | a second label in column A without a group number is an alias (party_book = Clan Primer, quest = Hunts Menu) |
| B Group No., C Group | group ordinal i (stored index = i*4) and its description | C is not stored |
| D-H | group x, y, width, height, gap |  |
| I Entry No., J Entry | entry index and description | J is not stored |
| K-N | entry x, y, width, height |  |
| O Type | entry type (1, 2, 4, 5, 6, 7, 8) | `MrpSheetEntryTypeMeaning` |
| P Texture File | textureFileLink (index into the texture list) | legend AG/AH names the textures per file |
| Q Texture Rank, R Texture Description, S-V | type 7 layers: "1st" = background frame, "2nd" = foreground; layer X/Y/W/H |  |
| W-Z Red/Green/Blue/Alpha | colours: 4 rows for type 2 (corners), 1 row for type 5, 1 row per layer for type 7 | 128 is the usual neutral value in the sheet |
| AA Scale, AB Fill | type 5 text scale and style |  |
| AC Notes | observations (crash conditions, alignment, grid size) |  |
| legend AE/AF | x = N/A; greyed value = unused; " type" = no further settings; " >" = entry sequence |  |

## Files documented

| Tab | File / section | Enum key | Groups | Entries | Entry types (type:count) | Named textures | Source |
|---|---|---|---|---|---|---|---|
| MRP Menu | e3_logo | menu_e3_logo | 1 | 2 | 2:2 | - | MRPD MRP Menu!r6 |
| MRP Menu | gameover | menu_gameover | 3 | 3 | 2:1, 5:1, 8:1 | 0=gameover_c | MRPD MRP Menu!r12 |
| MRP Menu | loca | menu_loca | 5 | 12 | 2:4, 5:6, 8:1, x:1 | 6=battle_4_c, 8=partytop_4_c | MRPD MRP Menu!r21 |
| MRP Menu | nowload | menu_nowload | 1 | 1 | 2:1 | - | MRPD MRP Menu!r47 |
| MRP Menu | party_book (= Clan Primer) | menu_party_book | 60 | 202 | 1:11, 2:121, 5:46, 7:1, 8:12, x:11 | 0=partytop_4_c, 3=battle_4_c, 4=cursol_4_p, 6=medal_c, 7=hand_4_c | MRPD MRP Menu!r52 |
| MRP Menu | quest (= Hunts Menu) | menu_quest | 22 | 77 | 1:6, 2:38, 5:27, 8:6 | 0=partytop_4_c, 2=icons_c, 3=battle_4_c, 4=cursol_4_p, 9=q_under_c, 10=q_img_c | MRPD MRP Menu!r417 |
| MRP Menu | save_load | menu_save_load | 9 | 74 | 1:3, 2:56, 5:13, 7:1, 8:1 | 0=partytop_4_c, 2=partytop_8_c, 4=battle_4_c, 7=dataface_c | MRPD MRP Menu!r612 |
| MRP Pack | 1 - Battle/Field | pack01_battle_field | 52 | 281 | 1:28, 2:193, 4:10, 5:31, 6:1, 7:15, x:3 | 0=partytop_4_c, 1=battle_4_c, 2=s_font_c, 4=partytop_8_c, 6=cursol_4_p, 7=buttonicon, 9=battle_4_p, 10=mini_face_c | MRPD MRP Pack!r16 |
| MRP Pack | 2 - Minimap | pack02_minimap | 5 | 17 | 1:1, 2:12, 4:1, 5:3 | 0=battle_4_c, 7=buttonicon | MRPD MRP Pack!r385 |
| MRP Pack | 3 - Quickening | pack03_quickening | 9 | 43 | 1:1, 2:36, 5:5, 7:1 | 0=s_font_c, 4=battle_4_c | MRPD MRP Pack!r410 |
| MRP Pack | 4 - Battle Chain | pack04_battle_chain | 3 | 40 | 2:40 | 0=s_font_c | MRPD MRP Pack!r466 |
| MRP Pack | 5 - Chocobo | pack05_chocobo | 6 | 22 | 1:1, 2:14, 36:1, 5:5, 7:1 | 0=battle_4_c, 2=partytop_4_c | MRPD MRP Pack!r512 |
| MRP Pack | 6 - Party Menu | pack06_party_menu | 17 | 128 | 1:1, 2:89, 4:4, 5:33, x:1 | 0=partytop_4_c, 2=partytop_8_c, 4=battle_4_c, 6=cursol_4_p, 9=buttonicon | MRPD MRP Pack!r545 |
| MRP Pack | 7 - Menus (General) | pack07_menus_general | 37 | 192 | 2:119, 5:50, 8:20, x:3 | 0=partytop_4_c, 1=icons_c, 2=partytop_8_c, 4=battle_4_c, 5=cursol_4_p, 8=shop_8_c | MRPD MRP Pack!r693 |
| MRP Pack | 8 - Equip/Remove | pack08_equip_remove | 15 | 57 | 2:29, 5:18, 8:2, x:8 | 0=partytop_4_c, 1=icons_c, 3=itemgra_c, 5=cursol_4_p | MRPD MRP Pack!r925 |
| MRP Pack | 9 - Inventory | pack09_inventory | 1 | 1 | None:1 | - | MRPD MRP Pack!r1000 |
| MRP Pack | 10 - Gambits | pack10_gambits | 1 | 0 |  | - | MRPD MRP Pack!r1005 |
| MRP Pack | 11 - Licenses | pack11_licenses | 1 | 0 |  | - | MRPD MRP Pack!r1010 |
| MRP Pack | 12 - Config | pack12_config | 1 | 0 |  | - | MRPD MRP Pack!r1015 |
| MRP Pack | 13 - Gimmicks? | pack13_gimmicks | 7 | 38 | 1:6, 2:22, 4:2, 5:6, 7:2 | - | MRPD MRP Pack!r1020 |
| MRP Pack | 14 - | pack14 | 7 | 34 | 1:6, 2:20, 4:2, 5:4, 7:1, x:1 | - | MRPD MRP Pack!r1070 |
| MRP Pack | 15 - | pack15 | 7 | 34 | 1:6, 2:20, 4:2, 5:4, 7:1, x:1 | - | MRPD MRP Pack!r1115 |
| MRP Pack | 16 - Boss HP Bar | pack16_boss_hp_bar | 1 | 7 | 4:1, 5:3, 7:3 | - | MRPD MRP Pack!r1160 |
| MRP Pack | 17 - New Game Tutorial | pack17_new_game_tutorial | 4 | 9 | 1:2, 2:4, 5:3 | 1=partytop_4_c | MRPD MRP Pack!r1174 |
| MRP Pack | 18 - Gil Counter | pack18_gil_counter | 1 | 15 | 2:14, 5:1 | 1=partytop_4_c | MRPD MRP Pack!r1202 |
| MRP Pack | 20 - Save/Load/Speed Icons | pack20_save_load_speed_icons | 3 | 5 | 2:5 | 0=extra_c | MRPD MRP Pack!r1275 |

## Groups per file

Group descriptions ("?" / "x" in the sheet are shown as *unused / not identified*). Entry-level labels are in the JSON enums `MrpEntryLabels_<key>`.

### e3_logo - `menu_e3_logo`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | - | 448 | 92 | 1024 | 896 | 0 | 2 | 6 |

### gameover - `menu_gameover`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | Game Over Message | 474 | 432 | 1024 | 256 | 0 | 1 | 12 |
| 1 | - | 1212 | 878 | 360 | 96 | 0 | 1 | 14 |
| 2 | - | 0 | 0 | 288 | 40 | 0 | 1 | 16 |

### loca - `menu_loca`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | - | 448 | 92 | 1024 | 896 | 0 | 1 | 21 |
| 1 | - | 424 | 822 | 1040 | 176 | 0 | 4 | 23 |
| 2 | - | 448 | 92 | 932 | 1072 | 0 | 1 | 28 |
| 3 | Map Legend - Main | 1200 | 86 | 728 | 1000 | 0 | 3 | 30 |
| 4 | Map Legend - Contents | 40 | 52 | 680 | 52 | 0 | 3 | 40 |

### nowload - `menu_nowload`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | - | 1048 | 876 | 408 | 80 | 0 | 1 | 47 |

### party_book (Clan Primer) - `menu_party_book`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | Bestiary Entry - Page border | 0 | -2 | 2000 | 1200 | 0 | 19 | 52 |
| 1 | - | 110 | 100 | 2000 | 1100 | 0 | 1 | 72 |
| 2 | - | 0 | 0 | 992 | 192 | 0 | 4 | 74 |
| 3 | - | 448 | 92 | 1024 | 1024 | 0 | 1 | 79 |
| 4 | - | 100 | 100 | 1920 | 1080 | 0 | 1 | 81 |
| 5 | - | 32 | 122 | 980 | 116 | 0 | 3 | 83 |
| 6 | - | 448 | 92 | 1024 | 896 | 0 | 1 | 87 |
| 7 | - | 448 | 92 | 1024 | 1024 | 0 | 2 | 89 |
| 8 | - | 76 | 122 | 910 | 138 | 0 | 2 | 92 |
| 9 | Page Header Underline (All) | 80 | 94 | 1800 | 896 | 0 | 2 | 95 |
| 10 | - | 448 | 80 | 1016 | 176 | 0 | 3 | 104 |
| 11 | - | 448 | 888 | 1008 | 78 | 0 | 6 | 111 |
| 12 | - | 824 | 34 | 148 | 36 | 0 | 8 | 118 |
| 13 | - | 426 | 34 | 40 | 36 | 0 | 2 | 127 |
| 14 | Bestiary Entry - Page select | 1308 | 928 | 164 | 64 | 0 | 7 | 130 |
| 15 | Sky Pirate's Den - Info box | 490 | 252 | 584 | 208 | 0 | 4 | 138 |
| 16 | - | 490 | 640 | 592 | 224 | 0 | 1 | 146 |
| 17 | - | 832 | 292 | 592 | 224 | 0 | 1 | 148 |
| 18 | - | 832 | 640 | 592 | 224 | 0 | 1 | 150 |
| 19 | Sky Pirate's Den - Background | 478 | 104 | 1024 | 1024 | 0 | 1 | 152 |
| 20 | - | 0 | 0 | 1920 | 1080 | 0 | 1 | 154 |
| 21 | Bestiary Entry - Page header | 84 | 40 | 992 | 192 | 0 | 4 | 156 |
| 22 | - | 140 | 140 | 1024 | 896 | 0 | 1 | 161 |
| 23 | Clan Primer - Clan status | 1100 | 848 | 800 | 200 | 0 | 14 | 163 |
| 24 | Clan Primer - Points counter | 226 | 58 | 300 | 50 | 0 | 8 | 202 |
| 25 | - | 304 | 74 | 40 | 36 | 0 | 2 | 214 |
| 26 | Page Heading (All) | 0 | 0 | 1920 | 1080 | 0 | 1 | 217 |
| 27 | - | 0 | 0 | 1920 | 1080 | 0 | 1 | 219 |
| 28 | - | 562 | 264 | 548 | 408 | 0 | 10 | 221 |
| 29 | Bestiary/Hunts - Completion bar | 518 | 856 | 1040 | 128 | 0 | 4 | 232 |
| 30 | - | 0 | 0 | 2000 | 1000 | 0 | 2 | 238 |
| 31 | - | 0 | 0 | 512 | 896 | 0 | 1 | 241 |
| 32 | - | 0 | 0 | 1024 | 896 | 0 | 1 | 243 |
| 33 | - | 0 | 0 | 1024 | 880 | 0 | 1 | 245 |
| 34 | - | 0 | 0 | 1024 | 896 | 0 | 1 | 247 |
| 35 | Bestiary Entry - Article/Sp. info | 40 | 0 | 1920 | 1008 | 0 | 11 | 249 |
| 36 | Bestiary Entry - Species info 1 | 203 | 854 | 300 | 128 | 0 | 2 | 276 |
| 37 | Bestiary Entry - Species info 2 | 203 | 856 | 300 | 128 | 0 | 2 | 285 |
| 38 | - | 0 | 0 | 1024 | 896 | 0 | 1 | 294 |
| 39 | Traveler's Tips Entry - Article | 0 | 40 | 1920 | 1080 | 0 | 1 | 296 |
| 40 | - | 0 | 0 | 960 | 1080 | 0 | 1 | 298 |
| 41 | - | 0 | 0 | 1024 | 896 | 0 | 1 | 300 |
| 42 | - | 0 | 0 | 1024 | 896 | 0 | 1 | 302 |
| 43 | Traveler's Tips Entry - Heading | 316 | 118 | 976 | 88 | 0 | 1 | 304 |
| 44 | Bestiary Index | 50 | 60 | 1800 | 1024 | 0 | 2 | 306 |
| 45 | Bestiary Index - Column headings | 146 | 93 | 1800 | 138 | 0 | 2 | 309 |
| 46 | - | 200 | 60 | 1024 | 896 | 0 | 1 | 312 |
| 47 | Traveler's Tips Index | 170 | 60 | 1400 | 896 | 0 | 1 | 314 |
| 48 | - | 44 | 130 | 960 | 40 | 0 | 5 | 316 |
| 49 | - | 90 | 182 | 148 | 124 | 0 | 4 | 322 |
| 50 | - | 44 | 160 | 549 | 48 | 0 | 7 | 327 |
| 51 | - | 220 | 240 | 580 | 50 | 0 | 6 | 335 |
| 52 | - | 472 | 140 | 900 | 52 | 0 | 1 | 342 |
| 53 | - | 184 | 264 | 812 | 52 | 0 | 1 | 344 |
| 54 | Bestiary Entry - Article text | 1030 | 242 | 690 | 52 | 0 | 1 | 346 |
| 55 | - | 488 | 176 | 512 | 52 | 0 | 1 | 348 |
| 56 | Traveler's Tips Entry - Article text | 470 | 152 | 1112 | 52 | 0 | 1 | 350 |
| 57 | Bestiary Index - Contents | 290 | 156 | 640 | 50 | 0 | 10 | 352 |
| 58 | - | 44 | 146 | 480 | 44 | 0 | 8 | 372 |
| 59 | Traveler's Tips Index - Contents | 260 | 142 | 1082 | 52 | 0 | 8 | 393 |

### quest (Hunts Menu) - `menu_quest`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | - | 500 | 208 | 488 | 52 | 0 | 2 | 417 |
| 1 | - | 508 | 226 | 440 | 480 | 38 | 1 | 420 |
| 2 | - | 532 | 258 | 520 | 480 | 38 | 1 | 422 |
| 3 | - | 440 | 184 | 760 | 640 | 0 | 9 | 424 |
| 4 | - | 32 | 124 | 680 | 480 | 0 | 2 | 440 |
| 5 | - | 32 | 124 | 680 | 440 | 0 | 2 | 443 |
| 6 | - | 562 | 68 | 124 | 64 | 0 | 3 | 446 |
| 7 | - | 488 | 868 | 286 | 64 | 0 | 3 | 450 |
| 8 | Hunt Entry (Selected) | 420 | 190 | 1100 | 124 | 0 | 9 | 454 |
| 9 | Quest Progress | 342 | 206 | 1400 | 752 | 0 | 3 | 485 |
| 10 | - | 20 | 74 | 84 | 64 | 0 | 3 | 489 |
| 11 | - | 0 | 120 | 1200 | 562 | 0 | 1 | 502 |
| 12 | Quest Progress - Contents 1 | 0 | 78 | 1300 | 700 | 0 | 2 | 504 |
| 13 | Hunts Index | 380 | 182 | 1300 | 800 | 0 | 1 | 507 |
| 14 | - | 0 | 124 | 680 | 450 | 0 | 14 | 509 |
| 15 | - | 32 | 124 | 680 | 440 | 0 | 1 | 545 |
| 16 | - | 0 | 0 | 440 | 44 | 0 | 2 | 547 |
| 17 | - | 0 | 0 | 520 | 44 | 0 | 2 | 553 |
| 18 | - | 10 | 44 | 440 | 44 | 0 | 3 | 559 |
| 19 | - | 164 | 30 | 680 | 44 | 0 | 1 | 566 |
| 20 | Quest Progress - Contents 2 | 72 | 76 | 1200 | 48 | 0 | 3 | 568 |
| 21 | Hunt Entry | 40 | 8 | 1194 | 118 | 0 | 9 | 578 |

### save_load - `menu_save_load`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | Save File Index | 346 | 170 | 1500 | 580 | 0 | 1 | 612 |
| 1 | Loading Bar | 411 | 740 | 1140 | 296 | 0 | 2 | 614 |
| 2 | Saved Game Info | 350 | 764 | 1300 | 312 | 0 | 3 | 621 |
| 3 | Saved Game Info - Level/Gil | 8 | 0 | 440 | 312 | 0 | 12 | 625 |
| 4 | - | 52 | 196 | 464 | 90 | 0 | 3 | 668 |
| 5 | Clan Rank Info | 430 | -15 | 800 | 312 | 0 | 12 | 675 |
| 6 | Save Menu - Main | 0 | 0 | 1920 | 1080 | 0 | 2 | 715 |
| 7 | Saved Game Info - Party | 224 | 0 | 129 | 216 | 8 | 11 | 724 |
| 8 | Save File Index - Contents | 0 | 0 | 1244 | 96 | 0 | 28 | 768 |

### 1 - Battle/Field - `pack01_battle_field`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | Target Info - Background | 0 | 90 | 1000 | 164 | 48 | 1 | 16 |
| 1 | - | 100 | 116 | 840 | 224 | 0 | 28 | 18 |
| 2 | - | 0 | 22 | 798 | 28 | 65376 | 2 | 51 |
| 3 | - | 328 | 16 | 400 | 180 | 0 | 1 | 54 |
| 4 | - | 42 | 112 | 500 | 60 | 0 | 13 | 56 |
| 5 | - | 4 | 106 | 438 | 64 | 0 | 4 | 70 |
| 6 | - | 12 | 0 | 760 | 46 | 0 | 2 | 75 |
| 7 | Help Message | 106 | 60 | 1708 | 128 | 0 | 2 | 79 |
| 8 | Combat Log? | -20 | 62 | 1200 | 174 | 30 | 5 | 82 |
| 9 | - | 1082 | 638 | 412 | 184 | 0 | 2 | 88 |
| 10 | - | 44 | 6 | 360 | 64 | 0 | 2 | 91 |
| 11 | - | 426 | 764 | 512 | 256 | 0 | 2 | 94 |
| 12 | "FLEEING" Animation | 446 | 620 | 1028 | 76 | 7 | 12 | 97 |
| 13 | - | 454 | 708 | 376 | 128 | 0 | 5 | 110 |
| 14 | Battle Menu - Main | 80 | 816 | 704 | 220 | 0 | 7 | 116 |
| 15 | Battle Menu - Party leader flag | 0 | 0 | 388 | 130 | 0 | 2 | 124 |
| 16 | Battle Menu - Character portrait | -12 | 10 | 310 | 136 | 0 | 4 | 127 |
| 17 | Battle Chain | 1490 | 744 | 418 | 124 | 0 | 8 | 132 |
| 18 | - | 422 | 806 | 560 | 180 | 0 | 3 | 156 |
| 19 | - | 0 | 124 | 480 | 28 | 65376 | 2 | 160 |
| 20 | Location Info (in towns) | -8 | 880 | 1124 | 164 | 0 | 6 | 163 |
| 21 | Party Info - Main | 570 | 741 | 1800 | 304 | 0 | 1 | 170 |
| 22 | Target Info - Main | -20 | 38 | 1400 | 320 | 0 | 19 | 172 |
| 23 | Target Info - Underline | 0 | 42 | 1200 | 28 | 65376 | 2 | 193 |
| 24 | Target Info - Two digit HP value | 88 | 94 | 320 | 64 | 0 | 5 | 196 |
| 25 | Target Info - Three digit HP value | 90 | 94 | 320 | 64 | 0 | 7 | 202 |
| 26 | Target Info - Four digit HP value | 90 | 96 | 320 | 64 | 0 | 9 | 210 |
| 27 | Target Info - Five digit HP value | 93 | 99 | 320 | 64 | 0 | 10 | 220 |
| 28 | Target Info - Weakness | 80 | 152 | 780 | 64 | 0 | 1 | 231 |
| 29 | - | 62 | 0 | 760 | 46 | 0 | 2 | 233 |
| 30 | Group Toggle - Main | 210 | 978 | 640 | 80 | 3 | 8 | 237 |
| 31 | Group Toggle - "L1" button | 46 | 30 | 64 | 40 | 0 | 2 | 246 |
| 32 | Group Toggle - "R1" button | 485 | 30 | 60 | 40 | 0 | 2 | 249 |
| 33 | Group Toggle - "L1" btn modifier | 40 | 20 | 60 | 50 | 0 | 1 | 252 |
| 34 | Group Toggle - "R1" btn modifier | 485 | 20 | 60 | 50 | 0 | 1 | 254 |
| 35 | - | 0 | 0 | 36 | 55 | 25 | 1 | 256 |
| 36 | - | 0 | 0 | 36 | 36 | 0 | 1 | 258 |
| 37 | - | 0 | 0 | 15 | 17 | 0 | 3 | 260 |
| 38 | - | 40 | 58 | 320 | 32 | 0 | 10 | 264 |
| 39 | - | 254 | 64 | 74 | 116 | 0 | 3 | 275 |
| 40 | Party Info - General | 202 | 228 | 1200 | 58 | 52 | 30 | 279 |
| 41 | Party Info - One mist bar | 495 | 43 | 200 | 18 | 0 | 1 | 314 |
| 42 | Party Info - Two mist bars | 479 | 26 | 520 | 30 | 0 | 2 | 317 |
| 43 | Party Info - Three mist bars | 479 | 26 | 600 | 30 | 0 | 3 | 322 |
| 44 | Party Info - Two digit HP value | 696 | 0 | 240 | 48 | 0 | 5 | 329 |
| 45 | Party Info - Three digit HP value | 696 | 0 | 300 | 48 | 0 | 7 | 335 |
| 46 | Party Info - Four digit HP value | 696 | 0 | 400 | 48 | 0 | 8 | 343 |
| 47 | Party Info - Party member | -16 | -4 | 1200 | 58 | 0 | 7 | 352 |
| 48 | Party Info - Summon | 836 | 4 | 256 | 52 | 0 | 7 | 360 |
| 49 | Party Info - Party leader highlight | 462 | 232 | 1200 | 80 | 52 | 2 | 368 |
| 50 | Party Info - Actions | 170 | 230 | 544 | 64 | 52 | 5 | 371 |
| 51 | Party Info - Selection highlight | 0 | 220 | 1800 | 88 | 0 | 3 | 378 |

### 2 - Minimap - `pack02_minimap`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | Minimap - Main | 1476 | 4 | 400 | 400 | 557 | 4 | 385 |
| 1 | Minimap - Header | 180 | 28 | 50 | 78 | 0 | 2 | 390 |
| 2 | - | 1162 | 94 | 144 | 196 | 0 | 7 | 393 |
| 3 | - | 826 | 2 | 1036 | 500 | 0 | 3 | 401 |
| 4 | - | 878 | 348 | 128 | 64 | 0 | 1 | 405 |

### 3 - Quickening - `pack03_quickening`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | - | 641 | 34 | 600 | 64 | 0 | 1 | 410 |
| 1 | - | 693 | 830 | 1300 | 208 | 0 | 7 | 412 |
| 2 | Hits Counter? | 1590 | 770 | 300 | 98 | 0 | 3 | 421 |
| 3 | - | 1254 | 774 | 500 | 200 | 0 | 5 | 425 |
| 4 | - | 1254 | 774 | 500 | 200 | 0 | 9 | 431 |
| 5 | - | 1254 | 774 | 500 | 200 | 0 | 10 | 441 |
| 6 | - | 786 | 900 | 1200 | 80 | 0 | 2 | 452 |
| 7 | - | 214 | 110 | 1000 | 58 | 44 | 3 | 455 |
| 8 | - | 842 | 10 | 96 | 44 | 0 | 3 | 459 |

### 4 - Battle Chain - `pack04_battle_chain`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | - | 690 | 564 | 512 | 100 | 0 | 16 | 466 |
| 1 | - | 1350 | 612 | 576 | 178 | 0 | 12 | 483 |
| 2 | - | 984 | 772 | 560 | 90 | 0 | 12 | 496 |

### 5 - Chocobo - `pack05_chocobo`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | - | 0 | 800 | 528 | 192 | 0 | 6 | 512 |
| 1 | - | -20 | 860 | 600 | 176 | 0 | 2 | 519 |
| 2 | - | -468 | 674 | 944 | 208 | 0 | 1 | 522 |
| 3 | - | 55 | 77 | 920 | 120 | 18 | 4 | 525 |
| 4 | - | 400 | -15 | 500 | 100 | 0 | 7 | 531 |
| 5 | - | 178 | 126 | 732 | 40 | 18 | 2 | 539 |

### 6 - Party Menu - `pack06_party_menu`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | Help Message | 84 | 100 | 1600 | 54 | 0 | 2 | 545 |
| 1 | - | 480 | 922 | 960 | 36 | 0 | 1 | 548 |
| 2 | Party Member Status - Main | 676 | 120 | 1300 | 184 | 3 | 7 | 550 |
| 3 | Menu | 120 | 126 | 360 | 680 | 0 | 1 | 558 |
| 4 | Section Title | 114 | 120 | 800 | 52 | 0 | 2 | 560 |
| 5 | - | 140 | 216 | 362 | 680 | 0 | 3 | 563 |
| 6 | Time Played/Steps Taken | 1062 | 920 | 784 | 128 | 0 | 20 | 567 |
| 7 | Map Location Header | 96 | 50 | 1500 | 64 | 0 | 5 | 588 |
| 8 | - | -15 | 0 | 128 | 64 | 0 | 2 | 594 |
| 9 | Gil Total | 154 | 894 | 400 | 112 | 0 | 1 | 597 |
| 10 | - | 350 | 775 | 500 | 100 | 0 | 6 | 599 |
| 11 | - | 0 | 0 | 32 | 32 | 0 | 4 | 606 |
| 12 | - | 0 | 0 | 32 | 32 | 0 | 3 | 611 |
| 13 | - | 0 | 0 | 32 | 32 | 0 | 3 | 615 |
| 14 | Party Member Status - General | 2 | 52 | 1230 | 112 | 14 | 51 | 619 |
| 15 | Party Member Status - Text | -40 | 77 | 1000 | 136 | 0 | 8 | 671 |
| 16 | Party Member Status - Graphics | 40 | 2 | 400 | 116 | 0 | 9 | 680 |

### 7 - Menus (General) - `pack07_menus_general`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | Party Member Toggle - Main | 700 | 106 | 1200 | 302 | 0 | 1 | 693 |
| 1 | Attributes - Main | -2 | 400 | 800 | 586 | 92 | 3 | 695 |
| 2 | Status - Main | 560 | 347 | 1400 | 560 | 0 | 5 | 699 |
| 3 | Equip - Main | 674 | 456 | 1400 | 500 | 22 | 6 | 705 |
| 4 | Action List - Main | 200 | 24 | 1600 | 1100 | 0 | 1 | 712 |
| 5 | - | 298 | 92 | 1500 | 1000 | 0 | 1 | 714 |
| 6 | Party Member Toggle - Frames | 944 | 18 | 142 | 190 | 0 | 2 | 716 |
| 7 | Party Member Toggle - Selector | 0 | -1 | 1200 | 152 | 0 | 4 | 719 |
| 8 | Party Status (Shop) - Text | 754 | 40 | 184 | 280 | 0 | 2 | 724 |
| 9 | Party Status (Shop) - Main | 944 | 4 | 102 | 224 | 0 | 17 | 727 |
| 10 | Action List - Header/Background | 0 | 18 | 1600 | 1100 | 0 | 33 | 745 |
| 11 | Action List - Contents (2nd page) | 44 | 68 | 1600 | 1000 | 0 | 16 | 779 |
| 12 | Action List - Contents (1st page) | 44 | 68 | 1600 | 1000 | 0 | 16 | 796 |
| 13 | - | 0 | 18 | 1500 | 980 | 0 | 32 | 813 |
| 14 | - | 44 | 68 | 962 | 792 | 0 | 12 | 846 |
| 15 | - | 44 | 68 | 962 | 792 | 0 | 6 | 859 |
| 16 | - | 44 | 68 | 1200 | 792 | 0 | 9 | 866 |
| 17 | Attributes - Contents | 92 | 70 | 500 | 40 | 0 | 4 | 876 |
| 18 | Status - Contents | 64 | 163 | 250 | 47 | 0 | 2 | 881 |
| 19 | Equip - Contents | 72 | 88 | 980 | 52 | 0 | 3 | 884 |
| 20 | Action List - Technicks list | 120 | 120 | 320 | 40 | 0 | 1 | 888 |
| 21 | Action List - Quickenings list | 120 | 416 | 430 | 42 | 0 | 1 | 890 |
| 22 | Action List - Remedy Lore list | 120 | 519 | 330 | 40 | 0 | 1 | 892 |
| 23 | Action List - Espers List | 120 | 734 | 330 | 40 | 0 | 1 | 894 |
| 24 | Action List - Magicks list | 80 | 78 | 340 | 40 | 0 | 1 | 896 |
| 25 | - | 80 | 220 | 140 | 40 | 0 | 1 | 898 |
| 26 | - | 80 | 356 | 140 | 40 | 0 | 1 | 900 |
| 27 | - | 80 | 492 | 140 | 40 | 0 | 1 | 902 |
| 28 | - | 80 | 628 | 140 | 40 | 0 | 1 | 904 |
| 29 | - | 16 | 112 | 298 | 38 | 0 | 1 | 906 |
| 30 | - | 308 | 432 | 440 | 40 | 0 | 1 | 908 |
| 31 | - | 16 | 596 | 300 | 38 | 0 | 1 | 910 |
| 32 | - | 64 | 100 | 288 | 40 | 0 | 1 | 912 |
| 33 | - | 64 | 376 | 288 | 40 | 0 | 1 | 914 |
| 34 | - | 64 | 96 | 288 | 40 | 0 | 1 | 916 |
| 35 | - | 64 | 328 | 288 | 40 | 0 | 1 | 918 |
| 36 | - | 64 | 560 | 288 | 40 | 0 | 1 | 920 |

### 8 - Equip/Remove - `pack08_equip_remove`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | Equipment Selection | 670 | 330 | 1400 | 720 | 0 | 8 | 925 |
| 1 | Bottom Bar Info (All Menus) | 518 | 816 | 1400 | 216 | 0 | 4 | 934 |
| 2 | Currently Equipped (Reference) | 674 | 236 | 1500 | 144 | 22 | 7 | 939 |
| 3 | Off-hand Selection - Main | 670 | 330 | 1400 | 720 | 0 | 1 | 947 |
| 4 | Bottom Bar Padding (Left) | 468 | 840 | 64 | 64 | 0 | 1 | 949 |
| 5 | - | 468 | 840 | 64 | 64 | 0 | 1 | 951 |
| 6 | - | 518 | 840 | 64 | 64 | 0 | 1 | 953 |
| 7 | - | 348 | 840 | 64 | 64 | 0 | 1 | 955 |
| 8 | Equipment Category Icons | 322 | 28 | 740 | 112 | 0 | 1 | 957 |
| 9 | Party Member Icons | 74 | 0 | 738 | 206 | 0 | 1 | 959 |
| 10 | Off-hand Category Icons | 322 | 28 | 740 | 112 | 0 | 1 | 961 |
| 11 | Off-hand Selection - Contents | 54 | 100 | 1400 | 480 | 0 | 7 | 963 |
| 12 | Off-hand Selection - Party icons | 74 | 0 | 738 | 206 | 0 | 1 | 971 |
| 13 | Equipment List | 84 | 172 | 1040 | 48 | 0 | 11 | 973 |
| 14 | Off-hand List | 30 | 72 | 1040 | 48 | 0 | 11 | 985 |

### 9 - Inventory - `pack09_inventory`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | - |  |  |  |  |  | 1 | 1000 |

### 10 - Gambits - `pack10_gambits`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | - |  |  |  |  |  | 0 | 1005 |

### 11 - Licenses - `pack11_licenses`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | - |  |  |  |  |  | 0 | 1010 |

### 12 - Config - `pack12_config`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | - |  |  |  |  |  | 0 | 1015 |

### 13 - Gimmicks? - `pack13_gimmicks`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | Pop-up CHARGE Status | 796 | 0 | 1068 | 924 | 0 | 8 | 1020 |
| 1 | - | 16 | 742 | 96 | 96 | 0 | 1 | 1029 |
| 2 | Charge Bar | 692 | 434 | 480 | 96 | 0 | 10 | 1031 |
| 3 | - | 16 | 534 | 352 | 92 | 0 | 13 | 1043 |
| 4 | - | 0 | 246 | 1214 | 316 | 0 | 4 | 1057 |
| 5 | - | 16 | 678 | 160 | 48 | 0 | 1 | 1063 |
| 6 | - | 16 | 742 | 96 | 96 | 0 | 1 | 1065 |

### 14 - - `pack14`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | - | 748 | 32 | 1600 | 800 | 65442 | 8 | 1070 |
| 1 | - | 16 | 496 | 96 | 96 | 0 | 1 | 1079 |
| 2 | - | 16 | 24 | 416 | 240 | 0 | 9 | 1081 |
| 3 | - | 900 | 188 | 486 | 96 | 0 | 13 | 1092 |
| 4 | - | 0 | 0 | 64 | 64 | 0 | 1 | 1106 |
| 5 | - | 16 | 432 | 160 | 48 | 0 | 1 | 1108 |
| 6 | - | 16 | 496 | 96 | 96 | 0 | 1 | 1110 |

### 15 - - `pack15`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | - | 448 | 92 | 1600 | 352 | 0 | 8 | 1115 |
| 1 | - | 16 | 496 | 96 | 96 | 0 | 1 | 1124 |
| 2 | - | 16 | 16 | 416 | 240 | 0 | 9 | 1126 |
| 3 | - | 692 | 188 | 458 | 96 | 0 | 13 | 1137 |
| 4 | - | 0 | 0 | 64 | 64 | 0 | 1 | 1151 |
| 5 | - | 16 | 432 | 160 | 48 | 0 | 1 | 1153 |
| 6 | - | 16 | 496 | 96 | 96 | 0 | 1 | 1155 |

### 16 - Boss HP Bar - `pack16_boss_hp_bar`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | Boss HP Bar | -2 | 34 | 1400 | 64 | 0 | 7 | 1160 |

### 17 - New Game Tutorial - `pack17_new_game_tutorial`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | Tutorial Log | 0 | 80 | 1000 | 250 | 0 | 4 | 1174 |
| 1 | Tutorial Log Underline (top left) | -6 | 34 | 1000 | 28 | 0 | 2 | 1179 |
| 2 | Tutorial Log Underline (btm right) | 10 | 34 | 1000 | 28 | 0 | 2 | 1188 |
| 3 | Tutorial Text (incl. background) | 0 | 47 | 800 | 180 | 0 | 1 | 1197 |

### 18 - Gil Counter - `pack18_gil_counter`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | Gil Counter | 1456 | 922 | 500 | 112 | 0 | 15 | 1202 |

### 20 - Save/Load/Speed Icons - `pack20_save_load_speed_icons`

| Group | Description | X | Y | W | H | Gap | Entries | Row |
|---|---|---|---|---|---|---|---|---|
| 0 | Load Icon | 0 | 0 | 1920 | 1080 | 0 | 1 | 1275 |
| 1 | Save Icon | 0 | 0 | 1920 | 1080 | 0 | 1 | 1280 |
| 2 | Speed Icons | 0 | 0 | 1920 | 1080 | 0 | 3 | 1285 |

## Record layouts (copied from `mrp`, with the sheet column of each field)

All multi-byte values little-endian; offsets relative to the record.

### Record `header` — 48 bytes (0x30), count: 1

*Where:* File offset 0 (or start of an mrppack_ys.bin section).

| Offset | Size | Type | Name | Meaning (source) | Enum |
|---|---|---|---|---|---|
| 0x00 | 3 | bytes | `magic` | ASCII "MRP" (4D 52 50). [src: IW Formats/Mrp.cs:13, 32-35] |  |
| 0x03 | 1 | u8 | `state` | 0 on disk; the game sets it to 1 after loading (the Toolkit checks "MRP\x01" in memory). [src: IW Formats/Mrp.cs:37; TK L411, L1145] |  |
| 0x04 | 4 | u32 | `textureCount` | Number of texture-name records. [src: IW Formats/Mrp.cs:38; Drive helpers.lua:79] |  |
| 0x08 | 4 | u32 | `textureListOffset` | Offset of the texture-name list from the file start (absolute 32-bit address once loaded). Written after the groups and entries, 16-aligned. [src: IW Formats/Mrp.cs:39-40, 427; Drive helpers.lua:80, 126-130] |  |
| 0x0C | 4 | u32 | `list2Count` | Unknown; 0 in Workshop output. Probably the count of an unused list whose offset follows. [src: IW Formats/Mrp.cs:441] |  |
| 0x10 | 4 | u32 | `list2Offset` | End-of-data offset in Workshop output (offset after the texture list = file size). LowPriorityCitizen's in-memory builder treats it as the total size to allocate. [src: IW Formats/Mrp.cs:433, 442; Drive helpers.lua:137, 142] |  |
| 0x14 | 4 | u32 | `list3Count` | Unknown; 0 in Workshop output. [src: IW Formats/Mrp.cs:443] |  |
| 0x18 | 4 | u32 | `list3Offset` | End-of-data offset in Workshop output. [src: IW Formats/Mrp.cs:444] |  |
| 0x1C | 4 | u32 | `groupCount` | Number of groups. [src: IW Formats/Mrp.cs:62, 445; Drive frame.lua:17] |  |
| 0x20 | 4 | u32 | `groupListOffset` | Offset of the group list; 0x30 in Workshop output (groups follow the header). Absolute 32-bit address once loaded. [src: IW Formats/Mrp.cs:63, 446; Drive frame.lua:20] |  |
| 0x24 | 4 | u32 | `list4Count` | Unknown; 0 in Workshop output. [src: IW Formats/Mrp.cs:447] |  |
| 0x28 | 4 | u32 | `list4Offset` | End-of-data offset in Workshop output. [src: IW Formats/Mrp.cs:448] |  |
| 0x2C | 4 | u32 | `reserved2C` | Never written by the Workshop (stays 0). [src: IW Formats/Mrp.cs:435-448] |  |

### Record `group` — 20 bytes (0x14), count: header.groupCount

*Where:* header.groupListOffset + i*0x14

| Offset | Size | Type | Name | Meaning (source) | Enum |
|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `entryCount` | Number of entries in this group (max 255). [src: IW Formats/Mrp.cs:70, 271; Drive frame.lua:25] |  |
| 0x01 | 2 | u16 | `index` | Group index x 4 (Workshop writes i*4; LowPriorityCitizen writes 4*index too). [src: IW Formats/Mrp.cs:71, 272; Drive helpers.lua:98, 154] Sheet: sheet column B "Group No." holds the ordinal i; the stored value is i*4 [MRPD]. |  |
| 0x03 | 1 | bf8 | `flags` | Group flags; bit 4 = visible. [src: IW Formats/Mrp.cs:72-73, 269, 273] | bits below |
| 0x04 | 2 | s16 | `x` | Group X. [src: IW Formats/Mrp.cs:74, 274] Sheet: sheet column D [MRPD]. |  |
| 0x06 | 2 | s16 | `y` | Group Y. [src: IW Formats/Mrp.cs:75, 275] Sheet: sheet column E [MRPD]. |  |
| 0x08 | 2 | u16 | `width` | Group width. [src: IW Formats/Mrp.cs:76, 276] Sheet: sheet column F [MRPD]. |  |
| 0x0A | 2 | u16 | `height` | Group height. [src: IW Formats/Mrp.cs:77, 277] Sheet: sheet column G [MRPD]. |  |
| 0x0C | 4 | s32 | `gap` | Gap/spacing between entries (meaning beyond the name not documented). [src: IW Formats/Mrp.cs:78, 278] Sheet: sheet column H [MRPD]. |  |
| 0x10 | 4 | u32 | `entryListOffset` | Offset of the first entry, RELATIVE TO THIS GROUP RECORD on disk; absolute 32-bit address once loaded. [src: IW Formats/Mrp.cs:79, 285-290; Drive helpers.lua:161; Drive frame.lua:28] |  |

#### Bits of `group.flags` (bf8 at 0x03; bit 0 = least significant)

| Bit(s) | Name | Enum / meaning |
|---|---|---|
| 4 | `isVisible` |  |

### Record `entryType1` — 16 bytes (0x10), count: per group

*Where:* Inside a group's entry list where entry.type == 1. Entries are variable-length and must be walked: next = this + entry.size.

| Offset | Size | Type | Name | Meaning (source) | Enum |
|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `size` | Size of this entry in bytes (the walker adds it to reach the next entry). Fixed per type: 1=0x10, 2=0x24, 4=0x1C, 5=0x18, 6=0x18, 7=0x48, 8=0x2C. [src: IW Formats/Mrp.cs:86, 298, 516-692; Drive frame.lua:30-34] |  |
| 0x01 | 1 | u8 | `type` | Entry type. [src: IW Formats/Mrp.cs:87, 299] Sheet: sheet column O [MRPD]. | `MrpeEntryTypeList` |
| 0x02 | 1 | u8 | `index` | Entry index inside its group (writers emit 0, 1, 2 ...). [src: IW Formats/Mrp.cs:88, 300] Sheet: sheet column I "Entry No." [MRPD]. |  |
| 0x03 | 1 | bf8 | `flags` | Entry flags; bit 4 = visible. Other bits not named (preserve them). [src: IW Formats/Mrp.cs:95-96, 301] | bits below |
| 0x04 | 2 | s16 | `x` | X position (screen units, relative to the group). [src: IW Formats/Mrp.cs:97, 302; Drive layout.lua:51-57] Sheet: sheet column K [MRPD]. |  |
| 0x06 | 2 | s16 | `y` | Y position. [src: IW Formats/Mrp.cs:98, 303] Sheet: sheet column L [MRPD]. |  |
| 0x08 | 2 | u16 | `width` | Width. [src: IW Formats/Mrp.cs:99, 304; Drive layout.lua:51-57] Sheet: sheet column M [MRPD]. |  |
| 0x0A | 2 | u16 | `height` | Height. [src: IW Formats/Mrp.cs:100, 305] Sheet: sheet column N [MRPD]. |  |
| 0x0C | 4 | u32 | `groupLink` | Link to another group (sub-group reference). The Toolkit lists type 1 as "Unknown (0x01)". [src: IW Formats/Mrp.cs:101, 311] |  |

#### Bits of `entryType1.flags` (bf8 at 0x03; bit 0 = least significant)

| Bit(s) | Name | Enum / meaning |
|---|---|---|
| 4 | `isVisible` |  |

### Record `entryType2` — 36 bytes (0x24), count: per group

*Where:* type == 2 ("Texture")

| Offset | Size | Type | Name | Meaning (source) | Enum |
|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `size` | Size of this entry in bytes (the walker adds it to reach the next entry). Fixed per type: 1=0x10, 2=0x24, 4=0x1C, 5=0x18, 6=0x18, 7=0x48, 8=0x2C. [src: IW Formats/Mrp.cs:86, 298, 516-692; Drive frame.lua:30-34] |  |
| 0x01 | 1 | u8 | `type` | Entry type. [src: IW Formats/Mrp.cs:87, 299] Sheet: sheet column O [MRPD]. | `MrpeEntryTypeList` |
| 0x02 | 1 | u8 | `index` | Entry index inside its group (writers emit 0, 1, 2 ...). [src: IW Formats/Mrp.cs:88, 300] Sheet: sheet column I "Entry No." [MRPD]. |  |
| 0x03 | 1 | bf8 | `flags` | Entry flags; bit 4 = visible. Other bits not named (preserve them). [src: IW Formats/Mrp.cs:95-96, 301] | bits below |
| 0x04 | 2 | s16 | `x` | X position (screen units, relative to the group). [src: IW Formats/Mrp.cs:97, 302; Drive layout.lua:51-57] Sheet: sheet column K [MRPD]. |  |
| 0x06 | 2 | s16 | `y` | Y position. [src: IW Formats/Mrp.cs:98, 303] Sheet: sheet column L [MRPD]. |  |
| 0x08 | 2 | u16 | `width` | Width. [src: IW Formats/Mrp.cs:99, 304; Drive layout.lua:51-57] Sheet: sheet column M [MRPD]. |  |
| 0x0A | 2 | u16 | `height` | Height. [src: IW Formats/Mrp.cs:100, 305] Sheet: sheet column N [MRPD]. |  |
| 0x0C | 2 | u16 | `textureFileLink` | Texture to draw: index into this MRP's texture list (presumably). [src: IW Formats/Mrp.cs:113, 316] Sheet: sheet column P "Texture File" (index into the per-file texture legend, columns AG/AH) [MRPD]. |  |
| 0x0E | 1 | u8 | `iconGroupLink` | Icon group inside that TIM2's eXt icon table. [src: IW Formats/Mrp.cs:114, 317] |  |
| 0x0F | 1 | u8 | `iconSectionLink` | Icon section inside the TIM2 eXt icon table. [src: IW Formats/Mrp.cs:115, 318] |  |
| 0x10 | 2 | u16 | `iconEntryLink` | Icon entry inside the group. [src: IW Formats/Mrp.cs:116, 319] |  |
| 0x12 | 2 | u16 | `customClutLink` | Custom CLUT override. [src: IW Formats/Mrp.cs:117, 320] |  |
| 0x14 | 1 | u8 | `topLeftRed` | Red 0-255. [src: IW Formats/Mrp.cs:118-121; Drive frame.lua:62-70] Sheet: sheet columns W-Z, RGBA row 1 of the entry [MRPD]. |  |
| 0x15 | 1 | u8 | `topLeftGreen` | Green. Sheet: sheet columns W-Z, RGBA row 1 of the entry [MRPD]. |  |
| 0x16 | 1 | u8 | `topLeftBlue` | Blue. Sheet: sheet columns W-Z, RGBA row 1 of the entry [MRPD]. |  |
| 0x17 | 1 | u8 | `topLeftAlpha` | Alpha. Sheet: sheet columns W-Z, RGBA row 1 of the entry [MRPD]. |  |
| 0x18 | 1 | u8 | `topRightRed` | Red 0-255. [src: IW Formats/Mrp.cs:122-125] Sheet: sheet columns W-Z, RGBA row 2 of the entry [MRPD]. |  |
| 0x19 | 1 | u8 | `topRightGreen` | Green. Sheet: sheet columns W-Z, RGBA row 2 of the entry [MRPD]. |  |
| 0x1A | 1 | u8 | `topRightBlue` | Blue. Sheet: sheet columns W-Z, RGBA row 2 of the entry [MRPD]. |  |
| 0x1B | 1 | u8 | `topRightAlpha` | Alpha. Sheet: sheet columns W-Z, RGBA row 2 of the entry [MRPD]. |  |
| 0x1C | 1 | u8 | `bottomLeftRed` | Red 0-255. [src: IW Formats/Mrp.cs:126-129] Sheet: sheet columns W-Z, RGBA row 3 of the entry [MRPD]. |  |
| 0x1D | 1 | u8 | `bottomLeftGreen` | Green. Sheet: sheet columns W-Z, RGBA row 3 of the entry [MRPD]. |  |
| 0x1E | 1 | u8 | `bottomLeftBlue` | Blue. Sheet: sheet columns W-Z, RGBA row 3 of the entry [MRPD]. |  |
| 0x1F | 1 | u8 | `bottomLeftAlpha` | Alpha. Sheet: sheet columns W-Z, RGBA row 3 of the entry [MRPD]. |  |
| 0x20 | 1 | u8 | `bottomRightRed` | Red 0-255. [src: IW Formats/Mrp.cs:130-133] Sheet: sheet columns W-Z, RGBA row 4 of the entry [MRPD]. |  |
| 0x21 | 1 | u8 | `bottomRightGreen` | Green. Sheet: sheet columns W-Z, RGBA row 4 of the entry [MRPD]. |  |
| 0x22 | 1 | u8 | `bottomRightBlue` | Blue. Sheet: sheet columns W-Z, RGBA row 4 of the entry [MRPD]. |  |
| 0x23 | 1 | u8 | `bottomRightAlpha` | Alpha. Sheet: sheet columns W-Z, RGBA row 4 of the entry [MRPD]. |  |

#### Bits of `entryType2.flags` (bf8 at 0x03; bit 0 = least significant)

| Bit(s) | Name | Enum / meaning |
|---|---|---|
| 4 | `isVisible` |  |

### Record `entryType4` — 28 bytes (0x1C), count: per group

*Where:* type == 4 ("Container")

| Offset | Size | Type | Name | Meaning (source) | Enum |
|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `size` | Size of this entry in bytes (the walker adds it to reach the next entry). Fixed per type: 1=0x10, 2=0x24, 4=0x1C, 5=0x18, 6=0x18, 7=0x48, 8=0x2C. [src: IW Formats/Mrp.cs:86, 298, 516-692; Drive frame.lua:30-34] |  |
| 0x01 | 1 | u8 | `type` | Entry type. [src: IW Formats/Mrp.cs:87, 299] Sheet: sheet column O [MRPD]. | `MrpeEntryTypeList` |
| 0x02 | 1 | u8 | `index` | Entry index inside its group (writers emit 0, 1, 2 ...). [src: IW Formats/Mrp.cs:88, 300] Sheet: sheet column I "Entry No." [MRPD]. |  |
| 0x03 | 1 | bf8 | `flags` | Entry flags; bit 4 = visible. Other bits not named (preserve them). [src: IW Formats/Mrp.cs:95-96, 301] | bits below |
| 0x04 | 2 | s16 | `x` | X position (screen units, relative to the group). [src: IW Formats/Mrp.cs:97, 302; Drive layout.lua:51-57] Sheet: sheet column K [MRPD]. |  |
| 0x06 | 2 | s16 | `y` | Y position. [src: IW Formats/Mrp.cs:98, 303] Sheet: sheet column L [MRPD]. |  |
| 0x08 | 2 | u16 | `width` | Width. [src: IW Formats/Mrp.cs:99, 304; Drive layout.lua:51-57] Sheet: sheet column M [MRPD]. |  |
| 0x0A | 2 | u16 | `height` | Height. [src: IW Formats/Mrp.cs:100, 305] Sheet: sheet column N [MRPD]. |  |
| 0x0C | 16 | bytes | `payload` | 16 bytes not interpreted (the Workshop writes zeros here - keep the original bytes instead). [src: IW Formats/Mrp.cs:145, 341] |  |

#### Bits of `entryType4.flags` (bf8 at 0x03; bit 0 = least significant)

| Bit(s) | Name | Enum / meaning |
|---|---|---|
| 4 | `isVisible` |  |

### Record `entryType5` — 24 bytes (0x18), count: per group

*Where:* type == 5 ("Text")

| Offset | Size | Type | Name | Meaning (source) | Enum |
|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `size` | Size of this entry in bytes (the walker adds it to reach the next entry). Fixed per type: 1=0x10, 2=0x24, 4=0x1C, 5=0x18, 6=0x18, 7=0x48, 8=0x2C. [src: IW Formats/Mrp.cs:86, 298, 516-692; Drive frame.lua:30-34] |  |
| 0x01 | 1 | u8 | `type` | Entry type. [src: IW Formats/Mrp.cs:87, 299] Sheet: sheet column O [MRPD]. | `MrpeEntryTypeList` |
| 0x02 | 1 | u8 | `index` | Entry index inside its group (writers emit 0, 1, 2 ...). [src: IW Formats/Mrp.cs:88, 300] Sheet: sheet column I "Entry No." [MRPD]. |  |
| 0x03 | 1 | bf8 | `flags` | Entry flags; bit 4 = visible. Other bits not named (preserve them). [src: IW Formats/Mrp.cs:95-96, 301] | bits below |
| 0x04 | 2 | s16 | `x` | X position (screen units, relative to the group). [src: IW Formats/Mrp.cs:97, 302; Drive layout.lua:51-57] Sheet: sheet column K [MRPD]. |  |
| 0x06 | 2 | s16 | `y` | Y position. [src: IW Formats/Mrp.cs:98, 303] Sheet: sheet column L [MRPD]. |  |
| 0x08 | 2 | u16 | `width` | Width. [src: IW Formats/Mrp.cs:99, 304; Drive layout.lua:51-57] Sheet: sheet column M [MRPD]. |  |
| 0x0A | 2 | u16 | `height` | Height. [src: IW Formats/Mrp.cs:100, 305] Sheet: sheet column N [MRPD]. |  |
| 0x0C | 1 | u8 | `colorRed` | Red 0-255. [src: IW Formats/Mrp.cs:157-160] Sheet: sheet columns W-Z [MRPD]. |  |
| 0x0D | 1 | u8 | `colorGreen` | Green. Sheet: sheet columns W-Z [MRPD]. |  |
| 0x0E | 1 | u8 | `colorBlue` | Blue. Sheet: sheet columns W-Z [MRPD]. |  |
| 0x0F | 1 | u8 | `colorAlpha` | Alpha. Sheet: sheet columns W-Z [MRPD]. |  |
| 0x10 | 1 | u8 | `scale` | Text scale. [src: IW Formats/Mrp.cs:161] Sheet: sheet column AA "Scale" (100 typical) [MRPD]. |  |
| 0x11 | 1 | u8 | `textStyle` | Text style. [src: IW Formats/Mrp.cs:162] Sheet: sheet column AB "Fill" (values 0, 1, 16, 19, 20 seen) [MRPD]. |  |
| 0x12 | 2 | u16 | `unknown12` | Unknown (round-tripped by the Workshop). [src: IW Formats/Mrp.cs:163] |  |
| 0x14 | 4 | s32 | `textLink` | Text reference (which text table it indexes is not documented). [src: IW Formats/Mrp.cs:164] |  |

#### Bits of `entryType5.flags` (bf8 at 0x03; bit 0 = least significant)

| Bit(s) | Name | Enum / meaning |
|---|---|---|
| 4 | `isVisible` |  |

### Record `entryType6` — 24 bytes (0x18), count: per group

*Where:* type == 6 ("Unknown (0x06)")

| Offset | Size | Type | Name | Meaning (source) | Enum |
|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `size` | Size of this entry in bytes (the walker adds it to reach the next entry). Fixed per type: 1=0x10, 2=0x24, 4=0x1C, 5=0x18, 6=0x18, 7=0x48, 8=0x2C. [src: IW Formats/Mrp.cs:86, 298, 516-692; Drive frame.lua:30-34] |  |
| 0x01 | 1 | u8 | `type` | Entry type. [src: IW Formats/Mrp.cs:87, 299] Sheet: sheet column O [MRPD]. | `MrpeEntryTypeList` |
| 0x02 | 1 | u8 | `index` | Entry index inside its group (writers emit 0, 1, 2 ...). [src: IW Formats/Mrp.cs:88, 300] Sheet: sheet column I "Entry No." [MRPD]. |  |
| 0x03 | 1 | bf8 | `flags` | Entry flags; bit 4 = visible. Other bits not named (preserve them). [src: IW Formats/Mrp.cs:95-96, 301] | bits below |
| 0x04 | 2 | s16 | `x` | X position (screen units, relative to the group). [src: IW Formats/Mrp.cs:97, 302; Drive layout.lua:51-57] Sheet: sheet column K [MRPD]. |  |
| 0x06 | 2 | s16 | `y` | Y position. [src: IW Formats/Mrp.cs:98, 303] Sheet: sheet column L [MRPD]. |  |
| 0x08 | 2 | u16 | `width` | Width. [src: IW Formats/Mrp.cs:99, 304; Drive layout.lua:51-57] Sheet: sheet column M [MRPD]. |  |
| 0x0A | 2 | u16 | `height` | Height. [src: IW Formats/Mrp.cs:100, 305] Sheet: sheet column N [MRPD]. |  |
| 0x0C | 12 | bytes | `payload` | 12 bytes not interpreted (Workshop writes zeros - keep the original bytes). [src: IW Formats/Mrp.cs:176, 358] |  |

#### Bits of `entryType6.flags` (bf8 at 0x03; bit 0 = least significant)

| Bit(s) | Name | Enum / meaning |
|---|---|---|
| 4 | `isVisible` |  |

### Record `entryType7` — 72 bytes (0x48), count: per group

*Where:* type == 7 ("Progress Bar")

| Offset | Size | Type | Name | Meaning (source) | Enum |
|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `size` | Size of this entry in bytes (the walker adds it to reach the next entry). Fixed per type: 1=0x10, 2=0x24, 4=0x1C, 5=0x18, 6=0x18, 7=0x48, 8=0x2C. [src: IW Formats/Mrp.cs:86, 298, 516-692; Drive frame.lua:30-34] |  |
| 0x01 | 1 | u8 | `type` | Entry type. [src: IW Formats/Mrp.cs:87, 299] Sheet: sheet column O [MRPD]. | `MrpeEntryTypeList` |
| 0x02 | 1 | u8 | `index` | Entry index inside its group (writers emit 0, 1, 2 ...). [src: IW Formats/Mrp.cs:88, 300] Sheet: sheet column I "Entry No." [MRPD]. |  |
| 0x03 | 1 | bf8 | `flags` | Entry flags; bit 4 = visible. Other bits not named (preserve them). [src: IW Formats/Mrp.cs:95-96, 301] | bits below |
| 0x04 | 2 | s16 | `x` | X position (screen units, relative to the group). [src: IW Formats/Mrp.cs:97, 302; Drive layout.lua:51-57] Sheet: sheet column K [MRPD]. |  |
| 0x06 | 2 | s16 | `y` | Y position. [src: IW Formats/Mrp.cs:98, 303] Sheet: sheet column L [MRPD]. |  |
| 0x08 | 2 | u16 | `width` | Width. [src: IW Formats/Mrp.cs:99, 304; Drive layout.lua:51-57] Sheet: sheet column M [MRPD]. |  |
| 0x0A | 2 | u16 | `height` | Height. [src: IW Formats/Mrp.cs:100, 305] Sheet: sheet column N [MRPD]. |  |
| 0x0C | 2 | u16 | `textureFileLink` | Texture for the bar. [src: IW Formats/Mrp.cs:188] Sheet: sheet column P "Texture File" (index into the per-file texture legend, columns AG/AH) [MRPD]. |  |
| 0x0E | 1 | u8 | `iconGroupLink` | Icon group. [src: IW Formats/Mrp.cs:189] |  |
| 0x0F | 1 | u8 | `iconSectionLink` | Icon section. [src: IW Formats/Mrp.cs:190] |  |
| 0x10 | 2 | bytes | `unknown10` | Skipped by the Workshop (left as zero on write) - keep the original bytes. [src: IW Formats/Mrp.cs:191, 367] |  |
| 0x12 | 1 | u8 | `speed` | Animation speed. [src: IW Formats/Mrp.cs:192] |  |
| 0x13 | 1 | bf8 | `barFlags` | Bar flags; only bit 1 is known. [src: IW Formats/Mrp.cs:193-194, 363] | bits below |
| 0x14 | 2 | s16 | `backgroundX` | Layer X. [src: IW Formats/Mrp.cs:195-224] Sheet: sheet columns S-V of the "1st" Texture Rank row [MRPD]. |  |
| 0x16 | 2 | s16 | `backgroundY` | Layer Y. Sheet: sheet columns S-V of the "1st" Texture Rank row [MRPD]. |  |
| 0x18 | 1 | u8 | `backgroundOuterLeftIconGroupLink` | Left cap: icon group in the TIM2 eXt header. |  |
| 0x19 | 1 | u8 | `backgroundOuterLeftIconSectionLink` | Left cap: icon section. |  |
| 0x1A | 1 | u8 | `backgroundMiddleIconGroupLink` | Middle piece: icon group. |  |
| 0x1B | 1 | u8 | `backgroundMiddleIconSectionLink` | Middle piece: icon section. |  |
| 0x1C | 1 | u8 | `backgroundOuterRightIconGroupLink` | Right cap: icon group. |  |
| 0x1D | 1 | u8 | `backgroundOuterRightIconSectionLink` | Right cap: icon section. |  |
| 0x1E | 2 | u16 | `backgroundCustomClutLink` | Custom CLUT link. |  |
| 0x20 | 2 | u16 | `backgroundWidth` | Layer width. Sheet: sheet columns S-V of the "1st" Texture Rank row [MRPD]. |  |
| 0x22 | 2 | u16 | `backgroundHeight` | Layer height. Sheet: sheet columns S-V of the "1st" Texture Rank row [MRPD]. |  |
| 0x24 | 1 | u8 | `backgroundColorRed` | Red 0-255. Sheet: sheet columns W-Z of the "1st" row [MRPD]. |  |
| 0x25 | 1 | u8 | `backgroundColorGreen` | Green. Sheet: sheet columns W-Z of the "1st" row [MRPD]. |  |
| 0x26 | 1 | u8 | `backgroundColorBlue` | Blue. Sheet: sheet columns W-Z of the "1st" row [MRPD]. |  |
| 0x27 | 1 | u8 | `backgroundColorAlpha` | Alpha. Sheet: sheet columns W-Z of the "1st" row [MRPD]. |  |
| 0x28 | 2 | s16 | `foregroundX` | Layer X. [src: IW Formats/Mrp.cs:195-224] Sheet: sheet columns S-V of the "2nd" Texture Rank row [MRPD]. |  |
| 0x2A | 2 | s16 | `foregroundY` | Layer Y. Sheet: sheet columns S-V of the "2nd" Texture Rank row [MRPD]. |  |
| 0x2C | 1 | u8 | `foregroundOuterLeftIconGroupLink` | Left cap: icon group in the TIM2 eXt header. |  |
| 0x2D | 1 | u8 | `foregroundOuterLeftIconSectionLink` | Left cap: icon section. |  |
| 0x2E | 1 | u8 | `foregroundMiddleIconGroupLink` | Middle piece: icon group. |  |
| 0x2F | 1 | u8 | `foregroundMiddleIconSectionLink` | Middle piece: icon section. |  |
| 0x30 | 1 | u8 | `foregroundOuterRightIconGroupLink` | Right cap: icon group. |  |
| 0x31 | 1 | u8 | `foregroundOuterRightIconSectionLink` | Right cap: icon section. |  |
| 0x32 | 2 | u16 | `foregroundCustomClutLink` | Custom CLUT link. |  |
| 0x34 | 2 | u16 | `foregroundWidth` | Layer width. Sheet: sheet columns S-V of the "2nd" Texture Rank row [MRPD]. |  |
| 0x36 | 2 | u16 | `foregroundHeight` | Layer height. Sheet: sheet columns S-V of the "2nd" Texture Rank row [MRPD]. |  |
| 0x38 | 1 | u8 | `foregroundColorRed` | Red 0-255. Sheet: sheet columns W-Z of the "2nd" row [MRPD]. |  |
| 0x39 | 1 | u8 | `foregroundColorGreen` | Green. Sheet: sheet columns W-Z of the "2nd" row [MRPD]. |  |
| 0x3A | 1 | u8 | `foregroundColorBlue` | Blue. Sheet: sheet columns W-Z of the "2nd" row [MRPD]. |  |
| 0x3B | 1 | u8 | `foregroundColorAlpha` | Alpha. Sheet: sheet columns W-Z of the "2nd" row [MRPD]. |  |
| 0x3C | 4 | f32 | `animatedScale` | Animated texture scale. [src: IW Formats/Mrp.cs:225] |  |
| 0x40 | 2 | u16 | `animatedTextureFileLink` | Animated texture file link. [src: IW Formats/Mrp.cs:226] |  |
| 0x42 | 1 | u8 | `animatedIconGroupLink` | Animated icon group. [src: IW Formats/Mrp.cs:227] |  |
| 0x43 | 1 | u8 | `animatedIconSectionLink` | Animated icon section. [src: IW Formats/Mrp.cs:228] |  |
| 0x44 | 1 | u8 | `animatedCustomClutLink` | Animated custom CLUT (one byte here). [src: IW Formats/Mrp.cs:229] |  |
| 0x45 | 1 | s8 | `animatedY` | Animated Y offset. [src: IW Formats/Mrp.cs:230] |  |
| 0x46 | 1 | u8 | `animatedHeight` | Animated height. [src: IW Formats/Mrp.cs:231] |  |
| 0x47 | 1 | u8 | `animatedBloom` | Bloom. [src: IW Formats/Mrp.cs:232] |  |

#### Bits of `entryType7.flags` (bf8 at 0x03; bit 0 = least significant)

| Bit(s) | Name | Enum / meaning |
|---|---|---|
| 4 | `isVisible` |  |

#### Bits of `entryType7.barFlags` (bf8 at 0x13; bit 0 = least significant)

| Bit(s) | Name | Enum / meaning |
|---|---|---|
| 1 | `unknownFlag0` |  |

### Record `entryType8` — 44 bytes (0x2C), count: per group

*Where:* type == 8 ("Grid")

| Offset | Size | Type | Name | Meaning (source) | Enum |
|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `size` | Size of this entry in bytes (the walker adds it to reach the next entry). Fixed per type: 1=0x10, 2=0x24, 4=0x1C, 5=0x18, 6=0x18, 7=0x48, 8=0x2C. [src: IW Formats/Mrp.cs:86, 298, 516-692; Drive frame.lua:30-34] |  |
| 0x01 | 1 | u8 | `type` | Entry type. [src: IW Formats/Mrp.cs:87, 299] Sheet: sheet column O [MRPD]. | `MrpeEntryTypeList` |
| 0x02 | 1 | u8 | `index` | Entry index inside its group (writers emit 0, 1, 2 ...). [src: IW Formats/Mrp.cs:88, 300] Sheet: sheet column I "Entry No." [MRPD]. |  |
| 0x03 | 1 | bf8 | `flags` | Entry flags; bit 4 = visible. Other bits not named (preserve them). [src: IW Formats/Mrp.cs:95-96, 301] | bits below |
| 0x04 | 2 | s16 | `x` | X position (screen units, relative to the group). [src: IW Formats/Mrp.cs:97, 302; Drive layout.lua:51-57] Sheet: sheet column K [MRPD]. |  |
| 0x06 | 2 | s16 | `y` | Y position. [src: IW Formats/Mrp.cs:98, 303] Sheet: sheet column L [MRPD]. |  |
| 0x08 | 2 | u16 | `width` | Width. [src: IW Formats/Mrp.cs:99, 304; Drive layout.lua:51-57] Sheet: sheet column M [MRPD]. |  |
| 0x0A | 2 | u16 | `height` | Height. [src: IW Formats/Mrp.cs:100, 305] Sheet: sheet column N [MRPD]. |  |
| 0x0C | 2 | u16 | `groupLink` | Group repeated in the grid cells. [src: IW Formats/Mrp.cs:244, 412] |  |
| 0x0E | 1 | u8 | `columns` | Grid columns. [src: IW Formats/Mrp.cs:245] Sheet: sheet column AC Notes ("Columns = c  Rows = r") [MRPD]. |  |
| 0x0F | 1 | u8 | `rows` | Grid rows. [src: IW Formats/Mrp.cs:246] Sheet: sheet column AC Notes ("Columns = c  Rows = r") [MRPD]. |  |
| 0x10 | 28 | bytes | `payload` | 28 bytes not interpreted (Workshop writes zeros - keep the original bytes). [src: IW Formats/Mrp.cs:247, 415] |  |

#### Bits of `entryType8.flags` (bf8 at 0x03; bit 0 = least significant)

| Bit(s) | Name | Enum / meaning |
|---|---|---|
| 4 | `isVisible` |  |

### Record `texture` — 16 bytes (0x10), count: header.textureCount

*Where:* header.textureListOffset + i*0x10

| Offset | Size | Type | Name | Meaning (source) | Enum |
|---|---|---|---|---|---|
| 0x00 | 14 | bytes | `name` | Texture (TIM2) file name, Shift-JIS, NUL-padded to 14 bytes. [src: IW Formats/Mrp.cs:46-56, 428-431; IW Helpers/BinaryHelper.cs:35-43] Sheet: sheet legend columns AG (index) / AH (name) [MRPD]. |  |
| 0x0E | 1 | u8 | `state` | Runtime state (Workshop writes 0). [src: IW Formats/Mrp.cs:57, 431] |  |
| 0x0F | 1 | u8 | `link` | Runtime link (Workshop writes 0). [src: IW Formats/Mrp.cs:57, 431] |  |

## Enums carried in the JSON spec

| Enum | Keys | Use |
|---|---|---|
| `MrpeEntryTypeList`, `MrpeMenuFileList`, `MrpePackSectionList`, `MrpeFileTypeList` | as in mrp | format enums |
| `MrpSheetEntryTypeMeaning` | 1-8 | what each entry type does, as documented |
| `MrpPackSectionSheetName` | pack section id | the sheet's section labels |
| `MrpGroups_<key>` | group ordinal | group descriptions per file/section |
| `MrpEntryLabels_<key>` | groupNo*1000 + entryNo | entry descriptions and notes |
| `MrpTextures_<key>` | texture index | texture (TIM2) names per file |

## Round-trip rules

- Keep the 4th magic byte (state) as found on disk (0); never save a live copy with state 1 and absolute pointers.
- Entry payload bytes that are not interpreted (types 4, 6, 8, the 2 bytes at type-7 +0x10) must be copied from the original: the Workshop writes zeros there, which is lossy.
- Keep each entry.size equal to its type's fixed size; the game walks entries by size.
- group.entryListOffset is relative to the group record; header offsets are relative to the file start.
- Texture list starts 16-aligned after the last entry; keep the original end-of-data offsets at +0x10/+0x18/+0x28 consistent with the file size (Workshop sets all three to the end offset).
- In-place edits of positions, sizes, colours, links and flags do not move anything and are safe.
- Group and entry names in the sheet are documentation only; they are not stored in the file.
- Entry labels in the MrpEntryLabels_* enums use key = groupNo*1000 + entryNo (a lookup key, not a stored value).

## Known unknowns

- Meaning of header pairs (+0x0C,+0x10), (+0x14,+0x18), (+0x24,+0x28) beyond "end offset" in Workshop output; whether vanilla files use them.
- Group flags/entry flags other than bit 4 (visible); group gap semantics.
- Payloads of types 4, 6, 8 (16/12/28 bytes) and type-5 unknown u16 and text link target.
- texture.state / texture.link meaning (runtime fields?).
- Pack section ids 14 and 15 are unnamed (Unknown (0x0E)/(0x0F)).
- textureFileLink: the sheet supports "index into this MRP's texture list" (Texture File values match the per-file legend), but the legend leaves many indices unnamed.
- Pack sections 0 (Controller Icons), 19, 21 and 22 are not documented in the sheet; 9-12 (Inventory, Gambits, Licenses, Config) are placeholders with no entries.
- Sections 13 ("Gimmicks?"), 14 and 15 are labelled only tentatively; 14/15 have identical layouts.
- Type 36 appears once (MRPD MRP Pack, 5 - Chocobo group 3 entry 2) and is probably a typo for 6 or 3.
- A group gap of 65442 (MRPD MRP Pack!H1070) suggests the Toolkit shows gap as u16 (= -94); the file field is s32 in spec mrp.
- The four RGBA rows of type-2 entries are assumed to be in record order (top-left, top-right, bottom-left, bottom-right).
