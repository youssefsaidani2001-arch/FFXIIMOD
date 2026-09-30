-- SummonSystemConfig.lua
-- Edit freely; the mod reloads this file when it changes (no restart needed).
-- Values marked VERIFY need a one-time check on your install.

local cfg = {}

-- Master switch.
cfg.enabled = true

-- Print debug lines to the Lua Loader log and, when true, on screen too.
cfg.debug = true
cfg.debugOnScreen = false

-- Battle menu labels. The new label is written over the old one in memory, so
-- it must not be longer than the original ("Magicks" = 7, "Technicks" = 9).
-- Set a label to nil to leave it untouched.
cfg.menuLabels = {
  magicks   = "Magicks",   -- e.g. "Spells" (6). "Abilities" is too long (9 > 7).
  technicks = "Summons",   -- 7 <= 9, fits.
}
-- Regions scanned for the label text. Defaults to the 23 Menu Resource Pack
-- sections; each is scanned for `scanBytes` bytes. VERIFY if labels don't change.
cfg.labelScanBytes = 0x40000

-- Section 14 slots that will be overwritten with the 51 summon actions.
-- They MUST be consecutive and unused by your other mods. Default: the
-- 51 slots starting at 0x1E0 (480) - past the 512 vanilla-ish range used
-- by Blue/Sword/Black magick luas; adjust to what those luas freed. VERIFY.
cfg.actionSlotStart = 480

-- Which vanilla action is copied as the template for every summon action.
-- 0xFFFF = auto: first Section 14 row whose event script is 40 (Belias appear).
cfg.templateActionId = 0xFFFF

-- Section 16 slots used as summon bodies. 0xFFFF = auto: use the 13 vanilla
-- esper rows (rows whose summonTime > 0). One row is assigned per (rank, group).
cfg.bodySlots = 0xFFFF

-- Mist cost per rank (Section 14 mpOrMistCost with hasMpOrMistCost set).
cfg.mistCost = { [1] = 1, [2] = 2, [3] = 3 }

-- Auracite price per rank in the Ring of Pacts.
cfg.auraciteCost = { [1] = 1, [2] = 3, [3] = 6 }

-- Affinity: how many affinity points the party can hold and what a summon costs.
cfg.affinity = {
  base          = 4,     -- points at level 1
  perLevel      = 0.25,  -- extra points per party-leader level
  cap           = 20,
  costPerRank   = { [1] = 1, [2] = 2, [3] = 4 },
  regenPerSec   = 0.5,   -- regenerates while no gate is contested
  gateCapture   = 2,     -- points gained when an enemy "gate" (leader) is defeated
}

-- Summon duration in seconds (Section 16 summonTime, 0 = engine default).
cfg.summonTimeSec = { [1] = 60, [2] = 90, [3] = 120 }

-- How Rank I/II summons are placed on the field.
--   "esper" : native esper path (one summon at a time, safest).
--   "guest" : extra allies via the add-guest-battle-member factory (EXPERIMENTAL,
--             lets several Rank I/II summons coexist like Revenant Wings).
cfg.spawnMode = "esper"

-- Register that holds the action id at CODE_BATTLE_MENU_ACTION_READ.
-- Turn on cfg.debug, open the battle menu, cast anything, read the log line
-- "SS: menu action regs ..." and set the register whose value equals the
-- action id you cast (e.g. Cure = 0). VERIFY.
cfg.actionIdRegister = "rax"

-- Hotkeys (Windows virtual keys via input.key). Set to false to disable.
cfg.hotkeys = {
  ringOfPacts = "KEY_F7",   -- open the Ring of Pacts dialog
  debugDump   = "KEY_F8",   -- dump summon state to the log
}

return cfg
