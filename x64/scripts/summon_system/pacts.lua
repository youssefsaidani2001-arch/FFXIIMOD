-- summon_system/pacts.lua
-- Ring of Pacts: which summons the party has bound, Auracite currency, boss
-- gating, persistence in the save-game companion JSON, and the in-game
-- Ring of Pacts dialog (native windows via the `dialog` table).
local U    = require("summon_system.util")
local DATA = require("summon_system.data")

local P = {}

P.state = {
  unlocked = { alraune = true },  -- Alraune is the starting pact
  auracite = 0,
  bossesDefeated = {},            -- id -> true once the summon was beaten
}

local SAVE_ID = "summon_system"

function P.isUnlocked(id) return P.state.unlocked[id] == true end

function P.canUnlock(summon)
  if P.isUnlocked(summon.id) then return false, "already bound" end
  if not DATA.prerequisitesMet(summon, P.isUnlocked) then
    return false, "needs a rank " .. (summon.rank - 1) .. " " .. summon.element .. " pact"
  end
  if summon.boss and not P.state.bossesDefeated[summon.id] then
    return false, "must be defeated first"
  end
  local cost = U.cfg.auraciteCost[summon.rank] or 0
  if P.state.auracite < cost then
    return false, ("needs %d auracite (have %d)"):format(cost, P.state.auracite)
  end
  return true, cost
end

function P.unlock(id, free)
  local s = DATA.BY_ID[id]
  if not s then return false, "unknown summon " .. tostring(id) end
  if not free then
    local ok, why = P.canUnlock(s)
    if not ok then return false, why end
    P.state.auracite = P.state.auracite - why
  end
  P.state.unlocked[id] = true
  event.setFlag("summon.unlocked." .. id, true)
  U.say("Pact bound: " .. s.name)
  return true
end

function P.addAuracite(n)
  P.state.auracite = math.max(0, P.state.auracite + n)
  event.setFlag("summon.auracite", P.state.auracite)
end

function P.markBossDefeated(id)
  P.state.bossesDefeated[id] = true
end

-- ------------------------------------------------------------ persistence
function P.installSaveHandlers()
  event.registerSaveHandler(SAVE_ID, function(path)
    return {
      version = 1,
      unlocked = P.state.unlocked,
      auracite = P.state.auracite,
      bossesDefeated = P.state.bossesDefeated,
    }
  end)
  event.registerLoadHandler(SAVE_ID, function(path, data)
    if type(data) ~= "table" then
      P.state = { unlocked = { alraune = true }, auracite = 0, bossesDefeated = {} }
    else
      P.state.unlocked = data.unlocked or { alraune = true }
      P.state.unlocked.alraune = true
      P.state.auracite = tonumber(data.auracite) or 0
      P.state.bossesDefeated = data.bossesDefeated or {}
    end
    event.setFlag("summon.auracite", P.state.auracite)
    for _, s in ipairs(DATA.SUMMONS) do
      event.setFlag("summon.unlocked." .. s.id, P.isUnlocked(s.id))
    end
    U.dbg("pacts loaded: %d bound, %d auracite", P.count(), P.state.auracite)
  end)
end

function P.count()
  local n = 0
  for _ in pairs(P.state.unlocked) do n = n + 1 end
  return n
end

-- ------------------------------------------------------------ dialog UI
local ELEMENT_LABEL = { none = "Non-elemental", fire = "Fire", water = "Water",
  thunder = "Thunder", earth = "Earth", holy = "Holy" }

local function openElementRing(element)
  if not (dialog and dialog.ready()) then return end
  local choices = {}
  for _, s in ipairs(DATA.SUMMONS) do
    if s.element == element then
      local label
      if P.isUnlocked(s.id) then
        label = ("%s  [bound]"):format(s.name)
      else
        local ok, why = P.canUnlock(s)
        label = ok and ("%s  (%d auracite)"):format(s.name, why)
                   or ("%s  - %s"):format(s.name, why)
      end
      choices[#choices + 1] = { label, function()
        if not P.isUnlocked(s.id) then
          local ok, why = P.unlock(s.id)
          if not ok then U.say(s.name .. ": " .. tostring(why)) end
        end
        event.executeAfterMs(50, function() openElementRing(element) end)
      end }
    end
  end
  choices[#choices + 1] = { "Back", function() event.executeAfterMs(50, P.openRing) end }
  dialog.aask.open{
    body = ("%s ring  -  Auracite: %d"):format(ELEMENT_LABEL[element], P.state.auracite),
    choice = choices, cancel = #choices, closeOnCancel = false, lockPlayer = true,
  }
end

function P.openRing()
  if not (dialog and dialog.ready()) then
    U.say("Ring of Pacts is not available here")
    return
  end
  local choices = {}
  for _, e in ipairs(DATA.ELEMENTS) do
    choices[#choices + 1] = { ELEMENT_LABEL[e], function() openElementRing(e) end }
  end
  choices[#choices + 1] = { "Close" }
  dialog.aask.open{
    body = ("Ring of Pacts  -  %d/51 bound, %d auracite"):format(P.count(), P.state.auracite),
    choice = choices, cancel = #choices, closeOnCancel = true, lockPlayer = true,
  }
end

return P
