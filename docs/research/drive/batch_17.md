# Drive batch 17: FEUI TargetInfo, FreeCamera ModMenu + Patches, The Archadian Alchemist (TAA) modules

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR.
Addresses are the absolute VAs that the Lua Loader scripts use. RVA = VA - 0x120000.

| # | Drive id | Title | Drive path | Bytes | Status |
|---|---|---|---|---|---|
| 1 | 1BUDDwzXlzxQ4EhTZORVR6LohXSImea2c | TargetInfo.lua | My Laptop/scripts/FoedexExtendedUserInterface | 8,503 | read in full |
| 2 | 1FpwuMiik4mgS_h4hfaZ2EaHVbkz2x6rR | ModMenu.lua | My Laptop/scripts/FreeCamera | 8,963 | read in full |
| 3 | 1gOhNOTmXvPGPobsBdomapQ-HJFQTsnlU | Patches.lua | My Laptop/scripts/FreeCamera | 5,955 | read in full |
| 4 | 1HaDspQvKCXPh5UEWSUg6G0sOBO01qXZR | affinity.lua | My Laptop/scripts/TheArchadianAlchemist/equipment | 1,275 | read in full |
| 5 | 1GHdgLzsY85nti-L-2RVxU-3pRsDR4iXT | attribute.lua | My Laptop/scripts/TheArchadianAlchemist/equipment | 1,541 | read in full |
| 6 | 1zZyGV_0SLWpQqd-P2uAJ1_tcy5U4WxKq | element.lua | My Laptop/scripts/TheArchadianAlchemist/equipment | 696 | read in full |
| 7 | 1oFILkg53Q2aKMWh4g41GHNTur8vgSex9 | status.lua | My Laptop/scripts/TheArchadianAlchemist/equipment | 1,404 | read in full |
| 8 | 1hXlFHBfBs2k8lfRFz_UAVzM4fD7fqx_h | statusOnHit.lua | My Laptop/scripts/TheArchadianAlchemist/equipment | 1,216 | read in full |
| 9 | 16ZznPVNWPvqblSA6A9N_Bp3Pzw_gVRrk | controller.lua | My Laptop/scripts/TheArchadianAlchemist | 18,112 | read in full |
| 10 | 1U9IJxPvlC2jTN8CXEtjUXXYPaeCxNXix | flow.lua | My Laptop/scripts/TheArchadianAlchemist | 1,265 | read in full |
| 11 | 1YYX4OI8OxeJqahQLVPOsGms2AzY1PEDF | mappings.lua | My Laptop/scripts/TheArchadianAlchemist | 3,126 | read in full |
| 12 | 1VWcoQOJYtzcZwIHr6cFp3zCN4bA_Z2si | progression.lua | My Laptop/scripts/TheArchadianAlchemist | 6,971 | read in full |
| 13 | 1uP94DKAHvEOleojToa9B_LQu9JT95HRK | refinement.lua | My Laptop/scripts/TheArchadianAlchemist | 2,819 | read in full |
| 14 | 1DkO-L7ji5eapwZExvVg8j2OALkWbrWPD | writer.lua | My Laptop/scripts/TheArchadianAlchemist | 857 | read in full |

No file is missing.

Authors: file 1 is LowPriorityCitizen's Foedex Extended User Interface (FEUI). Files 2-3 belong to Xeavin's Free
Camera (the main `FreeCamera.lua` credits Xeavin; personal use only). Files 4-14 are FehDead's The Archadian
Alchemist. I record facts only, in my own words. I do not copy code. Where I needed context, I used files from other
batches as cross-references (xref): FreeCamera.lua, TheArchadianAlchemist.lua and FEUI helpers.lua. Batches 12 and 16
already document those files.

Evidence key:
* **byte-check-in-code**: the code compares the original bytes before it patches.
* **used-in-code**: the code reads, writes or calls it.
* **comment-only**: only a comment says so.
* **unclear**: my inference from naming, data flow or the shape of the patch. It is not proven.

I worked out every RIP-relative operand and call target below from the listed original bytes (target = address of
the next instruction + signed disp32).

---

## 1. `TargetInfo.lua` (FEUI: 3-digit level and 6-digit HP in the target-info panel)

**Purpose.** This mod widens the battle "Target Info" panel, which shows the foe's name, level, HP bar, HP numbers,
weakness and status. With it the panel shows a level of up to 3 digits and HP of up to 6 digits (HP of 100,000 and
more). It follows the same pattern as FEUI PartyInfo (batch 16):
1. Check and patch five code sites.
2. Add asm caves.
3. Copy the target-info groups 22-29 of MRP section 1 into a new MRP and add two groups.
4. Relocate the new MRP with game routine 0x002A00F0.
5. Point the panel's MRP load at the new MRP.

### 1a. Patched code sites

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Byte check | All five sites are read with `memory.readArray` and compared with the expected bytes before any patch. A mismatch aborts with "FEUI: Couldn't apply patch, executable is unexpectedly modified." The comparison joins the decimal values into a string, so it is weak ({1,23} would equal {12,3}) | L305-311 | byte-check-in-code |
| 0x002C0A23 (RVA 0x1A0A23), first group index | Original `BA 16 00 00 00` (mov edx,22). 22 is the first target-info group in section 1. The patch makes it `mov edx,0`, because the new MRP holds only the target-info groups, renumbered from 0 | L4, L14, L22-24 | byte-check-in-code |
| 0x002C0A2E (RVA 0x1A0A2E), MRP pointer | Original `E8 7D E5 FF FF` = call **0x002BEFB0** (RVA 0x19EFB0), which builds the panel from the MRP. The patch calls cave `feuti_menu` instead. The cave repeats the start of 0x002BEFB0: it saves rbx, reserves 0x20 bytes of stack, sets rbx = rcx and r8d = edx (the group index), adds 0x50 to rcx and sets r9 = rbx. It then loads **rdx = [feuti_mrp]** (the new MRP) and jumps into the body at **0x002BEFCE**. So that function takes rcx = the HUD object and edx = the first group, and at +0x1E it expects rdx = the MRP base | L5, L15, L25-27, L42-50 | byte-check-in-code |
| 0x002C0174 (RVA 0x1A0174), level digit count | Original `BA 02 00 00 00` (mov edx,2) becomes `mov edx,3`: the level is drawn with 3 digits instead of 2 | L7, L16, L28-30 | byte-check-in-code |
| 0x002C0183 (RVA 0x1A0183), level digit source | Original 8 bytes `48 8B 48 40 44 8D 42 03` (mov rcx,[rax+0x40] ; lea r8d,[rdx+3]). They become a jump to cave `feuti_lvl` plus 3 NOPs. The cave follows the chain [rax+0x40] -> +0x18 -> +0x60 -> [0] to get rcx, which is the first entry instance of the child group reached through the link. It sets r8d = 5, the old value 2+3, which stays fixed because edx is now 3. It resumes at **0x002C018B** | L8, L17, L31-34, L53-59 | byte-check-in-code (meaning of the chain: unclear) |
| 0x002C0476 (RVA 0x1A0476), HP digit tier | Original `49 81 FE 10 27 00 00` (cmp r14,10000). The vanilla code chooses among the HP groups by comparing with 10,000. The patch becomes a jump to cave `feuti_hp` plus 2 NOPs. r14 holds the HP value. When r12d == 0 (HP not known, so the "?" display is shown), the tier is fixed at 3. Otherwise the tier is 1, plus 1 for each threshold that HP reaches: 100, 1,000, 10,000 and 100,000. That gives tiers 1-5 | L10, L18, L35-38, L62-86 | byte-check-in-code |
| HP group select loop | For r9d = 5 down to 1, the cave reads a u16 byte offset from `feuti_entryOffset[r9d]` and uses it to pick a link-entry instance from the pointer array at **[rbx+0x60]**. From that instance it takes **+0x18** (the child group instance). If rbx is null it uses rdi instead. It then calls **0x00247870**(rcx = child, edx = 1 if r9d == tier, else 0). The chosen child is also kept in rsi. After the loop, ebp = tier + 1, which is the digit count (2-6), and the code resumes at **0x002C065F** | L88-120 | used-in-code |
| Offset table `feuti_entryOffset` | 6 x u16 = {0, 1, 2, 3, 4, 9} x 8. Tier 1-4 maps to link entries 1-4 of group 0 (2-, 3-, 4- and 5-digit HP). Tier 5 maps to the new link entry 9 (6 digits) | L321-328 | used-in-code |
| Symbols | `feuti_mrp` = 8 bytes from `memory.allocExe`, which holds the new MRP pointer. `feuti_entryOffset` = 12 bytes. The caves `feuti_menu`, `feuti_lvl` and `feuti_hp` are assembled as labelled blocks. Each site is patched with `memory.assemble(code, address)`. The `%name%` syntax places a symbol address | L123-132, L317-333 | used-in-code |
| Risk | The jump to `feuti_menu` goes live at once, but `feuti_mrp` is filled only about 2 s later, once section 1 has loaded. If the panel is built before that, rdx would be whatever allocExe returned in that slot (probably zero) | L318-335 | unclear (timing inference) |

### 1b. MRP section 1, target-info groups (22-29, renumbered 0-7, plus new groups 8 and 9)

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Source | Section id 1. Groups 22..29 are read in order and become new groups 0..7. The group `index` field is written as 4 x the new group number | L278-281; helpers L90-98 (xref) | used-in-code |
| Group 0 entries (target info general) | Entry 5 = target name. Entries 8 and 9 = the two vanilla level digits. Entry 17 = HP bar. Entry 7 = status text. Entry 15 = status icon. Link entries: 0 -> underline, 1-4 -> 2-, 3-, 4- and 5-digit HP groups, 6 -> weakness, 12 -> an unknown group ("??") | L161-175, L215-253 | used-in-code (names from comments) |
| Link payload | Payload byte 0 (entry +0x0C) is the target group number inside the same MRP. The mod rewrites the links to 1, 2, 3, 4, 5, 6 and 7 (entry 12). It replaces entries 8 and 9 with copies of entry 0 that link to the new groups 8 and 9. A comment says "Copy Entry 4", but the code copies entry 0 | L241-253 | used-in-code |
| New group 8: 3-digit level | A new group with 3 entries: copies of the old level digits 8 and 9, plus a third digit one digit-step to the right. Flags = 0x10. Width/height come from the last entry's right edge and the first entry's bottom edge. All entry flags are set to 0, which the comment says stops the digits from showing for NPC targets. The target name (group 0 entry 5) moves right by one digit-step | L152-175 | used-in-code |
| New group 9: 6-digit HP | A copy of group 5 (the 5-digit HP group). Entries 0-4 are big digits (current HP) and entries 5-9 are small digits (max HP). One big digit is inserted at index 5, and entries from there on move right by one big step. One small digit is added at the end, one small step further right. That gives 12 entries, all with flags = 0 | L178-213 | used-in-code |
| HP bar widen | Group 0 entry 17: the width grows by (big step + small step). The two u16 bar widths at payload +0x14 and +0x28 (entry +0x20 and +0x34) grow by the same amount. This is the same bar sub-record layout as the PartyInfo mist bars | L214-227 | used-in-code |
| User edit (status icon) | A comment block says the status text (entry 7) and icon (entry 15) are deliberately *not* moved. With the fixed offset the icon was pushed off the panel. The original shift lines are kept in a comment, so this looks like a local fix by the user | L228-234 | comment-only |
| Size recompute | groupOffset = 0x30. size = 0x30 + 0x14 per group + the sum of entry sizes. textureOffset = that total, and each texture adds 0x10. The total is written to size1, size2 and size3 | L256-273 | used-in-code |
| Load / relocate | `helpers.writeMrp` builds the blob in allocExe memory. It is passed to **`memory.executea(0x002A00F0, 0, 8, blob)`** (RVA 0x1800F0; probably the MRP relocate/init routine). The blob pointer is then stored in `feuti_mrp` | L279-287 | used-in-code (purpose of 0x2A00F0: unclear) |
| Ready check | The mod polls every 1000 ms until the u64 at **0x0209AC60 + 1*8** (section table, section 1) is non-null and its first u32 == **0x0150524D** ('M','R','P' + flag 0x01). It then waits 1000 ms more and builds the MRP | L289-297 | used-in-code |
| Cleanup | On "exit", the mod calls `memory.unregisterAllSymbols()` and `collectgarbage()` | L299-302, L336 | used-in-code |

---

## 2. `ModMenu.lua` (Free Camera mod-menu page)

**Purpose.** This file returns the Lua Loader mod-menu entry for Free Camera: 26 rebindable hotkeys in 7 divider
sections, plus a "Reset Controls" button. The main FreeCamera.lua loads it with `dofile`. It also shows how the
`modmenu` and `dialog` APIs are used.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Entry shape | `{ id = "FreeCamera", name = "Free Camera", schema = { rows... } }` | L77-80, L351-353 | used-in-code |
| Row types | `keybind` rows have id, label, help (tooltip text), type, entries (the number of binding slots, 1 here), default (a `modmenu.key.*` code) and callback(modId, fieldId, value, oldValue). `divider` rows have a label only. `button` rows have id, label, help and callback() | L81-349 | used-in-code |
| modmenu API | `modmenu.getKey(modId, fieldId, slot)` returns the bound code. `modmenu.setKey(modId, fieldId, slot, value[, notify])`. The reset path passes `false` as the 5th argument, which probably stops the change callback from firing | L8, L16, L37, L46 | used-in-code (5th argument meaning: unclear) |
| Keyboard range | A code is accepted only if 28 <= key < 0x200. Any other code (probably mouse or pad) is reverted to oldValue | L1-3, L14-18 | used-in-code |
| Conflict check | The new code is compared with every other keybind row in the schema. On a clash, a dialog asks to override. Choosing "No" (choice 1) restores the old key | L6-12, L20-40 | used-in-code |
| dialog.show options | body (supports the `{speed:0}` text tag), choice = {"Yes","No"}, cursor = 1 (default selection), cancel = 1 (the index used when cancelled), closeOnCancel, x = 960, y = 540 (the centre of a 1920x1080 virtual screen), align = 4 (centred), dim = true, lockInterface = true, onClose(choiceIndex, 0-based) | L24-40, L52-68 | used-in-code |
| Default keys | toggleFreeCamera GRAVE. Target: arrow keys. Movement: A/D/W/S, Q down, E up. Roll: 1 left, 2 reset, 3 right. FOV: R zoom in, F zoom out. Speed: LEFT_ALT slow, LEFT_SHIFT boost. freezeGame F4, advanceFrame 4, saveCameraInfo F5, loadCameraInfo F6, toggleCameraCharacter F7, togglePartyFollow F8, displayCameraInfo F10, toggleUserInterface F11 | L81-338 | used-in-code |
| Help text facts | Mouse movement also turns the target and the mouse wheel also changes speed, but neither can be rebound. A controller always drives the character | L71-75, L306 | comment-only (help strings) |
| Reset button | Confirms with a dialog, then sets every keybind back to its `default` | L43-69, L343-349 | used-in-code |
| Numeric key codes | See batch 12 (Hotkeys.json): A..Z = 28..53, 1..4 = 54..57, F4..F11 = 68..75, arrows 91..94, LShift 118, LAlt 119, grave 123 | n/a | used-in-code (xref) |

---

## 3. `Patches.lua` (Free Camera code patches)

**Purpose.** This is the patch table for Free Camera. It holds one data block of state bytes and 18 code sites, each
with `target`, `originalBytes`, `patchCode` and (for caves) `blockCode` + `symbols`. FreeCamera.lua (xref L567-591)
assembles every block, then patches each site **only if** the bytes there equal `originalBytes`. On disable it writes
the original bytes back and frees the caves (xref L537-548). Together the patches take over the game camera, freeze
the world, gate input, stop party following and hide the UI.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| State block | `fc_base` u64 = 0 (the active camera object). `fc_lsm` u8 = 2 (the last screen mode). `fc_is` u8 = 0 (camera initialised). `fc_uis` u8 = 0 (input owner: 0 = camera, 1 = character). `fc_pmafs` u8 = 0 (party follow off). `fc_fgs` u8 = 0 (world frozen). `fc_afs` u8 = 0 (advance one frame). `fc_uirs` u8 = 1 (UI shown) | L2-29 | used-in-code (meanings from FreeCamera.lua xref) |
| 0x00259884 (RVA 0x139884), camera takeover | Original `F3 0F 10 0D 10 24 A9 01` = movss xmm1,[**0x01CEBC9C**]. The patch jumps to `fc_code` (plus 3 NOPs). In the cave rbx = the current camera. If rbx is null, the cave skips. If edx == 2, it uses rbx as is. Otherwise it switches to camera slot 2 = **0x02097300 + 2*0x110**. The first time through (fc_is == 0) it copies from rbx: FOV float +0x28, the block +0xB0..+0xD7 (eye and look-at vectors, as four 16-byte moves at +0xB0/+0xB8/+0xC0/+0xC8) and roll float +0xE4 | L30-70 | byte-check-in-code |
| Camera cave tail | It sets rdi = camera + 0x20 and stores it at **0x020972F0** (the active camera sub-object pointer). It calls **0x001825C0** with ecx = 0, r8d = 0 and xmm1 = float [0x01CEBC9C], which replays the call the original code made. It stores rbx in `fc_base` and sets fc_is = 1. It resumes at **0x00259916**, or at **0x00259945** when rbx is null | L73-89 | byte-check-in-code |
| Camera object layout | +0x20 sub-object (its address is what the game stores as the active camera). +0x28 FOV (float, radians). +0xB0/+0xB4/+0xB8 eye x/y/z. +0xC0/+0xC4/+0xC8 look-at x/y/z. +0xE4 roll (float, radians). Slot stride 0x110 | L54-67; FreeCamera.lua L134-163 (xref) | used-in-code |
| 0x0032B04E (RVA 0x20B04E) | Original `E8 2D 10 0A 00` = call **0x003CC080**. The patch calls **0x003CBD60** instead (a different routine of the same family; its purpose is not stated) | L93-99 | byte-check-in-code (purpose: unclear) |
| 0x0032AF06 (RVA 0x20AF06) | Original `E8 B5 02 00 00` = call **0x0032B1C0**. Replaced by 5 NOPs | L100-106 | byte-check-in-code |
| 0x00229D20 / 0x00229D60 (RVA 0x109D20 / 0x109D60) | Originals `0F B6 0D AA AD E3 01` and `0F B6 0D 6A AD E3 01` both = movzx ecx, byte [**0x02064AD1**] (screen mode). Both are redirected to `fc_lsm`, which holds the value saved when the mod is enabled | L107-120 | byte-check-in-code |
| 0x0022A891 (RVA 0x10A891) | Original `85 C0` (test eax,eax) becomes `cmp eax,eax`, which forces ZF = 1 | L121-127 | byte-check-in-code |
| 0x0024CBFC (RVA 0x12CBFC) | Original `80 3D 3D 5A E4 01 00` = cmp byte [**0x02092640**],0. Replaced by cmp eax,eax + 5 NOPs, so the code acts as if the flag were 0 | L128-135 | byte-check-in-code |
| 0x002599C5 (RVA 0x1399C5) | Original `80 3D 1D F4 E3 01 00` = cmp byte [**0x02098DE9**],0. Replaced by cmp eax,eax + 5 NOPs | L136-143 | byte-check-in-code |
| 0x0037422E (RVA 0x25422E) | Original `0F B6 44 24 3B` (movzx eax, byte [rsp+0x3B]) becomes xor eax,eax + 3 NOPs | L144-151 | byte-check-in-code |
| 0x00374665 (RVA 0x254665) | Original `C7 05 D1 4F 77 02 01 00 00 00` = mov dword [**0x02AE9640**],1. The patch stores 0 there instead | L152-158 | byte-check-in-code |
| 0x003756F1 (RVA 0x2556F1) | Original `48 85 C9` (test rcx,rcx) becomes cmp eax,eax + NOP | L159-166 | byte-check-in-code |
| 0x0037D7C4 (RVA 0x25D7C4) | Original `E8 A7 53 00 00` = call **0x00382B70**. Replaced by 5 NOPs | L167-173 | byte-check-in-code |
| 0x001E0D90 (RVA 0xC0D90), input gate | Original `E9 9B 2C 3E 00` = a jmp thunk to **0x005C3A30** (probably the keyboard/input query). The patch jumps to cave `fc13_code`. If `fc_uis` != 0 (the character has control) or the cursor byte **[0x01F3DA06]** != 0, the cave goes on to 0x005C3A30. Otherwise it returns 0, so the game sees no input | L174-192 | byte-check-in-code |
| 0x0079D63B / 0x0079D65E (RVA 0x67D63B / 0x67D65E), key-state getters | Originals `0F B6 84 0A 31 02 00 00` / `0F B6 84 0A F4 01 00 00` = movzx eax, byte [rdx+rcx+0x231] or [rdx+rcx+0x1F4]. Each becomes a jump to its cave plus 3 NOPs. The cave uses the same gate (fc_uis or cursor) and then does the read itself and returns, so both originals are small leaf getters. The input state object has two byte arrays at +0x1F4 and +0x231 | L193-240 | byte-check-in-code |
| 0x0022AE28 (RVA 0x10AE28), world freeze | Original `F3 0F 59 05 94 9C E3 01` = mulss xmm0,[**0x02064AC4**] (the per-frame time scale). In the cave: if fc_fgs == 0, the original multiply runs. If the world is frozen, xmm0 = 0, unless fc_afs is set; then fc_afs is cleared and one normal frame runs. It resumes at 0x0022AE30 | L241-267 | byte-check-in-code |
| 0x00305D02 (RVA 0x1E5D02), party follow | Original `48 89 9C 24 80 00 00 00` (mov [rsp+0x80],rbx). In the cave: if `fc_pmafs` is set and r10 is **0x01E09350** or **0x01EEC3C0**, it jumps to **0x00305CF7**, skipping the follow step. Otherwise it repeats the store and resumes at 0x00305D0A | L268-293 | byte-check-in-code (what the two r10 values are: unclear) |
| 0x003583BA (RVA 0x2383BA), UI render | Original `0F B7 04 81 C1 E8 03` (movzx eax, word [rcx+rax*4] ; shr eax,3). It is replaced, at the same 7 bytes, by movzx eax, byte [`fc_uirs`]. So the "UI visible" value no longer comes from bits 3+ of a word table but from the mod flag | L294-300 | byte-check-in-code |
| Patch table schema | Each entry is { target, originalBytes, patchCode, blockCode, symbols }. An entry with no target is a pure data/cave block. `nop N` emits N NOP bytes | L1-303 | used-in-code |

---

## 4. `affinity.lua` (TAA equipment: elemental affinity bitmask helper)

**Purpose.** A factory `create(offset)` that returns has/set/remove/list/clearAll for an 8-bit element mask stored at
`attributePointer + offset` in a section-13 equipment record. The main script makes five of them (xref).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Bit layout | One u8. Element id 1..8 maps to bit id-1. Ids outside 1..8 are rejected | L5-8 | used-in-code |
| Offsets used | attributePointer **+0x10 absorb, +0x11 immune, +0x12 half, +0x13 weak, +0x14 potency** (boost) | TheArchadianAlchemist.lua L76-80 (xref) | used-in-code |
| Writes | set ORs the bit in. remove clears it. clearAll writes 0 to the byte. All writes go straight to memory with `memory.u8` | L10-33 | used-in-code |
| Element ids | fire 1, lightning 2, ice 3, earth 4, water 5, wind 6, holy 7, dark 8 | mappings.lua L129-138 | used-in-code |

---

## 5. `attribute.lua` (TAA equipment: attribute read/write)

**Purpose.** This maps the TAA attribute ids 10-26 to storage. "Direct" ids go to named fields of the Lua Loader
equipment object. "Linked" ids go to the attribute record behind `attributePointer`.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Direct fields (bpack.section13 object) | 10 range, 11 chargeTime, 12 attackPower, 13 onHitRate, 14 knockbackChance, 15 comboOrCriticalChance, 16 evadeWeapon, 17 evadeShield, 18 magickEvadeShield, 19 defense, 20 magickResist. These are read and written as `eq[fieldName]` | L4-15, L24-44 | used-in-code |
| Attribute record (attributePointer) | +0x00 u16 maxHp (21). +0x02 u16 maxMp (22). +0x04 u8 strength (23). +0x05 u8 magickPower (24). +0x06 u8 vitality (25). +0x07 u8 speed (26) | L16-21 | used-in-code |
| Remaining record layout | +0x08 u32 on-equip status mask. +0x0C u32 status immunity mask. +0x10..+0x14 u8 element masks (absorb, immune, half, weak, potency) | TheArchadianAlchemist.lua L74-80 (xref) | used-in-code |
| Shared record caveat | Equipment that shares one attribute record (one attributePointer) changes together. The code has no guard against this | L42 | unclear (inference) |

---

## 6. `element.lua` (TAA equipment: on-hit element)

**Purpose.** This reads and sets a weapon's single on-hit element through the Lua Loader `eq.elements` table of named
0/1 flags.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Field names | `eq.elements.fire/lightning/ice/earth/water/wind/holy/dark` (0 or 1). Index 1..8 follows that order | L4 | used-in-code |
| Single element | set clears all 8 flags, then sets one. remove clears all. get returns the first id that is set, or 0 | L8-23 | used-in-code |

---

## 7. `status.lua` (TAA equipment: 32-bit status mask helper)

**Purpose.** A factory `create(offset)` for a 4-byte status bitmask at `attributePointer + offset`, accessed byte by
byte.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Bit layout | Status id 1..32 maps to bit (id-1): byte offset + floor((id-1)/8), bit (id-1)%8. This is little-endian, so it equals a u32 mask with bit id-1 | L5-25 | used-in-code |
| Offsets used | **+0x08 on-equip status** (auto-status while equipped). **+0x0C status immunity** | TheArchadianAlchemist.lua L74-75 (xref) | used-in-code |
| clearAll | Zeroes the 4 bytes | L33-36 | used-in-code |

---

## 8. `statusOnHit.lua` (TAA equipment: on-hit status flags)

**Purpose.** This module handles on-hit statuses (the statuses a weapon inflicts) through the Lua Loader
`eq.statusEffects` table of named 0/1 flags. It is keyed by the names in `mappings.effect`. It also gives the
id -> name lookup that the controller uses for every status list.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Name table | Built at initialize from mappings.effect (name -> id) by inverting it | L6-10 | used-in-code |
| Fields | `eq.statusEffects.<name>` = 0 or 1. The names are the 30 effect names (ko .. libra) | L14-43 | used-in-code |

---

## 9. `controller.lua` (TAA core)

**Purpose.** This runs the Alchemist NPC menu. It polls the shared block that the mod's event script fills, reads
the selection, previews the cost or new value, applies the change to section-13 equipment, keeps a per-equipment
history for the save sidecar, re-applies that history after a load and refreshes party stats and DynamicDescription
text.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Party stat refresh | For party ids 0..39: `memory.execute(0x00320A40, ret pointer, s32 id)` returns the battle-unit keep. If it is non-null, `memory.execute(0x0030FED0, ret void, {pointer, s32}, {keep, 0x97})` follows | L20-29 | used-in-code |
| Description refresh | `dd_api.refresh()` (DynamicDescription) runs after any change, deferred until a "reset" event | L31-34, L72-73, L107 | used-in-code |
| Poll loop | It is scheduled with `event.executeAfterMs(flow.interval())`. A pollId counter cancels old loops. Each tick runs `progression.update()` first | L40-76 | used-in-code |
| Selection read | intention = u8 base+0x204, class = u8 base+0x205, parameter id = u8 base+0x206, equipment id = u16 base+0x208. Nothing is selected if intention or equipment id is 0. The equipment object is `bpack.section13[equipmentId - 0x1000]` | L78-86 | used-in-code |
| Name/role swap | The code calls +0x206 "subcategory", but it is the **parameter id** (attribute 10-26 / element 1-8 / status 1-31). It calls +0x205 "category", but it is the TAA equipment **class** 1-36 used as the key into the limit table | L84-85, L95, L170, L179 | used-in-code |
| Intention codes | 1 refine attribute. 2 set on-hit element. 3 add on-hit status. 4 add on-equip status. 5 add status immunity. 6 add element immune. 7 absorb. 8 weak. 9 half. 10 potency. 11 revert attribute. 12 remove element. 13 remove on-hit status. 14 remove on-equip. 15 remove immunity. 16-20 remove immune / absorb / weak / half / potency | L196-299 | used-in-code |
| Preview pricing | 1 uses the curved cost (see refinement). 2 and 6-10 use the element cost at row 1. 3-5 use the effect cost at row 1. 11 uses the attribute `remove` cost and shows actual -> initial. 12/16-20 use the element remove cost. 13-15 use the effect remove cost | L191-238 | used-in-code |
| Refinement data | The cap is limit[class][attrName]. A missing cap means the attribute cannot be refined. chargeTime is the only inverse attribute. History per equipment: attributes[name] = {initial, actual, level} | L173-189, L241-253 | used-in-code |
| On-equip side effect | Intentions 4 and 14 set refresh.party, so party stats are recomputed at the next reset | L259-265, L286-292 | used-in-code |
| Filter block write | After apply (intentions 2 and >= 11) or on a "filter" event, it zeroes and then rewrites: u32 +0x220 on-hit, +0x224 on-equip, +0x228 immune status masks. u8 +0x22C on-hit element **id**. u8 +0x22D absorb, +0x22E immune, +0x22F half, +0x230 weak, +0x231 potency masks. u32 +0x234 refined-attribute mask (bit = attribute id). The session history wins over a live read | L303-400 | used-in-code |
| Save state | getState gives {tostring(eqId) = state}. loadState rebuilds it. reapply writes the history back into section 13 (attributes, element, effects, affinity), then refreshes the party and descriptions. Section-13 edits do not persist in the game save, which is why the sidecar exists | L402-473 | used-in-code |

---

## 10. `flow.lua` (TAA: event-script handshake)

**Purpose.** This is the handshake protocol between the NPC event script and Lua through the shared block at
0x02099DF0.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Poll interval | The u8 at +0x200 pollMode selects the interval: 0 = 1000 ms, 1 = 100 ms, 2 = 33 ms. Unknown values fall back to 1000 | L4-8, L26 | used-in-code |
| Reset | A u8 at +0x201 == 1 clears pollMode, reset, confirmed, intention, class, parameter and equipment id. This is reported as "reset" | L11-15, L33-41 | used-in-code |
| Confirm | The u8 at +0x202: 1 = preview, 2 = apply, 3 = filter. When it sees one, Lua sets pollMode = 2 (fast). `done` sets confirmed = 0 and pollMode = 1 | L17-31 | used-in-code |

---

## 11. `mappings.lua` (TAA: addresses and enums)

**Purpose.** This is the central table of addresses, block offsets and enums.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Globals | base **0x02099DF0** (RVA 0x1F79DF0; shared scratch area, TAA uses +0x200..+0x258 = 0x02099FF0..0x0209A048). locationId **0x021654C4** (u32). storyProgress **0x02164480** (u16). battleUnitKeep fn **0x00320A40** (RVA 0x200A40). refreshStats fn **0x0030FED0** (RVA 0x1EFED0) | L4-9 | used-in-code |
| Flow / selection | +0x200 pollMode, +0x201 reset, +0x202 confirmed. +0x204 intention, +0x205 class, +0x206 parameter, +0x208 equipment id (u16) | L11-22 | used-in-code |
| Output | +0x20A blocked u8. +0x20C gil u32. Loot pairs {u16 id, u16 qty} at +0x210/+0x212, +0x214/+0x216, +0x218/+0x21A. +0x21C current u16. +0x21E next u16 | L24-30 | used-in-code |
| Filter | +0x220/+0x224/+0x228 u32 status masks (on-hit/on-equip/immune). +0x22C element id. +0x22D..+0x231 affinity masks (absorb, immune, half, weak, potency). +0x234 u32 attribute mask | L32-47 | used-in-code |
| Quest | +0x238 status u8. +0x239 notification u8. +0x23A event (mapped, unused). +0x23C gil u32 | L49-54 | used-in-code |
| Unlock | +0x240 attributes u32. +0x244 onHitElement u8. +0x248 onHitStatus u32. +0x24C onEquipStatus u32. +0x250 immuneStatus u32. +0x254 weak, +0x255 half, +0x256 immune, +0x257 potency, +0x258 absorb (u8 each). Note that the order differs from the filter block | L56-67 | used-in-code |
| Equipment classes | sword 1, greatSword 2, katana 3, ninjaSword 4, spear 5, pole 6, bow 7, crossBow 8, gun 9, axe 10, hammer 11, dagger 12, rod 13, staff 14, mace 15, measure 16, handBomb 17, shield 18, lightHelm 19, mysticHelm 20, heavyHelm 21, lightArmor 22, mysticArmor 23, heavyArmor 24, ring 25, bracelet 26, glove 27, collar 28, pendant 29, belt 30, boot 31, crown 32, arrow 33, bolt 34, shot 35, bomb 36. Ids 1-18 match the game's equipment category. Ids 19-36 are TAA's own split (batch 12) | L70-107 | used-in-code |
| Attribute ids | range 10, chargeTime 11, attackPower 12, onHitRate 13, knockbackChance 14, comboOrCriticalChance 15, evadeWeapon 16, evadeShield 17, magickEvadeShield 18, defense 19, magickResist 20, maxHp 21, maxMp 22, strength 23, magickPower 24, vitality 25, speed 26 | L109-127 | used-in-code |
| Element ids | fire 1, lightning 2, ice 3, earth 4, water 5, wind 6, holy 7, dark 8 (bit = id-1) | L129-138 | used-in-code |
| Status ids | ko 1, stone 2, petrify 3, stop 4, sleep 5, confuse 6, doom 7, blind 8, poison 9, silence 10, sap 11, oil 12, reverse 13, disable 14, immobilize 15, slow 16, disease 17, lure 18, protect 19, shell 20, haste 21, bravery 22, faith 23, reflect 24, invisible 25, regen 26, float 27, berserk 28, bubble 29, libra 31. Id 30 (bit 29, HP Critical) and 32 (bit 31, X-Zone) are not mapped | L140-171 | used-in-code (names for bits 29/31 from batch 12) |

---

## 12. `progression.lua` (TAA: quest state and unlock tiers)

**Purpose.** This drives the unlock quest status byte and the "which options are offered" bitmasks from story
progress and the unlocks config.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Unlock key map | attributes -> u32, using lookup "attribute" and bit = id (10..26). onHitElement, affinityWeak, Half, Immune, Potency and Absorb -> u8 with bit = id-1. onHitStatus, onEquipStatus and statusImmunity (address "immuneStatus") -> u32 with bit = id-1 | L15-66, L95, L124, L134-144 | used-in-code |
| Story progress | u16 at 0x02164480 | L68 | used-in-code |
| Tier logic | Tiers are cumulative and compared by `progress >= entry.progress` in config order. The tier number is the last tier reached. Unknown names are skipped silently | L70-132 | used-in-code |
| Standard state machine | status 0 -> 1 when progress >= start. 1 -> 2 when the script writes 2 at +0x238. 2 -> 3 when progress >= finish. 3 -> 4 when the script writes 4. While status == 1, quest.gil is written as u32 at +0x23C. Unlock bits are written only when status >= 4 (otherwise they come from progress 0). +0x239 = 1 when a new tier exceeds lastNotifiedTier | L184-217 | used-in-code |
| Custom path | With customProgress, status comes from a symbol getter, capped at 4. With customUnlock, the tier also comes from a symbol. In the main script these getters read a byte that is never registered as the symbol (a bug, see batch 12) | L150-182 | used-in-code |
| Saved state | {questStatus, lastNotifiedTier}, stored in the sidecar | L220-242 | used-in-code |

---

## 13. `refinement.lua` (TAA: refinement curve and cost math)

**Purpose.** This has the formulas for how far an attribute can be raised, in how many steps, and at what cost.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Curve rows | MULTIPLIERS = costs/curve.lua rows of {qty1, qty2, qty3, gil} multipliers. MAX_TIER = the number of rows (12 in the shipped config) | L4-10 | used-in-code |
| Exponent | alpha = 1.1 + 0.4 x min(1, cap/150) | L12 | used-in-code |
| Effective cap | Normal: cap - floor((cap - initial) x 0.15), or cap if initial >= cap. Inverse: cap + floor((initial - cap) x 0.15), or cap if initial <= cap | L14-21 | used-in-code |
| Slots | distance = abs(cap - initial). This is 0 when the distance is below 1. maxSlots = clamp(ceil(cap/2), 1, MAX_TIER). slots = min(distance, clamp(ceil(distance x maxSlots / cap), 1, maxSlots)) | L23-31 | used-in-code |
| Value at level | v = initial + floor((effCap - initial) x (level/slots)^alpha). The result is at least initial + level (or at most initial - level when inverse) | L33-44 | used-in-code |
| Can upgrade | Refused when the start value is already at or past the cap, or when level >= slots. Otherwise the next value must stay within the effective cap | L46-61 | used-in-code |
| Cost | costLevel = (MAX_TIER - slots) + upgradeNumber (MAX_TIER if slots < 1). gil = floor(base gil x mult[4]). Loot qty i = ceil(qty x mult[i]). A missing row uses {1,1,1,1} | L63-81 | used-in-code |

---

## 14. `writer.lua` (TAA: output to event script)

**Purpose.** This writes the preview and cost into the shared block for the event script to display.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Cost write | u32 gil at +0x20C. For i = 1..3, u16 loot id and u16 qty at the loot pair offsets. Empty slots are 0 | L6-13 | used-in-code |
| Preview write | u16 current at +0x21C, u16 next at +0x21E, u8 blocked (1/0) at +0x20A | L15-19 | used-in-code |
| Clear | Writes zero value, zero cost and no items | L21-27 | used-in-code |

---

## Editor relevance

* **MRP editing (HUD widening).** TargetInfo confirms the MRP model from batch 16 for a second HUD: section 1
  groups 22-29 are the target-info panel. In group 0, link entries carry the target group in payload byte 0. Entry
  17 is the HP bar, with u16 bar widths at payload +0x14/+0x28. Digit groups hold big (current) digits first, then
  small (max) digits. An offline MRP editor can model all of this: insert digits, change link targets, recompute the
  0x30 + 0x14*g + entries + 0x10*t sizes. A live tool must call 0x002A00F0 on the new blob and redirect the
  builder's MRP pointer (here at the call 0x002C0A2E -> 0x002BEFB0, with the group index at 0x002C0A23).
* **HUD number limits.** The level digit count is the immediate at 0x002C0174. The HP tier choice is at 0x002C0476
  (cmp r14,10000). 0x00247870(child, visible) toggles child groups. These are the hook points for any "bigger
  numbers" patch.
* **Camera / photo-mode tool.** Camera slots are at 0x02097300 (stride 0x110) and the active pointer is at
  0x020972F0. The camera layout is FOV +0x28, eye +0xB0, look-at +0xC0, roll +0xE4. The world time scale is at
  0x02064AC4. Input getters are at 0x001E0D90 / 0x0079D63B / 0x0079D65E. The UI-visible read is at 0x003583BA. A
  Cheat Engine table can expose these as-is, and every site has known original bytes for safe patch/unpatch.
* **Mod-menu and dialog UI.** The ModMenu schema format (keybind/divider/button rows, `modmenu.getKey/setKey`,
  `dialog.show` options) is a ready template for an in-game editor page.
* **Equipment editor (section 13).** Direct fields (range ... magickResist), plus the attribute record:
  +0x00 HP u16, +0x02 MP u16, +0x04..+0x07 STR/MAG/VIT/SPD, +0x08 on-equip status u32, +0x0C immunity u32,
  +0x10..+0x14 absorb/immune/half/weak/potency u8. On-hit element and status are named bitfields in the loader
  object. The status and element bit orders are confirmed. After live edits, refresh the party with
  0x00320A40 + 0x0030FED0(keep, 0x97).
* **Event-script <-> Lua mailbox.** The 0x02099DF0 + 0x200.. block shows a working protocol: poll mode, confirm
  codes, and result fields an event script can display. A custom NPC menu could reuse it.
