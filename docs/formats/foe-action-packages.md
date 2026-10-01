# Battlepack section 10 - foe action packages

Spec id: `foe-action-packages` · machine spec: [`foe-action-packages.json`](./foe-action-packages.json)

Section 10 of `battle_pack.bin` holds **action packages** (the Toolkit calls them action groups): weighted lists of
battlepack section 14 actions. A foe's AI entry whose action id is `0x8000 + n` picks one action from package *n* by
the listed chances. The binary layout is documented in
[`battlepack-s10-action-groups`](./battlepack-s10-action-groups.md) (from the Workshop's reader/writer); this spec adds
what the *Foe Actions* sheet shows about the vanilla table and gives the editor a self-contained JSON.

## What the sheet shows

| Fact | Source |
|---|---|
| 826 packages, numbered 0-825. | GS:FoeActions Section 10!A2:A827; GS:AI Action Packages!A3:A828 |
| Each package's "actionObject" is 32768 + package number (0x8000 + n) - the id an AI entry uses to call it. | GS:FoeActions Section 10!B |
| Up to 12 (action, chance) pairs per package (columns "0. ID / Action / Chance" .. "11. ..."); package 34 uses all 12. | GS:FoeActions Section 10!G1:AP1, row 36 |
| The chances of every package add up to 100 (check column AQ = 100 on every row). | GS:FoeActions Section 10!AQ |
| Actions are section 14 rows: 150 Attack, 427 Ram, 18 Fire, 23 Fira, 429 Lunge ... | GS:FoeActions Section 10!G-H |
| Cross-reference columns list which enemies, AI scripts (by ARD), ARDs and zones call the package; packages 0-16 are listed with ARD "none". | GS:FoeActions Section 10!C-F |
| The tab "Enemy Action Counts" counts, per action, how many ARD AI entries and how many section 10 entries use it (e.g. Fira: 31 ARD entries, 64 package entries); its "Shop ID" column is the magick content id 0x3000 + n, not a shop. | GS:FoeActions Enemy Action Counts!A-E |
| The AI sheet's "Action Packages" tab is the same table. | GS:AI Action Packages |

## Container

```
+0x00            u32  packageCount              (826 in vanilla)
+0x04            u32  packageOffset[0..826]     section-relative; [826] = end of entry data
+0xCF0           package 0 entries              (4 + 4*827 = 0xCF0, already a multiple of 16)
                 package 1 entries ...          back to back, no padding between packages
end              zero padding to a multiple of 16
```

The section sits in `battle_pack.bin` (`ps2data/image/ff12/test_battle/<lang>/binaryfile/`), see
[`container-battlepack`](./container-battlepack.md). Offsets inside the section are relative to the section start.

## Record layouts

All multi-byte values are little-endian.

### Record `header` - 4 bytes (0x4), count: 1

*Where:* Offset 0 of battlepack section 10 (no st2e header).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | u32 | `packageCount` | Number of packages; 826 in vanilla (packages 0-825). The offset table that follows has packageCount + 1 words. |  | GS:FoeActions Section 10!A2:A827; GS:AI Action Packages!A3:A828; battlepack-s10-action-groups (IW ActionGroups.cs:23) |

### Record `packageOffset` - 4 bytes (0x4), count: header.packageCount + 1

*Where:* Section 10 offset 4 + 4*i.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | u32 | `offset` | Section-relative start of package i; the last word is the end of the entry data before the final padding. Entry count of package i = (offset[i+1] - offset[i]) / 4. |  | battlepack-s10-action-groups (IW ActionGroups.cs:24-46,59-78) |

### Record `packageEntry` - 4 bytes (0x4), count: (packageOffset[i+1] - packageOffset[i]) / 4 per package; 1-12 in vanilla

*Where:* Package i occupies [packageOffset[i], packageOffset[i+1]); packages are stored back to back from packageOffset[0] (no padding between them).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `action` | Battlepack section 14 action row picked by this entry (e.g. 150 Attack, 427 Ram, 18 Fire, 429 Lunge). | `BpActionList` | GS:FoeActions Section 10!G, J, M ... AN ("n. ID" / "n. Action"); IW ActionGroups.cs:41,65 |
| 0x02 | 2 | u16 | `chance` | Chance of this entry in percent; the entries of a package add up to 100 in every vanilla row (the sheet's check column AQ is 100 everywhere). |  | GS:FoeActions Section 10!I, L, O ... AP ("n. Chance") and AQ; IW ActionGroups.cs:42,66 |

### Decoded samples

| Package | AI action id | Entries (action chance) | Used by (sheet) |
|---|---|---|---|
| 0 | 0x8000 | 427 Ram 30, 150 Attack 70 | (none) |
| 1 | 0x8001 | 340 Sonic Fangs 20, 427 Ram 30, 150 Attack 50 | (none) |
| 15 | 0x800F | 22 Aero 1, 23 Fira 10, 24 Thundara 10, 25 Blizzara 10, 28 Firaga 10, 29 Thundaga 10, 30 Blizzaga 10, 33 Flare 10, 34 Ardor 10, 77 Darkra 10, 79 Gravity 9 | (none) |
| 17 | 0x8011 | 429 Lunge 20, 150 Attack 80 | Imperial Swordsman, Dalmascan Soldier ... in grm_b, naf_a, naf_b, nal_b, nal_c |
| 22 | 0x8016 | 342 Screech 10, 345 Eerie Soundwave 5, 429 Lunge 25, 340 Sonic Fangs 10, 150 Attack 50 | Mastiff, dor_c script 0 |
| 34 | 0x8022 | 76 Dark 15, 283 Aerora 15, 284 Aquara 15, 23 Fira 15, 25 Blizzara 15, 24 Thundara 15, 285 Aquaga 1, 77 Darkra 2, 27 Aeroga 1, 28 Firaga 2, 30 Blizzaga 2, 29 Thundaga 2 (12 entries) | Helm-Rook, bhm_a script 7 and tri_l script 3 |

Source: GS:FoeActions Section 10 rows 2-37.

## Count and size rules

- Entries of package i = (packageOffset[i+1] - packageOffset[i]) / 4; 1-12 in vanilla.
- Section size = align16(4 + 4 x (packageCount + 1)) + 4 x (total entries), padded to 16.
- AI id of package n = 0x8000 + n; the largest vanilla id is 0x8339 (package 825).

## Pointers to fix when sizes change

1. Entry added/removed in package i: packageOffset[i+1 .. packageCount] += / -= 4.
2. Package appended: packageCount + 1, the table grows by 4 bytes (re-align to 16), every offset is recomputed.
3. Section length changed: later battlepack section offsets and the pack's end offset move (container-battlepack).
4. ARD AI entries (section 3 `action` = 0x8000 + n) keep pointing at the same n, so never renumber packages.

## Text

No strings and no text ids.

## Round-trip rules

- Edit action and chance in place; nothing moves.
- Keep the chances of each package summing to 100 (true for every vanilla package); behaviour for other sums is unknown.
- Packages are addressed by position (AI action id 0x8000 + index): append new packages at the end, never reorder or delete.
- Adding or removing an entry in package i moves packageOffset[i+1 ..] and the end word by 4 per entry; adding a package grows the offset table by 4 bytes and moves every offset.
- Section layout: header and offset table, zero padding to 16, packages back to back, zero padding to 16; then shift the later battlepack section offsets by the padded size change (container-battlepack).
- With 826 packages the header plus table is 4 + 4 x 827 = 3312 bytes (0xCF0), already 16-aligned, so package 0 starts at 0xCF0 in a packed rebuild.

## Known unknowns

- Only the first 36 of the 826 package rows were readable through the Drive connector; the maximum of 12 entries per package comes from the sheet's column layout (Action 0 .. Action 11) and package 34 (12 entries).
- Whether the game requires the chances to add up to 100, or treats them as weights.
- Whether entries can hold AI command ids (0x4000+) instead of section 14 rows (all vanilla samples are section 14 rows).
- Packages 0-16 have no enemy, script or ARD in the sheet's cross-reference ("none"), i.e. no vanilla ARD entry uses them according to the sheet; whether the game uses them elsewhere (e.g. espers or guests) is not stated.
- The Toolkit list BattleLogicActionList names 0x8000-0x8337 "Action Group 0-823" and then labels 0x8338 "Action Group 825"; with 826 packages 0x8338 is package 824 and 0x8339 (package 825) is missing from that list. enums-ai-actions carries corrected labels.
- Whether vanilla pads the table exactly to 16 before package 0 (the Workshop writer does).

## Source keys

| Key | Source |
|---|---|
| GS:FoeActions `<tab>!<column>` / row n | Google Sheet *Foe Actions* (Drive id `1FeMWCdnrlqL-ZCuUz0xCOPxbY4lNh08TVknjQCmn-dw`), tabs "Section 10" (A1:AQ827), "Enemy Action Counts" (A1:E172). Read through the Google Drive connector, which returns a column summary plus the first rows of each tab, not every row (see Known unknowns). Row numbers are sheet rows (row 1 = first header row). |
| GS:AI `<tab>!<column>` / row n | Google Sheet *Vanilla AI Scripts* (Drive id `1BEXZsbvK0Ey5Yl5WpI58Es4nEXNnI3PSd0_Asi5DE48`), tabs "3:AI Scripts" (A1:Y50052), "Action Packages" (A1:AM828), "Data" (A1:F1729). Read through the Google Drive connector, which returns a column summary plus the first rows of each tab, not every row (see Known unknowns). Row numbers are sheet rows (row 1 = first header row). |
| battlepack-s10-action-groups, container-battlepack | Specs in this folder (their Workshop/Toolkit sources are cited there; IW Formats/Battlepack/ActionGroups.cs). |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| Lists: `<name>` | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json`. |
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (fact reference only; its licence forbids copying or converting its code). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
