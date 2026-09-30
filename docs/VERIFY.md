# First-launch verification checklist

Everything below is marked `VERIFY` in the code. Do them once, in this order,
with the Lua Loader log open (`x64/luaLoader.log` or the console) and
`cfg.debug = true`.

1. **Section 14 slot range** (`cfg.actionSlotStart`, default 480). Open the
   Insurgent's Toolkit → Battlepack Editor → Section 14 and confirm slots
   480–530 are not used by another mod. The log prints
   `built 51 summon actions in Section 14 slots A-B (template T, N body slots)`.
   `T` must be the vanilla Belias summon row and `N` should be 13.
2. **Technicks category value** (`A.MENU_CATEGORY.technicks = 2`). Read the
   `category` byte (+0x1E) of vanilla *Steal* in Section 14; if it is not 2,
   set the constant to that value. The summons must appear under the second
   battle-menu entry.
3. **Action-id register** (`cfg.actionIdRegister`). Cast *Cure* from the
   battle menu; the log line `menu action regs rax=.. rbx=..` must show `0`
   in one register; put that register name in the config.
4. **Attack action id** used to cancel a denied cast (`0x96` in
   `summoner.lua`). Confirm with the toolkit ("Custom Battle Menu Action"
   default).
5. **Label regions** (`cfg.labelScanBytes`). If "Technicks" is still shown,
   the text is not inside the first 0x40000 bytes of the MRP sections; raise
   the value or find the text with Cheat Engine (search the bytes returned by
   `message.convert("Technicks")`) and add the address to `menu_labels.regions`.
6. **Body models** (`data.lua` → `model`). Pick the FFXII monster model id for
   each summon (Vanilla ARD Map sheet / toolkit Party Member Editor → Model)
   and fill it in. With `-1` the vanilla esper model is kept.
7. **Esper abilities**: allied espers take their abilities from Section 16
   `inventory1..10` (Xeavin, Sky Pirate's Den). Set them per body slot in
   `summoner.prepareBody` if you want per-summon attacks.
8. **Guest spawn mode** (`cfg.spawnMode = "guest"`) is experimental: the
   add-guest-battle-member factory at `0x003170E0` needs its calling
   convention confirmed (PermanentAllies used `0x003172E0` with the Section 16
   index in `ecx`).
