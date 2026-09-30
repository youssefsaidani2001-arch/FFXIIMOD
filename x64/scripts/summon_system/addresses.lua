-- summon_system/addresses.lua
-- Every game address used by the mod, in one place.
-- All values are for FFXII: The Zodiac Age, Steam 1.0.4.0 (x64, base 0x120000,
-- no ASLR) and were taken from "The Insurgent's Toolkit" (Xeavin) as documented
-- in INSURGENTS_TOOLKIT_REFERENCE.md. Rows marked VERIFY have not been run by
-- this mod yet: confirm them once with Cheat Engine before trusting them.

local A = {}

-- ---------------------------------------------------------------- globals
A.BATTLEPACK_PTR          = 0x0208E680  -- qword -> battlepack.bin base
A.SECTION14_ACTIONS_PTR   = 0x02EBF138  -- qword -> Section 14 (Actions) st2e base
A.SECTION16_PARTY_PTR     = 0x02EBF130  -- qword -> Section 16 (Party Members) base
A.SECTION12_LICENSES_PTR  = 0x02EBF038
A.ACTION_LIST_CATEGORIES  = 0x0208CD20  -- 26 categories: {actionsPtr(8), count(4)...}
A.MRP_SECTIONS            = 0x0209AC60  -- [MRP_SECTIONS + id*8], 23 menu resource packs
A.GLOBAL_MESSAGE          = 0x02AEE888  -- global message table (VERIFY layout)
A.GAME_LANGUAGE           = 0x01F82D20  -- read by message.convert auto-detect

-- ---------------------------------------------------------------- battle
A.BATTLE_SCRIPT_KEEP      = 0x02098E10  -- 5 entries, stride 0x288; +0x08 actor list
A.BATTLE_KEEP_STRIDE      = 0x288
A.PARTY_LEADER_ACTOR_ID   = 0x022C7FE0  -- word
A.CURRENT_TARGET_ACTOR_ID = 0x022C8380  -- word
A.BATTLE_UNIT_WORK_COUNT  = 0x0208E6A0
A.ACTIVE_PARTY_COUNT      = 0x0209AC30 + 0xB2A  -- byte
A.MODE_FLAGS              = 0x021B8410  -- bit0 = esper summoned, bit1 = chocobo
A.ACTIVE_MENU_ID          = 0x02092730  -- non-zero = a menu is open
A.AUTO_PAUSE_MENU_PTR     = 0x01FD4948
A.PLAYER_CHARACTER_LIST   = 0x0209A1F0  -- 4 x Battle Actor Work pointers

-- Special Action Processing (esper / quickening resolution block)
A.SAP_CASTER_KEEP_PTR     = 0x022C1F50
A.SAP_ACTION_TYPE         = 0x022C215C
A.SAP_CURRENT_ACTION      = 0x022C2190  -- word: action id being resolved

-- ---------------------------------------------------------------- code
-- Battle menu reads the selected action id here; the toolkit's "Custom Battle
-- Menu Action" overwrites the id at this exact instruction. We only observe it.
A.CODE_BATTLE_MENU_ACTION_READ = 0x00305AE4  -- VERIFY register (see summoner.lua)
-- "can this action be cast" gate (test eax,eax). eax==0 => allowed. VERIFY.
A.CODE_ACTION_CAST_CHECK       = 0x002FFC81

-- ---------------------------------------------------------------- functions
A.FN_GET_UNIT_KEEP_BY_MEMBER   = 0x00320A40  -- ecx = party member id -> Battle Unit Keep*
A.FN_GET_UNIT_WORK_BY_INDEX    = 0x00321170
A.FN_GET_ACTOR_WORK            = 0x00358940  -- rcx = keep, edx = actor id
A.FN_SET_LEVEL_RECOMPUTE       = 0x0030C470
A.FN_HEAL_ALL                  = 0x0030F4B0  -- edx flags, 0x0F = full
A.FN_PARTY_ALL_READ            = 0x0037C980  -- refresh appearance / party state
A.FN_GET_SUMMONER              = 0x003137F0
A.FN_DISMISS_ESPER             = 0x003138D0
A.FN_CLEAR_ESPER               = 0x00313550
A.FN_ADD_PARTY_MEMBER          = 0x003172E0  -- VERIFY signature (used by PermanentAllies)
A.FN_ADD_GUEST_BATTLE_MEMBER   = 0x003170E0  -- VERIFY signature
A.FN_REMOVE_PARTY_MEMBER       = 0x00328B20
A.FN_REMOVE_GUEST_BATTLE_MEMBER= 0x003288F0
A.FN_MODIFY_INVENTORY          = 0x003008A0
A.FN_PLAY_SOUND                = 0x001DBDB0
A.FN_REFRESH_GAMBITS           = 0x00327CB0

-- ---------------------------------------------------------------- Section 14 layout (0x3C per action)
A.ACTION_SIZE = 0x3C
A.ACT = {
  battleMenuDescription = 0x00, -- u16
  knockbackChance       = 0x04, -- u8
  range                 = 0x05, -- u8 (/10)
  aoeSize               = 0x06, -- u8
  formula               = 0x08, -- u8
  chargeTime            = 0x09, -- u8
  mpOrMistCost          = 0x0A, -- u8
  esperRank             = 0x0B, -- u8
  flags1                = 0x0C, -- u32
  power                 = 0x10, -- u8
  powerMultiplier       = 0x11, -- u8
  accuracy              = 0x12, -- u8
  elements              = 0x13, -- u8 bitfield
  onHitRate             = 0x14, -- u8
  statusEffects         = 0x18, -- u32
  characterAnimation    = 0x1C, -- u8
  category              = 0x1E, -- u8  Battle Menu Assignment (VERIFY enum below)
  chargeAura            = 0x21, -- u8
  requiredContent       = 0x22, -- u16 (license / item that unlocks the action)
  castAnimOrEventScript = 0x24, -- u16 (event script when flags1 bit30 set)
  summonedPartyMember   = 0x26, -- u16 -> Section 16 index
  mistCastAnimation     = 0x28, -- u16
  flags2                = 0x2C, -- u16
  inventoryDescription  = 0x2E, -- u16
  name                  = 0x34, -- u16 text id
  flags3                = 0x36, -- u16
  gambitPage            = 0x38, -- u8
  gambitPageOrder       = 0x39, -- u8
}
-- flags1 bits
A.F1 = {
  canTargetSelf = 0, reflectToParty = 1, canTargetAlly = 2, canTargetFoe = 3,
  initialTargetShift = 5, isPositive = 11, noAoeIndicators = 12,
  allowMagickImmunity = 13, allowPhysicalImmunity = 14, allowReflect = 16,
  allowMagickEvade = 17, denyWhileSilenced = 19, aoeOrigin = 21,
  useWeaponRange = 26, useWeaponChargeTime = 27, canTargetReserve = 28,
  hasMpOrMistCost = 29, useEventScript = 30, hasCountableRequiredContent = 31,
}
-- flags2 bits
A.F2 = { magicksCategoryMask = 0x7, noLicense = 13, isOffensive = 14 }
-- Battle Menu Assignment values, from the Section 14 sheet ("Magicks"): VERIFY
-- exact numbering with one vanilla Technick row (e.g. Steal) before relying on it.
A.MENU_CATEGORY = { attack = 0, magicks = 1, technicks = 2, mist = 3, items = 4 }

-- Mist "event script" animation ids (Section 14 +0x24 with useEventScript):
--   40 = esper appear (works for any esper), 41 = ultimate, 42 = dismiss,
--   then +3 per esper: Mateus 43.., Adrammelech 46.., Hashmal 49.., Cuchulainn 52..
A.EVENT_ANIM_ESPER_APPEAR  = 40
A.EVENT_ANIM_ESPER_DISMISS = 42

-- ---------------------------------------------------------------- Section 16 layout (0x7C+ per member)
A.MEMBER_SIZE = 0x80  -- VERIFY: doc says 0x7C+; bpack.section16.itemSize is authoritative
A.MEM = {
  equipWeapon = 0x0A, equipOffhand = 0x0C, equipHelm = 0x0E, equipArmor = 0x10, equipAccessory = 0x12,
  gambitSet = 0x14, maxHp = 0x16, maxMp = 0x1A, strength = 0x1E, magickPower = 0x21,
  vitality = 0x24, speed = 0x27, evade = 0x2A, level = 0x2E, name = 0x30, summonTime = 0x32,
  statusEffects = 0x48, statusImmunities = 0x4C, augments = 0x50, model = 0x70, weight = 0x7A,
}

-- ---------------------------------------------------------------- Battle Unit Keep (live character sheet)
A.KEEP = {
  identifier = 0x04, type = 0x05, mistCharges = 0x06, maxHp = 0x24, maxMp = 0x28,
  maxMistBars = 0x37, currentHp = 0x48, currentMp = 0x4C, currentMistBars = 0x4E,
  level = 0x1C2,
}

return A
