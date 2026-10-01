# Drive batch 12: FreeCamera config, The Archadian Alchemist config, TIDI language templates (ch/cn/de/es/fr)

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR. RVA = address - 0x120000.
All facts are written in my own words. No code is copied. FreeCamera and TIDI are by Xeavin (personal use only).
The Archadian Alchemist (TAA) is by FehDead (each file has a "Made By FehDead" header).

| Drive id | Title | Drive path | Lines / bytes | md5 (first 8) | EOL | Status |
|---|---|---|---|---|---|---|
| 1n3Z9--FjjK7Lf0Qq3kL_yr592F7SuobV | Camera.json | My Laptop/scripts/config/FreeCameraConfig | 15 / 220 | df3b71c4 | CRLF | read in full |
| 1sazLY565vYKYePIYlBtxy7dbVIl9F7vL | Hotkeys.json | same | 28 / 659 | 4e931b19 | CRLF | read in full |
| 1YCUyJ2c0UIQMwXfDPZHBzR6Las0WH1J2 | limit.lua | My Laptop/scripts/config/TheArchadianAlchemist/attribute | 452 / 9671 | 9f03c39d | LF | read in full |
| 1UxH2iAZPUnEXr2-RZFFu5cSlNJOgOc-W | attributes.lua | .../TheArchadianAlchemist/costs | 21 / 1016 | 331ab8cb | LF | read in full |
| 1AObRfjJcizAKhZR_epRNHqkHfywj-D4w | curve.lua | .../TheArchadianAlchemist/costs | 15 / 466 | 5e22bd0b | LF | read in full |
| 1CHLn40kH9ABoN7mqGAGGJ74HxrwGV6XM | effects.lua | .../TheArchadianAlchemist/costs | 34 / 1600 | 33eaae63 | LF | read in full |
| 1dZTHY8Y4MoOnfIi9cCAyzMHQaNWWlLGG | elements.lua | .../TheArchadianAlchemist/costs | 12 / 480 | 8c24aa36 | LF | read in full |
| 1mUYrcvWuJsE8pEkoct1YZBP94NiuymIL | quest.lua | .../TheArchadianAlchemist/progression | 10 / 167 | 07105856 | LF | read in full |
| 1O2BvBU0RU97GZd70pytWuWxCv8CJoa9n | unlocks.lua | .../TheArchadianAlchemist/progression | 75 / 2646 | 833d36b7 | LF | read in full |
| 1VEQU4w4Nk7ZaeFWJUxS2gkECFXRdp9Ge | ch.lua | My Laptop/scripts/config/TheInsurgentsDescriptiveInventoryConfig | 9 / 147 | c7f9a511 | CRLF | read in full |
| 1MaLc-FtrVpEe6wZJU_ah_6_g6gxLnuG7 | cn.lua | same | 9 / 147 | c7f9a511 | CRLF | read in full |
| 1SivoVmhaoFTZxAhMgfKonYJdDmKutqnh | de.lua | same | 9 / 147 | c7f9a511 | CRLF | read in full |
| 1fMIUGATSSh43ZCuTVekfJUc9jVgEibTm | es.lua | same | 9 / 147 | c7f9a511 | CRLF | read in full |
| 1b6aCosqTNCLkTqb-SFl1MGSzGZENZd8W | fr.lua | same | 9 / 147 | c7f9a511 | CRLF | read in full |

No file is missing. No file has a BOM. None of the 14 files contains an address, a hook or a byte check.
They are data/config files. To read them correctly I also read their consumers in the same Drive export. Rows that
depend on a consumer are marked **(xref)** and name the consumer file and line:

* FreeCamera: `FreeCamera.lua` (1k3Yy3CI..., 679 lines), `FreeCamera/ModMenu.lua` (1FpwuMii..., 353 lines),
  `FreeCamera/Patches.lua` (1gOhNOTm..., 303 lines).
* TAA: `TheArchadianAlchemist.lua` (1dxIyynp..., 191 lines) and its modules `mappings.lua` (1YYX4OI8..., 173),
  `controller.lua` (16ZznPVN..., 475), `progression.lua` (1VWcoQOJ..., 255), `refinement.lua` (1uP94DKA..., 83),
  `flow.lua` (1U9IJxPv..., 48), `writer.lua` (1DkO-L7j..., 35), `equipment/attribute.lua` (1GHdgLzs..., 51),
  `equipment/element.lua` (1zZyGV_0..., 26), `equipment/statusOnHit.lua` (1hXlFHBf..., 45), `equipment/status.lua`
  (1oFILkg5..., 41), `equipment/affinity.lua` (1HaDspQv..., 38).
* TIDI: `TheInsurgentsDescriptiveInventory.lua` (1sKZGnkO..., 201 lines). This consumer is already documented in full in
  batch_13, so only the language-id rows are repeated here.

Evidence key: **byte-check-in-code** means the code compares the original bytes before it patches. **used-in-code**
means the code reads, writes or executes the value. **comment-only** means only a comment says it. **unclear** means
it is my inference.

---

## 1. Camera.json (FreeCameraConfig)

**Purpose.** This file stores the single "saved camera" snapshot for Xeavin's Free Camera mod. The *Save Camera Info*
hotkey writes it, and *Load Camera Info* reads it back. The mod reads it once when the patch is applied
(`onInitDone`). The user's copy holds the empty/zero state: location 0 and every float 0.0.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Format | A JSON object with 5 keys: `cameraFov` (number), `cameraPosition` (array of 3 numbers), `cameraRoll` (number), `location` (integer), `lookAtPosition` (array of 3 numbers). It is written by the loader's `config.saveJson` (4-space indent, CRLF) and read by `config.loadJson`. The keys happen to be alphabetical here, but Hotkeys.json is not sorted, so key order carries no meaning | L1-L15 | used-in-code (FreeCamera.lua L179-L200, xref) |
| `location` | The location (map) id when the snapshot was saved. It is read as an **s32 at 0x021654C4** (RVA 0x020454C4). A load is applied only when the current location equals this value. Otherwise the mod prints "No last saved position." | L9 | used-in-code (FreeCamera.lua L208, L219-L225, xref) |
| `cameraFov` | The vertical field of view in **radians** (float at camera +0x28). The live controls clamp it to 0.01 deg - 179.99 deg, but a JSON load writes it **unclamped**. The zero in this file would therefore set FOV 0 if it were loaded at location 0 | L2 | used-in-code (FreeCamera.lua L140, L158, L368-L369, xref) |
| `cameraPosition` | The camera eye x, y, z as floats at camera **+0xB0, +0xB4, +0xB8** (the code computes 0xAC + i*4 for i = 1..3) | L3-L7 | used-in-code (FreeCamera.lua L145, L162, xref) |
| `cameraRoll` | The roll in **radians** (float at camera **+0xE4**). The live controls clamp it to +/-360 deg | L8 | used-in-code (FreeCamera.lua L141, L159, L384-L385, xref) |
| `lookAtPosition` | The look-at (target) x, y, z as floats at camera **+0xC0, +0xC4, +0xC8** (0xBC + i*4) | L10-L14 | used-in-code (FreeCamera.lua L146, L163, xref) |
| Camera object pointer | The u64 symbol `fc_base` (a loader-allocated block) is set by a code cave at **0x00259884** (RVA 0x139884). The cave is applied only when the original bytes there are **F3 0F 10 0D 10 24 A9 01** (a `movss xmm1,[rip+...]`). When the cave first runs, it copies FOV (+0x28), the 0xB0-0xD7 block and roll (+0xE4) from the game's current camera into camera slot 2, and from then on uses slot 2 | n/a | byte-check-in-code (Patches.lua L30-L92 + FreeCamera.lua L567-L591, xref) |
| Camera slot array | Camera slots start at **0x02097300** with a stride of **0x110**. Slot 2's FOV is at 0x02097548 (= 0x02097300 + 2*0x110 + 0x28). The mod saves this FOV when it enables and restores it when it disables. The game's active-camera pointer (camera + 0x20) is stored at **0x020972F0** | n/a | used-in-code (FreeCamera.lua L552-L553, L597-L598; Patches.lua L46-L49, L77, xref) |
| Default when absent | If the file is missing or does not parse, the "last saved" values stay nil and Load does nothing | n/a | used-in-code (FreeCamera.lua L174-L189, xref) |

## 2. Hotkeys.json (FreeCameraConfig)

**Purpose.** These are the persistent key bindings for the Free Camera mod-menu page (mod-menu id `FreeCamera`). On
load, each keybind starts with the schema default from ModMenu.lua. Any key present in this JSON then overrides
it. When the mod menu closes ("exit" callback), the file is rewritten, but only if a binding changed. Every value in
the user's file equals the ModMenu.lua default, so this is the stock binding set.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Format | A flat JSON object of 26 entries. Each maps a keybind id (string) to an integer key code (Lua Loader `modmenu.key.*` enum) | L1-L28 | used-in-code (FreeCamera.lua L619-L659, xref) |
| Valid range | The mod accepts only keyboard codes **28 <= key < 0x200**. Any other value is reverted to the old binding. A conflicting binding opens a Yes/No `dialog.show` prompt (x 960, y 540, align 4, dimmed, interface locked) | n/a | used-in-code (ModMenu.lua L1-L41, xref) |
| Letter codes | KEY_A = 28, D = 31, E = 32, F = 33, Q = 44, R = 45, S = 46, W = 50. These fit a contiguous **A..Z = 28..53** block | L6-L11, L15-L16 | used-in-code (defaults from ModMenu.lua; the contiguous block is inferred) |
| Digit codes | KEY_1 = 54, KEY_2 = 55, KEY_3 = 56, KEY_4 = 57. This suggests 1..9 = 54..62 (and 0 = 63, which is unverified) | L12-L14, L21 | used-in-code (contiguity inferred) |
| Function keys | F4 = 68, F5 = 69, F6 = 70, F7 = 71, F8 = 72, F10 = 74, F11 = 75. This implies F1 = 65 and F9 = 73 (inferred) | L20, L22-L27 | used-in-code |
| Arrows / modifiers | LEFT = 91, RIGHT = 92, UP = 93, DOWN = 94. LEFT_SHIFT = 118, LEFT_ALT = 119. GRAVE (backtick) = 123 | L2-L5, L17-L19 | used-in-code |
| Binding meaning | targetUp/Down/Left/Right adjust pitch and yaw (the mouse also does, and cannot be rebound). movement* move along forward, right and up. rotateLeft/Right/resetRotation change roll. zoomIn/Out change FOV. slow (/3) and boost (x3) scale speed. toggleFreeCamera (`` ` ``) turns the mode on and off. freezeGame F4. advanceFrame 4. saveCameraInfo F5. loadCameraInfo F6. toggleCameraCharacter F7. togglePartyFollow F8. displayCameraInfo F10. toggleUserInterface F11 | L2-L27 | used-in-code (FreeCamera.lua L230-L240, L346-L505, L665; ModMenu.lua L77-L350, xref) |
| Speed model | The base speed is 0.05 (range 0.001-0.1, step 0.001, mouse wheel x3 when the wheel state byte is 1). Movement per frame = 5 * speed * mul * (deltaTime / 16667 us) | n/a | used-in-code (FreeCamera.lua L251-L254, L320-L340, L497-L500, xref) |

### FreeCamera runtime globals used with these hotkeys (xref, FreeCamera.lua / Patches.lua)

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Auto-pause | u64 **[0x01FD4940]** != 0 means a menu auto-pause is active | FreeCamera.lua L19-L22 | used-in-code |
| Manual pause | u64 **[0x0209AD28]** != 0 means the player paused manually | FreeCamera.lua L24-L27 | used-in-code |
| Field state | s8 **[0x02064AD3]** == 2 means the camera is available (normal field gameplay) | FreeCamera.lua L29-L32 | used-in-code |
| Cursor shown | u8 **[0x01F3DA06]** != 0 means a menu or cursor is on screen | FreeCamera.lua L34-L37; Patches.lua L185, L205 | used-in-code |
| Screen mode | u8 **[0x02064AD1]** holds the last screen mode. It is copied into symbol `fc_lsm`, and two reads at 0x00229D20 / 0x00229D60 are redirected to it | FreeCamera.lua L594-L595; Patches.lua L107-L120 | byte-check-in-code (orig `0F B6 0D AA AD E3 01` / `0F B6 0D 6A AD E3 01`) |
| Mouse settings | u64 **[0x01F7FFE0]** -> +0x08 u8 invert X, +0x09 u8 invert Y, +0x0C s32 wheel accumulator (the mod resets it), +0x10 s32 wheel delta, +0x14 u8 wheel state (1 = fast) | FreeCamera.lua L320-L339, L403, L424 | used-in-code |
| Mouse axes | u64 **[[0x02EA5368] + 0xDF8]** -> +0x184 s32 X delta, +0x188 s32 Y delta. The dead zone is 7 | FreeCamera.lua L342-L344 | used-in-code |
| World time scale | float **[0x02064AC4]** is the per-frame time multiplier. The freeze cave at **0x0022AE28** (orig `F3 0F 59 05 94 9C E3 01`, a `mulss xmm0,[rip+..]`) puts 0 there while frozen, except on a single advance-frame tick | Patches.lua L241-L267 | byte-check-in-code |
| Party follow | The cave at **0x00305D02** (orig `48 89 9C 24 80 00 00 00`) branches to 0x00305CF7 (skipping the follow step) when `fc_pmafs` is set and r10 is 0x01E09350 or 0x01EEC3C0 | Patches.lua L268-L293 | byte-check-in-code |
| UI render | The read at **0x003583BA** (orig `0F B7 04 81 C1 E8 03`) is replaced by a byte from `fc_uirs` (1 = UI visible) | Patches.lua L294-L300 | byte-check-in-code |
| Other byte-checked patches | 0x0032B04E (`E8 2D 10 0A 00` -> call 0x003CBD60). 0x0032AF06 (`E8 B5 02 00 00` -> NOP x5). 0x0022A891 (`85 C0` -> cmp eax,eax). 0x0024CBFC (`80 3D 3D 5A E4 01 00`). 0x002599C5 (`80 3D 1D F4 E3 01 00`) -> cmp eax,eax + NOPs. 0x0037422E (`0F B6 44 24 3B` -> xor eax,eax). 0x00374665 (`C7 05 D1 4F 77 02 01 00 00 00` -> store 0 to 0x02AE9640). 0x003756F1 (`48 85 C9` -> cmp eax,eax). 0x0037D7C4 (`E8 A7 53 00 00` -> NOP x5). 0x001E0D90 (`E9 9B 2C 3E 00`, keyboard input gate to 0x005C3A30). 0x0079D63B / 0x0079D65E (`0F B6 84 0A 31 02 00 00` / `...F4 01 00 00`, key-state reads at +0x231 / +0x1F4) | Patches.lua L93-L240 | byte-check-in-code |
| Disable path | Disabling writes the original bytes back, unregisters the symbols and frees the code caves | FreeCamera.lua L537-L565 | used-in-code |
| Loader version | Lua Loader **1.10.2** or newer is required. The patch is applied on `onInitDone`. The event flag `fc_state` shows whether free camera is on | FreeCamera.lua L669-L679, L562, L602 | used-in-code |

## 3. limit.lua (TheArchadianAlchemist/attribute)

**Purpose.** These are the per-equipment-class refinement **caps** for TAA's attribute upgrades. The table is keyed by
an equipment class name. Each class gives a cap for every attribute that may be refined on that class. An attribute
missing from a class cannot be refined on it (for example, weapons have no `defense` and armour has no
`attackPower`).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Shape | The chunk returns a table `{ <className> = { <attrName> = cap, ... }, ... }` with **36 classes** | L2-L452 | used-in-code (controller.lua L169-L170, xref) |
| Class key -> id | Class names are turned into numeric ids through `mappings.subcategory`: sword 1, greatSword 2, katana 3, ninjaSword 4, spear 5, pole 6, bow 7, crossBow 8, gun 9, axe 10, hammer 11, dagger 12, rod 13, staff 14, mace 15, measure 16, handBomb 17, shield 18, lightHelm 19, mysticHelm 20, heavyHelm 21, lightArmor 22, mysticArmor 23, heavyArmor 24, ring 25, bracelet 26, glove 27, collar 28, pendant 29, belt 30, boot 31, crown 32, arrow 33, bolt 34, shot 35, bomb 36 | n/a | used-in-code (mappings.lua L70-L107, xref) |
| Relation to game category | Ids 1-18 match the game's equipment category byte (BpEquipmentCategoryList: 1 Sword .. 17 Hand-Bomb, 18 Shield). Ids **19-36 are TAA's own split**: the game has only 19 Helm, 20 Armor, 21 Accessory, 22 Crown, 23 Arrow, 24 Bolt, 25 Shot, 26 Bomb. The class id is not read from the record. The mod's NPC event script writes it to byte **0x02099DF0 + 0x205** | n/a | used-in-code (controller.lua L84, L179, xref); the game-enum comparison is from editor/data/lists.json |
| Attribute names | range, chargeTime, attackPower, onHitRate, knockbackChance, comboOrCriticalChance, evadeWeapon, evadeShield, magickEvadeShield, defense, magickResist, maxHp, maxMp, strength, magickPower, vitality, speed. TAA attribute ids are **10..26** in that order | L3-L451 | used-in-code (mappings.lua L109-L127; attribute.lua L4-L22, xref) |
| Weapon classes (1-17) | Each one caps range, chargeTime, attackPower, evadeWeapon, knockbackChance, comboOrCriticalChance, onHitRate, maxHp, maxMp, strength, magickPower, vitality and speed. Examples: sword AP 129 / range 16 / CT 20 / combo 100 / HP 480. greatSword AP 146 / HP 1550. spear AP 153 (the highest). bow, crossBow and gun range 120. handBomb range 110. staff AP 68 / MAG 12 | L3-L257 | used-in-code |
| Shield (18) | evadeShield 92, magickEvadeShield 92, HP 660, MP 45, STR 6, MAG 6, VIT 5, SPD 3 | L258-L267 | used-in-code |
| Helms / armour (19-24) | defense, magickResist, HP, MP, STR, MAG, VIT, SPD. Examples: mysticHelm MR 65 / MP 160, heavyArmor DEF 67 / MR 1, mysticArmor MAG 15 / MP 120 | L268-L327 | used-in-code |
| Accessories (25-32) | defense, magickResist, HP, MP, STR, MAG, VIT, SPD. Examples: boot SPD 52 / VIT 22, belt SPD 22 / HP 500, ring VIT 22 / SPD 13, crown MR 22 | L328-L407 | used-in-code |
| Ammo (33-36) | attackPower, evadeWeapon, onHitRate, HP, MP, STR, MAG, VIT, SPD. arrow/bolt/shot AP 6, bomb AP 8. onHitRate 35. HP 200 | L408-L451 | used-in-code |
| Inverse attribute | **chargeTime** is the only "inverse" attribute: refining lowers it toward the cap (a lower CT is better). Every other attribute is raised toward the cap | L5 etc. | used-in-code (controller.lua L173-L175, xref) |
| Effective cap | Normal: if initial >= cap the attribute cannot be refined. Otherwise effCap = cap - floor((cap - initial) * 0.15). Inverse: effCap = cap + floor((initial - cap) * 0.15). So the configured cap is never reached exactly unless the start value is close to it | n/a | used-in-code (refinement.lua L14-L21, xref) |
| Slot count | distance = abs(effCap - initial). maxSlots = clamp(ceil(cap/2), 1, #curve = 12). slots = min(distance, clamp(ceil(distance * maxSlots / cap), 1, maxSlots)). If distance < 1, slots = 0 | n/a | used-in-code (refinement.lua L23-L31, xref) |
| Value at level L | exponent a = 1.1 + 0.4 * min(1, cap/150). value = initial + floor((effCap - initial) * (L/slots)^a). The result is at least initial + L (or at most initial - L when inverse) | n/a | used-in-code (refinement.lua L12, L33-L44, xref) |
| Worked examples | Sword AP 100 -> cap 129: effCap 125, 3 slots, values 105 / 113 / 125, cost rows 10, 11, 12. CT 30 -> cap 20 (inverse): effCap 21, 5 slots, values 28 / 26 / 25 / 23 / 21. HP 0 -> cap 480: effCap 408, 12 slots | n/a | computed from the code (unclear only in rounding of Lua doubles) |
| Where values are written | "Direct" attributes (ids 10-20) are written to fields of the Lua Loader object `bpack.section13[equipId - 0x1000]`. Stat attributes are written through the record's `attributePointer`: +0x00 maxHp **u16**, +0x02 maxMp **u16**, +0x04 STR u8, +0x05 MAG u8, +0x06 VIT u8, +0x07 SPD u8 | n/a | used-in-code (attribute.lua L4-L44, xref) |
| Shared attribute block caveat | The stat write goes through the pointer, so every piece of equipment that shares that attribute record changes with it. The code does not guard against this | n/a | unclear (inference) |

## 4. attributes.lua (TheArchadianAlchemist/costs)

**Purpose.** These are the base material and gil costs to refine one attribute, plus the cost to revert one.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Cost tuple | Each entry is `{ {lootId1, qty1}, {lootId2, qty2}, {lootId3, qty3}, gil }`. The loot ids are FFXII content ids in the loot block **0x2000-0x21FF** | L3-L20 | used-in-code (refinement.lua L67-L81, xref) |
| Keys | 17 attribute names (same as limit.lua) plus `remove` (revert-attribute cost). A missing key would raise a Lua error in getCost, so an editor must keep all 18 | L3-L20 | used-in-code (controller.lua L206, L227, xref) |
| Scaling | Refinement cost = base scaled by the curve.lua row `costLevel = (12 - totalSlots) + upgradeNumber`. Loot qty i = ceil(qty_i * row[i]). Gil = floor(gil * row[4]). `remove` always uses row 1 (x1.0) | n/a | used-in-code (refinement.lua L63-L81; controller.lua L204-L206, L227, xref) |
| Materials used | The tiers mostly use Green / Yellow / Silver Liquid (0x2089 / 0x208A / 0x208B), hides Tyrant / Quality / Beastlord / Tanned (0x2062-0x2065), pelts Rat / Wolf / Coeurl / Quality (0x2060, 0x2069-0x206B), feathers Small / Large / Chocobo / Giant (0x206D-0x2070), Aged / Ancient Turtle Shell (0x204F / 0x2050), flesh Foul / Festering / Maggoty (0x2098-0x209A) and bones Bone Fragment / Sturdy Bone / Wyrm Bone (0x2080, 0x2081, 0x20B4). For example, attackPower = Green Liquid x1, Yellow x2, Silver x3, 2140 gil. At row 12 that becomes 12 / 14 / 16 and 16264 gil | L3-L19 | used-in-code (names resolved via editor/data/lists.json ContLootList) |
| Overlap | `defense` and `attackPower` share the Green/Yellow Liquid pair. `evadeWeapon`/`magickResist` overlap (0x2053, 0x206D) | L3, L6, L7, L11 | used-in-code |
| Gil range | 1720 (maxHp) to 2800 (chargeTime). remove = Lumber 0x2083 x1, Solid Stone 0x2085 x2, Bomb Ashes 0x2093 x3, 1260 gil | L4, L13, L20 | used-in-code |
| Output to event script | The preview writes the cost into the shared block: gil u32 at +0x20C, three {u16 loot id, u16 qty} pairs at +0x210/+0x212, +0x214/+0x216, +0x218/+0x21A, current value u16 +0x21C, next value u16 +0x21E, blocked u8 +0x20A (base 0x02099DF0) | n/a | used-in-code (writer.lua L6-L27; mappings.lua L24-L30, xref) |

## 5. curve.lua (TheArchadianAlchemist/costs)

**Purpose.** These are the cost multipliers per refinement level. The number of rows also sets the maximum number of
refinement slots.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Shape | An array of **12 rows** (level 1..12). Each row has 4 floats `{lootQty1Mult, lootQty2Mult, lootQty3Mult, gilMult}` | L3-L14 | used-in-code (refinement.lua L7-L10, L67-L78, xref) |
| MAX_TIER | MAX_TIER = #rows = 12. It caps slots per attribute (`maxSlots`) and anchors costLevel = (MAX_TIER - slots) + n. Fewer slots therefore start at a higher, more expensive row | n/a | used-in-code (refinement.lua L9, L27, L63-L65, xref) |
| Values | Row 1 = 1/1/1/1. Row 12 = 11.4 / 7.0 / 5.2 / 7.6. The first column rises fastest. A missing row index falls back to {1,1,1,1} | L3, L14 | used-in-code (refinement.lua L68) |
| Rounding | Loot quantities use ceil and gil uses floor | n/a | used-in-code (refinement.lua L71, L77) |
| Scope | Only attribute refinement uses rows above 1. Element, affinity and status costs and all removals are always evaluated at row 1 | n/a | used-in-code (controller.lua L191-L194, xref) |

## 6. effects.lua (TheArchadianAlchemist/costs)

**Purpose.** These are the costs to add a status effect to equipment: on-hit, on-equip or immunity. They also give
the cost of removing one.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Keys | 30 status names (ko .. libra) plus `remove`. They must match `mappings.effect` names | L3-L33 | used-in-code (controller.lua L192, L194, xref) |
| Same cost for 3 uses | One entry prices on-hit (intention 3), on-equip (4) and immunity (5) alike | n/a | used-in-code (controller.lua L210-L212) |
| Gil | Every status costs **7850** gil. remove = Green/Yellow/Silver Liquid x3 each + 5000 gil | L3-L33 | used-in-code |
| Quantities | Each entry has 3 loots with quantities 4, 3 and 2. remove has 3/3/3 | L3-L33 | used-in-code |
| Notable ids | ko: Death's-Head 0x20B2, Soul Powder 0x20CD, Zombie Powder 0x20CE. protect: turtle shells 0x2050/0x204F + Iron Carapace 0x2052. faith: Holy Crystal 0x2036. reverse and reflect have **identical** costs (Mirror Scale 0x20B6, Emperor Scale 0x20B7, Glass Jewel 0x208C) | L3, L15, L21, L25, L26 | used-in-code |
| Status id / bit mapping | TAA effect id N maps to status bit N-1: ko 1 (bit 0), stone 2, petrify 3, stop 4, sleep 5, confuse 6, doom 7, blind 8, poison 9, silence 10, sap 11, oil 12, reverse 13, disable 14, immobilize 15, slow 16, disease 17, lure 18, protect 19, shell 20, haste 21, bravery 22, faith 23, reflect 24, invisible 25, regen 26, float 27, berserk 28, bubble 29, **libra 31 (bit 30)**. Bit 29 (HP Critical) and bit 31 (X-Zone) are skipped. This matches the game's 32-bit status mask | n/a | used-in-code (mappings.lua L140-L171; status.lua L5-L36, xref) |
| Where written | On-hit: the named fields `bpack.section13[..].statusEffects.<name>` (0/1). On-equip: a u32 bitmask at **attributePointer + 0x08**. Immunity: a u32 bitmask at **attributePointer + 0x0C** (written byte by byte, bit = id-1) | n/a | used-in-code (statusOnHit.lua L14-L43; status.lua; TheArchadianAlchemist.lua L74-L75, xref) |
| Party refresh | After an on-equip change, TAA calls game function **0x00320A40**(s32 party id 0..39) to get each unit's keep pointer. It then calls **0x0030FED0**(keep, 0x97) to recompute stats | n/a | used-in-code (controller.lua L20-L29, xref) |

## 7. elements.lua (TheArchadianAlchemist/costs)

**Purpose.** These are the costs to set a weapon's on-hit element and to add elemental affinities (absorb, immune,
half, weak, potency). They also give the cost of removing one.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Keys | fire, lightning, ice, earth, water, wind, holy, dark, remove | L3-L11 | used-in-code (controller.lua L191, L193, xref) |
| Tier pattern | For element e, loot 1 = **e Crystal** (0x2030-0x2037), loot 2 = **e Magicite** (0x2028-0x202F) and loot 3 = **e Stone** (0x2020-0x2027). Within each block the order is Earth, Wind, Water, Fire, Ice, Storm (lightning), Holy, Dark | L3-L10 | used-in-code (names resolved via lists.json) |
| Quantities / gil | The six basic elements take 4/3/2 with gil rising 7850 -> 9750 (fire < lightning < ice < earth < water < wind). Holy and dark take 6/5/3 at 12500 and 12800 gil. remove = Green/Yellow/Silver Liquid x3 + 5000 gil | L3-L11 | used-in-code |
| Element id / bit | TAA element ids are fire 1, lightning 2, ice 3, earth 4, water 5, wind 6, holy 7, dark 8, and bit = id - 1. This is the same order as the game's element byte (BpElementList 0 Fire .. 7 Dark) | n/a | used-in-code (mappings.lua L129-L138; affinity.lua, xref) |
| On-hit element | Only **one** element is allowed: setting one clears all 8 `bpack.section13[..].elements.<name>` flags first. The filter byte at +0x22C stores the element **id** (1-8), not a mask | n/a | used-in-code (element.lua L14-L23; controller.lua L331-L332, xref) |
| Affinity storage | u8 masks at attributePointer **+0x10 absorb, +0x11 immune, +0x12 half, +0x13 weak, +0x14 potency** | n/a | used-in-code (TheArchadianAlchemist.lua L76-L80; affinity.lua, xref) |
| Shared pricing | Affinity intentions 6-10 use the same element entry as the on-hit element (intention 2) | n/a | used-in-code (controller.lua L209-L217) |

## 8. quest.lua (TheArchadianAlchemist/progression)

**Purpose.** These are the gating settings for TAA's unlock quest: when the quest becomes available, when it can be
finished, and the gil amount that is handed to the event script.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Keys | `customProgress` (bool), `customUnlock` (bool), `progress.start`, `progress.finish` (story-progress values), `gil` (integer) | L3-L9 | used-in-code (progression.lua L146-L218, xref) |
| Story progress | Compared with the **u16 at 0x02164480** (save image +0x200, the main scenario counter). start = 546, finish = 1240 | L5-L8 | used-in-code (mappings.lua L7; progression.lua L68, xref) |
| State machine (customProgress = false) | The quest status byte is at **base + 0x238** (base 0x02099DF0). The states run: 0 -> 1 when progress >= start. 1 -> 2 when the event script writes 2. 2 -> 3 when progress >= finish. 3 -> 4 when the script writes 4. Unlocks are applied only at status 4 | L3 | used-in-code (progression.lua L184-L217) |
| Gil | While status == 1, `gil` (70000) is written as a **u32 at base + 0x23C** for the event script to use (fee or reward; which one is not stated) | L9 | used-in-code (progression.lua L153, L202) |
| Notification | u8 at base + 0x239 is set to 1 when a higher unlock tier is reached than the last one notified. base + 0x23A ("event") is mapped but never used | n/a | used-in-code (mappings.lua L49-L54; progression.lua L163-L174, L209-L217) |
| customProgress = true path | Status comes from symbol `TAA_SetProgress` (clamped to 4) and the tier from `TAA_SetUnlock`. **Bug:** initSymbol registers a *different* 1-byte allocation under each symbol name than the one the getter reads. Writes through the symbols are therefore never seen, and status/tier read as 0. Harmless here because both flags are false | L3-L4 | used-in-code (TheArchadianAlchemist.lua L10-L19, xref) |
| Location gate | TAA polls the shared block only while the location id **u32 [0x021654C4] == 632**. Polling speed comes from the pollMode byte at +0x200: 0 = 1000 ms, 1 = 100 ms, 2 = 33 ms | n/a | used-in-code (TheArchadianAlchemist.lua L117, L174-L189; flow.lua L4-L8, xref) |

## 9. unlocks.lua (TheArchadianAlchemist/progression)

**Purpose.** This is a cumulative list of unlock tiers keyed by story progress. Each tier adds names to the sets of
attributes, elements, statuses and affinities that the NPC menu may offer.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Shape | An array of `{ progress = N, contents = { <unlockKey> = {names...} } }`, sorted by ascending progress. Tiers are cumulative: every tier with progress <= current is ORed in | L2-L75 | used-in-code (progression.lua L70-L131, xref) |
| Tier thresholds | 546, 1240, 1580, 2057, 4150, 5160 (six tiers) | L4, L11, L19, L28, L41, L53 | used-in-code |
| Unlock keys -> bitfields (base 0x02099DF0) | attributes -> u32 +0x240 (bit = attribute id **10..26**, not id-1). onHitElement -> u8 +0x244. onHitStatus -> u32 +0x248. onEquipStatus -> u32 +0x24C. statusImmunity -> u32 +0x250. affinityWeak u8 +0x254, affinityHalf u8 +0x255, affinityImmune u8 +0x256, affinityPotency u8 +0x257, affinityAbsorb u8 +0x258. Element and status bits are id-1 | L6-L72 | used-in-code (progression.lua L15-L66, L95, L124, L134-L144; mappings.lua L56-L67) |
| Order differences | The unlock block orders affinities weak/half/immune/potency/absorb. The filter block (+0x22D..+0x231) and the attribute record (+0x10..+0x14) both order them absorb/immune/half/weak/potency | n/a | used-in-code |
| Tier 1 (546) | AP, DEF, HP. fire and ice on hit. poison, blind, sap, slow, silence on hit | L3-L9 | used-in-code |
| Tier 6 (5160) | Charge time. holy on hit. All buffs on hit. All 18 debuffs on equip. Broad immunities. half/immune for earth-dark. Absorb for all but ice (ice was already given at 2057) | L52-L73 | used-in-code |
| Unknown names | A name missing from the mappings is silently skipped (no error) | n/a | used-in-code (progression.lua L93-L96) |

### TAA shared block and save data (xref)

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Shared block | Base **0x02099DF0** (RVA 0x01F79DF0). The same scratch area is used by FehDead's CCEP (+0x99, +0x100..) per batch_05. TAA uses only +0x200..+0x258 | mappings.lua L4-L68 | used-in-code |
| Flow bytes | +0x200 pollMode, +0x201 reset request (1 = reset), +0x202 confirmed (1 = preview, 2 = apply, 3 = filter refresh). After handling, the mod sets confirmed = 0 and pollMode = 1 | flow.lua L11-L41 | used-in-code |
| Selection bytes | +0x204 intention u8 (1-20). +0x205 equipment class u8 (1-36, the limit.lua key; named "category" in code). +0x206 parameter id u8 (attribute 10-26 / element 1-8 / status 1-31; named "subcategory" in code). +0x208 equipment content id u16 (0x1000 + section-13 index) | mappings.lua L17-L22; controller.lua L78-L86 | used-in-code |
| Intentions | 1 refine attribute. 2 set on-hit element. 3 add on-hit status. 4 add on-equip status. 5 add immunity. 6-10 add affinity immune / absorb / weak / half / potency. 11 revert attribute. 12 remove element. 13-15 remove on-hit / on-equip / immunity. 16-20 remove affinity immune / absorb / weak / half / potency | controller.lua L196-L299 | used-in-code |
| Filter block | +0x220 / +0x224 / +0x228 u32 status masks (on-hit / on-equip / immune). +0x22C element id. +0x22D-+0x231 affinity masks. +0x234 u32 mask of refined attributes (bit = attribute id) | controller.lua L303-L400 | used-in-code |
| Save sidecar | Lua Loader save handler key **"TheArchadianAlchemistV2"**. It holds `{contents = {[tostring(equipId)] = {attributes = {name = {initial, actual, level}}, element = name or false, effects = {onHit, onEquip, immune = {names}}, affinity = {absorb, immune, half, weak, potency = {names}}}}, progression = {questStatus, lastNotifiedTier}}`. On load the mod re-applies everything to section 13 and refreshes the party and DynamicDescription (`scripts/DynamicDescription/dd_api.lua` refresh) | TheArchadianAlchemist.lua L152-L172; controller.lua L402-L473 | used-in-code |
| Config paths | Paths are hard-coded as `scripts/config/TheArchadianAlchemist/{attribute/limit, costs/curve, costs/attributes, costs/elements, costs/effects, progression/quest, progression/unlocks}.lua`. A missing file becomes `{}`. They are hot-reloaded through `event.registerFileChangeHandler(".../*.lua", .., true)` | TheArchadianAlchemist.lua L47-L61, L149 | used-in-code |
| Loader version | Lua Loader **1.9.7** or newer | TheArchadianAlchemist.lua L140-L145 | used-in-code |

## 10-14. ch.lua / cn.lua / de.lua / es.lua / fr.lua (TheInsurgentsDescriptiveInventoryConfig)

**Purpose.** These are the per-language description-override tables for Xeavin's TheInsurgentsDescriptiveInventory
(TIDI). All five ship **empty**. They are byte-identical to each other and to in/it/kr from batch_13 (md5 c7f9a511,
147 bytes, CRLF, no BOM). So TIDI changes nothing in these languages. The consumer, its hook at 0x00292667 (byte check
`E8 C4 28 FC FF`) and its 12-byte override records are documented in batch_13.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Chunk shape | Each file returns a function of one argument (`contents`, the TIDI name enum). The function returns an array of rows. Here the array is empty | L1-L9 | used-in-code (consumer calls it, xref batch_13) |
| Row format | The commented sample is `{contents.equipment.bangle, "..."}`: [1] content id (u32 in the table, compared as u16), [2] description in Lua Loader tag markup (converted with `message.convert`) | L3 | comment-only here; used-in-code in the consumer (xref) |
| Language ids | The u32 at **[u64 0x01F82D20] + 0** selects the file: fr = **2**, de = **3**, es = **5**, ch = **7**, cn = **8** (also in 0, us 1, it 4, kr 6) | n/a | used-in-code (TIDI L54-L70, xref) |
| Editor note | One template can generate all eight non-English files. Only us.lua carries content | n/a | byte inspection |

---

## Editor relevance

* **TAA config editor (offline).** It can edit limit.lua (36 classes x up to 13 attributes), the four cost tables
  ({loot,qty} x3 + gil, with loot ids in 0x2000-0x21FF) and the 12x4 curve. It should keep every key that the
  controller looks up, because a missing cost key throws an error. It can preview the outcome with the exact
  refinement formulas above (effective cap, slots, exponent, cost row).
* **TAA memory editor.** It can read or write the shared block at 0x02099DF0 + 0x200..0x258 to drive or inspect the
  NPC menu state. It can patch section-13 equipment live: direct fields, plus attributePointer +0x00..+0x14 for
  stats, status masks and affinity masks. Afterwards it should call 0x00320A40 / 0x0030FED0(keep, 0x97) to refresh
  the party.
* **Status/element enums.** These confirm the 32-bit status bit order (bit 0 KO ... bit 28 Bubble, bit 29 HP Critical,
  bit 30 Libra, bit 31 X-Zone) and the element bit order (Fire, Lightning, Ice, Earth, Water, Wind, Holy, Dark). They
  also confirm the per-element loot blocks Stone 0x2020-0x2027, Magicite 0x2028-0x202F and Crystal 0x2030-0x2037
  (order Earth, Wind, Water, Fire, Ice, Storm, Holy, Dark).
* **Camera tools.** The Camera.json fields map one-to-one onto the camera object: +0x28 FOV (rad), +0xB0..+0xB8 eye,
  +0xC0..+0xC8 target, +0xE4 roll (rad). Camera slots are at 0x02097300 with stride 0x110. Location comes from
  0x021654C4. A Cheat Engine table can expose these directly once the camera pointer is known.
* **Hotkey files.** The Lua Loader `modmenu.key` codes (A..Z = 28..53, 1..4 = 54..57, F4..F11 = 68..75, arrows
  91..94, LShift 118, LAlt 119, grave 123) let an editor show and write any mod's keybind JSON.
* **No VBF, battlepack-binary or text-encoding format facts** are in these 14 files.
