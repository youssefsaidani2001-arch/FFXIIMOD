-- summon_system/affinity.lua
-- Revenant Wings Affinity adapted to FFXII:
--   * the party owns an Affinity pool (blue part of the RW bar);
--   * every summon on the field holds points equal to its rank cost;
--   * points regenerate over time (the RW "your gates" income) and jump when an
--     enemy leader falls (the RW "capture an enemy gate");
--   * a rank-3 summon is limited to one at a time, exactly like RW.
local U = require("summon_system.util")
local A = require("summon_system.addresses")

local F = {}

F.current = 0
F.max = 0
F.active = {}   -- summonId -> { rank = n, cost = n, since = clock }
local lastTick = nil

local function leaderLevel()
  -- Party leader Battle Unit Keep via the actor chain: keep = bpack member 0 by default.
  local keep = U.tryExecute(A.FN_GET_UNIT_KEEP_BY_MEMBER, arg.pointer, { arg.s32 }, { 0 })
  if keep and keep ~= 0 then
    local lvl = memory.readU8(keep + A.KEEP.level)
    if lvl and lvl > 0 then return lvl end
  end
  return 1
end

function F.recomputeMax()
  local c = U.cfg.affinity
  F.max = math.min(c.cap, math.floor(c.base + c.perLevel * leaderLevel()))
  if F.current > F.max then F.current = F.max end
  event.setFlag("summon.affinity.max", F.max)
end

function F.reset()
  F.recomputeMax()
  F.current = F.max
  F.active = {}
  lastTick = nil
  event.setFlag("summon.affinity", F.current)
end

function F.held()
  local n = 0
  for _, a in pairs(F.active) do n = n + a.cost end
  return n
end

function F.available() return F.current - F.held() end

function F.hasRank3Active()
  for _, a in pairs(F.active) do if a.rank == 3 then return true end end
  return false
end

-- Returns ok, reason
function F.canSummon(summon)
  local cost = U.cfg.affinity.costPerRank[summon.rank] or 1
  if summon.rank == 3 and F.hasRank3Active() then return false, "a rank 3 summon is already out" end
  if F.available() < cost then
    return false, ("not enough affinity (%d/%d, need %d)"):format(F.available(), F.max, cost)
  end
  return true, cost
end

function F.onSummoned(summon)
  local cost = U.cfg.affinity.costPerRank[summon.rank] or 1
  F.active[summon.id] = { rank = summon.rank, cost = cost, since = event.getClock() }
  event.setFlag("summon.affinity", F.available())
end

function F.onDismissed(summonId)
  F.active[summonId] = nil
  event.setFlag("summon.affinity", F.available())
end

-- Called every frame (onFlip). Regenerates the pool.
function F.tick()
  local now = event.getClock()
  if not lastTick then lastTick = now return end
  local dt = (now - lastTick) / 1e6
  lastTick = now
  if dt <= 0 or dt > 5 then return end
  if F.current < F.max then
    F.current = math.min(F.max, F.current + U.cfg.affinity.regenPerSec * dt)
  end
end

-- "Gate captured": call when an enemy leader / boss dies.
function F.captureGate()
  F.current = math.min(F.max, F.current + U.cfg.affinity.gateCapture)
  event.setFlag("summon.affinity", F.available())
  U.say(("Summoning gate captured  (affinity %d/%d)"):format(math.floor(F.available()), F.max))
end

return F
