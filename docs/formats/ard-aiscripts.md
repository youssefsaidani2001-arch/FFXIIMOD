# ARD section 3 - AI scripts (battle logics)

Spec id: `ard-aiscripts` · machine spec: [`ard-aiscripts.json`](./ard-aiscripts.json)

ARD **section 3** holds the foes' AI, called "Battle Logics" by the Toolkit (TK L1008): a list of **scripts**,
each split into up to **32 groups**, each group a list of 24-byte **entries** that work like gambit lines
(an action plus up to three target cases). A unit picks up to four scripts by index (`aiScriptLink0..3`,
unit +0x50, TK L1044, L1693). The Workshop maps `section_003.bin` here (IW Resources/JsonFile.cs:70).
Community usage: scripts are addressed as "AI slot -> group -> entry" (msg 606, 610), and some scripts react to
battle variables (e.g. Garuda-Egi's Eksir Berries logic, msg 590-592). Adding lines needs a tool that rebuilds
the section (msg 270, 681) - this spec gives the rules to do that.

Unlike sections 2, 4, 7 and 8 this is **not** an st2e table and has no magic.

## Container

### The ARD file

Full container spec: [`container-ard.md`](./container-ard.md). What matters for this section:

- **Files.** Standalone `*.ard` files (the Workshop treats every `.ard` as a 10-section pack,
  IW Resources/PackFile.cs:29) and the ARD embedded as **section 19 of every `.ebp`** (the Workshop names that
  section `section_019.ard`, IW Helpers/PackHelper.cs:217-222, 245; because `.ebp` precedes `.ard` in its pack list the extracted ARD is
  unpacked right after, and rebuilt before the EBP, IW Resources/PackFile.cs:28-29, IW Program.cs:53, 88). The Toolkit's
  file viewer lists "Area Resource Data (.ard)" as game file type 21 (TK L1411). None of our sources names the
  VBF folder that holds the standalone files; search the archive for `.ard`. One ARD covers one area and its
  edits only apply after the area is (re)loaded (TK L1072, L1697).
- **Header (0x30 bytes).** 8-byte magic `FF12AR03` (`46 46 31 32 41 52 30 33`, IW Helpers/PackHelper.cs:272-276, 319-320), then ten
  little-endian `u32` section offsets at 0x08-0x2F (IW Helpers/PackHelper.cs:279-283, 323, 358-362). Offsets count from the first
  byte of the ARD (the game resolves a section as ARD base + offset, TK L242); **0 means the section is absent**.
  This section's offset is the `u32` at **ARD+0x14** (slot 3).
- **Section span.** Sort the non-zero offsets; a section runs to the next larger offset, the highest one to
  the end of the ARD (IW Helpers/PackHelper.cs:285-310). When the ARD comes out of an EBP, "end of the ARD" includes the EBP's
  alignment padding, so trailing zero bytes after the highest section are normal.
- **Physical order.** Sections 0, 2, 3, 4, 5, 6, 7, 8, 9 are written in index order, each starting on a 16-byte
  boundary with zero fill in between; **section 1 is always written last** and nothing is appended after it
  (IW Helpers/PackHelper.cs:327-355). Absent sections take no space.
- **Unpacked naming.** The Workshop stores section *n* as `<file>.ard.dir/section_<nnn>.bin`
  (IW Helpers/PackHelper.cs:308, IW Resources/JsonFile.cs:68-73); the `files` globs of this spec include that name.

#### ARD section map

| # | Header slot | Content | Spec | Source |
|---|---|---|---|---|
| 0 | 0x08 | unknown | - | IW Resources/JsonFile.cs:68-73 (not mapped) |
| 1 | 0x0C | Models (Toolkit: "Model Motions") - stored last | [`ard-models`](./ard-models.md) | IW Resources/JsonFile.cs:68; TK L1006 |
| 2 | 0x10 | Classes (species) - st2e, 84-byte rows | [`ard-classes`](./ard-classes.md) | IW Resources/JsonFile.cs:69; TK L1007 |
| 3 | 0x14 | AI scripts (Toolkit: "Battle Logics") - offset table + scripts | [`ard-aiscripts`](./ard-aiscripts.md) | IW Resources/JsonFile.cs:70; TK L1008 |
| 4 | 0x18 | Units (per-encounter foe records) - st2e, 88-byte rows | [`ard-units`](./ard-units.md) | IW Resources/JsonFile.cs:71; TK L1009 |
| 5 | 0x1C | unknown | - | - |
| 6 | 0x20 | unknown | - | - |
| 7 | 0x24 | Default stats - st2e, 56-byte rows | [`ard-stats`](./ard-stats.md) | IW Resources/JsonFile.cs:72; TK L1010 |
| 8 | 0x28 | Additive stats - st2e, 56-byte rows | [`ard-stats`](./ard-stats.md) | IW Resources/JsonFile.cs:72; TK L1011 |
| 9 | 0x2C | Special action animations - count + 16-byte rows | [`ard-specialactionanimations`](./ard-specialactionanimations.md) | IW Resources/JsonFile.cs:73; TK L1012 |

### Section layout

```
+0x00            u16 scriptCount  (S)
+0x02            u16 unknown02    (Workshop writes 100)
+0x04            u32 scriptOffset[0 .. S-1]   section-relative start of each script
+0x04 + 4*S      u32 endOffset                section-relative offset just past the last script
+0x08 + 4*S      script 0
                 script 1  ...                scripts are packed back to back, no alignment between them
endOffset        zero padding to a multiple of 16

script:
+0x00            u8  groupCount[32]           entries per group, groups 0..31
+0x20            entry[...]                   24 bytes each: all of group 0, then group 1, ...
```

Facts: header and offset table (IW Formats/Ard/AiScripts.cs:26-33, 88-90, 123-128), per-script group array
(AiScripts.cs:39-46, 97-101), entry order (AiScripts.cs:49-77, 103-117), end offset written unpadded and the
section padded afterwards (AiScripts.cs:119-120).

### Groups

- The 32-byte array always occupies 32 bytes, whatever the number of groups used (AiScripts.cs:101).
- The Toolkit describes the array as "terminated by 0, max 32 groups" (TK L1008); the Workshop's reader skips any
  zero slot rather than stopping, and its writer packs the non-empty groups to the front
  (AiScripts.cs:41-46, 97-101). Both agree when the used groups are contiguous from group 0, so **keep used
  groups contiguous** (no zero count between two non-zero counts).
- A group holds at most 255 entries (u8 count); a script holds at most 32 groups (AiScripts.cs:144-146).
- Script size = 32 + 24 x (sum of the 32 counts). Entry *k* of a script (counting across groups) is at
  script start + 32 + 24*k.

### Control flow (from the Toolkit's action list)

The AI moves between groups and scripts with ordinary entries whose `action` is an AI command
(Lists: BattleLogicActionList):

| Action id | Label |
|---|---|
| 0x4048-0x404F | Switch to Group 0 ... 7 |
| 0x4112-0x4115 | (p)% chance to jump to Battle Logic Link 0 ... 3 (the scripts in the unit's four AI slots) |
| 0x4116-0x4121 | (p)% chance to jump to Battle Logic Group 0 ... 11 |

`(p)` is the entry's `actionParameter`. So a unit's four `aiScriptLink` slots act as jump targets, and a
script's groups act as states/phases. "AI slot 1 -> group 8" in msg 610 uses exactly this addressing. Which
group a script starts in, and the evaluation order inside a group, are not documented (assumed: group 0, top to
bottom, like gambits).

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…`/`unused…` are not interpreted by any source; keep their original bytes.

### Record `aiHeader` — 4 bytes (0x4), count: 1

*Where:* Offset 0 of ARD section 3 (ARD start + u32 at ARD+0x14).

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `scriptCount` | Number of AI scripts (= number of script offsets that follow, not counting the end offset). |  | IW Formats/Ard/AiScripts.cs:26,88 |
| 0x02 | 2 | u16 | `unknown02` | Not read. The Workshop always writes 100 (0x64) and calls it an unknown/unused value; keep the original. |  | IW Formats/Ard/AiScripts.cs:27,89 |

### Record `scriptOffset` — 4 bytes (0x4), count: aiHeader.scriptCount + 1

*Where:* ARD section 3, offset 4 + 4*i (i = 0 .. aiHeader.scriptCount)

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | u32 | `offset` | Section-relative offset. Entries 0 .. scriptCount-1 point at the start of each script; the extra last entry holds the offset just past the last script (before the section padding). |  | IW Formats/Ard/AiScripts.cs:29-33,90,96,119,123-128 |

### Record `groupCounts` — 32 bytes (0x20), count: aiHeader.scriptCount (one per script)

*Where:* ARD section 3, offset scriptOffset[s].offset (start of script s)

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 1 | u8 | `group00Count` | Number of 24-byte entries in group 0 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x01 | 1 | u8 | `group01Count` | Number of 24-byte entries in group 1 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x02 | 1 | u8 | `group02Count` | Number of 24-byte entries in group 2 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x03 | 1 | u8 | `group03Count` | Number of 24-byte entries in group 3 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x04 | 1 | u8 | `group04Count` | Number of 24-byte entries in group 4 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x05 | 1 | u8 | `group05Count` | Number of 24-byte entries in group 5 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x06 | 1 | u8 | `group06Count` | Number of 24-byte entries in group 6 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x07 | 1 | u8 | `group07Count` | Number of 24-byte entries in group 7 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x08 | 1 | u8 | `group08Count` | Number of 24-byte entries in group 8 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x09 | 1 | u8 | `group09Count` | Number of 24-byte entries in group 9 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x0A | 1 | u8 | `group10Count` | Number of 24-byte entries in group 10 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x0B | 1 | u8 | `group11Count` | Number of 24-byte entries in group 11 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x0C | 1 | u8 | `group12Count` | Number of 24-byte entries in group 12 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x0D | 1 | u8 | `group13Count` | Number of 24-byte entries in group 13 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x0E | 1 | u8 | `group14Count` | Number of 24-byte entries in group 14 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x0F | 1 | u8 | `group15Count` | Number of 24-byte entries in group 15 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x10 | 1 | u8 | `group16Count` | Number of 24-byte entries in group 16 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x11 | 1 | u8 | `group17Count` | Number of 24-byte entries in group 17 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x12 | 1 | u8 | `group18Count` | Number of 24-byte entries in group 18 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x13 | 1 | u8 | `group19Count` | Number of 24-byte entries in group 19 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x14 | 1 | u8 | `group20Count` | Number of 24-byte entries in group 20 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x15 | 1 | u8 | `group21Count` | Number of 24-byte entries in group 21 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x16 | 1 | u8 | `group22Count` | Number of 24-byte entries in group 22 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x17 | 1 | u8 | `group23Count` | Number of 24-byte entries in group 23 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x18 | 1 | u8 | `group24Count` | Number of 24-byte entries in group 24 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x19 | 1 | u8 | `group25Count` | Number of 24-byte entries in group 25 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x1A | 1 | u8 | `group26Count` | Number of 24-byte entries in group 26 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x1B | 1 | u8 | `group27Count` | Number of 24-byte entries in group 27 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x1C | 1 | u8 | `group28Count` | Number of 24-byte entries in group 28 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x1D | 1 | u8 | `group29Count` | Number of 24-byte entries in group 29 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x1E | 1 | u8 | `group30Count` | Number of 24-byte entries in group 30 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |
| 0x1F | 1 | u8 | `group31Count` | Number of 24-byte entries in group 31 of this script (0 = group not used). |  | IW Formats/Ard/AiScripts.cs:39-46,97-101 |

### Record `aiEntry` — 24 bytes (0x18), count: sum of groupCounts.group00Count .. group31Count of the owning script

*Where:* ARD section 3: entries of script s start at scriptOffset[s].offset + 32; group 0 entries first, then group 1, ... (entry k of the script at +32 + 24*k)

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 2 | u16 | `action` | What to do. Id blocks in the Toolkit list: 0x0000+ battle actions (0 = Cure ...), 0x4000+ AI commands (movement, switch/jump group, add status or augment, stat changes ...), 0x8000+ "Action Group n"; 65535 = none. | `BattleLogicActionList` | IW Formats/Ard/AiScripts.cs:53,105; Lists: BattleLogicActionList |
| 0x02 | 2 | s16 | `actionParameter` | Parameter of the action, shown as "(p)" in the action labels (e.g. a range in meters or a percent chance); signed in the Workshop. |  | IW Formats/Ard/AiScripts.cs:54,106; Lists: BattleLogicActionList |
| 0x04 | 2 | u16 | `flags` | Behaviour flags of the line. The Workshop keeps the raw value; bit meanings are not documented for ARD lines (see gaps). |  | IW Formats/Ard/AiScripts.cs:55,107 |
| 0x06 | 2 | u16 | `case1TargetType` | Who or what case 1 tests: 0-10 actors (foe, ally, leader, self ...); 0x1000+ blocks are variables and flags (scratch variables, global flags, quest values, map icon flags, battle logic flags, 0xA000 caster battle memory flags). | `BattleLogicTargetTypeList` | IW Formats/Ard/AiScripts.cs:58,108 |
| 0x08 | 2 | u16 | `case1TargetCondition` | Condition case 1 tests (0 = unconditional). | `BattleLogicTargetConditionList` | IW Formats/Ard/AiScripts.cs:59,109 |
| 0x0A | 2 | u16 | `case1Parameter` | Parameter of case 1, shown as "(p)" in the condition labels (e.g. "Genus == (p)"). |  | IW Formats/Ard/AiScripts.cs:60,110 |
| 0x0C | 2 | u16 | `case2TargetType` | Who or what case 2 tests: 0-10 actors (foe, ally, leader, self ...); 0x1000+ blocks are variables and flags (scratch variables, global flags, quest values, map icon flags, battle logic flags, 0xA000 caster battle memory flags). | `BattleLogicTargetTypeList` | IW Formats/Ard/AiScripts.cs:64,111 |
| 0x0E | 2 | u16 | `case2TargetCondition` | Condition case 2 tests (0 = unconditional). | `BattleLogicTargetConditionList` | IW Formats/Ard/AiScripts.cs:65,112 |
| 0x10 | 2 | u16 | `case2Parameter` | Parameter of case 2, shown as "(p)" in the condition labels (e.g. "Genus == (p)"). |  | IW Formats/Ard/AiScripts.cs:66,113 |
| 0x12 | 2 | u16 | `case3TargetType` | Who or what case 3 tests: 0-10 actors (foe, ally, leader, self ...); 0x1000+ blocks are variables and flags (scratch variables, global flags, quest values, map icon flags, battle logic flags, 0xA000 caster battle memory flags). | `BattleLogicTargetTypeList` | IW Formats/Ard/AiScripts.cs:70,114 |
| 0x14 | 2 | u16 | `case3TargetCondition` | Condition case 3 tests (0 = unconditional). | `BattleLogicTargetConditionList` | IW Formats/Ard/AiScripts.cs:71,115 |
| 0x16 | 2 | u16 | `case3Parameter` | Parameter of case 3, shown as "(p)" in the condition labels (e.g. "Genus == (p)"). |  | IW Formats/Ard/AiScripts.cs:72,116 |

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `BattleLogicActionList` | battle-logic action ids (TK L1643) |
| `BattleLogicTargetTypeList` | battle-logic target types (TK L1644) |
| `BattleLogicTargetConditionList` | battle-logic target conditions (TK L1642) |

## Count and size rules

- `scriptOffset[0]` = 8 + 4 x scriptCount (the table has scriptCount + 1 words, scripts follow it directly).
- `scriptOffset[s+1]` = `scriptOffset[s]` + 32 + 24 x entries(s); the extra last word equals the end of the last
  script. Offsets are therefore always multiples of 4 (header 4-byte words, scripts multiples of 8).
- Section length = endOffset rounded up to 16 with zero bytes (AiScripts.cs:119-120).
- Unit rows refer to scripts by index, so **appending** a script is safe; inserting or deleting one renumbers
  every later script and every unit's `aiScriptLink*` that points past it must be adjusted.

## Pointers to fix when sizes change

| Changed | Fix |
|---|---|
| entries added/removed in script s | that script's group count byte; `scriptOffset[s+1 ..]` and the end offset shift by 24 per entry; re-pad the section to 16 |
| script appended | `scriptCount` + 1; the offset table grows by 4 bytes, so **every** script offset (and the end offset) shifts by 4 plus the new script's start is added |
| section length changed | ARD section table: every section stored after section 3 (4..9, then section 1) moves; EBP offsets after section 19 if nested |

The offsets inside the section are relative to the section start, so moving the whole section never changes them.

## Links

| Field | Points to |
|---|---|
| unit `aiScriptLink0..3` (section 4, +0x50..+0x56) | script index in this section |
| `action` | `BattleLogicActionList`: 0x0000+ battle actions (same numbering as battlepack section 14 rows, 0 = Cure), 0x4000+ AI commands, 0x8000+ action groups (probably battlepack section 10, IW Resources/JsonFile.cs:32) |
| `caseNTargetType` | `BattleLogicTargetTypeList` (0-10 basic targets, 4096+ script variables / battle memory flags) |
| `caseNTargetCondition` | `BattleLogicTargetConditionList` (same id space as gambit conditions in battlepack section 7) |

## Text

No strings. Labels come from the Toolkit lists above.

## Round-trip rules

- Without size changes, edit entry fields in place; nothing moves.
- Keep unknown02 and the flags word of each entry exactly as read.
- The offset table has scriptCount + 1 words; the last one is the unpadded end of the script data. Rewrite all of them whenever any script changes size or a script is added.
- Scripts are contiguous with no alignment; only the section end is padded to 16 with zeros.
- Each script keeps its full 32-byte group-count array; used groups stay contiguous from group 0 (a 0 count ends the list for the Toolkit).
- Keep script order: units refer to scripts by index.
- If this section changes length, rebuild the ARD offset table: every section stored after it moves (recompute their u32 slots, keep 16-byte starts with zero fill, keep section 1 last with nothing after it); if the ARD sits in EBP section 19, the EBP offsets after section 19 move as well.

## Known unknowns

- unknown02 (Workshop writes 100): purpose unknown; vanilla value not confirmed to be constant.
- Bit layout of the entry flags word. Battlepack section 7 gambit lines keep a u16 flag word whose bits 3-5 are the case-link type (see battlepack-s07-gambits) and the Toolkit edits a case-link type on live battle-logic lines (TK L1291), so the same layout is likely but unverified for ARD entries.
- Which group is active when a script starts and how entries inside a group are evaluated (groups are switched by the 0x4048-0x404F / 0x4116-0x4121 commands; the start state is assumed to be group 0).
- Whether the 0x0000 action block is exactly the battlepack section 14 row index and the 0x8000 block the battlepack section 10 group index (inferred from the list labels).
- Which of a unit's four script slots runs first (slot 0 assumed) and whether a value such as 65535 marks an empty slot.
- Meaning of actionParameter and caseNParameter per action/condition (no table in our sources).
- Whether vanilla scripts ever contain a zero group count between used groups.

## Source keys

| Key | Source |
|---|---|
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (read as a fact reference only; its licence forbids copying, modifying or converting its code). Paths are relative to that repo: `Formats/Ard/*.cs`, `Formats/St2e.cs`, `Helpers/PackHelper.cs`, `Helpers/BinaryHelper.cs`, `Helpers/EnumHelper.cs`, `Resources/JsonFile.cs`, `Resources/PackFile.cs`, `Program.cs`. |
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of The Insurgent's Toolkit cheat table), line n. Section 4.16 (L997-L1072) is the ARD editor. |
| Lists | Drop-down lists of The Insurgent's Toolkit. Lists named in `enum` either ship in `editor/data/lists.json` or are copied into this spec's `enums` block (the `Arde*` lists). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
