# Drive batch 00 — context memory doc + PermanentAllies README

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR.

Files in this batch:

| Drive id | Title | Local file | Status |
|---|---|---|---|
| 1qkUPHulc8NLE1owSla_v9ywm-zGZI1_8XIrKOmbLjpM | FFXII Modding - AI Context Memory | `..._FFXII_Modding_-_AI_Context_Memory.txt` (31 lines, Italian) | read in full |
| 1AbPBRsj7xBJ7oyFTWWPvGK0tTpphMwbJd0mjxl9qT7Y | README.md | `..._README.md.txt` (88 lines) | read in full |

Neither file has addresses, struct offsets or byte checks. The README is the only one with engine
facts (EBP battle-unit spawn opcodes, Battlepack sections 59/60, party-member re-add approach).
Neither file contains code by Xeavin; everything below is paraphrased.

Evidence key: **byte-check-in-code** = code checks the original bytes before patching;
**used-in-code** = code reads or writes the address; **comment-only** = only prose or a comment says so.
Both files are prose, so every row here is **comment-only**.

---

## 1. FFXII Modding - AI Context Memory

**Purpose.** An Italian "memory prompt" that tells an AI assistant who the user is and what they want.
It describes the user's goals, tools and workflow. It has no technical data (no addresses, offsets or formats).
Its value for editor design is that it sets requirements.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Main UI goal | Give each party character its own UI color: HP bar, HP numbers, name text and selection/highlight effects. The color should follow the active or selected character. This is the requirement behind the HudColors / CharacterHealthbarColors work. | L8, L31 | comment-only |
| Limit-expansion goals | Larger party size, custom License Boards, and fixes for animation-related crashes. | L9 | comment-only |
| Visual goals | UI recolors, texture overhaul, camera adjustments, image-quality tuning. | L10 | comment-only |
| Toolchain: loaders | BepInEx, Memoria, FF12 Lua Loader API. | L16 | comment-only |
| Toolchain: assets | VBF Browser is used to extract and manage the game archives (`.vbf`), and modified files are put back in afterwards. | L17, L24 | comment-only |
| Toolchain: RE | Cheat Engine, Ghidra, IDA Pro. | L18 | comment-only |
| Languages | C++, Lua and x86/x64 assembly (asm hooks, memory scripts). | L19, L29 | comment-only |
| Workflow: runtime | Custom Lua scripts plus DLL injection to change game behavior and memory. | L23 | comment-only |
| Workflow: UI params | Assembly hooks that change UI parameters directly in memory (not by editing files). | L25 | comment-only |
| Workflow: offline | Extract asset, then edit, then reinsert into the archive. An offline editor must therefore write files that VBF tools can repack. | L24 | comment-only |
| Assistant guidance | Answer at an advanced technical level with precise snippets for FF12 Lua Loader, Ghidra, IDA or Cheat Engine scripts. | L29-L30 | comment-only |

---

## 2. README.md — PermanentAllies (Basch on every map)

**Purpose.** Install and design notes for a Lua Loader mod, `PermanentAllies.lua`, plus a shared library
`lib/DuplicationToolkit.lua`. The mod keeps chosen *named* playable characters in the active party
on every map. It also explains why generic allied soldiers can't be done the same way. They need per-map
EBP edits, or a Battlepack story-point-addition guest route for a save-persistent companion.
The two `.lua` files it describes are **not** in the Drive export (see Missing below).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Install layout | Mod goes in `<game>/x64/scripts/PermanentAllies.lua`. The shared library goes in `<game>/x64/scripts/lib/DuplicationToolkit.lua`. Both are loaded by the FF12 Lua Loader. | L7-L15, L19 | comment-only |
| Hotkey | F6 turns the feature on or off. | L19 | comment-only |
| State persistence | The on/off flag is stored in the save game, so the mod keeps per-save state through some Lua Loader save hook. | L19 | comment-only |
| Lifecycle hooks | Re-applies on `onInitDone` and on `onMapJump` (Lua Loader event callbacks). | L23 | comment-only |
| Party add method | Calls the game's own "addPartyMember" factory function, described as verified, to put members in the active party. The address is not given in the README. | L23 | comment-only |
| Runtime vs save roster | Members added at runtime are not part of the save's party roster, so they disappear on map change unless re-added on every map jump. An editor that wants permanent members has to edit the save roster or Battlepack data instead. | L23 | comment-only |
| Character ids | Basch = id 4 (the default config). Balthier = id 3 (example `{ 4, 3 }`). Config key: `CONFIG.extraMembers` (list of character ids). | L23 | comment-only |
| Field follower cap | The field shows only about 3 active + 1 guest following bodies. Extra active members work in battle, but the engine caps the field visuals. | L27 | comment-only |
| EBP ally spawn | A generic ally body is spawned by an EBP `fn_entry` VM sequence that runs in the area actor's context at load time. A resident Lua hook can't safely drive it because it needs the VM's current-actor context. | L31, L79 | comment-only |
| EBP opcode 0x3001 | `btlAtelSetUnit(slot)` opens a battle-unit entry (spawn-slot index). | L39 | comment-only |
| EBP opcode 0x3005 | `btlAtelSetUnitType(t)` sets the unit type. | L47 | comment-only |
| EBP opcode 0x3006 | `btlAtelSetBelong(faction, 0)` sets faction/allegiance (ally vs foe). Set it to the player faction for an ally. | L51, L79 | comment-only |
| EBP opcode 0x3019 | `btlAtelSetDeSpawnType(0,0,0)`: a first argument of 0 means never despawn. | L63, L79 | comment-only |
| EBP opcode 0x304C | `btlAtelSetUnitFinish()` closes and commits the entry. | L67 | comment-only |
| EBP calls (no opcode given) | `btlAtelSetCallGroup(...)`, `btlAtelSetAbility(...)` (model/stats/AI from the actor plus the ARD unit), `btlAtelGetPositionDataX/Z`, `btlAtelSetEntryPositionForce` (placement). | L43, L55, L59 | comment-only |
| EBP sequence order | SetUnit, SetCallGroup, SetUnitType, SetBelong, SetAbility, then position, SetDeSpawnType, SetUnitFinish, return. | L35-L75 | comment-only |
| Per-map edit | To place soldiers on a map, add a Battle-Unit actor with a Dalmascan-soldier model to that map's `.ebp` and give it the sequence above. The tools are the FF12 VM Script Decompiler or Insurgent's Workshop. | L79 | comment-only |
| Map count | About 1300 locations, so per-map EBP editing only makes sense for a few maps. | L79 | comment-only |
| Battlepack 59/60 | Sections 59/60 are the Story Point Additions. An unused entry can be repurposed to add a character as a **guest**. Matches `docs/formats/battlepack-s59-*.md` / `-s60-*.md` in this repo. | L83 | comment-only (corroborated by repo docs) |
| Guest trigger | `btlAtelSetNextSetSaveData(x)` (EBP) triggers a story point addition, which writes the guest into the save. This is the same mechanism the vanilla game uses to add guests. | L83 | comment-only |
| Guest cap | Vanilla allows 1 guest. The Insurgent's Companions mod (Nexus 217) lifts the cap. `TheInsurgentsCompanions.lua` and its config are in this Drive export. | L83 | comment-only |
| Build claim | The author says the addresses were verified live on Steam, base 0x120000, no ASLR. The README itself lists no addresses. | L87 | comment-only |

### Editor takeaways
- **Offline editor:** you need an EBP actor editor that can insert a Battle-Unit actor with the 0x3001, 0x3005,
  0x3006, 0x3019, 0x304C call sequence. You also need a Battlepack 59/60 editor to repurpose a story point addition as a guest add.
- **Memory editor:** the party-add factory (`addPartyMember`) is the call to wrap. Calling it alone is not enough.
  It must be re-applied on every `onMapJump`, because the save roster isn't changed.

### Missing / referenced but absent
- `x64/scripts/PermanentAllies.lua`: not in the Drive export.
- `x64/scripts/lib/DuplicationToolkit.lua`: not in the Drive export. It holds the "verified addPartyMember factory", so the address is unknown from this batch.
