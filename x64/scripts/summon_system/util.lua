-- summon_system/util.lua  -- logging, config loading, bit helpers, safe calls.
local U = {}

U.TAG = "SS"
U.cfg = nil

local function tostr(v)
  if type(v) == "number" then return string.format("%s (0x%X)", tostring(v), v) end
  return tostring(v)
end

function U.log(fmt, ...)
  local ok, s = pcall(string.format, fmt, ...)
  print(U.TAG .. ": " .. (ok and s or (fmt .. " <format error>")))
end

function U.dbg(fmt, ...)
  if U.cfg and U.cfg.debug then
    local ok, s = pcall(string.format, fmt, ...)
    s = ok and s or fmt
    print(U.TAG .. " [dbg]: " .. s)
    if U.cfg.debugOnScreen and message then
      message.print(message.convert(U.TAG .. ": " .. s), 1500)
    end
  end
end

function U.say(text, ms)
  if message then message.print(message.convert(text), ms or 2500) end
end

-- Load a Lua config file in a sandbox that still sees the globals (like Xeavin's scripts).
function U.loadLuaConfig(path)
  local env = setmetatable({}, { __index = _G })
  local chunk, err = loadfile(path, "t", env)
  if not chunk then return nil, err end
  local ok, res = pcall(chunk)
  if not ok then return nil, res end
  return res
end

-- Deep merge defaults into a user table (user wins).
function U.merge(defaults, user)
  if type(user) ~= "table" then return defaults end
  for k, v in pairs(defaults) do
    if user[k] == nil then
      user[k] = v
    elseif type(v) == "table" and type(user[k]) == "table" then
      U.merge(v, user[k])
    end
  end
  return user
end

function U.bit(v, b) return (v >> b) & 1 == 1 end
function U.setbit(v, b, on)
  if on then return v | (1 << b) else return v & ~(1 << b) end
end

-- Read a qword pointer; returns 0 when unmapped.
function U.ptr(addr)
  local v = memory.readU64(addr)
  if not v or v == 0 then return 0 end
  return v
end

-- st2e header helpers (offset 4 = count, 8 = entry size (u16), 0xC = list ptr (u32 abs))
function U.st2e(base)
  if base == 0 then return nil end
  local magic = memory.readString(base, 4)
  if magic ~= "st2e" then return nil end
  return {
    base = base,
    count = memory.readU32(base + 4),
    entrySize = memory.readU16(base + 8),
    list = memory.readU32(base + 0xC),
  }
end

function U.tryExecute(addr, retType, types, args)
  local ok, res = pcall(memory.execute, addr, retType, types or {}, args or {})
  if not ok then U.log("execute 0x%X failed: %s", addr, tostring(res)) return nil end
  return res
end

function U.keys(t) local r = {} for k in pairs(t) do r[#r+1] = k end table.sort(r) return r end

return U
