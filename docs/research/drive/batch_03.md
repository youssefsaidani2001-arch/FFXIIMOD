# Drive batch 03: overlay DLL, build files and VBF/TIM2 extraction tools (`ffxii-overlay/*`)

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR.
All facts are paraphrased. No code has been copied. Line numbers refer to the decoded files.

| Drive id | Title | Drive folder | Lines | Status |
|---|---|---|---|---|
| 1C3DzWeW6gRKmJB60DHiBATQbKq298dhR | `_winclut.py` | `ffxii-overlay/tex` | 69 | read in full |
| 12qQBQ7OyfotjkHQ8k1iejp-RgghBhYm0 | `_winclut2.py` | `ffxii-overlay/tex` | 60 | read in full |
| 1FTEvIWB_2RyjK-vdgaRm1MYcKAmGHV-T | `analyze_structure.py` | `ffxii-overlay` | 41 | read in full |
| 1vuJEep1wQLz4Zv4L8Xp5f8_urvQzXUNo | `build.log` | `ffxii-overlay` | 10 | read in full (UTF-16LE with BOM) |
| 1Pv5P_HVqz-elqcr4XFosbCu15yDmlQG8 | `build.ps1` | `ffxii-overlay` | 17 | read in full |
| 1Emf5tTotwpFxQXUnCr5iAYi5IkrCmTSR | `CMakeLists.txt` | `ffxii-overlay` | 20 | read in full |
| 1-QU-wjgU0ywDTrVlFrZyq-X7BfFWT1O- | `decode_main.py` | `ffxii-overlay` | 35 | read in full |
| 1f3KFz4RFcGPf2rhIuJvCRQRw5K3XHuCR | `decode_msg.py` | `ffxii-overlay` | 39 | read in full |
| 1ocnrUQKXJrzjYNelLOQwx9bp4IzjpwXq | `decode_tim2.py` | `ffxii-overlay` | 56 | read in full |
| 1bWY162IEfUnro1jjSS8x5gZKcYV-YYwx | `dllmain.cpp` | `ffxii-overlay` | 213 | read in full |
| 1tvfDnz6PYo83dmXfmqHtW51i8RHDznk9 | `dump_sections.py` | `ffxii-overlay` | 26 | read in full |
| 12ceKm9ltJeEbWQYV6PB29WqlwRYY5kOq | `export_rgba.py` | `ffxii-overlay` | 33 | read in full |
| 1aeKjDZeoaCHOPNxBY3redtYhAZayEiFq | `extract_all.py` | `ffxii-overlay` | 73 | read in full |
| 1jyE3k3e-nxhwUSdql7xgTbHJddtfoGZn | `extract_data.py` | `ffxii-overlay` | 49 | read in full |

None are missing.

## Summary

The user wrote all 14 files. None of them are Xeavin Lua mods. They make up two pieces of work:

1. **`ffxii-overlay`**: a D3D11 `IDXGISwapChain::Present` hook DLL built with Dear ImGui 1.92.9b. It draws a
   custom job list over the in-game **job-selection wheel**. It reads the wheel's current selection from game
   memory through one static pointer, and it borrows a menu-bar sprite from the game's own `w_win_c.tm2` texture.
2. **Offline extraction tools**: a manifest-driven **VBF extractor** that uses a zlib block heuristic, a folder
   analyser for the VBF tree, **TIM2 decoders** (image types 3/4/5, PS2 alpha, CSM1 palette reorder), a
   **`clutpack_ys.bin` CLT2 palette** reader, and a Cheat Engine `.CT` table-tree dumper.

The batch has no byte-checked code patches, no `memory.execute` calls, no battlepack/ARD/EBP/MRP layouts and no
text-message encoding. The file `decode_msg.py` handles message-*window textures*, not text. The only memory
facts are the job-wheel pointer chain (strongest evidence: a vtable/identity check in code) and the swapchain
vtable slot.

### Quick reference: memory facts

| Item | Value | RVA (base 0x120000) | Evidence |
|---|---|---|---|
| Static pointer to the job-wheel menu object | `0x0209AF80` (8-byte pointer) | 0x1F7AF80 | used-in-code (dllmain L23, L48-49) |
| Identity value: first qword of the wheel object | `0x00557DB0` (probably the class vtable or a handler address inside the image; the code does not say which) | 0x437DB0 | used-in-code, compared before reading (dllmain L24, L52) |
| Current wheel selection | `u8` at wheel object + `0x358`. Index 0..12 into the job list below | n/a | used-in-code (dllmain L25, L53-55) |
| Swapchain Present | `IDXGISwapChain` vtable slot 8 | dxgi.dll | used-in-code (dllmain L198-201) |

### Quick reference: TIM2 picture header as the scripts read it (picture at file 0x10)

| Picture offset | Size | Field | Notes |
|---|---|---|---|
| +0x00 | u32 | totalSize | read, not used |
| +0x04 | u32 | clutSize (bytes) | |
| +0x08 | u32 | imageSize (bytes) | |
| +0x0C | u16 | headerSize | pixel data starts at 0x10 + headerSize |
| +0x0E | u16 | clutColors | `w_win_c.tm2` has 4096 = 16 x 256 |
| +0x10 | u8 | pictFormat | |
| +0x11 | u8 | mipMapCount | |
| +0x12 | u8 | clutType | bit 7 clear means the palette is stored CSM1-arranged and needs unswizzling |
| +0x13 | u8 | imageType | 3 = 32-bit RGBA, 4 = 4-bit indexed, 5 = 8-bit indexed |
| +0x14 | u16 | width | |
| +0x16 | u16 | height | |
| then | | pixels (imageSize bytes), then CLUT (clutSize bytes, RGBA32 entries) | CLUT directly follows the pixels |

---

## 1. `_winclut.py` (tex/)

**Purpose.** Pulls `w_win_c.tm2` straight out of the VBF. Decodes it once with each of its 16 palettes. Saves a
contact sheet. Picks the most blue palette automatically, takes that as the vanilla navy window colour, and writes
it as an overlay asset `ui/w_win_blue.rgba`.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| VBF path of the window texture | `ps2data/image/ff12/myoshiok/us/tm2_menu/w_win_c.tm2` | L12 | used-in-code |
| `vbflib` API (helper module, not in this batch, lives in `C:\Games\ffxii modding\extracted`) | `load_index()` returns an open file handle plus a list of `(name, size, offset)`. `unpack(handle, size, offset)` returns the decompressed bytes | L7-12 | used-in-code |
| TIM2 picture header offsets | Picture at 0x10. totalSize/clutSize/imageSize are three u32s at +0. headerSize u16 at +12, clutColors u16 at +14. pictFormat, mipMapCount, clutType and imageType are bytes at +16..+19. width/height are u16s at +20/+22 | L14-18 | used-in-code |
| Data placement | Pixels at picture + headerSize. CLUT right after the pixels (pixel offset + imageSize) | L19-20 | used-in-code |
| Multi-palette TIM2 | `w_win_c.tm2` carries 4096 CLUT colours, which is 16 palettes of 256. The docstring says these are the game's window-colour options. The palette count is computed as clutColors / 256 | L1-2, L31-35 | used-in-code (count); comment-only (meaning) |
| CSM1 palette reorder | In every 32-entry block, entries 8..15 and 16..23 swap places. This script applies it only when clutType bit 0x80 is **clear** | L24-29, L37-38 | used-in-code |
| PS2 alpha | Raw alpha is doubled and clamped to 255 (0x80 means opaque) | L36 | used-in-code |
| Navy palette auto-pick | Samples rows 20..39 and columns 40..89 (the top bar) and scores blue dominance. The chosen palette index is printed at run time and is not recorded in the file | L53-63 | used-in-code |
| Output | `C:\Games\ffxii modding\overlay\assets\ui\w_win_blue.rgba` in the `.rgba` sidecar format (u32 w, u32 h, RGBA8 pixels) | L65-67 | used-in-code |

## 2. `_winclut2.py` (tex/)

**Purpose.** A follow-up to `_winclut.py`. The docstring says the config-menu window colours are the **CLT2
palettes in `clutpack_ys.bin`**, not the palettes inside `w_win_c.tm2`. The script applies every 256-colour
palette in every clutpack slot to `w_win_c`'s 8-bit indices, both with and without the CSM1 reorder, and saves a
contact sheet.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| VBF path | `ps2data/image/ff12/myoshiok/us/packfiles/clutpack_ys.bin` | L17 | used-in-code |
| clutpack header | Read as an array of u32 offsets from file start. The entry count is taken as (first offset / 4). Entries equal to 0xFFFFFFFF are dropped, which covers the terminator and the 0xFF fill. This matches `docs/formats/container-otherpack.md`, which gives 4 sections with the first at 0x20 | L18-20 | used-in-code |
| Slot extent | A slot runs from its offset to the next larger offset, or to the end of the file | L30-34 | used-in-code |
| CLT2 slot layout (user's hypothesis) | 0x40-byte header. u16 at slot+14 is the colour count. RGBA32 colours from slot+0x40. The script prints the header count next to the computed (len-0x40)/4 so the two can be compared, so the layout is **not confirmed** | L35-38 | used-in-code (layout unconfirmed) |
| Palette ordering | Unknown, so each palette is rendered both reordered (`u`) and raw (`r`). Tags look like `s<slot>p<pal><u/r>` | L43-46 | used-in-code |
| Alpha | Same doubling as TIM2 | L42 | used-in-code |

## 3. `analyze_structure.py`

**Purpose.** Reads the VBF manifest (`extracted\manifest.tsv`). Prints a folder map down to depth 3 for folders
with at least 40 files, with file count, total size in MB and the five most common extensions. Then counts
manifest paths that contain keywords pointing to editable data.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Manifest format | TSV with header row `path<TAB>size<TAB>offset`. One row per VBF file: internal path, uncompressed size, VBF offset (decimal) | L3-8 | used-in-code |
| Data-hunting keywords | `binaryfile`, `message`, `/text`, `systemdata`, `gamedata/config`, `battle`, `chara`, `item`, `ability`, `license`, `gambit`, `job`, `shop`, `vfx/menu` | L34 | used-in-code (keywords only; results not recorded) |

## 4. `build.log`

**Purpose.** Output of `build.ps1`, written by PowerShell as UTF-16LE with a BOM.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Build result | CMake configure and build both exited 0 (17:19:33). The step compiled `dllmain.cpp.obj` and linked **`ffxii-overlay-f.dll`** | L1-9 | log |
| Artifact check mismatch | The log says `ARTIFACT_OK`, but `build.ps1` tests for `build\ffxii-overlay.dll`, while CMake outputs `ffxii-overlay-f.dll`. The OK line therefore comes from an older DLL left in the folder and does not prove this build. My own observation | L10 (vs build.ps1 L17, CMakeLists L20) | inference |

## 5. `build.ps1`

**Purpose.** Configures and builds the overlay DLL with CMake + Ninja + clang (Release, `-j 6`) and logs to `build.log`.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Toolchain | `cmake.exe` from the user's Python 3.14 Scripts folder. Generator Ninja, `CMAKE_C_COMPILER=clang`, `CMAKE_CXX_COMPILER=clang++`, Release | L2-9 | used-in-code |
| Project root | `C:\Games\ffxii modding\ffxii-overlay`, build directory `build` | L5, L9 | used-in-code |
| Artifact check | Looks for `build\ffxii-overlay.dll`, which is the stale name (see §4) | L17 | used-in-code |

## 6. `CMakeLists.txt`

**Purpose.** Defines the overlay shared library.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Sources | `dllmain.cpp` plus the Dear ImGui core (`imgui`, `imgui_draw`, `imgui_tables`, `imgui_widgets`) and the `imgui_impl_dx11` and `imgui_impl_win32` backends | L8-16 | build config |
| ImGui version and location | `C:/Games/ffxii modding/imgui-1.92.9b` | L6 | build config |
| Link libraries | d3d11, dxgi, d3dcompiler, user32, gdi32, dwmapi, fully static runtime (`-static -static-libgcc -static-libstdc++`, a MinGW-style clang target) | L18-19 | build config |
| Output | `ffxii-overlay-f.dll`, C++17, no `lib` prefix | L3, L20 | build config |

## 7. `decode_main.py`

**Purpose.** Decodes three already-extracted 8-bit TIM2s from `ffxii-overlay\tex` to PNG: `w_main0`, `w_main1` and `lic_over`.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Header fields | clutSize at picture+4, imageSize +8, headerSize +12, width +20, height +22 (picture at 0x10) | L12-17 | used-in-code |
| Palette | Uses only palette 0 (the first 256 RGBA entries). Alpha doubled and clamped. The CSM1 reorder (swap 8..15 and 16..23 in each 32-entry block) is always applied, without testing clutType | L21-28 | used-in-code |
| Texture names | `w_main0`, `w_main1` (main-menu sheets), `lic_over` (licence-board overlay) | L33 | used-in-code |

## 8. `decode_msg.py`

**Purpose.** Hunts for **message/dialogue window textures**, not text data. Lists `.tm2` names in the VBF that
match window-like keywords, then decodes three window textures to PNG.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| `vbf` API (helper module in `ffxii-overlay`, not in this batch) | `all_names()` returns every internal VBF path. `extract(path)` returns bytes, or a false value when the path is missing | L2-3, L28, L36 | used-in-code |
| Window keywords | `tuto_win`, `serif` (Japanese for line/dialogue), `fukidashi` (speech balloon), `talk`, `dialog`, `message`, `wnd`, `msg`, `mess`, `_win`, `win_` | L29 | used-in-code (the result list is not recorded) |
| Window textures | `tm2_menu/tuto_win_c.tm2` (tutorial window), `cm2_win_c.tm2`, `w_win_c.tm2`, all under `ps2data/image/ff12/myoshiok/us/` | L34-36 | used-in-code |
| Alpha variant | Raw alpha of 128 or more becomes 255, otherwise alpha x2 | L19 | used-in-code |
| Image type | Decodes only imageType 5 (8-bit) and returns nothing for other types | L15 | used-in-code |

## 9. `decode_tim2.py`

**Purpose.** The first standalone TIM2 to PNG decoder for textures already in `tex\`.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Magic check | File must start with ASCII `TIM2` (asserted) | L23 | byte-check-in-code (file magic) |
| Header | The full field list as in the quick-reference table above (clutColors at +14, clutType at +18, imageType at +19) | L24-31 | used-in-code |
| Image types | Asserts imageType == 5 (8-bit indexed). The comment says the CLUT is 32-bit RGBA | L35-36 | used-in-code |
| Texture names decoded | `w_win_c`, `w_line01`, `w_line02`, `lic_bk`, `maru_c`, `cm2_win_c`, `w_shade_p` | L52 | used-in-code |

## 10. `dllmain.cpp` (the overlay DLL)

**Purpose.** A replacement **job-wheel menu**. While the game's job-selection wheel object exists, the DLL draws an
almost opaque panel over the wheel area every frame and lists 13 job names as a column on the left. The game's
current selection is highlighted with a bar sprite cut from `w_win_c`. The portrait (top left) and the native
description box (bottom) stay visible.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Hook method | A worker thread starts from `DllMain` (process attach) and sleeps 2 s. It builds a throwaway 64x64 window plus a D3D11 device and swapchain, reads the swapchain vtable and saves slot **8** (`Present`). It then overwrites slot 8 in that shared dxgi vtable with its own function, using a VirtualProtect RWX/restore pair. This vtable-pointer hook (no inline patch) catches the game's swapchain because the vtable is shared | L163-205 | used-in-code |
| Present hook body | On the first call: get the device and immediate context, take the window from the swapchain description, create an RTV on back buffer 0, then initialise ImGui (Win32 + DX11). Every frame after that: new frame, read the wheel selection, draw if it is 0 or more, render, bind the RTV, draw, then call the original Present | L119-161 | used-in-code |
| Job-wheel pointer | 8-byte static pointer at **`0x0209AF80`** | L23, L48-49 | used-in-code |
| Pointer sanity | The pointer is rejected if its value is below 0x10000. Each read is guarded by VirtualQuery (MEM_COMMIT and not PAGE_NOACCESS or PAGE_GUARD) | L39-51 | used-in-code |
| Wheel identity check | The first 8 bytes of the pointed-to object must equal **`0x00557DB0`**. Otherwise the wheel is treated as closed. This works as an RTTI-free class check for "the job wheel is open". It is my reading that this is a vtable address (RVA 0x437DB0) | L24, L52 | used-in-code (value compare) |
| Selection field | **u8 at object + 0x358**, the highlighted wheel slot. Values of 13 or more are clamped to 0 | L25, L53-55 | used-in-code |
| Job order (wheel index → name) | 0 White Mage, 1 Uhlan, 2 Machinist, 3 Red Battlemage, 4 Knight, 5 Monk, 6 Time Battlemage, 7 Foebreaker, 8 Archer, 9 Black Mage, 10 Bushi, 11 Shikari, **12 Beastmaster**. Indices 0..11 follow vanilla TZA licence-board order. "Beastmaster" is a 13th entry the user added. Nothing in the batch shows that the game's wheel can reach index 12 | L27-31 | used-in-code (names); 12th job unverified |
| Screen layout at the 1920x1080 reference | Portrait area right edge x=412, bottom y=226. Native description panel starts at y=862. Scaled per axis by the actual display size | L84, L92 | used-in-code (measured by the user) |
| Overlay drawing | Panel colour RGBA(12,16,30,250). Gold divider (150,130,80,200). Header "JOBS" at (120,250), 28 px. List starts x=152, y=308, row step 44 px. Selected item at 34 px, others at 28 px. Selected colour (255,234,175), normal (205,207,214) | L88-116 | used-in-code |
| Bar sprite from `w_win_c` | `tex\w_win_c.rgba` is a 128x128 texture. The highlight uses UV pixels x 5..112, y 4..55 (divided by 128), stretched across x 108..556 | L109-111, L141 | used-in-code |
| `.rgba` loader | u32 LE width, u32 LE height, then w*h*4 bytes RGBA8 (top-down). Rejects 0 or anything over 8192. Becomes an immutable `R8G8B8A8_UNORM` texture | L59-79 | used-in-code |
| Font | Georgia TTF at 44 px, falling back to Times, then Segoe UI | L134-137 | used-in-code |
| Log | Appends to `C:\Games\ffxii modding\ffxii-overlay\overlay.log` | L34-37 | used-in-code |
| Input handling | None. The overlay is display-only: navigation stays with the game's own wheel, and the DLL only mirrors the selection | L148-161 | used-in-code |
| Loader | This batch does not say how the DLL is injected | n/a | unclear |

## 11. `dump_sections.py`

**Purpose.** Summarises the user's Cheat Engine table. It parses the first non-backup `C:\Games\ffxii modding\*.CT`
and writes the group tree (3 levels) with leaf counts to `extracted\toolkit_sections.txt`.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| CT XML layout | Root contains `CheatEntries`, which holds `CheatEntry` nodes. A group is a `CheatEntry` with a nested `CheatEntries`. A leaf has none. The label is the `Description` text, quoted | L3-21 | used-in-code |
| Output | One line per group: indent, description (up to 70 chars), leaf count. Depth 0..2 | L14-25 | used-in-code |

## 12. `export_rgba.py`

**Purpose.** Converts decoded PNGs to the overlay's `.rgba` sidecar and finds the opaque horizontal bands in `w_win_c`.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| `.rgba` sidecar | 8-byte header of u32 LE width and u32 LE height, then raw RGBA8 rows | L7-13 | used-in-code |
| Band finder | A row belongs to a band when its maximum alpha is above 30. For each band it prints the x extent where column alpha is above 30. The results are not recorded, but the DLL's UV rectangle (x 5..112, y 4..55) is consistent with the first band | L16-31 | used-in-code |
| Exports | `w_win_c.rgba`, `w_line01.rgba` | L15, L32 | used-in-code |

## 13. `extract_all.py`

**Purpose.** Bulk-decodes every `.tm2` under `ps2data/image/ff12/myoshiok/us/tm2_menu/` to PNG and builds a labelled
contact sheet `_all_assets.png` on a checkerboard background.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Magic check | Returns nothing unless the first 4 bytes are `TIM2` | L19 | byte-check-in-code (file magic) |
| imageType 5 (8-bit) | Palette 0, alpha doubled, CSM1 reorder applied every time | L10-16, L27-30 | used-in-code |
| imageType 4 (4-bit) | Two pixels per byte, **low nibble first** (even pixel = low nibble, odd pixel = high nibble). The CLUT is padded to 1024 bytes and run through the 256-entry reorder, then the first 16 entries are taken | L31-37 | used-in-code |
| Caveat (my analysis) | On a true 16-entry CLUT the 256-entry reorder moves entries 16..23 (zero padding) into slots 8..15. Indices 8..15 then come out as transparent black. `tim2.md` §5.3 says 16-entry palettes need no reordering, so an editor must **not** copy this path | L32 | inference |
| imageType 3 (32-bit) | Direct RGBA with alpha doubled | L38-41 | used-in-code |
| Menu texture folder | `ps2data/image/ff12/myoshiok/us/tm2_menu/` (US). Every file in it is TIM2 | L45 | used-in-code |

## 14. `extract_data.py`

**Purpose.** Uses `manifest.tsv` to pull the "editable" data files out of `FFXII_TZA.vbf` without a real VBF
block-table parser. It relies on a zlib-or-raw block heuristic.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| VBF location | `C:\Games\Final Fantasy XII - The Zodiac Age\FFXII_TZA.vbf` | L2 | used-in-code |
| Manifest | `path`, `size` (uncompressed bytes), `offset` (absolute byte offset of the file's first block in the VBF) | L7-11 | used-in-code |
| Block decompression heuristic | Reads (size + size/2 + 0x40000) bytes from the offset. Repeats until `size` bytes are produced: try a zlib stream at the cursor. On success, append its output and move the cursor past the consumed compressed bytes. On a zlib error, copy **min(0x10000, remaining)** raw bytes. This implies a VBF file body is a run of blocks of at most **64 KiB** uncompressed, each either zlib-compressed or stored raw. The real VBF keeps a per-block size table, which this script ignores | L14-24 | used-in-code (heuristic) |
| Heuristic risk (my analysis) | A raw block whose first bytes happen to parse as zlib would be decoded wrongly. A proper editor should read the VBF block-size list instead | L17-23 | inference |
| "Editable" selection | `.json`, `.csv`, `.lst`, `.msb`, and `.bin` under `/us/binaryfile/`. Files over 20,000,000 bytes are skipped. The comment mentions ARD/NMB area data, but the filter does not include them | L35-44 | used-in-code |
| Output naming | `extracted\data\<path with "/" replaced by "__">` | L46 | used-in-code |
| Text-location keywords | `message`, `/mes`, `sysdata`, `systemdata`, `binaryfile`, `font`, `/text` (hit counts are not recorded) | L27-33 | used-in-code |

---

## What this batch gives an editor

* **Memory editors (Lua/CE):** job-wheel detection: pointer at `0x0209AF80` → object, whose first qword is
  `0x00557DB0` when the wheel is open, with the selected job index as a u8 at `+0x358`. Both the selection and
  the "menu open" state can be shown or watched this way. Wheel index order 0..11 = White Mage, Uhlan,
  Machinist, Red Battlemage, Knight, Monk, Time Battlemage, Foebreaker, Archer, Black Mage, Bushi, Shikari.
* **Overlay/UI work:** the Present vtable-slot-8 hook pattern, the 1920x1080 layout of the job-wheel screen, and
  the `.rgba` sidecar format (shared with batch 02's cutting tools).
* **Offline file editors:** TIM2 picture header offsets, image types 3/4/5, PS2 alpha (0x80 = opaque), the CSM1
  256-palette reorder gated by clutType bit 7, the 4-bit nibble order, multi-palette TIM2s (`w_win_c` has
  16 x 256), the `clutpack_ys.bin` offset table and the hypothesised CLT2 slot layout, the US menu-texture folder,
  the VBF manifest shape and the ≤64 KiB zlib/raw block model.
* **Not present:** battlepack/ARD/EBP/MRP layouts, text encoding, action/item enums, `memory.execute` calls, and
  any of the Xeavin Lua mods named in the task (BlueMagick, DescriptiveInventory, HudColors and so on). These are
  in other batches.
