# The Insurgent's Toolkit — Complete Reference

**Target game:** Final Fantasy XII: The Zodiac Age (Steam, 64-bit) **Table author:** Xeavin — <https://www.nexusmods.com/finalfantasy12/mods/160> **File documented:** C:\\Games\\ffxii modding\\The Insurgent's Toolkit (1).CT **Table format:** Cheat Engine table version 52, 9.49 MB / 236,198 lines of XML

## Contents at a glance

|  |  |
| :-: | :-: |
| \*\*Metric\*\* | \*\*Count\*\* |
| Total cheat entries (rows) | 15,472 |
| Groups / folders | 1,148 |
| Auto Assembler scripts | 263 |
| Drop-down lists defined | 219 |
| Drop-down list references (links) | 646 |
| Entries with a resolved address | 14,061 |
| Entries displayed as hex | 1,115 |
| Hotkeys defined | 0 (none — everything is manual) |
| \\\<UserdefinedSymbols\\\> block | present but \*\*empty\*\* |

  

Every symbol this table exposes is created at runtime by its Auto Assembler scripts (registersymbol), not by the UserdefinedSymbols block. That matters: if a script is not enabled, its symbols do not exist and every child row under it shows ??.

  

-----

## 1\. How this table is built

Understanding the five mechanisms below makes the other 15,000 rows self-explanatory.

### 1.1 The "resolver thread" pattern

Most editor groups are a single Auto Assembler script whose \[enable\] section does:

  

globalalloc(xxx\_newmem,1024)

  

createthread(xxx\_newmem)

  

The injected thread runs an infinite loop inside the game process:

  

1.  memset the exposed data symbols to zero (so stale values never linger),
2.  resolve a file/struct pointer from a hard-coded global,
3.  read the entry **count** and store it into a ...\_count symbol,
4.  clamp the user-supplied **identifier** symbol to count - 1 and write it back,
5.  compute base = entryList + id \* entrySize and store it into a ...\_base symbol,
6.  sleep(500) and repeat.

  

Every child row is then just base + offset. Consequences:

  

  - **The identifier field self-clamps.** Typing 9999 snaps to the last valid index within half a second. This is a feature, not a bug.
  - **Values refresh at 2 Hz.** After changing an ID, wait \~0.5 s before trusting the displayed child values.
  - **Disabling the script sets an** **end** **flag**, the thread returns, and the symbols are unregistered. It does *not* leave a dangling thread.
  - **These threads only read.** They never write game state. Enabling an editor group is safe; it is your edits to the child rows that carry risk.

### 1.2 The "callable blob + Execute Script" pattern

Action tools (Free Teleport, Summon Chocobo, Kill Nearby Foes, Party Editor, the Export/Reload buttons…) allocate a code blob and registersymbol its entry point, e.g. ft\_code. The visible **Execute Script** row underneath is a tiny Lua stub:

  

executeCode("ft\_code")

  

synchronize(function() createTimer(100, function() memrec.active = false end) end)

  

executeCode spawns a remote thread at that address. The timer un-ticks the checkbox 100 ms later so it behaves like a push-button. **Ticking "Execute Script" fires the action once; it does not stay on.**

  

Several of these blobs begin with a *pause loop*: they spin on \[01FD4948\] (auto-pause menu section pointer) and \[02092730\] (active menu id) and refuse to run — displaying an in-game message box for four seconds — while a menu is open. That is why Free Teleport / Open Shop / Open Save-Load appear to do nothing if you fire them from the pause menu.

### 1.3 The drop-down mechanism

The top-level group **Drop-Down List Prerequisites** is a library. It holds 218 of the 219 lists as DescriptionOnly rows with no address. Real editor rows point at them by name through \<DropDownListLink\> (646 references).

  

**You must keep the Prerequisites group in the table.** Deleting it silently turns every named drop-down into a raw number field. The group itself has no scripts and costs nothing to leave enabled.

  

Only one drop-down is defined inline rather than in the library: Battlepack Editor \> 16 : Party Members \> Sub Model (13 entries, Viera/Dalmascan models plus the seven vanilla party models). This looks like a user-added customisation rather than stock table content.

### 1.4 Address forms used

Rows use three address forms:

  

|  |  |  |
| :-: | :-: | :-: |
| \*\*Form\*\* | \*\*Example\*\* | \*\*Meaning\*\* |
| Bare hex | 0209A3E2 | Absolute process address, hard-coded for one specific Steam build |
| Symbol | bce\\\_buk\\\_base | Runtime symbol; requires its parent script enabled |
| Symbol + offset | sge\\\_mabase + 0 | Symbol used as a pointer, dereferenced then offset |

  

Because the bare-hex rows are absolute and build-specific, **the whole table is locked to the game version it was made for.** On a patched/different build the static rows read garbage and the assert(...) guards in the code-patching scripts will refuse to enable (Cheat Engine reports an assertion failure). That assertion failure is the table's built-in version check — treat it as "wrong game build", not as a broken table.

### 1.5 Which scripts actually modify game code

This is the single most important safety fact about the table. Out of 263 scripts, **only five patch the game's instruction stream**. Everything else either allocates private memory or spawns a read-only polling thread.

  

|  |  |  |
| :-: | :-: | :-: |
| \*\*Script\*\* | \*\*Patched addresses\*\* | \*\*What the patch does\*\* |
| Free Teleport | 0025DE62, 002EFC5D | Hooks location-load-end to play the teleport landing effect; forces the screen fade to white while active |
| Custom Foe Respawn | 002358A1, 002358EB | Skips a foe's death-count and respawn-flag checks; in Chaotic mode also spawns the foe at the player's position |
| Custom Battle Menu Action | 002FFC81, 00305AE4, 0030EF9A | Neuters the action-legality check, substitutes the chosen action for whatever the menu selected, and stops items being consumed |
| Menu Resource Pack (MRP) Editor | 0032E8C9, 002A00FF | Records the base pointer of each loaded menu file and of the last-loaded MRP so the editor can find them |
| Forced Input Icons | 00197780, 002AEC15 | Overrides the keyboard/controller and PlayStation/Xbox button-glyph selection |

  

All five restore their original bytes on \[disable\] and all five are guarded by assert(...). If you are worried about stability, leave those five off and the rest of the table cannot alter code flow.

  

-----

## 2\. Full table map

Three entries sit at the root: **Compact Mode**, **Drop-Down List Prerequisites**, and **The Insurgent's Toolkit (Steam)** — the latter containing all 68 tools.

### 2.1 Root

  - **Compact Mode** *(Lua)* — toggles Splitter1, Panel4, Panel5 on Cheat Engine's main form, hiding the scan half of the window so the table fills it. Pure UI; touches nothing in the game. Toggling it again restores the panels.
  - **Drop-Down List Prerequisites** — 38 sub-groups holding the list library (see §6). No addresses, no scripts.
  - **The Insurgent's Toolkit (Steam)** — the toolkit proper.

### 2.2 The 68 tool groups, with size

Sorted by how much of the table each one occupies. "Rows" counts every descendant.

  

|  |  |  |  |
| :-: | :-: | :-: | :-: |
| \*\*Tool group\*\* | \*\*Rows\*\* | \*\*Sub-groups\*\* | \*\*Scripts\*\* |
| Save Game Editor | 8,013 | 410 | 34 |
| Battle Character Editor | 2,146 | 131 | 10 |
| Battlepack Editor | 1,231 | 142 | 47 |
| Environment Blueprint Pack (EBP) Editor | 487 | 88 | 32 |
| Menu Member Editor | 348 | 14 | 1 |
| Menu Section Editor | 343 | 35 | 9 |
| Menu Section Plus Editor | 334 | 33 | 9 |
| Area Resource Data (ARD) Editor | 301 | 36 | 9 |
| Post Processing Settings | 299 | 12 | 1 |
| UI Settings | 257 | 2 | 0 |
| Menu Resource Pack (MRP) Editor | 143 | 30 | 2 |
| Formula Processing Keep Editor | 128 | 9 | 1 |
| Skeleton Model Editor | 90 | 9 | 1 |
| Battle Script Keep Editor | 81 | 6 | 1 |
| General | 71 | 5 | 0 |
| Formula Processing Properties | 53 | 1 | 0 |
| Texture Image Map (TM2) Editor | 52 | 9 | 2 |
| VM Call Target Executor | 44 | 10 | 2 |
| Debug Settings | 44 | 1 | 1 |
| Special Action Processing Editor | 43 | 6 | 1 |
| Resource Descriptor Editor | 43 | 3 | 9 |
| Trap Processing Editor | 42 | 3 | 1 |
| Party Member Battle Logic Editor | 36 | 6 | 1 |
| Global Message Editor | 35 | 9 | 2 |
| Game Settings | 34 | 1 | 1 |
| Map Ref Editor | 33 | 8 | 7 |
| Memory Allocation Properties | 33 | 2 | 0 |
| Area Of Effect Shape Editor | 32 | 4 | 1 |
| License Board Node Editor | 30 | 2 | 1 |
| Memory Allocation Editor | 28 | 2 | 1 |
| Battle Script Load Handler Editor | 26 | 1 | 1 |
| File Load Handler Editor | 25 | 1 | 1 |
| Behind Camera Editor | 21 | 2 | 2 |
| Input Settings | 18 | 1 | 1 |
| Navi Map Data Editor | 17 | 4 | 2 |
| Party Member Editor | 16 | 7 | 7 |
| License Node Icon Editor | 16 | 4 | 2 |
| Traveler's Tips Requirements Editor | 16 | 4 | 2 |
| Bestiary Requirements Editor | 16 | 3 | 2 |
| Loot Bag Processing Editor | 15 | 2 | 1 |
| File Reloader | 15 | 8 | 15 |
| Magick Effect Processing Editor | 14 | 2 | 1 |
| Map Jump Group Flag Rom Editor | 11 | 4 | 2 |
| Battle Script Input Editor | 11 | 4 | 1 |
| PC Skill Motion Editor | 10 | 2 | 2 |
| EBP Loader | 10 | 5 | 2 |
| Inventory Editor | 9 | 3 | 3 |
| Loot Bag Processing Plus Editor | 9 | 2 | 1 |
| Action List Categories Editor | 9 | 2 | 1 |
| File Load Properties | 8 | 1 | 0 |
| Memory Allocation Handler Editor | 8 | 1 | 1 |
| VM Opcode Editor | 7 | 1 | 1 |
| Free Teleport | 6 | 1 | 2 |
| VM Call Target Pointers | 6 | 1 | 1 |
| Script Actor Type Editor | 5 | 1 | 1 |
| File Viewer | 5 | 1 | 1 |
| Party Editor | 4 | 1 | 2 |
| Open Shop | 3 | 1 | 2 |
| Open Save / Load Menu | 3 | 1 | 2 |
| Battle Player Character List Editor | 3 | 1 | 1 |
| Map Jump Group List Editor | 3 | 1 | 1 |
| EBP Disposer | 3 | 1 | 2 |
| Summon Chocobo | 2 | 1 | 2 |
| Complete Bestiary | 2 | 1 | 2 |
| Custom Foe Respawn | 2 | 1 | 1 |
| Kill Nearby Foes | 2 | 1 | 2 |
| Custom Battle Menu Action | 2 | 1 | 1 |
| Forced Input Icons | 2 | 1 | 1 |

  

-----

## 3\. Pointer bases and global addresses

These are the crown jewels of the table. Everything below is read directly out of the Auto Assembler source, not inferred from row names.

### 3.1 The three big file pointers

|  |  |  |  |  |
| :-: | :-: | :-: | :-: | :-: |
| \*\*Name\*\* | \*\*Global\*\* | \*\*Deref\*\* | \*\*Section lookup\*\* | \*\*Notes\*\* |
| \*\*Battlepack\*\* | \\\[0208E680\\\] | qword → file base | sectionBase = dword \\\[file + sectionId\\\*4 + 4\\\]; dword \\\[file\\\] = section count | The master gameplay data file (battlepack.bin, file type 2 / id 0x13). Absolute 32-bit pointers stored in-place. |
| \*\*Area Resource Data (ARD)\*\* | \\\[02B5E0C0\\\] | qword → file base | sectionBase = file + dword \\\[file + sectionId\\\*4 + 8\\\]; fixed 10 sections | Per-area foe/class/battle-logic data. Section table holds \*relative offsets\*, not absolute pointers. |
| \*\*Environment Blueprint Pack (EBP)\*\* | \\\[022C6C00 + ebpId\\\*8\\\] | qword → pack base | 5 slots, see EbpTypeList | Per-script/per-area blueprint. Slots 0–4 = Battle, …, Debug. |

  

The battlepack helper bpe\_base\_call and the ARD helper arde\_base\_call are themselves registersymbol-ed, so you can call them from your own scripts.

  

Both editors also expose a generic st2e entry-list parser (bpe\_st2e\_call / arde\_st2e\_call). The st2e container layout used throughout the game is:

  

|  |  |  |
| :-: | :-: | :-: |
| \*\*Offset\*\* | \*\*Size\*\* | \*\*Field\*\* |
| 0x00 | 4 | Magic 'st2e' |
| 0x04 | 4 | Entry count |
| 0x08 | 2 | Entry size (bytes) |
| 0x0C | 4 | Entry list pointer |
| 0x14 | 4 | Text section offset (cleared on export) |
| 0x20 | — | Header size for the default export path |

  

Section 13 (Equipment) additionally holds an attribute list pointer at +0x18 and each equipment record points into it at +0x28; section 10 and section 39 use bespoke layouts (the export script special-cases 0, 10, 13, 27 and 39).

### 3.2 Battlepack section pointer cache

The game keeps a second copy of some section bases in scattered globals in the 02EBFxxx block. The table uses these directly; the File Reloader rewrites all 55 of them after a hot reload. The ones whose meaning is stated in the source:

  

|  |  |
| :-: | :-: |
| \*\*Global\*\* | \*\*Section\*\* |
| \\\[02EBF038\\\] | 12 — License Nodes |
| \\\[02EBF0D8\\\] | 7 — Gambits |
| \\\[02EBF130\\\] | 16 — Party Members |
| \\\[02EBF138\\\] | 14 — Actions |
| \\\[02EBF190\\\] | Battle inventory / party state block (used as sge\\\_bibase, and as the party context for gambit refresh) |
| \\\[02EBF1A0\\\] | License board array (12 boards) |

  

The full list the File Reloader fixes up, in section order, is: 02EBF008, 010, 018, 020, 028, 030, 038, 040, 048, 050, 058, 060, 068, 070, 078, 080, 088, 090, 098, 0A0, 0A8, 0B0, 0B8, 0C0, 0C8, 0D8, 0E0, 0E8, 0F0, 0F8, 100, 108, 110, 118, 128, 130, 138, 158, 160, 170, 180, 200. The mapping is **not** linear — do not compute base + section\*8.

### 3.3 Save-game / session pointers

|  |  |  |
| :-: | :-: | :-: |
| \*\*Symbol\*\* | \*\*Resolves to\*\* | \*\*Region\*\* |
| sge\\\_mabase | \\\[02092758\\\] | Main allocation, offset 0 — \*\*Session\*\* block, 0x0200 bytes |
| sge\\\_gibase | \\\[02092758\\\] + 0x0200 | \*\*World\*\* block, 0x2000 bytes (all quest/story flags) |
| sge\\\_biibase | \\\[02092758\\\] + 0x2200 | \*\*Battle\*\* block, 0x6000 bytes — \*the table marks this copy "Ineffectual"\* |
| sge\\\_mebase | \\\[020927C0\\\] | \*\*Menu\*\* block, 0x4818 bytes (maps, clan primer, inventory slots) |
| sge\\\_bibase | \\\[02EBF190\\\] | \*\*Battle\*\* block, 0x8004 bytes — the live one |

  

The Session block's first two dwords are the save CRC checksum/remainder and a CRC state flag. Total documented span is sge\_mabase + 0 to sge\_mabase + 0x56690.

### 3.4 Battle-system pointers

|  |  |
| :-: | :-: |
| \*\*Global / symbol\*\* | \*\*Meaning\*\* |
| \\\[02098E10\\\] | \*\*Battle Script Keep array\*\* — 5 entries, stride 0x288. Index = "Script Identifier (0 → 4)". |
| bce\\\_gbsk\\\_call | Registered helper: ecx = script id → returns the keep pointer |
| \\\[keep + 0x08\\\] | Battle Actor Work list pointer; \\\[list\\\] = actor count, \\\[list + id\\\*8 + 8\\\] = actor pointer |
| \\\[022C7FE0\\\] (word) | Party leader Battle Actor Work identifier |
| \\\[022C8380\\\] (word) | Current target Battle Actor Work identifier |
| \\\[0208E6A0\\\] | Battle Unit Work count (used by Kill Nearby Foes) |
| \\\[02EBF188\\\] | Battle Unit Work pointer exposed under Formula Processing Properties |
| \\\[0209AC30\\\] + 0xB2A | Count of active party members (byte) |
| \\\[021B8410\\\] | Mode flags — bit 0 = esper summoned, bit 1 = chocobo summoned |
| \\\[01FD4948\\\] | Auto-pause menu section pointer (non-zero = game auto-paused) |
| \\\[02092730\\\] | Active menu id (non-zero = a menu is open) |
| \\\[021654C4\\\] / \\\[021654C8\\\] | Current location id / current position index |
| \\\[022C256C\\\] | LCRNG state |
| \\\[02EB4230\\\] | Mersenne-twister PRNG index (0 → 624) |
| \\\[02098E24\\\] | User control state |
| \\\[02099FF0\\\] | Scratch2 variable block, 0x200 bytes (cleared by Free Teleport) |

### 3.5 Actor chain — how a character resolves

The Battle Character Editor walks this chain every 500 ms:

  

Battle Script Keep  \[02098E10 + sid\*0x288\]

  

  +0x08 -\> Battle Actor Work list

  

             \[+0\]      actor count

  

             \[+8+i\*8\]  Battle Actor Work        (288 bytes)

  

                         +0x30  -\> Battle Unit Work      (3920 bytes)

  

                                     +0x698 -\> Battle Unit Keep      (464 bytes)

  

                                     +0x6A0 -\> Battle Unit Keep Plus (128 bytes)

  

                                     +0xE60 -\> ARD Unit record

  

                                     +0xE68 -\> ARD Class record

  

                                     +0xE70 -\> ARD Default Stats

  

                                     +0xE78 -\> ARD Additive Stats

  

                         +0x40  -\> Actor Declaration (name offset into script)

  

                         +0xA0  -\> Battle Task Control list

  

                         +0xA8  -\> Battle Task Execution list

  

                         +0xB8  -\> Battle Actor Skeleton (type-dependent size)

  

                         +0xC0  -\> Battle Actor Model    (392 bytes)

  

                                     +0x138 -\> Battle Actor Keep (304 bytes)

  

Battle Unit Keep is skipped when \[keep + 0x05\] == 0 (that byte is the unit **Type**; 0 means "party member" in the Kill-Nearby-Foes check, and the editor refuses to bind for that case, so a zero Type suppresses the Keep view).

### 3.6 Per-editor base globals (complete list)

Each of these is the array the named editor indexes into. Where the source states a bound, it is given; otherwise the editor clamps against a count read from data.

  

|  |  |  |  |
| :-: | :-: | :-: | :-: |
| \*\*Editor\*\* | \*\*Global\*\* | \*\*Max count\*\* | \*\*Stride / note\*\* |
| Menu Resource Pack | \\\[0209AC60 + id\\\*8\\\] | 23 pack sections | Magic 'MRP\\\\x01' checked at \\\[base\\\] |
| Menu Section Plus (most) | \\\[0209AC60 + id\\\*8\\\] | varies 4–32 | Shares the MRP section list |
| Menu Section Plus — Quickening / AoE Shape | \\\[0209BE80\\\] | 4 / 6 |   |
| License Board Node | \\\[0209AC60\\\]-derived | — | Node record 0x34 bytes |
| Menu Section Plus — Focus Camera | \\\[02B47730\\\] | — |   |
| Party Member Battle Logic | \\\[02089378\\\] | 40 members, 14 entries each |   |
| Skeleton Model | \\\[022C6F28\\\] | 160 |   |
| Formula Processing Keep | \\\[0208D480\\\] and \\\[0208DE80\\\] | 40 characters | Two arrays: party members / foes |
| Magick Effect Processing | \\\[022C17B0\\\] | 32 |   |
| Special Action Processing | \\\[022BE970\\\], \\\[022C1F50\\\], \\\[022C1F58\\\], \\\[022C2196\\\], \\\[022C21B8\\\], \\\[022C24C0\\\] | 32 targets, 7 party, 32 potential | Also a large fixed block 022C2159–022C22B8 |
| Loot Bag Processing | \\\[02EC0FA0\\\] | 10 bags × 7 contents |   |
| Loot Bag Processing Plus | \\\[022BE7F0\\\] | 10 |   |
| Trap Processing | \\\[02EC3EA0\\\]; count at \\\[02EC3EC8\\\], next id at \\\[02EC3EC4\\\] | 3 traps |   |
| Action List Categories | \\\[0208CD20\\\] | 26 |   |
| Battle Script Keep | \\\[02098E10\\\] | 5 | stride 0x288 |
| Battle Script Load Handler | \\\[022C6C00\\\] | 5 | Also \\\[022C6D3C\\\] = Pre-Z EBP file size |
| Battle Script Input | \\\[02099AC0\\\] | 64 |   |
| Script Actor Type | \\\[01E0C328\\\] | 8 | 4-byte records |
| Battle Player Character List | \\\[0209A1F0\\\] | 4 |   |
| Map Jump Group List | \\\[0209A210\\\] | 16 |   |
| VM Call Target table | \\\[02B57EF0 + type\\\*8\\\] | id = low 12 bits, type = id \\\>\\\> 12 | Records 0x20 bytes starting at +0x08 |
| VM Opcode | \\\[01EFEA50\\\] | 100 |   |
| File registry (File Viewer) | \\\[0215F000 + type\\\*8\\\], then \\\[+fid\\\*8\\\] | 41 types |   |
| File Load Handler | \\\[022C31C0\\\] | 64 |   |
| Memory Allocation | \\\[022D7FD0\\\] | 15, 9 blocks each |   |
| Memory Allocation Handler | \\\[022D89D0\\\] | 32 |   |
| Navi Map Data | \\\[02ADD100\\\] | count at \\\[+0x04\\\] |   |
| Map Ref (.mrf) | \\\[02099D88\\\] | 10 sections |   |
| Map Jump Group Flag Rom | \\\[02ADD0C8\\\] |   |   |
| Global Message | \\\[02AEE888\\\] |   |   |
| PC Skill Motion | \\\[02B58188\\\] |   |   |
| Behind Camera | \\\[02098DF0\\\] |   |   |
| License Node Icon | \\\[02CA9670\\\] | 2 groups × 4 entries |   |
| Traveler's Tips / Bestiary Requirements | \\\[02CA9738\\\] (clan primer) |   |   |
| Texture Image Map registry count | \\\[02090780\\\] |   |   |
| Inventory category table | 01EEBCC0 + cat\\\*0x58, count at +0x3C | 14 categories |   |
| Formula Processing Properties | 02AEDFB8 … 02AEE030 fixed block | — | Static, no script needed |
| Memory Allocation Properties | 022D89A8 … 022D8E28 fixed block | — | Static |
| File Load Properties | 01EED498, 0215EFF4, 022C51C0–022C51DC | — | Static |
| Debug Settings | ds\\\_base = 01F81428 | — | define, no code patch |
| Game Settings | gs\\\_base = 01F82D20 | — |   |
| Input Settings | is\\\_base = 01F7FFE0 | — |   |
| Post Processing | 01F82EA8, 01F81300, 01F7F598, 01F81168 | — | Four structures |

### 3.7 Game functions the table calls

Useful if you want to write your own scripts on top of the table.

  

|  |  |
| :-: | :-: |
| \*\*Address\*\* | \*\*Purpose\*\* |
| 00320A40 | Get Battle Unit Keep for party member id (ecx) |
| 00321170 | Get Battle Unit Work by index |
| 00358940 | Get Battle Actor Work (rcx = keep, edx = actor id) |
| 0030C470 | Set level / recompute stats |
| 0030F4B0 | Heal all (flags in edx; 0x0F = full) |
| 0037C980 | Party "all read" — refresh appearance/party state |
| 0031A260 | Unequip all equipment for a party member |
| 0031A630 | Set equipment (keep, slot, item id, inventory flag) |
| 00323910 | Unlock a license node |
| 00327CB0 / 00327DE0 / 00328140 / 00326030 | Gambit / battle-logic assignment and refresh |
| 0030FED0 | Set permanent augments |
| 003137F0 / 003138D0 / 00313550 | Get summoner, dismiss esper, clear esper |
| 003172E0 / 003170E0 | Add party member / add guest battle member |
| 00328B20 / 003288F0 | Remove party member / remove guest battle member |
| 003008A0 | Modify inventory (id, count, op, target, flags) |
| 00314440 | Teleport (location id, position index, flags) |
| 00303D90 | Set chocobo mode |
| 00300520 | Set HP |
| 002E16B0 / 002E08C0 | Open / close a message window |
| 002E1A60 | Open full-screen menu (ecx = flags, edx = id) |
| 002EFA70 | Screen fade |
| 001DBDB0 | Play sound effect |
| 0032FC30 / 002628B0 | Queue script (EBP) load / dispose script |
| 0032E400 / 0032E620 | Get file size / read file |
| 0036A190 / 003697F0 | Allocate / deallocate memory |
| 005CCB80 | Sleep (ms in ecx) |
| 00861EC0 | memset |
| 00267F90 / 00267F60 | VM: set int / float parameter |

  

-----

## 4\. Tool-by-tool reference

### 4.1 General

Six loose rows plus three flag folders. All static addresses — **no script to enable**, these work the moment the table is loaded.

  

|  |  |  |  |
| :-: | :-: | :-: | :-: |
| \*\*Row\*\* | \*\*Address\*\* | \*\*Type\*\* | \*\*Meaning\*\* |
| Vertical FOV (Radian) | 02097548 | Float | Camera vertical field of view. \\\~0.6–0.8 is sane; large values fish-eye badly. |
| No Clip Mode | 0209A3E2 bit 7 | Bit | Walk through geometry. |
| No Foe Spawn | 0209A3E7 bit 2 | Bit | Suppresses enemy spawning in the current area. |
| LCRNG | 022C256C | 4 bytes | Linear-congruential RNG state — the one most drop/steal rolls use. |
| PRNG (0 → 624) | 02EB4230 | 4 bytes | Mersenne twister index. |
| User Control State | 02098E24 | Byte | Whether the player has control (0 during cutscenes). |

  

**Chain** (022C3158–022C3178): chain level, normal chain count (stored −1), identical-foe chain count, reverse chain count, foe genus, foe chain identifier, last chain-level count (−1), loot count (stored +1), and an "Is Flashing" bit. Setting Chain Level to 4 and a high count gives instant max chain loot.

  

**Magick Field Flags** (022C314C, 32 bits): HP Sap, MP Sap, No Attacks, No Magicks, No Technicks, No Items, Magnet — bits 0–6. Bits 7–31 are reserved and named as such. These are the Mist-field/zone restriction flags.

  

**Rendering Flags** (022C7F90, 16 bits): World, Character, Particle, User Interface on bits 0–3; bits 4–15 unidentified. Clearing bit 3 makes a clean screenshot; clearing bit 0 leaves characters floating in the void.

### 4.2 Party Member Editor

Six one-shot maintenance actions plus one shared selector.

  

  - **Party Member** (pme\_id, byte, list PmePartyMemberList, 41 entries) — -1 = **All**, 0–39 = individual members (0–6 are the six playable characters plus Reks/guests; 32–39 are the Espers, ending at Zodiark). Every action below loops 0…0x27 when this is -1.

  

|  |  |
| :-: | :-: |
| \*\*Action\*\* | \*\*What the script actually does\*\* |
| \*\*Reset Level & Stats\*\* | Calls 0030C470 with your \*\*Level (1 → 99)\*\* value (pme\\\_level) on each selected member's Battle Unit Keep. Recomputes HP/MP/stats from the level table. |
| \*\*Reset Jobs\*\* | The heavy one. Unequips everything, clears \*\*and refunds\*\* every license node (skipping node 0x1F, "Essentials"), optionally re-unlocks that character's default nodes if \*\*Unlock Default Licenses State\*\* (pme\\\_udls bit 0) is set, dismisses the esper if that member is the summoner, re-applies permanent augment set 0x97, resets gambits, wipes 32 bytes of temporary augments, zeroes mist bars, and writes 0xFFFF/0xFF to the job fields at +0x1C3/+0x1C5. Refunded LP is capped at 99,999. Then runs Refresh Stats and Refresh Appearance. |
| \*\*Reset Equipment\*\* | Unequips all, then re-equips the five default items from battlepack section 16 (+0x0A in the party-member record) with the "add to inventory" flag off. |
| \*\*Reset Gambits\*\* | Re-applies the default gambit set link (section 16 +0x14), then recomputes the gambit slot count from temporary augments (keep+0x75) OR'd with permanent augments (keep+0x85), masked to 0x3FF. Slot count is clamped to \*\*minimum 2, maximum 12\*\*. |
| \*\*Refresh Stats (Always All)\*\* | 0030F4B0 with flags 0x0F — a full heal/stat recompute for the whole party. Ignores the Party Member selector. |
| \*\*Refresh Appearance (Always All)\*\* | 0037C980 — reloads party models/appearance. Ignores the selector. This is the call you want after changing a model id. |

  

**Risk:** Reset Jobs is destructive and irreversible in-session — it wipes the license board. It does refund LP, so it is the intended way to re-spec, but take a save first. Everything here writes to live game state, not to the save file, so a reload undoes it.

### 4.3 Party Editor

Adds or removes a party member, handling the guest/battle-member distinction.

  

  - **Party Member** (pe\_pmid, byte, PartyMemberList) — id ≤ 6 is treated as a real party member, \> 6 as a guest.
  - **Type** (pe\_type, byte, PeTypeList) — 0 = Add, 1 = Remove.

  

The dispatcher picks one of four game functions: add party member (003172E0), add guest battle member (003170E0), remove party member (00328B20), remove guest battle member (003288F0). When the active party is already at 4 members, an "add" of a normal member is routed to the guest path instead.

  

The **Execute Script** Lua stub does something unusual first: it reads 16 bytes at 0x01EF4168 and 0x01EF4188 and compares them against known-original vtable bytes. If they differ it sets pe\_tics = 1, which changes the dispatch table. This is an explicit compatibility check for the companion mod **"The Insurgent's Companions"** — if that mod is installed the Party Editor switches to its alternate add/remove routing. Nothing to configure; it is automatic.

### 4.4 Inventory Editor

Two actions, both calling 003008A0 (modify inventory).

  

  - **Add / Remove Any Content** — ie\_aorac\_id (content id, list ContCombList, 7,159 entries) and ie\_aorac\_count (signed; default 0x63 = 99). Negative counts remove. The combat-log popup is only shown when adding.
  - **Add / Remove All Content From A Category** — ie\_aorafc\_cat (list IeCategoryList, values 0–13: Item, …, Bazaar Good) and ie\_aorafc\_count. It walks 01EEBCC0 + cat\*0x58, reads the category's element count at +0x3C, and loops id = (cat \<\< 12) … (cat \<\< 12) | count. So the content id encoding is **category \<\< 12 | index** — that also explains the shape of ContCombList (0x0000 items, 0x1000 equipment, 0x2000 loot, 0x3000 gambits, 0x8000 key items, 0x9000 packages, 0xA000 rewards, 0xB000 prices, 0xC000 mist, 0xD000 bazaar goods, and 0xF000 = gil, ending at "4095 Gil").

  

**Risk:** adding 99 of every item in every category will blow past inventory slot limits. The game clamps, but the Menu block's slot table (see Save Game Editor) can end up inconsistent. Prefer per-category adds.

### 4.5 Free Teleport

Teleport anywhere, ignoring crystal/teleport-stone rules.

  

|  |  |  |
| :-: | :-: | :-: |
| \*\*Row\*\* | \*\*Symbol\*\* | \*\*Notes\*\* |
| Current Location | ft\\\_clid | Read-only display; a Lua timer seeds it from \\\[021654C4\\\] on enable |
| Teleport Type | ft\\\_tt | FtTeleportTypeList: 0 = Normal (plays the full teleport effect + sound 0x5F), 1 = Instant |
| Location | ft\\\_lid | LocationList — 1,315 entries |
| Position Index | ft\\\_pi | Spawn point within the location; seeded from \\\[021654C8\\\] |

  

Behaviour: refuses while a menu is open (shows *"You cannot teleport while another menu is open."*). If a chocobo is summoned it also refuses to teleport **into a town** — it checks the Navi Map Data record's bit 0 for "is town" and shows *"You cannot teleport to a town with a chocobo."* On success it fades to white, calls 00314440, and clears the 0x200-byte scratch2 variable block at 02099FF0.

  

**Two code patches while enabled:** 0025DE62 (play landing effect on location load end) and 002EFC5D (force white fade colour). Both restore cleanly.

  

**Risk:** teleporting into a location whose EBP/ARD is not appropriate for your story progress can drop you into an area with no exit trigger, or into a cutscene that expects flags you don't have. Save first; the flag-clearing of scratch2 is there to reduce, not eliminate, that risk.

### 4.6 Summon Chocobo

No parameters. Refuses in towns (*"You cannot summon a chocobo in a town"*), while an esper is out (bit 0 of \[021B8410\]), or while already riding (bit 1). On success: suspends battle, plays sound 0x54, sets chocobo mode, re-reads the party, resumes battle, and cycles the HP menu off/on for 1 second so the HUD redraws. Low risk.

### 4.7 Open Shop

**Shop** (os\_id, list BpShopList, 57 entries — "Travelling Merchant (Lowtown / North Sprawl)" through "Odo"). Opens full-screen menu type 2 with the showOnTopLayer flag (0x8002), disables user control, waits for the menu to close, then restores control and the HP menu. Refuses while another menu is open.

  

Practical use: reach any merchant's stock from anywhere, including shops gated behind story progress or bazaar unlocks.

### 4.8 Open Save / Load Menu

**Menu** (oslm\_id, OslmMenuList): 0 = Save, 1 = Load. Opens full-screen menu type 5 with showOnTopLayer. Refuses while another menu is open. Lets you save in places the game normally forbids — including mid-dungeon and during hunts.

  

**Risk:** saving in a scripted-sequence area can produce a save that reloads into a broken script state. This is the classic way to soft-lock a FFXII save.

### 4.9 Complete Bestiary

No parameters. memset(\[020927C0\] + 0x3404, 0xFF, 0x400) — fills 1 KB of the Menu block's bestiary region with 0xFF, marking every entry seen/complete. Instant and irreversible for the current session; it writes to the live menu data, which will be persisted on your next save.

### 4.10 Custom Foe Respawn

**Type** (cfr\_type, CfrTypeList): 0 = Instant, 1 = Chaotic.

  

Patches 002358A1 and 002358EB. The patch skips the foe's death-count and respawn-flag checks entirely, so kills respawn immediately. In **Chaotic** mode the second patch additionally allows the spawn to occur at the player's position rather than the scripted spawn point.

  

**Risk:** genuinely destabilising. Chaotic mode piles enemies onto the player and can exceed the area's unit budget; combined with No Foe Spawn off and a dense area it is a reliable way to crash. It also drives the Battle Unit Work pool. Use briefly, turn off before saving.

### 4.11 Kill Nearby Foes

No parameters. Iterates Battle Unit Work indices from \[0208E6A0\] down to 1. For each, it fetches the Battle Unit Keep (+0x698); skips if \[keep+5\] == 0 (party member); fetches the Battle Actor Work (+0x10) and reads the low nibble of \[+0x0E\] as unit type. **Only unit type 1 is killed.** Allies, hunt marks, bosses and hidden foes (mimics) are explicitly excluded by that check. Kills via 00300520 (set HP) with the "0x10" cause flag, so drops/EXP behave like a normal defeat. Low risk; nothing is patched.

### 4.12 Custom Battle Menu Action

**Action** (cbma\_act, 2 bytes, BpActionList, 544 entries; default 0x96 = Attack). Three patches:

  

  - 002FFC81 — test eax,eax → cmp eax,eax: the "can this action be cast" restriction check always passes.
  - 00305AE4 — replaces the action id read from the battle menu with cbma\_act.
  - 0030EF9A — cmp ax,cx → cmp eax,eax: consumable items are never removed.

  

Net effect: **whatever you select in the battle menu casts the action you set here, for free, ignoring licences, MP, silence and every other gate.** This is the table's most powerful single toggle and also the most likely to produce a malformed action state — casting an action whose formula expects data the caster doesn't have (e.g. an esper-only or event-script action) can hang the battle sequence. Disable before saving.

### 4.13 Battle Character Editor

The largest live-memory editor (2,146 rows). It binds to one actor and exposes nine structures.

  

**Selector rows**

  

|  |  |  |
| :-: | :-: | :-: |
| \*\*Row\*\* | \*\*Symbol\*\* | \*\*Meaning\*\* |
| Script Identifier (0 → 4) | bce\\\_sid | Which Battle Script Keep slot to read |
| Forced Actor Type | bce\\\_fat | BceForcedActorTypeList: 0 = None (use manual id), 1 = Leader, 2 = Target, 3 = Nearest. Non-zero overwrites the manual id each tick. |
| Leader / Target / Nearest Actor Identifier | bce\\\_laid / bce\\\_taid / bce\\\_naid | Read-only; leader and target come from \\\[022C7FE0\\\] and \\\[022C8380\\\], "nearest" is computed by a distance loop (003A1920) with a 10,000-unit cut-off |
| Actor Name | bce\\\_an | 128-byte string; the script pulls the Shift-JIS name out of the script's actor-name list and converts it with MultiByteToWideChar (code page 932, falling back to the system ACP) |
| Actor Count | bce\\\_acount | Read-only |
| Actor Identifier (0 → Count-1) | bce\\\_aid | Manual selection; self-clamping |

  

**Sub-structures** (each is its own script; enable only the ones you need)

  

|  |  |  |  |
| :-: | :-: | :-: | :-: |
| \*\*Group\*\* | \*\*Size\*\* | \*\*Base symbol\*\* | \*\*Notable contents\*\* |
| Battle Actor Work | 288 B | bce\\\_baw\\\_base | Identifier, \\\~10 flag folders (Interaction, Activity, Req State, Battle Task Execution State), current task ids, capture state, pointers to Unit Work / Actor Declaration / Function Declarations / Jump Labels / Instructions / Task lists / Skeleton / Model, last motion, \*\*Field Sign Icon\*\* (+0xF4), spawn group, target-info name pointer, \*\*Overhead Icon Type\*\* (+0x107), talk-hold timers |
| Battle Actor Skeleton | type-dependent | — | Three variants selected by type: 1 : Sign (128 B), 2 : Line (32 B), 3 : Unit (560 B). Only edit the one matching the actor's skeleton type. |
| Battle Actor Model | 392 B | bce\\\_bam\\\_base | Model type sub-folder, three unknown pointers, \*\*Battle Actor Keep pointer\*\* (+0x138), Weight (float), Model Variation / Model Color Variation (+0x14C/+0x14D) |
| Battle Actor Keep | 304 B | bce\\\_bak\\\_base | Weight, Current Position, Forward Position, Current/Default Colors, Animation State, Map Identifier, \*\*Map Jump Group\*\*, Terrain, \*\*Movement Speed\*\* (+0xC8), collision distances, \*\*Yaw\*\* (+0xF8) |
| Battle Task Control | 20 B | — | Per-task control record |
| Battle Task Execution | 40 B | — | Per-task execution record (holds the VM stack at +0x18) |
| Battle Unit Work | 3,920 B | bce\\\_buw\\\_base | See below |
| Battle Unit Keep Plus | 128 B | bce\\\_bukp\\\_base | Special spawn range, \*\*Current/Max Death Count\*\*, Death Time, \*\*Respawn Time\*\*, Name Variation, steal-state flags, summon group, real spawn group, persistent ids, Enmity table, default positions/yaw, temporary elemental affinities |
| Battle Unit Keep | 464 B | bce\\\_buk\\\_base | The character sheet — see §4.13.2 |

#### 4.13.1 Battle Unit Work (3,920 bytes) — highlights

Beyond the usual flags folders, this struct exposes four independently indexed sub-arrays, each with its own id row that self-clamps:

  

  - **Restrictions** — 5 entries at +0x6B9 (1 byte each)
  - **Active Targets** — 32 entries of 16 bytes at +0x778
  - **Reflect Targets** — 32 entries of 16 bytes at +0x980
  - **Potential Targets** — 32 entries of 16 bytes at +0xBC0

  

|  |  |
| :-: | :-: |
| \*\*Offset\*\* | \*\*Field\*\* |
| \\+0x08 | Focus Identifier (the actor's handle used everywhere else) |
| \\+0x10 | Battle Actor Work pointer |
| \\+0x24 / +0x28 / +0x2C / +0x30 | Party leader / counter target / animation caster / KO caster focus ids |
| \\+0x48 | \*\*HP Low Limit\*\* — the floor HP is clamped to; set \\\>0 for an unkillable unit |
| \\+0x4C–+0x51 | Despawn position range, despawn type (BceDespawnTypeList), despawn position id |
| \\+0x54–+0x58 | Belong, Classification, Genus, Spawn Group, \*\*Unit Type\*\* |
| \\+0x64 / +0x68 | Angle Detection / Radius Detection (aggro cone and range) |
| \\+0x70 | Steps (0 → 27) |
| \\+0x158–+0x190 | Follower speed, yaw, walk/run/battle-run speed, flying height, follower distance |
| \\+0x694–+0x6A0 | Magick-effect processing ids; \*\*Battle Unit Keep\*\* and \*\*Keep Plus\*\* pointers |
| \\+0x6B4–+0x6B8 | Action processing type, reserve target count, combo count, total combo count |
| \\+0x6E0–+0x6F8 | \*\*Gambit / auto-attack battle-logic pointers\*\* |
| \\+0x748–+0x770 | Auto-attack focus, party-leader target focus, idle charge time, queue/charge timers |
| \\+0xDC8–+0xDCC | Modified content, battle stance switch time |
| \\+0xE54/+0xE58 | Removed / added gil |
| \\+0xE60–+0xE78 | \*\*ARD Unit / Class / Default Stats / Additive Stats pointers\*\* — the bridge from a live foe to its ARD data |
| \\+0xE98 | Event Flag Group, plus Event Group / Death / Attacker flag folders |
| \\+0xEA8/+0xEA9 | Attacker count and attacker id list |

#### 4.13.2 Battle Unit Keep (464 bytes) — the character sheet

|  |  |
| :-: | :-: |
| \*\*Offset\*\* | \*\*Field\*\* |
| \\+0x04 / +0x05 | Identifier / \*\*Type\*\* (0 = party member — the editor refuses to bind when this is 0) |
| \\+0x06 | Mist Charges |
| \\+0x08–+0x22 | Additive Strength, Magick Power, Vitality, Speed, Attack Power, Defense, Magick Resist, Evade (Parry/Weapon/Shield), Magick Evade (Shield), Evade (Total), Magick Evade (Total) — all 2-byte |
| \\+0x24–+0x37 | \*\*Max HP\*\* (4 B), \*\*Max MP\*\* (2 B), then the base stats as single bytes: Strength, Magick Power, Vitality, Speed, Attack Power, Defense, Magick Resist, Evade (Parry/Weapon/Shield), Magick Evade (Shield), Evade (Total), Magick Evade (Total), \*\*Max Mist Bars\*\* |
| \\+0x48–+0x4E | \*\*Current HP\*\* (4 B), \*\*Current MP\*\* (2 B), Current Mist Bars |
| \\+0x50–+0x58 | \*\*Equipment\*\*: Weapon, Off-hand, Helm, Armor, Accessory (2 bytes each) |
| — | Seized Equipment (same shape, for the "seized" state) |
| — | Permanent Status Effect Immunities / Permanent Status Effects / Permanent Elemental Affinities / Temporary Status Effects folders |
| \\+0x68 | Temporary Augments (32 bytes; Reset Jobs wipes this) |
| \\+0x75 / +0x85 | Gambit-slot bitfields inside temporary / permanent augments |
| \\+0x88 | Default Level |
| — | Status Effect Durations, Status Effect Tick Durations, Augment Durations |
| \\+0x18C / +0x190 | \*\*EXP\*\* / \*\*LP\*\* (LP capped at 99,999 by the Reset Jobs refund) |
| \\+0x194 | Licences bitfield (1 bit per node) |
| \\+0x1C2 | \*\*Level\*\* |
| \\+0x1C3–+0x1C5 | \*\*Jobs\*\* (0xFFFF + 0xFF = no job) |

  

This is the structure to edit for "give this character 9999 HP right now". It is live state; it persists into your next save.

### 4.14 Save Game Editor

8,013 rows — over half the table. Six blocks, spanning sge\_mabase + 0 to +0x56690. The parent script only resolves five pointers; the 34 child scripts are per-array index resolvers of the same polling shape.

  

|  |  |  |  |
| :-: | :-: | :-: | :-: |
| \*\*Block\*\* | \*\*Base\*\* | \*\*Size\*\* | \*\*Contents\*\* |
| \*\*Session\*\* | sge\\\_mabase | 0x0200 | Save CRC checksum/remainder and CRC state (+0/+4), \*\*Gil\*\* (+8), Total Steps (+0xC), Game Time (total seconds ×60 as 8 bytes at +0x10, then hours/minutes/seconds), Save Menu sub-block (party members, summoned party member, clan points, \*\*Clan Rank\*\*, current location, save count, save slot, flags), save-game build date (YYYYMMDD), version fields |
| \*\*World\*\* | sge\\\_gibase (+0x0200) | 0x2000 | \*\*The story/quest flag map.\*\* 256 indexed Global Flags plus \\\~380 hand-named sub-groups covering nearly every sidequest, NPC conversation, cutscene and location trigger in the game, each labelled with its quest name (e.g. \*"Sidequest: Ktjn's Road to Improvement \\\> Points (-4 → 4)"\*). Also Special Foe States, Global Battle Flags, Outfitters Shop Contents, Global Quest Flags, Global Event Flags, Teleport Location Slots, Trophy Games, Location Discovery Cutscenes, Monograph Requirements, Hunt Companion Flags, Boss Encounter Cutscenes, and Quests (stages + locations). |
| \*\*Battle (Ineffectual)\*\* | sge\\\_biibase (+0x2200) | 0x6000 | A duplicate of the battle block that \*\*the table explicitly labels "(Ineffectual)"\*\* — writing here does nothing. Present for inspection/comparison only. Mirrors the real one: party members, inventory content counters, seized inventory counters, sold loot quantities, bazaar goods, party slots. |
| \*\*Menu\*\* | sge\\\_mebase | 0x4818 | Map Reveals (385 maps), Clan Primer (handbook triggers + bestiary — the region Complete Bestiary fills), \*\*Inventory Content Slots\*\* (the largest single script at 5,268 chars) and Inventory Content Type Counters (12 types) |
| \*\*Battle (live)\*\* | sge\\\_bibase = \\\[02EBF190\\\] | 0x8004 | The one that works: party members, inventory content counters, seized inventory content counters, sold loot quantities, bazaar goods, party slots, \*\*Party Member Gambits\*\* |

  

**Drop-downs used here** include SgeSpecialFoeStateList (109 marks/rare games, ids 0–684, ending "Omega Mark XII"), SgeTrophyGameList (31), SgeQuestList (256 quests by name), SgeMapRevealList (385), SgeTeleportLocationList (30, ids up to 32860), SgeMonographList (10), SgeHuntCompanionList (10), plus the config enums (camera mode, battle mode, music type, cursor position, camera axis, language) and the four equipment lists (SgeWeaponList 200, SgeArmorList 140, SgeAccessoryList 48, SgeAmmunitionList 32).

  

Special-foe and trophy-game states use a shared 3-value enum: 0 = Inaccessible, 1 = (available), 2 = Dead.

  

**Risk — the CRC.** The first two dwords of the Session block are the save CRC. The table exposes them but does **not** recompute them. Whether a hand-edited value survives depends on the game re-checksumming on its own save path; if you write directly into the save block and then save, you are relying on that. Editing live game state (Battle Character Editor, Party Member Editor) and then saving normally is the safer route to the same result.

  

**Risk — quest flags.** Setting a quest stage forward without its prerequisite flags is the number-one cause of unrecoverable FFXII saves. The World block gives you every one of those flags; treat it as a scalpel, not a hammer.

### 4.15 Battlepack Editor

The core game-balance database. 37 sections, each its own resolver script, plus a shared **Export Section To File** action.

  

**Parent script** registers bpe\_base\_call (section id → base) and bpe\_st2e\_call (parse an st2e container), bpe\_sid (which section to export) and bpe\_ueas (a per-export option, see below).

  

|  |  |  |
| :-: | :-: | :-: |
| \*\*\\\#\*\* | \*\*Section\*\* | \*\*What it holds\*\* |
| 0 | Weapon Stances | 23 stances; non-st2e layout (entry size at +0, count at +2, data from +4) |
| 3 | MP Regeneration | MP regen tiers |
| 5 | Equipment Categories | The 32 categories used by the restriction bitfields |
| 6 | Chain Levels | Chain thresholds/multipliers |
| 7 | Gambits | 256 gambit targets. Editing here triggers a party-wide battle-logic refresh (see below) |
| 8 | Gambit Sets | Default gambit loadouts |
| 9 | Level Up Stats | The per-level stat table |
| 10 | Action Groups | Offset-table section (not st2e); entry count at +0, entry pointers from +4, terminated by an end-of-section offset |
| 11 | Magick Categories | 5 categories (White/Black/Time/Green/Arcane) |
| 12 | License Nodes | Name, Description, \*\*LP Cost\*\*, Type (BpeLicenseNodeTypeList, 30), Restriction (BpeLicenseNodeRestrictionList), default-unlock flags per character, and type-dependent contents |
| 13 | Equipment & Attributes | Two linked arrays — see below |
| 14 | Actions | The action database — see below |
| 15 | Status Effects | 32 effects; has a \*\*Refresh Positive & Negative Status Effects\*\* action |
| 16 | Party Members | The party-member template — see below |
| 17 | Battle Menu Categories |   |
| 18 | Items | Sort, Icon, action description/name links, Gil |
| 26 | Mist (Unused) | Present but flagged unused |
| 27 | Battle Menu Restrictions | Bespoke layout: restriction list at +0x0C, mode list at +0x1C |
| 28 | Prices | 128 price entries |
| 29 | Magicks | 81 |
| 30 | Technicks | 24 |
| 31 | Concurrences | 16 |
| 32 | Loot | Gil value, Description, Icon, Name, Sort |
| 33 | Maps | 64 |
| 34 | Teleport Locations | 32 |
| 35 | Key Items | 416 |
| 37 | Packages | 512 |
| 38 | Rewards | 256 |
| 39 | Shops | 57 shops → events → contents; three levels of pointer chasing |
| 41 | Elements | 8 |
| 42 | Initial Inventory |   |
| 57 | Bazaar Goods | 128 |
| 58 | Augments | 131 |
| 59 | Story Point Addition Contents |   |
| 60 | Story Point Additions | 50 |
| 68 | Location Movement Behavior? | Purpose uncertain — the table itself marks it with a question mark |
| 69 | Movies |   |

#### 4.15.1 Section 13 — Equipment & Attributes

Two arrays that must be navigated together. The resolver computes the attribute count by subtracting the section-13 attribute-list base from **section 14's** base and dividing by the 0x18 attribute stride — i.e. attributes live in the gap between sections 13 and 14.

  

**Equipment record** (bpe\_eaa\_ebase): Name (+2), Icon (+4), Optimization Tiebreaker (+6), flags, Sort (+8), Category (+9), Description (+0x0E, marked *Ineffectual*), Metal (+0x10), **Gil** (+0x12), **Attribute Pointer** (+0x28), then a "Type Properties (Only Edit One Based On Type)" folder whose layout depends on the equipment category.

  

**Attribute record** (bpe\_eaa\_abase, 0x18 bytes): Max HP, Max MP (2 B each), Strength, Magick Power, Vitality, Speed (1 B each), then Status Effects, Status Effect Immunities and Elemental Affinities bitfields.

  

bpe\_eaa\_eaid shows which attribute index the currently selected equipment points at — that is how you find the right attribute row for a weapon.

#### 4.15.2 Section 14 — Actions (the most detailed record in the table)

bpe\_act\_base. This is where you change what a spell or attack does.

  

|  |  |
| :-: | :-: |
| \*\*Offset\*\* | \*\*Field\*\* |
| \\+0x00 | Battle Menu Description |
| \\+0x02/+0x03 | Dash Range To / From (÷10, animation-relative) |
| \\+0x04 | Knockback Chance |
| \\+0x05 | \*\*Range\*\* (÷10) |
| \\+0x06/+0x07 | Area of Effect Size / Cone Angle or Linear Size |
| \\+0x08 | \*\*Formula\*\* (BpeFormulaList, 109 entries, 0 = None … 108 = Missing HP Damage) |
| \\+0x09 | \*\*Charge Time\*\* |
| \\+0x0A | \*\*MP / Mist Cost\*\* |
| \\+0x0B | Esper Technick Rank? |
| \\+0x0C–+0x0F | \*\*Flag word 1\*\* (32 bits): Can Target Self / Reflect To Party / Can Target Ally / Can Target Foe; Initial Target (3 bits); Battle Menu Type (2 bits); Is Positive; No AoE Indicators; Allow Magick-Immunity; Allow Physical-Immunity; Allow Reflect; Allow Magick Evade; Deny While Silenced; AoE Origin (Target/Caster); AoE Shape (Circle/Cone/Linear); Use Weapon Range; Use Weapon Charge Time; Can Target Reserve; Has MP/Mist Cost; Use Event Script; Has Countable Required Content |
| \\+0x10/+0x11 | \*\*Power\*\* / Power Multiplier |
| \\+0x12 | Accuracy Rate |
| \\+0x13 | \*\*Elements\*\* bitfield (Fire, Lightning, Ice, Earth, Water, Wind, Holy, Dark) |
| \\+0x14 | On-Hit Rate |
| \\+0x15 | Amount Multiplier |
| \\+0x18–+0x1B | \*\*Status Effects\*\* bitfield — all 32 named (KO … X-Zone) |
| \\+0x1C | Character Animation (BpeCharacterAnimationList) |
| \\+0x1D/+0x1F/+0x20 | Enmity: add self vs foe, add self vs ally, remove ally vs foe |
| \\+0x1E | Category |
| \\+0x21 | Charge Aura Animation |
| \\+0x22 | \*\*Required Content\*\* (the item a technick/item action consumes) |
| \\+0x24 | \*\*Cast Animation\*\* \*or\* \*\*Event Script\*\* (same offset; which one is live depends on the "Use Event Script" flag) |
| \\+0x26 | Summoned Party Member |
| \\+0x28 | Mist Cast Animation |
| \\+0x2C/+0x2D | \*\*Flag word 2\*\*: Magicks Category (3 bits); Trigger Inquisitor; Trigger Warmage; Can Target KO; Can Target Stone; Pause While Execution; Use One Status Effect Only; Remove Sleep & Confuse; Remove Invisible; Can Restore HP; \*\*No License\*\*; Is Offensive; Can Restore MP |
| \\+0x2E | Inventory Menu Description |
| \\+0x30 | Special Character Animation |
| \\+0x34 | \*\*Name\*\* |
| \\+0x36 | \*\*Flag word 3\*\*: Status Effect Action Type (2 bits: None/Add/Remove); AoE Target Relation (2 bits: Same/Opposite/All); Can Target Flying; Can Target Undead |
| \\+0x38 | \*\*Gambit Page\*\* (0 → 10, 255 = none) |
| \\+0x39 | \*\*Gambit Page Order\*\* (0 → 16, 255 = none) |
| \\+0x3A | Enable Battle Memory Flag |

  

Two helper actions live under this section: **Refresh Gambit Action Pages** (walks section 14 and rebuilds the gambit action menu pages from the +0x38/+0x39 fields) and **Refresh Action List Categories** (rebuilds the 26 action-list categories at \[0208CD20\]). Run them after editing gambit page assignments, otherwise the menu keeps the stale layout until a reload.

#### 4.15.3 Section 16 — Party Members (0x7C+ bytes each)

The template every party member is built from. This is what Reset Equipment and Reset Gambits read.

  

|  |  |
| :-: | :-: |
| \*\*Offset\*\* | \*\*Field\*\* |
| \\+0x00–+0x03 | \*\*Restricted Equipment Categories\*\* — 27 named bits (Unarmed, Sword, Greatsword, Katana, Ninja Sword, Spear, Pole, Bow, Crossbow, Gun, Axe, Hammer, Dagger, Rod, Staff, Mace, Measure, Hand-Bomb, Shield, Helm, Armor, Accessory, Crown, Arrow, Bolt, Shot, Bomb). A set bit \*\*forbids\*\* the category. |
| \\+0x04–+0x06 | Quickenings 1/2/3 |
| \\+0x07 | Behind Camera Identifier |
| \\+0x0A–+0x12 | \*\*Default Equipment\*\*: Weapon, Off-hand, Helm, Armor, Accessory |
| \\+0x14 | \*\*Gambit Set Identifier\*\* (add 20480 = 0x5000 for the content-id form) |
| \\+0x16–+0x2A | Stats with per-level modifiers: Max HP + two modifiers, Max MP + modifier, Strength, Magick Power, Vitality, Speed each with a modifier byte, Evade |
| \\+0x2B | Detection Range |
| \\+0x2C | Flags: Party Join Level Sync Type (2 bits — Never/Once/Always), Gambit State |
| \\+0x2E | \*\*Level\*\* |
| \\+0x30 | \*\*Name\*\* |
| \\+0x32 | Summon Time (espers) |
| \\+0x34–+0x3D | Inventory / Guest & Esper Abilities — 10 slots, quantity + content id |
| \\+0x3E | Gil |
| \\+0x44 | \*\*LP\*\* |
| \\+0x46 | Mist Bars |
| \\+0x47 | Initial MP Percentage |
| \\+0x48–+0x4B | Status Effects bitfield (32 named) |
| \\+0x4C–+0x4F | Status Effect Immunities bitfield (32 named) |
| \\+0x50–+0x57 | \*\*Augments\*\* — a 64-bit field with every augment named (Stability, Safety, Accuracy Boost, … Battle Lore 16). This is the 0x97 set Reset Jobs re-applies. |
| \\+0x70 | \*\*Model\*\* (4 bytes) |
| \\+0x70 | \*\*Sub Model\*\* — same offset, alternate view with the inline 13-entry drop-down (Viera Dweller/Warder, Mjrn, Jote, Relj, Dalmascan Soldier, and the seven vanilla models) |
| \\+0x74/+0x75 | \*\*Model Variation\*\* / \*\*Model Color Variation\*\* |
| \\+0x7A | Weight (×10) |

  

**Model id encoding.** Model values are (ASCII prefix \<\< 16) | file number. The prefixes observed in ModelList (944 entries) are:

  

|  |  |  |  |
| :-: | :-: | :-: | :-: |
| \*\*High word\*\* | \*\*Letter\*\* | \*\*Contents\*\* | \*\*Count\*\* |
| 0x62 | b | Doors, elevators, set-pieces (Oubliette Door, Sochen Elevator) | 18 |
| 0x63 | c | Main characters (Vaan = 0x630000, Reddas, …) | 23 |
| 0x67 | g | Gimmick/prop models (Water Pouch, Bangaa Corpse) | 104 |
| 0x6D | m | Foes (Ring Wyrm, Wolf, …) | 254 |
| 0x6E | n | NPCs (Tomaj, Kytes, …) | 175 |
| 0x73 | s | Espers/summons (Belias, Ultima, …) | 26 |
| 0x74 | t | Treasure objects | 17 |
| 0x77 | w | Weapons (Knife, Bonebreaker, …) | 327 |

  

So Viera (Dweller) 7209005 = 0x6E002D = NPC model 0x2D.

  

**After changing a model** run *Party Member Editor → Refresh Appearance*, or change zone. The model is loaded at party-read time, not per-frame.

#### 4.15.4 Export Section To File

A Lua action (9,833 characters — the longest script in the table). Reads \[0208E680\], resolves the section from bpe\_sid, opens a Save dialog defaulting to section\_NNN.bin, then:

  

1.  **pause()****s the game**,
2.  temporarily rewrites in-memory absolute pointers to file-relative offsets,
3.  writeRegionToFile,
4.  **restores every pointer it changed**,
5.  unpause()s and shows "Succeeded\!".

  

Five sections take bespoke paths: 0 (raw header+entries), 10 (offset table), 13 (equipment + attributes, honouring bpe\_ueas), 27 (restrictions + modes) and 39 (shops → events → contents). Everything else uses the generic st2e path, which also zeroes the unused text-section offset at +0x14 before writing.

  

bpe\_ueas ("unique equipment attributes state") controls section 13's export:

  

  - 0 — in-place export: attributes stay shared, section size is derived from the gap up to section 14.
  - non-zero — the script allocates a scratch buffer and writes **one attribute record per equipment item**, giving every item a private attribute block. Use this when you want to edit item stats independently in an external tool.

  

**Risk:** the pointer fix-up window is the dangerous part. If the write fails or CE is killed between steps 2 and 4, the live battlepack is left holding **offsets where pointers should be** and the game will crash on the next access. The script pauses the game to shrink that window, but do not alt-tab away mid-export.

  

The ARD, EBP, MRP, TM2, License Node Icon, Traveler's Tips, Bestiary, Navi Map, Map Ref, Map Jump Group Flag Rom, Global Message, PC Skill Motion and Behind Camera editors each have their own smaller Export action following the same pattern.

### 4.16 Area Resource Data (ARD) Editor

Per-area foe data. Seven of the ten sections are exposed.

  

|  |  |  |
| :-: | :-: | :-: |
| \*\*\\\#\*\* | \*\*Section\*\* | \*\*Contents\*\* |
| 1 | Model Motions | Motion sets per model |
| 2 | Classes | The "species" record — see below |
| 3 | Battle Logics | Scripts → groups → 0x18-byte entries. Three nested indices (arde\\\_bl\\\_sid/gid/eid); group list is a byte array terminated by 0, max 32 groups |
| 4 | Units | The per-encounter foe record — see below |
| 7 | Default Stats | Clan Points, Evade (Shield), Magick Evade (Shield), \*\*Max HP\*\* (+0x20), \*\*Max MP\*\*, Strength, Magick Power, Vitality, Speed, Evade (Parry), Defense, Magick Resist, Attack Power, Evade (Weapon), \*\*License Points\*\*, \*\*Gil\*\* (+0x30), \*\*Experience\*\* (+0x34) |
| 8 | Additive Stats | Same shape; the per-level growth applied on top |
| 9 | Special Action Animations |   |

  

**ARD Section 4 — Units** (arde\_units\_base) — this is the record you edit to change a specific enemy encounter:

  

|  |  |
| :-: | :-: |
| \*\*Offset\*\* | \*\*Field\*\* |
| \\+0x00 | \*\*Class Identifier\*\* (into section 2) |
| \\+0x02 | Name Variation Group Identifier |
| \\+0x03 | Flags 1: Custom Health Bar Type (2 bits — None / … / 50 Bars), Red Dot Size Type (Small/Big), \*\*Is Boss?\*\* |
| \\+0x08 | \*\*Name\*\* |
| \\+0x0A–+0x0E | \*\*Size %\*\* X / Y / Z (2 bytes each — this is how you make giant or tiny foes) |
| \\+0x11/+0x12 | Model Variation / Model Color Variation |
| \\+0x13 | Forced Weapon Stance Animation |
| \\+0x15 | Flags 2: \*\*Use Weapon Stats\*\*, \*\*Use Shield Stats\*\*, No Floating Health Bar, No Target Line, No Action-Category-Specific Target Line \*(marked Ineffectual)\* |
| \\+0x16 | \*\*Weapon\*\* |
| \\+0x18 | \*\*Custom Initial HP\*\* (4 bytes) |
| \\+0x1C | \*\*Off-hand\*\* |
| \\+0x22 | \*\*Default Stats Identifier\*\* (into section 7) |
| \\+0x24 | \*\*Additive Stats Identifier\*\* (into section 8) |
| \\+0x26 | Charseinfo\\\_?.bin related — purpose unconfirmed |
| \\+0x28–+0x30 | \*\*Drops\*\*: Common, Uncommon, Rare, Very Rare, Guaranteed |
| \\+0x32–+0x36 | \*\*Steals\*\*: Common, Uncommon, Rare |
| \\+0x38/+0x3C | 1st / 2nd Overlay Model |
| \\+0x42/+0x43 | Monograph Rate / Canopic Jar Rate |
| \\+0x44/+0x46 | \*\*Poaches\*\*: Common, Uncommon |
| \\+0x48/+0x4A | Monograph Type / Drop |
| \\+0x4C/+0x4E | Canopic Jar Type / Drop |
| \\+0x50+ | \*\*Battle Logic Identifiers\*\* — 4 slots (indexed by arde\\\_units\\\_bliid), each a 2-byte index into section 3 |

  

**ARD Section 2 — Classes** (arde\_cls\_base), the shared species data:

  

|  |  |
| :-: | :-: |
| \*\*Offset\*\* | \*\*Field\*\* |
| \\+0x00 | \*\*Model\*\* (same encoding as §4.15.3) |
| \\+0x04/+0x05 | \*\*Classification\*\* / \*\*Genus\*\* |
| \\+0x10 | Weight (×10) |
| \\+0x12 | Flags 1: Charge Aura Animation Scale (3 bits, Very Low → Very High), \*\*Has Collision\*\*, \*\*Requires Flying Hit\*\* |
| \\+0x18 | Flags 2: Special Behavior (3 bits, 8 values), \*\*Is Flying\*\*, \*\*Is Floating\*\*, \*\*Can Teleport\*\* |
| \\+0x20 | \*\*Max Combo Hits\*\* |
| \\+0x21 | Flags 3: Use Distanced Attack |
| \\+0x22/+0x23 | \*\*Angle Detection\*\* / \*\*Radius Detection\*\* (aggro) |
| \\+0x25/+0x26 | \*\*Magick Detection\*\* / \*\*Life Detection\*\* |
| \\+0x28 | Flags 4: Use Grounded Attack, \*\*No Chain\*\* |
| \\+0x29 | \*\*Elemental Affinities\*\* — 5 sub-folders: Absorb, Half, Immune, Weak, Potency |
| \\+0x30–+0x3E | Actions 0–7 — the table labels this whole block \*\*(Unused)\*\* |
| \\+0x40 | Chain Identifier |
| \\+0x52 | \*\*Bestiary Identifier\*\* |

  

**Important:** the ARD is per-area. Editing it changes foes in the currently loaded area only, and the changes are lost when the ARD is reloaded on zone change. There is no ARD hot-reloader in the File Reloader group — to persist ARD edits you must export the section and patch the file on disk.

### 4.17 Environment Blueprint Pack (EBP) Editor

The per-area script blueprint — where units are placed, what triggers exist, and the compiled event VM code. 487 rows, 32 scripts, the second-densest editor.

  

**Identifier (0 → 4)** (ebpe\_ebpid) picks one of the five EBP slots at \[022C6C00\]; EbpTypeList names them 0 = Battle … 4 = Debug.

  

Four sections are exposed: **0 : Script**, **4 : Navigation Icons**, **12 : Models**, **16 : Spawn Positions**.

  

Section 0 (Script) is subdivided into 25 named arrays, each its own resolver:

  

|  |  |
| :-: | :-: |
| \*\*Sub-array\*\* | \*\*What it is\*\* |
| Header | Date Time, Author Name, File Name (16-char strings), plus File Storage / Stack Storage / Source Data start markers |
| Setup Function Sequence | The order setup functions run in |
| Weathers | Per-area weather table |
| Actor Type Declarations | Which actor types this script uses |
| Actor Declarations | The actor table (5,589 chars — the biggest sub-script). This is the list the Battle Character Editor reads names from |
| Push Integers / Push Floats / Push Variables / Push Acts & Tags | The VM constant pools. Variables carry a scope (EbpeVarScopeList: Global, …, Table) and a type (EbpeVarTypeList: Uchar … Float) |
| Req All Arrays | REQIALL request tables; ReqTypeList has 32 entries |
| Map Jump Positions / Map Destination Positions | Zone transition endpoints |
| Map Icons | EbpeMapIconGroupList: Local Exit Line, …, Strahl |
| Map Exit Lines |   |
| Field Signs / Field Sign Rectangles / Field Sign Circles | Interaction prompts; shape type Rect/Circle, icons Magnifying Glass / … / 1 Exclamation Point |
| External Labels | Cross-script jump targets |
| Capture Actors | captureallforsummon / capturepartyforsummon groups |
| Model Motions |   |
| Treasure (setuptreasure) | Chest contents and respawn behaviour |
| Unit Status Effects (btlAtelSetStatus) | EbpeBtlAtelSetStatusList: None / … / Immune — 32 rows link to it |
| Spawn Unit Control (btlAtelSetEntryStruct) | Which ARD unit spawns, how many, under what conditions |
| Spawn Unit Map (btlAtelSetTotalEntryNumber) | Total spawn counts per group |
| Spawn Position Map (btlAtelSetPoint2) | Which spawn positions each group uses |
| Texture Icons (registshape) |   |
| Traps | Trap placement |

  

Section 16 (Spawn Positions) records carry a Type byte, a Radius Position folder, a Spawn Position folder and a **Direction (Radian)** float at +0x1C.

  

The sub-array names in parentheses are the actual FFXII script API function names — that mapping is one of the most useful things in this table if you are reverse- engineering .ebp files.

  

**EBP Loader / EBP Disposer** (separate top-level tools) let you force-load or force-dispose a blueprint: Loader takes a **Type Identifier (0 → 4)** and a **File Identifier** (list EbplEventFileList, 741 entries, e.g. bul\_a0380; debug slot uses EbplDebugFileList, 11 entries) and calls 0032FC30 (queue script load). Disposer calls 002628B0 on the chosen slot.

  

**Risk:** disposing the blueprint for the area you are standing in destroys the script that owns your actors. Expect a crash. Loading an event EBP into the wrong slot is similarly unsafe. These two are debug tools, not gameplay tools.

### 4.18 Menu Resource Pack (MRP) Editor

Menu graphics. **File Type** (mrpe\_ft, MrpeFileTypeList) selects the source:

  

  - 0 : Pack — the 23-section pack list at \[0209AC60\] (MrpePackSectionList: Controller Icons … Keyboard Icons)
  - 1 : Menu — one of 10 individual menu files (MrpeMenuFileList: gameover, …, party\_book), whose bases the editor's code hook captures
  - 2 : Last Loaded — whatever MRP was loaded most recently

  

Validates the magic 'MRP\\x01' at the file base, then exposes texture count, groups, textures and entries (MrpeEntryTypeList, 9 types). Entry records are variable-length: the resolver walks the list adding \[entry\] (a size byte) per step, so entry index lookup is O(n).

  

**This editor installs two code patches** (0032E8C9, 002A00FF) purely to record pointers. They are cheap and restore cleanly, but they are live hooks — if you are chasing a crash, this is one of the five scripts to rule out.

### 4.19 Texture Image Map (TM2) Editor

Reads the loaded TM2 texture set. Count at \[02090780\]. Exposes **Registry**, **Icon Sections** and **Clut Groups** folders, with PS2-native format enums: TimeColorTypeList (Undefined, …, 8-bit indexed), TimePixelStorageFormatList (13 entries, PSMCT32 … PSMZ16S), TimeClutStorageFormatList (PSMCT32 … PSMCT16S), TimeTextureFunctionList (Modulate, Decal, Hilight, Hilight 2). Has an **Export To File** action.

### 4.20 License Node Icon Editor

\[02CA9670\], 2 groups (LnieGroupList: Available / Obtained) × 4 entries. Small editor for the licence-board icon atlas. Export action included.

### 4.21 Traveler's Tips & Bestiary Requirements Editors

Both read the clan primer at \[02CA9738\].

  

  - **Traveler's Tips Requirements** (ttre\_base): Handbook Trigger Flag / Value / Handbook Flag (+0–+2), Map Flag (+4), Story Progress (+6). Page names in TtrePageList (16, "The Clan Primer" … "Chaining for Fun & Profit").
  - **Bestiary Requirements** (bre\_base): Index Page plus six page fields at +0–+0x0C, then a Flags folder. BreTypeList: Kill Count / … / Unused.

  

These control **when** a primer/bestiary page unlocks, not its content.

### 4.22 Navi Map Data Editor

\[02ADD100\], count at +0x04. Two flag folders per location. Free Teleport reads bit 0 of the per-location byte at +0x0A as "is a town" — that is the flag that blocks chocobo teleports into towns.

### 4.23 Map Ref Editor (.mrf)

\[02099D88\], 10 sections, 5 exposed: **0 : Locations**, **1 : Regions**, **3 : Weathers**, **4 : Terrains**, **5 : Footsteps**. Lists: MreWeatherList (16), MreWeatherTypeList (Rainy/Snowy/Sandy/Foggy/Cloudy), MreTerrainList (32), MreTerrainTypeList (Water/Earth/Fire/Lightning/Wind). Hot-reloadable — see File Reloader.

### 4.24 Map Jump Group Flag Rom Editor

\[02ADD0C8\]. Groups → entries. MjgfreFlagGroupList (11 named groups such as "Party Menu - Equip" and "Party Menu - Party (Lock)") and MjgfreRangeModeList (Start / End-or-Single). This is what greys out menu options in particular areas.

### 4.25 Global Message Editor

\[02AEE888\]. Count/id plus a Type byte at gme\_base + 0x07 and a "Type Properties (Only Edit One Based On Type)" folder. GmeEntryTypeList: Message, …, Key Item (6 types). These are the transient corner pop-ups ("Obtained X").

### 4.26 PC Skill Motion Editor

\[02B58188\]. 10 bytes per record: **Model** (4 B), **Weapon Stance** (2 B), **Special Character Animation** (2 B), **Animation File Identifier** (2 B). This is the table that decides which animation file a given model+stance combination uses — the thing you must edit when giving a party member a body type whose skeleton differs from the original. Hot-reloadable.

### 4.27 Behind Camera Editor

\[02098DF0\]. 0x40 bytes: **View Angle Y Offset** (float, +0) then fifteen further floats at +8 … +0x3C whose meanings are **not identified** in the table (every one is labelled ?). BcameBehindCameraList has 17 entries (255 = None, 0–15). Party members reference a camera by id at battlepack section 16 +0x07. Hot-reloadable.

### 4.28 Menu Section Editor

A live UI-tree walker. mse\_sbase points at the current menu section; the eight **Actions** are one-shot navigations/operations:

  

|  |  |
| :-: | :-: |
| \*\*Action\*\* | \*\*Effect\*\* |
| Goto Parent / Child / Older Sibling / Younger Sibling | Re-points mse\\\_sbase via the pointers at +0x10 / +0x18 / +0x28 / +0x20 |
| Hide / Show | Calls the game's hide/show on the section (requires a parent) |
| Unload | Calls the section's unload routine |
| Reload | Re-creates the section using saved processing/unload calls, parent pointer and size |

  

**Menu section record** (mse\_sbase):

  

|  |  |
| :-: | :-: |
| \*\*Offset\*\* | \*\*Field\*\* |
| \\+0x00 / +0x08 | Processing Call / Unload Call |
| \\+0x10 / +0x18 / +0x20 / +0x28 | Parent / Child / Younger Sibling / Older Sibling section pointers |
| \\+0x30 | Child Count |
| \\+0x38 | Render pointer (referenced from code at 0x002463BE) |
| \\+0x44 | Unload Order? |
| \\+0x48 | Default Fade Pointer |
| \\+0x50 | Flags — the entry count is (dword \\\>\\\> 2) & 0xFFFF |
| \\+0x58 | MRP Group Pointer |
| \\+0x60 | \*\*Entry List Pointer\*\* (entry i = \\\[list + i\\\*8\\\]) |
| \\+0x68 | Current Fade Pointer |
| \\+0x70 / +0x74 | Unidentified dword / State Change Time? |
| \\+0x90 / +0x94 | Change Delay (frames) / Last Change Time |
| \\+0x98–+0x9E | \*\*Position X / Y, Width, Height\*\* |
| \\+0xA0 / +0xA1 | \*\*Alpha\*\* / \*\*Contrast\*\* |
| \\+0xA2 | Identifier? |
| \\+0xA8–+0xBC | Border folder, two unidentified bytes, Active Time, one unidentified float |

  

Editing Position/Width/Height/Alpha live is the fastest way to prototype HUD layout changes; the values are re-applied every frame by the owning menu, so some fields snap back — those are the ones you need to change in the MRP or in UI Settings instead.

### 4.29 Menu Section Plus Editor

Nine specialised views onto specific menu sections, each with its own resolver and its own index bounds:

  

|  |  |  |
| :-: | :-: | :-: |
| \*\*View\*\* | \*\*Source\*\* | \*\*Max index\*\* |
| License Board | \\\[0209AC60\\\] | Four nested indices: 4, 16, 14, 32, 14 |
| Quickening | \\\[0209BE80\\\] | 4 and 6 |
| Rectangle | \\\[0209AC60\\\] | 8 — MspeRectProcessingTypeList: Wait / Process / Process Blink |
| Party Member List | \\\[0209AC60\\\] | 9 |
| Party Member Stats | \\\[0209AC60\\\] | 9 |
| Party Member Portrait | \\\[0209AC60\\\] | 9 |
| Focus Camera | \\\[02B47730\\\] | — |
| Inventory Bottom Bar | \\\[0209AC60\\\] | — |
| Inventory Preview Icons | \\\[0209AC60\\\] | 10 — MspeIpiResourceList: Item Gra Texture … Item Gra 7 Image |

  

Quickening also has MspeQknProcessingTypeList (Wait / Process / Shuffle).

### 4.30 License Board Node Editor

The live per-node record (lbne\_base, 0x34 bytes):

  

|  |  |
| :-: | :-: |
| \*\*Offset\*\* | \*\*Field\*\* |
| \\+0x00 | Name Text Pointer |
| \\+0x08 | Identifier |
| \\+0x0B | Restriction |
| \\+0x0C | \*\*Cost\*\* |
| \\+0x0E | License Icon Link |
| \\+0x10 | Type Text Pointer |
| \\+0x14 | Flags folder |
| \\+0x20 / +0x21 | \*\*Column\*\* / \*\*Row\*\* (board grid position) |
| \\+0x22 | Animation Type (0 → 4) |
| \\+0x25 | Alpha |
| \\+0x2A / +0x2C | Animation Delay / Animation Time |
| \\+0x30 | \*\*Type\*\* (LbneTileTypeList: None … Purchased) |

  

Column/Row are the practical fields — they let you physically rearrange the board.

### 4.31 Party Member Battle Logic Editor

\[02089378\]. **Identifier (0 → 39)** picks a party member; pmble\_pmbase + 0 is the **Entry Count (0 → 14)** followed by 0x1F unused bytes and then the Entries folder. Each entry is a gambit line: action + target condition + target type + case-link type, drawn from the four huge battle-logic lists (BattleLogicActionList 1,729 entries; BattleLogicTargetConditionList 2,053; BattleLogicTargetTypeList 1,660; BattleLogicCaseLinkTypeList 4).

  

This is the live gambit editor — it edits what the character is actually running, as opposed to battlepack section 7/8 which edits the definitions.

### 4.32 Menu Member Editor

mme\_base, 9 slots. The menu's view of a party member: flags, focus ids, target info name pointer, angle/radius detection, **Current/Default Max/Max HP**, **Current/Default Max/Max MP**, Mist Charges, current & required charge time, Temporary/Permanent Status Effects, Augments, current action, queued manual action, identifier, type, **Bestiary Identifier**, Status Effect Tick Durations, current/max mist bars, name variation, Elemental Affinities, **EXP** (+0x90) and next-level EXP requirement, Equipment folder, **LP** (+0xB0), Quickenings, **Level** (+0xBA) and Quickening Count.

  

Useful when you want the *menu* to show a value the battle system hasn't committed yet, or to diagnose why the HUD and the battle data disagree.

### 4.33 Skeleton Model Editor

\[022C6F28\], 160 slots. Mostly unidentified: of \~40 leaf rows, the ones with meaning are Rotation folders (two), Current Position folders (two), **Shadow Alpha** (+0x274), Motion Timer (+0x308), Next Animation (+0x3B4), two attach-related words (+0x3CC/+0x3CE), Current Animation (+0x3FA), and three timers at +0x640–+0x648 labelled **Lip-Sync**, **Nod** and **Swing**. Four "Unknown Flags" folders and about a dozen ? rows remain unidentified — the table is honest about this and so is this document.

### 4.34 Formula Processing Properties & Formula Processing Keep Editor

**Formula Processing Properties** is a static block at 02AEDFB8–02AEE030: a live trace of the damage formula currently being evaluated. Skip / Miss / Immune / Counter / Knockback / Element Immune / Element Absorb state, Action, Knockback and Counter chance, Accuracy Rate, Combo Chance, On-Hit Rate, Evade Parry/Shield/Weapon, removed/added target mist bars, target MP text state, removed/added target and caster HP and MP, matched HP/MP values, target Strength / Magick Power / Defense / Magick Resist / Level, caster Level, Common/Uncommon/Rare steal state, Added Content, and finally **Power / Multiplier / Modifier** as floats at +0x54–+0x5C. Plus the Battle Unit Work pointer at 02EBF188.

  

Freeze a value here and you change the outcome of the hit being computed. This is the surgical way to force a steal, a critical, or an exact damage number.

  

**Formula Processing Keep Editor** (fpke\_base) selects between two arrays via **Character Type** (fpke\_ct, CharacterTypeList: 0 = Party Member → \[0208D480\], 1 = Foe → \[0208DE80\]), 40 characters each. Fields: **Amount** (+0), Miss / Immune / Reverse target flag folders, **Action** (+0x10), Battle Flags, one unidentified word at +0x14 (code ref 0x00386A2C), **Steps (0 → 27)** float at +0x18, an Unknown Flags folder.

### 4.35 Magick Effect Processing Editor

\[022C17B0\], 32 slots, linked-list style: **Next Magick Effect Processing Pointer** (+0), an unknown pointer (+8), three unknown type dwords (+0x10–+0x18), **Action** (+0x1C), **Focus Identifier** (+0x20), a sound-effect-related dword (+0x24), one more unknown dword, and an Unknown Flags folder. Battle Unit Work +0x694–+0x696 holds the next/current/quickening indices into this array.

### 4.36 Special Action Processing Editor

A static block, 022BE970–022C24C0, describing the special action (Quickening / Concurrence / esper) currently resolving:

  

|  |  |
| :-: | :-: |
| \*\*Address\*\* | \*\*Field\*\* |
| 022C1F50 | \*\*Initial Caster Battle Unit Keep Pointer\*\* |
| 022C1F58 | Active Targets list (32) |
| 022C215C | \*\*Action Type\*\* (SapeActionTypeList, 8 entries; last is ?) |
| 022C2160 | Processing Type? |
| 022C2168 | Caster Battle Unit Work |
| 022C2180 | \*\*Total Hits\*\* |
| 022C2184/+4 | Next Current Time / Next Max Time |
| 022C218C | Next Caster Focus Identifier |
| 022C2190 | \*\*Current Action\*\* |
| 022C2192–022C2195 | \*\*Rank 1 / Rank 2 / Rank 3 Hits\*\*, Concurrence Hits? |
| 022C2196 | Party Members list (7) |
| 022C21B4 | Potential Target Count (0 → 31) |
| 022C21B8 | Potential Targets list (32) |
| 022C22B8 | 520 bytes explicitly labelled \*\*Ineffectual?\*\* |
| 022C24C0 | Active Casters list |

  

Setting Rank 1/2/3 Hits is how you force a specific Quickening chain length.

### 4.37 Loot Bag / Trap / Action List / AoE editors

  - **Loot Bag Processing Editor** — \[02EC0FA0\], 10 bags, 7 contents each. Identifier, **Processing Type**, **Spawn Time**, last/next bag pointers (a doubly linked list), Contents folder, Loot Bag Icon Pointer (+0x58).
  - **Loot Bag Processing Plus Editor** — \[022BE7F0\], 10 slots: State (+0) and a Position folder. This is where a dropped bag physically is.
  - **Trap Processing Editor** — \[02EC3EA0\], 3 active traps, plus **Next Trap Processing Identifier (0 → 2)** at 02EC3EC4 and **Trap Processing Count (0 → 3)** at 02EC3EC8.
  - **Action List Categories Editor** — \[0208CD20\], 26 categories (AlceCategoriesList: Attack … Arcane Magicks). Each has an Actions Pointer (+0), Action Count (+8) and an Actions folder. Rebuild with battlepack section 14's *Refresh Action List Categories*.
  - **Area Of Effect Shape Editor** — \[0209BE80\]. Position folder, Color Visibility folder, five unidentified floats, Texture Registry Pointer (+0x40), Clut Identifier (+0x48), Intensity (+0x4C), Flags, **Pulse Start** (+0x60), **Size** (+0x64), **Pulse Time** (+0x68), Character Focus Identifier (+0x6C), two unknown pointers. This controls the AoE ring you see on the ground.

### 4.38 Battle script infrastructure

  - **Battle Script Keep Editor** — \[02098E10\], 5 slots, stride 0x288. Exposes the whole keep: Script Pointer, Battle Actor Work List Pointer, several state bytes (Setup Actor Init State, **User Control State**), **Actor Count** (+0x20), Identifier, and a long run of pointers: File/Global/Local Scope Variables, Scratch1/Scratch2 Variables, Push Integers/Floats/Variables/Acts & Tags, memory allocation call, local-scope-variables call, Character Dialogs, Field Dialogs, Textures, Camera Mappings, Cameras, Camera Shake Mappings, Camera Shakes, Models, Dispose call, a Skeleton Type Spans folder, an "Actor Type 5 & 7 Count?" dword, and a Focus Identifier List pointer at +0x1F0.
  - **Battle Script Load Handler Editor** — \[022C6C00\], 5 slots, but addressed unusually: each field is its own base symbol (bslhe\_bases, bslhe\_bases+8, …) because the handler is a struct-of-arrays. Fields: EBP Pointer, Script Pointer, two unused pointers, Character/Field Dialogs, Textures, Load State, Queue Dispose State, Current File Id, **Pre Z Ebp File Size** at the fixed address 022C6D3C, Default File Id, Cameras, Camera Mappings, Models, Camera Shakes, Camera Shake Mappings, Lights, Load Flags, Motions, Snd/Fpk, **Japanese Voices**, **English Voices**.
  - **Battle Script Input Editor** — \[02099AC0\], 64 slots. Active Count, Type (BsieTypeList: None / Integer / Float), and a "Value (Only Edit One Based On Type)" folder. These are the VM's input registers.
  - **Script Actor Type Editor** — \[01E0C328\], 8 entries, 4 bytes each: **Skeleton Type** (+0), **Task Type** (+1), **Size in bytes** (+2). This is the table that says how big each actor type's allocation is; changing Size without changing the game's allocator is a guaranteed crash.
  - **Battle Player Character List Editor** — \[0209A1F0\], 4 slots, each a Battle Actor Work pointer. The four on-field party members.
  - **Map Jump Group List Editor** — \[0209A210\], 16 slots, each a Battle Actor Work pointer.

### 4.39 The VM tools

These three are the deepest part of the table: they let you call the game's event VM directly.

  

**VM Call Target Pointers** — \[02B57EF0 + type\*8\] gives a per-type table; the record at +0x08 + id\*0x20 holds **Start Call** (+0), **Wait Call** (+8) and **End Call** (+0x18). VmctpCallList names 1,959 of them, from 00000000:wait to 00007067:unkCall\_7067 — note the ids are printed as 8-hex-digit strings because the id packs type \<\< 12 | index.

  

**VM Call Target Executor** — actually invokes one.

  

|  |  |  |
| :-: | :-: | :-: |
| \*\*Row\*\* | \*\*Symbol\*\* | \*\*Meaning\*\* |
| Wait State | vmcte\\\_params + 0 | If non-zero, the executor also runs the Wait Call in a 100 ms poll loop until it reports done |
| Battle Script Keep Identifier (0 → 4) | \\+0x04 | Which script context |
| Call Target Identifier | \\+0x08 | type \\\<\\\< 12 \| index, from VmctpCallList |
| Caller Battle Actor Work Identifier | \\+0x0C |   |
| Executor Battle Actor Work Identifier | \\+0x10 | Its task-execution stack at +0x18 is used as the VM stack |
| Return Type | \\+0x14 | VmcteReturnTypeList: None / … / Float |
| Return Value (Integer) / (Float) | \\+0x18 / +0x1C | Filled in after the call |
| Arguments folder | \\+0x20 = count, then 0x0C-byte records from +0x24 | Each: type (VmcteArgumentTypeList: Integer / Float) at +0, int value at +4, float value at +8 |

  

Arguments are pushed with 00267F90 (int) / 00267F60 (float) before the Start Call runs.

  

**Risk:** this is arbitrary game-function invocation. Calling a target with the wrong argument count, the wrong actor context, or from the wrong script keep will corrupt the VM stack. Many of the 1,959 targets are unkCall\_xxxx — unnamed, and their signatures are unknown. Treat this as a research tool.

  

**VM Opcode Editor** — \[01EFEA50\], 100 opcodes (VmoeOpcodeList: NOP … REQIALL). Each record: Name Pointer (+0), **Size** (+0x10), one unidentified word (+0x12). Changing an opcode's Size desynchronises the bytecode decoder for every script — this will break the game immediately.

### 4.40 File Viewer, File Reloader and the loader internals

**File Viewer** — \[0215F000 + type\*8\] then \[+fid\*8\]. 41 file types (FvFileTypeList), listing the real FFXII archive taxonomy: Image File (.irx/.img/.cnf), Debug File, Gameplay File (.bin — type **2**, where battlepack lives), Map Control Pack (.mpk), Location File (.ebp/.mot/.fpk), Menu File (.bin/.mrp/.tm2), Event File (.ebp/.mot/.snd/.vpc), World File — type **9**, Main Effect / Magic Effect / Event Effect (.efx), the model families (Gadget, Main Character, Main High Character, Weapon, NPC, NPC High, Background, Summon, Summon High, Treasure, Foe), **Area Resource Data (.ard)** = type **21**, Sound Wave, Movie, Foe Special Action Animation, Background Music, Shout (us/jp), Menu Overlay, and Japanese-locale variants. Exposes **Size** and a **Name** string.

  

**File Reloader** — hot-reloads a file from disk into the running game. The parent script registers fr\_lf\_call (load file) and fr\_gfh\_call (get file handle); each child specifies file type, file id, a post-processing callback, a format pointer, and three allocator arguments.

  

|  |  |  |  |
| :-: | :-: | :-: | :-: |
| \*\*Reloader\*\* | \*\*Type\*\* | \*\*File id(s)\*\* | \*\*Post-processing\*\* |
| Battlepack | 2 | 0x13 | Rebuilds all 55 section pointers (with bespoke fix-ups for sections 0, 10, 13, 39, 61, 70), refreshes gambit target pages, gambit action pages, action list categories and positive/negative status effects, then \*\*deallocates the old battlepack\*\* and swaps \\\[0208E680\\\] |
| MRP Pack | 7 | 0xD3 | Re-registers menu file bases |
| License Boards | 2 | 0x47 … 0x52 (12 boards) | Per-board node post-processing |
| System Menu Messages | 2 | from a list at 01E09F68 | Only reloads slots already loaded |
| Map Ref | 9 | 4 |   |
| PC Skill Motion | 9 | 5 |   |
| Behind Camera | 9 | 3 |   |

  

**This is the mechanism that makes the table a real modding tool**: edit the file on disk, hit the matching reloader, and the change is live without restarting.

  

**Risk:** the Battlepack reloader deallocates the previous battlepack while the game may still hold stale pointers into it (anything the fix-up list misses). Do it from a safe spot — a save point, out of battle — and expect that a mismatched or truncated file will crash instantly.

  

**File Load Properties** (static): Total File Load Count (01EED498), Last File Size (0215EFF4), two file-load-handler pointers (022C51C0 — the table notes it is location-change related — and 022C51C8), Last File Load Handler Pointer (022C51D0), Last File Type (022C51D8), Last File Identifier (022C51DC).

  

**File Load Handler Editor** — \[022C31C0\], 64 handlers. Load end/start time, parent/child handler pointers, **Load State (0 → 6)**, File Type, File Identifier, File Size, File Start Offset, file pointers, **Post Processing Call** (+0x40), identifier, Post Processing File Pointer.

### 4.41 Memory allocation & resource descriptors

  - **Memory Allocation Properties** (static, 022D89A8–022D8E28): the allocator id list, per-allocation states, **Current Memory Allocation Identifier (0 → 14)**, **Current Memory Allocation Handler Identifier (0 → 31)**, block count, block states (a 0x400-byte array at 022D8DD0), two memory-size dwords, Last Memory Allocation Block Identifier (0 → 8) and three unidentified dwords.
  - **Memory Allocation Editor** — \[022D7FD0\], 15 allocators, 9 blocks each. Identifier, State, ten unknown pointers, an unknown size, **Total Memory** (+0x5C), **Allocation Count** (+0x60), a Blocks folder, two "Unknown Resource Descriptor Pointer" fields and an unknown call pointer.
  - **Memory Allocation Handler Editor** — \[022D89D0\], 32 handlers, tiny records: Memory Allocation Identifier (+0) plus two bytes and two dwords, all unidentified.
  - **Resource Descriptor Editor** — a tree walker with eight navigation actions (Goto Parent A / Child A / Parent B / Child B / Parent C / Child C1 / Child C2 / Unload). Record (rde\_base): three unidentified bytes, **Memory Allocation Identifier** (+3), Parent A / Child A / Child B / Parent B pointers (+4–+0x10), Flags, Memory Allocation Block Identifier (+0x16), **Size** (+0x18), Memory Allocation Counter (+0x1C), **File Identifier** (+0x1E), an unknown pointer, Child C1 / C2 / Parent C pointers, and a **Name** string at +0x34.

  

Together these four let you see exactly what is resident in memory and how much budget an area is consuming — essential if you are adding models to an area and hitting the allocator's ceiling.

### 4.42 Cosmetic and settings groups

**UI Settings** — 257 static rows, no script needed, using the game's own internal variable names: mPauseMenuOffsetX/Y, ConfirmWindow\*, mCursor\*X/Y for all six cursor directions, mScrollListHeight, the whole BattleCommand\* family, BattleMist\* positions, ten \*BlackBandH letterbox heights, ExpLpPositionOffset\*, ListItemIcon\*, Silhouette\*, Scroll\*, Font\* (including FontItalicVal and FontItalicScale as floats), WorldMap\*, MsgWin\*, TrackMap\*, HelpMessage\*, ActiveLog\*, TargetInfoMoveY, StatusAlone\*, sixteen HpGauge\* RGBA colour components for enemy/side/other gauges, OverHead\*, MenuList\*, LicenseBoard\* (node size, cost offsets, ball/face lengths), and Gambit\* + GambitTutorial\* layout values. Two rows are explicitly marked **(Ineffectual)**: ListItemIconX and ListItemIconY. Around ten are ?.

  

These are the ones to touch for HUD repositioning and colour changes; they take effect on the next redraw of the affected element.

  

**Post Processing Settings** — four defined structures (01F82EA8, 01F81300, 01F7F598, 01F81168) exposed as Global Properties plus "1./2./3./4. Structure" folders, 299 rows total. No code patch. These are the bloom/DoF/colour-grading parameter blocks.

  

**Debug Settings** — ds\_base = 01F81428. The developer debug block, and the single highest-value cheat surface in the table:

  

|  |  |
| :-: | :-: |
| \*\*Offset\*\* | \*\*Field\*\* |
| \\+0xA6C / +0xA70 / +0xA88 / +0xA90 | Debug menu state / page fields |
| \\+0xAAC / +0xAB4 | \*\*Weather State\*\*, weather LocalMap string |
| \\+0xC0C | Force Resolution? |
| \\+0xC10 / +0xC14 | \*\*Vertical FOV (Radian)\*\* / \*\*Aspect Ratio\*\* |
| \\+0xC20 | \*\*God Mode\*\* (DsGodModeList: None / Party / All) |
| \\+0xC34 | \*\*One Hit Kill\*\* |
| \\+0xC35 | Pause Related? |
| \\+0xC40 | Debug Menu Load Character Model? |
| \\+0xC56 | Information Page |
| \\+0xC70 | \*\*100% Rare Game Spawn\*\* |
| \\+0xCF1 / +0xCF4 | Use Chin Angle / \*\*Chin Angle (Degree)\*\* |
| \\+0xD07 | \*\*Freeze Game?\*\* |
| \\+0xD08 | unkCall\\\_5c3 VM function result — cutscene related |
| \\+0xE1C / +0xE1D / +0xE1E | \*\*Infinite Summon Time\*\* / \*\*Infinite Chocobo Time\*\* / \*\*Infinite Chocobo Sprint Time\*\* |
| \\+0xE5C / +0xE60 / +0xE64 | \*\*Forced Steal Rarity\*\* (−1 None … 2 Rare) / \*\*Forced Poach Rarity\*\* (−1 … 1) / \*\*Forced Drop Rarity\*\* (−1 … 4 Guaranteed) |

  

The remaining \~15 rows are ? with the code address that references them noted in the row name — the table's convention for "found it, don't know what it does".

  

**Game Settings** — gs\_base = 01F82D20, the on-disk config mirror: Language, fullscreen and windowed Width/Height, Screen Mode, Graphical Quality, Brightness, Vsync, Anisotropic Filtering, Shadows, Anti-Aliasing, Post-Process AA, Ambient Occlusion, Depth of Field, Glare, Soft Particles, Character Self-Shadowing, Water Shader, Display Buffer, **Frame Rate Limit** (30/60), Device ID, LUID, Camera Auto-Rotation, Mouse Sensitivity X/Y, Confirm Button, Monitor, window position. Every field has a named enum.

  

**Input Settings** — is\_base = 01F7FFE0: camera X/Y invert, mouse wheel current and additive value, continuous/sporadic scroll state, wheel move/idle/start times (doubles), controller state, and three menu/camera state bytes.

  

**Forced Input Icons** — **Type** (fii\_it, FiiTypeList): 0 = Auto, 1 = Keyboard, 2 = PlayStation, 3 = Xbox. Two code patches force both the keyboard-vs-controller choice and the PlayStation-vs-Xbox glyph set. Purely cosmetic, cleanly reversible.

  

-----

## 5\. Drop-down list catalogue

219 lists, grouped by the sub-folder they live in. Format is id:Name, one per line. Several lists mark unused ids explicitly as Reserve (0xNN) — those are real slots in the game's tables that ship empty, and writing to them usually works but displays no name.

### 5.1 Description lists (text-id lists, 13)

Map a **text id** to its string. All start with 65535:None.

  

|  |  |  |
| :-: | :-: | :-: |
| \*\*List\*\* | \*\*Entries\*\* | \*\*Range\*\* |
| DescActionList | 546 | 0 → 544 |
| DescEquipmentList | 545 | 2047 → 2591 |
| DescLicenseList | 363 | up to 6505 (Quickening) |
| DescBattleMenuList | 64 | up to 8254 |
| DescStatusEffectList | 33 | up to 10271 (X-Zone) |
| DescGambitList | 285 | up to 12571 |
| DescNameList | 630 | up to 17012 (Judge Ghis) |
| DescBazaarGoodList | 129 | up to 18559 (Morbid Urn) |
| DescAugmentList | 130 | up to 20608 |
| DescLootList | 513 | up to 23039 |
| DescKeyItemList | 513 | up to 25087 |
| DescFoeClassificationList | 17 | up to 26639 (Ichthian) |
| DescFoeGenusList | 65 | up to 28735 (Yensa) |

  

Note the base offsets: each family occupies its own 2048-id block (0x0000, 0x0800, 0x1800, 0x2000, 0x2800, 0x3000, 0x4200, 0x4880, 0x5080, 0x5800, 0x6000, 0x6800, 0x7000).

### 5.2 Menu help-text lists (10)

The long-form descriptions shown in menus, keyed by their own id space:

  

|  |  |  |
| :-: | :-: | :-: |
| \*\*List\*\* | \*\*Entries\*\* | \*\*Base id\*\* |
| MenuHelpList | 398 | 3000 |
| MenuBattleActionList | 322 | 4000 |
| MenuInventoryActionList | 251 | 10000 |
| MenuStatusEffectList | 32 | 12000 |
| MenuAugmentList | 64 | 13000 |
| MenuLootList | 512 | 14000 |
| MenuGambitTargetList | 255 | 16000 |
| MenuLicenseList | 35 | 17000 |
| MenuKeyItemList | 512 | 20000 |
| MenuBazaarGoodList | 128 | 22000 |

### 5.3 Content lists (17)

The **content id** space (category \<\< 12 | index) used by the Inventory Editor, loot tables, shop stock and rewards.

  

|  |  |  |
| :-: | :-: | :-: |
| \*\*List\*\* | \*\*Entries\*\* | \*\*Id range\*\* |
| ContCombList | 7,159 | everything, 0 → 61439 ("4095 Gil") |
| ContItemList | 65 | 0x0000 block |
| ContEquipmentCombList | 558 | 0x1000 block, up to 4652 |
| ContWeaponList / ContArmorList / ContAccessoryList / ContAmmunitionList | 201 / 141 / 49 / 33 | subsets of 0x1000 |
| ContLootList | 513 | 0x2000, up to 8703 |
| ContMagickList / ContTechnickList | 82 / 25 | 0x3000 / 0x4000 |
| ContGambitList | 257 | 0x6000, up to 24831 |
| ContKeyItemList | 513 | 0x8000 |
| ContPackageList | 513 | 0x9000 |
| ContRewardList | 257 | 0xA000 |
| ContPriceList | 129 | 0xB000 |
| ContMistList | 33 | 0xC000 |
| ContBazaarGoodList | 129 | 0xD000 |

  

Gil is the top block: 0xF000 | amount.

### 5.4 Battlepack lists (26)

Raw section-local indices (no category prefix). These are what you type into a battlepack record.

  

|  |  |  |
| :-: | :-: | :-: |
| \*\*List\*\* | \*\*Entries\*\* | \*\*Landmarks\*\* |
| BpActionList | 544 | 0x96 = Attack (the Custom Battle Menu Action default) |
| BpEquipmentList | 557 | 0 = Unarmed … 556 = Zodiark's Armor |
| BpLicenseList | 368 | 0 = Quickening 1 |
| BpLootList | 512 | 0 = Teleport Stone |
| BpPackageList | 512 | 0 = Mainquest: License Board Tutorial |
| BpKeyItemList | 416 | 0 = Blue Bottle |
| BpRewardList | 256 | all Reserve — this section ships empty |
| BpGambitList | 256 | 0 = "Foe: party leader's target" |
| BpAugmentList | 131 | 128 = Second Board |
| BpPriceList | 128 | 0 = Chocobo in Rabanastre |
| BpBazaarGoodList | 128 | 0 = Antidote Set … 127 = Morbid Urn |
| BpMagickList | 81 | 0 = Cure … 80 = Graviga |
| BpItemList | 64 | 0 = Potion … 63 = Knot of Rust |
| BpMapList | 64 | 0 = Rabanastre |
| BpShopList | 57 | 0 = Travelling Merchant … 56 = Odo |
| BpStoryPointAdditionList | 50 | 0 = After first controlling Reks |
| BpEquipmentCategoryList | 33 | 255 = None, 0–31 |
| BpStatusEffectList | 32 | 0 = KO … 31 = X-Zone |
| BpMistList | 32 | 0 = Red Spiral … 31 = Second Board |
| BpTeleportLocationList | 32 | 0 = Rabanastre |
| BpTechnickList | 24 | 0 = First Aid … 23 = Gil Toss |
| BpWeaponStanceList | 23 | 22 = Unarmed (Brawler) |
| BpCategoryList | 22 | 255 = None |
| BpConcurrenceList | 16 | 0 = Inferno |
| BpElementList | 8 | 0 = Fire … 7 = Dark |
| BpMagickCategoryList | 5 | White / Black / Time / Green / Arcane |

### 5.5 Per-editor enums (95 short lists)

Every editor that has a typed field ships its own list. The prefixes tell you the owner: Pme, Pe, Ie, Ft, Oslm, Cfr, Bce, Sge, Bpe, Arde, Ebpe, Mrpe, Time, Ttre, Bre, Gme, Bcame, Lnie, Mre, Mjgfre, Mspe, Lbne, Sape, Alce, Fv, Bsie, Vmcte, Vmctp, Vmoe, Ebpl, Ds, Gs, Fii. Most are 2–10 entries and are described in-line in §4.

### 5.6 Shared lists (24, unprefixed)

Used across many editors:

  

|  |  |  |
| :-: | :-: | :-: |
| \*\*List\*\* | \*\*Entries\*\* | \*\*Notes\*\* |
| CharacterNameList | 1,142 | −1 = None … 1140 = Informed Shopkeep |
| BattleLogicTargetConditionList | 2,053 | 0 = Unconditional … "Esper Duration \\\< 120" |
| BattleLogicActionList | 1,729 | up to "Action Group 825" |
| BattleLogicTargetTypeList | 1,660 | up to 40960 = "Caster Battle Memory Flags" |
| LocationList | 1,315 | all areas |
| ModelList | 944 | see §4.15.3 for the id encoding |
| BestiaryList | 512 | 0 = Cactoid |
| PartyMemberList | 42 | 0xFFFF = None, 0–39, 39 = Zodiark |
| GenusList | 65 | 255 = None |
| LocationNameList | 59 | up to "Pharos - Subterra" |
| ClassificationList | 17 | 255 = None … 15 = Ichthian |
| MistActionList | 19 | up to 225 = Resplendence |
| WeaponStanceAnimationList | 17 | 255 = None |
| UnitTypeList | 16 | 0 = None; \*\*1 is the only value Kill Nearby Foes targets\*\* |
| JobList | 14 | 255 = None … 12 = Classic Board |
| ClanRankList | 13 | 0 = None … 12 = Order of Ambrosia |
| ActorTypeList | 8 | 0 = Logic Actor … 7 = Respawn Unit |
| SkeletonTypeList | 5 | 0 = Logic … 4 = Unused |
| EbpTypeList | 5 | 0 = Battle … 4 = Debug |
| BattleLogicCaseLinkTypeList | 4 | 0 = No Case Links … 7 = Link All 3 Cases |
| ReqTypeList | 32 | 0 = Entry |
| CharacterTypeList | 2 | 0 = Party Member, 1 = Foe |
| OffOnList | 2 | 0 = Off, 1 = On |

  

-----

## 6\. Recipes — what you can actually do with this

Each recipe names the exact entries involved. Enable only the scripts listed; enabling the whole table wastes threads and makes crashes harder to attribute.

### 6.1 Change a party member's model / appearance

1.  Enable **Battlepack Editor** (parent) → **16 : Party Members**.
2.  Set **Identifier** to the member (0 = Vaan … 6 = Penelo; see PartyMemberList).
3.  Edit **Model** (bpe\_pm\_base + 0x70) — or use the **Sub Model** row for the curated Viera/Dalmascan/vanilla drop-down. Encoding is (ASCII prefix \<\< 16) | file number; c models are main characters, n are NPCs.
4.  Optionally set **Model Variation** (+0x74) and **Model Color Variation** (+0x75).
5.  If the new model uses a different skeleton, fix animation routing in **PC Skill Motion Editor** (Model + Weapon Stance → Animation File Identifier).
6.  Enable **Party Member Editor** and tick **Refresh Appearance (Always All) → Execute Script**. If the model still doesn't swap, change zone.

  

To make the change survive: **Battlepack Editor → Export Section To File** with bpe\_sid = 16, patch the exported .bin into your battlepack on disk, then **File Reloader → Battlepack → Execute Script** to test it live.

### 6.2 Edit a specific foe's stats

1.  Enable **Area Resource Data (ARD) Editor** (parent) → **4 : Units**.
2.  Find the unit: iterate **Identifier**, watching **Name** and **Class Identifier**. Cross-check with **Battle Character Editor → Battle Unit Work → Ard Unit Pointer** (+0xE60) if you have the foe on screen — that gives you the exact record.
3.  For per-encounter values edit the unit record: **Custom Initial HP** (+0x18), **Weapon**/**Off-hand**, **Size %**, drops/steals/poaches, **Is Boss?**.
4.  For the numeric stat block, note **Default Stats Identifier** (+0x22) and **Additive Stats Identifier** (+0x24), then enable **7 : Default Stats** / **8 : Additive Stats** and edit at those indices — that is where Max HP, Max MP, Strength, Defense, EXP, Gil and License Points live.
5.  For behaviour shared by the species, use **2 : Classes**: elemental affinities, Is Flying / Is Floating / Can Teleport, detection ranges, Max Combo Hits, No Chain, Bestiary Identifier.
6.  For AI, note the four **Battle Logic Identifiers** (+0x50) and edit **3 : Battle Logics** at those indices.

  

ARD edits are area-scoped and lost on zone change. Export the section and patch the .ard file for anything permanent.

### 6.3 Change what a spell or attack does

1.  Enable **Battlepack Editor** → **14 : Actions**.
2.  Set **Identifier** (use BpActionList to find it).
3.  Edit **Formula**, **Power**, **Power Multiplier**, **Charge Time**, **MP / Mist Cost**, **Range**, **Area of Effect Size/Shape/Origin**, **Elements**, **Status Effects**, **Accuracy Rate**, **On-Hit Rate**.
4.  Targeting is in flag word 1 (+0x0C): Can Target Self / Ally / Foe / Reserve / KO / Stone / Flying / Undead, Initial Target, Allow Reflect / Magick Evade / Physical-Immunity / Magick-Immunity, Deny While Silenced.
5.  If you change **Gambit Page** / **Gambit Page Order**, run **Refresh Gambit Action Pages → Execute Script** afterwards; if you change **Category**, run **Refresh Action List Categories → Execute Script**.

### 6.4 Give a character equipment / items / gil

  - Fastest, in-battle: **Battle Character Editor → Battle Unit Keep → Equipment**, write the 2-byte item ids into Weapon / Off-hand / Helm / Armor / Accessory.
  - Into the inventory: **Inventory Editor → Add / Remove Any Content**, set **Identifier** from ContCombList and **Count**, tick **Execute Script**. Negative Count removes. For gil, use content 0xF000 | amount.
  - Everything in a category: **Add / Remove All Content From A Category** with **Category** from IeCategoryList.
  - To change what an item *is*: **Battlepack Editor → 13 : Equipment & Attributes** (record fields + the linked attribute record), **18 : Items**, **32 : Loot**.
  - Default loadouts: **Battlepack Editor → 16 : Party Members → Equipment** (+0x0A), then **Party Member Editor → Reset Equipment**.

### 6.5 Edit an area's units and spawns

1.  **Environment Blueprint Pack (EBP) Editor**, **Identifier** = 0 (Battle) for the current field script.
2.  **0 : Script → Spawn Unit Control (****btlAtelSetEntryStruct****)** — which ARD unit spawns and under what conditions.
3.  **0 : Script → Spawn Unit Map (****btlAtelSetTotalEntryNumber****)** — how many.
4.  **0 : Script → Spawn Position Map (****btlAtelSetPoint2****)** and **16 : Spawn Positions** — where, plus **Direction (Radian)**.
5.  **0 : Script → Unit Status Effects (****btlAtelSetStatus****)** to pre-apply statuses.
6.  **0 : Script → Treasure (****setuptreasure****)** for chests, **Traps** for traps.
7.  **0 : Script → Actor Declarations** to see/rename the actors.
8.  Force a reload with **EBP Loader** (Type Identifier + File Identifier from EbplEventFileList) — or just re-enter the area, which is safer.

### 6.6 Restructure a licence board

1.  **Battlepack Editor → 12 : License Nodes** — per-node Name, Description, **LP Cost**, **Type**, **Restriction**, per-character default-unlock flags, and the type-dependent Contents folder (what the node grants).
2.  **License Board Node Editor** — live board layout: **Column**, **Row**, Cost, License Icon Link, tile Type.
3.  **License Node Icon Editor** for the icon atlas.
4.  Persist: export battlepack section 12, patch the file, then **File Reloader → License Boards → Execute Script** (reloads all 12 boards, file ids 0x47–0x52).
5.  Re-spec affected characters with **Party Member Editor → Reset Jobs** (with **Unlock Default Licenses State** ticked) so their node bitfields match the new layout.

### 6.7 Rewrite a character's gambits

  - Live, per character: **Party Member Battle Logic Editor** — set **Identifier (0 → 39)**, set **Entry Count (0 → 14)**, then edit each entry's action / target condition / target type / case-link.
  - By definition: **Battlepack Editor → 7 : Gambits** (targets) and **8 : Gambit Sets** (loadouts). Editing section 7 automatically re-pushes battle logics to all 40 party members, so changes apply immediately.
  - Slot count: **Battle Unit Keep + 0xBA**, or let **Party Member Editor → Reset Gambits** recompute it from augments (min 2, max 12).
  - Which gambits appear on which menu page: **Battlepack Editor → 14 : Actions → Gambit Page / Gambit Page Order**, then **Refresh Gambit Target Pages** and **Refresh Gambit Action Pages**.

### 6.8 Move / recolour the HUD

1.  **UI Settings** — no script needed. Position and size values are plain integers in screen units; HpGauge\*\_R/G/B/A are 0–255 colour components.
2.  **Menu Section Editor** for live per-section Position X/Y, Width, Height, Alpha, Contrast — use the Goto Parent/Child/Sibling actions to walk to the section you want, then read its Entry List.
3.  **Menu Section Plus Editor** for the nine specialised views (party member list, stats, portrait, licence board, quickening, inventory bar/icons).
4.  Graphics themselves: **Menu Resource Pack (MRP) Editor** and **Texture Image Map (TM2) Editor**, both with Export actions. Reload with **File Reloader → MRP Pack**.
5.  **Forced Input Icons** to lock the button glyph set.

### 6.9 Farm / test drops and steals

  - **Debug Settings → Forced Steal Rarity / Forced Poach Rarity / Forced Drop Rarity** — the cleanest method; −1 disables, higher values force rarer tiers, Drop supports 4 = Guaranteed.
  - **Debug Settings → 100% Rare Game Spawn** for rare-game hunting.
  - **General → Chain** — set Chain Level 4 and a high chain count for max-chain drop tables.
  - **Custom Foe Respawn** (Instant) plus **Kill Nearby Foes** for a fast kill loop.
  - **ARD Editor → 4 : Units → Drops / Steals / Poaches / Monograph / Canopic Jar** to change what actually drops.
  - **Formula Processing Properties → Common/Uncommon/Rare Steal State** to force a specific steal on the hit currently resolving.

### 6.10 Teleport, shop and save anywhere

**Free Teleport** (Location + Position Index, Instant type), **Open Shop** (any of 57 merchants), **Open Save / Load Menu**, **Summon Chocobo**. All four refuse while a menu is open — close the pause menu first.

### 6.11 Hot-reload a modified game file

1.  Edit the file on disk (or export a section with the matching Export action, patch it, and put it back).
2.  Enable **File Reloader** (parent — it registers the shared loader helpers).
3.  Enable the specific reloader (**Battlepack**, **MRP Pack**, **License Boards**, **System Menu Messages**, **Map Ref**, **PC Skill Motion**, **Behind Camera**) and tick its **Execute Script**.
4.  Verify with **File Viewer** (correct type + file id shows the new Size) and with **File Load Properties → Last File Type / Last File Identifier**.

  

Do this from a save point, out of battle. There is no ARD or EBP reloader — those need a zone change.

  

-----

## 7\. Dangerous, broken, and unknown

### 7.1 Ranked by how badly it can go wrong

**Severe — can destroy a save or crash on contact**

  

|  |  |
| :-: | :-: |
| \*\*Item\*\* | \*\*Why\*\* |
| \*\*Save Game Editor → World block\*\* | \\\~380 quest/story flag groups. Advancing a stage without its prerequisites is the classic unrecoverable FFXII save. The table gives you every flag and no guard rails. |
| \*\*Save Game Editor → Session → Save CRC Checksum / Remainder\*\* | Exposed but never recomputed by the table. Hand-editing the checksum, or editing save data and relying on the game to re-checksum, can produce a save the game refuses. |
| \*\*VM Call Target Executor\*\* | Arbitrary invocation of 1,959 game routines, most of them unnamed (unkCall\\\_xxxx) with unknown signatures, using a real actor's task-execution stack. Wrong arguments corrupt the VM stack. |
| \*\*VM Opcode Editor → Size\*\* | Changing an opcode width desynchronises the bytecode decoder for every loaded script. Immediate, total breakage. |
| \*\*Script Actor Type Editor → Size (Bytes)\*\* | Changes the expected allocation size without changing the allocator. Heap corruption. |
| \*\*File Reloader → Battlepack\*\* | Deallocates the live battlepack after swapping pointers. Any pointer the fix-up list misses becomes a dangling reference; a truncated or mismatched file crashes on the first read. |
| \*\*Export Section To File (all editors)\*\* | Temporarily rewrites live in-memory pointers to file-relative offsets, writes, then restores. If the process is interrupted mid-window the game is left with offsets where pointers belong. The script pauses the game to shrink the window — do not interrupt it. |
| \*\*EBP Disposer\*\* | Disposing the blueprint of the area you are standing in destroys the script owning your actors. |
| \*\*Memory Allocation Editor / Resource Descriptor Editor → Unload\*\* | Frees resources the game still references. |

  

**High — will visibly break gameplay, usually recoverable by disabling**

  

|  |  |
| :-: | :-: |
| \*\*Item\*\* | \*\*Why\*\* |
| \*\*Custom Battle Menu Action\*\* | Three code patches that disable action legality checks, substitute the action, and stop item consumption. Casting an action whose formula expects context the caster lacks (esper-only, event-script actions) can hang the battle sequence. Disable before saving. |
| \*\*Custom Foe Respawn (Chaotic)\*\* | Spawns foes at the player's position with no death-count limit. Exceeds the area unit budget quickly. |
| \*\*Open Save / Load Menu\*\* | Saving inside a scripted sequence produces a save that reloads into a broken script state. |
| \*\*Free Teleport\*\* | Landing in an area inconsistent with your story progress can strand you or trigger a cutscene missing its flags. It clears the scratch2 block to mitigate this, not to solve it. |
| \*\*Party Member Editor → Reset Jobs\*\* | Wipes the entire licence board. LP is refunded (capped at 99,999), so it is a legitimate re-spec, but it is not undoable in-session. |
| \*\*Inventory Editor → Add All From Category\*\* | Can overrun inventory slot accounting in the Menu block. |
| \*\*Battlepack Editor → any structural field\*\* | Changing counts, sizes or pointer fields (rather than values) inside a live st2e section desynchronises the resolvers and the game. |

  

**Moderate**

  

  - **Complete Bestiary** writes 1 KB of 0xFF into live menu data — instant and persisted on next save.
  - **Debug Settings → Freeze Game?** does what it says; make sure you can untick it.
  - **General → Rendering Flags**: clearing bit 0 (World) or bit 1 (Character) leaves you unable to see where you are.
  - **Menu Resource Pack (MRP) Editor** installs two live code hooks purely to record pointers — harmless, but rule it out when debugging a crash.

  

**Low risk** — every resolver thread (they only read), Compact Mode, UI Settings, Post Processing Settings, Game Settings, Input Settings, Forced Input Icons, Kill Nearby Foes, Summon Chocobo, Open Shop, File Viewer.

### 7.2 Explicitly marked broken or inert by the table itself

These carry the author's own annotation. They are not bugs in the table; they are honest labels on game data that does nothing.

  

|  |  |
| :-: | :-: |
| \*\*Entry\*\* | \*\*Label\*\* |
| \*\*Save Game Editor → Battle (0x6000 Bytes)\*\* | \*\*(Ineffectual)\*\* — the whole 24 KB block. The live battle block is the separate 0x8004-byte one at \\\[02EBF190\\\]. Six child scripts resolve into it, so it looks functional; it is not. |
| Battlepack 13 → Equipment → Description | (Ineffectual) |
| ARD 4 → Units → Flags 2 → No Action Category Specific Target Line | (Ineffectual) |
| ARD 2 → Classes → Actions 0–7 | \*\*(Unused)\*\* — an 8-entry action array that the game never reads |
| Battlepack section 26 | \*\*Mist (Unused)\*\* |
| Special Action Processing 022C22B8 (520 bytes) | \*\*Ineffectual?\*\* |
| UI Settings → ListItemIconX / ListItemIconY | (Ineffectual) |
| Many drop-down rows | Reserve (0xNN) — real but empty table slots |
| Numerous rows across editors | Unused / Unused? — padding the author verified or strongly suspects is dead |

### 7.3 Things whose purpose I could not determine

I am flagging these rather than inventing explanations. In most cases the table itself does not claim to know either — the author's convention is a ? in the row name, often followed by the code address that references the field.

  

  - **Battlepack section 68 — "Location Movement Behavior?"** The name carries the author's own question mark; nothing in the script confirms it.
  - **Behind Camera Editor**: fifteen of the sixteen floats (+0x08 through +0x3C) are unlabelled. Only "View Angle Y Offset" at +0 is identified.
  - **Skeleton Model Editor**: four "Unknown Flags" folders and roughly a dozen ? rows; the identified fields are only the shadow alpha, three named timers (lip-sync, nod, swing), and a handful of animation words.
  - **Debug Settings**: about fifteen ? rows, each annotated with the referencing code address (e.g. ? (0x001D53D6)), meaning the author located them but never established semantics. Also unkCall\_5c3 VM Function Result - Cutscene Related?.
  - **Memory Allocation Editor**: ten consecutive "Unknown Pointer?" fields and an "Unknown Size?"; the allocator's internal layout is only partly mapped.
  - **Memory Allocation Handler Editor**: four of its six fields are ?.
  - **Battle Actor Keep / Battle Actor Model / Battle Actor Work**: a large share of rows are ? with code addresses. The identified fields (position, yaw, movement speed, weight, animation state, map jump group, terrain) are a minority.
  - **Magick Effect Processing Editor**: three "Unknown Type?" dwords and an "Unknown Pointer?".
  - **Formula Processing Keep Editor**: the word at +0x14 (code ref 0x00386A2C) and one Unknown Flags folder.
  - **VmctpCallList**: of 1,959 VM call targets, the great majority are named unkCall\_xxxx. Their argument counts and types are unknown; the Executor gives you no way to discover them safely.
  - **General → Rendering Flags** bits 4–15 and **Chain → Flags** beyond "Is Flashing".
  - **Menu Section record**: +0x70, the float at +0xB8, the two bytes at +0xAC and +0xAD, and the "Unload Order?" word are all annotated but unexplained.
  - The **02EBFxxx** **battlepack pointer cache**: I recovered the complete list of 55 addresses the File Reloader fixes up and confirmed six of their section assignments from source comments, but the full address→section mapping is not stated anywhere in the table and is not derivable arithmetically.
  - Whether the **Save CRC** is recomputed by the game on save, or must be fixed externally, is not answerable from the table's contents alone.

### 7.4 Version dependency

Every static address in this table is absolute and hard-coded to one Steam build. There is no AOB scan anywhere in the file — I checked all 263 scripts. The only version protection is the assert(...) byte guard in the five code-patching scripts, which will refuse to enable on a mismatched build. The other \~14,000 static rows have **no such guard**: on the wrong build they will silently read and write the wrong memory. If the game updates, assume the entire table is invalid until re-based.

  

-----

  

*Compiled by reading the table's XML directly: all 15,472 cheat entries, all 263 Auto Assembler scripts, all 219 drop-down lists and all 646 list links. Where a field's purpose is stated above, it is either taken from the table's own labels or derived from the assembler source; where it is not known, this document says so.*

  