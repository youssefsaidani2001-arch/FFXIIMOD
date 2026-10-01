# Drive batch 11: FoedexClanPrimerTextReplacer configs (Bestiary and Traveler's Tips)

Source folder (decoded Google Drive export): `scratchpad/drive/<driveId>__<title>`.
Target build: FFXII The Zodiac Age, Steam 1.0.4.0, x64, image base 0x120000, no ASLR.
Drive path: `My Laptop/scripts/config/FoedexClanPrimerTextReplacerConfig/{Bestiary,TravelersTips}/`.
Consumer mod: `FoedexClanPrimerTextReplacer.lua` ("FCTR"). It is in the same export as
`1fLVuSzzU8gDOOD8qmevdnNCtzJSxgKNf__FoedexClanPrimerTextReplacer.lua`. Its header names
LowPriorityCitizen as the author, not Xeavin. These config files carry no licence text.
All facts below are written in my own words. No code is copied.

| Drive id | Folder/title | Local file | Lines / bytes | md5 (first 8) | Status |
|---|---|---|---|---|---|
| 19MbMaGKq3x6S44gZi4sP0aQyIDyz5Yef | Bestiary/fr.lua | `19MbMaGKq3x6S44gZi4sP0aQyIDyz5Yef__fr.lua` | 19 / 663 | 26cafd9f | read in full |
| 1UrZjN2Ukrog_61BR6ZDzVcpaaLPb1DYI | Bestiary/in.lua | `1UrZjN2Ukrog_61BR6ZDzVcpaaLPb1DYI__in.lua` | 19 / 663 | 26cafd9f | read in full |
| 1QwAFr_vQXIn9_hYBZ0uE49H-jQEtK6MQ | Bestiary/it.lua | `1QwAFr_vQXIn9_hYBZ0uE49H-jQEtK6MQ__it.lua` | 19 / 663 | 26cafd9f | read in full |
| 1sgxoP8Lo2wqA6ZF7fO9dkgRnPLKNHLXe | Bestiary/kr.lua | `1sgxoP8Lo2wqA6ZF7fO9dkgRnPLKNHLXe__kr.lua` | 19 / 663 | 26cafd9f | read in full |
| 1tQAfXfIDP4c6WnaLVN8IpEG8C9_HDRfl | Bestiary/us.lua | `1tQAfXfIDP4c6WnaLVN8IpEG8C9_HDRfl__us.lua` | 19 / 663 | 26cafd9f | read in full |
| 1jpMU4m-6C3YKc5lNV9JaDAlw1uOK7py2 | TravelersTips/ch.lua | `1jpMU4m-6C3YKc5lNV9JaDAlw1uOK7py2__ch.lua` | 18 / 541 | 7f691c36 | read in full |
| 1OJI73L7oa0hJNgjMNIrXihLPtI-524AM | TravelersTips/cn.lua | `1OJI73L7oa0hJNgjMNIrXihLPtI-524AM__cn.lua` | 18 / 541 | 7f691c36 | read in full |
| 1LNZyS1Bih86pBnp86F51qkp3DTQz8QYl | TravelersTips/de.lua | `1LNZyS1Bih86pBnp86F51qkp3DTQz8QYl__de.lua` | 18 / 541 | 7f691c36 | read in full |
| 1twKaU_rhss6jHsipeDXWq41bMocD0PFg | TravelersTips/es.lua | `1twKaU_rhss6jHsipeDXWq41bMocD0PFg__es.lua` | 18 / 541 | 7f691c36 | read in full |
| 10_DN3x57sQNb6MztkporXKu0cxf2ig_y | TravelersTips/fr.lua | `10_DN3x57sQNb6MztkporXKu0cxf2ig_y__fr.lua` | 18 / 541 | 7f691c36 | read in full |
| 1irUai7t-g0p38dmkVp9UfW2nqM9_906O | TravelersTips/in.lua | `1irUai7t-g0p38dmkVp9UfW2nqM9_906O__in.lua` | 18 / 541 | 7f691c36 | read in full |
| 1nzueoGapaeinxUEytWRQG5gCm6cWcm6V | TravelersTips/it.lua | `1nzueoGapaeinxUEytWRQG5gCm6cWcm6V__it.lua` | 18 / 541 | 7f691c36 | read in full |
| 1mddr-GDD63vr-IGgLytXLKgcGxlXJyyv | TravelersTips/kr.lua | `1mddr-GDD63vr-IGgLytXLKgcGxlXJyyv__kr.lua` | 18 / 541 | 7f691c36 | read in full |
| 11JORJabuXecb0lUyi7y2Y-XPrqDOBECI | TravelersTips/us.lua | `11JORJabuXecb0lUyi7y2Y-XPrqDOBECI__us.lua` | 18 / 541 | 7f691c36 | read in full |

No file is missing. All files are ASCII with CRLF line endings. There are only **two distinct contents**:

* **Template A (Bestiary)**: 5 identical files (fr, in, it, kr, us), md5 26cafd9f.
  The other Bestiary languages (ch, cn, de, es) are not part of this batch.
* **Template B (Traveler's Tips)**: 9 identical files (ch, cn, de, es, fr, in, it, kr, us), md5 7f691c36.

The config files hold no addresses or hooks. They are Lua chunks that return a list of `{entry, page, text}`
triples, and every sample row is commented out. To make the data meaningful for an editor, the table
"FCTR consumer" below records how the main FCTR script turns these triples into memory, and which game code it
hooks. Those rows are marked *xref*. I read every line of the consumer for this.

Evidence key: **byte-check-in-code** means the code compares the original bytes before patching.
**used-in-code** means the code reads, writes or executes the value. **comment-only** means only a comment says so.

## Shared table: template A (Bestiary/*.lua)

| topic | detail | source line | evidence |
|---|---|---|---|
| Row schema | Each row is a 3-element Lua table `{entry, page, text}`. The file returns a plain array of these rows. | L1, L3, L11 | used-in-code (FCTR reads indexes [1], [2] and [3]) |
| Entry id range | The header gives 0 to 511 (512 Bestiary entries). FCTR stores the id as a u16. | L1 | comment-only (range); used-in-code (u16) |
| Page range | The header gives 0 to 254. FCTR stores the page as a u8. The value 0xFF has a special meaning in the page-count hook, so 254 is the real maximum. | L1, L19 | comment-only + used-in-code |
| Page 0 meaning | Page 0 is the "Classification & Genus" / "Derivation & Rarity" panel. It needs no `{wait}` tag. A separate hook at 0x0057441C serves it. | L17 | comment-only (FCTR comment L7 agrees) |
| Page 1+ title rule | On pages 1 and up, the text before the `{wait}` text tag is the page title. With no `{wait}`, the page has no title. | L16 | comment-only |
| Line breaks | Lines are separated with `\n`, or you can write multi-line text in a Lua long-bracket string `[[ ... ]]`. | L18 | comment-only |
| Extra pages | You can add pages beyond the vanilla 9, up to 254. FCTR raises the page count and widens the page-number digits. | L19 | comment-only (FCTR hooks implement it) |
| Sample ids | Entry 0 is shown as "Cactoid" (its page 0 sample is a 2-line classification/genus "New Plant / New Cactus"). Entry 2 is shown as "Wolf". These are sample content only, and the 0-based Bestiary numbering is not verified. | L5-L7 | comment-only |
| Default state | All three sample rows are commented out, so the returned table is empty. With 0 rows, FCTR's hooks fall back to the vanilla text. | L5-L9 | used-in-code |
| Text tag | `{wait}` is a message-control tag. FCTR's call to the loader's `message.convert` encodes it. | L5-L6, L16 | used-in-code (via message.convert) |

## Shared table: template B (TravelersTips/*.lua)

| topic | detail | source line | evidence |
|---|---|---|---|
| Row schema | The schema is the same `{entry, page, text}` triple. The file returns a plain array. | L1, L3, L11 | used-in-code |
| Entry id range | The header says "0 to ???". The author did not know the upper bound. Stored as a u16. | L1 | comment-only |
| Page index base | The page is 0-based. Row page p replaces the displayed page p+1 (there is no Page-0 special panel as in the Bestiary). | L14, L16 | comment-only (consistent with hook) |
| Page range | 0 to 254, stored as a u8. Pages beyond 9 are allowed. | L1, L18 | comment-only + used-in-code |
| Sample tip ids | Entry 0 is "The Clan Primer". Entry 2 is "Teleport: Travel Made Easy". Entry 7 is "Arm Thyself!". These are the Traveler's Tips titles the author used as samples. | L5-L7 | comment-only |
| Line breaks | Use `\n` or a long bracket `[[ ]]`. | L17 | comment-only |
| Default state | All rows are commented out, so the table is empty and the mod has no effect. | L5-L9 | used-in-code |

## FCTR consumer (xref: 1fLVuSzzU8gDOOD8qmevdnNCtzJSxgKNf__FoedexClanPrimerTextReplacer.lua)

| topic | detail | source line | evidence |
|---|---|---|---|
| Config path | The path is `config.path` + `/FoedexClanPrimerTextReplacerConfig/` + (`Bestiary/` or `TravelersTips/`) + `<lang>.lua`. It is loaded with `loadfile(path,"t")` (text only) and run under `pcall`. | main L221-L237 | used-in-code |
| Language global | The pointer is `u64 @ 0x01F82D20` (the game-settings base). The u32 at offset +0 of that base is the language index. FCTR reads it once at onInitDone. | main L214-L217, L345 | used-in-code |
| Language index to file code | 0=in, 1=us, 2=fr, 3=de, 4=it, 5=es, 6=kr, 7=ch, 8=cn | main L207-L208 | used-in-code |
| Language index to text encoder id | The encoder id is the second argument of `message.convert`: in=1, us/fr/de/it/es=0, kr=2, ch=4, cn=3. I read 0 as Western, 1 as Japanese, 2 as Korean, 3 as Simplified Chinese and 4 as Traditional Chinese. That reading is inferred from the locale codes. | main L210-L211, L244 | used-in-code |
| Hot reload | The script tracks the file's modification time with `lfs.attributes(...,'modification')`. A 3-second `refreshConfig` loop exists, but its call is commented out, so configs load only once. | main L222-L229, L310-L322, L386 | used-in-code (loop disabled) |
| Runtime table layout | FCTR allocates `allocExe(4 + n*12)`. +0 holds a u32 count n, followed by n records of 12 bytes. Record layout: +0 u16 entry id; +2 u8 last page for that entry (the max page over all rows of the entry); +3 u8 page index; +4 u64 pointer to the encoded text. The text buffer is `allocExe(len+1)`, which relies on the allocation being zero-filled for the terminator. | main L259-L290 | used-in-code |
| Lookup semantics | The search is linear and the first matching (entry, page) wins. The asm reads the record as a dword: low word is the entry, top byte (>>24) is the page. | main L73-L79, L117-L128, L155-L166 | used-in-code |
| Parameter symbols | `fctr_btext` (8 bytes, pointer to the Bestiary table), `fctr_ttext` (8 bytes, pointer to the Tips table), `fctr_flip` (1 byte: 1=Bestiary, 0=Tips), `fctr_partybook14` (the MRP buffer). | main L201-L205, L350-L376 | used-in-code |
| Hook 1, page count | At 0x0057650A, the original bytes `B8 01 00 00 00` (mov eax,1) are replaced with a jmp. The hook compares r10 with r13: if they are equal it uses Bestiary (flip=1), otherwise Tips. It looks up entry r13w. If the stored last-page byte is non-zero, the count becomes last+1 (no +1 when the byte is 0xFF), and ebx = max(ebx, count). It then restores eax=1 and returns to 0x0057650F. | main L4, L16, L52-L95 | byte-check-in-code |
| Hook 2, Bestiary page 1+ / Tips page 0+ text | At 0x00573C77, the original bytes `48 8B 4C C1 08` (rcx = [rcx+rax*8+8]) are replaced. It picks the table by flip and matches entry = word[rcx] and page = ax. On a match, rcx is the custom text. With no match and page >= 8, rcx = 0 (empty page). Otherwise the vanilla pointer is used. It returns to 0x00573C7C. | main L6, L17, L98-L143 | byte-check-in-code |
| Inferred game page object | rcx points to an object whose word at +0 is the entry id. From +8 it holds u64 page-text pointers, 8 bytes per page index. Vanilla seems to hold 8 slots (indexes 0-7), which is why the hook returns null at index 8 and above. | main L119, L140, L174 | used-in-code (layout inferred) |
| Hook 3, Bestiary page 0 (class/genus) | At 0x0057441C, the original bytes `48 8B 51 08 48 8B C8` (rdx=[rcx+8]; rcx=rax) are replaced. It always uses the Bestiary table and matches the page against the word at [rsp]. On a match, rdx is the custom text, otherwise rdx = [rcx+8]. It then performs the displaced rcx=rax and returns to 0x00574423. | main L8, L18, L146-L178 | byte-check-in-code |
| Hook 4, current page digit | At 0x00573C16, the original bytes `45 33 C9 44 8B C2` (r9d=0; r8d=edx) are replaced. The new code sets r8d=3 and r9d=0b101, then returns to 0x00573C1C. This lets the page-number texture show 3 digits. | main L10, L19, L181-L184 | byte-check-in-code |
| Hook 5, max page digit | At 0x0056FCF0, the original bytes `41 8D 51 03 45 8D 41 01` (edx=r9+3; r8d=r9+1) are replaced. The new code sets edx=5, r8d=3 and r9d=0b101, then returns to 0x0056FCF8. | main L11, L20, L187-L191 | byte-check-in-code |
| Hook 6, party_book MRP group 14 | At 0x0056FCD4, the original bytes `48 8B 52 08 41 B8 0E 00 00 00` (rdx=[rdx+8]; r8d=14) are overwritten in place, with no trampoline, by a 10-byte replacement. The game would load group 14 of the loaded party_book MRP. The replacement points rdx at FCTR's own 1-group MRP buffer and sets the group index r8d to 0. | main L13, L21, L45-L48 | byte-check-in-code |
| MRP buffer and position fields | The file `scripts/FoedexClanPrimerTextReplacer/party_book_14.mrp` is read raw into `allocExe`. The u16 at +0x34 is X and the u16 at +0x36 is Y. Western (encoder 0) uses 1288/928. Other languages use 1250/918. This file is not in the Drive export. Batch 01 lists party_book as MRP menu file 9. | main L362-L374 | used-in-code |
| Game function 0x002A00F0 | It is called through `memory.executea(0x002A00F0, 0, 8, mrpBuffer)` on the loaded MRP buffer before the hooks are assembled. It is probably an MRP group fixup or init routine. The meaning of the 0 and 8 arguments is unknown. | main L377 | used-in-code (purpose unclear) |
| Patch guard | If any of the 6 sites differs from its original bytes, the script prints a message and aborts. All 6 sites are checked before any write. | main L337-L343 | byte-check-in-code |
| Init-order quirk | The guard `not loadConfig(1) and loadConfig(2)` returns early only when the Bestiary load fails and the Tips load succeeds. Lua operator precedence causes this. If both fail, the script continues with empty tables. | main L346-L348 | used-in-code |
| Cleanup | On the `exit` event, the script unregisters all symbols. `togglePatch(false)` zeroes the table pointer symbol and frees every text buffer with `deallocExe`. | main L292-L307, L331-L334, L388 | used-in-code |

## Per-file sections

### 1. Bestiary/fr.lua (`19MbMaGKq3x6S44gZi4sP0aQyIDyz5Yef`)

Purpose: the French Bestiary override list for FCTR. It is byte-identical to every other Bestiary file in this batch (md5 26cafd9f), so it holds template A (Bestiary): all sample rows are commented out and the returned table is empty.

| topic | detail | source line | evidence |
|---|---|---|---|
| Which game language loads it | FCTR loads this file only when the u32 language index at `[u64 @ 0x01F82D20]` is 2. Its full path is `scripts/config/FoedexClanPrimerTextReplacerConfig/Bestiary/fr.lua`. | FCTR main L207-L223 (xref) | used-in-code |
| Text encoder id | Each row's text goes through `message.convert(text, 0)`. Id 0 is the shared Western encoder. | FCTR main L210-L211, L244 (xref) | used-in-code |
| Content | Template A (Bestiary). See the shared template table above. No row is active, so the mod changes nothing for this language until a row is uncommented. | L5-L7, L9 | used-in-code (empty table returned) |

### 2. Bestiary/in.lua (`1UrZjN2Ukrog_61BR6ZDzVcpaaLPb1DYI`)

Purpose: the Japanese text set (TZA locale folder 'in'; inferred) Bestiary override list for FCTR. It is byte-identical to every other Bestiary file in this batch (md5 26cafd9f), so it holds template A (Bestiary): all sample rows are commented out and the returned table is empty.

| topic | detail | source line | evidence |
|---|---|---|---|
| Which game language loads it | FCTR loads this file only when the u32 language index at `[u64 @ 0x01F82D20]` is 0. Its full path is `scripts/config/FoedexClanPrimerTextReplacerConfig/Bestiary/in.lua`. | FCTR main L207-L223 (xref) | used-in-code |
| Text encoder id | Each row's text goes through `message.convert(text, 1)`. This is a non-Western encoder (Western languages use id 0). | FCTR main L210-L211, L244 (xref) | used-in-code |
| Content | Template A (Bestiary). See the shared template table above. No row is active, so the mod changes nothing for this language until a row is uncommented. | L5-L7, L9 | used-in-code (empty table returned) |

### 3. Bestiary/it.lua (`1QwAFr_vQXIn9_hYBZ0uE49H-jQEtK6MQ`)

Purpose: the Italian Bestiary override list for FCTR. It is byte-identical to every other Bestiary file in this batch (md5 26cafd9f), so it holds template A (Bestiary): all sample rows are commented out and the returned table is empty.

| topic | detail | source line | evidence |
|---|---|---|---|
| Which game language loads it | FCTR loads this file only when the u32 language index at `[u64 @ 0x01F82D20]` is 4. Its full path is `scripts/config/FoedexClanPrimerTextReplacerConfig/Bestiary/it.lua`. | FCTR main L207-L223 (xref) | used-in-code |
| Text encoder id | Each row's text goes through `message.convert(text, 0)`. Id 0 is the shared Western encoder. | FCTR main L210-L211, L244 (xref) | used-in-code |
| Content | Template A (Bestiary). See the shared template table above. No row is active, so the mod changes nothing for this language until a row is uncommented. | L5-L7, L9 | used-in-code (empty table returned) |

### 4. Bestiary/kr.lua (`1sgxoP8Lo2wqA6ZF7fO9dkgRnPLKNHLXe`)

Purpose: the Korean Bestiary override list for FCTR. It is byte-identical to every other Bestiary file in this batch (md5 26cafd9f), so it holds template A (Bestiary): all sample rows are commented out and the returned table is empty.

| topic | detail | source line | evidence |
|---|---|---|---|
| Which game language loads it | FCTR loads this file only when the u32 language index at `[u64 @ 0x01F82D20]` is 6. Its full path is `scripts/config/FoedexClanPrimerTextReplacerConfig/Bestiary/kr.lua`. | FCTR main L207-L223 (xref) | used-in-code |
| Text encoder id | Each row's text goes through `message.convert(text, 2)`. This is a non-Western encoder (Western languages use id 0). | FCTR main L210-L211, L244 (xref) | used-in-code |
| Content | Template A (Bestiary). See the shared template table above. No row is active, so the mod changes nothing for this language until a row is uncommented. | L5-L7, L9 | used-in-code (empty table returned) |

### 5. Bestiary/us.lua (`1tQAfXfIDP4c6WnaLVN8IpEG8C9_HDRfl`)

Purpose: the English Bestiary override list for FCTR. It is byte-identical to every other Bestiary file in this batch (md5 26cafd9f), so it holds template A (Bestiary): all sample rows are commented out and the returned table is empty.

| topic | detail | source line | evidence |
|---|---|---|---|
| Which game language loads it | FCTR loads this file only when the u32 language index at `[u64 @ 0x01F82D20]` is 1. Its full path is `scripts/config/FoedexClanPrimerTextReplacerConfig/Bestiary/us.lua`. | FCTR main L207-L223 (xref) | used-in-code |
| Text encoder id | Each row's text goes through `message.convert(text, 0)`. Id 0 is the shared Western encoder. | FCTR main L210-L211, L244 (xref) | used-in-code |
| Content | Template A (Bestiary). See the shared template table above. No row is active, so the mod changes nothing for this language until a row is uncommented. | L5-L7, L9 | used-in-code (empty table returned) |

### 6. TravelersTips/ch.lua (`1jpMU4m-6C3YKc5lNV9JaDAlw1uOK7py2`)

Purpose: the Traditional Chinese (inferred) Traveler's Tips / Clan Primer override list for FCTR. It is byte-identical to every other TravelersTips file in this batch (md5 7f691c36), so it holds template B (Traveler's Tips): all sample rows are commented out and the returned table is empty.

| topic | detail | source line | evidence |
|---|---|---|---|
| Which game language loads it | FCTR loads this file only when the u32 language index at `[u64 @ 0x01F82D20]` is 7. Its full path is `scripts/config/FoedexClanPrimerTextReplacerConfig/TravelersTips/ch.lua`. | FCTR main L207-L223 (xref) | used-in-code |
| Text encoder id | Each row's text goes through `message.convert(text, 4)`. This is a non-Western encoder (Western languages use id 0). | FCTR main L210-L211, L244 (xref) | used-in-code |
| Content | Template B (Traveler's Tips). See the shared template table above. No row is active, so the mod changes nothing for this language until a row is uncommented. | L5-L7, L9 | used-in-code (empty table returned) |

### 7. TravelersTips/cn.lua (`1OJI73L7oa0hJNgjMNIrXihLPtI-524AM`)

Purpose: the Simplified Chinese (inferred) Traveler's Tips / Clan Primer override list for FCTR. It is byte-identical to every other TravelersTips file in this batch (md5 7f691c36), so it holds template B (Traveler's Tips): all sample rows are commented out and the returned table is empty.

| topic | detail | source line | evidence |
|---|---|---|---|
| Which game language loads it | FCTR loads this file only when the u32 language index at `[u64 @ 0x01F82D20]` is 8. Its full path is `scripts/config/FoedexClanPrimerTextReplacerConfig/TravelersTips/cn.lua`. | FCTR main L207-L223 (xref) | used-in-code |
| Text encoder id | Each row's text goes through `message.convert(text, 3)`. This is a non-Western encoder (Western languages use id 0). | FCTR main L210-L211, L244 (xref) | used-in-code |
| Content | Template B (Traveler's Tips). See the shared template table above. No row is active, so the mod changes nothing for this language until a row is uncommented. | L5-L7, L9 | used-in-code (empty table returned) |

### 8. TravelersTips/de.lua (`1LNZyS1Bih86pBnp86F51qkp3DTQz8QYl`)

Purpose: the German Traveler's Tips / Clan Primer override list for FCTR. It is byte-identical to every other TravelersTips file in this batch (md5 7f691c36), so it holds template B (Traveler's Tips): all sample rows are commented out and the returned table is empty.

| topic | detail | source line | evidence |
|---|---|---|---|
| Which game language loads it | FCTR loads this file only when the u32 language index at `[u64 @ 0x01F82D20]` is 3. Its full path is `scripts/config/FoedexClanPrimerTextReplacerConfig/TravelersTips/de.lua`. | FCTR main L207-L223 (xref) | used-in-code |
| Text encoder id | Each row's text goes through `message.convert(text, 0)`. Id 0 is the shared Western encoder. | FCTR main L210-L211, L244 (xref) | used-in-code |
| Content | Template B (Traveler's Tips). See the shared template table above. No row is active, so the mod changes nothing for this language until a row is uncommented. | L5-L7, L9 | used-in-code (empty table returned) |

### 9. TravelersTips/es.lua (`1twKaU_rhss6jHsipeDXWq41bMocD0PFg`)

Purpose: the Spanish Traveler's Tips / Clan Primer override list for FCTR. It is byte-identical to every other TravelersTips file in this batch (md5 7f691c36), so it holds template B (Traveler's Tips): all sample rows are commented out and the returned table is empty.

| topic | detail | source line | evidence |
|---|---|---|---|
| Which game language loads it | FCTR loads this file only when the u32 language index at `[u64 @ 0x01F82D20]` is 5. Its full path is `scripts/config/FoedexClanPrimerTextReplacerConfig/TravelersTips/es.lua`. | FCTR main L207-L223 (xref) | used-in-code |
| Text encoder id | Each row's text goes through `message.convert(text, 0)`. Id 0 is the shared Western encoder. | FCTR main L210-L211, L244 (xref) | used-in-code |
| Content | Template B (Traveler's Tips). See the shared template table above. No row is active, so the mod changes nothing for this language until a row is uncommented. | L5-L7, L9 | used-in-code (empty table returned) |

### 10. TravelersTips/fr.lua (`10_DN3x57sQNb6MztkporXKu0cxf2ig_y`)

Purpose: the French Traveler's Tips / Clan Primer override list for FCTR. It is byte-identical to every other TravelersTips file in this batch (md5 7f691c36), so it holds template B (Traveler's Tips): all sample rows are commented out and the returned table is empty.

| topic | detail | source line | evidence |
|---|---|---|---|
| Which game language loads it | FCTR loads this file only when the u32 language index at `[u64 @ 0x01F82D20]` is 2. Its full path is `scripts/config/FoedexClanPrimerTextReplacerConfig/TravelersTips/fr.lua`. | FCTR main L207-L223 (xref) | used-in-code |
| Text encoder id | Each row's text goes through `message.convert(text, 0)`. Id 0 is the shared Western encoder. | FCTR main L210-L211, L244 (xref) | used-in-code |
| Content | Template B (Traveler's Tips). See the shared template table above. No row is active, so the mod changes nothing for this language until a row is uncommented. | L5-L7, L9 | used-in-code (empty table returned) |

### 11. TravelersTips/in.lua (`1irUai7t-g0p38dmkVp9UfW2nqM9_906O`)

Purpose: the Japanese text set (TZA locale folder 'in'; inferred) Traveler's Tips / Clan Primer override list for FCTR. It is byte-identical to every other TravelersTips file in this batch (md5 7f691c36), so it holds template B (Traveler's Tips): all sample rows are commented out and the returned table is empty.

| topic | detail | source line | evidence |
|---|---|---|---|
| Which game language loads it | FCTR loads this file only when the u32 language index at `[u64 @ 0x01F82D20]` is 0. Its full path is `scripts/config/FoedexClanPrimerTextReplacerConfig/TravelersTips/in.lua`. | FCTR main L207-L223 (xref) | used-in-code |
| Text encoder id | Each row's text goes through `message.convert(text, 1)`. This is a non-Western encoder (Western languages use id 0). | FCTR main L210-L211, L244 (xref) | used-in-code |
| Content | Template B (Traveler's Tips). See the shared template table above. No row is active, so the mod changes nothing for this language until a row is uncommented. | L5-L7, L9 | used-in-code (empty table returned) |

### 12. TravelersTips/it.lua (`1nzueoGapaeinxUEytWRQG5gCm6cWcm6V`)

Purpose: the Italian Traveler's Tips / Clan Primer override list for FCTR. It is byte-identical to every other TravelersTips file in this batch (md5 7f691c36), so it holds template B (Traveler's Tips): all sample rows are commented out and the returned table is empty.

| topic | detail | source line | evidence |
|---|---|---|---|
| Which game language loads it | FCTR loads this file only when the u32 language index at `[u64 @ 0x01F82D20]` is 4. Its full path is `scripts/config/FoedexClanPrimerTextReplacerConfig/TravelersTips/it.lua`. | FCTR main L207-L223 (xref) | used-in-code |
| Text encoder id | Each row's text goes through `message.convert(text, 0)`. Id 0 is the shared Western encoder. | FCTR main L210-L211, L244 (xref) | used-in-code |
| Content | Template B (Traveler's Tips). See the shared template table above. No row is active, so the mod changes nothing for this language until a row is uncommented. | L5-L7, L9 | used-in-code (empty table returned) |

### 13. TravelersTips/kr.lua (`1mddr-GDD63vr-IGgLytXLKgcGxlXJyyv`)

Purpose: the Korean Traveler's Tips / Clan Primer override list for FCTR. It is byte-identical to every other TravelersTips file in this batch (md5 7f691c36), so it holds template B (Traveler's Tips): all sample rows are commented out and the returned table is empty.

| topic | detail | source line | evidence |
|---|---|---|---|
| Which game language loads it | FCTR loads this file only when the u32 language index at `[u64 @ 0x01F82D20]` is 6. Its full path is `scripts/config/FoedexClanPrimerTextReplacerConfig/TravelersTips/kr.lua`. | FCTR main L207-L223 (xref) | used-in-code |
| Text encoder id | Each row's text goes through `message.convert(text, 2)`. This is a non-Western encoder (Western languages use id 0). | FCTR main L210-L211, L244 (xref) | used-in-code |
| Content | Template B (Traveler's Tips). See the shared template table above. No row is active, so the mod changes nothing for this language until a row is uncommented. | L5-L7, L9 | used-in-code (empty table returned) |

### 14. TravelersTips/us.lua (`11JORJabuXecb0lUyi7y2Y-XPrqDOBECI`)

Purpose: the English Traveler's Tips / Clan Primer override list for FCTR. It is byte-identical to every other TravelersTips file in this batch (md5 7f691c36), so it holds template B (Traveler's Tips): all sample rows are commented out and the returned table is empty.

| topic | detail | source line | evidence |
|---|---|---|---|
| Which game language loads it | FCTR loads this file only when the u32 language index at `[u64 @ 0x01F82D20]` is 1. Its full path is `scripts/config/FoedexClanPrimerTextReplacerConfig/TravelersTips/us.lua`. | FCTR main L207-L223 (xref) | used-in-code |
| Text encoder id | Each row's text goes through `message.convert(text, 0)`. Id 0 is the shared Western encoder. | FCTR main L210-L211, L244 (xref) | used-in-code |
| Content | Template B (Traveler's Tips). See the shared template table above. No row is active, so the mod changes nothing for this language until a row is uncommented. | L5-L7, L9 | used-in-code (empty table returned) |

## Editor relevance

* A Bestiary or Traveler's Tips text editor can write these `{entry, page, text}` Lua files directly. No binary
  edit is needed, because FCTR re-encodes the text at runtime with `message.convert` using the language's encoder id.
* For a memory editor, FCTR's 12-byte record table is a ready injection format. The six patch sites above, with
  their original bytes, let a tool find out whether FCTR is already active. A site that no longer matches its
  original bytes means it is patched.
* The language-index global (`[0x01F82D20]+0`, u32, 0-8) and the file-code and encoder maps can be reused by any
  multi-language text tool.
* Open items: the Traveler's Tips entry count; whether Bestiary entry numbering is 0-based (the samples suggest
  0=Cactoid, 2=Wolf); the exact signature of 0x002A00F0; and the binary layout of `party_book_14.mrp`, which is not in the export.
