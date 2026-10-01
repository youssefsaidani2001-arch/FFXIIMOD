# Battlepack section 0 — Weapon Stances

Spec id: `battlepack-s00-weapon-stances` · machine spec: [`battlepack-s00-weapon-stances.json`](./battlepack-s00-weapon-stances.json)

Battlepack **section 0** maps every weapon stance id to the animation set a character uses with it, one byte per
stance. It is one of the few battlepack sections that is **not** an st2e table (TK L805,
IW Formats/Battlepack/WeaponStances.cs:21-34). The Workshop maps `section_000.bin` here (IW Resources/JsonFile.cs:25).

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

### Section 0 layout (custom, no magic)

| Offset | Size | Type | Name | Meaning | Source |
|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `entrySize` | Bytes per entry, always 1. | IW WeaponStances.cs:23 (skipped on read), :40, :52; TK L805 |
| 0x02 | 2 | u16 | `entryCount` | Number of stance rows. | IW WeaponStances.cs:24, :41; TK L805 |
| 0x04 | entryCount | u8[] | `animation[]` | One animation-set id per stance, packed. | IW WeaponStances.cs:27-34, :43-46 |
| … | | | padding | Zero bytes up to a multiple of 16. | IW WeaponStances.cs:47 |

With the vanilla 23 stances (TK L805) the section is 4 + 23 = 27 bytes, padded to 32.

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…`/`unused…` are not interpreted by any source; keep their original bytes.

### Record `header` — 4 bytes (0x4), count: 1

*Where:* Offset 0 of battlepack section 0 (no st2e header in this section).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `entrySize` | Bytes per stance entry; always 1. The Workshop ignores it on read and writes 1. |  | IW Formats/Battlepack/WeaponStances.cs:23,40,52; TK L805 |
| 0x02 | 2 | u16 | `entryCount` | Number of stance rows (23 in the vanilla game). |  | IW WeaponStances.cs:24,41; TK L805 |

### Record `weaponStance` — 1 bytes (0x1), count: header.entryCount (vanilla 23)

*Where:* section 0 offset 4 + i (one byte per stance, row i = weapon stance id i; row labels: list BpWeaponStanceList)

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `animation` | Animation set used while holding a weapon of this stance. | `WeaponStanceAnimationList` | IW WeaponStances.cs:31,45; LL section00.md |

## Enums carried in the JSON spec

Flag enums list the mask value of each bit. Fields that point at bigger lists (text ids, content ids, animations, formulas …) name a list from `editor/data/lists.json` instead (see *External lists*).

#### `WeaponStanceAnimationList` (Lists: WeaponStanceAnimationList; TK L1653)

| Value | Label |
|---|---|
| 0 (0x0) | Reserve (0x00) |
| 1 (0x1) | Unarmed |
| 2 (0x2) | Unarmed (Brawler) |
| 3 (0x3) | Sword |
| 4 (0x4) | Dagger |
| 5 (0x5) | Hand-Bomb |
| 6 (0x6) | Ninja Sword |
| 7 (0x7) | Axe / Hammer |
| 8 (0x8) | Mace / Measure |
| 9 (0x9) | Rod / Staff |
| 10 (0xA) | Pole |
| 11 (0xB) | Spear |
| 12 (0xC) | Greatsword |
| 13 (0xD) | Katana |
| 14 (0xE) | Bow |
| 15 (0xF) | Crossbow / Gun |
| 255 (0xFF) | None |

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `WeaponStanceAnimationList` | weapon stance animation sets (255 = none) |

## Count and size rules

- Row index = weapon stance id. The Toolkit names 23 of them (Lists: BpWeaponStanceList: 0 reserve, 1 Unarmed,
  2 Dagger, 3 Sword … 21 Hand-Bomb, 22 Unarmed (Brawler); TK L1622).
- The value is an animation-set id (Lists: WeaponStanceAnimationList, 255 = None; TK L1653). Several stances share
  a set (for example Axe and Hammer).
- `entrySize` must stay 1. To add a stance, raise `entryCount`, append one byte and re-pad; whether the game reads
  more than 23 rows is unknown.

### Text

This section holds no strings and no text ids.

## Pointers

None inside the file. The Toolkit's export and hot-reload scripts special-case section 0 (TK L267, L978, L1422) because it
has no st2e header, not because it holds offsets. Related tables elsewhere: the PC Skill Motion table pairs model +
weapon stance with an animation file (TK L1190); ARD units carry a forced weapon-stance animation byte (TK L1029).

## Round-trip rules

- Keep entrySize = 1 and entryCount equal to the number of bytes that follow.
- Edit animation bytes in place; nothing points at rows.
- Keep the zero padding to 16; if the row count changes, recompute the padding and shift every later battlepack section offset by the padded delta.

## Known unknowns

- Which field chooses a weapon's stance (expected: a stance id inside section 13 weapon records) is outside this spec.
- Whether entrySize may be anything but 1, and whether the game reads rows beyond the vanilla 23.
- Padding bytes after the entries are assumed zero.

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; license forbids copying or converting its code). Paths are relative to that repo, e.g. `Formats/Battlepack/Actions.cs`, `Formats/St2e.cs`, `Helpers/PackHelper.cs`, `Helpers/EnumHelper.cs`, `Resources/JsonFile.cs`, `Resources/PackFile.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. |
| LL `sectionNN.md` | FF12 Lua Loader documentation, `capabilities/bpack-sections/sectionNN.md` (field names of the loader's read-only `game.bpack` view). |
| Lists | Drop-down lists of The Insurgent's Toolkit as shipped in `editor/data/lists.json` (list name given). |
| Graveyard `<file>:<line>` | The Insurgent's Graveyard by Xeavin, `/home/user/xeavin/the-insurgents-graveyard/` (fact reference only). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
