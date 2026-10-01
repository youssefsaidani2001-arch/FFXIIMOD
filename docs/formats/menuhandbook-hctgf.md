# Clan Primer category index: `hctgf` (`menuhandbook_<cat>.bin`)

Each Clan Primer category (the bestiary, the Traveler's Tips knowledge pages,
people, story, tutorials, world) has one small index file. The file lists the
category's headers (page or section titles), the entries under them, which
text table holds each entry's body, which picture it shows, and whether the
entry unlocks by itself. The actual strings live in the category's text
tables, and the pictures live in its `himgd` image packs (see
`container-himgd.md`, `tim2.md`).

## Sources and citation keys

| Key | Meaning |
|---|---|
| `W:<file>:<line>` | The Insurgent's Workshop (`/home/user/xeavin/the-insurgents-workshop`), used for facts only, no code reused (licence: personal use only). Main file: `Formats/MenuHandBook/Hctgf.cs` (`H:` below is short for `W:Formats/MenuHandBook/Hctgf.cs`). |
| `R:<line>` | `docs/research/insurgents_toolkit_reference.md`. |
| `D#<n>` | Discord export *wip-general*, message index `n`. |

## Files

| File | Category | Source |
|---|---|---|
| `menuhandbook_knowledge.bin` | Traveler's Tips / knowledge | W:Resources/JsonFile.cs:74 |
| `menuhandbook_monster.bin` | Bestiary | W:Resources/JsonFile.cs:75 |
| `menuhandbook_person.bin` | People | W:Resources/JsonFile.cs:76 |
| `menuhandbook_story.bin` | Story | W:Resources/JsonFile.cs:77 |
| `menuhandbook_tutorial.bin` | Tutorials | W:Resources/JsonFile.cs:78 |
| `menuhandbook_world.bin` | World | W:Resources/JsonFile.cs:79 |

Related files of the same category:

| Files | Kind | Source |
|---|---|---|
| `menuhandbook_knowledge000-001.dat`, `monster000-003.dat`, `person000.dat`, `story000.dat`, `tutorial000.dat`, `world000.dat` | FFXII text tables (external text tool) | W:Resources/OtherFile.cs:26-31 |
| `menuhandbook_knowledge002-029.dat`, `monster004-099.dat` (and possibly higher), `person001-029.dat`, `story001-099.dat`, `tutorial001-049.dat`, `world001-049.dat` | `himgd` packs of TIM2 images | W:Resources/PackFile.cs:30-35 |
| `menuhandbook.bin` | `hcomg` global rules (see `menuhandbook-hcomg.md`) | W:Resources/JsonFile.cs:80 |

Archive folder: the bestiary text tables are in the `myoshiok` folder
(D#1035). Other menu data sits under `ps2data/image/ff12/myoshiok/<lang>/`
(see `tim2.md`). The exact subfolder of the `menuhandbook` files is not
recorded. Hunt progress descriptions are a different text format (D#1040).

## Byte order

Little-endian.

---

## 1. Header (0x18 bytes)

| Off | Size | Type | Name | Meaning | Source |
|---|---|---|---|---|---|
| 0x00 | 8 | bytes | magic | `hctgf` + 3 zero bytes = 68 63 74 67 66 00 00 00 | H:12, :59-62 |
| 0x08 | 2 | u16 | type | Unknown (the reference names it "Type?") | H:14-15, :64, :163 |
| 0x0A | 2 | u16 | entryBasicInfoOffset | **Absolute** file offset of the entry table (section 5) | H:65, :123, :206, :232-233 |
| 0x0C | 2 | u16 | entryExtendedInfoOffset | **Absolute** file offset of the entry-picture table (section 4) | H:66, :112, :199, :234 |
| 0x0E | 2 | u16 | entryBasicInfoCount | Records in the entry table | H:67, :165 |
| 0x10 | 2 | u16 | entryExtendedInfoCount | Records in the entry-picture table | H:68, :166 |
| 0x12 | 2 | u16 | headerBasicInfoCount | Records in the header-name list (section 2) | H:69, :167 |
| 0x14 | 2 | u16 | imagesFileLinkOffset | Base number linking to the category's image (`himgd`) files | H:17-18, :70, :168 |
| 0x16 | 2 | u16 | imagesFileCount | Number of image files | H:20-21, :71, :169 |

Hypothesis, unverified: `imagesFileLinkOffset` is the `.dat` number of the
category's first himgd pack and `imagesFileCount` is the number of packs. The
reference file-name ranges would give knowledge 2/28, person 1/29, story 1/99,
tutorial 1/49, world 1/49 and monster 4/96+ (W:Resources/PackFile.cs:30-35).

## 2. Header names (`headerBasicInfo`, 4 bytes each, from 0x18)

| Off | Size | Type | Name | Meaning | Source |
|---|---|---|---|---|---|
| 0x00 | 4 | s32 | name | Number of the header's title string in the category text table (the exact numbering is unverified) | H:73-81, :171-174, :249-253 |

Count: `headerBasicInfoCount`. The list starts at 0x18, right after the header.

## 3. Header details block (`headerExtendedInfo`)

Starts right after the header names, at `B = 0x18 + 4 * headerBasicInfoCount`
(H:83). B is always 4-aligned.

| Block offset | Size | Type | Name | Meaning | Source |
|---|---|---|---|---|---|
| 0x00 | 2 | u16 | count | Number of items, C | H:84, :177 |
| 0x02 | 2*C | u16[] | itemOffset | Offset of item *k* **relative to B** | H:86-95, :236-240 |
| ... | | | | zero padding, then items | H:178-179 |

Item (at `B + itemOffset[k]`):

| Off | Size | Type | Name | Meaning | Source |
|---|---|---|---|---|---|
| 0x00 | 1 | bf8 | counts | bits 4-7 = `contentCount` (0-15); bits 0-3 unknown (the reference writer stores 0) | H:97, :185, :41-44 |
| 0x01 | 1 | u8 | locationCount | | H:98, :186 |
| 0x02 | 2*contentCount | u16[] | contents | Meaning unverified (perhaps the entries shown under this header) | H:99-102, :187-190 |
| ... | 2*locationCount | u16[] | locations | Meaning unverified (perhaps map or location numbers) | H:104-107, :192-195 |
| ... | | | | zero padding to 4 | H:196 |

Each item is `2 + 2*(contentCount + locationCount)` bytes, padded to 4.

**Padding before the first item.** The reference writer puts the count at B,
then 2 zero bytes, then reserves `2*C` bytes, so the first item starts at
`B + 4 + 2*C`. The offset list itself is written from B+2 (H:177-179,
:236-240). With an even C, this is the same as "pad the offset list to 4".
With an odd C, it leaves 2 more bytes than that rule would. Which rule
vanilla files follow is unknown. Since every item is addressed through its
stored offset, readers are unaffected; a byte-identical writer must reproduce
the original gap (keep the original first-item offset when C does not change).

## 4. Entry pictures (`entryExtendedInfo`, 2 bytes each)

At the absolute offset `entryExtendedInfoOffset`. The reference writer places
it right after the last header-details item, which ends 4-aligned (H:199).

| Off | Size | Type | Name | Meaning | Source |
|---|---|---|---|---|---|
| 0x00 | 2 | u16 | imageFileLink | Picture shown for the entry. Observed range is about 0-296 | H:111-120, :200-203, :288-291 |

Count: `entryExtendedInfoCount`. The table is zero padded to 4 (H:204).
`imageFileLink` is probably a running image number across the category's
`himgd` packs (each pack has several image slots). Unverified.

## 5. Entries (`entryBasicInfo`, 12 bytes each)

At the absolute offset `entryBasicInfoOffset` (4-aligned), which the
reference writer places right after the picture table (H:206).

| Off | Size | Type | Name | Meaning | Source |
|---|---|---|---|---|---|
| 0x00 | 4 | s32 | name | Number of the entry's title string | H:127, :210, :272-273 |
| 0x04 | 2 | u16 | headerBasicInfoLink | Index into the header names (section 2): the header this entry belongs to | H:128, :211, :275-276 |
| 0x06 | 2 | u16 | textFileLink | Which text table (`.dat`) holds the entry's body | H:129, :212, :278-279 |
| 0x08 | 2 | u16 | entryExtendedInfoLink | Index into the picture table (section 4) | H:130, :213, :281-282 |
| 0x0A | 1 | bf8 | flags | bit 0 = `autoUnlock` (the entry is available without a trigger). Bits 1-7 are unknown; the reference writer stores 0 | H:132-133, :209, :214, :284-285 |
| 0x0B | 1 | u8 | reserved | Skipped; written as 0 | H:134, :215 |

Count: `entryBasicInfoCount`.

## 6. Entry footer block (`entryFooterInfo`)

Starts right after the last entry: `F = entryBasicInfoOffset +
12 * entryBasicInfoCount` (H:139, :218).

| Block offset | Size | Type | Name | Meaning | Source |
|---|---|---|---|---|---|
| 0x00 | 2 | u16 | count | Number of footer items, K | H:140, :219 |
| 0x02 | 2*K | u16[] | itemOffset | Offset of item *k* **relative to F** | H:141-150, :242-246 |
| ... | | | | zero padding to the next 16-byte file boundary | H:221 |

Footer item (8 bytes, at `F + itemOffset[k]`):

| Off | Size | Type | Name | Meaning | Source |
|---|---|---|---|---|---|
| 0x00 | 1 | u8 | count | 0-7 | H:151-154, :227, :303-306 |
| 0x01 | 7 | bytes | tail | Not read. The reference writer stores zeros. A count limit of 7 next to 7 spare bytes suggests "count, then up to 7 one-byte values" (unverified). | H:228 |

The file ends with zero padding to 16 (H:230). What K counts (one per entry,
per header, or something else) is not known.

---

## 7. Layout summary (reference writer order)

```
0x00   header (24)
0x18   headerBasicInfo[H]                      4 each
B      headerExtended: count, offsets[C], gap, items (each padded to 4)
X      entryExtendedInfo[X]  (X = entryExtendedInfoOffset)   2 each, pad to 4
E      entryBasicInfo[E]     (E = entryBasicInfoOffset)      12 each
F      entryFooter: count, offsets[K], pad to 16, items 8 each, pad to 16
EOF
```

## 8. Pointers to fix when sizes change

| Change | Fix |
|---|---|
| Header names added or removed | `headerBasicInfoCount`; B moves, so `entryExtendedInfoOffset` and `entryBasicInfoOffset` move. `headerBasicInfoLink` values past the change need renumbering. |
| Header details item grows or shrinks | Its later `itemOffset` values (relative to B); both absolute table offsets |
| Picture table changes length | `entryExtendedInfoCount`; `entryBasicInfoOffset` (keep 4-alignment); `entryExtendedInfoLink` values past the change |
| Entry added or removed | `entryBasicInfoCount`; the footer block moves, but its offsets are relative to F, so they only change if the 16-byte padding after its offset list changes length |
| Footer items added or removed | `count` and every footer `itemOffset` |

Both absolute offsets are u16, so the file must stay below 64 KiB.

## 9. Round-trip rules

* Keep `type`, the unknown low nibble of the header-details `counts` byte,
  the unknown bits 1-7 of `flags`, the `reserved` byte, and the 7 `tail`
  bytes of each footer item. The reference writer zeroes all of these
  (H:185, :209-215, :227-228).
* Keep the original gap between the header-details offset list and its
  first item (section 3).
* Alignments: header-details items 4; picture table end 4; footer offset list
  end 16; footer items end 16 (end of file).
* Read every table through its stored offset; do not assume the writer order.

## Known unknowns

* `type`; `contents` and `locations` in the header details; what the footer
  items and their `tail` bytes mean; which string table `name` numbers refer
  to.
* How `imagesFileLinkOffset`, `imagesFileCount` and `imageFileLink` map onto
  himgd file numbers and slots.
* Vanilla padding between the header-details offset list and its first item
  when C is odd.
* Archive subfolder of the `menuhandbook_*` files.
* How the live Clan Primer structures the Toolkit edits (Traveler's Tips and
  Bestiary requirements, R:1161-1166) relate to these files.
