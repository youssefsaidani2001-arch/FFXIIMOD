# Battlepack section 39 — Shops

Spec id: `battlepack-s39-shops` · machine spec: [`battlepack-s39-shops.json`](./battlepack-s39-shops.json)

Battlepack **section 39** lists the 57 merchants and what they sell. It is **not** an st2e table: it is a
three-level tree of small lists linked by offsets — shops → stock events → content ids (TK L833, L978;
IW Shops.cs). A shop's stock is made of *events*: each event has an unlock condition (none, custom, story
progress, clan rank) and a list of content ids that join the stock once the condition holds. Prices are not
here: buy prices are the gil fields of the sold records themselves (e.g. section 13 `gil`), sell prices are
computed by the game (msg 693-694). The Workshop
maps `section_039.bin` here (IW Resources/JsonFile.cs:52).

## Container

### The battlepack container (`battle_pack.bin`)

Full container spec: [`container-battlepack.md`](./container-battlepack.md) (st2e details:
[`container-st2e.md`](./container-st2e.md) where present). Summary of what matters for this section:

- **Archive path:** `ps2data/image/ff12/test_battle/<lang>/binaryfile/battle_pack.bin` inside the game's VBF
  (msg 402 gives the `us` folder; the Workshop also recognises `in`, `kr`, `cn`, `ch` language folders,
  IW Helpers/PackHelper.cs:593-602). Each language folder carries its own copy.
- **Header:** `u32 sectionCount` at 0x00 (71 for `battle_pack.bin`, IW Resources/PackFile.cs:20), followed by
  `sectionCount + 1` `u32` offsets measured from the start of the file. The extra last offset is the end of the
  last section's data **before** the final padding (IW Helpers/PackHelper.cs:41-46, 87).
- **Sections:** section *i* occupies `[offset[i], offset[i+1])`. Every section starts on a 16-byte boundary;
  the gap is zero-filled, so a section's span includes its own trailing pad (IW Helpers/PackHelper.cs:51, 77).
  An empty section has `offset[i] == offset[i+1]`. The file ends with zero padding to a multiple of 16
  (IW Helpers/PackHelper.cs:88).
- **Resizing:** if a section's padded length changes, every later offset and the end offset move by the same
  delta; nothing else in the pack points across sections (the Workshop rebuilds the table from scratch,
  IW Helpers/PackHelper.cs:64-96).
- **Unpacked naming:** the Workshop writes section *i* as `battle_pack.bin.dir/section_<iii>.bin`
  (IW Helpers/PackHelper.cs:58); this spec's `files` glob includes that name for single-section editing.
- **In memory:** the game rewrites in-file offsets to absolute pointers after loading; the Toolkit's export
  converts them back before saving (TK L964-L976, L1794). Files on disk always hold offsets relative to the start of
  the section.


## Section layout (bespoke)

Every list in the tree is introduced by the same 12-byte header shape:

| Offset | Size | Type | Name | Meaning | Source |
|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `tag` | always 100 (0x64) | IW Shops.cs:13-15 |
| 0x02 | 2 | u16 | `level` | 0 = shop list, 1 = event list, 2 = content list | IW Shops.cs:13-15 |
| 0x04 | 2 | u16 | `elementSize` | stride of the list: 8 (shops), 8 (events), 2 (contents) | IW Shops.cs:12-15 |
| 0x06 | 2 | u16 | count | number of list elements | IW Shops.cs:35,55,74 |
| 0x08 | 4 | u32 | listOffset | offset of element 0 from the **start of section 39** | IW Shops.cs:36,56,75 |

The first six bytes are therefore a fixed signature per level — `64 00 00 00 08 00` (shops),
`64 00 01 00 08 00` (events), `64 00 02 00 02 00` (contents) — and the Workshop rejects a section whose
signatures differ (IW Shops.cs:29-32, 50-53, 69-72).

```
section 39
├─ shopTableHeader            @0      64 00 00 00 08 00 | shopCount | shopListOffset
├─ shop[0..shopCount-1]       8 B     ownerName u16 | unused u16 | eventTableOffset u32
├─ for each shop:
│   ├─ eventTableHeader       12 B    64 00 01 00 08 00 | eventCount | eventListOffset
│   ├─ event[0..eventCount-1] 8 B     condition u8 | condOffsetParam u8 | condParam u16 | contentTableOffset u32
│   └─ for each event:
│       ├─ contentTableHeader 12 B    64 00 02 00 02 00 | contentCount | contentListOffset
│       └─ contentId[...]     2 B each, then zero pad to a 4-byte boundary
└─ zero padding to a multiple of 16
```

The order shown is the one the Workshop's writer produces (shop list right after the header; then, per shop,
its event header, its events, and each event's content header + contents; IW Shops.cs:88-153). Readers must
not assume that order: every list is reached through its offset, and the vanilla file may order blocks
differently (unverified).

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…`/`unused…` are not interpreted by any source; keep their original bytes.

### Record `shopTableHeader` — 12 bytes (0xC), count: 1

*Where:* Offset 0 of battlepack section 39.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `tag` | Constant 100 (0x64) at every level of the tree. |  | IW Shops.cs:13-15 |
| 0x02 | 2 | u16 | `level` | Tree level: 0 (shop list). |  | IW Shops.cs:13-15 |
| 0x04 | 2 | u16 | `elementSize` | Stride of the list this header introduces: 8. |  | IW Shops.cs:13-15 |
| 0x06 | 2 | u16 | `shopCount` | Number of shops (57 in vanilla, TK L833). |  | IW Shops.cs:35,94 |
| 0x08 | 4 | u32 | `shopListOffset` | Offset of shop[0] from the section start (12 in a rebuilt file: the list follows the header). |  | IW Shops.cs:36,95 |

### Record `shop` — 8 bytes (0x8), count: shopTableHeader.shopCount (vanilla 57)

*Where:* section39 + shopTableHeader.shopListOffset + i*8

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `ownerName` | Text id of the shopkeeper/shop name. |  | IW Shops.cs:43,99 |
| 0x02 | 2 | bytes | `unused02` | Unused attribute; the Workshop writes 0. |  | IW Shops.cs:46,100 |
| 0x04 | 4 | u32 | `eventTableOffset` | Offset (from the section start) of this shop's eventTableHeader. |  | IW Shops.cs:47-48,146-152 |

### Record `eventTableHeader` — 12 bytes (0xC), count: 1 per shop

*Where:* section39 + shop.eventTableOffset (one per shop)

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `tag` | Constant 100 (0x64) at every level of the tree. |  | IW Shops.cs:13-15 |
| 0x02 | 2 | u16 | `level` | Tree level: 1 (event list). |  | IW Shops.cs:13-15 |
| 0x04 | 2 | u16 | `elementSize` | Stride of the list this header introduces: 8. |  | IW Shops.cs:13-15 |
| 0x06 | 2 | u16 | `eventCount` | Number of stock events of this shop. |  | IW Shops.cs:55,108 |
| 0x08 | 4 | u32 | `eventListOffset` | Offset of event[0]; 12 bytes after this header in a rebuilt file. |  | IW Shops.cs:56,109 |

### Record `event` — 8 bytes (0x8), count: eventTableHeader.eventCount

*Where:* section39 + eventTableHeader.eventListOffset + j*8

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `condition` | When this stock group becomes available. | `BpeShopEventConditionList` | IW Shops.cs:61,114 |
| 0x01 | 1 | u8 | `conditionOffsetParameter` | Secondary parameter of the condition (Workshop: "condition offset parameter"; e.g. a byte/bit offset for custom conditions — unverified). |  | IW Shops.cs:62,115 |
| 0x02 | 2 | u16 | `conditionParameter` | Main parameter of the condition (e.g. story progress value or clan rank). |  | IW Shops.cs:63,116 |
| 0x04 | 4 | u32 | `contentTableOffset` | Offset (from the section start) of this event's contentTableHeader. |  | IW Shops.cs:66-67,134-140 |

### Record `contentTableHeader` — 12 bytes (0xC), count: 1 per event

*Where:* section39 + event.contentTableOffset (one per event)

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `tag` | Constant 100 (0x64) at every level of the tree. |  | IW Shops.cs:13-15 |
| 0x02 | 2 | u16 | `level` | Tree level: 2 (content list). |  | IW Shops.cs:13-15 |
| 0x04 | 2 | u16 | `elementSize` | Stride of the list this header introduces: 2. |  | IW Shops.cs:13-15 |
| 0x06 | 2 | u16 | `contentCount` | Number of content ids in this stock group. |  | IW Shops.cs:74,125 |
| 0x08 | 4 | u32 | `contentListOffset` | Offset of content[0]; 12 bytes after this header in a rebuilt file. |  | IW Shops.cs:75,126 |

### Record `content` — 2 bytes (0x2), count: contentTableHeader.contentCount

*Where:* section39 + contentTableHeader.contentListOffset + k*2; the list is zero-padded to a 4-byte boundary

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `contentId` | Content id offered for sale (category<<12 \| index: items 0x0000, equipment 0x1000, magicks 0x3000, technicks 0x4000, gambits 0x6000 …). | `ContAllList` | IW Shops.cs:78,130; TK L575, L1567 |

## Enums carried in the JSON spec

Flag enums list the mask value of each bit. Fields that point at bigger lists (text ids, content ids, animations, formulas …) name a list from `editor/data/lists.json` instead (see *External lists*).

#### `BpeShopEventConditionList` (Lists: BpeShopEventConditionList)

| Value | Label |
|---|---|
| 0 (0x0) | None |
| 1 (0x1) | Custom |
| 2 (0x2) | Story Progress |
| 3 (0x3) | Clan Rank |

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `ContAllList` | content ids (category<<12 \| index) |
| `BpShopList` | row labels: 0 Travelling Merchant (Lowtown / North Sprawl) … 56 Odo |

## Count and size rules

- `shopCount` shops (57 vanilla); shop index = row of `BpShopList`, used by the game to open a merchant
  (TK L611-L617) — do not reorder.
- Each shop has `eventCount` ≥ 0 events, each event `contentCount` ≥ 0 content ids. The total section size is
  `12 + 8*shops + Σshops(12 + 8*events + Σevents(12 + align4(2*contents)))`, then padded to 16.
- Content lists are padded with zero bytes to a multiple of 4 (IW Shops.cs:132), so all headers and 8-byte
  entries stay 4-byte aligned.

### Text

`shop.ownerName` is a u16 text id (strings live in battlepack section 61). Nothing else in the section is text.

## Pointers that must be fixed up

All offsets are relative to the start of section 39 (the reader seeks from the section start, IW Shops.cs:36,48,56,67,75).

| Pointer | Points at | Fix-up when … |
|---|---|---|
| `shopTableHeader.shopListOffset` | shop[0] | the header moves (never in practice) |
| `shop.eventTableOffset` | that shop's event header | anything before that header changes size |
| `eventTableHeader.eventListOffset` | event[0] | anything before that list changes size |
| `event.contentTableOffset` | that event's content header | anything before that header changes size |
| `contentTableHeader.contentListOffset` | contentId[0] | anything before that list changes size |

Safe in-place edits (no fix-up): `ownerName`, `condition`, `conditionOffsetParameter`, `conditionParameter`,
and replacing a content id with another. Adding or removing events or content ids changes block sizes:
the simplest correct approach is to rebuild the whole section in the canonical order above, recomputing every
offset, then re-pad to 16 and update the battlepack offset table.

## Round-trip rules

- For value-only edits (ownerName, event condition fields, swapping one content id for another) patch bytes in place; the file stays byte-identical elsewhere.
- Never rebuild the section unless an event or content count changes; a rebuild may reorder blocks relative to vanilla.
- When rebuilding: write the 12-byte headers with their fixed signatures, recompute every offset relative to the section start, pad each content list to 4 bytes and the section to 16 bytes with zeros.
- Preserve shop.unused02 bytes from the original when rebuilding (the Workshop zeroes them).
- If the section length changes, rewrite the battlepack offset table (all later sections and the end offset).
- Keep shop order: shop index is the merchant id the game opens.

## Known unknowns

- Exact meaning of conditionOffsetParameter and conditionParameter for each condition type (custom / story progress / clan rank).
- Whether vanilla blocks are laid out in the same order as the Workshop writes them (a rebuild may not be byte-identical even without edits).
- Content of shop.unused02 in vanilla data (the Workshop discards it).
- Which text block shop.ownerName ids belong to (assumed the character-name block, 16384+).
- Whether events are cumulative (all satisfied events add stock) or exclusive — assumed cumulative.

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; license forbids copying or converting its code). Paths are relative to that repo, e.g. `Formats/Battlepack/Actions.cs`, `Formats/St2e.cs`, `Helpers/PackHelper.cs`, `Helpers/EnumHelper.cs`, `Resources/JsonFile.cs`, `Resources/PackFile.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| LL `sectionNN.md` | FF12 Lua Loader documentation, `capabilities/bpack-sections/sectionNN.md` (field names of the loader's read-only `game.bpack` view). |
| Lists | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json` (list name given). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
