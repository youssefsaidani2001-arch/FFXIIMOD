# FFXIIMOD — Summon System (Revenant Wings summons for FFXII: The Zodiac Age)

A Lua mod for the **FF12 Lua Loader** that replaces the Technicks battle-menu
category with **Summons**: the 51 Yarhi of *Final Fantasy XII: Revenant Wings*,
bound through a **Ring of Pacts**, limited by **Affinity**, and starting with
**Alraune**. It is built the same way the Blue Magick lua was: vanilla
battlepack rows are copied at runtime and rewritten into the new abilities, and
the availability of each ability is decided by the mod, not by the license board.

## Install

1. Install the FF12 External File Loader and the FF12 Lua Loader (v1.7.2+).
2. Remove the old Blue Magick / Sword Magick / Black Magick luas (they will be
   rewritten later):
   ```powershell
   .\tools\Remove-OldMagickLuas.ps1 -GameDir "<game folder>" -WhatIf   # preview
   .\tools\Remove-OldMagickLuas.ps1 -GameDir "<game folder>" -Backup   # delete
   ```
3. Copy the `x64` folder over the game folder.
4. Edit `x64/scripts/config/SummonSystemConfig.lua` (hot-reloads in game).

## What it does

| Revenant Wings                      | This mod                                                        |
|-------------------------------------|-----------------------------------------------------------------|
| 51 summons, 6 elements, 3 groups     | `summon_system/data.lua`, Ring order, Alraune first             |
| Ring of Pacts, Auracite              | `pacts.lua`: F7 opens the ring (native dialog), rank gating, boss gating, saved in the save-game JSON |
| Affinity bar                         | `affinity.lua`: pool that grows with the leader's level, regenerates, refills when an enemy "gate" (leader) falls |
| Rank III = one at a time             | enforced in `affinity.canSummon`                                |
| Summoning Gates                      | the summoner's Mist charges are the gate; `summon.request.gate` flag = capture |
| Summon menu                          | 51 Section 14 actions in the Technicks category; "Technicks" label renamed to "Summons" |

Runtime flow: `SummonSystem.lua` → `actions.build()` copies the vanilla
"esper appear" action (event script 40) into 51 slots → `menu_labels.apply()`
renames the categories → `summoner.install()` hooks the battle-menu action read,
gates the cast (pact bound? affinity? rank-3 free?), rewrites the Section 16 body
slot (model / level / summon time) and lets the engine's own esper path play the
summon → the mode flag at `0x021B8410` tells us when it is dismissed.

## Files

```
x64/scripts/SummonSystem.lua              entry point
x64/scripts/summon_system/data.lua        the 51 summons
x64/scripts/summon_system/addresses.lua   every address (Insurgent's Toolkit)
x64/scripts/summon_system/actions.lua     Section 14 builder
x64/scripts/summon_system/pacts.lua       Ring of Pacts + save/load + dialog
x64/scripts/summon_system/affinity.lua    affinity pool
x64/scripts/summon_system/summoner.lua    battle hook, body slots, dismissal
x64/scripts/summon_system/menu_labels.lua battle-menu label renamer
x64/scripts/summon_system/util.lua        helpers
x64/scripts/config/SummonSystemConfig.lua user config
tools/Remove-OldMagickLuas.ps1            cleanup of the old magick luas
docs/DESIGN.md, docs/ROSTER.md, docs/VERIFY.md
```

## Talking to the mod from other scripts

Flags (see `event` docs): `summon.request.unlock = "<id>"`, `summon.request.boss = "<id>"`,
`summon.request.auracite = <n>`, `summon.request.gate = true`; read
`summon.unlocked.<id>`, `summon.auracite`, `summon.affinity`, `summon.affinity.max`.

## Status

Code is syntax-checked (`luac -p`) and runs end to end in an offline harness that
fakes the loader (`memory`, `event`, `dialog`, ...). It has **not** run inside the
game yet; `docs/VERIFY.md` lists the eight values to confirm with Cheat Engine
on the first launch (the action-id register, the Technicks category value, the
label scan region, the free Section 14 slot range, model ids, and the guest
factory signature).
