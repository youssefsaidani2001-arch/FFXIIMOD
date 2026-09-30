-- SummonSystem.lua  -  Revenant Wings summons for FFXII: The Zodiac Age
-- Requires: FF12 External File Loader + FF12 Lua Loader (v1.7.2+).
-- Install:  copy the x64 folder into the game folder; config lives in
--           x64/scripts/config/SummonSystemConfig.lua
--
-- Layout of the mod (all under x64/scripts/summon_system/):
--   data.lua        the 51 summons (Ring of Pacts order, Alraune first)
--   addresses.lua   every game address, from The Insurgent's Toolkit
--   actions.lua     builds 51 Section 14 actions in the Technicks category
--   pacts.lua       Ring of Pacts state, auracite, save persistence, dialog
--   affinity.lua    affinity pool, gate capture, rank-3 uniqueness
--   summoner.lua    battle-menu hook, body slot rewrite, dismissal tracking
--   menu_labels.lua renames "Technicks" -> "Summons" (and "Magicks" if set)
--   util.lua        logging, config loading, st2e helpers

local TAG = "Summon System (SS)"
print(TAG .. ": loading.")

local minVer = { 1, 7, 2 }
if not (checkMinVersion and checkMinVersion(minVer[1], minVer[2], minVer[3])) then
  print("SS: LUA Loader v" .. table.concat(minVer, ".") .. " or higher required.")
  return
end

local U    = require("summon_system.util")
local DATA = require("summon_system.data")
local ACT  = require("summon_system.actions")
local P    = require("summon_system.pacts")
local F    = require("summon_system.affinity")
local S    = require("summon_system.summoner")
local L    = require("summon_system.menu_labels")

-- ------------------------------------------------------------ config
local DEFAULTS = U.loadLuaConfig("scripts/config/SummonSystemConfig.lua")
local configPath = config.path .. "/SummonSystemConfig.lua"

local function loadConfig()
  local cfg, err = U.loadLuaConfig(configPath)
  if not cfg then
    print("SS: config error (" .. tostring(err) .. "), using defaults.")
    cfg = {}
  end
  U.cfg = U.merge(DEFAULTS or {}, cfg)
  return U.cfg
end
loadConfig()
if not U.cfg.enabled then print("SS: disabled in config.") return end

-- ------------------------------------------------------------ startup
local built = false
local function applyAll()
  if built then return end
  if not ACT.build() then return end
  L.apply()
  S.install()
  F.reset()
  built = true
  U.log("ready: %d/51 pacts bound, affinity %d", P.count(), F.max)
end

P.installSaveHandlers()

event.registerEventAsync("onInitDone", function()
  applyAll()
end)

-- Section tables are re-resolved after a save load or map change: rebuild if needed.
event.registerEventAsync("onSaveLoad", function()
  built = false
  event.executeAfterMs(500, applyAll)
end)

-- ------------------------------------------------------------ hotkeys
local function bind(keyName, fn)
  if not keyName or not input.key[keyName] then return end
  input.registerHotkey(input.key[keyName], fn)
end
bind(U.cfg.hotkeys.ringOfPacts, function() P.openRing() end)
bind(U.cfg.hotkeys.debugDump, function() S.dump() end)

-- ------------------------------------------------------------ cross-script API (flags)
-- Other scripts (your future Blue/Sword/Black magick rewrites, boss scripts)
-- talk to the summon system through flags:
--   summon.request.unlock   = "<id>"   binds a pact for free (e.g. after a boss)
--   summon.request.boss     = "<id>"   marks the summon's boss as defeated
--   summon.request.auracite = <n>      adds n auracite
--   summon.request.gate     = true     "gate captured" (affinity refill)
event.createFlag("summon.request.unlock", "")
event.createFlag("summon.request.boss", "")
event.createFlag("summon.request.auracite", 0)
event.createFlag("summon.request.gate", false)
event.createFlag("summon.auracite", 0)
event.createFlag("summon.affinity", 0)
event.createFlag("summon.affinity.max", 0)
for _, s in ipairs(DATA.SUMMONS) do event.createFlag("summon.unlocked." .. s.id, s.id == "alraune") end

event.registerFlagCallback("summon.request.unlock", function(cause, v)
  if cause == 4 and type(v) == "string" and v ~= "" then P.unlock(v, true) event.setFlag("summon.request.unlock", "") end
end)
event.registerFlagCallback("summon.request.boss", function(cause, v)
  if cause == 4 and type(v) == "string" and v ~= "" then P.markBossDefeated(v) event.setFlag("summon.request.boss", "") end
end)
event.registerFlagCallback("summon.request.auracite", function(cause, v)
  if cause == 4 and type(v) == "number" and v ~= 0 then P.addAuracite(v) event.setFlag("summon.request.auracite", 0) end
end)
event.registerFlagCallback("summon.request.gate", function(cause, v)
  if cause == 4 and v == true then F.captureGate() event.setFlag("summon.request.gate", false) end
end)

-- ------------------------------------------------------------ config hot reload
event.registerFileChangeHandler(configPath, function(path, stats, isNew, isDeleted)
  if isDeleted then return end
  loadConfig()
  L.restore()
  L.apply()
  F.recomputeMax()
  U.log("config reloaded")
end)

print(TAG .. ": loaded (" .. #DATA.SUMMONS .. " summons in the Ring of Pacts).")
