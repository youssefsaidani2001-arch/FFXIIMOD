# Enumeration - animations (cast, effect finish, event/esper, mist action)

Spec id: `enums-animations` · machine spec: [`enums-animations.json`](./enums-animations.json)

> **ENUMERATION SPEC.** Labels for the animation ids that actions and weapons store. No file of its own.

## What this is

An action (battlepack section 14) plays one visual effect when it resolves. Which id space the effect id belongs to depends on a flag:

| Field (section 14 action) | Type | Id space | Enum | Source |
|---|---|---|---|---|
| +0x24 `castAnimationOrEventScript`, flags1 bit 30 clear | u16 | cast animations 1-396 (+ reserves to 511) and weapon effect finishes 0x8000-0x8100; 0xFFFF = none | `CastAnimation` | S14 Actions!BH (all 543 actions match the S14 Data list at +0x24); AN Animations, Effect Finishes |
| +0x24, flags1 bit 30 set ("Specific EBP Animation" / useEventScript) | u16 | event animations: esper appear / special / dismiss, scripted poses | `EventAnimation` | S14 Actions!AP (bit 30) + !BH; AN Event Animations |
| +0x28 `mistCastAnimation` ("Mist Action") | u16 | 0 or cast-animation ids 120-153 (quickenings and concurrences) | `MistActionAnimation` | S14 Actions!BJ, Data "Mist Action" list |
| +0x1C `characterAnimation` ("Casting Pose") | u8 | 0-9 | `CastingPose` | S14 Actions!BA, Data "Casting Poses" |
| +0x21 `chargeAuraAnimation` ("Charge Aura") | u8 | 0-8 | `ChargeAura` | S14 Actions!BF, Data "Charge Aura" |
| section 13 weapon +0x2C `particleEffect` | u16 | weapon effect finishes 0x8000+ | `WeaponEffectFinish` | AN Effect Finishes; Lists: BpeWeaponParticleEffectList |

Offsets were verified by matching every action's raw 60-byte record in the S14 sheet (column A) against the names in its id columns; see [`battlepack-s14-actions`](./battlepack-s14-actions.md) for the full action layout. Vanilla examples: Cure uses cast animation 179 ("Cure 2.0", S14 Actions!r2); the esper specials Hellfire ... Final Eclipse set bit 30 and use event ids 41, 44, ... 77; the 13 summon actions use the "appear" events 40, 43, ... 76; every quickening/concurrence sets bit 30 with event id 210 and names its visual in +0x28 (120 Red Spiral ... 153 Black Hole). The repo's summon system relies on event 40 being "works for any esper" ([DESIGN.md](../DESIGN.md); AN Event Animations!r43).

## Sources

Every sheet was read in full through an `.xlsx` export of the Drive file (the plain-text read only returns a ~50-row sample, so it was used only to confirm the tab names). Citations are `KEY Tab!rN` (sheet row N, 1-based as shown in Google Sheets) or `KEY Tab!COL` for a whole column; `msg N` is the index of a message in the #wip-general Discord export; `Drive x.lua:L` is a line of a Lua file from the shared Drive folder; `TK Lnnn` is a line of `docs/research/insurgents_toolkit_reference.md`; `Lists: X` is `editor/data/lists.json`.

| Key | Source | What was used |
|---|---|---|
| `AN` | Google Sheet "Animations" (Drive id `1UYFBz27shCOHux1N5NOXNPS7rN7WJebxyhjoIg6DWs0`) | tabs Animations (A1:G398), Effect Finishes (A1:G257), Event Animations (A1:G113) |
| `S14` | Google Sheet "Vanilla Section 14 w/ Binary Calculator" (Drive id `1nm3f5DvkKvkMlcr1oknpgJwnk7Ud3sgXPaHKTcXbJMM`) | tabs Actions (A1:EX545, raw 60-byte hex per action in column A), Data (stacked id lists), Old Version |
| `Lists: BpeCastAnimationList`, `BpeWeaponParticleEffectList` | editor/data/lists.json (Toolkit) | names for ids the sheet leaves blank, weapon names for 0x8000+ |

## Cast animations 1-396 (AN Animations!r2-r398)

Columns D-F of the sheet are tester observations: AoE friendly (the animation plays on every target), "some party-wide effect", cinematic (camera takeover). They are in the JSON enum `CastAnimationTraits`.

| Id | Hex | Label | Description | AoE | Party-wide | Cinematic | Notes |
|---|---|---|---|---|---|---|---|
| 1 | 0x0001 | Cure | small, homing, blue-white blob; animation only connects to 1 target -- others get healed without animation a second later | no | no | no |  |
| 2 | 0x0002 | Blindna | homing blob with shining light inside a black cloud on hit | no | no | no |  |
| 3 | 0x0003 | Vox | homing blob with exploding sonic wave | no | no | no |  |
| 4 | 0x0004 | Poisona | purple/white bubbles | no | no | no |  |
| 5 | 0x0005 | Cura | rays of light, soft hum | yes | yes | no |  |
| 6 | 0x0006 | Raise | light from above, sparkles | no | yes | no |  |
| 7 | 0x0007 | Curaga | spiraling white twinkles | no | no | no |  |
| 8 | 0x0008 | Stona | golden crack with some dirt | no | yes | no |  |
| 9 | 0x0009 | Regen | blue/green/white corkscrew/helix | no | yes | no |  |
| 10 | 0x000A | Cleanse | pinkish rings stacked like pancakes | no | yes | no |  |
| 11 | 0x000B | Esuna | powerup pink lines and white sparkles | no | yes | no |  |
| 12 | 0x000C | Curaja | white glow with after-twinkles | yes | yes | no |  |
| 13 | 0x000D | Dispel | orbs circle and disperse with a schhint | no | yes | no |  |
| 14 | 0x000E | Dispelga | same as Dispel but a bit more intense | yes | yes | no |  |
| 15 | 0x000F | Renew | goldish fireflies with light rays coming from center | yes | yes | no |  |
| 16 | 0x0010 | Arise | very bright white, inner light rays, radiant blips, holy sound | no | yes | no |  |
| 17 | 0x0011 | Esunaga | same as Esuna but a bit more intense | yes | yes | no |  |
| 18 | 0x0012 | Holy | huge pillar of light, swirling white mist | no | no | no |  |
| 19 | 0x0013 | Fire | small gout of flame with fwoosh noise; similar to Cure#1 only animates to one target | no | no | no |  |
| 20 | 0x0014 | Thunder | small arc of electricity with bzzt noise; similar to Cure#1 only animates to one target | no | no | no |  |
| 21 | 0x0015 | Blizzard | small ice crystal with chiiingshh noise; similar to Cure#1 only animates to one target | no | no | no |  |
| 22 | 0x0016 | Aqua | small swirl of water with splooshy noise | no | no | no |  |
| 23 | 0x0017 | Aero | pale green ball of wind with vacuumy noise | no | yes | no |  |
| 24 | 0x0018 | Fira | medium gout of flame | yes | yes | no |  |
| 25 | 0x0019 | Thundara | medium arc of electricity | yes | yes | no |  |
| 26 | 0x001A | Blizzara | intense white ice crystal | yes | yes | no |  |
| 27 | 0x001B | Bio | viscous green sloppy blobs, dwoo-oo sound | yes | yes | no |  |
| 28 | 0x001C | Aeroga | delayed blast downburst of pale green wind | yes | yes | no |  |
| 29 | 0x001D | Firaga | large gout of flame | yes | yes | no |  |
| 30 | 0x001E | Thundaga | three bolts of lightning from the sky | yes | yes | no |  |
| 31 | 0x001F | Blizzaga | large stalagmite of ice from the ground | yes | yes | no |  |
| 32 | 0x0020 | Shock | pale yellow ball of light goes kah-chchchcheke and splashes through target | no | no | no |  |
| 33 | 0x0021 | Scourge | yucky green sloppy tentacles and blobs, similar to Bio but worse | yes | yes | no |  |
| 34 | 0x0022 | Flare | orange wooshes culminate in a fluffy black and peach colored explosion | no | no | no |  |
| 35 | 0x0023 | Ardor | swirly blue/black/white wisps converge in a fiery blue explosion | yes | yes | no |  |
| 36 | 0x0024 | Scathe | triangular prism laser with some lightningish stuff at its origin | yes | yes | no |  |
| 37 | 0x0025 | Haste | blue/white timelines that accelerate | no | no | no |  |
| 38 | 0x0026 | Float | green sparkles, white feathers near the feet | yes | yes | no |  |
| 39 | 0x0027 | Hastega | like Haste but moreso | yes | yes | no |  |
| 40 | 0x0028 | Slow | orange/white timelines that decelerate | no | no | no |  |
| 41 | 0x0029 | Immobilize | green/black downward moving gasy stuff, wooshy noise | yes | yes | no |  |
| 42 | 0x002A | Disable | orange/black collapsing orb | yes | yes | no |  |
| 43 | 0x002B | Warp-like (sheet: Warp; Toolkit: Bleed; vanilla Bleed uses it) | very spacey, small black orb with blue/white bits inside, vwwwummmm noise | yes | yes | no |  |
| 44 | 0x002C | Break | dark greenish black gas and a CHummm noise | no | yes | no |  |
| 45 | 0x002D | Stop | color-inversion white/green ball that halts | no | yes | no |  |
| 46 | 0x002E | Slowga | like Slow but moreso | yes | yes | no |  |
| 47 | 0x002F | Countdown | orange/black orbs spiraling with fowabow sound | no | yes | no |  |
| 48 | 0x0030 | Reflect | jellyfish shield | no | yes | no |  |
| 49 | 0x0031 | Reflectga | like Reflect but moreso | yes | yes | no |  |
| 50 | 0x0032 | Balance | single pale pink orb that hits the feet of the target with a fwwwchang | yes | yes | no |  |
| 51 | 0x0033 | Bleed-like (sheet: Bleed; Toolkit: Warp; vanilla Warp uses it) | pink/black star globe contracts | yes | yes | no |  |
| 52 | 0x0034 | Protect | aqua-colored shield with hexagons | no | yes | no |  |
| 53 | 0x0035 | Shell | green shield with wooshies | no | yes | no |  |
| 54 | 0x0036 | Brave | orange white light beneath the feet | no | yes | no |  |
| 55 | 0x0037 | Faith | pink/white light beneath the feet | no | yes | no |  |
| 56 | 0x0038 | Protectga | like Protect but moreso | yes | yes | no |  |
| 57 | 0x0039 | Shellga | like Shell but moreso | yes | yes | no |  |
| 58 | 0x003A | Blind | pink/black mist trail that goes ba-vvvaaam | no | yes | no |  |
| 59 | 0x003B | Oil | black/teal blobbies with a liquid bubble noise | yes | yes | no |  |
| 60 | 0x003C | Poison | pinkish mist trail with bubbles | no | yes | no |  |
| 61 | 0x003D | Silence | pink dots swirl and then converge with a vrr vrr bompsh | no | yes | no |  |
| 62 | 0x003E | Sleep | swirly light pink lines, then bubbles and a ta-dadada-fla sound | no | yes | no |  |
| 63 | 0x003F | Blindga | like Blind but moreso | yes | yes | no |  |
| 64 | 0x0040 | Toxify | like Poison but moreso | yes | yes | no |  |
| 65 | 0x0041 | Silencega | like Silence but moreso | yes | yes | no |  |
| 66 | 0x0042 | Sleepga | like Sleep but moreso | yes | yes | no |  |
| 67 | 0x0043 | Reverse | six points of light spin and move to center | no | yes | no |  |
| 68 | 0x0044 | Berserk | red/orange boosty eruption under target with a little lightning | no | no | no |  |
| 69 | 0x0045 | Death | white cloud that turns to black with some pink lightning and a whaooo-chomp sound | no | yes | no |  |
| 70 | 0x0046 | Confuse | small green windy gust | no | yes | no |  |
| 71 | 0x0047 | Decoy | mirror images to left and right of character | no | no | no |  |
| 72 | 0x0048 | Vanish | several stacked purple/white disks like pancakes | no | no | no |  |
| 73 | 0x0049 | Vanishga | like Vanish but moreso | yes | yes | no |  |
| 74 | 0x004A | Drain | peach colored absorbing mist | no | yes | no |  |
| 75 | 0x004B | Syphon | azure colored absorbing mist | no | yes | no |  |
| 76 | 0x004C | Bubble | generic healing fwoosh with white light sparkles | no | yes | no |  |
| 77 | 0x004D | Dark | black/purple wisps from the ground | yes | yes | no |  |
| 78 | 0x004E | Darkra | like Dark but moreso | yes | yes | no |  |
| 79 | 0x004F | Darkga | like Dark but verymuchso | yes | yes | no |  |
| 80 | 0x0050 | Gravity | pale blue electic orb with purple bits swings around and goes bwwwwaoooow | yes | yes | no |  |
| 81 | 0x0051 | Graviga | like Gravity except it's a big one from the sky | yes | yes | no |  |
| 82 | 0x0052 | Dark Matter | very intense version of Gravity with a white circle underfoot | yes | yes | no |  |
| 83 | 0x0053 | Painflare | small fiery bouquet | no | no | no |  |
| 84 | 0x0054 | Flash-Freeze | little ice chunky | no | no | no |  |
| 85 | 0x0055 | Flash Arc | it's thundara but pinker with a buzzap | no | no | no |  |
| 86 | 0x0056 | Roxxor | dirty rock crash | no | no | no |  |
| 87 | 0x0057 | Malaise | aqua/green bubbles spiral then strike | no | yes | no |  |
| 88 | 0x0058 | Briny Canonade | splooshy water geyser | no | no | no |  |
| 89 | 0x0059 | Kill | pink/black swirly mists then chimp | no | yes | no |  |
| 90 | 0x005A | Devour Soul | pinky tether goes sssshdink | no | yes | no |  |
| 91 | 0x005B | Whirlwind | swirly green gas | no | no | no |  |
| 92 | 0x005C | Gravity Well | black cosmic swirly circle | no | no | no |  |
| 93 | 0x005D | Comet | a rock from space ffwehw | no | no | no |  |
| 94 | 0x005E | Redemption | very simple vertical white ray with a spiral of white wind and some after-wisps | no | no | no |  |
| 95 | 0x005F | Banish Ray | five little lasers from user go brew brew | no | no | no |  |
| 96 | 0x0060 | First Aid | light blue healing/holy sparkles | no | yes | no |  |
| 97 | 0x0061 | NULL (0x0061, empty slot) |  | yes | no | no |  |
| 98 | 0x0062 | Horology | clock marks in a circle around target, that explode like firecrackers | yes | yes | no |  |
| 99 | 0x0063 | Stamp | greenish/teal gassy with vwwwoomp sound | no | yes | no |  |
| 100 | 0x0064 | Achilles | golden windy spear fwooshes through target | no | yes | no |  |
| 101 | 0x0065 | Charge | three teal swooshes in a disc that ting into pink mist that falls slowly | no | yes | no |  |
| 102 | 0x0066 | Infuse | light blue healing swirlies | no | yes | no |  |
| 103 | 0x0067 | Soul Eater | pinky/peachy gas blob homes in on target | no | yes | no |  |
| 104 | 0x0068 | Wither | orangey dodecahedron shatters | no | no | no |  |
| 105 | 0x0069 | Addle | purpley dodecahedron shatters | no | no | no |  |
| 106 | 0x006A | Bonecrusher | Two fast pink sword slashes with a chimm, one on user, one on target | no | no | no |  |
| 107 | 0x006B | Steal | subtle shocky animation and money chingle sounds | no | no | no |  |
| 108 | 0x006C | NULL (0x006C, empty slot) |  | no | no | no |  |
| 109 | 0x006D | Expose | bluey dodecahedron shatters | no | no | no |  |
| 110 | 0x006E | Shear | greeney dodecahedron shatters | no | no | no |  |
| 111 | 0x006F | Charm | slow-moving orange coils move to target then make sonic waves come out of its head | no | no | no |  |
| 112 | 0x0070 | Revive | light blue light shafts with feathers (note that this animation kills the user, even when the effects of the spell don't specify to do so) | no | no | no | KO's user |
| 113 | 0x0071 | Sight Unseeing | pinkish single chop with black background | no | yes | no |  |
| 114 | 0x0072 | Numerology | light purple time orb spirals and chings | yes | yes | no |  |
| 115 | 0x0073 | Libra | green gems in a triangle spin and hummmp | no | no | no |  |
| 116 | 0x0074 | Poach | pink dart makes little swirl and a fwunt | no | no | no |  |
| 117 | 0x0075 | 1000 Needles | as it sounds | no | no | no |  |
| 118 | 0x0076 | Traveler | pink bash from above with a wooshy-bommm sound | yes | yes | no |  |
| 119 | 0x0077 | Gil Toss | throw coins! cha-ching | yes | yes | no |  |
| 120 | 0x0078 | Red Spiral |  | no | no | yes |  |
| 121 | 0x0079 | White Whorl |  | no | no | yes |  |
| 122 | 0x007A | Pyroclasm |  | no | no | yes |  |
| 123 | 0x007B | Feral Strike |  | no | no | yes |  |
| 124 | 0x007C | Whip Kick |  | no | no | yes |  |
| 125 | 0x007D | Shatterheart |  | no | no | yes |  |
| 126 | 0x007E | Fires of War |  | no | no | yes |  |
| 127 | 0x007F | Tides of Fate |  | no | no | yes |  |
| 128 | 0x0080 | Element of Treachery |  | no | no | yes |  |
| 129 | 0x0081 | Fulminating Darkness |  | no | no | yes |  |
| 130 | 0x0082 | Ruin Impediment |  | no | no | yes |  |
| 131 | 0x0083 | Flame Purge |  | no | no | yes |  |
| 132 | 0x0084 | Nordswain's Glow |  | no | no | yes |  |
| 133 | 0x0085 | Heaven's Wrath |  | no | no | yes |  |
| 134 | 0x0086 | Maelstrom's Bolt |  | no | no | yes |  |
| 135 | 0x0087 | Intercession |  | no | no | yes |  |
| 136 | 0x0088 | Evanescence |  | no | no | yes |  |
| 137 | 0x0089 | Resplendence |  | no | no | yes |  |
| 138 | 0x008A | Inferno |  | yes | yes | yes | dark space "Mist" background |
| 139 | 0x008B | Cataclysm |  | yes | yes | yes | dark space "Mist" background |
| 140 | 0x008C | Torrent |  | yes | yes | yes | dark space "Mist" background |
| 141 | 0x008D | Windburst |  | yes | yes | yes | dark space "Mist" background |
| 142 | 0x008E | Reserve (0x008E) - do not use | don't use | no | no | no |  |
| 143 | 0x008F | Luminescence |  | yes | yes | yes | dark space "Mist" background |
| 144 | 0x0090 | Reserve (0x0090) - do not use | don't use | no | no | no |  |
| 145 | 0x0091 | Reserve (0x0091) - do not use | don't use | no | no | no |  |
| 146 | 0x0092 | Ark Blast |  | yes | yes | yes | dark space "Mist" background |
| 147 | 0x0093 | Reserve (0x0093) - do not use | don't use | no | no | no |  |
| 148 | 0x0094 | Reserve (0x0094) - do not use | don't use | no | no | no |  |
| 149 | 0x0095 | Whiteout |  | yes | yes | yes | dark space "Mist" background |
| 150 | 0x0096 | Reserve (0x0096) - do not use | don't use | no | no | no |  |
| 151 | 0x0097 | Reserve (0x0097) - do not use | don't use | no | no | no |  |
| 152 | 0x0098 | Reserve (0x0098) - do not use | don't use | no | no | no |  |
| 153 | 0x0099 | Black Hole |  | yes | yes | yes | dark space "Mist" background |
| 154 | 0x009A | Potion | green medicine curing droplet | no | no | no |  |
| 155 | 0x009B | Hi-Potion | green medicine curing drop | no | no | no |  |
| 156 | 0x009C | X-Potion | yellow swirly big cure glow | no | no | no |  |
| 157 | 0x009D | Ether | orange drop and glow | no | yes | no |  |
| 158 | 0x009E | Hi-Ether | purple drop and glow | no | yes | no |  |
| 159 | 0x009F | Elixir | pinky drop with yellow angel-shaped light rays | no | yes | no |  |
| 160 | 0x00A0 | Phoenix Down | red/orange feathers and some soft flame | no | yes | no |  |
| 161 | 0x00A1 | Gold Needle | similar to Stona | no | yes | no |  |
| 162 | 0x00A2 | Echo Drops | similar to Silena | no | yes | no |  |
| 163 | 0x00A3 | Antidote | similar to Poisona | no | yes | no |  |
| 164 | 0x00A4 | Eye Drops | similar to Blindna | no | no | no |  |
| 165 | 0x00A5 | Prince's Kiss | slappy stars from both sides | no | yes | no |  |
| 166 | 0x00A6 | Handkerchief | oil bits with blue glow underneath | no | yes | no |  |
| 167 | 0x00A7 | Chronos Tear | blue medicine drop, then a timey restart and speed up | no | yes | no |  |
| 168 | 0x00A8 | Nu Khai Sand | swirling stars and a yellow drop | no | yes | no |  |
| 169 | 0x00A9 | Serum | simliar to Cleanse | no | yes | no |  |
| 170 | 0x00AA | Remedy | blue drop with blue sparkles and lines | no | yes | no |  |
| 171 | 0x00AB | Soleil Fang | vertical gout of flame | yes | yes | no |  |
| 172 | 0x00AC | Rime Fang | ice chunk | yes | yes | no |  |
| 173 | 0x00AD | Lightning Fang | 3 arcs of lightning from the sky | yes | yes | no |  |
| 174 | 0x00AE | Domaine Calvados | green and pink circular glow from below | no | no | no |  |
| 175 | 0x00AF | Megalixir | like Elixir but moreso, AoE friendly | yes | yes | no |  |
| 176 | 0x00B0 | Dark Matter | like a super gravity with a white circle below target | yes | yes | no |  |
| 177 | 0x00B1 | Eskir Berries | some cursed words in red/black with a green outline spiral towards target | no | no | no |  |
| 178 | 0x00B2 | Knot of Rust | little earthy blap | no | no | no |  |
| 179 | 0x00B3 | Cure 2.0 | small, homing, blue-white blob; animation connects with all targets, unlike animation #1 | yes | yes | no |  |
| 180 | 0x00B4 | Fire 2.0 | gout of flame; connects with all targets | yes | yes | no |  |
| 181 | 0x00B5 | Thunder 2.0 | lightning arc; connects with all targets | yes | yes | no |  |
| 182 | 0x00B6 | Blizzard 2.0 | icicle shard projectile; connects with all targets | yes | yes | no |  |
| 183 | 0x00B7 | Aqua 2.0 | curvy splash of water, AoE friendly | yes | yes | no |  |
| 184 | 0x00B8 | NULL (0x00B8, empty slot) |  | no | no | no |  |
| 185 | 0x00B9 | NULL (0x00B9, empty slot) |  | no | no | no |  |
| 186 | 0x00BA | NULL (0x00BA, empty slot) |  | no | no | no |  |
| 187 | 0x00BB | NULL (0x00BB, empty slot) |  | no | no | no |  |
| 188 | 0x00BC | NULL (0x00BC, empty slot) |  | no | no | no |  |
| 189 | 0x00BD | NULL (0x00BD, empty slot) |  | no | no | no |  |
| 190 | 0x00BE | NULL (0x00BE, empty slot) |  | no | no | no |  |
| 191 | 0x00BF | NULL (0x00BF, empty slot) |  | no | no | no |  |
| 192 | 0x00C0 | NULL (0x00C0, empty slot) |  | no | no | no |  |
| 193 | 0x00C1 | NULL (0x00C1, empty slot) |  | no | no | no |  |
| 194 | 0x00C2 | NULL (0x00C2, empty slot) |  | no | no | no |  |
| 195 | 0x00C3 | NULL (0x00C3, empty slot) |  | no | no | no |  |
| 196 | 0x00C4 | NULL (0x00C4, empty slot) |  | no | no | no |  |
| 197 | 0x00C5 | NULL (0x00C5, empty slot) |  | no | no | no |  |
| 198 | 0x00C6 | NULL (0x00C6, empty slot) |  | no | no | no |  |
| 199 | 0x00C7 | NULL (0x00C7, empty slot) |  | no | no | no |  |
| 200 | 0x00C8 | Fear | black ball with white glow descends on target, then purple vertical lines, brewwwchip; NOT AoE friendly | no | yes | no |  |
| 201 | 0x00C9 | Fearga | similar as above but with two balls; AoE friendly | yes | yes | no |  |
| 202 | 0x00CA | Fog | green/yellow lightning line to target with some wisps on hit | no | yes | no |  |
| 203 | 0x00CB | Invert | wooshy white wind from below, turns green and goes back down | no | yes | no |  |
| 204 | 0x00CC | Breakart Pentagram/Death Strike | complicated lasers in a pentagram | no | yes | no |  |
| 205 | 0x00CD | Aerora | some level of an Aero spell | yes | yes | no |  |
| 206 | 0x00CE | Aquara | bigger splooshy | yes | yes | no |  |
| 207 | 0x00CF | Aquaga | very big splooshy | yes | yes | no |  |
| 208 | 0x00D0 | Quakeja | additionally teleports my teammates far away from me? | yes | yes | yes | user floats in the air, Hashmal roars |
| 209 | 0x00D1 | Firaja |  | yes | yes | yes | user floats in the air, Belias groans |
| 210 | 0x00D2 | Blizzaja |  | yes | yes | yes | user floats in the air, Mateus scoffs |
| 211 | 0x00D3 | Aquaja | additionally teleports my teammates far away from me? | yes | yes | yes | user floats in the air, Famfrit gurgles |
| 212 | 0x00D4 | Aeroja |  | yes | yes | yes | user floats in the air, Chaos kiais |
| 213 | 0x00D5 | Darkja |  | yes | yes | yes | user floats in the air, Zalera rasps |
| 214 | 0x00D6 | Thundaja |  | yes | yes | yes | user floats in the air, Adrammelech breathes |
| 215 | 0x00D7 | Holyja |  | yes | yes | yes | user floats in the air, Ultima sighs |
| 216 | 0x00D8 | Disablega | same as Disable | yes | yes | no |  |
| 217 | 0x00D9 | Immobilizega | same as Immobilize | yes | yes | no |  |
| 218 | 0x00DA | Curse | black and purple blabby blobs, hits all targets nearby | yes | yes | no |  |
| 219 | 0x00DB | Pox | brighter purple and sparklier than Curse, single target animation | no | yes | no |  |
| 220 | 0x00DC | Wall | pink pancakes, very buffy or healy | no | yes | no |  |
| 221 | 0x00DD | Flurry Kick | sparkly blinky yellow dots | no | yes | no |  |
| 222 | 0x00DE | Lv. 2 Sleep | two gold dots, then sleep bubbles | yes | yes | no |  |
| 223 | 0x00DF | Lv. 3 Disable | two blue dots, then a purple disable animation | yes | yes | no |  |
| 224 | 0x00E0 | Lv. 4 Break | four green dots, then a break animation | yes | yes | no |  |
| 225 | 0x00E1 | Lv. 5 Reverse | five pink dots, then a reverse animation | yes | yes | no |  |
| 226 | 0x00E2 | Prime Level Death | Darkja magic circle with a skull that giggles | yes | yes | yes |  |
| 227 | 0x00E3 | Restore (Enemy) | yellow vortex of gentle wind with sparkles | no | yes | no |  |
| 228 | 0x00E4 | Renew (Enemy) | similar to above, but bigger and brighter | no | yes | no |  |
| 229 | 0x00E5 | Focus | similar to above two spells, but possibly status curey | no | yes | no |  |
| 230 | 0x00E6 | Meditate | multicolor mandala spins and hums | no | yes | no |  |
| 231 | 0x00E7 | Purify | orange and pink sparkles coalesce and scheck | no | yes | no |  |
| 232 | 0x00E8 | Magick Barrier | large angular green energy shield | no | yes | no |  |
| 233 | 0x00E9 | Force Barrier | large angular blue energy shield | no | yes | no |  |
| 234 | 0x00EA | Greater Barrier | large smooth red energy shield | no | yes | no |  |
| 235 | 0x00EB | Provoke | golden energy bubble with a cross in the middle | no | yes | no |  |
| 236 | 0x00EC | Battle Cry | golden funnel of gas and sparkles around user | no | yes | no |  |
| 237 | 0x00ED | Cry for Help | soundwave that makes a pink glow on target and makes their model fade out | no | yes | no |  |
| 238 | 0x00EE | Raise (Enemy) | healing looking pinkish spell that makes target's model fade out | no | yes | no |  |
| 239 | 0x00EF | Kamikaze | yellow windy looking thing; this animation KOs the user | no | no | no |  |
| 240 | 0x00F0 | Remora Strike | white energy charge-up then a scattering of explosive shells around target | yes | yes | no |  |
| 241 | 0x00F1 | NULL (0x00F1, empty slot) |  | no | no | no |  |
| 242 | 0x00F2 | NULL (0x00F2, empty slot) |  | no | no | no |  |
| 243 | 0x00F3 | Wail | large light green soundwave | yes | yes | no |  |
| 244 | 0x00F4 | Shift | crystaline shield that rotates and reassembles | no | no | no |  |
| 245 | 0x00F5 | Saber | dark pink and purple wispy energy swirls and coalesces | no | yes | no |  |
| 246 | 0x00F6 | Mana Spring | pink lightning crack and an outward moving ripple with a changwummm | no | yes | no |  |
| 247 | 0x00F7 | Enrage | golden lightning buff with vertical shafts of light | no | yes | no |  |
| 248 | 0x00F8 | Chain Magick | begins with a spinning disc in front, then many pinky orbs orbit quickly around user | no | yes | no |  |
| 249 | 0x00F9 | Growing Threat | blue/green flames underfoot | no | no | no |  |
| 250 | 0x00FA | Limit Break | begins with vertical orange shafts of light, then many pinky orbs orbit quickly around user | no | yes | no |  |
| 251 | 0x00FB | Unleash | like Limit Break but moreso | no | yes | no |  |
| 252 | 0x00FC | Perfect Defense? | growing pinky/purple crystaline shield | yes | yes | no |  |
| 253 | 0x00FD | Divide (i think for flans) | lilac bubbles spew up from around target, model fades to invisible briefly | yes | yes | no |  |
| 254 | 0x00FE | Cannibalize | big gassy blast of yellow/orange/green mist | no | no | no |  |
| 255 | 0x00FF | Darkness | large display of dark red shafts of energy with many black bubbles coming out of the ground | yes | yes | no |  |
| 256 | 0x0100 | Ice Break | huge flower of ice forms then shatters | yes | yes | no |  |
| 257 | 0x0101 | Waterspout | large geyser blast from under target | yes | yes | no |  |
| 258 | 0x0102 | Shining Ray | very large array of many pillars of white light | yes | yes | no |  |
| 259 | 0x0103 | Tremor | very quakey, lots of brown rocks come up from the ground | yes | yes | no |  |
| 260 | 0x0104 | Tempest | it's a low framerate but very cool tornado with vacuum noises | yes | yes | no |  |
| 261 | 0x0105 | Sandstorm | opaque dustcloud with lightning arcs within | yes | yes | no |  |
| 262 | 0x0106 | Pyromania | fire comes out of a volcanic hole beneath target | yes | yes | no |  |
| 263 | 0x0107 | Stone Gaze | vicious gaze attack with a hwum-CHA | yes | yes | no |  |
| 264 | 0x0108 | Phantasmal Gaze | similar to above, but more intense | yes | yes | no |  |
| 265 | 0x0109 | Flash | similar again, some of these are maybe Blaster or Hawk Glare | yes | yes | no |  |
| 266 | 0x010A | Hawk Glare | same same | yes | yes | no |  |
| 267 | 0x010B | Fangs | multihit fang or poke thing | no | yes | no |  |
| 268 | 0x010C | Sonic Fangs | multihit fang or poke thing | no | yes | no |  |
| 269 | 0x010D | Crushing Fangs | multihit fang or poke thing | no | yes | no |  |
| 270 | 0x010E | Screech | yellowish soundwave | yes | yes | no |  |
| 271 | 0x010F | Scream | peachy pink soundwave | yes | yes | no |  |
| 272 | 0x0110 | Eerie Soundwave | pinky purple soundwave | yes | yes | no |  |
| 273 | 0x0111 | Joyous Soundwave | blue/green soundwave with a cure animation | yes | yes | no |  |
| 274 | 0x0112 | Blaster | one-two white laser combo | no | yes | no |  |
| 275 | 0x0113 | Hell Blaster | red/black beams tether to target then make a sphere on target | no | yes | no |  |
| 276 | 0x0114 | Angelsong | light green song | yes | yes | no |  |
| 277 | 0x0115 | Magick Ballad | pink song | yes | yes | no |  |
| 278 | 0x0116 | Warsong | orange song | yes | yes | no |  |
| 279 | 0x0117 | Vespersong | fuscia song with pink orbs | yes | yes | no |  |
| 280 | 0x0118 | Mystery Waltz | blue song | yes | yes | no |  |
| 281 | 0x0119 | Hero's March | orange song with orange crystals | yes | yes | no |  |
| 282 | 0x011A | Time Requiem | pale green song with a stop effect | yes | yes | no |  |
| 283 | 0x011B | Soul Etude | white song | yes | yes | no |  |
| 284 | 0x011C | Aqua Bubbles | bubble breath | yes | yes | no |  |
| 285 | 0x011D | Mythril Bubbles | heavy translucent bubbles | yes | yes | no |  |
| 286 | 0x011E | Gust | slow moving swirl of wind | yes | yes | no |  |
| 287 | 0x011F | Gale | three slow moving swirls of wind | yes | yes | no |  |
| 288 | 0x0120 | Flatten/Power Stun | stomp? just kind of a dust effect around user | yes | yes | no |  |
| 289 | 0x0121 | Breath | specifically fire breath | yes | yes | no |  |
| 290 | 0x0122 | White Breath | frost breath | yes | yes | no |  |
| 291 | 0x0123 | Stone Breath | white light charge up, then dark teal cloud gout | yes | yes | no |  |
| 292 | 0x0124 | Poison Breath | pink light charge up, then darker purple breath | yes | yes | no |  |
| 293 | 0x0125 | Ember Breath | a dinky little fireball | yes | yes | no |  |
| 294 | 0x0126 | Fireball | a medium fireball | no | no | no |  |
| 295 | 0x0127 | Mucus | purple mucus blob toss | no | no | no |  |
| 296 | 0x0128 | Bile | white glob of acid makes a little blast when it hits | no | no | no |  |
| 297 | 0x0129 | Water Cannon | it's a little smack of water | no | no | no |  |
| 298 | 0x012A | Water Ray | like four water cannons | no | no | no |  |
| 299 | 0x012B | Blast Wave | yellow radial attack that slams targets | yes | yes | no |  |
| 300 | 0x012C | Shock Wave | green radial energy attack that flumps targets | yes | yes | no |  |
| 301 | 0x012D | Pulsar Wave | pinky radial energy | yes | yes | no |  |
| 302 | 0x012E | Dark Shock | indigo radial energy | yes | yes | no |  |
| 303 | 0x012F | Cloying Breath | pink gas with sleep bubbles | yes | yes | no |  |
| 304 | 0x0130 | Bad Breath | olive green, brown, and black breath | yes | yes | no |  |
| 305 | 0x0131 | Putrid Breath | radial bad breath | yes | yes | no |  |
| 306 | 0x0132 | Stone Touch | user's hands glow white, target gets a petrification effect | no | yes | no |  |
| 307 | 0x0133 | Poison Touch | purple poison hands | no | yes | no |  |
| 308 | 0x0134 | Sleep Touch | light orange hands, sleep bubble pink touch effect | no | yes | no |  |
| 309 | 0x0135 | Doom | like Eskir Berries, some letters fly to target | no | no | no |  |
| 310 | 0x0136 | Annul | same as above but different colors | no | yes | no |  |
| 311 | 0x0137 | Boon | same as above but different colors | no | yes | no |  |
| 312 | 0x0138 | Jump | dust around feet like a landing animation? | no | no | no | Spell effects don't proc normally |
| 313 | 0x0139 | Mach Punch | rapid fire bright lights around target and a squeaky noise | no | yes | no |  |
| 314 | 0x013A | Goblin Attack | pink downward hook, then some particles | no | no | no |  |
| 315 | 0x013B | Smite of Rage | user just turns yellow? | no | no | no | Spell effects don't proc normally |
| 316 | 0x013C | Tri-Attack | little yellow triangle appears on target | no | no | no |  |
| 317 | 0x013D | Spinkick | windy spin on user, target gets a slam attack | yes | yes | no |  |
| 318 | 0x013E | Stomp | green/yellow shockwave and dustcloud like a landing | yes | yes | no |  |
| 319 | 0x013F | Self-Sacrifice | user turns pinkish purple with some particle effects and briefly vanishes (Cure did not proc like usual) | no | no | no | Spell effects don't proc normally |
| 320 | 0x0140 | Wild Charge | dust behind user, maybe a lunge/charge? formula is ignored | no | no | no | Spell effects don't proc normally |
| 321 | 0x0141 | Spiral Cut | windy spin on user, target gets a wind cut | yes | yes | no |  |
| 322 | 0x0142 | Spike Cutter | user throws a green/blue wind sawblade | no | no | no |  |
| 323 | 0x0143 | Heave | upward peach swing | no | yes | no |  |
| 324 | 0x0144 | Mind Lash | just a very generic hit animation with 3-4 spots of light | no | yes | no |  |
| 325 | 0x0145 | Snake Lash | small whirly green lights on target | yes | yes | no |  |
| 326 | 0x0146 | Sonic Turn/Power Spin | big windy spin from user with dark dustclouds, target gets a slice | yes | yes | no |  |
| 327 | 0x0147 | Sonic Spin | multihit swirling green wind blade | no | no | no |  |
| 328 | 0x0148 | Flank Attack | hard to see small hit with some feathers or fluff and a whoomp noise | no | yes | no |  |
| 329 | 0x0149 | Stone Stomp | stompy screen shake attack | yes | yes | no |  |
| 330 | 0x014A | Flatten | concussive vertical hit on target | yes | yes | no |  |
| 331 | 0x014B | Tail Swipe | large spin with wallop on target | yes | yes | no |  |
| 332 | 0x014C | Tail Spear | piercing shot of pink wind | no | yes | no |  |
| 333 | 0x014D | Screwtail | large low-frame-rate shot of beige wind | yes | yes | no |  |
| 334 | 0x014E | Self-Destruct | fiery self explosion (animation KO's user) | yes | yes | no | Animation KO's user |
| 335 | 0x014F | Mass-Destruct | same as Self-Destruct but moreso | yes | yes | no | Animation KO's user |
| 336 | 0x0150 | Chain Reaction | multiple orange/pink soundwaves and then a boost/power-up animation on target | yes | yes | no |  |
| 337 | 0x0151 | Temblor | ring of ancient runes and rubble crops up around user | no | no | no |  |
| 338 | 0x0152 | Judgment | big machina blast into the sky that makes a fiery dome | yes | yes | yes |  |
| 339 | 0x0153 | Cyclone | magic circle on user, then a wiggly worm of wind extends to targets | yes | yes | yes |  |
| 340 | 0x0154 | Dimensional Rift | pink purple wind blows over target (animation KO's user) | no | no | no | Animation KO's user |
| 341 | 0x0155 | Maser Eye | laser eye! | no | yes | no |  |
| 342 | 0x0156 | Leech | blood blobs come out of the target and get absorbed by user | no | yes | no |  |
| 343 | 0x0157 | Necromancy | user drops a little blood, the blood falls on target then a golden glow erupts around each target; all targets fade out briefly | yes | yes | no |  |
| 344 | 0x0158 | Divide | user drops a little green fluid, the green fluid falls on the target then a white glow erupts, all targets fade out briefly | yes | yes | no |  |
| 345 | 0x0159 | Rage | large but mostly invisible vortex around user, green vacuums and slashes on targets | yes | yes | no |  |
| 346 | 0x015A | Bunny Slam | wind blade flies through target, makes a chicken noise | no | no | no |  |
| 347 | 0x015B | Blitz Tongue | many pinky pummel hits | no | yes | no |  |
| 348 | 0x015C | Wing Spear | a handful of sharp bric-a-brak is launched at target | no | no | no |  |
| 349 | 0x015D | Discharge | very light pink electricity flashes on the ground near user and a small flash is seen on target | yes | yes | no |  |
| 350 | 0x015E | Charge | small blue arc on ground near user | no | no | no |  |
| 351 | 0x015F | Pollen | circle of yellow pollen around user, clouds of pollen on targets | yes | yes | no |  |
| 352 | 0x0160 | Bone Toss | hurl a femor, fwepfwa-conk | no | no | no |  |
| 353 | 0x0161 | Breath of Life | very erratic light-yellow electric flutters and shrieking noises | no | no | no |  |
| 354 | 0x0162 | Spawn | user leaks some bright green liquid out the back of its neck? | yes | no | no | damage numbers hit at the same time, but there isn't really any spell effect on targets, only the user |
| 355 | 0x0163 | Ground Shaker | something hits the ground with dramatic zooms, seems like half an animation? | yes | yes | yes |  |
| 356 | 0x0164 | Shockstorm | very electricity cinematic, judgment bolt? | yes | yes | yes |  |
| 357 | 0x0165 | Bushfire | lots of fire pillars, weird camera angles | yes | yes | yes |  |
| 358 | 0x0166 | Sporefall | elder wyrm's attack, lots of pollen and spores, weird camera angles | yes | yes | yes |  |
| 359 | 0x0167 | Crown | green/yellow homing lasers gather and sling towards target | no | no | no |  |
| 360 | 0x0168 | Sword Dance | slices the screen then glass shatters | no | no | yes |  |
| 361 | 0x0169 | Telega | no visible animation, some weird sound effects | no | no | no |  |
| 362 | 0x016A | Fly, Enkidu! | big green windtrails on user with glowing eyes, maybe Enkidu's charge attack? | no | no | no |  |
| 363 | 0x016B | Now, Enkidu! | same as above but with pink trails and some flower petals | no | no | no |  |
| 364 | 0x016C | Slice Thrice | three wolverine kinda slashes | no | no | no |  |
| 365 | 0x016D | Ultimate Illusion | cinematic Gilgamesh earth-bashing attack | yes | no | yes |  |
| 366 | 0x016E | Bitter End | cinematic Gilgamesh shiny light attack | yes | no | yes |  |
| 367 | 0x016F | Monarch Sword | cinematic Gilgamesh lightning attack | yes | no | yes |  |
| 368 | 0x0170 | Dash | pink/orange blast up from target's feet with some orange needles pointing to their center | no | yes | no |  |
| 369 | 0x0171 | Growl | vibrational blur effect around user | no | no | no |  |
| 370 | 0x0172 | Circle of Judgment | whirly white windy slashes | yes | yes | no |  |
| 371 | 0x0173 | Sentence | light beige blasts all around target | no | no | no |  |
| 372 | 0x0174 | Guilt | some judge attack, big slash across the screen, cinematic | yes | no | yes |  |
| 373 | 0x0175 | Innocence | swirly slashy judge attack, cinematic | yes | no | yes |  |
| 374 | 0x0176 | Eviscerator | B'gamnan's sawstick attack | yes | yes | no |  |
| 375 | 0x0177 | High Jump | another sawblade attack | yes | yes | no |  |
| 376 | 0x0178 | Nectar Volley | user gathers a ball of toffee then without pathing the target is covered in toffee | no | no | no |  |
| 377 | 0x0179 | Pollen Dance | very delayed, but eventually the screen shakes and the target gets rained upon by pink foxtails | yes | yes | no |  |
| 378 | 0x017A | S-27 Tokamak | cinematic Cid attack with many fiery lasers | yes | no | yes |  |
| 379 | 0x017B | Choco-Comet | drops a rock on target's head | yes | yes | no |  |
| 380 | 0x017C | S-85 Cyclotrone | cinematic Cid attack with lots of orbs and homing lasers | yes | no | yes |  |
| 381 | 0x017D | Gattling Gun | cinematic Cid attack with a gattling gun whose bullets explode luminously | yes | no | yes |  |
| 382 | 0x017E | NULL (0x017E, empty slot) |  | yes | no | no |  |
| 383 | 0x017F | NULL (0x017F, empty slot) |  | yes | no | no |  |
| 384 | 0x0180 | NULL (0x0180, empty slot) |  | yes | no | no |  |
| 385 | 0x0181 | Pummel | swirling wind bursts pummel target | no | no | no |  |
| 386 | 0x0182 | Force of Will | cinematic Vayne attack where he breaks your computer screen | yes | no | yes |  |
| 387 | 0x0183 | Mach Wave | cinematic Vayne skill where he shoots a white laser | yes | no | yes |  |
| 388 | 0x0184 | Azure Vortice | blue lightning whips around | yes | yes | no |  |
| 389 | 0x0185 | Crimson Vortice | red lightning whips around | yes | yes | no |  |
| 390 | 0x0186 | Contempt | some big lightshow cinematic | yes | no | yes |  |
| 391 | 0x0187 | Inviolable Will | some big laser Vayne cinematic | yes | no | yes |  |
| 392 | 0x0188 | Tree of Sephira | some cracky ultimate Vayne cinematic | yes | no | yes |  |
| 393 | 0x0189 | Megaflare | high intensity techno flamethrower | yes | no | yes |  |
| 394 | 0x018A | Teraflare | cinematic that blows up lots of stuff around user | yes | no | yes |  |
| 395 | 0x018B | Ascension | cinematic that shoots a lot of dirt souls up to the sky | yes | no | yes |  |
| 396 | 0x018C | Gigaflare Sword | Vayne cinematic involving scrap metal and discharging a big destructive beam of light | yes | no | yes |  |
| 397 | 0x018D | NULL (0x018D, empty slot) |  |  |  |  |  |

Ids 184-199, 241-242, 382-384, 397 are NULL (empty) and 142, 144-145, 147-148, 150-152 are marked "don't use" (the quickening/concurrence block 120-153 is only valid through +0x28). 398-511 are reserve ids (Toolkit).

## Weapon effect finishes 0x8001-0x8100 (AN Effect Finishes!r2-r257)

Values 0x8000 and up are hit "finishes" (the flash drawn on the target). The Toolkit names them after the weapon that uses them; the sheet describes the look. The JSON enum `WeaponEffectFinish` (and the upper part of `CastAnimation`) joins both: `<Toolkit weapon name> - <look> (<colour>)`.

| Id | Label |
|---|---|
| 32768 (0x8000) | Reserve (0x8000) |
| 32769 (0x8001) | Unarmed (0x8001) - Bash (whitepink) |
| 32770 (0x8002) | Sword - Bash (whitepink) |
| 32771 (0x8003) | Sword (Fire) - Bash (Fire) |
| 32772 (0x8004) | Sword (Lightning) - Bash (whitepurple) |
| 32773 (0x8005) | Sword (Ice) - Bash (whiteblue) |
| 32774 (0x8006) | Greatsword - Bash (whiteyellow) |
| 32775 (0x8007) | Greatsword (Holy) - Bash (whitegreen) |
| 32776 (0x8008) | Greatsword (Dark) - Bash (whitepurple) |
| 32777 (0x8009) | Katana - Slash (goldwhite) |
| 32778 (0x800A) | Katana (Water) - Slash (bluegold) |
| 32779 (0x800B) | Katana (Wind) - Slash (greengold) |
| 32780 (0x800C) | Ninja Sword - Ninja Sword (Dark) |
| 32781 (0x800D) | Spear - Gun (whitepink) |
| 32782 (0x800E) | Spear (Fire) - Gun (orangewhite) |
| 32783 (0x800F) | Spear (Lightning) - Gun (purple) |
| 32784 (0x8010) | Spear (Ice) - Gun (bluegreen) |
| 32785 (0x8011) | Spear (Holy) - Gun (bluewhite) |
| 32786 (0x8012) | Pole - Firework (normal) |
| 32787 (0x8013) | Pole (Earth) - Firework (bigger) |
| 32788 (0x8014) | Pole (Wind) - Firework (greenish) |
| 32789 (0x8015) | Bow - Sparkle (whitegold) |
| 32790 (0x8016) | Bow (Fire) - Sparkle (bigger) |
| 32791 (0x8017) | Bow (Lightning) - Sparkle (whiter) |
| 32792 (0x8018) | Bow (Ice) - Sparkle (bluer) |
| 32793 (0x8019) | Bow (0x8019) - Sparkle (normal) |
| 32794 (0x801A) | Crossbow - Sparkle (Earth) |
| 32795 (0x801B) | Gun - Explosion (normal) |
| 32796 (0x801C) | Gun (Fire) - Explosion (normal) |
| 32797 (0x801D) | Gun (Lightning) - Explosion (yellower) |
| 32798 (0x801E) | Gun (Ice) - Explosion (Ice) |
| 32799 (0x801F) | Gun (Wind) - Explosion (Wind) |
| 32800 (0x8020) | Gun (Dark) - Explosion (purple) |
| 32801 (0x8021) | Axe - Concussive (normal) |
| 32802 (0x8022) | Hammer - Concussive (bigger) |
| 32803 (0x8023) | Hammer (Dark) - Concussive (purple) |
| 32804 (0x8024) | Dagger - Spear (normal) |
| 32805 (0x8025) | Dagger (Wind) - Spear (Wind) |
| 32806 (0x8026) | Rod - Spear (purple) |
| 32807 (0x8027) | Rod (Ice) - Spear (Ice) |
| 32808 (0x8028) | Rod (Earth) - Spear (gold) |
| 32809 (0x8029) | Rod (Holy) - Spear (blue) |
| 32810 (0x802A) | Staff - Spear (whitepurple) |
| 32811 (0x802B) | Staff (Fire) - Bash (whitepink) |
| 32812 (0x802C) | Staff (Earth) - Bash (whitepink) |
| 32813 (0x802D) | Staff (Water) - Bash (whiteblue) |
| 32814 (0x802E) | Mace - Bash (bright yellow) |
| 32815 (0x802F) | Mace (Water) - Bash (bright blue) |
| 32816 (0x8030) | Measure - Measure (green) |
| 32817 (0x8031) | Hand-Bomb - Gun (normal) |
| 32818 (0x8032) | Hand-Bomb (Ice) - Gun (blue) |
| 32819 (0x8033) | Slap - Fireworks (whitegold) |
| 32820 (0x8034) | Slap (Fire) - Fireworks (orange) |
| 32821 (0x8035) | Slap (Lightning) - Fireworks (white) |
| 32822 (0x8036) | Slap (Ice) - Fireworks (Ice) |
| 32823 (0x8037) | Slap (Earth) - Fireworks (yellow) |
| 32824 (0x8038) | Slap (Water) - Fireworks (Ice) |
| 32825 (0x8039) | Slap (Wind) - Fireworks (Wind) |
| 32826 (0x803A) | Slap (Holy) - Fireworks (white) |
| 32827 (0x803B) | Slap (Dark) - Fireworks (purple) |
| 32828 (0x803C) | Ram - Bash (normal) |
| 32829 (0x803D) | Ram (Fire) - Bash (yellow) |
| 32830 (0x803E) | Ram (Lightning) - Bash (whiteyellowblue) |
| 32831 (0x803F) | Ram (Ice) - Bash (whiteblue) |
| 32832 (0x8040) | Ram (Earth) - Bash (whiteyellow) |
| 32833 (0x8041) | Ram (Water) - Bash (Ice) |
| 32834 (0x8042) | Ram (Wind) - Bash (Wind) |
| 32835 (0x8043) | Ram (Holy) - Bash (whitegreen) |
| 32836 (0x8044) | Ram (Dark) - Bash (whitepurple) |
| 32837 (0x8045) | Fang - Fang (normal) |
| 32838 (0x8046) | Fang (Fire) - Fang (orange) |
| 32839 (0x8047) | Fang (Lightning) - Fang (whiteyellow) |
| 32840 (0x8048) | Fang (Ice) - Fang (whiteteal) |
| 32841 (0x8049) | Fang (Earth) - Fang (whiteyellow) |
| 32842 (0x804A) | Fang (Water) - Fang (whiteindigo) |
| 32843 (0x804B) | Fang (Wind) - Fang (whitegreen) |
| 32844 (0x804C) | Fang (Holy) - Fang (Holy) |
| 32845 (0x804D) | Fang (Dark) - Fang (Dark) |
| 32846 (0x804E) | Cutter - Whip (whitepink) |
| 32847 (0x804F) | Cutter (Fire) - Whip (whitepink) |
| 32848 (0x8050) | Cutter (Lightning) - Whip (whiteblue) |
| 32849 (0x8051) | Cutter (Ice) - Whip (whiteblue) |
| 32850 (0x8052) | Cutter (Earth) - Whip (normal) |
| 32851 (0x8053) | Cutter (Water) - Whip (normal) |
| 32852 (0x8054) | Cutter (Wind) - Whip (Wind) |
| 32853 (0x8055) | Cutter (Holy) - Whip (whiteblue) |
| 32854 (0x8056) | Cutter (Dark) - Whip (purple) |
| 32855 (0x8057) | Beak - Bright Spark (normal) |
| 32856 (0x8058) | Beak (Fire) - Bright Spark (normal) |
| 32857 (0x8059) | Beak (Lightning) - Bright Spark (yellowwhite) |
| 32858 (0x805A) | Beak (Ice) - Bright Spark (white) |
| 32859 (0x805B) | Beak (Earth) - Bright Spark (white) |
| 32860 (0x805C) | Beak (Water) - Bright Spark (white) |
| 32861 (0x805D) | Beak (Wind) - Bright Spark (white) |
| 32862 (0x805E) | Beak (Holy) - Bright Spark (white) |
| 32863 (0x805F) | Beak (Dark) - Bright Spark (white slight purple) |
| 32864 (0x8060) | Unarmed (0x8060) - Bash (normal) |
| 32865 (0x8061) | Unarmed (0x8061) - Bash (normal) |
| 32866 (0x8062) | Reflect - Reflecting a Spell |
| 32867 (0x8063) | Reserve (0x8063) - Float effect |
| 32868 (0x8064) | Reserve (0x8064) - nothing |
| 32869 (0x8065) | Reserve (0x8065) - nothing |
| 32870 (0x8066) | Reserve (0x8066) - nothing |
| 32871 (0x8067) | Reserve (0x8067) - nothing |
| 32872 (0x8068) | Aura (White Magick) - dark distortion white magick (teal particles that last forever) |
| 32873 (0x8069) | Aura (Black Magick) - dark distortion black magick (purple particles that last forever) |
| 32874 (0x806A) | Aura (Time Magick) - dark distortion time magick (yellow particles that last forever) |
| 32875 (0x806B) | Aura (Green Magick) - dark distortion green magick (green particles that last forever) |
| 32876 (0x806C) | Aura (Arcane Magick) - dark distortion arcane magick (indigo particles that last forever) |
| 32877 (0x806D) | Aura (Mist) - dark distortion mist (red particles that last forever) |
| 32878 (0x806E) | Aura (Technick) - dark distortion technick (yellow particles that last forever) |
| 32879 (0x806F) | Aura (Item) - dark distortion white magick (green particles that last forever) |
| 32880 (0x8070) | Unarmed (0x8070) - Bash (whitepurple) |
| 32881 (0x8071) | Level Up - Shifty Matrix (whitegold) |
| 32882 (0x8072) | Invisible (0x8072) - Fade Out |
| 32883 (0x8073) | Trap (Explosion) - Sten Needle |
| 32884 (0x8074) | Trap (Gas) - Gas Trap |
| 32885 (0x8075) | Trap (Tentacles) - Leech Trap |
| 32886 (0x8076) | Chain Benefit - HP Restore Trap |
| 32887 (0x8077) | Unarmed (0x8077) - Bash (purple) |
| 32888 (0x8078) | Invisible (0x8078) - nothing (user goes invisible forever) |
| 32889 (0x8079) | Invisible (0x8079) - nothing (user goes invisible very briefly) |
| 32890 (0x807A) | Invisible (0x807A) - nothing (whole party goes invisible forever) |
| 32891 (0x807B) | Invisible (0x807B) - nothing (whole party goes invisible forever) |
| 32892 (0x807C) | Invisible (0x807C) - nothing (whole party goes invisible forever) |
| 32893 (0x807D) | Invisible (0x807D) - nothing (whole party goes invisible briefly) |
| 32894 (0x807E) | Invisible (0x807E) - nothing (whole party goes invisible forever) |
| 32895 (0x807F) | Invisible (0x807F) - nothing (whole party goes invisible briefly) |
| 32896 (0x8080) | Unknown (0x8080) - Bright Head Poke (purple) |
| 32897 (0x8081) | Unknown (0x8081) - Bright Mid Poke (bluewhite) |
| 32898 (0x8082) | Status Effect Immunity - Bash (yellow) |
| 32899 (0x8083) | Teleport Start - Ahriman teleport (only affects user) |
| 32900 (0x8084) | Teleport End - Ahriman teleport (only affects user) |
| 32901 (0x8085) | Invisible (0x8085) - Purple sparks (whole party goes invisible forever) |
| 32902 (0x8086) | Reserve (0x8086) - Whitescreen Mist Fade (lasts forever) |
| 32903 (0x8087) | Mist Init Start - Whitescreen Mist Fade (lasts forever) |
| 32904 (0x8088) | Mist Init End - Whitescreen Mist Fade (brief effect, then reverts to normal) |
| 32905 (0x8089) | Dismiss Start - Blurry Golden Mist (emanates from user, blurs whole screen, then fades) |
| 32906 (0x808A) | Dismiss End - User's mesh fades out (golden shine and sparkles) |
| 32907 (0x808B) | Teleport Start (Flash) - Teleport (FREEZES GAME) |
| 32908 (0x808C) | Teleport End (Flash) - Teleport (effect fades, no game freeze) |
| 32909 (0x808D) | Forced Dismiss End - Quickening Start Flash (fades to normal) |
| 32910 (0x808E) | Aura (Black Magick) (Small) - Small Monster Magick (dark pink particles that last forever) |
| 32911 (0x808F) | Aura (Time Magick) (Small) - Small Monster Technick (orange particles that last forever) |
| 32912 (0x8090) | Aura (Black Magick) (Medium) - Medium Monster Magick (dark pink particles that last forever) |
| 32913 (0x8091) | Aura (Time Magick) (Medium) - Medium Monster Technick (orange particles that last forever) |
| 32914 (0x8092) | Aura (Black Magick) (Big) - Large Monster Magick (dark pink particles that last forever) |
| 32915 (0x8093) | Aura (Time Magick) (Big) - Large Monster Technick (orange particles that last forever) |
| 32916 (0x8094) | Reserve (0x8094) - nothing |
| 32917 (0x8095) | Save Crystal - Chain Healing (green sparkles) |
| 32918 (0x8096) | Reserve (0x8096) - nothing |
| 32919 (0x8097) | Laser - Lasers from center (blue with purple targets) |
| 32920 (0x8098) | Bash (normal) |
| 32921 (0x8099) | Bash (normal) |
| 32922 (0x809A) | Bash (normal) |
| 32923 (0x809B) | Bash (normal) |
| 32924 (0x809C) | Bash (normal) |
| 32925 (0x809D) | Bash (normal) |
| 32926 (0x809E) | Bash (normal) |
| 32927 (0x809F) | Bash (normal) |
| 32928 (0x80A0) | Bash (normal) |
| 32929 (0x80A1) | Bash (normal) |
| 32930 (0x80A2) | Bash (normal) |
| 32931 (0x80A3) | Bash (normal) |
| 32932 (0x80A4) | Bash (normal) |
| 32933 (0x80A5) | Bash (normal) |
| 32934 (0x80A6) | nothing |
| 32935 (0x80A7) | nothing |

0x80A7-0x8100 are all "nothing" in the sheet.

## Event animations 0-110 (AN Event Animations!r3-r113)

The tab header says "This list is called when 'Mist Action' is on/1/true" (AN Event Animations!A2); in the binary the switch is flags1 bit 30 (S14 calls it "Specific EBP Animation"), not the +0x28 mist field.

| Id | Label | Tester notes |
|---|---|---|
| 0 | Hold pose (0) | hold pose forever, can Flee to stop |
| 1 | Hold pose (1) | hold pose forever, can Flee to stop |
| 2 | Hold pose (2) | hold pose forever, can Flee to stop |
| 3 | Hold pose (3) | hold pose forever, can Flee to stop |
| 4 | Hold pose (4) | hold pose forever, can Flee to stop |
| 5 | Hold pose (5) | hold pose forever, can Flee to stop |
| 6 | Hold pose (6) | hold pose forever, can Flee to stop |
| 7 | Hold pose (7) | hold pose forever, can Flee to stop |
| 8 | Hold pose (8) | hold pose forever, can Flee to stop |
| 9 | Hold pose (9) | hold pose forever, can Flee to stop |
| 10 | Hold pose (10) | hold pose forever, can Flee to stop |
| 11 | Hold pose (11) | hold pose forever, can Flee to stop |
| 12 | Hold pose (12) | hold pose forever, can Flee to stop |
| 13 | Hold pose (13) | hold pose forever, can Flee to stop |
| 14 | Hold pose (14) | hold pose forever, can Flee to stop |
| 15 | Hold pose (15) | hold pose forever, can Flee to stop |
| 16 | Hold pose (16) | hold pose forever, can Flee to stop |
| 17 | Hold pose (17) | hold pose forever, can Flee to stop |
| 18 | Hold pose (18) | hold pose forever, can Flee to stop |
| 19 | Hold pose (19) | hold pose forever, can Flee to stop |
| 20 | Hold pose (20) | hold pose forever, can Flee to stop |
| 21 | Hold pose (21) | hold pose forever, can Flee to stop |
| 22 | Hold pose (22) | hold pose forever, can Flee to stop |
| 23 | Hold pose (23) | hold pose forever, can Flee to stop |
| 24 | Hold pose (24) | hold pose forever, can Flee to stop |
| 25 | Hold pose (25) | hold pose forever, can Flee to stop |
| 26 | Hold pose (26) | hold pose forever, can Flee to stop |
| 27 | Hold pose (27) | hold pose forever, can Flee to stop |
| 28 | Hold pose (28) | hold pose forever, can Flee to stop |
| 29 | Hold pose (29) | hold pose forever, can Flee to stop |
| 30 | Event 30 | calls cutscene when you land in Nalbina dungeons, then freezes character |
| 31 | Event 31 | runtime error crash |
| 32 | Event 32 | character freezes, no input possible; doesn't crash though |
| 33 | Event 33 | runtime error crash |
| 34 | Unknown (34) |  |
| 35 | Unknown (35) |  |
| 36 | Unknown (36) |  |
| 37 | Unknown (37) |  |
| 38 | Unknown (38) |  |
| 39 | Unknown (39) |  |
| 40 | Belias appear | works for any esper |
| 41 | Hellfire | plays animation w/o esper, freezes party member after |
| 42 | Dismiss | camera focus changes, then no effect w/o esper out |
| 43 | Mateus appear | works for any esper |
| 44 | Frostwave | plays animation w/o esper, freezes party member after |
| 45 | Dismiss | camera focus changes, then no effect w/o esper out |
| 46 | Adrammelech appear | works for any esper |
| 47 | Judgment Bolt | plays animation w/o esper, freezes party member after |
| 48 | Dismiss | camera focus changes, then no effect w/o esper out |
| 49 | Hashmal appear | works for any esper |
| 50 | Gaia's Wrath | plays animation w/o esper, freezes party member after |
| 51 | Dismiss | camera focus changes, then no effect w/o esper out |
| 52 | Cúchulainn appear | works for any esper |
| 53 | Blight | plays animation w/o esper, freezes party member after |
| 54 | Dismiss | camera focus changes, then no effect w/o esper out |
| 55 | Famfrit appear | works for any esper |
| 56 | Tsunami | plays animation w/o esper, freezes party member after |
| 57 | Dismiss | camera focus changes, then no effect w/o esper out |
| 58 | Zalera appear | works for any esper |
| 59 | Condemnation | plays animation w/o esper, freezes party member after |
| 60 | Dismiss | camera focus changes, then no effect w/o esper out |
| 61 | Shemhazai appear | works for any esper |
| 62 | Soul Purge | plays animation w/o esper, freezes party member after |
| 63 | Dismiss | camera focus changes, then no effect w/o esper out |
| 64 | Chaos appear | works for any esper |
| 65 | Tornado | plays animation w/o esper, freezes party member after |
| 66 | Dismiss | camera focus changes, then no effect w/o esper out |
| 67 | Zeromus appear | works for any esper |
| 68 | Big Bang | plays animation w/o esper, freezes party member after |
| 69 | Dismiss | camera focus changes, then no effect w/o esper out |
| 70 | Exodus appear | works for any esper |
| 71 | Meteor | plays animation w/o esper, freezes party member after |
| 72 | Dismiss | camera focus changes, then no effect w/o esper out |
| 73 | Ultima appear | works for any esper |
| 74 | Eschaton | plays animation w/o esper, freezes party member after |
| 75 | Dismiss | camera focus changes, then no effect w/o esper out |
| 76 | Zodiark appear | works for any esper |
| 77 | Final Eclipse | plays animation w/o esper, freezes party member after |
| 78 | Dismiss | camera focus changes, then no effect w/o esper out |
| 79 | Hold pose (79) | hold pose forever, can Flee to stop |
| 80 | Hold pose (80) | hold pose forever, can Flee to stop |
| 81 | Hold pose (81) | hold pose forever, can Flee to stop |
| 82 | Hold pose (82) | hold pose forever, can Flee to stop |
| 83 | Hold pose (83) | hold pose forever, can Flee to stop |
| 84 | Hold pose (84) | hold pose forever, can Flee to stop |
| 85 | Hold pose (85) | hold pose forever, can Flee to stop |
| 86 | Hold pose (86) | hold pose forever, can Flee to stop |
| 87 | Hold pose (87) | hold pose forever, can Flee to stop |
| 88 | Hold pose (88) | hold pose forever, can Flee to stop |
| 89 | Hold pose (89) | hold pose forever, can Flee to stop |
| 90 | Hold pose (90) | hold pose forever, can Flee to stop |
| 91 | Hold pose (91) | hold pose forever, can Flee to stop |
| 92 | Hold pose (92) | hold pose forever, can Flee to stop |
| 93 | Hold pose (93) | hold pose forever, can Flee to stop |
| 94 | Hold pose (94) | hold pose forever, can Flee to stop |
| 95 | Hold pose (95) | hold pose forever, can Flee to stop |
| 96 | Hold pose (96) | hold pose forever, can Flee to stop |
| 97 | Hold pose (97) | hold pose forever, can Flee to stop |
| 98 | Hold pose (98) | hold pose forever, can Flee to stop |
| 99 | Hold pose (99) | hold pose forever, can Flee to stop |
| 100 | calls cutscene of entering Rabanastre, old valendian 706 something something, Vaan eats a starfruit, imperials steal from a stall, Vaan steals their sack | can sometimes return to title screen while cutscene is playing, if cutscene finishes, game accepts no inputs |
| 101 | calls cutscene where Penelo takes the pouch from Vaan | can sometimes return to title screen while cutscene is playing, if cutscene finishes, game accepts no inputs |
| 102 | Unknown (102) |  |
| 103 | Unknown (103) |  |
| 104 | Unknown (104) |  |
| 105 | Unknown (105) |  |
| 106 | Unknown (106) |  |
| 107 | Unknown (107) |  |
| 108 | Unknown (108) |  |
| 109 | Unknown (109) |  |
| 110 | Unknown (110) |  |

## Mist-action animations (+0x28)

| Value | Label |
|---|---|
| 0 | None |
| 120 | Red Spiral |
| 121 | White Whorl |
| 122 | Pyroclasm |
| 123 | Feral Strike |
| 124 | Whip Kick |
| 125 | Shatterheart |
| 126 | Fires of War |
| 127 | Tides of Fate |
| 128 | Element of Treachery |
| 129 | Fulminating Darkness |
| 130 | Ruin Impendent |
| 131 | Flame Purge |
| 132 | Nordswain's Glow |
| 133 | Heaven's Wrath |
| 134 | Maelstrom's Bolt |
| 135 | Intercession |
| 136 | Evanescence |
| 137 | Resplendence |
| 138 | Inferno |
| 139 | Cataclysm |
| 140 | Torrent |
| 141 | Windburst |
| 142 | Reserve (0x008E) |
| 143 | Luminescence |
| 144 | Reserve (0x0090) |
| 145 | Reserve (0x0091) |
| 146 | Ark Blast |
| 147 | Reserve (0x0093) |
| 148 | Reserve (0x0094) |
| 149 | Whiteout |
| 150 | Reserve (0x0096) |
| 151 | Reserve (0x0097) |
| 152 | Reserve (0x0098) |
| 153 | Black Hole |

## Casting poses (+0x1C) and charge auras (+0x21)

| Value | Casting pose |
|---|---|
| 0 | Attack |
| 1 | Magick |
| 2 | Item (Beneficial) |
| 3 | Technick |
| 4 | Item (Detrimental) |
| 5 | Steal |
| 6 | Quickening |
| 7 | Esper Technick |
| 8 | Summon |
| 9 | Concurrence |

| Value | Charge aura |
|---|---|
| 0 | Attack |
| 1 | White Magick |
| 2 | Black Magick |
| 3 | Time Magick |
| 4 | Green Magick |
| 5 | Arcane Magick |
| 6 | Mist |
| 7 | Technick |
| 8 | Item |

## Enums carried in the JSON spec

| Enum | Keys | Use |
|---|---|---|
| `CastAnimation` | 0-511, 0x8000-0x8100, 0xFFFF | drop-down for action +0x24 when bit 30 is clear |
| `CastAnimationDescription`, `CastAnimationTraits` | 1-396 | tooltips |
| `WeaponEffectFinish` | 0x8000-0x8100 | drop-down for weapon +0x2C |
| `EventAnimation`, `EventAnimationDescription` | 0-110 | drop-down for action +0x24 when bit 30 is set |
| `MistActionAnimation` | 0, 120-153 | drop-down for action +0x28 |
| `CastingPose` | 0-9 | action +0x1C |
| `ChargeAura` | 0-8 | action +0x21 |

## Round-trip rules

- Animation ids are plain u16/u8 values; changing one never moves data.
- Pick the enum by the action flag: if section 14 flags1 bit 30 (useEventScript, the sheet's "Specific EBP Animation") is set, +0x24 is an EventAnimation id, otherwise a CastAnimation id (0x8000+ = weapon effect finish).
- Keep 0xFFFF (None) where vanilla has it; 0 is "Reserve (0x0000)", not "none".

## Known unknowns

- Animations 43 and 51: the Animations sheet calls 43 Warp and 51 Bleed, the Toolkit and the S14 sheet call 43 Bleed and 51 Warp, and vanilla Bleed uses 43 while Warp uses 51 (S14 Actions!r44, r52). Which visual is which is unresolved.
- Cast ids 397-511 and weapon-finish ids above 0x8097 have no description in the sheet beyond "NULL"/"nothing"/"Bash normal"; labels 398-511 come from the Toolkit list.
- Event animation ids above 110 are used by vanilla (quickening/concurrence actions use 210, Dismount uses 355) but are not listed in the sheet.
- The "AoE friendly", "party-wide" and "cinematic" columns are play-test observations (AN Animations!D:F), not engine data.
- Whether a cast animation also needs a matching charge aura / casting pose is not documented; the sheet notes that some animations KO the user (e.g. 112 Revive, 334/335 Self-/Mass-Destruct, 340 Dimensional Rift).
