# Enumeration - battle formulas (0-108) and formula functions (0-255)

Spec id: `enums-formulas` · machine spec: [`enums-formulas.json`](./enums-formulas.json)

> **ENUMERATION SPEC.** No file of its own: it gives the labels for the formula id stored in actions and weapons, and documents what each formula does in terms of the engine's formula functions.

## What this is

Every action (battlepack section 14) and every weapon or ammunition record (section 13) names a **formula** by a one-byte id. The formula decides how damage, healing, statuses and hit chance are computed, and therefore which other fields of the action are read at all (Xeavin: "the formula decides what is used", msg 655; knockback is only used by some formulas, msg 649). Each formula is a list of small engine **functions** (targeting checks, hit/miss rolls, power loaders, damage executors); one formula typically chains about 6-12 of them (msg 85). The vanilla engine has 109 formulas (0-108) and 256 function slots (0-255, many empty). Xeavin's *Formula Extension* lets modders re-compose formulas from these functions (msg 86, msg 90); the Extension drops duplicate functions and re-uses canonical ones (FL Functions!C notes). eochaid re-used a spell formula on a weapon this way (Leech formula 67 on Blood Sword, msg 470-476, msg 493).

## Sources

Every sheet was read in full through an `.xlsx` export of the Drive file (the plain-text read only returns a ~50-row sample, so it was used only to confirm the tab names). Citations are `KEY Tab!rN` (sheet row N, 1-based as shown in Google Sheets) or `KEY Tab!COL` for a whole column; `msg N` is the index of a message in the #wip-general Discord export; `Drive x.lua:L` is a line of a Lua file from the shared Drive folder; `TK Lnnn` is a line of `docs/research/insurgents_toolkit_reference.md`; `Lists: X` is `editor/data/lists.json`.

| Key | Source | What was used |
|---|---|---|
| `FL` | Google Sheet "FFXII Formulae List" (Drive id `1yyflms0sghclccDE5R3qb-NdiTFkiMimmhbuX5iYWUk`) | tabs Formulae (A1:AD111), Functions (A1:C255) |
| `DC` | Google Sheet "Description Calculator" (Drive id `1ku-FQVUluQDJ5zyzJixcDVccjv1EsnSbQ1h2bNyv6Cw`) | tabs Descriptions (A1:BK558), Data (augment names/descriptions, weapon formula labels) |
| `S13` | Google Sheet "Vanilla Section 13" (Drive id `1NZ0ezAqZ4bYecIsHbF04aYdsuZykOePa90aYnR6KuiI`) | tab Vanilla Section 13 (A1:AU558) |
| `S14` | Google Sheet "Vanilla Section 14 w/ Binary Calculator" (Drive id `1nm3f5DvkKvkMlcr1oknpgJwnk7Ud3sgXPaHKTcXbJMM`) | tabs Actions (A1:EX545, raw 60-byte hex per action in column A), Data (stacked id lists), Old Version |
| `Drive formulas.lua` | Drive file `1QaofIprWG1mrlhZlxXoxCDSRRMcJmeqS` (Xeavin), on-cast lists lines 2-111, on-hit lists lines 113-222 | Formula Extension function lists, compared with the sheet |
| `Lists: BpeFormulaList` | editor/data/lists.json (Insurgent's Toolkit list, 109 names) | name comparison |

## Where formula ids are stored

| File / table | Field | Type | Notes | Source |
|---|---|---|---|---|
| battle_pack.bin section 14 (actions) | action +0x08 `formula` | u8 | 0-108; 0 = "Attack Action" (use the equipped weapon's formula) | S14 Actions!L (verified against the raw bytes of all 543 actions); battlepack-s14-actions |
| battle_pack.bin section 13 (equipment) | weapon/ammo +0x19 `formula` | u8 | vanilla weapons use 20-27, 29, 64 (foe weapons) and 104 (maces); 28 Savage is unused | S13 Vanilla Section 13!N; battlepack-s13-equipment-attributes; msg 493 |
| FFXII_TZA.exe (memory) | formula -> function list | list of function ids bracketed by 0xFFFFFFFF bookends (id width and table address not documented) | read by the battle code; replaced by the Formula Extension | FL Formulae!F1:AD2 |

The battlepack container, VBF path (`ps2data/image/ff12/test_battle/<lang>/binaryfile/battle_pack.bin`) and st2e headers are described in [`container-battlepack`](./container-battlepack.md) and [`container-st2e`](./container-st2e.md); editing a formula id never changes any size or pointer.

## How the sheet describes a formula

Each row of the Formulae tab is one formula (FL Formulae!r3-r111):

| Column | Meaning |
|---|---|
| A ID | formula id (the u8 value) |
| B Name / C Type | name and category (Attack, Status, Healing, Damage - Magick, Weapon, ...) |
| D Summary / E Used By | what it does and which vanilla actions/weapons use it |
| F "CheckOnCast ->" | marker; present in exactly the 81 formulas whose on-cast list is empty (FL Formulae!F) |
| G-P On-Cast Functions | functions the sheet groups as on-cast (evade checks, knockback/counter/combo rolls, accuracy loaders) |
| Q "CheckOnHit ->" | marker; present in exactly the 28 formulas that have on-cast functions (FL Formulae!Q). The two markers never appear together; the sheet does not explain them further |
| R-AC On-Hit Functions | functions grouped as on-hit (accuracy and power loaders, modifiers, damage executor, status application) |
| AD FormulaEnd | end of the list |
| row 1 legend | italic = function has a replacement in the Extension; strike-through = removed from the Extension; colour groups: Halt Function, Minutiae, The Business, Bookends (0xFFFFFFFF) |

## Formula list (vanilla)

| Id | Name | Category | Summary | On-cast functions | On-hit functions | Source |
|---|---|---|---|---|---|---|
| 0 | Attack Action | Attack | Defaults to equipped weapon's formula | (none) | (none) | FL Formulae!r3 |
| 1 | Remove Statuses | Status | Removes one or more statuses as defined by Action data in Section 14 | (none) | 180 | FL Formulae!r4 |
| 2 | Add Buffs | Status | Adds one or more statuses as defined by Action data in Section 14; does not check target's Magick evade | (none) | 20, 30, 32, 40, 181 | FL Formulae!r5 |
| 3 | Add Debuffs | Status | Adds one or more statuses as defined by Action data in Section 14; checks target's Magick evade | 2 | 21, 31, 32, 40, 181 | FL Formulae!r6 |
| 4 | Restore HP | Healing | Restores HP based on user's Magick Power, Faith, and Augments; damages Undead and Reversed targets | (none) | 60, 90, 91, 110 | FL Formulae!r7 |
| 5 | Restore Full HP | Healing | Fully restores HP, considering Bubble and/or Disease, or destroys Undead | (none) | 3, 111 | FL Formulae!r8 |
| 6 | Revive | Healing | Removes KO and restores [Power]% of target's maximum HP; chance to KO Undead | (none) | 3, 4, 61, 90, 91, 112, 180 | FL Formulae!r9 |
| 7 | Magick Damage | Damage - Magick | Deals damage based on user's Action's Power and Multiplier, user's Magick Power and Potency, Weather, Faith, Shell, Augments, and Resistances; can also apply statuses as defined by Action's data | 2 | 62, 92, 93, 94, 95, 113, 170, 175, 182 | FL Formulae!r10 |
| 8 | Minus Strike | Damage - Magick | Deals damage equal to Power x [User's Maximum HP - User's Current HP] | 2 | 21, 31, 32, 40, 64, 114 | FL Formulae!r11 |
| 9 | No Exp KO | Damage - Magick | Reduces target's HP to 0, and reduces Exp and LP gained to 0 | 0, 2 | 21, 31, 32, 40, 190 | FL Formulae!r12 |
| 10 | KO | Damage - Magick | Reduces target's HP to 0 | 0, 2 | 1, 21, 31, 32, 40, 115 | FL Formulae!r13 |
| 11 | HP Drain | Draining - Magick | Reduces target's HP and restores user's HP; will do the opposite on Reversed or Undead targets | 2 | 62, 92, 93, 116 | FL Formulae!r14 |
| 12 | MP Drain | Draining - Magick | Reduces target's MP and restores user's MP | 0, 2 | 21, 31, 32, 40, 63, 117 | FL Formulae!r15 |
| 13 | Add Unsafe Statuses | Status | Adds one or more statuses as defined by Action data in Section 14; does check for target's Safety augment | (none) | 0, 20, 30, 32, 40, 181 | FL Formulae!r16 |
| 14 | HP % Reduction | Damage - Magick | Reduces target's HP by a % of its maximum HP as defined by [Power] in the Action data | 0, 2 | 21, 31, 32, 40, 64, 94, 95, 119, 170, 175, 182 | FL Formulae!r17 |
| 15 | Dire Magick Damage | Damage - Magick | If target is weak to Action's element, KO them. If immune, do nothing. If absorb, set target's HP to max. Otherwise set target's HP to single digits depending on randomness. | 0, 2 | 21, 31, 32, 40, 120 | FL Formulae!r18 |
| 16 | Knot of Rust | Damage - Neutral | Reduces target's HP by a random number equal to User's HP divided by 1~10, then increments the Dark Matter counter by the damage dealt | (none) | 121 | FL Formulae!r19 |
| 17 | Dark Matter | Damage - Neutral | Reduces target's HP by the sum total of all uses of Formula 16 since Formula 17 was last used, then resets the Dark Matter counter | (none) | 122 | FL Formulae!r20 |
| 18 | Comet | Damage - Neutral | Deals between 1~[User's Max HP] damage to target | (none) | 123 | FL Formulae!r21 |
| 19 | Meteor | Damage - Neutral | Deals between 1~9999 or 30,000 damage to target | (none) | 124 | FL Formulae!r22 |
| 20 | Martial Weapon | Weapon | Deals damage based on user's Strength and Attack Power, and target's Defense | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 28, 65, 96, 97, 98, 99, 125, 165, 171, 176, 182 | FL Formulae!r23 |
| 21 | Finesse Weapon | Weapon | Deals damage based on user's Strength, Speed, and Attack Power, and target's Defense | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 28, 66, 96, 97, 98, 99, 125, 165, 171, 176, 182 | FL Formulae!r24 |
| 22 | Enlightened Weapon | Weapon | Deals damage based on user's Strength, Magick Power, and Attack Power, and target's Defense | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 28, 67, 96, 97, 98, 99, 125, 165, 171, 176, 182 | FL Formulae!r25 |
| 23 | Brute Weapon | Weapon | Deals significantly randomized damage based on user's Strength, Vitality, and Attack Power, and target's Defense | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 28, 68, 96, 97, 98, 99, 126, 165, 171, 176, 182 | FL Formulae!r26 |
| 24 | Ki Weapon | Weapon | Deals damage based on user's Strength and Attack Power, and target's Magick Resist | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 28, 69, 96, 97, 98, 99, 125, 165, 171, 176, 182 | FL Formulae!r27 |
| 25 | Adroit Weapon | Weapon | Deals damage based on user's Strength, Speed, and Attack Power, and target's Defense | 5, 6, 22, 33, 34, 35, 42 | 29, 66, 96, 97, 98, 99, 125, 165, 171, 176, 182 | FL Formulae!r28 |
| 26 | Tactical Weapon | Weapon | Deals damage based on user's Strength and Attack Power, and target's Defense | 5, 6, 22, 33, 34, 36, 43 | 29, 65, 96, 97, 98, 99, 125, 165, 171, 176, 182 | FL Formulae!r29 |
| 27 | Piercing Weapon | Weapon | Deals damage based on Attack Power, ignoring target's Defense | 5, 6, 22, 33, 34, 44 | 29, 70, 96, 97, 98, 99, 125, 165, 171, 176, 182 | FL Formulae!r30 |
| 28 | Savage Weapon | Weapon | Deals damage based on user's Strength and Level, and target's Defense | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 28, 71, 96, 97, 98, 99, 125, 165, 171, 176, 182 | FL Formulae!r31 |
| 29 | Unarmed Weapon | Weapon | Deals damage based on user's Strength and Attack Power, and target's Defense | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 28, 72, 96, 97, 98, 125, 165 | FL Formulae!r32 |
| 30 | Self-Damaging Attack | Damage - Physical | Deals damage to target and to user | 16, 6 | 76, 103 | FL Formulae!r33 |
| 31 | Potions | Healing | Restores HP based on Power and Multiplier in Action data and Potion Lores | (none) | 23, 45, 74, 101, 127 | FL Formulae!r34 |
| 32 | Ethers | Healing | Restore MP based on Power and Multiplier in Action data and Ether Lores | (none) | 23, 45, 74, 101, 128 | FL Formulae!r35 |
| 33 | Elixirs | Healing | Fully Restores HP and MP | (none) | 129 | FL Formulae!r36 |
| 34 | Remove Status Items | Status | Removes one or more statuses as defined by Action data in Section 14 | (none) | 191 | FL Formulae!r37 |
| 35 | Add Status Items | Status | Adds one or more statuses as defined by Action data in Section 14 | (none) | 192 | FL Formulae!r38 |
| 36 | Phoenix Down | Healing | Removes KO and restores [Power]% of target's maximum HP, increased by Phoenix Lores; chance to KO Undead | (none) | 15, 4, 130, 180 | FL Formulae!r39 |
| 37 | HP % Reduction Items | Damage - Neutral | Does [Power]% of Max HP damage as selected element | (none) | 0, 24, 46, 75, 94, 95, 101, 119 | FL Formulae!r40 |
| 38 | First Aid | Healing | Restores 0~20% of target's maximum HP; misses if target is not HP Critical | (none) | 132 | FL Formulae!r41 |
| 39 | Shades of Black | Nothing | Shades of Black is hard-coded to its Action ID, this formula itself does nothing | 193 | (none) | FL Formulae!r42 |
| 40 | Horology | Damage - Neutral | Deals damage based on minute digit of game clock; damage is [user's level] x [0.5 x (minute digit)^2] | (none) | 47, 133 | FL Formulae!r43 |
| 41 | Stamp | Status | Transfer any statuses on the user to the target | (none) | 47, 185 | FL Formulae!r44 |
| 42 | Achilles | Special | Impose one elemental weakness on target | (none) | 0, 11, 47, 194 | FL Formulae!r45 |
| 43 | Charge | Healing | MP restore between [Level]~[Level x 1.5]; chance to fail is [current MP%+1]% | (none) | 48, 134 | FL Formulae!r46 |
| 44 | Add Status | Status | Adds one or more statuses as defined by Action data in Section 14; only checks caster's and target's levels to determine hit or miss | (none) | 47, 181 | FL Formulae!r47 |
| 45 | Souleater | Damage - Physical | Sacrifice 20% of user's maximum HP to deal 1.4 times the damage of a Strength-based weapon to target; heals Undead | (none) | 65, 135 | FL Formulae!r48 |
| 46 | Wither | Stat Changing | Reduces target's Strength by 30% permanently | (none) | 11, 47, 136 | FL Formulae!r49 |
| 47 | Addle | Stat Changing | Reduces target's Magick Power by 30% permanently | (none) | 11, 47, 137 | FL Formulae!r50 |
| 48 | Bonecrusher | Damage - Neutral | Reduces target's HP to 0, but heavily damages user | (none) | 0, 47, 140 | FL Formulae!r51 |
| 49 | Steal | Special | Steal from one foe, affected by Thief's Cuffs | (none) | 195 | FL Formulae!r52 |
| 50 | Telekinesis | Damage - Neutral | Damages a flying target based on user's Attack; misses if user's weapon can target flying things | (none) | 12, 47, 141 | FL Formulae!r53 |
| 51 | Expose | Stat Changing | Reduces target's Defense by 10% permanently | (none) | 11, 47, 138 | FL Formulae!r54 |
| 52 | Shear | Stat Changing | Reduces target's Magick Resist by 10% permanently | (none) | 11, 47, 139 | FL Formulae!r55 |
| 53 | Charm | Status | Confuses target | (none) | 0, 11, 47, 181 | FL Formulae!r56 |
| 54 | Revive | Healing | remove KO and fully restore one ally's HP; the animation for Revive is what KO's the user | (none) | 142, 180 | FL Formulae!r57 |
| 55 | Sight Unseeing | Damage - Neutral | Reduces target's HP to 0~8 but misses if user is not Blinded | (none) | 0, 13, 47, 143 | FL Formulae!r58 |
| 56 | Numerology | Damage - Neutral | Deals damage that doubles with each hit and resets if it misses | (none) | 49, 144 | FL Formulae!r59 |
| 57 | Libra | Status | Reveal more detailed target info and show traps in the field | (none) | 181 | FL Formulae!r60 |
| 58 | Poach | Special | Capture HP Critical foes to obtain loot, forfeiting Exp, LP, gil, and other drops | (none) | 0, 14, 47, 196 | FL Formulae!r61 |
| 59 | 1000 Needles | Damage - Neutral | Deals damage equal to [Power] x [Multiplier] | (none) | 47, 145 | FL Formulae!r62 |
| 60 | Traveler | Damage - Neutral | Deals damage based on the number of steps the party has taken since the last time Traveler was used | (none) | 146 | FL Formulae!r63 |
| 61 | Gil Toss | Damage - Neutral | Spend up to 10,000 gil to deal up to 10,000 damage, divided evenly among targets in range | 18 | 147 | FL Formulae!r64 |
| 62 | Summon | Nothing | Summons are hard-coded to their Action IDs, this formula itself does nothing | (none) | (none) | FL Formulae!r65 |
| 63 | Esper Killer | Damage - Magick | Deals Magick damage which increases if the target is an Esper | 2 | 62, 92, 93, 94, 95, 89, 113, 170, 175, 182 | FL Formulae!r66 |
| 64 | Enemy Attack | Damage - Physical | Deals physical damage based on caster's weapon | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 28, 76, 96, 97, 98, 99, 125, 165, 166, 171, 176, 182 | FL Formulae!r67 |
| 65 | Enemy Technick | Damage - Physical | Damage scales with STR; Power 12~13 is about equal to a regular attack; Multiplier doesn't matter | 16, 6, 25, 33, 34, 41 | 77, 102, 97, 95, 113, 170, 175, 182 | FL Formulae!r68 |
| 66 | Cinematic Technick | Damage - Physical | Damage scales with STR | 16, 6, 26, 41 | 77, 102, 97, 95, 113, 170, 175, 182 | FL Formulae!r69 |
| 67 | Leech | Draining - Physical | Damage target and restores HP equal to damage dealt; does not check for Reverse or Undead | (none) | 76, 148 | FL Formulae!r70 |
| 68 | Enemy HP % Reduction | Damage - Magick | Damage based on percentage set by "Power" | (none) | 0, 21, 40, 64, 95, 119, 170, 175, 182 | FL Formulae!r71 |
| 69 | Warsong | Stat Changing | Increments target's Strength by [Power]%, does not work on party members | (none) | 11, 149 | FL Formulae!r72 |
| 70 | Vespersong | Stat Changing | Increments target's Magick by [Power]%, does not work on party members | (none) | 11, 150 | FL Formulae!r73 |
| 71 | Dual Restore HP | Healing | Heals target and user based on Magick Power; no interactions with Undead | (none) | 60, 90, 91, 151 | FL Formulae!r74 |
| 72 | Enemy Debuff | Status | Inflicts statuses, checks Magick accuracy, does no damage | (none) | 21, 40, 181 | FL Formulae!r75 |
| 73 | Enemy Buff | Status | Inflicts statuses, does not check Magick accuracy, does no damage | (none) | 181 | FL Formulae!r76 |
| 74 | Invert | Special | Swaps current HP and MP values | (none) | 152 | FL Formulae!r77 |
| 75 | MP % Reduction | Damage - Neutral | Deal damage to MP based on Power and Power Multiplier | (none) | 153 | FL Formulae!r78 |
| 76 | MP % Set | Special | Set MP equal to percentage equal to "Power" Range: 1-100 | (none) | 154 | FL Formulae!r79 |
| 77 | HP/MP % Set | Special | Set HP/MP equal to percentage; "Power" for MP and "Multiplier" for HP | (none) | 155 | FL Formulae!r80 |
| 78 | Fixed HP Restore | Healing | Restores HP equal to [Power] x [Multiplier] | (none) | 156 | FL Formulae!r81 |
| 79 | Add Augment | Augment | Bestows Augment(s) based on Action's Power and Multiplier; does not work on party members | (none) | 11, 187 | FL Formulae!r82 |
| 80 | Remove Augment | Augment | Removes Augment(s) based on Action's Power and Multiplier; does not work on party members | (none) | 11, 188 | FL Formulae!r83 |
| 81 | Empty | Nothing |  | (none) | (none) | FL Formulae!r84 |
| 82 | Level Divisor Add Status | Status | Adds statuses from Action data if target's level is divisible by the Action's Multiplier | (none) | 17, 181 | FL Formulae!r85 |
| 83 | Self-Destruction | Damage - Magick | deal damage to target and ignore its defense, the animations for these technicks are what KO's the user (except for Self-Sacrifice) | (none) | 157, 60, 92, 93, 94, 95, 113, 170, 175, 182 | FL Formulae!r86 |
| 84 | HP % Restore | Healing | Restores [Power]% of maximum HP | (none) | 158 | FL Formulae!r87 |
| 85 | MP % Restore | Healing | Restores [Power]% of maximum MP | (none) | 159 | FL Formulae!r88 |
| 86 | Dimensional Rift | Damage - Neutral | Reduces target's HP to 0, the animation for Dimensional Rift is what KO's the user | (none) | 0, 160 | FL Formulae!r89 |
| 87 | Level Up | Stat Changing | Increases target's level by [Current Level] x [Power/100]; only works on enemies | (none) | 11, 161 | FL Formulae!r90 |
| 88 | Cannibalize | Stat Changing | KO's target, restores user's HP by target's remaining HP, and increases user's level by 20% up to 99 | (none) | 0, 162 | FL Formulae!r91 |
| 89 | Empty | Nothing |  | (none) | (none) | FL Formulae!r92 |
| 90 | Empty | Nothing | These enemy actions are tied to their Action IDs, this formula itself does nothing | (none) | 198 | FL Formulae!r93 |
| 91 | Empty | Nothing | These enemy actions are tied to their Action IDs, this formula itself does nothing | (none) | 199 | FL Formulae!r94 |
| 92 | Quickening | Damage - Neutral | Deals damage based on Action's Power, user's Strength, and randomness, targetting Defense | (none) | 104 | FL Formulae!r95 |
| 93 | Concurrences | Damage - Neutral | Deals damage based on number of Quickenings performed and target's level | (none) | 105 | FL Formulae!r96 |
| 94 | HP Damage Traps | Damage - Neutral | Heavily randomized but Power influences upper limit, can always hit as low as 1 | (none) | 106 | FL Formulae!r97 |
| 95 | MP Damage Traps | Damage - Neutral | Heavily randomized but Power influences upper limit, can always hit as low as 1 | (none) | 107 | FL Formulae!r98 |
| 96 | HP Restore Trap | Healing | Heavily randomized but Power influences upper limit, can always hit as low as 1 | (none) | 108 | FL Formulae!r99 |
| 97 | MP Restore Trap | Healing | Heavily randomized but Power influences upper limit, can always hit as low as 1 | (none) | 109 | FL Formulae!r100 |
| 98 | Debuff Traps | Status | Adds one or more statuses as defined by Action data | (none) | 181 | FL Formulae!r101 |
| 99 | Gil Loss Trap | Special | Removes 1~[Level x 99] gil from party | (none) | 163 | FL Formulae!r102 |
| 100 | Infuse | Healing | Consumes all user's MP to set target's HP to x10 that amount | (none) | 0, 164 | FL Formulae!r103 |
| 101 | Reserve Items | Special | Load Power and Multiplier from Action data and uses them to set teleportation coordinates | (none) | 200 | FL Formulae!r104 |
| 102 | Chain Bonus | Special | restores HP or MP and might grant Protect or Shell based on current chain status; accounts for Disease, Bubble, and Zero MP | (none) | 201 | FL Formulae!r105 |
| 103 | Enemy Combo | Damage - Physical | Deals damage based on user's Attack and target's Defense | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 28, 78, 96, 97, 98, 99, 125, 165, 166, 171, 176, 181 | FL Formulae!r106 |
| 104 | Sage Weapon | Weapon | Deals damage based on user's Magick Power and Attack Power, and target's Defense | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 28, 79, 96, 97, 98, 99, 125, 165, 171, 176, 181 | FL Formulae!r107 |
| 105 | Esper Specials | Damage - Magick | Deals damage based on user's Action's Power and Multiplier, user's Magick Power and Potency, Weather, Faith, Shell, Augments, and Resistances | (none) | 62, 92, 93, 94, 95, 113 | FL Formulae!r108 |
| 106 | Piercing HP % Reduction | Damage - Neutral | Reduces target's HP by a % of its maximum HP as defined by [Power] in the Action data | (none) | 64, 94, 95, 119 | FL Formulae!r109 |
| 107 | Fixed HP Damage | Damage - Neutral | Deals [Power] x [Multiplier] damage | (none) | 145 | FL Formulae!r110 |
| 108 | Big Bang | Damage - Neutral | Damage is [Lost HP] x Power | (none) | 64, 114 | FL Formulae!r111 |

Vanilla users of each formula are in the JSON enum `FormulaUsedBy` (FL Formulae!E).

### Formula Extension lists that differ from the vanilla lists

Xeavin's formulas.lua (Drive) holds the Extension's lists; they use the functions the Functions tab marks as "used by the Formula Extension" instead of their vanilla duplicates and drop the "DoesNothing" functions. Rows where the two lists differ:

| Id | Vanilla on-cast | Extension on-cast | Vanilla on-hit | Extension on-hit |
|---|---|---|---|---|
| 8 | 2 | 2 | 21, 31, 32, 40, 64, 114 | 21, 31, 32, 40, 61, 114 |
| 12 | 0, 2 | 0, 2 | 21, 31, 32, 40, 63, 117 | 21, 31, 32, 40, 60, 117 |
| 14 | 0, 2 | 0, 2 | 21, 31, 32, 40, 64, 94, 95, 119, 170, 175, 182 | 21, 31, 32, 40, 61, 94, 95, 119, 170, 175, 182 |
| 20 | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 28, 65, 96, 97, 98, 99, 125, 165, 171, 176, 182 | 65, 96, 97, 98, 99, 113, 165, 171, 175, 182 |
| 21 | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 28, 66, 96, 97, 98, 99, 125, 165, 171, 176, 182 | 66, 96, 97, 98, 99, 113, 165, 171, 175, 182 |
| 22 | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 28, 67, 96, 97, 98, 99, 125, 165, 171, 176, 182 | 67, 96, 97, 98, 99, 113, 165, 171, 175, 182 |
| 23 | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 28, 68, 96, 97, 98, 99, 126, 165, 171, 176, 182 | 68, 96, 97, 98, 99, 126, 165, 171, 175, 182 |
| 24 | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 28, 69, 96, 97, 98, 99, 125, 165, 171, 176, 182 | 69, 96, 97, 98, 99, 113, 165, 171, 175, 182 |
| 25 | 5, 6, 22, 33, 34, 35, 42 | 5, 6, 22, 33, 34, 35, 42 | 29, 66, 96, 97, 98, 99, 125, 165, 171, 176, 182 | 29, 66, 96, 97, 98, 99, 113, 165, 171, 175, 182 |
| 26 | 5, 6, 22, 33, 34, 36, 43 | 5, 6, 22, 33, 34, 36, 43 | 29, 65, 96, 97, 98, 99, 125, 165, 171, 176, 182 | 29, 65, 96, 97, 98, 99, 113, 165, 171, 175, 182 |
| 27 | 5, 6, 22, 33, 34, 44 | 5, 6, 22, 33, 34, 44 | 29, 70, 96, 97, 98, 99, 125, 165, 171, 176, 182 | 29, 70, 96, 97, 98, 99, 113, 165, 171, 175, 182 |
| 28 | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 28, 71, 96, 97, 98, 99, 125, 165, 171, 176, 182 | 71, 96, 97, 98, 99, 113, 165, 171, 175, 182 |
| 29 | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 28, 72, 96, 97, 98, 125, 165 | 72, 96, 97, 98, 113, 165 |
| 30 | 16, 6 | 16, 6 | 76, 103 | 65, 103 |
| 31 | (none) | (none) | 23, 45, 74, 101, 127 | 23, 40, 74, 101, 127 |
| 32 | (none) | (none) | 23, 45, 74, 101, 128 | 23, 40, 74, 101, 128 |
| 37 | (none) | (none) | 0, 24, 46, 75, 94, 95, 101, 119 | 0, 23, 40, 61, 94, 95, 101, 119 |
| 39 | 193 | (none) | (none) | (none) |
| 64 | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 28, 76, 96, 97, 98, 99, 125, 165, 166, 171, 176, 182 | 65, 96, 97, 98, 99, 113, 165, 166, 171, 175, 182 |
| 66 | 16, 6, 26, 41 | 16, 6, 23, 41 | 77, 102, 97, 95, 113, 170, 175, 182 | 77, 102, 97, 95, 113, 170, 175, 182 |
| 67 | (none) | (none) | 76, 148 | 65, 148 |
| 68 | (none) | (none) | 0, 21, 40, 64, 95, 119, 170, 175, 182 | 0, 21, 40, 61, 95, 119, 170, 175, 182 |
| 86 | (none) | (none) | 0, 160 | 0, 115 |
| 90 | (none) | (none) | 198 | (none) |
| 91 | (none) | (none) | 199 | (none) |
| 103 | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 28, 78, 96, 97, 98, 99, 125, 165, 166, 171, 176, 181 | 78, 96, 97, 98, 99, 113, 165, 166, 171, 175, 182 |
| 104 | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 5, 6, 7, 8, 9, 10, 22, 33, 34, 41 | 28, 79, 96, 97, 98, 99, 125, 165, 171, 176, 181 | 79, 96, 97, 98, 99, 113, 165, 171, 175, 182 |
| 106 | (none) | (none) | 64, 94, 95, 119 | 61, 94, 95, 119 |
| 108 | (none) | (none) | 64, 114 | 61, 114 |

All differences except formula 66 (26 vs 23) and 103/104 (181 vs 182) are explained by the replacement notes below (64->61, 63->60, 125->113, 45/46->40, 24->23, 75->61, 76->65, 160->115, 28/193/198/199 removed) plus 176->175 (weapon on-hit status roll), which the Extension also applies.

## Formula functions

Function id -> name and description (FL Functions!A2:C255). Ids are the values inside a formula's function list.

| Id | Function | Description | Note |
|---|---|---|---|
| 0 | SafetyHalt | if target has Safety augment, skip remaining functions |  |
| 1 | UndeadDeathHeal | if target is undead, fully restore target's HP |  |
| 2 | MagickEvadeCheck | calculates target's chance to evade this action based on target's Magick Evade, Licenses, and Luck |  |
| 3 | UndeadFullRaise | if target is Undead, process functions 0x00 -> 0x14 -> 0x1F -> 0x20 -> 0x28, then try to set HP of target to 0; else proceed with formula |  |
| 4 | TargetRaiseHalt | if target isn't a party member and KO'd, skip all remaining functions |  |
| 5 | WeaponKnockbackCalc | calculate knockback chance based on user's weapon, RNG, and user/target level ratio |  |
| 6 | KnockbackExec | check for knockback immunity, then determine if knockback occurs |  |
| 7 | CounterCalc | calculate chance this action will be countered by target based on target's speed/augments |  |
| 8 | CounterExec | determine if counter occurs |  |
| 9 | ComboCalc | calculate chance of combo or critical hit, factoring in Genji Gloves augment |  |
| 10 | ComboExec | use previous combo calculation to determine if action combos, then uses caster's HP to determine how many hits |  |
| 11 | TargetPartyHalt | it target is a party member, skip all remaining functions |  |
| 12 | WeaponHitsFlyingHalt | if caster's weapon is able to hit flying enemies, skip all remaining functions |  |
| 13 | UserNotBlindHalt | if caster has Blind status, proceed with formula; else, Action misses and displays Sight Unseeing's "must be blinded" message |  |
| 14 | TargetNotHPCriticalHalt | if target has HP Critical status, proceed with formula; else, Action misses and displays Poach's miss condition message |  |
| 15 | ReverseUndeadPhoenix | heals target to full HP if it is undead and caster has Item Reverse |  |
| 16 | ActionKnockbackCalc | calculate knockback chance based on Action data, RNG, and user/target level ratio |  |
| 17 | LevelIndivisibleHalt | if target's level is divisible by Action's Multiplier, or if Multiplier is 1 and target's level is a prime number, continue; else formula misses |  |
| 18 | GilTossCalc | consumes up to 10,000 gil based on remaining HP of target(s); this value is stored in memory |  |
| 20 | MagickAccSupport | adds user's Magick Power / 3 to the Accuracy Rate of the Action |  |
| 21 | MagickAccOffense | contests user's Magick Power v. target's Vitality to calculate Accuracy Rate |  |
| 22 | GetEvasion100Acc | loads target's evasion from shield/weapon/parry and set Accuracy to 100 into memory |  |
| 23 | GetMedicineAcc | loads Accuracy Rate from Action data |  |
| 24 | GetFangAcc | loads Accuracy Rate from Action data | Duplicate of Function 23, which is used by the Formula Extension; Available slot for custom functionality |
| 25 | GetEvaActionAcc | loads target's evasion from shield/weapon/parry and gets Accuracy from Action data |  |
| 26 | NixEvaActionAcc | sets target's evasion from shield/weapon/parry to 0 and gets Accuracy from Action data |  |
| 28 | DoesNothing |  | Deleted from the Formula Extension; Available slot for custom functionality |
| 29 | CritCalc | calculate whether or not a critical hit happens |  |
| 30 | FaithAccSupport | if user has Faith, increases accuracy rate by 50% |  |
| 31 | FaithShellAccOffense | if target has Shell, halve accuracy; if user has Faith, increase accuracy by 50% |  |
| 32 | MagickAugAcc | double accuracy if caster has Spellbreaker and HP Critical, or if caster has Serenity and full HP |  |
| 33 | WeaponStatusAcc | user's Accuracy halved if Blind, target's Parry=0 if user is Invisible or target is Sleep/Stop/Disable/Immobilize, target's ShieldEvade/WeaponEvade=0 if user is Invisible or target is Stop/Sleep/Disable |  |
| 34 | WeaponAugAcc | factors in 3 Shield Block, Shield Boost, and IgnoreEvade augments |  |
| 35 | BowWeatherAcc | reduces Accuracy by 20% in bad weather |  |
| 36 | CrossbowWeatherAcc | halves Accuracy in bad weather |  |
| 37 | ItemAccuracyBoost | user's Accuracy is doubled if user has the Item Plus augment | Not used in vanilla |
| 40 | MagickHitOrMiss | compare current Accuracy to random # 1~100 to determine hit or miss |  |
| 41 | StrengthEvaKnock | something about evasion and knockback |  |
| 42 | BowEvaKnock | something about evasion and knockback |  |
| 43 | CrossbowEvaKnock | something about evasion and knockback |  |
| 44 | GunHitOrMiss | compare current Accuracy to random # 1~100 to determinte hit or miss |  |
| 45 | MedicineHitOrMiss | compare current Accuracy to random # 1~100 to determine hit or miss | Duplicate of Function 40, which is used by the Formula Extension |
| 46 | FangsHitOrMiss | compare current Accuracy to random # 1~100 to determine hit or miss | Duplicate of Function 40, which is used by the Formula Extension |
| 47 | LevelHitOrMiss | uses current Accuracy value and compares user's and target's level to determine hit or miss |  |
| 48 | ChargeHitOrMiss | calculates chance for Charge to fail; removing this function makes Charge always work; chance to fail should be ([CurrentMP]x100/[MaxMP]+1)% |  |
| 49 | NumerologyIncrementAndHitOrMiss | Calculates chance to hit for Numerology and increment its counter |  |
| 60 | GetRawMagickPower | sets Power and Multiplier for healing Magick and sets defense to 0 |  |
| 61 | GetHealingFractionalPower | current Action's Power is loaded in memory |  |
| 62 | AttackMagickPower | sets Power and Multiplier for attack Magick and targets Magick resistance |  |
| 63 | GetSyphonPower | sets Power and Multiplier for Syphon and sets defense to 0 | Duplicate of Function 60, which is used by the Formula Extension |
| 64 | GetMagickFractionalPower | current Action's Power is loaded in memory | Duplicate of Function 61, which is used by the Formula Extension |
| 65 | MartialPower | sets Power and Multiplier for Str-based weapons and targets defense |  |
| 66 | FinessePower | sets Power and Multiplier for Spd-based weapons and targets defense |  |
| 67 | EnlightenedPower | sets Power and Multiplier for Mag-based weapons and targets defense |  |
| 68 | BrutePower | sets Power and Multiplier for Vit-based weapons and targets defense |  |
| 69 | KiPower | sets Power and Multiplier for Str-based weapons and targets Magick resistance |  |
| 70 | PiercingPower | sets Power and Multiplier for Attack-based, piercing weapons and sets defense to 0 |  |
| 71 | SavagePower | sets Power and Multiplier for Unknown weapons and targets defense |  |
| 72 | UnarmedPower | sets Power and Multiplier for Unarmed attacks and targets defense; checks for Brawler augment |  |
| 74 | GetItemPower | sets Power and Multiplier from Action data |  |
| 75 | GetFangFractionalPower | current Action's Power is loaded in memory | Duplicate of Function 61, which is used by the Formula Extension |
| 76 | EnemyAttackPower | sets Power and Multiplier for Enemy attacks and targets defense | Duplicate of Function 65, which is used by the Formula Extension |
| 77 | EnemyTechnickPower | sets Power and Multiplier for Enemy Technicks and targets defense |  |
| 78 | EnemyWeaponPower | sets Power and Multiplier for Enemy Attack Type 2 and targets defense |  |
| 79 | SagePower | sets Power and Multiplier for Maces and targets defense |  |
| 89 | TargetEsperPower | increases actionPower if target is an Esper |  |
| 90 | FaithDiseasePower | increases actionPower if user has Faith and reduces actionPower to 0 if target has Disease |  |
| 91 | HealerHPSpellAugPower | increases Action Power for Healing Magick based on Spellbreaker, Serenity, caster's HP |  |
| 92 | AttackMagickStatusInteractions | checks user for Faith and target for Sleep/Shell/Oil/Float |  |
| 93 | CasterHPSpellAugPower | increases Action Power for Attack Magick based on Spellbreaker, Serenity, caster's HP, and Type |  |
| 94 | WeatherTerrainElementMods | Attack Magick Weather Interactions |  |
| 95 | ElementalAffinities | Modifies Action damage based on Elemental Affinities |  |
| 96 | WeaponStatusInteractions | Modifies Weapon damage based on Petrification/Berserk/Bravery/Sleep/Protect/Oil |  |
| 97 | WeaponAugmentInteractions | Modifies Weapon damage based on Adrenaline/Focus/LastStand/ResistPiercing augments |  |
| 98 | CriticalHitMultiplier | Doubles action's Power if Critical State is 1 |  |
| 99 | WeaponElementalAffinities | Modifies Weapon damage based on Elemental Affinities |  |
| 101 | ItemBoost | Increases potencies of items based on ItemBoost augment |  |
| 102 | EnemyTechnickStatusInteractions | Modifies Foe Technick damage based on Petrification/Berserk/Bravery/Sleep/Protect/Oil/Float |  |
| 103 | SelfDamagingAttack | Calculates damage to deal to both caster and target |  |
| 104 | Quickening | Calculates damage for Quickenings based on Action Power and caster's Strength |  |
| 105 | Concurrence | Calculates damage to deal based on Action power and target's level |  |
| 106 | HPDamageTrap | deals damage based on Action power and target's level |  |
| 107 | MPDamageTrap | deals MP damage based on Action power and target's level |  |
| 108 | HPRestoreTrap | restores HP based on Action power and target's level |  |
| 109 | MPRestoreTrap | restores MP based on Action power and target's level |  |
| 110 | HealExec | checks for Undead/Reverse and then either restores or damages HP based on previous calculations |  |
| 111 | CurrentAndMaxHPCompare | compares target's current HP to max HP, considering Undead w/ Reverse, and effects of Disease and Bubble |  |
| 112 | CalculateRemoveKOHealing | target gains Action Power% of maximum HP |  |
| 113 | MagickDamageExec | calculates damage done to target, factoring in Immunity/Absorption/Reverse |  |
| 114 | MinusStrikeDamage | deals damage equal to [User's missing HP]x[Power] |  |
| 115 | Kill | sets target's HP to 0 |  |
| 116 | DrainHP | misses on Self, calculates hit or miss based on Magick Power, sets targetRemovedHP and casterAddedHP based on actionPower, accounts for Undead and Reverse states |  |
| 117 | SyphonMP | if target isn't self, set removedTargetMP and addedCasterMP based on Power x Power Multiplier, up to target's current MP |  |
| 118 | BubbleHPSet | doubles target's current HP | linked from other functions, not used on its own by any formula |
| 119 | PercentageDamage | deals damage equal to target's [Power]% Max HP, accounting for Disease, Bubble, and Reverse effects |  |
| 120 | DireMagick | If target is weak to action's element, KO them. If immune, skip all remaining functions. If absorb, set HP to max. Otherwise set HP to single digits depending on randomness. |  |
| 121 | KnotOfRust | [user's current HP]/[1~10] damage to target |  |
| 122 | DarkMatter | deals damage equal to all Knot of Rust damage since this function was last invoked, then resets the Dark Matter counter |  |
| 123 | Comet | deal between 1~[User's Max HP] damage |  |
| 124 | Meteor | deal 1~9999 or 30,000 damage |  |
| 125 | WeaponDamageExec | calculates damage done to target, factoring in Immunity/Absorption/Reverse | Duplicate of Function 113, which is used by the Formula Extension |
| 126 | RandomWeaponDamageExec | calculates damage done to target, factoring in Immunity/Absorption/Reverse with high randomness |  |
| 127 | PotionExec | adds potency based on 3x Potion Lores to Action's Power and Multiplier, accounts for Undead, Reverse, Item Reverse, then applies healing or damage |  |
| 128 | EtherExec | adds potency based on 3x Ether Lores to Action's Power and Multiplier, then restores MP to target |  |
| 129 | ElixirExec | Sets HP/MP/Mist to maximum, accounting for Safety, Bubble, Disease, Undead, Item Reverse, ZeroMP |  |
| 130 | PhoenixHPRestore | restores % of maximum HP based on Power, then augmented by Item Boost, Phoenix Lores x3, Disease, and Bubble |  |
| 132 | FirstAid | if target is Critical HP, heals between 1~20% of target's max HP, accounting for Disease and Bubble |  |
| 133 | HorologyDamage | deals [User's Level]x[Minute Digit]² damage |  |
| 134 | ChargeMP | restores [Target's Level]~[Target's Level]x2-1 MP |  |
| 135 | Souleater | consumes 20% of user's max HP to deal damage based on preceding functions and Power * 1.7 * (Multiplier - Defense); if target is undead, heals target based on preceding functions and Power * 2 * (Multiplier - Defense) |  |
| 136 | StrenthDown | reduces target's Strength by 30% permanently |  |
| 137 | MagickDown | reduces target's Magick Power by 30% permanently |  |
| 138 | DefenseDown | reduces target's Defense by 10% permanently |  |
| 139 | ResistDown | reduces target's Resist by 10% permanently |  |
| 140 | Bonecrusher | 45% chance to KO caster, otherwise removes a % from 0~100 of caster's HP and sets target's HP to 0 |  |
| 141 | RandomLevelDamage | deals randomized damage based on target's level and caster's attackPower |  |
| 142 | FullHPRestore | target must be KO'd and not the caster, then sets target's HP to max accounting for Disease and Bubble |  |
| 143 | DireHit | sets target's HP to 0~8 |  |
| 144 | NumerologyDamage | target's HP is reduced by 2^(Numerology Counter) |  |
| 145 | FixedHPDamage | removes HP from target equal to Power x Multiplier |  |
| 146 | StepDamage | Deals damage based on Steps taken since last usage, then resets counter (0-99 steps get Step x 1, 100-499 steps get Step x 2, 500-989 steps get Step x 3, 990-999 steps get Step x 10) |  |
| 147 | GilTossExec | Deals damage determined by GilTossCalc, divided evenly among targets in range; if GilTossCalc was not called, it misses |  |
| 148 | Leech | Calculates HP to remove from target and add to caster based on current Action Power and Power Multiplier |  |
| 149 | StrUp | Set target strength to (target.strength * action.power / 100) + target.strength; caps at 255 |  |
| 150 | MagUp | Set target Magick to (target.Magick * action.power / 100) + target.Magick; caps at 255 |  |
| 151 | DualHeal | restores HP to target and caster based on current Action Power and Multiplier; ignores Reverse and Undead |  |
| 152 | Invert | swaps target's current HP and MP values, accounting for Bubble, Disease, and Zero MP |  |
| 153 | MPDamage | removes target's MP by a % defined by Action Power; caps at 9999; accounts for Zero MP |  |
| 154 | MPSet | sets target's MP to a % of max defined by Action Power; accounts for Zero MP |  |
| 155 | HPMPSet | sets target's HP to a % of max based on Action Multiplier and MP to a % of max defined by Action Power; accounts for Zero MP, Disease, and Bubble |  |
| 156 | FixedHPRestore | restores HP to target equal to Power x Multiplier |  |
| 157 | SelfHalt | if target is self, skip remaining functions |  |
| 158 | PercentageHPRestore | restores [Power]% of maximum HP, no floating text; accounts for Bubble and Disease; no Undead interaction |  |
| 159 | PercentageMPRestore | Restores [Power]% of maximum MP, no floating text; accounts for Zero MP |  |
| 160 | Kill2 | sets target's HP to 0 | Duplicate of Function 115, which is used by the Formula Extension |
| 161 | LevelUp | sets target's Level to [currentLevel + (currentLevel * actionPower)/100], with a cap of 99 |  |
| 162 | Cannibalize | sets user's Level to [currentLevel + (currentLevel * actionPower)/100], with a cap of 99, removes all target's HP, restores caster's HP by target's reduced HP amount, sets exp and LP gained to 0 |  |
| 163 | GilLoss | Removes 1~[Level x 99] gil from party |  |
| 164 | Infuse | reduces caster's MP to zero, then sets target's HP to 10x that amount, accounts for Bubble and Disease |  |
| 165 | AttackAugments | increases targetSubtractedHP by 20% if caster has Attack Plus augment and then by 100% if caster has HP Attack augment |  |
| 166 | AdditionalPowerMultiplier | increases damage dealt based on Action data's Additional Power Multiplier |  |
| 170 | LoadOnHitRate | gets onHitRate for current Action |  |
| 171 | LoadWeaponOnHitRate | gets onHitRate from current main and offhand gear |  |
| 175 | OnHitStatus | compare current onHitRate to random # 1~100 to determine if statuses in Action data are applied |  |
| 176 | OnHitWeaponExec | compare current onHitRate to random # 1~100 to determine status effect hit or miss |  |
| 180 | RemoveStatus | If target has a status defined by the Action, remove those status(es); else Formula misses |  |
| 181 | AddStatus | Check for Immunities and then add statuses defined by Action |  |
| 182 | AddStatus | Check for Immunities and then add statuses defined by Action |  |
| 185 | StampEffects | Copies status(es) from User to Target ONLY IF they are checked in the Action data |  |
| 187 | AddAugment | grants an Augment to Target: Augment(s) given are defined by either/or Power and Multiplier; some augments (Shift, Mass-Destruct) don't work on players; use 255 in one field if you only want 1 augment; any augments given can be assigned a timer in Section 58 or last forever |  |
| 188 | RemoveAugment | removes augments from target defined by either/or Power and Multiplier |  |
| 190 | KillNoExp | Sets target's HP to 0, party gains no Exp or LP |  |
| 191 | StatusRemoveItem | Remove statuses as defined by Action data, accounting for Item Reverse, misses on KO'd targets |  |
| 192 | StatusInflictItem | Add statuses defined by Action, accounting for Item Reverse |  |
| 193 | DoesNothing |  | Deleted from the Formula Extension; Available slot for custom functionality |
| 194 | RandomElementalWeakness | picks 1/8 elements at random, attempts to make target weak to it, misses if target is already weak to it |  |
| 195 | Steal | misses on party members, then calculates steal chance and item obtained based on randomness, Thievery augment, and target Steal tables |  |
| 196 | Poach | misses on party members, then calculates poach rarity, sets target's HP to 0, and sets earned Exp and LP to 0 |  |
| 198 | DoesNothing |  | Deleted from the Formula Extension; Available slot for custom functionality |
| 199 | DoesNothing |  | Deleted from the Formula Extension; Available slot for custom functionality |
| 200 | ReservePower | loads Power and Multiplier from Action data for an unknown purpose |  |
| 201 | ChainBonus | restores HP or MP and might grant Protect or Shell based on current chain status; accounts for Disease, Bubble, and Zero MP |  |

Free slots ("Unused - available slot for custom functionality"): 19, 27, 38, 39, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 80, 81, 82, 83, 84, 85, 86, 87, 88, 100, 167, 168, 169, 172, 173, 174, 177, 178, 179, 183, 184, 186, 189, 197, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255. Ids missing from the tab: 73, 131.

## Short weapon-formula labels

The Description Calculator builds equipment help text and names the weapon formulas with these short labels (DC Data!D2:E12):

| Formula | Label |
|---|---|
| 20 | Martial (STR v. DEF) |
| 21 | Finesse (STR/SPD v. DEF) |
| 22 | Enlightened (STR/MAG v. DEF) |
| 23 | Brute (STR/VIT v. DEF) |
| 24 | Ki (STR  v. RES) |
| 25 | Adroit (STR v. DEF) |
| 26 | Tactical (STR v. DEF) |
| 27 | Piercing (Ignores DEF) |
| 28 | Savage (Level/STR v. DEF) |
| 29 | Unarmed (STR v. DEF) |
| 104 | Sage (MAG v. DEF) |

## Toolkit names vs sheet names

The Insurgent's Toolkit list (`BpeFormulaList`) uses mostly the same names. Differences:

| Id | Sheet | Toolkit |
|---|---|---|
| 0 | Attack Action | None |
| 1 | Remove Statuses | Remove Status |
| 2 | Add Buffs | Add Buff |
| 3 | Add Debuffs | Add Debuff |
| 13 | Add Unsafe Statuses | Add Unsafe Status |
| 31 | Potions | Potion |
| 32 | Ethers | Ether |
| 33 | Elixirs | Elixir |
| 34 | Remove Status Items | Remove Status Item |
| 35 | Add Status Items | Add Status Item |
| 37 | HP % Reduction Items | HP % Reduction Item |
| 68 | Enemy HP % Reduction | Enemy Fractional |
| 77 | HP/MP % Set | HP / MP % Set |
| 81 | Empty | Reserve (0x51) |
| 82 | Level Divisor Add Status | Add Status Level Divisor |
| 89 | Empty | Reserve (0x59) |
| 90 | Empty | Reserve (0x5A) |
| 91 | Empty | Reserve (0x5B) |
| 93 | Concurrences | Concurrence |
| 94 | HP Damage Traps | HP Damage Trap |
| 95 | MP Damage Traps | MP Damage Trap |
| 98 | Debuff Traps | Debuff Trap |
| 101 | Reserve Items | Teleport |
| 105 | Esper Specials | Esper Special |
| 108 | Big Bang | Missing HP Damage |

Note: eochaid wrote "Balance is formula 108" using Toolkit numbering (msg 478), but the sheet lists the Balance spell under formula 8 (Minus Strike) and formula 108 (Toolkit "Missing HP Damage") as Big Bang; both compute damage from the caster's missing HP.

## Enums carried in the JSON spec

| Enum | Keys | Use |
|---|---|---|
| `Formula` | 0-108 | drop-down for action +0x08 and weapon +0x19 |
| `FormulaCategory`, `FormulaSummary`, `FormulaUsedBy` | 0-108 | tooltips |
| `FormulaOnCastFunctionsVanilla`, `FormulaOnHitFunctionsVanilla` | 0-108 | vanilla function chain, comma-separated function ids |
| `FormulaOnCastFunctionsExtension`, `FormulaOnHitFunctionsExtension` | 1-108 | Formula Extension chain (Drive formulas.lua) |
| `FormulaFunction`, `FormulaFunctionNote`, `FormulaFunctionExtensionReplacement` | 0-255 | function names/descriptions |
| `WeaponFormulaShortLabel` | 20-29, 104 | short labels for weapon formulas |

## Round-trip rules

- Formula ids are plain u8 values: writing a value from enum Formula changes nothing else in the record.
- Values 109-255 are not defined in vanilla; do not write them unless a formula patch (Formula Extension) defines them.
- Function lists (FormulaOnCast*/FormulaOnHit*) are reference labels only; they are not stored in the battlepack and an editor must not try to write them there.

## Known unknowns

- Address and exact byte layout of the vanilla formula table in FFXII_TZA.exe are not in the sources; the sheet only shows the order of function ids per formula, a split into on-cast and on-hit lists, and that lists are bracketed by 0xFFFFFFFF "bookends" (FL Formulae!N1).
- Function ids 73 and 131 are not listed in the Functions tab (the tab jumps from 72 to 74 between FL Functions!r74 and r75, and from 130 to 132 between r131 and r132).
- Which Action/Equipment fields each formula reads (power, multiplier, accuracy, on-hit rate, statuses, knockback) can only be inferred from the function names (msg 649, msg 655).
- Formula 66 (Cinematic Technick): the sheet lists on-cast function 26 (NixEvaActionAcc) where the Extension list has 23 (GetMedicineAcc); formulas 103/104 end in 181 in the sheet but 182 in the Extension (FL Formulae!r106-r107; Drive formulas.lua:103-104, 215-216).
- The italic/strike-through formatting that marks replaced/removed functions in the Formulae tab is not visible in the export; replacements are taken from the Functions tab notes only.
