# Design notes

## Why "the Blue Magick method"

The old Blue Magick lua did not add new content to the battlepack file; it
re-purposed existing Section 14 rows at runtime and decided by itself which
rows a character may use. The summon system does exactly that:

* **Template copy.** `actions.build()` copies the vanilla *Belias* summon row
  (found automatically: `useEventScript` set and event script 40 = "esper
  appear, works for any esper") into 51 consecutive rows.
* **Per-row rewrite.** Element bits, Mist cost by rank, `esperRank`,
  `summonedPartyMember` (a Section 16 body slot), `noLicense`, and the
  Technicks category.
* **Availability outside the license board.** The hook on the battle-menu
  action read (`0x00305AE4`, the same instruction the toolkit's "Custom Battle
  Menu Action" patches) turns a disallowed pick into a plain Attack, and
  otherwise prepares the body slot before the cast resolves.

## Body slots

Section 16 has 40 party-member rows; the 13 vanilla esper rows (the ones with
`summonTime > 0`) are reused as bodies. Each (rank, group) pair owns one row;
the row is rewritten (model, level, summon time) every time a summon of that
pair is cast. Because the engine runs one esper at a time, sharing rows is
safe in `spawnMode = "esper"`.

## Affinity

`max = min(cap, base + perLevel × leaderLevel)`, regenerates `regenPerSec`,
each active summon holds `costPerRank[rank]`, and `captureGate()` refills the
pool when another script raises `summon.request.gate` (e.g. from the
enemy-leader death hook of a future boss script).

## Persistence

`event.registerSaveHandler("summon_system")` stores `{unlocked, auracite,
bossesDefeated}` in the JSON that the loader keeps next to every save.

## Known limits

* Names: the summon rows keep the template's text id, so the battle menu shows
  the template's name for every summon until the text table is patched (the
  label renamer only handles the two category labels). The next step is a
  text-file patch through the External File Loader.
* Multiple Rank I/II summons at once need the guest factory (experimental).
