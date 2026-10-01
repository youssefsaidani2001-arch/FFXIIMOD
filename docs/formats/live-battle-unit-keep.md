# Battle Unit Keep (live party member / unit sheet) — memory-only

Spec id: `live-battle-unit-keep` · machine spec: [`live-battle-unit-keep.json`](./live-battle-unit-keep.json)

> **MEMORY-ONLY (runtime).** This structure exists only in the running game process; there is no game file to patch for it. Edit it live (Lua Loader `memory`/`save` tables, Cheat Engine) or change the file data it is built from.

## What this is

The **Battle Unit Keep** is the live character sheet of one unit: HP/MP, stats, equipment, statuses,
augments, EXP/LP, the obtained-license bitfield, level and jobs. For the playable cast and guests/espers
there is one keep per party-member id (0-39), stored inside the live **Battle** block of the save data, so
whatever is written here is persisted by the next save (TK L759, L774). Foes get their own keeps, reached
through their Battle Unit Work (see `live-battle-actor-chain`).

| Item | Value | Source |
|---|---|---|
| Party keep array | `[0x02EBF190] + 0x08 + id * 0x1C8`, id 0-39 | Drive getBattleUnitKeep.lua (array helper):2-8; Drive SecondAccessory.lua:265-272 |
| Game helper | `0x00320A40` (ecx = party member id) returns the keep pointer (or 0) | TK L464; Drive TheInsurgentsManifesto.lua:911 |
| From a unit | Battle Unit Work +0x698 -> keep, +0x6A0 -> keep plus | TK L352-L356; Drive getBattleUnitWork.lua:60-63 |
| Active party | `u16 [0x02EBF190] + 0x5A5A + slot*2`, slot 0-3, = party member id of the 4 battle slots | Drive getActivePartyMember.lua:2-9 |
| Toolkit size | the Toolkit labels the group 464 bytes (0x1D0); the party array stride is 0x1C8 and no field past 0x1C5 is known | TK L698 vs Drive getBattleUnitKeep.lua (array helper):7 |

There is no file behind this structure. Defaults come from battlepack section 16 (party members,
`battlepack-s16-party-members`) and ARD stats for foes; the game copies/derives them into the keep when a
member joins, levels up or is reset (game functions: set level 0x0030C470, heal 0x0030F4B0, set equipment
0x0031A630, unlock license 0x00323910, set permanent augments 0x0030FED0; TK L464-L476).

## Editing rules (live)

* Change values, not structure. Recompute dependent values the way the game does: after editing equipment,
  augments or base stats call the game's refresh (Party Member Editor "Refresh Stats" = 0x0030F4B0 with
  flags 0x0F, TK L544) or the derived `maxHp`/`strength`... fields will be overwritten on the next refresh.
* `currentHp <= maxHp`, `currentMp <= maxMp`, `currentMistBars <= maxMistBars` (game invariants; not
  documented but implied by the field pairs).
* Licenses: setting a bit only marks the node as owned; the stat/augment/equipment effect of the node is
  applied by the game's unlock routine 0x00323910 (keep, node, flags...) used by the Toolkit's job reset
  (Drive TheInsurgentsManifesto.lua:1062-1067). Clearing bits does not refund LP by itself.
* Gambit slots: `gambitSlotCount` is recomputed from the gambit-slot augment bits, so edit the augment bits
  (bits 104-113) rather than the count, or both.
* Jobs: write 0xFF to unset; the job reset writes 0xFFFF to job1/job2 and 0xFF to selectedJob (TK L541).

## Record layouts

All multi-byte values are little-endian. Offsets are relative to the start of the record. Rows typed `bytes` and named `unknown…` are not interpreted by any source; keep their original bytes. Overlapping rows are alternative views of the same bytes (the note says which applies).

### Record `battleUnitKeep` — 456 bytes (0x1C8), count: 40 for party members (PartyMemberList 0-39); foes: one per spawned unit

*Where:* Party members: [0x02EBF190] + 0x08 + partyMemberId*0x1C8 (40 records, ids 0-39, inside the live Battle block of the save data; game helper 0x00320A40 returns the same pointer for an id). Any unit (party or foe): Battle Unit Work +0x698 holds a pointer to its keep.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 4 | bytes | `unknown00` | Not identified by any source; keep the original bytes. |  |  |
| 0x04 | 1 | u8 | `identifier` | Party member / unit index. For party members it is the PartyMemberList id (0-39); the job reset code uses it as the character index when testing the per-character default-license bits (only ids 0-6 have them). | `PartyMemberList` | TK L740; Drive TheInsurgentsManifesto.lua:1034-1046 |
| 0x05 | 1 | u8 | `type` | 0 = party member. The Toolkit refuses to bind its Battle Unit Keep view when this is 0 and Kill Nearby Foes skips such units. Other values are foes/others (1 = foe assumed from CharacterTypeList). | `CharacterTypeList` | TK L400, L645, L740 |
| 0x06 | 2 | s16 | `mistCharges` | Mist Charges. |  | TK L741; Drive getBattleUnitKeep.lua:3-133 |
| 0x08 | 2 | s16 | `additiveStrength` | VIEW B (presumably foes): additive Strength. |  | TK L742; Drive getBattleUnitKeep.lua:3-133 |
| 0x08 | 4 | s32 | `defaultMaxHp` | VIEW A (party members): base Max HP before equipment. Overlaps additiveStrength/additiveMagickPower. |  | Drive getBattleUnitKeep.lua:3-133 |
| 0x0A | 2 | s16 | `additiveMagickPower` | VIEW B: additive Magick Power. |  | TK L742; Drive getBattleUnitKeep.lua:3-133 |
| 0x0C | 2 | s16 | `additiveVitality` | VIEW B: additive Vitality. |  | TK L742; Drive getBattleUnitKeep.lua:3-133 |
| 0x0C | 2 | s16 | `defaultMaxMp` | VIEW A: base Max MP. Overlaps additiveVitality. |  | Drive getBattleUnitKeep.lua:3-133 |
| 0x0E | 2 | s16 | `additiveSpeed` | VIEW B: additive Speed. |  | TK L742; Drive getBattleUnitKeep.lua:3-133 |
| 0x10 | 2 | s16 | `additiveAttackPower` | VIEW B: additive Attack Power. |  | TK L742; Drive getBattleUnitKeep.lua:3-133 |
| 0x10 | 4 | f32 | `defaultStrength` | VIEW A: base Strength as a float (fractional growth). Overlaps additiveAttackPower/additiveDefense. |  | Drive getBattleUnitKeep.lua:3-133 |
| 0x12 | 2 | s16 | `additiveDefense` | VIEW B: additive Defense. |  | TK L742; Drive getBattleUnitKeep.lua:3-133 |
| 0x14 | 2 | s16 | `additiveMagickResist` | VIEW B: additive Magick Resist. |  | TK L742; Drive getBattleUnitKeep.lua:3-133 |
| 0x14 | 4 | f32 | `defaultMagickPower` | VIEW A: base Magick Power (float). |  | Drive getBattleUnitKeep.lua:3-133 |
| 0x16 | 2 | s16 | `additiveEvadeParry` | VIEW B: additive Evade (Parry). |  | TK L742; Drive getBattleUnitKeep.lua:3-133 |
| 0x18 | 2 | s16 | `additiveEvadeWeapon` | VIEW B: additive Evade (Weapon). |  | TK L742; Drive getBattleUnitKeep.lua:3-133 |
| 0x18 | 4 | f32 | `defaultVitality` | VIEW A: base Vitality (float). |  | Drive getBattleUnitKeep.lua:3-133 |
| 0x1A | 2 | s16 | `additiveEvadeShield` | VIEW B: additive Evade (Shield). |  | TK L742; Drive getBattleUnitKeep.lua:3-133 |
| 0x1C | 2 | s16 | `additiveMagickEvadeShield` | VIEW B: additive Magick Evade (Shield). |  | TK L742; Drive getBattleUnitKeep.lua:3-133 |
| 0x1C | 4 | f32 | `defaultSpeed` | VIEW A: base Speed (float). |  | Drive getBattleUnitKeep.lua:3-133 |
| 0x1E | 2 | s16 | `additiveEvadeTotal` | VIEW B: additive Evade (Total). |  | TK L742; Drive getBattleUnitKeep.lua:3-133 |
| 0x20 | 2 | s16 | `additiveMagickEvadeTotal` | VIEW B: additive Magick Evade (Total). |  | TK L742; Drive getBattleUnitKeep.lua:3-133 |
| 0x20 | 1 | u8 | `defaultMaxMistBars` | VIEW A: base max Mist bars. The job-reset code zeroes this byte together with maxMistBars and currentMistBars, which is why view A is taken to be the party-member view. |  | Drive getBattleUnitKeep.lua:3-133; Drive TheInsurgentsManifesto.lua:953-956 |
| 0x22 | 2 | bytes | `unknown22` | Not identified by any source; keep the original bytes. |  |  |
| 0x24 | 4 | s32 | `maxHp` | Current Max HP (after equipment/augments). |  | TK L743; Drive getBattleUnitKeep.lua:3-133 |
| 0x28 | 2 | s16 | `maxMp` | Current Max MP. |  | TK L743; Drive getBattleUnitKeep.lua:3-133 |
| 0x2A | 1 | u8 | `strength` | Strength. |  | TK L743; Drive getBattleUnitKeep.lua:3-133 |
| 0x2B | 1 | u8 | `magickPower` | Magick Power. |  | Drive getBattleUnitKeep.lua:3-133 |
| 0x2C | 1 | u8 | `vitality` | Vitality. |  | Drive getBattleUnitKeep.lua:3-133 |
| 0x2D | 1 | u8 | `speed` | Speed. |  | Drive getBattleUnitKeep.lua:3-133 |
| 0x2E | 1 | u8 | `attackPower` | Attack Power. |  | Drive getBattleUnitKeep.lua:3-133 |
| 0x2F | 1 | u8 | `defense` | Defense. |  | Drive getBattleUnitKeep.lua:3-133 |
| 0x30 | 1 | u8 | `magickResist` | Magick Resist. |  | Drive getBattleUnitKeep.lua:3-133 |
| 0x31 | 1 | u8 | `evadeParry` | Evade (Parry). |  | Drive getBattleUnitKeep.lua:3-133 |
| 0x32 | 1 | u8 | `evadeWeapon` | Evade (Weapon). |  | Drive getBattleUnitKeep.lua:3-133 |
| 0x33 | 1 | u8 | `evadeShield` | Evade (Shield). |  | Drive getBattleUnitKeep.lua:3-133 |
| 0x34 | 1 | u8 | `magickEvadeShield` | Magick Evade (Shield). |  | Drive getBattleUnitKeep.lua:3-133 |
| 0x35 | 1 | u8 | `evadeTotal` | Evade (Total). |  | Drive getBattleUnitKeep.lua:3-133 |
| 0x36 | 1 | u8 | `magickEvadeTotal` | Magick Evade (Total). |  | Drive getBattleUnitKeep.lua:3-133 |
| 0x37 | 1 | u8 | `maxMistBars` | Max Mist bars (zeroed by the job reset). |  | TK L743; Drive getBattleUnitKeep.lua:3-133 |
| 0x38 | 4 | bf32 | `permanentStatusEffectImmunities` | Permanent status-effect immunities. | bits below | Drive getBattleUnitKeep.lua:3-133; TK L747 |
| 0x3C | 4 | bf32 | `permanentStatusEffects` | Permanent status effects (e.g. auto-statuses from equipment). | bits below | Drive getBattleUnitKeep.lua:3-133; TK L747 |
| 0x40 | 1 | bf8 | `permanentElementalWeak` | Permanent elemental affinities - Weak. | bits below | Drive getElementalAffinities.lua:2-8; Drive getBattleUnitKeep.lua:3-133 |
| 0x41 | 1 | bf8 | `permanentElementalAbsorb` | Permanent elemental affinities - Absorb. | bits below | Drive getElementalAffinities.lua:2-8 |
| 0x42 | 1 | bf8 | `permanentElementalHalf` | Permanent elemental affinities - Half. | bits below | Drive getElementalAffinities.lua:2-8 |
| 0x43 | 1 | bf8 | `permanentElementalImmune` | Permanent elemental affinities - Immune. | bits below | Drive getElementalAffinities.lua:2-8 |
| 0x44 | 1 | bf8 | `permanentElementalPotency` | Permanent elemental affinities - Potency (boost). | bits below | Drive getElementalAffinities.lua:2-8 |
| 0x45 | 3 | bytes | `unknown45` | Not identified by any source; keep the original bytes. |  |  |
| 0x48 | 4 | s32 | `currentHp` | Current HP. |  | TK L744; Drive getBattleUnitKeep.lua:3-133 |
| 0x4C | 2 | s16 | `currentMp` | Current MP. |  | TK L744; Drive getBattleUnitKeep.lua:3-133 |
| 0x4E | 1 | u8 | `currentMistBars` | Current Mist bars. |  | TK L744; Drive getBattleUnitKeep.lua:3-133 |
| 0x4F | 1 | bytes | `unknown4F` | Not identified by any source; keep the original bytes. |  |  |
| 0x50 | 2 | u16 | `weapon` | Equipped weapon. | `BpEquipmentList` | TK L745; Drive getBattleUnitKeep.lua:3-133 |
| 0x52 | 2 | u16 | `offhand` | Equipped off-hand (shield / ammunition). | `BpEquipmentList` | Drive getBattleUnitKeep.lua:3-133 |
| 0x54 | 2 | u16 | `helm` | Equipped helm. | `BpEquipmentList` | Drive getBattleUnitKeep.lua:3-133 |
| 0x56 | 2 | u16 | `armor` | Equipped armour. | `BpEquipmentList` | Drive getBattleUnitKeep.lua:3-133 |
| 0x58 | 2 | u16 | `accessory` | Equipped accessory. | `BpEquipmentList` | Drive getBattleUnitKeep.lua:3-133 |
| 0x5A | 2 | u16 | `seizedWeapon` | Weapon slot as it was before a "seize" state (same shape as the equipment block). | `BpEquipmentList` | TK L746; Drive getBattleUnitKeep.lua:3-133 |
| 0x5C | 2 | u16 | `seizedOffhand` | Seized off-hand. | `BpEquipmentList` | Drive getBattleUnitKeep.lua:3-133 |
| 0x5E | 2 | u16 | `seizedHelm` | Seized helm. | `BpEquipmentList` | Drive getBattleUnitKeep.lua:3-133 |
| 0x60 | 2 | u16 | `seizedArmor` | Seized armour. | `BpEquipmentList` | Drive getBattleUnitKeep.lua:3-133 |
| 0x62 | 2 | u16 | `seizedAccessory` | Seized accessory. | `BpEquipmentList` | Drive getBattleUnitKeep.lua:3-133 |
| 0x64 | 4 | bf32 | `temporaryStatusEffects` | Temporary status effects (the ones with durations below). | bits below | Drive getBattleUnitKeep.lua:3-133; TK L747 |
| 0x68 | 8 | bf64 | `temporaryAugmentsLow` | Temporary augments (128-bit set). The job reset zeroes 0x20 bytes from here (temporary + permanent sets) after re-applying augment set 0x97; gambit-slot bits are read as the u16 at keep+0x75. Bits 0-63 (augment ids 0-63; same order as battlepack section 58 / BpAugmentList). | bits below | Drive getAugments.lua:2-130; Drive getBattleUnitKeep.lua:3-133; Drive TheInsurgentsManifesto.lua:943-951; TK L748-L749 |
| 0x70 | 8 | bf64 | `temporaryAugmentsHigh` | Temporary augments (128-bit set). The job reset zeroes 0x20 bytes from here (temporary + permanent sets) after re-applying augment set 0x97; gambit-slot bits are read as the u16 at keep+0x75. Bits 64-127 (augment ids 64-127); bits 104-113 (= bits 40-49 here) are the ten "Gambit Slot" augments, bit 114 Essentials. | bits below | Drive getAugments.lua:2-130; Drive getBattleUnitKeep.lua:3-133; Drive TheInsurgentsManifesto.lua:943-951; TK L748-L749 |
| 0x78 | 8 | bf64 | `permanentAugmentsLow` | Permanent augments (128-bit set, from licenses/equipment). Gambit-slot bits are read as the u16 at keep+0x85. Bits 0-63 (augment ids 0-63; same order as battlepack section 58 / BpAugmentList). | bits below | Drive getAugments.lua:2-130; Drive getBattleUnitKeep.lua:3-133; TK L749 |
| 0x80 | 8 | bf64 | `permanentAugmentsHigh` | Permanent augments (128-bit set, from licenses/equipment). Gambit-slot bits are read as the u16 at keep+0x85. Bits 64-127 (augment ids 64-127); bits 104-113 (= bits 40-49 here) are the ten "Gambit Slot" augments, bit 114 Essentials. | bits below | Drive getAugments.lua:2-130; Drive getBattleUnitKeep.lua:3-133; TK L749 |
| 0x88 | 1 | u8 | `defaultLevel` | Default level. |  | TK L750; Drive getBattleUnitKeep.lua:3-133 |
| 0x89 | 49 | bytes | `unknown89` | Not identified by any source; keep the original bytes. |  |  |
| 0xBA | 1 | u8 | `gambitSlotCount` | Number of usable gambit slots. The game recomputes it as max(2, base) + popcount((u16 @0x75 \| u16 @0x85) & 0x3FF), capped at 12. |  | Drive TheInsurgentsManifesto.lua:1944-1973; TK L543, L1738 |
| 0xBB | 1 | bytes | `unknownBB` | Not identified by any source; keep the original bytes. |  |  |
| 0xBC | 4 | s32 | `durationKo` | Remaining duration of temporary status 0 (ko); unit not stated. |  | Drive getStatusEffectDurations.lua:2-40; Drive getBattleUnitKeep.lua:3-133 |
| 0xC0 | 4 | s32 | `durationStone` | Remaining duration of temporary status 1 (stone); unit not stated. |  |  |
| 0xC4 | 4 | s32 | `durationPetrify` | Remaining duration of temporary status 2 (petrify); unit not stated. |  |  |
| 0xC8 | 4 | s32 | `durationStop` | Remaining duration of temporary status 3 (stop); unit not stated. |  |  |
| 0xCC | 4 | s32 | `durationSleep` | Remaining duration of temporary status 4 (sleep); unit not stated. |  |  |
| 0xD0 | 4 | s32 | `durationConfuse` | Remaining duration of temporary status 5 (confuse); unit not stated. |  |  |
| 0xD4 | 4 | s32 | `durationDoom` | Remaining duration of temporary status 6 (doom); unit not stated. |  |  |
| 0xD8 | 4 | s32 | `durationBlind` | Remaining duration of temporary status 7 (blind); unit not stated. |  |  |
| 0xDC | 4 | s32 | `durationPoison` | Remaining duration of temporary status 8 (poison); unit not stated. |  |  |
| 0xE0 | 4 | s32 | `durationSilence` | Remaining duration of temporary status 9 (silence); unit not stated. |  |  |
| 0xE4 | 4 | s32 | `durationSap` | Remaining duration of temporary status 10 (sap); unit not stated. |  |  |
| 0xE8 | 4 | s32 | `durationOil` | Remaining duration of temporary status 11 (oil); unit not stated. |  |  |
| 0xEC | 4 | s32 | `durationReverse` | Remaining duration of temporary status 12 (reverse); unit not stated. |  |  |
| 0xF0 | 4 | s32 | `durationDisable` | Remaining duration of temporary status 13 (disable); unit not stated. |  |  |
| 0xF4 | 4 | s32 | `durationImmobilize` | Remaining duration of temporary status 14 (immobilize); unit not stated. |  |  |
| 0xF8 | 4 | s32 | `durationSlow` | Remaining duration of temporary status 15 (slow); unit not stated. |  |  |
| 0xFC | 4 | s32 | `durationDisease` | Remaining duration of temporary status 16 (disease); unit not stated. |  |  |
| 0x100 | 4 | s32 | `durationLure` | Remaining duration of temporary status 17 (lure); unit not stated. |  |  |
| 0x104 | 4 | s32 | `durationProtect` | Remaining duration of temporary status 18 (protect); unit not stated. |  |  |
| 0x108 | 4 | s32 | `durationShell` | Remaining duration of temporary status 19 (shell); unit not stated. |  |  |
| 0x10C | 4 | s32 | `durationHaste` | Remaining duration of temporary status 20 (haste); unit not stated. |  |  |
| 0x110 | 4 | s32 | `durationBravery` | Remaining duration of temporary status 21 (bravery); unit not stated. |  |  |
| 0x114 | 4 | s32 | `durationFaith` | Remaining duration of temporary status 22 (faith); unit not stated. |  |  |
| 0x118 | 4 | s32 | `durationReflect` | Remaining duration of temporary status 23 (reflect); unit not stated. |  |  |
| 0x11C | 4 | s32 | `durationInvisible` | Remaining duration of temporary status 24 (invisible); unit not stated. |  |  |
| 0x120 | 4 | s32 | `durationRegen` | Remaining duration of temporary status 25 (regen); unit not stated. |  |  |
| 0x124 | 4 | s32 | `durationFloat` | Remaining duration of temporary status 26 (float); unit not stated. |  |  |
| 0x128 | 4 | s32 | `durationBerserk` | Remaining duration of temporary status 27 (berserk); unit not stated. |  |  |
| 0x12C | 4 | s32 | `durationBubble` | Remaining duration of temporary status 28 (bubble); unit not stated. |  |  |
| 0x130 | 4 | s32 | `durationHpCritical` | Remaining duration of temporary status 29 (hpCritical); unit not stated. |  |  |
| 0x134 | 4 | s32 | `durationLibra` | Remaining duration of temporary status 30 (libra); unit not stated. |  |  |
| 0x138 | 4 | s32 | `durationXZone` | Remaining duration of temporary status 31 (xZone); unit not stated. |  |  |
| 0x13C | 2 | s16 | `tickDurationKo` | Tick timer of status 0 (ko) (e.g. poison/regen ticks); unit not stated. |  | Drive getStatusEffectTickDurations.lua:2-40; Drive getBattleUnitKeep.lua:3-133 |
| 0x13E | 2 | s16 | `tickDurationStone` | Tick timer of status 1 (stone) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x140 | 2 | s16 | `tickDurationPetrify` | Tick timer of status 2 (petrify) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x142 | 2 | s16 | `tickDurationStop` | Tick timer of status 3 (stop) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x144 | 2 | s16 | `tickDurationSleep` | Tick timer of status 4 (sleep) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x146 | 2 | s16 | `tickDurationConfuse` | Tick timer of status 5 (confuse) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x148 | 2 | s16 | `tickDurationDoom` | Tick timer of status 6 (doom) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x14A | 2 | s16 | `tickDurationBlind` | Tick timer of status 7 (blind) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x14C | 2 | s16 | `tickDurationPoison` | Tick timer of status 8 (poison) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x14E | 2 | s16 | `tickDurationSilence` | Tick timer of status 9 (silence) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x150 | 2 | s16 | `tickDurationSap` | Tick timer of status 10 (sap) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x152 | 2 | s16 | `tickDurationOil` | Tick timer of status 11 (oil) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x154 | 2 | s16 | `tickDurationReverse` | Tick timer of status 12 (reverse) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x156 | 2 | s16 | `tickDurationDisable` | Tick timer of status 13 (disable) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x158 | 2 | s16 | `tickDurationImmobilize` | Tick timer of status 14 (immobilize) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x15A | 2 | s16 | `tickDurationSlow` | Tick timer of status 15 (slow) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x15C | 2 | s16 | `tickDurationDisease` | Tick timer of status 16 (disease) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x15E | 2 | s16 | `tickDurationLure` | Tick timer of status 17 (lure) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x160 | 2 | s16 | `tickDurationProtect` | Tick timer of status 18 (protect) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x162 | 2 | s16 | `tickDurationShell` | Tick timer of status 19 (shell) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x164 | 2 | s16 | `tickDurationHaste` | Tick timer of status 20 (haste) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x166 | 2 | s16 | `tickDurationBravery` | Tick timer of status 21 (bravery) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x168 | 2 | s16 | `tickDurationFaith` | Tick timer of status 22 (faith) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x16A | 2 | s16 | `tickDurationReflect` | Tick timer of status 23 (reflect) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x16C | 2 | s16 | `tickDurationInvisible` | Tick timer of status 24 (invisible) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x16E | 2 | s16 | `tickDurationRegen` | Tick timer of status 25 (regen) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x170 | 2 | s16 | `tickDurationFloat` | Tick timer of status 26 (float) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x172 | 2 | s16 | `tickDurationBerserk` | Tick timer of status 27 (berserk) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x174 | 2 | s16 | `tickDurationBubble` | Tick timer of status 28 (bubble) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x176 | 2 | s16 | `tickDurationHpCritical` | Tick timer of status 29 (hpCritical) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x178 | 2 | s16 | `tickDurationLibra` | Tick timer of status 30 (libra) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x17A | 2 | s16 | `tickDurationXZone` | Tick timer of status 31 (xZone) (e.g. poison/regen ticks); unit not stated. |  |  |
| 0x17C | 2 | s16 | `augmentDurationReserve0` | Timer slot 0 for timed augments (reserve0). |  | Drive getAugmentDurations.lua:2-16; Drive getBattleUnitKeep.lua:3-133 |
| 0x17E | 2 | s16 | `augmentDurationReserve1` | Timer slot 1 for timed augments (reserve1). |  |  |
| 0x180 | 2 | s16 | `augmentDurationReserve2` | Timer slot 2 for timed augments (reserve2). |  |  |
| 0x182 | 2 | s16 | `augmentDurationPhysicalImmunity` | Timer slot 3 for timed augments (physicalImmunity). |  |  |
| 0x184 | 2 | s16 | `augmentDurationMagickImmunity` | Timer slot 4 for timed augments (magickImmunity). |  |  |
| 0x186 | 2 | s16 | `augmentDurationStatusImmunity` | Timer slot 5 for timed augments (statusImmunity). |  |  |
| 0x188 | 2 | s16 | `augmentDurationReserve6` | Timer slot 6 for timed augments (reserve6). |  |  |
| 0x18A | 2 | s16 | `augmentDurationReserve7` | Timer slot 7 for timed augments (reserve7). |  |  |
| 0x18C | 4 | u32 | `exp` | Experience points. |  | TK L752; Drive getBattleUnitKeep.lua:3-133 |
| 0x190 | 4 | u32 | `lp` | License points (the Toolkit caps refunds at 99,999). |  | TK L541, L752; Drive getBattleUnitKeep.lua:3-133 |
| 0x194 | 8 | bf64 | `licenses0` | Obtained-license bits 0-63: bit n set = license node n (battlepack section 12 row n, BpLicenseList) is owned. | bits below | Drive getLicenses.lua:2-370; Drive TheInsurgentsManifesto.lua:1036-1066; Drive DuplicateAugmentDetector.lua:250-292; TK L753 |
| 0x19C | 8 | bf64 | `licenses1` | Obtained-license bits 64-127: bit n set = license node n (battlepack section 12 row n, BpLicenseList) is owned. | bits below | Drive getLicenses.lua:2-370; Drive TheInsurgentsManifesto.lua:1036-1066; Drive DuplicateAugmentDetector.lua:250-292; TK L753 |
| 0x1A4 | 8 | bf64 | `licenses2` | Obtained-license bits 128-191: bit n set = license node n (battlepack section 12 row n, BpLicenseList) is owned. | bits below | Drive getLicenses.lua:2-370; Drive TheInsurgentsManifesto.lua:1036-1066; Drive DuplicateAugmentDetector.lua:250-292; TK L753 |
| 0x1AC | 8 | bf64 | `licenses3` | Obtained-license bits 192-255: bit n set = license node n (battlepack section 12 row n, BpLicenseList) is owned. | bits below | Drive getLicenses.lua:2-370; Drive TheInsurgentsManifesto.lua:1036-1066; Drive DuplicateAugmentDetector.lua:250-292; TK L753 |
| 0x1B4 | 8 | bf64 | `licenses4` | Obtained-license bits 256-319: bit n set = license node n (battlepack section 12 row n, BpLicenseList) is owned. | bits below | Drive getLicenses.lua:2-370; Drive TheInsurgentsManifesto.lua:1036-1066; Drive DuplicateAugmentDetector.lua:250-292; TK L753 |
| 0x1BC | 4 | bf32 | `licenses5` | Obtained-license bits 320-351: bit n set = license node n (battlepack section 12 row n, BpLicenseList) is owned. | bits below | Drive getLicenses.lua:2-370; Drive TheInsurgentsManifesto.lua:1036-1066; Drive DuplicateAugmentDetector.lua:250-292; TK L753 |
| 0x1C0 | 2 | bf16 | `licenses6` | Obtained-license bits 352-367: bit n set = license node n (battlepack section 12 row n, BpLicenseList) is owned. | bits below | Drive getLicenses.lua:2-370; Drive TheInsurgentsManifesto.lua:1036-1066; Drive DuplicateAugmentDetector.lua:250-292; TK L753 |
| 0x1C2 | 1 | u8 | `level` | Current level. |  | TK L754; Drive getBattleUnitKeep.lua:3-133 |
| 0x1C3 | 1 | u8 | `job1` | First job (license board). 0xFF = none; the job reset writes 0xFFFF over job1+job2. | `JobList` | TK L755; Drive getBattleUnitKeep.lua:3-133; Drive TheInsurgentsManifesto.lua:957-959 |
| 0x1C4 | 1 | u8 | `job2` | Second job (second board, unlocked by the Second Board augment). 0xFF = none. | `JobList` | Drive getBattleUnitKeep.lua:3-133 |
| 0x1C5 | 1 | u8 | `selectedJob` | Job whose board is shown/selected. 0xFF = none. | `JobList` | Drive getBattleUnitKeep.lua:3-133 |
| 0x1C6 | 2 | bytes | `unknown1C6` | Not identified by any source; keep the original bytes. |  |  |

#### Bits of `battleUnitKeep.permanentStatusEffectImmunities` (bf32 at 0x38; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `ko` |  |
| 1 | `stone` |  |
| 2 | `petrify` |  |
| 3 | `stop` |  |
| 4 | `sleep` |  |
| 5 | `confuse` |  |
| 6 | `doom` |  |
| 7 | `blind` |  |
| 8 | `poison` |  |
| 9 | `silence` |  |
| 10 | `sap` |  |
| 11 | `oil` |  |
| 12 | `reverse` |  |
| 13 | `disable` |  |
| 14 | `immobilize` |  |
| 15 | `slow` |  |
| 16 | `disease` |  |
| 17 | `lure` |  |
| 18 | `protect` |  |
| 19 | `shell` |  |
| 20 | `haste` |  |
| 21 | `bravery` |  |
| 22 | `faith` |  |
| 23 | `reflect` |  |
| 24 | `invisible` |  |
| 25 | `regen` |  |
| 26 | `float` |  |
| 27 | `berserk` |  |
| 28 | `bubble` |  |
| 29 | `hpCritical` |  |
| 30 | `libra` |  |
| 31 | `xZone` |  |

#### Bits of `battleUnitKeep.permanentStatusEffects` (bf32 at 0x3C; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `ko` |  |
| 1 | `stone` |  |
| 2 | `petrify` |  |
| 3 | `stop` |  |
| 4 | `sleep` |  |
| 5 | `confuse` |  |
| 6 | `doom` |  |
| 7 | `blind` |  |
| 8 | `poison` |  |
| 9 | `silence` |  |
| 10 | `sap` |  |
| 11 | `oil` |  |
| 12 | `reverse` |  |
| 13 | `disable` |  |
| 14 | `immobilize` |  |
| 15 | `slow` |  |
| 16 | `disease` |  |
| 17 | `lure` |  |
| 18 | `protect` |  |
| 19 | `shell` |  |
| 20 | `haste` |  |
| 21 | `bravery` |  |
| 22 | `faith` |  |
| 23 | `reflect` |  |
| 24 | `invisible` |  |
| 25 | `regen` |  |
| 26 | `float` |  |
| 27 | `berserk` |  |
| 28 | `bubble` |  |
| 29 | `hpCritical` |  |
| 30 | `libra` |  |
| 31 | `xZone` |  |

#### Bits of `battleUnitKeep.permanentElementalWeak` (bf8 at 0x40; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `fire` |  |
| 1 | `lightning` |  |
| 2 | `ice` |  |
| 3 | `earth` |  |
| 4 | `water` |  |
| 5 | `wind` |  |
| 6 | `holy` |  |
| 7 | `dark` |  |

#### Bits of `battleUnitKeep.permanentElementalAbsorb` (bf8 at 0x41; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `fire` |  |
| 1 | `lightning` |  |
| 2 | `ice` |  |
| 3 | `earth` |  |
| 4 | `water` |  |
| 5 | `wind` |  |
| 6 | `holy` |  |
| 7 | `dark` |  |

#### Bits of `battleUnitKeep.permanentElementalHalf` (bf8 at 0x42; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `fire` |  |
| 1 | `lightning` |  |
| 2 | `ice` |  |
| 3 | `earth` |  |
| 4 | `water` |  |
| 5 | `wind` |  |
| 6 | `holy` |  |
| 7 | `dark` |  |

#### Bits of `battleUnitKeep.permanentElementalImmune` (bf8 at 0x43; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `fire` |  |
| 1 | `lightning` |  |
| 2 | `ice` |  |
| 3 | `earth` |  |
| 4 | `water` |  |
| 5 | `wind` |  |
| 6 | `holy` |  |
| 7 | `dark` |  |

#### Bits of `battleUnitKeep.permanentElementalPotency` (bf8 at 0x44; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `fire` |  |
| 1 | `lightning` |  |
| 2 | `ice` |  |
| 3 | `earth` |  |
| 4 | `water` |  |
| 5 | `wind` |  |
| 6 | `holy` |  |
| 7 | `dark` |  |

#### Bits of `battleUnitKeep.temporaryStatusEffects` (bf32 at 0x64; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `ko` |  |
| 1 | `stone` |  |
| 2 | `petrify` |  |
| 3 | `stop` |  |
| 4 | `sleep` |  |
| 5 | `confuse` |  |
| 6 | `doom` |  |
| 7 | `blind` |  |
| 8 | `poison` |  |
| 9 | `silence` |  |
| 10 | `sap` |  |
| 11 | `oil` |  |
| 12 | `reverse` |  |
| 13 | `disable` |  |
| 14 | `immobilize` |  |
| 15 | `slow` |  |
| 16 | `disease` |  |
| 17 | `lure` |  |
| 18 | `protect` |  |
| 19 | `shell` |  |
| 20 | `haste` |  |
| 21 | `bravery` |  |
| 22 | `faith` |  |
| 23 | `reflect` |  |
| 24 | `invisible` |  |
| 25 | `regen` |  |
| 26 | `float` |  |
| 27 | `berserk` |  |
| 28 | `bubble` |  |
| 29 | `hpCritical` |  |
| 30 | `libra` |  |
| 31 | `xZone` |  |

#### Bits of `battleUnitKeep.temporaryAugmentsLow` (bf64 at 0x68; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `stability` |  |
| 1 | `safety` |  |
| 2 | `accuracyBoost` |  |
| 3 | `shieldBoost` |  |
| 4 | `evasionBoost` |  |
| 5 | `lastStand` |  |
| 6 | `counter` |  |
| 7 | `counterBoost` |  |
| 8 | `spellbreaker` |  |
| 9 | `brawler` |  |
| 10 | `adrenaline` |  |
| 11 | `focus` |  |
| 12 | `lobbying` |  |
| 13 | `comboBoost` |  |
| 14 | `itemBoost` |  |
| 15 | `medicineReverse` |  |
| 16 | `weatherproof` |  |
| 17 | `thievery` |  |
| 18 | `saboteur` |  |
| 19 | `magickLore13` |  |
| 20 | `warmage` |  |
| 21 | `martyr` |  |
| 22 | `magickLore14` |  |
| 23 | `headsman` |  |
| 24 | `magickLore15` |  |
| 25 | `treasureHunter` |  |
| 26 | `magickLore16` |  |
| 27 | `expBoost` |  |
| 28 | `lpBoost` |  |
| 29 | `stagnation` |  |
| 30 | `spellbound` |  |
| 31 | `piercingMagick` |  |
| 32 | `offering` |  |
| 33 | `veil` |  |
| 34 | `lifeCloak` |  |
| 35 | `battleLore6` |  |
| 36 | `parsimony` |  |
| 37 | `treadLightly` |  |
| 38 | `unused38` |  |
| 39 | `emptiness` |  |
| 40 | `resistPiercing` |  |
| 41 | `antiLibra` |  |
| 42 | `battleLore7` |  |
| 43 | `battleLore8` |  |
| 44 | `battleLore9` |  |
| 45 | `battleLore10` |  |
| 46 | `battleLore11` |  |
| 47 | `battleLore12` |  |
| 48 | `stoneskin` |  |
| 49 | `attackBoost` |  |
| 50 | `doubleEdged` |  |
| 51 | `spellspring` |  |
| 52 | `elementalShift` |  |
| 53 | `celerity` |  |
| 54 | `swiftcast` |  |
| 55 | `physicalImmunity` |  |
| 56 | `magickImmunity` |  |
| 57 | `statusImmunity` |  |
| 58 | `damageSpikes` |  |
| 59 | `suicidal` |  |
| 60 | `battleLore13` |  |
| 61 | `battleLore14` |  |
| 62 | `battleLore15` |  |
| 63 | `battleLore16` |  |

#### Bits of `battleUnitKeep.temporaryAugmentsHigh` (bf64 at 0x70; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `battleLore1` |  |
| 1 | `battleLore2` |  |
| 2 | `battleLore3` |  |
| 3 | `battleLore4` |  |
| 4 | `battleLore5` |  |
| 5 | `magickLore1` |  |
| 6 | `magickLore2` |  |
| 7 | `magickLore3` |  |
| 8 | `magickLore4` |  |
| 9 | `magickLore5` |  |
| 10 | `hpLore1` |  |
| 11 | `hpLore2` |  |
| 12 | `hpLore3` |  |
| 13 | `hpLore4` |  |
| 14 | `hpLore5` |  |
| 15 | `hpLore6` |  |
| 16 | `hpLore7` |  |
| 17 | `hpLore8` |  |
| 18 | `hpLore9` |  |
| 19 | `hpLore10` |  |
| 20 | `hpLore11` |  |
| 21 | `hpLore12` |  |
| 22 | `inquisitor` |  |
| 23 | `magickLore6` |  |
| 24 | `shieldBlock3` |  |
| 25 | `shieldBlock2` |  |
| 26 | `shieldBlock1` |  |
| 27 | `channeling3` |  |
| 28 | `channeling2` |  |
| 29 | `channeling1` |  |
| 30 | `swiftness3` |  |
| 31 | `swiftness2` |  |
| 32 | `swiftness1` |  |
| 33 | `magickLore7` |  |
| 34 | `magickLore8` |  |
| 35 | `magickLore9` |  |
| 36 | `magickLore10` |  |
| 37 | `magickLore11` |  |
| 38 | `magickLore12` |  |
| 39 | `serenity` |  |
| 40 | `gambitSlot1` |  |
| 41 | `gambitSlot2` |  |
| 42 | `gambitSlot3` |  |
| 43 | `gambitSlot4` |  |
| 44 | `gambitSlot5` |  |
| 45 | `gambitSlot6` |  |
| 46 | `gambitSlot7` |  |
| 47 | `gambitSlot8` |  |
| 48 | `gambitSlot9` |  |
| 49 | `gambitSlot10` |  |
| 50 | `essentials` |  |
| 51 | `unused115` |  |
| 52 | `remedyLore3` |  |
| 53 | `remedyLore2` |  |
| 54 | `remedyLore1` |  |
| 55 | `potionLore3` |  |
| 56 | `potionLore2` |  |
| 57 | `potionLore1` |  |
| 58 | `etherLore3` |  |
| 59 | `etherLore2` |  |
| 60 | `etherLore1` |  |
| 61 | `phoenixLore3` |  |
| 62 | `phoenixLore2` |  |
| 63 | `phoenixLore1` |  |

#### Bits of `battleUnitKeep.permanentAugmentsLow` (bf64 at 0x78; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `stability` |  |
| 1 | `safety` |  |
| 2 | `accuracyBoost` |  |
| 3 | `shieldBoost` |  |
| 4 | `evasionBoost` |  |
| 5 | `lastStand` |  |
| 6 | `counter` |  |
| 7 | `counterBoost` |  |
| 8 | `spellbreaker` |  |
| 9 | `brawler` |  |
| 10 | `adrenaline` |  |
| 11 | `focus` |  |
| 12 | `lobbying` |  |
| 13 | `comboBoost` |  |
| 14 | `itemBoost` |  |
| 15 | `medicineReverse` |  |
| 16 | `weatherproof` |  |
| 17 | `thievery` |  |
| 18 | `saboteur` |  |
| 19 | `magickLore13` |  |
| 20 | `warmage` |  |
| 21 | `martyr` |  |
| 22 | `magickLore14` |  |
| 23 | `headsman` |  |
| 24 | `magickLore15` |  |
| 25 | `treasureHunter` |  |
| 26 | `magickLore16` |  |
| 27 | `expBoost` |  |
| 28 | `lpBoost` |  |
| 29 | `stagnation` |  |
| 30 | `spellbound` |  |
| 31 | `piercingMagick` |  |
| 32 | `offering` |  |
| 33 | `veil` |  |
| 34 | `lifeCloak` |  |
| 35 | `battleLore6` |  |
| 36 | `parsimony` |  |
| 37 | `treadLightly` |  |
| 38 | `unused38` |  |
| 39 | `emptiness` |  |
| 40 | `resistPiercing` |  |
| 41 | `antiLibra` |  |
| 42 | `battleLore7` |  |
| 43 | `battleLore8` |  |
| 44 | `battleLore9` |  |
| 45 | `battleLore10` |  |
| 46 | `battleLore11` |  |
| 47 | `battleLore12` |  |
| 48 | `stoneskin` |  |
| 49 | `attackBoost` |  |
| 50 | `doubleEdged` |  |
| 51 | `spellspring` |  |
| 52 | `elementalShift` |  |
| 53 | `celerity` |  |
| 54 | `swiftcast` |  |
| 55 | `physicalImmunity` |  |
| 56 | `magickImmunity` |  |
| 57 | `statusImmunity` |  |
| 58 | `damageSpikes` |  |
| 59 | `suicidal` |  |
| 60 | `battleLore13` |  |
| 61 | `battleLore14` |  |
| 62 | `battleLore15` |  |
| 63 | `battleLore16` |  |

#### Bits of `battleUnitKeep.permanentAugmentsHigh` (bf64 at 0x80; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `battleLore1` |  |
| 1 | `battleLore2` |  |
| 2 | `battleLore3` |  |
| 3 | `battleLore4` |  |
| 4 | `battleLore5` |  |
| 5 | `magickLore1` |  |
| 6 | `magickLore2` |  |
| 7 | `magickLore3` |  |
| 8 | `magickLore4` |  |
| 9 | `magickLore5` |  |
| 10 | `hpLore1` |  |
| 11 | `hpLore2` |  |
| 12 | `hpLore3` |  |
| 13 | `hpLore4` |  |
| 14 | `hpLore5` |  |
| 15 | `hpLore6` |  |
| 16 | `hpLore7` |  |
| 17 | `hpLore8` |  |
| 18 | `hpLore9` |  |
| 19 | `hpLore10` |  |
| 20 | `hpLore11` |  |
| 21 | `hpLore12` |  |
| 22 | `inquisitor` |  |
| 23 | `magickLore6` |  |
| 24 | `shieldBlock3` |  |
| 25 | `shieldBlock2` |  |
| 26 | `shieldBlock1` |  |
| 27 | `channeling3` |  |
| 28 | `channeling2` |  |
| 29 | `channeling1` |  |
| 30 | `swiftness3` |  |
| 31 | `swiftness2` |  |
| 32 | `swiftness1` |  |
| 33 | `magickLore7` |  |
| 34 | `magickLore8` |  |
| 35 | `magickLore9` |  |
| 36 | `magickLore10` |  |
| 37 | `magickLore11` |  |
| 38 | `magickLore12` |  |
| 39 | `serenity` |  |
| 40 | `gambitSlot1` |  |
| 41 | `gambitSlot2` |  |
| 42 | `gambitSlot3` |  |
| 43 | `gambitSlot4` |  |
| 44 | `gambitSlot5` |  |
| 45 | `gambitSlot6` |  |
| 46 | `gambitSlot7` |  |
| 47 | `gambitSlot8` |  |
| 48 | `gambitSlot9` |  |
| 49 | `gambitSlot10` |  |
| 50 | `essentials` |  |
| 51 | `unused115` |  |
| 52 | `remedyLore3` |  |
| 53 | `remedyLore2` |  |
| 54 | `remedyLore1` |  |
| 55 | `potionLore3` |  |
| 56 | `potionLore2` |  |
| 57 | `potionLore1` |  |
| 58 | `etherLore3` |  |
| 59 | `etherLore2` |  |
| 60 | `etherLore1` |  |
| 61 | `phoenixLore3` |  |
| 62 | `phoenixLore2` |  |
| 63 | `phoenixLore1` |  |

#### Bits of `battleUnitKeep.licenses0` (bf64 at 0x194; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `quickening1` |  |
| 1 | `quickening2` |  |
| 2 | `quickening3` |  |
| 3 | `quickening4` |  |
| 4 | `quickening5` |  |
| 5 | `quickening6` |  |
| 6 | `quickening7` |  |
| 7 | `quickening8` |  |
| 8 | `quickening9` |  |
| 9 | `quickening10` |  |
| 10 | `quickening11` |  |
| 11 | `quickening12` |  |
| 12 | `quickening13` |  |
| 13 | `quickening14` |  |
| 14 | `quickening15` |  |
| 15 | `quickening16` |  |
| 16 | `quickening17` |  |
| 17 | `quickening18` |  |
| 18 | `belias` |  |
| 19 | `mateus` |  |
| 20 | `adrammelech` |  |
| 21 | `hashmal` |  |
| 22 | `cúchulainn` |  |
| 23 | `famfrit` |  |
| 24 | `zalera` |  |
| 25 | `shemhazai` |  |
| 26 | `chaos` |  |
| 27 | `zeromus` |  |
| 28 | `exodus` |  |
| 29 | `ultima` |  |
| 30 | `zodiark` |  |
| 31 | `essentials` |  |
| 32 | `swords1` |  |
| 33 | `swords2` |  |
| 34 | `swords3` |  |
| 35 | `swords4` |  |
| 36 | `swords5` |  |
| 37 | `swords6` |  |
| 38 | `swords7` |  |
| 39 | `bloodSword` |  |
| 40 | `greatswords1` |  |
| 41 | `greatswords2` |  |
| 42 | `greatswords3` |  |
| 43 | `excalibur` |  |
| 44 | `tournesol` |  |
| 45 | `katana1` |  |
| 46 | `katana2` |  |
| 47 | `katana3` |  |
| 48 | `katana4` |  |
| 49 | `masamune` |  |
| 50 | `ninjaSwords1` |  |
| 51 | `ninjaSwords2` |  |
| 52 | `yagyuDarkbladeAndMesa` |  |
| 53 | `spears1` |  |
| 54 | `spears2` |  |
| 55 | `spears3` |  |
| 56 | `spears4` |  |
| 57 | `spears5` |  |
| 58 | `dragonWhisker` |  |
| 59 | `zodiacSpear` |  |
| 60 | `poles1` |  |
| 61 | `poles2` |  |
| 62 | `poles3` |  |
| 63 | `poles4` |  |

#### Bits of `battleUnitKeep.licenses1` (bf64 at 0x19C; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `poles5` |  |
| 1 | `whaleWhisker` |  |
| 2 | `bows1` |  |
| 3 | `bows2` |  |
| 4 | `bows3` |  |
| 5 | `bows4` |  |
| 6 | `bows5` |  |
| 7 | `bows6` |  |
| 8 | `sagittarius` |  |
| 9 | `crossbows1` |  |
| 10 | `crossbows2` |  |
| 11 | `crossbows3` |  |
| 12 | `crossbows4` |  |
| 13 | `guns1` |  |
| 14 | `guns2` |  |
| 15 | `guns3` |  |
| 16 | `guns4` |  |
| 17 | `guns5` |  |
| 18 | `guns6` |  |
| 19 | `axesAndHammers1` |  |
| 20 | `axesAndHammers2` |  |
| 21 | `axesAndHammers3` |  |
| 22 | `axesAndHammers4` |  |
| 23 | `axesAndHammers5` |  |
| 24 | `axesAndHammers6` |  |
| 25 | `axesAndHammers7` |  |
| 26 | `daggers1` |  |
| 27 | `daggers2` |  |
| 28 | `daggers3` |  |
| 29 | `daggers4` |  |
| 30 | `daggers5` |  |
| 31 | `shikariNagasaAndMina` |  |
| 32 | `rods1` |  |
| 33 | `rods2` |  |
| 34 | `rods3` |  |
| 35 | `rods4` |  |
| 36 | `rodOfFaith` |  |
| 37 | `staves1` |  |
| 38 | `staves2` |  |
| 39 | `staves3` |  |
| 40 | `staves4` |  |
| 41 | `staffOfTheMagi` |  |
| 42 | `maces1` |  |
| 43 | `maces2` |  |
| 44 | `maces3` |  |
| 45 | `maces4` |  |
| 46 | `maces5` |  |
| 47 | `measures1` |  |
| 48 | `measures2` |  |
| 49 | `measures3` |  |
| 50 | `handBombs1` |  |
| 51 | `handBombs2` |  |
| 52 | `handBombs3` |  |
| 53 | `shields1` |  |
| 54 | `shields2` |  |
| 55 | `shields3` |  |
| 56 | `shields4` |  |
| 57 | `shields5` |  |
| 58 | `shields6` |  |
| 59 | `ensanguinedShield` |  |
| 60 | `shellShield` |  |
| 61 | `zodiacEscutcheon` |  |
| 62 | `heavyArmor1` |  |
| 63 | `heavyArmor2` |  |

#### Bits of `battleUnitKeep.licenses2` (bf64 at 0x1A4; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `heavyArmor3` |  |
| 1 | `heavyArmor4` |  |
| 2 | `heavyArmor5` |  |
| 3 | `heavyArmor6` |  |
| 4 | `heavyArmor7` |  |
| 5 | `heavyArmor8` |  |
| 6 | `heavyArmor9` |  |
| 7 | `heavyArmor10` |  |
| 8 | `genjiArmor` |  |
| 9 | `lightArmor1` |  |
| 10 | `lightArmor2` |  |
| 11 | `lightArmor3` |  |
| 12 | `lightArmor4` |  |
| 13 | `lightArmor5` |  |
| 14 | `lightArmor6` |  |
| 15 | `lightArmor7` |  |
| 16 | `lightArmor8` |  |
| 17 | `lightArmor9` |  |
| 18 | `lightArmor10` |  |
| 19 | `lightArmor11` |  |
| 20 | `lightArmor12` |  |
| 21 | `mysticArmor1` |  |
| 22 | `mysticArmor2` |  |
| 23 | `mysticArmor3` |  |
| 24 | `mysticArmor4` |  |
| 25 | `mysticArmor5` |  |
| 26 | `mysticArmor6` |  |
| 27 | `mysticArmor7` |  |
| 28 | `mysticArmor8` |  |
| 29 | `mysticArmor9` |  |
| 30 | `mysticArmor10` |  |
| 31 | `mysticArmor11` |  |
| 32 | `mysticArmor12` |  |
| 33 | `accessories1` |  |
| 34 | `accessories2` |  |
| 35 | `accessories3` |  |
| 36 | `accessories4` |  |
| 37 | `accessories5` |  |
| 38 | `accessories6` |  |
| 39 | `accessories7` |  |
| 40 | `accessories8` |  |
| 41 | `accessories9` |  |
| 42 | `accessories10` |  |
| 43 | `accessories11` |  |
| 44 | `accessories12` |  |
| 45 | `accessories13` |  |
| 46 | `accessories14` |  |
| 47 | `accessories15` |  |
| 48 | `accessories16` |  |
| 49 | `accessories17` |  |
| 50 | `accessories18` |  |
| 51 | `accessories19` |  |
| 52 | `accessories20` |  |
| 53 | `ribbon` |  |
| 54 | `whiteMagick1` |  |
| 55 | `whiteMagick2` |  |
| 56 | `whiteMagick3` |  |
| 57 | `whiteMagick4` |  |
| 58 | `whiteMagick5` |  |
| 59 | `whiteMagick6` |  |
| 60 | `whiteMagick7` |  |
| 61 | `whiteMagick8` |  |
| 62 | `blackMagick1` |  |
| 63 | `blackMagick2` |  |

#### Bits of `battleUnitKeep.licenses3` (bf64 at 0x1AC; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `blackMagick3` |  |
| 1 | `blackMagick4` |  |
| 2 | `blackMagick5` |  |
| 3 | `blackMagick6` |  |
| 4 | `blackMagick7` |  |
| 5 | `blackMagick8` |  |
| 6 | `timeMagick1` |  |
| 7 | `timeMagick2` |  |
| 8 | `timeMagick3` |  |
| 9 | `timeMagick4` |  |
| 10 | `timeMagick5` |  |
| 11 | `timeMagick6` |  |
| 12 | `timeMagick7` |  |
| 13 | `greenMagick1` |  |
| 14 | `greenMagick2` |  |
| 15 | `greenMagick3` |  |
| 16 | `whiteMagick10` |  |
| 17 | `whiteMagick11` |  |
| 18 | `whiteMagick12` |  |
| 19 | `whiteMagick13` |  |
| 20 | `arcaneMagick1` |  |
| 21 | `arcaneMagick2` |  |
| 22 | `arcaneMagick3` |  |
| 23 | `blackMagick11` |  |
| 24 | `blackMagick12` |  |
| 25 | `blackMagick13` |  |
| 26 | `timeMagick9` |  |
| 27 | `warmage` |  |
| 28 | `martyr` |  |
| 29 | `inquisitor` |  |
| 30 | `headsman` |  |
| 31 | `adrenaline` |  |
| 32 | `spellbreaker` |  |
| 33 | `focus` |  |
| 34 | `serenity` |  |
| 35 | `lastStand` |  |
| 36 | `spellbound` |  |
| 37 | `brawler` |  |
| 38 | `shieldBlock1` |  |
| 39 | `shieldBlock2` |  |
| 40 | `shieldBlock3` |  |
| 41 | `channeling1` |  |
| 42 | `channeling2` |  |
| 43 | `channeling3` |  |
| 44 | `swiftness1` |  |
| 45 | `swiftness2` |  |
| 46 | `swiftness3` |  |
| 47 | `remedyLore1` |  |
| 48 | `remedyLore2` |  |
| 49 | `remedyLore3` |  |
| 50 | `potionLore1` |  |
| 51 | `potionLore2` |  |
| 52 | `potionLore3` |  |
| 53 | `etherLore1` |  |
| 54 | `etherLore2` |  |
| 55 | `etherLore3` |  |
| 56 | `phoenixLore1` |  |
| 57 | `phoenixLore2` |  |
| 58 | `phoenixLore3` |  |
| 59 | `battleLore1` |  |
| 60 | `battleLore2` |  |
| 61 | `battleLore3` |  |
| 62 | `battleLore4` |  |
| 63 | `battleLore5` |  |

#### Bits of `battleUnitKeep.licenses4` (bf64 at 0x1B4; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `magickLore1` |  |
| 1 | `magickLore2` |  |
| 2 | `magickLore3` |  |
| 3 | `magickLore4` |  |
| 4 | `magickLore5` |  |
| 5 | `hpLore1` |  |
| 6 | `hpLore2` |  |
| 7 | `hpLore3` |  |
| 8 | `hpLore4` |  |
| 9 | `hpLore5` |  |
| 10 | `gambitSlot1` |  |
| 11 | `gambitSlot2` |  |
| 12 | `gambitSlot3` |  |
| 13 | `gambitSlot4` |  |
| 14 | `gambitSlot5` |  |
| 15 | `gambitSlot6` |  |
| 16 | `gambitSlot7` |  |
| 17 | `gambitSlot8` |  |
| 18 | `gambitSlot9` |  |
| 19 | `gambitSlot10` |  |
| 20 | `steal` |  |
| 21 | `libra` |  |
| 22 | `firstAid` |  |
| 23 | `poach` |  |
| 24 | `charge` |  |
| 25 | `horology` |  |
| 26 | `souleater` |  |
| 27 | `traveler` |  |
| 28 | `numerology` |  |
| 29 | `shear` |  |
| 30 | `achilles` |  |
| 31 | `gilToss` |  |
| 32 | `charm` |  |
| 33 | `sightUnseeing` |  |
| 34 | `infuse` |  |
| 35 | `addle` |  |
| 36 | `bonecrusher` |  |
| 37 | `shadesOfBlack` |  |
| 38 | `stamp` |  |
| 39 | `expose` |  |
| 40 | `revive` |  |
| 41 | `1000Needles` |  |
| 42 | `wither` |  |
| 43 | `telekinesis` |  |
| 44 | `hpLore6` |  |
| 45 | `hpLore7` |  |
| 46 | `hpLore8` |  |
| 47 | `hpLore9` |  |
| 48 | `hpLore10` |  |
| 49 | `hpLore11` |  |
| 50 | `hpLore12` |  |
| 51 | `battleLore6` |  |
| 52 | `battleLore7` |  |
| 53 | `battleLore8` |  |
| 54 | `battleLore9` |  |
| 55 | `battleLore10` |  |
| 56 | `battleLore11` |  |
| 57 | `battleLore12` |  |
| 58 | `battleLore13` |  |
| 59 | `battleLore14` |  |
| 60 | `battleLore15` |  |
| 61 | `battleLore16` |  |
| 62 | `magickLore6` |  |
| 63 | `magickLore7` |  |

#### Bits of `battleUnitKeep.licenses5` (bf32 at 0x1BC; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `magickLore8` |  |
| 1 | `magickLore9` |  |
| 2 | `magickLore10` |  |
| 3 | `magickLore11` |  |
| 4 | `magickLore12` |  |
| 5 | `magickLore13` |  |
| 6 | `magickLore14` |  |
| 7 | `magickLore15` |  |
| 8 | `magickLore16` |  |
| 9 | `swords8` |  |
| 10 | `swords9` |  |
| 11 | `karkata` |  |
| 12 | `greatswords4` |  |
| 13 | `excalipur` |  |
| 14 | `katana5` |  |
| 15 | `kumbha` |  |
| 16 | `ninjaSwords3` |  |
| 17 | `vrsabha` |  |
| 18 | `poles6` |  |
| 19 | `kanya` |  |
| 20 | `bows7` |  |
| 21 | `dhanusha` |  |
| 22 | `mithuna` |  |
| 23 | `vrscika` |  |
| 24 | `daggers6` |  |
| 25 | `staves5` |  |
| 26 | `measures4` |  |
| 27 | `makara` |  |
| 28 | `shields7` |  |
| 29 | `heavyArmor11` |  |
| 30 | `heavyArmor12` |  |
| 31 | `lightArmor13` |  |

#### Bits of `battleUnitKeep.licenses6` (bf16 at 0x1C0; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `mysticArmor13` |  |
| 1 | `accessories21` |  |
| 2 | `accessories22` |  |
| 3 | `whiteMagick9` |  |
| 4 | `blackMagick9` |  |
| 5 | `timeMagick8` |  |
| 6 | `blackMagick10` |  |
| 7 | `timeMagick10` |  |
| 8 | `secondBoard` |  |
| 9 | `reserve361` |  |
| 10 | `reserve362` |  |
| 11 | `reserve363` |  |
| 12 | `reserve364` |  |
| 13 | `reserve365` |  |
| 14 | `reserve366` |  |
| 15 | `reserve367` |  |

### Record `battleUnitKeepPlus` — 128 bytes (0x80), count: one per spawned unit

*Where:* Battle Unit Work +0x6A0 holds a pointer to it (one per unit).

The Toolkit also lists Name Variation, real spawn group, persistent ids, an Enmity table and default positions here (TK L697) without offsets; they live somewhere in the unknown ranges.

| Offset | Size | Type | Name | Meaning | Enum / list | Source |
|---|---|---|---|---|---|---|
| 0x00 | 1 | bf8 | `battleFlags` | Battle flags; only bit 7 is named. | bits below | Drive getBattleUnitKeepPlus.lua:2-53 |
| 0x01 | 3 | bytes | `unknown01` | Not identified by any source; keep the original bytes. |  |  |
| 0x04 | 4 | f32 | `specialSpawnRange` | Special spawn range. |  | Drive getBattleUnitKeepPlus.lua:2-53; TK L697 |
| 0x08 | 2 | u16 | `currentDeathCount` | How often this spawn has died (respawn logic). |  | Drive getBattleUnitKeepPlus.lua:2-53; TK L697 |
| 0x0A | 2 | u16 | `maxDeathCount` | Deaths allowed before the spawn stops respawning. |  | Drive getBattleUnitKeepPlus.lua:2-53; TK L697 |
| 0x0C | 4 | u32 | `deathTime` | Time stamp/counter of the last death. |  | Drive getBattleUnitKeepPlus.lua:2-53 |
| 0x10 | 2 | u16 | `respawnTime` | Respawn delay. |  | Drive getBattleUnitKeepPlus.lua:2-53; TK L697 |
| 0x12 | 2 | bytes | `unknown12` | Not identified by any source; keep the original bytes. |  |  |
| 0x14 | 1 | bf8 | `stealStateFlags` | Which steal tiers have already been taken from this unit. | bits below | Drive getBattleUnitKeepPlus.lua:2-53 |
| 0x15 | 1 | u8 | `summonGroup` | Summon group. |  | Drive getBattleUnitKeepPlus.lua:2-53; TK L697 |
| 0x16 | 90 | bytes | `unknown16` | Not identified by any source; keep the original bytes. |  |  |
| 0x70 | 4 | f32 | `latestYaw` | Latest yaw (radians). |  | Drive getBattleUnitKeepPlus.lua:2-53 |
| 0x74 | 4 | f32 | `defaultYaw` | Default yaw (radians). |  | Drive getBattleUnitKeepPlus.lua:2-53; TK L697 |
| 0x78 | 1 | bf8 | `temporaryElementalWeak` | Temporary elemental affinities - Weak. | bits below | Drive getBattleUnitKeepPlus.lua:2-53; Drive getElementalAffinities.lua:2-8 |
| 0x79 | 1 | bf8 | `temporaryElementalAbsorb` | Temporary elemental affinities - Absorb. | bits below |  |
| 0x7A | 1 | bf8 | `temporaryElementalHalf` | Temporary elemental affinities - Half. | bits below |  |
| 0x7B | 1 | bf8 | `temporaryElementalImmune` | Temporary elemental affinities - Immune. | bits below |  |
| 0x7C | 1 | bf8 | `temporaryElementalPotency` | Temporary elemental affinities - Potency. | bits below |  |
| 0x7D | 3 | bytes | `unknown7D` | Not identified by any source; keep the original bytes. |  |  |

#### Bits of `battleUnitKeepPlus.battleFlags` (bf8 at 0x00; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 7 | `hasTemporaryElementalAffinities` | set while the temporary elemental affinities at +0x78 apply |

#### Bits of `battleUnitKeepPlus.stealStateFlags` (bf8 at 0x14; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `common` |  |
| 1 | `uncommon` |  |
| 2 | `rare` |  |

#### Bits of `battleUnitKeepPlus.temporaryElementalWeak` (bf8 at 0x78; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `fire` |  |
| 1 | `lightning` |  |
| 2 | `ice` |  |
| 3 | `earth` |  |
| 4 | `water` |  |
| 5 | `wind` |  |
| 6 | `holy` |  |
| 7 | `dark` |  |

#### Bits of `battleUnitKeepPlus.temporaryElementalAbsorb` (bf8 at 0x79; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `fire` |  |
| 1 | `lightning` |  |
| 2 | `ice` |  |
| 3 | `earth` |  |
| 4 | `water` |  |
| 5 | `wind` |  |
| 6 | `holy` |  |
| 7 | `dark` |  |

#### Bits of `battleUnitKeepPlus.temporaryElementalHalf` (bf8 at 0x7A; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `fire` |  |
| 1 | `lightning` |  |
| 2 | `ice` |  |
| 3 | `earth` |  |
| 4 | `water` |  |
| 5 | `wind` |  |
| 6 | `holy` |  |
| 7 | `dark` |  |

#### Bits of `battleUnitKeepPlus.temporaryElementalImmune` (bf8 at 0x7B; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `fire` |  |
| 1 | `lightning` |  |
| 2 | `ice` |  |
| 3 | `earth` |  |
| 4 | `water` |  |
| 5 | `wind` |  |
| 6 | `holy` |  |
| 7 | `dark` |  |

#### Bits of `battleUnitKeepPlus.temporaryElementalPotency` (bf8 at 0x7C; bit 0 = least significant bit of the little-endian value)

| Bit(s) | Name | Meaning / enum |
|---|---|---|
| 0 | `fire` |  |
| 1 | `lightning` |  |
| 2 | `ice` |  |
| 3 | `earth` |  |
| 4 | `water` |  |
| 5 | `wind` |  |
| 6 | `holy` |  |
| 7 | `dark` |  |

## Enums carried in the JSON spec

#### `CharacterTypeList`

| Value | Label |
|---|---|
| 0 (0x0) | Party Member |
| 1 (0x1) | Foe |

#### `JobList`

| Value | Label |
|---|---|
| 0 (0x0) | White Mage |
| 1 (0x1) | Uhlan |
| 2 (0x2) | Machinist |
| 3 (0x3) | Red Battlemage |
| 4 (0x4) | Knight |
| 5 (0x5) | Monk |
| 6 (0x6) | Time Battlemage |
| 7 (0x7) | Foebreaker |
| 8 (0x8) | Archer |
| 9 (0x9) | Black Mage |
| 10 (0xA) | Bushi |
| 11 (0xB) | Shikari |
| 12 (0xC) | Classic Board |
| 255 (0xFF) | None |

#### `PartyMemberList`

| Value | Label |
|---|---|
| 0 (0x0) | Vaan |
| 1 (0x1) | Ashe |
| 2 (0x2) | Fran |
| 3 (0x3) | Balthier |
| 4 (0x4) | Basch |
| 5 (0x5) | Penelo |
| 6 (0x6) | Reks |
| 7 (0x7) | Amalia |
| 8 (0x8) | Basch (Prisoner) |
| 9 (0x9) | Basch (Fugitive) |
| 10 (0xA) | Lamont |
| 11 (0xB) | Vossler (Judge) |
| 12 (0xC) | Vossler (Knight) |
| 13 (0xD) | Larsa |
| 14 (0xE) | Reddas |
| 15 (0xF) | Reserve (0x0F) |
| 16 (0x10) | Reserve (0x10) |
| 17 (0x11) | Reserve (0x11) |
| 18 (0x12) | Reserve (0x12) |
| 19 (0x13) | Reserve (0x13) |
| 20 (0x14) | Reserve (0x14) |
| 21 (0x15) | Reserve (0x15) |
| 22 (0x16) | Reserve (0x16) |
| 23 (0x17) | Reserve (0x17) |
| 24 (0x18) | Reserve (0x18) |
| 25 (0x19) | Reserve (0x19) |
| 26 (0x1A) | Chocobo |
| 27 (0x1B) | Belias |
| 28 (0x1C) | Mateus |
| 29 (0x1D) | Adrammelech |
| 30 (0x1E) | Hashmal |
| 31 (0x1F) | Cúchulainn |
| 32 (0x20) | Famfrit |
| 33 (0x21) | Zalera |
| 34 (0x22) | Shemhazai |
| 35 (0x23) | Chaos |
| 36 (0x24) | Zeromus |
| 37 (0x25) | Exodus |
| 38 (0x26) | Ultima |
| 39 (0x27) | Zodiark |
| 255 (0xFF) | None (0xFF) |
| 65535 (0xFFFF) | None (0xFFFF) |

### External lists referenced by `enum`

| List | What it names |
|---|---|
| `BpEquipmentList` | battlepack section 13 rows 0-556 (equipment) |
| `PartyMemberList` | party member ids 0-39 (0 Vaan ... 6 Reks, 7-14 guests, 26 Chocobo, 27-39 espers) |

## Known value semantics

* **Views A/B at 0x08-0x21.** Xeavin's class defines both readings on the same bytes. View A (`default*`:
  s32 HP, s16 MP, float Strength/Magick Power/Vitality/Speed, u8 Mist bars) is the party-member base sheet;
  view B (`additive*`: thirteen s16 bonuses) is what the Toolkit's Battle Character Editor shows, and that
  editor only binds to non-party units (TK L742, L740). So: type 0 -> view A, otherwise view B (inferred).
* **Equipment ids.** Stored as 16-bit ids; the Toolkit edits them with equipment drop-downs. Whether they are
  plain section 13 row ids (BpEquipmentList, 0-556) or content ids (0x1000 | row) is not stated; vanilla
  "nothing" is expected to be 0xFFFF. Check one value in a live game before writing.
* **Durations** are signed (a negative or zero value presumably means "not running"); the time unit is not
  documented.

## Round-trip rules

- Memory-only: never write this record into a game file; it is rebuilt from battlepack/ARD data and from the save.
- Edit fields in place; do not move or resize the party array (stride 0x1C8, 40 entries).
- Keep unknown bytes (0x00-0x03, 0x22-0x23, 0x45-0x47, 0x4F, 0x89-0xB9, 0xBB, 0x1C6-0x1C7) untouched.
- Write the two union views consistently: for party members (type 0) only use the default* view.
- After structural-effect edits (equipment, augments, licenses, level) run the game refresh (0x0030F4B0 flags 0x0F) and, for appearance, 0x0037C980.
- Values written here are persisted by the next in-game save (the party keeps live inside the save image).

## Known unknowns

- Bytes 0x00-0x03, 0x22-0x23, 0x45-0x47, 0x89-0xB9 (except 0xBA) and 0x1C6-0x1C7 are not identified.
- Exact size of a foe keep (the Toolkit says 464 bytes, the party array stride is 0x1C8 = 456).
- Whether equipment fields hold section-13 row ids or content ids (0x1000|row); empty-slot value.
- Time unit of status / tick / augment durations.
- Which union view (default* vs additive*) applies to which unit type is inferred, not stated.
- Battle Unit Keep Plus: offsets of name variation, persistent ids, enmity table and default position.

## Source keys

| Key | Source |
|---|---|
| TK `L<n>` | `docs/research/insurgents_toolkit_reference.md` (our write-up of Xeavin's *The Insurgent's Toolkit* Cheat Engine table for FFXII TZA Steam 1.0.4.0), line n. |
| LL `<page>:<line>` | FF12 Lua Loader documentation, `docs/capabilities/<page>.md` (e.g. `save-config`, `memory`, `event`, `bpack`). |
| IW `<file>:<line>` | The Insurgent's Workshop by Xeavin, `/home/user/xeavin/the-insurgents-workshop/` (fact reference only; its licence forbids copying or converting its code). |
| Drive `<script>:<line>` | Lua mod scripts from the user's Google Drive export (scratchpad `drive/` folder; file named `<id>__<script>`). Most are by Xeavin (*The Insurgent's Forge* helper classes such as `getBattleUnitKeep.lua`, and the mods *Manifesto*, *Companions*, *Itemized Bazaar*, *Thrifty Bazaar*); others by FehDead (`Wayfarer.lua`, `mappings.lua`, `frame.lua`, `layout.lua`) and LowPriorityCitizen (`helpers.lua`, `DuplicateAugmentDetector.lua`). They target the same Steam build as the Toolkit (same absolute addresses). |
| msg `n` | Discord *Sky Pirate's Den / #wip-general* export, message index n (0-based, as in our parsed `wip_general.json`). |
| Lists `<name>` | Drop-down lists of The Insurgent's Toolkit (`editor/data/lists.json`, or the full extraction `ct_lists.json`). |

All absolute addresses (e.g. `0x02EBF190`) are for the Steam build the Toolkit targets (1.0.4.0); they are
module-relative offsets as used by Cheat Engine and the Lua Loader. `[X]` means "the 64-bit pointer stored at X".

### Drive files cited

| Script | Drive file id(s) |
|---|---|
| `DuplicateAugmentDetector.lua` | `1KOL2TrNfVdYdMRT07pGUPPPsn2m8z3AM` |
| `SecondAccessory.lua` | `1q8Wnf4qDAO0ICJ1EpOJbSctRrKm8YmIy` |
| `TheInsurgentsManifesto.lua` | `1WWjJQxzPr1cVY7qMoJTFhGhpjDw5-wyv` |
| `getActivePartyMember.lua` | `1LsQjK2_PDBIPj21G8B0ORasG3Ryv0RVe` |
| `getAugmentDurations.lua` | `1ezCS4dGMJ2gMvk1HdAgXxLFLfCZDjiq2` |
| `getAugments.lua` | `1VSJgHfBJzwmQfl7WrOi1JVCAJKKV0gz-` |
| `getBattleUnitKeep.lua` | `192LKrY1yAs8dUOOfvfZnF1L9lIFWXzja` (Forge class with offsets); `12ctZrUP5nbys1UtKGyvxeRJ0fWH4lT3U` ("array helper": party keep address) |
| `getBattleUnitKeepPlus.lua` | `1VADB5AuN8TMefMJq2NMe_Q0-ExSuZXSg` |
| `getBattleUnitWork.lua` | `1Q8DJGxsTHGSf44y5A2U_whqim2JJXorH` (Forge class with offsets); `1tNgsB5hTO8D2PhBxVxcHP4XH_k2w4zjQ` (assembly calling 0x0031B860) |
| `getElementalAffinities.lua` | `1ECjTqGexAKUB7njFFflWBk6QExwduAt7` |
| `getLicenses.lua` | `1TomiLOpD9apHALTmrruvg0dIKHAZF6Rb` |
| `getStatusEffectDurations.lua` | `1tEdBynlP7T7eI0qYrQRBSIVNAcwy24qg` |
| `getStatusEffectTickDurations.lua` | `1TX6kbgEH586sUYe3uCI-WgVVqJbvi8NC` |
