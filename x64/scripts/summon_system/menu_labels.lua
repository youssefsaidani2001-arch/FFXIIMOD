-- summon_system/menu_labels.lua
-- Renames the battle-menu categories ("Magicks", "Technicks") in place.
-- The label text is searched, in the game's own text encoding produced by
-- message.convert, inside the loaded Menu Resource Pack sections and replaced
-- by the configured names (same length or shorter, padded with the encoding's
-- space glyph). Nothing is written unless the original text is found.
local U = require("summon_system.util")
local A = require("summon_system.addresses")

local L = {}
L.patched = {}   -- original -> { addr = ..., bytes = ... }

local function bytesToString(t)
  if #t == 0 then return "" end
  local parts = {}
  for i = 1, #t, 4000 do
    parts[#parts + 1] = string.char(table.unpack(t, i, math.min(i + 3999, #t)))
  end
  return table.concat(parts)
end

local function stripNul(s) return (s:gsub("%z+$", "")) end

-- Scan [start, start+size) for `needle`; returns absolute address or nil.
local function scan(start, size, needle)
  local CH = 0x10000
  local carry = ""
  local pos = start
  while pos < start + size do
    local n = math.min(CH, start + size - pos)
    local chunk = bytesToString(memory.readArray(pos, n))
    if #chunk == 0 then return nil end -- unmapped
    local hay = carry .. chunk
    local i = hay:find(needle, 1, true)
    if i then return pos - #carry + i - 1 end
    carry = hay:sub(-(#needle - 1))
    pos = pos + n
  end
  return nil
end

local function regions()
  local r = {}
  for id = 0, 22 do
    local base = U.ptr(A.MRP_SECTIONS + id * 8)
    if base ~= 0 then r[#r + 1] = { base, U.cfg.labelScanBytes } end
  end
  return r
end

function L.rename(original, replacement)
  if not replacement or replacement == original then return false end
  local encOld = stripNul(message.convert(original))
  local encNew = stripNul(message.convert(replacement))
  if #encNew > #encOld then
    U.log("label '%s' -> '%s' is longer than the original in game encoding (%d > %d); skipped",
      original, replacement, #encNew, #encOld)
    return false
  end
  local pad = stripNul(message.convert(" "))
  while #encNew < #encOld do encNew = encNew .. pad:sub(1, math.min(#pad, #encOld - #encNew)) end
  local hits = 0
  for _, reg in ipairs(regions()) do
    local from, size = reg[1], reg[2]
    local addr = scan(from, size, encOld)
    while addr do
      local bytes = {}
      for i = 1, #encNew do bytes[i] = encNew:byte(i) end
      memory.writeArray(addr, bytes)
      L.patched[#L.patched + 1] = { addr = addr, bytes = { encOld:byte(1, -1) } }
      hits = hits + 1
      addr = scan(addr + #encOld, size - (addr + #encOld - from), encOld)
    end
  end
  if hits == 0 then U.log("label '%s' not found in menu packs; VERIFY labelScanBytes / regions", original)
  else U.dbg("label '%s' -> '%s' patched at %d place(s)", original, replacement, hits) end
  return hits > 0
end

function L.apply()
  local labels = U.cfg.menuLabels or {}
  L.rename("Magicks", labels.magicks)
  L.rename("Technicks", labels.technicks)
end

function L.restore()
  for _, p in ipairs(L.patched) do memory.writeArray(p.addr, p.bytes) end
  L.patched = {}
end

return L
