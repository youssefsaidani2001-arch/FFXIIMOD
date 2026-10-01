# UI Settings - HUD and menu layout globals

Spec id: `ui-settings` · machine spec: [`ui-settings.json`](./ui-settings.json)

> **MEMORY-ONLY (runtime).** These are globals in the running game; there is no data file documented for them. Edit them live (Lua Loader `memory`, Cheat Engine, the Toolkit's UI Settings group).

## What this is

The engine keeps HUD and menu layout constants (cursor offsets, list spacing, black-bar heights, font metrics, overhead HP-gauge colours, licence-board selection geometry, gambit screen layout ...) in static variables. The Insurgent's Toolkit exposes them as **UI Settings** using the game's own variable names (TK L1459). Neonsquare documented 230 of them: which screen they affect, what they move, the vanilla value and side effects (UIS). The repo owner's goal of per-character HUD colours (docs/research/drive/batch_00.md, AI Context Memory L8, L31) is implemented by swapping the HpGaugeSide globals per character (Drive CharacterHealthbarColors.lua).

## Sources

Every sheet was read in full through an `.xlsx` export of the Drive file (the plain-text read only returns a ~50-row sample, so it was used only to confirm the tab names). Citations are `KEY Tab!rN` (sheet row N, 1-based as shown in Google Sheets) or `KEY Tab!COL` for a whole column; `msg N` is the index of a message in the #wip-general Discord export; `Drive x.lua:L` is a line of a Lua file from the shared Drive folder; `TK Lnnn` is a line of `docs/research/insurgents_toolkit_reference.md`; `Lists: X` is `editor/data/lists.json`.

| Key | Source | What was used |
|---|---|---|
| `UIS` | Google Sheet "FFXII TZA - UI Settings Documentation" (Drive id `1vIi0By-pGLldUIJ-CplHQWGyo8eYqUuxBYPlJoDrlBY`) | tab UI Settings (A1:I279); author Neonsquare |
| `Drive CharacterHealthbarColors.lua` | Drive file `1PPg9r02sag_MNXjd-bSyXbzP6K2TxbTg` | HpGaugeSide addresses, gauge function 0x2C5F90, 0-127 range |
| `Drive CharacterHealthbarColorsConfig.lua` | Drive file `1iniTAKLH7Q1Rv8dXgPZ664jwZXsP6gS3` | vanilla gauge values read from memory |
| `Drive Wayfarer.lua` | Drive file `1xnhaCGX3zt8HD27eM42dLXyQ48vNTcB5` | another UI global (0x01E0C580) |

## Where the values live

| What | Where | Source |
|---|---|---|
| all documented settings | static globals of FFXII_TZA.exe; Toolkit group "UI Settings" (static rows, no script) | TK L1459 |
| HpGaugeSide colours | 0x01E0CEF8 (left end R,G,B,A) and 0x01E0CF08 (right end R,G,B,A), u32 each | Drive CharacterHealthbarColors.lua:13, 71-81 |
| gauge colour function | 0x002C5F90: ecx = gauge type (0 party, 1 enemy, 2 other), edx = fill ratio; party call sites 0x002C83ED, 0x002C8405 | Drive CharacterHealthbarColors.lua:7-8 |
| other UI global | 0x01E0C580 (u32, used as prompt line height by Wayfarer) | Drive Wayfarer.lua:20, 325-326 |

Addresses are module-relative as used by the Lua Loader and Cheat Engine for TZA Steam 1.0.4.0.

## Categories (row colours, UIS G1:G6)

| Colour | Category |
|---|---|
| grey | Unused (no visible effect found) |
| blue | General |
| pink | Menu |
| green | Battle/Field |

## Settings (UIS r2-r231)

Index = position in the sheet (JSON enum key). "x" in the sheet = effect not found.

| Index | Screen | Setting | Effect | Vanilla | Category | Notes | Source |
|---|---|---|---|---|---|---|---|
| 0 | Font | `FontShadowAlphaMuti` | font00.dat outline strength | 8 | General (lighter shade) |  | UIS r2 |
| 1 | Pause Screen | `mPauseMenuOffsetY` | Options list y-axis | 114 | Menu |  | UIS r3 |
| 2 | Pause Screen | `PauseMenuLineOffset` | Options list vertical spacing | 48 | Menu |  | UIS r4 |
| 3 | Save/Load/Pause Screen | `ConfirmWindowSelectHeight` | Message box height | 48 | Menu |  | UIS r5 |
| 4 | Save/Load/Pause Screen | `ConfirmWindowBaseWidth` | Message box width | 196 | Menu |  | UIS r6 |
| 5 | x | `ConfirmCaptionOffsetX` | x | -10 | Unused |  | UIS r7 |
| 6 | x | `ConfirmCaptionOffsetY` | x | 38 | Unused |  | UIS r8 |
| 7 | Message Box | `mGeneralFrameFrontOffset` | Message box padding | 28 | General | Expects a value from -64 to 63 | UIS r9 |
| 8 | x | `mGeneralFrameBackOffset` | x | 10 | Unused |  | UIS r10 |
| 9 | Battle Menu | `General_Frame_Shadow_WH` | Content container width/height | 12 | Battle/Field | Adjusts size erratically with values ouside of 0-127 | UIS r11 |
| 10 | License Board | `General_Frame_Common_Offset` | License info box scale/position | 18 | Menu |  | UIS r12 |
| 11 | Hand Cursor | `mCursorRightX` | Right-pointing hand cursor x-axis | -60 | General |  | UIS r13 |
| 12 | Hand Cursor | `mCursorRightY` | Right-pointing hand cursor y-axis | -18 | General |  | UIS r14 |
| 13 | Hand Cursor | `mCursorDownX` | Down-pointing hand cursor x-axis | -26 | General |  | UIS r15 |
| 14 | Hand Cursor | `mCursorDownY` | Down-pointing hand cursor y-axis | -44 | General |  | UIS r16 |
| 15 | Hand Cursor | `mCursorLeftX` | Left-pointing hand cursor x-axis | -4 | General |  | UIS r17 |
| 16 | Hand Cursor | `mCursorLeftY` | Left-pointing hand cursor y-axis | -18 | General |  | UIS r18 |
| 17 | Hand Cursor | `mCursorUpX` | Up-pointing hand cursor x-axis | -20 | General |  | UIS r19 |
| 18 | Hand Cursor | `mCursorUpY` | Up-pointing hand cursor y-axis | -4 | General |  | UIS r20 |
| 19 | Hand Cursor | `mCursorOpenX` | Open hand cursor x-axis | -38 | General |  | UIS r21 |
| 20 | Hand Cursor | `mCursorOpenY` | Open hand cursor y-axis | -26 | General |  | UIS r22 |
| 21 | x | `ConfirmCursorOffsetX` | x | 20 | Unused |  | UIS r23 |
| 22 | x | `ConfirmCursorOffsetY` | x | -10 | Unused |  | UIS r24 |
| 23 | Battle Menu | `mScrollListHeight` | Action list vertical spacing | 46 | Battle/Field |  | UIS r25 |
| 24 | Battle Menu | `mBattleCommandItalicRevJp` | "Select Leader" message box width (Eastern languages) | 45 | Battle/Field | Updates with zone change | UIS r26 |
| 25 | Battle Menu | `mBattleCommandItalicRevUs` | "Select Leader" message box width (Western languages) | 20 | Battle/Field | Updates with zone change | UIS r27 |
| 26 | Battle Menu | `BattleCommandNumTagWidth` | MP/AMT lists x-axis | 60 | Battle/Field | Updates with zone change | UIS r28 |
| 27 | Battle Menu | `BattleCommandMistTagWidth` | Rank list x-axis | 80 | Battle/Field | Updates with zone change | UIS r29 |
| 28 | Battle Menu | `BattleCommandScrollBarWidth` | Scroll bar x-axis | 10 | Battle/Field | Updates with zone change - adjusts all lists | UIS r30 |
| 29 | Battle Menu | `BattleCommandScrollTableOffsetX` | Battle menu contents x-axis | 20 | Battle/Field |  | UIS r31 |
| 30 | x | `BattleCommandGillTagOffset` | x | 78 | Unused |  | UIS r32 |
| 31 | Battle Menu | `BattleMenuLRCursorMoveX` | Left/right caret animation start position | 8 | Battle/Field |  | UIS r33 |
| 32 | Battle Menu | `mGambitPositionOffsetX` | Gambit ON/OFF icon x-axis | -82 | Battle/Field |  | UIS r34 |
| 33 | Battle Menu | `mGambitPositionOffsetY` | Gambit ON/OFF icon y-axis | 28 | Battle/Field |  | UIS r35 |
| 34 | Battle Menu | `mCommandTitleFontHeight` | Title height | 46 | Battle/Field |  | UIS r36 |
| 35 | Battle Menu | `BattleCommandNumPosX` | Digits x-axis | 18 | Battle/Field |  | UIS r37 |
| 36 | Battle Menu | `BattleCommandMistPosX` | Mist charge icons x-axis | 44 | Battle/Field |  | UIS r38 |
| 37 | Battle Menu | `BattleCommandMistPosY` | Mist charge icons y-axis | 5 | Battle/Field |  | UIS r39 |
| 38 | Battle Menu | `BattleMistCount1Offset` | Rank 1 mist charge icon x-axis | 8 | Battle/Field |  | UIS r40 |
| 39 | Battle Menu | `BattleMistCount2Offset` | Rank 2 mist charge icon x-axis | 24 | Battle/Field |  | UIS r41 |
| 40 | Battle Menu | `BattleMistCount3Offset` | Rank 3 mist charge icon x-axis | 40 | Battle/Field |  | UIS r42 |
| 41 | Battle Menu | `BattleMistIconWidth` | Mist charge icon horizontal spacing | 22 | Battle/Field |  | UIS r43 |
| 42 | Menu Lists | `mCommandMenuStrHeight` | Party/Equip/Inventory/Clan Primer menu list vertical spacing | 48 | Menu |  | UIS r44 |
| 43 | Menu Lists | `mCommandMenuOffsetY` | Party/Inventory list group vertical spacing | 16 | Menu |  | UIS r45 |
| 44 | Party Menu | `PartyBlackBandTime` | Bottom horizontal black bar animation speed | 200 | Menu |  | UIS r46 |
| 45 | Horizontal Black Bars | `PartyBlackBandGradH` | Top/bottom black bar gradient height | 4 | Menu | All menus except world map | UIS r47 |
| 46 | World Map Black Bars | `WorldMapBlackBandGradH` | Top/bottom black bar gradient height | 2 | Menu |  | UIS r48 |
| 47 | World Map Black Bars | `WorldMapBlackBandH` | Top/bottom black bar height | 107 | Menu |  | UIS r49 |
| 48 | x | `PauseBlackBandH` | x | 56 | Unused | Might be used but hidden by black background | UIS r50 |
| 49 | Top Horizontal Black Bar | `DeftopBlackBandH` | Top black bar height | 166 | Menu | All menus except world map | UIS r51 |
| 50 | Bottom Horizontal Black Bar | `DefUnderBlackBandH` | Party/Licenses menu bottom black bar height | 90 | Menu |  | UIS r52 |
| 51 | x | `BattleLogBlackBandH` | x | 24 | Unused |  | UIS r53 |
| 52 | Bottom Horizontal Black Bar | `ConfigBlackBandH` | Config menu bottom black bar height | 24 | Menu |  | UIS r54 |
| 53 | Bottom Horizontal Black Bar | `ListHelpBlackBandH` | Status/Equip/Inventory menu bottom black bar height | 240 | Menu |  | UIS r55 |
| 54 | Zone Map Black Bars | `LocaMapBlackBandH` | Top/bottom black bar height | 116 | Menu |  | UIS r56 |
| 55 | x | `LicenseBlackBandH` | x | 32 | Unused |  | UIS r57 |
| 56 | Horizontal Black Bars | `BlackBandAnimTime` | Top/bottom black bar menu height transition animation speed | 200 | Menu |  | UIS r58 |
| 57 | Floating HUD | `ExpLpPositionOffsetX` | Enemy overhead Exp/LP info x-axis | -4 | Battle/Field |  | UIS r59 |
| 58 | x | `mNumEffectOffsetX1` | x | 33 | Unused | Might be unused and digit merged with mNumEffectOffsetX2 | UIS r60 |
| 59 | Floating HUD | `mNumEffectOffsetX2` | Hits digits x-axis | -22 | Battle/Field | Includes both digit 1 and digit 2 | UIS r61 |
| 60 | Floating HUD | `NumEffectLPOffsetY` | Enemy overhead LP info y-axis | 39 | Battle/Field |  | UIS r62 |
| 61 | Floating HUD | `EXPLPNumOffsetY` | Enemy overhead Exp/LP digits y-axis | 2 | Battle/Field |  | UIS r63 |
| 62 | x | `m2DSideCursorCenterX` | x | 10 | Unused |  | UIS r64 |
| 63 | x | `m2DSideCursorCenterY` | x | 46 | Unused |  | UIS r65 |
| 64 | Help Text | `mHelpMessageFontCount` | Help text container width | 1300 | Battle/Field |  | UIS r66 |
| 65 | Equipment Preview Images | `ListItemIconW` | Equipment preview image width | 64 | Menu | Runtime error if value is an unsupported dimension | UIS r67 |
| 66 | Equipment Preview Images | `ListItemIconH` | Equipment preview image height | 96 | Menu | Runtime error if value is an unsupported dimension | UIS r68 |
| 67 | Help Text | `mTriangleHelpMessageFontCount` | Help text container width | 1300 | Menu |  | UIS r69 |
| 68 | x | `LevelupBlinkSpeed` | x | 14 | Unused |  | UIS r70 |
| 69 | Battle Menu | `mCPCWindowHeight` | Select Leader message box height | 46 | Battle/Field |  | UIS r71 |
| 70 | Cutscenes | `MaskTopBlackBandH` | Top horizontal black bar height | 82 | General |  | UIS r72 |
| 71 | Cutscenes | `MaskBottomBlackBandH` | Bottom horizontal black bar height | 174 | General |  | UIS r73 |
| 72 | Inventory | `NgSignalOffsetBaseY` | Button icon & "Sort" text y-axis | 18 | Menu | Updates with party menu close/open | UIS r74 |
| 73 | Boss HP Bar | `BossGaugeExColorR` | Damage taken animation red value | 128 | Battle/Field |  | UIS r75 |
| 74 | Boss HP Bar | `BossGaugeExColorG` | Damage taken animation green value | 98 | Battle/Field |  | UIS r76 |
| 75 | Boss HP Bar | `BossGaugeExColorB` | Damage taken animation blue value | 98 | Battle/Field |  | UIS r77 |
| 76 | Boss HP Bar | `BossGaugeExColorA` | Damage taken animation alpha value | 128 | Battle/Field |  | UIS r78 |
| 77 | Chops Quest Message box | `NobuMsgWindowShapeBackOffset_X` | Message box background x-axis | -24 | General | Might adjust other message boxes | UIS r79 |
| 78 | Chops Quest Message box | `NobuMsgWindowShapeBackOffset_Y` | Message box background y-axis | -11 | General | Might adjust other message boxes | UIS r80 |
| 79 | Chops Quest Message box | `NobuMsgWindowShapeBackOffset_W` | Message box background width | 50 | General | Might adjust other message boxes | UIS r81 |
| 80 | Chops Quest Message box | `NobuMsgWindowShapeBackOffset_H` | Message box container height | 24 | General | Might adjust other message boxes | UIS r82 |
| 81 | Reward Message | `NobuMessageItemGetOffsetY` | Reward message gold bookend graphics y-axis | 34 | General |  | UIS r83 |
| 82 | NPC Dialog | `MessageWinMaskTop` | Horizontal black bar 1 height | 36 | General |  | UIS r84 |
| 83 | NPC Dialog | `MessageWinMaskBottom` | Horizontal black bar 2 height (incl. text) | 36 | General |  | UIS r85 |
| 84 | NPC Dialog | `MessageLineWordCount` | Dialog container width | 36 | General |  | UIS r86 |
| 85 | NPC Dialog | `MsgWinLogCursorOffsetX` | Next page down caret icon x-axis | 18 | General |  | UIS r87 |
| 86 | NPC Dialog | `MsgWinLogCursorOffsetY` | Next page down caret icon y-axis | 38 | General |  | UIS r88 |
| 87 | NPC Dialog | `MsgWinSignalOffsetY` | Button icons & text y-axis | 66 | General |  | UIS r89 |
| 88 | NPC Dialog | `MsgWinSelectCursorOffsetY` | Right-pointing hand cursor y-axis | 8 | General |  | UIS r90 |
| 89 | NPC Dialog | `FontBaseWidth` | Dialog container width | 36 | General |  | UIS r91 |
| 90 | Message Box | `FontBaseHeight` | Combat Log/Battle Menu message box height | 55 | Battle/Field | Might adjust other message boxes | UIS r92 |
| 91 | x | `?` | x | 1 | Unused | Resets back to 1 when adjusted | UIS r93 |
| 92 | x | `?` | x | -1 | Unused |  | UIS r94 |
| 93 | NPC Dialog | `MsgWinSignalRightOffset` | Button icons & text x-axis | 130 | General |  | UIS r95 |
| 94 | NPC Dialog | `MsgWinSignalLeftOffset` | Button icons & text horizontal spacing | 4 | General |  | UIS r96 |
| 95 | NPC Dialog - Log | `MsgWinLogSignalPosX` | Page count & up/down caret icons x-axis | 1680 | General |  | UIS r97 |
| 96 | NPC Dialog - Log | `MsgWinLogSignalPosY` | Page count & up/down caret icons y-axis | 888 | General |  | UIS r98 |
| 97 | NPC Dialog - Log | `MsgWinLogUpDownCursorOffsetX` | Up/down caret icons x-axis | 47 | General |  | UIS r99 |
| 98 | NPC Dialog - Log | `MsgWinLogDownCursorOffset` | Up/down caret icons y-axis | 58 | General |  | UIS r100 |
| 99 | NPC Dialog | `NobuMessageSelectOffsetY` | Dialog & selection vertical spacing | 14 | General |  | UIS r101 |
| 100 | NPC Dialog | `NobuMessageSelectLF` | Selection vertical spacing | -8 | General |  | UIS r102 |
| 101 | Overlay Map | `TrackMapColorR` | Overlay map red value | 42 | Battle/Field |  | UIS r103 |
| 102 | Overlay Map | `TrackMapColorG` | Overlay map green value | 42 | Battle/Field |  | UIS r104 |
| 103 | Overlay Map | `TrackMapColorB` | Overlay map blue value | 35 | Battle/Field |  | UIS r105 |
| 104 | Overlay Map | `TrackMapColorA` | Overlay map alpha value | 88 | Battle/Field |  | UIS r106 |
| 105 | Overlay Map | `TrackMapScale` | Overlay map scale | 200 | Battle/Field |  | UIS r107 |
| 106 | Overlay Map | `TrackMapIconScale` | Overlay map icon scale | 80 | Battle/Field |  | UIS r108 |
| 107 | Zone Map | `BaseMapJumpIconScale` | Zone change arrow icons scale | 250 | Menu |  | UIS r109 |
| 108 | x | `?` | x | 300 | Unused |  | UIS r110 |
| 109 | Combat Log | `?` | Combat log y-axis | 30 | Battle/Field |  | UIS r111 |
| 110 | Help Text | `HelpMessageMoveY` | Help text y-axis position (when boss HP bar is visible) | 16 | Battle/Field |  | UIS r112 |
| 111 | Combat Log | `ActiveLogMoveY` | Combat Log y-axis position (when boss HP bar is visible) | 18 | Battle/Field |  | UIS r113 |
| 112 | Target Info | `TargetInfoMoveY` | Target Info y-axis position (when boss HP bar is visible) | 24 | Battle/Field |  | UIS r114 |
| 113 | Combat Log | `ActiveLogDispHelpMoveY` | Combat Log y-axis position (when battle menu is open) | 55 | Battle/Field |  | UIS r115 |
| 114 | Combat Log | `ActiveLogMessageOffsetX` | Combat Log content x-axis | 126 | Battle/Field |  | UIS r116 |
| 115 | x | `ActionListMistLineOffset` | x | 23 | Unused |  | UIS r117 |
| 116 | x | `ActionListMistTableOffset` | x | -8 | Unused |  | UIS r118 |
| 117 | x | `ActionListMistTableOffset` | x | 39 | Unused |  | UIS r119 |
| 118 | Equip - Character Info | `StatusAloneTopX` | Character status info container x-axis (when list is open) | 670 | Menu |  | UIS r120 |
| 119 | Equip - Character Info | `StatusAloneTopY` | Character status info container y-axis (when list is open) | 116 | Menu |  | UIS r121 |
| 120 | Status/Equip - Character Info | `StatusAloneBottomX` | Character status info container x-axis | 670 | Menu |  | UIS r122 |
| 121 | Status/Equip - Character Info | `StatusAloneBottomY` | Character status info container y-axis | 286 | Menu |  | UIS r123 |
| 122 | Floating HUD | `NAOverHeadTextOffsetY` | NPC/object overhead name y-axis | 3 | Battle/Field |  | UIS r124 |
| 123 | Floating HUD | `HpGaugeEnmeyMin_R` | Enemy overhead hp bar left-side red value | 127 | Battle/Field |  | UIS r125 |
| 124 | Floating HUD | `HpGaugeEnmeyMin_G` | Enemy overhead hp bar left-side green value | 81 | Battle/Field |  | UIS r126 |
| 125 | Floating HUD | `HpGaugeEnmeyMin_B` | Enemy overhead hp bar left-side blue value | 16 | Battle/Field |  | UIS r127 |
| 126 | Floating HUD | `HpGaugeEnmeyMin_A` | Enemy overhead hp bar left-side alpha value | 127 | Battle/Field |  | UIS r128 |
| 127 | Floating HUD | `HpGaugeEnmeyMax_R` | Enemy overhead hp bar right-side red value | 127 | Battle/Field |  | UIS r129 |
| 128 | Floating HUD | `HpGaugeEnmeyMax_G` | Enemy overhead hp bar right-side green value | 5 | Battle/Field |  | UIS r130 |
| 129 | Floating HUD | `HpGaugeEnmeyMax_B` | Enemy overhead hp bar right-side blue value | 45 | Battle/Field |  | UIS r131 |
| 130 | Floating HUD | `HpGaugeEnmeyMax_A` | Enemy overhead hp bar right-side alpha value | 127 | Battle/Field |  | UIS r132 |
| 131 | Floating HUD | `HpGaugeSideMin_R` | Party overhead hp bar left-side red value | 57 | Battle/Field |  | UIS r133 |
| 132 | Floating HUD | `HpGaugeSideMin_G` | Party overhead hp bar left-side green value | 127 | Battle/Field |  | UIS r134 |
| 133 | Floating HUD | `HpGaugeSideMin_B` | Party overhead hp bar left-side blue value | 85 | Battle/Field |  | UIS r135 |
| 134 | Floating HUD | `HpGaugeSideMin_A` | Party overhead hp bar left-side alpha value | 127 | Battle/Field |  | UIS r136 |
| 135 | Floating HUD | `HpGaugeSideMax_R` | Party overhead hp bar right-side red value | 57 | Battle/Field |  | UIS r137 |
| 136 | Floating HUD | `HpGaugeSideMax_G` | Party overhead hp bar right-side green value | 80 | Battle/Field |  | UIS r138 |
| 137 | Floating HUD | `HpGaugeSideMax_B` | Party overhead hp bar right-side blue value | 127 | Battle/Field |  | UIS r139 |
| 138 | Floating HUD | `HpGaugeSideMax_A` | Party overhead hp bar right-side alpha value | 127 | Battle/Field |  | UIS r140 |
| 139 | Floating HUD | `HpGaugeOtherMin_R` | Ally overhead hp bar left-side red value | 126 | Battle/Field |  | UIS r141 |
| 140 | Floating HUD | `HpGaugeOtherMin_G` | Ally overhead hp bar left-side green value | 127 | Battle/Field |  | UIS r142 |
| 141 | Floating HUD | `HpGaugeOtherMin_B` | Ally overhead hp bar left-side blue value | 16 | Battle/Field |  | UIS r143 |
| 142 | Floating HUD | `HpGaugeOtherMin_A` | Ally overhead hp bar left-side alpha value | 127 | Battle/Field |  | UIS r144 |
| 143 | Floating HUD | `HpGaugeOtherMax_R` | Ally overhead hp bar right-side red value | 86 | Battle/Field |  | UIS r145 |
| 144 | Floating HUD | `HpGaugeOtherMax_G` | Ally overhead hp bar right-side green value | 121 | Battle/Field |  | UIS r146 |
| 145 | Floating HUD | `HpGaugeOtherMax_B` | Ally overhead hp bar right-side blue value | 0 | Battle/Field |  | UIS r147 |
| 146 | Floating HUD | `HpGaugeOtherMax_A` | Ally overhead hp bar right-side alpha value | 127 | Battle/Field |  | UIS r148 |
| 147 | Floating HUD | `OverHeadFieldSignOffsetY` | Overhead interaction info y-axis | -23 | Battle/Field |  | UIS r149 |
| 148 | Floating HUD | `OverHeadStatusNumXSpace` | Overhead status countdown digits horizontal spacing | 32 | Battle/Field |  | UIS r150 |
| 149 | Floating HUD | `OverHeadStatusOffsetY` | Overhead status countdown digits y-axis | 5 | Battle/Field |  | UIS r151 |
| 150 | Menu Lists | `MenuListNewOffsetX` | " ! " icon x-axis | 4 | Menu |  | UIS r152 |
| 151 | Menu Lists | `MenuListNewOffsetY` | " ! " icon y-axis | 14 | Menu |  | UIS r153 |
| 152 | Menu Lists | `MenuListMarkOffsetX` | Yellow circle (currently active) icon/animation x-axis | 12 | Menu |  | UIS r154 |
| 153 | Shop Menu | `MenuListWindowWidth` | Menu list container width | 512 | General |  | UIS r155 |
| 154 | Gambits | `SilhouetteWidth` | Character background illustration scale | 640 | Menu | Runtime error if value is an unsupported dimension | UIS r156 |
| 155 | Gambits | `SilhouettePosY` | Character background illustration y-axis | 94 | Menu |  | UIS r157 |
| 156 | Inventory Lists | `ScrollMarkOffsetX` | Yellow circle (currently active) icon/animation x-axis | 14 | Menu | Visible when sort menu is open | UIS r158 |
| 157 | x | `ScrollUpCursorOffsetY` | x | 6 | Unused |  | UIS r159 |
| 158 | x | `ScrollDownCursorOffsetY` | x | 6 | Unused |  | UIS r160 |
| 159 | Lists | `ScrollBarOffsetPosX` | Scroll bar x-axis | 11 | General |  | UIS r161 |
| 160 | Lists | `ScrollTableFadeHeight` | Top/bottom alpha gradient fade height | 13 | General |  | UIS r162 |
| 161 | License Board Preview | `AutoWindowFontOffsetY` | "VIEW MODE" text y-axis | 3 | Menu |  | UIS r163 |
| 162 | Battle Menu | `FontItalicVal` | Header text italic strength | 0.2700000107 | Battle/Field |  | UIS r164 |
| 163 | Battle Menu | `FontItalicScale` | Header text scale | 0.8799999952 | Battle/Field |  | UIS r165 |
| 164 | World Map | `WorldMapWidth` | World map x-axis | 2048 | Menu |  | UIS r166 |
| 165 | World Map | `WorldMapHeight` | World map y-axis | 1280 | Menu |  | UIS r167 |
| 166 | World Map | `WorldMapCursorOffsetX` | Right-pointing hand cursor x-axis | -16 | Menu |  | UIS r168 |
| 167 | World Map | `WorldMapCursorOffsetY` | Right-pointing hand cursor y-axis | -8 | Menu |  | UIS r169 |
| 168 | World Map | `RegionTextPosX` | "REGION" text x-axis | 86 | Menu |  | UIS r170 |
| 169 | World Map | `RegionTextPosY` | "REGION" text y-axis | 942 | Menu |  | UIS r171 |
| 170 | World Map | `MapNameOffsetY` | Region name y-axis | 965 | Menu |  | UIS r172 |
| 171 | World Map | `WorldMapVRUpperWidth` | World map layer 1 scale | 2048 | Menu |  | UIS r173 |
| 172 | World Map | `WorldMapVRUpperHeight` | World map layer 2 scale | 2048 | Menu |  | UIS r174 |
| 173 | License Board Selection | `LicenseBoardBallLength` | Character & Jobs icons/text position | 333 | Menu | Elements move outward from centre | UIS r175 |
| 174 | License Board Selection | `LicenseBoardFaceLength` | Character icon spacing from job icons | 98 | Menu | Elements move outward from job icons | UIS r176 |
| 175 | License Board Selection | `LicenseBoardBallEffectOffsetY` | Selection ring y-axis | 166 | Menu |  | UIS r177 |
| 176 | License Board Selection | `LicenseBoardBallNameOffsetY` | Job titles x-axis | 68 | Menu |  | UIS r178 |
| 177 | x | `LicenseBoardBallFaceSecondOffsetY` | x | 50 | Unused |  | UIS r179 |
| 178 | License Board Selection | `LicenseBoardNameNoSelectSize` | Unselected job titles scale | 90 | Menu |  | UIS r180 |
| 179 | World Map | `WorldMapLineScale` | Zone connecting lines scale | 16 | Menu |  | UIS r181 |
| 180 | Inventory | `ItemSortWindowOffsetX` | Sort message box x-axis | 138 | Menu |  | UIS r182 |
| 181 | Inventory | `ItemSortWindowOffsetY` | Sort message box y-axis | 38 | Menu |  | UIS r183 |
| 182 | Gambits | `GambitIconOffsetX` | Target/action list tabs selection icon x-axis | 26 | Menu |  | UIS r184 |
| 183 | Gambits | `GambitIconOffsetY` | Target/action list tabs selection icon y-axis | 6 | Menu |  | UIS r185 |
| 184 | Gambits | `GambitTargetListMoveX` | Gambit slots x-axis positon when target list is open | 242 | Menu |  | UIS r186 |
| 185 | Gambits | `GambitActionListMoveX` | Gambit slots x-axis positon when action list is open | 196 | Menu |  | UIS r187 |
| 186 | Gambits Tutorial | `GambitTutorialActionOffsetX` | Action list selection box x-axis | -2 | Menu |  | UIS r188 |
| 187 | Gambits Tutorial | `GambitTutorialActionOffsetY` | Action list selection box y-axis | -8 | Menu |  | UIS r189 |
| 188 | Gambits Tutorial | `GambitTutorialActionWidth` | Action list selection box width | 150 | Menu |  | UIS r190 |
| 189 | Gambits Tutorial | `GambitTutorialTargetOffsetX` | Target list selection box x-axis | -14 | Menu |  | UIS r191 |
| 190 | Gambits Tutorial | `GambitTutorialTargetOffsetY` | Target list selection box y-axis | -8 | Menu |  | UIS r192 |
| 191 | Gambits Tutorial | `GambitTutorialTargetWidth` | Target list selection box width | 200 | Menu |  | UIS r193 |
| 192 | Gambits Tutorial | `GambitTutorialChipHeight` | Action/target list selection box height | 10 | Menu |  | UIS r194 |
| 193 | Gambits Tutorial | `GambitTutorialRectWindow_XOffset` | Gambit slot selection box x-axis/width | 24 | Menu | Attribute changes depending on active selection box | UIS r195 |
| 194 | Gambits Tutorial | `GambitTutorialRectWindow_YOffset` | Gambit slot selection box y-axis/height | 16 | Menu | Attribute changes depending on active selection box | UIS r196 |
| 195 | Gambits Tutorial | `GambitTutorialAction_ExtraWidth` | Selection box additive width | 80 | Menu | Additional width applied to all selection boxes | UIS r197 |
| 196 | Pause Screen | `mPauseMenuOffsetX` | Options list x-axis | 57 | Menu |  | UIS r198 |
| 197 | Battle menu | `mBtlCommandScrollTableOffsetY` | Action list y-axis | 0 | Battle/Field |  | UIS r199 |
| 198 | x | `BattleMistCount0Offset` | x | 0 | Unused |  | UIS r200 |
| 199 | Floating HUD | `ExpLpPositionOffsetY` | Enemy overhead Exp/LP info y-axis | 0 | Battle/Field |  | UIS r201 |
| 200 | x | `NumEffectOffsetY1` | x | 30 | Unused | Might be unused and digit merged with NumEffectOffsetY2 | UIS r202 |
| 201 | Floating HUD | `NumEffectOffsetY2` | Hits digits y-axis | -10 | Battle/Field | Includes both digit 1 and digit 2 | UIS r203 |
| 202 | x | `mNumEffectOffsetY` | x | 0 | Unused |  | UIS r204 |
| 203 | Floating HUD | `ExpNumOffsetX` | Enemy overhead Exp digits x-axis | 0 | Battle/Field |  | UIS r205 |
| 204 | Floating HUD | `LpNumOffsetX` | Enemy overhead Lp digits x-axis | 0 | Battle/Field |  | UIS r206 |
| 205 | x | `EXPLPNumOffsetX` | x | 0 | Unused | Counterpart to EXPLPNumOffsetY but value resets to 0 | UIS r207 |
| 206 | Cutscenes | `MaskGradationHeight` | Bottom horizontal black bar gradient strength | 0 | General |  | UIS r208 |
| 207 | Inventory | `NgSignalOffsetBaseX` | Button icon & "Sort" text x-axis | 86 | Menu | Party menu needs to be closed to update value | UIS r209 |
| 208 | NPC Dialog | `TalkingMessageOffsetX` | Dialog container x-axis | 32 | General |  | UIS r210 |
| 209 | NPC Dialog | `TalkingMessageOffsetY` | Dialog container y-axis | 0 | General |  | UIS r211 |
| 210 | NPC Dialog | `MsgWinCaptionBaseOffsetX` | Talk icon & NPC name x-axis | 10 | General |  | UIS r212 |
| 211 | NPC Dialog | `MsgWinCaptionBaseOffsetY` | Talk icon & NPC name y-axis | 2 | General |  | UIS r213 |
| 212 | Message Box | `SystemWindowCaptionOffsetX` | Title x-axis | -20 | General |  | UIS r214 |
| 213 | Message Box | `SystemWindowCaptionOffsetY` | Title y-axis | 9 | General |  | UIS r215 |
| 214 | NPC Dialog - Log | `MsgWinLogUpCursorOffset` | Up/down caret icon vertical spacing | 10 | General |  | UIS r216 |
| 215 | NPC Dialog - Log | `MessageLineChangeOffset` | Text lines vertical spacing | -9 | General | Applies to tutorial box and maybe other message boxes | UIS r217 |
| 216 | Overlay Map | `ExtraTrackMapJumpIconOffsetX` | Zone change arrow icons x-axis | 0 | Battle/Field |  | UIS r218 |
| 217 | Overlay Map | `ExtraTrackMapJumpIconOffsetY` | Zone change arrow icons y-axis | 0 | Battle/Field |  | UIS r219 |
| 218 | Zone Map | `ExtraLocaMapJumpIconOffsetX` | Zone change arrow icons x-axis | 0 | Menu |  | UIS r220 |
| 219 | Zone Map | `ExtraLocaMapJumpIconOffsetY` | Zone change arrow icons y-axis | 0 | Menu |  | UIS r221 |
| 220 | Floating HUD | `OverHeadStatusOffsetX` | Overhead status countdown digits x-axis | 0 | Battle/Field |  | UIS r222 |
| 221 | Menu Lists | `MenuListMarkOffsetY` | Yellow circle (currently active) icon/animation y-axis | 8 | Menu |  | UIS r223 |
| 222 | Menu Lists | `MenuListWindowHeightModifer` | Yellow circle (currently active) icon/animation additive y-axis | 12 | Menu |  | UIS r224 |
| 223 | Gambits | `SilhouettePosX` | Character background illustration x-axis | 0 | Menu |  | UIS r225 |
| 224 | Inventory Lists | `ScrollMarkOffsetY` | Yellow circle (currently active) icon/animation y-axis | 8 | Menu | Visible when sort menu is open | UIS r226 |
| 225 | License Board/Hunts/Map | `NaSPArtSignalOffsetX` | Button icons & "Toggle Zoom"/"View Hunt Map" text x-axis | 86 | Menu |  | UIS r227 |
| 226 | License Board/Hunts/Map | `NaSPArtSignalOffsetY` | Button icons & "Toggle Zoom"/"View Hunt Map" text y-axis | 60 | Menu |  | UIS r228 |
| 227 | Licenses Board Preview | `AutoWindowFontOffsetX` | "VIEW MODE" text x-axis | 0 | Menu |  | UIS r229 |
| 228 | World Map | `MapNameOffsetX` | Region name x-axis | 110 | Menu |  | UIS r230 |
| 229 | x | `ShopItemCursorOffsetX` | x | 25 | Unused |  | UIS r231 |

## Record layouts

### Record `hpGaugeSideColors` — 32 bytes (0x20), count: 1

*Where:* MEMORY: FFXII_TZA.exe module-relative address 0x01E0CEF8 (TZA Steam 1.0.4.0; the Lua Loader and Cheat Engine use these base-relative addresses). Verified: CharacterHealthbarColors writes R/G/B of the right end to 0x01E0CF08/0C/10 and of the left end to 0x01E0CEF8/FC/F00 and reads the vanilla values there (Drive CharacterHealthbarColors.lua:13, 71-81, 151-152; Drive CharacterHealthbarColorsConfig.lua:18-19).

| Offset | Size | Type | Name | Meaning (source) | Enum |
|---|---|---|---|---|---|
| 0x00 | 4 | u32 | `sideMinR` | left end red. Vanilla 57 (UIS r133). Address 0x01E0CEF8. Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). |  |
| 0x04 | 4 | u32 | `sideMinG` | left end green. Vanilla 127 (UIS r134). Address 0x01E0CEFC. Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). |  |
| 0x08 | 4 | u32 | `sideMinB` | left end blue. Vanilla 85 (UIS r135). Address 0x01E0CF00. Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). |  |
| 0x0C | 4 | u32 | `sideMinA` | left end alpha. Vanilla 127 (UIS r136). Address 0x01E0CF04. Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). |  |
| 0x10 | 4 | u32 | `sideMaxR` | right end red. Vanilla 57 (UIS r137). Address 0x01E0CF08. Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). |  |
| 0x14 | 4 | u32 | `sideMaxG` | right end green. Vanilla 80 (UIS r138). Address 0x01E0CF0C. Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). |  |
| 0x18 | 4 | u32 | `sideMaxB` | right end blue. Vanilla 127 (UIS r139). Address 0x01E0CF10. Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). |  |
| 0x1C | 4 | u32 | `sideMaxA` | right end alpha. Vanilla 127 (UIS r140). Address 0x01E0CF14. Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). |  |

### Record `hpGaugeColorsInferred` — 96 bytes (0x60), count: 1

*Where:* MEMORY: inferred block at 0x01E0CED8 = 0x01E0CEF8 - 0x20. Assumes the 24 HpGauge settings are consecutive u32 globals in the sheet's order (Enemy, Side, Other; UIS r125-r148). Only the Side part (offsets 0x20-0x3F) is verified.

| Offset | Size | Type | Name | Meaning (source) | Enum |
|---|---|---|---|---|---|
| 0x00 | 4 | u32 | `enemyMinR` | left end red. Vanilla 127 (UIS r125). Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). Address inferred, see record notes. |  |
| 0x04 | 4 | u32 | `enemyMinG` | left end green. Vanilla 81 (UIS r126). Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). Address inferred, see record notes. |  |
| 0x08 | 4 | u32 | `enemyMinB` | left end blue. Vanilla 16 (UIS r127). Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). Address inferred, see record notes. |  |
| 0x0C | 4 | u32 | `enemyMinA` | left end alpha. Vanilla 127 (UIS r128). Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). Address inferred, see record notes. |  |
| 0x10 | 4 | u32 | `enemyMaxR` | right end red. Vanilla 127 (UIS r129). Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). Address inferred, see record notes. |  |
| 0x14 | 4 | u32 | `enemyMaxG` | right end green. Vanilla 5 (UIS r130). Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). Address inferred, see record notes. |  |
| 0x18 | 4 | u32 | `enemyMaxB` | right end blue. Vanilla 45 (UIS r131). Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). Address inferred, see record notes. |  |
| 0x1C | 4 | u32 | `enemyMaxA` | right end alpha. Vanilla 127 (UIS r132). Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). Address inferred, see record notes. |  |
| 0x20 | 4 | u32 | `sideMinR` | left end red. Vanilla 57 (UIS r133). Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). |  |
| 0x24 | 4 | u32 | `sideMinG` | left end green. Vanilla 127 (UIS r134). Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). |  |
| 0x28 | 4 | u32 | `sideMinB` | left end blue. Vanilla 85 (UIS r135). Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). |  |
| 0x2C | 4 | u32 | `sideMinA` | left end alpha. Vanilla 127 (UIS r136). Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). |  |
| 0x30 | 4 | u32 | `sideMaxR` | right end red. Vanilla 57 (UIS r137). Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). |  |
| 0x34 | 4 | u32 | `sideMaxG` | right end green. Vanilla 80 (UIS r138). Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). |  |
| 0x38 | 4 | u32 | `sideMaxB` | right end blue. Vanilla 127 (UIS r139). Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). |  |
| 0x3C | 4 | u32 | `sideMaxA` | right end alpha. Vanilla 127 (UIS r140). Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). |  |
| 0x40 | 4 | u32 | `otherMinR` | left end red. Vanilla 126 (UIS r141). Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). Address inferred, see record notes. |  |
| 0x44 | 4 | u32 | `otherMinG` | left end green. Vanilla 127 (UIS r142). Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). Address inferred, see record notes. |  |
| 0x48 | 4 | u32 | `otherMinB` | left end blue. Vanilla 16 (UIS r143). Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). Address inferred, see record notes. |  |
| 0x4C | 4 | u32 | `otherMinA` | left end alpha. Vanilla 127 (UIS r144). Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). Address inferred, see record notes. |  |
| 0x50 | 4 | u32 | `otherMaxR` | right end red. Vanilla 86 (UIS r145). Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). Address inferred, see record notes. |  |
| 0x54 | 4 | u32 | `otherMaxG` | right end green. Vanilla 121 (UIS r146). Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). Address inferred, see record notes. |  |
| 0x58 | 4 | u32 | `otherMaxB` | right end blue. Vanilla 0 (UIS r147). Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). Address inferred, see record notes. |  |
| 0x5C | 4 | u32 | `otherMaxA` | right end alpha. Vanilla 127 (UIS r148). Range 0-127 (Drive CharacterHealthbarColors.lua:144-146, 201-209). Address inferred, see record notes. |  |

## Enums carried in the JSON spec

| Enum | Keys | Use |
|---|---|---|
| `UiSetting` | sheet index 0-229 | setting (variable) name |
| `UiSettingScreen`, `UiSettingDescription`, `UiSettingNotes` | index | where it shows / what it moves / side effects |
| `UiSettingVanillaValue` | index | vanilla value, for reset |
| `UiSettingCategory` | index | Unused / General / Menu / Battle-Field |
| `HpGaugeType` | 0-2 | ecx argument of the gauge colour function |

## Round-trip rules

- Edits are live memory writes; they take effect on the next redraw of the affected element (TK L1459) and some only after a zone change or menu re-open (UIS notes column).
- Gauge colour components are u32 values 0-127; writing 128-255 overflows the engine range (Drive CharacterHealthbarColors.lua:201-209).
- Restore the vanilla value (UiSettingVanillaValue) when a mod is disabled; the values are not saved anywhere by the game.
- Some settings crash the game with unsupported values (ListItemIconW/H, SilhouetteWidth: "Runtime error if value is an unsupported dimension"; mGeneralFrameFrontOffset expects -64..63).

## Known unknowns

- Addresses of all settings except the HpGaugeSide block are not in the sources (the Toolkit table has them, TK L1459).
- Data type of each setting is not documented; integers are assumed to be s32, FontItalicVal and FontItalicScale are f32 (UIS r164-r165 hold 0.27 and 0.88).
- Whether the globals are initialised from the executable's data section or from a data file (so that a file patch could change them permanently) is unknown.
- Four rows are named "?" (UIS r93, r94, r110, r111) and ActionListMistTableOffset appears twice (UIS r118-r119).
- The Toolkit shows 257 rows; the sheet documents 230. The order of the remaining 27 is unknown.
- Wayfarer.lua uses another UI global at 0x01E0C580 ("lineHeight", written to 48 for prompt spacing; Drive Wayfarer.lua:20, 325-326); its sheet name is not identified.
