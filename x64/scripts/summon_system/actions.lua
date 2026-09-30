-- summon_system/actions.lua
-- Builds the 51 summon actions inside battlepack Section 14 at runtime, the
-- same way the Blue Magick lua rebuilt its spell slots: copy a vanilla row as a
-- template, then overwrite the fields that make it a summon, and assign the row
-- to the Technicks battle-menu category (which the menu_labels module renames
-- to "Summons").
--
-- Every summon action:
--   * useEventScript = 1, eventScript = 40 (esper "appear", works for any esper)
--   * summonedPartyMember = a Section 16 body slot for its (rank, group)
--   * mist cost by rank, element bits by element, name text id by index
--   * requiredContent = 0 and noLicense = 1: the Ring of Pacts decides
--     availability instead of the license board (gated in summoner.lua).
local U    = require("summon_system.util")
local A    = require("summon_system.addresses")
local DATA = require("summon_system.data")

local ACT = {}

ACT.section = nil        -- st2e header of Section 14
ACT.templateId = nil     -- vanilla action copied as a base
ACT.slotOf = {}          -- summonId -> Section 14 index
ACT.summonOfSlot = {}    -- Section 14 index -> summon record
ACT.backup = {}          -- Section 14 index -> original bytes (restored on unload)

local function section14()
  local base = 0
  if bpack and bpack.section14 and bpack.section14.offset and bpack.section14.offset ~= 0 then
    -- bpack already resolved the st2e; keep the raw base for byte writes
    base = U.ptr(A.SECTION14_ACTIONS_PTR)
  else
    base = U.ptr(A.SECTION14_ACTIONS_PTR)
  end
  local h = U.st2e(base)
  if not h then
    -- fall back to the battlepack file table: sectionBase = dword[file + 14*4 + 4]
    local file = U.ptr(A.BATTLEPACK_PTR)
    if file ~= 0 then h = U.st2e(memory.readU32(file + 14 * 4 + 4)) end
  end
  return h
end

function ACT.rowAddr(index)
  return ACT.section.list + index * ACT.section.entrySize
end

-- Find the vanilla esper-summon row used as a template.
local function findTemplate()
  local cfgId = U.cfg.templateActionId
  if cfgId and cfgId ~= 0xFFFF then return cfgId end
  for i = 0, ACT.section.count - 1 do
    local row = ACT.rowAddr(i)
    local f1 = memory.readU32(row + A.ACT.flags1)
    if U.bit(f1, A.F1.useEventScript) and
       memory.readU16(row + A.ACT.castAnimOrEventScript) == A.EVENT_ANIM_ESPER_APPEAR then
      return i
    end
  end
  return nil
end

-- Section 16 body slots: vanilla esper rows (summonTime > 0), one per (rank, group).
function ACT.findBodySlots()
  local slots = {}
  if U.cfg.bodySlots ~= 0xFFFF and type(U.cfg.bodySlots) == "table" then
    return U.cfg.bodySlots
  end
  local h = U.st2e(U.ptr(A.SECTION16_PARTY_PTR))
  if not h then return slots end
  for i = 0, h.count - 1 do
    local row = h.list + i * h.entrySize
    if memory.readU8(row + A.MEM.summonTime) > 0 then slots[#slots + 1] = i end
  end
  return slots
end

-- Map (rank, group) -> body slot index, spreading the 9 combinations over the
-- available esper rows (13 in vanilla). Any leftover rows stay untouched.
function ACT.assignBodies(slots)
  local map, n = {}, 1
  for rank = 1, 3 do
    for _, g in ipairs(DATA.GROUPS) do
      map[rank .. g] = slots[n] or slots[#slots]
      n = n + 1
    end
  end
  return map
end

function ACT.bodySlotFor(summon)
  return ACT.bodyMap and ACT.bodyMap[summon.rank .. summon.group]
end

function ACT.build()
  ACT.section = section14()
  if not ACT.section then U.log("Section 14 not resolved; actions not built") return false end
  if ACT.section.entrySize ~= A.ACTION_SIZE then
    U.log("Section 14 entry size is 0x%X, expected 0x%X - refusing to write", ACT.section.entrySize, A.ACTION_SIZE)
    return false
  end
  ACT.templateId = findTemplate()
  if not ACT.templateId then U.log("no esper-appear template row found in Section 14") return false end

  local slots = ACT.findBodySlots()
  if #slots == 0 then U.log("no Section 16 esper rows found for summon bodies") return false end
  ACT.bodyMap = ACT.assignBodies(slots)

  local first = U.cfg.actionSlotStart
  if first + #DATA.SUMMONS > ACT.section.count then
    U.log("actionSlotStart %d + 51 exceeds Section 14 count %d", first, ACT.section.count)
    return false
  end

  local template = memory.readArray(ACT.rowAddr(ACT.templateId), A.ACTION_SIZE)
  local templateName = memory.readU16(ACT.rowAddr(ACT.templateId) + A.ACT.name)
  local templateDesc = memory.readU16(ACT.rowAddr(ACT.templateId) + A.ACT.battleMenuDescription)

  for i, s in ipairs(DATA.SUMMONS) do
    local slot = first + i - 1
    local row = ACT.rowAddr(slot)
    if not ACT.backup[slot] then ACT.backup[slot] = memory.readArray(row, A.ACTION_SIZE) end
    memory.writeArray(row, template)

    -- identity ---------------------------------------------------------
    -- Name/description text ids: the game renders text ids from its text
    -- tables, so without a text-file patch every summon would show the
    -- template's name. We keep the template ids here and let menu_labels
    -- rewrite the displayed string at draw time (see summoner.onMenuAction).
    memory.writeU16(row + A.ACT.name, templateName)
    memory.writeU16(row + A.ACT.battleMenuDescription, templateDesc)

    -- summon mechanics ---------------------------------------------------
    local f1 = memory.readU32(row + A.ACT.flags1)
    f1 = U.setbit(f1, A.F1.useEventScript, true)
    f1 = U.setbit(f1, A.F1.hasMpOrMistCost, true)
    f1 = U.setbit(f1, A.F1.canTargetSelf, true)
    f1 = U.setbit(f1, A.F1.canTargetAlly, false)
    f1 = U.setbit(f1, A.F1.canTargetFoe, false)
    memory.writeU32(row + A.ACT.flags1, f1)
    memory.writeU16(row + A.ACT.castAnimOrEventScript, A.EVENT_ANIM_ESPER_APPEAR)
    memory.writeU16(row + A.ACT.summonedPartyMember, ACT.bodySlotFor(s))
    memory.writeU8(row + A.ACT.mpOrMistCost, U.cfg.mistCost[s.rank] or 1)
    memory.writeU8(row + A.ACT.esperRank, s.rank)
    memory.writeU8(row + A.ACT.elements, DATA.ELEMENT_TO_BIT[s.element] or 0)
    memory.writeU16(row + A.ACT.requiredContent, 0)

    local f2 = memory.readU16(row + A.ACT.flags2)
    f2 = U.setbit(f2, A.F2.noLicense, true)
    memory.writeU16(row + A.ACT.flags2, f2)

    -- battle menu placement: Technicks category, ordered like the Ring
    memory.writeU8(row + A.ACT.category, A.MENU_CATEGORY.technicks)
    memory.writeU8(row + A.ACT.gambitPage, 255)
    memory.writeU8(row + A.ACT.gambitPageOrder, 255)

    ACT.slotOf[s.id] = slot
    ACT.summonOfSlot[slot] = s
  end
  U.log("built 51 summon actions in Section 14 slots %d-%d (template %d, %d body slots)",
        first, first + 50, ACT.templateId, #slots)
  return true
end

function ACT.restore()
  if not ACT.section then return end
  for slot, bytes in pairs(ACT.backup) do memory.writeArray(ACT.rowAddr(slot), bytes) end
  ACT.backup = {}
end

return ACT
