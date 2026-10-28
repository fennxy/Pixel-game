import React, { useState } from 'react';
import { PlayerCustomization } from '../types/game';
import { X, User, Sparkles, Check } from 'lucide-react';
import { sound } from '../utils/audio';

interface CharacterCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  customization: PlayerCustomization;
  onSaveCustomization: (custom: PlayerCustomization) => void;
  playerName: string;
  onChangePlayerName: (name: string) => void;
}

export const CharacterCreatorModal: React.FC<CharacterCreatorModalProps> = ({
  isOpen,
  onClose,
  customization,
  onSaveCustomization,
  playerName,
  onChangePlayerName,
}) => {
  const [current, setCurrent] = useState<PlayerCustomization>(customization);
  const [name, setName] = useState(playerName);

  if (!isOpen) return null;

  const hairColors = [
    { label: 'Cokelat Kayu', val: '#78350f' },
    { label: 'Hitam Pekat', val: '#0f172a' },
    { label: 'Pirang Emas', val: '#eab308' },
    { label: 'Merah Bara', val: '#dc2626' },
    { label: 'Biru Es', val: '#0284c7' },
  ];

  const skinColors = [
    { label: 'Sawo Matang', val: '#d97706' },
    { label: 'Kuning Langsat', val: '#fcd34d' },
    { label: 'Cerah Alami', val: '#fed7aa' },
    { label: 'Cokelat Gelap', val: '#92400e' },
  ];

  const outfitColors = [
    { label: 'Hijau Rimba', val: '#16a34a' },
    { label: 'Merah Pendekar', val: '#dc2626' },
    { label: 'Biru Ksatria', val: '#2563eb' },
    { label: 'Hitam Bayangan', val: '#1e293b' },
    { label: 'Emas Kerajaan', val: '#ca8a04' },
  ];

  const hats: { id: PlayerCustomization['hat']; name: string; icon: string }[] = [
    { id: 'none', name: 'Tanpa Topi', icon: '❌' },
    { id: 'topi_jerami', name: 'Topi Jerami Petani', icon: '👒' },
    { id: 'helm_ksatria', name: 'Helm Baja Ksatria', icon: '🪖' },
    { id: 'mahkota', name: 'Mahkota Emas', icon: '👑' },
  ];

  const auras: { id: PlayerCustomization['aura']; name: string; icon: string }[] = [
    { id: 'none', name: 'Tanpa Aura', icon: '⚪' },
    { id: 'api', name: 'Bara Api Merah', icon: '🔥' },
    { id: 'daun', name: 'Daun Alam Hijau', icon: '🍃' },
    { id: 'kristal', name: 'Kristal Es Biru', icon: '💎' },
    { id: 'emas', name: 'Bintang Emas Bersinar', icon: '✨' },
  ];

  const handleSave = () => {
    if (name.trim()) onChangePlayerName(name.trim());
    onSaveCustomization(current);
    sound.playLevelUp();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-pink-400" />
            <h2 className="font-bold text-slate-100 text-sm">Kustomisasi Karakter & Kosmetik</h2>
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

        {/* Live Preview Box */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-center gap-6">
          <div className="relative w-20 h-20 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden">
            {/* Halo Aura */}
            {current.aura !== 'none' && (
              <div
                className="absolute inset-2 rounded-full blur-sm opacity-60 animate-pulse"
                style={{
                  backgroundColor:
                    current.aura === 'api'
                      ? '#ef4444'
                      : current.aura === 'daun'
                      ? '#22c55e'
                      : current.aura === 'kristal'
                      ? '#38bdf8'
                      : '#facc15',
                }}
              />
            )}

            {/* Pixel Character Representation */}
            <div className="relative flex flex-col items-center">
              {/* Hat */}
              {current.hat === 'topi_jerami' && <div className="w-9 h-2 bg-amber-500 rounded-t" />}
              {current.hat === 'helm_ksatria' && <div className="w-8 h-3 bg-slate-500 rounded-t border-t border-red-500" />}
              {current.hat === 'mahkota' && <div className="w-7 h-2.5 bg-yellow-400 font-bold text-[8px] text-center">👑</div>}

              {/* Hair */}
              <div
                className="w-7 h-3 rounded-t-md"
                style={{ backgroundColor: current.hairColor }}
              />
              {/* Face */}
              <div
                className="w-6 h-5 flex items-center justify-around px-1"
                style={{ backgroundColor: current.skinColor }}
              >
                <div className="w-1 h-1 bg-slate-950 rounded-full" />
                <div className="w-1 h-1 bg-slate-950 rounded-full" />
              </div>
              {/* Body Outfit */}
              <div
                className="w-7 h-7 rounded-b-md"
                style={{ backgroundColor: current.outfitColor }}
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Nama Petualang:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-bold"
              maxLength={20}
            />
          </div>
        </div>

        {/* Options Selection */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3 text-xs">
          {/* Gender */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1.5">Gender Karakter:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setCurrent({ ...current, gender: 'pria' });
                  sound.playTone(400, 500, 'sine', 0.05);
                }}
                className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  current.gender === 'pria'
                    ? 'border-blue-400 bg-blue-950/40 text-blue-300'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400'
                }`}
              >
                <span>⚔️</span>
                <span>Pria (Pendekar)</span>
              </button>
              <button
                onClick={() => {
                  setCurrent({ ...current, gender: 'wanita' });
                  sound.playTone(400, 500, 'sine', 0.05);
                }}
                className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  current.gender === 'wanita'
                    ? 'border-pink-400 bg-pink-950/40 text-pink-300'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400'
                }`}
              >
                <span>🏹</span>
                <span>Wanita (Srikandi)</span>
              </button>
            </div>
          </div>

          {/* Hair Color */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1.5">Warna Rambut:</label>
            <div className="flex gap-2">
              {hairColors.map((hc) => (
                <button
                  key={hc.val}
                  onClick={() => {
                    setCurrent({ ...current, hairColor: hc.val });
                    sound.playTone(500, 600, 'sine', 0.04);
                  }}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                    current.hairColor === hc.val ? 'ring-2 ring-white scale-105' : 'border-slate-700'
                  }`}
                  style={{ backgroundColor: hc.val }}
                  title={hc.label}
                >
                  {current.hairColor === hc.val && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Skin Tone */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1.5">Warna Kulit:</label>
            <div className="flex gap-2">
              {skinColors.map((sk) => (
                <button
                  key={sk.val}
                  onClick={() => {
                    setCurrent({ ...current, skinColor: sk.val });
                    sound.playTone(500, 600, 'sine', 0.04);
                  }}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                    current.skinColor === sk.val ? 'ring-2 ring-white scale-105' : 'border-slate-700'
                  }`}
                  style={{ backgroundColor: sk.val }}
                  title={sk.label}
                >
                  {current.skinColor === sk.val && <Check className="w-4 h-4 text-slate-900" />}
                </button>
              ))}
            </div>
          </div>

          {/* Outfit Color */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1.5">Warna Pakaian Zirah:</label>
            <div className="flex gap-2">
              {outfitColors.map((oc) => (
                <button
                  key={oc.val}
                  onClick={() => {
                    setCurrent({ ...current, outfitColor: oc.val });
                    sound.playTone(500, 600, 'sine', 0.04);
                  }}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                    current.outfitColor === oc.val ? 'ring-2 ring-white scale-105' : 'border-slate-700'
                  }`}
                  style={{ backgroundColor: oc.val }}
                  title={oc.label}
                >
                  {current.outfitColor === oc.val && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Cosmetic Hat */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1.5">Aksesoris Topi / Helm:</label>
            <div className="grid grid-cols-2 gap-2">
              {hats.map((hat) => (
                <button
                  key={hat.id}
                  onClick={() => {
                    setCurrent({ ...current, hat: hat.id });
                    sound.playTone(500, 600, 'sine', 0.04);
                  }}
                  className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                    current.hat === hat.id
                      ? 'border-amber-400 bg-amber-950/30 text-amber-300'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400'
                  }`}
                >
                  <span className="text-xl">{hat.icon}</span>
                  <span className="font-semibold text-xs">{hat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cosmetic Aura */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1.5">Efek Aura Pendukung:</label>
            <div className="grid grid-cols-2 gap-2">
              {auras.map((aura) => (
                <button
                  key={aura.id}
                  onClick={() => {
                    setCurrent({ ...current, aura: aura.id });
                    sound.playTone(500, 600, 'sine', 0.04);
                  }}
                  className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                    current.aura === aura.id
                      ? 'border-purple-400 bg-purple-950/30 text-purple-300'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400'
                  }`}
                >
                  <span className="text-xl">{aura.icon}</span>
                  <span className="font-semibold text-xs">{aura.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full py-2.5 mt-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl active:scale-95 transition-all shadow-md"
          >
            Simpan Tampilan Karakter
          </button>
        </div>
      </div>
    </div>
  );
};
