# Drive batch 02 — overlay texture-cutting tools (`ffxii-overlay/tex/*.py`)

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Drive path of all 14 files: `My Laptop/ffxii modding/ffxii-overlay/tex`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR.

| Drive id | Title | Lines | Status |
|---|---|---|---|
| 1HYbortcyAI2NDNTcuo5HIZwRVBRT2SIB | `_ac.py` | 4 | read in full |
| 16jyzD1nC4geV4w5PyKyJA2Ps8xg1nSx6 | `_bustgrid.py` | 31 | read in full |
| 1o5SHdVBkTJYufnTUm_8j0quN29vn5t6e | `_cuthud.py` | 39 | read in full |
| 1d6XUbZJPDEF7ujLKGbYyX6_j8vYbpx-z | `_cuthud2.py` | 31 | read in full |
| 1kbqmm5SBpBSwaNAM4MEqusm3eq5VzFjP | `_cutwin.py` | 40 | read in full |
| 1hEvVNWjsse3e1UhscAphLNEJ32h6Zumz | `_findon.py` | 7 | read in full |
| 1WD3RJ2XoUdlLqWPs21-jYzxbNsoUmjYC | `_gcheck2.py` | 9 | read in full |
| 1cIjQ058LLxlKkm0P5DlaINbeBt85ZfYE | `_mkbust.py` | 21 | read in full |
| 1CD7nIjxLKHdZYNrdbycRjGuiw-rGJmuF | `_mkface2.py` | 39 | read in full |
| 1e2b5_ofmLXUXumHwGnBH4DcKrD8dtrV7 | `_mkface3.py` | 48 | read in full |
| 14iGG2BxwSWcSH6r0kh2kBSNz0IAohT01 | `_mkface4.py` | 26 | read in full |
| 1XAT8vJ9llhE2cePtQBiRZi6UMpBMFCAi | `_packsheets.py` | 24 | read in full |
| 13C4W-gBPv4wiQtKYKGqvPjUjLPN7xJO0 | `_sheetC.py` | 14 | read in full |
| 1QI5goLVtcl0Bv7FfP0eLn4_V7TJMGBtd | `_wincands.py` | 24 | read in full |

None are missing.

## Summary

All 14 files are small Python (PIL + numpy) scripts written by the user. They work on PNG copies of the game's
UI textures, which were already extracted to `C:\Games\ffxii modding\ffxii-overlay\tex`. They find sprite
regions, preview them, and cut them out into a raw `.rgba` sidecar format. The user's own D3D11 overlay DLL
loads these files from `C:\Games\ffxii modding\overlay\assets`.

The batch has **no game-memory addresses, struct offsets, byte checks, `memory.execute` calls, or game file
formats** (VBF, battlepack, EBP, TIM2 and so on). What it has:

* the **`.rgba` sidecar format** used by the overlay (also cross-checked against the overlay DLL source in another batch);
* **texture names and atlas regions**: where specific HUD sprites sit inside the extracted UI sheets
  (ON/OFF pills, gambit "G" hexagon badge, battle window frame, party face portraits, chibi shop busts);
* the **image-processing methods** used to make game sprites usable as tintable overlay sprites
  (alpha-bbox cropping, 8-connected blob search, colour-key matting of opaque backgrounds, brightness
  normalisation for vertex tinting).

Nothing here is by Xeavin. Everything below is described in my own words.

Evidence key: **byte-check-in-code** = code checks the original bytes before patching; **used-in-code** = the
script actually uses the value or writes the format; **comment-only** = only a docstring or comment says it.
No file in this batch patches memory, so no row is byte-check-in-code.

### Shared facts (apply to most files)

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| `.rgba` sidecar format | Little-endian header of two uint32 values (width, then height), 8 bytes total. Then `width*height*4` bytes of RGBA8 pixels, row-major, top-down, tightly packed (pitch = w*4). There is no magic, mip or version field. | `_cuthud.py` L24-26; `_cuthud2.py` L22-24; `_cutwin.py` L33-35; `_mkbust.py` L17-19; `_mkface2/3/4.py` | used-in-code |
| `.rgba` consumer (cross-ref) | The overlay DLL (`dllmain.cpp`, another batch, L59-79) reads the same 8-byte w/h header and rejects 0 or >8192. It uploads the pixels as an immutable `DXGI_FORMAT_R8G8B8A8_UNORM` texture with pitch w*4. Alpha is straight (not premultiplied) as written by these scripts. | dllmain.cpp L59-79 (cross-ref) | used-in-code |
| Directories | Extracted PNG sheets and preview/debug images: `C:\Games\ffxii modding\ffxii-overlay\tex`. Finished overlay sprites: `C:\Games\ffxii modding\overlay\assets`. Debug outputs are prefixed `_`. | every file, L4-L8 | used-in-code |
| Extracted sheet names | User-assigned atlas sheets `pack1_00`..`pack1_04` and `pack2_00`..`pack2_10`. Native game UI texture names seen: `w_win_c`, `cm2_win_c`, `tuto_win_c`, `shop_8_c`. The `_c` suffix matches names in `extract_tex.py`/`texlist.txt` from another batch, which reads CLUT-based images. The `pack*` names are the user's own; their source file is not in this batch. | `_packsheets.py` L21-23; `_sheetC.py` L6; `_wincands.py` L5 | used-in-code |
| pack2 sheet size | `pack2_05` must be exactly 1024x512, because it is alpha-composited onto a fresh 1024x512 canvas (PIL requires equal sizes). `pack2_06` is at least 1024 wide (columns 512..1023 are indexed). | `_cuthud.py` L35-36; `_gcheck2.py` L3-4; `_mkface3.py` L10 | used-in-code |
| Alpha thresholds | "Visible pixel" means alpha above 10, 12, 15 or 20 depending on the script. Colour statistics use alpha above 60. | various | used-in-code |

---

## 1. `_ac.py`

**Purpose.** A quick visual check. Crops the right half of `pack2_06` (the face-portrait column) to a JPEG so the user can confirm Ashe's portrait is there.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Ashe check region | `pack2_06.png` crop box x 512..1023, y 0..419, written to `_ashecheck.jpg` (q90). Uses a relative path, so it is run from inside the `tex` folder. | L2-3 | used-in-code |

## 2. `_bustgrid.py`

**Purpose.** Finds every chibi character bust on the shop texture `shop_8_c` and draws its bounding box and coordinates, so the right bust can be chosen.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Source sheet | `shop_8_c.png`: a shop-menu sheet with die-cut chibi character busts (already on transparency). | L5 | used-in-code |
| Bust detection | 8-connected flood fill over pixels with alpha above 20. A component counts as a bust only when its bbox spans at least 41 px both ways (`x1-x0 >= 40` and `y1-y0 >= 40`). Prints x/y range and size for each. | L7-30 | used-in-code |
| Debug output | Composite on grey (60,60,66) with red boxes and yellow `x,y` labels, saved as `_bustgrid.png`. | L10, L27-31 | used-in-code |

## 3. `_cuthud.py`

**Purpose.** First pass at cutting real HUD sprites: the ON/OFF pills from `pack2_00`, plus a zoomed preview to look for the gambit "G" glyph in `pack2_05`.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| ON pill region | `pack2_00` search box x 448..531, y 270..329, cropped to the alpha above 15 bbox, written to `on_pill.rgba` and `_on_pill.png`. | L30 | used-in-code |
| OFF pill region | `pack2_00` search box x 540..624, y 270..329, written to `off_pill.rgba`. | L31 | used-in-code |
| Cut helper | Crop the search box, then tighten to the alpha bbox. Prints absolute bounds and the mean RGB of pixels with alpha above 60, which gives the sprite's native colour. | L9-28 | used-in-code |
| G glyph guess (wrong) | The comment guessed the G glyphs were mid-left around y 320..360. It previews box (80,280)-(400,400) at 3x nearest-neighbour to `_gcheck.jpg`. `_cuthud2.py` later puts the real badge at y about 188..265. | L33-39 | comment-only (location guess); used-in-code (preview) |

## 4. `_cuthud2.py`

**Purpose.** Final HUD sprite cuts. Each sprite is normalised to full brightness so the overlay DLL can recolour it with a vertex tint (gold).

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Gambit badge | Grey hexagonal "G" badge in `pack2_05`, search box x 148..227, y 188..264. Written to `gambit_badge.rgba`, used as the per-row gambit badge in the overlay and tinted gold. | L2, L29 | used-in-code (region); comment-only (use) |
| ON/OFF pills | Same `pack2_00` boxes as `_cuthud.py`, re-cut with normalisation. Used as menu tags, tinted gold. | L3, L30-31 | used-in-code |
| Tint-ready normalisation | The highest RGB value among pixels with alpha above 60 becomes the peak. All RGB is scaled by 255/peak (clipped), so the brightest core becomes white and a multiplicative vertex colour shows exactly that colour. Alpha is unchanged. Source sprites are greyscale. | L17-20 | used-in-code |
| Tighten threshold | Alpha above 15 by default (`thr`). | L11-16 | used-in-code |

## 5. `_cutwin.py`

**Purpose.** Pulls the battle-menu window frame out of `pack1_01` as one sprite for the overlay.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Blob search | 8-connected components over alpha above 12. Components are sorted by pixel count and the three largest are printed. | L8-29 | used-in-code |
| Battle window sprite | The largest component's bbox in `pack1_01` is saved untouched as `win_battle.rgba` (and `_win_battle.png`). The coordinates are found at run time; no fixed numbers are in the file. | L30-36 | used-in-code |
| Sanity sample | Prints the RGBA at the centre pixel and at row 2 (centre column) to check the frame's fill and edge alpha. | L37-40 | used-in-code |

## 6. `_findon.py`

**Purpose.** Zoomed preview used to locate the ON/OFF pills in `pack2_00`.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Search region | `pack2_00` composite over (60,60,70), crop (380,250)-(620,360), 3x nearest-neighbour, saved as `_oncheck.jpg`. The pills were then found at x 448..624, y 270..330 (see `_cuthud.py`). | L2-6 | used-in-code |

## 7. `_gcheck2.py`

**Purpose.** A second zoomed preview pass to find the gambit "G" glyph in `pack2_05`.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Preview bands | Two crops from the 1024x512 `pack2_05`: (0,300)-(320,400) to `_gcheck2.jpg`, and (0,150)-(512,300) to `_gcheck3.jpg`. The second band holds the final badge box (x 148..227, y 188..264). | L3-8 | used-in-code |

## 8. `_mkbust.py`

**Purpose.** The first attempt at an Ashe portrait. It uses her chibi bust from `shop_8_c` as `ashe_face.rgba`. Later `_mkface*.py` scripts overwrite this file.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Bust layout | Per the comment, in `shop_8_c` the second bust in the **top** row is Ashe and the second in the **bottom** row is Penelo. The docstring (bottom row) contradicts the inline comment (top row); the code follows the comment. | L1, L9 | comment-only |
| Ashe bust region | Search slice rows 0..129, columns 135..264, tightened to alpha above 20, written to `ashe_face.rgba`. | L9-19 | used-in-code |
| Print bug | The printed "sheet" coordinates add 125 to x and 135 to y. The real slice origin is x+135, y+0, so the logged numbers are wrong. Only the output file is correct. | L15-16 | used-in-code |

## 9. `_mkface2.py`

**Purpose.** Cuts Ashe's battle-menu face portrait from `pack2_06` and scans `w_win_c` for its two horizontal bars. The DLL uses those bars to 9-slice the right sub-rectangle.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Face portrait sheet | `pack2_06` right column (x 512..1023) holds the battle-menu character faces. Ashe is the top cell. | L1, L11 | comment-only |
| Alpha-bbox attempt | Tightens alpha above 10 inside x 512..1023, y 0..359. This fails because the faces sit on an opaque background (see `_mkface3`), so the result includes the background. | L12-25 | used-in-code |
| `w_win_c` bar scan | Counts pixels with alpha above 12 in each row. A run of rows with more than 8 such pixels is a "bar". For each bar it prints the y range and the x extent at its middle row. Two bars are expected. The DLL 9-slices one of them. `w_win_c.rgba` is loaded by `dllmain.cpp` L141 (cross-ref). | L2-3, L27-39 | used-in-code |
| Misc | The docstring has a stray Russian word, "правильный" ("correct"). It has no technical meaning. | L3 | comment-only |

## 10. `_mkface3.py`

**Purpose.** Colour-key matting of Ashe's face. The `pack2_06` portraits are on an opaque pale painted background, so it is keyed out by colour distance.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Opaque background | The `pack2_06` portraits have an opaque pale background, not transparency. | L1-2 | comment-only (confirmed by `_mkface4` needing a hard key) |
| Background sample | Median RGB of the right column at rows 2..7, columns 490..507 (absolute x 1002..1019): the top-right corner. | L11 | used-in-code |
| Key | Distance is the per-channel max of abs difference from the background colour. A pixel counts as background if the distance is under 26 or alpha is under 10. | L13-14 | used-in-code |
| Cell detection | A row is part of a cell when under 98% of it is background. Cells shorter than 61 rows are dropped. Prints the first 8 cells; uses cell 0 (Ashe). | L16-28 | used-in-code |
| Soft matte | alpha = clip((dist-12)/40, 0..1). Below 0.5 it is zeroed outside the foreground mask. Preview composite on navy (40,52,76). | L33-47 | used-in-code |

## 11. `_mkface4.py`

**Purpose.** Final version of `ashe_face.rgba` (highest version number). A hard colour key with a fixed background colour and a fixed crop, because the soft key left a ghost rectangle over dark scenes.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Fixed crop | `pack2_06` rows 0..251, columns 512..1023, giving a **512x252** `ashe_face.rgba`. | L7, L15-21 | used-in-code |
| Background colour | Fixed RGB (196, 205, 211). | L9 | used-in-code |
| Hard key | alpha = clip((dist-24)/38, 0..1) raised to the power 1.25. Values under 0.22 become 0. Anything within 24 of the background colour is fully transparent. | L10-14 | used-in-code |
| Why | The comment says the soft key from `_mkface3` left a visible ghost rectangle of the painted background over dark scenes. | L11-12 | comment-only |
| Preview | Composite on tan (168,148,108) saved as `_ashe_face_preview.jpg`. Prints the count of pixels with alpha above 40. | L23-26 | used-in-code |

## 12. `_packsheets.py`

**Purpose.** Builds contact sheets of the extracted UI atlases so they can be checked by eye.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Sheet A | `pack2_00`, `pack2_02`, `pack2_05`, `pack2_08`: 2 columns, 560 px cells, saved as `_sheetA.jpg`. | L21 | used-in-code |
| Sheet B | `pack1_00`, `pack1_03`, `pack2_03`, `pack2_09`, `pack1_01`, `pack2_10`: 3 columns, 420 px cells, saved as `_sheetB.jpg`. | L22-23 | used-in-code |
| Labels | Each thumbnail is labelled with name and native WxH, on a brown (70,60,45) background. | L12-18 | used-in-code |

## 13. `_sheetC.py`

**Purpose.** A third contact sheet: `pack1_04` and `pack2_06` side by side (about 560x580 thumbnails) with name and size labels, saved as `_sheetC.jpg`.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Sheets covered | `pack1_04`, `pack2_06` (`pack2_06` is the face-portrait sheet). | L6 | used-in-code |

## 14. `_wincands.py`

**Purpose.** Compares the candidate window-frame textures on a checkerboard background, to choose a 9-slice source for the overlay windows.

| Topic | Detail | Source line | Evidence |
|---|---|---|---|
| Window candidates | `w_win_c` (standard window), `cm2_win_c`, `tuto_win_c` (tutorial window), `pack1_02`, `pack2_01`, `pack2_07`, `pack2_04`. Each is shown at 280x280 with its native size. | L5, L9-22 | used-in-code |
| Checkerboard | 16 px tiles in two browns, (140,120,90) and (90,75,55), so alpha edges are easy to judge. Saved as `_wincands.jpg`. | L13-16, L23 | used-in-code |

---

## Relevance to editors

* **Overlay or UI-mod editors:** the `.rgba` format and the sprite regions above are enough to rebuild or
  re-skin the overlay sprites (`on_pill`, `off_pill`, `gambit_badge`, `win_battle`, `ashe_face`) without these
  scripts. The tint-ready normalisation explains why these sprites look white or grey on disk. The DLL
  applies colour, which suits per-character HUD colouring.
* **Offline file editors:** the names `w_win_c`, `cm2_win_c`, `tuto_win_c`, `shop_8_c` and the `pack1_*`/`pack2_*`
  sheets are entry points for finding UI textures. The extraction format (CLUT images) is handled by
  `extract_tex.py`/`export_rgba.py` in other batches, not here.
* **Memory editors:** nothing in this batch (no addresses or structures).
