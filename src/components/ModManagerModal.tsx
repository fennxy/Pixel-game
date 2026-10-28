import React, { useState } from 'react';
import { GameMod, ModItemDef, ModMobDef } from '../types/game';
import { X, Zap, Plus, Download, Upload, Check, Power, ShieldAlert } from 'lucide-react';
import { sound } from '../utils/audio';

interface ModManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mods: GameMod[];
  onToggleMod: (modId: string) => void;
  onCreateCustomMod: (mod: GameMod) => void;
  onImportModJson: (jsonStr: string) => void;
}

export const ModManagerModal: React.FC<ModManagerModalProps> = ({
  isOpen,
  onClose,
  mods,
  onToggleMod,
  onCreateCustomMod,
  onImportModJson,
}) => {
  const [tab, setTab] = useState<'installed' | 'creator' | 'import'>('installed');
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');

  // Mod Creator Form state
  const [modName, setModName] = useState('Mod Kustom Saya');
  const [modAuthor, setModAuthor] = useState('Modder Komunitas');
  const [modDesc, setModDesc] = useState('Mod tambahan monster dan senjata tajam.');
  const [customWeaponName, setCustomWeaponName] = useState('Pedang Naga Api');
  const [customWeaponDmg, setCustomWeaponDmg] = useState(40);
  const [customMobName, setCustomMobName] = useState('Naga Mini Merah');
  const [customMobHp, setCustomMobHp] = useState(120);
  const [customMobColor, setCustomMobColor] = useState('#ef4444');

  if (!isOpen) return null;

  const handleCreateMod = () => {
    const newMod: GameMod = {
      id: `custom_mod_${Date.now()}`,
      name: modName,
      author: modAuthor,
      version: '1.0.0',
      description: modDesc,
      enabled: true,
      customItems: [
        {
          id: `item_${Date.now()}`,
          name: customWeaponName,
          type: 'weapon',
          damage: customWeaponDmg,
          icon: '🗡️',
          sellPrice: 100,
        },
      ],
      customMobs: [
        {
          type: `mob_${Date.now()}`,
          name: customMobName,
          hp: customMobHp,
          damage: 15,
          color: customMobColor,
          aggressive: true,
        },
      ],
      customRecipes: [],
    };

    onCreateCustomMod(newMod);
    sound.playLevelUp();
    setTab('installed');
  };

  const handleImport = () => {
    setImportError('');
    try {
      onImportModJson(importJsonText);
      sound.playLevelUp();
      setTab('installed');
      setImportJsonText('');
    } catch {
      setImportError('Format JSON Mod tidak valid. Periksa kembali struktur data.');
    }
  };

  const handleExportMod = (mod: GameMod) => {
    const json = JSON.stringify(mod, null, 2);
    navigator.clipboard?.writeText(json);
    sound.playTone(600, 800, 'sine', 0.1);
    alert(`Mod "${mod.name}" berhasil disalin ke clipboard! Bagikan ke komunitas.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-rose-400" />
            <h2 className="font-bold text-slate-100 text-sm">Pusat Mod & Dukungan Komunitas</h2>
          </div>
          <button
            onClick={() => {
              sound.playTone(300, 150, 'sine', 0.08);
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/40 text-xs">
          <button
            onClick={() => setTab('installed')}
            className={`py-2.5 flex items-center justify-center gap-1 font-medium transition-colors ${
              tab === 'installed'
                ? 'border-b-2 border-rose-400 text-rose-300 bg-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Mod Terpasang</span>
          </button>
          <button
            onClick={() => setTab('creator')}
            className={`py-2.5 flex items-center justify-center gap-1 font-medium transition-colors ${
              tab === 'creator'
                ? 'border-b-2 border-amber-400 text-amber-300 bg-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Mod Baru</span>
          </button>
          <button
            onClick={() => setTab('import')}
            className={`py-2.5 flex items-center justify-center gap-1 font-medium transition-colors ${
              tab === 'import'
                ? 'border-b-2 border-blue-400 text-blue-300 bg-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Impor JSON</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
          {tab === 'installed' && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-400 leading-snug">
                Modifikasi permainan menambahkan monster kustom, senjata unik, dan resep baru secara instan tanpa perlu restart game.
              </p>

              {mods.map((mod) => (
                <div
                  key={mod.id}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                        {mod.name}
                        <span className="text-[10px] text-slate-400 font-mono">v{mod.version}</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{mod.description}</p>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        Karya: <strong className="text-slate-300">{mod.author}</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onToggleMod(mod.id);
                        sound.playTone(mod.enabled ? 300 : 600, 450, 'sine', 0.08);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                        mod.enabled
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{mod.enabled ? 'Aktif' : 'Mati'}</span>
                    </button>
                  </div>

                  {/* Mod components summary */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>🗡️ {mod.customItems.length} Item</span>
                      <span>👾 {mod.customMobs.length} Monster</span>
                    </div>

                    <button
                      onClick={() => handleExportMod(mod)}
                      className="text-amber-400 hover:underline flex items-center gap-1 text-[10px]"
                    >
                      <Download className="w-3 h-3" />
                      <span>Salin JSON</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'creator' && (
            <div className="flex flex-col gap-3 text-xs">
              <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-2.5 text-amber-300 text-[11px]">
                Buat modifikasi open-source untuk dibagikan ke komunitas petualang lainnya!
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nama Mod:</label>
                <input
                  type="text"
                  value={modName}
                  onChange={(e) => setModName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Pembuat (Author):</label>
                  <input
                    type="text"
                    value={modAuthor}
                    onChange={(e) => setModAuthor(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Senjata Kustom:</label>
                  <input
                    type="text"
                    value={customWeaponName}
                    onChange={(e) => setCustomWeaponName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Monster Kustom:</label>
                  <input
                    type="text"
                    value={customMobName}
                    onChange={(e) => setCustomMobName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Warna Monster:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customMobColor}
                      onChange={(e) => setCustomMobColor(e.target.value)}
                      className="w-9 h-8 bg-slate-800 border border-slate-700 rounded cursor-pointer"
                    />
                    <span className="font-mono text-slate-400">{customMobColor}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateMod}
                className="w-full py-2.5 mt-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Kompilasi & Pasang Mod Ke Game</span>
              </button>
            </div>
          )}

          {tab === 'import' && (
            <div className="flex flex-col gap-3 text-xs">
              <p className="text-slate-400 text-xs">
                Tempelkan kode JSON Mod yang kamu dapatkan dari teman atau komunitas untuk langsung memuat konten kustom.
              </p>

              <textarea
                rows={7}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='Tempelkan JSON Mod di sini (misal: {"name": "Mod Keren", ...})'
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 font-mono text-[11px] text-emerald-300 focus:outline-none focus:border-blue-400"
              />

              {importError && (
                <div className="flex items-center gap-1.5 text-rose-400 text-xs">
                  <ShieldAlert className="w-4 h-4" />
                  <span>{importError}</span>
                </div>
              )}

              <button
                disabled={!importJsonText.trim()}
                onClick={handleImport}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Impor & Pasang Mod</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
