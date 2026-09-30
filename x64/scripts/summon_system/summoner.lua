-- summon_system/summoner.lua
-- Runtime side of the summon system:
--   * hooks the battle-menu action read to see which summon was chosen,
--   * gates it by Ring of Pacts + Affinity (denies the cast when not allowed),
--   * rewrites the Section 16 body slot with the chosen summon's model/stats
--     right before the engine's own esper path takes over,
--   * tracks dismissal (mode flag bit0) to free affinity,
--   * optional "guest" spawn mode for multiple Rank I/II summons.
local U    = require("summon_system.util")
local A    = require("summon_system.addresses")
local DATA = require("summon_system.data")
local ACT  = require("summon_system.actions")
local P    = require("summon_system.pacts")
local F    = require("summon_system.affinity")

local S = {}

S.pending = nil          -- summon chosen in the menu, waiting for the cast to resolve
S.onField = nil          -- summon currently out through the esper path
S.deniedUntil = 0
local lastModeBit = false
local regDumpBudget = 8

local function esperOut()
  local v = memory.readU8(A.MODE_FLAGS)
  return v and (v & 1) == 1
end

-- Write the summon's body into its Section 16 slot (model, level, stats, time).
local function prepareBody(summon)
  local h = U.st2e(U.ptr(A.SECTION16_PARTY_PTR))
  if not h then return false end
  local slot = ACT.bodySlotFor(summon)
  if not slot then return false end
  local row = h.list + slot * h.entrySize
  if summon.model and summon.model >= 0 then
    memory.writeS32(row + A.MEM.model, summon.model)
  end
  local secs = U.cfg.summonTimeSec[summon.rank]
  if secs and secs > 0 then memory.writeU8(row + A.MEM.summonTime, math.min(255, secs)) end
  -- scale level with the party leader so low-rank summons stay useful
  local lvl = memory.readU8(row + A.MEM.level)
  local leaderKeep = U.tryExecute(A.FN_GET_UNIT_KEEP_BY_MEMBER, arg.pointer, { arg.s32 }, { 0 })
  if leaderKeep and leaderKeep ~= 0 then
    local leaderLvl = memory.readU8(leaderKeep + A.KEEP.level) or lvl
    local bonus = ({ [1] = -5, [2] = 0, [3] = 5 })[summon.rank] or 0
    memory.writeU8(row + A.MEM.level, math.max(1, math.min(99, leaderLvl + bonus)))
  end
  U.dbg("body slot %d prepared for %s (model %d)", slot, summon.name, summon.model or -1)
  return true
end

-- Decide whether the chosen summon may be cast. Returns ok, reason.
function S.gate(summon)
  if not P.isUnlocked(summon.id) then return false, summon.name .. " is not bound in the Ring of Pacts" end
  if U.cfg.spawnMode == "esper" and esperOut() then return false, "a summon is already on the field" end
  local ok, why = F.canSummon(summon)
  if not ok then return false, why end
  return true
end

-- ------------------------------------------------------------ hooks
local function onMenuActionRead(_, state)
  local reg = U.cfg.actionIdRegister or "rax"
  local actionId = state[reg]
  if regDumpBudget > 0 and U.cfg.debug then
    regDumpBudget = regDumpBudget - 1
    U.dbg("menu action regs rax=%X rbx=%X rcx=%X rdx=%X rsi=%X rdi=%X r8=%X r9=%X",
      state.rax, state.rbx, state.rcx, state.rdx, state.rsi, state.rdi, state.r8, state.r9)
  end
  if type(actionId) ~= "number" then return end
  actionId = actionId & 0xFFFF
  local summon = ACT.summonOfSlot[actionId]
  if not summon then return end

  local ok, why = S.gate(summon)
  if not ok then
    U.say(why, 2000)
    -- Redirect the cast to the template esper's Dismiss-less no-op: safest is to
    -- point the id at a harmless action (Attack) - the menu then simply attacks.
    -- VERIFY that 0x96 (Attack, per the toolkit default) is right on your build.
    state[reg] = 0x96
    return { }
  end
  S.pending = summon
  prepareBody(summon)
  U.dbg("summon chosen: %s (action %d)", summon.name, actionId)
end

local function pollField()
  F.tick()
  local out = esperOut()
  if out and not lastModeBit then
    if S.pending then
      S.onField = S.pending
      S.pending = nil
      F.onSummoned(S.onField)
      U.say(("%s answers the call  (affinity %d/%d)"):format(S.onField.name, math.floor(F.available()), F.max))
    end
  elseif (not out) and lastModeBit then
    if S.onField then
      F.onDismissed(S.onField.id)
      U.dbg("%s dismissed", S.onField.name)
      S.onField = nil
    end
  end
  lastModeBit = out
end

function S.install()
  local hooked = memory.registerHook(A.CODE_BATTLE_MENU_ACTION_READ, onMenuActionRead)
  if not hooked then
    U.log("could not hook battle-menu action read at 0x%X", A.CODE_BATTLE_MENU_ACTION_READ)
  end
  event.registerEventAsync("onFlip", function() pollField() end)
  event.registerEventAsync("onMapJump", function()
    S.pending = nil
    if S.onField then F.onDismissed(S.onField.id) S.onField = nil end
    F.recomputeMax()
  end)
  return hooked
end

function S.dump()
  U.log("state: pending=%s onField=%s esperOut=%s affinity=%d/%d pacts=%d auracite=%d",
    S.pending and S.pending.name or "-", S.onField and S.onField.name or "-",
    tostring(esperOut()), math.floor(F.available()), F.max, P.count(), P.state.auracite)
  for id, slot in pairs(ACT.slotOf) do
    if P.isUnlocked(id) then U.log("  bound %-14s -> action slot %d body %d", id, slot, ACT.bodySlotFor(DATA.BY_ID[id]) or -1) end
  end
end

-- EXPERIMENTAL: spawn a summon as a guest battle member (multiple at once).
-- The factory's calling convention is not confirmed; PermanentAllies used the
-- add-party-member factory with a Section 16 index in ecx. Keep behind config.
function S.spawnGuest(summon)
  local slot = ACT.bodySlotFor(summon)
  if not slot then return false end
  prepareBody(summon)
  local res = U.tryExecute(A.FN_ADD_GUEST_BATTLE_MEMBER, arg.s32, { arg.s32 }, { slot })
  U.dbg("guest spawn %s -> %s", summon.name, tostring(res))
  if res and res ~= 0 then F.onSummoned(summon) return true end
  return false
end

return S
