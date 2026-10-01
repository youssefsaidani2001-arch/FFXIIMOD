# PC Skill Motion table (model + stance -> animation file)

Spec id: `pc-skill-motion` · machine spec: [`pc-skill-motion.json`](./pc-skill-motion.json)

> **FILE FORMAT** (world file type 9 id 5), record layout only; the container header is not documented.

## What this is

The **PC Skill Motion** table decides which animation file a party-member model uses for a given weapon stance
and special character animation. It is the table to edit when a party member gets a body (model) whose
skeleton differs from the original (TK L1190, L1679).

| Item | Value | Source |
|---|---|---|
| Game file | World File (type 9), id 5; hot-reloadable (File Reloader -> PC Skill Motion) | TK L1427 |
| Runtime | `[0x02B58188]` | TK L441, L1190 |
| Record | 10 bytes: model (4), weapon stance (2), special character animation (2), animation file id (2) | TK L1190 |
| File name / VBF path / header | not recorded | - |

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…` are not interpreted by any source; keep their original bytes. Overlapping rows are alternative views of the same bytes (the note says which applies).

### Record `pcSkillMotion` — 10 bytes (0xA), count: unknown (not documented)

*Where:* Records of the PC Skill Motion world file (game file type 9, id 5); in memory at [0x02B58188]. The file header / count position is not documented.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | s32 | `model` | Model id ((ASCII prefix << 16) \| file number, e.g. c = main characters). | `ModelList` | TK L1190, L940-L958 |
| 0x04 | 2 | u16 | `weaponStance` | Weapon stance (battlepack section 0 / BpWeaponStanceList). | `BpWeaponStanceList` | TK L1190 |
| 0x06 | 2 | u16 | `specialCharacterAnimation` | Special character animation id (battlepack section 14 +0x30 uses the same space). |  | TK L1190, L893 |
| 0x08 | 2 | u16 | `animationFileIdentifier` | Animation file to use for this model + stance combination. |  | TK L1190 |

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `ModelList` | model ids (944 entries) |
| `BpWeaponStanceList` | battlepack section 0 weapon stances (23) |

## Round-trip rules

- Edit records in place; keep the (unknown) file header untouched.
- Records are 10 bytes, so they are only 2-byte aligned: do not assume 4-byte alignment for `model`.
- Hot-reload the file (type 9 id 5) or restart to apply.

## Known unknowns

- File name, header layout, record count and the record list start offset.
- Whether lookups require sorted records.
- Value ranges of specialCharacterAnimation / animationFileIdentifier.

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
