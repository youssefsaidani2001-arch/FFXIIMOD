/* Battlepack editor module: battle_pack.bin (71 sections, nested 15-section pack in section 61). */
(function (root) {
  const FX = root.FX;
  const { Battlepack, luaPatch, zipStore } = root.BPCore;
  const L = () => FX.lists;
  const ROW_LABEL = { 0: 'BpWeaponStanceList', 5: 'BpEquipmentCategoryList', 7: 'BpGambitList', 11: 'BpMagickCategoryList', 12: 'BpLicenseList', 13: 'BpEquipmentList', 14: 'BpActionList', 15: 'BpStatusEffectList', 16: 'PartyMemberList', 18: 'BpItemList', 26: 'BpMistList', 28: 'BpPriceList', 29: 'BpMagickList', 30: 'BpTechnickList', 31: 'BpConcurrenceList', 32: 'BpLootList', 33: 'BpMapList', 34: 'BpTeleportLocationList', 35: 'BpKeyItemList', 37: 'BpPackageList', 38: 'BpRewardList', 39: 'BpShopList', 41: 'BpElementList', 57: 'BpBazaarGoodList', 58: 'BpAugmentList', 60: 'BpStoryPointAdditionList' };
  const LIST_RULES = [
    [/^name$/, { 13: 'BpEquipmentList', 14: 'BpActionList', 16: 'CharacterNameList', 12: 'BpLicenseList', 15: 'BpStatusEffectList' }],
    [/battleMenuDescription/, 'MenuBattleActionList'],
    [/inventoryMenuDescription/, 'MenuInventoryActionList'],
    [/^formula$/, 'BpeFormulaList'],
    [/castAnimation|mistCastAnimation/, 'BpeCastAnimationList'],
    [/^characterAnimation$/, 'BpeCharacterAnimationList'],
    [/chargeAuraAnimation/, 'BpeChargeAuraAnimationList'],
    [/summonedPartyMember|^partyMember|\.member$/, 'PartyMemberList'],
    [/^category$/, { 14: 'BpCategoryList', 13: 'BpEquipmentCategoryList' }],
    [/requiredContent|\.content$/, 'ContAllList'],
    [/enableBattleMemoryFlag/, 'BpeBattleMemoryFlagList'],
    [/^model$/, 'ModelList'],
    [/^equipment\.(weapon|offhand|helm|armor|accessory)$/, 'BpEquipmentList'],
    [/^icon$/, 'BpeIconList'],
    [/^augment$/i, 'BpAugmentList'],
    [/^license$/i, 'BpLicenseList'],
    [/gambitSetIdentifier|^gambit$/i, 'BpGambitList'],
    [/^item$/i, 'BpItemList'], [/^loot$/i, 'BpLootList'], [/keyItem$/i, 'BpKeyItemList'], [/^package$/i, 'BpPackageList'], [/^reward$/i, 'BpRewardList'],
    [/^price$/i, 'BpPriceList'], [/^mist$|mistAction/i, 'BpMistList'], [/^map$/i, 'BpMapList'], [/teleportLocation/i, 'BpTeleportLocationList'],
    [/^stance$|weaponStance/i, 'BpWeaponStanceList'], [/concurrence/i, 'BpConcurrenceList'], [/storyPoint/i, 'BpStoryPointAdditionList'],
    [/bazaar/i, 'BpBazaarGoodList'], [/^technick$/i, 'BpTechnickList'], [/^magick$/i, 'BpMagickList'], [/magicksCategory/i, 'BpMagickCategoryList'],
    [/^element$/i, 'BpElementList'], [/^statusEffect$|^status$/i, 'BpStatusEffectList'], [/^job$/i, 'JobList'], [/^genus$/i, 'GenusList'], [/classification$/i, 'ClassificationList'],
    [/particleEffect/i, 'BpeWeaponParticleEffectList'], [/distanceBehavior/i, 'BpeWeaponDistanceBehaviorList'], [/^shop$/i, 'BpShopList'], [/^action$|^action\d$/i, 'BpActionList'],
    [/quickening\d/i, 'BpMistList'],
  ];
  const INT_TYPES = new Set(['u8', 's8', 'u16', 's16', 'u32', 's32']);

  function sectionName(id) {
    const s = String(id);
    if (s.includes('.')) return 'Section ' + s;
    const n = L().BpSectionList || {};
    return n[s] || 'Section ' + s;
  }

  /** Decorate a BPCore.Battlepack with the suite's doc interface. */
  function wrap(bp, fileName) {
    bp.editorId = 'battlepack';
    bp.fileName = fileName;
    bp.sectionLabel = sec => sec.nested ? sectionName(sec.id) + ' (nested pack)' : sectionName(sec.id);
    bp.notes = sec => (bp.schema[sec.id] && bp.schema[sec.id].notes) || '';
    bp.listFor = (sec, f) => {
      if (f.enum && FX.lists[f.enum]) return FX.lists[f.enum];
      if (!INT_TYPES.has(f.type) && !(f.bitLength && f.bitLength > 1)) return null;
      const path = f.parent ? f.parent + '.' + f.name : f.name;
      for (const [re, target] of LIST_RULES) {
        if (re.test(path) || re.test(f.name)) {
          const name = typeof target === 'string' ? target : target[sec.id];
          if (name && FX.lists[name]) return FX.lists[name];
        }
      }
      return null;
    };
    bp.rowLabel = (sec, row) => {
      const ln = ROW_LABEL[sec.id];
      if (ln && FX.lists[ln] && FX.lists[ln][row] != null) return FX.lists[ln][row];
      const nf = (sec.fields || []).find(f => f.name === 'name' && !f.parent);
      if (nf) { const l = bp.listFor(sec, nf); const v = bp.get(sec, row, nf); if (l && l[v] != null) return l[v]; return 'name ' + v; }
      return '';
    };
    bp.exports = () => {
      const ch = bp.changes();
      const binName = bp.mode === 'section' ? (fileName || 'section.bin') : 'battle_pack.bin';
      return [
        { id: 'lua-copy', label: 'Copy Lua patch', copy: () => luaPatch(bp.changes(), { file: fileName }), title: 'Lua Loader script that patches the live battlepack' },
        { id: 'json', label: 'Save changes.json', filename: 'changes.json', build: () => JSON.stringify(bp.changes(), null, 1) },
        { id: 'lua', label: 'Save Lua patch', filename: 'BattlepackPatch.lua', build: () => luaPatch(bp.changes(), { file: fileName }) },
        { id: 'bin', label: 'Save ' + binName, filename: binName, build: () => bp.u8.slice(0), primary: true },
        { id: 'zip', label: 'Save all (.zip)', filename: 'battlepack_workbench.zip', build: () => zipStore([{ name: binName, data: bp.u8.slice(0) }, { name: 'BattlepackPatch.lua', data: luaPatch(ch, { file: fileName }) }, { name: 'changes.json', data: JSON.stringify(ch, null, 1) }]) },
      ];
    };
    bp.canLoadChanges = true;
    return bp;
  }

  function sample() {
    const align16 = n => (n + 15) & ~15;
    const st2e = (count, size, fill) => { const b = new Uint8Array(0x20 + count * size); b.set([0x73, 0x74, 0x32, 0x65]); const dv = new DataView(b.buffer); dv.setUint32(4, count, true); dv.setUint16(8, size, true); dv.setUint32(0xC, 0x20, true); for (let i = 0; i < count * size; i++) b[0x20 + i] = fill(Math.floor(i / size), i % size); return b; };
    const pack = (n, secs) => { let pos = align16(4 + (n + 1) * 4); const offs = []; for (let i = 0; i < n; i++) { pos = align16(pos); offs.push(pos); pos += secs[i] ? secs[i].length : 0; } offs.push(pos); const out = new Uint8Array(align16(pos)); const dv = new DataView(out.buffer); dv.setUint32(0, n, true); offs.forEach((o, i) => dv.setUint32(4 + i * 4, o, true)); for (let i = 0; i < n; i++) if (secs[i]) out.set(secs[i], offs[i]); return out; };
    const secs = {};
    secs[13] = st2e(557, 0x30, (r, o) => o === 2 ? r & 0xFF : o === 3 ? r >> 8 : (r * 7 + o) & 0x3F);
    secs[14] = st2e(544, 0x3C, (r, o) => o === 0x34 ? r & 0xFF : o === 0x35 ? r >> 8 : o === 0x08 ? (r % 20) : o === 0x0A ? (r % 40) : o === 0x1E ? (r % 4) : 0);
    secs[16] = st2e(40, 0x80, (r, o) => o === 0x2E ? 5 + r : o === 0x16 ? 100 : o === 0x1E ? 20 + r : 0);
    secs[15] = st2e(32, 0x10, (r, o) => (r * 3 + o) & 0xFF);
    secs[57] = st2e(128, 0x24, () => 0);
    secs[61] = pack(15, { 0: st2e(8, 0x10, (r, o) => o) });
    return { buf: pack(71, secs).buffer, name: 'sample battle_pack.bin (synthetic, not game data)' };
  }

  FX.registerEditor({
    id: 'battlepack', title: 'Battlepack', files: 'battle_pack.bin, exported section_XXX.bin',
    accept(name, u8) {
      if (/battle_pack/i.test(name)) return 10;
      const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
      if (u8.length > 300 && dv.getUint32(0, true) === 71) return 8;
      if (/section_\d{3}\.bin$/i.test(name) && String.fromCharCode(...u8.slice(0, 4)) === 'st2e') return 6;
      return 0;
    },
    open(buf, name, opts) {
      const u8 = new Uint8Array(buf);
      const single = String.fromCharCode(...u8.slice(0, 4)) === 'st2e';
      let sec = opts && opts.section;
      if (single && sec == null) { const m = /section_(\d{3})/i.exec(name); sec = m ? Number(m[1]) : ({ 0x3C: 14, 0x80: 16, 0x30: 13 }[new DataView(buf).getUint16(8, true)] ?? 14); }
      return wrap(new Battlepack(buf, FX.bpackSchema || {}, single ? { singleSection: sec } : {}), name);
    },
    sample,
  });
})(typeof window !== 'undefined' ? window : globalThis);
