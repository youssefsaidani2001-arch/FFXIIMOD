# Clan Primer global rules: `hcomg` (`menuhandbook.bin`)

One small file holds the cross-category Clan Primer and Sky Pirate's Den
rules:

* which maps count for the **Cartographer** figure (Old Dalan),
* how many bestiary entries the **Scrivener** figure (Ba'Gamnan) needs, plus
  per-entry exceptions,
* which hunts and hunt stages count for the clan rank,
* which foe to defeat for each of the ten "defeated foe" figures,
* a threshold value for each of the 30 figures that has one.

## Sources and citation keys

| Key | Meaning |
|---|---|
| `W:<file>:<line>` | The Insurgent's Workshop (`/home/user/xeavin/the-insurgents-workshop`), used for facts only, no code reused (licence: personal use only). `C:` below is short for `W:Formats/MenuHandBook/Hcomg.cs`. |
| `R:<line>` | `docs/research/insurgents_toolkit_reference.md`. |
| `D#<n>` | Discord export *wip-general*, message index `n`. |

## File

`menuhandbook.bin` (W:Resources/JsonFile.cs:80). It sits with the other
`menuhandbook_*` files (see `menuhandbook-hctgf.md`). The bestiary text is
under the `myoshiok` folder (D#1035). The exact path is not recorded.

## Byte order

Little-endian.

## Structure

A fixed head, then four blocks in a chain. **Every block begins with a u16
that gives the distance from that u16's own position to the start of the next
block.** The last block stores the distance to the end of the data instead
(C:62, :77, :108, :123, :133, :166, :187, :199, :209, :230).

```
0x00   head: magic, link, map count, 48-byte map bitmap
0x3C   Scrivener block      (link, required count, unused, n, n x 4-byte rules)
H      Hunt block           (link, n, n x 2-byte rules, pad to 4)
D      Defeated-foe block   (link, count, 10 x u16)
P      Figure block         (end distance, count, u32 mask, one s32 per set bit)
       zero padding to 16 = end of file
```

---

## 1. Head (0x3C bytes)

| Off | Size | Type | Name | Meaning | Source |
|---|---|---|---|---|---|
| 0x00 | 8 | bytes | magic | `hcomg` + 3 zero bytes = 68 63 6F 6D 67 00 00 00 | C:13, :58-61 |
| 0x08 | 2 | u16 | scrivenerBlockLink | Next block at 0x08 + value (0x34, giving 0x3C, in rebuilt files) | C:62, :152-153, :166, :233-234 |
| 0x0A | 2 | u16 | cartographerMapCount | 384. The reader ignores it because the count is fixed in the executable. | C:64-66, :154 |
| 0x0C | 48 | bytes | cartographerMapBits | Map *i* is required when bit `i % 8` of byte `i / 8` is set (least significant bit first) | C:67-74, :156-164, :37-40 |

## 2. Scrivener block (at `S` = 0x3C)

| Off | Size | Type | Name | Meaning | Source |
|---|---|---|---|---|---|
| S+0x00 | 2 | u16 | huntBlockLink | Hunt block at S + value | C:77, :167-168, :187, :235-236 |
| S+0x02 | 2 | u16 | requiredFoeCount | Bestiary entries needed for the Scrivener figure, at most 512 | C:18-19, :78, :169, :42-45 |
| S+0x04 | 2 | u16 | unused | Skipped; written as 0 | C:79, :170 |
| S+0x06 | 2 | u16 | ruleCount | Number of 4-byte rules that follow | C:81, :171 |
| S+0x08 | 4*n | rule[] | rules | See below | C:83-105, :172-185 |

Scrivener rule (4 bytes): "this bestiary entry counts only when ...".

| Off | Size | Type | Name | Meaning | Source |
|---|---|---|---|---|---|
| 0x00 | 2 | bf16 | packed | bits 0-11 `viewedBestiaryId`; bits 12-15 `requirementType` (0 = story progress, 1 = another bestiary entry). Other types are rejected by the reference reader. | C:85-102, :177, :181 |
| 0x02 | 2 | u16 | requirementValue | Type 0: required story progress value. Type 1: bestiary id that is required. | C:94, :99, :178, :182, :253-254, :270-271 |

The block has no padding. 8 + 4n keeps the hunt block 4-aligned.

## 3. Hunt block (at `H`)

| Off | Size | Type | Name | Meaning | Source |
|---|---|---|---|---|---|
| H+0x00 | 2 | u16 | defeatedFoeBlockLink | Next block at H + value | C:108, :188-189, :199, :237-238 |
| H+0x02 | 2 | u16 | huntCount | | C:110, :191 |
| H+0x04 | 2*n | rule[] | hunts | `u8 questId`, `u8 requiredQuestStage` per rule (the Workshop labels them "Clan Rank - Hunt Completion Requirements") | C:25-26, :112-120, :192-196, :315-319 |
| ... | | | | zero padding to 4 (file-absolute; the block start is 4-aligned) | C:197 |

## 4. Defeated-foe figure block (at `D`, 24 bytes)

| Off | Size | Type | Name | Meaning | Source |
|---|---|---|---|---|---|
| D+0x00 | 2 | u16 | figureBlockLink | Next block at D + value (= 24 when rebuilt) | C:123, :200-201, :209, :239-240 |
| D+0x02 | 2 | u16 | count | Written as 10. The reader skips it, because the count is fixed in the executable. | C:125-127, :203 |
| D+0x04 | 20 | u16[10] | bestiaryId | Slot *k* = the bestiary entry of the foe whose defeat awards figure 20 + *k* | C:127-130, :204-207 |

| Slot | Figure (index) |
|---|---|
| 0 | Trickster - Sharpshooter (20) |
| 1 | Gilgamesh - Master Swordsman (21) |
| 2 | Behemoth King - Lord of the Kings (22) |
| 3 | Fafnir - Wyrmslayer (23) |
| 4 | Carrot - Freshmaker (24) |
| 5 | Deathgaze - Eagle Eye (25) |
| 6 | Yiazmat - Hunter Extraordinaire (26) |
| 7 | Hell Wyrm - Radiant Savior (27) |
| 8 | Ultima - Fell Angel (28) |
| 9 | Zodiark - Zodiac Knight (29) |

(Figure names: C:322-354.)

## 5. Figure parameter block (at `P`, last block)

| Off | Size | Type | Name | Meaning | Source |
|---|---|---|---|---|---|
| P+0x00 | 2 | u16 | endLink | Distance from here to the end of the data, **before** the final padding | C:133, :210-211, :230, :241-242 |
| P+0x02 | 2 | u16 | count | Not reliable in vanilla files: the reference reader ignores it and counts the mask bits instead. Keep the stored value. | C:135-136, :213 |
| P+0x04 | 4 | bf32 | presenceMask | bit *i* set means figure *i* (0-29) has a parameter | C:137-145, :214-223 |
| P+0x08 | 4*m | s32[] | parameters | One value per set bit, in increasing bit order (m = number of set bits) | C:139-145, :225-228 |
| ... | | | | zero padding to 16 = end of file | C:231 |

What each value means (a step count, gil amount, chain length, etc.) depends
on the figure and is unverified.

### Figure indices (bit numbers of `presenceMask`)

| Bit | Figure | Bit | Figure |
|---|---|---|---|
| 0 | Balthier - Assault Striker | 15 | Old Dalan - Cartographer |
| 1 | Fran - Spellsinger | 16 | Ba'Gamnan - Scrivener |
| 2 | Vayne - Premier Prestidigitator | 17 | Reks - Record Breaker |
| 3 | Vaan - Master Thief | 18 | Montblanc - The Unrelenting |
| 4 | Basch - Blood Dancer | 19 | Mimic? - Collector |
| 5 | Chocobo - Wayfarer | 20 | Trickster - Sharpshooter |
| 6 | Penelo - Plunderer | 21 | Gilgamesh - Master Swordsman |
| 7 | Gurdy - Spendthrift | 22 | Behemoth King - Lord of the Kings |
| 8 | Ashe - Exemplar | 23 | Fafnir - Wyrmslayer |
| 9 | Crystal - Runeweaver | 24 | Carrot - Freshmaker |
| 10 | Vossler - Jack-of-All-Trades | 25 | Deathgaze - Eagle Eye |
| 11 | Rasler - Conqueror | 26 | Yiazmat - Hunter Extraordinaire |
| 12 | Belias - High Summoner | 27 | Hell Wyrm - Radiant Savior |
| 13 | Gabranth - Mist Walker | 28 | Ultima - Fell Angel |
| 14 | Migelo - Privateer | 29 | Zodiark - Zodiac Knight |

(C:322-354. "Mimic?" is marked uncertain in the source.)

---

## 6. Pointers to fix when sizes change

Only the Scrivener rule list and the hunt list change length.

| Change | Fix |
|---|---|
| Scrivener rules added or removed | `ruleCount`; `huntBlockLink` = 8 + 4n |
| Hunts added or removed | `huntCount`; `defeatedFoeBlockLink` = align4(4 + 2n) |
| Figure parameters added or removed | the mask bit; `endLink` = 8 + 4m; `count` (only when the original value matched the mask, otherwise leave it); final padding to 16 |
| Any of the above | Later blocks move, but their links are relative and their sizes are fixed, so only the link inside the changed block and the end padding change |

`scrivenerBlockLink` (0x34) and `figureBlockLink` (24) never change.

## 7. Round-trip rules

* Keep `cartographerMapCount` (384), the defeated-foe `count` (10), the
  Scrivener `unused` word, and the figure `count` as stored. The reference
  writer recomputes the last one, which differs from some vanilla files
  (C:135).
* Map bits are least significant bit first. All 384 bits are always present.
* Parameters are written in increasing bit order, matching the mask.
* `endLink` is measured to the end of data **without** the final padding.
  The file is then zero-padded to 16.
* Hunt list padding is zeros, to a 4-byte boundary.

## Known unknowns

* What each figure parameter means and its unit.
* What the hunt `questId` and `requiredQuestStage` numbers refer to (hunt
  list order or quest table).
* What scale the story-progress values use (presumably the main story
  counter).
* Whether vanilla `count` fields ever disagree with the data apart from the
  figure count.
* How these rules relate to the live Clan Primer structure the Toolkit edits
  (Traveler's Tips and Bestiary requirements at the loaded clan primer,
  R:1161-1166).
* Archive path of `menuhandbook.bin`.
