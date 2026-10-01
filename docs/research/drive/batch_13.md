# Drive batch 13: TheInsurgentsDescriptiveInventory configs (in / it / kr)

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR.
Drive path: `My Laptop/scripts/config/TheInsurgentsDescriptiveInventoryConfig/`.
Consumer mod: `TheInsurgentsDescriptiveInventory.lua` ("TIDI", by Xeavin, personal use only), drive id
`1sKZGnkOzu61JXoPbhDR4dQShZhuvwRcG`, path `My Laptop/scripts`. Its name enum comes from
`My Laptop/scripts/TheInsurgentsDescriptiveInventory/helpers.lua` (drive id `1LsrveUNgX8aMYEeRZBv6-HB9wnSvvk28`).
All facts below are written in my own words. No code is copied.

| Drive id | Title | Local file | Lines / bytes | md5 (first 8) | Status |
|---|---|---|---|---|---|
| 11lqiNVhwXHdigTHCsKF3hyO-9pXERfSG | in.lua | `11lqiNVhwXHdigTHCsKF3hyO-9pXERfSG__in.lua` | 9 / 147 | c7f9a511 | read in full |
| 1Cy_nTohBjanl0Q77VEiUb1hJsyy-xRwF | it.lua | `1Cy_nTohBjanl0Q77VEiUb1hJsyy-xRwF__it.lua` | 9 / 147 | c7f9a511 | read in full |
| 1P-8ZlYqzEZDjfkHcIL1rnKmFUccHw4bb | kr.lua | `1P-8ZlYqzEZDjfkHcIL1rnKmFUccHw4bb__kr.lua` | 9 / 147 | c7f9a511 | read in full |

No file is missing. The three files are **byte-identical**: ASCII text with CRLF line endings and the same md5.
Each one is an empty template. It defines no addresses, hooks or text. Its only payload is one commented-out
sample row. To make the template useful for an editor, the "TIDI consumer" table below records how the main
script loads the file, how it lays the rows out in memory, and which game code it hooks. Those rows are marked
*xref*. I read all 201 lines of the consumer and the enum part of its helpers file for this.

Evidence key: **byte-check-in-code** means the code compares the original bytes before patching.
**used-in-code** means the code reads, writes or executes the value. **comment-only** means only a comment says so.
Addresses are in the Lua Loader address space that the mod uses. RVA = address - 0x120000.

---

## in.lua / it.lua / kr.lua (identical template)

**Purpose.** These are the per-language description overrides for TIDI. TIDI replaces the description text that
the inventory screen shows for an item, a piece of equipment, a magick or a technick. The game language picks
which file is loaded. `in` is language id 0, `it` is id 4 and `kr` is id 6. All three are shipped empty, so TIDI
changes nothing in those languages. The filled-in example is `us.lua` (drive id
`1_mouNo1qEAKMMHZyKxxFYBUSdeX1oX16`, 380 KB, not part of this batch).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Chunk shape | The file is a Lua chunk. It defines one local function that takes one parameter named `contents`, and the chunk returns that function. It does not return a table directly. | L1, L9 | used-in-code (the consumer calls the returned value) |
| Return value | The function builds a local array named `inventory` and returns it. The array is empty in all three files. | L2-L6 | used-in-code |
| Row format | The commented sample shows one row as a 2-element array: `[1]` = content id, `[2]` = description string. The id is taken from the `contents` enum, for example `contents.equipment.bangle`. | L3 | comment-only (in this file). The consumer confirms the meaning: it reads `[1]` as a u32 id and `[2]` as text |
| Example id | The `bangle` sample resolves to equipment id **4442 (0x115A)** in the TIDI helpers enum. | L3 (+ helpers L431) | xref, used-in-code |
| Encoding | The file is plain ASCII with CRLF line endings and has no BOM. Description strings would be written in the Lua Loader tag markup (see the consumer table). | whole file | byte inspection |
| Language mapping | in = language id 0, it = id 4, kr = id 6. The file name must match the consumer's language table exactly. | n/a (consumer L54-L64) | xref, used-in-code |
| Identity | The md5 is the same (c7f9a511...) for in, it and kr. An editor can generate these three files from one template. | n/a | byte inspection |

### TIDI consumer (xref, needed to interpret the template)

| Topic | Detail | Source line (TheInsurgentsDescriptiveInventory.lua) | Evidence |
|---|---|---|---|
| Hook site | **0x00292667** (RVA 0x172667). The original 5 bytes are **E8 C4 28 FC FF**, a near `call` with rel32 -0x3D73C. Before patching, the mod reads these 5 bytes and refuses to patch if they differ. | L2-L3, L174-L179 | **byte-check-in-code** |
| Original call target | 0x0029266C + (-0x3D73C) = **0x00254F30** (RVA 0x134F30). The code cave calls this function first, so the original behaviour is kept. Its result goes into rbx, the description text pointer that the caller uses after the call. | L12 | used-in-code (rel32 checked by arithmetic) |
| Patch | The 5 bytes at 0x00292667 are replaced by a `jmp` to a code cave assembled by the loader. The cave returns to **0x0029266C**, the instruction right after the original call. | L6, L41, L185-L186 | used-in-code |
| Skip condition | If the dword at **[r14-0x10] == 0x0E**, the cave leaves the text unchanged. This means one entry kind (type 14) is excluded from overrides. Which menu or row kind that is, is not stated. | L14-L15 | used-in-code |
| Lookup key | The cave reads the **u16 at [r14-0x0A]** as the content id of the highlighted entry and zero-extends it. It then compares it with each row id. So r14 points just past a per-entry record whose id sits at -0x0A and whose kind sits at -0x10. | L25 | used-in-code |
| Override table layout | A heap block holds a **u32 count**, followed by `count` packed records of **12 bytes**: +0x00 u32 content id, +0x04 u64 pointer to a NUL-terminated text. There is no padding, so the u64 is only 4-byte aligned. Allocation size = 4 + 12 * count. | L142-L160, L21-L38 | used-in-code |
| Table pointer | A u64 slot in the cave, symbol `tidi_invp`, aligned to 16. It holds the address of the table, and 0 means disabled. The cave does nothing when the pointer is NULL or the count is 0. | L44-L46, L17-L23, L129-L130, L144-L145 | used-in-code |
| Match action | On the first id match, the cave loads the record's text pointer into **rbx**. That swaps the description string the game is about to draw. The scan is linear, and the first match wins. | L28-L38 | used-in-code |
| Text conversion | Each row's string goes through the Lua Loader built-in `message.convert` (tag markup to game text bytes). The bytes are copied to a fresh allocation with a trailing 0x00 byte. | L111-L119, L151-L155 | used-in-code |
| Language selection | **u64 at 0x01F82D20** (RVA 0x1E62D20) points to a game-settings block. The **u32 at offset +0x00** of that block is the language id. The ids are 0 in, 1 us, 2 fr, 3 de, 4 it, 5 es, 6 kr, 7 ch, 8 cn. | L54-L70 | used-in-code |
| Config path | `<config.path>/TheInsurgentsDescriptiveInventoryConfig/<lang>.lua`. The file is loaded in text mode with an environment that falls back to `_G`. The returned function is called as `fn(helpers.contents)`, and every step is wrapped in pcall. | L66-L109 | used-in-code |
| Hot reload | `event.registerFileChangeHandler` is set on the config path. When the file changes, the mod reloads it, frees the old text blocks and the table, and rebuilds them. The table pointer is set to 0 while this happens. | L126-L172, L191 | used-in-code |
| Loader requirement | Lua Loader **1.7.2 or newer** is required (`checkMinVersion`). The patch is applied from the `onInitDone` async event. | L194-L201 | used-in-code |
| Allocator API | The mod uses `memory.alloc` and `memory.dealloc` for the table and strings, `memory.assemble(asm, symbols)` for the cave, `memory.assemble(asm, address)` for the patch, `memory.getSymbol`, `memory.readArray` and `memory.writeArray`. | L129-L186 | used-in-code |

### `contents` enum (from the TIDI helpers.lua, xref)

| Category key | Id range (decimal / hex) | Entries | Notes | Evidence |
|---|---|---|---|---|
| `items` | 0-63 / 0x0000-0x003F | 64 | starts at potion = 0, hi-potion = 1, x-potion = 2, ether = 3 | used-in-code |
| `equipment` | 4097-4515 / 0x1001-0x11A3 | 419 | starts at broadsword = 4097. Rings are about 4436-4441, bangle = 4442, armlets are 4443-4446, and the range ends at castellanos = 4515. 4096 (0x1000, "Unarmed") is not in the enum, but us.lua uses it by raw number | used-in-code |
| `magicks` | 12288-12368 / 0x3000-0x3050 | 81 | starts at cure = 12288 and ends at graviga = 12368 | used-in-code |
| `technicks` | 16384-16407 / 0x4000-0x4017 | 24 | starts at first aid = 16384 and ends at gil toss = 16407 | used-in-code |
| Lookup rules | Keys are lower-cased before lookup, so lookup is case-insensitive. An unknown name or a non-string key raises a Lua error, which the consumer's pcall catches. Names are compacted: spaces and apostrophes are removed. Numeric-leading names such as `1000needles` need bracket syntax. | helpers L2-L16 | used-in-code |

The id ranges match the game's usual content-id high nibble: 0x0xxx items, 0x1xxx equipment, 0x3xxx magicks,
0x4xxx technicks. The cave compares only a u16, so any of these 16-bit ids can be overridden.

## Editor relevance

* **Offline config editor.** An editor can write `<lang>.lua` files in this exact shape: a function of `contents`
  that returns `{ {id, "text"}, ... }`. It can use raw numeric ids (as us.lua does) or enum names, and it can
  produce in, it and kr from the shared template.
* **Memory editor.** A Lua or Cheat Engine tool can find the TIDI table through the `tidi_invp` symbol (u32 count
  plus 12-byte packed records). It can then list or patch descriptions live. It can also hook 0x00292667 itself,
  after first checking for the bytes E8 C4 28 FC FF.
* **Language detection.** Read the u32 at the address stored at 0x01F82D20. The same address pattern is useful
  for any mod that keeps per-language data.
* **No new file-format facts.** None of these three files adds VBF, battlepack or text-binary information.
