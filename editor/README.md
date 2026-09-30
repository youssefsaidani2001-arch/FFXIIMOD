# Battlepack Workbench — all-in-one FFXII: The Zodiac Age battlepack editor

A single-page editor (`editor/index.html`, no server, no install) for
`battle_pack.bin`, the master gameplay data file of *FFXII: The Zodiac Age*.
Like FireEditor for the PS2 game it edits everything in one place:

| Section | What it holds |
|---|---|
| 0 Weapon Stances · 3 MP Regeneration · 5 Equipment Categories · 6 Chain Levels | battle rules |
| 7 Gambits · 8 Default Party Member Gambits · 9 Level Growth | AI and growth |
| 11 Magick Categories · 12 License Nodes · 13 Equipment & Attributes · 14 Actions · 15 Status Effects · 16 Party Members · 17 Battle Menu · 18 Items | the core content |
| 26 Mist · 27 Battle Menu Restrictions · 28 Prices · 29 Magicks · 30 Technicks · 31 Concurrences · 32 Loot · 33 Maps · 34 Teleport Locations · 35 Key Items | content tables |
| 37 Packages · 38 Rewards · 39 Shops · 41 Elements · 42 Initial Inventory · 57 Bazaar Goods · 58 Augments · 59/60 Story Point Additions · 68 · 69 Movies | world data |

Sections with a documented layout (35 of them, from the FF12 Lua Loader
`bpack` docs) get a form with typed fields, bitfield checkboxes and drop-down
names taken from The Insurgent's Toolkit lists (actions, equipment, models,
formulas, animations, statuses, licenses, gambits, party members …). Every
section, documented or not, also has a raw hex editor per record.

## Use

1. Extract `battle_pack.bin` with VBF Browser and open it (or drag it onto the page).
   A section exported by the Insurgent's Toolkit can be opened alone with **Open section**.
2. Pick a section, pick a row, edit. Changed fields and bytes are highlighted;
   the footer lists every byte run that differs from the original file.
3. Export:
   * **Save battle_pack.bin** — for the External File Loader.
   * **Copy / Save Lua patch** — `BattlepackPatch.lua` for the FF12 Lua Loader:
     applies the same byte runs to the live battlepack at startup and after every
     save load, so the archive stays untouched.
   * **Save changes.json** — re-apply later with **Load changes** on a fresh file,
     or share the diff.
   * **Save all (.zip)** — the three files together (the published claude.ai copy
     can only hand out `.zip`/`.json`/`.txt`, so bin and lua saves are zipped there).

## Build

```
python3 editor/build.py      # src/page.html + src/core.js + data/*.json -> index.html
node  editor/test/core_test.js
```

`data/bpack_schema.json` is generated from the Lua Loader docs
(`capabilities/bpack-sections/*.md`); `data/lists.json` from the drop-down lists
of The Insurgent's Toolkit cheat table. Field-to-list mapping lives in
`LIST_RULES` in `src/page.html`; add a rule when a section gains a list.

## Limits

* The on-disk layout of `battle_pack.bin` was inferred from the toolkit's
  description (section table of offsets, `st2e` headers with count / entry
  size / list pointer). If your dump uses absolute pointers the parser rebases
  them; a section whose entries fall outside its bounds is flagged in the record
  header.
* Sections 10 and 39 have bespoke layouts and are hex-only.
* Text (names, descriptions) lives in the text tables, not here: fields show the
  text id plus the known name.
