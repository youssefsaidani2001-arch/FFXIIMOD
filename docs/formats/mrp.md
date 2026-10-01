# Menu Resource Pack (MRP) — .mrp files, mrppack_ys.bin sections, runtime pack list

Spec id: `mrp` · machine spec: [`mrp.json`](./mrp.json)

> **FILE FORMAT** (`.mrp`, sections of `mrppack_ys.bin`), plus the runtime list of loaded pack sections (marked MEMORY).

## What this is

An **MRP** ("Menu Resource Pack", magic `MRP`) is a 2-D UI layout: a list of texture names, a list of
**groups** (positioned boxes), and per group a run of variable-length **entries** (textures/icons, text,
progress bars, grids, containers). The pictures themselves are TIM2 files (see [`tim2`](./tim2.md)); MRP entries
point at icons inside a TIM2's `eXt` icon table by section/group/entry index.

| Item | Value | Source |
|---|---|---|
| Stand-alone files | `*.mrp`, e.g. the 10 menu files gameover, title, title_menu, save_load, e3_logo, quest, shop_new, w_menu, loca, party_book (Lists MrpeMenuFileList) | IW Resources/JsonFile.cs:24; TK L1140 |
| Pack | `mrppack_ys.bin` = otherpack with 23 MRP sections (Controller Icons ... Keyboard Icons); game file type 7 (Menu File), id 0xD3, hot-reloadable | IW Resources/PackFile.cs:25; TK L1139, L1423; container-otherpack |
| Runtime list | `0x0209AC60 + id*8` -> loaded MRP of pack section id (23 entries) | TK L411; Drive frame.lua:8-13 |
| Last loaded / menu files | the Toolkit hooks 0x0032E8C9 / 0x002A00FF to record the base of each loaded menu file and of the last-loaded MRP | TK L129, L1141 |
| VBF folder | not recorded; find `mrppack_ys.bin` / `*.mrp` by name | container-otherpack |

Encoding: little-endian. Texture names are Shift-JIS (IW Helpers/BinaryHelper.cs:35-43).

## Layout

```
0x00  header (0x30)            magic 'MRP', state, (count, offset) pairs
0x30  group[groupCount]        0x14 bytes each
      entries of group 0, then group 1, ... (variable-length records, size byte first)
      zero padding to 16
      texture[textureCount]    0x10 bytes each (name[14], state, link)
      (end of file = the offset stored at +0x10/+0x18/+0x28 in Workshop output)
```

* `group.entryListOffset` is relative to **the group record itself** on disk (IW Formats/Mrp.cs:79, :288).
  Header offsets are relative to the file start.
* Once loaded, the game rewrites header +0x08, +0x20 and every group +0x10 into **absolute 32-bit
  addresses** and sets the state byte to 1: mods read `u32 [mrp+0x20] + id*0x14` and `u32 [group+0x10]`
  directly as addresses (Drive frame.lua:17-34, Drive layout.lua:5-33, Drive helpers.lua:74-131).
  An exporter of a live MRP must convert them back (as the Toolkit's export actions do, TK L995).
* Entries have no table: entry *j* is found by walking `size` bytes from the first entry *j* times
  (TK L1145; Drive frame.lua:30-34).

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…` are not interpreted by any source; keep their original bytes. Overlapping rows are alternative views of the same bytes (the note says which applies).

### Record `header` — 48 bytes (0x30), count: 1

*Where:* File offset 0 (or start of an mrppack_ys.bin section).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 3 | bytes | `magic` | ASCII "MRP" (4D 52 50). |  | IW Formats/Mrp.cs:13, 32-35 |
| 0x03 | 1 | u8 | `state` | 0 on disk; the game sets it to 1 after loading (the Toolkit checks "MRP\x01" in memory). |  | IW Formats/Mrp.cs:37; TK L411, L1145 |
| 0x04 | 4 | u32 | `textureCount` | Number of texture-name records. |  | IW Formats/Mrp.cs:38; Drive helpers.lua:79 |
| 0x08 | 4 | u32 | `textureListOffset` | Offset of the texture-name list from the file start (absolute 32-bit address once loaded). Written after the groups and entries, 16-aligned. |  | IW Formats/Mrp.cs:39-40, 427; Drive helpers.lua:80, 126-130 |
| 0x0C | 4 | u32 | `list2Count` | Unknown; 0 in Workshop output. Probably the count of an unused list whose offset follows. |  | IW Formats/Mrp.cs:441 |
| 0x10 | 4 | u32 | `list2Offset` | End-of-data offset in Workshop output (offset after the texture list = file size). LowPriorityCitizen's in-memory builder treats it as the total size to allocate. |  | IW Formats/Mrp.cs:433, 442; Drive helpers.lua:137, 142 |
| 0x14 | 4 | u32 | `list3Count` | Unknown; 0 in Workshop output. |  | IW Formats/Mrp.cs:443 |
| 0x18 | 4 | u32 | `list3Offset` | End-of-data offset in Workshop output. |  | IW Formats/Mrp.cs:444 |
| 0x1C | 4 | u32 | `groupCount` | Number of groups. |  | IW Formats/Mrp.cs:62, 445; Drive frame.lua:17 |
| 0x20 | 4 | u32 | `groupListOffset` | Offset of the group list; 0x30 in Workshop output (groups follow the header). Absolute 32-bit address once loaded. |  | IW Formats/Mrp.cs:63, 446; Drive frame.lua:20 |
| 0x24 | 4 | u32 | `list4Count` | Unknown; 0 in Workshop output. |  | IW Formats/Mrp.cs:447 |
| 0x28 | 4 | u32 | `list4Offset` | End-of-data offset in Workshop output. |  | IW Formats/Mrp.cs:448 |
| 0x2C | 4 | u32 | `reserved2C` | Never written by the Workshop (stays 0). |  | IW Formats/Mrp.cs:435-448 |

### Record `group` — 20 bytes (0x14), count: header.groupCount

*Where:* header.groupListOffset + i*0x14

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `entryCount` | Number of entries in this group (max 255). |  | IW Formats/Mrp.cs:70, 271; Drive frame.lua:25 |
| 0x01 | 2 | u16 | `index` | Group index x 4 (Workshop writes i*4; LowPriorityCitizen writes 4*index too). |  | IW Formats/Mrp.cs:71, 272; Drive helpers.lua:98, 154 |
| 0x03 | 1 | bf8 | `flags` | Group flags; bit 4 = visible. | bits below | IW Formats/Mrp.cs:72-73, 269, 273 |
| 0x04 | 2 | s16 | `x` | Group X. |  | IW Formats/Mrp.cs:74, 274 |
| 0x06 | 2 | s16 | `y` | Group Y. |  | IW Formats/Mrp.cs:75, 275 |
| 0x08 | 2 | u16 | `width` | Group width. |  | IW Formats/Mrp.cs:76, 276 |
| 0x0A | 2 | u16 | `height` | Group height. |  | IW Formats/Mrp.cs:77, 277 |
| 0x0C | 4 | s32 | `gap` | Gap/spacing between entries (meaning beyond the name not documented). |  | IW Formats/Mrp.cs:78, 278 |
| 0x10 | 4 | u32 | `entryListOffset` | Offset of the first entry, RELATIVE TO THIS GROUP RECORD on disk; absolute 32-bit address once loaded. |  | IW Formats/Mrp.cs:79, 285-290; Drive helpers.lua:161; Drive frame.lua:28 |

#### Bits of `group.flags` (bf8 at 0x03; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 4 | `isVisible` |  |

### Record `entryType1` — 16 bytes (0x10), count: per group

*Where:* Inside a group's entry list where entry.type == 1. Entries are variable-length and must be walked: next = this + entry.size.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `size` | Size of this entry in bytes (the walker adds it to reach the next entry). Fixed per type: 1=0x10, 2=0x24, 4=0x1C, 5=0x18, 6=0x18, 7=0x48, 8=0x2C. |  | IW Formats/Mrp.cs:86, 298, 516-692; Drive frame.lua:30-34 |
| 0x01 | 1 | u8 | `type` | Entry type. | `MrpeEntryTypeList` | IW Formats/Mrp.cs:87, 299 |
| 0x02 | 1 | u8 | `index` | Entry index inside its group (writers emit 0, 1, 2 ...). |  | IW Formats/Mrp.cs:88, 300 |
| 0x03 | 1 | bf8 | `flags` | Entry flags; bit 4 = visible. Other bits not named (preserve them). | bits below | IW Formats/Mrp.cs:95-96, 301 |
| 0x04 | 2 | s16 | `x` | X position (screen units, relative to the group). |  | IW Formats/Mrp.cs:97, 302; Drive layout.lua:51-57 |
| 0x06 | 2 | s16 | `y` | Y position. |  | IW Formats/Mrp.cs:98, 303 |
| 0x08 | 2 | u16 | `width` | Width. |  | IW Formats/Mrp.cs:99, 304; Drive layout.lua:51-57 |
| 0x0A | 2 | u16 | `height` | Height. |  | IW Formats/Mrp.cs:100, 305 |
| 0x0C | 4 | u32 | `groupLink` | Link to another group (sub-group reference). The Toolkit lists type 1 as "Unknown (0x01)". |  | IW Formats/Mrp.cs:101, 311 |

#### Bits of `entryType1.flags` (bf8 at 0x03; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 4 | `isVisible` |  |

### Record `entryType2` — 36 bytes (0x24), count: per group

*Where:* type == 2 ("Texture")

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `size` | Size of this entry in bytes (the walker adds it to reach the next entry). Fixed per type: 1=0x10, 2=0x24, 4=0x1C, 5=0x18, 6=0x18, 7=0x48, 8=0x2C. |  | IW Formats/Mrp.cs:86, 298, 516-692; Drive frame.lua:30-34 |
| 0x01 | 1 | u8 | `type` | Entry type. | `MrpeEntryTypeList` | IW Formats/Mrp.cs:87, 299 |
| 0x02 | 1 | u8 | `index` | Entry index inside its group (writers emit 0, 1, 2 ...). |  | IW Formats/Mrp.cs:88, 300 |
| 0x03 | 1 | bf8 | `flags` | Entry flags; bit 4 = visible. Other bits not named (preserve them). | bits below | IW Formats/Mrp.cs:95-96, 301 |
| 0x04 | 2 | s16 | `x` | X position (screen units, relative to the group). |  | IW Formats/Mrp.cs:97, 302; Drive layout.lua:51-57 |
| 0x06 | 2 | s16 | `y` | Y position. |  | IW Formats/Mrp.cs:98, 303 |
| 0x08 | 2 | u16 | `width` | Width. |  | IW Formats/Mrp.cs:99, 304; Drive layout.lua:51-57 |
| 0x0A | 2 | u16 | `height` | Height. |  | IW Formats/Mrp.cs:100, 305 |
| 0x0C | 2 | u16 | `textureFileLink` | Texture to draw: index into this MRP's texture list (presumably). |  | IW Formats/Mrp.cs:113, 316 |
| 0x0E | 1 | u8 | `iconGroupLink` | Icon group inside that TIM2's eXt icon table. |  | IW Formats/Mrp.cs:114, 317 |
| 0x0F | 1 | u8 | `iconSectionLink` | Icon section inside the TIM2 eXt icon table. |  | IW Formats/Mrp.cs:115, 318 |
| 0x10 | 2 | u16 | `iconEntryLink` | Icon entry inside the group. |  | IW Formats/Mrp.cs:116, 319 |
| 0x12 | 2 | u16 | `customClutLink` | Custom CLUT override. |  | IW Formats/Mrp.cs:117, 320 |
| 0x14 | 1 | u8 | `topLeftRed` | Red 0-255. |  | IW Formats/Mrp.cs:118-121; Drive frame.lua:62-70 |
| 0x15 | 1 | u8 | `topLeftGreen` | Green. |  |  |
| 0x16 | 1 | u8 | `topLeftBlue` | Blue. |  |  |
| 0x17 | 1 | u8 | `topLeftAlpha` | Alpha. |  |  |
| 0x18 | 1 | u8 | `topRightRed` | Red 0-255. |  | IW Formats/Mrp.cs:122-125 |
| 0x19 | 1 | u8 | `topRightGreen` | Green. |  |  |
| 0x1A | 1 | u8 | `topRightBlue` | Blue. |  |  |
| 0x1B | 1 | u8 | `topRightAlpha` | Alpha. |  |  |
| 0x1C | 1 | u8 | `bottomLeftRed` | Red 0-255. |  | IW Formats/Mrp.cs:126-129 |
| 0x1D | 1 | u8 | `bottomLeftGreen` | Green. |  |  |
| 0x1E | 1 | u8 | `bottomLeftBlue` | Blue. |  |  |
| 0x1F | 1 | u8 | `bottomLeftAlpha` | Alpha. |  |  |
| 0x20 | 1 | u8 | `bottomRightRed` | Red 0-255. |  | IW Formats/Mrp.cs:130-133 |
| 0x21 | 1 | u8 | `bottomRightGreen` | Green. |  |  |
| 0x22 | 1 | u8 | `bottomRightBlue` | Blue. |  |  |
| 0x23 | 1 | u8 | `bottomRightAlpha` | Alpha. |  |  |

#### Bits of `entryType2.flags` (bf8 at 0x03; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 4 | `isVisible` |  |

### Record `entryType4` — 28 bytes (0x1C), count: per group

*Where:* type == 4 ("Container")

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `size` | Size of this entry in bytes (the walker adds it to reach the next entry). Fixed per type: 1=0x10, 2=0x24, 4=0x1C, 5=0x18, 6=0x18, 7=0x48, 8=0x2C. |  | IW Formats/Mrp.cs:86, 298, 516-692; Drive frame.lua:30-34 |
| 0x01 | 1 | u8 | `type` | Entry type. | `MrpeEntryTypeList` | IW Formats/Mrp.cs:87, 299 |
| 0x02 | 1 | u8 | `index` | Entry index inside its group (writers emit 0, 1, 2 ...). |  | IW Formats/Mrp.cs:88, 300 |
| 0x03 | 1 | bf8 | `flags` | Entry flags; bit 4 = visible. Other bits not named (preserve them). | bits below | IW Formats/Mrp.cs:95-96, 301 |
| 0x04 | 2 | s16 | `x` | X position (screen units, relative to the group). |  | IW Formats/Mrp.cs:97, 302; Drive layout.lua:51-57 |
| 0x06 | 2 | s16 | `y` | Y position. |  | IW Formats/Mrp.cs:98, 303 |
| 0x08 | 2 | u16 | `width` | Width. |  | IW Formats/Mrp.cs:99, 304; Drive layout.lua:51-57 |
| 0x0A | 2 | u16 | `height` | Height. |  | IW Formats/Mrp.cs:100, 305 |
| 0x0C | 16 | bytes | `payload` | 16 bytes not interpreted (the Workshop writes zeros here - keep the original bytes instead). |  | IW Formats/Mrp.cs:145, 341 |

#### Bits of `entryType4.flags` (bf8 at 0x03; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 4 | `isVisible` |  |

### Record `entryType5` — 24 bytes (0x18), count: per group

*Where:* type == 5 ("Text")

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `size` | Size of this entry in bytes (the walker adds it to reach the next entry). Fixed per type: 1=0x10, 2=0x24, 4=0x1C, 5=0x18, 6=0x18, 7=0x48, 8=0x2C. |  | IW Formats/Mrp.cs:86, 298, 516-692; Drive frame.lua:30-34 |
| 0x01 | 1 | u8 | `type` | Entry type. | `MrpeEntryTypeList` | IW Formats/Mrp.cs:87, 299 |
| 0x02 | 1 | u8 | `index` | Entry index inside its group (writers emit 0, 1, 2 ...). |  | IW Formats/Mrp.cs:88, 300 |
| 0x03 | 1 | bf8 | `flags` | Entry flags; bit 4 = visible. Other bits not named (preserve them). | bits below | IW Formats/Mrp.cs:95-96, 301 |
| 0x04 | 2 | s16 | `x` | X position (screen units, relative to the group). |  | IW Formats/Mrp.cs:97, 302; Drive layout.lua:51-57 |
| 0x06 | 2 | s16 | `y` | Y position. |  | IW Formats/Mrp.cs:98, 303 |
| 0x08 | 2 | u16 | `width` | Width. |  | IW Formats/Mrp.cs:99, 304; Drive layout.lua:51-57 |
| 0x0A | 2 | u16 | `height` | Height. |  | IW Formats/Mrp.cs:100, 305 |
| 0x0C | 1 | u8 | `colorRed` | Red 0-255. |  | IW Formats/Mrp.cs:157-160 |
| 0x0D | 1 | u8 | `colorGreen` | Green. |  |  |
| 0x0E | 1 | u8 | `colorBlue` | Blue. |  |  |
| 0x0F | 1 | u8 | `colorAlpha` | Alpha. |  |  |
| 0x10 | 1 | u8 | `scale` | Text scale. |  | IW Formats/Mrp.cs:161 |
| 0x11 | 1 | u8 | `textStyle` | Text style. |  | IW Formats/Mrp.cs:162 |
| 0x12 | 2 | u16 | `unknown12` | Unknown (round-tripped by the Workshop). |  | IW Formats/Mrp.cs:163 |
| 0x14 | 4 | s32 | `textLink` | Text reference (which text table it indexes is not documented). |  | IW Formats/Mrp.cs:164 |

#### Bits of `entryType5.flags` (bf8 at 0x03; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 4 | `isVisible` |  |

### Record `entryType6` — 24 bytes (0x18), count: per group

*Where:* type == 6 ("Unknown (0x06)")

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `size` | Size of this entry in bytes (the walker adds it to reach the next entry). Fixed per type: 1=0x10, 2=0x24, 4=0x1C, 5=0x18, 6=0x18, 7=0x48, 8=0x2C. |  | IW Formats/Mrp.cs:86, 298, 516-692; Drive frame.lua:30-34 |
| 0x01 | 1 | u8 | `type` | Entry type. | `MrpeEntryTypeList` | IW Formats/Mrp.cs:87, 299 |
| 0x02 | 1 | u8 | `index` | Entry index inside its group (writers emit 0, 1, 2 ...). |  | IW Formats/Mrp.cs:88, 300 |
| 0x03 | 1 | bf8 | `flags` | Entry flags; bit 4 = visible. Other bits not named (preserve them). | bits below | IW Formats/Mrp.cs:95-96, 301 |
| 0x04 | 2 | s16 | `x` | X position (screen units, relative to the group). |  | IW Formats/Mrp.cs:97, 302; Drive layout.lua:51-57 |
| 0x06 | 2 | s16 | `y` | Y position. |  | IW Formats/Mrp.cs:98, 303 |
| 0x08 | 2 | u16 | `width` | Width. |  | IW Formats/Mrp.cs:99, 304; Drive layout.lua:51-57 |
| 0x0A | 2 | u16 | `height` | Height. |  | IW Formats/Mrp.cs:100, 305 |
| 0x0C | 12 | bytes | `payload` | 12 bytes not interpreted (Workshop writes zeros - keep the original bytes). |  | IW Formats/Mrp.cs:176, 358 |

#### Bits of `entryType6.flags` (bf8 at 0x03; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 4 | `isVisible` |  |

### Record `entryType7` — 72 bytes (0x48), count: per group

*Where:* type == 7 ("Progress Bar")

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `size` | Size of this entry in bytes (the walker adds it to reach the next entry). Fixed per type: 1=0x10, 2=0x24, 4=0x1C, 5=0x18, 6=0x18, 7=0x48, 8=0x2C. |  | IW Formats/Mrp.cs:86, 298, 516-692; Drive frame.lua:30-34 |
| 0x01 | 1 | u8 | `type` | Entry type. | `MrpeEntryTypeList` | IW Formats/Mrp.cs:87, 299 |
| 0x02 | 1 | u8 | `index` | Entry index inside its group (writers emit 0, 1, 2 ...). |  | IW Formats/Mrp.cs:88, 300 |
| 0x03 | 1 | bf8 | `flags` | Entry flags; bit 4 = visible. Other bits not named (preserve them). | bits below | IW Formats/Mrp.cs:95-96, 301 |
| 0x04 | 2 | s16 | `x` | X position (screen units, relative to the group). |  | IW Formats/Mrp.cs:97, 302; Drive layout.lua:51-57 |
| 0x06 | 2 | s16 | `y` | Y position. |  | IW Formats/Mrp.cs:98, 303 |
| 0x08 | 2 | u16 | `width` | Width. |  | IW Formats/Mrp.cs:99, 304; Drive layout.lua:51-57 |
| 0x0A | 2 | u16 | `height` | Height. |  | IW Formats/Mrp.cs:100, 305 |
| 0x0C | 2 | u16 | `textureFileLink` | Texture for the bar. |  | IW Formats/Mrp.cs:188 |
| 0x0E | 1 | u8 | `iconGroupLink` | Icon group. |  | IW Formats/Mrp.cs:189 |
| 0x0F | 1 | u8 | `iconSectionLink` | Icon section. |  | IW Formats/Mrp.cs:190 |
| 0x10 | 2 | bytes | `unknown10` | Skipped by the Workshop (left as zero on write) - keep the original bytes. |  | IW Formats/Mrp.cs:191, 367 |
| 0x12 | 1 | u8 | `speed` | Animation speed. |  | IW Formats/Mrp.cs:192 |
| 0x13 | 1 | bf8 | `barFlags` | Bar flags; only bit 1 is known. | bits below | IW Formats/Mrp.cs:193-194, 363 |
| 0x14 | 2 | s16 | `backgroundX` | Layer X. |  | IW Formats/Mrp.cs:195-224 |
| 0x16 | 2 | s16 | `backgroundY` | Layer Y. |  |  |
| 0x18 | 1 | u8 | `backgroundOuterLeftIconGroupLink` | Left cap: icon group in the TIM2 eXt header. |  |  |
| 0x19 | 1 | u8 | `backgroundOuterLeftIconSectionLink` | Left cap: icon section. |  |  |
| 0x1A | 1 | u8 | `backgroundMiddleIconGroupLink` | Middle piece: icon group. |  |  |
| 0x1B | 1 | u8 | `backgroundMiddleIconSectionLink` | Middle piece: icon section. |  |  |
| 0x1C | 1 | u8 | `backgroundOuterRightIconGroupLink` | Right cap: icon group. |  |  |
| 0x1D | 1 | u8 | `backgroundOuterRightIconSectionLink` | Right cap: icon section. |  |  |
| 0x1E | 2 | u16 | `backgroundCustomClutLink` | Custom CLUT link. |  |  |
| 0x20 | 2 | u16 | `backgroundWidth` | Layer width. |  |  |
| 0x22 | 2 | u16 | `backgroundHeight` | Layer height. |  |  |
| 0x24 | 1 | u8 | `backgroundColorRed` | Red 0-255. |  |  |
| 0x25 | 1 | u8 | `backgroundColorGreen` | Green. |  |  |
| 0x26 | 1 | u8 | `backgroundColorBlue` | Blue. |  |  |
| 0x27 | 1 | u8 | `backgroundColorAlpha` | Alpha. |  |  |
| 0x28 | 2 | s16 | `foregroundX` | Layer X. |  | IW Formats/Mrp.cs:195-224 |
| 0x2A | 2 | s16 | `foregroundY` | Layer Y. |  |  |
| 0x2C | 1 | u8 | `foregroundOuterLeftIconGroupLink` | Left cap: icon group in the TIM2 eXt header. |  |  |
| 0x2D | 1 | u8 | `foregroundOuterLeftIconSectionLink` | Left cap: icon section. |  |  |
| 0x2E | 1 | u8 | `foregroundMiddleIconGroupLink` | Middle piece: icon group. |  |  |
| 0x2F | 1 | u8 | `foregroundMiddleIconSectionLink` | Middle piece: icon section. |  |  |
| 0x30 | 1 | u8 | `foregroundOuterRightIconGroupLink` | Right cap: icon group. |  |  |
| 0x31 | 1 | u8 | `foregroundOuterRightIconSectionLink` | Right cap: icon section. |  |  |
| 0x32 | 2 | u16 | `foregroundCustomClutLink` | Custom CLUT link. |  |  |
| 0x34 | 2 | u16 | `foregroundWidth` | Layer width. |  |  |
| 0x36 | 2 | u16 | `foregroundHeight` | Layer height. |  |  |
| 0x38 | 1 | u8 | `foregroundColorRed` | Red 0-255. |  |  |
| 0x39 | 1 | u8 | `foregroundColorGreen` | Green. |  |  |
| 0x3A | 1 | u8 | `foregroundColorBlue` | Blue. |  |  |
| 0x3B | 1 | u8 | `foregroundColorAlpha` | Alpha. |  |  |
| 0x3C | 4 | f32 | `animatedScale` | Animated texture scale. |  | IW Formats/Mrp.cs:225 |
| 0x40 | 2 | u16 | `animatedTextureFileLink` | Animated texture file link. |  | IW Formats/Mrp.cs:226 |
| 0x42 | 1 | u8 | `animatedIconGroupLink` | Animated icon group. |  | IW Formats/Mrp.cs:227 |
| 0x43 | 1 | u8 | `animatedIconSectionLink` | Animated icon section. |  | IW Formats/Mrp.cs:228 |
| 0x44 | 1 | u8 | `animatedCustomClutLink` | Animated custom CLUT (one byte here). |  | IW Formats/Mrp.cs:229 |
| 0x45 | 1 | s8 | `animatedY` | Animated Y offset. |  | IW Formats/Mrp.cs:230 |
| 0x46 | 1 | u8 | `animatedHeight` | Animated height. |  | IW Formats/Mrp.cs:231 |
| 0x47 | 1 | u8 | `animatedBloom` | Bloom. |  | IW Formats/Mrp.cs:232 |

#### Bits of `entryType7.flags` (bf8 at 0x03; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 4 | `isVisible` |  |

#### Bits of `entryType7.barFlags` (bf8 at 0x13; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 1 | `unknownFlag0` |  |

### Record `entryType8` — 44 bytes (0x2C), count: per group

*Where:* type == 8 ("Grid")

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `size` | Size of this entry in bytes (the walker adds it to reach the next entry). Fixed per type: 1=0x10, 2=0x24, 4=0x1C, 5=0x18, 6=0x18, 7=0x48, 8=0x2C. |  | IW Formats/Mrp.cs:86, 298, 516-692; Drive frame.lua:30-34 |
| 0x01 | 1 | u8 | `type` | Entry type. | `MrpeEntryTypeList` | IW Formats/Mrp.cs:87, 299 |
| 0x02 | 1 | u8 | `index` | Entry index inside its group (writers emit 0, 1, 2 ...). |  | IW Formats/Mrp.cs:88, 300 |
| 0x03 | 1 | bf8 | `flags` | Entry flags; bit 4 = visible. Other bits not named (preserve them). | bits below | IW Formats/Mrp.cs:95-96, 301 |
| 0x04 | 2 | s16 | `x` | X position (screen units, relative to the group). |  | IW Formats/Mrp.cs:97, 302; Drive layout.lua:51-57 |
| 0x06 | 2 | s16 | `y` | Y position. |  | IW Formats/Mrp.cs:98, 303 |
| 0x08 | 2 | u16 | `width` | Width. |  | IW Formats/Mrp.cs:99, 304; Drive layout.lua:51-57 |
| 0x0A | 2 | u16 | `height` | Height. |  | IW Formats/Mrp.cs:100, 305 |
| 0x0C | 2 | u16 | `groupLink` | Group repeated in the grid cells. |  | IW Formats/Mrp.cs:244, 412 |
| 0x0E | 1 | u8 | `columns` | Grid columns. |  | IW Formats/Mrp.cs:245 |
| 0x0F | 1 | u8 | `rows` | Grid rows. |  | IW Formats/Mrp.cs:246 |
| 0x10 | 28 | bytes | `payload` | 28 bytes not interpreted (Workshop writes zeros - keep the original bytes). |  | IW Formats/Mrp.cs:247, 415 |

#### Bits of `entryType8.flags` (bf8 at 0x03; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 4 | `isVisible` |  |

### Record `texture` — 16 bytes (0x10), count: header.textureCount

*Where:* header.textureListOffset + i*0x10

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 14 | bytes | `name` | Texture (TIM2) file name, Shift-JIS, NUL-padded to 14 bytes. |  | IW Formats/Mrp.cs:46-56, 428-431; IW Helpers/BinaryHelper.cs:35-43 |
| 0x0E | 1 | u8 | `state` | Runtime state (Workshop writes 0). |  | IW Formats/Mrp.cs:57, 431 |
| 0x0F | 1 | u8 | `link` | Runtime link (Workshop writes 0). |  | IW Formats/Mrp.cs:57, 431 |

### Record `packSectionPointer` — 8 bytes (0x8), count: 23

*Where:* MEMORY: static array at 0x0209AC60 + id*8, id 0-22 (MrpePackSectionList). Each u64 points at the loaded MRP of that mrppack_ys.bin section (0 when not loaded).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 8 | u64 | `mrpPointer` | Address of the loaded MRP header ("MRP\x01"). |  | TK L411, L1139; Drive frame.lua:8-13; Drive helpers.lua:6, 75 |

## Enums carried in the JSON spec

#### `MrpeEntryTypeList`

| Value | Label |
|---|---|
| 1 (0x1) | Unknown (0x01) |
| 2 (0x2) | Texture |
| 3 (0x3) | Unused (0x03) |
| 4 (0x4) | Container |
| 5 (0x5) | Text |
| 6 (0x6) | Unknown (0x06) |
| 7 (0x7) | Progress Bar |
| 8 (0x8) | Grid |
| 9 (0x9) | Unused (0x09) |

#### `MrpePackSectionList`

| Value | Label |
|---|---|
| 0 (0x0) | Controller Icons |
| 1 (0x1) | Battle / Field |
| 2 (0x2) | Minimap |
| 3 (0x3) | Quickening |
| 4 (0x4) | Level Up / Chain Level |
| 5 (0x5) | Chocobo |
| 6 (0x6) | Party Menu |
| 7 (0x7) | Menus (General) |
| 8 (0x8) | Equip |
| 9 (0x9) | Inventory |
| 10 (0xA) | Gambits |
| 11 (0xB) | Licenses |
| 12 (0xC) | Config |
| 13 (0xD) | Event Gauge |
| 14 (0xE) | Unknown (0x0E) |
| 15 (0xF) | Unknown (0x0F) |
| 16 (0x10) | Boss HP Bar |
| 17 (0x11) | New Game Tutorial |
| 18 (0x12) | Gil Counter |
| 19 (0x13) | License Board Selection |
| 20 (0x14) | Save / Load / Speed Icons |
| 21 (0x15) | On-Screen Keyboard |
| 22 (0x16) | Keyboard Icons |

#### `MrpeMenuFileList`

| Value | Label |
|---|---|
| 0 (0x0) | gameover |
| 1 (0x1) | title |
| 2 (0x2) | title_menu |
| 3 (0x3) | save_load |
| 4 (0x4) | e3_logo |
| 5 (0x5) | quest |
| 6 (0x6) | shop_new |
| 7 (0x7) | w_menu |
| 8 (0x8) | loca |
| 9 (0x9) | party_book |

#### `MrpeFileTypeList`

| Value | Label |
|---|---|
| 0 (0x0) | Pack |
| 1 (0x1) | Menu |
| 2 (0x2) | Last Loaded |

## Entry types

| Type | Size | Toolkit name | Payload (after the 12-byte common head) |
|---|---|---|---|
| 1 | 0x10 | Unknown (0x01) | u32 group link |
| 2 | 0x24 | Texture | texture file link, icon group/section/entry, custom CLUT, 4 corner colours |
| 3 | - | Unused (0x03) | never seen; the Workshop rejects it |
| 4 | 0x1C | Container | 16 unknown bytes |
| 5 | 0x18 | Text | colour, scale, style, unknown u16, s32 text link |
| 6 | 0x18 | Unknown (0x06) | 12 unknown bytes |
| 7 | 0x48 | Progress Bar | texture/icon, speed, flag, background layer, foreground layer, animated texture |
| 8 | 0x2C | Grid | u16 group link, columns, rows, 28 unknown bytes |
| 9 | - | Unused (0x09) | never seen |

(Types and sizes: IW Formats/Mrp.cs:90-251, :514-694; names: Lists MrpeEntryTypeList.)

## Pointers to fix up when sizes change

* Adding/removing entries changes the byte size of a group's entry run: recompute every later group's
  `entryListOffset` (each relative to its own group record), then `textureListOffset` (16-aligned after the
  last entry) and the end offsets at +0x10/+0x18/+0x28.
* Adding/removing groups shifts every entry run: recompute all `entryListOffset`s; `groupCount` and `index`
  (= 4 x position) of later groups.
* Inside `mrppack_ys.bin` the section's padded length changes: rebuild the otherpack offset list.
* Group/entry links (`groupLink`, grid `groupLink`) are group indices: renumbering groups requires rewriting them.

## Common edits

* Move/resize UI: change `x`, `y`, `width`, `height` of groups/entries in place (no size change). This is
  what the Toolkit's MRP editor and FehDead's layout scripts do live (Drive layout.lua:36-84; msg 41).
* Recolour: the four corner colours of type-2 entries (Drive frame.lua:59-71).
* Hide: clear `isVisible`.

## Round-trip rules

- Keep the 4th magic byte (state) as found on disk (0); never save a live copy with state 1 and absolute pointers.
- Entry payload bytes that are not interpreted (types 4, 6, 8, the 2 bytes at type-7 +0x10) must be copied from the original: the Workshop writes zeros there, which is lossy.
- Keep each entry.size equal to its type's fixed size; the game walks entries by size.
- group.entryListOffset is relative to the group record; header offsets are relative to the file start.
- Texture list starts 16-aligned after the last entry; keep the original end-of-data offsets at +0x10/+0x18/+0x28 consistent with the file size (Workshop sets all three to the end offset).
- In-place edits of positions, sizes, colours, links and flags do not move anything and are safe.

## Known unknowns

- Meaning of header pairs (+0x0C,+0x10), (+0x14,+0x18), (+0x24,+0x28) beyond "end offset" in Workshop output; whether vanilla files use them.
- Group flags/entry flags other than bit 4 (visible); group gap semantics.
- Payloads of types 4, 6, 8 (16/12/28 bytes) and type-5 unknown u16 and text link target.
- texture.state / texture.link meaning (runtime fields?).
- How textureFileLink maps to a texture (index into this MRP's texture list is assumed).
- Pack section ids 14 and 15 are unnamed (Unknown (0x0E)/(0x0F)).

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
| `frame.lua` | `1WCCaoKhH4ZzFAmsnqeD5DpotNFDaWs2j` |
| `helpers.lua` | `1A_zTIObZFhAMjcR5-KVZpdl709FYu2-K` (LowPriorityCitizen MRP helpers) |
| `layout.lua` | `1lHO43XTWbT7XWQov_KB2-mtTuH5-KBSZ` |
