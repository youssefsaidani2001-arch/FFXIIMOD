-- summon_system/data.lua
-- Ring of Pacts roster: the 51 summons of Final Fantasy XII: Revenant Wings,
-- adapted for FFXII: The Zodiac Age.
--
-- Fields
--   id        stable key used in saves and config (never rename an id once shipped)
--   name      display name (written through message.convert)
--   element   "fire" | "water" | "thunder" | "earth" | "holy" | "none"
--   group     "melee" | "ranged" | "flying"
--   rank      1 | 2 | 3   (rank 3 = one on the field at a time)
--   boss      true when the pact must be won by defeating the summon first
--   model     ARD/Section 16 model id of the FFXII monster used as the body.
--             -1 = not assigned yet: the template esper model is kept.
--             VERIFY with the Insurgent's Toolkit (Party Member Editor > Model)
--             or the Vanilla ARD Map sheet, then fill in.
--   attack    { name = ..., formula = <Section 14 formula id>, power = n, element = <bit> }
--             The summon's basic attack: only used when spawning as a guest unit
--             (see summoner.lua), because engine espers use their own AI.
--
-- Elements follow the wiki: Water beats Fire, Fire beats Earth, Earth beats
-- Thunder, Thunder beats Water; Holy and None sit outside the cycle.
-- Roster sources (finalfantasy.fandom.com Esper (Revenant Wings), via search
-- snippets, fandom is blocked from this session): see docs/ROSTER.md.

local M = {}

-- Section 14 element bits (offset 0x13)
M.ELEMENT_BIT = {
  none = 0x00, fire = 0x01, lightning = 0x02, ice = 0x04, earth = 0x08,
  water = 0x10, wind = 0x20, holy = 0x40, dark = 0x80,
}
-- RW element -> FFXII element bit
M.ELEMENT_TO_BIT = {
  fire = M.ELEMENT_BIT.fire, water = M.ELEMENT_BIT.water,
  thunder = M.ELEMENT_BIT.lightning, earth = M.ELEMENT_BIT.earth,
  holy = M.ELEMENT_BIT.holy, none = M.ELEMENT_BIT.none,
}

M.ELEMENTS = { "none", "fire", "water", "thunder", "earth", "holy" }
M.GROUPS   = { "melee", "ranged", "flying" }

-- Order matters: it is the Ring of Pacts order and the battle-menu order.
-- Alraune is first and is the starting pact.
M.SUMMONS = {
  -- ===================== NON-ELEMENTAL =====================
  { id = "alraune",      name = "Alraune",      element = "none",    group = "melee",  rank = 1, model = -1 },
  { id = "chocobo",      name = "Chocobo",      element = "none",    group = "melee",  rank = 1, model = -1 },
  { id = "sylph",        name = "Sylph",        element = "none",    group = "ranged", rank = 1, model = -1 },
  { id = "garchimacera", name = "Garchimacera", element = "none",    group = "flying", rank = 1, model = -1 },
  { id = "tonberry",     name = "Tonberry",     element = "none",    group = "melee",  rank = 2, model = -1 },
  { id = "diabolos",     name = "Diabolos",     element = "none",    group = "flying", rank = 2, model = -1 },
  { id = "odin",         name = "Odin",         element = "none",    group = "melee",  rank = 3, model = -1, boss = true },
  { id = "gilgamesh",    name = "Gilgamesh",    element = "none",    group = "melee",  rank = 3, model = -1, boss = true },
  { id = "zalera",       name = "Zalera",       element = "none",    group = "ranged", rank = 3, model = -1, boss = true },
  { id = "zodiark",      name = "Zodiark",      element = "none",    group = "ranged", rank = 3, model = -1, boss = true },
  { id = "bahamut",      name = "Bahamut",      element = "none",    group = "flying", rank = 3, model = -1, boss = true },
  -- ===================== FIRE =====================
  { id = "djinn",        name = "Djinn",        element = "fire",    group = "melee",  rank = 1, model = -1 },
  { id = "salamander",   name = "Salamander",   element = "fire",    group = "ranged", rank = 1, model = -1 },
  { id = "bomb",         name = "Bomb",         element = "fire",    group = "flying", rank = 1, model = -1 },
  { id = "balasa",       name = "Balasa",       element = "fire",    group = "melee",  rank = 2, model = -1 },
  { id = "lamia",        name = "Lamia",        element = "fire",    group = "ranged", rank = 2, model = -1 },
  { id = "wyvern",       name = "Wyvern",       element = "fire",    group = "flying", rank = 2, model = -1 },
  { id = "ifrit",        name = "Ifrit",        element = "fire",    group = "melee",  rank = 3, model = -1 },
  { id = "belias",       name = "Belias",       element = "fire",    group = "ranged", rank = 3, model = -1, boss = true },
  { id = "chaos",        name = "Chaos",        element = "fire",    group = "flying", rank = 3, model = -1, boss = true },
  -- ===================== WATER =====================
  { id = "sahagin",      name = "Sahagin",      element = "water",   group = "melee",  rank = 1, model = -1 },
  { id = "shivan",       name = "Shivan",       element = "water",   group = "ranged", rank = 1, model = -1 },
  { id = "aquarius",     name = "Aquarius",     element = "water",   group = "flying", rank = 1, model = -1 },
  { id = "cuchulainn",   name = "Cuchulainn",   element = "water",   group = "melee",  rank = 2, model = -1, boss = true },
  { id = "shivar",       name = "Shivar",       element = "water",   group = "ranged", rank = 2, model = -1 },
  { id = "siren",        name = "Siren",        element = "water",   group = "flying", rank = 2, model = -1 },
  { id = "leviathan",    name = "Leviathan",    element = "water",   group = "melee",  rank = 3, model = -1 },
  { id = "shiva",        name = "Shiva",        element = "water",   group = "ranged", rank = 3, model = -1 },
  { id = "famfrit",      name = "Famfrit",      element = "water",   group = "ranged", rank = 3, model = -1, boss = true },
  { id = "mateus",       name = "Mateus",       element = "water",   group = "flying", rank = 3, model = -1, boss = true },
  -- ===================== THUNDER =====================
  { id = "remora",       name = "Remora",       element = "thunder", group = "melee",  rank = 1, model = -1 },
  { id = "quetzalcoatl", name = "Quetzalcoatl", element = "thunder", group = "ranged", rank = 1, model = -1 },
  { id = "ramih",        name = "Ramih",        element = "thunder", group = "flying", rank = 1, model = -1 },
  { id = "ixion",        name = "Ixion",        element = "thunder", group = "melee",  rank = 2, model = -1 },
  { id = "sagittarius",  name = "Sagittarius",  element = "thunder", group = "ranged", rank = 2, model = -1 },
  { id = "raiden",       name = "Raiden",       element = "thunder", group = "flying", rank = 2, model = -1 },
  { id = "shemhazai",    name = "Shemhazai",    element = "thunder", group = "melee",  rank = 3, model = -1, boss = true },
  { id = "tiamat",       name = "Tiamat",       element = "thunder", group = "ranged", rank = 3, model = -1 },
  { id = "ramuh",        name = "Ramuh",        element = "thunder", group = "flying", rank = 3, model = -1 },
  -- ===================== EARTH =====================
  { id = "goblin",       name = "Goblin",       element = "earth",   group = "melee",  rank = 1, model = -1 },
  { id = "cactoid",      name = "Cactoid",      element = "earth",   group = "ranged", rank = 1, model = -1 },
  { id = "gnoam",        name = "Gnoam",        element = "earth",   group = "flying", rank = 1, model = -1 },
  { id = "golem",        name = "Golem",        element = "earth",   group = "melee",  rank = 2, model = -1 },
  { id = "cu_sith",      name = "Cu Sith",      element = "earth",   group = "ranged", rank = 2, model = -1 },
  { id = "atomos",       name = "Atomos",       element = "earth",   group = "flying", rank = 2, model = -1 },
  { id = "titan",        name = "Titan",        element = "earth",   group = "melee",  rank = 3, model = -1 },
  { id = "hashmal",      name = "Hashmal",      element = "earth",   group = "ranged", rank = 3, model = -1, boss = true },
  { id = "exodus",       name = "Exodus",       element = "earth",   group = "flying", rank = 3, model = -1, boss = true },
  -- ===================== HOLY (ranged only, as in Revenant Wings) =====================
  { id = "white_hare",   name = "White Hare",   element = "holy",    group = "ranged", rank = 1, model = -1 },
  { id = "carbuncle",    name = "Carbuncle",    element = "holy",    group = "ranged", rank = 2, model = -1 },
  { id = "ultima",       name = "Ultima",       element = "holy",    group = "ranged", rank = 3, model = -1, boss = true },
}

-- index helpers
M.BY_ID = {}
for i, s in ipairs(M.SUMMONS) do
  s.index = i
  M.BY_ID[s.id] = s
end

assert(#M.SUMMONS == 51, "Ring of Pacts must hold exactly 51 summons, got " .. #M.SUMMONS)

-- Ring of Pacts prerequisites: a pact of rank N in an element needs at least
-- one rank N-1 pact of the same element (any group). Alraune is always open.
function M.prerequisitesMet(summon, isUnlocked)
  if summon.rank == 1 then return true end
  for _, other in ipairs(M.SUMMONS) do
    if other.element == summon.element and other.rank == summon.rank - 1 and isUnlocked(other.id) then
      return true
    end
  end
  return false
end

return M
